"""
Intent Service — interpreta comandos en lenguaje natural (español/inglés)
para diseño de diagramas de flujo de trabajo.

Intents soportados:
  add_node      → "Agrega actividad Revisión al departamento Legal"
  remove_node   → "Elimina la actividad Aprobación"
  connect_nodes → "Conecta Solicitud con Aprobación de forma condicional"
  suggest_flow  → "Crea un flujo para solicitud de vacaciones"
  info          → fallback con mensaje de ayuda
"""
from __future__ import annotations
import re
from typing import Any


# ─────────────────────────────────────────────────────── utilidades internas ──

def _has(text: str, *keywords: str) -> bool:
    return any(kw in text for kw in keywords)


def _cap(s: str) -> str:
    return s[0].upper() + s[1:] if s else s


def _detect_dept(prompt: str) -> str:
    if _has(prompt, "rrhh", "recursos humanos", "hr", "human resources", "personal"):
        return "Recursos Humanos"
    if _has(prompt, "finanz", "contabilidad", "presupuesto", "finance"):
        return "Finanzas"
    if _has(prompt, "legal", "jurídic", "contratos"):
        return "Legal"
    if _has(prompt, " ti ", "tecnolog", "sistemas", "tech", "informátic"):
        return "TI"
    if _has(prompt, "direcci", "gerencia", "management", "direction"):
        return "Dirección"
    if _has(prompt, "logísti", "almacén", "bodega", "logistics"):
        return "Logística"
    if _has(prompt, "calidad", "quality"):
        return "Calidad"
    if _has(prompt, "atención", "cliente", "customer", "servicio"):
        return "Atención al Cliente"
    return "Administración"


def _guess_title(prompt: str) -> str:
    for verb in [
        "agrega ", "añade ", "crea ", "add ", "agregar ", "añadir ",
        "crear ", "nueva actividad ", "nuevo nodo ",
    ]:
        idx = prompt.find(verb)
        if idx >= 0:
            rest = prompt[idx + len(verb):].strip()
            for prep in [" al departamento", " a departamento", " to the",
                         " to department", " en el", " en la", " en "]:
                cut = rest.find(prep)
                if cut > 0:
                    rest = rest[:cut].strip()
                    break
            if rest:
                return _cap(rest)
    return "Nueva Actividad"


def _extract_title(prompt: str, *verbs: str) -> str:
    for verb in verbs:
        idx = prompt.find(verb + " ")
        if idx >= 0:
            rest = prompt[idx + len(verb) + 1:].strip()
            for prep in [" del ", " de ", " from "]:
                cut = rest.find(prep)
                if cut > 0:
                    rest = rest[:cut].strip()
                    break
            if rest:
                return rest
    return ""


def _extract_topic(prompt: str) -> str:
    for kw in ["flujo para ", "proceso de ", "proceso completo de ", "workflow for "]:
        idx = prompt.find(kw)
        if idx >= 0:
            rest = prompt[idx + len(kw):].strip()
            return _cap(rest[:30])
    return "Trámite"


# ──────────────────────────────────────────────── plantillas de flujo ─────────

def _n(title: str, dept: str) -> dict:
    return {"title": title, "department": dept}


def _chain(nodes: list[dict]) -> list[dict]:
    return [
        {"from": nodes[i]["title"], "to": nodes[i + 1]["title"], "flowType": "SEQUENTIAL"}
        for i in range(len(nodes) - 1)
    ]


