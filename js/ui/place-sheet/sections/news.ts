type NewsLike = Record<string, any>;

type PlaceSheetNewsApi = {
  renderContentHtml: (historicalNews: NewsLike[], newsNotes: NewsLike[]) => string;
  renderHtml: (historicalNews: NewsLike[], newsNotes: NewsLike[]) => string;
  mount: (container: HTMLElement, historicalNews: NewsLike[], newsNotes: NewsLike[]) => HTMLElement | null;
};

type PlaceSheetNewsRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Record<string, unknown> & { news?: PlaceSheetNewsApi };
};

const runtime = window as PlaceSheetNewsRuntime;

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
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="news"]');
}

const newsApi: PlaceSheetNewsApi = {
  renderContentHtml: renderNewsContentHtml,
  renderHtml: renderCanonicalNewsHtml,
  mount: mountCanonicalNews
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  news: newsApi
};
