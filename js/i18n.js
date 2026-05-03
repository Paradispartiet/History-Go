(function () {
  const HG_FALLBACK_LANG = "nb";
  const HG_STORAGE_KEY = "hg_lang";

  const HG_SUPPORTED_LANGS = [
    "ar", "bn", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nb", "pt", "ru", "sw", "tr", "ur", "zh-Hans"
  ];

  const HG_LANGUAGE_LABELS = {
    ar: "العربية",
    bn: "বাংলা",
    de: "Deutsch",
    en: "English",
    es: "Español",
    fr: "Français",
    hi: "हिन्दी",
    id: "Bahasa Indonesia",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    nb: "Norsk",
    pt: "Português",
    ru: "Русский",
    sw: "Kiswahili",
    tr: "Türkçe",
    ur: "اردو",
    "zh-Hans": "中文"
  };

  let currentLang = HG_FALLBACK_LANG;
  let currentDict = {};
  let fallbackDict = {};
  let currentPlaceDict = {};

  function isRtl(lang) {
    return lang === "ar" || lang === "ur";
  }

  function normalizeLang(raw) {
    const value = String(raw || "").trim();
    if (!value) return HG_FALLBACK_LANG;
    const lower = value.toLowerCase();

    if (lower === "no" || lower === "nb" || lower === "nn") return "nb";
    if (lower === "zh" || lower.startsWith("zh-")) return "zh-Hans";

    const direct = HG_SUPPORTED_LANGS.find((l) => l.toLowerCase() === lower);
    if (direct) return direct;

    const prefixes = ["en", "fr", "pt", "es", "de", "ar", "sw", "hi", "ur", "ru", "bn", "id", "ja", "ko", "tr", "it"];
    const prefix = prefixes.find((p) => lower === p || lower.startsWith(p + "-"));
    return prefix || HG_FALLBACK_LANG;
  }

  async function loadJson(lang) {
    const url = `data/i18n/ui/${encodeURIComponent(lang)}.json`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed loading ${lang}: ${res.status}`);
    return res.json();
  }

  async function loadContentJson(type, lang) {
    const url = `data/i18n/content/${encodeURIComponent(type)}/${encodeURIComponent(lang)}.json`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed loading ${type}/${lang}: ${res.status}`);
    return res.json();
  }

  async function loadPlaceTranslations(lang) {
    const normalized = normalizeLang(lang);
    if (normalized === HG_FALLBACK_LANG) return {};

    try {
      const data = await loadContentJson("places", normalized);
      return data && typeof data === "object" ? data : {};
    } catch (err) {
      console.warn(`[HG_I18N] Missing place content file for '${normalized}', using original place data.`, err);
      return {};
    }
  }

  async function load(lang) {
    const normalized = normalizeLang(lang);

    try {
      fallbackDict = await loadJson(HG_FALLBACK_LANG);
    } catch (err) {
      fallbackDict = {};
      console.warn("[HG_I18N] Could not load fallback language file (nb).", err);
    }

    currentPlaceDict = await loadPlaceTranslations(normalized);

    if (normalized === HG_FALLBACK_LANG) {
      currentDict = fallbackDict;
      return { lang: normalized, dict: currentDict };
    }

    try {
      currentDict = await loadJson(normalized);
      return { lang: normalized, dict: currentDict };
    } catch (err) {
      console.warn(`[HG_I18N] Missing language file for '${normalized}', falling back to nb.`, err);
      currentDict = fallbackDict;
      return { lang: HG_FALLBACK_LANG, dict: currentDict };
    }
  }

  function t(key, fallback) {
    if (!key) return "";
    if (Object.prototype.hasOwnProperty.call(currentDict, key)) return currentDict[key];
    if (Object.prototype.hasOwnProperty.call(fallbackDict, key)) return fallbackDict[key];
    return fallback ?? key;
  }

  function localizePlace(place) {
    if (!place || typeof place !== "object") return place;
    const id = String(place.id || "").trim();
    if (!id) return place;

    const tr = currentPlaceDict && currentPlaceDict[id];
    if (!tr || typeof tr !== "object") return place;

    const out = { ...place };

    if (typeof tr.name === "string" && tr.name.trim()) out.name = tr.name;
    if (typeof tr.desc === "string" && tr.desc.trim()) out.desc = tr.desc;
    if (typeof tr.popupDesc === "string" && tr.popupDesc.trim()) out.popupDesc = tr.popupDesc;
    if (typeof tr.popupdesc === "string" && tr.popupdesc.trim()) out.popupdesc = tr.popupdesc;

    return out;
  }

  function localizePlaces(list) {
    return Array.isArray(list) ? list.map(localizePlace) : list;
  }

  function apply(root) {
    const target = root && root.querySelectorAll ? root : document;
    const nodes = target.querySelectorAll("[data-i18n]");

    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;

      const fallbackText = (el.textContent || "").trim();
      const translated = t(key, fallbackText);

      if (el.id === "btnSeeMap" && el.classList.contains("iconbtn")) {
        if (translated) {
          el.setAttribute("aria-label", translated);
          el.setAttribute("title", translated);
        }

        let icon = el.querySelector("[data-i18n-icon='map']");
        if (!icon) {
          el.textContent = "";
          icon = document.createElement("span");
          icon.setAttribute("data-i18n-icon", "map");
          icon.setAttribute("aria-hidden", "true");
          el.appendChild(icon);
        }
        icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 3v5M12 16v5M3 12h5M16 12h5"></path></svg>`;
        return;
      }

      if (el.children && el.children.length > 0) return;

      if (translated && el.textContent !== translated) {
        el.textContent = translated;
      }
    });
  }

  function rerenderLocalizedSurfaces() {
    try {
      if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();
    } catch (err) {
      console.warn("[HG_I18N] Could not rerender nearby places after language change.", err);
    }

    try {
      if (typeof window.renderCollection === "function") window.renderCollection();
    } catch (err) {
      console.warn("[HG_I18N] Could not rerender collection after language change.", err);
    }

    try {
      const card = document.getElementById("placeCard");
      const placeId = String(card?.dataset?.currentPlaceId || "").trim();
      const isOpen = card && placeId && card.getAttribute("aria-hidden") !== "true";
      if (!isOpen || typeof window.openPlaceCard !== "function") return;

      const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find(
        p => String(p?.id || "").trim() === placeId
      );
      if (place) window.openPlaceCard(place);
    } catch (err) {
      console.warn("[HG_I18N] Could not rerender open place card after language change.", err);
    }
  }

  function patchContentRenderers() {
    if (window.__HG_I18N_CONTENT_PATCHED === "1") return;

    let didPatch = false;

    if (typeof window.openPlaceCard === "function" && window.openPlaceCard.__hgI18nWrapped !== true) {
      const originalOpenPlaceCard = window.openPlaceCard;
      const wrappedOpenPlaceCard = function (place, ...rest) {
        return originalOpenPlaceCard.call(this, localizePlace(place), ...rest);
      };
      wrappedOpenPlaceCard.__hgI18nWrapped = true;
      window.openPlaceCard = wrappedOpenPlaceCard;
      didPatch = true;
    }

    if (typeof window.renderNearbyPlaces === "function" && window.renderNearbyPlaces.__hgI18nWrapped !== true) {
      const originalRenderNearbyPlaces = window.renderNearbyPlaces;
      const wrappedRenderNearbyPlaces = function (...args) {
        const originalPlaces = window.PLACES;
        if (Array.isArray(originalPlaces)) window.PLACES = localizePlaces(originalPlaces);
        try {
          return originalRenderNearbyPlaces.apply(this, args);
        } finally {
          window.PLACES = originalPlaces;
        }
      };
      wrappedRenderNearbyPlaces.__hgI18nWrapped = true;
      window.renderNearbyPlaces = wrappedRenderNearbyPlaces;
      didPatch = true;
    }

    if (typeof window.renderCollection === "function" && window.renderCollection.__hgI18nWrapped !== true) {
      const originalRenderCollection = window.renderCollection;
      const wrappedRenderCollection = function (...args) {
        const originalPlaces = window.PLACES;
        if (Array.isArray(originalPlaces)) window.PLACES = localizePlaces(originalPlaces);
        try {
          return originalRenderCollection.apply(this, args);
        } finally {
          window.PLACES = originalPlaces;
        }
      };
      wrappedRenderCollection.__hgI18nWrapped = true;
      window.renderCollection = wrappedRenderCollection;
      didPatch = true;
    }

    if (didPatch) window.__HG_I18N_CONTENT_PATCHED = "1";
  }

  function startContentPatchLoop() {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      patchContentRenderers();
      if (window.__HG_I18N_CONTENT_PATCHED === "1" || tries > 80) {
        window.clearInterval(timer);
      }
    }, 100);
  }

  async function setLang(lang) {
    const normalized = normalizeLang(lang);
    const loaded = await load(normalized);
    currentLang = loaded.lang;

    try {
      localStorage.setItem(HG_STORAGE_KEY, normalized);
    } catch (err) {
      console.warn("[HG_I18N] Could not persist language choice.", err);
    }

    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRtl(normalized) ? "rtl" : "ltr";

    apply(document);
    patchContentRenderers();
    rerenderLocalizedSurfaces();
    window.dispatchEvent(new Event("hg:langchange"));
    window.dispatchEvent(new Event("updateProfile"));

    return currentLang;
  }

  function getLang() {
    return currentLang;
  }

  function initLanguageSelect() {
    const select = document.getElementById("languageSelect");
    if (!select || select.dataset.hgI18nBound === "1") return;

    select.dataset.hgI18nBound = "1";
    select.value = normalizeLang(currentLang);
    select.addEventListener("change", async (e) => {
      const nextLang = e.target && e.target.value;
      await setLang(nextLang);
      select.value = normalizeLang(currentLang);
    });
  }

  async function init() {
    let stored = "";
    try {
      stored = localStorage.getItem(HG_STORAGE_KEY) || "";
    } catch {}

    const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    const preferred = normalizeLang(stored || navLang || HG_FALLBACK_LANG);

    await setLang(preferred);
    initLanguageSelect();
    startContentPatchLoop();
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSelect();
      patchContentRenderers();
      apply(document);
    });
  }

  window.HG_I18N = {
    getLang,
    setLang,
    t,
    apply,
    load,
    localizePlace,
    localizePlaces,
    supportedLangs: HG_SUPPORTED_LANGS,
    languageLabels: HG_LANGUAGE_LABELS
  };

  init().catch((err) => {
    console.warn("[HG_I18N] Init failed, fallback to safe defaults.", err);
    document.documentElement.lang = HG_FALLBACK_LANG;
    document.documentElement.dir = "ltr";
  });
})();
