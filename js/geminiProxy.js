/**
 * Configuration – replace with your Vercel backend URL.
 * Example: "https://hikayede-kalmasin-ai-backend.vercel.app"
 */
const BACKEND_URL = "https://hikayede-kalmasin-e3vi.vercel.app";

/**
 * Show a temporary toast message.
 */
function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 260px;
    padding: 12px 20px;
    border-radius: 6px;
    color: #fff;
    font-family: sans-serif;
    font-size: 0.95rem;
    text-align: center;
    z-index: 9999;
    opacity: 0.95;
    background: ${type === 'error' ? '#e53e3e' : '#3182ce'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/**
 * Main function – call from your UI when a user submits a report.
 * @param {string} userPrompt
 * @param {string} mode - 'analyze', 'chat', 'report'
 */
export async function analyzeReport(userPrompt, mode = 'analyze') {
  if (!userPrompt || typeof userPrompt !== "string") {
    showToast("Girdi metni boş olamaz.", "error");
    throw new Error("Empty prompt");
  }

  const payload = { prompt: userPrompt, mode };
  const endpoint = `${BACKEND_URL}/api/analyze-report`;

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (resp.status === 429) {
      showToast("Çok fazla istek gönderildi – lütfen biraz bekleyin.", "error");
      throw new Error("Rate limited");
    }

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      const msg = errData.error || `Sunucu hatası (${resp.status})`;
      showToast(msg, "error");
      throw new Error(msg);
    }

    return await resp.json();
  } catch (e) {
    if (e.message !== "Rate limited") {
      showToast("Analiz servisine ulaşılamıyor. Daha sonra tekrar deneyin.", "error");
    }
    throw e;
  }
}
