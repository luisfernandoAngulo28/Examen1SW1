# seed-demo.ps1 - Datos demo para el Parcial SW1 (Abril 2026)
# USO:
#   1) Inicia MongoDB (local)
#   2) Inicia backend: cd workflow-engine; .\mvnw spring-boot:run
#   3) En otra terminal: .\scripts\seed-demo.ps1

$BASE = "http://localhost:8080/api"
$PASS = "Admin1234!"

# --- 0. Esperar a que el backend responda (hasta 60s) ---
Write-Host "`n0. Esperando que el backend este listo..." -ForegroundColor Yellow
$maxWait = 60; $waited = 0; $backendReady = $false
while ($waited -lt $maxWait) {
    try {
        $r = Invoke-WebRequest "$BASE/departments" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $backendReady = $true; break
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode -eq 403) { $backendReady = $true; break }
        Start-Sleep -Seconds 2; $waited += 2; Write-Host "   ... esperando ($waited s)" -ForegroundColor DarkGray
    }
}
if (-not $backendReady) { Write-Host "Backend no responde en $maxWait s. Verifica que Spring Boot este corriendo." -ForegroundColor Red; exit 1 }
Write-Host "   Backend listo." -ForegroundColor Green

function Invoke-Api($method, $path, $body = $null, $token = $null) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{ Uri = "$BASE$path"; Method = $method; Headers = $headers }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 20 -Compress) }
    try {
        return Invoke-RestMethod @params
    } catch {
        $msg = $_.ErrorDetails.Message; if (-not $msg) { $msg = $_.Exception.Message }
        Write-Host "  ERROR $method $path : $msg" -ForegroundColor Red
        return $null
    }
}

