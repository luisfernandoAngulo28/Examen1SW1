# ============================================================
#  export-xmi-ea.ps1
#  Convierte todos los .puml a XMI para importar en
#  Enterprise Architect (Sparx Systems)
#
#  Uso:
#    cd "d:\Universidad\SW1S12025\PrimerParcialSW1"
#    .\scripts\export-xmi-ea.ps1
# ============================================================

$ROOT    = "d:\Universidad\SW1S12025\PrimerParcialSW1"
$UML_DIR = "$ROOT\docs\uml"
$XMI_DIR = "$ROOT\docs\xmi"
$JAR     = "$ROOT\scripts\plantuml.jar"
$JAVA    = "java"   # ajustar si Java no está en el PATH

# ── 1. Descargar plantuml.jar si no existe ──────────────────
if (-not (Test-Path $JAR)) {
    Write-Host "`n► Descargando plantuml.jar..." -ForegroundColor Yellow
    $url = "https://github.com/plantuml/plantuml/releases/download/v1.2024.3/plantuml-1.2024.3.jar"
    try {
        Invoke-WebRequest -Uri $url -OutFile $JAR -UseBasicParsing
        Write-Host "   ✔ plantuml.jar descargado." -ForegroundColor Green
    } catch {
        Write-Host "   ✘ Error descargando. Descarga manual:" -ForegroundColor Red
        Write-Host "     https://plantuml.com/download" -ForegroundColor Yellow
        Write-Host "     Guarda el .jar como: $JAR" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✔ plantuml.jar encontrado." -ForegroundColor Green
}

# ── 2. Crear carpeta de salida XMI ──────────────────────────
New-Item -ItemType Directory -Force -Path $XMI_DIR | Out-Null
Write-Host "✔ Carpeta XMI: $XMI_DIR" -ForegroundColor Green

# ── 3. Convertir cada .puml → .xmi ─────────────────────────
Write-Host "`n► Generando archivos XMI..." -ForegroundColor Yellow

$pumlFiles = Get-ChildItem -Path $UML_DIR -Filter "*.puml"
$ok = 0
$fail = 0

foreach ($file in $pumlFiles) {
    Write-Host "   Procesando: $($file.Name) ..." -NoNewline

    # Generar XMI (-txmi = XMI 1.1 compatible con EA)
    $output = & $JAVA -jar $JAR -txmi -o $XMI_DIR $file.FullName 2>&1

    $xmiFile = Join-Path $XMI_DIR ($file.BaseName + ".xmi")
    if (Test-Path $xmiFile) {
        Write-Host " ✔" -ForegroundColor Green
        $ok++
    } else {
        Write-Host " ✘ (sin salida XMI — puede ser diagrama no soportado)" -ForegroundColor DarkYellow
        $fail++
    }
}

Write-Host "`n► Resultado: $ok archivos XMI generados" -ForegroundColor Cyan
if ($fail -gt 0) {
    Write-Host "  $fail diagramas sin XMI (ver nota abajo)" -ForegroundColor DarkYellow
}

# ── 4. Mostrar los XMI generados ────────────────────────────
Write-Host "`nArchivos XMI en: $XMI_DIR" -ForegroundColor Cyan
Get-ChildItem -Path $XMI_DIR -Filter "*.xmi" | ForEach-Object {
    Write-Host "  $($_.Name)  [$([math]::Round($_.Length/1KB,1)) KB]"
}

# ── 5. Instrucciones para Enterprise Architect ──────────────
Write-Host @"

====================================================
 IMPORTAR EN ENTERPRISE ARCHITECT (Sparx Systems)
====================================================

OPCION A — Importar XMI (estructura + elementos):
  1. Abre Enterprise Architect
  2. Menu: Publish → Import/Export → Import XMI...
           (o en EA antiguo: File → Import/Export → Import XMI)
  3. Selecciona el archivo .xmi de: $XMI_DIR
  4. Tipo: UML 1.3 / XMI 1.1
  5. Clic Import → los actores y casos de uso aparecen
     en el Project Browser

OPCION B — Importar PNG como imagen de referencia:
  1. Menu: Publish → Import/Export → Import PNG...
     (para usar los diagramas como imagenes de referencia)

NOTA: PlantUML genera XMI 1.1 con la estructura logica
(actores, casos de uso, asociaciones, generalizaciones).
El LAYOUT (posiciones en pantalla) se pierde — EA coloca
los elementos automaticamente, debes reordenarlos.

Los diagramas de CLASES y SECUENCIA se importan mejor.
Los de CASOS DE USO importan actores y relaciones.

"@ -ForegroundColor White

Write-Host "Script finalizado." -ForegroundColor Green
