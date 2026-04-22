import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrainFront, Bus, Plane, ChevronRight, Filter, Clock, CreditCard } from 'lucide-react';
import './TransportOptions.css';

const TransportOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('flights');
    const [selectedTransport, setSelectedTransport] = useState(null);

    // Get origin and destination from state, or use fallbacks
    const routeOrigin = location.state?.plan?.origin || "Mumbai";
    const routeDest = location.state?.plan?.destination || "Goa";
    const travelDate = location.state?.plan?.dates || "14 April 2026";

    // Static Demo Data (Always works)
    const transportData = {
        flights: [
            { id: 1, operator: 'IndiGo', logo: 'https://placehold.co/100x100/e6f7ff/0050b3?text=6E', depTime: '06:15 AM', arrTime: '07:30 AM', duration: '1h 15m', price: '₹3,450', from: 'BOM', to: 'GOI' },
            { id: 2, operator: 'Air India', logo: 'https://placehold.co/100x100/e6f7ff/0050b3?text=AI', depTime: '10:00 AM', arrTime: '11:20 AM', duration: '1h 20m', price: '₹4,200', from: 'BOM', to: 'GOI' }
        ],
        trains: [
            { id: 1, operator: 'Tejas Express', logo: 'https://placehold.co/100x100/fff7e6/d46b08?text=TX', depTime: '05:50 AM', arrTime: '13:30 PM', duration: '7h 40m', price: '₹1,850', from: 'CSMT', to: 'MAO' },
            { id: 2, operator: 'Konkan Kanya', logo: 'https://placehold.co/100x100/fff7e6/d46b08?text=KK', depTime: '23:05 PM', arrTime: '10:45 AM', duration: '11h 40m', price: '₹1,250', from: 'CSMT', to: 'MAO' }
        ],
        buses: [
            { id: 1, operator: 'VRL Travels', logo: 'https://placehold.co/100x100/f6ffed/389e0d?text=VRL', depTime: '21:00 PM', arrTime: '08:30 AM', duration: '11h 30m', price: '₹1,100', from: 'Borivali', to: 'Panjim', badge: 'AC Sleeper' },
            { id: 2, operator: 'Zingbus', logo: 'https://placehold.co/100x100/f6ffed/389e0d?text=ZB', depTime: '22:30 PM', arrTime: '09:00 AM', duration: '10h 30m', price: '₹950', from: 'Sion', to: 'Mapusa', badge: 'Electric AC' }
        ]
    };

    const tabs = [
        { id: 'flights', label: 'Flights', icon: <Plane size={20} /> },
        { id: 'trains', label: 'Trains', icon: <TrainFront size={20} /> },
        { id: 'buses', label: 'Buses', icon: <Bus size={20} /> }
    ];

    const currentData = transportData[activeTab] || [];

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
                            onClick={() => { setActiveTab(tab.id); setSelectedTransport(null); }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="transport-layout">
                <aside className="filters-sidebar">
                    <div className="filter-title"><Filter size={18} /> Filters</div>
                    <div className="filter-section">
                        <h4>Price</h4>
                        <input type="range" min="500" max="10000" className="filter-slider" />
                    </div>
                    <div className="filter-section">
                        <h4>Timing</h4>
                        <label className="filter-option"><input type="checkbox" /> Morning</label>
                        <label className="filter-option"><input type="checkbox" /> Evening</label>
                    </div>
                </aside>

                <main className="transport-list">
                    {currentData.length > 0 ? (
                        currentData.map(item => (
                            <div className={`transport-card ${selectedTransport?.id === item.id ? 'selected' : ''}`} key={item.id}>
                                <div className="card-left">
                                    <img src={item.logo} alt={item.operator} className="operator-logo" />
                                    <div className="operator-info">
                                        <h4>{item.operator}</h4>
                                        {item.badge && <span className="type-badge">{item.badge}</span>}
                                    </div>
                                </div>
                                <div className="card-middle">
                                    <div className="time-group">
                                        <div className="time">{item.depTime}</div>
                                        <div className="city">{item.from}</div>
                                    </div>
                                    <div className="duration-group">
                                        <div className="dur-text">{item.duration}</div>
                                        <div className="dur-line"></div>
                                    </div>
                                    <div className="time-group">
                                        <div className="time">{item.arrTime}</div>
                                        <div className="city">{item.to}</div>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <div className="price-tag">{item.price}</div>
                                    <button 
                                        className={`select-btn ${selectedTransport?.id === item.id ? 'active' : ''}`}
                                        onClick={() => setSelectedTransport(item)}
                                    >
                                        {selectedTransport?.id === item.id ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <Clock size={40} color="#ccc" />
                            <p>No {activeTab} available for this route today.</p>
                        </div>
                    )}
                </main>
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
                    onClick={() => navigate('/final-review', { state: { ...location.state, selectedTransport } })}
                >
                    Review Itinerary <ChevronRight size={20} />
                </button>
            </footer>
        </div>
    );
};

export default TransportOptions;
