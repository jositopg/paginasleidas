import { useState } from 'react'
import { deleteBook } from '../lib/storage'

const LANG_LABELS = {
  es: 'Español', en: 'Inglés', fr: 'Francés', de: 'Alemán',
  it: 'Italiano', pt: 'Portugués', ca: 'Catalán', other: 'Otro',
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BookDetailView({ book, onBack, onDeleted }) {
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    deleteBook(book.id)
    onDeleted()
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      {/* Cover + title */}
      <div className="flex gap-5 mb-8">
        {book.cover
          ? <img src={book.cover} alt="" className="w-20 h-28 object-cover rounded flex-shrink-0" />
          : <div className="w-20 h-28 bg-gray-100 rounded flex-shrink-0" />
        }
        <div className="flex flex-col justify-end">
          <p className="font-semibold text-black text-lg leading-snug">{book.title}</p>
          <p className="text-gray-400 text-sm mt-1">{book.author}</p>
          {book.rating > 0 && (
            <p className="text-black mt-2 tracking-wide">
              {'★'.repeat(book.rating)}<span className="text-gray-200">{'★'.repeat(5 - book.rating)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-3 border-t border-gray-100 pt-6 mb-6">
        {book.dateRead && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Leído</span>
            <span className="text-black">{formatDate(book.dateRead)}</span>
          </div>
        )}
        {book.genre && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Género</span>
            <span className="text-black">{book.genre}</span>
          </div>
        )}
        {book.pages && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Páginas</span>
            <span className="text-black">{book.pages}</span>
          </div>
        )}
        {book.language && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Idioma</span>
            <span className="text-black">{LANG_LABELS[book.language] || book.language}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {book.notes && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Notas</p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{book.notes}</p>
        </div>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        className={`text-sm transition-colors ${confirming ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
      >
        {confirming ? 'Confirmar eliminación' : 'Eliminar libro'}
      </button>
      {confirming && (
        <button onClick={() => setConfirming(false)} className="ml-4 text-sm text-gray-300 hover:text-gray-400 transition-colors">
          Cancelar
        </button>
      )}
    </div>
  )
}
