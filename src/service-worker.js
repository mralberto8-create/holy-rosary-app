/* eslint-disable no-restricted-globals */
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { RangeRequestsPlugin } from "workbox-range-requests";

clientsClaim();
self.skipWaiting();

// Precache all build assets (CRA injects the manifest here at build time)
precacheAndRoute(self.__WB_MANIFEST);

// Single-page app fallback — serve index.html for all navigation requests
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(({ request, url }) => {
  if (request.mode !== "navigate") return false;
  if (url.pathname.startsWith("/_")) return false;
  if (url.pathname.match(fileExtensionRegexp)) return false;
  return true;
}, createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"));

// Cache MP3s on first play, serve from cache thereafter.
// RangeRequestsPlugin handles the 206 Partial Content responses browsers
// use when streaming audio — without it, offline playback silently fails.
registerRoute(
  ({ url }) => url.pathname.startsWith("/audio/") && url.pathname.endsWith(".mp3"),
  new CacheFirst({
    cacheName: "rosary-audio-v1",
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache app shell assets (JS/CSS) with stale-while-revalidate
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")),
  new StaleWhileRevalidate({ cacheName: "static-resources" })
);
