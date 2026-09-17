import api from "./axios.js";

export const createRequest = async (requestData) => {
  const res = await api.post("/maintenance/create", requestData);
  return res.data;
};

export const getAllRequests = async () => {
  const res = await api.get("/maintenance/get");
  return res.data;
};

export const getRequestById = async (id) => {
  const res = await api.get(`/maintenance/get/${id}`);
  return res.data;
};

export const getRequestsByRoom = async (roomId) => {
  const res = await api.get(`/maintenance/get/room/${roomId}`);
  return res.data;
};

export const getRequestsByEmployee = async (employeeId) => {
  const res = await api.get(`/maintenance/get/employee/${employeeId}`);
  return res.data;
};

export const getRequestsByStatus = async (status) => {
  const res = await api.get(`/maintenance/get/status/${status}`);
  return res.data;
};

export const getRequestsByPriority = async (priority) => {
  const res = await api.get(`/maintenance/get/priority/${priority}`);
  return res.data;
};

export const updateRequest = async (id, requestData) => {
  const res = await api.put(`/maintenance/update/${id}`, requestData);
  return res.data;
};

export const deleteRequest = async (id) => {
  const res = await api.delete(`/maintenance/delete/${id}`);
  return res.data;
};
