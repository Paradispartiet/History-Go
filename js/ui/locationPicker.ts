import type { Place } from "../../schemas/place";
import type {
  LocationOverrideInput,
  ManualLocationOverride
} from "../core/positionStore";

export type LocationPickerDependencies = {
  getLocationOverride: () => ManualLocationOverride | null;
  setLocationOverride: (location: LocationOverrideInput) => boolean;
  clearLocationOverride: () => void;
  requestLocation: () => Promise<unknown>;
};

type CategoryDefinition = { id?: unknown; name?: unknown };
type I18nApi = { localizePlaces?: (places: Place[]) => Place[] };
type PickerWindow = Window & typeof globalThis & {
  PLACES?: Place[];
  CATEGORY_LIST?: CategoryDefinition[];
  HG_I18N?: I18nApi;
};

type CivicationLocationPlace = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type CivicationLocation = {
  cityId: string;
  label: string;
  lat: number;
  lon: number;
  places: CivicationLocationPlace[];
};

type ExtendedPlace = Place & {
  cityId?: unknown;
  cityLabel?: unknown;
  city?: unknown;
  municipality?: unknown;
  kommune?: unknown;
  country?: unknown;
  aliases?: unknown[];
  tags?: unknown[];
};

export type LocationPickerRuntime = {
  openLocationPicker: () => Promise<void>;
  searchLocationPlaces: (query: unknown, options?: { limit?: number }) => Place[];
  setLocationFromPlace: (selectedPlace: Place | null | undefined) => boolean;
};

const win = window as PickerWindow;
const CIVICATION_LOCATION_MANIFEST_PATH = "data/Civication/locations/manifest.json";
let civicationLocationsCache: CivicationLocation[] | null = null;
let civicationLocationsPromise: Promise<CivicationLocation[]> | null = null;
let activeLocationPickerClose: (() => void) | null = null;

