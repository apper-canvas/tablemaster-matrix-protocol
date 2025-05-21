import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const NotFound = () => {
  const AlertTriangleIcon = getIcon('alert-triangle');
  const HomeIcon = getIcon('home');
  
  return (
    <motion.div 
      className="app-container py-16 flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <AlertTriangleIcon className="w-20 h-20 text-accent mb-6" />
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        404 - Page Not Found
      </h1>
      
      <p className="text-surface-600 dark:text-surface-400 text-lg md:text-xl max-w-xl mb-8">
        The page you're looking for doesn't exist or has been moved to another location.
      </p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link 
          to="/" 
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors shadow-soft"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
      
      <div className="mt-12 p-6 card-neu max-w-md">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-4">
          If you're having trouble finding what you need, our support team is here to help.
        </p>
        <a 
          href="#contact" 
          className="text-primary dark:text-primary-light font-medium hover:underline"
        >
          Contact Support
        </a>
      </div>
    </motion.div>
  );
};

export default NotFound;