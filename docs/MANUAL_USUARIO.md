# Manual de Usuario
# Sistema WorkflowSW1 — Gestión de Trámites con IA

**URL del sistema:** `http://54.233.18.87:4200`

---

## Índice

1. [¿Qué es WorkflowSW1?](#1-qué-es-workflowsw1)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Credenciales de demo](#3-credenciales-de-demo)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Login y navegación](#5-login-y-navegación)
6. [ROL ADMIN — Panel y gestión](#6-rol-admin--panel-y-gestión)
7. [ROL DESIGNER — Editor de políticas](#7-rol-designer--editor-de-políticas)
8. [ROL CLIENT — Iniciar un trámite con IA](#8-rol-client--iniciar-un-trámite-con-ia)
9. [ROL OFFICER — Bandeja y ejecución de tareas](#9-rol-officer--bandeja-y-ejecución-de-tareas)
10. [Motor Inteligente de Enrutamiento (ML)](#10-motor-inteligente-de-enrutamiento-ml)
11. [Edición colaborativa de documentos](#11-edición-colaborativa-de-documentos)
12. [Monitor en tiempo real](#12-monitor-en-tiempo-real)
13. [Analítica y reportes IA](#13-analítica-y-reportes-ia)
14. [Flujo de demo completo](#14-flujo-de-demo-completo)

---

## 1. ¿Qué es WorkflowSW1?

WorkflowSW1 es un sistema de gestión de trámites municipales y empresariales que combina:

- **Motor de workflows** basado en Diagramas de Actividad UML 2.5
- **Inteligencia Artificial** para asignación automática de trámites (spaCy NLP + OpenAI)
- **Machine Learning** (TensorFlow/Keras) para predicción de riesgo de demora
- **WebSocket en tiempo real** para colaboración y monitoreo
- **Formularios dinámicos** con dictado por voz y extracción NLP

### Caso de uso del negocio

Un ciudadano (CLIENT) quiere obtener un **Permiso Municipal** o una **Licencia de Funcionamiento**. El sistema:

1. El cliente describe su necesidad en lenguaje natural a un **agente IA**
2. La IA asigna automáticamente la **política** correcta (tipo de trámite)
3. El trámite recorre el **diagrama UML** nodo por nodo
4. Los **funcionarios** (OFFICER) atienden cada etapa del proceso
5. El **Motor ML** alerta si un caso tiene riesgo de demora antes de avanzar
6. Los documentos del caso se comparten en **sesiones colaborativas en vivo**

---

## 2. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 — 54.233.18.87                   │
│                                                             │
│  ┌──────────────┐    ┌──────────────────┐                   │
│  │  Angular 18  │    │  Spring Boot 3.5 │                   │
│  │  Nginx       │◄──►│  Java 22         │◄──► MongoDB       │
│  │  :4200       │    │  :8080           │     :27017        │
│  └──────────────┘    └────────┬─────────┘                   │
│                               │ HTTP                        │
│                    ┌──────────┴──────────┐                  │
│                    │                     │                  │
│           ┌────────▼──────┐   ┌──────────▼──────┐          │
│           │  FastAPI NLP  │   │  TensorFlow ML  │          │
│           │  spaCy NLP    │   │  Keras modelo   │          │
│           │  :8000        │   │  :8001          │          │
│           └───────────────┘   └─────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

| Servicio | Tecnología | Puerto | Función |
|---|---|---|---|
| Frontend | Angular 18 + Nginx | 4200 | Interfaz web |
| Backend | Spring Boot 3.5 / Java 22 | 8080 | Motor de workflow + API REST + WebSocket STOMP |
| Base de datos | MongoDB 7 | 27017 | Documentos, casos, usuarios |
| AI Service | FastAPI + Python + spaCy | 8000 | NLP: asignación de política, extracción de formularios |
| ML Service | FastAPI + TensorFlow/Keras | 8001 | Predicción de riesgo, prioridad, anomalías |

---

## 3. Credenciales de demo

**URL:** `http://54.233.18.87:4200`

| Rol | Email | Contraseña | Panel principal |
|---|---|---|---|
| **ADMIN** | `admin@demo.com` | `admin123` | Dashboard ML, gestión completa |
| **DESIGNER** | `designer1@demo.com` | `designer123` | Editor UML, políticas |
| **OFFICER** | `officer1@demo.com` | `officer123` | Bandeja de tareas |
| **OFFICER** | `officer2@demo.com` | `officer123` | Bandeja de tareas (técnico) |
| **CLIENT** | `client1@demo.com` | `client123` | Iniciar trámites con agente IA |

### Políticas activas en el sistema

| Política | ID | Nodo inicial |
|---|---|---|
| Solicitud de Permiso Municipal | `6a23931ae65e220810dc223c` | `n1` |
| Licencia de Funcionamiento | `6a23931be65e220810dc223d` | `a1` |

---

## 4. Roles y permisos

```
ADMIN     → Ve todo: ML dashboard, políticas, casos, usuarios, analítica
DESIGNER  → Crea y edita políticas, diagramas UML, formularios, requisitos
OFFICER   → Atiende tareas asignadas, completa formularios, colabora en documentos
CLIENT    → Inicia trámites usando el agente IA conversacional
```

| Funcionalidad | ADMIN | DESIGNER | OFFICER | CLIENT |
|---|:---:|:---:|:---:|:---:|
| Dashboard ML con TensorFlow | ✅ | ❌ | ❌ | ❌ |
| Gestión de políticas | ✅ | ✅ | ❌ | ❌ |
| Editor UML + Export PNG | ✅ | ✅ | ❌ | ❌ |
| Diseñador de formularios | ✅ | ✅ | ❌ | ❌ |
| Registrar usuarios | ✅ | ❌ | ❌ | ❌ |
| Iniciar trámite (agente IA) | ✅ | ❌ | ❌ | ✅ |
| Bandeja de tareas | ❌ | ❌ | ✅ | ❌ |
| Motor ML (alerta riesgo) | ❌ | ❌ | ✅ | ❌ |
| Edición colaborativa | ✅ | ✅ | ✅ | ❌ |
| Monitor en tiempo real | ✅ | ✅ | ✅ | ❌ |
| Analítica y reportes IA | ✅ | ✅ | ✅ | ❌ |

---

## 5. Login y navegación

### Pantalla de ingreso

```
┌──────────────────────────────────────────┐
│                                          │
│     ⚡ Workflow  SW1                     │
│   Sistema de Gestión de Trámites         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Correo:  admin@demo.com           │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Contraseña: ••••••••              │  │
│  └────────────────────────────────────┘  │
│                                          │
│      [ Iniciar sesión ]                  │
│                                          │
└──────────────────────────────────────────┘
```

Después de login, la barra lateral muestra opciones **según el rol** del usuario. Cada rol ve un menú diferente.

### Semáforo visual de estados

| Color | Estado del trámite | Estado de tarea |
|---|---|---|
| 🟢 Verde | COMPLETED | DONE |
| 🟡 Amarillo | IN_PROGRESS | IN_PROGRESS |
| 🔴 Rojo | Bloqueado | PENDING |

---

## 6. ROL ADMIN — Panel y gestión

### 6.1 Dashboard principal

Al ingresar como ADMIN aparece el panel con métricas del sistema y las predicciones del Motor ML.

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │     8      │ │     8      │ │     0      │ │      8      │  │
│  │  Trámites  │ │    En      │ │Completados │ │   Tareas    │  │
│  │  Totales   │ │ Progreso   │ │            │ │ Pendientes  │  │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────┘  │
│                                                                 │
│  Predicciones IA  [🐾 TensorFlow activo]                        │
│  ┌────────────────┐ ┌──────────────────┐ ┌───────────────────┐  │
│  │ ⚠️ Riesgo de  │ │ 🎯 Prioridad de  │ │ 🔍 Anomalías      │  │
│  │   Demora       │ │    Tareas        │ │    Detectadas     │  │
│  │                │ │                  │ │                   │  │
│  │ BAJO  Perm.#1  │ │ ● Revisión Téc.  │ │ ✓ Sin anomalías  │  │
│  │ BAJO  Lic.#3   │ │ ● Inspección     │ │   detectadas     │  │
│  │ BAJO  Perm.#5  │ │ ● Revisión Téc.  │ │                   │  │
│  │ BAJO  Lic.#7   │ │ ● Inspección     │ │                   │  │
│  └────────────────┘ └──────────────────┘ └───────────────────┘  │
│                                                                 │
│  Políticas de Negocio                    [+ Nueva Política]     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Solicitud de Permiso Municipal  ACTIVO  05/06  Editar  │    │
│  │  Licencia de Funcionamiento      ACTIVO  05/06  Editar  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Qué significan las predicciones ML

| Sección | Descripción |
|---|---|
| **Riesgo de Demora** | El modelo TensorFlow predice qué casos tienen probabilidad de atrasarse. Niveles: BAJO / MEDIO / ALTO |
| **Prioridad de Tareas** | Ordena las tareas pendientes por urgencia según el modelo ML |
| **Anomalías Detectadas** | Detecta patrones inusuales en los tiempos de ejecución |

### 6.3 Registrar un nuevo usuario

1. Barra lateral → **"Registrar Usuario"**
2. Ingresar nombre, email, contraseña y **rol** (ADMIN / DESIGNER / OFFICER / CLIENT)
3. Clic en **"Registrar"**

---

## 7. ROL DESIGNER — Editor de políticas

### 7.1 Crear una nueva política

1. Dashboard → **"+ Nueva Política"**
2. Ingresar nombre y descripción
3. Clic en **"Crear"** — el sistema abre el editor visual

### 7.2 Editor visual de diagramas UML

```
┌─────────────────────────────────────────────────────────────────┐
│  [INITIAL▾] [Nombre actividad...] [Depto▾] [+ Agregar]          │
│  [Guardar]  [Exportar PNG]                                       │
├────────────────────────────────┬────────────────────────────────┤
│                                │  [🤖 IA]  [📝 Formulario]      │
│   LIENZO DEL DIAGRAMA          │  [📋 Requisitos]               │
│                                │                                │
│  ●  INICIO                     │  Panel lateral según pestaña   │
│  │                             │  seleccionada                  │
│  ▼                             │                                │
│ ┌─────────────────┐            │                                │
│ │ Revisión Técnica│  ACTION    │                                │
│ │ [Rev. Técnica]  │            │                                │
│ └────────┬────────┘            │                                │
│          ▼                     │                                │
│ ┌─────────────────┐            │                                │
│ │ Inspección Campo│  ACTION    │                                │
│ └────────┬────────┘            │                                │
│          ▼                     │                                │
│        ◎  FIN                  │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

### 7.3 Tipos de nodos UML

| Nodo | Símbolo | Uso |
|---|---|---|
| **INITIAL** | ⬤ círculo relleno | Punto de entrada — siempre primero |
| **ACTION** | ▭ rectángulo | Tarea que ejecuta un departamento |
| **DECISION** | ◇ rombo | Bifurcación condicional (Aprobado/Rechazado) |
| **FORK** | ━ barra gruesa | Inicia ramas paralelas |
| **JOIN** | ━ barra gruesa | Espera que terminen todas las ramas |
| **FINAL** | ◎ círculo con borde | Fin del proceso |

### 7.4 Agregar nodos y conexiones

**Agregar un nodo:**
1. Seleccionar tipo en el dropdown (INITIAL, ACTION, etc.)
2. Para ACTION: escribir nombre y seleccionar departamento
3. Clic en **"+ Agregar"**

**Conectar nodos:**
1. Pasar el cursor sobre un nodo — aparecen puntos de conexión
2. Clic y arrastrar desde el punto hasta el nodo destino
3. Para DECISION: ingresar la etiqueta de condición (ej: "Aprobado")

### 7.5 Pestaña Requisitos (por nodo ACTION)

Cada nodo puede tener requisitos documentales que el ciudadano debe cumplir:

```
┌─────────────────────────────────────────────────┐
│  📋 Requisitos del nodo "Revisión Técnica"       │
│                                                 │
│  Requisito 1:  Plano arquitectónico             │
│  Requisito 2:  Certificado de suelo             │
│  Requisito 3:  Pago de tasa municipal           │
│                                                 │
│  [+ Agregar requisito]   [Guardar requisitos]   │
└─────────────────────────────────────────────────┘
```

El agente IA usa estos requisitos para informar al ciudadano qué documentos debe presentar antes de iniciar el trámite.

### 7.6 Exportar diagrama como PNG

En la barra superior del editor aparece el botón **"Exportar PNG"**.

1. Asegurarse de estar en la **vista de swimlanes** (calles por departamento)
2. Clic en **"Exportar PNG"**
3. El sistema descarga el diagrama como imagen PNG de alta resolución
4. Si falla, descarga como SVG automáticamente

### 7.7 Diseñador de formularios dinámicos

Pestaña **"Formulario"** en el panel lateral al seleccionar un nodo ACTION.

| Tipo de campo | Descripción |
|---|---|
| **Texto** | Campo de una línea |
| **Número** | Campo numérico |
| **Fecha** | Selector con calendario |
| **Párrafo** | Área multilínea + dictado por voz |
| **Selección** | Dropdown con opciones |
| **Grid** | Tabla dinámica con columnas configurables |
| **Botón** | Acción personalizada |
| **Label** | Texto de solo lectura |

### 7.8 Asistente IA en el editor

Pestaña **"IA"** en el panel lateral. Permite crear nodos con lenguaje natural:

| Comando | Resultado |
|---|---|
| `"Agrega Revisión Legal en el departamento Legal"` | Crea nodo ACTION |
| `"Crea un nodo de decisión ¿Documentos completos?"` | Crea nodo DECISION |
| `"Conecta Revisión Técnica con Inspección"` | Crea la arista |
| `"Crea flujo paralelo para RRHH, Legal y Finanzas"` | Genera FORK + 3 ACTION + JOIN |

### 7.9 Vista Swimlanes (calles)

Organiza los nodos en carriles por departamento. Usa el toggle de vista en el editor para cambiar entre vista libre y swimlanes.

```
│  REVISIÓN TÉCNICA  │   APROBACIONES   │
│                    │                  │
│  ┌──────────────┐  │                  │
│  │ Rev. Técnica │  │                  │
│  └──────┬───────┘  │                  │
│         │          │  ┌────────────┐  │
│         └──────────┼─►│ Aprobación │  │
│                    │  └────────────┘  │
```

---

## 8. ROL CLIENT — Iniciar un trámite con IA

### 8.1 Acceder al agente

Sidebar → **"Iniciar Trámite"** (ícono robot 🤖)

```
┌──────────────────────────────────────────────────────────────┐
│  🤖 Agente de Trámites — WorkflowSW1                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🤖  Hola, soy tu asistente de trámites. ¿En qué te    │  │
│  │     puedo ayudar hoy?                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤  Quiero abrir un negocio de comida en el centro     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🤖  Entendido. Para eso necesitas una Licencia de      │  │
│  │     Funcionamiento. Los requisitos son:                │  │
│  │     1. Plano del local                                 │  │
│  │     2. RUC del negocio                                 │  │
│  │     3. Certificado de salud                            │  │
│  │     ¿Deseas iniciar el trámite ahora?                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────┐  [🎤]  [Enviar]   │
│  │  Escribe tu consulta aquí...         │                   │
│  └──────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Cómo funciona la asignación automática de política

```
Cliente escribe o habla → AI Service (spaCy + OpenAI)
       │
       ├─► spaCy es_core_news_lg calcula similitud vectorial
       │   con los nombres de las políticas disponibles
       │
       ├─► Si OpenAI disponible: usa GPT para análisis semántico
       │
       └─► Retorna: política asignada + confianza + requisitos
```

El sistema usa el modelo de español **`es_core_news_lg`** de spaCy (Deep Learning) para comparar la descripción del ciudadano con las políticas. Si la confianza es alta (>70%), asigna automáticamente.

### 8.3 Iniciar el trámite

Después de que el agente identifica la política:

1. El agente muestra los **requisitos** del proceso
2. El cliente confirma que quiere iniciar
3. El sistema crea el **caso** automáticamente
4. El trámite aparece en la bandeja de los **Officers** correspondientes

### 8.4 Ver mis trámites (CLIENT)

Sidebar → **"Mis Trámites"** — muestra el estado de todos los casos del cliente con indicadores de semáforo.

---

## 9. ROL OFFICER — Bandeja y ejecución de tareas

### 9.1 Mi Bandeja de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│  Mi Bandeja de Trabajo          Bienvenido, Officer Demo  ●EN VIVO│
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │   5    │  │   0    │  │   0    │  │   5    │               │
│  │Pendien.│  │ En     │  │Complet.│  │ Total  │               │
│  │        │  │Progreso│  │        │  │        │               │
│  └────────┘  └────────┘  └────────┘  └────────┘               │
│                                                                 │
│  [Todas (5)] [Mis tareas] [Sin asignar]      [↑↓ Por prioridad]│
│                                                                 │
│  ESTADO     ACTIVIDAD          POLÍTICA               ACCIONES  │
│  ● Pendiente  Revisión Técnica  Solicitud Permiso     [Atender] │
│  ● Pendiente  Inspección Campo  Licencia Funcionam.   [Atender] │
│  ● Pendiente  Revisión Técnica  Solicitud Permiso     [Atender] │
└─────────────────────────────────────────────────────────────────┘
```

**Indicador "● EN VIVO"** — confirma que la conexión WebSocket está activa y la bandeja se actualiza en tiempo real.

### 9.2 Atender una tarea

1. Clic en **"Atender"** en cualquier tarea
2. Se abre el **detalle del caso** con la tarea activa
3. Llenar el formulario si existe (o dictarlo por voz)
4. Subir documentos si se requieren
5. Clic en **"✓ Completar"**

> **IMPORTANTE:** Al hacer clic en "Completar", el **Motor Inteligente ML** evalúa el riesgo del caso antes de avanzar. Ver sección 10.

### 9.3 Llenar formulario con dictado NLP

En las tareas con campo **Párrafo**, aparece un botón de micrófono 🎤.

1. Clic en **"🎙️ Dictar todo"**
2. Hablar en español describiendo todos los datos
3. El NLP (spaCy) extrae automáticamente: nombres, fechas, organizaciones, lugares
4. Los campos se llenan con indicador de confianza

```
"El solicitante es Juan Pérez, de la empresa Café Centro,
 ubicado en la calle principal, con fecha de inicio 15 de junio"

→ nombre:  Juan Pérez       [confianza: 94%] 🟢
→ empresa: Café Centro       [confianza: 87%] 🟢
→ lugar:   calle principal   [confianza: 72%] 🟡
→ fecha:   15/06/2026        [confianza: 89%] 🟢
```

### 9.4 Gestión de documentos en una tarea

Dentro del detalle del caso, cada tarea tiene un panel de documentos:

- **Subir archivo** — PDF, imágenes, Word, Excel
- **Ver en línea** — preview inline (PDF, imágenes)
- **Sesión colaborativa** — abre el documento con otros usuarios en tiempo real
- **Permisos** — asignar acceso Lectura / Lectura+Subida / Acceso completo por usuario

---

## 10. Motor Inteligente de Enrutamiento (ML)

Este es el componente más avanzado del sistema. Usa **TensorFlow/Keras** para predecir si un caso va a demorarse antes de avanzar al siguiente nodo.

### 10.1 Cómo funciona

```
Officer hace clic en "✓ Completar"
       │
       ▼
Motor ML consulta GET /api/ml/dashboard
       │
       ▼
Busca el caso actual en las predicciones
       │
       ├─ risk_score ≤ 20%  →  Avanza directamente ✅
       │
       └─ risk_score > 20%  →  Muestra modal de advertencia ⚠️
                                (MEDIO / ALTO)
```

### 10.2 Modal de advertencia

Cuando el Motor ML detecta riesgo, aparece un modal que bloquea el avance:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                   ⚠️                            │
│                                                 │
│          Riesgo Detectado por IA                │
│                                                 │
│  El Motor Inteligente de Enrutamiento           │
│  (ML/TensorFlow) detectó probabilidad de        │
│  demora en este trámite. Nivel: MEDIO           │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Puntuación de riesgo:            30%    │    │
│  │                                         │    │
│  │ Recomendación IA: Avance normal.        │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [← Cancelar y revisar]  [Avanzar de todas →]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

| Botón | Acción |
|---|---|
| **← Cancelar y revisar** | Cierra el modal. El officer puede revisar el caso, agregar documentos, reasignar, etc. |
| **Avanzar de todas formas →** | Confirma la decisión y completa la tarea. El caso avanza al siguiente nodo. |

### 10.3 Predicciones del ML Dashboard (vista ADMIN)

El Admin ve en el Dashboard las predicciones para todos los casos activos:

| Columna | Descripción |
|---|---|
| **Caso** | ID y nombre del trámite |
| **Puntuación** | Porcentaje de riesgo calculado por el modelo |
| **Nivel** | BAJO / MEDIO / ALTO |
| **Recomendación** | Texto generado por el modelo |

---

## 11. Edición colaborativa de documentos

Permite que múltiples usuarios trabajen sobre el mismo documento al mismo tiempo con presencia en tiempo real.

### 11.1 Abrir una sesión colaborativa

En el detalle de cualquier caso → panel de documentos → clic en **"👥 Colaborar"** junto a un archivo.

```
┌────────────────────────────────────────────────────────────────┐
│  plano_local.pdf          SESIÓN COLABORATIVA EN VIVO          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Participantes en línea:                                       │
│  ┌────┐ ┌────┐ ┌────┐                                         │
│  │ O  │ │ A  │ │ D  │   ● 3 usuarios conectados               │
│  └────┘ └────┘ └────┘                                         │
│  Officer  Admin  Designer                                      │
│                                                                │
├─────────────────────────────────┬──────────────────────────────┤
│                                 │  Notas colaborativas         │
│   VISOR DEL DOCUMENTO           │                              │
│                                 │  ┌──────────────────────┐   │
│   [Vista en línea del PDF]      │  │ Officer: Revisar la  │   │
│                                 │  │ página 3 del plano   │   │
│                                 │  └──────────────────────┘   │
│                                 │  ┌──────────────────────┐   │
│                                 │  │ Admin: OK, aprobado  │   │
│                                 │  └──────────────────────┘   │
│                                 │                              │
│                                 │  ┌──────────────────────┐   │
│                                 │  │ Escribe una nota...  │   │
│                                 │  └──────────────────────┘   │
│                                 │  [Enviar]                    │
└─────────────────────────────────┴──────────────────────────────┘
```

### 11.2 Funcionalidades de la sesión colaborativa

| Función | Descripción |
|---|---|
| **Avatares con colores únicos** | Cada usuario tiene un color asignado aleatoriamente |
| **Indicador verde** | Punto verde = usuario activo en la sesión |
| **Notas en tiempo real** | Mensajes que aparecen instantáneamente via WebSocket |
| **Visor de documentos** | PDF e imágenes: vista inline. Word/Excel: visor de Office Online |
| **Presencia persistente** | Al salir, el avatar desaparece del panel de otros participantes |

### 11.3 Tipos de documentos soportados

| Tipo | Vista |
|---|---|
| PDF (`.pdf`) | Iframe directo en el panel |
| Imágenes (`.jpg`, `.png`, `.gif`) | Imagen renderizada |
| Word/Excel (`.doc`, `.docx`, `.xls`, `.xlsx`) | Microsoft Office Online Viewer |
| Otros | Botón de descarga directa |

---

## 12. Monitor en tiempo real

**Ruta:** Sidebar → **"Monitor en Vivo"**

Muestra todos los casos activos y el feed de eventos sin necesidad de recargar la página (WebSocket STOMP).

```
┌────────────────────────────────────────────────────────────────┐
│  ◉ Monitor en Vivo              WebSocket: CONECTADO ✅         │
├────────────────────────────────────────────────────────────────┤
│  CASOS ACTIVOS                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🟡 Solicitud de Permiso Municipal                       │  │
│  │     ├── 🟢 Inicio              DONE                     │  │
│  │     ├── 🟡 Revisión Técnica    IN_PROGRESS  Officer1    │  │
│  │     └── 🔴 Inspección Campo    PENDING                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  FEED DE EVENTOS EN VIVO                                       │
│  19:18  🟡 Officer1 tomó tarea "Revisión Técnica"             │
│  19:15  🟢 Tarea "Inicio" completada                          │
│  19:10  🆕 Trámite iniciado — Permiso Municipal               │
└────────────────────────────────────────────────────────────────┘
```

El semáforo de cada caso cambia de color **en tiempo real** cuando cualquier funcionario completa una tarea, sin recargar la página.

---

## 13. Analítica y reportes IA

**Ruta:** Sidebar → **"Analytics"** o **"Reportes IA"**

### Métricas disponibles

| Métrica | Descripción |
|---|---|
| Tasa de completitud | % de casos que llegan al nodo FINAL |
| Duración promedio | Tiempo medio de cada nodo en minutos |
| Cuellos de botella | Nodos con más del 40% de carga y tiempo 1.5× el promedio |
| Recomendación IA | Texto generado automáticamente con sugerencia de mejora |

### Exportar reportes

En la vista de analítica, botones para descargar:
- **Excel** — datos en hoja de cálculo
- **PDF** — reporte formateado
- **CSV** — datos planos para análisis

### Detección de cuello de botella

```
Nodo analizado
       │
       ├─ Tareas pendientes ≥ 2?          No → ✅ Normal
       │
       ├─ Duración > 1.5× promedio?       No → ✅ Normal
       │
       └─ Concentra ≥ 40% de la carga?    No → ✅ Normal
                   │
                   Sí a los tres → 🔴 CUELLO DE BOTELLA
                                   → Genera recomendación IA
```

---

## 14. Flujo de demo completo

Guía paso a paso para mostrar todas las funcionalidades del sistema.

### Mapa del flujo

```
[DESIGNER]          [CLIENT]            [OFFICER]           [ADMIN]
    │                   │                   │                  │
    ▼                   │                   │                  │
Crea política           │                   │                  │
Diseña UML              │                   │                  │
Agrega formularios      │                   │                  │
Define requisitos       │                   │                  │
Exporta PNG             │                   │                  │
    │                   ▼                   │                  │
    │           Habla con agente IA         │                  │
    │           IA asigna política          │                  │
    │           Inicia trámite              │                  │
    │                   │                  ▼                  │
    │                   │          Motor ML evalúa             │
    │                   │          Atiende tareas              │
    │                   │          Colabora en docs            │
    │                   │                  │                  ▼
    │                   │                  │         Ve dashboard ML
    │                   │                  │         Monitorea en vivo
    │                   │                  │         Analítica y reportes
```

### Paso 1 — Login como ADMIN y revisar dashboard

1. Ingresar a `http://54.233.18.87:4200`
2. Email: `admin@demo.com` / Contraseña: `admin123`
3. Ver el panel con métricas y las predicciones TensorFlow

### Paso 2 — Login como CLIENT e iniciar trámite

1. Cerrar sesión → login con `client1@demo.com` / `client123`
2. Sidebar → **"Iniciar Trámite"** (ícono robot)
3. Escribir: `"Quiero abrir un restaurante en el centro de la ciudad"`
4. El agente IA identifica la política y muestra los requisitos
5. Confirmar para crear el trámite

### Paso 3 — Login como OFFICER y atender tareas

1. Cerrar sesión → login con `officer1@demo.com` / `officer123`
2. En "Mi Bandeja" aparecen las tareas del trámite recién creado
3. Clic en **"Atender"** en la primera tarea
4. Llenar el formulario (o usar dictado por voz)
5. Clic en **"✓ Completar"**
6. **El Motor ML muestra el modal de advertencia** (riesgo detectado)
7. Clic en **"Avanzar de todas formas →"**
8. Tarea marcada como DONE ✅

### Paso 4 — Probar edición colaborativa

1. Subir un documento en el caso (PDF o imagen)
2. Clic en **"👥 Colaborar"** junto al archivo
3. Abrir otra pestaña con otro usuario → mismo documento
4. Ambos usuarios aparecen como avatares con colores
5. Enviar una nota → aparece en tiempo real en ambas pestañas

### Paso 5 — Ver monitor y analítica como ADMIN

1. Login con `admin@demo.com` / `admin123`
2. Sidebar → **"Monitor en Vivo"** — ver los casos y el feed de eventos
3. Sidebar → **"Reportes IA"** — ver métricas y descargar Excel/PDF

### Paso 6 — Probar editor UML como DESIGNER

1. Login con `designer1@demo.com` / `designer123`
2. Dashboard → clic en **"Editar"** en una política
3. Cambiar a vista swimlanes
4. Clic en **"Exportar PNG"** → descarga el diagrama
5. Seleccionar un nodo ACTION → pestaña **"Requisitos"** → agregar un requisito
6. Pestaña **"IA"** → escribir `"Agrega nodo de apelación en Revisión Técnica"`

---

## Glosario

| Término | Definición |
|---|---|
| **Política** | Definición de un tipo de trámite: su diagrama UML, formularios y requisitos |
| **Caso / Trámite** | Instancia de ejecución de una política para un ciudadano específico |
| **Tarea** | Unidad de trabajo en un nodo ACTION del diagrama. Se asigna a un OFFICER |
| **Nodo** | Elemento del diagrama UML (INITIAL, ACTION, DECISION, FORK, JOIN, FINAL) |
| **Arista** | Flecha de conexión entre nodos. En DECISION lleva una etiqueta de condición |
| **Motor ML** | Componente TensorFlow que predice riesgo de demora y prioridad de tareas |
| **Swimlane** | Vista del diagrama en carriles agrupados por departamento |
| **STOMP** | Protocolo de mensajería sobre WebSocket usado para tiempo real |
| **spaCy** | Librería NLP Python con modelo `es_core_news_lg` para español |
| **Requisito** | Documento o condición que el ciudadano debe cumplir en cada etapa |

---

*WorkflowSW1 — Sistema de Gestión de Trámites con Inteligencia Artificial*
*Ingeniería de Software I — Segundo Parcial 2026*
*Spring Boot 3.5 · Angular 18 · MongoDB · FastAPI · spaCy · TensorFlow · AWS EC2*
