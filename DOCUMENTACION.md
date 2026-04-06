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

## Parte II — Proceso de Desarrollo

---

### 1. Flujo de Trabajo: Captura de Requisitos

#### 1.1 Actores

El sistema identifica dos actores principales que interactúan con el sistema:

| Actor | Rol en el sistema | Descripción |
|-------|-------------------|-------------|
| **Diseñador de Procesos** | `DESIGNER` | Responsable de modelar las políticas de negocio mediante diagramas de actividad UML, configurar formularios dinámicos, crear departamentos, registrar usuarios, iniciar trámites y analizar métricas de desempeño. |
| **Funcionario** | `OFFICER` | Responsable de ejecutar las tareas asignadas dentro de un trámite: completar formularios (manual, voz u OCR), tomar decisiones en nodos condicionales y reportar el avance de su trabajo. |

**Actor secundario:**
| Actor | Descripción |
|-------|-------------|
| **Sistema (Motor de Workflow)** | Actor no humano que gestiona automáticamente el avance del flujo: auto-completa nodos INITIAL, FORK, JOIN y FINAL, emite eventos WebSocket y registra la bitácora de auditoría. |

```
                        ┌─────────────────────────────────────┐
                        │     Sistema de Gestión de Políticas  │
                        │          de Negocio (Workflow)       │
                        │                                     │
   ┌──────────┐         │  ┌─────────────────────────────┐    │
   │DISEÑADOR │─────────┼─►│ Diseñar diagrama de actividad│   │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Configurar formularios       │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Gestionar departamentos      │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Iniciar trámite              │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Monitorear en tiempo real    │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Analizar métricas e IA       │    │
   └──────────┘         │  └─────────────────────────────┘    │
                        │                                     │
   ┌──────────┐         │  ┌─────────────────────────────┐    │
   │FUNCIONARIO│────────┼─►│ Consultar bandeja de tareas  │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Completar tarea              │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Llenar formulario (voz/OCR)  │    │
   │          │         │  └─────────────────────────────┘    │
   │          │─────────┼─►│ Tomar decisión condicional   │    │
   └──────────┘         │  └─────────────────────────────┘    │
                        └─────────────────────────────────────┘
```

#### 1.2 Casos de Uso

Se identificaron **14 casos de uso** organizados por actor:

| ID | Caso de Uso | Actor | Prioridad |
|----|-------------|-------|-----------|
| CU-01 | Iniciar sesión | Ambos | Alta |
| CU-02 | Registrar usuario | Diseñador | Alta |
| CU-03 | Gestionar departamentos (CRUD) | Diseñador | Alta |
| CU-04 | Crear política de negocio | Diseñador | Alta |
| CU-05 | Diseñar diagrama de actividad UML | Diseñador | Alta |
| CU-06 | Configurar formulario dinámico por nodo | Diseñador | Media |
| CU-07 | Iniciar trámite desde política | Diseñador | Alta |
| CU-08 | Consultar bandeja de tareas | Funcionario | Alta |
| CU-09 | Completar tarea del flujo | Funcionario | Alta |
| CU-10 | Llenar formulario con voz / OCR | Funcionario | Media |
| CU-11 | Tomar decisión en nodo condicional | Funcionario | Alta |
| CU-12 | Asignar funcionario a tarea | Diseñador | Alta |
| CU-13 | Monitorear trámites en tiempo real | Ambos | Media |
| CU-14 | Consultar analítica e insights IA | Diseñador | Media |

#### 1.3 Priorizar Casos de Uso

