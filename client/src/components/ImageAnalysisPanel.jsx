import { useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Activity, UploadCloud } from "lucide-react";

export default function ImageAnalysisPanel({
  status,
  loadingStatus,
  onRefreshStatus,
  onPredictImage,
  predicting,
  result,
}) {
  const [file, setFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) return;
    onPredictImage(file);
  };

  return (
    <section className="py-6" id="image-analysis">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, #747b46, #6ea94e)",
                boxShadow: "0 0 10px rgba(116, 123, 70, 0.35)",
              }}
            />
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Ultrasound Image Analysis
            </h2>
          </div>
          <button onClick={onRefreshStatus} className="btn-secondary text-xs" disabled={loadingStatus}>
            {loadingStatus ? "Checking..." : "Refresh CNN Status"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <motion.form
            onSubmit={handleSubmit}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={18} style={{ color: "#60a5fa" }} />
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Upload Liver Ultrasound
              </h3>
            </div>

            <label
              className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center cursor-pointer"
              style={{
                border: "1px dashed rgba(96,165,250,0.35)",
                background: "linear-gradient(180deg, rgba(193, 215, 34, 0.08), rgba(110, 169, 78, 0.06))",
              }}
            >
              <UploadCloud size={28} style={{ color: "#60a5fa" }} />
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                {file ? file.name : "Choose a PNG, JPG, or JPEG image"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            <button type="submit" className="btn-primary w-full mt-5 py-3 text-sm" disabled={!file || predicting}>
              {predicting ? "Analyzing ultrasound..." : "Run CNN Analysis"}
            </button>
          </motion.form>

          <motion.div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} style={{ color: "#6ea94e" }} />
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                CNN Status
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--color-muted)" }}>Ready: </span>
                <strong style={{ color: status?.ready ? "#c1d722" : "#8aa300" }}>
                  {status?.ready ? "Yes" : "No"}
                </strong>
              </div>
              <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--color-muted)" }}>Artifact: </span>
                <strong>{status?.modelArtifactFound ? "Found" : "Missing"}</strong>
              </div>
              <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--color-muted)" }}>TensorFlow: </span>
                <strong>{status?.tensorflowAvailable ? "Installed" : "Missing"}</strong>
              </div>
              <p style={{ color: "var(--color-muted)" }}>
                {status?.message || "CNN status unavailable."}
              </p>
            </div>

            {result && (
              <div className="mt-5">
                <div
                  className="rounded-xl px-4 py-3 mb-3"
                  style={{
                    background: "rgba(110, 169, 78, 0.1)",
                    border: "1px solid rgba(110, 169, 78, 0.2)",
                  }}
                >
                  <span style={{ color: "var(--color-muted)" }}>Prediction: </span>
                  <strong>{result.label}</strong>
                </div>
                <div className="space-y-2">
                  {result.probabilities?.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.label}</span>
                        <span>{(item.value * 100).toFixed(2)}%</span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.value * 100}%`,
                            background: "linear-gradient(90deg, #747b46, #6ea94e)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

