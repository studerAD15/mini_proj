import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    totalBilirubin: { type: Number, required: true },
    directBilirubin: { type: Number, required: true },
    alkalinePhosphatase: { type: Number, required: true },
    alt: { type: Number, required: true },
    ast: { type: Number, required: true },
    totalProteins: { type: Number, required: true },
    albumin: { type: Number, required: true },
    agRatio: { type: Number, required: true },
    label: { type: String, required: true },
    riskScore: { type: Number, required: true },
    confidence: { type: Number, required: true },
    contributors: [
      {
        feature: String,
        impact: Number,
        importance: Number,
      },
    ],
  },
  { timestamps: true }
);

predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ gender: 1 });
predictionSchema.index({ label: 1 });

export const Prediction = mongoose.model("Prediction", predictionSchema);
