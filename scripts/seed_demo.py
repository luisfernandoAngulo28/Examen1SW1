#!/usr/bin/env python3
"""
seed_demo.py — Poblar WorkflowSW1 con datos de demostración completos.

Uso:
    python3 scripts/seed_demo.py                          # EC2 por defecto
    python3 scripts/seed_demo.py http://localhost:4200    # local
    python3 scripts/seed_demo.py --reset                  # borra todo y re-siembra

Qué crea:
  - 3 departamentos: Recepción, Revisión Técnica, Aprobaciones
  - 4 usuarios: admin (ya existe), designer1, officer1, client1
  - 2 políticas publicadas con flujo completo de nodos
  - 3 trámites en distintos estados (en progreso, completado, cancelado)
  - Avanza tareas para que el dashboard ML muestre predicciones reales
"""

import sys
import json
import time
import urllib.request
import urllib.error

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith("http") else "http://54.233.18.87:4200"
RESET = "--reset" in sys.argv

# Si es nginx (puerto 4200/80), el API va por /api (proxy)
# Si apunta directo al backend (8080) usamos directamente
if ":8080" in BASE:
    API = BASE
else:
    API = BASE  # nginx proxy reescribe /api → backend:8080/api

def req(method, path, body=None, token=None):
    url = f"{API}/api{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        print(f"  ⚠  HTTP {e.code} {method} {path}: {raw[:200]}")
        return None

def login(email, password):
    res = req("POST", "/auth/login", {"email": email, "password": password})
    if res and "token" in res:
        return res["token"]
    return None

def register(name, email, password, role, token):
    return req("POST", "/auth/register", {
        "name": name, "email": email, "password": password, "role": role
    }, token)

# ── 1. Login admin ────────────────────────────────────────────────────────────
print("\n🔐  Login admin...")
admin_token = login("admin@demo.com", "admin123")
if not admin_token:
    print("  ERROR: no se pudo loguear como admin. ¿Ya registraste admin@demo.com?")
    sys.exit(1)
print("  ✓ admin logueado")

# ── 2. Reset (opcional) ───────────────────────────────────────────────────────
if RESET:
    print("\n🗑   Reset: borrando todos los trámites...")
    req("DELETE", "/cases", token=admin_token)
    print("  ✓ trámites eliminados")

# ── 3. Departamentos ──────────────────────────────────────────────────────────
print("\n🏢  Creando departamentos...")
existing_depts = req("GET", "/departments", token=admin_token) or []
existing_names = {d["name"] for d in existing_depts}

dept_map = {}
for dept in existing_depts:
    dept_map[dept["name"]] = dept["id"]

for dept_name in ["Recepción", "Revisión Técnica", "Aprobaciones"]:
    if dept_name in existing_names:
        print(f"  · {dept_name} ya existe → id={dept_map[dept_name][:8]}...")
    else:
        res = req("POST", "/departments", {"name": dept_name}, admin_token)
        if res:
            dept_map[res["name"]] = res["id"]
            print(f"  ✓ {dept_name} creado → id={res['id'][:8]}...")

d_recep  = dept_map.get("Recepción", "")
d_tecnic = dept_map.get("Revisión Técnica", "")
d_aprobac = dept_map.get("Aprobaciones", "")

# ── 4. Usuarios ───────────────────────────────────────────────────────────────
print("\n👤  Creando usuarios...")
users = {
    "designer1@demo.com": ("Designer Demo", "designer123", "DESIGNER"),
    "officer1@demo.com":  ("Officer Demo",  "officer123",  "OFFICER"),
    "client1@demo.com":   ("Client Demo",   "client123",   "CLIENT"),
    "officer2@demo.com":  ("Officer Técnico", "officer123", "OFFICER"),
}
tokens = {"admin@demo.com": admin_token}

for email, (name, pwd, role) in users.items():
    t = login(email, pwd)
    if t:
        tokens[email] = t
        print(f"  · {email} ya existe → token OK")
    else:
        res = register(name, email, pwd, role, admin_token)
        if res and "token" in res:
            tokens[email] = res["token"]
            print(f"  ✓ {email} ({role}) registrado")
        else:
            print(f"  ⚠ no se pudo registrar {email}")

designer_token = tokens.get("designer1@demo.com")
officer1_token  = tokens.get("officer1@demo.com")
officer2_token  = tokens.get("officer2@demo.com")
client1_token   = tokens.get("client1@demo.com")

