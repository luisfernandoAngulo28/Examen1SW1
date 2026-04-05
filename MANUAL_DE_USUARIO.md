# 📘 Manual de Usuario — Sistema de Gestión de Políticas de Negocio (WorkflowSW1)

## Índice

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Instalación y Puesta en Marcha](#3-instalación-y-puesta-en-marcha)
4. [Acceso al Sistema (Login)](#4-acceso-al-sistema-login)
5. [Roles de Usuario](#5-roles-de-usuario)
6. [Panel Principal (Dashboard)](#6-panel-principal-dashboard)
7. [Gestión de Departamentos](#7-gestión-de-departamentos)
8. [Crear una Política de Negocio](#8-crear-una-política-de-negocio)
9. [Editor Visual de Diagramas de Actividad](#9-editor-visual-de-diagramas-de-actividad)
   - 9.1 [Agregar Nodos (Actividades)](#91-agregar-nodos-actividades)
   - 9.2 [Conectar Nodos (Flujos)](#92-conectar-nodos-flujos)
   - 9.3 [Swimlanes (Calles por Departamento)](#93-swimlanes-calles-por-departamento)
   - 9.4 [Diseñar Formularios por Actividad](#94-diseñar-formularios-por-actividad)
   - 9.5 [Guardar el Diagrama](#95-guardar-el-diagrama)
10. [Asistente de IA](#10-asistente-de-ia)
    - 10.1 [IA por Texto](#101-ia-por-texto)
    - 10.2 [IA por Voz](#102-ia-por-voz)
    - 10.3 [IA por Imagen](#103-ia-por-imagen)
11. [Gestión de Trámites (Casos)](#11-gestión-de-trámites-casos)
    - 11.1 [Iniciar un Trámite](#111-iniciar-un-trámite)
    - 11.2 [Detalle del Trámite](#112-detalle-del-trámite)
    - 11.3 [Asignar Tareas](#113-asignar-tareas)
    - 11.4 [Completar Tareas y Formularios](#114-completar-tareas-y-formularios)
    - 11.5 [Formularios por Voz](#115-formularios-por-voz)
    - 11.6 [Cancelar un Trámite](#116-cancelar-un-trámite)
12. [Semáforo Visual de Estados](#12-semáforo-visual-de-estados)
13. [Monitor en Tiempo Real](#13-monitor-en-tiempo-real)
14. [Analíticas y Detección de Cuellos de Botella](#14-analíticas-y-detección-de-cuellos-de-botella)
15. [Referencia Rápida de Navegación](#15-referencia-rápida-de-navegación)
16. [Flujo de Prueba Completo (Paso a Paso)](#16-flujo-de-prueba-completo-paso-a-paso)
17. [Preguntas Frecuentes (FAQ)](#17-preguntas-frecuentes-faq)

---

## 1. Introducción

**WorkflowSW1** es un Sistema de Gestión de Políticas de Negocio basado en Diagramas de Actividad UML. Permite a las organizaciones:

- **Diseñar** procesos de negocio visualmente usando diagramas de actividad con calles (swimlanes)
- **Ejecutar** esos procesos como trámites (casos) con tareas asignables a funcionarios
- **Monitorear** en tiempo real el avance de cada trámite mediante WebSocket
- **Analizar** el rendimiento e identificar cuellos de botella con inteligencia artificial
- **Crear diagramas asistidos por IA** mediante texto, voz o imagen

**Stack tecnológico:** NestJS (backend) + React con Vite (frontend) + PostgreSQL + Prisma + Socket.IO + React Flow

---

## 2. Requisitos del Sistema

| Componente | Requisito |
|---|---|
| **Navegador** | Google Chrome (recomendado para voz), Firefox, Edge |
| **Node.js** | v18 o superior |
| **PostgreSQL** | v14 o superior |
| **Puerto backend** | 3000 (por defecto) |
| **Puerto frontend** | 5173 (por defecto) |

> **Nota:** La funcionalidad de voz (🎤) requiere Google Chrome y permisos de micrófono.

---

## 3. Instalación y Puesta en Marcha

### 3.1 Base de Datos

```bash
# Crear la base de datos en PostgreSQL
createdb workflow_sw1
```

### 3.2 Backend

```bash
cd backend
npm install
npx prisma migrate dev      # Aplica las migraciones
npx prisma db seed           # (opcional) Carga datos iniciales
npm run start:dev            # Inicia en http://localhost:3000
```

### 3.3 Frontend

```bash
cd frontend
npm install
npm run dev                  # Inicia en http://localhost:5173
```

### 3.4 Primer Usuario

Registrar un usuario desde la API directamente:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456","name":"Administrador","role":"DESIGNER"}'
```

O usar los datos de prueba si ya fueron cargados:
- **Email:** admin@test.com
- **Contraseña:** 123456
- **Rol:** DESIGNER

---

## 4. Acceso al Sistema (Login)

1. Abrir el navegador en `http://localhost:5173`
2. Se mostrará la pantalla de inicio de sesión

![Pantalla de Login](docs/images/01-login.png)
*Figura 1: Pantalla de inicio de sesión con campos de email y contraseña*

3. Ingresar **email** y **contraseña**
4. Hacer clic en **"Iniciar Sesión"**
5. El sistema redirige al **Dashboard** automáticamente
6. El token JWT se almacena en `localStorage` y se envía en cada petición

> **Importante:** Si el token expira, el sistema redirige al Login automáticamente.

---

## 5. Roles de Usuario

El sistema tiene dos roles que determinan las acciones disponibles:

| Rol | Descripción | Permisos Principales |
|---|---|---|
| **DESIGNER** | Diseñador de procesos | Crear/editar políticas, diseñar diagramas, configurar formularios, usar IA, ver analíticas |
| **OFFICER** | Funcionario / Operador | Ejecutar trámites, completar tareas, llenar formularios, ver monitor |

Ambos roles pueden ver el **Dashboard**, **Monitor** y **Analíticas**.

---

## 6. Panel Principal (Dashboard)

Al iniciar sesión, se presenta el Dashboard con:

![Dashboard](docs/images/02-dashboard.png)
*Figura 2: Panel principal con KPIs y tabla de políticas*

### 6.1 Tarjetas KPI (Indicadores Clave)
- 📊 **Total de Trámites** — Cantidad total de casos en el sistema
- ⚡ **Trámites Activos** — Casos en estado OPEN o IN_PROGRESS
- ✅ **Completados** — Casos finalizados exitosamente
- 📋 **Tareas Pendientes** — Tareas que aún no se completan

### 6.2 Tabla de Políticas
Muestra todas las políticas creadas con:
- Nombre de la política
- Estado (ACTIVE / INACTIVE)
- Fecha de creación
- Acciones disponibles:
  - **✏️ Editar** → Abre el editor visual del diagrama
  - **📋 Trámites** → Ve los trámites/casos de esa política
  - **🗑️ Eliminar** → Elimina la política (con confirmación)

### 6.3 Botón "+ Nueva Política"
Crea una nueva política de negocio (ver sección 8).

---

## 7. Gestión de Departamentos

**Ruta:** Barra lateral → **"Departamentos"**

Los departamentos representan las áreas organizacionales que participan en los procesos.

![Departamentos](docs/images/03-departamentos.png)
*Figura 3: Gestión de departamentos — crear y ver lista*

### Crear un Departamento
1. Escribir el nombre en el campo de texto
2. Hacer clic en **"+ Crear"**
3. El departamento aparece en la lista

### Ver Personal del Departamento
Cada departamento muestra la cantidad de usuarios asignados.

### Eliminar un Departamento
1. Hacer clic en **"🗑️ Eliminar"** junto al departamento
2. Confirmar la eliminación

> **Nota:** Se deben crear los departamentos ANTES de diseñar el diagrama, ya que cada actividad se asigna a un departamento.

---

## 8. Crear una Política de Negocio

1. En el Dashboard, hacer clic en **"+ Nueva Política"**
2. Ingresar el **nombre** de la política (ej: "Solicitud de Crédito", "Aprobación de Vacaciones")
3. Hacer clic en **"Crear"**
4. El sistema redirige automáticamente al **Editor Visual** del diagrama

---

## 9. Editor Visual de Diagramas de Actividad

**Ruta:** Dashboard → Política → **"✏️ Editar"**

El editor es la herramienta principal del sistema. Permite diseñar diagramas de actividad UML de manera visual.

![Editor Visual](docs/images/04-editor-general.png)
*Figura 4: Vista general del Editor Visual con nodos, conexiones y panel lateral*

### 9.1 Agregar Nodos (Actividades)

En la **barra superior** del editor se encuentra el formulario para agregar actividades:

1. **Seleccionar el departamento** en el dropdown de la izquierda (ej: "Ventas", "Legal", "Finanzas")
2. **Escribir el nombre** de la actividad en el campo **"Nombre actividad"** (ej: "Revisar Solicitud")
3. Hacer clic en el botón **"+ Actividad"** (botón verde)
4. El nodo aparece en el lienzo posicionado automáticamente dentro de la calle (swimlane) de su departamento

![Agregar Nodo](docs/images/05-agregar-nodo.png)
*Figura 5: Barra superior del editor — selector de departamento, campo de nombre y botón "+ Actividad"*

**Cada nodo representa una actividad** del proceso que será ejecutada como una tarea cuando se inicie un trámite.

### 9.2 Conectar Nodos (Flujos)

Para crear una conexión entre dos nodos:

1. **Pasar el cursor** sobre un nodo hasta ver los puntos de conexión (handles)
2. **Hacer clic y arrastrar** desde el punto de un nodo hasta otro nodo
3. Se crea una arista (edge) con tipo **SEQUENTIAL** por defecto

**Tipos de flujo disponibles:**

| Tipo | Símbolo | Descripción |
|---|---|---|
| **SEQUENTIAL** | → | Flujo secuencial: una actividad después de otra |
| **CONDITIONAL** | ◇→ | Flujo condicional: sigue una rama según condición |
| **PARALLEL** | ═→ | Flujo paralelo: actividades simultáneas |
| **ITERATIVE** | ↻ | Flujo iterativo: ciclo que se repite |

Para cambiar el tipo de flujo, se configura al conectar los nodos.

**Colores de cada tipo de flujo:**

| Tipo | Color | Descripción |
|---|---|---|
| SEQUENTIAL | 🔵 Azul | Flujo normal secuencial |
| CONDITIONAL | 🟠 Naranja | Rama condicional |
| PARALLEL | 🟢 Cyan (animado) | Actividades simultáneas |
| ITERATIVE | 🟣 Morado | Ciclo que se repite |

**Cómo cambiar el tipo de flujo:**
- **Al crear:** Seleccionar el tipo en el dropdown de la barra superior ANTES de conectar los nodos
- **Después de crear:** Hacer clic sobre una conexión existente para cambiar el tipo (cada clic rota al siguiente tipo)

![Conexiones](docs/images/06-conexiones-flujo.png)
*Figura 6: Nodos conectados con flechas mostrando el flujo del proceso*

### 9.3 Swimlanes (Calles por Departamento)

Las **swimlanes** son carriles visuales que agrupan las actividades por departamento.

1. Hacer clic en el botón **"▦ Calles ON"** en la barra de herramientas superior
2. Se muestran franjas verticales de colores, una por cada departamento
3. Cada franja tiene un encabezado con el nombre del departamento
4. Al agregar un nodo, se posiciona automáticamente dentro de la calle de su departamento
5. Para desactivar las calles: clic en **"▦ Calles OFF"**

![Swimlanes](docs/images/07-swimlanes.png)
*Figura 7: Swimlanes (calles) activadas mostrando carriles por departamento*

> **Las swimlanes son una representación visual del diagrama de actividad UML** que muestra qué departamento es responsable de cada actividad.

### 9.4 Diseñar Formularios por Actividad

Cada actividad puede tener un formulario asociado que los funcionarios llenarán al ejecutar la tarea.

1. **Seleccionar un nodo** haciendo clic sobre él en el lienzo
2. En el panel derecho aparece la sección **"📝 Formulario para: [nombre del nodo]"**
3. Agregar campos al formulario:
   - **Nombre del campo** (identificador interno, ej: "monto")
   - **Etiqueta** (texto visible, ej: "Monto Solicitado")
   - **Tipo:** text, number, email, date, textarea, select, checkbox
   - **Obligatorio:** marcar si es requerido
   - **Placeholder:** texto de ayuda dentro del campo
   - **Opciones** (solo para tipo select): valores separados por coma
4. Hacer clic en **"+ Agregar Campo"** para cada campo
5. Hacer clic en **"💾 Guardar Plantilla"** para guardar el formulario

![Formulario Template](docs/images/08-formulario-template.png)
*Figura 8: Diseño de formulario para una actividad — agregar campos con tipos*

**Tipos de campo disponibles:**

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `text` | Texto libre | Nombre, dirección |
| `number` | Número | Monto, cantidad |
| `email` | Correo electrónico | Email de contacto |
| `date` | Fecha | Fecha de solicitud |
| `textarea` | Texto largo multilínea | Observaciones, descripción |
| `select` | Lista desplegable | Estado, categoría |
| `checkbox` | Casilla de verificación | ¿Acepta términos? |

### 9.5 Guardar el Diagrama

1. Hacer clic en **"💾 Guardar Diagrama"** en la barra de herramientas
2. Se guardan todos los nodos (con posiciones y departamentos) y las conexiones
3. Aparece un mensaje de confirmación ✅

> **⚠️ Importante:** El diagrama NO se guarda automáticamente. Recuerda hacer clic en "Guardar" antes de salir del editor.

---

## 10. Asistente de IA

El editor incluye un **panel de Asistente de IA** que permite crear elementos del diagrama mediante lenguaje natural.

### 10.1 IA por Texto

1. En el editor, localizar el panel **"🤖 Asistente IA"** (parte inferior del panel izquierdo)
2. Escribir una instrucción en español en el campo de texto, por ejemplo:
   - `"Crear actividad Revisar Solicitud en Ventas"`
   - `"Agregar nodo Aprobar Crédito en el departamento Finanzas"`
   - `"Conectar Revisar Solicitud con Aprobar Crédito"`
   - `"Crear flujo para proceso de compras con 3 pasos"`
3. Hacer clic en **"Enviar"** o presionar Enter
4. La IA interpreta el texto y genera los nodos y conexiones automáticamente
5. Los nuevos elementos aparecen en el lienzo

![IA por Texto](docs/images/09-ia-texto.png)
*Figura 09: Asistente IA por texto con comando y resultado generado en el lienzo*

**Comandos soportados:**
- **Crear/Agregar nodo** → `"agregar actividad [nombre] en [departamento]"`
- **Eliminar nodo** → `"eliminar nodo [nombre]"`
- **Conectar nodos** → `"conectar [nodo A] con [nodo B]"`
- **Sugerir flujo** → `"crear flujo para [descripción del proceso]"`

### 10.2 IA por Voz

1. Hacer clic en el botón **"🎤"** junto al campo de texto del Asistente IA
2. **Hablar en español** con la instrucción deseada
3. El sistema usa la **Web Speech API** para convertir voz a texto
4. El texto transcrito se envía automáticamente a la IA
5. Los nodos/conexiones se generan igual que con texto

![IA por Voz](docs/images/10-ia-voz.png)
*Figura 10: Asistente IA por voz usando el botón de micrófono*

> **Requisito:** Google Chrome + permisos de micrófono activados.

### 10.3 IA por Imagen

1. Hacer clic en el botón **"📷"** en el panel del Asistente IA
2. Seleccionar una **imagen** de un diagrama (foto, captura de pantalla, escaneo)
3. El sistema solicita una **descripción** de lo que contiene la imagen
4. Escribir qué representa la imagen (ej: "Diagrama de aprobación de compras con 4 actividades")
5. La IA procesa el texto descriptivo y genera los nodos y conexiones correspondientes

![IA por Imagen](docs/images/11-ia-imagen.png)
*Figura 11: Asistente IA por imagen con actividad generada desde archivo cargado*

![IA por Imagen - Apoyo](docs/images/11-ia-imagen2.png)
*Figura 11b: Cuadro de descripción de imagen antes de procesar la solicitud*

> **Tip:** Para mejores resultados, describe las actividades y conexiones que ves en la imagen. Por ejemplo: "La imagen muestra: Solicitar → Revisar → Aprobar → Notificar. Solicitar en Ventas, Revisar en Legal, Aprobar en Finanzas."

---

## 11. Gestión de Trámites (Casos)

Los **trámites** (casos) son instancias de ejecución de una política/proceso.

### 11.1 Iniciar un Trámite

1. En el Dashboard, hacer clic en **"📋 Trámites"** de una política
2. Se muestra la lista de trámites existentes
3. Hacer clic en **"+ Iniciar Trámite"**
4. Se crea un nuevo caso y se genera la primera tarea automáticamente (nodo inicial del diagrama)
5. El trámite comienza en estado **OPEN**

![Lista Trámites](docs/images/12-lista-tramites.png)
*Figura 12: Lista de trámites de una política con semáforo de estado*

![Nuevo Trámite](docs/images/12b-nuevo-tramite.png)
*Figura 12b: Nuevo trámite iniciado en estado IN_PROGRESS*

### 11.2 Detalle del Trámite

Al hacer clic en un trámite de la lista, se abre el **Detalle del Trámite** que muestra:

- **Encabezado:** ID del caso, estado con semáforo visual, fecha de inicio
- **Lista de Tareas:** Cada tarea corresponde a un nodo/actividad del diagrama
- **Registro de Eventos:** Historial cronológico de todos los eventos del trámite

![Detalle Trámite](docs/images/13-detalle-tramite.png)
*Figura 13: Detalle de un trámite mostrando tareas con semáforo y formularios*

### 11.3 Asignar Tareas

1. En el detalle del trámite, localizar una tarea en estado **PENDING** (🔴)
2. Seleccionar un **usuario** del dropdown "Asignar a"
3. Hacer clic en **"Asignar"**
4. La tarea pasa a estado **IN_PROGRESS** (🟡)
5. El funcionario asignado recibe una notificación en tiempo real

![Asignar Tarea](docs/images/14-asignar-tarea.png)
*Figura 14: Dropdown para asignar una tarea a un funcionario*

### 11.4 Completar Tareas y Formularios

1. Si la tarea tiene un **formulario asociado**, este se muestra debajo de la tarea
2. Llenar todos los campos requeridos (marcados con *)
3. Hacer clic en **"💾 Guardar formulario"**
4. Luego hacer clic en **"✅ Completar Tarea"**
5. La tarea pasa a estado **DONE** (🟢)
6. El **motor de workflow** automáticamente avanza al siguiente nodo y crea la siguiente tarea

**Flujo automático del motor:**
```
Tarea PENDING → Asignar → IN_PROGRESS → Completar → DONE
          ↓
    Se crea la siguiente tarea según las conexiones del diagrama
          ↓
    Si no hay más nodos → Caso COMPLETED ✅
```

### 11.5 Formularios por Voz

En los formularios de las tareas, cada campo de texto, email o área de texto tiene un botón **"🎤"**:

1. Hacer clic en **"🎤"** junto al campo que quieres llenar
2. El botón se pone **rojo** (⏹) indicando que está grabando
3. **Hablar en español** con el contenido del campo
4. La voz se transcribe automáticamente y se coloca en el campo
5. Revisar el texto y corregir si es necesario
6. El formulario registra que se usó modo **VOZ** para ese envío

![Formulario Voz](docs/images/15-formulario-voz.png)
*Figura 15: Formulario con botón 🎤 por cada campo — el botón se pone rojo al grabar*

> **Indicador visual:** Cuando el micrófono está activo, el botón pulsa en rojo. Hacer clic de nuevo para detener.

### 11.6 Cancelar un Trámite

1. En el detalle del trámite, hacer clic en **"❌ Cancelar Trámite"**
2. Confirmar la cancelación
3. El caso pasa a estado **CANCELLED** (gris)
4. Todas las tareas pendientes se cancelan

---

## 12. Semáforo Visual de Estados

El sistema usa un **semáforo visual** (🔴🟡🟢) en todas las vistas para indicar el estado de trámites y tareas:

| Color | Estado del Trámite | Estado de la Tarea |
|---|---|---|
| 🟢 **Verde** | COMPLETED (finalizado) | DONE (completada) |
| 🟡 **Amarillo** | IN_PROGRESS (en curso) | IN_PROGRESS (en progreso) |
| 🔴 **Rojo** | OPEN (pendiente) | PENDING / BLOCKED |
| ⚫ **Gris** | CANCELLED (cancelado) | — |

El semáforo aparece en:
- **Tabla de trámites** (CasesPage) — columna de estado
- **Detalle del trámite** (CaseDetailPage) — encabezado + cada tarea
- **Monitor en tiempo real** (MonitorPage) — cada caso y tarea activa

El punto de color tiene una **animación de pulso brillante** para mejor visibilidad.

![Semáforo Visual](docs/images/16-semaforo.png)
*Figura 16: Ejemplo del semáforo visual — 🟢 completado, 🟡 en progreso, 🔴 pendiente*

---

## 13. Monitor en Tiempo Real

**Ruta:** Barra lateral → **"Monitor"**

El monitor permite supervisar la actividad del sistema en vivo.

![Monitor](docs/images/17-monitor.png)
*Figura 17: Monitor en tiempo real con casos activos y feed de eventos*

### Componentes del Monitor

1. **Usuarios Conectados** — Muestra cuántos usuarios están en línea en este momento
2. **Casos Activos** — Lista de todos los trámites en progreso con:
   - Nombre de la política
   - Estado con semáforo
   - Tareas activas con estado y asignación
3. **Feed de Eventos** — Flujo cronológico en tiempo real de:
   - 🆕 Trámite iniciado
   - ✅ Tarea completada
   - 👤 Tarea asignada
   - 🏁 Trámite finalizado
   - ❌ Trámite cancelado

### Funcionamiento en Tiempo Real

El monitor usa **WebSocket (Socket.IO)** para actualizar automáticamente:
- No es necesario recargar la página
- Los eventos aparecen instantáneamente
- Cuando otro usuario completa una tarea, se ve reflejado inmediatamente
- La lista de usuarios en línea se actualiza al conectar/desconectar

---

## 14. Analíticas y Detección de Cuellos de Botella

**Ruta:** Barra lateral → **"Analíticas"**

### 14.1 KPIs Globales (Indicadores)

- **Total de Trámites** en el sistema
- **Trámites Activos** actualmente
- **Trámites Completados** exitosamente
- **Tareas Pendientes** sin resolver
- **Distribución por departamento**

![Analíticas](docs/images/18-analiticas.png)
*Figura 18: Panel de analíticas con KPIs globales y detección de cuellos de botella*

### 14.2 Análisis por Política

Seleccionar una política para ver:
- Cantidad de casos
- Duración promedio de los trámites
- Estadísticas por nodo/actividad:
  - Tareas completadas
  - Tareas pendientes
  - Duración promedio por actividad

### 14.3 Detección de Cuellos de Botella 🔴

El sistema identifica automáticamente **cuellos de botella** usando esta lógica:

> Una actividad es cuello de botella si su **duración promedio** es **1.5 veces mayor** que el promedio global Y tiene **tareas pendientes acumuladas**.

Las actividades identificadas como cuello de botella se muestran con un indicador visual rojo, permitiendo a los gestores tomar acciones correctivas como:
- Asignar más personal a esa actividad
- Simplificar el formulario asociado
- Rediseñar el flujo del proceso

---

## 15. Referencia Rápida de Navegación

| Sección | Ruta | Desde la Barra Lateral |
|---|---|---|
| Dashboard | `/` | 🏠 Dashboard |
| Departamentos | `/departments` | 🏢 Departamentos |
| Nueva Política | `/policies/new` | Botón en Dashboard |
| Editor de Diagrama | `/policies/:id/editor` | ✏️ Editar en política |
| Trámites de Política | `/policies/:id/cases` | 📋 Trámites en política |
| Detalle de Trámite | `/cases/:id` | Clic en trámite |
| Monitor | `/monitor` | 📡 Monitor |
| Analíticas | `/analytics` | 📈 Analíticas |

---

## 16. Flujo de Prueba Completo (Paso a Paso)

Esta sección describe un flujo completo de prueba del sistema, desde crear una política hasta completar un trámite. Úsala como guía práctica.

### Fase 1 — Crear Departamentos
1. Ir a **Departamentos** desde la barra lateral
2. Crear 3 departamentos: `Ventas`, `Legal`, `Finanzas`

![Departamentos](docs/images/03-departamentos.png)
*Captura: Página de departamentos con los 3 departamentos creados*

### Fase 2 — Crear la Política de Negocio
3. Ir al **Dashboard**
4. Clic en **"+ Nueva Política"**
5. Nombre: `Solicitud de Crédito` → Crear

### Fase 3 — Diseñar el Diagrama
6. En el editor, agregar 3 nodos desde la barra superior:
   - Dropdown **Ventas** → `Recibir solicitud` → **+ Actividad**
   - Dropdown **Legal** → `Revisar documentos` → **+ Actividad**
   - Dropdown **Finanzas** → `Aprobar pago` → **+ Actividad**
7. Activar **"▦ Calles ON"** para ver las swimlanes

![Editor con Swimlanes](docs/images/07-swimlanes.png)
*Captura: Editor con los 3 nodos posicionados en sus calles*

8. Conectar los nodos arrastrando desde los puntos (●):
   - `Recibir solicitud` → `Revisar documentos`
   - `Revisar documentos` → `Aprobar pago`
9. (Opcional) Cambiar tipo de flujo haciendo clic en una conexión

![Conexiones](docs/images/06-conexiones-flujo.png)
*Captura: Nodos conectados con tipos de flujo y colores*

10. Clic en **"Guardar"**

### Fase 4 — Diseñar Formularios
11. Clic en el nodo **"Recibir solicitud"**
12. En el panel Formulario, agregar campos:
    - `Nombre del solicitante` (texto, requerido)
    - `Monto solicitado` (número, requerido)
    - `Observaciones` (área de texto)
13. Clic en **"Guardar"** del formulario

![Formulario](docs/images/08-formulario-template.png)
*Captura: Panel de formulario con los 3 campos configurados*

14. Repetir para los otros nodos si se desea

### Fase 5 — Probar la IA
15. En el panel **Asistente IA**, escribir: `Agregar actividad Notificar cliente en Ventas`
16. Clic en **→** (Enviar) — se crea el nodo automáticamente

![IA Texto](docs/images/09-ia-texto.png)
*Captura: Asistente IA con un comando de texto y nodo creado*

17. (Opcional) Probar 🎤 voz y 📷 imagen

### Fase 6 — Iniciar un Trámite
18. Ir al **Dashboard** → clic en **"Trámites"** de la política
19. Clic en **"+ Iniciar Trámite"**
20. Se crea un nuevo caso con la primera tarea (Recibir solicitud)

![Lista Trámites](docs/images/12-lista-tramites.png)
*Captura: Lista de trámites con el semáforo de estado*

### Fase 7 — Ejecutar Tareas
21. Clic en el trámite para ver el detalle
22. La primera tarea aparece como **PENDING** (🔴)
23. Asignar la tarea a un usuario desde el dropdown
24. La tarea pasa a **IN_PROGRESS** (🟡)

![Detalle Trámite](docs/images/13-detalle-tramite.png)
*Captura: Detalle del trámite con tareas y semáforos*

25. Llenar el formulario (campos: nombre, monto, observaciones)
    - Opcionalmente usar los botones **🎤** para dictar por voz

![Formulario Voz](docs/images/15-formulario-voz.png)
*Captura: Formulario con botones de micrófono por cada campo*

26. Clic en **"💾 Guardar formulario"**
27. Clic en **"✅ Completar Tarea"**
28. La tarea pasa a **DONE** (🟢) y se crea la siguiente tarea automáticamente
29. Repetir para cada tarea hasta que el trámite esté **COMPLETED**

### Fase 8 — Monitorear en Tiempo Real
30. Ir a **Monitor en Vivo** desde la barra lateral
31. Ver los casos activos y el feed de eventos en tiempo real

![Monitor](docs/images/17-monitor.png)
*Captura: Monitor con casos activos y eventos en tiempo real*

### Fase 9 — Ver Analíticas
32. Ir a **Analytics** desde la barra lateral
33. Ver KPIs globales, análisis por política y cuellos de botella

![Analíticas](docs/images/18-analiticas.png)
*Captura: Panel de analíticas con KPIs y detección de cuellos de botella*

---

## 17. Preguntas Frecuentes (FAQ)

### ¿Cómo registro un nuevo usuario?
Actualmente se hace mediante la API: `POST /auth/register` con los datos del usuario (email, password, name, role, departmentId).

### ¿Puedo editar un diagrama después de haber iniciado trámites?
Sí, pero los trámites ya iniciados seguirán usando la versión del diagrama que tenían al momento de su creación. Los nuevos trámites usarán la versión actualizada.

### ¿Por qué no funciona el micrófono (🎤)?
- Asegúrate de usar **Google Chrome**
- Verifica que el navegador tiene **permisos de micrófono** activados
- El sitio debe cargarse por **localhost** o **HTTPS** (requisito de la Web Speech API)

### ¿Qué pasa si una tarea se queda bloqueada?
Puedes cancelar el trámite completo desde el detalle del caso. También puedes reasignar la tarea a otro funcionario.

### ¿Cómo sé si hay un cuello de botella?
Ve a **Analíticas** → selecciona una política. Las actividades marcadas en rojo son cuellos de botella (duración > 1.5x el promedio con tareas pendientes acumuladas).

### ¿El sistema soporta flujos paralelos?
Sí. Al conectar nodos en el editor, puedes elegir el tipo de flujo **PARALLEL** para representar actividades que se ejecutan simultáneamente.

### ¿Puedo usar la IA sin internet?
Sí. El asistente de IA usa un motor de NLP basado en reglas que se ejecuta localmente en el backend. No requiere conexión a servicios externos de IA.

### ¿Cómo configuro la conexión a la base de datos?
Editar el archivo `backend/.env`:
```
DATABASE_URL="postgresql://postgres:12345678@localhost:5432/workflow_sw1"
```

---

**Desarrollado para:** Materia SW1 — Primer Parcial 2025  
**Tecnologías:** NestJS · React · PostgreSQL · Prisma · Socket.IO · React Flow  
**Repositorio:** https://github.com/luisfernandoAngulo28/Examen1SW1