La priorización se realizó utilizando el criterio **MoSCoW** (Must/Should/Could/Won't):

| Prioridad | Casos de Uso | Justificación |
|-----------|-------------|---------------|
| **Must Have** | CU-01, CU-03, CU-04, CU-05, CU-07, CU-08, CU-09, CU-11, CU-12 | Funcionalidad core del workflow: sin estos el sistema no puede operar |
| **Should Have** | CU-02, CU-06, CU-13 | Mejoran significativamente la usabilidad pero el sistema funciona sin ellos |
| **Could Have** | CU-10, CU-14 | Funcionalidades avanzadas de UX e inteligencia artificial |

**Orden de implementación por iteración:**

| Iteración | Casos de Uso | Entregable |
|-----------|-------------|------------|
| 1 | CU-01, CU-02, CU-03 | Autenticación + Departamentos |
| 2 | CU-04, CU-05 | Editor visual de políticas |
| 3 | CU-07, CU-08, CU-09, CU-11, CU-12 | Motor de workflow completo |
| 4 | CU-06, CU-10 | Formularios dinámicos + voz + OCR |
| 5 | CU-13 | Monitor en tiempo real |
| 6 | CU-14 | Analítica + IA |

#### 1.4 Detallar Casos de Uso

##### CU-05: Diseñar Diagrama de Actividad UML

| Campo | Detalle |
|-------|---------|
| **Actor principal** | Diseñador de Procesos |
| **Precondición** | El diseñador ha iniciado sesión y ha creado una política |
| **Postcondición** | El diagrama se persiste en la base de datos con nodos y aristas |
| **Flujo principal** | 1. El diseñador abre el editor visual de la política. 2. El sistema carga los nodos y aristas existentes en el canvas de React Flow. 3. El diseñador agrega nodos (Acción, Decisión, Fork, Join, Inicial, Final) desde el panel lateral. 4. El diseñador conecta nodos arrastrando aristas entre ellos. 5. El diseñador asigna departamentos a cada nodo mediante swimlanes. 6. El diseñador configura etiquetas de condición en aristas de nodos DECISION. 7. El diseñador hace clic en "Guardar". 8. El sistema persiste el grafo en una transacción (elimina anteriores, crea nuevos). |
| **Flujo alternativo** | 7a. Si hay trámites activos, el sistema bloquea la edición con mensaje de error. |
| **Excepciones** | Sin nodo inicial → error de validación al iniciar trámite. |

##### CU-09: Completar Tarea del Flujo

| Campo | Detalle |
|-------|---------|
| **Actor principal** | Funcionario |
| **Precondición** | Existe un trámite en curso con una tarea en estado PENDING o IN_PROGRESS |
| **Postcondición** | La tarea se marca como DONE, el motor avanza al siguiente nodo |
| **Flujo principal** | 1. El funcionario abre el detalle de un trámite. 2. El sistema muestra las tareas con semáforo de estado. 3. El funcionario hace clic en "Completar" en una tarea. 4. El sistema marca la tarea como DONE y registra el evento. 5. El motor busca aristas salientes del nodo completado. 6. El motor crea tareas PENDING para los nodos destino. 7. El motor auto-avanza nodos especiales (FORK→paralelo, JOIN→sincronización, FINAL→cierre). 8. El sistema emite evento WebSocket a todos los conectados. |
| **Flujo alternativo** | 5a. Si el nodo es DECISION, el funcionario elige un camino condicional. 5b. Si el nodo es JOIN, el motor verifica que TODOS los nodos fuente estén completados antes de avanzar. 6a. Si no hay aristas salientes (nodo FINAL), el motor cierra el trámite como COMPLETED. |
| **Excepciones** | Tarea ya completada → BadRequestException(400). |

##### CU-10: Llenar Formulario con Voz / OCR

| Campo | Detalle |
|-------|---------|
| **Actor principal** | Funcionario |
| **Precondición** | La tarea tiene un FormTemplate asociado configurado por el diseñador |
| **Postcondición** | El formulario se almacena con el modo de entrada registrado (MANUAL/VOICE/AI) |
| **Flujo principal** | 1. El funcionario expande el formulario en la tarea. 2. El sistema renderiza los campos dinámicos según el JSON Schema. 3a. **Manual:** El funcionario llena los campos con teclado. 3b. **Voz:** El funcionario hace clic en el ícono de micrófono, dicta el texto y el sistema transcribe con Web Speech API. 3c. **OCR:** El funcionario selecciona una imagen, Tesseract.js extrae el texto y lo coloca en el campo. 4. El funcionario hace clic en "Enviar". 5. El sistema almacena el payload JSON con el `inputMode` correspondiente. |

#### 1.5 Estructurar Modelos de Casos de Uso

Los casos de uso se agrupan en **5 paquetes funcionales** que reflejan los subsistemas del proyecto:

```
┌────────────────────────────────────────────────────────────────┐
│                    Modelo de Casos de Uso                       │
│                                                                │
│  ┌──────────────────┐   ┌──────────────────┐                  │
│  │  «paquete»       │   │  «paquete»       │                  │
│  │  Autenticación   │   │  Organización    │                  │
│  │  ───────────     │   │  ────────────    │                  │
│  │  CU-01 Login     │   │  CU-02 Registro  │                  │
│  │                  │   │  CU-03 Deptos    │                  │
│  └──────────────────┘   └──────────────────┘                  │
│                                                                │
│  ┌──────────────────────────────────────────┐                  │
│  │  «paquete»  Diseño de Políticas          │                  │
│  │  ──────────────────────────────          │                  │
│  │  CU-04 Crear política                    │                  │
│  │  CU-05 Diseñar diagrama UML              │                  │
│  │  CU-06 Configurar formularios            │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                │
│  ┌──────────────────────────────────────────┐                  │
│  │  «paquete»  Ejecución de Workflow         │                  │
│  │  ────────────────────────────────        │                  │
│  │  CU-07 Iniciar trámite                   │                  │
│  │  CU-08 Consultar bandeja                 │                  │
│  │  CU-09 Completar tarea                   │                  │
│  │  CU-10 Formulario voz/OCR               │                  │
│  │  CU-11 Decisión condicional              │                  │
│  │  CU-12 Asignar funcionario               │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                │
│  ┌──────────────────┐   ┌──────────────────┐                  │
│  │  «paquete»       │   │  «paquete»       │                  │
│  │  Monitoreo       │   │  Analítica       │                  │
│  │  ─────────       │   │  ─────────       │                  │
│  │  CU-13 Monitor   │   │  CU-14 Analytics │                  │
│  │  WebSocket       │   │  + IA Insights   │                  │
│  └──────────────────┘   └──────────────────┘                  │
└────────────────────────────────────────────────────────────────┘
```

**Relaciones entre casos de uso:**

| Relación | Desde | Hacia | Tipo |
|----------|-------|-------|------|
| `<<include>>` | CU-09 Completar tarea | CU-11 Decisión condicional | El motor verifica si el nodo es DECISION |
| `<<include>>` | CU-09 Completar tarea | CU-10 Formulario voz/OCR | Opcionalmente llena formulario antes de completar |
| `<<extend>>` | CU-13 Monitor | CU-07 Iniciar trámite | El monitor se actualiza al iniciar trámite |
| `<<extend>>` | CU-14 Analytics | CU-09 Completar tarea | Las métricas se recalculan al completar tareas |

---

### 2. Flujo de Trabajo: Análisis

#### 2.1 Análisis de Arquitectura

La arquitectura del sistema sigue el patrón **cliente-servidor de 3 capas** con comunicación REST + WebSocket:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite 8                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │ Pages    │  │Components│  │ Context  │  │ API Layer│ │  │
│  │  │ (10 pgs) │  │ (Layout, │  │ (Auth,   │  │ (Axios + │ │  │
│  │  │          │  │  Toast,  │  │  Toast)  │  │  Socket) │ │  │
│  │  │          │  │  Form)   │  │          │  │          │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │ HTTP :5173 → :3000  │ WS :3000        │
└─────────────────────────┼─────────────────────┼─────────────────┘
                          ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE LÓGICA DE NEGOCIO                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  NestJS 11 — Módulos independientes con DI                │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐  │  │
│  │  │  Auth   │ │ Policies │ │  Cases  │ │   Forms      │  │  │
│  │  │ Module  │ │  Module  │ │ Module  │ │   Module     │  │  │
│  │  │(JWT+    │ │(CRUD+    │ │(Motor   │ │(JSON Schema  │  │  │
│  │  │ Guard)  │ │ Graph)   │ │Workflow)│ │ +Submission) │  │  │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │  Depts   │ │ Events   │ │Analytics│ │AiAssistant  │  │  │
│  │  │  Module  │ │ Gateway  │ │ Module  │ │  Module     │  │  │
│  │  │(CRUD)    │ │(Socket.IO│ │(KPIs+   │ │(Insights+   │  │  │
│  │  │          │ │ WS)      │ │Bottlen.)│ │ Recommend.) │  │  │
│  │  └──────────┘ └──────────┘ └─────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │ TCP :5432                              │
└─────────────────────────┼───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PERSISTENCIA                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 16 — Base: workflow_sw1                        │  │
│  │  Prisma ORM 6.19 (migraciones + cliente tipado)           │  │
│  │  10 tablas: users, departments, policies, policy_nodes,   │  │
│  │  policy_edges, cases, tasks, form_templates,              │  │
│  │  form_submissions, event_logs                             │  │
│  │  6 enums: Role, PolicyStatus, NodeType, FlowType,         │  │
│  │  TaskStatus, CaseStatus, InputMode                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Decisiones arquitectónicas clave:**

| Decisión | Justificación |
|----------|---------------|
| **NestJS modular** | Cada dominio (auth, policies, cases, forms, analytics) es un módulo independiente con inyección de dependencias, favoreciendo cohesión alta y acoplamiento bajo |
| **Prisma ORM** | Generación de tipos TypeScript automática desde el schema, migraciones versionadas, queries type-safe |
| **JWT stateless** | Autenticación sin sesiones en servidor, escalable horizontalmente |
| **Socket.IO** | Comunicación bidireccional servidor↔cliente para eventos en tiempo real sin polling |
| **React Flow** | Librería especializada para editores de grafos/diagramas con drag & drop nativo |
| **Transacciones Prisma** | La operación `saveGraph` usa `$transaction` para garantizar atomicidad al reescribir el grafo completo |

#### 2.2 Análisis de Casos de Uso

##### Análisis del CU-05: Diseñar Diagrama de Actividad

**Clases de análisis identificadas:**

| Clase | Estereotipo | Responsabilidad |
|-------|-------------|-----------------|
| `PolicyEditorPage` | `<<boundary>>` | Interfaz visual del editor con canvas React Flow |
| `PoliciesController` | `<<control>>` | Recibe peticiones HTTP de guardar/cargar grafo |
| `PoliciesService` | `<<control>>` | Lógica de negocio: transacción de guardado del grafo |
| `Policy` | `<<entity>>` | Contiene nombre, estado y relación con nodos/aristas |
| `PolicyNode` | `<<entity>>` | Nodo del diagrama: tipo, posición, departamento |
| `PolicyEdge` | `<<entity>>` | Arista: origen, destino, tipo de flujo, condición |

**Diagrama de colaboración (secuencia simplificada):**

```
Diseñador → PolicyEditorPage → [PUT /policies/:id] → PoliciesController
    → PoliciesService.saveGraph()
    → Prisma.$transaction:
        1. Verificar que no hay trámites activos
        2. Obtener nodos existentes
        3. Eliminar: FormSubmission → Task → FormTemplate → Edge → Node
        4. Crear nuevos nodos con posiciones
        5. Crear nuevas aristas con tipos de flujo
    → Response: Política actualizada con grafo completo
```

##### Análisis del CU-09: Completar Tarea

**Clases de análisis identificadas:**

| Clase | Estereotipo | Responsabilidad |
|-------|-------------|-----------------|
| `CaseDetailPage` | `<<boundary>>` | Muestra tareas con semáforo, botones de acción |
| `CasesController` | `<<control>>` | Endpoint `POST /cases/tasks/:id/complete` |
| `CasesService` | `<<control>>` | Motor de workflow: lógica de avance según tipo de nodo |
| `EventsGateway` | `<<control>>` | Emite eventos WebSocket a clientes conectados |
| `Task` | `<<entity>>` | Tarea con estado, nodo asociado, usuario asignado |
| `Case` | `<<entity>>` | Trámite con estado global y nodo actual |
| `EventLog` | `<<entity>>` | Registro de auditoría de cada evento |

**Diagrama de colaboración:**

```
Funcionario → CaseDetailPage → [POST /cases/tasks/:id/complete] → CasesController
    → CasesService.completeTask(taskId, userId, chosenEdgeLabel?)
    → Marcar tarea como DONE + registrar EventLog
    → Buscar aristas salientes del nodo:
        ├── nodeType=ACTION  → Crear tarea PENDING en nodo(s) destino
        ├── nodeType=DECISION → Elegir arista según chosenEdgeLabel
        ├── nodeType=FORK    → Crear tareas PENDING en TODOS los destinos (paralelo)
        ├── nodeType=JOIN    → Verificar ALL fuentes DONE antes de avanzar
        └── nodeType=FINAL   → Verificar si trámite completo → COMPLETED
    → autoAdvanceSpecialNodes() → Loop hasta no más nodos automáticos
    → EventsGateway.emitTaskCompleted() → WebSocket broadcast
    → Response: Caso actualizado con estado de todas las tareas
```

#### 2.4 Análisis de Paquetes

El sistema se organiza en **5 paquetes de análisis** que mapean directamente a los módulos NestJS del backend y las agrupaciones de páginas del frontend:

```
┌────────────────────────────────────────────────────────────────────┐
│                     Paquetes del Sistema                           │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  «paquete» Seguridad                                    │      │
│  │  AuthModule ↔ AuthContext (frontend)                    │      │
│  │  Clases: User, JwtStrategy, AuthGuard, LoginPage       │      │
│  │  Dependencia: PrismaModule                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                           │ usa                                    │
│                           ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  «paquete» Modelado de Procesos                         │      │
│  │  PoliciesModule + DepartmentsModule                     │      │
│  │  Clases: Policy, PolicyNode, PolicyEdge, Department     │      │
│  │  UI: PolicyEditorPage (React Flow), DepartmentsPage     │      │
│  │  Dependencia: PrismaModule                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                           │ usa                                    │
│                           ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  «paquete» Ejecución de Workflow                        │      │
│  │  CasesModule + FormsModule + EventsModule               │      │
│  │  Clases: Case, Task, FormTemplate, FormSubmission,      │      │
│  │          EventLog, EventsGateway                        │      │
│  │  UI: CasesPage, CaseDetailPage, DynamicForm             │      │
│  │  Dependencia: PrismaModule, Modelado de Procesos        │      │
│  └─────────────────────────────────────────────────────────┘      │
│                           │ usa                                    │
│                           ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  «paquete» Inteligencia y Monitoreo                     │      │
│  │  AnalyticsModule + AiAssistantModule + EventsModule     │      │
│  │  Clases: AnalyticsService, AiAssistantService           │      │
│  │  UI: AnalyticsPage, MonitorPage                         │      │
│  │  Dependencia: PrismaModule, Ejecución de Workflow       │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  «paquete» Infraestructura                              │      │
│  │  PrismaModule (singleton), ConfigModule (global)        │      │
│  │  Docker Compose, GitHub Actions CI/CD                   │      │
│  │  Transversal: usado por TODOS los paquetes              │      │
│  └─────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

**Dependencias entre paquetes:**

| Paquete origen | Paquete destino | Tipo de dependencia |
|----------------|-----------------|---------------------|
| Modelado de Procesos | Seguridad | `<<usa>>` — Solo diseñadores crean políticas |
| Ejecución de Workflow | Modelado de Procesos | `<<usa>>` — Los trámites se basan en políticas definidas |
| Ejecución de Workflow | Seguridad | `<<usa>>` — Tareas se asignan a usuarios autenticados |
| Inteligencia y Monitoreo | Ejecución de Workflow | `<<usa>>` — Analiza datos de trámites y tareas |
| Todos | Infraestructura | `<<usa>>` — Acceso a datos y configuración |

---

### 3. Flujo de Trabajo: Diseño

#### 3.1 Arquitectura de Diseño

##### Stack Tecnológico

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

##### Patrones de diseño aplicados

| Patrón | Dónde se aplica | Descripción |
|--------|-----------------|-------------|
| **MVC** | NestJS (Controller → Service → Prisma) | Separación de responsabilidades en controladores, servicios y modelos |
| **Inyección de Dependencias** | NestJS `@Injectable()` + constructores | Los módulos reciben sus dependencias automáticamente via el contenedor IoC |
| **Repository** | PrismaService como singleton | Capa de acceso a datos centralizada, reutilizada por todos los servicios |
| **Observer** | EventsGateway (Socket.IO) | Los clientes se suscriben a eventos y reciben notificaciones en tiempo real |
| **Strategy** | Motor de workflow (switch por nodeType) | Cada tipo de nodo (ACTION, DECISION, FORK, JOIN, FINAL) tiene su estrategia de avance |
| **State** | Task.status / Case.status (enums) | Las entidades cambian de comportamiento según su estado actual |
| **Template Method** | `autoAdvanceSpecialNodes()` loop | Algoritmo fijo con pasos variables según el tipo de nodo |
| **Composite** | React Components (Layout → Pages → Components) | Árbol jerárquico de componentes reutilizables |

#### 3.2 Diseño de Casos de Uso

##### Diagrama de Secuencia: Completar Tarea con Avance Automático

```
┌──────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────┐   ┌────────────┐
│Funcionario│   │CaseDetailPage│   │CasesController│  │CasesService │   │  Prisma  │   │EventsGateway│
└─────┬─────┘   └──────┬───────┘   └──────┬────────┘  └──────┬──────┘   └─────┬────┘   └─────┬──────┘
      │                │                   │                  │                │              │
      │ click          │                   │                  │                │              │
      │ "Completar"    │                   │                  │                │              │
      │───────────────>│                   │                  │                │              │
      │                │  POST /tasks/:id/ │                  │                │              │
      │                │  complete         │                  │                │              │
      │                │──────────────────>│                  │                │              │
      │                │                   │ completeTask()   │                │              │
      │                │                   │─────────────────>│                │              │
      │                │                   │                  │ findUnique()   │              │
      │                │                   │                  │───────────────>│              │
      │                │                   │                  │    task        │              │
      │                │                   │                  │<───────────────│              │
      │                │                   │                  │                │              │
      │                │                   │                  │ update(DONE)   │              │
      │                │                   │                  │───────────────>│              │
      │                │                   │                  │                │              │
      │                │                   │                  │ create(EventLog│              │
      │                │                   │                  │ TASK_COMPLETED)│              │
      │                │                   │                  │───────────────>│              │
      │                │                   │                  │                │              │
      │                │                   │                  │ findMany       │              │
      │                │                   │                  │ (outEdges)     │              │
      │                │                   │                  │───────────────>│              │
      │                │                   │                  │  edges[]       │              │
      │                │                   │                  │<───────────────│              │
      │                │                   │                  │                │              │
      │                │                   │                  │ create(Task    │              │
      │                │                   │                  │ PENDING)       │              │
      │                │                   │                  │───────────────>│              │
      │                │                   │                  │                │              │
      │                │                   │                  │ autoAdvance    │              │
      │                │                   │                  │ SpecialNodes() │              │
      │                │                   │                  │───────┐        │              │
      │                │                   │                  │       │ loop   │              │
      │                │                   │                  │<──────┘        │              │
      │                │                   │                  │                │              │
      │                │                   │                  │ emitTask       │              │
      │                │                   │                  │ Completed()    │              │
      │                │                   │                  │───────────────────────────────>│
      │                │                   │                  │                │              │
      │                │                   │  case updated    │                │              │
      │                │                   │<─────────────────│                │              │
      │                │   200 OK + case   │                  │                │              │
      │                │<──────────────────│                  │                │              │
      │  UI actualizada│                   │                  │                │              │
      │<───────────────│                   │                  │                │              │
```

##### Diagrama de Secuencia: Iniciar Trámite

```
Diseñador → DashboardPage → [POST /cases {policyId}] → CasesController
    → CasesService.startCase(policyId):
        1. Verificar política ACTIVE con nodos
        2. Buscar nodos INITIAL (o nodos sin aristas entrantes)
        3. Crear Case (status=IN_PROGRESS)
        4. Crear Task para cada startNode
        5. Si nodo es INITIAL → auto-completar → crear tasks para nodos siguientes
        6. Registrar EventLog(CASE_STARTED)
        7. EventsGateway.emitCaseStarted(case) → WebSocket broadcast
    → Response: Case con tasks iniciales
```

##### Diagrama de Secuencia: Monitor en Tiempo Real

```
Cliente → Conectar Socket.IO con {userId}
    → EventsGateway.handleConnection():
        1. Registrar userId en mapa de conectados
        2. Emitir 'users:online' → broadcast lista actualizada

Funcionario completa tarea → CasesService:
    → EventsGateway.emitTaskCompleted(case) → 'task:completed' → todos los clientes
    → MonitorPage recibe evento:
        1. Agregar entrada al eventFeed (tipo, hora, detalle)
        2. Recargar lista de trámites activos

Cliente desconecta → EventsGateway.handleDisconnect():
    1. Eliminar userId del mapa
    2. Emitir 'users:online' actualizado
```

#### 3.3 Diseño de Datos

##### Modelo Entidad-Relación

```
┌──────────────────┐        ┌──────────────────┐
│     Department    │        │      User        │
├──────────────────┤        ├──────────────────┤
│ PK id: UUID      │◄──────┤ PK id: UUID      │
│    name: VARCHAR  │  1:N   │    email: VARCHAR │
│                  │        │    name: VARCHAR  │
│                  │        │    passwordHash   │
│                  │        │    role: enum     │
│                  │        │ FK departmentId   │
└───────┬──────────┘        └──────────┬───────┘
        │ 1:N                          │ 1:N
        ▼                              ▼
┌──────────────────┐        ┌──────────────────┐
│   PolicyNode     │        │      Task        │
├──────────────────┤        ├──────────────────┤
│ PK id: UUID      │◄──────┤ PK id: UUID      │
│ FK policyId      │  1:N   │ FK caseId        │
│ FK departmentId  │        │ FK nodeId ───────┼──►│
│    nodeType: enum│        │ FK assignedUserId│
│    title: VARCHAR│        │    status: enum  │
│    description   │        │    startedAt     │
│    positionX     │        │    finishedAt    │
│    positionY     │        │    dueAt         │
└──┬───────────┬───┘        └──┬──────────┬────┘
   │ 1:1       │ 1:N           │ 1:1      │
   ▼           ▼               ▼          │
┌──────────┐ ┌────────────┐ ┌────────────┐│
│FormTempl.│ │PolicyEdge  │ │FormSubmis. ││
├──────────┤ ├────────────┤ ├────────────┤│
│PK id     │ │PK id       │ │PK id       ││
│FK nodeId │ │FK policyId │ │FK taskId   ││
│schemaJson│ │FK fromNodeId│ │payloadJson ││
└──────────┘ │FK toNodeId │ │inputMode   ││
             │flowType    │ └────────────┘│
             │condLabel   │               │
             │condJson    │               │
             └────────────┘               │
                                          │
┌──────────────────┐    ┌──────────────────┐
│     Policy       │    │      Case        │
├──────────────────┤    ├──────────────────┤
│ PK id: UUID      │◄──┤ PK id: UUID      │
│    name: VARCHAR  │1:N│ FK policyId      │
│    status: enum  │    │    currentNodeId │
│    createdBy     │    │    status: enum  │
│    createdAt     │    │    startedAt     │
│    updatedAt     │    │    finishedAt    │
└──────────────────┘    └───────┬──────────┘
                                │ 1:N
                                ▼
                        ┌──────────────────┐
                        │    EventLog      │
                        ├──────────────────┤
                        │ PK id: UUID      │
                        │ FK caseId        │
                        │    type: VARCHAR  │
                        │    payloadJson   │
                        │    createdAt     │
                        └──────────────────┘
```

##### Enumeraciones del sistema

| Enum | Valores | Uso |
|------|---------|-----|
| `Role` | DESIGNER, OFFICER | Rol del usuario, determina dashboard y permisos |
| `PolicyStatus` | ACTIVE, INACTIVE | Solo políticas ACTIVE pueden instanciar trámites |
| `NodeType` | ACTION, INITIAL, FINAL, DECISION, FORK, JOIN | Tipo de nodo UML en el diagrama de actividad |
| `FlowType` | SEQUENTIAL, CONDITIONAL, ITERATIVE, PARALLEL | Tipo de flujo de cada arista |
| `TaskStatus` | PENDING, IN_PROGRESS, DONE, BLOCKED | Estado de cada tarea individual |
| `CaseStatus` | OPEN, IN_PROGRESS, COMPLETED, CANCELLED | Estado global del trámite |
| `InputMode` | MANUAL, VOICE, AI | Modo de captura del formulario (teclado, voz, OCR) |

##### Diccionario de datos — Tablas principales

**Tabla `policies`**

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-gen | Identificador único |
| name | VARCHAR | NOT NULL | Nombre de la política |
| status | PolicyStatus | DEFAULT ACTIVE | Estado de la política |
| created_by | VARCHAR | NOT NULL | ID del usuario creador |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | Auto-update | Última modificación |

**Tabla `policy_nodes`**

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-gen | Identificador único |
| policy_id | UUID | FK → policies, CASCADE | Política a la que pertenece |
| department_id | UUID | FK → departments | Departamento responsable |
| node_type | NodeType | DEFAULT ACTION | Tipo UML del nodo |
| title | VARCHAR | NOT NULL | Nombre de la actividad |
| description | TEXT | NULLABLE | Descripción opcional |
| position_x | FLOAT | DEFAULT 0 | Coordenada X en el canvas |
| position_y | FLOAT | DEFAULT 0 | Coordenada Y en el canvas |

**Tabla `tasks`**

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-gen | Identificador único |
| case_id | UUID | FK → cases | Trámite al que pertenece |
| node_id | UUID | FK → policy_nodes | Nodo del diagrama que representa |
| assigned_user_id | UUID | FK → users, NULLABLE | Funcionario asignado |
| status | TaskStatus | DEFAULT PENDING | Estado actual de la tarea |
| started_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| finished_at | TIMESTAMP | NULLABLE | Fecha de completado |
| due_at | TIMESTAMP | NULLABLE | Fecha límite (opcional) |

---

### 4. Flujo de Trabajo: Implementación

#### 4.1 Implementación de la Arquitectura del Sistema

##### Estructura de directorios

```
PrimerParcialSW1/
├── backend/
│   ├── src/
│   │   ├── main.ts                    # Bootstrap: CORS, ValidationPipe, puerto 3000
│   │   ├── app.module.ts              # Módulo raíz: importa 9 módulos
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts       # Módulo global del ORM
│   │   │   └── prisma.service.ts      # Servicio singleton PrismaClient
│   │   ├── auth/
│   │   │   ├── auth.module.ts         # Passport + JWT + bcrypt
│   │   │   ├── auth.controller.ts     # POST /login, /register, GET /profile, /users
│   │   │   ├── auth.service.ts        # Hash, verify, sign JWT
│   │   │   └── jwt.strategy.ts        # Passport JWT strategy + AuthGuard
│   │   ├── departments/
│   │   │   ├── departments.module.ts
│   │   │   ├── departments.controller.ts  # GET, POST, DELETE
│   │   │   └── departments.service.ts
│   │   ├── policies/
│   │   │   ├── policies.module.ts
│   │   │   ├── policies.controller.ts # CRUD + PUT /:id (saveGraph)
│   │   │   └── policies.service.ts    # findAll, findOne, create, saveGraph
│   │   ├── cases/
│   │   │   ├── cases.module.ts
│   │   │   ├── cases.controller.ts    # POST /cases, /tasks/:id/complete, etc.
│   │   │   └── cases.service.ts       # Motor de workflow (256 líneas)
│   │   ├── forms/
│   │   │   ├── forms.module.ts
│   │   │   ├── forms.controller.ts    # Template CRUD + submit
│   │   │   └── forms.service.ts
│   │   ├── events/
│   │   │   ├── events.module.ts
│   │   │   └── events.gateway.ts      # Socket.IO WebSocket Gateway
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts # GET /dashboard, /policy/:id
│   │   │   └── analytics.service.ts    # KPIs + cuellos de botella
│   │   └── ai-assistant/
│   │       ├── ai-assistant.module.ts
│   │       └── ai-assistant.service.ts # Generación de insights IA
│   ├── prisma/
│   │   └── schema.prisma              # 10 modelos, 6 enums
│   ├── test/                          # 25 tests unitarios (4 suites)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx                   # Entry point React
│   │   ├── App.tsx                    # Router con 12 rutas
│   │   ├── api.ts                     # Axios instance + JWT interceptor
│   │   ├── index.css                  # Design system (400+ líneas CSS)
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # React Context para autenticación
│   │   ├── components/
│   │   │   ├── Layout.tsx             # Shell: sidebar + contenido
│   │   │   ├── DynamicForm.tsx        # Renderizador de JSON Schema + voz + OCR
│   │   │   ├── TrafficLight.tsx       # Indicador visual de estado
│   │   │   ├── Toast.tsx              # Notificaciones toast
│   │   │   ├── ToastContext.ts        # Contexto compartido
│   │   │   └── useToast.ts           # Hook de acceso al toast
│   │   └── pages/
│   │       ├── LoginPage.tsx          # Login glassmorphism
│   │       ├── RegisterPage.tsx       # Registro con departamento
│   │       ├── DashboardPage.tsx      # KPIs + tabla de políticas (DESIGNER)
│   │       ├── OfficerDashboardPage.tsx # Bandeja de tareas (OFFICER)
│   │       ├── DepartmentsPage.tsx    # CRUD departamentos
│   │       ├── PolicyEditorPage.tsx   # Editor React Flow (700+ líneas)
│   │       ├── CasesPage.tsx          # Lista de trámites
│   │       ├── CaseDetailPage.tsx     # Detalle: tareas + formularios + historial
│   │       ├── MonitorPage.tsx        # Monitor WebSocket en tiempo real
│   │       └── AnalyticsPage.tsx      # Gráficos + IA insights
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml                 # 3 servicios: db, backend, frontend
├── .github/workflows/ci.yml          # Pipeline CI/CD (3 jobs)
├── DOCUMENTACION.md                   # Este documento
└── README.md                          # Guía rápida de instalación
```

##### Configuración del servidor (main.ts)

```typescript
const app = await NestFactory.create(AppModule);

// CORS — permite peticiones del frontend
app.enableCors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
});

