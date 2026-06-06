"""
Report Query Parser — interpreta consultas en lenguaje natural y las convierte
en un ReportSpec estructurado que el backend Java puede ejecutar.

Tipos de reporte soportados:
  cases_by_date      — trámites en un rango de fechas
  cases_by_status    — trámites por estado (COMPLETED, IN_PROGRESS, CANCELLED)
  cases_by_policy    — trámites de una política específica
  tasks_by_dept      — tareas por departamento
  bottleneck_summary — resumen de cuellos de botella
  general_summary    — estadísticas generales del sistema
"""
from __future__ import annotations

import os
import re
from datetime import date, timedelta
from typing import Any


# ──────────────────────────────────────────── tablas de referencia ────────────

MONTHS_ES: dict[str, int] = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
    "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
    "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

STATUS_KEYWORDS: dict[str, str] = {
    "completado": "COMPLETED", "completados": "COMPLETED",
    "terminado": "COMPLETED", "terminados": "COMPLETED",
    "finalizado": "COMPLETED", "finalizados": "COMPLETED",
    "cerrado": "COMPLETED", "cerrados": "COMPLETED",
    "en progreso": "IN_PROGRESS", "en proceso": "IN_PROGRESS",
    "activo": "IN_PROGRESS", "activos": "IN_PROGRESS",
    "abierto": "OPEN", "abiertos": "OPEN",
    "cancelado": "CANCELLED", "cancelados": "CANCELLED",
    "anulado": "CANCELLED",
}


