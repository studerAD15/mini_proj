import express from "express";
import mongoose from "mongoose";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import multer from "multer";
import { Prediction } from "../models/Prediction.js";
import {
  predictPatient,
  getModelInfo,
  getModelComparison,
  refreshModel,
  getImageModelStatus,
  predictUltrasoundImage,
} from "../services/mlService.js";

const router = express.Router();
const upload = multer({ dest: path.join(os.tmpdir(), "liver-risk-uploads") });

const isMongoConnected = () => mongoose.connection?.readyState === 1;

// ── POST /api/predict ──
router.post("/predict", async (req, res) => {
  try {
    const {
      gender, age, totalBilirubin, directBilirubin,
      alkalinePhosphatase, alt, ast, totalProteins, albumin, agRatio,
    } = req.body;

    // Validate required fields
    const missing = [];
    if (!gender) missing.push("gender");
    if (age == null) missing.push("age");
    if (totalBilirubin == null) missing.push("totalBilirubin");
    if (directBilirubin == null) missing.push("directBilirubin");
    if (alkalinePhosphatase == null) missing.push("alkalinePhosphatase");
    if (alt == null) missing.push("alt");
    if (ast == null) missing.push("ast");
    if (totalProteins == null) missing.push("totalProteins");
    if (albumin == null) missing.push("albumin");
    if (agRatio == null) missing.push("agRatio");

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({ message: "gender must be Male or Female" });
    }

    // Call ML microservice
    const result = await predictPatient({
      gender,
      age: Number(age),
      totalBilirubin: Number(totalBilirubin),
      directBilirubin: Number(directBilirubin),
      alkalinePhosphatase: Number(alkalinePhosphatase),
      alt: Number(alt),
      ast: Number(ast),
      totalProteins: Number(totalProteins),
      albumin: Number(albumin),
      agRatio: Number(agRatio),
    });

    // Save to MongoDB (optional)
    if (!isMongoConnected()) {
      return res.status(201).json({
        ...result,
        persisted: false,
        warning: "MongoDB not configured; prediction history is disabled.",
      });
    }

    const saved = await Prediction.create({
      age: Number(age),
      gender,
      totalBilirubin: Number(totalBilirubin),
      directBilirubin: Number(directBilirubin),
      alkalinePhosphatase: Number(alkalinePhosphatase),
      alt: Number(alt),
      ast: Number(ast),
      totalProteins: Number(totalProteins),
      albumin: Number(albumin),
      agRatio: Number(agRatio),
      label: result.label,
      riskScore: result.riskScore,
      confidence: result.confidence,
      contributors: result.contributors,
    });

    return res.status(201).json({ ...result, persisted: true, _id: saved._id, createdAt: saved.createdAt });
  } catch (error) {
    console.error("Predict error:", error.message);
    return res.status(500).json({
      message: "Prediction failed",
      error: error.message,
    });
  }
});

// ── GET /api/predictions ──
router.get("/predictions", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not configured; prediction history is disabled." });
    }
    const { page = 1, limit = 10, gender, label, startDate, endDate } = req.query;
    const filter = {};

    if (gender) filter.gender = gender;
    if (label) {
      filter.label = label === "disease"
        ? "Liver Disease Likely"
        : label === "healthy"
          ? "No Liver Disease"
          : label;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [predictions, total] = await Promise.all([
      Prediction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Prediction.countDocuments(filter),
    ]);

    return res.json({
      predictions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load predictions", error: error.message });
  }
});

// ── DELETE /api/predictions/:id ──
router.delete("/predictions/:id", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not configured; prediction history is disabled." });
    }
    const deleted = await Prediction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Prediction not found" });
    }
    return res.json({ message: "Prediction deleted", id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

// ── DELETE /api/predictions (clear all) ──
router.delete("/predictions", async (_req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not configured; prediction history is disabled." });
    }
    const result = await Prediction.deleteMany({});
    return res.json({ message: "All predictions cleared", deletedCount: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ message: "Clear failed", error: error.message });
  }
});

// ── GET /api/model-info ──
router.get("/model-info", async (_req, res) => {
  try {
    const info = await getModelInfo();
    return res.json(info);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load model info", error: error.message });
  }
});

router.get("/image-model/status", async (_req, res) => {
  try {
    const status = await getImageModelStatus();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load image model status", error: error.message });
  }
});

router.post("/image/predict", upload.single("image"), async (req, res) => {
  const uploadedPath = req.file?.path;
  try {
    if (!uploadedPath) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const result = await predictUltrasoundImage(uploadedPath);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Image prediction failed", error: error.message });
  } finally {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
  }
});

// ── GET /api/model-comparison ──
router.get("/model-comparison", async (_req, res) => {
  try {
    const comparison = await getModelComparison();
    return res.json(comparison);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load model comparison", error: error.message });
  }
});

// ── POST /api/refresh-model ──
router.post("/refresh-model", async (_req, res) => {
  try {
    const result = await refreshModel();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Model refresh failed", error: error.message });
  }
});

// ── GET /api/analytics ──
router.get("/analytics", async (_req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: "MongoDB not configured; analytics are disabled." });
    }
    // Risk score trend (last 20)
    const recentPredictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const riskTrend = recentPredictions.reverse().map((p) => ({
      time: p.createdAt,
      riskScore: p.riskScore,
    }));

    // Distribution
    const [diseaseCount, healthyCount] = await Promise.all([
      Prediction.countDocuments({ label: "Liver Disease Likely" }),
      Prediction.countDocuments({ label: "No Liver Disease" }),
    ]);

    // Average risk by age group
    const ageGroupPipeline = [
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 20] }, then: "<20" },
                { case: { $lt: ["$age", 30] }, then: "20s" },
                { case: { $lt: ["$age", 40] }, then: "30s" },
                { case: { $lt: ["$age", 50] }, then: "40s" },
                { case: { $lt: ["$age", 60] }, then: "50s" },
              ],
              default: "60+",
            },
          },
        },
      },
      {
        $group: {
          _id: "$ageGroup",
          avgRisk: { $avg: "$riskScore" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const ageGroups = await Prediction.aggregate(ageGroupPipeline);

    return res.json({
      riskTrend,
      distribution: { disease: diseaseCount, healthy: healthyCount },
      ageGroups: ageGroups.map((g) => ({
        group: g._id,
        avgRisk: Math.round(g.avgRisk * 100) / 100,
        count: g.count,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Analytics failed", error: error.message });
  }
});

export default router;
