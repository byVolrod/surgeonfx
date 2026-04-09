@echo off
:: ─────────────────────────────────────────────────────
::  SurgeonFXGroup — Auto-update Whop
::  Ce fichier est exécuté automatiquement par le
::  Planificateur de tâches Windows chaque nuit.
:: ─────────────────────────────────────────────────────

cd /d "C:\Users\Muhammet\Documents\JustOneTrader\Site Web\SurgeonFX"
node update-whop.js >> logs\whop-update.log 2>&1
