@echo off
title Don Pedido - Activador de Visibilidad
:: Forzamos que el terminal se sitúe en la carpeta donde está este archivo
cd /d "%~dp0"

echo ======================================================
echo    ACTIVANDO VISIBILIDAD PARA TABLET (S24 ULTRA)
echo ======================================================
echo.

:: Verificamos si la carpeta y el archivo existen antes de lanzarlo
if not exist ".ejecutar_entorno\visibilidad.ps1" (
    echo [ERROR] No se encuentra el archivo tecnico en:
    echo .ejecutar_entorno\visibilidad.ps1
    echo.
    echo Verifica que la carpeta .ejecutar_entorno no este vacia.
    goto final
)

:: Ejecutamos el script con la ruta corregida (añadiendo la barra \ explicitamente)
powershell -NoProfile -ExecutionPolicy Bypass -File ".ejecutar_entorno\visibilidad.ps1"

:: Comprobamos si hubo errores en la ejecución
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al ejecutar el script de PowerShell.
    echo Recuerda: DEBES EJECUTAR ESTE BAT COMO ADMINISTRADOR.
)

:final
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul