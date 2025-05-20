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
      // Use the correct token format based on the backend authentication
      config.headers['Authorization'] = `Token ${token}`;
      console.log('Adding auth token to request:', config.url);
    } else {
      console.log('No auth token available for request:', config.url);
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
    console.log(`TTS Request - Document: ${id}, Text length: ${text.length}, Language: ${language}, Prefer offline: ${preferOffline}, Voice: "${voiceName || 'default'}"`);

    // Create a FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('text', text);

    // Add language if provided
    if (language) {
      formData.append('language', language);
      console.log(`Adding language to request: "${language}"`);
    }

    // Add preference for offline TTS
    formData.append('prefer_offline', preferOffline.toString());
    console.log(`Adding prefer_offline to request: "${preferOffline.toString()}"`);

    // Add voice name if provided
    if (voiceName) {
      formData.append('voice_name', voiceName);
      console.log(`Adding voice_name to request: "${voiceName}"`);

      // Log the full voice name for debugging
      console.log(`Full voice name being sent: "${voiceName}"`);
    } else {
      console.log('No voice name provided, using default voice');
    }

    // Log the FormData entries for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(`- ${pair[0]}: "${pair[1]}"`);
    }

    return api.post(`documents/${id}/tts/`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'audio/mpeg, audio/wav, application/octet-stream, */*',
      }
    }).then(response => {
      console.log('TTS response received successfully');
      return response;
    }).catch(error => {
      console.error('TTS request failed:', error);

      // Try to extract more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data instanceof Blob) {
          // Try to read the blob as text to get the error message
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              console.error('Error details:', errorData);
            } catch (e) {
              console.error('Error response (not JSON):', reader.result);
            }
          };
          reader.readAsText(error.response.data);
        }
      }

      throw error;
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