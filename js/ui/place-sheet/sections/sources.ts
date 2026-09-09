type SourceLike = Record<string, any>;

type PlaceSheetSourcesApi = {
  renderContentHtml: (place: SourceLike, articles?: SourceLike[], includeProfileLabels?: boolean) => string;
  renderHtml: (place: SourceLike, articles?: SourceLike[]) => string;
  mount: (container: HTMLElement, place: SourceLike, articles?: SourceLike[]) => HTMLElement | null;
};

type PlaceSheetSourcesRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Record<string, unknown> & { sources?: PlaceSheetSourcesApi };
};

const runtime = window as PlaceSheetSourcesRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = SourceLike>(value: unknown): T[] {
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

function humanize(value: unknown): string {
  const cleaned = text(value).replace(/_/g, " ").replace(/\s+/g, " ");
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  return values.map(text).filter(value => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function sourceLinks(place: SourceLike, articles: SourceLike[]): Array<{ type: string; label: string; url: string }> {
  const configured = [place, ...list<SourceLike>(articles)]
    .flatMap(value => list<SourceLike>(value?.externalLinks))
    .map(link => ({
      type: text(link?.type || "source"),
      label: text(link?.label || link?.title),
      url: safeHttpsUrl(link?.url)
    }));

  const beforeAfter = [
    ...list(place?.for_na?.sources || place?.for_na?.kilder || place?.for_na?.source),
    place?.for_na?.beforeImageMeta?.sourcePage || place?.for_na?.before_image_meta?.sourcePage,
    place?.for_na?.nowImageMeta?.sourcePage || place?.for_na?.now_image_meta?.sourcePage
  ].map(url => ({
    type: "image_source",
    label: "Bilde- og sammenligningskilde",
    url: safeHttpsUrl(url)
  }));

  const seen = new Set<string>();
  return [...configured, ...beforeAfter].filter(link => {
    if (!link.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function sourceLabels(place: SourceLike): string[] {
  const summary = place?.source_summary && typeof place.source_summary === "object"
    ? place.source_summary
    : (place?.sourceSummary && typeof place.sourceSummary === "object" ? place.sourceSummary : {});
  return uniqueStrings(list(summary?.safe_sources || summary?.sources));
}

function detailSection(title: string, body: string): string {
  return body
    ? `<section class="hg-section hg-place-section hg-place-tab-section"><h3>${escapeHtml(title)}</h3>${body}</section>`
    : "";
}

export function renderSourcesContentHtml(
  place: SourceLike,
  articles: SourceLike[] = [],
  includeProfileLabels = true
): string {
  const labels = includeProfileLabels ? sourceLabels(place) : [];
  const links = sourceLinks(place, articles);
  const labelHtml = labels.length
    ? detailSection("Kilder i stedprofilen", `<ul class="pc-sheet-source-labels">${labels.map(label => `<li>${escapeHtml(label)}</li>`).join("")}</ul>`)
    : "";
  const linkHtml = links.length
    ? detailSection("Kilder og eksterne oppslag", `<div class="hg-place-source-link-list pc-sheet-source-link-list">${links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(link.label || link.url)}</strong><span>${escapeHtml(humanize(link.type))} ↗</span></a>`).join("")}</div>`)
    : "";
  return labelHtml + linkHtml;
}

export function renderCanonicalSourcesHtml(place: SourceLike, articles: SourceLike[] = []): string {
  const content = renderSourcesContentHtml(place, articles, true);
  if (!content) return "";
  return `
    <section class="hg-section hg-place-sources-section pc-sheet-canonical-sources" data-hg-place-sheet-owner="sources">
      <h3>Kilder</h3>
      ${content}
    </section>
  `;
}

export function mountCanonicalSources(
  container: HTMLElement,
  place: SourceLike,
  articles: SourceLike[] = []
): HTMLElement | null {
  const html = renderCanonicalSourcesHtml(place, articles);
  container.replaceChildren();
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="sources"]');
}

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  sources: {
    renderContentHtml: renderSourcesContentHtml,
    renderHtml: renderCanonicalSourcesHtml,
    mount: mountCanonicalSources
  }
};
