const LANG_MAP = { eng: 'en', spa: 'es', fre: 'fr', ger: 'de', ita: 'it', por: 'pt', cat: 'ca' }

export async function searchBooks(query) {
  if (!query.trim()) return []
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,number_of_pages_median,language,subject`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    return (data.docs || []).map(item => {
      const lang = item.language?.[0]
      return {
        googleId: item.key,
        title: item.title || 'Sin título',
        author: (item.author_name || []).join(', ') || 'Autor desconocido',
        cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null,
        pages: item.number_of_pages_median || null,
        language: LANG_MAP[lang] || (lang ? lang.slice(0, 2) : null),
        categories: item.subject?.slice(0, 3) || [],
      }
    })
  } finally {
    clearTimeout(timeout)
  }
}
