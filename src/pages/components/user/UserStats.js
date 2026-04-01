// components/user/UserStats.js
import React from 'react';
import { Card, Row, Col } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faUserTimes, faDollarSign } from '@fortawesome/free-solid-svg-icons';

const UserStats = ({ users }) => {
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const totalBalance = users.reduce((sum, u) => sum + (parseFloat(u.balance) || 0), 0);

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
            </div>
            <h6 className="text-muted">Total Users</h6>
            <h3 className="mb-0">{users.length}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faUserCheck} size="2x" className="text-success" />
            </div>
            <h6 className="text-muted">Active Users</h6>
            <h3 className="mb-0 text-success">{activeUsers}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-2">
              <FontAwesomeIcon icon={faUserTimes} size="2x" className="text-warning" />
            </div>
            <h6 className="text-muted">Inactive Users</h6>
            <h3 className="mb-0 text-warning">{inactiveUsers}</h3>
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

export default UserStats;