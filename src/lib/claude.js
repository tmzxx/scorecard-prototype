const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY;
}

async function callClaude(prompt, maxTokens = 1500) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY. Add it to your .env file.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

export async function scoreConversation(rubric, transcript, contextNotes) {
  const criteriaList = rubric.criteria
    .map(c => `- ${c.name} (${c.priority === 'high' ? 'High Priority' : 'Standard'}): ${c.description}`)
    .join('\n');

  const prompt = `You are an expert CX quality evaluator. Evaluate the conversation below strictly against the following rubric criteria. Do not apply general quality standards — only evaluate against what is defined.

RUBRIC: ${rubric.name}
CRITERIA:
${criteriaList}

${contextNotes ? `CONTEXT: ${contextNotes}` : ''}

CONVERSATION TRANSCRIPT:
${transcript}

Return ONLY valid JSON in this exact structure (no markdown, no explanation — just the JSON object):
{
  "overallScore": <number 1-5>,
  "verdict": "<one sentence summary of overall quality>",
  "criteria": [
    {
      "name": "<criterion name exactly as listed>",
      "score": <number 1-5>,
      "pass": <true if score >= 3, false if score < 3>,
      "reasoning": "<2-4 sentences explaining the score>",
      "excerpt": "<verbatim quote from the transcript that most informed this score>",
      "suggestion": "<specific improvement suggestion if score < 3, otherwise null>"
    }
  ]
}`;

  const text = await callClaude(prompt, 2000);

  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(clean);
}

export async function generateTrendSummary(scoreHistory) {
  if (!scoreHistory || scoreHistory.length === 0) {
    return 'No evaluation history yet. Run a few scorecards to see trend analysis here.';
  }

  const prompt = `You are a CX quality analyst. Based on the scorecard history below, write a 2-3 sentence natural language summary of the most notable patterns. Be specific — name criteria and trends, not generalities. Focus on what has improved, what has declined, and where consistent weaknesses exist.

SCORECARD HISTORY (JSON):
${JSON.stringify(scoreHistory, null, 2)}

Return only the summary paragraph. No headers, no bullet points.`;

  return callClaude(prompt, 400);
}
