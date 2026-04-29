import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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

export default function PatientForm({ onSubmit, loading }) {
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
    onSubmit(payload);
  };

  return (
    <motion.div
      className="glass-card p-5 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Patient Input
      </h2>

      <form onSubmit={handleSubmit} id="patient-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
              Gender
            </label>
            <select
              id="input-gender"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className={errors.gender ? "error-input" : ""}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && (
              <span className="text-[#8aa300] text-xs flex items-center gap-1">
                <AlertTriangle size={12} /> {errors.gender}
              </span>
            )}
          </div>

          {/* Fields */}
          {fieldDefs.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`input-${field.key}`}
                className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider"
              >
                {field.label}
              </label>
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
                  className="w-full h-1.5 rounded-full appearance-none bg-[rgba(255,255,255,0.1)] cursor-pointer accent-[#c1d722]"
                />
              )}
              {errors[field.key] && (
                <span className="text-[#8aa300] text-xs flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors[field.key]}
                </span>
              )}
            </div>
          ))}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6 text-sm py-3 flex items-center justify-center gap-2"
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
    </motion.div>
  );
}

