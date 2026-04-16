async function testHotels() {
    try {
        const response = await fetch('http://localhost:5000/api/destinations/Paris/accommodations');
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.length > 0) {
            console.log("Hotels:", data.map(h => h.name));
        } else {
            console.log("No hotels returned or error.");
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
testHotels();
