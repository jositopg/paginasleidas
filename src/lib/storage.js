const KEY = 'paginas_books'

export function getBooks() {
  try {
    const books = JSON.parse(localStorage.getItem(KEY)) || []
    // Normalize old books that were saved before status field existed
    return books.map(b => b.status ? b : { ...b, status: 'read' })
  } catch {
    return []
  }
}

export function saveBook(book) {
  const books = getBooks()
  books.unshift(book)
  localStorage.setItem(KEY, JSON.stringify(books))
}

export function deleteBook(id) {
  const books = getBooks().filter(b => b.id !== id)
  localStorage.setItem(KEY, JSON.stringify(books))
}

export function updateBook(updated) {
  const books = getBooks().map(b => b.id === updated.id ? updated : b)
  localStorage.setItem(KEY, JSON.stringify(books))
}

export function saveAiContent(bookId, type, content) {
  const books = getBooks().map(b => {
    if (b.id !== bookId) return b
    return { ...b, aiContent: { ...(b.aiContent || {}), [type]: content } }
  })
  localStorage.setItem(KEY, JSON.stringify(books))
}
