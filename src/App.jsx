import { useState, useCallback } from 'react'
import { getBooks } from './lib/storage'
import HomeView from './components/HomeView'
import AddBookView from './components/AddBookView'
import BookDetailView from './components/BookDetailView'

export default function App() {
  const [view, setView] = useState('home')
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState(() => getBooks())

  const refresh = useCallback(() => {
    setBooks(getBooks())
  }, [])

  if (view === 'add') {
    return (
      <AddBookView
        onBack={() => setView('home')}
        onSaved={() => { refresh(); setView('home') }}
      />
    )
  }

  if (view === 'detail' && selectedBook) {
    return (
      <BookDetailView
        book={selectedBook}
        onBack={() => setView('home')}
        onDeleted={() => { refresh(); setView('home') }}
      />
    )
  }

  return (
    <HomeView
      books={books}
      onAdd={() => setView('add')}
      onSelect={book => { setSelectedBook(book); setView('detail') }}
    />
  )
}
