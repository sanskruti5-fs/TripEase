import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, MapPin, Calendar, Users, Download, ArrowRight, CheckCircle, Camera, Award, Star, Compass, TrainFront, Plane, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

const BudgetSummary = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const planInfo = location.state?.plan;
    const selectedAttractions = location.state?.selectedAttractions || [];
    const selectedFoods = location.state?.selectedFoods || [];
    const selectedMarkets = location.state?.selectedMarkets || [];
    
    // Multi-hotel support
    const dayWiseStays = planInfo?.dayWiseStays || [];
    const selectedStay = location.state?.selectedStay || planInfo?.selectedStay;
    
    const selectedTransport = location.state?.selectedTransport;
    const selectedGuide = location.state?.selectedGuide;

    const itineraryRef = useRef(null);
    const optimizedRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    // AI Optimization State
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedPlan, setOptimizedPlan] = useState(null);
    const [activeView, setActiveView] = useState('manual'); // 'manual' or 'ai'
    const [showMap, setShowMap] = useState(false);

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    const destName = planInfo.destination || '';
    const currencyMap = {
        "Dubai": { code: "AED", rate: 22.7 },
        "Paris": { code: "EUR", rate: 90.5 },
        "London": { code: "GBP", rate: 105.2 },
        "Tokyo": { code: "JPY", rate: 0.55 },
        "New York": { code: "USD", rate: 83.4 },
        "Singapore": { code: "SGD", rate: 61.8 },
        "Bangkok": { code: "THB", rate: 2.3 },
        "Bali": { code: "IDR", rate: 0.0053 },
        "Kuala Lumpur": { code: "MYR", rate: 17.5 },
        "Istanbul": { code: "TRY", rate: 2.6 },
        "Rome": { code: "EUR", rate: 90.5 },
        "Barcelona": { code: "EUR", rate: 90.5 },
        "Amsterdam": { code: "EUR", rate: 90.5 },
        "Los Angeles": { code: "USD", rate: 83.4 },
        "Las Vegas": { code: "USD", rate: 83.4 }
    };

    const localCurrency = currencyMap[destName] || null;

    // Helper to parse prices
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const convert = (inr) => {
        if (!localCurrency) return null;
        return (inr / localCurrency.rate).toLocaleString('en-US', { maximumFractionDigits: 0 });
    };

    // Cost Extraction & Logic
    const stayCost = dayWiseStays.length > 0 
        ? dayWiseStays.reduce((sum, stay) => sum + (stay?.price_per_night || 0), 0)
        : (selectedStay ? (selectedStay.pricePerNight * planInfo.days) : (planInfo.stayCost || 0));
    const transportCost = selectedTransport ? parsePrice(selectedTransport.price) : 0;
    const guideCost = selectedGuide ? (selectedGuide.pricePerDay * planInfo.days) : (planInfo.guideCost || 0);
    const attractionsCost = selectedAttractions.reduce((sum, item) => sum + (item.entryFee || 0), 0);
    const foodItemsCost = selectedFoods.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Baseline food per day (as per industry standards)
    const baseFoodCost = planInfo.days * 800; 
    const totalFoodCost = baseFoodCost + foodItemsCost;

    const totalEstimated = stayCost + transportCost + guideCost + attractionsCost + totalFoodCost;
    const overallBudget = planInfo.budget || 0;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(itineraryRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.download = `TripEase-Itinerary-${planInfo.destination}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating itinerary:', error);
            alert('Failed to generate itinerary. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadAI = async () => {
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(optimizedRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.download = `TripEase-AI-Optimized-${planInfo.destination}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating AI itinerary:', error);
            alert('Failed to generate AI itinerary. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    places: selectedAttractions,
                    hotels: dayWiseStays.length > 0 ? dayWiseStays : [selectedStay],
                    food: selectedFoods,
                    transport: selectedTransport,
                    budget: overallBudget,
                    planInfo
                })
            });
            if (!response.ok) throw new Error('AI optimization failed');
            const data = await response.json();
            setOptimizedPlan(data);
            setActiveView('ai');
        } catch (err) {
            console.error(err);
            alert('Could not optimize trip at this time. Please try again.');
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '100px 0' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* 1. Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#FF4D6D', marginBottom: '12px' }}>Final Itinerary & Budget Review</h1>
                    <p style={{ color: '#717171', fontSize: '1.2rem' }}>Review your selections, check your budget, and download your full plan.</p>
                </div>

                {/* AI Toggle Buttons if Optimized */}
                {optimizedPlan && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                        <button 
                            onClick={() => setActiveView('manual')}
                            style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', border: '2px solid #FF4D6D', background: activeView === 'manual' ? '#FF4D6D' : 'white', color: activeView === 'manual' ? 'white' : '#FF4D6D' }}
                        >
                            Original Plan
                        </button>
                        <button 
                            onClick={() => setActiveView('ai')}
                            style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', border: '2px solid #10B981', background: activeView === 'ai' ? '#10B981' : 'white', color: activeView === 'ai' ? 'white' : '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            ✨ AI Optimized
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7.5fr) minmax(0, 4.5fr)', gap: '40px' }}>
                    
                    {/* LEFT COLUMN: The Itinerary Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {activeView === 'ai' && optimizedPlan ? (
                            /* AI OPTIMIZED VIEW */
                            <>
                                <div style={{ width: '100%', height: '240px', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                                    <img 
                                        src={`https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80`} 
                                        alt={planInfo.destination}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '30px' }}>
                                        <div>
                                            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', opacity: 0.9 }}>AI Optimized Journey</div>
                                            <h2 style={{ color: 'white', fontSize: '2.8rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>{planInfo.destination}</h2>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#ECFDF5', padding: '20px', borderRadius: '16px', border: '1px solid #34D399', color: '#065F46', marginBottom: '10px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>✨ AI Optimization Complete</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{optimizedPlan.optimizationSummary}</p>
                                    {optimizedPlan.totalEstimatedSavings && (
                                        <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>Savings: {optimizedPlan.totalEstimatedSavings}</p>
                                    )}
                                </div>

                                {optimizedPlan.savingsMessage && (
                                    <div style={{ 
                                        backgroundColor: '#DBEAFE', 
                                        padding: '15px 20px', 
                                        borderRadius: '16px', 
                                        border: '1px solid #93C5FD', 
                                        color: '#1E40AF', 
                                        marginBottom: '24px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                    }}>
                                        <Wallet size={22} />
                                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{optimizedPlan.savingsMessage}</span>
                                    </div>
                                )}

                                {optimizedPlan.optimizedPlan.map((dayPlan, idx) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', borderLeft: '6px solid #10B981', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: '#111827' }}>Day {dayPlan.day}</h3>
                                        
                                        {dayPlan.hotel && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #F3F4F6', marginBottom: '15px' }}>
                                                <div style={{ background: '#F3F4F6', padding: '10px', borderRadius: '10px' }}>🏨</div>
                                                <div>
                                                    <div style={{ fontWeight: '700' }}>Hotel: {dayPlan.hotel.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{dayPlan.hotel.price}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '10px', color: '#4B5563' }}>📍 Planned Route:</div>
                                            {dayPlan.places?.map((p, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '10px', background: '#FF4D6D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', marginTop: '2px' }}>{i + 1}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{p.name} <span style={{ color: '#10B981', fontSize: '0.75rem', marginLeft: '5px', fontWeight: '500' }}>({p.rationale})</span></div>
                                                        <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Fee: ₹{p.entryFee || 0}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {dayPlan.food?.length > 0 && (
                                            <div>
                                                <div style={{ fontWeight: '700', marginBottom: '10px', color: '#4B5563' }}>🍽️ Food Stops:</div>
                                                {dayPlan.food.map((f, i) => (
                                                    <div key={i} style={{ fontSize: '0.9rem', marginBottom: '4px' }}>• {f.name} at {f.restaurant}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            /* ORIGINAL MANUAL VIEW */
                            <>
                        
                        {/* Route Summary */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', borderLeft: '6px solid #FF4D6D', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>{planInfo.origin} ➔ {planInfo.destination}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', color: '#717171', fontSize: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> {planInfo.days} Days</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> 1 Passenger</span>
                            </div>
                        </div>

                        {/* Transport Selection */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Intercity Transport</h3>
                            {selectedTransport ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#F0F9FF', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {selectedTransport.type === 'flight' ? <Plane /> : <TrainFront />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedTransport.operator || selectedTransport.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#717171' }}>{selectedTransport.departure} — {selectedTransport.arrival} ({selectedTransport.duration})</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{selectedTransport.price}</div>
                                </div>
                            ) : (
                                <div style={{ color: '#9CA3AF' }}>No transport selected.</div>
                            )}
                        </div>

                        {/* Accommodation Selection */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Accommodation ({planInfo.days} Days)</h3>
                                <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹ {stayCost.toLocaleString('en-IN')}</div>
                            </div>
                            
                            {dayWiseStays.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {dayWiseStays.map((stay, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: idx !== dayWiseStays.length - 1 ? '15px' : '0', borderBottom: idx !== dayWiseStays.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ fontWeight: '700', color: '#FF4D6D', width: '50px' }}>Day {idx + 1}</div>
                                                <img src={stay?.image_url || stay?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=100&q=80'} alt="Hotel" style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} />
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{stay?.place_name || stay?.name || 'No Hotel'}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '600', color: '#4B5563' }}>₹ {stay?.price_per_night || stay?.pricePerNight || 0}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : selectedStay ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <img src={selectedStay.image || selectedStay.image_url} alt="Hotel" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '12px' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedStay.name || selectedStay.place_name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#717171' }}>@ {selectedStay.distance || destName}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>₹ {selectedStay.pricePerNight || selectedStay.price_per_night} / night</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#9CA3AF' }}>No accommodation selected.</div>
                            )}
                        </div>

                        {/* Activities & Places Selection */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Activities & Places to Visit</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {selectedAttractions.length > 0 ? selectedAttractions.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                        <span>{p.name}</span>
                                        <span style={{ color: '#717171' }}>{p.entryFee > 0 ? `₹${p.entryFee}` : 'Free'}</span>
                                    </div>
                                )) : <div style={{ color: '#9CA3AF' }}>No places selected.</div>}
                            </div>
                        </div>

                        {/* Food Selection */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Must-Try Local Foods</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {selectedFoods.length > 0 ? selectedFoods.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>{f.name}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#9CA3AF', marginLeft: '10px' }}>({f.restaurant})</span>
                                        </div>
                                        <span style={{ color: '#717171' }}>₹{f.price}</span>
                                    </div>
                                )) : <div style={{ color: '#9CA3AF' }}>Baseline daily food assumed.</div>}
                            </div>
                        </div>

                        {/* Markets Selection */}
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Local Markets to Explore</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {selectedMarkets.length > 0 ? selectedMarkets.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ fontWeight: '600' }}>{m.name}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#717171' }}>{m.specialty}</span>
                                    </div>
                                )) : <div style={{ color: '#9CA3AF' }}>No markets added.</div>}
                            </div>
                        </div>

                        {/* Local Guide (If selected) */}
                        {selectedGuide && (
                            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Local Guide</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <img src={selectedGuide.image} alt="Guide" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.2rem' }}>{selectedGuide.name}</div>
                                        <div style={{ color: '#717171' }}>₹{selectedGuide.pricePerDay} per day</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Summary Command Center */}
                    <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                        <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Wallet color="#FF4D6D" /> Final Budget Summary
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '35px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Transport</span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>₹ {transportCost.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Accommodation</span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>₹ {stayCost.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Activities & Entry Fees</span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>₹ {attractionsCost.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Food (Est. + Selected)</span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>₹ {totalFoodCost.toLocaleString('en-IN')}</span>
                                </div>
                                {selectedGuide && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                                        <span>Local Guide Fee</span>
                                        <span style={{ fontWeight: '600' }}>₹ {guideCost.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8A9B 100%)',
                                padding: '25px',
                                borderRadius: '20px',
                                color: 'white',
                                marginBottom: '25px',
                                textAlign: 'center',
                                boxShadow: '0 10px 15px -3px rgba(255, 77, 109, 0.4)'
                            }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Total Estimated Cost</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>₹ {totalEstimated.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                    Budget Limit: ₹ {overallBudget.toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div style={{ 
                                backgroundColor: totalEstimated <= overallBudget ? '#F0FDF4' : '#FEF2F2',
                                color: totalEstimated <= overallBudget ? '#166534' : '#991B1B',
                                padding: '12px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textAlign: 'center',
                                marginBottom: '25px'
                            }}>
                                {totalEstimated <= overallBudget ? 'Great! Your trip is under budget.' : 'Warning: You are over your budget limit!'}
                            </div>

                            {activeView === 'manual' && !optimizedPlan && (
                                <button 
                                    onClick={handleOptimize}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        fontSize: '1.05rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                                        transition: 'transform 0.2s ease',
                                        marginBottom: '15px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    disabled={isOptimizing}
                                >
                                    ✨ {isOptimizing ? 'Optimizing...' : 'Optimize My Trip with AI'}
                                </button>
                            )}

                            {activeView === 'ai' ? (
                                <button 
                                    onClick={handleDownloadAI}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '18px',
                                        borderRadius: '16px',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Download size={22} /> {isDownloading ? 'Generating...' : 'Download AI Plan'}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleDownload}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#FF4D6D',
                                        color: 'white',
                                        border: 'none',
                                        padding: '18px',
                                        borderRadius: '16px',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(255, 77, 109, 0.3)',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Download size={22} /> {isDownloading ? 'Generating...' : 'Download Manual Plan'}
                                </button>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Link to="/planner" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem' }}>← Start Over</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HIDDEN ITINERARY FOR DOWNLOAD */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '100%', pointerEvents: 'none' }}>
                <div ref={itineraryRef} style={{ 
                    width: '900px', 
                    backgroundColor: '#ffffff', 
                    padding: '60px', 
                    fontFamily: '"Inter", "Roboto", sans-serif',
                    color: '#1f2937'
                }}>
                    {/* Header with Destination Image */}
                    <div style={{ 
                        position: 'relative', 
                        height: '280px', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        marginBottom: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '40px',
                        color: 'white',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Background Image Setup */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `url(/images/${planInfo.destination.toLowerCase().replace(/\s+/g, '-')}/hero.png), url(/images/tokyo/hero.png)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 1
                        }} />
                        {/* Gradient Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                            zIndex: 2
                        }} />
                        
                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '10px 20px', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#FF4D6D', margin: 0, letterSpacing: '-1px' }}>TripEase.</h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '20px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    🗓️ {planInfo.days} Days • 👥 1 Passenger
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ position: 'relative', zIndex: 3 }}>
                            <p style={{ fontSize: '1.2rem', margin: '0 0 5px 0', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Your Trip from {planInfo.origin}</p>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0, textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>{planInfo.destination}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '40px' }}>
                        {/* Left Column */}
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            
                            {/* Transport */}
                            <div style={{ padding: '25px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ✈️ Intercity Transport
                                </h3>
                                {selectedTransport ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedTransport.operator || selectedTransport.name}</div>
                                            <div style={{ color: '#4b5563', marginTop: '4px' }}>{selectedTransport.departure} — {selectedTransport.arrival}</div>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedTransport.price}</div>
                                    </div>
                                ) : <div style={{ color: '#6b7280' }}>No transport selected.</div>}
                            </div>

                            {/* Accommodation */}
                            <div style={{ padding: '25px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🏨 Accommodation
                                </h3>
                                {selectedStay ? (
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        {selectedStay.image && (
                                            <img src={selectedStay.image} alt="Hotel" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} crossOrigin="anonymous" />
                                        )}
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedStay.name}</div>
                                                <div style={{ color: '#4b5563', marginTop: '4px' }}>@ {selectedStay.distance}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹ {stayCost.toLocaleString('en-IN')}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>₹{selectedStay.pricePerNight}/night</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : <div style={{ color: '#6b7280' }}>No accommodation selected.</div>}
                            </div>

                            {/* Places */}
                            <div style={{ padding: '25px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📍 Places to Visit
                                </h3>
                                {selectedAttractions.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedAttractions.map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i !== selectedAttractions.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: i !== selectedAttractions.length - 1 ? '10px' : '0' }}>
                                                <span style={{ fontWeight: '500' }}>{p.name}</span>
                                                <span style={{ color: '#4b5563' }}>{p.entryFee > 0 ? `₹${p.entryFee}` : 'Free'}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div style={{ color: '#6b7280' }}>No places selected.</div>}
                            </div>

                            {/* Food */}
                            <div style={{ padding: '25px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🍽️ Must-Try Local Foods
                                </h3>
                                {selectedFoods.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedFoods.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i !== selectedFoods.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: i !== selectedFoods.length - 1 ? '10px' : '0' }}>
                                                <div>
                                                    <span style={{ fontWeight: '500' }}>{f.name}</span>
                                                    <span style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: '8px' }}>({f.restaurant})</span>
                                                </div>
                                                <span style={{ color: '#4b5563' }}>₹{f.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div style={{ color: '#6b7280' }}>Baseline daily food assumed.</div>}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {/* Markets */}
                            <div style={{ padding: '25px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🛍️ Markets
                                </h3>
                                {selectedMarkets.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedMarkets.map((m, i) => (
                                            <div key={i} style={{ borderBottom: i !== selectedMarkets.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: i !== selectedMarkets.length - 1 ? '10px' : '0' }}>
                                                <div style={{ fontWeight: '500' }}>{m.name}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{m.specialty}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div style={{ color: '#6b7280' }}>No markets added.</div>}
                            </div>

                            {/* Guide */}
                            {selectedGuide && (
                                <div style={{ padding: '25px', backgroundColor: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 15px 0', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🧑‍🏫 Local Guide
                                    </h3>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {selectedGuide.image && (
                                            <img src={selectedGuide.image} alt="Guide" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '30px' }} crossOrigin="anonymous" />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '700' }}>{selectedGuide.name}</div>
                                            <div style={{ color: '#92400e', fontSize: '0.9rem' }}>₹{guideCost.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cost Summary Box */}
                            <div style={{ 
                                padding: '30px', 
                                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8A9B 100%)', 
                                borderRadius: '20px',
                                color: 'white',
                                textAlign: 'center',
                                boxShadow: '0 10px 20px rgba(255, 77, 109, 0.2)'
                            }}>
                                <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '10px' }}>
                                    Total Estimated Cost
                                </div>
                                <div style={{ fontSize: '2.8rem', fontWeight: '800', margin: '10px 0' }}>
                                    ₹ {totalEstimated.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.95rem', opacity: 0.9, paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                                    Budget Limit: ₹ {overallBudget.toLocaleString('en-IN')}
                                </div>
                            </div>

                            {/* Currency Support Card */}
                            {localCurrency && (
                                <div style={{ 
                                    padding: '25px', 
                                    backgroundColor: 'white', 
                                    borderRadius: '20px', 
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '15px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        💱 Local Currency ({localCurrency.code})
                                    </h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '4px' }}>In {localCurrency.code}</div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10B981' }}>{localCurrency.code} {convert(totalEstimated)}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#9CA3AF' }}>
                                            Rate: 1 {localCurrency.code} = ₹{localCurrency.rate}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trip Map Card */}
                            <div style={{ 
                                padding: '25px', 
                                backgroundColor: 'white', 
                                borderRadius: '20px', 
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                overflow: 'hidden'
                            }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '15px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    🗺️ Trip Map: {destName}
                                </h3>
                                <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(destName)}&zoom=12&size=400x200&key=YOUR_GOOGLE_MAPS_KEY_HERE`} 
                                        alt="Map"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600&q=80';
                                        }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <button 
                                            onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(destName)}+attractions`, '_blank')}
                                            style={{ padding: '10px 20px', borderRadius: '30px', background: 'white', border: 'none', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Compass size={18} color="#FF4D6D" /> Open in Google Maps
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #f3f4f6', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', fontWeight: '500' }}>
                        Generated by TripEase • Plan your next adventure with ease.
                    </div>
                </div>
            </div>

            {/* HIDDEN AI OPTIMIZED ITINERARY FOR DOWNLOAD */}
            {optimizedPlan && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '100%', pointerEvents: 'none' }}>
                    <div ref={optimizedRef} style={{ width: '900px', backgroundColor: '#ffffff', padding: '60px', fontFamily: '"Inter", "Roboto", sans-serif', color: '#1f2937' }}>
                        {/* City Hero Image for Poster */}
                        <div style={{ width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', marginBottom: '30px' }}>
                            <img 
                                src={`https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80`} 
                                alt={planInfo.destination} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' }}
                            />
                        </div>

                        <div style={{ backgroundColor: '#10B981', color: 'white', padding: '40px', borderRadius: '24px', marginBottom: '40px', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>{planInfo.destination} — AI Optimized Plan</h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>{planInfo.days} Days • Highly optimized for minimal travel</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {optimizedPlan.optimizedPlan.map((day, idx) => (
                                <div key={idx} style={{ padding: '25px', border: '2px solid #E5E7EB', borderRadius: '16px', borderLeft: '8px solid #10B981' }}>
                                    <h2 style={{ margin: '0 0 15px 0', color: '#111827' }}>Day {day.day}</h2>
                                    {day.hotel && <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🏨 Hotel: {day.hotel.name}</div>}
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>📍 Places:</strong> {day.places?.map(p => p.name).join(' → ')}
                                    </div>
                                    <div>
                                        <strong>🍽️ Food:</strong> {day.food?.map(f => f.name).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
                            Total Estimated Cost: ₹{totalEstimated.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetSummary;
