"""
class_to_ea_xmi.py
Genera XMI 2.1 compatible con Enterprise Architect para el diagrama de clases
del Sistema de Gestion de Tramites y Workflows (02_clases.puml).

Salida: docs/xmi_ea/02_clases_EA.xmi
Uso:    python scripts/class_to_ea_xmi.py
"""

import uuid, os

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "docs", "xmi_ea")
OUT     = os.path.join(OUT_DIR, "02_clases_EA.xmi")
os.makedirs(OUT_DIR, exist_ok=True)

# ── ID registry ───────────────────────────────────────────────────────────────
_ctr = [0]
def nid():
    _ctr[0] += 1
    return f"EAID_{_ctr[0]:04d}_{str(uuid.uuid4()).upper().replace('-','_')[:8]}"

R = {}
def reg(key):
    if key not in R:
        R[key] = nid()
    return R[key]

# Pre-registrar todos los IDs para referencias cruzadas
for k in [
    "PKG_Enums", "PKG_Domain", "PKG_DTOs", "PKG_Svc",
    "ENUM_Role", "ENUM_PolicyStatus", "ENUM_NodeType",
    "ENUM_FlowType", "ENUM_CaseStatus", "ENUM_TaskStatus", "ENUM_InputMode",
    "CLS_User", "CLS_Department", "CLS_Policy", "CLS_PolicyNode", "CLS_PolicyEdge",
    "CLS_Case", "CLS_Task", "CLS_FormSubmission", "CLS_EventLog",
    "CLS_AuthResponse", "CLS_CaseDetailDto", "CLS_TaskDetailDto",
    "CLS_MyTaskDto", "CLS_LoginRequest", "CLS_RegisterRequest",
    "CLS_AuthService", "CLS_CaseService", "CLS_PolicyService",
    "CLS_NotificationService", "CLS_AnalyticsService",
    "CLS_EventPublisher", "CLS_CaseViewService",
]:
    reg(k)

# ── XML builders ──────────────────────────────────────────────────────────────

def enum_xml(key, name, literals):
    eid = R[key]
    lits = "\n".join(
        f'        <ownedLiteral xmi:type="uml:EnumerationLiteral" xmi:id="{nid()}" '
        f'name="{lit}" enumeration="{eid}"/>'
        for lit in literals
    )
    return (
        f'      <packagedElement xmi:type="uml:Enumeration" xmi:id="{eid}" '
        f'name="{name}" visibility="public">\n'
        f'{lits}\n'
        f'      </packagedElement>'
    )

def class_xml(key, name, stereotype, attrs, ops):
    """
    attrs: list of (attr_name, visibility)
    ops:   list of (op_name, visibility)
    """
    cid = R[key]
    attr_lines = "\n".join(
        f'        <ownedAttribute xmi:type="uml:Property" xmi:id="{nid()}" '
        f'name="{a}" visibility="{v}"/>'
        for a, v in attrs
    )
    op_lines = "\n".join(
        f'        <ownedOperation xmi:type="uml:Operation" xmi:id="{nid()}" '
        f'name="{o}" visibility="{v}"/>'
        for o, v in ops
    )
    body = ""
    if attr_lines:
        body += f"\n        <!-- atributos -->\n{attr_lines}"
    if op_lines:
        body += f"\n        <!-- operaciones -->\n{op_lines}"
    return (
        f'      <packagedElement xmi:type="uml:Class" xmi:id="{cid}" '
        f'name="{name}" visibility="public"> <!-- &lt;&lt;{stereotype}&gt;&gt; -->'
        f'{body}\n'
        f'      </packagedElement>'
    )

def assoc_xml(src_key, tgt_key, name="", agg=None):
    aid, e1, e2 = nid(), nid(), nid()
    agg_attr = f' aggregation="{agg}"' if agg else ""
    return (
        f'  <packagedElement xmi:type="uml:Association" xmi:id="{aid}" '
        f'name="{name}" visibility="public">\n'
        f'    <memberEnd xmi:idref="{e1}"/>\n'
        f'    <memberEnd xmi:idref="{e2}"/>\n'
        f'    <ownedEnd xmi:type="uml:Property" xmi:id="{e1}" '
        f'type="{R[src_key]}" association="{aid}"{agg_attr}/>\n'
        f'    <ownedEnd xmi:type="uml:Property" xmi:id="{e2}" '
        f'type="{R[tgt_key]}" association="{aid}"/>\n'
        f'  </packagedElement>'
    )

