Contexto:
- Politicas de negocios; existenten empresas como cotas, tigo donde un suuario puede solicitar paquetes de servicios


Etapa inicial -> intalacion, atencion al cliente moviliza el  tramite, solicita requisitos, depende como sean las politicas para la instalacion lo deriva a una distinta area


Deriva a otras areas

Area 1 -> Area 2  -> Area n -> .....
			\ -> Area n -> .......


Cliente llama para hacer el tramite, saber odnde o como va yendo el tramite.

herramienta que se utilizara para resolver este problema... "Bot de ayuda" para llevar seguimiento del tramite

Cada usuario tiene una vista o panel donde se veran las actividades ya hechas, tambien que estime el tiempo que va a tardar el proceso


( ) Dep A  -> ( ) Dep. B -> ( ) Dep C -> Dep. D

el sistema debe soportar varias politicas de negocios

El flujo puede er **lineal** o **alternativo** ( que debe cumplir ciertos requisitos para pasar a otro lado ) e **iterativa** y en **paralelo**, Las politicas deben pensar que cumplas estas 4.

Tiene el estilo de un diagrama de UML que es..... Diagrama de actividades organizado en calles


! Herramienta para diseñar politicas de negocios !

escanea el diagrama y le crea

3 aspectos:
- Actividades o tareas
- Respondables ( personas o departamentos )
- Flujo (secuencial, iterativo, alternativo, paralelo )

--- 

- Cargar los departamentos
- Cargar sus actividades



- Se valorara la facilidad de uso



Adminsitrador: 

- Crear politicas de negocio
	- Diseñar ( Diagrama de actividades organizado en calles)


--- 
Novedades:
- Diesñar colaborativo el diagrama de actividades con interaccion con IA, por tecto o voz o imagen
- Contruir formulario de cada funcionario para que llene de datos, informe textual o voz o de forma manual 
- Encontrar con IA cuellos de botellas en atencion al cliente 



Fecha de presentacion 28 de abril


---

Apuntes de la clase de hoy:

Aquí tienes la transcripción estructurada del audio para que puedas comprender mejor los conceptos explicados en la clase. Para facilitar tu estudio, he organizado la información en los temas clave y la tarea del examen que dicta el profesor.

Tema Principal: Sistemas de Workflow y Políticas de Negocio
El profesor inicia explicando la necesidad de crear aplicaciones que manejen "políticas de negocio" o flujos de trabajo (workflows) en empresas grandes, mencionando ejemplos como trámites en CRE (solicitud de medidor), Tigo o Cotas.

Explica que cuando un usuario inicia un trámite, el empleado de atención al cliente recopila los requisitos y el sistema debe enrutar automáticamente esa solicitud a los siguientes departamentos (ej. área técnica, área legal) según la política de la empresa.

Estructuras de Control del Flujo
Para modelar estos flujos, el profesor repasa las estructuras clásicas de control de la programación que se deben aplicar:

Secuencial: Un paso detrás de otro.

Alternativa: Bifurcaciones o condicionales (si ocurre algo, va a un lado; si no, a otro).

Iterativa: Procesos que se repiten.

En paralelo: Tareas que se ejecutan simultáneamente en distintos departamentos.

Modelado con UML
El profesor hace la pregunta a la clase sobre qué diagrama de UML es el adecuado para modelar estas políticas de negocio.

Tras la participación de la clase, confirma que es el Diagrama de Actividades.

Específicamente, recalca que debe ser el Diagrama de Actividades organizado en calles (swimlanes), ya que este permite definir claramente qué departamento o actor es responsable de cada actividad en el proceso.

Arquitectura del Sistema
El profesor detalla que el sistema a desarrollar debe tener componentes específicos para distintos usuarios:

Para el Diseñador/Administrador: Una herramienta visual (similar a Enterprise Architect) donde pueda arrastrar, soltar y conectar nodos para diseñar la política de negocio sin necesidad de programar.

