import { onRequest } from 'firebase-functions/v2/https';
import cors from 'cors';
import { callGemini } from './utils/moderation.js';
import { sanitizeInput, validatePayload } from './utils/sanitizer.js';

// Load CORS middleware
const corsHandler = cors({
  origin: [
    'https://parantez-official.github.io', 
    'https://hikayede-kalmasin.github.io', 
    'http://localhost:5500', 
    'http://127.0.0.1:5500'
  ],
  methods: ['POST', 'OPTIONS'],
});

/**
 * AI Proxy function.
 * Endpoint: /analyzeReport
 */
export const analyzeReport = onRequest({
  region: 'europe-west1', // Choose your preferred region
  memory: '256MiB',
  timeoutSeconds: 60,
  maxInstances: 10,
}, async (req, res) => {
  return corsHandler(req, res, async () => {
    // 1. Method check
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    // 2. Validation
    const validation = validatePayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 3. Sanitization
    const sanitizedPrompt = sanitizeInput(req.body.prompt);
    const mode = req.body.mode || 'analyze';

    // 4. API Key check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Sistem yapılandırma hatası.' });
    }

    try {
      // 5. Call Gemini
      const result = await callGemini(sanitizedPrompt, apiKey, mode);
      
      // 6. Return response
      return res.status(200).json(result);
    } catch (error) {
      console.error('Gemini Error:', error);
      return res.status(500).json({ 
        error: 'Yapay zeka servisi şu anda yanıt veremiyor.',
        details: error.message 
      });
    }
  });
});
