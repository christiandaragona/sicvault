import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-dev',
        configureServer(server) {
          server.middlewares.use('/api/detect-site', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405; res.end('Method not allowed'); return
            }
            const apiKey = env.ANTHROPIC_API_KEY
            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Set ANTHROPIC_API_KEY in .env.local' }))
              return
            }
            const chunks = []
            req.on('data', c => chunks.push(c))
            req.on('end', async () => {
              try {
                const { site } = JSON.parse(Buffer.concat(chunks).toString())
                const response = await fetch('https://api.anthropic.com/v1/messages', {
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
                    messages: [{ role: 'user', content: `Site: ${site}` }],
                  }),
                })
                const data = await response.json()
                const text = data?.content?.[0]?.text ?? '{}'
                const policy = JSON.parse(text)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ policy }))
              } catch (e) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: e.message }))
              }
            })
          })
        },
      },
    ],
  }
})
