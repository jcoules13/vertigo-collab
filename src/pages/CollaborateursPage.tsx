import { useEffect, useState } from 'react'
import { Plus, Loader2, Edit2, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Collaborateur } from '../types/database'

export default function CollaborateursPage() {
  const { isAdmin } = useAuth()
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formNom, setFormNom] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formRole, setFormRole] = useState<'admin' | 'membre' | 'benevole'>('membre')
  const [formPassword, setFormPassword] = useState('')

  const fetchCollaborateurs = async () => {
    const { data } = await supabase
      .from('collaborateurs')
      .select('*')
      .order('nom', { ascending: true })
    setCollaborateurs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCollaborateurs() }, [])

  const resetForm = () => {
    setFormNom('')
    setFormPrenom('')
    setFormEmail('')
    setFormTelephone('')
    setFormRole('membre')
    setFormPassword('')
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startEdit = (c: Collaborateur) => {
    setFormNom(c.nom)
    setFormPrenom(c.prenom)
    setFormEmail(c.email)
    setFormTelephone(c.telephone || '')
    setFormRole(c.role_asso)
    setFormPassword('')
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        // Update existing collaborateur
        const { error: err } = await supabase
          .from('collaborateurs')
          .update({
            nom: formNom,
            prenom: formPrenom,
            telephone: formTelephone || null,
            role_asso: formRole,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
        if (err) throw err
      } else {
        // Create auth user first
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        const res = await fetch(`${webhookUrl}/collab-create-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formEmail,
            password: formPassword,
            nom: formNom,
            prenom: formPrenom,
            telephone: formTelephone || null,
            role_asso: formRole,
          }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Erreur lors de la création')
      }

      await fetchCollaborateurs()
      resetForm()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActif = async (c: Collaborateur) => {
    await supabase
      .from('collaborateurs')
      .update({ actif: !c.actif, updated_at: new Date().toISOString() })
      .eq('id', c.id)
    await fetchCollaborateurs()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collaborateurs</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <input type="text" value={formPrenom} onChange={e => setFormPrenom(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input type="text" value={formNom} onChange={e => setFormNom(e.target.value)} className="input" required />
                </div>
              </div>

              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe initial</label>
                    <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="input" minLength={6} required />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input type="tel" value={formTelephone} onChange={e => setFormTelephone(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value as any)} className="input">
                    <option value="membre">Membre</option>
                    <option value="benevole">Bénévole</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                {isAdmin && <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {collaborateurs.map(c => (
                <tr key={c.id} className={!c.actif ? 'opacity-50' : ''}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {c.prenom[0]}{c.nom[0]}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{c.prenom} {c.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.email}</td>
                  <td className="px-6 py-4">
                    {c.role_asso === 'admin' && <span className="badge-teal">Admin</span>}
                    {c.role_asso === 'membre' && <span className="badge-gray">Membre</span>}
                    {c.role_asso === 'benevole' && <span className="badge-green">Bénévole</span>}
                  </td>
                  <td className="px-6 py-4">
                    {c.actif ? <span className="badge-green">Actif</span> : <span className="badge-red">Inactif</span>}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEdit(c)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Modifier">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => toggleActif(c)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title={c.actif ? 'Désactiver' : 'Activer'}>
                        {c.actif ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
