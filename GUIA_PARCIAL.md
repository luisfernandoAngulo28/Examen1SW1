# Guía de Respuestas — SW1 (Primer y Segundo Parcial)
**Proyecto:** WorkflowSW1 — Sistema de Gestión de Trámites con IA  
**URL producción:** http://54.233.18.87:4200  
**Entrega Primer Parcial:** Jueves 11 de junio 2026, 8:00 AM

---

## PREGUNTA 1 — ¿La aplicación está terminada y correctamente en un 100%?

**Respuesta: SÍ** — la aplicación está completamente desplegada y funcional en AWS EC2.

### Evidencia:
| Módulo | Estado | URL |
|--------|--------|-----|
| Frontend Angular 18 | ✅ Activo | http://54.233.18.87:4200 |
| Backend Spring Boot 3.5 / Java 22 | ✅ Activo | http://54.233.18.87:8080 |
| AI Service Python (NLP/NER) | ✅ Activo | http://54.233.18.87:8000 |
| ML Service TensorFlow | ✅ Activo | http://54.233.18.87:8001 |
| MongoDB | ✅ Activo | puerto 27017 interno |

### Roles implementados:
| Rol | Acceso |
|-----|--------|
| **ADMIN** | Dashboard completo, departamentos, políticas, analytics, reportes, registrar usuarios |
| **DESIGNER** | Editor de políticas visuales, formularios, diseño de flujos |
| **OFFICER** | Bandeja de tareas, atender trámites, formularios dinámicos |
| **CLIENT** | Dashboard, iniciar trámite por voz, ver "Mis Trámites" |

### Credenciales demo:
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin@demo.com | Admin123! | ADMIN |
| designer@demo.com | Demo1234! | DESIGNER |
| officer@demo.com | Demo1234! | OFFICER |
| client@demo.com | Demo1234! | CLIENT |

---

## PREGUNTA 2 — ¿Permite diseño visual de política según diagrama de actividades UML 2.5.0+?

**Respuesta: SÍ** — Editor visual con notación completa de diagrama de actividades UML.

### Tipos de nodo implementados (UML Activity Diagram):
| Nodo | Símbolo UML | Color en app | Descripción |
|------|-------------|--------------|-------------|
| **INITIAL** | Círculo relleno ● | Verde | Nodo inicial del flujo |
| **FINAL** | Círculo con borde doble ⊙ | Rojo | Nodo final del flujo |
| **ACTION** | Rectángulo redondeado | Azul | Actividad / tarea de proceso |
| **DECISION** | Rombo ◆ | Amarillo | Punto de decisión con ramas condicionales |
| **FORK** | Barra horizontal gruesa | Violeta | División paralela de flujo |
| **JOIN** | Barra horizontal gruesa | Turquesa | Unión de flujos paralelos |

### Tipos de conexión (edges):
- **SEQUENTIAL** — flujo secuencial entre actividades
- **CONDITIONAL** — con etiqueta de condición (ej: "Sí, inspección" / "No, directo")
- **PARALLEL** — conexión de Fork/Join

### Dos vistas del diagrama:
1. **Vista Calles (Swim Lanes)** — separa actividades por departamento, visualización SVG nativa, muestra flechas con etiquetas de condición
2. **Vista Grafo libre (ngx-graph)** — layout Dagre automático, arrastrable, zoom, selección de nodos

### Cómo demostrarlo:
1. Login como `admin@demo.com`
2. Dashboard → "Solicitud de Permiso Municipal" → ✏ Editar
3. Se ve el diagrama con nodos coloreados por tipo y swim lanes por departamento
4. Se puede agregar nodos, conectarlos y guardar

---

## PREGUNTA 3 — ¿Cuenta con diseñador de formulario dinámico con etiquetas, textarea, botones, grid?

**Respuesta: SÍ** — Cada nodo ACTION tiene su propio formulario configurado por el DESIGNER.

