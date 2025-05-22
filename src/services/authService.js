// src/services/authService.js

/**
 * Authentication service for handling user authentication with the Apper backend
 */

// Initialize the ApperClient for API calls
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Initialize ApperUI for authentication UI
export const initializeApperUI = (dispatch, navigate, setUser, clearUser) => {
  const { ApperUI } = window.ApperSDK;
  const client = getApperClient();
  
  ApperUI.setup(client, {
    target: '#authentication',
    clientId: import.meta.env.VITE_APPER_PROJECT_ID,
    view: 'both',
    onSuccess: function (user) {
      // CRITICAL: This exact currentPath logic must be preserved in all implementations
      let currentPath = window.location.pathname + window.location.search;
      let redirectPath = new URLSearchParams(window.location.search).get('redirect');
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes('/callback') || currentPath.includes('/error');
      
      if (user) {
        // User is authenticated - handle redirects appropriately
        if (redirectPath) {
          navigate(redirectPath);
        } else if (!isAuthPage) {
          navigate(currentPath);
        } else {
          navigate('/');
        }
        // Store user information in Redux
        dispatch(setUser(JSON.parse(JSON.stringify(user))));
      } else {
        // User is not authenticated - redirect to login
        navigate('/login');
        dispatch(clearUser());
      }
    }
  });
};