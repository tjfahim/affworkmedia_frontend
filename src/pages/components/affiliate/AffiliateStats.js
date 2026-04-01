// components/affiliate/AffiliateStats.js
import React from 'react';
import { Card, Row, Col } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faDollarSign, faChartLine } from '@fortawesome/free-solid-svg-icons';

const AffiliateStats = ({ affiliates, totalBalance }) => {
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
  const inactiveAffiliates = affiliates.filter(a => a.status === 'inactive').length;
  const suspendedAffiliates = affiliates.filter(a => a.status === 'suspended').length;

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
            </div>
            <h6 className="text-muted">Total Affiliates</h6>
            <h3 className="mb-0">{affiliates.length}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faUserCheck} size="2x" className="text-success" />
            </div>
            <h6 className="text-muted">Active Affiliates</h6>
            <h3 className="mb-0 text-success">{activeAffiliates}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faChartLine} size="2x" className="text-warning" />
            </div>
            <h6 className="text-muted">Inactive/Suspended</h6>
            <h3 className="mb-0 text-warning">{inactiveAffiliates + suspendedAffiliates}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faDollarSign} size="2x" className="text-info" />
            </div>
            <h6 className="text-muted">Total Balance</h6>
            <h3 className="mb-0 text-info">${totalBalance.toFixed(2)}</h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AffiliateStats;