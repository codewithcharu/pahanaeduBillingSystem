import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEye, FaTrash, FaPrint, FaDownload, FaSearch, FaFileInvoice } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Bills = () => {
  const { isAdmin } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [pdfLoading, setPdfLoading] = useState({});
  const [formData, setFormData] = useState({
    userId: '',
    items: [{ itemId: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchBills();
    if (isAdmin()) {
      fetchUsers();
    }
    fetchItems();
  }, [ isAdmin ]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bills');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/v1/items');
      // Handle paginated response from backend
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setItems(response.data.content);
      } else if (response.data && Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        console.warn('Items API returned non-array data:', response.data);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      // Set empty array on error to prevent map errors
      setItems([]);
    }
  };

  const handleCreateBill = async () => {
    try {
      const billData = {
        userId: formData.userId,
        items: formData.items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await axios.post('/api/bills', billData);
      toast.success('Bill created successfully');
      setShowCreateModal(false);
      setFormData({ userId: '', items: [{ itemId: '', quantity: 1, price: 0 }] });
      fetchBills();
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`/api/bills/${billId}`);
        toast.success('Bill deleted successfully');
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
        toast.error('Failed to delete bill');
      }
    }
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemRow = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = (billItems) => {
    if (!Array.isArray(billItems)) return 0;
    return billItems.reduce((sum, item) => {
      const price = item.unitPrice || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (quantity * price);
    }, 0);
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

  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bill.id.toString().includes(searchLower) ||
      bill.user?.fullName?.toLowerCase().includes(searchLower) ||
      bill.user?.username?.toLowerCase().includes(searchLower)
    );
  });

  const handleDownloadPDF = async (billId) => {
    try {
      setPdfLoading({ ...pdfLoading, [billId]: true });
      const response = await axios.get(`/api/pdf/bill/${billId}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
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
      
      // Create a blob URL and open in new window for printing
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
                <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Bills Management</h1>
                <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>View and manage all billing records</p>
              </div>
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
                        placeholder="Search bills by ID, user name, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control-custom ps-5"
                      />
                    </div>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="info" className="fs-6 p-2">
                      Total Bills: {filteredBills.length}
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bills Table */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-0">
                <Table className="table-custom mb-0">
                  <thead>
                    <tr>
                      <th>Bill ID</th>
                      <th>User</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="text-muted">
                            <FaFileInvoice size={48} className="mb-3 opacity-50" />
                            <p className="mb-0">No bills found</p>
                            <small>Create your first bill to get started</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill) => (
                        <tr key={bill.id}>
                          <td>
                            <Badge bg="primary" className="fs-6">
                              #{bill.id}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">
                                {bill.user?.fullName || 'N/A'}
                              </div>
                              <small className="text-muted">
                                @{bill.user?.username}
                              </small>
                            </div>
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
                              {isAdmin() && (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDeleteBill(bill.id)}
                                  title="Delete Bill (Admin Only)"
                                >
                                  <FaTrash />
                                </Button>
                              )}
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

        {/* Create Bill Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Create New Bill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select User</Form.Label>
                <Form.Select
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="form-control-custom"
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} (@{user.username})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bill Items</Form.Label>
                {formData.items.map((item, index) => (
                  <Row key={index} className="mb-2">
                    <Col md={4}>
                      <Form.Select
                        value={item.itemId}
                        onChange={(e) => updateItemRow(index, 'itemId', e.target.value)}
                        className="form-control-custom"
                      >
                        <option value="">Select item...</option>
                        {Array.isArray(items) && items.map(itemOption => (
                          <option key={itemOption.id} value={itemOption.id}>
                            {itemOption.name} - ${itemOption.price}
                          </option>
                        ))}
                        {(!Array.isArray(items) || items.length === 0) && <option disabled>Loading items...</option>}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItemRow(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="form-control-custom"
                        min="1"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItemRow(index, 'price', parseFloat(e.target.value) || 0)}
                        className="form-control-custom"
                        step="0.01"
                        min="0"
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeItemRow(index)}
                        disabled={formData.items.length === 1}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addItemRow}
                  className="mt-2"
                >
                  <FaPlus className="me-2" />
                  Add Item
                </Button>
              </Form.Group>

              <div className="text-end">
                <strong>Total: {formatCurrency(calculateTotal(formData.items))}</strong>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleCreateBill}
              disabled={!formData.userId || formData.items.some(item => !item.itemId)}
            >
              Create Bill
            </Button>
          </Modal.Footer>
        </Modal>

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
                    <strong>User:</strong> {selectedBill.user?.fullName}
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

export default Bills;
