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

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const destName = planInfo.destination;
    const tripType = planInfo.tripType || 'relaxation'; // fallback
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            setPlaces([]);
            setSelectedPlaces([]);
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/trips/places/map-points?destination=${encodeURIComponent(destName)}`);
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
                plan: { ...planInfo, selectedPlaces }
            }
        });
    };

    return (
        <div style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Dynamic Destination Hero Image */}
            <div style={{
                position: 'relative',
                height: '400px',
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
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.5)', margin: 0 }}>
                        Must-Visit Spots in {destName}
                    </h1>
                    <p style={{ color: '#E0E0E0', fontSize: '1.2rem', marginTop: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Select the top attractions you'd love to explore.
                    </p>
                </div>
            </div>

            <div className="container">

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{
                        width: '50px', height: '50px', 
                        border: '4px solid var(--border-color)', 
                        borderTopColor: 'var(--primary-color)', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <h3 style={{ color: 'var(--text-light)' }}>Discovering places in {destName}...</h3>
                </div>
            ) : error || !places || places.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
                    <h3>We couldn't find any specific places for {destName}.</h3>
                    <p>But don't worry, you can still continue planning your trip!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '32px',
                    marginBottom: '64px'
                }}>
                    {places.map((place, idx) => {
                        const isSelected = selectedPlaces.includes(place.id);

                    return (
                        <motion.div
                            key={place.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            className="glass-panel"
                            style={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                boxShadow: isSelected ? '0 0 20px rgba(255,56,92,0.2)' : 'var(--shadow-md)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'var(--surface-color)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ height: '220px', width: '100%' }}>
                                <ImageWithSkeleton
                                    src={place.image}
                                    alt={place.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '700', lineHeight: '1.3' }}>{place.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '4px' }}>
                                            <MapPin size={14} color="var(--primary-color)" /> {place.address}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                                        <Star size={14} fill="currentColor" /> {place.rating}
                                    </div>
                                </div>

                                {/* Suitability Badge */}
                                <div style={{ marginBottom: '16px' }}>
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '600', 
                                        textTransform: 'uppercase',
                                        backgroundColor: 'rgba(255, 56, 92, 0.1)',
                                        color: 'var(--primary-color)',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Suitable for: {place.suitability}
                                    </span>
                                </div>

                                {/* Dynamic Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                        <Clock size={16} color="var(--primary-color)"/>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.bestTime}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                        <Wallet size={16} color="#10B981" />
                                        <span>{place.budget}</span>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-light)', marginBottom: '24px', flex: 1, lineHeight: '1.6', fontSize: '0.95rem' }}>{place.description}</p>

                                <button
                                    onClick={() => togglePlace(place.id)}
                                    className={isSelected ? "btn-secondary-custom" : "btn-primary-custom"}
                                    style={{ width: '100%' }}
                                >
                                    {isSelected ? 'Selected' : 'Select Place'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                </div>
            )}

            {/* Floating Action Bar */}
            <div className="glass-panel" style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                padding: '20px 0',
                borderTop: '1px solid var(--border-color)',
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: '600' }}>{selectedPlaces.length}</span> places selected
                    </div>
                    <button
                        className="btn-primary-custom"
                        onClick={handleNext}
                        disabled={selectedPlaces.length === 0}
                        style={{ opacity: selectedPlaces.length === 0 ? 0.5 : 1, cursor: selectedPlaces.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        Continue Planning
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default SuggestedPlaces;
