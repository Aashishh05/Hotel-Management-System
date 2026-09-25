import api from "./axios.js";

export const getDashboardSummary = async () => {
  const res = await api.get("/reports/summary");

  return res.data;
};