### Componentes del formulario dinámico (FormField types):
| Tipo | Descripción | Ejemplo de uso |
|------|-------------|----------------|
| `text` | Entrada de texto con voz | Nombre del solicitante |
| `textarea` | Área de texto + botón micrófono | Descripción del proyecto |
| `number` | Campo numérico | Área en m² |
| `date` | Selector de fecha | Fecha de inicio |
| `select` | Lista desplegable + voz | Tipo de trámite |
| `grid` | Tabla con columnas configurables | Lista de documentos |
| `button` | Botón de acción personalizado | "Confirmar inspección" |

### Funcionalidades avanzadas del formulario:
- **Dictado inteligente NLP** — botón "Dictar todo": el oficial narra los datos en una sola frase y el NLP los mapea a los campos
- **Indicador de confianza** — cada campo muestra % de confianza del NLP (verde ≥80%, amarillo ≥60%, rojo <60%)
- **Voz por campo** — botón de micrófono individual en cada textarea
- **Validación required** — asterisco visual y validación al enviar

### Cómo demostrarlo:
1. Login como `officer@demo.com`
2. Mi Bandeja → "Revisión Técnica" → Atender
3. Se ve el formulario dinámico con los campos configurados por el DESIGNER
4. Clic en "Dictar todo" → dictar "El solicitante es Juan Pérez, área de 150 metros cuadrados"
5. Los campos se rellenan automáticamente con % de confianza

### Dónde se configura (DESIGNER):
- Editor de política → seleccionar nodo ACTION → pestaña "Formulario" (panel derecho)
- Agregar/eliminar campos con tipo, nombre, etiqueta, required
- El formulario se guarda como `formTemplate` en la política

---

## PREGUNTA 4 — ¿Genera alertas y/o mediciones para identificar cuellos de botella?

**Respuesta: SÍ** — Módulo Analytics completo con detección automática de cuellos de botella.

### Mediciones implementadas:

#### Nivel global (Dashboard stats):
- Total trámites / En Progreso / Completados / Tareas Pendientes
- Carga por departamento (barra de progreso con alerta roja si ≥3 tareas)

#### Nivel por política (Analytics → seleccionar política):
| Métrica | Descripción |
|---------|-------------|
| `avgDurationMinutes` | Duración promedio del trámite completo |
| `avgDurationMinutes` por nodo | Tiempo promedio en cada actividad |
| `pendingTasks` por nodo | Tareas acumuladas sin completar |
| `isBottleneck` | Flag automático: nodo es cuello si tiene > promedio de tareas pendientes |

#### Alertas de cuello de botella:
- **Panel naranja "⚠ Cuellos de Botella Detectados"** — lista nodos problemáticos con duración y pendientes
- **Tabla de nodos** — columna Estado: badge rojo "⚠ Cuello" o verde "✓ Normal"
- **Sugerencias Inteligentes (AI Insights)** — el sistema genera recomendaciones con severidad: `critical`, `warning`, `info`, `success`

#### Predicciones ML (panel en Dashboard):
- **Riesgo de Demora** — TensorFlow predice probabilidad de retraso por trámite (ALTO/MEDIO/BAJO)
- **Prioridad de Tareas** — ordena tareas por urgencia (CRITICAL/HIGH/NORMAL/LOW)
- **Anomalías Detectadas** — modelo de detección de outliers en tiempos de proceso

### Cómo demostrarlo:
1. Login como `admin@demo.com` → Analytics
2. Seleccionar "Solicitud de Permiso Municipal"
3. Muestra duración promedio, nodos con pendientes, panel de cuellos si hay

---

## PREGUNTA 5 — ¿La aplicación utiliza IA durante el diagrama y durante el llenado del formulario?

**Respuesta: SÍ** — IA integrada en ambas fases.

### IA durante diseño del diagrama (DESIGNER):

**Panel AI en el Editor de Políticas** (tab "AI" en panel derecho):
1. El DESIGNER describe el proceso en lenguaje natural: *"Quiero un proceso de permiso municipal con revisión técnica y aprobación final"*
2. La IA (ai-service Python, endpoint `/api/ai/assist`) analiza y sugiere nodos + conexiones
3. El DESIGNER puede aplicar la sugerencia directamente al diagrama
4. Además:
   - **Dictado por voz** — botón micrófono para dictar la descripción del proceso
   - **OCR de imagen** — subir foto de diagrama en papel → Tesseract.js extrae texto → se envía a IA para interpretar

