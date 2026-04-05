# Script para crear una política demo con nodos UML completos
# Ejecutar desde PowerShell en la raíz del proyecto

# Login
$login = Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@test.com","password":"123456"}'
$token = $login.access_token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== Token obtenido ===" -ForegroundColor Green

# Get departments
$depts = Invoke-RestMethod -Uri http://localhost:3000/departments -Method GET -Headers $headers
$ventas = ($depts | Where-Object { $_.name -eq "Ventas" }).id
$legal = ($depts | Where-Object { $_.name -eq "Legal" }).id
$finanzas = ($depts | Where-Object { $_.name -eq "Finanzas" }).id

Write-Host "Ventas: $ventas"
Write-Host "Legal: $legal"
Write-Host "Finanzas: $finanzas"

# Create policy
$policy = Invoke-RestMethod -Uri http://localhost:3000/policies -Method POST -ContentType "application/json" -Headers $headers -Body '{"name":"Proceso de Contratacion"}'
$policyId = $policy.id
Write-Host "=== Politica creada: $policyId ===" -ForegroundColor Green

# Node IDs (pre-generate)
$nInicio = [guid]::NewGuid().ToString()
$nSolicitud = [guid]::NewGuid().ToString()
$nRevision = [guid]::NewGuid().ToString()
$nDecision = [guid]::NewGuid().ToString()
$nAprobacion = [guid]::NewGuid().ToString()
$nRechazo = [guid]::NewGuid().ToString()
$nFork = [guid]::NewGuid().ToString()
$nContrato = [guid]::NewGuid().ToString()
$nPago = [guid]::NewGuid().ToString()
$nJoin = [guid]::NewGuid().ToString()
$nFin = [guid]::NewGuid().ToString()

# Build graph JSON
$graphBody = @{
  nodes = @(
    @{ id=$nInicio;     departmentId=$ventas;   title="Inicio";           nodeType="INITIAL";  positionX=75;  positionY=20 }
    @{ id=$nSolicitud;  departmentId=$ventas;   title="Recibir Solicitud"; nodeType="ACTION";   positionX=25;  positionY=150 }
    @{ id=$nRevision;   departmentId=$legal;    title="Revisar Documentos";nodeType="ACTION";   positionX=325; positionY=150 }
    @{ id=$nDecision;   departmentId=$legal;    title="Aprobado?";         nodeType="DECISION"; positionX=350; positionY=310 }
    @{ id=$nAprobacion; departmentId=$legal;    title="Notificar Aprobacion";nodeType="ACTION"; positionX=325; positionY=460 }
    @{ id=$nRechazo;    departmentId=$ventas;   title="Notificar Rechazo"; nodeType="ACTION";   positionX=25;  positionY=460 }
    @{ id=$nFork;       departmentId=$finanzas; title="Fork Paralelo";     nodeType="FORK";     positionX=625; positionY=460 }
    @{ id=$nContrato;   departmentId=$legal;    title="Generar Contrato";  nodeType="ACTION";   positionX=325; positionY=590 }
    @{ id=$nPago;       departmentId=$finanzas; title="Procesar Pago";     nodeType="ACTION";   positionX=625; positionY=590 }
    @{ id=$nJoin;       departmentId=$finanzas; title="Join Sincronizar";  nodeType="JOIN";     positionX=625; positionY=720 }
    @{ id=$nFin;        departmentId=$finanzas; title="Fin";               nodeType="FINAL";    positionX=650; positionY=850 }
  )
  edges = @(
    @{ fromNodeId=$nInicio;     toNodeId=$nSolicitud;  flowType="SEQUENTIAL" }
    @{ fromNodeId=$nSolicitud;  toNodeId=$nRevision;   flowType="SEQUENTIAL" }
    @{ fromNodeId=$nRevision;   toNodeId=$nDecision;   flowType="SEQUENTIAL" }
    @{ fromNodeId=$nDecision;   toNodeId=$nAprobacion; flowType="CONDITIONAL"; conditionLabel="[aprobado]" }
    @{ fromNodeId=$nDecision;   toNodeId=$nRechazo;    flowType="CONDITIONAL"; conditionLabel="[rechazado]" }
    @{ fromNodeId=$nAprobacion; toNodeId=$nFork;       flowType="SEQUENTIAL" }
    @{ fromNodeId=$nFork;       toNodeId=$nContrato;   flowType="PARALLEL" }
    @{ fromNodeId=$nFork;       toNodeId=$nPago;       flowType="PARALLEL" }
    @{ fromNodeId=$nContrato;   toNodeId=$nJoin;       flowType="SEQUENTIAL" }
    @{ fromNodeId=$nPago;       toNodeId=$nJoin;       flowType="SEQUENTIAL" }
    @{ fromNodeId=$nJoin;       toNodeId=$nFin;        flowType="SEQUENTIAL" }
  )
} | ConvertTo-Json -Depth 4

# Save graph
Invoke-RestMethod -Uri "http://localhost:3000/policies/$policyId/graph" -Method PUT -ContentType "application/json" -Headers $headers -Body $graphBody | Out-Null
Write-Host "=== Grafo guardado con 11 nodos y 11 aristas ===" -ForegroundColor Green

# Add form template for "Recibir Solicitud"
$formBody = '{"schemaJson":{"fields":[{"name":"nombre_solicitante","label":"Nombre del Solicitante","type":"text","required":true},{"name":"tipo_servicio","label":"Tipo de Servicio","type":"select","required":true,"options":["Instalacion","Reparacion","Cambio de plan"]},{"name":"direccion","label":"Direccion","type":"text","required":true},{"name":"telefono","label":"Telefono de Contacto","type":"text","required":false},{"name":"observaciones","label":"Observaciones","type":"textarea","required":false}]}}'
Invoke-RestMethod -Uri "http://localhost:3000/forms/template/$nSolicitud" -Method PUT -ContentType "application/json" -Headers $headers -Body $formBody | Out-Null
Write-Host "=== Formulario creado para Recibir Solicitud ===" -ForegroundColor Green

# Add form template for "Revisar Documentos"
$formBody2 = '{"schemaJson":{"fields":[{"name":"documentos_completos","label":"Documentos Completos?","type":"select","required":true,"options":["Si","No"]},{"name":"comentario_revision","label":"Comentario de Revision","type":"textarea","required":false}]}}'
Invoke-RestMethod -Uri "http://localhost:3000/forms/template/$nRevision" -Method PUT -ContentType "application/json" -Headers $headers -Body $formBody2 | Out-Null
Write-Host "=== Formulario creado para Revisar Documentos ===" -ForegroundColor Green

# Start a case
$caso = Invoke-RestMethod -Uri http://localhost:3000/cases -Method POST -ContentType "application/json" -Headers $headers -Body "{`"policyId`":`"$policyId`"}"
Write-Host "=== Tramite iniciado: $($caso.id) ===" -ForegroundColor Green
Write-Host ""
Write-Host "DEMO LISTA!" -ForegroundColor Cyan
Write-Host "  - Politica: Proceso de Contratacion"
Write-Host "  - Nodos: Inicio > Solicitud > Revision > Decision[aprobado/rechazado] > Fork > Contrato+Pago > Join > Fin"
Write-Host "  - Tramite en curso con primera tarea pendiente"
Write-Host "  - Formularios en Solicitud y Revision"
Write-Host ""
Write-Host "Abre http://localhost:5173 para ver la demo" -ForegroundColor Yellow
