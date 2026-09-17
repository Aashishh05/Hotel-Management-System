import api from "./axios.js";

export const createRoom = async (roomData) => {
  const res = await api.post("/room/create", roomData);

  return res.data;
};

export const getAllRooms = async () => {
  const res = await api.get("/room/get");

  return res.data;
};

export const getAvailableRooms = async () => {
  const res = await api.get("/room/get/available");

  return res.data;
};

export const getRoomsByStatus = async (status) => {
  const res = await api.get(`/room/get/status/${status}`);

  return res.data;
};

export const getRoomById = async (id) => {
  const res = await api.get(`/room/get/${id}`);

  return res.data;
};

export const updateRoom = async (id, roomData) => {
  const res = await api.put(`/room/update/${id}`, roomData);

  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/room/delete/${id}`);

  return res.data;
};
