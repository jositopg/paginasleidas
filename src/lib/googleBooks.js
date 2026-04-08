const OL_LANG_MAP = { eng: 'en', spa: 'es', fre: 'fr', ger: 'de', ita: 'it', por: 'pt', cat: 'ca' }

async function searchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,cover_i,number_of_pages_median,language,subject`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(item => {
    const lang = item.language?.[0]
    return {
      id: `ol_${item.key}`,
      title: item.title || 'Sin título',
      author: (item.author_name || []).join(', ') || 'Autor desconocido',
      cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null,
      pages: item.number_of_pages_median || null,
      language: OL_LANG_MAP[lang] || (lang ? lang.slice(0, 2) : null),
      categories: item.subject?.slice(0, 3) || [],
      source: 'Open Library',
    }
  })
}

async function searchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (data.error) return []
  return (data.items || []).map(item => {
    const info = item.volumeInfo
    return {
      id: `gb_${item.id}`,
      title: info.title || 'Sin título',
      author: (info.authors || []).join(', ') || 'Autor desconocido',
      cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
      pages: info.pageCount || null,
      language: info.language || null,
      categories: info.categories || [],
      source: 'Google Books',
    }
  })
}

function normalize(str) {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
}

function deduplicateResults(lists) {
  const seen = new Set()
  const result = []
  for (const book of lists.flat()) {
    const key = normalize(book.title) + '_' + normalize(book.author.split(',')[0])
    if (!seen.has(key)) {
      seen.add(key)
      result.push(book)
    }
  }
  return result
}

export async function searchBooks(query) {
  if (!query.trim()) return []
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const [olResult, gbResult] = await Promise.allSettled([
      searchOpenLibrary(query),
      searchGoogleBooks(query),
    ])
    const ol = olResult.status === 'fulfilled' ? olResult.value : []
    const gb = gbResult.status === 'fulfilled' ? gbResult.value : []
    return deduplicateResults([ol, gb])
  } finally {
    clearTimeout(timeout)
  }
}
