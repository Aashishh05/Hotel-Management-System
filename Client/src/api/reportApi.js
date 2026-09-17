import api from "./axios.js";

export const getDashboardReport = async () => {
  const res = await api.get("/reports/dashboard");
  return res.data;
};