Para el Funcionario (Usuario Final): Un monitor o "bandeja de entrada" donde le lleguen las tareas que debe atender. El profesor sugiere usar colores visuales (verde para nuevas, amarillo para las que están en proceso, rojo para las urgentes o atrasadas).

Para el Sistema (Motor de Workflow): El código que funciona por detrás, leyendo el diseño creado por el administrador y encargándose de mover el trámite de un funcionario a otro de forma automática.

El Examen (La Tarea Asignada)
El profesor indica que toda la arquitectura explicada es "clásica" y que el desafío del primer parcial es proponer una innovación.

Pide a los estudiantes que saquen una hoja, anoten su nombre, fecha, título y número de registro.

La instrucción es: Describir de manera clara una innovación que mejore esta arquitectura clásica de workflow, resolviendo algún problema de cuello de botella, tiempo de atención o eficiencia que el modelo base no contempla.

En la última parte del audio, el profesor evalúa en tiempo real las ideas de algunos estudiantes (mencionando nombres como Ángel, Daniel, María, Luis), pidiéndoles que expliquen su innovación y calificándolos con A, B o C dependiendo de la originalidad y viabilidad de su propuesta.


---

Notas de mi compañero:

SW1 Primer examen parcial



aspectos generales



politicas de negocio para la cuales existen como empresa cotas donde 
un usuario realiza tramites como en la CRE,donde un usuario puede hacer distintos tramites
cuando queres instalar un medidor 



tiene pasos o secuencia para instalar un medidor



te van a pedir unos requisitos



luego de eso te van a derivar a un departamento

puede ser cualquiera tendrias que investigarlo

&#x20;luego de eso van a un area legal

y de hay otra area hasta terminar el proceso o tramite para inscribir un medidor



cuando el cliente llama



el atencion del cliente



el tipo de atencion a cliente no tiene unos requisitos o tipos de tramites que se realizan para CRE

entonces que harias para que el asesor pueda darle una buena informacion



workflow



buscar que es un workflow



entonces que solucion podes darle



sistema debe enrutar a la politica de negocio

cada usuario debe tener un monitor

tendra una especie de panel

actividades atendidas , politicas , procesos , requerimientos



el sistema debe identificar cuello de botella

cuanto dura un tramite



cuantas politicas de negocio tiene , no tenemos informacion de que es lo que hace cada area o departamento



considerar estos 4 posibles requerimientos



puede ser Tambien la combinacion de estos 4 politicas de negocio



puede ser lineal o secuencial .-

puede ser condicional .- cuando pasa dos departamentos y ahora necesita una condicion para llevarlo un departamento



puede ser iterativo .-

puede ser paralelo .-



debe tener un motor o un workflow

diagrama de actividad organizados en calles



le voy a entregar al usuario una herramienta donde pueda hacer politicas de negocio

es como usar un diagrama de calles



actividades

tareas

responsables de las



disenador de politicas de negocio

en algunas parte se debe cargar los departamentos, las actividades, y en cada parte haremos esa asociacion



cuando se loguee

le va aparecer todas las actividades que le compete

distribuilo por colores

se valora la facilidad de uso



todas resaltadas para atender

estoy atendiendo



**para el asesor**

entra a su monitor solo para validar, subir imagenes , luego el doc pasa al siguiente paso o departamento , segun la politica de negocio lo va mandar a su debido departamento



luego el administrador

el hara la edición del diagrama de actividades , el hara el flujo a seguir , las políticas

imagina que es un n8n



por ejemplo en un banco



política para aperturar una cuenta

política para aperturar un crédito





el cliente llama al asesor para pedirle un asesoramiento



cada funcionario hara su debido trabajo

tiempo de atención

identificar quien hace mas lento el trabajo

el monitor debe actualizarse por si solo , no debe recargar cada rato la pagina web



aquí no es el examen





