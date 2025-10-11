const axios = require('axios');

async function testStatusValidation() {
  try {
    // First, create a user and get a token
    const registrationResponse = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'Status Test User',
      email: `status_test_${Date.now()}@email.com`,
      password: 'testpassword123'
    });

    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: registrationResponse.data.data.user.email,
      password: 'testpassword123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Got authentication token');

    // Test invalid status
    try {
      const invalidStatusResponse = await axios.post('http://localhost:3000/api/jobs', {
        title: 'Test Job',
        company: 'Test Company',
        location: 'Test Location',
        status: 'invalid_status'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Invalid status was incorrectly accepted:', invalidStatusResponse.status);
      console.log('   Job created with status:', invalidStatusResponse.data?.status);
    } catch (error) {
      console.log('✅ Invalid status correctly rejected:', error.response?.status, error.response?.data?.message);
    }

    // Test valid statuses
    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
    for (const status of validStatuses) {
      try {
        const validStatusResponse = await axios.post('http://localhost:3000/api/jobs', {
          title: `Test Job ${status}`,
          company: 'Test Company',
          location: 'Test Location',
          status: status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Valid status '${status}' accepted:`, validStatusResponse.status);
      } catch (error) {
        console.log(`❌ Valid status '${status}' incorrectly rejected:`, error.response?.status);
      }
    }

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
}

testStatusValidation();