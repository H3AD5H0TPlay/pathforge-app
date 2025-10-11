const axios = require('axios');

async function testValidation() {
  try {
    // First, create a user and get a token
    const registrationResponse = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'Test User',
      email: `test_${Date.now()}@email.com`,
      password: 'testpassword123'
    });

    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: registrationResponse.data.data.user.email,
      password: 'testpassword123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Got authentication token');

    // Test empty job submission
    try {
      const emptyJobResponse = await axios.post('http://localhost:3000/api/jobs', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Empty job was incorrectly accepted:', emptyJobResponse.status);
    } catch (error) {
      console.log('✅ Empty job correctly rejected:', error.response?.status, error.response?.data?.message);
    }

    // Test missing title
    try {
      const missingTitleResponse = await axios.post('http://localhost:3000/api/jobs', {
        company: 'Test Company',
        location: 'Test Location'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Missing title was incorrectly accepted:', missingTitleResponse.status);
    } catch (error) {
      console.log('✅ Missing title correctly rejected:', error.response?.status, error.response?.data?.message);
    }

    // Test valid job
    try {
      const validJobResponse = await axios.post('http://localhost:3000/api/jobs', {
        title: 'Valid Job Title',
        company: 'Valid Company',
        location: 'Valid Location'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Valid job correctly accepted:', validJobResponse.status);
    } catch (error) {
      console.log('❌ Valid job incorrectly rejected:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
}

testValidation();