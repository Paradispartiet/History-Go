// History Go runtime category registry.
// This is the canonical UI/runtime list for place.category, chips and merit display.

export type CategoryScope = "runtime_domain" | "runtime_domain_alias" | "subfield_display";

export type CategoryDefinition = {
  id: string;
  name: string;
  icon: string;
  color: string;
  scope: CategoryScope;
  canonicalFagId?: string;
  aliases?: string[];
  parentId?: string;
};

type TagRegistryEntry = {
  cat?: unknown;
  category?: unknown;
  categoryId?: unknown;
  category_id?: unknown;
};

type PlaceLike = Record<string, unknown>;
type DataHubLike = Record<string, unknown> & {
  __hgReligionCategoryPolicyInstalled?: boolean;
};

type RuntimeWindow = Window & typeof globalThis & {
  TAGS_REGISTRY?: Record<string, TagRegistryEntry>;
  CATEGORY_LIST?: CategoryDefinition[];
  catColor?: (categoryId: unknown) => string;
  catClass?: (categoryId: unknown) => string;
  tagToCat?: (tag: unknown) => string | null;
  catIdFromDisplay?: (display: unknown) => string | null;
  DataHub?: DataHubLike;
  HGPlaceCategoryPolicy?: {
    isReligiousPlace: (place: unknown) => boolean;
    normalizePlace: (place: unknown) => unknown;
    normalizePlaces: (places: unknown) => unknown;
  };
};

const win = window as RuntimeWindow;

const CATEGORY_LIST: CategoryDefinition[] = [
  { id: "historie", name: "Historie", icon: "🏛️", color: "#f6c800", scope: "runtime_domain" },
  { id: "religion", name: "Religion", icon: "🛐", color: "#d7b46a", scope: "runtime_domain" },
  { id: "vitenskap", name: "Vitenskap & filosofi", icon: "🧪", color: "#6ee7ff", scope: "runtime_domain" },
  { id: "kunst", name: "Kunst & kultur", icon: "🎨", color: "#ff5aa5", scope: "runtime_domain" },
  { id: "musikk", name: "Musikk & scenekunst", icon: "🎭", color: "#b48cff", scope: "runtime_domain" },
  { id: "natur", name: "Natur & miljø", icon: "🌿", color: "#59d36a", scope: "runtime_domain" },
  { id: "sport", name: "Sport & lek", icon: "⚽", color: "#ff8a3d", scope: "runtime_domain" },
  { id: "by", name: "By & arkitektur", icon: "🏙️", color: "#7fb3ff", scope: "runtime_domain" },
  { id: "politikk", name: "Politikk & samfunn", icon: "🏛️", color: "#ffd27a", scope: "runtime_domain" },
  { id: "subkultur", name: "Subkultur", icon: "🧷", color: "#9b7bff", scope: "runtime_domain" },
  { id: "litteratur", name: "Litteratur", icon: "📚", color: "#ffcc66", scope: "runtime_domain" },
  { id: "naeringsliv", name: "Næringsliv", icon: "🏭", color: "#9ad0c2", scope: "runtime_domain" },
  { id: "psykologi", name: "Psykologi", icon: "🧠", color: "#ff9aa2", scope: "runtime_domain" },
  { id: "film_tv", name: "Film & TV", icon: "🎞️", color: "#6c757d", scope: "runtime_domain" },
  { id: "media", name: "Medier", icon: "🗞️", color: "#c0c0c0", scope: "runtime_domain" },
  {
    id: "populaerkultur",
    name: "Populærkultur",
    icon: "📺",
    color: "#a0a0a0",
    scope: "runtime_domain_alias",
    canonicalFagId: "popkultur",
    aliases: ["popkultur"]
  },
  {
    id: "scenekunst",
    name: "Scenekunst",
    icon: "🎭",
    color: "#c59cff",
    scope: "subfield_display",
    parentId: "kunst",
    canonicalFagId: "kunst"
  }
];

const CAT_BY_ID: Record<string, CategoryDefinition> = Object.create(null);
const CAT_BY_NAME: Record<string, CategoryDefinition> = Object.create(null);

for (const category of CATEGORY_LIST) {
  CAT_BY_ID[category.id] = category;
  CAT_BY_NAME[category.name.trim().toLowerCase()] = category;
}

function norm(value: unknown): string {
  return String(value ?? "").trim();
}

function catColor(categoryId: unknown): string {
  const category = CAT_BY_ID[norm(categoryId)];
  return category?.color || "#6c757d";
}

function catClass(categoryId: unknown): string {
  const id = norm(categoryId).toLowerCase().replace(/[^a-z0-9_]+/g, "-");
  return id ? `cat-${id}` : "cat-unknown";
}

