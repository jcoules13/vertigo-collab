import { useState, useEffect, useMemo } from 'react'
import { Save, Loader2, Check, ShieldCheck, AlertTriangle } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

function computeAge(dateStr: string): number | null {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

export default function TabConsentement({ dossier, onSave, saving }: Props) {
  const [conservation, setConservation] = useState(false)
  const [contact, setContact] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const isMinor = useMemo(() => {
    const age = computeAge(dossier.usager_date_naissance || '')
    return age !== null && age < 18
  }, [dossier.usager_date_naissance])

  useEffect(() => {
    setConservation(dossier.consent_conservation || false)
    setContact(dossier.consent_contact || false)
  }, [dossier])

  const isDirty =
    conservation !== (dossier.consent_conservation || false) ||
    contact !== (dossier.consent_contact || false)

  const handleSave = async () => {
    const now = new Date().toISOString()
    await onSave({
      consent_conservation: conservation,
      consent_contact: contact,
      consent_date: (conservation || contact) ? now : null,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">2. Consentement RGPD</h3>

      {isMinor && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Usager mineur — Des dispositions spécifiques s'appliquent pour le recueil du consentement (autorisation du représentant légal requise).</span>
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <ShieldCheck className="w-5 h-5 inline mr-2" />
        Conformément au RGPD, le consentement de l'usager doit être recueilli avant le traitement de ses données personnelles.
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={conservation}
            onChange={e => setConservation(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Conservation des données</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">J'autorise la conservation de mes données personnelles dans le cadre de mon accompagnement.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contact}
            onChange={e => setContact(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Droit de contact</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">J'autorise l'association à me contacter par email ou téléphone dans le cadre de mon suivi.</p>
          </div>
        </label>
      </div>

      {dossier.consent_date && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Dernier consentement enregistré le {new Date(dossier.consent_date).toLocaleDateString('fr-FR')}
        </p>
      )}

      {(isDirty || justSaved) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || justSaved}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
              justSaved ? 'bg-green-600' : 'bg-red-500 animate-pulse-soft'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
             : justSaved ? <Check className="w-4 h-4 mr-2" />
             : <Save className="w-4 h-4 mr-2" />}
            {justSaved ? 'Mis à jour !' : 'Mettre à jour'}
          </button>
        </div>
      )}
    </div>
  )
}
