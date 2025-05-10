import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/api';

// Helper to format error message
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unknown error occurred';
};

// Load user from localStorage on startup
const loadUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      return {
        isAuthenticated: true,
        token,
        user,
        loading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  
  return {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null
  };
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Save token and user to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // Remove token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      // Even if the server request fails, we should still clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      return rejectWithValue(formatErrorMessage(errorData));
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: loadUserFromStorage(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        // If we can't get the current user, we should log out
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;