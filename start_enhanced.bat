@echo off
title AuraRead - Enhanced Version
echo ============================================
echo    🚀 AuraRead Enhanced - Starting...
echo ============================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found!
    echo Make sure you're running this from the AuraRead root directory.
    pause
    exit /b 1
)

REM Check if frontend directory exists  
if not exist "frontend" (
    echo ❌ Frontend directory not found!
    echo Make sure you're running this from the AuraRead root directory.
    pause
    exit /b 1
)

echo 🔧 Starting Backend (Django)...
cd backend
start "AuraRead Backend" cmd /k "python manage.py runserver 8000"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🎨 Starting Frontend (React)...
cd ..\frontend
start "AuraRead Frontend" cmd /k "npm start"

echo.
echo ✅ AuraRead Enhanced is starting!
echo.
echo 📖 Access the application:
echo    • Frontend: http://localhost:3000
echo    • Backend API: http://localhost:8000/admin
echo    • Admin Panel: http://localhost:8000/admin
echo.
echo 🔑 Admin Credentials:
echo    • Username: admin
echo    • Password: admin123
echo.
echo 🧠 AI Features:
echo    • Basic AI features work without API keys
echo    • For advanced AI: Add OPENAI_API_KEY to backend\.env
echo    • For premium TTS: Add AZURE_SPEECH_KEY to backend\.env
echo.
echo ❌ To stop: Close both command windows or press Ctrl+C in each
echo.
pause
