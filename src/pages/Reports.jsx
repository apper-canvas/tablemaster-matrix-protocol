import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { format, parseISO, subDays } from 'date-fns';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { setDateRangeSales, setDateRangeTable, exportReport } from '../redux/slices/reportsSlice';

// Icons
const DownloadIcon = getIcon('download');
const CalendarIcon = getIcon('calendar');
const RefreshIcon = getIcon('refresh-cw');
const DollarIcon = getIcon('dollar-sign');
const ShoppingBagIcon = getIcon('shopping-bag');
const UsersIcon = getIcon('users');
const ClipboardIcon = getIcon('clipboard');
const BarChartIcon = getIcon('bar-chart-2');
const PieChartIcon = getIcon('pie-chart');
const LayersIcon = getIcon('layers');
const TrendingUpIcon = getIcon('trending-up');
const AlertIcon = getIcon('alert-triangle');

// DateRangePicker Component
const DateRangePicker = ({ dateRange, onDateChange }) => {
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleApply = () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    onDateChange({ startDate, endDate });
    toast.success('Date range updated');
  };

  const handleQuickSelect = (days) => {
    const end = format(new Date(), 'yyyy-MM-dd');
    const start = format(subDays(new Date(), days), 'yyyy-MM-dd');
    setStartDate(start);
    setEndDate(end);
    onDateChange({ startDate: start, endDate: end });
    toast.success('Date range updated');
  };

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="start-date" className="label">Start Date</label>
          <div className="relative">
            <input
              id="start-date"
              type="date"
              className="input pl-10"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate}
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="end-date" className="label">End Date</label>
          <div className="relative">
            <input
              id="end-date"
              type="date"
              className="input pl-10"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 flex items-end">
          <button
            onClick={handleApply}
            className="btn btn-primary flex-1"
          >
            Apply
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickSelect(7)}
          className="px-3 py-1 text-xs font-medium rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handleQuickSelect(14)}
          className="px-3 py-1 text-xs font-medium rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
        >
          Last 14 Days
        </button>
        <button
          onClick={() => handleQuickSelect(30)}
          className="px-3 py-1 text-xs font-medium rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600"
        >
          Last 30 Days
        </button>
      </div>
    </div>
  );
};

// ReportCard Component
const ReportCard = ({ title, icon, value, trend, trendValue, description }) => {
  const IconComponent = icon;
  const isTrendUp = trend === 'up';
  
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
            <IconComponent className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</h3>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
        </div>
        
        {trendValue && (
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isTrendUp 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isTrendUp ? <TrendingUpIcon className="w-3 h-3 mr-1" /> : <TrendingUpIcon className="w-3 h-3 mr-1 transform rotate-180" />}
            {trendValue}
          </div>
        )}
      </div>
      
      {description && (
        <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">{description}</p>
      )}
    </div>
  );
};

// Chart Component with theme support
const ThemedChart = ({ options, series, type, height }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Customize chart based on theme
  const themedOptions = {
    ...options,
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
    chart: {
      ...options.chart,
      background: 'transparent',
    },
    tooltip: {
      ...options.tooltip,
      theme: isDarkMode ? 'dark' : 'light',
    },
    grid: {
      ...options.grid,
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    },
    xaxis: {
      ...options.xaxis,
      labels: {
        ...options?.xaxis?.labels,
        style: {
          ...options?.xaxis?.labels?.style,
          colors: isDarkMode ? '#94a3b8' : '#64748b',
        },
      },
    },
    yaxis: {
      ...options.yaxis,
      labels: {
        ...options?.yaxis?.labels,
        style: {
          ...options?.yaxis?.labels?.style,
          colors: isDarkMode ? '#94a3b8' : '#64748b',
        },
      },
    },
  };
  
  return (
    <Chart
      options={themedOptions}
      series={series}
      type={type}
      height={height || 350}
    />
  );
};

