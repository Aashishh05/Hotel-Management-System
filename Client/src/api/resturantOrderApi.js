import api from "./axios.js";

export const createOrder = async (orderData) => {
  const res = await api.post("/resturant-order/create", orderData);
  return res.data;
};

export const getAllOrders = async () => {
  const res = await api.get("/resturant-order/get");
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/resturant-order/get/${id}`);
  return res.data;
};

export const getOrdersByGuest = async (guestId) => {
  const res = await api.get(`/resturant-order/get/guest/${guestId}`);
  return res.data;
};

export const getOrdersByRoom = async (roomId) => {
  const res = await api.get(`/resturant-order/get/room/${roomId}`);
  return res.data;
};

export const getOrdersByStatus = async (status) => {
  const res = await api.get(`/resturant-order/get/status/${status}`);
  return res.data;
};

export const updateOrder = async (id, orderData) => {
  const res = await api.put(`/resturant-order/update/${id}`, orderData);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await api.delete(`/resturant-order/delete/${id}`);
  return res.data;
};
