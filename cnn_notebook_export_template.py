"""
Paste this cell near the end of your ultrasound CNN notebook after `model`
or `best_model` has been trained.

It exports a Keras artifact directly into the filename the app already knows:
`server/model_artifacts/cnn_ultrasound_model.keras`

If you train outside this workspace, export anywhere first and then run:
python server/ml/register_cnn_artifact.py --source "path/to/model.keras"
"""

from pathlib import Path
import json
from datetime import datetime, timezone

# Pick whichever symbol exists in the notebook
cnn_model = globals().get("best_model") or globals().get("model")
if cnn_model is None:
    raise RuntimeError("No `best_model` or `model` object found in notebook scope.")

artifact_dir = Path.cwd() / "server" / "model_artifacts"
artifact_dir.mkdir(parents=True, exist_ok=True)

artifact_path = artifact_dir / "cnn_ultrasound_model.keras"
metadata_path = artifact_dir / "cnn_ultrasound_metadata.json"

cnn_model.save(artifact_path)

metadata = {
    "artifactType": "keras",
    "artifactPath": str(artifact_path),
    "source": "notebook-export",
    "classNames": globals().get("CLASS_NAMES", ["Healthy", "Liver Disease"]),
    "exportedAtUtc": datetime.now(timezone.utc).isoformat(),
}

metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

print("Saved CNN artifact to:", artifact_path)
print("Saved metadata to:", metadata_path)
