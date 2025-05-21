import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import tablesReducer from './slices/tablesSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    tables: tablesReducer,
    inventory: inventoryReducer,
  }, 
  devTools: true, // Enable Redux DevTools

export default store;
export default store;