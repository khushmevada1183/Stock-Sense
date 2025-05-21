"use client";

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { Toast as ToastType } from '../../context/UIContext';

// Individual toast component
const Toast = ({ toast, onClose }: { toast: ToastType; onClose: (id: string) => void }) => {
  const { id, message, type } = toast;
  
  // Define icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };
  
  // Define background color based on toast type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };
  
  return (
    <div
      className={`flex items-center p-4 mb-3 rounded-lg border shadow-sm ${getBgColor()}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 mr-2 text-sm text-gray-800 dark:text-gray-200">
        {message}
      </div>
      <button
        type="button"
        className="flex-shrink-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Toasts container component
const Toasts = () => {
  const { toasts, removeToast } = useUI();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  if (toasts.length === 0) return null;
  
  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-full max-w-xs"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toasts; 