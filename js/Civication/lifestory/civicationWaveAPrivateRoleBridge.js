// Private wave-A chapters remain reachable after a job change, using the
// *inactive role snapshot inside the canonical Life Story save*.
// This adapter neither starts fictitious days nor copies choice consequences.
(function () {
  "use strict";

  const PRIVATE = /^wave_[ab]_c(?:01|02|03|05|07|23)_/;
  const PHASE = {
    morgen: "morning", formiddag: "forenoon", arbeidsdag: "workday",
    lunsj: "lunch", ettermiddag: "afternoon", middag: "dinner",
    kveld: "evening", natt: "day_end"
  };
  const ORDER = ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];
  const loaded = new Map();
  let pending = null;
  let inspecting = false;
  let reread = false;

  function dependencies() {
    return {
      State: window.CivicationLifestoryState,
      Content: window.CivicationLifestoryContent,
      Runner: window.CivicationLifestoryRunner
    };
  }

  function isPrivateScene(scene, content) {
    if (!PRIVATE.test(String(scene?.id || ""))) return false;
    const thread = (content?.threads || []).find(row => row.id === scene.threadId);
    return thread?.type === "privatliv";
  }

  function phaseAllows(scene) {
    const now = window.CivicationCalendar?.getPhase?.();
    const expected = PHASE[scene?.fase] || "afternoon";
    return !ORDER.includes(now) || ORDER.indexOf(now) >= ORDER.indexOf(expected);
  }

  async function loadRolePackage(role, snapshot, Content, Runner) {
    const continuationIds = Runner.getContinuationIds?.(snapshot) || [];
    const key = role + "::" + continuationIds.join("+");
    if (!loaded.has(key)) {
      const value = (async () => {
        let result = await Content.loadContent(role);
        for (const id of continuationIds) result = await Content.loadContinuation(result, id);
        return result;
      })();
      loaded.set(key, value);
    }
    return loaded.get(key);
  }

  function eventFor(root, snapshot, scene, content) {
    const { State } = dependencies();
    const type = scene.id.match(PRIVATE)?.[0]?.match(/c\d\d/)?.[0] || "";
    const raw = State.presentText(snapshot, content, scene.tekst || "");
    return {
      id: "wa_lifestory__" + snapshot.rolle + "__" + scene.id,
      source_type: "lifestory_wave_a",
      lifestory_inactive_role: true,
      lifestory_role: snapshot.rolle,
      lifestory_scene_id: scene.id,
      lifestory_thread_id: scene.threadId,
      story_type_id: type.toUpperCase(),
      thread_key: "lifestory.wave_a." + snapshot.rolle + "." + scene.id,
      from: State.presentText(snapshot, content, scene.avsender || "Min dag"),
      source: "Min dag · privat historie",
      subject: State.presentText(snapshot, content, scene.tittel),
      situation: Array.isArray(raw) ? raw : [String(raw)],
      mail_type: "story",
      mail_class: "daily_private",
      channel: "private",
      messageChannel: "private",
      phase_tag: PHASE[scene.fase] || "afternoon",
      lifestory_day: snapshot.dag,
      choices: (scene.valg || []).map(choice => ({
        id: choice.id,
        label: State.presentText(snapshot, content, choice.tekst),
        feedback: State.presentText(snapshot, content, choice.konsekvensTekst || ""),
        effect: 0
      }))
    };
  }

  function currentRoot() {
    return window.CivicationLifestoryState?.load?.() || null;
  }

  async function refresh() {
    if (inspecting) { reread = true; return; }
    inspecting = true;
    const { Content, Runner } = dependencies();
    try {
      if (!Content?.loadContent || !Runner?.getCandidateScenes) { pending = null; return; }
      do {
        reread = false;
        let chosen = null;
        const root = currentRoot();
        const inactive = root?.rolleTilstander || {};
        // The prior job must exist in the player's real history; no shadow
        // person or unlocked relationship is generated from a work title.
        for (const [role, snapshot] of Object.entries(inactive)) {
          if (!snapshot || snapshot.rolle !== role || role === root.rolle || snapshot.dagFerdig) continue;
          const content = await loadRolePackage(role, snapshot, Content, Runner);
          // Reload after async IO: no stale role snapshot may be offered.
          const latest = currentRoot();
          const current = latest?.rolleTilstander?.[role];
          if (!current || latest.rolle === role ||
              current.dag !== snapshot.dag || current.fase !== snapshot.fase ||
              current.spilteScener?.length !== snapshot.spilteScener?.length) continue;
          const scene = Runner.getCandidateScenes(current, content)
            .find(row => isPrivateScene(row, content) && phaseAllows(row));
          if (scene) {
            chosen = eventFor(latest, current, scene, content);
            break;
          }
        }
        pending = chosen;
        window.CivicationWaveAInboxBridge?.sync?.();
      } while (reread);
    } catch (error) {
      pending = null;
      console.warn("[CivicationWaveAPrivateRoleBridge] reader failed", error);
    } finally {
      inspecting = false;
    }
  }

  function getPendingEvent() {
    const event = pending;
    if (!event) return null;
    const root = currentRoot();
    const snapshot = root?.rolleTilstander?.[event.lifestory_role];
    if (!snapshot || root.rolle === event.lifestory_role ||
        snapshot.spilteScener?.includes(event.lifestory_scene_id) ||
        snapshot.dagFerdig) return null;
    return event;
  }

  async function answer(eventId, choiceId) {
    const event = getPendingEvent();
    if (!event || event.id !== eventId) return { ok: false, reason: "story_scene_not_current" };
    const selected = event.choices.find(row => row.id === choiceId);
    if (!selected) return { ok: false, reason: "bad_choice" };
    const { State, Content, Runner } = dependencies();
    const root = currentRoot();
    const role = event.lifestory_role;
    const snapshot = root?.rolleTilstander?.[role];
    if (!snapshot || root.rolle === role) return { ok: false, reason: "role_changed" };
    const content = await loadRolePackage(role, snapshot, Content, Runner);
    // Check again after content IO and restrict to this exact candidate:
    // no expired invitation, completed thread, wrong role or duplicate.
    const newest = currentRoot();
    const current = newest?.rolleTilstander?.[role];
    if (!current || newest.rolle === role) return { ok: false, reason: "role_changed" };
    const scene = Runner.getCandidateScenes(current, content)
      .find(row => row.id === event.lifestory_scene_id && isPrivateScene(row, content) && phaseAllows(row));
    if (!scene) return { ok: false, reason: "story_scene_not_current" };
    try {
      Runner.applyChoice(current, content, scene.id, choiceId);
      State.save(newest); // Same key; preserve active job's player state.
    } catch (error) {
      return { ok: false, reason: "runner_rejected_choice" };
    }
    pending = null;
    window.CivicationMailEngine?.markResolved?.(eventId, eventId, choiceId);
    window.dispatchEvent(new Event("civi:waveAPrivateStoryChanged"));
    refresh();
    return { ok: true, feedback: selected.feedback };
  }

  window.CivicationWaveAPrivateRoleBridge = Object.freeze({
    refresh, getPendingEvent, answer
  });
  for (const name of ["civi:lifestoryChanged", "civi:booted", "civi:dayPhaseChanged", "updateProfile"]) {
    window.addEventListener(name, refresh);
  }
  refresh();
})();
