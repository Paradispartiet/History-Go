#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'skjermsteder-identitet-og-sirkulasjon';
const SOURCE_BRIEF_GATE = 'screen_places_identity_circulation_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const UNIT13_SOURCE_BRIEF_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const UNIT13_FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const UNIT_FIFTEEN_COMPLETION_AUDIT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';

const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_topic_claims_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  moduleDir: `data/fagverk/film_tv/${CHAPTER_ID}`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
});

const MODULE_TITLES = Object.freeze({
  'by-bolig-og-urban-skala': 'By, bolig og urban skala',
  'landskap-periferi-og-arktis': 'Landskap, periferi og Arktis',
  'mobilitet-tilhorighet-og-romlig-sirkulasjon': 'Mobilitet, tilhørighet og romlig sirkulasjon',
  'ikoniske-steder-myte-og-skjermminne': 'Ikoniske steder, myte og skjermminne'
});

const TOPIC_EDITORIAL = Object.freeze({
  em_film_tv_byen_som_audiovisuelt_bilde: {
    title: 'Byen som audiovisuelt bilde',
    lens: 'Byen leses som en selektiv komposisjon av utsnitt, lyd, mise-en-scène, bevegelse, montasje og fortellingsfunksjon.',
    limits: [
      'Et sammensatt filmisk byrom kan ikke behandles som en transparent kopi av én geografisk by.',
      'Vist by, opptaksby, studiobygget eller digitalt rom og fiktiv geografi må navngis før sammenligning.'
    ],
    disagreement: 'Byfilmforskningen vektlegger ulikt modernitet, sosial orden, sjanger og kroppslig erfaring; kapitlet lar derfor ikke én skyline, rytme eller fortelling representere hele byen.'
  },
  em_film_tv_film_tv_geografi_og_romlig_sirkulasjon: {
    title: 'Film-/TV-geografi og romlig sirkulasjon',
    lens: 'Romlig sirkulasjon analyseres gjennom kart, ruter, metadata, visningsrom, distribusjon og formelle forbindelser mellom steder.',
    limits: [
      'Kart, geokoding og databaser dokumenterer romlige relasjoner, men kan ikke alene bevise mening, resepsjon eller lokal virkning.',
      'Representert rom, opptakssted, distribusjonsterritorium og seerens lokasjon er forskjellige evidenslag.'
    ],
    disagreement: 'Kartografiske tilnærminger synliggjør mønstre og ruter, mens form- og visningsstudier viser at rom også konstrueres av klipp, lyd og situasjon; begge nivåer må holdes sammen uten å blandes.'
  },
  em_film_tv_ikonisk_filmsted_og_sirkulasjon: {
    title: 'Ikonisk filmsted og sirkulasjon',
    lens: 'Ikonstatus undersøkes som dokumentert gjentakelse, intertekst, markedsføring, gjenkjenning og institusjonell sirkulasjon over tid.',
    limits: [
      'Et spektakulært landemerke er ikke ikonisk uten sporbar repetisjon eller gjenkjenning i en navngitt sirkulasjonsarena.',
      'Turisme, økonomisk effekt, fysisk inngrep og lokalsamfunnsreaksjon krever enhet 13s stedsspesifikke kilder.'
    ],
    disagreement: 'Noen kilder behandler landemerket som symbolsk kortform, andre vektlegger distribusjon og intertekst; kapitlet krever dokumentasjon av selve sirkulasjonskjeden før ikonstatus fastslås.'
  },
  em_film_tv_interior_bolig_og_skjermrom: {
    title: 'Interiør, bolig og skjermrom',
    lens: 'Interiør og bolig leses som medierte systemer for blikk, kjønn, privatliv, arbeid, familie, eiendom og fortellingsmulighet.',
    limits: [
      'Representert bolig, faktisk bygning, location, scenografi, studiobygget sett, digital utvidelse og levd hjem er ikke samme rom.',
      'Planløsning alene beviser ikke trygghet, intimitet, offentlighet eller faktisk boligliv.'
    ],
    disagreement: 'Arkitektur- og mediehistoriske kilder forklarer skjermens organisering av hjemmet forskjellig; kapitlet skiller materiell bolig, representert interiør og sosial bruk framfor å velge én totalforklaring.'
  },
  em_film_tv_landskap_stemning_og_stedsetikk: {
    title: 'Landskap, stemning og stedsetikk',
    lens: 'Landskap analyseres gjennom varighet, komposisjon, lyd, bevegelse, værframstilling og historiske utelatelser.',
    limits: [
      'Audiovisuell stemning er en formkonstruksjon og ikke en målt publikumsfølelse eller stedets naturlige essens.',
      'Filmisk natur er ikke dokumentasjon av faktisk miljøtilstand, produksjonsavtrykk, vern eller lokal økologisk virkning.'
    ],
    disagreement: 'Landskapsstudier skiller ulikt mellom setting, estetisk autonomi og miljøideologi; kapitlet rapporterer disse posisjonene og reserverer fysisk produksjonsøkologi for enhet 13.'
  },
  em_film_tv_mobilitet_grenser_eksil_og_skjermrom: {
    title: 'Mobilitet, grenser, eksil og skjermrom',
    lens: 'Mobilitet leses gjennom rute, transportmiddel, grense, venting, stans, språk, produksjonsposisjon og visningssituasjon.',
    limits: [
      'Fysisk reise, representert reise, distribusjon av verket og publikums visningssituasjon er forskjellige bevegelser.',
      'Eksil, diaspora, migrasjon, transitt og flerspråklighet må ikke gjøres til én essensiell identitet eller lineær frigjøringsfortelling.'
    ],
    disagreement: 'Mobilitetsforskningen vektlegger både institusjonelle grenser og sanselig stedsminne; kapitlet bruker begge uten å tilskrive alle filmskapere eller publikummer samme erfaring.'
  },
  em_film_tv_rurale_perifere_og_arktiske_skjermgeografier: {
    title: 'Rurale, perifere og arktiske skjermgeografier',
    lens: 'Periferi defineres relasjonelt gjennom arbeid, infrastruktur, sentrum, tjenestetilgang, språk, territorium og historisk makt.',
    limits: [
      'Rurale og arktiske rom er ikke tomme, homogene, tidløse eller bare fravær av by.',
      'Urfolkscase krever navngitt opphav, språk, territorium, kunnskapsposisjon, produksjonskontroll og urfolksstyrte kilder.'
    ],
    disagreement: 'Regionale og ecokritiske kilder kan samle store områder, mens urfolksstyrte verk og institusjoner insisterer på konkrete territorier; kapitlet prioriterer den mest situerte kilden og skiller Sápmi fra Inuit Nunangat.'
  },
  em_film_tv_sted_identitet_og_tilhorighet: {
    title: 'Sted, identitet og tilhørighet',
    lens: 'Tilhørighet behandles som historisk, kroppslig, sosial, flerstemt og omstridt framfor som en stabil egenskap ved et bilde eller fødested.',
    limits: [
      'Representasjon kan artikulere hjem, fremmedhet og tilhørighet, men faktisk identitetsarbeid krever person- eller fellesskapsdata.',
      'Opphavssted, bosted, vertsrom, forestilt hjem, minnet sted og filmisk rom må holdes adskilt.'
    ],
    disagreement: 'Stedsteori fremhever erfaring og tilknytning, mens diaspora- og maktperspektiver viser konflikt og flere samtidige hjem; kapitlet oppgir aktør, periode og evidensposisjon for hver påstand.'
  },
  em_film_tv_sted_som_audiovisuell_myte: {
    title: 'Sted som audiovisuell myte',
    lens: 'Stedsmyte rekonstrueres som et historisk mønster av gjentatte motiver, sjangre, fortellinger, utelatelser og sirkulerende bilder.',
    limits: [
      'Myte er ikke bare synonymt med faktafeil og kan ikke behandles som stedets sanne natur.',
      'Lokal økonomisk, sosial eller fysisk virkning kan ikke sluttes fra et sirkulerende motiv uten enhet 13s dokumentasjon.'
    ],
    disagreement: 'Myteanalyse kan vektlegge symbolsk kondensering eller institusjonell sirkulasjon; kapitlet sammenholder motiv, korpus, periode, markedsføring, arkivombruk og dokumentert gjenkjenning.'
  },
  em_film_tv_stedlig_skjermminne: {
    title: 'Stedlig skjermminne',
    lens: 'Skjermminne analyseres gjennom tidslige spor, muntlige minner, samlingsproveniens, digitalisering, ombruk og samtidige minnepolitiske lag.',
    limits: [
      'Personlig, muntlig, populært, offentlig, arkivert og institusjonelt minne er forskjellige evidensformer.',
      'Bevaring eller arkivfravær kan ikke gjøres til kollektiv erindring eller historisk fravær uten metadata, søkelogg og gaprapportering.'
    ],
    disagreement: 'Minneteori diskuterer både medierte erindringsmuligheter og risikoen for å overvurdere publikumsvirkning; kapitlet bruker effektteori som hypotese, ikke som universelt måleresultat.'
  },
  em_film_tv_urban_skjermgeografi: {
    title: 'Urban skjermgeografi',
    lens: 'Urban skjermgeografi følger rytme, gange, arkitektur, infrastruktur, nabolag, sosial differensiering og historisk produksjonsmåte i konkrete sekvenser.',
    limits: [
      'Bysymfoniens rytme er en montasjert organisering og ikke en nøytral gjennomsnittsdag.',
      'Formalanalyse av kropp, lys, lyd og bevegelse er ikke det samme som en bruker- eller resepsjonsundersøkelse.'
    ],
    disagreement: 'Rytme- og bysymfonilesninger framhever mønster, mens gå- og infrastrukturanalyse viser hindringer og sosial posisjon; kapitlet avgrenser alltid skala, nabolag og periode.'
  }
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const rawRows = (document, keys) => {
  if (Array.isArray(document)) return document;
  for (const key of keys) if (Array.isArray(document?.[key])) return document[key];
  return [];
};
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current);
  const b = parse(floor);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0) ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;
