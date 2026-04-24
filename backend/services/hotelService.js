const axios = require('axios');
const Destination = require('../models/Destination');
const PlaceCache = require('../models/PlaceCache');

// --- International city detection ---
const DOMESTIC_CITIES = [
    'mumbai', 'delhi', 'goa', 'jaipur', 'agra', 'kerala', 'varanasi', 'kolkata',
    'bangalore', 'bengaluru', 'shimla', 'manali', 'rishikesh', 'leh', 'ladakh',
    'amritsar', 'hyderabad', 'pune', 'ahmedabad', 'surat', 'kochi', 'mysore',
    'ooty', 'coorg', 'darjeeling', 'gangtok', 'mussoorie', 'nainital', 'haridwar',
    'ujjain', 'pushkar', 'mount abu', 'udaipur', 'jodhpur', 'bikaner', 'jaisalmer',
    'vrindavan', 'mathura', 'allahabad', 'prayagraj', 'lucknow', 'chandigarh'
];

function isInternationalCity(cityName) {
    const lower = cityName.toLowerCase();
    return !DOMESTIC_CITIES.some(c => lower.includes(c));
}

// --- Price validation ---
function validatePrice(rawPrice, cityName) {
    const isIntl = isInternationalCity(cityName);
    const min = isIntl ? 6000 : 1500;
    const max = isIntl ? 20000 : 6000;
    const price = parseInt(rawPrice, 10);
    if (!price || isNaN(price) || price < min || price > max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    return price;
}

// --- Unsplash hotel fallback images ---
const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c0d589rx?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1e52bf0ca2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
];

function getHotelImage(idx) {
    return HOTEL_IMAGES[idx % HOTEL_IMAGES.length];
}

// --- Layer 1: SERP API (Google Hotels) ---
async function fetchFromSerp(city) {
    const key = process.env.SERP_API_KEY;
    if (!key) throw new Error('No SERP API key');

    const url = 'https://serpapi.com/search';
    const params = {
        engine: 'google_hotels',
        q: `hotels in ${city}`,
        api_key: key,
        currency: 'INR',
        hl: 'en',
        check_in_date: getCheckInDate(),
        check_out_date: getCheckOutDate(),
        adults: 2,
        num: 10,
    };

    const response = await axios.get(url, { params, timeout: 10000 });
    const hotels = response.data?.properties || [];

    if (!hotels.length) throw new Error('SERP returned no hotels');

    console.log(`✅ [SERP] Found ${hotels.length} hotels for ${city}`);

    return hotels.map((h, idx) => ({
        place_name: h.name || `Hotel ${idx + 1}`,
        price_per_night: validatePrice(h.rate_per_night?.lowest?.replace(/[^0-9]/g, ''), city),
        rating: parseFloat(h.overall_rating) || parseFloat((Math.random() * 1 + 4).toFixed(1)),
        image_url: h.images?.[0]?.thumbnail || getHotelImage(idx),
        description: h.description || `A well-rated hotel in the heart of ${city}.`,
        amenities: h.amenities?.slice(0, 4) || ['WiFi', 'Breakfast', 'Parking'],
        address: h.neighborhood || city,
        hotel_source: 'serp',
    }));
}

// --- Layer 2: Groq AI Fallback ---
async function fetchFromGroq(city) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('No Groq API key');

    const isIntl = isInternationalCity(city);
    const priceRange = isIntl ? '₹6000–₹20000 per night' : '₹1500–₹6000 per night';
    const currency = isIntl ? 'INR equivalent' : 'INR';

    const prompt = `Generate a JSON array of exactly 6 realistic hotels in ${city}. 
Return ONLY valid JSON, no markdown, no explanation.
Each hotel object must have these exact keys:
{
  "place_name": "Hotel name (realistic, NOT generic)",
  "price_per_night": number (${priceRange} in ${currency}, integer),
  "rating": number (between 3.8 and 5.0, one decimal),
  "description": "1 sentence description specific to ${city}",
  "amenities": ["WiFi", "Breakfast"] (2–4 items),
  "address": "neighborhood or area in ${city}"
}
Hotels must be city-specific — use real area names from ${city}. Vary the price range.`;

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7,
        },
        { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Groq returned invalid JSON');

    const hotels = JSON.parse(jsonMatch[0]);
    console.log(`✅ [Groq] Generated ${hotels.length} hotels for ${city}`);

    return hotels.map((h, idx) => ({
        place_name: h.place_name,
        price_per_night: validatePrice(h.price_per_night, city),
        rating: parseFloat(h.rating) || 4.2,
        image_url: getHotelImage(idx),
        description: h.description || `A great stay in ${city}.`,
        amenities: Array.isArray(h.amenities) ? h.amenities.slice(0, 4) : ['WiFi'],
        address: h.address || city,
        hotel_source: 'groq',
    }));
}

