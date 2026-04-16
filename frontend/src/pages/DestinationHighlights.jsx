import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import itineraryData from '../data/itineraryData.json';
import './DestinationHighlights.css';

const DestinationHighlights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedAttractions, setSelectedAttractions] = React.useState([]);
  const [selectedFoods, setSelectedFoods] = React.useState([]);
  const [selectedMarkets, setSelectedMarkets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [apiData, setApiData] = React.useState(null);

  // Extract destination from location state or fallback
  const destinationCity = location.state?.plan?.destination || "Goa";
  
  // 1. Try to find the city data in our JSON
  const hardcodedData = itineraryData.destinations && (
    itineraryData.destinations[destinationCity] || 
    itineraryData.destinations[destinationCity.charAt(0).toUpperCase() + destinationCity.slice(1).toLowerCase()] ||
    itineraryData.destinations[Object.keys(itineraryData.destinations).find(k => k.toLowerCase() === destinationCity.toLowerCase())]
  );

  React.useEffect(() => {
    // 2. If NOT in hardcoded JSON, fetch from API
    if (!hardcodedData && !apiData) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:5000/api/trips/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destination: destinationCity })
          });
          const data = await response.json();
          
          if (data.places && data.places.length > 0) {
            console.log(`Mapping ${data.places.length} places for ${destinationCity}`);
            const formatted = {
              places: data.places
                .filter(p => !['food', 'market', 'hotel'].includes(p.category?.toLowerCase()))
                .map(p => ({
                  id: p.id,
                  name: p.place_name || p.name,
                  category: (p.category || 'Attraction').charAt(0).toUpperCase() + (p.category || 'Attraction').slice(1),
                  entryFee: 0,
                  description: p.description || `Visit the beautiful ${p.place_name || p.name} in ${destinationCity}.`,
                  image: p.image_url || `https://loremflickr.com/800/600/${encodeURIComponent(destinationCity)},landmark/all?lock=${p.id}`
                })),
              food: data.places
                .filter(p => p.category?.toLowerCase() === 'food')
                .map(p => ({
                  id: p.id,
                  name: (p.place_name || p.name).split('@')[0].trim(),
                  price: 350,
                  restaurant: (p.place_name || p.name).split('@')[1]?.trim() || 'Local Favorite',
                  description: p.description || 'Famous local delicacy you cannot miss.',
                  image: p.image_url || `https://loremflickr.com/800/600/food,${encodeURIComponent(destinationCity)}/all?lock=${p.id}`
                })),
              markets: data.places
                .filter(p => p.category?.toLowerCase() === 'market')
                .map(p => ({
                  id: p.id,
                  name: p.place_name || p.name,
                  specialty: 'Local shopping, souvenirs, and street culture.',
                  image: p.image_url || `https://loremflickr.com/800/600/market,shopping/all?lock=${p.id}`
                }))
            };
            setApiData(formatted);
          }
        } catch (err) {
          console.error('API Fetch failed:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [destinationCity, hardcodedData, apiData]);

  const toggleAttraction = (place) => {
    setSelectedAttractions(prev => 
      prev.some(p => p.name === place.name) ? prev.filter(p => p.name !== place.name) : [...prev, place]
    );
  };

  const toggleFood = (dish) => {
    setSelectedFoods(prev => 
      prev.some(d => d.name === dish.name) ? prev.filter(d => d.name !== dish.name) : [...prev, dish]
    );
  };

  const toggleMarket = (market) => {
    setSelectedMarkets(prev => 
      prev.some(m => m.name === market.name) ? prev.filter(m => m.name !== market.name) : [...prev, market]
    );
  };
  
  const cityData = hardcodedData || apiData;

  // 4. Loading State
  if (loading) {
    return (
      <div className="destination-highlights" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
         <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #FF4D6D', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
         <h2 style={{ color: '#555' }}>Curating best spots for {destinationCity}...</h2>
      </div>
    );
  }

  // 5. The Graceful Fallback
  if (!cityData && !loading) {
    return (
      <div className="destination-highlights" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#222' }}>Destination Not Found</h1>
        <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', marginBottom: '30px' }}>
          We could not resolve details for <strong>{destinationCity}</strong>. Please check the spelling or select a popular destination.
        </p>
        <button 
          className="btn-solid" 
          style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '30px' }}
          onClick={() => navigate('/planner')}
        >
          Go Back to Planner
        </button>
      </div>
    );
  }

  // 3. Hydrate Destination Highlights Page
  const { places = [], food: foods = [], markets = [] } = cityData || {};

  return (
    <div className="destination-highlights">
      <div className="destination-header">
        <h1>{destinationCity} Highlights</h1>
        <p>Discover the best places to visit, eat, and shop in {destinationCity}</p>
        {hardcodedData ? (
            <span style={{ fontSize: '0.8rem', background: '#e1f5fe', color: '#01579b', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' }}>✓ Hand-Curated Experience</span>
        ) : (
            <span style={{ fontSize: '0.8rem', background: '#fff9c4', color: '#f57f17', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' }}>⚡ Real-time Smart Data</span>
        )}
      </div>

      {/* SECTION 1: Must Visit Places */}
      <div className="section-container">
        <h2 className="section-title">Must-See Attractions</h2>
        <div className="attractions-carousel">
          {places.length > 0 ? places.map((place, idx) => (
            <div className="attraction-card" key={place.id || idx}>
              <div className="card-img-container">
                {place.image ? (
                  <img src={place.image} alt={place.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="card-img-placeholder">Image Unavailable</div>
                )}
              </div>
              <div className="card-content">
                <span className="category-badge">{place.category}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ marginBottom: 0 }}>{place.name}</h3>
                  {place.entryFee !== undefined && (
                    <div style={{ fontWeight: '700', color: '#FF4D6D', fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: '12px', background: '#fff0f3', padding: '4px 10px', borderRadius: '12px' }}>
                      {place.entryFee === 0 ? 'Free Entry' : `₹ ${place.entryFee}`}
                    </div>
                  )}
                </div>
                <p className="card-desc">{place.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                   <input type="checkbox" id={`toggle-${place.id || idx}`} checked={selectedAttractions.some(p => p.name === place.name)} onChange={() => toggleAttraction(place)} style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}/>
                   <label htmlFor={`toggle-${place.id || idx}`} style={{ fontWeight: '600', color: '#222', fontSize: '0.95rem', cursor: 'pointer' }}>Add to Itinerary</label>
                </div>
              </div>
            </div>
          )) : <p style={{ color: '#888', textAlign: 'center', width: '100%' }}>No attractions available for this city yet.</p>}
        </div>
      </div>

      {/* SECTION 2: Foods */}
      <div className="section-container">
        <h2 className="section-title">Dishes You Must Try</h2>
        <div className="dishes-grid">
          {foods.length > 0 ? foods.map((dish, idx) => (
            <div className="dish-card" key={dish.id || idx}>
              <div className="card-img-container">
                <img src={dish.image || "https://placehold.co/600x400/f0f0f0/333?text=Dish"} alt={dish.name} loading="lazy" />
              </div>
              <div className="card-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ marginBottom: 0 }}>{dish.name}</h3>
                  {dish.price !== undefined && (
                    <div style={{ fontWeight: '700', color: '#FF4D6D', fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: '12px', background: '#fff0f3', padding: '4px 10px', borderRadius: '12px' }}>
                      ₹ {dish.price}
                    </div>
                  )}
                </div>
                <p className="card-desc" style={{ flexGrow: 1 }}>{dish.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                   <input type="checkbox" id={`toggle-food-${dish.id || idx}`} checked={selectedFoods.some(d => d.name === dish.name)} onChange={() => toggleFood(dish)} style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}/>
                   <label htmlFor={`toggle-food-${dish.id || idx}`} style={{ fontWeight: '600', color: '#222', fontSize: '0.95rem', cursor: 'pointer' }}>Try this dish</label>
                </div>
                <button className="btn-solid btn-outline" style={{ marginTop: 'auto' }}>
                  Try at {dish.restaurant || 'Local Restaurants'}
                </button>
              </div>
            </div>
          )) : <p style={{ color: '#888', textAlign: 'center', width: '100%' }}>Local food exploration unavailable for now.</p>}
        </div>
      </div>

      {/* SECTION 3: Famous Markets */}
      {markets && markets.length > 0 && (
        <div className="section-container" style={{ marginBottom: '80px' }}>
          <h2 className="section-title">Shop Like a Local</h2>
          <div className="markets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {markets.map((market, idx) => (
              <div className="market-card" key={market.id || idx}>
                <div className="market-img-container" style={{ width: '40%', minWidth: '150px' }}>
                  <img src={market.image || "https://placehold.co/600x400/f0f0f0/333?text=Market"} alt={market.name} loading="lazy" style={{ objectFit: 'cover' }} />
                </div>
                <div className="market-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '60%' }}>
                  <h3 className="card-title">{market.name}</h3>
                  <div className="market-badge" style={{ backgroundColor: '#fff0f3', color: '#FF4D6D', padding: '8px 16px', borderRadius: '20px', fontSize: '1rem', fontWeight: '800', marginTop: '12px', border: '1px solid #FF4D6D', marginBottom: '16px' }}>
                    Famous for: {market.specialty}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: 'auto' }}>
                     <input type="checkbox" id={`toggle-market-${market.id || idx}`} checked={selectedMarkets.some(m => m.name === market.name)} onChange={() => toggleMarket(market)} style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}/>
                     <label htmlFor={`toggle-market-${market.id || idx}`} style={{ fontWeight: '600', color: '#222', fontSize: '0.95rem', cursor: 'pointer' }}>Add to Itinerary</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="sticky-footer">
        <button 
          className="btn-solid btn-next-step"
          onClick={() => navigate('/guides', { state: { plan: location.state?.plan, selectedAttractions, selectedFoods, selectedMarkets } })}
        >
          Next Step: Local Guides
        </button>
      </div>
    </div>
  );
};

export default DestinationHighlights;
