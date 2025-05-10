# AuraRead Project Summary

## Project Overview

AuraRead is a web application for reading and annotating PDF documents with audio capabilities. It allows users to upload PDF documents, extract text, convert text to speech, annotate text, and manage a library of documents.

## Current Status

The project has been set up with a basic structure following the Django + React stack. The main components have been implemented:

### Backend (Django):
- User authentication
- Document management (upload, retrieve, delete)
- Annotation system (create, retrieve, update, delete)
- Text-to-Speech API endpoint

### Frontend (React):
- User interface components
- Document list and viewer
- Text selection and annotation
- Audio playback of document text
- Redux state management

## Installation and Running

1. **Start the application**:
   - Run the `start_dev.bat` file to start both backend and frontend servers

2. **Access the application**:
   - Backend: http://localhost:8000/
   - Frontend: http://localhost:3000/
   - Admin: http://localhost:8000/admin/ (username: admin, password: admin123)

## Known Limitations

1. **PDF Processing**: The current implementation doesn't have PyMuPDF installed due to compilation requirements. The text extraction is a placeholder.

2. **PostgreSQL**: The app is configured to use SQLite for simplicity. For production, you would want to switch to PostgreSQL.

3. **Authentication**: The current implementation uses Django's session authentication. For production, you might want to implement JWT authentication.

## Next Steps for Development

1. **Install PyMuPDF**: Install Visual Studio Build Tools and PyMuPDF for proper PDF text extraction.

2. **Implement User Registration**: Add functionality for user registration and account management.

3. **Improve PDF Viewer**: Enhance the PDF viewer with pagination and better text extraction.

4. **Add Testing**: Implement unit and integration tests for both frontend and backend.

5. **Enhance Security**: Implement proper security measures for production.

6. **Deploy**: Prepare the application for deployment to a production environment.

## Testing the Application

1. **Create a User**:
   - Use the Django admin to create a test user, or use the admin account

2. **Login**:
   - Login with the created user credentials

3. **Upload a PDF**:
   - Go to the "Upload" page and upload a PDF document

4. **View and Annotate**:
   - Open the uploaded document
   - Select text to annotate
   - Add notes to the selected text
   - Use the TTS feature to listen to the document

## Development Resources

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React Documentation: https://reactjs.org/docs/getting-started.html
- Redux Documentation: https://redux.js.org/introduction/getting-started
