"""
Router: Report Query Parser
Endpoint:
  POST /reports/parse — interpreta una consulta NL y retorna un ReportSpec
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services import report_service

router = APIRouter()


class ParseReportRequest(BaseModel):
    query: str = Field(..., description="Consulta en lenguaje natural en español")


class ReportFilters(BaseModel):
    fromDate: str | None = None
    toDate: str | None = None
    status: str | None = None
    policyName: str | None = None
    department: str | None = None


class ParseReportResponse(BaseModel):
    reportType: str
    title: str
    filters: ReportFilters


@router.post(
    "/parse",
    response_model=ParseReportResponse,
    summary="Interpretar consulta de reporte en lenguaje natural",
)
async def parse_report(req: ParseReportRequest) -> ParseReportResponse:
    """
    Recibe una consulta en español (texto libre o transcripción de voz) y retorna
    un ReportSpec estructurado que el backend Java puede ejecutar contra MongoDB.
    """
    result = report_service.parse_report_query(req.query)
    return ParseReportResponse(
        reportType=result["reportType"],
        title=result["title"],
        filters=ReportFilters(**result["filters"]),
    )
