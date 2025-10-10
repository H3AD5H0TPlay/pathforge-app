const axios = require('axios');

// Configuration for Docker Professional Environment
const API_BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost';

// Test Constants
const TEST_EMAIL_BASE = 'tester1@email.com'; // Exact email as specified
const TEST_USER_NAME = 'Test User';
const TEST_PASSWORD = 'SecurePassword123!';

// Colors for professional output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, success, details = '') => {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else {
    testResults.failed++;
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'yellow');
  }
};

const generateUniqueEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `tester${timestamp}${random}@email.com`;
};

const generateTestUser = () => {
  const email = generateUniqueEmail();
  return {
    name: 'Test User Docker',
    email: email,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  };
};

// Docker Environment Health Check
async function testDockerEnvironment() {
  log('\n🐳 Testing Docker Environment Health...', 'blue');
  
  try {
    // Test backend health
    const backendHealth = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    
    if (backendHealth.status === 200 && backendHealth.data.status === 'OK') {
      logTest('Backend Container Health', true, `Uptime: ${backendHealth.data.uptime}s`);
    } else {
      logTest('Backend Container Health', false, 'Health check failed');
      return false;
    }

    // Test frontend accessibility
    try {
      const frontendCheck = await axios.get(FRONTEND_URL, { timeout: 5000 });
      if (frontendCheck.status === 200) {
        logTest('Frontend Container Health', true, 'Nginx serving React app');
      } else {
        logTest('Frontend Container Health', false, 'Frontend not accessible');
      }
    } catch (frontendError) {
      logTest('Frontend Container Health', false, `Frontend error: ${frontendError.message}`);
    }

    // Test API base endpoint
    const apiBase = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    if (apiBase.status === 200 && apiBase.data.message) {
      logTest('API Base Endpoint', true, 'API responding correctly');
    } else {
      logTest('API Base Endpoint', false, 'API base endpoint failed');
    }

    return true;

  } catch (error) {
    logTest('Docker Environment Setup', false, `Connection failed: ${error.message}`);
    return false;
  }
}

