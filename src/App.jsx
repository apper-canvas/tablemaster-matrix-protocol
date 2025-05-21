import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import MenuBuilder from './pages/MenuBuilder';

// Header component with dark mode toggle
const Header = ({ darkMode, toggleDarkMode }) => {
  const MenuIcon = getIcon('menu');
  const MoonIcon = getIcon('moon');
  const SunIcon = getIcon('sun');
  const RestaurantIcon = getIcon('utensils');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
      <div className="app-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <RestaurantIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TableMaster
              </span>
            </a>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <a href="/" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="#orders" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Orders
              </a>
              <a href="#tables" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Tables
              </a>
              <a href="#inventory" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Inventory
              </a>
              <a href="/menu" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Menu
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-surface-600" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            >
              <MenuIcon className="h-5 w-5 text-surface-600 dark:text-surface-300" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-surface-200 dark:border-surface-700">
            <nav className="flex flex-col space-y-1">
              <a href="/" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Dashboard
              </a>
              <a href="#orders" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Orders
              </a>
              <a href="#tables" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Tables
              </a>
              <a href="#inventory" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Inventory
              </a>
              <a href="/menu" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Menu
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-surface-200 dark:border-surface-700">
      <div className="app-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} TableMaster. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-surface-500 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-surface-500 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-surface-500 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', String(newMode));
      return newMode;
    });
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/menu" element={<MenuBuilder />} />
          </Routes>
        </motion.div>
      </main>
      
      <Footer />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="!bg-surface-50 !text-surface-800 dark:!bg-surface-800 dark:!text-surface-100 shadow-card border border-surface-200 dark:border-surface-700"
      />
    </div>
  );
}

export default App;