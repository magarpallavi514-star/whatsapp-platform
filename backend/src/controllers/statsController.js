import whatsappService from '../services/whatsappService.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Contact from '../models/Contact.js';
import PhoneNumber from '../models/PhoneNumber.js';

/**
 * Stats Controller
 * Provides analytics and statistics
 */

/**
 * GET /api/stats - Get platform statistics
 */
export const getStats = async (req, res) => {
  try {
    const accountId = req.account.accountId || req.accountId; // Use STRING for WhatsApp models
    const { phoneNumberId } = req.query;
    
    // Get messaging stats from service
    const messageStats = await whatsappService.getStats(accountId, phoneNumberId);
    
    // Get additional stats
    const query = { accountId };
    if (phoneNumberId) query.phoneNumberId = phoneNumberId;
    
    const [
      totalContacts,
      totalConversations,
      openConversations,
      unreadCount,
      phoneNumbers
    ] = await Promise.all([
      Contact.countDocuments({ accountId }),
      Conversation.countDocuments(query),
      Conversation.countDocuments({ ...query, status: 'open' }),
      Conversation.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$unreadCount' } } }
      ]),
      PhoneNumber.find({ accountId, isActive: true })
        .select('phoneNumberId displayName displayPhone messageCount qualityRating')
        .lean()
    ]);
    
    res.json({
      success: true,
      stats: {
        // Message stats
        ...messageStats,
        
        // Contact stats
        totalContacts,
        
        // Conversation stats
        totalConversations,
        openConversations,
        closedConversations: totalConversations - openConversations,
        unreadMessages: unreadCount[0]?.total || 0,
        
        // Phone numbers
        phoneNumbers
      }
    });
    
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/stats/daily - Get daily message statistics
 */
export const getDailyStats = async (req, res) => {
  try {
    const accountId = req.account.accountId || req.accountId; // Use STRING for WhatsApp models
    const { phoneNumberId, days = 7 } = req.query;
    
    const query = { accountId };
    if (phoneNumberId) query.phoneNumberId = phoneNumberId;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    
    const dailyStats = await Message.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      success: true,
      stats: dailyStats
    });
    
  } catch (error) {
    console.error('❌ Get daily stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getStats,
  getDailyStats
};
