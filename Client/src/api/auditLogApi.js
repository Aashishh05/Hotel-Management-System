import api from "./axios.js";

export const getAuditLogs = async (params = {}) => {
  const res = await api.get("/auditLog", { params });
  return res.data;
};

export const getActivityStats = async () => {
  const res = await api.get("/auditLog/stats");
  return res.data;
};

export const getAuditLogById = async (id) => {
  const res = await api.get(`/auditLog/${id}`);
  return res.data;
};