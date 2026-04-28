/* ============================================================
   History Go – Service Worker (precache synkronisert mot index.html)
   Oppdatert: 2026-04-27
   ============================================================ */

const SW_VERSION = "hg-sw-2026-04-27-v1.38.114";

const CACHE_STATIC  = `hg-static-${SW_VERSION}`;
const CACHE_RUNTIME = `hg-runtime-${SW_VERSION}`;

// Kun filer som faktisk eksisterer og lastes av index.html / Civication.html.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "Civication.html",
  "manifest.json",

  // CSS
  "css/base.css",
  "css/civi.css",
  "css/civi-refresh.css",
  "css/components.css",
  "css/effects.css",
  "css/footer.css",
  "css/layout.css",
  "css/map.css",
  "css/merits.css",
  "css/miniProfile.css",
  "css/nearby.css",
  "css/overlay.css",
  "css/placeCard.css",
  "css/popups.css",
  "css/profile.css",
  "css/quiz.css",
  "css/search.css",
  "css/sheets.css",
  "css/theme.css",
  "css/nature.css",
  "css/people.css",
  "css/onboarding.css",
  "js/console/console.css",

  // Eksterne/støtte-loadere
  "js/events/events_loader.js",
  "js/brands/brands_loader.js",

  // UI popup + place card
  "js/ui/popup-utils.js",
  "js/ui/place-card.js",
  "js/hgchips.js",

  // Knowledge / trivia / insight / data
  "js/learningLog.js",
  "js/knowledge.js",
  "js/knowledge_component.js",
  "js/trivia.js",
  "js/hgInsights.js",
  "js/dataHub.js",

  "js/DomainRegistry.js",
  "js/domainHealthReport.js",

  // Dev / console
  "js/console/init.js",
  "js/console/verify.js",
  "js/console/diagnosticConsole.js",
  "js/console/devConsole.js",
  "js/console/legacyExtensions.js",

  "js/audits/missingImages.audit.js",

  // Observations
  "js/observations.js",
  "js/observationsView.js",

  // State
  "js/state/state.js",
  "js/state/persistence.js",
  "js/state/openmode.js",

  // Core
  "js/core/core.js",
  "js/core/categories.js",
  "js/core/knowledgeLearningState.js",
  "js/core/learningEvents.js",
  "js/core/viewportManager.js",
  "js/core/layerManager.js",
  "js/core/bottomSheetController.js",
  "js/core/geo.js",
  "js/core/pos.js",

  // Geo / map / ruter
  "js/map.js",
  "js/orsConfig.js",
  "js/navRoutes.js",

  // Game / progression
  "js/hg_unlocks.js",
  "js/hg_nature_unlocks.js",
  "js/quizzes.js",
  "js/quiz-audit.js",

  // UI
  "js/ui/dom.js",
  "js/ui/toast.js",
  "js/ui/events.js",
  "js/ui/interactions.js",
  "js/ui/lists.js",
  "js/ui/left-panel.js",
  "js/ui/badges.js",
  "js/ui/badge-modal.js",
  "js/ui/mini-profile.js",
  "js/ui/nature-card.js",
  "js/ui/nature-unlock-toast.js",
  "js/ui/person-place-unlock-toast.js",
  "js/ui/badge-unlock-toast.js",
  "js/ui/onboarding-welcome.js",
  "js/ui/geo-indicator.js",

  // Civication – core
  "js/Civication/core/civicationState.js",
  "js/Civication/core/civicationJobs.js",
  "js/Civication/core/civicationEconomyEngine.js",
  "js/Civication/core/civicationEventEngine.js",
  "js/Civication/core/CivicationPsyche.js",
  "js/Civication/core/civicationCalendar.js",
  "js/Civication/core/civicationTaskEngine.js",

  // Civication – rot
  "js/Civication/tiersCivi.js",
  "js/Civication/merits-and-jobs.js",
  "js/Civication/civicationObligationEngine.js",
  "js/Civication/capitalEngine.js",
  "js/Civication/capitalMaintenanceEngine.js",
  "js/Civication/identityCore.js",
  "js/Civication/identityCompass.js",
  "js/Civication/identityEngine.js",
  "js/Civication/civiLifestyle.js",
  "js/Civication/civicationCommercial.js",
  "js/Civication/roleStoryletBridge.js",
  "js/Civication/roleThreadResolver.js",
  "js/Civication/mailPlanBridge.js",
  "js/Civication/CivicationBoot.js",

  // Civication – ui
  "js/Civication/ui/CivicationHome.js",
  "js/Civication/ui/CivicationPublicLayer.js",
  "js/Civication/ui/CivicationMap.js",
  "js/Civication/ui/CivicationUI.js",
  "js/Civication/ui/CivicationEmptyPanels.js",

  // Civication – utils / systems
  "js/Civication/utils/storyResolver.js",
  "js/Civication/utils/conflictLoader.js",
  "js/Civication/systems/civicationMailPlanPatchRuntime.js",
  "js/Civication/systems/civicationMailPlanDebug.js",
  "js/Civication/systems/civicationNPCs.js",
  "js/Civication/systems/civicationThreadBridge.js",
  "js/Civication/systems/civicationMailDirectorV2.js",
  "js/Civication/systems/civicationMailDirectorV2PhaseGuard.js",
  "js/Civication/systems/civicationMailDirectorV2ForceRoleMail.js",
  "js/Civication/systems/civicationMailDirectorV2RoleGuard.js",
  "js/Civication/systems/civicationMailRuntime.js",
  "js/Civication/systems/civicationLifeMailRuntime.js",
  "js/Civication/systems/day/dayActiveRoleStateSync.js",
  "js/Civication/systems/day/dayCalendarBridge.js",
  "js/Civication/systems/day/dayHistoryGoContexts.js",
  "js/Civication/systems/day/dayCarryover.js",
  "js/Civication/systems/day/dayWeeklyReview.js",
  "js/Civication/systems/day/dayContacts.js",
  "js/Civication/systems/day/dayKnowledge.js",
  "js/Civication/systems/day/dayEvents.js",
  "js/Civication/systems/day/dayPatches.js",

  // Civication – life mails
  "data/Civication/lifeMails/life_manifest.json",
  "data/Civication/lifeMails/arbeidsledig/arbeidsledig_life.json",
  "data/Civication/lifeMails/alkohol/alkohol_risk_life.json",
  "data/Civication/lifeMails/subkultur/subkultur_skurk_life.json",

  // Stories
  "js/stories/stories_loader.js",
  "js/stories/stories_utils.js",
  "js/stories/story_source_collector.js",
  "js/stories/story_episode_extractor.js",
  "js/stories/story_scoring.js",
  "js/stories/story_dedupe.js",
  "js/stories/story_generator_engine.js",
  "js/stories/story_quiz_generator.js",
  "js/stories/story_graph_engine.js",

  // Boot + app
  "js/boot.js",
  "js/app.js",
  "js/routes.js",
];

