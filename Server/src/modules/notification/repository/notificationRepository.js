import Notification from "../model/notificationModel.js";

const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};

const getNotificationsByUser = async (userId, filter = {}, options = {}) => {
  const { page = 1, limit = 20 } = options;

  const skip = (page - 1) * limit;

  const query = {
    user: userId,
    ...filter,
  };

  const [notifications, totalNotifications] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    totalNotifications,
    page,
    limit,
    totalPages: Math.ceil(totalNotifications / limit),
  };
};

const getNotificationById = async (id, userId) => {
  return await Notification.findOne({
    _id: id,
    user: userId,
  });
};

const markAsRead = async (id, userId) => {
  return await Notification.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    },
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
    },
  );
};

const deleteNotification = async (id, userId) => {
  return await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });
};

export default {
  createNotification,
  getNotificationsByUser,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
