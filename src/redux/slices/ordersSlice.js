import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Define order status options
export const ORDER_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in-progress',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Define payment status options
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

// Sample menu items for initial orders
const sampleMenuItems = [
  { id: 'item1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza' },
  { id: 'item2', name: 'Caesar Salad', price: 8.99, category: 'Salads' },
  { id: 'item3', name: 'Spaghetti Carbonara', price: 14.99, category: 'Pasta' },
  { id: 'item4', name: 'Garlic Bread', price: 4.99, category: 'Sides' },
  { id: 'item5', name: 'Tiramisu', price: 6.99, category: 'Desserts' },
  { id: 'item6', name: 'Iced Tea', price: 2.99, category: 'Beverages' },
];

// Sample initial orders
const initialOrders = [
  {
    id: uuidv4(),
    tableId: 'table-1',
    tableName: 'Table 1',
    customerName: 'John Doe',
    status: ORDER_STATUS.NEW,
    paymentStatus: PAYMENT_STATUS.PENDING,
    items: [
      { ...sampleMenuItems[0], quantity: 1, notes: 'Extra cheese' },
      { ...sampleMenuItems[3], quantity: 2, notes: '' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'Allergic to nuts',
    totalAmount: 22.97,
  },
  {
    id: uuidv4(),
    tableId: 'table-2',
    tableName: 'Table 2',
    customerName: 'Jane Smith',
    status: ORDER_STATUS.IN_PROGRESS,
    paymentStatus: PAYMENT_STATUS.PENDING,
    items: [
      { ...sampleMenuItems[2], quantity: 1, notes: '' },
      { ...sampleMenuItems[1], quantity: 1, notes: 'Dressing on the side' },
      { ...sampleMenuItems[5], quantity: 2, notes: 'No ice' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    specialInstructions: '',
    totalAmount: 29.96,
  },
  {
    id: uuidv4(),
    tableId: 'table-3',
    tableName: 'Table 3',
    customerName: 'Robert Johnson',
    status: ORDER_STATUS.READY,
    paymentStatus: PAYMENT_STATUS.PAID,
    items: [
      { ...sampleMenuItems[0], quantity: 2, notes: '' },
      { ...sampleMenuItems[4], quantity: 2, notes: '' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    specialInstructions: 'Birthday celebration',
    totalAmount: 39.96,
  },
  {
    id: uuidv4(),
    tableId: 'table-4',
    tableName: 'Table 4',
    customerName: 'Maria Garcia',
    status: ORDER_STATUS.DELIVERED,
    paymentStatus: PAYMENT_STATUS.PAID,
    items: [
      { ...sampleMenuItems[2], quantity: 1, notes: '' },
      { ...sampleMenuItems[5], quantity: 1, notes: '' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    specialInstructions: '',
    totalAmount: 17.98,
  },
  {
    id: uuidv4(),
    tableId: 'table-5',
    tableName: 'Table 5',
    customerName: 'David Williams',
    status: ORDER_STATUS.CANCELLED,
    paymentStatus: PAYMENT_STATUS.REFUNDED,
    items: [
      { ...sampleMenuItems[1], quantity: 1, notes: '' },
      { ...sampleMenuItems[4], quantity: 1, notes: '' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    specialInstructions: 'Ordered wrong items',
    totalAmount: 15.98,
  },
];

const initialState = {
  orders: initialOrders,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Create a new order
    createOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.orders.push(newOrder);
    },
    
    // Update an existing order
    updateOrder: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const index = state.orders.findIndex(order => order.id === id);
      
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // Update order status
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.orders.findIndex(order => order.id === id);
      
      if (index !== -1) {
        state.orders[index].status = status;
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },
    
    // Update payment status
    updatePaymentStatus: (state, action) => {
      const { id, paymentStatus } = action.payload;
      const index = state.orders.findIndex(order => order.id === id);
      
      if (index !== -1) {
        state.orders[index].paymentStatus = paymentStatus;
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },
    
    // Delete an order
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    }
  },
});

export const { createOrder, updateOrder, updateOrderStatus, updatePaymentStatus, deleteOrder } = ordersSlice.actions;

export default ordersSlice.reducer;