# Obtener IDs de usuarios officer
me_officer1 = req("GET", "/auth/me", token=officer1_token) if officer1_token else None
me_officer2 = req("GET", "/auth/me", token=officer2_token) if officer2_token else None
officer1_id = me_officer1["id"] if me_officer1 else None
officer2_id = me_officer2["id"] if me_officer2 else None

# ── 5. Políticas ──────────────────────────────────────────────────────────────
print("\n📋  Creando políticas...")
existing_policies = req("GET", "/policies", token=admin_token) or []
existing_policy_names = {p["name"] for p in existing_policies}

def make_policy(name, description, nodes, edges, token):
    if name in existing_policy_names:
        for p in existing_policies:
            if p["name"] == name:
                print(f"  · Política '{name}' ya existe → id={p['id'][:8]}...")
                return p
        return None

    policy_body = {
        "name": name,
        "description": description,
        "status": "ACTIVE",
        "nodes": nodes,
        "edges": edges
    }
    res = req("POST", "/policies", policy_body, token)
    if res:
        print(f"  ✓ Política '{name}' creada → id={res['id'][:8]}...")
    return res

# Política 1: Solicitud de Permiso Municipal (3 etapas lineales)
policy1 = make_policy(
    name="Solicitud de Permiso Municipal",
    description="Flujo completo para tramitar permisos municipales con revisión técnica y aprobación final.",
    nodes=[
        {"id": "n1", "nodeType": "INITIAL",  "title": "Inicio",              "departmentId": d_recep,   "positionX": 100, "positionY": 200, "documentPermission": "VIEW_EDIT"},
        {"id": "n2", "nodeType": "ACTION",   "title": "Recepción de Documentos", "departmentId": d_recep, "positionX": 300, "positionY": 200,
         "documentPermission": "VIEW_EDIT",
         "formTemplate": {"fields": [
             {"name": "nombre_solicitante", "label": "Nombre del Solicitante", "type": "text",   "required": True},
             {"name": "tipo_permiso",       "label": "Tipo de Permiso",        "type": "select", "required": True, "options": ["Construcción", "Comercial", "Eventos"]},
             {"name": "descripcion",        "label": "Descripción del trámite","type": "textarea","required": True},
             {"name": "fecha_solicitud",    "label": "Fecha de Solicitud",     "type": "date",   "required": True}
         ]}},
        {"id": "n3", "nodeType": "ACTION",   "title": "Revisión Técnica",     "departmentId": d_tecnic, "positionX": 500, "positionY": 200,
         "documentPermission": "VIEW_EDIT",
         "formTemplate": {"fields": [
             {"name": "resultado_revision", "label": "Resultado de Revisión", "type": "select", "required": True, "options": ["Aprobado", "Observado", "Rechazado"]},
             {"name": "observaciones",      "label": "Observaciones técnicas", "type": "textarea","required": False},
             {"name": "fecha_revision",     "label": "Fecha de Revisión",     "type": "date",   "required": True}
         ]}},
        {"id": "n4", "nodeType": "ACTION",   "title": "Aprobación Final",     "departmentId": d_aprobac,"positionX": 700, "positionY": 200,
         "documentPermission": "FULL",
         "formTemplate": {"fields": [
             {"name": "decision",           "label": "Decisión Final",        "type": "select", "required": True, "options": ["Aprobado", "Rechazado"]},
             {"name": "numero_resolucion",  "label": "N° de Resolución",      "type": "text",   "required": True},
             {"name": "fecha_resolucion",   "label": "Fecha Resolución",      "type": "date",   "required": True}
         ]}},
        {"id": "n5", "nodeType": "FINAL",    "title": "Trámite Completado",   "departmentId": None,      "positionX": 900, "positionY": 200, "documentPermission": "VIEW"},
    ],
    edges=[
        {"id": "e1", "source": "n1", "target": "n2", "label": ""},
        {"id": "e2", "source": "n2", "target": "n3", "label": ""},
        {"id": "e3", "source": "n3", "target": "n4", "label": ""},
        {"id": "e4", "source": "n4", "target": "n5", "label": ""},
    ],
    token=designer_token or admin_token
)

