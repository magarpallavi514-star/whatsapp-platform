import axios from 'axios';
import PhoneNumber from '../models/PhoneNumber.js';
import Message from '../models/Message.js';
import Template from '../models/Template.js';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import KeywordRule from '../models/KeywordRule.js';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * WhatsApp Service - Core business logic
 * Handles Meta Cloud API communication
 * Fully multi-tenant with accountId + phoneNumberId isolation
 */
class WhatsAppService {
  
  /**
   * Get phone number config with decrypted token
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   */
  async getPhoneConfig(accountId, phoneNumberId) {
    const config = await PhoneNumber.findOne({ 
      accountId, 
      phoneNumberId,
      isActive: true 
    }).select('+accessToken'); // CRITICAL: explicitly select encrypted field
    
    if (!config) {
      throw new Error('Phone number not configured or inactive');
    }
    
    return config;
  }

  /**
   * Send text message via WhatsApp Cloud API
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {string} messageText 
   * @param {object} metadata 
   */
  async sendTextMessage(accountId, phoneNumberId, recipientPhone, messageText, metadata = {}) {
    let message;
    
    try {
      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      
      // Clean phone number (remove + and spaces)
      const cleanPhone = recipientPhone.replace(/[\s+()-]/g, '');
      
      console.log('📱 Preparing to send WhatsApp message:');
      console.log('  Account ID:', accountId);
      console.log('  Phone Number ID:', phoneNumberId);
      console.log('  Original Phone:', recipientPhone);
      console.log('  Cleaned Phone:', cleanPhone);
      console.log('  Message:', messageText);
      
      // Create message record (queued state)
      message = new Message({
        accountId,
        phoneNumberId,
        recipientPhone: cleanPhone,
        messageType: 'text',
        content: { text: messageText },
        status: 'queued',
        campaign: metadata.campaign || 'manual',
        direction: 'outbound'
      });
      
      await message.save();
      console.log('✅ Message saved to DB with status: queued');

      // Send via WhatsApp Cloud API
      console.log('🚀 Sending to Meta API...');
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { body: messageText }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Meta API Response:', response.data);

      // Update message with WhatsApp message ID
      message.waMessageId = response.data.messages[0].id;
      message.status = 'sent';
      message.sentAt = new Date();
      message.statusUpdates.push({
        status: 'sent',
        timestamp: new Date()
      });
      await message.save();

      // Update phone number stats
      await PhoneNumber.updateOne(
        { accountId, phoneNumberId },
        { 
          $inc: { 
            'messageCount.total': 1, 
            'messageCount.sent': 1 
          } 
        }
      );

      return {
        success: true,
        messageId: message._id,
        waMessageId: message.waMessageId
      };

    } catch (error) {
      console.error('❌ Send message error:', error.response?.data || error.message);
      
      // Save failed message to database
      if (message) {
        message.status = 'failed';
        message.failedAt = new Date();
        message.errorMessage = error.response?.data?.error?.message || error.message;
        message.errorCode = error.response?.data?.error?.code;
        message.statusUpdates.push({
          status: 'failed',
          timestamp: new Date(),
          errorMessage: error.response?.data?.error?.message || error.message,
          errorCode: error.response?.data?.error?.code
        });
        await message.save();
      }
      
      throw new Error(error.response?.data?.error?.message || 'Failed to send message');
    }
  }

