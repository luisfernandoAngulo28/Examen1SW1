# Cómo correr el proyecto localmente

> **Stack:** Spring Boot 3.5 (Java 22) · Python 3.11 / FastAPI · Angular 18 · MongoDB 7

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|----------------|-----------|
| Java (JDK) | 17+ | `java --version` |
| Node.js | 18+ | `node --version` |
| Angular CLI | 17+ | `ng version` |
| Python | 3.11+ | `python --version` |
| pip | cualquiera | `pip --version` |
| MongoDB | 7 corriendo local | `netstat -ano \| findstr :27017` |
| Docker (opcional) | 20+ | `docker --version` |

> MongoDB ya está corriendo en tu máquina en el puerto 27017. ✅

---

## Opción A — Correr cada servicio por separado (recomendado para desarrollo)

### Terminal 1 — Microservicio Python/FastAPI (IA)

```powershell
cd d:\Universidad\SW1S12025\PrimerParcialSW1\ai-service

# Solo la primera vez: crear entorno virtual e instalar dependencias
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Todas las veces: activar entorno y arrancar
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Verifica que funciona: <http://localhost:8000/health>  
Swagger UI (documentación interactiva): <http://localhost:8000/docs>

---

### Terminal 2 — Spring Boot (motor de workflow)

```powershell
cd d:\Universidad\SW1S12025\PrimerParcialSW1\workflow-engine

# Compila y arranca (descarga dependencias Maven la primera vez ~2 min)
.\mvnw spring-boot:run
```

Verifica que funciona: <http://localhost:8080/api/auth/users>

> **Variables de entorno opcionales** — ponlas antes del comando si las necesitas:
> ```powershell
> $env:ELEVENLABS_API_KEY = "tu_clave_aqui"
> $env:AI_SERVICE_URL     = "http://localhost:8000"   # ya es el valor por defecto
> .\mvnw spring-boot:run
> ```

---

### Terminal 3 — Angular (frontend)

```powershell
cd d:\Universidad\SW1S12025\PrimerParcialSW1\frontend-ng

# Solo la primera vez
npm install

# Todas las veces
& "C:\nvm4w\nodejs\ng.ps1" serve --port 4200
```

Abre: <http://localhost:4200>

---

### Terminal 4 — Seed de datos de demo (después de que el backend esté listo)

```powershell
cd d:\Universidad\SW1S12025\PrimerParcialSW1

# Pobla la base de datos con usuarios, políticas y casos de ejemplo
.\scripts\seed-demo.ps1
```

---

## Credenciales de demo

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin@demo.com` | `Admin1234!` | DESIGNER |
| `disenador@demo.com` | `Admin1234!` | DESIGNER |
| `rrhh@demo.com` | `Admin1234!` | OFFICER |
| `legal@demo.com` | `Admin1234!` | OFFICER |
| `finanzas@demo.com` | `Admin1234!` | OFFICER |
| `ti@demo.com` | `Admin1234!` | OFFICER |

---

## Orden de arranque (importante)

```
1. MongoDB         (ya corre en tu máquina)
2. ai-service      puerto 8000  ← FastAPI
3. workflow-engine puerto 8080  ← Spring Boot
4. frontend-ng     puerto 4200  ← Angular
5. seed-demo.ps1               ← solo una vez por sesión de demo
```

---

## Opción B — Docker Compose (todo en un comando)

```powershell
cd d:\Universidad\SW1S12025\PrimerParcialSW1

# Construir imágenes y levantar todos los servicios
docker compose up --build

# En segundo plano
docker compose up --build -d

# Ver logs en vivo
docker compose logs -f

# Bajar todo
docker compose down
```

> Con Docker Compose **no necesitas** MongoDB local ni Python ni Java instalados.
> Los puertos son los mismos: 4200, 8080, 8000.

---

## Rutas útiles en desarrollo

| Servicio | URL |
|----------|-----|
| Frontend Angular | <http://localhost:4200> |
| Backend Spring Boot | <http://localhost:8080/api> |
| AI Service FastAPI | <http://localhost:8000> |
| Swagger AI Service | <http://localhost:8000/docs> |
| MongoDB local | `mongodb://localhost:27017/workflow_sw1` |

---

## Probar el microservicio de IA directamente (sin frontend)

```powershell
# Probar prompt de diseño
Invoke-RestMethod -Uri "http://localhost:8000/prompt" `
  -Method POST -ContentType "application/json" `
  -Body '{"prompt": "crea un flujo para solicitud de vacaciones"}'

# Probar llenado NLP de formulario
Invoke-RestMethod -Uri "http://localhost:8000/nlp/fill-form" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "transcript": "me llamo Juan Garcia, el monto es 1500 bolivianos, para el 20 de abril de 2026",
    "fields": [
      {"name": "nombre", "label": "Nombre", "type": "text"},
      {"name": "monto",  "label": "Monto",  "type": "number"},
      {"name": "fecha",  "label": "Fecha",  "type": "date"}
    ]
  }'

# Health check
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

---

## Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| `mvnw` falla con "Java 22 not found" | JDK instalado es 17 | El proyecto funciona con 17+, no hace falta 22 |
| Puerto 8080 ocupado | Otra app usa el puerto | `netstat -ano \| findstr :8080` para ver qué proceso es |
| `ng serve` error "ng not found" | Path de Angular CLI | Usar `& "C:\nvm4w\nodejs\ng.ps1" serve` |
| FastAPI `ModuleNotFoundError` | Entorno virtual no activado | `.\.venv\Scripts\Activate.ps1` antes de uvicorn |
| Seed falla con 401 | Backend no listo aún | Esperar al mensaje `Started WorkflowEngineApplication` |
| Frontend muestra pantalla en blanco | Angular no compiló | Revisar terminal 3, puede haber error de TypeScript |
