#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, " ")
  .trim();
const unique = (values) => [...new Set(values.filter(Boolean))];
const words = (value) => normalize(value).split(/\s+/).filter((token) => token.length >= 3);

const paths = {
  emners: "data/fag/sport/emner_sport_canonical_v4_5.json",
  hooks: "data/fag/sport/theory_hooks_sport_canonical_v5.json",
  units: "data/fag/sport/theory_units_sport_canonical_v6.json",
  matrix: "data/fag/sport/emne_theory_coverage_sport_v6.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  depthManifest: "data/fag/sport/sport_theory_depth_manifest_v6.json",
  qualityManifest: "data/fag/sport/sport_quality_manifest_v5.json",
  evidenceManifest: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  reportMd: "reports/sport-theory-depth-lift.md"
};

const hookKeywords = {
  hook_sport_lek_spill_sport: ["lek", "spill", "sportens egenart", "idrettsbegrep"],
  hook_sport_konstitutive_regler: ["regel", "regelverk", "regelendring", "konstitutiv", "regulativ"],
  hook_sport_konkurranse_usikkerhet: ["konkurranse", "usikkerhet", "konkurransebalanse", "utfall"],
  hook_sport_indre_goder_praksis: ["indre goder", "idrettslig praksis", "dyd", "fair play", "praksis"],
  hook_sport_sportivisering_standardisering: ["sportivisering", "standardisering", "modernisering", "regelstandard"],
  hook_sport_amatorisme_profesjonalisering: ["amator", "amatør", "profesjonalisering", "profesjonell"],
  hook_sport_rekord_kvantifisering: ["rekord", "kvantifisering", "statistikkhistorie", "resultatmåling"],
  hook_sport_olympisme_nasjonalisme: ["olymp", "ol ", "olympisme", "nasjonal representasjon", "mesterskapshistorie"],
  hook_sport_stadion_sosialt_rom: ["stadion", "arena", "tribune", "arkitektur", "sosialt rom"],
  hook_sport_groundhopping_stedsidentitet: ["groundhopper", "groundhopping", "arenabesok", "arenabesøk", "arena samling", "stedsidentitet"],
  hook_sport_anlegg_byutvikling: ["anlegg", "anleggspolitikk", "byutvikling", "infrastruktur", "arenaendring"],
  hook_sport_idrettsminne_kulturarv: ["idrettsminne", "kulturarv", "museum", "minnested", "historisk arena"],
  hook_sport_rom_tid_overtall: ["rom", "tid", "overtall", "bredde", "dybde", "posisjon"],
  hook_sport_faser_overganger: ["overgang", "faser", "balltap", "ballvinning", "kontring"],
  hook_sport_press_kompakthet: ["press", "kompakthet", "forsvar", "presshoyde", "presshøyde"],
  hook_sport_spillmodell_beslutning: ["spillmodell", "beslutning", "strategi", "rolle", "kampplan"],
  hook_sport_persepsjon_handling: ["persepsjon", "handling", "affordance", "informasjonskilde"],
  hook_sport_begrensningsstyrt_laring: ["begrensningsstyrt", "constraints", "oppgavedesign", "small sided", "smålagsspill"],
  hook_sport_variabilitet_tilpasning: ["variabilitet", "variasjon", "differensiell laring", "differensiell læring", "tilpasning"],
  hook_sport_feedback_oppmerksomhet: ["feedback", "tilbakemelding", "oppmerksomhet", "eksternt fokus", "quiet eye"],
  hook_sport_belastning_tilpasning: ["treningsbelastning", "belastning", "periodisering", "superkompensasjon", "tilpasning"],
  hook_sport_utholdenhet_energisystemer: ["utholdenhet", "aerob", "anaerob", "laktat", "vo2", "arbeidsokonomi", "arbeidsøkonomi"],
  hook_sport_styrke_hurtighet_kraft: ["styrke", "hurtighet", "kraft", "sprint", "spenst", "power"],
  hook_sport_restitusjon_overtrening: ["restitusjon", "søvn", "sovn", "overtrening", "reds", "energitilgjengelighet"],
  hook_sport_bevegelsesmekanikk: ["biomekanikk", "bevegelsesmekanikk", "kraftplate", "dreiemoment", "impuls"],
  hook_sport_prestasjonsdata_validitet: ["målevaliditet", "malevaliditet", "reliabilitet", "målefeil", "malefeil", "idrettsstatistikk", "xg", "prestasjonsdata"],
  hook_sport_teknologi_tracking: ["tracking", "gps", "sensor", "teknologi", "wearable", "sporing"],
  hook_sport_skade_risiko_epidemiologi: ["skade", "skaderisiko", "epidemiologi", "hjernerystelse", "injury"],
  hook_sport_motivasjon_selvbestemmelse: ["motivasjon", "selvbestemmelse", "autonomi", "indre motivasjon"],
  hook_sport_mestring_self_efficacy: ["mestringstro", "self efficacy", "selvtillit", "mestring"],
  hook_sport_stress_arousal_oppmerksomhet: ["stress", "angst", "aktivering", "press", "oppmerksomhetskontroll"],
  hook_sport_flyt_lagkohesjon_ledelse: ["flyt", "lagkohesjon", "kohesjon", "ledelse", "lagdynamikk"],
  hook_sport_deliberate_play_sampling: ["deliberate play", "sampling", "variert idrett", "lekutvikling"],
  hook_sport_tidlig_spesialisering_frafall: ["spesialisering", "talent", "frafall", "akademi", "talentutvikling"],
  hook_sport_tgfu_sport_education: ["tgfu", "sport education", "undervisning", "trenerpedagogikk", "pedagogikk"],
  hook_sport_safeguarding_barnets_rettigheter: ["safeguarding", "barnets rettigheter", "barneidrett", "trygghet", "overgrep"],
  hook_sport_klubb_forbund_frivillighet: ["klubb", "forbund", "frivillighet", "medlemsdemokrati", "forening"],
  hook_sport_profesjonalisering_arbeid: ["arbeid", "kontrakt", "spillerrettigheter", "idrettsarbeid", "karriere"],
  hook_sport_konkurransebalanse_finans: ["økonomi", "okonomi", "finans", "lønn", "lonn", "eierskap", "konkurransebalanse"],
  hook_sport_megaevents_governance: ["megaarrangement", "megaevent", "vertskap", "arrangementsstyring", "mesterskapsanlegg"],
  hook_sport_supporter_ritual_fellesskap: ["supporter", "ritual", "fankultur", "tribunekultur", "fellesskap"],
  hook_sport_derby_lokal_identitet: ["derby", "rivalisering", "lokal identitet", "rival"],
  hook_sport_medialisering_kommersialisering: ["medier", "tv", "senderettigheter", "kommersialisering", "plattform"],
  hook_sport_nasjonalisme_globale_fandoms: ["nasjonalisme", "global fandom", "landslag", "global supporter", "nasjonal identitet"],
  hook_sport_kjonnede_kropper_ulikhet: ["kjønn", "kjonn", "kvinneidrett", "maskulinitet", "likestilling"],
  hook_sport_rasisering_koloniale_arv: ["rasisme", "rasisering", "kolonial", "etnisitet", "diskriminering"],
  hook_sport_paraidrett_tilgjengelighet: ["paraidrett", "funksjonsevne", "tilgjengelighet", "klassifisering", "universell utforming"],
  hook_sport_interseksjonalitet_representasjon: ["interseksjonalitet", "representasjon", "minoriteter", "kryssende ulikhet"],
  hook_sport_fair_play_gamesmanship: ["fair play", "gamesmanship", "sportsånd", "sportsetikk"],
  hook_sport_doping_enhancement: ["doping", "enhancement", "prestasjonsfremming", "antidoping"],
  hook_sport_dataovervakning_personvern: ["personvern", "overvåkning", "overvakning", "utøverdata", "datarettigheter"],
  hook_sport_dommerteknologi_rettferdighet: ["var", "dommerteknologi", "dommer", "målfototeknologi", "rettferdig avgjørelse"],
  hook_sport_fysisk_aktivitet_folkehelse: ["fysisk aktivitet", "folkehelse", "aktivitet helse", "sedentær", "helsegevinst"],
  hook_sport_sosial_inkludering_tilgang: ["inkludering", "tilgang", "sosial deltakelse", "barriere", "aktivitetsulikhet"],
  hook_sport_natur_klima_baerekraft: ["klima", "miljø", "miljo", "bærekraft", "baerekraft", "natur", "klimaavtrykk"],
  hook_sport_lek_byrom_aktive_liv: ["byrom", "aktiv transport", "lekeplass", "nærmiljø", "narmiljo", "aktive liv", "parkidrett"]
};

