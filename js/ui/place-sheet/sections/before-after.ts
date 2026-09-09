type PlaceLike = Record<string, any>;
type BeforeAfterLike = Record<string, any>;

type PlaceSheetBeforeAfterApi = {
  data: (place: PlaceLike) => BeforeAfterLike | null;
  renderContentHtml: (place: PlaceLike) => string;
  renderHtml: (place: PlaceLike) => string;
  mount: (container: HTMLElement, place: PlaceLike) => HTMLElement | null;
};

type PlaceSheetBeforeAfterRuntime = Window & typeof globalThis & {
  HG_I18N?: { localizePlace?: (place: PlaceLike) => PlaceLike | null | undefined };
  HGPlaceSheetSections?: Record<string, unknown> & { beforeAfter?: PlaceSheetBeforeAfterApi };
};

const runtime = window as PlaceSheetBeforeAfterRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function localize(place: PlaceLike): PlaceLike {
  try {
    return runtime.HG_I18N?.localizePlace?.(place) || place;
  } catch {
    return place;
  }
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

function safeImageUrl(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  if (raw.startsWith("bilder/") || raw.startsWith("assets/")) return raw;
  return safeHttpsUrl(raw);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function detailSection(title: string, body: string): string {
  return body
    ? `<section class="hg-section hg-place-section hg-place-tab-section"><h3>${escapeHtml(title)}</h3>${body}</section>`
    : "";
}

export function canonicalBeforeAfterData(inputPlace: PlaceLike): BeforeAfterLike | null {
  const place = localize(inputPlace || {});
  const data = place?.for_na;
  return data && typeof data === "object" && !Array.isArray(data) ? data as BeforeAfterLike : null;
}

export function renderBeforeAfterContentHtml(inputPlace: PlaceLike): string {
  const place = localize(inputPlace || {});
  const data = canonicalBeforeAfterData(place);
  if (!data) return "";

  const images = [
    {
      label: text(data.beforeImageLabel || data.before_image_label || "Før"),
      url: safeImageUrl(data.beforeImage || data.before_image || data.imageBefore),
      meta: data.beforeImageMeta || data.before_image_meta
    },
    {
      label: text(data.nowImageLabel || data.now_image_label || "Nå"),
      url: safeImageUrl(data.nowImage || data.now_image || data.imageNow),
      meta: data.nowImageMeta || data.now_image_meta
    }
  ].filter(item => item.url);

  const imageHtml = images.length
    ? `<div class="hg-place-before-after-media">${images.map(item => {
        const credit = text(item.meta?.credit || item.meta?.author);
        const license = text(item.meta?.license);
        const sourcePage = safeHttpsUrl(item.meta?.sourcePage || item.meta?.sourceUrl);
        const attribution = [credit, license].filter(Boolean).join(" · ");
        return `<figure><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.label)}: ${escapeHtml(place?.name || "stedet")}" loading="lazy"><figcaption><strong>${escapeHtml(item.label)}</strong>${attribution ? `<span>${escapeHtml(attribution)}</span>` : ""}${sourcePage ? `<a href="${escapeHtml(sourcePage)}" target="_blank" rel="noopener noreferrer">Bildekilde ↗</a>` : ""}</figcaption></figure>`;
      }).join("")}</div>`
    : "";

  const lookFor = strings(data.lookFor || data.look_for || data.observe || data.observer);
  return imageHtml + [
    text(data.before) ? detailSection("Før", `<p>${escapeHtml(data.before)}</p>`) : "",
    text(data.now) ? detailSection("Nå", `<p>${escapeHtml(data.now)}</p>`) : "",
    text(data.change) ? detailSection("Endring", `<p>${escapeHtml(data.change)}</p>`) : "",
    lookFor.length ? detailSection("Se etter i dag", `<ul>${lookFor.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`) : ""
  ].join("");
}

export function renderCanonicalBeforeAfterHtml(place: PlaceLike): string {
  const content = renderBeforeAfterContentHtml(place);
  if (!content) return "";
  return `
    <section class="hg-section hg-place-before-after-section" data-hg-place-sheet-owner="before-after">
      <h3>Før/etter</h3>
      ${content}
    </section>
  `;
}

export function mountCanonicalBeforeAfter(container: HTMLElement, place: PlaceLike): HTMLElement | null {
  const html = renderCanonicalBeforeAfterHtml(place);
  container.replaceChildren();
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="before-after"]');
}

const beforeAfterApi: PlaceSheetBeforeAfterApi = {
  data: canonicalBeforeAfterData,
  renderContentHtml: renderBeforeAfterContentHtml,
  renderHtml: renderCanonicalBeforeAfterHtml,
  mount: mountCanonicalBeforeAfter
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  beforeAfter: beforeAfterApi
};