function Complete-ContratacionCase($caseObj) {
    $maxIter = 20
    $current = $caseObj
    for ($i = 0; $i -lt $maxIter; $i++) {
        if ($current.status -eq "COMPLETED") { break }
        $pending = $current.tasks | Where-Object { $_.status -eq "PENDING" -or $_.status -eq "IN_PROGRESS" }
        if (-not $pending) { break }
        foreach ($t in $pending) {
            $isDecision = ($t.node -and $t.node.nodeType -eq "DECISION")
            if ($isDecision) {
                $current = Invoke-Api POST "/cases/tasks/$($t.id)/complete" @{ chosenEdgeLabel="Aprobado" } $tk
            } else {
                $current = Invoke-Api POST "/cases/tasks/$($t.id)/complete" @{} $tk
            }
            if (-not $current) { return $null }
            if ($current.status -eq "COMPLETED") { return $current }
        }
    }
    return $current
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   SEED DEMO - Workflow Engine (SW1 2026)   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# --- RESET: Limpiar datos anteriores ---
Write-Host "`nRESET. Limpiando datos anteriores..." -ForegroundColor Magenta

# Para borrar cases/users/departments/policies necesitamos token de ADMIN
# Intentamos login primero (puede que ya exista el admin)
$existAdmin = Invoke-Api POST "/auth/login" @{ email="admin@demo.com"; password=$PASS }
if ($existAdmin -and $existAdmin.token) {
    $tkReset = $existAdmin.token
    # Borrar todos los casos
    $allCases = Invoke-Api GET "/cases" -token $tkReset
    if ($allCases) {
        foreach ($c in $allCases) {
            Invoke-Api DELETE "/cases/$($c.id)" -token $tkReset | Out-Null
        }
        Write-Host "   OK $($allCases.Count) casos eliminados" -ForegroundColor Green
    }
    # Borrar todas las politicas
    $allPolicies = Invoke-Api GET "/policies" -token $tkReset
    if ($allPolicies) {
        foreach ($p in $allPolicies) {
            Invoke-Api DELETE "/policies/$($p.id)" -token $tkReset | Out-Null
        }
        Write-Host "   OK $($allPolicies.Count) politicas eliminadas" -ForegroundColor Green
    }
    # Borrar todos los departamentos
    $allDepts = Invoke-Api GET "/departments" -token $tkReset
    if ($allDepts) {
        foreach ($dep in $allDepts) {
            Invoke-Api DELETE "/departments/$($dep.id)" -token $tkReset | Out-Null
        }
        Write-Host "   OK $($allDepts.Count) departamentos eliminados" -ForegroundColor Green
    }
    # Borrar todos los usuarios
    Invoke-Api DELETE "/auth/users" -token $tkReset | Out-Null
    Write-Host "   OK Usuarios eliminados" -ForegroundColor Green
} else {
    Write-Host "   No habia datos anteriores (primera ejecucion)" -ForegroundColor DarkYellow
}

# --- 1. Admin ---
Write-Host "`n1. Registrando ADMIN..." -ForegroundColor Yellow
$admin = Invoke-Api POST "/auth/register" @{ email="admin@demo.com"; name="Admin SW1"; password=$PASS; role="DESIGNER" }
if (-not $admin) { $admin = Invoke-Api POST "/auth/login" @{ email="admin@demo.com"; password=$PASS } }
$tk = $admin.token
if (-not $tk) { Write-Host "No se pudo obtener token. Esta corriendo Spring Boot?" -ForegroundColor Red; exit 1 }
Write-Host "   OK Token obtenido" -ForegroundColor Green

# --- 2. Departamentos ---
Write-Host "`n2. Creando departamentos..." -ForegroundColor Yellow
$deptNames = @("Recursos Humanos","Legal","Finanzas","TI","Direccion","Logistica")
$depts = @{}
foreach ($name in $deptNames) {
    $d = Invoke-Api POST "/departments" @{ name=$name } $tk
    if ($d -and $d.id) {
        $depts[$name] = $d.id
        Write-Host "   OK $name" -ForegroundColor Green
    } else {
        $all = Invoke-Api GET "/departments" -token $tk
        $found = $all | Where-Object { $_.name -eq $name }
        if ($found) { $depts[$name] = $found.id; Write-Host "   ~ $name (existente)" -ForegroundColor DarkYellow }
    }
}

# --- 3. Usuarios ---
Write-Host "`n3. Registrando usuarios..." -ForegroundColor Yellow
$usersSpec = @(
    @{ email="disenador@demo.com"; name="Diana Disenadora"; role="DESIGNER";  dept="Direccion" },
    @{ email="jefe@demo.com";      name="Jorge Jefe";       role="DESIGNER";  dept="Direccion" },
    @{ email="rrhh@demo.com";      name="Rosa RRHH";        role="OFFICER";   dept="Recursos Humanos" },
    @{ email="legal@demo.com";     name="Luis Legal";       role="OFFICER";   dept="Legal" },
    @{ email="finanzas@demo.com";  name="Felipe Finanzas";  role="OFFICER";   dept="Finanzas" },
    @{ email="ti@demo.com";        name="Tania TI";         role="OFFICER";   dept="TI" },
    @{ email="cliente@demo.com";   name="Carlos Cliente";   role="CLIENT";    dept=$null }
)
$userIds = @{}
foreach ($u in $usersSpec) {
    $body = @{ email=$u.email; name=$u.name; password=$PASS; role=$u.role }
    if ($u.dept) { $body["departmentId"] = $depts[$u.dept] }
    $res = Invoke-Api POST "/auth/register" $body $tk
    if (-not $res) { $res = Invoke-Api POST "/auth/login" @{ email=$u.email; password=$PASS } }
    if ($res -and $res.id) {
        $userIds[$u.email] = $res.id
        Write-Host "   OK $($u.name) [$($u.role)]" -ForegroundColor Green
    }
}

# --- 4. Politica 1: Contratacion de Personal ---
Write-Host "`n4. Politica: Contratacion de Personal..." -ForegroundColor Yellow
$nI  = [guid]::NewGuid().ToString(); $nSol = [guid]::NewGuid().ToString()
$nRev= [guid]::NewGuid().ToString(); $nDec = [guid]::NewGuid().ToString()
$nAp = [guid]::NewGuid().ToString(); $nRej = [guid]::NewGuid().ToString()
$nFk = [guid]::NewGuid().ToString(); $nCon = [guid]::NewGuid().ToString()
$nInd= [guid]::NewGuid().ToString(); $nJn  = [guid]::NewGuid().ToString()
$nFn = [guid]::NewGuid().ToString()

$pol1 = Invoke-Api POST "/policies" @{ name="Contratacion de Personal"; status="ACTIVE" } $tk
$p1Id = $pol1.id; Write-Host "   Politica id: $p1Id" -ForegroundColor Green

Invoke-Api PUT "/policies/$p1Id/graph" @{
    nodes = @(
        @{ id=$nI;   nodeType="INITIAL";  title="Inicio";               departmentId=$depts["Direccion"];       positionX=400; positionY=50 },
        @{ id=$nSol; nodeType="ACTION";   title="Solicitud de Puesto";  departmentId=$depts["Recursos Humanos"]; positionX=400; positionY=160;
           formTemplate=@{ fields=@( @{name="candidato";label="Candidato";type="text";required=$true}, @{name="puesto";label="Puesto";type="text";required=$true}, @{name="experiencia";label="Anos exp.";type="number";required=$true} ) } },
        @{ id=$nRev; nodeType="ACTION";   title="Revision de Perfil";   departmentId=$depts["Recursos Humanos"]; positionX=400; positionY=290;
           formTemplate=@{ fields=@( @{name="puntuacion";label="Puntuacion 1-10";type="number";required=$true}, @{name="comentarios";label="Comentarios";type="textarea";required=$false} ) } },
        @{ id=$nDec; nodeType="DECISION"; title="Perfil Aprobado?";     departmentId=$depts["Direccion"];       positionX=400; positionY=420 },
        @{ id=$nAp;  nodeType="ACTION";   title="Notif. Aprobado";      departmentId=$depts["Recursos Humanos"]; positionX=200; positionY=540 },
        @{ id=$nRej; nodeType="ACTION";   title="Notif. Rechazado";     departmentId=$depts["Recursos Humanos"]; positionX=600; positionY=540 },
        @{ id=$nFk;  nodeType="FORK";     title="Fork Paralelo";        departmentId=$depts["Legal"];           positionX=200; positionY=660 },
        @{ id=$nCon; nodeType="ACTION";   title="Firma de Contrato";    departmentId=$depts["Legal"];           positionX=80;  positionY=790;
           formTemplate=@{ fields=@( @{name="tipo";label="Tipo contrato";type="select";required=$true;options=@("Indefinido","Plazo Fijo")}, @{name="salario";label="Salario";type="number";required=$true} ) } },
        @{ id=$nInd; nodeType="ACTION";   title="Induccion";            departmentId=$depts["TI"];              positionX=320; positionY=790;
           formTemplate=@{ fields=@( @{name="equipo";label="Equipo asignado";type="text";required=$true} ) } },
        @{ id=$nJn;  nodeType="JOIN";     title="Join";                 departmentId=$depts["Direccion"];       positionX=200; positionY=920 },
        @{ id=$nFn;  nodeType="FINAL";    title="Fin";                  departmentId=$depts["Direccion"];       positionX=400; positionY=1020 }
    )
    edges = @(
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nI;   toNodeId=$nSol; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nSol; toNodeId=$nRev; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nRev; toNodeId=$nDec; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nDec; toNodeId=$nAp;  flowType="CONDITIONAL"; conditionLabel="Aprobado" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nDec; toNodeId=$nRej; flowType="CONDITIONAL"; conditionLabel="Rechazado" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nAp;  toNodeId=$nFk;  flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nRej; toNodeId=$nFn;  flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nFk;  toNodeId=$nCon; flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nFk;  toNodeId=$nInd; flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nCon; toNodeId=$nJn;  flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nInd; toNodeId=$nJn;  flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$nJn;  toNodeId=$nFn;  flowType="SEQUENTIAL" }
    )
} $tk | Out-Null
Write-Host "   OK Grafo guardado (11 nodos, 12 aristas)" -ForegroundColor Green

