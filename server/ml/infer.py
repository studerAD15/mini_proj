import argparse
import json
from pathlib import Path

import joblib
import pandas as pd

ARTIFACT_DEFAULT = Path(__file__).resolve().parents[1] / "model_artifacts" / "liverml_artifact.joblib"

FIELD_ALIASES = {
    "age": "Age",
    "gender": "Gender",
    "totalBilirubin": "Total_Bilirubin",
    "directBilirubin": "Direct_Bilirubin",
    "alkalinePhosphatase": "Alkaline_Phosphotase",
    "alkalinePhosphotase": "Alkaline_Phosphotase",
    "alt": "Alamine_Aminotransferase",
    "alamineAminotransferase": "Alamine_Aminotransferase",
    "ast": "Aspartate_Aminotransferase",
    "aspartateAminotransferase": "Aspartate_Aminotransferase",
    "totalProteins": "Total_Protiens",
    "albumin": "Albumin",
    "agRatio": "Albumin_and_Globulin_Ratio",
    "agratio": "Albumin_and_Globulin_Ratio",
}

MODEL_TO_INPUT = {
    "Age": "age",
    "Gender": "gender",
    "Total_Bilirubin": "totalBilirubin",
    "Direct_Bilirubin": "directBilirubin",
    "Alkaline_Phosphotase": "alkalinePhosphatase",
    "Alamine_Aminotransferase": "alt",
    "Aspartate_Aminotransferase": "ast",
    "Total_Protiens": "totalProteins",
    "Albumin": "albumin",
    "Albumin_and_Globulin_Ratio": "agRatio",
}


def load_artifact(path: Path):
    return joblib.load(path)


def normalize_patient(patient):
    row = {}
    for key, value in patient.items():
        if key in FIELD_ALIASES:
            row[FIELD_ALIASES[key]] = value
    return row


def make_patient_frame(patient, artifact):
    normalized = normalize_patient(patient)
    for col in artifact["feature_names"]:
        normalized.setdefault(col, artifact["feature_medians"].get(col, 0.0))

    df = pd.DataFrame([normalized], columns=artifact["feature_names"])

    for col, classes in artifact["label_encoders"].items():
        value = str(df.at[0, col])
        df.at[0, col] = classes.index(value) if value in classes else 0

    transformed = pd.DataFrame(
        artifact["imputer"].transform(df), columns=artifact["feature_names"]
    )
    scaled = artifact["scaler"].transform(transformed)
    return transformed, scaled


def top_contributors(transformed_row, scaled_row, artifact, top_n=8):
    model = artifact["model"]
    base_probability = float(model.predict_proba(scaled_row)[0][1])
    items = []

    for idx, feature in enumerate(artifact["feature_names"]):
        probe = transformed_row.copy()
        probe.at[0, feature] = artifact["feature_medians"].get(feature, probe.at[0, feature])
        probe_scaled = artifact["scaler"].transform(probe)
        probe_probability = float(model.predict_proba(probe_scaled)[0][1])

        # Signed local contribution: how much this specific patient's feature
        # moves disease probability away from a median-value baseline.
        impact = base_probability - probe_probability

        items.append(
            {
                "feature": MODEL_TO_INPUT.get(feature, feature),
                "impact": round(impact, 6),
                "importance": round(abs(impact), 6),
            }
        )

    items.sort(key=lambda item: abs(item["impact"]), reverse=True)
    return items[:top_n]


def predict(patient, artifact):
    transformed, scaled = make_patient_frame(patient, artifact)
    model = artifact["model"]
    probabilities = model.predict_proba(scaled)[0]
    pred = int(model.predict(scaled)[0])
    disease_prob = float(probabilities[1])
    healthy_prob = float(probabilities[0])

    return {
        "label": "Liver Disease Likely" if pred == 1 else "No Liver Disease",
        "prediction": pred,
        "riskScore": round(disease_prob * 100, 2),
        "diseaseProbability": round(disease_prob, 6),
        "healthyProbability": round(healthy_prob, 6),
        "confidence": round(max(disease_prob, healthy_prob) * 100, 2),
        "contributors": top_contributors(transformed, scaled, artifact),
        "modelName": artifact.get("best_model_name", "Unknown"),
    }


def info(artifact):
    return {
        "bestModelName": artifact.get("best_model_name"),
        "bestModelMetrics": artifact.get("best_model_metrics", {}),
        "metricsByModel": artifact.get("metrics_by_model", {}),
        "cvSummary": artifact.get("cv_summary", {}),
        "tuningSummary": artifact.get("tuning_summary", {}),
        "confusionMatrix": artifact.get("confusion_matrix", {}),
        "classDistribution": artifact.get("class_distribution", {}),
        "featureImportance": artifact.get("feature_importance", {}),
        "shapSummary": artifact.get("shap_summary", {}),
        "advancedPackages": artifact.get("advanced_packages", {}),
        "smoteEnabled": artifact.get("smote_enabled", False),
        "trainedAtUtc": artifact.get("trained_at_utc"),
        "datasetRows": artifact.get("dataset_rows"),
        "datasetColumns": artifact.get("dataset_columns"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", default=str(ARTIFACT_DEFAULT))
    parser.add_argument("--mode", choices=["predict", "info"], default="predict")
    parser.add_argument("--input", default="{}")
    args = parser.parse_args()

    artifact_path = Path(args.artifact)
    if not artifact_path.exists():
        raise FileNotFoundError(f"Artifact not found at {artifact_path}. Train model first.")

    artifact = load_artifact(artifact_path)

    if args.mode == "info":
        print(json.dumps(info(artifact)))
        return

    patient = json.loads(args.input)
    print(json.dumps(predict(patient, artifact)))


if __name__ == "__main__":
    main()
