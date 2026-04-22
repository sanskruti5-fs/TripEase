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
- Include exactly 2 train options and 2 bus options
- For each option include:
  - type (train or bus)
  - name
  - departure time
  - arrival time
  - duration
  - price
- Data should look realistic based on route
- Do NOT include any other cities
- Keep it clean and structured

Return response strictly in JSON format like:
[
  {
    "type": "train",
    "name": "Express Train",
    "departure": "06:00 AM",
    "arrival": "02:00 PM",
    "duration": "8h",
    "price": "₹1200"
  }
]
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
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate transport with AI' });
    }
});

module.exports = router;
