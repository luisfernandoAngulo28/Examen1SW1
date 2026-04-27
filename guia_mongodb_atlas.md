# Guía paso a paso — MongoDB Atlas para el proyecto

**Cluster:** Cluster0
**Provider:** AWS
**Región:** Sao Paulo (sa-east-1)
**Tier:** M0 (gratuito)
**Usuario BD:** fernandofa671_db_user
**Base de datos del proyecto:** workflow_sw1

---

## Paso 1: Volver a la vista principal del cluster

1. En el menú izquierdo, haz clic en **Clusters**.
2. Debes ver la tarjeta de **Cluster0** con los botones **Conectar** y **Editar configuración**.

---

## Paso 2: Resetear la contraseña del usuario

> ⚠️ La contraseña original quedó expuesta. Hay que cambiarla.

1. En el menú izquierdo busca la sección **SECURITY**.
2. Haz clic en **Database Access** (o **Acceso a la base de datos**).
3. Busca el usuario `fernandofa671_db_user` en la lista.
4. Haz clic en **Edit** (o el ícono de lápiz).
5. Haz clic en **Edit Password** o **Reset Password**.
6. Genera o escribe una contraseña nueva.
7. **Copia y guarda la contraseña** en un lugar seguro (bloc de notas, gestor de contraseñas).
8. Haz clic en **Update User** o **Guardar**.

---

## Paso 3: Verificar acceso de red

1. En el menú izquierdo, sección **SECURITY**.
2. Haz clic en **Network Access** (o **Acceso a la red**).
3. Revisa que aparezca tu IP actual en la lista (la que sale como `192.223.107.223` o similar).
4. Si **NO aparece** tu IP:
   - Haz clic en **Add IP Address**.
   - Elige **Add Current IP Address**.
   - Haz clic en **Confirm**.
5. Si tu IP cambia mucho (internet móvil, reinicio de router):
   - Puedes agregar temporalmente `0.0.0.0/0` (permite cualquier IP).
   - Solo para pruebas, no para producción.

---

## Paso 4: Obtener la cadena de conexión (URI)

1. Vuelve a **Clusters** en el menú izquierdo.
2. En la tarjeta de **Cluster0**, haz clic en **Conectar** (o **Connect**).
3. Elige **Conductores** (o **Drivers**).
4. Selecciona:
   - Driver: **Java**
   - Version: **5.1 o posterior** (la que recomiende)
5. Copia la URI que aparece abajo. Se ve así:

```
mongodb+srv://fernandofa671_db_user:<db_password>@cluster0.opii5qm.mongodb.net/?appName=Cluster0
```

6. Haz clic en **Hecho** (o **Done**).

---

## Paso 5: Corregir la URI para el proyecto

La URI que te da Atlas **NO incluye** el nombre de la base de datos. Debes agregarlo.

### URI original (incompleta):
```
mongodb+srv://fernandofa671_db_user:<db_password>@cluster0.opii5qm.mongodb.net/?appName=Cluster0
```

### URI corregida (correcta):
```
mongodb+srv://fernandofa671_db_user:TU_PASSWORD_NUEVA@cluster0.opii5qm.mongodb.net/workflow_sw1?retryWrites=true&w=majority&appName=Cluster0
```

### Qué cambié:
- Reemplacé `<db_password>` por tu contraseña real.
- Agregué `/workflow_sw1` antes del `?` — esa es la base de datos del proyecto.
- Agregué `retryWrites=true&w=majority` — parámetros recomendados por Atlas.

### Nota sobre caracteres especiales en la contraseña:
Si tu contraseña tiene estos caracteres: `@ : / ? # % [ ]`
debes reemplazarlos por su versión URL-encoded:

| Carácter | Reemplazar por |
|---|---|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `%` | `%25` |

Ejemplo: si tu password es `Mi@Clave#1` → en la URI pones `Mi%40Clave%231`

---

## Paso 6: Guardar la URI en tu máquina (Windows PowerShell)

### Opción A — Solo para la sesión actual (temporal):
```powershell
$env:MONGODB_URI="mongodb+srv://fernandofa671_db_user:TU_PASSWORD_NUEVA@cluster0.opii5qm.mongodb.net/workflow_sw1?retryWrites=true&w=majority&appName=Cluster0"
```

