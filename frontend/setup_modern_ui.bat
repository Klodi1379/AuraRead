@echo off
echo Installing TailwindCSS for modern UI...
cd /d %~dp0
call npm install tailwindcss postcss autoprefixer --save
echo.
echo Creating Tailwind configuration files...
call npx tailwindcss init -p
echo.
echo All dependencies installed successfully!
echo.
echo Starting development server...
call npm start
