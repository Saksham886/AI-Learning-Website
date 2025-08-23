import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-learning-website.onrender.com", // backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
