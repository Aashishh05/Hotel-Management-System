import api from "./axios.js";

const buildRoomFormData = (roomData, files = []) => {
  const formData = new FormData();

  Object.entries(roomData || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
  });

  files.forEach((file) => formData.append("images", file));

  return formData;
};

export const createRoom = async (roomData, files = []) => {
  const res = await api.post("/room/create", buildRoomFormData(roomData, files));

  return res.data;
};

export const getAllRooms = async (params = {}) => {
  const res = await api.get("/room/get", { params });

  return res.data;
};

export const getPublicRooms = async () => {
  const res = await api.get("/room/public");

  return res.data;
};

export const getAvailableRooms = async () => {
  const res = await api.get("/room/get/available");

  return res.data;
};

export const getRoomAvailability = async (checkIn, checkOut) => {
  const res = await api.get("/room/get/availability", {
    params: { checkIn, checkOut },
  });

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

export const updateRoom = async (id, roomData, files = []) => {
  const res = await api.put(
    `/room/update/${id}`,
    buildRoomFormData(roomData, files),
  );

  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/room/delete/${id}`);

  return res.data;
};