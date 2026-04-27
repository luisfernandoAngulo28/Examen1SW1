# Resumen Parcial SW1

## 1. Contexto del problema
Empresas de servicios (por ejemplo, CRE, Cotas, Tigo) manejan tramites que pasan por varias areas y funcionarios. Actualmente, el cliente inicia un tramite en atencion al cliente, se validan requisitos y luego el caso se deriva por distintos departamentos hasta su cierre.

El problema central es que el seguimiento no siempre es claro para cliente y funcionarios: se dificulta saber en que estado esta el tramite, cuanto tardara y donde se generan cuellos de botella.

Se requiere una herramienta de workflow para definir, ejecutar y monitorear politicas de negocio de forma trazable y colaborativa.
Tambien se considera un bot de ayuda para que el cliente pueda consultar el seguimiento de su tramite.

## 2. Requisitos funcionales
- Permitir crear politicas de negocio mediante Diagrama de Actividades UML organizado en calles (swimlanes).
- Permitir gestionar el ciclo de vida de politicas: crear, editar, dar de baja, visualizar y monitorizar.
- Soportar flujos secuenciales, alternativos (condicionales), iterativos y paralelos, incluyendo combinaciones.
- Cargar y administrar departamentos, actividades y responsables.
- Permitir asignacion dinamica de departamentos y funcionarios por calle, sin roles/departamentos "quemados".
- Enrutar automaticamente cada tramite segun la politica definida.
- Proveer monitor por funcionario con sus tareas pendientes y en curso.
- Mostrar estado del tramite y avance general en tiempo real, sin recarga manual constante.
- Mostrar estado visual del tramite (por ejemplo: verde, amarillo, rojo) segun prioridad/avance.
- Registrar actividades atendidas, procesos y requerimientos por usuario.
- Permitir disenar formularios dinamicos por actividad/nodo para carga de texto, archivos o evidencias.
- Mostrar indicadores de atencion (por ejemplo, tiempos por etapa y por responsable).

## 3. Innovacion del parcial
La propuesta del parcial agrega, como novedad, tres capacidades obligatorias:
- Diseno colaborativo del diagrama con asistencia de IA, usando prompts por texto, voz o imagen.
- Generacion y llenado de formularios por actividad/funcionario, con carga manual o por voz con apoyo de IA.
- Deteccion de cuellos de botella con IA dentro del flujo de atencion.

Adicionalmente, cada equipo puede incluir una innovacion propia para mejorar la nota, siempre que cumpla primero con lo minimo obligatorio.

## 4. Alcance minimo y fecha
Alcance minimo esperado para el examen:
- Editor de politicas de negocio por calles (visual + apoyo por prompts).
- Ejecucion de flujos con enrutamiento entre funcionarios/departamentos.
- Monitor de funcionario con actualizacion automatica del estado.
- Estado visual de tareas/tramites por colores en monitor.
- Formularios para registrar avances por actividad (manual y/o voz asistida).
- Modulo de identificacion de cuellos de botella con criterios definidos por el equipo (metricas/KPIs).

Fecha del parcial: 28 de abril.

---

## Resumen Oro (si o si entra al parcial)
### Minimos obligatorios
- Diseno colaborativo de politicas de negocio.
- Interaccion con IA para asistir el diseno por texto, voz o imagen.
- Formularios por actividad para carga de informacion del funcionario.
- Analisis de cuellos de botella con IA.

### Roles
- Disenador de politicas (administrador funcional): crea y edita politicas.
- Funcionario: atiende tareas y registra avances.

### Criterios de evaluacion
- Cumplimiento de minimos obligatorios.
- Viabilidad y claridad del flujo de trabajo.
- Facilidad de uso de la herramienta.
- Calidad de la propuesta de innovacion adicional.
- Capacidad de medir e identificar cuellos de botella con criterios definidos.

### Alcance del demo para el dia del examen
- Mostrar al menos una politica funcionando de extremo a extremo.
- Simular multiples funcionarios (por ejemplo, en distintos navegadores).
- Evidenciar actualizacion automatica del progreso sin hacer clic manual.
- Mostrar semaforo visual de estados (verde/amarillo/rojo).
- Mostrar trazabilidad del tramite y deteccion de cuellos de botella.

## 5. Pendientes y mejoras futuras
Estos puntos aparecen en los apuntes de clase y conviene dejarlos como backlog para siguientes iteraciones:

### Funcionalidades de producto pendientes
- Portal o bot de ayuda para que el cliente consulte el estado de su tramite sin depender de un funcionario.
- Sistema de notificaciones cuando llega una nueva actividad o cuando un tramite cambia de estado.
- Opcion para dar de baja, desactivar o versionar politicas de negocio sin perder historial.
- Restriccion formal para impedir edicion de una politica que ya este en ejecucion.
- Historial completo del tramite: por que areas paso, quien lo atendio, cuanto duro cada etapa y cual fue el resultado.