**Text-to-Speech (ElevenLabs TTS):**
- Botón "Escuchar" en cada respuesta de la IA → lee la sugerencia en voz alta

### IA durante llenado de formulario (OFFICER):

**Dictado NLP holístico** (`dynamic-form.component.ts`):
1. El oficial pulsa "Dictar todo"
2. Web Speech API captura la frase completa
3. Se envía a `POST /api/nlp/fill-form` con los campos del formulario
4. El NLP extrae entidades (nombre, fechas, números, tipos) y las mapea a campos
5. Cada campo muestra % de confianza en tiempo real

**Voz por campo individual:**
- Botón micrófono en cada textarea/select para dictar un campo específico

### IA durante inicio de trámite (CLIENT):
- Página "Iniciar Trámite por Voz" (`/nuevo-proceso`) — el cliente narra qué trámite quiere
- NLP identifica la política correspondiente y pre-rellena datos

---

## PREGUNTA 6 — Métricas de Tamaño y Función (3 Empresas)

### Contexto del proyecto medido:
WorkflowSW1 es un sistema de gestión de workflow con motor de procesos, IA y predicciones ML.

---

### EMPRESA 1: Municipio de La Paz — Gestión de Trámites Ciudadanos
*Uso del sistema para procesar permisos de construcción, licencias de funcionamiento.*

#### Métricas de Tamaño (LOC — Líneas de Código):

| Componente | Tecnología | LOC estimadas |
|------------|-----------|---------------|
| workflow-engine (backend) | Java 22 / Spring Boot | ~6.500 |
| frontend-ng (UI) | Angular 18 / TypeScript | ~5.200 |
| ai-service (NLP/NER) | Python / FastAPI | ~950 |
| ml-service (TensorFlow) | Python / TensorFlow | ~420 |
| scripts (seeder/utils) | Python | ~380 |
| **Total** | | **~13.450 LOC** |

> **Productividad estimada:** 13.450 LOC / 4 meses = ~3.360 LOC/mes  
> **Densidad de defectos esperada:** 15-20 defectos / KLOC → ~200-270 defectos potenciales

---

#### Métricas de Función (Function Point Analysis — ISO/IEC 20926):

**Entradas Externas (EI — External Inputs):**
| Función | Complejidad | PF |
|---------|-------------|-----|
| Iniciar sesión | Simple | 3 |
| Registrar usuario | Media | 4 |
| Crear política con nodos/aristas | Compleja | 6 |
| Iniciar trámite (caso) | Media | 4 |
| Completar tarea + formulario dinámico | Compleja | 6 |
| Asignar tarea a oficial | Simple | 3 |
| Cancelar trámite | Simple | 3 |
| Subir documento adjunto | Media | 4 |
| Crear/editar departamento | Simple | 3 |
| Consulta IA por voz (dictado) | Compleja | 6 |
| Configurar formulario dinámico | Compleja | 6 |
| Iniciar trámite por voz (NLP) | Compleja | 6 |
| **Subtotal EI** | | **54** |

**Salidas Externas (EO — External Outputs):**
| Función | Complejidad | PF |
|---------|-------------|-----|
| Dashboard KPI (stats globales) | Media | 5 |
| Reporte de cuellos de botella | Compleja | 7 |
| Predicciones ML (riesgo/prioridad/anomalías) | Compleja | 7 |
| Notificaciones push (Firebase) | Media | 5 |
| Sugerencias IA (insights) | Media | 5 |
| Reporte NLP por lenguaje natural | Compleja | 7 |
| **Subtotal EO** | | **36** |

**Consultas Externas (EQ — External Inquiries):**
| Función | Complejidad | PF |
|---------|-------------|-----|
| Listar políticas | Simple | 3 |
| Ver detalle de política (nodos/aristas) | Media | 4 |
| Listar trámites por política | Simple | 3 |
| Ver detalle de trámite (tareas) | Media | 4 |
| Mis trámites (CLIENT) | Simple | 3 |
| Mis tareas (OFFICER) | Media | 4 |
| Analytics por política | Compleja | 6 |
| Monitor en tiempo real (WebSocket) | Media | 4 |
| Historial de trazabilidad | Media | 4 |
| **Subtotal EQ** | | **35** |

