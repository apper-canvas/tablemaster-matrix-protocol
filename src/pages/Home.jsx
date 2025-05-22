import { useState } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { getIcon } from '../utils/iconUtils';

// Sample data for statistics
const statsData = [
  {
    title: "Today's Sales",
    value: '$3,256.70',
    change: '+14.5%',
    changeType: 'increase',
    icon: 'dollarSign',
    color: 'primary'
  },
  {
    title: 'Orders',
    value: '157',
    change: '+8.2%',
    changeType: 'increase',
    icon: 'shoppingBag',
    color: 'secondary'
  },
  {
    title: 'Active Tables',
    value: '68%',
    change: '68%',
    changeType: 'normal',
    icon: 'users',
    color: 'accent'
  },
  {
    title: 'Avg. Serving Time',
    value: '24 min',
    change: '-3.5%',
    changeType: 'decrease',
    icon: 'clock',
    color: 'purple'
  }
];

// Sample data for sales chart
const salesChartData = {
  options: {
    chart: {
      id: 'sales-chart',
      toolbar: {
        show: false
      },
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value) {
          return '$' + value;
        },
        style: {
          colors: '#64748b'
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#2563eb', '#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: ['#2563eb', '#10b981'],
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    tooltip: {
      theme: 'light',
      marker: {
        show: true,
      },
      x: {
        show: true
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      markers: {
        radius: 12
      }
    },
    dataLabels: {
      enabled: false
    }
  },
  series: [
    {
      name: 'This Week',
      data: [1200, 1800, 1650, 2100, 1900, 2400, 2200]
    },
    {
      name: 'Last Week',
      data: [1000, 1500, 1350, 1900, 1700, 2000, 1800]
    }
  ]
};

// Sample data for top selling items
const topSellingItems = [
  { name: 'Signature Burger', amount: '$1,240.50', quantity: 124, growth: '+12%' },
  { name: 'Seafood Pasta', amount: '$950.20', quantity: 86, growth: '+8%' },
  { name: 'Grilled Chicken Salad', amount: '$720.80', quantity: 72, growth: '+15%' },
  { name: 'Classic Margherita', amount: '$680.40', quantity: 68, growth: '+5%' },
  { name: 'Chocolate Lava Cake', amount: '$560.30', quantity: 112, growth: '+20%' }
];

function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  // Get icons
  const DollarSignIcon = getIcon('dollarSign');
  const ShoppingBagIcon = getIcon('shoppingBag');
  const UsersIcon = getIcon('users');
  const ClockIcon = getIcon('clock');
  const TrendingUpIcon = getIcon('trendingUp');
  const TrendingDownIcon = getIcon('trendingDown');
  const MinusIcon = getIcon('minus');
  const BarChartIcon = getIcon('barChart');
  const PieChartIcon = getIcon('pieChart');
  const AwardIcon = getIcon('award');
  const CalendarIcon = getIcon('calendar');
  const CheckCircleIcon = getIcon('checkCircle');

  // Function to get icon for stat card
  const getStatIcon = (iconName) => {
    switch (iconName) {
      case 'dollarSign':
        return <DollarSignIcon className="w-5 h-5" />;
      case 'shoppingBag':
        return <ShoppingBagIcon className="w-5 h-5" />;
      case 'users':
        return <UsersIcon className="w-5 h-5" />;
      case 'clock':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <BarChartIcon className="w-5 h-5" />;
    }
  };

  // Function to get change icon
  const getChangeIcon = (type) => {
    switch (type) {
      case 'increase':
        return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-surface-500" />;
    }
  };

  // Function to get change text color
  const getChangeColor = (type) => {
    switch (type) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-surface-500';
    }
  };

  // Function to get gradient based on color
  const getGradient = (color) => {
    switch (color) {
      case 'primary':
        return 'from-primary/20 to-primary/5';
      case 'secondary':
        return 'from-secondary/20 to-secondary/5';
      case 'accent':
        return 'from-accent/20 to-accent/5';
      case 'purple':
        return 'from-purple-500/20 to-purple-500/5';
      default:
        return 'from-surface-200 to-surface-50';
    }
  };

  // Function to get border color
  const getBorderColor = (color) => {
    switch (color) {
      case 'primary':
        return 'border-primary/30';
      case 'secondary':
        return 'border-secondary/30';
      case 'accent':
        return 'border-accent/30';
      case 'purple':
        return 'border-purple-500/30';
      default:
        return 'border-surface-200';
    }
  };

  // Function to get icon color
  const getIconColor = (color) => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      case 'accent':
        return 'text-accent';
      case 'purple':
        return 'text-purple-500';
      default:
        return 'text-surface-600';
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="mb-8 space-y-2">
        <motion.h1 
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Restaurant Dashboard
        </motion.h1>
        <motion.p 
          className="text-surface-600 dark:text-surface-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Welcome back! Here's an overview of your restaurant performance today.
        </motion.p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            className={`card backdrop-blur-sm p-6 bg-gradient-to-br ${getGradient(stat.color)} border ${getBorderColor(stat.color)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full bg-white/80 dark:bg-surface-800/80 ${getIconColor(stat.color)}`}>
                {getStatIcon(stat.icon)}
              </div>
              <div className={`flex items-center ${getChangeColor(stat.changeType)}`}>
                {getChangeIcon(stat.changeType)}
                <span className="ml-1 text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="font-medium text-surface-500 dark:text-surface-400 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-surface-200 dark:border-surface-700">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'overview' 
                ? 'text-primary dark:text-primary-light' 
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-light"
                layoutId="activeTab"
                initial={false}
              />
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'reports' 
                ? 'text-primary dark:text-primary-light' 
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
            onClick={() => handleTabChange('reports')}
          >
            Reports
            {activeTab === 'reports' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-light"
                layoutId="activeTab"
                initial={false}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <motion.div 
            className="lg:col-span-2 card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Sales Overview</h3>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                  <span className="text-surface-600 dark:text-surface-400">This Week</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-secondary mr-1"></div>
                  <span className="text-surface-600 dark:text-surface-400">Last Week</span>
                </div>
              </div>
            </div>
            <div className="w-full h-72">
              <Chart
                options={salesChartData.options}
                series={salesChartData.series}
                type="area"
                height="100%"
              />
            </div>
          </motion.div>

          {/* Top Selling Items */}
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Top Selling Items</h3>
              <AwardIcon className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-4">
              {topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
                  <div>
                    <h4 className="font-medium mb-1">{item.name}</h4>
                    <div className="flex items-center text-sm text-surface-500 dark:text-surface-400">
                      <span className="mr-2">{item.quantity} sold</span>
                      <TrendingUpIcon className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-green-500">{item.growth}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Restaurant Status */}
          <motion.div 
            className="lg:col-span-2 card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Restaurant Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white dark:bg-surface-800 rounded-full mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-medium mb-1">Open for Business</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400">All systems operational</p>
              </div>
              <div className="p-4 bg-surface-100 dark:bg-surface-700/50 rounded-lg border border-surface-200 dark:border-surface-600 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white dark:bg-surface-800 rounded-full mb-3">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Today's Reservations</h4>
                <p className="text-xl font-semibold">24</p>
              </div>
              <div className="p-4 bg-surface-100 dark:bg-surface-700/50 rounded-lg border border-surface-200 dark:border-surface-600 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white dark:bg-surface-800 rounded-full mb-3">
                  <UsersIcon className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-medium mb-1">Staff on Duty</h4>
                <p className="text-xl font-semibold">12</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Table Turnover Rate</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Kitchen Efficiency</span>
                  <span className="text-sm font-medium">84%</span>
                </div>
                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2 card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6">Monthly Revenue Report</h3>
            <div className="w-full h-72">
              <Chart
                options={{
                  ...salesChartData.options,
                  chart: {
                    ...salesChartData.options.chart,
                    id: 'monthly-revenue'
                  },
                  xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    labels: {
                      style: {
                        colors: '#64748b'
                      }
                    }
                  }
                }}
                series={[
                  {
                    name: 'This Year',
                    data: [12500, 14000, 16800, 15200, 17000, 19500, 20100, 21400, 19800, 22000, 24000, 25500]
                  },
                  {
                    name: 'Last Year',
                    data: [10000, 11200, 13500, 12800, 14500, 16000, 17500, 18200, 17000, 19000, 20500, 22000]
                  }
                ]}
                type="bar"
                height="100%"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6">Revenue Distribution</h3>
            <div className="w-full h-72">
              <Chart
                options={{
                  labels: ['Food', 'Beverages', 'Desserts', 'Others'],
                  colors: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'],
                  legend: {
                    position: 'bottom',
                    fontSize: '14px'
                  },
                  dataLabels: {
                    enabled: false
                  },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '65%'
                      }
                    }
                  }
                }}
                series={[55, 28, 12, 5]}
                type="donut"
                height="100%"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:col-span-3 card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 flex flex-col items-center">
                <h4 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Average Order Value</h4>
                <p className="text-2xl font-bold">$24.50</p>
                <div className="flex items-center mt-2 text-sm text-green-500">
                  <TrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>+5.2%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/10 dark:bg-secondary/20 border border-secondary/20 flex flex-col items-center">
                <h4 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Customer Retention</h4>
                <p className="text-2xl font-bold">68.7%</p>
                <div className="flex items-center mt-2 text-sm text-green-500">
                  <TrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>+2.4%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/20 flex flex-col items-center">
                <h4 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Food Cost Percentage</h4>
                <p className="text-2xl font-bold">28.5%</p>
                <div className="flex items-center mt-2 text-sm text-red-500">
                  <TrendingDownIcon className="w-4 h-4 mr-1" />
                  <span>-1.3%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex flex-col items-center">
                <h4 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Labor Cost Ratio</h4>
                <p className="text-2xl font-bold">23.1%</p>
                <div className="flex items-center mt-2 text-sm text-red-500">
                  <TrendingDownIcon className="w-4 h-4 mr-1" />
                  <span>-0.8%</span>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
      
      </div>
    </>
  );
}

export default Home;