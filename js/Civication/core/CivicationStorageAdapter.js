// ============================================================
// CivicationStorageAdapter – narrow localStorage facade v1
// ------------------------------------------------------------
// This adapter intentionally preserves the existing storage
// shapes. It only centralizes read/write access behind named
// methods so future Civication systems do not depend directly on
// raw localStorage keys.
// ============================================================

(function () {
  "use strict";

  const PREFIX = "[CivicationStorageAdapter]";

  const KEYS = Object.freeze({
    CIVICATION_STATE: "hg_civi_state_v1",
    MAIL_STORE: "hg_civi_mail_v1",
    LEGACY_INBOX: "hg_civi_inbox_v1",
    ACTIVE_POSITION: "hg_active_position_v1",
    CALENDAR: "hg_civi_calendar_v1",
    HOME: "civi_home_v1",
    CAPITAL: "hg_capital_v1",
    PC_WALLET: "hg_pc_wallet_v1",
    CIVI_WALLET: "hg_civi_wallet_v1",
    VISITED_PLACES: "visited_places",
    MERITS_BY_CATEGORY: "merits_by_category",
    QUIZ_PROGRESS: "quiz_progress",
    CIVICATION_ACCESS: "hg_civi_access_v1"
  });

  function getStorage() {
    try {
      if (typeof localStorage !== "undefined" && localStorage) return localStorage;
    } catch (error) {
      warn("localStorage unavailable", error);
    }
    return null;
  }

  function warn(message, error) {
    try {
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(PREFIX, message, error || "");
      }
    } catch (_) {}
  }

  function readRaw(key, fallback) {
    const storage = getStorage();
    if (!storage) return fallback;

    try {
      const value = storage.getItem(key);
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      warn(`Failed to read raw key "${key}"`, error);
      return fallback;
    }
  }

  function writeRaw(key, value) {
    const storage = getStorage();
    if (!storage) return false;

    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      warn(`Failed to write raw key "${key}"`, error);
      return false;
    }
  }

  function readJson(key, fallback) {
    const raw = readRaw(key, null);
    if (raw === null || raw === undefined || raw === "") return fallback;

    try {
      return JSON.parse(raw);
    } catch (error) {
      warn(`Failed to parse JSON key "${key}"`, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      return writeRaw(key, JSON.stringify(value));
    } catch (error) {
      warn(`Failed to serialize JSON key "${key}"`, error);
      return false;
    }
  }

  function remove(key) {
    const storage = getStorage();
    if (!storage) return false;

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      warn(`Failed to remove key "${key}"`, error);
      return false;
    }
  }

  const adapter = {
    KEYS,
    readJson,
    writeJson,
    remove,
    readRaw,
    writeRaw,

    readCivicationState: () => readJson(KEYS.CIVICATION_STATE, {}),
    writeCivicationState: (value) => writeJson(KEYS.CIVICATION_STATE, value),

    readMailStore: () => readJson(KEYS.MAIL_STORE, {}),
    writeMailStore: (value) => writeJson(KEYS.MAIL_STORE, value),
    readLegacyInbox: () => readJson(KEYS.LEGACY_INBOX, []),
    writeLegacyInbox: (value) => writeJson(KEYS.LEGACY_INBOX, value),

    readActivePosition: () => readJson(KEYS.ACTIVE_POSITION, null),
    writeActivePosition: (value) => writeJson(KEYS.ACTIVE_POSITION, value),

    readCalendar: () => readJson(KEYS.CALENDAR, {}),
    writeCalendar: (value) => writeJson(KEYS.CALENDAR, value),

    readHome: () => readJson(KEYS.HOME, {}),
    writeHome: (value) => writeJson(KEYS.HOME, value),

    readCapital: () => readJson(KEYS.CAPITAL, {}),
    writeCapital: (value) => writeJson(KEYS.CAPITAL, value),
    readPcWallet: () => readJson(KEYS.PC_WALLET, {}),
    writePcWallet: (value) => writeJson(KEYS.PC_WALLET, value),
    readCiviWallet: () => readJson(KEYS.CIVI_WALLET, {}),
    writeCiviWallet: (value) => writeJson(KEYS.CIVI_WALLET, value),

    readVisitedPlaces: () => readJson(KEYS.VISITED_PLACES, []),
    readMeritsByCategory: () => readJson(KEYS.MERITS_BY_CATEGORY, {}),
    readQuizProgress: () => readJson(KEYS.QUIZ_PROGRESS, {}),

    readCivicationAccess: () => readJson(KEYS.CIVICATION_ACCESS, {}),
    writeCivicationAccess: (value) => writeJson(KEYS.CIVICATION_ACCESS, value)
  };

  window.CivicationStorageAdapter = adapter;
})();
