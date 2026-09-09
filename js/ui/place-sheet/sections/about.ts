type PlaceLike = Record<string, any>;

type AboutRenderOptions = {
  suppressIfSameAsDesc?: boolean;
};

type PlaceSheetAboutApi = {
  text: (place: PlaceLike) => string;
  renderHtml: (place: PlaceLike, options?: AboutRenderOptions) => string;
  mount: (container: HTMLElement, place: PlaceLike, options?: AboutRenderOptions) => HTMLElement | null;
};

type PlaceSheetSectionRuntime = Window & typeof globalThis & {
  HG_I18N?: { localizePlace?: (place: PlaceLike) => PlaceLike | null | undefined };
  HGPlaceSheetSections?: Record<string, unknown> & { about?: PlaceSheetAboutApi };
};

const runtime = window as PlaceSheetSectionRuntime;

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

function normalized(value: unknown): string {
  return text(value).replace(/\s+/g, " ");
}

export function canonicalAboutText(inputPlace: PlaceLike): string {
  const place = localize(inputPlace || {});
  for (const value of [place.popupDesc, place.popupdesc, place.description, place.desc]) {
    const candidate = text(value);
    if (candidate) return candidate;
  }
  return "";
}

function renderParagraphs(value: string): string {
  return text(value)
    .split(/\n\s*\n+/)
    .map(paragraph => text(paragraph))
    .filter(Boolean)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function renderCanonicalAboutHtml(inputPlace: PlaceLike, options: AboutRenderOptions = {}): string {
  const place = localize(inputPlace || {});
  const fullText = canonicalAboutText(place);
  if (!fullText) return "";
  if (options.suppressIfSameAsDesc && normalized(fullText) === normalized(place.desc)) return "";

  return `
    <section class="hg-section hg-place-section hg-place-about-section" data-hg-place-sheet-owner="about">
      <h3>Om stedet</h3>
      <div class="hg-place-longread">${renderParagraphs(fullText)}</div>
    </section>
  `;
}

export function mountCanonicalAbout(
  container: HTMLElement,
  place: PlaceLike,
  options: AboutRenderOptions = {}
): HTMLElement | null {
  const html = renderCanonicalAboutHtml(place, options);
  container.replaceChildren();
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="about"]');
}

const aboutApi: PlaceSheetAboutApi = {
  text: canonicalAboutText,
  renderHtml: renderCanonicalAboutHtml,
  mount: mountCanonicalAbout
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  about: aboutApi
};
