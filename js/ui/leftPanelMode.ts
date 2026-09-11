// Canonical mode/render controller for the left Nearby panel.
// The legacy left-panel shell still owns filter button setup and event binding;
// this module owns mode selection, list visibility and render scheduling.

import type { NearbyFiltersApi } from "./nearbyFilters";

export type LeftPanelMode = "nearby" | "people" | "nature" | "events" | "social" | "routes" | "badges";

export type LeftPanelModeApi = {
  getActiveMode: () => LeftPanelMode;
  setMode: (mode: unknown) => LeftPanelMode;
  renderNow: () => void;
  rerender: () => void;
  updateControlVisibility: () => void;
};

type ResizeApi = {
  resize?: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  HGLeftPanelMode?: LeftPanelModeApi;
  HGNearbyFilters?: Pick<NearbyFiltersApi, "setActiveBadgeFilter">;
  renderNearbyPlaces?: () => void;
  renderNearbyPeople?: () => void;
  renderNearbyNature?: () => void;
  renderLeftRoutesList?: () => void;
  renderLeftBadges?: () => void;
  HGEvents?: {
    ready?: boolean;
    init?: () => Promise<unknown>;
    getAll?: () => unknown[];
    all?: unknown[];
  };
  PLACES?: Array<Record<string, any>>;
  HGMapView?: {
    openPlace?: (placeId: string) => unknown;
    showMap?: () => unknown;
  };
  HG_SpotmeetingUI?: {
    open?: (options: Record<string, unknown>) => unknown;
  };
  HG_SocialMeetUI?: {
    open?: (options: Record<string, unknown>) => unknown;
  };
  closeNearbyDrawer?: () => void;
  showToast?: (message: string) => unknown;
  updateNearbyFilterButton?: () => void;
  updateNearbyBadgeFilterButton?: () => void;
  updateNearbySortButton?: () => void;
  HGMap?: ResizeApi;
  MAP?: ResizeApi;
};

const win = window as RuntimeWindow;

const LIST_IDS_BY_MODE: Record<LeftPanelMode, string> = {
  nearby: "nearbyList",
  people: "leftPeopleList",
  nature: "leftNatureList",
  events: "leftEventsList",
  social: "leftSocialList",
  routes: "leftRoutesList",
  badges: "leftBadgesList"
};

const MODES = new Set<LeftPanelMode>(Object.keys(LIST_IDS_BY_MODE) as LeftPanelMode[]);

let renderRaf = 0;
let renderTimer = 0;

function normalizeMode(mode: unknown): LeftPanelMode {
  const normalized = String(mode ?? "").trim() as LeftPanelMode;
  return MODES.has(normalized) ? normalized : "nearby";
}

function getActiveMode(): LeftPanelMode {
  const activeMode = document
    .querySelector(".nearby-tab.is-active")
    ?.getAttribute("data-leftmode");
  return normalizeMode(activeMode);
}

function cleanText(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function escapeHtml(value: unknown): string {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function list<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function selectedPlaceId(): string {
  const card = document.getElementById("placeCard");
  return cleanText(card instanceof HTMLElement ? card.dataset.currentPlaceId : "");
}

function placeById(placeId: string): Record<string, any> | null {
  const id = cleanText(placeId);
  if (!id) return null;
  return list<Record<string, any>>(win.PLACES).find(place => cleanText(place && place.id) === id) || null;
}

function formatEventDate(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return "";
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) return raw;
  const options: Intl.DateTimeFormatOptions = raw.length <= 10
    ? { day: "numeric", month: "short" }
    : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat("nb-NO", options).format(new Date(timestamp));
}

function eventIsCurrent(event: Record<string, any>, now = Date.now()): boolean {
  const status = cleanText(event.status).toLowerCase();
  if (status === "cancelled" || status === "past") return false;
  if (status === "ongoing") return true;

  const endMs = Date.parse(cleanText(event.end));
  if (Number.isFinite(endMs)) return endMs >= now;

  const startRaw = cleanText(event.start);
  const startMs = Date.parse(startRaw);
  if (!Number.isFinite(startMs)) return status === "upcoming";
  const startDate = new Date(startMs);
  const today = new Date(now);
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return startDate.getTime() >= dayStart;
}

function bindExploreEvents(host: HTMLElement): void {
  if (host.dataset.hgExploreEventsBound === "1") return;
  host.dataset.hgExploreEventsBound = "1";
  host.addEventListener("click", event => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-explore-event-place]")
      : null;
    if (!(target instanceof HTMLElement)) return;
    const placeId = cleanText(target.dataset.exploreEventPlace);
    if (!placeId) return;
    event.preventDefault();
    if (typeof win.closeNearbyDrawer === "function") win.closeNearbyDrawer();
    const opened = win.HGMapView && typeof win.HGMapView.openPlace === "function"
      ? win.HGMapView.openPlace(placeId)
      : false;
    if (opened === false && typeof win.showToast === "function") {
      win.showToast("Kunne ikke åpne stedet for eventet akkurat nå.");
    }
  });
}

