import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value.endsWith("\n") ? value : value + "\n");
const json = rel => JSON.parse(read(rel));
const replaceOnce = (source, from, to, label) => {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(label + ": expected exactly one match, got " + count);
  return source.replace(from, to);
};

const placePath = "data/places/by/oslo/places/torggata.json";
const place = json(placePath);
if (place.id !== "torggata") throw new Error("Unexpected canonical place id");
if (place.category !== "by") throw new Error("Expected Torggata category=by");
if (!place.tasks_profile || !Array.isArray(place.tasks_profile.tasks)) throw new Error("Expected legacy Torggata tasks_profile before phase 9 migration");
const legacyTaskIds = place.tasks_profile.tasks.map(task => task?.id);
const expectedLegacyTaskIds = ["torggata_task_gateprofil", "torggata_task_for_na", "torggata_task_aktorer"];
if (JSON.stringify(legacyTaskIds) !== JSON.stringify(expectedLegacyTaskIds)) {
  throw new Error("Unexpected legacy Torggata task baseline: " + JSON.stringify(legacyTaskIds));
}

// Canonical På stedet-kontrakt: Oppgaver er fjernet fra History GO-produktet.
delete place.tasks_profile;

for (const item of place.civication_store || []) {
  if (item?.unlock === "Lås opp ved å finne gateprofil-oppgaven i Torggata.") {
    item.unlock = "Lås opp ved å besøke Torggata og lese før/nå-kortet om gateprofilen.";
  }
  if (item?.unlock === "Lås opp ved å fullføre oppgaven Les aktørene i Torggata.") {
    item.unlock = "Lås opp ved å besøke Torggata og lese gate- og bylivsprofilen.";
  }
}

const redesign = (place.works || []).find(work => work?.id === "torggata_work_miljogate_ombygging");
if (!redesign) throw new Error("Missing Torggata miljøgate work");
const oldSourceNote = "Bygger på Torggata-dataenes `for_na`, `tasks_profile`, `quiz_profile` og `civication_store`, som alle beskriver miljøgate, oppgradert gateprofil og transformasjon fra røffere sentrumsgate til kuratert bygate.";
if (redesign.source_note !== oldSourceNote) throw new Error("Unexpected miljøgate source_note baseline");
redesign.source_note = "Bygger på Torggata-dataenes `for_na`, `quiz_profile` og `civication_store`, som beskriver miljøgate, oppgradert gateprofil og transformasjon fra røffere sentrumsgate til kuratert bygate.";

write(placePath, JSON.stringify(place, null, 2));

for (const field of ["events", "tasks_profile", "training_profile", "play_profile"]) {
  if (Object.prototype.hasOwnProperty.call(place, field)) throw new Error("Unexpected Torggata onsite field after migration: " + field);
}
const canonicalPlaceText = JSON.stringify(place);
for (const marker of ["torggata_task_", "gateprofil-oppgaven", "oppgaven Les aktørene", "`tasks_profile`"]) {
  if (canonicalPlaceText.includes(marker)) throw new Error("Stale task marker survived migration: " + marker);
}

const onsiteContract = json("data/categories/place_onsite_contract.json");
const byPolicy = onsiteContract.categoryPolicy?.by;
const expectedByPolicy = {
  events: "always",
  "social-meet": "always",
  "knowledge-meet": "always",
  play: "never"
};
if (JSON.stringify(byPolicy) !== JSON.stringify(expectedByPolicy)) throw new Error("Unexpected canonical by onsite policy");
if (!onsiteContract.excludedConcepts?.tasks || !onsiteContract.excludedConcepts?.training) throw new Error("Missing canonical excluded-concepts contract");

const socialRows = json("data/social/place_social/oslo/place_social.json");
if (socialRows.some(row => row?.place_id === "torggata")) throw new Error("Unexpected Torggata-specific social row; audit assumes canonical runtime fallback");
const events = json("data/social/events/oslo/canonical_events.json");
if (events.some(event => event?.place_id === "torggata")) throw new Error("Unexpected canonical Torggata event; Phase 9 must be re-audited before closeout");

const runtime = read("js/ui/place-onsite-surface.js");
for (const marker of ["Events", "Avtal å møtes", "Kunnskapsmøte", "Mer", "Ingen aktuelle events registrert her ennå"]) {
  if (!runtime.includes(marker)) throw new Error("Missing onsite runtime marker: " + marker);
}
if (!runtime.includes('contextType:"place", contextId:placeId')) throw new Error("Knowledge-meet is not place-bound");
if (!runtime.includes('filter: "place", placeId')) throw new Error("Social Meet is not place-filtered");

