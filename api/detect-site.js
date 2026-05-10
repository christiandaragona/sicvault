export const config = { runtime: 'edge' }

const SYSTEM = `You are a password policy expert. Given a website or service name, return its known password requirements as a compact JSON object. If exact rules are unknown, use sensible defaults for that category of service.

Respond with ONLY a JSON object — no markdown, no explanation:
{
  "minLength": <number>,
  "maxLength": <number|null>,
  "upper": <boolean>,
  "lower": <boolean>,
  "numbers": <boolean>,
  "symbols": <boolean>,
  "allowedSymbols": <string|null>,
  "excludeAmbiguous": <boolean>,
  "notes": "<one sentence summary>"
}`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  const { site } = await req.json()
  if (!site?.trim()) {
    return new Response(JSON.stringify({ error: 'site is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Site: ${site.trim()}` }],
    }),
  })

  const data = await res.json()
  const text = data?.content?.[0]?.text ?? '{}'

  try {
    const policy = JSON.parse(text)
    return new Response(JSON.stringify({ policy }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to parse policy' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
