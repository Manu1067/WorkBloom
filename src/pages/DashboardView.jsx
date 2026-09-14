import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function DashboardView({ user, navigate, onUserUpdate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await features.dashboard(user.id)
      setData(res)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [user.id])

  const handleRsvp = async (eventId, eventTitle) => {
    try {
      const res = await features.rsvpEvent(eventId)
      if (res.success) {
        addToast(
          res.event.isRegistered
            ? `Registered for "${eventTitle}"! 🌸`
            : `RSVP cancelled for "${eventTitle}".`
        )
        loadDashboard()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleMoodCheck = async (mood) => {
    try {
      const res = await features.recordMood(user.id, { mood })
      if (res.success) {
        addToast(`Recorded mood: ${mood} · Stress ${res.stress}/10 · Energy ${res.energy}/10`)
        loadDashboard()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (loading && !data) {
    return (
      <div className="content">
        <div className="loading-grid">
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="content">
        <div className="alert">{error}</div>
        <button className="button button-quiet" onClick={loadDashboard}>Retry</button>
      </div>
    )
  }

  const moodScore = Math.round(((data?.latestEnergyLevel || 7) / 10) * 100)
  const events = data?.upcomingEvents || []

  return (
    <div className="content page-shell">
      <div className="dashboard-grid">
        <section className="card hero-card">
          <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))' }}>
            Welcome home · {data?.department || 'WorkBloom'}
          </p>
          <h1>Hello, {data?.fullName?.split(' ')[0] || 'Friend'}.</h1>
          <p className="subtitle">
            Take a slow breath. Your workday is a space for steady focus, mutual appreciation, and mindful pacing.
          </p>
          <div className="hero-meta">
            <span>✨ {data?.recognitionReceivedCount || 0} recognitions</span>
            <span>·</span>
            <span>🌿 {data?.clubs?.activeMembershipCount || 0} active circles</span>
            <span>·</span>
            <span>🌱 {data?.impact?.hoursContributed || 0} hrs impact contributed</span>
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="button button-primary" onClick={() => navigate('/wellness')}>
              Daily rhythm check-in
            </button>
            <button className="button button-quiet" onClick={() => navigate('/recognition')}>
              Celebrate a colleague
            </button>
          </div>
        </section>

        <section className="card daily-card">
          <p className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>Quiet prompt</p>
          <h3>One intentional pause.</h3>
          <p>
            “Protecting your energy today creates the space to do meaningful, compassionate work tomorrow.”
          </p>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'hsl(43 28% 85%)', marginBottom: 8 }}>Quick mood log:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Steady', 'Bright', 'Tired', 'Full'].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMoodCheck(m)}
                  className="button button-quiet"
                  style={{
                    padding: '4px 9px',
                    fontSize: 11,
                    background: data?.latestMood === m ? 'hsl(var(--gold))' : 'hsl(var(--paper) / 0.15)',
                    color: data?.latestMood === m ? 'hsl(var(--ink))' : 'hsl(43 46% 96%)',
                    borderColor: 'hsl(var(--gold) / 0.3)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11 }}>
              <button
                type="button"
                className="text-link"
                style={{ color: 'hsl(var(--gold))', fontSize: 11 }}
                onClick={() => navigate('/travel')}
              >
                🗺️ Find restorative havens matched to your mood →
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="section-grid">
        <section className="card card-pad">
          <div className="card-header">
            <div>
              <h2 className="card-title">Gatherings & pauses</h2>
              <p className="card-caption">Upcoming spaces to breathe, learn, and reconnect</p>
            </div>
            <button className="text-link" onClick={() => navigate('/events')}>
              All events →
            </button>
          </div>

          <div className="event-list">
            {events.slice(0, 3).map((event) => {
              const isRegistered = event.attendees?.includes(user.id)
              const d = new Date(event.startDate)
              const day = d.getDate()
              const month = d.toLocaleString('en-US', { month: 'short' })

              return (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <strong>{day}</strong>
                    <span>{month}</span>
                  </div>
                  <div>
                    <h3 className="event-name">{event.title}</h3>
                    <p className="event-info">{event.location} · {event.eventType}</p>
                  </div>
                  <button
                    className={`button ${isRegistered ? 'button-quiet' : 'button-primary'}`}
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => handleRsvp(event.id, event.title)}
                  >
                    {isRegistered ? 'Registered ✓' : 'RSVP'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card card-pad">
          <div className="card-header">
            <div>
              <h2 className="card-title">Wellbeing rhythm</h2>
              <p className="card-caption">Personal balance based on your check-ins</p>
            </div>
            <button className="text-link" onClick={() => navigate('/wellness')}>
              Sanctuary →
            </button>
          </div>

          <div className="mood-wrap">
            <div className="mood-ring">
              <strong>{moodScore}%</strong>
            </div>
            <div className="mood-copy">
              <strong>{data?.latestMood || 'Steady'} State</strong>
              <span>
                Energy is at {data?.latestEnergyLevel || 8}/10 with mild stress ({data?.latestStressLevel || 3}/10).
              </span>
            </div>
          </div>

          <div className="bar-list">
            <div className="bar-line">
              <span>Energy</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(data?.latestEnergyLevel || 8) * 10}%` }} />
              </div>
              <b>{data?.latestEnergyLevel || 8}/10</b>
            </div>
            <div className="bar-line">
              <span>Stress</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(data?.latestStressLevel || 3) * 10}%`,
                    background: 'hsl(var(--coral))',
                  }}
                />
              </div>
              <b>{data?.latestStressLevel || 3}/10</b>
            </div>
          </div>
        </section>
      </div>

      <div className="lower-grid">
        <div className="card card-pad mini-card">
          <div className="mini-icon sage">🤝</div>
          <h3 style={{ fontSize: 16 }}>Wellbeing buddy</h3>
          {data?.buddy?.activeBuddy ? (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12 }}>
                Paired with <strong>{data.buddy.activeBuddy.fullName}</strong> ({data.buddy.activeBuddy.department})
              </p>
              <button
                className="button button-quiet"
                style={{ fontSize: 11, padding: '5px 10px' }}
                onClick={() => navigate('/chat')}
              >
                Send gentle ping
              </button>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12 }}>
                You have {data?.buddy?.pendingRequestCount || 0} buddy invitations.
              </p>
              <button
                className="button button-primary"
                style={{ fontSize: 11, padding: '5px 10px' }}
                onClick={() => navigate('/buddy')}
              >
                Find a buddy
              </button>
            </div>
          )}
        </div>

        <div className="card card-pad mini-card">
          <div className="mini-icon gold">📖</div>
          <h3 style={{ fontSize: 16 }}>Gentle learning</h3>
          <p style={{ margin: '0 0 8px', fontSize: 12 }}>
            {data?.learning?.inProgressCount || 0} in progress · {data?.learning?.completedCount || 0} completed
          </p>
          <button
            className="button button-quiet"
            style={{ fontSize: 11, padding: '5px 10px' }}
            onClick={() => navigate('/learning')}
          >
            Continue learning
          </button>
        </div>

        <div className="card card-pad mini-card">
          <div className="mini-icon coral">🌸</div>
          <h3 style={{ fontSize: 16 }}>Peer appreciation</h3>
          <p style={{ margin: '0 0 8px', fontSize: 12 }}>
            {data?.recognitionReceivedCount || 0} appreciation notes received
          </p>
          <button
            className="button button-quiet"
            style={{ fontSize: 11, padding: '5px 10px' }}
            onClick={() => navigate('/recognition')}
          >
            View appreciation wall
          </button>
        </div>
      </div>
    </div>
  )
}
