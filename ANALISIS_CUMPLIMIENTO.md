# Análisis de Cumplimiento — Primer Parcial SW1

> Generado: 19 de abril de 2026  
> Basado en: `diagrama.md` (requisitos del parcial) vs código implementado

---

## ✅ LO QUE SÍ CUMPLEN

### Arquitectura General

| Requisito | Estado | Dónde está |
|---|---|---|
| Backend con motor de workflow | ✅ | `workflow-engine/` — Spring Boot + `CaseService` |
| Frontend web | ✅ | `frontend-ng/` — Angular 18 + Tailwind |
| Servicio IA (FastAPI) | ✅ | `ai-service/` — NLP, prompt, TTS |
| App móvil | ✅ | `mobile_app/` — Flutter + Provider |
| Base de datos MongoDB | ✅ | Spring Data MongoDB |
| Autenticación JWT | ✅ | Roles: CLIENT, OFFICER, DESIGNER, ADMIN |
| WebSocket tiempo real | ✅ | STOMP para eventos en vivo |
| Push Notifications | ✅ | Firebase Cloud Messaging |

### Tipos de Nodo del Workflow

| Nodo | Estado | Enum |
|---|---|---|
| INITIAL (Inicio) | ✅ | `NodeType.INITIAL` |
| FINAL (Fin) | ✅ | `NodeType.FINAL` |
| ACTION (Actividad) | ✅ | `NodeType.ACTION` |
| DECISION (Decisión Sí/No) | ✅ | `NodeType.DECISION` + `conditionLabel` |
| FORK (Paralelo) | ✅ | `NodeType.FORK` |
| JOIN (Sincronización) | ✅ | `NodeType.JOIN` |

### Motor de Workflow (`CaseService`)

| Funcionalidad | Estado | Endpoint |
|---|---|---|
| Flujo **secuencial** | ✅ | Avanza nodo a nodo |
| Flujo **alternativo** (decisión) | ✅ | `chosenEdgeLabel` selecciona rama |
| Flujo **paralelo** (fork/join) | ✅ | Fork crea N tareas, Join espera todas |
| Flujo **iterativo** | ✅ | Via decisión que vuelve a nodo anterior |
| Iniciar trámite desde política | ✅ | `POST /api/cases` |
| Completar tarea | ✅ | `POST /api/cases/tasks/{id}/complete` |
| Asignar tarea a usuario | ✅ | `PATCH /api/cases/tasks/{id}/assign` |
| Cancelar trámite | ✅ | `PATCH /api/cases/{id}/cancel` |
| Historial del trámite | ✅ | `GET /api/cases/{id}` (tasks + event log) |
| Tareas pendientes del funcionario | ✅ | `GET /api/cases/my-tasks` |

### Diseñador de Políticas

| Funcionalidad | Estado | Componente |
|---|---|---|
| Crear política de negocio | ✅ | `POST /api/policies` |
| Editor visual de diagrama | ✅ | `PolicyEditorComponent` + ngx-graph |
| Nodos con posición X/Y | ✅ | `positionX, positionY` en PolicyNode |
| Asignar departamento a actividad | ✅ | `departmentId` en cada nodo |
| CRUD políticas completo | ✅ | `PolicyController` |
| Guardar grafo (nodos + aristas) | ✅ | `PUT /api/policies/{id}/graph` |

### Departamentos

| Funcionalidad | Estado |
|---|---|
| CRUD departamentos | ✅ `DepartmentController` |
| Asociar actividades a departamentos | ✅ `departmentId` en PolicyNode |

### Formularios Dinámicos

| Funcionalidad | Estado |
|---|---|
| Template de formulario por nodo (JSON schema) | ✅ |
| Renderizado dinámico de formularios | ✅ `DynamicFormComponent` |
| Tipos: text, number, select, checkbox, date, textarea | ✅ |
| Guardar respuesta del formulario | ✅ `POST /api/forms/submit/{taskId}` |
| Llenar formulario manualmente | ✅ |

### Innovación 1: IA para diseño de diagramas

