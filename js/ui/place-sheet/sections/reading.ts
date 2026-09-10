type ReadingLike = Record<string, any>;

type PlaceSheetReadingApi = {
  filterForPlace: (items: ReadingLike[], placeId: string) => ReadingLike[];
  renderContentHtml: (items: ReadingLike[], placeId: string) => string;
  renderHtml: (items: ReadingLike[], placeId: string) => string;
  mount: (container: HTMLElement, items: ReadingLike[], placeId: string) => HTMLElement | null;
  resolve: (placeId: string) => Promise<ReadingLike[]>;
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetReadingRuntime = Window & typeof globalThis & {
  HGPlaceOpen?: {
    get?: (placeId: string) => { lesespor?: ReadingLike[] } | null;
  };
  DataHub?: {
    loadLesespor?: (options?: { cache?: string }) => Promise<{ items?: ReadingLike[] } | ReadingLike[]>;
  };
  HGPlaceSheetSections?: Record<string, unknown> & { reading?: PlaceSheetReadingApi };
};

const runtime = window as PlaceSheetReadingRuntime;
const PAYWALL_TERMS = [
  "paywall",
  "subscription",
  "subscriber",
  "abonnement",
  "betalingsmur",
  "krever abonnement"
] as const;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = ReadingLike>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
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

function uniqueBy(items: ReadingLike[]): ReadingLike[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = text(item?.id)
      || [item?.title, item?.author, item?.publication, item?.year || item?.date].map(text).join("|");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortYear(item: ReadingLike): number {
  return Number(item?.year || String(item?.date || "").slice(0, 4)) || 0;
}

function isOpenReading(item: ReadingLike): boolean {
  const access = [item?.access, item?.access_note, item?.note]
    .map(value => text(value).toLowerCase())
    .join(" ");
  return !PAYWALL_TERMS.some(term => access.includes(term));
}

export function filterReadingForPlace(items: ReadingLike[], placeId: string): ReadingLike[] {
  const id = text(placeId);
  if (!id) return [];
  return uniqueBy(list<ReadingLike>(items).filter(item => (
    list(item?.place_ids).map(text).includes(id) && isOpenReading(item)
  ))).sort((a, b) => sortYear(b) - sortYear(a));
}

function readingCards(rows: ReadingLike[]): string {
  return `<div class="hg-place-reading-list pc-sheet-reading-list">${rows.map(item => {
    const url = safeHttpsUrl(item?.url);
    const meta = [item?.author, item?.publication, item?.year || item?.date, item?.type]
      .map(text).filter(Boolean).join(" · ");
    const relevance = text(item?.relevance);
    return `<article class="hg-place-reading-card pc-sheet-reading-card"><strong>${escapeHtml(item?.title || "Uten tittel")}</strong>${meta ? `<span>${escapeHtml(meta)}</span>` : ""}${relevance ? `<p>${escapeHtml(relevance)}</p>` : ""}${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Les teksten ↗</a>` : ""}</article>`;
  }).join("")}</div>`;
}

export function renderReadingContentHtml(items: ReadingLike[], placeId: string): string {
  const rows = filterReadingForPlace(items, placeId);
  return rows.length ? readingCards(rows) : "";
}

export function renderCanonicalReadingHtml(items: ReadingLike[], placeId: string): string {
  const content = renderReadingContentHtml(items, placeId);
  if (!content) return "";
  return `
    <section class="hg-section hg-place-reading-section pc-sheet-canonical-reading" data-hg-place-sheet-owner="reading">
      <h3>Lesespor</h3>
      ${content}
    </section>
  `;
}

export function mountCanonicalReading(container: HTMLElement, items: ReadingLike[], placeId: string): HTMLElement | null {
  const html = renderCanonicalReadingHtml(items, placeId);
  container.replaceChildren();
  delete container.dataset.placeId;
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="reading"]');
}

function canonicalReading(placeId: string): ReadingLike[] {
  return list<ReadingLike>(runtime.HGPlaceOpen?.get?.(placeId)?.lesespor);
}

export async function resolveReading(placeId: string): Promise<ReadingLike[]> {
  const id = text(placeId);
  if (!id) return [];
  const canonical = canonicalReading(id);
  if (canonical.length) return canonical;

  try {
    const value = await runtime.DataHub?.loadLesespor?.({ cache: "default" });
    const aggregate = Array.isArray((value as { items?: ReadingLike[] } | undefined)?.items)
      ? (value as { items: ReadingLike[] }).items
      : list<ReadingLike>(value);
    return uniqueBy([...aggregate, ...canonicalReading(id)]);
  } catch {
    return canonicalReading(id);
  }
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-reading-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-reading.css";
  link.setAttribute("data-hg-place-sheet-reading-style", "1");
  document.head.appendChild(link);
}

function ensureReadingSlot(): HTMLElement | null {
  const shell = document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
  if (!(shell instanceof HTMLElement)) return null;

  let slot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-reading]");
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-reading";
    slot.setAttribute("data-hg-place-sheet-reading", "1");
    slot.setAttribute("data-hg-place-sheet-section", "reading");
    slot.setAttribute("data-place-panel", "reading");
    slot.hidden = true;
    const news = shell.querySelector<HTMLElement>("[data-hg-place-sheet-news]");
    if (news?.nextSibling) shell.insertBefore(slot, news.nextSibling);
    else shell.appendChild(slot);
  }
  return slot;
}

let hydrationGeneration = 0;

function invalidate(slot: HTMLElement): void {
  slot.replaceChildren();
  slot.hidden = true;
  delete slot.dataset.placeId;
}

async function hydrateUnifiedReading(placeId: string): Promise<void> {
  const id = text(placeId);
  if (!id) return;
  const generation = ++hydrationGeneration;
  const slot = ensureReadingSlot();
  if (!(slot instanceof HTMLElement)) return;
  invalidate(slot);

  const items = await resolveReading(id);
  if (generation !== hydrationGeneration || !slot.isConnected) return;
  const shellId = text(slot.closest<HTMLElement>('[data-hg-place-sheet-shell="1"]')?.dataset.placeId);
  if (shellId && shellId !== id) return;
  const mounted = mountCanonicalReading(slot, items, id);
  if (mounted) slot.dataset.placeId = id;
}

export function adoptCanonicalReading(placeId: string): HTMLElement | null {
  const id = text(placeId);
  const slot = ensureReadingSlot();
  if (!id || !(slot instanceof HTMLElement)) return null;
  const owner = slot.querySelector<HTMLElement>('[data-hg-place-sheet-owner="reading"]');
  if (!slot.hidden && text(slot.dataset.placeId) === id && owner instanceof HTMLElement) return slot;
  void hydrateUnifiedReading(id);
  return null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalReading(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

const readingApi: PlaceSheetReadingApi = {
  filterForPlace: filterReadingForPlace,
  renderContentHtml: renderReadingContentHtml,
  renderHtml: renderCanonicalReadingHtml,
  mount: mountCanonicalReading,
  resolve: resolveReading,
  adopt: adoptCanonicalReading
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  reading: readingApi
};
