import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 10000,
});

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};

export const getIncidents = async (params = {}) => {
  const { data } = await api.get("/api/incidents", { params });
  return data;
};

export const getBuses = async () => {
  const { data } = await api.get("/api/buses");
  return data;
};

export default api;
