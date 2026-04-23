const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate', aiController.generateItinerary);
router.post('/transport', aiController.generateTransport);
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

router.post('/transport-ai', async (req, res) => {
    const { origin, destination } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
        const prompt = `
Generate transport options from ${origin} to ${destination}.

Requirements:
1. FIRST, carefully determine if it is physically possible and realistic to travel by train or bus between ${origin} and ${destination} (e.g. if they are in different continents, separated by oceans, or international routes like India to Dubai, it is NOT possible).
2. IF it is NOT possible, you MUST return an empty array for options.
3. IF it IS possible, provide up to 2 train options and 2 bus options.

For each valid option include:
  - type (train or bus)
  - name
  - departure time
  - arrival time
  - duration
  - price

Return response STRICTLY as a JSON object with a single key "options" containing the array of options.

Example response if NOT possible:
{
  "options": []
}

Example response if possible:
{
  "options": [
    {
      "type": "train",
      "name": "Express Train",
      "departure": "06:00 AM",
      "arrival": "02:00 PM",
      "duration": "8h",
      "price": "₹1200"
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
        res.status(500).json({ error: 'Failed to generate transport with AI' });
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
