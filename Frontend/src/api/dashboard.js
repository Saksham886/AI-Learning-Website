// src/api/dashboard.js
import api from "./index";

export async function getDashboardData(token) {
  try {
    const res = await api.get("/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch dashboard data");
  }
}
