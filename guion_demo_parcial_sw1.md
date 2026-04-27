# Guion de Demo - Parcial SW1 (28 Abril 2026)

## Antes de empezar (10 min previos)

```powershell
# 1. Verificar MongoDB corriendo
netstat -ano | Select-String ":27017"

# 2. Levantar backend (terminal 1)
cd d:\Universidad\SW1S12025\PrimerParcialSW1\workflow-engine
.\mvnw spring-boot:run

# 3. Levantar frontend (terminal 2)
cd d:\Universidad\SW1S12025\PrimerParcialSW1\frontend-ng
& "C:\nvm4w\nodejs\ng.ps1" serve --port 4200

# 4. Cargar datos demo (terminal 3, esperar que el backend este listo)
cd d:\Universidad\SW1S12025\PrimerParcialSW1
.\scripts\seed-demo.ps1
```

URLs:
- Frontend: http://localhost:4200
- Backend: http://localhost:8080/api

---

## Credenciales demo (todas con contrasena: Admin1234!)

| Usuario | Rol | Departamento |
|---|---|---|
| admin@demo.com | DESIGNER | Direccion |
| disenador@demo.com | DESIGNER | Direccion |
| rrhh@demo.com | OFFICER | Recursos Humanos |
| legal@demo.com | OFFICER | Legal |
| finanzas@demo.com | OFFICER | Finanzas |
| ti@demo.com | OFFICER | TI |

---

## Script de presentacion (15-20 min)

### Bloque 1 — Sistema base y Diseno de Politicas (3-4 min)

**Login como admin@demo.com**

1. Mostrar el **Dashboard** → KPIs globales (total tramites, activos, pendientes).
2. Ir a **Politicas** → mostrar las 4 politicas creadas.
3. Entrar al **Editor** de "Contratacion de Personal":
   - Mostrar diagrama con DECISION y FORK/JOIN visible.
   - Explicar calles (swimlanes): cada departamento es una calle.
   - Agregar un nodo de prueba con el boton "+ Agregar" y voz (🎤).
   - Conectar con flujo CONDICIONAL mostrando el label.
   - Guardar y deshacer el cambio.

**Punto clave a mencionar:**  
> "El diseñador puede crear la politica visualmente o usando lenguaje natural por texto o voz. El sistema soporta flujos secuenciales, condicionales, paralelos e iterativos."

---

### Bloque 2 — Ejecucion end-to-end: Flujo Condicional + Paralelo (5-6 min)

**Politica: Contratacion de Personal**

1. Ir a **Tramites** → Nuevo tramite → seleccionar "Contratacion de Personal".
2. Abrir el caso creado. Mostrar tareas del flujo.
3. Asignar "Solicitud de Puesto" a **Rosa RRHH** (rrhh@demo.com).
4. Ir a **Bandeja del Funcionario** (abrir en otro navegador como rrhh@demo.com):
   - Mostrar la tarea en la bandeja con **semaforo de prioridad** (rojo/amarillo/verde).
   - Abrir la tarea. Llenar el **formulario** (nombre candidato, puesto, anos experiencia).
   - **Dictar por voz** uno de los campos (boton 🎤).
   - Guardar formulario → toast "Formulario guardado".
   - Completar tarea → se avanza al siguiente nodo.
5. Volver a la sesion de admin → mostrar que la tarea de "Revision de Perfil" aparecio automaticamente (tiempo real, sin recargar).
6. Completar "Revision de Perfil" → aparece DECISION "Perfil Aprobado?".
7. Elegir **"Aprobado"** → motor crea "Notif. Aprobado".
8. Completar "Notif. Aprobado" → **FORK se dispara**: aparecen simultaneamente "Firma de Contrato" (Legal) + "Induccion" (TI).
9. Completar ambas tareas paralelas → JOIN detecta que ambas estan DONE → case avanza a FINAL.

**Punto clave a mencionar:**  
> "El motor ejecuta automaticamente: condicional (DECISION) y paralelo (FORK/JOIN). El funcionario ve actualizacion instantanea via WebSocket."

---

### Bloque 3 — Flujo Iterativo (2-3 min)

**Politica: Revision de Contratos**

1. Ir al caso activo de "Revision de Contratos" (tiene una iteracion ya hecha, Luis Legal tiene la v2 asignada).
2. Mostrar el historial de eventos: se ve `TASK_CREATED` repetido → evidencia del loop.
3. Explicar: el borrador fue enviado a corregir (back-edge), ahora esta en la iteracion 2.
4. Completar la tarea de "Redactar Borrador" v2.
5. En la DECISION elegir **"No, Aprobar"** → flujo avanza a "Firmar y Archivar".
6. Completar "Firmar y Archivar" → caso pasa a **COMPLETED**.

**Punto clave a mencionar:**  
> "El flujo iterativo se modela como un back-edge desde el nodo DECISION al nodo anterior. No requiere configuracion especial: el motor crea una nueva tarea en el nodo destino, permitiendo N iteraciones de correccion antes de aprobar."

