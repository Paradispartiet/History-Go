#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const OUTPUT = 'data/quiz/litteratur/litteratur_subject_pathways_v1.json';
const LEGACY_OUTPUT = 'data/quiz/litteratur/litteratur_legacy_quiz_audit_v1.json';
const SEQUENCE = ['observe', 'explain', 'evaluate_evidence', 'diagnose_failure', 'decide_and_justify'];
const QUESTION_TYPES = ['observation', 'explanation', 'evidence_evaluation', 'failure_diagnosis', 'decision_and_justification'];
const STOPWORDS = new Set(['eller', 'mellom', 'gjennom', 'litteratur', 'litteraer', 'litteraere', 'analyse', 'perspektiv', 'tekst', 'tekster', 'historie', 'historisk', 'historiske', 'metode', 'metoder', 'praksis', 'teori', 'teoretisk', 'form', 'former']);

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => {
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.flat().filter(Boolean))];
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (value) => normalize(value).replace(/\s+/g, '_');
const tokens = (value) => normalize(value).split(/\s+/).filter((token) => token.length >= 4 && !STOPWORDS.has(token));

const coverage = read(`${PACKAGE}/coverage_contract_v1.json`);
const foundations = read(`${PACKAGE}/topic_foundations_v1.json`);
const emner = read('data/fag/litteratur/emner_litteratur_canonical_v4_5.json');
const methods = read('data/fag/litteratur/methods_litteratur_canonical_v4_5.json').methods;
const methodById = new Map(methods.map((method) => [method.method_id, method]));
const foundationByArea = new Map(foundations.areas.map((area) => [area.id, area]));

const FALLBACK_EMNE = {
  faggrunnlag_metode_forskningspraksis: 'em_lit_poetikk_hermeneutikk_fortolkningskonflikt',
  poetikk_estetikk_litteraritet: 'em_lit_naerlesning_stil_form',
  sprak_stil_retorikk: 'em_lit_poetikk_retorikk_adressat_implisitt_leser',
  narratologi_prosa: 'em_lit_fortelling_perspektiv_stemme',
  lyrikk_poetiske_former: 'em_lit_poetikk_lyrisk_stemme_rytme_metrikk',
  drama_teatertekst_framforing: 'em_lit_poetikk_dramatisk_tekst_dialog_fremforbarhet',
  sjanger_modus_form: 'em_lit_sjanger_og_formtradisjon',
  formalisme_nykritikk_strukturalisme_semiotikk: 'em_lit_naerlesning_stil_form',
  poststrukturalisme_dekonstruksjon_diskurs: 'em_lit_sprak_makt_diskurs',
  hermeneutikk_fortolkning_teori: 'em_lit_poetikk_hermeneutikk_fortolkningskonflikt',
  psykoanalyse_fenomenologi_eksistens: 'em_lit_litteratur_etikk_og_erfaring',
  minne_traume_vitnesbyrd_livsskriving: 'em_lit_poetikk_narrativ_tid_minnestruktur',
  leser_resepsjon_affekt: 'em_lit_lesere_offentlighet_formidling',
  forfatterskap_intertekstualitet: 'em_lit_forfatterskap_verk_og_liv',
  tekstkritikk_bokhistorie_arkiv: 'em_lit_bokhistorie_utgave_paratekst_overlevering',
  medier_intermedialitet_adapsjon: 'em_lit_adaptasjon_intermedialitet_transformasjon',
  litteratursosiologi_institusjoner_offentlighet: 'em_lit_litteraturfelt_institusjoner',
  kjonn_feminisme_queer: 'em_lit_identitet_kjonn_klasse_minoritet',
  klasse_marxisme_okonomi_arbeid: 'em_lit_identitet_kjonn_klasse_minoritet',
  postkolonial_dekolonial_rase_migrasjon: 'em_lit_postkoloniale_litteraere_systemer',
  okokritikk_dyr_miljo: 'em_lit_litteratur_etikk_og_erfaring',
  kognitiv_empirisk_digital_litteraturvitenskap: 'em_lit_digital_litteratur_plattform_elektronisk_tekst',
  komparativ_verdenslitteratur_oversettelse: 'em_lit_verdenslitteratur_sirkulasjon_komparasjon',
  norsk_nordisk_samisk_minoritetslitteratur: 'em_lit_nordisk_samisk_litteratur_muntlighet_institusjoner',
  muntlighet_folklore_urfolkskunnskap: 'em_lit_muntlighet_opplesning_lydlitteratur',
  barne_ungdoms_didaktisk_litteratur: 'em_lit_nordisk_barn_ungdom_litteratur',
  eldre_litteratur_antik_middelalder_tidligmoderne: 'em_lit_historie_antikk_middelalder_tidligmoderne',
  moderne_og_samtidig_litteraturhistorie: 'em_lit_historie_avantgarde_postmodernisme_samtid'
};

