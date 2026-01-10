# 📋 Template Integration - Quick Summary

## 🎯 What You're Doing

Adding 5 new endpoints so Enromatics can:
1. **Fetch** all templates
2. **Get details** of a single template
3. **Send** template messages to users
4. **Update** template content
5. **Delete** templates

---

## ✅ Step-by-Step Implementation

### Step 1: Add 5 Functions to integrationsController.js

**File:** `backend/src/controllers/integrationsController.js`

Add at the end of the file:

```javascript
/**
 * 1️⃣ GET /api/integrations/templates
 */
export const getTemplatesViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { limit = 50, offset = 0, status, category } = req.query;

    const query = { accountId, deleted: false };
    if (status) query.status = status;
    if (category) query.category = category;

    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const totalCount = await Template.countDocuments(query);

    const stats = {
      approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
      total: await Template.countDocuments({ accountId, deleted: false })
    };

    return res.json({
      success: true,
      data: {
        templates,
        pagination: { total: totalCount, limit: parseInt(limit), offset: parseInt(offset), hasMore: parseInt(offset) + parseInt(limit) < totalCount },
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get templates error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch templates', error: error.message });
  }
};

/**
 * 2️⃣ GET /api/integrations/templates/:id
 */
export const getTemplateDetailsViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;

    const template = await Template.findOne({ _id: templateId, accountId, deleted: false }).lean();

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.json({ success: true, data: template });
  } catch (error) {
    console.error('❌ Get template error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch template', error: error.message });
  }
};

/**
 * 3️⃣ POST /api/integrations/templates/send
 */
export const sendTemplateMessageViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { templateName, recipientPhone, variables, language = 'en' } = req.body;

    if (!templateName || !recipientPhone) {
      return res.status(400).json({ success: false, message: 'templateName and recipientPhone required' });
    }

    const template = await Template.findOne({ accountId, name: templateName, status: 'approved', deleted: false });

    if (!template) {
      return res.status(404).json({ success: false, message: `Template '${templateName}' not found or not approved` });
    }

    const phoneNumber = await PhoneNumber.findOne({ accountId, isActive: true }).sort({ createdAt: -1 });

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'No active phone number configured' });
    }

    const result = await whatsappService.sendTemplateMessage(
      accountId,
      phoneNumber.phoneNumberId,
      recipientPhone,
      template.name,
      variables || [],
      language
    );

    await Template.updateOne({ _id: template._id }, { usageCount: template.usageCount + 1, lastUsedAt: new Date() });

    return res.json({
      success: true,
      message: 'Template message sent successfully',
      data: {
        messageId: result.messageId,
        waMessageId: result.waMessageId,
        templateName: template.name,
        recipientPhone,
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Send template error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send template', error: error.message });
  }
};

/**
 * 4️⃣ PUT /api/integrations/templates/:id
 */
export const updateTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;
    const { name, category, content } = req.body;

    const template = await Template.findOne({ _id: templateId, accountId, deleted: false });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (name) template.name = name;
    if (category) template.category = category;
    if (content) template.content = content;
    template.status = 'draft';

    await template.save();

    return res.json({ success: true, message: 'Template updated', data: template });
  } catch (error) {
    console.error('❌ Update template error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
  }
};

/**
 * 5️⃣ DELETE /api/integrations/templates/:id
 */
export const deleteTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;

    const template = await Template.findOne({ _id: templateId, accountId, deleted: false });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    template.deleted = true;
    await template.save();

    return res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('❌ Delete template error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
  }
};
```

---

### Step 2: Add 5 Routes to integrationsRoutes.js

**File:** `backend/src/routes/integrationsRoutes.js`

**A) Add imports at the top:**

Find this section:
```javascript
import {
  // Conversations
  getConversationsViaIntegration,
  getConversationDetailsViaIntegration,
  getConversationMessagesViaIntegration,
  replyToConversationViaIntegration,
  
  // Messages
  sendMessageViaIntegration,
  
  // Contacts
  getContactsViaIntegration,
```

Add after "Messages" section:
```javascript
  // Templates ← ADD THESE LINES
  getTemplatesViaIntegration,
  getTemplateDetailsViaIntegration,
  sendTemplateMessageViaIntegration,
  updateTemplateViaIntegration,
  deleteTemplateViaIntegration,
```

