import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

export default function TabIdentite({ dossier, onSave, saving }: Props) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [prevNom, setPrevNom] = useState('')
  const [prevTel, setPrevTel] = useState('')

  useEffect(() => {
    setNom(dossier.usager_nom || '')
    setPrenom(dossier.usager_prenom || '')
    setDateNaissance(dossier.usager_date_naissance || '')
    setTelephone(dossier.usager_telephone || '')
    setEmail(dossier.usager_email || '')
    setAdresse(dossier.usager_adresse || '')
    setPrevNom(dossier.personne_prevenir_nom || '')
    setPrevTel(dossier.personne_prevenir_telephone || '')
  }, [dossier])

  const isDirty =
    nom !== (dossier.usager_nom || '') ||
    prenom !== (dossier.usager_prenom || '') ||
    dateNaissance !== (dossier.usager_date_naissance || '') ||
    telephone !== (dossier.usager_telephone || '') ||
    email !== (dossier.usager_email || '') ||
    adresse !== (dossier.usager_adresse || '') ||
    prevNom !== (dossier.personne_prevenir_nom || '') ||
    prevTel !== (dossier.personne_prevenir_telephone || '')

  const handleSave = () => {
    onSave({
      usager_nom: nom.trim(),
      usager_prenom: prenom.trim() || null,
      usager_date_naissance: dateNaissance || null,
      usager_telephone: telephone.trim() || null,
      usager_email: email.trim() || null,
      usager_adresse: adresse.trim() || null,
      personne_prevenir_nom: prevNom.trim() || null,
      personne_prevenir_telephone: prevTel.trim() || null,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">1. Identité & coordonnées</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
          <input value={prenom} onChange={e => setPrenom(e.target.value)} className="input" placeholder="Prénom" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
          <input value={nom} onChange={e => setNom(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance</label>
          <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
          <input value={telephone} onChange={e => setTelephone(e.target.value)} className="input" placeholder="06 12 34 56 78" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="email@exemple.com" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
        <textarea value={adresse} onChange={e => setAdresse(e.target.value)} className="input" rows={2} placeholder="Adresse complète" />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Personne à prévenir</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input value={prevNom} onChange={e => setPrevNom(e.target.value)} className="input" placeholder="Nom de la personne" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
            <input value={prevTel} onChange={e => setPrevTel(e.target.value)} className="input" placeholder="Téléphone" />
          </div>
        </div>
      </div>

      {isDirty && (
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving || !nom.trim()} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Mettre à jour
          </button>
        </div>
      )}
    </div>
  )
}
