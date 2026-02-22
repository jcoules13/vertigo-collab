import { useState } from 'react'
import { User, Save, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function ProfilPage() {
  const { collaborateur, refreshCollaborateur } = useAuth()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [nom, setNom] = useState(collaborateur?.nom || '')
  const [prenom, setPrenom] = useState(collaborateur?.prenom || '')
  const [telephone, setTelephone] = useState(collaborateur?.telephone || '')

  const [newPassword, setNewPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collaborateur) return
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: err } = await supabase
      .from('collaborateurs')
      .update({ nom, prenom, telephone: telephone || null, updated_at: new Date().toISOString() })
      .eq('id', collaborateur.id)

    if (err) {
      setError(err.message)
    } else {
      setSuccess('Profil mis à jour.')
      await refreshCollaborateur()
    }
    setSaving(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) {
      setPasswordError(err.message)
    } else {
      setPasswordSuccess('Mot de passe modifié.')
      setNewPassword('')
    }
    setChangingPassword(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon profil</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Informations personnelles
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSave} className="space-y-4">
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">{success}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="input" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={collaborateur?.email || ''} className="input bg-gray-100 dark:bg-gray-700" disabled />
              <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="input" placeholder="06 12 34 56 78" />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5" /> Changer le mot de passe
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{passwordError}</div>}
            {passwordSuccess && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">{passwordSuccess}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" minLength={6} required />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={changingPassword} className="btn-secondary">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Modifier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
