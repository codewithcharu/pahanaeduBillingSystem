import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Alert, Spinner, Image } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    
    setLoading(true);
    try {
      // Upload photo first if selected
      let photoUrl = null;
      if (profilePhoto) {
        const formData = new FormData();
        formData.append('photo', profilePhoto);
        
        const photoResponse = await axios.post('/api/admin/profile/photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        photoUrl = photoResponse.data.photoUrl;
      }

      // Update profile
      await updateProfile({
        ...profileData,
        ...(photoUrl && { photoUrl })
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        setErrors({ currentPassword: error.response.data.message });
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setErrors({});
  };

  return (
    <div className="pt-5">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-gradient fw-bold mb-2">Admin Profile</h1>
            <p className="text-white-50 mb-0">Manage your administrator account settings</p>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Profile Information</h5>
                  {!isEditing ? (
                    <Button
                      variant="outline-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <FaEdit className="me-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                        <FaTimes className="me-2" />
                        Cancel
                      </Button>
                      <Button
                        className="btn-custom"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2" />
                        ) : (
                          <FaSave className="me-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Profile Photo Section */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <Image
                      src={profilePhotoPreview || user?.photoUrl || '/default-avatar.png'}
                      alt="Profile"
                      roundedCircle
                      width={120}
                      height={120}
                      className="border border-3 border-primary"
                      style={{ objectFit: 'cover' }}
                    />
                    {isEditing && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="position-absolute bottom-0 end-0 rounded-circle"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ width: '32px', height: '32px' }}
                      >
                        <FaCamera size={12} />
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  {isEditing && (
                    <p className="text-muted mt-2 mb-0">
                      <small>Click camera icon to change photo (Max 5MB)</small>
                    </p>
                  )}
                </div>

                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          className={`form-control-custom ${errors.fullName ? 'is-invalid' : ''}`}
                          disabled={!isEditing}
                        />
                        {errors.fullName && (
                          <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={user?.username || ''}
                          className="form-control-custom"
                          disabled
                        />
                        <Form.Text className="text-muted">
                          Username cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                          disabled={!isEditing}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className={`form-control-custom ${errors.phone ? 'is-invalid' : ''}`}
                          disabled={!isEditing}
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          value="Administrator"
                          className="form-control-custom"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Security Section */}
            <Card className="card-custom border-0 mt-4">
              <Card.Body className="p-4">
                <h5 className="mb-3">Security Settings</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Password</h6>
                    <p className="text-muted mb-0">Change your account password</p>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FaLock className="me-2" />
                    Change Password
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h5 className="mb-3">Account Information</h5>
                <div className="mb-3">
                  <small className="text-muted">Account Type</small>
                  <p className="mb-0 fw-semibold">System Administrator</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">User ID</small>
                  <p className="mb-0">{user?.id}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Permissions</small>
                  <ul className="list-unstyled mb-0">
                    <li>• Manage Users</li>
                    <li>• Manage Items</li>
                    <li>• View All Bills</li>
                    <li>• System Administration</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Change Password Modal */}
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`form-control-custom ${errors.currentPassword ? 'is-invalid' : ''}`}
                  placeholder="Enter current password"
                />
                {errors.currentPassword && (
                  <div className="invalid-feedback">{errors.currentPassword}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-control-custom ${errors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="Enter new password"
                />
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-control-custom ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminProfile;
