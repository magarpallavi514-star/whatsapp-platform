# Workflow Features - Chatbot Enhancement

## Overview
Enhanced the chatbot section with **glass blur modal** UI and **workflow automation** features for creating interactive multi-step auto-replies with buttons and lists.

## Features Implemented

### 1. Glass Blur Modal ✨
- Changed modal background from solid black (`bg-black bg-opacity-50`) to **frosted glass effect** (`backdrop-blur-md bg-black/30`)
- Modern, clean UI that matches iOS/macOS design patterns
- Enhanced shadow (`shadow-2xl`) for better depth
- Increased modal width to `max-w-4xl` for workflow builder space

### 2. Workflow Builder 🔄

#### Reply Types
- **Text** - Simple text message
- **Workflow** - Multi-step interactive responses (NEW!)
- **Template** - WhatsApp approved templates

#### Workflow Step Types
1. **Text Message** - Standard text reply
2. **Buttons** - Interactive buttons (max 3)
3. **List** - Dropdown list menu (max 10 items)

#### Workflow Features
- **Multiple Steps**: Chain multiple messages in sequence
- **Delays**: Add delay (0-30 seconds) between steps
- **Interactive Elements**:
  - Button replies with custom titles
  - List items with title + description
- **Visual Builder**: Add, preview, and remove workflow steps
- **Step Counter**: Shows workflow sequence (1, 2, 3...)
- **Type Icons**: Visual indicators for each step type

### 3. UI/UX Enhancements

#### Modal Form
- Three-column button type selector (Text / Buttons / List)
- Active state highlighting (green border for selected type)
- Add button workflow:
  - Text input for buttons with Enter key support
  - Inline remove buttons (X icon)
  - Visual count limit (3 buttons, 10 list items)
- Add list workflow:
  - Title + optional description fields
  - Formatted preview with truncation

#### Workflow Preview
- Numbered steps with circular badges
- Type-specific icons (MessageSquare, Zap, List)
- Delay indicator (e.g., "• 3s delay")
- Button chips preview (green badges)
- List item count summary
- Delete step button (Trash icon)

#### Bot Cards
- Enhanced display showing:
  - Reply type badge with icon
  - Workflow step count (e.g., "Workflow (3 steps)")
  - Color-coded badges:
    - Green: Workflow with Zap icon
    - Blue: Template
    - Gray: Text with MessageSquare icon

## Technical Implementation

### Frontend Changes

**File**: `frontend/app/dashboard/chatbot/page.tsx`

#### New Interfaces
```typescript
interface ReplyOption {
  id: string;
  type: 'text' | 'buttons' | 'list';
  text?: string;
  buttons?: Array<{ id: string; title: string; }>;
  listItems?: Array<{ id: string; title: string; description?: string; }>;
  delay?: number;
}

interface ReplyContent {
  text?: string;
  templateName?: string;
  templateParams?: string[];
  workflow?: ReplyOption[]; // NEW
}
```

#### New State Management
- `workflow: ReplyOption[]` - Completed workflow steps
- `currentWorkflowItem` - Workflow step being created
- `newButtonTitle` - Button input field
- `newListItem` - List item input fields

#### Key Functions
- `openCreateModal()` - Initializes workflow state
- `openEditModal()` - Loads existing workflow data
- Workflow step builder with add/remove functionality
- Visual workflow preview with delete capability

### Backend Changes

**File**: `backend/src/models/KeywordRule.js`

#### Enhanced Schema
```javascript
replyType: {
  enum: ['text', 'template', 'workflow'] // Added 'workflow'
},
replyContent: {
  workflow: [{
    id: String,
    type: { type: String, enum: ['text', 'buttons', 'list'] },
    text: String,
    buttons: [{ id: String, title: String }],
    listItems: [{ id: String, title: String, description: String }],
    delay: Number
  }]
}
```

**File**: `backend/src/services/whatsappService.js`

#### New Methods

1. **`processWorkflow(accountId, phoneNumberId, recipientPhone, workflowSteps)`**
   - Iterates through workflow steps
   - Applies delays between steps
   - Routes to appropriate message sender

2. **`sendButtonMessage(accountId, phoneNumberId, recipientPhone, bodyText, buttons)`**
   - Formats buttons for WhatsApp API
   - Max 3 buttons, 20 char title limit
   - Sends interactive button message
   - Saves to Message database

3. **`sendListMessage(accountId, phoneNumberId, recipientPhone, bodyText, listItems)`**
   - Formats list items for WhatsApp API
   - Max 10 items, 24 char title, 72 char description
   - Sends interactive list message
   - Saves to Message database

