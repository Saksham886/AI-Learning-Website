// src/api/explanation.js
import api from "./index"; // your axios instance

export async function saveExplanation(token, explanationData) {
  try {
    const res = await api.post("/dashboard/save/explanation", explanationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to save explanation"
    );
  }
}
