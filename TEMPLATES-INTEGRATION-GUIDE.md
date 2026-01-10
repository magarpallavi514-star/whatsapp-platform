# 📋 Template Integration Guide for Enromatics

## Overview
This guide shows how to integrate WhatsApp templates from WhatsApp Platform to Enromatics **without any mismatches**.

---

## 🎯 Part 1: Data Contract (What Data Gets Passed)

### Template Data Structure

When Enromatics fetches templates, here's the EXACT data structure:

```json
{
  "_id": "ObjectId",
  "accountId": "pixels_internal",
  "name": "welcome_template",
  "language": "en",
  "category": "UTILITY",
  "content": "Hello {{1}}, welcome to {{2}}!",
  "variables": ["1", "2"],
  "components": [
    {
      "type": "BODY",
      "text": "Hello {{1}}, welcome to {{2}}!"
    }
  ],
  "status": "approved",
  "metaTemplateId": "123456789",
  "usageCount": 45,
  "lastUsedAt": "2026-01-08T20:11:46Z",
  "lastSyncedAt": "2026-01-08T20:11:46Z",
  "approvedAt": "2026-01-05T10:30:00Z",
  "deleted": false,
  "createdAt": "2026-01-04T12:00:00Z",
  "updatedAt": "2026-01-08T20:11:46Z"
}
```

---

## ✅ Part 2: API Endpoints to Create

### 1. GET /api/integrations/templates
**Fetch all templates for this account**

```
GET /api/integrations/templates?limit=50&offset=0&status=approved
```

**Headers:**
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
x-account-id: {account-id}
```

**Query Parameters:**
- `limit` (optional, default 50): Number of templates per page
- `offset` (optional, default 0): Pagination offset
- `status` (optional): Filter by status (approved, pending, rejected, draft)
- `category` (optional): Filter by category (MARKETING, UTILITY, AUTHENTICATION)

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "template_id",
        "name": "welcome_template",
        "language": "en",
        "category": "UTILITY",
        "content": "Hello {{1}}, welcome!",
        "variables": ["1"],
        "status": "approved",
        "usageCount": 45,
        "lastUsedAt": "2026-01-08T20:11:46Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "stats": {
      "approved": 120,
      "pending": 15,
      "rejected": 10,
      "draft": 5,
      "total": 150
    }
  }
}
```

---

### 2. GET /api/integrations/templates/:id
**Fetch single template details**

```
GET /api/integrations/templates/welcome_template_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "template_id",
    "accountId": "pixels_internal",
    "name": "welcome_template",
    "language": "en",
    "category": "UTILITY",
    "content": "Hello {{1}}, welcome to {{2}}!",
    "variables": ["1", "2"],
    "components": [
      {
        "type": "BODY",
        "text": "Hello {{1}}, welcome to {{2}}!"
      }
    ],
    "status": "approved",
    "metaTemplateId": "123456789",
    "usageCount": 45,
    "lastUsedAt": "2026-01-08T20:11:46Z",
    "lastSyncedAt": "2026-01-08T20:11:46Z",
    "approvedAt": "2026-01-05T10:30:00Z",
    "createdAt": "2026-01-04T12:00:00Z",
    "updatedAt": "2026-01-08T20:11:46Z"
  }
}
```

---

### 3. POST /api/integrations/templates
**Send template message using a template**

```
POST /api/integrations/templates
```

**Headers:**
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
x-account-id: {account-id}
```

**Body:**
```json
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
    "messageId": "msg_123456",
    "waMessageId": "wamid.xxx",
    "templateName": "welcome_template",
    "recipientPhone": "918087131777",
    "status": "sent",
    "timestamp": "2026-01-08T20:15:00Z"
  }
}
```

---

### 4. PUT /api/integrations/templates/:id
**Update template (name, category, content)**

```
PUT /api/integrations/templates/template_id
```

**Body:**
```json
{
  "name": "welcome_v2",
  "category": "MARKETING",
  "content": "Updated content with {{1}}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": {
    "_id": "template_id",
    "name": "welcome_v2",
    "category": "MARKETING",
    "content": "Updated content with {{1}}",
    "status": "draft"
  }
}
```

---

### 5. DELETE /api/integrations/templates/:id
**Soft delete a template**

```
DELETE /api/integrations/templates/template_id
```

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

## 🔧 Part 3: Implementation Checklist

### Backend Changes Needed

```javascript
// File: backend/src/controllers/integrationsController.js

