import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Stats Card Component
const StatsCard = ({ icon, title, value, trend, trendValue }) => {
  const IconComponent = getIcon(icon);
  const TrendUpIcon = getIcon('trending-up');
  const TrendDownIcon = getIcon('trending-down');
  
  const isTrendUp = trend === 'up';
  
  return (
    <motion.div 
      className="card p-6"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <IconComponent className="w-7 h-7 text-primary dark:text-primary-light" />
        </div>
        
        <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isTrendUp 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isTrendUp ? <TrendUpIcon className="w-3 h-3 mr-1" /> : <TrendDownIcon className="w-3 h-3 mr-1" />}
          {trendValue}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium text-surface-800 dark:text-surface-100">{title}</h3>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};

// Quick Action Button Component

// Home Page
const Home = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data
  const stats = [
    { icon: 'utensils', title: 'Orders Today', value: '124', trend: 'up', trendValue: '8.2%' },
    { icon: 'dollar-sign', title: 'Revenue Today', value: '$3,842', trend: 'up', trendValue: '12.5%' },
    { icon: 'users', title: 'Customers', value: '86', trend: 'down', trendValue: '3.1%' },
    { icon: 'clock', title: 'Avg. Wait Time', value: '18 min', trend: 'down', trendValue: '5.4%' }
  ];
  
  return (
    <div className="app-container py-6 md:py-8">
      {/* Welcome Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          Welcome to TableMaster
        </h1>
        <p className="mt-1 md:mt-2 text-surface-600 dark:text-surface-400">
          Your all-in-one restaurant management platform
        </p>
      </motion.div>
      
      {/* Dashboard Tabs */}
      <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {['overview', 'orders', 'tables', 'inventory', 'staff', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>
      
      {/* Main Feature */}
      <MainFeature />
      
      {/* Restaurant snapshot */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200">Restaurant Status</h2>
          <button className="text-sm text-primary dark:text-primary-light font-medium hover:underline">
            View Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff on duty */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Staff on Duty</h3>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 py-1 px-2.5 rounded-full text-xs font-medium">
                8 Active
              </span>
            </div>
            
            <div className="space-y-3">
              {["John Smith (Manager)", "Emma Davis (Chef)", "Michael Brown (Server)", "Sarah Wilson (Host)"].map((staff, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {staff.charAt(0)}
                    </div>
                    <span className="ml-3 text-sm">{staff}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ))}
              <button className="w-full mt-2 text-sm font-medium text-primary dark:text-primary-light hover:underline">
                View All Staff
              </button>
            </div>
          </div>
          
          {/* Table Occupancy */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Table Occupancy</h3>
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 py-1 px-2.5 rounded-full text-xs font-medium">
                12/20 Tables
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                    index < 12 
                      ? 'bg-primary/20 text-primary-dark dark:bg-primary/30 dark:text-primary-light'
                      : 'bg-surface-100 text-surface-400 dark:bg-surface-700 dark:text-surface-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 dark:bg-primary/30 mr-2"></div>
                <span className="text-surface-600 dark:text-surface-400">Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-surface-100 dark:bg-surface-700 mr-2"></div>
                <span className="text-surface-600 dark:text-surface-400">Available</span>
              </div>
              <button className="text-primary dark:text-primary-light font-medium hover:underline">
                Manage Tables
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;