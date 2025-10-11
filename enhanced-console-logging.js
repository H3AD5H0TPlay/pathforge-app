// 🔧 PathForge Enhanced Console Logging
// Add this to your React app for detailed debugging during manual testing

// 🎨 Console Styling
const styles = {
  auth: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;',
  api: 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px;',
  error: 'background: #F44336; color: white; padding: 2px 6px; border-radius: 3px;',
  warning: 'background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px;',
  success: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;',
  info: 'background: #607D8B; color: white; padding: 2px 6px; border-radius: 3px;',
  security: 'background: #E91E63; color: white; padding: 2px 6px; border-radius: 3px;',
  performance: 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px;'
};

// 🔐 Authentication Logging
export const authLogger = {
  // Registration
  registrationStart: (email) => {
    console.log('%c🔐 REGISTRATION', styles.auth, 'Form validation started for:', email);
  },
  registrationSuccess: (email) => {
    console.log('%c✅ USER CREATED', styles.success, email);
    console.log('%c💾 DATABASE', styles.info, 'User saved with hashed password');
  },
  registrationError: (error) => {
    console.error('%c❌ REGISTRATION FAILED', styles.error, error.message);
  },
  duplicateEmail: (email) => {
    console.error('%c🚫 DUPLICATE EMAIL', styles.error, 'Email already exists:', email);
  },

  // Login
  loginStart: (email) => {
    console.log('%c🔐 LOGIN', styles.auth, 'Authentication attempt for:', email);
  },
  loginSuccess: (email, token) => {
    console.log('%c✅ LOGIN SUCCESS', styles.success, email);
    console.log('%c🎫 JWT TOKEN', styles.info, 'Received and validated');
    console.log('%c💾 STORAGE', styles.info, 'Token saved to localStorage');
    console.log('%c👤 USER DATA', styles.info, 'Profile loaded');
    console.log('%c🔄 REDIRECT', styles.info, '/dashboard');
  },
  loginError: (error) => {
    console.error('%c❌ LOGIN FAILED', styles.error, 'Invalid credentials');
    console.log('%c🔒 SECURITY', styles.security, 'Generic error message shown');
  },

  // Logout
  logoutStart: () => {
    console.log('%c🚪 LOGOUT', styles.auth, 'User initiated logout');
  },
  logoutComplete: () => {
    console.log('%c🗑️ STORAGE', styles.info, 'Token removed from localStorage');
    console.log('%c🔄 STATE', styles.info, 'User authentication cleared');
    console.log('%c🔄 REDIRECT', styles.info, '/login');
  },

  // Session Persistence
  sessionRestore: () => {
    console.log('%c🔄 PAGE REFRESH', styles.info, 'Application reloading');
    console.log('%c💾 STORAGE', styles.info, 'Checking for existing token');
  },
  sessionFound: () => {
    console.log('%c🎫 JWT TOKEN', styles.success, 'Found in localStorage');
    console.log('%c🔐 AUTH', styles.auth, 'Auto-authentication with stored token');
    console.log('%c✅ SESSION', styles.success, 'Persisted successfully');
  },

  // Route Protection
  routeGuard: (route) => {
    console.log('%c🔒 ROUTE GUARD', styles.security, 'Protected route accessed:', route);
  },
  accessDenied: () => {
    console.log('%c🚫 ACCESS DENIED', styles.error, 'Unauthorized user');
    console.log('%c🔄 REDIRECT', styles.info, '/login');
  }
};

