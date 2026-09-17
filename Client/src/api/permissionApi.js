import api from "./axios.js";

export const createPermission = async (permissionData) => {
  const res = await api.post("/permission/create", permissionData);

  return res.data;
};

export const getAllPermissions = async () => {
  const res = await api.get("/permission/get");

  return res.data;
};

export const getMyPermissions = async () => {
  const res = await api.get("/permission/my-permissions");

  return res.data;
};

export const getPermissionById = async (id) => {
  const res = await api.get(`/permission/get/id/${id}`);

  return res.data;
};

export const getPermissionByRole = async (roleId) => {
  const res = await api.get(`/permission/get/role/${roleId}`);

  return res.data;
};

export const updatePermissionByRole = async (roleId, permissionData) => {
  const res = await api.put(`/permission/update/${roleId}`, permissionData);

  return res.data;
};

export const deletePermissionByRole = async (roleId) => {
  const res = await api.delete(`/permission/delete/${roleId}`);

  return res.data;
};
