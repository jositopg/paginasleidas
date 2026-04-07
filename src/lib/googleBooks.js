export async function searchBooks(query) {
  if (!query.trim()) return []
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    return (data.items || []).map(item => {
      const info = item.volumeInfo
      return {
        googleId: item.id,
        title: info.title || 'Sin título',
        author: (info.authors || []).join(', ') || 'Autor desconocido',
        cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        pages: info.pageCount || null,
        language: info.language || null,
        categories: info.categories || [],
      }
    })
  } finally {
    clearTimeout(timeout)
  }
}
