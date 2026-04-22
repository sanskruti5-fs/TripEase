import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import itineraryData from '../data/itineraryData.json';
import { useTrip } from '../context/TripContext';
import './DestinationHighlights.css';

const DestinationHighlights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleItem, isSelected, setDays } = useTrip();
  
  const [loading, setLoading] = React.useState(false);
  const [apiData, setApiData] = React.useState(null);

  // Extract destination from location state or fallback
  const planInfo = location.state?.plan;
  const destinationCity = planInfo?.destination || "Goa";
  
  useEffect(() => {
    if (planInfo?.days) {
      setDays(planInfo.days);
    }
  }, [planInfo?.days, setDays]);

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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/search`, {
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
                  price: 0, // Using 'price' for consistency in context
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
                  price: 0,
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

  // Asset Resolver for Premium Headers
  const getHeroImage = (city) => {
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    // Try to find a local hero image
    const localHero = `/images/${formattedCity}/hero.png`;
    // Fallback to specific premium ones I generated if they exist
    if (city.toLowerCase() === 'jaipur') return '/images/jaipur/vintage.png';
    if (city.toLowerCase() === 'goa') return '/images/goa/modern.png';
    if (city.toLowerCase() === 'mumbai') return '/images/mumbai/moody.png';
    
    return localHero; // Fallback to folder structure
  };

  const heroImage = getHeroImage(destinationCity);

  return (
    <div className="destination-highlights">
      <div className="premium-hero-container">
        <div 
          className="hero-background" 
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${heroImage}), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')` 
          }}
        />
        <div className="hero-text-overlay">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {destinationCity}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Experience the soul of {destinationCity}
          </motion.p>
          <div className="hero-badges">
            {hardcodedData ? (
                <span className="badge-curated">✓ Hand-Curated Experience</span>
            ) : (
                <span className="badge-smart">⚡ Real-time Smart Data</span>
            )}
          </div>
        </div>
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
                  <div style={{ fontWeight: '700', color: '#FF4D6D', fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: '12px', background: '#fff0f3', padding: '4px 10px', borderRadius: '12px' }}>
                    {(place.price || place.entryFee) === 0 ? 'Free Entry' : `₹ ${place.price || place.entryFee}`}
                  </div>
                </div>
                <p className="card-desc">{place.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                   <input 
                     type="checkbox" 
                     id={`toggle-${place.id || idx}`} 
                     checked={isSelected('places', place)} 
                     onChange={() => toggleItem('places', place)} 
                     style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                   />
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
                  <div style={{ fontWeight: '700', color: '#FF4D6D', fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: '12px', background: '#fff0f3', padding: '4px 10px', borderRadius: '12px' }}>
                    ₹ {dish.price}
                  </div>
                </div>
                <p className="card-desc" style={{ flexGrow: 1 }}>{dish.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                   <input 
                     type="checkbox" 
                     id={`toggle-food-${dish.id || idx}`} 
                     checked={isSelected('food', dish)} 
                     onChange={() => toggleItem('food', dish)} 
                     style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                   />
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
                     <input 
                       type="checkbox" 
                       id={`toggle-market-${market.id || idx}`} 
                       checked={isSelected('market', market)} 
                       onChange={() => toggleItem('market', market)} 
                       style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                     />
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
          onClick={() => navigate('/guides', { state: { ...location.state } })}
        >
          Next Step: Local Guides
        </button>
      </div>
    </div>
  );
};

export default DestinationHighlights;