async function renderExploreEvents(): Promise<void> {
  const host = document.getElementById("leftEventsList");
  if (!(host instanceof HTMLElement)) return;
  bindExploreEvents(host);

  const eventsRuntime = win.HGEvents;
  if (!eventsRuntime) {
    host.innerHTML = '<div class="hg-explore-empty">Eventoversikten lastes inn …</div>';
    return;
  }

  if (!eventsRuntime.ready && typeof eventsRuntime.init === "function") {
    try {
      await eventsRuntime.init();
    } catch {
      host.innerHTML = '<div class="hg-explore-empty">Kunne ikke laste events akkurat nå.</div>';
      return;
    }
  }

  const events = list<Record<string, any>>(
    typeof eventsRuntime.getAll === "function" ? eventsRuntime.getAll() : eventsRuntime.all
  )
    .filter(event => eventIsCurrent(event))
    .sort((a, b) => {
      const aMs = Date.parse(cleanText(a.start));
      const bMs = Date.parse(cleanText(b.start));
      const safeA = Number.isFinite(aMs) ? aMs : Number.MAX_SAFE_INTEGER;
      const safeB = Number.isFinite(bMs) ? bMs : Number.MAX_SAFE_INTEGER;
      if (safeA !== safeB) return safeA - safeB;
      return cleanText(a.title).localeCompare(cleanText(b.title), "nb");
    })
    .slice(0, 24);

  if (!events.length) {
    host.innerHTML = '<div class="hg-explore-empty">Ingen kommende events er registrert akkurat nå.</div>';
    return;
  }

  host.innerHTML = events.map(event => {
    const placeId = cleanText(event.place_id);
    const place = placeById(placeId);
    const placeName = cleanText(place && (place.name || place.title) || placeId);
    const when = formatEventDate(event.start);
    const description = cleanText(event.description);
    return `<button type="button" class="hg-explore-card hg-explore-event-card" data-explore-event-place="${escapeHtml(placeId)}">
      <span class="hg-explore-card-kicker">${escapeHtml(when || "Event")}</span>
      <strong>${escapeHtml(event.title || "Event")}</strong>
      <span class="hg-explore-card-meta">${escapeHtml(placeName || "History Go-sted")}</span>
      ${description ? `<small>${escapeHtml(description)}</small>` : ""}
    </button>`;
  }).join("");
}

function bindExploreSocial(host: HTMLElement): void {
  if (host.dataset.hgExploreSocialBound === "1") return;
  host.dataset.hgExploreSocialBound = "1";
  host.addEventListener("click", event => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-explore-social-action]")
      : null;
    if (!(target instanceof HTMLElement)) return;

    const action = cleanText(target.dataset.exploreSocialAction);
    if (action === "manage") {
      event.preventDefault();
      if (win.HG_SocialMeetUI && typeof win.HG_SocialMeetUI.open === "function") {
        win.HG_SocialMeetUI.open({
          filter: "all",
          placeId: "",
          sourceSurface: "explorePanel"
        });
      } else if (typeof win.showToast === "function") {
        win.showToast("Social Meet er ikke lastet ennå.");
      }
      return;
    }

    if (action !== "propose") return;
    event.preventDefault();
    const placeId = selectedPlaceId();
    const place = placeById(placeId);
    if (!placeId || !place) {
      if (typeof win.showToast === "function") {
        win.showToast("Velg et sted først for å foreslå et kunnskapsmøte.");
      }
      return;
    }
    if (win.HG_SpotmeetingUI && typeof win.HG_SpotmeetingUI.open === "function") {
      win.HG_SpotmeetingUI.open({
        contextType: "place",
        contextId: placeId,
        title: cleanText(place.name || place.title || placeId),
        reason: "Kunnskapsmøte rundt dette stedet",
        sourceSurface: "explorePanel",
        preferredAction: "match"
      });
    } else if (typeof win.showToast === "function") {
      win.showToast("Kunnskapsmøte er ikke lastet ennå.");
    }
  });
}

