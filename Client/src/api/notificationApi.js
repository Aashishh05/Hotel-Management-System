import api from "./axios.js";

export const createNotification = async (notificationData) => {
  const res = await api.post("/notification/create", notificationData);
  return res.data;
};

export const getNotifications = async () => {
  const res = await api.get("/notification/get");
  return res.data;
};

export const getNotificationById = async (id) => {
  const res = await api.get(`/notification/get/${id}`);
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await api.put(`/notification/update/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/notification/delete/${id}`);
  return res.data;
};
