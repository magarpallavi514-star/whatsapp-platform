import Broadcast from '../models/Broadcast.js';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import whatsappService from './whatsappService.js';

export class BroadcastExecutionService {
  constructor() {
    this.THROTTLE_RATES = {
      newPhone: 1,
      youngPhone: 5,
      establishedPhone: 50
    };
  }

  /**
   * Get throttle rate based on phone number age
   */
  async getThrottleRate(phoneConfig) {
    if (!phoneConfig.createdAt) return this.THROTTLE_RATES.establishedPhone;

    const ageInDays = (Date.now() - new Date(phoneConfig.createdAt)) / (1000 * 60 * 60 * 24);

    if (ageInDays < 1) return this.THROTTLE_RATES.newPhone;
    if (ageInDays < 7) return this.THROTTLE_RATES.youngPhone;
    return this.THROTTLE_RATES.establishedPhone;
  }

  /**
   * Execute broadcast with throttling
   */
  async executeBroadcast(accountId, broadcastId, phoneNumberId) {
    const broadcast = await Broadcast.findOne({
      _id: broadcastId,
      accountId
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    if (broadcast.status !== 'running' && broadcast.status !== 'draft') {
      throw new Error(`Cannot execute broadcast with status: ${broadcast.status}`);
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📢 STARTING BROADCAST EXECUTION`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Broadcast ID: ${broadcastId}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`Phone Number ID: ${phoneNumberId}`);
    console.log(`Message Type: ${broadcast.messageType}`);

    // Get all recipients
    const recipients = await this.buildRecipientList(accountId, broadcast.recipients);

    console.log(`Recipients Count: ${recipients.length}\n`);

    if (recipients.length === 0) {
      console.log('⚠️  No recipients found, marking as completed\n');
      broadcast.status = 'completed';
      broadcast.completedAt = new Date();
      await broadcast.save();
      return;
    }

    // Start execution
    broadcast.status = 'running';
    broadcast.stats.inProgress = recipients.length;
    broadcast.stats.pending = recipients.length;
    broadcast.startedAt = new Date();
    await broadcast.save();

    // Process messages with throttling
    const throttleRate = broadcast.throttleRate || 50;
    const messageDelayMs = 1000 / throttleRate;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        // Send message
        await this.sendBroadcastMessage(accountId, phoneNumberId, broadcast, recipient);
        sent++;

        broadcast.stats.sent = sent;
        broadcast.stats.inProgress = recipients.length - i - 1;
        broadcast.stats.pending = recipients.length - sent;
        console.log(`✅ [${i + 1}/${recipients.length}] Message sent to ${recipient}`);

      } catch (error) {
        failed++;
        const errorDetails = {
          phoneNumber: recipient,
          error: error.message,
          errorCode: error.code,
          timestamp: new Date()
        };
        broadcast.errorLog.push(errorDetails);

        broadcast.stats.failed = failed;
        broadcast.stats.inProgress = recipients.length - i - 1;
        broadcast.stats.pending = recipients.length - sent;
        
        console.error(`❌ [${i + 1}/${recipients.length}] Failed to send to ${recipient}: ${error.message}`);
      }

      // Save progress every 10 messages
      if ((i + 1) % 10 === 0) {
        await broadcast.save();
      }

      // Throttling delay
      if (i < recipients.length - 1) {
        await this.sleep(messageDelayMs);
      }
    }

    // Mark as completed
    broadcast.status = 'completed';
    broadcast.completedAt = new Date();
    await broadcast.save();

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ BROADCAST EXECUTION COMPLETED`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Total Sent: ${sent}/${recipients.length}`);
    console.log(`Total Failed: ${failed}/${recipients.length}`);
    console.log(`Success Rate: ${((sent / recipients.length) * 100).toFixed(2)}%`);
    console.log(`${'═'.repeat(60)}\n`);

    return {
      broadcastId: broadcast._id,
      totalSent: sent,
      totalFailed: failed,
      status: 'completed'
    };
  }

  /**
   * Send individual broadcast message
   */
  async sendBroadcastMessage(accountId, phoneNumberId, broadcast, recipientPhone) {
    try {
      let messageId;
      
      // Validate phoneNumberId
      if (!phoneNumberId) {
        throw new Error('Phone number ID is required for broadcast execution');
      }

      // Send based on message type
      if (broadcast.messageType === 'text') {
        const result = await whatsappService.sendTextMessage(
          accountId,
          phoneNumberId,
          recipientPhone,
          broadcast.content.text,
          { broadcastId: broadcast._id.toString() }
        );
        messageId = result.messageId;

      } else if (broadcast.messageType === 'template') {
        const result = await whatsappService.sendTemplateMessage(
          accountId,
          phoneNumberId,
          recipientPhone,
          broadcast.content.templateName,
          broadcast.content.templateParams,
          { broadcastId: broadcast._id.toString() }
        );
        messageId = result.messageId;

      } else if (broadcast.messageType === 'media') {
        const result = await whatsappService.sendMediaMessage(
          accountId,
          phoneNumberId,
          recipientPhone,
          broadcast.content.mediaType,
          broadcast.content.mediaUrl,
          { broadcastId: broadcast._id.toString() }
        );
        messageId = result.messageId;
      }

      // Log message to database
      const message = new Message({
        accountId,
        phoneNumberId,
        messageId,
        senderPhone: '', // Internal sender
        recipientPhone,
        messageType: broadcast.messageType,
        status: 'sent',
        direction: 'outbound',
        broadcastId: broadcast._id,
        content: broadcast.content
      });

      await message.save();

      return { success: true, messageId };

    } catch (error) {
      console.error(`❌ [BROADCAST ERROR] Failed to send to ${recipientPhone}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Type: ${error.response?.status || 'Unknown'}`);
      if (error.response?.data?.error) {
        console.error(`   Details: ${JSON.stringify(error.response.data.error)}`);
      }
      throw error;
    }
  }

  /**
   * Build recipient list
   */
  async buildRecipientList(accountId, recipients) {
    const phoneNumbers = [];

    if (recipients.phoneNumbers) {
      // Filter out null/undefined phone numbers
      const validPhones = recipients.phoneNumbers.filter(p => p && typeof p === 'string' && p.trim());
      phoneNumbers.push(...validPhones);
    }

    if (recipients.contactIds && recipients.contactIds.length > 0) {
      const contacts = await Contact.find({
        _id: { $in: recipients.contactIds },
        accountId
      }).select('phone whatsappNumber');

      // Get phone numbers - prefer whatsappNumber, fallback to phone
      const contactPhones = contacts
        .map(c => c.whatsappNumber || c.phone)
        .filter(p => p && typeof p === 'string' && p.trim());

      phoneNumbers.push(...contactPhones);
    }

    // Filter out any null/undefined values before returning
    const cleanedNumbers = phoneNumbers.filter(p => p && typeof p === 'string' && p.trim());
    return [...new Set(cleanedNumbers)];
  }

  /**
   * Sleep utility for throttling
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Resume interrupted broadcast
   */
  async resumeBroadcast(accountId, broadcastId, phoneNumberId) {
    const broadcast = await Broadcast.findOne({
      _id: broadcastId,
      accountId
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Resume execution from where it left off
    return this.executeBroadcast(accountId, broadcastId, phoneNumberId);
  }
}

export default new BroadcastExecutionService();
