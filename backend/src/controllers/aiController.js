const axios = require('axios');
const { env } = require('../config/env');

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Proxy for Groq API chat completions
 * This keeps the GROQ_API_KEY secure on the backend.
 */
exports.chat = async (req, res, next) => {
  try {
    const { messages, model, max_tokens, temperature, top_p } = req.body;
    
    // Use server's env key
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Server missing GROQ_API_KEY' });
    }

    const response = await axios.post(
      GROQ_BASE,
      {
        model: model || 'llama-3.1-8b-instant',
        messages,
        max_tokens: max_tokens || 512,
        temperature: temperature || 0.3,
        top_p: top_p || 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      // Forward the error from Groq
      res.status(err.response.status).json({ success: false, message: err.response.data?.error?.message || 'Groq API Error' });
    } else {
      next(err);
    }
  }
};
