async function testAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/destinations/Paris');
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
testAPI();