class ReportService:

    def parse(self, query: str) -> dict[str, Any]:
        """
        Parsea la query en lenguaje natural y retorna un ReportSpec.

        Returns:
          {
            "reportType": str,
            "title": str,
            "filters": {
              "fromDate": str|null,   # ISO date YYYY-MM-DD
              "toDate": str|null,
              "status": str|null,
              "policyName": str|null,
              "department": str|null,
            }
          }
        """
        # Intentar con OpenAI si está disponible
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if api_key:
            result = self._parse_with_openai(query, api_key)
            if result:
                return result

        return self._parse_rule_based(query)

    # ──────────────────────────────────────────── OpenAI ──────────────────────

    def _parse_with_openai(self, query: str, api_key: str) -> dict | None:
        try:
            import openai, json
            today = str(date.today())
            prompt = (
                f"Hoy es {today}. Analiza esta consulta de reporte en español:\n"
                f'"{query}"\n\n'
                "Extrae los parámetros y clasifica en uno de estos tipos:\n"
                "  cases_by_date, cases_by_status, cases_by_policy, "
                "tasks_by_dept, bottleneck_summary, general_summary\n\n"
                "Responde SOLO con JSON:\n"
                '{"reportType":"<tipo>","title":"<título descriptivo en español>",'
                '"filters":{"fromDate":"<YYYY-MM-DD o null>","toDate":"<YYYY-MM-DD o null>",'
                '"status":"<COMPLETED|IN_PROGRESS|CANCELLED|OPEN|null>",'
                '"policyName":"<nombre o null>","department":"<nombre o null>"}}'
            )
            client = openai.OpenAI(api_key=api_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            return json.loads(resp.choices[0].message.content)
        except Exception:
            return None

    # ──────────────────────────────────────────── Rule-based ──────────────────

    def _parse_rule_based(self, query: str) -> dict[str, Any]:
        text = query.lower().strip()
        filters: dict[str, Any] = {
            "fromDate": None, "toDate": None,
            "status": None, "policyName": None, "department": None,
        }

        # ── Fechas ────────────────────────────────────────────────────────────
        from_date, to_date = self._extract_date_range(text)
        filters["fromDate"] = from_date
        filters["toDate"] = to_date

        # ── Estado ────────────────────────────────────────────────────────────
        for kw, status in STATUS_KEYWORDS.items():
            if kw in text:
                filters["status"] = status
                break

        # ── Departamento ──────────────────────────────────────────────────────
        dept_match = re.search(
            r"departamento\s+(?:de\s+)?([a-záéíóúñü\s]{3,30})(?:\s|$|,|\.)", text
        )
        if dept_match:
            filters["department"] = dept_match.group(1).strip().title()

        # ── Política ──────────────────────────────────────────────────────────
        policy_match = re.search(
            r"política\s+(?:de\s+)?[\"']?([^\"',\.]{3,40})[\"']?(?:\s|$|,|\.)", text
        )
        if policy_match:
            filters["policyName"] = policy_match.group(1).strip().title()

        # ── Tipo de reporte ───────────────────────────────────────────────────
        report_type, title = self._classify(text, filters)

        return {"reportType": report_type, "title": title, "filters": filters}

    def _classify(
        self, text: str, filters: dict
    ) -> tuple[str, str]:
        has_date = filters["fromDate"] or filters["toDate"]
        has_status = filters["status"]
        has_dept = filters["department"]
        has_policy = filters["policyName"]

        bottleneck_kw = any(w in text for w in [
            "cuello", "bottleneck", "demora", "atraso", "retras", "bloqueo"
        ])
        dept_kw = any(w in text for w in [
            "departamento", "área", "sección", "por área"
        ])
        task_kw = any(w in text for w in ["tarea", "actividad", "pendiente"])

        if bottleneck_kw:
            return "bottleneck_summary", "Análisis de cuellos de botella"

        if task_kw and dept_kw:
            dept = filters.get("department", "todos los departamentos")
            return "tasks_by_dept", f"Tareas por departamento — {dept}"

        if has_policy:
            return "cases_by_policy", f"Trámites de la política '{filters['policyName']}'"

        if has_status and has_date:
            status_label = {
                "COMPLETED": "completados", "IN_PROGRESS": "en progreso",
                "CANCELLED": "cancelados", "OPEN": "abiertos",
            }.get(filters["status"], filters["status"])
            return "cases_by_date", f"Trámites {status_label} — período seleccionado"

        if has_date:
            return "cases_by_date", f"Trámites en el período seleccionado"

        if has_status:
            status_label = {
                "COMPLETED": "completados", "IN_PROGRESS": "en progreso",
                "CANCELLED": "cancelados", "OPEN": "abiertos",
            }.get(filters["status"], filters["status"])
            return "cases_by_status", f"Trámites {status_label}"

        if dept_kw or has_dept:
            return "tasks_by_dept", "Tareas por departamento"

        return "general_summary", "Resumen general del sistema"

    # ──────────────────────────────────────────── Date parsing ────────────────

    def _extract_date_range(self, text: str) -> tuple[str | None, str | None]:
        today = date.today()

        # "este mes" / "el mes pasado"
        if "este mes" in text:
            return str(today.replace(day=1)), str(today)
        if "mes pasado" in text:
            first_this = today.replace(day=1)
            last_prev = first_this - timedelta(days=1)
            return str(last_prev.replace(day=1)), str(last_prev)
        if "esta semana" in text:
            monday = today - timedelta(days=today.weekday())
            return str(monday), str(today)
        if "hoy" in text and "entre" not in text:
            return str(today), str(today)
        if "ayer" in text:
            yest = today - timedelta(days=1)
            return str(yest), str(yest)

        # "entre X y Y" / "del X al Y"
        range_match = re.search(
            r"(?:entre|del?)\s+(.+?)\s+(?:y|al?|hasta)\s+(.+?)(?:\s|$|,|\.)", text
        )
        if range_match:
            from_str = self._parse_date(range_match.group(1).strip(), today)
            to_str = self._parse_date(range_match.group(2).strip(), today)
            if from_str and to_str:
                return from_str, to_str
            if from_str:
                return from_str, str(today)

        # Single date mention
        single = self._parse_date(text, today)
        if single:
            return single, str(today)

        return None, None

    def _parse_date(self, text: str, today: date) -> str | None:
        # DD/MM/YYYY
        m = re.search(r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b", text)
        if m:
            d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if y < 100: y += 2000
            try:
                return str(date(y, mo, d))
            except ValueError:
                pass

        # DD de Mes [de] YYYY
        m = re.search(r"\b(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?", text)
        if m:
            d = int(m.group(1))
            mes = MONTHS_ES.get(m.group(2))
            y = int(m.group(3)) if m.group(3) else today.year
            if mes:
                try:
                    return str(date(y, mes, d))
                except ValueError:
                    pass

        # Month YYYY / Month only
        m = re.search(r"\b(\w+)(?:\s+de\s+|\s+)(\d{4})\b", text)
        if m:
            mes = MONTHS_ES.get(m.group(1))
            y = int(m.group(2))
            if mes:
                return str(date(y, mes, 1))

        # Just a month name → this year
        for name, num in MONTHS_ES.items():
            if name in text:
                return str(date(today.year, num, 1))

        return None


_service = ReportService()


def parse_report_query(query: str) -> dict[str, Any]:
    return _service.parse(query)
