import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaCalculator, 
  FaFileInvoice, 
  FaBox, 
  FaUser, 
  FaQuestionCircle,
  FaChartLine,
  FaUsers,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBills: 0,
    totalItems: 0,
    totalUsers: 0,
    totalAmount: 0
  });
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch statistics from backend
        const [billsResponse, itemsResponse, usersResponse] = await Promise.all([
          axios.get('/api/bills'),
          axios.get('/api/v1/items'),
          isAdmin() ? axios.get('/api/v1/users') : Promise.resolve({ data: [] })
        ]);

        const totalAmount = billsResponse.data.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
        
        // Calculate total items purchased by customers
        const totalItemsPurchased = billsResponse.data.reduce((sum, bill) => {
          return sum + (bill.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
        }, 0);

        setStats({
          totalBills: billsResponse.data.length,
          totalItems: totalItemsPurchased, // Total items purchased by customers
          totalUsers: usersResponse.data.length,
          totalAmount: totalAmount
        });

        // Get recent bills (last 5)
        const sortedBills = billsResponse.data
          .sort((a, b) => new Date(b.billDate) - new Date(a.billDate))
          .slice(0, 5);
        setRecentBills(sortedBills);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [isAdmin]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
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
        {/* Welcome Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="text-white fw-bold mb-3" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Welcome back, {user?.fullName || user?.username}!
              </h1>
              <p className="lead text-white" style={{ fontSize: '1.2rem', opacity: '0.9' }}>
                Here's what's happening with your billing system today
              </p>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-5 justify-content-center">
          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="stats-card border-0 h-100">
              <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div className="flex-grow-1">
                  <div className="stats-number">{stats.totalBills}</div>
                  <div className="stats-label">Total Bills</div>
                </div>
                <div className="ms-3">
                  <FaFileInvoice size={35} style={{ color: '#667eea', opacity: 0.8 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="stats-card border-0 h-100">
              <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div className="flex-grow-1">
                  <div className="stats-number">{stats.totalItems}</div>
                  <div className="stats-label">Total Items</div>
                </div>
                <div className="ms-3">
                  <FaBox size={35} style={{ color: '#667eea', opacity: 0.8 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="stats-card border-0 h-100">
              <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div className="flex-grow-1">
                  <div className="stats-number" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.totalAmount)}</div>
                  <div className="stats-label">Total Amount</div>
                </div>
                <div className="ms-3">
                  <FaChartLine size={35} style={{ color: '#667eea', opacity: 0.8 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {isAdmin() && (
            <Col xl={3} lg={6} md={6} className="mb-4">
              <Card className="stats-card border-0 h-100">
                <Card.Body className="d-flex align-items-center justify-content-between p-4">
                  <div className="flex-grow-1">
                    <div className="stats-number">{stats.totalUsers}</div>
                    <div className="stats-label">Total Users</div>
                  </div>
                  <div className="ms-3">
                    <FaUsers size={35} style={{ color: '#667eea', opacity: 0.8 }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaCalculator className="me-3" />
                  Quick Actions
                </h3>
                
                <Row>
                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/bills" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaFileInvoice size={30} className="mb-3" />
                        <span className="fw-semibold">View Bills</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/items" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaBox size={30} className="mb-3" />
                        <span className="fw-semibold"> Items</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/profile" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaUser size={30} className="mb-3" />
                        <span className="fw-semibold">My Profile</span>
                      </Button>
                    </Link>
                  </Col>

                  <Col lg={3} md={6} className="mb-3">
                    <Link to="/help" className="text-decoration-none">
                      <Button className="btn-custom w-100 py-4 d-flex flex-column align-items-center">
                        <FaQuestionCircle size={30} className="mb-3" />
                        <span className="fw-semibold">Help</span>
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Admin Section */}
        {isAdmin() && (
          <Row className="mb-5">
            <Col>
              <Card className="card-custom border-0">
                <Card.Body className="p-4">
                  <h3 className="text-gradient fw-bold mb-4">
                    <FaCog className="me-3" />
                    Admin Actions
                  </h3>
                  
                  <Row>
                    <Col lg={4} md={6} className="mb-3">
                      <Link to="/admin/dashboard" className="text-decoration-none">
                        <Button className="btn-custom-secondary w-100 py-3">
                          <FaChartLine className="me-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    </Col>

                    <Col lg={4} md={6} className="mb-3">
                      <Link to="/admin/users" className="text-decoration-none">
                        <Button className="btn-custom-secondary w-100 py-3">
                          <FaUsers className="me-2" />
                          Manage Users
                        </Button>
                      </Link>
                    </Col>

                    <Col lg={4} md={6} className="mb-3">
                      <Link to="/admin/users/add" className="text-decoration-none">
                        <Button className="btn-custom-secondary w-100 py-3">
                          <FaUser className="me-2" />
                          Add New User
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Activity */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-gradient fw-bold mb-4">
                  <FaChartLine className="me-3" />
                  Recent Activity
                </h3>
                
                {recentBills.length > 0 ? (
                  <div>
                    {recentBills.map((bill, index) => (
                      <div key={bill.id} className="d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FaFileInvoice className="text-primary" size={20} />
                          </div>
                          <div>
                            <div className="fw-semibold">Bill #{bill.id}</div>
                            <small className="text-muted">
                              {new Date(bill.billDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-success">{formatCurrency(bill.totalAmount)}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>
                            {bill.items && bill.items.length > 0 ? (
                              bill.items.map((item, idx) => (
                                <div key={idx}>
                                  {item.item?.name || 'N/A'} (x{item.quantity})
                                </div>
                              ))
                            ) : (
                              <small>No items</small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center mt-3">
                      <Link to="/bills" className="text-decoration-none">
                        <Button variant="outline-primary" size="sm">
                          View All Bills
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <FaChartLine size={48} className="mb-3 opacity-50" />
                    <p className="mb-0">No recent activity to display</p>
                    <small>Start creating bills to see recent activity here</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
