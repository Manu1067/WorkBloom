import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * TravelMap - real interactive MapLibre GL JS map for the Travel module.
 *
 * Props (all data comes from the backend; nothing is hardcoded here):
 *   origin              optional { name, latitude, longitude }
 *   destinations        [{ id, name, location, latitude, longitude }]
 *   route               optional ordered [{ destinationId, name, location, latitude, longitude, order }]
 *                       (TravelRouteResponse.points). Drawn as a GeoJSON line.
 *   selectedDestination optional destination id (or object with id) to focus + open its popup
 *   height              map height in px (default 380)
 *
 * The route line joins stops with straight segments in the order chosen by
 * WorkBloom's nearest-neighbour optimizer. It is NOT a road/driving route.
 *
 * Tiles: OpenStreetMap standard raster tiles (development / demo use).
 * Override with VITE_MAP_TILE_URL, e.g. your own tile server. Tiles are
 * loaded on demand by MapLibre only - no bulk downloading or prefetching.
 */

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'

const ROUTE_SOURCE = 'travel-route'
const ROUTE_CASING = 'travel-route-casing'
const ROUTE_LINE = 'travel-route-line'

// Neutral world-ish view used only before any valid point is available.
const EMPTY_VIEW = { center: [0, 20], zoom: 1.2 }

export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

const toPoint = (item, extra = {}) => {
  if (!item) return null
  const lat = item.latitude ?? item.lat
  const lng = item.longitude ?? item.lng
  if (!isValidCoordinate(lat, lng)) return null
  return {
    id: item.destinationId ?? item.id ?? null,
    name: item.name || item.destination || 'Destination',
    location: item.location || '',
    lat,
    lng,
    order: item.order ?? null,
    ...extra,
  }
}

function buildPopupContent(point, onViewDetails) {
  // DOM nodes + textContent (never innerHTML) so backend text can't inject markup.
  const wrap = document.createElement('div')
  wrap.style.cssText = 'font-family:inherit;font-size:12px;line-height:1.4;max-width:220px;color:#1f2937'
  const title = document.createElement('strong')
  title.style.fontSize = '13px'
  title.textContent = point.order ? `${point.order}. ${point.name}` : point.name
  wrap.appendChild(title)
  if (point.location) {
    const loc = document.createElement('div')
    loc.textContent = point.location
    wrap.appendChild(loc)
  }
  const coords = document.createElement('div')
  coords.style.cssText = 'color:#6b7280;font-family:monospace;font-size:11px;margin-top:2px'
  coords.textContent = `${point.lat.toFixed(4)}°, ${point.lng.toFixed(4)}°`
  wrap.appendChild(coords)
  if (onViewDetails && point.id !== null && point.id !== undefined) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = 'View Details'
    btn.style.cssText = 'margin-top:8px;padding:5px 10px;border:0;border-radius:8px;background:#2f5745;color:#fff;font:600 12px system-ui,sans-serif;cursor:pointer'
    btn.addEventListener('click', () => onViewDetails(point.id))
    wrap.appendChild(btn)
  }
  return wrap
}

function buildMarkerElement(label, color, selected) {
  const el = document.createElement('div')
  const size = selected ? 34 : 28
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    'border-radius:50%',
    `background:${color}`,
    'border:3px solid #fff',
    'box-shadow:0 2px 6px rgba(0,0,0,.35)',
    'color:#fff',
    'font:700 12px system-ui,sans-serif',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'cursor:pointer',
  ].join(';')
  el.textContent = label
  return el
}

