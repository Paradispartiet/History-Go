// Leksikon owns chronology; history_layers keep their separate renderer.
type PlaceLike = Record<string, any>;
type ChronologyRuntime = Window & typeof globalThis & {
  LEKSIKON_BY_PLACE?: Record<string, PlaceLike[]>;
};

const runtime = window as ChronologyRuntime;
const ownerSelector = '[data-hg-place-sheet-owner="chronology"]';
const text = (value: unknown): string => String(value ?? "").trim();
const escapeHtml = (value: unknown): string => text(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

export function mountCanonicalChronology(container: HTMLElement, place: PlaceLike): HTMLElement | null {
  container.querySelectorAll(ownerSelector).forEach(node => node.remove());
  const placeId = text(place?.id);
  const articles = runtime.LEKSIKON_BY_PLACE?.[placeId] || [];
  const seen = new Set<string>();
  const rows = articles
    .filter(article => !text(article.place_id || article.place) || text(article.place_id || article.place) === placeId)
    .flatMap(article => Array.isArray(article.chronology) ? article.chronology : [])
    .filter(row => row && typeof row === "object" && !Array.isArray(row))
    .filter(row => {
      const key = [row.year || row.date || row.period, row.title || row.text || row.event].map(text).join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
  if (!rows.length) return null;

  const html = rows.map(row => {
    const title = text(row.title || row.text || row.event);
    const summary = text(row.summary || row.description || row.text);
    const sources = Array.isArray(row.sources) ? row.sources : [];
    const links = sources.map((source: unknown) => {
      const item = typeof source === "string" ? { url: source, title: "Kilde" } : source as PlaceLike;
      const url = text(item?.url);
      if (!/^https:\/\//.test(url)) return "";
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "Kilde")} ↗</a>`;
    }).filter(Boolean).join(" · ");
    return `<article class="hg-place-timeline-item"><span class="hg-place-timeline-marker" aria-hidden="true"></span><div class="hg-place-timeline-copy"><span class="hg-place-timeline-period">${escapeHtml(row.period || row.year || row.date)}</span><strong>${escapeHtml(title)}</strong>${summary && summary !== title ? `<p>${escapeHtml(summary)}</p>` : ""}${links ? `<p>${links}</p>` : ""}</div></article>`;
  }).join("");
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", `<section class="hg-section hg-place-section hg-place-history-section" data-hg-place-sheet-owner="chronology"><h3>Kronologi</h3><div class="hg-place-timeline">${html}</div></section>`);
  return container.querySelector<HTMLElement>(ownerSelector);
}
