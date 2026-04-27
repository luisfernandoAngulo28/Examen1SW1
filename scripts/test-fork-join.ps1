$base = "http://localhost:8080/api"
$ErrorActionPreference = "Stop"

function Invoke-Api($method, $path, $body, $token) {
    $headers = @{ Authorization = "Bearer $token" }
    $uri = "$base$path"
    if ($body) {
        return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Body ($body | ConvertTo-Json -Depth 10) -ContentType "application/json"
    } else {
        return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers
    }
}

# 1. Login
Write-Host "=== TEST FORK/JOIN ===" -ForegroundColor Cyan
$loginBody = @{ email = "admin@demo.com"; password = "Admin1234!" }
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
$tk = $login.token
Write-Host "Login OK" -ForegroundColor Green

# 2. Get cases
$cases = Invoke-Api GET "/cases" $null $tk
Write-Host "Total cases: $($cases.Count)"

# 3. Find Contratacion IN_PROGRESS
$contrat = $cases | Where-Object { $_.status -eq "IN_PROGRESS" -and $_.policy.name -like "*Contratacion*" } | Select-Object -First 1
if (-not $contrat) { Write-Host "No hay caso Contratacion IN_PROGRESS - reseed needed" -ForegroundColor Red; exit 1 }
Write-Host "Contratacion case: $($contrat.id)" -ForegroundColor Green
$contrat.tasks | ForEach-Object { Write-Host "  [$($_.node.nodeType)] $($_.node.title) -> $($_.status)" }

# 4. Complete step by step
function Complete-Step($caseObj, $taskTitle, $edgeLabel) {
    $t = $caseObj.tasks | Where-Object { $_.node.title -eq $taskTitle -and ($_.status -eq "PENDING" -or $_.status -eq "IN_PROGRESS") } | Select-Object -First 1
    if (-not $t) {
        $t = $caseObj.tasks | Where-Object { $_.status -eq "PENDING" -or $_.status -eq "IN_PROGRESS" } | Select-Object -First 1
    }
    if (-not $t) { Write-Host "No task found for '$taskTitle'" -ForegroundColor Yellow; return $caseObj }
    Write-Host "Completing: $($t.node.title) (id=$($t.id.Substring(0,8))...)" -ForegroundColor Yellow
    $body = if ($edgeLabel) { @{ chosenEdgeLabel = $edgeLabel } } else { @{} }
    $updated = Invoke-Api POST "/cases/tasks/$($t.id)/complete" $body $tk
    Write-Host "  => status=$($updated.status), tasks=$($updated.tasks.Count)"
    $updated.tasks | Where-Object { $_.status -ne "DONE" } | ForEach-Object { Write-Host "    ACTIVE: [$($_.node.nodeType)] $($_.node.title) -> $($_.status)" }
    return $updated
}

# Step 1: Complete Solicitud de Puesto
$s1 = Complete-Step $contrat "Solicitud de Puesto" $null
Write-Host ""

# Step 2: Complete Revision de Perfil
$s2 = Complete-Step $s1 "Revision de Perfil" $null
Write-Host ""

# Step 3: Complete DECISION (Perfil Aprobado?) with "Aprobado"
$s3 = Complete-Step $s2 "Perfil Aprobado?" "Aprobado"
Write-Host ""

# Step 4: Complete Notif. Aprobado -> FORK should auto-complete and spawn Firma+Induccion
$s4 = Complete-Step $s3 "Notif. Aprobado" $null
Write-Host ""

# Step 5: Check FORK created parallel tasks
Write-Host "=== After FORK: ===" -ForegroundColor Cyan
$s4.tasks | ForEach-Object { Write-Host "  [$($_.node.nodeType)] $($_.node.title) -> $($_.status)" }

# Step 6: Complete Firma de Contrato
$s5 = Complete-Step $s4 "Firma de Contrato" $null
Write-Host "After Firma: status=$($s5.status)"
$s5.tasks | Where-Object { $_.status -ne "DONE" } | ForEach-Object { Write-Host "  ACTIVE: $($_.node.title) -> $($_.status)" }
Write-Host ""

# Step 7: Complete Induccion -> JOIN should auto-complete and case reach COMPLETED
$s6 = Complete-Step $s5 "Induccion" $null
Write-Host ""
Write-Host "=== FINAL RESULT ===" -ForegroundColor Cyan
Write-Host "Case status: $($s6.status)" -ForegroundColor $(if($s6.status -eq "COMPLETED"){"Green"}else{"Red"})
$s6.tasks | ForEach-Object { Write-Host "  [$($_.node.nodeType)] $($_.node.title) -> $($_.status)" }
