import { Component } from 'react';
import { getIcon } from '../utils/iconUtils';

// Define TypeInfo to resolve the reference error
const TypeInfo = { isRequired: false };

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    const AlertTriangleIcon = getIcon('alertTriangle');
    const RefreshCwIcon = getIcon('refreshCw');

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
          <div className="card p-8 max-w-lg w-full text-center">
            <AlertTriangleIcon className="h-16 w-16 mx-auto text-accent mb-4" />
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <button onClick={() => window.location.reload()} className="btn btn-primary flex items-center justify-center mx-auto gap-2">
              <RefreshCwIcon className="h-5 w-5" /> Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;