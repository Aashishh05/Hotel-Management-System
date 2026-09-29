import api from "./axios.js";

export const getAvailableMenuItems = async () => {
  const res = await api.get("/menu/available");
  return res.data;
};

export const getAllMenuItems = async () => {
  const res = await api.get("/menu/get");
  return res.data;
};

export const createMenuItem = async (menuItemData) => {
  const res = await api.post("/menu/create", menuItemData);
  return res.data;
};

export const updateMenuItem = async (id, menuItemData) => {
  const res = await api.put(`/menu/update/${id}`, menuItemData);
  return res.data;
};

export const deleteMenuItem = async (id) => {
  const res = await api.delete(`/menu/delete/${id}`);
  return res.data;
};