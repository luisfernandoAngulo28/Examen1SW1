"""
Detector de Anomalías en Flujos — TensorFlow Autoencoder (Mejora 5)

Usa un autoencoder para detectar trámites con patrones inusuales.
El error de reconstrucción alto indica comportamiento anómalo.

Features (4 dimensiones por trámite):
  [0] duration_ratio    — duración_actual / duración_promedio_histórica
  [1] task_skip_ratio   — tareas saltadas / total esperado
  [2] reassign_count    — número de reasignaciones (normalizado)
  [3] event_density     — eventos por hora (normalizado)
"""
from __future__ import annotations

import numpy as np

_model = None
_threshold = 0.05
_scaler = None


def _build_and_train():
    import tensorflow as tf
    from sklearn.preprocessing import MinMaxScaler

    rng = np.random.default_rng(99)
    N = 2000

    # Datos "normales"
    duration_ratio  = rng.normal(1.0, 0.2, N).clip(0.3, 2.5)
    task_skip_ratio = rng.beta(1, 10, N)
    reassign_count  = rng.exponential(0.1, N).clip(0, 1)
    event_density   = rng.normal(0.5, 0.1, N).clip(0, 1)

    X_normal = np.column_stack([duration_ratio, task_skip_ratio, reassign_count, event_density])

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_normal)

    # Autoencoder: encode 4→8→2 → decode 2→8→4
    inputs = tf.keras.Input(shape=(4,))
    encoded = tf.keras.layers.Dense(8, activation="relu")(inputs)
    bottleneck = tf.keras.layers.Dense(2, activation="relu")(encoded)
    decoded = tf.keras.layers.Dense(8, activation="relu")(bottleneck)
    outputs = tf.keras.layers.Dense(4, activation="sigmoid")(decoded)

    autoencoder = tf.keras.Model(inputs, outputs, name="anomaly_autoencoder")
    autoencoder.compile(optimizer="adam", loss="mse")
    autoencoder.fit(X_scaled, X_scaled, epochs=30, batch_size=64, verbose=0, validation_split=0.1)

    # Umbral = percentil 95 del error de reconstrucción en datos normales
    reconstructed = autoencoder.predict(X_scaled, verbose=0)
    errors = np.mean(np.square(X_scaled - reconstructed), axis=1)
    threshold = float(np.percentile(errors, 95))

    return autoencoder, scaler, threshold


def get_model():
    global _model, _scaler, _threshold
    if _model is None:
        _model, _scaler, _threshold = _build_and_train()
    return _model, _scaler, _threshold


def predict(features: list[dict]) -> list[dict]:
    """
    Returns list of {is_anomaly: bool, score: float, reconstruction_error: float}
    """
    model, scaler, threshold = get_model()
    X = np.array([[
        f.get("duration_ratio", 1.0),
        f.get("task_skip_ratio", 0.0),
        f.get("reassign_count", 0.0),
        f.get("event_density", 0.5),
    ] for f in features], dtype=float)

    X_scaled = scaler.transform(X.clip(0, None))
    reconstructed = model.predict(X_scaled, verbose=0)
    errors = np.mean(np.square(X_scaled - reconstructed), axis=1)

    results = []
    for err in errors:
        anomaly_score = min(float(err) / max(threshold, 1e-9), 2.0)
        results.append({
            "is_anomaly": float(err) > threshold,
            "score": round(anomaly_score, 3),
            "reconstruction_error": round(float(err), 4),
        })
    return results
