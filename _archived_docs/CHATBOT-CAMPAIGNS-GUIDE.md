# Chatbot & Campaigns System - Complete Guide

## 🤖 CHATBOT SYSTEM (Autobot/Workflows)

### What is it?
Automated keyword-based responses and multi-step conversation workflows that respond to incoming messages without human intervention.

### Features Available:

#### 1. **Keyword Matching**
- Match incoming messages by keywords
- 3 matching types:
  - **Exact**: Message must be exactly "hello"
  - **Contains**: Message contains "hello" anywhere
  - **Starts with**: Message starts with "hello"

#### 2. **Reply Types** (3 options for each keyword rule)

**a) Text Reply**
- Send simple text response automatically
- Example: User sends "help" → Bot replies "Our support team will assist you"

**b) Template Reply**
- Send pre-designed WhatsApp template messages
- Supports template parameters
- Example: Send invoice template with customer name

**c) Workflow Reply** ⭐ (Most Powerful)
- Multi-step conversational flows
- Features:
  - **Text steps**: Send text messages
  - **Button responses**: Create interactive button menus
  - **List menus**: Create list selection menus
  - **Data collection**: Ask questions and save responses
  - **Conditional branching**: Different paths based on user choices
  - **Calendar booking**: Schedule appointments
  - **Forms**: Collect structured data
  - **Delays**: Pause between steps (wait 2 seconds, then ask next question)

#### 3. **Workflow Example**
```
Step 1: Bot asks "What is your issue?"
  ↓
Step 2: User clicks button (e.g., "Billing", "Technical", "Other")
  ↓
Step 3: Based on choice, bot branches to different workflows
  - If "Billing" → Ask for invoice number, save to database
  - If "Technical" → Collect error details
  - If "Other" → Route to human support
  ↓
Step 4: Send confirmation message
```

#### 4. **Stats & Monitoring**
- Track trigger count (how many times rule was activated)
- Success rate (how many users completed the workflow)
- Last triggered time
- Active/Inactive status toggle

#### 5. **Cooldown Feature**
- Prevents same rule triggering twice within 60 minutes
- Prevents annoying repeat responses

#### 6. **Active Workflow Sessions**
- When user enters a workflow, a session is created
- If user sends another message, bot knows they're in workflow
- Processes response in workflow context (not checking other rules)
- Session timeout: 1 minute (can be customized)

---

## 📢 CAMPAIGNS SYSTEM

### What is it?
Scheduled mass messaging to send messages to multiple contacts at once, with different campaign types and detailed analytics.

### Campaign Types:

#### 1. **Broadcast Campaign** 📤
- Send same message to many contacts
- One-time send
- Use cases: Announcements, notifications, updates
- Example: "New product launch!" sent to all customers

#### 2. **Drip Campaign** 💧
- Series of messages sent over time
- Scheduled messages
- Use cases: Welcome sequences, nurture campaigns
- Example: Day 1 send welcome, Day 3 send guide, Day 7 send offer

#### 3. **Automation Campaign** 🔄
- Triggered by user actions
- Send when conditions are met
- Use cases: Order confirmations, reminder sequences
- Example: Send invoice when customer orders, send reminder after 3 days

#### 4. **A/B Test Campaign** 🧪
- Split test two message versions
- See which one performs better
- Use cases: Test subject lines, test message content
- Example: Send Version A to 50% of contacts, Version B to 50%, compare results

### Campaign Audience:
- By **Contacts List** (select specific contacts)
- By **Segments** (based on customer attributes)
- By **Tags** (customers with specific tags)
- **All contacts** (broadcast to entire database)

### Campaign Targeting:
- Filter by phone number
- Filter by tags
- Filter by customer status (active, inactive, opted-in)
- Estimated reach (shows how many contacts will get it)

### Campaign Status:
- **Draft**: Saved but not started
- **Scheduled**: Set to send at specific time
- **Running**: Currently being sent
- **Paused**: Temporarily stopped
- **Completed**: Finished sending
- **Failed**: Had errors during send

