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

  async function load(lang) {
    const normalized = normalizeLang(lang);

    try {
      fallbackDict = await loadJson(HG_FALLBACK_LANG);
    } catch (err) {
      fallbackDict = {};
      console.warn("[HG_I18N] Could not load fallback language file (nb).", err);
    }

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
        icon.textContent = "🗺️";
        return;
      }

      if (el.children && el.children.length > 0) return;

      if (translated && el.textContent !== translated) {
        el.textContent = translated;
      }
    });
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
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSelect();
      apply(document);
    });
  }

  window.HG_I18N = {
    getLang,
    setLang,
    t,
    apply,
    load,
    supportedLangs: HG_SUPPORTED_LANGS,
    languageLabels: HG_LANGUAGE_LABELS
  };

  init().catch((err) => {
    console.warn("[HG_I18N] Init failed, fallback to safe defaults.", err);
    document.documentElement.lang = HG_FALLBACK_LANG;
    document.documentElement.dir = "ltr";
  });
})();
