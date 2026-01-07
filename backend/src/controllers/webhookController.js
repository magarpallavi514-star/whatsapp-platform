import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Contact from '../models/Contact.js';
import PhoneNumber from '../models/PhoneNumber.js';
import { downloadAndUploadMedia, getMediaTypeFromMime } from '../services/s3Service.js';
import { broadcastNewMessage, broadcastConversationUpdate } from '../services/socketService.js';

/**
 * Webhook Controller for WhatsApp Cloud API
 * Handles verification, incoming messages, and status updates
 */

// Socket.io instance (passed from app.js)
let io = null;

export const setSocketIO = (socketIOInstance) => {
  io = socketIOInstance;
};

/**
 * GET /api/webhooks/whatsapp - Webhook Verification
 * Meta calls this to verify your webhook endpoint
 */
export const verifyWebhook = (req, res) => {
  console.log('\n🔐 ========== WEBHOOK VERIFICATION ==========');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'pixels_webhook_secret_2025';
  
  console.log('Mode:', mode);
  console.log('Received Token:', token);
  console.log('Expected Token:', VERIFY_TOKEN);
  console.log('Challenge:', challenge);
  console.log('Match:', token === VERIFY_TOKEN ? '✅ YES' : '❌ NO');
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    console.log('Responding with challenge:', challenge);
    console.log('==========================================\n');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification FAILED!');
    console.log('Responding with 403 Forbidden');
    console.log('==========================================\n');
    res.sendStatus(403);
  }
};

/**
 * POST /api/webhooks/whatsapp - Webhook Handler
 * Receives incoming messages and status updates from WhatsApp
 */