# Keyword-tuple → factory de nodos
_TEMPLATES: list[tuple[tuple[str, ...], list[dict]]] = [
    (
        ("vacacion", "permiso", "licencia", "leave", "tiempo libre"),
        [
            _n("Solicitud de Permiso", "Recursos Humanos"),
            _n("Verificación de Disponibilidad", "Recursos Humanos"),
            _n("Aprobación del Jefe", "Dirección"),
            _n("Notificación al Empleado", "Recursos Humanos"),
        ],
    ),
    (
        ("compra", "adquisici", "purchase", "procurement", "proveedor"),
        [
            _n("Solicitud de Compra", "Finanzas"),
            _n("Cotización de Proveedores", "Finanzas"),
            _n("Aprobación Presupuestaria", "Dirección"),
            _n("Orden de Compra", "Finanzas"),
            _n("Recepción de Mercancía", "Logística"),
        ],
    ),
    (
        ("reclamo", "queja", "complaint", "claim"),
        [
            _n("Recepción de Reclamo", "Atención al Cliente"),
            _n("Registro y Categorización", "Atención al Cliente"),
            _n("Investigación", "Calidad"),
            _n("Resolución", "Calidad"),
            _n("Comunicación al Cliente", "Atención al Cliente"),
        ],
    ),
    (
        ("contrat", "onboarding", "incorpora", "nuevo empleado"),
        [
            _n("Oferta Laboral", "Recursos Humanos"),
            _n("Firma de Contrato", "Legal"),
            _n("Inducción", "Recursos Humanos"),
            _n("Asignación de Equipo", "TI"),
            _n("Alta en Sistema", "TI"),
        ],
    ),
    (
        ("factura", "pago", "invoice", "payment"),
        [
            _n("Recepción de Factura", "Finanzas"),
            _n("Validación", "Finanzas"),
            _n("Aprobación", "Dirección"),
            _n("Pago", "Finanzas"),
        ],
    ),
    (
        ("auditoria", "auditoría", "audit", "revisión interna"),
        [
            _n("Planificación de Auditoría", "Dirección"),
            _n("Recolección de Evidencias", "Calidad"),
            _n("Análisis y Evaluación", "Calidad"),
            _n("Informe de Hallazgos", "Dirección"),
            _n("Plan de Mejora", "Administración"),
        ],
    ),
    (
        ("proyecto", "project", "iniciativa"),
        [
            _n("Definición de Alcance", "Dirección"),
            _n("Asignación de Recursos", "Administración"),
            _n("Ejecución", "Administración"),
            _n("Seguimiento y Control", "Dirección"),
            _n("Cierre del Proyecto", "Dirección"),
        ],
    ),
    (
        ("solicitud", "tramite", "trámite", "request", "process"),
        [
            _n("Recepción de Solicitud", "Administración"),
            _n("Revisión y Validación", "Administración"),
            _n("Aprobación", "Dirección"),
            _n("Notificación de Resolución", "Administración"),
        ],
    ),
]


# ─────────────────────────────────────────────── función pública principal ────

def process_intent(prompt: str) -> dict[str, Any]:
    """Punto de entrada: analiza el prompt y retorna la acción + datos para el editor."""
    p = prompt.lower().strip()

    # 1. Eliminar nodo
    if _has(p, "elimina", "eliminar", "quita", "quitar", "borra", "borrar", "remove", "delete"):
        title = _extract_title(p, "elimina", "quita", "borra", "remove", "delete",
                               "la actividad", "el nodo")
        title = _cap(title) if title else "Actividad"
        return {
            "action": "remove_node",
            "suggestion": f'Eliminaré la actividad "{title}" del diagrama.',
            "nodes": [{"title": title, "department": ""}],
            "connections": [],
        }

    # 2. Conectar nodos
    if _has(p, "conect", "enlaz", "lig", "link", "uni", "une "):
        return _connect_intent(p)

    # 3. Sugerir flujo completo
    if _has(p, "crea un flujo", "generar flujo", "diseña un flujo", "flujo para",
            "proceso de", "proceso completo", "suggest flow", "create flow", "workflow for"):
        return _suggest_flow(p)

    # 4. Agregar nodo individual
    if _has(p, "agrega", "agregar", "añade", "añadir", "crea", "crear",
            "add", "new node", "nuevo nodo", "nueva actividad"):
        return _add_node_intent(p)

    # 5. Fallback informativo
    return _help_reply(p)


# ──────────────────────────────────────────────────────── handlers internos ───

