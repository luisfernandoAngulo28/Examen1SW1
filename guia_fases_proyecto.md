# Guía de Fases del Proyecto — Primer Parcial SW1
**Sistema de Gestión de Políticas de Negocio con IA**
**Fecha de entrega:** 28 de abril de 2026 — Documentación hasta las 8:00 am del día 29

> Metodología: **Proceso Unificado (PUDS)** — Booch, Rumbaugh y Jacobson
> Avanzar en el informe = avanzar en el proyecto. Siempre sincronizados.

---

## Fase 1 — Entender el Problema (Inception)

El objetivo de esta fase es tener claro el alcance, los actores y el propósito del sistema antes de diseñar cualquier cosa.

### 1.1 Contexto del negocio
- [ ] Describir el dominio: empresas de servicios (CRE, Cotas, Tigo) con trámites multi-departamento
- [ ] Identificar el problema central: falta de trazabilidad, cuellos de botella y descoordinación entre áreas
- [ ] Definir el propósito del sistema: herramienta para gestionar políticas de negocio (workflow) de forma visual, colaborativa e inteligente

### 1.2 Actores del sistema

El sistema tiene **3 roles humanos** y **1 actor de sistema**:

| # | Actor | Tipo | Responsabilidad | Vista principal |
|---|---|---|---|---|
| 1 | **Administrador / Diseñador de Políticas** | Humano | Crea, modela y edita políticas de negocio, gestiona departamentos, usuarios y formularios | Editor de políticas (drag & drop + IA) |
| 2 | **Funcionario** | Humano | Ejecuta actividades asignadas, avanza trámites, llena formularios (manual o por voz) | Bandeja de tareas con semáforo visual |
| 3 | **Cliente** | Humano | Consulta el estado y seguimiento de sus propios trámites en curso | Panel de seguimiento de trámites (solo lectura) |
| — | **Agente IA** | Sistema | Opera en segundo plano: genera diagramas por NLP, detecta cuellos de botella, asiste al usuario | — |

> **Nota clave sobre el Cliente:** No ejecuta actividades ni toma decisiones en el flujo. Solo puede ver en qué etapa está su trámite, en qué departamento se encuentra y una estimación de tiempo restante. Es el equivalente al bot de seguimiento mencionado en clase.

### 1.3 Los 3 componentes esenciales del sistema

El docente definió explícitamente que el software debe tener exactamente **3 piezas**:

| # | Componente | Descripción | Para quién |
|---|---|---|---|
| 1 | **Editor visual** | Herramienta drag & drop estilo Enterprise Architect para diseñar políticas de negocio. Sin formularios — solo el diagrama. | Administrador |
| 2 | **Motor de workflow** | Código que corre detrás, lee el diseño del administrador y mueve el trámite de funcionario en funcionario automáticamente | Sistema |
| 3 | **Panel / Monitor** | Bandeja de entrada donde al funcionario le llegan sus tareas. Se actualiza solo, sin recargar la página. | Funcionario |

> **Analogía del docente:** el sistema es como **n8n** — un motor de flujo visual donde defines los pasos y el sistema los ejecuta automáticamente.

### 1.4 Aclaración crítica sobre el rol de la IA en el editor

> ⚠️ El docente fue explícito: **la IA NO genera el diagrama por sí sola**. El usuario diseña el diagrama manualmente, pero en vez de usar botones y el mouse, puede hacerlo mediante **prompts de texto o voz**.

Ejemplo correcto:
- "Crear una actividad que diga 'Validar requisitos' en el departamento Técnico"
- "Conectar la actividad A con la actividad B usando flujo condicional"
- "Mover el nodo X hacia arriba"

La IA interpreta la instrucción y ejecuta la acción en el editor. El control sigue siendo del usuario.

### 1.5 Semáforo visual — colores exactos

El docente especificó los colores del monitor del funcionario:

| Color | Estado | Significado |
|---|---|---|
| 🟢 Verde | Nueva / recién llegada | Tarea que acaba de llegar al funcionario |
| 🟡 Amarillo | En proceso | Tarea que el funcionario está atendiendo actualmente |
| 🔴 Rojo | Urgente / atrasada | Tarea que lleva demasiado tiempo sin resolverse |

### 1.6 Visión del sistema
- [ ] Redactar la visión en 1 párrafo: qué hace el sistema, para quién y qué problema resuelve
- [ ] Definir alcance mínimo viable para el día del examen:
  - [ ] Editor visual de políticas con soporte por prompts IA
  - [ ] Motor de workflow que enruta automáticamente
  - [ ] Monitor del funcionario en tiempo real (sin F5)
  - [ ] Formularios por actividad (manual y voz)
  - [ ] Detección de cuellos de botella con IA
  - [ ] Deploy en nube (no localhost)

