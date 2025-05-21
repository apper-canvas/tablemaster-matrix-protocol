import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
  },
});
  devTools: true, // Enable Redux DevTools
});

export default store;