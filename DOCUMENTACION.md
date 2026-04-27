# Sistema de Gestión de Políticas de Negocio — WorkflowSW1

> **Materia:** Ingeniería de Software 1 — Primer Parcial S1-2025  
> **Autor:** Luis Fernando Angulo  
> **Repositorio:** [github.com/luisfernandoAngulo28/Examen1SW1](https://github.com/luisfernandoAngulo28/Examen1SW1)

---

## ÍNDICE

- [1. Perfil del Proyecto](#1-perfil-del-proyecto)
  - [1.1 Introducción](#11-introducción)
  - [1.2 Objetivo General](#12-objetivo-general)
  - [1.3 Objetivos Específicos](#13-objetivos-específicos)
  - [1.4 Descripción del Problema](#14-descripción-del-problema)
  - [1.5 Alcance](#15-alcance)
- [Parte I — Fundamentación Teórica](#parte-i--fundamentación-teórica)
  - [1. Ingeniería de Software Asistido por Computadora (CASE)](#1-ingeniería-de-software-asistido-por-computadora-case)
  - [2. Desarrollo de Software Basado en Componentes](#2-desarrollo-de-software-basado-en-componentes)
  - [3. Ingeniería Humana (Experiencia del Usuario — UX)](#3-ingeniería-humana-experiencia-del-usuario--ux)
  - [4. Inteligencia Artificial Aplicada en el Desarrollo del Software](#4-inteligencia-artificial-aplicada-en-el-desarrollo-del-software)
  - [5. IA Integrada en el IDE (Entorno de Desarrollo)](#5-ia-integrada-en-el-ide-entorno-de-desarrollo)
  - [6. El Proceso de Desarrollo de Software (PUDS)](#6-el-proceso-de-desarrollo-de-software-puds)
  - [7. UML](#7-uml)
- [Parte II — Desarrollo del Proyecto](#parte-ii--desarrollo-del-proyecto)
  - [Arquitectura del Sistema](#arquitectura-del-sistema)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Modelo de Datos](#modelo-de-datos)
  - [Módulos del Backend](#módulos-del-backend)
  - [Páginas del Frontend](#páginas-del-frontend)
  - [Despliegue y CI/CD](#despliegue-y-cicd)
  - [Pruebas Automatizadas](#pruebas-automatizadas)
- [Parte III — Aplicación Móvil (Flutter)](#parte-iii--aplicación-móvil-flutter)
  - [Descripción General](#descripción-general)
  - [Arquitectura de la App Móvil](#arquitectura-de-la-app-móvil)
  - [Stack Tecnológico Móvil](#stack-tecnológico-móvil)
  - [Pantallas y Flujos](#pantallas-y-flujos)
  - [Notificaciones Push FCM](#notificaciones-push-fcm)
  - [Integración con el Backend](#integración-con-el-backend)

---

## 1. PERFIL DEL PROYECTO

### 1.1 Introducción

El presente proyecto propone el desarrollo de un sistema de gestión de políticas de negocio (workflow) mediante el uso de diagramas de actividad UML organizados en calles (swimlanes), con un enfoque orientado a la automatización de trámites y procesos organizacionales. La iniciativa surge de la necesidad de contar con herramientas que no solo permitan modelar de manera visual y estructurada los flujos de una empresa, sino que también automaticen el enrutamiento de las tareas y faciliten el monitoreo en tiempo real. 

El sistema contempla un entorno de diseño visual donde los administradores pueden crear los flujos de trabajo, transformando estos diagramas en procesos ejecutables gestionados por un motor de workflow. De esta forma, se garantiza que cada tarea sea asignada al departamento correspondiente de manera automática, reduciendo tiempos de espera y minimizando errores humanos en la transición entre etapas. 

Adicionalmente, el proyecto integra características innovadoras como el diseño colaborativo en tiempo real, permitiendo a múltiples usuarios trabajar sobre la misma política de negocio. A ello se suma la incorporación de funcionalidades impulsadas por Inteligencia Artificial (IA), como la interacción mediante comandos de voz para la creación de flujos, el llenado automático de formularios (voz y OCR) para los funcionarios, y un módulo analítico capaz de detectar automáticamente cuellos de botella en la atención al cliente, ofreciendo una herramienta altamente eficiente e intuitiva.

El proyecto se desarrolló aplicando la metodología **PUDS (Proceso Unificado de Desarrollo de Software)**, utilizando herramientas CASE modernas y principios de ingeniería humana centrados en la experiencia del usuario.

### 1.2 Objetivos

#### 1.2.1 Objetivo General
Desarrollar un software web que integre el diseño visual de políticas de negocio, la ejecución automatizada de flujos de trabajo (workflow) y el monitoreo de trámites en un entorno colaborativo, asistido por Inteligencia Artificial y aplicando la metodología PUDS.

#### 1.2.2 Objetivos Específicos
• Diseñar e implementar un módulo de diseño visual colaborativo que permita crear y editar diagramas de actividad UML (organizados en calles) en tiempo real, incorporando asistencia de IA mediante comandos de texto y voz.
• Desarrollar un motor de workflow capaz de instanciar trámites a partir de los diagramas diseñados, automatizando el flujo secuencial, condicional, iterativo y paralelo entre los distintos departamentos.
• Incorporar formularios dinámicos para los funcionarios, que faciliten la carga de información mediante métodos manuales, dictado por voz (Web Speech API) y reconocimiento óptico de caracteres (OCR mediante Tesseract.js).
• Implementar un sistema de monitoreo mediante WebSocket que se actualice en tiempo real, indicando visualmente (mediante semáforos) el estado y prioridad de las actividades pendientes.
• Integrar un módulo analítico basado en Inteligencia Artificial que detecte cuellos de botella en el flujo de atención al cliente y sugiera optimizaciones en las políticas de negocio.
• Garantizar la coherencia entre el diseño de los diagramas UML y la ejecución del backend (Spring Boot), asegurando la trazabilidad de cada evento en una bitácora auditable.

### 1.3 Descripción del problema

En la actualidad, instituciones públicas y privadas que gestionan múltiples procesos de atención al cliente (como solicitudes de servicios, instalaciones de medidores o aperturas de crédito) enfrentan serios problemas de ineficiencia y falta de control. El enrutamiento de un trámite entre distintos departamentos suele realizarse de manera manual o a través de sistemas desarticulados, lo que genera estancamientos, pérdida de documentos y tiempos de espera prolongados para el usuario final.

Por otra parte, cuando el cliente requiere conocer el estado de su trámite, los funcionarios de atención al cliente carecen de una herramienta centralizada que les permita visualizar rápidamente en qué etapa y en qué departamento se encuentra la solicitud, generando insatisfacción y desinformación.

Asimismo, el diseño e implementación de nuevos flujos de trabajo dentro de la empresa suele ser un proceso rígido que requiere intervención directa de programadores. No existen suficientes herramientas accesibles que permitan a los administradores diseñar sus propias políticas de negocio de manera visual y colaborativa, y mucho menos que las conviertan inmediatamente en procesos ejecutables.

Finalmente, la falta de analítica en tiempo real impide a los gerentes identificar qué funcionario o qué departamento está demorando más de lo previsto (cuellos de botella), dificultando la toma de decisiones para optimizar el rendimiento de la organización.

### 1.4 Alcance

#### 1.4.1 Módulo de Gestión de Usuarios y Departamentos
• Permite la autenticación y registro de usuarios en el sistema mediante JWT, diferenciando entre roles (DESIGNER, OFFICER y CLIENT).
• Facilita la creación y administración (CRUD) de los distintos departamentos de la organización, a los cuales se les asignarán las actividades en los diagramas (calles/swimlanes).

#### 1.4.2 Módulo de Gestión y Diseño de Políticas (Diagramación)
• Proporciona un lienzo de trabajo interactivo (ngx-graph) para la creación de diagramas de actividad UML organizados en calles (swimlanes), definiendo tareas, responsables y flujos (secuenciales, condicionales, paralelos e iterativos).
• Ofrece colaboración en tiempo real, permitiendo a múltiples diseñadores trabajar simultáneamente sobre el mismo diagrama.
• Incorpora asistencia de IA, permitiendo al usuario crear nodos y conexiones mediante comandos de voz o texto simples (prompts).

#### 1.4.3 Módulo de Ejecución de Workflow y Formularios
• Cuenta con un motor de ejecución que toma la política de negocio diseñada y gestiona el enrutamiento automático de los trámites hacia las bandejas de los funcionarios correspondientes.
• Proporciona una bandeja de entrada en tiempo real para el funcionario, organizada mediante indicadores visuales (semáforo) para mostrar tareas nuevas, en proceso o urgentes.
• Permite al funcionario completar su tarea mediante formularios dinámicos, que soportan ingreso manual, dictado por voz y extracción de texto de imágenes (OCR).

#### 1.4.4 Módulo de Monitoreo y Analítica (IA)
• Rastrea el avance general del trámite, permitiendo a los asesores informar al cliente sobre la etapa exacta de su solicitud (o recibir notificaciones push en móvil).
• Implementa un sistema de análisis con Inteligencia Artificial que evalúa los tiempos de atención y detecta automáticamente cuellos de botella en el flujo, generando reportes y recomendaciones para la optimización del proceso.

**Limitaciones:**
- El sistema no implementa notificaciones por correo electrónico.
- La IA para detección de cuellos de botella se basa en reglas heurísticas y umbrales.
- El OCR está limitado a imágenes con texto claro en español e inglés.
- Las notificaciones push requieren configurar un proyecto Firebase y el `google-services.json` en la app móvil.

---

## 2. Parte I

### 2.1 Fundamentación Teórica 

#### 2.1.1 Ingeniería de Software Asistida por Computadora – CASE 
**2.1.1.1 Introducción**
La Ingeniería de Software Asistida por Computadora, conocida como CASE (Computer-Aided Software Engineering), se refiere al uso de herramientas tecnológicas destinadas a apoyar y automatizar las diferentes fases del ciclo de vida del software. Su propósito principal es aumentar la productividad de los equipos de desarrollo, reducir los errores y asegurar la calidad de los productos generados, proporcionando un marco estandarizado y eficiente para la gestión de proyectos de software. 

**2.1.1.2 Conceptos Fundamentales**
El funcionamiento de CASE se basa en la integración de herramientas que facilitan actividades críticas dentro del desarrollo de software. Entre los conceptos fundamentales que lo caracterizan se encuentran: 
• Automatización de tareas repetitivas, como la generación de diagramas, documentación y prototipos. 
• Uso de un repositorio central, que almacena los diferentes artefactos del proyecto (requisitos, diagramas, documentos, informes) y garantiza que los equipos trabajen sobre una fuente de información unificada. 
• Cobertura del ciclo de vida del software, ya que las herramientas CASE se aplican desde las fases de análisis y diseño hasta la implementación, pruebas y mantenimiento. 

**2.1.1.3 Clasificación de Herramientas CASE**
Las herramientas CASE se clasifican en función de la etapa del ciclo de vida del software en la que son utilizadas: 
• Herramientas Upper CASE: Análisis y diseño (ej. diagramas UML de actividad en WorkflowSW1). 
• Herramientas Lower CASE: Implementación, pruebas (ej. VS Code, JUnit 5). 
• Herramientas Integrated CASE (I-CASE): Ciclo completo (ej. GitHub Actions). 

#### 2.1.2 Ingeniería de Software basada en componentes 
**2.1.2.1 Introducción**
La ingeniería de software basada en componentes es un enfoque que busca la construcción de sistemas a partir de la integración de piezas de software reutilizables denominadas componentes. Este paradigma surge como respuesta a la necesidad de reducir la complejidad y los costos de desarrollo, promoviendo la modularidad y la reutilización en lugar de la creación de código desde cero. 

**2.1.2.2 Concepto de Componente**
Un componente de software se define como una unidad independiente que encapsula una funcionalidad específica y que interactúa con otros componentes mediante interfaces claramente establecidas. Esta independencia permite que los componentes sean utilizados en distintos sistemas sin necesidad de modificar su estructura interna, garantizando portabilidad e interoperabilidad. 

**2.1.2.3 Principios Fundamentales**
La ingeniería de software basada en componentes se apoya en diversos principios esenciales para su aplicación: 
• Reutilización de módulos existentes para disminuir tiempos de desarrollo. 
• Modularidad para dividir el sistema en partes manejables. 
• Encapsulamiento que asegura independencia y ocultamiento de la lógica interna. 
• Interoperabilidad entre distintos entornos y plataformas. 
• Evolutividad que permite sustituir o actualizar componentes sin alterar el resto del sistema. 

**2.1.2.4 Aplicaciones y Tecnologías**
La ingeniería de software basada en componentes se ha materializado en diferentes tecnologías y marcos de trabajo, entre los que destacan arquitecturas basadas en Spring (módulos inyectables) y más recientemente las arquitecturas de microservicios. Estas tecnologías representan la evolución del paradigma hacia soluciones más flexibles y distribuidas. 

#### 2.1.3 Desarrollo de Software basado en componentes 
**2.1.3.1 Introducción**
El desarrollo de software basado en componentes es un enfoque práctico que aplica los principios de la ingeniería de software orientada a componentes en la construcción de sistemas. Su propósito es ensamblar aplicaciones a partir de unidades reutilizables, reduciendo el esfuerzo de programación desde cero y garantizando mayor calidad en los productos generados. 

**2.1.3.2 Características del Desarrollo Basado en Componentes**
El proceso se caracteriza por los siguientes aspectos: 
• Selección de componentes existentes en repositorios (ej. librerías de Angular). 
• Adaptación de componentes para que encajen con los requisitos específicos del sistema. 
• Ensamblaje de componentes en una arquitectura unificada que permita la comunicación e interoperabilidad. 
• Creación de componentes nuevos únicamente cuando no existan soluciones previas reutilizables. 

**2.1.3.3 Fases del Desarrollo**
Este enfoque incorpora fases particulares que complementan las etapas tradicionales del ciclo de vida del software: 
• Análisis y especificación de requisitos, identificando qué componentes pueden satisfacerlos. 
• Búsqueda y evaluación de componentes disponibles en repositorios o marcos de trabajo. 
• Adaptación e integración de componentes en la arquitectura del sistema. 
• Pruebas de integración, orientadas a verificar la interoperabilidad y el correcto funcionamiento conjunto de los módulos. 

#### 2.1.4 Arquitectura de Software 
**2.1.4.1 Introducción**
La arquitectura de software se entiende como la estructura fundamental de un sistema, compuesta por sus componentes, sus relaciones y los principios y guías que orientan su diseño y evolución. Se trata de un nivel de abstracción superior al diseño detallado, que busca ofrecer una visión global del sistema antes de entrar en la implementación. 

**2.1.4.2 Conceptos Fundamentales**
La arquitectura de software se apoya en tres conceptos esenciales: 
• Componentes, que representan las unidades funcionales encargadas de encapsular partes del sistema. 
• Conectores, que constituyen los mecanismos de interacción entre los componentes (ej. REST API, WebSockets). 
• Atributos de Calidad (Requisitos No Funcionales): Las propiedades del sistema que definen su rendimiento. Incluyen la escalabilidad, seguridad, disponibilidad, mantenibilidad y usabilidad. 
• Reglas de Diseño: Las restricciones y principios que guían la toma de decisiones arquitectónicas.

**2.1.4.3 Importancia de una arquitectura robusta**
Una arquitectura de software bien definida es crucial por las siguientes razones: 
• Gestión de la Complejidad: Descompone un sistema complejo en partes más manejables.
• Guía para el Desarrollo: Proporciona un marco de trabajo y una visión clara.
• Toma de Decisiones Estratégicas: Permite tomar decisiones de diseño cruciales en las primeras etapas.
• Mantenibilidad y Escalabilidad: Reduce el costo de los cambios.
• Comunicación con las Partes Interesadas: Facilita la comunicación entre el equipo técnico y las partes interesadas.

**2.1.4.4 Tipos comunes de Arquitectura**
Existen diferentes estilos y patrones que se utilizan en la arquitectura de software: 
• Cliente-servidor, donde el servidor provee servicios y el cliente los consume. 
• Arquitectura orientada a servicios (SOA). 
• Microservicios, evolución de SOA que divide el sistema en servicios pequeños (ej. el backend en Spring y el microservicio de IA en FastAPI). 
• Event-driven (basada en eventos), para notificaciones asíncronas. 
• Arquitectura en Capas: El sistema se divide en capas (presentación, lógica de negocio y datos), separando responsabilidades y mejorando mantenibilidad. 

#### 2.1.5 Modelo conceptual de una Base de datos 
**2.1.5.1 Introducción**
El modelo conceptual de una base de datos constituye una representación abstracta y de alto nivel de la información que será gestionada por un sistema. Su objetivo es describir cuáles son las entidades relevantes del dominio, cómo se relacionan entre sí y qué restricciones deben cumplirse. 

**2.1.5.2 Componentes del Modelo Conceptual**
El modelo conceptual incluye los siguientes elementos: 
• Clases o Entidades, que representan los objetos de interés del dominio (ej. Políticas, Trámites, Tareas). 
• Relaciones, que indican los vínculos existentes entre las entidades (ej. referencias a ObjectIds en bases documentales). 
• Multiplicidad, que establece las restricciones de cardinalidad. 
• Restricciones, que definen condiciones adicionales que deben cumplirse. 

**2.1.5.3 Importancia del Modelo Conceptual**
El modelo conceptual cumple funciones esenciales: 
• Permite capturar los requisitos de información de manera estructurada. 
• Garantiza la coherencia y consistencia de los datos. 
• Facilita la transición hacia el modelo físico. 

#### 2.1.6 Construcción del backend mediante Spring Boot y Spring Data
**2.1.6.1 Spring Boot**
Es un framework basado en Java que simplifica el desarrollo de aplicaciones mediante una configuración mínima y una amplia integración con librerías de la plataforma Spring. Proporciona un conjunto de herramientas para construir aplicaciones listas para producción, destacando por su inyección de dependencias y capacidad para exponer servicios web a través de controladores REST. 

**2.1.6.2 Mapeo Objeto-Documento (ODM)**
Dado el uso de bases de datos NoSQL como MongoDB, se emplea un ODM en lugar de un ORM. Esto permite mapear los objetos del dominio de la aplicación directamente con colecciones y documentos BSON, eliminando la necesidad de esquemas rígidos e instrucciones SQL.

**2.1.6.3 Spring Data MongoDB**
Spring Data MongoDB proporciona el motor de persistencia que traduce operaciones sobre objetos Java en consultas nativas para MongoDB. Facilita la implementación de operaciones CRUD y la gestión de relaciones complejas (documentos embebidos o referenciados). 

**2.1.6.4 Proceso de construcción del backend con Spring Data**
Spring Boot sigue un proceso estructurado: 
• Definición de entidades: se crean clases Java anotadas con `@Document` que representan las colecciones, con atributos correspondientes a los campos. 
• Configuración de repositorios: se implementan interfaces que extienden de `MongoRepository` para operaciones CRUD automáticas. 
• Implementación de servicios: se construyen clases que encapsulan la lógica del motor de workflow. 
• Exposición de controladores REST: se crean controladores anotados con `@RestController` que definen los endpoints de la API. 

#### 2.1.7 Inteligencia Artificial aplicada a la ingeniería de software 
**2.1.7.1 Introducción**
La inteligencia artificial permite automatizar tareas complejas, optimizar procesos de desarrollo y mejorar la calidad de los productos generados. La combinación de técnicas de IA con metodologías de software permite construir sistemas más inteligentes y eficientes. 

**2.1.7.2 Aplicaciones en la Ingeniería de Software y en WorkflowSW1**
• En la asistencia y diseño: mediante algoritmos (prompts) que ayudan al administrador a dibujar el diagrama de actividades de la política de negocio. 
• En el procesamiento de lenguaje natural y visión: con herramientas de OCR (Tesseract) y dictado por voz para acelerar el llenado de formularios. 
• En el análisis: mediante módulos analíticos que detectan cuellos de botella y anomalías en los tiempos de atención de los flujos. 

#### 2.1.8 UML 
**2.1.8.1 Introducción**
El Lenguaje Unificado de Modelado (UML) es un estándar utilizado en la ingeniería de software para representar de forma visual la estructura y el comportamiento de los sistemas. 

**2.1.8.2 Diagrama de Actividades**
El corazón de WorkflowSW1 es el diagrama de actividad UML, implementado como un editor visual interactivo para diseñar los flujos de trabajo. Los elementos soportados son:
• **Nodo Inicial** (`INITIAL`) y **Nodo Final** (`FINAL`)
• **Acción** (`ACTION`): Rectángulo redondeado que representa una tarea.
• **Decisión** (`DECISION`): Rombo con condiciones lógicas para bifurcar el flujo.
• **Bifurcación (Fork)** y **Unión (Join)**: Para flujos en paralelo.
• **Calles (Swimlanes)**: Carril vertical que representa al departamento responsable.

**2.1.8.3 Diagrama de Clases (Modelo de Datos del Proyecto)**
```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │  Department  │     │   Policy     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ email        │◄────│ name         │     │ name         │
│ name         │     │ users[]      │────►│ status       │
│ role         │     │ nodes[]      │     │ createdBy    │
│ departmentId │     └──────────────┘     │ nodes[]      │
│ tasks[]      │                          │ edges[]      │
└──────────────┘                          │ cases[]      │
                                          └──────┬───────┘
                                                 │
                    ┌────────────────────────────┼────────────────────┐
                    ▼                            ▼                    ▼
           ┌──────────────┐            ┌──────────────┐     ┌──────────────┐
           │  PolicyNode  │            │  PolicyEdge  │     │    Case      │
           ├──────────────┤            ├──────────────┤     ├──────────────┤
           │ id           │            │ id           │     │ id           │
           │ nodeType     │◄───────────│ fromNodeId   │     │ status       │
           │ title        │◄───────────│ toNodeId     │     │ currentNodeId│
           │ posX, posY   │            │ flowType     │     │ tasks[]      │
           │ departmentId │            │ conditionLabel│    │ eventLogs[]  │
           │ formTemplate │            └──────────────┘     └──────┬───────┘
           └──────────────┘                                        │
                    │                                              ▼
                    │                                     ┌──────────────┐
                    │                                     │    Task      │
                    │                                     ├──────────────┤
                    └────────────────────────────────────►│ id           │
                                                          │ nodeId       │
                                                          │ status       │
                                                          │ assignedUser │
                                                          │ formSubmission│
                                                          └──────┬───────┘
                                                                 │
                                          ┌──────────────────────┼──────────────┐
                                          ▼                                     ▼
                                 ┌────────────────┐                   ┌──────────────┐
                                 │ FormSubmission  │                   │  EventLog    │
                                 ├────────────────┤                   ├──────────────┤
                                 │ payloadJson    │                   │ type         │
                                 │ inputMode      │                   │ payloadJson  │
                                 └────────────────┘                   │ createdAt    │
                                                                      └──────────────┘
```

#### 2.1.9 PUDS 
**2.1.9.1 Introducción**
El Proceso Unificado de Desarrollo de Software, conocido como PUDS, es una metodología iterativa e incremental que organiza el ciclo de vida del software en fases claramente definidas. Su propósito es reducir la complejidad de los proyectos, mejorar la calidad del producto final y garantizar que el sistema desarrollado cumpla con los requisitos del cliente. 

**2.1.9.2 Fases del Proceso Unificado en WorkflowSW1**
• **Inicio (Inception):** Definición del problema de gestión manual de políticas de negocio y evaluación de riesgos. 
• **Elaboración (Elaboration):** Diseño de la arquitectura cliente-servidor (Spring Boot + Angular + MongoDB) y definición de los modelos de datos. 
• **Construcción (Construction):** Desarrollo iterativo del editor visual, motor de workflow, analítica e IA. 
• **Transición (Transition):** Documentación técnica, despliegue con Docker y CI/CD. 

**2.1.9.3 Diagrama de Casos de Uso del Proyecto**
- **Actor Diseñador de Procesos (DESIGNER):** Crear políticas, diseñar diagramas UML interactivos, asignar tareas, y analizar métricas/IA.
- **Actor Funcionario (OFFICER):** Visualizar bandeja de tareas, completarlas mediante voz u OCR y tomar decisiones condicionales.

### 2.2 Herramientas Utilizadas 

#### 2.2.1 Frontend 
**2.2.1.1 Angular 18 – TypeScript**
Angular es un framework construido y mantenido por Google que proporciona funcionalidades avanzadas para aplicaciones de una sola página (SPA). Al combinarlo con TypeScript, se obtiene un entorno de desarrollo con tipado estático que facilita la detección de errores y mejora la mantenibilidad del código. Esto lo convierte en una herramienta sólida para proyectos que requieren escalabilidad y componentes reutilizables (como los formularios dinámicos y la bandeja de tareas).

**2.2.1.2 ngx-graph**
Es una librería especializada en Angular para la construcción de interfaces gráficas interactivas basadas en grafos. Permite crear diagramas y flujos de trabajo con nodos personalizables y conexiones dinámicas. Su integración con Angular es directa y eficiente, lo que la hace especialmente útil para implementar editores visuales complejos como el de diagramas de actividad UML del proyecto.

**2.2.1.3 Por qué usarlo**
La elección de Angular responde a la necesidad de contar con un framework estructurado de grado corporativo que ofrezca un conjunto amplio de herramientas integradas (como HttpClient y animaciones). `ngx-graph` se selecciona porque ofrece todas las facilidades para la creación de un lienzo interactivo con funcionalidades drag-and-drop listas para usar.

#### 2.2.2 Backend 
**2.2.2.1 Spring Boot – Java – Spring Data MongoDB**
Java ## 3. Parte II — Proceso de Desarrollo

### 3.1 Flujo de Trabajo: Captura de requisitos 

#### 3.1.1 Identificar Actores y casos de uso 
  
**Actores:** 
• Diseñador de Procesos
• Funcionario 
 
**A1. Diseñador de Procesos** 
Actor responsable de la creación y administración de políticas de negocio, con la capacidad de gestionar la información general, los diagramas de actividad y los departamentos asociados. 

**A2. Funcionario** 
Actor que participa en la ejecución del contenido de las políticas, con énfasis en la resolución de tareas asignadas dentro de su bandeja de entrada. 

#### 3.1.2 Casos de uso 
**CU01 Gestionar Inicio de Sesión:** Permite a los usuarios acceder al sistema mediante credenciales registradas, garantizando autenticación y seguridad. 
**CU02 Gestionar Cierre de Sesión:** Facilita que los usuarios finalicen su sesión en el sistema de manera segura, liberando recursos y protegiendo la información. 
**CU03 Gestionar Perfil de Usuario:** Permite al usuario visualizar y modificar su información personal básica asociada a su cuenta. 
**CU04 Gestionar Políticas de Negocio:** Incorpora las funciones de creación, edición, actualización y eliminación de políticas (workflows) dentro del sistema. 
**CU05 Gestionar Departamentos y Usuarios:** Permite al diseñador administrar los departamentos de la institución y asignar usuarios (funcionarios) a los mismos con sus respectivos roles. 
**CU06 Gestionar Búsqueda de Trámites:** Proporciona un mecanismo para localizar casos activos o finalizados dentro del sistema con fines de consulta. 
**CU07 Gestionar Reportes de Desempeño:** Genera reportes reflejando las métricas actuales de los diagramas y el desempeño de los trámites. 
**CU08 Gestionar Motor de Workflow:** Permite iniciar un trámite a partir de una política, enrutando automáticamente las tareas a los funcionarios correspondientes según el flujo definido. 
**CU09 Gestionar Diagrama de Actividad:** Permite crear, modificar y eliminar nodos (acciones, decisiones, bifurcaciones) y aristas dentro del lienzo interactivo. 
**CU10 Gestionar Bandeja en Tiempo Real:** Ofrece soporte a la actualización en tiempo real, permitiendo que los funcionarios vean al instante sus nuevas tareas asignadas mediante WebSockets. 
**CU11 Gestionar Llenado de Formularios mediante Comando de Voz:** Permite completar formularios dinámicos a través de instrucciones dadas por voz utilizando la Web Speech API. 
**CU12 Gestionar Extracción de Texto mediante OCR:** Facilita el llenado automático de formularios extrayendo texto a partir de imágenes o documentos escaneados usando IA. 
**CU13 Gestionar Análisis de Cuellos de Botella mediante IA:** Evalúa los tiempos de atención por nodo usando Inteligencia Artificial, identificando bloqueos en el flujo y generando recomendaciones. 
**CU14 Gestionar Toma de Decisiones Condicionales:** Permite al funcionario seleccionar un camino condicional dentro del flujo de trabajo cuando se encuentra en un nodo de tipo DECISIÓN. 
**CU15 Gestionar Trazabilidad Completa del Trámite:** Registra una bitácora inmutable (EventLogs) de todas las acciones y tiempos de cada etapa para fines de auditoría. 

#### 3.1.3 Priorización de casos de uso 

| ID | Caso de uso | Prioridad | Actores | Ciclo |
|----|-------------|-----------|---------|-------|
| CU01 | Gestionar Inicio de Sesión | Alta | A1, A2 | C1 |
| CU02 | Gestionar Cierre de Sesión | Alta | A1, A2 | C1 |
| CU03 | Gestionar Perfil de Usuario | Baja | A1, A2 | C2 |
| CU04 | Gestionar Políticas de Negocio | Media | A1 | C1 |
| CU05 | Gestionar Departamentos y Usuarios | Media | A1 | C1 |
| CU06 | Gestionar Búsqueda de Trámites | Media | A1, A2 | C1 |
| CU07 | Gestionar Reportes de Desempeño | Baja | A1 | C2 |
| CU08 | Gestionar Motor de Workflow | Alta | A1, A2 | C2 |
| CU09 | Gestionar Diagrama de Actividad | Alta | A1 | C2 |
| CU10 | Gestionar Bandeja en Tiempo Real | Alta | A1, A2 | C2 |
| CU11 | Gestionar Llenado de Formularios mediante Voz | Alta | A2 | C3 |
| CU12 | Gestionar Extracción de Texto mediante OCR | Alta | A2 | C3 |
| CU13 | Gestionar Análisis de Cuellos de Botella mediante IA | Alta | A1 | C3 |
| CU14 | Gestionar Toma de Decisiones Condicionales | Alta | A2 | C3 |
| CU15 | Gestionar Trazabilidad Completa del Trámite | Medio | A1, A2 | C3 |

**Ciclo #1** 

| ID | Caso de uso | Prioridad | Actores | Ciclo |
|----|-------------|-----------|---------|-------|
| CU01 | Gestionar Inicio de Sesión | Alta | A1, A2 | C1 |
| CU02 | Gestionar Cierre de Sesión | Alta | A1, A2 | C1 |
| CU04 | Gestionar Políticas de Negocio | Media | A1 | C1 |
| CU05 | Gestionar Departamentos y Usuarios | Media | A1 | C1 |
| CU06 | Gestionar Búsqueda de Trámites | Media | A1, A2 | C1 |

**Ciclo #2** 

| ID | Caso de uso | Prioridad | Actores | Ciclo |
|----|-------------|-----------|---------|-------|
| CU03 | Gestionar Perfil de Usuario | Baja | A1, A2 | C2 |
| CU07 | Gestionar Reportes de Desempeño | Baja | A1 | C2 |
| CU08 | Gestionar Motor de Workflow | Alta | A1, A2 | C2 |
| CU09 | Gestionar Diagrama de Actividad | Alta | A1 | C2 |
| CU10 | Gestionar Bandeja en Tiempo Real | Alta | A1, A2 | C2 |

**Ciclo #3** 

| ID | Caso de uso | Prioridad | Actores | Ciclo |
|----|-------------|-----------|---------|-------|
| CU11 | Gestionar Llenado de Formularios mediante Voz | Alta | A2 | C3 |
| CU12 | Gestionar Extracción de Texto mediante OCR | Alta | A2 | C3 |
| CU13 | Gestionar Análisis de Cuellos de Botella mediante IA | Alta | A1 | C3 |
| CU14 | Gestionar Toma de Decisiones Condicionales | Alta | A2 | C3 |
| CU15 | Gestionar Trazabilidad Completa del Trámite | Medio | A1, A2 | C3 |

#### 3.1.4 Detallar Casos de Uso 

**3.1.4.1 CU01 Gestionar Inicio de Sesión** 

| Caso de Uso | CU01 Gestionar Inicio de sesión |
|---|---|
| **Propósito** | Permitir a los usuarios acceder al sistema mediante sus credenciales registradas, garantizando autenticación y seguridad en la sesión. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Diseñador, Funcionario |
| **Precondición** | • El Usuario debe tener una cuenta registrada.<br>• El sistema debe estar en funcionamiento.<br>• El usuario debe tener una conexión a internet. |
| **Flujo Principal** | • El Usuario accede a la página de inicio de sesión.<br>• El sistema solicita las credenciales.<br>• El usuario ingresa sus credenciales.<br>• El sistema valida las credenciales contra la base de datos.<br>• Si son correctas, genera un token JWT e inicia sesión.<br>• El sistema habilita opciones según los permisos. |
| **Flujo Alterno** | Si las credenciales son incorrectas, muestra error. |
| **Postcondición** | • El usuario está autenticado y redirigido.<br>• Se almacena la sesión. |

**3.1.4.2 CU02 Gestionar Cierre de Sesión** 

| Caso de Uso | CU02 Gestionar Cierre de sesión |
|---|---|
| **Propósito** | Permitir finalizar la sesión de manera segura, liberando recursos. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Diseñador, Funcionario |
| **Precondición** | El usuario debe estar logeado. |
| **Flujo Principal** | • El usuario selecciona cerrar sesión en la interfaz.<br>• El sistema procesa el cierre invalidando el token.<br>• Redirige a la página de inicio o login.<br>• Libera recursos asociados a la sesión. |
| **Flujo Alterno** | N/A |
| **Postcondición** | El usuario es redirigido a login. |

**3.1.4.3 CU03 Gestionar Perfil de Usuario** 

| Caso de Uso | CU03 Gestionar Perfil de Usuario |
|---|---|
| **Propósito** | Visualizar y modificar información personal básica. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Diseñador, Funcionario |
| **Precondición** | El usuario debe estar logeado. |
| **Flujo Principal** | • El usuario accede a "Perfil de Usuario".<br>• El sistema muestra detalles (nombre, correo, rol, departamento).<br>• El usuario realiza modificaciones.<br>• El sistema valida y actualiza en la base de datos. |
| **Flujo Alterno** | Si los datos son inválidos, muestra error. |
| **Postcondición** | Cambios guardados con mensaje de éxito. |

**3.1.4.4 CU04 Gestionar Políticas de Negocio** 

| Caso de Uso | CU04 Gestionar Políticas de Negocio |
|---|---|
| **Propósito** | Crear, editar, actualizar y eliminar políticas de negocio. |
| **Actores** | Diseñador |
| **Iniciador** | Diseñador |
| **Precondición** | Usuario logeado como Diseñador. |
| **Flujo Principal** | • El usuario selecciona crear política.<br>• Ingresa nombre y descripción.<br>• El sistema valida los datos.<br>• Guarda la política en la base de datos. |
| **Flujo Alterno** | Si hay campos faltantes, impide guardar. |
| **Postcondición** | Nueva política guardada y mostrada en listado. |

**3.1.4.5 CU05 Gestionar Departamentos y Usuarios** 

| Caso de Uso | CU05 Gestionar Departamentos y Usuarios |
|---|---|
| **Propósito** | Administrar estructura organizacional (departamentos y funcionarios). |
| **Actores** | Diseñador |
| **Iniciador** | Diseñador |
| **Precondición** | Usuario logeado como Diseñador. |
| **Flujo Principal** | • Accede al módulo de administración.<br>• Selecciona agregar departamento o usuario.<br>• Confirma creación o asignación.<br>• Sistema actualiza estructura. |
| **Flujo Alterno** | N/A |
| **Postcondición** | Departamento o usuario creado exitosamente. |

**3.1.4.6 CU06 Gestionar Búsqueda de Trámites** 

| Caso de Uso | CU06 Gestionar Búsqueda de Trámites |
|---|---|
| **Propósito** | Localizar trámites activos o finalizados. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Diseñador, Funcionario |
| **Precondición** | Estar autenticado. |
| **Flujo Principal** | • Accede a búsqueda.<br>• Ingresa ID de trámite o estado.<br>• Sistema devuelve coincidencias.<br>• Usuario selecciona el trámite. |
| **Flujo Alterno** | Si no hay resultados, muestra mensaje vacío. |
| **Postcondición** | Usuario visualiza trazabilidad del trámite. |

**3.1.4.7 CU07 Gestionar Reportes de Desempeño** 

| Caso de Uso | CU07 Gestionar Reportes de Desempeño |
|---|---|
| **Propósito** | Generar reportes estadísticos de trámites en formato PDF o imagen. |
| **Actores** | Diseñador |
| **Iniciador** | Diseñador |
| **Precondición** | Trámites registrados en el sistema. |
| **Flujo Principal** | • Accede al Dashboard Analítico.<br>• Sistema carga gráficos.<br>• Selecciona generar reporte.<br>• Sistema exporta PDF o imagen. |
| **Flujo Alterno** | N/A |
| **Postcondición** | Reporte descargado. |

**3.1.4.8 CU08 Gestionar Motor de Workflow** 

| Caso de Uso | CU08 Gestionar Motor de Workflow |
|---|---|
| **Propósito** | Iniciar trámite a partir de política y auto-asignar tareas. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Diseñador |
| **Precondición** | Diagrama de actividad activado y validado. |
| **Flujo Principal** | • Selecciona iniciar trámite.<br>• Motor crea el Case.<br>• Recorre desde Nodo Inicial a primera Acción.<br>• Asigna tarea al departamento correspondiente.<br>• Si hay FORK, divide el flujo en tareas paralelas. |
| **Flujo Alterno** | Si hay error en diagrama, el motor bloquea el inicio. |
| **Postcondición** | Trámite en curso y tareas en bandejas. |

**3.1.4.9 CU09 Gestionar Diagrama de Actividad** 

| Caso de Uso | CU09 Gestionar Diagrama de Actividad |
|---|---|
| **Propósito** | Crear y modificar nodos en el lienzo interactivo. |
| **Actores** | Diseñador |
| **Iniciador** | Diseñador |
| **Precondición** | Editor de política abierto. |
| **Flujo Principal** | • Modifica nodos (acción, decisión, aristas).<br>• Confirma guardar.<br>• Sistema guarda diagrama (transacción MongoDB).<br>• Muestra mensaje de éxito. |
| **Flujo Alterno** | Si la política tiene casos activos, bloquea edición. |
| **Postcondición** | Diagrama guardado. |

**3.1.4.10 CU10 Gestionar Bandeja en Tiempo Real** 

| Caso de Uso | CU10 Gestionar Bandeja en Tiempo Real |
|---|---|
| **Propósito** | Actualizar bandeja de funcionarios vía WebSocket. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Sistema / Funcionario |
| **Precondición** | Conexión STOMP abierta. |
| **Flujo Principal** | • Tarea es asignada a Funcionario.<br>• Backend emite evento WS.<br>• Bandeja recibe evento instantáneo.<br>• Tarea nueva aparece resaltada. |
| **Flujo Alterno** | Si WS cae, fallback a polling HTTP. |
| **Postcondición** | Bandeja sincronizada en tiempo real. |

**3.1.4.11 CU11 Gestionar Llenado de Formularios mediante Voz** 

| Caso de Uso | CU11 Gestionar Llenado de Formularios mediante Voz |
|---|---|
| **Propósito** | Completar campos dictando texto (Web Speech API). |
| **Actores** | Funcionario |
| **Iniciador** | Funcionario |
| **Precondición** | Micrófono activado. Tarea asignada. |
| **Flujo Principal** | • Funcionario abre formulario.<br>• Selecciona micrófono en campo de texto.<br>• Dicta la información.<br>• Sistema transcribe e inyecta texto. |
| **Flujo Alterno** | Si falla reconocimiento, digita manualmente. |
| **Postcondición** | Formulario llenado por voz. |

**3.1.4.12 CU12 Gestionar Extracción de Texto mediante OCR** 

| Caso de Uso | CU12 Gestionar Extracción de Texto mediante OCR |
|---|---|
| **Propósito** | Llenado automático desde imágenes escaneadas. |
| **Actores** | Funcionario |
| **Iniciador** | Funcionario |
| **Precondición** | Tarea con soporte de carga de imagen. |
| **Flujo Principal** | • Selecciona imagen.<br>• Clic en "Escanear OCR".<br>• Sistema usa Tesseract.js para extraer texto e inyectarlo. |
| **Flujo Alterno** | Si imagen es borrosa, advierte baja calidad. |
| **Postcondición** | Datos inyectados al formulario. |

**3.1.4.13 CU13 Gestionar Análisis de Cuellos de Botella mediante IA** 

| Caso de Uso | CU13 Gestionar Análisis de Cuellos de Botella mediante IA |
|---|---|
| **Propósito** | Identificar nodos sobrecargados o lentos. |
| **Actores** | Diseñador |
| **Iniciador** | Sistema / Diseñador |
| **Precondición** | Trámites registrados con tiempos históricos. |
| **Flujo Principal** | • FastAPI evalúa tiempos de atención.<br>• Identifica excesos según umbrales.<br>• Genera alertas (Insights) sobre el cuello de botella.<br>• Diseñador visualiza recomendaciones. |
| **Flujo Alterno** | N/A |
| **Postcondición** | Recomendación visible en Dashboard. |

**3.1.4.14 CU14 Gestionar Toma de Decisiones Condicionales** 

| Caso de Uso | CU14 Gestionar Toma de Decisiones Condicionales |
|---|---|
| **Propósito** | Permitir avanzar el flujo por una rama específica tras una evaluación. |
| **Actores** | Funcionario |
| **Iniciador** | Funcionario |
| **Precondición** | Tarea asignada sobre nodo DECISIÓN. |
| **Flujo Principal** | • Funcionario abre tarea.<br>• Selecciona un camino (ej. Aprobado/Rechazado).<br>• Motor avanza solo por la rama seleccionada. |
| **Flujo Alterno** | N/A |
| **Postcondición** | Flujo bifurcado correctamente. |

**3.1.4.15 CU15 Gestionar Trazabilidad Completa del Trámite** 

| Caso de Uso | CU15 Gestionar Trazabilidad Completa del Trámite |
|---|---|
| **Propósito** | Mantener bitácora inmutable de eventos. |
| **Actores** | Diseñador, Funcionario |
| **Iniciador** | Sistema |
| **Precondición** | Trámite activo. |
| **Flujo Principal** | • Cada acción (iniciar tarea, completar formulario) dispara registro de EventLog.<br>• Guarda actor, tiempo y datos asociados.<br>• Sistema muestra línea de tiempo de sólo lectura. |
| **Flujo Alterno** | N/A |
| **Postcondición** | Trazabilidad asegurada. |

#### 3.1.5 Estructura de Modelo de Casos de uso EMCU 
**Ciclo de vida #1** 
![Diagrama EMCU Ciclo 1](/diagramas/emcu-ciclo1.png)

**Ciclo #2** 
![Diagrama EMCU Ciclo 2](/diagramas/emcu-ciclo2.png)

**Ciclo #3** 
![Diagrama EMCU Ciclo 3](/diagramas/emcu-ciclo3.png)


---

### 3.2 Flujo de Trabajo: Análisis

#### 3.2.1 Análisis de Arquitectura

##### 3.2.1.1 Identificar Paquetes
- Paquete de Usuario
- Paquete de Proyectos
- Paquete de Diagramas

##### 3.2.1.2 Relacionar Paquete y Casos de uso
- **Paquete de Gestión de Usuario**
- **Paquete de Gestión de proyectos**
- **Modulo de Gestión de Diagramas**

##### 3.2.1.3 Vista de Casos de uso
*(Imágenes o descripciones de vista de casos de uso)*

#### 3.2.2 Analizar Casos de uso ”Diagrama de Comunicación”

**Ciclo #1: CU04 Gestionar Proyectos**  
**Descripción CU04 Gestionar Proyectos:**  
Este caso de uso permite al usuario (Creador o Editor) realizar el ciclo completo de gestión de proyectos. Incluye registrar, actualizar, consultar y eliminar proyectos. Al crear un proyecto, automáticamente se genera un lienzo vacío con nodos y aristas disponibles para su posterior edición. El sistema valida la existencia del proyecto y responde con las operaciones correspondientes, garantizando el manejo básico de CRUD sobre los proyectos y su lienzo asociado.

**Ciclo #2:**  
**CU09 Gestionar Diagrama de clases**  
**Descripción CU09 Gestionar Diagrama de clases:**  
Este caso de uso permite al usuario manipular el diagrama de clases asociado a un proyecto. El usuario puede crear, modificar, mover o relacionar clases dentro del lienzo. Mediante la opción de guardar, el sistema persiste el estado actual del diagrama, de modo que al iniciar una nueva sesión se recupera el mismo tal como fue guardado previamente. Asimismo, el sistema brinda la funcionalidad de obtener el diagrama existente para continuar su edición y garantizar la persistencia de los cambios realizados.

**CU08 Gestionar Generación de Backend Spring Boot**  
**Descripción CU08 Gestionar Generación de Backend Spring Boot:**  
Este caso de uso permite al usuario generar automáticamente la estructura de un backend en Spring Boot a partir del proyecto y su diagrama. Al presionar la opción “Generar Backend”, el sistema ejecuta la lógica necesaria para crear el código base utilizando plantillas predefinidas, empaquetando el resultado en un archivo comprimido (ZIP) que contiene el backend con los métodos CRUD y listo para ser utilizado.

**Ciclo #3: CU11 Gestionar Acción de Creación de Objetos mediante comando de voz y chat**  
**Descripción de CU11 Gestionar Acción de Creación de Objetos mediante comando de voz y chat:**  
Este caso de uso permite al usuario crear objetos en el diagrama utilizando comandos de voz o texto. A través de un prompt o una orden de voz, el sistema interpreta la instrucción y genera automáticamente nuevos elementos, como clases completas o clases con relaciones asociadas, siempre orientadas al proceso de creación. De esta manera, se facilita la construcción del modelo sin necesidad de manipulación manual directa, optimizando la productividad del usuario.

**CU15: Gestionar Generación de Sistema completo**  
**Descripción de CU15 Gestionar Generación de Sistema completo:**  
Este caso de uso permite al usuario ordenar mediante comandos de voz o texto la generación automática de un sistema completo. A partir del prompt ingresado y del proyecto asociado, el sistema interpreta la instrucción y produce la estructura integral del sistema, integrando los diferentes componentes necesarios. De esta manera, se facilita la creación de soluciones completas sin necesidad de construir cada elemento de forma manual.

#### 3.2.3 Análisis de Clases

**Ciclo #1: CU04 Gestionar Proyectos**
*(Diagrama o análisis de clases)*

**Ciclo #2: CU09 Gestionar Diagrama de clases**
*(Diagrama o análisis de clases)*

**CU08 Gestionar Generación de Backend Spring Boot**
*(Diagrama o análisis de clases)*

**Ciclo #3: CU11 Gestionar Acción de Creación de Objetos mediante comando de voz y chat**
*(Diagrama o análisis de clases)*

**CU15: Gestionar Generación de Sistema completo**
*(Diagrama o análisis de clases)*

#### 3.2.4 Análisis de Paquete
*(Diagrama o análisis de paquetes)*

---

### 3.3 Flujo de Trabajo: Diseño

#### 3.3.1 Diseño de arquitectura

##### 3.3.1.1 Diseño Físico - Diagrama de Despliegue
*(Diagrama de despliegue)*

##### 3.3.1.2 Diseño Lógico – Diagrama Organizado en capas
*(Diagrama de capas)*

#### 3.3.2 Diagramas de Secuencia

- **Ciclo #1: CU04 Gestionar Proyectos**
- **Ciclo #2: CU09 Gestionar Diagrama de clases**
- **CU08 Gestionar Generación de Backend Spring Boot**
- **Ciclo #3: CU11 Gestionar Acción de Creación de Objetos mediante comando de voz y chat**
- **CU15: Gestionar Generación de Sistema completo**

#### 3.3.3 Diseño de Datos

##### 3.3.3.1 Diseño Lógico
*(Diagrama lógico)*

##### 3.3.3.2 Mapeo

**Usuario**
| pk | | | | |
|---|---|---|---|---|
| id | email | username | password | profile_icon |

**Lienzo**
| pk | | fk |
|---|---|---|
| id | diagrama | proyecto_id |

**Proyecto**
| pk | | |
|---|---|---|
| id | nombre | descripcion |

**Integrante**
| pk | | fk | fk |
|---|---|---|---|
| id | rol | proyecto_id | usuario_id |

##### 3.3.3.3 Diseño Físico

**Tabla de Volumen Usuario: USUARIO**
| Atributo | Llave | Tipo de Dato | Amplitud | Nulo | Descripción |
|---|---|---|---|---|---|
| id | PK | Int | – | NO | Identificador único del usuario |
| username | Unique | VarChar | 50 | NO | Nombre de usuario (único) |
| email | Unique | String | – | NO | Correo electrónico del usuario (único) |
| password | | String | – | NO | Contraseña cifrada del usuario |
| profile_icon | | String | – | SÍ | Ruta o URL del ícono de perfil |

**Proyecto: PROYECTO**
| Atributo | Llave | Tipo de Dato | Amplitud | Nulo | Descripción |
|---|---|---|---|---|---|
| id | PK | UUID (String) | – | NO | Identificador único del proyecto |
| nombre | | String | – | NO | Nombre del proyecto |
| descripcion | | String | – | SÍ | Descripción breve del proyecto |

**Integrante: INTEGRANTE**
| Atributo | Llave | Tipo de Dato | Amplitud | Nulo | Descripción |
|---|---|---|---|---|---|
| id | PK | Int | – | NO | Identificador único del integrante |
| rol | | String | – | NO | Rol del integrante en el proyecto |
| proyecto_id | FK | UUID (String) | – | NO | Referencia al proyecto (proyectos.id) |
| usuario_id | FK | Int | – | NO | Referencia al usuario (usuarios.id) |

**Lienzo: LIENZO**
| Atributo | Llave | Tipo de Dato | Amplitud | Nulo | Descripción |
|---|---|---|---|---|---|
| id | PK | Int | – | NO | Identificador único del lienzo |
| diagrama | | JSON | – | NO | Representación del diagrama (nodos y aristas) |
| proyecto_id | FK, Unique | UUID (String) | – | NO | Referencia única al proyecto (proyectos.id) |

##### 3.3.3.4 Script
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_icon TEXT, 
    is_deleted BOOLEAN DEFAULT FALSE 
); 

CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL, 
    descripcion TEXT,     
    is_deleted BOOLEAN DEFAULT FALSE 
); 

CREATE TABLE integrantes (
    id SERIAL PRIMARY KEY,
    rol TEXT NOT NULL,
    proyecto_id UUID NOT NULL,
    usuario_id INT NOT NULL, 
    CONSTRAINT fk_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE, 
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE 
); 

CREATE TABLE lienzos (
    id SERIAL PRIMARY KEY,
    diagrama JSON NOT NULL,
    proyecto_id UUID UNIQUE NOT NULL, 
    CONSTRAINT fk_proyecto_lienzo FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE 
);
```

---

### 3.4 Flujo de Trabajo: Implementación

#### 3.4.1 Implementación de la arquitectura de sistema
*(Diagrama o detalles de implementación)*

#### 3.4.2 Implementación de la arquitectura de subsistema
- **Subsistema de Gestion de Usuario**
  #COMPLETAR 
- **Subsistema de Gestion de Proyectos**
  #COMPLETAR
- **Subsistema de Gestion de Diagramas**
  #COMPLETAR

---

### 3.5 Flujo de Trabajo: Pruebas

**PF-1: Gestionar Inicio de sesión**
- **Condición:** 
  - El Usuario debe tener una cuenta registrada en el sistema. 
  - El sistema debe estar en funcionamiento y accesible a través de una interfaz web o móvil. 
  - El usuario debe tener una conexión a internet activa. 
- **Proceso:** 
  - El usuario accede a la página de inicio de sesión. 
  - El sistema solicita las credenciales (usuario o email y contraseña). 
  - El usuario ingresa sus credenciales. 
  - El sistema valida las credenciales ingresadas contra la base de datos. 
  - Si las credenciales son correctas, el sistema inicia sesión y redirige al usuario a la página principal del sistema. 

**PF-2: Gestionar Cierre de Sesión**
- **Condición:** El usuario debe estar logeado o haber realizado el inicio de sesión previamente. 
- **Proceso:** 
  - El usuario selecciona la opción de cerrar sesión en la interfaz. 
  - El sistema procesa el cierre de sesión. 
  - El sistema finaliza la sesión del usuario y lo redirige a la página de inicio o de login. 
  - El sistema libera los recursos asociados a la sesión y protege la información del usuario. 

#COMPLETAR 

#### 3.5.1 Tablero JIRA
*(Enlace o imagen del tablero JIRA)*

---

### 3.6 Conclusiones
- El desarrollo del sistema permitió integrar en un solo entorno la gestión de proyectos, la manipulación de diagramas de clases y la generación automática de componentes de software, logrando un flujo de trabajo más eficiente y organizado. 
- La arquitectura definida, basada en un frontend desplegado en Vercel y un backend en Render con base de datos PostgreSQL, garantiza una separación clara de responsabilidades y escalabilidad futura. 
- La utilización de casos de uso detallados y diagramas de secuencia facilitó la comprensión de los procesos principales, permitiendo una comunicación clara entre los actores del sistema y los módulos involucrados. 
- La persistencia de diagramas y la capacidad de generar sistemas completos a partir de instrucciones de voz o texto muestran la aplicabilidad de la inteligencia artificial en la automatización del ciclo de vida del software. 
- El diseño de la base de datos mediante Prisma y su traducción a SQL proporcionaron una estructura consistente y normalizada, que facilita la mantenibilidad y asegura la integridad referencial entre entidades. 

### 3.7 Recomendaciones
- Ampliar las pruebas unitarias e integrales para cubrir los escenarios de error en los casos de uso más complejos, como la generación de backend y de sistemas completos. 
- Implementar mecanismos de control de versiones en los diagramas persistidos, de manera que los usuarios puedan consultar y restaurar estados anteriores. 
- Considerar la incorporación de seguridad adicional en el manejo de credenciales y datos sensibles, aplicando cifrado robusto y autenticación multifactor. 
- Extender la funcionalidad del sistema para permitir la edición colaborativa en tiempo real de diagramas, lo que incrementaría el valor en entornos de trabajo multiusuario. 
- Evaluar la posibilidad de integrar un sistema de reportes más avanzado, que permita obtener métricas sobre proyectos, diagramas y generación de código, aportando información útil para la toma de decisiones. 

### 3.8 Bibliografía
- https://www.postman.com/  
- https://visualstudio.microsoft.com/es/  
- https://www.mysql.com/products/workbench/  
- https://www.jetbrains.com/es-es/idea/features/ 
- https://tailwindcss.com/  
- https://getbootstrap.com/  
- https://www.typescriptlang.org/docs/ 
- https://www.typescriptlang.org/docs/handbook/react.html 
- https://react-typescript-cheatsheet.netlify.app/ 
- https://es.react.dev/ 
- https://docs.python.org/3/ 
- https://flask.palletsprojects.com/ 
- https://flask.palletsprojects.com/en/latest/quickstart/ 
- https://www.sqlalchemy.org/ 
- https://www.postgresql.org/docs/ 
- https://clasesiupsm.wordpress.com/wp-content/uploads/2014/10/metodologc3ada-orientada-aobjetos-omt-james-rumbaugh.pdf 
- https://darjelingsilva.wordpress.com/wp-content/uploads/2018/05/4-metd-omt.pdf 
- https://fastapi.tiangolo.com 
- https://docs.spring.io/spring-boot/index.html 
- https://expressjs.com/es 
- https://www.prisma.io/docs/orm 
- https://nextjs.org/docs 

### 3.9 ANEXOS

#### Arquitectura FASTApi 
La arquitectura utilizada en este proyecto realizado en Python FastAPI sigue un patrón por capas que organiza el código en diferentes directorios según su responsabilidad.  
- En la carpeta `routes` se definen los endpoints HTTP que serán expuestos a los clientes.  
- Los controladores ubicados en `controllers` son los encargados de coordinar la ejecución de cada caso de uso, recibiendo las solicitudes validadas y gestionando la lógica necesaria.  
- En `services` se concentra la lógica de negocio y la comunicación con los servicios de inteligencia artificial, incluyendo whisper.cpp para el procesamiento de audio.  
- Los modelos en `models` cumplen la función de validar y estructurar los datos de entrada y salida, generalmente mediante Pydantic o dtos.  
- La carpeta `config` contiene la configuración del sistema, cargando variables de entorno y parámetros. En `errors` se centraliza el manejo de excepciones para asegurar respuestas uniformes.  
- La carpeta `utils` guarda funciones auxiliares de uso general y `tmp` se emplea para almacenamiento temporal de archivos como audios o transcripciones.  
- El archivo `main.py` es el punto de entrada de la aplicación donde se inicializa FastAPI y se registran rutas y middlewares.  
- Los archivos `Dockerfile` y `docker-compose.yml` permiten la contenedorización y despliegue del proyecto, mientras que `requirements.txt` lista las dependencias de Python necesarias. 

Respecto al uso de `snake_case`, se sigue la convención de Python. Esto implica que los nombres de archivos, módulos, funciones y variables se escriben en minúsculas separadas por guiones bajos, como por ejemplo `generate_text`, `transcribe_audio`, `audio_path` o `user_id`. Los campos de los modelos y las estructuras JSON también se mantienen en `snake_case` para asegurar consistencia entre el backend y los datos que se exponen. En el caso de las variables de entorno, se utiliza mayúscula con snake_case, como `OPENAI_API_KEY` o `WHISPER_MODEL_PATH`. 

El objetivo principal de este backend es servir como puente entre las aplicaciones cliente, ya sean móviles o web, y los servicios de inteligencia artificial. Se encarga de ofrecer endpoints para generación de texto, embeddings, clasificación, resumen y transcripción de audio, permitiendo que la comunicación con modelos de lenguaje y procesamiento de voz se realice de manera controlada y estandarizada. 

#### Arquitectura NodeJs 
La arquitectura de este backend hecho en Node.js sigue un enfoque basado en Domain Driven Design (DDD), donde el código se organiza en capas y módulos que representan tanto la lógica del dominio como los elementos de infraestructura y presentación. 
- La carpeta `domain` contiene los elementos centrales de la lógica de negocio, incluyendo entidades, reglas de dominio, objetos de valor y los dto que se encargan de definir la forma de los datos que entran y salen del dominio. En `errors` se definen las excepciones específicas que permiten manejar los flujos de error de forma controlada. 
- La carpeta `infraestructura` implementa las dependencias externas necesarias para que el dominio funcione. En `config` se definen las configuraciones globales del sistema, en `middlewares` se ubican las funciones de Express o frameworks equivalentes que interceptan peticiones para validaciones, logs o seguridad, y en `socket` se maneja la lógica relacionada con comunicación en tiempo real. 
- La capa `presentation` contiene los controladores y módulos responsables de recibir las solicitudes de los clientes, validarlas y transformarlas en comandos o queries que el dominio pueda procesar. Aquí se encuentran submódulos como `auth` para autenticación, `usuario` para gestión de usuarios, `proyecto`, `integrante` o incluso integración con `springboot`. También se incluye `router.ts` que agrupa y expone todas las rutas HTTP de la aplicación. 
- La carpeta `shared` contiene utilidades y elementos transversales que pueden ser reutilizados en varias capas. En `enums` se definen constantes tipadas, en `utils` se implementan funciones genéricas, mientras que archivos como `authUtils.ts`, `JWTUtils.ts`, `FechaUtils.ts` o `pagination.ts` encapsulan lógicas comunes relacionadas con seguridad, fechas o paginación. 
- La carpeta `types` centraliza definiciones de tipos o interfaces TypeScript, lo que aporta robustez y consistencia al tipado en toda la aplicación. 
- Este diseño modular basado en DDD permite mantener el dominio independiente de los detalles de infraestructura, facilitando que la lógica de negocio no se mezcle con las tecnologías externas como bases de datos, frameworks o protocolos de comunicación. La separación en capas ayuda a la escalabilidad, testeo y mantenimiento, manteniendo el backend preparado para evolucionar con nuevas funcionalidades o integraciones sin romper la estructura principal. 

En cuanto a la convención de nombres, se emplea `camelCase` para métodos, funciones y variables, mientras que `snake_case` se utiliza en algunos atributos de las interfaces y estructuras de datos que se comunican con la base de datos o con servicios externos. Esto permite mantener consistencia interna en el código y, al mismo tiempo, adaptarse a los estándares de interoperabilidad en los datos expuestos. 

#### Arquitectura Frontend 
La arquitectura de este proyecto desarrollado en Next.js con React se organiza en capas y módulos claramente diferenciados para cubrir tanto la parte visual como la lógica de comunicación con servicios externos. 
- En la carpeta `app` y `components` se encuentran los componentes de interfaz de usuario que construyen las diferentes vistas, incluyendo elementos reutilizables. 
- La carpeta `Auth` agrupa toda la lógica relacionada con la autenticación, incluyendo `guard` para protección de rutas, `layout` para estructuras visuales específicas, `pages` para vistas concretas y `shared` para utilidades comunes. 
- Los módulos `Home`, `Proyect` y `UML` representan secciones o funcionalidades principales de la aplicación, cada uno con sus propios componentes y controladores. 
- La carpeta `ui` centraliza estilos, componentes gráficos y elementos de diseño reutilizables. 
- En `hooks` se definen funciones personalizadas de React que encapsulan lógica de estado y efectos reutilizables en la aplicación. 
- La carpeta `lib` contiene librerías y funciones de apoyo generales, mientras que `middleware` agrupa funciones que interceptan peticiones para validación, autenticación o control de acceso. 
- La carpeta `services` concentra la lógica de comunicación con APIs y servicios externos. Aquí se encuentran submódulos como `Auth` para autenticación, `Config` para parámetros globales, `Diagrama` y `UML` para la lógica de diagramación, `FastAPI` para integración directa con el backend en Python, y `Proyectos` para gestión de entidades del sistema. 
- En `shared` se guardan funciones y utilidades transversales, en `tmp` datos temporales, y en `Usuarios` la lógica vinculada a la gestión de usuarios. 

En cuanto a la convención de nombres, se utiliza `camelCase` para variables, funciones y métodos en el código de React y TypeScript, mientras que `snake_case` se emplea en las interfaces de datos, atributos provenientes del backend y en la comunicación con la base de datos. Esto asegura consistencia en el código del frontend, al mismo tiempo que mantiene interoperabilidad con la API en Python FastAPI que también utiliza `snake_case`.
