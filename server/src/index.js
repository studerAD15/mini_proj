import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import predictRoutes from "./routes/predictRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGO_URI;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: [clientOrigin],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "liver-risk-api", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", predictRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  if (!mongoUri) {
    console.error(
      "Startup error: MONGO_URI is not set.\n" +
        "- Create `server/.env`\n" +
        "- Set MONGO_URI to your MongoDB Atlas connection string, e.g.\n" +
        "  mongodb+srv://<user>:<pass>@<cluster-host>/<dbName>?retryWrites=true&w=majority"
    );
    process.exit(1);
  }

  await connectDB(mongoUri);
  console.log("✓ MongoDB connected");

  const server = app.listen(port, () => {
    console.log(`✓ Express API running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      console.error(
        `Startup error: PORT ${port} is already in use. Stop the other process or change PORT in server/.env.`
      );
      process.exit(1);
    }
    throw err;
  });
};

start().catch((error) => {
  console.error("Startup error:", error.message);
  process.exit(1);
});
