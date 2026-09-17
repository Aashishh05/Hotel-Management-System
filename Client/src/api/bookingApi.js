import api from "./axios.js";

export const createBooking = async (bookingData) => {
  const res = await api.post("/booking/create", bookingData);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get("/booking/get");
  return res.data;
};

export const getBookingsByGuest = async (guestId) => {
  const res = await api.get(`/booking/get/guest/${guestId}`);
  return res.data;
};

export const getBookingsByRoom = async (roomId) => {
  const res = await api.get(`/booking/get/room/${roomId}`);
  return res.data;
};

export const getBookingsByStatus = async (status) => {
  const res = await api.get(`/booking/get/status/${status}`);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/booking/get/${id}`);
  return res.data;
};

export const updateBooking = async (id, bookingData) => {
  const res = await api.put(`/booking/update/${id}`, bookingData);
  return res.data;
};

export const checkInBooking = async (id) => {
  const res = await api.patch(`/booking/check-in/${id}`);
  return res.data;
};

export const checkOutBooking = async (id) => {
  const res = await api.patch(`/booking/check-out/${id}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await api.delete(`/booking/delete/${id}`);
  return res.data;
};
