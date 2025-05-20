# Backup dhe fillimi i përmirësimit
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuraReadEnhancer:
    def __init__(self, project_path):
        self.project_path = project_path
        self.backend_path = os.path.join(project_path, 'backend')
        self.frontend_path = os.path.join(project_path, 'frontend')
    
    def enhance_backend(self):
        """Përmirëson backend-in me AI dhe siguri"""
        logger.info("🔧 Duke filluar përmirësimin e backend-it...")
        
        # 1. Krijojmë .env file për konfigurim
        self.create_env_file()
        
        # 2. Krijojmë AI features app
        self.setup_ai_features()
        
        # 3. Përditësojmë settings.py
        self.update_settings()
        
        # 4. Krijojmë middleware të ri
        self.create_middleware()
        
        logger.info("✅ Backend i përmirësuar!")
    
    def create_env_file(self):
        """Krijon .env file për konfigurime të sigurta"""
        env_path = os.path.join(self.backend_path, '.env')
        
        env_content = '''# AuraRead Configuration
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - will use SQLite if empty)
DB_NAME=auraread
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# AI API Keys (optional - features will work without them)
OPENAI_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=eastus

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Redis (optional - will use in-memory cache if not available)
REDIS_URL=redis://localhost:6379/1
'''
        
        if not os.path.exists(env_path):
            with open(env_path, 'w') as f:
                f.write(env_content)
            print(f"✅ Krijova .env file: {env_path}")
        else:
            print(f"⚠️  .env file ekziston tashmë: {env_path}")

# Fillojmë përmirësimin
if __name__ == "__main__":
    enhancer = AuraReadEnhancer("C:/GPT4_PROJECTS/AuraRead")
    enhancer.enhance_backend()
