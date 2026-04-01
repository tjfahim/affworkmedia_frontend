// components/profile/AffiliateCommissionSection.js
import React from 'react';
import { Form, Row, Col, Card } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPercent } from '@fortawesome/free-solid-svg-icons';

const AffiliateCommissionSection = ({ user }) => {
  return (
    <Card className="border rounded p-3 mb-3 bg-light">
      <h6 className="mb-3">
        <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
        Commission Settings
      </h6>
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faPercent} className="me-1 text-info" />
              Level 1 Commission
            </Form.Label>
            <Form.Control
              type="text"
              value={`${user.default_affiliate_commission_1 || 0}%`}
              disabled
              className="bg-white"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faPercent} className="me-1 text-info" />
              Level 2 Commission
            </Form.Label>
            <Form.Control
              type="text"
              value={`${user.default_affiliate_commission_2 || 0}%`}
              disabled
              className="bg-white"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faPercent} className="me-1 text-info" />
              Level 3 Commission
            </Form.Label>
            <Form.Control
              type="text"
              value={`${user.default_affiliate_commission_3 || 0}%`}
              disabled
              className="bg-white"
            />
          </Form.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default AffiliateCommissionSection;