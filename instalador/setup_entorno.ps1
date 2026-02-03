
# --- CONFIGURACIÓN DE BASE DE DATOS ---
$DB_NAME = "bar_app"
$DB_USER = "root"
$DB_PASS = "isca2025."

# --- NOMBRES DE ARCHIVOS EN LA CARPETA 'instaladores' ---
$NODE_MSI = ".\instaladores\node-v18.16.1-x64.msi"
$MYSQL_MSI = ".\instaladores\mysql-installer-web-community-8.0.44.0.msi"

clear
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "      PREPARACIÓN DE ENTORNO - SISTEMA DON PEDIDO" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Verificación de permisos de administrador
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ ERROR: Se requieren permisos de Administrador." -ForegroundColor Red
    Write-Host "Por favor, ejecute el archivo .bat como administrador."
    pause
    exit
}

# 2. Instalación de Node.js
Write-Host "[1/3] Verificando Node.js..." -ForegroundColor Cyan
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    if (Test-Path $NODE_MSI) {
        Write-Host "   -> Instalando Node.js desde el USB..." -ForegroundColor White
        Start-Process msiexec.exe -ArgumentList "/i `"$NODE_MSI`" /qn /norestart" -Wait
        Write-Host "   ✅ Node.js instalado correctamente." -ForegroundColor Green
    } else {
        Write-Host "   ❌ ERROR: No se encuentra $NODE_MSI en la carpeta 'instaladores'." -ForegroundColor Red
        pause
        exit
    }
} else {
    Write-Host "   ✅ Node.js ya está instalado en este equipo." -ForegroundColor Green
}

# 3. Instalación de MySQL
Write-Host "`n[2/3] Verificando MySQL Server..." -ForegroundColor Cyan
if (!(Get-Service "MySQL80" -ErrorAction SilentlyContinue)) {
    if (Test-Path $MYSQL_MSI) {
        Write-Host "   -> Iniciando instalador de MySQL..." -ForegroundColor White
        Write-Host "   ⚠️  IMPORTANTE: Establece la contraseña de ROOT como: $DB_PASS" -ForegroundColor Yellow
        
        # Abrimos el instalador en modo básico para que el usuario configure la clave
        Start-Process msiexec.exe -ArgumentList "/i `"$MYSQL_MSI`" /qb" -Wait
    } else {
        Write-Host "   ❌ ERROR: No se encuentra $MYSQL_MSI en la carpeta 'instaladores'." -ForegroundColor Red
        pause
        exit
    }
} else {
    Write-Host "   ✅ El servicio MySQL80 ya está instalado." -ForegroundColor Green
}

# 4. Creación de la Base de Datos
Write-Host "`n[3/3] Configurando base de datos '$DB_NAME'..." -ForegroundColor Cyan
$SQL_COMMAND = "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Ruta por defecto de MySQL 8.0
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (Test-Path $mysqlPath) {
    try {
        Write-Host "   -> Intentando crear la base de datos automáticamente..." -ForegroundColor White
        & $mysqlPath -u $DB_USER "-p$DB_PASS" -e $SQL_COMMAND 2>$null
        Write-Host "   ✅ Base de datos '$DB_NAME' lista para usar." -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ No se pudo conectar. Asegúrate de que la clave sea '$DB_PASS'." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️ No se encontró la ruta de MySQL. Crea la base de datos manualmente si es necesario." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Yellow
Write-Host "  ✅ PROCESO FINALIZADO" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "Cierra esta ventana para continuar con el inicio del servidor."