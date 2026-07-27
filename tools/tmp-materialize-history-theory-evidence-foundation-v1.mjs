#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const A = (value) => Array.isArray(value) ? value : [];

const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const placeEvidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const coverageContractPath = path.join(historyDir, 'historie_universal_coverage_contract_v1.json');
const theoryContractPath = path.join(historyDir, 'theory_evidence_historie_contract_v1.json');
const theoryRegistryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const universalAuditPath = path.join(root, 'tools/audit-historie-universal-coverage.mjs');
const temporaryScriptPath = path.join(root, 'tools/tmp-materialize-history-theory-evidence-foundation-v1.mjs');
const temporaryWorkflowPath = path.join(root, '.github/workflows/tmp-history-theory-evidence-foundation-v1.yml');

const claimsFile = readJson(claimsPath);
const placeEvidenceFile = readJson(placeEvidencePath);
const claimById = new Map(A(claimsFile.claims).map((claim) => [claim.claim_id, claim]));
const evidenceByClaim = new Map(A(placeEvidenceFile.evidence_links).map((link) => [link.claim_id, link]));

const theoryContract = {
  schema_version: '1.0',
  contract_id: 'theory_evidence_historie_v1',
  subject_id: 'historie',
  status: 'canonical_pilot_contract',
  purpose: 'Kvalifisere Historie-teoriobjekter gjennom eksplisitte koblinger til validerte claims, kilder, cases, steder og place evidence uten å omskrive den frosne V5.5-teoribasen.',
  authority: {
    frozen_theory_definitions: 'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
    evidence_status_registry: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
    claims_registry: 'data/fag/historie/claims_historie_canonical_v1.json',
    sources_registry: 'data/fag/historie/sources_historie_canonical_v1.json',
    place_evidence_registry: 'data/fag/historie/place_evidence_historie_v1.json'
  },
  qualification_thresholds: {
    minimum_claims: 3,
    minimum_sources: 2,
    minimum_cases: 2,
    minimum_places: 2,
    minimum_claim_types: 2,
    minimum_temporal_anchors: 2,
    minimum_source_limitations: 2,
    minimum_entry_limitations: 2,
    minimum_alternative_interpretations: 1,
    minimum_disconfirmation_conditions: 1,
    minimum_rationale_characters: 120
  },
  required_status: {
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal'
  },
  pilot_completion: {
    minimum_qualifying_theories: 10,
    total_theories_in_universal_model: 230,
    universal_completion_ratio: 1
  },
  interpretation_rules: [
    'Evidence-ready means contract-valid documented application, not proof that a theory is universally true.',
    'The frozen V5.5 theory object remains evidence_ready=false; V6 status is owned only by the separate evidence registry.',
    'A single place, claim, case or source can never qualify a theory object.',
    'Geographic pilot evidence must state its scope and cannot silently universalize Oslo/Akershus findings.',
    'Claims, source limitations, uncertainty and alternative interpretations remain authoritative in their canonical registries.'
  ]
};

