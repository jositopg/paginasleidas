import { useState } from 'react'
import { computeStats, getReadYears, formatMonthKey } from '../lib/stats'

const LANG_LABELS = {
  es: 'ES', en: 'EN', fr: 'FR', de: 'DE',
  it: 'IT', pt: 'PT', ca: 'CA', other: '?',
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function HomeView({ books, onAdd, onSelect }) {
  const years = getReadYears(books)
  const [selectedYear, setSelectedYear] = useState(years[0] ?? null)

  const readingBooks = books.filter(b => b.status === 'reading')
  const wantBooks = books.filter(b => b.status === 'want')
  const readBooks = books.filter(b => b.status === 'read' && b.dateRead)
  const filteredRead = selectedYear === null
    ? readBooks
    : readBooks.filter(b => new Date(b.dateRead).getFullYear() === selectedYear)

  const stats = computeStats(books, selectedYear)
  const allTimePages = books
    .filter(b => b.status === 'read' && b.pages)
    .reduce((s, b) => s + b.pages, 0)

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <h1 className="text-xl font-semibold text-black">Páginas Leídas</h1>
        <button
          onClick={onAdd}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          + Añadir
        </button>
      </div>

      {books.length === 0 && <EmptyState onAdd={onAdd} />}

      {/* All-time pages */}
      {allTimePages > 0 && (
        <div className="px-5 pb-6">
          <div className="border border-gray-100 rounded-xl px-5 py-4 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-semibold text-black">{allTimePages.toLocaleString('es-ES')}</p>
              <p className="text-xs text-gray-400 mt-1">páginas leídas en total</p>
            </div>
            <p className="text-xs text-gray-300">{books.filter(b => b.status === 'read').length} libros</p>
          </div>
        </div>
      )}

      {/* Leyendo */}
      {readingBooks.length > 0 && (
        <div className="px-5 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Leyendo ahora</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {readingBooks.map(book => (
              <button key={book.id} onClick={() => onSelect(book)} className="flex-shrink-0 group">
                {book.cover
                  ? <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded group-hover:opacity-75 transition-opacity" />
                  : <div className="w-16 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-300 text-xs text-center px-1 leading-tight">{book.title}</span>
                    </div>
                }
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Year filter */}
      {years.length > 0 && (
        <div className="px-5 pb-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  selectedYear === y
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {y}
              </button>
            ))}
            <button
              onClick={() => setSelectedYear(null)}
              className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${
                selectedYear === null
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              Todos
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Libros" value={stats.total} />
              <StatCard label="Páginas" value={stats.totalPages > 0 ? stats.totalPages.toLocaleString('es-ES') : '—'} />
              <StatCard label="Autores" value={stats.authorsCount} />
            </div>
          </div>

          {/* Genres */}
          {stats.genres.length > 0 && (
            <div className="px-5 pb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Géneros</p>
              <div className="space-y-2">
                {stats.genres.slice(0, 5).map(g => (
                  <div key={g.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black">{g.name}</span>
                      <span className="text-gray-400">{g.count}</span>
                    </div>
                    <div className="h-0.5 bg-gray-100 rounded-full">
                      <div className="h-0.5 bg-black rounded-full" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra stats grid */}
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            {stats.avgRating && (
              <MiniCard label="Valoración media" value={`${stats.avgRating} ★`} />
            )}
            {stats.avgDays && (
              <MiniCard label="Tiempo medio" value={`${stats.avgDays} días`} sub="por libro" />
            )}
            {stats.fastest && (
              <MiniCard label="Más rápido" value={`${stats.fastest.daysToRead} días`} sub={stats.fastest.title} />
            )}
            {stats.slowest && stats.slowest.id !== stats.fastest?.id && (
              <MiniCard label="Más despacio" value={`${stats.slowest.daysToRead} días`} sub={stats.slowest.title} />
            )}
            {stats.longest && (
              <MiniCard label="Libro más largo" value={`${stats.longest.pages} págs`} sub={stats.longest.title} />
            )}
            {stats.shortest && (
              <MiniCard label="Libro más corto" value={`${stats.shortest.pages} págs`} sub={stats.shortest.title} />
            )}
            {stats.topAuthor && (
              <MiniCard label="Autor favorito" value={stats.topAuthor.name} sub={`${stats.topAuthor.count} libros`} />
            )}
            {stats.langs.length > 0 && (
              <MiniCard label="Idiomas" value={stats.langs.map(l => LANG_LABELS[l] || l.toUpperCase()).join(' · ')} />
            )}
            {stats.bestMonth && (
              <MiniCard label="Mejor mes" value={formatMonthKey(stats.bestMonth[0])} sub={`${stats.bestMonth[1]} libro${stats.bestMonth[1] > 1 ? 's' : ''}`} />
            )}
          </div>
        </>
      )}

      {/* Divider before grid */}
      {filteredRead.length > 0 && (
        <div className="border-t border-gray-100 mx-5 mb-5" />
      )}

      {/* Read books grid */}
      {filteredRead.length > 0 && (
        <div className="px-5 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
            {selectedYear ? `Leídos en ${selectedYear}` : 'Todos los leídos'}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {filteredRead.map(book => (
              <button key={book.id} onClick={() => onSelect(book)} className="group flex flex-col">
                {book.cover
                  ? <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover rounded group-hover:opacity-75 transition-opacity" />
                  : <div className="w-full aspect-[2/3] bg-gray-100 rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <span className="text-gray-300 text-xs text-center px-1 leading-tight">{book.title}</span>
                    </div>
                }
                {book.dateRead && (
                  <span className="text-gray-300 text-xs mt-1">{formatDate(book.dateRead)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiero leer */}
      {wantBooks.length > 0 && (
        <div className="px-5 pb-10">
          <div className="border-t border-gray-100 mb-5" />
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Quiero leer</p>
          <div className="space-y-2">
            {wantBooks.map(book => (
              <button
                key={book.id}
                onClick={() => onSelect(book)}
                className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                {book.cover
                  ? <img src={book.cover} alt="" className="w-8 h-11 object-cover rounded flex-shrink-0" />
                  : <div className="w-8 h-11 bg-gray-100 rounded flex-shrink-0" />
                }
                <div className="min-w-0">
                  <p className="text-sm text-black truncate">{book.title}</p>
                  <p className="text-xs text-gray-400 truncate">{book.author}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-2xl font-semibold text-black">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function MiniCard({ label, value, sub }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-black">{value}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="text-5xl mb-6">📚</p>
      <p className="text-black font-medium mb-2">Sin libros todavía</p>
      <p className="text-gray-400 text-sm mb-8">Añade el primero para empezar a ver tus estadísticas</p>
      <button
        onClick={onAdd}
        className="bg-black text-white text-sm px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Añadir primer libro
      </button>
    </div>
  )
}
