import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/password-reset/request', {
        email: formData.email
      });
      
      if (response.data.success === 'true') {
        toast.success('OTP sent to your email address');
        setStep(2);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    
    if (!formData.newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/password-reset/verify', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      if (response.data.success === 'true') {
        toast.success('Password reset successfully! You can now login.');
        // Reset form and go back to step 1
        setFormData({
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
        });
        setStep(1);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Password reset verify error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setFormData({
      ...formData,
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0" style={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="text-dark mb-2">Reset Password</h2>
                  <p className="text-muted">
                    {step === 1 
                      ? 'Enter your email to receive an OTP' 
                      : 'Enter the OTP and your new password'
                    }
                  </p>
                </div>

                {step === 1 ? (
                  <Form onSubmit={handleEmailSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      className="w-100 mb-3"
                      variant="primary"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending OTP...
                        </>
                      ) : (
                        'Send OTP'
                      )}
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-decoration-none">
                        Back to Login
                      </Link>
                    </div>
                  </Form>
                ) : (
                  <Form onSubmit={handlePasswordReset}>
                    <Alert variant="info" className="mb-3">
                      <small>
                        OTP sent to: <strong>{formData.email}</strong>
                        <br />
                        Check your email for the 6-digit code.
                      </small>
                    </Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>OTP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        minLength="6"
                        required
                        disabled={loading}
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      className="w-100 mb-3"
                      variant="primary"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>

                    <div className="text-center">
                      <Button 
                        variant="link" 
                        onClick={handleBackToEmail}
                        className="text-decoration-none p-0"
                        disabled={loading}
                      >
                        Change Email Address
                      </Button>
                      <span className="mx-2">|</span>
                      <Link to="/login" className="text-decoration-none">
                        Back to Login
                      </Link>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
