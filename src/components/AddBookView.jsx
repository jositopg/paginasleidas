import { useState } from 'react'
import { searchBooks } from '../lib/googleBooks'
import { saveBook } from '../lib/storage'

const GENRES = [
  'Novela', 'Ensayo', 'Ciencia ficción', 'Fantasía', 'Thriller',
  'Biografía', 'Historia', 'Ciencia', 'Filosofía', 'Poesía',
  'Cómic/Manga', 'Autoayuda', 'Economía', 'Otros',
]

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'Inglés' },
  { code: 'fr', label: 'Francés' },
  { code: 'de', label: 'Alemán' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugués' },
  { code: 'ca', label: 'Catalán' },
  { code: 'other', label: 'Otro' },
]

export default function AddBookView({ onBack, onSaved }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ rating: 0, genre: '', language: '', dateRead: today(), pages: '', notes: '' })

  function today() {
    return new Date().toISOString().split('T')[0]
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    setSelected(null)
    try {
      const items = await searchBooks(query)
      setResults(items)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function selectBook(book) {
    setSelected(book)
    setForm(f => ({
      ...f,
      pages: book.pages || '',
      language: book.language || '',
    }))
    setResults([])
    setQuery('')
  }

  function handleSave() {
    if (!selected) return
    const book = {
      id: crypto.randomUUID(),
      googleId: selected.googleId,
      title: selected.title,
      author: selected.author,
      cover: selected.cover,
      pages: parseInt(form.pages) || null,
      genre: form.genre,
      language: form.language,
      rating: form.rating,
      dateRead: form.dateRead,
      notes: form.notes,
    }
    saveBook(book)
    onSaved()
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      <h1 className="text-xl font-semibold text-black mb-6">Añadir libro</h1>

      {/* Search */}
      {!selected && (
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por título o autor..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
        </form>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 mb-6">
          {results.map(book => (
            <button
              key={book.googleId}
              onClick={() => selectBook(book)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left border border-gray-100"
            >
              {book.cover
                ? <img src={book.cover} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                : <div className="w-10 h-14 bg-gray-100 rounded flex-shrink-0" />
              }
              <div className="min-w-0">
                <p className="text-sm font-medium text-black truncate">{book.title}</p>
                <p className="text-xs text-gray-400 truncate">{book.author}</p>
                {book.pages && <p className="text-xs text-gray-300">{book.pages} págs</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected book + form */}
      {selected && (
        <div>
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-100">
            {selected.cover
              ? <img src={selected.cover} alt="" className="w-14 h-20 object-cover rounded flex-shrink-0" />
              : <div className="w-14 h-20 bg-gray-100 rounded flex-shrink-0" />
            }
            <div>
              <p className="font-medium text-black">{selected.title}</p>
              <p className="text-sm text-gray-400">{selected.author}</p>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-300 hover:text-black mt-2 transition-colors">
                Cambiar libro
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Rating */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Valoración</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(f => ({ ...f, rating: f.rating === n ? 0 : n }))}
                    className={`text-2xl transition-opacity ${n <= form.rating ? 'opacity-100' : 'opacity-20'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Género</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(f => ({ ...f, genre: g }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.genre === g
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Idioma</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setForm(f => ({ ...f, language: l.code }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.language === l.code
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pages */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Páginas</label>
              <input
                type="number"
                value={form.pages}
                onChange={e => setForm(f => ({ ...f, pages: e.target.value }))}
                placeholder="Número de páginas"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors w-40"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Fecha de lectura</label>
              <input
                type="date"
                value={form.dateRead}
                onChange={e => setForm(f => ({ ...f, dateRead: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Notas <span className="text-gray-300">(opcional)</span></label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Impresiones, citas, lo que quieras..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!form.genre || !form.dateRead}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
            >
              Guardar libro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
