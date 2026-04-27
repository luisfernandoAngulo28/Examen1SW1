$base = "http://localhost:8080/api"
$loginBody = @{ email = "admin@demo.com"; password = "Admin1234!" }
$tk = (Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json").token
$headers = @{ Authorization = "Bearer $tk" }
$all = Invoke-RestMethod -Uri "$base/cases" -Headers $headers
Write-Output "Total: $($all.Count) | IN_PROGRESS: $(($all | Where-Object { $_.status -eq 'IN_PROGRESS' }).Count) | COMPLETED: $(($all | Where-Object { $_.status -eq 'COMPLETED' }).Count)"
foreach ($c in ($all | Where-Object { $_.status -eq "IN_PROGRESS" })) {
    $active = $c.tasks | Where-Object { $_.status -ne "DONE" }
    $taskNames = ($active | ForEach-Object { "$($_.node.title) [$($_.status)]" }) -join ", "
    $assigned = ($active | Where-Object { $_.assignedUser } | ForEach-Object { $_.assignedUser.name }) -join ", "
    Write-Output "  '$($c.policy.name)' -> $taskNames | assigned=$assigned"
}
