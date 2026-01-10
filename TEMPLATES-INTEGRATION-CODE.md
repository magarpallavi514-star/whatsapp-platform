# 🛠️ Template Integration - Ready-to-Use Code

This file contains the exact code to add to your project.

---

## 📄 File 1: Update integrationsController.js

**Add these functions to:** `backend/src/controllers/integrationsController.js`

```javascript
/**
 * GET /api/integrations/templates
 * Get all templates for account with pagination and filtering
 */
export const getTemplatesViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { limit = 50, offset = 0, status, category } = req.query;

    console.log(`📋 [INTEGRATION] Fetching templates:`, { accountId, limit, offset, status, category });

    // Build query
    const query = { accountId, deleted: false };
    if (status) query.status = status;
    if (category) query.category = category;

    // Fetch templates with pagination
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const totalCount = await Template.countDocuments(query);

    // Get stats
    const stats = {
      approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
      total: await Template.countDocuments({ accountId, deleted: false })
    };

    console.log(`✅ [INTEGRATION] Found ${templates.length} templates`);

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

  } catch (error) {
    console.error('❌ [INTEGRATION] Get templates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

/**
 * GET /api/integrations/templates/:id
 * Get single template details
 */
export const getTemplateDetailsViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;

    console.log(`📋 [INTEGRATION] Fetching template:`, { accountId, templateId });

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

  } catch (error) {
    console.error('❌ [INTEGRATION] Get template details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch template details',
      error: error.message
    });
  }
};

/**
 * POST /api/integrations/templates/send
 * Send template message to recipient
 */
export const sendTemplateMessageViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { templateName, recipientPhone, variables, language = 'en' } = req.body;

    // Validate required fields
    if (!templateName || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: 'templateName and recipientPhone are required'
      });
    }

    console.log(`📬 [INTEGRATION] Sending template message:`, { accountId, templateName, recipientPhone, variables });

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

    // Get active phone number
    const phoneNumber = await PhoneNumber.findOne({
      accountId,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'No active WhatsApp phone number configured'
      });
    }

    // Send template message
    const result = await whatsappService.sendTemplateMessage(
      accountId,
      phoneNumber.phoneNumberId,
      recipientPhone,
      template.name,
      variables || [],
      language
    );

    // Update usage statistics
    await Template.updateOne(
      { _id: template._id },
      { 
        usageCount: template.usageCount + 1,
        lastUsedAt: new Date()
      }
    );

    console.log(`✅ [INTEGRATION] Template message sent:`, { messageId: result.messageId });

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
    console.error('❌ [INTEGRATION] Send template message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send template message',
      error: error.message
    });
  }
};

/**
 * PUT /api/integrations/templates/:id
 * Update template
 */
export const updateTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;
    const { name, category, content } = req.body;

    console.log(`📝 [INTEGRATION] Updating template:`, { accountId, templateId });

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
    
    // Reset to draft when updated
    template.status = 'draft';

    await template.save();

    return res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });

  } catch (error) {
    console.error('❌ [INTEGRATION] Update template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
};

/**
 * DELETE /api/integrations/templates/:id
 * Soft delete a template
 */
export const deleteTemplateViaIntegration = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id: templateId } = req.params;

    console.log(`🗑️  [INTEGRATION] Deleting template:`, { accountId, templateId });

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

    console.log(`✅ [INTEGRATION] Template deleted`);

    return res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('❌ [INTEGRATION] Delete template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
};
```

---

## 📄 File 2: Update integrationsRoutes.js

**Add these lines to:** `backend/src/routes/integrationsRoutes.js`

### At the top with other imports:
```javascript
import {
  // Conversations
  getConversationsViaIntegration,
  getConversationDetailsViaIntegration,
  getConversationMessagesViaIntegration,
  replyToConversationViaIntegration,
  
  // Messages
  sendMessageViaIntegration,
  
  // Templates ← ADD THESE
  getTemplatesViaIntegration,
  getTemplateDetailsViaIntegration,
  sendTemplateMessageViaIntegration,
  updateTemplateViaIntegration,
  deleteTemplateViaIntegration,
  
  // Contacts
  getContactsViaIntegration,
  // ... rest of imports
}
```

### Add these routes (find where other routes are defined):
```javascript
// ========== TEMPLATES ==========

/**
 * @route   GET /api/integrations/templates
 * @desc    Get all templates with pagination
 * @access  Integration token required
 * @query   { limit?, offset?, status?, category? }
 */
router.get('/templates', authenticateIntegration, getTemplatesViaIntegration);

/**
 * @route   GET /api/integrations/templates/:id
 * @desc    Get single template details
 * @access  Integration token required
 */
router.get('/templates/:id', authenticateIntegration, getTemplateDetailsViaIntegration);

/**
 * @route   POST /api/integrations/templates/send
 * @desc    Send template message to recipient
 * @access  Integration token required
 * @body    { templateName, recipientPhone, variables?, language? }
 */
router.post('/templates/send', authenticateIntegration, sendTemplateMessageViaIntegration);

/**
 * @route   PUT /api/integrations/templates/:id
 * @desc    Update template
 * @access  Integration token required
 * @body    { name?, category?, content? }
 */
router.put('/templates/:id', authenticateIntegration, updateTemplateViaIntegration);

/**
 * @route   DELETE /api/integrations/templates/:id
 * @desc    Delete template (soft delete)
 * @access  Integration token required
 */
router.delete('/templates/:id', authenticateIntegration, deleteTemplateViaIntegration);
```

---

## 📄 File 3: Ensure integrationsController.js imports

**Verify these imports exist at the top of integrationsController.js:**

```javascript
import Template from '../models/Template.js';
import PhoneNumber from '../models/PhoneNumber.js';
import whatsappService from '../services/whatsappService.js';
```

---

## ✅ Deployment Checklist

- [ ] Copy functions to integrationsController.js
- [ ] Add imports to integrationsRoutes.js
- [ ] Add routes to integrationsRoutes.js
- [ ] Verify Template model import exists
- [ ] Test each endpoint with curl
- [ ] Commit and push to GitHub
- [ ] Deploy to production

---

## 🧪 Test Commands

```bash
# 1. Get all approved templates
curl -X GET http://localhost:3001/api/integrations/templates?status=approved \
  -H "Authorization: Bearer YOUR_API_KEY"

# 2. Get single template
curl -X GET http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY"

# 3. Send template message
curl -X POST http://localhost:3001/api/integrations/templates/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "welcome_template",
    "recipientPhone": "918087131777",
    "variables": ["Piyush", "Utkarsh"]
  }'

# 4. Update template
curl -X PUT http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "welcome_v2",
    "category": "MARKETING"
  }'

# 5. Delete template
curl -X DELETE http://localhost:3001/api/integrations/templates/{template_id} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 🚀 After Deployment

1. Test each endpoint
2. Verify responses match the documentation
3. Confirm field names are correct
4. Ensure no "contactPhone" or other mismatches exist
5. Update Enromatics frontend to use new endpoints
6. Test end-to-end template sending
