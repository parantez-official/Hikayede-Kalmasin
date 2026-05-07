import fetch from 'node-fetch';

/**
 * Calls Gemini with a specific mode and strictly enforced JSON schema for analysis.
 * @param {string} userPrompt
 * @param {string} apiKey
 * @param {string} mode - 'analyze', 'chat', 'report'
 * @returns {Promise<Object|string>} structured response or plain text
 */
export async function callGemini(userPrompt, apiKey, mode = 'analyze') {
  let systemPrompt = '';
  let responseMimeType = "text/plain";

  if (mode === 'analyze') {
    systemPrompt = `
You are a content-moderation assistant for "Hikayede Kalmasin" (a bullying reporting platform). 
Analyze the supplied report text and return a JSON object with the following EXACT fields:

{
  "summary": string,                // short 1-2 sentence summary in Turkish
  "severity": "low" | "medium" | "high" | "critical",
  "category": "physical_bullying" | "cyberbullying" | "harassment" | "self_harm_risk" | "emergency" | "spam_fake" | "other",
  "recommended_action": string,     // action recommendation in Turkish
  "risk_score": number,             // 0 to 100
  "is_emergency": boolean,          // true if there is immediate physical danger or self-harm risk
  "admin_note": string              // private note for admin in Turkish
}

Rules:
1. Detect emergencies (suicide threats, immediate violence) and set is_emergency to true.
2. Detect spam or fake reports.
3. Language must be Turkish for summary, recommended_action, and admin_note.
4. Do NOT add any text outside the JSON.
`;
    responseMimeType = "application/json";
  } else if (mode === 'chat') {
    systemPrompt = 'Sen admin panelinde çalışan bir ihbar analiz asistanısın. Görevin gelen ihbarları tarafsız, kısa ve güvenli şekilde değerlendirmeye yardımcı olmaktır. Kesin hüküm verme, suç isnadı yapma, teşhis koyma, hukuki karar üretme. Yalnızca ön analiz, risk farkındalığı ve admin aksiyonu önerisi sun. Kişisel veri, tehdit, şiddet, zorbalık, kendine zarar veya acil risk belirtilerini işaretle. Kritik durumlarda insan moderatör incelemesi ve uygun kurumlara yönlendirme öner. Yanıtlarında madde madde, kısa ve net bir dil kullan. Türkçe yanıt ver.';
  } else if (mode === 'report') {
    systemPrompt = 'Sen admin panelinde çalışan bir ihbar analiz ve raporlama asistanısın. Sana aktif ihbarlardan oluşan bir veri listesi verilecek. Görevin bu ihbarları tarafsız, güvenli ve kısa şekilde analiz ederek adminin hızlı karar alabileceği bir rapor hazırlamaktır. Kesin hüküm verme, suç isnadı yapma, hukuki karar üretme veya psikolojik teşhis koyma. Yalnızca ön değerlendirme, risk farkındalığı, yoğunluk analizi ve aksiyon önerisi sun. Kritik durumlarda insan moderatör incelemesi ve gerekli kurumlara yönlendirme öner. Türkçe yanıt ver. Sonunda şu notu ekle: "Bu rapor yapay zeka tarafından oluşturulmuş bir ön değerlendirmedir. Kesin karar için insan moderatör incelemesi gereklidir."';
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nUser Input: ${userPrompt}`
      }]
    }],
    generationConfig: {
      responseMimeType: responseMimeType
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  
  if (responseMimeType === "application/json") {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Raw Response:", text);
      throw new Error("Failed to parse Gemini response as JSON");
    }
  }

  return text;
}
