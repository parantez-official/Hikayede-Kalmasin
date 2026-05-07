import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Ultra-Aggressive CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, mode } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    return res.status(500).json({ 
      error: 'Backend Hatası: GEMINI_API_KEY bulunamadı. Lütfen Vercel panelinden Environment Variables kısmına GEMINI_API_KEY ekleyin.' 
    });
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
    systemPrompt = `Analyze bullying report and return JSON: { "summary": string, "severity": "low"|"medium"|"high"|"critical", "category": string, "recommended_action": string, "risk_score": number, "is_emergency": boolean, "admin_note": string } Turkish language.`;
    responseMimeType = "application/json";
  } else {
    systemPrompt = 'Sen bir asistansın. Türkçe yanıt ver.';
  }

  const cleanApiKey = apiKey.trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${cleanApiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\nInput: ${userPrompt}` }] }],
      generationConfig: { response_mime_type: responseMimeType }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let detail = "";
    try {
      const errJson = JSON.parse(errText);
      detail = errJson.error?.message || errText;
    } catch(e) { detail = errText; }
    throw new Error(`Google API Hatası (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return responseMimeType === "application/json" ? JSON.parse(text) : text;
}
