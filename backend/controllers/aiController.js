const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();



/**
 * Utility to execute async functions with exponential backoff retry.
 * Specifically handles 503 (service unavailable/high demand) and 429 (rate limit).
 */
async function executeWithRetry(fn, maxRetries = 3, delay = 2000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const isRetryable = error.message.includes('503') || 
                              error.message.includes('Service Unavailable') || 
                              error.message.includes('high demand') ||
                              error.message.includes('429') ||
                              error.message.includes('Too Many Requests');
            
            if (!isRetryable) throw error;
            
            console.warn(`⚠️ AI Attempt ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
    throw lastError;
}

const aiController = {
    async generateItinerary(req, res) {
        console.log('📥 AI Request Received:', req.body);
        let { destination, budget, duration, days, tripType, vibe, origin } = req.body;

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error('❌ Configuration Error: GEMINI_API_KEY is not set on the server.');
            return res.status(500).json({ 
                error: 'AI service is not configured.', 
                details: 'The server is missing the GEMINI_API_KEY environment variable.' 
            });
        }

        // Verification log (shows first/last 3 chars)
        console.log(`🔑 Using API Key: ${key.substring(0, 3)}...${key.substring(key.length - 3)}`);

        const genAI = new GoogleGenerativeAI(key);
        
        // Sync parameters between frontend and backend
        duration = duration || days;
        tripType = tripType || vibe;

        if (!destination || !duration || !budget || !tripType) {
            console.error('⚠️ Validation Error: Missing parameters', { destination, duration, budget, tripType });
            return res.status(400).json({ error: 'Missing required trip parameters' });
        }

        try {
            // Prioritizing gemini-2.0-flash, then trying gemini-1.5-pro as a high-quality fallback
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash", 
            "gemini-1.5-flash-latest"
        ];
        let result;
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 Attempting generation with model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = `
                    Create a detailed, high-quality day-by-day travel itinerary for a trip from ${origin || 'the user\'s location'} to ${destination}.
                    Trip Details:
                    - Duration: ${duration} days
                    - Budget: ₹${budget} (Total)
                    - Vibe/Type: ${tripType}
                    
                    Requirements:
                    1. Provide 3-4 activities per day (Morning, Afternoon, Evening).
                    2. Include one unique local food/restaurant recommendation for each day.
                    3. Categorize the budget into 'Budget', 'Mid-range', or 'Luxury'.
                    4. RETURN ONLY A VALID JSON OBJECT.
                    
                    JSON Structure:
                    {
                      "itinerary": [
                        {
                          "day": 1,
                          "title": "...",
                          "activities": [
                            { "time": "Morning", "task": "...", "location": "...", "estCost": "₹XXX" }
                          ],
                          "dining": { "name": "...", "dish": "...", "type": "..." }
                        }
                      ],
                      "travelTips": ["..."],
                      "budgetSummary": "..."
                    }
                `;

                result = await executeWithRetry(() => model.generateContent(prompt));
                if (result) {
                    console.log(`✅ Success with model: ${modelName}`);
                    break; 
                }
            } catch (err) {
                lastError = err;
                console.warn(`❌ Model ${modelName} failed: ${err.message}`);
                if (err.message.includes('404') || err.message.includes('not found')) {
                    continue; // Try next model
                }
                throw err; // Stop if it's a non-model error (like 401 or 429)
            }
        }

        if (!result) throw lastError;

        const response = await result.response;
        let text = response.text();
            
            console.log('--- AI RAW RESPONSE START ---');
            console.log(text);
            console.log('--- AI RAW RESPONSE END ---');

            // Robust JSON extraction
            let jsonString = text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonString = jsonMatch[0];
            }

            try {
                const itineraryJson = JSON.parse(jsonString);
                console.log('✅ Successfully parsed AI itinerary');
                res.json(itineraryJson);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError.message);
                console.error('Faulty JSON String:', jsonString);
                res.status(500).json({ 
                    error: 'AI returned an invalid plan format.',
                    details: 'Failed to extract valid JSON from response.'
                });
            }

        } catch (error) {
            console.error('❌ Gemini API Error:', error.message);
            res.status(500).json({ 
                error: 'Failed to generate plan with AI.',
                details: error.message,
                suggestion: 'Check if your API key is correct and active in Google AI Studio.'
            });
        }
    },

    async generateTransport(req, res) {
        const { origin, destination, type } = req.body;
        const key = process.env.GEMINI_API_KEY;

        if (!key) return res.status(500).json({ error: 'AI Key missing' });

        const genAI = new GoogleGenerativeAI(key);
        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
        
        let result;
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = `
                    Suggest 3 realistic ${type} (train or bus) options for travel from ${origin} to ${destination}.
                    Format the response as a valid JSON array of objects.
                    
                    Structure:
                    [
                      {
                        "id": 1,
                        "operator": "Name of Train/Bus",
                        "depTime": "HH:MM AM/PM",
                        "arrTime": "HH:MM AM/PM",
                        "duration": "XH XM",
                        "price": "₹XXXX",
                        "from": "Station/Stop Name",
                        "to": "Station/Stop Name",
                        "badge": "Class/Type (e.g. Sleeper, AC)"
                      }
                    ]
                    RETURN ONLY THE JSON ARRAY.
                `;
                result = await model.generateContent(prompt);
                if (result) break;
            } catch (err) {
                console.warn(`Transport AI fallback: ${modelName} failed`);
            }
        }

        try {
            const text = result.response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse transport AI' });
        }
    }
};

module.exports = aiController;
