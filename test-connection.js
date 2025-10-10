// Test script to verify client-server connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
  try {
    console.log('🔍 Testing PathForge Client-Server Connection...\n');

    // Test 1: Backend Health Check
    console.log('1️⃣ Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Backend is healthy:', healthResponse.data);

    // Test 2: User Registration
    console.log('\n2️⃣ Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Connection Test User',
        email: 'connection-test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Registration successful:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ User already exists (expected)');
      } else {
        throw error;
      }
    }

    // Test 3: User Login
    console.log('\n3️⃣ Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'connection-test@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    
    const token = loginResponse.data.data.token;
    console.log('🎫 Token received:', token.substring(0, 20) + '...');

    // Test 4: Fetch Jobs (Empty List Expected)
    console.log('\n4️⃣ Testing jobs API...');
    const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Jobs fetched successfully:', jobsResponse.data.length, 'jobs found');

    // Test 5: Create a Test Job
    console.log('\n5️⃣ Testing job creation...');
    const newJobResponse = await axios.post(`${API_BASE_URL}/jobs`, {
      title: 'Frontend Developer',
      company: 'Test Company Inc.',
      location: 'Remote',
      salary: '$70,000',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      description: 'Test job for connection verification',
      notes: 'Created by connection test script'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Job created successfully:', newJobResponse.data.title);

    // Test 6: Fetch Jobs Again
    console.log('\n6️⃣ Testing jobs fetch after creation...');
    const updatedJobsResponse = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Jobs fetched successfully:', updatedJobsResponse.data.length, 'jobs found');
    console.log('📋 Jobs:', updatedJobsResponse.data.map(job => `${job.title} at ${job.company} (${job.status})`));

    // Test 7: Update Job Status
    if (updatedJobsResponse.data.length > 0) {
      const jobId = updatedJobsResponse.data[0].id;
      console.log('\n7️⃣ Testing job status update...');
      const updateResponse = await axios.patch(`${API_BASE_URL}/jobs/${jobId}`, {
        status: 'interview'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Job status updated:', updateResponse.data.status);
    }

    console.log('\n🎉 ALL TESTS PASSED! Client-Server connection is working perfectly!');
    console.log('\n🌐 Frontend URL: http://localhost');
    console.log('🚀 Backend API: http://localhost:3000');
    console.log('📊 Health Check: http://localhost:3000/health');

  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testConnection();