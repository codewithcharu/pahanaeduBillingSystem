import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true; // use cookie-based session

  // Remove bearer token logic; backend uses session cookie
  axios.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle authentication errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Only handle session expiration for authenticated users, not login failures
        if (isAuthenticated && !error.config?.url?.includes('/login')) {
          logout();
          toast.error('Session expired. Please login again.');
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get('/api/v1/auth/me');
      if (data) {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (_error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    
    try {
      console.log('Attempting login for:', username);
      
      // Attempt to authenticate (expects UserDto returned and session cookie set)
      const response = await axios.post('/api/v1/auth/login', {
        username,
        password
      });

      console.log('Login response:', response);

      if (response?.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        setLoading(false);
        return { success: true };
      }

      // If no data returned, return error
      setLoading(false);
      console.log('No data in response, returning error');
      return { success: false, error: 'Incorrect username or password' };
    } catch (error) {
      console.error('Login error caught:', error);
      console.error('Error response:', error.response);
      setLoading(false);
      
      // Return specific error for login failures
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('401/403 error, returning auth error');
        return { success: false, error: 'Incorrect username or password' };
      } else if (error.code === 'ERR_NETWORK') {
        console.log('Network error');
        return { success: false, error: 'Cannot connect to server. Please check if the backend is running.' };
      } else {
        console.log('Other error, returning auth error');
        return { success: false, error: 'Incorrect username or password' };
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (error) {
      // ignore network/logout errors
      // console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      const response = await axios.put(`/api/users/${user.id}`, {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone
      });
      console.log('Profile update response:', response.data);
      
      if (response.data?.success && response.data?.user) {
        // Update user with the returned user data
        const updatedUser = {
          ...user,
          ...response.data.user
        };
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.data?.message || 'Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Invalid profile data provided');
      } else {
        toast.error('Failed to update profile');
      }
      return false;
    }
  };

  const requestPasswordChangeOtp = async (currentPassword) => {
    try {
      console.log('Requesting password change OTP...');
      const response = await axios.post('/api/profile/change-password/request', {
        currentPassword: currentPassword
      });
      console.log('OTP request response:', response.data);
      
      toast.success(`OTP sent to your email: ${user?.email}`);
      return { success: true, message: response.data };
    } catch (error) {
      console.error('OTP request error:', error);
      
      if (error.response?.data) {
        toast.error(error.response.data);
        return { success: false, message: error.response.data };
      } else {
        toast.error('Failed to send OTP. Please try again.');
        return { success: false, message: 'Failed to send OTP' };
      }
    }
  };

  const verifyOtpAndChangePassword = async (passwordData) => {
    try {
      console.log('Verifying OTP and changing password...');
      const response = await axios.post('/api/profile/change-password/verify', {
        currentPassword: passwordData.currentPassword,
        otp: passwordData.otp,
        newPassword: passwordData.newPassword
      });
      console.log('Password change response:', response.data);
      
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.response?.data) {
        toast.error(error.response.data);
      } else {
        toast.error('Failed to change password. Please try again.');
      }
      return false;
    }
  };

  const isAdmin = () => {
    return user && user.role === 'ADMIN';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    requestPasswordChangeOtp,
    verifyOtpAndChangePassword,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
