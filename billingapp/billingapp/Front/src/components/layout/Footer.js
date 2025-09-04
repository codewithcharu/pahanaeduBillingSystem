import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCalculator, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <FaCalculator className="me-2" />
              <span className="fw-bold">Billing System</span>
            </div>
            <p className="mb-0 mt-2 text-muted">
              Manage your billing operations efficiently
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 text-muted">
              Made with <FaHeart className="text-danger mx-1" /> 
              © 2024 All rights reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
