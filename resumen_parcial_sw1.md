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
