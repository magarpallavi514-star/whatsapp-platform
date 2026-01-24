import axios from 'axios';
import mongoose from 'mongoose';
import PhoneNumber from '../models/PhoneNumber.js';
import Message from '../models/Message.js';
import Template from '../models/Template.js';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import KeywordRule from '../models/KeywordRule.js';
import WorkflowSession from '../models/WorkflowSession.js';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * WhatsApp Service - Core business logic
 * Handles Meta Cloud API communication
 * Fully multi-tenant with accountId + phoneNumberId isolation
 */
class WhatsAppService {
  
  /**
   * Get phone number config with decrypted token
   * Handles STRING accountId format (Account.accountId, not MongoDB _id)
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   */
  async getPhoneConfig(accountId, phoneNumberId) {
    // accountId is a STRING from JWT: "6971e3a706837a5539992bee"
    // PhoneNumber.accountId is stored as STRING (matches Account.accountId)
    // NO conversion needed - use STRING directly
    
    let queryAccountId = accountId;
    
    // Keep accountId as STRING - PhoneNumber model stores accountId as String
    // Do NOT convert to ObjectId
    
    const config = await PhoneNumber.findOne({
      accountId: queryAccountId,
      phoneNumberId,
      isActive: true 
    }).select('+accessToken'); // CRITICAL: explicitly select encrypted field
    
    if (!config) {
      throw new Error(
        '🚨 WhatsApp Business Account not connected!\n\n' +
        'Please connect your WhatsApp account in Settings first:\n' +
        '1. Go to Dashboard > Settings\n' +
        '2. Click "Add Phone Number"\n' +
        '3. Enter your Phone Number ID, WABA ID, and Access Token\n' +
        '4. Click "Add" to complete setup\n\n' +
        'Error: No active phone number configured for this account'
      );
    }
    
    // ✅ CRITICAL FIX: Validate token is actually decrypted
    if (!config.accessToken) {
      throw new Error(
        'Access token is missing. This may indicate:\n' +
        '1. Token encryption/decryption failed\n' +
        '2. JWT_SECRET environment variable changed\n' +
        '3. Database corruption\n' +
        'Action: Reconnect your WhatsApp account in Settings.'
      );
    }
    
    // ✅ Log token status for debugging
    console.log('📱 Phone config loaded:', {
      phoneNumberId: config.phoneNumberId,
      wabaId: config.wabaId,
      isActive: config.isActive,
      tokenLength: config.accessToken.length,
      tokenStarts: config.accessToken.substring(0, 30),
      hasValidFormat: !config.accessToken.startsWith('Bearer ')  // Should not have Bearer prefix here
    });
    
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
      // ✅ CRITICAL FIX: Validate phoneNumberId first
      if (!phoneNumberId || typeof phoneNumberId !== 'string') {
        throw new Error(
          'Phone number not found. Phone number ID is required.\n' +
          'This error occurs when:\n' +
          '1. Phone number is not properly configured\n' +
          '2. Phone number is still provisioning (quality rating not shown)\n' +
          '3. Phone number is not assigned to this account\n\n' +
          'Action: Go to Settings > Phone Numbers and ensure the phone has an ACTIVE status with quality rating displayed.'
        );
      }

      // Validate recipient phone FIRST before any operations
      if (!recipientPhone || typeof recipientPhone !== 'string') {
        throw new Error(`Invalid recipient phone: ${recipientPhone}. Expected non-empty string.`);
      }

      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      
      // ✅ CRITICAL FIX: Validate phone is ACTIVE (not just exists)
      if (!config.isActive) {
        throw new Error(
          'Phone number is not active. Cannot send messages.\n' +
          'Action: Verify your phone number connection in Settings.'
        );
      }
      
      // ✅ CRITICAL FIX: Validate quality status
      // Phone should have quality rating to reliably send messages
      if (!config.qualityRating) {
        console.warn('⚠️  Warning: Phone number quality rating not shown yet. Messages may fail temporarily.');
      }
      
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

      // ✅ FIX 1: Create/update conversation with proper fields
      // This ensures the conversation appears in live chat after sending
      const accountIdStr = accountId instanceof mongoose.Types.ObjectId ? accountId.toString() : accountId;
      await Conversation.findOneAndUpdate(
        {
          accountId,
          phoneNumberId,
          customerNumber: cleanPhone
        },
        {
          $setOnInsert: {
            accountId,
            phoneNumberId,
            customerNumber: cleanPhone,
            startedAt: new Date()
          },
          $set: {
            lastMessageAt: new Date(),
            lastMessagePreview: messageText.substring(0, 200),
            lastMessageType: 'text',
            status: 'open'
          }
        },
        { upsert: true, new: true }
      );
      console.log('✅ Conversation created/updated for live chat display');

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
      // ✅ CRITICAL FIX: Validate phoneNumberId first
      if (!phoneNumberId || typeof phoneNumberId !== 'string') {
        throw new Error(
          'Phone number not found. Phone number ID is required.\n' +
          'Action: Go to Settings > Phone Numbers and ensure the phone has an ACTIVE status.'
        );
      }

      // Validate recipient phone FIRST before any operations
      if (!recipientPhone || typeof recipientPhone !== 'string') {
        throw new Error(`Invalid recipient phone: ${recipientPhone}. Expected non-empty string.`);
      }

      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      
      // ✅ CRITICAL FIX: Validate phone is ACTIVE
      if (!config.isActive) {
        throw new Error('Phone number is not active. Cannot send template messages.');
      }

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
        throw new Error(
          `Template "${templateName}" not found or not approved.\n` +
          'Possible reasons:\n' +
          '1. Template is still in DRAFT status - submit it to Meta first\n' +
          '2. Template is PENDING approval - wait for Meta to approve it\n' +
          '3. Template name is incorrect - check the exact name\n' +
          'Action: Go to Messages > Templates and verify the template is APPROVED.'
        );
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

      // ✅ FIX 1: Create/update conversation with proper fields
      // This ensures the conversation appears in live chat after sending template
      const accountIdStr = accountId instanceof mongoose.Types.ObjectId ? accountId.toString() : accountId;
      await Conversation.findOneAndUpdate(
        {
          accountId,
          phoneNumberId,
          customerNumber: cleanPhone
        },
        {
          $setOnInsert: {
            accountId,
            phoneNumberId,
            customerNumber: cleanPhone,
            startedAt: new Date()
          },
          $set: {
            lastMessageAt: new Date(),
            lastMessagePreview: `[Template] ${templateName}`,
            lastMessageType: 'template',
            status: 'open'
          }
        },
        { upsert: true, new: true }
      );
      console.log('✅ Conversation created/updated for live chat display');

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
   * @param {object} metadata - Optional metadata (e.g., buttonId for button clicks)
   */
  async processIncomingMessage(accountId, phoneNumberId, senderPhone, messageText, metadata = {}) {
    try {
      console.log('📥 Processing incoming message from:', senderPhone);
      console.log('📝 Message text:', messageText);
      console.log('🏢 Account ID:', accountId);
      console.log('📞 Phone Number ID:', phoneNumberId);
      if (metadata.buttonId) {
        console.log('🔘 Button ID:', metadata.buttonId);
      }
      
      // FIRST: Check if user has an active workflow session
      const activeSession = await WorkflowSession.findOne({
        accountId,
        contactPhone: senderPhone,
        status: 'active'
      });

      if (activeSession) {
        console.log('🔄 User has active workflow session, processing response...');
        await this.handleWorkflowResponse(activeSession, messageText, metadata);
        return; // Don't check keyword rules when in a workflow
      }
      
      // Check for matching keyword rules
      const rules = await KeywordRule.find({ 
        accountId,
        $or: [
          { phoneNumberId: phoneNumberId },
          { phoneNumberId: null } // Rules for all phone numbers
        ],
        isActive: true 
      });

      console.log(`🔍 Found ${rules.length} active rules to check`);

      for (const rule of rules) {
        console.log(`🔎 Checking rule: ${rule.name} (Keywords: ${rule.keywords.join(', ')})`);
        
        if (rule.matches(messageText)) {
          console.log('✅ Matched keyword rule:', rule.name);
          
          // Check if we already triggered this rule for this contact recently (cooldown)
          const cooldownMinutes = 60; // Don't trigger same rule within 60 minutes
          const recentMessage = await Message.findOne({
            accountId,
            to: senderPhone,
            direction: 'outbound',
            'metadata.campaign': 'keyword_auto_reply',
            'metadata.ruleId': rule._id.toString(),
            createdAt: { 
              $gte: new Date(Date.now() - cooldownMinutes * 60 * 1000) 
            }
          });

          if (recentMessage) {
            const minutesAgo = Math.floor((Date.now() - recentMessage.createdAt.getTime()) / 60000);
            console.log(`⏱️ Cooldown active - already triggered ${minutesAgo} minutes ago. Skipping.`);
            continue; // Skip this rule, check next one
          }

          console.log('🎯 Reply type:', rule.replyType);
          
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
            console.log('💬 Sending text reply:', rule.replyContent.text);
            await this.sendTextMessage(
              accountId,
              phoneNumberId,
              senderPhone,
              rule.replyContent.text,
              { campaign: 'keyword_auto_reply', ruleId: rule._id.toString() }
            );
          } else if (rule.replyType === 'template' && rule.replyContent.templateName) {
            console.log('📋 Sending template reply:', rule.replyContent.templateName);
            await this.sendTemplateMessage(
              accountId,
              phoneNumberId,
              senderPhone,
              rule.replyContent.templateName,
              rule.replyContent.templateParams || [],
              { campaign: 'keyword_auto_reply', ruleId: rule._id.toString() }
            );
          } else if (rule.replyType === 'workflow' && rule.replyContent.workflow) {
            console.log('🔄 Starting conversational workflow with', rule.replyContent.workflow.length, 'steps');
            // Start a new workflow session
            await this.startWorkflowSession(
              accountId,
              phoneNumberId,
              senderPhone,
              rule._id,
              rule.replyContent.workflow,
              rule.timeoutMinutes || 1
            );
          }
          
          // Only trigger first matching rule
          break;
        } else {
          console.log('❌ Rule did not match');
        }
      }
      
      if (rules.length === 0) {
        console.log('⚠️ No active rules found for this account');
      }
    } catch (error) {
      console.error('❌ Error in processIncomingMessage:', error);
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

  /**
   * Upload media to WhatsApp servers and get media ID
   * @param {Buffer} fileBuffer 
   * @param {string} phoneNumberId 
   * @param {string} accessToken 
   * @param {string} mimeType 
   * @param {string} filename 
   */
  async uploadMediaToWhatsApp(fileBuffer, phoneNumberId, accessToken, mimeType, filename) {
    try {
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      
      formData.append('file', fileBuffer, {
        filename: filename,
        contentType: mimeType
      });
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);
      
      console.log('⬆️ Uploading to WhatsApp Media API...');
      console.log('  Phone Number ID:', phoneNumberId);
      console.log('  Filename:', filename);
      console.log('  Type:', mimeType);
      
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            ...formData.getHeaders()
          }
        }
      );
      
