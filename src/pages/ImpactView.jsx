import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function ImpactView({ user, onUserUpdate }) {
  const [impactEvents, setImpactEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const loadImpact = async () => {
    try {
      setLoading(true)
      const data = await features.impact()
      setImpactEvents(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load impact opportunities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImpact()
  }, [])

  const handleVolunteer = async (eventId, title) => {
    try {
      const res = await features.volunteerImpact(eventId)
      if (res.success) {
        addToast(
          res.event.isRegistered
            ? `Signed up to volunteer for "${title}"! 💚`
            : `Withdrew from "${title}".`
        )
        loadImpact()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Community impact</p>
        <h1>Leave something better</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          WorkBloom gives every employee 2 paid volunteer days each quarter. Find a cause that speaks to your heart and lend a hand.
        </p>
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 160 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {impactEvents.map((evt) => {
          const spotsLeft = (evt.capacity || 15) - (evt.volunteersCount || 0)
          return (
            <div key={evt.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge-pill badge-cultivator">🌱 {evt.cause || 'Community'}</span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{evt.hours || 3} volunteer hrs</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{evt.title}</h3>
                <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {evt.description}
                </p>
                <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', marginBottom: 12 }}>
                  📅 {new Date(evt.date).toLocaleDateString()} · 👥 {evt.volunteersCount || 0} registered ({spotsLeft > 0 ? `${spotsLeft} spots open` : 'Full'})
                </div>
              </div>

              <div>
                <button
                  className={`button ${evt.isRegistered ? 'button-quiet' : 'button-primary'}`}
                  style={{ width: '100%' }}
                  onClick={() => handleVolunteer(evt.id, evt.title)}
                >
                  {evt.isRegistered ? 'Registered Volunteer ✓ (Withdraw)' : 'Sign up to volunteer'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