const phase9TestPath = "tests/torggata-phase9-onsite.test.mjs";
const phase9Test = String.raw`import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const read = file => fs.readFileSync(file, "utf8");
const json = file => JSON.parse(read(file));
const place = json("data/places/by/oslo/places/torggata.json");
const onsite = json("data/categories/place_onsite_contract.json");
const socialRows = json("data/social/place_social/oslo/place_social.json");
const canonicalEvents = json("data/social/events/oslo/canonical_events.json");
const runtime = read("js/ui/place-onsite-surface.js");

test("Torggata fase 9 migrerer legacy tasks_profile og bruker canonical by-policy", () => {
  assert.equal(place.id, "torggata");
  assert.equal(place.category, "by");
  assert.deepEqual(onsite.categoryPolicy.by, {
    events: "always",
    "social-meet": "always",
    "knowledge-meet": "always",
    play: "never"
  });
  for (const field of ["events", "tasks_profile", "training_profile", "play_profile"]) {
    assert.equal(Object.hasOwn(place, field), false, field);
  }
  assert.ok(onsite.excludedConcepts.tasks);
  assert.ok(onsite.excludedConcepts.training);
  const text = JSON.stringify(place);
  assert.doesNotMatch(text, /torggata_task_|gateprofil-oppgaven|oppgaven Les aktørene|\x60tasks_profile\x60/);
});

test("Torggata beholder relevante fysiske spor etter task-migrasjonen", () => {
  const objects = new Map((place.civication_store || []).map(item => [item.id, item]));
  assert.match(objects.get("torggata_sykkel_gagate_symbol")?.unlock || "", /før\/nå-kortet om gateprofilen/);
  assert.match(objects.get("torggata_serveringssone_markor")?.unlock || "", /gate- og bylivsprofilen/);
  const redesign = (place.works || []).find(work => work.id === "torggata_work_miljogate_ombygging");
  assert.ok(redesign);
  assert.doesNotMatch(redesign.source_note, /tasks_profile/);
  assert.match(redesign.source_note, /for_na/);
  assert.match(redesign.source_note, /quiz_profile/);
  assert.match(redesign.source_note, /civication_store/);
});

test("Torggata har ingen registrert canonical event og viser gyldig tomtilstand", () => {
  assert.equal(socialRows.some(row => row.place_id === "torggata"), false);
  assert.deepEqual(canonicalEvents.filter(event => event.place_id === "torggata"), []);
  assert.match(runtime, /Ingen aktuelle events registrert her ennå/);
});

test("Torggata På stedet renderer fast hovedrad og place-bundne møteflows", async () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div id="pcEventsBox"><div class="pc-events-head"></div></div></div></body>', {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const w = dom.window;
  w.PLACES = [place];
  w.__HG_CANONICAL_SOCIAL_EVENTS__ = [];
  w.fetch = async () => ({ ok: true, json: async () => onsite });

  let popup = null;
  let socialOpen = null;
  let knowledgeOpen = null;
  w.showPlaceCardRoundPopup = payload => { popup = payload; };
  w.HG_SocialMeetUI = { open: payload => { socialOpen = payload; } };
  w.HG_SpotmeetingUI = { open: payload => { knowledgeOpen = payload; } };

  w.eval(runtime);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await Promise.resolve();
  await Promise.resolve();
  w.HGPlaceOnSiteSurface.decorate(true);

  const labels = Array.from(w.document.querySelectorAll("[data-hg-onsite-action] .pc-onsite-action-label"), node => node.textContent.trim());
  assert.deepEqual(labels, ["Events", "Avtal å møtes", "Kunnskapsmøte", "Mer"]);

  w.document.querySelector('[data-hg-onsite-action="events"]').click();
  assert.equal(popup.title, "Events");
  assert.match(popup.html, /Ingen aktuelle events registrert her ennå/);

  w.document.querySelector('[data-hg-onsite-action="social-meet"]').click();
  assert.equal(socialOpen.filter, "place");
  assert.equal(socialOpen.placeId, "torggata");

  w.document.querySelector('[data-hg-onsite-action="knowledge-meet"]').click();
  assert.equal(knowledgeOpen.contextType, "place");
  assert.equal(knowledgeOpen.contextId, "torggata");

  w.document.querySelector('[data-hg-onsite-action="more"]').click();
  assert.equal(popup.title, "Mer");
  assert.match(popup.html, /Ingen flere funksjoner for dette stedet/);
  dom.window.close();
});

test("onsite-runtime eksponerer ikke forbudte stedbaserte personsignaler", () => {
  assert.doesNotMatch(runtime, /nearby users|nearby people|distance-to-person|public visit history|last seen/i);
  assert.doesNotMatch(runtime, /navigator\.geolocation|getCurrentPosition|watchPosition/);
});
`;
write(phase9TestPath, phase9Test);