// -------------------- helpers --------------------
function isSameOrigin(url) {
  try {
    return new URL(url, self.location.href).origin === self.location.origin;
  } catch {
    return false;
  }
}

async function cacheAddAllSafe(cache, urls) {
  // addAll feiler hvis én fil 404’er – derfor gjør vi "best effort"
  await Promise.all(urls.map(async (u) => {
    try {
      const req = new Request(u, { cache: "reload" });
      const res = await fetch(req);
      if (res && res.ok) await cache.put(req, res);
    } catch {
      // ignore
    }
  }));
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);

  return cached || (await fetchPromise) || new Response("", { status: 504 });
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || new Response("", { status: 504 });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || new Response("", { status: 504 });
  }
}

// -------------------- install / activate --------------------
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC);
    await cacheAddAllSafe(cache, PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k.startsWith("hg-static-") && k !== CACHE_STATIC) return caches.delete(k);
      if (k.startsWith("hg-runtime-") && k !== CACHE_RUNTIME) return caches.delete(k);
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

// -------------------- fetch routing --------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Kun GET
  if (req.method !== "GET") return;

  // Navigasjon (HTML): network-first, fallback cache
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, CACHE_STATIC));
    return;
  }

  // Same-origin: styr caching per type
  if (url.origin === self.location.origin) {
    const path = url.pathname;

    // Data (JSON) – network-first under utvikling
    if (path.startsWith("/History-Go/data/") || path.includes("/data/")) {
      event.respondWith(networkFirst(req, CACHE_RUNTIME));
      return;
    }

    // Bilder – cache-first
    if (path.includes("/bilder/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(path)) {
      event.respondWith(cacheFirst(req, CACHE_RUNTIME));
      return;
    }

    // JS/CSS – network-first under utvikling
    if (/\.(js|css)$/i.test(path)) {
      event.respondWith(networkFirst(req, CACHE_STATIC));
      return;
    }

    // Fallback: network-first
    event.respondWith(networkFirst(req, CACHE_RUNTIME));
    return;
  }

  // Cross-origin (kart-tiles, cdn): stale-while-revalidate i runtime
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});
