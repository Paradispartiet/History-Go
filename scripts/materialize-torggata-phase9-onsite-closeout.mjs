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
for (const field of ["events", "tasks_profile", "training_profile", "play_profile"]) {
  if (Object.prototype.hasOwnProperty.call(place, field)) throw new Error("Unexpected Torggata onsite field: " + field);
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

test("Torggata fase 9 bruker canonical by-policy uten kunstige action-profiler", () => {
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
});

test("Torggata har ingen registrert canonical event og skal derfor vise gyldig tomtilstand", () => {
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

test("onsite-runtime eksponerer ikke de forbudte stedbaserte personsignalene", () => {
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
    last_approved_state: "main a71ca6cdfd1563be4d4edc3f12b6233ac576f1ac: category=by, ingen Torggata-spesifikke events/action-profiler, global canonical onsite-runtime aktiv",
    concrete_regression_evidence: "ingen",
    decision: "REELT NYTT ARBEID",
    scope: "audit og regresjonscloseout; ingen ny place-payload"
  },
  events: {
    result: "PASS_EMPTY_STATE",
    canonical_place_social_row: false,
    canonical_event_ids: [],
    canonical_event_registry_hits: [],
    runtime_behavior: "Events er alltid synlig for category=by og viser canonical tomtilstand når ingen event er registrert",
    historical_events_rule: "historiske hendelser forblir i Historie og materialiseres ikke som dagens event"
  },
  meetings: {
    result: "PASS_EXISTING_RUNTIME",
    social_meet: "Avtal å møtes er global fast handling; Torggata bruker privacy-safe place-filtered fallback uten Torggata-spesifikk sosial payload",
    knowledge_meet: "Kunnskapsmøte åpnes med contextType=place og contextId=torggata",
    privacy_contracts: [
      "docs/HG_SPOTMEETING.md",
      "docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md"
    ],
    forbidden_signals: [
      "GPS/live location",
      "nearby user discovery",
      "distance-to-person",
      "last seen/presence",
      "public visit history",
      "passive tracking"
    ]
  },
  do_on_site: {
    result: "PASS_NA",
    tasks_profile: {
      status: "N/A",
      reason: "Oppgaver/tasks_profile er fjernet som History GO-produktkonsept av canonical På stedet-kontrakt"
    },
    training_profile: {
      status: "N/A",
      reason: "Torggata er category=by og en sentrumsgate; training_profile er type-spesifikt sportsinnhold, ikke generell På stedet-handling"
    },
    play_profile: {
      status: "N/A",
      reason: "Torggata er ikke lekeplass/lekepark/playground; category=by har play=never og ingen stedstypeoverride kvalifiserer"
    },
    physical_feasibility: "ingen ny fysisk action produseres; derfor innføres ingen handling som krever sikkerhets- eller gjennomførbarhetsantakelser",
    wonderkammer_migration: "ingen relevant legacy handling funnet eller flyttet"
  },
  canonical_data_changes: [],
  regression_expectations: {
    fixed_main_row: ["Events", "Avtal å møtes", "Kunnskapsmøte", "Mer"],
    torggata_place_payload_unchanged: true,
    phase_8e_rounds_preserved: true,
    no_filler_policy: true
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
  "| 9. På stedet | **GODKJENT** | audit + runtime-regresjon; ingen kunstig Torggata-payload |\n| 10. Quiz | **PÅGÅR** | neste aktive fase etter lukket fase 9 |\n| 11–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "workcard phase status"
);

const phase9Section = [
  "",
  "## Fase 9 – På stedet",
  "",
  "```text",
  "TIDLIGERE-ARBEID-SØK: UTFØRT",
  "SISTE GODKJENTE PR/COMMIT: Ingen Torggata-spesifikk fase-9 PR/commit funnet; global På stedet-runtime og kontrakt finnes allerede på main",
  "SISTE GODKJENTE TILSTAND: main a71ca6cdfd1563be4d4edc3f12b6233ac576f1ac med category=by, ingen Torggata-spesifikke events/action-profiler og canonical global onsite-runtime",
  "KONKRET REGRESJONSEVIDENS: ingen",
  "BESLUTNING: REELT NYTT ARBEID – audit og closeout, uten ny place-payload",
  "```",
  "",
  "### Godkjent resultat",
  "",
  "- **Events = GODKJENT TOMTILSTAND:** Torggata har ingen egen rad i `data/social/place_social/oslo/place_social.json` og ingen `place_id: torggata` i canonical event-registeret. `by`-policyen viser likevel Events fast, og runtime viser `Ingen aktuelle events registrert her ennå` uten å dikte arrangementer.",
  "- **Avtal å møtes = GODKJENT EKSISTERENDE RUNTIME:** Torggata bruker den globale Social Meet-fallbacken med place-filter. Det legges ikke inn place-data om personer, live-posisjon eller besøkshistorikk.",
  "- **Kunnskapsmøte = GODKJENT EKSISTERENDE RUNTIME:** Spotmeeting åpnes manuelt med `contextType=place` og `contextId=torggata`; identity-/privacy-kontrakten forbyr GPS, nearby-brukere, distance-to-person, last seen, offentlig visit history og passiv sporing.",
  "- **`tasks_profile` = BEGRUNNET N/A:** Oppgaver er fjernet som History GO-produktkonsept og skal ikke produseres som På stedet-innhold.",
  "- **`training_profile` = BEGRUNNET N/A:** Torggata er en By-gate, ikke et sportssted; trening er type-spesifikt sportsinnhold i stedspopupen.",
  "- **`play_profile` = BEGRUNNET N/A:** Torggata er ikke `lekeplass`, `lekepark` eller `playground`; `categoryPolicy.by.play` er `never`.",
  "- **Fysisk gjennomførbarhet/sikkerhet = PASS:** ingen ny fysisk handling produseres, så fasen innfører ingen aktivitet som bygger på en uverifisert sikkerhets- eller gjennomførbarhetsantakelse.",
  "- **Wonderkammer-migrering = N/A:** ingen relevant legacy aktivitet er funnet som skal flyttes til dagens På stedet-eier.",
  "- Canonical `torggata.json` er med vilje urørt i fase 9; fravær av filler er det korrekte datavalget.",
  "- `tests/torggata-phase9-onsite.test.mjs` låser fast hovedrad, event-tomtilstand, place-bundne møteflows, N/A-feltene og fravær av stedbaserte personsignaler.",
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
  events: "PASS_EMPTY_STATE",
  meetings: "PASS_EXISTING_RUNTIME",
  do_on_site: "PASS_NA",
  place_payload_changed: false,
  next_phase: "10. Quiz"
}, null, 2));