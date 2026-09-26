import api from "./axios.js";

export const createBooking = async (bookingData) => {
  const res = await api.post("/bookings/create", bookingData);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get("/bookings/get");
  return res.data;
};

export const getBookingsByGuest = async (guestId) => {
  const res = await api.get(`/bookings/get/guest/${guestId}`);
  return res.data;
};

export const getBookingsByRoom = async (roomId) => {
  const res = await api.get(`/bookings/get/room/${roomId}`);
  return res.data;
};

export const getBookingsByStatus = async (status) => {
  const res = await api.get(`/bookings/get/status/${status}`);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/get/${id}`);
  return res.data;
};

export const updateBooking = async (id, bookingData) => {
  const res = await api.put(`/bookings/update/${id}`, bookingData);
  return res.data;
};

export const confirmBooking = async (id) => {
  const res = await api.patch(`/bookings/confirm/${id}`);
  return res.data;
};

export const checkInBooking = async (id) => {
  const res = await api.patch(`/bookings/check-in/${id}`);
  return res.data;
};

export const checkOutBooking = async (id) => {
  const res = await api.patch(`/bookings/check-out/${id}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/delete/${id}`);
  return res.data;
};