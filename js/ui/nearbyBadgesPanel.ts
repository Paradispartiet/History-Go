// Canonical renderer/controller for the Badges tab inside the Nearby/Utforsk panel.
// Badge filter state lives in nearbyFilters.ts; filter button UI lives in nearbyFilterControls.ts.

import type { CategoryDefinition } from "../core/categories";
import type { NearbyFiltersApi } from "./nearbyFilters";

export type NearbyBadgesPanelApi = {
  render: () => void;
};

type RuntimeI18n = {
  t?: (key: string, fallback?: string) => string;
};

type RuntimeWindow = Window & typeof globalThis & {
  HG_I18N?: RuntimeI18n;
  CATEGORY_LIST?: CategoryDefinition[];
  HGNearbyFilters?: NearbyFiltersApi;
  HGNearbyBadgesPanel?: NearbyBadgesPanelApi;
  updateNearbyBadgeFilterButton?: () => void;
  renderLeftBadges?: () => void;
};

const win = window as RuntimeWindow;
let badgeTapLockedUntil = 0;

function tUI(key: string, fallback = ""): string {
  try {
    return win.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key: string, fallback: string, vars: Record<string, unknown>): string {
  const template = tUI(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function escapeHTML(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function badgeTapIsLocked(): boolean {
  const now = Date.now();
  if (now < badgeTapLockedUntil) return true;
  badgeTapLockedUntil = now + 120;
  return false;
}

function getCollectedBadgeCount(): number {
  try {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}") as unknown;
    if (!merits || typeof merits !== "object" || Array.isArray(merits)) return 0;
    return Object.keys(merits).length;
  } catch {
    return 0;
  }
}

function bindDelegatedSelection(box: HTMLElement): void {
  if (box.dataset.hgBadgeDelegated === "1") return;
  box.dataset.hgBadgeDelegated = "1";

  box.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-badge-id]");
    if (!button || !box.contains(button) || badgeTapIsLocked()) return;

    const next = button.getAttribute("data-badge-id") || "all";
    win.HGNearbyFilters?.setActiveBadgeFilter?.(next);
    win.updateNearbyBadgeFilterButton?.();
    render();
  });
}

function render(): void {
  const box = document.getElementById("leftBadgesList");
  if (!(box instanceof HTMLElement)) return;

  bindDelegatedSelection(box);

  const collectedBadgeCount = getCollectedBadgeCount();
  const collectedBadgeText = tfUI(
    "ui.badges.collectedCount",
    "{count} merker samlet",
    { count: collectedBadgeCount }
  );
  const summaryHtml = `<div class="muted" style="font-size:13px;margin:0 0 8px;padding:0 2px;">${escapeHTML(collectedBadgeText)}</div>`;

  const allCategories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  if (!allCategories.length) {
    box.innerHTML = `${summaryHtml}<div class="muted">${escapeHTML(tUI("ui.badges.noCategoriesLoaded", "Ingen kategorier lastet."))}</div>`;
    return;
  }

  const activeBadge = win.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
  const categories = activeBadge === "all"
    ? allCategories
    : allCategories.filter(category => String(category.id || "").trim() === activeBadge.trim());

  if (!categories.length) {
    box.innerHTML = `
      ${summaryHtml}
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🏅</div>
        <div class="hg-empty-guide-title">${escapeHTML(tUI("ui.badges.none", "Ingen merker"))}</div>
        <div class="hg-empty-guide-text">${escapeHTML(tUI("ui.badges.filterHidesAll", "Badgefilteret skjuler alle merker akkurat nå. Trykk badgeknappen for å vise alle."))}</div>
      </div>
    `;
    return;
  }

  box.innerHTML = summaryHtml + categories.map(category => {
    const id = escapeHTML(category.id);
    const name = escapeHTML(category.name);
    return `
      <button class="chip ghost" data-badge-id="${id}" style="justify-content:flex-start;width:100%;">
        <img src="bilder/merker/${id}.PNG"
             alt=""
             loading="lazy"
             decoding="async"
             style="width:18px;height:18px;margin-right:8px;border-radius:4px;">
        ${name}
      </button>
    `;
  }).join("");
}

const api: NearbyBadgesPanelApi = { render };
win.HGNearbyBadgesPanel = api;
win.renderLeftBadges = render;