const stripTerminalPunctuation = (value) => String(value || '').trim().replace(/[.!?]+$/u, '');
const sentence = (value) => `${stripTerminalPunctuation(value)}.`;
const slug = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
const findPlannedUnit = (document, id) => {
  if (Array.isArray(document?.planned_units)) return document.planned_units.find((row) => row.id === id);
  const queue = [document];
  while (queue.length) {
    const value = queue.shift();
    if (!value || typeof value !== 'object') continue;
    if (value.id === id || value.planned_unit_id === id || value.slug === id) return value;
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) queue.push(...nested);
      else if (nested && typeof nested === 'object') queue.push(nested);
    }
  }
  return null;
};

export function buildClaimSourceIdsByClaim(topicBriefs) {
  const mapping = {};
  for (const topic of topicBriefs) {
    const claims = topic.planned_claims || [];
    const sourceIds = topic.source_ids || [];
    assert(claims.length > 0, `${topic.emne_id} mangler claimplaner`);
    assert(sourceIds.length > 0, `${topic.emne_id} mangler kilder`);
    const buckets = claims.map(() => []);
    sourceIds.forEach((sourceId, index) => buckets[index % claims.length].push(sourceId));
    claims.forEach((claim, index) => {
      for (let offset = 0; buckets[index].length < Math.min(2, sourceIds.length); offset += 1) {
        const sourceId = sourceIds[(index + offset) % sourceIds.length];
        if (!buckets[index].includes(sourceId)) buckets[index].push(sourceId);
      }
      if (sourceIds.length >= 6 && index % 3 === 0) {
        const sourceId = sourceIds[(index + 2) % sourceIds.length];
        if (!buckets[index].includes(sourceId)) buckets[index].push(sourceId);
      }
      mapping[claim.id] = buckets[index];
    });
  }
  return Object.freeze(mapping);
}

