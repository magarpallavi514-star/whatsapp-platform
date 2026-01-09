import broadcastService from '../services/broadcastService.js';
import broadcastExecutionService from '../services/broadcastExecutionService.js';

export const createBroadcast = async (req, res) => {
  try {
    const { accountId, phoneNumberId } = req.params;
    const data = req.body;

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
    const { accountId, phoneNumberId } = req.params;
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
    const { accountId, broadcastId } = req.params;

    const broadcast = await broadcastService.getBroadcastById(accountId, broadcastId);

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
    const { accountId, phoneNumberId, broadcastId } = req.params;

    const broadcast = await broadcastService.startBroadcast(accountId, broadcastId);

    // Execute broadcast asynchronously
    broadcastExecutionService.executeBroadcast(
      accountId,
      broadcastId,
      phoneNumberId
    ).catch(err => console.error('Broadcast execution error:', err));

    res.status(200).json({
      success: true,
      message: 'Broadcast started',
      data: broadcast
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
