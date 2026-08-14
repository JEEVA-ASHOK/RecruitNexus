import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onRemove }) => {
  return (
    <div style={styles.toastContainer}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} color="#34d399" />;
      case 'error':
        return <AlertTriangle size={18} color="#f87171" />;
      case 'info':
      default:
        return <Info size={18} color="#2563EB" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'rgba(52, 211, 153, 0.4)';
      case 'error':
        return 'rgba(248, 113, 113, 0.4)';
      case 'info':
      default:
        return 'rgba(0, 242, 254, 0.4)';
    }
  };

  return (
    <div
      style={{
        ...styles.toastItem,
        borderColor: getBorderColor(),
      }}
      className="glass-panel"
    >
      <div style={styles.iconContainer}>{getIcon()}</div>
      <div style={styles.text}>{toast.text}</div>
      <button onClick={() => onRemove(toast.id)} style={styles.closeBtn}>
        <X size={14} color="#6B7280" />
      </button>
    </div>
  );
};

const styles = {
  toastContainer: {
    position: 'fixed' as const,
    top: '24px',
    right: '24px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxWidth: '400px',
    width: 'calc(100% - 48px)',
  },
  toastItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    background: 'rgba(18, 20, 32, 0.85)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '12px',
  },
  text: {
    flex: 1,
    fontSize: '0.88rem',
    color: '#f8fafc',
    fontWeight: 500,
    lineHeight: '1.4',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '12px',
  },
};
