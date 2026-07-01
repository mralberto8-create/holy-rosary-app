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

// Pre-fetch and cache all MP3s during SW install so they work offline immediately
const AUDIO_FILES = [
  "mystery_glorious_1.mp3","mystery_glorious_2.mp3","mystery_glorious_3.mp3",
  "mystery_glorious_4.mp3","mystery_glorious_5.mp3",
  "mystery_joyful_1.mp3","mystery_joyful_2.mp3","mystery_joyful_3.mp3",
  "mystery_joyful_4.mp3","mystery_joyful_5.mp3",
  "mystery_luminous_1.mp3","mystery_luminous_2.mp3","mystery_luminous_3.mp3",
  "mystery_luminous_4.mp3","mystery_luminous_5.mp3",
  "mystery_sorrowful_1.mp3","mystery_sorrowful_2.mp3","mystery_sorrowful_3.mp3",
  "mystery_sorrowful_4.mp3","mystery_sorrowful_5.mp3",
  "prayer_apostles_creed.mp3","prayer_fatima.mp3","prayer_final.mp3",
  "prayer_glory_be.mp3","prayer_hail_holy_queen.mp3","prayer_hail_mary.mp3",
  "prayer_our_father.mp3","prayer_sign_of_cross.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("rosary-audio-v1").then((cache) =>
      Promise.allSettled(
        AUDIO_FILES.map((file) =>
          fetch(`/audio/${file}`).then((res) => {
            if (res.ok) cache.put(`/audio/${file}`, res);
          })
        )
      )
    )
  );
});

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
