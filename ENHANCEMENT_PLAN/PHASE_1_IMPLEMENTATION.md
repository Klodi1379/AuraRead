# Phase 1: Critical Security & Foundation Improvements

## 🔐 1. Security Hardening Implementation

### 1.1 Environment Configuration
```bash
# Install python-decouple for environment management
pip install python-decouple
```

### 1.2 Enhanced Django Settings
```python
# backend/auraread/settings.py - SECURE VERSION
from decouple import config, Csv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Database with PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='auraread'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 60,
        }
    }
}

# Redis Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS - Production Ready
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only in development
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', 
    default='http://localhost:3000,http://127.0.0.1:3000', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# Updated Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_ratelimit',
    'django_redis',
    
    # Local apps
    'users',
    'documents',
    'annotations',
    'ai_features',  # New AI app
    'analytics',    # New analytics app
]

# Enhanced REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'tts': '50/hour',  # Special rate for TTS
    },
    'EXCEPTION_HANDLER': 'auraread.exceptions.custom_exception_handler',
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 1.3 Environment File Template
```bash
# .env file for development
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=auraread
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0

# External APIs
OPENAI_API_KEY=your-openai-key
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=eastus

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🔧 2. Enhanced Requirements

### 2.1 Backend Requirements
```txt
# Core Django
django==5.0.3
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0

# Database & Cache
psycopg2-binary==2.9.9
django-redis==5.4.0
redis==5.0.1

# Background Tasks
celery[redis]==5.3.4
django-celery-beat==2.5.0

# Security & CORS
django-cors-headers==4.3.1
django-ratelimit==4.1.0
python-decouple==3.8

# PDF Processing
PyMuPDF==1.23.8
pytesseract==0.3.10
Pillow==10.1.0

# TTS Enhanced
gTTS==2.5.0
pyttsx3==2.90
azure-cognitiveservices-speech==1.34.0
boto3==1.34.0

# AI Features
openai==1.3.7
sentence-transformers==2.2.2
langchain==0.0.350

# Monitoring & Logging
sentry-sdk[django]==1.38.0
django-extensions==3.2.3

# File handling
python-magic==0.4.27
```

## 📋 3. Implementation Priority Checklist

### Immediate (Week 1)
- [ ] Set up PostgreSQL database
- [ ] Implement JWT authentication
- [ ] Add input validation middleware
- [ ] Set up Redis for caching
- [ ] Configure proper CORS settings
- [ ] Add rate limiting to APIs
- [ ] Implement structured error handling

### Next (Week 2)  
- [ ] Set up Celery for background tasks
- [ ] Add comprehensive logging
- [ ] Implement API versioning
- [ ] Add pagination to all list endpoints
- [ ] Create health check endpoints
- [ ] Set up monitoring with Sentry
- [ ] Add database indexes for performance