#### Enhanced Auto-Reply Logic
```javascript
else if (rule.replyType === 'workflow' && rule.replyContent.workflow) {
  await this.processWorkflow(
    accountId,
    phoneNumberId,
    senderPhone,
    rule.replyContent.workflow
  );
}
```

## WhatsApp API Integration

### Interactive Message Types

#### Button Message Format
```json
{
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Choose an option" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_1", "title": "Yes" }},
        { "type": "reply", "reply": { "id": "btn_2", "title": "No" }}
      ]
    }
  }
}
```

#### List Message Format
```json
{
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": { "text": "Select from options" },
    "action": {
      "button": "View Options",
      "sections": [{
        "title": "Options",
        "rows": [
          { "id": "item_1", "title": "Option 1", "description": "Description" }
        ]
      }]
    }
  }
}
```

## Use Cases

### 1. Customer Support Bot
```
Step 1 (Text): "Hi! How can I help you today?"
Step 2 (Buttons): 
  - Product Info
  - Order Status
  - Talk to Human
```

### 2. Lead Qualification
```
Step 1 (Text): "Welcome! Are you interested in our services?"
Step 2 (List):
  - Pricing Plans
  - Feature Demo
  - Schedule Call
  - Download Brochure
Step 3 (Delay 2s, Text): "Thanks! A team member will reach out soon."
```

### 3. Order Tracking
```
Step 1 (Text): "Please select your order type:"
Step 2 (Buttons):
  - New Order
  - Track Order
  - Cancel Order
Step 3 (Text): "Your request has been received. Reference: #ABC123"
```

## Testing Checklist

- [x] Glass blur modal renders correctly
- [x] Modal closes on X button
- [x] Workflow type selector works
- [x] Add text step to workflow
- [x] Add buttons step (max 3)
- [x] Add list step (max 10 items)
- [x] Delete workflow step
- [x] Save workflow chatbot
- [x] Display workflow in bot cards
- [x] Backend saves workflow data
- [ ] WhatsApp sends button messages
- [ ] WhatsApp sends list messages
- [ ] Workflow processes with delays
- [ ] Button interactions tracked
- [ ] List interactions tracked

## Future Enhancements

1. **Conditional Logic**: Branch workflows based on user response
2. **Variables**: Use customer name, order info in messages
3. **Analytics**: Track button/list click rates
4. **A/B Testing**: Test different workflow variations
5. **Drag & Drop**: Visual workflow designer
6. **Templates**: Pre-built workflow templates
7. **Multi-Language**: Translate workflows
8. **Time-Based**: Schedule workflow activation
9. **Tags**: Tag contacts based on workflow responses
10. **Integration**: Connect to CRM, payment systems

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Safari (supports backdrop-blur)
- ✅ Firefox (supports backdrop-filter)
- ⚠️ IE11 (no backdrop-blur support - graceful degradation to semi-transparent)

## Performance Notes

- Workflow steps processed sequentially
- Delays implemented with `setTimeout`
- Each step creates separate WhatsApp API call
- Messages saved to database for tracking
- No performance impact on page load

## Files Modified

### Frontend
- `frontend/app/dashboard/chatbot/page.tsx` (543 → 913 lines)
  - Added workflow interfaces
  - Added workflow builder UI
  - Added glass blur modal
  - Enhanced bot card display

### Backend
- `backend/src/models/KeywordRule.js` (93 → 114 lines)
  - Added workflow to replyType enum
  - Added workflow schema to replyContent

- `backend/src/services/whatsappService.js` (706 → 920 lines)
  - Added processWorkflow method
  - Added sendButtonMessage method
  - Added sendListMessage method
  - Enhanced processIncomingMessage logic

## Deployment Notes

1. **No Database Migration Required**: MongoDB schema is flexible
2. **Backward Compatible**: Existing text/template bots work unchanged
3. **Environment**: Same variables as before (no new config needed)
4. **Dependencies**: No new npm packages required
5. **Testing**: Use WhatsApp test number to verify interactive messages

## Documentation

- WhatsApp Interactive Messages: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#interactive-messages
- Button Messages: Max 3 buttons, 20 chars per title
- List Messages: Max 10 rows, 24 char title, 72 char description
- Message Limits: Standard WhatsApp rate limits apply

---

**Status**: ✅ Implementation Complete
**Date**: January 2025
**Version**: Phase 2C - Workflow Automation
