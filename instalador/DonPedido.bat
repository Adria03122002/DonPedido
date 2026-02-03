@echo off
title Sistema Don Pedido - Gestor de Inicio
color 0b

echo ======================================================
echo           SISTEMA DON PEDIDO - INICIO PRO
echo ======================================================
echo.

:: --- COMPROBACIONES DE SEGURIDAD ---

:: 1. Comprobar si la carpeta app existe
if not exist "app" (
    color 0c
    echo [ERROR] No se encuentra la carpeta "app".
    echo Asegurate de que este archivo .bat este en la raiz del USB.
    pause
    exit
)

:: 2. Comprobar si existen las librerias (node_modules)
if not exist "app\node_modules" (
    color 0c
    echo [ERROR] Falta la carpeta "node_modules" dentro de "app".
    echo Sin las librerias, el sistema no puede arrancar.
    echo Copia la carpeta 'node_modules' de tu proyecto de Backend aqui.
    pause
    exit
)

:: --- FASE 1: INICIALIZAR BACKEND ---
echo [1/2] Inicializando Backend y Base de Datos...
echo.

cd app

:: Iniciamos el backend en una ventana nueva (minimizada)
:: Esto ejecuta tu "dist/index.js" que es el motor de todo
start "Servidor Don Pedido" /min cmd /c "node dist/index.js"

:: Esperamos 5 segundos para que el servidor conecte a la DB
echo Esperando a que el motor este listo...
timeout /t 5 /nobreak >nul

:: --- FASE 2: INICIALIZAR FRONTEND ---
echo.
echo [2/2] Inicializando Interfaz de Usuario...
echo.

:: Abrimos el navegador en el puerto 3000 (Donde Node sirve a Angular)
start http://localhost:3000

echo.
echo ======================================================
echo ✅ SISTEMA INICIALIZADO CORRECTAMENTE
echo ======================================================
echo.
echo No cierres la ventana minimizada de Node.js mientras 
echo uses la aplicacion.
echo.
pause