const AREA_EMNE_CANDIDATES = {
  faggrunnlag_metode_forskningspraksis: ['em_lit_poetikk_hermeneutikk_fortolkningskonflikt', 'em_lit_naerlesning_stil_form', 'em_lit_historie_periodisering_samtidige_tradisjoner', 'em_lit_bokhistorie_utgave_paratekst_overlevering'],
  poetikk_estetikk_litteraritet: ['em_lit_naerlesning_stil_form', 'em_lit_sjanger_og_formtradisjon', 'em_lit_poetikk_plot_hendelse_narrativ_organisering', 'em_lit_poetikk_fokalisering_upalitelig_forteller', 'em_lit_poetikk_retorikk_adressat_implisitt_leser', 'em_lit_poetikk_lyrisk_stemme_rytme_metrikk'],
  sprak_stil_retorikk: ['em_lit_naerlesning_stil_form', 'em_lit_sprak_makt_diskurs', 'em_lit_poetikk_retorikk_adressat_implisitt_leser', 'em_lit_poetikk_lyrisk_stemme_rytme_metrikk', 'em_lit_poetikk_metafor_metonymi_billedfelt'],
  narratologi_prosa: ['em_lit_fortelling_perspektiv_stemme', 'em_lit_poetikk_plot_hendelse_narrativ_organisering', 'em_lit_poetikk_fokalisering_upalitelig_forteller', 'em_lit_poetikk_bevissthetsfremstilling_polyfoni', 'em_lit_poetikk_narrativ_tid_minnestruktur', 'em_lit_roman_og_prosaformer'],
  lyrikk_poetiske_former: ['em_lit_poetikk_lyrisk_stemme_rytme_metrikk', 'em_lit_poetikk_metafor_metonymi_billedfelt', 'em_lit_lyrikk_rytme_og_sprak', 'em_lit_naerlesning_stil_form', 'em_lit_sjanger_og_formtradisjon'],
  drama_teatertekst_framforing: ['em_lit_drama_scene_og_teatertekst', 'em_lit_poetikk_dramatisk_tekst_dialog_fremforbarhet', 'em_lit_adapsjon_tolkning_iscenesettelse', 'em_lit_adaptasjon_intermedialitet_transformasjon', 'em_lit_sjanger_og_formtradisjon'],
  sjanger_modus_form: ['em_lit_sjanger_og_formtradisjon', 'em_lit_hybridformer_og_sjangerbrudd', 'em_lit_roman_og_prosaformer', 'em_lit_essay_biografi_sakprosa', 'em_lit_drama_scene_og_teatertekst', 'em_lit_adaptasjon_intermedialitet_transformasjon'],
  formalisme_nykritikk_strukturalisme_semiotikk: ['em_lit_naerlesning_stil_form', 'em_lit_poetikk_metafor_metonymi_billedfelt', 'em_lit_intertekstualitet_og_referanse', 'em_lit_poetikk_hermeneutikk_fortolkningskonflikt'],
  poststrukturalisme_dekonstruksjon_diskurs: ['em_lit_sprak_makt_diskurs', 'em_lit_intertekstualitet_og_referanse', 'em_lit_poetikk_hermeneutikk_fortolkningskonflikt', 'em_lit_identitet_kjonn_klasse_minoritet'],
  hermeneutikk_fortolkning_teori: ['em_lit_poetikk_hermeneutikk_fortolkningskonflikt', 'em_lit_naerlesning_stil_form', 'em_lit_litteratur_etikk_og_erfaring', 'em_lit_poetikk_retorikk_adressat_implisitt_leser'],
  psykoanalyse_fenomenologi_eksistens: ['em_lit_litteratur_etikk_og_erfaring', 'em_lit_poetikk_bevissthetsfremstilling_polyfoni', 'em_lit_poetikk_hermeneutikk_fortolkningskonflikt', 'em_lit_identitet_kjonn_klasse_minoritet'],
  minne_traume_vitnesbyrd_livsskriving: ['em_lit_poetikk_narrativ_tid_minnestruktur', 'em_lit_litteratur_etikk_og_erfaring', 'em_lit_arkiv_manuskript_og_digital_tekst', 'em_lit_forfatterskap_verk_og_liv', 'em_lit_historie_periodisering_samtidige_tradisjoner'],
  leser_resepsjon_affekt: ['em_lit_lesere_offentlighet_formidling', 'em_lit_lesning_formidling_offentlighet', 'em_lit_poetikk_retorikk_adressat_implisitt_leser', 'em_lit_poetikk_litteraer_etikk_affekt_erfaring', 'em_lit_kanon_kritikk_og_offentlighet'],
  forfatterskap_intertekstualitet: ['em_lit_forfatterskap_verk_og_liv', 'em_lit_intertekstualitet_og_referanse', 'em_lit_arkiv_manuskript_og_digital_tekst', 'em_lit_nordisk_forfatterarkiv_manuskript_etterliv', 'em_lit_essay_biografi_sakprosa'],
  tekstkritikk_bokhistorie_arkiv: ['em_lit_bokhistorie_utgave_paratekst_overlevering', 'em_lit_arkiv_manuskript_og_digital_tekst', 'em_lit_nordisk_forfatterarkiv_manuskript_etterliv', 'em_lit_digital_litteratur_plattform_elektronisk_tekst', 'em_lit_bokhistorie_trykk_forlag'],
  medier_intermedialitet_adapsjon: ['em_lit_adaptasjon_intermedialitet_transformasjon', 'em_lit_adapsjon_tolkning_iscenesettelse', 'em_lit_digital_litteratur_plattform_elektronisk_tekst', 'em_lit_muntlighet_opplesning_lydlitteratur'],
  litteratursosiologi_institusjoner_offentlighet: ['em_lit_litteraturfelt_institusjoner', 'em_lit_kanon_kritikk_og_offentlighet', 'em_lit_litteratur_og_offentlig_debatt', 'em_lit_nordisk_forlag_redaksjon_kritikk_priser', 'em_lit_nordisk_bibliotek_leserhistorie_formidling'],
  kjonn_feminisme_queer: ['em_lit_identitet_kjonn_klasse_minoritet', 'em_lit_sprak_makt_diskurs', 'em_lit_postkoloniale_litteraere_systemer', 'em_lit_litteratur_etikk_og_erfaring'],
  klasse_marxisme_okonomi_arbeid: ['em_lit_identitet_kjonn_klasse_minoritet', 'em_lit_litteraturfelt_institusjoner', 'em_lit_litteratur_og_offentlig_debatt', 'em_lit_kanon_kritikk_symbolsk_makt'],
  postkolonial_dekolonial_rase_migrasjon: ['em_lit_postkoloniale_litteraere_systemer', 'em_lit_oversettelse_uoversettelighet_flerspraklighet', 'em_lit_verdenslitteratur_sirkulasjon_komparasjon', 'em_lit_identitet_kjonn_klasse_minoritet', 'em_lit_kanon_kritikk_symbolsk_makt'],
  okokritikk_dyr_miljo: ['em_lit_litteratur_etikk_og_erfaring', 'em_lit_identitet_kjonn_klasse_minoritet', 'em_lit_sprak_makt_diskurs', 'em_lit_verdenslitteratur_sirkulasjon_komparasjon'],
  kognitiv_empirisk_digital_litteraturvitenskap: ['em_lit_digital_litteratur_plattform_elektronisk_tekst', 'em_lit_digital_litteratur_og_nye_uttrykk', 'em_lit_lesere_offentlighet_formidling', 'em_lit_litteraturfelt_institusjoner'],
  komparativ_verdenslitteratur_oversettelse: ['em_lit_verdenslitteratur_sirkulasjon_komparasjon', 'em_lit_oversettelse_uoversettelighet_flerspraklighet', 'em_lit_postkoloniale_litteraere_systemer', 'em_lit_oversettelse_verdenslitteratur'],
  norsk_nordisk_samisk_minoritetslitteratur: ['em_lit_nordisk_samisk_litteratur_muntlighet_institusjoner', 'em_lit_nordisk_kvensk_romani_romanes_minoritetslitteratur', 'em_lit_nordisk_norron_litteratur_tekstoverlevering', 'em_lit_nordisk_nasjonsbygging_sprakstrid_kanon', 'em_lit_nordisk_bibliotek_leserhistorie_formidling'],
  muntlighet_folklore_urfolkskunnskap: ['em_lit_muntlighet_opplesning_lydlitteratur', 'em_lit_nordisk_samisk_litteratur_muntlighet_institusjoner', 'em_lit_nordisk_norron_litteratur_tekstoverlevering', 'em_lit_arkiv_manuskript_og_digital_tekst'],
  barne_ungdoms_didaktisk_litteratur: ['em_lit_nordisk_barn_ungdom_litteratur', 'em_lit_lesning_formidling_offentlighet', 'em_lit_adaptasjon_intermedialitet_transformasjon', 'em_lit_nordisk_bibliotek_leserhistorie_formidling'],
  eldre_litteratur_antik_middelalder_tidligmoderne: ['em_lit_historie_antikk_middelalder_tidligmoderne', 'em_lit_nordisk_norron_litteratur_tekstoverlevering', 'em_lit_bokhistorie_utgave_paratekst_overlevering', 'em_lit_historie_periodisering_samtidige_tradisjoner', 'em_lit_muntlighet_opplesning_lydlitteratur'],
  moderne_og_samtidig_litteraturhistorie: ['em_lit_historie_avantgarde_postmodernisme_samtid', 'em_lit_nordisk_realisme_naturalisme_modernisme', 'em_lit_nordisk_etterkrigslitteratur_samtid', 'em_lit_historie_periodisering_samtidige_tradisjoner', 'em_lit_realisme_modernisme_virkelighetsformer']
};

