# Liver Model Full-Stack Showcase (MERN)

This project is a complete full-stack demo to showcase a liver disease prediction workflow:

- `client/`: React + Vite UI for entering patient parameters and viewing model output
- `server/`: Express API + MongoDB persistence for predictions and history
- `server/ml/train_model.py`: trains and exports a notebook-style ML artifact
- `server/ml/infer.py`: runs prediction and model info from exported artifact

## 1) Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas connection string (online; no local Mongo install required)

## 2) Setup

From the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Install Python dependencies:

```bash
pip install -r server/ml/requirements.txt
```

Create env files:

1. Create `server/.env` and set:
   - `PORT=5000`
   - `MONGO_URI=<your MongoDB Atlas connection string with db name>`
     - Example format:
       - `mongodb+srv://<user>:<pass>@<cluster-host>/<dbName>?retryWrites=true&w=majority&appName=<appName>`
2. Copy `client/.env.example` to `client/.env` (optional)

## 3) Run

```bash
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173` (if busy, Vite picks another port)
- Backend: `http://localhost:5000`

## 4) API Endpoints

- `GET /health`
- `POST /api/predict`
- `GET /api/predictions`
- `GET /api/model-info`
- `GET /api/model-comparison`
- `POST /api/refresh-model`
- `GET /api/analytics`
- `GET /api/image-model/status`
- `POST /api/image/predict`

Example prediction payload:

```json
{
  "age": 45,
  "gender": "Male",
  "totalBilirubin": 0.7,
  "directBilirubin": 0.1,
  "alkalinePhosphotase": 187,
  "alamineAminotransferase": 16,
  "aspartateAminotransferase": 18,
  "totalProteins": 6.8,
  "albumin": 3.3,
  "agratio": 0.9
}
```

## 5) Model Workflow

1. `POST /api/model/train` trains models and saves:
   - `server/model_artifacts/liverml_artifact.joblib`
2. `POST /api/predict` performs:
   - notebook-style preprocessing (encoding, imputation, scaling)
   - calibrated best-model inference
   - top contributors extraction
3. `GET /api/model/info` returns:
   - best model, metrics, confusion matrix, feature importance, dataset stats

## 6) Ultrasound CNN Workflow

The app now supports a Keras ultrasound artifact at:

- `server/model_artifacts/cnn_ultrasound_model.keras`
- or `server/model_artifacts/cnn_ultrasound_model.h5`

Files added for this flow:

- `cnn_notebook_export_template.py`
- `server/ml/register_cnn_artifact.py`
- `server/ml/create_demo_cnn_artifact.py`

Use cases:

1. Export from your notebook directly into the app path using the template in `cnn_notebook_export_template.py`
2. Or register any existing `.keras` / `.h5` artifact:

```bash
python server/ml/register_cnn_artifact.py --source "path/to/model.keras"
```

3. If you just want the image route to be live for demo/testing, generate the demo artifact:

```bash
python server/ml/create_demo_cnn_artifact.py
```

Important:

- the generated demo CNN makes the route operable, but it is not a medically meaningful trained ultrasound model
- replace it with your real notebook-trained Keras artifact for real image inference

## 7) Deploy Ready Setup

This repo is now prepared for:

- `Vercel` for the frontend in `client/`
- `Render` for the backend in `server/`
- `MongoDB Atlas` for the database

Files added for deployment:

- `client/vercel.json`
- `server/Dockerfile`
- `server/.dockerignore`
- `render.yaml`

## 8) Step-by-Step Deploy To Vercel + Render

### A. Prepare MongoDB Atlas

1. Create or open your MongoDB Atlas cluster
2. Create a database user
3. Add your IP access or allow access from anywhere for deployment
4. Use a connection string with a real database name, for example:

```bash
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/liver_risk_ai?retryWrites=true&w=majority&appName=Cluster0
```

### B. Deploy Backend To Render

1. Push this repo to GitHub
2. Go to Render and click `New +` -> `Blueprint`
3. Select this repository
4. Render will detect `render.yaml`
5. When prompted, set these environment variables:
   - `MONGO_URI=your atlas connection string`
   - `CLIENT_ORIGIN=https://your-vercel-frontend-url.vercel.app`
6. Deploy

Render backend notes:

- Root directory: `server`
- Runtime: Docker
- Health check path: `/health`
- The backend will expose routes like:
  - `https://your-render-service.onrender.com/health`
  - `https://your-render-service.onrender.com/api/model-info`

### C. Deploy Frontend To Vercel

1. Go to Vercel and click `Add New Project`
2. Import this GitHub repository
3. Set the root directory to:

```bash
client
```

4. Vercel should use:
   - Build command: `npm run build`
   - Output directory: `dist`

5. Add this environment variable:

```bash
VITE_API_URL=https://your-render-service.onrender.com/api
```

6. Deploy

### D. Update Backend CORS

After Vercel gives you the real frontend URL:

1. Open Render service settings
2. Update:

```bash
CLIENT_ORIGIN=https://your-real-vercel-url.vercel.app
```

3. Redeploy the backend if needed

You can also support multiple frontend URLs by comma-separating them:

```bash
CLIENT_ORIGIN=https://prod-url.vercel.app,http://localhost:5173
```

## 9) Production Environment Variables

### Render backend

Set these on Render:

```bash
MONGO_URI=your_atlas_uri
CLIENT_ORIGIN=https://your-frontend.vercel.app
PYTHON_EXECUTABLE=python3
NODE_ENV=production
```

### Vercel frontend

Set this on Vercel:

```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

## 10) Deploy Verification Checklist

After both deploys:

1. Open the frontend URL
2. Confirm the dashboard loads
3. Test:
   - patient prediction
   - model info
   - model comparison
   - history saving
   - ultrasound image analysis
4. Open backend health endpoint:

```bash
https://your-backend.onrender.com/health
```

Expected response:

```json
{
  "ok": true,
  "service": "liver-risk-api"
}
```

## 11) Important Deployment Notes

- The backend uses Python ML dependencies, so Docker deployment on Render is the safest option
- The demo CNN artifact works for app operability, but replace it with your notebook-trained `.keras` or `.h5` artifact for meaningful image predictions
- If you rotate MongoDB credentials, update `MONGO_URI` on Render immediately
- If Render sleeps on a free plan, the first prediction request may be slower
