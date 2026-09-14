import { useState, useEffect, useRef } from 'react'
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

// Internal tracking identifier required by Google Maps Platform guidelines
const USAGE_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio'

/**
 * Inner Google Maps canvas renderer that manages polylines, viewport framing, and markers
 */
function GoogleMapsRouteRenderer({ routePlan, selectedWaypoint, onSelectWaypoint }) {
  const map = useMap()
  const routesLib = useMapsLibrary('routes')
  const polylinesRef = useRef([])

  useEffect(() => {
    if (!map || !routePlan || !routePlan.waypoints || routePlan.waypoints.length === 0) return

    // Clean up any existing polylines
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    const validWaypoints = routePlan.waypoints.filter((w) => w.coords && typeof w.coords.lat === 'number')
    if (validWaypoints.length < 2) return

    // Try computing routes via modern Routes API if origin and dest strings or coords are present
    if (routesLib && routesLib.Route && routePlan.origin && routePlan.destination) {
      try {
        const originCoord = validWaypoints[0].coords
        const destCoord = validWaypoints[validWaypoints.length - 1].coords

        const request = {
          origin: { lat: originCoord.lat, lng: originCoord.lng },
          destination: { lat: destCoord.lat, lng: destCoord.lng },
          travelMode: 'DRIVING',
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
        }

        routesLib.Route.computeRoutes(request)
          .then(({ routes }) => {
            if (routes && routes.length > 0) {
              const primaryRoute = routes[0]
              const newPolylines = primaryRoute.createPolylines()
              newPolylines.forEach((poly) => {
                poly.setOptions({
                  strokeColor: '#3a6652', // Soothing sage green
                  strokeWeight: 6,
                  strokeOpacity: 0.85,
                })
                poly.setMap(map)
              })
              polylinesRef.current = newPolylines

              if (primaryRoute.viewport) {
                map.fitBounds(primaryRoute.viewport)
                return
              }
            }
            // Fallback to direct path if no route found
            drawDirectPath()
          })
          .catch(() => {
            drawDirectPath()
          })
      } catch {
        drawDirectPath()
      }
    } else {
      drawDirectPath()
    }

    function drawDirectPath() {
      // Connect restorative waypoints with styled geodesic polyline
      const pathCoords = validWaypoints.map((w) => ({ lat: w.coords.lat, lng: w.coords.lng }))
      const fallbackPolyline = new window.google.maps.Polyline({
        path: pathCoords,
        geodesic: true,
        strokeColor: '#2f5745',
        strokeOpacity: 0.85,
        strokeWeight: 5,
      })
      fallbackPolyline.setMap(map)
      polylinesRef.current = [fallbackPolyline]

      // Adjust viewport to encapsulate all waypoints
      const bounds = new window.google.maps.LatLngBounds()
      validWaypoints.forEach((w) => bounds.extend({ lat: w.coords.lat, lng: w.coords.lng }))
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
  }, [map, routesLib, routePlan])

  return (
    <>
      {routePlan?.waypoints?.map((wp, index) => {
        if (!wp.coords || typeof wp.coords.lat !== 'number') return null
        const isStart = index === 0
        const isEnd = index === routePlan.waypoints.length - 1
        const isSelected = selectedWaypoint?.id === wp.id

        return (
          <AdvancedMarker
            key={wp.id || index}
            position={{ lat: wp.coords.lat, lng: wp.coords.lng }}
            onClick={() => onSelectWaypoint(wp)}
            title={wp.name}
          >
            <Pin
              background={isStart ? '#3b82f6' : isEnd ? '#16a34a' : '#d97706'}
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={isSelected ? 1.3 : 1.0}
            />
          </AdvancedMarker>
        )
      })}
    </>
  )
}

/**
 * Built-in Visual Geospatial Route Map
 * Renders an interactive, responsive vector schematic map with curved routes,
 * elevation, restorative waypoints, and low-sensory pause intervals.
 */
function VisualGeospatialMap({ routePlan, selectedWaypoint, onSelectWaypoint }) {
  const waypoints = routePlan?.waypoints || [
    { id: 'start', name: 'Bengaluru, Karnataka', label: 'Origin', coords: { lat: 12.9716, lng: 77.5946 }, restAction: 'Depart with zero rush' },
    { id: 'wp1', name: 'Ghats Scenic Forest Corridor', label: 'Rest Stop 1', coords: { lat: 11.9, lng: 77.3 }, restAction: 'Breathe & natural light pause' },
    { id: 'wp2', name: 'Spice Plantation & Organic Farm Stand', label: 'Rest Stop 2', coords: { lat: 10.8, lng: 77.1 }, restAction: 'Herbal tea & gentle walking stretch' },
    { id: 'dest', name: routePlan?.destination || 'Munnar Tea Sanctuary, India', label: 'Destination', coords: { lat: 10.0889, lng: 77.0595 }, restAction: 'Unplug and settle in' },
  ]

  // Calculate coordinates for schematic projection
  const width = 800
  const height = 360
  const pad = 60

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 14 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #edf3ef 0%, #e2ece5 100%)',
          display: 'block',
        }}
      >
        <defs>
          {/* Subtle topological contour grid */}
          <pattern id="topoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(42, 77, 60, 0.06)" strokeWidth="1" />
            <circle cx="20" cy="20" r="1.5" fill="rgba(42, 77, 60, 0.12)" />
          </pattern>

          {/* Route path gradient */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="35%" stopColor="#2e7d58" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="routeGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1b4332" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#topoGrid)" />

        {/* Ambient Topo Curves */}
        <path
          d="M -50 180 Q 200 80 400 200 T 850 160"
          fill="none"
          stroke="rgba(46, 125, 88, 0.15)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M -50 260 Q 250 140 500 280 T 850 220"
          fill="none"
          stroke="rgba(46, 125, 88, 0.1)"
          strokeWidth="32"
          strokeLinecap="round"
        />

        {/* Waypoints Path Coordinates */}
        {(() => {
          const stepX = (width - pad * 2) / Math.max(1, waypoints.length - 1)
          const points = waypoints.map((wp, i) => {
            const x = pad + i * stepX
            // Gentle undulation for terrain simulation
            const y = height / 2 + Math.sin(i * 1.5) * 45 + (i % 2 === 0 ? -15 : 20)
            return { x, y, wp }
          })

          const dPath = points.reduce((acc, pt, i) => {
            if (i === 0) return `M ${pt.x} ${pt.y}`
            const prev = points[i - 1]
            const cx1 = (prev.x + pt.x) / 2
            const cy1 = prev.y
            const cx2 = (prev.x + pt.x) / 2
            const cy2 = pt.y
            return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`
          }, '')

          return (
            <>
              {/* Route Shadow & Buffer */}
              <path d={dPath} fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="12" strokeLinecap="round" />
              {/* Main Restorative Route Polyline */}
              <path
                d={dPath}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#routeGlow)"
              />

              {/* Waypoint Markers */}
              {points.map(({ x, y, wp }, i) => {
                const isStart = i === 0
                const isEnd = i === points.length - 1
                const isSelected = selectedWaypoint?.id === wp.id
                const markerColor = isStart ? '#3b82f6' : isEnd ? '#15803d' : '#d97706'

                return (
                  <g
                    key={wp.id || i}
                    onClick={() => onSelectWaypoint(wp)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {/* Ripple on active/selected */}
                    {isSelected && (
                      <circle cx={x} cy={y} r="22" fill={markerColor} opacity="0.2">
                        <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Base Pin Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 11}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Step Number or Icon */}
                    <text
                      x={x}
                      y={y + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {isStart ? 'A' : isEnd ? 'B' : i}
                    </text>

                    {/* Waypoint Label Box */}
                    <g transform={`translate(${x}, ${y + (i % 2 === 0 ? -28 : 26)})`}>
                      <rect
                        x="-65"
                        y="-12"
                        width="130"
                        height="24"
                        rx="6"
                        fill="rgba(255, 255, 255, 0.95)"
                        stroke={isSelected ? markerColor : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isSelected ? 1.5 : 1}
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight={isSelected ? '700' : '600'}
                        fill="#1f2937"
                        fontFamily="system-ui, sans-serif"
                      >
                        {wp.name.length > 20 ? `${wp.name.slice(0, 18)}...` : wp.name}
                      </text>
                    </g>
                  </g>
                )
              })}
            </>
          )
        })()}
      </svg>

      {/* Floating Map Watermark & Attribution */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 12,
          fontSize: 10,
          color: 'rgba(30, 41, 59, 0.65)',
          background: 'rgba(255, 255, 255, 0.75)',
          padding: '2px 8px',
          borderRadius: 4,
          backdropFilter: 'blur(4px)',
        }}
      >
        WorkBloom Restorative Route Mapping
      </div>
    </div>
  )
}

/**
 * Main RouteMap Component
 * Seamlessly integrates Google Maps Platform with fallback visual map and demo-key setup guide.
 */
export function RouteMap({ routePlan }) {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const [apiKey, setApiKey] = useState(envKey)
  const [customKeyInput, setCustomKeyInput] = useState('')
  const [showKeyPrompt, setShowKeyPrompt] = useState(false)
  const [useLiveGmp, setUseLiveGmp] = useState(Boolean(envKey))
  const [selectedWaypoint, setSelectedWaypoint] = useState(null)

  useEffect(() => {
    if (routePlan?.waypoints?.[0]) {
      setSelectedWaypoint(routePlan.waypoints[0])
    }
  }, [routePlan])

  const handleApplyCustomKey = (e) => {
    e.preventDefault()
    if (customKeyInput.trim()) {
      setApiKey(customKeyInput.trim())
      setUseLiveGmp(true)
      setShowKeyPrompt(false)
    }
  }

  return (
    <div
      style={{
        background: 'hsl(var(--paper))',
        border: '1px solid hsl(var(--line))',
        borderRadius: 16,
        padding: 18,
        marginTop: 18,
        boxShadow: '0 4px 16px -6px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Map Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span className="badge-pill badge-calm" style={{ fontSize: 11, fontWeight: 700 }}>
              🗺️ {useLiveGmp && apiKey ? 'Google Maps Platform (Live Engine)' : 'Restorative Route Map'}
            </span>
            {routePlan?.restScore && (
              <span style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
                Rest Score: {routePlan.restScore}/100
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'hsl(var(--ink))' }}>
            Optimized Rest Journey: {routePlan?.origin || 'Origin'} → {routePlan?.destination || 'Destination'}
          </h3>
        </div>

        {/* Engine Toggle / Demo Key Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {apiKey ? (
            <button
              type="button"
              className={`button ${useLiveGmp ? 'button-primary' : 'button-quiet'}`}
              style={{ fontSize: 11, padding: '5px 12px' }}
              onClick={() => setUseLiveGmp(!useLiveGmp)}
            >
              {useLiveGmp ? '✓ Google Maps Active' : 'Switch to Google Maps'}
            </button>
          ) : (
            <button
              type="button"
              className="button button-quiet"
              style={{ fontSize: 11, padding: '5px 12px' }}
              onClick={() => setShowKeyPrompt(!showKeyPrompt)}
            >
              🔑 Enable Live Google Maps
            </button>
          )}

          <a
            href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
            target="_blank"
            rel="noopener noreferrer"
            className="button button-quiet"
            style={{ fontSize: 11, padding: '5px 12px', textDecoration: 'none' }}
          >
            Get Free Maps Demo Key ↗
          </a>
        </div>
      </div>

      {/* Key input drawer if requested */}
      {showKeyPrompt && !apiKey && (
        <form
          onSubmit={handleApplyCustomKey}
          style={{
            marginBottom: 14,
            padding: 14,
            borderRadius: 12,
            background: 'hsl(var(--paper-warm))',
            border: '1px solid hsl(var(--sage) / 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: 'hsl(var(--ink))' }}>
            <strong>Connect Google Maps Platform:</strong> For rapid prototyping with zero billing or GCP account setup, generate a free{' '}
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}
            >
              Maps Demo Key
            </a>{' '}
            and paste it below, or add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your environment.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Paste AIza... Google Maps API or Demo Key"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--line))' }}
            />
            <button type="submit" className="button button-primary" style={{ fontSize: 12 }}>
              Activate Map
            </button>
            <button
              type="button"
              className="button button-quiet"
              style={{ fontSize: 12 }}
              onClick={() => setShowKeyPrompt(false)}
            >
              Close
            </button>
          </div>
        </form>
      )}

      {/* Map Canvas Viewport with explicit height */}
      <div
        style={{
          width: '100%',
          height: 380,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid hsl(var(--line))',
          position: 'relative',
        }}
      >
        {useLiveGmp && apiKey ? (
          <APIProvider apiKey={apiKey} solutionChannel="GMP_aistudio">
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={
                routePlan?.originCoords || { lat: 12.9716, lng: 77.5946 }
              }
              defaultZoom={7}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              fullscreenControl={true}
              internalUsageAttributionIds={[USAGE_ATTRIBUTION_ID]}
            >
              <GoogleMapsRouteRenderer
                routePlan={routePlan}
                selectedWaypoint={selectedWaypoint}
                onSelectWaypoint={setSelectedWaypoint}
              />
            </Map>
          </APIProvider>
        ) : (
          <VisualGeospatialMap
            routePlan={routePlan}
            selectedWaypoint={selectedWaypoint}
            onSelectWaypoint={setSelectedWaypoint}
          />
        )}
      </div>

      {/* Active Waypoint Detail Card */}
      {selectedWaypoint && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            background: 'hsl(var(--canvas) / 0.6)',
            border: '1px solid hsl(var(--line) / 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="badge-pill" style={{ fontSize: 10, fontWeight: 700 }}>
                {selectedWaypoint.type === 'origin'
                  ? '🛫 Departure'
                  : selectedWaypoint.type === 'destination'
                  ? '🏁 Arrival Haven'
                  : '🌿 Restorative Waypoint'}
              </span>
              <strong style={{ fontSize: 13, color: 'hsl(var(--ink))' }}>
                {selectedWaypoint.name}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'hsl(var(--muted))', lineHeight: 1.4 }}>
              {selectedWaypoint.restAction || selectedWaypoint.label}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11 }}>
            {selectedWaypoint.recommendedPauseMinutes > 0 && (
              <span>
                ⏱️ <strong>{selectedWaypoint.recommendedPauseMinutes} min</strong> pause
              </span>
            )}
            {selectedWaypoint.coords && (
              <span style={{ color: 'hsl(var(--sage-dark))', fontFamily: 'monospace' }}>
                📍 {selectedWaypoint.coords.lat?.toFixed(2)}°, {selectedWaypoint.coords.lng?.toFixed(2)}°
              </span>
            )}
          </div>
        </div>
      )}

      {/* Waypoint Chips Navigator */}
      {routePlan?.waypoints && routePlan.waypoints.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {routePlan.waypoints.map((wp, idx) => {
            const isSelected = selectedWaypoint?.id === wp.id
            return (
              <button
                key={wp.id || idx}
                type="button"
                onClick={() => setSelectedWaypoint(wp)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid hsl(var(--sage-dark))' : '1px solid hsl(var(--line))',
                  background: isSelected ? 'hsl(var(--sage-soft) / 0.4)' : 'hsl(var(--paper))',
                  color: isSelected ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{idx === 0 ? '🛫' : idx === routePlan.waypoints.length - 1 ? '🏁' : '🍃'}</span>
                <span>{wp.name.length > 18 ? `${wp.name.slice(0, 16)}...` : wp.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
