import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authLogger, performanceLogger, errorLogger } from '../utils/logger';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Log page load
  useEffect(() => {
    const startTime = performance.now();
    performanceLogger.pageLoadStart('Register');
    
    return () => {
      const loadTime = performance.now() - startTime;
      performanceLogger.pageLoadComplete('Register', loadTime);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation with logging
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      errorLogger.formValidationError('name', 'required', formData.name);
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      errorLogger.formValidationError('name', 'minLength', formData.name);
    }

    // Email validation with logging
    if (!formData.email) {
      newErrors.email = 'Email is required';
      errorLogger.formValidationError('email', 'required', formData.email);
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      errorLogger.formValidationError('email', 'format', formData.email);
    }

    // Password validation with logging
    if (!formData.password) {
      newErrors.password = 'Password is required';
      errorLogger.formValidationError('password', 'required', formData.password);
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      errorLogger.formValidationError('password', 'minLength', formData.password);
    }

    // Confirm password validation with logging
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      errorLogger.formValidationError('confirmPassword', 'required', formData.confirmPassword);
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      errorLogger.formValidationError('confirmPassword', 'match', 'passwords do not match');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Log registration start
    authLogger.registrationStart(formData.email);
    
    // Validate form
    const formErrors = validateForm();
    
    // Log validation result
    authLogger.registrationValidation(
      Object.keys(formErrors).length === 0, 
      formErrors
    );
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    const result = await register(
      formData.name.trim(),
      formData.email,
      formData.password
    );
    
    if (result.success) {
      // Redirect to dashboard after successful registration
      navigate('/', { replace: true });
    } else {
      setErrors({ submit: result.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>PathForge</h1>
          <h2>Create Account</h2>
          <p>Start tracking your job applications today!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;