// --- Layer 3: Hardcoded Fallback ---
function buildFallbackHotels(city) {
    const isIntl = isInternationalCity(city);
    const templates = [
        { suffix: 'Grand Palace', amenities: ['WiFi', 'Pool', 'Breakfast', 'Gym'], mult: 1.0 },
        { suffix: 'Heritage Inn', amenities: ['WiFi', 'Restaurant', 'Parking'], mult: 0.7 },
        { suffix: 'Comfort Suites', amenities: ['WiFi', 'Breakfast', 'AC'], mult: 0.6 },
        { suffix: 'Budget Stay', amenities: ['WiFi', 'Parking'], mult: 0.35 },
        { suffix: 'Royal Residency', amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant'], mult: 1.2 },
        { suffix: 'Travelers Hub', amenities: ['WiFi', 'Lockers', 'Common Kitchen'], mult: 0.25 },
    ];

    const base = isIntl ? 9000 : 2800;

    console.log(`⚠️ [Fallback] Using hardcoded hotels for ${city}`);
    return templates.map((t, idx) => ({
        place_name: `${city} ${t.suffix}`,
        price_per_night: validatePrice(Math.round(base * t.mult), city),
        rating: parseFloat((Math.random() * 1 + 3.8).toFixed(1)),
        image_url: getHotelImage(idx),
        description: `A reliable accommodation option located in ${city}.`,
        amenities: t.amenities,
        address: city,
        hotel_source: 'fallback',
    }));
}

// --- Cache helpers ---
async function getOrCreateDestination(city) {
    let dest = await Destination.findOne({ name: new RegExp(`^${city}$`, 'i') });
    if (!dest) {
        dest = await Destination.create({
            name: city,
            latitude: 0,
            longitude: 0,
            last_updated: new Date(),
        });
    }
    return dest;
}

function isCacheValid(lastUpdated) {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(lastUpdated).getTime() < TWENTY_FOUR_HOURS;
}

function getCheckInDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
}
function getCheckOutDate() {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
}

// --- Tag assignment ---
function assignTags(hotels) {
    if (!hotels.length) return hotels;
    const sorted = [...hotels].sort((a, b) => a.price_per_night - b.price_per_night);
    const bestValueId = sorted[0].place_name;
    const topRated = [...hotels].sort((a, b) => b.rating - a.rating)[0].place_name;

    return hotels.map(h => {
        const tags = [];
        if (h.place_name === bestValueId) tags.push('Best Value');
        if (h.place_name === topRated) tags.push('Popular');
        return { ...h, tags };
    });
}

// --- Main exported function ---
async function getHotels(city) {
    const dest = await getOrCreateDestination(city);

    // Check cache
    const cached = await PlaceCache.find({ destination_id: dest._id, category: 'hotel' });
    if (cached.length > 0 && isCacheValid(cached[0].last_updated)) {
        console.log(`✅ [Hotel Cache HIT] Returning cached hotels for ${city}`);
        return cached;
    }

    // Clear stale cache
    if (cached.length > 0) {
        await PlaceCache.deleteMany({ destination_id: dest._id, category: 'hotel' });
    }

    // Fetch fresh data through the pipeline
    let rawHotels = [];
    try {
        rawHotels = await fetchFromSerp(city);
    } catch (serpErr) {
        console.warn(`⚠️ [SERP] Failed for ${city}: ${serpErr.message}`);
        try {
            rawHotels = await fetchFromGroq(city);
        } catch (groqErr) {
            console.warn(`⚠️ [Groq] Failed for ${city}: ${groqErr.message}`);
            rawHotels = buildFallbackHotels(city);
        }
    }

    const taggedHotels = assignTags(rawHotels);

    // Persist to cache
    const records = taggedHotels.map(h => ({
        destination_id: dest._id,
        place_name: h.place_name,
        category: 'hotel',
        latitude: 0,
        longitude: 0,
        description: h.description,
        rating: h.rating,
        image_url: h.image_url,
        price_per_night: h.price_per_night,
        amenities: h.amenities || [],
        hotel_source: h.hotel_source,
        tags: h.tags || [],
        address: h.address,
        estimated_budget: `₹${h.price_per_night} / night`,
        suitability: 'All travellers',
        last_updated: new Date(),
    }));

    await PlaceCache.insertMany(records);
    const saved = await PlaceCache.find({ destination_id: dest._id, category: 'hotel' });
    return saved;
}

module.exports = { getHotels };