// Test Case 1: Registration Success
async function testRegistrationSuccess() {
  log('\n📝 Test Case 1: Registration - Success', 'blue');
  log('   Action: Create new user account with valid, unique credentials', 'dim');
  log('   Expected: Account created successfully, user saved with hashed password\n', 'dim');
  
  const uniqueEmail = `${Date.now()}_unique@email.com`;
  const testUser = {
    name: TEST_USER_NAME,
    email: uniqueEmail,
    password: TEST_PASSWORD
  };
  
  try {
    log(`🔄 Creating user: ${testUser.email}`, 'yellow');
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password
    }, { timeout: 10000 });

    // Verify response structure
    if (response.status === 201) {
      logTest('Registration HTTP Status', true, 'Status: 201 Created');
    } else {
      logTest('Registration HTTP Status', false, `Expected 201, got ${response.status}`);
      return { success: false };
    }

    if (response.data && response.data.success) {
      logTest('Registration Success Flag', true, 'Response indicates success');
    } else {
      logTest('Registration Success Flag', false, 'Success flag not set');
      return { success: false };
    }

    if (response.data && response.data.data && response.data.data.token) {
      logTest('JWT Token Generated', true, 'Token present in response');
    } else {
      logTest('JWT Token Generated', false, 'No token in response');
      return { success: false };
    }

    if (response.data && response.data.data && response.data.data.user) {
      logTest('User Object Returned', true, `User ID: ${response.data.data.user.id}`);
      
      // Verify user data
      if (response.data.data.user.email === testUser.email) {
        logTest('Email Verification', true, 'Email matches registration');
      } else {
        logTest('Email Verification', false, 'Email mismatch');
        return { success: false };
      }
      
      if (response.data.data.user.name === testUser.name) {
        logTest('Name Verification', true, 'Name matches registration');
      } else {
        logTest('Name Verification', false, 'Name mismatch');
        return { success: false };
      }
      
      if (!response.data.data.user.password) {
        logTest('Password Security', true, 'Password not exposed in response');
      } else {
        logTest('Password Security', false, 'Password exposed in response - SECURITY ISSUE');
        return { success: false };
      }
    } else {
      logTest('User Object Returned', false, 'No user object in response');
      return { success: false };
    }

    // Test token authentication
    if (response.data && response.data.data && response.data.data.token) {
      try {
        const authTest = await axios.get(`${API_BASE_URL}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${response.data.data.token}`
          },
          timeout: 5000
        });
        
        if (authTest.status === 200) {
          logTest('Token Authentication', true, 'Token works for protected routes');
        } else {
          logTest('Token Authentication', false, 'Token rejected by protected route');
          return { success: false };
        }
      } catch (authError) {
        logTest('Token Authentication', false, `Auth test failed: ${authError.message}`);
        return { success: false };
      }
    }

    return { 
      success: true, 
      user: response.data.data.user, 
      token: response.data.data.token,
      testUser: testUser
    };

  } catch (error) {
    logTest('Registration Request', false, `Request failed: ${error.message}`);
    
    if (error.response) {
      logTest('Error Response Analysis', false, 
        `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Test Case 2: Registration - Duplicate Email
async function testRegistrationDuplicateEmail() {
  log('\n📝 Test Case 2: Registration - Duplicate Email', 'blue');
  log('   Action: Attempt to create another user with exact same email (tester1@email.com)', 'dim');
  log('   Expected: Registration fails with clear error message "Email already in use"\n', 'dim');
  
  try {
    // Step 1: Create first user with the specified email
    log(`🔄 Step 1: Creating first user with email: ${TEST_EMAIL_BASE}`, 'yellow');
    
    const firstUserResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name: TEST_USER_NAME,
      email: TEST_EMAIL_BASE,
      password: TEST_PASSWORD
    }, { timeout: 10000 });

    if (firstUserResponse.status === 201) {
      logTest('First User Registration', true, `User created with email: ${TEST_EMAIL_BASE}`);
    } else {
      logTest('First User Registration', false, 'Failed to create first user');
      return { success: false };
    }

    // Step 2: Attempt to create second user with EXACT same email
    log(`🔄 Step 2: Attempting to create duplicate user with EXACT same email: ${TEST_EMAIL_BASE}`, 'yellow');
    
    try {
      const duplicateUserResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Different User Name',
        email: TEST_EMAIL_BASE, // EXACT same email
        password: 'DifferentPassword123!'
      }, { timeout: 10000 });
      
      // If we get here, the duplicate registration succeeded when it should have failed
      logTest('Duplicate Email Prevention', false, 
        `CRITICAL ERROR: Duplicate registration succeeded with status ${duplicateUserResponse.status}`);
      logTest('Security Vulnerability', false, 
        'Multiple users can register with same email - MAJOR SECURITY ISSUE');
      
      return { success: false };
      
    } catch (duplicateError) {
      // This is the expected behavior - registration should fail
      
      if (duplicateError.response) {
        const status = duplicateError.response.status;
        const responseData = duplicateError.response.data;
        
        // Verify correct HTTP status
        if (status === 400) {
          logTest('Duplicate Email HTTP Status', true, 'Status: 400 Bad Request (correct)');
        } else {
          logTest('Duplicate Email HTTP Status', false, 
            `Expected 400, got ${status} - incorrect status for duplicate email`);
          return { success: false };
        }
        
        // Verify success flag is false
        if (responseData.success === false) {
          logTest('Duplicate Email Success Flag', true, 'Success flag correctly set to false');
        } else {
          logTest('Duplicate Email Success Flag', false, 
            `Success flag should be false, got: ${responseData.success}`);
          return { success: false };
        }
        
        // Verify clear error message
        const errorMessage = responseData.message;
        const acceptableMessages = [
          'Email already in use',
          'Email already exists',
          'User with this email already exists',
          'Email is already registered'
        ];
        
        const hasAcceptableMessage = acceptableMessages.some(msg => 
          errorMessage && errorMessage.toLowerCase().includes(msg.toLowerCase())
        );
        
        if (hasAcceptableMessage) {
          logTest('Clear Error Message', true, `Message: "${errorMessage}"`);
        } else {
          logTest('Clear Error Message', false, 
            `Message unclear: "${errorMessage}". Should contain "Email already in use" or similar`);
          return { success: false };
        }
        
        // Verify no token is provided
        if (!responseData.token && (!responseData.data || !responseData.data.token)) {
          logTest('No Token on Failure', true, 'No authentication token provided (correct)');
        } else {
          logTest('No Token on Failure', false, 
            'SECURITY ISSUE: Token provided even though registration failed');
          return { success: false };
        }
        
        // Verify no user data is provided
        if (!responseData.user && (!responseData.data || !responseData.data.user)) {
          logTest('No User Data on Failure', true, 'No user data provided (correct)');
        } else {
          logTest('No User Data on Failure', false, 
            'User data provided even though registration failed');
          return { success: false };
        }
        
      } else {
        logTest('Duplicate Email Response', false, 
          'No response received for duplicate email attempt');
        return { success: false };
      }
    }

    // Step 3: Verify first user can still login (not affected by duplicate attempt)
    log(`🔄 Step 3: Verifying first user can still login after duplicate attempt`, 'yellow');
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: TEST_EMAIL_BASE,
        password: TEST_PASSWORD
      }, { timeout: 5000 });
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        logTest('Original User Login Still Works', true, 
          'First user can still login after duplicate attempt');
      } else {
        logTest('Original User Login Still Works', false, 
          'Original user login affected by duplicate attempt');
        return { success: false };
      }
    } catch (loginError) {
      logTest('Original User Login Still Works', false, 
        `Login failed: ${loginError.message}`);
      return { success: false };
    }
    
    return { success: true };

  } catch (error) {
    logTest('Duplicate Email Test Setup', false, 
      `Test setup failed: ${error.message}`);
    return { success: false };
  }
}

// Additional utility functions can be added here for future test cases

// Main Professional Test Runner
async function runDockerTests() {
  log(`${colors.bold}${colors.magenta}🐳 PathForge Professional Registration Testing Suite${colors.reset}`);
  log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.white}Backend API: ${API_BASE_URL}${colors.reset}`);
  log(`${colors.white}Frontend URL: ${FRONTEND_URL}${colors.reset}`);
  log(`${colors.white}Environment: Docker Professional Containers${colors.reset}`);
  log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Test Docker environment first
  log(`${colors.bold}🔍 PHASE 1: ENVIRONMENT VALIDATION${colors.reset}`, 'blue');
  const dockerHealthy = await testDockerEnvironment();
  if (!dockerHealthy) {
    log(`${colors.red}❌ Docker environment is not healthy. STOPPING ALL TESTS.${colors.reset}`);
    log(`${colors.yellow}Please ensure Docker containers are running with: docker-compose up${colors.reset}`);
    return;
  }

  log(`${colors.bold}📋 PHASE 2: REGISTRATION TEST CASES${colors.reset}`, 'blue');
  
  // Test Case 1: Registration Success
  const registrationResult = await testRegistrationSuccess();
  
  // Test Case 2: Duplicate Email Prevention  
  const duplicateEmailResult = await testRegistrationDuplicateEmail();

  // Summary Report
  log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.bold}📊 PROFESSIONAL TEST RESULTS SUMMARY${colors.reset}`);
  log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
  
  log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  log(`📝 Total Tests: ${testResults.total}`);

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  // Detailed Results
  log(`\n${colors.bold}📋 TEST CASE RESULTS:${colors.reset}`);
  log(`${registrationResult.success ? '✅' : '❌'} Registration Success: ${registrationResult.success ? 'PASSED' : 'FAILED'}`);
  log(`${duplicateEmailResult.success ? '✅' : '❌'} Duplicate Email Prevention: ${duplicateEmailResult.success ? 'PASSED' : 'FAILED'}`);
  
  if (testResults.failed === 0) {
    log(`\n${colors.bold}${colors.green}🎉 ALL TESTS PASSED! (${successRate}%)${colors.reset}`);
    log(`${colors.green}✅ Registration functionality is PRODUCTION READY!${colors.reset}`);
    log(`${colors.green}✅ Security measures are PROPERLY IMPLEMENTED!${colors.reset}`);
    log(`${colors.green}✅ Error handling is WORKING CORRECTLY!${colors.reset}`);
    log(`${colors.cyan}🚀 Ready for deployment to Railway and Vercel!${colors.reset}`);
  } else {
    log(`\n${colors.bold}${colors.red}❌ TESTS FAILED! (${successRate}% success rate)${colors.reset}`);
    log(`${colors.red}Registration functionality has CRITICAL ISSUES that must be fixed!${colors.reset}`);
    log(`${colors.yellow}Please review and fix ALL failing tests before proceeding.${colors.reset}`);
    log(`${colors.yellow}No deployment should happen until 100% test success rate is achieved.${colors.reset}`);
  }

  // Container status
  log(`\n${colors.bold}🐳 DOCKER CONTAINER STATUS:${colors.reset}`);
  log(`${colors.cyan}• Backend Container: ${API_BASE_URL} (Production Mode)${colors.reset}`);
  log(`${colors.cyan}• Frontend Container: ${FRONTEND_URL} (Nginx + React)${colors.reset}`);
  log(`${colors.cyan}• Database: SQLite with Persistent Volume${colors.reset}`);
  log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`, 'red');
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runDockerTests().catch(error => {
    log(`Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runDockerTests,
  testRegistrationSuccess,
  testRegistrationDuplicateEmail
};