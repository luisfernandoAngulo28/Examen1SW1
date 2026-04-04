# Plantilla Minima de Arquitectura - NestJS (Parcial SW1)

## 1) Stack backend recomendado
- NestJS + TypeScript
- PostgreSQL
- Prisma ORM
- JWT (autenticacion)
- Socket.IO (actualizacion en tiempo real)

---

## 2) Estructura de modulos (exacta)
Crear estos modulos en este orden:

1. `core`
- Config global
- Filtros de errores
- Interceptores/log

2. `auth`
- Login
- JWT strategy
- Guard de autenticacion
- Guard por roles

3. `users`
- Usuario
- Rol (`DESIGNER`, `OFFICER`)

4. `departments`
- Departamentos
- Asignacion de funcionarios

5. `policies`
- Politicas de negocio (CRUD)
- Estado de politica (activa, inactiva)

6. `workflow-designer`
- Nodos (actividades)
- Aristas (transiciones)
- Soporte de tipo de flujo: `SEQUENTIAL`, `CONDITIONAL`, `ITERATIVE`, `PARALLEL`

7. `cases`
- Instancia de tramite
- Estado global del caso

8. `tasks`
- Tareas por funcionario
- Cambio de estado (`PENDING`, `IN_PROGRESS`, `DONE`, `BLOCKED`)

9. `forms`
- Plantilla de formulario por nodo
- Respuesta/formulario llenado por tarea

10. `events`
- Bitacora del tramite (auditoria)

11. `realtime`
- Gateway Socket.IO
- Emision de eventos al actualizar tareas/casos

12. `analytics`
- KPIs
- Deteccion de cuellos de botella

13. `ai-assistant` (MVP)
- Endpoint texto -> accion de diseno
- Endpoint voz transcrita -> accion de diseno

---

## 3) Modelo de dominio minimo (tablas)
- `users` (id, name, email, password_hash, role, department_id)
- `departments` (id, name)
- `policies` (id, name, status, created_by)
- `policy_nodes` (id, policy_id, department_id, title, type, form_template_id)
- `policy_edges` (id, policy_id, from_node_id, to_node_id, flow_type, condition_json)
- `cases` (id, policy_id, current_node_id, status, started_at, finished_at)
- `tasks` (id, case_id, node_id, assigned_user_id, status, started_at, finished_at, due_at)
- `form_templates` (id, node_id, schema_json)
- `form_submissions` (id, task_id, payload_json, input_mode)
- `event_logs` (id, case_id, type, payload_json, created_at)
- `kpi_records` (id, case_id, node_id, queue_minutes, work_minutes, breached_sla)

---

## 4) Endpoints MVP (primera version)

### Auth
- `POST /auth/login`
- `GET /auth/me`

### Usuarios/Departamentos
- `GET /users`
- `POST /users`
- `GET /departments`
- `POST /departments`

### Politicas y diseno
- `GET /policies`
- `POST /policies`
- `PATCH /policies/:id`
- `DELETE /policies/:id` (baja logica)
- `GET /policies/:id/graph`
- `PUT /policies/:id/graph`

### Casos y tareas
- `POST /cases` (iniciar tramite)
- `GET /cases/:id`
- `GET /tasks/my`
- `PATCH /tasks/:id/status`

### Formularios
- `GET /nodes/:nodeId/form-template`
- `PUT /nodes/:nodeId/form-template`
- `POST /tasks/:taskId/form-submission`

### Realtime
- Socket event: `task.updated`
- Socket event: `case.updated`
- Socket event: `kpi.updated`

### KPIs
- `GET /analytics/cases/:id/kpis`
- `GET /analytics/bottlenecks?policyId=...`

### IA (MVP)
- `POST /ai/diagram/command-text`
- `POST /ai/diagram/command-voice`

---

## 5) Orden de implementacion (sin trabarse)

## Fase 1 - Base tecnica
1. Inicializar NestJS + Prisma + PostgreSQL.
2. Auth JWT + roles.
3. CRUD de departamentos, usuarios y politicas.

## Fase 2 - Workflow funcional
1. Guardar/cargar grafo de politica (`policy_nodes`, `policy_edges`).
2. Iniciar caso (`POST /cases`).
3. Crear tarea inicial y asignar responsable.
4. Al cerrar tarea, avanzar al siguiente nodo segun reglas.

## Fase 3 - Monitor en tiempo real
1. `GET /tasks/my` para bandeja de funcionario.
2. Socket.IO al cambiar estado de tarea.
3. Refrescar automaticamente vista de bandeja y caso.

## Fase 4 - Formularios
1. Plantilla por nodo (`schema_json`).
2. Envio de formulario por tarea.
3. Guardar evidencia y registrar evento.

## Fase 5 - Cuellos de botella
1. Calcular tiempo en cola y tiempo de atencion por nodo.
2. Regla MVP: cuello si `queue_minutes` > promedio * 1.4 o supera umbral fijo.
3. Endpoint de consulta para dashboard.

## Fase 6 - IA minima
1. Texto a accion de diseno (crear nodo, conectar nodos).
2. Voz transcrita a accion de diseno.

---

## 6) Contratos de eventos (recomendado)

### `task.updated`
```json
{
  "taskId": "uuid",
  "caseId": "uuid",
  "status": "IN_PROGRESS",
  "assignedUserId": "uuid",
  "updatedAt": "2026-04-04T10:30:00Z"
}
```

### `case.updated`
```json
{
  "caseId": "uuid",
  "currentNodeId": "uuid",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-04-04T10:31:00Z"
}
```

### `kpi.updated`
```json
{
  "caseId": "uuid",
  "bottleneckNodeId": "uuid",
  "reason": "QUEUE_TIME_HIGH",
  "value": 92
}
```

---

## 7) Definition of Done (para examen)
- [ ] Login por roles funcionando.
- [ ] Politica editable y persistida (grafo).
- [ ] Caso ejecuta flujo entre funcionarios.
- [ ] Monitor se actualiza sin recarga.
- [ ] Formulario por tarea funcionando.
- [ ] Deteccion de cuello de botella visible.
- [ ] IA aplicada al menos en una accion de diseno.

---

## 8) Comandos de arranque sugeridos
```bash
# crear proyecto
npm i -g @nestjs/cli
nest new backend

# dentro de backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install prisma @prisma/client
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install class-validator class-transformer
npm install -D @types/bcrypt

npx prisma init
```

Tip: implementa primero el flujo end-to-end sin IA. Luego agregas IA como capa de asistencia.
