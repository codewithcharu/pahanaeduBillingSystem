import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Items = () => {
  const { isAdmin, user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [billData, setBillData] = useState({
    quantity: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: 0
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
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
      // Set empty array on error to prevent filter errors
      setItems([]);
      toast.error('Failed to fetch items');
    } finally {
      setItemsLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      await axios.post('/api/v1/items', itemData);
      toast.success('Item created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', price: '', category: '', stockQuantity: 0 });
      fetchItems();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      await axios.put(`/api/v1/items/${selectedItem.id}`, itemData);
      toast.success('Item updated successfully');
      setShowEditModal(false);
      setSelectedItem(null);
      setFormData({ name: '', description: '', price: '', category: '', stockQuantity: 0 });
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/v1/items/${itemId}`);
        toast.success('Item deleted successfully');
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || '',
      stockQuantity: item.stock || 0
    });
    setShowEditModal(true);
  };

  const openBuyModal = (item) => {
    setSelectedItem(item);
    setBillData({
      quantity: 1,
      customerName: user?.fullName || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || ''
    });
    setShowBillModal(true);
  };

  const handleBuyItem = async () => {
    try {
      const billRequest = {
        userId: user?.id,
        items: [{
          itemId: selectedItem.id,
          quantity: billData.quantity
        }]
      };

      const response = await axios.post('/api/bills', billRequest);
      toast.success('Bill generated successfully!');
      setShowBillModal(false);
      setBillData({ quantity: 1, customerName: '', customerEmail: '', customerPhone: '' });
      setSelectedItem(null);
      
      // Optionally redirect to bills page or show bill details
      console.log('Generated bill:', response.data);
    } catch (error) {
      console.error('Error generating bill:', error);
      if (error.response?.data) {
        toast.error(`Failed to generate bill: ${error.response.data}`);
      } else {
        toast.error('Failed to generate bill');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  // Ensure items is always an array to prevent filter errors
  const safeItems = Array.isArray(items) ? items : [];
  
  const filteredItems = safeItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    );
  });

  if (itemsLoading) {
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
                <h1 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  {isAdmin() ? 'Items Management' : 'Shop Items'}
                </h1>
                <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: '0.9' }}>
                  {isAdmin() ? 'View and manage inventory items' : 'Browse and purchase items'}
                </p>
              </div>
              {isAdmin() && (
                <Button 
                  className="btn-custom"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus className="me-2" />
                  Add New Item
                </Button>
              )}
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
                        placeholder="Search items by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control-custom ps-5"
                      />
                    </div>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="info" className="fs-6 p-2">
                      Total Items: {filteredItems.length}
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Items Table */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-0">
                {itemsLoading ? (
                  <div className="d-flex justify-content-center align-items-center p-5">
                    <Spinner animation="border" className="spinner-custom" />
                  </div>
                ) : (
                  <Table className="table-custom mb-0">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>{isAdmin() ? 'Actions' : 'Purchase'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div className="text-muted">
                              <FaBox size={48} className="mb-3 opacity-50" />
                              <p className="mb-0">No items found</p>
                              <small>Add your first item to get started</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-semibold">{item.name}</div>
                              <small className="text-muted">ID: #{item.id}</small>
                            </td>
                            <td>
                              {item.description || (
                                <span className="text-muted">No description</span>
                              )}
                            </td>
                            <td>
                              {item.category ? (
                                <Badge bg="secondary">{item.category}</Badge>
                              ) : (
                                <span className="text-muted">Uncategorized</span>
                              )}
                            </td>
                            <td className="fw-bold">
                              {formatCurrency(item.price)}
                            </td>
                            <td>
                              <Badge bg={(item.stock || 0) > 10 ? 'success' : (item.stock || 0) > 0 ? 'warning' : 'danger'}>
                                {item.stock || 0} units
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                {isAdmin() ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => openEditModal(item)}
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-danger"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => openBuyModal(item)}
                                    className="d-flex align-items-center gap-1"
                                  >
                                    <FaShoppingCart />
                                    Buy
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Create Item Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter item name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter item description"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="Enter category"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (LKR)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  className="form-control-custom"
                  placeholder="Enter stock quantity"
                  min="0"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleCreateItem}
              disabled={!formData.name || !formData.price || parseFloat(formData.price) <= 0}
            >
              Create Item
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Item Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter item name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control-custom"
                  placeholder="Enter item description"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="Enter category"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (LKR)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  className="form-control-custom"
                  placeholder="Enter stock quantity"
                  min="0"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-custom"
              onClick={handleUpdateItem}
              disabled={!formData.name || !formData.price || parseFloat(formData.price) <= 0}
            >
              Update Item
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Buy Item Modal */}
        <Modal show={showBillModal} onHide={() => setShowBillModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Purchase Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedItem && (
              <>
                <div className="mb-3 p-3 bg-light rounded">
                  <h5 className="mb-1">{selectedItem.name}</h5>
                  <p className="text-muted mb-1">{selectedItem.description}</p>
                  <p className="fw-bold mb-0">Price: {formatCurrency(selectedItem.price)}</p>
                </div>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={billData.quantity}
                      onChange={(e) => setBillData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="form-control-custom no-spinner"
                      min="1"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={billData.customerName}
                      onChange={(e) => setBillData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="Enter customer name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={billData.customerEmail}
                      onChange={(e) => setBillData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="Enter email address"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={billData.customerPhone}
                      onChange={(e) => setBillData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="form-control-custom no-spinner"
                      placeholder="Enter phone number"
                    />
                  </Form.Group>

                  <div className="bg-primary text-white p-3 rounded">
                    <h5 className="mb-0">
                      Total: {formatCurrency(selectedItem.price * billData.quantity)}
                    </h5>
                  </div>
                </Form>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBillModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success"
              onClick={handleBuyItem}
              disabled={!billData.customerName || !billData.customerEmail || billData.quantity < 1}
            >
              <FaShoppingCart className="me-2" />
              Generate Bill
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Items;
