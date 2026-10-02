// Minimal service worker — exists purely to satisfy Chrome's installability
// checklist for InstallPrompt.tsx's `beforeinstallprompt` capture. No offline
// caching here; every request just passes straight through to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op — intentionally doesn't call event.respondWith(), so every
  // request falls through to the network exactly as if this didn't exist.
});
