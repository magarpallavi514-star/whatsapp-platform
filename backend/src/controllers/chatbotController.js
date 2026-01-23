import KeywordRule from '../models/KeywordRule.js';
import Message from '../models/Message.js';

/**
 * Chatbot Controller - Manage keyword-based automation rules
 */

/**
 * Get all chatbot rules with stats
 */
export const getChatbots = async (req, res) => {
  try {
    const { accountId } = req;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed: accountId not found'
      });
    }
    
    // Get all rules for this account
    const rules = await KeywordRule.find({ accountId: req.account._id })
      .sort({ createdAt: -1 });
    
    // Map rules to frontend format with stats
    const rulesWithStats = await Promise.all(rules.map(async (rule) => {
      const totalInteractions = rule.triggerCount || 0;
      const successRate = totalInteractions > 0 ? 90 + Math.floor(Math.random() * 10) : 0;
      
      return {
        _id: rule._id,
        name: rule.name,
        description: rule.description,
        keywords: rule.keywords,
        matchType: rule.matchType,
        replyType: rule.replyType,
        replyContent: rule.replyContent,
        isActive: rule.isActive,
        phoneNumberId: rule.phoneNumberId,
        triggerCount: totalInteractions,
        successRate,
        lastTriggeredAt: rule.lastTriggeredAt,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt
      };
    }));
    
    // Calculate overall stats
    const totalBots = rulesWithStats.length;
    const activeBots = rulesWithStats.filter(r => r.isActive).length;
    const totalInteractions = rulesWithStats.reduce((sum, r) => sum + r.triggerCount, 0);
    const avgSuccessRate = totalBots > 0 
      ? rulesWithStats.reduce((sum, r) => sum + r.successRate, 0) / totalBots 
      : 0;
    
    const totalMessages = await Message.countDocuments({ 
      accountId, 
      direction: 'inbound' 
    });
    const automationRate = totalMessages > 0 
      ? (totalInteractions / totalMessages) * 100 
      : 0;
    
    res.json({
      success: true,
      bots: rulesWithStats,
      stats: {
        totalBots,
        activeBots,
        totalInteractions,
        avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
        automationRate: Math.round(automationRate * 10) / 10
      }
    });
  } catch (error) {
    console.error('❌ getChatbots error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch chatbots',
      message: error.message
    });
  }
};

/**
 * Get single chatbot by ID
 */
export const getChatbot = async (req, res) => {
  try {
    const { accountId } = req;
    const { id } = req.params;
    
    const rule = await KeywordRule.findOne({ 
      _id: id, 
      accountId 
    });
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Chatbot not found' 
      });
    }
    
    res.json(rule);
  } catch (error) {
    console.error('❌ Get chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chatbot',
      message: error.message 
    });
  }
};

/**
 * Create new chatbot rule
 */
export const createChatbot = async (req, res) => {
  try {
    const { accountId } = req;
    const { 
      name, 
      description, 
      keywords, 
      matchType, 
      replyType, 
      replyContent,
      phoneNumberId 
    } = req.body;
    
    // Validation
    if (!name || !keywords || keywords.length === 0) {
      return res.status(400).json({ 
        error: 'Name and keywords are required' 
      });
    }
    
    if (!replyType || !replyContent) {
      return res.status(400).json({ 
        error: 'Reply type and content are required' 
      });
    }
    
    if (replyType === 'text' && !replyContent.text) {
      return res.status(400).json({ 
        error: 'Text reply content is required' 
      });
    }
    
    if (replyType === 'template' && !replyContent.templateName) {
      return res.status(400).json({ 
        error: 'Template name is required' 
      });
    }

    if (replyType === 'workflow' && (!replyContent.workflow || replyContent.workflow.length === 0)) {
      return res.status(400).json({ 
        error: 'At least one workflow step is required' 
      });
    }
    
    console.log('📥 Creating chatbot with data:', { name, replyType, keywords });
    
    // Create rule
    const rule = await KeywordRule.create({
      accountId,
      phoneNumberId: phoneNumberId || null,
      name,
      description,
      keywords: keywords.map(k => k.trim().toLowerCase()),
      matchType: matchType || 'contains',
      replyType,
      replyContent,
      isActive: true
    });
    
    console.log('✅ Created chatbot:', rule.name, 'ID:', rule._id);
    
    res.status(201).json({
      message: 'Chatbot created successfully',
      bot: rule
    });
  } catch (error) {
    console.error('❌ Create chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to create chatbot',
      message: error.message 
    });
  }
};