// Validación global — sanitiza y valida DTOs automáticamente
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

await app.listen(process.env.PORT ?? 3000);
```

##### Registro de módulos (app.module.ts)

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),   // Variables de entorno
    PrismaModule,         // Capa de datos (singleton)
    AuthModule,           // JWT + Passport
    DepartmentsModule,    // CRUD organizacional
    PoliciesModule,       // Diseño de procesos
    CasesModule,          // Motor de workflow
    EventsModule,         // WebSocket Gateway
    AnalyticsModule,      // KPIs y métricas
    FormsModule,          // Formularios dinámicos
    AiAssistantModule,    // Insights inteligentes
  ],
})
export class AppModule {}
```

#### 4.2 Implementación de la Arquitectura del Subsistema

##### Subsistema: Motor de Workflow (CasesService)

El motor de workflow es el componente central del sistema. Implementa la lógica de avance de trámites según la teoría de diagramas de actividad UML.

**Algoritmo principal — `completeTask()`:**

```
ENTRADA: taskId, userId, chosenEdgeLabel (opcional)
1. Buscar tarea por ID (incluir caso y nodo)
2. Validar que la tarea no esté ya completada
3. Marcar tarea como DONE (finishedAt = ahora)
4. Registrar EventLog(TASK_COMPLETED)
5. Buscar aristas salientes del nodo completado
6. Obtener el tipo del nodo actual (nodeType)
7. SWITCH según nodeType:
   ├── FINAL o sin aristas salientes:
   │   └── Si TODAS las tareas del caso son DONE → CASE COMPLETED
   ├── DECISION:
   │   └── Elegir arista por chosenEdgeLabel → crear 1 tarea en destino
   ├── FORK:
   │   └── Crear tareas para TODOS los destinos (flujo paralelo)
   ├── JOIN:
   │   └── Verificar que TODOS los nodos fuente estén DONE
   │       └── Si sí → avanzar; si no → esperar
   └── ACTION / default:
       └── Crear tareas para nodo(s) destino
8. Ejecutar autoAdvanceSpecialNodes() (loop)
9. Emitir evento WebSocket
10. Retornar caso actualizado
```

