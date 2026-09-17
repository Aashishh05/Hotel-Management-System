import api from "./axios.js";

export const createGuest = async (guestData) => {
  const res = await api.post("/guest/create", guestData);
  return res.data;
};

export const getAllGuests = async () => {
  const res = await api.get("/guest/get");
  return res.data;
};

export const getGuestById = async (id) => {
  const res = await api.get(`/guest/get/${id}`);
  return res.data;
};

export const updateGuest = async (id, guestData) => {
  const res = await api.put(`/guest/update/${id}`, guestData);
  return res.data;
};

export const deleteGuest = async (id) => {
  const res = await api.delete(`/guest/delete/${id}`);
  return res.data;
};
