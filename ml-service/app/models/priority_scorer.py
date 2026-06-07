"""
Modelo de Recomendación de Prioridad — TensorFlow Keras (Mejora 5)

Ordena las tareas activas por urgencia usando un regresor neuronal.

Features (6 dimensiones):
  [0] hours_waiting    — horas que la tarea lleva en estado PENDING/IN_PROGRESS
  [1] sla_breach       — 1 si ya superó el SLA estimado del nodo
  [2] case_risk        — score de riesgo del trámite padre (0–1)
  [3] dept_overload    — ratio de carga del departamento (0–1)
  [4] client_case      — 1 si el trámite tiene un cliente asociado
  [5] is_blocking      — 1 si la tarea bloquea nodos paralelos (JOIN)

Output: priority_score 0–100
"""
from __future__ import annotations

import numpy as np

_model = None
_scaler = None


def _build_and_train():
    import tensorflow as tf
    from sklearn.preprocessing import MinMaxScaler

    rng = np.random.default_rng(7)
    N = 3000

    hours_waiting = rng.uniform(0, 120, N)
    sla_breach    = (hours_waiting > rng.uniform(8, 48, N)).astype(float)
    case_risk     = rng.uniform(0, 1, N)
    dept_overload = rng.uniform(0, 1, N)
    client_case   = rng.integers(0, 2, N).astype(float)
    is_blocking   = rng.integers(0, 2, N).astype(float)

    X = np.column_stack([hours_waiting, sla_breach, case_risk, dept_overload,
                         client_case, is_blocking])

    # Score ideal de prioridad
    noise = rng.normal(0, 3, N)
    priority = (
        30 * sla_breach
        + 20 * case_risk
        + 20 * (hours_waiting / 120)
        + 15 * dept_overload
        + 10 * client_case
        + 5  * is_blocking
        + noise
    ).clip(0, 100)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(6,)),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(1, activation="linear"),
    ], name="priority_model")

    model.compile(optimizer="adam", loss="mse")
    model.fit(X_scaled, priority, epochs=25, batch_size=64, verbose=0, validation_split=0.1)

    return model, scaler


_MODEL_PATH  = "/app/saved_models/priority_scorer.keras"
_SCALER_PATH = "/app/saved_models/priority_scorer_scaler.pkl"

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
    model, scaler = get_model()
    X = np.array([[
        f.get("hours_waiting", 0),
        f.get("sla_breach", 0),
        f.get("case_risk", 0),
        f.get("dept_overload", 0),
        f.get("client_case", 0),
        f.get("is_blocking", 0),
    ] for f in features], dtype=float)
    X_scaled = scaler.transform(X)
    scores = model.predict(X_scaled, verbose=0).flatten()
    return [float(max(0.0, min(100.0, s))) for s in scores]
