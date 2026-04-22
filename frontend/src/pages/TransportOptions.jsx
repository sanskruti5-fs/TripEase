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

    const planInfo = location.state?.plan || {};
    const routeOrigin = planInfo.origin || "Mumbai";
    const routeDest = planInfo.destination || "Goa";
    const travelDate = planInfo.dates || "14 April 2026";

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
            const res = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?from=${originCode}&to=${destCode}&departDate=${date}`, {
                headers: {
                    'X-RapidAPI-Key': '8578e7d3aemshc3f133f7409b184p188149jsn826f94fe7236',
                    'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
                }
            });
            const data = await res.json();
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
            setAiTransport([
                { id: 't1', type: 'train', name: 'Shatabdi Express', departure: '06:00 AM', arrival: '01:00 PM', duration: '7h', price: '₹1,250' },
                { id: 't2', type: 'train', name: 'Rajdhani Exp', departure: '04:30 PM', arrival: '11:00 PM', duration: '6h 30m', price: '₹2,100' },
                { id: 'b1', type: 'bus', name: 'National Travels', departure: '09:00 PM', arrival: '07:30 AM', duration: '10h 30m', price: '₹950' },
                { id: 'b2', type: 'bus', name: 'Orange Tours', departure: '10:30 PM', arrival: '09:00 AM', duration: '10h 30m', price: '₹1,400' }
            ]);
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'flights') {
            fetchFlights();
        } else {
            fetchAiTransport();
        }
    }, [activeTab, routeOrigin, routeDest]);

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
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="transport-layout container">
                <aside className="filters-sidebar">
                    <div className="filter-title"><Filter size={18} /> Filters</div>
                    <div className="filter-section">
                        <h4>Price</h4>
                        <input type="range" min="500" max="10000" className="filter-slider" />
                    </div>
                </aside>

                <main className="transport-list">
                    {(loading && activeTab === 'flights') || (aiLoading && activeTab === 'ground') ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>{activeTab === 'flights' ? 'Fetching live flights...' : 'Magic AI is finding trains and buses...'}</p>
                        </div>
                    ) : currentDisplayData.length > 0 ? (
                        currentDisplayData.map((item, idx) => (
                            <div className={`transport-card ${selectedTransport?.id === (item.id || idx) ? 'selected' : ''}`} key={item.id || idx}>
                                <div className="card-left">
                                    {item.logo ? (
                                        <img src={item.logo} alt={item.operator} className="operator-img" />
                                    ) : (
                                        <div className="operator-icon-placeholder">
                                            {item.type === 'train' ? <TrainFront size={24} /> : <Bus size={24} />}
                                        </div>
                                    )}
                                    <div className="card-details">
                                        <h4>{item.operator || item.name}</h4>
                                        <span className="badge">{item.type.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="card-middle">
                                    <div className="time-block">
                                        <div className="time">{item.departure}</div>
                                        <div className="place">{item.from || routeOrigin}</div>
                                    </div>
                                    <div className="duration-block">
                                        <div className="duration-text">{item.duration}</div>
                                        <div className="duration-line"></div>
                                    </div>
                                    <div className="time-block">
                                        <div className="time">{item.arrival}</div>
                                        <div className="place">{item.to || routeDest}</div>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <div className="price">{item.price}</div>
                                    <button 
                                        className="btn-select"
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
                    height: 'fit-content',
                    display: window.innerWidth > 900 ? 'block' : 'none'
                }}>
                    <div className="glass-panel" style={{
                        padding: '24px',
                        borderRadius: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #FF4D6D',
                        boxShadow: '0 10px 30px rgba(255, 77, 109, 0.1)'
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            Budget Running Total
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#717171', fontSize: '0.9rem' }}>🏨 Stay:</span>
                                <span style={{ fontWeight: '600' }}>₹{(planInfo.stayCost || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#717171', fontSize: '0.9rem' }}>🏛️ Places:</span>
                                <span style={{ fontWeight: '600' }}>₹{(planInfo.placesCost || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#717171', fontSize: '0.9rem' }}>🚗 Transport:</span>
                                <span style={{ fontWeight: '600', color: '#FF4D6D' }}>
                                    ₹{selectedTransport ? parseInt(selectedTransport.price.replace(/[^0-9]/g, '')).toLocaleString() : 0}
                                </span>
                            </div>
                        </div>

                        <div style={{ borderTop: '2px solid #FF4D6D', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Estimate:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#FF4D6D' }}>
                                    ₹{(
                                        (planInfo.stayCost || 0) + 
                                        (planInfo.placesCost || 0) + 
                                        (selectedTransport ? parseInt(selectedTransport.price.replace(/[^0-9]/g, '')) : 0)
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky-footer">
                <div style={{ fontSize: '1.2rem' }}>
                    {selectedTransport ? (
                        <>Selected: <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>{selectedTransport.operator || selectedTransport.name}</span> ({selectedTransport.price})</>
                    ) : 'Please select a travel option to proceed'}
                </div>
                <button 
                    className="btn-primary-next" 
                    disabled={!selectedTransport}
                    onClick={() => navigate('/final-review', { state: { ...location.state, selectedTransport } })}
                >
                    Review Final Plan <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default TransportOptions;
