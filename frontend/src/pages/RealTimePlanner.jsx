import { useState } from 'react';
import { Search, MapPin, Navigation, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RealTimePlanner = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const searchPlaces = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSelectedPlace(null);
        setPlaceDetails(null);

        try {
            // Nominatim Free API for Place Search
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching places:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaceDetails = async (place) => {
        setSelectedPlace(place);
        setDetailsLoading(true);
        // Extract city or country name for Wikipedia search
        const name = place.name || place.display_name.split(',')[0];

        try {
            // Wikipedia Free API for Summary and Image
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
            const data = await response.json();

            if (data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
                setPlaceDetails({
                    title: data.title,
                    description: data.extract,
                    image: data.thumbnail?.source || data.originalimage?.source || null
                });
            } else {
                setPlaceDetails({
                    title: name,
                    description: 'No detailed description available for this location.',
                    image: null
                });
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            setPlaceDetails({
                title: name,
                description: 'Could not fetch details at this time.',
                image: null
            });
        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <h1 style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}>Real-Time Explorer</h1>
                <p style={{ color: 'var(--text-light)', fontSize: 'clamp(1rem, 4vw, 1.1rem)' }}>Search for any place in the world and start planning</p>
            </motion.div>

            <form onSubmit={searchPlaces} className="d-flex justify-content-center mb-5">
                <div className="input-group" style={{ 
                    maxWidth: '600px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    width: '100%'
                }}>
                    <span className="input-group-text bg-white border-0" style={{ paddingLeft: '16px' }}>
                        <Search color="var(--primary-color)" size={20} />
                    </span>
                    <input
                        type="text"
                        className="form-control border-0"
                        placeholder="e.g. Kyoto, Japan or Eiffel Tower..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ padding: '14px', fontSize: '16px', boxShadow: 'none' }}
                    />
                    <button type="submit" className="btn-primary-custom" style={{ padding: '0 20px', borderRadius: '0' }} disabled={loading}>
                        {loading ? '...' : 'Explore'}
                    </button>
                </div>
            </form>

            <div className="row g-4">
                {/* Search Results Column */}
                <div className="col-lg-4 col-md-12">
                    {results.length > 0 && (
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                            <h5 className="mb-4" style={{ fontWeight: '700' }}>Results ({results.length})</h5>
                            <div className="d-flex flex-column gap-3">
                                {results.map((place) => (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        key={place.place_id}
                                        className={`p-3 rounded-3 cursor-pointer ${selectedPlace?.place_id === place.place_id ? 'bg-primary text-white' : 'bg-light'}`}
                                        onClick={() => fetchPlaceDetails(place)}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                                    >
                                        <div className="d-flex align-items-start gap-2">
                                            <MapPin size={18} className="mt-1 flex-shrink-0" />
                                            <div style={{ minWidth: 0 }}>
                                                <h6 className="mb-1 text-truncate" style={{ fontWeight: '600' }}>{place.name || place.display_name.split(',')[0]}</h6>
                                                <small style={{ opacity: 0.8 }} className="d-block text-truncate">
                                                    {place.display_name}
                                                </small>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Place Details Column */}
                <div className="col-lg-8 col-md-12">
                    {detailsLoading ? (
                        <div className="d-flex justify-content-center align-items-center glass-panel" style={{ borderRadius: '16px', minHeight: '300px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : placeDetails ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel"
                            style={{ borderRadius: '16px', overflow: 'hidden' }}
                        >
                            {placeDetails.image && (
                                <div style={{ height: 'clamp(200px, 40vh, 350px)', width: '100%', position: 'relative' }}>
                                    <img
                                        src={placeDetails.image}
                                        alt={placeDetails.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px', color: 'white' }}>
                                        <h2 className="mb-0" style={{ fontWeight: '800', fontSize: 'clamp(1.5rem, 6vw, 2rem)' }}>{placeDetails.title}</h2>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: 'clamp(20px, 5vw, 30px)' }}>
                                {!placeDetails.image && <h2 className="mb-3" style={{ fontWeight: '800' }}>{placeDetails.title}</h2>}

                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    <span className="badge bg-primary rounded-pill px-3 py-2"><Navigation size={14} className="me-1" /> Location Info</span>
                                    <span className="badge bg-secondary rounded-pill px-3 py-2"><Info size={14} className="me-1" /> Wikipedia</span>
                                </div>

                                <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-dark)' }}>
                                    {placeDetails.description}
                                </p>

                                <button className="btn-primary-custom mt-4 d-flex align-items-center gap-2" style={{ width: '100%', justifyContent: 'center' }}>
                                    <MapPin size={18} />
                                    Add to My Itinerary
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        results.length > 0 && (
                            <div className="d-flex justify-content-center align-items-center glass-panel text-center" style={{ borderRadius: '16px', minHeight: '300px', padding: '40px' }}>
                                <div>
                                    <Navigation size={40} color="var(--text-light)" className="mb-3" />
                                    <h4 style={{ color: 'var(--text-light)' }}>Select a place from the results</h4>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default RealTimePlanner;
