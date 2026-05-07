// js/Civication/systems/civicationDailyTaskGates.js
// Legger arbeidsleveranser inn i DailyMailBuilder-dagen.
// Målet er at en spilldag ikke bare blir 19 raske mailsvar, men får faste punkter
// der spilleren må ta stilling til en konkret leveranse/oppgave.

(function () {
  "use strict";

  const DAY_RUNTIME_KEY = "mail_day_runtime_v1";
  const GATE_VERSION = 1;
  const PATCHED_FLAG = "__civicationDailyTaskGatesPatched";

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

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getRuntime() {
    const rt = getState()?.[DAY_RUNTIME_KEY];
    return rt && typeof rt === "object" ? rt : null;
  }

  function setRuntime(rt) {
    setState({ [DAY_RUNTIME_KEY]: rt || null });
    return rt;
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || "rolle");
  }

  function roleTitle(active) {
    return norm(active?.title) || "rollen";
  }

  function makeTaskGate(active, gate) {
    const role = roleTitle(active);
    const roleScope = resolveRoleScope(active);
    const date = todayKey();
    const gateId = norm(gate.id);

    const copy = {
      morning_delivery: {
        subject: "Morgenleveranse: hva må faktisk prioriteres?",
        situation: [
          `Du har kommet i gang med arbeidsdagen som ${role}, men flere småsaker konkurrerer om samme tid.`,
          "Nå må du gjøre en konkret prioritering: hva må løses først, hva kan vente, og hva må dokumenteres før dagen løper videre?",
          "Dette er ikke en stor strategisak. Det er den typen praktisk avklaring som avgjør om resten av dagen blir styrt eller bare reaktiv."
        ],
        task_domain: "morning_prioritization",
        competency: "prioritering",
        pressure: "morgentrykk",
        choice_axis: "prioritering_vs_reaktivitet",
        consequence_axis: "styring_vs_etterslep",
        narrative_arc: "morgenleveranse",
        work_minutes: 25,
        choices: [
          {
            id: "A",
            label: "Lag en kort prioriteringsliste og dokumenter hva som venter",
            effect: 1,
            tags: ["process", "prioritering", "trust"],
            feedback: "Du gjør dagen mer styrbar før den rekker å bli løsrevet."
          },
          {
            id: "B",
            label: "Ta sakene fortløpende og hold tempoet oppe",
            effect: 0,
            tags: ["tempo", "risk"],
            feedback: "Du får fart, men lar rekkefølgen styres av det som roper høyest."
          }
        ]
      },
      main_delivery: {
        subject: "Hovedleveranse: saken må gjøres om til et faktisk beslutningsgrunnlag",
        situation: [
          `Midt på dagen er ${role}-rollen ikke lenger bare avklaringer og småsvar. Nå må du produsere noe som andre kan styre etter.`,
          "Du må samle informasjonen, vurdere risikoen og gi en anbefaling som er tydelig nok til å brukes, men ærlig nok til å tåle motstand.",
          "Dette er dagens reelle arbeidspunkt: ikke bare å svare, men å forme en sak slik at den kan bli en beslutning."
        ],
        task_domain: "main_work_delivery",
        competency: "beslutningsgrunnlag",
        pressure: "leveransepress",
        choice_axis: "tydelighet_vs_fullstendighet",
        consequence_axis: "beslutningskraft_vs_risiko",
        narrative_arc: "hovedleveranse",
        work_minutes: 45,
        choices: [
          {
            id: "A",
            label: "Lag et tydelig beslutningsgrunnlag med risiko og anbefaling",
            effect: 1,
            tags: ["craft", "process", "integrity"],
            feedback: "Du gjør saken brukbar uten å skjule usikkerheten. Det er kjernen i profesjonelt arbeid."
          },
          {
            id: "B",
            label: "Lag en rask anbefaling og rydd i detaljene senere",
            effect: 0,
            tags: ["tempo", "visibility", "risk"],
            feedback: "Du gir systemet fart, men bygger inn et etterslep i begrunnelsen."
          }
        ]
      },
      analysis_delivery: {
        subject: "Ettermiddagsanalyse: hva betyr valgene dine nå?",
        situation: [
          "Ettermiddagen samler opp konsekvensene fra de små valgene tidligere i dagen.",
          "Noen saker er løst, men flere av dem har etterlatt spor: en kommentar, en uavklart risiko, en person som venter på svar, en rapportlinje som kan leses på to måter.",
          "Nå må du analysere hva dagen faktisk har produsert: fremdrift, friksjon, tillit eller skjult etterslep."
        ],
        task_domain: "afternoon_analysis",
        competency: "analyse",
        pressure: "etterspill",
        choice_axis: "lare_vs_glatte_over",
        consequence_axis: "innsikt_vs_gjentakelse",
        narrative_arc: "ettermiddagsanalyse",
        work_minutes: 35,
        choices: [
          {
            id: "A",
            label: "Skriv en kort analyse av hva som må følges opp i morgen",
            effect: 1,
            tags: ["learning", "process", "carryover"],
            feedback: "Du gjør dagen om til læring før den bare blir historie."
          },
          {
            id: "B",
            label: "Lukk det meste og bare ta med de største sakene videre",
            effect: 0,
            tags: ["closure", "risk"],
            feedback: "Du beskytter kvelden, men kan miste noen av signalene som lå i detaljene."
          }
        ]
      }
    };

    const profile = copy[gateId] || copy.main_delivery;

    return {
      id: `${roleScope}_${gateId}_${date}`,
      source: "Civication",
      source_type: "daily_task_gate",
      mail_type: "task_gate",
      mail_family: "daily_task_gate",
      mail_class: "daily_workday",
      role_scope: roleScope,
      role_id: norm(active?.role_id),
      career_id: norm(active?.career_id),
      stage: "stable",
      phase_tag: norm(gate.phase || "afternoon"),
      subject: profile.subject,
      summary: profile.situation[0],
      situation: profile.situation,
      task_required: true,
      requires_task_completion: true,
      task_gate_id: gateId,
      task_gate_label: norm(gate.label),
      task_kind: "work_case",
      work_minutes: profile.work_minutes,
      duration_minutes: profile.work_minutes,
      task_domain: profile.task_domain,
      competency: profile.competency,
      pressure: profile.pressure,
      choice_axis: profile.choice_axis,
      consequence_axis: profile.consequence_axis,
      narrative_arc: profile.narrative_arc,
      task_payload: {
        gate_id: gateId,
        gate_label: norm(gate.label),
        expected_output: norm(gate.expected_output),
        realistic_work_minutes: profile.work_minutes
      },
      choices: profile.choices,
      mail_tags: [
        "daily_mail",
        "task_gate",
        gateId,
        norm(gate.phase || "afternoon")
      ].filter(Boolean),
      daily_mail_meta: {
        date,
        phase: norm(gate.phase || "afternoon"),
        phase_label: norm(gate.phase_label),
        slot: "task_gate",
        source_mail_type: "task_gate",
        source_mail_family: "daily_task_gate",
        advances_role_plan: false,
        requires_task: true
      }
    };
  }

  function defaultGates() {
    return [
      {
        id: "morning_delivery",
        label: "Morgenleveranse",
        afterAnsweredCount: 4,
        phase: "morning",
        phase_label: "Morgen",
        expected_output: "Kort prioriteringsliste og dokumentert avklaring"
      },
      {
        id: "main_delivery",
        label: "Hovedleveranse",
        afterAnsweredCount: 10,
        phase: "afternoon",
        phase_label: "Ettermiddag",
        expected_output: "Beslutningsgrunnlag med anbefaling og risiko"
      },
      {
        id: "analysis_delivery",
        label: "Ettermiddagsanalyse",
        afterAnsweredCount: 16,
        phase: "evening",
        phase_label: "Kveld",
        expected_output: "Kort analyse av konsekvenser og carryover"
      }
    ];
  }

  function insertGates(runtime, active) {
    if (!runtime || !Array.isArray(runtime.items) || !runtime.items.length) return runtime;
    if (runtime.task_gates_version === GATE_VERSION) return runtime;

    const gates = defaultGates();
    const original = runtime.items.filter(row => norm(row?.event?.mail_type) !== "task_gate");
    const out = [];
    let answeredRelevantCount = 0;

    for (let i = 0; i < original.length; i += 1) {
      out.push(original[i]);
      answeredRelevantCount += 1;

      const gatesHere = gates.filter(g => Number(g.afterAnsweredCount || 0) === answeredRelevantCount);
      for (const gate of gatesHere) {
        out.push({
          status: "queued",
          phase: norm(gate.phase || original[i]?.phase || "afternoon"),
          slot: "task_gate",
          event: makeTaskGate(active, gate)
        });
      }
    }

    const delivered = Array.isArray(runtime.delivered_ids) ? runtime.delivered_ids : [];
    const answered = Array.isArray(runtime.answered_ids) ? runtime.answered_ids : [];

    const next = {
      ...runtime,
      task_gates_version: GATE_VERSION,
      task_gates: gates.map(g => ({
        id: g.id,
        label: g.label,
        afterAnsweredCount: g.afterAnsweredCount,
        phase: g.phase
      })),
      delivered_ids: delivered,
      answered_ids: answered,
      items: out,
      item_count_before_task_gates: original.length,
      item_count_after_task_gates: out.length,
      updated_at: new Date().toISOString()
    };

    return setRuntime(next);
  }

  function ensureTaskForPendingGate(engine) {
    const active = getActive();
    if (!active) return null;

    const pending = engine?.getPendingEvent?.() || null;
    const eventObj = pending?.event || null;
    if (!eventObj || eventObj.task_required !== true) return null;

    const task = window.CivicationTaskEngine?.ensureTaskForMail?.(eventObj, active, {
      reason: "daily_task_gate"
    }) || null;

    if (!task) return null;

    const inbox = engine?.getInbox?.() || window.CivicationMailEngine?.getInbox?.() || [];
    if (!Array.isArray(inbox)) return task;

    const nextInbox = inbox.map(item => {
      if (norm(item?.event?.id) !== norm(eventObj.id)) return item;
      return {
        ...item,
        event: {
          ...item.event,
          task_id: task.id,
          task_status: task.status,
          task_title: task.title,
          task_description: task.description,
          task_gate_active: true,
          situation: Array.isArray(item.event?.situation)
            ? item.event.situation.concat([
                `Arbeidsoppgave opprettet: ${task.title}.`,
                `Estimert arbeidstid: ${Number(task.durationMinutes || eventObj.work_minutes || 30)} minutter.`
              ])
            : item.event?.situation
        }
      };
    });

    engine?.setInbox?.(nextInbox);
    return task;
  }

  function patchDailyBuilder() {
    const builder = window.CivicationDailyMailBuilder;
    if (!builder || builder.__dailyTaskGatesPatched) return false;

    const originalStartToday = builder.startToday;
    const originalInspect = builder.inspect;

    if (typeof originalStartToday === "function") {
      builder.startToday = async function taskGateStartToday(options = {}) {
        const result = await originalStartToday.call(builder, options);
        const active = options.active || getActive();
        if (active) insertGates(getRuntime(), active);
        return {
          ...result,
          task_gates: getRuntime()?.task_gates || []
        };
      };
    }

    if (typeof originalInspect === "function") {
      builder.inspect = function taskGateInspect() {
        const base = originalInspect.call(builder);
        const rt = getRuntime();
        return {
          ...base,
          task_gates_version: rt?.task_gates_version || null,
          task_gates: rt?.task_gates || [],
          task_gate_count: Array.isArray(rt?.items)
            ? rt.items.filter(row => norm(row?.event?.mail_type) === "task_gate").length
            : 0
        };
      };
    }

    builder.insertTaskGates = function insertTaskGatesNow() {
      const active = getActive();
      return active ? insertGates(getRuntime(), active) : null;
    };

    builder.__dailyTaskGatesPatched = true;
    return true;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto[PATCHED_FLAG]) return false;
    if (typeof proto.onAppOpen !== "function") return false;

    const previousOnAppOpen = proto.onAppOpen;
    proto[PATCHED_FLAG] = true;

    proto.onAppOpen = async function taskGateOnAppOpen(opts = {}) {
      const result = await previousOnAppOpen.call(this, opts);
      const active = getActive();
      if (active) insertGates(getRuntime(), active);
      ensureTaskForPendingGate(this);
      return result;
    };

    return true;
  }

  function boot() {
    patchDailyBuilder();
    patchEventEngine();
  }

  window.CivicationDailyTaskGates = {
    boot,
    insertGates(runtime, active) {
      return insertGates(runtime || getRuntime(), active || getActive());
    },
    inspect() {
      const rt = getRuntime();
      return {
        runtime: rt,
        version: rt?.task_gates_version || null,
        task_gates: rt?.task_gates || [],
        task_gate_count: Array.isArray(rt?.items)
          ? rt.items.filter(row => norm(row?.event?.mail_type) === "task_gate").length
          : 0,
        patched_builder: !!window.CivicationDailyMailBuilder?.__dailyTaskGatesPatched,
        patched_engine: !!window.CivicationEventEngine?.prototype?.[PATCHED_FLAG]
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
