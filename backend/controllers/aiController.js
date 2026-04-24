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
    },

    async optimizeItinerary(req, res) {
        const { places, hotels, food, transport, budget, planInfo } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'Groq API Key missing' });

        const days = planInfo?.days || 3;
        const destination = planInfo?.destination || 'the destination';

        try {
            const prompt = `
                Act as an expert travel optimizer. You are given a list of user-selected items for a ${days}-day trip to ${destination}.
                Your task is to reorder and group these exact items into a highly optimized, logical day-by-day itinerary.

                USER SELECTIONS:
                - Places to visit: ${JSON.stringify(places)}
                - Hotels (Day-wise): ${JSON.stringify(hotels)}
                - Food: ${JSON.stringify(food)}
                - Budget: ₹${budget}
                
                STRICT RULES:
                1. DO NOT invent new places, hotels, or foods. ONLY use the items provided above.
                2. Group places that are logically close to each other on the same day to minimize travel distance.
                3. Allocate places based on the hotel booked for that specific day (if hotels vary by day).
                4. BE FRUGAL: Do NOT try to use the entire budget just because it's available. Every traveler wants to save money.
                5. REALISTIC FOOD COSTS: Do NOT inflate food prices. For example, ₹12,000 for 3 days is unrealistic for most trips. Keep it natural.
                6. INCLUDE RETURN TRANSPORTATION: Factor in the cost of returning to ${planInfo?.origin || 'origin'} in the total calculations.
                7. Maintain realistic pricing for the output.
                8. Output MUST be strictly valid JSON in the exact structure below.

                REQUIRED JSON STRUCTURE:
                {
                  "optimizedPlan": [
                    {
                      "day": 1,
                      "hotel": { "name": "Hotel Name", "price": "Price", "image": "URL" },
                      "places": [
                        { "name": "Place Name", "entryFee": 500, "rationale": "Close to hotel" }
                      ],
                      "food": [
                        { "name": "Food Name", "restaurant": "Restaurant Name" }
                      ],
                      "dailyCost": "₹XXXX"
                    }
                  ],
                  "optimizationSummary": "Brief summary of how the trip was optimized.",
                  "totalEstimatedSavings": "₹XXX",
                  "savingsMessage": "A friendly message about how much the user is saving (e.g., 'You are saving ₹12,000 compared to your maximum budget!')"
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
                    temperature: 0.3,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            const text = data.choices[0].message.content;
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const optimizedJson = JSON.parse(jsonMatch ? jsonMatch[0] : text);
            
            console.log('✅ Successfully optimized itinerary using Groq');
            res.json(optimizedJson);

        } catch (error) {
            console.error('❌ Groq Optimization Error:', error.message);
            res.status(500).json({ 
                error: 'Failed to optimize plan with AI.',
                details: error.message
            });
        }
    }
};

module.exports = aiController;
