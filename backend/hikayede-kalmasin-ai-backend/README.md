# Hikayede Kalmasin AI Backend (Firebase Functions)

This directory contains the secure backend proxy for the Gemini AI integration.

## Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Blaze plan (required for external API calls like Gemini)

## Setup
1. `cd functions`
2. `npm install`
3. Log in to Firebase: `firebase login`
4. Set the Gemini API Key:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   (When prompted, paste your API key from [Google AI Studio](https://aistudio.google.com/))

## Deployment
Deploy only the functions:
```bash
firebase deploy --only functions
```

## CORS Configuration
If your GitHub Pages URL changes, update the allowed origins in `functions/index.js`.
Currently allowed:
- `https://parantez-official.github.io`
- `https://hikayede-kalmasin.github.io`
- `http://localhost:5500` (Local Development)
