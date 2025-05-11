"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const ModalContainer = () => {
  const { modals, closeModal } = useUI();
  
  // Don't render anything if there are no modals
  if (modals.length === 0) return null;
  
  // Create portal for modals
  return createPortal(
    <>
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          id={modal.id}
          onClose={() => closeModal(modal.id)}
        >
          {modal.component}
        </Modal>
      ))}
    </>,
    document.body
  );
};

interface ModalProps {
  id: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ id, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Handle escape key to close modal
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Clean up event listeners when modal is closed
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${id}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer; 