# Política 2: Trámite de Licencia de Funcionamiento (con nodo DECISION)
policy2 = make_policy(
    name="Licencia de Funcionamiento",
    description="Proceso para obtener licencia de funcionamiento con bifurcación por tipo de negocio.",
    nodes=[
        {"id": "a1", "nodeType": "INITIAL",  "title": "Inicio",                  "departmentId": d_recep,   "positionX": 100, "positionY": 250, "documentPermission": "VIEW_EDIT"},
        {"id": "a2", "nodeType": "ACTION",   "title": "Ingreso de Solicitud",     "departmentId": d_recep,   "positionX": 280, "positionY": 250,
         "documentPermission": "VIEW_EDIT",
         "formTemplate": {"fields": [
             {"name": "razon_social",  "label": "Razón Social",    "type": "text",   "required": True},
             {"name": "ruc",           "label": "RUC",             "type": "text",   "required": True},
             {"name": "tipo_negocio",  "label": "Tipo de Negocio", "type": "select", "required": True, "options": ["Pequeño (<5 empleados)", "Mediano (5-20)", "Grande (>20)"]},
             {"name": "direccion",     "label": "Dirección",       "type": "text",   "required": True}
         ]}},
        {"id": "a3", "nodeType": "DECISION", "title": "¿Requiere Inspección?",    "departmentId": d_recep,   "positionX": 460, "positionY": 250, "documentPermission": "VIEW"},
        {"id": "a4", "nodeType": "ACTION",   "title": "Inspección en Campo",      "departmentId": d_tecnic,  "positionX": 460, "positionY": 80,
         "documentPermission": "VIEW_EDIT",
         "formTemplate": {"fields": [
             {"name": "resultado_inspeccion", "label": "Resultado Inspección", "type": "select", "required": True, "options": ["Conforme", "No Conforme", "Observado"]},
             {"name": "informe",              "label": "Informe de Inspección","type": "textarea","required": True}
         ]}},
        {"id": "a5", "nodeType": "ACTION",   "title": "Evaluación de Expediente", "departmentId": d_tecnic,  "positionX": 640, "positionY": 250,
         "documentPermission": "VIEW_EDIT",
         "formTemplate": {"fields": [
             {"name": "evaluacion",    "label": "Evaluación",      "type": "select", "required": True, "options": ["Completo", "Incompleto", "Subsanar"]},
             {"name": "detalle",       "label": "Detalle",         "type": "textarea","required": False}
         ]}},
        {"id": "a6", "nodeType": "ACTION",   "title": "Emisión de Licencia",      "departmentId": d_aprobac, "positionX": 820, "positionY": 250,
         "documentPermission": "FULL",
         "formTemplate": {"fields": [
             {"name": "numero_licencia","label": "N° de Licencia",  "type": "text",  "required": True},
             {"name": "vigencia",       "label": "Vigencia (años)", "type": "select","required": True, "options": ["1", "2", "3", "5"]},
             {"name": "fecha_emision",  "label": "Fecha Emisión",   "type": "date",  "required": True}
         ]}},
        {"id": "a7", "nodeType": "FINAL",    "title": "Licencia Emitida",         "departmentId": None,       "positionX": 1000, "positionY": 250, "documentPermission": "VIEW"},
    ],
    edges=[
        {"id": "b1", "source": "a1", "target": "a2", "label": ""},
        {"id": "b2", "source": "a2", "target": "a3", "label": ""},
        {"id": "b3", "source": "a3", "target": "a4", "label": "Sí, inspección"},
        {"id": "b4", "source": "a3", "target": "a5", "label": "No, directo"},
        {"id": "b5", "source": "a4", "target": "a5", "label": ""},
        {"id": "b6", "source": "a5", "target": "a6", "label": ""},
        {"id": "b7", "source": "a6", "target": "a7", "label": ""},
    ],
    token=designer_token or admin_token
)

if not policy1 or not policy2:
    print("  ⚠  No se pudieron crear las políticas — revisar permisos de DESIGNER")
    sys.exit(1)

# ── 6. Trámites ───────────────────────────────────────────────────────────────
print("\n📁  Creando trámites de demostración...")

def start_case(policy_id, token):
    return req("POST", "/cases", {"policyId": policy_id}, token)

def complete_task(task_id, token, chosen_edge=None):
    body = {}
    if chosen_edge:
        body["chosenEdgeLabel"] = chosen_edge
    return req("POST", f"/cases/tasks/{task_id}/complete", body, token)

def assign_task(task_id, user_id, token):
    return req("PATCH", f"/cases/tasks/{task_id}/assign", {"userId": user_id}, token)

def find_pending_task(case_detail, node_id=None):
    for t in case_detail.get("tasks", []):
        if t["status"] in ("PENDING", "IN_PROGRESS"):
            if node_id is None or t.get("nodeId") == node_id:
                return t
    return None

