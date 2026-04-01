// components/profile/ProfileInfoSection.js
import React from 'react';
import { Form, Row, Col } from '@themesberg/react-bootstrap';

const ProfileInfoSection = ({ formData, editMode, onInputChange }) => {
  return (
    <>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={onInputChange}
              disabled={!editMode}
            />
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={onInputChange}
              disabled={!editMode}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              name="company"
              value={formData.company}
              onChange={onInputChange}
              disabled={!editMode}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="url"
              name="website"
              value={formData.website}
              onChange={onInputChange}
              disabled={!editMode}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Skype</Form.Label>
        <Form.Control
          type="text"
          name="skype"
          value={formData.skype}
          onChange={onInputChange}
          disabled={!editMode}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Promotion Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="promotion_description"
          value={formData.promotion_description}
          onChange={onInputChange}
          disabled={!editMode}
        />
      </Form.Group>
    </>
  );
};

export default ProfileInfoSection;