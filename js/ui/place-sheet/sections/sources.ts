import { resolvePlaceKnowledgeContext } from "../place-section-context";

type SourceLike = Record<string, any>;
type PlaceLike = Record<string, any>;

type PlaceSheetSourcesApi = {
  renderHtml: (place: PlaceLike, articles?: SourceLike[]) => string;
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetSourcesRuntime = Window & typeof globalThis & {
  PLACES?: PlaceLike[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => PlaceLike | null };
  HGPlaceSheetSections?: Record<string, unknown> & { sources?: PlaceSheetSourcesApi };
};

const runtime = window as PlaceSheetSourcesRuntime;
let hydrationGeneration = 0;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = SourceLike>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter(Boolean) as T[] : [];
}

function strings(value: unknown): string[] {
  return list<unknown>(value).map(text).filter(Boolean);
}

function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHttpsUrl(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  try {
    const parsed = new URL(raw, runtime.location?.origin || undefined);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter(value => {
    const id = key(value);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function humanize(value: unknown): string {
  const raw = text(value).replace(/_/g, " ").replace(/\s+/g, " ");
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
}

export function renderCanonicalSourcesHtml(place: PlaceLike, articles: SourceLike[] = []): string {
  const sourceProfile = place?.source_summary && typeof place.source_summary === "object"
    ? place.source_summary
    : (place?.sourceSummary || {});
  const labels = uniqueBy(strings(sourceProfile?.safe_sources || sourceProfile?.sources), value => value);
  const configuredLinks = [place, ...list(articles)].flatMap(value => list(value?.externalLinks)).map(link => ({
    type: text(link?.type || "source"),
    label: text(link?.label || link?.title),
    url: safeHttpsUrl(link?.url)
  }));
  const beforeAfterLinks = [
    ...strings(place?.for_na?.sources || place?.for_na?.kilder || place?.for_na?.source),
    text(place?.for_na?.beforeImageMeta?.sourcePage || place?.for_na?.before_image_meta?.sourcePage),
    text(place?.for_na?.nowImageMeta?.sourcePage || place?.for_na?.now_image_meta?.sourcePage)
  ].map(url => ({ type: "image_source", label: "Bilde- og sammenligningskilde", url: safeHttpsUrl(url) }));
  const links = uniqueBy([...configuredLinks, ...beforeAfterLinks].filter(link => link.url), link => link.url);

  return `
    <section class="hg-section hg-place-sources-section pc-sheet-canonical-sources" data-hg-place-sheet-owner="sources">
      <h3>Kilder</h3>
      ${labels.length ? `<section class="hg-section hg-place-section hg-place-tab-section"><h4>Kilder i stedprofilen</h4><ul class="hg-place-source-list">${labels.map(label => `<li>${escapeHtml(label)}</li>`).join("")}</ul></section>` : ""}
      ${links.length ? `<section class="hg-section hg-place-section hg-place-tab-section"><h4>Kilder og eksterne oppslag</h4><div class="hg-place-source-link-list">${links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(link.label || link.url)}</strong><span>${escapeHtml(humanize(link.type))} ↗</span></a>`).join("")}</div></section>` : ""}
      ${!labels.length && !links.length ? '<div class="hg-place-tab-empty">Ingen brukerrettede kilder er registrert for dette stedet ennå.</div>' : ""}
    </section>
  `;
}

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-sources-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-sources.css";
  link.setAttribute("data-hg-place-sheet-sources-style", "1");
  document.head.appendChild(link);
}

function ensureSlot(): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;
  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-sources="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-sources";
    slot.setAttribute("data-hg-place-sheet-sources", "1");
    slot.setAttribute("data-hg-place-sheet-section", "sources");
    slot.hidden = true;
    const learning = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="learning"]');
    const language = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="language"]');
    const reading = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="reading"]');
    const news = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="news"]');
    const anchor = learning || language || reading || news;
    if (anchor?.nextSibling) root.insertBefore(slot, anchor.nextSibling);
    else root.appendChild(slot);
  }
  return slot;
}

function placeFor(placeId: string): PlaceLike | null {
  const id = text(placeId);
  if (!id) return null;
  try {
    const resolved = runtime.HGPlaceOpen?.getPlace?.(id);
    if (resolved && typeof resolved === "object") return resolved;
  } catch {}
  return (Array.isArray(runtime.PLACES) ? runtime.PLACES : []).find(place => text(place?.id) === id) || null;
}

function invalidate(slot: HTMLElement): void {
  slot.replaceChildren();
  slot.hidden = true;
  delete slot.dataset.placeId;
}

async function hydrate(placeId: string): Promise<void> {
  const id = text(placeId);
  const place = placeFor(id);
  const slot = ensureSlot();
  if (!id || !place || !(slot instanceof HTMLElement)) return;
  const generation = ++hydrationGeneration;
  invalidate(slot);
  const context = await resolvePlaceKnowledgeContext(place);
  if (generation !== hydrationGeneration || !slot.isConnected) return;
  const shellId = text(slot.closest<HTMLElement>('[data-hg-place-sheet-shell="1"]')?.dataset.placeId);
  if (shellId && shellId !== id) return;
  slot.innerHTML = renderCanonicalSourcesHtml(place, context.visibleArticles);
  slot.dataset.placeId = id;
  slot.hidden = false;
}

export function adoptCanonicalSources(placeId: string): HTMLElement | null {
  const id = text(placeId);
  const slot = ensureSlot();
  if (!id || !(slot instanceof HTMLElement)) return null;
  const owner = slot.querySelector<HTMLElement>('[data-hg-place-sheet-owner="sources"]');
  if (!slot.hidden && text(slot.dataset.placeId) === id && owner instanceof HTMLElement) return slot;
  void hydrate(id);
  return null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalSources(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  sources: { renderHtml: renderCanonicalSourcesHtml, adopt: adoptCanonicalSources }
};
