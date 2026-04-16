const mongoose = require('mongoose');
const Destination = require('./models/Destination');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripease';

const seedData = [
    {
        name: "Agra",
        places: [
            { name: "Taj Mahal", description: "Symbol of love & Mughal architecture", rating: 5.0, image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" },
            { name: "Agra Fort", description: "Historical fort & UNESCO World Heritage sight", rating: 4.8, image: "https://images.unsplash.com/photo-1574681605273-0490216b0b57?auto=format&fit=crop&w=800&q=80" },
            { name: "Fatehpur Sikri", description: "Historic city founded by Akbar", rating: 4.7, image: "https://images.unsplash.com/photo-1610014027732-2d880e69db29?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Agra Petha", price: 150, image: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=400&q=80" },
            { name: "Bedmi Puri", price: 80, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Sadar Bazaar", type: "Street Shopping", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80" },
            { name: "Kinari Bazaar", type: "Handicrafts & Jewelry", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Jaipur",
        places: [
            { name: "Hawa Mahal", description: "Palace of Winds, pink sandstone architecture", rating: 4.8, image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80" },
            { name: "Amber Fort", description: "Majestic hilltop fort with royal grandeur", rating: 4.9, image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80" },
            { name: "City Palace", description: "Heart of the Pink City and royal residence", rating: 4.7, image: "https://images.unsplash.com/photo-1557004396-66e4174d7bf6?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Dal Baati Churma", price: 350, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80" },
            { name: "Ghewar", price: 200, image: "https://images.unsplash.com/photo-1632778149955-e70f4dc1d514?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Johari Bazaar", type: "Jewelry & Gems", image: "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Goa",
        places: [
            { name: "Baga & Calangute Beach", description: "Famous for nightlife, shacks, and water sports", rating: 4.7, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
            { name: "Basilica of Bom Jesus", description: "UNESCO site with St. Francis Xavier 's remains", rating: 4.8, image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80" },
            { name: "Fort Aguada", description: "17th-century Portuguese fort and lighthouse", rating: 4.6, image: "https://images.unsplash.com/photo-1549479366-2eb903f5697d?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Goan Fish Curry", price: 400, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80" },
            { name: "Bebinca", price: 150, image: "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Anjuna Flea Market", type: "Souvenirs & Clothes", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Kerala",
        places: [
            { name: "Alleppey Backwaters", description: "Scenic houseboat rides in palm-fringed canals", rating: 4.9, image: "https://images.unsplash.com/photo-1528644342416-09d3bdfd807e?auto=format&fit=crop&w=800&q=80" },
            { name: "Munnar Tea Gardens", description: "Lush green rolling hills of tea plantations", rating: 4.8, image: "https://images.unsplash.com/photo-1593693397690-362bcbb93051?auto=format&fit=crop&w=800&q=80" },
            { name: "Varkala Beach", description: "Stunning cliffside beach views alongside the sea", rating: 4.7, image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Sadya", price: 250, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Jew Town, Kochi", type: "Spices & Antiques", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Varanasi",
        places: [
            { name: "Dashashwamedh Ghat", description: "Vibrant and busiest ghat along the Ganges", rating: 4.9, image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
            { name: "Kashi Vishwanath Temple", description: "Sacred Hindu temple dedicated to Lord Shiva", rating: 4.8, image: "https://images.unsplash.com/photo-1605347206101-52ea28bebf7a?auto=format&fit=crop&w=800&q=80" },
            { name: "Ganga Aarti", description: "Mesmerizing spiritual ritual by the river", rating: 5.0, image: "https://images.unsplash.com/photo-1554030777-a5ec0c4fb566?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Banarasi Paan", price: 50, image: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=400&q=80" },
            { name: "Kachori Sabzi", price: 40, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Vishwanath Gali", type: "Sarees & Handicrafts", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Mumbai",
        places: [
            { name: "Gateway of India", description: "Iconic enduring monument from the colonial era", rating: 4.7, image: "https://images.unsplash.com/photo-1522748906645-95d8e7c10b27?auto=format&fit=crop&w=800&q=80" },
            { name: "Marine Drive", description: "Beautiful 3km promenade known as Queen's Necklace", rating: 4.8, image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80" },
            { name: "Elephanta Caves", description: "Ancient rock-cut caves and UNESCO site", rating: 4.6, image: "https://images.unsplash.com/photo-1560067425-fe08c2a3e9c5?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Vada Pav", price: 20, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" },
            { name: "Pav Bhaji", price: 150, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Colaba Causeway", type: "Street Fashion", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Delhi",
        places: [
            { name: "India Gate", description: "War memorial honoring British Indian Army soldiers", rating: 4.7, image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80" },
            { name: "Qutub Minar", description: "Tallest brick minaret in the world", rating: 4.6, image: "https://images.unsplash.com/photo-1582239459203-aa49547d6d53?auto=format&fit=crop&w=800&q=80" },
            { name: "Red Fort", description: "Massive 17th-century Mughal fortress", rating: 4.7, image: "https://images.unsplash.com/photo-1584988081190-7d63df4777d1?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Chole Bhature", price: 120, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Chandni Chowk", type: "Everything & Anything", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Shimla",
        places: [
            { name: "Mall Road", description: "Vibrant central street lined with shops and cafes", rating: 4.7, image: "https://images.unsplash.com/photo-1626082987178-c1792ce374ac?auto=format&fit=crop&w=800&q=80" },
            { name: "Kufri", description: "Beautiful hill station famous for snow and views", rating: 4.5, image: "https://images.unsplash.com/photo-1625442544155-2ff3ab215286?auto=format&fit=crop&w=800&q=80" },
            { name: "Jakhoo Temple", description: "Ancient temple with a colossal statue of Hanuman", rating: 4.6, image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Momos", price: 80, image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "Lakkar Bazaar", type: "Wooden Crafts", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
        ]
    },
    {
        name: "Kolkata",
        places: [
            { name: "Victoria Memorial", description: "Stunning marble building honoring Queen Victoria", rating: 4.8, image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80" },
            { name: "Howrah Bridge", description: "Massive cantilever bridge over the Hooghly River", rating: 4.7, image: "https://images.unsplash.com/photo-1587452308709-661ff97cf707?auto=format&fit=crop&w=800&q=80" },
            { name: "Dakshineswar Temple", description: "Famous riverside Hindu temple", rating: 4.8, image: "https://images.unsplash.com/photo-1605347206101-52ea28bebf7a?auto=format&fit=crop&w=800&q=80" }
        ],
        food: [
            { name: "Rasgulla", price: 40, image: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=400&q=80" },
            { name: "Mishti Doi", price: 60, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80" }
        ],
        markets: [
            { name: "New Market", type: "Apparel & Food", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80" }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding');

        await Destination.deleteMany({});
        console.log('Cleared existing destinations');

        await Destination.insertMany(seedData);
        console.log('🌱 Successfully seeded MongoDB with mock destinations');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
