# Deploy Rapido (Copiar/Pegar) - Render + Vercel

## 0) Estructura esperada del repo
- `backend/` (NestJS)
- `frontend/` (React + Vite + TS)

---

## 1) Backend NestJS - comandos previos
Ejecutar dentro de `backend/`:

```bash
npm install
npm run build
```

Si usas Prisma:

```bash
npx prisma generate
```

Verifica en `backend/package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

---

## 2) Render - crear PostgreSQL
En Render Dashboard:
1. New -> PostgreSQL.
2. Crear instancia.
3. Copiar `External Database URL`.

Guarda ese valor para `DATABASE_URL`.

---

## 3) Render - desplegar backend
En Render Dashboard:
1. New -> Web Service.
2. Conectar repositorio GitHub.
3. Root Directory: `backend`
4. Build Command:

```bash
npm install && npm run build
```

5. Start Command:

```bash
npm run start:prod
```

6. Variables de entorno:

```env
NODE_ENV=production
DATABASE_URL=pega_aqui_tu_database_url
JWT_SECRET=cambia_esto_por_un_secreto_largo
FRONTEND_URL=https://tu-app.vercel.app
```

Si Render usa `PORT` automaticamente, no lo fuerces. En NestJS usa `process.env.PORT`.

---

## 4) Prisma migrate en produccion
Opcion recomendada (una vez por deploy inicial):

```bash
npx prisma migrate deploy
```

Puedes correrlo desde el shell del servicio en Render.

---

## 5) Vercel - desplegar frontend
En Vercel Dashboard:
1. Add New -> Project.
2. Importar repo.
3. Root Directory: `frontend`.
4. Variables de entorno:

```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_SOCKET_URL=https://tu-backend.onrender.com
```

5. Deploy.

---

## 6) CORS rapido en NestJS (main.ts)
Asegura CORS con tu dominio de Vercel:

```ts
app.enableCors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
});
```

Si usas Socket.IO, configura el mismo `origin` en el gateway.

---

## 7) Prueba final en produccion
Checklist:
- [ ] Login funciona.
- [ ] Crear politica funciona.
- [ ] Iniciar tramite funciona.
- [ ] Dos sesiones ven cambios en tiempo real.
- [ ] Formulario guarda datos.
- [ ] KPI/cuello de botella visible.

---

## 8) Fallback para examen (si algo falla)
- Demo local en `localhost` con dos navegadores.
- Datos de prueba listos.
- Guion corto de 5-8 minutos.
