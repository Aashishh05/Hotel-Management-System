import api from "./axios.js";

export const registerApi = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const loginApi = async (Credentials) => {
  const res = await api.post("/auth/login", Credentials);
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
