const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    console.warn('Gemini API key not configured, using fallback questions');
    return FALLBACK_QUESTIONS;
  }

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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API response body:', errBody);
      throw new Error(`Gemini API error: ${response.status} — ${errBody}`);
    }

    const data = await response.json();
    // JSON mode guarantees the output is raw JSON — just parse directly
    const text = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

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
 * Analyze a scam message for social engineering tactics (stretch goal)
 */
export async function analyzeScamTactics(message) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    return {
      tactics: ['Unable to analyze — API not configured'],
      riskLevel: 'Unknown',
    };
  }

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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Scam analysis failed:', error);
    return {
      tactics: ['Analysis unavailable'],
      riskLevel: 'Unknown',
      explanation: 'Could not analyze the message.',
    };
  }
}
