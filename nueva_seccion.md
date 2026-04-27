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
