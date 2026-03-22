const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenRouter Client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter rankings
    "X-Title": "AI Resume Builder", // Optional
  }
});

/**
 * POST /api/ai/generate
 * Body: { prompt, context, type }
 * Types: 'summary', 'bullets', 'skills', 'chat'
 */
router.post('/generate', async (req, res) => {
  const { prompt, context, type } = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' });
  }

  try {
    let systemPrompt = "You are a professional resume writer. Your responses must be natural, human-like, and directly usable in a resume. IMPORTANT: Do NOT include any introductory text, preambles, or conversational filler. Return ONLY the requested content.";
    let userPrompt = "";

    if (type === 'summary') {
      userPrompt = `Based on the following experience and skills, write a compelling 3-sentence professional summary for a resume: ${context}. Return ONLY the 3-sentence summary paragraph.`;
    } else if (type === 'bullets') {
      userPrompt = `Enhance the following job description into high-impact, results-oriented bullet points using strong action verbs and metrics. 
      Input: ${context}. 
      CRITICAL FORMATTING RULES:
      1. Each bullet point MUST be a SINGLE LINE.
      2. Each bullet point MUST start on a NEW LINE.
      3. Use the '•' symbol for each bullet.
      4. RETURN ONLY THE BULLET POINTS. NO PREAMBLE.`;
    } else if (type === 'skills') {
      userPrompt = `Based on the following job experience, suggest 5-8 relevant industry-standard skills: ${context}. Return ONLY a comma-separated list of skills.`;
    } else if (type === 'chat') {
      systemPrompt = "You are a helpful AI Resume Assistant. Help users with resume writing and career advice. Be professional and concise. Do NOT add conversational boilerplate if generating content.";
      userPrompt = prompt;
    } else {
      userPrompt = prompt || context;
    }

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001", // Using Gemini 2.0 Flash via OpenRouter
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error('AI Generation Error (OpenRouter):', err);
    res.status(500).json({ error: 'Failed to generate AI content', details: err.message });
  }
});

module.exports = router;
