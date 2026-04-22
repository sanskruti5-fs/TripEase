import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import itineraryData from '../data/itineraryData.json';
import './TransportOptions.css';

const TransportOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('flights');
  const [selectedTransport, setSelectedTransport] = useState(null);
  
  // Tasks 1 & 2: State and API Logic
  const [liveFlights, setLiveFlights] = useState([]);
  const [liveTrains, setLiveTrains] = useState([]);
  const [liveBuses, setLiveBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeOrigin = location.state?.plan?.origin || "Mumbai";
  const routeDest = location.state?.plan?.destination || "Goa";
  const travelDate = location.state?.plan?.dates || "14 April 2026";

  const fetchTransportData = async (type) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/transport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: routeOrigin, destination: routeDest, type })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`AI ${type} fetch failed:`, err);
      return [];
    }
  };

  const fetchAllTransport = async () => {
    setIsLoading(true);
    
    // Fetch Flights
    const originInfo = getIataCode(routeOrigin);
    const destInfo = getIataCode(routeDest);
    const departDate = formatApiDate(travelDate);
    const fallbackHub = destInfo.region === 'international' ? 'international' : 'domestic_india';

    try {
      const flightApiUrl = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?from=${originInfo.code}&to=${destInfo.code}&departDate=${departDate}`;
      const flightRes = await fetch(flightApiUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '8578e7d3aemshc3f133f7409b184p188149jsn826f94fe7236',
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });
      if (flightRes.ok) {
        const flightData = await flightRes.json();
        const norm = normalizeFlightData(flightData, originInfo.code, destInfo.code);
        setLiveFlights(norm.length > 0 ? norm : itineraryData.transport[fallbackHub].flights);
      } else {
        setLiveFlights(itineraryData.transport[fallbackHub].flights);
      }
    } catch (e) {
      setLiveFlights(itineraryData.transport[fallbackHub].flights);
    }

    // Fetch AI Trains & Buses
    const trains = await fetchTransportData('trains');
    const buses = await fetchTransportData('buses');
    
    setLiveTrains(trains.length > 0 ? trains : [
      { id: 1, operator: 'Konkan Kanya Exp', depTime: '23:05 PM', arrTime: '10:50 AM', duration: '11h 45m', price: '₹1,450', from: 'CSMT', to: 'MAO' }
    ]);
    setLiveBuses(buses.length > 0 ? buses : [
      { id: 1, operator: 'VRL Travels', badge: 'A/C Sleeper', depTime: '22:00 PM', arrTime: '09:30 AM', duration: '11h 30m', price: '₹1,500', from: 'Sion', to: 'Mapusa' }
    ]);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllTransport();
  }, []);

  const cabsData = [
    { id: 1, operator: 'Swift Dzire or similar', badge: 'Sedan', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80', luggage: '2 Bags', pax: '4 Seats', price: '₹8,500' },
    { id: 2, operator: 'Innova Crysta', badge: 'SUV', image: 'https://images.unsplash.com/photo-1669022648719-75b244791ee0?auto=format&fit=crop&w=300&q=80', luggage: '4 Bags', pax: '6 Seats', price: '₹12,000' }
  ];

  return (
    <div className="transport-page">
      {/* HEADER & ROUTE */}
      <div className="transport-header">
        <h2 className="route-title">{routeOrigin} ➔ {routeDest}</h2>
        <p className="route-date">{travelDate} | 1 Passenger</p>
        
        <div className="transport-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedTransport(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="transport-layout">
        {/* SIDEBAR FILTERS */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <input type="range" min="500" max="15000" defaultValue="15000" className="filter-slider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
              <span>₹500</span>
              <span>₹15k+</span>
            </div>
          </div>

          <div className="filter-section">
            <h4>Departure Time</h4>
            <label className="filter-option"><input type="checkbox" /> Morning (Before 12 PM)</label>
            <label className="filter-option"><input type="checkbox" /> Afternoon (12 PM - 6 PM)</label>
            <label className="filter-option"><input type="checkbox" /> Night (After 6 PM)</label>
          </div>

          {activeTab === 'buses' && (
            <div className="filter-section">
              <h4>Vehicle Type</h4>
              <label className="filter-option"><input type="checkbox" /> A/C</label>
              <label className="filter-option"><input type="checkbox" /> Non A/C</label>
              <label className="filter-option"><input type="checkbox" /> Sleeper</label>
            </div>
          )}

          {activeTab === 'cabs' && (
            <div className="filter-section">
              <h4>Cab Type</h4>
              <label className="filter-option"><input type="checkbox" /> Hatchback</label>
              <label className="filter-option"><input type="checkbox" /> Sedan</label>
              <label className="filter-option"><input type="checkbox" /> SUV</label>
            </div>
          )}
        </aside>

        {/* MAIN LIST */}
        <main className="transport-list">
          
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Magic AI is finding the best transport for you...</p>
              {[1, 2, 3].map(i => (
                <div key={i} className="transport-card skeleton">
                  <div className="card-left"><div className="skeleton-img"></div></div>
                  <div className="card-middle"><div className="skeleton-line"></div></div>
                  <div className="card-right"><div className="skeleton-btn"></div></div>
                </div>
              ))}
            </div>
          ) : (
            (activeTab === 'flights' ? liveFlights : activeTab === 'trains' ? liveTrains : activeTab === 'buses' ? liveBuses : []).map(item => {
              const uniqueId = `${activeTab}-${item.id}`;
              return (
              <div className="transport-card" key={uniqueId}>
                <div className="card-left">
                  {item.logo ? (
                    <img src={item.logo} alt={item.operator} className="operator-img"/>
                  ) : (
                    <div className="operator-placeholder">{item.operator.substring(0, 1)}</div>
                  )}
                  <div className="card-details">
                    <h4>{item.operator}</h4>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </div>
                </div>
                <div className="card-middle">
                  <div className="time-block">
                    <div className="time">{item.depTime}</div>
                    <div className="place">{item.from}</div>
                  </div>
                  <div className="duration-block">
                    <div className="duration-text">{item.duration}</div>
                    <div className="duration-line"></div>
                  </div>
                  <div className="time-block">
                    <div className="time">{item.arrTime}</div>
                    <div className="place">{item.to}</div>
                  </div>
                </div>
                <div className="card-right">
                  <div className="price">{item.price}</div>
                  <button 
                    className="btn-select"
                    style={{ background: selectedTransport?.uniqueId === uniqueId ? '#28a745' : '#FF4D6D' }}
                    onClick={() => setSelectedTransport(selectedTransport?.uniqueId === uniqueId ? null : { ...item, uniqueId })}
                  >
                    {selectedTransport?.uniqueId === uniqueId ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            )})
          )}

          {activeTab === 'cabs' && cabsData.map(item => {
            const uniqueId = `cabs-${item.id}`;
            return (
            <div className="transport-card" key={uniqueId}>
              <div className="card-left" style={{ flex: '1.5' }}>
                <img src={item.image} alt={item.operator} className="cab-img"/>
                <div className="card-details">
                  <h4>{item.operator}</h4>
                  <span className="badge">{item.badge}</span>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
                    {item.pax} • {item.luggage}
                  </div>
                </div>
              </div>
              <div className="card-right">
                <div className="price">{item.price}</div>
                <button 
                  className="btn-select"
                  style={{ background: selectedTransport?.uniqueId === uniqueId ? '#28a745' : '#FF4D6D' }}
                  onClick={() => setSelectedTransport(selectedTransport?.uniqueId === uniqueId ? null : { ...item, uniqueId })}
                >
                  {selectedTransport?.uniqueId === uniqueId ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          )})}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="sticky-footer" style={{ justifyContent: 'space-between', padding: '16px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="btn-back" onClick={() => navigate(-1)}>Back</button>
            {selectedTransport && (
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Total: <span style={{ color: '#FF4D6D' }}>{selectedTransport.price}</span>
                </div>
            )}
        </div>
        <button className="btn-primary-next" onClick={() => navigate('/final-review', {
          state: {
            plan: { ...location.state?.plan, transportCost: selectedTransport ? parseInt(selectedTransport.price.replace(/[^\d]/g, ''), 10) : 0 },
            selectedAttractions: location.state?.selectedAttractions || [],
            selectedFoods: location.state?.selectedFoods || [],
            selectedMarkets: location.state?.selectedMarkets || [],
            selectedStay: location.state?.selectedStay,
            selectedGuide: location.state?.selectedGuide,
            selectedTransport: selectedTransport
          }
        })}>
          Review Final Itinerary
        </button>
      </footer>
    </div>
  );
};

export default TransportOptions;
