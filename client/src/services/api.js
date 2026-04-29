import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

export const predictRisk = (patientData) => api.post("/predict", patientData);
export const getPredictions = (params = {}) => api.get("/predictions", { params });
export const deletePrediction = (id) => api.delete(`/predictions/${id}`);
export const clearPredictions = () => api.delete("/predictions");

export const getModelInfo = () => api.get("/model-info");
export const getModelComparison = () => api.get("/model-comparison");
export const refreshModel = () => api.post("/refresh-model");

export const getImageModelStatus = () => api.get("/image-model/status");
export const predictUltrasoundImage = (formData) =>
  api.post("/image/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

export const getAnalytics = () => api.get("/analytics");

export default api;