// SalesReportTab Component
const SalesReportTab = () => {
  const dispatch = useDispatch();
  const { filteredData, dateRange } = useSelector((state) => state.reports.salesReport);
  
  const handleDateChange = (newDateRange) => {
    dispatch(setDateRangeSales(newDateRange));
  };
  
  const handleExport = () => {
    dispatch(exportReport({ type: 'sales', format: 'csv' }));
    toast.success('Sales report exported successfully');
  };
  
  // Calculate summary metrics
  const totalSales = filteredData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = filteredData.reduce((sum, day) => sum + day.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
  
  // Prepare chart data
  const salesChartData = {
    options: {
      chart: {
        id: 'sales-chart',
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      xaxis: {
        categories: filteredData.map(item => format(parseISO(item.date), 'MMM dd')),
        title: {
          text: 'Date',
        },
      },
      yaxis: {
        title: {
          text: 'Amount ($)',
        },
      },
      stroke: {
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'Daily Sales',
        align: 'left',
      },
      grid: {
        borderColor: '#e2e8f0',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.2,
        },
      },
      markers: {
        size: 5,
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `$${val.toFixed(2)}`;
          }
        }
      }
    },
    series: [
      {
        name: 'Sales',
        data: filteredData.map(item => item.totalSales),
      },
    ],
  };
  
  const orderChartData = {
    options: {
      chart: {
        id: 'orders-chart',
        toolbar: {
          show: true,
        },
      },
      xaxis: {
        categories: filteredData.map(item => format(parseISO(item.date), 'MMM dd')),
      },
      yaxis: {
        title: {
          text: 'Orders',
        },
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        text: 'Daily Order Count',
        align: 'left',
      },
      grid: {
        borderColor: '#e2e8f0',
      },
      dataLabels: {
        enabled: false,
      },
    },
    series: [
      {
        name: 'Orders',
        data: filteredData.map(item => item.orderCount),
      },
    ],
  };
  
  // Prepare top selling items data
  const topSellingItems = {};
  filteredData.forEach(day => {
    day.topSellingItems.forEach(item => {
      if (topSellingItems[item.name]) {
        topSellingItems[item.name] += item.quantity;
      } else {
        topSellingItems[item.name] = item.quantity;
      }
    });
  });
  
  const topItemsArray = Object.entries(topSellingItems)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  const topItemsChartData = {
    options: {
      chart: {
        type: 'bar',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: topItemsArray.map(item => item.name),
      },
      title: {
        text: 'Top Selling Items',
        align: 'left',
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `${val} orders`;
          }
        }
      }
    },
    series: [
      {
        name: 'Quantity Sold',
        data: topItemsArray.map(item => item.quantity),
      },
    ],
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Sales Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      <DateRangePicker dateRange={dateRange} onDateChange={handleDateChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportCard
          title="Total Sales"
          icon={DollarIcon}
          value={`$${totalSales.toLocaleString()}`}
          trend="up"
          trendValue="12.5%"
          description="Compared to previous period"
        />
        <ReportCard
          title="Total Orders"
          icon={ShoppingBagIcon}
          value={totalOrders.toLocaleString()}
          trend="up"
          trendValue="8.2%"
          description="Compared to previous period"
        />
        <ReportCard
          title="Average Order Value"
          icon={BarChartIcon}
          value={`$${avgOrderValue}`}
          trend="up"
          trendValue="5.3%"
          description="Compared to previous period"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <ThemedChart
            options={salesChartData.options}
            series={salesChartData.series}
            type="line"
            height={320}
          />
        </div>
        <div className="card p-5">
          <ThemedChart
            options={orderChartData.options}
            series={orderChartData.series}
            type="line"
            height={320}
          />
        </div>
      </div>
      
      <div className="card p-5 mb-6">
        <ThemedChart
          options={topItemsChartData.options}
          series={topItemsChartData.series}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

// InventoryReportTab Component
const InventoryReportTab = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.reports.inventoryReport);
  
  const handleExport = () => {
    dispatch(exportReport({ type: 'inventory', format: 'csv' }));
    toast.success('Inventory report exported successfully');
  };
  
  // Calculate inventory status counts
  const statusCounts = { Good: 0, Low: 0, Critical: 0 };
  let totalItems = 0;
  
  data.forEach(category => {
    category.items.forEach(item => {
      statusCounts[item.status]++;
      totalItems++;
    });
  });
  
  // Prepare chart data
  const inventoryStatusChartData = {
    options: {
      chart: {
        type: 'pie',
      },
      labels: ['Good', 'Low', 'Critical'],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      title: {
        text: 'Inventory Status',
        align: 'left',
      },
      legend: {
        position: 'bottom',
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    },
    series: [statusCounts.Good, statusCounts.Low, statusCounts.Critical],
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Inventory Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportCard
          title="Total Items"
          icon={LayersIcon}
          value={totalItems}
          description="Total inventory items tracked"
        />
        <ReportCard
          title="Low Stock Items"
          icon={AlertIcon}
          value={statusCounts.Low}
          trend="up"
          trendValue="3.2%"
          description="Items below optimal level"
        />
        <ReportCard
          title="Critical Items"
          icon={AlertIcon}
          value={statusCounts.Critical}
          trend="down"
          trendValue="1.5%"
          description="Items requiring immediate restock"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <ThemedChart
            options={inventoryStatusChartData.options}
            series={inventoryStatusChartData.series}
            type="pie"
            height={320}
          />
        </div>
        
        <div className="card p-5">
          <h3 className="text-lg font-medium mb-4">Items Below Par Level</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Par Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {data.flatMap(category => 
                  category.items
                    .filter(item => item.status !== 'Good')
                    .map((item, index) => (
                      <tr key={`${category.category}-${item.name}-${index}`}>
                        <td className="px-4 py-3 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-sm">{category.category}</td>
                        <td className="px-4 py-3 text-sm">{item.currentStock}</td>
                        <td className="px-4 py-3 text-sm">{item.parLevel}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Low' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="card p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Inventory by Category</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Total Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Good</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Low</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Critical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {data.map((category, index) => {
                const counts = { Good: 0, Low: 0, Critical: 0 };
                category.items.forEach(item => counts[item.status]++);
                
                return (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium">{category.category}</td>
                    <td className="px-4 py-3 text-sm">{category.items.length}</td>
                    <td className="px-4 py-3 text-sm">{counts.Good}</td>
                    <td className="px-4 py-3 text-sm">{counts.Low}</td>
                    <td className="px-4 py-3 text-sm">{counts.Critical}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// StaffReportTab Component
const StaffReportTab = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.reports.staffReport);
  
  const handleExport = () => {
    dispatch(exportReport({ type: 'staff', format: 'csv' }));
    toast.success('Staff report exported successfully');
  };
  
  // Calculate total metrics
  const totalSales = data.reduce((sum, staff) => sum + staff.salesAmount, 0);
  const totalOrders = data.reduce((sum, staff) => sum + staff.ordersProcessed, 0);
  const averageRating = data.reduce((sum, staff) => sum + staff.averageRating, 0) / data.length;
  
  // Prepare chart data for staff performance
  const serverData = data.filter(staff => staff.role === 'Server');
  
  const staffSalesChartData = {
    options: {
      chart: {
        type: 'bar',
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: serverData.map(staff => staff.name),
      },
      yaxis: {
        title: {
          text: 'Sales Amount ($)',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `$${val}`;
          }
        }
      }
    },
    series: [
      {
        name: 'Sales Amount',
        data: serverData.map(staff => staff.salesAmount),
      },
    ],
  };
  
  const staffOrdersChartData = {
    options: {
      chart: {
        type: 'bar',
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: serverData.map(staff => staff.name),
      },
      yaxis: {
        title: {
          text: 'Orders Processed',
        },
      },
      fill: {
        opacity: 1,
      },
    },
    series: [
      {
        name: 'Orders Processed',
        data: serverData.map(staff => staff.ordersProcessed),
      },
    ],
  };
  
  const staffRatingChartData = {
    options: {
      chart: {
        type: 'radar',
      },
      title: {
        text: 'Staff Ratings',
        align: 'left',
      },
      xaxis: {
        categories: data.map(staff => staff.name),
      },
      yaxis: {
        min: 0,
        max: 5,
      },
      markers: {
        size: 5,
      },
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius: 2,
        }
      }
    },
    series: [
      {
        name: 'Rating',
        data: data.map(staff => staff.averageRating),
      },
    ],
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Staff Performance Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportCard
          title="Total Sales"
          icon={DollarIcon}
          value={`$${totalSales.toLocaleString()}`}
          description="Combined sales from all staff"
        />
        <ReportCard
          title="Total Orders"
          icon={ClipboardIcon}
          value={totalOrders.toLocaleString()}
          description="Orders processed by all staff"
        />
        <ReportCard
          title="Average Rating"
          icon={UsersIcon}
          value={averageRating.toFixed(1)}
          description="Average staff performance rating"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <ThemedChart
            options={staffSalesChartData.options}
            series={staffSalesChartData.series}
            type="bar"
            height={320}
          />
        </div>
        <div className="card p-5">
          <ThemedChart
            options={staffOrdersChartData.options}
            series={staffOrdersChartData.series}
            type="bar"
            height={320}
          />
        </div>
      </div>
      
      <div className="card p-5 mb-6">
        <ThemedChart
          options={staffRatingChartData.options}
          series={staffRatingChartData.series}
          type="radar"
          height={350}
        />
      </div>
      
      <div className="card p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Staff Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {data.map((staff, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm font-medium">{staff.name}</td>
                  <td className="px-4 py-3 text-sm">{staff.role}</td>
                  <td className="px-4 py-3 text-sm">{staff.ordersProcessed}</td>
                  <td className="px-4 py-3 text-sm">${staff.salesAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-sm mr-2">{staff.averageRating.toFixed(1)}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(staff.averageRating) ? 'text-yellow-400' : 'text-surface-300 dark:text-surface-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// TableUtilizationTab Component
const TableUtilizationTab = () => {
  const dispatch = useDispatch();
  const { filteredData, dateRange } = useSelector((state) => state.reports.tableReport);
  
  const handleDateChange = (newDateRange) => {
    dispatch(setDateRangeTable(newDateRange));
  };
  
  const handleExport = () => {
    dispatch(exportReport({ type: 'table', format: 'csv' }));
    toast.success('Table utilization report exported successfully');
  };
  
  // Calculate summary metrics
  const avgTurnoverRate = filteredData.reduce((sum, day) => sum + parseFloat(day.turnoverRate), 0) / filteredData.length;
  const avgSeatedDuration = filteredData.reduce((sum, day) => sum + day.averageSeatedDuration, 0) / filteredData.length;
  
  // Prepare chart data for turnover rate
  const turnoverChartData = {
    options: {
      chart: {
        type: 'line',
        toolbar: {
          show: true,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      xaxis: {
        categories: filteredData.map(item => format(parseISO(item.date), 'MMM dd')),
        title: {
          text: 'Date',
        },
      },
      yaxis: {
        title: {
          text: 'Turnover Rate',
        },
      },
      title: {
        text: 'Table Turnover Rate',
        align: 'left',
      },
      markers: {
        size: 5,
      },
      dataLabels: {
        enabled: false,
      },
    },
    series: [
      {
        name: 'Turnover Rate',
        data: filteredData.map(item => parseFloat(item.turnoverRate)),
      },
    ],
  };
  
  // Prepare chart data for average seated duration
  const durationChartData = {
    options: {
      chart: {
        type: 'line',
        toolbar: {
          show: true,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      xaxis: {
        categories: filteredData.map(item => format(parseISO(item.date), 'MMM dd')),
        title: {
          text: 'Date',
        },
      },
      yaxis: {
        title: {
          text: 'Minutes',
        },
      },
      title: {
        text: 'Average Seated Duration',
        align: 'left',
      },
      markers: {
        size: 5,
      },
      dataLabels: {
        enabled: false,
      },
    },
    series: [
      {
        name: 'Minutes',
        data: filteredData.map(item => item.averageSeatedDuration),
      },
    ],
  };
  
  // Extract peak hours data
  const peakHoursData = {};
  filteredData.forEach(day => {
    day.peakHours.forEach(peak => {
      if (peakHoursData[peak.hour]) {
        peakHoursData[peak.hour] = (peakHoursData[peak.hour] + peak.utilization) / 2;
      } else {
        peakHoursData[peak.hour] = peak.utilization;
      }
    });
  });
  
  const peakHoursArray = Object.entries(peakHoursData)
    .map(([hour, utilization]) => ({ hour, utilization }))
    .sort((a, b) => {
      const hourA = parseInt(a.hour.split(':')[0]);
      const hourB = parseInt(b.hour.split(':')[0]);
      return hourA - hourB;
    });
  
  const peakHoursChartData = {
    options: {
      chart: {
        type: 'bar',
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: peakHoursArray.map(item => item.hour),
        title: {
          text: 'Hour of Day',
        },
      },
      yaxis: {
        title: {
          text: 'Utilization %',
        },
      },
      title: {
        text: 'Peak Hours Utilization',
        align: 'left',
      },
      dataLabels: {
        enabled: false,
      },
    },
    series: [
      {
        name: 'Utilization %',
        data: peakHoursArray.map(item => Math.round(item.utilization)),
      },
    ],
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Table Utilization Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      <DateRangePicker dateRange={dateRange} onDateChange={handleDateChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ReportCard
          title="Average Turnover Rate"
          icon={RefreshIcon}
          value={avgTurnoverRate.toFixed(1)}
          trend="up"
          trendValue="4.2%"
          description="Groups per table per day"
        />
        <ReportCard
          title="Average Seated Duration"
          icon={ClockIcon}
          value={`${Math.round(avgSeatedDuration)} min`}
          trend="down"
          trendValue="2.5%"
          description="Average time customers spend at table"
        />
        <ReportCard
          title="Peak Utilization"
          icon={TrendingUpIcon}
          value="85%"
          trend="up"
          trendValue="3.8%"
          description="Highest table utilization"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <ThemedChart
            options={turnoverChartData.options}
            series={turnoverChartData.series}
            type="line"
            height={320}
          />
        </div>
        <div className="card p-5">
          <ThemedChart
            options={durationChartData.options}
            series={durationChartData.series}
            type="line"
            height={320}
          />
        </div>
      </div>
      
      <div className="card p-5 mb-6">
        <ThemedChart
          options={peakHoursChartData.options}
          series={peakHoursChartData.series}
          type="bar"
          height={350}
        />
      </div>
      
      <div className="card p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Daily Utilization Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Turnover Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Avg. Duration (min)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Total Seated Time (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredData.map((day, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm font-medium">{format(parseISO(day.date), 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3 text-sm">{day.turnoverRate}</td>
                  <td className="px-4 py-3 text-sm">{day.averageSeatedDuration}</td>
                  <td className="px-4 py-3 text-sm">{day.totalSeatedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reports Page Component
const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  
  // Clock icon
  const ClockIcon = getIcon('clock');
  
  return (
    <div className="app-container py-6 md:py-8">
      {/* Header Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="mt-1 md:mt-2 text-surface-600 dark:text-surface-400">
          Analyze your restaurant's performance with detailed reports
        </p>
      </motion.div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'sales', label: 'Sales', icon: DollarIcon },
            { id: 'inventory', label: 'Inventory', icon: LayersIcon },
            { id: 'staff', label: 'Staff Performance', icon: UsersIcon },
            { id: 'tables', label: 'Table Utilization', icon: ClockIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'sales' && <SalesReportTab />}
        {activeTab === 'inventory' && <InventoryReportTab />}
        {activeTab === 'staff' && <StaffReportTab />}
        {activeTab === 'tables' && <TableUtilizationTab />}
      </div>
    </div>
  );
};

export default Reports;