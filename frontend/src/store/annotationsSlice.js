import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { annotationService } from '../services/api';

// Helper to format error message
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
};

// Async thunks
export const fetchAnnotations = createAsyncThunk(
  'annotations/fetchAnnotations',
  async (documentId, { rejectWithValue }) => {
    try {
      console.log(`Fetching annotations for document: ${documentId}`);
      const response = await annotationService.getAnnotations(documentId);
      console.log(`Annotations fetched successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching annotations:`, error);
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const createAnnotation = createAsyncThunk(
  'annotations/createAnnotation',
  async (annotationData, { rejectWithValue }) => {
    try {
      const response = await annotationService.createAnnotation(annotationData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const updateAnnotation = createAsyncThunk(
  'annotations/updateAnnotation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await annotationService.updateAnnotation(id, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const deleteAnnotation = createAsyncThunk(
  'annotations/deleteAnnotation',
  async (id, { rejectWithValue }) => {
    try {
      await annotationService.deleteAnnotation(id);
      return id;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

// Slice
const annotationsSlice = createSlice({
  name: 'annotations',
  initialState: {
    annotations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAnnotations: (state) => {
      // Always reset to an empty array
      state.annotations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAnnotations
      .addCase(fetchAnnotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnotations.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure annotations is always an array
        state.annotations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAnnotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createAnnotation
      .addCase(createAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure annotations is an array before pushing
        if (!Array.isArray(state.annotations)) {
          state.annotations = [];
        }
        state.annotations.push(action.payload);
      })
      .addCase(createAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateAnnotation
      .addCase(updateAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure annotations is an array before updating
        if (!Array.isArray(state.annotations)) {
          state.annotations = [];
          return;
        }
        const index = state.annotations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.annotations[index] = action.payload;
        }
      })
      .addCase(updateAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteAnnotation
      .addCase(deleteAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure annotations is an array before filtering
        if (!Array.isArray(state.annotations)) {
          state.annotations = [];
          return;
        }
        state.annotations = state.annotations.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnnotations } = annotationsSlice.actions;

export default annotationsSlice.reducer;
