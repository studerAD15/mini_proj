import axios from "axios";
import {
  inferPatient,
  getModelInfo as getLocalModelInfo,
  trainModelArtifact,
  getImageModelStatus as getLocalImageModelStatus,
  inferUltrasoundImage,
} from "./pythonModelService.js";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const USE_REMOTE_ML = process.env.USE_REMOTE_ML === "true";

const ml = axios.create({
  baseURL: ML_URL,
  timeout: 30000,
});

export const predictPatient = async (patient) => {
  if (!USE_REMOTE_ML) {
    return await inferPatient(patient);
  }

  try {
    const { data } = await ml.post("/predict", patient);
    return data;
  } catch (_error) {
    return await inferPatient(patient);
  }
};

export const getModelInfo = async () => {
  if (!USE_REMOTE_ML) {
    return await getLocalModelInfo();
  }

  try {
    const { data } = await ml.get("/model-info");
    return data;
  } catch (_error) {
    return await getLocalModelInfo();
  }
};

export const getModelComparison = async () => {
  if (!USE_REMOTE_ML) {
    const local = await getLocalModelInfo();
    return {
      models: Object.entries(local.metricsByModel || {}).map(([model, metrics]) => ({
        model,
        auc: Number(metrics.auc_roc || 0),
        f1: Number(metrics.f1 || 0),
        accuracy: Number(metrics.accuracy || 0),
        precision: Number(metrics.precision || 0),
        recall: Number(metrics.recall || 0),
        mcc: Number(metrics.mcc || 0),
      })),
      bestModel: local.bestModelName,
    };
  }

  try {
    const { data } = await ml.get("/model-comparison");
    return data;
  } catch (_error) {
    const local = await getLocalModelInfo();
    return {
      models: Object.entries(local.metricsByModel || {}).map(([model, metrics]) => ({
        model,
        auc: Number(metrics.auc_roc || 0),
        f1: Number(metrics.f1 || 0),
        accuracy: Number(metrics.accuracy || 0),
        precision: Number(metrics.precision || 0),
        recall: Number(metrics.recall || 0),
        mcc: Number(metrics.mcc || 0),
      })),
      bestModel: local.bestModelName,
    };
  }
};

export const refreshModel = async () => {
  if (!USE_REMOTE_ML) {
    return await trainModelArtifact();
  }

  try {
    const { data } = await ml.post("/refresh-model");
    return data;
  } catch (_error) {
    return await trainModelArtifact();
  }
};

export const getImageModelStatus = async () => {
  return await getLocalImageModelStatus();
};

export const predictUltrasoundImage = async (imagePath) => {
  return await inferUltrasoundImage(imagePath);
};
