import api from "./axios.js";

export const createRole = async (roleData) => {
  const res = await api.post("/role/create", roleData);

  return res.data;
};

export const getAllRoles = async () => {
  const res = await api.get("/role/get");

  return res.data;
};

export const getRoleById = async (id) => {
  const res = await api.get(`/role/get/${id}`);

  return res.data;
};

export const updateRole = async (id, roleData) => {
  const res = await api.put(`/role/update/${id}`, roleData);

  return res.data;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`/role/delete/${id}`);

  return res.data;
};
