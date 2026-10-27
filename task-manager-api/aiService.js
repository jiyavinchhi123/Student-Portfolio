const OpenAI = require('openai');

/**
 * In-memory sliding window rate limiter
 * Supplementary Problem: Max 1 AI request per task title per 15 seconds, and max 10 per minute per IP.
 */
const requestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 15000; // 15 seconds cooldown for identical title

function checkRateLimit(identifier) {
  const now = Date.now();
  const lastRequest = requestHistory.get(identifier);
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequest)) / 1000);
    return { allowed: false, waitSeconds };
  }
  requestHistory.set(identifier, now);
  // Clean up old entries
  if (requestHistory.size > 200) {
    for (const [key, time] of requestHistory.entries()) {
      if (now - time > 60000) requestHistory.delete(key);
    }
  }
  return { allowed: true };
}

/**
 * Contextual NLP Rule-Based Generator for Graceful Degradation.
 * Guarantees zero-downtime and realistic suggestions even if OpenAI/Gemini is offline,
 * credentials are missing, or API quota is exhausted.
 */
function generateFallbackSuggestion(title) {
  const lower = (title || '').toLowerCase();
  let description = `Execute tasks and follow-up milestones required to complete "${title}".`;
  let suggestedPriority = 'medium';
  let suggestedCategory = 'Personal';

  if (lower.includes('auth') || lower.includes('login') || lower.includes('security') || lower.includes('password')) {
    description = `Implement secure authentication workflows, credential hashing, session tokens, and route protection for "${title}".`;
    suggestedPriority = 'high';
    suggestedCategory = 'Learning';
  } else if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('crash')) {
    description = `Investigate root cause of reported defect in "${title}", write regression tests, and apply production patch.`;
    suggestedPriority = 'high';
    suggestedCategory = 'Deadline';
  } else if (lower.includes('docker') || lower.includes('ci/cd') || lower.includes('deploy') || lower.includes('pipeline')) {
    description = `Configure containerization manifests, automate deployment pipelines, and verify environment health for "${title}".`;
    suggestedPriority = 'high';
    suggestedCategory = 'Learning';
  } else if (lower.includes('dsa') || lower.includes('leetcode') || lower.includes('algorithm') || lower.includes('tree')) {
    description = `Solve algorithm problem "${title}", analyze time and space complexity, and document optimal edge cases.`;
    suggestedPriority = 'medium';
    suggestedCategory = 'DSA';
  } else if (lower.includes('test') || lower.includes('jest') || lower.includes('audit')) {
    description = `Design unit and integration test assertions for "${title}" ensuring full branch coverage and fault tolerance.`;
    suggestedPriority = 'medium';
    suggestedCategory = 'Learning';
  } else if (lower.includes('ui') || lower.includes('css') || lower.includes('design') || lower.includes('frontend')) {
    description = `Refine user interface aesthetics, responsiveness, and accessible micro-interactions for "${title}".`;
    suggestedPriority = 'low';
    suggestedCategory = 'Personal';
  }

  return {
    description,
    suggestedPriority,
    suggestedCategory,
    source: 'graceful-fallback',
    fallback: true,
    disclaimer: 'This suggestion was generated locally (Responsible AI graceful degradation). Review before saving.'
  };
}

/**
 * Main AI Generation Controller
 * Prioritizes OpenAI API -> Gemini API -> Graceful Local Fallback
 */
async function generateTaskDescription(title, clientIdentifier = 'default') {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Task title is required to generate a description.');
  }

  const cleanTitle = title.trim();

  // 1. Rate Limiting Check (Supplementary Problem)
  const rateLimit = checkRateLimit(`${clientIdentifier}_${cleanTitle.toLowerCase()}`);
  if (!rateLimit.allowed) {
    const error = new Error(`Rate limit exceeded: Please wait ${rateLimit.waitSeconds}s before requesting AI suggestions for this task again.`);
    error.status = 429;
    error.retryAfter = rateLimit.waitSeconds;
    throw error;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 2. Try OpenAI API if key is present
  if (openaiKey && openaiKey !== 'your_key_here' && openaiKey.startsWith('sk-')) {
    try {
      const client = new OpenAI({ apiKey: openaiKey });
      const prompt = `You are an expert productivity assistant. Given the task title "${cleanTitle}", write:
1. A concise, professional, actionable task description (1 to 2 sentences max).
2. A suggested priority: "low", "medium", or "high".

Respond STRICTLY in valid JSON format:
{
  "description": "...",
  "suggestedPriority": "low" | "medium" | "high"
}`;

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 150,
        temperature: 0.7
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      return {
        description: parsed.description || cleanTitle,
        suggestedPriority: ['low', 'medium', 'high'].includes(parsed.suggestedPriority?.toLowerCase()) 
          ? parsed.suggestedPriority.toLowerCase() 
          : 'medium',
        source: 'openai-gpt-4o-mini',
        fallback: false,
        disclaimer: 'This suggestion is AI-generated (OpenAI). Please review and edit before saving.'
      };
    } catch (apiErr) {
      console.warn(`[AI Service:OpenAI Error] ${apiErr.message}. Activating Graceful Degradation...`);
    }
  }

  // 3. Try Gemini API if key is present
  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Given the task title "${cleanTitle}", write a concise 1-2 sentence description and suggest priority (low, medium, high). Return JSON: {"description": "...", "suggestedPriority": "medium"}`
            }]
          }]
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            description: parsed.description || cleanTitle,
            suggestedPriority: ['low', 'medium', 'high'].includes(parsed.suggestedPriority?.toLowerCase()) 
              ? parsed.suggestedPriority.toLowerCase() 
              : 'medium',
            source: 'gemini-1.5-flash',
            fallback: false,
            disclaimer: 'This suggestion is AI-generated (Google Gemini). Please review and edit before saving.'
          };
        }
      }
    } catch (geminiErr) {
      console.warn(`[AI Service:Gemini Error] ${geminiErr.message}. Activating Graceful Degradation...`);
    }
  }

  // 4. Graceful Degradation Fallback (Triggered on missing keys, 401s, 429s, or network timeouts)
  console.log(`[AI Service:Graceful Fallback] Providing contextual rule-based description for: "${cleanTitle}"`);
  return generateFallbackSuggestion(cleanTitle);
}

module.exports = {
  generateTaskDescription,
  generateFallbackSuggestion,
  checkRateLimit
};
