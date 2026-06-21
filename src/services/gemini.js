// Gemini access strategy:
//  • In production (Vercel), calls go through /api/gemini, a serverless function
//    that holds the key server-side — the key is NEVER shipped in the browser bundle.
//  • For local dev, if VITE_GEMINI_API_KEY is set, we fall back to a direct call
//    so the team can test without deploying. Never set VITE_GEMINI_API_KEY in the
//    production Vercel project — set GEMINI_API_KEY (no VITE_ prefix) instead.
const LOCAL_DEV_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DIRECT_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Calls Gemini through the secure proxy, falling back to a direct call only when
 * a local dev key is present. Returns the raw Gemini response JSON.
 */
async function callGemini(prompt, generationConfig) {
  // Try the secure server proxy first (works in production on Vercel)
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, generationConfig }),
    });
    if (res.ok) return await res.json();
    // If the proxy isn't available (e.g. `vite dev` with no serverless runtime),
    // fall through to the direct dev path below.
  } catch {
    // Network/proxy not reachable — fall through to dev fallback.
  }

  // Local-dev fallback: direct call using a VITE_ key (dev only)
  if (LOCAL_DEV_KEY && LOCAL_DEV_KEY !== 'YOUR_GEMINI_KEY_HERE') {
    const res = await fetch(`${DIRECT_URL}?key=${LOCAL_DEV_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { temperature: 0.7 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini direct call failed: ${res.status}`);
    return await res.json();
  }

  throw new Error('Gemini unavailable: no proxy and no local dev key');
}

/**
 * Default fallback questions if Gemini API fails
 */
const FALLBACK_QUESTIONS = [
  { question: "What is the name of the street you grew up on?", answer: "(family member should know)" },
  { question: "What was the first meal I ever cooked for you?", answer: "(family member should know)" },
  { question: "What nickname did we use for our neighbor?", answer: "(family member should know)" },
];

/**
 * Generate memory-based challenge questions using Gemini AI
 * @param {string[]} memories - Array of memory strings from the user
 * @returns {Array<{question: string, answer: string}>} Array of Q&A pairs
 */
export async function generateMemoryChallenges(memories) {
  const prompt = `You are helping a family create private security verification questions to protect against phone scams.

Based on these private family memories shared by a family member, generate exactly 3 personal verification questions that ONLY a real family member would know the answer to.

IMPORTANT RULES:
- Questions should be specific enough that a stranger or AI voice clone could NOT guess the answer
- Answers should be short (1-3 words)
- Do NOT include the memories verbatim in the questions — rephrase them
- Make the questions feel natural, like something a parent would ask

Family memories:
${memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Return a JSON array of exactly 3 objects, each with "question" and "answer" keys.`;

  try {
    const data = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    });

    const text = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!text) throw new Error('Empty response from Gemini');

    const questions = JSON.parse(text);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }
    return questions;
  } catch (error) {
    console.error('Gemini API failed, using fallback questions:', error);
    return FALLBACK_QUESTIONS;
  }
}

/**
 * Analyze a scam message for social engineering tactics
 */
export async function analyzeScamTactics(message) {
  const prompt = `You are a scam detection expert. Analyze this message that someone received and identify the social engineering manipulation tactics being used.

Message: "${message}"

Identify which of these tactics are present:
- False Urgency (pressuring immediate action)
- Isolation ("don't tell anyone")
- False Authority (impersonating police, bank, etc.)
- Emotional Manipulation (guilt, fear, love)
- Financial Pressure (demanding gift cards, wire transfers, crypto)

Return ONLY a JSON object with no other text:
{"tactics": ["tactic1", "tactic2"], "riskLevel": "High/Medium/Low", "explanation": "one sentence summary"}`;

  try {
    const data = await callGemini(prompt, {
      temperature: 0.3,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
    });

    const text = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!text) throw new Error('Empty response');

    // JSON mode returns clean JSON, but guard against stray prose just in case
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error('Scam analysis failed:', error);
    return {
      tactics: ['Analysis unavailable'],
      riskLevel: 'Unknown',
      explanation: 'Could not analyze the message right now.',
    };
  }
}