      console.log('✅ Media uploaded to WhatsApp:', response.data);
      return response.data.id; // Returns media ID
      
    } catch (error) {
      console.error('❌ WhatsApp media upload error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to upload media to WhatsApp');
    }
  }

  /**
   * Send media message (image, video, document)
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {string} mediaUrl - S3 URL (stored for reference)
   * @param {string} mediaType - image, video, or document
   * @param {string} caption - Optional caption for media
   * @param {object} metadata - Must include fileBuffer, mimeType, filename
   */
  async sendMediaMessage(accountId, phoneNumberId, recipientPhone, mediaUrl, mediaType, caption = '', metadata = {}) {
    let message;
    
    try {
      // Validate recipient phone FIRST before any operations
      if (!recipientPhone || typeof recipientPhone !== 'string') {
        throw new Error(`Invalid recipient phone: ${recipientPhone}. Expected non-empty string.`);
      }

      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      const cleanPhone = recipientPhone.replace(/[\s+()-]/g, '');
      
      console.log('📤 Sending media message:');
      console.log('  Account ID:', accountId);
      console.log('  Phone Number ID:', phoneNumberId);
      console.log('  Recipient:', cleanPhone);
      console.log('  Media Type:', mediaType);
      console.log('  Caption:', caption);
      
      // Create message record
      message = new Message({
        accountId,
        phoneNumberId,
        recipientPhone: cleanPhone,
        messageType: mediaType,
        content: { 
          url: mediaUrl,
          caption: caption 
        },
        status: 'queued',
        campaign: metadata.campaign || 'manual',
        direction: 'outbound'
      });
      
      await message.save();
      console.log('✅ Message saved to DB');

      // Upload media to WhatsApp and get media ID
      const mediaId = await this.uploadMediaToWhatsApp(
        metadata.fileBuffer,
        phoneNumberId,
        config.accessToken,
        metadata.mimeType,
        metadata.filename
      );

      // Prepare WhatsApp API payload with media ID
      const mediaPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: mediaType,
        [mediaType]: {
          id: mediaId  // Use media ID instead of link
        }
      };

      // Add caption if provided (for image and video)
      if (caption && (mediaType === 'image' || mediaType === 'video')) {
        mediaPayload[mediaType].caption = caption;
      }

      // Add filename for documents
      if (mediaType === 'document' && metadata.filename) {
        mediaPayload[mediaType].filename = metadata.filename;
      }

      console.log('🚀 Sending media message to Meta API...');
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        mediaPayload,
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

      // ✅ FIX 1: Create/update conversation with proper fields
      // This ensures the conversation appears in live chat after sending media
      const accountIdStr = accountId instanceof mongoose.Types.ObjectId ? accountId.toString() : accountId;
      const mediaLabel = mediaType === 'image' ? '🖼️ Photo' : 
                         mediaType === 'video' ? '🎥 Video' : 
                         '📄 Document';
      await Conversation.findOneAndUpdate(
        {
          accountId,
          phoneNumberId,
          customerNumber: cleanPhone
        },
        {
          $setOnInsert: {
            accountId,
            phoneNumberId,
            customerNumber: cleanPhone,
            startedAt: new Date()
          },
          $set: {
            lastMessageAt: new Date(),
            lastMessagePreview: mediaLabel,
            lastMessageType: mediaType,
            status: 'open'
          }
        },
        { upsert: true, new: true }
      );
      console.log('✅ Conversation created/updated for live chat display');

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
      console.error('❌ Send media error:', error.response?.data || error.message);
      
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
      
      throw new Error(error.response?.data?.error?.message || 'Failed to send media');
    }
  }

  /**
   * Process workflow - send multiple response steps
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {Array} workflowSteps 
   * @param {string} ruleId - Optional rule ID for tracking
   */
  async processWorkflow(accountId, phoneNumberId, recipientPhone, workflowSteps, ruleId = null) {
    try {
      console.log('🔄 Processing workflow with', workflowSteps.length, 'steps');
      
      for (const step of workflowSteps) {
        // Apply delay if specified
        if (step.delay && step.delay > 0) {
          console.log(`⏱️ Waiting ${step.delay} seconds...`);
          await new Promise(resolve => setTimeout(resolve, step.delay * 1000));
        }

        // Send based on step type
        if (step.type === 'text') {
          await this.sendTextMessage(
            accountId,
            phoneNumberId,
            recipientPhone,
            step.text || '',
            { campaign: 'workflow_auto_reply', ruleId }
          );
        } else if (step.type === 'buttons' && step.buttons && step.buttons.length > 0) {
          console.log('🔘 Sending button step:', {
            text: step.text,
            buttonsCount: step.buttons.length,
            buttons: step.buttons.map(b => ({ id: b.id, title: b.title, url: b.url }))
          });
          await this.sendButtonMessage(
            accountId,
            phoneNumberId,
            recipientPhone,
            step.text || '',
            step.buttons
          );
        } else if (step.type === 'list' && step.listItems && step.listItems.length > 0) {
          await this.sendListMessage(
            accountId,
            phoneNumberId,
            recipientPhone,
            step.text || '',
            step.listItems
          );
        }
      }
      
      console.log('✅ Workflow completed successfully');
    } catch (error) {
      console.error('❌ Error processing workflow:', error.message);
      throw error;
    }
  }

  /**
   * Send interactive button message
   * Supports both reply buttons and URL buttons (CTA)
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {string} bodyText 
   * @param {Array} buttons - Array of {id, title, url}
   */
  async sendButtonMessage(accountId, phoneNumberId, recipientPhone, bodyText, buttons) {
    try {
      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      
      console.log('🔘 sendButtonMessage called with:', {
        recipientPhone,
        bodyText: bodyText.substring(0, 50),
        buttonsCount: buttons.length,
        buttons: buttons.map(b => ({ title: b.title, hasUrl: !!b.url }))
      });
      
      // ALWAYS send as reply buttons (no URLs in payload)
      // This allows up to 3 buttons to show
      // URLs will be sent when user clicks the button
      const formattedButtons = buttons.slice(0, 3).map((btn, index) => ({
        type: 'reply',
        reply: {
          id: btn.id || `btn_${index}`,
          title: btn.title.substring(0, 20) // WhatsApp limit
        }
      }));

      console.log(`✅ Sending ${formattedButtons.length} reply buttons (URLs stored for click response)`);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText
          },
          action: {
            buttons: formattedButtons
          }
        }
      };

      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Button message sent:', response.data.messages[0].id);
      
      // Save to database
      const message = new Message({
        accountId,
        phoneNumberId,
        recipientPhone: recipientPhone,
        conversationId: null, // Will be set by webhook
        direction: 'outbound',
        messageType: 'interactive',
        content: { text: bodyText },
        waMessageId: response.data.messages[0].id,
        status: 'sent',
        sentAt: new Date(),
        metadata: {
          campaign: 'workflow_button',
          buttons: formattedButtons
        }
      });
      await message.save();

      return response.data;
    } catch (error) {
      console.error('❌ Error sending button message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send interactive list message
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} recipientPhone 
   * @param {string} bodyText 
   * @param {Array} listItems - Array of {id, title, description}
   */
  async sendListMessage(accountId, phoneNumberId, recipientPhone, bodyText, listItems) {
    try {
      const config = await this.getPhoneConfig(accountId, phoneNumberId);
      
      // WhatsApp API format for list (max 10 items)
      const formattedRows = listItems.slice(0, 10).map((item, index) => ({
        id: item.id || `item_${index}`,
        title: item.title.substring(0, 24), // WhatsApp limit
        description: item.description ? item.description.substring(0, 72) : undefined
      }));

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: bodyText
          },
          action: {
            button: 'View Options',
            sections: [{
              title: 'Options',
              rows: formattedRows
            }]
          }
        }
      };

      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ List message sent:', response.data.messages[0].id);
      
      // Save to database
      const message = new Message({
        accountId,
        phoneNumberId,
        conversationId: null,
        direction: 'outbound',
        from: phoneNumberId,
        to: recipientPhone,
        type: 'interactive',
        content: bodyText,
        waMessageId: response.data.messages[0].id,
        status: 'sent',
        sentAt: new Date(),
        metadata: {
          campaign: 'workflow_list',
          listItems: formattedRows
        }
      });
      await message.save();

      return response.data;
    } catch (error) {
      console.error('❌ Error sending list message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Start a new conversational workflow session
   * @param {string} accountId 
   * @param {string} phoneNumberId 
   * @param {string} contactPhone 
   * @param {string} ruleId 
   * @param {Array} workflowSteps 
   * @param {number} timeoutMinutes - Timeout in minutes for user response
   */
  async startWorkflowSession(accountId, phoneNumberId, contactPhone, ruleId, workflowSteps, timeoutMinutes = 1) {
    try {
      console.log('🆕 Starting new workflow session for:', contactPhone);
      console.log('⏰ Timeout set to:', timeoutMinutes, 'minutes');
      
      // Cancel any existing active sessions for this contact
      await WorkflowSession.updateMany(
        { accountId, contactPhone, status: 'active' },
        { status: 'cancelled', completedAt: new Date() }
      );

      // Create new session
      const session = await WorkflowSession.create({
        accountId,
        phoneNumberId,
        contactPhone,
        ruleId,
        workflowSteps,
        currentStepIndex: 0,
        status: 'active',
        timeoutMinutes
      });

      console.log('✅ Workflow session created:', session._id);

      // Send the first step
      await this.sendWorkflowStep(session);
      
    } catch (error) {
      console.error('❌ Error starting workflow session:', error);
      throw error;
    }
  }

  /**
   * Send current workflow step
   * @param {Object} session - WorkflowSession document
   */
  async sendWorkflowStep(session) {
    try {
      const step = session.getCurrentStep();
      
      if (!step) {
        console.log('✅ Workflow completed');
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();
        
        // Send completion message with collected data
        await this.sendWorkflowCompletionMessage(session);
        return;
      }

      console.log(`📤 Sending step ${session.currentStepIndex + 1}/${session.workflowSteps.length}: ${step.type}`);

      // Apply delay if specified
      if (step.delay && step.delay > 0) {
        console.log(`⏱️ Waiting ${step.delay} seconds...`);
        await new Promise(resolve => setTimeout(resolve, step.delay * 1000));
      }

      // Send based on step type
      if (step.type === 'text' || step.type === 'question') {
        await this.sendTextMessage(
          session.accountId,
          session.phoneNumberId,
          session.contactPhone,
          step.text || '',
          { campaign: 'workflow_conversation', sessionId: session._id.toString() }
        );
      } else if (step.type === 'buttons' && step.buttons && step.buttons.length > 0) {
        await this.sendButtonMessage(
          session.accountId,
          session.phoneNumberId,
          session.contactPhone,
          step.text || '',
          step.buttons
        );
      } else if (step.type === 'list' && step.listItems && step.listItems.length > 0) {
        await this.sendListMessage(
          session.accountId,
          session.phoneNumberId,
          session.contactPhone,
          step.text || '',
          step.listItems
        );
      }

      // Button and List steps ALWAYS wait for response
      const shouldWaitForResponse = step.waitForResponse || step.saveAs || step.type === 'buttons' || step.type === 'list' || step.type === 'question';

      // If this step doesn't wait for response, automatically advance
      if (!shouldWaitForResponse) {
        const hasMore = session.advanceStep();
        await session.save();
        
        if (hasMore) {
          // Send next step immediately
          await this.sendWorkflowStep(session);
        } else {
          // Workflow complete
          session.status = 'completed';
          session.completedAt = new Date();
          await session.save();
          await this.sendWorkflowCompletionMessage(session);
        }
      } else {
        // Wait for user response - set timeout timer
        session.awaitingResponseSince = new Date();
        await session.save();
        console.log('⏳ Waiting for user response...');
        
        // Schedule timeout check after specified minutes
        setTimeout(async () => {
          await this.checkWorkflowTimeout(session._id);
        }, session.timeoutMinutes * 60 * 1000);
      }
      
    } catch (error) {
      console.error('❌ Error sending workflow step:', error);
      throw error;
    }
  }

  /**
   * Handle user response in active workflow
   * @param {Object} session - WorkflowSession document
   * @param {string} responseText - User's response text
   * @param {Object} metadata - Optional metadata (buttonId, etc.)
   */
  async handleWorkflowResponse(session, responseText, metadata = {}) {
    try {
      const step = session.getCurrentStep();
      
      if (!step) {
        console.log('⚠️ No current step in session');
        return;
      }

      // Check if session has already timed out
      if (session.hasTimedOut) {
        console.log('⏰ Session has already timed out, ignoring response');
        return;
      }

      console.log(`💾 Received response for step ${session.currentStepIndex + 1}: "${responseText}"`);
      if (metadata.buttonId) {
        console.log(`🔘 Button ID from webhook: ${metadata.buttonId}`);
      }

      // Clear timeout timer
      session.awaitingResponseSince = null;

      // Save response if step has saveAs field
      if (step.saveAs) {
        session.saveResponse(step.saveAs, responseText);
        console.log(`✅ Saved response as: ${step.saveAs} = "${responseText}"`);
      }

      // Check if next step should be determined by conditional branching
      let nextStepIndex = null;
      
      // Check if current step has buttons/list items with nextStepId (conditional branching)
      if (step.buttons && step.buttons.length > 0) {
        console.log(`🔍 Checking buttons:`, step.buttons.map(b => ({ 
          id: b.id, 
          title: b.title, 
          url: b.url,
          hasUrl: !!b.url 
        })));
        
        // Match by buttonId first (if provided), otherwise by text
        let selectedButton;
        if (metadata.buttonId) {
          console.log(`🔍 Matching by button ID: ${metadata.buttonId}`);
          selectedButton = step.buttons.find(btn => btn.id === metadata.buttonId);
        }
        
        if (!selectedButton) {
          console.log(`🔍 Matching by button text: ${responseText}`);
          selectedButton = step.buttons.find(btn => 
            responseText.toLowerCase().includes(btn.title.toLowerCase()) ||
            responseText === btn.id
          );
        }
        
        if (selectedButton) {
          console.log(`🔘 User clicked button:`, { 
            title: selectedButton.title, 
            url: selectedButton.url,
            hasUrl: !!selectedButton.url
          });
          
          // If button has URL, send it as clickable link
          if (selectedButton.url) {
            console.log(`🔗 Sending clickable link: ${selectedButton.url}`);
            await this.sendTextMessage(
              session.accountId,
              session.phoneNumberId,
              session.contactPhone,
              `${selectedButton.url}`,
              { campaign: 'workflow_button_url' }
            );
          } else {
            console.log(`⚠️ Button has no URL to send`);
          }
          
          // Check for conditional branching
          if (selectedButton.nextStepId) {
            // Find the step index with this ID
            nextStepIndex = session.workflowSteps.findIndex(s => s.id === selectedButton.nextStepId);
            console.log(`🔀 Conditional branch: Going to step "${selectedButton.nextStepId}" (index: ${nextStepIndex})`);
          }
        }
      }
      
      if (step.listItems && step.listItems.length > 0) {
        const selectedItem = step.listItems.find(item => 
          responseText.toLowerCase().includes(item.title.toLowerCase()) ||
          responseText === item.id
        );
        if (selectedItem && selectedItem.nextStepId) {
          nextStepIndex = session.workflowSteps.findIndex(s => s.id === selectedItem.nextStepId);
          console.log(`🔀 Conditional branch: Going to step "${selectedItem.nextStepId}" (index: ${nextStepIndex})`);
        }
      }

      // If conditional step, check condition
      if (step.type === 'condition' && step.condition) {
        const variable = step.condition.variable;
        const value = session.responses.get(variable);
        
        const branch = step.condition.branches.find(b => b.value === value);
        if (branch && branch.nextStepId) {
          nextStepIndex = session.workflowSteps.findIndex(s => s.id === branch.nextStepId);
          console.log(`🔀 Condition: ${variable}=${value}, Going to step "${branch.nextStepId}"`);
        } else if (step.condition.defaultNextStepId) {
          nextStepIndex = session.workflowSteps.findIndex(s => s.id === step.condition.defaultNextStepId);
          console.log(`🔀 Condition: Using default branch to step "${step.condition.defaultNextStepId}"`);
        }
      }

      // Advance to next step (either conditional or sequential)
      if (nextStepIndex !== null && nextStepIndex >= 0) {
        session.currentStepIndex = nextStepIndex;
      } else {
        session.advanceStep();
      }
      
      await session.save();

      const hasMore = session.currentStepIndex < session.workflowSteps.length;

      if (hasMore) {
        // Send next step
        await this.sendWorkflowStep(session);
      } else {
        // Workflow complete
        console.log('🎉 Workflow completed! All responses collected.');
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();
        
        await this.sendWorkflowCompletionMessage(session);
      }
      
    } catch (error) {
      console.error('❌ Error handling workflow response:', error);
      throw error;
    }
  }

  /**
   * Check if workflow session has timed out (user not responding)
   * @param {string} sessionId - WorkflowSession ID
   */
  async checkWorkflowTimeout(sessionId) {
    try {
      const session = await WorkflowSession.findById(sessionId);
      
      if (!session || session.status !== 'active') {
        console.log('⚠️ Session not found or not active, skipping timeout check');
        return;
      }

      // Check if user has responded (awaitingResponseSince should be null if they replied)
      if (!session.awaitingResponseSince) {
        console.log('✅ User responded in time, no timeout needed');
        return;
      }

      // Check if timeout has occurred
      if (session.checkTimeout()) {
        console.log('⏰ User did not respond within timeout period, ending workflow');
        
        session.hasTimedOut = true;
        session.status = 'expired';
        session.completedAt = new Date();
        await session.save();

        // Send timeout message
        await this.sendTimeoutMessage(session);
        
        // Save partial lead data (whatever was collected so far)
        console.log('💾 Saved partial lead data:', Object.fromEntries(session.responses));
      }
      
    } catch (error) {
      console.error('❌ Error checking workflow timeout:', error);
    }
  }

  /**
   * Send timeout message when user doesn't respond
   * @param {Object} session - WorkflowSession document
   */
  async sendTimeoutMessage(session) {
    try {
      const message = `Thank you for your time! 🙏\n\nWe noticed you might be busy right now. No worries!\n\nIf you'd like to continue later, just send us a message anytime. We're here to help! 😊`;

      await this.sendTextMessage(
        session.accountId,
        session.phoneNumberId,
        session.contactPhone,
        message,
        { 
          campaign: 'workflow_timeout', 
          sessionId: session._id.toString(),
          partialResponses: Object.fromEntries(session.responses)
        }
      );
      
      console.log('✅ Timeout message sent');
      
    } catch (error) {
      console.error('❌ Error sending timeout message:', error);
    }
  }

  /**
   * Send workflow completion message with collected data
   * @param {Object} session - WorkflowSession document
   */
  async sendWorkflowCompletionMessage(session) {
    try {
      console.log('📊 Workflow completed. Collected data:', Object.fromEntries(session.responses));
      
      // Build summary message
      let summaryText = '✅ *Thank you for completing the form!*\n\n';
      summaryText += '*Your responses:*\n';
      
      for (const [key, value] of session.responses) {
        summaryText += `\n• *${key}*: ${value}`;
      }
      
      summaryText += '\n\nWe have saved your information. Our team will get back to you soon! 🙌';

      // Send summary
      await this.sendTextMessage(
        session.accountId,
        session.phoneNumberId,
        session.contactPhone,
        summaryText,
        { 
          campaign: 'workflow_completed', 
          sessionId: session._id.toString(),
          responses: Object.fromEntries(session.responses)
        }
      );
      
      console.log('✅ Completion message sent');
      
    } catch (error) {
      console.error('❌ Error sending completion message:', error);
    }
  }
}

export default new WhatsAppService();
