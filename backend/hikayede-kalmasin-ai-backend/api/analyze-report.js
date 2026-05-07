import fetch from 'node-fetch';

// CORS Configuration
const ALLOWED_ORIGINS = [
  'https://parantez-official.github.io',
  'https://hikayede-kalmasin.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

export default async function handler(req, res) {
  // CORS Handling
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, mode } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    return res.status(500).json({ 
      error: 'Backend Hatası: GEMINI_API_KEY bulunamadı veya boş. Lütfen Vercel ayarlarından değişkeni ekleyip "vercel --prod" ile tekrar yükleyin.' 
    });
  }

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const result = await callGemini(prompt, apiKey, mode || 'analyze');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function callGemini(userPrompt, apiKey, mode) {
  let systemPrompt = '';
  let responseMimeType = "text/plain";

  if (mode === 'analyze') {
    systemPrompt = `
Analyze the supplied bullying report and return JSON:
{
  "summary": string,
  "severity": "low" | "medium" | "high" | "critical",
  "category": "physical_bullying" | "cyberbullying" | "harassment" | "self_harm_risk" | "emergency" | "spam_fake" | "other",
  "recommended_action": string,
  "risk_score": number,
  "is_emergency": boolean,
  "admin_note": string
}
Language: Turkish for text fields.
`;
    responseMimeType = "application/json";
  } else if (mode === 'chat') {
    systemPrompt = 'Sen bir ihbar analiz asistanısın. Türkçe yanıt ver. Kısa ve öz ol.';
  } else if (mode === 'report') {
    systemPrompt = 'Sen bir raporlama asistanısın. Verilen ihbar listesini analiz et ve Türkçe rapor sun.';
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\nInput: ${userPrompt}` }] }],
      generationConfig: { responseMimeType }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return responseMimeType === "application/json" ? JSON.parse(text) : text;
}
