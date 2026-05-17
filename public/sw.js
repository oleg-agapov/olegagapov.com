const CACHE = 'olegagapov-v1'

const PRECACHE = [
  '/olegagapov.com/',
  '/olegagapov.com/about/',
  '/olegagapov.com/favicon.svg',
  '/olegagapov.com/avatar-oleg.jpg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or fonts
  const url = new URL(e.request.url)
  const isSameOrigin = url.origin === self.location.origin
  const isFonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'

  if (e.request.method !== 'GET' || (!isSameOrigin && !isFonts)) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached

      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response

        const clone = response.clone()
        caches.open(CACHE).then(cache => cache.put(e.request, clone))
        return response
      })
    })
  )
})
