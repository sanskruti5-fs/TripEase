import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import './FoodMarket.css';

const FoodMarket = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planInfo = location.state?.plan;

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const destName = planInfo.destination;
    const [foodData, setFoodData] = useState([]);
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFood, setSelectedFood] = useState([]);

    const baseFoodCost = planInfo.days * 800;
    const transportCost = planInfo.transportMode ? planInfo.transportMode.price : 0;
    const spentSoFar = transportCost + baseFoodCost;

    useEffect(() => {
        const fetchData = async () => {
            setFoodData([]);
            setMarketData([]);
            setLoading(true);
            try {
                const [foodRes, marketRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/trips/places/category?destination=${encodeURIComponent(destName)}&category=food`),
                    fetch(`http://localhost:5000/api/trips/places/category?destination=${encodeURIComponent(destName)}&category=market`)
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

    const toggleFood = (foodInfo) => {
        setSelectedFood(prev => {
            const exists = prev.find(f => f.id === foodInfo.id);
            if (exists) return prev.filter(f => f.id !== foodInfo.id);
            
            const currentExtraFoodCost = prev.reduce((sum, item) => sum + item.price, 0);
            if (spentSoFar + currentExtraFoodCost + foodInfo.price > planInfo.budget) {
                alert(`Adding "${foodInfo.name}" exceeds your overall budget of ₹${planInfo.budget.toLocaleString('en-IN')}!`);
                return prev;
            }
            return [...prev, foodInfo];
        });
    };

    const handleNext = () => {
        const extraFoodCost = selectedFood.reduce((sum, item) => sum + item.price, 0);
        navigate('/guides', {
            state: {
                plan: { ...planInfo, extraFoodCost, selectedFood }
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
                        const isSelected = selectedFood.some(f => f.id === item.id);
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
                                    boxShadow: isSelected ? '0 0 0 3px var(--primary-color)' : 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{ height: '200px', width: '100%' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                    <button
                                        onClick={() => toggleFood(item)}
                                        className={isSelected ? "btn-secondary-custom" : "btn-primary-custom"}
                                        style={{ width: '100%' }}
                                    >
                                        {isSelected ? 'Selected' : 'Add to Trip'}
                                    </button>
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
                    ) : marketData.map((market, idx) => (
                        <motion.div
                            key={market.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="market-card-swipe"
                        >
                            <div style={{ height: '250px', width: '100%' }}>
                                <img src={market.image} alt={market.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                <h3 style={{ margin: 0, color: 'white' }}>{market.name}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>{market.type}</p>
                            </div>
                        </motion.div>
                    ))}
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
