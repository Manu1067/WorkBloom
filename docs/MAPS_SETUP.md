# Maps Setup

The Travel module uses **MapLibre GL JS** with OpenStreetMap raster tiles.
No API key is needed and there is no Google Maps dependency.

## Data flow

```
PostgreSQL (destinations.latitude / longitude)
  -> Spring Boot  GET /api/travel/destinations, /destinations/{id}
                  POST /api/travel/routes/optimize   (ordered route points)
  -> src/api/travelApi.js  (apiClient)
  -> src/pages/TravelView.jsx
  -> src/components/travel/TravelMap.jsx  (MapLibre)
```

Coordinates are never hardcoded in the frontend. A destination without valid
coordinates gets no marker; the map lists it as "Map information unavailable".

## TravelMap component

`src/components/travel/TravelMap.jsx` props:

| prop | meaning |
| --- | --- |
| `destinations` | `[{ id, name, location, latitude, longitude }]` markers |
| `route` | ordered `TravelRouteResponse.points`; drawn as a GeoJSON line |
| `selectedDestination` | destination id to focus and open its popup |
| `origin` | optional `{ name, latitude, longitude }` |

Features: zoom/pan, navigation and scale controls, "Reset view" (fit bounds),
popups, numbered markers, GeoJSON route layer, visible OpenStreetMap
attribution, ResizeObserver-based resizing and full cleanup (`map.remove()`)
on unmount.

## The route line is not a road route

`POST /api/travel/routes/optimize` orders the selected destinations with a
nearest-neighbour heuristic over Haversine (great-circle) distance. The map
joins them with straight segments and labels this "Optimized destination
path". Real road geometry would need a routing provider (OSRM, GraphHopper or
Valhalla); none is integrated yet.

## Tiles

Default: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, with the
"(c) OpenStreetMap contributors" attribution shown on the map. The public OSM
tile server has a usage policy and is meant for light/demo traffic; tiles are
requested on demand only (no prefetching or bulk download). Override with
`VITE_MAP_TILE_URL` (see `.env.example`) for production.

## Destination photos

Photos live in `src/images/` (e.g. `Manali.png`, `Bir_Biling.png`) and are
matched to the database destination name by `src/utils/destinationImages.js`.
If no local photo matches, the `imageUrl` returned by the API
(`/images/destinations/...`, served by Spring Boot) is used.
