import { useState, useEffect } from 'react'
import { features, employees } from '../api'
import { useToast } from '../components/ToastContext'

export function BuddyView({ user, navigate, onUserUpdate }) {
  const [status, setStatus] = useState(null)
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestNote, setRequestNote] = useState('')
  const [selectedColleague, setSelectedColleague] = useState(null)
  const addToast = useToast()

  const loadBuddyData = async () => {
    try {
      setLoading(true)
      const [bStatus, empRes] = await Promise.all([
        features.buddyStatus(),
        employees.list(),
      ])
      setStatus(bStatus)
      setColleagues(empRes.employees?.filter((e) => e.id !== user.id) || [])
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBuddyData()
  }, [user.id])

  const handleSendRequest = async (toUser) => {
    try {
      const res = await features.sendBuddyRequest({
        toEmployeeId: toUser.id,
        note: requestNote || `Hi ${toUser.fullName.split(' ')[0]}, I'd love to connect as wellbeing buddies!`,
      })
      if (res.success) {
        addToast(`Buddy invitation sent to ${toUser.fullName}! 🤝`)
        setSelectedColleague(null)
        setRequestNote('')
        loadBuddyData()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRespond = async (requestId, action, senderName) => {
    try {
      const res = await features.respondBuddyRequest(requestId, action)
      if (res.success) {
        addToast(
          action === 'accept'
            ? `You and ${senderName} are now wellbeing buddies! 🌸`
            : `Declined invitation from ${senderName}.`
        )
        loadBuddyData()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Peer support</p>
        <h1>WorkBloom Wellbeing Buddies</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Navigating work is gentler with a partner. A buddy is not your manager; they are a trusted colleague to take coffee walks with, share quiet check-ins, and keep your boundaries steady.
        </p>
      </div>

      {status?.activeBuddy && (
        <div className="card card-pad" style={{ marginBottom: 28, borderColor: 'hsl(var(--sage) / 0.7)', background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sage-soft) / 0.25))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge-pill badge-cultivator" style={{ marginBottom: 8 }}>
                Current Active Wellbeing Buddy
              </span>
              <h2 style={{ margin: '4px 0 6px', fontSize: 24 }}>{status.activeBuddy.fullName}</h2>
              <p style={{ margin: 0, color: 'hsl(var(--muted))', fontSize: 13 }}>
                {status.activeBuddy.designation} · {status.activeBuddy.department}
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(status.activeBuddy.sharedInterests || ['Mindful walking', 'Typography', 'Quiet workspaces']).map((interest) => (
                  <span key={interest} className="badge-pill badge-calm" style={{ fontSize: 11 }}>
                    🌿 {interest}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="button button-primary" onClick={() => navigate('/chat')}>
                💬 Message {status.activeBuddy.fullName.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {status?.pendingRequests?.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 28, borderColor: 'hsl(var(--gold))' }}>
          <h3 style={{ marginBottom: 12 }}>Pending Buddy Invitations</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {status.pendingRequests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'hsl(var(--canvas) / 0.5)', borderRadius: 12 }}>
                <div>
                  <strong>{req.fromName}</strong> ({req.fromDepartment})
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
                    “{req.note}”
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button button-quiet" onClick={() => handleRespond(req.id, 'decline', req.fromName)}>
                    Decline
                  </button>
                  <button className="button button-primary" onClick={() => handleRespond(req.id, 'accept', req.fromName)}>
                    Accept & Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Available Colleagues to Connect With</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {colleagues.map((colleague) => {
          const isCurrentBuddy = status?.activeBuddy?.id === colleague.id
          return (
            <div key={colleague.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{colleague.fullName}</h3>
                  <span className="badge-pill badge-calm" style={{ fontSize: 9 }}>{colleague.department}</span>
                </div>
                <p style={{ fontSize: 12, color: 'hsl(var(--muted))', margin: '0 0 12px' }}>{colleague.designation}</p>
                <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', marginBottom: 12 }}>
                  Latest mood: <strong>{colleague.latestMood || 'Steady'}</strong>
                </div>
              </div>

              {isCurrentBuddy ? (
                <span className="badge-pill badge-cultivator" style={{ alignSelf: 'flex-start' }}>
                  Connected Buddy ✓
                </span>
              ) : selectedColleague?.id === colleague.id ? (
                <div style={{ borderTop: '1px solid hsl(var(--line))', paddingTop: 10 }}>
                  <input
                    placeholder="Short personal note..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    style={{ fontSize: 11, padding: 6, width: '100%', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="button button-quiet" style={{ fontSize: 10, padding: 5 }} onClick={() => setSelectedColleague(null)}>
                      Cancel
                    </button>
                    <button className="button button-primary" style={{ fontSize: 10, padding: 5 }} onClick={() => handleSendRequest(colleague)}>
                      Send invitation
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="button button-quiet"
                  style={{ fontSize: 11, padding: '6px 12px', width: '100%' }}
                  onClick={() => setSelectedColleague(colleague)}
                >
                  Invite to be buddy
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
