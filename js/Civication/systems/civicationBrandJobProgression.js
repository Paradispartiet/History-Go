// js/Civication/systems/civicationBrandJobProgression.js
// Converts persistent brand-job metrics into one-time job milestone events.
// This layer is intentionally small: it reads CivicationBrandJobState metrics,
// detects thresholds, and enqueues canonical Civication inbox events.

(function () {
  "use strict";

  const STORAGE_KEY = "hg_brand_job_progression_v1";
  const VERSION = 1;
  const PATCHED = "__civicationBrandJobProgressionPatched";

  const RULES = [
    {
      id: "norli_ekspeditor_faglighet_3",
      brand_id: "norli",
      brand_name: "Norli",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "faglighet",
      threshold: 3,
      mail_id: "brand_progress_norli_faglighet_3",
      subject: "Du får ansvar for anbefalingsbordet",
      situation: [
        "Flere kunder har fått presise råd av deg, og lederen legger merke til at du ikke bare peker på kampanjebordet.",
        "Du får beskjed om å lage et lite anbefalingsbord for bøker du faktisk kan stå inne for.",
        "Norli-jobben flytter seg litt fra ren ekspedisjon til synlig bokhandleransvar."
      ],
      feedback: "Faglighet har begynt å gi deg konkret ansvar på gulvet."
    },
    {
      id: "norli_ekspeditor_kundetillit_3",
      brand_id: "norli",
      brand_name: "Norli",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "kundetillit",
      threshold: 3,
      mail_id: "brand_progress_norli_kundetillit_3",
      subject: "Kunder begynner å spørre etter deg",
      situation: [
        "En kunde kommer tilbake og spør om du er på jobb fordi forrige anbefaling traff godt.",
        "Det er ikke en formell forfremmelse, men det endrer hvordan kolleger og leder ser på deg.",
        "Du begynner å bli en person i butikken, ikke bare en kropp bak kassa."
      ],
      feedback: "Kundetillit gjør rollen mer personlig og mindre utskiftbar."
    },
    {
      id: "norli_ekspeditor_brand_tillit_3",
      brand_id: "norli",
      brand_name: "Norli",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "brand_tillit",
      threshold: 3,
      mail_id: "brand_progress_norli_brand_tillit_3",
      subject: "Leder lar deg justere frontbordet",
      situation: [
        "Du har håndtert flere situasjoner uten å bryte butikkens standarder, og lederen gir deg litt mer handlingsrom.",
        "Du får lov til å justere en liten del av frontbordet når kundemønsteret tilsier det.",
        "Tilliten er fortsatt begrenset, men du har fått en åpning i systemet."
      ],
      feedback: "Brand-tillit åpner små rom for dømmekraft innenfor kjedens rammer."
    },
    {
      id: "norli_ekspeditor_risiko_3",
      brand_id: "norli",
      brand_name: "Norli",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "risiko",
      threshold: 3,
      mail_id: "brand_progress_norli_risiko_3",
      subject: "Samtale om avvik fra kampanjeplanen",
      situation: [
        "Lederen tar deg til side etter flere små avvik fra kampanje- og bordplanen.",
        "Noen av valgene dine kan forsvares faglig, men systemet må fortsatt stole på at du følger grunnstrukturen.",
        "Du møter grensen mellom bokhandlerdømmekraft og kjededrift."
      ],
      feedback: "Risiko gjør at tillit må repareres, ikke bare forklares."
    },
    {
      id: "narvesen_ekspeditor_driftsflyt_3",
      brand_id: "narvesen",
      brand_name: "Narvesen",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "driftsflyt",
      threshold: 3,
      mail_id: "brand_progress_narvesen_driftsflyt_3",
      subject: "Du får ansvar for morgenrush-rutinen",
      situation: [
        "Du har vist at du kan holde kø, kaffe, småvarer og kasse i bevegelse uten at alt stopper opp.",
        "Lederen lar deg ta mer ansvar for morgenrush-rutinen neste uke.",
        "Narvesen-jobben gir deg ikke mye makt, men den gir deg mer ansvar for flyten."
      ],
      feedback: "Driftsflyt blir synlig når mange små problemer ikke rekker å vokse."
    },
    {
      id: "narvesen_ekspeditor_kundetillit_3",
      brand_id: "narvesen",
      brand_name: "Narvesen",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "kundetillit",
      threshold: 3,
      mail_id: "brand_progress_narvesen_kundetillit_3",
      subject: "Du håndterer vanskelige kunder tryggere",
      situation: [
        "Kunder som tidligere ville skapt stopp i køen, blir nå møtt med tydeligere svar og roligere tempo.",
        "Du løser ikke alt, men du gjør friksjonen mindre synlig for resten av butikken.",
        "Kundetillit i kiosk er ofte kort og praktisk: folk merker at du får situasjonen videre."
      ],
      feedback: "Kundetillit på gulvet handler ofte om trygg rytme, ikke lange samtaler."
    },
    {
      id: "narvesen_ekspeditor_risiko_3",
      brand_id: "narvesen",
      brand_name: "Narvesen",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "risiko",
      threshold: 3,
      mail_id: "brand_progress_narvesen_risiko_3",
      subject: "Leder tar opp snarveier i kassa",
      situation: [
        "Flere raske snarveier har gjort vaktene lettere på kort sikt, men lederen ser mønsteret.",
        "Du får beskjed om at tempo ikke kan gå foran kontroll, alder, pris og registrering.",
        "Kioskjobben viser sin harde side: små avvik kan bli store hvis de gjentas."
      ],
      feedback: "Risiko vokser ofte i det som først ser ut som effektivitet."
    },
    {
      id: "narvesen_ekspeditor_stress_4",
      brand_id: "narvesen",
      brand_name: "Narvesen",
      role_scope: "ekspeditor",
      career_id: "naeringsliv",
      metric: "stress",
      threshold: 4,
      mail_id: "brand_progress_narvesen_stress_4",
      subject: "Vaktene begynner å slite på deg",
      situation: [
        "Du merker at flere vakter sitter igjen i kroppen etter at du har gått hjem.",
        "Det er ikke én stor hendelse, men summen av kø, terminaler, småfeil, kunder og tempo.",
        "Jobben er lavstatus, men belastningen er konkret. Den må håndteres før den blir en fast tilstand."
      ],
      feedback: "Stress-milestonen viser at arbeidsflyt også har en kostnad."
    }
  ];

  function norm(value) { return String(value || "").trim(); }
  function slugify(value) {
    return norm(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }

  function makeDefault() {
    return { version: VERSION, triggered: {}, updated_at: null };
  }

  function getState() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY), makeDefault());
    return {
      version: VERSION,
      triggered: parsed?.triggered && typeof parsed.triggered === "object" ? parsed.triggered : {},
      updated_at: parsed?.updated_at || null
    };
  }

  function setState(nextState) {
    const next = nextState || makeDefault();
    const previousRaw = localStorage.getItem(STORAGE_KEY);
    const nextRaw = JSON.stringify(next);
    if (previousRaw === nextRaw) return { ok: true, changed: false };
    localStorage.setItem(STORAGE_KEY, nextRaw);
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return { ok: true, changed: true };
  }

  function reset() {
    const had = localStorage.getItem(STORAGE_KEY);
    if (had == null) return { ok: true, changed: false };
    localStorage.removeItem(STORAGE_KEY);
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return { ok: true, changed: true };
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(inbox) {
    window.CivicationState?.setInbox?.(Array.isArray(inbox) ? inbox : []);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function brandRoleKey(brandId, roleScope) {
    return `${slugify(brandId)}:${slugify(roleScope)}`;
  }

  function milestoneKey(rule) {
    return `${rule.brand_id}:${rule.role_scope}:${rule.id}`;
  }

  function hasPendingMilestone(rule) {
    const inbox = getInbox();
    return inbox.some((item) => {
      const event = item?.event || item;
      return item?.status === "pending" && norm(event?.source_type) === "brand_progression" && norm(event?.id) === rule.mail_id;
    });
  }

  function buildMilestoneEvent(rule, entry) {
    return {
      id: rule.mail_id,
      source: "Civication",
      source_type: "brand_progression",
      mail_class: "job_milestone",
      career_id: rule.career_id,
      role_scope: rule.role_scope,
      brand_id: rule.brand_id,
      brand_name: rule.brand_name,
      metric: rule.metric,
      threshold: rule.threshold,
      subject: rule.subject,
      summary: rule.feedback,
      situation: rule.situation.slice(),
      choices: [
        {
          id: "A",
          label: "Ta dette med videre i jobben",
          effect: 0,
          tags: ["brand_progression", rule.brand_id, rule.metric],
          feedback: rule.feedback
        }
      ],
      feedback: rule.feedback,
      brand_progression_meta: {
        rule_id: rule.id,
        key: milestoneKey(rule),
        brand_role_key: brandRoleKey(rule.brand_id, rule.role_scope),
        metric_value: Number(entry?.metrics?.[rule.metric] || 0)
      }
    };
  }

  function enqueueMilestone(rule, entry) {
    if (hasPendingMilestone(rule)) return { ok: true, enqueued: false, reason: "already_pending" };
    const inbox = getInbox().slice();
    inbox.unshift({
      status: "pending",
      createdAt: Date.now(),
      event: buildMilestoneEvent(rule, entry)
    });
    setInbox(inbox);
    return { ok: true, enqueued: true };
  }

  function makeTriggeredEntry(rule, value, source) {
    return {
      at: new Date().toISOString(),
      mail_id: rule.mail_id,
      brand_id: rule.brand_id,
      brand_name: rule.brand_name,
      role_scope: rule.role_scope,
      metric: rule.metric,
      threshold: rule.threshold,
      value,
      source: source || "enqueued"
    };
  }

  function evaluateEntry(entry) {
    if (!entry || !entry.brand_id || !entry.role_scope || !entry.metrics) {
      return { ok: false, changed: false, reason: "invalid_entry", triggered: [] };
    }

    const brandId = slugify(entry.brand_id);
    const roleScope = slugify(entry.role_scope);
    const state = getState();
    const next = { ...state, triggered: { ...state.triggered } };
    const triggered = [];

    for (const rule of RULES) {
      if (rule.brand_id !== brandId || rule.role_scope !== roleScope) continue;
      const value = Number(entry.metrics?.[rule.metric] || 0);
      if (value < rule.threshold) continue;
      const key = milestoneKey(rule);
      if (next.triggered[key]) continue;

      const enqueued = enqueueMilestone(rule, entry);
      if (!enqueued.ok) continue;

      next.triggered[key] = makeTriggeredEntry(rule, value, enqueued.reason === "already_pending" ? "already_pending" : "enqueued");
      triggered.push(key);
    }

    if (!triggered.length) return { ok: true, changed: false, triggered: [] };
    next.updated_at = new Date().toISOString();
    const saved = setState(next);
    return { ok: true, changed: saved.changed, triggered };
  }

  function evaluate(options = {}) {
    const brandState = window.CivicationBrandJobState?.getState?.();
    const byBrandRole = brandState?.byBrandRole && typeof brandState.byBrandRole === "object" ? brandState.byBrandRole : {};
    const onlyKey = norm(options.key);
    const results = [];

    for (const [key, entry] of Object.entries(byBrandRole)) {
      if (onlyKey && key !== onlyKey) continue;
      results.push({ key, ...evaluateEntry(entry) });
    }

    const triggered = results.flatMap((row) => Array.isArray(row.triggered) ? row.triggered : []);
    return { ok: true, changed: triggered.length > 0, triggered, results };
  }

  function patchBrandJobState() {
    const api = window.CivicationBrandJobState;
    if (!api || typeof api.applyChoiceConsequences !== "function") return false;
    if (api[PATCHED]) return true;

    const original = api.applyChoiceConsequences;
    api.applyChoiceConsequences = function progressedApplyChoiceConsequences(eventObj, choice) {
      const result = original.call(this, eventObj, choice);
      if (result?.ok && result.changed && result.key) {
        try { evaluate({ key: result.key }); } catch (error) {
          if (window.DEBUG) console.warn("[CivicationBrandJobProgression] evaluate failed", error);
        }
      }
      return result;
    };

    api[PATCHED] = true;
    return true;
  }

  function boot() {
    patchBrandJobState();
  }

  function inspect() {
    return {
      storage_key: STORAGE_KEY,
      state: getState(),
      rules: RULES.map((rule) => ({ id: rule.id, brand_id: rule.brand_id, role_scope: rule.role_scope, metric: rule.metric, threshold: rule.threshold, mail_id: rule.mail_id })),
      patched: window.CivicationBrandJobState?.[PATCHED] === true
    };
  }

  window.CivicationBrandJobProgression = {
    STORAGE_KEY,
    RULES,
    getState,
    setState,
    reset,
    evaluate,
    inspect,
    boot,
    patchBrandJobState
  };

  boot();
  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