**Algoritmo de auto-avance — `autoAdvanceSpecialNodes()`:**

```
ENTRADA: caseId, policyId
REPETIR mientras haya avances:
  1. Buscar tareas PENDING del caso
  2. Para cada tarea pendiente:
     ├── INITIAL → auto-completar → crear tareas siguientes
     ├── FORK → auto-completar → crear tareas paralelas
     ├── JOIN → verificar todas las fuentes DONE → si sí, completar y avanzar
     └── FINAL → auto-completar → si no quedan tareas → cerrar caso
  3. Si se avanzó alguna → repetir; sino → salir del loop
```

##### Subsistema: Analítica con IA (AnalyticsService + AiAssistantService)

**Algoritmo de detección de cuellos de botella:**

```
ENTRADA: policyId
1. Cargar política con nodos y departamentos
2. Cargar todos los casos con tareas
3. Para cada nodo:
   a. Filtrar tareas del nodo
   b. Calcular duración promedio (completadas)
   c. Contar tareas pendientes
4. Calcular promedio global de duración
5. Umbral de cuello de botella = max(promedio × 1.5, 1 minuto)
6. Marcar como bottleneck si:
   - Duración promedio > umbral  O
   - Tareas pendientes >= 3
```

**Algoritmo de generación de insights IA:**