def comp_xml(whole_key, part_key, name=""):
    return assoc_xml(whole_key, part_key, name, agg="composite")

def dep_xml(src_key, tgt_key, name=""):
    return (
        f'  <packagedElement xmi:type="uml:Dependency" xmi:id="{nid()}" '
        f'name="{name}" client="{R[src_key]}" supplier="{R[tgt_key]}" visibility="public"/>'
    )

# ── Paquete: Enumeraciones ────────────────────────────────────────────────────

ENUMS = "\n".join([
    enum_xml("ENUM_Role",         "Role",         ["DESIGNER", "OFFICER", "CLIENT"]),
    enum_xml("ENUM_PolicyStatus", "PolicyStatus", ["ACTIVE", "INACTIVE"]),
    enum_xml("ENUM_NodeType",     "NodeType",     ["INITIAL", "ACTION", "DECISION", "FORK", "JOIN", "FINAL"]),
    enum_xml("ENUM_FlowType",     "FlowType",     ["SEQUENTIAL", "CONDITIONAL", "ITERATIVE", "PARALLEL"]),
    enum_xml("ENUM_CaseStatus",   "CaseStatus",   ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    enum_xml("ENUM_TaskStatus",   "TaskStatus",   ["PENDING", "IN_PROGRESS", "DONE", "BLOCKED"]),
    enum_xml("ENUM_InputMode",    "InputMode",    ["MANUAL", "VOICE", "AI"]),
])

PKG_ENUMS = (
    f'  <packagedElement xmi:type="uml:Package" xmi:id="{R["PKG_Enums"]}" '
    f'name="Enumeraciones" visibility="public">\n'
    f'{ENUMS}\n'
    f'  </packagedElement>'
)

# ── Paquete: Modelo de Dominio ────────────────────────────────────────────────

DOMAIN = "\n".join([
    class_xml("CLS_User", "User", "Document",
        [("id","private"),("email","private"),("name","private"),("passwordHash","private"),
         ("role","private"),("departmentId","private"),("fcmToken","private"),("createdAt","private")],
        [("getId","public"),("getEmail","public"),("getRole","public"),
         ("getDepartmentId","public"),("getFcmToken","public")]),

    class_xml("CLS_Department", "Department", "Document",
        [("id","private"),("name","private"),("createdAt","private")],
        [("getId","public"),("getName","public")]),

    class_xml("CLS_Policy", "Policy", "Document",
        [("id","private"),("name","private"),("status","private"),("createdBy","private"),
         ("nodes","private"),("edges","private"),("createdAt","private"),("updatedAt","private")],
        [("getId","public"),("getNodes","public"),("getEdges","public"),("getStatus","public")]),

    class_xml("CLS_PolicyNode", "PolicyNode", "EmbeddedDocument",
        [("id","private"),("departmentId","private"),("nodeType","private"),("title","private"),
         ("description","private"),("positionX","private"),("positionY","private"),("formTemplate","private")],
        [("getId","public"),("getNodeType","public"),("getDepartmentId","public"),("getFormTemplate","public")]),

    class_xml("CLS_PolicyEdge", "PolicyEdge", "EmbeddedDocument",
        [("id","private"),("fromNodeId","private"),("toNodeId","private"),("flowType","private"),
         ("conditionLabel","private"),("conditionJson","private")],
        [("getId","public"),("getFlowType","public"),("getFromNodeId","public"),("getToNodeId","public")]),

    class_xml("CLS_Case", "Case", "Document",
        [("id","private"),("policyId","private"),("currentNodeId","private"),("status","private"),
         ("clientId","private"),("tasks","private"),("eventLogs","private"),
         ("startedAt","private"),("finishedAt","private")],
        [("getId","public"),("getStatus","public"),("getTasks","public"),("getEventLogs","public")]),

    class_xml("CLS_Task", "Task", "EmbeddedDocument",
        [("id","private"),("nodeId","private"),("assignedUserId","private"),("status","private"),
         ("formSubmission","private"),("startedAt","private"),("finishedAt","private"),("dueAt","private")],
        [("getId","public"),("getStatus","public"),("getAssignedUserId","public"),("getNodeId","public")]),

    class_xml("CLS_FormSubmission", "FormSubmission", "EmbeddedDocument",
        [("id","private"),("payloadJson","private"),("inputMode","private"),("createdAt","private")],
        [("getId","public"),("getInputMode","public"),("getPayloadJson","public")]),

    class_xml("CLS_EventLog", "EventLog", "EmbeddedDocument",
        [("type","private"),("payloadJson","private"),("createdAt","private")],
        [("getType","public"),("getCreatedAt","public")]),
])

PKG_DOMAIN = (
    f'  <packagedElement xmi:type="uml:Package" xmi:id="{R["PKG_Domain"]}" '
    f'name="Modelo de Dominio" visibility="public">\n'
    f'{DOMAIN}\n'
    f'  </packagedElement>'
)

# ── Paquete: DTOs ─────────────────────────────────────────────────────────────

DTOS = "\n".join([
    class_xml("CLS_AuthResponse", "AuthResponse", "DTO",
        [("token","public"),("userId","public"),("email","public"),
         ("name","public"),("role","public"),("departmentId","public")], []),

    class_xml("CLS_CaseDetailDto", "CaseDetailDto", "DTO",
        [("id","public"),("status","public"),("currentNodeId","public"),("clientId","public"),
         ("startedAt","public"),("finishedAt","public"),("policy","public"),
         ("tasks","public"),("eventLogs","public")], []),

    class_xml("CLS_TaskDetailDto", "TaskDetailDto", "DTO",
        [("id","public"),("status","public"),("startedAt","public"),("finishedAt","public"),
         ("node","public"),("assignedUser","public"),("formSubmission","public")], []),

    class_xml("CLS_MyTaskDto", "MyTaskDto", "DTO",
        [("id","public"),("status","public"),("startedAt","public"),
         ("node","public"),("case","public"),("assignedUser","public")], []),

    class_xml("CLS_LoginRequest", "LoginRequest", "DTO",
        [("email","public"),("password","public")], []),

    class_xml("CLS_RegisterRequest", "RegisterRequest", "DTO",
        [("email","public"),("password","public"),("name","public"),
         ("role","public"),("departmentId","public")], []),
])

PKG_DTOS = (
    f'  <packagedElement xmi:type="uml:Package" xmi:id="{R["PKG_DTOs"]}" '
    f'name="DTOs" visibility="public">\n'
    f'{DTOS}\n'
    f'  </packagedElement>'
)

# ── Paquete: Servicios ────────────────────────────────────────────────────────

SVCS = "\n".join([
    class_xml("CLS_AuthService", "AuthService", "Service",
        [("userRepository","private"),("jwtUtil","private")],
        [("login","public"),("register","public")]),

    class_xml("CLS_CaseService", "CaseService", "Service",
        [("caseRepository","private"),("policyRepository","private"),("userRepository","private"),
         ("departmentRepository","private"),("eventPublisher","private"),("notificationService","private")],
        [("startCase","public"),("startCaseForClient","public"),("advanceTask","public"),
         ("findAll","public"),("findByClientId","public"),("findByPolicyId","public"),("findById","public"),
         ("routeNextStep","private"),("handleDecisionNode","private"),
         ("handleForkNode","private"),("handleJoinNode","private")]),

    class_xml("CLS_PolicyService", "PolicyService", "Service",
        [("policyRepository","private")],
        [("create","public"),("update","public"),("delete","public"),
         ("findAll","public"),("findById","public"),("saveGraph","public")]),

    class_xml("CLS_NotificationService", "NotificationService", "Service",
        [], [("send","public")]),

    class_xml("CLS_AnalyticsService", "AnalyticsService", "Service",
        [("caseRepository","private"),("policyRepository","private"),("departmentRepository","private")],
        [("getDashboardStats","public"),("getBottleneckStats","public"),("getKpis","public")]),

    class_xml("CLS_EventPublisher", "EventPublisher", "Service",
        [("messagingTemplate","private")],
        [("publishCaseUpdate","public")]),

    class_xml("CLS_CaseViewService", "CaseViewService", "Service",
        [("caseRepository","private"),("policyRepository","private"),
         ("userRepository","private"),("departmentRepository","private")],
        [("toDetailDto","public"),("getMyTasks","public")]),
])

PKG_SVC = (
    f'  <packagedElement xmi:type="uml:Package" xmi:id="{R["PKG_Svc"]}" '
    f'name="Servicios" visibility="public">\n'
    f'{SVCS}\n'
    f'  </packagedElement>'
)

# ── Relaciones ────────────────────────────────────────────────────────────────

RELS = "\n".join([
    "  <!-- Enums usados por entidades (dependencia) -->",
    dep_xml("CLS_User",          "ENUM_Role",         "role"),
    dep_xml("CLS_Policy",        "ENUM_PolicyStatus",  "status"),
    dep_xml("CLS_PolicyNode",    "ENUM_NodeType",      "nodeType"),
    dep_xml("CLS_PolicyEdge",    "ENUM_FlowType",      "flowType"),
    dep_xml("CLS_Case",          "ENUM_CaseStatus",    "status"),
    dep_xml("CLS_Task",          "ENUM_TaskStatus",    "status"),
    dep_xml("CLS_FormSubmission","ENUM_InputMode",     "inputMode"),

    "\n  <!-- Composicion: subdocumentos embebidos MongoDB -->",
    comp_xml("CLS_Policy", "CLS_PolicyNode",    "nodes"),
    comp_xml("CLS_Policy", "CLS_PolicyEdge",    "edges"),
    comp_xml("CLS_Case",   "CLS_Task",          "tasks"),
    comp_xml("CLS_Case",   "CLS_EventLog",      "eventLogs"),
    comp_xml("CLS_Task",   "CLS_FormSubmission","formSubmission"),

    "\n  <!-- Asociaciones por referencia String ID (MongoDB) -->",
    assoc_xml("CLS_User",      "CLS_Department","departmentId"),
    assoc_xml("CLS_Case",      "CLS_Policy",    "policyId"),
    assoc_xml("CLS_Case",      "CLS_User",      "clientId"),
    assoc_xml("CLS_Task",      "CLS_User",      "assignedUserId"),
    assoc_xml("CLS_Task",      "CLS_PolicyNode","nodeId"),
    assoc_xml("CLS_PolicyNode","CLS_Department","departmentId"),
    assoc_xml("CLS_Policy",    "CLS_User",      "createdBy"),

    "\n  <!-- Dependencias de servicios -->",
    dep_xml("CLS_AuthService",     "CLS_AuthResponse",       "produce"),
    dep_xml("CLS_CaseViewService", "CLS_CaseDetailDto",      "produce"),
    dep_xml("CLS_CaseViewService", "CLS_TaskDetailDto",      "produce"),
    dep_xml("CLS_CaseViewService", "CLS_MyTaskDto",          "produce"),
    dep_xml("CLS_CaseService",     "CLS_NotificationService","usa"),
    dep_xml("CLS_CaseService",     "CLS_EventPublisher",     "usa"),
    dep_xml("CLS_CaseService",     "CLS_PolicyService",      "usa"),
    dep_xml("CLS_CaseService",     "CLS_CaseViewService",    "delega vista"),
])

# ── Wrap & write ──────────────────────────────────────────────────────────────

XMI = f"""<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmi:version="2.1"
  xmlns:uml="http://www.omg.org/spec/UML/20090901"
  xmlns:xmi="http://schema.omg.org/spec/XMI/2.1"
  xmlns:thecustomprofile="http://www.sparxsystems.com/profiles/thecustomprofile/1.0">
  <xmi:Documentation exporter="PlantUML-to-EA-ClassDiagram" exporterVersion="1.0"/>
  <uml:Model xmi:type="uml:Model"
             name="WorkflowSW1 -- Diagrama de Clases UML 2.5"
             visibility="public">

{PKG_ENUMS}

{PKG_DOMAIN}

{PKG_DTOS}

{PKG_SVC}

{RELS}

  </uml:Model>
</xmi:XMI>"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(XMI)

size_kb = round(os.path.getsize(OUT) / 1024, 1)
print(f"OK  {OUT}  ({size_kb} KB)")
print(f"    4 paquetes | 7 enums | 9 clases dominio | 6 DTOs | 7 servicios")
print(f"    7 dep-enum + 5 composiciones + 7 asociaciones + 8 dep-servicio")
print()
print("IMPORTAR EN ENTERPRISE ARCHITECT:")
print("  Publish -> Import/Export -> Import XMI...")
print("  Archivo : docs/xmi_ea/02_clases_EA.xmi")
print("  Formato : UML 2.x / XMI 2.1")
print("  Strip GUIDs: NO  -> clic Import")
print()
print("En el Project Browser aparecen 4 paquetes con todas las clases,")
print("enums, atributos, operaciones y relaciones.")
