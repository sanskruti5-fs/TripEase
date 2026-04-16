const axios = require('axios');

async function testCity(city) {
  console.log(`Testing search for "${city}"...`);
  try {
    const response = await axios.post('http://localhost:5000/api/trips/search', {
      destination: city
    });
    console.log(`✅ "${city}" RESULT: Found ${response.data.places.length} places.`);
    if (response.data.places.length > 0) {
        console.log('Sample place:', response.data.places[0].place_name);
    } else {
        console.log('❌ NO PLACES FOUND.');
    }
  } catch (error) {
    console.error(`❌ "${city}" ERROR:`, error.response?.status, error.response?.data);
  }
}

async function runTests() {
    await testCity('london');
    await testCity('paris');
    await testCity('banglore');
}

runTests();
