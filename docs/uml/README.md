# Diagramas UML 2.5 — Sistema de Gestión de Trámites y Workflows

Todos los diagramas están en formato **PlantUML** (herramienta CASE estándar, compatible con UML 2.5).

## Diagramas disponibles

### Diagrama general
| Archivo | Tipo de Diagrama | Descripción |
|---------|-----------------|-------------|
| [01_casos_de_uso.puml](01_casos_de_uso.puml) | Diagrama de Casos de Uso | Todos los actores y casos de uso del sistema (visión completa) |
| [02_clases.puml](02_clases.puml) | Diagrama de Clases | Todas las entidades del dominio con atributos, métodos, enumeraciones y relaciones |
| [03_actividades.puml](03_actividades.puml) | Diagrama de Actividades (swimlanes) | Flujo de "Solicitud de Instalación" con los 4 tipos de flujo: SEQUENTIAL, CONDITIONAL, PARALLEL, ITERATIVE |
| [04_secuencia.puml](04_secuencia.puml) | Diagrama de Secuencia | Flujo completo de un trámite: autenticación → JWT → inicio de caso → procesamiento → notificación FCM |
| [05_componentes.puml](05_componentes.puml) | Diagrama de Componentes | Todos los componentes del sistema: React, Flutter, Spring Boot, MongoDB, FCM, OpenAI |
| [06_despliegue.puml](06_despliegue.puml) | Diagrama de Despliegue | Arquitectura de producción (Docker, Railway/Render, Vercel, MongoDB Atlas, Firebase) y entorno local |

### Diagramas individuales por Caso de Uso

| Archivo | CU | Actores que extienden Usuario |
|---|---|---|
| [cu01_inicio_sesion.puml](cu01_inicio_sesion.puml) | CU01 — Gestionar Inicio de Sesión | Diseñador, Funcionario, Cliente |
| [cu02_gestionar_politica.puml](cu02_gestionar_politica.puml) | CU02 — Gestionar Política de Negocio | Diseñador, Administrador |
| [cu03_diseniar_diagrama.puml](cu03_diseniar_diagrama.puml) | CU03 — Diseñar Diagrama de Actividades | Diseñador + Sistema IA |
| [cu04_asistente_ia.puml](cu04_asistente_ia.puml) | CU04 — Asistente IA (texto / voz / imagen) | Diseñador, Funcionario |
| [cu05_gestionar_tramite.puml](cu05_gestionar_tramite.puml) | CU05 — Gestionar Trámite | Cliente, Diseñador |
| [cu06_procesar_tarea.puml](cu06_procesar_tarea.puml) | CU06 — Procesar Tarea | Funcionario, Diseñador |
| [cu07_formulario_actividad.puml](cu07_formulario_actividad.puml) | CU07 — Registrar Avance con Formulario | Funcionario, Diseñador |
| [cu08_monitor_tiempo_real.puml](cu08_monitor_tiempo_real.puml) | CU08 — Monitor en Tiempo Real | Diseñador, Funcionario |
| [cu09_analitica_cuellos.puml](cu09_analitica_cuellos.puml) | CU09 — Analítica y Cuellos de Botella | Diseñador, Administrador |
| [cu10_notificaciones_push.puml](cu10_notificaciones_push.puml) | CU10 — Notificaciones Push Móvil | Cliente, Funcionario |
| [cu11_gestionar_departamentos.puml](cu11_gestionar_departamentos.puml) | CU11 — Gestionar Departamentos | Diseñador, Administrador |

**Convención de flechas:**
- `ActorB --|> ActorA` → B **extiende** (hereda de) A — generalización de actor
- `Actor --> (UseCase)` → asociación: el actor participa en ese caso de uso
- `UC_A ..> UC_B : <<include>>` → A siempre incluye a B
- `UC_A ..> UC_B : <<extend>>` → A opcionalmente extiende a B

---

## Cómo generar las imágenes PNG/SVG

### Opción A — VS Code (recomendada, más rápida)

1. Instalar la extensión **PlantUML** de jebbs en VS Code:
   - `Ctrl+Shift+X` → buscar "PlantUML" → instalar
2. Instalar Java (si no está instalado): https://adoptium.net/
3. Abrir cualquier archivo `.puml`
4. Presionar `Alt+D` → se abre la previsualización en vivo
5. Para exportar: `Ctrl+Shift+P` → `PlantUML: Export Current Diagram`
   - Elegir formato: **PNG** (para el informe) o **SVG** (para web)

### Opción B — Online (sin instalar nada)

1. Ir a: https://www.plantuml.com/plantuml/uml/
2. Copiar y pegar el contenido de cada `.puml`
3. El sitio genera la imagen automáticamente
4. Botón derecho → "Guardar imagen como..." → PNG

### Opción C — PlantUML JAR por línea de comandos

```powershell
# Descargar plantuml.jar de https://plantuml.com/download
# Generar todos los diagramas en PNG:
java -jar plantuml.jar docs/uml/*.puml

# Generar en SVG:
java -jar plantuml.jar -tsvg docs/uml/*.puml

# Los archivos se generan en la misma carpeta que los .puml
```

### Opción D — Extensión PlantUML en IntelliJ IDEA

Si usás IntelliJ para el proyecto Spring Boot:
1. `File` → `Settings` → `Plugins` → buscar "PlantUML Integration"
2. Instalar → reiniciar
3. Abrir cualquier `.puml` → previsualización automática

---

## Correspondencia con Requisitos del Proyecto

| Requisito del Parcial | Diagrama | Sección en DOCUMENTACION.md |
|----------------------|----------|------------------------------|
| Políticas de negocio con diagrama de actividades | `03_actividades.puml` | Parte I — §2 |
| Flujos: secuencial, alternativo, iterativo, paralelo | `03_actividades.puml` | Parte I — §2.2 |
| Módulo de seguimiento del cliente | `04_secuencia.puml` (Fase 5) | Parte III — §3.3 |
| Notificaciones push FCM | `04_secuencia.puml` (Fases 2,3,4) | Parte III — §3.4 |
| Arquitectura de componentes | `05_componentes.puml` | Parte II — §4 |
| Despliegue en nube | `06_despliegue.puml` | Apéndice A |
| Modelo de dominio completo | `02_clases.puml` | Parte I — §3 |
| Actores y permisos por rol | `01_casos_de_uso.puml` | Parte I — §1 |

---

## Notas para la entrega

- PlantUML es una herramienta CASE ampliamente reconocida en la industria (usada por Atlassian, GitHub, GitLab)
- Los diagramas son **UML 2.5** nativos: soporta todos los tipos (UC, Class, Activity, Sequence, Component, Deployment)
- Los archivos `.puml` son el **fuente CASE** (equivalente al archivo `.mdj` de StarUML o `.zargo` de ArgoUML)
- Para la entrega en PDF: exportar como PNG y embeber en `DOCUMENTACION.md` o el informe Word/LaTeX
