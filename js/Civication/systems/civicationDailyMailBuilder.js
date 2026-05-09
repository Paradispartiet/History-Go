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

  function hasPending(engine) {
    return getInbox(engine).some(item => item && item.status === "pending" && item.event);
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || "");
  }

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (jsonCache.has(p)) return jsonCache.get(p);

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

    if (normalized.length >= 2) return normalized;

    return [
      {
        id: "A",
        label: "Gjør dette ryddig og dokumenter det",
        effect: 1,
        tags: ["process", "integrity"],
        feedback: "Du velger kontroll, sporbarhet og tydelighet."
      },
      {
        id: "B",
        label: "Løs det raskt og gå videre",
        effect: 0,
        tags: ["tempo", "risk"],
        feedback: "Du får fart på saken, men må tåle at noe blir mindre grundig."
      }
    ];
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
    return catalogs.flatMap(flattenCatalog);
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
    if (type === "job_micro" || type === "micro" || slotId.includes("operational")) return ["micro", "job"];
    if (type === "people" || type === "people_or_status" || slotId.includes("people")) return ["people", "micro"];
    if (type === "phase") return ["__generated_phase"];
    if (type === "conflict_or_event") return ["conflict", "event"];
    if (type === "followup") return ["followup", "people", "job"];
    if (type === "knowledge") return ["knowledge", "story", "job"];
    if (type === "consequence") return ["consequence", "followup", "people"];
    if (type === "micro_choice") return ["micro", "people"];
    if (type === "day_end") return ["__generated_day_end"];

    return [type || "job"];
  }

  function phaseLabel(phase) {
    const id = norm(phase?.id);
    return norm(phase?.label) || ({
      morning: "Morgen",
      lunch: "Lunsj",
      afternoon: "Ettermiddag",
      evening: "Kveld",
      day_end: "Dagslutt"
    })[id] || id || "Arbeidsdag";
  }

  function makeGeneratedEvent(active, phase, slot, index) {
    const phaseId = norm(phase?.id || "morning");
    const roleTitle = norm(active?.title || "rollen");
    const slotId = slugify(slot?.slot || slot?.type || `slot_${index}`);
    const type = slugify(slot?.type || slot?.slot || "phase");
    const isDayEnd = type === "day_end" || phaseId === "day_end";
    const isLunch = phaseId === "lunch";
    const isEvening = phaseId === "evening";

    const subject = isDayEnd
      ? "Dagslutt: hva ble faktisk gjort?"
      : isLunch
        ? "Lunsj: en liten avklaring midt i dagen"
        : isEvening
          ? "Kveld: det som følger med hjem"
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

    return {
      id: `${slugify(active?.role_key || active?.title || "rolle")}_${phaseId}_${slotId}_${todayKey()}_${index}`,
      source: "Civication",
      source_type: "daily_generated",
      mail_type: isDayEnd ? "day_end" : "phase",
      mail_family: isDayEnd ? "daily_day_end" : "daily_phase",
      mail_class: "daily_workday",
      role_scope: resolveRoleScope(active),
      career_id: norm(active?.career_id),
      role_id: norm(active?.role_id),
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

  function toDailyExtraMail(active, sourceMail, phase, slot, index) {
    const phaseId = norm(phase?.id || sourceMail?.phase || "morning");
    const slotId = slugify(slot?.slot || slot?.type || `slot_${index}`);
    const sourceId = norm(sourceMail?.id);
    const date = todayKey();

    return {
      ...sourceMail,
      id: `${sourceId}__daily_${date}_${phaseId}_${slotId}_${index}`,
      source_mail_id: sourceId,
      source_type: "daily_extra",
      mail_class: "daily_workday",
      phase_tag: phaseId,
      stage: norm(sourceMail?.stage || "stable") || "stable",
      role_scope: resolveRoleScope(active),
      career_id: norm(active?.career_id),
      role_id: norm(active?.role_id),
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

  function pickFromPool(pool, wantedTypes, usedSourceIds, seed, phase, count) {
    const wanted = new Set((Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]).map(norm).filter(Boolean));
    if (!wanted.size || [...wanted].some(t => t.startsWith("__generated"))) return [];

    let candidates = pool.filter(mail => {
      const id = norm(mail?.id);
      if (!id || usedSourceIds.has(id)) return false;
      return wanted.has(norm(mail?.mail_type));
    });

    if (!candidates.length) {
      candidates = pool.filter(mail => {
        const id = norm(mail?.id);
        if (!id || usedSourceIds.has(id)) return false;
        return true;
      });
    }

    candidates.sort((a, b) => {
      const ap = norm(a?.phase) === norm(phase?.id) ? 500000 : 0;
      const bp = norm(b?.phase) === norm(phase?.id) ? 500000 : 0;
      return (bp + seededScore(seed, b)) - (ap + seededScore(seed, a));
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
            { slot: "primary_work_mail", type: "job", count: 1 },
            { slot: "operational_mail", type: "job_micro", count: 2 },
            { slot: "people_ping", type: "people", count: 1 }
          ]},
          { id: "lunch", label: "Lunsj", mail_slots: [
            { slot: "phase_lunch", type: "phase", count: 1 },
            { slot: "informal_people_mail", type: "people", count: 1 },
            { slot: "small_choice", type: "micro_choice", count: 1 }
          ]},
          { id: "afternoon", label: "Ettermiddag", mail_slots: [
            { slot: "conflict_or_event", type: "conflict_or_event", count: 1 },
            { slot: "analysis_followup", type: "followup", count: 2 },
            { slot: "operational_batch", type: "job_micro", count: 3 },
            { slot: "knowledge_mail", type: "knowledge", count: 1 }
          ]},
          { id: "evening", label: "Kveld", mail_slots: [
            { slot: "phase_evening", type: "phase", count: 1 },
            { slot: "consequence_mail", type: "consequence", count: 1 },
            { slot: "relationship_or_status", type: "people_or_status", count: 1 }
          ]},
          { id: "day_end", label: "Dagslutt", mail_slots: [
            { slot: "day_summary", type: "day_end", count: 1 }
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
    const streams = [];
    const entries = Array.isArray(manifest?.streams) ? manifest.streams : [];
    for (const entry of entries) {
      const path = norm(entry?.path);
      if (!path) continue;
      const stream = await loadJson(path);
      if (stream?.schema === "civication_narrative_stream_v1") streams.push(stream);
    }
    return { manifest, streams };
  }

  function storyletsForSlot(streams, phaseId, usedStorylets, active, state, narrativeState) {
    const slotMap = { morning:["work","personal"], lunch:["people","class_case"], afternoon:["work","conflict"], evening:["leisure","conflict","personal"], day_end:["consequence","carryover"] };
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
    return {
      id: `${stream.id}__${norm(storylet.id)}__${date}__${ordinal}`,
      source: norm(storylet.from || stream.title || "Narrative stream"),
      from: norm(storylet.from),
      source_type: "narrative_stream",
      narrative_stream_id: norm(stream.id),
      narrative_stream_type: norm(stream.type),
      narrative_storylet_id: norm(storylet.id),
      mail_type: norm(storylet.message_type || "story"),
      mail_family: `narrative_${slugify(stream.type||"stream")}`,
      mail_class: "daily_workday",
      phase_tag: norm(phase?.id || "morning"),
      role_scope: resolveRoleScope(active),
      career_id: norm(active?.career_id),
      role_id: norm(active?.role_id),
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
    if (type === "work") return ["afternoon"];
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
    const streams = await getAvailableNarrativeStreams();
    if (!streams.length) return null;

    const existingKeys = new Set(items
      .map(row => `${norm(row?.event?.narrative_stream_id)}::${norm(row?.event?.narrative_storylet_id)}`)
      .filter(k => k !== "::"));

    const answeredKeys = new Set(
      Object.keys(narrativeState.stream_progress || {})
        .filter(k => narrativeState.stream_progress[k]?.answered)
        .map(k => `${norm(narrativeState.stream_progress[k]?.stream_id)}::${norm(narrativeState.stream_progress[k]?.storylet_id)}`)
    );

    for (const streamId of uniqueStrings(openedStreamIds)) {
      const stream = streams.find(s => norm(s?.id) === streamId);
      if (!stream) continue;
      // applies_when styrer automatisk aktivering.
      // opens_streams er en eksplisitt narrativ overgang og skal kunne injiseres samme dag.

      const storylets = Array.isArray(stream?.storylets) ? stream.storylets : [];
      const storylet = storylets
        .filter(st => {
          const key = `${norm(stream.id)}::${norm(st?.id)}`;
          return norm(st?.id) && !existingKeys.has(key) && !answeredKeys.has(key)
            && storyletMatchesContext(st, stream, active, state, narrativeState);
        })
        .sort((a, b) => storyletWeight(b, narrativeState, active, state) - storyletWeight(a, narrativeState, active, state))[0];
      if (!storylet) continue;

      return {
        stream,
        storylet,
        preferredPhases: phasePreferenceForStreamType(stream?.type)
      };
    }

    return null;
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

    const chosenPhase = norm(items[insertIndex]?.phase || items[insertIndex]?.event?.phase_tag || storyletEvent?.daily_mail_meta?.phase || storyletEvent?.phase_tag || "afternoon");
    const nextItems = items.slice();
    nextItems.splice(insertIndex, 0, {
      status: "queued",
      phase: chosenPhase,
      slot: norm(storyletEvent?.daily_mail_meta?.slot || "injected_narrative"),
      injected_by_choice: true,
      injected_at: new Date().toISOString(),
      event: storyletEvent
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
    const roleScope = resolveRoleScope(active);
    const program = await loadJson(DAY_PROGRAM_PATH) || defaultProgram();
    const plan = await loadJson(getPlanPath(active));
    const pool = await loadCatalogMails(active);
    const { streams } = await loadNarrativeStreams();
    const narrativeState = getNarrativeState(state);
    const matchedStreams = streams.filter(stream => streamMatches(stream, active, state, narrativeState));
    const activeStreamIds = uniqueStrings(narrativeState.active_streams || []);
    const candidateStreams = streams.filter(stream => {
      const id = norm(stream?.id);
      return !!id && (activeStreamIds.includes(id) || matchedStreams.some(ms => norm(ms?.id) === id));
    });
    const nextNarrativeState = { ...narrativeState, active_streams: uniqueStrings([...(narrativeState.active_streams||[]), ...matchedStreams.map(s => norm(s.id))]), updated_at: new Date().toISOString() };
    setState({ [NARRATIVE_KEY]: nextNarrativeState });
    const plannedPrimary = await getPlannedPrimary(active, state);
    const usedSourceIds = consumedSet(state);
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

    for (const phase of phases) {
      const slots = Array.isArray(phase?.mail_slots) ? phase.mail_slots : [];
      for (const slot of slots) {
        const count = Math.max(1, Number(slot?.count || 1));
        const wanted = preferredTypesForSlot(slot);
        const slotType = slugify(slot?.type || slot?.slot || "");

        for (let i = 0; i < count; i += 1) {
          ordinal += 1;
          const seed = `${date}:${roleScope}:${phase?.id}:${slot?.slot}:${i}:${ordinal}`;

          if (!plannedUsed && (slotType === "job" || slotType === "primary_work_mail") && plannedPrimary) {
            plannedUsed = true;
            usedSourceIds.add(norm(plannedPrimary.id));
            items.push({
              status: "queued",
              phase: norm(phase?.id || "morning"),
              slot: norm(slot?.slot || slot?.type),
              event: toDailyPlannedMail(active, plannedPrimary, phase, slot)
            });
            continue;
          }

          const narrativeUsed = new Set([...answeredNarrativeStorylets, ...queuedNarrativeStorylets]);
          const narrativeCandidates = storyletsForSlot(candidateStreams, norm(phase?.id), narrativeUsed, active, state, nextNarrativeState);
          const narrativePick = narrativeCandidates[0];
          if (narrativePick) {
            const event = storyletToEvent(active, phase, slot, narrativePick.stream, narrativePick.storylet, ordinal);
            const storyletKey = `${norm(narrativePick.stream.id)}::${norm(narrativePick.storylet.id)}`;
            queuedNarrativeStorylets.add(storyletKey);
            items.push({ status: "queued", phase: norm(phase?.id || "morning"), slot: norm(slot?.slot || slot?.type), event });
            continue;
          }

          const picked = pickFromPool(pool, wanted, usedSourceIds, seed, phase, 1)[0];
          if (picked) {
            items.push({
              status: "queued",
              phase: norm(phase?.id || "morning"),
              slot: norm(slot?.slot || slot?.type),
              event: toDailyExtraMail(active, picked, phase, slot, ordinal)
            });
            continue;
          }

          items.push({
            status: "queued",
            phase: norm(phase?.id || "morning"),
            slot: norm(slot?.slot || slot?.type),
            event: makeGeneratedEvent(active, phase, slot, ordinal)
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
      items
    };
  }

  function getRuntime() {
    const state = getState();
    const rt = state?.[DAY_RUNTIME_KEY];
    return rt && typeof rt === "object" ? rt : null;
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

    if (reusable) return existing;

    const next = await buildQueue(active, { date });
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
    const event = item?.event;
    if (!event) return { enqueued: false, reason: "missing_event", runtime };

    const phase = norm(item.phase || event.phase_tag || "morning");
    try { window.CivicationCalendar?.setPhase?.(phase); } catch {}

    const nextItems = runtime.items.map((row, i) => {
      if (i !== idx) return row;
      return {
        ...row,
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
    enqueueEvent(engine, event);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}

    return { enqueued: true, event, index: idx, runtime: nextRuntime };
  }

  async function markAnswered(eventId, choiceId) {
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
        if (injectable) {
          const fallbackPhase = injectable.preferredPhases[0] || "afternoon";
          const injectedEvent = storyletToEvent(getActive(), { id: fallbackPhase, label: fallbackPhase }, { slot: "injected_narrative" }, injectable.stream, injectable.storylet, Date.now());
          injectedEvent.injected_by_choice = true;
          injectedEvent.injected_at = new Date().toISOString();
          injectedEvent.daily_mail_meta = {
            ...(injectedEvent.daily_mail_meta || {}),
            slot: "injected_narrative"
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
    return next;
  }

  function isDailyEvent(eventObj) {
    return norm(eventObj?.mail_class) === "daily_workday" ||
      norm(eventObj?.source_type).startsWith("daily_") ||
      !!eventObj?.daily_mail_meta;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto[PATCHED_FLAG]) return false;
    if (typeof proto.onAppOpen !== "function" || typeof proto.answer !== "function") return false;

    const previousOnAppOpen = proto.onAppOpen;
    const previousAnswer = proto.answer;
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

    proto.answer = async function dailyMailAnswer(eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const daily = isDailyEvent(eventObj);

      // Mark before previousAnswer, because dayPatches calls onAppOpen inside its answer wrapper.
      // Without this, onAppOpen would see the same daily item as still active and re-enqueue it.
      if (daily) await markAnswered(eventObj?.id || eventId, choiceId);

      const result = await previousAnswer.call(this, eventId, choiceId);

      if (daily && result?.ok === false) {
        // Restore as delivered if the answer did not go through.
        const runtime = getRuntime();
        if (runtime && Array.isArray(runtime.items)) {
          const items = runtime.items.map(row => {
            if (norm(row?.event?.id) !== norm(eventObj?.id || eventId)) return row;
            return { ...row, status: "delivered", choice_id: null, answered_at: null };
          });
          setRuntime({
            ...runtime,
            answered_ids: (Array.isArray(runtime.answered_ids) ? runtime.answered_ids : []).filter(x => norm(x) !== norm(eventObj?.id || eventId)),
            items
          });
        }
      }

      return result;
    };

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

  window.CivicationDailyMailBuilder = {
    DAY_RUNTIME_KEY,
    boot,
    inspect,
    inspectNarratives,
    resetNarrativeStateForTest,
    resetToday,
    startToday,
    buildQueue,
    enqueueNext,
    markAnswered,
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