| Funcionalidad | Estado |
|---|---|
| Prompt texto → comandos de diagrama | ✅ `POST /api/ai-assistant/prompt` |
| Voz → texto (Speech-to-Text) | ✅ Web Speech API en frontend |
| IA interpreta y modifica diagrama | ✅ `IntentService` detecta intención |
| OCR imagen → comandos | ✅ `POST /api/ai-assistant/image` (Tesseract) |
| Soporte español e inglés | ✅ |

### Innovación 2: Formulario del funcionario con voz

| Funcionalidad | Estado |
|---|---|
| Formulario dinámico por actividad | ✅ JSON schema por nodo |
| Llenar formulario con voz | ✅ `POST /nlp/fill-form` |
| Confidence score por campo | ✅ `{field: 0.0-1.0}` |
| Corrección manual post-voz | ✅ |
| Modo de input: MANUAL / VOICE / NLP | ✅ `InputMode` enum |

### Innovación 3: Análisis de cuellos de botella

| Funcionalidad | Estado |
|---|---|
| Dashboard analytics | ✅ `AnalyticsController` + `AnalyticsComponent` |
| Detección de bottleneck | ✅ `AnalyticsService` identifica nodos lentos |
| Estadísticas por política | ✅ `GET /api/analytics/policy/{id}` |
| KPIs: total, activos, completados, pendientes | ✅ |

### Monitor en Tiempo Real

| Funcionalidad | Estado |
|---|---|
| Semáforo verde/amarillo/rojo | ✅ `TrafficLightComponent` |
| Monitor de casos activos | ✅ `MonitorComponent` + WebSocket |
| Feed de eventos en tiempo real | ✅ WebSocket STOMP |
| Bandeja del funcionario | ✅ `OfficerDashboardComponent` |

### Mobile

| Funcionalidad | Estado |
|---|---|
| Login | ✅ |
| Ver tareas pendientes (OFFICER) | ✅ `TasksScreen` |
| Ver mis trámites (CLIENT) | ✅ `TrackingScreen` |
| Completar tarea con formulario | ✅ `CaseDetailScreen` |
| Voz → llenar formulario | ✅ Speech-to-text + NLP |
| Push notifications (Firebase) | ✅ FCM integrado |

---

## ❌ LO QUE FALTA o está INCOMPLETO

### 1. 🔴 Evidencias (NO IMPLEMENTADO)

**Impacto: ALTO** — El doc pide que el funcionario pueda subir evidencias (foto, PDF, escaneo) vinculadas a un formulario.

- [ ] Modelo `Evidence` en backend (archivo, tipo, taskId/formId, fecha)
- [ ] Endpoint `POST /api/evidences/upload` — subir archivo (multipart)
- [ ] Endpoint `GET /api/evidences/{taskId}` — listar evidencias de una tarea
- [ ] Endpoint `DELETE /api/evidences/{id}` — eliminar evidencia
- [ ] Almacenamiento de archivos (MongoDB GridFS o carpeta local)
- [ ] UI en `CaseDetailComponent` para subir/ver evidencias por tarea
- [ ] UI en mobile `CaseDetailScreen` para subir foto/archivo

### 2. 🔴 Validaciones del Diseñador de Políticas (NO IMPLEMENTADO)

**Impacto: ALTO** — El doc define 12 prohibiciones + 7 advertencias. Ninguna está implementada.

**Prohibiciones (bloquean guardar):**
- [ ] No puede haber dos nodos INITIAL
- [ ] No puede haber un nodo sin salida (excepto FINAL)
- [ ] No puede haber un nodo sin entrada (excepto INITIAL)
- [ ] Todo camino debe terminar en FINAL
- [ ] En paralelo todas las ramas deben llegar al JOIN
- [ ] No puede haber dos actividades con el mismo nombre
- [ ] Actividad no puede apuntar a sí misma en Directo
- [ ] No puede haber ciclos infinitos sin condición de salida
- [ ] No conectar a nodo ya pasado (excepto con validación)
- [ ] En paralelo no puede haber rama vacía
- [ ] En paralelo ninguna rama puede saltarse el JOIN
- [ ] No puede haber decisión sin actividad previa

