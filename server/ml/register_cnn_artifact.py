import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ARTIFACT_DIR = Path(__file__).resolve().parents[1] / "model_artifacts"
TARGET_KERAS = ARTIFACT_DIR / "cnn_ultrasound_model.keras"
TARGET_H5 = ARTIFACT_DIR / "cnn_ultrasound_model.h5"
METADATA_PATH = ARTIFACT_DIR / "cnn_ultrasound_metadata.json"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--classes", default="Healthy,Liver Disease")
    parser.add_argument("--origin", default="notebook-export")
    args = parser.parse_args()

    source = Path(args.source).expanduser().resolve()
    if not source.exists():
        raise FileNotFoundError(f"Source artifact not found: {source}")

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    suffix = source.suffix.lower()
    if suffix == ".keras":
        target = TARGET_KERAS
    elif suffix == ".h5":
        target = TARGET_H5
    else:
        raise ValueError("Only .keras or .h5 artifacts are supported for registration.")

    shutil.copy2(source, target)

    metadata = {
        "artifactType": suffix.lstrip("."),
        "artifactPath": str(target),
        "originalSource": str(source),
        "classNames": [item.strip() for item in args.classes.split(",") if item.strip()],
        "source": args.origin,
        "registeredAtUtc": datetime.now(timezone.utc).isoformat(),
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata))


if __name__ == "__main__":
    main()