cuantos políticas de negocio debo hacer

solo habra dos actores





fecha del parcial:  28 de abril



novedades de la aplicación



* la edición debe ser de modo normal , donde empiezo a editarlo con colaboración con otro administrador

debo darle prompt y la ia lo va haciendo

crea una actividad y debe conectarlo



por calles



la herramientas no hace el diagrama sino que me ayuda a hacerlo mediante prompt de texto o audio



debe poder construir un formulario , llenado cargado

el funcionario debe poder llenar el formulario

por ia o manual como siempre



encontrar cuellos de botellas cuando se realiza un tramite

obligatorio todo eso



debemos definir a nuestra manera los cuellos de botellas podemos usar KPIs, o cualquier otra forma de hacerlo



las políticas ese es el propósito para eso sirve la aplicación , para crearlas


---

Apuntes clave de clase (oro):

¡Claro que sí! Aquí tienes la transcripción del audio. Al igual que con el audio anterior, he organizado la información en párrafos y he añadido signos de puntuación para separar las intervenciones del profesor y de los alumnos, y así facilitar la lectura.

Profesor: Vamos a hacer caso al público... Vamos a agregar lo siguiente... Hay algunas ideas que son muy buenas, pero probablemente por cuestiones de tiempo no va a ser muy factible. Pero vamos a tomar aquellas que sí.

Primero, la edición del diagrama debe ser en modo natural, normal, digamos... Yo tengo mi editor donde empiezo a diseñar. Debería ser colaborativo. Es decir, lo podría hacer con varias personas, entre varias personas que están en diferentes lugares podemos estar diseñando el diagrama de actividades que al final termina como una política de negocio. Pero la novedad ahí es que hay una interacción mediante IA. Es decir, yo le voy a escribir "prompt", sea texto o sea audio. Le voy a dar la idea a la herramienta y ella va a ir haciendo lo demás.

Por ejemplo, yo puedo decir: "crear una actividad que diga esto de acá, colócala dentro del departamento tanto... Ahora, conectá la actividad A con la actividad B utilizando una notación lineal o condicional"... Y debería hacerlo. Yo podría introducir... les repito, de dos maneras: uno dibujando directamente como lo hacemos en el Enterprise Architect, o dos, mediante prompts, y esos prompts pueden ser texto o pueden ser audio. Entonces, de esa forma yo voy a ir construyendo. No es que la herramienta me va a generar el diagrama, yo voy a ir diseñando el diagrama, pero en vez de utilizar los clásicos botones o componentes, mediante prompts lo voy a ir haciendo.

Otra novedad interesante es que, cuando... hemos quedado por ejemplo, que cuando la política de negocio viene acá, después acá y después acá, en varios procesos, cada uno tiene que hacer su trabajo. Entonces, la herramienta debe poder construir un formulario para que sea, seguramente, llenado, cargado... como informe de cada uno... de cada funcionario cuando realice su trabajo.

El funcionario debería poder cargar la información a ese formulario, ya sea mediante un informe, digamos, textual... La aplicación lo que debería hacer es reconocer lo que él habló y lo llena en el formulario. Y el otro es manual.

Y el tercero tiene que ver con encontrar cuellos de botella mediante análisis en el tema del flujo. Deben encontrar cuellos de botella en la atención al cliente en una determinada política de negocio, pero eso lo van a hacer con IA. Entonces, eso es obligatorio.

Ahora, la idea que propuso cada quien también la puede implementar. Si resulta que la idea ya la estoy comentando, pues bueno, ya no tiene nada que hacer. Pero los que de repente quieren pelear una nota mucho más alta, no cuenta si no tienen lo mismo. No sé si me entienden... o sea, para que cuente la idea que ustedes van a implementar, esto que es lo mínimo lo deben tener. ¿Se entiende?

Alumno: Con respecto a los cuellos de botella, ¿deberíamos ser capaces de generar métricas en base a eso? ¿El criterio de nosotros cómo se genera?

