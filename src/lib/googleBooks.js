export async function searchBooks(query) {
  if (!query.trim()) return []
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&langRestrict=`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Error buscando libros')
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
    }
  })
}
