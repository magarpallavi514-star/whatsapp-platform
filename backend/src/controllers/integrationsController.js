/**
 * Integrations Controller
 * Handles requests from third-party apps (Enromatics, etc.)
 * using integration tokens (wpi_int_)
 */

import whatsappService from '../services/whatsappService.js';
import Conversation from '../models/Conversation.js';
import PhoneNumber from '../models/PhoneNumber.js';

/**
 * POST /api/integrations/send-message
 * Send message via integration token (Enromatics, third-party apps)
 */
export const sendMessageViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId; // From integration auth middleware
    const { recipientPhone, message } = req.body;

    if (!recipientPhone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientPhone, message'
      });
    }

    console.log(`📤 [INTEGRATION] Sending message via Enromatics:`, {
      accountId,
      recipientPhone,
      messageLength: message.length
    });

    // Get default/active phone number for this account
    const phoneNumber = await PhoneNumber.findOne({
      accountId,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'No active WhatsApp phone number configured for this account'
      });
    }

    // Send message via WhatsApp service
    const result = await whatsappService.sendTextMessage(
      accountId,
      phoneNumber.phoneNumberId,
      recipientPhone,
      message,
      { campaign: 'enromatics' }
    );

    return res.json({
      success: true,
      message: 'Message sent successfully via Enromatics',
      data: {
        messageId: result.messageId,
        waMessageId: result.waMessageId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [INTEGRATION] Send message error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * GET /api/integrations/conversations
 * Get conversations for account (used by Enromatics to fetch chat list)
 */
export const getConversationsViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId; // From integration auth middleware
    const { limit = 50, offset = 0 } = req.query;

    console.log(`📭 [INTEGRATION] Fetching conversations for Enromatics:`, {
      accountId,
      limit,
      offset
    });

    // Fetch conversations
    const conversations = await Conversation.find({ accountId })
      .sort({ lastMessageAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Conversation.countDocuments({ accountId });

    return res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < totalCount
        }
      }
    });

  } catch (error) {
    console.error('❌ [INTEGRATION] Get conversations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};
