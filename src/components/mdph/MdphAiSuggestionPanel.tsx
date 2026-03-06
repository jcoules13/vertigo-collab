import { useState } from 'react'
import { Sparkles, Loader2, Check, X, RotateCcw } from 'lucide-react'

type AiSection = 'vie_quotidienne' | 'projet_pro' | 'demandes'

interface AiContexte {
  nom?: string
  prenom?: string
  date_naissance?: string
  situation_logement?: string
  ressources?: string
  situation_pro?: string
  handicap_description?: string
  besoins?: string
  droits_actuels?: string
  texte_existant?: string
  details?: string
}

interface Props {
  section: AiSection
  contexte: AiContexte
  onAccept: (text: string) => void
  label?: string
}

export default function MdphAiSuggestionPanel({ section, contexte, onAccept, label }: Props) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSuggestion('')
    setEditing(false)

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      const res = await fetch(`${webhookUrl}/collab-mdph-ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, contexte }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la generation')
      }

      setSuggestion(data.suggestion)
    } catch (err: any) {
      setError(err.message || 'Impossible de contacter le service IA')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = () => {
    onAccept(editing ? editText : suggestion)
    setSuggestion('')
    setEditing(false)
  }

  const handleEdit = () => {
    setEditText(suggestion)
    setEditing(true)
  }

  const handleDismiss = () => {
    setSuggestion('')
    setEditing(false)
    setError('')
  }

  const sectionLabels: Record<AiSection, string> = {
    vie_quotidienne: 'vie quotidienne',
    projet_pro: 'projet professionnel',
    demandes: 'demandes de droits',
  }

  return (
    <div className="border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            {label || `Suggestion IA — ${sectionLabels[section]}`}
          </span>
        </div>

        {!suggestion && !loading && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generer une suggestion
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Generation en cours... (peut prendre quelques secondes)</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-3">
          {error}
          <button
            onClick={handleGenerate}
            className="ml-2 underline hover:no-underline"
          >
            Reessayer
          </button>
        </div>
      )}

      {suggestion && !editing && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-purple-100 dark:border-purple-800">
            {suggestion}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Accepter
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/50 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg transition-colors"
            >
              Modifier avant d'accepter
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerer
            </button>
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Ignorer
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Valider
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
