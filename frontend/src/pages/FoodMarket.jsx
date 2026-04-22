import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ShoppingBag, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import './FoodMarket.css';

const FoodMarket = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toggleItem, isSelected } = useTrip();
    const planInfo = location.state?.plan;

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const destName = planInfo.destination;
    const [foodData, setFoodData] = useState([]);
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setFoodData([]);
            setMarketData([]);
            setLoading(true);
            try {
                const [foodRes, marketRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/trips/places/category?destination=${encodeURIComponent(destName)}&category=food`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/trips/places/category?destination=${encodeURIComponent(destName)}&category=market`)
                ]);

                const foods = await foodRes.json();
                const markets = await marketRes.json();

                setFoodData(foods.map(f => ({
                    id: f.id,
                    name: f.place_name,
                    price: f.estimated_budget || (250 + Math.floor(Math.random() * 300)),
                    image: f.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80`,
                    address: f.address || 'Local Address'
                })));

                setMarketData(markets.map(m => ({
                    id: m.id,
                    name: m.place_name,
                    price: 0,
                    type: m.category,
                    image: m.image_url || `https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80`
                })));
            } catch (err) {
                console.error("Error fetching food/markets:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [destName]);

    const handleNext = () => {
        navigate('/guides', {
            state: {
                ...location.state
            }
        });
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '120px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px', padding: '0 16px' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: 'var(--primary-color)' }}>Taste & Shop in {destName}</h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Discover curated local delicacies and bustling shopping hubs.</p>
            </div>

            <section style={{ marginBottom: '64px', padding: '0 16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Utensils color="var(--primary-color)" /> Famous Local Food
                </h2>

                <div className="food-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
                        </div>
                    ) : foodData.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--text-light)' }}>No curated food recommendations for {destName}.</p>
                        </div>
                    ) : foodData.map((item, idx) => {
                        const selected = isSelected('food', item);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel"
                                style={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: selected ? '0 0 0 3px var(--primary-color)' : 'var(--shadow-sm)',
                                    position: 'relative'
                                }}
                                onClick={() => toggleItem('food', item)}
                            >
                                <div style={{ height: '200px', width: '100%' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {selected && <CheckCircle color="var(--primary-color)" style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', borderRadius: '50%' }} />}
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                                        <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{item.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        <MapPin size={16} />
                                        <span>{item.address}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            id={`food-${item.id}`} 
                                            checked={selected} 
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleItem('food', item);
                                            }} 
                                            style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor={`food-${item.id}`} style={{ fontWeight: '600', color: '#222', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Add to Itinerary</label>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <section style={{ padding: '0 16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <ShoppingBag color="var(--primary-color)" /> Popular Markets
                </h2>

                <div className="market-carousel hide-scrollbar">
                    {loading ? (
                        <div style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--text-light)' }}>Exploring markets...</p>
                        </div>
                    ) : marketData.length === 0 ? (
                        <div style={{ width: '100%', padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-light)' }}>No markets found for this city.</p>
                        </div>
                    ) : marketData.map((market, idx) => {
                        const selected = isSelected('market', market);
                        return (
                            <motion.div
                                key={market.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`market-card-swipe ${selected ? 'selected' : ''}`}
                                style={{ position: 'relative', border: selected ? '3px solid var(--primary-color)' : 'none' }}
                                onClick={() => toggleItem('market', market)}
                            >
                                <div style={{ height: '250px', width: '100%' }}>
                                    <img src={market.image} alt={market.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
                                    {selected && <CheckCircle color="var(--primary-color)" style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', borderRadius: '50%' }} />}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                    <h3 style={{ margin: 0, color: 'white' }}>{market.name}</h3>
                                    <p style={{ margin: 0, opacity: 0.9 }}>{market.type}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                                        <input 
                                            type="checkbox" 
                                            id={`market-${market.id}`} 
                                            checked={selected} 
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleItem('market', market);
                                            }} 
                                            style={{ accentColor: '#FF4D6D', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor={`market-${market.id}`} style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Add to Itinerary</label>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <div className="food-sticky-footer">
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px' }}>
                    <button className="btn-primary-custom" onClick={handleNext} style={{ padding: '12px 32px' }}>
                        Next Step: Guides
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodMarket;
