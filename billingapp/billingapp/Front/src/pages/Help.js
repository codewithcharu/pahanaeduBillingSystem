import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Accordion, Badge } from 'react-bootstrap';
import { FaQuestionCircle, FaDownload, FaUser, FaUserShield, FaBook, FaFileAlt, FaFilePdf, FaCode, FaCog, FaChartLine, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Help = () => {
  const { isAdmin } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadHelpPDF = async () => {
    try {
      setDownloading(true);
      
      // Create PDF content using HTML and CSS
      const pdfContent = generatePDFContent();
      
      // Create a new window to generate PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      toast.success('PDF generation initiated! Use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const openUserGuide = () => {
    // Create and show user guide content in a new window
    const userGuideContent = generateUserGuideHTML();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(userGuideContent);
    newWindow.document.close();
  };

  const openAdminGuide = () => {
    // Create and show admin guide content in a new window
    const adminGuideContent = generateAdminGuideHTML();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(adminGuideContent);
    newWindow.document.close();
  };

  const openAPIDocs = () => {
    // Try to open Swagger UI, fallback to showing API info
    try {
      window.open('/swagger-ui/index.html', '_blank');
    } catch (error) {
      // Fallback: show API documentation in new window
      const apiDocsContent = generateAPIDocsHTML();
      const newWindow = window.open('', '_blank');
      newWindow.document.write(apiDocsContent);
      newWindow.document.close();
    }
  };

  const generateHelpContent = () => {
    return `BILLING SYSTEM - HELP GUIDE

` +
           `================================

` +
           `USER GUIDE
` +
           `----------

` +
           `1. GETTING STARTED
` +
           `   - Login with your username and password
` +
           `   - Navigate using the top menu bar
` +
           `   - Access Dashboard for overview

` +
           `2. PROFILE MANAGEMENT
` +
           `   - View and edit your profile information
` +
           `   - Change your password securely
` +
           `   - View account statistics

` +
           `3. VIEWING BILLS
` +
           `   - Access Bills page from menu
` +
           `   - View bill details, dates, and amounts
` +
           `   - Download or print bills as PDF

` +
           `4. SHOPPING (CUSTOMERS)
` +
           `   - Browse items in Items page
` +
           `   - Click 'Buy' button to purchase
` +
           `   - Fill in purchase details and generate bill

` +
           `5. ITEM MANAGEMENT (ADMINS)
` +
           `   - Add, edit, and delete items
` +
           `   - Set prices and descriptions
` +
           `   - Manage inventory

` +
           `6. USER MANAGEMENT (ADMINS)
` +
           `   - Add new users
` +
           `   - Manage user roles and permissions
` +
           `   - View user statistics

` +
           `TROUBLESHOOTING
` +
           `---------------
` +
           `- If you can't login, check your credentials
` +
           `- For password reset, contact administrator
` +
           `- Bills not showing? Refresh the page
` +
           `- For technical issues, contact system admin

` +
           `CONTACT SUPPORT
` +
           `---------------
` +
           `For additional help, contact your system administrator.`;
  };

  const generateUserGuideHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Billing System - User Guide</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #6f42c1; border-bottom: 2px solid #6f42c1; }
            h2 { color: #495057; margin-top: 30px; }
            h3 { color: #6c757d; }
            .section { margin-bottom: 30px; }
            .step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #6f42c1; }
            .note { background: #e7f3ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>🏢 Billing System - User Guide</h1>
        
        <div class="section">
            <h2>📋 Getting Started</h2>
            <div class="step">
                <h3>1. Login Process</h3>
                <p>• Enter your username and password on the login page</p>
                <p>• Click 'Login' to access the system</p>
                <p>• You'll be redirected to the Dashboard</p>
            </div>
            
            <div class="step">
                <h3>2. Navigation</h3>
                <p>• Use the top navigation bar to access different sections</p>
                <p>• Dashboard: Overview and statistics</p>
                <p>• Bills: View and manage your bills</p>
                <p>• Items: Browse and purchase items</p>
                <p>• Profile: Manage your account</p>
                <p>• Help: Access this guide and documentation</p>
            </div>
        </div>
        
        <div class="section">
            <h2>👤 Profile Management</h2>
            <div class="step">
                <h3>Editing Your Profile</h3>
                <p>• Go to Profile page</p>
                <p>• Click 'Edit Profile' button</p>
                <p>• Update your full name, email, and phone</p>
                <p>• Click 'Save Changes'</p>
            </div>
            
            <div class="step">
                <h3>Changing Password</h3>
                <p>• Go to Profile page</p>
                <p>• Click 'Change Password' button</p>
                <p>• Enter current password and new password</p>
                <p>• Confirm new password and save</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🧾 Managing Bills</h2>
            <div class="step">
                <h3>Viewing Bills</h3>
                <p>• Navigate to Bills page</p>
                <p>• View list of all your bills</p>
                <p>• See bill dates, items, and amounts</p>
                <p>• Use search to find specific bills</p>
            </div>
            
            <div class="step">
                <h3>Bill Actions</h3>
                <p>• 👁️ View: See detailed bill information</p>
                <p>• 🖨️ Print: Print bill directly</p>
                <p>• 📥 Download: Save bill as PDF</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🛒 Shopping (For Customers)</h2>
            <div class="step">
                <h3>Purchasing Items</h3>
                <p>• Go to Items page</p>
                <p>• Browse available items</p>
                <p>• Click 'Buy' button on desired item</p>
                <p>• Enter quantity and customer details</p>
                <p>• Click 'Generate Bill' to complete purchase</p>
            </div>
        </div>
        
        <div class="note">
            <strong>💡 Tips:</strong>
            <ul>
                <li>Keep your profile information up to date</li>
                <li>Regularly check your bills for accuracy</li>
                <li>Download important bills for your records</li>
                <li>Contact administrator for any issues</li>
            </ul>
        </div>
    </body>
    </html>`;
  };

  const generateAdminGuideHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Billing System - Admin Guide</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #dc3545; border-bottom: 2px solid #dc3545; }
            h2 { color: #495057; margin-top: 30px; }
            h3 { color: #6c757d; }
            .section { margin-bottom: 30px; }
            .step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #dc3545; }
            .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #ffeaa7; }
        </style>
    </head>
    <body>
        <h1>🛡️ Billing System - Administrator Guide</h1>
        
        <div class="section">
            <h2>👥 User Management</h2>
            <div class="step">
                <h3>Adding New Users</h3>
                <p>• Navigate to Admin → Manage Users</p>
                <p>• Click 'Add New User' button</p>
                <p>• Fill in user details (username, email, etc.)</p>
                <p>• Assign appropriate role (USER/ADMIN)</p>
                <p>• Save the new user</p>
            </div>
            
            <div class="step">
                <h3>Managing Existing Users</h3>
                <p>• View all users in the user management page</p>
                <p>• Edit user information as needed</p>
                <p>• Change user roles and permissions</p>
                <p>• Deactivate or delete users if necessary</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📦 Item Management</h2>
            <div class="step">
                <h3>Adding Items</h3>
                <p>• Go to Items page</p>
                <p>• Click 'Add New Item' button</p>
                <p>• Enter item name, description, price, and category</p>
                <p>• Save the item</p>
            </div>
            
            <div class="step">
                <h3>Managing Items</h3>
                <p>• Edit existing items using the edit button</p>
                <p>• Update prices and descriptions as needed</p>
                <p>• Delete items that are no longer available</p>
                <p>• Use search to find specific items</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🧾 Bill Management</h2>
            <div class="step">
                <h3>Creating Bills</h3>
                <p>• Navigate to Bills page</p>
                <p>• Click 'Create New Bill' button</p>
                <p>• Select user and add items</p>
                <p>• Set quantities and prices</p>
                <p>• Generate the bill</p>
            </div>
            
            <div class="step">
                <h3>Managing Bills</h3>
                <p>• View all bills in the system</p>
                <p>• Search and filter bills</p>
                <p>• Delete bills if necessary</p>
                <p>• Generate reports and analytics</p>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Important Admin Notes:</strong>
            <ul>
                <li>Always backup data before making major changes</li>
                <li>Be careful when deleting users or bills</li>
                <li>Regularly monitor system usage and performance</li>
                <li>Keep user permissions up to date</li>
                <li>Review bills for accuracy before finalizing</li>
            </ul>
        </div>
    </body>
    </html>`;
  };

  const generateAPIDocsHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Billing System - API Documentation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #17a2b8; border-bottom: 2px solid #17a2b8; }
            h2 { color: #495057; margin-top: 30px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #17a2b8; }
            .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
            .get { background: #28a745; }
            .post { background: #007bff; }
            .put { background: #ffc107; color: black; }
            .delete { background: #dc3545; }
        </style>
    </head>
    <body>
        <h1>🔌 Billing System - API Documentation</h1>
        
        <h2>Authentication Endpoints</h2>
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/v1/auth/login</strong>
            <p>Authenticate user and create session</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/v1/auth/logout</strong>
            <p>Logout user and destroy session</p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/v1/auth/me</strong>
            <p>Get current user information</p>
        </div>
        
        <h2>Bill Endpoints</h2>
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/bills</strong>
            <p>Get all bills (filtered by user role)</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/bills</strong>
            <p>Create a new bill</p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/bills/{id}</strong>
            <p>Get specific bill by ID</p>
        </div>
        
        <div class="endpoint">
            <span class="method delete">DELETE</span> <strong>/api/bills/{id}</strong>
            <p>Delete a bill by ID</p>
        </div>
        
        <h2>Item Endpoints</h2>
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/v1/items</strong>
            <p>Get all items (paginated)</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/v1/items</strong>
            <p>Create a new item</p>
        </div>
        
        <div class="endpoint">
            <span class="method put">PUT</span> <strong>/api/v1/items/{id}</strong>
            <p>Update an existing item</p>
        </div>
        
        <div class="endpoint">
            <span class="method delete">DELETE</span> <strong>/api/v1/items/{id}</strong>
            <p>Delete an item</p>
        </div>
        
        <h2>User Endpoints</h2>
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/v1/users</strong>
            <p>Get all users (admin only)</p>
        </div>
        
        <div class="endpoint">
            <span class="method put">PUT</span> <strong>/api/users/{id}</strong>
            <p>Update user profile</p>
        </div>
        
        <p><strong>Note:</strong> For interactive API testing, try accessing <a href="/swagger-ui/index.html" target="_blank">/swagger-ui/index.html</a></p>
    </body>
    </html>`;
  };

  const generatePDFContent = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Billing System - Complete Help Guide</title>
        <style>
            @media print {
                body { margin: 0; }
                .page-break { page-break-before: always; }
            }
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6; 
                color: #333;
            }
            h1 { 
                color: #6f42c1; 
                border-bottom: 3px solid #6f42c1; 
                padding-bottom: 10px;
                text-align: center;
            }
            h2 { 
                color: #495057; 
                margin-top: 30px; 
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 5px;
            }
            h3 { color: #6c757d; }
            .section { margin-bottom: 30px; }
            .step { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 10px 0; 
                border-left: 4px solid #6f42c1;
                border-radius: 5px;
            }
            .note { 
                background: #e7f3ff; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 15px 0;
                border: 1px solid #bee5eb;
            }
            .warning { 
                background: #fff3cd; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 15px 0;
                border: 1px solid #ffeaa7;
            }
            .toc {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .toc ul {
                list-style-type: none;
                padding-left: 0;
            }
            .toc li {
                margin: 5px 0;
                padding: 5px 0;
            }
            .endpoint { 
                background: #f8f9fa; 
                padding: 10px; 
                margin: 5px 0; 
                border-left: 4px solid #17a2b8;
                font-family: monospace;
            }
            .method { 
                display: inline-block; 
                padding: 2px 6px; 
                border-radius: 3px; 
                color: white; 
                font-weight: bold;
                font-size: 12px;
            }
            .get { background: #28a745; }
            .post { background: #007bff; }
            .put { background: #ffc107; color: black; }
            .delete { background: #dc3545; }
        </style>
    </head>
    <body>
        <h1>📚 Billing System - Complete Help Guide</h1>
        
        <div class="toc">
            <h2>📋 Table of Contents</h2>
            <ul>
                <li>1. Getting Started</li>
                <li>2. User Guide</li>
                <li>3. Administrator Guide</li>
                <li>4. API Documentation</li>
                <li>5. Troubleshooting</li>
                <li>6. FAQ</li>
            </ul>
        </div>

        <div class="page-break"></div>
        
        <div class="section">
            <h2>🚀 1. Getting Started</h2>
            <div class="step">
                <h3>System Overview</h3>
                <p>The Billing System is a comprehensive web application designed to manage billing operations, user accounts, and administrative functions. It provides a secure and efficient way to create, manage, and track bills for various users.</p>
            </div>
            
            <div class="step">
                <h3>Login Process</h3>
                <p>• Navigate to the login page</p>
                <p>• Enter your username and password</p>
                <p>• Click 'Login' to access the system</p>
                <p>• You'll be redirected to the Dashboard</p>
            </div>
            
            <div class="step">
                <h3>Navigation</h3>
                <p>• <strong>Dashboard:</strong> Overview and statistics</p>
                <p>• <strong>Bills:</strong> View and manage your bills</p>
                <p>• <strong>Items:</strong> Browse and purchase items</p>
                <p>• <strong>Profile:</strong> Manage your account</p>
                <p>• <strong>Help:</strong> Access documentation</p>
            </div>
        </div>

        <div class="page-break"></div>
        
        <div class="section">
            <h2>👤 2. User Guide</h2>
            
            <h3>Profile Management</h3>
            <div class="step">
                <h4>Editing Your Profile</h4>
                <p>• Go to Profile page</p>
                <p>• Click 'Edit Profile' button</p>
                <p>• Update your full name, email, and phone</p>
                <p>• Click 'Save Changes'</p>
            </div>
            
            <div class="step">
                <h4>Changing Password</h4>
                <p>• Go to Profile page</p>
                <p>• Click 'Change Password' button</p>
                <p>• Enter current password and new password</p>
                <p>• Confirm new password and save</p>
            </div>
            
            <h3>Managing Bills</h3>
            <div class="step">
                <h4>Viewing Bills</h4>
                <p>• Navigate to Bills page</p>
                <p>• View list of all your bills</p>
                <p>• See bill dates, items, and amounts</p>
                <p>• Use search to find specific bills</p>
            </div>
            
            <div class="step">
                <h4>Bill Actions</h4>
                <p>• 👁️ <strong>View:</strong> See detailed bill information</p>
                <p>• 🖨️ <strong>Print:</strong> Print bill directly</p>
                <p>• 📥 <strong>Download:</strong> Save bill as PDF</p>
            </div>
            
            <h3>Shopping (For Customers)</h3>
            <div class="step">
                <h4>Purchasing Items</h4>
                <p>• Go to Items page</p>
                <p>• Browse available items</p>
                <p>• Click 'Buy' button on desired item</p>
                <p>• Enter quantity and customer details</p>
                <p>• Click 'Generate Bill' to complete purchase</p>
            </div>
        </div>

        <div class="page-break"></div>
        
        <div class="section">
            <h2>🛡️ 3. Administrator Guide</h2>
            
            <h3>User Management</h3>
            <div class="step">
                <h4>Adding New Users</h4>
                <p>• Navigate to Admin → Manage Users</p>
                <p>• Click 'Add New User' button</p>
                <p>• Fill in user details (username, email, etc.)</p>
                <p>• Assign appropriate role (USER/ADMIN)</p>
                <p>• Save the new user</p>
            </div>
            
            <div class="step">
                <h4>Managing Existing Users</h4>
                <p>• View all users in the user management page</p>
                <p>• Edit user information as needed</p>
                <p>• Change user roles and permissions</p>
                <p>• Deactivate or delete users if necessary</p>
            </div>
            
            <h3>Item Management</h3>
            <div class="step">
                <h4>Adding Items</h4>
                <p>• Go to Items page</p>
                <p>• Click 'Add New Item' button</p>
                <p>• Enter item name, description, price, and category</p>
                <p>• Save the item</p>
            </div>
            
            <div class="step">
                <h4>Managing Items</h4>
                <p>• Edit existing items using the edit button</p>
                <p>• Update prices and descriptions as needed</p>
                <p>• Delete items that are no longer available</p>
                <p>• Use search to find specific items</p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Admin Notes:</strong>
                <ul>
                    <li>Always backup data before making major changes</li>
                    <li>Be careful when deleting users or bills</li>
                    <li>Regularly monitor system usage and performance</li>
                    <li>Keep user permissions up to date</li>
                    <li>Review bills for accuracy before finalizing</li>
                </ul>
            </div>
        </div>

        <div class="page-break"></div>
        
        <div class="section">
            <h2>🔌 4. API Documentation</h2>
            
            <h3>Authentication Endpoints</h3>
            <div class="endpoint">
                <span class="method post">POST</span> <strong>/api/v1/auth/login</strong>
                <p>Authenticate user and create session</p>
            </div>
            
            <div class="endpoint">
                <span class="method post">POST</span> <strong>/api/v1/auth/logout</strong>
                <p>Logout user and destroy session</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span> <strong>/api/v1/auth/me</strong>
                <p>Get current user information</p>
            </div>
            
            <h3>Bill Endpoints</h3>
            <div class="endpoint">
                <span class="method get">GET</span> <strong>/api/bills</strong>
                <p>Get all bills (filtered by user role)</p>
            </div>
            
            <div class="endpoint">
                <span class="method post">POST</span> <strong>/api/bills</strong>
                <p>Create a new bill</p>
            </div>
            
            <h3>Item Endpoints</h3>
            <div class="endpoint">
                <span class="method get">GET</span> <strong>/api/v1/items</strong>
                <p>Get all items (paginated)</p>
            </div>
            
            <div class="endpoint">
                <span class="method post">POST</span> <strong>/api/v1/items</strong>
                <p>Create a new item</p>
            </div>
        </div>

        <div class="page-break"></div>
        
        <div class="section">
            <h2>🔧 5. Troubleshooting</h2>
            
            <div class="step">
                <h3>Common Issues</h3>
                <p><strong>Can't login:</strong> Check your credentials and ensure caps lock is off</p>
                <p><strong>Bills not showing:</strong> Refresh the page or check your internet connection</p>
                <p><strong>PDF not downloading:</strong> Check browser popup blockers</p>
                <p><strong>Items not loading:</strong> Clear browser cache and refresh</p>
            </div>
            
            <div class="step">
                <h3>Password Issues</h3>
                <p><strong>Forgot password:</strong> Contact your system administrator</p>
                <p><strong>Password won't change:</strong> Ensure new password meets requirements</p>
                <p><strong>Account locked:</strong> Contact administrator for unlock</p>
            </div>
        </div>
        
        <div class="section">
            <h2>❓ 6. Frequently Asked Questions</h2>
            
            <div class="step">
                <h3>Q: How do I change my password?</h3>
                <p>A: Go to your Profile page and click "Change Password". You'll need your current password and must enter a new password twice for confirmation.</p>
            </div>
            
            <div class="step">
                <h3>Q: Can I edit my profile information?</h3>
                <p>A: Yes, you can edit your full name, email, and phone number. Your User ID and username cannot be changed for security reasons.</p>
            </div>
            
            <div class="step">
                <h3>Q: How do I view my bills?</h3>
                <p>A: Navigate to the Bills page from the main menu. You'll see all bills associated with your account with options to view, print, or download.</p>
            </div>
        </div>
        
        <div class="note">
            <h3>📞 Need More Help?</h3>
            <p>For technical support or questions about the system, please contact your system administrator.</p>
            <p><strong>Remember:</strong> Keep your login credentials secure and log out when finished using the system.</p>
        </div>
    </body>
    </html>`;
  };

  return (
    <div className="pt-5">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="text-white fw-bold mb-3" style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                <FaQuestionCircle className="me-3" />
                Help & Documentation
              </h1>
              <p className="text-white-50">Comprehensive guides and resources for the Billing System</p>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5" id="user-guide-section">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">
                  <FaCog className="me-3" style={{ color: '#667eea' }} />
                  Quick Actions
                </h3>
                <Row>
                  <Col lg={3} md={6} className="mb-3">
                    <Button 
                      className="btn-custom w-100 py-4 d-flex flex-column align-items-center"
                      onClick={openUserGuide}
                    >
                      <FaUser size={30} className="mb-3" />
                      <span className="fw-semibold">User Guide</span>
                      <small className="text-white-50">Complete user manual</small>
                    </Button>
                  </Col>

                  {isAdmin() && (
                    <Col lg={3} md={6} className="mb-3">
                      <Button 
                        className="btn-custom w-100 py-4 d-flex flex-column align-items-center"
                        onClick={openAdminGuide}
                        id="admin-guide-section"
                      >
                        <FaUserShield size={30} className="mb-3" />
                        <span className="fw-semibold">Admin Guide</span>
                        <small className="text-white-50 mt-1">Administrative functions</small>
                      </Button>
                    </Col>
                  )}

                  <Col lg={3} md={6} className="mb-3">
                    <Button 
                      className="btn-custom-secondary w-100 py-4 d-flex flex-column align-items-center"
                      onClick={handleDownloadHelpPDF}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <div className="spinner-border spinner-border-sm text-white mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span className="fw-semibold">Downloading...</span>
                        </>
                      ) : (
                        <>
                      <FaDownload size={30} className="mb-3" />
                      <span className="fw-semibold">Download PDF</span>
                          <small className="text-white-50">Offline help guide</small>
                        </>
                      )}
                    </Button>
                  </Col>

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Documentation Overview */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">
                  <FaBook className="me-3" style={{ color: '#667eea' }} />
                  Documentation Overview
                </h3>
                <Row>
                  <Col lg={4} md={6} className="mb-4">
                    <div className="text-center p-4 bg-light rounded h-100">
                      <FaUser size={48} className="text-primary mb-3" />
                      <h5>User Guide</h5>
                      <p className="text-muted mb-3">
                        Comprehensive guide covering all user functions including profile management, 
                        bill viewing, and basic system navigation.
                      </p>
                      <div className="d-flex flex-column gap-2">
                        <Button variant="outline-primary" size="sm" onClick={openUserGuide}>
                          <FaEye className="me-2" />
                          View Online
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={handleDownloadHelpPDF}>
                          <FaDownload className="me-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </Col>

                  {isAdmin() && (
                    <Col lg={4} md={6} className="mb-4">
                      <div className="text-center p-4 bg-light rounded h-100">
                        <FaUserShield size={48} className="text-danger mb-3" />
                        <h5>Admin Guide</h5>
                        <p className="text-muted mb-3">
                          Administrative functions guide covering user management, system configuration, 
                          and advanced billing operations.
                        </p>
                        <div className="d-flex flex-column gap-2">
                          <Button variant="outline-danger" size="sm" onClick={openAdminGuide}>
                            <FaEye className="me-2" />
                            View Online
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={handleDownloadHelpPDF}>
                            <FaDownload className="me-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </Col>
                  )}

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        {/* Help Categories */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">Help Categories</h3>
                <Row>
                  <Col lg={4} md={6} className="mb-4">
                    <div className="text-center p-4 bg-light rounded">
                      <FaUser size={48} className="text-primary mb-3" />
                      <h5>User Management</h5>
                      <p className="text-muted">Learn how to manage your profile, change passwords, and view your bills.</p>
                      <Button variant="outline-primary" size="sm" onClick={openUserGuide}>
                        <FaEye className="me-2" />
                        Learn More
                      </Button>
                    </div>
                  </Col>

                  <Col lg={4} md={6} className="mb-4">
                    <div className="text-center p-4 bg-light rounded">
                      <FaFileAlt size={48} className="text-success mb-3" />
                      <h5>Billing Operations</h5>
                      <p className="text-muted">Understand how to create, view, and manage bills in the system.</p>
                      <Button variant="outline-success" size="sm" onClick={openUserGuide}>
                        <FaEye className="me-2" />
                        Learn More
                      </Button>
                    </div>
                  </Col>

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* System Overview */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">System Overview</h3>
                <Row>
                  <Col md={6}>
                    <h5>What is the Billing System?</h5>
                    <p className="text-muted">
                      The Billing System is a comprehensive web application designed to manage billing operations, 
                      user accounts, and administrative functions. It provides a secure and efficient way to create, 
                      manage, and track bills for various users.
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        {/* FAQ Section */}
        <Row className="mb-5">
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">Frequently Asked Questions</h3>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>How do I change my password?</Accordion.Header>
                    <Accordion.Body>
                      Go to your Profile page and click on "Change Password". You'll need to provide your current password 
                      and enter a new password twice for confirmation. The new password must be at least 6 characters long.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Can I edit my profile information?</Accordion.Header>
                    <Accordion.Body>
                      Yes, you can edit your full name, email, and phone number. However, your User ID and username 
                      cannot be changed for security reasons. Click "Edit Profile" on your Profile page to make changes.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>How do I view my bills?</Accordion.Header>
                    <Accordion.Body>
                      Navigate to the Bills page from the main menu. You'll see all bills associated with your account. 
                      You can view details, print, or download PDF versions using the action buttons.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="3">
                    <Accordion.Header>What if I forget my password?</Accordion.Header>
                    <Accordion.Body>
                      If you forget your password, please contact your system administrator. They can reset your password 
                      or help you regain access to your account.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="4">
                    <Accordion.Header>How do I download help documentation?</Accordion.Header>
                    <Accordion.Body>
                      You can download the complete help guide as a PDF by clicking the "Download PDF" button in the Quick Actions section. 
                      This provides offline access to all system documentation.
                    </Accordion.Body>
                  </Accordion.Item>

                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Support Information */}
        <Row>
          <Col>
            <Card className="card-custom border-0">
              <Card.Body className="p-4">
                <h3 className="text-dark fw-bold mb-4">Need More Help?</h3>
                <Row>
                  <Col md={6}>
                    <h5>Contact Information</h5>
                    <p className="text-muted">
                      For technical support or questions about the system, please contact your system administrator.
                    </p>
                    <div className="d-flex align-items-center mb-2">
                      <FaUserShield className="me-2 text-primary" />
                      <span>System Administrator</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaFilePdf className="me-2 text-danger" />
                      <span>Download Help Guides</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h5>Additional Resources</h5>
                    <ul className="text-muted">
                      <li><strong>User Guide:</strong> Complete user manual with step-by-step instructions</li>
                      <li><strong>Admin Guide:</strong> Administrative functions and system management</li>
                      <li><strong>PDF Downloads:</strong> Offline access to all documentation</li>
                      <li><strong>FAQ Section:</strong> Quick answers to common questions</li>
                    </ul>
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

export default Help;
