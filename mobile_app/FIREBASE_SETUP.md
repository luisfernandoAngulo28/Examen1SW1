# Configurar Firebase para Push Notifications

## Pasos rápidos (5 minutos)

### 1. Crear proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Click **"Agregar proyecto"** → nombre: `WorkflowSW1`
3. Desactiva Google Analytics (opcional) → **Crear proyecto**

### 2. Registrar la app Android
1. En el panel del proyecto, click **Android** (ícono)
2. **Package name:** `com.workflow.workflow_mobile`
3. **App nickname:** WorkflowSW1 Mobile (opcional)
4. Click **Registrar app**

### 3. Descargar google-services.json
1. Click **"Descargar google-services.json"**
2. Coloca el archivo en: `mobile_app/android/app/google-services.json`
3. Click **Siguiente → Siguiente → Continuar en la consola**

### 4. Activar en el frontend de Firebase
- Ve a **Build → Cloud Messaging** en el panel de Firebase
- No necesitas configurar nada adicional para FCM v1

### 5. Configurar el Backend Spring Boot

#### 5a. Descargar Service Account
1. En Firebase Console → ⚙️ Configuración del proyecto → **Cuentas de servicio**
2. Click **"Generar nueva clave privada"** → descarga el JSON
3. Renómbralo a `firebase-credentials.json`
4. Colócalo en: `workflow-engine/src/main/resources/firebase-credentials.json`

#### 5b. Verificar application.properties
```properties
# workflow-engine/src/main/resources/application.properties
firebase.credentials.path=classpath:firebase-credentials.json
```

### 6. Rebuild y prueba
```powershell
# Backend
cd workflow-engine
.\mvnw spring-boot:run

# App
cd mobile_app
flutter build apk --debug
# APK en: mobile_app/build/outputs/flutter-apk/app-debug.apk
```

## Verificar que funciona

1. Instala el APK en el emulador/dispositivo
2. Login con `cliente@demo.com` / `Admin1234!`
3. La app llama a `PUT /api/auth/fcm-token` al iniciar
4. Cuando un funcionario complete una tarea del trámite del cliente, debería llegar una push notification

## Sin Firebase (modo sin notificaciones)

La app funciona completamente **sin** `google-services.json`. El error de Firebase se captura silenciosamente en `main.dart`. Solo las notificaciones push estarán deshabilitadas.

> **Nota:** Si compilas sin `google-services.json`, Gradle fallará. En ese caso, comenta el plugin de Google Services en `android/app/build.gradle.kts` temporalmente.
