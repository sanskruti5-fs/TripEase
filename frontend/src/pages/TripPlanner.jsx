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
    { name: "Jaipur", img: "/images/jaipur/hero.png" },
    { name: "Varanasi", img: "/images/varanasi/hero.png" },
    { name: "Delhi", img: "/images/delhi/hero.png" },
    { name: "Kolkata", img: "/images/kolkata/hero.png" },
    { name: "Bengaluru", img: "/images/bengaluru/hero.png" },
    { name: "Rishikesh", img: "/images/rishikesh/hero.png" },
    { name: "Leh-Ladakh", img: "/images/leh-ladakh/hero.png" },
    { name: "Bangkok", img: "/images/bangkok/hero.png" },
    { name: "Singapore", img: "/images/singapore/hero.png" },
    { name: "Bali", img: "/images/bali/hero.png" },
    { name: "Kuala Lumpur", img: "/images/kuala-lumpur/hero.png" },
    { name: "Istanbul", img: "/images/istanbul/hero.png" },
    { name: "Rome", img: "/images/rome/hero.png" },
    { name: "Barcelona", img: "/images/barcelona/hero.png" },
    { name: "Amsterdam", img: "/images/amsterdam/hero.png" },
    { name: "Los Angeles", img: "/images/los-angeles/hero.png" },
    { name: "Las Vegas", img: "/images/las-vegas/hero.png" },
    { name: "Kochi", img: "/images/kochi/hero.png" },
    { name: "Udaipur", img: "/images/udaipur/hero.png" },
    { name: "Chennai", img: "/images/chennai/hero.png" },
    { name: "Hyderabad", img: "/images/hyderabad/hero.png" }
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
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    days: formData.days,
                    vibe: formData.tripType || 'relaxing',
                    origin: formData.origin,
                    destination: formData.destination,
                    budget: formData.budget
                })
            });

            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            
            // Navigate to the beautiful structured AI Itinerary page
            navigate('/ai-itinerary', { 
                state: { 
                    plan: data, 
                    tripDetails: formData 
                } 
            });

        } catch (err) {
            console.error('Magic AI error:', err);
            
            // Fallback structured JSON plan if API fails
            const fallbackPlan = {
                itinerary: Array.from({ length: formData.days }).map((_, i) => ({
                    day: i + 1,
                    title: `Day ${i + 1} in ${formData.destination}`,
                    activities: [
                        { time: "10:00 AM", task: "Morning Exploration", location: "City Highlights", estCost: "₹500" },
                        { time: "02:00 PM", task: "Afternoon Tour", location: "Local Museums", estCost: "₹800" },
                        { time: "06:00 PM", task: "Evening Walk", location: "Downtown", estCost: "Free" }
                    ],
                    dining: { name: "Popular Local Restaurant", dish: "Chef's Special", type: "Dinner" }
                })),
                travelTips: ["Book tickets in advance", "Try the street food safely", "Carry cash for local markets"],
                budgetSummary: `Estimated within your ₹${formData.budget} budget.`
            };
            
            navigate('/ai-itinerary', { 
                state: { 
                    plan: fallbackPlan, 
                    tripDetails: formData 
                } 
            });
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
                                            {filteredOrigins.length > 0 ? (
                                                filteredOrigins.map((city, idx) => (
                                                    <li key={idx} onClick={() => selectOrigin(city)}>
                                                        {(typeof city !== 'string' && city.img) && <img src={city.img} alt={city.name} className="dropdown-thumb" />}
                                                        <span>{typeof city === 'string' ? city : city.name}</span>
                                                        {(typeof city !== 'string' && city.img) && <Star size={14} className="verified-star" />}
                                                    </li>
                                                ))
                                            ) : searchOrigin && (
                                                <li onClick={() => { selectOrigin(searchOrigin); setShowOriginDropdown(false); }} className="custom-entry">
                                                    <MapPin size={18} />
                                                    <span>Traveling from "{searchOrigin}"</span>
                                                </li>
                                            )}
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
                                            {filteredDestinations.length > 0 ? (
                                                filteredDestinations.map((city, idx) => (
                                                    <li key={idx} onClick={() => selectDestination(city)}>
                                                        {(typeof city !== 'string' && city.img) && <img src={city.img} alt={city.name} className="dropdown-thumb" />}
                                                        <span>{typeof city === 'string' ? city : city.name}</span>
                                                        {(typeof city !== 'string' && city.img) && <Star size={14} className="verified-star" />}
                                                    </li>
                                                ))
                                            ) : searchDest && (
                                                <li onClick={() => { selectDestination(searchDest); setShowDestDropdown(false); }} className="custom-entry">
                                                    <Compass size={18} />
                                                    <span>Explore "{searchDest}" with AI</span>
                                                </li>
                                            )}
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
                            
                            {formData.destination && !popularCities.some(c => c.name.toLowerCase() === formData.destination.toLowerCase()) && (
                                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #10B981', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>
                                        📍 "{formData.destination}" is a new destination!
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                        Our AI will now fetch real-time attractions, food, and markets for you.
                                    </p>
                                </div>
                            )}

                            <div className="step-actions dual">
                                <button type="button" onClick={() => setStep(1)} className="btn-secondary-custom">Back</button>
                                
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.preventDefault(); handleNext(); }} 
                                    disabled={!formData.tripType || loading} 
                                    className="btn-primary-custom btn-outline" 
                                    style={{ 
                                        border: `2px solid ${popularCities.some(c => c.name.toLowerCase() === formData.destination.toLowerCase()) ? 'var(--primary-color)' : '#10B981'}`, 
                                        color: popularCities.some(c => c.name.toLowerCase() === formData.destination.toLowerCase()) ? 'var(--primary-color)' : '#059669', 
                                        background: 'transparent',
                                        opacity: 1
                                    }}
                                >
                                    {popularCities.some(c => c.name.toLowerCase() === formData.destination.toLowerCase()) ? 'Manual Plan →' : '⚡ Smart Manual →'}
                                </button>

                                <button type="button" onClick={(e) => { e.preventDefault(); handleMagicPlan(); }} disabled={!formData.tripType || loading} className="btn-primary-custom magic-btn-main">
                                    {loading ? <Loader2 className="animate-spin" /> : <>✨ Magic AI Plan</>}
                                </button>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default TripPlanner;
