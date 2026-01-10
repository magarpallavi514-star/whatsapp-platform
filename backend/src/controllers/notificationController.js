import notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const result = await notificationService.getNotifications(accountId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId, accountId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const accountId = req.accountId;

    const result = await notificationService.markAllAsRead(accountId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      accountId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
