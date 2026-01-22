import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';
import { uploadMediaToS3 } from '../services/s3Service.js';
import { broadcastNewMessage, broadcastConversationUpdate, broadcastMessageStatus } from '../services/socketService.js';

/**
 * Message Controller
 * Handles message sending and retrieval
 */

// Socket.io instance (passed from app.js)
let io = null;

export const setSocketIO = (socketIOInstance) => {
  io = socketIOInstance;
};

/**
 * POST /api/messages/send - Send text message
 * 
 * SIMPLE MODE (Enromatics):
 *   Body: { recipientPhone, message }
 * 
 * ADVANCED MODE (Shopify/Multi-phone):
 *   Body: { phoneNumberId, recipientPhone, message }
 */
export const sendTextMessage = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const phoneNumberId = req.phoneNumberId; // From phoneNumberHelper (auto-detected or validated)
    const { recipientPhone, message, campaign } = req.body;
    
    if (!recipientPhone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientPhone, message'
      });
    }
    
    console.log(`📤 Sending text message [${req.phoneNumberMode}]:`, {
      accountId,
      phoneNumberId,
      recipientPhone,
      message: message.substring(0, 50) + '...'
    });
    
    const result = await whatsappService.sendTextMessage(
      accountId,
      phoneNumberId,
      recipientPhone,
      message,
      { campaign: campaign || 'manual' }
    );
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result,
      phoneNumberUsed: phoneNumberId,
      mode: req.phoneNumberMode // 'auto' or 'explicit'
    });
    
  } catch (error) {
    console.error('❌ Send text message error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message',
      error: error.message,
      errorType: error.name
    });
  }
};

/**
 * POST /api/messages/send-template - Send template message
 */
export const sendTemplateMessage = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const phoneNumberId = req.phoneNumberId; // From phoneNumberHelper middleware
    const { recipientPhone, templateName, params, campaign } = req.body;
    
    if (!recipientPhone || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientPhone, templateName'
      });
    }
    
    console.log('📋 Sending template message:', {
      accountId,
      phoneNumberId,
      recipientPhone,
      templateName,
      params
    });
    
    const result = await whatsappService.sendTemplateMessage(
      accountId,
      phoneNumberId,
      recipientPhone,
      templateName,
      params || [],
      { campaign: campaign || 'manual' }
    );
    
    res.json({
      success: true,
      message: 'Template message sent successfully',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Send template message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/messages - Get message history
 */
export const getMessages = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const { phoneNumberId, status, limit = 50, skip = 0 } = req.query;
    
    const query = { accountId };
    if (phoneNumberId) query.phoneNumberId = phoneNumberId;
    if (status) query.status = status;
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await Message.countDocuments(query);
    
    res.json({
      success: true,
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/messages/:id - Get single message
 */
export const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id).lean();
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message
    });
    
  } catch (error) {
    console.error('❌ Get message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/messages/send-media - Send media message with file upload
 */
export const sendMediaMessage = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const phoneNumberId = req.phoneNumberId; // From phoneNumberHelper middleware
    const { recipientPhone, caption, campaign } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    if (!recipientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: recipientPhone'
      });
    }
    
    const file = req.file;
    
    // Determine media type from MIME type
    let mediaType = 'document';
    if (file.mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    }
    
    console.log('📤 Sending media message:', {
      accountId,
      phoneNumberId,
      recipientPhone,
      mediaType,
      filename: file.originalname,
      size: file.size
    });
    
    // Upload file to S3
    console.log('⬆️ Uploading to S3...');
    const s3Result = await uploadMediaToS3(
      file.buffer,
      accountId,
      mediaType,
      file.mimetype,
      file.originalname
    );
    
    console.log('✅ S3 upload complete:', s3Result.url);
    
    // Send via WhatsApp - pass file buffer for WhatsApp upload
    const result = await whatsappService.sendMediaMessage(
      accountId,
      phoneNumberId,
      recipientPhone,
      s3Result.url,
      mediaType,
      caption || '',
      { 
        campaign: campaign || 'manual',
        filename: file.originalname,
        fileBuffer: file.buffer,  // Pass buffer for WhatsApp upload
        mimeType: file.mimetype
      }
    );
    
    res.json({
      success: true,
      message: 'Media message sent successfully',
      data: {
        ...result,
        mediaUrl: s3Result.url,
        mediaType,
        filename: file.originalname
      }
    });
    
  } catch (error) {
    console.error('❌ Send media message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  sendTextMessage,
  sendTemplateMessage,
  getMessages,
  getMessage,
  sendMediaMessage
};
