import { computeStats, formatMonthKey } from '../lib/stats'

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
  const stats = computeStats(books)

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <h1 className="text-xl font-semibold text-black">Páginas</h1>
        <button
          onClick={onAdd}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          + Añadir
        </button>
      </div>

      {books.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <>
          {/* Stats strip */}
          <div className="px-5 pb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Últimos 12 meses</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Libros" value={stats.totalBooks} />
              <StatCard label="Páginas" value={stats.totalPages.toLocaleString('es-ES')} />
              <StatCard label="Autores" value={stats.authorsCount} />
            </div>
          </div>

          {/* Genres */}
          {stats.genres.length > 0 && (
            <div className="px-5 pb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Géneros</p>
              <div className="space-y-2">
                {stats.genres.slice(0, 5).map(g => (
                  <div key={g.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black">{g.name}</span>
                      <span className="text-gray-400">{g.count}</span>
                    </div>
                    <div className="h-0.5 bg-gray-100 rounded-full">
                      <div className="h-0.5 bg-black rounded-full transition-all" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra stats */}
          <div className="px-5 pb-6 grid grid-cols-2 gap-3">
            {stats.avgRating && (
              <MiniCard label="Valoración media" value={`${stats.avgRating} ★`} />
            )}
            {stats.longest && (
              <MiniCard label="Libro más largo" value={`${stats.longest.pages} págs`} sub={stats.longest.title} />
            )}
            {stats.shortest && stats.shortest !== stats.longest && (
              <MiniCard label="Libro más corto" value={`${stats.shortest.pages} págs`} sub={stats.shortest.title} />
            )}
            {stats.langs.length > 0 && (
              <MiniCard label="Idiomas" value={stats.langs.map(l => LANG_LABELS[l] || l.toUpperCase()).join(' · ')} />
            )}
            {stats.bestMonth && (
              <MiniCard label="Mejor mes" value={formatMonthKey(stats.bestMonth[0])} sub={`${stats.bestMonth[1]} libro${stats.bestMonth[1] > 1 ? 's' : ''}`} />
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mx-5 mb-6" />

          {/* Book grid */}
          <div className="px-5 pb-10">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Todos los libros</p>
            <div className="grid grid-cols-4 gap-3">
              {books.map(book => (
                <button
                  key={book.id}
                  onClick={() => onSelect(book)}
                  className="group flex flex-col"
                >
                  {book.cover
                    ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full aspect-[2/3] object-cover rounded group-hover:opacity-75 transition-opacity"
                      />
                    )
                    : (
                      <div className="w-full aspect-[2/3] bg-gray-100 rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <span className="text-gray-300 text-xs text-center px-1 leading-tight">{book.title}</span>
                      </div>
                    )
                  }
                  {book.dateRead && (
                    <span className="text-gray-300 text-xs mt-1">{formatDate(book.dateRead)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
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