// 1. Add getTemplatesViaIntegration function
export const getTemplatesViaIntegration = async (req, res) => {
  const accountId = req.accountId;
  const { limit = 50, offset = 0, status, category } = req.query;
  
  // Build query
  const query = { accountId, deleted: false };
  if (status) query.status = status;
  if (category) query.category = category;
  
  // Fetch templates
  const templates = await Template.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean();
  
  // Get stats
  const stats = {
    approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
    pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
    rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
    draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
    total: await Template.countDocuments({ accountId, deleted: false })
  };
  
  const totalCount = await Template.countDocuments(query);
  
  return res.json({
    success: true,
    data: {
      templates,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      },
      stats
    }
  });
};

// 2. Add getTemplateDetailsViaIntegration function
export const getTemplateDetailsViaIntegration = async (req, res) => {
  const accountId = req.accountId;
  const { id: templateId } = req.params;
  
  const template = await Template.findOne({
    _id: templateId,
    accountId,
    deleted: false
  }).lean();
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }
  
  return res.json({
    success: true,
    data: template
  });
};

// 3. Add sendTemplateMessageViaIntegration function
export const sendTemplateMessageViaIntegration = async (req, res) => {
  const accountId = req.accountId;
  const { templateName, recipientPhone, variables, language } = req.body;
  
  // Validate
  if (!templateName || !recipientPhone) {
    return res.status(400).json({
      success: false,
      message: 'templateName and recipientPhone required'
    });
  }
  
  // Find template
  const template = await Template.findOne({
    accountId,
    name: templateName,
    status: 'approved',
    deleted: false
  });
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: `Template '${templateName}' not found or not approved`
    });
  }
  
  // Get active phone
  const phoneNumber = await PhoneNumber.findOne({
    accountId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'No active phone number configured'
    });
  }
  
  // Send template message
  const result = await whatsappService.sendTemplateMessage(
    accountId,
    phoneNumber.phoneNumberId,
    recipientPhone,
    template.name,
    variables || [],
    language || 'en'
  );
  
  // Update usage
  await Template.updateOne(
    { _id: template._id },
    { 
      usageCount: template.usageCount + 1,
      lastUsedAt: new Date()
    }
  );
  
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
};

// 4. Add updateTemplateViaIntegration function
export const updateTemplateViaIntegration = async (req, res) => {
  const accountId = req.accountId;
  const { id: templateId } = req.params;
  const { name, category, content } = req.body;
  
  const template = await Template.findOne({
    _id: templateId,
    accountId,
    deleted: false
  });
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }
  
  // Update allowed fields
  if (name) template.name = name;
  if (category) template.category = category;
  if (content) template.content = content;
  template.status = 'draft'; // Reset to draft when updated
  
  await template.save();
  
  return res.json({
    success: true,
    message: 'Template updated successfully',
    data: template
  });
};

// 5. Add deleteTemplateViaIntegration function
export const deleteTemplateViaIntegration = async (req, res) => {
  const accountId = req.accountId;
  const { id: templateId } = req.params;
  
  const template = await Template.findOne({
    _id: templateId,
    accountId,
    deleted: false
  });
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }
  
  // Soft delete
  template.deleted = true;
  await template.save();
  
  return res.json({
    success: true,
    message: 'Template deleted successfully'
  });
};
```

### Routes Changes Needed

```javascript
// File: backend/src/routes/integrationsRoutes.js

// Add these imports
import {
  getTemplatesViaIntegration,
  getTemplateDetailsViaIntegration,
  sendTemplateMessageViaIntegration,
  updateTemplateViaIntegration,
  deleteTemplateViaIntegration
} from '../controllers/integrationsController.js';

