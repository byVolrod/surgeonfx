# ─────────────────────────────────────────────────────────────────────────────
#  SurgeonFXGroup — Configuration de la tâche planifiée Windows
#  Lance ce script UNE SEULE FOIS en tant qu'Administrateur.
#  Après ça, le site se met à jour automatiquement chaque nuit à 3h00.
# ─────────────────────────────────────────────────────────────────────────────

$taskName   = "SurgeonFX-WhopUpdate"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$batFile    = Join-Path $scriptDir "auto-update.bat"

# Vérifier que auto-update.bat existe
if (-not (Test-Path $batFile)) {
    Write-Host "ERREUR : auto-update.bat introuvable dans $scriptDir" -ForegroundColor Red
    exit 1
}

# Supprimer la tâche existante si elle existe déjà
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Ancienne tâche supprimée." -ForegroundColor Yellow
}

# Créer l'action : exécuter auto-update.bat
$action  = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batFile`""

# Déclencheur : tous les jours à 3h00 du matin
$trigger = New-ScheduledTaskTrigger -Daily -At "03:00"

# Paramètres : exécuter même si l'ordinateur est en veille, 30 min max
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -StartWhenAvailable `
    -WakeToRun

# Enregistrer la tâche
Register-ScheduledTask `
    -TaskName  $taskName `
    -Action    $action `
    -Trigger   $trigger `
    -Settings  $settings `
    -RunLevel  Highest `
    -Description "Met à jour automatiquement les données Whop (membres + avis) sur SurgeonFXGroup chaque nuit."

Write-Host ""
Write-Host "✅ Tâche planifiee creee avec succes !" -ForegroundColor Green
Write-Host "   Nom    : $taskName"
Write-Host "   Heure  : Tous les jours a 3h00"
Write-Host "   Script : $batFile"
Write-Host ""
Write-Host "PROCHAINE ETAPE : Remplis les credentials FTP dans .env" -ForegroundColor Cyan
Write-Host "   FTP_HOST  = (depuis Espace client OVH -> Hebergements -> FTP-SSH)"
Write-Host "   FTP_USER  = (ton identifiant FTP OVH)"
Write-Host "   FTP_PASS  = (ton mot de passe FTP OVH)"
Write-Host ""
Write-Host "Pour tester maintenant : double-clique sur auto-update.bat" -ForegroundColor Yellow
