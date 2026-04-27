"""
Router: Workflow AI Prompts
Endpoints:
  POST /prompt  — interpreta un comando de diseño en texto libre
  POST /image   — procesa texto extraído por OCR (Tesseract) como comando de diseño
"""
from fastapi import APIRouter
from pydantic import BaseModel

from app.services import intent_service

router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str = ""


class ImageRequest(BaseModel):
    extractedText: str = ""


@router.post("/prompt", summary="Interpretar comando de diseño en lenguaje natural")
async def handle_prompt(req: PromptRequest) -> dict:
    """
    Recibe un prompt en español/inglés y retorna la acción correspondiente
    para el editor de políticas (add_node, remove_node, connect_nodes, suggest_flow).
    """
    return intent_service.process_intent(req.prompt)


@router.post("/image", summary="Procesar texto OCR como comando de diseño")
async def handle_image(req: ImageRequest) -> dict:
    """
    Recibe texto extraído de una imagen (OCR / Tesseract.js) y lo interpreta
    como un comando de diseño de flujo de trabajo.
    """
    return intent_service.process_intent(req.extractedText)
