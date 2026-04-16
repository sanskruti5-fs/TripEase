async function getPlaces(city) {
    try {
        // 1. Get coordinates for the city
        const cityRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(city)}&format=json`);
        const cityData = await cityRes.json();
        const pages = cityData.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === '-1' || !pages[pageId].coordinates) {
            console.log("City not found or no coordinates for", city);
            return;
        }
        
        const { lat, lon } = pages[pageId].coordinates[0];
        console.log(`Coordinates for ${city}: ${lat}, ${lon}`);
        
        // 2. Get places near the city (tourist attractions, landmarks)
        const geoRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=10&format=json`);
        const geoData = await geoRes.json();
        const places = geoData.query.geosearch;
        
        if (!places || places.length === 0) {
            console.log("No places found for", city);
            return;
        }
        
        // Filter out places that are just the city itself or irrelevant
        const titles = places.map(p => p.title).filter(t => t !== city).slice(0, 5);
        if (titles.length === 0) return;
        
        const titlesParam = titles.map(encodeURIComponent).join('|');
        
        // 3. Get images and details for these places
        const detailsRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&exchars=150&titles=${titlesParam}&format=json&pithumbsize=800`);
        const detailsData = await detailsRes.json();
        
        const detailPages = detailsData.query.pages;
        const results = Object.values(detailPages).map(p => ({
            name: p.title,
            description: p.extract || 'A famous landmark.',
            image: p.thumbnail ? p.thumbnail.source : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
            rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1) // mock rating between 4.0 and 5.0
        }));
        
        console.log(`Places for ${city}:`);
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

getPlaces('Paris').then(() => getPlaces('Tokyo'));
