import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Wallet, CalendarDays, Compass, Users, User, Sun, TreePine, Navigation, Plane, TrainFront, Bus, CheckCircle2, Hotel, ChevronRight, Search, Star, Mountain, Heart, Gem, Landmark, Palmtree, Loader2 } from 'lucide-react';
import axios from 'axios';
import './TripPlanner.css';

const popularCities = [
    { name: "Agra", img: "/images/agra/hero.png" },
    { name: "Mumbai", img: "/images/mumbai/hero.png" },
    { name: "Goa", img: "/images/goa/hero.png" },
    { name: "Paris", img: "/images/paris/hero.png" },
    { name: "London", img: "/images/london/hero.png" },
    { name: "Tokyo", img: "/images/tokyo/hero.png" },
    { name: "Manali", img: "/images/manali/hero.png" },
    { name: "Dubai", img: "/images/dubai/hero.png" },
    { name: "New York", img: "/images/new-york/hero.png" },
    "Jaipur", "Kerala", "Varanasi", "Delhi", "Shimla", "Kolkata", "Bangalore", 
    "Rishikesh", "Leh-Ladakh", "Bangkok", "Singapore", "Bali", "Kuala Lumpur", 
    "Istanbul", "Rome", "Barcelona", "Amsterdam", "Los Angeles", "Las Vegas"
];