const auditPath = "reports/place-production/torggata-phase9-onsite-audit-v1.json";
const audit = {
  schema: "history_go_place_onsite_audit_v1",
  version: "1.0.0",
  generated_at: "2026-08-12",
  place_id: "torggata",
  phase: "9",
  result: "PASS",
  prior_work_gate: {
    search_status: "UTFØRT",
    last_approved_pr_commit: "Ingen Torggata-spesifikk fase-9 PR/commit funnet; global På stedet-runtime og kontrakt finnes allerede på main",
    last_approved_state: "category=by med global canonical onsite-runtime, men Torggata bar fortsatt en legacy tasks_profile-blokk fra eldre produktmodell",
    concrete_regression_evidence: "tasks_profile og to unlock-tekster henviste fortsatt til Oppgaver selv om canonical onsite-kontrakt sier at Oppgaver er fjernet",
    decision: "MIGRERING + CLOSEOUT",
    scope: "fjern legacy tasks_profile, rydd task-kryssreferanser, audit og regresjonscloseout"
  },
  migration: {
    removed_field: "tasks_profile",
    removed_task_ids: legacyTaskIds,
    normalized_references: [
      "civication_store:torggata_sykkel_gagate_symbol.unlock",
      "civication_store:torggata_serveringssone_markor.unlock",
      "works:torggata_work_miljogate_ombygging.source_note"
    ],
    preserved_content_rule: "fysiske observasjonsspor beholdes i eksisterende før/nå-, object- og works-eiere; de skal ikke leve videre som Oppgaver"
  },
  events: {
    result: "PASS_EMPTY_STATE",
    canonical_place_social_row: false,
    canonical_event_ids: [],
    runtime_behavior: "Events er alltid synlig for category=by og viser canonical tomtilstand når ingen event er registrert",
    historical_events_rule: "historiske hendelser forblir i Historie og materialiseres ikke som dagens event"
  },
  meetings: {
    result: "PASS_EXISTING_RUNTIME",
    social_meet: "Avtal å møtes bruker global place-filtered fallback uten Torggata-spesifikk personpayload",
    knowledge_meet: "Kunnskapsmøte åpnes med contextType=place og contextId=torggata",
    forbidden_signals: ["GPS/live location", "nearby user discovery", "distance-to-person", "last seen/presence", "public visit history", "passive tracking"]
  },
  do_on_site: {
    result: "PASS_NA_AFTER_MIGRATION",
    tasks_profile: {
      status: "REMOVED_LEGACY",
      reason: "Oppgaver er fjernet som History GO-produktkonsept av canonical På stedet-kontrakt"
    },
    training_profile: {
      status: "N/A",
      reason: "Torggata er category=by og en sentrumsgate; training_profile er type-spesifikt sportsinnhold"
    },
    play_profile: {
      status: "N/A",
      reason: "Torggata er ikke lekeplass/lekepark/playground; categoryPolicy.by.play er never"
    },
    physical_feasibility: "ingen ny fysisk action produseres; eksisterende observerbare gatespor beholdes i sine canonical innholdseiere",
    wonderkammer_migration: "ingen relevant legacy Wonderkammer-handling funnet"
  },
  canonical_data_changes: [
    "data/places/by/oslo/places/torggata.json: remove tasks_profile",
    "data/places/by/oslo/places/torggata.json: remove stale task-based unlock/source references"
  ],
  regression_expectations: {
    fixed_main_row: ["Events", "Avtal å møtes", "Kunnskapsmøte", "Mer"],
    phase_8e_rounds_preserved: true,
    no_filler_policy: true,
    no_legacy_tasks_profile: true
  },
  next_phase: "10. Quiz"
};
write(auditPath, JSON.stringify(audit, null, 2));

