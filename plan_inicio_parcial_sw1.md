# Plan de Inicio del Parcial SW1

## Stack recomendado
1. Frontend: React + Vite + TypeScript.
2. Editor de workflow: React Flow (nodos, conexiones y swimlanes por columnas).
3. Backend: NestJS + TypeScript.
4. Base de datos: PostgreSQL + Prisma.
5. Tiempo real: Socket.IO.
6. IA:
   - Texto: API LLM para convertir prompts en acciones del diagrama.
   - Voz: Speech-to-Text (por ejemplo, Whisper) y luego ejecutar acciones.
7. Autenticacion: JWT con dos roles (disenador y funcionario).

Stack elegido para el parcial:
- Frontend: React + Vite + TypeScript.
- Backend: NestJS + TypeScript.

## Orden de trabajo (paso a paso)
1. Cerrar alcance minimo del examen.
2. Disenar modelo de datos.
3. Construir flujo end-to-end sin IA.
4. Agregar actualizacion en tiempo real.
5. Agregar IA por texto.
6. Agregar IA por voz.
7. Agregar modulo de cuellos de botella.
8. Pulir demo final.

## Modelo minimo de datos
1. Policy: nombre, estado.
2. Department: nombre.
3. ActivityNode: policyId, departmentId, tipo, responsable.
4. ActivityEdge: fromNodeId, toNodeId, flowType (secuencial, condicional, iterativo, paralelo).
5. Case (Tramite): policyId, estadoActual.
6. Task: caseId, activityNodeId, funcionarioId, estado, timestamps.
7. FormSubmission: taskId, datos, origen (manual o voz).
8. EventLog: historial de cambios para trazabilidad.
9. KPIRecord: tiempo por etapa, cola, bloqueos detectados.

## MVP realista en 4 semanas
1. Semana 1: editor basico + guardar politica + ejecutar un tramite.
2. Semana 2: bandeja de funcionario + cambio de estados + tiempo real.
3. Semana 3: IA texto/voz para crear y conectar actividades.
4. Semana 4: KPIs + deteccion de cuellos de botella + guion de demo.

## Deteccion de cuello de botella (version inicial)
1. Tiempo promedio por actividad.
2. Tiempo en cola antes de atencion.
3. Casos acumulados por funcionario/departamento.
4. SLA incumplido por etapa.
5. Regla sugerida: marcar cuello de botella si una etapa supera el promedio global en mas del 40% o supera un umbral de pendientes.

## Checklist del demo (si o si)
1. Disenador crea/edita politica (manual o por prompt).
2. Se inicia un tramite.
3. Dos funcionarios en navegadores distintos ven cambios en vivo.
4. Se completa formulario y el flujo avanza automaticamente.
5. Dashboard muestra cuello de botella y motivo.

## Recomendacion de inicio hoy
1. Crear repositorio con dos carpetas: `frontend` y `backend`.
2. Implementar primero login basico por roles y CRUD de politicas.
3. Implementar editor de diagrama y persistencia de nodos/aristas.
4. Ejecutar un tramite de prueba de punta a punta sin IA.
5. Recién despues integrar IA (texto y voz).
