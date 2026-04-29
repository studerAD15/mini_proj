import argparse
import contextlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    matthews_corrcoef,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC

try:
    from imblearn.over_sampling import SMOTE
except Exception:
    SMOTE = None

try:
    import optuna
    optuna.logging.set_verbosity(optuna.logging.WARNING)
except Exception:
    optuna = None

try:
    import shap
except Exception:
    shap = None

try:
    import xgboost as xgb
except Exception:
    xgb = None

try:
    import lightgbm as lgb
except Exception:
    lgb = None

DATA_URLS = [
    "https://raw.githubusercontent.com/SanikaVT/Liver-disease-prediction/master/indian_liver_patient.csv",
    "https://raw.githubusercontent.com/waseem-medhat/eda_r/master/indian_liver_patient.csv",
]

RAW_COLUMNS = [
    "Age",
    "Gender",
    "Total_Bilirubin",
    "Direct_Bilirubin",
    "Alkaline_Phosphotase",
    "Alamine_Aminotransferase",
    "Aspartate_Aminotransferase",
    "Total_Protiens",
    "Albumin",
    "Albumin_and_Globulin_Ratio",
    "Dataset",
]


def load_dataset() -> pd.DataFrame:
    last_error = None
    for url in DATA_URLS:
        try:
            df = pd.read_csv(url)
            if list(df.columns) == list(range(len(df.columns))):
                df = pd.read_csv(url, header=None, names=RAW_COLUMNS)
            df.columns = [c.strip().replace(" ", "_") for c in df.columns]
            if "Dataset" in df.columns:
                df.rename(columns={"Dataset": "Target"}, inplace=True)
            if df["Target"].nunique() == 2 and df["Target"].max() == 2:
                df["Target"] = df["Target"].map({1: 1, 2: 0})
            return df
        except Exception as error:
            last_error = error
    raise RuntimeError(f"Unable to load ILPD dataset: {last_error}")


def preprocess(df: pd.DataFrame):
    x = df.drop(columns=["Target"]).copy()
    y = df["Target"].astype(int).values

    label_encoders = {}
    for col in x.select_dtypes(include="object").columns.tolist():
        encoder = LabelEncoder()
        x[col] = encoder.fit_transform(x[col].astype(str))
        label_encoders[col] = encoder

    imputer = SimpleImputer(strategy="median")
    x_imputed = pd.DataFrame(imputer.fit_transform(x), columns=x.columns)

    x_train, x_test, y_train, y_test = train_test_split(
        x_imputed, y, test_size=0.2, stratify=y, random_state=42
    )

    scaler = StandardScaler()
    x_train_sc = scaler.fit_transform(x_train)
    x_test_sc = scaler.transform(x_test)

    x_train_res = x_train_sc
    y_train_res = y_train
    if SMOTE is not None:
        smote = SMOTE(random_state=42)
        x_train_res, y_train_res = smote.fit_resample(x_train_sc, y_train)

    return {
        "x_train": x_train,
        "x_test": x_test,
        "x_train_sc": x_train_sc,
        "x_test_sc": x_test_sc,
        "x_train_res": x_train_res,
        "y_train": y_train,
        "y_test": y_test,
        "y_train_res": y_train_res,
        "imputer": imputer,
        "scaler": scaler,
        "label_encoders": label_encoders,
        "feature_names": x.columns.tolist(),
    }


def build_base_models():
    models = {
        "Logistic Regression": LogisticRegression(max_iter=3000),
        "KNN": KNeighborsClassifier(n_neighbors=7),
        "SVM (RBF)": SVC(kernel="rbf", probability=True, C=1.0),
        "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=10, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "Extra Trees": ExtraTreesClassifier(n_estimators=300, max_depth=10, random_state=42),
    }
    if xgb is not None:
        models["XGBoost"] = xgb.XGBClassifier(
            n_estimators=250,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        )
    if lgb is not None:
        models["LightGBM"] = lgb.LGBMClassifier(
            n_estimators=250,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            verbose=-1,
            random_state=42,
        )
    return models