### Opción B — Persistente en Windows (recomendada):
```powershell
setx MONGODB_URI "mongodb+srv://fernandofa671_db_user:TU_PASSWORD_NUEVA@cluster0.opii5qm.mongodb.net/workflow_sw1?retryWrites=true&w=majority&appName=Cluster0"
```
> Después de `setx`, cierra la terminal y abre una nueva para que tome efecto.

### Verificar que quedó guardada:
```powershell
# En la misma sesión (opción A):
echo $env:MONGODB_URI

# En nueva terminal (opción B):
[System.Environment]::GetEnvironmentVariable("MONGODB_URI","User")
```

---

## Paso 7: Configurar Spring Boot

En el archivo `application.properties` del proyecto Spring Boot:

```properties
spring.application.name=workflow-sw1
spring.data.mongodb.uri=${MONGODB_URI}
spring.data.mongodb.auto-index-creation=true
server.port=8080
```

> La variable `${MONGODB_URI}` lee automáticamente la variable de entorno que guardaste en el paso 6.

---

## Paso 8: Probar conexión desde Java

Código mínimo para verificar que la conexión funciona:

```java
String connectionString = System.getenv("MONGODB_URI");
if (connectionString == null || connectionString.isBlank()) {
    throw new IllegalStateException("MONGODB_URI no está definida");
}
// Si llegó aquí sin error, la variable existe.
// Spring Boot se conectará automáticamente al arrancar.
```

Al iniciar Spring Boot, si la conexión es exitosa verás en los logs:
```
Opened connection to cluster0.opii5qm.mongodb.net
```

Si falla, verifica:
- [ ] ¿La contraseña es correcta?
- [ ] ¿Tu IP está permitida en Network Access?
- [ ] ¿La URI tiene `/workflow_sw1` antes del `?`?

---

## Paso 9: Probar con mongosh (opcional)

Si tienes `mongosh` instalado:

```powershell
mongosh "mongodb+srv://fernandofa671_db_user:TU_PASSWORD_NUEVA@cluster0.opii5qm.mongodb.net/workflow_sw1?retryWrites=true&w=majority&appName=Cluster0"
```

Una vez conectado:
```javascript
db.runCommand({ ping: 1 })         // debe decir { ok: 1 }
show dbs                            // lista las bases de datos
use workflow_sw1                    // cambia a tu base
db.test.insertOne({ ok: true })     // inserta un documento de prueba
db.test.find()                      // lo busca
db.test.drop()                      // lo borra (limpieza)
```

---

## Paso 10: Limpiar datos de ejemplo (opcional)

Atlas cargó datasets de ejemplo (~103 MB) que no necesitas.

### Por interfaz web:
1. Menú izquierdo → **Data Explorer** (o **Explorador de datos**).
2. Verás bases como: `sample_mflix`, `sample_airbnb`, `sample_supplies`, etc.
3. En cada una, haz clic en el ícono de basura o en **Drop Database**.
4. Confirma la eliminación.
5. **NO borres** `workflow_sw1` ni `admin` ni `local`.

### Por mongosh:
```javascript
db.getSiblingDB("sample_mflix").dropDatabase()
db.getSiblingDB("sample_airbnb").dropDatabase()
db.getSiblingDB("sample_supplies").dropDatabase()
db.getSiblingDB("sample_training").dropDatabase()
db.getSiblingDB("sample_analytics").dropDatabase()
db.getSiblingDB("sample_geospatial").dropDatabase()
db.getSiblingDB("sample_restaurants").dropDatabase()
db.getSiblingDB("sample_weatherdata").dropDatabase()
```

---

## Checklist final — MongoDB Atlas listo

- [ ] Cluster0 creado en AWS Sao Paulo (sa-east-1)
- [ ] Contraseña reseteada (la original ya no sirve)
- [ ] IP actual permitida en Network Access
- [ ] URI copiada y corregida con `/workflow_sw1`
- [ ] Variable `MONGODB_URI` guardada en Windows
- [ ] `application.properties` configurado con `${MONGODB_URI}`
- [ ] Spring Boot arranca sin error de conexión
- [ ] Datasets de ejemplo eliminados (opcional)

> Cuando todos los checks estén marcados, MongoDB Atlas está 100% listo para el proyecto.
