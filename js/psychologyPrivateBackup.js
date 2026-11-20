// Optional encrypted, user-initiated file backup for Psychology Room.
// Never performs network requests, account sync, logging of private content,
// or storage mutations on import until the user explicitly confirms in the UI.
(function (global) {
  "use strict";

  const FORMAT = "history-go-psychology-encrypted-backup-v1";
  const CONTENT = "history-go-psychology-content-v1";
  const NOTE_KEY = "hg_psychology_workbench_v1";
  const MAP_KEY = "hg_psychology_inner_map_v1";
  const ITERATIONS = 310000;
  const MAX_PLAINTEXT = 8 * 1024 * 1024;
  const MAX_FILE = 12 * 1024 * 1024;
  const RELATIONS = new Set(["connected", "similar", "contrast", "changed", "explore"]);
  const NOTE_FIELDS = ["situation", "thoughts", "feelings", "body", "actions", "next_step"];
  const FOLLOW_FIELDS = ["tried", "outcome", "new_view", "next_step"];

  function failure(code) {
    return Object.assign(new Error(code), { code });
  }

  function webCrypto() {
    const api = global.crypto;
    if (!api || typeof api.getRandomValues !== "function" || !api.subtle) {
      throw failure("crypto_unavailable");
    }
    return api;
  }

  function checkPassword(password) {
    if (typeof password !== "string" || password.length < 12 || password.length > 512) {
      throw failure("invalid_password");
    }
    return password;
  }

  function toBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return global.btoa(binary);
  }

  function fromBase64(value, expectedBytes, maxBytes) {
    if (typeof value !== "string" || value.length > Math.ceil(maxBytes * 4 / 3) + 8 ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
      throw failure("invalid_file");
    }
    try {
      const decoded = global.atob(value);
      if (decoded.length > maxBytes ||
          (expectedBytes !== null && decoded.length !== expectedBytes)) {
        throw failure("invalid_file");
      }
      const output = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) output[i] = decoded.charCodeAt(i);
      return output;
    } catch {
      throw failure("invalid_file");
    }
  }

  function readObject(storage, key, fallback) {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    if (raw.length > MAX_PLAINTEXT) throw failure("too_large");
    try { return JSON.parse(raw); }
    catch { throw failure("invalid_stored_data"); }
  }

  function normalNote(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
        typeof entry.id !== "string" || !entry.id ||
        entry.id.length > 129 || typeof entry.situation !== "string" ||
        !entry.situation.trim() || entry.situation.length > 2400) {
      throw failure("invalid_backup");
    }
    const normalized = { id: entry.id };
    if (entry.created_at !== undefined) {
      if (typeof entry.created_at !== "string" || entry.created_at.length > 60) {
        throw failure("invalid_backup");
      }
      normalized.created_at = entry.created_at;
    }
    for (const field of NOTE_FIELDS) {
      const value = entry[field];
      if (value === undefined) continue;
      if (typeof value !== "string" || value.length > 2400) throw failure("invalid_backup");
      normalized[field] = value;
    }
    if (entry.follow_ups !== undefined) {
      if (!Array.isArray(entry.follow_ups) || entry.follow_ups.length > 200) {
        throw failure("invalid_backup");
      }
      normalized.follow_ups = entry.follow_ups.map((follow) => {
        if (!follow || typeof follow !== "object" || Array.isArray(follow) ||
            typeof follow.id !== "string" || follow.id.length > 130 ||
            !follow.id || typeof follow.created_at !== "string" ||
            follow.created_at.length > 60) throw failure("invalid_backup");
        const result = { id: follow.id, created_at: follow.created_at };
        for (const field of FOLLOW_FIELDS) {
          if (follow[field] === undefined) continue;
          if (typeof follow[field] !== "string" || follow[field].length > 2400) {
            throw failure("invalid_backup");
          }
          result[field] = follow[field];
        }
        return result;
      });
    }
    return normalized;
  }

  function validateContent(value) {
    if (!value || value.format !== CONTENT || !Array.isArray(value.workbench) ||
        value.workbench.length > 1500 || !value.inner_map ||
        typeof value.inner_map !== "object" || Array.isArray(value.inner_map)) {
      throw failure("invalid_backup");
    }
    const notes = value.workbench.map(normalNote);
    const noteIds = new Set(notes.map((note) => note.id));
    if (noteIds.size !== notes.length) throw failure("invalid_backup");
    const map = value.inner_map;
    const ids = map.selected_ids === undefined ? [] : map.selected_ids;
    if (!Array.isArray(ids) || ids.length > 16 ||
        ids.some((id) => typeof id !== "string" || !noteIds.has(id)) ||
        new Set(ids).size !== ids.length) throw failure("invalid_backup");
    const selected = new Set(ids);

    const rawLinks = map.links === undefined ? [] : map.links;
    if (!Array.isArray(rawLinks) || rawLinks.length > 32) throw failure("invalid_backup");
    const links = [];
    const pairs = new Set();
    for (const link of rawLinks) {
      if (!link || typeof link.from !== "string" || typeof link.to !== "string" ||
          !selected.has(link.from) || !selected.has(link.to) ||
          link.from === link.to || !RELATIONS.has(link.kind)) throw failure("invalid_backup");
      const key = [link.from, link.to].sort().join("\u0000");
      if (pairs.has(key)) throw failure("invalid_backup");
      pairs.add(key);
      links.push({ from: link.from, to: link.to, kind: link.kind });
    }

    const rawLayout = map.layout === undefined ? {} : map.layout;
    if (!rawLayout || typeof rawLayout !== "object" || Array.isArray(rawLayout)) {
      throw failure("invalid_backup");
    }
    const layout = Object.create(null);
    for (const id of Object.keys(rawLayout)) {
      const point = rawLayout[id];
      if (!selected.has(id) || !point || typeof point.x !== "number" ||
          typeof point.y !== "number" || !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) || point.x < 0.11 || point.x > 0.89 ||
          point.y < 0.1 || point.y > 0.9) throw failure("invalid_backup");
      layout[id] = { x: point.x, y: point.y };
    }

    const rawGroups = map.groups === undefined ? [] : map.groups;
    if (!Array.isArray(rawGroups) || rawGroups.length > 6) throw failure("invalid_backup");
    const groups = [];
    const groupIds = new Set();
    for (const item of rawGroups) {
      if (!item || typeof item.id !== "string" || !/^group-[1-6]$/.test(item.id) ||
          typeof item.label !== "string" || !item.label.trim() ||
          item.label.trim().length > 40 || groupIds.has(item.id)) throw failure("invalid_backup");
      groups.push({ id: item.id, label: item.label.trim() });
      groupIds.add(item.id);
    }
    const rawAssignments = map.assignments === undefined ? {} : map.assignments;
    if (!rawAssignments || typeof rawAssignments !== "object" ||
        Array.isArray(rawAssignments)) throw failure("invalid_backup");
    const assignments = Object.create(null);
    for (const id of Object.keys(rawAssignments)) {
      if (!selected.has(id) || !groupIds.has(rawAssignments[id])) throw failure("invalid_backup");
      assignments[id] = rawAssignments[id];
    }
    return {
      format: CONTENT, workbench: notes,
      inner_map: { version: 4, selected_ids: ids, links, layout, groups, assignments }
    };
  }

  async function deriveKey(password, salt, usage) {
    const api = webCrypto();
    const text = new global.TextEncoder().encode(checkPassword(password));
    const sourceKey = await api.subtle.importKey("raw", text,
      { name: "PBKDF2" }, false, ["deriveKey"]);
    return api.subtle.deriveKey({
      name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS
    }, sourceKey, { name: "AES-GCM", length: 256 }, false, [usage]);
  }

  async function exportEncrypted(storage, password) {
    if (!storage || typeof storage.getItem !== "function") throw failure("storage_failed");
    const raw = {
      format: CONTENT,
      workbench: readObject(storage, NOTE_KEY, []),
      inner_map: readObject(storage, MAP_KEY, { selected_ids: [] })
    };
    const data = validateContent(raw);
    const plaintext = new global.TextEncoder().encode(JSON.stringify(data));
    if (plaintext.length > MAX_PLAINTEXT) throw failure("too_large");
    const api = webCrypto();
    const salt = api.getRandomValues(new Uint8Array(16));
    const iv = api.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, "encrypt");
    const encrypted = await api.subtle.encrypt({
      name: "AES-GCM", iv, additionalData: new global.TextEncoder().encode(FORMAT)
    }, key, plaintext);
    const envelope = {
      format: FORMAT, version: 1,
      kdf: "PBKDF2-SHA256", iterations: ITERATIONS,
      cipher: "AES-256-GCM",
      salt: toBase64(salt), iv: toBase64(iv),
      data: toBase64(new Uint8Array(encrypted))
    };
    return { text: JSON.stringify(envelope), count: data.workbench.length };
  }

  async function decryptBackup(fileText, password) {
    checkPassword(password);
    if (typeof fileText !== "string" || fileText.length > MAX_FILE) {
      throw failure("invalid_file");
    }
    let envelope;
    try { envelope = JSON.parse(fileText); }
    catch { throw failure("invalid_file"); }
    if (!envelope || envelope.format !== FORMAT || envelope.version !== 1 ||
        envelope.kdf !== "PBKDF2-SHA256" || envelope.iterations !== ITERATIONS ||
        envelope.cipher !== "AES-256-GCM") throw failure("invalid_file");
    const salt = fromBase64(envelope.salt, 16, 16);
    const iv = fromBase64(envelope.iv, 12, 12);
    const data = fromBase64(envelope.data, null, MAX_PLAINTEXT + 16);
    const key = await deriveKey(password, salt, "decrypt");
    let plaintext;
    try {
      plaintext = await webCrypto().subtle.decrypt({
        name: "AES-GCM", iv, additionalData: new global.TextEncoder().encode(FORMAT)
      }, key, data);
    } catch {
      throw failure("cannot_decrypt");
    }
    if (plaintext.byteLength > MAX_PLAINTEXT) throw failure("invalid_file");
    let parsed;
    try { parsed = JSON.parse(new global.TextDecoder("utf-8", { fatal: true }).decode(plaintext)); }
    catch { throw failure("invalid_file"); }
    return validateContent(parsed);
  }

  async function restoreEncrypted(storage, fileText, password) {
    if (!storage || typeof storage.getItem !== "function" ||
        typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") {
      throw failure("storage_failed");
    }
    // A first version deliberately never overwrites or merges existing local notes.
    if (storage.getItem(NOTE_KEY) !== null || storage.getItem(MAP_KEY) !== null) {
      throw failure("archive_not_empty");
    }
    const data = await decryptBackup(fileText, password);
    // Only write after authentication, integrity verification and schema validation.
    let wrote = false;
    try {
      storage.setItem(NOTE_KEY, JSON.stringify(data.workbench));
      wrote = true;
      storage.setItem(MAP_KEY, JSON.stringify(data.inner_map));
    } catch {
      if (wrote) {
        try { storage.removeItem(NOTE_KEY); }
        catch { throw failure("rollback_failed"); }
      }
      throw failure("storage_failed");
    }
    return { count: data.workbench.length, selected: data.inner_map.selected_ids.length };
  }

  global.HGPsychologyPrivateBackup = Object.freeze({
    exportEncrypted, decryptBackup, restoreEncrypted,
    format: FORMAT, maxFileBytes: MAX_FILE
  });
})(window);
