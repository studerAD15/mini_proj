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
