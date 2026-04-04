# Sistema de Gestión de Políticas de Negocio (Workflow)

**Materia:** Ingeniería de Software 1 — Primer Parcial  
**Semestre:** S1-2025  
**Metodología:** PUDS (Proceso Unificado de Desarrollo de Software)

---

## Descripción

Sistema web para diseñar, ejecutar y monitorear políticas de negocio organizacionales mediante diagramas de actividad UML. Permite a los diseñadores crear flujos de trabajo visuales y a los funcionarios ejecutar trámites siguiendo estos flujos, con monitoreo en tiempo real, formularios dinámicos por actividad y asistente de IA para diseño por voz/texto.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS + TypeScript |
| **Frontend** | React + Vite + TypeScript |
| **Base de datos** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Autenticación** | JWT (passport-jwt) |
| **Tiempo real** | Socket.IO |
| **Diagramas** | React Flow (@xyflow/react) |

## Arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL   │
│  React+Vite  │◀────│   NestJS     │◀────│   Prisma ORM  │
│  :5173       │     │  :3000       │     │  :5432        │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       └──── Socket.IO ─────┘
```

## Módulos del Sistema

### 1. Autenticación (`/auth`)
- Login/Register con JWT
- Roles: DESIGNER, OFFICER
- Guard de rutas protegidas

### 2. Departamentos (`/departments`)
- CRUD completo
- Asignación de funcionarios

### 3. Políticas de Negocio (`/policies`)
- CRUD de políticas
- Guardado/carga de grafos (nodos + aristas)
- Estados: DRAFT, ACTIVE, ARCHIVED

### 4. Editor Visual de Diagramas
- Diseñador drag & drop con React Flow
- Nodos = Actividades UML (asignadas a departamentos)
- Aristas = Flujos (SEQUENTIAL, CONDITIONAL, PARALLEL, ITERATIVE)
- Configuración de formularios por actividad
- Asistente IA integrado (texto + voz)

### 5. Motor de Workflow (`/cases`)
- Iniciar trámite desde política
- Avance automático de tareas por el flujo
- Asignación de funcionarios a tareas
- Completar/cancelar trámites
- Detección de nodo inicial y final

### 6. Formularios Dinámicos (`/forms`)
- Templates JSON por nodo (campos: text, number, email, date, textarea, select, checkbox)
- Submisiones por tarea
- Modos de entrada: MANUAL, VOICE, AI

### 7. Monitor en Tiempo Real (`/events`)
- WebSocket con Socket.IO
- Eventos: case:started, task:completed, task:assigned, case:completed
- Usuarios conectados en tiempo real
- Feed de eventos en vivo

### 8. Analytics (`/analytics`)
- KPIs: trámites totales, activos, completados, tareas pendientes
- Tareas por departamento
- Análisis por política: duración promedio, estadísticas por nodo
- **Detección de cuellos de botella** (umbral 1.5x promedio)

### 9. Asistente IA (`/ai-assistant`)
- NLP en español para diseño de diagramas
- Comandos: agregar actividad, conectar nodos, eliminar, crear flujo completo
- Reconocimiento de voz (Web Speech API)

## Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 16
- npm

### 1. Clonar repositorio
```bash
git clone https://github.com/luisfernandoAngulo28/Examen1SW1.git
cd Examen1SW1
```

### 2. Backend
```bash
cd backend
npm install
```

Crear archivo `.env`:
```
DATABASE_URL="postgresql://postgres:12345678@localhost:5432/workflow_sw1"
JWT_SECRET="mi_clave_secreta_jwt"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

Ejecutar migraciones y servidor:
```bash
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Acceder
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Crear usuario de prueba
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"123456","name":"Administrador","role":"DESIGNER"}'
```

## Base de Datos

### Modelos (11 tablas)
- **User** — Usuarios del sistema (DESIGNER/OFFICER)
- **Department** — Departamentos organizacionales
- **Policy** — Políticas de negocio
- **PolicyNode** — Nodos del diagrama (actividades)
- **PolicyEdge** — Aristas del diagrama (flujos)
- **Case** — Instancias de trámites
- **Task** — Tareas asignadas por nodo
- **FormTemplate** — Plantilla de formulario por nodo
- **FormSubmission** — Datos del formulario por tarea
- **EventLog** — Registro de eventos del sistema

## Estructura del Proyecto

```
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelos de datos
│   └── src/
│       ├── auth/                   # Autenticación JWT
│       ├── departments/            # CRUD departamentos
│       ├── policies/               # CRUD políticas + grafos
│       ├── cases/                  # Motor de workflow
│       ├── forms/                  # Formularios dinámicos
│       ├── events/                 # WebSocket gateway
│       ├── analytics/              # KPIs y bottleneck detection
│       ├── ai-assistant/           # NLP en español
│       └── prisma/                 # Prisma service
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Layout.tsx          # Sidebar layout
│       │   ├── DynamicForm.tsx     # Renderizado dinámico de forms
│       │   └── Toast.tsx           # Notificaciones toast
│       ├── context/
│       │   └── AuthContext.tsx      # Auth state global
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── PolicyEditorPage.tsx # Editor visual + IA
│       │   ├── CasesPage.tsx
│       │   ├── CaseDetailPage.tsx   # Tareas + formularios
│       │   ├── MonitorPage.tsx      # Tiempo real
│       │   ├── AnalyticsPage.tsx    # Analytics + bottlenecks
│       │   ├── DepartmentsPage.tsx
│       │   └── NewPolicyPage.tsx
│       ├── api.ts                  # Axios config
│       └── main.tsx
```

## Capturas

El sistema cuenta con:
- **Dashboard** con KPIs y tabla de políticas
- **Editor visual** drag & drop con panel de IA
- **Monitor** con eventos en tiempo real
- **Analytics** con detección de cuellos de botella
- **Formularios dinámicos** configurables por actividad

---

Desarrollado para el Primer Parcial de Ingeniería de Software 1 — S1/2025