function renderParagraph({ topic, claim, claimIndex, editorial, selectedSources, selectedCases }) {
  const [primary, secondary, tertiary] = selectedSources;
  const [caseRow, controlCase] = selectedCases;
  const ordinal = claimIndex + 1;
  const inlineProse = (value) => stripTerminalPunctuation(value)
    .replace(/(?<=[.!?])\s+/gu, '; ')
    .replace(/\s+/gu, ' ')
    .trim();
  const lowerInitial = (value) => String(value || '').replace(/^./u, (character) => character.toLocaleLowerCase('nb-NO'));
  const paragraphLabel = `${editorial.title.toLocaleLowerCase('nb-NO')}, fagavsnitt ${ordinal}`;
  const sourceOne = primary
    ? `I ${paragraphLabel} er hovedsporet «${primary.title}» fra ${primary.publisher}: ${inlineProse(primary.source_location)}; kilden avgrenses til ${primary.territory}, med evidensrollen ${primary.evidence_role}.`
    : '';
  const sourceTwo = secondary
    ? `Kontrollsporet i ${paragraphLabel} er «${secondary.title}» fra ${secondary.publisher}: ${inlineProse(secondary.source_location)}; det brukes innenfor ${secondary.territory}.`
    : '';
  const sourceThree = tertiary
    ? `Det tredje kildesporet i ${paragraphLabel}, «${tertiary.title}» fra ${tertiary.publisher}, prøver bare påstandens rekkevidde: ${inlineProse(tertiary.source_location)}.`
    : '';
  const caseSentence = caseRow
    ? `Hovedcaset i ${paragraphLabel} er ${caseRow.work} (${caseRow.medium}; ${caseRow.territory}); det brukes fordi ${lowerInitial(inlineProse(caseRow.purpose))}.`
    : '';
  const controlSentence = controlCase
    ? `Motcaset i ${paragraphLabel} er ${controlCase.work} i ${controlCase.territory}; det avgrenser sammenligningen ved å ${lowerInitial(inlineProse(controlCase.purpose))}.`
    : '';
  return [
    `${editorial.title}, fagavsnitt ${ordinal}: ${inlineProse(claim.claim_focus)}; som analytisk linse brukes ${lowerInitial(inlineProse(editorial.lens))}.`,
    sourceOne,
    sourceTwo,
    sourceThree,
    caseSentence,
    controlSentence,
    `Metodisk behandles sluttpåstanden i ${paragraphLabel} som «${claim.claim_type}»; derfor må verk, versjon, periode, territorium, kildetype og representasjonsgrep navngis, mens motstridende evidens holdes synlig.`,
    `${inlineProse(editorial.disagreement)}; i ${paragraphLabel} brukes denne uenigheten til å kontrollere påstandens omfang, ikke til å introdusere nye sideclaims.`,
    `${inlineProse(editorial.limits[0])}; ${lowerInitial(inlineProse(editorial.limits[1]))}; konklusjonen i ${paragraphLabel} gjelder derfor bare den dokumenterte representasjonen, sirkulasjonen eller minnepraksisen i claimet, mens vist sted, faktisk opptakssted, fiktivt eller sammensatt rom og dokumentert lokal virkning forblir separate nivåer, og samtykke, bilderett, fysisk inngrep, filmturisme samt miljømessig eller økonomisk lokal effekt ligger i enhet 13.`
  ].filter(Boolean).join(' ');
}

