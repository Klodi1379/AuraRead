import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to false to avoid credentials mode conflicts
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('login/', credentials),
  register: (userData) => api.post('register/', userData),
  logout: () => api.post('logout/'),
  getCurrentUser: () => api.get('users/me/'),
};

// Document services
export const documentService = {
  getDocuments: () => api.get('documents/'),
  getDocument: (id) => api.get(`documents/${id}/`),
  extractDocumentText: (id) => api.get(`documents/${id}/extract_text/`),
  uploadDocument: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('documents/', formData, config);
  },
  deleteDocument: (id) => api.delete(`documents/${id}/`),
  getAvailableVoices: () => {
    return api.get('documents/available_voices/');
  },

  convertToSpeech: (id, text, language = '', preferOffline = true, voiceName = null) => {
    // Create a FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('text', text);

    // Add language if provided
    if (language) {
      formData.append('language', language);
    }

    // Add preference for offline TTS
    formData.append('prefer_offline', preferOffline.toString());

    // Add voice name if provided
    if (voiceName) {
      formData.append('voice_name', voiceName);
    }

    return api.post(`documents/${id}/tts/`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'audio/mpeg, audio/wav, application/octet-stream, */*',
      }
    });
  },

  updateDocument: (id, data) => api.patch(`documents/${id}/`, data),
};

// Annotation services
export const annotationService = {
  getAnnotations: (documentId) => api.get(`annotations/?document=${documentId}`),
  createAnnotation: (data) => api.post('annotations/', data),
  updateAnnotation: (id, data) => api.put(`annotations/${id}/`, data),
  deleteAnnotation: (id) => api.delete(`annotations/${id}/`),
};

export default api;