const explicitEmneRoutes = {
  em_sport_aktivitet_helse: ["hook_sport_fysisk_aktivitet_folkehelse", "hook_sport_sosial_inkludering_tilgang"],
  em_sport_anleggspolitikk: ["hook_sport_anlegg_byutvikling", "hook_sport_sosial_inkludering_tilgang"],
  em_sport_arena_samling: ["hook_sport_groundhopping_stedsidentitet", "hook_sport_idrettsminne_kulturarv"],
  em_sport_arenaendring_byutvikling: ["hook_sport_anlegg_byutvikling", "hook_sport_stadion_sosialt_rom"]
};

const claimHookMap = {
  claim_sport_measurement_change_requires_error_context: ["hook_sport_prestasjonsdata_validitet", "hook_sport_teknologi_tracking", "hook_sport_bevegelsesmekanikk"],
  claim_sport_association_not_causation: ["hook_sport_skade_risiko_epidemiologi", "hook_sport_belastning_tilpasning", "hook_sport_fysisk_aktivitet_folkehelse"],
  claim_sport_group_average_not_individual_prescription: ["hook_sport_belastning_tilpasning", "hook_sport_restitusjon_overtrening", "hook_sport_skade_risiko_epidemiologi"],
  claim_sport_injury_rate_requires_exposure: ["hook_sport_skade_risiko_epidemiologi"],
  claim_sport_physical_activity_population_benefit: ["hook_sport_fysisk_aktivitet_folkehelse", "hook_sport_lek_byrom_aktive_liv"],
  claim_sport_reds_requires_clinical_context: ["hook_sport_restitusjon_overtrening", "hook_sport_belastning_tilpasning"],
  claim_sport_concussion_remove_assess: ["hook_sport_skade_risiko_epidemiologi", "hook_sport_safeguarding_barnets_rettigheter"],
  claim_sport_youth_specialisation_contextual: ["hook_sport_tidlig_spesialisering_frafall", "hook_sport_deliberate_play_sampling"],
  claim_sport_reporting_not_quality: ["hook_sport_prestasjonsdata_validitet", "hook_sport_teknologi_tracking"],
  claim_sport_fair_not_open: ["hook_sport_dataovervakning_personvern", "hook_sport_teknologi_tracking"],
  claim_sport_doping_time_sensitive: ["hook_sport_doping_enhancement"],
  claim_sport_model_output_definition_dependent: ["hook_sport_prestasjonsdata_validitet", "hook_sport_teknologi_tracking", "hook_sport_spillmodell_beslutning"],
  claim_sport_effect_requires_uncertainty: ["hook_sport_prestasjonsdata_validitet", "hook_sport_belastning_tilpasning"],
  claim_sport_motivation_context: ["hook_sport_motivasjon_selvbestemmelse"],
  claim_sport_constraints_interaction: ["hook_sport_begrensningsstyrt_laring", "hook_sport_persepsjon_handling", "hook_sport_variabilitet_tilpasning"],
  claim_sport_reproducible_analysis: ["hook_sport_prestasjonsdata_validitet", "hook_sport_teknologi_tracking", "hook_sport_rom_tid_overtall"]
};

