@echo off
title Pglyph Restorer Windows Agent
color 0B
echo ========================================================
echo   PGLYPH RESTORER - AGENTE AUTOMATICO DE BANDEJA WINDOWS
echo ========================================================
echo.
echo Executando o agente em segundo plano...
echo Monitorando CTRL+C global e Lixeira do Windows.
echo.
node %~dp0pglyph-agent.js
pause