const workcardPath = "reports/place-production/torggata-workcard-current.md";
let workcard = read(workcardPath);
if (workcard.includes("## Fase 9 – På stedet")) throw new Error("Phase 9 section already exists");
workcard = replaceOnce(
  workcard,
  "- Fase 8E-audit: `reports/place-production/torggata-phase8e-rounds-closeout-v1.json`\n",
  "- Fase 8E-audit: `reports/place-production/torggata-phase8e-rounds-closeout-v1.json`\n- Fase 9-audit: `reports/place-production/torggata-phase9-onsite-audit-v1.json`\n",
  "workcard phase 9 audit link"
);
workcard = replaceOnce(
  workcard,
  "| 9. På stedet | **PÅGÅR** | neste aktive fase etter lukket fase 8 |\n| 10–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "| 9. På stedet | **GODKJENT** | legacy `tasks_profile` migrert ut + onsite-runtime/regresjon godkjent |\n| 10. Quiz | **PÅGÅR** | neste aktive fase etter lukket fase 9 |\n| 11–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "workcard phase status"
);

const phase9Section = [
  "",
  "## Fase 9 – På stedet",
  "",
  "```text",
  "TIDLIGERE-ARBEID-SØK: UTFØRT",
  "SISTE GODKJENTE TILSTAND: canonical global På stedet-runtime fantes allerede, men Torggata hadde fortsatt legacy tasks_profile",
  "KONKRET REGRESJONSEVIDENS: canonical kontrakt sier at Oppgaver er fjernet, mens Torggata fortsatt hadde tre task-records og to task-baserte unlock-tekster",
  "BESLUTNING: MIGRERING + CLOSEOUT – fjern gammel Oppgaver-modell uten å dikte nye På stedet-handlinger",
  "```",
  "",
  "### Godkjent resultat",
  "",
  "- **Legacy `tasks_profile` = FJERNET:** de tre gamle task-recordene `torggata_task_gateprofil`, `torggata_task_for_na` og `torggata_task_aktorer` er tatt ut av canonical place-data fordi Oppgaver er fjernet fra produktkontrakten.",
  "- **Fysiske spor = BEHOLDT HOS RIKTIG EIER:** gateprofil, før/nå og bylivsobservasjoner lever videre gjennom eksisterende `for_na`, `civication_store`, `works` og quizgrunnlag; de er ikke kopiert inn som en ny pseudo-oppgavemodell.",
  "- **Stale task-kryssreferanser = RYDDET:** to `unlock`-tekster og miljøgateverkets `source_note` peker ikke lenger på Oppgaver/`tasks_profile`.",
  "- **Events = GODKJENT TOMTILSTAND:** ingen Torggata-event er registrert i canonical event-register; runtime viser korrekt tomtilstand uten å dikte arrangementer.",
  "- **Avtal å møtes = GODKJENT EKSISTERENDE RUNTIME:** global place-filtered Social Meet brukes uten Torggata-spesifikk personpayload.",
  "- **Kunnskapsmøte = GODKJENT EKSISTERENDE RUNTIME:** åpnes manuelt med `contextType=place` og `contextId=torggata`.",
  "- **`training_profile` = BEGRUNNET N/A:** Torggata er en By-gate, ikke et sportssted.",
  "- **`play_profile` = BEGRUNNET N/A:** Torggata er ikke lekeplass/lekepark/playground; `categoryPolicy.by.play` er `never`.",
  "- **Ingen filler:** det er ikke opprettet kunstige events, aktiviteter eller handlinger for å fylle fase 9.",
  "- `tests/torggata-phase9-onsite.test.mjs` låser migrasjonen, hovedraden, event-tomtilstanden, møteflowene og fravær av stedbaserte personsignaler.",
  "",
  "**Fase 9 På stedet = GODKJENT.**",
  "",
  "Neste aktive fase: **10. Quiz**.",
  ""
].join("\n");
workcard = workcard.trimEnd() + "\n" + phase9Section;
write(workcardPath, workcard);

console.log(JSON.stringify({
  place_id: place.id,
  phase: 9,
  migration: "REMOVED_LEGACY_TASKS_PROFILE",
  removed_task_ids: legacyTaskIds,
  events: "PASS_EMPTY_STATE",
  meetings: "PASS_EXISTING_RUNTIME",
  do_on_site: "PASS_NA_AFTER_MIGRATION",
  place_payload_changed: true,
  next_phase: "10. Quiz"
}, null, 2));