**Archivos Lógicos Internos (ILF — Internal Logical Files):**
| Archivo | Complejidad | PF |
|---------|-------------|-----|
| Users | Simple | 7 |
| Policies (con PolicyNode, PolicyEdge, formTemplate) | Compleja | 15 |
| Cases (con Tasks embebidas) | Compleja | 15 |
| Departments | Simple | 7 |
| EventLog | Simple | 7 |
| FormSubmissions | Media | 10 |
| CaseDocuments | Media | 10 |
| **Subtotal ILF** | | **71** |

**Archivos de Interfaz Externa (EIF — External Interface Files):**
| Interfaz | Complejidad | PF |
|----------|-------------|-----|
| AI Service (NLP/NER) | Media | 7 |
| ML Service (TensorFlow) | Compleja | 10 |
| Firebase Cloud Messaging | Simple | 5 |
| **Subtotal EIF** | | **22** |

**Total Function Points sin ajuste: 218 FP**

**Factores de ajuste (VAF):**
| Factor | Grado (0-5) |
|--------|-------------|
| Procesamiento distribuido | 4 |
| Performance (tiempo real WebSocket) | 4 |
| Uso intensivo del sistema | 3 |
| Complejidad de procesamiento (IA/ML) | 5 |
| Reutilización de código | 3 |
| Facilidad de instalación (Docker) | 4 |
| Usabilidad (múltiples roles) | 4 |
| *Otros 7 factores* | 3 promedio |
**TDI (Total Degree of Influence) = 46**  
**VAF = 0.65 + (0.01 × 46) = 1.11**

**FP Ajustados = 218 × 1.11 = ~242 AFP**

> **Productividad:** 13.450 LOC / 242 AFP = **~55.5 LOC/AFP**  
> **Costo estimado (Bolivia, 2026):** 242 AFP × $150 USD/AFP = **~$36.300 USD**

---

### EMPRESA 2: Hospital Regional — Gestión de Procesos Clínicos
*Sistema adaptado para flujos de atención: admisión → diagnóstico → tratamiento → alta.*

> Configuración: misma plataforma, políticas más complejas (8-12 nodos por flujo), mayor carga concurrente, integración con HIS (sistema hospitalario).

**Diferencias respecto a Empresa 1:**

| Parámetro | Municipio | Hospital |
|-----------|-----------|---------|
| Políticas activas simultáneas | 2-5 | 15-20 |
| Trámites/día | ~50 | ~500 |
| Nodos promedio por política | 5 | 10 |
| Usuarios concurrentes | 20 | 150 |
| ILF adicionales | — | Paciente, Diagnóstico, Medicamento |
| EIF adicionales | — | Sistema HIS, Laboratorio |
| LOC adicionales estimadas | — | +2.500 LOC |

**Métricas Hospital:**
- **LOC total:** ~15.950
- **FP sin ajuste:** 218 + 45 (nuevas funciones) = ~263 FP
- **VAF ajustado:** 1.18 (mayor complejidad de procesamiento)
- **AFP total:** ~310 AFP
- **Costo estimado:** 310 × $150 = **~$46.500 USD**
- **Productividad:** 15.950 / 310 = **~51.5 LOC/AFP**

---

### EMPRESA 3: Empresa Privada de Logística — Gestión de Despachos
*Flujos: recepción → almacén → asignación de ruta → despacho → confirmación de entrega.*

> Configuración: integración con GPS tracking, módulo de firma digital, dashboard en tiempo real por zona geográfica.

**Diferencias respecto a Empresa 1:**

| Parámetro | Municipio | Logística |
|-----------|-----------|-----------|
| Trámites/día | ~50 | ~2.000 |
| Automatización de tareas | Manual | Semi-automática (triggers) |
| Integraciones externas | Firebase | Firebase + GPS API + ERP |
| Notificaciones | Push | Push + SMS + Email |
| ILF adicionales | — | Vehículo, Ruta, Cliente externo |
| EIF adicionales | — | GPS API, ERP SAP, Pasarela SMS |
| LOC adicionales estimadas | — | +3.800 LOC |

