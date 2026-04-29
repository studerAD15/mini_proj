import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../..");
const inferScript = path.join(serverRoot, "ml", "infer.py");
const imageInferScript = path.join(serverRoot, "ml", "image_infer.py");
const trainScript = path.join(serverRoot, "ml", "train_model.py");
const artifactPath = path.join(serverRoot, "model_artifacts", "liverml_artifact.joblib");

const resolvePythonExecutable = () => {
  const configured = process.env.PYTHON_EXECUTABLE;
  if (configured && fs.existsSync(configured)) {
    return configured;
  }

  const bundled = "C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
  if (fs.existsSync(bundled)) {
    return bundled;
  }

  return "python";
};

const runPython = async (scriptPath, args = []) => {
  try {
    const pythonExe = resolvePythonExecutable();
    const { stdout } = await execFileAsync(pythonExe, [scriptPath, ...args], {
      cwd: serverRoot,
      maxBuffer: 1024 * 1024 * 4
    });
    return stdout.trim();
  } catch (error) {
    const stderr = error?.stderr || "";
    throw new Error(stderr || error.message || "Python command failed");
  }
};

export const trainModelArtifact = async () => {
  const output = await runPython(trainScript, ["--out", artifactPath]);
  return JSON.parse(output || "{}");
};

const ensureArtifact = async () => {
  if (!fs.existsSync(artifactPath)) {
    await trainModelArtifact();
  }
};

export const inferPatient = async (patient) => {
  await ensureArtifact();
  const output = await runPython(inferScript, [
    "--artifact",
    artifactPath,
    "--mode",
    "predict",
    "--input",
    JSON.stringify(patient)
  ]);
  return JSON.parse(output || "{}");
};

export const getModelInfo = async () => {
  await ensureArtifact();
  const output = await runPython(inferScript, [
    "--artifact",
    artifactPath,
    "--mode",
    "info"
  ]);
  return JSON.parse(output || "{}");
};

export const getImageModelStatus = async () => {
  const output = await runPython(imageInferScript, ["--mode", "status"]);
  return JSON.parse(output || "{}");
};

export const inferUltrasoundImage = async (imagePath) => {
  const output = await runPython(imageInferScript, [
    "--mode",
    "predict",
    "--image",
    imagePath
  ]);
  return JSON.parse(output || "{}");
};
