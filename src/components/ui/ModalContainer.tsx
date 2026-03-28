"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const ModalContainer = () => {
  const { modals, closeModal } = useUI();

  useEffect(() => {
    if (modals.length === 0) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modals.length]);
  
  // Don't render anything if there are no modals
  if (modals.length === 0) return null;
  
  // Create portal for modals
  return createPortal(
    <>
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          id={modal.id}
          title={typeof modal.props?.title === 'string' ? modal.props.title : undefined}
          isTopMost={index === modals.length - 1}
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
  title?: string;
  isTopMost: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ id, title, isTopMost, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${id}`;

  useEffect(() => {
    if (!isTopMost) return;
    modalRef.current?.focus();
  }, [isTopMost]);
  
  useEffect(() => {
    if (!isTopMost) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose, isTopMost]);

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isTopMost) return;
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-lg"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg mx-auto bg-gray-900/90 backdrop-blur-lg dark:bg-gray-900 rounded-lg shadow-xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="sr-only">{title || 'Dialog'}</h2>

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