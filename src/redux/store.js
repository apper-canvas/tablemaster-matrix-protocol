import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import tablesReducer from './slices/tablesSlice';
import ordersReducer from './slices/ordersSlice';
import reportsReducer from './slices/reportsSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    tables: tablesReducer,
    orders: ordersReducer,
    reports: reportsReducer,
    inventory: inventoryReducer,
  }, 
  devTools: true, // Enable Redux DevTools
});

export default store;