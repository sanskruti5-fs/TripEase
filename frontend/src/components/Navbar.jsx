import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Planner', path: '/real-time-planner' },
    ];

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <Compass size={28} strokeWidth={2.5} />
                    <span>TripEase</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} className="nav-link hover-scale">
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="nav-cta nav-cta-desktop">
                    {token ? (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                                Hi, {user?.name.split(' ')[0]}
                            </span>
                            <button onClick={handleLogout} className="btn-primary-custom" style={{ backgroundColor: '#dc3545', padding: '8px 16px' }}>
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Link to="/login" style={{ fontWeight: '600' }}>Log In</Link>
                            <Link to="/signup" className="btn-primary-custom" style={{ textDecoration: 'none', padding: '8px 20px' }}>Sign Up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Actions (Visible only on mobile) */}
                <div className="mobile-actions">
                    {token ? (
                        <span style={{ 
                            fontWeight: '600', 
                            color: 'var(--text-dark)', 
                            fontSize: '0.9rem',
                            maxWidth: '80px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block'
                        }}>
                            {user?.name.split(' ')[0]}
                        </span>
                    ) : (
                        <Link to="/login" className="btn-primary-custom mobile-login-btn" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Log In
                        </Link>
                    )}
                    {/* Mobile Toggle Button */}
                    <button 
                        className={`mobile-toggle ${isMenuOpen ? 'is-open' : ''}`} 
                        onClick={toggleMenu}
                        aria-label="Toggle navigation"
                    >
                        <div className="hamburger">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay (Top-Down) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ display: isMenuOpen ? 'flex' : 'none' }}
                    >
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    to={link.path} 
                                    className="mobile-nav-link" 
                                    onClick={closeMenu}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                        
                        <div className="mobile-cta">
                            {token ? (
                                <>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Hi, {user?.name.split(' ')[0]}</span>
                                    <button onClick={handleLogout} className="btn-primary-custom" style={{ backgroundColor: '#dc3545', width: '100%' }}>
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>Log In</Link>
                                    <Link to="/signup" className="btn-primary-custom" style={{ width: '100%' }} onClick={closeMenu}>
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
