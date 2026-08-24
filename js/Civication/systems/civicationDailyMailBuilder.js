// js/Civication/systems/civicationDailyMailBuilder.js
// Bygger én faktisk Civication-arbeidsdag fra mailDayProgram.json.
// Prinsipp:
// - MailRuntime eier fortsatt langsiktig rolleprogresjon.
// - DailyMailBuilder eier dagsbunke/rytme: flere mailer per dag, fase for fase.
// - Kun dagens primære planmail får beholde source_type:"planned" og kan dermed flytte rolePlan ett steg.
// - Micro/followup/knowledge/consequence/day_end er dagsinnhold og skal ikke flytte rolePlan.

(function () {
  "use strict";

  const DAY_RUNTIME_KEY = "mail_day_runtime_v1";
  const DAY_PROGRAM_PATH = "data/Civication/mailDayProgram.json";
  const NARRATIVE_MANIFEST_PATH = "data/Civication/narratives/manifest.json";
  const NARRATIVE_KEY = "narrative_state_v1";
  const PATCHED_FLAG = "__civicationDailyMailBuilderPatched";
  const ANSWER_MIDDLEWARE_NAME = "daily_mail_builder";
  const ANSWER_MIDDLEWARE_PRIORITY = 40;
  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";

  const EXTRA_MAIL_TYPES = [
    "people",
    "story",
    "conflict",
    "event",
    "faction_choice",
    "micro",
    "followup",
    "knowledge",
    "consequence"
  ];

  // Avklaringspakkene genereres som varianter av samme story-node: samme
  // narrative_arc fortalt gjennom ulik mailtype/task_domain (f.eks. «Den
  // irriterende nabomailen har ett sant punkt: varelevering/støy/tillit …»).
  // Disse typene deler derfor tråd per narrative_arc. Øvrige typer (job,
  // people, story, conflict, event) er egne scener med unik tråd per kildemail.
  const CASE_THREAD_TYPES = new Set(["micro", "followup", "knowledge", "consequence"]);
  const DAY_PHASE_ORDER = ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];

  // To rytmer (se js/Civication/README.md): de private døgnfasene eier livsrytmen
  // og skal ALDRI inneholde jobbmailer. Arbeidsfasene (forenoon+workday) eier
  // jobbøkten hos arbeidsgiver — det er den eneste rytmen jobbmailene lever i.
  // Denne separasjonen er hovedløsningen; tråd-dedupe er bare et sikkerhetsnett.
  const PRIVATE_PHASES = new Set(["morning", "lunch", "afternoon", "dinner", "evening", "day_end"]);
  const WORK_PHASES = new Set(["forenoon", "workday"]);
  // Narrativ-strømtyper som er jobb/rolleinnhold og derfor ikke hører hjemme i
  // private faser. «leisure» og øvrige personlige strømmer er tillatt privat.
  const WORK_STREAM_TYPES = new Set(["work", "class_case", "class_cases", "conflict"]);
  // Klasse for private døgnfase-mailer. Frikoblet fra "daily_workday" slik at
  // private faser aldri bærer jobbklassen — det er både separasjonen og det
  // testene sjekker.
  const PRIVATE_MAIL_CLASS = "daily_private";
  const WORK_MAIL_CLASS = "daily_workday";

  function isPrivatePhase(phaseId) {
    return PRIVATE_PHASES.has(String(phaseId || "").trim());
  }

  // Jobbinnhold-signatur: brukes som defensivt filter for å holde jobbmailer ute
  // av private faser selv om et gammelt save eller en ekstern generator skulle
  // ha lagt dem der. En mail regnes som jobbinnhold hvis den bærer jobbklassen,
  // er en planlagt rollemail, eller åpenbart tilhører en rolle/arbeidsgiver.
  function isWorkContentEvent(event) {
    if (!event || typeof event !== "object") return false;
    const mailClass = String(event.mail_class || "").trim();
    if (mailClass === WORK_MAIL_CLASS) return true;
    const sourceType = String(event.source_type || "").trim();
    if (sourceType === "planned") return true;
    const scope = String(event.role_scope || "").trim();
    if (scope && scope !== "private" && scope !== "unknown") return true;
    return false;
  }
  // Rangordning for valg av kanonisk case-variant. Rollepakkene bruker to
  // faseskjemaer om hverandre: dagfaser (morning…day_end) og stadier
  // (intro…mastery). Begge rangeres slik at casen åpner i sin tidligste form.
  const REPRESENTATIVE_PHASE_RANK = {
    morning: 0, intro: 0,
    forenoon: 1, early: 1,
    workday: 2, mid: 2,
    lunch: 3, stable: 3,
    afternoon: 4,
    dinner: 5,
    evening: 6, late: 6,
    day_end: 7,
    advanced: 8,
    mastery: 9
  };
  const REPRESENTATIVE_PHASE_RANK_DEFAULT = 10;

  const jsonCache = new Map();

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // Stabil dedupe-nøkkel per melding/tråd. Eksplisitt thread_key i data vinner;
  // deretter deler case-typene tråd per (role_scope + narrative_arc); alle andre
  // får unik tråd per kildemail (source_mail_id før instans-id, slik at daglige
  // instanser av samme kildemail havner i samme tråd).
  function threadKeyForMail(mail) {
    const explicit = norm(mail?.thread_key || mail?.threadKey);
    if (explicit) return explicit;
    const scope = slugify(mail?.role_scope) || "role";
    const arc = slugify(mail?.narrative_arc);
    if (arc && CASE_THREAD_TYPES.has(norm(mail?.mail_type))) return `${scope}.case.${arc}`;
    const id = slugify(mail?.source_mail_id || mail?.id);
    return id ? `${scope}.mail.${id}` : "";
  }

  function isCaseThreadKey(key) {
    return norm(key).includes(".case.");
  }

  // Én kanonisk mail per case-tråd per dagbygg: varianter av samme story-node
  // kollapses FØR slot-plukking, slik at generatoren aldri kan legge samme case
  // i flere slots/faser samme dag. Representanten velges deterministisk:
  // thread_canonical-flagg i data vinner, deretter tidligste dagfase (casen
  // åpner i sin morgenform), deretter høyest prioritet, deretter laveste id.
  function representativePhaseRank(mail) {
    const rank = REPRESENTATIVE_PHASE_RANK[norm(mail?.phase)];
    return typeof rank === "number" ? rank : REPRESENTATIVE_PHASE_RANK_DEFAULT;
  }

  function preferAsThreadRepresentative(candidate, current) {
    if (!current) return true;
    const canonicalA = candidate?.thread_canonical === true ? 1 : 0;
    const canonicalB = current?.thread_canonical === true ? 1 : 0;
    if (canonicalA !== canonicalB) return canonicalA > canonicalB;
    const rankA = representativePhaseRank(candidate);
    const rankB = representativePhaseRank(current);
    if (rankA !== rankB) return rankA < rankB;
    const prioA = Number(candidate?.priority || 0);
    const prioB = Number(current?.priority || 0);
    if (prioA !== prioB) return prioA > prioB;
    return norm(candidate?.id) < norm(current?.id);
  }

  function collapsePoolToCanonicalThreads(pool, excludedThreadKeys, consumedIds) {
    const rest = [];
    const byThread = new Map();
    for (const mail of (Array.isArray(pool) ? pool : [])) {
      const key = threadKeyForMail(mail);
      const stamped = norm(mail?.thread_key) ? mail : { ...mail, thread_key: key };
      if (!isCaseThreadKey(key)) {
        rest.push(stamped);
        continue;
      }
      if (excludedThreadKeys?.has?.(key)) continue;
      // Konsumerte varianter kan ikke representere tråden — da fortsetter
      // casen på en senere dag med neste ubrukte variant.
      if (consumedIds?.has?.(norm(mail?.id))) continue;
      const current = byThread.get(key);
      if (preferAsThreadRepresentative(stamped, current)) byThread.set(key, stamped);
    }
    return [...rest, ...byThread.values()];
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }

  function normalizeLinks(values) {
    const list = Array.isArray(values) ? values : [];
    const seen = new Set();
    const out = [];
    for (const entry of list) {
      if (typeof entry === "string") {
        const url = norm(entry);
        if (!url) continue;
        const key = `s:${url}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(url);
        continue;
      }
      if (!entry || typeof entry !== "object") continue;
      const label = norm(entry.label);
      const url = norm(entry.url);
      if (!label && !url) continue;
      const key = `o:${label}::${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...(label ? { label } : {}), ...(url ? { url } : {}) });
    }
    return out;
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function getInbox(engine) {
    const fromEngine = engine?.getInbox?.();
    if (Array.isArray(fromEngine)) return fromEngine;
    const fromMailEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromMailEngine)) return fromMailEngine;
    const fromState = window.CivicationState?.getInbox?.();
    return Array.isArray(fromState) ? fromState : [];
  }

  function eventOfInboxItem(item) {
    return item?.event || item || null;
  }

  function hasAnswerChoices(eventObj) {
    return Array.isArray(eventObj?.choices) && eventObj.choices.length > 0;
  }

  function isActionablePendingInboxItem(item) {
    if (!item || item.deleted === true || item.archived === true || item.resolved === true) return false;
    const eventObj = eventOfInboxItem(item) || {};
    const status = norm(item.status || eventObj.status || "pending").toLowerCase();
    if (status !== "pending" && status !== "open") return false;

    const choices = Array.isArray(eventObj.choices) ? eventObj.choices : [];
    if (choices.length > 0) return true;

    const kindText = [
      eventObj.mail_type,
      eventObj.type,
      eventObj.kind,
      eventObj.slot,
      eventObj.task_id,
      eventObj.source_type
    ].map(String).join(" ").toLowerCase();

    if (kindText.includes("task_gate")) return true;
    if (eventObj.requiresAction === true) return true;
    if ((eventObj.required === true || eventObj.isRequired === true) && choices.length > 0) return true;
    if ((kindText.includes("daily") || kindText.includes("planned")) && choices.length > 0) return true;

    return false;
  }

  function hasPending(engine) {
    return getInbox(engine).some(isActionablePendingInboxItem);
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || "");
  }

  // Dedupe samtidige kall mot samme fil: cache lagrer verdier, inflight lagrer
  // pågående promises, slik at N samtidige kall gir ÉN fetch (ikke N).
  const jsonInflight = new Map();

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (jsonCache.has(p)) return jsonCache.get(p);
    if (jsonInflight.has(p)) return jsonInflight.get(p);
    const promise = loadJsonUncached(p);
    jsonInflight.set(p, promise);
    try {
      return await promise;
    } finally {
      jsonInflight.delete(p);
    }
  }

  async function loadJsonUncached(p) {
    // Delt lager først: én fetch per fil på tvers av alle Civication-motorer.
    const sharedStore = window.CivicationJsonStore;
    if (sharedStore?.fetchJson) {
      const shared = await sharedStore.fetchJson(p);
      jsonCache.set(p, shared);
      return shared;
    }
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (!res.ok) {
        jsonCache.set(p, null);
        return null;
      }
      const json = await res.json();
      jsonCache.set(p, json);
      return json;
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationDailyMailBuilder] kunne ikke laste", p, error);
      jsonCache.set(p, null);
      return null;
    }
  }

  function getPlanPath(active) {
    const category = norm(active?.career_id);
    const roleScope = resolveRoleScope(active);
    if (!category || !roleScope) return null;
    return `data/Civication/mailPlans/${category}/${roleScope}_plan.json`;
  }

  function getFamilyPaths(active) {
    const category = norm(active?.career_id);
    const roleScope = resolveRoleScope(active);
    if (!category || !roleScope) return [];

    const paths = [
      `data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json`,
      `data/Civication/mailFamilies/${category}/job/${roleScope}_job.json`
    ];

    for (const type of EXTRA_MAIL_TYPES) {
      paths.push(`data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
    }

    return paths;
  }

  function normalizeChoices(choices) {
    const list = Array.isArray(choices) ? choices : [];
    const normalized = list
      .filter(Boolean)
      .map(choice => ({
        ...choice,
        id: norm(choice.id),
        label: norm(choice.label),
        effect: Number(choice.effect || 0),
        tags: Array.isArray(choice.tags) ? choice.tags.map(norm).filter(Boolean) : [],
        feedback: norm(choice.feedback)
      }))
      .filter(choice => choice.id && choice.label);

    return normalized;
  }

  function flattenCatalog(catalog) {
    const out = [];
    const families = Array.isArray(catalog?.families) ? catalog.families : [];
    const catalogType = norm(catalog?.mail_type);

    for (const family of families) {
      const familyId = norm(family?.id);
      const mails = Array.isArray(family?.mails) ? family.mails : [];
      for (const mail of mails) {
        const id = norm(mail?.id);
        if (!id) continue;

        out.push({
          ...mail,
          id,
          category: norm(catalog?.category),
          role_scope: norm(mail?.role_scope || catalog?.role_scope),
          mail_type: norm(mail?.mail_type || catalogType || "job"),
          mail_family: norm(mail?.mail_family || familyId),
          choices: normalizeChoices(mail?.choices),
          situation: Array.isArray(mail?.situation)
            ? mail.situation.map(norm).filter(Boolean)
            : [norm(mail?.summary)].filter(Boolean)
        });
      }
    }

    return out;
  }

  async function loadCatalogMails(active) {
    const paths = getFamilyPaths(active);
    const catalogs = [];
    for (const path of paths) {
      const json = await loadJson(path);
      if (json) catalogs.push(json);
    }
    const mails = catalogs.flatMap(flattenCatalog);
    const bridge = window.CivicationCareerKnowledgeBridge;
    if (!bridge?.decorateMail) return mails;
    return await Promise.all(mails.map((mail) => bridge.decorateMail(mail)));
  }

  function hashString(input) {
    let h = 2166136261;
    const s = String(input || "");
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededScore(seed, mail) {
    const priority = Number(mail?.priority || 1);
    return priority * 100000 + hashString(`${seed}:${mail?.id || ""}`);
  }

  function evaluateWorkRhythm(mail, context) {
    const helper = window.CivicationWorkRhythm;
    if (typeof helper?.evaluateScene !== "function") return { eligible: true, priority_score: 0 };
    return helper.evaluateScene(mail, context?.state || getState(), {
      day_index: window.CivicationWorkdayRuntime?.getWorkdayDayIndex?.() || 1,
      phase: context?.phase
    });
  }

  function evaluateSocialStanding(mail, context) {
    const helper = window.CivicationSocialStandingFactory;
    if (typeof helper?.evaluateScene !== "function") return { eligible: true };
    return helper.evaluateScene(mail, context?.state || getState());
  }

  function progressionText(mail) {
    return [
      mail?.id,
      mail?.source_mail_id,
      mail?.mail_family,
      mail?.mail_type,
      mail?.phase,
      mail?.stage,
      mail?.package,
      mail?.package_id,
      mail?.family_id,
      ...(Array.isArray(mail?.mail_tags) ? mail.mail_tags : []),
      ...(Array.isArray(mail?.tags) ? mail.tags : [])
    ].map(slugify).filter(Boolean).join(" ");
  }

  function extractProgressionWeek(mail) {
    const text = progressionText(mail);
    const weekMatch = text.match(/(?:^|_)week_?([0-9]+)(?:_|$)|(?:^|_)w_?([0-9]+)(?:_|$)/);
    if (weekMatch) return Number(weekMatch[1] || weekMatch[2] || 0) || null;
    if (/(^|_)first_week(_|$)/.test(text)) return 1;
    if (/(^|_)second_week(_|$)/.test(text)) return 2;
    return null;
  }

  function stepIndexFromState(state, plan) {
    const progress = state?.mail_plan_progress && typeof state.mail_plan_progress === "object"
      ? state.mail_plan_progress
      : {};
    const planId = norm(plan?.id);
    const byPlan = planId && progress[planId] && typeof progress[planId] === "object"
      ? progress[planId]
      : null;
    const candidates = [byPlan?.step_index, progress.step_index, progress.current_step_index];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    return 0;
  }

  function inferMaxWeekFromPlan(plan, stepIndex, plannedPrimary) {
    const plannedWeek = extractProgressionWeek(plannedPrimary);
    if (plannedWeek) return plannedWeek;

    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    const current = sequence[Math.max(0, Math.min(sequence.length - 1, Number(stepIndex || 0)))] || null;
    const currentText = progressionText({
      id: `${current?.phase || ""}_${current?.step_goal || ""}`,
      mail_family: uniqueStrings(current?.allowed_families).join("_")
    });
    if (/(^|_)week2(_|$)|(^|_)second_week(_|$)/.test(currentText)) return 2;
    if (/(^|_)week1(_|$)|(^|_)first_week(_|$)|(^|_)intro(_|$)/.test(currentText)) return 1;

    // Controller-style two-week plans usually model five job/private pairs per week.
    return Number(stepIndex || 0) >= 10 ? 2 : 1;
  }

  function getDailyProgressionContext(active, state, plannedPrimary, runtime, plan) {
    const stepIndex = stepIndexFromState(state, plan);
    const maxWeek = Math.max(1, inferMaxWeekFromPlan(plan, stepIndex, plannedPrimary));
    return {
      role_scope: resolveRoleScope(active),
      step_index: stepIndex,
      max_week: maxWeek,
      planned_primary_id: norm(plannedPrimary?.id),
      used_ids: consumedSet(state),
      state,
      runtime
    };
  }

  function mailMatchesDailyProgression(mail, context) {
    const id = norm(mail?.id || mail?.source_mail_id);
    if (!id) return false;
    if (context?.used_ids?.has?.(id)) return false;
    if (id === norm(context?.planned_primary_id)) return false;
    if (evaluateWorkRhythm(mail, context).eligible !== true) return false;
    if (evaluateSocialStanding(mail, context).eligible !== true) return false;
    // Some authored packages are intentionally reachable only through the role plan.
    // They may live in normal mail-family catalogs for SceneCatalog/MailRuntime, but
    // must never be sampled as daily_extra before or beside their planned step.
    if (mail?.planned_only === true) return false;

    const text = progressionText(mail);
    const week = extractProgressionWeek(mail);
    const maxWeek = Math.max(1, Number(context?.max_week || 1));

    // Daily extras are allowed to be rich, but not to jump the role arc. These
    // conservative metadata/string gates catch package ids, family ids and mail
    // ids such as week2/second_week/advanced/mastery before rolePlan reaches them.
    if (week && week > maxWeek) return false;
    if (/(^|_)(advanced|mastery|late_game|later_phase|senere|viderekommen)(_|$)/.test(text) && maxWeek < 2) return false;
    if (/(^|_)(week2|second_week)(_|$)/.test(text) && maxWeek < 2) return false;

    return true;
  }

  function filterPoolForDailySlot(pool, phase, slot, context) {
    const rhythmContext = { ...context, phase: norm(phase?.id || phase) };
    const safe = (Array.isArray(pool) ? pool : []).filter(mail => mailMatchesDailyProgression(mail, rhythmContext));
    const slotId = slugify(slot?.slot || slot?.type || "");
    const slotType = slugify(slot?.type || slot?.slot || "");

    if (slotId === "morning_brief" || slotType === "story_or_context") {
      const contextFirst = safe.filter(mail => {
        const type = norm(mail?.mail_type);
        const text = progressionText(mail);
        if (type === "story" || type === "people") return true;
        if (/(^|_)(intro|week1|first_week)(_|$)/.test(text) && !/(^|_)(week2|second_week|advanced|mastery)(_|$)/.test(text)) return true;
        return type !== "job";
      });
      return contextFirst.length ? contextFirst : [];
    }

    return safe;
  }

  function consumedSet(state) {
    const consumed = state?.consumed && typeof state.consumed === "object"
      ? Object.keys(state.consumed)
      : [];
    const mailRuntime = state?.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object"
      ? state.mail_runtime_v1
      : {};
    const dayRuntime = state?.[DAY_RUNTIME_KEY] && typeof state[DAY_RUNTIME_KEY] === "object"
      ? state[DAY_RUNTIME_KEY]
      : {};

    return new Set(uniqueStrings([
      ...consumed,
      ...(Array.isArray(mailRuntime.consumed_ids) ? mailRuntime.consumed_ids : []),
      ...(Array.isArray(dayRuntime.answered_ids) ? dayRuntime.answered_ids : []),
      ...(Array.isArray(dayRuntime.delivered_ids) ? dayRuntime.delivered_ids : [])
    ]));
  }

  function preferredTypesForSlot(slot) {
    const type = slugify(slot?.type || slot?.slot || "");
    const slotId = slugify(slot?.slot || "");

    if (type === "story_or_context") return ["story", "people", "job"];
    if (type === "job" || type === "primary_work_mail") return ["job"];
    if (slotId === "operational_batch") return ["micro", "consequence", "job"];
    if (type === "job_micro" || type === "micro" || slotId === "operational_mail") return ["micro", "knowledge", "job"];
    if (type === "people" || type === "people_or_status" || slotId.includes("people")) return ["people", "micro"];
    if (type === "phase") return ["__generated_phase"];
    if (type === "conflict_or_event") return ["conflict", "event"];
    if (type === "followup") return ["followup", "people", "job"];
    if (type === "knowledge") return ["knowledge", "story", "job"];
    if (type === "consequence") return ["consequence", "followup", "people"];
    if (type === "micro_choice") return ["micro"];
    if (type === "task_gate" || slotId === "task_gate") return ["task_gate", "job", "micro"];
    if (type === "day_end") return ["__generated_day_end"];

    return [type || "job"];
  }

  function isStrictSlot(slot) {
    const type = slugify(slot?.type || slot?.slot || "");
    const slotId = slugify(slot?.slot || "");
    return type === "micro_choice"
      || type === "task_gate"
      || slotId === "preparation"
      || slotId === "day_goal_choice"
      || slotId === "main_delivery"
      || slotId === "small_choice"
      || slotId === "afternoon_choice"
      || slotId === "plan_tomorrow";
  }

  function phaseLabel(phase) {
    const id = norm(phase?.id);
    return norm(phase?.label) || ({
      morning: "Morgen",
      forenoon: "Formiddag",
      workday: "Arbeidsdag",
      lunch: "Lunsj",
      afternoon: "Ettermiddag",
      dinner: "Middag",
      evening: "Kveld",
      day_end: "Dagslutt / Natt"
    })[id] || id || "Arbeidsdag";
  }

  function makeGeneratedEvent(active, phase, slot, index, runtimeInstanceKey = "") {
    const phaseId = norm(phase?.id || "morning");
    const roleTitle = norm(active?.title || "rollen");
    const slotId = slugify(slot?.slot || slot?.type || `slot_${index}`);
    const type = slugify(slot?.type || slot?.slot || "phase");
    const isDayEnd = type === "day_end" || phaseId === "day_end";
    const isLunch = phaseId === "lunch";
    const isEvening = phaseId === "evening";
    const isDinner = phaseId === "dinner";

    const subject = isDayEnd
      ? "Dagslutt: hva ble faktisk gjort?"
      : isLunch
        ? "Lunsj: en liten avklaring midt i dagen"
        : isDinner
          ? "Middag: mat, energi og hvem du spiser med"
          : isEvening
            ? "Kveld: hvile, læring eller sosialt rom"
            : `${phaseLabel(phase)}: neste avklaring`;

    const situation = isDayEnd
      ? [
          `Arbeidsdagen i ${roleTitle} går mot slutten.`,
          "Du ser tilbake på valgene som ble tatt, hvilke saker som ble løst, og hvilke som følger med inn i neste dag.",
          "Dagslutt handler ikke om å vinne dagen, men om å vite hva dagen gjorde med arbeidet."
        ]
      : [
          `Du er i ${phaseLabel(phase).toLowerCase()}en som ${roleTitle}.`,
          "Det dukker opp en liten sak som ikke er stor nok til å være hovedkonflikten, men konkret nok til å forme rytmen i dagen.",
          "Hvordan du håndterer slike små øyeblikk avgjør om dagen føles styrt eller bare gjennomført."
        ];

    const generatedId = `${slugify(active?.role_key || active?.title || "rolle")}_${phaseId}_${slotId}_${todayKey()}_${index}${runtimeInstanceKey}`;
    const privateScope = isPrivatePhase(phaseId);

    return {
      id: generatedId,
      thread_key: `${(privateScope ? "private" : resolveRoleScope(active)) || "role"}.mail.${slugify(generatedId)}`,
      source: "Civication",
      source_type: "daily_generated",
      mail_type: isDayEnd ? "day_end" : "phase",
      mail_family: isDayEnd ? "daily_day_end" : "daily_phase",
      mail_class: privateScope ? PRIVATE_MAIL_CLASS : WORK_MAIL_CLASS,
      channel: privateScope ? "private" : "job",
      messageChannel: privateScope ? "private" : "job",
      workday_related: privateScope ? false : true,
      role_scope: privateScope ? "" : resolveRoleScope(active),
      career_id: privateScope ? "" : norm(active?.career_id),
      role_id: privateScope ? "" : norm(active?.role_id),
      employer_id: privateScope ? "" : (window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id)),
      stage: "stable",
      phase_tag: phaseId,
      subject,
      summary: situation[0],
      situation,
      task_domain: isDayEnd ? "day_summary" : "phase_context",
      competency: isDayEnd ? "refleksjon" : "prioritering",
      pressure: isDayEnd ? "carryover" : phaseId,
      choice_axis: isDayEnd ? "avslutte_vs_baere_videre" : "struktur_vs_flyt",
      consequence_axis: isDayEnd ? "laring_vs_slitasje" : "tillit_vs_tempo",
      narrative_arc: isDayEnd ? "dagslutt" : "arbeidsdagens_rytme",
      choices: isDayEnd
        ? [
            {
              id: "A",
              label: "Oppsummer dagen og ta med ett tydelig læringspunkt videre",
              effect: 1,
              tags: ["learning", "process"],
              feedback: "Du gjør dagen om til erfaring, ikke bare aktivitet."
            },
            {
              id: "B",
              label: "Lukk dagen raskt og gå videre",
              effect: 0,
              tags: ["closure", "tempo"],
              feedback: "Du får avsluttet, men mister litt av læringen som kunne fulgt med."
            }
          ]
        : [
            {
              id: "A",
              label: "Ta saken ryddig nå",
              effect: 1,
              tags: ["process", "trust"],
              feedback: "Du bruker et lite øyeblikk til å skape mer orden."
            },
            {
              id: "B",
              label: "La saken vente til hovedarbeidet er gjort",
              effect: 0,
              tags: ["tempo", "risk"],
              feedback: "Du holder fart, men lar en liten uavklart sak følge med videre."
            }
          ]
    };
  }

  // Morgenens overgang til arbeidsdag. I stedet for å levere en rolle-/case-mail
  // rett inn i morgenfasen (som gjorde at Arealplanlegger føltes som spam),
  // viser morgenen bare at det finnes en jobb og at neste handling er å gå til
  // jobb. Selve arbeidsdag-mailene bygges/leveres først når spilleren går inn i
  // arbeidsfasen.
  function makeGoToWorkTransition(active, runtimeInstanceKey = "") {
    const roleTitle = norm(active?.title || active?.role_key || "rollen");
    const employerId = window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id);
    const employerLabel = employerId ? `hos ${employerId}` : "hos arbeidsgiveren din";
    const id = `${slugify(active?.role_key || active?.title || "rolle")}_go_to_work_${todayKey()}${runtimeInstanceKey}`;
    return {
      id,
      thread_key: `private.mail.${slugify(id)}`,
      source: "Civication",
      source_type: "daily_generated",
      mail_type: "day_transition",
      mail_family: "day_go_to_work",
      mail_class: PRIVATE_MAIL_CLASS,
      channel: "private",
      messageChannel: "private",
      workday_related: false,
      role_scope: "",
      phase_tag: "morning",
      subject: `Du har jobb som ${roleTitle}`,
      summary: `Neste handling: Gå til jobb / Start arbeidsdag ${employerLabel}.`,
      situation: [
        `Morgenen er din egen. Du spiser, gjør deg klar og ser på dagen som venter.`,
        `Du har jobb som ${roleTitle}. Arbeidsdagen skjer ${employerLabel}, ikke i innboksen hjemme.`,
        `Når du er klar, går du til jobb — da starter arbeidsdagen med dagens saker.`
      ],
      task_domain: "day_transition",
      narrative_arc: "morgen_til_jobb",
      go_to_work: true,
      choices: [
        {
          id: "go_to_work",
          label: `Gå til jobb / Start arbeidsdag ${employerLabel}`,
          effect: 1,
          tags: ["workday", "transition"],
          feedback: "Du går til jobb. Arbeidsdagen starter."
        }
      ],
      daily_mail_meta: {
        date: todayKey(),
        phase: "morning",
        phase_label: "Morgen",
        slot: "go_to_work",
        advances_role_plan: false
      }
    };
  }

  function toDailyExtraMail(active, sourceMail, phase, slot, index, runtimeInstanceKey = "") {
    const phaseId = norm(phase?.id || sourceMail?.phase || "morning");
    const slotId = slugify(slot?.slot || slot?.type || `slot_${index}`);
    const sourceId = norm(sourceMail?.id);
    const date = todayKey();
    const privateScope = isPrivatePhase(phaseId);

    return {
      ...sourceMail,
      id: `${sourceId}__daily_${date}_${phaseId}_${slotId}_${index}${runtimeInstanceKey}`,
      source_mail_id: sourceId,
      thread_key: norm(sourceMail?.thread_key) || threadKeyForMail(sourceMail),
      source_type: "daily_extra",
      mail_class: privateScope ? PRIVATE_MAIL_CLASS : WORK_MAIL_CLASS,
      channel: privateScope ? "private" : "job",
      messageChannel: privateScope ? "private" : "job",
      workday_related: privateScope ? false : true,
      phase_tag: phaseId,
      stage: norm(sourceMail?.stage || "stable") || "stable",
      role_scope: privateScope ? "" : resolveRoleScope(active),
      career_id: privateScope ? "" : norm(active?.career_id),
      role_id: privateScope ? "" : norm(active?.role_id),
      employer_id: privateScope ? "" : (window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id)),
      choices: normalizeChoices(sourceMail?.choices),
      daily_mail_meta: {
        date,
        phase: phaseId,
        phase_label: phaseLabel(phase),
        slot: norm(slot?.slot || slot?.type),
        source_mail_id: sourceId,
        source_mail_type: norm(sourceMail?.mail_type),
        source_mail_family: norm(sourceMail?.mail_family),
        advances_role_plan: false
      },
      mail_tags: uniqueStrings([
        ...(Array.isArray(sourceMail?.mail_tags) ? sourceMail.mail_tags : []),
        "daily_mail",
        "daily_extra",
        phaseId,
        norm(slot?.type),
        norm(slot?.slot)
      ])
    };
  }

  function toDailyPlannedMail(active, sourceMail, phase, slot) {
    const phaseId = norm(phase?.id || "morning");
    return {
      ...sourceMail,
      source_type: "planned",
      mail_class: "daily_workday",
      channel: "job",
      messageChannel: "job",
      workday_related: true,
      thread_key: norm(sourceMail?.thread_key) || threadKeyForMail(sourceMail),
      phase_tag: phaseId,
      daily_mail_meta: {
        date: todayKey(),
        phase: phaseId,
        phase_label: phaseLabel(phase),
        slot: norm(slot?.slot || slot?.type),
        source_mail_id: norm(sourceMail?.id),
        source_mail_type: norm(sourceMail?.mail_type),
        source_mail_family: norm(sourceMail?.mail_family),
        advances_role_plan: true
      },
      mail_tags: uniqueStrings([
        ...(Array.isArray(sourceMail?.mail_tags) ? sourceMail.mail_tags : []),
        "daily_mail",
        "daily_primary_planned",
        phaseId
      ])
    };
  }

  // PR C: hvilke phase-/day_end-slot som skal fylles av dayEvents-generatorene
  // (makeLunchEvent / makeEveningEvent / makeDayEndEvent) i stedet for den generiske
  // placeholder-teksten. Disse generatorene bærer også controller-Dag-1-tekstene (lunsj/kveld/
  // dagslutt) via sin egen isControllerDayOne-gren. Dagrytmen eies fortsatt av programmet.
  function phaseGeneratorKind(phase, slot) {
    const slotType = slugify(slot?.type || slot?.slot || "");
    const phaseId = norm(phase?.id);
    if (slotType === "day_end" || phaseId === "day_end") return "day_end";
    if (slotType === "phase") {
      if (phaseId === "lunch") return "lunch";
      if (phaseId === "evening") return "evening";
    }
    return null;
  }

  // Kjøres ved levering (enqueueNext), ikke ved bygging — slik at innholdet leser fersk
  // kontekst (besøkte steder, butikk-rotasjon, dagsoppsummering) og day_end ikke skriver en
  // tom oppsummering allerede om morgenen. Returnerer null hvis generatoren ikke er lastet.
  async function generatePhaseEvent(kind, active) {
    const k = norm(kind);
    if (k === "lunch" && typeof window.makeLunchEvent === "function") return await window.makeLunchEvent(active);
    if (k === "evening" && typeof window.makeEveningEvent === "function") return await window.makeEveningEvent(active);
    if (k === "day_end" && typeof window.makeDayEndEvent === "function") return window.makeDayEndEvent();
    return null;
  }

  // Pakker et dayEvents-generert event inn i daily-konvolutten slik at PR A/PR B fortsatt
  // kjenner det igjen som et daily-event (mail_class/daily_mail_meta), uten å endre teksten.
  function toDailyGeneratedPhaseMail(active, generated, phase, slot, index, runtimeInstanceKey = "") {
    const base = generated && typeof generated === "object" ? generated : {};
    const phaseId = norm(phase?.id || base.phase_tag || "morning");
    const slotId = slugify(slot?.slot || slot?.type || `slot_${index}`);
    const date = todayKey();
    const generatedPhaseId = norm(base.id) ? `${norm(base.id)}${runtimeInstanceKey}` : `${slugify(active?.role_key || active?.title || "rolle")}_${phaseId}_${slotId}_${date}_${index}${runtimeInstanceKey}`;
    return {
      ...base,
      id: generatedPhaseId,
      thread_key: norm(base.thread_key) || `${resolveRoleScope(active) || "role"}.mail.${slugify(generatedPhaseId)}`,
      source: norm(base.source) || "Civication",
      source_type: "daily_generated",
      mail_class: isPrivatePhase(phaseId) ? PRIVATE_MAIL_CLASS : WORK_MAIL_CLASS,
      channel: isPrivatePhase(phaseId) ? "private" : "job",
      messageChannel: isPrivatePhase(phaseId) ? "private" : "job",
      workday_related: isPrivatePhase(phaseId) ? false : true,
      phase_tag: phaseId,
      role_scope: isPrivatePhase(phaseId) ? "" : resolveRoleScope(active),
      career_id: isPrivatePhase(phaseId) ? "" : norm(active?.career_id),
      role_id: isPrivatePhase(phaseId) ? "" : norm(active?.role_id),
      employer_id: isPrivatePhase(phaseId) ? "" : (window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id)),
      stage: norm(base.stage || "stable") || "stable",
      // Behold generatorens valg verbatim (day_end leveres bevisst uten valg).
      choices: Array.isArray(base.choices) ? base.choices : [],
      daily_mail_meta: {
        date,
        phase: phaseId,
        phase_label: phaseLabel(phase),
        slot: norm(slot?.slot || slot?.type),
        source_generator: `day_events_${phaseId}`,
        advances_role_plan: false
      },
      mail_tags: uniqueStrings([
        ...(Array.isArray(base.mail_tags) ? base.mail_tags : []),
        "daily_mail",
        "daily_phase_generated",
        phaseId,
        norm(slot?.type),
        norm(slot?.slot)
      ])
    };
  }

  function pickFromPool(pool, wantedTypes, usedSourceIds, seed, phase, count, slot, progressionContext) {
    const wantedList = (Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]).map(norm).filter(Boolean);
    const wanted = new Set(wantedList);
    if (!wanted.size || [...wanted].some(t => t.startsWith("__generated"))) return [];
    const slotPool = filterPoolForDailySlot(pool, phase, slot, progressionContext);

    let candidates = slotPool.filter(mail => {
      const id = norm(mail?.id);
      if (!id || usedSourceIds.has(id)) return false;
      return wanted.has(norm(mail?.mail_type));
    });

    // Case-trådene er kollapset til én representant hver, så det finnes langt
    // færre micro/followup/knowledge/consequence-kandidater enn før. Når
    // slotens primærtype er en case-type og har kandidater, får den forrang —
    // ellers taper kveldens knowledge/consequence-slots hash-loddtrekningen
    // mot people/job og dagen mister case-innholdet sitt.
    const primaryType = wantedList[0];
    if (CASE_THREAD_TYPES.has(primaryType)) {
      const primaryCandidates = candidates.filter(mail => norm(mail?.mail_type) === primaryType);
      if (primaryCandidates.length) candidates = primaryCandidates;
    }

    if (!candidates.length && !isStrictSlot(slot)) {
      candidates = slotPool.filter(mail => {
        const id = norm(mail?.id);
        if (!id || usedSourceIds.has(id)) return false;
        return true;
      });
    }

    const rhythmContext = { ...progressionContext, phase: norm(phase?.id) };
    candidates.sort((a, b) => {
      const ap = norm(a?.phase) === norm(phase?.id) ? 500000 : 0;
      const bp = norm(b?.phase) === norm(phase?.id) ? 500000 : 0;
      const aRhythm = Number(evaluateWorkRhythm(a, rhythmContext).priority_score || 0) * 1000000;
      const bRhythm = Number(evaluateWorkRhythm(b, rhythmContext).priority_score || 0) * 1000000;
      return (bRhythm + bp + seededScore(seed, b)) - (aRhythm + ap + seededScore(seed, a));
    });

    const selected = candidates.slice(0, Math.max(0, Number(count || 1)));
    selected.forEach(mail => usedSourceIds.add(norm(mail?.id)));
    return selected;
  }

  async function getPlannedPrimary(active, state) {
    try {
      const list = await window.CivicationMailRuntime?.makeCandidateMailsForActiveRole?.(active, state);
      return Array.isArray(list) && list.length ? list[0] : null;
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationDailyMailBuilder] planned primary feilet", error);
      return null;
    }
  }

  function defaultProgram() {
    return {
      schema: "civication_mail_day_program_v1",
      day_structure: {
        phases: [
          { id: "morning", label: "Morgen", mail_slots: [
            { slot: "morning_brief", type: "story_or_context", count: 1 },
            { slot: "first_message", type: "people", count: 1 },
            { slot: "preparation", type: "micro_choice", count: 1 },
            { slot: "day_goal_choice", type: "micro_choice", count: 1 }
          ]},
          { id: "forenoon", label: "Formiddag", mail_slots: [
            { slot: "primary_work_mail", type: "job", count: 1 },
            { slot: "operational_mail", type: "job_micro", count: 1 },
            { slot: "people_ping", type: "people", count: 1 },
            { slot: "small_choice", type: "micro_choice", count: 1 }
          ]},
          { id: "workday", label: "Arbeidsdag", mail_slots: [
            { slot: "main_delivery", type: "job", count: 1 },
            { slot: "task_gate", type: "task_gate", count: 1 },
            { slot: "conflict_or_event", type: "conflict_or_event", count: 1 },
            { slot: "analysis_followup", type: "followup", count: 1 },
            { slot: "operational_batch", type: "job_micro", count: 1 }
          ]},
          { id: "lunch", label: "Lunsj", mail_slots: [
            { slot: "phase_lunch", type: "phase", count: 1 },
            { slot: "informal_people_mail", type: "people", count: 1 },
            { slot: "lunch_place_choice", type: "micro_choice", count: 1 },
            { slot: "recovery_or_social_choice", type: "micro_choice", count: 1 }
          ]},
          { id: "afternoon", label: "Ettermiddag", mail_slots: [
            { slot: "commute_or_transition", type: "phase", count: 1 },
            { slot: "family_or_practical", type: "people", count: 1 },
            { slot: "errand_or_training", type: "micro_choice", count: 1 },
            { slot: "friend_or_private_message", type: "people", count: 1 },
            { slot: "afternoon_choice", type: "micro_choice", count: 1 }
          ]},
          { id: "dinner", label: "Middag", mail_slots: [
            { slot: "dinner_choice", type: "micro_choice", count: 1 },
            { slot: "family_meal", type: "people", count: 1 },
            { slot: "cheap_meal", type: "micro_choice", count: 1 },
            { slot: "dinner_with_friend", type: "people", count: 1 }
          ]},
          { id: "evening", label: "Kveld", mail_slots: [
            { slot: "phase_evening", type: "phase", count: 1 },
            { slot: "learning_or_hobby", type: "knowledge", count: 1 },
            { slot: "rest_or_social", type: "micro_choice", count: 1 },
            { slot: "consequence_mail", type: "consequence", count: 1 },
            { slot: "plan_tomorrow", type: "micro_choice", count: 1 }
          ]},
          { id: "day_end", label: "Dagslutt / Natt", mail_slots: [
            { slot: "day_summary", type: "day_end", count: 1 },
            { slot: "score_summary", type: "day_end", count: 1 },
            { slot: "role_progress_summary", type: "day_end", count: 1 },
            { slot: "sleep_or_recovery", type: "day_end", count: 1 },
            { slot: "carryover", type: "day_end", count: 1 }
          ]}
        ]
      }
    };
  }


  function getNarrativeState(state) {
    const src = state?.[NARRATIVE_KEY] && typeof state[NARRATIVE_KEY] === "object" ? state[NARRATIVE_KEY] : {};
    return {
      active_streams: uniqueStrings(src.active_streams),
      stream_progress: src.stream_progress && typeof src.stream_progress === "object" ? src.stream_progress : {},
      flags: uniqueStrings(src.flags),
      choice_history: Array.isArray(src.choice_history) ? src.choice_history.slice(-120) : [],
      updated_at: src.updated_at || null
    };
  }

  function activeTags(active, state) {
    return uniqueStrings([
      ...(Array.isArray(active?.tags) ? active.tags : []),
      ...(Array.isArray(active?.interests) ? active.interests : []),
      ...(Array.isArray(state?.identity_tags) ? state.identity_tags : []),
      norm(active?.role_id),
      norm(active?.role_key),
      norm(active?.title)
    ]);
  }

  function streamMatches(stream, active, state, narrativeState) {
    const cond = stream?.applies_when && typeof stream.applies_when === "object" ? stream.applies_when : {};
    const roleScope = resolveRoleScope(active);
    const tags = activeTags(active, state);
    const flags = uniqueStrings([...(narrativeState.flags||[]), ...(Array.isArray(state?.mail_branch_state?.flags) ? state.mail_branch_state.flags : [])]);

    const roleOk = !Array.isArray(cond.role_scopes) || !cond.role_scopes.length || cond.role_scopes.map(slugify).includes(slugify(roleScope));
    const tagOk = !Array.isArray(cond.any_tags) || !cond.any_tags.length || cond.any_tags.some(t => tags.map(slugify).includes(slugify(t)));
    const flagOk = !Array.isArray(cond.requires_flags) || cond.requires_flags.every(f => flags.map(slugify).includes(slugify(f)));
    return roleOk && tagOk && flagOk;
  }


  function matchesRule(rule, narrativeState, active, state) {
    const cond = rule && typeof rule === "object" ? rule : null;
    if (!cond) return true;

    const flags = new Set(uniqueStrings([...(narrativeState?.flags || []), ...(Array.isArray(state?.mail_branch_state?.flags) ? state.mail_branch_state.flags : [])]).map(slugify));
    const activeStreams = new Set(uniqueStrings(narrativeState?.active_streams || []).map(slugify));
    const roleScope = slugify(resolveRoleScope(active));

    const flagsAny = uniqueStrings(cond.flags_any).map(slugify);
    if (flagsAny.length && !flagsAny.some(flag => flags.has(flag))) return false;

    const flagsAll = uniqueStrings(cond.flags_all).map(slugify);
    if (flagsAll.length && !flagsAll.every(flag => flags.has(flag))) return false;

    const streamsAny = uniqueStrings(cond.active_streams_any).map(slugify);
    if (streamsAny.length && !streamsAny.some(streamId => activeStreams.has(streamId))) return false;

    const roleScopes = uniqueStrings(cond.role_scopes).map(slugify);
    if (roleScopes.length && !roleScopes.includes(roleScope)) return false;

    return true;
  }

  function storyletMatchesContext(storylet, stream, active, state, narrativeState) {
    const appliesOk = matchesRule(storylet?.applies_when, narrativeState, active, state);
    if (!appliesOk) return false;
    const avoidHit = matchesRule(storylet?.avoid_when, narrativeState, active, state);
    return !storylet?.avoid_when || !avoidHit;
  }

  function storyletWeight(storylet, narrativeState, active, state) {
    return matchesRule(storylet?.weight_when, narrativeState, active, state) ? 1 : 0;
  }

  async function loadNarrativeStreams() {
    const manifest = await loadJson(NARRATIVE_MANIFEST_PATH);
    const entries = Array.isArray(manifest?.streams) ? manifest.streams : [];
    const loaded = await Promise.all(
      entries.map((entry) => (norm(entry?.path) ? loadJson(norm(entry.path)) : null))
    );
    const streams = loaded.filter((stream) => stream?.schema === "civication_narrative_stream_v1");
    return { manifest, streams };
  }

  function storyletsForSlot(streams, phaseId, usedStorylets, active, state, narrativeState) {
    const slotMap = { morning:["personal","work"], forenoon:["work","people"], workday:["work","conflict"], lunch:["people","class_case"], afternoon:["leisure","personal","people"], dinner:["leisure","personal","people"], evening:["leisure","conflict","personal"], day_end:["consequence","carryover"] };
    const allow = slotMap[phaseId] || [];
    const picks=[];
    for (const stream of streams) {
      const storylets = Array.isArray(stream?.storylets) ? stream.storylets : [];
      const next = storylets.find(st => {
        const sid = `${stream.id}::${norm(st.id)}`;
        if (!norm(st.id) || usedStorylets.has(sid)) return false;
        const ts = uniqueStrings(Array.isArray(st.time_slot) ? st.time_slot : [st.time_slot]);
        if (!ts.some(t => allow.includes(slugify(t)))) return false;
        return storyletMatchesContext(st, stream, active, state, narrativeState);
      });
      if (next) picks.push({ stream, storylet: next, weight: storyletWeight(next, narrativeState, active, state) });
    }
    picks.sort((a, b) => b.weight - a.weight);
    return picks;
  }

  function storyletToEvent(active, phase, slot, stream, storylet, ordinal) {
    const date=todayKey();
    const phaseId = norm(phase?.id || "morning");
    const privateScope = isPrivatePhase(phaseId);
    return {
      id: `${stream.id}__${norm(storylet.id)}__${date}__${ordinal}`,
      // Alle instanser av samme storylet (uansett dag/injeksjon) deler tråd.
      thread_key: `${(privateScope ? "private" : resolveRoleScope(active)) || "role"}.narrative.${slugify(stream.id)}.${slugify(storylet.id)}`,
      source: norm(storylet.from || stream.title || "Narrative stream"),
      from: norm(storylet.from),
      source_type: "narrative_stream",
      narrative_stream_id: norm(stream.id),
      narrative_stream_type: norm(stream.type),
      narrative_storylet_id: norm(storylet.id),
      mail_type: norm(storylet.message_type || "story"),
      mail_family: `narrative_${slugify(stream.type||"stream")}`,
      mail_class: privateScope ? PRIVATE_MAIL_CLASS : WORK_MAIL_CLASS,
      channel: privateScope ? "private" : "job",
      messageChannel: privateScope ? "private" : "job",
      workday_related: privateScope ? false : true,
      phase_tag: phaseId,
      role_scope: privateScope ? "" : resolveRoleScope(active),
      career_id: privateScope ? "" : norm(active?.career_id),
      role_id: privateScope ? "" : norm(active?.role_id),
      employer_id: privateScope ? "" : (window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id)),
      subject: norm(storylet.subject),
      situation: Array.isArray(storylet.situation) ? storylet.situation.map(norm).filter(Boolean) : [norm(storylet.situation)].filter(Boolean),
      choices: normalizeChoices(storylet.choices),
      narrative_effects: {
        opens_streams: uniqueStrings(storylet.opens_streams),
        adds_flags: uniqueStrings(storylet.adds_flags),
        risk_links: uniqueStrings(storylet.risk_links),
        links: normalizeLinks(storylet.links)
      },
      daily_mail_meta: {
        date,
        phase: norm(phase?.id),
        phase_label: phaseLabel(phase),
        slot: norm(slot?.slot || slot?.type),
        advances_role_plan: false
      }
    };
  }



  function getCachedNarrativeStreams() {
    const manifest = jsonCache.get(NARRATIVE_MANIFEST_PATH);
    const entries = Array.isArray(manifest?.streams) ? manifest.streams : [];
    const streams = [];
    for (const entry of entries) {
      const path = norm(entry?.path);
      if (!path) continue;
      const stream = jsonCache.get(path);
      if (stream?.schema === "civication_narrative_stream_v1") streams.push(stream);
    }
    return streams;
  }

  function phasePreferenceForStreamType(streamType) {
    const type = slugify(streamType);
    if (type === "conflict") return ["evening", "day_end"];
    if (type === "leisure") return ["evening"];
    if (type === "class_case" || type === "class_cases") return ["lunch", "afternoon"];
    if (type === "work") return ["forenoon", "workday"];
    return [];
  }

  async function getAvailableNarrativeStreams() {
    const cachedStreams = getCachedNarrativeStreams();
    if (cachedStreams.length) return cachedStreams;
    const loaded = await loadNarrativeStreams();
    return Array.isArray(loaded?.streams) ? loaded.streams : [];
  }

  async function findInjectableStoryletForOpenedStreams(runtime, openedStreamIds, active, state) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    const narrativeState = getNarrativeState(state);
    const sceneCatalog = /** @type {any} */ (window.CivicationSceneCatalog);
    if (typeof sceneCatalog?.getSourceScenes !== "function" || !sceneCatalog?.getSourceAdapter?.("narrative")) return null;

    const existingKeys = items
      .map(row => `${norm(row?.event?.narrative_stream_id)}::${norm(row?.event?.narrative_storylet_id)}`)
      .filter(key => key !== "::");
    const answeredKeys = Object.keys(narrativeState.stream_progress || {})
      .filter(key => narrativeState.stream_progress[key]?.answered)
      .map(key => `${norm(narrativeState.stream_progress[key]?.stream_id)}::${norm(narrativeState.stream_progress[key]?.storylet_id)}`);

    const scenes = await sceneCatalog.getSourceScenes("narrative", {
      mode: "opened_streams",
      opened_stream_ids: uniqueStrings(openedStreamIds),
      exclude_storylet_keys: uniqueStrings([...existingKeys, ...answeredKeys]),
      active,
      state,
      narrativeState,
      date: norm(runtime?.date) || todayKey(),
      ordinal: Date.now(),
      consumer: "daily_mail_builder_narrative_injection"
    });
    const event = Array.isArray(scenes) ? scenes[0] || null : null;
    if (!event) return null;
    return {
      event,
      preferredPhases: uniqueStrings(event?.narrative_source_meta?.preferred_phases || [])
    };
  }

  function insertNarrativeStoryletAfterCurrent(runtime, storyletEvent, preferredPhases) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    if (!items.length || !storyletEvent) return { runtime, inserted: false };

    const current = Math.max(0, Number(runtime?.current_index || 0));
    const defaultInsertIndex = Math.min(items.length, current + 1);
    const phasesWithInjectedNarrative = injectedNarrativePhases(items);

    const wanted = uniqueStrings(preferredPhases);
    let insertIndex = defaultInsertIndex;
    let fallbackUsed = false;

    if (wanted.length) {
      const preferredPlacement = findInsertIndexForPreferredPhase(items, current, wanted, phasesWithInjectedNarrative);
      if (preferredPlacement && Number.isInteger(preferredPlacement.insertIndex) && preferredPlacement.insertIndex >= 0) {
        insertIndex = preferredPlacement.insertIndex;
      } else {
        fallbackUsed = true;
        const fallbackIndex = findFallbackInsertIndex(items, defaultInsertIndex, phasesWithInjectedNarrative);
        if (Number.isInteger(fallbackIndex) && fallbackIndex >= 0) insertIndex = fallbackIndex;
      }
    } else {
      fallbackUsed = true;
      const fallbackIndex = findFallbackInsertIndex(items, defaultInsertIndex, phasesWithInjectedNarrative);
      if (Number.isInteger(fallbackIndex) && fallbackIndex >= 0) insertIndex = fallbackIndex;
    }

    const injectedAt = new Date().toISOString();
    const chosenPhase = norm(items[insertIndex]?.phase || items[insertIndex]?.event?.phase_tag || storyletEvent?.daily_mail_meta?.phase || storyletEvent?.phase_tag || "afternoon");
    const placedEvent = {
      ...storyletEvent,
      phase_tag: chosenPhase,
      daily_mail_meta: {
        ...(storyletEvent?.daily_mail_meta && typeof storyletEvent.daily_mail_meta === "object" ? storyletEvent.daily_mail_meta : {}),
        phase: chosenPhase,
        slot: norm(storyletEvent?.daily_mail_meta?.slot || "injected_narrative")
      },
      injected_by_choice: true,
      injected_at: injectedAt
    };
    const nextItems = items.slice();
    nextItems.splice(insertIndex, 0, {
      status: "queued",
      phase: chosenPhase,
      slot: "injected_narrative",
      injected_by_choice: true,
      injected_at: injectedAt,
      event: placedEvent
    });

    return {
      runtime: {
        ...runtime,
        items: nextItems,
        last_injection_debug: {
          stream_id: norm(storyletEvent?.narrative_stream_id),
          stream_type: norm(storyletEvent?.narrative_stream_type),
          preferred_phases: wanted,
          phases_with_injected: [...phasesWithInjectedNarrative],
          chosen_insert_index: insertIndex,
          chosen_phase: chosenPhase,
          fallback_used: fallbackUsed
        },
        updated_at: new Date().toISOString()
      },
      inserted: true
    };
  }

  function injectedNarrativePhases(items) {
    const rows = Array.isArray(items) ? items : [];
    return new Set(rows
      .filter(row => row?.injected_by_choice === true || row?.event?.injected_by_choice === true)
      .map(row => norm(row?.phase || row?.event?.phase_tag))
      .filter(Boolean));
  }

  function findInsertIndexForPreferredPhase(items, currentIndex, preferredPhases, phasesWithInjectedNarrative) {
    const rows = Array.isArray(items) ? items : [];
    const current = Math.max(0, Number(currentIndex || 0));
    const wanted = uniqueStrings(preferredPhases);
    const injectedPhases = phasesWithInjectedNarrative instanceof Set
      ? phasesWithInjectedNarrative
      : injectedNarrativePhases(rows);

    for (const phaseId of wanted) {
      if (injectedPhases.has(phaseId)) continue;
      for (let i = current + 1; i < rows.length; i += 1) {
        const phase = norm(rows[i]?.phase || rows[i]?.event?.phase_tag);
        if (phase === phaseId) {
          return { insertIndex: i, phase: phaseId };
        }
      }
    }

    return null;
  }

  function findFallbackInsertIndex(items, defaultInsertIndex, phasesWithInjectedNarrative) {
    const rows = Array.isArray(items) ? items : [];
    const start = Math.max(0, Math.min(rows.length, Number(defaultInsertIndex || 0)));
    const injectedPhases = phasesWithInjectedNarrative instanceof Set
      ? phasesWithInjectedNarrative
      : injectedNarrativePhases(rows);

    const fallbackPhase = norm(rows[start]?.phase || rows[start]?.event?.phase_tag);
    if (!fallbackPhase || !injectedPhases.has(fallbackPhase)) return start;

    for (let i = start + 1; i < rows.length; i += 1) {
      const phase = norm(rows[i]?.phase || rows[i]?.event?.phase_tag);
      if (phase && !injectedPhases.has(phase)) return i;
    }

    return start;
  }

  function phaseHasInjectedNarrative(items, phaseId) {
    const rows = Array.isArray(items) ? items : [];
    const targetPhase = norm(phaseId);
    if (!targetPhase) return false;
    return rows.some(row => {
      const phase = norm(row?.phase || row?.event?.phase_tag);
      if (phase !== targetPhase) return false;
      return row?.injected_by_choice === true || row?.event?.injected_by_choice === true;
    });
  }

  async function buildQueue(active, options = {}) {
    const state = getState();
    const date = norm(options.date || todayKey());
    const runtimeInstanceKey = options.forceNew === true
      ? `__run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      : "";
    const roleScope = resolveRoleScope(active);
    const program = await loadJson(DAY_PROGRAM_PATH) || defaultProgram();
    const plan = await loadJson(getPlanPath(active));
    const pool = await loadCatalogMails(active);
    const sceneCatalog = /** @type {any} */ (window.CivicationSceneCatalog);
    const narrativeSourceAdapter = sceneCatalog?.getSourceAdapter?.("narrative") || null;
    const narrativeState = getNarrativeState(state);
    const narrativeActivation = typeof narrativeSourceAdapter?.getActivationSnapshot === "function"
      ? await narrativeSourceAdapter.getActivationSnapshot({ active, state, narrativeState })
      : { matched_stream_ids: [], candidate_stream_ids: [] };
    const matchedNarrativeStreamIds = uniqueStrings(narrativeActivation?.matched_stream_ids || []);
    const candidateNarrativeStreamIds = uniqueStrings(narrativeActivation?.candidate_stream_ids || []);
    const nextNarrativeState = {
      ...narrativeState,
      active_streams: uniqueStrings([...(narrativeState.active_streams || []), ...matchedNarrativeStreamIds]),
      updated_at: new Date().toISOString()
    };
    setState({ [NARRATIVE_KEY]: nextNarrativeState });
    const plannedPrimary = await getPlannedPrimary(active, state);
    const usedSourceIds = consumedSet(state);
    // Dagens planmail eier sin tråd: er den en case-variant, skal ingen annen
    // variant av samme case kunne plukkes fra katalogen samme dag.
    const plannedThreadKey = plannedPrimary ? threadKeyForMail(plannedPrimary) : "";
    const excludedThreadKeys = new Set(isCaseThreadKey(plannedThreadKey) ? [plannedThreadKey] : []);
    const dayPool = collapsePoolToCanonicalThreads(pool, excludedThreadKeys, usedSourceIds);
    const progressionContext = getDailyProgressionContext(active, state, plannedPrimary, null, plan);
    const items = [];
    const phases = Array.isArray(program?.day_structure?.phases)
      ? program.day_structure.phases
      : defaultProgram().day_structure.phases;

    let plannedUsed = false;
    let ordinal = 0;
    const queuedNarrativeStorylets = new Set();
    const answeredNarrativeStorylets = new Set(
      Object.keys(nextNarrativeState.stream_progress || {})
        .filter(k => nextNarrativeState.stream_progress[k]?.answered)
        .map(k => `${nextNarrativeState.stream_progress[k].stream_id}::${nextNarrativeState.stream_progress[k].storylet_id}`)
    );

    // Har spilleren en aktiv jobb? Da skal morgenen lede til «Gå til jobb», og
    // jobbinnhold skal kun fylle arbeidsfasene — ikke de private døgnfasene.
    const hasActiveJob = window.CivicationWorkdayRuntime?.hasActiveJob?.(active)
      ?? !!norm(active?.career_id);
    let goToWorkInjected = false;

    // 4G-A: private fasemaler er en registrert kildeadapter. Daily kjenner ikke
    // produsentmodulen direkte; SceneCatalog er den eneste adaptergrensen.
    // Uten registrert adapter beholdes den eksisterende innebygde placeholder-
    // fallbacken, men standard DAY_SCRIPTS registrerer `private` før Daily lastes.
    const usePrivateSourceAdapter =
      typeof sceneCatalog?.getSourceScenes === "function" &&
      !!sceneCatalog?.getSourceAdapter?.("private");

    for (const phase of phases) {
      const phaseId = norm(phase?.id || "morning");
      const privatePhase = isPrivatePhase(phaseId);
      const slots = Array.isArray(phase?.mail_slots) ? phase.mail_slots : [];

      // Morgenens første melding er overgangen til arbeidsdag (ikke en case-mail).
      if (phaseId === "morning" && hasActiveJob && !goToWorkInjected) {
        goToWorkInjected = true;
        ordinal += 1;
        items.push({
          status: "queued",
          phase: "morning",
          slot: "go_to_work",
          event: makeGoToWorkTransition(active, runtimeInstanceKey)
        });
      }

      // Hent privat scene gjennom SceneCatalogs registrerte `private`-adapter.
      // Morgenen med aktiv jobb eies av «Gå til jobb»-overgangen alene.
      // day_end beholder sin egen dagslutt-/oppsummeringsgenerator (allerede
      // privat) fordi den driver dagsoppsummerings-UI-et.
      if (privatePhase && usePrivateSourceAdapter && phaseId !== "day_end") {
        const skipMorningContent = phaseId === "morning" && hasActiveJob;
        if (!skipMorningContent) {
          const privateScenes = await sceneCatalog.getSourceScenes("private", {
            phaseId,
            active,
            date,
            runtimeInstanceKey,
            consumer: "daily_mail_builder_private_phase"
          });
          const privateEvent = Array.isArray(privateScenes) ? privateScenes[0] : null;
          if (privateEvent) {
            ordinal += 1;
            items.push({
              status: "queued",
              phase: phaseId,
              slot: norm(privateEvent?.daily_mail_meta?.slot) || `private_${phaseId}`,
              optional: phaseId === "day_end",
              event: privateEvent
            });
          }
        }
        continue;
      }

      for (const slot of slots) {
        const count = Math.max(1, Number(slot?.count || 1));
        const wanted = preferredTypesForSlot(slot);
        const slotType = slugify(slot?.type || slot?.slot || "");

        for (let i = 0; i < count; i += 1) {
          ordinal += 1;
          const seed = `${date}:${roleScope}:${phase?.id}:${slot?.slot}:${i}:${ordinal}`;

          // Planlagt rollemail (jobbprogresjon) hører KUN til arbeidsfasene.
          if (!privatePhase && !plannedUsed && (slotType === "job" || slotType === "primary_work_mail") && plannedPrimary) {
            plannedUsed = true;
            usedSourceIds.add(norm(plannedPrimary.id));
            items.push({
              status: "queued",
              phase: phaseId,
              slot: norm(slot?.slot || slot?.type),
              event: toDailyPlannedMail(active, plannedPrimary, phase, slot)
            });
            continue;
          }

          const narrativeUsed = new Set([...answeredNarrativeStorylets, ...queuedNarrativeStorylets]);
          const narrativeScenes = typeof sceneCatalog?.getSourceScenes === "function" && narrativeSourceAdapter
            ? await sceneCatalog.getSourceScenes("narrative", {
              mode: "slot",
              phaseId,
              phase,
              slot,
              active,
              state,
              narrativeState: nextNarrativeState,
              candidate_stream_ids: candidateNarrativeStreamIds,
              used_storylet_keys: [...narrativeUsed],
              exclude_work_streams: privatePhase,
              date,
              ordinal,
              consumer: "daily_mail_builder_narrative_slot"
            })
            : [];
          const narrativeEvent = Array.isArray(narrativeScenes) ? narrativeScenes[0] || null : null;
          if (narrativeEvent) {
            const storyletKey = `${norm(narrativeEvent.narrative_stream_id)}::${norm(narrativeEvent.narrative_storylet_id)}`;
            queuedNarrativeStorylets.add(storyletKey);
            items.push({ status: "queued", phase: phaseId, slot: norm(slot?.slot || slot?.type), event: narrativeEvent });
            continue;
          }

          // Rollekatalogen (dayPool) ER jobbverdenen til den aktive rollen. Den
          // fyller kun arbeidsfasene. Private faser får personlige narrativer og
          // genererte fase-mailer, aldri jobbkatalogen.
          const picked = privatePhase
            ? null
            : pickFromPool(dayPool, wanted, usedSourceIds, seed, phase, 1, slot, progressionContext)[0];
          if (picked) {
            items.push({
              status: "queued",
              phase: phaseId,
              slot: norm(slot?.slot || slot?.type),
              event: toDailyExtraMail(active, picked, phase, slot, ordinal, runtimeInstanceKey)
            });
            continue;
          }

          const generatorKind = phaseGeneratorKind(phase, slot);
          items.push({
            status: "queued",
            phase: phaseId,
            slot: norm(slot?.slot || slot?.type),
            // PR C: fase-/dagslutt-slot regenereres fra dayEvents ved levering. makeGeneratedEvent
            // beholdes som placeholder/fallback dersom dayEvents ikke er tilgjengelig.
            ...(generatorKind ? { phase_generator: generatorKind } : {}),
            event: makeGeneratedEvent(active, phase, slot, ordinal, runtimeInstanceKey)
          });
        }
      }
    }

    return {
      version: 1,
      date,
      role_scope: roleScope,
      role_id: norm(active?.role_id),
      career_id: norm(active?.career_id),
      role_title: norm(active?.title),
      plan_id: norm(plan?.id),
      target_minutes: Number(program?.reading_model?.target_total_minutes_per_day || 60),
      generated_at: new Date().toISOString(),
      delivered_ids: [],
      answered_ids: [],
      current_index: 0,
      runtime_instance_key: runtimeInstanceKey,
      items
    };
  }

  function getRuntime() {
    const state = getState();
    const rt = state?.[DAY_RUNTIME_KEY];
    return rt && typeof rt === "object" ? rt : null;
  }

  // Read-only: er det bygd en dag (mail_day_runtime_v1 med items) for aktiv rolle i dag?
  // Brukes av dayPatches.onAppOpen (PR B) for å avgjøre at programmet eier dagrytmen, slik at
  // den eldre fase-generatoren ikke lager en parallell fase-event.
  function hasBuiltDayForActiveRole(options = {}) {
    const active = options.active || getActive();
    if (!active) return false;
    const rt = getRuntime();
    if (!rt || !Array.isArray(rt.items) || !rt.items.length) return false;
    const date = norm(options.date || todayKey());
    return norm(rt.date) === date && norm(rt.role_scope) === resolveRoleScope(active);
  }

  // Migrering/opprydding for eksisterende saves: en gjenbrukt dagskø kan være
  // bygd før tråd-dedupe fantes og inneholde flere aktive rader med samme
  // threadKey. Behold den første (eldste i køen); senere aktive duplikater
  // undertrykkes. Rader som allerede er besvart beholdes som historikk, men
  // ubesvarte duplikater av en allerede besvart tråd undertrykkes også.
  function sweepDuplicateThreadRows(runtime) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    if (!items.length) return { runtime, changed: false };

    const keyOfRow = row => norm(row?.event?.thread_key) || threadKeyForMail(row?.event || {});
    const answeredKeys = new Set();
    for (const row of items) {
      if (norm(row?.status) !== "answered" || row?.suppressed_duplicate === true) continue;
      const key = keyOfRow(row);
      if (key) answeredKeys.add(key);
    }

    let changed = false;
    const seenActive = new Set();
    const nextItems = items.map(row => {
      if (norm(row?.status) === "answered") return row;
      const key = keyOfRow(row);
      if (!key) return row;
      if (!answeredKeys.has(key) && !seenActive.has(key)) {
        seenActive.add(key);
        return row;
      }
      changed = true;
      console.warn("[Civication mail dedupe] duplicate threadKey suppressed", key, norm(row?.event?.id));
      try { window.CivicationMailEngine?.suppressDuplicateMail?.(norm(row?.event?.id), key); } catch {}
      return { ...row, status: "answered", suppressed_duplicate: true, suppressed_at: new Date().toISOString() };
    });

    if (!changed) return { runtime, changed: false };
    return { runtime: { ...runtime, items: nextItems, updated_at: new Date().toISOString() }, changed: true };
  }

  async function ensureRuntime(active, options = {}) {
    const roleScope = resolveRoleScope(active);
    const date = norm(options.date || todayKey());
    const existing = getRuntime();

    const reusable = existing &&
      existing.date === date &&
      existing.role_scope === roleScope &&
      Array.isArray(existing.items) &&
      existing.items.length &&
      options.forceNew !== true;

    if (reusable) {
      const swept = sweepDuplicateThreadRows(existing);
      if (swept.changed) {
        setRuntime(swept.runtime);
        return swept.runtime;
      }
      return existing;
    }

    const next = await buildQueue(active, { date, forceNew: options.forceNew === true });
    setState({ [DAY_RUNTIME_KEY]: next });
    return next;
  }

  function setRuntime(runtime) {
    setState({ [DAY_RUNTIME_KEY]: runtime });
    return runtime;
  }

  function findNextIndex(runtime) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    const start = Math.max(0, Number(runtime?.current_index || 0));
    for (let i = start; i < items.length; i += 1) {
      if (items[i]?.status !== "answered") return i;
    }
    for (let i = 0; i < items.length; i += 1) {
      if (items[i]?.status !== "answered") return i;
    }
    return -1;
  }



  function getOpenTaskGateBlock(runtime) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    for (const row of items) {
      const event = row?.event || null;
      if (!event || norm(event.mail_type) !== "task_gate") continue;
      if (norm(row?.status) !== "delivered" && norm(row?.status) !== "answered") continue;

      const task = window.CivicationTaskEngine?.getTaskByMailId?.(event.id) || null;
      if (task && norm(task.status) !== "completed") {
        return {
          blocked_by_open_task: true,
          task,
          task_id: norm(task.id),
          mail_id: norm(event.id)
        };
      }
    }

    const openTasks = window.CivicationTaskEngine?.listOpenTasks?.() || [];
    for (const task of (Array.isArray(openTasks) ? openTasks : [])) {
      const mailId = norm(task?.mail_id);
      if (!mailId) continue;
      const row = items.find(x => norm(x?.event?.id) === mailId);
      if (!row || norm(row?.event?.mail_type) !== "task_gate") continue;
      if (norm(row?.status) !== "delivered" && norm(row?.status) !== "answered") continue;
      return {
        blocked_by_open_task: true,
        task,
        task_id: norm(task.id),
        mail_id: mailId
      };
    }

    return null;
  }

  function applyTaskGateBlock(runtime, block) {
    if (!runtime) return runtime;
    const base = { ...runtime };
    if (block?.blocked_by_open_task) {
      return {
        ...base,
        blocked_by_open_task: true,
        blocked_task_id: norm(block.task_id),
        blocked_mail_id: norm(block.mail_id),
        blocked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    if (!base.blocked_by_open_task && !base.blocked_task_id && !base.blocked_mail_id) return base;
    return {
      ...base,
      blocked_by_open_task: false,
      blocked_task_id: null,
      blocked_mail_id: null,
      blocked_at: null,
      updated_at: new Date().toISOString()
    };
  }

  function enqueueEvent(engine, event) {
    if (!event) return false;

    if (engine?.enqueueEvent) {
      engine.enqueueEvent(event);
      return true;
    }

    if (window.CivicationMailEngine?.sendMail) {
      window.CivicationMailEngine.sendMail(event);
      return true;
    }

    const inbox = getInbox(engine);
    const next = [{ status: "pending", enqueued_at: new Date().toISOString(), event }].concat(inbox);
    engine?.setInbox?.(next);
    return true;
  }

  function inboxHasEventId(engine, eventId) {
    const id = norm(eventId);
    if (!id) return false;
    const inbox = getInbox(engine);
    return inbox.some(item => norm(item?.event?.id || item?.id) === id);
  }

  function deliverRuntimeItemToInbox(runtimeRow, engine) {
    const row = runtimeRow && typeof runtimeRow === "object" ? runtimeRow : null;
    const event = row?.event && typeof row.event === "object" ? row.event : null;
    if (!event) return { ok: false, reason: "missing_event" };

    const eventId = norm(event.id);
    if (!eventId) return { ok: false, reason: "missing_event_id" };
    if (inboxHasEventId(engine, eventId)) return { ok: false, reason: "duplicate_id" };

    const deliveredEvent = {
      ...event,
      id: eventId,
      thread_key: norm(event.thread_key) || threadKeyForMail(event),
      status: norm(row?.status || event.status || "delivered"),
      phase: norm(row?.phase || event.phase || event.phase_tag),
      slot: norm(row?.slot || event.slot),
      source_type: norm(event.source_type),
      mail_type: norm(event.mail_type || event.type),
      mail_family: norm(event.mail_family),
      narrative_stream_id: norm(event.narrative_stream_id),
      narrative_storylet_id: norm(event.narrative_storylet_id),
      choices: Array.isArray(event.choices) ? event.choices : []
    };

    if (window.CivicationMailEngine?.sendMail) {
      const sent = window.CivicationMailEngine.sendMail({
        id: eventId,
        status: "pending",
        enqueued_at: new Date().toISOString(),
        event: deliveredEvent
      });
      if (sent?.ok) return { ok: true, via: "mail_engine" };
      if (sent?.reason === "duplicate_key") return { ok: false, reason: "duplicate_key" };
      // Tråd-vakten i mail-motoren har avvist et case-duplikat; ikke omgå den
      // via enqueue-fallbacken.
      if (sent?.reason === "duplicate_thread") return { ok: false, reason: "duplicate_thread" };
    }

    const enqueued = enqueueEvent(engine, deliveredEvent);
    return { ok: !!enqueued, via: "engine_enqueue_fallback" };
  }

  function rowsForPhase(runtime, phase) {
    const wanted = norm(phase || window.CivicationCalendar?.getPhase?.() || "morning");
    const privatePhase = isPrivatePhase(wanted);
    return (Array.isArray(runtime?.items) ? runtime.items : []).filter(row => {
      if (norm(row?.phase || row?.event?.phase_tag) !== wanted) return false;
      // Sikkerhetsnett: en privat fase viser aldri jobbinnhold, selv om et
      // gammelt save eller en ekstern generator skulle ha lagt det der.
      if (privatePhase && isWorkContentEvent(row?.event)) return false;
      return true;
    });
  }

  // Er alle påkrevde arbeidsfase-rader (forenoon+workday) besvart? Da er
  // arbeidsdagen fullført, og arbeidsdag-telleren skal økes én gang.
  function workPhaseRequiredComplete(runtime) {
    const items = Array.isArray(runtime?.items) ? runtime.items : [];
    const workRows = items.filter(row =>
      WORK_PHASES.has(norm(row?.phase || row?.event?.phase_tag)) && row?.optional !== true);
    if (!workRows.length) return false;
    return workRows.every(row => norm(row?.status) === "answered" || row?.suppressed_duplicate === true);
  }

  // Øk arbeidsdag-telleren når (og bare når) arbeidsdagen faktisk fullføres.
  // Idempotent: WorkdayRuntime hopper over hvis dagen allerede er registrert.
  function maybeCompleteWorkday(runtime) {
    const wr = window.CivicationWorkdayRuntime;
    if (!wr?.completeWorkday) return;
    try {
      const date = norm(runtime?.date) || todayKey();
      if (wr.isWorkdayCompletedToday?.(date) === true) return;
      if (!workPhaseRequiredComplete(runtime)) return;
      wr.completeWorkday({ date });
    } catch {}
  }

  function rowSummary(row) {
    const event = row?.event || {};
    const choices = Array.isArray(event?.choices) ? event.choices : [];
    return { id: norm(event?.id || row?.id), subject: norm(event?.subject || row?.subject), mail_type: norm(event?.mail_type || event?.type || row?.mail_type), type: norm(event?.type), slot: norm(row?.slot || event?.daily_mail_meta?.slot), status: norm(row?.status || "queued"), phase: norm(row?.phase || event?.phase_tag), required: row?.optional !== true, optional: row?.optional === true, hasChoices: choices.length > 0, choiceCount: choices.length, choices: choices.map(choice => ({ id: norm(choice?.id), label: norm(choice?.label || choice?.text || choice?.id) })).filter(choice => choice.id), body: norm(event?.body), text: norm(event?.text), situation: Array.isArray(event?.situation) ? event.situation.map(norm).filter(Boolean) : norm(event?.situation), description: norm(event?.description), snippet: norm(event?.snippet), prompt: norm(event?.prompt), summary: norm(event?.summary), task_id: norm(event?.task_id || row?.task_id) };
  }

  function getPhaseBundle(phase) {
    const runtime = getRuntime();
    const phaseId = norm(phase || window.CivicationCalendar?.getPhase?.() || "morning");
    const rows = rowsForPhase(runtime, phaseId);
    const queued = rows.filter(row => norm(row?.status).toLowerCase() === "queued");
    const pending = rows.filter(row => ["delivered", "pending", "open"].includes(norm(row?.status).toLowerCase()));
    const answered = rows.filter(row => norm(row?.status).toLowerCase() === "answered" || row?.resolved === true);
    const required = rows.filter(row => row?.optional !== true);
    const completedRequired = required.filter(row => answered.includes(row));
    const phases = window.CivicationCalendar?.DAY_PHASES || ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];
    const nextPhase = phases[phases.indexOf(phaseId) + 1] || null;
    return { phase: phaseId, phaseLabel: phaseLabel({ id: phaseId }), items: rows.map(rowSummary), pendingItems: pending.map(rowSummary), queuedItems: queued.map(rowSummary), answeredItems: answered.map(rowSummary), requiredCount: required.length, completedCount: completedRequired.length, isComplete: queued.length === 0 && pending.length === 0 && completedRequired.length >= required.length, nextPhase };
  }

  async function enqueuePhaseBundle(engine, options = {}) {
    const active = options.active || getActive();
    if (!active) return { enqueued: false, reason: "no_active_role" };
    const runtime = await ensureRuntime(active, options);
    const phase = norm(options.phase || window.CivicationCalendar?.getPhase?.() || "morning");
    const limit = Math.max(1, Math.min(5, Number(options.limit || 5)));
    const queuedIndexes = (Array.isArray(runtime?.items) ? runtime.items : [])
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => norm(row?.phase || row?.event?.phase_tag) === phase && norm(row?.status).toLowerCase() === "queued")
      .slice(0, limit);
    if (!queuedIndexes.length) return { enqueued: false, reason: "no_queued_items_in_phase", runtime, phase };

    const delivered = [];
    const now = new Date().toISOString();
    const nextItems = runtime.items.map((row, index) => {
      if (!queuedIndexes.some(q => q.index === index)) return row;
      let event = row?.event || null;
      if (event) delivered.push(event);
      return { ...row, status: "delivered", delivered_at: now };
    });
    const deliveredIds = delivered.map(event => norm(event?.id)).filter(Boolean);
    const nextRuntime = {
      ...runtime,
      current_index: queuedIndexes[0].index,
      delivered_ids: uniqueStrings([...(Array.isArray(runtime.delivered_ids) ? runtime.delivered_ids : []), ...deliveredIds]),
      items: nextItems,
      updated_at: now
    };
    setRuntime(nextRuntime);
    for (const { index } of queuedIndexes) {
      deliverRuntimeItemToInbox(nextRuntime.items[index], engine);
    }
    try { window.CivicationCalendar?.setPhase?.(phase); } catch {}
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return { enqueued: true, count: delivered.length, events: delivered, runtime: nextRuntime, phase };
  }

  async function enqueueNext(engine, options = {}) {
    const active = options.active || getActive();
    if (!active) return { enqueued: false, reason: "no_active_role" };
    if (!options.ignorePending && hasPending(engine)) return { enqueued: false, reason: "pending_exists" };

    const runtime = await ensureRuntime(active, options);

    const block = getOpenTaskGateBlock(runtime);
    const runtimeWithBlock = applyTaskGateBlock(runtime, block);
    if (runtimeWithBlock !== runtime) setRuntime(runtimeWithBlock);

    if (block?.blocked_by_open_task) {
      return {
        enqueued: false,
        reason: "blocked_by_open_task",
        task: block.task || null,
        task_id: block.task_id,
        mail_id: block.mail_id,
        runtime: runtimeWithBlock
      };
    }

    const idx = findNextIndex(runtimeWithBlock);
    if (idx < 0) return { enqueued: false, reason: "day_complete", runtime };

    const item = runtimeWithBlock.items[idx];
    let event = item?.event;
    if (!event) return { enqueued: false, reason: "missing_event", runtime };

    // PR C: fase-/dagslutt-slot fylles av dayEvents-generatorene ved levering. Innholdet (inkl.
    // controller-Dag-1 lunsj/kveld/dagslutt) blir dermed ferskt og kontekstuelt, mens dagrytmen
    // fortsatt eies av programmet. makeGeneratedEvent-placeholderet brukes hvis dayEvents mangler.
    if (item?.phase_generator) {
      try {
        const generated = await generatePhaseEvent(item.phase_generator, active);
        if (generated && typeof generated === "object") {
          event = toDailyGeneratedPhaseMail(active, generated, { id: item.phase }, { slot: item.slot }, idx, norm(runtimeWithBlock?.runtime_instance_key));
        }
      } catch (error) {
        if (window.DEBUG) console.warn("[CivicationDailyMailBuilder] fase-generator feilet", item.phase_generator, error);
      }
    }

    // Leveringsraden må bære det (eventuelt regenererte) eventet, slik at inbox, runtime og
    // markAnswered refererer til samme event.id.
    const deliveredRow = event === item?.event ? item : { ...item, event };

    const phase = norm(item.phase || event.phase_tag || "morning");
    try { window.CivicationCalendar?.setPhase?.(phase); } catch {}

    const nextItems = runtime.items.map((row, i) => {
      if (i !== idx) return row;
      return {
        ...row,
        event,
        status: "delivered",
        delivered_at: new Date().toISOString()
      };
    });

    const nextRuntime = {
      ...runtimeWithBlock,
      current_index: idx,
      delivered_ids: uniqueStrings([...(Array.isArray(runtimeWithBlock.delivered_ids) ? runtimeWithBlock.delivered_ids : []), norm(event.id)]),
      items: nextItems,
      blocked_by_open_task: false,
      blocked_task_id: null,
      blocked_mail_id: null,
      blocked_at: null,
      updated_at: new Date().toISOString()
    };

    setRuntime(nextRuntime);
    deliverRuntimeItemToInbox(deliveredRow, engine);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}

    return { enqueued: true, event, index: idx, runtime: nextRuntime };
  }

  async function markHandled(eventId, choiceId = "handled") {
    const next = await markAnswered(eventId, choiceId);
    try { window.CivicationMailEngine?.markResolved?.(eventId, eventId, choiceId); } catch {}
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return next;
  }

  async function markAnswered(eventId, choiceId, opts = {}) {
    const id = norm(eventId);
    if (!id) return null;
    const runtime = getRuntime();
    if (!runtime || !Array.isArray(runtime.items)) return null;

    let foundIndex = -1;
    const items = runtime.items.map((row, index) => {
      const rowId = norm(row?.event?.id);
      if (rowId !== id) return row;
      foundIndex = index;
      return {
        ...row,
        status: "answered",
        answered_at: new Date().toISOString(),
        choice_id: norm(choiceId)
      };
    });

    if (foundIndex < 0) return runtime;

    // Når en tråd besvares skal eventuelle andre aktive instanser av samme
    // threadKey ut av dagskøen, slik at samme case ikke dukker opp igjen i en
    // senere fase. Besvarte rader røres ikke (historikk bevares).
    const answeredEvent = runtime.items?.[foundIndex]?.event || {};
    const answeredThreadKey = norm(answeredEvent.thread_key) || threadKeyForMail(answeredEvent);
    if (answeredThreadKey) {
      for (let i = 0; i < items.length; i += 1) {
        if (i === foundIndex) continue;
        const row = items[i];
        if (norm(row?.status) === "answered") continue;
        const key = norm(row?.event?.thread_key) || threadKeyForMail(row?.event || {});
        if (key !== answeredThreadKey) continue;
        console.warn("[Civication mail dedupe] duplicate threadKey suppressed", key, norm(row?.event?.id));
        try { window.CivicationMailEngine?.suppressDuplicateMail?.(norm(row?.event?.id), key); } catch {}
        items[i] = { ...row, status: "answered", suppressed_duplicate: true, suppressed_at: new Date().toISOString() };
      }
    }

    let updatedNarrative = null;
    if (norm(runtime.items?.[foundIndex]?.event?.source_type) === "narrative_stream") {
      const rowEvent = runtime.items?.[foundIndex]?.event || {};
      const state = getState();
      const ns = getNarrativeState(state);
      const progressKey = `${norm(rowEvent.narrative_stream_id)}::${norm(rowEvent.narrative_storylet_id)}`;
      const chosen = (Array.isArray(rowEvent.choices) ? rowEvent.choices : []).find(c => norm(c.id) === norm(choiceId)) || {};
      const choiceFlags = uniqueStrings([...(Array.isArray(chosen.tags) ? chosen.tags : []), ...(rowEvent?.narrative_effects?.adds_flags || [])]);
      updatedNarrative = {
        ...ns,
        active_streams: uniqueStrings([...(ns.active_streams||[]), ...(rowEvent?.narrative_effects?.opens_streams || [])]),
        flags: uniqueStrings([...(ns.flags||[]), ...choiceFlags, ...(rowEvent?.narrative_effects?.risk_links || [])]),
        stream_progress: {
          ...(ns.stream_progress || {}),
          [progressKey]: {
            stream_id: norm(rowEvent.narrative_stream_id),
            storylet_id: norm(rowEvent.narrative_storylet_id),
            answered: true,
            choice_id: norm(choiceId),
            updated_at: new Date().toISOString()
          }
        },
        choice_history: [
          ...(Array.isArray(ns.choice_history) ? ns.choice_history : []),
          {
            at: new Date().toISOString(),
            stream_id: norm(rowEvent.narrative_stream_id),
            storylet_id: norm(rowEvent.narrative_storylet_id),
            choice_id: norm(choiceId),
            tags: choiceFlags
          }
        ].slice(-120),
        updated_at: new Date().toISOString()
      };
      setState({ [NARRATIVE_KEY]: updatedNarrative });

      const openedStreamIds = uniqueStrings(rowEvent?.narrative_effects?.opens_streams || []);
      if (openedStreamIds.length) {
        const injectable = await findInjectableStoryletForOpenedStreams(runtime, openedStreamIds, getActive(), getState());
        if (injectable?.event) {
          const injectedEvent = {
            ...injectable.event,
            injected_by_choice: true,
            injected_at: new Date().toISOString(),
            daily_mail_meta: {
              ...(injectable.event?.daily_mail_meta || {}),
              slot: "injected_narrative"
            }
          };
          const injected = insertNarrativeStoryletAfterCurrent({ ...runtime, items }, injectedEvent, injectable.preferredPhases);
          if (injected.inserted) {
            items.splice(0, items.length, ...injected.runtime.items);
          }
        }
      }

      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    }

    const next = {
      ...runtime,
      current_index: foundIndex + 1,
      answered_ids: uniqueStrings([...(Array.isArray(runtime.answered_ids) ? runtime.answered_ids : []), id]),
      items,
      updated_at: new Date().toISOString()
    };
    setRuntime(next);
    // Morgenens overgang: å besvare «Gå til jobb» starter arbeidsdagen og flytter
    // livsrytmen inn i arbeidsfasen (DayFlow eier selve overgangen).
    if (answeredEvent?.go_to_work === true) {
      try { window.CivicationDayFlow?.goToWork?.({ active: getActive() }); } catch {}
    }
    // Arbeidsdag-telleren økes først når arbeidsdagen er fullført — aldri bare
    // fordi en ny døgnfase starter. Dette holder arbeidsrytmen og døgnrytmen adskilt.
    maybeCompleteWorkday(next);
    // Innbokskopien må også løses, ellers blir saken stående som åpen innboks-sak
    // og blokkerer faseavansering (dayProgressionController teller åpne innbokssaker).
    if (opts?.resolveMail !== false) {
      try { window.CivicationMailEngine?.markResolved?.(id, id, norm(choiceId)); } catch {}
    }
    return next;
  }

  function isDailyEvent(eventObj) {
    return norm(eventObj?.mail_class) === "daily_workday" ||
      norm(eventObj?.source_type).startsWith("daily_") ||
      !!eventObj?.daily_mail_meta;
  }

  async function dailyMailAnswerMiddleware(ctx, next) {
    const engine = ctx?.engine || null;
    const eventObj = ctx?.eventObj || null;
    const eventId = norm(eventObj?.id || ctx?.eventId);
    const choiceId = norm(ctx?.choiceId);
    const daily = isDailyEvent(eventObj);

    // Mark the daily runtime before the remaining inner answer pipeline runs so
    // dayPatches/onAppOpen can advance to the next runtime item, but keep the
    // inbox item pending until EventEngine has consumed it. Resolving the mail
    // here caused the inner answer chain to return not_found and forced
    // NextActionUI into its slow deliverQueuedAction fallback.
    if (daily) await markAnswered(eventId, choiceId, { resolveMail: false });

    let result;
    const typedEngine = /** @type {{ __civiSuppressImmediateFollowup?: boolean }} */ (engine || {});
    const previousSuppress = typedEngine.__civiSuppressImmediateFollowup;
    if (daily && engine) typedEngine.__civiSuppressImmediateFollowup = true;
    try {
      result = await next();
    } finally {
      if (daily && engine) typedEngine.__civiSuppressImmediateFollowup = previousSuppress === true;
    }

    if (daily && result?.ok !== false) {
      try { window.CivicationMailEngine?.markResolved?.(eventId, eventId, choiceId); } catch {}
      result = { ...(result || {}), dailyRuntimeAnswered: true };
    }

    if (daily && result?.ok === false) {
      // Restore as delivered if the answer did not go through.
      const runtime = getRuntime();
      if (runtime && Array.isArray(runtime.items)) {
        const items = runtime.items.map(row => {
          if (norm(row?.event?.id) !== eventId) return row;
          return { ...row, status: "delivered", choice_id: null, answered_at: null };
        });
        setRuntime({
          ...runtime,
          answered_ids: (Array.isArray(runtime.answered_ids) ? runtime.answered_ids : []).filter(x => norm(x) !== eventId),
          items
        });
      }
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        dailyMailAnswerMiddleware,
        ANSWER_MIDDLEWARE_PRIORITY
      );
    }

    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationChoiceAnswerMiddlewareQueue?: Array<{ name: string, fn: Function, priority: number }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY])
      ? runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY]
      : (runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY] = []);
    if (!queue.some(entry => entry?.name === ANSWER_MIDDLEWARE_NAME)) {
      queue.push({
        name: ANSWER_MIDDLEWARE_NAME,
        fn: dailyMailAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || typeof proto.onAppOpen !== "function") {
      registerAnswerMiddleware();
      return false;
    }
    if (proto[PATCHED_FLAG]) {
      registerAnswerMiddleware();
      return false;
    }

    const previousOnAppOpen = proto.onAppOpen;
    proto[PATCHED_FLAG] = true;

    proto.onAppOpen = async function dailyMailOnAppOpen(opts = {}) {
      const active = getActive();
      const skipDaily = opts && opts.skipDailyMailBuilder === true;

      if (active && !skipDaily && !hasPending(this)) {
        const result = await enqueueNext(this, { active, forceNew: opts.forceNewDailyMail === true });
        if (result?.enqueued || result?.reason === "day_complete") return result;
      }

      return previousOnAppOpen.call(this, opts);
    };

    registerAnswerMiddleware();
    return true;
  }

  async function startToday(options = {}) {
    const engine = options.engine || window.HG_CiviEngine || null;
    const active = options.active || getActive();
    if (!active) return { ok: false, reason: "no_active_role" };
    const runtime = await ensureRuntime(active, { forceNew: options.forceNew === true });
    if (options.enqueue === false) return { ok: true, runtime };
    const enq = await enqueueNext(engine, { active, ignorePending: options.ignorePending === true });
    return { ok: enq?.enqueued !== false, runtime: getRuntime() || runtime, enqueue: enq };
  }

  function inspect() {
    const rt = getRuntime();
    const items = Array.isArray(rt?.items) ? rt.items : [];
    const counts = items.reduce((acc, row) => {
      const phase = norm(row?.phase || row?.event?.phase_tag || "unknown");
      const status = norm(row?.status || "queued");
      acc.byPhase[phase] = Number(acc.byPhase[phase] || 0) + 1;
      acc.byStatus[status] = Number(acc.byStatus[status] || 0) + 1;
      return acc;
    }, { byPhase: {}, byStatus: {} });

    return {
      active: getActive(),
      blocked_by_open_task: !!rt?.blocked_by_open_task,
      blocked_task_id: rt?.blocked_task_id || null,
      blocked_mail_id: rt?.blocked_mail_id || null,
      open_tasks_count: (window.CivicationTaskEngine?.listOpenTasks?.() || []).length,
      runtime: rt,
      item_count: items.length,
      next_index: rt ? findNextIndex(rt) : -1,
      by_phase: counts.byPhase,
      by_status: counts.byStatus,
      pending: getInbox(window.HG_CiviEngine).find(item => item?.status === "pending")?.event || null,
      patched: window.CivicationEventEngine?.prototype?.[PATCHED_FLAG] === true,
      answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,
      cache_size: jsonCache.size,
      narrative_state_v1: getNarrativeState(getState()),
      narrative_active_streams: getNarrativeState(getState()).active_streams,
      narrative_flags: getNarrativeState(getState()).flags,
      narrative_streams_loaded: jsonCache.has(NARRATIVE_MANIFEST_PATH) && Array.isArray(jsonCache.get(NARRATIVE_MANIFEST_PATH)?.streams) ? jsonCache.get(NARRATIVE_MANIFEST_PATH).streams.length : null
    };
  }


  function inspectNarratives() {
    const state = getState();
    const narrativeState = getNarrativeState(state);
    const runtime = getRuntime();
    const items = Array.isArray(runtime?.items) ? runtime.items : [];

    const narrativeItems = items.filter(row => norm(row?.event?.source_type) === "narrative_stream");
    const injectedItems = items.filter(row => row?.injected_by_choice === true || row?.event?.injected_by_choice === true);

    const byStream = narrativeItems.reduce((acc, row) => {
      const streamId = norm(row?.event?.narrative_stream_id || "unknown");
      acc[streamId] = Number(acc[streamId] || 0) + 1;
      return acc;
    }, {});

    const byPhase = narrativeItems.reduce((acc, row) => {
      const phaseId = norm(row?.phase || row?.event?.phase_tag || "unknown");
      acc[phaseId] = Number(acc[phaseId] || 0) + 1;
      return acc;
    }, {});

    const currentIndex = Math.max(0, Number(runtime?.current_index || 0));
    let nextPendingNarrativeItem = null;
    for (let i = currentIndex; i < items.length; i += 1) {
      const row = items[i];
      if (norm(row?.status) === "answered") continue;
      if (norm(row?.event?.source_type) !== "narrative_stream") continue;
      nextPendingNarrativeItem = row;
      break;
    }

    const cachedStreams = getCachedNarrativeStreams();
    const storylets = cachedStreams.flatMap(stream => Array.isArray(stream?.storylets) ? stream.storylets : []);

    return {
      narrative_state_v1: narrativeState,
      active_streams: narrativeState.active_streams,
      flags: narrativeState.flags,
      stream_progress: narrativeState.stream_progress,
      choice_history: narrativeState.choice_history,
      runtime_exists: !!runtime,
      current_index: runtime ? currentIndex : null,
      item_count: items.length,
      narrative_items: narrativeItems,
      injected_items: injectedItems,
      by_stream: byStream,
      by_phase: byPhase,
      last_injection_debug: runtime?.last_injection_debug || null,
      next_pending_narrative_item: nextPendingNarrativeItem,
      storylet_rule_summary: {
        storylets_with_applies_when: storylets.filter(st => st?.applies_when && typeof st.applies_when === "object").length,
        storylets_with_avoid_when: storylets.filter(st => st?.avoid_when && typeof st.avoid_when === "object").length,
        storylets_with_weight_when: storylets.filter(st => st?.weight_when && typeof st.weight_when === "object").length
      }
    };
  }

  function resetNarrativeStateForTest() {
    setState({ [NARRATIVE_KEY]: null, [DAY_RUNTIME_KEY]: null });
    return true;
  }

  function resetToday() {
    setState({ [DAY_RUNTIME_KEY]: null });
    return true;
  }

  function boot() {
    return patchEventEngine();
  }

  // Forhåndslast dagsprogram, rolleplan og narrativ-strømmer, slik at
  // svar/fase-avansering aldri venter på nettverket.
  async function prewarm(activeOverride) {
    const active = activeOverride || getActive();
    const familyPaths = active ? getFamilyPaths(active) : [];
    await Promise.all([
      loadJson(DAY_PROGRAM_PATH),
      loadNarrativeStreams(),
      active ? loadJson(getPlanPath(active)) : Promise.resolve(null),
      ...familyPaths.map((path) => loadJson(path))
    ]);
    return { warmed: true };
  }

  window.CivicationDailyMailBuilder = {
    DAY_RUNTIME_KEY,
    boot,
    prewarm,
    inspect,
    inspectNarratives,
    resetNarrativeStateForTest,
    resetToday,
    startToday,
    buildQueue,
    enqueueNext,
    enqueuePhaseBundle,
    getCurrentPhaseBundle: () => getPhaseBundle(),
    getCurrentPhaseItems: () => getPhaseBundle().items,
    getOpenItemsForPhase: (phase) => getPhaseBundle(phase).pendingItems,
    getQueuedItemsForPhase: (phase) => getPhaseBundle(phase).queuedItems,
    getDeliveredItemsForPhase: (phase) => getPhaseBundle(phase).pendingItems,
    getAnsweredItemsForPhase: (phase) => getPhaseBundle(phase).answeredItems,
    getPhaseCompletion: (phase) => { const b = getPhaseBundle(phase); return { requiredCount: b.requiredCount, completedCount: b.completedCount, isComplete: b.isComplete }; },
    getDaySummary: () => window.CivicationDayProgression?.getDayEndSummary?.() || null,
    markAnswered,
    answerBundleItem: markAnswered,
    registerAnswerMiddleware,
    markHandled,
    threadKeyForMail,
    isPrivatePhase,
    isWorkContentEvent,
    workPhaseRequiredComplete,
    makeGoToWorkTransition,
    isDailyEvent,
    isActionablePendingInboxItem,
    hasBlockingPendingAction: hasPending,
    hasBuiltDayForActiveRole,
    loadJson,
    getFamilyPaths
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