### 1.7 Ejemplo de demo listo para el día del examen

El docente usó este flujo como ejemplo de referencia — tenerlo listo como política de demo:

**Política: Solicitud de instalación de medidor (CRE)**

```
Atención al Cliente → Departamento Técnico → Departamento de Facturación → Departamento Legal → Almacén
```

Cada departamento es una calle (swimlane). El cliente inicia el trámite, el asesor carga los requisitos, y el motor lo enruta automáticamente hasta el cierre.

### 1.8 Pregunta clave para no perderse
> ¿El sistema permite crear una política de negocio desde cero y ejecutar un trámite de extremo a extremo con múltiples funcionarios en navegadores distintos, sin recargar la página?
> Si la respuesta es sí → el proyecto pasa el examen.

---

## Fase 2 — Análisis (Elaboration — Parte 1)

El análisis define **qué debe hacer el sistema** sin entrar en cómo se va a construir.

### 2.1 Requerimientos funcionales
- [ ] **RF-01** Motor de workflow: gestiona el ciclo de vida de cada trámite
- [ ] **RF-02** Panel de control: visualizar y administrar políticas de negocio
- [ ] **RF-03** Diseño de flujos: secuencial, alternativo, iterativo, paralelo (y combinaciones)
- [ ] **RF-04** Constructor de formularios dinámicos por actividad/nodo
- [ ] **RF-05** Gestión de estados de actividades: Pendiente, En Proceso, Terminado, Bloqueado
- [ ] **RF-06** Priorización de actividades en la bandeja del funcionario
- [ ] **RF-07** Autoprocesado: avanzar el trámite automáticamente si se cumplen condiciones
- [ ] **RF-08** Notificaciones en tiempo real (WebSockets)
- [ ] **RF-09** NLP: generar/modificar diagramas por comandos de voz o texto
- [ ] **RF-10** Edición colaborativa en tiempo real del diagrama
- [ ] **RF-11** Analítica para detectar cuellos de botella (ML / estadística)
- [ ] **RF-12** Recomendaciones de optimización del flujo generadas por IA
- [ ] **RF-13** Asistente virtual con síntesis de voz para guiar al usuario

### 2.2 Requerimientos no funcionales
- [ ] El monitor se actualiza solo, sin recarga manual (WebSockets)
- [ ] Nada de localhost — sistema desplegado 100% en nube
- [ ] APK de Flutter descargable desde Google Drive
- [ ] Seguridad: autenticación JWT, roles diferenciados (ADMIN / OFFICER / CLIENT)
- [ ] Colaborativo: múltiples administradores diseñando la misma política simultáneamente
- [ ] **Una política que tiene trámites activos (en ejecución) NO puede ser editada** — regla de negocio estricta
- [ ] Los formularios deben soportar: texto, etiquetas (labels), campos editables (edits), tablas, carga de imágenes y archivos
- [ ] El Cliente solo puede ver sus propios trámites — no puede ver los de otros usuarios

### 2.3 Diagrama de Contexto (Casos de Uso)
> Elaborar en Enterprise Architect — UML 2.5+
- [ ] Identificar todos los casos de uso por actor
- [ ] No incluir diagramas de secuencia aquí (van en el modelo lógico)
- [ ] Exportar como imagen para el PDF

---

## Fase 3 — Diseño (Elaboration — Parte 2)

El diseño define **cómo se va a construir** el sistema: arquitectura, tecnologías y modelos.

### 3.1 Stack tecnológico definido
| Capa | Tecnología |
|---|---|
| Backend (core) | Spring Boot 3 (Java) |
| Microservicio IA | Python 3 + FastAPI |
| Base de datos | MongoDB (Atlas — cloud) |
| Frontend web | Angular |
| App móvil | Flutter (APK descargable) |
| Despliegue | AWS / Google Cloud / Azure |
| Contenedores | Docker + Docker Compose |
| Versiones | GitHub (colaborativo) |
| Gestión | Jira o Trello |
| Modelado | Enterprise Architect (UML 2.5+) |

### 3.2 Modelo de Arquitectura
> Elaborar en Enterprise Architect — Diagrama de Paquetes o Despliegue
- [ ] Definir la arquitectura: microservicios (Spring Boot + Python FastAPI + Angular + Flutter)
- [ ] Mostrar comunicación entre servicios (REST, WebSocket, eventos)
- [ ] Mostrar base de datos MongoDB por servicio
- [ ] Incluir diagrama de despliegue con contenedores Docker y nube

