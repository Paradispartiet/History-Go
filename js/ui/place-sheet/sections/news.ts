import { resolvePlaceKnowledgeContext } from "../place-section-context";

type NewsLike = Record<string, any>;
type PlaceLike = Record<string, any>;

type PlaceSheetNewsApi = {
  renderContentHtml: (historicalNews: NewsLike[], newsNotes: NewsLike[]) => string;
  renderHtml: (historicalNews: NewsLike[], newsNotes: NewsLike[]) => string;
  mount: (container: HTMLElement, historicalNews: NewsLike[], newsNotes: NewsLike[]) => HTMLElement | null;
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetNewsRuntime = Window & typeof globalThis & {
  PLACES?: PlaceLike[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => PlaceLike | null };
  HGPlaceSheetSections?: Record<string, unknown> & { news?: PlaceSheetNewsApi };
};

const runtime = window as PlaceSheetNewsRuntime;
let hydrationGeneration = 0;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function rows(value: unknown): NewsLike[] {
  return Array.isArray(value)
    ? value.filter(item => Boolean(item && typeof item === "object" && !Array.isArray(item))) as NewsLike[]
    : [];
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

function newsCards(items: NewsLike[]): string {
  const values = rows(items);
  if (!values.length) return "";
  return `<div class="hg-place-tab-card-list pc-sheet-news-list">${values.map(item => {
    const title = text(item?.title || item?.name || item?.id || "Notis");
    const meta = [item?.date || item?.year || item?.period, item?.category || item?.type]
      .map(text).filter(Boolean).join(" · ");
    const summary = text(item?.summary?.one_liner || item?.popupDesc || item?.desc || item?.description);
    const rawSource = Array.isArray(item?.sources) ? item.sources[0] : null;
    const sourceUrl = safeHttpsUrl(typeof rawSource === "string" ? rawSource : rawSource?.url);
    const sourceLabel = text(typeof rawSource === "string" ? "Offisiell kilde" : rawSource?.label || rawSource?.title || "Offisiell kilde");
    return `<article class="hg-place-tab-card pc-sheet-news-card"><strong>${escapeHtml(title)}</strong>${meta ? `<span>${escapeHtml(meta)}</span>` : ""}${summary ? `<p>${escapeHtml(summary)}</p>` : ""}${sourceUrl ? `<a class="hg-place-news-source" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceLabel)} ↗</a>` : ""}</article>`;
  }).join("")}</div>`;
}

function detailSection(title: string, body: string): string {
  return body
    ? `<section class="hg-section hg-place-section hg-place-tab-section"><h3>${escapeHtml(title)}</h3>${body}</section>`
    : "";
}

export function renderNewsContentHtml(historicalNews: NewsLike[], newsNotes: NewsLike[]): string {
  const oldRows = rows(historicalNews);
  const newRows = rows(newsNotes);
  return [
    oldRows.length ? detailSection("Gamle nyheter", newsCards(oldRows)) : "",
    newRows.length ? detailSection("Nyere notiser", newsCards(newRows)) : ""
  ].join("");
}

export function renderCanonicalNewsHtml(historicalNews: NewsLike[], newsNotes: NewsLike[]): string {
  const content = renderNewsContentHtml(historicalNews, newsNotes);
  if (!content) return "";
  return `
    <section class="hg-section hg-place-news-section" data-hg-place-sheet-owner="news">
      <h3>Nyheter</h3>
      ${content}
    </section>
  `;
}

export function mountCanonicalNews(container: HTMLElement, historicalNews: NewsLike[], newsNotes: NewsLike[]): HTMLElement | null {
  const html = renderCanonicalNewsHtml(historicalNews, newsNotes);
  container.replaceChildren();
  delete container.dataset.placeId;
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="news"]');
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

function slot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-section="news"]');
}

function invalidate(target: HTMLElement): void {
  target.replaceChildren();
  target.hidden = true;
  delete target.dataset.placeId;
}

async function hydrate(placeId: string): Promise<void> {
  const id = text(placeId);
  const place = placeFor(id);
  const target = slot();
  if (!id || !place || !(target instanceof HTMLElement)) return;
  const generation = ++hydrationGeneration;
  invalidate(target);
  const context = await resolvePlaceKnowledgeContext(place);
  if (generation !== hydrationGeneration || !target.isConnected) return;
  const shellId = text(target.closest<HTMLElement>('[data-hg-place-sheet-shell="1"]')?.dataset.placeId);
  if (shellId && shellId !== id) return;
  const mounted = mountCanonicalNews(target, context.buckets.historical_news, context.buckets.news_notes);
  if (mounted) target.dataset.placeId = id;
}

export function adoptCanonicalNews(placeId: string): HTMLElement | null {
  const id = text(placeId);
  const target = slot();
  if (!id || !(target instanceof HTMLElement)) return null;
  const owner = target.querySelector<HTMLElement>('[data-hg-place-sheet-owner="news"]');
  if (!target.hidden && text(target.dataset.placeId) === id && owner instanceof HTMLElement) return target;
  void hydrate(id);
  return null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalNews(id);
}

runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

const newsApi: PlaceSheetNewsApi = {
  renderContentHtml: renderNewsContentHtml,
  renderHtml: renderCanonicalNewsHtml,
  mount: mountCanonicalNews,
  adopt: adoptCanonicalNews
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  news: newsApi
};
