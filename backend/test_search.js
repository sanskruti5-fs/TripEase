const axios = require('axios');

async function testSearch() {
  try {
    const response = await axios.post('http://localhost:5000/api/search-destination', {
      destination: 'Goa'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error Status:', error.response?.status);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testSearch();
