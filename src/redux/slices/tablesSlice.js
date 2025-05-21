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
  ],
  reservations: [
    {
      id: 'res-1',
      tableId: 'table-3',
      customerName: 'Johnson Party',
      phoneNumber: '555-123-4567',
      partySize: 6,
      reservationTime: '2023-07-25T20:00:00',
      duration: 90,
      status: 'confirmed',
      notes: 'Birthday celebration',
      createdAt: '2023-07-20T15:30:00'
    },
    {
      id: 'res-2',
      tableId: 'table-5',
      customerName: 'Garcia Family',
      phoneNumber: '555-987-6543',
      partySize: 4,
      reservationTime: '2023-07-26T18:30:00',
      duration: 60,
      status: 'confirmed',
      notes: '',
      createdAt: '2023-07-21T09:15:00'
    },
    {
      id: 'res-3',
      tableId: 'table-1',
      customerName: 'Thompson Couple',
      phoneNumber: '555-222-3333',
      partySize: 2,
      reservationTime: '2023-07-25T19:00:00',
      duration: 60,
      status: 'cancelled',
      notes: 'Window seat preferred',
      createdAt: '2023-07-20T11:45:00',
      cancelledAt: '2023-07-22T14:20:00',
      cancellationReason: 'Customer request'
    }
  ]
  ,
  waitlist: [
    {
      id: 'wait-1',
      customerName: 'Martinez Family',
      phoneNumber: '555-111-2222',
      partySize: 4,
      notes: 'No window seat',
      timeAdded: '2023-07-25T18:30:00',
      estimatedWaitTime: 25,
      status: 'waiting',
      notified: false
    },
    {
      id: 'wait-2',
      customerName: 'Anderson Party',
      phoneNumber: '555-333-4444',
      partySize: 6,
      notes: 'Birthday celebration',
      timeAdded: '2023-07-25T18:45:00',
      estimatedWaitTime: 35,
      status: 'waiting',
      notified: false
    },
    {
      id: 'wait-3',
      customerName: 'Chen Couple',
      phoneNumber: '555-555-6666',
      partySize: 2,
      notes: 'Anniversary',
      timeAdded: '2023-07-25T19:00:00',
      estimatedWaitTime: 15,
      status: 'waiting',
      notified: false
    }
  ],
  waitlistSettings: {
    enableSmsNotifications: true,
    autoNotify: false
  }
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
    },
    addReservation: (state, action) => {
      const newReservation = {
        id: uuidv4(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...action.payload
      };
      
      state.reservations.push(newReservation);
      
      // Update the table status to reserved if the reservation is for today/near future
      const reservationTime = new Date(newReservation.reservationTime);
      const now = new Date();
      const timeDiff = reservationTime - now;
      
      // If reservation is within the next 24 hours, mark table as reserved
      if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) {
        const tableIndex = state.tables.findIndex(table => table.id === newReservation.tableId);
        if (tableIndex !== -1 && state.tables[tableIndex].status === 'available') {
          state.tables[tableIndex].status = 'reserved';
          state.tables[tableIndex].customerName = newReservation.customerName;
          state.tables[tableIndex].phoneNumber = newReservation.phoneNumber;
          state.tables[tableIndex].reservationTime = newReservation.reservationTime;
        }
      }
    },
    updateReservation: (state, action) => {
      const { id, ...changes } = action.payload;
      const index = state.reservations.findIndex(reservation => reservation.id === id);
      
      if (index !== -1) {
        // Update the reservation
        state.reservations[index] = { 
          ...state.reservations[index], 
          ...changes,
          updatedAt: new Date().toISOString()
        };
        
        // If table changed or time changed, update table statuses accordingly
        const reservation = state.reservations[index];
        const tableIndex = state.tables.findIndex(table => table.id === reservation.tableId);
        
        if (tableIndex !== -1 && state.tables[tableIndex].status === 'reserved') {
          // Update the table's reservation info
          state.tables[tableIndex].customerName = reservation.customerName;
          state.tables[tableIndex].phoneNumber = reservation.phoneNumber;
          state.tables[tableIndex].reservationTime = reservation.reservationTime;
        }
      }
    },
    cancelReservation: (state, action) => {
      const { id, reason } = action.payload;
      const index = state.reservations.findIndex(reservation => reservation.id === id);
      
      if (index !== -1) {
        // Mark the reservation as cancelled
        state.reservations[index].status = 'cancelled';
        state.reservations[index].cancelledAt = new Date().toISOString();
        state.reservations[index].cancellationReason = reason || 'No reason provided';
        
        // Update the table status if it was reserved for this reservation
        const tableId = state.reservations[index].tableId;
        const tableIndex = state.tables.findIndex(table => table.id === tableId && table.status === 'reserved');
        if (tableIndex !== -1) {
          state.tables[tableIndex].status = 'available';
        }
      }
    },
    addToWaitlist: (state, action) => {
      const { customerName, phoneNumber, partySize, notes } = action.payload;
      
      // Calculate estimated wait time based on party size and available tables
      let estimatedWaitTime = 15; // Default base wait time
      
      // Adjust wait time based on party size
      if (partySize > 4) {
        estimatedWaitTime += 10;
      } else if (partySize > 2) {
        estimatedWaitTime += 5;
      }
      
      // Adjust based on number of parties already waiting
      estimatedWaitTime += state.waitlist.filter(entry => entry.status === 'waiting').length * 5;
      
      // Adjust based on table availability
      const availableTables = state.tables.filter(table => 
        table.status === 'available' && table.capacity >= partySize
      ).length;
      
      if (availableTables === 0) {
        estimatedWaitTime += 15;
      }
      
      const newEntry = {
        id: uuidv4(),
        customerName,
        phoneNumber,
        partySize,
        notes,
        timeAdded: new Date().toISOString(),
        estimatedWaitTime,
        status: 'waiting',
        notified: false
      };
      
      state.waitlist.push(newEntry);
    },
    updateWaitlistEntry: (state, action) => {
      const { id, ...changes } = action.payload;
      const index = state.waitlist.findIndex(entry => entry.id === id);
      
      if (index !== -1) {
        state.waitlist[index] = {
          ...state.waitlist[index],
          ...changes,
          updatedAt: new Date().toISOString()
        };
      }
    },
    notifyCustomer: (state, action) => {
      const { id } = action.payload;
      const index = state.waitlist.findIndex(entry => entry.id === id);
      
      if (index !== -1) {
        state.waitlist[index].notified = true;
        state.waitlist[index].notifiedAt = new Date().toISOString();
      }
    },
    removeFromWaitlist: (state, action) => {
      const { id, reason } = action.payload;
      const index = state.waitlist.findIndex(entry => entry.id === id);
      
      if (index !== -1) {
        if (reason === 'seated') {
          state.waitlist[index].status = 'seated';
          state.waitlist[index].seatedAt = new Date().toISOString();
        } else {
          state.waitlist[index].status = 'cancelled';
          state.waitlist[index].cancelledAt = new Date().toISOString();
        }
      }
    }
  }
});
export const { addTable, updateTable, deleteTable, moveTable, setTableStatus, addReservation, updateReservation, cancelReservation, addToWaitlist, updateWaitlistEntry, notifyCustomer, removeFromWaitlist } = tablesSlice.actions;
export default tablesSlice.reducer;