Profesor: Exactamente. Ustedes son dueños y señores de definir los criterios, las métricas, los KPIs, lo que vean conveniente para determinar dónde está el cuello de botella. El propósito es identificar cuellos de botella. ¿Cómo lo hacen? Cada quien lo ve.

¿Alguna pregunta más por ahí?

Alumno: Ingeniero, en solo los roles, ¿nada más sería en este caso el administrador y el funcionario?

Profesor: O sea, pueden ser una gran cantidad de funcionarios... Pero a nivel, digamos, de roles, sí, habría el administrador (que puede ser uno o varios también), ni siquiera administrador, son gente que crean políticas de negocio, que podrían llamarle siquiera administradores... pueden llamarlo. Pero no es el admin, digamos, de la aplicación. Si no, es un tipo que tiene la capacidad de crear las políticas de negocio, de diseñarlas. De ahí, hay otro conjunto de empleados o funcionarios que, simplemente, son esos funcionarios que atienden la política de negocio y la echan a andar.

Ahora, obviamente, se supone también que en esta aplicación, hemos quedado, debe ser 100% colaborativa en el tema del diseño de las políticas de negocio.

Y... no sé... ¿alguien... hay algo más que tengan como preguntas? ¿Nada más? Bien, pongámosle fecha.

(Se escuchan sugerencias ininteligibles).

Profesor: Hoy es 31... ¿para cuándo lo ponemos?

Alumno: Para este semestre no más, ¿no ve?

Profesor: 31... hoy es miércoles... no, martes... martes. 28. Anoten: 28 de abril, cuatro semanas exactamente. Anotamos acá.

(El profesor anota la fecha).

---

Primer examen parcial
Contexto
Gestion de politica de negocio!
hablamos de solicitud, ahi quisieramos saber cual es el estado
de su trasmite ( en este caso ponemos una empresa "cre" )
herramientas que tenga la posibilidad de gestionar politica de
negocio! -> workflow
desarrollar una aplicacion que tenga la capacidad de gestionar
politica de negocio ( todo el proceso desde crear editar dar
de baja etc. monitorear )
Cual diagrama tiene el proposito de modelar politica de
negocio = Diagrama de Actividades organizado en carriles
(Swimlanes)
Para modelar y reptresentar politica de negocios
politica de negocio -> elemento =
actividades
responsables ( que departeamentes es responsable de x
actividad )
flujo ( cual es el orden cual va primero ) etc, exite
(estrucuta de control de programacion ) 4 posible
variaciones 1- flujo lineal "secuencial" 2- flujo
alternativo 3- flujo interactivo 4- procesos en paralelo
Primer examen parcial 1
¿Que va ser el software?
1- tiene que ver un editor
un diseñador visual = (nada de formulario)
2- un motor
gestione el flujo automaticamente de cada
3- tener un panel
donde pueda visualizar todo lo que tenga que ver con el
tomando en cuneta 3 etapas
1 actividades que le compota hacer
2 activades que ya ejecuto , amarillo en proceso rojo que
llegaron recien en verde que ya acabo
( el panel el monitor se actualiza en linea si f5 se
actualiza cada rato! )
tener elemento de notificacion para que llego la
actividad
Suposicion
departamente de atencion de cliente
el crear una nueva atencion al cliente basada en el nuevo
medidor. el carga la informacion que exige la politica de
negocio. luego lo deriva al departamento que corresponde
luego la otra persona hara el trabajo donde este vera
sera todo en linea
una ves lo termina ( sale como terminado ) luego el
software lo deriva a otro departamento.- el software se
encarga de enrutar derivar a donde va
cuando hacemos la politica de negocio definimos a donde
va cada informacion
Primer examen parcial 2
si el cliente viene y pregunta que pasa con su trasmite
el solo ve en que proceso esta y el deberia donde esta (
identificar que funcionario rinde menos identificar falla
)
tiempo de atencion de clinete ( informacion de tipo
analitica )
Cuando el funcionario haga su trabajo registra lo que
esta haciendo. por lo tanto el software igual tendra algo
similar
cada nodo ( es un departamento etc )
cuando haga su trabajo el software debe permetir crear un
formulario = que informacion se soluciotar rellenar la
informacion de cada departamento
capas carguen imagenes etc
Novedad
cuando dev el software:- no tenemos la idea de cuanta
politica de negocio van a ver
o que flujo se van a dar en la politica de negocio
se diseña para funcionar bajo cualquier funcion
los usuario no sabremos cuantos abran
anticipar algunos roles
1+ usuarios para diseñar la politica de negio ( una
politica de negocio que esta en ejecucion no se puede
Primer examen parcial 3
editar )
habra un rol donde varios usuairo tengan la responsabilidad
de crear editar la politica de negocio
luego nuevo rol par alos funcionario que no tiene nada que
ve con la p. n, solo hacen su traabajo utilizando el
software
Añadiendo al software
Ideas para implementar!
-> Usar IA
en el momento de diseñar el diagrama. desde punto de
vista de interaccion
investigar sobre Enterprise Architect
diseñar el diagrama sin neceisdad de tocar el mouse. como
si tuvieramos hablando con el asistente!
mover quitar resaltar etc etc
-> colaborativo
pucha persona de manera simultanea usando el sistema para
crear la politica de negocio pueden estar en distinto
lugares.- usando la IA detectar cuello de bota, sugerir
obtimizar la politica de negocio
el proposito central es que el uso de software sea lo mas
productivo. el software debe ser un asistente ayude
oriente etc.
antes se usaba manual = un agente que acuerdo al usuario
que este ocupando la palicacion para saer que va suguerir

