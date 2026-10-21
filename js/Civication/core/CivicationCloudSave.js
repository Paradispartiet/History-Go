// Account-bound Civication backups. Local data remains available offline.
// Never replace conflicting saves or upload an empty/default snapshot.
(function (root) {
  "use strict";
  const OWNER_KEY = "civication_cloud_owner_v1";
  const STATUS_KEY = "civication_cloud_status_v1";
  const PREFIX = "civication_latest_";
  const EXTRA_KEYS = new Set(["hg_active_position_v1", "hg_capital_v1",
    "hg_pc_wallet_v1", "hg_civi_wallet_v1", "hg_job_history_v1",
    // Legacy NPC memory uses dotted civi.* keys, not the civi_ prefix.
    // Include only these canonical keys, never a blanket civi.* wildcard.
    "civi.socialRelationships.v1", "civi.socialResponses.v1",
    "civi.socialConversations.v1", "civi.playerPhaseSnapshots.v1"]);
  // Legacy debug URL overrides are not player progress. Older backups may
  // still contain this key, but it must never be restored or re-uploaded.
  const RETIRED_KEYS = new Set(["civication_lifestory_role_v1"]);
  const matchesKey = key => !RETIRED_KEYS.has(key) && (
    (/^(hg_civi_|civi_|civication_)/.test(key) &&
      key !== OWNER_KEY && key !== STATUS_KEY) || EXTRA_KEYS.has(key)
  );
  const hasData = raw => raw !== null && raw !== "" && raw !== "{}" && raw !== "[]" && raw !== "null";
  const storage = () => root.localStorage;
  let client = null;
  let userId = null;
  let lastRemote = null;
  let blocked = false;
  let active = false;
  let pending = null;
  let running = false;
  let rerunRequested = false;

  function snapshot() {
    const out = {};
    try {
      for (let i = 0; i < storage().length; i++) {
        const key = storage().key(i);
        if (!key || !matchesKey(key)) continue;
        const raw = storage().getItem(key);
        if (hasData(raw)) out[key] = raw;
      }
    } catch (_) {}
    return out;
  }
  function status(message, ok = false, savedAt = null) {
    const record = { ok, message, saved_at: savedAt, profile_id: userId };
    try { storage().setItem(STATUS_KEY, JSON.stringify(record)); } catch (_) {}
    const node = root.document?.getElementById("civiCloudSaveStatus");
    if (node) {
      node.textContent = message;
      node.title = savedAt ? "Siste vellykkede skylagring: " + savedAt : message;
    }
    root.dispatchEvent?.(new CustomEvent("civication:cloud-status", { detail: record }));
    return record;
  }
  function conflict(message) {
    blocked = true;
    active = false;
    return status(message || "Lagringskonflikt – begge kopier bevart");
  }
  function fingerprint(value) { return JSON.stringify(value || {}); }
  async function remoteRead() {
    const { data, error } = await client.from("aha_imports")
      .select("payload,created_at").eq("id", PREFIX + userId)
      .eq("profile_id", userId).maybeSingle();
    if (error) throw error;
    return data || null;
  }
  async function bootstrap() {
    try {
      const bridge = root.HistoryGoAHAAuth;
      const session = await bridge?.getSession?.();
      if (!session?.user?.id) return status("Civication: kun lagret lokalt – logg inn");
      userId = session.user.id;
      client = await bridge.getClient();
      if (!client) return status("Civication: skylagring utilgjengelig");
      const local = snapshot();
      const owner = storage().getItem(OWNER_KEY);
      if (owner && owner !== userId && Object.keys(local).length) {
        return conflict("Civication: en annen konto eier lokale data – ikke synkronisert");
      }
      const remote = await remoteRead(); // Always READ before any WRITE.
      const remoteState = remote?.payload?.state;
      const saved = remoteState && typeof remoteState === "object" && !Array.isArray(remoteState)
        ? remoteState : {};
      const collisions = [];
      for (const [key, raw] of Object.entries(saved)) {
        if (!matchesKey(key) || typeof raw !== "string" || !hasData(raw)) continue;
        const existing = storage().getItem(key);
        if (hasData(existing) && existing !== raw) collisions.push(key);
        else if (!hasData(existing)) storage().setItem(key, raw);
      }
      if (collisions.length) {
        return conflict("Civication: lokale og skybaserte lagringer er ulike – begge bevart");
      }
      storage().setItem(OWNER_KEY, userId);
      lastRemote = fingerprint(saved);
      active = true;
      const savedAt = remote?.created_at || null;
      if (savedAt) status("Civication: sky lagret " + new Date(savedAt).toLocaleString("no-NO"), true, savedAt);
      else status("Civication: klar for skylagring");
      startWatching();
      schedule(); // Upload pre-existing local progress if remote is absent.
      return { ok: true, restored: Object.keys(saved).length };
    } catch (error) {
      console.warn("[CivicationCloudSave] oppstart feilet; lokale data beholdes", error);
      return status("Civication: kun lagret lokalt – nettverksfeil");
    }
  }
  async function flush() {
    if (!active || blocked || !userId) return;
    if (running) { rerunRequested = true; return; }
    running = true;
    try {
      const state = snapshot();
      if (!Object.keys(state).length) return; // No empty overwrite.
      const remote = await remoteRead();
      if (fingerprint(remote?.payload?.state) !== lastRemote) {
        conflict("Civication: endringer på en annen enhet – begge kopier bevart");
        return;
      }
      if (fingerprint(state) === lastRemote) return;
      const savedAt = new Date().toISOString();
      const { error } = await client.from("aha_imports").upsert({
        id: PREFIX + userId, profile_id: userId, source_app: "civication",
        payload: { version: 1, state, saved_at: savedAt },
        counts: { storage_keys: Object.keys(state).length },
        created_at: savedAt
      }, { onConflict: "id" });
      if (error) throw error;
      lastRemote = fingerprint(state);
      status("Civication: sky lagret " + new Date(savedAt).toLocaleString("no-NO"), true, savedAt);
    } catch (error) {
      console.warn("[CivicationCloudSave] synkronisering feilet", error);
      status("Civication: kun lokalt – synkronisering feilet");
    } finally {
      running = false;
      if (rerunRequested) {
        rerunRequested = false;
        schedule();
      }
    }
  }
  function schedule() {
    if (!active || blocked) return;
    clearTimeout(pending);
    pending = setTimeout(() => { pending = null; flush(); }, 1500);
  }
  function startWatching() {
    let previous = fingerprint(snapshot());
    root.setInterval(() => {
      if (!active) return;
      const current = fingerprint(snapshot());
      if (current !== previous) { previous = current; schedule(); }
    }, 6000);
    root.document?.addEventListener("visibilitychange", () => {
      if (root.document.visibilityState === "hidden") schedule();
    });
  }
  const api = { snapshot, schedule, flush, bootstrap, getStatus: () => {
    try { return JSON.parse(storage().getItem(STATUS_KEY) || "null"); } catch (_) { return null; }
  }};
  root.CivicationCloudSave = api;
  api.ready = bootstrap();
})(typeof window !== "undefined" ? window : globalThis);
