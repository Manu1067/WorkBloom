import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'
import { RouteMap } from '../components/RouteMap'

const INDIAN_ORIGIN_CITIES = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'New Delhi, Delhi',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Kochi, Kerala',
  'Kolkata, West Bengal',
  'Goa',
  'Jaipur, Rajasthan',
  'Chandigarh',
  'Coimbatore, Tamil Nadu',
]

const MOODS = [
  {
    id: 'Tired',
    label: 'Tired / Depleted',
    emoji: '🌿',
    summary: 'Nervous system exhaustion & physical fatigue',
    need: 'Deep quiet, mineral soaks, cedar forests & zero alarms',
    color: 'hsl(var(--sage))',
  },
  {
    id: 'Full',
    label: 'Full / Overstimulated',
    emoji: '🧘',
    summary: 'Cognitive overload & notification fatigue',
    need: 'Digital detox, sound silence & high mountain clarity',
    color: 'hsl(var(--coral))',
  },
  {
    id: 'Steady',
    label: 'Steady / Grounded',
    emoji: '⚖️',
    summary: 'Stable focus & gentle creative rhythm',
    need: 'Ocean horizons, reflective essays & nature walks',
    color: 'hsl(var(--sky))',
  },
  {
    id: 'Bright',
    label: 'Bright / Energized',
    emoji: '☀️',
    summary: 'High vitality & uplifted curiosity',
    need: 'Volcanic thermal pools, vibrant botanical trails & wonder',
    color: 'hsl(var(--gold))',
  },
]

const DEPLETION_FACTORS = [
  { id: 'screen', label: 'Screen strain & nonstop notifications', icon: '💻', desc: 'Eyes tired, visual overstimulation, inbox anxiety' },
  { id: 'meetings', label: 'Meeting fatigue & social context-switching', icon: '🗣️', desc: 'Too many calls, speaking exhaustion, empathy drain' },
  { id: 'physical', label: 'Physical stiffness & interrupted sleep', icon: '🛏️', desc: 'Desk posture tension, shallow breathing, waking unrefreshed' },
  { id: 'creative', label: 'Creative stagnation & repetitive routine', icon: '🎨', desc: 'Need fresh perspective, expansive landscapes, new ideas' },
]

const SENSORY_PREFERENCES = [
  { id: 'tea', label: 'Misty emerald tea slopes & Ayurvedic herbal therapies (Munnar, Kerala)', icon: '🍃', havenId: 1 },
  { id: 'river', label: 'Sacred Ganges riverbank, acoustic singing bowls & stillness (Rishikesh, Uttarakhand)', icon: '🌊', havenId: 2 },
  { id: 'coffee', label: 'Rainforest canopy, organic coffee estate & deep sleep reset (Coorg, Karnataka)', icon: '☕', havenId: 3 },
  { id: 'desert', label: 'High mountain desert silence, Bortle-1 stargazing & zero cell signal (Nubra Valley, Ladakh)', icon: '🌌', havenId: 4 },
  { id: 'cliff', label: 'Red laterite sea cliffs, ocean surf & natural mineral springs (Varkala, Kerala)', icon: '🏖️', havenId: 5 },
  { id: 'cedar', label: 'Towering deodar cedar woods & Dhauladhar snowpeaks (Dharamshala, Himachal Pradesh)', icon: '🌲', havenId: 6 },
  { id: 'beach', label: 'Secluded crescent cove, warm sand grounding & quiet tide (Gokarna, Karnataka)', icon: '🏝️', havenId: 7 },
  { id: 'banyan', label: 'Ancient sacred banyan tree & conscious regenerative eco-forest (Auroville, Tamil Nadu)', icon: '🌳', havenId: 8 },
]

const RECHARGE_GOALS = [
  { id: 'detox', label: 'Total digital detox (zero Wi-Fi, zero screens)', icon: '📴' },
  { id: 'somatic', label: 'Deep somatic body reset & 9+ hours uninterrupted sleep', icon: '😴' },
  { id: 'reflection', label: 'Quiet journaling, mindful essays & creative contemplation', icon: '📖' },
  { id: 'wander', label: 'Gentle slow exploration, organic food & mountain trails', icon: '🎒' },
]

