
import notificationRepository from "../repository/notificationRepository.js";
import userRepository from "../../user/repository/userRepository.js";

const createNotification = async (notificationData) => {
  const notification =
    await notificationRepository.createNotification(notificationData);

  return notification;
};

/**
 * Fire-and-forget notifier for internal events. Never throws: a failed
 * notification must not roll back the business action that triggered it.
 */
const notifyUser = async ({ user, title, message, type, targetId, targetModule }) => {
  if (!user) return null;

  try {
    return await notificationRepository.createNotification({
      user,
      title,
      message,
      type,
      targetId: targetId || null,
      targetModule,
    });
  } catch (error) {
    console.error("Notification error:", error.message);
    return null;
  }
};

/**
 * Guests have no back-reference to their user account, they are only linked by
 * email. Resolves that link so events can reach the guest's notification bell.
 */
const notifyUserByEmail = async (email, payload) => {
  if (!email) return null;

  try {
    const user = await userRepository.getUserByEmail(email);

    if (!user) return null;

    return await notifyUser({ ...payload, user: user._id });
  } catch (error) {
    console.error("Notification error:", error.message);
    return null;
  }
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

const getUnreadCount = async (userId) => {
  const count = await notificationRepository.countUnreadByUser(userId);

  return { count };
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
  notifyUser,
  notifyUserByEmail,
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
