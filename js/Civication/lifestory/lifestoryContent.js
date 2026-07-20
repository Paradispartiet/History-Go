// js/Civication/lifestory/lifestoryContent.js
//
// Civication Life Story System — innholdspakker.
// Bygger og validerer fortellingspakkene (rolle + privatliv) som Day Runner
// spiller. Dette er IKKE en motor: filen kan ikke generere innhold, den kan
// bare sette sammen og kontrollere det som ligger i
// data/Civication/lifestory/.
//
// Validatoren håndhever de fire lovene (docs/civication-life-story-system.md):
//   1. Ingen valg uten konsekvens.
//   2. Ingen konsekvens uten state-endring.
//   3. Ingen scene uten tråd.
//   4. Ingen tråd uten konflikt.
// Brudd => FAIL FAST (throw). Ingen normalisering, ingen gjetting.
//
// DOM-fri og fetch-fri i kjernen (buildContent/validateContent) slik at den
// kan testes rett i Node. Kun loadContent() bruker fetch (nettleser).

(function (globalScope) {
  "use strict";

  const MANIFEST_PATH = "data/Civication/lifestory/manifest.json";

  /** Kanoniske målere i Player State. Andre nøkler i effekter => feil. */
  const METERS = ["penger", "psyke", "energi", "integritet", "synlighet", "handlingsrom"];

  /** Gyldige visningstyper for en scene (mail er bare én type). */
  const SCENE_TYPES = [
    "melding", "møte", "telefon", "kalenderhendelse", "intern vurdering",
    "privat hendelse", "krise", "samtale", "refleksjon"
  ];

  /** Gyldige trådstatuser (thread state). */
  const THREAD_STATUSES = ["active", "completed", "dormant", "escalated"];

  /** Gyldige toppnøkler i scene.conditions. */
  const CONDITION_KEYS = ["flagg", "meters", "relasjoner", "threads", "profil", "shell"];

  /**
   * Gyldige nøkler i conditions.shell (sann spilltilstand fra skallet, lest
   * via det synkrone snapshotet CivicationLifestoryShellState — samme mønster
   * som profil). Uten snapshot (ren Min dag-flate) fyrer shell-gatede scener
   * ALDRI — vi gjetter ikke spilltilstand.
   */
  const SHELL_CONDITION_KEYS = ["harBosted", "harJobb", "harHusleiepress"];

  /**
   * Gyldige handlingstyper på valg (valg.handling.type). En handling utfører
   * noe EKTE i spillet når valget tas — åpner nabolagsvalget, butikken eller
   * karrierepanelet i skallet, eller navigerer til History GO der quizzene
   * bor. Utføres av CivicationLifestoryActions (UI-laget). Ukjent type =>
   * FAIL FAST.
   */
  const HANDLING_TYPES = ["velg_bosted", "aapne_butikk", "gaa_til_quiz", "aapne_karriere", "gaa_til_byen", "gaa_til_debatt"];

  /**
   * Gyldige livsstilstags på valg (valg.livsstil). Vokabularet er unionen av
   * core/bonus/anti-tags i data/Civication/lifestyles.json — valg tagges med
   * retningen de modellerer (pub => nightlife, eget prosjekt => craft, …),
   * og skallets HG_Lifestyle teller dem opp mot de 13 livsstilene.
   * Ukjent tag => FAIL FAST (ingen gjetting). Holdes i sync av
   * civication-lifestory-lifestyle-bridge.test.js.
   */
  const LIVSSTIL_TAGS = [
    "avoidance", "budget", "craft", "culture", "debt", "family", "fitness",
    "heritage", "hipster", "legitimacy", "luxury", "maximalist", "minimalist",
    "nightlife", "opportunism", "outdoor", "process", "risk", "security",
    "shortcut", "status", "street", "technocrat", "visibility"
  ];

  /**
   * @typedef {Object} LifestoryChoice
   * @property {string} id
   * @property {string} tekst
   * @property {string} [tone]
   * @property {{ relasjoner?: Record<string, number>, meters?: Record<string, number>, flagg?: Record<string, boolean|number|string>, threads?: Record<string, { status?: string, stepDelta?: number }> }} effekter
   * @property {string} [konsekvensTekst]
   * @property {string[]} [laaserOpp]
   * @property {string[]} [livsstil] Livsstilstags (se LIVSSTIL_TAGS) — mates til skallets HG_Lifestyle ved valg.
   *
   * @typedef {Object} LifestoryScene
   * @property {string} id
   * @property {string} threadId
   * @property {string} fase
   * @property {number} dag
   * @property {string} visningstype
   * @property {string|null} [avsender]
   * @property {"start"|"laast"} tilgjengelighet
   * @property {number} [prioritet]
   * @property {string} tittel
   * @property {string} tekst
   * @property {LifestoryChoice[]} valg
   *
   * @typedef {Object} LifestoryThread
   * @property {string} id
   * @property {string} type
   * @property {string} tittel
   * @property {string} tema
   * @property {string} konflikt
   * @property {string[]} personer
   * @property {number} startDag
   *
   * @typedef {Object} LifestoryContent
   * @property {any} role
   * @property {{ id: string, navn: string, rekkefolge: number }[]} faser
   * @property {LifestoryThread[]} threads
   * @property {LifestoryScene[]} scenes
   */

  /**
   * Setter sammen rå JSON-filer til én innholdspakke og validerer den.
   * Kaster ved første strukturelle brudd (fail fast).
   * @param {{ role: any, phaseDefinitions: any, roleThreads: any, roleScenes: any, lifeThreads: any, lifeScenes: any }} raw
   * @returns {LifestoryContent}
   */
  function buildContent(raw) {
    if (!raw || typeof raw !== "object") throw new Error("[LifestoryContent] mangler rådata");

    const role = raw.role;
    const faser = raw.phaseDefinitions && Array.isArray(raw.phaseDefinitions.faser)
      ? raw.phaseDefinitions.faser.slice().sort((a, b) => a.rekkefolge - b.rekkefolge)
      : null;
    const threads = []
      .concat(Array.isArray(raw.roleThreads?.threads) ? raw.roleThreads.threads : [])
      .concat(Array.isArray(raw.lifeThreads?.threads) ? raw.lifeThreads.threads : []);
    const scenes = []
      .concat(Array.isArray(raw.roleScenes?.scenes) ? raw.roleScenes.scenes : [])
      .concat(Array.isArray(raw.lifeScenes?.scenes) ? raw.lifeScenes.scenes : []);

    const content = { role, faser, threads, scenes };
    validateContent(content);
    return /** @type {LifestoryContent} */ (content);
  }

  /**
   * Håndhever de fire lovene + referanseintegritet. Samler ALLE brudd og
   * kaster én feil med hele listen, så innholdsforfattere ser alt på én gang.
   * @param {any} content
   */
  function validateContent(content) {
    /** @type {string[]} */
    const errors = [];
    const push = (msg) => errors.push(msg);

    if (!content || typeof content !== "object") {
      throw new Error("[LifestoryContent] innholdspakke mangler");
    }

    const role = content.role;
    if (!role || typeof role.id !== "string" || !role.id) push("rolle mangler id");
    const startMeters = role?.startState?.meters || {};
    const startRelasjoner = role?.startState?.relasjoner || {};
    for (const meter of METERS) {
      if (typeof startMeters[meter] !== "number") push(`rolle ${role?.id}: startState.meters.${meter} mangler`);
    }

    const faser = content.faser;
    if (!Array.isArray(faser) || !faser.length) {
      push("phaseDefinitions mangler eller er tom");
    }
    const faseIds = new Set((faser || []).map((f) => f?.id));

    // Tråder: lov 4 — ingen tråd uten konflikt.
    const threadIds = new Set();
    for (const thread of content.threads || []) {
      const tid = thread?.id;
      if (!tid || typeof tid !== "string") { push("tråd uten id"); continue; }
      if (threadIds.has(tid)) push(`duplikat tråd-id: ${tid}`);
      threadIds.add(tid);
      if (!thread.konflikt || !String(thread.konflikt).trim()) push(`tråd ${tid}: mangler konflikt (lov 4)`);
      if (!thread.tittel) push(`tråd ${tid}: mangler tittel`);
      if (thread.type !== "arbeidsliv" && thread.type !== "privatliv") push(`tråd ${tid}: ugyldig type "${thread.type}"`);
    }

    // Scener: lov 3 — ingen scene uten tråd. Lov 1+2 per valg.
    const sceneIds = new Set();
    const scenes = content.scenes || [];
    for (const scene of scenes) {
      const sid = scene?.id;
      if (!sid || typeof sid !== "string") { push("scene uten id"); continue; }
      if (sceneIds.has(sid)) push(`duplikat scene-id: ${sid}`);
      sceneIds.add(sid);

      if (!scene.threadId || !threadIds.has(scene.threadId)) {
        push(`scene ${sid}: threadId "${scene.threadId}" finnes ikke (lov 3)`);
      }
      if (!faseIds.has(scene.fase)) push(`scene ${sid}: ukjent fase "${scene.fase}"`);
      if (typeof scene.dag !== "number" || scene.dag < 1) push(`scene ${sid}: ugyldig dag`);
      if (SCENE_TYPES.indexOf(scene.visningstype) === -1) push(`scene ${sid}: ukjent visningstype "${scene.visningstype}"`);
      if (scene.tilgjengelighet !== "start" && scene.tilgjengelighet !== "laast") {
        push(`scene ${sid}: tilgjengelighet må være "start" eller "laast"`);
      }
      if (!scene.tittel || !scene.tekst) push(`scene ${sid}: mangler tittel/tekst`);

      if (scene.conditions !== undefined) {
        errorsForConditions(scene, startRelasjoner, threadIds, push);
      }

      const valg = Array.isArray(scene.valg) ? scene.valg : [];
      if (!valg.length) push(`scene ${sid}: har ingen valg`);
      const choiceIds = new Set();
      for (const choice of valg) {
        const cid = choice?.id;
        if (!cid) { push(`scene ${sid}: valg uten id`); continue; }
        if (choiceIds.has(cid)) push(`scene ${sid}: duplikat valg-id ${cid}`);
        choiceIds.add(cid);
        if (!choice.tekst) push(`scene ${sid}/${cid}: valg uten tekst`);
        if (choice.konsekvensTekst !== undefined &&
            (typeof choice.konsekvensTekst !== "string" || !choice.konsekvensTekst.trim())) {
          push(`scene ${sid}/${cid}: konsekvensTekst må være en ikke-tom streng`);
        }
        errorsForEffects(scene, choice, startRelasjoner, threadIds, push);
        for (const target of choice.laaserOpp || []) {
          if (typeof target !== "string" || !target) push(`scene ${sid}/${cid}: ugyldig laaserOpp-referanse`);
        }
        if (choice.handling !== undefined) {
          if (!choice.handling || typeof choice.handling !== "object" || Array.isArray(choice.handling)) {
            push(`scene ${sid}/${cid}: handling må være et objekt { type }`);
          } else {
            if (HANDLING_TYPES.indexOf(choice.handling.type) === -1) {
              push(`scene ${sid}/${cid}: ukjent handlingstype "${choice.handling.type}" (ikke i HANDLING_TYPES)`);
            }
            for (const key of Object.keys(choice.handling)) {
              if (key !== "type" && key !== "id") push(`scene ${sid}/${cid}: handling har ukjent nøkkel "${key}"`);
            }
            // Måltypede handlinger krever id (f.eks. hvilken debatt).
            if (choice.handling.type === "gaa_til_debatt" &&
                (typeof choice.handling.id !== "string" || !choice.handling.id.trim())) {
              push(`scene ${sid}/${cid}: handlingen gaa_til_debatt krever en ikke-tom id`);
            }
          }
        }
        if (choice.livsstil !== undefined) {
          if (!Array.isArray(choice.livsstil) || !choice.livsstil.length) {
            push(`scene ${sid}/${cid}: livsstil må være en ikke-tom liste med tags`);
          } else {
            for (const tag of choice.livsstil) {
              if (LIVSSTIL_TAGS.indexOf(tag) === -1) {
                push(`scene ${sid}/${cid}: ukjent livsstilstag "${tag}" (ikke i LIVSSTIL_TAGS)`);
              }
            }
          }
        }
      }
    }

    // Referanseintegritet + rekkevidde for låste scener.
    const unlockable = new Set();
    for (const scene of scenes) {
      for (const choice of scene?.valg || []) {
        for (const target of choice?.laaserOpp || []) {
          if (!sceneIds.has(target)) {
            push(`scene ${scene.id}/${choice.id}: laaserOpp peker på ukjent scene "${target}"`);
          } else {
            unlockable.add(target);
          }
        }
      }
    }
    for (const scene of scenes) {
      if (scene?.tilgjengelighet === "laast" && !unlockable.has(scene.id)) {
        push(`scene ${scene.id}: er "laast" men ingen valg låser den opp (uoppnåelig)`);
      }
    }

    // Endings: hver rolle kårer en slutt fra sluttilstanden. Kriteriene må
    // peke på ekte signaler (kjente målere/relasjoner/tråder), og nøyaktig
    // én ending må være merket standard (fallback når ingenting scorer).
    errorsForEndings(role, startRelasjoner, threadIds, push);

    if (errors.length) {
      throw new Error("[LifestoryContent] innholdspakken er ugyldig:\n  - " + errors.join("\n  - "));
    }
  }

  /**
   * Endings-validering: kriterier peker på ekte signaler, og nøyaktig én
   * ending er standard. Endings uten kriterier er lov (kun nåbar som
   * standard/fallback), men et kriterium som peker på en ukjent måler,
   * relasjon eller tråd er en feil (ingen gjetting).
   * @param {any} role
   * @param {Record<string, number>} startRelasjoner
   * @param {Set<string>} threadIds
   * @param {(msg: string) => void} push
   */
  function errorsForEndings(role, startRelasjoner, threadIds, push) {
    const endings = Array.isArray(role?.endings) ? role.endings : [];
    if (!endings.length) return; // endings er valgfritt
    const ids = new Set();
    let standardCount = 0;
    for (const ending of endings) {
      const eid = ending?.id;
      if (!eid || typeof eid !== "string") { push("ending uten id"); continue; }
      if (ids.has(eid)) push(`duplikat ending-id: ${eid}`);
      ids.add(eid);
      if (!ending.navn) push(`ending ${eid}: mangler navn`);
      if (ending.standard === true) standardCount++;
      if (ending.kriterier === undefined) continue;
      const k = ending.kriterier;
      if (!k || typeof k !== "object" || Array.isArray(k)) { push(`ending ${eid}: kriterier må være et objekt`); continue; }
      for (const key of Object.keys(k)) {
        if (["meters", "flagg", "relasjoner", "traader"].indexOf(key) === -1) push(`ending ${eid}: ukjent kriteriegruppe "${key}"`);
      }
      for (const [group, known, label] of [
        [k.meters || {}, (kk) => METERS.indexOf(kk) !== -1, "meters"],
        [k.relasjoner || {}, (kk) => kk in startRelasjoner, "relasjoner"]
      ]) {
        for (const [key, range] of Object.entries(group)) {
          if (!known(key)) push(`ending ${eid}: kriterier.${label} ukjent nøkkel "${key}"`);
          if (!range || typeof range !== "object" || Array.isArray(range) || (range.min === undefined && range.max === undefined)) {
            push(`ending ${eid}: kriterier.${label}.${key} må være { min?, max? }`);
          }
        }
      }
      for (const flag of Object.keys(k.flagg || {})) {
        if (k.flagg[flag] !== true) push(`ending ${eid}: kriterier.flagg.${flag} må være true`);
      }
      for (const [tid, status] of Object.entries(k.traader || {})) {
        if (!threadIds.has(tid)) push(`ending ${eid}: kriterier.traader ukjent tråd "${tid}"`);
        if (THREAD_STATUSES.indexOf(status) === -1) push(`ending ${eid}: kriterier.traader.${tid} ugyldig status "${status}"`);
      }
    }
    if (standardCount !== 1) push(`rolle ${role?.id}: forventet nøyaktig én standard-ending, fant ${standardCount}`);
  }

  /**
   * Lov 1 + 2: hvert valg må ha effekter, og minst én effekt må faktisk
   * endre Player State (nullendringer teller ikke).
   * @param {any} scene
   * @param {any} choice
   * @param {Record<string, number>} startRelasjoner
   * @param {Set<string>} threadIds
   * @param {(msg: string) => void} push
   */
  function errorsForEffects(scene, choice, startRelasjoner, threadIds, push) {
    const where = `scene ${scene.id}/${choice.id}`;
    const eff = choice?.effekter;
    if (!eff || typeof eff !== "object") {
      push(`${where}: valg uten effekter (lov 1)`);
      return;
    }

    let changes = 0;
    for (const [key, value] of Object.entries(eff.meters || {})) {
      if (METERS.indexOf(key) === -1) push(`${where}: ukjent måler "${key}"`);
      if (typeof value !== "number") push(`${where}: måler ${key} er ikke et tall`);
      else if (value !== 0) changes++;
    }
    for (const [key, value] of Object.entries(eff.relasjoner || {})) {
      if (!(key in startRelasjoner)) push(`${where}: ukjent relasjon "${key}" (finnes ikke i rollens startState)`);
      if (typeof value !== "number") push(`${where}: relasjon ${key} er ikke et tall`);
      else if (value !== 0) changes++;
    }
    for (const [threadId, change] of Object.entries(eff.threads || {})) {
      if (!threadIds.has(threadId)) push(`${where}: threads-effekt peker på ukjent tråd "${threadId}"`);
      if (!change || typeof change !== "object") {
        push(`${where}: threads-effekt for ${threadId} må være et objekt`);
        continue;
      }
      const keys = Object.keys(change);
      if (!keys.length) push(`${where}: threads-effekt for ${threadId} er tom`);
      for (const key of keys) {
        if (key !== "status" && key !== "stepDelta") push(`${where}: ukjent threads-effektnøkkel "${key}"`);
      }
      if (change.status !== undefined && THREAD_STATUSES.indexOf(change.status) === -1) {
        push(`${where}: ugyldig trådstatus "${change.status}"`);
      }
      if (change.stepDelta !== undefined && typeof change.stepDelta !== "number") {
        push(`${where}: stepDelta for ${threadId} er ikke et tall`);
      }
      if (change.status !== undefined || (typeof change.stepDelta === "number" && change.stepDelta !== 0)) changes++;
    }
    changes += Object.keys(eff.flagg || {}).length;
    if ((choice.laaserOpp || []).length) changes++;

    if (!changes) push(`${where}: ingen effekt endrer state (lov 2)`);
  }

  /**
   * Validerer scene.conditions strukturelt: kjente toppnøkler, kjente
   * målere/relasjoner/tråder, gyldige former. Ukjent nøkkel => feil
   * (ingen gjetting). Flagg-betingelser: literal verdi (må være lik)
   * eller { "finnes": true/false } (må finnes / må ikke finnes).
   * Meters/relasjoner: { min?, max? } med minst én grense.
   * @param {any} scene
   * @param {Record<string, number>} startRelasjoner
   * @param {Set<string>} threadIds
   * @param {(msg: string) => void} push
   */
  function errorsForConditions(scene, startRelasjoner, threadIds, push) {
    const where = `scene ${scene.id}: conditions`;
    const cond = scene.conditions;
    if (!cond || typeof cond !== "object" || Array.isArray(cond)) {
      push(`${where} må være et objekt`);
      return;
    }
    for (const key of Object.keys(cond)) {
      if (CONDITION_KEYS.indexOf(key) === -1) push(`${where}: ukjent nøkkel "${key}"`);
    }
    for (const [flag, expected] of Object.entries(cond.flagg || {})) {
      const type = typeof expected;
      if (type === "boolean" || type === "number" || type === "string") continue;
      if (expected && type === "object" && !Array.isArray(expected)) {
        const keys = Object.keys(expected);
        if (keys.length === 1 && keys[0] === "finnes" && typeof expected.finnes === "boolean") continue;
      }
      push(`${where}.flagg.${flag}: må være literal verdi eller { "finnes": true/false }`);
    }
    for (const [group, known, label] of [
      [cond.meters || {}, (k) => METERS.indexOf(k) !== -1, "meters"],
      [cond.relasjoner || {}, (k) => k in startRelasjoner, "relasjoner"]
    ]) {
      for (const [key, range] of Object.entries(group)) {
        if (!known(key)) push(`${where}.${label}: ukjent nøkkel "${key}"`);
        if (!range || typeof range !== "object" || Array.isArray(range)) {
          push(`${where}.${label}.${key}: må være { min?, max? }`);
          continue;
        }
        const hasMin = range.min !== undefined;
        const hasMax = range.max !== undefined;
        if (!hasMin && !hasMax) push(`${where}.${label}.${key}: mangler både min og max`);
        for (const bound of Object.keys(range)) {
          if (bound !== "min" && bound !== "max") push(`${where}.${label}.${key}: ukjent grense "${bound}"`);
        }
        if (hasMin && typeof range.min !== "number") push(`${where}.${label}.${key}: min er ikke et tall`);
        if (hasMax && typeof range.max !== "number") push(`${where}.${label}.${key}: max er ikke et tall`);
        if (hasMin && hasMax && typeof range.min === "number" && typeof range.max === "number" && range.min > range.max) {
          push(`${where}.${label}.${key}: min > max`);
        }
      }
    }
    for (const [threadId, status] of Object.entries(cond.threads || {})) {
      if (!threadIds.has(threadId)) push(`${where}.threads: ukjent tråd "${threadId}"`);
      if (THREAD_STATUSES.indexOf(status) === -1) push(`${where}.threads.${threadId}: ugyldig status "${status}"`);
    }
    if (cond.profil !== undefined) {
      // profil: { tags: [...] } — scenen er kandidat hvis spilleren har MINST
      // ÉN av taggene (fra ProfileSignalBridge: engelske temategs som
      // "culture"/"sport"/"nature" + norske domenetags fra samlingen).
      // Formen valideres strengt; medlemskap i vokabularet valideres ikke
      // (en ukjent tag gir en scene som aldri fyrer, aldri et kræsj).
      const profil = cond.profil;
      if (!profil || typeof profil !== "object" || Array.isArray(profil)) {
        push(`${where}.profil må være { tags: [...] }`);
      } else {
        for (const key of Object.keys(profil)) {
          if (key !== "tags") push(`${where}.profil: ukjent nøkkel "${key}"`);
        }
        if (!Array.isArray(profil.tags) || !profil.tags.length) {
          push(`${where}.profil.tags må være en ikke-tom liste`);
        } else {
          for (const tag of profil.tags) {
            if (typeof tag !== "string" || !tag.trim() || tag !== tag.toLowerCase()) {
              push(`${where}.profil.tags: ugyldig tag "${tag}" (små bokstaver, ikke tom)`);
            }
          }
        }
      }
    }
    if (cond.shell !== undefined) {
      // shell: sann spilltilstand fra skallet, f.eks. { harBosted: false }.
      // Kun kjente nøkler og boolske forventninger — ingen gjetting.
      const shell = cond.shell;
      if (!shell || typeof shell !== "object" || Array.isArray(shell)) {
        push(`${where}.shell må være et objekt med boolske forventninger`);
      } else {
        if (!Object.keys(shell).length) push(`${where}.shell er tomt`);
        for (const [key, expected] of Object.entries(shell)) {
          if (SHELL_CONDITION_KEYS.indexOf(key) === -1) push(`${where}.shell: ukjent nøkkel "${key}"`);
          if (typeof expected !== "boolean") push(`${where}.shell.${key}: må være true/false`);
        }
      }
    }
  }

  /**
   * Nettleser: last manifest + alle filer for en rolle og bygg validert pakke.
   * Bruker CivicationJsonStore når den finnes (dedupet fetch), ellers fetch.
   * @param {string} roleId
   * @returns {Promise<LifestoryContent>}
   */
  async function loadContent(roleId) {
    const manifest = await fetchJson(MANIFEST_PATH);
    const roleEntry = manifest?.roles?.[roleId];
    if (!roleEntry) {
      throw new Error(`[LifestoryContent] rollen "${roleId}" finnes ikke i ${MANIFEST_PATH}`);
    }
    const [role, phaseDefinitions, roleThreads, roleScenes, lifeThreads, lifeScenes] = await Promise.all([
      fetchJson(roleEntry.role),
      fetchJson(manifest.shared.phaseDefinitions),
      fetchJson(roleEntry.threads),
      fetchJson(roleEntry.scenes),
      fetchJson(manifest.life.threads),
      fetchJson(manifest.life.scenes)
    ]);
    return buildContent({ role, phaseDefinitions, roleThreads, roleScenes, lifeThreads, lifeScenes });
  }

  /**
   * @param {string} path
   * @returns {Promise<any>}
   */
  async function fetchJson(path) {
    const store = /** @type {any} */ (globalScope).CivicationJsonStore;
    const json = store?.fetchJson ? await store.fetchJson(path) : await plainFetch(path);
    if (json == null) throw new Error(`[LifestoryContent] kunne ikke laste ${path}`);
    return json;
  }

  /**
   * @param {string} path
   * @returns {Promise<any>}
   */
  async function plainFetch(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  }

  /**
   * Skall-jobb → Life Story-rolle: finn rollen i manifestet hvis
   * `role_scope`-binding matcher skallets role_scope (fra
   * CivicationCareerRoleResolver). Ren og DOM-fri; null hvis ingen
   * Life Story-pakke finnes for scopet — ingen gjetting, ingen fallback.
   * @param {any} manifest
   * @param {string|null|undefined} roleScope
   * @returns {string|null}
   */
  function resolveRoleIdForRoleScope(manifest, roleScope) {
    const scope = typeof roleScope === "string" ? roleScope.trim() : "";
    if (!scope || scope === "unknown") return null;
    for (const [roleId, entry] of Object.entries(manifest?.roles || {})) {
      if (entry && entry.role_scope === scope) return roleId;
    }
    return null;
  }

  /**
   * Nettleser: map skallets aktive posisjon til en Life Story-rolle.
   * Bruker den kanoniske resolveren (CivicationCareerRoleResolver) hvis den
   * er lastet — vi dupliserer aldri scope-logikken her. Returnerer null når
   * resolveren mangler, posisjonen er tom, eller scopet ikke har noen pakke.
   * @param {any} activePosition
   * @returns {Promise<string|null>}
   */
  async function resolveRoleIdForActivePosition(activePosition) {
    if (!activePosition || typeof activePosition !== "object") return null;
    const resolver = /** @type {any} */ (globalScope).CivicationCareerRoleResolver;
    const scope = resolver?.resolveCareerRoleScope?.(activePosition);
    if (!scope || scope === "unknown") return null;
    const manifest = await fetchJson(MANIFEST_PATH);
    return resolveRoleIdForRoleScope(manifest, scope);
  }

  const api = { METERS, SCENE_TYPES, THREAD_STATUSES, CONDITION_KEYS, SHELL_CONDITION_KEYS, HANDLING_TYPES, LIVSSTIL_TAGS, MANIFEST_PATH, buildContent, validateContent, loadContent, resolveRoleIdForRoleScope, resolveRoleIdForActivePosition };
  /** @type {any} */ (globalScope).CivicationLifestoryContent = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
