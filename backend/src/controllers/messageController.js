import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';

/**
 * Message Controller
 * Handles message sending and retrieval
 */

/**
 * POST /api/messages/send - Send text message
 */
export const sendTextMessage = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const { phoneNumberId, recipientPhone, message, campaign } = req.body;
    
    if (!phoneNumberId || !recipientPhone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phoneNumberId, recipientPhone, message'
      });
    }
    
    console.log('📤 Sending text message:', {
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
      data: result
    });
    
  } catch (error) {
    console.error('❌ Send text message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/messages/send-template - Send template message
 */
export const sendTemplateMessage = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    const { phoneNumberId, recipientPhone, templateName, params, campaign } = req.body;
    
    if (!phoneNumberId || !recipientPhone || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phoneNumberId, recipientPhone, templateName'
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

export default {
  sendTextMessage,
  sendTemplateMessage,
  getMessages,
  getMessage
};
