import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalculator, FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Removed setup status check since we have admin user configured
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits and validate length
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Only update if 10 digits or less
      if (digitsOnly.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly
        }));
      }
      // If more than 10 digits, don't update the state (ignore the input)
      return;
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isRegistering && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isRegistering) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Phone number validation - required and must be exactly 10 digits
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (formData.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must contain only digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    // Don't clear errors immediately - let them show for a moment
    console.log('Starting form submission');
    
    try {
      if (isRegistering) {
        // Registration logic using axios to match backend API
        const response = await axios.post('/api/v1/auth/register', {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
        
        const data = response.data;
        console.log('Registration response:', { status: response.status, data });
        
        if (data && data.id) {
          // Registration successful
          setSuccessMessage('Registration successful! Welcome to Pahana Edu Book Shop.');
          setErrors({}); // Clear any previous errors
          
          // Reset form
          setFormData({
            username: '',
            password: '',
            fullName: '',
            email: '',
            phone: ''
          });
          
          // Switch to login mode after successful registration
          setTimeout(() => {
            setSuccessMessage('Registration successful! Please login with your credentials.');
            setIsRegistering(false);
          }, 2000);
        } else {
          // Handle registration errors
          const errorMessage = data?.message || 'Registration failed. Please try again.';
          setErrors({ general: errorMessage });
          setSuccessMessage(''); // Clear success message on error
        }
      } else {
        // Login logic
        console.log('Attempting login with:', formData.username);
        try {
          // Direct login attempt
          const response = await axios.post('/api/v1/auth/login', {
            username: formData.username,
            password: formData.password
          });
          
          if (response?.data) {
            // Login successful
            navigate('/dashboard');
          } else {
            // No data returned
            setErrors({ general: 'Incorrect username or password' });
          }
        } catch (loginError) {
          // Handle different types of errors
          if (loginError.response?.status === 401 || loginError.response?.status === 403) {
            setErrors({ general: 'Incorrect username or password' });
          } else if (loginError.code === 'ERR_NETWORK') {
            setErrors({ general: 'Cannot connect to server. Please check if the backend is running.' });
          } else {
            setErrors({ general: 'Incorrect username or password' });
          }
        }
        return;
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', error);
      
      if (isRegistering) {
        // Handle registration-specific errors
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else if (error.response?.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          const errorMessages = Object.values(validationErrors).join(', ');
          setErrors({ general: errorMessages });
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else {
        // Handle login-specific errors
        console.log('Login error in catch block:', error);
        let errorMsg = 'Incorrect username or password';
        
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        console.log('Setting login error:', errorMsg);
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="card-custom border-0">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <FaCalculator size={60} className="text-gradient" />
                  </div>
                  <h2 className="text-gradient fw-bold mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
                  <p className="text-muted">{isRegistering ? 'Join the Pahana Edu Book Shop' : 'Sign in to your Billing System account'}</p>
                </div>

                {/* Success Messages */}
                {successMessage && (
                  <Alert variant="success" className="mb-3">
                    {successMessage}
                  </Alert>
                )}


                
                {/* Registration/Login Form */}
                <Form onSubmit={handleSubmit}>
                  
                  {/* Error Message Display */}
                  {errors?.general && (
                    <Alert variant="danger" className="mb-3">
                      {errors.general}
                    </Alert>
                  )}
                  {/* Full Name Field (Registration only) */}
                  {isRegistering && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaUser className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`form-control-custom ${errors.fullName ? 'is-invalid' : ''}`}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                      {errors.fullName && (
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  )}

                  {/* Username Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <FaUser className="me-2" />
                      Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.username ? 'is-invalid' : ''}`}
                      placeholder="Enter your username"
                      disabled={isSubmitting}
                    />
                    {errors.username && (
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Email Field (Registration only) */}
                  {isRegistering && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaEnvelope className="me-2" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  )}

                  {/* Phone Field (Registration only) */}
                  {isRegistering && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaPhone className="me-2" />
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter
                          if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                              (e.keyCode === 65 && e.ctrlKey === true) ||
                              (e.keyCode === 67 && e.ctrlKey === true) ||
                              (e.keyCode === 86 && e.ctrlKey === true) ||
                              (e.keyCode === 88 && e.ctrlKey === true)) {
                            return;
                          }
                          // Ensure that it is a number and stop the keypress
                          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                            e.preventDefault();
                          }
                          // Also check if we already have 10 digits
                          if (formData.phone && formData.phone.length >= 10) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          // Handle paste events - only allow digits
                          e.preventDefault();
                          const paste = (e.clipboardData || window.clipboardData).getData('text');
                          const digitsOnly = paste.replace(/\D/g, '').slice(0, 10);
                          setFormData(prev => ({ ...prev, phone: digitsOnly }));
                        }}
                        className={`form-control-custom ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="Enter your 10-digit phone number"
                        disabled={isSubmitting}
                        maxLength="10"
                        pattern="[0-9]{10}"
                        title="Phone number must be exactly 10 digits"
                        required
                      />
                      {errors.phone && (
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  )}

                  {/* Password Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FaLock className="me-2" />
                      Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 p-0 me-2"
                        onClick={togglePasswordVisibility}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </Button>
                    </div>
                    {errors.password && (
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="btn-custom w-100 py-3 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        {isRegistering ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      <>
                        {isRegistering ? <FaUserPlus className="me-2" /> : <FaUser className="me-2" />}
                        {isRegistering ? 'Create Account' : 'Sign In'}
                      </>
                    )}
                  </Button>
                </Form>



                {/* Toggle between Login/Register */}
                <div className="text-center mt-4">
                  <p className="text-muted small mb-2">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <Button
                    variant="link"
                    className="text-decoration-none fw-semibold"
                    onClick={toggleMode}
                    disabled={isSubmitting}
                  >
                    {isRegistering ? 'Sign In Here' : 'Create Account'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