  /**
   * Send template message (for pre-approved templates)
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {string} templateName 
   * @param {array} params 
   * @param {object} metadata 
   */
  async sendTemplateMessage(accountId, phoneNumberId, recipientPhone, templateName, params = [], metadata = {}) {
    let message;
    
    try {
      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      const cleanPhone = recipientPhone.replace(/[\s+()-]/g, '');

      console.log('📋 ========== SENDING TEMPLATE MESSAGE ==========');
      console.log('Account ID:', accountId);
      console.log('Phone Number ID:', phoneNumberId);
      console.log('Template Name:', templateName);
      console.log('Recipient Phone:', cleanPhone);
      console.log('Parameters:', params);

      // CRITICAL: Fetch template metadata to validate variables
      const template = await Template.findOne({ 
        accountId, 
        name: templateName,
        deleted: { $ne: true },
        status: 'approved'
      });

      if (!template) {
        throw new Error(`Template "${templateName}" not found or not approved`);
      }

      const templateVariableCount = template.variables?.length || 0;
      console.log('Template Variables Required:', templateVariableCount);

      // MANDATORY VALIDATION: Prevent silent failure
      if (templateVariableCount > 0 && (!params || params.length === 0)) {
        const errorMsg = `Template "${templateName}" requires ${templateVariableCount} parameter(s) but none were provided`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      // VALIDATION: Parameter count must match
      if (templateVariableCount > 0 && params.length !== templateVariableCount) {
        const errorMsg = `Template "${templateName}" has ${templateVariableCount} variable(s) but ${params.length} parameter(s) provided`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Validation passed');

      // Create message record
      message = new Message({
        accountId,
        phoneNumberId,
        recipientPhone: cleanPhone,
        messageType: 'template',
        content: {
          templateName,
          templateParams: params
        },
        status: 'queued',
        campaign: metadata.campaign || 'manual',
        direction: 'outbound'
      });
      
      await message.save();

      // Build template components
      let components = [];
      
      if (params && params.length > 0) {
        components = [{
          type: 'body',
          parameters: params.map(p => ({ type: 'text', text: String(p) }))
        }];
        console.log('✅ Building components with', params.length, 'parameters');
      } else {
        console.log('📝 Template has no variables - sending without components');
      }

      // Build template payload
      const templatePayload = {
        name: templateName,
        language: { code: template.language || 'en' }
      };

      // Only attach components if parameters exist
      if (components.length > 0) {
        templatePayload.components = components;
      }

      console.log('📤 Sending to Meta API...');

      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: templatePayload
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Meta API Response:', response.data);

      // Update message
      message.waMessageId = response.data.messages[0].id;
      message.status = 'sent';
      message.sentAt = new Date();
      message.statusUpdates.push({
        status: 'sent',
        timestamp: new Date()
      });
      await message.save();

      // Update stats
      await PhoneNumber.updateOne(
        { accountId, phoneNumberId },
        { 
          $inc: { 
            'messageCount.total': 1, 
            'messageCount.sent': 1 
          } 
        }
      );

      // Update template usage
      await Template.updateOne(
        { accountId, name: templateName },
        { 
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() }
        }
      );

      return {
        success: true,
        messageId: message._id,
        waMessageId: message.waMessageId
      };

    } catch (error) {
      console.error('🚨 Template send error:', error.response?.data || error.message);
      
      if (message) {
        message.status = 'failed';
        message.failedAt = new Date();
        message.errorMessage = error.response?.data?.error?.message || error.message;
        message.errorCode = error.response?.data?.error?.code;
        message.statusUpdates.push({
          status: 'failed',
          timestamp: new Date(),
          errorMessage: error.response?.data?.error?.message || error.message,
          errorCode: error.response?.data?.error?.code
        });
        await message.save();
      }
      
      throw new Error(error.response?.data?.error?.message || 'Failed to send template');
    }
  }

  /**
   * Test WhatsApp connection
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} testPhone 
   */
  async testConnection(accountId, phoneNumberId, testPhone) {
    try {
      console.log('🧪 Testing WhatsApp connection...');
      
      const result = await this.sendTextMessage(
        accountId,
        phoneNumberId,
        testPhone,
        '✅ Test message from WhatsApp Platform - Connection successful!',
        { campaign: 'test' }
      );

      // Update verification timestamp
      await PhoneNumber.updateOne(
        { accountId, phoneNumberId },
        { 
          verifiedAt: new Date(),
          lastTestedAt: new Date()
        }
      );

      return result;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle webhook status updates from WhatsApp
   * @param {string} waMessageId 
   * @param {string} status 
   * @param {number} timestamp 
   * @param {object} errorInfo 
   */
  async handleStatusUpdate(waMessageId, status, timestamp, errorInfo = {}) {
    try {
      console.log('📊 Status update:', waMessageId, status);
      
      const message = await Message.findOne({ waMessageId });
      
      if (!message) {
        console.log('⚠️  Message not found for status update:', waMessageId);
        return;
      }

      // Update message status
      message.status = status;
      
      // Set timestamp based on status
      if (status === 'delivered') {
        message.deliveredAt = new Date(timestamp * 1000);
        
        // Update phone number stats
        await PhoneNumber.updateOne(
          { accountId: message.accountId, phoneNumberId: message.phoneNumberId },
          { $inc: { 'messageCount.delivered': 1 } }
        );
      } else if (status === 'read') {
        message.readAt = new Date(timestamp * 1000);
        
        await PhoneNumber.updateOne(
          { accountId: message.accountId, phoneNumberId: message.phoneNumberId },
          { $inc: { 'messageCount.read': 1 } }
        );
      } else if (status === 'failed') {
        message.failedAt = new Date(timestamp * 1000);
        message.errorCode = errorInfo.code;
        message.errorMessage = errorInfo.message;
        
        await PhoneNumber.updateOne(
          { accountId: message.accountId, phoneNumberId: message.phoneNumberId },
          { $inc: { 'messageCount.failed': 1 } }
        );
      }

      // Add to status updates history
      message.statusUpdates.push({
        status,
        timestamp: new Date(timestamp * 1000),
        errorCode: errorInfo.code,
        errorMessage: errorInfo.message
      });

      await message.save();
      console.log('✅ Status updated in database');
      
    } catch (error) {
      console.error('❌ Error updating status:', error.message);
    }
  }

  /**
   * Process incoming message and check keyword rules
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} senderPhone 
   * @param {string} messageText 
   */
  async processIncomingMessage(accountId, phoneNumberId, senderPhone, messageText) {
    try {
      console.log('📥 Processing incoming message from:', senderPhone);
      
      // Check for matching keyword rules
      const rules = await KeywordRule.find({ 
        accountId,
        $or: [
          { phoneNumberId: phoneNumberId },
          { phoneNumberId: null } // Rules for all phone numbers
        ],
        isActive: true 
      });

      for (const rule of rules) {
        if (rule.matches(messageText)) {
          console.log('✅ Matched keyword rule:', rule.name);
          
          // Update rule stats
          await KeywordRule.updateOne(
            { _id: rule._id },
            { 
              $inc: { triggerCount: 1 },
              $set: { lastTriggeredAt: new Date() }
            }
          );

          // Send auto-reply
          if (rule.replyType === 'text' && rule.replyContent.text) {
            await this.sendTextMessage(
              accountId,
              phoneNumberId,
              senderPhone,
              rule.replyContent.text,
              { campaign: 'keyword_auto_reply' }
            );
          } else if (rule.replyType === 'template' && rule.replyContent.templateName) {
            await this.sendTemplateMessage(
              accountId,
              phoneNumberId,
              senderPhone,
              rule.replyContent.templateName,
              rule.replyContent.templateParams || [],
              { campaign: 'keyword_auto_reply' }
            );
          }
          
          // Only trigger first matching rule
          break;
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing incoming message:', error.message);
    }
  }

  /**
   * Get statistics for account
   * @param {string} accountId 
   * @param {string} phoneNumberId (optional)
   */
  async getStats(accountId, phoneNumberId = null) {
    try {
      const query = { accountId };
      if (phoneNumberId) query.phoneNumberId = phoneNumberId;

      const [
        totalMessages,
        sentMessages,
        deliveredMessages,
        failedMessages,
        todayMessages
      ] = await Promise.all([
        Message.countDocuments(query),
        Message.countDocuments({ ...query, status: 'sent' }),
        Message.countDocuments({ ...query, status: 'delivered' }),
        Message.countDocuments({ ...query, status: 'failed' }),
        Message.countDocuments({ 
          ...query, 
          createdAt: { 
            $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        })
      ]);

      return {
        totalMessages,
        sentMessages,
        deliveredMessages,
        failedMessages,
        todayMessages,
        deliveryRate: totalMessages > 0 
          ? ((deliveredMessages / totalMessages) * 100).toFixed(1) + '%'
          : '0%'
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      throw error;
    }
  }
}

export default new WhatsAppService();
