import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import { wellnessApi } from '../api/wellnessApi'
import { eventApi } from '../api/eventApi'
import { getEmployeeId } from '../api/apiClient'
import { useToast } from '../components/ToastContext'
import { PageHero } from '../components/PageHero'

export function DashboardView({ user, navigate, onUserUpdate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [moodSaving, setMoodSaving] = useState(false)
  const addToast = useToast()

  const empId = user?.id || user?.employeeId || getEmployeeId()

  const loadDashboard = async () => {
    if (!empId) {
      setError('Employee identifier missing. Please sign in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await dashboardApi.getEmployeeDashboard(empId)
      setData(res)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load dashboard data from backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [empId])

  const handleRsvp = async (eventId, eventTitle) => {
    try {
      await eventApi.register(eventId, { employeeId: empId })
      addToast(`Registered for "${eventTitle}"! 🌸`)
      loadDashboard()
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      addToast(err.message || 'RSVP failed', 'error')
    }
  }

  const handleQuickMoodCheck = async (mood) => {
    try {
      setMoodSaving(true)
      await wellnessApi.recordMood(empId, { mood, note: 'Quick dashboard check-in' })
      addToast(`Recorded mood: ${mood} 🌿`)
      await loadDashboard()
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      addToast(err.message || 'Could not save mood', 'error')
    } finally {
      setMoodSaving(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="content page-shell">
        <div className="loading-grid" style={{ display: 'grid', gap: 20 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="content page-shell">
        <div className="alert" style={{ background: 'hsl(var(--coral-soft) / 0.4)', padding: 18, borderRadius: 12, border: '1px solid hsl(var(--coral))' }}>
          <strong>Dashboard Connection Issue</strong>
          <p style={{ margin: '4px 0 12px', fontSize: 13 }}>{error}</p>
          <button className="button button-quiet" onClick={loadDashboard}>Retry Connection</button>
        </div>
      </div>
    )
  }

  const firstName = data?.fullName ? data.fullName.split(' ')[0] : (user?.fullName?.split(' ')[0] || 'Friend')
  const events = data?.upcomingEvents || []
  const notifications = data?.unreadNotifications || []

  return (
    <div className="content page-shell">
      <PageHero page="dashboard" />
      {/* Hero Welcome Card: Emotional Home */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <section className="card hero-card" style={{ padding: 28, background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sage-soft) / 0.3))' }}>
          <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
            Make Work Feel Like Home · {data?.department || user?.department || 'WorkBloom'}
          </p>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Hello, {firstName}.</h1>
          <p className="subtitle" style={{ maxWidth: 620, color: 'hsl(var(--ink) / 0.85)', lineHeight: 1.6 }}>
            Welcome to your personal sanctuary. WorkBloom is designed for steady focus, mutual appreciation, and mindful pacing.
          </p>

          <div className="hero-meta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 16, fontSize: 13, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
            <span>✨ {data?.recognitionReceivedCount ?? 0} recognitions received</span>
            <span>·</span>
            <span>💬 {data?.communityPostCount ?? 0} community posts</span>
            <span>·</span>
            <span>🔔 {data?.unreadNotificationCount ?? 0} unread updates</span>
          </div>

          <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="button button-primary" onClick={() => navigate('/wellness')}>
              Daily rhythm check-in
            </button>
            <button className="button button-quiet" onClick={() => navigate('/travel')}>
              🗺️ Find travel havens
            </button>
            <button className="button button-quiet" onClick={() => navigate('/recognition')}>
              Celebrate a colleague
            </button>
          </div>
        </section>

        {/* Quiet Prompt / Mood Check-in */}
        <section className="card daily-card" style={{ padding: 24, background: 'hsl(var(--paper-warm))', border: '1px solid hsl(var(--gold) / 0.3)' }}>
          <p className="eyebrow" style={{ color: 'hsl(var(--gold))', fontWeight: 700 }}>Mindful pause</p>
          <h3 style={{ fontSize: 18, marginTop: 4 }}>How are you feeling right now?</h3>
          <p style={{ fontSize: 12, color: 'hsl(var(--muted))', lineHeight: 1.4, margin: '4px 0 14px' }}>
            “Protecting your energy today creates the space for meaningful, compassionate work tomorrow.”
          </p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {['Steady', 'Bright', 'Tired', 'Full'].map((m) => (
              <button
                key={m}
                disabled={moodSaving}
                onClick={() => handleQuickMoodCheck(m)}
                className="button button-quiet"
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  background: data?.latestMood === m ? 'hsl(var(--sage-dark))' : 'hsl(var(--paper))',
                  color: data?.latestMood === m ? '#ffffff' : 'hsl(var(--ink))',
                  borderColor: data?.latestMood === m ? 'hsl(var(--sage-dark))' : 'hsl(var(--line))',
                  fontWeight: data?.latestMood === m ? 700 : 500,
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid hsl(var(--line) / 0.5)' }}>
            <button
              type="button"
              className="text-link"
              style={{ color: 'hsl(var(--sage-dark))', fontSize: 12, fontWeight: 600 }}
              onClick={() => navigate('/travel')}
            >
              🗺️ Explore havens matched to your state →
            </button>
          </div>
        </section>
      </div>

      {/* Main Section Grid: Events & Wellness Rhythm */}
      <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Upcoming Gatherings */}
        <section className="card card-pad">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 className="card-title" style={{ margin: 0, fontSize: 18 }}>Gatherings & pauses</h2>
              <p className="card-caption" style={{ margin: '2px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
                Upcoming spaces to breathe and reconnect
              </p>
            </div>
            <button className="text-link" style={{ fontSize: 12 }} onClick={() => navigate('/events')}>
              All events →
            </button>
          </div>

          <div className="event-list" style={{ display: 'grid', gap: 12 }}>
            {events.length === 0 ? (
              <div className="empty-state" style={{ padding: 20, textAlign: 'center', color: 'hsl(var(--muted))', fontSize: 13 }}>
                No upcoming events scheduled right now.
              </div>
            ) : (
              events.slice(0, 3).map((evt) => {
                const d = evt.startDate ? new Date(evt.startDate) : null
                const day = d ? d.getDate() : '--'
                const month = d ? d.toLocaleString('en-US', { month: 'short' }) : ''

                return (
                  <div key={evt.id || evt.title} className="event-item" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 10, background: 'hsl(var(--canvas) / 0.5)', border: '1px solid hsl(var(--line) / 0.6)' }}>
                    <div className="event-date" style={{ textAlign: 'center', background: 'hsl(var(--sage-soft))', padding: '6px 12px', borderRadius: 8, color: 'hsl(var(--sage-dark))' }}>
                      <strong style={{ display: 'block', fontSize: 16 }}>{day}</strong>
                      <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{month}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="event-name" style={{ margin: 0, fontSize: 14 }}>{evt.title}</h3>
                      <p className="event-info" style={{ margin: '2px 0 0', fontSize: 11, color: 'hsl(var(--muted))' }}>
                        {evt.location || 'Online'} · {evt.eventType || 'Workshop'}
                      </p>
                    </div>
                    <button
                      className="button button-primary"
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      onClick={() => handleRsvp(evt.id, evt.title)}
                    >
                      RSVP
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Wellbeing Snapshot */}
        <section className="card card-pad">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 className="card-title" style={{ margin: 0, fontSize: 18 }}>Wellbeing rhythm</h2>
              <p className="card-caption" style={{ margin: '2px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
                Latest status from backend check-ins
              </p>
            </div>
            <button className="text-link" style={{ fontSize: 12 }} onClick={() => navigate('/wellness')}>
              Sanctuary →
            </button>
          </div>

          <div className="mood-wrap" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, padding: 14, borderRadius: 12, background: 'hsl(var(--paper-warm))' }}>
            <div className="mood-ring" style={{ width: 56, height: 56, borderRadius: '50%', background: 'hsl(var(--sage-dark))', color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: 20 }}>
              🌿
            </div>
            <div className="mood-copy">
              <strong style={{ display: 'block', fontSize: 16 }}>{data?.latestMood || 'Steady'} State</strong>
              <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                Energy: {data?.latestEnergyLevel ?? '--'}/10 · Stress: {data?.latestStressLevel ?? '--'}/10
              </span>
            </div>
          </div>

          <div className="bar-list" style={{ display: 'grid', gap: 12 }}>
            <div className="bar-line" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ width: 60, color: 'hsl(var(--muted))' }}>Energy</span>
              <div className="bar-track" style={{ flex: 1, height: 8, background: 'hsl(var(--line))', borderRadius: 4, overflow: 'hidden' }}>
                <div className="bar-fill" style={{ width: `${(data?.latestEnergyLevel || 5) * 10}%`, height: '100%', background: 'hsl(var(--sage))', borderRadius: 4 }} />
              </div>
              <b style={{ width: 40, textAlign: 'right' }}>{data?.latestEnergyLevel ?? '--'}/10</b>
            </div>

            <div className="bar-line" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ width: 60, color: 'hsl(var(--muted))' }}>Stress</span>
              <div className="bar-track" style={{ flex: 1, height: 8, background: 'hsl(var(--line))', borderRadius: 4, overflow: 'hidden' }}>
                <div className="bar-fill" style={{ width: `${(data?.latestStressLevel || 3) * 10}%`, height: '100%', background: 'hsl(var(--coral))', borderRadius: 4 }} />
              </div>
              <b style={{ width: 40, textAlign: 'right' }}>{data?.latestStressLevel ?? '--'}/10</b>
            </div>
          </div>
        </section>
      </div>

      {/* Lower Notifications & Quick Actions Section */}
      <section className="card card-pad">
        <h2 className="card-title" style={{ margin: '0 0 12px', fontSize: 18 }}>Recent notifications</h2>
        {notifications.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--muted))', fontStyle: 'italic' }}>
            Your notification feed is clear and quiet. Enjoy your workday! 🌸
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id || n.title} style={{ padding: '10px 12px', borderRadius: 8, background: 'hsl(var(--canvas) / 0.4)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span>{n.title || n.message}</span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{n.type}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
