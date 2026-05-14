@echo off
echo ============================================
echo   Taki Play - Inicio desarrollo movil
echo ============================================
echo.

echo [1/2] Activando tunnel emulador → backend...
"C:\Users\nando\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
if %ERRORLEVEL%==0 (
    echo  OK - Tunnel activo: emulador:3000 → localhost:3000
) else (
    echo  ERROR - Asegurate de que el emulador este corriendo primero
    pause
    exit /b 1
)

echo.
echo [2/2] Listo. Corre la app desde Android Studio.
echo.
echo  Recuerda iniciar el backend antes:
echo    cd ..\backend
echo    npm run start:dev
echo.
pause
