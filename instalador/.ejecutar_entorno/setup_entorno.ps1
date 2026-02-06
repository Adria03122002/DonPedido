# ==============================================================================
# SCRIPT DE PROVISIÓN MAESTRO - DON PEDIDO (VERSIÓN CARPETA OCULTA)
# Ubicación esperada: ./.ejecutar_entorno/setup_entorno.ps1
# ==============================================================================

# --- [TRUCO TÉCNICO: AUTO-BYPASS Y ELEVACIÓN] ---
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (!($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))) {
    Write-Host "Elevando privilegios..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# --- AJUSTE DE RUTAS (Saliendo de la carpeta oculta) ---
# $PSScriptRoot es donde está este script. Necesitamos el padre.
$ROOT_PROJECT = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location -Path $ROOT_PROJECT

$DB_NAME = "bar_app"
$DB_PASS = "isca2025."
$TARGET_HOSTNAME = "donpedido"
$DOMAIN = "$TARGET_HOSTNAME.local"

# Las rutas ahora apuntan a la raíz del proyecto
$MYSQL_ZIP = Join-Path $ROOT_PROJECT "instaladores\mysql-8.0.44-winx64.zip"
$MYSQL_DIR = "C:\mysql"
$MYSQL_BIN = "$MYSQL_DIR\bin"
$MYSQL_SERVICE = "MySQL80"

Clear-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "       INICIALIZANDO ENTORNO DESDE NÚCLEO OCULTO" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan

# Comprobar existencia del ZIP
if (!(Test-Path $MYSQL_ZIP)) {
    Write-Host "❌ ERROR: No se encuentra el ZIP en: $MYSQL_ZIP" -ForegroundColor Red
    pause ; exit
}

# --- 1. LIMPIEZA ---
Write-Host "`n[1/5] Limpiando rastro anterior..." -ForegroundColor Cyan
if (Get-Service $MYSQL_SERVICE -ErrorAction SilentlyContinue) {
    Stop-Service $MYSQL_SERVICE -Force -ErrorAction SilentlyContinue
    Start-Process sc.exe -ArgumentList "delete $MYSQL_SERVICE" -Wait -WindowStyle Hidden
}
if (Test-Path $MYSQL_DIR) { Remove-Item $MYSQL_DIR -Recurse -Force -ErrorAction SilentlyContinue }

# --- 2. IDENTIDAD DE RED ---
if ($env:COMPUTERNAME -ne $TARGET_HOSTNAME) {
    Write-Host " [!] Renombrando equipo a '$TARGET_HOSTNAME'..." -ForegroundColor Yellow
    Rename-Computer -NewName $TARGET_HOSTNAME -Force
    Write-Host " ✅ REINICIA LA VM y vuelve a ejecutar." -ForegroundColor Green
    pause ; exit
}

# --- 3. RED & FIREWALL ---
try {
    Get-NetConnectionProfile -ErrorAction SilentlyContinue | Set-NetConnectionProfile -NetworkCategory Private -ErrorAction SilentlyContinue
    if (!(Get-NetFirewallRule -DisplayName "Don Pedido Web" -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName "Don Pedido Web" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
    }
    Write-Host " ✅ Red y Firewall configurados." -ForegroundColor Green
} catch { Write-Host " ⚠️ Aviso de red (No crítico)." -ForegroundColor Yellow }

# --- 4. INSTALACIÓN DE MYSQL ---
Write-Host "`n[4/5] Instalando MySQL..." -ForegroundColor Cyan
try {
    $tempExtract = "C:\mysql_temp"
    if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
    Expand-Archive -Path $MYSQL_ZIP -DestinationPath $tempExtract -Force
    $innerFolder = Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1
    Move-Item -Path "$($innerFolder.FullName)" -Destination $MYSQL_DIR
    Remove-Item $tempExtract -Recurse -Force

$myIni = @"
[mysqld]
basedir=$MYSQL_DIR
datadir=$MYSQL_DIR\data
port=3306
bind-address=0.0.0.0
max_connections=150
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
character-set-server=utf8mb4
"@
    $myIni | Out-File -Encoding ASCII "$MYSQL_DIR\my.ini"
    & "$MYSQL_BIN\mysqld.exe" --defaults-file="$MYSQL_DIR\my.ini" --initialize-insecure --console
    & "$MYSQL_BIN\mysqld.exe" --install $MYSQL_SERVICE --defaults-file="$MYSQL_DIR\my.ini"
    Start-Service $MYSQL_SERVICE
    Start-Sleep -Seconds 10 
    & "$MYSQL_BIN\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '$DB_PASS'; FLUSH PRIVILEGES;"
    Write-Host " ✅ MySQL configurado." -ForegroundColor Green
} catch { Write-Host " ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red ; pause ; exit }

# --- 5. CONFIGURACIÓN FINAL ---
& "$MYSQL_BIN\mysql.exe" -u root "-p$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
$IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPv4Address

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host " ✅ PROVISIÓN FINALIZADA" -ForegroundColor White
Write-Host " 💻 Acceso Local:  http://$DOMAIN:3000" -ForegroundColor Cyan
Write-Host " 📱 Acceso Red:  http://$IP:3000" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Green