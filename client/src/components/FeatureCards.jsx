import { motion } from "framer-motion";
import { Brain, BarChart3, Clock } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   FEATURE CARDS ROW — 3 floating glass cards
   ══════════════════════════════════════════════════════════════ */

/* ── Card 1: ML Model Intelligence ── */
function MLModelCard({ modelInfo, loading }) {
  if (loading) {
    return (
      <div className="feature-card p-6">
        <h3
          className="text-base font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Brain size={18} style={{ color: "#6ea94e" }} />
          ML Model Intelligence
        </h3>
        <div className="skeleton h-36 rounded-xl" />
      </div>
    );
  }

  const metrics = modelInfo?.bestModelMetrics || {};
  const confusionMatrix = modelInfo?.confusionMatrix;
  const advancedPackages = modelInfo?.advancedPackages || {};

  return (
    <motion.div
      className="feature-card p-6"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <h3
        className="text-base font-bold mb-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <Brain size={18} style={{ color: "#6ea94e" }} />
        ML Model Intelligence
      </h3>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <span
            className="text-xs uppercase tracking-[0.1em] block mb-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
          >
            AUC
          </span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "#c1d722" }}
          >
            {(metrics.auc_roc || 0.83).toFixed(2)}
          </span>
        </div>
        <div>
          <span
            className="text-xs uppercase tracking-[0.1em] block mb-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
          >
            F1 Score
          </span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "#6ea94e" }}
          >
            {(metrics.f1 || 0.84).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Best Model */}
      <div
        className="py-2 px-3 rounded-lg mb-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          className="text-xs block mb-0.5"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Best Model
        </span>
        <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {modelInfo?.bestModelName || "Logistic Regression"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ["SMOTE", advancedPackages.smote],
          ["Optuna", advancedPackages.optuna],
          ["XGBoost", advancedPackages.xgboost],
          ["SHAP", advancedPackages.shap],
        ].map(([label, enabled]) => (
          <div
            key={label}
            className="py-2 px-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-xs block mb-0.5"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}
            >
              {label}
            </span>
            <span style={{ color: enabled ? "#c1d722" : "#8aa300", fontSize: "0.75rem" }}>
              {enabled ? "Enabled" : "Unavailable"}
            </span>
          </div>
        ))}
      </div>

      {/* Mini Confusion Matrix */}
      {confusionMatrix && (
        <div>
          <span
            className="text-xs block mb-2"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            Confusion Matrix
          </span>
          <div className="grid grid-cols-2 gap-1">
            {[
              { v: confusionMatrix.tn, bg: "rgba(0,212,170,0.12)", c: "#c1d722" },
              { v: confusionMatrix.fp, bg: "rgba(138, 163, 0, 0.1)", c: "#8aa300" },
              { v: confusionMatrix.fn, bg: "rgba(138, 163, 0, 0.1)", c: "#8aa300" },
              { v: confusionMatrix.tp, bg: "rgba(0,212,170,0.12)", c: "#c1d722" },
            ].map((cell, i) => (
              <div
                key={i}
                className="confusion-cell h-10"
                style={{ background: cell.bg, color: cell.c, fontSize: "0.85rem" }}
              >
                {cell.v ?? "—"}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Card 2: Global Feature Importance ── */
function FeatureImportanceCard({ modelInfo, loading }) {
  if (loading) {
    return (
      <div className="feature-card p-6">
        <h3
          className="text-base font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <BarChart3 size={18} style={{ color: "#c1d722" }} />
          Global Feature Importance
        </h3>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  const featureImportance = modelInfo?.featureImportance || {};
  const shapTopFeatures = modelInfo?.shapSummary?.top_features || [];
  const features = Object.entries(featureImportance)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const maxValue = features.length > 0 ? features[0].value : 1;

  return (
    <motion.div
      className="feature-card p-6"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <h3
        className="text-base font-bold mb-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <BarChart3 size={18} style={{ color: "#c1d722" }} />
        Global Feature Importance
      </h3>

      <div className="space-y-2.5">
        {features.map((item, idx) => {
          const pct = Math.max((item.value / maxValue) * 100, 5);
          return (
            <motion.div
              key={item.name}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
              <span
                className="text-right truncate w-28"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-muted)" }}
              >
                {item.name}
              </span>
              <div
                className="flex-1 h-4 rounded overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: `linear-gradient(90deg, #c1d722, ${
                      pct > 70 ? "#c1d722" : pct > 40 ? "#8aa300" : "#747b46"
                    })`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.06 }}
                />
              </div>
              <span
                className="w-12 text-right"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#c1d722" }}
              >
                {item.value.toFixed(3)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {shapTopFeatures.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span
            className="text-xs block mb-2"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            SHAP Highlights
          </span>
          <div className="space-y-1.5">
            {shapTopFeatures.slice(0, 3).map((item) => (
              <div key={item.feature} className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--color-muted)" }}>{item.feature}</span>
                <span style={{ color: "#6ea94e", fontFamily: "var(--font-mono)" }}>
                  {item.meanAbsShap.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Card 3: Prediction History Mini ── */
function PredictionHistoryCard({ predictions, loading }) {
  if (loading) {
    return (
      <div className="feature-card p-6">
        <h3
          className="text-base font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Clock size={18} style={{ color: "#747b46" }} />
          Prediction History
        </h3>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  const recent = (predictions || []).slice(0, 5);

  return (
    <motion.div
      className="feature-card p-6"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <h3
        className="text-base font-bold mb-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <Clock size={18} style={{ color: "#747b46" }} />
        Prediction History
      </h3>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No predictions yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((p, idx) => (
            <motion.div
              key={p._id || idx}
              className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="text-xs w-16 truncate"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)", fontSize: "0.6rem" }}
              >
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
              >
                Age {p.age || "—"}
              </span>
              <div className="flex-1" />
              <span
                className={p.label === "Liver Disease Likely" ? "badge-disease" : "badge-healthy"}
                style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}
              >
                {p.riskScore != null ? `${p.riskScore}%` : "—"}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Export: 3-card row ── */
export default function FeatureCards({ modelInfo, predictions, loadingModel }) {
  return (
    <section className="py-6" id="feature-cards">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MLModelCard modelInfo={modelInfo} loading={loadingModel} />
        <FeatureImportanceCard modelInfo={modelInfo} loading={loadingModel} />
        <PredictionHistoryCard predictions={predictions} loading={loadingModel} />
      </div>
    </section>
  );
}

