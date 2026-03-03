import { useState, useEffect } from 'react'
import { Save, Loader2, PenTool, Check } from 'lucide-react'
import { DossierSuivi } from '../../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
  collaborateurNom: string
}

export default function TabObservations({ dossier, onSave, saving, collaborateurNom }: Props) {
  const [observations, setObservations] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setObservations(dossier.observations || '')
  }, [dossier])

  const isDirty = observations !== (dossier.observations || '')

  const handleSave = async () => {
    await onSave({ observations: observations.trim() || null })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  const handleSignBeneficiaire = () => {
    onSave({
      observations: observations.trim() || null,
      signature_beneficiaire_date: new Date().toISOString(),
    })
  }

  const handleSignReferent = () => {
    onSave({
      observations: observations.trim() || null,
      signature_referent_date: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">9. Observations & Signatures</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observations</label>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          className="input"
          rows={6}
          placeholder="Observations générales, points d'attention, remarques..."
        />
      </div>

      {(isDirty || justSaved) && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || justSaved}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
              justSaved
                ? 'bg-green-600'
                : 'bg-red-500 animate-pulse-soft'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
             : justSaved ? <Check className="w-4 h-4 mr-2" />
             : <Save className="w-4 h-4 mr-2" />}
            {justSaved ? 'Mis à jour !' : 'Mettre à jour'}
          </button>
        </div>
      )}

      {/* Signatures */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Signatures numériques</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Signature bénéficiaire */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bénéficiaire</p>
            {dossier.signature_beneficiaire_date ? (
              <div className="text-sm text-green-600 dark:text-green-400">
                <PenTool className="w-4 h-4 inline mr-1" />
                Signé le {format(new Date(dossier.signature_beneficiaire_date), 'd MMMM yyyy à HH:mm', { locale: fr })}
              </div>
            ) : (
              <button onClick={handleSignBeneficiaire} disabled={saving} className="btn-secondary text-sm">
                <PenTool className="w-4 h-4 mr-1" /> Signer (bénéficiaire)
              </button>
            )}
          </div>

          {/* Signature référent */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Référent</p>
            {dossier.signature_referent_date ? (
              <div className="text-sm text-green-600 dark:text-green-400">
                <PenTool className="w-4 h-4 inline mr-1" />
                Signé le {format(new Date(dossier.signature_referent_date), 'd MMMM yyyy à HH:mm', { locale: fr })}
                {collaborateurNom && ` par ${collaborateurNom}`}
              </div>
            ) : (
              <button onClick={handleSignReferent} disabled={saving} className="btn-secondary text-sm">
                <PenTool className="w-4 h-4 mr-1" /> Signer (référent)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
