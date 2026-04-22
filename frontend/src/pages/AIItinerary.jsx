import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
    Calendar, Clock, MapPin, Coffee, Utensils, Info, 
    ChevronLeft, Download, Share2, Camera, Wallet,
    ChevronDown, Sun, Sunset, Moon, Sparkles, Map,
    Navigation, ExternalLink
} from 'lucide-react';
import './AIItinerary.css';

const AIItinerary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const itineraryRef = useRef(null);
    const [expandedDay, setExpandedDay] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const { plan, tripDetails } = location.state || {};

    if (!plan || !plan.itinerary || !tripDetails) {
        return (
            <div className="ai-error-container">
                <h2>No Plan Found</h2>
                <p>We couldn't retrieve your AI plan. Please try generating it again.</p>
                <button onClick={() => navigate('/planner')} className="btn-primary-custom">Go Back</button>
            </div>
        );
    }

    const handleDownload = async () => {
        if (!itineraryRef.current) return;
        
        setIsDownloading(true);
        // Temporarily expand all days for capture
        const originalExpanded = expandedDay;
        const allExpanded = true; 
        
        try {
            const canvas = await html2canvas(itineraryRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    const header = clonedDoc.querySelector('.photo-header');
                    const noCapture = clonedDoc.querySelector('.no-capture');
                    const contents = clonedDoc.querySelectorAll('.day-content-wrapper');
                    if (header) header.style.display = 'block';
                    if (noCapture) noCapture.style.display = 'none';
                    contents.forEach(el => el.style.display = 'block');
                }
            });
            
            const link = document.createElement('a');
            link.download = `TripEase-${tripDetails.destination}-Itinerary.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download Error:', err);
            alert('Failed to generate photo. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const groupActivities = (activities) => {
        const groups = {
            Morning: [],
            Afternoon: [],
            Evening: []
        };

        activities.forEach(activity => {
            const timeStr = activity.time.toLowerCase();
            const hour = parseInt(timeStr.split(':')[0]) + (timeStr.includes('pm') && !timeStr.startsWith('12') ? 12 : 0);
            
            if (hour < 12) groups.Morning.push(activity);
            else if (hour < 18) groups.Afternoon.push(activity);
            else groups.Evening.push(activity);
        });

        return groups;
    };

    const destinationImg = `/images/${tripDetails?.destination.toLowerCase().replace(/\s+/g, '-')}/hero.png`;

    return (
        <div ref={itineraryRef} className="ai-itinerary-container capture-area">
            {/* Photo Header (Visible in capture) */}
            <div className="photo-header">
                <div className="photo-hero" style={{ backgroundImage: `url(${destinationImg}), url('/images/tokyo/hero.png')` }}>
                    <div className="photo-hero-overlay">
                        <div className="photo-badge">✨ TRIPES AI PLANNER</div>
                        <h1>{tripDetails.destination}</h1>
                        <p>{tripDetails.days} DAYS • {tripDetails.tripType.toUpperCase()} • ₹{tripDetails.budget}</p>
                    </div>
                </div>
                <div className="photo-meta-bar">
                    <span>Generated for your trip from <strong>{tripDetails.origin}</strong></span>
                </div>
            </div>

            <div className="ai-itinerary-header no-capture">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="header-flex">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="header-content"
                    >
                        <div className="magic-badge">
                            <Sparkles size={14} /> AI MAGIC PLAN
                        </div>
                        <h1>Your {tripDetails.days}-Day {tripDetails.destination} Dream</h1>
                        <div className="trip-meta">
                            <div className="meta-pill"><Navigation size={14} /> {tripDetails.origin} → {tripDetails.destination}</div>
                            <div className="meta-pill"><Calendar size={14} /> {tripDetails.days} Days</div>
                            <div className="meta-pill price"><Wallet size={14} /> ₹{tripDetails.budget}</div>
                        </div>
                    </motion.div>
                    
                    <div className="header-actions">
                        <button className="premium-btn-action" onClick={handleDownload}>
                            <Camera size={18} /> Snapshot
                        </button>
                        <button className="share-btn-action"><Share2 size={18} /></button>
                    </div>
                </div>
            </div>

            <div className="ai-itinerary-content">
                <div className="itinerary-grid">
                    {plan.itinerary.map((day, idx) => {
                        const groups = groupActivities(day.activities);
                        const isExpanded = expandedDay === idx;

                        return (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`day-accordion ${isExpanded ? 'active' : ''}`}
                            >
                                <div 
                                    className="day-header-main"
                                    onClick={() => setExpandedDay(isExpanded ? -1 : idx)}
                                >
                                    <div className="day-title-info">
                                        <div className="day-badge">Day {day.day}</div>
                                        <h2>{day.title}</h2>
                                    </div>
                                    <div className="day-header-meta">
                                        <span className="activity-count">{day.activities.length} Stops</span>
                                        <ChevronDown className={`arrow ${isExpanded ? 'up' : ''}`} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="day-content-wrapper"
                                        >
                                            <div className="day-content-inner">
                                                {Object.entries(groups).map(([timeOfDay, activities]) => (
                                                    activities.length > 0 && (
                                                        <div key={timeOfDay} className="time-group">
                                                            <div className="time-label">
                                                                {timeOfDay === 'Morning' && <Sun size={18} className="morning-icon" />}
                                                                {timeOfDay === 'Afternoon' && <Coffee size={18} className="afternoon-icon" />}
                                                                {timeOfDay === 'Evening' && <Moon size={18} className="evening-icon" />}
                                                                <h3>{timeOfDay}</h3>
                                                            </div>
                                                            <div className="activities-grid">
                                                                {activities.map((activity, aIdx) => (
                                                                    <div key={aIdx} className="modern-activity-card">
                                                                        <div className="card-top">
                                                                            <span className="time-badge">{activity.time}</span>
                                                                            <span className="cost-tag">{activity.estCost}</span>
                                                                        </div>
                                                                        <h4>{activity.task}</h4>
                                                                        <div className="card-bottom">
                                                                            <span><MapPin size={12} /> {activity.location}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}

                                                <div className="dining-premium-card">
                                                    <div className="dining-badge"><Utensils size={14} /> DINING PICK</div>
                                                    <div className="dining-body">
                                                        <div className="dining-header">
                                                            <h4>{day.dining.name}</h4>
                                                            <span className="dining-type">{day.dining.type}</span>
                                                        </div>
                                                        <p>Must try: <strong>{day.dining.dish}</strong></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <aside className="ai-sidebar-refined">
                    <div className="sidebar-section-card glass-glow">
                        <div className="card-header-icon">
                            <Info size={20} />
                            <h3>Budget Summary</h3>
                        </div>
                        <p className="budget-desc">{plan.budgetSummary}</p>
                        <div className="budget-divider"></div>
                        <div className="budget-mini-stats">
                            <div className="stat-item">
                                <span className="stat-val">₹{tripDetails.budget}</span>
                                <span className="stat-label">Total Pocket</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">₹{Math.round(tripDetails.budget / parseInt(tripDetails.days))}</span>
                                <span className="stat-label">Avg / Day</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section-card tip-card">
                        <div className="card-header-icon">
                            <Sparkles size={20} />
                            <h3>Pro Travel Tips</h3>
                        </div>
                        <ul className="tips-list">
                            {plan.travelTips.map((tip, idx) => (
                                <li key={idx}>
                                    <div className="tip-marker"></div>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-promo">
                        <Download size={24} />
                        <h4>Want to save this plan?</h4>
                        <p>Download your itinerary as a high-quality poster to share with friends.</p>
                        <button className="btn-save-itinerary" onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? 'Generating...' : 'Download Poster'}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AIItinerary;

