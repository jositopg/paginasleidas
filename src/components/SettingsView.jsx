import { useState } from 'react'
import { getApiKey, saveApiKey } from '../lib/claude'

export default function SettingsView({ onBack }) {
  const [key, setKey] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveApiKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      <h1 className="text-xl font-semibold text-black mb-2">Ajustes</h1>
      <p className="text-sm text-gray-400 mb-8">Configura tu API key de Anthropic para activar los resúmenes y briefings con IA.</p>

      <div className="space-y-6">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-black transition-colors font-mono"
          />
          <p className="text-xs text-gray-300 mt-2">
            La clave se guarda solo en tu dispositivo. Consíguela en{' '}
            <span className="text-gray-400">console.anthropic.com</span>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-30"
        >
          {saved ? 'Guardado ✓' : 'Guardar'}
        </button>

        {getApiKey() && (
          <button
            onClick={() => { saveApiKey(''); setKey('') }}
            className="w-full text-sm text-gray-300 hover:text-gray-400 transition-colors"
          >
            Eliminar clave guardada
          </button>
        )}
      </div>

      <div className="mt-10 border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Qué se genera con IA</p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-sm font-medium text-black">Resumen e ideas clave</p>
              <p className="text-xs text-gray-400">Disponible en libros que hayas leído. Resume el libro y extrae los aprendizajes principales para que puedas volver a ellos cuando quieras.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🔭</span>
            <div>
              <p className="text-sm font-medium text-black">Briefing previo</p>
              <p className="text-xs text-gray-400">Disponible en libros que quieras leer o estés leyendo. Te prepara para la lectura con contexto, qué esperar y qué vas a aprender.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
