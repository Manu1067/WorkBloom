// API client for the real Spring Boot backend (backend/src/main/java/com/workbloom).
//
// This is deliberately SEPARATE from src/api.js, which talks to the
// server-api.js Node mock via '/api'. Requests here go to '/spring-api',
// proxied by vite.config.js to http://localhost:8080/api - see
// docs/SETUP.md and docs/TRAVEL_SETUP.md.
//
// Use this when you want the real, persisted, PostgreSQL-backed Travel
// data (destinations/questions/recommendations/routes) instead of the
// richer but non-persistent server-api.js mock. See the note in
// TravelView.jsx about which flow is currently wired up by default.

import { getToken } from './api'

const SPRING_API_BASE = '/spring-api'

export const springApiRequest = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${SPRING_API_BASE}${path}`, { ...options, headers })
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = body?.message || `Spring backend request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.body = body
    throw error
  }
  return body
}

export const springTravel = {
  // GET /api/travel/questions
  getQuestions: () => springApiRequest('/travel/questions'),

  // GET /api/travel/destinations?category=
  listDestinations: (category) =>
    springApiRequest(`/travel/destinations${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  getDestination: (id) => springApiRequest(`/travel/destinations/${id}`),

  getDestinationImages: (id) => springApiRequest(`/travel/destinations/${id}/images`),

  // GET /api/travel/preferences?employeeId=
  getPreferences: (employeeId) => springApiRequest(`/travel/preferences?employeeId=${employeeId}`),

  // POST /api/travel/preferences?employeeId=
  savePreferences: (employeeId, data) =>
    springApiRequest(`/travel/preferences?employeeId=${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/travel/recommend?employeeId=  -> single best match
  recommend: (employeeId) => springApiRequest(`/travel/recommend?employeeId=${employeeId}`),

  // GET /api/travel/recommend/all?employeeId=  -> every destination, scored (no answers required)
  recommendAll: (employeeId) => springApiRequest(`/travel/recommend/all?employeeId=${employeeId}`),

  // POST /api/travel/recommendations  -> ranked list from selected question option IDs
  recommendFromAnswers: (employeeId, selectedOptionIds) =>
    springApiRequest('/travel/recommendations', {
      method: 'POST',
      body: JSON.stringify({ employeeId, selectedOptionIds }),
    }),

  // POST /api/travel/routes/optimize  -> body is a plain array of destination IDs
  optimizeRoute: (destinationIds) =>
    springApiRequest('/travel/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(destinationIds),
    }),
}

export const springAi = {
  // POST /api/ai/wellness/analyze?employeeId=
  analyzeWellness: (employeeId, data) =>
    springApiRequest(`/ai/wellness/analyze?employeeId=${employeeId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/**
 * Adapts a Spring `/travel/recommend/all` response (List<TravelRecommendationResponse>)
 * into the destination-card shape TravelView.jsx's gallery already renders:
 * { id, name, country, description, activities, theme, matchScore, imageUrl,
 *   latitude, longitude, location }.
 *
 * `matchScore` here is real - computed by DestinationMatchEngine from the
 * employee's actual mood/wellness/preferences against real destination
 * fields (see docs/TRAVEL_SETUP.md) - never a fabricated number.
 */
export function adaptSpringRecommendationsToDestinationCards(recommendations) {
  return (recommendations || []).map((r) => ({
    id: r.destinationId,
    name: r.destination,
    country: 'India',
    description: r.description,
    activities: r.activities,
    theme: r.reason,
    matchScore: r.matchScore,
    imageUrl: r.imageUrl,
    latitude: r.latitude,
    longitude: r.longitude,
    location: r.location,
  }))
}

/**
 * Adapts a Spring `/travel/routes/optimize` response
 * ({ points: [{ destinationId, name, location, latitude, longitude, order }], totalDistanceKm })
 * into the `routePlan` shape RouteMap.jsx / TravelView.jsx already render
 * ({ waypoints: [{ id, name, label, coords: { lat, lng }, restAction }], ... }).
 *
 * This is a drop-in adapter, not a like-for-like replacement: Spring's
 * route has no concept of intermediate "rest stop" waypoints (it only
 * reorders the destinations you gave it), so every point here is either
 * the origin, the destination, or one of your other chosen stops - never
 * a generated rest stop. `restScore` and `sceneryNotes` don't exist in
 * the Spring response, so reasonable static defaults are used instead of
 * inventing numbers the backend never computed.
 */
export function adaptSpringRouteToRoutePlan(springRouteResponse) {
  const points = springRouteResponse?.points || []

  return {
    origin: points[0]?.name || '',
    destination: points[points.length - 1]?.name || '',
    totalDistanceKm: springRouteResponse?.totalDistanceKm,
    restScore: null, // not computed by the Spring backend - see docs/ROUTE_ALGORITHM.md
    sceneryNotes: null,
    optimizedRoute: points.map((p) => p.name),
    waypoints: points.map((p, index) => ({
      id: String(p.destinationId),
      name: p.name,
      label: index === 0 ? 'Origin' : index === points.length - 1 ? 'Destination' : `Stop ${index}`,
      type: index === 0 ? 'origin' : index === points.length - 1 ? 'destination' : 'waypoint',
      coords: { lat: p.latitude, lng: p.longitude },
      restAction: p.location || '',
    })),
  }
}
