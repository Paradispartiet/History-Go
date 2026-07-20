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

type RuntimeWindow = Window & typeof globalThis & {
  TAGS_REGISTRY?: Record<string, TagRegistryEntry>;
  CATEGORY_LIST?: CategoryDefinition[];
  catColor?: (categoryId: unknown) => string;
  catClass?: (categoryId: unknown) => string;
  tagToCat?: (tag: unknown) => string | null;
  catIdFromDisplay?: (display: unknown) => string | null;
};

const win = window as RuntimeWindow;

const CATEGORY_LIST: CategoryDefinition[] = [
  { id: "historie", name: "Historie", icon: "🏛️", color: "#603E1E", scope: "runtime_domain" },
  { id: "religion", name: "Religion", icon: "🛐", color: "#d7b46a", scope: "runtime_domain" },
  { id: "vitenskap", name: "Vitenskap & filosofi", icon: "🧪", color: "#332B51", scope: "runtime_domain" },
  { id: "kunst", name: "Kunst & kultur", icon: "🎨", color: "#DFB020", scope: "runtime_domain" },
  { id: "musikk", name: "Musikk & scenekunst", icon: "🎭", color: "#122033", scope: "runtime_domain" },
  { id: "natur", name: "Natur & miljø", icon: "🌿", color: "#2E4F21", scope: "runtime_domain" },
  { id: "sport", name: "Sport & lek", icon: "⚽", color: "#A01D13", scope: "runtime_domain" },
  { id: "by", name: "By & arkitektur", icon: "🏙️", color: "#A1917E", scope: "runtime_domain" },
  { id: "politikk", name: "Politikk & samfunn", icon: "🏛️", color: "#103E71", scope: "runtime_domain" },
  { id: "subkultur", name: "Subkultur", icon: "🧷", color: "#914E1E", scope: "runtime_domain" },
  { id: "litteratur", name: "Litteratur", icon: "📚", color: "#E1BE70", scope: "runtime_domain" },
  { id: "naeringsliv", name: "Næringsliv", icon: "🏭", color: "#0F62BD", scope: "runtime_domain" },
  { id: "psykologi", name: "Psykologi", icon: "🧠", color: "#06d6a0", scope: "runtime_domain" },
  { id: "film_tv", name: "Film & TV", icon: "🎞️", color: "#6c757d", scope: "runtime_domain" },
  { id: "media", name: "Medier", icon: "🗞️", color: "#ff595e", scope: "runtime_domain" },
  {
    id: "populaerkultur",
    name: "Populærkultur",
    icon: "📺",
    color: "#41206E",
    scope: "runtime_domain_alias",
    canonicalFagId: "popkultur",
    aliases: ["popkultur"]
  },
  {
    id: "scenekunst",
    name: "Scenekunst",
    icon: "🎭",
    color: "#ffb703",
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

win.CATEGORY_LIST = CATEGORY_LIST;
win.catColor = catColor;
win.catClass = catClass;
win.tagToCat = tagToCat;
win.catIdFromDisplay = catIdFromDisplay;

export { CATEGORY_LIST, catColor, catClass, tagToCat, catIdFromDisplay };
