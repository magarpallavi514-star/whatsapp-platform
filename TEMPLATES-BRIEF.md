# 🚀 Template Integration - Brief Checklist

## What to Do

### 1️⃣ Add to `backend/src/controllers/integrationsController.js`

Copy-paste these 5 functions at the end of the file:

```javascript
export const getTemplatesViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { limit = 50, offset = 0, status, category } = req.query;
    const query = { accountId, deleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    const templates = await Template.find(query).sort({ createdAt: -1 }).skip(parseInt(offset)).limit(parseInt(limit)).lean();
    const totalCount = await Template.countDocuments(query);
    const stats = {
      approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
      total: await Template.countDocuments({ accountId, deleted: false })
    };
    return res.json({ success: true, data: { templates, pagination: { total: totalCount, limit: parseInt(limit), offset: parseInt(offset), hasMore: parseInt(offset) + parseInt(limit) < totalCount }, stats } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch templates', error: error.message });
  }
};

export const getTemplateDetailsViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;
    const template = await Template.findOne({ _id: templateId, accountId, deleted: false }).lean();
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.json({ success: true, data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch template', error: error.message });
  }
};

export const sendTemplateMessageViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { templateName, recipientPhone, variables, language = 'en' } = req.body;
    if (!templateName || !recipientPhone) return res.status(400).json({ success: false, message: 'templateName and recipientPhone required' });
    const template = await Template.findOne({ accountId, name: templateName, status: 'approved', deleted: false });
    if (!template) return res.status(404).json({ success: false, message: `Template '${templateName}' not found or not approved` });
    const phoneNumber = await PhoneNumber.findOne({ accountId, isActive: true }).sort({ createdAt: -1 });
    if (!phoneNumber) return res.status(400).json({ success: false, message: 'No active phone number configured' });
    const result = await whatsappService.sendTemplateMessage(accountId, phoneNumber.phoneNumberId, recipientPhone, template.name, variables || [], language);
    await Template.updateOne({ _id: template._id }, { usageCount: template.usageCount + 1, lastUsedAt: new Date() });
    return res.json({ success: true, message: 'Template message sent successfully', data: { messageId: result.messageId, waMessageId: result.waMessageId, templateName: template.name, recipientPhone, status: 'sent', timestamp: new Date().toISOString() } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send template', error: error.message });
  }
};

export const updateTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;
    const { name, category, content } = req.body;
    const template = await Template.findOne({ _id: templateId, accountId, deleted: false });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    if (name) template.name = name;
    if (category) template.category = category;
    if (content) template.content = content;
    template.status = 'draft';
    await template.save();
    return res.json({ success: true, message: 'Template updated', data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
  }
};

export const deleteTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;
    const template = await Template.findOne({ _id: templateId, accountId, deleted: false });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    template.deleted = true;
    await template.save();
    return res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
  }
};
```

---

### 2️⃣ Add to `backend/src/routes/integrationsRoutes.js`

Find this:
```javascript
import {
  getConversationsViaIntegration,
  getConversationDetailsViaIntegration,
  getConversationMessagesViaIntegration,
  replyToConversationViaIntegration,
  sendMessageViaIntegration,
```

Add these after `sendMessageViaIntegration`:
```javascript
  getTemplatesViaIntegration,
  getTemplateDetailsViaIntegration,
  sendTemplateMessageViaIntegration,
  updateTemplateViaIntegration,
  deleteTemplateViaIntegration,
```

Find where routes start and add:
```javascript
router.get('/templates', authenticateIntegration, getTemplatesViaIntegration);
router.get('/templates/:id', authenticateIntegration, getTemplateDetailsViaIntegration);
router.post('/templates/send', authenticateIntegration, sendTemplateMessageViaIntegration);
router.put('/templates/:id', authenticateIntegration, updateTemplateViaIntegration);
router.delete('/templates/:id', authenticateIntegration, deleteTemplateViaIntegration);
```

---

### 3️⃣ Verify Imports in integrationsController.js

Make sure these exist at the top:
```javascript
import Template from '../models/Template.js';
import PhoneNumber from '../models/PhoneNumber.js';
import whatsappService from '../services/whatsappService.js';
```

---

### 4️⃣ Test & Commit

```bash
# Test endpoints work
curl http://localhost:3001/api/integrations/templates -H "Authorization: Bearer YOUR_API_KEY"

# Commit
git add . && git commit -m "feat: Add template integration endpoints"

# Push
git push origin main
```

---

## ✅ Done!

5 endpoints ready for Enromatics:
- ✅ GET /api/integrations/templates (fetch all)
- ✅ GET /api/integrations/templates/:id (get one)
- ✅ POST /api/integrations/templates/send (send message)
- ✅ PUT /api/integrations/templates/:id (update)
- ✅ DELETE /api/integrations/templates/:id (delete)
