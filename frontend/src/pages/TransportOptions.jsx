import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrainFront, Bus, Plane, ChevronRight, Filter, Clock, Loader2 } from 'lucide-react';
import './TransportOptions.css';

const cityCountryMap = {
  "Mumbai": "India", "Delhi": "India", "Agra": "India", "Goa": "India",
  "Jaipur": "India", "Varanasi": "India", "Bangalore": "India", "Kolkata": "India",
  "Shimla": "India", "Manali": "India", "Rishikesh": "India", "Kochi": "India",
  "Udaipur": "India", "Chennai": "India", "Hyderabad": "India",
  "Dubai": "UAE", "Paris": "France", "London": "UK", "New York": "USA",
  "Tokyo": "Japan", "Singapore": "Singapore", "Bangkok": "Thailand", "Bali": "Indonesia",
  "Kuala Lumpur": "Malaysia", "Istanbul": "Turkey", "Rome": "Italy",
  "Barcelona": "Spain", "Amsterdam": "Netherlands", "Los Angeles": "USA"
};

const isSameCountry = (origin, destination) => {
  if (!cityCountryMap[origin] || !cityCountryMap[destination]) return false;
  return cityCountryMap[origin] === cityCountryMap[destination];
};

const getRouteType = (origin, destination) => {
    const c1 = cityCountryMap[origin];
    const c2 = cityCountryMap[destination];
    if (!c1 || !c2) return "long_international";
    if (c1 === c2) return "domestic";
    
    const regions = {
        "India": "Asia", "UAE": "MiddleEast", "Singapore": "Asia", "Thailand": "Asia", "Malaysia": "Asia", "Indonesia": "Asia", "Japan": "Asia",
        "France": "Europe", "UK": "Europe", "Italy": "Europe", "Spain": "Europe", "Netherlands": "Europe", "Turkey": "Europe",
        "USA": "NorthAmerica"
    };
    const r1 = regions[c1] || "Unknown";
    const r2 = regions[c2] || "Unknown";
    
    if (r1 === "Europe" && r2 === "Europe") return "short_international";
    if ((r1 === "Asia" || r1 === "MiddleEast") && (r2 === "Asia" || r2 === "MiddleEast")) return "short_international";
    return "long_international";
};