# --- 5. Politica 2: Solicitud de Vacaciones ---
Write-Host "`n5. Politica: Solicitud de Vacaciones..." -ForegroundColor Yellow
$v0=[guid]::NewGuid().ToString(); $v1=[guid]::NewGuid().ToString(); $v2=[guid]::NewGuid().ToString()
$v3=[guid]::NewGuid().ToString(); $v4=[guid]::NewGuid().ToString(); $v5=[guid]::NewGuid().ToString()

$pol2 = Invoke-Api POST "/policies" @{ name="Solicitud de Vacaciones"; status="ACTIVE" } $tk
$p2Id = $pol2.id; Write-Host "   Politica id: $p2Id" -ForegroundColor Green

Invoke-Api PUT "/policies/$p2Id/graph" @{
    nodes = @(
        @{ id=$v0; nodeType="INITIAL"; title="Inicio";                   departmentId=$depts["Recursos Humanos"]; positionX=300; positionY=50 },
        @{ id=$v1; nodeType="ACTION";  title="Solicitud de Permiso";     departmentId=$depts["Recursos Humanos"]; positionX=300; positionY=150;
           formTemplate=@{ fields=@( @{name="fechaDesde";label="Desde";type="date";required=$true}, @{name="fechaHasta";label="Hasta";type="date";required=$true}, @{name="motivo";label="Motivo";type="textarea";required=$true} ) } },
        @{ id=$v2; nodeType="ACTION";  title="Revision Disponibilidad";  departmentId=$depts["Recursos Humanos"]; positionX=300; positionY=280;
           formTemplate=@{ fields=@( @{name="diasDisp";label="Dias disponibles";type="number";required=$true}, @{name="conflicto";label="Conflicto?";type="select";required=$true;options=@("No","Si")} ) } },
        @{ id=$v3; nodeType="ACTION";  title="Aprobacion Jefe Directo";  departmentId=$depts["Direccion"];        positionX=300; positionY=410;
           formTemplate=@{ fields=@( @{name="decision";label="Decision";type="select";required=$true;options=@("Aprobado","Rechazado")}, @{name="obs";label="Observaciones";type="textarea";required=$false} ) } },
        @{ id=$v4; nodeType="ACTION";  title="Notificacion al Empleado"; departmentId=$depts["Recursos Humanos"]; positionX=300; positionY=540 },
        @{ id=$v5; nodeType="FINAL";   title="Fin";                      departmentId=$depts["Recursos Humanos"]; positionX=300; positionY=640 }
    )
    edges = @(
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$v0; toNodeId=$v1; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$v1; toNodeId=$v2; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$v2; toNodeId=$v3; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$v3; toNodeId=$v4; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$v4; toNodeId=$v5; flowType="SEQUENTIAL" }
    )
} $tk | Out-Null
Write-Host "   OK Grafo guardado" -ForegroundColor Green

# --- 6. Politica 3: Aprobacion de Compras ---
Write-Host "`n6. Politica: Aprobacion de Compras..." -ForegroundColor Yellow
$c0=[guid]::NewGuid().ToString(); $c1=[guid]::NewGuid().ToString(); $c2=[guid]::NewGuid().ToString()
$c3=[guid]::NewGuid().ToString(); $c4=[guid]::NewGuid().ToString()

$pol3 = Invoke-Api POST "/policies" @{ name="Aprobacion de Compras"; status="ACTIVE" } $tk
$p3Id = $pol3.id; Write-Host "   Politica id: $p3Id" -ForegroundColor Green

Invoke-Api PUT "/policies/$p3Id/graph" @{
    nodes = @(
        @{ id=$c0; nodeType="INITIAL"; title="Inicio";                 departmentId=$depts["Finanzas"];   positionX=300; positionY=50 },
        @{ id=$c1; nodeType="ACTION";  title="Solicitud de Compra";    departmentId=$depts["Finanzas"];   positionX=300; positionY=150;
           formTemplate=@{ fields=@( @{name="item";label="Articulo";type="text";required=$true}, @{name="monto";label="Monto";type="number";required=$true}, @{name="proveedor";label="Proveedor";type="text";required=$true} ) } },
        @{ id=$c2; nodeType="ACTION";  title="Validacion Presupuesto"; departmentId=$depts["Finanzas"];   positionX=300; positionY=280;
           formTemplate=@{ fields=@( @{name="presupDisp";label="Presupuesto disponible";type="number";required=$true}, @{name="aprobado";label="Hay presupuesto?";type="select";required=$true;options=@("Si","No")} ) } },
        @{ id=$c3; nodeType="ACTION";  title="Aprobacion Direccion";   departmentId=$depts["Direccion"];  positionX=300; positionY=410;
           formTemplate=@{ fields=@( @{name="decision";label="Decision";type="select";required=$true;options=@("Aprobado","Rechazado")} ) } },
        @{ id=$c4; nodeType="FINAL";   title="Fin";                    departmentId=$depts["Direccion"];  positionX=300; positionY=520 }
    )
    edges = @(
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$c0; toNodeId=$c1; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$c1; toNodeId=$c2; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$c2; toNodeId=$c3; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$c3; toNodeId=$c4; flowType="SEQUENTIAL" }
    )
} $tk | Out-Null
Write-Host "   OK Grafo guardado" -ForegroundColor Green

# --- 7. Casos Demo ---
Write-Host "`n7. Iniciando casos demo..." -ForegroundColor Yellow

