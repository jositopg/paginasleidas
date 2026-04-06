const KEY = 'paginas_books'

export function getBooks() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
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
