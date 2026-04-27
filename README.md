# Sistema de Gestión de Políticas de Negocio — WorkflowSW1

**Materia:** Ingeniería de Software 1 — Primer Parcial
**Semestre:** S1-2025
**Metodología:** PUDS (Proceso Unificado de Desarrollo de Software)

---

## Descripción

Sistema web para **diseñar, ejecutar y monitorear políticas de negocio** organizacionales mediante diagramas de actividad UML. Los diseñadores crean flujos de trabajo visuales y los funcionarios ejecutan trámites siguiendo estos flujos, con monitoreo en tiempo real, formularios dinámicos por actividad y asistente de IA para diseño por voz/texto.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Backend** | Spring Boot 3.5.0 + Java 22 |
| **Frontend** | Angular 18 + TypeScript |
| **Base de datos** | MongoDB 7.0 |
| **Repositorios** | Spring Data MongoDB |
| **Autenticación** | Spring Security + JWT |
| **Tiempo real** | STOMP sobre WebSocket (@stomp/stompjs) |
| **Diagramas** | ngx-graph (editor visual de nodos/aristas) |
| **OCR** | Tesseract.js (en navegador) |
| **TTS (opcional)** | ElevenLabs API (fallback: Web Speech API) |
| **Testing** | JUnit 5 + MockMvc (Spring Boot) |
| **Build backend** | Maven 3.9 |
| **Build frontend** | Angular CLI 18 / esbuild |

## Arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────►│   Backend    │────►│   MongoDB    │
│ Angular 18   │◄────│ Spring Boot  │◄────│   :27017     │
│  :4200       │     │  :8080       │     │ workflow_sw1 │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       └──── STOMP /ws ─────┘
```

## Módulos del Sistema

### 1. Autenticación (`/api/auth`)
- Login/Register con JWT (Spring Security)
- Roles: DESIGNER, OFFICER
- Guard de rutas protegidas

### 2. Departamentos (`/api/departments`)
- CRUD completo
- Asignación de funcionarios

### 3. Políticas de Negocio (`/api/policies`)
- CRUD de políticas
- Guardado/carga de grafos (nodos + aristas) como documentos MongoDB
- Estados: DRAFT, ACTIVE

### 4. Editor Visual de Diagramas
- Diseñador drag & drop con ngx-graph (Angular)
- Nodos = Actividades UML (asignadas a departamentos)
- Aristas = Flujos (SEQUENTIAL, CONDITIONAL, PARALLEL, ITERATIVE)
- Configuración de formularios por actividad
- Asistente IA integrado (texto + voz + TTS ElevenLabs)
- **Edición colaborativa en tiempo real** via STOMP WebSocket

### 5. Motor de Workflow (`/api/cases`)
- Iniciar trámite desde política
- Avance automático de tareas por el flujo
- Asignación de funcionarios a tareas
- Completar/cancelar trámites
- Detección de nodo inicial y final
- Flujos paralelos (FORK/JOIN) y condicionales (DECISION)

### 6. Formularios Dinámicos (`/api/forms`)
- Templates JSON por nodo (campos: text, number, email, date, textarea, select, checkbox)
- Submisiones por tarea
- Modos de entrada: MANUAL, VOICE, AI (OCR)

### 7. Monitor en Tiempo Real (`/ws`)
- WebSocket STOMP en `/ws`
- Eventos: `case:started`, `task:completed`, `task:assigned`, `case:completed`, `policy:updated`
- Feed de eventos en vivo

### 8. Analytics (`/api/analytics`)
- KPIs: trámites totales, activos, completados, tareas pendientes
- Tareas por departamento
- Análisis por política: duración promedio, estadísticas por nodo
- **Detección de cuellos de botella** (umbral 1.5× promedio)
- **Priorización de bandeja** por antigüedad y estado (REQ-06)

### 9. Asistente IA (`/api/ai-assistant`)
- NLP en español para diseño de diagramas
- Comandos: agregar actividad, conectar nodos, eliminar, crear flujo completo
- Reconocimiento de voz (Web Speech API)
- **Text-to-Speech** via ElevenLabs API (degradación graceful a Web Speech)

## Instalación

### Prerrequisitos
- Java 22+
- Maven 3.9+ (o usar el wrapper `mvnw` incluido)
- Node.js 20+ y Angular CLI 18
- MongoDB 7.0 (local en puerto 27017)

### 1. Clonar repositorio
```bash
git clone https://github.com/luisfernandoAngulo28/Examen1SW1.git
cd Examen1SW1
```

### 2. Backend (Spring Boot)
```powershell
cd workflow-engine
```

Crear `workflow-engine/src/main/resources/.env` o configurar variables de entorno:
```
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/workflow_sw1
JWT_SECRET=sw1-secret-key-2025
ELEVENLABS_API_KEY=          # opcional — sin TTS se usa Web Speech
```

Ejecutar:
```powershell
.\mvnw spring-boot:run        # http://localhost:8080
```

### 3. Frontend (Angular)
```powershell
cd frontend-ng
npm install
ng serve --port 4200          # http://localhost:4200
```

### 4. Con Docker Compose
```bash
docker-compose up --build
# Backend en :8080, Frontend en :4200, MongoDB en :27017
```

## Credenciales de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Diseñador (DESIGNER) | `admin@demo.com` | `Admin1234!` |
| Funcionario RRHH | `rrhh@demo.com` | `Admin1234!` |
| Funcionario Jefatura | `jefe@demo.com` | `Admin1234!` |
| Funcionario Legal | `legal@demo.com` | `Admin1234!` |
| Funcionario Finanzas | `finanzas@demo.com` | `Admin1234!` |
| Funcionario TI | `ti@demo.com` | `Admin1234!` |

> Generar datos de demo: `cd scripts; .\seed-demo.ps1`

## Pruebas

```powershell
cd workflow-engine
.\mvnw test
# 4 suites de pruebas (JUnit 5 + MockMvc):
#   AuthControllerTest, CaseControllerTest, AnalyticsControllerTest,
#   WorkflowEngineApplicationTests
```

## Pipeline CI/CD

GitHub Actions — `.github/workflows/ci.yml`:
- **Job backend-test**: compile + test (Java 22 + Maven)
- **Job frontend-build**: npm ci + ng build --configuration=production
- **Job docker-build**: docker build de ambas imágenes (requiere jobs anteriores)

## Variables de Entorno

### Backend (`workflow-engine`)
| Variable | Descripción | Default |
|----------|-------------|---------|
| `SPRING_DATA_MONGODB_URI` | URI de conexión MongoDB | `mongodb://localhost:27017/workflow_sw1` |
| `JWT_SECRET` | Clave secreta para firmar JWT | — |
| `ELEVENLABS_API_KEY` | API key ElevenLabs TTS (opcional) | vacío → Web Speech |

### Frontend (`frontend-ng`)
| Variable | Descripción |
|----------|-------------|
| `NG_APP_API_URL` | URL base del backend (default: `/api`) |
