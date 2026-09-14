import { useState, useEffect } from 'react'
import { features, employees } from '../api'
import { useToast } from '../components/ToastContext'

export function RecognitionView({ user, onUserUpdate }) {
  const [recognitions, setRecognitions] = useState([])
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toId, setToId] = useState('')
  const [badge, setBadge] = useState('Calm Anchor')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const addToast = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [recs, empRes] = await Promise.all([
        features.recognitions(),
        employees.list(),
      ])
      setRecognitions(recs)
      setColleagues(empRes.employees?.filter((e) => e.id !== user.id) || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load recognition wall')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user.id])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!toId || !message.trim()) return
    try {
      setSubmitting(true)
      const res = await features.sendRecognition({
        toId: Number(toId),
        badge,
        category: badge === 'Calm Anchor' ? 'Kindness & Steer' : badge === 'Kind Guide' ? 'Mentorship' : 'Culture',
        message: message.trim(),
      })
      if (res.success) {
        addToast(`Appreciation sent to ${res.recognition.toName}! 🌸`)
        setMessage('')
        setModalOpen(false)
        loadData()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getBadgeStyle = (b) => {
    switch (b) {
      case 'Calm Anchor': return 'badge-calm'
      case 'Kind Guide': return 'badge-kind'
      case 'Cultivator': return 'badge-cultivator'
      default: return 'badge-craftsman'
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28, background: 'radial-gradient(circle at 88% 10%, hsl(var(--coral-soft)), transparent 28%), hsl(var(--paper))' }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Celebration & Gratitude</p>
        <h1>The Wall of Appreciation</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          WorkBloom thrives on the invisible acts of care: the teammate who calms a storm, the mentor who listens, and the person who brings flowers to the table.
        </p>
        <div style={{ marginTop: 20 }}>
          <button className="button button-coral" onClick={() => setModalOpen(true)}>
            🌸 Celebrate a colleague
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Appreciation card</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Celebrate a colleague</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSend}>
              <div className="field">
                <label>Colleague to appreciate</label>
                <select value={toId} onChange={(e) => setToId(e.target.value)} required>
                  <option value="">Select a colleague...</option>
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.department} · {c.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Appreciation badge</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
                  {[
                    { name: 'Calm Anchor', desc: 'Bringing steadiness and peace under pressure' },
                    { name: 'Kind Guide', desc: 'Patient mentorship and generous sharing' },
                    { name: 'Cultivator', desc: 'Making the team culture warm and vibrant' },
                    { name: 'Craftsman', desc: 'Dedicated focus on craft and quiet quality' },
                  ].map((b) => (
                    <button
                      type="button"
                      key={b.name}
                      onClick={() => setBadge(b.name)}
                      className="card"
                      style={{
                        padding: 10,
                        textAlign: 'left',
                        borderColor: badge === b.name ? 'hsl(var(--coral))' : 'hsl(var(--line))',
                        background: badge === b.name ? 'hsl(var(--coral-soft) / 0.4)' : 'hsl(var(--paper))',
                      }}
                    >
                      <strong style={{ fontSize: 13, display: 'block' }}>{b.name}</strong>
                      <span style={{ fontSize: 10, color: 'hsl(var(--muted))' }}>{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Your message of gratitude</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share specifically what they did and how it felt..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="button button-quiet" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-coral" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send appreciation 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 130 }} />
          <div className="skeleton" style={{ height: 130 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {recognitions.map((rec) => (
          <article
            key={rec.id}
            className="card card-pad"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, hsl(var(--paper)), hsl(var(--paper-warm)))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <span className={`badge-pill ${getBadgeStyle(rec.badge)}`}>
                ✨ {rec.badge}
              </span>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
              </span>
            </div>

            <p style={{ fontStyle: 'italic', fontSize: 14, lineHeight: 1.55, color: 'hsl(var(--ink))', marginBottom: 16 }}>
              “{rec.message}”
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--line) / 0.5)', paddingTop: 12 }}>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: 'hsl(var(--muted))' }}>From </span>
                <strong>{rec.fromName}</strong>
                <span style={{ color: 'hsl(var(--muted))' }}> to </span>
                <strong style={{ color: 'hsl(var(--coral))' }}>{rec.toName}</strong>
              </div>

              <div style={{ fontSize: 12, color: 'hsl(var(--coral))', fontWeight: 600 }}>
                🌸 {rec.likes || 1}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
