"""
NLP Form Filler — extrae valores estructurados de formularios a partir de
transcripciones de voz en español libre.

Flujo:
  1. Si GROQ_API_KEY está configurado → delega a Groq llama-3.1-8b-instant (máxima precisión).
  2. Si no → motor de reglas local basado en:
       a) Anclaje por etiqueta del campo (label-anchor extraction)
       b) Sinónimos semánticos por tipo de campo
       c) Patrones regex específicos por tipo (fechas, números, emails, teléfonos)
       d) Inferencia posicional como último recurso

Respuesta: {"values": {"campo": "valor"}, "confidence": {"campo": 0.0–1.0}}
"""
from __future__ import annotations

import os
import re
from datetime import date, timedelta
from typing import Any

# Carga diferida del modelo spaCy
_nlp = None

def _get_spacy():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("es_core_news_lg")
        except Exception:
            _nlp = False
    return _nlp if _nlp else None


# ─────────────────────────────────────────── tablas de referencia ─────────────

MONTHS_ES: dict[str, str] = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
    "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
    "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
    "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
    "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}

# Palabras clave que activan la extracción de un tipo específico de campo
LABEL_TRIGGERS: dict[str, list[str]] = {
    "nombre": ["me llamo", "soy", "mi nombre es", "llamado", "llámame"],
    "apellido": ["mi apellido es", "me apellido"],
    "email": ["correo es", "email es", "correo electrónico", "mi correo"],
    "teléfono": ["teléfono es", "cel es", "celular es", "número es", "mi número"],
    "fecha": ["fecha es", "el día", "para el", "hoy es", "fecha de hoy"],
    "monto": ["monto es", "por valor de", "cuesta", "costo es", "precio es",
              "total es", "son", "suma de", "vale", "importe"],
    "cantidad": ["cantidad es", "número de", "hay", "son"],
    "descripción": ["descripción es", "se trata de", "para", "el motivo es"],
    "departamento": ["departamento es", "área es", "sección es", "trabajo en",
                     "pertenezco a", "mi área"],
    "motivo": ["motivo es", "razón es", "porque", "dado que"],
    "cargo": ["cargo es", "puesto es", "mi puesto", "trabajo como", "soy"],
    "empresa": ["empresa es", "compañía es", "trabajo en", "organización"],
}


# ──────────────────────────────────────────────── clase principal ──────────────

