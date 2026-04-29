import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

try:
    import numpy as np
    from PIL import Image
except Exception:
    np = None
    Image = None

try:
    import tensorflow as tf
except Exception:
    tf = None

MODEL_CANDIDATES = [
    Path(__file__).resolve().parents[1] / "model_artifacts" / "cnn_ultrasound_model.keras",
    Path(__file__).resolve().parents[1] / "model_artifacts" / "cnn_ultrasound_model.h5",
    Path(__file__).resolve().parents[1] / "model_artifacts" / "best_liver_cnn.h5",
]
METADATA_PATH = Path(__file__).resolve().parents[1] / "model_artifacts" / "cnn_ultrasound_metadata.json"

CLASS_NAMES = ["Healthy", "Liver Disease"]
IMAGE_SIZE = (224, 224)


def find_model_path():
    for path in MODEL_CANDIDATES:
        if path.exists():
            return path
    return None


def status():
    model_path = find_model_path()
    metadata = {}
    if METADATA_PATH.exists():
        try:
            metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        except Exception:
            metadata = {}
    return {
        "tensorflowAvailable": tf is not None,
        "pillowAvailable": Image is not None,
        "numpyAvailable": np is not None,
        "modelArtifactFound": model_path is not None,
        "modelPath": str(model_path) if model_path else None,
        "metadata": metadata,
        "ready": tf is not None and Image is not None and np is not None and model_path is not None,
        "message": (
            "CNN image analysis ready"
            if tf is not None and Image is not None and np is not None and model_path is not None
            else "Add a trained ultrasound CNN artifact (.keras or .h5) to server/model_artifacts and install tensorflow to enable image analysis."
        ),
    }


def load_model():
    model_path = find_model_path()
    if tf is None or model_path is None:
        raise RuntimeError(status()["message"])
    return tf.keras.models.load_model(model_path)


def preprocess_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMAGE_SIZE)
    arr = np.asarray(image).astype("float32") / 255.0
    return np.expand_dims(arr, axis=0)


def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        output = getattr(layer, "output", None)
        shape = getattr(output, "shape", None)
        if "Conv" in layer.__class__.__name__ and shape is not None and len(shape) == 4:
            return layer.name
    return None


def make_gradcam_heatmap(model, img_array):
    layer_name = find_last_conv_layer(model)
    if layer_name is None or tf is None:
        return None

    grad_model = tf.keras.models.Model(
        [model.inputs], [model.get_layer(layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        class_index = tf.argmax(predictions[0])
        class_channel = predictions[:, class_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)
    max_value = tf.math.reduce_max(heatmap)
    if float(max_value.numpy()) > 0:
        heatmap = heatmap / max_value

    # Keep the payload small enough for browser clients while preserving
    # enough structure for future overlays.
    heatmap = tf.image.resize(heatmap[..., tf.newaxis], (28, 28), method="bilinear")
    heatmap = tf.squeeze(heatmap, axis=-1)
    return np.round(heatmap.numpy(), 4).tolist()


def predict(image_path):
    model = load_model()
    img_array = preprocess_image(image_path)
    probs = model.predict(img_array, verbose=0)[0]

    if len(probs.shape) == 0:
        probs = np.array([1 - float(probs), float(probs)])
    if len(probs) == 1:
        probs = np.array([1 - float(probs[0]), float(probs[0])])

    pred_index = int(np.argmax(probs))
    heatmap = make_gradcam_heatmap(model, img_array)

    return {
        "label": CLASS_NAMES[pred_index] if pred_index < len(CLASS_NAMES) else str(pred_index),
        "probabilities": [
            {"label": CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else str(idx), "value": float(value)}
            for idx, value in enumerate(probs.tolist())
        ],
        "confidence": float(np.max(probs) * 100),
        "gradcam": heatmap,
        "imageSize": {"width": IMAGE_SIZE[0], "height": IMAGE_SIZE[1]},
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["status", "predict"], default="status")
    parser.add_argument("--image", default="")
    args = parser.parse_args()

    if args.mode == "status":
        print(json.dumps(status()))
        return

    print(json.dumps(predict(args.image)))


if __name__ == "__main__":
    main()
