"""
FastAPI microservice for Liver Disease Risk prediction.
Serves the pre-trained model artifact on port 8000.
"""

import json
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ARTIFACT_PATH = (
    Path(__file__).resolve().parents[1] / "model_artifacts" / "liverml_artifact.joblib"
)

INPUT_TO_MODEL_COL = {
    "age": "Age",
    "gender": "Gender",
    "totalBilirubin": "Total_Bilirubin",
    "directBilirubin": "Direct_Bilirubin",
    "alkalinePhosphatase": "Alkaline_Phosphotase",
    "alt": "Alamine_Aminotransferase",
    "ast": "Aspartate_Aminotransferase",
    "totalProteins": "Total_Protiens",
    "albumin": "Albumin",
    "agRatio": "Albumin_and_Globulin_Ratio",
}

MODEL_TO_INPUT_COL = {v: k for k, v in INPUT_TO_MODEL_COL.items()}

# ── Global artifact cache ──
_artifact = None


def get_artifact():
    global _artifact
    if _artifact is None:
        if not ARTIFACT_PATH.exists():
            raise HTTPException(
                status_code=503,
                detail=f"Model artifact not found at {ARTIFACT_PATH}. Train the model first.",
            )
        _artifact = joblib.load(ARTIFACT_PATH)
    return _artifact


def reload_artifact():
    global _artifact
    if not ARTIFACT_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Model artifact not found at {ARTIFACT_PATH}.",
        )
    _artifact = joblib.load(ARTIFACT_PATH)
    return _artifact


# ── Pydantic models ──
class PatientInput(BaseModel):
    gender: str = Field(..., description="Male or Female")
    age: float = Field(..., ge=0, le=120)
    totalBilirubin: float = Field(..., ge=0)
    directBilirubin: float = Field(..., ge=0)
    alkalinePhosphatase: float = Field(..., ge=0)
    alt: float = Field(..., ge=0)
    ast: float = Field(..., ge=0)
    totalProteins: float = Field(..., ge=0)
    albumin: float = Field(..., ge=0)
    agRatio: float = Field(..., ge=0)


class ContributorItem(BaseModel):
    feature: str
    impact: float
    importance: float


class PredictionOutput(BaseModel):
    label: str
    prediction: int
    riskScore: float
    diseaseProbability: float
    healthyProbability: float
    confidence: float
    contributors: list[ContributorItem]
    modelName: str


# ── Helper functions ──
def make_patient_frame(patient: PatientInput, artifact: dict):
    row = {}
    for input_key, model_key in INPUT_TO_MODEL_COL.items():
        row[model_key] = getattr(patient, input_key, None)

    df = pd.DataFrame([row])

    for col, classes in artifact["label_encoders"].items():
        value = str(df.at[0, col])
        if value in classes:
            df.at[0, col] = classes.index(value)
        else:
            df.at[0, col] = 0

    for col in artifact["feature_names"]:
        if col not in df.columns:
            df[col] = artifact["feature_medians"].get(col, 0.0)

    df = df[artifact["feature_names"]]
    transformed = pd.DataFrame(
        artifact["imputer"].transform(df), columns=artifact["feature_names"]
    )
    scaled = artifact["scaler"].transform(transformed)
    return transformed, scaled


def top_contributors(scaled_row, artifact, top_n=10):
    importances = artifact.get("feature_importance", {})
    means = artifact.get("feature_means_scaled", {})
    items = []
    for idx, feature in enumerate(artifact["feature_names"]):
        feature_weight = float(importances.get(feature, 0.0))
        centered_value = float(scaled_row[0][idx]) - float(means.get(feature, 0.0))
        impact = centered_value * feature_weight
        items.append(
            {
                "feature": MODEL_TO_INPUT_COL.get(feature, feature),
                "impact": round(impact, 6),
                "importance": round(feature_weight, 6),
            }
        )
    items.sort(key=lambda x: abs(x["impact"]), reverse=True)
    return items[:top_n]


# ── FastAPI app ──
app = FastAPI(title="Liver Risk ML Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "liver-risk-ml"}


@app.post("/predict", response_model=PredictionOutput)
def predict(patient: PatientInput):
    artifact = get_artifact()
    _transformed, scaled = make_patient_frame(patient, artifact)
    model = artifact["model"]
    probabilities = model.predict_proba(scaled)[0]
    pred = int(model.predict(scaled)[0])
    disease_prob = float(probabilities[1])
    healthy_prob = float(probabilities[0])

    label = "Liver Disease Likely" if pred == 1 else "No Liver Disease"
    confidence = float(max(disease_prob, healthy_prob) * 100)

    return {
        "label": label,
        "prediction": pred,
        "riskScore": round(disease_prob * 100, 2),
        "diseaseProbability": round(disease_prob, 6),
        "healthyProbability": round(healthy_prob, 6),
        "confidence": round(confidence, 2),
        "contributors": top_contributors(scaled, artifact),
        "modelName": artifact.get("best_model_name", "Unknown"),
    }


@app.get("/model-info")
def model_info():
    artifact = get_artifact()
    return {
        "bestModelName": artifact.get("best_model_name"),
        "bestModelMetrics": artifact.get("best_model_metrics", {}),
        "confusionMatrix": artifact.get("confusion_matrix", {}),
        "featureImportance": artifact.get("feature_importance", {}),
        "classDistribution": artifact.get("class_distribution", {}),
        "trainedAtUtc": artifact.get("trained_at_utc"),
        "datasetRows": artifact.get("dataset_rows"),
        "datasetColumns": artifact.get("dataset_columns"),
    }


@app.get("/model-comparison")
def model_comparison():
    artifact = get_artifact()
    metrics_by_model = artifact.get("metrics_by_model", {})
    comparison = []
    for name, metrics in metrics_by_model.items():
        comparison.append(
            {
                "model": name,
                "auc": round(metrics.get("auc_roc", 0), 4),
                "f1": round(metrics.get("f1", 0), 4),
                "accuracy": round(metrics.get("accuracy", 0), 4),
                "precision": round(metrics.get("precision", 0), 4),
                "recall": round(metrics.get("recall", 0), 4),
                "mcc": round(metrics.get("mcc", 0), 4),
            }
        )
    comparison.sort(key=lambda x: x["auc"], reverse=True)
    return {"models": comparison, "bestModel": artifact.get("best_model_name")}


@app.post("/refresh-model")
def refresh_model():
    artifact = reload_artifact()
    return {
        "message": "Model reloaded from disk",
        "bestModelName": artifact.get("best_model_name"),
        "trainedAtUtc": artifact.get("trained_at_utc"),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