---

### Bloque 4 — Monitor en Vivo y Tiempo Real (1-2 min)

1. Abrir **Monitor** → mostrar todos los tramites activos.
2. En otra pestana, iniciar un nuevo tramite.
3. Ver como aparece **instantaneamente** en el Monitor sin recargar.
4. Mostrar el **Feed de Eventos** en tiempo real.

---

### Bloque 5 — Analytics y Cuellos de Botella (2-3 min)

1. Ir a **Analytics**.
2. Mostrar KPIs globales: total tramites, activos, completados, tareas pendientes.
3. Mostrar el grafico de barras "**Carga por Departamento**" → evidencia visual de donde se acumula trabajo.
4. Seleccionar politica "Contratacion de Personal" → mostrar:
   - Tramites completados, duracion promedio.
   - Tabla por nodo: pendientes, duracion promedio.
   - Si aparece un cuello de botella → panel naranja con nombre del nodo.
5. Mostrar **Sugerencias Inteligentes** (aiInsights): critico, advertencia, informacion.

**Punto clave a mencionar:**  
> "El sistema detecta automaticamente cuellos de botella cuando un nodo tiene 3 o mas tareas pendientes o tarda 50% mas que el promedio. Las sugerencias se generan en base a los datos reales."

---

### Bloque 6 — Innovacion: IA en el Editor (1-2 min)

1. Volver al editor de politicas.
2. Usar el panel de **IA por texto**: escribir "Agrega una actividad de validacion legal en el departamento Legal".
3. Mostrar que el asistente responde con nodos sugeridos.
4. Usar el boton de **voz** para dar una instruccion de diseno.
5. Mostrar el boton de **imagen/OCR**: subir una foto de un diagrama y ver como parsea los nodos.

---

### Bloque 7 — Formularios dinámicos con Voz (1 min, refuerzo)

1. En cualquier tarea activa con formulario, mostrar:
   - Campos de texto con boton 🎤.
   - Dictar una respuesta por voz.
   - El campo se completa automaticamente.
   - Guardar formulario con "Guardar Formulario".

---

## Checklist final antes de demo

- [ ] MongoDB corriendo (puerto 27017)
- [ ] Backend arriba y respondiendo (`curl http://localhost:8080/api/departments`)
- [ ] Frontend cargando en http://localhost:4200
- [ ] Seed ejecutado OK (ver "SEED COMPLETADO OK")
- [ ] Login con admin@demo.com funciona
- [ ] Monitor muestra tramites activos
- [ ] Al menos 1 caso de "Revision de Contratos" con iteracion activa
- [ ] Analytics muestra datos historicos (Vacaciones: 3, Compras: 2, Contratacion: 2, Revision: 3)

---

## Respuestas a posibles preguntas del profesor

**P: ¿Como sabe el motor que actividad sigue?**  
R: Cada politica guarda nodos y aristas. Cuando una tarea se completa, el motor busca las aristas salientes del nodo actual y crea tareas en los nodos destino. El tipo de arista (SEQUENTIAL, CONDITIONAL, PARALLEL, ITERATIVE) determina el comportamiento.

**P: ¿Como funciona el flujo iterativo concretamente?**  
R: Es un back-edge en el grafo. En el nodo DECISION, si el operador elige "Corregir", la arista apunta al nodo anterior. El motor crea una nueva tarea ahi, igual que cualquier otra arista. No hay limite de iteraciones; termina cuando se elige la rama de aprobacion.

**P: ¿Como se detectan los cuellos de botella?**  
R: Dos criterios: (1) un nodo tiene 3 o mas tareas pendientes activas, o (2) la duracion promedio del nodo supera en 50% el promedio global. El sistema genera automaticamente una sugerencia con el nombre del departamento y una recomendacion de accion.

**P: ¿El tiempo real funciona entre distintos navegadores?**  
R: Si. Usa Spring WebSocket + STOMP. Cualquier cliente suscrito a `/topic/events` recibe la notificacion. El funcionario en su bandeja y el administrador en el monitor ven el cambio instantaneamente.

**P: ¿Se puede disenar una politica con IA sin saber programar?**  
R: Si. Desde el editor, el usuario puede escribir en lenguaje natural ("Agrega una actividad de aprobacion en Legal") o dictar por voz. El asistente interpreta la instruccion y agrega el nodo. Tambien puede subir una imagen de un diagrama y el sistema extrae los nodos con OCR.

---

## Datos de prueba disponibles post-seed

| Politica | Activos | Completados | Tipo de flujo |
|---|---|---|---|
| Contratacion de Personal | 3 | 2 | Secuencial + Condicional + Paralelo |
| Solicitud de Vacaciones | 1 | 3 | Secuencial |
| Aprobacion de Compras | 1 | 2 | Secuencial |
| Revision de Contratos | 1* | 3 | Iterativo |

*El caso activo de Revision tiene una iteracion (Corregir) ya hecha, la 2da version asignada a Luis Legal.
