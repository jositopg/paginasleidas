import { useState } from 'react'
import { deleteBook, saveAiContent } from '../lib/storage'
import { generateSummary, generateBriefing, getApiKey } from '../lib/claude'

const LANG_LABELS = {
  es: 'Español', en: 'Inglés', fr: 'Francés', de: 'Alemán',
  it: 'Italiano', pt: 'Portugués', ca: 'Catalán', other: 'Otro',
}

const STATUS_LABELS = {
  want: 'Quiero leer',
  reading: 'Leyendo',
  read: 'Leído',
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function AiSection({ title, icon, content, loading, onGenerate, onSettings }) {
  const hasKey = !!getApiKey()

  return (
    <div className="border-t border-gray-100 pt-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{icon} {title}</p>
        {!loading && (
          <button
            onClick={hasKey ? onGenerate : onSettings}
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            {!hasKey ? 'Configurar IA' : content ? 'Regenerar' : 'Generar'}
          </button>
        )}
      </div>

      {loading && (
        <div className="text-xs text-gray-300 mb-2">Generando...</div>
      )}

      {content && <MarkdownContent text={content} />}

      {!content && !loading && (
        <p className="text-sm text-gray-300">
          {hasKey ? `Pulsa "Generar" para crear el ${title.toLowerCase()}.` : 'Configura tu API key de Anthropic en ajustes para usar esta función.'}
        </p>
      )}
    </div>
  )
}

function MarkdownContent({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <p key={i} className="font-semibold text-black text-sm mt-4 first:mt-0">{line.slice(3)}</p>
        }
        if (!line.trim()) return <div key={i} className="h-1" />
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="text-black font-medium">{part}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function BookDetailView({ book, onBack, onDeleted, onEdit, onSettings }) {
  const [confirming, setConfirming] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [summaryText, setSummaryText] = useState(book.aiContent?.summary || '')
  const [briefingText, setBriefingText] = useState(book.aiContent?.briefing || '')

  async function handleGenerateSummary() {
    setSummaryLoading(true)
    setSummaryText('')
    let full = ''
    try {
      await generateSummary(book.title, book.author, chunk => {
        full += chunk
        setSummaryText(full)
      })
      saveAiContent(book.id, 'summary', full)
    } catch (e) {
      setSummaryText(e.message === 'NO_API_KEY' ? '' : 'Error al generar. Inténtalo de nuevo.')
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleGenerateBriefing() {
    setBriefingLoading(true)
    setBriefingText('')
    let full = ''
    try {
      await generateBriefing(book.title, book.author, chunk => {
        full += chunk
        setBriefingText(full)
      })
      saveAiContent(book.id, 'briefing', full)
    } catch (e) {
      setBriefingText(e.message === 'NO_API_KEY' ? '' : 'Error al generar. Inténtalo de nuevo.')
    } finally {
      setBriefingLoading(false)
    }
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    deleteBook(book.id)
    onDeleted()
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
          ← Volver
        </button>
        <button onClick={onEdit} className="text-sm text-gray-400 hover:text-black transition-colors">
          Editar
        </button>
      </div>

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
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Estado</span>
          <span className="text-black">{STATUS_LABELS[book.status] || '—'}</span>
        </div>
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
        {book.dateStarted && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Empezado</span>
            <span className="text-black">{formatDate(book.dateStarted)}</span>
          </div>
        )}
        {book.dateRead && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Terminado</span>
            <span className="text-black">{formatDate(book.dateRead)}</span>
          </div>
        )}
        {book.daysToRead > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tiempo de lectura</span>
            <span className="text-black">{book.daysToRead} días</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {book.notes && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Notas</p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{book.notes}</p>
        </div>
      )}

      {/* AI: Briefing (for want/reading) */}
      {(book.status === 'want' || book.status === 'reading') && (
        <AiSection
          title="Briefing previo"
          icon="🔭"
          content={briefingText}
          loading={briefingLoading}
          onGenerate={handleGenerateBriefing}
          onSettings={onSettings}
        />
      )}

      {/* AI: Summary (for read) */}
      {book.status === 'read' && (
        <AiSection
          title="Resumen e ideas clave"
          icon="📝"
          content={summaryText}
          loading={summaryLoading}
          onGenerate={handleGenerateSummary}
          onSettings={onSettings}
        />
      )}

      {/* Delete */}
      <div className="pt-4">
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
    </div>
  )
}
