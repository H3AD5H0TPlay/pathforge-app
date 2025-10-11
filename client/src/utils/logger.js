// 🔧 PathForge Enhanced Console Logging System
// Comprehensive logging for manual UI testing validation

// 🎨 Console Styling
const styles = {
  auth: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  api: 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  error: 'background: #F44336; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  warning: 'background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  success: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  info: 'background: #607D8B; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  security: 'background: #E91E63; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  performance: 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  ui: 'background: #00BCD4; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
};

// 🔐 Authentication Logging
const authLogger = {
  // Registration Logging
  registrationStart: (email) => {
    console.log('%c🔐 REGISTRATION', styles.auth, 'Form validation started');
    console.log('   📧 Email:', email);
    console.log('   ⏰ Timestamp:', new Date().toISOString());
  },
  
  registrationValidation: (isValid, errors = {}) => {
    if (isValid) {
      console.log('%c📝 FORM VALIDATION', styles.success, 'All fields valid - ready to submit');
    } else {
      console.warn('%c📝 FORM VALIDATION', styles.warning, 'Validation errors found:');
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`     ❌ ${field}: ${error}`);
      });
      console.log('%c🔒 FORM', styles.info, 'Submission prevented by client-side validation');
    }
  },

  registrationApiCall: (email) => {
    console.log('%c🌐 API', styles.api, 'POST /api/auth/register - Sending request...');
    console.log('   📧 Email:', email);
    console.log('   🔒 Password: [ENCRYPTED]');
  },

  registrationSuccess: (email, response) => {
    console.log('%c✅ USER CREATED', styles.success, 'Registration successful!');
    console.log('   📧 Email:', email);
    console.log('   📊 Status:', response.status);
    console.log('%c💾 DATABASE', styles.info, 'User saved with hashed password');
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to login page...');
  },

  registrationError: (error, email) => {
    console.error('%c❌ REGISTRATION FAILED', styles.error, error.message);
    if (error.response?.status === 409) {
      console.error('%c🚫 DUPLICATE EMAIL', styles.error, 'Email already exists:', email);
      console.log('%c🔄 FORM', styles.info, 'Stays on registration page');
    } else {
      console.error('   📊 Status:', error.response?.status || 'Network Error');
      console.error('   📝 Details:', error.response?.data || error.message);
    }
  },

  // Login Logging  
  loginStart: (email) => {
    console.log('%c🔐 LOGIN', styles.auth, 'Credentials validation started');
    console.log('   📧 Email:', email);
    console.log('   🔒 Password: [PROVIDED]');
    console.log('   ⏰ Attempt Time:', new Date().toISOString());
  },

  loginApiCall: (email) => {
    console.log('%c🌐 API', styles.api, 'POST /api/auth/login - Authenticating...');
    console.log('   📧 Credentials for:', email);
  },

  loginSuccess: (email, userData, token) => {
    console.log('%c✅ LOGIN SUCCESS', styles.success, 'Authentication successful!');
    console.log('   📧 User:', email);
    console.log('   👤 User ID:', userData.id);
    console.log('   👤 Name:', userData.name);
    console.log('%c🎫 JWT TOKEN', styles.success, 'Received and validated');
    console.log('   🔑 Token Length:', token.length, 'characters');
    console.log('   🔑 Token Preview:', token.substring(0, 50) + '...');
    console.log('%c💾 STORAGE', styles.info, 'Token saved to localStorage');
    console.log('%c🔒 AUTH STATE', styles.auth, 'User authenticated in React state');
    console.log('%c🔄 REDIRECT', styles.info, 'Navigating to /dashboard');
  },

  loginError: (error, email) => {
    console.error('%c❌ LOGIN FAILED', styles.error, 'Authentication failed');
    console.log('   📧 Attempted Email:', email);
    console.log('   📊 Status:', error.response?.status || 'Network Error');
    
    if (error.response?.status === 401) {
      console.error('%c🔒 SECURITY', styles.security, 'Invalid credentials provided');
      console.log('%c📝 MESSAGE', styles.info, 'Generic "Invalid email or password" shown to user');
      console.log('%c🛡️ ANTI-ENUMERATION', styles.security, 'Same error for wrong password vs non-existent user');
    }
    console.log('%c🔄 FORM', styles.info, 'Stays on login page');
  },

  // Logout Logging
  logoutStart: () => {
    console.log('%c🚪 LOGOUT', styles.auth, 'User initiated logout');
    console.log('   ⏰ Logout Time:', new Date().toISOString());
  },

  logoutStorage: () => {
    console.log('%c🗑️ STORAGE', styles.info, 'Removing token from localStorage');
    console.log('   🔑 Token Status: CLEARED');
  },

  logoutStateCleared: () => {
    console.log('%c🔄 STATE', styles.info, 'React authentication state cleared');
    console.log('   👤 User: null');
    console.log('   🎫 Token: null');
    console.log('   🔒 IsAuthenticated: false');
  },

  logoutRedirect: () => {
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to /login');
    console.log('%c🔒 AUTH STATE', styles.auth, 'User successfully logged out');
  },

  // Session Persistence Logging
  sessionCheckStart: () => {
    console.log('%c🔄 PAGE REFRESH', styles.info, 'Application reloading - checking session...');
    console.log('   ⏰ Refresh Time:', new Date().toISOString());
  },

  sessionTokenCheck: () => {
    console.log('%c💾 STORAGE', styles.info, 'Checking localStorage for existing token');
  },

  sessionTokenFound: (tokenLength) => {
    console.log('%c🎫 JWT TOKEN', styles.success, 'Found existing token in localStorage');
    console.log('   🔑 Token Length:', tokenLength, 'characters');
    console.log('%c🔐 AUTH', styles.auth, 'Attempting auto-authentication with stored token');
  },

  sessionTokenMissing: () => {
    console.log('%c🎫 JWT TOKEN', styles.warning, 'No token found in localStorage');
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to login page');
  },

  sessionRestoreSuccess: (userData) => {
    console.log('%c✅ SESSION', styles.success, 'Session restored successfully!');
    console.log('   👤 User:', userData.name);
    console.log('   📧 Email:', userData.email);
    console.log('   🔒 Auth State: RESTORED');
    console.log('%c🎯 RESULT', styles.success, 'User remains logged in after refresh');
  },

  sessionRestoreError: (error) => {
    console.error('%c❌ SESSION RESTORE FAILED', styles.error, 'Token validation failed');
    console.log('   📝 Reason:', error.message);
    console.log('%c🗑️ CLEANUP', styles.warning, 'Removing invalid token from localStorage');
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to login page');
  }
};

