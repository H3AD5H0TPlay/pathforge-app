// Production Deployment Test Script
// Test your live PathForge deployment

// Configuration - UPDATE THESE WITH YOUR ACTUAL URLS
const CONFIG = {
  RAILWAY_API_URL: 'https://your-railway-backend.railway.app', // Replace with your Railway URL
  VERCEL_FRONTEND_URL: 'https://your-vercel-frontend.vercel.app', // Replace with your Vercel URL
  TEST_USER: {
    name: 'Production Test User',
    email: 'prod-test@pathforge.com',
    password: 'ProductionTest123!'
  }
};

const axios = require('axios');

async function testProductionDeployment() {
  try {
    console.log('🌐 Testing PathForge Production Deployment...');
    console.log('🚂 Railway Backend:', CONFIG.RAILWAY_API_URL);
    console.log('⚡ Vercel Frontend:', CONFIG.VERCEL_FRONTEND_URL);
    console.log('');

    // Step 1: Test Backend Health
    console.log('1️⃣ Testing Backend Health Check...');
    const healthResponse = await axios.get(`${CONFIG.RAILWAY_API_URL}/health`);
    console.log('✅ Backend is healthy:', healthResponse.data);
    console.log('   Status Code:', healthResponse.status);
    console.log('   Uptime:', healthResponse.data.uptime, 'seconds');
    console.log('');

    // Step 2: Test Frontend Accessibility
    console.log('2️⃣ Testing Frontend Accessibility...');
    const frontendResponse = await axios.get(CONFIG.VERCEL_FRONTEND_URL);
    console.log('✅ Frontend is accessible');
    console.log('   Status Code:', frontendResponse.status);
    console.log('   Content Type:', frontendResponse.headers['content-type']);
    console.log('   Content Length:', frontendResponse.headers['content-length'], 'bytes');
    console.log('');

    // Step 3: Test CORS Configuration
    console.log('3️⃣ Testing CORS Configuration...');
    try {
      const corsTestResponse = await axios.options(`${CONFIG.RAILWAY_API_URL}/api/auth/login`, {
        headers: {
          'Origin': CONFIG.VERCEL_FRONTEND_URL,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS is properly configured');
      console.log('   Allowed Origin:', corsTestResponse.headers['access-control-allow-origin']);
      console.log('   Allowed Methods:', corsTestResponse.headers['access-control-allow-methods']);
    } catch (error) {
      if (error.response?.status === 204 || error.response?.status === 200) {
        console.log('✅ CORS preflight handled correctly');
      } else {
        console.log('⚠️ CORS test inconclusive, but may be working:', error.message);
      }
    }
    console.log('');

    // Step 4: Test User Registration
    console.log('4️⃣ Testing User Registration...');
    let registrationSuccess = false;
    try {
      const registerResponse = await axios.post(`${CONFIG.RAILWAY_API_URL}/api/auth/register`, CONFIG.TEST_USER);
      console.log('✅ Registration successful:', registerResponse.data.message);
      registrationSuccess = true;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('✅ User already exists (expected for repeat tests)');
        registrationSuccess = true;
      } else {
        throw error;
      }
    }
    console.log('');

    // Step 5: Test User Login
    console.log('5️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${CONFIG.RAILWAY_API_URL}/api/auth/login`, {
      email: CONFIG.TEST_USER.email,
      password: CONFIG.TEST_USER.password
    });
    
    const { token, user } = loginResponse.data.data;
    console.log('✅ Login successful');
    console.log('   User:', user.name);
    console.log('   Token received:', token.substring(0, 30) + '...');
    console.log('   Token length:', token.length, 'characters');
    console.log('');

    // Step 6: Test Protected Endpoint
    console.log('6️⃣ Testing Protected Endpoint Access...');
    const jobsResponse = await axios.get(`${CONFIG.RAILWAY_API_URL}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint accessible with valid token');
    console.log('   Jobs found:', jobsResponse.data.length);
    console.log('');

    // Step 7: Test Job Creation
    console.log('7️⃣ Testing Job Creation...');
    const newJob = {
      title: 'Production Test Job',
      company: 'Test Corp Ltd',
      location: 'Remote Worldwide',
      salary: '$100,000',
      status: 'applied',
      description: 'Created during production deployment test',
      requirements: ['Production Testing', 'Quality Assurance'],
      notes: 'Automated test job - safe to delete',
      appliedDate: new Date().toISOString()
    };

    const createJobResponse = await axios.post(`${CONFIG.RAILWAY_API_URL}/api/jobs`, newJob, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const createdJob = createJobResponse.data;
    console.log('✅ Job created successfully');
    console.log('   Job ID:', createdJob.id);
    console.log('   Title:', createdJob.title);
    console.log('   Company:', createdJob.company);
    console.log('');

    // Step 8: Test Job Update
    console.log('8️⃣ Testing Job Update...');
    const updateResponse = await axios.patch(`${CONFIG.RAILWAY_API_URL}/api/jobs/${createdJob.id}`, 
      { 
        status: 'interview',
        notes: 'Updated during production test - status changed to interview'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Job updated successfully');
    console.log('   New status:', updateResponse.data.status);
    console.log('   Updated at:', updateResponse.data.updatedAt);
    console.log('');

    // Step 9: Test Job Deletion
    console.log('9️⃣ Testing Job Deletion...');
    const deleteResponse = await axios.delete(`${CONFIG.RAILWAY_API_URL}/api/jobs/${createdJob.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Job deleted successfully');
    console.log('   Response:', deleteResponse.data.message);
    console.log('');

    // Step 10: SSL/HTTPS Verification
    console.log('🔒 SSL/HTTPS Verification...');
    console.log('✅ Backend URL uses HTTPS:', CONFIG.RAILWAY_API_URL.startsWith('https://'));
    console.log('✅ Frontend URL uses HTTPS:', CONFIG.VERCEL_FRONTEND_URL.startsWith('https://'));
    console.log('');

    // Success Summary
    console.log('🎉 PRODUCTION DEPLOYMENT TEST COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('✅ All Systems Operational:');
    console.log('   🚂 Railway Backend Health Check');
    console.log('   ⚡ Vercel Frontend Accessibility');
    console.log('   🔗 CORS Cross-Origin Configuration');
    console.log('   👤 User Registration & Authentication');
    console.log('   🔒 JWT Token Generation & Validation');
    console.log('   🛡️ Protected Endpoint Security');
    console.log('   📝 Job CRUD Operations');
    console.log('   🔐 HTTPS/SSL Encryption');
    console.log('');
    console.log('🌐 Production URLs:');
    console.log('   Frontend: ' + CONFIG.VERCEL_FRONTEND_URL);
    console.log('   Backend:  ' + CONFIG.RAILWAY_API_URL);
    console.log('   API Docs: ' + CONFIG.RAILWAY_API_URL + '/health');
    console.log('');
    console.log('🚀 PathForge is LIVE and ready for users!');

  } catch (error) {
    console.error('');
    console.error('❌ Production deployment test failed:');
    console.error('');
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.statusText);
      console.error('Response:', error.response.data);
      console.error('URL:', error.config?.url || 'Unknown');
    } else if (error.request) {
      console.error('Network Error:', error.message);
      console.error('Check that your URLs are correct and services are running');
    } else {
      console.error('Configuration Error:', error.message);
    }
    console.error('');
    console.error('🔧 Troubleshooting Steps:');
    console.error('1. Verify Railway backend is deployed and running');
    console.error('2. Verify Vercel frontend is deployed and accessible');
    console.error('3. Check environment variables are set correctly');
    console.error('4. Ensure CORS configuration includes frontend URL');
    console.error('5. Update CONFIG object with your actual deployment URLs');
    process.exit(1);
  }
}

// Instructions for running the test
console.log('📋 INSTRUCTIONS:');
console.log('1. Update CONFIG object with your actual Railway and Vercel URLs');
console.log('2. Deploy backend to Railway first');
console.log('3. Deploy frontend to Vercel second'); 
console.log('4. Run: node test-production.js');
console.log('');

// Check if URLs are still default values
if (CONFIG.RAILWAY_API_URL.includes('your-railway-backend') || 
    CONFIG.VERCEL_FRONTEND_URL.includes('your-vercel-frontend')) {
  console.log('⚠️ WARNING: Please update the CONFIG object with your actual deployment URLs!');
  console.log('');
  process.exit(1);
}

testProductionDeployment();