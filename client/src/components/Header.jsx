import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, Sun, Moon, RefreshCw, Settings, Clock, Cpu,
} from "lucide-react";

export default function Header({
  darkMode, setDarkMode, lastPrediction, onRefreshModel,
  refreshing, onOpenSettings, onTrainModel, training,
}) {
  const [timeSince, setTimeSince] = useState("");

  useEffect(() => {
    if (!lastPrediction) {
      setTimeSince("");
      return;
    }
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(lastPrediction).getTime()) / 1000);
      if (diff < 60) setTimeSince(`${diff}s ago`);
      else if (diff < 3600) setTimeSince(`${Math.floor(diff / 60)}m ago`);
      else setTimeSince(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, [lastPrediction]);

  return (
    <nav className="nav-bar">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c1d722] to-[#8aa300] flex items-center justify-center">
            <Activity size={20} className="text-[#0a0f1e]" />
          </div>
          <div>
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)] leading-tight tracking-tight">
              Liver Risk AI
            </h1>
            <p className="text-[0.65rem] text-[var(--color-muted)] leading-none tracking-wide uppercase">
              Intelligence Dashboard
            </p>
          </div>
        </motion.div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Last prediction badge */}
          {timeSince && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 bg-[rgba(0,212,170,0.1)] text-[#c1d722] px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <Clock size={12} />
              <span>Last: {timeSince}</span>
            </motion.div>
          )}

          {/* Refresh Model */}
          <button
            onClick={onRefreshModel}
            disabled={refreshing}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh Model Info"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Train Model */}
          <button
            onClick={onTrainModel}
            disabled={training}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Retrain Model"
          >
            {training ? <span className="spinner" /> : <Cpu size={14} />}
            <span className="hidden sm:inline">{training ? "Training..." : "Train"}</span>
          </button>

          {/* Dark/Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-glass)] border border-[var(--color-border)] hover:border-[var(--color-teal)] transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-glass)] border border-[var(--color-border)] hover:border-[var(--color-teal)] transition-all"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

