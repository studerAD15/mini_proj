import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, Download, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import { deletePrediction } from "../services/api";

export default function PredictionHistory({ predictions, total, page, totalPages, onPageChange, onRefresh, loading }) {
  const [filterGender, setFilterGender] = useState("");
  const [filterLabel, setFilterLabel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = async (id) => {
    try {
      await deletePrediction(id);
      toast.success("Prediction deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete prediction");
    }
  };

  const handleExportCSV = () => {
    if (!predictions || predictions.length === 0) return;
    const headers = ["Time", "Age", "Gender", "Label", "Risk Score", "Confidence"];
    const rows = predictions.map((p) => [
      new Date(p.createdAt).toLocaleString(),
      p.age,
      p.gender,
      p.label,
      p.riskScore,
      p.confidence,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleFilterApply = () => {
    onRefresh({ gender: filterGender || undefined, label: filterLabel || undefined });
  };

  const handleClearFilters = () => {
    setFilterGender("");
    setFilterLabel("");
    onRefresh({});
  };

  const isEmpty = !predictions || predictions.length === 0;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c1d722] inline-block" />
          Recent Predictions
          {total > 0 && (
            <span className="text-xs text-[var(--color-muted)] font-normal ml-1">({total})</span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <Filter size={13} /> Filters
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs flex items-center gap-1"
            disabled={isEmpty}
          >
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          className="flex gap-3 mb-4 flex-wrap items-end"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] text-[var(--color-muted)] uppercase tracking-wider">Gender</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="text-xs py-1.5 px-2 w-28"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] text-[var(--color-muted)] uppercase tracking-wider">Label</label>
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="text-xs py-1.5 px-2 w-36"
            >
              <option value="">All</option>
              <option value="disease">Liver Disease</option>
              <option value="healthy">Healthy</option>
            </select>
          </div>
          <button onClick={handleFilterApply} className="btn-primary text-xs px-3 py-1.5">Apply</button>
          <button onClick={handleClearFilters} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-muted)]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <p className="text-[var(--color-muted)] text-sm">No predictions yet</p>
          <p className="text-[rgba(255,255,255,0.3)] text-xs mt-1">Submit patient data to start recording</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Label</th>
                  <th>Risk</th>
                  <th>Confidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p._id}>
                    <td className="text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="font-[family-name:var(--font-mono)]">{p.age}</td>
                    <td>{p.gender}</td>
                    <td>
                      <span className={p.label?.includes("Disease") ? "badge-disease" : "badge-healthy"}>
                        {p.label?.includes("Disease") ? "Disease" : "Healthy"}
                      </span>
                    </td>
                    <td className="font-[family-name:var(--font-mono)]">{p.riskScore}%</td>
                    <td className="font-[family-name:var(--font-mono)]">{p.confidence}%</td>
                    <td>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-[#8aa300] hover:text-[#8aa300] transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-muted)]">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-xs p-1.5"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="btn-secondary text-xs p-1.5"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

