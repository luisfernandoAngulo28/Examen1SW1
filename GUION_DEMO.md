# Guion de Demo - Parcial SW1 (28 de abril)

Duracion total: ~10 minutos

## Preparacion previa (antes de que llegue el profesor)

1. Abrir Chrome con 3 pestanas:
   - **Pestana A:** http://localhost:4200 → login con `admin@demo.com` / `Admin1234!`
   - **Pestana B:** http://localhost:4200 → login con `rrhh@demo.com` / `Admin1234!`
   - **Pestana C:** http://localhost:4200 → login con `finanzas@demo.com` / `Admin1234!`
2. Verificar que el badge diga **● En vivo** en Monitor y en Bandeja

---

## Pasos del Demo

| # | Que mostrar | Pestana | Duracion |
|---|---|---|---|
| 1 | Dashboard → lista de politicas cargadas (Contratacion, Vacaciones, Compras) + KPIs | A | 30 seg |
| 2 | Editor de politica → grafo visual de "Contratacion de Personal" con nodos Fork / Join / Decision | A | 1 min |
| 3 | **IA por texto**: escribir prompt en panel AI del editor → ver que sugiere nodos y conexiones | A | 1 min |
| 4 | **IA por voz**: clic en microfono (icono en campo Nombre) → dictar nombre de actividad | A | 30 seg |
| 5 | Monitor en Vivo → 4 tramites activos, badge "● Conectado", feed de eventos | A | 30 seg |
| 6 | Abrir Caso 1 (Contratacion) → asignar tarea a Rosa RRHH → clic Completar → ver historial de eventos actualizado | A | 1 min |
| 7 | **Tiempo real**: cambiar a Pestana B (rrhh) → la bandeja se actualiza sola sin recargar, aparece nueva tarea | B | 1 min |
| 8 | Pestana B: clic "Atender" → abrir Formulario → llenar campos por voz (boton microfono) → guardar | B | 1 min |
| 9 | Analytics → seleccionar "Contratacion de Personal" → ver KPIs + seccion "Cuellos de Botella Detectados" (criterio: pendingTasks >= 3 o avgDuration > promedio x 1.5) | A | 1 min |
| 10 | Mostrar CREDENCIALES_DEMO.md como resumen de usuarios y datos cargados | — | 30 seg |

---

## Frases clave para decir

- **Paso 2**: "El editor permite disenar politicas mediante un diagrama de actividades UML con calles, soportando flujos secuenciales, condicionales, paralelos e iterativos."
- **Paso 3**: "El asistente de IA interpreta el prompt y sugiere nodos y conexiones directamente en el grafo."
- **Paso 7**: "La actualizacion es en tiempo real via WebSocket, sin necesidad de recargar la pagina."
- **Paso 9**: "El modulo de analytics detecta automaticamente cuellos de botella usando criterios de cola y tiempo promedio por actividad."

---

## Si algo falla

| Problema | Solucion rapida |
|---|---|
| Badge dice "Desconectado" | Recargar la pagina, el WebSocket reconecta en 3 seg |
| Backend no responde | Verificar que Spring Boot este corriendo en puerto 8080 |
| No hay datos en Analytics | Completar al menos 1 tarea en el Caso 1 antes del demo |
| IA por voz no funciona | Usar Chrome; Firefox no soporta SpeechRecognition |
| MongoDB caido | Abrir terminal admin y ejecutar: `net start MongoDB` |
