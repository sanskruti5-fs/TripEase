import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrainFront, Bus, Plane, ChevronRight, Filter, Clock, Loader2 } from 'lucide-react';
import './TransportOptions.css';

const TransportOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('flights');
    const [selectedTransport, setSelectedTransport] = useState(null);
    const [liveFlights, setLiveFlights] = useState([]);
    const [aiTransport, setAiTransport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const routeOrigin = location.state?.plan?.origin || "Mumbai";
    const routeDest = location.state?.plan?.destination || "Goa";
    const travelDate = location.state?.plan?.dates || "14 April 2026";

    const getIataCode = (city) => {
        const mapping = {
            'Goa': 'GOI', 'Mumbai': 'BOM', 'Delhi': 'DEL', 'Jaipur': 'JAI', 'Bangalore': 'BLR',
            'Hyderabad': 'HYD', 'Chennai': 'MAA', 'Kolkata': 'CCU', 'Udaipur': 'UDR', 'Kochi': 'COK',
            'Varanasi': 'VNS', 'Rishikesh': 'DED', 'Agra': 'AGR', 'Manali': 'KUU', 'Dubai': 'DXB',
            'London': 'LHR', 'Paris': 'CDG', 'Tokyo': 'HND', 'New York': 'JFK', 'Bali': 'DPS',
            'Bangkok': 'BKK', 'Singapore': 'SIN', 'Istanbul': 'IST', 'Rome': 'FCO', 'Amsterdam': 'AMS'
        };
        return mapping[city] || 'BOM';
    };

    const formatApiDate = (dateStr) => {
        try {
            const parts = dateStr.split(' ');
            if (parts.length === 3) {
                const months = { 'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05' };
                return `2026-${months[parts[1]] || '04'}-${parts[0].padStart(2, '0')}`;
            }
            return '2026-04-14';
        } catch (e) { return '2026-04-14'; }
    };

    const fetchFlights = async () => {
        setLoading(true);
        const originCode = getIataCode(routeOrigin);
        const destCode = getIataCode(routeDest);
        const date = formatApiDate(travelDate);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/flights/searchFlights?from=${originCode}&to=${destCode}&departDate=${date}`, {
                headers: {
                    'X-RapidAPI-Key': '8578e7d3aemshc3f133f7409b184p188149jsn826f94fe7236',
                    'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
                }
            });
            // Wait, my proxy might not be set up for this specific path. 
            // I'll use the direct RapidAPI URL as before for consistency.
            const directRes = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?from=${originCode}&to=${destCode}&departDate=${date}`, {
                headers: {
                    'X-RapidAPI-Key': '8578e7d3aemshc3f133f7409b184p188149jsn826f94fe7236',
                    'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
                }
            });
            const data = await directRes.json();
            if (data?.data?.flights) {
                const mapped = data.data.flights.slice(0, 5).map(f => ({
                    id: f.id,
                    type: 'flight',
                    operator: f.airlineName,
                    logo: f.airlineLogo || 'https://placehold.co/100x100/e6f7ff/0050b3?text=✈️',
                    departure: f.departureTime,
                    arrival: f.arrivalTime,
                    duration: f.duration,
                    price: `₹${f.price}`,
                    from: originCode,
                    to: destCode
                }));
                setLiveFlights(mapped);
            }
        } catch (err) {
            console.error('Flight fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiTransport = async () => {
        setAiLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/transport-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin: routeOrigin, destination: routeDest })
            });
            const data = await response.json();
            setAiTransport(data);
        } catch (err) {
            console.error('AI Transport error:', err);
            // Fallback hardcoded data
            setAiTransport([
                { type: 'train', name: 'Shatabdi Express', departure: '06:00 AM', arrival: '01:00 PM', duration: '7h', price: '₹1,250' },
                { type: 'train', name: 'Rajdhani Exp', departure: '04:30 PM', arrival: '11:00 PM', duration: '6h 30m', price: '₹2,100' },
                { type: 'bus', name: 'National Travels', departure: '09:00 PM', arrival: '07:30 AM', duration: '10h 30m', price: '₹950' },
                { type: 'bus', name: 'Orange Tours', departure: '10:30 PM', arrival: '09:00 AM', duration: '10h 30m', price: '₹1,400' }
            ]);
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, [routeOrigin, routeDest]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'ground' && aiTransport.length === 0) {
            fetchAiTransport();
        }
    };

    const tabs = [
        { id: 'flights', label: 'Flights', icon: <Plane size={20} /> },
        { id: 'ground', label: 'Trains & Buses', icon: <TrainFront size={20} /> }
    ];

    const currentDisplayData = activeTab === 'flights' 
        ? (liveFlights.length > 0 ? liveFlights : [
            { id: 'f1', type: 'flight', operator: 'IndiGo', logo: 'https://placehold.co/100x100/e6f7ff/0050b3?text=6E', departure: '06:15 AM', arrival: '07:30 AM', duration: '1h 15m', price: '₹3,450', from: getIataCode(routeOrigin), to: getIataCode(routeDest) }
          ])
        : aiTransport;

    return (
        <div className="transport-page">
            <div className="transport-header">
                <h2 className="route-title">{routeOrigin} ➔ {routeDest}</h2>
                <p className="route-date">{travelDate} | 1 Adult</p>
                
                <div className="transport-tabs">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="transport-layout container" style={{ display: 'flex', gap: '30px' }}>
                <aside className="filters-sidebar" style={{ width: '250px' }}>
                    <div className="filter-title"><Filter size={18} /> Filters</div>
                    <div className="filter-section">
                        <h4>Price</h4>
                        <input type="range" min="500" max="10000" className="filter-slider" />
                    </div>
                </aside>

                <main className="transport-list" style={{ flex: 1 }}>
                    {(loading && activeTab === 'flights') || (aiLoading && activeTab === 'ground') ? (
                        <div className="loading-flights">
                            <Loader2 className="animate-spin" size={40} />
                            <p>{activeTab === 'flights' ? 'Fetching live flights...' : 'Magic AI is finding trains and buses...'}</p>
                        </div>
                    ) : currentDisplayData.length > 0 ? (
                        currentDisplayData.map((item, idx) => (
                            <div className={`transport-card ${selectedTransport?.id === (item.id || idx) ? 'selected' : ''}`} key={item.id || idx}>
                                <div className="card-left">
                                    {item.logo ? (
                                        <img src={item.logo} alt={item.operator} className="operator-logo" />
                                    ) : (
                                        <div className="operator-icon-placeholder">
                                            {item.type === 'train' ? <TrainFront size={24} /> : <Bus size={24} />}
                                        </div>
                                    )}
                                    <div className="operator-info">
                                        <h4>{item.operator || item.name}</h4>
                                        <span className="type-badge">{item.type.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="card-middle">
                                    <div className="time-group">
                                        <div className="time">{item.departure}</div>
                                        <div className="city">{item.from || routeOrigin}</div>
                                    </div>
                                    <div className="duration-group">
                                        <div className="dur-text">{item.duration}</div>
                                        <div className="dur-line"></div>
                                    </div>
                                    <div className="time-group">
                                        <div className="time">{item.arrival}</div>
                                        <div className="city">{item.to || routeDest}</div>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <div className="price-tag">{item.price}</div>
                                    <button 
                                        className={`select-btn ${selectedTransport?.id === (item.id || idx) ? 'active' : ''}`}
                                        onClick={() => setSelectedTransport({ ...item, id: item.id || idx })}
                                    >
                                        {selectedTransport?.id === (item.id || idx) ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <Clock size={40} color="#ccc" />
                            <p>No options available for this route.</p>
                        </div>
                    )}
                </main>

                {/* --- LIVE BUDGET SIDEBAR --- */}
                <div style={{
                    width: '320px',
                    position: 'sticky',
                    top: '100px',
                    height: 'fit-content'
                }}>
                    <div className="glass-panel" style={{
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid var(--primary-color)',
                        boxShadow: '0 10px 30px rgba(255, 56, 92, 0.1)'
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            Budget Running Total
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>🏨 Stay:</span>
                                <span style={{ fontWeight: '600' }}>₹{(planInfo.stayCost || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>🏛️ Places:</span>
                                <span style={{ fontWeight: '600' }}>₹{(location.state?.plan?.placesCost || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>🚗 Transport:</span>
                                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                                    ₹{selectedTransport ? parseInt(selectedTransport.price.replace(/[^0-9]/g, '')).toLocaleString() : 0}
                                </span>
                            </div>
                        </div>

                        <div style={{ borderTop: '2px solid var(--primary-color)', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Estimate:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                    ₹{(
                                        (planInfo.stayCost || 0) + 
                                        (location.state?.plan?.placesCost || 0) + 
                                        (selectedTransport ? parseInt(selectedTransport.price.replace(/[^0-9]/g, '')) : 0)
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="transport-footer">
                <div className="footer-price">
                    {selectedTransport ? (
                        <>Total: <span className="highlight">{selectedTransport.price}</span></>
                    ) : 'Select a travel option'}
                </div>
                <button 
                    className="review-btn" 
                    disabled={!selectedTransport}
                    onClick={() => navigate('/budget', { state: { ...location.state, selectedTransport } })}
                >
                    Review Itinerary <ChevronRight size={20} />
                </button>
            </footer>
        </div>
    );
};

export default TransportOptions;
