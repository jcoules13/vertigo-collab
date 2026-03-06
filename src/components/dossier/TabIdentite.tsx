import { useState, useEffect, useMemo } from 'react'
import { Save, Loader2, Check, Copy, AlertTriangle } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

const LIEN_OPTIONS = ['Père', 'Mère', 'Tuteur légal', 'Autre'] as const

function formatSecu(value: string): string {
  const digits = value.replace(/\s/g, '')
  if (!digits) return ''
  const parts = [digits.slice(0,1), digits.slice(1,3), digits.slice(3,5), digits.slice(5,7), digits.slice(7,10), digits.slice(10,13), digits.slice(13,15)].filter(Boolean)
  return parts.join(' ')
}

function computeAge(dateStr: string): number | null {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
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
  // Numéros administratifs
  const [numSecu, setNumSecu] = useState('')
  const [numCaf, setNumCaf] = useState('')
  const [ancienMdph, setAncienMdph] = useState('')
  // Représentant légal
  const [repNom, setRepNom] = useState('')
  const [repPrenom, setRepPrenom] = useState('')
  const [repTel, setRepTel] = useState('')
  const [repEmail, setRepEmail] = useState('')
  const [repLien, setRepLien] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setNom(dossier.usager_nom || '')
    setPrenom(dossier.usager_prenom || '')
    setDateNaissance(dossier.usager_date_naissance || '')
    setTelephone(dossier.usager_telephone || '')
    setEmail(dossier.usager_email || '')
    setAdresse(dossier.usager_adresse || '')
    setPrevNom(dossier.personne_prevenir_nom || '')
    setPrevTel(dossier.personne_prevenir_telephone || '')
    setNumSecu(formatSecu(dossier.numero_securite_sociale || ''))
    setNumCaf(dossier.numero_caf || '')
    setAncienMdph(dossier.ancien_numero_mdph || '')
    setRepNom(dossier.representant_legal_nom || '')
    setRepPrenom(dossier.representant_legal_prenom || '')
    setRepTel(dossier.representant_legal_telephone || '')
    setRepEmail(dossier.representant_legal_email || '')
    setRepLien(dossier.representant_legal_lien || '')
    setCodePostal(dossier.code_postal || '')
  }, [dossier])

  const isMinor = useMemo(() => {
    const age = computeAge(dateNaissance)
    return age !== null && age < 18
  }, [dateNaissance])

  const isDirty =
    nom !== (dossier.usager_nom || '') ||
    prenom !== (dossier.usager_prenom || '') ||
    dateNaissance !== (dossier.usager_date_naissance || '') ||
    telephone !== (dossier.usager_telephone || '') ||
    email !== (dossier.usager_email || '') ||
    adresse !== (dossier.usager_adresse || '') ||
    prevNom !== (dossier.personne_prevenir_nom || '') ||
    prevTel !== (dossier.personne_prevenir_telephone || '') ||
    numSecu !== formatSecu(dossier.numero_securite_sociale || '') ||
    numCaf !== (dossier.numero_caf || '') ||
    ancienMdph !== (dossier.ancien_numero_mdph || '') ||
    repNom !== (dossier.representant_legal_nom || '') ||
    repPrenom !== (dossier.representant_legal_prenom || '') ||
    repTel !== (dossier.representant_legal_telephone || '') ||
    repEmail !== (dossier.representant_legal_email || '') ||
    repLien !== (dossier.representant_legal_lien || '') ||
    codePostal !== (dossier.code_postal || '')

  const handleSave = async () => {
    await onSave({
      usager_nom: nom.trim(),
      usager_prenom: prenom.trim() || null,
      usager_date_naissance: dateNaissance || null,
      usager_telephone: telephone.trim() || null,
      usager_email: email.trim() || null,
      usager_adresse: adresse.trim() || null,
      personne_prevenir_nom: prevNom.trim() || null,
      personne_prevenir_telephone: prevTel.trim() || null,
      numero_securite_sociale: numSecu.replace(/\s/g, '').trim() || null,
      numero_caf: numCaf.trim() || null,
      ancien_numero_mdph: ancienMdph.trim() || null,
      representant_legal_nom: repNom.trim() || null,
      representant_legal_prenom: repPrenom.trim() || null,
      representant_legal_telephone: repTel.trim() || null,
      representant_legal_email: repEmail.trim() || null,
      representant_legal_lien: repLien.trim() || null,
      code_postal: codePostal.trim() || null,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  const copyContactToPrevenir = () => {
    setPrevNom(`${prenom} ${nom}`.trim())
    setPrevTel(telephone)
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
          <textarea value={adresse} onChange={e => setAdresse(e.target.value)} className="input" rows={2} placeholder="Adresse complète" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal</label>
          <input value={codePostal} onChange={e => setCodePostal(e.target.value)} className="input" placeholder="75001" maxLength={5} />
        </div>
      </div>

      {/* Numéros administratifs */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Numéros administratifs</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° Sécurité sociale</label>
            <input
              value={numSecu}
              onChange={e => {
                const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 15)
                const parts = [digits.slice(0,1), digits.slice(1,3), digits.slice(3,5), digits.slice(5,7), digits.slice(7,10), digits.slice(10,13), digits.slice(13,15)].filter(Boolean)
                setNumSecu(parts.join(' '))
              }}
              inputMode="numeric"
              className="input font-mono tracking-wider"
              placeholder="1 85 01 75 016 012 45"
              maxLength={22}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° CAF</label>
            <input value={numCaf} onChange={e => setNumCaf(e.target.value)} className="input" placeholder="N° allocataire" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ancien n° MDPH</label>
            <input value={ancienMdph} onChange={e => setAncienMdph(e.target.value)} className="input" placeholder="Si existant" />
          </div>
        </div>
      </div>

      {/* Détection mineur */}
      {isMinor && (
        <div className="border-t border-amber-300 dark:border-amber-600 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">Usager mineur — Représentant légal</h4>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                <input value={repPrenom} onChange={e => setRepPrenom(e.target.value)} className="input" placeholder="Prénom du représentant" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input value={repNom} onChange={e => setRepNom(e.target.value)} className="input" placeholder="Nom du représentant" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input value={repTel} onChange={e => setRepTel(e.target.value)} className="input" placeholder="06 12 34 56 78" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                <input type="email" value={repEmail} onChange={e => setRepEmail(e.target.value)} className="input" placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien de parenté</label>
                <select value={repLien} onChange={e => setRepLien(e.target.value)} className="input">
                  <option value="">— Sélectionner —</option>
                  {LIEN_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personne à prévenir */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Personne à prévenir</h4>
          {(nom || prenom || telephone) && (
            <button
              type="button"
              onClick={copyContactToPrevenir}
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <Copy className="w-3.5 h-3.5" />
              Reprendre les coordonnées du contact
            </button>
          )}
        </div>
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

      {(isDirty || justSaved) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || justSaved || !nom.trim()}
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
