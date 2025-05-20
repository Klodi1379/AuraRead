#!/bin/bash
# AuraRead Enhancement Script - Automated Upgrade

echo "🚀 Starting AuraRead Enhancement Process..."

# Step 1: Backup existing project
echo "📦 Creating backup..."
cp -r ../AuraRead ../AuraRead_backup_$(date +%Y%m%d_%H%M%S)

# Step 2: Install enhanced backend dependencies
echo "⬇️ Installing enhanced backend dependencies..."
cd backend
pip install -r requirements_enhanced.txt

# Step 3: Set up PostgreSQL (optional - will fallback to SQLite)
echo "🗄️ Setting up database..."
if command -v createdb &> /dev/null; then
    createdb auraread 2>/dev/null || echo "Database might already exist"
fi

# Step 4: Set up environment file
echo "🔧 Setting up environment configuration..."
if [ ! -f .env ]; then
    cat > .env << EOF
SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - will use SQLite if not configured)
DB_NAME=auraread
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# AI API Keys (optional - features will be disabled if not provided)
OPENAI_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=eastus

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
    echo "✅ Environment file created at backend/.env"
    echo "⚠️ Please edit backend/.env and add your API keys for AI features"
fi

# Step 5: Apply database migrations
echo "🔄 Applying database migrations..."
python manage.py makemigrations
python manage.py migrate

# Step 6: Create AI features app
echo "🧠 Setting up AI features..."
python manage.py startapp ai_features 2>/dev/null || echo "AI features app already exists"

# Step 7: Install enhanced frontend dependencies
echo "⬇️ Installing enhanced frontend dependencies..."
cd ../frontend
npm install react-pdf@^7.5.1 pdf-lib@^1.17.1 framer-motion@^10.16.4 react-hotkeys-hook@^4.4.1 wavesurfer.js@^7.3.2

# Step 8: Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ AuraRead enhancement complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Edit backend/.env with your API keys for AI features"
echo "2. Run: ./start_dev.bat (or manually start backend and frontend)"
echo "3. Visit http://localhost:3000 to see the enhanced AuraRead"
echo ""
echo "📚 New Features Available:"
echo "• Enhanced PDF viewer with PDF.js"
echo "• AI-powered document summarization"
echo "• Intelligent question answering"
echo "• OCR support for scanned documents"
echo "• Advanced TTS with multiple engines"
echo "• Better security and performance"
echo ""
echo "⚠️ Note: Some AI features require API keys in the .env file"
