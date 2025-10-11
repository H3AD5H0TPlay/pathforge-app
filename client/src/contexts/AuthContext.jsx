import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authLogger, routeLogger, performanceLogger } from '../utils/logger';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth utility functions
export const authUtils = {
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authUtils.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic JWT decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }
};

// Configure axios defaults and interceptors
const configureAxios = (token, logoutFn) => {
  // Set default base URL (use environment variable for production)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  axios.defaults.baseURL = `${apiUrl}/api`;
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Add request interceptor to include token
  axios.interceptors.request.use(
    (config) => {
      const currentToken = authUtils.getToken();
      if (currentToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle 401 errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token is invalid or expired
        authUtils.removeToken();
        if (logoutFn) {
          logoutFn();
        }
      }
      return Promise.reject(error);
    }
  );
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(() => authUtils.getToken());

  // Logout function (defined early so it can be used in configureAxios)
  const logout = () => {
    // Log logout process
    authLogger.logoutStart();
    authLogger.logoutStorage();
    
    authUtils.removeToken();
    setTokenState(null);
    setUser(null);
    configureAxios(null, null);
    
    // Log logout completion
    authLogger.logoutStateCleared();
    authLogger.logoutRedirect();
  };

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Log session check start
        authLogger.sessionCheckStart();
        authLogger.sessionTokenCheck();
        
        const storedToken = authUtils.getToken();
        if (storedToken) {
          authLogger.sessionTokenFound(storedToken.length);
          
          if (authUtils.isAuthenticated()) {
            setTokenState(storedToken);
            configureAxios(storedToken, logout);
            
            // For now, we'll just set a basic user object
            const userData = { authenticated: true };
            setUser(userData);
            
            authLogger.sessionRestoreSuccess(userData);
          } else {
            // Token exists but is expired/invalid
            authLogger.sessionRestoreError(new Error('Token expired or invalid'));
            authUtils.removeToken();
            configureAxios(null, logout);
          }
        } else {
          authLogger.sessionTokenMissing();
          configureAxios(null, logout);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authLogger.sessionRestoreError(error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      // Log login start
      authLogger.loginStart(email);
      authLogger.loginApiCall(email);
      
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data.data;
      
      // Store token and configure axios
      authUtils.setToken(newToken);
      setTokenState(newToken);
      configureAxios(newToken, logout);
      setUser(userData);

      // Log successful login
      const responseTime = performance.now() - startTime;
      authLogger.loginSuccess(email, userData, newToken);
      performanceLogger.apiResponseTime('/auth/login', 'POST', responseTime);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Log login error
      authLogger.loginError(error, email);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      // Log registration start
      authLogger.registrationStart(email);
      authLogger.registrationApiCall(email);
      
      const response = await axios.post('/auth/register', {
        name,
        email,
        password
      });

      const { token: newToken, user: userData } = response.data.data;
      
      // Store token and configure axios
      authUtils.setToken(newToken);
      setTokenState(newToken);
      configureAxios(newToken, logout);
      setUser(userData);

      // Log successful registration
      const responseTime = performance.now() - startTime;
      authLogger.registrationSuccess(email, response);
      performanceLogger.apiResponseTime('/auth/register', 'POST', responseTime);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Log registration error
      authLogger.registrationError(error, email);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;