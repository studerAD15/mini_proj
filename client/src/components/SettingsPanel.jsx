import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Maximize2, Minimize2, Trash2, Brain } from "lucide-react";
import toast from "react-hot-toast";
import { clearPredictions } from "../services/api";
import { useState } from "react";

export default function SettingsPanel({
  open, onClose, settings, setSettings, onClearHistory, modelNames, selectedModel, onModelChange,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = async () => {
    try {
      await clearPredictions();
      toast.success("Prediction history cleared");
      setConfirmClear(false);
      onClearHistory();
    } catch {
      toast.error("Failed to clear history");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`sidebar-drawer ${open ? "open" : ""}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-6">
            {/* Show Feature Importance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.showFeatureImportance ? <Eye size={16} className="text-[#c1d722]" /> : <EyeOff size={16} className="text-[var(--color-muted)]" />}
                <span className="text-sm">Feature Importance</span>
              </div>
              <div
                className={`toggle-switch ${settings.showFeatureImportance ? "active" : ""}`}
                onClick={() => setSettings({ ...settings, showFeatureImportance: !settings.showFeatureImportance })}
                role="switch"
                aria-checked={settings.showFeatureImportance}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSettings({ ...settings, showFeatureImportance: !settings.showFeatureImportance })}
              />
            </div>

            {/* Compact View */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.compactView ? <Minimize2 size={16} className="text-[#c1d722]" /> : <Maximize2 size={16} className="text-[var(--color-muted)]" />}
                <span className="text-sm">{settings.compactView ? "Compact" : "Expanded"} View</span>
              </div>
              <div
                className={`toggle-switch ${settings.compactView ? "active" : ""}`}
                onClick={() => setSettings({ ...settings, compactView: !settings.compactView })}
                role="switch"
                aria-checked={settings.compactView}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSettings({ ...settings, compactView: !settings.compactView })}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]" />

            {/* Model Selector */}
            <div>
              <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain size={13} /> Model Selector
              </label>
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full text-sm"
              >
                {(modelNames || ["Default"]).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <p className="text-[0.65rem] text-[var(--color-muted)] mt-1.5">
                Select which model to use for predictions
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]" />

            {/* Clear History */}
            <div>
              <button
                onClick={() => setConfirmClear(true)}
                className="btn-danger w-full flex items-center justify-center gap-2 text-sm py-2.5"
              >
                <Trash2 size={14} /> Clear Prediction History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">
                Clear All History?
              </h3>
              <p className="text-sm text-[var(--color-muted)] mb-5">
                This will permanently delete all prediction records from the database. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="btn-danger text-sm px-4"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