### Mejoras del editor de politicas
- Edicion colaborativa en tiempo real entre varios disenadores sobre la misma politica.
- Asistente IA mas completo para mover, eliminar, resaltar y reconectar nodos mediante lenguaje natural.
- Soporte para generar diagramas mas grandes a partir de descripciones guiadas por IA.
- Mejor soporte para combinaciones de flujo: secuencial + condicional + iterativo + paralelo en una misma politica.

### Mejoras para ejecucion operativa
- Formularios mas ricos por actividad: adjuntos, imagenes, observaciones, validaciones y evidencia estructurada.
- Registro por voz mas robusto para funcionarios, con transcripcion y autocompletado del formulario.
- Bandeja del funcionario con prioridad, urgencia, atrasos y recomendaciones de siguiente accion.

### Analitica e inteligencia pendientes
- Definir KPIs formales para cuellos de botella: tiempo promedio por etapa, tiempo total del tramite, tareas rebotadas, carga por funcionario y retrasos por departamento.
- Identificar funcionarios o areas con menor rendimiento sin perder trazabilidad ni contexto del caso.
- Sugerencias de optimizacion generadas por IA sobre la politica: pasos redundantes, actividades lentas o rutas alternativas.

### Idea de innovacion fuerte para futuro
- Convertir el sistema en un asistente de productividad: no solo dibuja o ejecuta el workflow, tambien orienta al usuario segun su rol, recomienda acciones y ayuda a resolver bloqueos.

## 6. Estado actual y cierre al 100
### Lo que ya esta cubierto
- Editor visual de politicas con swimlanes y nodos UML (INITIAL, FINAL, DECISION, FORK, JOIN).
- Tipos de flujo secuencial, condicional, iterativo y paralelo.
- Motor de workflow completo: inicio, enrutamiento, decisiones runtime, fork/join paralelo, auto-advance.
- Roles separados: DESIGNER (administrador) y OFFICER (funcionario) con vistas diferenciadas.
- Dashboard del diseñador con KPIs y gestión de políticas.
- Bandeja del funcionario (Officer Dashboard) con filtros y asignación de tareas.
- Monitor en tiempo real con WebSocket (eventos en vivo, conexiones online).
- Semáforo visual de estados (verde/amarillo/rojo) en toda la aplicación.
- Formularios dinámicos por actividad (7 tipos de campo), con carga manual y por voz.
- Asistente IA por texto (NLP rule-based), voz (Web Speech API) e imagen (Tesseract.js OCR real).
- Analíticas con gráficos CSS/SVG: barras de carga, duración, donut de completitud.
- Detección de cuellos de botella con IA: análisis estadístico (media, 2-sigma), inferencia contextual y recomendaciones en lenguaje natural.
- Panel de Análisis Inteligente (IA) con severidad (crítico/advertencia/info/éxito) y acciones sugeridas.
- Registro de usuarios con UI completa y validación.
- Historial de eventos completo (CASE_STARTED, TASK_COMPLETED, DECISION_TAKEN, CASE_COMPLETED, etc.).
- Protección de roles en endpoints sensibles (@Roles DESIGNER en saveGraph).
- saveGraph protegido: no permite editar grafo con trámites en curso.
- Token expiry handling: redirect automático a login si 401.
- 27 tests unitarios (AuthControllerTest, AnalyticsControllerTest, CaseControllerTest) - 100% pass.
- Docker: docker-compose.yml + Dockerfiles backend/frontend/ai-service.
- CI/CD: GitHub Actions pipeline (backend tests + frontend build + docker build).
- Script de seed demo con 5 políticas incluyendo "Solicitud de Crédito Empresarial" (20 nodos UML, 22 aristas, todos los tipos de flujo).
- Manual de usuario con 20+ capturas del sistema funcionando.
- Código versionado en GitHub con commits descriptivos.

### Checklist final de entrega
- [x] Backend levantando sin errores.
- [x] Frontend levantando sin errores.
- [x] Login funcional con usuario de prueba (admin@demo.com / Admin1234!).
- [x] Registro de usuarios funcional (UI + API).
- [x] Política de ejemplo lista para demo (Proceso de Contratación).
- [x] Trámite de ejemplo ejecutado de punta a punta (CASE_COMPLETED).
- [x] Formularios guardando correctamente (con inputMode VOICE/MANUAL).
- [x] IA por texto funcionando (crear flujo, agregar nodo, conectar, eliminar).
- [x] IA por voz funcionando (Web Speech API español).
- [x] IA por imagen funcionando (Tesseract.js OCR real con progreso).
- [x] Monitor actualizando estados en tiempo real (WebSocket).
- [x] Analíticas visibles con datos y gráficos.
- [x] Análisis IA de cuellos de botella con recomendaciones.
- [x] Tests unitarios pasando (27/27).
- [x] Docker configurado (docker-compose.yml).
- [x] CI/CD configurado (GitHub Actions).
- [x] Manual con capturas finales correctas.
- [x] Cambios versionados y pusheados a GitHub.

### Conclusión práctica
El proyecto está al 100% para el parcial. Cubre todos los requisitos funcionales, innovaciones obligatorias, alcance mínimo y criterios de evaluación definidos en clase.
