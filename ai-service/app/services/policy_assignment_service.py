"""
Policy Assignment Service — IA para asignación automática de política de negocio.

Flujo:
  1. Cliente describe su situación por voz (transcripción en texto).
  2. Se compara contra las políticas disponibles usando similitud semántica.
  3. Se retorna la política más apropiada con nivel de confianza.

Estrategia:
  - Si OPENAI_API_KEY disponible → delega a GPT-4o-mini para máxima precisión.
  - Si spaCy es_core_news_lg disponible → similitud vectorial con embeddings de la lengua.
  - Si no → motor de reglas local basado en palabras clave extraídas del nombre.
"""
from __future__ import annotations

import os
import re
from typing import Any

# Carga diferida del modelo spaCy para no ralentizar el arranque
_nlp = None

def _get_spacy():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("es_core_news_lg")
        except Exception:
            _nlp = False  # marca que no está disponible
    return _nlp if _nlp else None


class PolicyAssignmentService:

    def assign(self, transcript: str, policies: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Determina la política más apropiada para el cliente dado su descripción.

        Args:
            transcript: texto libre dictado por el cliente describiendo su situación
            policies:   lista de dicts [{id, name, nodeCount?, keywords?}]

        Returns:
            {
              "policyId": str,
              "policyName": str,
              "confidence": float (0.0–1.0),
              "explanation": str
            }
        """
        if not policies:
            return {"policyId": None, "policyName": None, "confidence": 0.0,
                    "explanation": "No hay políticas disponibles."}

        openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        if openai_key:
            result = self._assign_with_openai(transcript, policies, openai_key)
            if result:
                return result

        # Deep Learning path: spaCy vector similarity (es_core_news_lg)
        nlp = _get_spacy()
        if nlp is not None:
            result = self._assign_with_spacy(transcript, policies, nlp)
            if result:
                return result

        return self._assign_rule_based(transcript, policies)

    # ──────────────────────────────────────── OpenAI path ─────────────────────

    def _assign_with_openai(
        self, transcript: str, policies: list[dict], api_key: str
    ) -> dict | None:
        try:
            import openai, json

            policy_list = "\n".join(
                f"- ID: {p['id']} | Nombre: {p['name']}"
                + (f" | Palabras clave: {p.get('keywords', '')}" if p.get("keywords") else "")
                for p in policies
            )
            prompt = (
                "Analiza la descripción del cliente y determina cuál política de negocio "
                "es la más apropiada para atender su solicitud.\n\n"
                f"Descripción del cliente:\n\"{transcript}\"\n\n"
                f"Políticas disponibles:\n{policy_list}\n\n"
                "Responde SOLO con un JSON:\n"
                '{"policyId": "<id>", "policyName": "<nombre>", '
                '"confidence": <0.0-1.0>, "explanation": "<razón breve en español>"}'
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

    # ──────────────────────────────────── spaCy vector path ──────────────────

    def _assign_with_spacy(
        self, transcript: str, policies: list[dict], nlp: Any
    ) -> dict | None:
        try:
            doc_transcript = nlp(transcript.lower())
            if not doc_transcript.has_vector:
                return None

            scores: list[tuple[float, dict]] = []
            for policy in policies:
                doc_policy = nlp(policy["name"].lower())
                similarity = doc_transcript.similarity(doc_policy) if doc_policy.has_vector else 0.0
                scores.append((similarity, policy))

            scores.sort(key=lambda x: x[0], reverse=True)
            best_score, best_policy = scores[0]

            if best_score < 0.30:
                return None  # baja confianza — dejar al motor de reglas

            level = "Alta" if best_score >= 0.75 else "Moderada" if best_score >= 0.50 else "Baja"
            return {
                "policyId": best_policy["id"],
                "policyName": best_policy["name"],
                "confidence": round(float(best_score), 2),
                "explanation": (
                    f"{level} similitud semántica con '{best_policy['name']}' "
                    f"usando modelo de lenguaje (spaCy es_core_news_lg). "
                    f"Confianza: {round(best_score * 100)}%."
                ),
            }
        except Exception:
            return None

    # ──────────────────────────────────────── Rule-based path ─────────────────

    def _assign_rule_based(
        self, transcript: str, policies: list[dict]
    ) -> dict[str, Any]:
        text = transcript.lower()
        # Tokenize transcript into significant words (len > 3)
        words = set(re.findall(r"\b[a-záéíóúñü]{4,}\b", text))

        scores: list[tuple[float, dict]] = []
        for policy in policies:
            name_words = set(re.findall(r"\b[a-záéíóúñü]{4,}\b", policy["name"].lower()))
            # Extra keywords sent from backend (node titles, etc.)
            kw_words = set(re.findall(
                r"\b[a-záéíóúñü]{4,}\b",
                policy.get("keywords", "").lower()
            ))
            all_policy_words = name_words | kw_words
            if not all_policy_words:
                scores.append((0.0, policy))
                continue
            hits = words & all_policy_words
            score = len(hits) / max(len(all_policy_words), 1)
            # Bonus: exact substring of policy name in transcript
            if policy["name"].lower() in text:
                score = min(score + 0.4, 1.0)
            scores.append((score, policy))

        scores.sort(key=lambda x: x[0], reverse=True)
        best_score, best_policy = scores[0]

        if best_score == 0.0:
            # Fallback: return first policy with low confidence
            best_policy = policies[0]
            return {
                "policyId": best_policy["id"],
                "policyName": best_policy["name"],
                "confidence": 0.30,
                "explanation": (
                    f"No se encontró coincidencia directa. Se sugiere '{best_policy['name']}' "
                    "como opción por defecto. Por favor verifica con un asesor."
                ),
            }

        explanation = (
            f"La política '{best_policy['name']}' coincide con tu descripción "
            f"(confianza {round(best_score * 100)}%). "
        )
        if best_score >= 0.7:
            explanation += "Alta coincidencia con los términos de tu solicitud."
        elif best_score >= 0.4:
            explanation += "Coincidencia moderada. Un asesor puede confirmar la asignación."
        else:
            explanation += "Coincidencia baja. Se recomienda revisión manual."

        return {
            "policyId": best_policy["id"],
            "policyName": best_policy["name"],
            "confidence": round(min(best_score, 1.0), 2),
            "explanation": explanation,
        }


_service = PolicyAssignmentService()


def assign_policy(transcript: str, policies: list[dict]) -> dict[str, Any]:
    return _service.assign(transcript, policies)