**Métricas Logística:**
- **LOC total:** ~17.250
- **FP sin ajuste:** 218 + 72 (nuevas funciones de alta complejidad) = ~290 FP
- **VAF ajustado:** 1.22 (mayor performance, más interfaces externas)
- **AFP total:** ~354 AFP
- **Costo estimado:** 354 × $150 = **~$53.100 USD**
- **Productividad:** 17.250 / 354 = **~48.7 LOC/AFP**

---

### Tabla Comparativa Final — 3 Empresas

| Empresa | LOC | FP Brutos | VAF | AFP | LOC/AFP | Costo est. |
|---------|-----|-----------|-----|-----|---------|-----------|
| Municipio La Paz | 13.450 | 218 | 1.11 | 242 | 55.5 | $36.300 |
| Hospital Regional | 15.950 | 263 | 1.18 | 310 | 51.5 | $46.500 |
| Logística | 17.250 | 290 | 1.22 | 354 | 48.7 | $53.100 |

> **Interpretación:** La productividad (LOC/AFP) decrece al aumentar la complejidad — el sistema logístico requiere más código por punto de función debido a las integraciones externas y requisitos de performance en tiempo real.

---

## Checklist Final — Primer Parcial

- [ ] EC2 funcionando: http://54.233.18.87:4200
- [ ] Login con las 4 credenciales demo funciona
- [ ] Diagrama de actividades visual (swim lanes + grafo) funciona
- [ ] Formulario dinámico con NLP dictado funciona
- [ ] Analytics muestra cuellos de botella
- [ ] ML dashboard muestra predicciones TensorFlow
- [ ] OFFICER ve tareas en "Mi Bandeja"
- [ ] CLIENT ve "Mis Trámites" (sin botones de gestión)
- [ ] ADMIN/DESIGNER tienen acceso completo
- [ ] Manual de Usuario actualizado con URL producción
- [ ] Carátula impresa (2 copias) con QR → http://54.233.18.87:4200
- [ ] Video tutorial grabado

---

---

# SEGUNDO PARCIAL — Análisis de Requerimientos (Ciclo 2)

> El segundo parcial es un **incremento** al primero. El primer ciclo (versión operativa) ya está desplegado. El ciclo 2 agrega 5 nuevas funcionalidades sin romper lo existente.

---

## REQ 1 — Sistema de Gestión Documental Simplificado

### Qué pide el docente:
- Repositorio de documentos generados a lo largo del trámite
- Formatos: Word, Excel, PDF, imágenes, videos, planos
- Asignación de privilegios por usuario/rol (subir, solo leer, modificar)
- Auditoría completa: quién vio, cuándo, quién modificó
- Edición colaborativa simultánea (varios usuarios en el mismo documento)

### Qué YA está implementado (del primer parcial):

| Funcionalidad | Archivo | Estado |
|---------------|---------|--------|
| Upload de documentos (multipart) | `DocumentController.java` → `POST /api/documents/upload` | ✅ Listo |
| Descarga con URL pre-firmada (S3 o local) | `GET /api/documents/{id}/download-url` | ✅ Listo |
| Historial de auditoría | `GET /api/documents/{id}/audit`, modelo `DocumentAudit` | ✅ Listo |
| Permisos por nodo (`documentPermission`) | `GET /api/documents/{caseId}/permissions/{nodeId}` | ✅ Listo |
| Borrado lógico | `DELETE /api/documents/{id}` | ✅ Listo |
| Vista documentos en detalle del trámite | `case-detail.component.ts` | ✅ Listo |

### Qué FALTA implementar (brecha del ciclo 2):

