import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, MapPin, Calendar, Users, Download, ArrowRight, CheckCircle, Camera, Award, Star, Compass } from 'lucide-react';
import html2canvas from 'html2canvas';

const BudgetSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const planInfo = location.state?.plan;
    const selectedAttractions = location.state?.selectedAttractions || [];
    const selectedFoods = location.state?.selectedFoods || [];
    const selectedMarkets = location.state?.selectedMarkets || [];
    const selectedStay = location.state?.selectedStay;
    const selectedTransport = location.state?.selectedTransport;
    const selectedGuide = location.state?.selectedGuide;

    const itineraryRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const bookingId = `TE${Math.floor(100000 + Math.random() * 900000)}`;

    const [isDownloaded, setIsDownloaded] = useState(false);

    if (!planInfo) {
        return <Navigate to="/planner" replace />;
    }

    // Cost Extraction & Logic
    const stayCost = selectedStay ? (selectedStay.pricePerNight * planInfo.days) : (planInfo.stayCost || 0);
    const transportCost = planInfo.transportCost || 0;
    const guideCost = selectedGuide ? (selectedGuide.pricePerDay * planInfo.days) : (planInfo.guideCost || 0);

    const attractionsCost = selectedAttractions.reduce((sum, item) => sum + (item.entryFee || 0), 0);
    const extraFoodCost = selectedFoods.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Baseline food per day
    const baseFoodCost = planInfo.days * 800; // Estimated 800/day
    const totalFoodCost = baseFoodCost + extraFoodCost;

    const totalEstimated = stayCost + transportCost + guideCost + attractionsCost + totalFoodCost;
    const overallBudget = planInfo.budget || 0;

    const handleDownloadPhoto = async () => {
        if (!itineraryRef.current) {
            console.error('Itinerary Ref is null');
            return;
        }
        
        console.log('Starting photo download...');
        setIsDownloaded(true);
        
        try {
            const canvas = await html2canvas(itineraryRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true, 
                onclone: (clonedDoc) => {
                    console.log('Cloning for capture...');
                    const captureEl = clonedDoc.querySelector('.capture-wrapper');
                    const photoHeader = clonedDoc.querySelector('.capture-only-header');
                    const photoFooter = clonedDoc.querySelector('.capture-only-footer');
                    const screenOnly = clonedDoc.querySelectorAll('.no-capture');
                    
                    if (captureEl) {
                        captureEl.style.padding = '40px';
                        captureEl.style.width = '1200px';
                        captureEl.style.background = '#ffffff';
                        captureEl.style.display = 'block';
                        captureEl.style.position = 'relative';
                        captureEl.style.zIndex = '9999';
                    }
                    if (photoHeader) {
                        photoHeader.style.display = 'block';
                        photoHeader.style.visibility = 'visible';
                    }
                    if (photoFooter) {
                        photoFooter.style.display = 'block';
                        photoFooter.style.visibility = 'visible';
                    }
                    screenOnly.forEach(el => {
                        el.style.display = 'none';
                    });
                }
            });
            
            console.log('Canvas generated:', canvas.width, 'x', canvas.height);
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas to Blob failed');
                    alert('Failed to generate image data. Please try again.');
                    return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `TripEase-Report-${planInfo.destination}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('Download triggered successfully');
            }, 'image/png', 1.0);

        } catch (err) {
            console.error('Download Error:', err);
            alert('Error generating report: ' + err.message);
        } finally {
            setTimeout(() => setIsDownloaded(false), 5000);
        }
    };

    const destinationImg = `/images/${planInfo.destination.toLowerCase().replace(/\s+/g, '-')}/hero.png`;

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', maxWidth: '1280px', margin: '0 auto' }}>
            
            <div className="no-capture" style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>Final Itinerary & Budget Review</h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Review your selections, check your budget, and download your full plan.</p>
            </div>

            <div ref={itineraryRef} className="capture-wrapper" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                {/* 0. Premium Hero & Document Header (Capture Only) */}
                <div className="capture-only-header" style={{ display: 'none', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Compass size={32} color="#FF4D6D" />
                            <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-1px' }}>TripEase</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Final Travel Itinerary & Budget Review</h2>
                            <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>Traveler: {user?.name || 'Guest'} • Booking ID: {bookingId}</p>
                        </div>
                    </div>

                    <div style={{ 
                        height: '400px', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        marginBottom: '40px'
                    }}>
                        <img 
                            src={destinationImg} 
                            alt={planInfo.destination}
                            crossOrigin="anonymous"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                        <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '40px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF4D6D', fontWeight: '800', marginBottom: '12px', fontSize: '0.9rem', letterSpacing: '2px' }}>
                                <Star size={16} fill="#FF4D6D" /> CERTIFIED TRIP PLAN
                            </div>
                            <h1 style={{ color: 'white', fontSize: '4rem', margin: 0, letterSpacing: '-2px' }}>{planInfo.destination}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', margin: '8px 0 0 0' }}>
                                A simple curated {planInfo.days}-day {planInfo.tripType || 'Adventure'} trip plan for {user?.name || 'you'}.
                            </p>
                        </div>
                    </div>
                </div>

            {/* Strict 12-Column Grid (8:4) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '48px', alignItems: 'start' }} className="budget-grid-layout">
                <style>{`
                    @media (max-width: 900px) {
                        .budget-grid-layout { grid-template-columns: 1fr !important; }
                    }
                    .itinerary-card {
                        background: #ffffff;
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 24px;
                        border: 1px solid var(--border-color, #EBEBEB);
                        box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.05));
                    }
                    .itinerary-header {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #222;
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .list-item-clean {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    .list-item-clean:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }
                    .budget-row {
                        display: grid;
                        grid-template-columns: 1fr auto;
                        padding: 12px 0;
                        border-bottom: 1px solid #f0f0f0;
                        font-size: 1.05rem;
                    }
                    .budget-row-label {
                        color: #555;
                    }
                    .budget-row-val {
                        font-weight: 600;
                        color: #222;
                        text-align: right;
                    }
                `}</style>

                {/* LEFT COLUMN: Itemized Itinerary (8 Columns) */}
                <div>
                    {/* 1. Trip Header */}
                    <div className="itinerary-card" style={{ borderTop: '4px solid #FF4D6D' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {planInfo.origin} <ArrowRight size={24} color="#FF4D6D" /> {planInfo.destination}
                                </h2>
                                <div style={{ color: '#666', display: 'flex', gap: '16px', fontSize: '1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16}/> {planInfo.dates || `${planInfo.days} Days`}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16}/> 1 Passenger</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Transport Card */}
                    <div className="itinerary-card">
                        <div className="itinerary-header">Intercity Transport</div>
                        {selectedTransport ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fafafa', padding: '16px', borderRadius: '12px' }}>
                                {selectedTransport.logo ? (
                                    <img src={selectedTransport.logo} alt="Operator" style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '4px', border: '1px solid #eee' }} />
                                ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FF4D6D' }}>{selectedTransport.badge || 'CAB'}</span></div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{selectedTransport.operator}</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        {selectedTransport.depTime ? `${selectedTransport.depTime} — ${selectedTransport.arrTime} (${selectedTransport.duration})` : selectedTransport.badge}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#222' }}>
                                    {selectedTransport.price}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#777', margin: 0 }}>Self-driven or no transport required.</p>
                        )}
                    </div>

                    {/* 3. Accommodation Card */}
                    <div className="itinerary-card">
                        <div className="itinerary-header">Accommodation ({planInfo.days} Days)</div>
                        {selectedStay ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fafafa', padding: '16px', borderRadius: '12px' }}>
                                <img src={selectedStay.image} alt="Hotel" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{selectedStay.name}</h4>
                                    <div style={{ fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14}/> {selectedStay.distance || 'City Center'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#222' }}>₹{stayCost.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#777' }}>₹{selectedStay.pricePerNight} / night</div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#777', margin: 0 }}>No accommodation strictly booked.</p>
                        )}
                    </div>

                    {/* 4. Activities & Places */}
                    <div className="itinerary-card">
                        <div className="itinerary-header">Activities & Places to Visit</div>
                        {selectedAttractions?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selectedAttractions.map((att, idx) => (
                                    <li key={idx} className="list-item-clean">
                                        <span style={{ fontWeight: 500, color: '#333' }}>{att.name}</span>
                                        <span style={{ color: '#777', fontSize: '0.95rem' }}>{att.entryFee > 0 ? `₹${att.entryFee}` : 'Free'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p style={{ color: '#777', margin: 0 }}>No explicit activities selected.</p>}
                    </div>

                    {/* 5. Famous Foods */}
                    <div className="itinerary-card">
                        <div className="itinerary-header">Must-Try Local Foods</div>
                        {selectedFoods?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selectedFoods.map((food, idx) => (
                                    <li key={idx} className="list-item-clean">
                                        <div>
                                            <span style={{ fontWeight: 500, color: '#333' }}>{food.name} </span>
                                            <span style={{ color: '#888', fontSize: '0.85rem' }}>({food.restaurant})</span>
                                        </div>
                                        <span style={{ color: '#777', fontSize: '0.95rem' }}>₹{food.price}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p style={{ color: '#777', margin: 0 }}>Basic daily food budget assumed.</p>}
                    </div>

                    {/* 6. Local Markets */}
                    <div className="itinerary-card">
                        <div className="itinerary-header">Local Markets to Explore</div>
                        {selectedMarkets?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selectedMarkets.map((market, idx) => (
                                    <li key={idx} className="list-item-clean">
                                        <span style={{ fontWeight: 500, color: '#333' }}>{market.name}</span>
                                        <span style={{ color: '#777', fontSize: '0.85rem' }}>{market.specialty}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p style={{ color: '#777', margin: 0 }}>No local markets added.</p>}
                    </div>

                    {/* 7. Local Guide (Optional) */}
                    {selectedGuide && (
                        <div className="itinerary-card" style={{ borderLeft: '4px solid #F59E0B' }}>
                            <div className="itinerary-header">Local Guide (Optional Add-on)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '8px 0' }}>
                                <img src={selectedGuide.image} alt={selectedGuide.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>{selectedGuide.name}</h4>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{selectedGuide.title} • {selectedGuide.experience} Exp</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#222' }}>₹{guideCost.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#777' }}>₹{selectedGuide.pricePerDay}/day</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sticky Budget Summary (4 Columns) */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="itinerary-card"
                        style={{ position: 'sticky', top: '100px', padding: '32px 24px', boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.08))' }}
                    >
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', fontSize: '1.4rem' }}>
                            <Wallet color="var(--primary-color)" /> Final Budget Summary
                        </h2>

                        <div style={{ marginBottom: '32px' }}>
                            <div className="budget-row">
                                <span className="budget-row-label">Transport</span>
                                <span className="budget-row-val">₹ {transportCost.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="budget-row">
                                <span className="budget-row-label">Accommodation</span>
                                <span className="budget-row-val">₹ {stayCost.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="budget-row">
                                <span className="budget-row-label">Activities & Entry Fees</span>
                                <span className="budget-row-val">₹ {attractionsCost.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="budget-row">
                                <span className="budget-row-label">Food (Est. + Selected)</span>
                                <span className="budget-row-val">₹ {totalFoodCost.toLocaleString('en-IN')}</span>
                            </div>
                            {selectedGuide && (
                                <div className="budget-row">
                                    <span className="budget-row-label" style={{ color: '#F59E0B' }}>Local Guide Fee</span>
                                    <span className="budget-row-val">₹ {guideCost.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                        </div>

                        {/* Total Block */}
                        <div style={{
                            backgroundColor: '#FF4D6D',
                            color: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            marginBottom: '32px',
                            boxShadow: '0 8px 24px rgba(255, 77, 109, 0.3)'
                        }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', opacity: '0.9', marginBottom: '8px' }}>
                                Total Estimated Cost
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>
                                ₹ {totalEstimated.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.85rem', marginTop: '12px', opacity: '0.9', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                Budget Limit: ₹ {overallBudget.toLocaleString('en-IN')}
                            </div>
                        </div>

                        {/* Warnings if Over Budget */}
                        {totalEstimated > overallBudget ? (
                            <div style={{ background: '#fff0f3', color: '#d32f2f', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600', textAlign: 'center' }}>
                                Note: Your itinerary exceeds your set budget limit!
                            </div>
                        ) : (
                            <div style={{ background: '#e6ffe6', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600', textAlign: 'center' }}>
                                Great! Your trip is under budget.
                            </div>
                        )}

                        {/* Download CTA */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn-primary-custom no-capture"
                                onClick={handleDownloadPhoto}
                                disabled={isDownloaded}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    fontSize: '1.1rem', 
                                    borderRadius: '12px', 
                                    backgroundColor: isDownloaded ? '#28a745' : '#FF4D6D', 
                                    color: 'white', 
                                    border: 'none',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: isDownloaded ? '0 8px 16px rgba(40, 167, 69, 0.3)' : '0 8px 16px rgba(255, 77, 109, 0.3)',
                                    cursor: isDownloaded ? 'default' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isDownloaded ? (
                                    <><CheckCircle size={20} /> Itinerary Saved!</>
                                ) : (
                                    <><Camera size={20} /> Download Premium Photo</>
                                )}
                            </button>
                            
                            <button 
                                onClick={handleDownloadPhoto} /* Re-using handleDownloadPhoto logic or original logic if preferred */
                                className="btn-secondary-custom no-capture"
                                style={{ width: '100%', fontSize: '0.9rem', padding: '12px' }}
                            >
                                <Download size={16} /> Save as PDF Report
                            </button>
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/planner" style={{ color: '#777', textDecoration: 'none', fontSize: '0.95rem' }}>← Start Over</Link>
                        </div>
                    </motion.div>
                </div>
            </div>
                
            {/* Final Footer (Capture Only) */}
                <div className="capture-only-footer" style={{ display: 'none', textAlign: 'center', marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee', color: '#999', fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '8px' }}>Generated by TripEase. Use for travel reference. Not a final booking confirmation.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <span>www.tripease.com</span>
                        <span>•</span>
                        <span>Your Local Travel Partner</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;
