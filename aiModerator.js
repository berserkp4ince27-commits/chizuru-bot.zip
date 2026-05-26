const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeMessage(content, context = []) {
  const system = `You are a Discord chat moderation AI. Analyze messages for harmful content.
Respond ONLY in this exact JSON format, nothing else:
{
  "flagged": true/false,
  "reason": "short reason or null",
  "severity": "low/medium/high or null"
}

Flag: hate speech, slurs, threats, harassment, NSFW, doxxing, scam links, extreme toxicity.
Do NOT flag: mild swearing in context, dark humor without clear harm, heated debate.
Severity: low=borderline, medium=clearly harmful, high=severe/immediate action needed.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system,
      messages: [
        ...context.map(m => ({ role: 'user', content: `[ctx] ${m.author}: ${m.content}` })),
        { role: 'user', content: `[analyze] ${content}` },
      ],
    });
    return JSON.parse(response.content[0].text.trim());
  } catch {
    return { flagged: false, reason: null, severity: null };
  }
}

module.exports = { analyzeMessage };