// 🛡️ Route Protection Logging
const routeLogger = {
  protectedRouteAccess: (route, isAuthenticated) => {
    console.log('%c🔒 ROUTE GUARD', styles.security, `Protected route accessed: ${route}`);
    console.log('   🛡️ Route:', route);
    console.log('   🔐 Is Authenticated:', isAuthenticated);
    console.log('   ⏰ Access Time:', new Date().toISOString());
  },

  accessGranted: (route) => {
    console.log('%c✅ ACCESS GRANTED', styles.success, `Authorized access to ${route}`);
    console.log('   🎫 Valid Token: YES');
    console.log('   👤 User Authenticated: YES');
  },

  accessDenied: (route) => {
    console.log('%c🚫 ACCESS DENIED', styles.error, `Unauthorized access attempt to ${route}`);
    console.log('   🎫 Valid Token: NO');
    console.log('   👤 User Authenticated: NO');
    console.log('%c🔄 REDIRECT', styles.info, 'Redirecting to /login');
    console.log('%c⚠️ MESSAGE', styles.warning, 'Please log in to continue');
  },

  publicRouteAccess: (route) => {
    console.log('%c🌐 PUBLIC ROUTE', styles.info, `Public route accessed: ${route}`);
    console.log('   🔓 Access: UNRESTRICTED');
  }
};