**Advertencias (avisan pero no bloquean):**
- [ ] Mismo departamento con 3+ actividades seguidas
- [ ] Rama de decisión sin Fin definido
- [ ] Flujo con más de 10 nodos
- [ ] Dos ramas de decisión van al mismo destino
- [ ] Rama paralela con validación (riesgo para otras ramas)
- [ ] Actividad sin responsable asignado
- [ ] Ramas de decisión muy desiguales en longitud

### 3. 🟡 Estado OBSERVADO del formulario (NO IMPLEMENTADO)

**Impacto: MEDIO** — El doc pide poder marcar un formulario como "OBSERVADO" si hay error.

- [ ] Agregar estado `OBSERVED` al modelo de FormSubmission/Task
- [ ] Endpoint `PATCH /api/forms/{id}/observe` con comentario
- [ ] UI para que un supervisor pueda observar un formulario
- [ ] Notificar al funcionario que su formulario fue observado

### 4. 🟡 Edición de formularios ya enviados (NO IMPLEMENTADO)

**Impacto: MEDIO**

- [ ] Endpoint `PATCH /api/forms/submission/{taskId}` para editar
- [ ] UI para re-editar formulario (solo si estado es OBSERVED)

### 5. 🟡 Swimlanes (Diagrama de Actividades en Calles)

**Impacto: MEDIO** — El doc pide "diagrama de actividades en calles". El editor actual usa grafo libre sin calles por departamento.

- [ ] Visualización por calles/swimlanes en el editor (agrupar nodos por departamento)
- [ ] O al menos colorear nodos por departamento en el editor (solución rápida)

### 6. 🟡 Etiqueta en nodo FIN visible en monitor

**Impacto: BAJO** — Los nodos FINAL tienen `title`, pero al completarse el trámite no se muestra la etiqueta ("Aprobado", "Rechazado") prominentemente en el monitor.

- [ ] Mostrar etiqueta del nodo FINAL en la vista de caso/monitor
- [ ] En el historial del trámite, indicar cómo terminó

### 7. 🟡 IA con LangChain para análisis avanzado

**Impacto: BAJO** — El doc extra menciona LangChain para análisis. Actualmente `AnalyticsService` usa lógica propia.

- [ ] Integrar LLM (OpenAI) en el endpoint de analytics del ai-service
- [ ] Generar recomendaciones en lenguaje natural desde los datos de tiempos

### 8. 🟢 Protección de departamentos con actividades activas

**Impacto: BAJO** — Regla 9 del doc: no se puede eliminar departamento si tiene actividades en políticas activas.

- [ ] Validar en `DELETE /api/departments/{id}` que no tenga políticas activas referenciándolo

---

## 📊 RESUMEN DE CUMPLIMIENTO

| Categoría | % | Estado |
|---|---|---|
| Arquitectura y stack | **95%** | ✅ Listo |
| Motor de workflow (4 flujos) | **90%** | ✅ Listo |
| Diseñador visual de políticas | **85%** | ✅ Listo |
| Innovación 1 (IA + voz para diseño) | **80%** | ✅ Listo |
| Innovación 2 (formulario + voz) | **75%** | ⚠️ Falta evidencias |
| Innovación 3 (cuellos de botella) | **70%** | ⚠️ Falta LLM |
| Validaciones estructura del flujo | **20%** | ❌ Falta casi todo |
| Evidencias (subir archivos) | **0%** | ❌ No existe |
| App móvil | **85%** | ✅ Listo |

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### Prioridad 1 — CRÍTICO (hacer primero)
1. **Validaciones del diseñador** — Es lo que más se nota en la demo
2. **Evidencias** — Feature completa que falta

### Prioridad 2 — IMPORTANTE (después)
3. **Estado OBSERVADO** del formulario
4. **Swimlanes** o al menos colores por departamento en el editor
5. **Etiqueta FIN** visible en monitor

### Prioridad 3 — NICE TO HAVE
6. **LangChain/LLM** para análisis avanzado
7. **Edición de formularios** post-submit
8. **Protección departamentos** al eliminar