# --- 7a. Login como CLIENTE para crear sus casos (clientId auto-asignado) ---
Write-Host "`n7a. Creando casos para cliente@demo.com..." -ForegroundColor Yellow
$clientLogin = Invoke-Api POST "/auth/login" @{ email="cliente@demo.com"; password=$PASS }
$tkClient    = $clientLogin.token
if ($tkClient) {
    # Caso 1 del cliente: Solicitud de Vacaciones (flujo sencillo, ideal para demo)
    $caseC1 = Invoke-Api POST "/cases" @{ policyId=$p2Id } $tkClient
    if ($caseC1 -and $caseC1.id) {
        Write-Host "   OK Caso cliente 1 (Vacaciones): $($caseC1.id)" -ForegroundColor Green
        # Avanzar 1 tarea para que se vea en movimiento
        $tC1 = $caseC1.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
        if ($tC1 -and $userIds["rrhh@demo.com"]) {
            Invoke-Api PATCH "/cases/tasks/$($tC1.id)/assign" @{ userId=$userIds["rrhh@demo.com"] } $tk | Out-Null
            Write-Host "   OK Tarea asignada a Rosa RRHH" -ForegroundColor Green
        }
    }
    # Caso 2 del cliente: Aprobacion de Compras
    $caseC2 = Invoke-Api POST "/cases" @{ policyId=$p3Id } $tkClient
    if ($caseC2 -and $caseC2.id) {
        Write-Host "   OK Caso cliente 2 (Compras): $($caseC2.id)" -ForegroundColor Green
    }
    # Caso 3 del cliente: Contratacion — ya completado (para mostrar historial)
    $caseC3 = Invoke-Api POST "/cases" @{ policyId=$p1Id } $tkClient
    if ($caseC3 -and $caseC3.id) {
        $doneC3 = Complete-ContratacionCase $caseC3
        if ($doneC3 -and $doneC3.status -eq "COMPLETED") {
            Write-Host "   OK Caso cliente 3 (Contratacion completada): $($doneC3.id)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   WARN No se pudo obtener token de cliente@demo.com" -ForegroundColor DarkYellow
}

$case1 = Invoke-Api POST "/cases" @{ policyId=$p1Id } $tk
if ($case1 -and $case1.id) {
    Write-Host "   Caso 1 (Contratacion): $($case1.id)" -ForegroundColor Green
    $t1 = $case1.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($t1 -and $userIds["rrhh@demo.com"]) {
        Invoke-Api PATCH "/cases/tasks/$($t1.id)/assign" @{ userId=$userIds["rrhh@demo.com"] } $tk | Out-Null
        Write-Host "   OK Tarea asignada a Rosa RRHH" -ForegroundColor Green
    }
}

$case2 = Invoke-Api POST "/cases" @{ policyId=$p1Id } $tk
if ($case2) { Write-Host "   Caso 2 (Contratacion #2): $($case2.id)" -ForegroundColor Green }

$case3 = Invoke-Api POST "/cases" @{ policyId=$p2Id } $tk
if ($case3 -and $case3.id) {
    Write-Host "   Caso 3 (Vacaciones): $($case3.id)" -ForegroundColor Green
    $t3 = $case3.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($t3 -and $userIds["rrhh@demo.com"]) {
        Invoke-Api PATCH "/cases/tasks/$($t3.id)/assign" @{ userId=$userIds["rrhh@demo.com"] } $tk | Out-Null
        Write-Host "   OK Tarea asignada a Rosa RRHH" -ForegroundColor Green
    }
}

$case4 = Invoke-Api POST "/cases" @{ policyId=$p3Id } $tk
if ($case4 -and $case4.id) {
    Write-Host "   Caso 4 (Compras): $($case4.id)" -ForegroundColor Green
    $t4 = $case4.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($t4 -and $userIds["finanzas@demo.com"]) {
        Invoke-Api PATCH "/cases/tasks/$($t4.id)/assign" @{ userId=$userIds["finanzas@demo.com"] } $tk | Out-Null
        Write-Host "   OK Tarea asignada a Felipe Finanzas" -ForegroundColor Green
    }
}

# --- 8. Casos historicos completados (para analytics) -----------------------
Write-Host "`n8. Creando casos historicos completados (analytics)..." -ForegroundColor Yellow

# Helper: completa todas las tareas PENDING de un caso puramente secuencial (sin Decision ni Fork)
function Complete-LinearCase($caseObj) {
    $maxIter = 15
    $current = $caseObj
    for ($i = 0; $i -lt $maxIter; $i++) {
        if ($current.status -eq "COMPLETED") { break }
        $pending = $current.tasks | Where-Object { $_.status -eq "PENDING" }
        if (-not $pending) { break }
        foreach ($t in $pending) {
            $current = Invoke-Api POST "/cases/tasks/$($t.id)/complete" @{} $tk
            if (-not $current) { return $null }
            if ($current.status -eq "COMPLETED") { break }
        }
    }
    return $current
}

# Vacaciones: 3 casos completados
for ($i = 1; $i -le 3; $i++) {
    $h = Invoke-Api POST "/cases" @{ policyId=$p2Id } $tk
    if ($h) {
        $done = Complete-LinearCase $h
        if ($done -and $done.status -eq "COMPLETED") {
            Write-Host "   OK Vacaciones historico $i completado: $($done.id)" -ForegroundColor Green
        } else {
            Write-Host "   WARN Vacaciones historico $i - status: $($done.status)" -ForegroundColor DarkYellow
        }
    }
}

# Compras: 2 casos completados
for ($i = 1; $i -le 2; $i++) {
    $h = Invoke-Api POST "/cases" @{ policyId=$p3Id } $tk
    if ($h) {
        $done = Complete-LinearCase $h
        if ($done -and $done.status -eq "COMPLETED") {
            Write-Host "   OK Compras historico $i completado: $($done.id)" -ForegroundColor Green
        } else {
            Write-Host "   WARN Compras historico $i - status: $($done.status)" -ForegroundColor DarkYellow
        }
    }
}

for ($i = 1; $i -le 2; $i++) {
    $h = Invoke-Api POST "/cases" @{ policyId=$p1Id } $tk
    if ($h) {
        $done = Complete-ContratacionCase $h
        if ($done -and $done.status -eq "COMPLETED") {
            Write-Host "   OK Contratacion historico $i completado: $($done.id)" -ForegroundColor Green
        } else {
            Write-Host "   WARN Contratacion historico $i - status: $($done.status)" -ForegroundColor DarkYellow
        }
    }
}

# --- 9. Politica 4: Revision de Contratos (flujo ITERATIVO) -----------------
Write-Host "`n9. Politica: Revision de Contratos (iterativo)..." -ForegroundColor Yellow
$rI  = [guid]::NewGuid().ToString(); $rRed = [guid]::NewGuid().ToString()
$rDec= [guid]::NewGuid().ToString(); $rFir = [guid]::NewGuid().ToString()
$rFn = [guid]::NewGuid().ToString()

$pol4 = Invoke-Api POST "/policies" @{ name="Revision de Contratos"; status="ACTIVE" } $tk
$p4Id = $pol4.id; Write-Host "   Politica id: $p4Id" -ForegroundColor Green

Invoke-Api PUT "/policies/$p4Id/graph" @{
    nodes = @(
        @{ id=$rI;   nodeType="INITIAL";   title="Inicio";              departmentId=$depts["Legal"];     positionX=300; positionY=50 },
        @{ id=$rRed; nodeType="ACTION";    title="Redactar Borrador";   departmentId=$depts["Legal"];     positionX=300; positionY=160;
           formTemplate=@{ fields=@(
               @{name="titulo";  label="Titulo del contrato"; type="text";   required=$true},
               @{name="version"; label="Numero de version";  type="number"; required=$true},
               @{name="observ";  label="Observaciones";       type="textarea"; required=$false}
           ) } },
        @{ id=$rDec; nodeType="DECISION";  title="Requiere Correcciones?"; departmentId=$depts["Legal"];  positionX=300; positionY=300 },
        @{ id=$rFir; nodeType="ACTION";    title="Firmar y Archivar";   departmentId=$depts["Legal"];     positionX=300; positionY=430;
           formTemplate=@{ fields=@(
               @{name="firmante"; label="Firmante"; type="text";   required=$true},
               @{name="fecha";    label="Fecha";    type="date";   required=$true}
           ) } },
        @{ id=$rFn;  nodeType="FINAL";     title="Fin";                 departmentId=$depts["Legal"];     positionX=300; positionY=560 }
    )
    edges = @(
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$rI;   toNodeId=$rRed; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$rRed; toNodeId=$rDec; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$rDec; toNodeId=$rRed; flowType="ITERATIVE";   conditionLabel="Si, Corregir" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$rDec; toNodeId=$rFir; flowType="CONDITIONAL"; conditionLabel="No, Aprobar" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$rFir; toNodeId=$rFn;  flowType="SEQUENTIAL" }
    )
} $tk | Out-Null
Write-Host "   OK Grafo iterativo guardado (5 nodos, 5 aristas)" -ForegroundColor Green

# Caso activo: revision con 1 iteracion ya hecha, esperando segunda decision
$caseRev = Invoke-Api POST "/cases" @{ policyId=$p4Id } $tk
if ($caseRev -and $caseRev.id) {
    Write-Host "   Caso Revision activo: $($caseRev.id)" -ForegroundColor Green
    # Completar primer "Redactar Borrador"
    $tRed = $caseRev.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($tRed) {
        $caseRev = Invoke-Api POST "/cases/tasks/$($tRed.id)/complete" @{} $tk
        Write-Host "   OK Borrador v1 completado" -ForegroundColor Green
    }
    # Decision: Corregir (back-edge - muestra flujo iterativo)
    $tDec = $caseRev.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($tDec) {
        $caseRev = Invoke-Api POST "/cases/tasks/$($tDec.id)/complete" @{ chosenEdgeLabel="Si, Corregir" } $tk
        Write-Host "   OK Decision -> Corregir (iteracion 1 activada)" -ForegroundColor Green
        # Asignar la 2da iteracion a Luis Legal para demo
        $tRed2 = $caseRev.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
        if ($tRed2 -and $userIds["legal@demo.com"]) {
            Invoke-Api PATCH "/cases/tasks/$($tRed2.id)/assign" @{ userId=$userIds["legal@demo.com"] } $tk | Out-Null
            Write-Host "   OK Tarea v2 asignada a Luis Legal" -ForegroundColor Green
        }
    }
}

# Casos historicos de Revision de Contratos (aprobados directamente)
for ($i = 1; $i -le 3; $i++) {
    $h = Invoke-Api POST "/cases" @{ policyId=$p4Id } $tk
    if ($h) {
        # Redactar, luego decision "No, Aprobar", luego firmar
        $t1 = $h.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
        if ($t1) { $h = Invoke-Api POST "/cases/tasks/$($t1.id)/complete" @{} $tk }
        $t2 = $h.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
        if ($t2) { $h = Invoke-Api POST "/cases/tasks/$($t2.id)/complete" @{ chosenEdgeLabel="No, Aprobar" } $tk }
        $t3 = $h.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
        if ($t3) { $h = Invoke-Api POST "/cases/tasks/$($t3.id)/complete" @{} $tk }
        if ($h -and $h.status -eq "COMPLETED") {
            Write-Host "   OK Revision historico $i completado: $($h.id)" -ForegroundColor Green
        } else {
            Write-Host "   WARN Revision historico $i - status: $($h.status)" -ForegroundColor DarkYellow
        }
    }
}

# --- 10. Politica Estrella: Solicitud de Credito Empresarial (ejemplo de clase) ---
Write-Host "`n10. Politica ESTRELLA: Solicitud de Credito Empresarial..." -ForegroundColor Magenta
Write-Host "    (Ejemplo exacto del diagrama de clase: ITERATIVO + FORK/JOIN + ALTERNATIVO)" -ForegroundColor DarkMagenta

# Asegurar departamentos necesarios
$deptAtC   = $depts["Atencion al Cliente"]
$deptValT  = $depts["Validacion Tecnica"]
$deptLegal = $depts["Legal"]
$deptRiesg = $depts["Riesgos"]
$deptDir   = $depts["Direccion"]

# Si no existen crearlos
if (-not $deptAtC) {
    $d = Invoke-Api POST "/departments" @{ name="Atencion al Cliente" } $tk
    if ($d -and $d.id) { $depts["Atencion al Cliente"] = $d.id; $deptAtC = $d.id; Write-Host "   OK Atencion al Cliente" -ForegroundColor Green }
}
if (-not $deptValT) {
    $d = Invoke-Api POST "/departments" @{ name="Validacion Tecnica" } $tk
    if ($d -and $d.id) { $depts["Validacion Tecnica"] = $d.id; $deptValT = $d.id; Write-Host "   OK Validacion Tecnica" -ForegroundColor Green }
}
if (-not $deptRiesg) {
    $d = Invoke-Api POST "/departments" @{ name="Riesgos" } $tk
    if ($d -and $d.id) { $depts["Riesgos"] = $d.id; $deptRiesg = $d.id; Write-Host "   OK Riesgos" -ForegroundColor Green }
}
if (-not $deptDir) {
    $d = Invoke-Api POST "/departments" @{ name="Direccion" } $tk
    if ($d -and $d.id) { $depts["Direccion"] = $d.id; $deptDir = $d.id; Write-Host "   OK Direccion" -ForegroundColor Green }
}
# Legal y Riesgos ya existen en $depts

# IDs de nodos
$cI    = [guid]::NewGuid().ToString()  # INICIO
$cRec  = [guid]::NewGuid().ToString()  # Recepcion de solicitud
$cVer  = [guid]::NewGuid().ToString()  # Verificacion de datos
$cDat  = [guid]::NewGuid().ToString()  # DECISION: Datos completos?
$cNot  = [guid]::NewGuid().ToString()  # Notificar al cliente (iterativo)
$cFork = [guid]::NewGuid().ToString()  # FORK paralelo
$cLeg  = [guid]::NewGuid().ToString()  # Analisis legal
$cRsk  = [guid]::NewGuid().ToString()  # Evaluacion de riesgo
$cHis  = [guid]::NewGuid().ToString()  # Revision de historial
$cJoin = [guid]::NewGuid().ToString()  # JOIN paralelo
$cMon  = [guid]::NewGuid().ToString()  # DECISION: Monto > 50000?
$cADir = [guid]::NewGuid().ToString()  # Aprobacion Direccion
$cARsk = [guid]::NewGuid().ToString()  # Aprobacion Riesgos
$cApro = [guid]::NewGuid().ToString()  # DECISION: Aprobado?
$cConv = [guid]::NewGuid().ToString()  # Convergencia post-aprobacion (join alternativo)
$cCont = [guid]::NewGuid().ToString()  # Generacion de contrato
$cFirm = [guid]::NewGuid().ToString()  # Firma y desembolso
$cRej  = [guid]::NewGuid().ToString()  # Notificar rechazo
$cFin1 = [guid]::NewGuid().ToString()  # FIN (aprobado)
$cFin2 = [guid]::NewGuid().ToString()  # FIN (rechazado)

$polCred = Invoke-Api POST "/policies" @{ name="Solicitud de Credito Empresarial"; description="Ejemplo del diagrama de clase: iterativo + fork/join paralelo + alternativo"; status="ACTIVE" } $tk
$pCredId = $polCred.id
Write-Host "   Politica id: $pCredId" -ForegroundColor Green

Invoke-Api PUT "/policies/$pCredId/graph" @{
    nodes = @(
        @{ id=$cI;    nodeType="INITIAL";  title="Inicio";                   positionX=400; positionY=20 },
        @{ id=$cRec;  nodeType="ACTION";   title="Recepcion de solicitud";   departmentId=$deptAtC;  positionX=400; positionY=130;
           formTemplate=@{ fields=@(
               @{name="solicitante"; label="Nombre del solicitante"; type="text";   required=$true},
               @{name="empresa";     label="Razon social";           type="text";   required=$true},
               @{name="monto";       label="Monto solicitado (USD)"; type="number"; required=$true},
               @{name="descripcion"; label="Descripcion del credito"; type="textarea"; required=$false}
           ) } },
        @{ id=$cVer;  nodeType="ACTION";   title="Verificacion de datos";    departmentId=$deptValT; positionX=400; positionY=250;
           formTemplate=@{ fields=@(
               @{name="ci";          label="CI / NIT verificado";    type="text";     required=$true},
               @{name="documentos";  label="Documentos recibidos";   type="textarea"; required=$true},
               @{name="completo";    label="Datos completos";        type="checkbox"; required=$true}
           ) } },
        @{ id=$cDat;  nodeType="DECISION"; title="Datos completos?";          departmentId=$deptValT; positionX=400; positionY=370 },
        @{ id=$cNot;  nodeType="ACTION";   title="Notificar al cliente";      departmentId=$deptAtC;  positionX=650; positionY=370;
           formTemplate=@{ fields=@(
               @{name="motivo";   label="Motivo de devolucion"; type="textarea"; required=$true},
               @{name="contacto"; label="Contacto notificado";  type="text";     required=$true}
           ) } },
        @{ id=$cFork; nodeType="FORK";     title="Fork Analisis Paralelo";   positionX=400; positionY=490 },
        @{ id=$cLeg;  nodeType="ACTION";   title="Analisis legal";            departmentId=$deptLegal; positionX=150; positionY=610;
           formTemplate=@{ fields=@(
               @{name="resultado"; label="Resultado del analisis legal"; type="textarea"; required=$true},
               @{name="riesgo";    label="Nivel de riesgo legal";        type="select";   required=$true; options=@("Bajo","Medio","Alto")}
           ) } },
        @{ id=$cRsk;  nodeType="ACTION";   title="Evaluacion de riesgo";     departmentId=$deptRiesg; positionX=400; positionY=610;
           formTemplate=@{ fields=@(
               @{name="score";      label="Score de riesgo (0-100)"; type="number";   required=$true},
               @{name="categoria";  label="Categoria";               type="select";   required=$true; options=@("Verde","Amarillo","Rojo")},
               @{name="observ";     label="Observaciones";            type="textarea"; required=$false}
           ) } },
        @{ id=$cHis;  nodeType="ACTION";   title="Revision de historial";    departmentId=$deptValT;  positionX=650; positionY=610;
           formTemplate=@{ fields=@(
               @{name="historial";  label="Historial crediticio";    type="textarea"; required=$true},
               @{name="deudas";     label="Deudas vigentes";         type="number";   required=$true},
               @{name="calificacion"; label="Calificacion";          type="select";   required=$true; options=@("Excelente","Bueno","Regular","Malo")}
           ) } },
        @{ id=$cJoin; nodeType="JOIN";     title="Join Analisis Completo";   positionX=400; positionY=740 },
        @{ id=$cMon;  nodeType="DECISION"; title="Monto mayor a 50000?";     departmentId=$deptRiesg; positionX=400; positionY=860 },
        @{ id=$cADir; nodeType="ACTION";   title="Aprobacion Direccion";     departmentId=$deptDir;   positionX=200; positionY=980;
           formTemplate=@{ fields=@(
               @{name="decision";   label="Decision de Direccion";  type="select";   required=$true; options=@("Aprobado","Rechazado","Condicionado")},
               @{name="condicion";  label="Condicion (si aplica)";  type="textarea"; required=$false},
               @{name="firma";      label="Firmado por";            type="text";     required=$true}
           ) } },
        @{ id=$cARsk; nodeType="ACTION";   title="Aprobacion Riesgos";       departmentId=$deptRiesg; positionX=600; positionY=980;
           formTemplate=@{ fields=@(
               @{name="decision";   label="Decision de Riesgos";   type="select";   required=$true; options=@("Aprobado","Rechazado")},
               @{name="limite";     label="Limite aprobado (USD)"; type="number";   required=$false},
               @{name="plazo";      label="Plazo (meses)";         type="number";   required=$false}
           ) } },
        @{ id=$cApro; nodeType="DECISION"; title="Aprobado?";                departmentId=$deptDir;   positionX=400; positionY=1100 },
        @{ id=$cCont; nodeType="ACTION";   title="Generacion de contrato";   departmentId=$deptLegal; positionX=250; positionY=1220;
           formTemplate=@{ fields=@(
               @{name="numContrato"; label="Numero de contrato"; type="text";   required=$true},
               @{name="clausulas";   label="Clausulas especiales"; type="textarea"; required=$false},
               @{name="fechaInicio"; label="Fecha de inicio";    type="date";   required=$true}
           ) } },
        @{ id=$cFirm; nodeType="ACTION";   title="Firma y desembolso";       departmentId=$deptDir;   positionX=250; positionY=1340;
           formTemplate=@{ fields=@(
               @{name="firmante";    label="Firmado por cliente";  type="text";   required=$true},
               @{name="cuenta";      label="Cuenta de desembolso"; type="text";   required=$true},
               @{name="fechaDesemb"; label="Fecha de desembolso";  type="date";   required=$true}
           ) } },
        @{ id=$cRej;  nodeType="ACTION";   title="Notificar rechazo";        departmentId=$deptAtC;   positionX=600; positionY=1220;
           formTemplate=@{ fields=@(
               @{name="motivo";    label="Motivo de rechazo"; type="textarea"; required=$true},
               @{name="contacto";  label="Contacto notificado"; type="text";   required=$true}
           ) } },
        @{ id=$cFin1; nodeType="FINAL";    title="Fin - Credito Aprobado";   positionX=250; positionY=1460 },
        @{ id=$cFin2; nodeType="FINAL";    title="Fin - Credito Rechazado";  positionX=600; positionY=1340 }
    )
    edges = @(
        # Flujo principal inicial
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cI;    toNodeId=$cRec;  flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cRec;  toNodeId=$cVer;  flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cVer;  toNodeId=$cDat;  flowType="SEQUENTIAL" },
        # ITERATIVO: datos incompletos -> notificar -> volver a verificar
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cDat;  toNodeId=$cNot;  flowType="CONDITIONAL"; conditionLabel="No" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cNot;  toNodeId=$cVer;  flowType="ITERATIVE";   conditionLabel="Reintentar" },
        # PARALELO: datos completos -> fork
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cDat;  toNodeId=$cFork; flowType="CONDITIONAL"; conditionLabel="Si" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cFork; toNodeId=$cLeg;  flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cFork; toNodeId=$cRsk;  flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cFork; toNodeId=$cHis;  flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cLeg;  toNodeId=$cJoin; flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cRsk;  toNodeId=$cJoin; flowType="PARALLEL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cHis;  toNodeId=$cJoin; flowType="PARALLEL" },
        # ALTERNATIVO: segun monto
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cJoin; toNodeId=$cMon;  flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cMon;  toNodeId=$cADir; flowType="CONDITIONAL"; conditionLabel="Si, mayor a 50000" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cMon;  toNodeId=$cARsk; flowType="CONDITIONAL"; conditionLabel="No, menor o igual" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cADir; toNodeId=$cApro; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cARsk; toNodeId=$cApro; flowType="SEQUENTIAL" },
        # Decision final
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cApro; toNodeId=$cCont; flowType="CONDITIONAL"; conditionLabel="Si" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cApro; toNodeId=$cRej;  flowType="CONDITIONAL"; conditionLabel="No" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cCont; toNodeId=$cFirm; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cFirm; toNodeId=$cFin1; flowType="SEQUENTIAL" },
        @{ id=[guid]::NewGuid().ToString(); fromNodeId=$cRej;  toNodeId=$cFin2; flowType="SEQUENTIAL" }
    )
} $tk | Out-Null
Write-Host "   OK Grafo Credito Empresarial guardado (20 nodos, 22 aristas)" -ForegroundColor Green

