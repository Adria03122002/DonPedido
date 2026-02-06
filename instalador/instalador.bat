@echo off
title Instalador Don Pedido - Proceso de Provisión
color 0b

:: Nos aseguramos de que el script se ejecute en la carpeta donde está este archivo .bat
cd /d "%~dp0"

echo ======================================================
echo    SISTEMA DON PEDIDO - CONFIGURACION AUTOMATICA
echo ======================================================
echo.
echo Preparando el entorno de ejecucion...
echo.

:: Llamamos al PowerShell oculto saltándonos las restricciones (Bypass)
:: El punto inicial en la ruta indica la carpeta oculta .ejecutar_entorno
powershell -NoProfile -ExecutionPolicy Bypass -File ".\.ejecutar_entorno\setup_entorno.ps1"

echo.
echo ======================================================
echo  OPERACION COMPLETADA
echo ======================================================
pause