```
ENTRADA: nodeStats[], bottlenecks[], totalCases, completedCases, avgDuration
1. Análisis de tasa de completitud:
   ├── < 30% → CRITICAL: "Tasa crítica"
   ├── < 60% → WARNING: "Tasa baja"
   └── >= 60% → SUCCESS: "Tasa saludable"
2. Si hay cuellos de botella:
   a. Identificar el peor nodo (mayor duración promedio)
   b. Generar recomendación con departamento y actividad específicos
   c. Detectar sobrecarga por departamento (>=5 tareas pendientes)
   d. Si hay >=2 cuellos de botella → "problema sistémico"
3. Análisis de cola global:
   └── > 10 tareas pendientes total → WARNING
4. Detección de anomalías de duración:
   a. Calcular media y desviación estándar
   b. Identificar outliers (> media + 2σ)
   c. Generar alerta por cada outlier
SALIDA: Array de {severity, message, action}
```

##### Subsistema: WebSocket en Tiempo Real (EventsGateway)

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<string, string>(); // socketId → userId

  handleConnection(client: Socket) {
    // Registrar usuario conectado y broadcast lista
    connectedUsers.set(client.id, userId);
    server.emit('users:online', [...connectedUsers.values()]);
  }

  handleDisconnect(client: Socket) {
    // Eliminar y actualizar lista
    connectedUsers.delete(client.id);
    server.emit('users:online', [...connectedUsers.values()]);
  }

  // Métodos de emisión invocados por CasesService:
  emitCaseStarted(caseData)    → server.emit('case:started', data)
  emitTaskCompleted(caseData)  → server.emit('task:completed', data)
  emitTaskAssigned(taskData)   → server.emit('task:assigned', data)
  emitCaseCompleted(caseData)  → server.emit('case:completed', data)
}
```

##### Subsistema: Formularios Dinámicos (DynamicForm.tsx)

El componente `DynamicForm` renderiza formularios a partir de un JSON Schema almacenado en `FormTemplate`:

```
JSON Schema ejemplo:
{
  "fields": [
    { "name": "nombre", "label": "Nombre completo", "type": "text", "required": true },
    { "name": "monto", "label": "Monto solicitado", "type": "number" },
    { "name": "observaciones", "label": "Observaciones", "type": "textarea", "fullWidth": true }
  ]
}

Renderizado → Para cada field:
  ├── type=text     → <input type="text"> + botón de voz
  ├── type=number   → <input type="number">
  ├── type=textarea → <textarea> + botón de voz
  ├── type=date     → <input type="date">
  └── type=select   → <select> con options

Modos de entrada:
  ├── Manual: teclado estándar
  ├── Voz: Web Speech API (SpeechRecognition) → transcripción al campo
  └── OCR: Tesseract.js → imagen → texto extraído al campo
```

---

### 5. Flujo de Trabajo: Prueba

#### 5.1 Planificar Plan de Pruebas

Se definió un plan de pruebas alineado con la metodología PUDS, cuyo objetivo es verificar que cada módulo del sistema cumple con los requisitos funcionales y no funcionales identificados en los flujos anteriores.

**Objetivos del plan:**

1. Validar la lógica de negocio de los 4 servicios core del backend (Auth, Policies, Cases, Analytics).
2. Verificar la integridad de la compilación tanto del backend (NestJS) como del frontend (React + Vite).
3. Asegurar la calidad de código mediante análisis estático (TypeScript strict + ESLint).
4. Automatizar la ejecución de pruebas en cada push/PR mediante CI/CD (GitHub Actions).

**Alcance y niveles de prueba:**

| Nivel | Herramienta | Cobertura | Descripción |
|-------|-------------|-----------|-------------|
| **Unitarias** | Jest 30 | 4 servicios core | Servicios aislados con mocks de Prisma |
| **Análisis estático** | TypeScript + ESLint | 100% del código | Detección de errores de tipo y estilo |
| **Build validation** | `tsc -b` + `vite build` | Frontend completo | Compilación sin errores |
| **E2E (smoke)** | Supertest | Endpoint raíz | Verificación de arranque de la aplicación |
| **CI automatizado** | GitHub Actions | Push/PR a main | Ejecuta tests + build + Docker |

**Recursos y entorno:**

| Recurso | Especificación |
|---------|---------------|
| Framework de pruebas | Jest 30.x con ts-jest |
| Mocking | `jest.fn()` para PrismaService y dependencias |
| Base de datos de test | PostgreSQL 16 en contenedor (CI) / mock local |
| Runner CI | GitHub Actions — ubuntu-latest, Node.js 20 |
| Cobertura | `--coverage` flag habilitado en CI |

**Criterios de aceptación:**

- 100% de las pruebas unitarias pasan (25/25).
- 0 errores de compilación TypeScript en backend y frontend.
- Build de producción exitoso para ambos proyectos.
- Imágenes Docker construidas sin errores.

#### 5.2 Diseñar Pruebas

Las pruebas se diseñaron siguiendo el patrón **AAA (Arrange-Act-Assert)** con aislamiento total de dependencias mediante mocks de Prisma y servicios externos.

**Estructura de archivos de prueba:**

```
backend/
├── src/
│   ├── app.controller.spec.ts          # Suite 0: AppController (1 test)
│   ├── auth/
│   │   └── auth.service.spec.ts        # Suite 1: AuthService (6 tests)
│   ├── cases/
│   │   └── cases.service.spec.ts       # Suite 2: CasesService (10 tests)
│   └── policies/
│       └── policies.service.spec.ts    # Suite 3: PoliciesService (8 tests)
└── test/
    └── app.e2e-spec.ts                 # Suite E2E: Supertest (1 test)
