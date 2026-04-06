# Sistema de Gestión de Políticas de Negocio — WorkflowSW1

> **Materia:** Ingeniería de Software 1 — Primer Parcial S1-2025  
> **Autor:** Luis Fernando Angulo  
> **Repositorio:** [github.com/luisfernandoAngulo28/Examen1SW1](https://github.com/luisfernandoAngulo28/Examen1SW1)

---

## ÍNDICE

- [1. Perfil del Proyecto](#1-perfil-del-proyecto)
  - [1.1 Introducción](#11-introducción)
  - [1.2 Objetivo General](#12-objetivo-general)
  - [1.3 Objetivos Específicos](#13-objetivos-específicos)
  - [1.4 Descripción del Problema](#14-descripción-del-problema)
  - [1.5 Alcance](#15-alcance)
- [Parte I — Fundamentación Teórica](#parte-i--fundamentación-teórica)
  - [1. Ingeniería de Software Asistido por Computadora (CASE)](#1-ingeniería-de-software-asistido-por-computadora-case)
  - [2. Desarrollo de Software Basado en Componentes](#2-desarrollo-de-software-basado-en-componentes)
  - [3. Ingeniería Humana (Experiencia del Usuario — UX)](#3-ingeniería-humana-experiencia-del-usuario--ux)
  - [4. Inteligencia Artificial Aplicada en el Desarrollo del Software](#4-inteligencia-artificial-aplicada-en-el-desarrollo-del-software)
  - [5. IA Integrada en el IDE (Entorno de Desarrollo)](#5-ia-integrada-en-el-ide-entorno-de-desarrollo)
  - [6. El Proceso de Desarrollo de Software (PUDS)](#6-el-proceso-de-desarrollo-de-software-puds)
  - [7. UML](#7-uml)
- [Parte II — Desarrollo del Proyecto](#parte-ii--desarrollo-del-proyecto)
  - [Arquitectura del Sistema](#arquitectura-del-sistema)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Modelo de Datos](#modelo-de-datos)
  - [Módulos del Backend](#módulos-del-backend)
  - [Páginas del Frontend](#páginas-del-frontend)
  - [Despliegue y CI/CD](#despliegue-y-cicd)
  - [Pruebas Automatizadas](#pruebas-automatizadas)

---

## 1. PERFIL DEL PROYECTO

### 1.1 Introducción

En el contexto organizacional moderno, las instituciones públicas y privadas gestionan decenas de *políticas de negocio* que regulan procesos internos: aprobaciones de documentos, trámites ciudadanos, flujos de trabajo interdepartamentales, entre otros. La gestión manual de estos procesos genera ineficiencias, cuellos de botella y falta de trazabilidad.

El presente proyecto, **WorkflowSW1**, propone una solución web integral para **diseñar, ejecutar y monitorear políticas de negocio** mediante diagramas de actividad UML interactivos. El sistema permite a los diseñadores de procesos modelar visualmente los flujos de trabajo con nodos de acción, decisión, bifurcación y unión, mientras que los funcionarios ejecutan las tareas asignadas a través de formularios dinámicos con soporte de voz y reconocimiento óptico de caracteres (OCR).

El proyecto se desarrolló aplicando la metodología **PUDS (Proceso Unificado de Desarrollo de Software)**, utilizando herramientas CASE modernas y principios de ingeniería humana centrados en la experiencia del usuario.

### 1.2 Objetivo General

Desarrollar un sistema web de gestión de políticas de negocio basado en flujos de trabajo (workflow), que permita el diseño visual de procesos mediante diagramas de actividad UML, la ejecución automatizada de trámites y el monitoreo en tiempo real del estado de las tareas, aplicando la metodología PUDS y tecnologías modernas de desarrollo.

### 1.3 Objetivos Específicos

1. **Diseñar e implementar un editor visual** de diagramas de actividad UML con soporte para nodos de tipo Acción, Inicial, Final, Decisión, Bifurcación (Fork) y Unión (Join), utilizando la librería React Flow.
2. **Implementar un motor de ejecución de workflows** que instancie trámites (cases) a partir de políticas, gestione el avance automático entre nodos, soporte flujos condicionales y paralelos, y registre cada evento en una bitácora auditable.
3. **Desarrollar un sistema de formularios dinámicos** con esquema JSON configurable por nodo, que soporte entrada manual, dictado por voz (Web Speech API) y extracción de texto por OCR (Tesseract.js).
4. **Implementar un módulo de monitoreo en tiempo real** mediante WebSocket (Socket.IO) que notifique a los usuarios conectados sobre los avances de los trámites y la asignación de tareas.
5. **Desarrollar un módulo de analítica** con indicadores KPI, detección automática de cuellos de botella y generación de insights con inteligencia artificial.
6. **Aplicar principios de Ingeniería Humana (UX)** para garantizar una interfaz accesible, intuitiva y con retroalimentación visual efectiva (indicadores de semáforo, animaciones, diseño glassmorphism).
7. **Configurar un pipeline de CI/CD** con GitHub Actions y contenerización con Docker para asegurar la calidad y facilitar el despliegue.

### 1.4 Descripción del Problema

Las organizaciones que manejan múltiples trámites departamentales enfrentan los siguientes desafíos:

- **Falta de estandarización:** Los procesos se ejecutan de forma ad-hoc, sin un modelo formal que defina la secuencia de actividades, las condiciones de bifurcación ni los responsables.
- **Ausencia de trazabilidad:** No existe un registro detallado de quién ejecutó cada tarea, cuándo se completó ni qué datos se ingresaron, dificultando las auditorías.
- **Cuellos de botella invisibles:** Sin métricas de desempeño por nodo/departamento, los responsables no pueden identificar dónde se acumulan las tareas pendientes.
- **Comunicación asíncrona:** Los funcionarios no se enteran en tiempo real cuando se les asigna una nueva tarea o cuando un trámite avanza de etapa.
- **Ingreso de datos ineficiente:** Los formularios en papel o en formatos estáticos no aprovechan tecnologías modernas como dictado por voz o extracción automática de texto desde imágenes.

### 1.5 Alcance

El sistema **WorkflowSW1** abarca las siguientes áreas funcionales:

| Área | Descripción |
|------|-------------|
| **Autenticación** | Registro y login con JWT, roles DESIGNER y OFFICER |
| **Departamentos** | CRUD de departamentos organizacionales |
| **Editor de Políticas** | Diseño visual con diagramas de actividad UML (6 tipos de nodo, 4 tipos de flujo, swimlanes por departamento) |
| **Motor de Workflow** | Instanciación de trámites, avance automático, bifurcaciones/uniones, decisiones condicionales |
| **Formularios Dinámicos** | Esquema JSON configurable, entrada manual, voz y OCR |
| **Monitoreo en Tiempo Real** | WebSocket con Socket.IO, feed de eventos en vivo, usuarios conectados |
| **Analítica** | KPIs de gestión, detección de cuellos de botella, gráficos de barras/dona, insights IA |
| **Testing** | 25 pruebas unitarias con Jest (4 suites) |
| **Despliegue** | Docker Compose (3 servicios), CI/CD con GitHub Actions (3 jobs) |

**Limitaciones:**
- El sistema no implementa notificaciones por correo electrónico ni push notifications móviles.
- La IA genera insights basados en reglas heurísticas, no en modelos de machine learning entrenados.
- El OCR está limitado a imágenes con texto claro en español e inglés.

---

## Parte I — Fundamentación Teórica

### 1. Ingeniería de Software Asistido por Computadora (CASE)

La Ingeniería de Software Asistido por Computadora (CASE, por sus siglas en inglés: *Computer-Aided Software Engineering*) engloba el conjunto de herramientas, métodos y técnicas que automatizan o asisten las actividades del ciclo de vida del software.

**Clasificación de herramientas CASE:**

| Tipo | Fase | Ejemplos en el proyecto |
|------|------|------------------------|
| **Upper CASE** | Análisis y diseño | Diagramas UML de actividad (el propio sistema), modelado de datos con Prisma Schema |
| **Lower CASE** | Implementación y pruebas | VS Code + GitHub Copilot, Jest (testing), ESLint (análisis estático) |
| **Integrated CASE** | Ciclo completo | GitHub (repositorio + Actions CI/CD + Issues) |

**Aplicación en el proyecto:**

- **Prisma ORM** actúa como herramienta CASE de modelado de datos: a partir de un esquema declarativo (`schema.prisma`), genera automáticamente el cliente de acceso a datos, las migraciones SQL y los tipos TypeScript.
- **React Flow** funciona como herramienta CASE de modelado visual: permite diseñar diagramas de actividad UML de forma interactiva, con persistencia automática en la base de datos.
- **GitHub Actions** automatiza la integración continua (compilación, testing, análisis) y el despliegue continuo (build de imágenes Docker).
- **ESLint + TypeScript** proporcionan análisis estático de código, detectando errores de tipo y violaciones de estilo antes de la ejecución.

### 2. Desarrollo de Software Basado en Componentes

El Desarrollo Basado en Componentes (CBSD, *Component-Based Software Development*) es un paradigma que promueve la construcción de sistemas a partir de **componentes reutilizables, encapsulados e independientes** que se conectan a través de interfaces bien definidas.

**Principios aplicados:**

- **Encapsulamiento:** Cada módulo del backend (AuthModule, PoliciesModule, CasesModule, etc.) encapsula su propia lógica de negocio, controladores y servicios, exponiéndolos a través de una API REST definida.
- **Reutilización:** Los componentes de React (TrafficLight, DynamicForm, Toast, Layout) se reutilizan en múltiples páginas sin duplicación de código.
- **Composición:** La aplicación se compone jerárquicamente: `App → Layout → Pages → Components`.
- **Independencia:** Los módulos de NestJS se pueden agregar, eliminar o reemplazar sin afectar a los demás, gracias al sistema de inyección de dependencias.

**Arquitectura de componentes del proyecto:**

```
Backend (NestJS - 9 módulos):
├── PrismaModule      → Acceso a datos (compartido)
├── AuthModule        → Autenticación JWT + registro
├── DepartmentsModule → CRUD departamentos
├── PoliciesModule    → CRUD políticas + nodos + aristas
├── CasesModule       → Motor de workflow + tareas
├── FormsModule       → Plantillas + submissions dinámicas
├── EventsModule      → WebSocket Gateway (Socket.IO)
├── AnalyticsModule   → KPIs + cuellos de botella + IA
└── AiAssistantModule → Insights inteligentes

Frontend (React - Componentes):
├── Layout            → Shell con sidebar + contenido
├── TrafficLight      → Indicador visual de estado (semáforo)
├── DynamicForm       → Renderizador de formularios JSON
├── Toast / ToastProvider → Sistema de notificaciones
├── PolicyEditorPage  → Editor visual React Flow
└── 9 páginas funcionales
```

### 3. Ingeniería Humana (Experiencia del Usuario — UX)

La Ingeniería Humana o *Human Factors Engineering* estudia la interacción entre las personas y los sistemas, con el objetivo de diseñar interfaces que sean **eficientes, seguras, accesibles y satisfactorias** de usar.

**Principios de UX aplicados en el proyecto:**

| Principio | Implementación |
|-----------|---------------|
| **Visibilidad del estado del sistema** | Semáforo (TrafficLight) en cada tarea: rojo = bloqueado, amarillo = en progreso, verde = completado. Indicador de usuarios conectados en tiempo real. |
| **Correspondencia con el mundo real** | Diagramas de actividad UML familiares para diseñadores de procesos. Swimlanes por departamento como en la notación estándar. |
| **Control y libertad del usuario** | Botón de cancelar trámite, formularios expandibles/colapsables, filtros en la bandeja del funcionario. |
| **Consistencia y estándares** | Sistema de diseño unificado con variables CSS (colores, tipografía, espaciado, bordes), iconografía consistente con Lucide React. |
| **Prevención de errores** | Validación de formularios con ValidationPipe (backend) y required/type en inputs (frontend). Confirmaciones antes de acciones destructivas. |
| **Reconocimiento antes que recuerdo** | Badges de estado con colores semánticos, iconos descriptivos en cada botón y sección. |
| **Flexibilidad y eficiencia** | Dictado por voz para llenado rápido de formularios, OCR para extracción automática de texto desde imágenes. |
| **Diseño estético y minimalista** | Interfaz glassmorphism para login, KPIs con hover animations, tipografía Inter, gradientes sutiles. |
| **Retroalimentación** | Toasts con animaciones para cada acción (éxito, error, info), estados de carga con spinners. |

**Tecnologías de UX implementadas:**

- **Web Speech API:** Reconocimiento de voz nativo del navegador para dictado en formularios.
- **Tesseract.js:** OCR en el navegador para extraer texto de imágenes (español + inglés).
- **Socket.IO:** Eventos en tiempo real que actualizan la interfaz sin necesidad de refresh.
- **CSS Design System:** Variables CSS con 30+ tokens, transiciones suaves (`cubic-bezier`), efecto glassmorphism con `backdrop-filter: blur()`.

### 4. Inteligencia Artificial Aplicada en el Desarrollo del Software

La Inteligencia Artificial (IA) se integra en el desarrollo de software moderno en dos dimensiones: como **herramienta de asistencia al desarrollador** y como **funcionalidad dentro del producto final**.

**IA como funcionalidad del producto (WorkflowSW1):**

El módulo **AiAssistantModule** del backend genera insights inteligentes sobre el desempeño de los flujos de trabajo:

- **Detección de cuellos de botella:** Analiza la duración promedio y las tareas pendientes por nodo. Cuando un nodo supera el umbral de 2 tareas pendientes o una duración excesiva, se clasifica como cuello de botella.
- **Generación de recomendaciones:** Basado en los patrones detectados, el sistema genera mensajes categorizados por severidad (critical, warning, info, success) con acciones recomendadas específicas.
- **Análisis de completitud:** Calcula la tasa de trámites completados vs. activos y genera alertas cuando la eficiencia cae por debajo de umbrales definidos.

**Ejemplo de insight generado:**
```
[CRITICAL] El nodo "Revisión Legal" tiene 5 tareas pendientes y un promedio de 45 min.
→ Recomendación: Asignar un funcionario adicional al departamento Legal.
```

**IA como herramienta de desarrollo:**

- **GitHub Copilot:** Se utilizó como asistente de codificación integrado en VS Code para generar código, corregir errores, escribir tests y crear documentación.
- **Análisis estático con IA:** TypeScript + ESLint proporcionan inferencia de tipos y detección de errores potenciales antes de la compilación.

### 5. IA Integrada en el IDE (Entorno de Desarrollo)

El desarrollo de WorkflowSW1 se realizó con **Visual Studio Code** como IDE principal, aprovechando la integración nativa de **GitHub Copilot** como asistente de IA.

**Capacidades utilizadas de GitHub Copilot:**

| Capacidad | Uso en el proyecto |
|-----------|--------------------|
| **Code Completion** | Autocompletado inteligente de funciones, interfaces TypeScript, queries Prisma y estilos CSS. |
| **Chat / Agent Mode** | Consultas interactivas sobre arquitectura, debugging de errores, y generación de módulos completos. |
| **Multi-file Editing** | Edición coordinada de múltiples archivos (ej: extracción de Toast.tsx en 3 archivos para Fast Refresh compatibility). |
| **Terminal Commands** | Ejecución de comandos de build, test y deploy directamente desde el chat. |
| **Error Fixing** | Corrección de 68 errores de TypeScript/ESLint en una sola sesión (types `any` → interfaces tipadas). |
| **Refactoring** | Reemplazo de ~30 emojis por iconos SVG de Lucide React en 11 archivos. |
| **Documentation** | Generación de esta documentación técnica con conocimiento del código fuente. |

**Extensiones complementarias del IDE:**

- **Prisma:** Sintaxis highlighting y autocompletado para `schema.prisma`.
- **ESLint:** Análisis estático de código en tiempo real.
- **Docker:** Gestión de contenedores y validación de `docker-compose.yml`.
- **GitLens:** Visualización avanzada del historial de Git.

### 6. El Proceso de Desarrollo de Software (PUDS)

El **Proceso Unificado de Desarrollo de Software** (PUDS) es un marco de trabajo iterativo e incremental para el desarrollo de software, basado en la arquitectura y dirigido por casos de uso.

**Fases del PUDS aplicadas al proyecto:**

#### Fase 1 — Inicio (Inception)
- Definición del problema: gestión manual de políticas de negocio.
- Identificación de actores: Diseñador de Procesos (DESIGNER) y Funcionario (OFFICER).
- Alcance: sistema web con editor visual, motor de workflow, formularios dinámicos y monitoreo.
- Evaluación de riesgos: complejidad del motor de workflow con flujos paralelos.

#### Fase 2 — Elaboración (Elaboration)
- Diseño de la arquitectura: cliente-servidor con NestJS + React + PostgreSQL.
- Modelado de datos: 10 entidades con relaciones y claves foráneas en Prisma.
- Prototipado del editor visual con React Flow.
- Definición de la API REST: endpoints para cada módulo.

#### Fase 3 — Construcción (Construction)
- **Iteración 1:** Autenticación JWT + CRUD de departamentos y políticas.
- **Iteración 2:** Editor visual de diagramas UML con persistencia.
- **Iteración 3:** Motor de workflow (instanciación, avance, bifurcaciones).
- **Iteración 4:** Formularios dinámicos con voz y OCR.
- **Iteración 5:** Monitoreo en tiempo real con WebSocket.
- **Iteración 6:** Analítica, cuellos de botella e insights IA.
- **Iteración 7:** Testing, Docker, CI/CD.
- **Iteración 8:** Pulido UI/UX — diseño glassmorphism, iconos Lucide, animaciones.

#### Fase 4 — Transición (Transition)
- Contenerización con Docker Compose (3 servicios).
- Pipeline CI/CD con GitHub Actions (3 jobs: test, build frontend, build Docker).
- Documentación técnica del sistema.

**Artefactos generados:**

| Artefacto PUDS | Equivalente en el proyecto |
|----------------|---------------------------|
| Modelo de Casos de Uso | Rutas del frontend (App.tsx) + endpoints del backend |
| Modelo de Datos | `schema.prisma` (10 modelos, 6 enums) |
| Modelo de Arquitectura | Diagrama cliente-servidor + módulos NestJS |
| Plan de Iteración | Commits progresivos en GitHub |
| Documento de Pruebas | 25 tests unitarios (Jest, 4 suites) |

### 7. UML

El **Lenguaje Unificado de Modelado** (UML, *Unified Modeling Language*) es un lenguaje estándar de modelado visual para especificar, construir y documentar los artefactos de un sistema software.

**Diagramas UML en el proyecto:**

#### 7.1 Diagrama de Actividad (core del sistema)

El corazón de WorkflowSW1 es el **diagrama de actividad UML**, implementado como un editor visual interactivo. Los elementos soportados son:

| Elemento UML | Nodo en el sistema | Representación |
|--------------|-------------------|----------------|
| **Nodo Inicial** | `INITIAL` | Círculo negro sólido |
| **Nodo Final** | `FINAL` | Círculo negro con borde |
| **Acción** | `ACTION` | Rectángulo redondeado con título |
| **Decisión** | `DECISION` | Rombo con condiciones en las aristas |
| **Bifurcación (Fork)** | `FORK` | Barra horizontal — divide flujo en paralelo |
| **Unión (Join)** | `JOIN` | Barra horizontal — sincroniza flujos paralelos |
| **Swimlane** | Departamento | Carril vertical por departamento |

**Tipos de flujo entre nodos:**

| Tipo de flujo | Enum | Descripción |
|---------------|------|-------------|
| Secuencial | `SEQUENTIAL` | Flujo lineal de una actividad a la siguiente |
| Condicional | `CONDITIONAL` | Flujo que depende de una condición (desde nodos DECISION) |
| Iterativo | `ITERATIVE` | Flujo que permite repetición de actividades |
| Paralelo | `PARALLEL` | Flujo simultáneo (desde nodos FORK, hasta nodos JOIN) |

#### 7.2 Diagrama de Clases (modelo de datos)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │  Department  │     │   Policy     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ email        │◄────│ name         │     │ name         │
│ name         │     │ users[]      │────►│ status       │
│ role         │     │ nodes[]      │     │ createdBy    │
│ departmentId │     └──────────────┘     │ nodes[]      │
│ tasks[]      │                          │ edges[]      │
└──────────────┘                          │ cases[]      │
                                          └──────┬───────┘
                                                 │
                    ┌────────────────────────────┼────────────────────┐
                    ▼                            ▼                    ▼
           ┌──────────────┐            ┌──────────────┐     ┌──────────────┐
           │  PolicyNode  │            │  PolicyEdge  │     │    Case      │
           ├──────────────┤            ├──────────────┤     ├──────────────┤
           │ id           │            │ id           │     │ id           │
           │ nodeType     │◄───────────│ fromNodeId   │     │ status       │
           │ title        │◄───────────│ toNodeId     │     │ currentNodeId│
           │ posX, posY   │            │ flowType     │     │ tasks[]      │
           │ departmentId │            │ conditionLabel│    │ eventLogs[]  │
           │ formTemplate │            └──────────────┘     └──────┬───────┘
           └──────────────┘                                        │
                    │                                              ▼
                    │                                     ┌──────────────┐
                    │                                     │    Task      │
                    │                                     ├──────────────┤
                    └────────────────────────────────────►│ id           │
                                                          │ nodeId       │
                                                          │ status       │
                                                          │ assignedUser │
                                                          │ formSubmission│
                                                          └──────┬───────┘
                                                                 │
                                          ┌──────────────────────┼──────────────┐
                                          ▼                                     ▼
                                 ┌────────────────┐                   ┌──────────────┐
                                 │ FormSubmission  │                   │  EventLog    │
                                 ├────────────────┤                   ├──────────────┤
                                 │ payloadJson    │                   │ type         │
                                 │ inputMode      │                   │ payloadJson  │
                                 └────────────────┘                   │ createdAt    │
                                                                      └──────────────┘
```

#### 7.3 Diagrama de Casos de Uso

**Actor: Diseñador de Procesos (DESIGNER)**
- Crear, editar y eliminar políticas de negocio
- Diseñar diagramas de actividad con el editor visual
- Configurar formularios dinámicos por nodo
- Crear departamentos y registrar usuarios
- Iniciar trámites desde una política
- Visualizar analíticas y cuellos de botella
- Monitorear trámites en tiempo real

**Actor: Funcionario (OFFICER)**
- Visualizar bandeja de tareas asignadas
- Filtrar tareas (todas, propias, sin asignar)
- Completar tareas (con formularios, voz, OCR)
- Tomar decisiones en nodos de tipo DECISION
- Ser asignado a tareas por el diseñador

---

## Parte II — Desarrollo del Proyecto

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                 │
│  React 19 + Vite 8 + TypeScript + React Flow        │
│  Puerto: 5173                                        │
└──────────────────────┬────────────────┬─────────────┘
                       │ HTTP/REST      │ WebSocket
                       ▼                ▼
┌─────────────────────────────────────────────────────┐
│                 SERVIDOR (Backend)                    │
│  NestJS 11 + Prisma ORM 6 + JWT + Socket.IO         │
│  Puerto: 3000                                        │
│  9 módulos: Auth, Departments, Policies, Cases,      │
│             Forms, Events, Analytics, AI, Prisma     │
└──────────────────────┬──────────────────────────────┘
                       │ TCP :5432
                       ▼
┌─────────────────────────────────────────────────────┐
│                 BASE DE DATOS                        │
│  PostgreSQL 16 — Base: workflow_sw1                   │
│  10 tablas + 6 enums                                 │
└─────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Frontend** | React | 19.2 | UI declarativa con componentes |
| | TypeScript | 5.x | Tipado estático |
| | Vite | 8.0 | Bundler y dev server |
| | React Router | 7.14 | Enrutamiento SPA |
| | React Flow (@xyflow/react) | 12.10 | Editor de diagramas |
| | Lucide React | 1.7 | Iconografía SVG |
| | Tesseract.js | 7.0 | OCR en navegador |
| | Socket.IO Client | 4.8 | WebSocket (cliente) |
| | Axios | 1.14 | Cliente HTTP |
| **Backend** | NestJS | 11.0 | Framework backend modular |
| | Prisma | 6.19 | ORM + migraciones |
| | Passport + JWT | 11/4 | Autenticación stateless |
| | Socket.IO | 4.8 | WebSocket (servidor) |
| | bcrypt | 6.0 | Hashing de contraseñas |
| | class-validator | 0.15 | Validación de DTOs |
| **Base de Datos** | PostgreSQL | 16 | Base de datos relacional |
| **DevOps** | Docker Compose | — | Orquestación de contenedores |
| | GitHub Actions | — | CI/CD pipeline |
| | Jest | 30 | Testing unitario |
| | ESLint | 9 | Análisis estático de código |

### Modelo de Datos

El sistema utiliza **10 modelos** y **6 enums** definidos en Prisma Schema:

**Enumeraciones:**
- `Role`: DESIGNER, OFFICER
- `PolicyStatus`: ACTIVE, INACTIVE
- `NodeType`: ACTION, INITIAL, FINAL, DECISION, FORK, JOIN
- `FlowType`: SEQUENTIAL, CONDITIONAL, ITERATIVE, PARALLEL
- `TaskStatus`: PENDING, IN_PROGRESS, DONE, BLOCKED
- `CaseStatus`: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- `InputMode`: MANUAL, VOICE, AI

**Tablas principales:**

| Tabla | Campos clave | Relaciones |
|-------|-------------|------------|
| `users` | id, email, name, role, departmentId | → Department, → Task[] |
| `departments` | id, name | → User[], → PolicyNode[] |
| `policies` | id, name, status, createdBy | → PolicyNode[], PolicyEdge[], Case[] |
| `policy_nodes` | id, policyId, departmentId, nodeType, title, posX, posY | → Policy, Department, FormTemplate?, Task[] |
| `policy_edges` | id, policyId, fromNodeId, toNodeId, flowType, conditionLabel | → Policy, PolicyNode (from/to) |
| `cases` | id, policyId, currentNodeId, status | → Policy, Task[], EventLog[] |
| `tasks` | id, caseId, nodeId, assignedUserId, status | → Case, PolicyNode, User?, FormSubmission? |
| `form_templates` | id, nodeId, schemaJson | → PolicyNode (1:1) |
| `form_submissions` | id, taskId, payloadJson, inputMode | → Task (1:1) |
| `event_logs` | id, caseId, type, payloadJson | → Case |

### Módulos del Backend

| # | Módulo | Endpoints principales | Descripción |
|---|--------|----------------------|-------------|
| 1 | **AuthModule** | `POST /auth/login`, `POST /auth/register`, `GET /auth/profile`, `GET /auth/users` | Autenticación JWT con Passport, registro con hashing bcrypt, guard de rutas |
| 2 | **DepartmentsModule** | `GET /departments`, `POST /departments`, `DELETE /departments/:id` | CRUD de departamentos con relación a usuarios |
| 3 | **PoliciesModule** | `GET /policies`, `POST /policies`, `GET /policies/:id`, `PUT /policies/:id`, `DELETE /policies/:id` | Gestión completa de políticas con nodos y aristas (sync del editor) |
| 4 | **CasesModule** | `POST /cases`, `GET /cases`, `GET /cases/:id`, `POST /cases/tasks/:id/complete`, `PATCH /cases/tasks/:id/assign`, `PATCH /cases/:id/cancel`, `GET /cases/my-tasks` | Motor de workflow: instanciación, avance automático, fork/join, decisiones |
| 5 | **FormsModule** | `GET /forms/template/:nodeId`, `POST /forms/template/:nodeId`, `POST /forms/submit/:taskId`, `GET /forms/submission/:taskId` | Plantillas JSON Schema + submissions con modo de entrada |
| 6 | **EventsModule** | WebSocket Gateway | Eventos en tiempo real: `case:started`, `task:completed`, `task:assigned`, `case:completed`, `users:online` |
| 7 | **AnalyticsModule** | `GET /analytics/dashboard`, `GET /analytics/policy/:id` | KPIs globales + análisis por política con detección de cuellos de botella |
| 8 | **AiAssistantModule** | Integrado en Analytics | Generación de insights con severidad y recomendaciones |
| 9 | **PrismaModule** | (servicio interno) | Servicio singleton de acceso a la base de datos |

### Páginas del Frontend

| # | Página | Ruta | Rol | Descripción |
|---|--------|------|-----|-------------|
| 1 | **LoginPage** | `/login` | Público | Formulario de inicio de sesión con diseño glassmorphism |
| 2 | **RegisterPage** | `/register` | Público | Registro de nuevos usuarios con selección de rol y departamento |
| 3 | **DashboardPage** | `/` | DESIGNER | KPIs del sistema + tabla de políticas con acciones |
| 4 | **OfficerDashboardPage** | `/` | OFFICER | Bandeja de trabajo con KPIs + filtros + tabla de tareas |
| 5 | **DepartmentsPage** | `/departments` | Todos | CRUD de departamentos organizacionales |
| 6 | **PolicyEditorPage** | `/policies/:id/editor` | DESIGNER | Editor visual de diagramas UML con React Flow, swimlanes, IA |
| 7 | **CasesPage** | `/policies/:policyId/cases` | Todos | Lista de trámites de una política con estados |
| 8 | **CaseDetailPage** | `/cases/:id` | Todos | Detalle del trámite: tareas, formularios, asignaciones, historial |
| 9 | **MonitorPage** | `/monitor` | Todos | Monitor en tiempo real con WebSocket + feed de eventos |
| 10 | **AnalyticsPage** | `/analytics` | Todos | Dashboard analítico con gráficos, cuellos de botella e insights IA |

### Despliegue y CI/CD

#### Docker Compose — 3 servicios

```yaml
services:
  db:        # PostgreSQL 16 Alpine — puerto 5432
  backend:   # NestJS 11 — puerto 3000 (prisma migrate + node dist/main.js)
  frontend:  # React + Nginx — puerto 5173→80
```

#### GitHub Actions — Pipeline CI/CD

```
Push/PR a main
    ├── Job 1: backend-test
    │   ├── PostgreSQL 16 (servicio)
    │   ├── npm install + prisma generate
    │   ├── jest --coverage
    │   └── npm run build
    │
    ├── Job 2: frontend-build
    │   ├── npm install
    │   ├── tsc (type check)
    │   └── vite build
    │
    └── Job 3: docker-build (depende de 1 + 2)
        ├── docker build ./backend
        └── docker build ./frontend
```

### Pruebas Automatizadas

El backend cuenta con **25 pruebas unitarias** organizadas en **4 suites** de Jest:

| Suite | Tests | Descripción |
|-------|-------|-------------|
| **AuthService** | Tests de registro, login, hashing, validación JWT | Verifica autenticación completa |
| **PoliciesService** | Tests de CRUD de políticas, nodos y aristas | Verifica persistencia del editor |
| **CasesService** | Tests del motor de workflow, avance, fork/join | Verifica ejecución de trámites |
| **AnalyticsService** | Tests de KPIs y detección de cuellos de botella | Verifica cálculos analíticos |

**Ejecución:**
```bash
cd backend
npx jest --passWithNoTests
```

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Diseñador | `admin@test.com` | `123456` |
| Funcionario | `funcionario@test.com` | `123456` |

## Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/luisfernandoAngulo28/Examen1SW1.git
cd Examen1SW1

# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev    # http://localhost:3000

# 3. Frontend (nueva terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173

# 4. O con Docker
docker-compose up --build
```

**Variables de entorno del backend** (`.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workflow_sw1"
JWT_SECRET="sw1-secret-key-2025"
```

---

> **Nota:** Esta documentación fue generada con asistencia de GitHub Copilot (IA integrada en el IDE) como parte de la demostración del uso de inteligencia artificial aplicada al desarrollo de software.
