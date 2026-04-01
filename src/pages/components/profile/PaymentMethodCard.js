// components/profile/PaymentMethodCard.js
import React from 'react';
import { Form, Button, Alert, Badge, Spinner } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faTimesCircle, faClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PaymentMethodCard = ({
  icon,
  title,
  value,
  status,
  editMode,
  requesting,
  onValueChange,
  onRequestActivation,
  canEdit,
  canRequest
}) => {
  const getStatusBadge = () => {
    switch(status) {
      case 'active':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Active</Badge>;
      case 'deactive':
        return <Badge bg="secondary"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Inactive</Badge>;
      case 'requested':
        return <Badge bg="warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Pending Approval</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch(status) {
      case 'active':
        return (
          <Alert variant="success" className="mb-0 p-2 small mt-2">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            This payment method is active and ready to use.
          </Alert>
        );
      case 'requested':
        return (
          <Alert variant="info" className="mb-0 p-2 small mt-2">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            Your request is pending admin approval.
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <FontAwesomeIcon icon={icon} className="me-2 text-primary" />
          <strong>{title}</strong>
        </div>
        {getStatusBadge()}
      </div>
      
      <Form.Group className="mb-2">
        <Form.Label>{title} Details</Form.Label>
        <Form.Control
          type={title === 'Bank Transfer' ? 'textarea' : 'text'}
          as={title === 'Bank Transfer' ? 'textarea' : 'input'}
          rows={title === 'Bank Transfer' ? 3 : 1}
          name={title.toLowerCase().replace(/\s/g, '_')}
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={!editMode || !canEdit}
          placeholder={`Enter your ${title.toLowerCase()} details`}
        />
        {!canEdit && editMode && (
          <Form.Text className="text-warning">
            <FontAwesomeIcon icon={faLock} className="me-1" />
            Cannot edit - Payment method is {status === 'requested' ? 'pending approval' : 'inactive'}. 
            {status === 'deactive' && ' Request activation to enable editing.'}
          </Form.Text>
        )}
      </Form.Group>
      
      {/* Request button only for deactive status */}
      {!editMode && status === 'deactive' && canRequest && (
        <Button 
          size="sm" 
          variant="outline-primary"
          onClick={onRequestActivation}
          disabled={requesting}
          className="mt-2"
        >
          {requesting ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Submitting...
            </>
          ) : (
            'Request Activation'
          )}
        </Button>
      )}
      
      {/* Status message for active and requested */}
      {!editMode && (status === 'active' || status === 'requested') && getStatusMessage()}
    </div>
  );
};

export default PaymentMethodCard;