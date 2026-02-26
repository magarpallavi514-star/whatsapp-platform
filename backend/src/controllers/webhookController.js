import axios from 'axios';
import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Contact from '../models/Contact.js';
import PhoneNumber from '../models/PhoneNumber.js';
import Account from '../models/Account.js';
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
 * Fetch phone numbers from Meta API and create PhoneNumber entries
 * Called after OAuth webhook is received with WABA ID
 */
const fetchAndCreatePhoneNumbers = async (wabaId, accountId, accessToken) => {
  try {
    console.log('\n📱 ========== FETCHING PHONE NUMBERS FROM META ==========');
    console.log('WABA ID:', wabaId);
    console.log('Account ID:', accountId);
    console.log('Access Token:', accessToken ? '✅ Present' : '❌ Missing');
    
    if (!accessToken) {
      console.warn('⚠️ No access token available - cannot fetch phone numbers');
      console.warn('   Skipping phone number fetch. User may need to reconnect.');
      return false;
    }
    
    if (!wabaId) {
      console.warn('⚠️ No WABA ID available - cannot fetch phone numbers');
      return false;
    }
    
    // Fetch phone numbers from Meta's /me/phone_numbers endpoint
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,phone_number,quality_rating,name_status,display_phone_number'
        }
      }
    );
    
    const phones = response.data?.data || [];
    console.log(`✅ Fetched ${phones.length} phone number(s) from Meta`);
    
    if (phones.length === 0) {
      console.warn('⚠️ No phone numbers found in Meta for WABA:', wabaId);
      return false;
    }
    
    // Create PhoneNumber entries for each phone
    const createdPhones = [];
    for (const phone of phones) {
      try {
        const phoneNumberId = phone.id;
        
        console.log(`\n  📱 Processing phone: ${phone.display_phone_number || phone.id}`);
        
        // Check if phone already exists for this account
        const existing = await PhoneNumber.findOne({
          accountId,
          phoneNumberId
        });
        
        if (existing) {
          console.log(`     ⚠️ Phone already exists in DB, skipping creation`);
          createdPhones.push(existing);
          continue;
        }
        
        // Create new PhoneNumber entry
        const phoneNumber = await PhoneNumber.create({
          accountId,
          phoneNumberId,
          wabaId,
          accessToken,
          displayPhone: phone.display_phone_number || phoneNumberId,
          displayName: phone.name || 'WhatsApp Business',
          qualityRating: phone.quality_rating || 'unknown',
          verifiedName: phone.name_status || 'Not verified',
          isActive: createdPhones.length === 0, // First phone is active by default
          verifiedAt: new Date()
        });
        
        console.log(`     ✅ Phone number created: ${phoneNumber._id}`);
        createdPhones.push(phoneNumber);
      } catch (phoneError) {
        console.error(`     ❌ Error creating phone number:`, phoneError.message);
        // Continue with next phone instead of failing entire process
        continue;
      }
    }
    
    console.log(`\n✅ Successfully created ${createdPhones.length} phone number entries`);
    console.log('📱 ========== PHONE NUMBER FETCH COMPLETE ==========\n');
    
    return createdPhones.length > 0;
  } catch (error) {
    console.error('❌ Error fetching phone numbers from Meta:', error.message);
    if (error.response?.data) {
      console.error('   Meta API Error:', error.response.data);
    }
    return false;
  }
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
              
              // ✅ CRITICAL FIX: Find account by WABA ID FIRST
              const wabaId = entry.id;  // Meta sends WABA ID as entry.id
              console.log('📍 WABA ID from webhook:', wabaId);
              
              let targetAccountId = null;
              let targetAccount = null;
              
              // Step 1: Find account by WABA ID (PRIMARY)
              const account = await Account.findOne({ wabaId });
              if (account) {
                targetAccountId = account.accountId;  // Use String accountId, not ObjectId
                targetAccount = account;
                console.log('✅ Account found by WABA ID:', targetAccountId);
              } else {
                console.log('⚠️ WABA ID not found in Account:', wabaId);
                // Step 1B: Fallback - find by phoneNumberId (for backward compatibility)
                const fallbackPhone = await PhoneNumber.findOne({ 
                  phoneNumberId,
                  isActive: true 
                });
                if (!fallbackPhone) {
                  console.log('❌ Phone number not configured in system:', phoneNumberId);
                  continue;
                }
                const fallbackAccount = await Account.findById(fallbackPhone.accountId);
                if (!fallbackAccount) {
                  console.log('❌ Account not found for phone config');
                  continue;
                }
                targetAccountId = fallbackPhone.accountId;
                targetAccount = fallbackAccount;
                console.log('⚠️ Using fallback: Found account via phoneNumberId:', targetAccountId);
              }
              
              // Verify we have account
              if (!targetAccountId) {
                console.log('❌ CRITICAL: Could not determine account for message');
                continue;
              }
              
              // Step 2: Get phone config with account verification
              const phoneConfig = await PhoneNumber.findOne({ 
                accountId: targetAccountId,
                phoneNumberId,
                isActive: true 
              }).select('+accessToken');
              
              if (!phoneConfig) {
                console.log('❌ Phone number not configured for this account:', phoneNumberId);
                continue;
              }
              
              const accountId = phoneConfig.accountId;
              console.log('✅ Found account:', accountId);
              console.log('✅ Account type:', typeof accountId, '(should be string)');
              console.log('✅ Account verified with WABA ID:', wabaId);
              console.log('✅ Phone Number ID:', phoneNumberId, '(should be string)');
              
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
                  
                  // ✅ CRITICAL FIX: Create conversation first to get MongoDB _id
                  // This ID will be used for Socket.io broadcasting and must match API format
                  const workspaceId = targetAccount.defaultWorkspaceId || targetAccountId;  // Use default workspace or fallback to account
                  
                  // ✅ USE targetAccountId (verified String from Account lookup) - NOT accountId from phoneConfig
                  const conversationDocId = `${targetAccountId}_${phoneNumberId}_${message.from}`;
                  const conversationDoc = await Conversation.findOneAndUpdate(
                    {
                      accountId: targetAccountId,
                      workspaceId,
                      phoneNumberId,
                      userPhone: message.from
                    },
                    {
                      $setOnInsert: {
                        accountId: targetAccountId,
                        workspaceId,
                        phoneNumberId,
                        userPhone: message.from,
                        conversationId: conversationDocId,
                        startedAt: new Date()
                      },
                      $set: {
                        lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
                        status: 'open'
                      }
                    },
                    { upsert: true, new: true }
                  );
                  
                  // Use MongoDB _id for Socket.io broadcasting
                  const conversationId = conversationDoc._id.toString();
                  console.log('✅ Conversation ID (MongoDB _id):', conversationId);
                  
                  // Upsert or update contact
                  const contactData = {
                    accountId: targetAccountId,  // ✅ Use verified targetAccountId
                    name: senderProfile?.profile?.name || message.from,
                    phone: `+${message.from}`,
                    whatsappNumber: message.from,
                    type: 'customer',
                    isOptedIn: true, // They messaged us first
                    lastMessageAt: new Date()
                  };
                  
                  await Contact.findOneAndUpdate(
                    { accountId: targetAccountId, whatsappNumber: message.from },
                    { 
                      $set: contactData,
                      $inc: { messageCount: 1 }
                    },
                    { upsert: true, new: true }
                  );
                  
                  console.log('✅ Contact created/updated');
                  
                  // Upsert or update conversation
                  let lastMessagePreview = '';
                  
                  if (messageType === 'text') {
                    lastMessagePreview = content.text?.substring(0, 200) || '';
                  } else if (messageType === 'image') {
                    lastMessagePreview = '🖼️ Photo';
                  } else if (messageType === 'video') {
                    lastMessagePreview = '🎥 Video';
                  } else if (messageType === 'audio') {
                    lastMessagePreview = '🎵 Audio Message';
                  } else if (messageType === 'document') {
                    lastMessagePreview = '📄 Document: ' + (content.filename || 'Document');
                  } else {
                    lastMessagePreview = `[${messageType}]`;
                  }
                  
                  // ✅ Update conversation with message preview and unread count
                  const updatedConversation = await Conversation.findByIdAndUpdate(
                    conversationDoc._id,
                    {
                      $set: {
                        lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
                        lastMessagePreview,
                        lastMessageType: messageType,
                        status: 'open'
                      },
                      $inc: { unreadCount: 1 }
                    },
                    { new: true }
                  );
                  
                  console.log('✅ Conversation updated with message preview');
                  
                  // ✅ CRITICAL FIX: Broadcast conversation update to ALL users in account
                  // This ensures conversation list updates in real-time for everyone
                  if (io && updatedConversation) {
                    broadcastConversationUpdate(io, targetAccountId, updatedConversation);
                    console.log('📡 Broadcasted conversation update to account:', targetAccountId);
                  }
                  
                  // Save incoming message to Message collection
                  const inboxMessage = {
                    accountId: targetAccountId,  // ✅ Use verified targetAccountId (CONSISTENT)
                    phoneNumberId,
                    conversationId: conversationDoc._id, // Use MongoDB _id, not formatted string
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
                    // Use MongoDB _id for broadcasting (must match frontend expectations)
                    const broadcastConversationId = conversationDoc._id.toString();
                    const messageObject = savedMessage.toObject();
                    
                    // Ensure createdAt is in ISO format for consistency
                    if (!messageObject.createdAt) {
                      messageObject.createdAt = new Date().toISOString();
                    }
                    
                    // Add conversationId to message for frontend matching
                    messageObject.conversationId = broadcastConversationId;
                    
                    broadcastNewMessage(io, broadcastConversationId, messageObject);
                    console.log('📡 Broadcasted new message via Socket.io:', broadcastConversationId);
                    console.log('   Broadcast Details:', {
                      conversationId: broadcastConversationId,
                      messageId: messageObject._id,
                      from: message.from,
                      timestamp: messageObject.createdAt
                    });
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
          } else if (change.field === 'account_update') {
            console.log('\n🏢 ════════════════════════════════════════════════════════════════');
            console.log('🏢 🎯 ACCOUNT UPDATE WEBHOOK - BUSINESS ID SYNC');
            console.log('🏢 ════════════════════════════════════════════════════════════════\n');
            
            // Extract Business ID from entry.id and WABA ID from webhook data
            const businessId = entry.id;
            const value = change.value;
            
            console.log('📍 📍 📍 CRITICAL: Business ID from webhook entry.id:', businessId);
            console.log('📨 Complete webhook value received:', JSON.stringify(value, null, 2));
            
            // 🔥 CRITICAL: Extract WABA ID from webhook structure
            // Meta sends: waba_info.waba_id
            const wabaId = value.waba_info?.waba_id;
            
            if (!wabaId) {
              console.warn('⚠️ ⚠️ ⚠️ CRITICAL: No WABA ID found in webhook structure');
              console.log('   Expected: value.waba_info.waba_id');
              console.log('   Received:', value);
            } else {
              console.log('✅ ✅ ✅ WABA ID found in webhook:', wabaId);
            }
            
            // 🔥 Store BOTH Business ID and WABA ID from webhook
            // Process even if only one ID is available - webhook will provide what it has
            if (businessId || wabaId) {
              try {
                // Find account - could be by multiple methods
                let account = null;
                
                // 🔥 PRIORITY 1: Check if OAuth stored which account this belongs to
                // OAuth endpoint sets metaSync.accountId when it starts OAuth flow
                console.log('🔍 Step 1: Searching for account that initiated this OAuth flow...');
                let oauthInitiated = await Account.findOne({ 
                  'metaSync.accountId': { $exists: true },
                  'metaSync.status': 'oauth_completed_awaiting_webhook',
                  'metaSync.oauth_timestamp': { $gte: new Date(Date.now() - 10 * 60 * 1000) }  // Last 10 minutes
                }).sort({ 'metaSync.oauth_timestamp': -1 });
                
                // If not found in last 10 mins, try broader time window (30 mins)
                if (!oauthInitiated) {
                  console.log('   ⏱️ Not found in last 10 mins, checking last 30 mins...');
                  oauthInitiated = await Account.findOne({ 
                    'metaSync.accountId': { $exists: true },
                    'metaSync.status': 'oauth_completed_awaiting_webhook',
                    'metaSync.oauth_timestamp': { $gte: new Date(Date.now() - 30 * 60 * 1000) }  // Last 30 minutes
                  }).sort({ 'metaSync.oauth_timestamp': -1 });
                }
                
                if (oauthInitiated) {
                  account = oauthInitiated;
                  console.log(`   ✅ Found account that initiated OAuth: ${account.accountId}`);
                  console.log('      This is the CORRECT account for this webhook!');
                  console.log('      Business ID from webhook:', businessId);
                  console.log('      WABA ID from webhook:', wabaId);
                } else {
                  console.log('   ❌ No account found with metaSync.accountId in last 30 mins');
                }
                
                // 1. Try finding by WABA ID (if already in system)
                if (!account) {
                  console.log('🔍 Step 2: Searching account by existing WABA ID...');
                  account = await Account.findOne({ wabaId });
                  if (account) console.log('   ✅ Found account by WABA ID:', account.accountId);
                }
                
                if (!account) {
                  // 2. Try finding by Business ID (if already stored)
                  console.log('🔍 Step 3: Searching account by existing Business ID...');
                  account = await Account.findOne({ businessId });
                  if (account) console.log('   ✅ Found account by Business ID:', account.accountId);
                }
                
                if (!account) {
                  // 3. Try finding by any phone number in this WABA
                  console.log('🔍 Step 4: Searching account by phone numbers in WABA...');
                  const phoneInWaba = await PhoneNumber.findOne({ wabaId });
                  if (phoneInWaba) {
                    console.log(`   ✅ Found phone in WABA, looking up account ${phoneInWaba.accountId}`);
                    account = await Account.findOne({ accountId: phoneInWaba.accountId });
                  } else {
                    console.log('   ❌ No phones found in WABA');
                  }
                }
                
                if (!account) {
                  // 4a. CRITICAL FALLBACK: Look for accounts marked as "oauth_completed_awaiting_webhook"
                  // These are accounts that just went through OAuth but couldn't fetch WABA from Meta
                  console.log('🔍 Step 5: Searching for account pending OAuth webhook...');
                  account = await Account.findOne({ 
                    'metaSync.status': 'oauth_completed_awaiting_webhook',
                    'metaSync.oauth_timestamp': { $gte: new Date(Date.now() - 30 * 60 * 1000) }  // Last 30 minutes (extended window)
                  }).sort({ 'metaSync.oauth_timestamp': -1 });
                  
                  if (account) {
                    console.log(`   ✅ Found OAuth pending account: ${account.accountId}`);
                    console.log(`   📍 This account just did OAuth and is waiting for webhook`);
                    console.log(`      Webhook WABA ID: ${wabaId}`);
                    console.log(`      → Will UPDATE this account's WABA ID!`);
                  } else {
                    console.log('   ❌ No accounts pending OAuth webhook found (within 30 mins)');
                  }
                }
                
                if (!account) {
                  // 4b. CRITICAL FALLBACK: Look for any account without wabaId (first-time WABA setup)
                  // This handles case where webhook arrives before OAuth completes
                  console.log('🔍 Step 6: Searching for account without wabaId (first-time setup)...');
                  account = await Account.findOne({ 
                    wabaId: { $exists: false }
                  }).sort({ createdAt: -1 });
                  
                  if (account) {
                    console.log(`   ✅ Found account without wabaId: ${account.accountId}`);
                    console.log(`      → This is likely first-time WABA connection for this account!`);
                  } else {
                    console.log('   ❌ No accounts without wabaId found');
                  }
                }
                
                if (account) {
                  console.log('\n✅ ✅ ✅ ACCOUNT FOUND! Now saving Business ID & WABA ID...\n');
                  
                  // ✅ CRITICAL: Migrate phone numbers from temporary account to real account
                  // If this account didn't initiate OAuth (found by WABA/Business ID), check if phones exist elsewhere
                  if (!oauthInitiated && wabaId) {
                    console.log('\n🔄 MIGRATING PHONE NUMBERS FROM TEMPORARY ACCOUNT...');
                    
                    // Find phones with this WABA ID that might be under a temporary account
                    const phonesWithThisWaba = await PhoneNumber.find({ wabaId });
                    
                    if (phonesWithThisWaba && phonesWithThisWaba.length > 0) {
                      console.log(`   Found ${phonesWithThisWaba.length} phone number(s) with WABA ${wabaId}`);
                      
                      // Check if they belong to a different account
                      for (const phone of phonesWithThisWaba) {
                        if (phone.accountId !== account.accountId) {
                          console.log(`   ⚠️  Phone ${phone.displayPhone} is under account ${phone.accountId}, not ${account.accountId}`);
                          console.log(`   📱 Migrating phone number ${phone.phoneNumberId}...`);
                          
                          // Migrate the phone number to the correct account
                          phone.accountId = account.accountId;
                          await phone.save();
                          
                          console.log(`   ✅ Phone migrated to account ${account.accountId}`);
                        }
                      }
                      console.log('   ✅ Phone number migration complete\n');
                    }
                  }
                  
                  // ✅ Found account - save BOTH IDs
                  account.wabaId = wabaId;  // Save WABA ID
                  account.businessId = businessId;  // Save Business ID
                  
                  console.log('💾 Setting account fields:');
                  console.log(`   accountId: ${account.accountId}`);
                  console.log(`   wabaId: ${wabaId}`);
                  console.log(`   businessId: ${businessId}`);
                  
                  // Store complete webhook data
                  if (!account.metaSync) {
                    account.metaSync = {};
                  }
                  account.metaSync.webhookData = value;
                  account.metaSync.lastWebhookAt = new Date();
                  account.metaSync.isSynced = true;
                  account.metaSync.metaStatus = value.status || 'active';
                  account.metaSync.status = 'fully_synced';  // ✅ Clear the "awaiting" status
                  
                  // Extract individual fields if provided
                  if (value.messaging_product) {
                    console.log('📦 Messaging Product:', value.messaging_product);
                  }
                  if (value.waba_subscription_status) {
                    console.log('📊 WABA Subscription Status:', value.waba_subscription_status);
                  }
                  if (value.account_review_status) {
                    console.log('🔍 Account Review Status:', value.account_review_status);
                  }
                  if (value.phone_numbers) {
                    console.log('📱 Phone Numbers in webhook:', value.phone_numbers);
                  }
                  
                  console.log('\n💾 SAVING ACCOUNT TO DATABASE...');
                  console.log('  Before save:');
                  console.log('    account._id:', account._id);
                  console.log('    account.accountId:', account.accountId);
                  console.log('    account.wabaId:', account.wabaId);
                  console.log('    account.businessId:', account.businessId);
                  
                  await account.save();
                  
                  console.log('\n✅ SAVE COMPLETE - Verifying...');
                  // Re-fetch to confirm it saved
                  const saved = await Account.findById(account._id);
                  console.log('  After save (refetch):');
                  console.log('    account._id:', saved._id);
                  console.log('    account.accountId:', saved.accountId);
                  console.log('    account.wabaId:', saved.wabaId);
                  console.log('    account.businessId:', saved.businessId);
                  
                  console.log('\n✅ ✅ ✅ 🎯 ACCOUNT FULLY SYNCED WITH META:\n', {
                    accountId: saved.accountId,
                    wabaId: saved.wabaId,
                    businessId: saved.businessId,
                    metaStatus: saved.metaSync.metaStatus,
                    syncedAt: saved.metaSync.lastWebhookAt
                  });
                  
                  // 🚀 NEW: Fetch phone numbers from Meta API
                  console.log('\n🚀 NOW FETCHING PHONE NUMBERS FROM META API...');
                  const accessToken = saved.metaSync?.oauthAccessToken;
                  const phonesFetched = await fetchAndCreatePhoneNumbers(
                    saved.wabaId,
                    saved.accountId,
                    accessToken
                  );
                  
                  if (phonesFetched) {
                    console.log('\n🟢 ✅ PHONE NUMBERS AUTOMATICALLY FETCHED AND CREATED!');
                    console.log('   User will see phone numbers immediately when refreshing Settings page');
                  } else {
                    console.warn('\n⚠️ Phone numbers could not be fetched automatically');
                    console.warn('   Possible reasons:');
                    console.warn('   - No access token stored (OAuth might be incomplete)');
                    console.warn('   - Meta API temporarily unavailable');
                    console.warn('   - No phone numbers in this WABA yet');
                    console.warn('\n   User can manually add phone numbers in Settings > Add Phone Number');
                  }
                  
                  console.log('\n🟢 BUSINESS ID SYNC COMPLETE - READY FOR REALTIME!\n');
                  
                } else {
                  console.warn('\n⚠️ ⚠️ ⚠️ ACCOUNT NOT FOUND - Cannot link webhook to account');
                  console.warn('   Searched by:');
                  console.warn('   1. wabaId');
                  console.warn('   2. businessId');
                  console.warn('   3. phone numbers in WABA');
                  console.warn('   4. OAuth pending status (metaSync.status="oauth_completed_awaiting_webhook")');
                  console.warn('   5. account without wabaId');
                  console.warn('\n   💡 Possible reasons:');
                  console.warn('   - OAuth hasnt completed yet (code not exchanged)');
                  console.warn('   - Client account not created in database');
                  console.warn('   - Multiple OAuth flows happening simultaneously');
                  console.warn('   - Webhook received before OAuth completes');
                  console.log('\n   🔧 Next steps:');
                  console.log('   - Try OAuth flow again');
                  console.log('   - Check if account was created during login\n');
                }
              } catch (storageError) {
                console.error('❌ ❌ ❌ Error storing Meta account details:', storageError.message);
                console.error('Stack:', storageError.stack);
              }
            } else {
              console.warn('\n⚠️ ⚠️ ⚠️ Missing BOTH Business ID and WABA ID in webhook:', { businessId, wabaId });
              console.warn('   This is unusual - check webhook payload');

            }
            
            console.log('🏢 ════════════════════════════════════════════════════════════════\n');
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
