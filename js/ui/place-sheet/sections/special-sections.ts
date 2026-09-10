type SpecialPlace = Record<string, any>;

type PlaceSheetSpecialApi = {
  applies: (placeId: string) => boolean;
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetSpecialRuntime = Window & typeof globalThis & {
  PLACES?: SpecialPlace[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => SpecialPlace | null };
  HGPlacePopupSportTraining?: {
    render?: (place: SpecialPlace) => string;
    isSportsPlace?: (place: SpecialPlace) => boolean;
  };
  HGPlaceSheetSections?: Record<string, unknown> & { special?: PlaceSheetSpecialApi };
};

const runtime = window as PlaceSheetSpecialRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function object(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function humanize(value: unknown): string {
  const raw = text(value).replace(/_/g, " ").replace(/\s+/g, " ");
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
}

function unique(values: unknown[]): string[] {
  return [...new Set(values.map(text).filter(Boolean))];
}

function chips(values: unknown, maxItems = 18): string {
  const items = unique(list(values)).slice(0, maxItems);
  if (!items.length) return "";
  return `<div class="hg-place-chip-list">${items.map(item => `<span class="hg-place-chip">${escapeHtml(humanize(item))}</span>`).join("")}</div>`;
}

function renderNature(place: SpecialPlace): string {
  const profile = object(place?.nature_profile || place?.natureProfile);
  if (!Object.keys(profile).length) return "";
  const birding = object(profile.birding);
  const terrain = list(profile.terrain);
  const habitats = list(profile.habitats || profile.habitat_types || profile.nature_types);
  const species = list(birding.notable_species || profile.notable_species || profile.species);
  const seasons = list(birding.seasonal_focus || profile.seasonal_focus);
  const summary = text(profile.summary || profile.description);
  if (!terrain.length && !habitats.length && !species.length && !seasons.length && !summary) return "";

  return `
    <section class="hg-section hg-place-section hg-place-nature-section" data-hg-place-sheet-special-owner="nature-landscape">
      <h3>Natur og landskap</h3>
      ${summary ? `<p class="hg-place-nature-summary">${escapeHtml(summary)}</p>` : ""}
      <div class="hg-place-nature-grid">
        ${terrain.length || habitats.length ? `<div class="hg-place-nature-block"><h4>Terreng og naturtyper</h4>${chips([...terrain, ...habitats])}</div>` : ""}
        ${species.length ? `<div class="hg-place-nature-block"><h4>Artsliv <span>${species.length}</span></h4>${chips(species)}</div>` : ""}
        ${seasons.length ? `<div class="hg-place-nature-block"><h4>Beste observasjonstid</h4>${chips(seasons, 8)}</div>` : ""}
      </div>
    </section>
  `;
}

function hasTrainingContent(place: SpecialPlace | null): boolean {
  if (!place) return false;
  const profile = object(place?.training_profile);
  if (!Object.keys(profile).length) return false;
  const hasContent = Boolean(text(profile.summary) || text(profile.safety) || list(profile.exercises).filter(Boolean).length);
  if (!hasContent) return false;
  try {
    if (typeof runtime.HGPlacePopupSportTraining?.isSportsPlace === "function") {
      return runtime.HGPlacePopupSportTraining.isSportsPlace(place) === true;
    }
  } catch {}
  const category = text(place?.category || place?.categoryId).toLowerCase();
  return category === "sport" || Boolean(Object.keys(object(place?.sport_profile)).length);
}

function renderTraining(place: SpecialPlace): string {
  if (!hasTrainingContent(place)) return "";
  try {
    const html = text(runtime.HGPlacePopupSportTraining?.render?.(place));
    if (html) return html.replace("data-hg-sport-training=\"1\"", 'data-hg-sport-training="1" data-hg-place-sheet-special-owner="sport-training"');
  } catch {}
  return "";
}

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function placeFor(placeId: string): SpecialPlace | null {
  const id = text(placeId);
  if (!id) return null;
  try {
    const resolved = runtime.HGPlaceOpen?.getPlace?.(id);
    if (resolved && typeof resolved === "object") return resolved;
  } catch {}
  return list<SpecialPlace>(runtime.PLACES).find(place => text(place?.id) === id) || null;
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-special-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-special.css";
  link.setAttribute("data-hg-place-sheet-special-style", "1");
  document.head.appendChild(link);
}

function ensureSlot(placeId: string): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;
  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-special="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-special";
    slot.setAttribute("data-hg-place-sheet-special", "1");
    slot.setAttribute("data-hg-place-sheet-section", "special");
    slot.hidden = true;
    const sources = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="sources"]');
    if (sources?.nextSibling) root.insertBefore(slot, sources.nextSibling);
    else root.appendChild(slot);
  }
  slot.dataset.placeId = text(placeId);
  return slot;
}

export function specialSectionsApply(placeId: string): boolean {
  const place = placeFor(placeId);
  if (!place) return false;
  return Boolean(renderNature(place) || hasTrainingContent(place));
}

export function adoptCanonicalSpecialSections(placeId: string): HTMLElement | null {
  const id = text(placeId);
  const place = placeFor(id);
  const slot = ensureSlot(id);
  if (!id || !place || !(slot instanceof HTMLElement)) return null;
  const html = [renderNature(place), renderTraining(place)].filter(Boolean).join("");
  slot.innerHTML = html;
  slot.hidden = !html;
  return html ? slot : null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id && specialSectionsApply(id)) adoptCanonicalSpecialSections(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  special: {
    applies: specialSectionsApply,
    adopt: adoptCanonicalSpecialSections
  }
};
