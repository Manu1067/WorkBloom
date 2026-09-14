import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function ClubsView({ user, onUserUpdate }) {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const loadClubs = async () => {
    try {
      setLoading(true)
      const data = await features.clubs()
      setClubs(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load clubs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClubs()
  }, [])

  const handleToggle = async (clubId, title) => {
    try {
      const res = await features.toggleClub(clubId)
      if (res.success) {
        addToast(
          res.club.isMember
            ? `Joined ${title}! Welcome to the circle. 🌿`
            : `Left ${title}.`
        )
        loadClubs()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Clubs & circles</p>
        <h1>Find your people</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Side-passions, shared tea breaks, and informal hobby circles. No obligations; join whenever your energy allows.
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
        {clubs.map((club) => (
          <div key={club.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge-pill badge-kind">👥 {club.memberCount || 0} members</span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{club.frequency || 'Weekly'}</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{club.name}</h3>
              <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                {club.description}
              </p>
            </div>

            <div>
              <button
                className={`button ${club.isMember ? 'button-quiet' : 'button-primary'}`}
                style={{ width: '100%' }}
                onClick={() => handleToggle(club.id, club.name)}
              >
                {club.isMember ? 'Member ✓ (Leave circle)' : 'Join circle'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
