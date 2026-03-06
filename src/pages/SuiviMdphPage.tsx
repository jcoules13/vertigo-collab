import { useState } from 'react'
import { Users, Loader2, Search, CalendarClock, FileText, CheckCircle, XCircle, ArrowLeft, Info } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MdphStatusResponse {
  found: boolean
  prenom_initial?: string
  mdph?: {
    statut: 'brouillon' | 'en_cours' | 'a_relire' | 'pret' | 'envoye'
    updated_at: string
  } | null
  prochain_rdv?: {
    date: string
    heure_debut: string
    heure_fin: string
    lieu: string | null
    canal?: string
  } | null
  documents_a_preparer?: string | null
  documents_mdph?: {
    certificat_medical: boolean
    justificatif_identite: boolean
    justificatif_domicile: boolean
    jugement_protection: boolean
  }
}

const STEPS = [
  { key: 'brouillon', label: 'Brouillon', color: 'bg-gray-400', textColor: 'text-gray-700' },
  { key: 'en_cours', label: 'En cours', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { key: 'a_relire', label: 'À relire', color: 'bg-amber-500', textColor: 'text-amber-700' },
  { key: 'pret', label: 'Prêt', color: 'bg-green-500', textColor: 'text-green-700' },
  { key: 'envoye', label: 'Envoyé', color: 'bg-teal-500', textColor: 'text-teal-700' },
] as const

const DOC_LABELS: Record<string, string> = {
  certificat_medical: 'Certificat médical (moins de 6 mois)',
  justificatif_identite: "Justificatif d'identité",
  justificatif_domicile: 'Justificatif de domicile',
  jugement_protection: 'Jugement de protection (si applicable)',
}

function formatSecu(value: string): string {
  const digits = value.replace(/\s/g, '')
  const parts = [
    digits.slice(0, 1),
    digits.slice(1, 3),
    digits.slice(3, 5),
    digits.slice(5, 7),
    digits.slice(7, 10),
    digits.slice(10, 13),
    digits.slice(13, 15),
  ].filter(Boolean)
  return parts.join(' ')
}

export default function SuiviMdphPage() {
  const [secu, setSecu] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MdphStatusResponse | null>(null)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    const cleaned = secu.replace(/\s/g, '')
    if (cleaned.length < 13) {
      setError('Veuillez saisir un numéro de sécurité sociale valide (15 chiffres).')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      const res = await fetch(`${webhookUrl}/collab-mdph-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_securite_sociale: cleaned }),
      })
      const data = await res.json()

      if (!data.found) {
        setError('Aucun dossier trouvé pour ce numéro. Vérifiez votre saisie ou contactez Vertigo Com\' Handicap.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSecu('')
    setResult(null)
    setError('')
  }

  const handleSecuChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, '').slice(0, 15)
    setSecu(formatSecu(digits))
    setError('')
  }

  const currentStepIndex = result?.mdph
    ? STEPS.findIndex(s => s.key === result.mdph!.statut)
    : -1

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vertigo Com' Handicap</h1>
          <p className="text-xs text-gray-500">Suivi de votre dossier MDPH</p>
        </div>
      </div>

      <div className="w-full max-w-lg mt-6">
        {!result ? (
          /* Search form */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Consultez l'avancement de votre dossier</h2>
              <p className="text-sm text-gray-500 mt-1">
                Saisissez votre numéro de sécurité sociale pour accéder au suivi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de sécurité sociale
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={secu}
                  onChange={e => handleSecuChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="1 85 01 75 016 012 45"
                  className="w-full px-4 py-3 text-lg font-mono tracking-wider border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center"
                  maxLength={22}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleLookup}
                disabled={loading || secu.replace(/\s/g, '').length < 13}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Recherche en cours...' : 'Consulter mon dossier'}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Vos données sont traitées de manière sécurisée et confidentielle.
            </p>
          </div>
        ) : (
          /* Result view */
          <div className="space-y-4">
            {/* Greeting */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <p className="text-lg font-semibold text-gray-900">
                Bonjour{result.prenom_initial ? ` ${result.prenom_initial}` : ''} 👋
              </p>
              <p className="text-sm text-gray-500 mt-1">Voici l'état de votre dossier MDPH.</p>
            </div>

            {/* Status stepper */}
            {result.mdph ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">État du formulaire</h3>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-4">
                  {STEPS.map((step, i) => {
                    const isPast = i < currentStepIndex
                    const isCurrent = i === currentStepIndex
                    const isFuture = i > currentStepIndex
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold
                            ${isPast || isCurrent ? step.color : 'bg-gray-200'}
                            ${isCurrent ? 'ring-4 ring-offset-2 ring-teal-300 animate-pulse' : ''}
                          `}>
                            {isPast ? '✓' : i + 1}
                          </div>
                          <span className={`text-[10px] sm:text-xs mt-1.5 font-medium text-center leading-tight ${
                            isCurrent ? step.textColor + ' font-bold' : isFuture ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 ${i < currentStepIndex ? 'bg-teal-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Last update */}
                {result.mdph.updated_at && (
                  <p className="text-xs text-gray-500 text-center">
                    Dernière mise à jour : {format(new Date(result.mdph.updated_at), 'd MMMM yyyy', { locale: fr })}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun formulaire MDPH en cours pour ce dossier.</p>
              </div>
            )}

            {/* Next RDV */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-teal-600" />
                Prochain rendez-vous
              </h3>
              {result.prochain_rdv ? (
                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">
                    {format(new Date(result.prochain_rdv.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600">
                    de {result.prochain_rdv.heure_debut.slice(0, 5)} à {result.prochain_rdv.heure_fin.slice(0, 5)}
                  </p>
                  {result.prochain_rdv.lieu && (
                    <p className="text-sm text-gray-500 mt-1">📍 {result.prochain_rdv.lieu}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun rendez-vous programmé pour le moment.</p>
              )}
            </div>

            {/* Documents */}
            {(result.documents_a_preparer || result.documents_mdph) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Documents
                </h3>

                {result.documents_a_preparer && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-1">À préparer pour votre prochain rendez-vous :</p>
                    <p className="text-sm text-amber-900 whitespace-pre-line">{result.documents_a_preparer}</p>
                  </div>
                )}

                {result.documents_mdph && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Documents obligatoires MDPH :</p>
                    {Object.entries(result.documents_mdph).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${value ? 'text-gray-700' : 'text-gray-500'}`}>
                          {DOC_LABELS[key] || key}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Nouvelle recherche
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Vertigo Com' Handicap — Tous droits réservés
        </p>
      </div>
    </div>
  )
}
