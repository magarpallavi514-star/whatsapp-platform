import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import whatsappService from '../services/whatsappService.js';

/**
 * Conversation Controller
 * Manages inbox conversations
 */

/**
 * GET /api/conversations - Get inbox conversations
 */
export const getConversations = async (req, res) => {
  try {
    // ✅ FIXED: Use ObjectId directly (Conversation.accountId is ObjectId type)
    // This ensures consistent queries across all accounts
    const accountId = req.account._id;
    const { phoneNumberId, status, limit = 50 } = req.query;
    
    const query = { accountId };
    if (phoneNumberId) query.phoneNumberId = phoneNumberId;
    if (status) query.status = status;
    
    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/conversations/:conversationId/messages - Get conversation messages
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;
    
    // Get conversation details
    const conversation = await Conversation.findOne({ conversationId }).lean();
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Get messages for this conversation
    // CRITICAL: Get most recent messages first, then sort for display
    const allMessages = await Message.find({
      accountId: conversation.accountId,
      phoneNumberId: conversation.phoneNumberId,
      recipientPhone: conversation.userPhone
    })
      .sort({ createdAt: -1 }) // Get newest messages first
      .limit(parseInt(limit))
      .lean();
    
    // Reverse to show oldest-first for chat display
    const messages = allMessages.reverse();
    
    res.json({
      success: true,
      conversation,
      messages
    });
    
  } catch (error) {
    console.error('❌ Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/conversations/:conversationId/reply - Reply to conversation
 * 
 * CRITICAL: WhatsApp 24h session rule
 * - Text replies only allowed within 24h of last message from user
 * - Outside 24h window → MUST use template message
 */
export const replyToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageType, message, templateName, templateParams } = req.body;
    
    // Get conversation details
    const conversation = await Conversation.findOne({ conversationId }).lean();
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        error: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    let result;
    
    if (messageType === 'text') {
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'message is required for text type',
          error: 'MISSING_MESSAGE'
        });
      }
      
      // ✅ CRITICAL FIX: Check 24h session window
      // WhatsApp allows free-text replies ONLY within 24 hours of last message from user
      const now = new Date();
      const lastMessageTime = new Date(conversation.lastMessageAt);
      const timeDiffMs = now - lastMessageTime;
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
      
      if (timeDiffHours > 24) {
        return res.status(400).json({
          success: false,
          message: '24h session expired. Please send a template message to reopen chat.',
          error: 'SESSION_EXPIRED',
          sessionExpiredAt: lastMessageTime,
          timeSinceLastMessage: `${Math.round(timeDiffHours)} hours ago`,
          requiredAction: 'Use template message instead'
        });
      }
      
      result = await whatsappService.sendTextMessage(
        conversation.accountId,
        conversation.phoneNumberId,
        conversation.userPhone,
        message,
        { campaign: 'inbox_reply' }
      );
    } else if (messageType === 'template') {
      if (!templateName) {
        return res.status(400).json({
          success: false,
          message: 'templateName is required for template type'
        });
      }
      
      result = await whatsappService.sendTemplateMessage(
        conversation.accountId,
        conversation.phoneNumberId,
        conversation.userPhone,
        templateName,
        templateParams || [],
        { campaign: 'inbox_reply' }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid messageType. Must be "text" or "template"'
      });
    }
    
    // Update conversation
    await Conversation.updateOne(
      { conversationId },
      {
        $set: {
          lastRepliedAt: new Date(),
          unreadCount: 0
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Reply to conversation error:', error);
    
    // ✅ CRITICAL FIX: Return detailed error response
    const errorMessage = error.message || 'Failed to send reply';
    let errorType = 'REPLY_FAILED';
    let userMessage = errorMessage;
    let action = '';
    
    if (errorMessage.includes('SESSION_EXPIRED')) {
      errorType = 'SESSION_EXPIRED';
      userMessage = '24h session expired. Cannot send free-text message.';
      action = 'Please send a template message to reopen the chat.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('not approved')) {
      errorType = 'TEMPLATE_NOT_APPROVED';
      userMessage = 'Template not found or not approved';
      action = 'Verify the template is created and approved by Meta.';
    } else if (errorMessage.includes('Phone number')) {
      errorType = 'PHONE_NUMBER_ERROR';
      userMessage = 'Phone number is not properly configured';
      action = 'Go to Settings and verify your phone number connection.';
    }
    
    res.status(400).json({
      success: false,
      message: userMessage,
      error: errorType,
      details: {
        fullError: errorMessage,
        suggestedAction: action
      }
    });
  }
};

/**
 * PATCH /api/conversations/:conversationId/read - Mark conversation as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const result = await Conversation.updateOne(
      { conversationId },
      {
        $set: {
          unreadCount: 0,
          lastReadAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
    
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PATCH /api/conversations/:conversationId/status - Update conversation status
 */
export const updateStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "open" or "closed"'
      });
    }
    
    const result = await Conversation.updateOne(
      { conversationId },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      message: `Conversation marked as ${status}`
    });
    
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getConversations,
  getConversationMessages,
  replyToConversation,
  markAsRead,
  updateStatus
};
