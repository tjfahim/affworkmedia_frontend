// components/profile/AffiliatePaymentSection.js
import React from 'react';
import { Form, Alert } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, faUniversity, faCoins, faEllipsisH, 
  faInfoCircle, faLock
} from '@fortawesome/free-solid-svg-icons';
import PaymentMethodCard from './PaymentMethodCard';

const AffiliatePaymentSection = ({
  formData,
  paymentStatuses,
  editMode,
  requestingPayment,
  requestingPaymentType,
  onFormChange,
  onRequestActivation,
  canEditPaymentMethod,
  canRequestPaymentMethod
}) => {
  const paymentMethods = [
    {
      key: 'paypal',
      title: 'PayPal',
      icon: faCreditCard,
      value: formData.paypal,
      status: paymentStatuses.edit_paypal_mail_status,
      field: 'paypal'
    },
    {
      key: 'payoneer',
      title: 'Payoneer',
      icon: faCreditCard,
      value: formData.payoneer,
      status: paymentStatuses.edit_payoneer_mail_status,
      field: 'payoneer'
    },
    {
      key: 'bank',
      title: 'Bank Transfer',
      icon: faUniversity,
      value: formData.bank_details,
      status: paymentStatuses.edit_bank_details_status,
      field: 'bank_details'
    },
    {
      key: 'binance',
      title: 'Binance',
      icon: faCoins,
      value: formData.binance,
      status: paymentStatuses.edit_binance_mail_status,
      field: 'binance'
    },
    {
      key: 'other',
      title: 'Other Payment Method',
      icon: faEllipsisH,
      value: formData.other_payment_method_description,
      status: paymentStatuses.edit_other_payment_method_description_status,
      field: 'other_payment_method_description'
    }
  ];

  const handleValueChange = (field, value) => {
    onFormChange(field, value);
  };

  const hasEditablePaymentMethod = () => {
    return paymentMethods.some(m => m.status === 'active');
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Payment Method</Form.Label>
        <Form.Select
          name="pay_method"
          value={formData.pay_method}
          onChange={(e) => onFormChange('pay_method', e.target.value)}
          disabled={!editMode}
        >
          <option value="">Select Payment Method</option>
          <option value="bank">Bank Transfer</option>
          <option value="paypal">PayPal</option>
          <option value="payoneer">Payoneer</option>
          <option value="binance">Binance</option>
          <option value="other">Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Account Email</Form.Label>
        <Form.Control
          type="email"
          name="account_email"
          value={formData.account_email}
          onChange={(e) => onFormChange('account_email', e.target.value)}
          disabled={!editMode}
          placeholder="Email for payment notifications"
        />
      </Form.Group>

      {/* All Payment Methods - Show all 5 methods */}
      {paymentMethods.map(method => (
        <PaymentMethodCard
          key={method.key}
          icon={method.icon}
          title={method.title}
          value={method.value}
          status={method.status}
          editMode={editMode}
          requesting={requestingPayment && requestingPaymentType === method.key}
          onValueChange={(value) => handleValueChange(method.field, value)}
          onRequestActivation={() => onRequestActivation(method.key, method.value)}
          canEdit={canEditPaymentMethod(method.status)}
          canRequest={canRequestPaymentMethod(method.status)}
        />
      ))}

      {!editMode && (
        <Alert variant="info" className="mt-3">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          To activate a payment method, click "Request Activation". Once approved by admin, you'll be able to edit the details.
        </Alert>
      )}
      
      {editMode && !hasEditablePaymentMethod() && (
        <Alert variant="warning" className="mt-3">
          <FontAwesomeIcon icon={faLock} className="me-2" />
          No active payment methods. You need to request activation for a payment method first before you can edit it.
        </Alert>
      )}
    </div>
  );
};

export default AffiliatePaymentSection;