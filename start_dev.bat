@echo off
echo Starting AuraRead Development Environment

echo ==========================================
echo Starting Django Backend Server...
echo ==========================================
start cmd /k "cd backend && .\venv\Scripts\activate.bat && python manage.py runserver"

echo ==========================================
echo Starting React Frontend Server...
echo ==========================================
start cmd /k "cd frontend && npm start"

echo ==========================================
echo Development environment started!
echo ==========================================
echo.
echo Backend running at: http://localhost:8000/
echo Frontend running at: http://localhost:3000/
echo Django Admin: http://localhost:8000/admin/
echo.
echo Admin Username: admin
echo Admin Password: admin123
echo ==========================================
