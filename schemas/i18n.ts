/**
 * Shared TypeScript-only shapes for i18n/place tooling.
 *
 * These types describe the repository's existing place translation files and
 * generated worklist reports. They intentionally add no runtime behavior.
 */

export type JsonObject = Record<string, unknown>;

export type PlaceTranslationStatus = string;

export interface PlaceSourcePayload {
  name: string;
  desc: string;
  popupDesc: string;
}

export interface PlaceTranslationEntry extends JsonObject {
  name?: string;
  desc?: string;
  popupDesc?: string;
  _sourceHash?: string;
  _status?: PlaceTranslationStatus;
}

export type PlaceTranslationMap = Record<string, PlaceTranslationEntry>;

export interface ExistingPlaceTranslationSnapshot extends JsonObject {
  _sourceHash?: unknown;
  _status?: unknown;
  name?: unknown;
  desc?: unknown;
  popupDesc?: unknown;
}

export type I18nWorklistStatus = "missing" | "missingSourceHash" | "stale" | "ok";

export interface I18nWorklistItem extends JsonObject {
  id: string;
  lang: string;
  status: I18nWorklistStatus;
  sourceFile: string;
  sourceHash: string;
  category: string;
  year: unknown;
  source: PlaceSourcePayload;
  existingTranslation: ExistingPlaceTranslationSnapshot | null;
  requiredOutputShape: PlaceSourcePayload & {
    _sourceHash: string;
    _status: string;
  };
}

export interface I18nWorklistReport extends JsonObject {
  generatedAt: string;
  lang: string;
  sourceLanguage: string;
  master: string;
  translationFile: string;
  policy: JsonObject;
  counts: {
    masterPlaces: number;
    duplicateMasterIds: number;
    matchingItemsBeforeLimit: number;
    emittedItems: number;
  };
  duplicateMasterIds: string[];
  items: I18nWorklistItem[];
}
