import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import addictionsReducer from './slices/addictionsSlice';
import rescuerReducer from './slices/rescuerSlice';
import trackerReducer from './slices/trackerSlice';
import checkInsReducer from './slices/checkInsSlice';
import journalsReducer from './slices/journalsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    addictions: addictionsReducer,
    rescuer: rescuerReducer,
    tracker: trackerReducer,
    checkIns: checkInsReducer,
    journals: journalsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