| Gap | Solución propuesta | Prioridad |
|-----|-------------------|-----------|
| Permisos por usuario (no solo por nodo) | Agregar `userPermissions: Map<userId, "VIEW" / "UPLOAD" / "EDIT" / "ADMIN">` al modelo `CaseDocument` | Alta |
| Edición colaborativa simultánea | Integrar **Google Docs embed** o WebSocket + CRDT para co-edición en tiempo real | Alta |
| Soporte de vista previa en navegador | Para PDF: `<iframe>`, para imágenes: `<img>`, para video: `<video>`, Word/Excel → convertir a PDF via LibreOffice headless | Media |
| Panel gestión de permisos en UI | Componente Angular donde ADMIN asigna quién puede qué por documento | Alta |

### Arquitectura sugerida para edición colaborativa:
```
Cliente A ──┐
            ├──► WebSocket (STOMP) ──► Servidor ──► MongoDB (versiones)
Cliente B ──┘                                    ──► EventBus → broadcast cambios
```
- Para documentos estructurados (texto): WebSocket + operational transform simple
- Para archivos binarios (PDF, imagen): solo control de bloqueo (quien lo edita queda bloqueado para otros)

---

## REQ 2 — Deep Learning (NLP y Procesamiento de Texto/Audio)

### Qué pide el docente:
- Uso especializado de Deep Learning (TensorFlow, PyTorch)
- NLP basado en DL para texto y audio
- Todo lo relacionado con métricas → Deep Learning

### Qué YA está implementado:

| Funcionalidad | Archivo | Tecnología |
|---------------|---------|-----------|
| Predicción riesgo demora | `ml-service/app/models/delay_risk.py` | TensorFlow Keras |
| Prioridad de tareas | `ml-service/app/models/priority_scorer.py` | TensorFlow Keras |
| Detección de anomalías | `ml-service/app/models/anomaly_detector.py` | TensorFlow Keras |
| NLP llenado de formulario | `ai-service` → `/nlp/fill-form` | spaCy / regex |
| Asignación automática de política | `ai-service` → `/nlp/assign-policy` | similitud semántica |

### Qué FALTA / qué mejorar:

| Gap | Solución |
|-----|---------|
| NLP usando DL (no solo reglas/regex) | Reemplazar extracción de entidades en `nlp_form_service.py` con **modelo BERT fine-tuned** (HuggingFace `transformers`) o **spaCy con modelo es_core_news_lg** | 
| Audio → texto en backend | Agregar **Whisper de OpenAI** (modelo pequeño local) para transcribir audio enviado como bytes al ai-service |
| Métricas de workflow con DL | El ml-service ya usa TF/Keras; mejorar con más features y reentrenamiento con datos reales |
| Confidence scores reales | El modelo actual devuelve heurísticas; reemplazar con probabilidades softmax del modelo DL |

### Whisper para audio en backend (Python):
```python
import whisper
model = whisper.load_model("small")  # ~250MB, preciso en español

@router.post("/transcribe")
async def transcribe(audio: UploadFile):
    audio_bytes = await audio.read()
    result = model.transcribe(audio_bytes, language="es")
    return {"text": result["text"]}
```

---

## REQ 3 — Agente Inteligente (reemplaza punto de atención humano)

### Qué pide el docente:
- No existe la persona en recepción → la reemplaza un **agente**
- El agente determina qué política de negocio asignar al cliente
- Interacción: voz → texto, o prompt directo
- La política tiene requisitos propios (obligatorios/opcionales) configurados por el DESIGNER
- El agente pide esos documentos/requisitos al cliente uno a uno
- Chatbot multi-turno ligado a las políticas

### Qué YA está implementado:

| Funcionalidad | Archivo | Estado |
|---------------|---------|--------|
| Endpoint `POST /nlp/assign-policy` | `nlp_router.py` | ✅ Listo |
| Página "Iniciar Trámite por Voz" | `nuevo-proceso.component.ts` | ✅ Parcial |
| Voz en frontend (Web Speech API) | Múltiples componentes | ✅ Listo |

### Qué FALTA:

#### A) Campo `requirements` en la política (DESIGNER lo configura):
```java
// En PolicyNode.java — agregar:
private List<PolicyRequirement> requirements; // documentos requeridos para iniciar

// Nuevo modelo:
public class PolicyRequirement {
    private String name;        // "Carnet de identidad"
    private boolean required;   // true = obligatorio
    private String description; // instrucción para el cliente
}
```

