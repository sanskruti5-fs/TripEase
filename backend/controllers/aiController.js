const aiController = {
    async generateItinerary(req, res) {
        let { destination, duration, vibe, budget, travelers, origin, tripType, days } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'Groq API Key missing' });

        // Sync parameters
        const actualDuration = duration || days || 3;
        const actualVibe = vibe || tripType || 'balanced';

        try {
            const prompt = `
                Act as a professional travel planner. Create a highly detailed ${actualDuration}-day travel itinerary for a trip from ${origin || 'the user\'s location'} to ${destination}.
                The vibe should be ${actualVibe}, with a ${budget || 'flexible'} budget.
                
                You MUST return ONLY a valid JSON object with this exact structure:
                {
                  "itinerary": [
                    {
                      "day": 1,
                      "title": "Title",
                      "activities": [
                        { "time": "Morning", "task": "Activity name", "location": "Location", "estCost": "₹XXX" }
                      ],
                      "dining": { "name": "Restaurant", "dish": "Dish", "type": "Type" }
                    }
                  ],
                  "travelTips": ["Tip 1"],
                  "budgetSummary": "Summary"
                }
                Do not include any extra text before or after the JSON.
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
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            const text = data.choices[0].message.content;
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const itineraryJson = JSON.parse(jsonMatch ? jsonMatch[0] : text);
            
            console.log('✅ Successfully generated itinerary using Groq');
            res.json(itineraryJson);

        } catch (error) {
            console.error('❌ Groq API Error:', error.message);
            res.status(500).json({ 
                error: 'Failed to generate plan with AI.',
                details: error.message
            });
        }
    },

    async generateTransport(req, res) {
        const { origin, destination, type } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'Groq API Key missing' });

        try {
            const prompt = `
                Suggest 3 realistic ${type} (train or bus) options for travel from ${origin} to ${destination}.
                Return ONLY a valid JSON object containing an array under the key "transport":
                {
                  "transport": [
                    {
                      "id": 1,
                      "operator": "Name of Train/Bus",
                      "depTime": "HH:MM AM/PM",
                      "arrTime": "HH:MM AM/PM",
                      "duration": "XH XM",
                      "price": "₹XXXX",
                      "from": "Station/Stop Name",
                      "to": "Station/Stop Name",
                      "badge": "Class/Type"
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
            res.json(parsed.transport || parsed);
        } catch (e) {
            console.error('❌ Groq Transport Error:', e.message);
            res.status(500).json({ error: 'Failed to parse transport AI' });
        }
    }
};

module.exports = aiController;
