import { useState } from 'react'
import { searchBooks } from '../lib/googleBooks'
import { saveBook, updateBook } from '../lib/storage'
import { GENRES, mapGoogleCategory } from '../lib/genres'

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

const STATUSES = [
  { value: 'want', label: 'Quiero leer' },
  { value: 'reading', label: 'Leyendo' },
  { value: 'read', label: 'Ya lo leí' },
]

function today() {
  return new Date().toISOString().split('T')[0]
}

function calcDays(start, end) {
  if (!start || !end) return null
  const diff = new Date(end) - new Date(start)
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

export default function AddBookView({ onBack, onSaved, editBook = null }) {
  const isEdit = !!editBook

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(isEdit ? editBook : null)
  const [form, setForm] = useState(isEdit ? {
    status: editBook.status || 'read',
    rating: editBook.rating || 0,
    genre: editBook.genre || '',
    language: editBook.language || '',
    dateRead: editBook.dateRead || today(),
    dateStarted: editBook.dateStarted || '',
    daysToRead: editBook.daysToRead || '',
    pages: editBook.pages || '',
    notes: editBook.notes || '',
  } : {
    status: 'read',
    rating: 0,
    genre: '',
    language: '',
    dateRead: today(),
    dateStarted: '',
    daysToRead: '',
    pages: '',
    notes: '',
  })

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResults([])
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
    const autoGenre = mapGoogleCategory(book.categories)
    setForm(f => ({
      ...f,
      pages: book.pages || '',
      language: book.language || '',
      genre: autoGenre || f.genre,
    }))
    setResults([])
    setQuery('')
  }

  function setField(key, value) {
    setForm(f => {
      const next = { ...f, [key]: value }
      // Auto-calculate daysToRead when both dates set
      if ((key === 'dateStarted' || key === 'dateRead') && next.dateStarted && next.dateRead) {
        next.daysToRead = calcDays(next.dateStarted, next.dateRead) ?? f.daysToRead
      }
      return next
    })
  }

  function handleSave() {
    if (!selected) return
    const daysToRead = form.dateStarted && form.dateRead
      ? calcDays(form.dateStarted, form.dateRead)
      : parseInt(form.daysToRead) || null

    const book = {
      ...(isEdit ? { id: editBook.id } : { id: crypto.randomUUID() }),
      googleId: selected.googleId,
      title: selected.title,
      author: selected.author,
      cover: selected.cover,
      pages: parseInt(form.pages) || null,
      genre: form.genre,
      language: form.language,
      status: form.status,
      rating: form.status === 'read' ? form.rating : 0,
      dateRead: form.status === 'read' ? form.dateRead : null,
      dateStarted: form.status !== 'want' ? (form.dateStarted || null) : null,
      daysToRead: form.status === 'read' ? daysToRead : null,
      notes: form.notes,
    }

    if (isEdit) {
      updateBook(book)
    } else {
      saveBook(book)
    }
    onSaved()
  }

  const canSave = selected && form.genre && (form.status !== 'read' || form.dateRead)

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      <h1 className="text-xl font-semibold text-black mb-6">
        {isEdit ? 'Editar libro' : 'Añadir libro'}
      </h1>

      {/* Search (only when not editing) */}
      {!isEdit && !selected && (
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

      {/* Search results */}
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
              {!isEdit && (
                <button onClick={() => setSelected(null)} className="text-xs text-gray-300 hover:text-black mt-2 transition-colors">
                  Cambiar libro
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {/* Status */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Estado</label>
              <div className="flex gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setField('status', s.value)}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                      form.status === s.value
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                Género {form.genre && <span className="text-gray-300 normal-case">— detectado automáticamente</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => setField('genre', g)}
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

            {/* Dates — only for reading/read */}
            {form.status !== 'want' && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                  Fecha de inicio <span className="text-gray-300 normal-case">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={form.dateStarted}
                  onChange={e => setField('dateStarted', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            {form.status === 'read' && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Fecha de finalización</label>
                <input
                  type="date"
                  value={form.dateRead}
                  onChange={e => setField('dateRead', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            {/* Days to read — only if not auto-calculated */}
            {form.status === 'read' && !form.dateStarted && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                  Días que tardé en leerlo <span className="text-gray-300 normal-case">(opcional)</span>
                </label>
                <input
                  type="number"
                  value={form.daysToRead}
                  onChange={e => setField('daysToRead', e.target.value)}
                  placeholder="ej. 14"
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors w-32"
                />
              </div>
            )}

            {/* Auto-calculated days indicator */}
            {form.status === 'read' && form.dateStarted && form.dateRead && (
              <div className="text-sm text-gray-400">
                Tardaste{' '}
                <span className="font-medium text-black">
                  {calcDays(form.dateStarted, form.dateRead)} días
                </span>{' '}
                en leerlo
              </div>
            )}

            {/* Rating — only for read */}
            {form.status === 'read' && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Valoración</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setField('rating', form.rating === n ? 0 : n)}
                      className={`text-2xl transition-opacity ${n <= form.rating ? 'opacity-100' : 'opacity-20'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Idioma</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setField('language', l.code)}
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
                onChange={e => setField('pages', e.target.value)}
                placeholder="Número de páginas"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors w-40"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                Notas <span className="text-gray-300">(opcional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Impresiones, citas, lo que quieras..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
            >
              {isEdit ? 'Guardar cambios' : 'Guardar libro'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
