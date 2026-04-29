import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";

export default function ModelComparison({ comparison, bestModel, loading }) {
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
      return sortDir === "asc"
        ? a[sortKey] - b[sortKey]
        : b[sortKey] - a[sortKey];
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
      <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
          Model Comparison
        </h2>
        <div className="skeleton h-48 rounded-xl" />
      </motion.div>
    );
  }

  if (!comparison || comparison.length === 0) return null;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
        Model Comparison
      </h2>
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
                    <ArrowUpDown size={12} className={`opacity-40 ${
                      sortKey === col.key ? "opacity-100 text-[#c1d722]" : ""
                    }`} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isBest = row.model === bestModel;
              return (
                <tr
                  key={row.model}
                  className={isBest ? "border-l-2 border-l-[#c1d722]" : ""}
                >
                  <td className="font-medium">
                    {row.model}
                    {isBest && (
                      <span className="ml-2 text-[0.65rem] bg-[rgba(0,212,170,0.15)] text-[#c1d722] px-2 py-0.5 rounded-full">
                        BEST
                      </span>
                    )}
                  </td>
                  <td className="font-[family-name:var(--font-mono)]">{row.auc.toFixed(4)}</td>
                  <td className="font-[family-name:var(--font-mono)]">{row.f1.toFixed(4)}</td>
                  <td className="font-[family-name:var(--font-mono)]">{row.accuracy.toFixed(4)}</td>
                  <td className="font-[family-name:var(--font-mono)]">{row.mcc.toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

