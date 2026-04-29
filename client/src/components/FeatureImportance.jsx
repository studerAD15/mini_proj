import { motion } from "framer-motion";

export default function FeatureImportance({ featureImportance, visible = true }) {
  if (!visible || !featureImportance) return null;

  const features = Object.entries(featureImportance)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const maxValue = features.length > 0 ? features[0].value : 1;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Global Feature Importance
      </h2>
      <div className="space-y-3">
        {features.map((item, idx) => {
          const pct = Math.max((item.value / maxValue) * 100, 3);
          const intensity = item.value / maxValue;
          const color =
            intensity > 0.7
              ? "#c1d722"
              : intensity > 0.4
              ? "#8aa300"
              : intensity > 0.2
              ? "#4a6380"
              : "#3a4f65";

          return (
            <motion.div
              key={item.name}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
            >
              <span className="text-xs w-44 text-right truncate text-[var(--color-muted)] font-medium">
                {item.name}
              </span>
              <div className="flex-1 h-5 rounded bg-[rgba(255,255,255,0.04)] overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.05, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-[family-name:var(--font-mono)] w-14 text-right text-[var(--color-soft-white)]">
                {item.value.toFixed(4)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