Profesor: ¿Tienen alguna pregunta más?

Alumno: Ingeniero, ¿tienen que haber políticas mínimas? Digamos unas cinco o mínimo... o ¿solo una?

Profesor: ¿Qué te dije hace rato? No tenemos ni idea. Ustedes van a simplemente diseñar la herramienta. En el examen vamos a venir y ahí vamos a crear. Yo le voy a decir: "creen esta política de negocio, creen esta otra"... etcétera, etcétera, y ustedes ya podrán hacerlo. Ese día me imagino que van a venir... pues, no creo que vengan con varias máquinas porque la única forma de ver que funcione es que haya cosas que se vean simultáneamente. Una opción es que se vengan con varias máquinas, eso no es ni viable. La otra opción es que... no sé, creen una especie de emuladores en su misma máquina, tampoco es muy viable. Creo que lo que pueden hacer, más sencillo, es tener más de un navegador y en cada navegador estará un funcionario distinto, y ahí se ve. Sin hacer ningún clic, solito automáticamente se tiene que ver el progreso de todo.

¿Qué más? Bueno, de todas maneras, el día jueves, los primeros minutos nos dedicamos a hablar un poco más de la comprensión del problema. Nos vemos, jóvenes.


---

Resumen del Proyecto: Sistema de Gestión de Políticas de Negocio (Workflow)
El objetivo principal es desarrollar una aplicación que tenga la capacidad de gestionar "políticas de negocio" o flujos de trabajo, permitiendo crear, editar, dar de baja, visualizar y monitorizar estos procesos.

Requerimientos Centrales del Sistema:

Gestión del Flujo: El software debe derivar automáticamente las tareas de un departamento a otro según el proceso definido en la política.

Monitorización: Debe existir un panel para que cada funcionario sepa exactamente qué trámites tiene pendientes o en proceso.

Estado visual: Los trámites pendientes o en curso deben mostrarse con indicadores visuales (como colores verde, amarillo o rojo).

Diseñador Visual de Políticas: El sistema requiere un editor visual donde el usuario final pueda diseñar y modelar los flujos de la empresa.

