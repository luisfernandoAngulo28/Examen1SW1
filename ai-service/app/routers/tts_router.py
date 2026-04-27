"""
Router: Text-to-Speech
Endpoint:
  POST /tts — sintetiza texto usando ElevenLabs (si hay API key) o 204 para fallback browser TTS
"""
import os

import httpx
from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()

_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel (multilingual)
_ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{_ELEVENLABS_VOICE_ID}"


class TtsRequest(BaseModel):
    text: str


@router.post("/tts", summary="Síntesis de voz (ElevenLabs / browser fallback)")
async def tts(req: TtsRequest) -> Response:
    """
    Si ELEVENLABS_API_KEY está configurado, retorna el audio MP3 generado por ElevenLabs.
    Si no está configurado o falla, retorna 204 — el frontend usa window.speechSynthesis.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        return Response(status_code=204)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                _ELEVENLABS_URL,
                headers={
                    "xi-api-key": api_key,
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                },
                json={"text": req.text, "model_id": "eleven_multilingual_v2"},
            )
        if resp.status_code != 200:
            return Response(status_code=204)
        return Response(content=resp.content, media_type="audio/mpeg")
    except Exception:
        return Response(status_code=204)
