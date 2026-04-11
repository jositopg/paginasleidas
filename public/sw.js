const CACHE = 'paginas-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Only cache GET requests for same-origin app shell
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || !url.origin.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request))
    return
  }

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone())
          return res
        }).catch(() => cached)
        // Return cached instantly if available, update in background
        return cached || fresh
      })
    )
  )
})
