"""
Modelo de Riesgo de Demora — TensorFlow Keras (Mejora 5)

Features de entrada (5 dimensiones):
  [0] hours_elapsed       — horas transcurridas desde inicio del trámite
  [1] pending_task_ratio  — pendientes / total tareas (0–1)
  [2] dept_load_ratio     — tareas pendientes del depto / total global (0–1)
  [3] task_complexity     — número de campos en el formulario (normalizado)
  [4] sla_ratio           — hours_elapsed / sla_hours esperado (>1 = ya venció)

Output: probabilidad de demora 0–1
  < 0.35  → Bajo riesgo
  0.35–0.65 → Riesgo medio
  > 0.65  → Alto riesgo
"""
from __future__ import annotations

import numpy as np

_model = None
_scaler = None


def _build_and_train() -> tuple:
    """Construye y entrena el modelo con datos sintéticos realistas."""
    import tensorflow as tf
    from sklearn.preprocessing import MinMaxScaler

    rng = np.random.default_rng(42)
    N = 2000

    # Generar datos sintéticos
    hours_elapsed      = rng.uniform(0, 240, N)          # 0–10 días
    pending_ratio      = rng.uniform(0, 1, N)
    dept_load          = rng.uniform(0, 1, N)
    complexity         = rng.uniform(0, 1, N)
    sla_ratio          = hours_elapsed / rng.uniform(24, 168, N)  # SLA 1–7 días

    X = np.column_stack([hours_elapsed, pending_ratio, dept_load, complexity, sla_ratio])

    # Etiqueta: alta demora si se supera SLA o hay muchas tareas pendientes acumuladas
    noise = rng.normal(0, 0.05, N)
    risk_score = (
        0.35 * (sla_ratio > 1).astype(float)
        + 0.30 * pending_ratio
        + 0.20 * dept_load
        + 0.15 * (hours_elapsed / 240)
        + noise
    ).clip(0, 1)
    y = (risk_score > 0.5).astype(float)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(5,)),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(1, activation="sigmoid"),
    ], name="delay_risk_model")

    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    model.fit(X_scaled, y, epochs=20, batch_size=64, verbose=0, validation_split=0.1)

    return model, scaler


_MODEL_PATH  = "/app/saved_models/delay_risk.keras"
_SCALER_PATH = "/app/saved_models/delay_risk_scaler.pkl"

def get_model():
    global _model, _scaler
    if _model is None:
        import os, pickle
        if os.path.exists(_MODEL_PATH) and os.path.exists(_SCALER_PATH):
            import tensorflow as tf
            _model = tf.keras.models.load_model(_MODEL_PATH)
            with open(_SCALER_PATH, "rb") as f:
                _scaler = pickle.load(f)
        else:
            _model, _scaler = _build_and_train()
            os.makedirs(os.path.dirname(_MODEL_PATH), exist_ok=True)
            _model.save(_MODEL_PATH)
            with open(_SCALER_PATH, "wb") as f:
                pickle.dump(_scaler, f)
    return _model, _scaler


def predict(features: list[dict]) -> list[float]:
    """
    features: lista de dicts con keys:
      hours_elapsed, pending_task_ratio, dept_load_ratio, task_complexity, sla_ratio
    """
    model, scaler = get_model()
    X = np.array([[
        f.get("hours_elapsed", 0),
        f.get("pending_task_ratio", 0),
        f.get("dept_load_ratio", 0),
        f.get("task_complexity", 0),
        f.get("sla_ratio", 0),
    ] for f in features], dtype=float)
    X_scaled = scaler.transform(X)
    return model.predict(X_scaled, verbose=0).flatten().tolist()
