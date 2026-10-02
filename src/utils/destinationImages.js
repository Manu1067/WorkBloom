/**
 * Resolves a destination name to one of the project's own photos in
 * src/images (e.g. "Bir Billing" -> Bir_Biling.png). Files are bundled by
 * Vite - nothing is copied, renamed or downloaded.
 *
 * Falls back to the imageUrl the backend returned (served by Spring Boot
 * from /images/destinations/...) when no local photo matches.
 */
const localImages = import.meta.glob('../images/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const normalise = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

const byKey = {}
Object.entries(localImages).forEach(([path, url]) => {
  const file = path.split('/').pop().replace(/\.[^.]+$/, '')
  byKey[normalise(file)] = url
})

// Database name -> existing filename where the spelling differs
// (Wayand.png, Bir_Biling.png). Keys/values are normalised.
const ALIASES = {
  wayanad: 'wayand',
  birbilling: 'birbiling',
}

export function getLocalDestinationImage(name) {
  const key = normalise(name)
  return byKey[key] || byKey[ALIASES[key]] || null
}

export function getDestinationImage(name, fallbackUrl = null) {
  return getLocalDestinationImage(name) || fallbackUrl || null
}
