import api from "./axios.js";

export const createBilling = async (billingData) => {
  const res = await api.post("/billing/create", billingData);
  return res.data;
};

export const getAllBillings = async () => {
  const res = await api.get("/billing/get");
  return res.data;
};

export const getBillingByBooking = async (bookingId) => {
  const res = await api.get(`/billing/get/booking/${bookingId}`);
  return res.data;
};

export const getBillingsByGuest = async (guestId) => {
  const res = await api.get(`/billing/get/guest/${guestId}`);
  return res.data;
};

export const getBillingsByStatus = async (status) => {
  const res = await api.get(`/billing/get/status/${status}`);
  return res.data;
};

export const getBillingById = async (id) => {
  const res = await api.get(`/billing/get/${id}`);
  return res.data;
};

export const updateBilling = async (id, billingData) => {
  const res = await api.put(`/billing/update/${id}`, billingData);
  return res.data;
};

export const deleteBilling = async (id) => {
  const res = await api.delete(`/billing/delete/${id}`);
  return res.data;
};
