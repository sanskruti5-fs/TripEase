import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, MapPin, Calendar, Users, Download, ArrowRight, CheckCircle, Camera, Award, Star, Compass, TrainFront, Plane, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

const BudgetSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const planInfo = location.state?.plan;
    const selectedAttractions = location.state?.selectedAttractions || [];
    const selectedFoods = location.state?.selectedFoods || [];
    const selectedMarkets = location.state?.selectedMarkets || [];
    const selectedStay = location.state?.selectedStay || planInfo?.selectedStay;
    const selectedTransport = location.state?.selectedTransport;
    const selectedGuide = location.state?.selectedGuide;

    const itineraryRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    // Helper to parse prices
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    // Cost Extraction & Logic
    const stayCost = selectedStay ? (selectedStay.pricePerNight * planInfo.days) : (planInfo.stayCost || 0);
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
        if (!itineraryRef.current) return;
        
        try {
            const canvas = await html2canvas(itineraryRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#F9FAFB',
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    const header = clonedDoc.querySelector('.download-header-premium');
                    const noCapture = clonedDoc.querySelectorAll('.no-capture');
                    if (header) header.style.display = 'block';
                    noCapture.forEach(el => el.style.display = 'none');
                }
            });
            
            const link = document.createElement('a');
            link.download = `TripEase-${planInfo.destination}-Itinerary.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download Error:', err);
            alert('Failed to generate itinerary image. Please try again.');
        }
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '100px 0' }}>
            <div ref={itineraryRef} className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
                
                {/* 0. Premium Download Header (Visible in PNG) */}
                <div className="download-header-premium" style={{ display: 'none', textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #FF4D6D', paddingBottom: '30px' }}>
                    <div style={{ color: '#FF4D6D', fontWeight: '800', fontSize: '1.5rem', marginBottom: '10px' }}>✨ TRIPES PREMIUM ITINERARY</div>
                    <h1 style={{ fontSize: '3rem', margin: '0' }}>{planInfo.destination}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>Curated for {user?.name || 'Explorer'}</p>
                </div>

                {/* 1. Header Section */}
                <div className="no-capture" style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#FF4D6D', marginBottom: '12px' }}>Final Itinerary & Budget Review</h1>
                    <p style={{ color: '#717171', fontSize: '1.2rem' }}>Review your selections, check your budget, and download your full plan.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7.5fr) minmax(0, 4.5fr)', gap: '40px' }}>
                    
                    {/* LEFT COLUMN: The Itinerary Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
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
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Accommodation ({planInfo.days} Days)</h3>
                            {selectedStay ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <img src={selectedStay.image} alt="Hotel" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '12px' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedStay.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#717171' }}>@ {selectedStay.distance}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹ {stayCost.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>₹ {selectedStay.pricePerNight} / night</div>
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
                            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #FCD34D', borderLeft: '6px solid #F59E0B', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Local Guide (Optional Add-on)</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <img src={selectedGuide.image} alt="Guide" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedGuide.name} ({selectedGuide.title})</div>
                                            <div style={{ fontSize: '0.9rem', color: '#717171' }}>• {selectedGuide.experience} exp</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹ {guideCost.toLocaleString('en-IN')}</div>
                                </div>
                            </div>
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

                            <button 
                                onClick={handleDownload}
                                className="no-capture"
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
                                <Download size={22} /> Download Complete Itinerary
                            </button>

                            <div className="no-capture" style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Link to="/planner" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem' }}>← Start Over</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;
