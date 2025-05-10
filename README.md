# AuraRead - PDF Audio Reader & Annotation Tool

AuraRead is a comprehensive web application for reading and annotating PDF documents with audio capabilities. It allows users to upload PDF documents, extract text, convert text to speech, annotate text, and manage a library of documents.

## Features

- PDF document upload and management
- Text extraction from PDFs
- Text-to-Speech functionality
- Text selection and annotation
- Highlighting with custom colors
- User authentication and document privacy

## Tech Stack

### Backend
- Django (Python)
- Django REST Framework for API
- SQLite (development) / PostgreSQL (production ready)
- gTTS for Text-to-Speech

### Frontend
- React.js
- Redux for state management
- React Router for navigation
- Axios for API communication

## Getting Started

### Prerequisites
- Python 3.x
- Node.js and npm
- Git

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd Projekti_PDF_reader
```

2. Set up the backend:
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setadminpassword
```

3. Set up the frontend:
```
cd ../frontend
npm install
```

### Running the Application

You can run both backend and frontend with the provided start script:

```
start_dev.bat
```

Or run them individually:

#### Backend:
```
cd backend
venv\Scripts\activate
python manage.py runserver
```

#### Frontend:
```
cd frontend
npm start
```

### Default Admin Credentials

- URL: http://localhost:8000/admin/
- Username: admin
- Password: admin123

## Future Enhancements

- Support for more document formats (DOCX, EPUB, etc.)
- OCR for scanned PDFs
- Advanced search functionality
- Document organization with folders and tags
- Collaborative annotation
- Mobile application or PWA
- AI-based features (summarization, keyword extraction)

## Project Structure

```
auraread/
├── backend/                # Django backend
│   ├── auraread/           # Main Django project
│   ├── documents/          # Document management app
│   ├── annotations/        # Annotation functionality
│   ├── users/              # User authentication
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── store/          # Redux store
│   └── package.json        # Node.js dependencies
└── README.md               # Project documentation
```