const blueprints = [
  {
    theory_id: 'theory_his_periodisering_epoker',
    claim_ids: ['claim_his_hovedoya_kloster_founded_1147', 'claim_his_eidsvollsbygningen_constitution_1814', 'claim_his_bispelokket_completed_1967_traffic_machine', 'claim_his_22_juli_center_documents_attacks_and_democracy'],
    rationale: 'De fire claimene viser hvordan historisk analyse bruker forskjellige dateringsgrenser og epokemarkører for middelalder, 1814, etterkrigsmodernisme og samtidshistorie. Sammen gjør de periodisering til et eksplisitt analytisk valg fremfor en naturlig tidsinndeling.',
    limitations: ['Casene dekker bare utvalgte norske institusjons- og stedshistorier og kan ikke etablere universelle epokegrenser.', 'Daterte hendelser viser overgangspunkter, men forklarer ikke alene hvorfor periodene bør avgrenses akkurat der.'],
    alternative_interpretations: ['De samme forløpene kan periodiseres etter politiske vedtak, materiell omforming, institusjonsbruk eller minnekultur og vil da få ulike bruddpunkt.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom tidsgrensene ikke endrer hva analysen synliggjør, eller dersom claimene bare grupperes kronologisk uten en begrunnet analytisk forskjell.']
  },
  {
    theory_id: 'theory_his_brudd_kontinuitet',
    claim_ids: ['claim_his_hovedoya_kloster_burned_1532_material_trace', 'claim_his_villa_grande_transformed_to_hl_center', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel'],
    rationale: 'Brannen på Hovedøya, den kritiske ombruken av Villa Grande og rivningen av Bispelokket viser tre forskjellige forhold mellom brudd og videreføring: institusjonsfall med materielle rester, meningsomforming av et belastet sted og fysisk fjerning som samtidig viderefører byutviklings- og maktstrukturer.',
    limitations: ['Synlig fysisk endring må ikke likestilles med full sosial eller institusjonell diskontinuitet.', 'Casene har svært ulike tidsløp og aktørfelt; sammenligningen må derfor brukes analytisk og ikke som identiske prosesser.'],
    alternative_interpretations: ['Hvert case kan leses som et tydelig brudd, men også som selektiv kontinuitet gjennom materialitet, eierskap, institusjoner eller ettertidens fortellinger.'],
    disconfirmation_conditions: ['Rammen mister forklaringskraft dersom analysen ikke kan identifisere hva som faktisk videreføres gjennom det påståtte bruddet.']
  },
  {
    theory_id: 'theory_his_tidslag_samtidighet',
    claim_ids: ['claim_his_akershus_festning_occupation_memory_layers', 'claim_his_hovedoya_kloster_burned_1532_material_trace', 'claim_his_villa_grande_transformed_to_hl_center'],
    rationale: 'Akershus festning, Hovedøya kloster og Villa Grande samler materielle rester, skiftende funksjoner og senere minnearbeid på samme sted. Claimene gjør det mulig å skille mellom opprinnelig bruk, senere omforming og dagens fortolkende institusjoner i stedet for å behandle alle synlige lag som samtidige.',
    limitations: ['Dagens synlige eller formidlede lag er selektert gjennom restaurering, vern og institusjonell historiebruk.', 'Stedlig sameksistens dokumenterer ikke at funksjonene eller aktørgruppene eksisterte samtidig.'],
    alternative_interpretations: ['Lagene kan leses som kumulativ historie, men også som aktive konflikter der senere bruk overskriver, demper eller fremhever bestemte fortider.'],
    disconfirmation_conditions: ['Tidslagsanalysen svekkes dersom de materielle og fortellende lagene ikke kan dateres eller skilles fra senere rekonstruksjoner.']
  },
  {
    theory_id: 'theory_his_lang_varighet_strukturer',
    claim_ids: ['claim_his_akerselva_industrial_energy_axis', 'claim_his_akerselva_environmental_reuse_from_1986', 'claim_his_folkets_hus_first_opened_1907', 'claim_his_folkets_hus_current_complex_1958_1962'],
    rationale: 'Akerselvas langvarige rolle som energi-, produksjons- og senere miljø- og ombruksakse kan sammenholdes med Folkets Hus som varig organisatorisk infrastruktur. Claimene viser hvordan landskap, institusjoner og kollektive ressurser setter rammer gjennom flere hendelser og byggeperioder.',
    limitations: ['Lang varighet må knyttes til konkrete mekanismer som vannkraft, organisasjon, eierskap og institusjonell kapasitet.', 'Perspektivet kan undervurdere konflikter, enkeltaktører og raske beslutninger som endret utviklingsbanene.'],
    alternative_interpretations: ['Kontinuiteten kan forstås som robuste strukturer, men også som gjentatt politisk og økonomisk reproduksjon som kunne ha fått andre utfall.'],
    disconfirmation_conditions: ['Rammen svekkes dersom de påståtte strukturene ikke kan følges gjennom sammenlignbare kilder eller dersom kontinuiteten bare skyldes svært brede kategorier.']
  },
  {
    theory_id: 'theory_his_hendelse_prosess',
    claim_ids: ['claim_his_eidsvollsbygningen_constitution_1814', 'claim_his_eidsvollsbygningen_national_monument_1837', 'claim_his_bispelokket_completed_1967_traffic_machine', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel'],
    rationale: 'Riksforsamlingen i 1814 og den senere institusjonaliseringen av Eidsvollsbygningen som nasjonalmonument viser forskjellen mellom hendelse og etterfølgende prosess. Bispelokkets ferdigstillelse og rivning viser tilsvarende at et avgrenset teknisk punkt inngår i lengre plan-, bruk- og omformingsforløp.',
    limitations: ['Tidsrekkefølge mellom claimene dokumenterer ikke automatisk en direkte årsakskjede.', 'Utvalgte start- og sluttpunkt kan gjøre åpne historiske forløp mer lineære enn de var for samtidens aktører.'],
    alternative_interpretations: ['1814 og Bispelokkets rivning kan beskrives som vendepunkt, men konsekvensene avhenger av hvilke institusjonelle, materielle og sosiale prosesser som følges videre.'],
    disconfirmation_conditions: ['Modellen svekkes dersom mellomleddene mellom hendelse og påstått konsekvens ikke kan dokumenteres med egne claims og kilder.']
  },
  {
    theory_id: 'theory_his_rytmer_tempo',
    claim_ids: ['claim_his_oslo_radhus_architects_arneberg_poulsson', 'claim_his_oslo_radhus_opened_1950_05_15', 'claim_his_akerselva_industrial_energy_axis', 'claim_his_akerselva_environmental_reuse_from_1986'],
    rationale: 'Rådhusets lange konkurranse-, omarbeidings- og byggeforløp kan sammenlignes med Akerselvas flerhundreårige produksjonsutvikling og senere miljøomforming. Claimene viser at arkitektur, teknologi, institusjonsbygging og miljøpolitikk følger forskjellige tempo selv innenfor moderniseringsfortellinger.',
    limitations: ['En åpningsdato eller startdato sier ikke når en endring ble sosialt utbredt eller fullt virksom.', 'Tempo må spesifiseres for bestemte sektorer, steder og aktører og kan ikke beskrives som én felles samfunnshastighet.'],
    alternative_interpretations: ['Forløpene kan leses som akselererende modernisering, men også som forsinkelser, omkamper og ujevne rytmer mellom teknikk, politikk og hverdagsliv.'],
    disconfirmation_conditions: ['Rammen svekkes dersom sammenligningen ikke kan vise målbare eller dokumenterte forskjeller i tempo mellom de valgte prosessene.']
  },
  {
    theory_id: 'theory_his_kronologi_datering',
    claim_ids: ['claim_his_akershus_festning_medieval_state_center', 'claim_his_hovedoya_kloster_founded_1147', 'claim_his_eidsvollsbygningen_constitution_1814', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel'],
    rationale: 'Claimene kombinerer en omtrentlig middelaldersk byggestart, et etablert grunnleggelsesår, et presist datert politisk forløp og en flerårig rivningsprosess. De gjør det mulig å kontrollere at kronologisk presisjon følger kildenes faktiske oppløsning og at ulike dateringsnivåer ikke blandes.',
    limitations: ['Presise datoer må ikke gis større forklaringsverdi enn kildene og problemstillingen tillater.', 'Omtrentlige dateringer kan støtte rekkefølge og periodeplassering uten å støtte en eksakt hendelsesdag.'],
    alternative_interpretations: ['Den samme kronologien kan organiseres rundt institusjonsvedtak, materiell bygging, faktisk bruk eller senere minnefesting.'],
    disconfirmation_conditions: ['Modellen svekkes dersom registeret presenterer høyere presisjon enn kildene støtter eller skjuler motstridende dateringer.']
  },
  {
    theory_id: 'theory_his_samtid_ettertid_fortelling',
    claim_ids: ['claim_his_22_juli_center_documents_attacks_and_democracy', 'claim_his_22_juli_center_akersgata42_site_connection', 'claim_his_eidsvollsbygningen_national_monument_1837', 'claim_his_akershus_festning_occupation_memory_layers'],
    rationale: '22. juli-senteret, Eidsvollsbygningen og Akershus festning viser hvordan senere institusjoner ordner hendelser, steder og aktører i offentlige fortellinger. Claimene skiller mellom det som skjedde, stedets dokumenterte forbindelse og ettertidens valg av ramme, minneform og pedagogisk formål.',
    limitations: ['Et minne- eller læringssenter dokumenterer institusjonens fortolkning og mandat, ikke alle samtidige erfaringer.', 'Senere nasjonale fortellinger kan skape sammenheng ved å velge bestemte startpunkt, sluttpunkt og representerte stemmer.'],
    alternative_interpretations: ['Institusjonene kan styrke offentlig kunnskap og demokratisk minne, men kan også stabilisere bestemte kanoner og marginalisere alternative erfaringer.'],
    disconfirmation_conditions: ['Rammen svekkes dersom samtidige kilder og ettertidens formidling ikke holdes analytisk adskilt.']
  },
  {
    theory_id: 'theory_his_kildekritikk',
    claim_ids: ['claim_his_akershus_festning_medieval_state_center', 'claim_his_gamle_deichman_planned_fotohuset_reuse', 'claim_his_22_juli_center_documents_attacks_and_democracy'],
    rationale: 'De valgte claimene bygger på ulike kildefunksjoner: institusjonell og leksikalsk rekonstruksjon av middelalderhistorie, prosjektkilder om planlagt framtidig ombruk og en institusjons egen beskrivelse av mandat. Sammen krever de kontroll av opphav, formål, tidsposisjon og hva kilden faktisk kan belegge.',
    limitations: ['Kildens institusjonelle opphav avgjør ikke alene om opplysningen er korrekt eller feil.', 'Planlagt framtidig bruk må holdes adskilt fra realisert historisk utvikling og merkes med den usikkerheten kildetypen innebærer.'],
    alternative_interpretations: ['Offisielle kilder kan være best for mandat, planer og nåværende funksjon, mens uavhengige kilder er nødvendig for konflikt, virkninger og historisk kontekst.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom claimenes kildebegrensninger ikke påvirker formulert sikkerhet, tidsform eller behovet for kontrollkilder.']
  },
  {
    theory_id: 'theory_his_spor_materialitet',
    claim_ids: ['claim_his_hovedoya_kloster_burned_1532_material_trace', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel', 'claim_his_22_juli_center_akersgata42_site_connection', 'claim_his_oslo_radhus_pipervika_transformation'],
    rationale: 'Ruinene på Hovedøya, fraværet etter Bispelokket, åstedstilknytningen i Akersgata og omformingen av Pipervika viser fire forskjellige materielle kildesituasjoner: bevart rest, fjernet struktur, stedbundet hendelsesspor og bylandskap erstattet av ny monumental orden.',
    limitations: ['Materielle spor kan dokumentere aktivitet og endring, men identifiserer ikke alene motiv, ansvar eller sosial betydning.', 'Dagens synlige landskap er formet av riving, restaurering, vern og nybygg og kan ikke leses som en uendret historisk overflate.'],
    alternative_interpretations: ['Fravær og ombruk kan være like analytisk viktige som bevarte objekter, men krever arkiv- og kildekontroll for å unngå spekulativ sporlesning.'],
    disconfirmation_conditions: ['Modellen svekkes dersom forbindelsen mellom dagens materialitet og den historiske prosessen ikke kan dokumenteres gjennom proveniens og daterte claims.']
  }
];

const entries = blueprints.map((blueprint) => {
  const claims = blueprint.claim_ids.map((claimId) => {
    const claim = claimById.get(claimId);
    if (!claim) throw new Error(`Missing canonical claim: ${claimId}`);
    return claim;
  });
  const evidenceLinks = claims.map((claim) => {
    const link = evidenceByClaim.get(claim.claim_id);
    if (!link) throw new Error(`Missing place evidence for claim: ${claim.claim_id}`);
    return link;
  });
  return {
    theory_id: blueprint.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: blueprint.claim_ids,
    source_ids: sorted(claims.flatMap((claim) => A(claim.source_ids))),
    case_ids: sorted(claims.flatMap((claim) => A(claim.scope?.case_ids))),
    place_ids: sorted(claims.flatMap((claim) => A(claim.scope?.place_ids))),
    emne_ids: sorted(claims.flatMap((claim) => A(claim.emne_ids))),
    evidence_link_ids: sorted(evidenceLinks.map((link) => link.evidence_id)),
    evidence_dimensions: ['documented_application', 'limitation_test', 'alternative_interpretation', 'multi_case_comparison'],
    rationale: blueprint.rationale,
    limitations: blueprint.limitations,
    alternative_interpretations: blueprint.alternative_interpretations,
    disconfirmation_conditions: blueprint.disconfirmation_conditions,
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier og aktørgrupper.'
  };
});

const registry = {
  schema_version: '1.0',
  registry_id: 'theory_evidence_historie_canonical_v1',
  subject_id: 'historie',
  status: 'active_pilot_production',
  scope: 'v6_theory_to_claim_source_case_evidence_without_mutating_frozen_v5_5_theory_objects',
  completion: {
    total_theories: 230,
    qualifying_entries: entries.length,
    ratio: Math.round((entries.length / 230) * 1000) / 1000,
    pilot_target: 10,
    universal_target_ratio: 1,
    universal_status: 'INCOMPLETE'
  },
  entries
};

writeJson(theoryContractPath, theoryContract);
writeJson(theoryRegistryPath, registry);

const coverageContract = readJson(coverageContractPath);
const theoryCheck = A(coverageContract.production_checks).find((check) => check.id === 'theory_evidence_readiness');
if (!theoryCheck) throw new Error('Missing theory_evidence_readiness production check.');
theoryCheck.type = 'theory_evidence_registry_ratio';
theoryCheck.registry_path = 'data/fag/historie/theory_evidence_historie_canonical_v1.json';
theoryCheck.expected_status = 'evidence_ready';
theoryCheck.minimum_ratio = 1;
theoryCheck.gap_action = 'Utvid det separate theory-evidence-registeret med kontraktvaliderte claims, kilder, alternative fortolkninger og fler-case-koblinger til alle 230 teoriobjekter.';
delete theoryCheck.field;
delete theoryCheck.expected;
writeJson(coverageContractPath, coverageContract);

let auditSource = fs.readFileSync(universalAuditPath, 'utf8');
function replaceOrThrow(search, replacement, label) {
  if (!auditSource.includes(search)) throw new Error(`Could not patch universal audit: ${label}`);
  auditSource = auditSource.replace(search, replacement);
}

replaceOrThrow(
  'function evaluateProductionCheck(check, emner, theories) {',
  'function evaluateProductionCheck(check, emner, theories, theoryEvidenceRegistry) {',
  'production check signature'
);
replaceOrThrow(
  "  } else if (check.type === 'theory_boolean_ratio') {\n    const qualifying = theories.filter((theory) => getPath(theory, check.field) === check.expected);\n    const measuredRatio = ratio(qualifying.length, theories.length);\n    measured = { qualifying: qualifying.length, total: theories.length, ratio: roundRatio(measuredRatio) };\n    passed = measuredRatio >= check.minimum_ratio;",
  "  } else if (check.type === 'theory_evidence_registry_ratio') {\n    const validTheoryIds = new Set(theories.map((theory) => theory.theory_id));\n    const qualifyingIds = unique(A(theoryEvidenceRegistry?.entries)\n      .filter((entry) => entry.status === check.expected_status && validTheoryIds.has(entry.theory_id))\n      .map((entry) => entry.theory_id));\n    const measuredRatio = ratio(qualifyingIds.length, theories.length);\n    measured = { qualifying: qualifyingIds.length, total: theories.length, ratio: roundRatio(measuredRatio), registry_entries: A(theoryEvidenceRegistry?.entries).length };\n    passed = measuredRatio >= check.minimum_ratio;\n  } else if (check.type === 'theory_boolean_ratio') {\n    const qualifying = theories.filter((theory) => getPath(theory, check.field) === check.expected);\n    const measuredRatio = ratio(qualifying.length, theories.length);\n    measured = { qualifying: qualifying.length, total: theories.length, ratio: roundRatio(measuredRatio) };\n    passed = measuredRatio >= check.minimum_ratio;",
  'theory evidence registry production check'
);
replaceOrThrow(
  "    threshold: Object.fromEntries(Object.entries(check).filter(([key]) => key.startsWith('minimum_') || key.startsWith('maximum_') || key === 'expected')),",
  "    threshold: Object.fromEntries(Object.entries(check).filter(([key]) => key.startsWith('minimum_') || key.startsWith('maximum_') || key === 'expected' || key === 'expected_status')),",
  'threshold rendering'
);
replaceOrThrow(
  "const theories = readJson(theoriesPath);\nconst readiness = fs.existsSync(readinessPath) ? readJson(readinessPath) : {};",
  "const theories = readJson(theoriesPath);\nconst theoryEvidenceCheck = coverageContract.production_checks.find((check) => check.type === 'theory_evidence_registry_ratio');\nconst theoryEvidenceRegistryPath = theoryEvidenceCheck?.registry_path ? path.join(root, theoryEvidenceCheck.registry_path) : null;\nconst theoryEvidenceRegistry = theoryEvidenceRegistryPath && fs.existsSync(theoryEvidenceRegistryPath) ? readJson(theoryEvidenceRegistryPath) : { entries: [] };\nconst readiness = fs.existsSync(readinessPath) ? readJson(readinessPath) : {};",
  'theory evidence registry loading'
);
replaceOrThrow(
  'const productionChecks = coverageContract.production_checks.map((check) => evaluateProductionCheck(check, emner, theories));',
  'const productionChecks = coverageContract.production_checks.map((check) => evaluateProductionCheck(check, emner, theories, theoryEvidenceRegistry));',
  'production check invocation'
);
replaceOrThrow(
  "for (const key of ['case_requirements', 'profiles_manifest', 'oslo_akershus_profile']) {",
  "if (theoryEvidenceRegistryPath && fs.existsSync(theoryEvidenceRegistryPath)) fingerprintFiles.push(theoryEvidenceRegistryPath);\nfor (const key of ['case_requirements', 'profiles_manifest', 'oslo_akershus_profile']) {",
  'theory evidence fingerprint'
);
fs.writeFileSync(universalAuditPath, auditSource);

execFileSync(process.execPath, ['--check', 'tools/validate-historie-theory-evidence.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['tools/validate-historie-theory-evidence.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['--check', 'tools/audit-historie-universal-coverage.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['tools/audit-historie-universal-coverage.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['tools/validate-historie-theory-evidence.mjs', '--check'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['tools/audit-historie-universal-coverage.mjs', '--check'], { cwd: root, stdio: 'inherit' });

fs.rmSync(temporaryWorkflowPath, { force: true });
fs.rmSync(temporaryScriptPath, { force: true });
console.log(`Materialized ${entries.length} contract-valid History theory evidence entries.`);
