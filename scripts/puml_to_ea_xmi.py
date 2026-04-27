"""
puml_to_ea_xmi.py
Convierte archivos .puml de casos de uso a XMI 2.1 compatible con
Enterprise Architect (Sparx Systems).

Uso:
    python scripts/puml_to_ea_xmi.py

Genera: docs/xmi_ea/  con un .xmi por cada .puml + uno consolidado
"""

import os
import re
import uuid
import glob

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UML_DIR = os.path.join(ROOT, "docs", "uml")
OUT_DIR = os.path.join(ROOT, "docs", "xmi_ea")

os.makedirs(OUT_DIR, exist_ok=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

def new_id():
    return "EAID_" + str(uuid.uuid4()).upper().replace("-", "_")

def clean(text):
    """Quita saltos de línea embebidos en los labels PlantUML."""
    return text.replace("\\n", " ").replace("\n", " ").strip().strip('"')


# ── Parser PlantUML básico para use cases ─────────────────────────────────────

def parse_puml(path):
    """
    Extrae del .puml:
      actors     : {alias: name}
      usecases   : {alias: name}
      generalizations : [(child_alias, parent_alias)]   ── A --|> B
      associations    : [(actor_alias, uc_alias)]        ── Actor --> UC
      includes        : [(uc_from, uc_to)]               ── ..> <<include>>
      extends_rel     : [(uc_from, uc_to)]               ── ..> <<extend>>
      title           : str
    """
    with open(path, encoding="utf-8", errors="replace") as f:
        content = f.read()

    # Quitar comentarios
    content = re.sub(r"'[^\n]*", "", content)

    data = {
        "title": "",
        "actors": {},
        "usecases": {},
        "generalizations": [],
        "associations": [],
        "includes": [],
        "extends_rel": [],
    }

    # title
    m = re.search(r"title\s+(.+)", content)
    if m:
        data["title"] = m.group(1).strip()

    # actor "Nombre" as ALIAS
    for m in re.finditer(r'actor\s+"([^"]+)"\s+as\s+(\w+)', content):
        data["actors"][m.group(2)] = clean(m.group(1))

    # actor "Nombre" as ALIAS  (sin comillas)
    for m in re.finditer(r'actor\s+(\w+)\s+as\s+(\w+)', content):
        if m.group(1) not in ("as",):
            data["actors"][m.group(2)] = clean(m.group(1))

    # usecase "Nombre" as ALIAS
    for m in re.finditer(r'usecase\s+"([^"]+)"\s+as\s+(\w+)', content):
        data["usecases"][m.group(2)] = clean(m.group(1))

    # Generalización: CHILD --|> PARENT
    for m in re.finditer(r'(\w+)\s+\-\-\|>\s+(\w+)', content):
        data["generalizations"].append((m.group(1), m.group(2)))

    # Asociación: ACTOR --> UC  o  UC --> ACTOR
    for m in re.finditer(r'(\w+)\s+-->\s+(\w+)', content):
        a, b = m.group(1), m.group(2)
        # Determina quién es actor y quién es UC
        if a in data["actors"] and b in data["usecases"]:
            data["associations"].append((a, b))
        elif b in data["actors"] and a in data["usecases"]:
            data["associations"].append((b, a))
        elif a in data["actors"] and b in data["actors"]:
            pass  # herencia ya capturada arriba
        else:
            # Relación genérica — intenta guardarla
            data["associations"].append((a, b))

    # Include / Extend: UC_A ..> UC_B : <<include>> / <<extend>>
    for m in re.finditer(r'(\w+)\s+\.\.\>\s+(\w+)\s*:\s*<<(\w+)>>', content):
        src, tgt, rel = m.group(1), m.group(2), m.group(3).lower()
        if rel == "include":
            data["includes"].append((src, tgt))
        elif rel in ("extend", "extends"):
            data["extends_rel"].append((src, tgt))

    return data


# ── Generador XMI 2.1 ─────────────────────────────────────────────────────────

def generate_xmi(data, pkg_name):
    """Genera el cuerpo XMI 2.1 para un diagrama."""

    # Asignar IDs únicos
    actor_ids  = {alias: new_id() for alias in data["actors"]}
    uc_ids     = {alias: new_id() for alias in data["usecases"]}
    pkg_id     = new_id()
    diag_id    = new_id()

    lines = []

    # ── Package ──
    lines.append(f'  <packagedElement xmi:type="uml:Package" xmi:id="{pkg_id}" name="{pkg_name}" visibility="public">')

    # ── Actores ──
    for alias, name in data["actors"].items():
        aid = actor_ids[alias]
        lines.append(f'    <packagedElement xmi:type="uml:Actor" xmi:id="{aid}" name="{name}" visibility="public"/>')

    # ── Casos de uso ──
    for alias, name in data["usecases"].items():
        uid = uc_ids[alias]
        lines.append(f'    <packagedElement xmi:type="uml:UseCase" xmi:id="{uid}" name="{name}" visibility="public"/>')

    # ── Generalizaciones (herencia de actores) ──
    for child_alias, parent_alias in data["generalizations"]:
        gen_id = new_id()
        child_id  = actor_ids.get(child_alias) or uc_ids.get(child_alias, "")
        parent_id = actor_ids.get(parent_alias) or uc_ids.get(parent_alias, "")
        if child_id and parent_id:
            lines.append(f'    <packagedElement xmi:type="uml:Generalization" xmi:id="{gen_id}" general="{parent_id}" specific="{child_id}"/>')

    # ── Asociaciones actor ↔ caso de uso ──
    for actor_alias, uc_alias in data["associations"]:
        assoc_id = new_id()
        aid = actor_ids.get(actor_alias) or uc_ids.get(actor_alias, "")
        uid = uc_ids.get(uc_alias) or actor_ids.get(uc_alias, "")
        if aid and uid:
            e1, e2 = new_id(), new_id()
            lines.append(f'    <packagedElement xmi:type="uml:Association" xmi:id="{assoc_id}" visibility="public">')
            lines.append(f'      <memberEnd xmi:idref="{e1}"/>')
            lines.append(f'      <memberEnd xmi:idref="{e2}"/>')
            lines.append(f'      <ownedEnd xmi:type="uml:Property" xmi:id="{e1}" type="{aid}" association="{assoc_id}"/>')
            lines.append(f'      <ownedEnd xmi:type="uml:Property" xmi:id="{e2}" type="{uid}" association="{assoc_id}"/>')
            lines.append(f'    </packagedElement>')

    # ── Include ──
    for src_alias, tgt_alias in data["includes"]:
        dep_id = new_id()
        sid = uc_ids.get(src_alias, "")
        tid = uc_ids.get(tgt_alias, "")
        if sid and tid:
            lines.append(f'    <packagedElement xmi:type="uml:Include" xmi:id="{dep_id}">')
            lines.append(f'      <addition xmi:idref="{tid}"/>')
            lines.append(f'      <includingCase xmi:idref="{sid}"/>')
            lines.append(f'    </packagedElement>')

    # ── Extend ──
    for src_alias, tgt_alias in data["extends_rel"]:
        ext_id = new_id()
        sid = uc_ids.get(src_alias, "")
        tid = uc_ids.get(tgt_alias, "")
        if sid and tid:
            lines.append(f'    <packagedElement xmi:type="uml:Extend" xmi:id="{ext_id}">')
            lines.append(f'      <extendedCase xmi:idref="{tid}"/>')
            lines.append(f'      <extension xmi:idref="{sid}"/>')
            lines.append(f'    </packagedElement>')

    lines.append(f'  </packagedElement>')
    return "\n".join(lines)


def wrap_xmi(body, title):
    """Envuelve el cuerpo en el encabezado XMI 2.1 estándar de EA."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmi:version="2.1"
  xmlns:uml="http://www.omg.org/spec/UML/20090901"
  xmlns:xmi="http://schema.omg.org/spec/XMI/2.1"
  xmlns:thecustomprofile="http://www.sparxsystems.com/profiles/thecustomprofile/1.0">
  <xmi:Documentation exporter="PlantUML-to-EA" exporterVersion="1.0"/>
  <uml:Model xmi:type="uml:Model" name="{title}" visibility="public">
{body}
  </uml:Model>
</xmi:XMI>"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    puml_files = sorted(glob.glob(os.path.join(UML_DIR, "*.puml")))
    all_bodies = []

    print(f"\n Generando XMI 2.1 para Enterprise Architect...")
    print(f" Entrada : {UML_DIR}")
    print(f" Salida  : {OUT_DIR}\n")

    for path in puml_files:
        base = os.path.splitext(os.path.basename(path))[0]
        data = parse_puml(path)

        if not data["actors"] and not data["usecases"]:
            print(f"  -- {base}.puml  sin actores/UC (omitido)")
            continue

        pkg_name = data["title"] or base
        body     = generate_xmi(data, pkg_name)
        xmi_text = wrap_xmi(body, pkg_name)

        out_path = os.path.join(OUT_DIR, base + "_EA.xmi")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(xmi_text)

        actors_n = len(data["actors"])
        uc_n     = len(data["usecases"])
        gen_n    = len(data["generalizations"])
        assoc_n  = len(data["associations"])
        print(f"  OK {base}_EA.xmi  ({actors_n} actores, {uc_n} UC, {gen_n} generalizaciones, {assoc_n} asociaciones)")

        all_bodies.append(body)

    # Archivo consolidado con todos los diagramas
    consolidated = wrap_xmi("\n".join(all_bodies), "WorkflowSW1 — Todos los Casos de Uso")
    consol_path  = os.path.join(OUT_DIR, "00_TODOS_LOS_CU_EA.xmi")
    with open(consol_path, "w", encoding="utf-8") as f:
        f.write(consolidated)

    print(f"\n  OK Archivo consolidado: 00_TODOS_LOS_CU_EA.xmi")
    print(f"\n{'='*55}")
    print(" IMPORTAR EN ENTERPRISE ARCHITECT:")
    print(f"{'='*55}")
    print("  1. Abrir Enterprise Architect")
    print("  2. Menu: Publish -> Import/Export -> Import XMI...")
    print("     (EA antiguo: File -> Import/Export -> Import XMI)")
    print("  3. Seleccionar: 00_TODOS_LOS_CU_EA.xmi  (todos juntos)")
    print("     O importar cada CUxx_EA.xmi por separado")
    print("  4. Formato: UML 2.x / XMI 2.1")
    print("  5. Strip GUIDs: NO")
    print("  6. Clic Import")
    print("")
    print("  Resultado en el Project Browser:")
    print("  Aparecen paquetes con Actores y Casos de Uso con")
    print("  generalizaciones, asociaciones, include y extend.")
    print("")
    print("  NOTA: El layout se asigna por EA automaticamente.")
    print("  Usar Auto Layout: Ctrl+Shift+F5 -> Layered Digraph")


if __name__ == "__main__":
    main()