# Caso activo: en etapa de analisis paralelo (para demo del monitor)
$caseCred = Invoke-Api POST "/cases" @{ policyId=$pCredId } $tk
if ($caseCred -and $caseCred.id) {
    Write-Host "   Caso Credito activo: $($caseCred.id)" -ForegroundColor Green
    # Completar Inicio (auto) y Recepcion
    $t1 = $caseCred.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($t1) {
        $caseCred = Invoke-Api POST "/cases/tasks/$($t1.id)/complete" @{
            payloadJson = '{"solicitante":"Empresa ABC SRL","empresa":"ABC SRL","monto":"75000","descripcion":"Capital de trabajo para expansion"}'
        } $tk
        Write-Host "   OK Recepcion completada" -ForegroundColor Green
    }
    # Completar Verificacion de datos -> decision "Si" -> entra al Fork
    $t2 = $caseCred.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($t2) {
        $caseCred = Invoke-Api POST "/cases/tasks/$($t2.id)/complete" @{
            payloadJson = '{"ci":"1234567","documentos":"Todos los documentos presentados","completo":"true"}'
        } $tk
        Write-Host "   OK Verificacion completada" -ForegroundColor Green
    }
    # Decision datos completos -> "Si"
    $tDec = $caseCred.tasks | Where-Object { $_.status -eq "PENDING" } | Select-Object -First 1
    if ($tDec) {
        $caseCred = Invoke-Api POST "/cases/tasks/$($tDec.id)/complete" @{ chosenEdgeLabel="Si" } $tk
        Write-Host "   OK Decision -> Si (datos completos, entra a Fork paralelo)" -ForegroundColor Green
    }
    # Asignar ramas paralelas a distintos usuarios para demo
    if ($caseCred -and $caseCred.tasks) {
        foreach ($tp in ($caseCred.tasks | Where-Object { $_.status -eq "PENDING" })) {
            $nTitle = if ($tp.node) { $tp.node.title } else { "" }
            if ($nTitle -like "*legal*" -or $nTitle -like "*Legal*") {
                Invoke-Api PATCH "/cases/tasks/$($tp.id)/assign" @{ userId=$userIds["legal@demo.com"] } $tk | Out-Null
                Write-Host "   OK Analisis legal asignado a Luis Legal" -ForegroundColor Green
            } elseif ($nTitle -like "*riesgo*" -or $nTitle -like "*Riesgo*") {
                Invoke-Api PATCH "/cases/tasks/$($tp.id)/assign" @{ userId=$userIds["finanzas@demo.com"] } $tk | Out-Null
                Write-Host "   OK Evaluacion de riesgo asignada a Felipe Finanzas" -ForegroundColor Green
            } elseif ($nTitle -like "*historial*" -or $nTitle -like "*Historial*") {
                Invoke-Api PATCH "/cases/tasks/$($tp.id)/assign" @{ userId=$userIds["rrhh@demo.com"] } $tk | Out-Null
                Write-Host "   OK Revision de historial asignada a Rosa RRHH" -ForegroundColor Green
            }
        }
    }
    Write-Host "   OK Caso listo: 3 tareas paralelas asignadas a 3 funcionarios diferentes" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   SEED COMPLETADO OK                       " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contrasena de todos los usuarios: $PASS" -ForegroundColor White
Write-Host ""
Write-Host "Usuarios:" -ForegroundColor White
Write-Host "  admin@demo.com        ADMIN"
Write-Host "  disenador@demo.com    DESIGNER"
Write-Host "  jefe@demo.com         SUPERVISOR"
Write-Host "  rrhh@demo.com         OFFICER - Recursos Humanos"
Write-Host "  legal@demo.com        OFFICER - Legal"
Write-Host "  finanzas@demo.com     OFFICER - Finanzas"
Write-Host "  ti@demo.com           OFFICER - TI"
Write-Host "  cliente@demo.com      CLIENT  - (app movil - seguimiento de tramites)"
Write-Host ""
Write-Host "Politicas activas:" -ForegroundColor White
Write-Host "  - Solicitud de Credito Empresarial (EJEMPLO DE CLASE: ITERATIVO + FORK/JOIN + ALTERNATIVO)" -ForegroundColor Magenta
Write-Host "  - Contratacion de Personal  (DECISION + FORK/JOIN paralelo)"
Write-Host "  - Solicitud de Vacaciones   (flujo secuencial)"
Write-Host "  - Aprobacion de Compras     (flujo secuencial)"
Write-Host "  - Revision de Contratos     (flujo ITERATIVO - back-edge)"
Write-Host ""
Write-Host "Casos activos: 6 (listos para demo en Monitor)" -ForegroundColor White
Write-Host "  Credito Empresarial: 1 caso con 3 tareas PARALELAS activas (Legal + Finanzas + RRHH)" -ForegroundColor Magenta
Write-Host "  Revision de Contratos: 1 caso con iteracion activa (Luis Legal, v2)" -ForegroundColor Cyan
Write-Host ""