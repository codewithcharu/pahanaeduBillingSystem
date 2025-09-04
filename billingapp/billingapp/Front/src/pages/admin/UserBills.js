import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaEye, FaPrint, FaDownload, FaFileInvoice, FaUser } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserBills = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [pdfLoading, setPdfLoading] = useState({});

  useEffect(() => {
    fetchUserBills();
    fetchUserDetails();
  }, [userId]);

  const fetchUserBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bills/user/${userId}`);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching user bills:', error);
      if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to fetch user bills');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleDownloadPDF = async (billId) => {
    try {
      setPdfLoading({ ...pdfLoading, [billId]: true });
      const response = await axios.get(`/api/pdf/bill/${billId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setPdfLoading(prev => ({ ...prev, [billId]: false }));
    }
  };

  const handlePrintPDF = async (billId) => {
    try {
      setPdfLoading({ ...pdfLoading, [billId]: true });
      const response = await axios.get(`/api/pdf/bill/${billId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast.success('PDF opened for printing');
    } catch (error) {
      console.error('Error opening PDF for printing:', error);
      toast.error('Failed to open PDF for printing');
    } finally {
      setPdfLoading(prev => ({ ...prev, [billId]: false }));
    }
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  variant="outline-light"
                  className="mb-3"
                  onClick={() => navigate('/admin/users')}
                >
                  <FaArrowLeft className="me-2" />
                  Back to User Management
                </Button>
                <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  User Bills
                </h1>
                <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>
                  View all bills for {user?.fullName || 'User'}
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* User Info Card */}
        {user && (
          <Row className="mb-4">
            <Col>
              <Card className="card-custom border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle p-3 me-3">
                          <FaUser className="text-white" size={24} />
                        </div>
                        <div>
                          <h5 className="mb-1">{user.fullName || 'N/A'}</h5>
                          <p className="text-muted mb-1">@{user.username}</p>
                          <p className="text-muted mb-0">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="text-md-end">
                      <Badge bg="info" className="fs-6 p-2">
                        Total Bills: {bills.length}
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Bills Table */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-0">
                <Table className="table-custom mb-0">
                  <thead>
                    <tr>
                      <th>Bill ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="text-muted">
                            <FaFileInvoice size={48} className="mb-3 opacity-50" />
                            <p className="mb-0">No bills found for this user</p>
                            <small>This user hasn't created any bills yet</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bills.map((bill) => (
                        <tr key={bill.id}>
                          <td>
                            <Badge bg="primary" className="fs-6">
                              #{bill.id}
                            </Badge>
                          </td>
                          <td>{formatDate(bill.billDate)}</td>
                          <td>
                            <div>
                              {bill.items && bill.items.length > 0 ? (
                                bill.items.map((item, index) => (
                                  <div key={index} className="mb-1">
                                    <span className="fw-semibold">{item.item?.name || 'N/A'}</span>
                                    <small className="text-muted ms-2">(x{item.quantity})</small>
                                  </div>
                                ))
                              ) : (
                                <Badge bg="secondary">No items</Badge>
                              )}
                            </div>
                          </td>
                          <td className="fw-bold">
                            {formatCurrency(bill.totalAmount || 0)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowViewModal(true);
                                }}
                                title="View Bill Details"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handlePrintPDF(bill.id)}
                                title="Print Bill"
                                disabled={pdfLoading[bill.id]}
                              >
                                {pdfLoading[bill.id] ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <FaPrint />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => handleDownloadPDF(bill.id)}
                                title="Download PDF"
                                disabled={pdfLoading[bill.id]}
                              >
                                {pdfLoading[bill.id] ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <FaDownload />
                                )}
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

        {/* View Bill Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Bill Details #{selectedBill?.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBill && (
              <div>
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>User:</strong> {selectedBill.user?.fullName || user?.fullName}
                  </Col>
                  <Col md={6}>
                    <strong>Date:</strong> {formatDate(selectedBill.billDate)}
                  </Col>
                </Row>
                
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item?.name || 'N/A'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice || item.price)}</td>
                        <td>{formatCurrency(item.quantity * (item.unitPrice || item.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">Total:</td>
                      <td className="fw-bold">
                        {formatCurrency(selectedBill.totalAmount || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default UserBills;
