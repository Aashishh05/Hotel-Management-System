
import notificationRepository from "../repository/notificationRepository.js";

const createNotification = async (notificationData) => {
  const notification =
    await notificationRepository.createNotification(notificationData);

  return notification;
};

const getNotifications = async (userId, query) => {
  const {
    page = 1,
    limit = 20,
    isRead,
  } = query;

  const filter = {};

  if (isRead !== undefined) {
    filter.isRead = isRead === "true";
  }

  return await notificationRepository.getNotificationsByUser(
    userId,
    filter,
    {
      page: Number(page),
      limit: Number(limit),
    }
  );
};

const getNotificationById = async (id, userId) => {
  const notification =
    await notificationRepository.getNotificationById(
      id,
      userId
    );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAsRead = async (id, userId) => {
  const notification =
    await notificationRepository.markAsRead(id, userId);

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

const deleteNotification = async (id, userId) => {
  const notification =
    await notificationRepository.deleteNotification(
      id,
      userId
    );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

export default {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
