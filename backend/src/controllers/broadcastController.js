import broadcastService from '../services/broadcastService.js';
import broadcastExecutionService from '../services/broadcastExecutionService.js';
import PhoneNumber from '../models/PhoneNumber.js';

export const createBroadcast = async (req, res) => {
  try {
    // Get accountId from JWT middleware (use ObjectId for PhoneNumber queries)
    const accountObjectId = req.account._id;
    const accountId = req.accountId || req.params.accountId;
    let phoneNumberId = req.params.phoneNumberId || req.body.phoneNumberId;
    const data = req.body;

    // If phoneNumberId not provided, fetch the first active phone number for the account
    if (!phoneNumberId || phoneNumberId === 'default') {
      const activePhone = await PhoneNumber.findOne({
        accountId: accountObjectId,  // Use ObjectId for database query
        isActive: true
      });

      if (!activePhone) {
        return res.status(400).json({
          success: false,
          error: '🚨 WhatsApp Business Account not connected!\n\nPlease connect your WhatsApp account in Settings first:\n1. Go to Dashboard > Settings\n2. Click "Add Phone Number"\n3. Enter your Phone Number ID, WABA ID, and Access Token\n4. Click "Add" to complete setup'
        });
      }

      phoneNumberId = activePhone.phoneNumberId;
    }

    const broadcast = await broadcastService.createBroadcast(
      accountId,
      phoneNumberId,
      data
    );

    res.status(201).json({
      success: true,
      data: broadcast
    });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getBroadcasts = async (req, res) => {
  try {
    // Get accountId from JWT middleware
    const accountId = req.accountId || req.params.accountId;
    const phoneNumberId = req.params.phoneNumberId || 'any';
    const { status, limit, skip } = req.query;

    const result = await broadcastService.getBroadcasts(
      accountId,
      phoneNumberId,
      { status, limit: parseInt(limit) || 50, skip: parseInt(skip) || 0 }
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting broadcasts:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getBroadcastById = async (req, res) => {
  try {
    // Get accountId from JWT middleware (always available for protected routes)
    const accountId = req.accountId;
    
    // Get broadcastId from params - could be from different route formats:
    // 1. GET /api/broadcasts/:broadcastId
    // 2. GET /api/:accountId/broadcasts/:broadcastId
    const broadcastId = req.params.broadcastId || req.params.accountId;
    
    if (!broadcastId) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      });
    }

    console.log(`📊 Fetching broadcast ${broadcastId} for account ${accountId}`);
    
    const broadcast = await broadcastService.getBroadcastById(accountId, broadcastId);

    if (!broadcast) {
      console.log(`❌ Broadcast ${broadcastId} not found for account ${accountId}`);
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      });
    }

    console.log(`✅ Broadcast ${broadcastId} found`);
    res.status(200).json({
      success: true,
      data: broadcast
    });
  } catch (error) {
    console.error('Error getting broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateBroadcast = async (req, res) => {
  try {
    const { accountId, broadcastId } = req.params;
    const data = req.body;

    const broadcast = await broadcastService.updateBroadcast(accountId, broadcastId, data);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      });
    }

    res.status(200).json({
      success: true,
      data: broadcast
    });
  } catch (error) {
    console.error('Error updating broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const startBroadcast = async (req, res) => {
  try {
    const accountId = req.accountId || req.params.accountId;
    const broadcastId = req.params.broadcastId;

    // First get the broadcast to extract phoneNumberId
    const broadcast = await broadcastService.getBroadcastById(accountId, broadcastId);
    
    if (!broadcast) {
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      });
    }

    // Use phoneNumberId from broadcast, fallback to body or params
    const phoneNumberId = req.params.phoneNumberId || req.body.phoneNumberId || broadcast.phoneNumberId;
    
    if (!phoneNumberId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number not configured for this broadcast'
      });
    }

    // Start the broadcast
    const updatedBroadcast = await broadcastService.startBroadcast(accountId, broadcastId);

    // Execute broadcast asynchronously
    broadcastExecutionService.executeBroadcast(
      accountId,
      broadcastId,
      phoneNumberId
    ).catch(err => console.error('Broadcast execution error:', err));

    res.status(200).json({
      success: true,
      message: 'Broadcast started',
      data: updatedBroadcast
    });
  } catch (error) {
    console.error('Error starting broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const cancelBroadcast = async (req, res) => {
  try {
    const { accountId, broadcastId } = req.params;

    const broadcast = await broadcastService.cancelBroadcast(accountId, broadcastId);

    res.status(200).json({
      success: true,
      message: 'Broadcast cancelled',
      data: broadcast
    });
  } catch (error) {
    console.error('Error cancelling broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getBroadcastStats = async (req, res) => {
  try {
    const { accountId, broadcastId } = req.params;

    const stats = await broadcastService.getBroadcastStats(accountId, broadcastId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting broadcast stats:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteBroadcast = async (req, res) => {
  try {
    // Get accountId from JWT middleware
    const accountId = req.accountId;
    
    // Get broadcastId from params
    const broadcastId = req.params.broadcastId || req.params.accountId;
    
    if (!broadcastId) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      });
    }

    console.log(`🗑️ Deleting broadcast ${broadcastId} for account ${accountId}`);
    
    const result = await broadcastService.deleteBroadcast(accountId, broadcastId);

    if (!result) {
      console.log(`❌ Broadcast ${broadcastId} not found for deletion`);
      return res.status(404).json({
        success: false,
        error: 'Broadcast not found'
      });
    }

    console.log(`✅ Broadcast ${broadcastId} deleted successfully`);
    res.status(200).json({
      success: true,
      message: 'Broadcast deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
