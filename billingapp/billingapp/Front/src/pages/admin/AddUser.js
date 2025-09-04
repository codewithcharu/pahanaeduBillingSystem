import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    roleName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      // Since backend uses simple role strings, we'll provide predefined roles
      setRoles([
        { id: 1, name: 'ROLE_USER' },
        { id: 2, name: 'ROLE_ADMIN' }
      ]);
    } catch (error) {
      console.error('Error setting roles:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.roleName) {
      newErrors.roleName = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        roleName: formData.roleName
      };

      // Use the admin user creation endpoint
      await axios.post('/api/v1/users', userData);
      toast.success('User created successfully');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <div className="d-flex align-items-center mb-3">
                  <Link to="/admin/users" className="btn btn-outline-secondary me-3">
                    <FaArrowLeft className="me-2" />
                    Back to Users
                  </Link>
                  <div>
                    <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Add New User</h1>
                    <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>Create a new user account in the system</p>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Add User Form */}
            <Row>
              <Col>
                <Card className="card-custom border-0">
                  <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username *</Form.Label>
                            <Form.Control
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.username ? 'is-invalid' : ''}`}
                              placeholder="Enter username"
                              disabled={loading}
                            />
                            {errors.username && (
                              <Form.Control.Feedback type="invalid">
                                {errors.username}
                              </Form.Control.Feedback>
                            )}
                            <Form.Text className="text-muted">
                              Username must be unique and at least 3 characters long
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Role *</Form.Label>
                            <Form.Select
                              name="roleName"
                              value={formData.roleName}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.roleName ? 'is-invalid' : ''}`}
                              disabled={loading}
                            >
                              <option value="">Select a role...</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                              ))}
                            </Form.Select>
                            {errors.roleName && (
                              <Form.Control.Feedback type="invalid">
                                {errors.roleName}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
                              placeholder="Enter password"
                              disabled={loading}
                            />
                            {errors.password && (
                              <Form.Control.Feedback type="invalid">
                                {errors.password}
                              </Form.Control.Feedback>
                            )}
                            <Form.Text className="text-muted">
                              Password must be at least 6 characters long
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Confirm Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.confirmPassword ? 'is-invalid' : ''}`}
                              placeholder="Confirm password"
                              disabled={loading}
                            />
                            {errors.confirmPassword && (
                              <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.fullName ? 'is-invalid' : ''}`}
                              placeholder="Enter full name"
                              disabled={loading}
                            />
                            {errors.fullName && (
                              <Form.Control.Feedback type="invalid">
                                {errors.fullName}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                              placeholder="Enter email address"
                              disabled={loading}
                            />
                            {errors.email && (
                              <Form.Control.Feedback type="invalid">
                                {errors.email}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Phone</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="form-control-custom"
                              placeholder="Enter phone number"
                              disabled={loading}
                            />
                            <Form.Text className="text-muted">
                              Phone number is optional
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Important Notes */}
                      <Alert variant="info" className="mb-4">
                        <h6 className="fw-bold">Important Notes:</h6>
                        <ul className="mb-0">
                          <li>Username must be unique and cannot be changed later</li>
                          <li>Role determines user permissions in the system</li>
                          <li>Password should be secure and memorable</li>
                          <li>Email will be used for account recovery</li>
                        </ul>
                      </Alert>

                      {/* Form Actions */}
                      <div className="d-flex justify-content-end gap-3">
                        <Link to="/admin/users">
                          <Button variant="secondary" disabled={loading}>
                            Cancel
                          </Button>
                        </Link>
                        <Button 
                          type="submit" 
                          className="btn-custom"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Creating User...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              Create User
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddUser;