**B) Add routes in the router:**

Find where other routes are defined (look for `router.get('/conversations'...`) and add:

```javascript
// ========== TEMPLATES ==========

router.get('/templates', authenticateIntegration, getTemplatesViaIntegration);
router.get('/templates/:id', authenticateIntegration, getTemplateDetailsViaIntegration);
router.post('/templates/send', authenticateIntegration, sendTemplateMessageViaIntegration);
router.put('/templates/:id', authenticateIntegration, updateTemplateViaIntegration);
router.delete('/templates/:id', authenticateIntegration, deleteTemplateViaIntegration);
```

---

### Step 3: Verify Imports in integrationsController.js

Make sure these imports exist at the top:

```javascript
import Template from '../models/Template.js';
import PhoneNumber from '../models/PhoneNumber.js';
import whatsappService from '../services/whatsappService.js';
```

---

## 📊 What Gets Returned

### 1️⃣ Fetch Templates
```
GET /api/integrations/templates?status=approved

Returns:
{
  "templates": [
    { "_id", "name", "content", "variables", "status", "usageCount" }
  ],
  "pagination": { "total", "limit", "offset", "hasMore" },
  "stats": { "approved": 120, "pending": 15, "total": 150 }
}
```

### 2️⃣ Get Single Template
```
GET /api/integrations/templates/{template_id}

Returns:
{
  "_id": "...",
  "name": "welcome_template",
  "content": "Hello {{1}}, welcome!",
  "variables": ["1"],
  "status": "approved",
  "usageCount": 45
}
```

### 3️⃣ Send Template Message
```
POST /api/integrations/templates/send
Body: {
  "templateName": "welcome_template",
  "recipientPhone": "918087131777",
  "variables": ["John"]
}

Returns:
{
  "success": true,
  "data": {
    "messageId": "msg_...",
    "waMessageId": "wamid...",
    "status": "sent"
  }
}
```

### 4️⃣ Update Template
```
PUT /api/integrations/templates/{template_id}
Body: {
  "name": "welcome_v2",
  "category": "MARKETING"
}

Returns:
{
  "success": true,
  "data": { updated template object }
}
```

### 5️⃣ Delete Template
```
DELETE /api/integrations/templates/{template_id}

Returns:
{
  "success": true,
  "message": "Template deleted"
}
```

---

## ⚠️ Important Field Names (To Avoid Mismatches)

| Use This | NOT This |
|----------|----------|
| `templateName` | `templateId` |
| `recipientPhone` | `phoneNumber`, `phone`, `destination` |
| `variables` (array) | `params`, `values`, `data` |
| `status` | `state`, `approval` |
| `usageCount` | `usage`, `count`, `times_used` |
| `deleted: false` | Check for `deleted: true` in query |

---

## 🧪 Test Commands

```bash
# Test 1: Fetch templates
curl http://localhost:3001/api/integrations/templates \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test 2: Get single template
curl http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test 3: Send template
curl -X POST http://localhost:3001/api/integrations/templates/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"templateName": "welcome_template", "recipientPhone": "918087131777", "variables": ["John"]}'

# Test 4: Update template
curl -X PUT http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "welcome_v2"}'

# Test 5: Delete template
curl -X DELETE http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## ✅ Checklist

- [ ] Add 5 functions to integrationsController.js
- [ ] Add 5 routes to integrationsRoutes.js
- [ ] Verify imports exist
- [ ] Test each endpoint
- [ ] Commit: `git add . && git commit -m "feat: Add template integration endpoints for Enromatics"`
- [ ] Push: `git push origin main`

---

## 🎓 What Enromatics Should Do

1. **Fetch templates:** `GET /api/integrations/templates?status=approved`
2. **Display** in dropdown/list with name, variables count, usage stats
3. **Get template details** when user selects one: `GET /api/integrations/templates/{id}`
4. **Create form fields** based on variables count (e.g., if variables: ["1", "2"], create 2 input fields)
5. **Send message:** `POST /api/integrations/templates/send` with templateName + variables
6. **Show confirmation** when sent

---

## 🚀 That's It!

Just follow the 3 steps and you're done. No more mismatches! ✅
