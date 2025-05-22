import { createSlice } from '@reduxjs/toolkit';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

// Helper function to generate dates for sample data
const generateDateRange = (days) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return format(date, 'yyyy-MM-dd');
  });
};

// Generate sample data for 30 days
const dates = generateDateRange(30);

// Sample data for sales report
const salesData = dates.map(date => {
  // Generate more realistic daily sales with weekend peaks
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseSales = Math.floor(Math.random() * 2000) + 3000;
  const sales = isWeekend ? baseSales * 1.5 : baseSales;
  
  return {
    date,
    totalSales: Math.round(sales),
    orderCount: Math.floor(Math.random() * 50) + 70,
    averageOrderValue: Math.round((sales / (Math.floor(Math.random() * 50) + 70)) * 100) / 100,
    topSellingItems: [
      { name: 'Margherita Pizza', quantity: Math.floor(Math.random() * 20) + 10 },
      { name: 'Caesar Salad', quantity: Math.floor(Math.random() * 15) + 5 },
      { name: 'Spaghetti Carbonara', quantity: Math.floor(Math.random() * 10) + 8 },
    ]
  };
});

// Sample data for inventory report
const inventoryData = [
  { 
    category: 'Dry Goods',
    items: [
      { name: 'Flour', currentStock: 25, parLevel: 10, status: 'Good' },
      { name: 'Rice', currentStock: 18, parLevel: 15, status: 'Good' },
      { name: 'Pasta', currentStock: 12, parLevel: 15, status: 'Low' },
    ] 
  },
  { 
    category: 'Meat',
    items: [
      { name: 'Chicken Breast', currentStock: 8, parLevel: 15, status: 'Low' },
      { name: 'Beef', currentStock: 12, parLevel: 10, status: 'Good' },
      { name: 'Pork', currentStock: 5, parLevel: 10, status: 'Critical' },
    ] 
  },
  { 
    category: 'Produce',
    items: [
      { name: 'Tomatoes', currentStock: 12, parLevel: 10, status: 'Good' },
      { name: 'Lettuce', currentStock: 8, parLevel: 10, status: 'Low' },
      { name: 'Onions', currentStock: 15, parLevel: 10, status: 'Good' },
    ] 
  },
  { 
    category: 'Dairy',
    items: [
      { name: 'Milk', currentStock: 6, parLevel: 8, status: 'Low' },
      { name: 'Cheese', currentStock: 10, parLevel: 8, status: 'Good' },
      { name: 'Butter', currentStock: 4, parLevel: 5, status: 'Low' },
    ] 
  },
];

// Sample data for staff performance
const staffPerformanceData = [
  { name: 'John Smith', role: 'Server', ordersProcessed: 210, salesAmount: 6450, averageRating: 4.8 },
  { name: 'Emma Davis', role: 'Server', ordersProcessed: 185, salesAmount: 5950, averageRating: 4.7 },
  { name: 'Michael Brown', role: 'Server', ordersProcessed: 195, salesAmount: 6200, averageRating: 4.5 },
  { name: 'Sarah Wilson', role: 'Host', ordersProcessed: 0, salesAmount: 0, averageRating: 4.9 },
  { name: 'David Johnson', role: 'Server', ordersProcessed: 175, salesAmount: 5400, averageRating: 4.6 },
  { name: 'Lisa Rodriguez', role: 'Server', ordersProcessed: 220, salesAmount: 6800, averageRating: 4.9 },
  { name: 'Robert Taylor', role: 'Bartender', ordersProcessed: 310, salesAmount: 4900, averageRating: 4.7 },
  { name: 'Jennifer Lee', role: 'Server', ordersProcessed: 190, salesAmount: 5800, averageRating: 4.8 },
];

// Sample data for table utilization
const tableUtilizationData = dates.map(date => {
  // Random but consistent data for each date
  const dateObj = new Date(date);
  const dateValue = dateObj.getDate();
  
  return {
    date,
    totalSeatedTime: Math.floor(Math.random() * 300) + 500,
    turnoverRate: (Math.random() * 1.5 + 3.5).toFixed(1),
    averageSeatedDuration: Math.floor(Math.random() * 15) + 45,
    peakHours: [
      { hour: '12:00', utilization: Math.floor(Math.random() * 30) + 70 },
      { hour: '19:00', utilization: Math.floor(Math.random() * 20) + 80 },
    ]
  };
});

const initialState = {
  salesReport: {
    data: salesData,
    filteredData: salesData,
    dateRange: {
      startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    },
    loading: false,
    error: null
  },
  inventoryReport: {
    data: inventoryData,
    loading: false,
    error: null
  },
  staffReport: {
    data: staffPerformanceData,
    loading: false,
    error: null
  },
  tableReport: {
    data: tableUtilizationData,
    filteredData: tableUtilizationData.slice(-7), // Last 7 days
    dateRange: {
      startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    },
    loading: false,
    error: null
  }
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Set date range and filter data for sales report
    setDateRangeSales: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.salesReport.dateRange = { startDate, endDate };
      
      // Filter data based on date range
      state.salesReport.filteredData = state.salesReport.data.filter(item => {
        const date = new Date(item.date);
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        return isWithinInterval(date, { start, end });
      });
    },
    
    // Set date range and filter data for table report
    setDateRangeTable: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.tableReport.dateRange = { startDate, endDate };
      
      // Filter data based on date range
      state.tableReport.filteredData = state.tableReport.data.filter(item => {
        const date = new Date(item.date);
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        return isWithinInterval(date, { start, end });
      });
    },
    
    // Mark reports as loading
    setReportLoading: (state, action) => {
      const { reportType, loading } = action.payload;
      state[reportType].loading = loading;
    },
    
    // Set error for a report
    setReportError: (state, action) => {
      const { reportType, error } = action.payload;
      state[reportType].error = error;
    },
    
    // Export report (in a real app, this would handle API calls or file generation)
    exportReport: (state, action) => {
      // This is a placeholder for the export functionality
      // In a real application, this would trigger side effects via middleware
      // to handle the actual export process
      return state;
    }
  }
});

export const {
  setDateRangeSales,
  setDateRangeTable,
  setReportLoading,
  setReportError,
  exportReport
} = reportsSlice.actions;

export default reportsSlice.reducer;