// 💼 Job Management Logging
export const jobLogger = {
  // Create Job
  formValidation: (isValid, errors) => {
    if (isValid) {
      console.log('%c💼 JOB FORM', styles.success, 'Validation passed');
    } else {
      console.warn('%c📝 FORM VALIDATION', styles.warning, 'Errors:', errors);
    }
  },
  createStart: (jobData) => {
    console.log('%c💼 CREATE JOB', styles.info, 'Submitting:', jobData.title);
  },
  createSuccess: (job) => {
    console.log('%c✅ JOB CREATED', styles.success, `ID ${job.id} - ${job.title}`);
    console.log('%c🎯 UI UPDATE', styles.info, `Job card added to ${job.status} column`);
    console.log('%c💾 DATABASE', styles.info, 'Job linked to user ID');
  },
  createError: (error) => {
    console.error('%c❌ JOB CREATION FAILED', styles.error, error.message);
  },

  // Load Jobs
  loadStart: () => {
    console.log('%c📋 LOADING JOBS', styles.info, 'Fetching user jobs...');
  },
  loadSuccess: (jobs) => {
    console.log('%c📊 JOBS LOADED', styles.success, `${jobs.length} jobs retrieved`);
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`%c🗂️ ${status.toUpperCase()} COLUMN`, styles.info, `${count} jobs`);
    });
  },
  loadPerformance: (loadTime) => {
    console.log('%c⚡ PERFORMANCE', styles.performance, `Board loaded in ${loadTime}ms`);
  },

  // Update Job (Drag & Drop)
  dragStart: (jobId) => {
    console.log('%c🖱️ DRAG START', styles.info, `Job ID ${jobId} selected`);
  },
  dragOver: (column) => {
    console.log('%c🎯 DRAG OVER', styles.info, `${column} column targeted`);
  },
  dropSuccess: (jobId, oldStatus, newStatus) => {
    console.log('%c📤 DROP', styles.success, `Job moved to ${newStatus} column`);
    console.log('%c✅ STATUS UPDATE', styles.success, `${oldStatus} → ${newStatus}`);
    console.log('%c🎨 UI UPDATE', styles.info, 'Job card moved visually');
  },

  // Delete Job
  deleteStart: (jobId) => {
    console.log('%c🗑️ DELETE', styles.warning, `Job ID ${jobId} deletion requested`);
  },
  deleteConfirm: () => {
    console.log('%c⚠️ CONFIRM', styles.warning, 'User confirmed deletion');
  },
  deleteSuccess: (jobId) => {
    console.log('%c✅ DELETED', styles.success, 'Job permanently removed');
    console.log('%c🎨 UI UPDATE', styles.info, 'Job card removed from board');
    console.log('%c📊 COUNT', styles.info, 'Job count decreased by 1');
  }
};

// 🌐 API Logging
export const apiLogger = {
  request: (method, url, status) => {
    const statusColor = status >= 200 && status < 300 ? styles.success : styles.error;
    console.log('%c🌐 API', styles.api, `${method} ${url} - Status: ${status}`);
  },
  error: (method, url, error) => {
    console.error('%c🚫 API ERROR', styles.error, `${method} ${url} - ${error.message}`);
  },
  timeout: (method, url) => {
    console.error('%c⏰ API TIMEOUT', styles.error, `${method} ${url} - Request timeout`);
  }
};

// 🛡️ Security Logging
export const securityLogger = {
  unauthorizedAccess: (endpoint) => {
    console.error('%c🚫 UNAUTHORIZED', styles.security, `Access denied to ${endpoint}`);
    console.log('%c🔒 SECURITY', styles.security, 'Access token missing or invalid');
  },
  xssAttempt: (field, content) => {
    console.warn('%c🛡️ XSS PROTECTION', styles.security, `HTML detected in ${field}:`, content);
    console.log('%c🔒 INPUT SANITIZATION', styles.security, 'Content will be rendered as text');
  },
  crossUserAttempt: (action, resourceId) => {
    console.error('%c🚫 SECURITY VIOLATION', styles.security, `Cross-user ${action} attempt on resource ${resourceId}`);
    console.log('%c🛡️ PROTECTION', styles.security, 'Unauthorized access blocked');
  },
  tokenExpired: () => {
    console.warn('%c⏰ TOKEN EXPIRED', styles.warning, 'JWT token has expired');
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to login');
  }
};

// 🚨 Error Handling Logging
export const errorLogger = {
  networkError: (error) => {
    console.error('%c🔥 NETWORK ERROR', styles.error, 'Failed to fetch:', error.message);
    console.log('%c⚠️ ERROR HANDLER', styles.warning, 'Server unreachable');
    console.log('%c🎨 UI UPDATE', styles.info, 'Error message displayed');
  },
  emptyState: (resourceType) => {
    console.log('%c📭 EMPTY STATE', styles.info, `No ${resourceType} found`);
    console.log('%c🎨 UI', styles.info, 'Empty state component rendered');
    console.log('%c🎯 CTA', styles.info, 'Call-to-action button visible');
  },
  formValidation: (field, rule) => {
    console.warn('%c📝 FORM VALIDATION', styles.warning, `${field}: ${rule}`);
  },
  genericError: (context, error) => {
    console.error('%c❌ ERROR', styles.error, `${context}:`, error);
  }
};

