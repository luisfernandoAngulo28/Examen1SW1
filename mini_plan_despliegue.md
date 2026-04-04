# Mini Plan de Despliegue (Parcial SW1)

## Recomendacion para tu caso
Como ya usaste Render antes, la mejor ruta para reducir riesgo es:
- Backend (NestJS): Render
- Base de datos PostgreSQL: Render Postgres (o Neon)
- Frontend (React + Vite): Vercel

Alternativa valida si prefieres Railway:
- Backend: Railway
- PostgreSQL: Railway Postgres
- Frontend: Vercel

---

## Opcion A (recomendada): Render + Vercel

### 1) Preparar backend NestJS
Checklist previo:
- `PORT` tomado desde variable de entorno.
- CORS habilitado para dominio del frontend.
- Script de build y start en `package.json`.
- Prisma listo con `DATABASE_URL`.

`package.json` (backend) esperado:
- `build`: `nest build`
- `start:prod`: `node dist/main`

### 2) Crear PostgreSQL
En Render:
1. Crear servicio PostgreSQL.
2. Copiar `Internal Database URL` o `External Database URL`.
3. Guardar como `DATABASE_URL` en backend.

### 3) Desplegar backend en Render
1. New Web Service -> conectar repo.
2. Root directory: carpeta de backend.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`
5. Variables de entorno:
- `NODE_ENV=production`
- `PORT=10000` (o dejar que Render inyecte)
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `FRONTEND_URL=https://tu-frontend.vercel.app`

### 4) Migraciones Prisma en produccion
Opcion simple:
- Agregar postdeploy command: `npx prisma migrate deploy`

Si no tienes postdeploy en el panel:
- Ejecutar una vez manual desde consola del servicio.

### 5) Desplegar frontend en Vercel
1. Importar repo en Vercel.
2. Root directory: carpeta de frontend.
3. Framework: Vite (auto detecta).
4. Variables frontend:
- `VITE_API_URL=https://tu-backend.onrender.com`
- `VITE_SOCKET_URL=https://tu-backend.onrender.com`
5. Deploy.

### 6) CORS y Socket.IO
En NestJS:
- Habilitar CORS con origen de Vercel.
- Socket.IO con `cors.origin` apuntando a frontend.

### 7) Prueba final de produccion
1. Login funcional.
2. Crear politica.
3. Iniciar tramite.
4. Abrir dos navegadores con usuarios distintos.
5. Ver actualizacion en tiempo real.
6. Ver formulario y KPI minimo.

---

## Opcion B: Railway + Vercel (si quieres comparar)

### Backend en Railway
1. New Project -> Deploy from GitHub.
2. Seleccionar carpeta backend.
3. Variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
4. Build/Start (segun detecte):
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

### DB en Railway
1. Add PostgreSQL plugin.
2. Railway inyecta `DATABASE_URL`.
3. Ejecutar `npx prisma migrate deploy`.

### Frontend en Vercel
Igual que en opcion A.

---

## Que elegir finalmente
- Si ya dominas Render: usa Render + Vercel.
- Si quieres todo mas unificado en una sola plataforma: Railway + Vercel.

Para examen individual y tiempo corto, Render + Vercel te da menos friccion por experiencia previa.

---

## Variables de entorno minimas

### Backend
- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `FRONTEND_URL=https://tu-frontend.vercel.app`

### Frontend
- `VITE_API_URL=https://tu-backend...`
- `VITE_SOCKET_URL=https://tu-backend...`

---

## Plan de contingencia (muy importante)
Si el deploy falla antes del examen:
1. Mostrar demo local estable (`localhost`) con 2 navegadores.
2. Priorizar evidencia funcional sobre infraestructura.
3. Llevar datos de prueba listos y guion de demo.