#### B) Agente conversacional multi-turno:
```
Flujo del agente:
1. Cliente describe su situación (voz o texto)
2. Agente → POST /nlp/assign-policy → identifica política
3. Agente muestra política identificada + explica
4. Agente lista requisitos de la política
5. Para cada requisito obligatorio → pide que suba el documento
6. Una vez cumplidos los requisitos → inicia el trámite (POST /api/cases)
```

#### C) Nuevo componente Angular `agent-intake.component.ts`:
- Chat UI (burbujas como WhatsApp)
- Cada turno: el agente "escribe", el cliente responde por voz o texto
- Barra de progreso de requisitos cumplidos
- Botón "Confirmar e iniciar trámite" al final

#### D) Endpoint backend para el agente:
```
POST /api/agent/chat
Body: { sessionId, message, policyId? }
Response: { reply, intent, nextAction, requirements? }
```

---

## REQ 4 — Motor Inteligente de Enrutamiento y Análisis de Riesgo

### Qué pide el docente:
- Predecir la mejor ruta para cada política
- Predecir riesgo de demoras y cuellos de botella
- Detectar anomalías con Deep Learning
- Identificar prioridad en asignación de recursos

### Qué YA está implementado:

| Funcionalidad | Estado |
|---------------|--------|
| Riesgo de demora (TensorFlow) | ✅ ml-service → `delay_risk.py` |
| Prioridad de tareas (TensorFlow) | ✅ ml-service → `priority_scorer.py` |
| Detección anomalías (TensorFlow) | ✅ ml-service → `anomaly_detector.py` |
| Dashboard ML en frontend | ✅ `dashboard.component.ts` panel Predicciones IA |
| Cuellos de botella en Analytics | ✅ `analytics.component.ts` + `AnalyticsService.java` |

### Este requerimiento está **prácticamente cubierto** con el primer parcial.

### Mejoras opcionales para el ciclo 2:
- **Mejor ruta:** cuando hay nodo DECISION, el ML sugiere qué rama tomar basándose en el perfil del trámite
- **Asignación automática:** el motor sugiere a qué oficial asignar la tarea según carga de trabajo
- **Alertas proactivas:** si un trámite lleva X horas sin avanzar → notificación push automática

---

## REQ 5 — Reportes Dinámicos por Lenguaje Natural

### Qué pide el docente:
- El jefe habla/escribe qué reporte quiere
- NLP extrae: campos (datos), criterios (WHERE), formato (Excel/Word/PDF/pantalla)
- La aplicación construye y descarga el reporte

### Qué YA está implementado:

| Funcionalidad | Archivo | Estado |
|---------------|---------|--------|
| Endpoint `POST /api/reports/query` | `ReportsController.java` | ✅ Listo |
| Parsing NLP vía ai-service | `/reports/parse` | ✅ Listo |
| 5 tipos de reporte (cases_by_date, by_policy, etc.) | `ReportsController.java` | ✅ Listo |
| UI de reportes con voz/texto | `reports.component.ts` | ✅ Listo |
| Fallback local si ai-service no responde | `localParseSpec()` | ✅ Listo |

### Qué FALTA — Exportación de formatos:

| Formato | Librería | Implementación |
|---------|---------|----------------|
| **Excel (.xlsx)** | Apache POI (`poi-ooxml`) en Spring | `GET /api/reports/export?format=xlsx&...` |
| **PDF** | iText 7 o JasperReports | `GET /api/reports/export?format=pdf&...` |
| **CSV** | Java nativo (`StringBuilder`) | `GET /api/reports/export?format=csv&...` |
| **Pantalla** | Ya existe (tabla HTML) | ✅ Ya funciona |

### Implementación rápida del export (Spring Boot):
```java
// ReportsController.java — agregar endpoint:
@GetMapping("/export")
public ResponseEntity<byte[]> export(
    @RequestParam String query,
    @RequestParam(defaultValue = "csv") String format) {
    
    Map<String, Object> report = executeFromQuery(query);
    List<Map<String, Object>> rows = (List) report.get("rows");
    
    return switch (format) {
        case "xlsx" -> buildExcel(rows, (String) report.get("title"));
        case "pdf"  -> buildPdf(rows, (String) report.get("title"));
        default     -> buildCsv(rows);
    };
}
```

