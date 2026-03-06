import { useState, useEffect } from 'react'
import { Check, Save, FileText, Loader2 } from 'lucide-react'
import type { MdphFormulaire, MdphADocuments, MdphASignature, MdphStatut } from '../../types/mdph'
import { generateMdphPdf, downloadPdf } from '../../lib/mdph-pdf'

interface Props {
  formulaire: MdphFormulaire
  onSave: (updates: Partial<MdphFormulaire>) => Promise<void>
  saving: boolean
}

const CheckItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 py-1">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300" />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </label>
)

export default function MdphTabRecap({ formulaire, onSave, saving }: Props) {
  const [docs, setDocs] = useState<MdphADocuments>(formulaire.section_a_documents)
  const [sig, setSig] = useState<MdphASignature>(formulaire.section_a_signature)
  const [statut, setStatut] = useState<MdphStatut>(formulaire.statut)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setDocs(formulaire.section_a_documents)
    setSig(formulaire.section_a_signature)
    setStatut(formulaire.statut)
  }, [formulaire])

  const isDirty = JSON.stringify(docs) !== JSON.stringify(formulaire.section_a_documents) ||
    JSON.stringify(sig) !== JSON.stringify(formulaire.section_a_signature) ||
    statut !== formulaire.statut

  const handleSave = async () => {
    await onSave({
      section_a_documents: docs,
      section_a_signature: sig,
      statut,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const [generating, setGenerating] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const handleGeneratePdf = async () => {
    setGenerating(true)
    setPdfError('')
    try {
      const bytes = await generateMdphPdf(formulaire)
      const filename = `MDPH_${formulaire.usager_nom}_${formulaire.usager_prenom || ''}_${new Date().toISOString().slice(0, 10)}.pdf`
      downloadPdf(bytes, filename)
    } catch (err: any) {
      setPdfError(err.message || 'Erreur lors de la generation du PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Statut */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut du formulaire</h2>
        <div className="flex flex-wrap gap-3">
          {(['brouillon', 'en_cours', 'a_relire', 'pret', 'envoye'] as MdphStatut[]).map(s => (
            <label key={s} className="flex items-center gap-2">
              <input type="radio" name="statut" checked={statut === s}
                onChange={() => setStatut(s)} className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {s === 'brouillon' ? 'Brouillon' : s === 'en_cours' ? 'En cours' : s === 'a_relire' ? 'A relire' : s === 'pret' ? 'Pret' : 'Envoye'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents obligatoires</h2>

        <div className="space-y-1 mb-4">
          <CheckItem label="Certificat medical (moins de 6 mois)" checked={docs.certificat_medical} onChange={v => setDocs(d => ({ ...d, certificat_medical: v }))} />
          <CheckItem label="Justificatif d'identite" checked={docs.justificatif_identite} onChange={v => setDocs(d => ({ ...d, justificatif_identite: v }))} />
          <CheckItem label="Justificatif de domicile" checked={docs.justificatif_domicile} onChange={v => setDocs(d => ({ ...d, justificatif_domicile: v }))} />
          <CheckItem label="Jugement de protection (si applicable)" checked={docs.jugement_protection} onChange={v => setDocs(d => ({ ...d, jugement_protection: v }))} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <CheckItem label="Difficulte a obtenir le certificat medical" checked={docs.difficulte_certificat} onChange={v => setDocs(d => ({ ...d, difficulte_certificat: v }))} />
          {docs.difficulte_certificat && (
            <textarea value={docs.difficulte_certificat_detail} onChange={e => setDocs(d => ({ ...d, difficulte_certificat_detail: e.target.value }))} rows={2}
              placeholder="Preciser la difficulte..."
              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          )}
        </div>

        {/* Compteur documents */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Documents fournis : <span className="font-semibold text-gray-900 dark:text-white">
              {[docs.certificat_medical, docs.justificatif_identite, docs.justificatif_domicile, docs.jugement_protection].filter(Boolean).length}
            </span> / 4
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Signature</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de signature</label>
            <input type="date" value={sig.date_signature} onChange={e => setSig(d => ({ ...d, date_signature: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Signataire</label>
          <div className="flex flex-wrap gap-3">
            {([
              ['personne_concernee', 'Personne concernee'],
              ['representant_legal', 'Representant legal'],
              ['deux_parents', 'Les deux parents'],
            ] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="signataire" checked={sig.signataire === val}
                  onChange={() => setSig(d => ({ ...d, signataire: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accepte l'echange entre professionnels ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="accepte_echange" checked={sig.accepte_echange_professionnels === val}
                  onChange={() => setSig(d => ({ ...d, accepte_echange_professionnels: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <CheckItem label="Je certifie sur l'honneur l'exactitude des renseignements" checked={sig.certification_honneur} onChange={v => setSig(d => ({ ...d, certification_honneur: v }))} />
          <CheckItem label="Procedure simplifiee (renouvellement a l'identique)" checked={sig.procedure_simplifiee} onChange={v => setSig(d => ({ ...d, procedure_simplifiee: v }))} />
        </div>
      </div>

      {/* Generation PDF */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generation du document</h2>

        {formulaire.pdf_generated_at && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Dernier PDF genere le : {new Date(formulaire.pdf_generated_at).toLocaleString('fr-FR')}
          </p>
        )}

        <button onClick={handleGeneratePdf} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {generating ? 'Generation en cours...' : 'Generer et telecharger le PDF'}
        </button>

        {pdfError && (
          <p className="mt-2 text-sm text-red-500">{pdfError}</p>
        )}
      </div>

      {/* Save */}
      {(isDirty || justSaved) && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${justSaved ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'} disabled:opacity-50`}>
            {justSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {justSaved ? 'Enregistre' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
