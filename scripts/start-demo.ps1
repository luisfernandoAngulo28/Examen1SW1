# ============================================================
#  start-demo.ps1 — Arranque rápido para el día del examen
#  Corre desde la raíz del proyecto: .\scripts\start-demo.ps1
# ============================================================
#  Levanta: MongoDB (local) + Spring Boot backend + Angular frontend
#  Luego en http://localhost:4200 → login → demo
# ============================================================

$ROOT = "d:\Universidad\SW1S12025\PrimerParcialSW1"
$JAVA_HOME = "C:\Users\ferna\.jdks\openjdk-22.0.2"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   ARRANQUE DEMO - SW1 Parcial 2026  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# ─── 1. Configurar JAVA_HOME ─────────────────────────────────────────────────
$env:JAVA_HOME = $JAVA_HOME
$env:Path      = "$JAVA_HOME\bin;$env:Path"
Write-Host "`n✔ JAVA_HOME = $JAVA_HOME" -ForegroundColor Green

# ─── 2. Backend (nueva ventana PowerShell) ───────────────────────────────────
Write-Host "`n► Iniciando Spring Boot backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:JAVA_HOME='$JAVA_HOME'; `$env:Path=`"`$env:JAVA_HOME\bin;`$env:Path`"; Set-Location '$ROOT\workflow-engine'; Write-Host 'Backend iniciando...' -ForegroundColor Cyan; .\mvnw spring-boot:run"
) -WindowStyle Normal

Write-Host "   Ventana backend abierta. Espera ~20s a que diga 'Started WorkflowEngineApplication'" -ForegroundColor DarkYellow

# ─── 3. Frontend Angular (nueva ventana PowerShell) ──────────────────────────
Write-Host "`n► Iniciando Angular frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\frontend-ng'; `$env:NG_CLI_ANALYTICS='false'; & 'C:\nvm4w\nodejs\ng.ps1' serve --port 4200; Read-Host 'Press Enter'"
) -WindowStyle Normal

Write-Host "   Ventana frontend abierta. Espera ~10s a que diga 'Application bundle generation complete'" -ForegroundColor DarkYellow

# ─── 4. Instrucciones ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " CUANDO AMBAS VENTANAS ESTÉN LISTAS: " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ejecuta el seed (solo la primera vez):" -ForegroundColor White
Write-Host "   .\scripts\seed-demo.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Abre el navegador:" -ForegroundColor White
Write-Host "   http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Usuarios para el demo:" -ForegroundColor White
Write-Host "   Admin/Diseñador : diseñador@demo.com  / Admin1234!" -ForegroundColor Green
Write-Host "   Funcionario RRHH: rrhh@demo.com       / Admin1234!" -ForegroundColor Green
Write-Host "   Funcionario Legal: legal@demo.com     / Admin1234!" -ForegroundColor Green
Write-Host "   Finanzas        : finanzas@demo.com   / Admin1234!" -ForegroundColor Green
Write-Host ""
Write-Host "GUIÓN RÁPIDO DEL DEMO:" -ForegroundColor Cyan
Write-Host "  [Tab 1 - diseñador] Login → Dashboard → Nueva Política → Editor (prompt AI + voz)" -ForegroundColor White
Write-Host "  [Tab 1 - diseñador] Políticas existentes → Contratación → Trámites → Iniciar" -ForegroundColor White
Write-Host "  [Tab 2 - rrhh]      Login → Mi Bandeja → Atender tarea → llenar form (🎤 voz)" -ForegroundColor White
Write-Host "  [Tab 1 - diseñador] Monitor → ver evento en vivo / Analytics → bottleneck" -ForegroundColor White
Write-Host ""
Start-Process "http://localhost:4200"