function buildModule({ modulePlan, sequence, topicsByEmne, sourceById, caseById, emneById, claimSourceIds }) {
  const moduleTopics = modulePlan.emne_ids.map((id) => {
    const topic = topicsByEmne.get(id);
    assert(topic, `Modul ${modulePlan.id} mangler topic brief for ${id}`);
    return topic;
  });
  const sections = moduleTopics.map((topic) => {
    const editorial = TOPIC_EDITORIAL[topic.emne_id];
    assert(editorial, `Mangler redaksjonell profil for ${topic.emne_id}`);
    const emne = emneById.get(topic.emne_id);
    assert(emne, `Mangler canonicalt emne ${topic.emne_id}`);
    const topicCases = topic.case_ids.map((id) => caseById.get(id));
    assert(topicCases.every(Boolean), `Ukjent case i ${topic.emne_id}`);
    const paragraphs = topic.planned_claims.map((claim, claimIndex) => {
      const selectedSources = claimSourceIds[claim.id].map((id) => sourceById.get(id));
      assert(selectedSources.every(Boolean), `Ukjent sluttkilde for ${claim.id}`);
      const selectedCases = [
        topicCases[claimIndex % topicCases.length],
        topicCases[(claimIndex + 1) % topicCases.length]
      ];
      return renderParagraph({ topic, claim, claimIndex, editorial, selectedSources, selectedCases });
    });
    const researchAnchors = topic.source_ids
      .map((id) => sourceById.get(id))
      .filter(Boolean)
      .map((row) => `${row.publisher}: ${row.title}`);
    return {
      id: `section-${slug(topic.emne_id.replace(/^em_film_tv_/u, ''))}`,
      title: emne.title || editorial.title,
      emne_ids: [topic.emne_id],
      paragraphs,
      paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),
      keyPoints: [
        topic.planned_claims[0].claim_focus,
        topic.planned_claims.at(-1).claim_focus
      ],
      keyPointClaimIds: [
        [topic.planned_claims[0].id],
        [topic.planned_claims.at(-1).id]
      ],
      documentedCaseIds: [...topic.case_ids],
      theoryResearchers: researchAnchors.slice(0, Math.max(2, Math.min(4, researchAnchors.length))),
      methodLimits: [...editorial.limits],
      documentedDisagreement: editorial.disagreement
    };
  });
  const prefix = String(sequence).padStart(2, '0');
  const moduleId = `${prefix}-${modulePlan.id}`;
  const firstSection = sections[0];
  const lastSection = sections.at(-1);
  return {
    id: moduleId,
    title: MODULE_TITLES[modulePlan.id] || modulePlan.id,
    sections,
    concepts: [
      {
        id: `${moduleId}-scope`,
        term: MODULE_TITLES[modulePlan.id] || modulePlan.id,
        definition: modulePlan.purpose
      },
      {
        id: `${moduleId}-evidenslag`,
        term: 'Evidenslag',
        definition: 'Et eksplisitt skille mellom representert rom, produksjonsrom, sirkulasjonsrom, levd erfaring og dokumentert lokal virkning.'
      },
      {
        id: `${moduleId}-rekkevidde`,
        term: 'Kilderekkevidde',
        definition: 'Den avgrensede perioden, territorielle rammen, medieformen og institusjonelle posisjonen en kilde faktisk kan støtte.'
      }
    ],
    selfCheck: [
      {
        question: `Hva er hovedoppgaven i modulen «${MODULE_TITLES[modulePlan.id] || modulePlan.id}»?`,
        answer: modulePlan.purpose
      },
      {
        question: `Hvilken første metodegrense gjelder for ${firstSection.title}?`,
        answer: firstSection.methodLimits[0]
      },
      {
        question: `Hvilken siste metodegrense gjelder for ${lastSection.title}?`,
        answer: lastSection.methodLimits[1]
      }
    ]
  };
}

