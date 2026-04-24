import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Building, Home, Tent, Wifi, Coffee, Car, Dumbbell, CheckCircle2, Loader2 } from 'lucide-react';
import './Accommodation.css';

const Accommodation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planInfo = location.state?.plan;

    const [activeTab, setActiveTab] = useState('all');
    const [selectedStay, setSelectedStay] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const destName = planInfo?.destination || '';

    useEffect(() => {
        if (!destName) return;
        const fetchHotels = async () => {
            setHotels([]);
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/trips/hotels?city=${encodeURIComponent(destName)}`
                );
                if (!response.ok) throw new Error('Failed to fetch hotels');
                const data = await response.json();
                setHotels(data);
            } catch (err) {
                console.error('Hotel fetch error:', err);
                setError(err.message);
                // Inline fallback so page never breaks
                setHotels(buildFallback(destName));
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, [destName]);

    if (!planInfo) return <Navigate to="/planner" replace />;

    // Client-side fallback if everything fails
    function buildFallback(city) {
        const images = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80',
        ];
        return [
            { _id: 'f1', place_name: `${city} Grand Resort`, price_per_night: 4500, rating: 4.8, amenities: ['WiFi', 'Pool', 'Breakfast'], tags: ['Popular'], address: city, image_url: images[0] },
            { _id: 'f2', place_name: `${city} Heritage Inn`, price_per_night: 2800, rating: 4.5, amenities: ['WiFi', 'Restaurant'], tags: ['Best Value'], address: city, image_url: images[1] },
            { _id: 'f3', place_name: `${city} Comfort Stay`, price_per_night: 1900, rating: 4.2, amenities: ['WiFi', 'AC', 'Parking'], tags: [], address: city, image_url: images[2] },
            { _id: 'f4', place_name: `${city} Backpackers Hub`, price_per_night: 900, rating: 4.0, amenities: ['WiFi', 'Lockers'], tags: [], address: city, image_url: images[3] },
        ];
    }

    // Derived filtered list (all data is already 'hotel' type from backend)
    const filteredHotels = hotels;

    const handleNext = () => {
        const stayCost = selectedStay ? (selectedStay.price_per_night * planInfo.days) : 0;
        navigate('/transport', {
            state: {
                ...location.state,
                plan: { ...planInfo, stayCost, selectedStay }
            }
        });
    };

    const renderStars = (rating) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        return (
            <div className="acc-stars">
                {[...Array(full)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                {half && <Star size={14} fill="#F59E0B" color="#F59E0B" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
                <span className="acc-rating-num">{parseFloat(rating).toFixed(1)}</span>
            </div>
        );
    };

    const getAmenityIcon = (amenity) => {
        const a = amenity.toLowerCase();
        if (a.includes('wifi')) return <Wifi size={13} />;
        if (a.includes('breakfast') || a.includes('coffee')) return <Coffee size={13} />;
        if (a.includes('park') || a.includes('car')) return <Car size={13} />;
        if (a.includes('gym') || a.includes('fitness')) return <Dumbbell size={13} />;
        return null;
    };

    return (
        <div className="acc-page">
            {/* Header */}
            <div className="acc-header">
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    Where will you stay?
                </motion.h1>
                <p>City-specific hotels for <strong>{destName}</strong> — real rates, real stays.</p>
            </div>

            {/* Tab Filters */}
            <div className="acc-tabs">
                {[
                    { id: 'all', label: 'All Stays', icon: null },
                    { id: 'hotel', label: 'Hotels', icon: <Building size={16} /> },
                    { id: 'homestay', label: 'Homestays', icon: <Home size={16} /> },
                    { id: 'hostel', label: 'Hostels', icon: <Tent size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`acc-tab ${activeTab === tab.id ? 'acc-tab--active' : ''}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Hotel Grid */}
            {loading ? (
                <div className="acc-loading">
                    <Loader2 size={40} className="animate-spin" color="var(--primary-color)" />
                    <p>Finding the best hotels in <strong>{destName}</strong>…</p>
                </div>
            ) : filteredHotels.length === 0 ? (
                <div className="acc-empty">
                    <Building size={48} color="var(--border-color)" />
                    <p>No hotels found for {destName}. Try refreshing.</p>
                </div>
            ) : (
                <div className="acc-grid">
                    <AnimatePresence>
                        {filteredHotels.map((hotel, idx) => {
                            const isSelected = selectedStay?._id === hotel._id;
                            return (
                                <motion.div
                                    key={hotel._id || idx}
                                    className={`acc-card ${isSelected ? 'acc-card--selected' : ''}`}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    onClick={() => {
                                        if (!isSelected) {
                                            const cost = hotel.price_per_night * planInfo.days;
                                            const spent = (planInfo.transportMode?.price || 0)
                                                + (planInfo.days * 800)
                                                + (planInfo.extraFoodCost || 0)
                                                + (planInfo.guideCost || 0);
                                            if (spent + cost > planInfo.budget) {
                                                alert(`Selecting "${hotel.place_name}" exceeds your budget of ₹${planInfo.budget.toLocaleString('en-IN')}!`);
                                                return;
                                            }
                                        }
                                        setSelectedStay(isSelected ? null : hotel);
                                    }}
                                >
                                    {/* Image */}
                                    <div className="acc-card__img-wrap">
                                        <img
                                            src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                                            alt={hotel.place_name}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'; }}
                                        />
                                        {/* Tags */}
                                        <div className="acc-card__tags">
                                            {(hotel.tags || []).map(tag => (
                                                <span key={tag} className={`acc-tag acc-tag--${tag.toLowerCase().replace(' ', '-')}`}>
                                                    {tag === 'Popular' ? '🔥' : '💰'} {tag}
                                                </span>
                                            ))}
                                        </div>
                                        {isSelected && (
                                            <div className="acc-card__selected-badge">
                                                <CheckCircle2 size={20} /> Selected
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="acc-card__body">
                                        <h3 className="acc-card__name">{hotel.place_name}</h3>
                                        <div className="acc-card__meta">
                                            {renderStars(hotel.rating)}
                                            <span className="acc-card__address">
                                                <MapPin size={13} /> {hotel.address || destName}
                                            </span>
                                        </div>

                                        {hotel.description && (
                                            <p className="acc-card__desc">{hotel.description}</p>
                                        )}

                                        {/* Amenities */}
                                        {hotel.amenities?.length > 0 && (
                                            <div className="acc-card__amenities">
                                                {hotel.amenities.slice(0, 4).map((a, i) => (
                                                    <span key={i} className="acc-amenity">
                                                        {getAmenityIcon(a)} {a}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Price + CTA */}
                                        <div className="acc-card__footer">
                                            <div className="acc-card__price">
                                                <span className="acc-price-amount">₹{hotel.price_per_night?.toLocaleString('en-IN')}</span>
                                                <span className="acc-price-label">/ night</span>
                                                <span className="acc-price-total">
                                                    ₹{(hotel.price_per_night * planInfo.days).toLocaleString('en-IN')} total
                                                </span>
                                            </div>
                                            <button className={`acc-btn ${isSelected ? 'acc-btn--deselect' : 'acc-btn--select'}`}>
                                                {isSelected ? 'Remove' : 'Select'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Sticky Footer */}
            <div className="acc-footer glass-panel">
                <div className="container acc-footer__inner">
                    <div className="acc-footer__summary">
                        {selectedStay ? (
                            <>
                                <CheckCircle2 size={18} color="var(--primary-color)" />
                                <span><strong>{selectedStay.place_name}</strong> · ₹{(selectedStay.price_per_night * planInfo.days).toLocaleString('en-IN')} for {planInfo.days} nights</span>
                            </>
                        ) : (
                            <span style={{ color: 'var(--text-light)' }}>Select a hotel to continue</span>
                        )}
                    </div>
                    <button
                        className="btn-primary-custom"
                        onClick={handleNext}
                        disabled={!selectedStay}
                        style={{ opacity: !selectedStay ? 0.5 : 1, cursor: !selectedStay ? 'not-allowed' : 'pointer' }}
                    >
                        Next Step: Plan Transport →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Accommodation;