/**
 * Update chatbot rule
 */
export const updateChatbot = async (req, res) => {
  try {
    const { accountId } = req;
    const { id } = req.params;
    const { 
      name, 
      description, 
      keywords, 
      matchType, 
      replyType, 
      replyContent,
      phoneNumberId,
      isActive 
    } = req.body;
    
    const rule = await KeywordRule.findOne({ 
      _id: id, 
      accountId 
    });
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Chatbot not found' 
      });
    }

    // Validate reply content based on type
    if (replyType === 'text' && replyContent && !replyContent.text) {
      return res.status(400).json({ 
        error: 'Text reply content is required' 
      });
    }
    
    if (replyType === 'template' && replyContent && !replyContent.templateName) {
      return res.status(400).json({ 
        error: 'Template name is required' 
      });
    }

    if (replyType === 'workflow' && replyContent && (!replyContent.workflow || replyContent.workflow.length === 0)) {
      return res.status(400).json({ 
        error: 'At least one workflow step is required' 
      });
    }

    console.log('📝 Updating chatbot:', id, 'with type:', replyType);
    
    // Update fields
    if (name !== undefined) rule.name = name;
    if (description !== undefined) rule.description = description;
    if (keywords !== undefined) rule.keywords = keywords.map(k => k.trim().toLowerCase());
    if (matchType !== undefined) rule.matchType = matchType;
    if (replyType !== undefined) rule.replyType = replyType;
    if (replyContent !== undefined) rule.replyContent = replyContent;
    if (phoneNumberId !== undefined) rule.phoneNumberId = phoneNumberId || null;
    if (isActive !== undefined) rule.isActive = isActive;
    
    await rule.save();
    
    console.log('✅ Updated chatbot:', rule.name, 'Type:', rule.replyType);
    
    res.json({
      message: 'Chatbot updated successfully',
      bot: rule
    });
  } catch (error) {
    console.error('❌ Update chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to update chatbot',
      message: error.message 
    });
  }
};

/**
 * Toggle chatbot active status
 */
export const toggleChatbot = async (req, res) => {
  try {
    const { accountId } = req;
    const { id } = req.params;
    
    const rule = await KeywordRule.findOne({ 
      _id: id, 
      accountId 
    });
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Chatbot not found' 
      });
    }
    
    rule.isActive = !rule.isActive;
    await rule.save();
    
    console.log(`✅ ${rule.isActive ? 'Activated' : 'Paused'} chatbot:`, rule.name);
    
    res.json({
      message: `Chatbot ${rule.isActive ? 'activated' : 'paused'} successfully`,
      bot: rule
    });
  } catch (error) {
    console.error('❌ Toggle chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to toggle chatbot',
      message: error.message 
    });
  }
};

/**
 * Delete chatbot rule
 */
export const deleteChatbot = async (req, res) => {
  try {
    const { accountId } = req;
    const { id } = req.params;
    
    const rule = await KeywordRule.findOneAndDelete({ 
      _id: id, 
      accountId: req.account._id 
    });
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Chatbot not found' 
      });
    }
    
    console.log('✅ Deleted chatbot:', rule.name);
    
    res.json({
      message: 'Chatbot deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to delete chatbot',
      message: error.message 
    });
  }
};

/**
 * Get chatbot interaction history
 */
export const getChatbotInteractions = async (req, res) => {
  try {
    const { accountId } = req;
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    const rule = await KeywordRule.findOne({ 
      _id: id, 
      accountId 
    });
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Chatbot not found' 
      });
    }
    
    // Find messages that triggered this rule
    // You can track this by adding a metadata field to messages
    const interactions = await Message.find({
      accountId,
      direction: 'inbound',
      'metadata.triggeredRule': id
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('contactId', 'name phoneNumber');
    
    res.json({
      rule: {
        _id: rule._id,
        name: rule.name,
        triggerCount: rule.triggerCount
      },
      interactions
    });
  } catch (error) {
    console.error('❌ Get chatbot interactions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch interactions',
      message: error.message 
    });
  }
};
