# Checklist de Errores Tipicos de Deploy

Stack objetivo:
- Backend: NestJS + Prisma + PostgreSQL (Render)
- Frontend: React + Vite (Vercel)

Uso recomendado:
1. Detecta el sintoma.
2. Busca el bloque correspondiente.
3. Aplica la solucion rapida.
4. Reintenta deploy.

---

## 1) Backend no levanta (Render muestra crash)
Sintomas:
- Servicio cae apenas inicia.
- Log: "Cannot find module dist/main" o similar.

Revisar:
- Build Command correcto.
- Start Command correcto.
- `package.json` con scripts de produccion.

Solucion rapida:
- Build: `npm install && npm run build`
- Start: `npm run start:prod`
- Verificar que `dist/main.js` exista tras build.

---

## 2) Error de puerto (`EADDRINUSE` o no escucha)
Sintomas:
- Backend inicia local, pero en Render no responde.

Revisar:
- En NestJS se use `process.env.PORT`.

Solucion rapida:
- En `main.ts`, usar:

```ts
const port = process.env.PORT || 3000;
await app.listen(port);
```

---

## 3) Error de Prisma (`DATABASE_URL` missing / auth failed)
Sintomas:
- Log: "Environment variable not found: DATABASE_URL".
- Log: error de autenticacion contra Postgres.

Revisar:
- Variable `DATABASE_URL` existe en Render.
- URL apunta a la BD correcta.

Solucion rapida:
- Configurar `DATABASE_URL` en servicio backend.
- Rehacer deploy.

---

## 4) Migraciones no aplicadas
Sintomas:
- Backend arranca pero falla en consultas.
- Tablas no existen.

Revisar:
- Si se corrio `prisma migrate deploy` en produccion.

Solucion rapida:
- Ejecutar una vez en shell del backend:

```bash
npx prisma migrate deploy
```

---

## 5) CORS bloquea peticiones desde Vercel
Sintomas:
- En navegador: error CORS.
- Login/API falla en frontend desplegado.

Revisar:
- `FRONTEND_URL` correcto en backend.
- CORS habilitado en NestJS.

Solucion rapida:

```ts
app.enableCors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
});
```

---

## 6) Frontend usa URL incorrecta de API
Sintomas:
- Frontend levanta pero no carga datos.
- 404/Network Error hacia localhost en produccion.

Revisar:
- Variables `VITE_API_URL` y `VITE_SOCKET_URL` en Vercel.

Solucion rapida:
- Configurar ambas con URL publica del backend.
- Redeploy frontend.

---

## 7) Socket.IO no conecta en produccion
Sintomas:
- API funciona, pero no hay updates en tiempo real.

Revisar:
- URL de socket correcta.
- CORS del gateway permitido.

Solucion rapida:
- En frontend usar `VITE_SOCKET_URL`.
- En gateway configurar `cors.origin` con dominio Vercel.

---

## 8) Variables de entorno no se aplican
Sintomas:
- Cambiaste variables pero comportamiento no cambia.

Revisar:
- Si reiniciaste/redeployaste servicio.

Solucion rapida:
- Guardar variables.
- Forzar redeploy en Render/Vercel.

---

## 9) Build falla por version de Node
Sintomas:
- Error de dependencias o sintaxis moderna.

Revisar:
- Version de Node compatible en local y cloud.

Solucion rapida:
- Definir version en `package.json`:

```json
{
  "engines": {
    "node": ">=20"
  }
}
```

---

## 10) Error 500 sin detalle
Sintomas:
- Endpoint responde 500, sin contexto claro.

Revisar:
- Logs de Render.
- Manejo de excepciones en NestJS.

Solucion rapida:
- Activar logs estructurados.
- Probar endpoint minimo (`/health`).

---

## 11) Checklist rapido antes del examen
- [ ] Backend deployado y respondiendo `/health`.
- [ ] Frontend deployado con API URL correcta.
- [ ] Login y roles funcionando.
- [ ] Crear politica funcionando.
- [ ] Iniciar tramite funcionando.
- [ ] Tiempo real funcionando en 2 navegadores.
- [ ] Formulario guarda datos.
- [ ] KPI/cuello de botella visible.
- [ ] Plan B local probado.

---

## 12) Plan B (si deploy falla el dia del parcial)
1. Ejecutar backend y frontend en local.
2. Abrir dos navegadores/sesiones.
3. Mostrar flujo completo end-to-end.
4. Mostrar evidencia de tiempo real y KPIs.
5. Tener datos precargados para no perder tiempo.
