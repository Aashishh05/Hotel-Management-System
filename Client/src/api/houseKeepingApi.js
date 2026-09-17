import api from "./axios.js";

export const createTask = async (taskData) => {
  const res = await api.post("/houseKeeping/create", taskData);
  return res.data;
};

export const getAllTasks = async () => {
  const res = await api.get("/houseKeeping/get");
  return res.data;
};

export const getTasksByRoom = async (roomId) => {
  const res = await api.get(`/houseKeeping/get/room/${roomId}`);
  return res.data;
};

export const getTasksByEmployee = async (employeeId) => {
  const res = await api.get(`/houseKeeping/get/employee/${employeeId}`);
  return res.data;
};

export const getTasksByStatus = async (status) => {
  const res = await api.get(`/houseKeeping/get/status/${status}`);
  return res.data;
};

export const getTaskById = async (id) => {
  const res = await api.get(`/houseKeeping/get/${id}`);
  return res.data;
};

export const updateTask = async (id, taskData) => {
  const res = await api.put(`/houseKeeping/update/${id}`, taskData);
  return res.data;
};

export const startTask = async (id) => {
  const res = await api.put(`/houseKeeping/start/${id}`);
  return res.data;
};

export const completeTask = async (id) => {
  const res = await api.put(`/houseKeeping/complete/${id}`);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/houseKeeping/delete/${id}`);
  return res.data;
};