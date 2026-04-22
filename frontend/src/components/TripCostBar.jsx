import React from 'react';
import { useTrip } from '../context/TripContext';
import { Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripCostBar = () => {
    const { totalCost } = useTrip();

    if (totalCost === 0) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2000,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 40px rgba(255, 77, 109, 0.25)',
                    border: '2px solid #FF4D6D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}
            >
                <div style={{
                    backgroundColor: '#FF4D6D',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Wallet size={20} />
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#222' }}>
                    Total Trip Cost: <span style={{ color: '#FF4D6D' }}>₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TripCostBar;
