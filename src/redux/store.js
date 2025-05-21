import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    // Add other reducers here as needed
  },
  devTools: true, // Enable Redux DevTools
});

export default store;