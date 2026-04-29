import json
from datetime import datetime, timezone
from pathlib import Path

import tensorflow as tf

ARTIFACT_DIR = Path(__file__).resolve().parents[1] / "model_artifacts"
MODEL_PATH = ARTIFACT_DIR / "cnn_ultrasound_model.keras"
METADATA_PATH = ARTIFACT_DIR / "cnn_ultrasound_metadata.json"


def build_demo_model():
    inputs = tf.keras.Input(shape=(224, 224, 3), name="ultrasound_image")
    x = tf.keras.layers.Rescaling(1.0, name="identity_rescale")(inputs)
    x = tf.keras.layers.Conv2D(16, 3, activation="relu", padding="same", name="conv_1")(x)
    x = tf.keras.layers.MaxPooling2D(name="pool_1")(x)
    x = tf.keras.layers.Conv2D(32, 3, activation="relu", padding="same", name="conv_2")(x)
    x = tf.keras.layers.MaxPooling2D(name="pool_2")(x)
    x = tf.keras.layers.Conv2D(64, 3, activation="relu", padding="same", name="conv_3")(x)
    x = tf.keras.layers.GlobalAveragePooling2D(name="gap")(x)
    x = tf.keras.layers.Dense(32, activation="relu", name="dense_1")(x)
    outputs = tf.keras.layers.Dense(2, activation="softmax", name="class_output")(x)
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="demo_liver_ultrasound_cnn")
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    model = build_demo_model()
    model.save(MODEL_PATH)

    metadata = {
      "artifactType": "keras",
      "artifactPath": str(MODEL_PATH),
      "classNames": ["Healthy", "Liver Disease"],
      "source": "demo-generated",
      "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
      "note": "Demo CNN artifact generated locally to make the ultrasound route operable. Replace with notebook-trained weights for meaningful predictions."
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata))


if __name__ == "__main__":
    main()
