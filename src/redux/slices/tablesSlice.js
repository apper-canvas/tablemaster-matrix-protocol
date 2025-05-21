import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Initial state with sample tables
const initialState = {
  tables: [
    {
      id: 'table-1',
      number: 1,
      capacity: 2,
      shape: 'circle',
      status: 'available',
      x: 50,
      y: 100,
      width: 60,
      height: 60,
      section: 'main'
    },
    {
      id: 'table-2',
      number: 2,
      capacity: 4,
      shape: 'rectangle',
      status: 'occupied',
      customer: 'Smith Family',
      timeSeated: '2023-07-25T19:30:00',
      estimatedEndTime: '2023-07-25T20:30:00',
      server: 'John D.',
      x: 150,
      y: 100,
      width: 80,
      height: 60,
      section: 'main'
    },
    {
      id: 'table-3',
      number: 3,
      capacity: 6,
      shape: 'rectangle',
      status: 'reserved',
      reservationTime: '2023-07-25T20:00:00',
      customerName: 'Johnson Party',
      phoneNumber: '555-123-4567',
      x: 250,
      y: 100,
      width: 100,
      height: 60,
      section: 'main'
    },
    {
      id: 'table-4',
      number: 4,
      capacity: 2,
      shape: 'circle',
      status: 'cleaning',
      x: 50,
      y: 200,
      width: 60,
      height: 60,
      section: 'window'
    },
    {
      id: 'table-5',
      number: 5,
      capacity: 4,
      shape: 'rectangle',
      status: 'available',
      x: 150,
      y: 200,
      width: 80,
      height: 60,
      section: 'window'
    },
    {
      id: 'table-6',
      number: 6,
      capacity: 8,
      shape: 'rectangle',
      status: 'occupied',
      customer: 'Williams Group',
      timeSeated: '2023-07-25T18:45:00',
      estimatedEndTime: '2023-07-25T20:15:00',
      server: 'Sarah M.',
      x: 250,
      y: 200,
      width: 120,
      height: 80,
      section: 'private'
    }
  ],
  sections: [
    { id: 'main', name: 'Main Dining', color: '#e0f2fe' },
    { id: 'window', name: 'Window Seating', color: '#dcfce7' },
    { id: 'private', name: 'Private Dining', color: '#fef3c7' },
    { id: 'bar', name: 'Bar Area', color: '#f1f5f9' },
    { id: 'outdoor', name: 'Outdoor Patio', color: '#d1fae5' }
  ]
};

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    addTable: (state, action) => {
      const newTable = {
        id: uuidv4(),
        ...action.payload,
        status: 'available',
      };
      state.tables.push(newTable);
    },
    updateTable: (state, action) => {
      const index = state.tables.findIndex(table => table.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = { ...state.tables[index], ...action.payload };
      }
    },
    deleteTable: (state, action) => {
      state.tables = state.tables.filter(table => table.id !== action.payload);
    },
    moveTable: (state, action) => {
      const { id, x, y } = action.payload;
      const index = state.tables.findIndex(table => table.id === id);
      if (index !== -1) {
        state.tables[index].x = x;
        state.tables[index].y = y;
      }
    },
    setTableStatus: (state, action) => {
      const { id, status, customer, reservationTime, timeSeated, estimatedEndTime, server, customerName, phoneNumber } = action.payload;
      const index = state.tables.findIndex(table => table.id === id);
      if (index !== -1) {
        state.tables[index].status = status;
        
        // Clear previous customer data if status is 'available' or 'cleaning'
        if (status === 'available' || status === 'cleaning') {
          state.tables[index].customer = undefined;
          state.tables[index].timeSeated = undefined;
          state.tables[index].estimatedEndTime = undefined;
          state.tables[index].server = undefined;
          state.tables[index].reservationTime = undefined;
          state.tables[index].customerName = undefined;
          state.tables[index].phoneNumber = undefined;
        } else {
          // Update with new data for 'occupied' or 'reserved'
          if (customer) state.tables[index].customer = customer;
          if (timeSeated) state.tables[index].timeSeated = timeSeated;
          if (estimatedEndTime) state.tables[index].estimatedEndTime = estimatedEndTime;
          if (server) state.tables[index].server = server;
          if (reservationTime) state.tables[index].reservationTime = reservationTime;
          if (customerName) state.tables[index].customerName = customerName;
          if (phoneNumber) state.tables[index].phoneNumber = phoneNumber;
        }
      }
    }
  }
});

export const { addTable, updateTable, deleteTable, moveTable, setTableStatus } = tablesSlice.actions;

export default tablesSlice.reducer;