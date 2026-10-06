import { useState, useEffect } from 'react'
import { wellnessApi } from '../api/wellnessApi'
import { getEmployeeId } from '../api/apiClient'
import { useToast } from '../components/ToastContext'
import { PageHero } from '../components/PageHero'
import { AiRecommendation } from '../components/wellness/AiRecommendation'

// The backend waits up to 120s for n8n/Ollama (workbloom.http-client.read-timeout-ms).
// The browser waits a little longer so the server's own answer/error wins.
const AI_CLIENT_TIMEOUT_MS = 150000

const RISK_STYLES = {
  LOW: { label: 'Low', color: 'hsl(var(--sage-dark))', bg: 'hsl(var(--sage-soft) / 0.6)' },
  MODERATE: { label: 'Moderate', color: 'hsl(var(--gold-dark, var(--gold)))', bg: 'hsl(var(--gold) / 0.18)' },
  HIGH: { label: 'High', color: 'hsl(var(--coral))', bg: 'hsl(var(--coral-soft) / 0.5)' },
}

export function WellnessView({ user, navigate, onUserUpdate }) {
  const empId = user?.id || user?.employeeId || getEmployeeId()

  // Mood state
  const [mood, setMood] = useState('Steady')
  const [moodNote, setMoodNote] = useState('')
  const [moodLogs, setMoodLogs] = useState([])
  const [moodSaving, setMoodSaving] = useState(false)

  // Wellness log state
  const [overwhelmLevel, setOverwhelmLevel] = useState(3)
  const [concentrationDifficulty, setConcentrationDifficulty] = useState(2)
  const [energyLevel, setEnergyLevel] = useState(7)
  const [motivationLevel, setMotivationLevel] = useState(8)
  const [sleepQuality, setSleepQuality] = useState(7)
  const [relaxationLevel, setRelaxationLevel] = useState(6)
  const [wellnessNote, setWellnessNote] = useState('')
  const [wellnessLogs, setWellnessLogs] = useState([])
  const [wellnessSaving, setWellnessSaving] = useState(false)

  // Counselling state
  const [counsellingList, setCounsellingList] = useState([])
  const [counsellingModal, setCounsellingModal] = useState(false)
  const [counsellingTopic, setCounsellingTopic] = useState('MENTAL_WELLBEING')
  const [counsellingNotes, setCounsellingNotes] = useState('')
  const [counsellingDate, setCounsellingDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [counsellingTime, setCounsellingTime] = useState('10:00')
  const [counsellingBooking, setCounsellingBooking] = useState(false)

  // AI Wellness state
  const [aiInsight, setAiInsight] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiElapsed, setAiElapsed] = useState(0)

  const [loading, setLoading] = useState(true)
  const addToast = useToast()

  const loadAllWellnessData = async () => {
    if (!empId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [mHistory, wHistory, cHistory] = await Promise.all([
        wellnessApi.getMoodHistory(empId).catch(() => []),
        wellnessApi.getWellnessHistory(empId).catch(() => []),
        wellnessApi.getEmployeeCounselling(empId).catch(() => []),
      ])

      setMoodLogs(Array.isArray(mHistory) ? mHistory : [])
      setWellnessLogs(Array.isArray(wHistory) ? wHistory : [])
      setCounsellingList(Array.isArray(cHistory) ? cHistory : [])
    } catch (err) {
      addToast(err.message || 'Could not load wellness data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllWellnessData()
  }, [empId])

  // Gentle elapsed-time counter while the (possibly slow) AI request runs
  useEffect(() => {
    if (!aiLoading) return undefined
    setAiElapsed(0)
    const started = Date.now()
    const timer = setInterval(() => setAiElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [aiLoading])

  // Handle Mood Check-in
  const handleMoodSubmit = async (e) => {
    e.preventDefault()
    if (!empId) return

    try {
      setMoodSaving(true)
      await wellnessApi.recordMood(empId, { mood, note: moodNote })
      addToast('Mood recorded gently. 🌿')
      setMoodNote('')
      const mHistory = await wellnessApi.getMoodHistory(empId)
      setMoodLogs(Array.isArray(mHistory) ? mHistory : [])
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      addToast(err.message || 'Could not record mood', 'error')
    } finally {
      setMoodSaving(false)
    }
  }

  // Handle Detailed Wellness Log
  const handleWellnessSubmit = async (e) => {
    e.preventDefault()
    if (!empId) return

    try {
      setWellnessSaving(true)
      const payload = {
        overwhelmLevel,
        concentrationDifficulty,
        energyLevel,
        motivationLevel,
        sleepQuality,
        relaxationLevel,
        note: wellnessNote,
      }
      await wellnessApi.recordWellness(empId, payload)
      addToast('Wellness metrics saved to private journal. 🌸')
      setWellnessNote('')
      const wHistory = await wellnessApi.getWellnessHistory(empId)
      setWellnessLogs(Array.isArray(wHistory) ? wHistory : [])
    } catch (err) {
      addToast(err.message || 'Could not save wellness log', 'error')
    } finally {
      setWellnessSaving(false)
    }
  }

  // Handle Book Counselling
  const handleBookCounselling = async (e) => {
    e.preventDefault()
    if (!empId) return

    try {
      setCounsellingBooking(true)
      // Backend CreateCounsellingRequest fields are counsellingType
      // (enum) / appointmentDate / appointmentTime / reason - the
      // previous { topic, counsellorName, notes } payload matched none
      // of them, so every booking silently created an appointment with
      // counsellingType/appointmentDate/appointmentTime all null.
      await wellnessApi.bookCounselling(empId, {
        counsellingType: counsellingTopic,
        appointmentDate: counsellingDate,
        appointmentTime: counsellingTime.length === 5 ? `${counsellingTime}:00` : counsellingTime,
        reason: counsellingNotes,
      })
      addToast('Confidential 1-on-1 session request submitted. 🤝')
      setCounsellingModal(false)
      setCounsellingNotes('')
      const cHistory = await wellnessApi.getEmployeeCounselling(empId)
      setCounsellingList(Array.isArray(cHistory) ? cHistory : [])
    } catch (err) {
      addToast(err.message || 'Could not request counselling session', 'error')
    } finally {
      setCounsellingBooking(false)
    }
  }

  // Handle Cancel Counselling
  const handleCancelCounselling = async (id) => {
    try {
      await wellnessApi.cancelCounselling(id, empId)
      addToast('Counselling request cancelled.')
      const cHistory = await wellnessApi.getEmployeeCounselling(empId)
      setCounsellingList(Array.isArray(cHistory) ? cHistory : [])
    } catch (err) {
      addToast(err.message || 'Could not cancel session', 'error')
    }
  }

  // Handle AI Wellness Analysis
  const handleAnalyzeAi = async () => {
    if (!empId || aiLoading) return // ignore double-clicks while a request is running

    const controller = new AbortController()
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, AI_CLIENT_TIMEOUT_MS)

    try {
      setAiLoading(true)
      setAiError(null)

      const payload = {
        employeeId: Number(empId),
        overwhelmLevel,
        concentrationDifficulty,
        energyLevel,
        motivationLevel,
        sleepQuality,
        relaxationLevel,
        note: wellnessNote || moodNote || 'Rhythm check',
        mood,
      }

      const res = await wellnessApi.analyzeAiWellness(empId, payload, { signal: controller.signal })
      setAiInsight(res)
      addToast('AI Wellness insight generated. ✨')
    } catch (err) {
      if (timedOut) {
        setAiError('The wellness assistant is taking longer than expected. Your mood and wellness check-ins are unaffected - please try again in a moment.')
      } else if (err.status === 503) {
        setAiError('The wellness assistant is temporarily unavailable. Please try again shortly.')
      } else {
        setAiError(err.message || 'Wellness analysis service is currently offline.')
      }
    } finally {
      clearTimeout(timeout)
      setAiLoading(false)
    }
  }

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN'

  return (
    <div className="content page-shell">
      <PageHero page="wellness" />
      {/* Calm & Safe Hero Banner */}
      <div
        className="module-hero"
        style={{
          marginBottom: 28,
          background: 'radial-gradient(circle at 90% 10%, hsl(var(--sage-soft) / 0.6), transparent 35%), hsl(var(--paper))',
          padding: 28,
          borderRadius: 16,
          border: '1px solid hsl(var(--line))',
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>Personal Sanctuary</p>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Your Nervous System, Heard & Protected</h1>
        <p className="subtitle" style={{ maxWidth: 620, color: 'hsl(var(--ink) / 0.85)', lineHeight: 1.6 }}>
          This space is strictly private. Track your daily rhythm, submit wellness logs, book confidential care sessions, or request AI wellness recommendations.
        </p>

        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="button button-primary"
            onClick={handleAnalyzeAi}
            disabled={aiLoading}
          >
            {aiLoading ? `Analyzing wellness rhythm... ${aiElapsed}s` : '✨ Generate AI Wellness Insight'}
          </button>
          <button
            className="button button-quiet"
            onClick={() => setCounsellingModal(true)}
          >
            🤝 Request Confidential Care Session
          </button>
        </div>
      </div>

      {/* AI Wellness Result Display */}
      {aiInsight && (
        <div
          className="card card-pad"
          style={{
            marginBottom: 28,
            border: '1.5px solid hsl(var(--sage-dark))',
            background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sage-soft) / 0.25))',
            padding: 22,
            borderRadius: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="badge-pill badge-calm" style={{ fontWeight: 700 }}>
              ✨ AI Wellness Assessment
            </span>
            <button className="text-link" style={{ fontSize: 11 }} onClick={() => setAiInsight(null)}>Dismiss</button>
          </div>

          {(() => {
            // Backend wellnessScore is on a 10-point scale (e.g. 7.17). Convert once,
            // for display only; aiInsight.wellnessScore itself is never modified.
            const rawScore = aiInsight.wellnessScore
            const parsedScore = rawScore === null || rawScore === undefined || rawScore === '' ? NaN : Number(rawScore)
            const displayWellnessScore = Number.isFinite(parsedScore) ? Math.round(parsedScore * 10) : null
            const scoreText = displayWellnessScore === null ? null : String(displayWellnessScore)
            const scoreNum = displayWellnessScore ?? 0
            const risk = aiInsight.riskLevel
              ? RISK_STYLES[String(aiInsight.riskLevel).toUpperCase()] || { label: String(aiInsight.riskLevel), color: 'hsl(var(--sage-dark))', bg: 'hsl(var(--paper-warm))' }
              : null
            if (scoreText === null && !risk) return null
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
                {scoreText !== null && (
                  <div style={{ padding: '12px 16px', background: 'hsl(var(--paper))', borderRadius: 12, border: '1px solid hsl(var(--line))' }}>
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>Wellness score</span>
                    <div style={{ fontSize: 26, fontWeight: 700, color: 'hsl(var(--sage-dark))', lineHeight: 1.2 }}>
                      {scoreText} <span style={{ fontSize: 14, fontWeight: 500, color: 'hsl(var(--muted))' }}>/ 100</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.max(0, Math.min(100, scoreNum))}
                      aria-label="Wellness score out of 100"
                      style={{ height: 6, borderRadius: 3, background: 'hsl(var(--line))', marginTop: 8, overflow: 'hidden' }}
                    >
                      <div style={{ width: `${Math.max(0, Math.min(100, scoreNum))}%`, height: '100%', background: 'hsl(var(--sage-dark))' }} />
                    </div>
                  </div>
                )}
                {risk && (
                  <div style={{ padding: '12px 16px', background: 'hsl(var(--paper))', borderRadius: 12, border: '1px solid hsl(var(--line))' }}>
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>Risk level</span>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 16, background: risk.bg, color: risk.color, fontWeight: 700, fontSize: 15 }}>
                        {risk.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {aiInsight.recommendation && (
            <div
              style={{
                padding: '16px 18px',
                background: 'hsl(var(--paper))',
                border: '1px solid hsl(var(--line))',
                borderRadius: 12,
              }}
            >
              <p className="eyebrow" style={{ margin: '0 0 8px', color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
                Your personalised recommendations
              </p>
              <AiRecommendation text={aiInsight.recommendation} />
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <button
              className="button button-quiet"
              style={{ fontSize: 11 }}
              onClick={() => navigate('/travel')}
            >
              🗺️ Explore sabbatical havens matched to your state →
            </button>
          </div>
        </div>
      )}

      {/* AI loading state: the local model can take a while */}
      {aiLoading && (
        <div
          role="status"
          aria-live="polite"
          className="card card-pad"
          style={{ marginBottom: 24, padding: '16px 20px', background: 'hsl(var(--sage-soft) / 0.3)', border: '1px solid hsl(var(--line))', borderRadius: 14 }}
        >
          <strong style={{ display: 'block', marginBottom: 4 }}>Preparing your personalised insight…</strong>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
            This can take up to a couple of minutes. You can keep using the page - your check-ins are not affected.
          </span>
        </div>
      )}

      {/* AI Error Banner */}
      {aiError && (
        <div className="alert" style={{ marginBottom: 24, background: 'hsl(var(--paper-warm))', border: '1px solid hsl(var(--gold))' }}>
          {aiError}
        </div>
      )}

      {/* Confidential Counselling Modal */}
      {counsellingModal && (
        <div className="modal-backdrop" onClick={() => setCounsellingModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 480, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>Confidential Support</p>
                <h2 style={{ margin: 0, fontSize: 20 }}>Book 1-on-1 Counselling</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCounsellingModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: 'hsl(var(--muted))', marginBottom: 16 }}>
              WorkBloom Employee Care offers fully confidential sessions with licensed workplace counsellors.
            </p>

            <form onSubmit={handleBookCounselling}>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Focus or Topic</label>
                <select
                  value={counsellingTopic}
                  onChange={(e) => setCounsellingTopic(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
                >
                  <option value="MENTAL_WELLBEING">Mental Wellbeing</option>
                  <option value="STRESS_MANAGEMENT">Stress Management (Sustainable Pacing & Boundaries)</option>
                  <option value="WORK_LIFE_BALANCE">Work-Life Balance (Preventing Exhaustion & Burnout)</option>
                  <option value="PERSONAL_SUPPORT">Personal Support (Life Transition & Grounding)</option>
                  <option value="CAREER_GUIDANCE">Career Guidance</option>
                  <option value="OTHER">Other / Navigating Team Friction or Conflict</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Preferred Date</label>
                  <input
                    type="date"
                    value={counsellingDate}
                    onChange={(e) => setCounsellingDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Preferred Time</label>
                  <input
                    type="time"
                    value={counsellingTime}
                    onChange={(e) => setCounsellingTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Private Note (Optional)</label>
                <textarea
                  value={counsellingNotes}
                  onChange={(e) => setCounsellingNotes(e.target.value)}
                  placeholder="Anything specific you'd like your care specialist to know..."
                  style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="button button-quiet" onClick={() => setCounsellingModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={counsellingBooking}>
                  {counsellingBooking ? 'Submitting...' : 'Confirm Session Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Mood Check-in & Wellness Activity Form */}
      <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Mood Check-in Section */}
        <div className="card card-pad" style={{ padding: 24 }}>
          <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Daily Mood Check-in</h2>
          <p className="card-caption" style={{ margin: '0 0 16px', fontSize: 12, color: 'hsl(var(--muted))' }}>
            Record your current mood state to track your emotional rhythm over time.
          </p>

          <form onSubmit={handleMoodSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Select Mood</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
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
                    style={{
                      padding: 12,
                      textAlign: 'left',
                      borderRadius: 10,
                      border: mood === item.name ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                      background: mood === item.name ? 'hsl(var(--sage-soft) / 0.5)' : 'hsl(var(--paper))',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{item.icon}</div>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 4, color: mood === item.name ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))' }}>{item.name}</strong>
                    <span style={{ fontSize: 10, color: 'hsl(var(--muted))' }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mood Note (Optional)</label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Share a brief thought about what's shaping your mood..."
                style={{ width: '100%', minHeight: 70, padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))' }}
              />
            </div>

            <button type="submit" className="button button-primary" disabled={moodSaving} style={{ width: '100%' }}>
              {moodSaving ? 'Recording...' : 'Record Mood Check-in'}
            </button>
          </form>
        </div>

        {/* Detailed Wellness Log Form */}
        <div className="card card-pad" style={{ padding: 24 }}>
          <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Wellness & Energy Log</h2>
          <p className="card-caption" style={{ margin: '0 0 16px', fontSize: 12, color: 'hsl(var(--muted))' }}>
            Record detailed vital metrics to evaluate stress and battery reserves.
          </p>

          <form onSubmit={handleWellnessSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Overwhelm (1-5)</label>
                  <strong>{overwhelmLevel}</strong>
                </div>
                <input type="range" min="1" max="5" value={overwhelmLevel} onChange={(e) => setOverwhelmLevel(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Concentration Diff (1-5)</label>
                  <strong>{concentrationDifficulty}</strong>
                </div>
                <input type="range" min="1" max="5" value={concentrationDifficulty} onChange={(e) => setConcentrationDifficulty(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Energy Level (1-5)</label>
                  <strong>{energyLevel}</strong>
                </div>
                <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Motivation (1-5)</label>
                  <strong>{motivationLevel}</strong>
                </div>
                <input type="range" min="1" max="5" value={motivationLevel} onChange={(e) => setMotivationLevel(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Sleep Quality (1-5)</label>
                  <strong>{sleepQuality}</strong>
                </div>
                <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <label style={{ fontWeight: 600 }}>Relaxation (1-5)</label>
                  <strong>{relaxationLevel}</strong>
                </div>
                <input type="range" min="1" max="5" value={relaxationLevel} onChange={(e) => setRelaxationLevel(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Reflective Note</label>
              <textarea
                value={wellnessNote}
                onChange={(e) => setWellnessNote(e.target.value)}
                placeholder="Notes on sleep, pacing, or daily triggers..."
                style={{ width: '100%', minHeight: 60, padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))' }}
              />
            </div>

            <button type="submit" className="button button-primary" disabled={wellnessSaving} style={{ width: '100%' }}>
              {wellnessSaving ? 'Saving Log...' : 'Save Wellness Log'}
            </button>
          </form>
        </div>
      </div>

      {/* History & Counselling Status Cards */}
      <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Mood History Timeline */}
        <div className="card card-pad" style={{ padding: 24 }}>
          <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 18 }}>Mood Check-in History</h2>
          <p className="card-caption" style={{ margin: '0 0 16px', fontSize: 12, color: 'hsl(var(--muted))' }}>Your recent check-in entries</p>

          <div style={{ display: 'grid', gap: 10 }}>
            {moodLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: 20, textAlign: 'center', color: 'hsl(var(--muted))', fontSize: 13 }}>
                Your wellness journey starts with your first check-in.
              </div>
            ) : (
              moodLogs.slice(0, 5).map((log) => (
                <div key={log.id || log.recordedAt} style={{ padding: 12, borderRadius: 10, background: 'hsl(var(--canvas) / 0.4)', border: '1px solid hsl(var(--line) / 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'hsl(var(--sage-dark))', fontSize: 13 }}>{log.mood || 'Check-in'}</span>
                    <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                      {log.recordedAt ? new Date(log.recordedAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  {log.note && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'hsl(var(--ink) / 0.85)', fontStyle: 'italic' }}>“{log.note}”</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Counselling Sessions Status */}
        <div className="card card-pad" style={{ padding: 24 }}>
          <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 18 }}>Counselling Appointments</h2>
          <p className="card-caption" style={{ margin: '0 0 16px', fontSize: 12, color: 'hsl(var(--muted))' }}>Confidential sessions status</p>

          <div style={{ display: 'grid', gap: 10 }}>
            {counsellingList.length === 0 ? (
              <div className="empty-state" style={{ padding: 20, textAlign: 'center', color: 'hsl(var(--muted))', fontSize: 13 }}>
                No active counselling requests right now.
              </div>
            ) : (
              counsellingList.map((cs) => (
                <div key={cs.id} style={{ padding: 14, borderRadius: 10, background: 'hsl(var(--paper-warm))', border: '1px solid hsl(var(--line))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 13 }}>{cs.counsellingType ? cs.counsellingType.replace(/_/g, ' ') : 'General Support'}</strong>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        background: cs.status === 'APPROVED' ? 'hsl(var(--sage-soft))' : cs.status === 'CANCELLED' ? 'hsl(var(--coral-soft) / 0.4)' : 'hsl(var(--canvas))',
                        color: cs.status === 'APPROVED' ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))',
                      }}
                    >
                      {cs.status || 'PENDING'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 8px', fontSize: 11, color: 'hsl(var(--muted))' }}>
                    {cs.appointmentDate ? new Date(`${cs.appointmentDate}T${cs.appointmentTime || '00:00:00'}`).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Date to be confirmed'}
                  </p>

                  {cs.status === 'PENDING' && (
                    <button
                      className="button button-quiet"
                      style={{ padding: '4px 8px', fontSize: 10, color: 'hsl(var(--coral))' }}
                      onClick={() => handleCancelCounselling(cs.id)}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}