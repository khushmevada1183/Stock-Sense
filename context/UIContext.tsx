"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types for toast notifications
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Types for modals
export interface Modal {
  id: string;
  component: React.ReactNode;
  props?: Record<string, any>;
}

// UI Context state
interface UIContextState {
  // Toasts/Notifications
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  
  // Modals
  modals: Modal[];
  openModal: (component: React.ReactNode, props?: Record<string, any>) => string;
  closeModal: (id: string) => void;
  
  // Loading states
  isPageLoading: boolean;
  setPageLoading: (isLoading: boolean) => void;
  
  // UI settings
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

// Create the context with default values
const UIContext = createContext<UIContextState>({
  // Toasts
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  
  // Modals
  modals: [],
  openModal: () => '',
  closeModal: () => {},
  
  // Loading states
  isPageLoading: false,
  setPageLoading: () => {},
  
  // UI settings
  isMobileMenuOpen: false,
  setMobileMenuOpen: () => {}
});

// Provider component to wrap the app
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal state
  const [modals, setModals] = useState<Modal[]>([]);
  
  // Loading state
  const [isPageLoading, setPageLoading] = useState(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add a toast notification
  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = `toast-${Date.now()}`;
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  // Remove a toast notification
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Open a modal
  const openModal = useCallback((component: React.ReactNode, props?: Record<string, any>) => {
    const id = `modal-${Date.now()}`;
    const newModal = { id, component, props };
    
    setModals(prev => [...prev, newModal]);
    return id;
  }, []);
  
  // Close a modal
  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);
  
  // Context value
  const value = {
    // Toasts
    toasts,
    addToast,
    removeToast,
    
    // Modals
    modals,
    openModal,
    closeModal,
    
    // Loading states
    isPageLoading,
    setPageLoading,
    
    // UI settings
    isMobileMenuOpen,
    setMobileMenuOpen
  };
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => useContext(UIContext); 