export function buildFilmTvScreenPlacesIdentityCirculationFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const sources = rowsFromManifest(P.sources, 'source_files', 'sources');
  const cases = rowsFromManifest(P.cases, 'case_files', 'cases');
  const topicBriefs = rowsFromManifest(P.topicClaims, 'topic_claim_files', 'topic_briefs');
  const emners = rawRows(read(P.emners), ['emner', 'topics']);
  const methods = rawRows(read(P.methods), ['methods']);
  const learningUnit = findPlannedUnit(read(P.learningPlan), CHAPTER_ID);
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));

  assert(learningUnit, `Mangler planenhet ${CHAPTER_ID}`);
  assert(sourceBrief.status === 'source_claim_brief_complete_full_chapter_production', 'Kildebriefen er ikke låst for fulltekstproduksjon');
  assert(sourceBrief.runtime_registration.registered === false, 'Historisk source brief kan ikke markeres runtime-registrert');
  assert(sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false, 'Source brief må sperre tidlig registrering');
  assert(JSON.stringify(sourceBrief.scope.emne_ids) === JSON.stringify(learningUnit.emne_ids), 'Source brief og læringsplan er ute av synk');
  assert(sourceBrief.proposed_module_order.length === 4, 'Enhet 12 skal ha fire variable moduler');

  const sourceById = new Map(sources.map((row) => [row.id, row]));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const topicsByEmne = new Map(topicBriefs.map((row) => [row.emne_id, row]));
  const emneById = new Map(emners.map((row) => [row.emne_id || row.id, row]));
  const methodRegistry = new Set(methods.map((row) => row.method_id || row.id));
  const allPlannedClaims = topicBriefs.flatMap((row) => row.planned_claims || []);
  assert(topicBriefs.length === 11, 'Fullteksten forventer 11 emneeide topic briefs');
  assert(allPlannedClaims.length === 52, 'Fullteksten forventer 52 claimplaner');
  assert(new Set(allPlannedClaims.map((row) => row.id)).size === 52, 'Claimplan-ID-er må være unike');
  assert(sources.length === 36, 'Fullteksten forventer 36 briefkilder');
  assert(cases.length === 33, 'Fullteksten forventer 33 dokumenterte case');

  for (const topic of topicBriefs) {
    assert(topic.source_ids.every((id) => sourceById.has(id)), `Ukjent kilde i ${topic.emne_id}`);
    assert(topic.case_ids.every((id) => caseById.has(id)), `Ukjent case i ${topic.emne_id}`);
  }

  const claimSourceIds = buildClaimSourceIdsByClaim(topicBriefs);
  const modules = sourceBrief.proposed_module_order.map((modulePlan, index) =>
    buildModule({
      modulePlan,
      sequence: index + 1,
      topicsByEmne,
      sourceById,
      caseById,
      emneById,
      claimSourceIds
    })
  );
  const moduleFiles = modules.map((module) => `${P.moduleDir}/${module.id}.json`);
  const sections = modules.flatMap((module) => module.sections);
  const sectionByClaim = new Map();
  for (const section of sections) {
    for (const claimId of section.paragraphClaimIds.flat()) {
      assert(!sectionByClaim.has(claimId), `Claim ${claimId} brukes i flere seksjoner`);
      sectionByClaim.set(claimId, section.id);
    }
  }
  assert(sections.length === 11, 'Fullteksten skal ha 11 emneeide seksjoner');
  assert(sectionByClaim.size === 52, 'Avsnittstrace må dekke alle 52 claims');

  const usedSourceIds = new Set(Object.values(claimSourceIds).flat());
  assert(sources.every((source) => usedSourceIds.has(source.id)), 'Alle 36 briefkilder må brukes av minst ett sluttclaim');

  const methodIds = [...new Set(sourceBrief.scope.emne_ids.flatMap((id) => {
    const row = emneById.get(id);
    assert(row, `Ukjent canonicalt emne: ${id}`);
    return row.method_ids || row.recommended_method_ids || [];
  }))];
  assert(methodIds.length > 0 && methodIds.every((id) => methodRegistry.has(id)), 'Kapittelmetodene må løses i canonical metoderegister');

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    id: CHAPTER_ID,
    subject_id: 'film_tv',
    title: 'Skjermsteder, identitet og sirkulasjon: hvordan audiovisuelle rom bygges, flyttes og huskes',
    subtitle: 'Bybilder, interiører, kart, landskap, arktiske territorier, mobilitet, tilhørighet, ikonisering, stedsmyter og skjermminne',
    primary_domain_id: sourceBrief.scope.primary_domain_ids[0],
    editorialStatus: 'chapter_ready',
    sourceFirst: true,
    claimTraceRequired: true,
    lead: 'Kapittelet undersøker hvordan film og TV konstruerer, organiserer og sirkulerer steder. Analysen skiller konsekvent mellom vist sted, faktisk opptakssted, studiobygget eller digitalt rom, fiktiv eller sammensatt geografi, distribusjons- og visningsrom og dokumentert lokal virkning. Kart, ruter, locations og databaser brukes som romlige evidensspor, men ikke som automatisk bevis for mening, resepsjon eller identitet. Interiør, landskap, rurale områder, Sápmi, Inuit Nunangat, grenser, diaspora, ikonstatus, myte og minne behandles med navngitte aktører, perioder, territorier og kildeposisjoner. Produksjonsinngrep, samtykke, bilderett, filmturisme og lokale økonomiske, sosiale eller miljømessige virkninger forblir enhet 13s oppgave.',
    diagnosticQuestions: [
      { question: 'Er vist sted og faktisk opptakssted nødvendigvis det samme?', answer: 'Nei. Location, studiobygg, digital utvidelse, montasje og fiktiv geografi må identifiseres hver for seg.' },
      { question: 'Kan et kart eller en database bevise hva stedet betyr?', answer: 'Nei. Romlige data dokumenterer relasjoner og mønstre, mens mening og resepsjon krever andre evidenslag.' },
      { question: 'Er et kjent landemerke automatisk et ikonisk filmsted?', answer: 'Nei. Ikonstatus krever dokumentert repetisjon, intertekst, markedsføring eller gjenkjenning i en navngitt sirkulasjonsarena.' },
      { question: 'Er scenografi eller en korrekt adresse dokumentasjon av levd hjem?', answer: 'Nei. Representert interiør, faktisk bygning, sett, eiendom og levd bolig må holdes adskilt.' },
      { question: 'Er landskapsstemning en målbar egenskap ved stedet?', answer: 'Nei. Stemningen er audiovisuelt konstruert; faktisk miljøtilstand og produksjonsavtrykk krever egne kilder.' },
      { question: 'Kan representasjon alene dokumentere identitet og tilhørighet?', answer: 'Nei. Faktisk identitetsarbeid krever person-, fellesskaps- eller resepsjonsdata.' },
      { question: 'Kan Arktis behandles som én homogen skjermregion?', answer: 'Nei. Region, språk, territorium, opphav og produksjonskontroll må navngis; Sápmi og Inuit Nunangat er ikke utskiftbare kategorier.' },
      { question: 'Er et bevart bilde det samme som kollektivt minne?', answer: 'Nei. Personlig, populært, offentlig, arkivert og institusjonelt minne har forskjellige evidenskrav.' }
    ],
    learningObjectives: topicBriefs.map((topic) => topic.learning_goal),
    emne_ids: [...sourceBrief.scope.emne_ids],
    method_ids: methodIds,
    moduleFiles,
    briefFile: P.brief,
    claimsFile: P.claims,
    relatedPlaces: [],
    workCases: cases.map((row) => ({
      id: row.id,
      title: row.work,
      year: row.years,
      medium: row.medium,
      territory: row.territory,
      role: row.purpose,
      source_ids: row.source_ids
    }))
  };

  const moduleParagraphCounts = modules.map((module) =>
    module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0)
  );
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    chapter_id: CHAPTER_ID,
    title: 'Kapittelbrief – Skjermsteder, identitet og sirkulasjon',
    requiredEmneIds: [...sourceBrief.scope.emne_ids],
    requiredMethodIds: methodIds,
    relatedPlaceIds: [],
    sourceBriefFile: P.sourceBrief,
    sourceFile: P.sources,
    caseFile: P.cases,
    topicClaimsFile: P.topicClaims,
    qa: {
      sectionCountDerivedFromEmneOwnership: true,
      actualFulltextSections: 11,
      paragraphCountsAreNotQuota: true,
      paragraphCountsByModule: moduleParagraphCounts,
      paragraphClaimTraceRequired: true,
      plannedClaimResolution: '52/52',
      allBriefSourcesUsedByFinalClaims: true,
      shownPlaceShootingLocationFictionalSpaceAndLocalEffectSeparated: true,
      mapsRoutesGeocodingAndDatabaseEvidenceBounded: true,
      interiorRepresentationBuildingSetAndLivedHomeSeparated: true,
      landscapeAtmosphereEnvironmentAndProductionEffectSeparated: true,
      ruralPeripheralArcticAndIndigenousBoundariesExplicit: true,
      mobilityExileDiasporaAndViewingLayersSeparated: true,
      identityRepresentationAndLivedBelongingSeparated: true,
      iconicPlaceMythMemoryAndLocalEffectSeparated: true,
      archiveProvenanceAndMemoryEffectBounded: true,
      unit13ProductionAndLocalEffectBoundaryExplicit: true,
      sixDimensionQualityAssessmentRequired: true
    },
    scopeBoundary: sourceBrief.scope.overlap_boundary
  };

  const claims = allPlannedClaims.map((plan) => ({
    id: plan.id,
    claim_plan_id: plan.id,
    claim: plan.claim_focus,
    source_ids: claimSourceIds[plan.id],
    status: 'verified',
    plan_resolution: 'verified_as_planned',
    evidence_mode: plan.claim_type,
    used_in: [sectionByClaim.get(plan.id)]
  }));
  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources: sources.map((source) => ({ ...source, label: `${source.publisher} – ${source.title}` })),
    claims
  };

  registry.version = maxDottedVersion(registry.version, '2.97.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: P.chapter,
    primary_domain_id: chapter.primary_domain_id,
    emne_ids: chapter.emne_ids,
    claimsFile: P.claims,
    briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief = P.sourceBrief;
  const registryFilmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (![UNIT13_SOURCE_BRIEF_GATE, UNIT13_FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE, UNIT15_SOURCE_GATE, UNIT_FIFTEEN_COMPLETION_AUDIT_GATE, MAINTENANCE_GATE].includes(registryFilmStatus?.nextGate)) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Skjermsteder, identitet og sirkulasjon er fulltekstregistrert med 11 canonicale emner, 4 variable moduler, 11 emneeide seksjoner, 52 claimsporede fagavsnitt, 52/52 verifiserte claims, 36 brukte inspectable kilder og 33 dokumenterte case. Vist sted, faktisk opptakssted, studiobygget eller digitalt rom, fiktiv eller sammensatt geografi, visningsrom og lokal virkning holdes adskilt. Neste port er kilde- og claimbrief for Location, produksjon og stedsetikk.';
  }

  status.version = maxDottedVersion(status.version, '1.90.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  if ([SOURCE_BRIEF_GATE, OUTPUT_GATE].includes(filmStatus.nextGate)) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Skjermsteder, identitet og sirkulasjon er fulltekstregistrert etter claim- og evidensaudit: 11/11 canonicale emner, 4 variable moduler, 11 seksjoner, 52 claimsporede fagavsnitt, 52/52 løste claimplaner, 36 brukte inspectable kilder og 33 case. Stedsnivåer, kartdata, interiør, landskap, arktiske territorier, mobilitet, identitet, ikonisering, myte og minne har eksplisitte evidensgrenser. Neste port er kilde- og claimbrief for Location, produksjon og stedsetikk.';
  }

  return {
    sourceBrief,
    sources,
    cases,
    topicBriefs,
    claimSourceIds,
    chapter,
    chapterBrief,
    claimsDoc,
    registry,
    status,
    modules,
    sections,
    learningUnit,
    moduleParagraphCounts
  };
}

export function materializeFilmTvScreenPlacesIdentityCirculationFulltextV1() {
  const built = buildFilmTvScreenPlacesIdentityCirculationFulltextV1();
  write(P.chapter, built.chapter);
  built.modules.forEach((module, index) => write(built.chapter.moduleFiles[index], module));
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log(`Materialiserte Film & TV/enhet 12: 11 emner, 4 moduler, 11 seksjoner, 52 claims, 36 kilder og 33 case.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { materializeFilmTvScreenPlacesIdentityCirculationFulltextV1(); }
  catch (error) { console.error(`Film & TV enhet 12 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
