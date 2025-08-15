// src/api/progress.js
import api from "./index";

export async function getProgressData(token) {
  try {
    const res = await api.get("/dashboard/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch progress data");
  }
}
export async function getUserProgress(token, type = "all") {
  try {
    const res = await api.get(`/dashboard/progress?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load progress");
  }
}