def _add_node_intent(prompt: str) -> dict:
    dept = _detect_dept(prompt)
    title = _guess_title(prompt)
    return {
        "action": "add_node",
        "suggestion": f'Agregué la actividad "{title}" al departamento {dept}.',
        "nodes": [{"title": title, "department": dept}],
        "connections": [],
    }


def _connect_intent(prompt: str) -> dict:
    flow_type = "SEQUENTIAL"
    flow_label = "secuencial"
    if _has(prompt, "condicional", "conditional", " si ", " if ", "alternativ", "decision"):
        flow_type, flow_label = "CONDITIONAL", "condicional"
    elif _has(prompt, "paralel", "parallel", "fork", "simultáneo", "simultaneo"):
        flow_type, flow_label = "PARALLEL", "paralelo"
    elif _has(prompt, "iterativ", "loop", "repite", "ciclo", "correcci"):
        flow_type, flow_label = "ITERATIVE", "iterativo"

    from_title = to_title = ""
    for sep in [" con ", " a ", " hacia ", " with ", " to "]:
        idx = prompt.find(sep)
        if idx > 0:
            before = prompt[:idx].strip()
            for verb in ["conecta ", "conect ", "enlaza ", "enlaz ", "une ", "link ", "liga ", "lig "]:
                if before.startswith(verb):
                    before = before[len(verb):].strip()
                    break
            after = prompt[idx + len(sep):].strip()
            for suffix in [" de forma ", " usando ", " con tipo ", " como ", " en modo ", " using "]:
                cut = after.find(suffix)
                if cut > 0:
                    after = after[:cut].strip()
                    break
            from_title = _cap(before.strip())
            to_title = _cap(after.strip())
            break

    if not from_title or not to_title:
        return {
            "action": "info",
            "suggestion": 'Para conectar di: "Conecta [Actividad A] con [Actividad B] de forma condicional".',
            "nodes": [],
            "connections": [],
        }

    return {
        "action": "connect_nodes",
        "suggestion": f'Conecté "{from_title}" con "{to_title}" usando flujo {flow_label}.',
        "nodes": [],
        "connections": [{"from": from_title, "to": to_title, "flowType": flow_type}],
    }


def _suggest_flow(prompt: str) -> dict:
    matched_nodes: list[dict] | None = None
    for keywords, nodes in _TEMPLATES:
        if any(kw in prompt for kw in keywords):
            matched_nodes = nodes
            break

    if matched_nodes is None:
        topic = _extract_topic(prompt)
        matched_nodes = [
            _n(f"Solicitud de {topic}", "Administración"),
            _n(f"Revisión de {topic}", "Dirección"),
            _n("Aprobación Final", "Dirección"),
        ]

    connections = _chain(matched_nodes)
    title_chain = " → ".join(n["title"] for n in matched_nodes)
    return {
        "action": "suggest_flow",
        "suggestion": title_chain,
        "nodes": matched_nodes,
        "connections": connections,
    }


def _help_reply(prompt: str) -> dict:
    if _has(prompt, "hola", "hello", "hi", "ayuda", "help"):
        msg = (
            "¡Hola! Puedo ayudarte a diseñar flujos de trabajo. Prueba:\n"
            '• "Crea un flujo para solicitud de vacaciones"\n'
            '• "Agrega actividad Revisión al departamento Legal"\n'
            '• "Conecta Solicitud con Aprobación de forma condicional"\n'
            '• "Elimina la actividad Aprobación"'
        )
    else:
        msg = (
            "Comandos disponibles:\n"
            '• Agregar: "Agrega [nombre] al departamento [dept]"\n'
            '• Flujo completo: "Crea un flujo para [proceso]"\n'
            '• Conectar: "Conecta [A] con [B] de forma [tipo]"\n'
            '• Eliminar: "Elimina la actividad [nombre]"'
        )
    return {"action": "info", "suggestion": msg, "nodes": [], "connections": []}
