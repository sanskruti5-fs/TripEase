import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Wallet, MapPin } from 'lucide-react';

const ImageWithSkeleton = ({ src, alt, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {!loaded && (
                <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
                />
            )}
            <img 
                src={src} 
                alt={alt} 
                onLoad={() => setLoaded(true)}
                style={{ ...props.style, opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }} 
            />
        </div>
    );
};

const SuggestedPlaces = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planInfo = location.state?.plan;

    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const destName = planInfo?.destination || '';

    useEffect(() => {
        if (!destName) return;
        const fetchPlaces = async () => {
            setPlaces([]);
            setSelectedPlaces([]);
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/places/map-points?destination=${encodeURIComponent(destName)}`);
                if (!response.ok) throw new Error('Failed to fetch destination places');
                const data = await response.json();
                
                // Filter for sightseeing/attractions - Widen the net
                const attractionCategories = ['attraction', 'beach', 'gem', 'temple', 'museum', 'historic', 'monument', 'park', 'viewpoint'];
                const filtered = data.points.filter(p => attractionCategories.includes(p.category));
                
                // Map to UI format
                const mapped = filtered.map(p => ({
                    id: p.id,
                    name: p.place_name,
                    description: p.description,
                    rating: p.rating,
                    category: p.category,
                    image: p.image_url || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`,
                    bestTime: p.best_time_to_visit || 'Anytime',
                    budget: p.estimated_budget || 'Varies',
                    address: p.address || destName,
                    suitability: p.suitability || 'General'
                }));

                setPlaces(mapped);
            } catch (err) {
                console.error("Error fetching places:", err);
                setError(err.message);
                setPlaces([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [destName]);

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const togglePlace = (placeId) => {
        setSelectedPlaces(prev =>
            prev.includes(placeId)
                ? prev.filter(id => id !== placeId)
                : [...prev, placeId]
        );
    };

    const handleNext = () => {
        navigate('/food-market', {
            state: {
                plan: { ...planInfo, selectedPlaces, placesCost: totalSelectedCost }
            }
        });
    };

    return (
    // Helper to extract number from price string (e.g., "₹500" -> 500)
    const parsePrice = (priceStr) => {
        if (!priceStr || priceStr === 'Varies' || priceStr === 'Free') return 0;
        const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const totalSelectedCost = selectedPlaces.reduce((acc, id) => {
        const place = places.find(p => p.id === id);
        return acc + parsePrice(place?.budget);
    }, 0);

    return (
        <div style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Dynamic Destination Hero Image */}
            <div style={{
                position: 'relative',
                height: '350px',
                width: '100%',
                marginBottom: '40px',
                overflow: 'hidden'
            }}>
                <ImageWithSkeleton 
                    src={`https://loremflickr.com/1600/600/${encodeURIComponent(destName)},landscape/all`}
                    alt={`${destName} Landscape`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 10,
                    width: '100%'
                }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.5)', margin: 0 }}>
                        Must-Visit Spots in {destName}
                    </h1>
                    <p style={{ color: '#E0E0E0', fontSize: '1.1rem', marginTop: '12px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Select the attractions you'd love to explore.
                    </p>
                </div>
            </div>

            <div className="container" style={{ display: 'flex', gap: '30px', position: 'relative' }}>
                
                {/* Main Content Area */}
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                            <h3 style={{ color: 'var(--text-light)' }}>Discovering places in {destName}...</h3>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px',
                            marginBottom: '64px'
                        }}>
                            {places.map((place, idx) => {
                                const isSelected = selectedPlaces.includes(place.id);
                                return (
                                    <motion.div
                                        key={place.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass-panel"
                                        style={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                            backgroundColor: 'var(--surface-color)',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <div style={{ height: '180px', width: '100%' }}>
                                            <ImageWithSkeleton src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', fontWeight: '700' }}>{place.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    <Wallet size={14} /> {place.budget}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    <Star size={14} fill="currentColor" /> {place.rating}
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>{place.description.substring(0, 80)}...</p>
                                            <button
                                                onClick={() => togglePlace(place.id)}
                                                className={isSelected ? "btn-secondary-custom" : "btn-primary-custom"}
                                                style={{ width: '100%', padding: '10px' }}
                                            >
                                                {isSelected ? 'Remove' : 'Add to Trip'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- LIVE BUDGET SIDEBAR --- */}
                <div style={{
                    width: '320px',
                    position: 'sticky',
                    top: '100px',
                    height: 'fit-content',
                    display: window.innerWidth > 1000 ? 'block' : 'none'
                }}>
                    <div className="glass-panel" style={{
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid var(--primary-color)',
                        boxShadow: '0 10px 30px rgba(255, 56, 92, 0.1)'
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <Wallet color="var(--primary-color)" /> Trip Budget
                        </h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Your Budget:</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{planInfo.budget.toLocaleString()}</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>🏨 Stay:</span>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>₹{(planInfo.stayCost || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>🏛️ Places:</span>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>₹{totalSelectedCost.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Total So Far:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{( (planInfo.stayCost || 0) + totalSelectedCost).toLocaleString()}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                    width: `${Math.min(100, (((planInfo.stayCost || 0) + totalSelectedCost) / planInfo.budget) * 100)}%`, 
                                    height: '100%', 
                                    background: 'var(--primary-color)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Remaining:</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: planInfo.budget - (planInfo.stayCost || 0) - totalSelectedCost < 0 ? '#ef4444' : '#10B981' }}>
                                        ₹{(planInfo.budget - (planInfo.stayCost || 0) - totalSelectedCost).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    className="btn-primary-custom"
                                    onClick={handleNext}
                                    disabled={selectedPlaces.length === 0}
                                    style={{ padding: '10px 20px', borderRadius: '12px' }}
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Bottom Bar */}
            <div className="glass-panel" style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                padding: '15px 20px',
                borderTop: '1px solid var(--border-color)',
                zIndex: 100,
                display: window.innerWidth <= 1000 ? 'flex' : 'none',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Total Cost:</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{((planInfo.stayCost || 0) + totalSelectedCost).toLocaleString()}</div>
                </div>
                <button
                    className="btn-primary-custom"
                    onClick={handleNext}
                    disabled={selectedPlaces.length === 0}
                    style={{ padding: '10px 25px' }}
                >
                    Next Step
                </button>
            </div>
        </div>
    );
};
    );
};

export default SuggestedPlaces;
