"""
Router: NLP endpoints
  POST /nlp/fill-form       — llenado de formulario desde transcripción de voz
  POST /nlp/assign-policy   — asignación automática de política por descripción de voz
"""
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services import nlp_form_service, policy_assignment_service

router = APIRouter()


class FormFieldSchema(BaseModel):
    name: str
    label: str
    type: str = "text"
    required: bool = False
    options: list[str] | None = None


class FillFormRequest(BaseModel):
    transcript: str = Field(..., description="Transcripción de voz en español libre")
    fields: list[dict[str, Any]] = Field(
        ..., description="Esquema de campos del formulario"
    )


class FillFormResponse(BaseModel):
    values: dict[str, str] = Field(
        description="Valores extraídos por campo (name → value)"
    )
    confidence: dict[str, float] = Field(
        description="Nivel de confianza por campo (0.0 – 1.0)"
    )


@router.post(
    "/fill-form",
    response_model=FillFormResponse,
    summary="Llenar formulario desde dictado de voz con NLP",
)
async def fill_form(req: FillFormRequest) -> FillFormResponse:
    """
    **Procesamiento de lenguaje natural para llenado de formularios por voz.**

    El funcionario dicta texto libre describiendo los datos requeridos.
    El modelo extrae los valores correspondientes a cada campo y reporta
    un nivel de confianza para que el usuario pueda revisar y corregir
    los datos interpretados incorrectamente.

    **Ejemplo de transcripción:**
    > "Me llamo Juan García, la solicitud es para el departamento de Finanzas,
    >  el monto total es 1500 bolivianos, para el día 15 de abril de 2026."

    **Campos de entrada:** [nombre, departamento, monto, fecha]
    **Resultado esperado:** {nombre: "Juan García", departamento: "Finanzas",
    monto: "1500", fecha: "2026-04-15"}
    """
    result = nlp_form_service.fill_form(req.transcript, req.fields)
    return FillFormResponse(
        values=result.get("values", {}),
        confidence=result.get("confidence", {}),
    )


# ── Policy Assignment ─────────────────────────────────────────────────────────

class PolicyInfo(BaseModel):
    id: str
    name: str
    keywords: str = ""


class AssignPolicyRequest(BaseModel):
    transcript: str = Field(..., description="Descripción de la situación del cliente en voz")
    policies: list[PolicyInfo] = Field(..., description="Lista de políticas disponibles")


class AssignPolicyResponse(BaseModel):
    policyId: str | None
    policyName: str | None
    confidence: float
    explanation: str


@router.post(
    "/assign-policy",
    response_model=AssignPolicyResponse,
    summary="Asignar política de negocio automáticamente desde descripción de voz",
)
async def assign_policy(req: AssignPolicyRequest) -> AssignPolicyResponse:
    """
    El cliente describe su situación por voz. El sistema analiza el texto
    y retorna la política de negocio más apropiada con un nivel de confianza.
    """
    policies_raw = [p.model_dump() for p in req.policies]
    result = policy_assignment_service.assign_policy(req.transcript, policies_raw)
    return AssignPolicyResponse(**result)
