import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CalendarDays, Wallet, Plane, TrainFront, Bus, ChevronRight, ChevronLeft, Quote, ArrowRight, Hotel } from 'lucide-react';

import imgIndonesia from '../assets/images/indonesia .png';
import imgThailand from '../assets/images/Thailand.jpg';
import imgBali from '../assets/images/Bali.jpg';
import imgKerala from '../assets/images/Kerala.jpg';
import './LandingPage.css';

const destinations = [
    {
        id: 'indonesia',
        title: 'INDONESIA',
        subtitle: 'Explore the archipelago',
        desc: 'As the largest archipelago country in the world, Indonesia is blessed with so many different people, cultures, customs, traditions, artworks, food, animals, plants, landscapes, and everything that made it almost like 100 (or even 200) countries melted beautifully into one.',
        image: imgIndonesia,
        rating: 4.8
    },
    {
        id: 'thailand',
        title: 'THAILAND',
        subtitle: 'The land of smiles',
        desc: 'Thailand is a wondrous kingdom, featuring Buddhist temples, exotic wildlife, and spectacular islands. Along with a fascinating history and a unique culture that includes delectable Thai food and massage.',
        image: imgThailand,
        rating: 4.9
    },
    {
        id: 'bali',
        title: 'BALI',
        subtitle: 'Island of the Gods',
        desc: 'Also known as the Land of the Gods, Bali appeals through its sheer natural beauty of looming volcanoes and lush terraced rice fields that exude peace and serenity.',
        image: imgBali,
        rating: 5.0
    },
    {
        id: 'kerala',
        title: 'KERALA',
        subtitle: 'God\'s Own Country',
        desc: 'Kerala, a state on India\'s tropical Malabar Coast, has nearly 600km of Arabian Sea shoreline. It\'s known for its palm-lined beaches and backwaters, a network of canals.',
        image: imgKerala,
        rating: 4.7
    }
];

const LandingPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-rotate hero images
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % destinations.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % destinations.length);
    const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));

    const activeDest = destinations[activeIndex];

    return (
        <div style={{ backgroundColor: 'var(--background-color)' }}>
            {/* HEROS SECTION */}
            <section className="landing-hero">
                {/* Background Image transitions */}
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeDest.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${activeDest.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 0
                        }}
                    />
                </AnimatePresence>
                
                {/* Gradient Overlay */}
                <div className="hero-gradient" />

                <div className="container hero-container">
                    <div className="hero-flex-wrapper">
                        
                        {/* Left Content */}
                        <div className="hero-left-content">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`content-${activeDest.id}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h1 className="hero-title" style={{ color: '#ffffff' }}>
                                        {activeDest.title}
                                    </h1>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '400',
                                        marginBottom: '20px',
                                        color: '#E0E0E0',
                                        borderLeft: '4px solid var(--primary-color)',
                                        paddingLeft: '16px'
                                    }}>
                                        {activeDest.subtitle}
                                    </h3>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        lineHeight: '1.6',
                                        color: '#CCCCCC',
                                        marginBottom: '40px',
                                        maxWidth: '500px'
                                    }}>
                                        {activeDest.desc}
                                    </p>
                                    
                                    <Link to="/planner" className="btn-primary-custom" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '1.1rem',
                                        padding: '16px 36px',
                                        borderRadius: '50px',
                                        boxShadow: '0 8px 32px rgba(255, 56, 92, 0.4)'
                                    }}>
                                        Explore Now <ArrowRight size={20} />
                                    </Link>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right Content - Rotating Cards */}
                        <div className="hero-cards-wrapper hide-scrollbar">
                            {destinations.map((dest, idx) => {
                                // determine offset from active
                                const diff = (idx - activeIndex + destinations.length) % destinations.length;
                                // only show next 2 cards
                                if (diff === 0 || diff > 2) return null;

                                return (
                                    <motion.div
                                        key={`card-${dest.id}`}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: diff * 0.1 }}
                                        onClick={() => setActiveIndex(idx)}
                                        style={{
                                            width: diff === 1 ? '240px' : '200px',
                                            height: diff === 1 ? '340px' : '280px',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                            border: '2px solid rgba(255,255,255,0.1)',
                                            filter: diff === 1 ? 'brightness(1)' : 'brightness(0.6)'
                                        }}
                                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                    >
                                        <img src={dest.image} alt={dest.title} style={{
                                            width: '100%', height: '100%', objectFit: 'cover'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0, left: 0, right: 0,
                                            padding: '24px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                                        }}>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>{dest.title}</h4>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i < Math.floor(dest.rating) ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls & Pagination indicators */}
                    <div style={{
                        marginTop: 'auto',
                        padding: '40px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 10px' }} />
                            <div style={{ transform: 'rotate(-90deg)', transformOrigin: 'left center', fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.8, whiteSpace: 'nowrap' }}>
                                {String(activeIndex + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', zIndex: 10 }}>
                            <button
                                onClick={handlePrev}
                                className="btn-circle-nav"
                                style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn-circle-nav"
                                style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* EFFORTLESS TRAVEL SECTION */}
            <section className="container section-padding">
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '16px' }}>Your Next Adventure Awaits</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
                        Explore stunning destinations, unique experiences, and unforgettable journeys with TripEase.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="features-left">
                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Every Step of the Way</span>
                        <h2 style={{ fontSize: '2.5rem', marginTop: '16px', marginBottom: '24px', color: 'var(--text-color)' }}>Effortless Travel</h2>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '40px' }}>
                            Travel with ease and comfort. From private transfers to group tours, we ensure seamless transportation throughout your journey. Discover connections tailored just for you.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {[
                                { icon: <Compass size={24} />, title: 'Intelligent Planning', desc: 'Automatically generate itineraries using Nominatim & OpenStreetMap.' },
                                { icon: <Bus size={24} />, title: 'Effortless Commute', desc: 'Find the best local transport and routing options.' },
                                { icon: <Wallet size={24} />, title: 'Budget Friendly', desc: 'Our planner remains exactly 100% free using open-source data.' }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    style={{
                                        display: 'flex', gap: '20px', alignItems: 'flex-start',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        backgroundColor: i === 0 ? 'rgba(255, 56, 92, 0.05)' : 'var(--surface-color)',
                                        border: i === 0 ? '1px solid rgba(255, 56, 92, 0.2)' : '1px solid var(--border-color)',
                                        boxShadow: i === 0 ? '0 8px 24px rgba(255,56,92,0.1)' : 'none',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: i === 0 ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)',
                                        color: i === 0 ? '#fff' : 'var(--text-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-color)' }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="features-right">
                        <div style={{ position: 'relative', width: '100%', paddingBottom: '120%', borderRadius: '24px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" alt="Plane window" style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'
                            }} />
                        </div>
                        {/* decorative element */}
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                top: '40px', right: '-30px',
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                border: '8px solid var(--surface-color)',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=200&q=80" alt="Flight" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section style={{ padding: '120px 0', backgroundColor: 'var(--background-alt)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '120%',
                    background: 'radial-gradient(ellipse at center, rgba(255,56,92,0.08) 0%, transparent 70%)',
                    zIndex: 0
                }} />
                
                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Testimonials</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '16px', marginBottom: '80px', color: 'var(--text-color)' }}>What Our Guests Say</h2>

                    <div style={{ 
                        maxWidth: '800px', margin: '0 auto', 
                        backgroundColor: 'var(--surface-color)',
                        padding: 'clamp(20px, 5vw, 60px)',
                        borderRadius: '24px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.05)',
                        position: 'relative'
                    }}>
                        <Quote size={64} color="rgba(255,56,92,0.1)" style={{ position: 'absolute', top: '40px', left: '40px' }} />
                        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', lineHeight: '1.8', fontStyle: 'italic', color: 'var(--text-color)', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                            "Ethan, Lina, & Oliver were amazing tour guides! Their knowledge of the local culture and ability to tell stories made our trip unforgettable. We couldn't have asked for a better experience."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden' }}>
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="Sophia Harper" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--text-color)' }}>Sophia Harper</h4>
                                <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>★ 5.0 UX Designer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .btn-circle-nav:hover {
                    background-color: var(--primary-color) !important;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
