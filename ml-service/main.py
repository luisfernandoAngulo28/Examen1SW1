"""
ML Service — Sistema de Predicciones con TensorFlow (Mejora 5 — Ciclo 2)
Framework: FastAPI + TensorFlow-CPU 2.17

Modelos:
  1. Delay Risk Model   — red densa, predice riesgo de demora en trámites activos
  2. Priority Scorer    — regresor, recomienda orden de atención de tareas
  3. Anomaly Detector   — autoencoder, detecta flujos con comportamiento inusual

Los modelos se entrenan con datos sintéticos al arrancar el servicio (segundos).
"""
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.routers import predictions

app = FastAPI(
    title="FlowGov ML Service",
    description=(
        "Microservicio de Machine Learning para el Sistema de Gestión de Workflows.\n\n"
        "**Modelos TensorFlow:**\n"
        "- Predicción de riesgo de demora (red densa binaria)\n"
        "- Recomendación de prioridad de tareas (regresor)\n"
        "- Detección de anomalías (autoencoder)\n\n"
        "Los modelos se entrenan automáticamente al inicio con datos sintéticos."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(predictions.router, prefix="/predict", tags=["Predicciones ML"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "ml-service", "framework": "TensorFlow 2.17"}


@app.get("/model-info", tags=["Health"])
async def model_info():
    """Estado de los modelos — confirma que TF está cargado y entrenado."""
    try:
        from app.models.delay_risk import get_model as dr
        from app.models.priority_scorer import get_model as ps
        from app.models.anomaly_detector import get_model as ad
        m1, _ = dr()
        m2, _ = ps()
        m3, _, _ = ad()
        return {
            "delay_risk": {"name": m1.name, "params": m1.count_params()},
            "priority_scorer": {"name": m2.name, "params": m2.count_params()},
            "anomaly_detector": {"name": m3.name, "params": m3.count_params()},
        }
    except Exception as e:
        return {"error": str(e)}


def _warm_up():
    """Pre-entrena los modelos en background para que el primer request no tarde."""
    from app.models import delay_risk, priority_scorer, anomaly_detector
    delay_risk.get_model()
    priority_scorer.get_model()
    anomaly_detector.get_model()
    print("[ml-service] Todos los modelos TensorFlow entrenados y listos.")


@app.on_event("startup")
async def startup():
    thread = threading.Thread(target=_warm_up, daemon=True)
    thread.start()
