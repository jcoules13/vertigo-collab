import { useState, useEffect } from 'react'
import { Save, Loader2, ShieldCheck } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

export default function TabConsentement({ dossier, onSave, saving }: Props) {
  const [conservation, setConservation] = useState(false)
  const [contact, setContact] = useState(false)

  useEffect(() => {
    setConservation(dossier.consent_conservation || false)
    setContact(dossier.consent_contact || false)
  }, [dossier])

  const handleSave = () => {
    const now = new Date().toISOString()
    onSave({
      consent_conservation: conservation,
      consent_contact: contact,
      consent_date: (conservation || contact) ? now : null,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">2. Consentement RGPD</h3>

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

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}
