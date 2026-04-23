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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative mx-auto w-full max-w-lg rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-strong)] p-6 text-[color:var(--app-text-1)] shadow-[0_40px_110px_rgba(15,23,42,0.32)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="sr-only">{title || 'Dialog'}</h2>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[color:var(--app-text-3)] transition-colors hover:text-[color:var(--app-text-1)]"
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