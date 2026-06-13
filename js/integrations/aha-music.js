// AHA Music → History Go bridge runtime.
(function initAhaMusicBridge(global) {
  "use strict";

  const BASE_PATH = "data/integrations/aha-music";
  const UNLOCK_STORAGE_KEY = "hg_unlocked_music_objects_v1";
  const UNLOCKABLE_STATUSES = new Set(["verified", "auto_matched", "automatic", "matched"]);
  const FILES = Object.freeze({
    artists: `${BASE_PATH}/musicArtistPlaceRelations.json`,
    tracks: `${BASE_PATH}/musicTrackPlaceRelations.json`,
    report: `${BASE_PATH}/musicHistoryGoBridgeReport.json`
  });

  const state = {
    loaded: false,
    loading: null,
    musicByPlace: {},
    candidates: { artists: [], tracks: [] },
    report: null,
    counts: { artistRelations: 0, trackRelations: 0 }
  };

  function text(value) {
    return value == null ? "" : String(value).trim();
  }

  function slug(value) {
    return text(value)
      .toLowerCase()
      .replace(/[æǽ]/g, "ae")
      .replace(/[øö]/g, "o")
      .replace(/[å]/g, "a")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function isUnlockableStatus(value) {
    return UNLOCKABLE_STATUSES.has(text(value).toLowerCase());
  }

  function numberOrNull(value) {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function rows(payload, preferredKeys) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    for (const key of preferredKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    if (Array.isArray(payload.relations)) return payload.relations;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  }

  function first(source, keys) {
    for (const key of keys) {
      if (source?.[key] != null && text(source[key])) return source[key];
    }
    return "";
  }

  function normalizeCommon(raw) {
    return {
      historyGoPlaceId: text(first(raw, ["historyGoPlaceId", "history_go_place_id", "placeId", "place_id"])),
      relationType: text(first(raw, ["relationType", "relation_type", "type"])) || "related_to",
      confidence: numberOrNull(first(raw, ["confidence", "matchConfidence", "match_confidence"])),
      status: text(first(raw, ["status", "matchStatus", "match_status"])) || "unknown",
      sourceNote: text(first(raw, ["sourceNote", "source_note", "note", "explanation", "reason"])),
      ahaMusicUrl: text(first(raw, ["ahaMusicUrl", "aha_music_url", "url", "route"]))
    };
  }

  function normalizeArtist(raw) {
    return {
      ...normalizeCommon(raw),
      artistId: text(first(raw, ["artistId", "artist_id", "id"])),
      artistName: text(first(raw, ["artistName", "artist_name", "name"])) || "Ukjent artist",
      spotifyArtistId: text(first(raw, ["spotifyArtistId", "spotify_artist_id"]))
    };
  }

  function normalizeTrack(raw) {
    return {
      ...normalizeCommon(raw),
      trackId: text(first(raw, ["trackId", "track_id", "id"])),
      trackTitle: text(first(raw, ["trackTitle", "track_title", "title", "name"])) || "Ukjent sang",
      artistId: text(first(raw, ["artistId", "artist_id"])),
      artistName: text(first(raw, ["artistName", "artist_name"])),
      spotifyTrackId: text(first(raw, ["spotifyTrackId", "spotify_track_id"]))
    };
  }

  function musicObjectId(type, placeId, primaryId, fallbackName) {
    const stablePart = text(primaryId) || `name_${slug(fallbackName)}`;
    // AHA Music should normally provide artistId/trackId. If it does not, the
    // normalized display name keeps IDs deterministic while making the fallback
    // explicit in the stored id.
    return stablePart && text(placeId) ? `${type}__${text(placeId)}__${stablePart}` : "";
  }

  function normalizeArtistUnlock(artist) {
    const placeId = text(artist?.historyGoPlaceId || artist?.placeId);
    if (!placeId || !isUnlockableStatus(artist?.status)) return null;
    const id = musicObjectId("music_artist", placeId, artist?.artistId, artist?.artistName);
    if (!id) return null;
    return {
      id,
      type: "music_artist",
      artistId: text(artist?.artistId),
      artistName: text(artist?.artistName) || "Ukjent artist",
      title: text(artist?.artistName) || "Ukjent artist",
      spotifyArtistId: text(artist?.spotifyArtistId),
      placeId,
      relationType: text(artist?.relationType) || "related_to",
      confidence: numberOrNull(artist?.confidence),
      status: text(artist?.status) || "unknown",
      sourceNote: text(artist?.sourceNote),
      unlockText: "Denne artisten er knyttet til dette stedet."
    };
  }

  function normalizeTrackUnlock(track) {
    const placeId = text(track?.historyGoPlaceId || track?.placeId);
    if (!placeId || !isUnlockableStatus(track?.status)) return null;
    const id = musicObjectId("music_track", placeId, track?.trackId, track?.trackTitle);
    if (!id) return null;
    return {
      id,
      type: "music_track",
      trackId: text(track?.trackId),
      trackTitle: text(track?.trackTitle) || "Ukjent sang",
      title: text(track?.trackTitle) || "Ukjent sang",
      artistId: text(track?.artistId),
      artistName: text(track?.artistName),
      placeId,
      relationType: text(track?.relationType) || "through_artist",
      confidence: numberOrNull(track?.confidence),
      status: text(track?.status) || "unknown",
      unlockText: "Denne sangen kan låses opp gjennom artisten."
    };
  }

  function getUnlockableObjectsForPlace(placeId) {
    const entry = getForPlace(placeId);
    if (!entry) return { artists: [], tracks: [] };
    return {
      artists: (entry.artists || []).map(normalizeArtistUnlock).filter(Boolean),
      tracks: (entry.tracks || []).map(normalizeTrackUnlock).filter(Boolean)
    };
  }

  function readUnlockedMusicMap() {
    try {
      const parsed = JSON.parse(global.localStorage?.getItem(UNLOCK_STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeUnlockedMusicMap(map) {
    try { global.localStorage?.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(map)); } catch {}
  }

  function isMusicObjectUnlocked(id) {
    return Boolean(readUnlockedMusicMap()[text(id)]);
  }

  function getUnlockedMusicObjects() {
    return Object.values(readUnlockedMusicMap());
  }

  function unlockMusicObject(musicObject) {
    if (!musicObject?.id || !musicObject?.type || !musicObject?.placeId) return { ok: false, reason: "invalid_music_object" };
    const db = readUnlockedMusicMap();
    if (db[musicObject.id]) return { ok: true, changed: false, object: db[musicObject.id] };
    const row = {
      id: musicObject.id,
      type: musicObject.type,
      title: text(musicObject.title || musicObject.artistName || musicObject.trackTitle),
      placeId: text(musicObject.placeId),
      unlockedAt: new Date().toISOString(),
      source: "aha_music"
    };
    db[row.id] = row;
    writeUnlockedMusicMap(db);
    try { global.dispatchEvent?.(new Event("updateProfile")); } catch {}
    return { ok: true, changed: true, object: row };
  }

  function getMusicUnlockSummary() {
    const rows = getUnlockedMusicObjects();
    const places = new Set(rows.map(item => text(item?.placeId)).filter(Boolean));
    return {
      total: rows.length,
      artists: rows.filter(item => item?.type === "music_artist").length,
      tracks: rows.filter(item => item?.type === "music_track").length,
      places: places.size
    };
  }

  function confidenceSummary(relations) {
    const values = relations.map(item => item.confidence).filter(Number.isFinite);
    const statuses = [...new Set(relations.map(item => item.status).filter(Boolean))];
    return {
      relationCount: relations.length,
      scoredCount: values.length,
      average: values.length
        ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 1000) / 1000
        : null,
      minimum: values.length ? Math.min(...values) : null,
      maximum: values.length ? Math.max(...values) : null,
      statuses
    };
  }

  function buildIndex(artistPayload, trackPayload) {
    const artistRelations = rows(artistPayload, ["artistPlaceRelations", "artists"]).map(normalizeArtist);
    const trackRelations = rows(trackPayload, ["trackPlaceRelations", "tracks"]).map(normalizeTrack);
    const musicByPlace = {};
    const candidates = { artists: [], tracks: [] };

    function add(kind, relation) {
      if (!relation.historyGoPlaceId) {
        candidates[kind].push(relation);
        return;
      }
      const placeId = relation.historyGoPlaceId;
      const entry = musicByPlace[placeId] ||= {
        artists: [],
        tracks: [],
        relationTypes: [],
        statuses: [],
        confidenceSummary: null
      };
      entry[kind].push(relation);
    }

    artistRelations.forEach(relation => add("artists", relation));
    trackRelations.forEach(relation => add("tracks", relation));

    Object.values(musicByPlace).forEach(entry => {
      const all = [...entry.artists, ...entry.tracks];
      entry.relationTypes = [...new Set(all.map(item => item.relationType).filter(Boolean))];
      entry.statuses = [...new Set(all.map(item => item.status).filter(Boolean))];
      entry.confidenceSummary = confidenceSummary(all);
    });

    return {
      musicByPlace,
      candidates,
      counts: {
        artistRelations: artistRelations.length,
        trackRelations: trackRelations.length
      }
    };
  }

  async function fetchJson(path, optional = false) {
    try {
      const response = await global.fetch(path, { cache: "no-store" });
      if (!response.ok) {
        if (optional && response.status === 404) return null;
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (optional) return null;
      throw new Error(`Kunne ikke lese ${path}: ${error?.message || error}`);
    }
  }

  async function load(options = {}) {
    if (state.loaded && !options.force) return state;
    if (state.loading && !options.force) return state.loading;

    state.loading = Promise.all([
      fetchJson(FILES.artists),
      fetchJson(FILES.tracks),
      fetchJson(FILES.report, true)
    ]).then(([artists, tracks, report]) => {
      const indexed = buildIndex(artists, tracks);
      Object.assign(state, indexed, { report, loaded: true, loading: null });
      global.HG_MUSIC_BY_PLACE = state.musicByPlace;
      global.dispatchEvent?.(new CustomEvent("hg:ahaMusicLoaded", { detail: state }));
      return state;
    }).catch(error => {
      state.loading = null;
      console.warn("[AHA Music bridge]", error);
      return state;
    });

    return state.loading;
  }

  function getForPlace(placeId) {
    return state.musicByPlace[text(placeId)] || null;
  }

  global.HGAhaMusic = Object.freeze({
    FILES,
    state,
    UNLOCK_STORAGE_KEY,
    buildIndex,
    load,
    getForPlace,
    normalizeArtistUnlock,
    normalizeTrackUnlock,
    getUnlockableObjectsForPlace,
    unlockMusicObject,
    isMusicObjectUnlocked,
    getUnlockedMusicObjects,
    getMusicUnlockSummary
  });
})(window);
