@echo off
REM Définit le titre de la fenêtre de la console
title Portfolio 3D/IA - Serveur Local

echo Démarrage du portfolio local...

REM Se place dans le répertoire du script
cd /d "%~dp0"

REM Lance le serveur Node.js dans une nouvelle fenêtre de commande
echo [1/3] Lancement du serveur Node.js...
start "Serveur Node" cmd /k "npm run dev"

REM Attend 3 secondes que le serveur ait le temps de démarrer
echo [2/3] Pause de 3 secondes...
timeout /t 3 /nobreak >nul

REM Ouvre la page d'administration dans le navigateur par défaut
echo [3/3] Ouverture de l'interface d'administration...
start http://localhost:3000/admin

echo.
echo =======================================================
echo Portfolio demarre !
echo L'interface d'administration est ouverte dans votre navigateur.
echo Le serveur Node.js tourne dans une autre fenetre.
echo Pour arreter le serveur, fermez la fenetre "Serveur Node".
echo =======================================================
echo.

REM Maintient cette fenêtre ouverte pour voir les messages
pause