const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate', aiController.generateItinerary);
router.post('/transport', aiController.generateTransport);
router.post('/plan', async (req, res) => {
    const { days, vibe } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
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
                        content: `Generate a structured ${days}-day trip plan for a ${vibe} vibe. Include daily activities and stay suggestions. Return as clean, readable text.`
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

module.exports = router;
