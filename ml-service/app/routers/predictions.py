"""
Router: ML Predictions
  POST /predict/delay-risk  — predicción de riesgo de demora por trámite
  POST /predict/priority    — recomendación de prioridad de tareas
  POST /predict/anomalies   — detección de anomalías en trámites
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models import delay_risk, priority_scorer, anomaly_detector

router = APIRouter()


# ── Delay Risk ────────────────────────────────────────────────────────────────

class DelayRiskFeature(BaseModel):
    case_id: str
    hours_elapsed: float = 0
    pending_task_ratio: float = 0
    dept_load_ratio: float = 0
    task_complexity: float = 0
    sla_ratio: float = 0


class DelayRiskResult(BaseModel):
    case_id: str
    risk_score: float
    risk_level: str      # LOW | MEDIUM | HIGH
    recommendation: str


@router.post("/delay-risk", summary="Predicción de riesgo de demora (TF Keras)")
async def predict_delay_risk(
    features: list[DelayRiskFeature]
) -> list[DelayRiskResult]:
    if not features:
        return []
    scores = delay_risk.predict([f.model_dump() for f in features])
    results = []
    for feat, score in zip(features, scores):
        if score < 0.35:
            level, rec = "LOW", "El trámite avanza dentro de los plazos esperados."
        elif score < 0.65:
            level = "MEDIUM"
            rec = "Monitorear: el trámite muestra señales de posible demora."
        else:
            level = "HIGH"
            rec = "Intervención recomendada: alto riesgo de incumplimiento de plazo."
        results.append(DelayRiskResult(
            case_id=feat.case_id,
            risk_score=round(score, 3),
            risk_level=level,
            recommendation=rec,
        ))
    return results


# ── Priority Scorer ───────────────────────────────────────────────────────────

class PriorityFeature(BaseModel):
    task_id: str
    task_title: str = ""
    department: str = ""
    hours_waiting: float = 0
    sla_breach: float = 0
    case_risk: float = 0
    dept_overload: float = 0
    client_case: float = 0
    is_blocking: float = 0


class PriorityResult(BaseModel):
    task_id: str
    task_title: str
    department: str
    priority_score: float
    priority_label: str   # CRITICAL | HIGH | NORMAL | LOW


@router.post("/priority", summary="Recomendación de prioridad de tareas (TF Keras)")
async def predict_priority(
    features: list[PriorityFeature]
) -> list[PriorityResult]:
    if not features:
        return []
    scores = priority_scorer.predict([f.model_dump() for f in features])
    results = []
    for feat, score in zip(features, scores):
        if score >= 75:
            label = "CRITICAL"
        elif score >= 50:
            label = "HIGH"
        elif score >= 25:
            label = "NORMAL"
        else:
            label = "LOW"
        results.append(PriorityResult(
            task_id=feat.task_id,
            task_title=feat.task_title,
            department=feat.department,
            priority_score=round(score, 1),
            priority_label=label,
        ))
    # Sort descending by score
    return sorted(results, key=lambda r: r.priority_score, reverse=True)


# ── Anomaly Detection ─────────────────────────────────────────────────────────

class AnomalyFeature(BaseModel):
    case_id: str
    policy_name: str = ""
    duration_ratio: float = 1.0
    task_skip_ratio: float = 0.0
    reassign_count: float = 0.0
    event_density: float = 0.5


class AnomalyResult(BaseModel):
    case_id: str
    policy_name: str
    is_anomaly: bool
    score: float
    reconstruction_error: float
    description: str


@router.post("/anomalies", summary="Detección de anomalías en flujos (TF Autoencoder)")
async def detect_anomalies(
    features: list[AnomalyFeature]
) -> list[AnomalyResult]:
    if not features:
        return []
    detections = anomaly_detector.predict([f.model_dump() for f in features])
    results = []
    for feat, det in zip(features, detections):
        if det["is_anomaly"]:
            score = det["score"]
            if score > 1.5:
                desc = "Comportamiento muy atípico: patrón de ejecución fuera del rango normal histórico."
            else:
                desc = "Desviación moderada del patrón esperado. Revisar el progreso del trámite."
        else:
            desc = "Flujo dentro de los parámetros normales de ejecución."
        results.append(AnomalyResult(
            case_id=feat.case_id,
            policy_name=feat.policy_name,
            is_anomaly=det["is_anomaly"],
            score=det["score"],
            reconstruction_error=det["reconstruction_error"],
            description=desc,
        ))
    return sorted(results, key=lambda r: r.score, reverse=True)