function tagToCat(tag: unknown): string | null {
  const normalizedTag = norm(tag);
  if (!normalizedTag) return null;
  if (CAT_BY_ID[normalizedTag]) return normalizedTag;

  const registry = win.TAGS_REGISTRY;
  const entry = registry && typeof registry === "object" ? registry[normalizedTag] : null;
  if (entry && typeof entry === "object") {
    const categoryId = norm(entry.cat ?? entry.category ?? entry.categoryId ?? entry.category_id);
    if (categoryId && CAT_BY_ID[categoryId]) return categoryId;
  }

  return null;
}

function catIdFromDisplay(display: unknown): string | null {
  const normalizedDisplay = norm(display).toLowerCase();
  if (!normalizedDisplay) return null;
  if (CAT_BY_ID[normalizedDisplay]) return normalizedDisplay;
  if (CAT_BY_NAME[normalizedDisplay]) return CAT_BY_NAME[normalizedDisplay].id;

  for (const category of CATEGORY_LIST) {
    if (category.name.toLowerCase() === normalizedDisplay) return category.id;
  }
  return null;
}

function normalizeReligiousText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const RELIGIOUS_PLACE_RE = /(?:^|\s)(?:kirke|kirken|kyrkje|kyrkja|kyrkjestad|domkirke|domkyrkje|katedral|cathedral|church|chapel|kapell|basilika|basilica|moske|mosque|masjid|synagoge|synagogue|tempel|temple|kloster|monastery|abbey|convent|mosteiro|igreja|catedral|capela|mesquita|sinagoga|santuario|helligdom|shrine|gravlund|kirkegard|kyrkjegard|churchyard|cemetery|graveyard|prestegard|prestebustad|steinkross)(?:\s|$)/;

function isReligiousPlace(place: unknown): boolean {
  if (!place || typeof place !== "object" || Array.isArray(place)) return false;
  const row = place as PlaceLike;
  if (norm(row.category) === "religion") return true;

  const identity = [
    row.id,
    row.name,
    row.placeType,
    row.place_type,
    row.subtype,
    row.assetType,
    row.type
  ]
    .map(normalizeReligiousText)
    .filter(Boolean)
    .join(" ");

  return RELIGIOUS_PLACE_RE.test(identity);
}

function normalizeReligiousPlace(place: unknown): unknown {
  if (!isReligiousPlace(place)) return place;
  const row = place as PlaceLike;
  if (row.category === "religion" && !Object.prototype.hasOwnProperty.call(row, "secondaryBadgeIds")) return place;

  const normalized: PlaceLike = { ...row, category: "religion" };
  // Religiøse steder skal ligge under Religion som én tydelig primærbadge,
  // ikke samtidig beholdes under tidligere Historie/By/Litteratur-badges.
  delete normalized.secondaryBadgeIds;
  return normalized;
}

function normalizeReligiousPayload(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload.map(normalizeReligiousPlace);
  if (!payload || typeof payload !== "object") return payload;

  const row = payload as PlaceLike;
  if (Array.isArray(row.places)) {
    return { ...row, places: row.places.map(normalizeReligiousPlace) };
  }
  if (typeof row.id === "string" && (Object.prototype.hasOwnProperty.call(row, "category") || Object.prototype.hasOwnProperty.call(row, "lat"))) {
    return normalizeReligiousPlace(row);
  }
  return payload;
}

function installDataHubCategoryPolicy(dataHub: DataHubLike | undefined): void {
  if (!dataHub || dataHub.__hgReligionCategoryPolicyInstalled) return;

  const loaderNames = ["loadPlacesBase", "loadPlaces", "loadFullPlace", "getPlaceEnriched", "loadEnrichedAll"];
  for (const loaderName of loaderNames) {
    const original = dataHub[loaderName];
    if (typeof original !== "function") continue;

    dataHub[loaderName] = async (...args: unknown[]) => {
      const result = await Reflect.apply(original, dataHub, args);
      return normalizeReligiousPayload(result);
    };
  }

  dataHub.__hgReligionCategoryPolicyInstalled = true;
}

function installDataHubWatcher(): void {
  if (win.DataHub) {
    installDataHubCategoryPolicy(win.DataHub);
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(win, "DataHub");
  if (descriptor && descriptor.configurable === false) return;

  Object.defineProperty(win, "DataHub", {
    configurable: true,
    enumerable: true,
    get() {
      return undefined;
    },
    set(value: DataHubLike | undefined) {
      Object.defineProperty(win, "DataHub", {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
      installDataHubCategoryPolicy(value);
    }
  });
}

win.CATEGORY_LIST = CATEGORY_LIST;
win.catColor = catColor;
win.catClass = catClass;
win.tagToCat = tagToCat;
win.catIdFromDisplay = catIdFromDisplay;
win.HGPlaceCategoryPolicy = {
  isReligiousPlace,
  normalizePlace: normalizeReligiousPlace,
  normalizePlaces: normalizeReligiousPayload
};

installDataHubWatcher();

export { CATEGORY_LIST, catColor, catClass, tagToCat, catIdFromDisplay, isReligiousPlace, normalizeReligiousPlace };