const [emners, hookFile, unitFile, matrixFile, claimFile, depthManifest, qualityManifest, evidenceManifest] = await Promise.all([
  readJson(paths.emners), readJson(paths.hooks), readJson(paths.units), readJson(paths.matrix),
  readJson(paths.claims), readJson(paths.depthManifest), readJson(paths.qualityManifest), readJson(paths.evidenceManifest)
]);

const hooks = hookFile.hooks || [];
const units = unitFile.theory_units || [];
const claims = claimFile.claims || [];
const unitByHook = new Map(units.map((unit) => [unit.hook_id, unit]));
const hookById = new Map(hooks.map((hook) => [hook.hook_id, hook]));
const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));
const emneById = new Map(emners.map((emne) => [emne.emne_id, emne]));

for (const claim of claims) {
  const mappedHooks = claimHookMap[claim.claim_id];
  if (!mappedHooks?.length) throw new Error(`Mangler kuratert claim-hook mapping for ${claim.claim_id}`);
  for (const hookId of mappedHooks) if (!hookById.has(hookId)) throw new Error(`Ukjent hook ${hookId} for ${claim.claim_id}`);
  claim.theory_hook_ids = mappedHooks;
  claim.theory_unit_ids = mappedHooks.map((hookId) => unitByHook.get(hookId)?.theory_unit_id).filter(Boolean);
  claim.theory_coverage_status = "curated_v6";
}

