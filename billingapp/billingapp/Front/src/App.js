import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Bills from './pages/Bills';
import Items from './pages/Items';
import Help from './pages/Help';
import AdminSetup from './pages/AdminSetup';
import UserManagement from './pages/admin/UserManagement';
import AddUser from './pages/admin/AddUser';
import UserBills from './pages/admin/UserBills';
import AdminProfile from './pages/admin/AdminProfile';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && (!user || user.role !== 'ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-white">Loading Billing System...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/setup" element={<AdminSetup />} />
        
        <Route path="/dashboard" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/bills" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute>
                <Bills />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/items" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/profile" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/help" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/admin/dashboard" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute adminOnly={true}>
                <Dashboard />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/admin/users" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/admin/users/add" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute adminOnly={true}>
                <AddUser />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/admin/users/:userId/bills" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute adminOnly={true}>
                <UserBills />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/admin/profile" element={
          <>
            <Navbar />
            <main className="main-content">
              <ProtectedRoute adminOnly={true}>
                <AdminProfile />
              </ProtectedRoute>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
