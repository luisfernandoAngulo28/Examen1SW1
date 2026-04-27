# Decisiones del Proyecto — Primer Parcial SW1
**Sistema de Gestión de Políticas de Negocio con Workflow Engine**
Editor visual de diagramas UML, motor de flujo, monitor en tiempo real, analytics y asistente IA.
**Fecha límite de entrega:** 28 de abril de 2026

> Este archivo centraliza todas las decisiones técnicas, de equipo y de infraestructura.
> Actualizar cada campo apenas se tome la decisión.

---

## 1. Equipo y División de Trabajo

| Integrante | Track principal | Responsabilidad |
|---|---|---|
| **Luis Fernando Angulo Heredia** | Full Stack completo | Spring Boot, Angular, FastAPI, Flutter, MongoDB, Documentación, Deploy |

> Proyecto individual. Luis Fernando es responsable de todos los módulos.
> Stack: Spring Boot · Angular · FastAPI · Flutter · MongoDB

---

## 2. Repositorio y Control de Versiones

| Decisión | Valor |
|---|---|
| Plataforma | GitHub |
| Nombre del repositorio | `Examen1-workflow-sw1` |
| URL del repositorio | https://github.com/luisfernandoAngulo28/Examen1-workflow-sw1.git |
| Estrategia de ramas | `main` (producción) / `dev` (integración) / `feature/nombre-tarea` (trabajo individual) |
| Quién crea el repo | Luis Fernando Angulo Heredia |
| Quiénes tienen acceso como colaboradores | 1 integrante (proyecto individual) |

### Comandos de inicialización del repo
```bash
echo "# Examen1-workflow-sw1" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/luisfernandoAngulo28/Examen1-workflow-sw1.git
git push -u origin main
```

### Convención de commits
```
feat: descripción corta      ← nueva funcionalidad
fix: descripción corta       ← corrección de bug
docs: descripción corta      ← cambio en documentación
chore: descripción corta     ← configuración, dependencias
```

---

## 3. Stack Tecnológico — Versiones exactas

| Capa | Tecnología | Versión | Responsable |
|---|---|---|---|
| Backend core | Spring Boot | 3.2.x | Luis Fernando Angulo Heredia |
| Lenguaje backend | Java | 21 LTS | Luis Fernando Angulo Heredia |
| Build tool | Maven | 3.9+ | Luis Fernando Angulo Heredia |
| Microservicio IA | Python + FastAPI | Python 3.11 / FastAPI 0.110+ | Luis Fernando Angulo Heredia |
| Base de datos | MongoDB Atlas | M0 (free tier) | Luis Fernando Angulo Heredia |
| Frontend web | Angular | 17 o 18 | Luis Fernando Angulo Heredia |
| App móvil | Flutter | 3.x estable | Luis Fernando Angulo Heredia |
| Contenedores | Docker + Docker Compose | Docker Desktop latest | Luis Fernando Angulo Heredia |
| IDE único | VS Code | ya instalado | Luis Fernando Angulo Heredia |
| Modelado UML | Enterprise Architect | con licencia ✅ | Luis Fernando Angulo Heredia |

> **Nota:** Se usa **VS Code** como único IDE (tanto para Spring Boot con extensiones Java como para Angular, FastAPI y Flutter). IntelliJ IDEA no es necesario.

---

## 4. Infraestructura Cloud

### 4.1 Base de datos — MongoDB Atlas
| Campo | Valor |
|---|---|
| Tier | M0 (gratuito) |
| Región | AWS Sao Paulo (sa-east-1) |
| Nombre de la base de datos | `workflow_sw1` |
| Quién crea la cuenta | Luis Fernando Angulo Heredia |
| Connection string | `mongodb+srv://fernandofa671_db_user:<PASSWORD>@cluster0.opii5qm.mongodb.net/workflow_sw1?retryWrites=true&w=majority&appName=Cluster0` (guardar en .env, NO subir a GitHub) |
| Estado | ☐ Pendiente / ☑ Creada |

> Nota de seguridad: la contraseña se vio en pantalla durante la configuración. Se debe regenerar en Atlas (Database Access > Edit user > Reset password) y actualizar la URI local.

### 4.2 Deploy — Backend (Spring Boot)
| Campo | Valor |
|---|---|
| Plataforma elegida | ☐ Render.com  ☐ Railway  ☐ AWS  ☐ GCP  ☐ Azure |
| URL del servicio | `______________________` |
| Puerto | 8080 |
| Quién lo configura | `______________________` |
| Estado | ☐ Pendiente / ☐ Desplegado |

### 4.3 Deploy — Microservicio IA (FastAPI)
| Campo | Valor |
|---|---|
| Plataforma elegida | ☐ Render.com  ☐ Railway  ☐ Hugging Face Spaces |
| URL del servicio | `______________________` |
| Puerto | 8000 |
| Quién lo configura | `______________________` |
| Estado | ☐ Pendiente / ☐ Desplegado |

### 4.4 Deploy — Frontend (Angular)
| Campo | Valor |
|---|---|
| Plataforma elegida | ☐ Render.com  ☐ Vercel  ☐ Netlify  ☐ Firebase |
| URL pública | `______________________` |
| Quién lo configura | `______________________` |
| Estado | ☐ Pendiente / ☐ Desplegado |

