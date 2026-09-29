import api from "./axios.js";

export const getAvailableMenuItems = async () => {
  const res = await api.get("/menu/available");
  return res.data;
};