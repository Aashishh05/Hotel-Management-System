import api from "./axios.js";

export const createUser = async (userData) => {
  const res = await api.post("/user/create", userData);

  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/user/get");

  return res.data;
};

export const getUsersByRole = async (roleId) => {
  const res = await api.get(`/user/get/role/${roleId}`);

  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/user/get/${id}`);

  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`/user/update/${id}`, userData);

  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/user/delete/${id}`);

  return res.data;
};
