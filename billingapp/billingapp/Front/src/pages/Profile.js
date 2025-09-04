import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { FaUser, FaEdit, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, requestPasswordChangeOtp, verifyOtpAndChangePassword } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBills: 0,
    thisMonth: 0,
    totalSpent: 0
  });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [passwordStep, setPasswordStep] = useState(1); // 1: Current password, 2: OTP & New password

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/bills');
      const userBills = response.data || [];
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthBills = userBills.filter(bill => {
        if (!bill.billDate) return false;
        const billDate = new Date(bill.billDate);
        return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
      });
      
      const totalSpent = userBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      
      setUserStats({
        totalBills: userBills.length,
        thisMonth: thisMonthBills.length,
        totalSpent: totalSpent
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const handleProfileUpdate = async () => {
    // Validate form data
    if (!formData.fullName || !formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      // Send complete profile data including id and username
      const profileData = {
        id: user.id,
        username: user.username,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || ''
      };
      
      const success = await updateProfile(profileData);
      if (success) {
        setShowEditModal(false);
        setFormData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || ''
        });
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStep1 = async () => {
    // Validate current password
    if (!passwordData.currentPassword || !passwordData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    try {
      setLoading(true);
      const result = await requestPasswordChangeOtp(passwordData.currentPassword.trim());
      if (result.success) {
        setPasswordStep(2);
        toast.info(`Please check your email (${user?.email}) for the OTP code`);
      }
    } catch (error) {
      console.error('OTP request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStep2 = async () => {
    // Validate OTP and new password
    if (!passwordData.otp || !passwordData.otp.trim()) {
      toast.error('OTP is required');
      return;
    }
    
    if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    
    if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
      toast.error('Please confirm your new password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      const success = await verifyOtpAndChangePassword({
        currentPassword: passwordData.currentPassword.trim(),
        otp: passwordData.otp.trim(),
        newPassword: passwordData.newPassword.trim()
      });
      if (success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          otp: ''
        });
        setPasswordStep(1);
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setShowEditModal(true);
  };

  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
    setPasswordStep(1);
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordStep(1);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
  };

  const handleBackToStep1 = () => {
    setPasswordStep(1);
    setPasswordData({
      ...passwordData,
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="pt-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Profile Header */}
            <Row className="mb-4">
              <Col>
                <div className="text-center">
                  <h1 className="text-white fw-bold mb-3" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>My Profile</h1>
                  <p className="text-white" style={{ fontSize: '1.1rem', opacity: '0.9' }}>Manage your account information and settings</p>
                </div>
              </Col>
            </Row>

            {/* Profile Information */}
            <Row className="mb-4">
              <Col>
                <Card className="card-custom border-0">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="text-dark fw-bold mb-0">
                        <FaUser className="me-3" style={{ color: '#667eea' }} />
                        Profile Information
                      </h3>
                      <Button 
                        className="btn-custom"
                        onClick={openEditModal}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Button>
                    </div>

                    <Row>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">User ID</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          #{user?.id}
                        </div>
                        <small className="text-muted">User ID cannot be changed</small>
                      </Col>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">Username</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          @{user?.username}
                        </div>
                        <small className="text-muted">Username cannot be changed</small>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">Full Name</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          {user?.fullName || 'Not set'}
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          {user?.email || 'Not set'}
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">Phone</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          {user?.phone || 'Not set'}
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <label className="form-label fw-semibold">Role</label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                            {user?.role || 'USER'}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Security Settings */}
            <Row className="mb-4">
              <Col>
                <Card className="card-custom border-0">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="text-dark fw-bold mb-0">
                        <FaLock className="me-3" style={{ color: '#667eea' }} />
                        Security Settings
                      </h3>
                      <Button 
                        className="btn-custom-secondary"
                        onClick={openPasswordModal}
                      >
                        <FaLock className="me-2" />
                        Change Password
                      </Button>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center p-3 bg-light rounded">
                          <div className="me-3">
                            <FaLock size={24} className="text-primary" />
                          </div>
                          <div>
                            <h6 className="mb-1">Password</h6>
                            <small className="text-muted">Last changed: Recently</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center p-3 bg-light rounded">
                          <div className="me-3">
                            <FaUser size={24} className="text-success" />
                          </div>
                          <div>
                            <h6 className="mb-1">Account Status</h6>
                            <small className="text-muted">Active</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Account Statistics */}
            <Row>
              <Col>
                <Card className="card-custom border-0">
                  <Card.Body className="p-4">
                    <h3 className="text-dark fw-bold mb-4">
                      <FaUser className="me-3" style={{ color: '#667eea' }} />
                      Account Statistics
                    </h3>

                    <Row>
                      <Col md={4} className="text-center mb-3">
                        <div className="p-3 bg-light rounded">
                          <h4 className="text-primary mb-2">{userStats.totalBills}</h4>
                          <small className="text-muted">Total Bills</small>
                        </div>
                      </Col>
                      <Col md={4} className="text-center mb-3">
                        <div className="p-3 bg-light rounded">
                          <h4 className="text-success mb-2">{userStats.thisMonth}</h4>
                          <small className="text-muted">This Month</small>
                        </div>
                      </Col>
                      <Col md={4} className="text-center mb-3">
                        <div className="p-3 bg-light rounded">
                          <h4 className="text-info mb-2">{formatCurrency(userStats.totalSpent)}</h4>
                          <small className="text-muted">Total Spent</small>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Edit Profile Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter your full name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter your phone number"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Change Password Modal */}
        <Modal show={showPasswordModal} onHide={closePasswordModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Change Password {passwordStep === 2 && '- Step 2 of 2'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {passwordStep === 1 ? (
              <Form>
                <div className="mb-3 text-info">
                  <small>
                    <strong>Step 1:</strong> Enter your current password to receive an OTP via email
                  </small>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-control-custom"
                    placeholder="Enter your current password"
                    disabled={loading}
                  />
                </Form.Group>
              </Form>
            ) : (
              <Form>
                <div className="mb-3">
                  <div className="alert alert-info">
                    <small>
                      <strong>Step 2:</strong> Check your email for the OTP code and enter your new password below.
                      <br />
                      OTP sent to: <strong>{user?.email}</strong>
                      <br />
                      <em>Note: Check your spam folder if you don't see the email within 2-3 minutes.</em>
                    </small>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={passwordData.otp}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, otp: e.target.value }))}
                    className="form-control-custom"
                    placeholder="Enter 6-digit OTP from email"
                    maxLength="6"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="form-control-custom"
                    placeholder="Enter your new password"
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
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="form-control-custom"
                    placeholder="Confirm your new password"
                    disabled={loading}
                />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            {passwordStep === 2 && (
              <Button variant="outline-secondary" onClick={handleBackToStep1} disabled={loading}>
                Back to Step 1
              </Button>
            )}
            <Button variant="secondary" onClick={closePasswordModal} disabled={loading}>
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={passwordStep === 1 ? handlePasswordStep1 : handlePasswordStep2}
              disabled={loading || (passwordStep === 1 ? !passwordData.currentPassword : (!passwordData.otp || !passwordData.newPassword || !passwordData.confirmPassword))}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {passwordStep === 1 ? 'Sending OTP...' : 'Changing Password...'}
                </>
              ) : (
                <>
                  <FaLock className="me-2" />
                  {passwordStep === 1 ? 'Send OTP' : 'Change Password'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Profile;
