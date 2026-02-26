import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, Square, Loader2, Play, Pause, CheckCircle, AlertCircle, FileText, RotateCcw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Seance, TRANSCRIPTION_STATUS_LABELS } from '../../types/database'

interface Props {
  seance: Seance
  dossierId: string
  onStatusChange: () => void
}

const MAX_DURATION = 90 * 60 // 90 minutes
const WARN_DURATION = 60 * 60 // 60 minutes

export default function AudioRecorder({ seance, dossierId, onStatusChange }: Props) {
  const [consent, setConsent] = useState(seance.consent_enregistrement)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const status = seance.transcription_status

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Poll transcription status
  useEffect(() => {
    if (status === 'transcribing' || status === 'summarizing') {
      pollRef.current = setInterval(async () => {
        const { data } = await supabase
          .from('seances')
          .select('transcription_status,transcription_brute,transcription_error,resume,actions_prevues')
          .eq('id', seance.id)
          .single()
        if (data && (data.transcription_status === 'ready' || data.transcription_status === 'error')) {
          if (pollRef.current) clearInterval(pollRef.current)
          onStatusChange()
        }
      }, 10000)
      return () => { if (pollRef.current) clearInterval(pollRef.current) }
    }
  }, [status, seance.id, onStatusChange])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleConsentChange = async (checked: boolean) => {
    setConsent(checked)
    await supabase.from('seances').update({
      consent_enregistrement: checked,
      updated_at: new Date().toISOString()
    }).eq('id', seance.id)
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000
      })

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }

      recorder.start(1000) // collect data every second
      mediaRecorderRef.current = recorder
      setRecording(true)
      setElapsed(0)
      setUploadError('')

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1
          if (next >= MAX_DURATION) {
            recorder.stop()
            setRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
          }
          return next
        })
      }, 1000)
    } catch (err: any) {
      setUploadError(err.message?.includes('Permission denied') || err.name === 'NotAllowedError'
        ? 'Acc\u00e8s au microphone refus\u00e9. V\u00e9rifiez les permissions de votre navigateur.'
        : 'Impossible d\'acc\u00e9der au microphone : ' + (err.message || err))
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const uploadAndTranscribe = useCallback(async () => {
    if (!audioBlob) return
    setUploading(true)
    setUploadError('')

    try {
      // Update status
      await supabase.from('seances').update({
        transcription_status: 'uploading',
        audio_duration_seconds: elapsed,
        updated_at: new Date().toISOString()
      }).eq('id', seance.id)

      // Upload to storage
      const filePath = `${dossierId}/${seance.id}.webm`
      const { error: uploadErr } = await supabase.storage
        .from('seance-recordings')
        .upload(filePath, audioBlob, { contentType: 'audio/webm', upsert: true })

      if (uploadErr) throw uploadErr

      // Update DB
      await supabase.from('seances').update({
        audio_path: filePath,
        transcription_status: 'transcribing',
        audio_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', seance.id)

      // Fire-and-forget webhook
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (webhookUrl) {
        fetch(`${webhookUrl}/collab-seance-transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seance_id: seance.id,
            dossier_id: dossierId,
            audio_path: filePath
          })
        }).catch(err => console.warn('[Webhook] non-blocking error:', err))
      }

      setAudioBlob(null)
      onStatusChange()
    } catch (err: any) {
      setUploadError(err.message || 'Erreur lors de l\'envoi')
      await supabase.from('seances').update({
        transcription_status: 'error',
        transcription_error: err.message || 'Upload failed',
        updated_at: new Date().toISOString()
      }).eq('id', seance.id)
    } finally {
      setUploading(false)
    }
  }, [audioBlob, elapsed, seance.id, dossierId, onStatusChange])

  const handleValidate = useCallback(async () => {
    try {
      // Delete audio from storage
      if (seance.audio_path) {
        await supabase.storage.from('seance-recordings').remove([seance.audio_path])
      }
      // Update DB
      await supabase.from('seances').update({
        transcription_status: 'validated',
        validated_at: new Date().toISOString(),
        audio_deleted_at: new Date().toISOString(),
        audio_path: null,
        updated_at: new Date().toISOString()
      }).eq('id', seance.id)
      onStatusChange()
    } catch (err: any) {
      console.error('Validation error:', err)
    }
  }, [seance.id, seance.audio_path, onStatusChange])

  const loadAudioPlayback = useCallback(async () => {
    if (!seance.audio_path || audioUrl) return
    const { data } = await supabase.storage
      .from('seance-recordings')
      .createSignedUrl(seance.audio_path, 3600)
    if (data?.signedUrl) setAudioUrl(data.signedUrl)
  }, [seance.audio_path, audioUrl])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }, [playing])

  // --- Render based on status ---

  // Already validated
  if (status === 'validated') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="badge-green"><CheckCircle className="w-3 h-3 mr-1 inline" />Transcription valid\u00e9e</span>
          {seance.audio_duration_seconds && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Dur\u00e9e : {formatTime(seance.audio_duration_seconds)}
            </span>
          )}
        </div>
        {seance.transcription_brute && (
          <div>
            <button
              onClick={() => setShowTranscription(!showTranscription)}
              className="text-xs text-primary-600 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              {showTranscription ? 'Masquer' : 'Voir'} la transcription brute
            </button>
            {showTranscription && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {seance.transcription_brute}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Transcription ready — review & validate
  if (status === 'ready') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge-green">Transcription pr\u00eate</span>
          {seance.audio_duration_seconds && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Dur\u00e9e : {formatTime(seance.audio_duration_seconds)}
            </span>
          )}
        </div>
        {/* Audio playback */}
        {seance.audio_path && (
          <div className="flex items-center gap-2">
            <button onClick={async () => { await loadAudioPlayback(); togglePlay() }} className="btn-secondary btn-sm">
              {playing ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              {playing ? 'Pause' : '\u00c9couter'}
            </button>
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
            )}
          </div>
        )}
        {/* Transcription brute */}
        {seance.transcription_brute && (
          <div>
            <button
              onClick={() => setShowTranscription(!showTranscription)}
              className="text-xs text-primary-600 hover:underline flex items-center gap-1 mb-1"
            >
              <FileText className="w-3 h-3" />
              {showTranscription ? 'Masquer' : 'Voir'} la transcription brute
            </button>
            {showTranscription && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {seance.transcription_brute}
              </div>
            )}
          </div>
        )}
        {/* Validate button */}
        <div className="flex items-center gap-2">
          <button onClick={handleValidate} className="btn-primary text-sm">
            <CheckCircle className="w-4 h-4 mr-1" /> Valider et supprimer l'audio
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            L'audio sera supprim\u00e9 d\u00e9finitivement
          </span>
        </div>
      </div>
    )
  }

  // Processing states
  if (status === 'transcribing' || status === 'summarizing' || status === 'uploading') {
    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
        <div>
          <span className="badge-blue">{TRANSCRIPTION_STATUS_LABELS[status]}</span>
          {seance.audio_duration_seconds && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dur\u00e9e de l'enregistrement : {formatTime(seance.audio_duration_seconds)}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Erreur de transcription</span>
          </div>
          {seance.transcription_error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{seance.transcription_error}</p>
          )}
        </div>
        <button
          onClick={async () => {
            await supabase.from('seances').update({
              transcription_status: 'none',
              transcription_error: null,
              updated_at: new Date().toISOString()
            }).eq('id', seance.id)
            onStatusChange()
          }}
          className="btn-secondary btn-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> R\u00e9essayer
        </button>
      </div>
    )
  }

  // Default: none — show consent + record UI
  return (
    <div className="space-y-3">
      {/* Consent checkbox */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => handleConsentChange(e.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          L'usager consent \u00e0 l'enregistrement audio de cet entretien
        </span>
      </label>

      {consent && !recording && !audioBlob && (
        <>
          {!MediaRecorder.isTypeSupported('audio/webm') ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Votre navigateur ne supporte pas l'enregistrement audio. Utilisez Chrome ou Firefox.
            </p>
          ) : (
            <button onClick={startRecording} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              <span className="w-3 h-3 bg-white rounded-full" />
              Commencer l'enregistrement
            </button>
          )}
        </>
      )}

      {/* Recording in progress */}
      {recording && (
        <div className="flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-recording" />
          <span className={`font-mono text-lg ${elapsed >= WARN_DURATION ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-900 dark:text-white'}`}>
            {formatTime(elapsed)}
          </span>
          {elapsed >= WARN_DURATION && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              Dur\u00e9e max : {formatTime(MAX_DURATION)}
            </span>
          )}
          <button onClick={stopRecording} className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
            <Square className="w-3.5 h-3.5" /> Arr\u00eater
          </button>
        </div>
      )}

      {/* Post-recording: upload prompt */}
      {audioBlob && !uploading && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Mic className="w-4 h-4" />
            Enregistrement termin\u00e9 — {formatTime(elapsed)}
          </div>
          <div className="flex gap-2">
            <button onClick={uploadAndTranscribe} className="btn-primary text-sm">
              <Loader2 className="w-4 h-4 mr-1 hidden" />
              Envoyer pour transcription
            </button>
            <button onClick={() => { setAudioBlob(null); setElapsed(0) }} className="btn-secondary text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Upload in progress */}
      {uploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-400">Envoi en cours...</span>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">
          {uploadError}
        </div>
      )}
    </div>
  )
}
