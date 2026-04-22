const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDQJTpYDLsC1v6a9mwJpbea21BwkB_dZ0I");

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
        let { destination, budget, duration, days, tripType, vibe, origin } = req.body;
        
        // Sync parameters between frontend and backend
        duration = duration || days;
        tripType = tripType || vibe;

        if (!destination || !duration || !budget || !tripType) {
            console.error('Validation Error: Missing parameters', { destination, duration, budget, tripType });
            return res.status(400).json({ error: 'Missing required trip parameters' });
        }

        try {
            console.log(`🚀 Starting AI generation for ${destination} (${duration} days, budget: ₹${budget})`);
            
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const prompt = `
                Create a detailed, high-quality day-by-day travel itinerary for a trip from ${origin || 'the user\'s location'} to ${destination}.
                Trip Details:
                - Duration: ${duration} days
                - Budget: ₹${budget} (Total)
                - Vibe/Type: ${tripType}
                
                CRITICAL GUARDRAILS:
                1. You MUST respect the exact budget of ₹${budget}. Ensure that the sum of estimated costs (activities + dining) stays within this budget.
                2. The vibe MUST match "${tripType}". Select activities, locations, and dining that perfectly align with this theme.
                
                Requirements:
                1. Provide 3-4 activities per day (Morning, Afternoon, Evening).
                2. Include one unique local food/restaurant recommendation for each day.
                3. Categorize the budget into 'Budget' (Affordable), 'Mid-range', or 'Luxury' based on the ₹${budget} limit.
                4. Keep the tone inspiring and helpful.
                5. RETURN ONLY A VALID JSON OBJECT matching the structure below.
                
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

            // Wrap in retry logic
            const result = await executeWithRetry(() => model.generateContent(prompt));
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
            console.error('Error Details:', error.stack);
            res.status(500).json({ 
                error: 'Failed to generate plan with AI.',
                details: error.message.includes('quota') ? 'API Quota exceeded.' : error.message,
                debug_info: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
};

module.exports = aiController;