### 3.3 Modelo de Dominio / Datos
> Elaborar en Enterprise Architect
- [ ] Definir colecciones MongoDB:
  - `users` — id, email, name, role (ADMIN | OFFICER | CLIENT), departmentId
  - `departments` — id, name
  - `policies` — id, name, status (ACTIVE | INACTIVE), nodes[], edges[]
  - `cases` — id, policyId, clientId, status (OPEN | IN_PROGRESS | COMPLETED | CANCELLED), eventLogs[]
  - `tasks` — id, caseId, nodeId, assignedUserId, status (PENDING | IN_PROGRESS | DONE | BLOCKED)
  - `formTemplates` — id, nodeId, fields[] (tipo: text | label | edit | table | image | file)
  - `formSubmissions` — id, taskId, data, inputMode (MANUAL | VOICE | AI)
- [ ] Documentar relaciones entre colecciones
- [ ] El **Cliente** se registra en `users` con role CLIENT y puede consultar los `cases` donde `clientId` coincide con su id

### 3.4 Modelo Lógico (Parte dinámica)
> Elaborar en Enterprise Architect — Diagramas de Secuencia / Actividades / Estado
- [ ] Diagrama de secuencia: iniciar un trámite (caso → primer nodo → tarea asignada)
- [ ] Diagrama de secuencia: completar una tarea y avanzar al siguiente nodo
- [ ] Diagrama de estado: ciclo de vida de un trámite (OPEN → IN_PROGRESS → COMPLETED / CANCELLED)
- [ ] Diagrama de actividades: flujo completo de diseño de política con IA

### 3.5 Diseño de la API (Spring Boot)
Módulos principales a definir:
- [ ] `AuthController` — POST /auth/register, POST /auth/login
- [ ] `DepartmentController` — CRUD de departamentos
- [ ] `PolicyController` — CRUD de políticas + POST /policies/{id}/graph
- [ ] `CaseController` — POST /cases, GET /cases, GET /cases/{id}, POST /cases/{id}/tasks/{taskId}/complete
- [ ] `ClientCaseController` — GET /my-cases (solo trámites del cliente autenticado, solo lectura)
- [ ] `FormController` — CRUD de templates + POST /forms/{nodeId}/submit (con soporte de imágenes)
- [ ] `AnalyticsController` — GET /analytics/bottlenecks

**KPIs sugeridos para cuellos de botella** (el equipo puede definir los suyos):
- Tiempo promedio de atención por nodo/departamento
- Tiempo total del trámite desde inicio hasta cierre
- Nodos con mayor tiempo de espera (diferencia entre creación y inicio de atención)
- Carga por funcionario: cuántas tareas atiende por unidad de tiempo
- Tareas bloqueadas o con estado BLOCKED por más de X horas

### 3.6 Diseño del microservicio IA (Python FastAPI)
- [ ] `POST /ai/parse-prompt` — interpreta texto/voz y devuelve acciones para el diagrama
- [ ] `POST /ai/voice-to-text` — transcribe audio (Whisper API)
- [ ] `POST /ai/bottleneck` — recibe historial de casos y devuelve análisis de cuellos de botella con KPIs

---

## Fase 4 — Implementación (Construction)

> Avanzar por sprints. Ver el archivo `mini_plan_despliegue.md` para el plan diario.

### 4.1 Sprint 1 — Días 1–4 (11–14 abril): Cimientos
- [ ] Proyecto Spring Boot creado con estructura de paquetes completa
- [ ] Conexión Spring Boot → MongoDB Atlas funcionando
- [ ] Entidades/Documents: User, Department, Policy, Case, Task, FormTemplate
- [ ] Auth JWT funcional (registro + login)
- [ ] `ng new frontend` con estructura de módulos, guards e interceptores
- [ ] Login/Register en Angular conectado al backend
- [ ] Proyecto FastAPI creado con `/ai/parse-prompt` básico

### 4.2 Sprint 2 — Días 5–9 (15–19 abril): Lo más importante para la demo
- [ ] CRUD de políticas en Spring Boot
- [ ] Guardar/cargar grafos (nodos + aristas) en MongoDB
- [ ] WebSockets en Spring Boot (STOMP) para eventos en tiempo real
- [ ] Motor de workflow: iniciar caso, avanzar tarea, enrutar al siguiente nodo
- [ ] Editor de políticas en Angular (drag & drop de nodos, conexión de aristas)
- [ ] Dashboard del funcionario en Angular con actualización por WebSocket