export const handleWebhook = async (req, res) => {
  console.log('\n🔔🔔🔔 WEBHOOK HIT! 🔔🔔🔔 Timestamp:', new Date().toISOString());
  
  try {
    const body = req.body;
    
    console.log('📥 ========== WEBHOOK RECEIVED ==========');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Full Body:', JSON.stringify(body, null, 2));
    
    // Acknowledge receipt immediately (CRITICAL for Meta)
    res.sendStatus(200);
    
    // Process webhook data asynchronously
    if (body.object === 'whatsapp_business_account') {
      console.log('✅ Valid WhatsApp webhook object');
      
      for (const entry of body.entry) {
        console.log('📦 Processing entry:', entry.id);
        
        for (const change of entry.changes) {
          console.log('🔄 Change field:', change.field);
          
          if (change.field === 'messages') {
            const value = change.value;
            console.log('📨 Messages value:', JSON.stringify(value, null, 2));
            
            // ========== HANDLE STATUS UPDATES ==========
            if (value.statuses) {
              console.log(`🔔 ${value.statuses.length} status update(s) received`);
              
              for (const statusUpdate of value.statuses) {
                console.log('📊 ========== STATUS UPDATE DETAILS ==========');
                console.log('  - Message ID:', statusUpdate.id);
                console.log('  - Status:', statusUpdate.status);
                console.log('  - Timestamp:', statusUpdate.timestamp);
                console.log('  - Recipient ID:', statusUpdate.recipient_id);
                
                if (statusUpdate.errors && statusUpdate.errors.length > 0) {
                  console.log('  - Errors:', JSON.stringify(statusUpdate.errors, null, 2));
                }
                
                if (statusUpdate.status === 'failed') {
                  console.log('  🔍 ========== FAILURE ANALYSIS ==========');
                  console.log('  Possible reasons for failure:');
                  console.log('  1. Phone number not on WhatsApp');
                  console.log('  2. Invalid phone number format');
                  console.log('  3. 24-hour messaging window expired');
                  console.log('  4. Account quality/rate limiting');
                  console.log('  5. Template message required');
                  console.log('  =========================================');
                }
                
                console.log('===============================================');
                
                // Update message status in database
                await whatsappService.handleStatusUpdate(
                  statusUpdate.id,
                  statusUpdate.status,
                  statusUpdate.timestamp,
                  statusUpdate.errors?.[0] || {}
                );
                
                console.log(`✅ Status updated in database: ${statusUpdate.status}`);
              }
            } else {
              console.log('⚠️ No status updates in this webhook');
            }
            
            // ========== HANDLE INCOMING MESSAGES ==========
            if (value.messages) {
              console.log('📬 ========== INCOMING MESSAGES ==========');
              console.log(`Number of messages: ${value.messages.length}`);
              
              // Get phone number ID from metadata
              const phoneNumberId = value.metadata?.phone_number_id;
              const displayPhoneNumber = value.metadata?.display_phone_number;
              
              console.log('Phone Number ID:', phoneNumberId);
              console.log('Display Phone Number:', displayPhoneNumber);
              
              if (!phoneNumberId) {
                console.log('❌ No phone number ID in webhook - cannot process');
                continue;
              }
              
              // Find which account this phone belongs to
              // CRITICAL: Must use .select('+accessToken') to retrieve encrypted field
              const phoneConfig = await PhoneNumber.findOne({ 
                phoneNumberId,
                isActive: true 
              }).select('+accessToken');
              
              if (!phoneConfig) {
                console.log('❌ Phone number not configured in system:', phoneNumberId);
                continue;
              }
              
              const accountId = phoneConfig.accountId;
              console.log('✅ Found account:', accountId);
              
              // Debug: Verify token is present (log length, not the actual token)
              if (!phoneConfig.accessToken) {
                console.error('❌ CRITICAL: accessToken is undefined! Cannot download media.');
              } else {
                console.log(`✅ Access token loaded (length: ${phoneConfig.accessToken.length} chars)`);
              }
              
              // Get sender profile info from contacts (if available)
              const senderProfile = value.contacts?.[0];
              console.log('Sender Profile:', senderProfile);
              
              for (const message of value.messages) {
                try {
                  console.log('\n--- Processing Message ---');
                  console.log('Message ID:', message.id);
                  console.log('From:', message.from);
                  console.log('Type:', message.type);
                  console.log('Timestamp:', message.timestamp);
                  
                  // Extract message content based on type
                  let messageType = message.type;
                  let content = {};
                  
                  switch (message.type) {
                    case 'text':
                      content = { text: message.text.body };
                      console.log('Text:', message.text.body);
                      break;
                    case 'image':
                      content = {
                        mediaId: message.image.id,
                        mimeType: message.image.mime_type,
                        caption: message.image.caption || null
                      };
                      console.log('Image ID:', message.image.id);
                      
                      // Download and upload to S3
                      try {
                        console.log('📥 Downloading image from WhatsApp and uploading to S3...');
                        const mediaData = await downloadAndUploadMedia(
                          message.image.id,
                          phoneConfig.accessToken,
                          accountId,
                          'image'
                        );
                        
                        content.mediaUrl = mediaData.s3Url;
                        content.s3Key = mediaData.s3Key;
                        content.filename = mediaData.filename;
                        content.fileSize = mediaData.fileSize;
                        content.sha256 = mediaData.sha256;
                        content.mediaType = 'image';
                        
                        console.log('✅ Image saved to S3:', mediaData.s3Url);
                      } catch (mediaError) {
                        console.error('❌ Failed to download/upload image:', mediaError.message);
                        // Continue processing even if media fails
                      }
                      break;
                    case 'document':
                      content = {
                        mediaId: message.document.id,
                        mimeType: message.document.mime_type,
                        filename: message.document.filename,
                        caption: message.document.caption || null
                      };
                      console.log('Document:', message.document.filename);
                      
                      // Download and upload to S3
                      try {
                        console.log('📥 Downloading document from WhatsApp and uploading to S3...');
                        const mediaData = await downloadAndUploadMedia(
                          message.document.id,
                          phoneConfig.accessToken,
                          accountId,
                          'document'
                        );
                        
                        content.mediaUrl = mediaData.s3Url;
                        content.s3Key = mediaData.s3Key;
                        content.filename = mediaData.filename;
                        content.fileSize = mediaData.fileSize;
                        content.sha256 = mediaData.sha256;
                        content.mediaType = 'document';
                        
                        console.log('✅ Document saved to S3:', mediaData.s3Url);
                      } catch (mediaError) {
                        console.error('❌ Failed to download/upload document:', mediaError.message);
                      }
                      break;
                    case 'audio':
                      content = {
                        mediaId: message.audio.id,
                        mimeType: message.audio.mime_type
                      };
                      console.log('Audio ID:', message.audio.id);
                      
                      // Download and upload to S3
                      try {
                        console.log('📥 Downloading audio from WhatsApp and uploading to S3...');
                        const mediaData = await downloadAndUploadMedia(
                          message.audio.id,
                          phoneConfig.accessToken,
                          accountId,
                          'audio'
                        );
                        
                        content.mediaUrl = mediaData.s3Url;
                        content.s3Key = mediaData.s3Key;
                        content.filename = mediaData.filename;
                        content.fileSize = mediaData.fileSize;
                        content.sha256 = mediaData.sha256;
                        content.mediaType = 'audio';
                        
                        console.log('✅ Audio saved to S3:', mediaData.s3Url);
                      } catch (mediaError) {
                        console.error('❌ Failed to download/upload audio:', mediaError.message);
                      }
                      break;
                    case 'video':
                      content = {
                        mediaId: message.video.id,
                        mimeType: message.video.mime_type,
                        caption: message.video.caption || null
                      };
                      console.log('Video ID:', message.video.id);
                      
                      // Download and upload to S3
                      try {
                        console.log('📥 Downloading video from WhatsApp and uploading to S3...');
                        const mediaData = await downloadAndUploadMedia(
                          message.video.id,
                          phoneConfig.accessToken,
                          accountId,
                          'video'
                        );
                        
                        content.mediaUrl = mediaData.s3Url;
                        content.s3Key = mediaData.s3Key;
                        content.filename = mediaData.filename;
                        content.fileSize = mediaData.fileSize;
                        content.sha256 = mediaData.sha256;
                        content.mediaType = 'video';
                        
                        console.log('✅ Video saved to S3:', mediaData.s3Url);
                      } catch (mediaError) {
                        console.error('❌ Failed to download/upload video:', mediaError.message);
                      }
                      break;
                    case 'location':
                      content = {
                        latitude: message.location.latitude,
                        longitude: message.location.longitude,
                        address: message.location.address,
                        name: message.location.name
                      };
                      console.log('Location:', content);
                      break;
                    case 'interactive':
                      if (message.interactive.type === 'button_reply') {
                        content = {
                          interactiveType: 'button_reply',
                          buttonId: message.interactive.button_reply.id,
                          buttonText: message.interactive.button_reply.title
                        };
                      } else if (message.interactive.type === 'list_reply') {
                        content = {
                          interactiveType: 'list_reply',
                          listId: message.interactive.list_reply.id,
                          listTitle: message.interactive.list_reply.title,
                          listDescription: message.interactive.list_reply.description
                        };
                      }
                      console.log('Interactive:', content);
                      break;
                    default:
                      console.log('⚠️ Unsupported message type:', message.type);
                      content = { raw: message };
                  }
                  
                  // Create conversation ID (unique per sender + account + phone)
                  const conversationId = `${accountId}_${phoneNumberId}_${message.from}`;
                  console.log('Conversation ID:', conversationId);
                  
                  // Upsert or update contact
                  const contactData = {
                    accountId,
                    name: senderProfile?.profile?.name || message.from,
                    phone: `+${message.from}`,
                    whatsappNumber: message.from,
                    type: 'customer',
                    isOptedIn: true, // They messaged us first
                    lastMessageAt: new Date()
                  };
                  
                  await Contact.findOneAndUpdate(
                    { accountId, whatsappNumber: message.from },
                    { 
                      $set: contactData,
                      $inc: { messageCount: 1 }
                    },
                    { upsert: true, new: true }
                  );
                  
                  console.log('✅ Contact created/updated');
                  
                  // Upsert or update conversation
                  const lastMessagePreview = messageType === 'text' 
                    ? (content.text?.substring(0, 200) || '')
                    : `[${messageType}]`;
                  
                  await Conversation.findOneAndUpdate(
                    { conversationId },
                    {
                      $set: {
                        accountId,
                        phoneNumberId,
                        userPhone: message.from,
                        userName: senderProfile?.profile?.name || null,
                        userProfileName: senderProfile?.profile?.name || null,
                        lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
                        lastMessagePreview,
                        lastMessageType: messageType,
                        status: 'open'
                      },
                      $inc: { unreadCount: 1 }
                    },
                    { upsert: true, new: true }
                  );
                  
                  console.log('✅ Conversation created/updated');
                  
                  // Save incoming message to Message collection
                  const inboxMessage = {
                    accountId,
                    phoneNumberId,
                    waMessageId: message.id,
                    recipientPhone: message.from, // Sender is recipient in our records
                    recipientName: senderProfile?.profile?.name || null,
                    messageType,
                    content,
                    status: 'delivered', // Incoming messages are already delivered
                    direction: 'inbound',
                    sentAt: new Date(parseInt(message.timestamp) * 1000),
                    deliveredAt: new Date(parseInt(message.timestamp) * 1000)
                  };
                  
                  const savedMessage = await Message.create(inboxMessage);
                  console.log('✅ Saved incoming message to database:', savedMessage._id);
                  
                  // Broadcast new message via Socket.io for real-time updates
                  if (io) {
                    const conversationId = `${accountId}_${phoneNumberId}_${message.from}`;
                    const messageObject = savedMessage.toObject();
                    
                    // Ensure createdAt is in ISO format for consistency
                    if (!messageObject.createdAt) {
                      messageObject.createdAt = new Date().toISOString();
                    }
                    
                    broadcastNewMessage(io, conversationId, messageObject);
                    console.log('📡 Broadcasted new message via Socket.io:', conversationId);
                    console.log('   Message timestamp:', messageObject.createdAt);
                  }
                  
                  // Check for keyword auto-reply or workflow response
                  if (message.type === 'text' && content.text) {
                    console.log('🔍 Checking keyword rules...');
                    await whatsappService.processIncomingMessage(
                      accountId,
                      phoneNumberId,
                      message.from,
                      content.text
                    );
                  } else if (message.type === 'interactive' && content.interactiveType === 'button_reply') {
                    console.log('🔘 Processing button click...');
                    await whatsappService.processIncomingMessage(
                      accountId,
                      phoneNumberId,
                      message.from,
                      content.buttonText,
                      { buttonId: content.buttonId } // Pass button ID for URL lookup
                    );
                  }
                  
                } catch (messageError) {
                  console.error('❌ Error processing incoming message:', messageError);
                  console.error('Message data:', JSON.stringify(message, null, 2));
                }
              }
              
              console.log('========== INCOMING MESSAGES PROCESSED ==========');
            } else {
              console.log('⚠️ No incoming messages in this webhook');
            }
          } else {
            console.log('ℹ️ Ignoring field:', change.field);
          }
        }
      }
    } else {
      console.log('⚠️ Unknown webhook object type:', body.object);
    }
    
    console.log('========== WEBHOOK PROCESSING COMPLETE ==========\n');
    
  } catch (error) {
    console.error('❌ ========== WEBHOOK ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
  }
};

export default {
  verifyWebhook,
  handleWebhook
};