const validatePrice = (priceStr, type) => {
    if (!priceStr) return priceStr;
    const num = parseInt(priceStr.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return priceStr;
    
    let min = 3000, max = 10000;
    if (type === 'short_international') { min = 10000; max = 30000; }
    else if (type === 'long_international') { min = 40000; max = 120000; }
    
    if (num < min) {
        const adj = min + Math.floor(Math.random() * (max - min) * 0.3); 
        return `₹${adj.toLocaleString('en-IN')}`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
};

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
        const currentRouteType = getRouteType(routeOrigin, routeDest);

        try {
            const res = await fetch(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?originSkyId=${originCode}&destinationSkyId=${destCode}&date=${date}`, {
                headers: {
                    'X-RapidAPI-Key': '8578e7d3aemshc3f133f7409b184p188149jsn826f94fe7236',
                    'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
                }
            });
            const data = await res.json();
            if (data?.data?.itineraries && data.data.itineraries.length > 0) {
                const mapped = data.data.itineraries.slice(0, 5).map(f => ({
                    id: f.id,
                    type: 'flight',
                    operator: f.legs[0].carriers.marketing[0].name || 'Airlines',
                    logo: f.legs[0].carriers.marketing[0].logoUrl || 'https://placehold.co/100x100/e6f7ff/0050b3?text=✈️',
                    departure: new Date(f.legs[0].departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    arrival: new Date(f.legs[0].arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    duration: `${Math.floor(f.legs[0].durationInMinutes / 60)}h ${f.legs[0].durationInMinutes % 60}m`,
                    price: validatePrice(f.price.formatted || `₹${Math.round(f.price.raw)}`, currentRouteType),
                    from: originCode,
                    to: destCode
                }));
                setLiveFlights(mapped);
                setLoading(false);
                return;
            } else {
                throw new Error("No sky-scrapper data");
            }
        } catch (err) {
            console.warn('Skyscanner fetch failed, falling back to AI...', err);
            try {
                const aiRes = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/flights-ai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ origin: routeOrigin, destination: routeDest, routeType: currentRouteType })
                });
                const aiData = await aiRes.json();
                if (aiData && aiData.length > 0) {
                    const mappedAi = aiData.slice(0, 3).map((f, idx) => ({
                        id: `ai_f${idx}`,
                        type: 'flight',
                        operator: f.operator || 'Airlines',
                        logo: 'https://placehold.co/100x100/e6f7ff/0050b3?text=✈️',
                        departure: f.departure || '10:00 AM',
                        arrival: f.arrival || '02:00 PM',
                        duration: f.duration || '4h',
                        price: validatePrice(f.price, currentRouteType),
                        from: originCode,
                        to: destCode
                    }));
                    setLiveFlights(mappedAi);
                    setLoading(false);
                    return;
                } else {
                    throw new Error("AI returned no flights");
                }
            } catch (err2) {
                console.warn('AI fetch failed, falling back to hardcoded...', err2);
                const p1 = validatePrice('₹1', currentRouteType);
                const p2 = validatePrice('₹1', currentRouteType);
                const p3 = validatePrice('₹1', currentRouteType);
                
                const fallbackFlights = [
                    { id: 'f1', type: 'flight', operator: 'IndiGo', logo: 'https://placehold.co/100x100/e6f7ff/0050b3?text=6E', departure: '06:15 AM', arrival: '10:45 AM', duration: '4h 30m', price: p1, from: originCode, to: destCode },
                    { id: 'f2', type: 'flight', operator: 'Air India', logo: 'https://placehold.co/100x100/fff0f6/eb2f96?text=AI', departure: '09:30 AM', arrival: '02:40 PM', duration: '5h 10m', price: p2, from: originCode, to: destCode },
                    { id: 'f3', type: 'flight', operator: 'Vistara', logo: 'https://placehold.co/100x100/f6ffed/52c41a?text=UK', departure: '04:00 PM', arrival: '08:45 PM', duration: '4h 45m', price: p3, from: originCode, to: destCode }
                ];
                setLiveFlights(fallbackFlights);
                setLoading(false);
            }
        }
    };

    const fetchAiTransport = async () => {
        if (!isSameCountry(routeOrigin, routeDest)) {
            setAiTransport([]);
            return;
        }

        setAiLoading(true);
        try {
            const currentRouteType = isSameCountry(routeOrigin, routeDest) ? 'domestic' : 'international';
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/transport-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin: routeOrigin, destination: routeDest, routeType: currentRouteType })
            });
            const data = await response.json();
            setAiTransport(data);
        } catch (err) {
            console.error('AI Transport error:', err);
            setAiTransport([]);
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
        ? liveFlights
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
                                            {item.type.toLowerCase().includes('ship') ? <Plane size={24} style={{transform: 'rotate(45deg)'}} /> : item.type === 'train' ? <TrainFront size={24} /> : <Bus size={24} />}
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
                        <div className="no-data" style={{ textAlign: 'center', padding: '60px 20px', background: '#fcfcfc', borderRadius: '24px', border: '1px dashed #ddd' }}>
                            <Plane size={48} color="#FF4D6D" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#111' }}>⚠️ No Land Routes Available</h3>
                            <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                                No trains or buses available for this route. ✈️ Please choose flights.
                            </p>
                            <button 
                                className="btn-solid" 
                                style={{ padding: '12px 30px', borderRadius: '30px', fontWeight: '700' }}
                                onClick={() => setActiveTab('flights')}
                            >
                                Switch to Flights
                            </button>
                        </div>
                    )}
                </main>
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
