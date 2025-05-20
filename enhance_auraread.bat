@echo off
REM AuraRead Enhancement Script for Windows

echo 🚀 Starting AuraRead Enhancement Process...

REM Step 1: Backup existing project
echo 📦 Creating backup...
if not exist ..\AuraRead_backup mkdir ..\AuraRead_backup
xcopy /e /i /h /y . ..\AuraRead_backup\AuraRead_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

REM Step 2: Install enhanced backend dependencies
echo ⬇️ Installing enhanced backend dependencies...
cd backend
pip install -r requirements_enhanced.txt

REM Step 3: Set up environment file
echo 🔧 Setting up environment configuration...
if not exist .env (
    echo SECRET_KEY=your-secret-key-here > .env
    echo DEBUG=True >> .env
    echo ALLOWED_HOSTS=localhost,127.0.0.1 >> .env
    echo. >> .env
    echo # Database optional - SQLite by default >> .env
    echo DB_NAME=auraread >> .env
    echo DB_USER=postgres >> .env
    echo DB_PASSWORD= >> .env
    echo DB_HOST=localhost >> .env
    echo DB_PORT=5432 >> .env
    echo. >> .env
    echo # AI API Keys optional >> .env
    echo OPENAI_API_KEY= >> .env
    echo AZURE_SPEECH_KEY= >> .env
    echo AZURE_SPEECH_REGION=eastus >> .env
    echo. >> .env
    echo # CORS >> .env
    echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 >> .env
    
    echo ✅ Environment file created at backend\.env
    echo ⚠️ Please edit backend\.env and add your API keys for AI features
)

REM Step 4: Apply database migrations
echo 🔄 Applying database migrations...
python manage.py makemigrations
python manage.py migrate

REM Step 5: Install enhanced frontend dependencies
echo ⬇️ Installing enhanced frontend dependencies...
cd ..\frontend
npm install react-pdf@^7.5.1 pdf-lib@^1.17.1 framer-motion@^10.16.4

echo ✅ AuraRead enhancement complete!
echo.
echo 🎯 Next Steps:
echo 1. Edit backend\.env with your API keys for AI features
echo 2. Run: start_dev.bat to start the application
echo 3. Visit http://localhost:3000 to see enhanced AuraRead
echo.
echo 📚 New Features Available:
echo • Enhanced PDF viewer with PDF.js
echo • AI-powered document summarization  
echo • OCR support for scanned documents
echo • Advanced TTS with multiple engines
echo • Better security and performance
echo.
echo ⚠️ Note: Some AI features require API keys in the .env file

pause
