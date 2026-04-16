const axios = require('axios');

async function testNominatim() {
  const destination = 'Goa';
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
  console.log('Testing URL:', url);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'TripEase/1.0 (contact@tripease.local)'
      }
    });
    console.log('Nominatim Response:', response.data);
  } catch (error) {
    console.error('Nominatim Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testNominatim();
