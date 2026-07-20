type BadgeAssetMeta = {
  id?: unknown;
  image?: unknown;
  icon?: unknown;
};

type RuntimeWindow = Window & typeof globalThis & {
  BADGES?: BadgeAssetMeta[];
  DomainRegistry?: {
    toRuntimeCategoryId?: (value: unknown) => unknown;
  };
};

const win = window as RuntimeWindow;

function runtimeCategoryId(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const bridge = win.DomainRegistry?.toRuntimeCategoryId;
  if (typeof bridge === "function") {
    try {
      const resolved = String(bridge(raw) ?? "").trim();
      if (resolved) return resolved;
    } catch {
      // Fall through to the raw runtime id.
    }
  }

  return raw;
}

function imagePath(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//.test(raw)) return raw;
  if (raw.includes("/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return raw;
  return "";
}

export function badgeImageForCategory(categoryId: unknown): string {
  const id = runtimeCategoryId(categoryId);
  if (!id) return "";

  const badge = (Array.isArray(win.BADGES) ? win.BADGES : []).find((row) =>
    runtimeCategoryId(row?.id) === id
  );
  const canonicalImage = imagePath(badge?.image || badge?.icon);
  if (canonicalImage) return canonicalImage;

  // Most legacy badge assets are PNGs. Religion is currently the one canonical
  // runtime badge whose checked-in asset uses SVG, so keep that fallback here
  // instead of repeating extension guesses throughout the UI.
  if (id === "religion") return "bilder/merker/religion.svg";
  return `bilder/merker/${id}.PNG`;
}
