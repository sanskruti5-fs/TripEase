import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertCircle } from 'lucide-react';
import './TripCostBar.css';

const TripCostBar = () => {
    const location = useLocation();

    // Show only on planning funnel pages
    const activePaths = [
        '/highlights',
        '/food-market',
        '/guides',
        '/accommodation',
        '/transport'
    ];

    const isVisible = activePaths.includes(location.pathname);
    if (!isVisible) return null;

    const planInfo = location.state?.plan;
    if (!planInfo) return null;

    // Helper to parse price strings
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    // Calculate current running total
    const selectedAttractions = location.state?.selectedAttractions || [];
    const attractionsCost = selectedAttractions.reduce((sum, item) => sum + (item.entryFee || 0), 0);

    const selectedFoods = location.state?.selectedFoods || [];
    const foodItemsCost = selectedFoods.reduce((sum, item) => sum + (item.price || 0), 0);
    const baseFoodCost = (planInfo.days || 0) * 800;
    const totalFoodCost = baseFoodCost + foodItemsCost;

    const dayWiseStays = planInfo?.dayWiseStays || [];
    const selectedStay = location.state?.selectedStay || planInfo?.selectedStay;
    const stayCost = dayWiseStays.length > 0 
        ? dayWiseStays.reduce((sum, stay) => sum + (stay?.price_per_night || 0), 0)
        : (selectedStay ? (selectedStay.pricePerNight || selectedStay.price_per_night || 0) * planInfo.days : (planInfo.stayCost || 0));

    const selectedTransport = location.state?.selectedTransport || planInfo?.transportMode;
    const transportCost = selectedTransport ? parsePrice(selectedTransport.price) : 0;

    const selectedGuide = location.state?.selectedGuide;
    const guideCost = selectedGuide ? (selectedGuide.pricePerDay * planInfo.days) : (planInfo.guideCost || 0);

    const currentTotal = attractionsCost + totalFoodCost + stayCost + transportCost + guideCost;
    const budgetLimit = planInfo.budget || 0;
    const isOverBudget = currentTotal > budgetLimit;

    return (
        <AnimatePresence>
            <motion.div 
                className={`trip-cost-bar ${isOverBudget ? 'cost-over' : 'cost-good'}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.4 }}
            >
                <div className="cost-bar-icon">
                    {isOverBudget ? <AlertCircle size={22} color="white" /> : <Wallet size={22} color="white" />}
                </div>
                
                <div className="cost-bar-content">
                    <div className="cost-bar-title">Current Trip Cost</div>
                    <div className="cost-bar-amount">
                        ₹{currentTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="cost-bar-limit" style={{ lineHeight: '1.4' }}>
                        <div>Limit: ₹{budgetLimit.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                            Includes ₹{baseFoodCost.toLocaleString('en-IN')} base food cost
                        </div>
                    </div>
                </div>

                {/* Progress Bar Indicator */}
                <div className="cost-bar-progress-wrap">
                    <div 
                        className="cost-bar-progress" 
                        style={{ width: `${Math.min((currentTotal / budgetLimit) * 100, 100)}%` }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TripCostBar;