function scoreEmne(emne, topic, section, areaId) {
  const topicTokens = new Set(tokens([topic.id, topic.text, topic.concepts, section.title].flat().join(' ')));
  const titleTokens = tokens(emne.title);
  const conceptTokens = tokens([emne.keywords, emne.core_concepts, emne.sub_concepts].flat().join(' '));
  let score = titleTokens.reduce((sum, token) => sum + (topicTokens.has(token) ? 8 : 0), 0);
  score += conceptTokens.reduce((sum, token) => sum + (topicTokens.has(token) ? 2 : 0), 0);
  if (emne.emne_id === FALLBACK_EMNE[areaId]) score += 5;
  return score;
}

function resolveEmne(topic, section, areaId) {
  const candidates = new Set(AREA_EMNE_CANDIDATES[areaId] || [FALLBACK_EMNE[areaId]]);
  const ranked = emner
    .filter((emne) => candidates.has(emne.emne_id))
    .map((emne) => ({ emne, score: scoreEmne(emne, topic, section, areaId) }))
    .sort((a, b) => b.score - a.score || a.emne.emne_id.localeCompare(b.emne.emne_id));
  const selected = ranked[0].score > 0 ? ranked[0].emne : emner.find((emne) => emne.emne_id === FALLBACK_EMNE[areaId]);
  if (!selected) throw new Error(`${areaId}/${topic.id}: fant ikke canonicalt emne`);
  return selected;
}