### Campaign Analytics:
- **Delivery Rate**: % of messages successfully delivered
- **Open Rate**: % of users who opened the message
- **Click Rate**: % of users who clicked links
- **Conversion Rate**: % who completed desired action
- **Recipient Tracking**: Total, Sent, Failed, Pending counts
- **Visual Stats**: Charts showing performance over time

### Detailed Metrics Tracked:
```
Recipients: 1000 total
├── Sent: 980 ✅
├── Failed: 15 ❌
└── Pending: 5 ⏳

Engagement:
├── Delivered: 950 (96.9%)
├── Opened: 720 (75.8%)
├── Clicked: 450 (47.4%)
└── Converted: 180 (18.9%)
```

---

## 🔄 HOW THEY WORK TOGETHER

### Chatbot (Immediate Response)
- Incoming message arrives
- System checks if any keyword rules match
- If match found: Send auto-reply (text/template/workflow)
- If no match: Message goes to live chat for human response

### Campaigns (Bulk Messaging)
- You create campaign with message/template
- Select audience (contacts/segments)
- Schedule send time (now or future)
- System sends to all recipients
- Tracks delivery and engagement

### Real-Time Flow:
```
WhatsApp Message Incoming
  ↓
Webhook receives message
  ↓
Check for active workflow sessions (chatbot)
  ├─ YES → Process workflow response → Send next step
  └─ NO → Check keyword rules
      ├─ MATCH → Send auto-reply (text/template/workflow)
      └─ NO MATCH → Save to live chat (human handles it)
```

---

## 📊 KEY DIFFERENCES

| Feature | Chatbot | Campaigns |
|---------|---------|-----------|
| **Trigger** | Incoming message | Manual send schedule |
| **Recipients** | 1 contact at a time | Many contacts at once |
| **Message Type** | Auto-reply | Bulk message |
| **Flow** | Keyword-based routing | One-way broadcast |
| **Speed** | Instant (real-time) | Scheduled |
| **Use Case** | Support automation | Marketing/Announcements |
| **Response** | Bot responds to user | Send to users |
| **Workflow** | Multi-step interactive | Single or series |

---

## 🚀 CURRENT STATUS

✅ **IMPLEMENTED & WORKING:**
- Chatbot keyword matching (text, template, workflow types)
- Multi-step workflow execution with branching
- Campaign creation and scheduling
- Campaign analytics and tracking
- Real-time message switching (chatbot vs live chat)

⚠️ **IN DEVELOPMENT:**
- Advanced workflow builder UI (currently functional via API)
- A/B testing campaign split logic
- Calendar booking integration

---

## 📝 EXAMPLE SCENARIOS

### Scenario 1: Support Bot
**Keyword Rule**: "help" (contains match)
**Reply Type**: Workflow
**Steps**:
1. Bot asks: "What do you need help with?"
   - Button 1: "Shipping" → Step 3
   - Button 2: "Payment" → Step 4
   - Button 3: "Other" → Step 5
2. User clicks "Shipping"
3. Bot asks: "Order number?" → Save response
4. Bot sends: "We found your order. It ships tomorrow!"
5. End workflow

### Scenario 2: Marketing Campaign
**Type**: Broadcast
**Message**: "New Year Sale! 50% off all items"
**Audience**: All active customers (2,500 contacts)
**Schedule**: Today at 10 AM
**Result**: 
- Sent to 2,450 customers
- 1,900 opened the message (77.6%)
- 850 clicked the link (43.6%)

### Scenario 3: Drip Sequence
**Type**: Drip Campaign
**Sequence**:
- Day 0: Send welcome message
- Day 1: Send product guide
- Day 3: Send discount offer
- Day 7: Send customer review request

---

## 🎯 NEXT STEPS

1. **Test Chatbot**: Create keyword rule in chatbot page
2. **Create Campaign**: Send broadcast message to test contacts
3. **Monitor**: Check analytics for engagement rates
4. **Refine**: Improve based on results

Both systems work together to automate customer communication!
