const axios = require('axios');

async function testAgra() {
  console.log("Testing search for Agra...");
  try {
    const response = await axios.post('http://localhost:5000/api/trips/search', {
      destination: 'Agra'
    });
    console.log('✅ Success:', response.data.destination.name, 'with', response.data.places.length, 'places.');
  } catch (error) {
    console.error('❌ Failed:', error.response?.status, error.response?.data);
    if (!error.response) console.error('Error:', error.message);
  }
}

testAgra();