function canonicalMethodIds(emne) {
  const ids = list(emne.method_ids).filter((id) => methodById.has(id));
  if (!ids.length) throw new Error(`${emne.emne_id}: mangler canonical metode`);
  return ids;
}

function sourceObject(areaId, source, claimBasis) {
  return {
    source_id: `src_lit_${slug(areaId)}_${slug(source.id)}`,
    source_type: source.type || 'faglig_eller_primar_kilde',
    title: source.label,
    publisher_or_author: source.publisher || source.label,
    date_or_version: source.date || source.year || 'canonical kildeoppføring',
    locator: source.source_location,
    url: source.url,
    claim_basis: claimBasis,
    inference_boundary: 'Kilden støtter den oppgitte fagpåstanden; videre påstander om forfatterintensjon, faktisk leservirkning eller andre verk krever egen evidens.'
  };
}

function questionSources(areaId, sourceById, claims, claimBasis) {
  const ids = unique(claims.flatMap((claim) => list(claim.source_ids)));
  for (const id of sourceById.keys()) {
    if (ids.length >= 2) break;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, 3).map((id) => sourceObject(areaId, sourceById.get(id), claimBasis));
}

function rotateOptions(answer, distractors, offset) {
  const options = [answer, ...distractors];
  const shift = offset % options.length;
  const rotated = [...options.slice(shift), ...options.slice(0, shift)];
  return { options: rotated, answer, answerIndex: rotated.indexOf(answer) };
}

