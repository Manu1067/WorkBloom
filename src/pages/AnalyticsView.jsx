import { useState, useEffect } from 'react'
import { features, auth } from '../api'
import { useToast } from '../components/ToastContext'

export function AnalyticsView({ user, onRoleSwitch }) {
  const [tab, setTab] = useState('personal')
  const [personalData, setPersonalData] = useState(null)
  const [companyData, setCompanyData] = useState(null)
  const [companyError, setCompanyError] = useState(null)
  const [loading, setLoading] = useState(true)
  const addToast = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const p = await features.personalAnalytics(user.id)
      setPersonalData(p)

      try {
        const c = await features.companyAnalytics()
        setCompanyData(c)
        setCompanyError(null)
      } catch (err) {
        setCompanyData(null)
        setCompanyError(err.message || 'Access Denied: 403 Forbidden')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user.id, user.role])

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN'

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Insights & rhythms</p>
        <h1>Wellbeing & Pacing Analytics</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Tracking human health, sustainable rest, and collective momentum across WorkBloom.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          className={`button ${tab === 'personal' ? 'button-primary' : 'button-quiet'}`}
          onClick={() => setTab('personal')}
        >
          My Personal Rhythm
        </button>
        <button
          className={`button ${tab === 'company' ? 'button-primary' : 'button-quiet'}`}
          onClick={() => setTab('company')}
        >
          Company-wide Wellbeing {isHrOrAdmin ? '✓ (HR)' : '🔒 (Role-Gated)'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 180 }} />
        </div>
      )}

      {tab === 'personal' && personalData && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="stats-row">
            <div className="card stat-block">
              <strong>{personalData.moodCheckInCount || 12}</strong>
              <span>Check-ins logged</span>
            </div>
            <div className="card stat-block">
              <strong>{personalData.volunteerHours || 4}h</strong>
              <span>Impact contributed</span>
            </div>
            <div className="card stat-block">
              <strong>{personalData.recognitionsReceived || 14}</strong>
              <span>Appreciations received</span>
            </div>
          </div>

          <div className="card card-pad">
            <h2 className="card-title">Weekly Energy & Stress Balance</h2>
            <p className="card-caption">7-day retrospective</p>
            <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
              {(personalData.weeklyRhythm || [
                { day: 'Mon', energy: 8, stress: 3 },
                { day: 'Tue', energy: 7, stress: 4 },
                { day: 'Wed', energy: 9, stress: 2 },
                { day: 'Thu', energy: 8, stress: 3 },
                { day: 'Fri', energy: 8, stress: 2 },
              ]).map((r) => (
                <div key={r.day} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: 12, alignItems: 'center', fontSize: 12 }}>
                  <strong>{r.day}</strong>
                  <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', background: 'hsl(var(--paper-deep))' }}>
                    <div style={{ width: `${r.energy * 10}%`, background: 'hsl(var(--sage))' }} title="Energy" />
                  </div>
                  <span style={{ color: 'hsl(var(--muted))' }}>{r.energy}/10 energy</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'company' && (
        <div>
          {companyError ? (
            <div className="card card-pad" style={{ borderColor: 'hsl(var(--coral) / 0.5)', background: 'hsl(var(--coral-soft) / 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'hsl(var(--coral))', marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <h3 style={{ margin: 0 }}>Access Denied (403 Forbidden)</h3>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--ink))' }}>
                {companyError}
              </p>
              <p style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                Your current account role is <strong className="role-badge role-employee">{user.role}</strong>. WorkBloom protects organizational psychological health data by restricting aggregate metrics to HR and Administrators.
              </p>
              <div style={{ marginTop: 16 }}>
                <button
                  className="button button-coral"
                  onClick={() => onRoleSwitch && onRoleSwitch('HR')}
                >
                  Switch Role to HR to test access →
                </button>
              </div>
            </div>
          ) : companyData ? (
            <div style={{ display: 'grid', gap: 20 }}>
              <div className="stats-row">
                <div className="card stat-block">
                  <strong>{companyData.overallWellbeingIndex}%</strong>
                  <span>Company Wellbeing Index</span>
                </div>
                <div className="card stat-block">
                  <strong>{companyData.averageDailyEnergy}/10</strong>
                  <span>Average Daily Energy</span>
                </div>
                <div className="card stat-block">
                  <strong>{companyData.volunteerHoursThisQuarter}h</strong>
                  <span>Volunteer Hours (Quarter)</span>
                </div>
              </div>

              <div className="card card-pad">
                <h2 className="card-title">Department Pacing & Rhythms</h2>
                <p className="card-caption">Aggregated anonymous team health</p>
                <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                  {companyData.departmentRhythms?.map((dept) => (
                    <div key={dept.department} style={{ padding: 14, background: 'hsl(var(--canvas) / 0.5)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong>{dept.department}</strong>
                        <span style={{ color: 'hsl(var(--sage-dark))', fontWeight: 700 }}>
                          {dept.score}% score
                        </span>
                      </div>
                      <div className="bar-track" style={{ height: 8 }}>
                        <div className="bar-fill" style={{ width: `${dept.score}%` }} />
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'hsl(var(--muted))', marginTop: 8 }}>
                        <span>Energy: {dept.energy}/10</span>
                        <span>Stress: {dept.stress}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
