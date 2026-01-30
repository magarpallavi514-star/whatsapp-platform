/**
 * CRM Controller - Manage WhatsApp Business Account
 * 
 * Features:
 * - Dashboard overview
 * - Contact management
 * - Conversation tracking
 * - Message history
 * - Analytics & metrics
 */

import PhoneNumber from '../models/PhoneNumber.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * GET /api/crm/dashboard
 * Get CRM dashboard overview for connected WABA
 */
export const getCRMDashboard = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    
    console.log('📊 CRM DASHBOARD REQUEST');
    console.log('  Account:', accountId);
    
    // 1. Get account & WABA info
    const account = await Account.findOne({ accountId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // 2. Check if WABA is synced
    const wabaReady = account.wabaId && account.businessId;
    
    if (!wabaReady) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp Business Account not fully synced yet',
        status: {
          wabaId: account.wabaId ? 'synced' : 'pending',
          businessId: account.businessId ? 'synced' : 'pending'
        }
      });
    }
    
    // 3. Get phone numbers
    const phoneNumbers = await PhoneNumber.find({ accountId }).lean();
    
    // 4. Get contacts count
    const totalContacts = await Contact.countDocuments({ accountId });
    const activeContacts = await Contact.countDocuments({ 
      accountId,
      lastMessageAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } // Last 30 days
    });
    
    // 5. Get conversations
    const totalConversations = await Conversation.countDocuments({ accountId });
    const openConversations = await Conversation.countDocuments({ 
      accountId,
      status: 'open'
    });
    const closedConversations = await Conversation.countDocuments({
      accountId,
      status: 'closed'
    });
    
    // 6. Get message statistics
    const messageStats = await Message.aggregate([
      { $match: { accountId: accountId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0] } },
          received: { $sum: { $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0] } },
          today: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const messages = messageStats.length > 0 ? messageStats[0] : {
      total: 0,
      sent: 0,
      received: 0,
      today: 0
    };
    
    // 7. Get recent conversations
    const recentConversations = await Conversation.find({ accountId })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .select('contactId contactName status lastMessage lastMessageAt')
      .lean();
    
    // 8. Get top contacts by message count
    const topContacts = await Message.aggregate([
      { $match: { accountId: accountId } },
      { $group: { _id: '$contactId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: '_id',
          as: 'contact'
        }
      }
    ]);
    
    console.log('✅ CRM Dashboard generated');
    
    res.json({
      success: true,
      data: {
        account: {
          name: account.name,
          wabaId: account.wabaId,
          businessId: account.businessId,
          syncStatus: 'synced',
          lastSync: account.metaSync?.lastWebhookAt
        },
        
        phoneNumbers: {
          total: phoneNumbers.length,
          list: phoneNumbers.map(p => ({
            id: p._id,
            number: p.displayPhone,
            isActive: p.isActive,
            quality: p.qualityRating,
            verified: !!p.verifiedAt
          }))
        },
        
        contacts: {
          total: totalContacts,
          active: activeContacts,
          lastWeekGrowth: activeContacts > 0 ? '+' + activeContacts : '0'
        },
        
        conversations: {
          total: totalConversations,
          open: openConversations,
          closed: closedConversations,
          activeRate: totalConversations > 0 
            ? Math.round((openConversations / totalConversations) * 100) 
            : 0
        },
        
        messages: {
          total: messages.total,
          sent: messages.sent,
          received: messages.received,
          today: messages.today,
          avgPerDay: messages.total > 0 
            ? Math.round(messages.total / 30)
            : 0
        },
        
        recent: {
          conversations: recentConversations,
          topContacts: topContacts.map(ct => ({
            id: ct._id,
            name: ct.contact[0]?.name || 'Unknown',
            messages: ct.count,
            phone: ct.contact[0]?.phone
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('❌ CRM Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/crm/contacts
 * Get all contacts for account
 */
export const getCRMContacts = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { search, sort = 'lastMessageAt', order = -1, limit = 50, skip = 0 } = req.query;
    
    let query = { accountId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const contacts = await Contact.find(query)
      .sort({ [sort]: parseInt(order) })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('name phone email lastMessageAt unreadCount avatar')
      .lean();
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Get CRM contacts error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/crm/conversations
 * Get conversations with filters
 */
export const getCRMConversations = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { status, limit = 50, skip = 0 } = req.query;
    
    let query = { accountId };
    if (status) query.status = status;
    
    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('contactId contactName status lastMessage lastMessageAt unreadCount')
      .lean();
    
    const total = await Conversation.countDocuments(query);
    
    res.json({
      success: true,
      data: conversations,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
    
  } catch (error) {
    console.error('❌ Get CRM conversations error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/crm/contacts
 * Create new contact manually
 */
export const createCRMContact = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { name, phone, email, tags } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }
    
    // Check if contact already exists
    const existing = await Contact.findOne({ accountId, phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone already exists'
      });
    }
    
    const contact = new Contact({
      accountId,
      name,
      phone,
      email,
      tags: tags || [],
      createdAt: new Date()
    });
    
    await contact.save();
    
    res.json({
      success: true,
      data: contact
    });
    
  } catch (error) {
    console.error('❌ Create CRM contact error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/crm/contacts/:id
 * Update contact
 */
export const updateCRMContact = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { id } = req.params;
    const { name, email, tags, notes } = req.body;
    
    const contact = await Contact.findOneAndUpdate(
      { _id: id, accountId },
      { name, email, tags, notes },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
    
  } catch (error) {
    console.error('❌ Update CRM contact error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/crm/conversation/:conversationId
 * Get full conversation history
 */
export const getCRMConversationDetail = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      accountId
    }).lean();
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const messages = await Message.find({
      conversationId,
      accountId
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(),
        total: await Message.countDocuments({ conversationId, accountId })
      }
    });
    
  } catch (error) {
    console.error('❌ Get conversation detail error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/crm/analytics
 * Get CRM analytics and metrics
 */
export const getCRMAnalytics = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Message trend
    const messageTrend = await Message.aggregate([
      {
        $match: {
          accountId: accountId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0] } },
          received: { $sum: { $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Response time
    const avgResponseTime = await Message.aggregate([
      {
        $match: {
          accountId: accountId,
          createdAt: { $gte: startDate },
          direction: 'outgoing'
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);
    
    // Contact growth
    const contactGrowth = await Contact.aggregate([
      {
        $match: {
          accountId: accountId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        messageTrend,
        avgResponseTime: avgResponseTime[0]?.avgTime || 0,
        contactGrowth,
        period: `Last ${days} days`
      }
    });
    
  } catch (error) {
    console.error('❌ Get CRM analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getCRMDashboard,
  getCRMContacts,
  getCRMConversations,
  createCRMContact,
  updateCRMContact,
  getCRMConversationDetail,
  getCRMAnalytics
};