// Add these routes
router.get('/templates', authenticateIntegration, getTemplatesViaIntegration);
router.get('/templates/:id', authenticateIntegration, getTemplateDetailsViaIntegration);
router.post('/templates/send', authenticateIntegration, sendTemplateMessageViaIntegration);
router.put('/templates/:id', authenticateIntegration, updateTemplateViaIntegration);
router.delete('/templates/:id', authenticateIntegration, deleteTemplateViaIntegration);
```

---

## 🎓 Part 4: What Enromatics Should Do

### Step 1: Fetch All Templates
```javascript
const fetchTemplates = async () => {
  const response = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/integrations/templates?limit=50&offset=0&status=approved`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.data.templates; // Extract templates array
};
```

### Step 2: Display Templates in Dropdown
```javascript
// Each template has:
// - _id: unique identifier (use for API calls)
// - name: display name (show to user)
// - variables: ["1", "2"] (number of placeholders)
// - category: UTILITY, MARKETING, AUTHENTICATION
// - usageCount: how many times used
```

### Step 3: Send Template Message
```javascript
const sendTemplate = async (templateId, recipientPhone, variables) => {
  // First, fetch the template to get its name
  const templateResponse = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/integrations/templates/${templateId}`,
    { headers: { 'Authorization': `Bearer ${API_KEY}` } }
  );
  const template = await templateResponse.json();
  
  // Then send the template message
  const response = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/integrations/templates/send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateName: template.data.name,
        recipientPhone: recipientPhone,
        variables: variables, // ["John", "Product"]
        language: 'en'
      })
    }
  );
  
  return await response.json();
};
```

---

## 🚨 Part 5: Common Mistakes to Avoid

### ❌ WRONG
```javascript
// Don't send template ID to send endpoint
sendTemplateMessage({
  templateId: "template_id",  // ❌ WRONG
  ...
})
```

### ✅ CORRECT
```javascript
// Fetch template first to get name, then use name
const template = await getTemplate(templateId);
sendTemplateMessage({
  templateName: template.name,  // ✅ CORRECT
  ...
})
```

---

### ❌ WRONG
```javascript
// Don't forget to pass variables as array
sendTemplate({
  templateName: "welcome",
  variables: "John"  // ❌ WRONG - should be array
})
```

### ✅ CORRECT
```javascript
// Always pass variables as array
sendTemplate({
  templateName: "welcome",
  variables: ["John", "Product"]  // ✅ CORRECT
})
```

---

### ❌ WRONG
```javascript
// Don't mix field names
{
  phoneNumber: "918087131777",  // ❌ WRONG - should be recipientPhone
  message: "text",              // ❌ WRONG - templates don't use message
  templateId: "id"              // ❌ WRONG - should be templateName
}
```

### ✅ CORRECT
```javascript
{
  recipientPhone: "918087131777",  // ✅ CORRECT
  templateName: "welcome",         // ✅ CORRECT
  variables: ["John"],             // ✅ CORRECT
  language: "en"                   // ✅ CORRECT
}
```

---

## 📋 Testing Checklist

- [ ] Fetch all templates: `GET /api/integrations/templates`
- [ ] Filter by status: `GET /api/integrations/templates?status=approved`
- [ ] Get single template: `GET /api/integrations/templates/{id}`
- [ ] Send template: `POST /api/integrations/templates/send`
- [ ] Update template: `PUT /api/integrations/templates/{id}`
- [ ] Delete template: `DELETE /api/integrations/templates/{id}`
- [ ] Verify variables are replaced in sent message
- [ ] Verify usage count increments after sending
- [ ] Verify deleted templates don't show in lists

---

## 🎯 Summary

| Item | Value |
|------|-------|
| **Total Endpoints** | 5 |
| **Field Mismatches** | 0 (if you follow this guide) |
| **Required Field Types** | See API docs above |
| **Testing Time** | ~2 hours |
| **Deployment Risk** | Very Low |

