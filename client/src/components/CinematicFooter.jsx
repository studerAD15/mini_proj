import { Activity, ExternalLink } from "lucide-react";

export default function CinematicFooter() {
  return (
    <footer className="cinematic-footer" id="cinematic-footer">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Activity size={16} style={{ color: "#c1d722" }} />
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Liver Risk AI
        </span>
      </div>

      <p
        className="text-xs leading-relaxed max-w-lg mx-auto"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-muted)",
          fontSize: "0.7rem",
          letterSpacing: "0.02em",
        }}
      >
        Powered by Logistic Regression ML · 583 clinical records · Real-time inference
      </p>

      <p
        className="text-xs mt-3"
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Created by ADITYA CHHIKARA
      </p>

      <a
        href="https://www.linkedin.com/in/aditya-chhikara-9a7453306"
        target="_blank"
        rel="noreferrer"
        className="btn-secondary inline-flex items-center gap-2 mt-4 px-4 py-2 text-xs"
        aria-label="Visit ADITYA CHHIKARA on LinkedIn"
      >
        <ExternalLink size={14} />
        <span>LinkedIn</span>
      </a>
    </footer>
  );
}