### 4.3 Sprint 3 — Días 10–14 (20–24 abril): Funcionalidades avanzadas
- [ ] Formularios dinámicos (CRUD de templates + submit por funcionario)
- [ ] Llenado por voz (Web Speech API en Angular → FastAPI → autocompletar formulario)
- [ ] Analíticas de cuellos de botella (Spring Boot + Python FastAPI)
- [ ] Pantalla de analíticas con gráficos en Angular
- [ ] Integración prompts IA en el editor de políticas (texto y voz)

### 4.4 Sprint 4 — Días 15–17 (25–28 abril): Deploy y cierre
- [ ] Docker Compose con todos los servicios (Spring Boot + FastAPI + Angular + MongoDB)
- [ ] Deploy en Render / Railway / AWS (URL pública, sin localhost)
- [ ] Flutter: pantalla de login + lista de tareas del funcionario + generar APK
- [ ] APK subida a Google Drive
- [ ] Pruebas de integración de extremo a extremo
- [ ] Documentación PDF completa subida a Google Drive antes de las 8am del día 29

---

## Fase 5 — Pruebas (Transition)

### 5.1 Pruebas unitarias
- [ ] Tests del motor de workflow (iniciar caso, avanzar tarea, casos borde)
- [ ] Tests del servicio de analítica (cálculo de KPIs, detección de cuello de botella)
- [ ] Tests de auth (registro, login, token inválido)

### 5.2 Pruebas de integración
- [ ] Crear política → Iniciar caso → Completar tarea → Verificar avance automático
- [ ] Formulario creado en nodo → Funcionario lo llena → Datos guardados correctamente
- [ ] Prompt IA → Nodo creado en editor → Grafo guardado en MongoDB

### 5.3 Prueba clave del día del examen
> Simular lo que el docente va a pedir:
- [ ] Abrir 2 navegadores con usuarios distintos (1 diseñador + 1 funcionario)
- [ ] Crear política de negocio en vivo con el editor
- [ ] Usar prompt de texto o voz para agregar un nodo
- [ ] Iniciar un trámite y ver cómo aparece en el monitor del funcionario sin recargar
- [ ] Funcionario llena formulario (manual o voz)
- [ ] Completar tarea y ver avance automático en el otro navegador
- [ ] Mostrar analíticas con cuello de botella detectado por IA

---

## Checklist de Entrega Final

### Producto de software
- [ ] URL pública funcionando (nada de localhost)
- [ ] APK de Flutter descargable
- [ ] Múltiples usuarios operando simultáneamente en tiempo real
- [ ] Demo de extremo a extremo listo

### Documentación PDF
- [ ] Carátula con datos del equipo
- [ ] Índice 100% navegable con hipervínculos internos
- [ ] **Cap. 1 — Fundamentación Teórica:**
  - [ ] CASE / Herramientas asistidas por computadora
  - [ ] Desarrollo de Software Basado en Componentes
  - [ ] Arquitectura de Software
  - [ ] Proceso Unificado (PUDS)
  - [ ] UML (Lenguaje Unificado de Modelado)
  - [ ] IA para programadores: uso correcto y productivo
  - [ ] Sistemas Workflow
  - [ ] Comparativas de herramientas
- [ ] **Cap. 2 — Proceso de Desarrollo PUDS:**
  - [ ] Fase de Inicio: alcance y visión
  - [ ] Fase de Elaboración: arquitectura y análisis
  - [ ] Fase de Construcción: diagramas + código
  - [ ] Fase de Transición: pruebas y despliegue
- [ ] **4 diagramas UML en Enterprise Architect:**
  - [ ] Modelo de Contexto (Casos de Uso)
  - [ ] Modelo de Arquitectura (Paquetes o Despliegue)
  - [ ] Modelo de Dominio (Datos / MongoDB)
  - [ ] Modelo Lógico (Secuencia, Estado o Actividades)
- [ ] Manual de usuario con capturas reales del sistema
- [ ] Formato APA en todo el documento
- [ ] PDF subido a Google Drive antes de las 8:00 am del día 29

### El día del examen
- [ ] Libro PUDS (digital o impreso) en mano
- [ ] 2 copias impresas de la carátula
- [ ] URL del sistema funcionando
- [ ] URL del APK de Flutter
- [ ] Localhost listo como Plan B por cualquier imprevisto
- [ ] Cada integrante entiende y puede explicar su parte del código