### 4.5 App móvil (Flutter)
| Campo | Valor |
|---|---|
| Formato de entrega | APK descargable |
| Dónde se sube el APK | Google Drive |
| URL de descarga del APK | `______________________` |
| Quién lo genera | `______________________` |
| Estado | ☐ Pendiente / ☐ Generado |

---

## 5. Variables de Entorno

> ⚠️ NUNCA subir estos valores a GitHub. Usar `.env` en local y variables de entorno en el servicio cloud.

### Spring Boot (`application.properties` o `.env`)
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/workflow_sw1
JWT_SECRET=<clave_secreta_min_32_chars>
AI_SERVICE_URL=http://ai-service:8000
PORT=8080
```

### FastAPI (`.env`)
```
OPENAI_API_KEY=<key_si_usan_whisper_o_gpt>
PORT=8000
```

### Angular (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};
```

---

## 6. Estructura del Repositorio

```
workflow-sw1-v2/
├── backend/                ← Spring Boot
│   ├── src/main/java/...
│   ├── pom.xml
│   └── Dockerfile
├── ai-service/             ← Python FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               ← Angular
│   ├── src/
│   ├── angular.json
│   └── Dockerfile
├── mobile/                 ← Flutter
│   ├── lib/
│   └── pubspec.yaml
├── docs/                   ← PDF, diagramas Enterprise Architect
│   ├── diagramas/
│   └── documentacion.pdf
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 7. Gestión del Proyecto

| Campo | Valor |
|---|---|
| Herramienta elegida | ☐ Jira  ☐ Trello  ☐ GitHub Projects |
| URL del tablero | `______________________` |
| Quién lo crea | `______________________` |
| Estado | ☐ Pendiente / ☐ Creado |

### Columnas del tablero Kanban
- **Backlog** — tareas pendientes
- **En progreso** — tarea que alguien está haciendo ahora
- **En revisión** — listo para que otro integrante lo revise
- **Hecho** — completado y mergeado a `dev`

---

## 8. Documentación PDF

| Campo | Valor |
|---|---|
| Quién redacta Cap. 1 (Fundamentación Teórica) | `______________________` |
| Quién redacta Cap. 2 (PUDS — 4 fases) | `______________________` |
| Quién hace los diagramas UML en Enterprise Architect | `______________________` |
| Quién hace el manual de usuario | `______________________` |
| Quién arma el PDF final (carátula + índice + todo) | `______________________` |
| Herramienta para el PDF | ☐ Word  ☐ LaTeX  ☐ Google Docs |
| URL de Google Drive donde se sube | `______________________` |
| Fecha límite interna de borrador | `______________________` |
| Fecha límite de entrega oficial | **29 de abril a las 8:00 am** |

---

## 9. Decisiones Técnicas Clave

| Decisión | Opciones | Elegida | Razón |
|---|---|---|---|
| Motor de WebSockets en Spring Boot | Spring WebSocket + STOMP / raw WebSocket | `______________` | |
| Librería drag & drop Angular | Angular CDK / ngx-graph / GoJS | `______________` | |
| NLP en FastAPI | rule-based propio / OpenAI GPT / Gemini | `______________` | |
| Voz a texto | Web Speech API (gratis) / Whisper API (OpenAI) | `______________` | |
| Analítica cuellos de botella | estadística propia (media + sigma) / ML scikit-learn | `______________` | |
| Autenticación JWT en Spring | Spring Security + jjwt / Spring Security + nimbus | `______________` | |
| Formato de comunicación IA | Spring Boot llama a FastAPI por REST | confirmado | arquitectura de microservicios |

---

## 10. Checklist de Arranque (Sprint 0 — Hoy)

### Cuentas y servicios
- [ ] Cuenta GitHub del equipo / repo creado y compartido
- [ ] Cuenta MongoDB Atlas creada — connection string disponible
- [ ] Cuenta Render.com (u otra plataforma) creada
- [ ] Cuenta Google Drive del equipo para PDF y APK
- [ ] Tablero Jira / Trello creado con columnas Kanban

### Instalaciones locales (cada integrante)
- [ ] Java 21 instalado (`java -version`)
- [ ] Maven instalado (`mvn -version`)
- [ ] IntelliJ IDEA instalado
- [ ] Angular CLI instalado (`ng version`)
- [ ] Python 3.11+ instalado (`python --version`)
- [ ] Flutter SDK instalado (`flutter doctor`)
- [ ] MongoDB Compass instalado
- [ ] Enterprise Architect instalado
- [ ] Docker Desktop corriendo (`docker ps`)

### Estructura base
- [ ] Repositorio clonado localmente por todos
- [ ] Ramas creadas: `main`, `dev`, `feature/backend-auth`, `feature/frontend-setup`, `feature/ai-service`
- [ ] `docker-compose.yml` base creado con los 4 servicios
- [ ] `.gitignore` correcto (excluye `.env`, `target/`, `node_modules/`, `__pycache__/`)
- [ ] Variables de entorno definidas y documentadas aquí (sección 5)

---

## 11. Registro de Decisiones Tomadas

> Completar a medida que el equipo decide. Fecha + decisión + quién la tomó.

| Fecha | Decisión | Tomada por |
|---|---|---|
| | | |
| | | |
| | | |
