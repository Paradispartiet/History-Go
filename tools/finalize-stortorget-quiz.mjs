#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const placeId = "stortorget";
const categoryId = "by";
const verifiedAt = "2026-09-10";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

const urls = {
  kommune: "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/stortorget",
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/stortorget",
  byleksikon: "https://oslobyleksikon.no/side/Stortorvet",
  statue: "https://oslobyleksikon.no/index.php/Christian_4-statuen",
  nkl: "https://nkl.snl.no/Carl_Ludvig_Jacobsen",
  osm: "https://www.openstreetmap.org/way/179095465",
  current: "https://commons.wikimedia.org/wiki/File:2019-08-23_Oslo_11_-_Stortorvet.jpg",
  historic: "https://commons.wikimedia.org/wiki/File:Ludvig_Wilhelm_Theodor_Bratz_-_Marked_p%C3%A5_Stortorvet_-_Oslo_Museum_-_OB.01017.jpg"
};

// Keep the permanent generators reproducible: enrich the direct person with exact dates.
const peopleFile = "data/people/by/oslo/stortorget/people_stortorget.json";
const people = read(peopleFile);
const carl = people.find((person) => person.id === "carl_ludvig_jacobsen");
if (!carl) throw new Error("Mangler Carl Ludvig Jacobsen etter Stortorget-builder");
carl.birth_date = "1835-01-24";
carl.death_date = "1923-12-18";
write(peopleFile, people);

// Normalize the place image backlog exactly like the canonical audit contract expects.
const auditPath = "/tmp/stortorget-image-audit.json";
execFileSync(process.execPath, ["scripts/audit-place-images.mjs", "--mode=all", `--report=${auditPath}`], { cwd: root, stdio: "ignore" });
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const backlogFile = "data/places/place_image_backlog_summary.json";
const backlog = read(backlogFile);
backlog.generatedAt = verifiedAt;
backlog.generatedFromCommit = "stortorget_completion_20260910";
backlog.totalPlaces = audit.totalPlaces;
backlog.summary = {
  validLocal: audit.summary.local,
  validRemote: audit.summary.remote,
  optionalMissing: audit.summary.optional,
  missing: audit.summary.missing,
  invalidLocalPath: audit.summary.invalid,
  remaining: audit.summary.missing + audit.summary.invalid
};
for (const [category, row] of Object.entries(audit.byCategory)) {
  backlog.byCategory[category] = {
    ...backlog.byCategory[category],
    total: row.total,
    valid: row.local + row.remote,
    optional: row.optional,
    missing: row.missing,
    invalid: row.invalid
  };
}
write(backlogFile, backlog);

