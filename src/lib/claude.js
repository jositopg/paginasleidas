import Anthropic from '@anthropic-ai/sdk'

const KEY = 'paginas_api_key'

export function getApiKey() {
  return localStorage.getItem(KEY) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(KEY, key.trim())
}

function getClient() {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_API_KEY')
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export async function generateSummary(title, author, onChunk) {
  const client = getClient()
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Acabo de terminar de leer "${title}" de ${author}.

Hazme dos cosas:

## Resumen
Un resumen del libro: de qué trata, su estructura y mensaje principal (3-4 párrafos).

## Ideas clave
Los 6-8 aprendizajes, conceptos o insights más importantes que se sacan del libro. Explica cada uno en 2-3 frases.

Escríbelo en español, de forma clara y concisa. Usa exactamente los títulos ## que te indico.`
    }]
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
  }
}

export async function generateBriefing(title, author, onChunk) {
  const client = getClient()
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Voy a empezar a leer "${title}" de ${author}. Prepárame para la lectura con un briefing estructurado:

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

Escríbelo en español, en tono cercano y motivador. Usa exactamente los títulos ## que te indico.`
    }]
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
  }
}