function renderExploreSocial(): void {
  const host = document.getElementById("leftSocialList");
  if (!(host instanceof HTMLElement)) return;
  bindExploreSocial(host);

  const placeId = selectedPlaceId();
  const place = placeById(placeId);
  const placeName = cleanText(place && (place.name || place.title) || "");
  const proposeDisabled = !placeId || !place;
  const proposeMeta = proposeDisabled
    ? "Velg et sted under Steder først."
    : `Rundt ${placeName}.`;

  host.innerHTML = `
    <article class="hg-explore-card hg-explore-social-card">
      <span class="hg-explore-card-kicker">Møtes</span>
      <strong>Foreslå kunnskapsmøte</strong>
      <span class="hg-explore-card-meta">${escapeHtml(proposeMeta)}</span>
      <button type="button" data-explore-social-action="propose" ${proposeDisabled ? "disabled" : ""}>Foreslå møte</button>
    </article>
    <article class="hg-explore-card hg-explore-social-card">
      <span class="hg-explore-card-kicker">Social Meet</span>
      <strong>Mine møter</strong>
      <span class="hg-explore-card-meta">Forslag, avtaler, svar, læringssirkler og møtehistorikk.</span>
      <button type="button" data-explore-social-action="manage">Åpne Social Meet</button>
    </article>
  `;
}

function updateControlVisibility(): void {
  const mode = getActiveMode();
  const placeFilterButton = document.getElementById("nearbyFilterBtn");
  const badgeButton = document.getElementById("nearbyBadgeFilterBtn");
  const sortButton = document.getElementById("nearbySortBtn");
  const favoritesButton = document.getElementById("nearbyFavoritesFilterBtn");

  if (placeFilterButton) {
    placeFilterButton.style.display = mode === "nearby" || mode === "nature" ? "inline-flex" : "none";
  }
  if (badgeButton) {
    badgeButton.style.display = mode === "nature" ? "none" : "inline-flex";
  }
  if (sortButton) {
    sortButton.style.display = mode === "nearby" ? "inline-flex" : "none";
  }
  if (favoritesButton) {
    favoritesButton.style.display = mode === "nearby" ? "inline-flex" : "none";
  }
}

function renderNow(): void {
  const mode = getActiveMode();

  if (mode === "nearby") win.renderNearbyPlaces?.();
  if (mode === "people") win.renderNearbyPeople?.();
  if (mode === "nature") win.renderNearbyNature?.();
  if (mode === "events") void renderExploreEvents();
  if (mode === "social") renderExploreSocial();
  if (mode === "routes") win.renderLeftRoutesList?.();
  if (mode === "badges") win.renderLeftBadges?.();
}

function rerender(): void {
  // Badge/filter controls can be tapped rapidly on iPad/Safari. Coalesce repeated
  // requests into one render instead of rebuilding the active list per tap.
  if (typeof win.requestAnimationFrame === "function") {
    if (renderRaf) win.cancelAnimationFrame(renderRaf);
    renderRaf = win.requestAnimationFrame(() => {
      renderRaf = 0;
      renderNow();
    });
    return;
  }

  if (renderTimer) win.clearTimeout(renderTimer);
  renderTimer = win.setTimeout(() => {
    renderTimer = 0;
    renderNow();
  }, 0);
}

function setMode(input: unknown): LeftPanelMode {
  const mode = normalizeMode(input);

  for (const [candidateMode, id] of Object.entries(LIST_IDS_BY_MODE) as Array<[LeftPanelMode, string]>) {
    const list = document.getElementById(id);
    if (list) list.hidden = candidateMode !== mode;
  }

  if (mode === "nature") {
    win.HGNearbyFilters?.setActiveBadgeFilter?.("all");
  }

  try {
    localStorage.setItem("hg_leftpanel_mode_v1", mode);
  } catch {}

  document.querySelectorAll(".nearby-tab").forEach(button => {
    const active = button.getAttribute("data-leftmode") === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  win.updateNearbyFilterButton?.();
  win.updateNearbyBadgeFilterButton?.();
  win.updateNearbySortButton?.();

  updateControlVisibility();
  rerender();

  win.HGMap?.resize?.();
  win.MAP?.resize?.();

  return mode;
}

win.HGLeftPanelMode = {
  getActiveMode,
  setMode,
  renderNow,
  rerender,
  updateControlVisibility
};


win.addEventListener("hg:placeCardUpdated", () => {
  if (getActiveMode() === "social") rerender();
});

win.addEventListener("hg:spotmeetingChanged", () => {
  if (getActiveMode() === "social") rerender();
});
