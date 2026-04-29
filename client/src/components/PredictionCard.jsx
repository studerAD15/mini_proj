import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   FIELD DEFINITIONS
   ══════════════════════════════════════════════════════════════ */
const fieldDefs = [
  { key: "age", label: "Age", min: 1, max: 100, step: 1, type: "number", hasSlider: true },
  { key: "totalBilirubin", label: "Total Bilirubin", min: 0, max: 75, step: 0.1, type: "float" },
  { key: "directBilirubin", label: "Direct Bilirubin", min: 0, max: 20, step: 0.1, type: "float" },
  { key: "alkalinePhosphatase", label: "Alkaline Phosphatase", min: 20, max: 2200, step: 1, type: "number" },
  { key: "alt", label: "ALT (Alamine Aminotransferase)", min: 1, max: 2000, step: 1, type: "float" },
  { key: "ast", label: "AST (Aspartate Aminotransferase)", min: 1, max: 5000, step: 1, type: "float" },
  { key: "totalProteins", label: "Total Proteins", min: 2, max: 10, step: 0.1, type: "float" },
  { key: "albumin", label: "Albumin", min: 0.5, max: 6, step: 0.1, type: "float" },
  { key: "agRatio", label: "A/G Ratio", min: 0.1, max: 3, step: 0.01, type: "float" },
];

const initialForm = {
  age: 45,
  gender: "Male",
  totalBilirubin: 0.7,
  directBilirubin: 0.1,
  alkalinePhosphatase: 187,
  alt: 16,
  ast: 18,
  totalProteins: 6.8,
  albumin: 3.3,
  agRatio: 0.9,
};

/* ══════════════════════════════════════════════════════════════
   ANIMATED SVG RING GAUGE
   ══════════════════════════════════════════════════════════════ */
function RiskGauge({ value = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = 72;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedValue / 100) * circumference;
  const color = animatedValue >= 50 ? "#8aa300" : "#c1d722";
  const bgGlow =
    animatedValue >= 50
      ? "0 0 40px rgba(138, 163, 0, 0.2)"
      : "0 0 40px rgba(0,212,170,0.2)";

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1400;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="relative w-44 h-44 mx-auto" style={{ filter: `drop-shadow(${bgGlow})` }}>
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-mono)", color }}
        >
          {animatedValue}%
        </span>
        <span
          className="text-[0.6rem] uppercase tracking-[0.15em] mt-1"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          Risk Score
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONFIDENCE BAR
   ══════════════════════════════════════════════════════════════ */