# Trámite 1: Permiso Municipal — en progreso (llegó a Revisión Técnica)
print("\n  📄 Trámite 1: Permiso Municipal (en progreso)...")
case1 = start_case(policy1["id"], client1_token or admin_token)
if case1:
    print(f"     creado → id={case1['id'][:8]}...")
    time.sleep(0.5)
    # Completar tarea de Recepción (n2)
    t = find_pending_task(case1)
    if t:
        if officer1_id:
            assign_task(t["id"], officer1_id, admin_token)
            time.sleep(0.3)
        updated = complete_task(t["id"], officer1_token or admin_token)
        if updated:
            print(f"     ✓ Tarea 'Recepción de Documentos' completada")
        # Dejar en Revisión Técnica sin completar (para que aparezca en "En Progreso")
    print(f"     → Estado: EN PROGRESO (en Revisión Técnica)")

# Trámite 2: Permiso Municipal — completado
print("\n  📄 Trámite 2: Permiso Municipal (completado)...")
case2 = start_case(policy1["id"], client1_token or admin_token)
if case2:
    print(f"     creado → id={case2['id'][:8]}...")
    # Completar todas las tareas secuencialmente
    current = case2
    for step_name in ["Recepción de Documentos", "Revisión Técnica", "Aprobación Final"]:
        time.sleep(0.4)
        t = find_pending_task(current)
        if not t:
            break
        tok = officer1_token or admin_token
        if step_name == "Aprobación Final":
            tok = admin_token
        res = complete_task(t["id"], tok)
        if res:
            current = res
            print(f"     ✓ '{step_name}' completada")
    print(f"     → Estado: COMPLETADO")

# Trámite 3: Licencia de Funcionamiento — en progreso (con bifurcación)
print("\n  📄 Trámite 3: Licencia de Funcionamiento (en progreso)...")
case3 = start_case(policy2["id"], client1_token or admin_token)
if case3:
    print(f"     creado → id={case3['id'][:8]}...")
    time.sleep(0.5)
    # Completar ingreso de solicitud (a2)
    t = find_pending_task(case3)
    if t:
        res = complete_task(t["id"], officer1_token or admin_token)
        if res:
            print(f"     ✓ 'Ingreso de Solicitud' completada")
            # Nodo DECISION (a3) — elegir rama "Sí, inspección"
            time.sleep(0.4)
            t2 = find_pending_task(res)
            if t2:
                res2 = complete_task(t2["id"], officer1_token or admin_token, "Sí, inspección")
                if res2:
                    print(f"     ✓ Decisión tomada: 'Sí, inspección'")
    print(f"     → Estado: EN PROGRESO (en Inspección en Campo)")

# Trámite 4: Licencia cancelada (para mostrar diversidad de estados)
print("\n  📄 Trámite 4: Licencia de Funcionamiento (cancelado)...")
case4 = start_case(policy2["id"], client1_token or admin_token)
if case4:
    print(f"     creado → id={case4['id'][:8]}...")
    time.sleep(0.3)
    res_cancel = req("PATCH", f"/cases/{case4['id']}/cancel", token=admin_token)
    if res_cancel:
        print(f"     ✓ Trámite cancelado")

# ── 7. Resumen final ──────────────────────────────────────────────────────────
print("\n" + "="*60)
print("✅  SEED COMPLETADO — resumen:")
print(f"   API:           {API}")
print(f"   Frontend:      {BASE}")
print()
print("   USUARIOS:")
print("   ┌─────────────────────────────┬──────────┬────────────┐")
print("   │ Email                       │ Rol      │ Password   │")
print("   ├─────────────────────────────┼──────────┼────────────┤")
print("   │ admin@demo.com              │ ADMIN    │ admin123   │")
print("   │ designer1@demo.com          │ DESIGNER │ designer123│")
print("   │ officer1@demo.com           │ OFFICER  │ officer123 │")
print("   │ officer2@demo.com           │ OFFICER  │ officer123 │")
print("   │ client1@demo.com            │ CLIENT   │ client123  │")
print("   └─────────────────────────────┴──────────┴────────────┘")
print()
print("   POLÍTICAS: Solicitud de Permiso Municipal | Licencia de Funcionamiento")
print("   TRÁMITES:  2 en progreso | 1 completado | 1 cancelado")
print()
print("   Dashboard ML mostrará predicciones con los trámites activos.")
print("="*60 + "\n")
