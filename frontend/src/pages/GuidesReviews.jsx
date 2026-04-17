import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';

const mockGuides = [
    { id: 'g1', name: 'Rahul Sharma', experience: '5 years', rating: 4.8, pricePerDay: 800, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { id: 'g2', name: 'Anita Desai', experience: '8 years', rating: 4.9, pricePerDay: 1200, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { id: 'g3', name: 'Vikram Singh', experience: '3 years', rating: 4.6, pricePerDay: 600, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
];

const mockReviews = [
    { id: 1, text: "TripEase made planning our entire honeymoon so effortless!", author: "Priya T.", rating: 5 },
    { id: 2, text: "The guide Rahul was fantastic. Knew all the hidden spots.", author: "Arjun M.", rating: 5 },
    { id: 3, text: "Everything was perfectly within budget. Highly recommend.", author: "Neha K.", rating: 4 }
];

const galleryImages = [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534142498263-d143c965c276?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1587452308709-661ff97cf707?auto=format&fit=crop&w=400&q=80"
];

const GuidesReviews = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planInfo = location.state?.plan;

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const destName = planInfo.destination;

    const [selectedGuide, setSelectedGuide] = useState(null);
    const [guidesData, setGuidesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations/${encodeURIComponent(destName)}/guides`);
                if (!response.ok) throw new Error('Failed to fetch real-time guides');
                const data = await response.json();
                
                if (data.length === 0) {
                    const fallbackGuides = mockGuides.map(guide => ({
                        ...guide,
                        name: `${guide.name} (${destName} Expert)`
                    }));
                    setGuidesData(fallbackGuides);
                } else {
                    setGuidesData(data);
                }
            } catch (err) {
                console.error("Error fetching guides:", err);
                const fallbackGuides = mockGuides.map(guide => ({
                    ...guide,
                    name: `${guide.name} (${destName} Expert)`
                }));
                setGuidesData(fallbackGuides);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, [destName]);

    const dynamicReviews = mockReviews.map((review, index) => {
        if (index === 0) return { ...review, text: `TripEase made planning our entire trip to ${destName} so effortless!` };
        if (index === 1) return { ...review, text: `The guide was fantastic. Knew all the hidden spots around ${destName}.` };
        return review;
    });

    const handleNext = () => {
        // Total guide cost depends on number of days (from planInfo.days)
        const guideCost = selectedGuide ? (selectedGuide.pricePerDay * planInfo.days) : 0;

        navigate('/accommodation', {
            state: {
                plan: { ...planInfo, guideCost },
                selectedAttractions: location.state?.selectedAttractions || [],
                selectedFoods: location.state?.selectedFoods || [],
                selectedMarkets: location.state?.selectedMarkets || [],
                selectedStay: location.state?.selectedStay,
                selectedTransport: location.state?.selectedTransport,
                selectedGuide: selectedGuide
            }
        });
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>Local Experts & Stories</h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Book a verified local guide to enrich your journey.</p>
            </div>

            <section style={{ marginBottom: '80px' }}>
                <h2 style={{ marginBottom: '32px' }}>Choose a Guide (Optional)</h2>
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
                        <h3 style={{ color: 'var(--text-light)' }}>Finding local experts in {destName}...</h3>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {guidesData.map((guide, idx) => (
                            <motion.div
                                key={guide.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel"
                                style={{
                                    borderRadius: '16px',
                                    padding: '24px',
                                    display: 'flex',
                                    gap: '24px',
                                    boxShadow: selectedGuide?.id === guide.id ? '0 0 0 3px var(--primary-color)' : 'var(--shadow-sm)',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    if (selectedGuide?.id !== guide.id) {
                                        const baseFoodCost = planInfo.days * 800;
                                        const transportCost = planInfo.transportMode ? planInfo.transportMode.price : 0;
                                        const extraFoodCost = planInfo.extraFoodCost || 0;
                                        const spentSoFar = transportCost + baseFoodCost + extraFoodCost;
                                        const cost = guide.pricePerDay * planInfo.days;

                                        if (spentSoFar + cost > planInfo.budget) {
                                            alert(`Selecting ${guide.name} exceeds your overall budget of ₹${planInfo.budget.toLocaleString('en-IN')}! Try a different option.`);
                                            return;
                                        }
                                    }
                                    setSelectedGuide(selectedGuide?.id === guide.id ? null : guide);
                                }}
                            >
                                <img
                                    src={guide.image}
                                    alt={guide.name}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{guide.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Exp: {guide.experience}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', margin: '4px 0' }}>
                                        <Star size={14} fill="currentColor" /> {guide.rating}
                                    </div>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>₹{guide.pricePerDay} / day</div>
                                </div>
                                {selectedGuide?.id === guide.id && <CheckCircle color="var(--primary-color)" />}
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Reviews Section */}
            <section style={{ marginBottom: '80px' }}>
                <h2 style={{ marginBottom: '32px', textAlign: 'center' }}>Traveler Testimonials</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    {dynamicReviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            whileHover={{ y: -5 }}
                            style={{
                                backgroundColor: 'var(--surface-color)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                fontStyle: 'italic'
                            }}
                        >
                            <div style={{ color: '#F59E0B', marginBottom: '12px' }}>
                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p style={{ color: 'var(--text-dark)', marginBottom: '16px' }}>"{review.text}"</p>
                            <div style={{ fontWeight: '600', color: 'var(--text-light)' }}>- {review.author}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Gallery Section */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '32px' }}>Inspiration Gallery</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {galleryImages.map((img, idx) => (
                        <div key={idx} style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={img} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                        </div>
                    ))}
                </div>
            </section>

            <div className="glass-panel" style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                padding: '20px 0',
                borderTop: '1px solid var(--border-color)',
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-primary-custom" onClick={handleNext}>
                        Next Step: Choose Accommodation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidesReviews;
