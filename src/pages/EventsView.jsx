import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function EventsView({ user, onUserUpdate }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('All')
  const [createModal, setCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const [newType, setNewType] = useState('Wellness')
  const [newDesc, setNewDesc] = useState('')
  const [newCap, setNewCap] = useState(25)
  const addToast = useToast()

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await features.events()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleRsvp = async (eventId, eventTitle) => {
    try {
      const res = await features.rsvpEvent(eventId)
      if (res.success) {
        addToast(
          res.event.isRegistered
            ? `You are registered for "${eventTitle}"! 🌸`
            : `RSVP cancelled for "${eventTitle}".`
        )
        loadEvents()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      const res = await features.createEvent({
        title: newTitle,
        location: newLoc,
        eventType: newType,
        description: newDesc,
        capacity: newCap,
      })
      addToast(`New event "${res.title}" published!`)
      setCreateModal(false)
      setNewTitle('')
      setNewLoc('')
      setNewDesc('')
      loadEvents()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const filtered = filterType === 'All'
    ? events
    : events.filter((e) => e.eventType?.toLowerCase() === filterType.toLowerCase())

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN'

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>On the calendar</p>
        <h1>Good things, together</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Invitations into restorative shared time: nervous-system resets, lunchtime walks, ergonomics clinics, and craft workshops.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={() => setCreateModal(true)}>
              + Schedule new gathering (HR/Admin)
            </button>
          )}
        </div>
      </div>

      {createModal && (
        <div className="card card-pad" style={{ marginBottom: 28 }}>
          <h3>Schedule an official company gathering</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="field">
              <label>Event title</label>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Location or link</label>
              <input value={newLoc} onChange={(e) => setNewLoc(e.target.value)} required />
            </div>
            <div className="field">
              <label>Event type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="Wellness">Wellness</option>
                <option value="Learning">Learning</option>
                <option value="Community">Community</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required />
            </div>
            <div className="field">
              <label>Capacity</label>
              <input type="number" min="5" max="100" value={newCap} onChange={(e) => setNewCap(Number(e.target.value))} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="button button-quiet" onClick={() => setCreateModal(false)}>Cancel</button>
              <button type="submit" className="button button-primary">Publish gathering</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['All', 'Wellness', 'Learning', 'Community', 'Health'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`button ${filterType === type ? 'button-primary' : 'button-quiet'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            {type}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 140 }} />
          <div className="skeleton" style={{ height: 140 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((event) => {
          const d = new Date(event.startDate)
          const day = d.getDate()
          const month = d.toLocaleString('en-US', { month: 'short' })
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const spotsLeft = (event.capacity || 30) - (event.attendeeCount || 0)

          return (
            <div
              key={event.id}
              className="card card-pad"
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr auto',
                gap: 20,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  background: 'hsl(var(--coral-soft))',
                  borderRadius: 14,
                  padding: '12px 6px',
                  color: 'hsl(var(--coral))',
                }}
              >
                <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1 }}>
                  {day}
                </strong>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                  {month}
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>{event.eventType}</span>
                  <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>{time} · {event.location}</span>
                </div>
                <h3 style={{ margin: '2px 0 6px', fontSize: 18 }}>{event.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.45 }}>
                  {event.description}
                </p>
                <div style={{ marginTop: 8, fontSize: 11, color: 'hsl(var(--sage))', fontWeight: 600 }}>
                  👥 {event.attendeeCount || 0} attending · {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Full capacity'}
                </div>
              </div>

              <div>
                <button
                  className={`button ${event.isRegistered ? 'button-quiet' : 'button-primary'}`}
                  onClick={() => handleRsvp(event.id, event.title)}
                >
                  {event.isRegistered ? 'Registered ✓ (Cancel)' : 'RSVP'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
