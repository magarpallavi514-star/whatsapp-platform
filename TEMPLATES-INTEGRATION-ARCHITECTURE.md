# 📊 Template Integration Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENROMATICS                               │
│  (Dashboard showing templates list)                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ 1. Fetch Templates
                       │ GET /api/integrations/templates
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              WHATSAPP PLATFORM BACKEND                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ getTemplatesViaIntegration()                         │      │
│  │ ✅ Validates accountId from API key                 │      │
│  │ ✅ Filters by status, category                      │      │
│  │ ✅ Returns template list with pagination            │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Database: Template Model                            │      │
│  │ ✅ _id: ObjectId                                    │      │
│  │ ✅ name: String (display name)                      │      │
│  │ ✅ content: String (template body)                  │      │
│  │ ✅ variables: Array of strings                      │      │
│  │ ✅ status: approved/pending/draft/rejected          │      │
│  │ ✅ usageCount: Number                               │      │
│  │ ✅ deleted: Boolean (soft delete)                   │      │
│  └──────────────────────────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ 2. Template List Response
                       │ [{ _id, name, variables, status }]
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ENROMATICS                               │
│  User clicks on template to send message                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ 3. Send Template Message
                       │ POST /api/integrations/templates/send
                       │ {
                       │   templateName: "welcome",
                       │   recipientPhone: "918087131777",
                       │   variables: ["John", "Product"]
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              WHATSAPP PLATFORM BACKEND                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ sendTemplateMessageViaIntegration()                  │      │
│  │ 1. Find template by name                            │      │
│  │ 2. Get active phone number                          │      │
│  │ 3. Call whatsappService.sendTemplateMessage()       │      │
│  │ 4. Increment usageCount                             │      │
│  │ 5. Return success with messageId                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ whatsappService.sendTemplateMessage()               │      │
│  │ ✅ Replace {{1}}, {{2}} with variables              │      │
│  │ ✅ Call Meta API with template params               │      │
│  │ ✅ Return messageId + waMessageId                   │      │
│  └──────────────────────────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ 4. Message Sent Success
                       │ { messageId, status: "sent" }
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WHATSAPP API                                │
│  Template message delivered to recipient                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Field Mapping Guide

### Template Fields (What Enromatics receives)

```
Template in Database:
├─ _id: "695a1a0fbcb4b39a4abb7ac3"
│  └─ Used for: GET /api/integrations/templates/{id}
│
├─ name: "welcome_template"
│  └─ Used for: POST /api/integrations/templates/send
│
├─ content: "Hello {{1}}, welcome to {{2}}!"
│  └─ Used for: Display in template editor
│
├─ variables: ["1", "2"]
│  └─ Used for: Show input fields in form (2 fields needed)
│
├─ status: "approved"
│  └─ Used for: Filter which templates can be sent
│
├─ usageCount: 45
│  └─ Used for: Display popularity/usage stats
│
├─ lastUsedAt: "2026-01-08T20:11:46Z"
│  └─ Used for: Show last usage date
│
└─ category: "UTILITY"
   └─ Used for: Categorize templates (MARKETING, UTILITY, AUTH)
```

---

## Request/Response Examples

### ✅ CORRECT - Fetch Templates

**Request:**
```
GET /api/integrations/templates?limit=10&status=approved
Authorization: Bearer wpk_live_xxxxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "695a1a0fbcb4b39a4abb7ac3",
        "name": "welcome_template",
        "language": "en",
        "category": "UTILITY",
        "content": "Hello {{1}}, welcome to {{2}}!",
        "variables": ["1", "2"],
        "status": "approved",
        "usageCount": 45,
        "lastUsedAt": "2026-01-08T20:11:46Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "stats": {
      "approved": 120,
      "pending": 15,
      "total": 150
    }
  }
}
```

---

### ✅ CORRECT - Send Template

**Request:**
```
POST /api/integrations/templates/send
Authorization: Bearer wpk_live_xxxxx
Content-Type: application/json

{
  "templateName": "welcome_template",
  "recipientPhone": "918087131777",
  "variables": ["Piyush", "Utkarsh Education"],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "messageId": "msg_695fc22b74c7725835e7bfad",
    "waMessageId": "wamid.HBgMOTE4MDg3MTMxNzc3FQIAEhg...",
    "templateName": "welcome_template",
    "recipientPhone": "918087131777",
    "status": "sent",
    "timestamp": "2026-01-08T20:15:00Z"
  }
}
```

---

### ❌ WRONG - Common Mistakes

**Mistake 1: Using templateId instead of templateName**
```json
{
  "templateId": "695a1a0fbcb4b39a4abb7ac3",  // ❌ WRONG
  "recipientPhone": "918087131777",
  "variables": ["Piyush", "Utkarsh"]
}
```
Error: Template not found (field mismatch!)

**Mistake 2: Not passing variables as array**
```json
{
  "templateName": "welcome_template",
  "recipientPhone": "918087131777",
  "variables": "Piyush, Utkarsh"  // ❌ WRONG - string instead of array
}
```
Error: Variables not replaced properly

**Mistake 3: Forgetting to fetch template first**
```javascript
// ❌ WRONG - sending to old template ID
sendTemplate(oldTemplateId, phone, vars);

// ✅ CORRECT - fetch updated template info first
const template = await getTemplate(templateId);
sendTemplate(template.name, phone, vars);
```

---

## Database Schema Reference

```javascript
// Template Model
{
  accountId: {
    type: String,      // Multi-tenant isolation
    required: true,
    index: true
  },
  name: {
    type: String,      // Used in send endpoint
    required: true
  },
  content: {
    type: String,      // {{1}}, {{2}} placeholders
    required: true
  },
  variables: {
    type: [String],    // ["1", "2"] - count of placeholders
    default: []
  },
  status: {
    type: String,      // Only send "approved" templates
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  usageCount: {
    type: Number,      // Increment after sending
    default: 0
  },
  lastUsedAt: {
    type: Date         // Track when template last used
  },
  deleted: {
    type: Boolean,     // Soft delete (don't query if true)
    default: false
  }
}
```

---

## Query Examples for Different Scenarios

### Show all APPROVED templates only
```
GET /api/integrations/templates?status=approved
```

### Show all MARKETING templates
```
GET /api/integrations/templates?category=MARKETING
```

### Show approved MARKETING templates
```
GET /api/integrations/templates?status=approved&category=MARKETING
```

### Pagination: Get 50 templates, skip first 100
```
GET /api/integrations/templates?limit=50&offset=100
```

### Get template stats (counts by status)
```
GET /api/integrations/templates

Response includes:
{
  "stats": {
    "approved": 120,
    "pending": 15,
    "rejected": 10,
    "draft": 5,
    "total": 150
  }
}
```

---

## Implementation Checklist for Enromatics

- [ ] Store templates locally (cache from API)
- [ ] Display templates in dropdown/list
- [ ] Filter by status (show only approved)
- [ ] Show variable count (so user knows how many fields to fill)
- [ ] Create form fields dynamically based on variables count
- [ ] Validate that all variables are filled before sending
- [ ] Send template with proper field names:
  - [ ] `templateName` (NOT templateId)
  - [ ] `recipientPhone` (NOT phoneNumber)
  - [ ] `variables` (as array, NOT string)
- [ ] Display sent message confirmation
- [ ] Handle errors gracefully

---

## Next Steps

1. ✅ Review this guide with your team
2. ✅ Implement 5 endpoints in backend
3. ✅ Test each endpoint with curl
4. ✅ Update Enromatics frontend to use templates
5. ✅ Test end-to-end template sending
6. ✅ Deploy and monitor
