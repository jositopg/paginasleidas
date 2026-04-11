const KEY_STORAGE = 'paginas_api_key'
const PROVIDER_STORAGE = 'paginas_ai_provider'

export function getApiKey() {
  return localStorage.getItem(KEY_STORAGE) || ''
}
export function saveApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key.trim())
}
export function getProvider() {
  return localStorage.getItem(PROVIDER_STORAGE) || 'anthropic'
}
export function saveProvider(p) {
  localStorage.setItem(PROVIDER_STORAGE, p)
}

// Parse a streaming SSE response and call onEvent for each parsed JSON chunk
async function readSSE(response, onEvent) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try { onEvent(JSON.parse(data)) } catch (e) {
        // ignore malformed chunks
      }
    }
  }
}

async function readErrorBody(res) {
  try {
    const body = await res.json()
    return body?.error?.message || body?.message || `HTTP ${res.status}`
  } catch {
    return `HTTP ${res.status}`
  }
}

async function stream(prompt, onChunk) {
  const key = getApiKey()
  if (!key) throw new Error('NO_API_KEY')
  const provider = getProvider()

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic: ${await readErrorBody(res)}`)
    await readSSE(res, event => {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        onChunk(event.delta.text)
      }
    })

  } else if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`OpenAI: ${await readErrorBody(res)}`)
    await readSSE(res, event => {
      const text = event.choices?.[0]?.delta?.content
      if (text) onChunk(text)
    })

  } else if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000 },
        }),
      }
    )
    if (!res.ok) throw new Error(`Gemini: ${await readErrorBody(res)}`)
    let received = false
    await readSSE(res, event => {
      const text = event.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) { received = true; onChunk(text) }
    })
    if (!received) throw new Error('Gemini: la respuesta llegó vacía. Puede que el filtro de seguridad haya bloqueado el contenido.')
  }
}

export async function generateSummary(title, author, onChunk) {
  return stream(
    `Acabo de terminar de leer "${title}" de ${author}.

Hazme dos cosas:

## Resumen
Un resumen del libro: de qué trata, su estructura y mensaje principal (3-4 párrafos).

## Ideas clave
Los 6-8 aprendizajes, conceptos o insights más importantes que se sacan del libro. Explica cada uno en 2-3 frases.

Escríbelo en español, de forma clara y concisa. Usa exactamente los títulos ## que te indico.`,
    onChunk
  )
}

export async function generateBriefing(title, author, onChunk) {
  return stream(
    `Voy a empezar a leer "${title}" de ${author}. Prepárame para la lectura con un briefing estructurado:

## De qué va
El tema central y argumento del libro (2-3 párrafos).

## Por qué leerlo
Qué lo hace especial o valioso, qué aportó cuando se publicó.

## Qué esperar
Tipo de lectura, estructura del libro y estilo del autor.

## Contexto útil
Contexto histórico, sobre el autor, o libros relacionados que me ayudarán a entenderlo mejor.

## Qué me llevaré
Qué voy a aprender o ganar leyéndolo.

Escríbelo en español, en tono cercano y motivador. Usa exactamente los títulos ## que te indico.`,
    onChunk
  )
}
