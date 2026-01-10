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

    // Get all recipients
    const recipients = await this.buildRecipientList(accountId, broadcast.recipients);

    if (recipients.length === 0) {
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

      } catch (error) {
        failed++;
        broadcast.errorLog.push({
          phoneNumber: recipient,
          error: error.message,
          timestamp: new Date()
        });

        broadcast.stats.failed = failed;
        broadcast.stats.inProgress = recipients.length - i - 1;
        broadcast.stats.pending = recipients.length - sent;
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
        messageId = result.messages[0].id;

      } else if (broadcast.messageType === 'template') {
        const result = await whatsappService.sendTemplateMessage(
          accountId,
          phoneNumberId,
          recipientPhone,
          broadcast.content.templateName,
          broadcast.content.templateParams,
          { broadcastId: broadcast._id.toString() }
        );
        messageId = result.messages[0].id;

      } else if (broadcast.messageType === 'media') {
        const result = await whatsappService.sendMediaMessage(
          accountId,
          phoneNumberId,
          recipientPhone,
          broadcast.content.mediaType,
          broadcast.content.mediaUrl,
          { broadcastId: broadcast._id.toString() }
        );
        messageId = result.messages[0].id;
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
      console.error(`Failed to send broadcast to ${recipientPhone}:`, error);
      throw error;
    }
  }

  /**
   * Build recipient list
   */
  async buildRecipientList(accountId, recipients) {
    const phoneNumbers = [];

    if (recipients.phoneNumbers) {
      phoneNumbers.push(...recipients.phoneNumbers);
    }

    if (recipients.contactIds && recipients.contactIds.length > 0) {
      const contacts = await Contact.find({
        _id: { $in: recipients.contactIds },
        accountId
      }).select('phoneNumber');

      phoneNumbers.push(...contacts.map(c => c.phoneNumber));
    }

    return [...new Set(phoneNumbers)];
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