function ConfidenceBar({ confidence = 0 }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
          Confidence
        </span>
        <span style={{ fontFamily: "var(--font-mono)", color: "#c1d722", fontWeight: 600 }}>
          {confidence}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #c1d722, #6ea94e)" }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE CONTRIBUTORS BARS
   ══════════════════════════════════════════════════════════════ */
function ContributorsChart({ contributors = [] }) {
  const top6 = contributors.slice(0, 6);
  const maxAbs = Math.max(...top6.map((c) => Math.abs(c.impact)), 0.001);

  return (
    <div className="mt-5">
      <h4
        className="text-xs font-semibold uppercase tracking-[0.1em] mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-muted)" }}
      >
        Top Contributors
      </h4>
      <div className="space-y-2">
        {top6.map((item, idx) => {
          const pct = Math.min((Math.abs(item.impact) / maxAbs) * 100, 100);
          const isPositive = item.impact >= 0;
          return (
            <motion.div
              key={item.feature}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <span
                className="text-xs w-24 text-right truncate"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
              >
                {item.feature}
              </span>
              <div
                className="flex-1 h-3.5 rounded overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: isPositive
                      ? "linear-gradient(90deg, #c1d722, #8aa300)"
                      : "linear-gradient(90deg, #8aa300, #747b46)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: idx * 0.08 }}
                />
              </div>
              <span
                className="text-xs w-14 text-right"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: isPositive ? "#c1d722" : "#8aa300",
                }}
              >
                {item.impact > 0 ? "+" : ""}
                {item.impact.toFixed(3)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PREDICTION CARD (glass hero card)
   ══════════════════════════════════════════════════════════════ */
export default function PredictionCard({ onPredict, result, loading }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!["Male", "Female"].includes(form.gender)) errs.gender = "Select gender";
    fieldDefs.forEach((f) => {
      const val = Number(form[f.key]);
      if (isNaN(val) || val < f.min || val > f.max) {
        errs[f.key] = `Must be ${f.min}–${f.max}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    Object.keys(payload).forEach((k) => {
      if (k !== "gender") payload[k] = Number(payload[k]);
    });
    onPredict(payload);
  };

  const isDisease = result?.label === "Liver Disease Likely";

  return (
    <section className="py-8" id="prediction-card">
      <div className="glass-card-hero p-6 sm:p-8 lg:p-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #c1d722, #6ea94e)",
              boxShadow: "0 0 10px rgba(0,212,170,0.4)",
            }}
          />
          <h2
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Patient Risk Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ═══ LEFT: Patient Input Form ═══ */}
          <div>
            <form onSubmit={handleSubmit} id="patient-form">
              {/* Gender Toggle */}
              <div className="input-group mb-4">
                <label>Gender</label>
                <div className="flex gap-2">
                  {["Male", "Female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField("gender", g)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        fontFamily: "var(--font-display)",
                        background:
                          form.gender === g
                            ? "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(110, 169, 78, 0.1))"
                            : "rgba(255,255,255,0.03)",
                        border:
                          form.gender === g
                            ? "1px solid rgba(0,212,170,0.3)"
                            : "1px solid rgba(255,255,255,0.06)",
                        color:
                          form.gender === g
                            ? "#c1d722"
                            : "var(--color-muted)",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <span className="text-xs flex items-center gap-1 mt-1" style={{ color: "#8aa300" }}>
                    <AlertTriangle size={12} /> {errors.gender}
                  </span>
                )}
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fieldDefs.map((field) => (
                  <div key={field.key} className="input-group">
                    <label htmlFor={`input-${field.key}`}>{field.label}</label>
                    <input
                      id={`input-${field.key}`}
                      type="number"
                      value={form[field.key]}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className={errors[field.key] ? "error-input" : ""}
                    />
                    {field.hasSlider && (
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={form[field.key]}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="w-full mt-1"
                      />
                    )}
                    {errors[field.key] && (
                      <span className="text-xs flex items-center gap-1 mt-1" style={{ color: "#8aa300" }}>
                        <AlertTriangle size={12} /> {errors[field.key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Predict Button — full-width gradient with shimmer */}
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 py-3.5 text-sm flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Running Model...
                  </>
                ) : (
                  "⚡ Predict Risk"
                )}
              </motion.button>
            </form>
          </div>

          {/* ═══ RIGHT: Prediction Output ═══ */}
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center min-h-[350px]"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ color: "var(--color-muted)" }}
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Submit patient data to see the risk assessment
                  </p>
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                    The model will analyze 10 biomarkers in real-time
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className={`flex-1 rounded-2xl p-6 ${isDisease ? "glow-red" : "glow-green"}`}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${isDisease ? "rgba(138, 163, 0, 0.15)" : "rgba(0,212,170,0.15)"}`,
                  }}
                >
                  {/* Header + export */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: isDisease ? "#8aa300" : "#c1d722" }}
                      />
                      <h3
                        className="text-lg font-bold"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Prediction
                      </h3>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>

                  {/* Verdict Badge */}
                  <div
                    className="text-center py-2.5 px-4 rounded-xl mb-5 text-sm font-bold"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: isDisease
                        ? "rgba(138, 163, 0, 0.1)"
                        : "rgba(0,212,170,0.1)",
                      color: isDisease ? "#8aa300" : "#c1d722",
                      border: `1px solid ${isDisease ? "rgba(138, 163, 0, 0.2)" : "rgba(0,212,170,0.2)"}`,
                    }}
                  >
                    {result.label}
                  </div>

                  {/* Risk Gauge */}
                  <RiskGauge value={result.riskScore} />

                  {/* Confidence */}
                  <ConfidenceBar confidence={result.confidence} />

                  {/* Contributors */}
                  <ContributorsChart contributors={result.contributors || []} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