const TripPlanner = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [plan, setPlan] = useState(null);
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        budget: 50000,
        days: 3,
        tripType: '',
        transportMode: null, 
    });

    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDest, setSearchDest] = useState('');
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    
    const originRef = useRef(null);
    const destRef = useRef(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (originRef.current && !originRef.current.contains(event.target)) setShowOriginDropdown(false);
            if (destRef.current && !destRef.current.contains(event.target)) setShowDestDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOrigins = popularCities.filter(city => {
        const cityName = typeof city === 'string' ? city : city.name;
        return cityName.toLowerCase().includes(searchOrigin.toLowerCase());
    });

    const filteredDestinations = popularCities.filter(city => {
        const cityName = typeof city === 'string' ? city : city.name;
        return cityName.toLowerCase().includes(searchDest.toLowerCase());
    });

    const selectOrigin = (city) => {
        const cityName = typeof city === 'string' ? city : city.name;
        setFormData({ ...formData, origin: cityName });
        setSearchOrigin(cityName);
        setShowOriginDropdown(false);
    };

    const selectDestination = (city) => {
        const cityName = typeof city === 'string' ? city : city.name;
        setFormData({ ...formData, destination: cityName });
        setSearchDest(cityName);
        setShowDestDropdown(false);
    };

    const handleNext = async () => {
        if (step === 1) {
            setLoading(true);
            setError('');
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/trips/search`, {
                    destination: formData.destination
                });
                setStep(2);
            } catch (err) {
                console.error('Search error:', err);
                setStep(2); 
            } finally {
                setLoading(false);
            }
        } else if (step === 2) {
            navigate('/highlights', { state: { plan: formData } });
        }
    };

    const handleMagicPlan = async () => {
        setLoading(true);
        setError('');
        setPlan(null);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    days: formData.days,
                    vibe: formData.tripType || 'relaxing',
                    origin: formData.origin,
                    destination: formData.destination
                })
            });

            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.text();
            setPlan(data);
        } catch (err) {
            console.error('Magic AI error:', err);
            setError('Failed to reach AI. Showing fallback plan.');
            
            // Fallback Trip Plan
            const fallbackPlan = `--- FALLBACK 3-DAY RELAXING PLAN ---
Day 1: Arrival & Evening beach walk. Dinner at a local seaside cafe.
Day 2: Spa morning & Botanical garden visit. Sunset boat ride.
Day 3: Local market shopping & Departure.`;
            setPlan(fallbackPlan);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planner-container">
            <div className="planner-header">
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>Plan Your Trip</motion.h1>
                <p style={{ color: 'var(--text-light)' }}>Customize your perfect itinerary with our verified local data.</p>

                <div className="progress-bar-container">
                    {[1, 2].map((s) => (
                        <div key={s} className={`progress-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`} />
                    ))}
                </div>
            </div>

            <div className="planner-card glass-panel">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="step-title">
                                <Navigation size={24} color="var(--primary-color)" /> Where are we heading?
                            </h2>

                            <div className="input-field-group" ref={originRef}>
                                <label>Traveling From</label>
                                <div className="input-with-icon">
                                    <MapPin className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        value={searchOrigin}
                                        onChange={(e) => { 
                                            setSearchOrigin(e.target.value); 
                                            setFormData({ ...formData, origin: e.target.value });
                                            setShowOriginDropdown(true); 
                                        }}
                                        onFocus={() => setShowOriginDropdown(true)}
                                        placeholder="Enter your origin..."
                                    />
                                </div>
                                <AnimatePresence>
                                    {showOriginDropdown && (
                                        <motion.ul className="dropdown-list" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            {filteredOrigins.map((city, idx) => (
                                                <li key={idx} onClick={() => selectOrigin(city)}>
                                                    {(typeof city !== 'string' && city.img) && <img src={city.img} alt={city.name} className="dropdown-thumb" />}
                                                    <span>{typeof city === 'string' ? city : city.name}</span>
                                                    {(typeof city !== 'string' && city.img) && <Star size={14} className="verified-star" />}
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="featured-section">
                                <label className="section-label">Popular Verified Destinations</label>
                                <div className="city-grid">
                                    {popularCities.filter(c => typeof c === 'object').map(city => (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={city.name}
                                            onClick={() => selectDestination(city.name)}
                                            className={`city-card ${formData.destination === city.name ? 'selected' : ''}`}
                                        >
                                            <img src={city.img} alt={city.name} />
                                            <div className="city-card-overlay">
                                                <span className="city-name">{city.name}</span>
                                                <div className="verified-badge"><CheckCircle2 size={12} /> Verified</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="input-field-group" ref={destRef}>
                                <div className="divider-with-text"><span>OR SEARCH OTHER CITY</span></div>
                                <div className="input-with-icon">
                                    <Search className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        value={searchDest}
                                        onChange={(e) => { 
                                            setSearchDest(e.target.value); 
                                            setFormData({ ...formData, destination: e.target.value });
                                            setShowDestDropdown(true); 
                                        }}
                                        onFocus={() => setShowDestDropdown(true)}
                                        placeholder="Find your destination..."
                                    />
                                </div>
                                <AnimatePresence>
                                    {showDestDropdown && (
                                        <motion.ul className="dropdown-list" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            {filteredDestinations.map((city, idx) => (
                                                <li key={idx} onClick={() => selectDestination(city)}>
                                                    {(typeof city !== 'string' && city.img) && <img src={city.img} alt={city.name} className="dropdown-thumb" />}
                                                    <span>{typeof city === 'string' ? city : city.name}</span>
                                                    {(typeof city !== 'string' && city.img) && <Star size={14} className="verified-star" />}
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="step-actions">
                                {error && <p className="error-text">{error}</p>}
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); console.log('Step 1 -> handleNext called'); handleNext(); }}
                                    disabled={!formData.origin || !formData.destination || loading}
                                    className="btn-primary-custom next-btn"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Next Step <ChevronRight size={20} /></>}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="step-title">
                                <Compass size={24} color="var(--primary-color)" /> Customize your trip
                            </h2>

                            <div className="budget-section">
                                <div className="budget-header">
                                    <div className="budget-label"><Wallet size={20} /> Overall Budget (₹)</div>
                                    <div className="budget-value">
                                        <span>₹</span>
                                        <input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <input
                                    type="range" min="5000" max="500000" step="5000"
                                    value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                    className="budget-slider"
                                />
                            </div>

                            <div className="days-section">
                                <label><CalendarDays size={20} /> Duration</label>
                                <div className="days-input">
                                    <button onClick={() => setFormData(p => ({...p, days: Math.max(1, p.days - 1)}))}>-</button>
                                    <input type="number" readOnly value={formData.days} />
                                    <button onClick={() => setFormData(p => ({...p, days: p.days + 1}))}>+</button>
                                    <span>Days</span>
                                </div>
                            </div>

                            <div className="trip-type-section">
                                <label>Vibe of the trip</label>
                                <div className="trip-type-grid">
                                    {[
                                        { id: 'adventure', label: 'Adventure', icon: <Mountain size={24} /> },
                                        { id: 'romantic', label: 'Romantic', icon: <Heart size={24} /> },
                                        { id: 'family', label: 'Family', icon: <Users size={24} /> },
                                        { id: 'solo', label: 'Solo', icon: <User size={24} /> },
                                        { id: 'luxury', label: 'Luxury', icon: <Gem size={24} /> },
                                        { id: 'budget', label: 'Budget', icon: <Wallet size={24} /> },
                                        { id: 'relax', label: 'Relaxing', icon: <Palmtree size={24} /> },
                                        { id: 'cultural', label: 'Cultural', icon: <Landmark size={24} /> }
                                    ].map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, tripType: type.id })}
                                            className={`trip-type-card ${formData.tripType === type.id ? 'active' : ''}`}
                                        >
                                            {type.icon}
                                            <span>{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <p className="error-text" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                            {!formData.tripType && (
                                <p className="vibe-hint">✨ Please select a vibe above to unlock Magic AI Plan</p>
                            )}
                            <div className="step-actions dual" style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setStep(1)} className="btn-secondary-custom">Back</button>
                                <button type="button" onClick={(e) => { e.preventDefault(); handleNext(); }} disabled={!formData.tripType || loading} className="btn-primary-custom btn-outline" style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }}>Manual Plan →</button>
                                <button type="button" onClick={(e) => { e.preventDefault(); handleMagicPlan(); }} disabled={!formData.tripType || loading} className="btn-primary-custom magic-btn-main">
                                    {loading ? <Loader2 className="animate-spin" /> : <>✨ Magic AI Plan</>}
                                </button>
                            </div>

                            {plan && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="ai-plan-result"
                                    style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}
                                >
                                    <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Your AI Itinerary</h3>
                                    <pre style={{ 
                                        whiteSpace: 'pre-wrap', 
                                        fontFamily: 'inherit', 
                                        fontSize: '14px', 
                                        lineHeight: '1.6',
                                        color: '#333'
                                    }}>
                                        {plan}
                                    </pre>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default TripPlanner;