// 📱 Responsive Logging
export const responsiveLogger = {
  viewportChange: (width, height, device) => {
    console.log('%c📱 VIEWPORT', styles.info, `${device} (${width}x${height})`);
  },
  breakpoint: (breakpoint) => {
    console.log('%c🎨 CSS', styles.info, `${breakpoint} styles applied`);
  },
  touchEnabled: () => {
    console.log('%c🎯 TOUCH', styles.info, 'Touch-friendly interface enabled');
  }
};

// 🔧 Performance Logging
export const performanceLogger = {
  pageLoad: (loadTime) => {
    console.log('%c⚡ PERFORMANCE', styles.performance, `Page loaded in ${loadTime}ms`);
  },
  apiResponse: (endpoint, responseTime) => {
    console.log('%c⚡ API PERFORMANCE', styles.performance, `${endpoint} responded in ${responseTime}ms`);
  },
  renderTime: (component, renderTime) => {
    console.log('%c⚡ RENDER PERFORMANCE', styles.performance, `${component} rendered in ${renderTime}ms`);
  }
};

// 🎯 Usage Examples:

// In your React components, use like this:

/*
// Registration Component
const handleRegister = async (formData) => {
  authLogger.registrationStart(formData.email);
  
  try {
    const response = await api.post('/auth/register', formData);
    apiLogger.request('POST', '/auth/register', response.status);
    authLogger.registrationSuccess(formData.email);
  } catch (error) {
    if (error.response?.status === 409) {
      authLogger.duplicateEmail(formData.email);
    } else {
      authLogger.registrationError(error);
    }
    apiLogger.error('POST', '/auth/register', error);
  }
};

// Job Creation Component
const handleCreateJob = async (jobData) => {
  jobLogger.formValidation(isValid, validationErrors);
  
  if (isValid) {
    jobLogger.createStart(jobData);
    
    try {
      const response = await api.post('/jobs', jobData);
      apiLogger.request('POST', '/jobs', response.status);
      jobLogger.createSuccess(response.data);
    } catch (error) {
      jobLogger.createError(error);
      apiLogger.error('POST', '/jobs', error);
    }
  }
};

// Drag & Drop Handler
const handleDragDrop = async (jobId, newStatus) => {
  jobLogger.dragStart(jobId);
  
  try {
    const response = await api.patch(`/jobs/${jobId}`, { status: newStatus });
    jobLogger.dropSuccess(jobId, oldStatus, newStatus);
  } catch (error) {
    errorLogger.genericError('Drag & Drop', error);
  }
};
*/

// 📊 Global Error Handler
window.addEventListener('error', (event) => {
  console.error('%c💥 GLOBAL ERROR', styles.error, event.error);
  console.log('%c📍 LOCATION', styles.info, `${event.filename}:${event.lineno}:${event.colno}`);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('%c💥 UNHANDLED PROMISE REJECTION', styles.error, event.reason);
});

// 🎮 Console Commands for Manual Testing
console.log('%c🎮 MANUAL TESTING COMMANDS', 'background: #333; color: #00ff00; padding: 10px; font-size: 14px;');
console.log('%cType these commands in console for testing:', 'color: #666;');
console.log('%c- checkAuth()', 'color: #0066cc;', '// Check authentication status');
console.log('%c- clearStorage()', 'color: #0066cc;', '// Clear localStorage');
console.log('%c- simulateError()', 'color: #0066cc;', '// Simulate network error');
console.log('%c- showJobs()', 'color: #0066cc;', '// Display current jobs');

// Helper functions for manual testing
window.checkAuth = () => {
  const token = localStorage.getItem('token');
  console.log('%c🔍 AUTH STATUS', styles.info, token ? 'Authenticated' : 'Not authenticated');
  if (token) {
    console.log('%c🎫 TOKEN', styles.info, token.substring(0, 50) + '...');
  }
};

window.clearStorage = () => {
  localStorage.clear();
  console.log('%c🗑️ STORAGE CLEARED', styles.warning, 'All localStorage data removed');
};

window.simulateError = () => {
  errorLogger.networkError(new Error('Simulated network failure'));
};

export default {
  authLogger,
  jobLogger,
  apiLogger,
  securityLogger,
  errorLogger,
  responsiveLogger,
  performanceLogger
};