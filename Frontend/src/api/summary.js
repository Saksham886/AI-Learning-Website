// src/api/summary.ts
import api from "./index"; // your axios instance

export async function summarizeUrl(url,language) {
  try {
    const res = await api.post("summarize/url", { url,language });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to summarize URL"
    );
  }
}

export async function summarizePdf(formData) {
  try {
    const res = await api.post("summarize/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to summarize PDF"
    );
  }
}

// export async function saveSummary(token, summaryData) {
//   try {
//     const res = await api.post("/api/summary/save", summaryData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Failed to save summary"
//     );
//   }
// }
