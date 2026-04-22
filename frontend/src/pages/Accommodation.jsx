import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Building, Home, Tent, CheckCircle } from 'lucide-react';
import { useTrip } from '../context/TripContext';

const accommodations = [
    { id: 'a1', type: 'hotel', name: 'Grand Horizon Resort', pricePerNight: 4500, rating: 4.8, distance: '1.2 km from center', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
    { id: 'a2', type: 'hotel', name: 'City Center Inn', pricePerNight: 2500, rating: 4.2, distance: '0.5 km from center', image: 'https://images.unsplash.com/photo-1551882547-ff40c0d589rx?auto=format&fit=crop&w=400&q=80' },
    { id: 'a3', type: 'homestay', name: 'Cozy Family Heritage', pricePerNight: 1800, rating: 4.9, distance: '3.0 km from center', image: 'https://images.unsplash.com/photo-1502672260266-1c1e52bf0ca2?auto=format&fit=crop&w=400&q=80' },
    { id: 'a4', type: 'hostel', name: 'Backpackers Paradise', pricePerNight: 800, rating: 4.5, distance: '2.5 km from center', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80' },
    { id: 'a5', type: 'homestay', name: 'Riverside Villa', pricePerNight: 3200, rating: 4.7, distance: '5.0 km from center', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80' },
    { id: 'a6', type: 'hostel', name: 'Wanderlust Dorms', pricePerNight: 600, rating: 4.1, distance: '1.0 km from center', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80' }
];

const Accommodation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toggleItem, isSelected, tripCostData } = useTrip();
    const planInfo = location.state?.plan;

    const [activeTab, setActiveTab] = useState('all');
    const [accommodationsData, setAccommodationsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const destName = planInfo?.destination || '';

    useEffect(() => {
        if (!destName) return;
        const fetchAccommodations = async () => {
            setAccommodationsData([]);
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/places/category?destination=${encodeURIComponent(destName)}&category=hotel`);
                if (!response.ok) throw new Error('Failed to fetch real-time accommodations');
                const data = await response.json();
                
                const mapped = data.map(item => ({
                    id: item.id || `h-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'hotel',
                    name: item.place_name,
                    pricePerNight: Math.floor(Math.random() * (10000 - 1500) + 1500),
                    rating: item.rating || (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1),
                    distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km from center`,
                    image: item.image_url || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80`
                }));

                if (mapped.length === 0) {
                    const fallbackAccommodations = accommodations.map(acc => ({
                        ...acc,
                        name: `${acc.name} ${destName}`
                    }));
                    setAccommodationsData(fallbackAccommodations);
                } else {
                    setAccommodationsData(mapped);
                }
            } catch (err) {
                console.error("Error fetching accommodations:", err);
                const fallbackAccommodations = accommodations.map(acc => ({
                    ...acc,
                    name: `${acc.name} ${destName}`
                }));
                setAccommodationsData(fallbackAccommodations);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodations();
    }, [destName]);

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const filteredStays = activeTab === 'all'
        ? accommodationsData
        : accommodationsData.filter(a => a.type === activeTab);

    const handleNext = () => {
        navigate('/transport', {
            state: {
                ...location.state
            }
        });
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>Where will you stay?</h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Find the perfect place to rest your head.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
                {[
                    { id: 'all', label: 'All Stays', icon: null },
                    { id: 'hotel', label: 'Hotels', icon: <Building size={18} /> },
                    { id: 'homestay', label: 'Homestays', icon: <Home size={18} /> },
                    { id: 'hostel', label: 'Hostels', icon: <Tent size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? "btn-primary-custom" : "btn-secondary-custom"}
                        style={{ padding: '10px 20px', borderRadius: '50px' }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

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
                    <h3 style={{ color: 'var(--text-light)' }}>Finding live hotel rates for {destName}...</h3>
                </div>
            ) : filteredStays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
                    <h3>We couldn't find specific accommodations for {destName}.</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                {filteredStays.map((stay, idx) => {
                    const selected = isSelected('accommodation', stay);
                    return (
                        <motion.div
                            key={stay.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel"
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: selected ? '0 0 0 3px var(--primary-color)' : 'var(--shadow-sm)',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onClick={() => toggleItem('accommodation', stay)}
                        >
                            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                                <img src={stay.image} alt={stay.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    backgroundColor: 'white', padding: '4px 8px', borderRadius: '8px',
                                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> {stay.rating}
                                </div>
                                {selected && <CheckCircle color="var(--primary-color)" style={{ position: 'absolute', top: '15px', left: '15px', background: 'white', borderRadius: '50%' }} />}
                            </div>

                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{stay.name}</h3>
                                </div>

                                <p style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                                    <MapPin size={16} /> {stay.distance}
                                </p>

                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>₹{stay.pricePerNight}</span>
                                        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}> / night</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            id={`stay-${stay.id}`} 
                                            checked={selected} 
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleItem('accommodation', stay);
                                            }} 
                                            style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor={`stay-${stay.id}`} style={{ fontWeight: '600', color: '#222', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Add to Itinerary</label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            )}

            <div className="glass-panel" style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                padding: '20px 0',
                borderTop: '1px solid var(--border-color)',
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        Total Stay Cost: <strong style={{ color: 'var(--primary-color)' }}>
                            ₹{tripCostData.accommodation ? (tripCostData.accommodation.pricePerNight * planInfo.days).toLocaleString('en-IN') : 0}
                        </strong> for {planInfo.days} days
                    </div>
                    <button
                        className="btn-primary-custom"
                        onClick={handleNext}
                        disabled={!tripCostData.accommodation}
                        style={{ opacity: !tripCostData.accommodation ? 0.5 : 1, cursor: !tripCostData.accommodation ? 'not-allowed' : 'pointer' }}
                    >
                        Next Step: Plan Transport
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Accommodation;
