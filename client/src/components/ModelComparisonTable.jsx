import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Trophy } from "lucide-react";

export default function ModelComparisonTable({ comparison, bestModel, loading }) {
  const [sortKey, setSortKey] = useState("auc");
  const [sortDir, setSortDir] = useState("desc");

  const columns = [
    { key: "model", label: "Model" },
    { key: "auc", label: "AUC" },
    { key: "f1", label: "F1" },
    { key: "accuracy", label: "Accuracy" },
    { key: "mcc", label: "MCC" },
  ];

  const sorted = useMemo(() => {
    if (!comparison) return [];
    return [...comparison].sort((a, b) => {
      if (sortKey === "model") {
        return sortDir === "asc"
          ? a.model.localeCompare(b.model)
          : b.model.localeCompare(a.model);
      }
      return sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
  }, [comparison, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (loading) {
    return (
      <section className="py-6" id="model-comparison">
        <div className="glass-card p-6 sm:p-8">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Trophy size={20} style={{ color: "#c1d722" }} />
            Model Comparison
          </h2>
          <div className="skeleton h-52 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!comparison || comparison.length === 0) return null;

  return (
    <section className="py-6" id="model-comparison">
      <div className="glass-card p-6 sm:p-8">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #c1d722, #747b46)",
              boxShadow: "0 0 10px rgba(0,212,170,0.3)",
            }}
          />
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Model Comparison
          </h2>
        </div>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-muted)" }}
        >
          Performance metrics across all tested classifiers
        </p>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown
                        size={12}
                        style={{
                          opacity: sortKey === col.key ? 1 : 0.3,
                          color: sortKey === col.key ? "#c1d722" : "inherit",
                        }}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => {
                const isBest = row.model === bestModel;
                return (
                  <motion.tr
                    key={row.model}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      borderLeft: isBest ? "3px solid #c1d722" : "3px solid transparent",
                      background: isBest ? "rgba(0,212,170,0.03)" : "transparent",
                    }}
                    whileHover={{ y: -2 }}
                  >
                    <td className="font-medium" style={{ fontFamily: "var(--font-display)" }}>
                      {row.model}
                      {isBest && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(0,212,170,0.12)",
                            color: "#c1d722",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: isBest ? "#c1d722" : "inherit" }}>
                      {row.auc?.toFixed(4)}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{row.f1?.toFixed(4)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{row.accuracy?.toFixed(4)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{row.mcc?.toFixed(4)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

