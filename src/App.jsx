import { useState, useEffect, createContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './redux/slices/userSlice';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import MenuBuilder from './pages/MenuBuilder';
import Waitlist from './pages/Waitlist';
import Tables from './pages/Tables';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Staff from './pages/Staff';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';

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
            <Link to="/" className="flex items-center gap-2">
              <RestaurantIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TableMaster
              </span>
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/orders" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Orders
              </Link>
              <Link to="/tables" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Tables
              </Link>
              <Link to="/inventory" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Inventory
              </Link>
              <Link to="/menu" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Menu
              </Link>
              <Link to="/reports" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Reports
              </Link>
              <Link to="/staff" className="text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light px-3 py-2 text-sm font-medium">
                Staff
              </Link>
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
              <Link to="/" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Dashboard
              </Link>
              <Link to="/orders" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Orders
              </Link>
              <Link to="/tables" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Tables
              </Link>
              <Link to="/inventory" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Inventory
              </Link>
              <Link to="/menu" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Menu
              </Link>
              <Link to="/reports" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Reports
              </Link>
              <Link to="/staff" className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary dark:text-surface-300 dark:hover:text-primary-light">
                Staff
              </Link>
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

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status
  const { isAuthenticated } = useSelector((state) => state.user);

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

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, [dispatch, navigate]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading">Initializing application...</div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        
        <main className="flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/menu" element={isAuthenticated ? <MenuBuilder /> : <Login />} />
              <Route path="/tables" element={isAuthenticated ? <Tables /> : <Login />} />
              <Route path="/orders" element={isAuthenticated ? <Orders /> : <Login />} />
              <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Login />} />
              <Route path="/reports" element={isAuthenticated ? <Reports /> : <Login />} />
              <Route path="/staff" element={isAuthenticated ? <Staff /> : <Login />} />
            </Routes>
          </motion.div>
        </main>
        
        {isAuthenticated && <Footer />}
        
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
    </AuthContext.Provider>
  );
}

export default App;