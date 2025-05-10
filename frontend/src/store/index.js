import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './documentsSlice';
import annotationsReducer from './annotationsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    annotations: annotationsReducer,
    auth: authReducer,
  },
});

export default store;