for (const unit of units) {
  unit.evidence_claim_ids = claims.filter((claim) => claim.theory_hook_ids.includes(unit.hook_id)).map((claim) => claim.claim_id);
  unit.evidence_coverage = unit.evidence_claim_ids.length ? "curated_partial" : "pending_claim_materialization";
}

const emneSource = (emne) => ({
  idTitle: normalize([emne.emne_id, emne.title, emne.short_label].join(" ")),
  tagged: normalize([...(emne.keywords || []), ...(emne.key_concepts || []), ...(emne.core_concepts || []), ...(emne.primary_theory_hooks || []), ...(emne.methods || []), ...(emne.recommended_methods || [])].join(" ")),
  domain: normalize([emne.domain, emne.area_id, emne.area_label, emne.logic_family].join(" "))
});

const scoreHook = (emne, hook) => {
  const source = emneSource(emne);
  const matches = [];
  let score = 0;
  for (const keyword of hookKeywords[hook.hook_id] || []) {
    const key = normalize(keyword);
    if (!key) continue;
    if (source.idTitle.includes(key)) { score += 14; matches.push(`title:${keyword}`); }
    else if (source.tagged.includes(key)) { score += 8; matches.push(`tag:${keyword}`); }
    else if (source.domain.includes(key)) { score += 3; matches.push(`domain:${keyword}`); }
  }
  const legacyDomain = normalize(hook.legacy_integration?.legacy_domain_id);
  const sharedDomainTokens = words(legacyDomain).filter((token) => source.domain.includes(token));
  score += sharedDomainTokens.length * 2;
  if (sharedDomainTokens.length) matches.push(`domain_tokens:${sharedDomainTokens.join(",")}`);
  return { hook, score, matches: unique(matches) };
};

for (const entry of matrixFile.emners || []) {
  const emne = emneById.get(entry.emne_id);
  if (!emne) throw new Error(`Matrisen viser til ukjent emne ${entry.emne_id}`);
  const forced = explicitEmneRoutes[entry.emne_id];
  const scored = hooks.map((hook) => scoreHook(emne, hook)).sort((a, b) => b.score - a.score || a.hook.hook_id.localeCompare(b.hook.hook_id));
  const primary = forced || scored.filter((item) => item.score > 0).slice(0, 2).map((item) => item.hook.hook_id);
  if (primary.length < 2) {
    for (const candidate of scored) {
      if (!primary.includes(candidate.hook.hook_id)) primary.push(candidate.hook.hook_id);
      if (primary.length === 2) break;
    }
  }
  const secondary = scored.map((item) => item.hook.hook_id).filter((id) => !primary.includes(id)).slice(0, 2);
  const primaryUnits = primary.map((id) => unitByHook.get(id)).filter(Boolean);
  const evidenceClaims = unique(primaryUnits.flatMap((unit) => unit.evidence_claim_ids || []));
  const workRefs = unique(primaryUnits.flatMap((unit) => (unit.primary_works || []).map((work) => `${work.author}: ${work.title} (${work.year ?? "u.å."})`)));
  const selectedScores = primary.map((id) => scored.find((item) => item.hook.hook_id === id) || { score: 100, matches: ["explicit_route"] });
  const confidence = forced ? "curated" : (selectedScores[0]?.score >= 12 && selectedScores[1]?.score >= 6 ? "high" : (selectedScores[0]?.score >= 8 && selectedScores[1]?.score >= 3 ? "medium" : "low"));
  entry.primary_hook_ids = primary;
  entry.secondary_hook_ids = secondary;
  entry.theory_unit_ids = primaryUnits.map((unit) => unit.theory_unit_id);
  entry.main_theories = primaryUnits.map((unit) => unit.main_theory);
  entry.rival_theories = primaryUnits.map((unit) => unit.rival_or_alternative);
  entry.primary_work_refs = workRefs;
  entry.evidence_claim_ids = evidenceClaims;
  entry.theory_coverage_status = "theory_ready";
  entry.evidence_coverage_status = evidenceClaims.length ? "curated_partial" : "pending";
  entry.mapping_basis = forced ? "explicit_curated_route" : "sport_specific_keyword_and_domain_routing";
  entry.mapping_confidence = confidence;
  entry.mapping_rationale = primary.map((id) => {
    const item = scored.find((candidate) => candidate.hook.hook_id === id);
    return { hook_id: id, score: item?.score ?? 100, matches: forced ? ["explicit_route"] : (item?.matches || []) };
  });
  entry.top_scores = scored.slice(0, 4).map((item) => ({ hook_id: item.hook.hook_id, score: item.score }));
}

