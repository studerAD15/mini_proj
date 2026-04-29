import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, Settings, Clock, Cpu } from "lucide-react";

export default function Navbar({
  lastPrediction,
  onRefreshModel,
  refreshing,
  onOpenSettings,
  onTrainModel,
  training,
}) {
  const [timeSince, setTimeSince] = useState("");

  useEffect(() => {
    if (!lastPrediction) {
      setTimeSince("");
      return;
    }
    const update = () => {
      const diff = Math.floor(
        (Date.now() - new Date(lastPrediction).getTime()) / 1000
      );
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
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #c1d722, #6ea94e)",
              boxShadow: "0 4px 15px rgba(193, 215, 34, 0.3)",
            }}
          >
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-base font-bold leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Liver Risk AI
            </h1>
            <p
              className="text-[0.6rem] leading-none tracking-[0.15em] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-teal)",
              }}
            >
              Intelligence Platform
            </p>
          </div>
        </motion.div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {timeSince && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(193, 215, 34, 0.08)",
                color: "#c1d722",
                border: "1px solid rgba(193, 215, 34, 0.15)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Clock size={12} />
              <span>Last: {timeSince}</span>
            </motion.div>
          )}

          <button
            onClick={onRefreshModel}
            disabled={refreshing}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh Model Info"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onTrainModel}
            disabled={training}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Retrain Model"
          >
            {training ? <span className="spinner" /> : <Cpu size={14} />}
            <span className="hidden sm:inline">
              {training ? "Training..." : "Train"}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