### En el frontend — agregar botones de descarga en `reports.component.ts`:
```html
<button (click)="exportReport('xlsx')">📥 Excel</button>
<button (click)="exportReport('pdf')">📄 PDF</button>
<button (click)="exportReport('csv')">📋 CSV</button>
```

---

## Resumen — Estado del Proyecto para el Segundo Parcial

| Requerimiento | Implementado en P1 | Gap para P2 | Esfuerzo estimado |
|--------------|-------------------|-------------|------------------|
| 1. Gestión Documental | 70% | Permisos por usuario, edición colaborativa, preview | 2-3 días |
| 2. Deep Learning NLP | 60% | Reemplazar regex con modelos DL, Whisper audio | 2-3 días |
| 3. Agente Inteligente | 40% | Chat multi-turno, requisitos por política, intake UI | 3-4 días |
| 4. Motor Enrutamiento | 85% | Mejoras menores (sugerencia de ruta, auto-asignación) | 1 día |
| 5. Reportes Dinámicos | 80% | Exportar Excel/PDF/CSV | 1-2 días |

**Ventaja clave:** La arquitectura del primer parcial es escalable (microservicios Docker + MongoDB + WebSocket). Los 5 requerimientos del ciclo 2 son **incrementos** sobre código existente, no reescrituras.

---

## Plan de Implementación — Segundo Parcial

### Orden recomendado (de menor a mayor dependencia):

1. **Exportación de reportes** (1-2 días) — agregar Apache POI al pom.xml y 1 endpoint
2. **Permisos por usuario en documentos** (1 día) — campo nuevo en MongoDB, no rompe nada
3. **Preview de documentos** (1 día) — solo frontend Angular, sin cambios en backend
4. **Requisitos de política** (1 día) — nuevo campo en `PolicyNode`, UI en editor de política
5. **Agente conversacional** (3-4 días) — componente más complejo, nuevo endpoint `/agent/chat`
6. **Deep Learning mejorado** (2 días) — reemplazar `nlp_form_service.py` con spaCy `es_core_news_lg`
7. **Edición colaborativa** (2-3 días) — WebSocket channel por documento + bloqueo optimista

### Lo que NO hay que rehacer:
- Motor de workflow (Spring Boot) — intacto
- Editor de políticas visual — intacto  
- Formularios dinámicos — intacto
- Predicciones ML — intacto
- Analytics de cuellos — intacto
- Despliegue EC2 / Docker — intacto

---

## Checklist Segundo Parcial

### Requerimiento 1 — Documentos:
- [ ] Permisos por usuario en documentos (VIEW/UPLOAD/EDIT/ADMIN)
- [ ] Preview inline de PDF e imágenes en el navegador
- [ ] Panel de gestión de permisos en UI
- [ ] Edición colaborativa (al menos bloqueo de documento en edición)

### Requerimiento 2 — Deep Learning:
- [ ] NLP con modelo spaCy `es_core_news_lg` (o BERT) en lugar de regex
- [ ] Endpoint `/transcribe` con Whisper para audio en backend
- [ ] Confidence scores basados en probabilidades del modelo

### Requerimiento 3 — Agente Inteligente:
- [ ] Campo `requirements` en PolicyNode (configurado por DESIGNER)
- [ ] Endpoint `/api/agent/chat` multi-turno
- [ ] UI chatbot `agent-intake.component.ts` con voz + texto
- [ ] Flujo completo: descripción → política → requisitos → inicio de trámite

### Requerimiento 4 — Motor de Enrutamiento:
- [ ] Mejora en sugerencias de ruta (ya cubierto en 85%) 
- [ ] Alerta proactiva por trámite estancado (push notification automático)

### Requerimiento 5 — Reportes:
- [ ] Exportar a Excel (.xlsx) con Apache POI
- [ ] Exportar a PDF con iText o JasperReports
- [ ] Botones de descarga en UI de reportes
- [ ] Selector de formato en el prompt NLP ("...en Excel", "...en PDF")
