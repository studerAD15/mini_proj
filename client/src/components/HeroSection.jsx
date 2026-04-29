import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const scrollToPredict = () => {
    const el = document.getElementById("prediction-card");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="pt-16 sm:pt-24 pb-12 text-center" id="hero-section">
      {/* Pill label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
        style={{
          background: "rgba(193, 215, 34, 0.08)",
          border: "1px solid rgba(193, 215, 34, 0.15)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: "#c1d722", boxShadow: "0 0 6px #c1d722" }}
        />
        <span
          className="text-xs font-medium tracking-[0.1em] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#c1d722" }}
        >
          AI-Powered Clinical Intelligence
        </span>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="text-white">Predict.</span>{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #c1d722, #747b46)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Detect.
        </span>{" "}
        <span className="text-white">Protect.</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        style={{ color: "var(--color-muted)" }}
      >
        AI-powered Liver Disease Risk Intelligence — instant clinical insights
        from patient biomarkers
      </motion.p>

      {/* CTA Button with pulse ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <button
          onClick={scrollToPredict}
          className="btn-cta"
          id="hero-cta-button"
        >
          <span className="pulse-ring" />
          Analyze Patient Risk
          <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Floating stat pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="flex flex-wrap justify-center gap-3 sm:gap-4"
      >
        <div className="stat-pill">
          <span className="stat-value">583</span>
          <span>Patients Analyzed</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">84%</span>
          <span>AUC Accuracy</span>
        </div>
        <div className="stat-pill">
          <span style={{ color: "#6ea94e", fontWeight: 700 }}>⚡</span>
          <span>Real-time Prediction</span>
        </div>
      </motion.div>
    </section>
  );
}

