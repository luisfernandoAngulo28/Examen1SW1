Terminal 1 — Backend Spring Boot:


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\workflow-engine"
mvn spring-boot:run
Terminal 2 — IA Service Python:


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\ai-service"
pip install -r requirements.txt
python main.py
Terminal 3 — Frontend Angular:


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\frontend-ng"
npm install
ng serve
Mientras los levantas, revisar si hay algo critico que puede fallar:

Read d:\Universidad\SW1S12025\PrimerParcialSW1\COMO_CORRER_LOCAL.md
Read d:\Universidad\SW1S12025\PrimerParcialSW1\CREDENCIALES_DEMO.md
El proyecto tiene todo documentado. Aqui el orden exacto para levantar todo:

Orden de arranque (copia y pega en 3 terminales)
Terminal 1 — IA Service (arrancar primero):


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\ai-service"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
Verifica: abre http://localhost:8000/health — debe responder {"status":"ok"}

Terminal 2 — Spring Boot (arrancar segundo):


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\workflow-engine"
.\mvnw spring-boot:run
Verifica: espera el mensaje Started WorkflowEngineApplication — puede tardar ~1-2 min la primera vez.

Terminal 3 — Angular (arrancar tercero):


cd "d:\Universidad\SW1S12025\PrimerParcialSW1\frontend-ng"
npm install
ng serve --port 4200
Si ng no se encuentra, usa: & "C:\nvm4w\nodejs\ng.ps1" serve --port 4200

Terminal 4 — Seed de datos (una vez que el backend este corriendo):


cd "d:\Universidad\SW1S12025\PrimerParcialSW1"
.\scripts\seed-demo.ps1
Arranca los 3 servicios y dime que errores salen (si salen). Mientras tanto verifico si hay algo en el codigo que pueda causar problemas al arrancar.
----------------------------------------------------------------------------------------------------------------------------
Parte A — Firebase (10 min)
A1. Registrar la app Android en Firebase "Fempile"
En Firebase Console → proyecto Fempile → clic en el ícono ⚙️ (rueda) → Configuración del proyecto → pestaña General
Baja hasta "Tus apps" → clic Agregar app → Android (ícono del robot)
Package name: com.workflow.workflow_mobile (exacto, sin espacios)
Apodo: WorkflowSW1 Mobile → Registrar app
Clic Descargar google-services.json → guarda el archivo
Coloca ese archivo aquí: mobile_app/android/app/google-services.json (reemplaza el que existe con placeholders)
A2. Descargar clave del Service Account (backend)
Estás en la pestaña Cuentas de servicio (ya la tenés abierta en la foto)
Clic en Generar nueva clave privada → confirmar → descarga un JSON
Renómbralo a firebase-credentials.json
Cópialo a: workflow-engine/src/main/resources/firebase-credentials.json
Verificar que application.properties ya tiene esta línea (ya está):

firebase.credentials.path=${FIREBASE_CREDENTIALS_PATH:}
Parte B — AWS EC2 (30-40 min)
B1. Lanzar instancia EC2
En AWS Console → EC2 → Lanzar instancia
Nombre: workflow-sw1
AMI: Ubuntu Server 24.04 LTS (gratis)
Tipo: t2.micro (gratis en free tier) o t3.small si esperás más carga
Par de claves: crear uno nuevo → descarga el .pem
Grupo de seguridad: agregar estas reglas de entrada:
Tipo	Puerto	Origen
SSH	22	Mi IP
HTTP	80	0.0.0.0/0
TCP personalizado	8080	0.0.0.0/0
TCP personalizado	8000	0.0.0.0/0
Almacenamiento: mínimo 20 GB (el build de Java necesita espacio)
Clic Lanzar instancia
B2. Conectarse e instalar Docker
Cuando la instancia esté corriendo, copiá la IP pública y ejecutá:


# Conectarse (desde tu máquina, ajustar ruta del .pem)
ssh -i "tu-clave.pem" ubuntu@TU_IP_PUBLICA

# Dentro del servidor:
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
B3. Clonar el repo y configurar

git clone https://github.com/luisfernandoAngulo28/Examen1SW1.git
cd Examen1SW1
git checkout appmod/java-upgrade-20260412030256
Crear el archivo .env con las variables secretas:


cat > .env << 'EOF'
JWT_SECRET=sw1-workflow-engine-secret-2026-prod
CORS_EXTRA_ORIGINS=http://TU_IP_PUBLICA
EOF
Para Firebase, pegá el contenido del firebase-credentials.json como variable de entorno (en una línea):


# Opción más fácil: copiar el archivo directamente
mkdir -p workflow-engine/src/main/resources
# Subir el archivo con scp desde tu máquina local:
# scp -i "tu-clave.pem" firebase-credentials.json ubuntu@TU_IP_PUBLICA:~/Examen1SW1/workflow-engine/src/main/resources/
Luego agregar al .env:


FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json
B4. Levantar todo con Docker Compose

docker compose up -d --build
El build tarda ~10-15 minutos la primera vez (Java necesita compilar). Podés ver los logs con:


docker compose logs -f backend
B5. Verificar que funciona

# Backend
curl http://localhost:8080/api/auth/login

# AI service
curl http://localhost:8000/health

# Frontend (desde tu navegador)
http://TU_IP_PUBLICA
B6. Actualizar la URL en la app mobile
En mobile_app/lib/services/api_service.dart línea 9, cambiar:


static const String _defaultBase = 'http://TU_IP_PUBLICA:8080/api';
Luego rebuild la app:


cd mobile_app
flutter build apk --release
# APK en: build/outputs/flutter-apk/app-release.apk
¿Por dónde querés empezar? ¿Primero ponés el google-services.json y el firebase-credentials.json y me decís cuando los tenés, o avanzamos con el EC2 primero?