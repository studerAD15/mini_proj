import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2 } from "lucide-react";

/* ── Animated SVG Ring Gauge ── */
function RiskGauge({ value = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedValue / 100) * circumference;
  const color = animatedValue >= 50 ? "#8aa300" : "#c1d722";

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1200;
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
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)"
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
          className="font-[family-name:var(--font-mono)] text-3xl font-bold"
          style={{ color }}
        >
          {animatedValue}%
        </span>
        <span className="text-[0.65rem] text-[var(--color-muted)] uppercase tracking-wider mt-0.5">
          Risk Score
        </span>
      </div>
    </div>
  );
}

/* ── Confidence Bar ── */
function ConfidenceBar({ confidence = 0 }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-muted)]">Confidence</span>
        <span className="font-[family-name:var(--font-mono)] text-[#c1d722] font-semibold">
          {confidence}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#c1d722] to-[#8aa300]"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Contributors Chart ── */
function ContributorsChart({ contributors = [] }) {
  const maxAbs = Math.max(...contributors.map((c) => Math.abs(c.impact)), 0.001);

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-[var(--color-muted)] mb-3">
        Top Contributors
      </h3>
      <div className="space-y-2">
        {contributors.map((item, idx) => {
          const pct = Math.min((Math.abs(item.impact) / maxAbs) * 100, 100);
          const isPositive = item.impact >= 0;
          return (
            <motion.div
              key={item.feature}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <span className="text-xs w-24 text-right truncate text-[var(--color-muted)]">
                {item.feature}
              </span>
              <div className="flex-1 h-4 rounded bg-[rgba(255,255,255,0.04)] overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: isPositive
                      ? "linear-gradient(90deg, #c1d722, #8aa300)"
                      : "linear-gradient(90deg, #8aa300, #747b46)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                />
              </div>
              <span className="text-xs font-[family-name:var(--font-mono)] w-16 text-right"
                style={{ color: isPositive ? "#c1d722" : "#8aa300" }}
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

/* ── Main Prediction Output Panel ── */
export default function PredictionOutput({ result }) {
  const panelRef = useRef(null);
  const isDisease = result?.label?.includes("Disease");

  const handleExportPDF = () => {
    window.print();
  };

  if (!result) {
    return (
      <motion.div
        className="glass-card p-5 sm:p-6 flex flex-col items-center justify-center min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-muted)]">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-[var(--color-muted)] text-sm">
            Submit patient data to see the risk assessment
          </p>
          <p className="text-[rgba(255,255,255,0.3)] text-xs mt-2">
            The model will analyze 10 biomarkers
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={panelRef}
      className={`glass-card p-5 sm:p-6 ${isDisease ? "glow-red" : "glow-green"}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: isDisease ? "#8aa300" : "#c1d722" }}
          />
          Prediction
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="btn-secondary text-xs flex items-center gap-1" title="Export PDF">
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Verdict Badge */}
      <AnimatePresence>
        <motion.div
          key={result.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-2.5 px-4 rounded-xl mb-5 text-sm font-bold font-[family-name:var(--font-heading)] ${
            isDisease
              ? "bg-[rgba(138, 163, 0, 0.15)] text-[#8aa300] border border-[rgba(255,107,107,0.3)]"
              : "bg-[rgba(0,212,170,0.15)] text-[#c1d722] border border-[rgba(0,212,170,0.3)]"
          }`}
        >
          {result.label}
        </motion.div>
      </AnimatePresence>

      {/* Risk Gauge */}
      <RiskGauge value={result.riskScore} />

      {/* Confidence */}
      <ConfidenceBar confidence={result.confidence} />

      {/* Contributors */}
      <ContributorsChart contributors={result.contributors || []} />
    </motion.div>
  );
}