// 💼 Job Management Logging
const jobLogger = {
  // Create Job Logging
  createJobStart: () => {
    console.log('%c💼 CREATE JOB', styles.info, 'New job form opened');
    console.log('   📋 Form: ADD NEW JOB');
    console.log('   ⏰ Started:', new Date().toISOString());
  },

  createJobValidation: (isValid, errors = {}, jobData = {}) => {
    console.log('%c📝 FORM VALIDATION', isValid ? styles.success : styles.warning, 
      isValid ? 'All fields valid - ready to create job' : 'Validation errors detected');
    
    if (isValid) {
      console.log('   ✅ Title:', jobData.title);
      console.log('   ✅ Company:', jobData.company);
      console.log('   ✅ Location:', jobData.location);
      console.log('   ✅ Status:', jobData.status);
      console.log('%c🚀 SUBMISSION', styles.success, 'Form ready for API submission');
    } else {
      console.log('%c❌ VALIDATION ERRORS:', styles.warning);
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`     🔴 ${field}: ${error}`);
      });
      console.log('%c🔒 FORM', styles.info, 'Submission prevented - fix errors to continue');
    }
  },

  createJobApiCall: (jobData) => {
    console.log('%c🌐 API', styles.api, 'POST /api/jobs - Creating new job...');
    console.log('   💼 Job Title:', jobData.title);
    console.log('   🏢 Company:', jobData.company);
    console.log('   📍 Location:', jobData.location);
    console.log('   📊 Status:', jobData.status);
  },

  createJobSuccess: (job, responseTime) => {
    console.log('%c✅ JOB CREATED', styles.success, 'New job successfully created!');
    console.log('   🆔 Job ID:', job.id);
    console.log('   💼 Title:', job.title);
    console.log('   🏢 Company:', job.company);
    console.log('   📍 Location:', job.location);
    console.log('   📊 Status:', job.status);
    console.log('   👤 User ID:', job.userId);
    console.log('   ⏰ Created:', job.createdAt);
    console.log('%c⚡ PERFORMANCE', styles.performance, `API response time: ${responseTime}ms`);
    console.log('%c🎯 UI UPDATE', styles.ui, `Job card will appear in ${job.status.toUpperCase()} column`);
    console.log('%c💾 DATABASE', styles.info, 'Job linked to authenticated user');
    console.log('%c🔄 BOARD REFRESH', styles.info, 'Job board updating with new job...');
  },

  createJobError: (error, jobData) => {
    console.error('%c❌ JOB CREATION FAILED', styles.error, 'Failed to create job');
    console.log('   💼 Attempted Title:', jobData.title);
    console.log('   📊 Status Code:', error.response?.status || 'Network Error');
    console.log('   📝 Error Details:', error.response?.data?.message || error.message);
    console.log('%c🔄 FORM', styles.info, 'Form remains open for retry');
  },

  // Load Jobs Logging
  loadJobsStart: () => {
    console.log('%c📋 LOADING JOBS', styles.info, 'Fetching user jobs from API...');
    console.log('   🌐 Endpoint: GET /api/jobs');
    console.log('   👤 User: AUTHENTICATED');
  },

  loadJobsSuccess: (jobs, responseTime) => {
    console.log('%c📊 JOBS LOADED', styles.success, `${jobs.length} jobs retrieved successfully`);
    
    // Count jobs by status
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    console.log('%c📈 JOB DISTRIBUTION:', styles.info);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   🗂️ ${status.toUpperCase()} COLUMN: ${count} jobs`);
    });

    console.log('%c⚡ PERFORMANCE', styles.performance, `Jobs loaded in ${responseTime}ms`);
    console.log('%c🎨 UI UPDATE', styles.ui, 'Rendering job cards in Kanban columns...');
    
    // Log first few jobs for debugging
    jobs.slice(0, 3).forEach(job => {
      console.log(`     💼 ${job.title} at ${job.company} (${job.status})`);
    });
    if (jobs.length > 3) {
      console.log(`     ... and ${jobs.length - 3} more jobs`);
    }
  },

  loadJobsEmpty: () => {
    console.log('%c📭 EMPTY STATE', styles.warning, 'No jobs found for user');
    console.log('%c🎨 UI', styles.ui, 'Empty state component will be rendered');
    console.log('%c📝 MESSAGE', styles.info, '"Your board is empty. Add a job to get started!"');
    console.log('%c🎯 CTA', styles.info, '"Add Your First Job" button will be displayed');
  },

  loadJobsError: (error) => {
    console.error('%c🚫 JOBS LOAD FAILED', styles.error, 'Failed to fetch jobs');
    console.log('   📊 Status:', error.response?.status || 'Network Error');
    console.log('   📝 Details:', error.response?.data?.message || error.message);
    console.log('%c🎨 UI UPDATE', styles.ui, 'Error message will be displayed to user');
  },

  // Drag & Drop Logging
  dragStart: (jobId, jobTitle, currentStatus) => {
    console.log('%c🖱️ DRAG START', styles.ui, `Drag initiated for job: ${jobTitle}`);
    console.log('   🆔 Job ID:', jobId);
    console.log('   💼 Title:', jobTitle);
    console.log('   📊 Current Status:', currentStatus);
    console.log('   🎯 Action: DRAG_START');
  },

  dragOver: (targetColumn, jobTitle) => {
    console.log('%c🎯 DRAG OVER', styles.ui, `Hovering over ${targetColumn} column`);
    console.log('   💼 Job:', jobTitle);
    console.log('   🎯 Target Column:', targetColumn);
    console.log('   🎨 Visual Feedback: Column highlighting active');
  },

  dropSuccess: (jobId, jobTitle, oldStatus, newStatus) => {
    console.log('%c📤 DROP SUCCESS', styles.success, `Job dropped in ${newStatus} column`);
    console.log('   🆔 Job ID:', jobId);
    console.log('   💼 Title:', jobTitle);
    console.log('   📊 Status Change:', `${oldStatus} → ${newStatus}`);
    console.log('   🎨 UI UPDATE: Job card moving to new column...');
  },

  updateJobApiCall: (jobId, updateData) => {
    console.log('%c🌐 API', styles.api, `PATCH /api/jobs/${jobId} - Updating job status...`);
    console.log('   🆔 Job ID:', jobId);
    console.log('   📊 New Status:', updateData.status);
  },

  updateJobSuccess: (job, responseTime) => {
    console.log('%c✅ STATUS UPDATE', styles.success, 'Job status updated in database');
    console.log('   🆔 Job ID:', job.id);
    console.log('   💼 Title:', job.title);
    console.log('   📊 New Status:', job.status);
    console.log('   ⏰ Updated At:', job.updatedAt);
    console.log('%c⚡ PERFORMANCE', styles.performance, `Update completed in ${responseTime}ms`);
    console.log('%c💾 DATABASE', styles.info, 'Status change persisted successfully');
  },

  updateJobError: (error, jobId, attemptedStatus) => {
    console.error('%c❌ UPDATE FAILED', styles.error, 'Failed to update job status');
    console.log('   🆔 Job ID:', jobId);
    console.log('   📊 Attempted Status:', attemptedStatus);
    console.log('   📊 Error Code:', error.response?.status || 'Network Error');
    console.log('   📝 Error Details:', error.response?.data?.message || error.message);
    console.log('%c🔄 UI REVERT', styles.warning, 'Reverting job card to original position...');
  },

  // Delete Job Logging
  deleteJobStart: (jobId, jobTitle) => {
    console.log('%c🗑️ DELETE REQUEST', styles.warning, `Delete initiated for: ${jobTitle}`);
    console.log('   🆔 Job ID:', jobId);
    console.log('   💼 Title:', jobTitle);
    console.log('   ⚠️ Action: DELETE_REQUEST');
  },

  deleteJobConfirm: (jobId) => {
    console.log('%c⚠️ DELETE CONFIRMATION', styles.warning, 'User confirmed job deletion');
    console.log('   🆔 Job ID:', jobId);
    console.log('   ✅ User Choice: CONFIRMED');
  },

  deleteJobApiCall: (jobId) => {
    console.log('%c🌐 API', styles.api, `DELETE /api/jobs/${jobId} - Deleting job...`);
    console.log('   🗑️ Target Job ID:', jobId);
  },

  deleteJobSuccess: (jobId, jobTitle, responseTime) => {
    console.log('%c✅ JOB DELETED', styles.success, 'Job permanently removed from database');
    console.log('   🆔 Deleted Job ID:', jobId);
    console.log('   💼 Deleted Title:', jobTitle);
    console.log('%c⚡ PERFORMANCE', styles.performance, `Deletion completed in ${responseTime}ms`);
    console.log('%c🎨 UI UPDATE', styles.ui, 'Job card removed from board');
    console.log('%c📊 COUNT UPDATE', styles.info, 'Job count decreased by 1');
    console.log('%c💾 DATABASE', styles.info, 'Job permanently deleted from database');
  },

  deleteJobError: (error, jobId) => {
    console.error('%c❌ DELETE FAILED', styles.error, 'Failed to delete job');
    console.log('   🆔 Job ID:', jobId);
    console.log('   📊 Error Code:', error.response?.status || 'Network Error');
    console.log('   📝 Error Details:', error.response?.data?.message || error.message);
    console.log('%c🔄 UI RESTORE', styles.warning, 'Job card remains on board');
  }
};

// 🚨 Error & Security Logging  
const errorLogger = {
  networkError: (error, context) => {
    console.error('%c🔥 NETWORK ERROR', styles.error, `Connection failed: ${context}`);
    console.log('   📡 Error Type:', error.code || 'NETWORK_ERROR');
    console.log('   📝 Message:', error.message);
    console.log('   🌐 Likely Cause: Backend server unreachable');
    console.log('%c⚠️ ERROR HANDLER', styles.warning, 'Network error handler activated');
    console.log('%c🎨 UI UPDATE', styles.ui, 'Displaying "Failed to fetch data from server" message');
    console.log('%c🚫 NO SPINNER', styles.info, 'Loading indicators stopped to prevent infinite loops');
  },

  xssAttempt: (field, content, sanitizedContent) => {
    console.warn('%c🛡️ XSS PROTECTION', styles.security, `HTML/Script detected in ${field} field`);
    console.log('   🔍 Original Input:', content);
    console.log('   🔒 Sanitized Output:', sanitizedContent);
    console.log('   📝 Security Action: Content will be rendered as literal text');
    console.log('   🛡️ Protection: XSS attack prevented');
    console.log('%c📋 RESULT', styles.success, 'HTML tags will display as text, not execute');
  },

  formValidationError: (field, rule, value) => {
    console.warn('%c📝 FORM VALIDATION', styles.warning, `Validation failed: ${field}`);
    console.log('   🔍 Field:', field);
    console.log('   📏 Rule:', rule);
    console.log('   💭 Value:', value || '[EMPTY]');
    console.log('   🎨 UI: Red error message will appear under field');
  },

  apiError: (method, endpoint, error) => {
    console.error('%c🚫 API ERROR', styles.error, `${method} ${endpoint} failed`);
    console.log('   🌐 Method:', method);
    console.log('   📍 Endpoint:', endpoint);
    console.log('   📊 Status:', error.response?.status || 'Network Error');
    console.log('   📝 Message:', error.response?.data?.message || error.message);
    console.log('   ⏰ Time:', new Date().toISOString());
  }
};

// 📱 Responsive & Performance Logging
const performanceLogger = {
  pageLoadStart: (page) => {
    console.log('%c⚡ PERFORMANCE', styles.performance, `Page load started: ${page}`);
    console.log('   📄 Page:', page);
    console.log('   ⏰ Start Time:', performance.now());
  },

  pageLoadComplete: (page, loadTime) => {
    console.log('%c⚡ PAGE LOADED', styles.performance, `${page} loaded in ${loadTime}ms`);
    console.log('   📊 Load Time:', `${loadTime}ms`);
    console.log('   🎯 Performance:', loadTime < 1000 ? 'EXCELLENT' : loadTime < 3000 ? 'GOOD' : 'NEEDS IMPROVEMENT');
  },

  apiResponseTime: (endpoint, method, responseTime) => {
    console.log('%c⚡ API PERFORMANCE', styles.performance, `${method} ${endpoint} - ${responseTime}ms`);
    console.log('   🌐 Endpoint:', `${method} ${endpoint}`);
    console.log('   ⏱️ Response Time:', `${responseTime}ms`);
    console.log('   📊 Rating:', responseTime < 100 ? 'FAST' : responseTime < 500 ? 'GOOD' : 'SLOW');
  },

  viewportChange: (width, height, device) => {
    console.log('%c📱 VIEWPORT CHANGE', styles.ui, `Viewport: ${device || 'Custom'} (${width}x${height})`);
    console.log('   📐 Dimensions:', `${width}x${height}`);
    console.log('   📱 Device:', device || 'Custom');
    console.log('   🎨 CSS Breakpoint:', width < 768 ? 'Mobile' : width < 1024 ? 'Tablet' : 'Desktop');
  }
};

// 🎮 Global Console Commands for Manual Testing
if (typeof window !== 'undefined') {
  // Add testing commands to global scope
  window.PathForgeDebug = {
    checkAuth: () => {
      const token = localStorage.getItem('token');
      console.log('%c🔍 AUTH STATUS CHECK', styles.info, 'Manual debugging command executed');
      console.log('   🎫 Token Exists:', !!token);
      if (token) {
        console.log('   🔑 Token Length:', token.length, 'characters');
        console.log('   🔑 Token Preview:', token.substring(0, 50) + '...');
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('   👤 User ID:', payload.userId);
          console.log('   ⏰ Expires:', new Date(payload.exp * 1000).toISOString());
          console.log('   ✅ Token Status:', Date.now() / 1000 < payload.exp ? 'VALID' : 'EXPIRED');
        } catch (e) {
          console.log('   ❌ Token Status: INVALID FORMAT');
        }
      } else {
        console.log('   🔐 Auth State: LOGGED OUT');
      }
    },

    clearStorage: () => {
      console.log('%c🗑️ CLEAR STORAGE', styles.warning, 'Manual storage clear executed');
      localStorage.clear();
      console.log('   ✅ localStorage: CLEARED');
      console.log('   🔄 Refresh page to see logout effect');
    },

    simulateNetworkError: () => {
      errorLogger.networkError(
        { code: 'ECONNREFUSED', message: 'Connection refused' },
        'Manual simulation'
      );
    },

    showCurrentJobs: () => {
      console.log('%c📋 MANUAL JOB CHECK', styles.info, 'Checking current jobs state...');
      // This would need to be connected to actual app state
      console.log('   ℹ️ This command needs app integration to show actual job data');
    }
  };

  // Initial logging setup message
  console.log('%c🎮 PATHFORGE DEBUG COMMANDS LOADED', 'background: #333; color: #00ff00; padding: 10px; font-size: 14px; font-weight: bold;');
  console.log('%c🔧 Available Commands:', 'color: #666; font-size: 12px;');
  console.log('%c  PathForgeDebug.checkAuth()', 'color: #0066cc;', '// Check authentication status');
  console.log('%c  PathForgeDebug.clearStorage()', 'color: #0066cc;', '// Clear localStorage');
  console.log('%c  PathForgeDebug.simulateNetworkError()', 'color: #0066cc;', '// Simulate network failure');
  console.log('%c  PathForgeDebug.showCurrentJobs()', 'color: #0066cc;', '// Show current jobs state');
}

// Export all loggers
export {
  authLogger,
  routeLogger,
  jobLogger,
  errorLogger,
  performanceLogger
};

export default {
  authLogger,
  routeLogger,
  jobLogger,
  errorLogger,
  performanceLogger
};