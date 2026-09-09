export const PLACE_SHEET_SECTION_IDS = [
  "about",
  "history",
  "stories",
  "before-after",
  "news",
  "reading",
  "language",
  "learning",
  "sources",
  "special"
] as const;

export type PlaceSheetSectionId = typeof PLACE_SHEET_SECTION_IDS[number];

export const PLACE_SHEET_IMMEDIATE_SECTION_IDS: readonly PlaceSheetSectionId[] = [
  "about",
  "history",
  "stories",
  "before-after"
];

export const PLACE_SHEET_COMPAT_SECTION_BATCHES: readonly (readonly PlaceSheetSectionId[])[] = [
  ["news", "reading"],
  ["language", "learning"],
  ["sources"],
  ["special"]
];

type SectionApi = {
  applies?: (placeId: string) => boolean;
  adopt?: (placeId: string) => HTMLElement | null;
};

type PlaceSheetRegistryRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Partial<Record<PlaceSheetSectionId, SectionApi>> & Record<string, unknown>;
};

const runtime = window as PlaceSheetRegistryRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

export function placeSheetSectionNode(id: PlaceSheetSectionId): HTMLElement | null {
  const root = document.getElementById("placeCard");
  if (!(root instanceof HTMLElement)) return null;
  const direct = root.querySelector<HTMLElement>(`[data-hg-place-sheet-section="${id}"]`);
  if (direct instanceof HTMLElement) return direct;
  const compatibility = root.querySelector<HTMLElement>(`[data-hg-unified-section="${id}"], [data-place-panel="${id}"]`);
  return compatibility instanceof HTMLElement ? compatibility : null;
}

export function hasRenderedPlaceSheetSection(id: PlaceSheetSectionId): boolean {
  const node = placeSheetSectionNode(id);
  if (!(node instanceof HTMLElement) || node.hidden) return false;
  if (text(node.dataset.placeId)) return true;
  if (node.querySelector("[data-hg-place-sheet-owner], [data-hg-place-sheet-special-owner], .hg-place-learning-section, [data-language-place], .hg-place-tab-generated")) return true;
  return text(node.textContent).length > 0;
}

export function placeSheetSectionApplies(id: PlaceSheetSectionId, placeId: string): boolean {
  const api = runtime.HGPlaceSheetSections?.[id];
  if (!api || typeof api.applies !== "function") return true;
  try { return api.applies(placeId) === true; } catch { return false; }
}

export function nudgePlaceSheetSection(id: PlaceSheetSectionId, placeId: string): void {
  const api = runtime.HGPlaceSheetSections?.[id];
  if (!api || typeof api.adopt !== "function") return;
  try { api.adopt(placeId); } catch {}
}
