// src/api/quiz.js
import api from "./index"; // your axios instance

export async function saveQuizResult(token, quizData) {
  try {
    const res = await api.post("/dashboard/save/quiz", quizData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to save quiz result");
  }
}

export async function getQuizResultByTopic(token, topic) {
  try {
    const res = await api.get(`/dashboard/quiz-result/${encodeURIComponent(topic)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch quiz result");
  }
}