def tune_model(name, x_train_res, y_train_res):
    if optuna is None:
        return None

    if name == "XGBoost" and xgb is not None:
        def objective(trial):
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 150, 350),
                "max_depth": trial.suggest_int("max_depth", 3, 8),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
                "subsample": trial.suggest_float("subsample", 0.7, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.7, 1.0),
                "reg_alpha": trial.suggest_float("reg_alpha", 1e-4, 1.0, log=True),
                "reg_lambda": trial.suggest_float("reg_lambda", 1e-4, 2.0, log=True),
                "eval_metric": "logloss",
                "random_state": 42,
            }
            model = xgb.XGBClassifier(**params)
            return cross_val_score(
                model, x_train_res, y_train_res, cv=3, scoring="roc_auc", n_jobs=1
            ).mean()

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=8, show_progress_bar=False)
        params = study.best_params
        params.update({"eval_metric": "logloss", "random_state": 42})
        return {"best_auc": float(study.best_value), "params": params}

    if name == "LightGBM" and lgb is not None:
        def objective(trial):
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 150, 350),
                "max_depth": trial.suggest_int("max_depth", 3, 8),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
                "num_leaves": trial.suggest_int("num_leaves", 20, 90),
                "subsample": trial.suggest_float("subsample", 0.7, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.7, 1.0),
                "reg_alpha": trial.suggest_float("reg_alpha", 1e-4, 1.0, log=True),
                "verbose": -1,
                "random_state": 42,
            }
            model = lgb.LGBMClassifier(**params)
            return cross_val_score(
                model, x_train_res, y_train_res, cv=3, scoring="roc_auc", n_jobs=1
            ).mean()

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=8, show_progress_bar=False)
        params = study.best_params
        params.update({"verbose": -1, "random_state": 42})
        return {"best_auc": float(study.best_value), "params": params}

    return None


def evaluate_models(models, x_train_res, x_test_sc, y_train_res, y_test):
    scored = {}
    trained = {}
    cv_summary = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, model in models.items():
        model.fit(x_train_res, y_train_res)
        trained[name] = model

        y_pred = model.predict(x_test_sc)
        y_prob = model.predict_proba(x_test_sc)[:, 1]

        scored[name] = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1": float(f1_score(y_test, y_pred, zero_division=0)),
            "mcc": float(matthews_corrcoef(y_test, y_pred)),
            "auc_roc": float(roc_auc_score(y_test, y_prob)),
            "avg_precision": float(average_precision_score(y_test, y_prob)),
            "brier": float(brier_score_loss(y_test, y_prob)),
        }

        cv_auc = cross_val_score(model, x_train_res, y_train_res, cv=cv, scoring="roc_auc", n_jobs=1)
        cv_f1 = cross_val_score(model, x_train_res, y_train_res, cv=cv, scoring="f1", n_jobs=1)
        cv_summary[name] = {
            "auc_mean": float(cv_auc.mean()),
            "auc_std": float(cv_auc.std()),
            "f1_mean": float(cv_f1.mean()),
        }

    return trained, scored, cv_summary


