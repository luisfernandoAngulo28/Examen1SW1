"""
AI Microservice — Sistema de Gestión de Políticas de Flujo de Trabajo
Framework: FastAPI (Python 3.11)
Rol: Microservicio de Inteligencia Artificial que expone endpoints de NLP,
     interpretación de comandos de diseño y síntesis de voz.
     El núcleo del sistema (workflow engine) vive en Spring Boot;
     este servicio se enfoca exclusivamente en capacidades de IA.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import prompt_router, nlp_router, tts_router, report_router

app = FastAPI(
    title="Workflow AI Service",
    description=(
        "Microservicio de Inteligencia Artificial para el Sistema de Gestión de "
        "Políticas de Flujo de Trabajo. Implementado con Python 3.11 y FastAPI.\n\n"
        "**Capacidades:**\n"
        "- Interpretación de comandos de diseño en lenguaje natural (español/inglés)\n"
        "- Llenado de formularios por dictado de voz mediante NLP\n"
        "- Síntesis de voz con ElevenLabs (con fallback a browser TTS)\n"
        "- Procesamiento de texto extraído por OCR para generar nodos de diagrama"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompt_router.router, tags=["Workflow AI — Prompts"])
app.include_router(nlp_router.router, prefix="/nlp", tags=["NLP — Form Filler & Policy Assignment"])
app.include_router(tts_router.router, tags=["Text-to-Speech"])
app.include_router(report_router.router, prefix="/reports", tags=["Reports — NL Query Parser"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Endpoint de salud — usado por Docker healthcheck y el gateway Spring Boot."""
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0",
        "framework": "FastAPI",
        "language": "Python 3.11",
    }
