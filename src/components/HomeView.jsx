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

export default function HomeView({ books, onAdd, onSelect, onSettings }) {
  const years = getReadYears(books)
  const [selectedYear, setSelectedYear] = useState(years[0] ?? null)

  const readingBooks = books.filter(b => b.status === 'reading')
  const wantBooks = books.filter(b => b.status === 'want')
  const readBooks = books.filter(b => b.status === 'read' && b.dateRead)
  const filteredRead = selectedYear === null
    ? readBooks
    : readBooks.filter(b => new Date(b.dateRead).getFullYear() === selectedYear)

  const stats = computeStats(books, selectedYear)
  const totalReadBooks = books.filter(b => b.status === 'read').length
  const allTimePages = books
    .filter(b => b.status === 'read' && b.pages)
    .reduce((s, b) => s + b.pages, 0)

  const hasNoBooks = books.length === 0
  const hasNoReadBooks = readBooks.length === 0

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Páginas</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tu diario de lectura</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onSettings}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors rounded-lg"
              title="Ajustes"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M8 1a.75.75 0 01.75.75v.793a5.27 5.27 0 011.622.672l.56-.561a.75.75 0 111.06 1.06l-.56.561A5.27 5.27 0 0112.457 5.9l.793-.001a.75.75 0 010 1.5H12.457a5.27 5.27 0 01-.672 1.622l.561.56a.75.75 0 11-1.06 1.061l-.561-.561A5.27 5.27 0 018.75 11.457v.793a.75.75 0 01-1.5 0v-.793a5.27 5.27 0 01-1.622-.672l-.56.561a.75.75 0 11-1.06-1.06l.56-.56A5.27 5.27 0 013.543 8.1H2.75a.75.75 0 010-1.5h.793A5.27 5.27 0 014.215 4.978l-.56-.561a.75.75 0 111.06-1.06l.56.56A5.27 5.27 0 017.25 3.543V2.75A.75.75 0 018 1z" fill="currentColor"/>
              </svg>
            </button>
            <button
              onClick={onAdd}
              className="bg-black text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              + Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Empty state: no books at all */}
      {hasNoBooks && <DemoState onAdd={onAdd} />}

      {/* Content when books exist */}
      {!hasNoBooks && (
        <>
          {/* Leyendo ahora */}
          {readingBooks.length > 0 && (
            <div className="px-5 pb-7">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Leyendo ahora</p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {readingBooks.map(book => (
                  <button key={book.id} onClick={() => onSelect(book)} className="flex-shrink-0 group flex flex-col gap-1.5">
                    {book.cover
                      ? <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded-lg shadow-sm group-hover:opacity-75 transition-opacity" />
                      : <div className="w-16 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-300 text-xs text-center px-1 leading-tight">{book.title}</span>
                        </div>
                    }
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No read books yet: stats preview */}
          {hasNoReadBooks && (
            <div className="px-5 pb-8">
              <div className="rounded-2xl border border-dashed border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Tus estadísticas</p>
                <div className="grid grid-cols-3 gap-2 mb-4 opacity-30 pointer-events-none select-none">
                  <div className="border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-semibold text-black">—</p>
                    <p className="text-xs text-gray-400 mt-0.5">Libros</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-semibold text-black">—</p>
                    <p className="text-xs text-gray-400 mt-0.5">Páginas</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-semibold text-black">—</p>
                    <p className="text-xs text-gray-400 mt-0.5">Autores</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Termina tu primer libro para desbloquear las estadísticas</p>
              </div>

              {/* AI features teaser */}
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Funciones IA</p>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="text-base">📝</span>
                    <div>
                      <p className="text-sm font-medium text-black">Resumen e ideas clave</p>
                      <p className="text-xs text-gray-400 mt-0.5">Al terminar un libro, genera un resumen con los aprendizajes principales.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-base">🔭</span>
                    <div>
                      <p className="text-sm font-medium text-black">Briefing previo</p>
                      <p className="text-xs text-gray-400 mt-0.5">Antes de leer, prepárate con contexto y qué esperar del libro.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Has read books: full stats */}
          {!hasNoReadBooks && (
            <>
              {/* All-time pages hero */}
              {allTimePages > 0 && (
                <div className="px-5 pb-6">
                  <div className="bg-black rounded-2xl px-5 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-white">{allTimePages.toLocaleString('es-ES')}</p>
                      <p className="text-xs text-gray-400 mt-1">páginas leídas en total</p>
                    </div>
                    <p className="text-xs text-gray-500">{totalReadBooks} libros</p>
                  </div>
                </div>
              )}

              {/* Year filter */}
              {years.length > 1 && (
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

                  {stats.genres.length > 0 && (
                    <div className="px-5 pb-5">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Géneros</p>
                      <div className="space-y-2.5">
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

              {/* Read books grid */}
              {filteredRead.length > 0 && (
                <div className="px-5 pb-6">
                  <div className="border-t border-gray-100 mb-5" />
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                    {selectedYear ? `Leídos en ${selectedYear}` : 'Todos los leídos'}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredRead.map(book => (
                      <button key={book.id} onClick={() => onSelect(book)} className="group flex flex-col">
                        {book.cover
                          ? <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm group-hover:opacity-75 transition-opacity" />
                          : <div className="w-full aspect-[2/3] bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
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
            </>
          )}

          {/* Quiero leer */}
          {wantBooks.length > 0 && (
            <div className="px-5 pb-10">
              <div className="border-t border-gray-100 mb-5" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Quiero leer</p>
              <div className="space-y-1">
                {wantBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => onSelect(book)}
                    className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-2 transition-colors"
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
        </>
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

function DemoState({ onAdd }) {
  return (
    <div className="px-5">
      <p className="text-sm text-gray-400 leading-relaxed mb-7">
        Registra los libros que lees, consulta tus estadísticas y genera resúmenes con IA.
      </p>

      {/* Demo pages hero */}
      <div className="bg-black rounded-2xl px-5 py-5 flex items-center justify-between mb-5 opacity-30 pointer-events-none select-none">
        <div>
          <p className="text-3xl font-bold text-white">12.840</p>
          <p className="text-xs text-gray-400 mt-1">páginas leídas en total</p>
        </div>
        <p className="text-xs text-gray-500">34 libros</p>
      </div>

      {/* Demo stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 opacity-30 pointer-events-none select-none">
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-black">12</p>
          <p className="text-xs text-gray-400 mt-1">Libros</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-black">4.210</p>
          <p className="text-xs text-gray-400 mt-1">Páginas</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-black">8</p>
          <p className="text-xs text-gray-400 mt-1">Autores</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-7 opacity-30 pointer-events-none select-none">
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Valoración media</p>
          <p className="text-sm font-medium text-black">4.2 ★</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Tiempo medio</p>
          <p className="text-sm font-medium text-black">18 días</p>
          <p className="text-xs text-gray-300 mt-0.5">por libro</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Autor favorito</p>
          <p className="text-sm font-medium text-black truncate">Yuval Noah Harari</p>
          <p className="text-xs text-gray-300 mt-0.5">3 libros</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Mejor mes</p>
          <p className="text-sm font-medium text-black">ene 25</p>
          <p className="text-xs text-gray-300 mt-0.5">3 libros</p>
        </div>
      </div>

      {/* AI features */}
      <div className="border border-gray-100 rounded-2xl p-5 mb-7">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Funciones IA</p>
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <span>📝</span>
            <div>
              <p className="text-sm font-medium text-black">Resumen e ideas clave</p>
              <p className="text-xs text-gray-400 mt-0.5">Genera un resumen y los aprendizajes de cada libro que termines.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span>🔭</span>
            <div>
              <p className="text-sm font-medium text-black">Briefing previo</p>
              <p className="text-xs text-gray-400 mt-0.5">Prepárate con contexto, estructura y qué esperar antes de leer.</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="w-full bg-black text-white text-sm py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors mb-10"
      >
        Añadir primer libro
      </button>
    </div>
  )
}