function normalizeLocationSearch(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeLocationHTML(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLocationPlaceName(place: Place | null | undefined): string {
  return String(place?.name || place?.title || place?.id || "").trim();
}

function hasValidLocationCoordinates(place: Place | null | undefined): boolean {
  const lat = Number(place?.lat);
  const lon = Number(place?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function getLocationCategoryLabel(categoryId: unknown): string {
  const id = String(categoryId || "").trim();
  if (!id) return "History Go-sted";
  const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  const category = categories.find((entry) => String(entry?.id || "").trim() === id);
  return String(category?.name || id).trim();
}

function getLocationPlaceMeta(place: ExtendedPlace): string {
  const category = getLocationCategoryLabel(place.category);
  const context = String(
    place.cityLabel || place.city || place.municipality || place.kommune || place.country || ""
  ).trim();
  return [category, context]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(" · ");
}

function getCanonicalPlaces(): Place[] {
  return Array.isArray(win.PLACES) ? win.PLACES : [];
}

function getLocalizedPlaces(places: Place[]): Place[] {
  const localized = win.HG_I18N?.localizePlaces?.(places);
  return Array.isArray(localized) ? localized : places;
}

async function loadCivicationLocations(): Promise<CivicationLocation[]> {
  if (civicationLocationsCache) return civicationLocationsCache;
  if (civicationLocationsPromise) return civicationLocationsPromise;

  civicationLocationsPromise = fetch(CIVICATION_LOCATION_MANIFEST_PATH, { cache: "no-store" })
    .then((response) => response.ok ? response.json() as Promise<unknown> : null)
    .then((data) => {
      const rawLocations = data && typeof data === "object" && Array.isArray((data as { locations?: unknown[] }).locations)
        ? (data as { locations: unknown[] }).locations
        : [];

      civicationLocationsCache = rawLocations
        .map((value): CivicationLocation | null => {
          if (!value || typeof value !== "object") return null;
          const raw = value as Record<string, unknown>;
          const rawPlaces = Array.isArray(raw.places) ? raw.places : [];
          const location: CivicationLocation = {
            cityId: String(raw.cityId || "").trim(),
            label: String(raw.label || "").trim(),
            lat: Number(raw.lat),
            lon: Number(raw.lon),
            places: rawPlaces
              .map((place): CivicationLocationPlace | null => {
                if (!place || typeof place !== "object") return null;
                const row = place as Record<string, unknown>;
                const parsed = {
                  id: String(row.id || "").trim(),
                  label: String(row.label || "").trim(),
                  lat: Number(row.lat),
                  lon: Number(row.lon)
                };
                return parsed.id && parsed.label && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon)
                  ? parsed
                  : null;
              })
              .filter((place): place is CivicationLocationPlace => Boolean(place))
          };
          return location.cityId && location.label && Number.isFinite(location.lat) && Number.isFinite(location.lon)
            ? location
            : null;
        })
        .filter((location): location is CivicationLocation => Boolean(location));

      return civicationLocationsCache;
    })
    .catch(() => {
      civicationLocationsCache = [];
      return civicationLocationsCache;
    })
    .finally(() => {
      civicationLocationsPromise = null;
    });

  return civicationLocationsPromise;
}

export function createLocationPickerRuntime(deps: LocationPickerDependencies): LocationPickerRuntime {
  const searchLocationPlaces = (query: unknown, { limit = 12 }: { limit?: number } = {}): Place[] => {
    const normalizedQuery = normalizeLocationSearch(query);
    if (normalizedQuery.length < 2) return [];

    const places = getLocalizedPlaces(getCanonicalPlaces());
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const rows: Array<{ place: Place; score: number; name: string }> = [];
    const seenIds = new Set<string>();

    for (const place of places) {
      if (!place || place.hidden || place.stub) continue;
      const id = String(place.id || "").trim();
      const name = getLocationPlaceName(place);
      if (!id || seenIds.has(id) || !name || !hasValidLocationCoordinates(place)) continue;

      const extended = place as ExtendedPlace;
      const normalizedName = normalizeLocationSearch(name);
      const normalizedId = normalizeLocationSearch(id.replace(/[_-]+/g, " "));
      const category = normalizeLocationSearch(getLocationCategoryLabel(place.category));
      const extra = [
        extended.cityLabel,
        extended.city,
        extended.municipality,
        extended.kommune,
        extended.country,
        ...(Array.isArray(extended.aliases) ? extended.aliases : []),
        ...(Array.isArray(extended.tags) ? extended.tags : [])
      ];
      const haystack = normalizeLocationSearch([name, id, category, ...extra].filter(Boolean).join(" "));
      if (!tokens.every((token) => haystack.includes(token))) continue;
      seenIds.add(id);

      let score = 20;
      if (normalizedName === normalizedQuery) score = 120;
      else if (normalizedName.startsWith(normalizedQuery)) score = 100;
      else if (normalizedName.includes(normalizedQuery)) score = 80;
      else if (normalizedId === normalizedQuery) score = 70;
      else if (normalizedId.startsWith(normalizedQuery)) score = 60;
      else if (category.includes(normalizedQuery)) score = 40;

      rows.push({ place, score, name });
    }

    const safeLimit = Math.max(1, Math.min(30, Number(limit) || 12));
    return rows
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "nb"))
      .slice(0, safeLimit)
      .map((row) => row.place);
  };

  const setLocationFromPlace = (selectedPlace: Place | null | undefined): boolean => {
    const id = String(selectedPlace?.id || "").trim();
    if (!id) return false;

    const canonicalPlaces = getCanonicalPlaces();
    const canonicalPlace = canonicalPlaces.find((place) =>
      place.id === id && !place.hidden && !place.stub && hasValidLocationCoordinates(place)
    );
    if (!canonicalPlace) return false;

    const extended = canonicalPlace as ExtendedPlace;
    const localizedPlace = getLocalizedPlaces(canonicalPlaces).find((place) => place.id === id);
    const label = getLocationPlaceName(localizedPlace) || getLocationPlaceName(canonicalPlace);
    const cityLabel = String(
      extended.cityLabel || extended.city || extended.municipality || extended.kommune || ""
    ).trim();

    return deps.setLocationOverride({
      cityId: String(extended.cityId || extended.city || extended.municipality || extended.kommune || "").trim(),
      cityLabel,
      placeId: id,
      label,
      lat: canonicalPlace.lat,
      lon: canonicalPlace.lon,
      source: "history-go-place-picker"
    });
  };

  const openLocationPicker = async (): Promise<void> => {
    const locations = await loadCivicationLocations();
    const active = deps.getLocationOverride();

    activeLocationPickerClose?.();
    document.getElementById("locationPickerModal")?.remove();

    const modal = document.createElement("div");
    modal.className = "modal hg-location-picker";
    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "locationPickerTitle");
    modal.id = "locationPickerModal";

    const activeTitle = active?.label || active?.cityLabel || active?.cityId || "Faktisk posisjon";
    const activeMeta = active
      ? (active.placeId ? "History Go-sted" : "Manuelt valgt område")
      : "GPS brukes for kart og steder i nærheten";
    const cityOptionsHtml = locations.map((location) => {
      const isActive = !active?.placeId && active?.cityId === location.cityId;
      return `
        <button type="button"
                class="hg-location-quick-option${isActive ? " is-active" : ""}"
                data-location-city="${escapeLocationHTML(location.cityId)}"
                aria-pressed="${isActive ? "true" : "false"}">
          <span class="hg-location-quick-icon" aria-hidden="true">⌖</span>
          <span class="hg-location-option-copy">
            <strong>${escapeLocationHTML(location.label)}</strong>
            <small>Byområde</small>
          </span>
          <span class="hg-location-option-action">${isActive ? "Aktiv" : "Velg"}</span>
        </button>`;
    }).join("");

    modal.innerHTML = `
      <section class="modal-body hg-location-picker-card">
        <header class="hg-location-picker-head">
          <div>
            <span class="hg-location-eyebrow">Kartposisjon</span>
            <h2 id="locationPickerTitle">Velg lokasjon</h2>
            <p>Finn et offentlig History Go-sted, velg et byområde eller bruk GPS.</p>
          </div>
          <button type="button" class="sheet-close hg-location-close" data-location-close aria-label="Lukk lokasjonsvelger">×</button>
        </header>

        <div class="hg-location-active" data-location-active-mode="${active ? "manual" : "gps"}">
          <span class="hg-location-active-icon" aria-hidden="true">◎</span>
          <span class="hg-location-active-copy">
            <small>Aktiv lokasjon</small>
            <strong>${escapeLocationHTML(activeTitle)}</strong>
            <span>${escapeLocationHTML(activeMeta)}</span>
          </span>
          <span class="hg-location-active-dot" aria-hidden="true"></span>
        </div>

        <label class="hg-location-search" for="locationPlaceSearch">
          <span class="hg-location-section-label">Søk i History Go-steder</span>
          <span class="hg-location-search-field">
            <span class="hg-location-search-icon" aria-hidden="true">⌕</span>
            <input id="locationPlaceSearch" type="search" placeholder="Skriv navnet på et sted …"
                   autocomplete="off" enterkeyhint="search" aria-controls="locationPlaceResults"
                   aria-autocomplete="list">
          </span>
        </label>

        <div id="locationPlaceResults" class="hg-location-results" role="listbox"
             aria-label="Treff i History Go-steder" aria-live="polite" hidden></div>

        <section class="hg-location-quick" data-location-quick>
          <div class="hg-location-section-head">
            <span class="hg-location-section-label">Hurtigvalg</span>
            <span>Byområder</span>
          </div>
          <div class="hg-location-quick-grid">
            ${cityOptionsHtml || '<div class="hg-location-empty">Ingen byområder tilgjengelig.</div>'}
          </div>
        </section>

        <button type="button" class="hg-location-gps" data-location-use-gps>
          <span class="hg-location-gps-icon" aria-hidden="true">◉</span>
          <span class="hg-location-option-copy">
            <strong>Bruk faktisk posisjon</strong>
            <small>Oppdater kartet med GPS på denne enheten</small>
          </span>
          <span class="hg-location-option-arrow" aria-hidden="true">→</span>
        </button>
      </section>`;

    const onDocumentKeydown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    const close = (): void => {
      document.removeEventListener("keydown", onDocumentKeydown);
      modal.remove();
      if (activeLocationPickerClose === close) activeLocationPickerClose = null;
    };

    modal.addEventListener("click", (event) => {
      const target = event.target;
      if (target === modal || (target instanceof Element && target.hasAttribute("data-location-close"))) close();
    });

    modal.querySelector("[data-location-use-gps]")?.addEventListener("click", () => {
      deps.clearLocationOverride();
      close();
      void deps.requestLocation();
    });

    modal.querySelectorAll<HTMLElement>("[data-location-city]").forEach((button) => {
      button.addEventListener("click", () => {
        const cityId = button.getAttribute("data-location-city");
        const city = locations.find((location) => location.cityId === cityId);
        if (!city) return;
        deps.setLocationOverride({
          cityId: city.cityId,
          cityLabel: city.label,
          label: city.label,
          lat: city.lat,
          lon: city.lon,
          source: "civication-location-picker"
        });
        close();
      });
    });

    const searchInput = modal.querySelector<HTMLInputElement>("#locationPlaceSearch");
    const searchResults = modal.querySelector<HTMLElement>("#locationPlaceResults");
    const quickOptions = modal.querySelector<HTMLElement>("[data-location-quick]");
    let currentResults: Place[] = [];

    const chooseSearchPlace = (placeId: unknown): void => {
      const id = String(placeId || "").trim();
      const place = currentResults.find((entry) => entry.id === id);
      if (place && setLocationFromPlace(place)) close();
    };

    const renderPlaceResults = (): void => {
      if (!searchInput || !searchResults) return;
      const query = searchInput.value.trim();
      const hasSearch = normalizeLocationSearch(query).length >= 2;
      quickOptions?.toggleAttribute("hidden", hasSearch);

      if (!hasSearch) {
        currentResults = [];
        searchResults.innerHTML = "";
        searchResults.setAttribute("hidden", "");
        return;
      }

      currentResults = searchLocationPlaces(query, { limit: 12 });
      searchResults.removeAttribute("hidden");

      if (!currentResults.length) {
        const hasPlaces = getCanonicalPlaces().length > 0;
        searchResults.innerHTML = `
          <div class="hg-location-empty">
            <strong>${hasPlaces ? "Ingen History Go-steder funnet" : "Stedsregisteret lastes inn"}</strong>
            <span>${hasPlaces ? `Prøv et annet stedsnavn enn «${escapeLocationHTML(query)}».` : "Vent et øyeblikk og prøv igjen."}</span>
          </div>`;
        return;
      }

      searchResults.innerHTML = currentResults.map((place) => {
        const isActive = active?.placeId === place.id;
        return `
          <button type="button" class="hg-location-result${isActive ? " is-active" : ""}"
                  role="option" aria-selected="${isActive ? "true" : "false"}"
                  data-location-search-place="${escapeLocationHTML(place.id)}">
            <span class="hg-location-result-icon" aria-hidden="true">⌖</span>
            <span class="hg-location-option-copy">
              <strong>${escapeLocationHTML(getLocationPlaceName(place))}</strong>
              <small>${escapeLocationHTML(getLocationPlaceMeta(place as ExtendedPlace))}</small>
            </span>
            <span class="hg-location-option-action">${isActive ? "Aktiv" : "Velg"}</span>
          </button>`;
      }).join("");
    };

    searchInput?.addEventListener("input", renderPlaceResults);
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        const first = searchResults?.querySelector<HTMLElement>("[data-location-search-place]");
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Enter" && currentResults.length) {
        event.preventDefault();
        chooseSearchPlace(currentResults[0].id);
      }
    });

    searchResults?.addEventListener("click", (event) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-location-search-place]")
        : null;
      if (target) chooseSearchPlace(target.dataset.locationSearchPlace);
    });

    searchResults?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const buttons = Array.from(searchResults.querySelectorAll<HTMLElement>("[data-location-search-place]"));
      const index = buttons.indexOf(document.activeElement as HTMLElement);
      if (index < 0) return;
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      buttons[(index + direction + buttons.length) % buttons.length]?.focus();
    });

    document.body.appendChild(modal);
    activeLocationPickerClose = close;
    document.addEventListener("keydown", onDocumentKeydown);
  };

  return { openLocationPicker, searchLocationPlaces, setLocationFromPlace };
}
