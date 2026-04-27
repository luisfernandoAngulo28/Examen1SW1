"""
Router: NLP Form Filler
Endpoint:
  POST /nlp/fill-form — extrae valores de formulario desde transcripción de voz

Flujo de uso esperado:
  1. Funcionario dicta un párrafo libre describiendo los datos del formulario.
  2. El frontend captura la transcripción con SpeechRecognition.
  3. Envía la transcripción + esquema del formulario a este endpoint.
  4. El servicio retorna los campos prellenados con nivel de confianza.
  5. El funcionario revisa, corrige si es necesario y confirma.
"""
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services import nlp_form_service

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
