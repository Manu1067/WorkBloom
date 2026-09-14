import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function WellnessView({ user, navigate, onUserUpdate }) {
  const [mood, setMood] = useState(user.latestMood || 'Steady')
  const [energy, setEnergy] = useState(user.latestEnergyLevel || 8)
  const [stress, setStress] = useState(user.latestStressLevel || 3)
  const [note, setNote] = useState('')
  const [logs, setLogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [counsellingModal, setCounsellingModal] = useState(false)
  const [counsellingTopic, setCounsellingTopic] = useState('Sustainable Pacing & Boundaries')
  const addToast = useToast()

  const loadWellnessData = async () => {
    try {
      setLoading(true)
      const data = await features.wellnessHistory(user.id)
      if (data.logs) setLogs(data.logs)
      if (data.sessions) setSessions(data.sessions)
      if (data.user) {
        setMood(data.user.latestMood || 'Steady')
        setEnergy(data.user.latestEnergyLevel || 8)
        setStress(data.user.latestStressLevel || 3)
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWellnessData()
  }, [user.id])

  const handleSaveCheckIn = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await features.recordMood(user.id, { mood, energy, stress, note })
      if (res.success) {
        addToast('Your private rhythm check-in has been saved quietly. 🌿')
        setNote('')
        loadWellnessData()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleGetAiInsight = async () => {
    try {
      setAiLoading(true)
      const res = await features.aiInsight(user.id)
      setAiInsight(res)
      addToast('AI Rhythm guidance generated gently.')
    } catch (err) {
      addToast(err.message || 'AI insight service is pausing right now.', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const handleBookCounselling = async (e) => {
    e.preventDefault()
    try {
      const res = await features.bookCounselling(user.id, { topic: counsellingTopic })
      if (res.success) {
        addToast('Confidential 1-on-1 support session confirmed. 🤝')
        setCounsellingModal(false)
        loadWellnessData()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28, background: 'radial-gradient(circle at 88% 10%, hsl(var(--sage-soft) / 0.5), transparent 28%), hsl(var(--paper))' }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Personal sanctuary</p>
        <h1>Your nervous system, heard & protected</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          This space is strictly private to you. No manager or peer can view your mood history, energy levels, or confidential counselling requests.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="button button-primary"
            onClick={handleGetAiInsight}
            disabled={aiLoading}
          >
            {aiLoading ? 'Connecting with rhythm AI...' : '✨ Generate AI rhythm insight'}
          </button>
          <button
            className="button button-quiet"
            onClick={() => setCounsellingModal(true)}
          >
            Book confidential care session
          </button>
        </div>
      </div>

      {aiInsight && (
        <div
          className="card card-pad"
          style={{
            marginBottom: 28,
            borderColor: 'hsl(var(--sky) / 0.6)',
            background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sky-soft) / 0.2))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="badge-pill badge-calm">
              ✨ Personalized Rhythm Guidance ({aiInsight.source === 'n8n_ollama' ? 'n8n / Ollama' : 'Humane Fallback Mode'})
            </span>
            <button
              className="text-link"
              onClick={() => setAiInsight(null)}
              style={{ fontSize: 11 }}
            >
              Dismiss
            </button>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'hsl(var(--ink))', margin: '0 0 12px' }}>
            {aiInsight.insight}
          </p>
          {aiInsight.recommendedActivity && (
            <div style={{ fontSize: 12, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
              🌿 Recommended mindful pause: <strong>{aiInsight.recommendedActivity}</strong>
            </div>
          )}
          {navigate && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="button button-quiet"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => navigate('/travel')}
              >
                🗺️ Explore sabbatical destinations matched to your current state →
              </button>
            </div>
          )}
          {aiInsight.n8nServiceStatus && (
            <div style={{ fontSize: 10, color: 'hsl(var(--muted))', marginTop: 8 }}>
              Status: {aiInsight.n8nServiceStatus}
            </div>
          )}
        </div>
      )}

      {counsellingModal && (
        <div className="modal-backdrop" onClick={() => setCounsellingModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Confidential care</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Book 1-on-1 support session</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCounsellingModal(false)}>✕</button>
            </div>
            <p className="subtitle" style={{ marginBottom: 18 }}>
              WorkBloom Employee Care offers 4 free, completely confidential sessions per year with licensed counsellors.
            </p>
            <form onSubmit={handleBookCounselling}>
              <div className="field">
                <label>Focus or topic</label>
                <select value={counsellingTopic} onChange={(e) => setCounsellingTopic(e.target.value)}>
                  <option value="Sustainable Pacing & Boundaries">Sustainable Pacing & Boundaries</option>
                  <option value="Preventing Exhaustion & Burnout">Preventing Exhaustion & Burnout</option>
                  <option value="Navigating Team Friction or Conflict">Navigating Team Friction or Conflict</option>
                  <option value="Life Transition & Grounding">Life Transition & Grounding</option>
                </select>
              </div>
              <div className="field">
                <label>Assigned Care Specialist</label>
                <input value="Dr. Aris Thorne (Licensed Workplace Counsellor)" disabled />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="button button-quiet" onClick={() => setCounsellingModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary">Confirm confidential session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-grid" style={{ marginTop: 0, marginBottom: 28 }}>
        <div className="card card-pad">
          <h2 className="card-title">Daily rhythm check-in</h2>
          <p className="card-caption">Record your authentic state today. No judgment.</p>

          <form onSubmit={handleSaveCheckIn} style={{ marginTop: 18 }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'hsl(var(--sage-dark))', marginBottom: 8 }}>
                Current mood
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { name: 'Steady', icon: '⚓', desc: 'Anchored & calm' },
                  { name: 'Bright', icon: '☀️', desc: 'Lifted & energetic' },
                  { name: 'Tired', icon: '🌙', desc: 'Needing gentle rest' },
                  { name: 'Full', icon: '🌊', desc: 'Carrying a lot' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setMood(item.name)}
                    className="card"
                    style={{
                      padding: 10,
                      textAlign: 'center',
                      borderColor: mood === item.name ? 'hsl(var(--sage))' : 'hsl(var(--line))',
                      background: mood === item.name ? 'hsl(var(--sage-soft) / 0.5)' : 'hsl(var(--paper))',
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{item.icon}</div>
                    <strong style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{item.name}</strong>
                    <span style={{ fontSize: 9, color: 'hsl(var(--muted))' }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Vital energy level</label>
                <strong style={{ fontSize: 12 }}>{energy} / 10</strong>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Perceived stress level</label>
                <strong style={{ fontSize: 12 }}>{stress} / 10</strong>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Private reflection note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What felt restful today? What depleted you?"
                style={{ minHeight: 70 }}
              />
            </div>

            <button type="submit" className="button button-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Save check-in to private journal'}
            </button>
          </form>
        </div>

        <div className="card card-pad">
          <h2 className="card-title">Check-in history</h2>
          <p className="card-caption">Your recent reflection logs</p>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.length === 0 ? (
              <div className="empty-state">No past check-ins recorded yet.</div>
            ) : (
              logs.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'hsl(var(--canvas) / 0.5)',
                    border: '1px solid hsl(var(--line) / 0.7)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
                      {l.mood} · Energy {l.energy}/10 · Stress {l.stress}/10
                    </span>
                    <span style={{ fontSize: 10, color: 'hsl(var(--muted))' }}>
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {l.note && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'hsl(var(--ink) / 0.85)', fontStyle: 'italic' }}>
                      “{l.note}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {sessions.length > 0 && (
            <div style={{ marginTop: 24, borderTop: '1px solid hsl(var(--line))', paddingTop: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>Confidential care sessions</h3>
              {sessions.map((s) => (
                <div key={s.id} style={{ fontSize: 12, padding: 10, background: 'hsl(var(--paper-warm))', borderRadius: 10 }}>
                  <strong>{s.counsellorName}</strong> · {s.topic}
                  <div style={{ color: 'hsl(var(--sage))', fontWeight: 600, marginTop: 4 }}>
                    Status: {s.status} · {new Date(s.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
