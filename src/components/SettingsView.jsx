import { useState } from 'react'
import { getApiKey, saveApiKey, getProvider, saveProvider } from '../lib/claude'

const PROVIDERS = [
  {
    id: 'anthropic',
    label: 'Claude',
    placeholder: 'sk-ant-...',
    hint: 'console.anthropic.com',
    model: 'claude-opus-4-6',
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    placeholder: 'sk-...',
    hint: 'platform.openai.com/api-keys',
    model: 'gpt-4o-mini',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    placeholder: 'AIza...',
    hint: 'aistudio.google.com/app/apikey',
    model: 'gemini-2.0-flash',
  },
]

export default function SettingsView({ onBack }) {
  const [provider, setProvider] = useState(getProvider())
  const [key, setKey] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  const current = PROVIDERS.find(p => p.id === provider)

  function handleSave() {
    saveProvider(provider)
    saveApiKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleProviderSwitch(id) {
    setProvider(id)
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-black mb-8 flex items-center gap-1 transition-colors">
        ← Volver
      </button>

      <h1 className="text-xl font-semibold text-black mb-1">Ajustes IA</h1>
      <p className="text-sm text-gray-400 mb-7">Elige tu proveedor de IA preferido e introduce tu API key.</p>

      {/* Provider tabs */}
      <div className="flex gap-2 mb-6">
        {PROVIDERS.map(p => (
          <button
            key={p.id}
            onClick={() => handleProviderSwitch(p.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
              provider === p.id
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Key input */}
      <div className="space-y-5">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            API Key — {current.label}
          </label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder={current.placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors font-mono"
          />
          <p className="text-xs text-gray-300 mt-2">
            La clave se guarda solo en tu dispositivo. Consíguela en{' '}
            <span className="text-gray-400">{current.hint}</span>
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Modelo: <span className="font-mono">{current.model}</span>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-30"
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

      {/* What AI generates */}
      <div className="mt-10 border-t border-gray-100 pt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Qué genera la IA</p>
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <span>📝</span>
            <div>
              <p className="text-sm font-medium text-black">Resumen e ideas clave</p>
              <p className="text-xs text-gray-400 mt-0.5">En libros leídos. Resume el libro y extrae los aprendizajes principales para volver a ellos cuando quieras.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span>🔭</span>
            <div>
              <p className="text-sm font-medium text-black">Briefing previo</p>
              <p className="text-xs text-gray-400 mt-0.5">En libros que quieras leer o estés leyendo. Te prepara con contexto, estructura y qué vas a aprender.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
