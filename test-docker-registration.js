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
    // Step 1: Create first user with a unique email (avoiding conflicts with previous tests)
    const uniqueTestEmail = `tester_duplicate_${Date.now()}@email.com`;
    log(`🔄 Step 1: Creating first user with email: ${uniqueTestEmail}`, 'yellow');
    
    const firstUserResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name: TEST_USER_NAME,
      email: uniqueTestEmail,
      password: TEST_PASSWORD
    }, { timeout: 10000 });

    if (firstUserResponse.status === 201) {
      logTest('First User Registration', true, `User created with email: ${uniqueTestEmail}`);
    } else {
      logTest('First User Registration', false, 'Failed to create first user');
      return { success: false };
    }

    // Step 2: Attempt to create second user with EXACT same email
    log(`🔄 Step 2: Attempting to create duplicate user with EXACT same email: ${uniqueTestEmail}`, 'yellow');
    
    try {
      const duplicateUserResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Different User Name',
        email: uniqueTestEmail, // EXACT same email
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
        email: uniqueTestEmail,
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

// Test Case 3: Registration - Invalid Input Validation
async function testRegistrationInvalidInput() {
  log('\n📝 Test Case 3: Registration - Invalid Input', 'blue');
  log('   Action: Attempt registration with invalid email format and blank password', 'dim');
  log('   Expected: Form validation prevents submission, appropriate error messages displayed\n', 'dim');

  // Define comprehensive invalid input test cases
  const invalidInputCases = [
    {
      name: 'Invalid Email Format (test.com)',
      data: {
        name: TEST_USER_NAME,
        email: 'test.com', // Missing @ symbol - exact example from requirements
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'email',
      expectedMessageKeywords: ['email', 'valid', 'format']
    },
    {
      name: 'Invalid Email Format (no domain)',
      data: {
        name: TEST_USER_NAME,
        email: 'test@',
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'email',
      expectedMessageKeywords: ['email', 'valid']
    },
    {
      name: 'Invalid Email Format (no @ symbol)',
      data: {
        name: TEST_USER_NAME,
        email: 'testuser.email.com',
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'email',
      expectedMessageKeywords: ['email', 'valid']
    },
    {
      name: 'Blank Password',
      data: {
        name: TEST_USER_NAME,
        email: `valid${Date.now()}@email.com`,
        password: '' // Blank password - exact example from requirements
      },
      expectedStatus: 400,
      expectedErrorType: 'password',
      expectedMessageKeywords: ['password', 'required']
    },
    {
      name: 'Missing Password Field',
      data: {
        name: TEST_USER_NAME,
        email: `valid${Date.now()}@email.com`
        // password field completely missing
      },
      expectedStatus: 400,
      expectedErrorType: 'password',
      expectedMessageKeywords: ['password']
    },
    {
      name: 'Short Password (less than 6 characters)',
      data: {
        name: TEST_USER_NAME,
        email: `valid${Date.now()}@email.com`,
        password: '123' // Too short
      },
      expectedStatus: 400,
      expectedErrorType: 'password',
      expectedMessageKeywords: ['password', 'characters', 'least']
    },
    {
      name: 'Blank Name',
      data: {
        name: '', // Blank name
        email: `valid${Date.now()}@email.com`,
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'name',
      expectedMessageKeywords: ['name', 'required']
    },
    {
      name: 'Missing Name Field',
      data: {
        // name field completely missing
        email: `valid${Date.now()}@email.com`,
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'name',
      expectedMessageKeywords: ['name']
    },
    {
      name: 'Name Too Short (1 character)',
      data: {
        name: 'A', // Too short
        email: `valid${Date.now()}@email.com`,
        password: TEST_PASSWORD
      },
      expectedStatus: 400,
      expectedErrorType: 'name',
      expectedMessageKeywords: ['name', 'characters']
    },
    {
      name: 'Multiple Invalid Fields',
      data: {
        name: '', // Blank name
        email: 'invalid.email.format', // Invalid email
        password: '' // Blank password
      },
      expectedStatus: 400,
      expectedErrorType: 'multiple',
      expectedMessageKeywords: ['name', 'email', 'password'] // Accept any message mentioning the required fields
    }
  ];

  let passedTests = 0;
  let totalTests = invalidInputCases.length;

  try {
    for (let i = 0; i < invalidInputCases.length; i++) {
      const testCase = invalidInputCases[i];
      
      log(`🔄 Test ${i + 1}/${totalTests}: ${testCase.name}`, 'yellow');
      log(`   Email: "${testCase.data.email || '[MISSING]'}"`, 'dim');
      log(`   Name: "${testCase.data.name || '[MISSING]'}"`, 'dim');
      log(`   Password: "${testCase.data.password ? '[PROVIDED]' : '[BLANK/MISSING]'}"`, 'dim');

      try {
        // Attempt registration with invalid data
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testCase.data, { 
          timeout: 10000 
        });
        
        // If we reach here, the validation failed - registration should have been rejected
        logTest(`${testCase.name} - Rejection`, false, 
          `CRITICAL: Invalid data was accepted! Status: ${response.status}`);
        logTest(`${testCase.name} - Security Issue`, false, 
          'Form validation is not working - this is a security vulnerability');
        
      } catch (validationError) {
        // This is the expected behavior - registration should fail with validation error
        
        if (validationError.response) {
          const status = validationError.response.status;
          const responseData = validationError.response.data;
          
          // Verify correct HTTP status
          if (status === testCase.expectedStatus) {
            logTest(`${testCase.name} - HTTP Status`, true, 
              `Status: ${status} (correct rejection)`);
          } else {
            logTest(`${testCase.name} - HTTP Status`, false, 
              `Expected ${testCase.expectedStatus}, got ${status}`);
            continue;
          }
          
          // Verify success flag is false
          if (responseData.success === false) {
            logTest(`${testCase.name} - Success Flag`, true, 
              'Success flag correctly set to false');
          } else {
            logTest(`${testCase.name} - Success Flag`, false, 
              `Success flag should be false, got: ${responseData.success}`);
            continue;
          }
          
          // Verify appropriate error message
          const errorMessage = responseData.message || '';
          const hasExpectedKeywords = testCase.expectedMessageKeywords.some(keyword => 
            errorMessage.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (hasExpectedKeywords) {
            logTest(`${testCase.name} - Error Message`, true, 
              `Appropriate message: "${errorMessage}"`);
          } else {
            logTest(`${testCase.name} - Error Message`, false, 
              `Message lacks expected keywords (${testCase.expectedMessageKeywords.join(', ')}): "${errorMessage}"`);
            continue;
          }
          
          // Verify no authentication token provided
          if (!responseData.token && (!responseData.data || !responseData.data.token)) {
            logTest(`${testCase.name} - No Token`, true, 
              'No token provided for invalid input (correct)');
          } else {
            logTest(`${testCase.name} - No Token`, false, 
              'SECURITY ISSUE: Token provided for invalid input');
            continue;
          }
          
          // Verify no user data provided
          if (!responseData.user && (!responseData.data || !responseData.data.user)) {
            logTest(`${testCase.name} - No User Data`, true, 
              'No user data provided for invalid input (correct)');
          } else {
            logTest(`${testCase.name} - No User Data`, false, 
              'User data provided for invalid input');
            continue;
          }
          
          passedTests++;
          
        } else {
          logTest(`${testCase.name} - Response`, false, 
            'No response received for invalid input test');
        }
      }
    }

    // Summary for this test case
    log(`\n📊 Invalid Input Validation Summary:`, 'cyan');
    log(`   Passed: ${passedTests}/${totalTests} validation tests`, passedTests === totalTests ? 'green' : 'red');
    
    if (passedTests === totalTests) {
      logTest('Complete Invalid Input Validation', true, 
        'All invalid input cases properly rejected with appropriate messages');
      
      // Test that valid input still works after all these invalid attempts
      log(`🔄 Verification: Valid registration still works after invalid attempts`, 'yellow');
      
      try {
        const validTestResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          name: 'Valid Test User',
          email: `valid_after_invalid_${Date.now()}@email.com`,
          password: 'ValidPassword123!'
        }, { timeout: 10000 });
        
        if (validTestResponse.status === 201 && validTestResponse.data.success) {
          logTest('Valid Registration After Invalid Tests', true, 
            'System still accepts valid input after rejecting invalid input');
        } else {
          logTest('Valid Registration After Invalid Tests', false, 
            'System may be damaged by invalid input tests');
        }
      } catch (validTestError) {
        logTest('Valid Registration After Invalid Tests', false, 
          `Valid registration failed: ${validTestError.message}`);
      }
      
      return { success: true, testsRun: totalTests, testsPassed: passedTests };
      
    } else {
      logTest('Complete Invalid Input Validation', false, 
        `${totalTests - passedTests} validation cases failed - form validation has critical issues`);
      
      return { success: false, testsRun: totalTests, testsPassed: passedTests };
    }

  } catch (error) {
    logTest('Invalid Input Test Setup', false, 
      `Test setup failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Case 4: Login Success
async function testLoginSuccess() {
  log('\n🔐 Test Case 4: Login - Success', 'blue');
  log('   Action: Log in with valid credentials of an existing user', 'dim');
  log('   Expected: Login successful, JWT in response, redirect to job board\n', 'dim');

  try {
    // First, create a test user to login with
    const testUser = {
      name: 'Login Test User',
      email: generateUniqueEmail(),
      password: 'LoginTest123!'
    };

    log(`🔄 Creating test user for login: ${testUser.email}`, 'yellow');
    
    const registrationResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password
    }, { timeout: 10000 });

    if (registrationResponse.status !== 201) {
      logTest('Login Test - User Creation', false, 'Failed to create test user for login');
      return { success: false };
    }

    logTest('Login Test - User Creation', true, 'Test user created successfully');

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Now test login with the created user
    log(`🔑 Attempting login with: ${testUser.email}`, 'yellow');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, { timeout: 10000 });

    // Test login response structure
    if (loginResponse.status === 200) {
      logTest('Login HTTP Status', true, 'Status: 200 OK');
    } else {
      logTest('Login HTTP Status', false, `Expected 200, got ${loginResponse.status}`);
      return { success: false };
    }

    if (loginResponse.data && loginResponse.data.success) {
      logTest('Login Success Flag', true, 'Response indicates successful login');
    } else {
      logTest('Login Success Flag', false, 'Login success flag not set');
      return { success: false };
    }

    if (loginResponse.data && loginResponse.data.message === 'Login successful') {
      logTest('Login Success Message', true, 'Correct success message received');
    } else {
      logTest('Login Success Message', false, 'Incorrect or missing success message');
    }

    // Verify JWT token is provided
    if (loginResponse.data && loginResponse.data.data && loginResponse.data.data.token) {
      logTest('JWT Token Provided', true, 'Login response contains JWT token');
      
      // Verify token format (basic JWT structure check)
      const token = loginResponse.data.data.token;
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        logTest('JWT Token Format', true, 'Token has correct JWT structure (3 parts)');
      } else {
        logTest('JWT Token Format', false, `Token has ${tokenParts.length} parts, expected 3`);
      }

      // Test token doesn't contain sensitive information
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        if (!payload.password && !payload.email) {
          logTest('JWT Token Security', true, 'Token payload doesn\'t contain sensitive data');
        } else {
          logTest('JWT Token Security', false, 'Token contains sensitive information');
        }
      } catch (tokenError) {
        logTest('JWT Token Security', false, 'Unable to parse token payload for security check');
      }

    } else {
      logTest('JWT Token Provided', false, 'No JWT token in login response');
      return { success: false };
    }

    // Verify user data is returned
    if (loginResponse.data && loginResponse.data.data && loginResponse.data.data.user) {
      const userData = loginResponse.data.data.user;
      
      if (userData.email === testUser.email.toLowerCase()) {
        logTest('User Data Email', true, 'Returned user email matches login email');
      } else {
        logTest('User Data Email', false, 'Email mismatch in user data');
      }

      if (userData.name === testUser.name) {
        logTest('User Data Name', true, 'Returned user name matches registration');
      } else {
        logTest('User Data Name', false, 'Name mismatch in user data');
      }

      if (!userData.password) {
        logTest('User Data Security', true, 'Password not exposed in user data');
      } else {
        logTest('User Data Security', false, 'Password exposed in user data (security risk)');
      }

    } else {
      logTest('User Data Provided', false, 'No user data in login response');
    }

    // Test localStorage simulation (since we can't actually test browser localStorage in Node.js)
    const token = loginResponse.data.data.token;
    if (token && typeof token === 'string' && token.length > 20) {
      logTest('JWT Ready for localStorage', true, 'Token format suitable for localStorage storage');
    } else {
      logTest('JWT Ready for localStorage', false, 'Token not suitable for storage');
    }

    // Simulate job board redirect check (verify we have necessary data)
    if (loginResponse.data.data.user && loginResponse.data.data.token) {
      logTest('Redirect Data Available', true, 'All data needed for job board redirect present');
    } else {
      logTest('Redirect Data Available', false, 'Missing data for job board redirect');
    }

    log(`\n✅ Login Test Summary:`, 'green');
    log(`   • User: ${testUser.email}`, 'cyan');
    log(`   • Status: Login Successful`, 'cyan');
    log(`   • JWT: Generated and secure`, 'cyan');
    log(`   • Ready for: Job board redirect`, 'cyan');

    return { success: true };

  } catch (error) {
    logTest('Login Test - Network/Server Error', false, 
      `Login test failed: ${error.response ? 
        `${error.response.status} - ${error.response.data?.message || error.message}` : 
        error.message}`);
    return { success: false, error: error.message };
  }
}

// GitIgnore Security Validation
async function validateGitIgnoreFiles() {
  log('\n🔒 GitIgnore Security Validation', 'blue');
  log('   Action: Verify .gitignore files prevent sensitive data exposure', 'dim');
  log('   Expected: All sensitive patterns properly ignored\n', 'dim');

  const fs = require('fs');
  const path = require('path');

  const gitignoreChecks = [
    {
      file: '.gitignore',
      path: path.join(process.cwd(), '.gitignore'),
      required: ['.env', 'node_modules', '*.sqlite', '*.db', '*.log']
    },
    {
      file: 'client/.gitignore', 
      path: path.join(process.cwd(), 'client', '.gitignore'),
      required: ['node_modules', 'dist', '*.local', '.env']
    },
    {
      file: 'server/.gitignore',
      path: path.join(process.cwd(), 'server', '.gitignore'), 
      required: ['.env', 'node_modules', '*.sqlite', '*.db', '*.log']
    }
  ];

  let allChecksPass = true;

  for (const check of gitignoreChecks) {
    try {
      if (fs.existsSync(check.path)) {
        const content = fs.readFileSync(check.path, 'utf8');
        
        logTest(`GitIgnore File Exists: ${check.file}`, true, 'File found');
        
        let allPatternsFound = true;
        for (const pattern of check.required) {
          if (content.includes(pattern)) {
            logTest(`Security Pattern: ${pattern}`, true, `Found in ${check.file}`);
          } else {
            logTest(`Security Pattern: ${pattern}`, false, `Missing from ${check.file}`);
            allPatternsFound = false;
            allChecksPass = false;
          }
        }

      } else {
        logTest(`GitIgnore File Exists: ${check.file}`, false, 'File not found');
        allChecksPass = false;
      }
    } catch (error) {
      logTest(`GitIgnore Check: ${check.file}`, false, `Error reading file: ${error.message}`);
      allChecksPass = false;
    }
  }

  return { success: allChecksPass };
}

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

  log(`${colors.bold}📋 PHASE 2: SECURITY VALIDATION${colors.reset}`, 'blue');
  
  // Security Check: GitIgnore Files
  const gitignoreResult = await validateGitIgnoreFiles();

  log(`${colors.bold}📋 PHASE 3: REGISTRATION TEST CASES${colors.reset}`, 'blue');
  
  // Test Case 1: Registration Success
  const registrationResult = await testRegistrationSuccess();
  
  // Test Case 2: Duplicate Email Prevention  
  const duplicateEmailResult = await testRegistrationDuplicateEmail();
  
  // Test Case 3: Invalid Input Validation
  const invalidInputResult = await testRegistrationInvalidInput();

  log(`${colors.bold}🔐 PHASE 4: AUTHENTICATION TEST CASES${colors.reset}`, 'blue');
  
  // Test Case 4: Login Success
  const loginResult = await testLoginSuccess();

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
  log(`${gitignoreResult.success ? '✅' : '❌'} GitIgnore Security: ${gitignoreResult.success ? 'PASSED' : 'FAILED'}`);
  log(`${registrationResult.success ? '✅' : '❌'} Registration Success: ${registrationResult.success ? 'PASSED' : 'FAILED'}`);
  log(`${duplicateEmailResult.success ? '✅' : '❌'} Duplicate Email Prevention: ${duplicateEmailResult.success ? 'PASSED' : 'FAILED'}`);
  log(`${invalidInputResult.success ? '✅' : '❌'} Invalid Input Validation: ${invalidInputResult.success ? 'PASSED' : 'FAILED'} (${invalidInputResult.testsPassed || 0}/${invalidInputResult.testsRun || 0} sub-tests)`);
  log(`${loginResult.success ? '✅' : '❌'} Login Success: ${loginResult.success ? 'PASSED' : 'FAILED'}`);
  
  if (testResults.failed === 0) {
    log(`\n${colors.bold}${colors.green}🎉 ALL TESTS PASSED! (${successRate}%)${colors.reset}`);
    log(`${colors.green}✅ GitIgnore security is PROPERLY CONFIGURED!${colors.reset}`);
    log(`${colors.green}✅ Registration functionality is PRODUCTION READY!${colors.reset}`);
    log(`${colors.green}✅ Login authentication is WORKING PERFECTLY!${colors.reset}`);
    log(`${colors.green}✅ Security measures are PROPERLY IMPLEMENTED!${colors.reset}`);
    log(`${colors.green}✅ Error handling is WORKING CORRECTLY!${colors.reset}`);
    log(`${colors.cyan}🚀 Ready for deployment to Railway and Vercel!${colors.reset}`);
  } else {
    log(`\n${colors.bold}${colors.red}❌ TESTS FAILED! (${successRate}% success rate)${colors.reset}`);
    log(`${colors.red}Application functionality has CRITICAL ISSUES that must be fixed!${colors.reset}`);
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
  testRegistrationDuplicateEmail,
  testRegistrationInvalidInput,
  testLoginSuccess,
  validateGitIgnoreFiles
};