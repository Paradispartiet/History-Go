// Historical routes are narrative journeys, separate from map/navigation routes.
(function () {
  "use strict";

  const STORAGE_KEY = "hg_historical_routes_progress_v1";
  const MANIFEST_URL = "data/routes/historical/manifest.json";
  const ROUTE_ARCHETYPE_LABELS = Object.freeze({
    urban_time_route: "Tidsreise i byen",
    trade_route: "Handelsrute",
    escape_route: "Fluktrute",
    smuggling_route: "Smuglerrute",
    industrial_work_route: "Industri- og arbeidsrute",
    pilgrimage_route: "Pilegrimsrute",
    military_route: "Militærrute",
    sea_route: "Seilingsled",
    migration_route: "Migrasjonsrute",
    postal_route: "Postvei",
    rail_route: "Jernbanerute",
    river_route: "Elverute",
    spy_route: "Spionrute",
    resistance_route: "Motstandsrute"
  });
  let routes = [];
  let loadPromise = null;

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getRouteArchetypeLabel(routeArchetype) {
    const archetype = String(routeArchetype || "").trim();
    if (!archetype) return "Historisk rute";
    if (ROUTE_ARCHETYPE_LABELS[archetype]) return ROUTE_ARCHETYPE_LABELS[archetype];

    const formatted = archetype
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return formatted
      ? formatted.charAt(0).toLocaleUpperCase("nb-NO") + formatted.slice(1)
      : "Historisk rute";
  }

  function readProgressStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function defaultProgress(routeId) {
    return {
      routeId,
      status: "not_started",
      online: {
        started: false,
        completed: false,
        currentStopId: null,
        completedStopIds: []
      },
      physical: {
        visitedStopIds: [],
        completed: false
      }
    };
  }

  function getProgress(routeId) {
    const stored = readProgressStore()[routeId];
    if (!stored || typeof stored !== "object") return defaultProgress(routeId);

    const fallback = defaultProgress(routeId);
    return {
      ...fallback,
      ...stored,
      routeId,
      online: { ...fallback.online, ...(stored.online || {}) },
      physical: { ...fallback.physical, ...(stored.physical || {}) }
    };
  }

  function saveProgress(routeId, nextProgress) {
    const store = readProgressStore();
    store[routeId] = nextProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("updateProfile"));
    window.dispatchEvent(new CustomEvent("hg:historicalRouteProgress", {
      detail: { routeId, progress: nextProgress }
    }));
    if (nextProgress?.online?.completed || nextProgress?.status === "online_completed") {
      window.dispatchEvent(new CustomEvent("hg:routeCompleted", {
        detail: { routeId, strength: 2 }
      }));
    }
    window.rerenderActiveLeftPanelMode?.();
    return nextProgress;
  }

  function findRoute(routeId) {
    return routes.find((route) => route.id === routeId) || null;
  }

  function getCurrentChapterIndex(route, progress) {
    if (!route?.chapters?.length) return -1;
    if (progress.online.completed) return route.chapters.length;
    const current = route.chapters.findIndex((chapter) => chapter.id === progress.online.currentStopId);
    if (current >= 0) return current;
    return Math.min(progress.online.completedStopIds.length, route.chapters.length - 1);
  }

  function startRoute(routeId) {
    const route = findRoute(routeId);
    if (!route?.chapters?.length) return null;

    const current = getProgress(routeId);
    if (current.online.started && !current.online.completed) return current;

    return saveProgress(routeId, {
      ...current,
      status: "started",
      updatedAt: new Date().toISOString(),
      online: {
        ...current.online,
        started: true,
        completed: false,
        currentStopId: route.chapters[0].id,
        completedStopIds: []
      }
    });
  }

  function completeCurrentChapter(routeId) {
    const route = findRoute(routeId);
    if (!route?.chapters?.length) return null;

    let current = getProgress(routeId);
    if (!current.online.started) current = startRoute(routeId);
    if (!current || current.online.completed) return current;

    const chapterIndex = Math.max(0, getCurrentChapterIndex(route, current));
    const chapter = route.chapters[chapterIndex];
    const completedStopIds = Array.from(new Set([
      ...current.online.completedStopIds,
      chapter.id
    ]));
    const isComplete = chapterIndex >= route.chapters.length - 1;
    const nextChapter = isComplete ? null : route.chapters[chapterIndex + 1];

    return saveProgress(routeId, {
      ...current,
      status: isComplete ? "online_completed" : "online_in_progress",
      updatedAt: new Date().toISOString(),
      online: {
        ...current.online,
        started: true,
        completed: isComplete,
        currentStopId: nextChapter?.id || null,
        completedStopIds,
        completedAt: isComplete ? new Date().toISOString() : null
      }
    });
  }

  async function load() {
    if (routes.length) return routes;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      let loadedRoutes = [];
      if (typeof window.DataHub?.loadHistoricalRoutes === "function") {
        loadedRoutes = await window.DataHub.loadHistoricalRoutes({ cache: "no-store" });
      } else {
        const manifestResponse = await fetch(MANIFEST_URL, { cache: "no-store" });
        if (!manifestResponse.ok) throw new Error(`Historical route manifest: HTTP ${manifestResponse.status}`);
        const manifest = await manifestResponse.json();
        const files = Array.isArray(manifest.files) ? manifest.files : [];
        const batches = await Promise.all(files.map(async (file) => {
          const response = await fetch(`data/routes/historical/${file}`, { cache: "no-store" });
          if (!response.ok) throw new Error(`Historical route data: HTTP ${response.status}`);
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }));
        loadedRoutes = batches.flat();
      }

      routes = loadedRoutes.filter((route) =>
        route?.type === "historical_route" &&
        route?.feature === "historiske_ruter" &&
        route?.playModes?.online?.enabled === true &&
        Array.isArray(route.chapters) &&
        route.chapters.length
      );
      return routes;
    })().catch((error) => {
      console.warn("[historical-routes] load failed", error);
      routes = [];
      return routes;
    }).finally(() => {
      loadPromise = null;
    });

    return loadPromise;
  }

  function statusLabel(progress) {
    if (progress.status === "online_completed") return "Fullført online";
    if (progress.status === "online_in_progress") return "Online pågår";
    if (progress.status === "started") return "Startet";
    return "Spill online";
  }

  function renderCards() {
    return routes.map((route) => {
      const progress = getProgress(route.id);
      return `
        <button class="left-route-item hg-historical-route-card" type="button" data-historical-route="${escapeHTML(route.id)}">
          <span class="hg-historical-route-kicker">Historisk rute · ${escapeHTML(getRouteArchetypeLabel(route.routeArchetype))}</span>
          <span class="left-route-title">${escapeHTML(route.title)}</span>
          <span class="left-route-meta">
            <span class="left-route-stop">${escapeHTML(route.historicalPeriod || "Historisk reise")}</span>
            <span class="left-route-dist">${escapeHTML(statusLabel(progress))}</span>
          </span>
        </button>
      `;
    }).join("");
  }

  function closePlayer() {
    document.getElementById("hgHistoricalRoutePlayer")?.remove();
  }

  function taskMarkup(chapter) {
    const task = chapter.tasks?.[0];
    if (!task) return "";
    return `
      <aside class="hg-historical-task">
        <strong>${task.type === "quiz_placeholder" ? "Quiz kommer senere" : "Tenk underveis"}</strong>
        <p>${escapeHTML(task.prompt)}</p>
      </aside>
    `;
  }

  function renderPlayer(routeId, view = "auto") {
    const route = findRoute(routeId);
    if (!route) return;

    closePlayer();
    const progress = getProgress(routeId);
    const showIntro = view === "intro" || (view === "auto" && !progress.online.started);
    const chapterIndex = getCurrentChapterIndex(route, progress);
    const completed = progress.online.completed || chapterIndex >= route.chapters.length;
    const chapter = completed ? null : route.chapters[Math.max(0, chapterIndex)];
    const completedCount = progress.online.completedStopIds.length;
    const percent = completed ? 100 : Math.round((completedCount / route.chapters.length) * 100);

    const modal = document.createElement("div");
    modal.id = "hgHistoricalRoutePlayer";
    modal.className = "hg-historical-player-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "hgHistoricalRouteTitle");

    let content = "";
    if (showIntro) {
      content = `
        <p class="hg-historical-eyebrow">Historiske ruter · Online historisk reise</p>
        <h2 id="hgHistoricalRouteTitle">${escapeHTML(route.title)}</h2>
        <p class="hg-historical-meta">${escapeHTML(getRouteArchetypeLabel(route.routeArchetype))} · ${escapeHTML(route.historicalPeriod)} · ${route.chapters.length} kapitler</p>
        <p class="hg-historical-lead">${escapeHTML(route.narrativeText)}</p>
        <div class="hg-historical-mode-note">
          <strong>Online = du reiser historien.</strong>
          <span>Fysisk samling er klargjort i data, men GPS-innsamling kommer senere.</span>
        </div>
        <button class="hg-historical-primary" type="button" data-action="start">Start reisen</button>
      `;
    } else if (completed) {
      content = `
        <p class="hg-historical-eyebrow">Online-reise fullført</p>
        <h2 id="hgHistoricalRouteTitle">${escapeHTML(route.title)}</h2>
        <div class="hg-historical-complete-icon" aria-hidden="true">✓</div>
        <p class="hg-historical-lead">Du har reist gjennom alle ${route.chapters.length} kapitlene og fulgt byen fra middelalderbyen tilbake til fjorden.</p>
        <p class="hg-historical-reward">Belønning: ${Number(route.rewards?.pointsOnline || 0)} progresjonspoeng · ${escapeHTML(route.rewards?.onlineBadgeId || "online-merke")}</p>
        <button class="hg-historical-secondary" type="button" data-action="restart">Spill reisen på nytt</button>
      `;
    } else {
      content = `
        <p class="hg-historical-eyebrow">Kapittel ${chapterIndex + 1} av ${route.chapters.length}</p>
        <h2 id="hgHistoricalRouteTitle">${escapeHTML(chapter.chapterTitle)}</h2>
        <p class="hg-historical-meta">${escapeHTML(chapter.year)} · ${escapeHTML(chapter.era)}</p>
        <div class="hg-historical-progress" aria-label="${percent} prosent fullført"><span style="width:${percent}%"></span></div>
        <p class="hg-historical-story">${escapeHTML(chapter.narrativeText)}</p>
        ${taskMarkup(chapter)}
        <div class="hg-historical-place-link">Knyttet til eksisterende sted: <code>${escapeHTML(chapter.placeId || "tekstlig etappe")}</code></div>
        <button class="hg-historical-primary" type="button" data-action="next">${chapterIndex === route.chapters.length - 1 ? "Fullfør reisen" : "Neste kapittel"}</button>
      `;
    }

    modal.innerHTML = `
      <section class="hg-historical-player">
        <button class="hg-historical-close" type="button" data-action="close" aria-label="Lukk">×</button>
        ${content}
      </section>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) return closePlayer();
      const target = /** @type {Element|null} */ (event.target instanceof Element ? event.target : null);
      const action = target?.closest?.("[data-action]")?.getAttribute("data-action");
      if (action === "close") closePlayer();
      if (action === "start") {
        startRoute(routeId);
        renderPlayer(routeId, "chapter");
      }
      if (action === "next") {
        completeCurrentChapter(routeId);
        renderPlayer(routeId, "chapter");
      }
      if (action === "restart") {
        startRoute(routeId);
        renderPlayer(routeId, "chapter");
      }
    });

    document.body.appendChild(modal);
    /** @type {HTMLElement|null} */ (modal.querySelector(".hg-historical-close"))?.focus();
  }

  function bindCards(container) {
    if (!container || container.dataset.hgHistoricalRoutesBound === "1") return;
    container.dataset.hgHistoricalRoutesBound = "1";
    container.addEventListener("click", (event) => {
      const target = /** @type {Element|null} */ (event.target instanceof Element ? event.target : null);
      const card = target?.closest?.("[data-historical-route]");
      if (!card || !container.contains(card)) return;
      const routeId = card.getAttribute("data-historical-route");
      if (routeId) renderPlayer(routeId);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePlayer();
  });

  window.HGHistoricalRoutes = {
    STORAGE_KEY,
    load,
    getAll: () => routes.slice(),
    getProgress,
    startRoute,
    completeCurrentChapter,
    getRouteArchetypeLabel,
    renderCards,
    bindCards,
    open: renderPlayer,
    close: closePlayer
  };

  window.dispatchEvent(new CustomEvent("hg:historicalRoutesReady"));
})();
