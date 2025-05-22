import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import tablesReducer from './slices/tablesSlice';
import ordersReducer from './slices/ordersSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    tables: tablesReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
  }, 
  devTools: true, // Enable Redux DevTools
});

export default store;