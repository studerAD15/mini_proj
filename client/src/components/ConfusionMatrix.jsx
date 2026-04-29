import { motion } from "framer-motion";

const cellConfig = {
  tn: { label: "True Negative", color: "#c1d722", bg: "rgba(0,212,170,0.1)", tooltip: "Correctly predicted as Healthy" },
  fp: { label: "False Positive", color: "#8aa300", bg: "rgba(138, 163, 0, 0.1)", tooltip: "Incorrectly predicted as Disease" },
  fn: { label: "False Negative", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", tooltip: "Missed disease case" },
  tp: { label: "True Positive", color: "#747b46", bg: "rgba(59,130,246,0.1)", tooltip: "Correctly predicted as Disease" },
};

export default function ConfusionMatrix({ matrix, loading }) {
  if (loading) {
    return (
      <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
          Confusion Matrix
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!matrix) return null;

  const cells = [
    { key: "tn", value: matrix.tn },
    { key: "fp", value: matrix.fp },
    { key: "fn", value: matrix.fn },
    { key: "tp", value: matrix.tp },
  ];

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Confusion Matrix
      </h2>

      {/* Axis labels */}
      <div className="mb-2 flex">
        <div className="w-12" />
        <div className="flex-1 grid grid-cols-2 gap-3 text-center">
          <span className="text-[0.65rem] text-[var(--color-muted)] uppercase tracking-wider">Pred. Healthy</span>
          <span className="text-[0.65rem] text-[var(--color-muted)] uppercase tracking-wider">Pred. Disease</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-12 flex flex-col justify-around">
          <span className="text-[0.6rem] text-[var(--color-muted)] -rotate-90 whitespace-nowrap">Actual H</span>
          <span className="text-[0.6rem] text-[var(--color-muted)] -rotate-90 whitespace-nowrap">Actual D</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {cells.map(({ key, value }, idx) => {
            const cfg = cellConfig[key];
            return (
              <motion.div
                key={key}
                data-tooltip={cfg.tooltip}
                className="rounded-xl p-4 flex flex-col items-center justify-center cursor-help border"
                style={{
                  background: cfg.bg,
                  borderColor: `${cfg.color}30`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold mt-1" style={{ color: cfg.color }}>
                  {value}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