class NlpFormService:
    """Servicio de llenado de formularios por NLP."""

    def fill_from_transcript(
        self, transcript: str, fields: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Extrae valores de todos los campos del formulario a partir de la transcripción.

        Args:
            transcript: texto libre dictado por el funcionario
            fields:     lista de campos [{name, label, type, required, options?}]
        Returns:
            {"values": {name: value}, "confidence": {name: 0.0–1.0}}
        """
        # Intentar con OpenAI si la clave está disponible
        openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        if openai_key:
            try:
                result = self._fill_with_openai(transcript, fields, openai_key)
                if result:
                    return result
            except Exception:
                pass  # degradar al motor de reglas

        # Deep Learning path: spaCy NER
        nlp = _get_spacy()
        result = self._fill_rule_based(transcript, fields)
        if nlp is not None:
            result = self._enhance_with_spacy(result, transcript, fields, nlp)
        return result

    # ────────────────────────────────────────────── camino OpenAI ─────────────

    def _fill_with_openai(
        self, transcript: str, fields: list[dict], api_key: str
    ) -> dict | None:
        try:
            import openai  # importación diferida para no romper si no está instalado

            schema_desc = "\n".join(
                f"- {f['name']} ({f.get('label', f['name'])}): tipo {f.get('type', 'text')}"
                + (f", opciones: {f['options']}" if f.get("options") else "")
                for f in fields
            )
            prompt = (
                "Extrae los valores del siguiente formulario a partir de la "
                "transcripción de voz en español.\n\n"
                f"Campos del formulario:\n{schema_desc}\n\n"
                f'Transcripción: "{transcript}"\n\n'
                "Responde SOLO con un JSON con estructura: "
                '{"values": {"campo": "valor"}, "confidence": {"campo": 0.0}}\n'
                "Para campos no encontrados usa cadena vacía. "
                "Para fechas usa formato YYYY-MM-DD."
            )

            groq_key = os.getenv("GROQ_API_KEY", "").strip()
            if groq_key:
                client = openai.OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
                model = "llama-3.1-8b-instant"
            else:
                client = openai.OpenAI(api_key=api_key)
                model = "gpt-4o-mini"
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            import json

            return json.loads(resp.choices[0].message.content)
        except Exception:
            return None

    # ──────────────────────────────────────────── motor de reglas ─────────────

    def _fill_rule_based(
        self, transcript: str, fields: list[dict]
    ) -> dict[str, Any]:
        text = transcript.lower().strip()
        values: dict[str, str] = {}
        confidence: dict[str, float] = {}

        for field in fields:
            name = field.get("name", "")
            label = field.get("label", "").lower()
            ftype = field.get("type", "text")
            options = field.get("options") or []

            value, conf = self._extract_value(text, label, ftype, options, transcript)
            values[name] = value
            confidence[name] = round(conf, 2)

        return {"values": values, "confidence": confidence}

    def _extract_value(
        self,
        text: str,
        label: str,
        ftype: str,
        options: list,
        original: str,
    ) -> tuple[str, float]:
        # 1. Patrones fuertes por tipo
        if ftype == "date":
            v = self._extract_date(text)
            if v:
                return v, 0.90

        if ftype == "number":
            v = self._extract_number_near_label(text, label)
            if v:
                return v, 0.85

        if ftype == "select" and options:
            v = self._match_option(text, options)
            if v:
                return v, 0.95

        # 2. Anclaje por etiqueta del campo
        v, conf = self._label_anchor_extract(text, label, ftype, original)
        if v:
            return v, conf

        # 3. Sinónimos semánticos
        for keyword, triggers in LABEL_TRIGGERS.items():
            if keyword in label:
                for trigger in triggers:
                    if trigger in text:
                        v = self._extract_after(text, trigger, ftype)
                        if v:
                            return self._recover_case(original, v), 0.70

        # 4. Patrones genéricos de último recurso
        if ftype == "number":
            v = self._extract_any_number(text)
            if v:
                return v, 0.45
        if ftype == "date":
            v = self._extract_date(text)
            if v:
                return v, 0.50

        return "", 0.0

    # ────────────────────────────────── anclaje por etiqueta ──────────────────

    def _label_anchor_extract(
        self, text: str, label: str, ftype: str, original: str
    ) -> tuple[str, float]:
        """Busca palabras de la etiqueta en el texto y extrae el valor adyacente."""
        label_words = label.split()
        candidates = [label] + [w for w in label_words if len(w) > 3]

        for candidate in candidates:
            idx = text.find(candidate)
            if idx == -1:
                continue
            after = text[idx + len(candidate):].strip()
            # Quitar conectores/artículos iniciales
            after = re.sub(r"^(?:es|son|fue|será|de|del|la|el|:|\s)+", "", after).strip()
            value = self._cut_to_boundary(after, ftype)
            if value:
                return self._recover_case(original, value), 0.80

        return "", 0.0

    def _cut_to_boundary(self, text: str, ftype: str) -> str:
        """Corta el texto en el primer límite natural de campo."""
        # Separadores: puntuación, conjunciones de campo siguiente
        parts = re.split(r"[,;.]|(?:\s+y\s+(?:el|la|mi|su)\s+)", text)
        if not parts:
            return ""
        raw = parts[0].strip()

        if ftype in ("text", "select"):
            return " ".join(raw.split()[:6]).strip()
        if ftype == "textarea":
            return " ".join(raw.split()[:25]).strip()
        if ftype == "number":
            m = re.search(r"[\d,.]+", raw)
            return m.group().replace(",", ".") if m else ""
        return raw.strip()

    # ───────────────────────────────────── recuperación de mayúsculas ──────────

    def _recover_case(self, original: str, lower_value: str) -> str:
        """Recupera la capitalización original de la transcripción."""
        idx = original.lower().find(lower_value)
        if idx >= 0:
            return original[idx : idx + len(lower_value)].strip()
        # Capitalizar como nombre propio si no encontró coincidencia exacta
        return lower_value.title()

    # ────────────────────────────────────────────── tipos específicos ─────────

    def _extract_date(self, text: str) -> str:
        today = date.today()

        # Fechas relativas
        if "hoy" in text:
            return str(today)
        if "ayer" in text:
            return str(today - timedelta(days=1))
        if "mañana" in text:
            return str(today + timedelta(days=1))

        # DD/MM/YYYY · DD-MM-YYYY · DD.MM.YYYY
        m = re.search(r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b", text)
        if m:
            d, mo, y = m.group(1), m.group(2), m.group(3)
            if len(y) == 2:
                y = "20" + y
            return f"{y}-{mo.zfill(2)}-{d.zfill(2)}"

        # DD de Mes [de] YYYY
        m = re.search(
            r"\b(\d{1,2})\s+de\s+(\w+)\s+(?:de\s+)?(\d{4})\b", text
        )
        if m:
            d, mes, y = m.group(1), m.group(2), m.group(3)
            mo = MONTHS_ES.get(mes)
            if mo:
                return f"{y}-{mo}-{d.zfill(2)}"

        # Mes YYYY
        m = re.search(r"\b(\w+)\s+(?:de\s+)?(\d{4})\b", text)
        if m:
            mes, y = m.group(1), m.group(2)
            mo = MONTHS_ES.get(mes)
            if mo:
                return f"{y}-{mo}-01"

        return ""

    def _extract_number_near_label(self, text: str, label: str) -> str:
        """Busca un número cerca de las palabras clave del campo."""
        for word in label.split():
            if len(word) < 3:
                continue
            m = re.search(
                rf"{re.escape(word)}.{{0,40}}?([\d][\d.,]*)\b", text
            )
            if m:
                return m.group(1).replace(",", ".")

        # Palabras de contexto monetario/cantidad
        for kw in [
            "son", "es", "total", "monto", "suma", "precio",
            "costo", "valor", "importe", "cantidad",
        ]:
            m = re.search(
                rf"\b{kw}\b.{{0,20}}?(?:\$|bs\.?|s\/\.?)?\s*([\d][\d.,]*)",
                text,
            )
            if m:
                return m.group(1).replace(",", ".")
        return ""

    def _extract_any_number(self, text: str) -> str:
        m = re.search(r"(?:\$|bs\.?)\s*([\d][\d.,]*)", text)
        if m:
            return m.group(1).replace(",", ".")
        m = re.search(r"\b(\d[\d.,]{0,10})\b", text)
        if m:
            return m.group(1).replace(",", ".")
        return ""

    def _match_option(self, text: str, options: list) -> str:
        """Encuentra la opción más cercana en el texto."""
        for opt in options:
            if opt.lower() in text:
                return opt
        # Coincidencia parcial por palabras significativas
        for opt in options:
            opt_words = [w for w in opt.lower().split() if len(w) > 3]
            if any(w in text for w in opt_words):
                return opt
        return ""

    def _extract_after(self, text: str, keyword: str, ftype: str) -> str:
        idx = text.find(keyword)
        if idx == -1:
            return ""
        after = text[idx + len(keyword):].strip()
        after = re.sub(r"^(?:es|son|fue|será|de|:|\s)+", "", after).strip()
        return self._cut_to_boundary(after, ftype)

    # ─────────────────────────── spaCy NER enhancement ────────────────────────

    def _enhance_with_spacy(
        self, result: dict, transcript: str, fields: list[dict], nlp: Any
    ) -> dict:
        """Usa spaCy NER (es_core_news_lg) para rellenar campos que el motor de reglas dejó vacíos."""
        try:
            doc = nlp(transcript)
            ner_map: dict[str, list[str]] = {}
            for ent in doc.ents:
                ner_map.setdefault(ent.label_, []).append(ent.text)

            values = result.get("values", {})
            confidence = result.get("confidence", {})

            for field in fields:
                name = field.get("name", "")
                ftype = field.get("type", "text")
                if values.get(name):  # ya tiene valor del motor de reglas
                    continue

                # Mapeo de tipo de campo a etiquetas NER de spaCy en español
                if ftype in ("text",) and "nombre" in field.get("label", "").lower():
                    persons = ner_map.get("PER", [])
                    if persons:
                        values[name] = persons[0]
                        confidence[name] = 0.82

                elif ftype in ("text",) and any(
                    kw in field.get("label", "").lower()
                    for kw in ["organización", "empresa", "entidad", "institución"]
                ):
                    orgs = ner_map.get("ORG", [])
                    if orgs:
                        values[name] = orgs[0]
                        confidence[name] = 0.80

                elif ftype in ("text",) and any(
                    kw in field.get("label", "").lower()
                    for kw in ["lugar", "dirección", "ubicación", "ciudad"]
                ):
                    locs = ner_map.get("LOC", []) + ner_map.get("GPE", [])
                    if locs:
                        values[name] = locs[0]
                        confidence[name] = 0.78

                elif ftype == "date":
                    dates = ner_map.get("DATE", [])
                    if dates:
                        values[name] = dates[0]
                        confidence[name] = 0.75

            return {"values": values, "confidence": confidence}
        except Exception:
            return result


# Singleton del servicio
_service = NlpFormService()


def fill_form(transcript: str, fields: list[dict]) -> dict[str, Any]:
    """Función pública de acceso al servicio."""
    return _service.fill_from_transcript(transcript, fields)
