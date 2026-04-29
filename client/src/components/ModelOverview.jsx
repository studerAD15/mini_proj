import { motion } from "framer-motion";
import { Brain, BarChart3, Database, Target, Crosshair } from "lucide-react";

function KpiCard({ icon: Icon, label, value, delay = 0, color = "#c1d722" }) {
  return (
    <motion.div
      className="glass-card p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <span className="font-[family-name:var(--font-mono)] text-xl font-bold" style={{ color }}>
        {value}
      </span>
    </motion.div>
  );
}

export default function ModelOverview({ modelInfo, loading }) {
  if (loading) {
    return (
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
          Model Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!modelInfo) return null;

  const metrics = modelInfo.bestModelMetrics || {};

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Model Overview
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard
          icon={Brain}
          label="Best Model"
          value={modelInfo.bestModelName || "N/A"}
          delay={0.1}
        />
        <KpiCard
          icon={BarChart3}
          label="AUC-ROC"
          value={(metrics.auc_roc || 0).toFixed(4)}
          delay={0.15}
        />
        <KpiCard
          icon={Target}
          label="F1 Score"
          value={(metrics.f1 || 0).toFixed(4)}
          delay={0.2}
        />
        <KpiCard
          icon={Database}
          label="Dataset Rows"
          value={modelInfo.datasetRows || "—"}
          delay={0.25}
          color="#e8f0fe"
        />
        <KpiCard
          icon={Crosshair}
          label="Precision"
          value={(metrics.precision || 0).toFixed(4)}
          delay={0.3}
          color="#8aa300"
        />
        <KpiCard
          icon={Crosshair}
          label="Recall"
          value={(metrics.recall || 0).toFixed(4)}
          delay={0.35}
          color="#8aa300"
        />
      </div>
    </motion.div>
  );
}

