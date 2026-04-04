# Backlog Individual - Parcial SW1 (con PUDS)

## Objetivo
Plan personal para construir y demostrar una aplicacion de workflow con:
- diseno de politicas en diagrama de actividades por calles,
- ejecucion de tramites con monitor por funcionario,
- asistencia de IA (texto/voz),
- deteccion de cuellos de botella.

## Como usar PUDS en este parcial
PUDS = unidad de avance personal para planificar y medir trabajo.
- 1 PUD = tarea pequena (1 a 2 horas).
- 2 PUDS = tarea mediana (3 a 4 horas).
- 3 PUDS = tarea grande (5 a 8 horas).

Regla practica:
- Meta semanal recomendada: 10 a 14 PUDS.
- Meta total hasta entrega: 35 a 45 PUDS.

---

## Backlog por bloques (individual)

### Bloque 1 - Base del sistema (10 PUDS)
1. Inicializar frontend (React + Vite + TS) y backend (Express + TS). (2 PUDS)
2. Configurar PostgreSQL + Prisma. (2 PUDS)
3. Crear autenticacion simple con roles: disenador y funcionario. (2 PUDS)
4. CRUD de politicas de negocio. (2 PUDS)
5. CRUD de departamentos y funcionarios. (2 PUDS)

### Bloque 2 - Motor de workflow minimo (12 PUDS)
1. Modelo de nodos y conexiones (ActivityNode y ActivityEdge). (2 PUDS)
2. Editor de diagrama con React Flow (crear, mover, conectar). (3 PUDS)
3. Guardar/cargar diagrama desde BD. (2 PUDS)
4. Crear tramite y ejecutar flujo secuencial. (2 PUDS)
5. Soporte de flujo condicional, iterativo y paralelo. (3 PUDS)

### Bloque 3 - Monitor y tiempo real (8 PUDS)
1. Bandeja del funcionario con tareas pendientes/en proceso/finalizadas. (2 PUDS)
2. Cambio de estado de tarea y avance del tramite. (2 PUDS)
3. Actualizacion automatica con Socket.IO (sin recargar). (2 PUDS)
4. Historial basico de eventos por tramite. (2 PUDS)

### Bloque 4 - Innovacion obligatoria IA (10 PUDS)
1. Prompt por texto para crear actividad y conectar nodos. (3 PUDS)
2. Prompt por voz (speech-to-text) para ejecutar acciones similares. (3 PUDS)
3. Formulario por actividad con carga manual. (2 PUDS)
4. Carga por voz al formulario (dictado y autocompletado). (2 PUDS)

### Bloque 5 - Cuellos de botella y demo (8 PUDS)
1. Calculo de tiempo promedio por etapa y tiempo en cola. (2 PUDS)
2. Regla de deteccion inicial de cuello de botella. (2 PUDS)
3. Vista de KPIs minima (tabla o tarjetas). (2 PUDS)
4. Guion del demo y datos de prueba. (2 PUDS)

Total estimado: 48 PUDS

---

## Priorizacion (MVP primero)
### Prioridad P1 (imprescindible)
1. Editor basico de politicas (manual).
2. Ejecucion de tramite end-to-end.
3. Monitor de funcionario en tiempo real.
4. Formulario por actividad.
5. Deteccion minima de cuello de botella.

### Prioridad P2 (obligatorio de innovacion)
1. Prompt por texto para ayudar al diseno.
2. Prompt por voz para diseno o llenado.
3. Dashboard KPI un poco mas claro.

### Prioridad P3 (mejora de nota)
1. Mejoras UX/colaboracion.
2. Reglas de cuello de botella mas avanzadas.
3. Reportes exportables.

---

## Cronograma sugerido (desde hoy)
## Semana 1
- Completar Bloque 1 y mitad de Bloque 2.
- Entregable: politica creada, guardada y editable.

## Semana 2
- Terminar Bloque 2 y Bloque 3.
- Entregable: tramite corriendo con monitor en vivo.

## Semana 3
- Completar Bloque 4.
- Entregable: asistente IA texto/voz funcional en al menos un flujo.

## Semana 4
- Completar Bloque 5 y pulir demo.
- Entregable: demo integral lista para examen.

---

## Checklist de avance diario (individual)
1. Que hice hoy (PUDS completados).
2. Que bloqueo tengo.
3. Que hare manana.
4. Evidencia rapida (captura o video corto).

Formato recomendado:
- Fecha:
- PUDS completados:
- PUDS pendientes:
- Riesgo principal:
- Accion de mitigacion:

---

## Alcance minimo para aprobar (enfocado al examen)
1. Crear politica de negocio en diagrama de calles.
2. Ejecutar tramite entre varios funcionarios.
3. Ver actualizacion automatica sin refrescar.
4. Registrar informacion de tareas en formulario.
5. Mostrar deteccion de cuello de botella con criterio definido.
6. Mostrar al menos una interaccion con IA (texto o voz).

## Fecha del parcial
28 de abril.
