import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';
import { FaCalculator, FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaUserPlus, FaChartBar, FaFileInvoice, FaBoxes, FaUsers, FaCog, FaQuestionCircle, FaShieldAlt, FaRocket, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Homepage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Fetch featured books from database
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setBooksLoading(true);
        const response = await axios.get('/api/v1/items/featured?size=4');
        setFeaturedBooks(response.data.content || []);
      } catch (error) {
        console.error('Error fetching featured books:', error);
        // Keep empty array if fetch fails
        setFeaturedBooks([]);
      } finally {
        setBooksLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  // Function to generate book cover image URL based on book name
  const getBookCoverImage = (bookName, category) => {
    // Clean the book name for better search results
    const cleanBookName = bookName.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
    
    // Specific book name to URL mapping
    const bookSpecificImages = {
      'madolduwa': 'https://upload.wikimedia.org/wikipedia/en/5/5c/MadolDoova.jpg',
      'makulkama': 'https://lk.lakpura.com/cdn/shop/products/LS645114OE-01-E.jpg?v=1612621752',
      'monalisa': 'https://m.media-amazon.com/images/I/715g1-thvkL._AC_SL1023_.jpg',
      'ape gama': 'https://upload.wikimedia.org/wikipedia/en/2/29/Ape_Gama_cover.jpg'
    };
    
    // Check if we have a specific image for this book
    if (bookSpecificImages[cleanBookName]) {
      return bookSpecificImages[cleanBookName];
    }
    
    // Fallback to generic book images
    const fallbackImages = [
      `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80`,
      `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80`,
      `https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80`,
      `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80`
    ];
    
    // Generate a consistent index based on book name
    const nameHash = cleanBookName.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    
    const imageIndex = Math.abs(nameHash) % fallbackImages.length;
    return fallbackImages[imageIndex];
  };

  // Helper function to get book image with dynamic search and fallback
  const getBookImage = (category, name, index) => {
    // Try to get a book-specific image first
    if (name && name.trim()) {
      // Generate dynamic book cover URL based on book name
      return getBookCoverImage(name, category);
    }
    const categoryImages = {
      'Mathematics': [
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Science': [
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Literature': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Technology': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Computer Science': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Physics': [
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Chemistry': [
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'Biology': [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'English': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ],
      'History': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
      ]
    };

    // Default fallback images array
    const defaultImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400',
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=400'
    ];

    // Get images array for category or use default
    const images = categoryImages[category] || defaultImages;
    
    // Use index to select different images, cycling through available images
    const imageIndex = index % images.length;
    return images[imageIndex];
  };

  // Handle image loading errors with reliable fallbacks
  const handleImageError = (e, bookName, category, index) => {
    // Use guaranteed working Unsplash images as fallbacks
    const fallbackImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80'
    ];
    
    // Use index to select different fallback images
    const fallbackIndex = (index || 0) % fallbackImages.length;
    e.target.src = fallbackImages[fallbackIndex];
  };

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
      
      // Phone number validation (optional field)
      if (formData.phone && formData.phone.trim()) {
        if (formData.phone.length !== 10) {
          newErrors.phone = 'Phone number must be exactly 10 digits';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
          newErrors.phone = 'Phone number must contain only digits';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      if (isRegistering) {
        const response = await axios.post('/api/v1/auth/register', {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
        
        const data = response.data;
        
        if (data && data.id) {
          setSuccessMessage('Registration successful! Welcome to Pahana Edu Book Shop.');
          setErrors({});
          
          setFormData({
            username: '',
            password: '',
            fullName: '',
            email: '',
            phone: ''
          });
          
          setTimeout(() => {
            setSuccessMessage('Registration successful! Please login with your credentials.');
            setIsRegistering(false);
          }, 2000);
        } else {
          const errorMessage = data?.message || 'Registration failed. Please try again.';
          setErrors({ general: errorMessage });
          setSuccessMessage('');
        }
      } else {
        const success = await login(formData.username, formData.password);
        if (success) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', error);
      
      if (isRegistering) {
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response?.status === 409) {
          setErrors({ general: 'Username or email already exists. Please choose different credentials.' });
        } else if (error.response?.status === 400) {
          setErrors({ general: 'Invalid registration data. Please check your inputs.' });
        } else if (error.code === 'ERR_NETWORK') {
          setErrors({ general: 'Cannot connect to server. Please check if the backend is running.' });
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else {
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else if (error.code === 'ERR_NETWORK') {
          setErrors({ general: 'Cannot connect to server. Please check if the backend is running.' });
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
        }
      }
      
      setSuccessMessage('');
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

  const features = [
    {
      icon: <FaFileInvoice size={40} />,
      title: "Smart Billing",
      description: "Generate professional invoices and manage billing efficiently with our advanced system."
    },
    {
      icon: <FaBoxes size={40} />,
      title: "Inventory Management",
      description: "Track your book inventory, manage stock levels, and organize your educational materials."
    },
    {
      icon: <FaChartBar size={40} />,
      title: "Analytics Dashboard",
      description: "Get insights into your sales, revenue trends, and business performance metrics."
    },
    {
      icon: <FaUsers size={40} />,
      title: "User Management",
      description: "Manage customer accounts, user roles, and access permissions seamlessly."
    }
  ];

  const quickActions = [
    {
      icon: <FaFileInvoice />,
      title: "Bills",
      description: "Manage invoices and billing",
      action: () => setShowAuthModal(true)
    },
    {
      icon: <FaBoxes />,
      title: "Items",
      description: "Manage inventory items",
      action: () => setShowAuthModal(true)
    },
    {
      icon: <FaChartBar />,
      title: "Dashboard",
      description: "View analytics and reports",
      action: () => setShowAuthModal(true)
    },
    {
      icon: <FaQuestionCircle />,
      title: "Help",
      description: "Get support and documentation",
      action: () => setShowAuthModal(true)
    }
  ];

  return (
    <div className="homepage">
      {/* Navigation Header */}
      <BootstrapNavbar expand="lg" className="navbar-custom shadow-sm" fixed="top">
        <Container>
          <BootstrapNavbar.Brand href="#home" className="fw-bold text-gradient">
            <FaCalculator className="me-2" />
            Pahana Edu Book Shop
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#features" className="mx-2">Features</Nav.Link>
              <Nav.Link href="#about" className="mx-2">About</Nav.Link>
              <Nav.Link href="#contact" className="mx-2">Contact</Nav.Link>
              <Button 
                variant="outline-primary" 
                className="ms-3 me-2"
                onClick={() => {
                  setIsRegistering(false);
                  setShowAuthModal(true);
                }}
              >
                Login
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  setIsRegistering(true);
                  setShowAuthModal(true);
                }}
              >
                Register
              </Button>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100 py-5">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4 hero-title" style={{color: 'white'}}>
                  Smart Billing System for Educational Excellence
                </h1>
                <p className="lead mb-4 hero-subtitle" style={{color: 'rgba(255,255,255,0.9)'}}>
                  Streamline your educational book shop operations with our comprehensive billing and inventory management system. Built for efficiency, designed for growth.
                </p>
                <div className="d-flex gap-3 flex-wrap hero-buttons">
                  <Button 
                    size="lg" 
                    className="btn-custom px-4 py-3"
                    onClick={() => {
                      setIsRegistering(true);
                      setShowAuthModal(true);
                    }}
                  >
                    <FaRocket className="me-2" />
                    Get Started
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg" 
                    className="px-4 py-3"
                    onClick={() => {
                      setIsRegistering(false);
                      setShowAuthModal(true);
                    }}
                  >
                    <FaUser className="me-2" />
                    Login
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image text-center">
                <div className="position-relative float-animation">
                  <img 
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Educational Books Collection"
                    className="img-fluid rounded-4 shadow-lg"
                    style={{
                      maxHeight: '400px',
                      objectFit: 'cover',
                      width: '100%'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="feature-showcase p-4 rounded-4 shadow-lg bg-white bg-opacity-90 pulse-glow">
                      <FaCalculator size={60} className="text-gradient mb-3" />
                      <h5 className="fw-bold text-dark">Billing Made Simple</h5>
                      <p className="text-muted small">Professional invoicing & inventory tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="display-5 fw-bold text-gradient mb-3 fade-in">Powerful Features</h2>
              <p className="lead text-muted fade-in" style={{animationDelay: '0.2s'}}>Everything you need to manage your educational book shop efficiently</p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm feature-card" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <Card.Body className="text-center p-4">
                    <div className="text-gradient mb-3">
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Quick Actions Section */}
      <section className="py-5" style={{background: 'white'}}>
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="display-5 fw-bold text-gradient mb-3 fade-in" style={{color: '#667eea'}}>Quick Access</h2>
              <p className="lead fade-in" style={{color: '#6c757d', animationDelay: '0.2s'}}>Jump straight to the tools you need</p>
            </Col>
          </Row>
          <Row>
            {quickActions.map((action, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card 
                  className="h-100 border-0 shadow-sm quick-action-card cursor-pointer"
                  onClick={action.action}
                  style={{animationDelay: `${0.1 + index * 0.1}s`}}
                >
                  <Card.Body className="text-center p-4">
                    <div className="text-primary mb-3">
                      {React.cloneElement(action.icon, { size: 30 })}
                    </div>
                    <h6 className="fw-bold mb-2" style={{color: '#333'}}>{action.title}</h6>
                    <p className="small" style={{color: '#6c757d'}}>{action.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section id="about" className="py-5 bg-light">
        <Container>
          {/* Main About Content */}
          <Row className="align-items-center mb-5">
            <Col lg={6}>
              <h2 className="display-5 fw-bold text-gradient mb-4 fade-in">About Pahana Edu Book Shop</h2>
              <p className="lead text-muted mb-4 fade-in" style={{animationDelay: '0.2s'}}>
                We're dedicated to providing educational institutions and book shops with cutting-edge billing solutions that simplify operations and enhance productivity. Our comprehensive system manages everything from inventory to customer relationships.
              </p>
              <Row>
                <Col sm={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <FaShieldAlt className="text-success me-3" size={24} />
                    <div>
                      <h6 className="fw-bold mb-1">Secure & Reliable</h6>
                      <small className="text-muted">Enterprise-grade security</small>
                    </div>
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <FaGlobe className="text-info me-3" size={24} />
                    <div>
                      <h6 className="fw-bold mb-1">Cloud-Based</h6>
                      <small className="text-muted">Access from anywhere</small>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col lg={6}>
              <div className="stats-grid">
                <Row>
                  <Col sm={6} className="mb-3">
                    <Card className="border-0 shadow-sm text-center stats-card-hover">
                      <Card.Body>
                        <h3 className="fw-bold text-primary">500+</h3>
                        <small className="text-muted">Happy Customers</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="border-0 shadow-sm text-center stats-card-hover">
                      <Card.Body>
                        <h3 className="fw-bold text-success">99.9%</h3>
                        <small className="text-muted">Uptime</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="border-0 shadow-sm text-center stats-card-hover">
                      <Card.Body>
                        <h3 className="fw-bold text-warning">10K+</h3>
                        <small className="text-muted">Books Sold</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="border-0 shadow-sm text-center stats-card-hover">
                      <Card.Body>
                        <h3 className="fw-bold text-info">24/7</h3>
                        <small className="text-muted">Support</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Featured Books Section */}
          <Row className="mb-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="fw-bold text-gradient mb-3">Featured Educational Books</h3>
              <p className="text-muted">Discover our extensive collection of educational materials</p>
            </Col>
          </Row>
          
          <Row className="mb-5">
            {booksLoading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <Col md={6} lg={3} key={index} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <div className="book-image-container bg-light d-flex align-items-center justify-content-center">
                      <Spinner animation="border" variant="primary" />
                    </div>
                    <Card.Body className="text-center">
                      <div className="mb-2">
                        <span className="badge bg-secondary">Loading...</span>
                      </div>
                      <h6 className="fw-bold mb-2 text-muted">Loading book...</h6>
                      <p className="text-muted small mb-2">Please wait...</p>
                      <h5 className="text-muted">LKR ---</h5>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : featuredBooks.length > 0 ? (
              // Display real books from database
              featuredBooks.map((book, index) => (
                <Col md={6} lg={3} key={book.id || index} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm book-card">
                    <div className="book-image-container">
                      <Card.Img 
                        variant="top" 
                        src={getBookImage(book.category, book.name, index)} 
                        alt={book.name}
                        className="book-image"
                        onError={(e) => handleImageError(e, book.name, book.category, index)}
                      />
                      <div className="book-overlay">
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="view-details-btn"
                          onClick={() => setShowAuthModal(true)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    <Card.Body className="text-center">
                      <div className="mb-2">
                        <span className="badge bg-primary book-category">
                          {book.category || 'General'}
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2" title={book.name}>
                        {book.name.length > 20 ? `${book.name.substring(0, 20)}...` : book.name}
                      </h6>
                      <p className="text-muted small mb-2" title={book.description}>
                        {book.description 
                          ? (book.description.length > 50 
                              ? `${book.description.substring(0, 50)}...` 
                              : book.description)
                          : 'Educational book for students'
                        }
                      </p>
                      <h5 className="text-gradient fw-bold">LKR {book.price.toFixed(2)}</h5>
                      {book.stock > 0 ? (
                        <small className="text-success">In Stock ({book.stock})</small>
                      ) : (
                        <small className="text-danger">Out of Stock</small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              // No books found state
              <Col lg={12} className="text-center">
                <Card className="border-0 shadow-sm py-5">
                  <Card.Body>
                    <FaBoxes size={60} className="text-muted mb-3" />
                    <h5 className="text-muted mb-3">No Featured Books Available</h5>
                    <p className="text-muted">
                      Please add some books to your inventory to display them here.
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={() => setShowAuthModal(true)}
                    >
                      Login to Add Books
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>

          {/* Book Categories Section */}
          <Row className="mb-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="fw-bold text-gradient mb-3">Book Categories</h3>
              <p className="text-muted">Explore our diverse range of educational categories</p>
            </Col>
          </Row>
          
          <Row>
            {[
              {
                category: "Mathematics",
                count: "150+ Books",
                icon: "📊",
                color: "primary",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300"
              },
              {
                category: "Science",
                count: "200+ Books",
                icon: "🔬",
                color: "success",
                image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300"
              },
              {
                category: "Literature",
                count: "300+ Books",
                icon: "📚",
                color: "warning",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdBTRu5sauZmwEDLlrU4K4rtsvJ_9adaTSXg&s"
              },
              {
                category: "Technology",
                count: "180+ Books",
                icon: "💻",
                color: "info",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPbvQvv6J0DY343ZAfha8kDgQenufVhrsxLA&s"
              }
            ].map((category, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm category-card">
                  <div className="category-image-container">
                    <Card.Img 
                      variant="top" 
                      src={category.image} 
                      alt={category.category}
                      className="category-image"
                      onError={handleImageError}
                    />
                    <div className="category-overlay">
                      <div className="category-icon">{category.icon}</div>
                    </div>
                  </div>
                  <Card.Body className="text-center">
                    <h5 className="fw-bold mb-2">{category.category}</h5>
                    <p className={`text-${category.color} fw-semibold mb-3`}>{category.count}</p>
                    <Button 
                      variant={`outline-${category.color}`} 
                      size="sm"
                      onClick={() => setShowAuthModal(true)}
                    >
                      Explore Category
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Why Choose Us Section */}
          <Row className="mt-5 pt-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="fw-bold text-gradient mb-3">Why Choose Pahana Edu Book Shop?</h3>
            </Col>
          </Row>
          
          <Row>
            {[
              {
                icon: <FaBoxes size={40} />,
                title: "Vast Collection",
                description: "Over 1000+ educational books covering all subjects and grades"
              },
              {
                icon: <FaShieldAlt size={40} />,
                title: "Quality Assured",
                description: "All books are verified for quality and authenticity"
              },
              {
                icon: <FaRocket size={40} />,
                title: "Fast Delivery",
                description: "Quick and reliable delivery to your doorstep"
              },
              {
                icon: <FaUsers size={40} />,
                title: "Expert Support",
                description: "Dedicated customer support for all your needs"
              }
            ].map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm text-center feature-highlight-card">
                  <Card.Body className="p-4">
                    <div className="text-gradient mb-3">
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="display-5 fw-bold text-gradient mb-3">Get In Touch</h2>
              <p className="lead text-muted">Ready to transform your billing operations?</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-5 text-center">
                  <FaEnvelope size={50} className="text-gradient mb-4" />
                  <h4 className="fw-bold mb-3">Contact Information</h4>
                  <p className="text-muted mb-4">
                    Email: <strong>pahanaedub@gmail.com</strong>
                  </p>
                  <Button 
                    className="btn-custom px-4 py-3"
                    onClick={() => {
                      setIsRegistering(true);
                      setShowAuthModal(true);
                    }}
                  >
                    Start Your Journey
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4">
        <Container>
          <Row>
            <Col lg={12} className="text-center">
              <p className="mb-0">&copy; 2024 Pahana Edu Book Shop. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-gradient fw-bold mb-0">
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                  </h3>
                  <Button 
                    variant="link" 
                    className="text-muted p-0"
                    onClick={() => setShowAuthModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                {successMessage && (
                  <Alert variant="success" className="mb-3">
                    {successMessage}
                  </Alert>
                )}
                {errors.general && (
                  <Alert variant="danger" className="mb-3">
                    {errors.general}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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

                  {isRegistering && (
                    <>
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

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <FaPhone className="me-2" />
                          Phone Number (Optional)
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
                        />
                        {errors.phone && (
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </>
                  )}

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

                  <Button
                    type="submit"
                    className="btn-custom w-100 py-3 fw-semibold mb-3"
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

                  {!isRegistering && (
                    <div className="text-center mb-3">
                      <Button
                        variant="link"
                        className="text-decoration-none small"
                        onClick={() => {
                          setShowAuthModal(false);
                          navigate('/forgot-password');
                        }}
                        disabled={isSubmitting}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  )}

                  <div className="text-center">
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
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