const sourceRegistry = {
  kommune: { url: urls.kommune, source_type: "official_municipal_source", review_status: "reviewed", review_note: "Hovedtorg fra 1737, nåværende torghandel og Christian IV-monumentets datering er kontrollert." },
  oppdag: { url: urls.oppdag, source_type: "institutional_local_history", review_status: "reviewed", review_note: "Stadsport, terrengarbeid, markedsflytting, byvekt, vannpost, gasslys og Youngstorget-overføring er kontrollert." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Navn, torgidentitet og offentlig kunst på Stortorvet er kontrollert." },
  statue: { url: urls.statue, source_type: "institutional_reference", review_status: "reviewed", review_note: "Christian IV-statuens kunstner og avdukingshistorie er kontrollert." },
  nkl: { url: urls.nkl, source_type: "national_biographical_reference", review_status: "reviewed", review_note: "Carl Ludvig Jacobsens identitet, utdanning, konkurransepremie og verk er kontrollert." },
  osm: { url: urls.osm, source_type: "open_geodata", review_status: "reviewed", review_note: "Way 179095465 er kontrollert som navngitt torggeometri for Stortorvet/Stortorget." },
  current_photo: { url: urls.current, source_type: "licensed_image_record", review_status: "reviewed", review_note: "2019-fotografiet er kontrollert som dokumentarfoto av torgrommet." },
  historic_image: { url: urls.historic, source_type: "museum_image_record", review_status: "reviewed", review_note: "Bratz-motivet fra 1843 er kontrollert som historisk kunstnerisk framstilling av markedet på Stortorget." }
};

const facts = [
  ["Stortorget ligger foran Oslo domkirke.", "kommune", "em_by_offentlige_rom_motesteder"],
  ["Stortorget ble byens hovedtorg i 1737.", "kommune", "em_by_torg_plasser_som_scene"],
  ["Markedet ble flyttet fra Christiania Torv til Stortorget i 1737.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Området ved Stortorget lå tidligere ved Stadsporten og byvollen.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Terrenget ved det nye torget ble fylt opp og planert fra omkring 1730.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Markedet gjorde Stortorget til et møtested mellom byfolk og produsenter fra omlandet.", "oppdag", "em_by_torg_plasser_som_scene"],
  ["Det årlige hovedmarkedet på Stortorget varte til 1850-årene.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Deler av markedstrafikken ble flyttet videre til Nytorvet, dagens Youngstorget.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hestemarked og annen handel fortsatte på Stortorget etter at deler av markedet flyttet.", "oppdag", "em_by_torg_plasser_som_scene"],
  ["En byvekt var del av infrastrukturen rundt handelen på Stortorget.", "oppdag", "em_by_torg_plasser_som_scene"],
  ["En offentlig vannpost var del av den historiske torginfrastrukturen.", "oppdag", "em_by_offentlige_rom_motesteder"],
  ["Byens første gasslykt ble tent på Stortorget i 1848.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Gasskandelaberen på Stortorget ble kalt Fiat Lux.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Fiat Lux ble flyttet da Christian IV-monumentet overtok plassen på torget.", "oppdag", "em_by_historiske_lag_i_hverdagsrom"],
  ["Carl Ludvig Jacobsen utførte Christian IV-monumentet på Stortorget.", "nkl", "em_by_torg_plasser_som_scene"],
  ["Christian IV-monumentet ble ferdig i 1878.", "kommune", "em_by_historiske_lag_i_hverdagsrom"],
  ["Christian IV-monumentet ble avduket 28. september 1880.", "kommune", "em_by_historiske_lag_i_hverdagsrom"],
  ["Oslo kommune oppgir at Stortorvet har helårlig torghandel i dag.", "kommune", "em_by_offentlige_rom_motesteder"],
  ["Bratz' framstilling fra 1843 dokumenterer markedet som historisk motiv på Stortorget.", "historic_image", "em_by_historiske_lag_i_hverdagsrom"],
  ["Et fotografi fra 2019 dokumenterer Stortorget med Christian IV-monumentet i dagens torgrom.", "current_photo", "em_by_historiske_lag_i_hverdagsrom"],
  ["Et før–nå-par med et maleri fra 1843 og et foto fra 2019 kan vise historiske lag, men ikke måle geometrisk endring fra identisk kamerapunkt.", "historic_image", "em_by_historiske_lag_i_hverdagsrom"],
  ["Dagens bruk av torget kan undersøkes gjennom konkret observasjon av opphold, handel og bevegelse.", "kommune", "em_by_offentlige_rom_motesteder"],
  ["OSM-way 179095465 avgrenser Stortorvet/Stortorget som en navngitt torgflate.", "osm", "em_by_offentlige_rom_motesteder"],
  ["Kilder til Stortorget må skilles etter medietype: et historisk maleri er ikke det samme som et fotografi.", "historic_image", "em_by_historiske_lag_i_hverdagsrom"],
  ["William H. Whytes byromsperspektiv kan brukes til å strukturere observasjon av faktisk opphold og bevegelse på Stortorget.", "kommune", "em_by_offentlige_rom_motesteder"],
  ["Pierre Noras minneperspektiv kan brukes til å undersøke hvordan markedsbruk, monument og navnekontinuitet samler ulike historiske lag på Stortorget.", "byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["Flyttingen fra Christiania Torv til Stortorget viser at et hovedtorg kan skifte plass når byens romlige tyngdepunkt og behov endres.", "oppdag", "em_by_torg_plasser_som_scene"],
  ["At torghandel fortsetter mens infrastrukturen og monumentene endres, gjør Stortorget egnet til å sammenligne kontinuitet og endring i offentlig rom.", "kommune", "em_by_historiske_lag_i_hverdagsrom"]
];
const phaseFor = (index) => index < 7 ? "opening" : index < 14 ? "middle" : index < 21 ? "bridge" : "final";
const familyFor = (index) => index < 14 ? "fact" : index >= 24 && index <= 25 ? "concept_theory" : "context";
const claims = facts.map(([statement, sourceId, emneId], index) => ({
  claim_id: `claim_stortorget_quiz_${String(index + 1).padStart(2, "0")}`,
  order: index + 1,
  planned_phase: phaseFor(index),
  family: familyFor(index),
  statement,
  source_ids: [sourceId],
  source_origin: "external",
  emne_id: emneId
}));

const briefFile = "data/quiz/production_briefs/by/stortorget.json";
const contextFile = "data/quiz/production_context/by/stortorget.json";
const quizFile = "data/quiz/by/stortorget_sets.json";
const existingAudit = {
  searched_paths: [quizFile, "data/quiz/manifest.json", "data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json"],
  active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen canonical Stortorget-settpakke var registrert før fullproduksjonen." },
  decisions: ["Behold stedskortets eldre inline-quiz som legacy-kortflate, men opprett canonical kildeledet 4×7-settpakke.", "Hold de første 14 spørsmålene teori- og metodefrie.", "Innfør metode i brodelen og eksplisitt teori først i finaldelen."],
  knowledge_migration: "Alle 28 canonical spørsmål får stabile By-, claim- og Knowledge-ID-er; ingen eksisterende canonical sett-ID-er overskrives."
};
const profileDecision = {
  profile: "normal",
  set_count: 4,
  questions_per_set: 7,
  justification: "Stortorget har fire selvstendige læringsjobber — etablering/hovedmarked, handel/infrastruktur, kilde- og laglesning samt offentlig-rom-analyse — med tilstrekkelig ekstern kildedekning for normal 4×7 uten å fylle ut en rich-profil kunstig."
};
const selectedCurriculum = {
  module_ids: ["kur_by_04_historiske_lag_og_transformasjon"],
  emne_ids: ["em_by_torg_plasser_som_scene", "em_by_historiske_lag_i_hverdagsrom", "em_by_offentlige_rom_motesteder"],
  topic_hook_ids: ["byliv_aapne_rom", "his_spor_gatebilde"],
  method_ids: ["met_feltobservasjon", "met_for_etter", "met_morfologisk_analyse", "met_arkiv_minne_spor"],
  thinker_ids: ["william_h_whyte", "pierre_nora"],
  works: ["The Social Life of Small Urban Spaces", "Les Lieux de Mémoire"]
};
write(briefFile, {
  schema_version: "1.0",
  status: "reviewed",
  categoryId,
  targetId: placeId,
  profile_hint: "normal",
  reviewed_at: verifiedAt,
  review_note: "Fire læringsjobber dekker hovedmarkedet, torginfrastruktur, historiske lag/kilder og analyse av faktisk offentlig-rom-bruk.",
  scope: { place: "Stortorget", production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 },
  sources: sourceRegistry,
  selected_curriculum: selectedCurriculum,
  existing_quiz_audit: existingAudit,
  profile_decision: profileDecision,
  held_back_candidates: ["Påstander om identisk kamerapunkt mellom 1843 og 2019.", "Nøyaktige besøkstall eller omsetning uten kilde.", "Nabovirksomheter som falske Brands for selve torgflaten."],
  claims
});

const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets[placeId] = {
  source_brief: "../quiz/production_briefs/by/stortorget.json",
  context_artifact: "../quiz/production_context/by/stortorget.json",
  quiz_file: "../quiz/by/stortorget_sets.json"
};
write("data/fag/fag_manifest.json", fagManifest);

const context = await runBuildQuizProductionContext({ root, categoryId, targetId: placeId, outputPath: contextFile });

const conceptMeta = {
  em_by_historiske_lag_i_hverdagsrom: ["historiske lag", "co_by_historiske_lag_b5eb5eb432"],
  em_by_offentlige_rom_motesteder: ["offentlig rom", "co_by_offentlige_rom_b365076441"],
  em_by_torg_plasser_som_scene: ["torg og plasser", "co_by_torg_plasser_0c350db0fa"]
};
const q = [
  ["Hvor ligger Stortorget?", ["Foran Oslo domkirke", "Ved Akershus festning", "Bak Slottet"], 0, "Stortorget ligger foran Oslo domkirke."],
  ["Når ble Stortorget byens hovedtorg?", ["1697", "1737", "1880"], 1, "Stortorget ble byens hovedtorg i 1737."],
  ["Hvorfra ble markedet flyttet til Stortorget i 1737?", ["Youngstorget", "Christiania Torv", "Jernbanetorget"], 1, "Markedet ble flyttet fra Christiania Torv."],
  ["Hva lå tidligere ved området rundt Stortorget?", ["Stadsporten og byvollen", "En jernbanestasjon", "Et skipsverft"], 0, "Området lå ved Stadsporten og byvollen."],
  ["Hva måtte gjøres med terrenget før det nye torget kunne etableres?", ["Det måtte graves til havn", "Det måtte fylles opp og planeres", "Det måtte skogplantes"], 1, "Terrenget ble fylt opp og planert."],
  ["Hvem møttes gjennom markedet på Stortorget?", ["Bare embetsmenn", "Byfolk og produsenter fra omlandet", "Bare sjøfolk"], 1, "Markedet knyttet byen til produsenter fra omlandet."],
  ["Til hvilken periode varte det årlige hovedmarkedet på Stortorget?", ["Til 1750-årene", "Til 1850-årene", "Til 1950-årene"], 1, "Det årlige hovedmarkedet varte til 1850-årene."],
  ["Hvilket torg overtok deler av markedstrafikken?", ["Youngstorget", "Bankplassen", "Eidsvolls plass"], 0, "Deler av markedstrafikken flyttet til dagens Youngstorget."],
  ["Hva fortsatte på Stortorget etter at deler av markedet flyttet?", ["Hestemarked og annen handel", "Skipsbygging", "Gruvedrift"], 0, "Hestemarked og annen handel fortsatte."],
  ["Hva var byvektens rolle?", ["Å veie varer i markedsinfrastrukturen", "Å måle gatebredde", "Å styre gasslyset"], 0, "Byvekten var del av infrastrukturen rundt handelen."],
  ["Hvilken hverdagsinfrastruktur fantes også på torget?", ["En flyplass", "En offentlig vannpost", "En tunnelbane"], 1, "En offentlig vannpost var del av torginfrastrukturen."],
  ["Når ble byens første gasslykt tent på Stortorget?", ["1737", "1848", "1914"], 1, "Byens første gasslykt ble tent her i 1848."],
  ["Hva het gasskandelaberen på Stortorget?", ["Fiat Lux", "Vigelandsfontenen", "Kongelyset"], 0, "Gasskandelaberen ble kalt Fiat Lux."],
  ["Hvorfor ble Fiat Lux flyttet?", ["Christian IV-monumentet skulle overta plassen", "Torget ble revet", "Domkirken ble flyttet"], 0, "Fiat Lux ble flyttet da Christian IV-monumentet overtok plassen."],
  ["Hvem utførte Christian IV-monumentet?", ["Carl Ludvig Jacobsen", "Gustav Vigeland", "Frode Rinnan"], 0, "Carl Ludvig Jacobsen utførte monumentet."],
  ["Når var Christian IV-monumentet ferdig?", ["1848", "1878", "1905"], 1, "Monumentet var ferdig i 1878."],
  ["Når ble Christian IV-monumentet avduket?", ["28. september 1880", "17. mai 1814", "7. juni 1905"], 0, "Monumentet ble avduket 28. september 1880."],
  ["Hva oppgir Oslo kommune om dagens handel på Stortorvet?", ["Torghandel er forbudt", "Det er helårlig torghandel", "Det er bare handel i desember"], 1, "Kommunen oppgir helårlig torghandel."],
  ["Hva dokumenterer Bratz-motivet fra 1843?", ["Markedet som historisk motiv", "Christian IV-monumentet etter 1880", "En metroinngang"], 0, "Motivet dokumenterer markedet som historisk motiv."],
  ["Hva dokumenterer fotografiet fra 2019?", ["Stortorget med Christian IV-monumentet", "Stadsporten før 1730", "Markedet i 1843"], 0, "Fotoet dokumenterer dagens torgrom med monumentet."],
  ["Hva er den tryggeste bruken av 1843–2019-paret?", ["Å måle eksakt høydeendring", "Å lese historiske lag med medieforbehold", "Å bevise identisk kamerapunkt"], 1, "Paret egner seg til laglesning, ikke geometrisk måling fra identisk punkt."],
  ["Hva kan du undersøke direkte ved et besøk på Stortorget?", ["Faktisk opphold, handel og bevegelse", "Markedspriser i 1737", "Carl Jacobsens tanker"], 0, "Dagens bruk kan undersøkes gjennom konkret observasjon."],
  ["Hva representerer OSM-way 179095465 i denne produksjonen?", ["En person", "Den navngitte torgflaten", "En quiz"], 1, "Way-en avgrenser Stortorvet/Stortorget som torgflate."],
  ["Hvorfor må maleriet fra 1843 og fotoet fra 2019 behandles ulikt som kilder?", ["De har ulik medietype", "De har samme fotograf", "Begge er satellittbilder"], 0, "Et historisk maleri er ikke samme kildetype som et fotografi."],
  ["Hva kan William H. Whytes byromsperspektiv hjelpe deg å undersøke her?", ["Faktisk opphold og bevegelse", "Eksakt årstall for 1737", "Kunstnerens fødselsdato"], 0, "Whytes perspektiv retter blikket mot faktisk bruk av åpne rom."],
  ["Hva kan Pierre Noras minneperspektiv hjelpe deg å analysere på Stortorget?", ["Hvordan flere historiske lag samles i samme sted", "Hvor mange varer som selges i morgen", "Eksakt OSM-koordinat"], 0, "Minneperspektivet kan strukturere lesningen av lag, monument og navnekontinuitet."],
  ["Hva viser flyttingen fra Christiania Torv til Stortorget best?", ["At hovedtorg aldri flytter", "At byens sentrale funksjoner kan skifte plass", "At domkirken ble revet"], 1, "Flyttingen viser at et hovedtorg kan skifte plass når byens romlige struktur endres."],
  ["Hva er den tydeligste kombinasjonen av kontinuitet og endring på Stortorget?", ["Torghandel fortsetter mens infrastruktur og monumentlag endres", "Ingenting har endret seg siden 1737", "All handel forsvant i 1850"], 0, "Torghandel fortsetter, mens torginfrastruktur og monumentlag har endret seg."],
];
if (q.length !== 28 || claims.length !== 28) throw new Error("Stortorget normalprofil krever nøyaktig 28 spørsmål og claims");

const methods = { 20: "met_for_etter", 21: "met_feltobservasjon", 22: "met_morfologisk_analyse", 23: "met_arkiv_minne_spor" };
const theory = {
  24: { topic_hook_id: "byliv_aapne_rom", thinker_id: "william_h_whyte", work: "The Social Life of Small Urban Spaces", method_id: "met_feltobservasjon", why: "Perspektivet strukturerer observasjon av faktisk bruk uten å erstatte stedets kilder." },
  25: { topic_hook_id: "his_spor_gatebilde", thinker_id: "pierre_nora", work: "Les Lieux de Mémoire", method_id: "met_arkiv_minne_spor", why: "Perspektivet strukturerer en analyse av minne og historiske lag uten å erstatte historiske kilder." }
};
const questions = q.map(([question, options, answerIndex, knowledge], index) => {
  const claim = claims[index];
  const [concept, conceptId] = conceptMeta[claim.emne_id];
  const item = {
    id: `stortorget_quiz_${String(index + 1).padStart(2, "0")}`,
    quiz_id: `by_stortorget_q${String(index + 1).padStart(2, "0")}`,
    categoryId,
    placeId,
    targetId: placeId,
    question_scope: "place",
    question,
    options,
    answer: options[answerIndex],
    answerIndex,
    knowledge,
    difficulty: index < 7 ? 1 : index < 14 ? 2 : index < 21 ? 3 : 4,
    question_type: index < 14 ? "fact" : index >= 24 && index <= 25 ? "concept" : index === 21 ? "observation" : index === 22 ? "analysis" : index === 23 ? "comparison" : "context",
    emne_id: claim.emne_id,
    source: claim.source_ids,
    source_origin: claim.source_origin,
    claim_basis: claim.statement,
    claim_id: claim.claim_id,
    primary_knowledge_unit_id: `ku_by_stortorget_${String(index + 1).padStart(2, "0")}`,
    knowledge_unit_ids: [`ku_by_stortorget_${String(index + 1).padStart(2, "0")}`],
    concepts: [concept],
    concept_ids: [conceptId],
    term_ids: [],
    knowledge_contract_version: 1,
    knowledge_link_status: "linked"
  };
  if (methods[index]) {
    item.method_id = methods[index];
    item.guidance_basis = ["data/fag/by/methods_by.json"];
  }
  if (theory[index]) {
    const t = theory[index];
    item.topic_hook_id = t.topic_hook_id;
    item.thinker_id = t.thinker_id;
    item.work = t.work;
    item.method_id = t.method_id;
    item.theory_ref = { topic_hook_id: t.topic_hook_id, thinker_id: t.thinker_id, work: t.work, why_it_helps: t.why };
    item.guidance_basis = ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"];
  }
  return item;
});
const phases = ["opening", "middle", "bridge", "final"];
const titles = ["Hovedmarkedet", "Lys, handel og monument", "Kilder og lag", "Byrom og minne"];
const sets = phases.map((phase, setIndex) => ({
  set_id: `by_stortorget_set_${setIndex + 1}`,
  order: setIndex + 1,
  level: setIndex + 1,
  phase,
  title: titles[setIndex],
  questions: questions.slice(setIndex * 7, setIndex * 7 + 7)
}));

const packageContext = {
  manifest_category: categoryId,
  profile: "normal_4x7",
  standard_version: "3.4",
  source_brief: briefFile,
  context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, value]) => [key, value.path])),
  required_inputs_loaded: context.required_inputs_loaded,
  pensum_module_ids: context.selected_curriculum.module_ids,
  emne_ids: context.selected_curriculum.emne_ids,
  topic_hook_ids: context.selected_curriculum.topic_hook_ids,
  method_ids: context.selected_curriculum.method_ids,
  thinker_ids: context.selected_curriculum.thinker_ids,
  works: context.selected_curriculum.works,
  source_review_status: context.source_review_status,
  existing_quiz_audit: existingAudit,
  profile_decision: profileDecision,
  held_back_candidates: context.held_back_candidates,
  normal_opening_questions: 14,
  theory_start_phase: "final",
  method_start_phase: "bridge"
};
write(quizFile, {
  targetId: placeId,
  categoryId,
  generator_version: "v5_1_external_priority_normal_4x7",
  size_class: "normal",
  sets,
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, value]) => [id, value.url])),
  production_context: packageContext
});

const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter((entry) => entry?.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
quizManifest.sets.sort((a, b) => String(a.targetId).localeCompare(String(b.targetId)));
write("data/quiz/manifest.json", quizManifest);

console.log("Stortorget canonical quiz production materialized: normal_4x7");
