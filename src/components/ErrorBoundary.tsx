'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error
    logger.error('Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div className="max-w-md w-full mx-4 p-6 bg-gray-800 rounded-lg border border-red-500 border-opacity-30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-lg font-semibold text-red-50">Something went wrong</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {error && process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-gray-400 bg-gray-900 p-3 rounded border border-gray-700">
                  <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                  <p className="break-words whitespace-pre-wrap">{error.toString()}</p>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full px-4 py-2 bg-neon-500 text-black rounded font-semibold hover:bg-neon-400 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