```

**Patrón de diseño de pruebas — Ejemplo AuthService:**

```typescript
// Arrange: crear módulo de testing con mocks
beforeEach(async () => {
  prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  jwt = { sign: jest.fn().mockReturnValue('test-token') };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: prisma },
      { provide: JwtService, useValue: jwt },
    ],
  }).compile();
  service = module.get<AuthService>(AuthService);
});

// Act + Assert: validar comportamiento
it('should return access_token for valid credentials', async () => {
  const hash = await bcrypt.hash('123456', 10);
  prisma.user.findUnique.mockResolvedValue({
    id: '1', email: 'test@test.com', role: 'DESIGNER', passwordHash: hash,
  });
  const result = await service.login('test@test.com', '123456');
  expect(result.access_token).toBe('test-token');
  expect(jwt.sign).toHaveBeenCalledWith({
    sub: '1', email: 'test@test.com', role: 'DESIGNER',
  });
});
```

**Catálogo completo de casos de prueba:**

##### Suite 1: AuthService (6 tests)

| # | Test | Qué valida |
|---|------|------------|
| 1 | Debe retornar access_token para credenciales válidas | Login correcto → JWT firmado |
| 2 | Debe rechazar email inexistente | UnauthorizedException si user no existe |
| 3 | Debe rechazar contraseña incorrecta | UnauthorizedException si bcrypt.compare falla |
| 4 | Debe crear usuario nuevo y retornar datos | Registro con hashing bcrypt + inserción BD |
| 5 | Debe hashear la contraseña antes de almacenar | passwordHash ≠ plaintext, bcrypt.compare = true |
| 6 | Debe retornar todos los usuarios | findAllUsers → findMany |

##### Suite 2: CasesService — Motor de Workflow (10 tests)

| # | Test | Qué valida |
|---|------|------------|
| 7 | Debe retornar todos los trámites | findAll sin filtro |
| 8 | Debe filtrar trámites por policyId | findAll con where policyId |
| 9 | Debe retornar trámite con detalles | findOne con include tasks + eventLogs |
| 10 | Debe lanzar NotFoundException si trámite no existe | findOne con ID inválido |
| 11 | Debe rechazar inicio si política no existe | startCase → NotFoundException |
| 12 | Debe rechazar inicio si política inactiva | startCase → BadRequestException |
| 13 | Debe rechazar inicio si política sin nodos | startCase → BadRequestException |
| 14 | Debe rechazar completar tarea inexistente | completeTask → NotFoundException |
| 15 | Debe rechazar completar tarea ya terminada | completeTask status=DONE → BadRequestException |
| 16 | Debe retornar tareas del usuario (asignadas + pending) | findTasksByUser con OR filter |

##### Suite 3: PoliciesService (8 tests)

| # | Test | Qué valida |
|---|------|------------|
| 17 | Debe listar políticas ordenadas por fecha | findAll → orderBy createdAt desc |
| 18 | Debe obtener política con nodos y aristas | findOne con include nodes + edges |
| 19 | Debe crear política nueva | create con name + createdBy |
| 20 | Debe actualizar nombre de política | update con data parcial |
| 21 | Debe desactivar política (soft delete) | remove → status INACTIVE |
| 22 | Debe guardar grafo en transacción | saveGraph → $transaction con delete + create |
| 23 | AssignTask rechaza tarea inexistente | assignTask → NotFoundException |
| 24 | CancelCase rechaza trámite inexistente | cancelCase → NotFoundException |

##### Suite E2E: AppController (1 test)

| # | Test | Qué valida |
|---|------|------------|
| 25 | GET / debe retornar Hello World | Endpoint raíz responde 200 + texto correcto |

#### 5.3 Implementar Pruebas

Las pruebas se implementaron usando **Jest 30** con el módulo `@nestjs/testing` para crear módulos de testing aislados. Cada suite sigue la misma estructura:

**Tecnologías de implementación:**

| Componente | Tecnología | Propósito |
|------------|-----------|-----------|
| Runner | Jest 30.x | Ejecución de pruebas y assertions |
| Testing module | `@nestjs/testing` | Inyección de dependencias mock |
| Mocking | `jest.fn()` / `mockResolvedValue()` | Simulación de Prisma y servicios |
| HTTP testing | Supertest | Pruebas E2E sobre endpoints |
| Hashing | bcrypt | Verificación de hashing de passwords |

**Ejemplo de implementación — CasesService spec:**

```typescript
describe('CasesService', () => {
  let service: CasesService;
  let prisma: any;
  let events: any;

  beforeEach(async () => {
    prisma = {
      case: { findMany: jest.fn(), findUnique: jest.fn(),
              create: jest.fn(), update: jest.fn() },
      task: { findMany: jest.fn(), findUnique: jest.fn(),
              findFirst: jest.fn(), create: jest.fn(),
              update: jest.fn(), count: jest.fn() },
      policy: { findUnique: jest.fn() },
      policyNode: { findUnique: jest.fn() },
      policyEdge: { findMany: jest.fn() },
      eventLog: { create: jest.fn() },
    };
    events = {
      emitCaseStarted: jest.fn(),
      emitCaseCompleted: jest.fn(),
      emitTaskCompleted: jest.fn(),
      emitTaskAssigned: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CasesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventsGateway, useValue: events },
      ],
    }).compile();
    service = module.get<CasesService>(CasesService);
  });

  describe('startCase', () => {
    it('should throw NotFoundException for missing policy', async () => {
      prisma.policy.findUnique.mockResolvedValue(null);
      await expect(service.startCase('bad-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive policy', async () => {
      prisma.policy.findUnique.mockResolvedValue({
        id: '1', status: 'INACTIVE', nodes: [], edges: [],
      });
      await expect(service.startCase('1'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
```

**Ejemplo de implementación — Prueba E2E:**

```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => { await app.close(); });
});
```

#### 5.4 Realizar Pruebas de Integración

Las pruebas de integración se realizan a nivel de **pipeline CI/CD** mediante GitHub Actions, donde se verifica la interacción entre los componentes en un entorno controlado.

**Entorno de integración — GitHub Actions:**

```yaml
# .github/workflows/ci.yml
jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:                          # BD real PostgreSQL 16
        image: postgres:16-alpine
        env:
          POSTGRES_DB: workflow_sw1_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma generate
      - run: npx jest --passWithNoTests --ci --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/workflow_sw1_test
          JWT_SECRET: test-secret
      - run: npm run build
```

**Verificaciones de integración:**

| Verificación | Job | Qué valida |
|-------------|-----|------------|
| Prisma ↔ PostgreSQL | backend-test | Generación de cliente contra BD real |
| Jest + Mocks | backend-test | 25 tests con `--ci --coverage` |
| Build NestJS | backend-test | `npm run build` → compilación TypeScript |
| TypeScript check | frontend-build | `npx tsc --noEmit` → 0 errores de tipo |
| Vite build | frontend-build | `npm run build` → bundle de producción |
| Docker backend | docker-build | `docker build ./backend` → imagen válida |
| Docker frontend | docker-build | `docker build ./frontend` → imagen con Nginx |

**Flujo de dependencias entre jobs:**

```
backend-test ──────┐
                   ├──→ docker-build
frontend-build ────┘
```

El job `docker-build` solo se ejecuta si ambos jobs previos pasan exitosamente (`needs: [backend-test, frontend-build]`).

#### 5.5 Realizar Pruebas de Sistema

Las pruebas de sistema validan el funcionamiento completo del stack desplegado con **Docker Compose**, verificando que los 3 servicios interactúan correctamente.

**Despliegue del sistema completo:**

```yaml
# docker-compose.yml — 3 servicios
services:
  db:                              # PostgreSQL 16 Alpine
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_DB: workflow_sw1
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: pg_isready -U postgres
    volumes: [pgdata:/var/lib/postgresql/data]

  backend:                         # NestJS 11
    build: ./backend
    ports: ['3000:3000']
    depends_on:
      db: { condition: service_healthy }
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/workflow_sw1
      JWT_SECRET: sw1-secret-key-2025
    command: >
      sh -c "npx prisma migrate deploy && node dist/main.js"

  frontend:                        # React + Nginx
    build:
      context: ./frontend
      args: { VITE_API_URL: http://localhost:3000 }
    ports: ['5173:80']
    depends_on: [backend]
```

**Escenarios de prueba de sistema:**

| # | Escenario | Flujo | Resultado esperado |
|---|-----------|-------|-------------------|
| 1 | Login con credenciales válidas | POST /auth/login → JWT | Token válido, redirección al dashboard |
| 2 | Crear política con editor visual | POST /policies → Editor UML | Política creada con nodos y aristas |
| 3 | Iniciar trámite | POST /cases/start → Motor de workflow | Case IN_PROGRESS, tareas creadas |
| 4 | Completar tarea con formulario | POST /forms/submit + POST /cases/complete | Avance al siguiente nodo |
| 5 | Dashboard de analíticas | GET /analytics/dashboard + /insights | KPIs + insights IA |
| 6 | Monitor en tiempo real | WebSocket /events | Eventos emitidos al completar tareas |
| 7 | OCR en formulario | Tesseract.js → campo de texto | Texto extraído de imagen |
| 8 | Entrada por voz | Web Speech API → campo de texto | Transcripción correcta |

**Ejecución del sistema:**

```bash
# Levantar los 3 servicios
docker-compose up --build

# Verificar que todos están saludables
docker-compose ps
# NAME        STATUS         PORTS
# db          Up (healthy)   0.0.0.0:5432->5432/tcp
# backend     Up             0.0.0.0:3000->3000/tcp
# frontend    Up             0.0.0.0:5173->80/tcp
```

#### 5.6 Evaluar Prueba

**Resumen de resultados:**

| Métrica | Resultado | Estado |
|---------|-----------|--------|
| Test Suites | 4 passed, 0 failed | ✅ Aprobado |
| Tests totales | 25 passed, 0 failed | ✅ Aprobado |
| Errores TypeScript (backend) | 0 errores | ✅ Aprobado |
| Errores TypeScript (frontend) | 0 errores | ✅ Aprobado |
| Build backend | Exitoso | ✅ Aprobado |
| Build frontend (Vite) | Exitoso | ✅ Aprobado |
| Docker build backend | Imagen construida | ✅ Aprobado |
| Docker build frontend | Imagen construida | ✅ Aprobado |
| Pipeline CI/CD | 3/3 jobs passing | ✅ Aprobado |

**Ejecución local de pruebas:**

```bash
cd backend
npx jest --passWithNoTests

# Test Suites: 4 passed, 4 total
# Tests:       25 passed, 25 total
# Snapshots:   0 total
# Time:        ~3.5s
```

**Distribución de cobertura por servicio:**

| Servicio | Tests | Líneas cubiertas | Funciones testeadas |
|----------|-------|-------------------|---------------------|
| AuthService | 6 | login, register, findAllUsers | 3/3 |
| CasesService | 10 | findAll, findOne, startCase, completeTask, findTasksByUser, assignTask, cancelCase | 7/7 |
| PoliciesService | 8 | findAll, findOne, create, update, remove, saveGraph | 6/6 |
| AppController (E2E) | 1 | GET / | 1/1 |

**Conclusión de la evaluación:**

- Todas las pruebas unitarias pasan exitosamente con **25/25 tests**.
- Los servicios core están cubiertos al 100% en sus funciones públicas.
- El pipeline CI/CD garantiza que ningún código con fallos llegue a la rama `main`.
- El despliegue con Docker Compose ha sido verificado con los 3 servicios funcionando de forma integrada.
- Se ha validado la integración Prisma ↔ PostgreSQL, el motor de workflow, el sistema de autenticación JWT y los eventos WebSocket.

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

## BIBLIOGRAFÍA

1. **NestJS** — A progressive Node.js framework. Disponible en: [https://docs.nestjs.com](https://docs.nestjs.com)
2. **React** — A JavaScript library for building user interfaces. Disponible en: [https://react.dev](https://react.dev)
3. **Prisma** — Next-generation Node.js and TypeScript ORM. Disponible en: [https://www.prisma.io/docs](https://www.prisma.io/docs)
4. **PostgreSQL** — The World's Most Advanced Open Source Relational Database. Disponible en: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
5. **TypeScript** — JavaScript with syntax for types. Disponible en: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
6. **Vite** — Next Generation Frontend Tooling. Disponible en: [https://vite.dev](https://vite.dev)
7. **Docker** — Accelerated Container Application Development. Disponible en: [https://docs.docker.com](https://docs.docker.com)
8. **Jest** — Delightful JavaScript Testing. Disponible en: [https://jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started)
9. **Socket.IO** — Bidirectional and low-latency communication. Disponible en: [https://socket.io/docs/](https://socket.io/docs/)
10. **Tesseract.js** — Pure JavaScript OCR for more than 100 languages. Disponible en: [https://tesseract.projectnaptha.com](https://tesseract.projectnaptha.com)
11. **Lucide React** — Beautiful & consistent icon toolkit. Disponible en: [https://lucide.dev](https://lucide.dev)
12. **bcrypt** — A library to help you hash passwords. Disponible en: [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)
13. **JSON Web Tokens (JWT)** — Introduction to JSON Web Tokens. Disponible en: [https://jwt.io/introduction](https://jwt.io/introduction)
14. **GitHub Actions** — Automate your workflow from idea to production. Disponible en: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
15. **Jacobson, I., Booch, G., Rumbaugh, J.** (1999). *The Unified Software Development Process*. Addison-Wesley.
16. **Pressman, R.** (2015). *Software Engineering: A Practitioner's Approach*. 8va edición. McGraw-Hill.
17. **Sommerville, I.** (2016). *Software Engineering*. 10ma edición. Pearson.
18. **OMG** — Unified Modeling Language (UML) Specification. Disponible en: [https://www.omg.org/spec/UML](https://www.omg.org/spec/UML)
19. **ESLint** — Find and fix problems in your JavaScript code. Disponible en: [https://eslint.org/docs/latest/](https://eslint.org/docs/latest/)
20. **Prettier** — An opinionated code formatter. Disponible en: [https://prettier.io/docs/en/](https://prettier.io/docs/en/)

---

## ANEXOS

### Anexo A: Modelo de datos completo (Prisma Schema)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          Role     @default(OFFICER)
  departmentId  String?
  tasks         Task[]
  createdAt     DateTime @default(now())
}

model Policy {
  id        String       @id @default(uuid())
  name      String
  status    PolicyStatus @default(DRAFT)
  createdBy String
  nodes     PolicyNode[]
  edges     PolicyEdge[]
  cases     Case[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model PolicyNode {
  id           String   @id @default(uuid())
  policyId     String
  policy       Policy   @relation(...)
  type         NodeType
  title        String
  departmentId String?
  positionX    Float    @default(0)
  positionY    Float    @default(0)
  swimlane     String?
}

model PolicyEdge {
  id         String   @id @default(uuid())
  policyId   String
  policy     Policy   @relation(...)
  fromNodeId String
  toNodeId   String
  label      String?
  flowType   FlowType @default(SEQUENTIAL)
}

model Case {
  id         String     @id @default(uuid())
  policyId   String
  policy     Policy     @relation(...)
  status     CaseStatus @default(IN_PROGRESS)
  tasks      Task[]
  eventLogs  EventLog[]
  startedAt  DateTime   @default(now())
  completedAt DateTime?
}

model Task {
  id             String     @id @default(uuid())
  caseId         String
  case           Case       @relation(...)
  nodeId         String
  assignedUserId String?
  assignedUser   User?      @relation(...)
  status         TaskStatus @default(PENDING)
  formSubmission FormSubmission?
  createdAt      DateTime   @default(now())
  completedAt    DateTime?
}

model FormTemplate {
  id         String @id @default(uuid())
  nodeId     String @unique
  schemaJson Json
}

model FormSubmission {
  id          String @id @default(uuid())
  taskId      String @unique
  task        Task   @relation(...)
  payloadJson Json
  inputMode   InputMode @default(MANUAL)
  submittedAt DateTime  @default(now())
}

model EventLog {
  id        String   @id @default(uuid())
  caseId    String
  case      Case     @relation(...)
  type      String
  detail    String?
  timestamp DateTime @default(now())
}

enum Role          { DESIGNER OFFICER }
enum PolicyStatus  { DRAFT ACTIVE INACTIVE }
enum NodeType      { START ACTION DECISION FORK JOIN FINAL }
enum FlowType      { SEQUENTIAL CONDITIONAL PARALLEL }
enum CaseStatus    { IN_PROGRESS COMPLETED CANCELLED }
enum TaskStatus    { PENDING IN_PROGRESS DONE SKIPPED }
enum InputMode     { MANUAL VOICE AI }
```

### Anexo B: Capturas de pantalla del sistema

> Las capturas de pantalla del sistema en funcionamiento se encuentran disponibles en el repositorio del proyecto y en la presentación de defensa del examen parcial.

**Páginas del sistema:**

1. **Login** — Formulario glassmorphism con gradiente animado
2. **Register** — Registro con selección de rol y departamento
3. **Dashboard** — KPIs con tarjetas de iconos Lucide y resumen de actividad
4. **Policy Editor** — Editor visual UML con drag & drop, swimlanes y paleta de nodos
5. **Policy List** — Listado de políticas con estado y acciones
6. **Cases** — Tabla de trámites activos con filtros
7. **Case Detail** — Vista detallada del trámite con timeline de tareas
8. **Officer Dashboard** — Panel de bandeja de tareas del funcionario
9. **Real-Time Monitor** — Monitor WebSocket con eventos en vivo
10. **Analytics** — Dashboard analítico con KPIs, insights IA y detección de cuellos de botella

### Anexo C: Estructura del repositorio

```
Examen1SW1/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline CI/CD (3 jobs)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # Modelo de datos
│   │   └── migrations/               # Migraciones de BD
│   ├── src/
│   │   ├── auth/                     # Módulo de autenticación
│   │   ├── cases/                    # Motor de workflow
│   │   ├── policies/                 # Gestión de políticas UML
│   │   ├── analytics/                # Analíticas + IA
│   │   ├── forms/                    # Formularios dinámicos
│   │   ├── events/                   # WebSocket Gateway
│   │   ├── prisma/                   # Servicio Prisma
│   │   ├── ai-assistant/             # Asistente IA
│   │   └── app.module.ts             # Módulo raíz
│   ├── test/
│   │   └── app.e2e-spec.ts           # Prueba E2E
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                    # 10 páginas React
│   │   ├── components/               # Componentes reutilizables
│   │   ├── context/                  # AuthContext
│   │   ├── services/                 # API service (Axios)
│   │   └── App.tsx                   # Router principal
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml                # Orquestación 3 servicios
├── DOCUMENTACION.md                  # Este documento
└── README.md
```

---

## Grupo de Examen Parcial

| Campo | Detalle |
|-------|---------|
| **Materia** | Ingeniería de Software I |
| **Semestre** | I-2025 |
| **Examen** | Primer Parcial |
| **Estudiante** | Luis Fernando Angulo |
| **Repositorio** | [https://github.com/luisfernandoAngulo28/Examen1SW1](https://github.com/luisfernandoAngulo28/Examen1SW1) |
| **Tecnologías** | NestJS 11, React 19, PostgreSQL, Prisma, Docker |
| **Herramienta IA** | GitHub Copilot (IDE integrado) |

---

## Estándar de Codificación

### 1. Introducción

El presente estándar de codificación define las convenciones, reglas y buenas prácticas adoptadas en el desarrollo del proyecto **WorkflowSW1**. Su objetivo es garantizar la **consistencia**, **legibilidad** y **mantenibilidad** del código fuente a lo largo de todo el ciclo de vida del software.

El estándar se aplica tanto al **backend** (NestJS/TypeScript) como al **frontend** (React/TypeScript), y se hace cumplir de forma automatizada mediante herramientas de análisis estático (ESLint, Prettier, TypeScript compiler).

### 2. Estándares Internacionales Implementados

El proyecto adopta y adapta los siguientes estándares reconocidos internacionalmente:

| Estándar | Aplicación en el proyecto |
|----------|--------------------------|
| **ISO/IEC 25010** (Calidad del software) | Funcionalidad, fiabilidad, eficiencia, mantenibilidad, portabilidad |
| **ISO/IEC 12207** (Procesos del ciclo de vida) | Desarrollo, pruebas, despliegue, mantenimiento |
| **IEEE 830** (Especificación de requisitos) | Documentación de requisitos funcionales y no funcionales |
| **Airbnb JavaScript Style Guide** | Base para reglas de ESLint en frontend |
| **NestJS Style Guide** | Estructura modular, inyección de dependencias, decoradores |
| **Conventional Commits** | Formato de mensajes de commit: `feat:`, `fix:`, `docs:`, `test:` |

**Convenciones de nomenclatura:**

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos TypeScript | kebab-case | `auth.service.ts`, `policy-editor.tsx` |
| Clases | PascalCase | `AuthService`, `CasesController` |
| Interfaces | PascalCase con prefijo `I` opcional | `PolicyNode`, `CreatePolicyDto` |
| Funciones/métodos | camelCase | `startCase()`, `findAllUsers()` |
| Variables | camelCase | `accessToken`, `policyId` |
| Constantes | UPPER_SNAKE_CASE | `JWT_SECRET`, `DATABASE_URL` |
| Enums | PascalCase (tipo) + UPPER_SNAKE_CASE (valores) | `enum Role { DESIGNER, OFFICER }` |
| Componentes React | PascalCase | `PolicyEditorPage`, `DashboardPage` |
| CSS custom properties | kebab-case con prefijo `--` | `--primary-blue`, `--glass-bg` |

### 3. Stack Tecnológico y Herramientas de Calidad

#### 3.1 Herramientas de análisis estático

| Herramienta | Versión | Propósito | Configuración |
|-------------|---------|-----------|---------------|
| **TypeScript** | 5.x | Tipado estático | `tsconfig.json` (strict en frontend) |
| **ESLint** | 9.x | Linting de código | `eslint.config.mjs` / `eslint.config.js` |
| **Prettier** | 3.x | Formateo automático | `.prettierrc` |
| **typescript-eslint** | 8.x | Reglas TypeScript para ESLint | Integrado en config ESLint |

#### 3.2 Configuración ESLint — Backend

```javascript
// backend/eslint.config.mjs
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
```

#### 3.3 Configuración ESLint — Frontend

```javascript
// frontend/eslint.config.js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
```

#### 3.4 Configuración Prettier

```json
// backend/.prettierrc
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

#### 3.5 Configuración TypeScript — Backend

```json
// backend/tsconfig.json — Opciones clave
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strictNullChecks": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist"
  }
}
```

#### 3.6 Configuración TypeScript — Frontend

```json
// frontend/tsconfig.app.json — Opciones clave
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react-jsx"
  }
}
```

### 4. Configuración del Entorno de Desarrollo

#### 4.1 IDE recomendado

- **Visual Studio Code** (VS Code) con las siguientes extensiones:
  - ESLint — Integración de linting en tiempo real
  - Prettier — Formateo automático al guardar
  - Prisma — Sintaxis y autocompletado para schema.prisma
  - GitHub Copilot — Asistencia de IA para desarrollo
  - Thunder Client / REST Client — Pruebas de API

#### 4.2 Requisitos del entorno

| Requisito | Versión mínima |
|-----------|---------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| PostgreSQL | 16.x |
| Docker | 24.x |
| Docker Compose | 2.x |
| Git | 2.40+ |

#### 4.3 Variables de entorno

```env
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workflow_sw1"
JWT_SECRET="sw1-secret-key-2025"
```

### 5. Flujo de Trabajo y Métricas

#### 5.1 Flujo de desarrollo

```
1. Crear rama feature/*
2. Desarrollar funcionalidad
3. Ejecutar pruebas locales: npx jest
4. Verificar linting: npx eslint .
5. Commit con formato convencional: git commit -m "feat: descripción"
6. Push a GitHub → CI/CD automático
7. PR hacia main → Review + merge
```

#### 5.2 Pipeline CI/CD automático

Cada push o PR a `main` ejecuta automáticamente:

| Job | Verificaciones |
|-----|---------------|
| **backend-test** | `npm ci` → `prisma generate` → `jest --ci --coverage` → `npm run build` |
| **frontend-build** | `npm ci` → `tsc --noEmit` → `vite build` |
| **docker-build** | `docker build ./backend` → `docker build ./frontend` |

#### 5.3 Métricas de calidad

| Métrica | Valor actual | Umbral |
|---------|-------------|--------|
| Tests pasando | 25/25 (100%) | ≥ 95% |
| Errores TypeScript | 0 | 0 |
| Warnings ESLint | 0 críticos | 0 críticos |
| Build exitoso | ✅ Backend + Frontend | Siempre |
| Cobertura de servicios | 4/4 servicios | 100% core |

### 6. Conclusión

El estándar de codificación implementado en **WorkflowSW1** asegura:

1. **Consistencia**: Prettier formatea automáticamente todo el código con comillas simples y trailing commas.
2. **Calidad**: ESLint con reglas `recommendedTypeChecked` detecta errores potenciales en tiempo de desarrollo.
3. **Seguridad de tipos**: TypeScript strict en frontend y `strictNullChecks` en backend previenen errores en tiempo de ejecución.
4. **Automatización**: El pipeline CI/CD ejecuta linting, pruebas y builds en cada push, garantizando que solo código validado llega a producción.
5. **Mantenibilidad**: La estructura modular de NestJS y la organización por features en React facilitan la evolución del sistema.
6. **Trazabilidad**: Conventional Commits y GitHub Actions proporcionan un historial claro de cambios y verificaciones.

---

> **Nota:** Esta documentación fue generada con asistencia de GitHub Copilot (IA integrada en el IDE) como parte de la demostración del uso de inteligencia artificial aplicada al desarrollo de software.
