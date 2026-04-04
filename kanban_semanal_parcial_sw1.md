# Kanban Semanal - Parcial SW1

Fecha objetivo de entrega: 28 de abril

## Como usar este tablero
- Cada semana tiene columnas de control: Por hacer, En curso, Hecho.
- Limite recomendado: maximo 3 tareas en "En curso" por semana.
- Si una tarea no termina, pasa a la siguiente semana con prioridad alta.

---

## Semana 1 - Base y estructura
Objetivo: dejar el proyecto montado y poder crear politicas basicas.

### Por hacer
- [ ] Inicializar frontend (React + Vite + TS)
- [ ] Inicializar backend (Express + TS)
- [ ] Configurar PostgreSQL + Prisma
- [ ] Implementar login simple y roles
- [ ] CRUD de politicas de negocio
- [ ] CRUD de departamentos y funcionarios
- [ ] Editor basico de diagrama (crear nodos y conexiones)

### En curso (max 3)
- [ ]
- [ ]
- [ ]

### Hecho
- [ ]

### Hito de cierre semana 1
- [ ] Se puede crear, guardar y volver a abrir una politica.

---

## Semana 2 - Motor de workflow y monitor
Objetivo: ejecutar tramites reales con tareas por funcionario.

### Por hacer
- [ ] Guardar/cargar nodos y aristas en BD
- [ ] Crear tramite (case) desde una politica
- [ ] Motor de avance secuencial
- [ ] Soporte de rutas condicionales
- [ ] Soporte de flujo iterativo/paralelo (version minima)
- [ ] Bandeja del funcionario (pendiente/en proceso/finalizado)
- [ ] Historial basico del tramite

### En curso (max 3)
- [ ]
- [ ]
- [ ]

### Hecho
- [ ]

### Hito de cierre semana 2
- [ ] Un tramite avanza de punta a punta entre dos funcionarios.

---

## Semana 3 - Tiempo real e innovacion IA
Objetivo: cumplir lo obligatorio de innovacion.

### Por hacer
- [ ] Integrar Socket.IO para actualizacion automatica
- [ ] Monitor sin recargar pagina
- [ ] Prompt por texto para crear/conectar actividades
- [ ] Prompt por voz para crear/conectar o llenar formulario
- [ ] Formulario por actividad (manual)
- [ ] Llenado por voz asistido

### En curso (max 3)
- [ ]
- [ ]
- [ ]

### Hecho
- [ ]

### Hito de cierre semana 3
- [ ] Diseno asistido con IA (texto o voz) funcionando en demo.

---

## Semana 4 - KPI, cuellos de botella y demo final
Objetivo: cerrar funcionalidad y preparar presentacion.

### Por hacer
- [ ] Calcular tiempos por etapa
- [ ] Medir tiempo en cola por tarea
- [ ] Definir regla de cuello de botella (KPI/umbral)
- [ ] Mostrar cuello de botella detectado
- [ ] Preparar datos de prueba
- [ ] Escribir guion de demo (5-8 min)
- [ ] Ensayar demo completa (minimo 2 veces)

### En curso (max 3)
- [ ]
- [ ]
- [ ]

### Hecho
- [ ]

### Hito de cierre semana 4
- [ ] Demo integral estable y lista para examen.

---

## Control de riesgo semanal
- Semaforo Semana 1: [ ] Verde [ ] Amarillo [ ] Rojo
- Semaforo Semana 2: [ ] Verde [ ] Amarillo [ ] Rojo
- Semaforo Semana 3: [ ] Verde [ ] Amarillo [ ] Rojo
- Semaforo Semana 4: [ ] Verde [ ] Amarillo [ ] Rojo

Regla de recuperacion:
1. Si una semana queda en Rojo, mover mejoras opcionales a "post examen".
2. Priorizar siempre: flujo end-to-end > tiempo real > IA minima > KPIs.
3. No abrir nuevas funcionalidades sin cerrar las obligatorias.

---

## Checklist final (obligatorio)
- [ ] Politica en diagrama de calles.
- [ ] Tramite entre funcionarios.
- [ ] Actualizacion automatica del monitor.
- [ ] Formulario por actividad.
- [ ] Cuello de botella identificado.
- [ ] IA utilizada en al menos una parte del flujo.
- [ ] Demo corrida sin errores criticos.