def get_feature_importance(model, feature_names):
    importances = np.zeros(len(feature_names))
    if hasattr(model, "feature_importances_"):
        importances = np.asarray(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        coef = np.asarray(model.coef_, dtype=float)
        if coef.ndim > 1:
            coef = coef[0]
        importances = np.abs(coef)

    if np.sum(importances) > 0:
        importances = importances / np.sum(importances)

    return {name: float(value) for name, value in zip(feature_names, importances)}


def compute_shap_summary(model, x_background, x_sample, feature_names):
    if shap is None:
        return {"available": False, "reason": "shap_not_installed", "top_features": []}

    try:
        sample_frame = pd.DataFrame(x_sample, columns=feature_names)
        if hasattr(model, "feature_importances_"):
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(sample_frame)
            values = shap_values[1] if isinstance(shap_values, list) else shap_values
        else:
            background = pd.DataFrame(x_background[:100], columns=feature_names)
            explainer = shap.Explainer(model.predict_proba, background)
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                explained = explainer(sample_frame[:20])
            values = explained.values[:, :, 1] if explained.values.ndim == 3 else explained.values

        mean_abs = np.abs(values).mean(axis=0)
        top_pairs = sorted(
            [{"feature": feature_names[idx], "meanAbsShap": float(mean_abs[idx])} for idx in range(len(feature_names))],
            key=lambda item: item["meanAbsShap"],
            reverse=True,
        )[:10]
        return {"available": True, "top_features": top_pairs}
    except Exception as error:
        return {"available": False, "reason": str(error), "top_features": []}


def train_and_save(out_path: Path):
    df = load_dataset()
    pre = preprocess(df)

    models = build_base_models()
    tuning_summary = {}

    for tuned_name in ["XGBoost", "LightGBM"]:
        tuned = tune_model(tuned_name, pre["x_train_res"], pre["y_train_res"])
        if tuned_name == "XGBoost" and tuned and xgb is not None:
            models["Tuned XGBoost"] = xgb.XGBClassifier(**tuned["params"])
            tuning_summary["Tuned XGBoost"] = tuned
        if tuned_name == "LightGBM" and tuned and lgb is not None:
            models["Tuned LightGBM"] = lgb.LGBMClassifier(**tuned["params"])
            tuning_summary["Tuned LightGBM"] = tuned

    trained_models, metrics_by_model, cv_summary = evaluate_models(
        models,
        pre["x_train_res"],
        pre["x_test_sc"],
        pre["y_train_res"],
        pre["y_test"],
    )

    best_model_name = max(metrics_by_model, key=lambda n: metrics_by_model[n]["auc_roc"])
    best_model = trained_models[best_model_name]

    calibrated_model = CalibratedClassifierCV(best_model, cv=3, method="sigmoid")
    calibrated_model.fit(pre["x_train_res"], pre["y_train_res"])

    y_pred = calibrated_model.predict(pre["x_test_sc"])
    y_prob = calibrated_model.predict_proba(pre["x_test_sc"])[:, 1]
    cm = confusion_matrix(pre["y_test"], y_pred)

    feature_importance = get_feature_importance(best_model, pre["feature_names"])
    shap_summary = compute_shap_summary(
        best_model,
        pre["x_train_res"],
        pre["x_test_sc"],
        pre["feature_names"],
    )

    artifact = {
        "model": calibrated_model,
        "best_model_name": best_model_name,
        "feature_names": pre["feature_names"],
        "imputer": pre["imputer"],
        "scaler": pre["scaler"],
        "label_encoders": {
            col: encoder.classes_.tolist()
            for col, encoder in pre["label_encoders"].items()
        },
        "feature_medians": {
            col: float(pre["x_train"][col].median()) for col in pre["feature_names"]
        },
        "feature_means_scaled": {
            col: float(np.mean(pre["x_train_res"][:, idx]))
            for idx, col in enumerate(pre["feature_names"])
        },
        "feature_importance": feature_importance,
        "metrics_by_model": metrics_by_model,
        "cv_summary": cv_summary,
        "tuning_summary": tuning_summary,
        "best_model_metrics": {
            "accuracy": float(accuracy_score(pre["y_test"], y_pred)),
            "precision": float(precision_score(pre["y_test"], y_pred, zero_division=0)),
            "recall": float(recall_score(pre["y_test"], y_pred, zero_division=0)),
            "f1": float(f1_score(pre["y_test"], y_pred, zero_division=0)),
            "mcc": float(matthews_corrcoef(pre["y_test"], y_pred)),
            "auc_roc": float(roc_auc_score(pre["y_test"], y_prob)),
            "avg_precision": float(average_precision_score(pre["y_test"], y_prob)),
            "brier": float(brier_score_loss(pre["y_test"], y_prob)),
        },
        "confusion_matrix": {
            "tn": int(cm[0][0]),
            "fp": int(cm[0][1]),
            "fn": int(cm[1][0]),
            "tp": int(cm[1][1]),
        },
        "class_distribution": {
            "disease": int(np.sum(df["Target"] == 1)),
            "healthy": int(np.sum(df["Target"] == 0)),
        },
        "shap_summary": shap_summary,
        "smote_enabled": SMOTE is not None,
        "advanced_packages": {
            "xgboost": xgb is not None,
            "lightgbm": lgb is not None,
            "optuna": optuna is not None,
            "shap": shap is not None,
            "smote": SMOTE is not None,
        },
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_rows": int(df.shape[0]),
        "dataset_columns": int(df.shape[1]),
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, out_path)

    print(
        json.dumps(
            {
                "saved_to": str(out_path),
                "best_model_name": best_model_name,
                "best_model_metrics": artifact["best_model_metrics"],
                "advanced_packages": artifact["advanced_packages"],
                "dataset_rows": artifact["dataset_rows"],
            }
        )
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "model_artifacts" / "liverml_artifact.joblib"),
    )
    args = parser.parse_args()
    train_and_save(Path(args.out))


if __name__ == "__main__":
    main()
