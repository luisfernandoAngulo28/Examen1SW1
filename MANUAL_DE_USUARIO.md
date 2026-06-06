# Manual de Usuario — Sistema de Gestión de Políticas de Negocio (WorkflowSW1)

## Índice

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Roles de Usuario](#3-roles-de-usuario)
4. [Panel Principal (Dashboard)](#4-panel-principal-dashboard)
5. [Gestión de Departamentos](#5-gestión-de-departamentos)
6. [Crear una Política de Negocio](#6-crear-una-política-de-negocio)
7. [Editor Visual de Diagramas de Actividad UML](#7-editor-visual-de-diagramas-de-actividad-uml)
8. [Diseñador de Formularios Dinámicos](#8-diseñador-de-formularios-dinámicos)
9. [Asistente de Inteligencia Artificial](#9-asistente-de-inteligencia-artificial)
10. [Gestión de Trámites (Casos)](#10-gestión-de-trámites-casos)
11. [Bandeja del Funcionario](#11-bandeja-del-funcionario)
12. [Monitor en Tiempo Real](#12-monitor-en-tiempo-real)
13. [Analítica y Detección de Cuellos de Botella](#13-analítica-y-detección-de-cuellos-de-botella)
14. [Semáforo Visual de Estados](#14-semáforo-visual-de-estados)
15. [Flujo de Prueba Completo](#15-flujo-de-prueba-completo)
16. [Credenciales de Demo](#16-credenciales-de-demo)
17. [Preguntas Frecuentes](#17-preguntas-frecuentes)

---

## 1. Introducción

**WorkflowSW1** es un sistema de gestión de políticas de negocio basado en Diagramas de Actividad UML 2.5. Permite a las organizaciones diseñar, ejecutar, monitorear y analizar procesos de negocio de forma visual e inteligente.

### Capacidades principales

| Capacidad | Descripción |
|---|---|
| Diseño visual UML | Editor de diagramas de actividad con nodos, aristas y swimlanes |
| Motor de workflow | Ejecución automática del flujo definido en el diagrama |
| Formularios dinámicos | Captura de datos por nodo con 8 tipos de componentes |
| Asistente IA | Diseño por texto, voz e imagen con NLP |
| Monitor en tiempo real | WebSocket STOMP con semáforo rojo/amarillo/verde |
| Analítica | Detección automática de cuellos de botella con IA |
| App mobile | Cliente Flutter para funcionarios y clientes |

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3 (Java) — puerto 8080 |
| Base de datos | MongoDB 7 |
| IA / NLP | FastAPI (Python) — puerto 8000 |
| Frontend | Angular 18 + Nginx |
| Mobile | Flutter |
| Infraestructura | AWS EC2 (t3.medium, sa-east-1) |

### URL del sistema en producción

```
Frontend:  http://18.231.192.169:4200
API REST:  http://18.231.192.169:8080/api
IA Service: http://18.231.192.169:8000
```

---

## 2. Acceso al Sistema

### 2.1 Iniciar sesión

1. Abrir el navegador en `http://18.231.192.169:4200`
2. Se muestra la pantalla de login con el título **"Flujo de trabajo SW1"**
3. Ingresar **correo electrónico** y **contraseña**
4. Hacer clic en **"Iniciar sesión"**
5. El sistema redirige al Dashboard según el rol del usuario

> La funcionalidad de voz (🎤) requiere **Google Chrome** y permisos de micrófono activados.

### 2.2 Registrar un nuevo usuario (solo DESIGNER)

1. En la pantalla de login, clic en **"¿No tienes cuenta? Registrarse"**
2. Completar: nombre, correo, contraseña y rol
3. Clic en **"Registrarse"**

---

## 3. Roles de Usuario

El sistema tiene tres roles con permisos diferenciados:

| Rol | Descripción | Permisos principales |
|---|---|---|
| **DESIGNER** | Diseñador de procesos / Administrador | Crear y editar políticas, diseñar diagramas, configurar formularios, gestionar usuarios y departamentos, ver analíticas, monitorear |
| **OFFICER** | Funcionario / Operador | Ejecutar tareas asignadas, llenar formularios, ver su bandeja de trabajo, recibir notificaciones push |
| **CLIENT** | Cliente externo | Iniciar trámites, ver el estado de sus trámites, consultar historial |

---

## 4. Panel Principal (Dashboard)

Al iniciar sesión el DESIGNER ve el Dashboard principal con:

### 4.1 Tarjetas KPI

| Tarjeta | Color | Qué muestra |
|---|---|---|
| Trámites totales | Azul | Total de casos en el sistema |
| En progreso | Amarillo | Casos activos actualmente |
| Completados | Verde | Casos finalizados con éxito |
| Tareas pendientes | Rojo | Tareas sin atender |

### 4.2 Tabla de Políticas de Negocio

Muestra todas las políticas con:
- **Nombre** de la política
- **Estado**: ACTIVO / INACTIVO
- **Fecha** de creación
- **Acciones**:
  - **Editar** → Abre el editor visual del diagrama
  - **Trámites** → Lista los casos de esa política

### 4.3 Botón "+ Nueva Política"

Crea una nueva política de negocio. Ver sección 6.

---

## 5. Gestión de Departamentos

**Ruta:** Barra lateral → **"Departamentos"**

Los departamentos representan las áreas organizacionales que participan en los procesos. Cada nodo del diagrama se asigna a un departamento.

### Crear un departamento

1. Ingresar el **nombre** (ej: "Recursos Humanos")
2. Ingresar una **descripción** opcional
3. Clic en **"Crear"**

### Gestión de usuarios por departamento

Desde la pantalla de departamentos se puede ver cuántos usuarios están asignados a cada área.

> Crear los departamentos ANTES de diseñar el diagrama, ya que cada nodo ACTION requiere un departamento asignado.

---

## 6. Crear una Política de Negocio

1. En el Dashboard, clic en **"+ Nueva Política"**
2. Ingresar el **nombre** del proceso (ej: "Solicitud de Crédito Empresarial")
3. Ingresar una **descripción** del proceso
4. Clic en **"Crear"**
5. El sistema redirige al **Editor Visual** del diagrama

---

## 7. Editor Visual de Diagramas de Actividad UML

**Ruta:** Dashboard → Política → **"Editar"**

El editor es la herramienta central. Permite diseñar diagramas de actividad UML 2.5 de forma visual con swimlanes por departamento.

### 7.1 Tipos de nodos disponibles

| Nodo | Color | Equivalente UML 2.5 | Descripción |
|---|---|---|---|
| **INITIAL** | Verde | Nodo inicial (círculo relleno) | Punto de inicio del proceso |
| **ACTION** | Azul | Acción / Actividad (rectángulo) | Tarea que ejecuta un departamento |
| **DECISION** | Amarillo | Decisión (rombo) | Bifurcación condicional |
| **FORK** | Violeta | Fork (barra horizontal) | Divide el flujo en ramas paralelas |
| **JOIN** | Cyan | Join (barra horizontal) | Sincroniza las ramas paralelas |
| **FINAL** | Rojo | Nodo final (círculo con borde) | Fin del proceso |

### 7.2 Agregar un nodo

1. En el panel derecho, seleccionar el **tipo de nodo** (ACTION, DECISION, FORK, JOIN, etc.)
2. Para nodos ACTION: ingresar el **nombre** de la actividad y seleccionar el **departamento** responsable
3. Clic en **"+ Agregar"**
4. El nodo aparece en el lienzo dentro de la swimlane del departamento

### 7.3 Conectar nodos (aristas)

1. Pasar el cursor sobre un nodo hasta ver los puntos de conexión
2. Hacer clic y arrastrar desde un nodo hasta otro
3. Se crea una arista (flecha)
4. Para conexiones desde DECISION: ingresar la **etiqueta de condición** (ej: "Aprobado", "Rechazado")

### 7.4 Swimlanes (calles por departamento)

Las swimlanes son carriles visuales que agrupan los nodos ACTION por departamento, siguiendo la notación de carriles del diagrama de actividad UML.

- **Vista calles**: muestra franjas horizontales/verticales por departamento
- **Vista grafo**: muestra los nodos como grafo libre
- El botón de vista está en la barra superior del editor

### 7.5 Patrones de flujo soportados

| Patrón | Nodos involucrados | Descripción |
|---|---|---|
| **Secuencial** | ACTION → ACTION | Una actividad después de otra |
| **Condicional** | ACTION → DECISION → (rama A / rama B) | Bifurcación según condición |
| **Paralelo** | ACTION → FORK → (rama 1 + rama 2) → JOIN → ACTION | Actividades simultáneas |
| **Iterativo** | ACTION → DECISION → ACTION (hacia atrás) | Ciclo que se repite hasta condición |

### 7.6 Guardar el diagrama

1. Clic en **"Guardar"** en la barra superior
2. Se persisten todos los nodos (con posiciones, departamentos y formularios) y las aristas
3. Aparece un mensaje de confirmación

> El diagrama NO se guarda automáticamente. Guardar antes de salir del editor.

---

## 8. Diseñador de Formularios Dinámicos

Cada nodo ACTION puede tener un formulario asociado. Los funcionarios lo llenan al ejecutar la tarea correspondiente.

### 8.1 Abrir el diseñador de formularios

1. En el editor, **seleccionar un nodo ACTION** haciendo clic sobre él
2. En el panel derecho, ir a la pestaña **"Formulario"**
3. Se muestra el diseñador de campos para ese nodo

### 8.2 Agregar campos al formulario

1. Clic en **"+ Campo"**
2. Completar:
   - **Etiqueta**: texto visible al funcionario (ej: "Monto solicitado")
   - **Tipo**: seleccionar del dropdown
3. Repetir para cada campo necesario
4. Clic en **"Guardar formulario"**

### 8.3 Tipos de componentes disponibles

| Tipo | Descripción | Caso de uso |
|---|---|---|
| **Texto** | Campo de texto libre de una línea | Nombre, dirección, código |
| **Número** | Campo numérico | Monto, cantidad, porcentaje |
| **Fecha** | Selector de fecha | Fecha de solicitud, vencimiento |
| **Párrafo** | Área de texto multilínea + dictado por voz | Observaciones, descripción detallada |
| **Selección** | Lista desplegable con opciones | Estado, categoría, decisión |
| **Grid (tabla)** | Tabla editable con columnas configurables y filas dinámicas | Ítems de una compra, listado de documentos |
| **Botón acción** | Botón configurable dentro del formulario | Ejecutar una acción específica del proceso |
| **Label** | Etiqueta de solo lectura | Títulos de sección, instrucciones |

### 8.4 Configurar un campo Grid

1. Seleccionar tipo **"Grid (tabla)"**
2. En el campo de columnas, ingresar los nombres separados por coma (ej: `Descripción,Cantidad,Precio`)
3. Guardar el formulario
4. Al ejecutar la tarea, el funcionario puede agregar filas dinámicamente con el botón **"+ Agregar fila"**

### 8.5 Configurar un Botón de acción

1. Seleccionar tipo **"Botón acción"**
2. Ingresar el texto del botón (ej: "Calcular total", "Verificar identidad")
3. Guardar el formulario
4. El botón aparece en el formulario del funcionario y registra su ejecución

---

## 9. Asistente de Inteligencia Artificial

El editor incluye un asistente de IA en el panel lateral derecho que permite diseñar el diagrama mediante lenguaje natural.

### 9.1 Asistente por texto

1. En el editor, ir a la pestaña **"IA"** del panel derecho
2. Escribir una instrucción en español, por ejemplo:
   - `"Agrega un nodo de revisión de documentos en Legal"`
   - `"Crea un flujo de aprobación con decisión"`
   - `"Conecta el nodo inicial con Revisar Solicitud"`
3. Clic en **"Enviar"**
4. La IA interpreta el texto y genera los nodos/conexiones en el diagrama
5. La respuesta aparece en el chat y los cambios se reflejan en el lienzo

### 9.2 Asistente por voz

1. Clic en el botón **🎤** junto al campo de texto del asistente
2. El botón cambia a 🔴 (grabando)
3. Hablar en español la instrucción
4. El sistema transcribe la voz y la procesa igual que texto
5. Usar Google Chrome para mejor compatibilidad

### 9.3 Asistente por imagen (OCR)

1. Clic en el botón de imagen (📷) en el panel de IA
2. Seleccionar una imagen de un diagrama (foto, captura, escaneo)
3. El sistema usa OCR (Tesseract.js) para extraer texto de la imagen
4. La IA interpreta el contenido y genera los nodos correspondientes

### 9.4 Dictado inteligente NLP en formularios

En los formularios de ejecución de tareas:

1. Clic en **"🎙️ Dictar todo"** en la barra superior del formulario
2. Describir todos los datos en una sola frase (ej: "El monto es 5000 dólares, la empresa es ACME, el riesgo es medio")
3. El servicio NLP extrae los valores y los mapea automáticamente a los campos
4. Aparece un indicador de **confianza** (verde ≥80%, amarillo ≥60%, rojo <60%) por campo
5. Revisar y corregir los valores antes de guardar

---

## 10. Gestión de Trámites (Casos)

Los trámites son instancias de ejecución de una política.

### 10.1 Iniciar un trámite

**Como DESIGNER o CLIENT:**

1. En el Dashboard, clic en **"Trámites"** de una política activa
2. Clic en **"+ Nuevo Trámite"**
3. Se crea el caso y el motor genera automáticamente las primeras tareas según el diagrama
4. El trámite comienza en estado **IN_PROGRESS**

### 10.2 Ver el detalle de un trámite

Al hacer clic en un trámite de la lista, se muestra:

- **Encabezado**: ID, estado con semáforo, política y fechas
- **Lista de tareas**: cada tarea corresponde a un nodo del diagrama
  - Estado de la tarea (semáforo)
  - Departamento y funcionario asignado
  - Formulario asociado (si tiene)
- **Línea de tiempo**: historial cronológico de eventos del caso

### 10.3 Completar una tarea

1. Localizar una tarea en estado **PENDING** (rojo) o **IN_PROGRESS** (amarillo)
2. Si la tarea tiene formulario, llenarlo completamente (ver sección 8)
3. Usar el botón 🎤 por campo para dictado individual, o **"🎙️ Dictar todo"** para NLP global
4. Clic en **"Guardar Formulario"**
5. Clic en **"Completar Tarea"**
6. La tarea pasa a **DONE** (verde)
7. El motor de workflow evalúa el diagrama y genera las siguientes tareas automáticamente

### 10.4 Lógica del motor de workflow

| Tipo de nodo completado | Qué genera el motor |
|---|---|
| **ACTION** secuencial | Crea la siguiente tarea en el nodo siguiente |
| **DECISION** | Evalúa la condición elegida y sigue el ramal correspondiente |
| **FORK** | Crea tareas paralelas simultáneas en todos los nodos hijos |
| **JOIN** | Espera que todas las tareas paralelas se completen antes de continuar |
| **FINAL** | Marca el trámite como COMPLETED |

### 10.5 Cancelar un trámite

1. En el detalle del trámite, clic en **"Cancelar Trámite"**
2. Confirmar la acción
3. El caso pasa a estado CANCELLED y se cancelan todas las tareas pendientes

---

## 11. Bandeja del Funcionario

**Ruta:** Barra lateral → **"Mis Tareas"** (visible para rol OFFICER)

La bandeja muestra todas las tareas asignadas al funcionario autenticado.

### Vista de tareas

Cada tarjeta muestra:
- Nombre de la tarea (nodo del diagrama)
- Nombre del trámite y política
- Estado con semáforo
- Botón **"Ver detalle"** para abrir el formulario

### Proceso del funcionario

1. Ingresar a **"Mis Tareas"**
2. Seleccionar una tarea pendiente
3. Llenar el formulario (manualmente, por voz o con NLP)
4. Clic en **"Completar"**
5. La tarea desaparece de la bandeja y el workflow avanza

---

## 12. Monitor en Tiempo Real

**Ruta:** Barra lateral → **"Monitor en Vivo"**

El monitor muestra el estado del sistema en tiempo real usando **WebSocket STOMP**.

### Componentes del monitor

| Componente | Descripción |
|---|---|
| Semáforo de casos | Cada caso activo con indicador rojo/amarillo/verde |
| Lista de tareas activas | Tareas en progreso con funcionario asignado |
| Feed de eventos | Flujo de eventos en tiempo real (inicio, completado, asignado) |

### Indicadores del semáforo

| Color | Significado |
|---|---|
| Rojo | Tarea/caso pendiente sin atender |
| Amarillo | Tarea/caso en progreso |
| Verde | Tarea/caso completado |

### Funcionamiento en tiempo real

- No es necesario recargar la página
- Los cambios aparecen instantáneamente vía WebSocket
- Cuando un funcionario completa una tarea, el semáforo cambia de color automáticamente
- Conecta a `ws://18.231.192.169:4200/ws` (proxeado por nginx al backend)

---

## 13. Analítica y Detección de Cuellos de Botella

**Ruta:** Barra lateral → **"Analítica"**

### 13.1 KPIs globales

- Tasa de completitud de trámites
- Duración promedio por nodo/actividad
- Distribución de tareas pendientes por departamento
- Cantidad de trámites activos vs completados

### 13.2 Análisis por política

Seleccionar una política para ver:
- Estadísticas por nodo del diagrama
- Tiempo promedio de cada actividad
- Acumulación de tareas pendientes por departamento

### 13.3 Detección automática de cuellos de botella

El sistema identifica automáticamente qué nodos son cuellos de botella aplicando **tres criterios combinados**:

| Criterio | Umbral |
|---|---|
| Tareas pendientes acumuladas | ≥ 2 tareas sin completar en el nodo |
| Duración promedio elevada | > 1.5× el promedio global del proceso |
| Concentración de carga | ≥ 40% de todas las tareas pendientes en ese nodo |

Los nodos identificados se destacan visualmente y se acompañan de una **recomendación en lenguaje natural** generada por el servicio de IA (ej: "El nodo 'Revisión Legal' concentra el 65% de las tareas pendientes. Se recomienda asignar personal adicional al departamento Legal o simplificar el formulario.").

---

## 14. Semáforo Visual de Estados

El sistema usa un semáforo visual consistente en todas las vistas:

| Semáforo | Estado del trámite | Estado de la tarea |
|---|---|---|
| Verde | COMPLETED — finalizado con éxito | DONE — completada |
| Amarillo | IN_PROGRESS — en ejecución | IN_PROGRESS — siendo atendida |
| Rojo | IN_PROGRESS con tareas bloqueadas | PENDING — sin asignar |

El semáforo aparece en: Dashboard, lista de trámites, detalle del trámite, bandeja del funcionario y monitor en tiempo real.

---

## 15. Flujo de Prueba Completo

Guía paso a paso para probar todas las funciones del sistema.

### Fase 1 — Preparación (como admin@demo.com)

1. Ir a **Departamentos** → verificar que existen: Recursos Humanos, Legal, Finanzas, Operaciones
2. En el Dashboard → verificar las políticas activas

### Fase 2 — Crear una nueva política

1. Clic en **"+ Nueva Política"**
2. Nombre: `Aprobación de Préstamo Personal`
3. Descripción: `Flujo con evaluación y decisión de aprobación`
4. Clic en **"Crear"** → se abre el editor

### Fase 3 — Diseñar el diagrama en el editor

5. Agregar nodo **INITIAL** → clic en "Agregar"
6. Agregar nodo **ACTION** → nombre: `Recibir Solicitud` → departamento: `Operaciones`
7. Agregar nodo **ACTION** → nombre: `Evaluar Documentos` → departamento: `Legal`
8. Agregar nodo **DECISION** → nombre: `Documentos completos?`
9. Agregar nodo **ACTION** → nombre: `Aprobar Préstamo` → departamento: `Finanzas`
10. Agregar nodo **ACTION** → nombre: `Solicitar Corrección` → departamento: `Operaciones`
11. Agregar nodo **FINAL**
12. Conectar: INITIAL → Recibir Solicitud → Evaluar Documentos → DECISION
13. Desde DECISION: conectar con etiqueta `"Aprobado"` → Aprobar Préstamo → FINAL
14. Desde DECISION: conectar con etiqueta `"Rechazado"` → Solicitar Corrección → Evaluar Documentos (ciclo iterativo)
15. Clic en **"Guardar"**

### Fase 4 — Diseñar formularios

16. Clic en el nodo **"Recibir Solicitud"** → pestaña Formulario
17. Agregar campos:
    - Etiqueta: `Nombre del solicitante` / Tipo: Texto
    - Etiqueta: `Monto solicitado (USD)` / Tipo: Número
    - Etiqueta: `Documentos presentados` / Tipo: Grid / Columnas: `Documento,Fecha,Estado`
    - Etiqueta: `Observaciones` / Tipo: Párrafo
18. Clic en **"Guardar formulario"**
19. Repetir para el nodo **"Evaluar Documentos"** con:
    - Etiqueta: `Resultado de evaluación` / Tipo: Selección / opciones: `Aprobado,Rechazado`
    - Etiqueta: `Observaciones legales` / Tipo: Párrafo
    - Etiqueta: `Verificar identidad` / Tipo: Botón acción

### Fase 5 — Probar el asistente IA

20. En el editor, panel derecho → pestaña IA
21. Escribir: `"Agrega una actividad de notificación al cliente en Operaciones"`
22. Ver cómo el nodo se crea automáticamente
23. Probar con voz: clic en 🎤 → decir "conecta Aprobar Préstamo con Notificar Cliente"

### Fase 6 — Iniciar un trámite (como cliente@demo.com)

24. Cerrar sesión → iniciar como `cliente@demo.com` / `Admin1234!`
25. Dashboard → clic en **"Trámites"** de la política creada
26. Clic en **"+ Nuevo Trámite"**
27. Se generan automáticamente las primeras tareas

### Fase 7 — Ejecutar tareas (como rrhh@demo.com / operaciones)

28. Cerrar sesión → iniciar como `rrhh@demo.com` / `Admin1234!`
29. Ir a **"Mis Tareas"** → ver la tarea `Recibir Solicitud`
30. Abrir la tarea → llenar el formulario:
    - Usar **"🎙️ Dictar todo"**: decir "El solicitante es Juan Pérez, el monto es diez mil dólares"
    - Ver cómo el NLP llena los campos automáticamente con indicadores de confianza
    - En el grid, agregar filas con los documentos
31. Clic en **"Guardar formulario"** → **"Completar"**
32. La tarea pasa a verde y se genera la siguiente tarea

### Fase 8 — Monitorear (como admin@demo.com)

33. Iniciar sesión como `admin@demo.com`
34. Ir a **"Monitor en Vivo"**
35. Observar el caso activo con su semáforo en tiempo real
36. Completar la siguiente tarea desde otra pestaña y ver cómo el monitor se actualiza sin recargar

### Fase 9 — Ver analítica

37. Ir a **"Analítica"**
38. Seleccionar la política del préstamo
39. Ver los tiempos por nodo y la detección de cuellos de botella con recomendación IA

---

## 16. Credenciales de Demo

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| Administrador / Diseñador | admin@demo.com | Admin1234! | Dashboard completo, editor, analítica |
| Funcionario RRHH | rrhh@demo.com | Admin1234! | Bandeja de tareas, formularios |
| Funcionario Legal | legal@demo.com | Admin1234! | Bandeja de tareas, formularios |
| Funcionario Finanzas | finanzas@demo.com | Admin1234! | Bandeja de tareas, formularios |
| Cliente | cliente@demo.com | Admin1234! | Iniciar trámites, ver estado |

**URL del sistema:** http://18.231.192.169:4200

---

## 17. Preguntas Frecuentes

### ¿Por qué no funciona el micrófono?
Asegúrate de usar **Google Chrome**. El sitio debe cargarse por HTTPS o localhost (requisito de la Web Speech API). Verificar que el navegador tiene permisos de micrófono activados.

### ¿Puedo editar un diagrama si ya hay trámites activos?
Sí. Los trámites ya iniciados continúan con el diagrama de cuando fueron creados. Los nuevos trámites usarán la versión actualizada del diagrama.

### ¿Qué pasa si una tarea se queda bloqueada?
El DESIGNER puede cancelar el trámite desde el detalle del caso. También puede reasignar la tarea a otro funcionario desde el panel de administración.

### ¿El sistema requiere conexión a internet para la IA?
No para las funciones básicas. El servicio de IA (FastAPI) usa lógica basada en reglas que se ejecuta localmente. Las claves de OpenAI y ElevenLabs son opcionales para funciones avanzadas.

### ¿Cómo funciona el flujo paralelo (FORK/JOIN)?
Al llegar a un nodo FORK, el motor crea simultáneamente tareas en todos los nodos hijos. Cada una es atendida por su departamento en paralelo. Al completarse todas, el nodo JOIN activa la tarea siguiente.

### ¿Cuándo se detecta un cuello de botella?
Cuando un nodo acumula ≥2 tareas pendientes, su duración promedio supera 1.5× el promedio global, Y concentra ≥40% de toda la carga pendiente del proceso.

### ¿Cómo funciona el grid en los formularios?
Al definir un campo de tipo Grid en el diseñador, se especifican los nombres de las columnas separados por coma. Durante la ejecución, el funcionario puede agregar y eliminar filas con datos tabulares. Los datos se almacenan como JSON y se incluyen en el historial del trámite.

### ¿Los botones en formularios realizan acciones automáticas?
Actualmente los botones registran su ejecución con timestamp en el formulario. La lógica de acción personalizada (llamar a un servicio externo, calcular valores) puede configurarse en el backend por el equipo técnico.

---

**Sistema:** WorkflowSW1 — Gestión de Políticas de Negocio
**Materia:** Ingeniería de Software I — Primer Parcial 2026
**Tecnologías:** Spring Boot · Angular 18 · MongoDB · FastAPI · Flutter · AWS EC2
**Autor:** Fernando Angulo
