/**
 * 🔧 QUICK FIX: Check Conversation ID Format Mismatch
 * Run this AFTER you send a WhatsApp message
 * Watch both backend and frontend logs to see if IDs match
 */

// ============================================
// FRONTEND: Add this to chat/page.tsx (Line 473)
// ============================================

/**
 * BEFORE:
 */
/*
const handleNewMessage = (data: any) => {
  const { conversationId, message } = data;
  console.log('💬 New message received:', conversationId, message);
  
  if (selectedContact?.id === conversationId) {
    setMessages(prev => {
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
    shouldScrollRef.current = true;
  }
};
*/

/**
 * AFTER:
 */
const handleNewMessage = (data) => {
  const { conversationId, message } = data;
  console.log('💬 New message received:', conversationId, message);
  
  // ✅ DEBUG: Log the ID comparison
  console.log('%c🔍 CONVERSATION ID DEBUG', 'color: #ff6b6b; font-weight: bold', {
    broadcastConversationId: conversationId,
    selectedContactId: selectedContact?.id,
    selectedContactPhone: selectedContact?.phone,
    messageFrom: message.recipientPhone,
    messageType: message.messageType,
    match: conversationId === selectedContact?.id,
    timestamp: new Date().toLocaleTimeString()
  });

  if (selectedContact?.id === conversationId) {
    console.log('%c✅ IDs MATCH - Adding message to view', 'color: #51cf66; font-weight: bold');
    setMessages(prev => {
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
    shouldScrollRef.current = true;
  } else {
    console.log('%c❌ IDS DO NOT MATCH - Message NOT added to current view', 'color: #ff6b6b; font-weight: bold');
    console.log('   This message will appear in conversation list but not in chat view');
    
    // Even if IDs don't match, still update conversation list
    setConversations(prev => prev.map(conv => 
      (conv.id === conversationId || conv.phone === message.recipientPhone)
        ? {
            ...conv,
            lastMessage: message.content?.text || '[Media]',
            lastMessageTime: message.createdAt,
            unreadCount: (conv.unreadCount || 0) + 1
          }
        : conv
    ).sort((a, b) => 
      new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
    ));
  }
};

// ============================================
// BACKEND: Check webhook broadcast logs
// ============================================

/**
 * When message arrives, you'll see in backend console:
 * 
 * 🔔🔔🔔 WEBHOOK HIT!
 * Phone Number ID: 1003427786179738
 * Display Phone Number: +1 123 456-7890
 * 
 * 📬 INCOMING MESSAGES
 * From: 923456789012
 * Type: text
 * Content: "Hello world"
 * 
 * Conversation ID: 695a15a5c526dbe7c085ece2_1003427786179738_923456789012
 *                  ↑
 *                  This is the ID that will be broadcast
 * 
 * ✅ Message saved to database
 * 📡 Broadcasting new message: conversation:695a15a5c526dbe7c085ece2_1003427786179738_923456789012
 * 
 */

// ============================================
// HOW TO VERIFY THE FIX WORKS
// ============================================

/**
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Keep dashboard/chat page open
 * 4. Send a message from WhatsApp to your bot
 * 5. Watch console - should see:
 * 
 *    💬 New message received: 695a15a5c526dbe7c085ece2_1003427786179738_923456789012
 *    
 *    🔍 CONVERSATION ID DEBUG
 *    broadcastConversationId: "695a15a5c526dbe7c085ece2_1003427786179738_923456789012"
 *    selectedContactId: "695a15a5c526dbe7c085ece2_1003427786179738_923456789012"
 *    match: true  ← If TRUE, message will appear!
 *    
 *    ✅ IDS MATCH - Adding message to view
 * 
 * 6. If match: false, then IDs don't match and you need to fix the format
 * 
 */

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

/**
 * ISSUE 1: match: false (IDs don't match)
 * 
 * SOLUTION:
 * Check what conversationId API returns:
 * 
 * In conversationController.js, getConversations():
 *   - If it returns MongoDB _id: Update webhook to broadcast with _id instead
 *   - If it returns formatted string: Ensure webhook uses the same format
 * 
 * In webhook line 443:
 *   // Current:
 *   const conversationId = `${accountId}_${phoneNumberId}_${message.from}`;
 *   
 *   // Should match what API returns
 *   // If API returns _id, use:
 *   const conversation = await Conversation.findOne({...});
 *   const conversationId = conversation._id.toString();
 */

/**
 * ISSUE 2: match: true but message still doesn't appear
 * 
 * SOLUTION:
 * 1. Check Socket.io is actually connected:
 *    Look for: "✅ Socket connected: socket_[xxx]"
 * 
 * 2. Check conversation room is joined:
 *    Look for: "📍 Joined conversation room: [id]"
 * 
 * 3. Check broadcast was sent successfully:
 *    Backend should show: "✅ Broadcast new_message successful"
 */

/**
 * ISSUE 3: Messages appear but don't scroll into view
 * 
 * SOLUTION:
 * The shouldScrollRef.current = true flag triggers auto-scroll
 * Check that scroll handler is working:
 * - Frontend has: useEffect(() => { messagesEndRef.current?.scrollIntoView() })
 * - messagesEndRef.current must be attached to last message element
 */

export const FRONTEND_FIX = `
// In frontend/app/dashboard/chat/page.tsx around line 473
// Replace the handleNewMessage function with the enhanced version above
`;

export const TESTING_STEPS = [
  '1. Add the debug logging to chat/page.tsx',
  '2. Save and reload the dashboard',
  '3. Login and go to Live Chat',
  '4. Send a message from WhatsApp',
  '5. Open DevTools Console (F12)',
  '6. Look for the debug log output',
  '7. Check if IDs match',
  '8. If match: true, messages will appear in real-time ✅',
  '9. If match: false, need to fix conversation ID format'
];
