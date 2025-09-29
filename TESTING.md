# Testing Resistance Zero PWA

These steps verify that the install prompt, manifest, and service worker are correctly wired up for the Resistance Zero PWA shell.

## 1. Start a local web server

```bash
python -m http.server 4173
```

Serving over `http://127.0.0.1` (or `localhost`) is required so modern browsers will allow service worker registration.

## 2. Check manifest and service worker endpoints

In a second terminal, confirm the manifest and service worker files are reachable:

```bash
curl -I http://127.0.0.1:4173/manifest.json
curl -I http://127.0.0.1:4173/service-worker.js
```

Each request should return a `200 OK` response.

## 3. Verify install UI and service worker in the browser

1. Visit `http://127.0.0.1:4173/` in Chromium or another modern browser.
2. Open DevTools → Application → Manifest to verify the app metadata and icon load without errors.
3. In the Application → Service Workers panel, confirm that `service-worker.js` is installed and activated.
4. Trigger the `beforeinstallprompt` event (e.g. via DevTools) to surface the **Install App** button and confirm the prompt can be accepted or dismissed.
5. Modify `service-worker.js` (or bump `CACHE_VERSION`) and reload the page to see the update toast asking the user to refresh.

These manual checks ensure the install button, manifest linkage, service worker caching, and update notifications all function as intended.