Diagrama Base: Este modelado debe basarse estrictamente en un Diagrama de Actividades organizado en calles (Swimlanes) de UML.

Soporte de Flujos: La herramienta gráfica debe soportar flujos lineales (secuenciales), flujos alternativos, iterativos y procesos en paralelo.

Diseñador de Formularios: Debido a que cada "nodo" o actividad del diagrama necesita un formulario (para subir archivos, llenar textos, etc.), el sistema debe permitir diseñar estos formularios dinámicamente sin necesidad de programar código nuevo para cada uno.

Asignación Dinámica: Los roles y departamentos no pueden estar preprogramados o "quemados" en el sistema. La aplicación debe permitir configurar qué departamentos y funcionarios se asignan a las diferentes "calles" del diagrama.

Contexto y Ejemplo Práctico:

El docente utiliza el ejemplo de la CRE (que seguro conoces bien por vivir en Santa Cruz) y el trámite para solicitar la instalación de un medidor.

Ese flujo específico pasa secuencialmente por: Atención al Cliente, Departamento Técnico, Departamento de Facturación, Departamento Legal y, finalmente, Almacén.


---

PRIMER PARCIAL INGENIERIA SOFTWARE 1

HERRAMIENTA PARA DISEÑAR POLÍTICAS DE NEGOCIOS

FECHA DE PRESENTACIÓN: 28 de abril del 2026

Contexto:
Políticas de negocios; existen empresas como cotas, tigo, entel, etc. donde un usuario puede solicitar paquetes de servicios
Etapa inicial → instalación, atención al cliente, movilización del trámite, solicitud de requisitos, depende de cómo sean las políticas para la instalación lo deriva a una distinta área, y de esta área la deriva a otra

departamento 1 → departamento 2 → departamento n → … → departamento n + 1

el cliente llama para hacer el trámite, saber por dónde o cómo va yendo el trámite, quiere ver el seguimiento

Bot de ayuda para llevar el seguimiento del trámite de parte del cliente

Cada usuario tiene una vista o panel donde se veran las actividades ya hechas, también que estime las actividades ya hechas, también que estime el tiempo que va a tardar el proceso

El sistema debe soportar varias políticas de negocios, el flujo de trabajo puede soportar 4 tipos:
lineal
alternativo (que debe cumplir ciertos requisitos para pasar a otro lado)
iterativa
paralelo

Tiene el estilo de un diagrama de UML que es el Diagrama de Actividades organizado en calles.

Escanea el diagrama y le crea al usuario tomando estos 3 aspectos:

Actividades o tareas
Responsables (personas o departamentos)
Flujo (secuencial, iterativo, alternativo y paralelo)

debe de cargar las políticas de cada departamento y cargar sus actividades

se valora la felicidad de uso

como Administrador debe de poder crear y diseñar políticas de negocios a través de diagramas de actividades organizado en calles


NOVEDADES:
Diseño colaborativo, el diagrama de actividades con interacción con IA, también se puede comunicar a través de texto, voz o imagen con la herramienta de diseño
Construir formularios de cada funcionario para que llene de datos, informe textual o voz o de forma manual
encontrar con IA cuellos de botellas en atención al cliente

si la idea de novedad hay que implementarla si es que ya no está pedida

NOTAS DE CARVAJAL

Premisa.- Usuarios solicitan un trámite (ej. CRE, instalación de medidor). Se requiere un workflow para el seguimiento de trámites. enrutación de departamentos según la política de negocio.
se identifican:
Cuellos de botella
tiempos de atención
wall socket ?)
serial, alternativo iterativo y paralelo
lo desafiante es para quien o que va ser el SW. se debe tener un motor para el workflow. diagrama de actividades organizado en calles, editor similar a architect

carga de actividades, departamentos, politicas de negocios, facilidad de uso para seguimiento de actividades