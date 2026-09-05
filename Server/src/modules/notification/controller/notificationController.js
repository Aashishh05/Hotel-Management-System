import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import notificationServices from "../services/notificationServices.js";

export const createNotification = asyncErrorHandler(async (req, res) => {
  const notification = await notificationServices.createNotification(req.body);

  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

export const getNotifications = asyncErrorHandler(async (req, res) => {
  const result = await notificationServices.getNotifications(
    req.user._id,
    req.query,
  );

  res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
});

export const getNotificationById = asyncErrorHandler(async (req, res) => {
  const notification = await notificationServices.getNotificationById(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Notification fetched successfully",
    data: notification,
  });
});

export const markNotificationAsRead = asyncErrorHandler(async (req, res) => {
  const notification = await notificationServices.markAsRead(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

export const markAllNotificationsAsRead = asyncErrorHandler(
  async (req, res) => {
    const result = await notificationServices.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  },
);

export const deleteNotification = asyncErrorHandler(async (req, res) => {
  await notificationServices.deleteNotification(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});
