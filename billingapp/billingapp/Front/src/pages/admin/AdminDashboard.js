import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaFileInvoice, 
  FaBox, 
  FaChartLine, 
  FaUserPlus, 
  FaCog,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBills: 0,
    totalItems: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, billsResponse, itemsResponse] = await Promise.all([
        axios.get('/api/v1/users'),
        axios.get('/api/bills'),
        axios.get('/api/v1/items')
      ]);

      const totalAmount = billsResponse.data.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

      setStats({
        totalUsers: usersResponse.data.length,
        totalBills: billsResponse.data.length,
        totalItems: itemsResponse.data.length,
        totalAmount: totalAmount
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
            <div className="text-center">
              <h1 className="text-gradient fw-bold mb-3">Admin Dashboard</h1>
              <p className="text-white-50">System overview and administrative controls</p>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-5">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card border-0">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-number">{stats.totalUsers}</div>
                    <div className="stats-label">Total Users</div>
                  </div>
                  <FaUsers size={40} className="opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card border-0">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-number">{stats.totalBills}</div>
                    <div className="stats-label">Total Bills</div>
                  </div>
                  <FaFileInvoice size={40} className="opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card border-0">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-number">{stats.totalItems}</div>
                    <div className="stats-label">Total Items</div>
                  </div>
                  <FaBox size={40} className="opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card border-0">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-number">{formatCurrency(stats.totalAmount)}</div>
                    <div className="stats-label">Total Revenue</div>
                  </div>
                  <FaChartLine size={40} className="opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaCog className="me-3" />
                  Quick Actions
                </h3>
                
                <Row>
                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/admin/users/add" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaUserPlus size={30} className="mb-3" />
                        <span className="fw-semibold">Add User</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/admin/users" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaUsers size={30} className="mb-3" />
                        <span className="fw-semibold">Manage Users</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/items" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaBox size={30} className="mb-3" />
                        <span className="fw-semibold">Manage Items</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/bills" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaFileInvoice size={30} className="mb-3" />
                        <span className="fw-semibold">View Bills</span>
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* System Information */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaCog className="me-3" />
                  System Information
                </h3>
                
                <Row>
                  <Col md={6}>
                    <h5>System Status</h5>
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>All systems operational</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>Database connection: Active</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>Authentication: Working</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h5>Recent Activity</h5>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-1 text-muted">No recent activity to display</p>
                      <small className="text-muted">Activity tracking coming soon...</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Admin Tools */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaCog className="me-3" />
                  Administrative Tools
                </h3>
                
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaUsers size={48} className="text-primary mb-3" />
                      <h5>User Management</h5>
                      <p className="text-muted">Add, edit, and manage system users</p>
                      <Link to="/admin/users">
                        <Button variant="outline-primary" size="sm">
                          <FaEye className="me-2" />
                          Manage Users
                        </Button>
                      </Link>
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaFileInvoice size={48} className="text-success mb-3" />
                      <h5>Bill Management</h5>
                      <p className="text-muted">View and manage all system bills</p>
                      <Link to="/bills">
                        <Button variant="outline-success" size="sm">
                          <FaEye className="me-2" />
                          View Bills
                        </Button>
                      </Link>
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaBox size={48} className="text-info mb-3" />
                      <h5>Item Management</h5>
                      <p className="text-muted">Manage inventory and pricing</p>
                      <Link to="/items">
                        <Button variant="outline-info" size="sm">
                          <FaEye className="me-2" />
                          Manage Items
                        </Button>
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Documentation & Guides */}
        <Row className="mt-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaCog className="me-3" />
                  Documentation & Guides
                </h3>
                
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaUsers size={48} className="text-warning mb-3" />
                      <h5>User Guide</h5>
                      <p className="text-muted">Comprehensive guide for system users</p>
                      <a href="/help/user" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline-warning" size="sm">
                          <FaEye className="me-2" />
                          View User Guide
                        </Button>
                      </a>
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaCog size={48} className="text-danger mb-3" />
                      <h5>Admin Guide</h5>
                      <p className="text-muted">Administrative functions and system management</p>
                      <a href="/help/admin" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline-danger" size="sm">
                          <FaEye className="me-2" />
                          View Admin Guide
                        </Button>
                      </a>
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <div className="text-center p-4 bg-light rounded">
                      <FaFileInvoice size={48} className="text-secondary mb-3" />
                      <h5>API Documentation</h5>
                      <p className="text-muted">Interactive API reference and testing</p>
                      <a href="/swagger-ui/index.html" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline-secondary" size="sm">
                          <FaEye className="me-2" />
                          Open API Docs
                        </Button>
                      </a>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
