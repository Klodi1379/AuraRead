import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentService } from '../services/api';

// Helper to format error message
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
};

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentService.getDocuments();
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.getDocument(id);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const extractDocumentText = createAsyncThunk(
  'documents/extractDocumentText',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.extractDocumentText(id);
      return {
        id,
        extractedText: response.data.text
      };
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await documentService.uploadDocument(formData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentService.deleteDocument(id);
      return id;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentService.updateDocument(id, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

// Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    currentDocument: null,
    extractedText: null,
    loading: false,
    textLoading: false,
    error: null,
  },
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
      state.extractedText = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchDocument
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.extractedText = null; // Reset extracted text when fetching a new document
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // extractDocumentText
      .addCase(extractDocumentText.pending, (state) => {
        state.textLoading = true;
        state.error = null;
      })
      .addCase(extractDocumentText.fulfilled, (state, action) => {
        state.textLoading = false;
        state.extractedText = action.payload.extractedText;
      })
      .addCase(extractDocumentText.rejected, (state, action) => {
        state.textLoading = false;
        state.error = action.payload;
      })
      // uploadDocument
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteDocument
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
          state.extractedText = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateDocument
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        // Update the document in the documents array
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        // Update currentDocument if it's the same document
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentDocument, clearCurrentDocument } = documentsSlice.actions;

export default documentsSlice.reducer;