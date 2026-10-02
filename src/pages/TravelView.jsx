import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { travelApi } from '../api/travelApi'

import { getEmployeeId } from '../api/apiClient'

import { useToast } from '../components/ToastContext'

import { TravelMap } from '../components/travel/TravelMap'

import { getDestinationImage } from '../utils/destinationImages'



export function TravelView({ user, navigate }) {

  // getEmployeeId() holds the REAL Employee id resolved via GET /employees/me

  // (see AuthContext); user.id can be the auth User id, a different entity.

  const empId = getEmployeeId() || user?.employeeId || user?.id



  // Sabbatical flow steps

  const [questions, setQuestions] = useState([])

  const [selectedOptionIds, setSelectedOptionIds] = useState({})

  const [recommendations, setRecommendations] = useState([])

  const [singleRecommendation, setSingleRecommendation] = useState(null)



  // Destination catalog & detail

  const [allDestinations, setAllDestinations] = useState([])

  const [selectedCategory, setSelectedCategory] = useState('')

  const [activeDestination, setActiveDestination] = useState(null)

  const [destinationImages, setDestinationImages] = useState([])

  const [detailModal, setDetailModal] = useState(false)



  // Route optimization state

  const [selectedRouteDestIds, setSelectedRouteDestIds] = useState([])

  const [routePlan, setRoutePlan] = useState(null)

  const [routeLoading, setRouteLoading] = useState(false)



  // UI state

  const [loading, setLoading] = useState(true)

  const [submittingAnswers, setSubmittingAnswers] = useState(false)

  const [error, setError] = useState(null)

  // Distinguishes "backend returned zero questions" (DB genuinely not

  // seeded - a real, valid state, not a bug) from "the questions

  // request itself failed" (auth/network/contract error) - these were

  // previously indistinguishable because .catch(() => []) silently

  // turned any failure into the same empty array as a truly empty table.

  const [questionsError, setQuestionsError] = useState(null)

  const [step, setStep] = useState(0)

  const [catalogError, setCatalogError] = useState(null)

  const [fullCatalog, setFullCatalog] = useState([])

  const [mapFocusId, setMapFocusId] = useState(null)

  const [detailError, setDetailError] = useState(null)



  const addToast = useToast()



  const logDev = (label, err) => {

    if (import.meta.env.DEV) console.warn(`[Travel] ${label}`, err)

  }



  // Initial data load: Questions, Catalog, Personal Recommendation

  const loadInitialTravelData = async ({ silent = false } = {}) => {

    try {

      // After the first load, refreshes (e.g. the employee id resolving late)

      // must not swap the whole page for a skeleton: that unmounted the cards,

      // the map and any open details panel.

      if (!silent) setLoading(true)

      setError(null)

      setQuestionsError(null)

      setCatalogError(null)



      const [qData, dData, recData] = await Promise.all([

        travelApi.getQuestions().catch((err) => {

          logDev('GET /travel/questions failed', err)

          setQuestionsError(

            err?.status ? `${err.message} (HTTP ${err.status})` : err?.message || 'Failed to load questionnaire from the backend',

          )

          return []

        }),

        travelApi.listDestinations().catch((err) => {

          logDev('GET /travel/destinations failed', err)

          setCatalogError(err?.message || 'Failed to load destinations')

          return []

        }),

        empId

          ? travelApi.getRecommendation(empId).catch((err) => {

              // 404 is normal when the employee has no mood/wellness data yet.

              logDev('GET /travel/recommend failed', err)

              return null

            })

          : null,

      ])



      const questionList = Array.isArray(qData) ? [...qData].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)) : []

      setQuestions(questionList)

      setStep(0)

      setAllDestinations(Array.isArray(dData) ? dData : [])

      setFullCatalog(Array.isArray(dData) ? dData : [])

      setSingleRecommendation(recData)

    } catch (err) {

      setError(err.message || 'Could not load travel data from the Spring Boot backend')

    } finally {

      setLoading(false)

    }

  }



  const hasLoadedOnce = useRef(false)

  useEffect(() => {

    loadInitialTravelData({ silent: hasLoadedOnce.current }).finally(() => {

      hasLoadedOnce.current = true

    })

  }, [empId])



  // Escape closes the details panel (and the backdrop never traps the page)

  useEffect(() => {

    if (!detailModal) return undefined

    const onKey = (e) => { if (e.key === 'Escape') setDetailModal(false) }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)

  }, [detailModal])



  // Filter destination catalog by category

  const handleCategoryFilter = async (cat) => {

    try {

      setSelectedCategory(cat)

      const data = await travelApi.listDestinations(cat || null)

      setAllDestinations(Array.isArray(data) ? data : [])

    } catch (err) {

      addToast(err.message || 'Filter failed', 'error')

    }

  }



  // Handle questionnaire option selection

  const handleOptionSelect = (questionId, optionId) => {

    setSelectedOptionIds((prev) => ({

      ...prev,

      [questionId]: optionId,

    }))

  }



  // Submit Questionnaire answers -> POST /api/travel/recommendations

  const handleSubmitQuestionnaire = async (e) => {

    e.preventDefault()

    const optionIdList = Object.values(selectedOptionIds)



    if (optionIdList.length === 0) {

      addToast('Please select at least one question option to get recommendations.', 'error')

      return

    }



    try {

      setSubmittingAnswers(true)

      const res = await travelApi.getRecommendationsFromAnswers(empId, optionIdList)

      setRecommendations(Array.isArray(res) ? res : [])

      addToast('Personalized sabbatical havens recommended! ✨')



      const el = document.getElementById('recommendations-section')

      if (el) el.scrollIntoView({ behavior: 'smooth' })

    } catch (err) {

      addToast(err.message || 'Could not fetch travel recommendations', 'error')

    } finally {

      setSubmittingAnswers(false)

    }

  }



  // Open Destination Details modal -> GET /api/travel/destinations/{id} & images

  const handleOpenDestinationDetail = async (destId) => {

    try {

      setDetailModal(true)

      setActiveDestination(null)

      setDestinationImages([])

      setDetailError(null)



      const [destDetail, imgs] = await Promise.all([

        travelApi.getDestination(destId),

        travelApi.getDestinationImages(destId).catch((err) => {

          logDev('GET destination images failed', err)

          return []

        }),

      ])



      setActiveDestination(destDetail)

      setDestinationImages(Array.isArray(imgs) ? imgs : [])

    } catch (err) {

      setDetailError(err.message || 'Could not load destination details')

      addToast(err.message || 'Could not load destination details', 'error')

    }

  }



  // Focus the interactive map on a destination ("View on Map")

  const handleViewOnMap = (dest) => {

    if (!dest) return

    setSelectedRouteDestIds((prev) => (prev.includes(dest.id) ? prev : [...prev, dest.id]))

    setRoutePlan(null)

    setMapFocusId(dest.id)

    setDetailModal(false)

    setTimeout(() => {

      const el = document.getElementById('travel-map-section')

      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })

    }, 50)

  }



  // Toggle destination for Route Optimization

  const handleToggleRouteDestination = (destId) => {

    setRoutePlan(null) // a previously optimized route no longer matches the selection

    setSelectedRouteDestIds((prev) => {

      if (prev.includes(destId)) {

        return prev.filter((id) => id !== destId)

      } else {

        return [...prev, destId]

      }

    })

  }



  // Optimize Multi-Destination Route -> POST /api/travel/routes/optimize

  // (backend: nearest-neighbour ordering over Haversine distance)

  const handleOptimizeRoute = async () => {

    if (selectedRouteDestIds.length < 2) {

      addToast('Select at least two destinations to optimize a route.', 'error')

      return

    }



    try {

      setRouteLoading(true)

      const res = await travelApi.optimizeRoute(selectedRouteDestIds)

      const points = Array.isArray(res?.points) ? res.points : []

      if (points.length === 0) {

        throw new Error('The route optimizer returned no stops.')

      }

      setRoutePlan({ points, totalDistanceKm: res.totalDistanceKm })

      setMapFocusId(null)

      addToast(`Destination order optimized across ${points.length} stops.`)

    } catch (err) {

      setRoutePlan(null)

      addToast(err.message || 'Route optimization failed', 'error')

    } finally {

      setRouteLoading(false)

    }

  }



  const catalogById = (id) => fullCatalog.find((d) => d.id === id) || null



  // Destinations plotted on the map: the user's selection, resolved to the

  // catalog rows (real backend coordinates). Optimized route, when present, wins.

  const mapDestinations = selectedRouteDestIds.map((id) => catalogById(id)).filter(Boolean)

  const currentQuestion = questions[step]

  const answeredCount = questions.filter((q) => selectedOptionIds[q.id] !== undefined).length



  if (loading) {

    return (

      <div className="content page-shell">

        <p style={{ fontSize: 13, color: 'hsl(var(--muted))', marginBottom: 12 }}>Loading your travel questions...</p>

        <div style={{ display: 'grid', gap: 20 }}>

          <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />

          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />

        </div>

      </div>

    )

  }



  if (error) {

    return (

      <div className="content page-shell">

        <div className="alert" style={{ background: 'hsl(var(--coral-soft) / 0.4)', padding: 18, borderRadius: 12 }}>

          <strong>Travel Connection Issue</strong>

          <p style={{ margin: '4px 0 12px', fontSize: 13 }}>{error}</p>

          <button className="button button-quiet" onClick={loadInitialTravelData}>Retry</button>

        </div>

      </div>

    )

  }



  return (

    <div className="content page-shell">

      {/* Exploratory Hero Header */}

      <div

        className="module-hero"

        style={{

          marginBottom: 28,

          background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sky-soft) / 0.3))',

          padding: 28,

          borderRadius: 16,

          border: '1px solid hsl(var(--line))',

        }}

      >

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>

          <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>Signature Feature · Sabbatical & Rest</p>

          <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>Powered by Spring Boot Travel Engine</span>

        </div>

        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Restorative Travel & Sabbaticals</h1>

        <p className="subtitle" style={{ maxWidth: 680, color: 'hsl(var(--ink) / 0.85)', lineHeight: 1.6 }}>

          Discover biologically restorative sanctuaries tailored to your nervous-system state. Complete the questionnaire to receive ranked recommendations and optimize multi-destination itineraries.

        </p>

      </div>



      {/* Single Personal Recommendation Spotlight if available */}

      {singleRecommendation && (

        <div

          className="card card-pad"

          style={{

            marginBottom: 28,

            border: '1.5px solid hsl(var(--sage-dark))',

            background: 'hsl(var(--paper-warm))',

            padding: 22,

            borderRadius: 16,

          }}

        >

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>

            <span className="badge-pill badge-calm" style={{ fontWeight: 700 }}>

              🌟 Personal Haven Match (Latest Mood & Preferences)

            </span>

          </div>

          {getDestinationImage(singleRecommendation.destination, singleRecommendation.imageUrl) && (

            <img

              src={getDestinationImage(singleRecommendation.destination, singleRecommendation.imageUrl)}

              alt={singleRecommendation.destination}

              loading="lazy"

              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}

            />

          )}

          <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>{singleRecommendation.destination}</h2>

          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'hsl(var(--ink))', lineHeight: 1.5 }}>

            {singleRecommendation.description}

          </p>

          {singleRecommendation.reason && (

            <div style={{ padding: '8px 12px', background: 'hsl(var(--paper))', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>

              <strong>Why it matches you:</strong> {singleRecommendation.reason}

            </div>

          )}

          <button

            type="button"

            className="button button-primary"

            style={{ fontSize: 11 }}

            disabled={!singleRecommendation.destinationId}

            onClick={() => handleOpenDestinationDetail(singleRecommendation.destinationId)}

          >

            View Details →

          </button>

        </div>

      )}



      {/* Questionnaire Section */}

      <section className="card card-pad" style={{ marginBottom: 32, padding: 24 }}>

        <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Travel Questionnaire</h2>

        <p className="card-caption" style={{ margin: '0 0 20px', fontSize: 12, color: 'hsl(var(--muted))' }}>

          Select your preferences to query the Spring Boot recommendation engine

        </p>



        {questionsError ? (

          <div role="alert" style={{ padding: 16, borderRadius: 10, background: 'hsl(var(--coral-soft) / 0.4)', fontSize: 13 }}>

            <strong>Could not load the travel questionnaire.</strong>

            <p style={{ margin: '4px 0 10px' }}>{questionsError}</p>

            <button type="button" className="button button-quiet" onClick={loadInitialTravelData}>Retry</button>

          </div>

        ) : questions.length === 0 ? (

          <div role="alert" style={{ padding: 16, borderRadius: 10, background: 'hsl(var(--paper-warm))', fontSize: 13, lineHeight: 1.5 }}>

            <strong>The questionnaire is empty in the database.</strong>

            <p style={{ margin: '4px 0 10px' }}>

              The backend answered successfully but returned no active rows from <code>travel_questions</code>.

              Spring Boot seeds them from <code>database/seed/01_travel_questions.sql</code> on startup; if that was

              disabled or failed, apply the file to the same PostgreSQL database the backend uses and reload.

            </p>

            <button type="button" className="button button-quiet" onClick={loadInitialTravelData}>Reload questions</button>

          </div>

        ) : (

          <form onSubmit={handleSubmitQuestionnaire}>

            {/* Progress */}

            <div style={{ marginBottom: 16 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'hsl(var(--muted))', marginBottom: 6 }}>

                <span>Question {step + 1} of {questions.length}</span>

                <span>{answeredCount} answered</span>

              </div>

              <div style={{ height: 6, borderRadius: 3, background: 'hsl(var(--line))', overflow: 'hidden' }}>

                <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: '100%', background: 'hsl(var(--sage-dark))', transition: 'width .25s ease' }} />

              </div>

            </div>



            {currentQuestion && (

              <div key={currentQuestion.id} style={{ marginBottom: 22 }}>

                <label style={{ display: 'block', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>

                  {currentQuestion.questionText}

                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>

                  {(currentQuestion.options || []).map((opt) => {

                    const isSelected = selectedOptionIds[currentQuestion.id] === opt.id

                    return (

                      <button

                        key={opt.id}

                        type="button"

                        aria-pressed={isSelected}

                        onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}

                        style={{

                          textAlign: 'left',

                          padding: '12px 14px',

                          borderRadius: 10,

                          border: isSelected ? '2px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',

                          background: isSelected ? 'hsl(var(--sage-soft) / 0.5)' : 'hsl(var(--paper))',

                          cursor: 'pointer',

                        }}

                      >

                        <strong style={{ display: 'block', fontSize: 13, color: isSelected ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))' }}>

                          {isSelected ? '✓ ' : ''}{opt.label}

                        </strong>

                      </button>

                    )

                  })}

                  {(currentQuestion.options || []).length === 0 && (

                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>No answer options are configured for this question in the database.</span>

                  )}

                </div>

              </div>

            )}



            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

              <button

                type="button"

                className="button button-quiet"

                disabled={step === 0}

                onClick={() => setStep((n) => Math.max(0, n - 1))}

              >

                ← Previous

              </button>

              {step < questions.length - 1 ? (

                <button type="button" className="button button-primary" onClick={() => setStep((n) => Math.min(questions.length - 1, n + 1))}>

                  Next →

                </button>

              ) : (

                <button type="submit" className="button button-primary" disabled={submittingAnswers || answeredCount === 0} style={{ padding: '10px 22px' }}>

                  {submittingAnswers ? 'Finding Matches...' : 'Find My Destinations'}

                </button>

              )}

              {step < questions.length - 1 && answeredCount > 0 && (

                <button type="submit" className="button button-quiet" disabled={submittingAnswers} style={{ marginLeft: 'auto', fontSize: 12 }}>

                  {submittingAnswers ? 'Finding Matches...' : 'Skip to results'}

                </button>

              )}

            </div>

          </form>

        )}

      </section>



      {/* Recommended Destinations Feed */}

      {recommendations.length > 0 && (

        <section id="recommendations-section" style={{ marginBottom: 32 }}>

          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Ranked Sabbatical Recommendations</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>

            {recommendations.map((rec, idx) => {

              const cat = catalogById(rec.destinationId)

              const img = getDestinationImage(rec.destination, rec.imageUrl)

              const hasCoords = Number.isFinite(rec.latitude) && Number.isFinite(rec.longitude)

              return (

                <div key={rec.destinationId || idx} className="card card-pad" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                  <div>

                    {img && (

                      <img

                        src={img}

                        alt={rec.destination}

                        loading="lazy"

                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}

                      />

                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>

                      <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>Match #{idx + 1}</span>

                      <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{rec.location}</span>

                    </div>

                    <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{rec.destination}</h3>

                    {cat && (

                      <p style={{ margin: '0 0 8px', fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>

                        {[cat.category, cat.budgetLevel && `Budget: ${cat.budgetLevel}`, cat.duration && `Duration: ${cat.duration}`].filter(Boolean).join(' · ')}

                      </p>

                    )}

                    <p style={{ margin: '0 0 10px', fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.4 }}>

                      {rec.description}

                    </p>

                    {Array.isArray(rec.activities) && rec.activities.length > 0 && (

                      <p style={{ margin: '0 0 8px', fontSize: 11 }}>

                        <strong>Activities:</strong> {rec.activities.join(', ')}

                      </p>

                    )}

                    {rec.reason && (

                      <p style={{ fontSize: 11, fontStyle: 'italic', color: 'hsl(var(--sage-dark))' }}>

                        Why: {rec.reason}

                      </p>

                    )}

                    {!hasCoords && (

                      <p style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>Map information not available.</p>

                    )}

                  </div>



                  <div style={{ marginTop: 16, display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>

                    <button

                      type="button"

                      className="button button-primary"

                      style={{ flex: 1, fontSize: 11 }}

                      disabled={!rec.destinationId}

                      title={rec.destinationId ? 'View full destination details' : 'Details are not available for this destination'}

                      onClick={() => handleOpenDestinationDetail(rec.destinationId)}

                    >

                      View Details

                    </button>

                    <button

                      type="button"

                      className="button button-quiet"

                      style={{ fontSize: 11 }}

                      disabled={!rec.destinationId}

                      onClick={() => handleToggleRouteDestination(rec.destinationId)}

                    >

                      {selectedRouteDestIds.includes(rec.destinationId) ? '✓ In Route' : '+ Add Route'}

                    </button>

                  </div>

                </div>

              )

            })}

          </div>

        </section>

      )}



      {/* Route Optimization & Interactive Map Section */}

      <section id="travel-map-section" className="card card-pad" style={{ marginBottom: 32, padding: 24 }}>

        <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Destination Map & Route Optimizer</h2>

        <p className="card-caption" style={{ margin: '0 0 16px', fontSize: 12, color: 'hsl(var(--muted))' }}>

          Pick two or more destinations. WorkBloom orders them with a nearest-neighbour heuristic over great-circle (Haversine) distance.

        </p>



        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>

          <span style={{ fontSize: 12, fontWeight: 600 }}>Selected Destinations ({selectedRouteDestIds.length}):</span>

          {selectedRouteDestIds.map((id) => {

            const destObj = catalogById(id)

            return (

              <span

                key={id}

                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 4px 3px 10px', borderRadius: 16, background: 'hsl(var(--sage-soft))', color: 'hsl(var(--sage-dark))', fontSize: 11, fontWeight: 700 }}

              >

                {destObj ? destObj.name : `ID #${id}`}

                <button

                  type="button"

                  className="button button-quiet"

                  style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12 }}

                  onClick={() => handleOpenDestinationDetail(id)}

                  aria-label={`View details for ${destObj ? destObj.name : `destination ${id}`}`}

                >

                  View Details

                </button>

                <button

                  type="button"

                  className="button button-quiet"

                  style={{ fontSize: 10, padding: '2px 7px', borderRadius: 12 }}

                  onClick={() => handleToggleRouteDestination(id)}

                  aria-label="Remove from route"

                  title="Remove from route"

                >

                  ✕

                </button>

              </span>

            )

          })}



          <button

            className="button button-primary"

            onClick={handleOptimizeRoute}

            disabled={routeLoading || selectedRouteDestIds.length < 2}

            style={{ marginLeft: 'auto', fontSize: 12 }}

          >

            {routeLoading ? 'Optimizing…' : 'Optimize destination order'}

          </button>

        </div>



        {routePlan && (

          <div style={{ marginBottom: 12, fontSize: 12 }}>

            <strong>Optimized order:</strong>{' '}

            {routePlan.points.map((p, i) => (

              <span key={p.destinationId ?? i}>

                {i > 0 && ' → '}

                <button

                  type="button"

                  onClick={() => p.destinationId && handleOpenDestinationDetail(p.destinationId)}

                  disabled={!p.destinationId}

                  title="View details"

                  style={{ all: 'unset', cursor: p.destinationId ? 'pointer' : 'default', textDecoration: p.destinationId ? 'underline dotted' : 'none', color: 'hsl(var(--sage-dark))', fontWeight: 600 }}

                >

                  {p.name}

                </button>

              </span>

            ))}

            {Number.isFinite(routePlan.totalDistanceKm) && (

              <span style={{ color: 'hsl(var(--muted))' }}>

                {' '}· ≈ {Math.round(routePlan.totalDistanceKm).toLocaleString()} km straight-line total

              </span>

            )}

          </div>

        )}



        <TravelMap

          destinations={mapDestinations}

          route={routePlan?.points || null}

          selectedDestination={mapFocusId}

          onViewDetails={handleOpenDestinationDetail}

        />

      </section>



      {/* Destination Catalog Section */}

      <section style={{ marginBottom: 28 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>

          <div>

            <h2 style={{ fontSize: 22, margin: 0 }}>Destination Catalog</h2>

            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>Explore all curated sanctuaries from Spring Boot</p>

          </div>



          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

            {/* Real DestinationCategory enum values (backend/.../travel/entity/DestinationCategory.java) -

                the previous list ('MOUNTAIN', 'FOREST', 'WELLNESS_RETREAT') didn't match the actual enum,

                causing a 400 Bad Request on every filter click. */}

            {[

              { value: '', label: 'All Categories' },

              { value: 'NATURE', label: 'Nature' },

              { value: 'MOUNTAINS', label: 'Mountains' },

              { value: 'BEACH', label: 'Beach' },

              { value: 'HERITAGE', label: 'Heritage' },

              { value: 'CULTURAL', label: 'Cultural' },

              { value: 'ADVENTURE', label: 'Adventure' },

              { value: 'RELAXATION', label: 'Relaxation' },

              { value: 'SPIRITUAL', label: 'Spiritual' },

              { value: 'CITY', label: 'City' },

            ].map(({ value: cat, label }) => (

              <button

                key={cat}

                className={`button ${selectedCategory === cat ? 'button-primary' : 'button-quiet'}`}

                style={{ fontSize: 11, padding: '4px 10px' }}

                onClick={() => handleCategoryFilter(cat)}

              >

                {label}

              </button>

            ))}

          </div>

        </div>



        {catalogError && (

          <div role="alert" style={{ padding: 12, borderRadius: 10, background: 'hsl(var(--coral-soft) / 0.4)', fontSize: 13, marginBottom: 12 }}>

            Could not load destinations: {catalogError}

          </div>

        )}

        {!catalogError && allDestinations.length === 0 && (

          <p style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>No destinations found{selectedCategory ? ' in this category' : ' in the database'}.</p>

        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>

          {allDestinations.map((d) => (

            <div key={d.id} className="card card-pad" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

              <div>

                {getDestinationImage(d.name, d.imageUrl) && (

                  <img

                    src={getDestinationImage(d.name, d.imageUrl)}

                    alt={d.name}

                    loading="lazy"

                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}

                  />

                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>

                  <span style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 700 }}>{d.category || 'Uncategorised'}</span>

                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{d.location}</span>

                </div>

                <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{d.name}</h3>

                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'hsl(var(--muted))', lineHeight: 1.4 }}>

                  {d.description ? (d.description.length > 100 ? `${d.description.slice(0, 98)}...` : d.description) : ''}

                </p>

              </div>



              <div style={{ marginTop: 12, display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>

                <button

                  type="button"

                  className="button button-quiet"

                  style={{ flex: 1, fontSize: 11 }}

                  onClick={() => handleOpenDestinationDetail(d.id)}

                >

                  View Details

                </button>

                <button

                  type="button"

                  className="button button-primary"

                  style={{ fontSize: 11 }}

                  onClick={() => handleToggleRouteDestination(d.id)}

                >

                  {selectedRouteDestIds.includes(d.id) ? '✓ Added' : '+ Add Route'}

                </button>

              </div>

            </div>

          ))}

        </div>

      </section>



      {/* Destination Detail Modal */}

      {detailModal && createPortal(


      <div
        className="travel-detail-backdrop"
        onClick={() => setDetailModal(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'rgba(20, 35, 28, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="travel-detail-modal"
          style={{
            position: 'relative',
            zIndex: 100000,
            width: '100%',
            maxWidth: '560px',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
            padding: '24px',
            background: 'hsl(var(--paper))',
            color: 'hsl(var(--ink))',
            borderRadius: '16px',
            border: '1px solid hsl(var(--line))',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            transform: 'none',
            filter: 'none',
            animation: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >

            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

              <h2 style={{ margin: 0, fontSize: 20 }}>Sanctuary Details</h2>

              <button className="modal-close-btn" onClick={() => setDetailModal(false)}>✕</button>

            </div>



            {detailError ? (

              <div role="alert" style={{ padding: 16, fontSize: 13 }}>{detailError}</div>

            ) : !activeDestination ? (

              <div style={{ padding: 20, textAlign: 'center' }}>

                <div className="skeleton" style={{ height: 180, borderRadius: 12 }} />

              </div>

            ) : (

              (() => {

                const d = activeDestination

                const localImg = getDestinationImage(d.name, null)

                const hero = localImg || d.imageUrl

                const hasCoords = Number.isFinite(d.latitude) && Number.isFinite(d.longitude)

                const rows = [

                  ['Category', d.category],

                  ['Environment', d.environment],

                  ['Budget Level', d.budgetLevel],

                  ['Duration', d.duration],

                  ['Best Time to Visit', d.bestTimeToVisit],

                  ['Activities', Array.isArray(d.activities) && d.activities.length ? d.activities.join(', ') : null],

                  ['Latitude', hasCoords ? d.latitude.toFixed(4) : null],

                  ['Longitude', hasCoords ? d.longitude.toFixed(4) : null],

                ]

                const rec = recommendations.find((r) => r.destinationId === d.id)

                return (

                  <div>

                    {hero && (

                      <img

                        src={hero}

                        alt={d.name}

                        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}

                      />

                    )}



                    <h3 style={{ margin: '0 0 4px', fontSize: 22 }}>{d.name}</h3>

                    <p style={{ margin: '0 0 12px', fontSize: 13, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>

                      📍 {d.location || [d.city, d.state, d.country].filter(Boolean).join(', ') || 'Location not available'}

                    </p>



                    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--ink))', marginBottom: 16 }}>

                      {d.description}

                    </p>



                    {rec?.reason && (

                      <p style={{ fontSize: 12, fontStyle: 'italic', color: 'hsl(var(--sage-dark))', marginBottom: 12 }}>

                        Why it matches you: {rec.reason}

                      </p>

                    )}



                    <div className="detail-list" style={{ display: 'grid', gap: 8, fontSize: 12, marginBottom: 16 }}>

                      {rows.map(([label, value]) => (

                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 10px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 6 }}>

                          <span style={{ color: 'hsl(var(--muted))' }}>{label}</span>

                          <strong style={{ textAlign: 'right' }}>{value || 'Not available'}</strong>

                        </div>

                      ))}

                    </div>



                    {!localImg && destinationImages.length > 1 && (

                      <div style={{ marginBottom: 16 }}>

                        <strong style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>Gallery Images:</strong>

                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>

                          {destinationImages.map((img, i) => (

                            <img

                              key={img.id ?? i}

                              src={img.imageUrl || img.url}

                              alt={img.altText || `${d.name} gallery ${i + 1}`}

                              style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}

                            />

                          ))}

                        </div>

                      </div>

                    )}



                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>

                      <button className="button button-quiet" onClick={() => setDetailModal(false)}>Close</button>

                      <button

                        className="button button-quiet"

                        disabled={!hasCoords}

                        title={hasCoords ? '' : 'No valid coordinates for this destination'}

                        onClick={() => handleViewOnMap(d)}

                      >

                        View on Map

                      </button>

                      <button

                        className="button button-primary"

                        onClick={() => {

                          if (!selectedRouteDestIds.includes(d.id)) {

                            setRoutePlan(null)

                            setSelectedRouteDestIds((prev) => [...prev, d.id])

                          }

                          setDetailModal(false)

                          addToast(`Added ${d.name} to route plan.`)

                        }}

                      >

                        Add to Route Plan

                      </button>

                    </div>

                  </div>

                )

              })()

            )}

          </div>

        </div>

      , document.body)}

    </div>

  )

}