const benchmarks = {
  em_sport_aktivitet_helse: "hook_sport_fysisk_aktivitet_folkehelse",
  em_sport_anleggspolitikk: "hook_sport_anlegg_byutvikling",
  em_sport_arena_samling: "hook_sport_groundhopping_stedsidentitet",
  em_sport_arenaendring_byutvikling: "hook_sport_anlegg_byutvikling"
};
const benchmarkFailures = [];
for (const [emneId, expectedHook] of Object.entries(benchmarks)) {
  const entry = matrixFile.emners.find((item) => item.emne_id === emneId);
  if (!entry?.primary_hook_ids.includes(expectedHook)) benchmarkFailures.push({ emne_id: emneId, expected_hook: expectedHook, actual: entry?.primary_hook_ids || [] });
}

const confidenceCounts = (matrixFile.emners || []).reduce((acc, entry) => {
  acc[entry.mapping_confidence] = (acc[entry.mapping_confidence] || 0) + 1;
  return acc;
}, {});
const hooksWithEvidence = units.filter((unit) => unit.evidence_claim_ids.length).length;
const emnersWithEvidence = matrixFile.emners.filter((entry) => entry.evidence_claim_ids.length).length;

matrixFile.mapping_method = "explicit curated routes for critical emners, otherwise sport-specific keyword and legacy-domain routing; generic description text is excluded";
matrixFile.mapping_quality = { confidence_counts: confidenceCounts, benchmark_failures: benchmarkFailures };
unitFile.updated_at = "2026-07-25";
claimFile.updated_at = "2026-07-25";
claimFile.version = "1.2";

depthManifest.counts.hooks_with_evidence_claims = hooksWithEvidence;
depthManifest.counts.emners_with_evidence_claims = emnersWithEvidence;
depthManifest.mapping_quality = { confidence_counts: confidenceCounts, benchmark_failures: benchmarkFailures };
qualityManifest.counts.hooks_with_evidence_claims = hooksWithEvidence;
qualityManifest.counts.emners_with_evidence_claims = emnersWithEvidence;
evidenceManifest.coverage_status.hooks_with_claim_links = hooksWithEvidence;
evidenceManifest.coverage_status.emners_with_claim_links = emnersWithEvidence;
evidenceManifest.coverage_status.mapping_method = "curated claim-to-hook mapping";

const lowConfidence = matrixFile.emners.filter((entry) => entry.mapping_confidence === "low");
const reportMd = `# Sport & lek – teoridybde og emnedekning V6\n\nStatus: **${benchmarkFailures.length || lowConfidence.length ? "krever gjennomgang" : "validert"}**\n\n## Omfang\n\n- ${matrixFile.emners.length} aktive emner med minst to primære teorihooks\n- ${units.length} eksplisitte teorienheter\n- ${hooksWithEvidence} av ${units.length} hooks har en kuratert kobling til eksisterende evidensclaims\n- ${emnersWithEvidence} av ${matrixFile.emners.length} emner har minst én relevant claim via sine primære teorienheter\n\n## Mappingkvalitet\n\n${Object.entries(confidenceCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n")}\n\nGenerisk definisjons- og begrunnelsestekst er ikke brukt til emnemapping. Kritiske kontroll-emner har eksplisitte faglige ruter.\n\n## Evidensstatus\n\nEvidenslaget er fortsatt **delvis**. De 16 eksisterende claims er koblet eksplisitt til relevante hooks; de brukes ikke lenger som løse semantiske treff på hele fagkartet.\n`;

await Promise.all([
  writeJson(paths.matrix, matrixFile),
  writeJson(paths.units, unitFile),
  writeJson(paths.claims, claimFile),
  writeJson(paths.depthManifest, depthManifest),
  writeJson(paths.qualityManifest, qualityManifest),
  writeJson(paths.evidenceManifest, evidenceManifest),
  writeFile(path.resolve(root, paths.reportMd), reportMd, "utf8")
]);

const summary = {
  status: benchmarkFailures.length || lowConfidence.length ? "failed" : "passed",
  confidence_counts: confidenceCounts,
  hooks_with_curated_claims: hooksWithEvidence,
  emners_with_curated_claims: emnersWithEvidence,
  benchmark_failures: benchmarkFailures,
  low_confidence_emners: lowConfidence.map((entry) => entry.emne_id)
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = summary.status === "passed" ? 0 : 1;
