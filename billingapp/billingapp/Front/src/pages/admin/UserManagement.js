import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/api/v1/users/${selectedUser.id}`, formData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ fullName: '', email: '', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/v1/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const isAdminUser = (user) => {
    return user.role === 'ADMIN';
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" className="spinner-custom" size="lg" />
      </div>
    );
  }

  return (
    <div className="pt-5">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>User Management</h1>
                <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>Manage system users and their permissions</p>
              </div>
              <Link to="/admin/users/add">
                <Button className="btn-custom">
                  <FaUserPlus className="me-2" />
                  Add New User
                </Button>
              </Link>
            </div>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="position-relative">
                      <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        type="text"
                        placeholder="Search users by username, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control-custom ps-5"
                      />
                    </div>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="info" className="fs-6 p-2">
                      Total Users: {filteredUsers.length}
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-0">
                <Table className="table-custom mb-0">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="text-muted">
                            <FaUsers size={48} className="mb-3 opacity-50" />
                            <p className="mb-0">No users found</p>
                            <small>Add your first user to get started</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <Badge bg="secondary" className="fs-6">
                              #{user.id}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-semibold">@{user.username}</div>
                          </td>
                          <td>
                            {user.fullName || (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td>
                            {user.email || (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td>
                            {user.phone || (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${isAdminUser(user) ? 'badge-admin' : 'badge-user'}`}>
                              {isAdminUser(user) ? 'ADMIN' : 'USER'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link to={`/admin/users/${user.id}/bills`}>
                                <Button
                                  size="sm"
                                  variant="outline-info"
                                  title="View User Bills"
                                >
                                  <FaEye />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => openEditModal(user)}
                                title="Edit User"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete User"
                                disabled={isAdminUser(user)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Edit User Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User: {selectedUser?.username}</Modal.Title>
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
                  placeholder="Enter full name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter email address"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Username and role cannot be changed. 
                  To change these, you'll need to delete and recreate the user.
                </small>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleUpdateUser}
            >
              Update User
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default UserManagement;
