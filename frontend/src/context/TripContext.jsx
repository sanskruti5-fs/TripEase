import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const [tripCostData, setTripCostData] = useState({
        places: [],
        food: [],
        market: [],
        guide: null,
        accommodation: null,
        transport: null,
        days: 1
    });

    // Helper to parse price strings like "₹1,200" to number
    const parsePrice = (price) => {
        if (!price) return 0;
        if (typeof price === 'number') return price;
        const cleaned = price.toString().replace(/[^0-9]/g, '');
        return parseInt(cleaned) || 0;
    };

    const calculateTotalCost = () => {
        const { places, food, market, guide, accommodation, transport, days } = tripCostData;

        const placesTotal = places.reduce((sum, item) => sum + parsePrice(item.price || item.entryFee), 0);
        const foodTotal = food.reduce((sum, item) => sum + parsePrice(item.price), 0) * days;
        const marketTotal = market.reduce((sum, item) => sum + parsePrice(item.price), 0);
        const guideTotal = guide ? parsePrice(guide.price || guide.pricePerDay) * days : 0;
        const accommodationTotal = accommodation ? parsePrice(accommodation.price || accommodation.pricePerNight) * days : 0;
        const transportTotal = transport ? parsePrice(transport.price) : 0;

        return placesTotal + foodTotal + marketTotal + guideTotal + accommodationTotal + transportTotal;
    };

    const toggleItem = (category, item) => {
        setTripCostData(prev => {
            if (Array.isArray(prev[category])) {
                const exists = prev[category].find(i => i.id === item.id || i.name === item.name);
                if (exists) {
                    return { ...prev, [category]: prev[category].filter(i => i.id !== item.id && i.name !== item.name) };
                } else {
                    return { ...prev, [category]: [...prev[category], item] };
                }
            } else {
                // For single items like guide, accommodation, transport
                // If it's already selected, unselect it. If not, select it.
                const isSelected = prev[category] && (prev[category].id === item.id || prev[category].name === item.name);
                return { ...prev, [category]: isSelected ? null : item };
            }
        });
    };

    const isSelected = (category, item) => {
        if (Array.isArray(tripCostData[category])) {
            return !!tripCostData[category].find(i => i.id === item.id || i.name === item.name);
        }
        return tripCostData[category] && (tripCostData[category].id === item.id || tripCostData[category].name === item.name);
    };

    const setDays = (num) => {
        setTripCostData(prev => ({ ...prev, days: num }));
    };

    return (
        <TripContext.Provider value={{ 
            tripCostData, 
            toggleItem, 
            isSelected, 
            totalCost: calculateTotalCost(),
            setDays
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => useContext(TripContext);
