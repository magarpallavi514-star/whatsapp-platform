# Fix: Recent Chats Not Appearing - Conversation Timestamp Update

## Problem
- Users were seeing old conversations (from Jan 5) at the top of their chat list
- Recent messages sent by users were not moving conversations to the top
- Only incoming WhatsApp webhook messages were updating the conversation timestamp

## Root Cause
When messages were **sent from the dashboard**, the `Conversation.lastMessageAt` field was NOT being updated. This field is critical because:
- Conversations are sorted by `lastMessageAt` in descending order
- Without updating this timestamp, conversations remain in their original position
- Only incoming webhook messages were updating the timestamp

## Solution Applied
Updated three message-sending methods in `backend/src/services/whatsappService.js`:

### 1. **sendTextMessage()** 
- After message is saved as "sent", now updates the conversation:
```javascript
const conversationId = `${accountId}_${phoneNumberId}_${cleanPhone}`;
await Conversation.findOneAndUpdate(
  { conversationId },
  {
    $set: {
      lastMessageAt: new Date(),
      lastMessagePreview: messageText.substring(0, 200),
      lastMessageType: 'text',
      status: 'open'
    }
  },
  { upsert: true, new: true }
);
```

### 2. **sendTemplateMessage()**
- Updates conversation with template indicator: `[Template] {templateName}`

### 3. **sendMediaMessage()**
- Updates conversation with media type indicator:
  - 🖼️ Photo (for images)
  - 🎥 Video (for videos)  
  - 📄 Document (for documents)

## Impact
✅ Now when users send messages, conversations immediately move to the top of the inbox list
✅ Conversations stay sorted by latest activity (both incoming and outgoing)
✅ Conversation preview shows latest message type correctly
✅ Real-time updates work for both incoming and outgoing messages

## Verification
To test:
1. Open chat with any contact
2. Send a text message
3. Conversation should move to top of list
4. Check that `lastMessageAt` timestamp is current

## Files Modified
- `backend/src/services/whatsappService.js` - Added Conversation.findOneAndUpdate() in all 3 message-sending methods
