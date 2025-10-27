import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const typeConfig = {
    default: {
      icon: null,
      headerClass: 'bg-base-100',
      iconColor: ''
    },
    success: {
      icon: CheckCircle,
      headerClass: 'bg-success/10',
      iconColor: 'text-success'
    },
    warning: {
      icon: AlertTriangle,
      headerClass: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    error: {
      icon: AlertCircle,
      headerClass: 'bg-error/10',
      iconColor: 'text-error'
    },
    info: {
      icon: Info,
      headerClass: 'bg-info/10',
      iconColor: 'text-info'
    }
  };

  const config = typeConfig[type] || typeConfig.default;
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full ${sizeClasses[size]} bg-base-100 rounded-xl shadow-2xl ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`px-6 py-4 border-b border-base-300 ${config.headerClass} rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {IconComponent && (
                      <div className={`p-2 rounded-lg bg-base-100 ${config.iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    )}
                    {title && (
                      <h3 className="text-lg font-semibold text-base-content">
                        {title}
                      </h3>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-base-300 bg-base-50 rounded-b-xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${type === 'error' ? 'btn-error' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm mr-2"></span>}
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-base-content/80">{message}</p>
    </Modal>
  );
};

// Form Modal Component
export const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "md"
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="modal-form"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm mr-2"></span>}
            {submitText}
          </button>
        </div>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export default Modal;