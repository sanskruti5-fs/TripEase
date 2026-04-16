import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--surface-color)',
            padding: '48px 0',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '32px'
            }}>
                <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '16px' }}>TripEase</h3>
                    <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                        Plan Your Dream Trip in Minutes. One platform. One budget. Complete itinerary.
                    </p>
                </div>

                <div style={{ flex: '1 1 150px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Company</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-light)' }}>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div style={{ flex: '1 1 150px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Legal</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-light)' }}>
                        <li><Link to="/terms">Terms of Service</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container" style={{
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                color: 'var(--text-light)',
                fontSize: '14px'
            }}>
                © {new Date().getFullYear()} TripEase. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
