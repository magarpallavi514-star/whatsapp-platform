#!/usr/bin/env node
/**
 * 🧪 TEST REAL-TIME SYNC - Verify the fix works
 * 
 * This script helps you verify that:
 * 1. API returns correct conversationId format
 * 2. Webhook broadcasts with same format
 * 3. Frontend receives and displays messages in real-time
 */

console.log('\n' + '═'.repeat(80));
console.log('🧪 REAL-TIME SYNC VERIFICATION - Step by Step');
console.log('═'.repeat(80) + '\n');

console.log('📋 VERIFICATION CHECKLIST:\n');

console.log('✅ STEP 1: API Response Format');
console.log('   Command to test:');
console.log('   curl http://localhost:5050/api/conversations \\');
console.log('     -H "Authorization: Bearer YOUR_JWT_TOKEN"');
console.log('');
console.log('   Expected response should include:');
console.log('   {');
console.log('     "success": true,');
console.log('     "conversations": [');
console.log('       {');
console.log('         "_id": "695a15a5c526dbe7c085ece2",');
console.log('         "conversationId": "695a15a5c526dbe7c085ece2",  ← NEW FIELD');
console.log('         "phoneNumberId": "1003427786179738",');
console.log('         "customerNumber": "923456789012",');
console.log('         "lastMessageAt": "2026-01-25T10:30:00.000Z",');
console.log('         ...');
console.log('       }');
console.log('     ]');
console.log('   }');
console.log('');

console.log('✅ STEP 2: Webhook Broadcasting');
console.log('   When a message arrives, check BACKEND console for:');
console.log('');
console.log('   ✅ Conversation ID (MongoDB _id): 695a15a5c526dbe7c085ece2');
console.log('   📡 Broadcasting new message: conversation:695a15a5c526dbe7c085ece2');
console.log('   ✅ Broadcast new_message successful');
console.log('');
console.log('   If you see different formats, check:');
console.log('   - File: backend/src/controllers/webhookController.js');
console.log('   - Line ~443: const conversationId = conversationDoc._id.toString()');
console.log('');

console.log('✅ STEP 3: Frontend Reception');
console.log('   When a message arrives, check FRONTEND console (F12) for:');
console.log('');
console.log('   %c🔍 CONVERSATION ID DEBUG - 695a15a5c526dbe7c085ece2');
console.log('   broadcastConversationId: "695a15a5c526dbe7c085ece2"');
console.log('   selectedContactId: "695a15a5c526dbe7c085ece2"');
console.log('   match: true  ← MUST BE TRUE!');
console.log('   ✅ IDS MATCH - Adding message to view');
console.log('');
console.log('   If match: false, check:');
console.log('   - File: frontend/app/dashboard/chat/page.tsx');
console.log('   - Line ~475: Check that selectedContact.id gets "conversationId" from API');
console.log('');

console.log('✅ STEP 4: UI Display');
console.log('   Expected behavior:');
console.log('   - Message appears in chat within 1-2 seconds');
console.log('   - No page refresh needed');
console.log('   - Works just like WATI');
console.log('');

console.log('═'.repeat(80) + '\n');

console.log('🚀 HOW TO TEST:\n');

console.log('1. Start backend:');
console.log('   cd backend && npm run dev');
console.log('');

console.log('2. Open dashboard in browser:');
console.log('   http://localhost:3000/dashboard/chat');
console.log('');

console.log('3. Open DevTools:');
console.log('   Press F12 or Cmd+Option+I');
console.log('');

console.log('4. Go to Console tab and clear it');
console.log('');

console.log('5. Select a conversation from the list');
console.log('');

console.log('6. Send a message from WhatsApp to your bot');
console.log('');

console.log('7. Watch the console - you should see:');
console.log('');
console.log('   BACKEND console (where npm run dev is running):');
console.log('   🔔🔔🔔 WEBHOOK HIT!');
console.log('   ✅ Conversation ID (MongoDB _id): 695a15a5...');
console.log('   📡 Broadcasting new message via Socket.io');
console.log('   ✅ Broadcast new_message successful');
console.log('');
console.log('   FRONTEND console (in browser):');
console.log('   💬 New message received: 695a15a5...');
console.log('   🔍 CONVERSATION ID DEBUG');
console.log('      broadcastConversationId: "695a15a5..."');
console.log('      selectedContactId: "695a15a5..."');
console.log('      match: true ✅');
console.log('   ✅ IDS MATCH - Adding message to view');
console.log('');

console.log('8. The message should appear in the chat instantly!');
console.log('');

console.log('═'.repeat(80) + '\n');

console.log('❌ TROUBLESHOOTING:\n');

console.log('Issue 1: Match shows FALSE');
console.log('Cause: selectedContact.id format doesn\'t match broadcast conversationId');
console.log('Solution: Check that API returns the "conversationId" field');
console.log('Fix: conversationController.js line ~30 should format conversations');
console.log('');

console.log('Issue 2: No socket events in console');
console.log('Cause: Socket.io not connected or not listening');
console.log('Solution: Check browser console for "✅ Socket connected"');
console.log('If missing: Check that initSocket() is called in useEffect');
console.log('');

console.log('Issue 3: Message appears in list but not in chat');
console.log('Cause: Conversation room not joined properly');
console.log('Solution: Check console for "📍 Joined conversation room"');
console.log('If missing: joinConversation() may not be called');
console.log('');

console.log('Issue 4: Backend shows broadcast but frontend doesn\'t receive');
console.log('Cause: Socket.io connection issue or CORS problem');
console.log('Solution: Check network tab for WebSocket or XHR connections');
console.log('');

console.log('═'.repeat(80) + '\n');

console.log('✨ EXPECTED RESULT (After Fix):\n');

console.log('Customer sends: "Hello, how can you help?"');
console.log('                    ↓');
console.log('                  1 second');
console.log('                    ↓');
console.log('Message appears in dashboard chat');
console.log('Your team can reply immediately');
console.log('Customer sees reply on WhatsApp');
console.log('');
console.log('Result: ✨ REAL-TIME SYNC LIKE WATI ✨');
console.log('');

console.log('═'.repeat(80) + '\n');
