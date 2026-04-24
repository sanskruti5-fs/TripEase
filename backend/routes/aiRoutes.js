const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate', aiController.generateItinerary);
router.post('/transport', aiController.generateTransport);
router.post('/optimize', aiController.optimizeItinerary);

router.post('/plan', async (req, res) => {
    const { days, vibe, origin, destination } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
        const prompt = `
Create a detailed ${days}-day ${vibe} trip plan.

Origin: ${origin}
Destination: ${destination}

STRICT RULES:
- The trip must ONLY be for ${destination}
- Do NOT include any other city or country
- Do NOT replace destination with a random place
- All places, food, and activities must belong to ${destination}

Include:
1. Travel plan from ${origin} to ${destination} (Day 1)
2. Day-wise itinerary
3. Famous places in ${destination}
4. Local food recommendations in ${destination}
5. Travel tips specific to ${destination}

EXTRA:
- If destination is in India -> suggest Indian transport (train, flight, bus)
- If international -> include flight suggestion + basic visa tip
- Keep output clean and structured

Return only plain formatted text. Do NOT use markdown symbols like ** or #. Just use simple spacing and dashes.
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        res.send(data.choices[0].message.content);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate plan with Groq' });
    }
});

const transportCache = {};

router.post('/transport-ai', async (req, res) => {
    const { origin, destination, routeType } = req.body;
    const cacheKey = `${origin}-${destination}`;

    if (transportCache[cacheKey]) {
        return res.json(transportCache[cacheKey]);
    }

    const apiKey = process.env.GROQ_API_KEY;

    try {
        const prompt = `
Generate realistic transport options from ${origin} to ${destination}.

STRICT RULES:
- Follow pricing rules EXACTLY:
  ${routeType}

- If route is international:
  DO NOT generate direct train or bus
  ONLY generate:
    - Ship + Train OR Bus + Ship

- Prices must be realistic and stable
- DO NOT generate random cheap prices

- Maintain consistency:
  If route is long international, prices must always be high (₹20,000+)

- Include:
  type (train/bus/ship combination)
  name
  departure
  arrival
  duration
  price

Return response STRICTLY as a JSON object with a single key "options" containing the array of options.

Example format:
{
  "options": [
    {
      "type": "Ship + Train",
      "name": "Oceanic Express",
      "departure": "06:00 AM",
      "arrival": "02:00 PM (next day)",
      "duration": "32h",
      "price": "₹45,000"
    }
  ]
}
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const text = data.choices[0].message.content;
        const parsed = JSON.parse(text);
        
        let finalOptions = parsed.options || [];

        // Post-validation clamping
        finalOptions = finalOptions.map(opt => {
            let priceStr = opt.price || "₹0";
            let num = parseInt(priceStr.toString().replace(/[^0-9]/g, ''));
            if (isNaN(num)) num = 0;

            if (routeType === 'domestic') {
                if (opt.type && opt.type.toLowerCase().includes('train')) {
                    num = Math.max(300, Math.min(3000, num));
                } else {
                    num = Math.max(200, Math.min(2000, num));
                }
            } else {
                if (num < 20000) {
                    num = 50000;
                }
            }
            opt.price = `₹${num.toLocaleString('en-IN')}`;
            return opt;
        });

        transportCache[cacheKey] = finalOptions;
        res.json(finalOptions);
    } catch (error) {
        const fallback = routeType === 'domestic' ? [
            { type: "train", name: "Express Train", departure: "06:00 AM", arrival: "02:00 PM", duration: "8h", price: "₹850" },
            { type: "bus", name: "Volvo AC Sleeper", departure: "09:00 PM", arrival: "08:00 AM", duration: "11h", price: "₹1,200" }
        ] : [
            { type: "Ship + Train", name: "Oceanic Transit", departure: "08:00 AM", arrival: "10:00 AM (next day)", duration: "26h", price: "₹45,000" }
        ];
        res.json(fallback);
    }
});

router.post('/flights-ai', async (req, res) => {
    const { origin, destination, routeType } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
        const prompt = `
Generate 3 realistic flight options from ${origin} to ${destination}.

Rules:
- Route type is ${routeType}.
- If domestic, price must be ₹3,000 to ₹10,000.
- If short_international, price must be ₹10,000 to ₹30,000.
- If long_international, price must be ₹40,000 to ₹120,000.
- Use realistic airlines for this route (e.g., Air India, Emirates, British Airways).
- DO NOT generate unrealistic cheap prices.

Return response STRICTLY as a JSON object with a single key "options" containing the array of flights. 
Each flight must have:
- type: "flight"
- operator: airline name
- departure: e.g. "06:00 AM"
- arrival: e.g. "02:00 PM"
- duration: e.g. "8h 30m"
- price: e.g. "₹45,000"

Example:
{
  "options": [
    {
      "type": "flight",
      "operator": "Air India",
      "departure": "08:30 AM",
      "arrival": "04:15 PM",
      "duration": "7h 45m",
      "price": "₹45,000"
    }
  ]
}
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const text = data.choices[0].message.content;
        const parsed = JSON.parse(text);
        res.json(parsed.options || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate flights with AI' });
    }
});

module.exports = router;
