// src/registerSW.js
// Registers the service worker so PulaTrack can be installed as a PWA on
// Android (Chrome "Add to Home Screen" / Play Store TWA) and iOS Safari.
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    });
  }
}
