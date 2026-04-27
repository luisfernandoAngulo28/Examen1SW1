# Credenciales Demo - SW1 2026

**URL Frontend:** http://localhost:4200  
**URL Backend:** http://localhost:8080  
**Contrasena de todos:** `Admin1234!`

## Usuarios

| Email | Contrasena | Rol | Departamento |
|---|---|---|---|
| admin@demo.com | Admin1234! | DESIGNER | - |
| disenador@demo.com | Admin1234! | DESIGNER | Direccion |
| jefe@demo.com | Admin1234! | DESIGNER | Direccion |
| rrhh@demo.com | Admin1234! | OFFICER | Recursos Humanos |
| legal@demo.com | Admin1234! | OFFICER | Legal |
| finanzas@demo.com | Admin1234! | OFFICER | Finanzas |
| ti@demo.com | Admin1234! | OFFICER | TI |

## Politicas activas

| Nombre | Descripcion |
|---|---|
| Contratacion de Personal | Fork/Join + Decision (11 nodos, 12 aristas) |
| Solicitud de Vacaciones | Flujo lineal |
| Aprobacion de Compras | Flujo lineal |

## Casos activos (4)

| Caso | Politica | Asignado a |
|---|---|---|
| Caso 1 | Contratacion de Personal | rrhh@demo.com |
| Caso 2 | Contratacion de Personal #2 | - |
| Caso 3 | Solicitud de Vacaciones | rrhh@demo.com |
| Caso 4 | Aprobacion de Compras | finanzas@demo.com |

## Arrancar el sistema (si se reinicia la PC)

```powershell
# 1. MongoDB (terminal admin)
net start MongoDB

# 2. Backend (en workflow-engine/)
.\mvnw spring-boot:run

# 3. Frontend (en frontend-ng/)
ng serve --port 4200
```
