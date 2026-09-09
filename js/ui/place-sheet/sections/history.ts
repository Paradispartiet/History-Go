type PlaceLike = Record<string, any>;

type HistoryLayer = Record<string, any>;

type PlaceSheetHistoryApi = {
  layers: (place: PlaceLike) => HistoryLayer[];
  renderHtml: (place: PlaceLike) => string;
  mount: (container: HTMLElement, place: PlaceLike) => HTMLElement | null;
};

type PlaceSheetSectionRuntime = Window & typeof globalThis & {
  HG_I18N?: { localizePlace?: (place: PlaceLike) => PlaceLike | null | undefined };
  HGPlaceSheetSections?: Record<string, unknown> & { history?: PlaceSheetHistoryApi };
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

function timelineOrder(item: HistoryLayer, index: number): number {
  const explicit = Number(item?.sort_order ?? item?.sortOrder);
  return Number.isFinite(explicit) ? explicit : index + 1;
}

export function canonicalHistoryLayers(inputPlace: PlaceLike): HistoryLayer[] {
  const place = localize(inputPlace || {});
  const layers = Array.isArray(place.history_layers) ? place.history_layers : [];
  return layers
    .map((item: unknown, index: number) => ({ item, index }))
    .filter(({ item }) => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .sort((a, b) => timelineOrder(a.item as HistoryLayer, a.index) - timelineOrder(b.item as HistoryLayer, b.index))
    .map(({ item }) => item as HistoryLayer);
}

export function renderCanonicalHistoryHtml(inputPlace: PlaceLike): string {
  const layers = canonicalHistoryLayers(inputPlace);
  if (!layers.length) return "";

  return `
    <section class="hg-section hg-place-section hg-place-history-section" data-hg-place-sheet-owner="history">
      <h3>Historiske lag</h3>
      <div class="hg-place-timeline">
        ${layers.map(item => {
          const period = text(item?.period || item?.year || item?.date);
          const title = text(item?.title || item?.name || item?.id);
          const summary = text(item?.summary || item?.desc || item?.description);
          return `
            <article class="hg-place-timeline-item">
              <span class="hg-place-timeline-marker" aria-hidden="true"></span>
              <div class="hg-place-timeline-copy">
                ${period ? `<span class="hg-place-timeline-period">${escapeHtml(period)}</span>` : ""}
                <strong>${escapeHtml(title)}</strong>
                ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

export function mountCanonicalHistory(container: HTMLElement, place: PlaceLike): HTMLElement | null {
  const html = renderCanonicalHistoryHtml(place);
  container.replaceChildren();
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="history"]');
}

const historyApi: PlaceSheetHistoryApi = {
  layers: canonicalHistoryLayers,
  renderHtml: renderCanonicalHistoryHtml,
  mount: mountCanonicalHistory
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  history: historyApi
};