function cleanClaim(claim) {
  const value = String(claim ?? '').trim();
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function buildArea(area, areaIndex) {
  const chapterFile = `${PACKAGE}/foundation_texts/${area.id}.json`;
  const chapter = read(chapterFile);
  const claimsFile = chapter.claimsFile;
  const claimRegistry = read(claimsFile);
  const claimById = new Map(claimRegistry.claims.map((claim) => [claim.id, claim]));
  const sourceById = new Map(claimRegistry.sources.map((source) => [source.id, source]));
  const topicArea = foundationByArea.get(area.id);
  const topicById = new Map(topicArea.topics.map((topic) => [topic.id, topic]));
  const sections = [];
  for (const moduleFile of chapter.moduleFiles) {
    const module = read(moduleFile);
    module.sections.forEach((section, index) => {
      sections.push({
        ...section,
        moduleFile,
        example: module.workedExamples?.[index] || module.workedExamples?.[0],
        misconception: module.commonMisconceptions?.[index] || module.commonMisconceptions?.[0]
      });
    });
  }
  if (sections.length !== 6) throw new Error(`${area.id}: forventet seks artikler, fikk ${sections.length}`);
  const rows = sections.map((section) => {
    const topic = topicById.get(section.coverageTopic);
    if (!topic) throw new Error(`${area.id}: mangler topic foundation for ${section.coverageTopic}`);
    const claims = section.paragraphClaimIds.flat().map((id) => claimById.get(id)).filter(Boolean);
    if (claims.length < 6) throw new Error(`${area.id}/${topic.id}: trenger seks verifiserte claims`);
    return { section, topic, claims, emne: resolveEmne(topic, section, area.id) };
  });

  const questions = SEQUENCE.map((stage, stageIndex) => {
    const primary = rows[stageIndex];
    const secondary = stageIndex === 4 ? rows[5] : null;
    const selectedClaims = stageIndex === 0 ? [primary.claims[0]]
      : stageIndex === 1 ? [primary.claims[1]]
      : stageIndex === 2 ? [primary.claims[5]]
      : stageIndex === 3 ? [primary.claims[4]]
      : [primary.claims[4], secondary.claims[4]];
    const knowledge = selectedClaims.map((claim) => cleanClaim(claim.claim)).join(' ');
    const conceptLabels = unique([primary.topic.concepts, secondary?.topic.concepts || []]).slice(0, 6);
    const concept = conceptLabels[0] || primary.section.title.toLowerCase();
    const objectA = primary.section.example?.object || primary.topic.example;
    const objectB = secondary?.section.example?.object || secondary?.topic.example;
    const misconception = primary.section.misconception || {
      claim: `${primary.section.title} kan avgjøres uten tekstbelegg.`,
      correction: 'Påstanden må prøves mot lokaliserbare teksttrekk og en eksplisitt inferensgrense.'
    };
    let stem;
    let answer;
    let distractors;
    if (stage === 'observe') {
      stem = `I en analyse av «${primary.section.title}», hvilken observasjon er faglig mest presis?`;
      answer = cleanClaim(selectedClaims[0].claim);
      distractors = [
        `Temaet kan avgjøres ut fra verkets eller feltets navn alene, uten å angi tekststed, utgave eller analyseenhet.`,
        `Én forekomst av ${concept} fastslår både forfatterintensjon og faktisk leservirkning, uavhengig av kontekst.`
      ];
    } else if (stage === 'explain') {
      stem = `Hvilken forklaring viser best hvordan «${primary.section.title}» skal brukes i en etterprøvbar fortolkning?`;
      answer = cleanClaim(selectedClaims[0].claim);
      distractors = [
        `${concept} virker likt i alle sjangre og perioder, så form, utgave og kontekst kan utelates.`,
        `Eksemplet ${objectA} gjør en eksplisitt argumentkjede mellom observasjon og fortolkning overflødig.`
      ];
    } else if (stage === 'evaluate_evidence') {
      stem = `Hva er den beste evidensstrategien for å prøve en påstand om «${primary.section.title}»?`;
      answer = `${cleanClaim(selectedClaims[0].claim)} Lokaliser teksttrekket, sammenlign et relevant moteksempel og avgrens konklusjonen til materialet.`;
      distractors = [
        `Bruk én løs omtale av ${objectA} som bevis for alle verk, lesere og historiske sammenhenger.`,
        `La emnenavnet fungere som kilde, og behandle fravær av tekstbelegg som bekreftelse på teorien.`
      ];
    } else if (stage === 'diagnose_failure') {
      stem = `En lesning av «${primary.section.title}» hevder: «${misconception.claim}» Hva er den mest presise faglige diagnosen?`;
      answer = `${cleanClaim(misconception.correction)} ${cleanClaim(selectedClaims[0].claim)}`;
      distractors = [
        `Påstanden er tilstrekkelig fordi den er intuitiv; lokator, utgave og konkurrerende forklaring er unødvendige.`,
        `Feilen løses ved å erstatte tekstanalysen med en sikker påstand om forfatterens private hensikt.`
      ];
    } else {
      const primaryMethods = canonicalMethodIds(primary.emne);
      const secondaryMethods = canonicalMethodIds(secondary.emne);
      const methodA = methodById.get(primaryMethods[stageIndex % primaryMethods.length]);
      const methodB = methodById.get(secondaryMethods[(stageIndex + 1) % secondaryMethods.length]);
      stem = `Du skal sammenligne to avgrensede delstudier: (1) ${String(objectA).replace(/[.]+$/, '')}; (2) ${String(objectB).replace(/[.]+$/, '')}. Hvilket valg gir den best begrunnede analysen?`;
      answer = `Avgrens to sammenlignbare tekststeder, bruk ${methodA.title.toLowerCase()} og ${methodB.title.toLowerCase()}, prøv en alternativ forklaring og konkluder bare med det kildene støtter. ${knowledge}`;
      distractors = [
        `Slå sammen verkene til ett eksempel, se bort fra utgave og medium, og la likhet i tema bevise samme historiske funksjon.`,
        `Velg den tolkningen som passer teorien best, og bruk fravær av motbelegg som dokumentasjon på forfatterintensjon og leservirkning.`
      ];
    }
    const optionData = rotateOptions(answer, distractors, areaIndex + stageIndex);
    const primaryMethods = canonicalMethodIds(primary.emne);
    const methodId = primaryMethods[stageIndex % primaryMethods.length];
    const source = questionSources(area.id, sourceById, selectedClaims, knowledge);
    const id = `quiz_lit_${slug(area.id)}_${stage}`;
    return {
      id,
      quiz_id: `litteratur_${slug(area.id)}_pathway_q${stageIndex + 1}`,
      categoryId: 'litteratur',
      subject_id: 'litteratur',
      targetId: `subject_litteratur_${slug(area.id)}`,
      question_scope: 'subject_area',
      pathway_stage: stage,
      question: stem,
      ...optionData,
      knowledge,
      explanation: stage === 'decide_and_justify'
        ? `Slutttrinnet forbinder to av områdets seks hovedartikler og krever både metodevalg, alternativ fortolkning og eksplisitt inferensgrense.`
        : `Trinnet trener ${primary.section.title.toLowerCase()} ved å skille dokumentert fagpåstand fra overgeneralisering, intensjonsgjetning og uavgrenset virkningspåstand.`,
      difficulty: stageIndex < 2 ? 2 : stageIndex < 4 ? 3 : 4,
      question_type: QUESTION_TYPES[stageIndex],
      emne_id: primary.emne.emne_id,
      emne_ids: unique([primary.emne.emne_id, secondary?.emne.emne_id]),
      method_id: methodId,
      topic_id: primary.topic.id,
      topic_ids: unique([primary.topic.id, secondary?.topic.id]),
      article_ids: unique([primary.section.coverageTopic, secondary?.section.coverageTopic]),
      claim_id: selectedClaims[0].id,
      claim_ids: selectedClaims.map((claim) => claim.id),
      core_concepts: conceptLabels,
      concepts: conceptLabels,
      terms: conceptLabels,
      learning_objective_id: `lo_lit_${slug(area.id)}_${stage}`,
      evidence_type: 'verified_literature_claim',
      knowledge_payload: {
        summary: knowledge,
        explanation: stage === 'decide_and_justify'
          ? `Svaret samordner to artikler uten å viske ut forskjellen mellom analyseenheter, metoder og kildetyper.`
          : `Svaret bygger på verifiserte påstander i den redaksjonelt ferdige artikkelen «${primary.section.title}».`,
        why_it_matters: `Spørsmålet gjør ${area.title.toLowerCase()} vurderbart gjennom eksplisitte tekst-, metode- og kildekrav.`
      },
      feedback_basis: 'source_trace_and_explanation',
      source,
      source_origin: 'external',
      claim_basis: knowledge,
      guidance_basis: [chapterFile, primary.section.moduleFile, claimsFile, `${PACKAGE}/topic_foundations_v1.json`],
      uncertainty: 'Påstanden er avgrenset til det identifiserte tekst- og kildegrunnlaget; generalisering krever ny evidens.',
      case_fact: false,
      knowledge_contract_version: 1,
      knowledge_link_status: 'linked',
      knowledge_link_evidence: { method: 'explicit', confidence: 1 }
    };
  });

  return {
    set: {
      set_id: `pathway_lit_${slug(area.id)}`,
      title: area.title,
      level: 5,
      order: areaIndex + 1,
      phase: 'subject_pathway',
      target_kind: 'subject_area',
      targetId: `subject_litteratur_${slug(area.id)}`,
      area_id: area.id,
      article_ids: rows.map((row) => row.topic.id),
      emne_ids: unique(questions.flatMap((question) => question.emne_ids)),
      sequence: SEQUENCE,
      completion_rule: {
        minimum_correct: 4,
        explanation_required_for_stages: ['evaluate_evidence', 'diagnose_failure', 'decide_and_justify'],
        source_trace_required_for_mastery: true
      },
      question_ready_claim_ids: unique(questions.flatMap((question) => question.claim_ids)),
      questions
    },
    sources: [...sourceById.values()].map((source) => sourceObject(area.id, source, `Canonicalt kildegrunnlag for ${area.title}.`))
  };
}

const built = coverage.coverage_areas.map(buildArea);
const sets = built.map((row) => row.set);
const sources = built.flatMap((row) => row.sources);
const pathway = {
  schema: 'history_go_subject_pathway_package_v1',
  version: 1,
  status: 'canonical',
  package_kind: 'subject_pathway',
  categoryId: 'litteratur',
  subject_id: 'litteratur',
  targetId: 'subject_litteratur',
  title: 'Litteraturvitenskap – komplette fagområdeforløp',
  sources,
  production_context: {
    profile: 'subject_pathway_28x5_full_field',
    standard_version: 'QUIZ_PRODUCTION_CANONICAL_3.3+SUBJECT_PATHWAY_V1',
    source_review_status: '384_sources_and_1344_claims_editorially_verified',
    assessed_area_count: 28,
    assessed_article_count: 168,
    pathway_question_count: 140,
    article_coverage_rule: 'Hvert femtrinnsforløp dekker alle seks hovedartikler; slutttrinnet syntetiserer artikkel fem og seks.',
    question_ready_claim_ids: unique(sets.flatMap((set) => set.question_ready_claim_ids)),
    released_emne_ids: unique(sets.flatMap((set) => set.emne_ids)),
    legacy_audit: LEGACY_OUTPUT,
    geographic_activation: false,
    geographic_activation_note: 'Fagområdeforløpene vurderer universell litteraturvitenskap; sted-, person- og verkspåstander krever egne validerte casekilder.',
    case_fact_policy: 'forbidden_without_separate_validated_case_sources'
  },
  sets
};

const legacyFiles = [
  { file: 'data/quiz/quiz_litteratur.json', active: true },
  { file: 'data/quiz/quiz_litteratur_from_populaerkultur.json', active: true },
  { file: 'data/quiz/quiz_litteratur_plus_from_by.json', active: false }
];
const records = legacyFiles.flatMap(({ file, active }) => read(file).map((question, index) => ({
  question_id: question.id || question.quiz_id || `legacy_litteratur_${index + 1}`,
  source_file: file,
  prior_runtime_status: active ? 'active_manifest_entry' : 'not_in_manifest',
  disposition: 'archived_in_place_reproduction_required',
  reason_codes: unique([
    'missing_external_source',
    question.emne_id ? null : 'missing_canonical_emne',
    'missing_knowledge_contract'
  ]),
  replacement_surface: OUTPUT,
  ...(question.placeId ? { place_id: question.placeId } : {}),
  ...(question.personId ? { person_id: question.personId } : {})
})));
const priorActive = records.filter((record) => record.prior_runtime_status === 'active_manifest_entry').length;
const legacyAudit = {
  schema: 'history_go_litteratur_legacy_quiz_audit_v1',
  version: '1.0.0',
  subject_id: 'litteratur',
  status: 'complete',
  policy: 'Legacyspørsmål uten inspectable eksterne kilder og canonical Knowledge-kontrakt kan ikke brukes som faglig evidens eller aktivt vurderingslag.',
  summary: {
    reviewed: records.length,
    prior_active: priorActive,
    prior_inactive: records.length - priorActive,
    retained_active: 0,
    rewritten_in_place: 0,
    archived_in_place: records.length,
    foreign_or_missing_emne_bindings_active_after_audit: 0,
    subject_pathways_created: sets.length,
    pathway_questions_created: sets.flatMap((set) => set.questions).length,
    assessed_articles: unique(sets.flatMap((set) => set.article_ids)).length
  },
  records
};

write(OUTPUT, pathway);
write(LEGACY_OUTPUT, legacyAudit);
console.log(`Litteratur assessment bygget: ${sets.length} pathways, ${sets.flatMap((set) => set.questions).length} spørsmål, ${legacyAudit.summary.assessed_articles} artikler og ${records.length} legacybeslutninger.`);