export function TravelMap({
  origin = null,
  destinations = [],
  route = null,
  selectedDestination = null,
  height = 380,
  onViewDetails = null,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map()) // key -> { marker, popup, point }
  const onViewDetailsRef = useRef(onViewDetails)
  onViewDetailsRef.current = onViewDetails // latest callback without re-creating markers
  const [styleReady, setStyleReady] = useState(false)
  const [mapError, setMapError] = useState(null)

  const selectedId =
    selectedDestination && typeof selectedDestination === 'object'
      ? selectedDestination.id
      : selectedDestination

  // Normalise props into validated points. Invalid coordinates are dropped
  // (never given a fake marker) and reported in the UI below the map.
  const { routePoints, stopPoints, originPoint, missing } = useMemo(() => {
    const rawRoute = Array.isArray(route) ? route : route?.points || []
    const routePts = rawRoute.map((p) => toPoint(p)).filter(Boolean)
    const hasRoute = routePts.length > 0

    const sourceItems = hasRoute ? rawRoute : destinations || []
    const stops = []
    const missingNames = []
    sourceItems.forEach((item) => {
      const pt = toPoint(item)
      if (pt) stops.push(pt)
      else if (item) missingNames.push(item.name || item.destination || `#${item.destinationId ?? item.id}`)
    })

    return {
      routePoints: routePts,
      stopPoints: stops,
      originPoint: toPoint(origin),
      missing: missingNames,
    }
  }, [route, destinations, origin])

  // ---- init / cleanup (once) ----
  useEffect(() => {
    if (!containerRef.current) return undefined
    let map
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: [TILE_URL],
              tileSize: 256,
              maxzoom: 19,
              attribution: ATTRIBUTION,
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: EMPTY_VIEW.center,
        zoom: EMPTY_VIEW.zoom,
        attributionControl: false,
      })
    } catch (err) {
      setMapError(err?.message || 'Map could not be initialised in this browser (WebGL unavailable?)')
      return undefined
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right')

    map.on('load', () => setStyleReady(true))
    map.on('error', (e) => {
      // Tile 404/network hiccups are reported here too; only surface fatal-looking ones.
      if (import.meta.env.DEV) console.warn('[TravelMap] map error', e?.error || e)
    })

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.resize()) : null
    if (ro) ro.observe(containerRef.current)

    mapRef.current = map
    const markers = markersRef.current
    return () => {
      if (ro) ro.disconnect()
      markers.forEach(({ marker, popup }) => {
        popup.remove()
        marker.remove()
      })
      markers.clear()
      map.remove()
      mapRef.current = null
      setStyleReady(false)
    }
  }, [])

  const fitAll = () => {
    const map = mapRef.current
    if (!map) return
    const all = [...stopPoints, ...(originPoint ? [originPoint] : [])]
    if (all.length === 0) {
      map.easeTo({ center: EMPTY_VIEW.center, zoom: EMPTY_VIEW.zoom })
      return
    }
    if (all.length === 1) {
      map.flyTo({ center: [all[0].lng, all[0].lat], zoom: 8 })
      return
    }
    const bounds = new maplibregl.LngLatBounds()
    all.forEach((p) => bounds.extend([p.lng, p.lat]))
    map.fitBounds(bounds, { padding: 70, maxZoom: 10, duration: 600 })
  }

  // ---- markers + route + fit bounds whenever data changes ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return

    markersRef.current.forEach(({ marker, popup }) => {
      popup.remove()
      marker.remove()
    })
    markersRef.current.clear()

    const hasRoute = routePoints.length > 0
    const addMarker = (key, point, label, color) => {
      const popup = new maplibregl.Popup({ offset: 20, closeButton: true }).setDOMContent(buildPopupContent(point, (id) => onViewDetailsRef.current && onViewDetailsRef.current(id)))
      const marker = new maplibregl.Marker({ element: buildMarkerElement(label, color, false) })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map)
      markersRef.current.set(key, { marker, popup, point })
    }

    if (originPoint) addMarker('origin', originPoint, 'A', '#3b82f6')
    stopPoints.forEach((pt, i) => {
      const last = hasRoute && i === stopPoints.length - 1
      addMarker(
        `dest-${pt.id ?? i}`,
        pt,
        hasRoute ? String(pt.order ?? i + 1) : String(i + 1),
        last ? '#15803d' : '#d97706',
      )
    })

    // GeoJSON route line (straight segments between ordered stops)
    const lineCoords = [
      ...(originPoint && hasRoute ? [[originPoint.lng, originPoint.lat]] : []),
      ...routePoints.map((p) => [p.lng, p.lat]),
    ]
    const geojson = {
      type: 'FeatureCollection',
      features:
        lineCoords.length >= 2
          ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: lineCoords } }]
          : [],
    }
    const existing = map.getSource(ROUTE_SOURCE)
    if (existing) {
      existing.setData(geojson)
    } else {
      map.addSource(ROUTE_SOURCE, { type: 'geojson', data: geojson })
      map.addLayer({
        id: ROUTE_CASING,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.85 },
      })
      map.addLayer({
        id: ROUTE_LINE,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#2f5745', 'line-width': 4, 'line-dasharray': [2, 1.5] },
      })
    }

    fitAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleReady, routePoints, stopPoints, originPoint])

  // ---- focus the selected destination ("View on Map") ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady || selectedId === null || selectedId === undefined) return
    const entry = [...markersRef.current.values()].find((m) => m.point.id === selectedId)
    if (!entry) return
    markersRef.current.forEach(({ popup }) => popup.remove())
    map.flyTo({ center: [entry.point.lng, entry.point.lat], zoom: Math.max(map.getZoom(), 8), duration: 700 })
    entry.popup.addTo(map)
  }, [selectedId, styleReady, stopPoints, routePoints])

  if (mapError) {
    return (
      <div className="alert" style={{ padding: 16, borderRadius: 12, fontSize: 13 }}>
        <strong>Map unavailable</strong>
        <p style={{ margin: '4px 0 0' }}>{mapError}</p>
      </div>
    )
  }

  const noPoints = stopPoints.length === 0 && !originPoint

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid hsl(var(--line))',
        }}
      >
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

        <button
          type="button"
          className="button button-quiet"
          onClick={fitAll}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, fontSize: 11, padding: '4px 10px', background: 'hsl(var(--paper))' }}
        >
          Reset view
        </button>

        {!styleReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'hsl(var(--paper) / 0.7)', fontSize: 12, zIndex: 1 }}>
            Loading map…
          </div>
        )}

        {styleReady && noPoints && (
          <div style={{ position: 'absolute', left: 10, right: 10, bottom: 34, zIndex: 2, padding: '8px 12px', borderRadius: 8, background: 'hsl(var(--paper) / 0.92)', fontSize: 12 }}>
            Select destinations (Add Route / View on Map) to see them here.
          </div>
        )}
      </div>

      {routePoints.length >= 2 && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'hsl(var(--muted))' }}>
          Optimized destination path: stops are joined by straight lines in WorkBloom's nearest-neighbour order. This is not a road or driving route.
        </p>
      )}

      {missing.length > 0 && (
        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'hsl(var(--danger, 0 70% 45%))' }}>
          Map information unavailable for: {missing.join(', ')} (missing or invalid coordinates).
        </p>
      )}
    </div>
  )
}

export default TravelMap
