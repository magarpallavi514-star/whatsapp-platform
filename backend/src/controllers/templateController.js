import Template from '../models/Template.js';
import PhoneNumber from '../models/PhoneNumber.js';
import axios from 'axios';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Template Controller
 * Manages WhatsApp message templates
 */

/**
 * GET /api/templates - Get all templates
 */
export const getTemplates = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { status, category } = req.query;
    
    const query = { accountId, deleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate stats
    const stats = {
      approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
      total: await Template.countDocuments({ accountId, deleted: false })
    };
    
    res.json({
      success: true,
      templates,
      stats
    });
    
  } catch (error) {
    console.error('❌ Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/templates/:id - Get single template
 */
export const getTemplate = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    
    const template = await Template.findOne({ 
      _id: id, 
      accountId,
      deleted: false 
    }).lean();
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      template
    });
    
  } catch (error) {
    console.error('❌ Get template error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/templates - Create template
 */
export const createTemplate = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { name, language, category, content, variables, components, hasMedia, mediaType, mediaUrl, headerText, footerText } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, content'
      });
    }
    
    // Check if template name already exists
    const existing = await Template.findOne({ 
      accountId, 
      name: name.toLowerCase().replace(/\s+/g, '_'),
      deleted: false 
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }

    // Build components array
    let templateComponents = components || [];
    
    // Add HEADER component if media is included
    if (hasMedia && mediaUrl) {
      const headerComponent = {
        type: 'HEADER',
        format: mediaType || 'IMAGE',
      };
      
      if (mediaType === 'IMAGE') {
        headerComponent.example = {
          header_handle: [mediaUrl]
        };
      } else if (mediaType === 'VIDEO') {
        headerComponent.example = {
          header_handle: [mediaUrl]
        };
      } else if (mediaType === 'DOCUMENT') {
        headerComponent.example = {
          header_handle: [mediaUrl]
        };
        if (headerText) {
          headerComponent.text = headerText;
        }
      }
      
      templateComponents.unshift(headerComponent);
    }
    
    // Add BODY component (main content)
    const bodyVariables = [];
    const variableMatches = content.match(/\{\{(\d+)\}\}/g) || [];
    variableMatches.forEach((match, index) => {
      bodyVariables.push({
        type: 'text',
        text: `sample_${index + 1}`
      });
    });
    
    const bodyComponent = {
      type: 'BODY',
      text: content
    };
    
    if (bodyVariables.length > 0) {
      bodyComponent.example = {
        body_text: [bodyVariables.map(v => v.text)]
      };
    }
    
    templateComponents.push(bodyComponent);
    
    // Add FOOTER component if provided
    if (footerText) {
      templateComponents.push({
        type: 'FOOTER',
        text: footerText
      });
    }
    
    const template = await Template.create({
      accountId,
      name: name.toLowerCase().replace(/\s+/g, '_'),
      language: language || 'en',
      category: category || 'UTILITY',
      content,
      variables: variables || [...new Set(variableMatches.map(v => v.replace(/[{}]/g, '')))],
      components: templateComponents,
      status: 'draft'
    });
    
    res.json({
      success: true,
      message: 'Template created successfully. Submit for Meta approval to use it.',
      template
    });
    
  } catch (error) {
    console.error('❌ Create template error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/templates/:id - Update template
 */
export const updateTemplate = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    const { name, language, category, content, variables, components } = req.body;
    
    const template = await Template.findOne({ 
      _id: id, 
      accountId,
      deleted: false 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Only allow editing draft templates
    if (template.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit draft templates. Create a new version for approved templates.'
      });
    }
    
    if (name) template.name = name.toLowerCase().replace(/\s+/g, '_');
    if (language) template.language = language;
    if (category) template.category = category;
    if (content) template.content = content;
    if (variables) template.variables = variables;
    if (components) template.components = components;
    
    await template.save();
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      template
    });
    
  } catch (error) {
    console.error('❌ Update template error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE /api/templates/:id - Soft delete template
 */
export const deleteTemplate = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    
    const template = await Template.findOne({ 
      _id: id, 
      accountId,
      deleted: false 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    template.deleted = true;
    await template.save();
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete template error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/templates/sync - Sync templates from WhatsApp Manager
 */
export const syncTemplates = async (req, res) => {
  try {
    const accountId = req.accountId;
    
    // Get phone number config to get WABA ID and access token
    const phoneConfig = await PhoneNumber.findOne({ 
      accountId, 
      isActive: true 
    }).select('+accessToken');
    
    if (!phoneConfig || !phoneConfig.wabaId) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp Business Account not configured. Please add your phone number first.'
      });
    }

    const wabaId = phoneConfig.wabaId;
    const accessToken = phoneConfig.accessToken;

    // Fetch templates from WhatsApp API
    const response = await axios.get(
      `${GRAPH_API_URL}/${wabaId}/message_templates`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: 100 }
      }
    );

    const metaTemplates = response.data.data || [];
    
    if (metaTemplates.length === 0) {
      return res.json({
        success: true,
        message: 'No templates found in WhatsApp Manager',
        synced: 0,
        created: 0,
        updated: 0
      });
    }

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    for (const metaTemplate of metaTemplates) {
      try {
        // Extract template details
        const name = metaTemplate.name;
        const language = metaTemplate.language;
        const category = metaTemplate.category;
        const status = metaTemplate.status; // APPROVED, PENDING, REJECTED
        const metaTemplateId = metaTemplate.id;
        const components = metaTemplate.components || [];

        // Extract content from BODY component
        let content = '';
        let variables = [];
        
        const bodyComponent = components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
          content = bodyComponent.text;
          
          // Extract variables ({{1}}, {{2}}, etc.)
          const variableMatches = content.match(/\{\{(\d+)\}\}/g) || [];
          variables = [...new Set(variableMatches.map(v => v.replace(/[{}]/g, '')))];
        }

        // Check if template already exists
        const existingTemplate = await Template.findOne({
          accountId: accountId,
          metaTemplateId: metaTemplateId
        });

        if (existingTemplate) {
          // Update existing template
          existingTemplate.name = name;
          existingTemplate.language = language;
          existingTemplate.category = category;
          existingTemplate.content = content;
          existingTemplate.variables = variables;
          existingTemplate.components = components;
          existingTemplate.status = status.toLowerCase();
          
          if (status === 'REJECTED' && metaTemplate.rejected_reason) {
            existingTemplate.rejectedReason = metaTemplate.rejected_reason;
          }
          
          await existingTemplate.save();
          updatedCount++;
        } else {
          // Create new template
          await Template.create({
            accountId: accountId,
            name: name,
            language: language,
            category: category,
            content: content,
            variables: variables,
            components: components,
            status: status.toLowerCase(),
            metaTemplateId: metaTemplateId,
            usageCount: 0,
            rejectedReason: status === 'REJECTED' ? metaTemplate.rejected_reason : null
          });
          createdCount++;
        }

        syncedCount++;
      } catch (err) {
        console.error(`❌ Error processing template ${metaTemplate.name}:`, err.message);
      }
    }

    // Get updated stats
    const stats = {
      approved: await Template.countDocuments({ accountId, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId, status: 'draft', deleted: false }),
      total: await Template.countDocuments({ accountId, deleted: false })
    };

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} templates from WhatsApp Manager`,
      synced: syncedCount,
      created: createdCount,
      updated: updatedCount,
      stats
    });
    
  } catch (error) {
    console.error('❌ Sync templates error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  syncTemplates
};
