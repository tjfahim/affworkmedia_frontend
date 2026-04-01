// components/Toast.js
import React, { useState, useEffect } from 'react';
import { Alert, Button } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle, 
  faTimesCircle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch(type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'info':
        return faInfoCircle;
      case 'warning':
        return faExclamationCircle;
      default:
        return faInfoCircle;
    }
  };

  const getVariant = () => {
    switch(type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      minWidth: '300px',
      maxWidth: '500px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <Alert 
        variant={getVariant()} 
        className="d-flex align-items-center justify-content-between mb-2 shadow"
        style={{ marginBottom: '10px' }}
      >
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={getIcon()} className="me-2" size="lg" />
          <div className="flex-grow-1">
            <strong className="me-2">{type.toUpperCase()}:</strong>
            <span>{message}</span>
          </div>
        </div>
        <Button
          variant="link"
          className="p-0 ms-3 text-dark"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          style={{ textDecoration: 'none' }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Alert>
      <style jsx="true">{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;