export function TravelView({ user, navigate }) {
  const [destinations, setDestinations] = useState([])
  const [selectedMood, setSelectedMood] = useState(user?.latestMood || 'Steady')
  const [moodFilterOnly, setMoodFilterOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [origin, setOrigin] = useState('Bengaluru, Karnataka')
  const [dest, setDest] = useState('Munnar Tea Sanctuary, India')
  const [pacingMode, setPacingMode] = useState('Scenic & Slow Pacing')
  const [routePlan, setRoutePlan] = useState(null)
  const [planning, setPlanning] = useState(false)

  // Questionnaire state for AI n8n + Ollama
  const [activeTab, setActiveTab] = useState('ai-questionnaire') // 'ai-questionnaire' | 'browse'
  const [qMood, setQMood] = useState(user?.latestMood || 'Tired')
  const [qEnergy, setQEnergy] = useState(user?.latestEnergyLevel || 4)
  const [qDepletion, setQDepletion] = useState('screen')
  const [qSensory, setQSensory] = useState('tea')
  const [qGoal, setQGoal] = useState('somatic')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  const addToast = useToast()

  const loadTravelData = async (mood) => {
    try {
      setLoading(true)
      const data = await features.destinations(mood)
      setDestinations(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load destinations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTravelData(selectedMood)
  }, [selectedMood])

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId)
    setQMood(moodId)
    addToast(`Filtering restorative havens for mood: "${moodId}" 🌸`)
  }

  const handleRunAiAssessment = async (e) => {
    if (e) e.preventDefault()
    try {
      setAiLoading(true)
      const sensoryObj = SENSORY_PREFERENCES.find((s) => s.id === qSensory)
      const depletionObj = DEPLETION_FACTORS.find((d) => d.id === qDepletion)
      const goalObj = RECHARGE_GOALS.find((g) => g.id === qGoal)

      const payload = {
        employeeId: user?.id,
        mood: qMood,
        energy: qEnergy,
        sensoryPreference: sensoryObj ? sensoryObj.label : 'Silent cedar forest & natural soaks',
        burnoutSource: depletionObj ? depletionObj.label : 'Screen and notification fatigue',
        rechargeGoal: goalObj ? goalObj.label : 'Deep nervous system reset & uninterrupted sleep',
      }

      const res = await features.travelAiRecommend(payload)
      setAiResult(res)
      if (res.destination) {
        setDest(`${res.destination.name}, ${res.destination.country}`)
      }
      addToast(`AI matched the most appropriate destination: "${res.destination?.name}" ✨`)
    } catch (err) {
      addToast(err.message || 'AI assessment failed', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const handleOptimizeRoute = async (e, customOrigin, customDest) => {
    if (e) e.preventDefault()
    const targetOrigin = customOrigin || origin
    const targetDest = customDest || dest
    try {
      setPlanning(true)
      const res = await features.optimizeRoute({ origin: targetOrigin, destination: targetDest, pacingMode })
      setRoutePlan(res)
      if (e) addToast('Restorative route calculated and visualized on map! 🗺️')
    } catch (err) {
      if (e) addToast(err.message, 'error')
    } finally {
      setPlanning(false)
    }
  }

  // Calculate initial route on mount so map is live and visual right away
  useEffect(() => {
    handleOptimizeRoute(null, origin, dest)
  }, [])

  const selectHavenForRoute = (destinationFullName) => {
    setDest(destinationFullName)
    handleOptimizeRoute(null, origin, destinationFullName)
    addToast(`Selected "${destinationFullName}"! Route updated on map. 🗺️`)
    const el = document.getElementById('route-optimizer-box')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const topMatch = destinations[0]
  const displayedDestinations = moodFilterOnly
    ? destinations.filter((d) => d.isRecommended || d.matchScore >= 90)
    : destinations

  const currentMoodObj = MOODS.find((m) => m.id === selectedMood) || MOODS[0]

  return (
    <div className="content page-shell">
      {/* Header */}
      <div className="module-hero" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p className="eyebrow" style={{ color: 'hsl(var(--sage))', margin: 0 }}>Room to roam · Intentional sabbatical</p>
          <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
            🤖 Powered by n8n + Ollama AI
          </span>
        </div>
        <h1>Mood-Based Travel & Restorative Havens</h1>
        <p className="subtitle" style={{ maxWidth: 680 }}>
          WorkBloom pairs intentional sabbatical travel with nervous-system health. Answer a few brief diagnostic questions to let our <strong>n8n + Ollama AI pipeline</strong> prescribe the most biologically restorative sanctuary for your exact burnout factors.
        </p>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className={`button ${activeTab === 'ai-questionnaire' ? 'button-primary' : 'button-quiet'}`}
            onClick={() => setActiveTab('ai-questionnaire')}
          >
            ✨ AI Assessment (n8n + Ollama)
          </button>
          <button
            type="button"
            className={`button ${activeTab === 'browse' ? 'button-primary' : 'button-quiet'}`}
            onClick={() => setActiveTab('browse')}
          >
            🧭 Browse All Sanctuaries & Moods ({destinations.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI QUESTIONNAIRE & APPROPRIATE DESTINATION (n8n + Ollama) */}
      {/* ========================================================================= */}
      {activeTab === 'ai-questionnaire' && (
        <section
          className="card card-pad"
          style={{
            marginBottom: 32,
            background: 'hsl(var(--paper))',
            border: '1.5px solid hsl(var(--sage) / 0.7)',
            boxShadow: '0 4px 20px -8px hsl(var(--sage) / 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge-pill badge-calm" style={{ fontWeight: 700 }}>
                  🧠 AI Diagnostic Assessment
                </span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                  Architecture: <strong style={{ color: 'hsl(var(--ink))' }}>n8n Webhook ⟷ Ollama LLM</strong>
                </span>
              </div>
              <h2 style={{ fontSize: 22, margin: '6px 0 4px' }}>Find Your Most Biologically Appropriate Sanctuary</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--muted))' }}>
                Answer these 5 quick restorative questions so the AI agent can diagnose your nervous-system depletion and select the optimal haven.
              </p>
            </div>
            {aiResult && (
              <button
                type="button"
                className="button button-quiet"
                style={{ fontSize: 11 }}
                onClick={() => setAiResult(null)}
              >
                ↺ Clear & Retake
              </button>
            )}
          </div>

          <form onSubmit={handleRunAiAssessment}>
            {/* Question 1: Mood */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                1. What is the prevailing state of your nervous system today?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {MOODS.map((m) => {
                  const isSelected = qMood === m.id
                  return (
                    <motion.button
                      key={m.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQMood(m.id)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                        background: isSelected ? 'hsl(var(--sage-soft) / 0.4)' : 'hsl(var(--canvas) / 0.5)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span>{m.emoji}</span>
                        <strong style={{ fontSize: 12, color: isSelected ? 'hsl(var(--sage-dark))' : 'inherit' }}>
                          {m.label}
                        </strong>
                      </div>
                      <div style={{ fontSize: 10, color: 'hsl(var(--muted))', lineHeight: 1.3 }}>
                        {m.summary}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Question 2: Energy & Battery Reserve */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 13 }}>
                  2. What is your physical battery level right now? (1 = Completely spent, 10 = High vitality)
                </label>
                <span className="badge-pill" style={{ fontWeight: 700, fontSize: 12 }}>
                  {qEnergy}/10 {qEnergy <= 3 ? '🔴 Running on fumes' : qEnergy <= 6 ? '🟡 Gentle reserve' : '🟢 Lifted'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={qEnergy}
                onChange={(e) => setQEnergy(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'hsl(var(--sage-dark))', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'hsl(var(--muted))', marginTop: 4 }}>
                <span>1 - Severe burnout / Needs sleep</span>
                <span>5 - Moderate pacing</span>
                <span>10 - High adventure readiness</span>
              </div>
            </div>

            {/* Question 3: Primary Source of Burnout */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                3. What has been the primary drain on your vitality lately?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {DEPLETION_FACTORS.map((df) => {
                  const isSelected = qDepletion === df.id
                  return (
                    <motion.button
                      key={df.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQDepletion(df.id)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                        background: isSelected ? 'hsl(var(--sage-soft) / 0.4)' : 'hsl(var(--canvas) / 0.5)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span>{df.icon}</span>
                        <strong style={{ fontSize: 12, color: isSelected ? 'hsl(var(--sage-dark))' : 'inherit' }}>
                          {df.label}
                        </strong>
                      </div>
                      <div style={{ fontSize: 10, color: 'hsl(var(--muted))' }}>
                        {df.desc}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Question 4: Healing Sensory Preference */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                4. Which natural sensory profile calls to your nervous system?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {SENSORY_PREFERENCES.map((sp) => {
                  const isSelected = qSensory === sp.id
                  return (
                    <motion.button
                      key={sp.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQSensory(sp.id)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                        background: isSelected ? 'hsl(var(--sage-soft) / 0.4)' : 'hsl(var(--canvas) / 0.5)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{sp.icon}</span>
                        <span style={{ fontSize: 12, color: isSelected ? 'hsl(var(--sage-dark))' : 'inherit', fontWeight: isSelected ? 600 : 400 }}>
                          {sp.label}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Question 5: Core Sabbatical Intention */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                5. What is your fundamental intention for this retreat?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {RECHARGE_GOALS.map((rg) => {
                  const isSelected = qGoal === rg.id
                  return (
                    <motion.button
                      key={rg.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQGoal(rg.id)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                        background: isSelected ? 'hsl(var(--sage-soft) / 0.4)' : 'hsl(var(--canvas) / 0.5)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{rg.icon}</span>
                        <span style={{ fontSize: 12, color: isSelected ? 'hsl(var(--sage-dark))' : 'inherit', fontWeight: isSelected ? 600 : 400 }}>
                          {rg.label}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Submission CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <motion.button
                  type="submit"
                  className="button button-primary"
                  disabled={aiLoading}
                  whileHover={{ scale: aiLoading ? 1 : 1.02 }}
                  whileTap={{ scale: aiLoading ? 1 : 0.98 }}
                  style={{ padding: '11px 26px', fontSize: 14 }}
                >
                  {aiLoading ? '🧠 Evaluating via n8n & Ollama...' : '✨ Prescribe Most Appropriate Destination (AI)'}
                </motion.button>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                  Sends telemetry to <code>/webhook/workbloom/travel-destination</code> (n8n + Ollama LLM)
                </span>
              </div>
              {aiLoading && (
                <div style={{ width: '100%', height: 4, background: 'hsl(var(--line))', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    style={{ width: '50%', height: '100%', background: 'hsl(var(--sage-dark))', borderRadius: 2 }}
                  />
                </div>
              )}
            </div>
          </form>

          {/* AI RESULT DISPLAY: THE MOST APPROPRIATE DESTINATION */}
          <AnimatePresence>
            {aiResult && aiResult.destination && (
              <motion.div
                id="ai-destination-result"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                  marginTop: 28,
                  padding: 24,
                  borderRadius: 16,
                  background: 'hsl(var(--paper-warm))',
                  border: '2px solid hsl(var(--sage-dark))',
                  boxShadow: '0 8px 30px -10px rgba(46, 125, 88, 0.25)',
                }}
              >
                {/* Temporary Photographic Landscape Banner */}
                <div style={{ position: 'relative', height: 240, borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
                  <motion.img
                    src={aiResult.destination.imageUrl || aiResult.destination.temporaryImage}
                    alt={aiResult.destination.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = aiResult.destination.temporaryImage || `https://picsum.photos/seed/haven-${aiResult.destination.id}/900/600`
                    }}
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: 0.8 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 30, 22, 0.88) 0%, rgba(14, 30, 22, 0.3) 55%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, color: '#ffffff' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: 'rgba(46, 125, 88, 0.95)', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
                        🌟 Most Appropriate Destination ({aiResult.matchScore}% Biological Match)
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(0, 0, 0, 0.65)', padding: '3px 10px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                        📍 {aiResult.destination.location}, {aiResult.destination.country}
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(0, 0, 0, 0.55)', padding: '3px 10px', borderRadius: 6 }}>
                        ⚡ {aiResult.engine}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 2px', fontSize: 26, fontWeight: 700, color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                      {aiResult.destination.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#e2ece5' }}>
                      Theme: {aiResult.destination.theme} · Pace: {aiResult.destination.idealPace}
                    </p>
                  </div>
                </div>

                {/* AI Rationale Box */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'hsl(var(--paper))',
                    border: '1px solid hsl(var(--line))',
                    marginBottom: 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>🌿</span>
                    <strong style={{ fontSize: 13, color: 'hsl(var(--sage-dark))' }}>
                      AI Clinical & Somatic Rationale:
                    </strong>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.6, color: 'hsl(var(--ink))' }}>
                    {aiResult.aiReasoning}
                  </p>
                  <div style={{ fontSize: 12, color: 'hsl(var(--muted))', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>
                      <strong>Biological Benefit:</strong> {aiResult.biologicalBenefit}
                    </span>
                    <span>
                      <strong>Sensory Rating:</strong> {aiResult.destination.sensoryLevel}
                    </span>
                  </div>
                </div>

                {/* 4-Part Daily Restorative Schedule */}
                {aiResult.recommendedDailyRhythm && (
                  <div style={{ marginBottom: 20 }}>
                    <strong style={{ display: 'block', fontSize: 13, marginBottom: 10, color: 'hsl(var(--ink))' }}>
                      🗓️ Curated Daily Rhythm at {aiResult.destination.name}:
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      {aiResult.recommendedDailyRhythm.map((slot, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: 'hsl(var(--canvas) / 0.5)',
                            border: '1px solid hsl(var(--line) / 0.7)',
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--sage-dark))' }}>
                            {slot.time}
                          </span>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'hsl(var(--ink))', lineHeight: 1.4 }}>
                            {slot.activity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <motion.button
                    type="button"
                    className="button button-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      selectHavenForRoute(`${aiResult.destination.name}, ${aiResult.destination.country}`)
                    }}
                  >
                    🗺️ Load & Optimize Route on Map ↓
                  </motion.button>
                  <motion.button
                    type="button"
                    className="button button-quiet"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addToast(`Applied $1,500 Rest Stipend to ${aiResult.destination.name}! Pre-registered with HR. 💼`)
                    }}
                  >
                    💼 Pre-authorize with $1,500 Rest Stipend
                  </motion.button>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                    Status: {aiResult.n8nServiceStatus}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BROWSE ALL SANCTUARIES (Direct Mood Filter) */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <section className="card card-pad" style={{ marginBottom: 28, background: 'hsl(var(--paper))', border: '1px solid hsl(var(--line))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge-pill badge-calm">🧠 Mood-Based Engine</span>
                <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                  Active Logged Mood: <strong style={{ color: 'hsl(var(--sage-dark))' }}>{selectedMood}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: 20, margin: '6px 0 2px' }}>Browse Restorative Havens by Emotion State</h2>
              <p style={{ margin: 0, fontSize: 12, color: 'hsl(var(--muted))' }}>
                Select a mood to rank sanctuaries according to neurological recovery compatibility.
              </p>
            </div>
          </div>

          {/* Mood Selector Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMoodSelect(m.id)}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                    background: isSelected ? 'hsl(var(--sage-soft) / 0.35)' : 'hsl(var(--canvas) / 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{m.emoji}</span>
                    <strong style={{ fontSize: 13, color: isSelected ? 'hsl(var(--sage-dark))' : 'inherit' }}>
                      {m.label}
                    </strong>
                  </div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--muted))', lineHeight: 1.35 }}>
                    {m.summary}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Top Mood Match Spotlight */}
          {topMatch && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'hsl(var(--paper-warm))',
                border: '1.5px solid hsl(var(--sage-dark))',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div style={{ position: 'relative', height: 140, borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={topMatch.imageUrl || topMatch.temporaryImage}
                  alt={topMatch.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = topMatch.temporaryImage || `https://picsum.photos/seed/haven-${topMatch.id}/800/500`
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                  <span style={{ fontSize: 11, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    📍 {topMatch.location}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span className="badge-pill badge-calm" style={{ fontSize: 10, fontWeight: 700 }}>
                    🌟 Top Recommendation for {selectedMood} ({topMatch.matchScore || 98}% Affinity)
                  </span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{topMatch.name}</h3>
                <p style={{ fontSize: 12, color: 'hsl(var(--ink))', lineHeight: 1.5, margin: '0 0 8px' }}>
                  {topMatch.moodReason || topMatch.description}
                </p>
                <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
                  Sensory Profile: <span style={{ fontWeight: 400, color: 'hsl(var(--muted))' }}>{topMatch.sensoryLevel || 'Low stimulation'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                  Need: <strong style={{ color: 'hsl(var(--ink))' }}>{currentMoodObj.need}</strong>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="button button-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    selectHavenForRoute(`${topMatch.name}, ${topMatch.country}`)
                  }}
                >
                  Plan & map itinerary to this haven →
                </motion.button>
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* Itinerary Optimizer & Sabbatical Stipend */}
      <div id="route-optimizer-box" className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <h2 className="card-title">Restorative Route Optimizer</h2>
          <p className="card-caption">Calculate a gentle journey with nervous-system recovery in mind</p>

          <form onSubmit={handleOptimizeRoute} style={{ marginTop: 16 }}>
            <div className="field">
              <label>Starting point (Indian Departure City)</label>
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} required />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))', alignSelf: 'center' }}>Quick Select:</span>
                {['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kochi', 'Goa'].map((city) => {
                  const fullCity = INDIAN_ORIGIN_CITIES.find((c) => c.startsWith(city)) || `${city}, India`
                  const isSelected = origin === fullCity
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setOrigin(fullCity)
                        handleOptimizeRoute(null, fullCity, dest)
                      }}
                      style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: isSelected ? '1.5px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                        background: isSelected ? 'hsl(var(--sage-soft))' : 'hsl(var(--canvas))',
                        color: isSelected ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))',
                        fontWeight: isSelected ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {city}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="field">
              <label>Destination (Selected by AI or manually)</label>
              <select
                value={dest}
                onChange={(e) => {
                  setDest(e.target.value)
                  handleOptimizeRoute(null, origin, e.target.value)
                }}
              >
                {destinations.map((d) => (
                  <option key={d.id} value={`${d.name}, ${d.country}`}>
                    {d.name} ({d.country}) · {d.matchScore ? `${d.matchScore}% match for ${selectedMood}` : d.theme}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Pacing & transit focus</label>
              <select
                value={pacingMode}
                onChange={(e) => {
                  setPacingMode(e.target.value)
                }}
              >
                <option value="Scenic & Slow Pacing">Scenic & Slow Pacing (Minimal rush, scenic mountain/ghat transit)</option>
                <option value="Minimum Context Switching">Minimum Context Switching (Direct connections only)</option>
                <option value="Nature Immersion">Nature Immersion (Pause near national parks & reserve forests)</option>
              </select>
            </div>
            <motion.button
              type="submit"
              className="button button-primary"
              disabled={planning}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{ width: '100%' }}
            >
              {planning ? 'Planning gentle route...' : 'Generate & Visualize Restorative Itinerary'}
            </motion.button>
          </form>

          {routePlan && (
            <div style={{ marginTop: 20, padding: 14, background: 'hsl(var(--paper-warm))', borderRadius: 12, border: '1px solid hsl(var(--line))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge-pill badge-calm">🌿 Optimized Itinerary</span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>Rest score: {routePlan.restScore || 95}/100</span>
              </div>
              <p style={{ fontSize: 13, margin: '0 0 10px', color: 'hsl(var(--ink))' }}>
                {routePlan.sceneryNotes || `Travel from ${origin} to ${dest} designed with gentle layovers and 2 quiet recharge stops.`}
              </p>
              {routePlan.optimizedRoute && (
                <div style={{ marginTop: 8, fontSize: 11, display: 'grid', gap: 4 }}>
                  <strong style={{ color: 'hsl(var(--sage-dark))' }}>Itinerary Waypoints:</strong>
                  {routePlan.optimizedRoute.map((stop, idx) => (
                    <div key={idx} style={{ color: 'hsl(var(--muted))' }}>
                      {idx + 1}. {stop}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', marginTop: 8 }}>
                🍃 Carbon offset included via WorkBloom Green Sabbatical Fund.
              </div>
            </div>
          )}
        </div>

        <div className="card card-pad">
          <h2 className="card-title">Retreat & Sabbatical Guidance</h2>
          <p className="card-caption">WorkBloom intentional rest policies</p>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 10, background: 'hsl(var(--canvas) / 0.5)' }}>
              <strong>✈️ $1,500 Annual Rest Stipend</strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'hsl(var(--muted))' }}>
                Reimbursement for nature retreats, train passes, cabin rentals, and off-grid sanctuaries.
              </p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'hsl(var(--canvas) / 0.5)' }}>
              <strong>🔋 Unplugged Sabbaticals</strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'hsl(var(--muted))' }}>
                After 3 years, take 4 consecutive fully-paid weeks without email or Slack.
              </p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'hsl(var(--canvas) / 0.5)' }}>
              <strong>🧭 Transit Without Rush</strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'hsl(var(--muted))' }}>
                Company travel policy encourages sleeper trains and slow scenic travel over redeyes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Restorative Route Map Display */}
      <div style={{ marginBottom: 28 }}>
        <RouteMap routePlan={routePlan} />
      </div>

      {/* Havens Gallery with Mood Affinity Scores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>All Curated Restorative Havens</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
            Ranked by match for your current state: <strong style={{ color: 'hsl(var(--sage-dark))' }}>{selectedMood}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`button ${!moodFilterOnly ? 'button-primary' : 'button-quiet'}`}
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={() => setMoodFilterOnly(false)}
          >
            All Havens ({destinations.length})
          </button>
          <button
            type="button"
            className={`button ${moodFilterOnly ? 'button-primary' : 'button-quiet'}`}
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={() => setMoodFilterOnly(true)}
          >
            Top Matches Only (≥90%)
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 160 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {displayedDestinations.map((d) => {
          const isTop = d.matchScore >= 95
          return (
            <motion.div
              key={d.id}
              className="card card-pad"
              whileHover={{ y: -5, boxShadow: '0 8px 24px -6px rgba(46, 125, 88, 0.22)' }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isTop ? '1.5px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                overflow: 'hidden',
              }}
            >
              <div>
                {/* Photographic Temporary Haven Image with Hover Zoom */}
                <div style={{ position: 'relative', height: 175, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                  <motion.img
                    src={d.imageUrl || d.temporaryImage}
                    alt={d.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = d.temporaryImage || `https://picsum.photos/seed/haven-${d.id}/800/500`
                    }}
                    whileHover={{ scale: 1.07 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 30, 22, 0.7) 0%, rgba(14, 30, 22, 0.1) 50%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isTop ? 'rgba(46, 125, 88, 0.95)' : 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {d.matchScore ? `✨ ${d.matchScore}% Match` : d.theme}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      📍 {d.location}
                    </span>
                    <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '2px 6px', borderRadius: 4 }}>
                      {d.idealPace}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <span className={`badge-pill ${isTop ? 'badge-calm' : ''}`} style={{ fontSize: 10 }}>
                    🌿 {d.theme}
                  </span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{d.country}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{d.name}</h3>
                <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 10px' }}>
                  {d.description}
                </p>

                {d.moodReason && (
                  <div style={{ padding: '8px 10px', borderRadius: 8, background: 'hsl(var(--paper-warm))', fontSize: 11, color: 'hsl(var(--ink))', marginBottom: 12 }}>
                    <strong>Why it restores you:</strong> {d.moodReason}
                  </div>
                )}

                <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
                  Highlights: <span style={{ fontWeight: 400, color: 'hsl(var(--muted))' }}>{d.highlights?.join(' · ') || 'Quiet walks, local cuisine'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600, marginTop: 4 }}>
                  Sensory Level: <span style={{ fontWeight: 400, color: 'hsl(var(--muted))' }}>{d.sensoryLevel || 'Quiet retreat'}</span>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`button ${dest === `${d.name}, ${d.country}` ? 'button-primary' : 'button-quiet'}`}
                  style={{ width: '100%' }}
                  onClick={() => {
                    selectHavenForRoute(`${d.name}, ${d.country}`)
                  }}
                >
                  {dest === `${d.name}, ${d.country}` ? '✓ Mapped on Itinerary' : 'Select & Map Route'}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
