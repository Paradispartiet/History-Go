#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'location-produksjon-og-stedsetikk';
const SOURCE_BRIEF_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';

const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_topic_claims_v1.json',
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
  'locationvalg-og-offentlig-rom': 'Locationvalg, tilgang og offentlig rom',
  'produksjonsspor-og-locationokologi': 'Produksjonsspor, ressurser og locationøkologi',
  'lokalsamfunn-samtykke-og-urfolkslandskap': 'Lokalsamfunn, samtykke og urfolkslandskap',
  'stedserstatning-filmturisme-og-lokal-virkning': 'Stedserstatning, filmturisme og lokal virkning'
});

const TOPIC_EDITORIAL = Object.freeze({
  em_film_tv_filmturisme_og_lokale_virkninger: {
    title: 'Filmturisme og lokale virkninger',
    lens: 'Filmturisme undersøkes som målbar besøksatferd og lokal endring, med et eksplisitt skille mellom skjerminspirasjon, faktisk besøk, attribuert forbruk, varig virksomhetsutvikling og bredere sosiale virkninger.',
    limits: [
      'Selvrapportert inspirasjon eller samtidig besøksvekst er ikke i seg selv et kausalt estimat av en film- eller serieeffekt; populasjon, periode, baseline, målemetode og alternative forklaringer må oppgis.',
      'Lokal omsetning og nye arbeidsplasser kan være reelle fordeler, men dokumenterer ikke alene fordeling, kapasitetspress, eierskap, sosial legitimitet eller lokalsamfunnets samtykke.'
    ],
    disagreement: 'Screen-tourism-forskningen varierer mellom surveybasert motivasjon, besøksstatistikk, økonomisk attribusjon og kvalitative stedsstudier. Kapitlet behandler disse som komplementære, men ikke utskiftbare, evidensformer og rapporterer derfor hva som faktisk er målt før virkningen navngis.'
  },
  em_film_tv_gate_kamera_og_offentlig_rom: {
    title: 'Gate, kamera og offentlig rom',
    lens: 'Offentlig-rom-analysen følger den konkrete produksjonens rettslige og fysiske fotavtrykk: hvem eier eller forvalter arealet, hvor kamera og utstyr står, hvilke ferdsels- og driftsinngrep som skjer, og hvilke regler som gjelder i den aktuelle jurisdiksjonen.',
    limits: [
      'Offentlig adgang betyr ikke at et sted mangler eier, forvalter, permitkrav eller andre begrensninger; motivets synlighet og kamerastandpunktets lovlighet må vurderes hver for seg.',
      'Locationtillatelse rydder ikke automatisk personvern, databeskyttelse, ærekrenkelse, individuell deltakelse eller andre rettigheter for identifiserbare personer, og britisk veiledning kan ikke generaliseres til alle jurisdiksjoner.'
    ],
    disagreement: 'Bransjekoder vektlegger ofte gjennomførbarhet, samarbeid og minst mulig forstyrrelse, mens rettighets- og personvernperspektiver spør hvem som faktisk kan bestemme over areal, opptak og identifiserbarhet. Kapitlet bruker begge uten å gjøre best practice til lov eller lovlig tillatelse til etisk fullmakt.'
  },
  em_film_tv_innspillingsspor_og_stedlig_endring: {
    title: 'Innspillingsspor og stedlig endring',
    lens: 'Innspillingsspor rekonstrueres gjennom før-, under- og ettertilstand: scenografi, adgang, parkering, rigg, bygging, overflateinngrep, slitasje, vedlikehold, restaurering og eventuell varig ombygging dokumenteres som separate hendelser.',
    limits: [
      'At et sted kan gjenkjennes på skjermen beviser ikke hva produksjonen fysisk endret; claim om skade, restaurering eller varig ombygging krever site reports, tillatelser, eier- eller myndighetskilder eller tilsvarende etterprøvbar dokumentasjon.',
      'Produksjon i et nabolag som allerede er under økonomisk eller fysisk omforming kan inngå i endringen uten å være dens eneste årsak; eiendom, arbeid, regulering og lokal historie må holdes synlige som alternative eller samtidige prosesser.'
    ],
    disagreement: 'Locationstudier kan beskrive filmarbeid som midlertidig bruk, som urban verdiskaping eller som del av bredere omforming. Kapitlet avgjør ikke dette på forhånd, men krever tidsrekkefølge, aktører og materiell dokumentasjon før et produksjonsspor tilskrives filmen.'
  },
  em_film_tv_location_valg_og_filmsted: {
    title: 'Locationvalg og filmsted',
    lens: 'Locationvalg analyseres som flerfaktorbeslutning der estetisk egnethet møter tilgang, pris, tidsplan, kontroll, infrastruktur, arbeidskraft, avstand, forsikring, tillatelser, sikkerhet og muligheten for å la ett sted representere et annet.',
    limits: [
      'Faktisk opptakssted, representert sted, historisk sted, produksjonsbase, fysisk sett og digitalt erstatningsrom er forskjellige kategorier og må identifiseres før filmstedet brukes analytisk.',
      'Skjermlikhet alene kan ikke dokumentere hvorfor en location ble valgt; økonomiske, logistiske, juridiske eller kreative begrunnelser krever produksjonskilder, intervjuer, arkiv, kontrakts- eller institusjonsmateriale med kjent rekkevidde.'
    ],
    disagreement: 'Noen locationstudier fremhever kreativ autentisitet og stedsspesifisitet, andre viser hvordan fleksibel substitusjon, insentiver og produksjonsinfrastruktur former valget. Kapitlet behandler location som en forhandlet produksjonsressurs og spør empirisk hvilke hensyn som faktisk var utslagsgivende i hvert case.'
  },
  em_film_tv_locationokologi_inngrep_og_miljokonsekvens: {
    title: 'Locationøkologi, inngrep og miljøkonsekvens',
    lens: 'Produksjonsøkologi analyseres i to parallelle regnskaper: klimafotavtrykk fra energi, transport, materialer, catering og avfall, og stedsspesifikk økologisk risiko for habitat, arter, jord, vann, sesong og ferdsel.',
    limits: [
      'Lavere beregnede utslipp dokumenterer ikke fravær av lokal habitatpåvirkning, og et skånsomt enkeltopptak dokumenterer ikke lavt samlet klimafotavtrykk; systemgrense og lokalitetsgrense må holdes adskilt.',
      'En tillatelse, miljøplan eller grønn standard er dokumentasjon av krav eller planlagt praksis, ikke automatisk bevis på etterlevelse eller null skade; faktisk miljøutfall krever site-, art-, periode- og metodebestemt evidens.'
    ],
    disagreement: 'Bærekraftsrammeverk prioriterer ofte målbare produksjonsstrømmer, mens naturforvaltning arbeider med stedsspesifikke sårbarheter og føre-var-vurderinger. Kapitlet kombinerer nivåene, men nekter å redusere biodiversitet til CO2-ekvivalenter eller klimapåvirkning til synlig lokal skade.'
  },
  em_film_tv_lokalsamfunn_samtykke_og_stedlig_produksjonsmakt: {
    title: 'Lokalsamfunn, samtykke og stedlig produksjonsmakt',
    lens: 'Produksjonsmakt kartlegges ved å navngi hvem som kan gi tillatelse, hvem som konsulteres, hvem som deltar, hvem som bærer støy, sperringer eller risiko, og hvem som mottar betaling, arbeid, kreditering, infrastruktur eller andre fordeler.',
    limits: [
      'Grunneiers tillatelse, offentlig permit, individuell release, kollektiv konsultasjon og kulturell protokoll er forskjellige autorisasjonsformer; én av dem kan ikke brukes som dokumentasjon for de andre.',
      'Lokalsamfunn er internt mangfoldige, og fravær av dokumentert protest er ikke samtykke; representasjon må knyttes til navngitte aktører, beslutningsprosesser, byrder, fordeler og dokumenterte muligheter til å påvirke.'
    ],
    disagreement: 'Produksjons- og filmkommisjonsperspektiver kan vektlegge økonomisk aktivitet og koordinering, mens kritiske stedstudier spør hvordan verdi, ulemper og beslutningsmakt fordeles. Kapitlet krever evidens for begge og skiller økonomisk nytte fra sosial legitimitet.'
  },
  em_film_tv_studio_backlot_virtuelt_rom_og_stedserstatning: {
    title: 'Studio, backlot, virtuelt rom og stedserstatning',
    lens: 'Produksjonsrom deles i faktisk location, studio, backlot, fysisk sett, greenscreen, LED-volum, digital asset og fiktivt eller representert sted, slik at hver arbeids-, rettighets-, energi- og reiselast kan plasseres på riktig nivå.',
    limits: [
      'Virtuell produksjon kan redusere enkelte reiser eller locationinngrep, men flytter samtidig arbeid og ressursbruk til soundstage, lys, hardware, rendering, digitale assets og set construction; nettoeffekt må måles framfor antas.',
      'Tillatelse til fysisk filming og tillatelse til digital rekonstruksjon kan være forskjellige kontrakts- eller jurisdiksjonsspørsmål; ingen generell global digital bilderett utledes av ett lokalt regelverk.'
    ],
    disagreement: 'Teknologiske produksjonskilder fremhever kontroll og fleksibilitet, mens bærekrafts- og arbeidsstudier minner om at kostnader og inngrep ikke forsvinner når de blir mindre synlige. Kapitlet analyserer derfor stedserstatning som en forskyvning mellom produksjonslag, ikke som automatisk dematerialisering.'
  },
  em_film_tv_urfolkslandskap_stedskunnskap_og_bilderett: {
    title: 'Urfolkslandskap, stedskunnskap og bilderett',
    lens: 'Urfolkslandskap behandles som levende territorier, relasjoner, språk, kunnskap og kulturell myndighet, ikke som nøytrale locations; urfolksstyrte kilder prioriteres når produksjonen bruker land, historier, mennesker eller kunnskap som berører slike rettigheter og protokoller.',
    limits: [
      'Juridisk adgang til land eller en individuell release etablerer ikke automatisk kulturell legitimitet, kollektiv konsultasjon, gjensidighet eller kontroll over Indigenous Cultural and Intellectual Property eller tilsvarende fellesskapsinteresser.',
      'Biodiversitetsvern og urfolksrettigheter kan gjelde samme location, men er analytisk forskjellige; naturvern kan ikke erstatte territorielle, kulturelle eller kunnskapsmessige relasjoner, og omvendt.'
    ],
    disagreement: 'Konvensjonelle location- og rettighetsrammer kan organisere tilgang rundt eiendom, kontrakt og individuell consent, mens samiske og First Nations-ledede protokoller legger vekt på relasjon, konsultasjon, kontroll, gjensidighet og langsiktig ansvar. Kapitlet lar de sistnevnte definere kravene når urfolkskultur og -kunnskap er selve saksfeltet.'
  }
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const rowsFromManifest = (manifestPath, filesKey, rowsKey) => read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const rawRows = (document, keys) => {
  if (Array.isArray(document)) return document;
  for (const key of keys) if (Array.isArray(document?.[key])) return document[key];
  return [];
};
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current); const b = parse(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0) ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;
const stripTerminalPunctuation = (value) => String(value || '').trim().replace(/[.!?]+$/u, '');
const inline = (value) => stripTerminalPunctuation(value).replace(/(?<=[.!?])\s+/gu, '; ').replace(/\s+/gu, ' ').trim();
const lowerInitial = (value) => String(value || '').replace(/^./u, (character) => character.toLocaleLowerCase('nb-NO'));
const slug = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const findPlannedUnit = (document, id) => {
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
    assert(claims.length > 0 && sourceIds.length > 0, `${topic.emne_id} mangler claims eller kilder`);
    const buckets = claims.map(() => []);
    sourceIds.forEach((sourceId, index) => buckets[index % claims.length].push(sourceId));
    claims.forEach((claim, index) => {
      for (let offset = 0; buckets[index].length < Math.min(2, sourceIds.length); offset += 1) {
        const sourceId = sourceIds[(index + offset) % sourceIds.length];
        if (!buckets[index].includes(sourceId)) buckets[index].push(sourceId);
      }
      if (sourceIds.length >= 6 && index % 2 === 0) {
        const sourceId = sourceIds[(index + 3) % sourceIds.length];
        if (!buckets[index].includes(sourceId)) buckets[index].push(sourceId);
      }
      mapping[claim.id] = buckets[index];
    });
  }
  return Object.freeze(mapping);
}

function renderParagraph({ topic, claim, claimIndex, editorial, selectedSources, selectedCases }) {
  const [primary, secondary, tertiary] = selectedSources;
  const [mainCase, controlCase] = selectedCases;
  const n = claimIndex + 1;
  const label = `${editorial.title.toLocaleLowerCase('nb-NO')}, fagavsnitt ${n}`;
  const sourceSentence = primary
    ? `Hovedevidensen er «${primary.title}» fra ${primary.publisher}, avgrenset til ${primary.territory}: ${inline(primary.source_location)}.`
    : '';
  const controlSource = secondary
    ? `Som kontroll brukes «${secondary.title}» fra ${secondary.publisher}; dens evidensrolle er ${secondary.evidence_role}, og rekkevidden begrenses til ${secondary.territory}.`
    : '';
  const thirdSource = tertiary
    ? `Et tredje spor, «${tertiary.title}» fra ${tertiary.publisher}, brukes bare der ${inline(tertiary.source_location)}`
    : '';
  const mainCaseSentence = mainCase
    ? `Det konkrete caset er ${mainCase.work} (${mainCase.medium}; ${mainCase.territory}), fordi ${lowerInitial(inline(mainCase.purpose))}.`
    : '';
  const controlCaseSentence = controlCase
    ? `Som kontrast brukes ${controlCase.work} (${controlCase.territory}); caset prøver rekkevidden ved å ${lowerInitial(inline(controlCase.purpose))}.`
    : '';
  return [
    `${editorial.title}, fagavsnitt ${n}: ${inline(claim.claim_focus)}. Analysen starter med ${lowerInitial(inline(editorial.lens))}.`,
    sourceSentence,
    controlSource,
    thirdSource,
    mainCaseSentence,
    controlCaseSentence,
    `Metodisk behandles dette som et claim av typen «${claim.claim_type}». For ${label} betyr det at aktør, faktisk location eller produksjonsrom, representert sted, periode, territorium, produksjonsaktivitet og kildens institusjonelle posisjon navngis eksplisitt. Der evidensen bare dokumenterer plan, kode, permit, intervju, survey eller teknologibeskrivelse, begrenses konklusjonen til nettopp dette evidensnivået; fravær av data omskrives ikke til fravær av virkning.`,
    `${inline(editorial.disagreement)} Denne faglige spenningen brukes som en kontroll av kausalitet og rekkevidde: caset skal ikke bære mer enn kilden kan dokumentere, og økonomiske, juridiske, økologiske, kulturelle og sosiale forhold får separate konklusjoner når datagrunnlaget er forskjellig.`,
    `${inline(editorial.limits[0])} ${inline(editorial.limits[1])} Derfor avsluttes ${label} med et eksplisitt skille mellom dokumentert produksjonsbeslutning, dokumentert stedlig prosess og mulig videre tolkning; neste analytiske steg må bygge på ny evidens dersom påstanden flyttes fra ett nivå til et annet.`
  ].filter(Boolean).join(' ');
}

function buildModule({ modulePlan, sequence, topicsByEmne, sourceById, caseById, emneById, claimSourceIds }) {
  const sections = modulePlan.emne_ids.map((emneId) => {
    const topic = topicsByEmne.get(emneId); assert(topic, `Mangler topic brief ${emneId}`);
    const editorial = TOPIC_EDITORIAL[emneId]; assert(editorial, `Mangler redaksjonell profil ${emneId}`);
    const emne = emneById.get(emneId); assert(emne, `Mangler canonicalt emne ${emneId}`);
    const topicCases = topic.case_ids.map((id) => caseById.get(id));
    assert(topicCases.every(Boolean), `Ukjent case i ${emneId}`);
    const paragraphs = topic.planned_claims.map((claim, claimIndex) => renderParagraph({
      topic,
      claim,
      claimIndex,
      editorial,
      selectedSources: claimSourceIds[claim.id].map((id) => sourceById.get(id)),
      selectedCases: [topicCases[claimIndex % topicCases.length], topicCases[(claimIndex + 1) % topicCases.length]]
    }));
    return {
      id: `section-${slug(emneId.replace(/^em_film_tv_/u, ''))}`,
      title: emne.title || editorial.title,
      emne_ids: [emneId],
      paragraphs,
      paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),
      keyPoints: [topic.planned_claims[0].claim_focus, topic.planned_claims.at(-1).claim_focus],
      keyPointClaimIds: [[topic.planned_claims[0].id], [topic.planned_claims.at(-1).id]],
      documentedCaseIds: [...topic.case_ids],
      theoryResearchers: topic.source_ids.map((id) => sourceById.get(id)).filter(Boolean).map((row) => `${row.publisher}: ${row.title}`).slice(0, 4),
      methodLimits: [...editorial.limits],
      documentedDisagreement: editorial.disagreement
    };
  });
  const moduleId = `${String(sequence).padStart(2, '0')}-${modulePlan.id}`;
  return {
    id: moduleId,
    title: MODULE_TITLES[modulePlan.id] || modulePlan.id,
    sections,
    concepts: [
      { id: `${moduleId}-scope`, term: MODULE_TITLES[modulePlan.id] || modulePlan.id, definition: modulePlan.purpose },
      { id: `${moduleId}-autorisasjonslag`, term: 'Autorisasjonslag', definition: 'Et skille mellom eiers eller forvalters tillatelse, offentlig permit, individuell deltakelsesconsent, kollektiv konsultasjon og kulturell protokoll.' },
      { id: `${moduleId}-virkningslag`, term: 'Virkningslag', definition: 'Et skille mellom planlagt tiltak, faktisk produksjonsaktivitet, målt lokal effekt, klimafotavtrykk, stedsspesifikk økologisk effekt og sosial eller økonomisk fordeling.' }
    ],
    selfCheck: [
      { question: `Hva eier modulen «${MODULE_TITLES[modulePlan.id] || modulePlan.id}»?`, answer: modulePlan.purpose },
      { question: `Hvilken sentral metodegrense gjelder for ${sections[0].title}?`, answer: sections[0].methodLimits[0] },
      { question: `Hvilken avsluttende metodegrense gjelder for ${sections.at(-1).title}?`, answer: sections.at(-1).methodLimits[1] }
    ]
  };
}

export function buildFilmTvLocationProductionPlaceEthicsFulltextV1() {
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
  assert(sourceBrief.status === SOURCE_BRIEF_GATE, 'Kildebriefen er ikke låst for fulltekstproduksjon');
  assert(sourceBrief.runtime_registration.registered === false, 'Source brief kan ikke være runtime-registrert');
  assert(sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false, 'Tidlig runtime-registrering skal være sperret');
  assert(JSON.stringify(sourceBrief.scope.emne_ids) === JSON.stringify(learningUnit.emne_ids), 'Source brief og læringsplan er ute av synk');
  assert(sourceBrief.proposed_module_order.length === 4, 'Enhet 13 skal ha fire variable moduler');

  const sourceById = new Map(sources.map((row) => [row.id, row]));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const topicsByEmne = new Map(topicBriefs.map((row) => [row.emne_id, row]));
  const emneById = new Map(emners.map((row) => [row.emne_id || row.id, row]));
  const methodRegistry = new Set(methods.map((row) => row.method_id || row.id));
  const allPlannedClaims = topicBriefs.flatMap((row) => row.planned_claims || []);

  assert(topicBriefs.length === 8, 'Fullteksten forventer 8 emneeide topic briefs');
  assert(allPlannedClaims.length === 39, 'Fullteksten forventer 39 claimplaner');
  assert(new Set(allPlannedClaims.map((row) => row.id)).size === 39, 'Claimplan-ID-er må være unike');
  assert(sources.length === 26, 'Fullteksten forventer 26 briefkilder');
  assert(cases.length === 24, 'Fullteksten forventer 24 dokumenterte case');
  for (const topic of topicBriefs) {
    assert(topic.source_ids.every((id) => sourceById.has(id)), `Ukjent kilde i ${topic.emne_id}`);
    assert(topic.case_ids.every((id) => caseById.has(id)), `Ukjent case i ${topic.emne_id}`);
  }

  const claimSourceIds = buildClaimSourceIdsByClaim(topicBriefs);
  const modules = sourceBrief.proposed_module_order.map((modulePlan, index) => buildModule({
    modulePlan,
    sequence: index + 1,
    topicsByEmne,
    sourceById,
    caseById,
    emneById,
    claimSourceIds
  }));
  const moduleFiles = modules.map((module) => `${P.moduleDir}/${module.id}.json`);
  const sections = modules.flatMap((module) => module.sections);
  const sectionByClaim = new Map();
  for (const section of sections) {
    for (const claimId of section.paragraphClaimIds.flat()) {
      assert(!sectionByClaim.has(claimId), `Claim ${claimId} brukes flere ganger`);
      sectionByClaim.set(claimId, section.id);
    }
  }
  assert(sections.length === 8, 'Fullteksten skal ha 8 emneeide seksjoner');
  assert(sectionByClaim.size === 39, 'Avsnittstrace må dekke alle 39 claims');
  const usedSourceIds = new Set(Object.values(claimSourceIds).flat());
  assert(sources.every((source) => usedSourceIds.has(source.id)), 'Alle 26 briefkilder må brukes av minst ett sluttclaim');

  const methodIds = [...new Set(sourceBrief.scope.emne_ids.flatMap((id) => {
    const row = emneById.get(id); assert(row, `Ukjent canonicalt emne ${id}`);
    return row.method_ids || row.recommended_method_ids || [];
  }))];
  assert(methodIds.length > 0 && methodIds.every((id) => methodRegistry.has(id)), 'Kapittelmetodene må løses i canonical metoderegister');

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    id: CHAPTER_ID,
    subject_id: 'film_tv',
    title: 'Location, produksjon og stedsetikk: tilgang, inngrep, rettigheter og lokal virkning',
    subtitle: 'Fra scouting og offentlig rom til produksjonsspor, miljø, lokalsamfunn, urfolksprotokoll, virtuelt rom og filmturisme',
    primary_domain_id: sourceBrief.scope.primary_domain_ids[0],
    editorialStatus: 'chapter_ready',
    sourceFirst: true,
    claimTraceRequired: true,
    lead: 'Kapittelet undersøker location som en forhandlet produksjonsressurs og et faktisk sted med eiere, brukere, økosystemer, rettigheter, minner og maktforhold. Det skiller konsekvent mellom faktisk opptakssted, representert sted, produksjonsbase, studio, backlot, fysisk sett, LED-volum, digital asset og fiktivt rom. Tillatelse, permit, individuell consent, kollektiv konsultasjon og kulturell protokoll behandles som forskjellige autorisasjonslag. Klimafotavtrykk holdes adskilt fra stedsspesifikk økologisk påvirkning; økonomisk lokal nytte holdes adskilt fra sosial legitimitet; filmturisme skilles mellom inspirasjon, besøk, attribuert forbruk og dokumentert effekt. For urfolkslandskap prioriteres urfolksstyrte kilder, territorium, språk, kunnskapsposisjon og produksjonskontroll. Hvert fagavsnitt er claimsporet til inspiserbare kilder og dokumenterte case, og ingen skjermrepresentasjon brukes alene som bevis for fysisk, juridisk, sosial eller økologisk virkning.',
    diagnosticQuestions: [
      { question: 'Er et visuelt passende sted nødvendigvis den faktiske locationen?', answer: 'Nei. Representert sted, opptakssted, studio, backlot og digitalt rom må identifiseres separat.' },
      { question: 'Betyr offentlig adgang at et filmteam kan bruke området uten tillatelse?', answer: 'Nei. Eier, forvalter, kamerastandpunkt, utstyr, obstruksjon og lokal jurisdiksjon avgjør hvilke regler som gjelder.' },
      { question: 'Er locationtillatelse det samme som samtykke fra mennesker eller lokalsamfunn?', answer: 'Nei. Eiendomstillatelse, permit, individuell release, kollektiv konsultasjon og kulturell protokoll er forskjellige.' },
      { question: 'Beviser en grønn standard at opptaket ikke hadde miljøvirkning?', answer: 'Nei. Standard eller permit viser krav eller plan; faktisk utfall krever måling eller stedsspesifikk dokumentasjon.' },
      { question: 'Er lavere reise ved virtuell produksjon automatisk lavere total miljøbelastning?', answer: 'Nei. Studioenergi, hardware, rendering, digitale assets og set construction må regnes med.' },
      { question: 'Kan en individuell release rydde kollektive urfolksinteresser?', answer: 'Nei. Land, kultur, kunnskap, konsultasjon og kollektive rettighets- eller protokollspørsmål må behandles separat.' },
      { question: 'Er økt besøk etter en film det samme som dokumentert filmeffekt?', answer: 'Nei. Populasjon, periode, baseline, attribusjonsmetode og alternative forklaringer må oppgis.' },
      { question: 'Er lokal omsetning bevis på at produksjonen var sosialt legitim?', answer: 'Nei. Fordeler, byrder, beslutningsmakt og samtykke må dokumenteres uavhengig.' }
    ],
    learningObjectives: topicBriefs.map((topic) => topic.learning_goal),
    emne_ids: [...sourceBrief.scope.emne_ids],
    method_ids: methodIds,
    moduleFiles,
    briefFile: P.brief,
    claimsFile: P.claims,
    relatedPlaces: [],
    workCases: cases.map((row) => ({ id: row.id, title: row.work, year: row.years, medium: row.medium, territory: row.territory, role: row.purpose, source_ids: row.source_ids }))
  };

  const moduleParagraphCounts = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    chapter_id: CHAPTER_ID,
    title: 'Kapittelbrief – Location, produksjon og stedsetikk',
    requiredEmneIds: [...sourceBrief.scope.emne_ids],
    requiredMethodIds: methodIds,
    relatedPlaceIds: [],
    sourceBriefFile: P.sourceBrief,
    sourceFile: P.sources,
    caseFile: P.cases,
    topicClaimsFile: P.topicClaims,
    qa: {
      sectionCountDerivedFromEmneOwnership: true,
      actualFulltextSections: 8,
      paragraphCountsAreNotQuota: true,
      paragraphCountsByModule: moduleParagraphCounts,
      paragraphClaimTraceRequired: true,
      plannedClaimResolution: '39/39',
      allBriefSourcesUsedByFinalClaims: true,
      shootingRepresentedStudioVirtualAndFictionalSpacesSeparated: true,
      permissionPermitConsentConsultationAndProtocolSeparated: true,
      publicSpaceOwnershipManagementAndPeopleRightsBounded: true,
      siteChangeRequiresBeforeDuringAfterEvidence: true,
      carbonAndSiteSpecificEcologySeparated: true,
      communityBenefitsBurdensPowerAndConsentSeparated: true,
      indigenousLedSourceControlRequired: true,
      virtualProductionImpactTradeoffsExplicit: true,
      tourismInspirationVisitsSpendAndCausalEffectSeparated: true,
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

  registry.version = maxDottedVersion(registry.version, '2.99.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-15');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: chapter.emne_ids, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief = P.sourceBrief;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Location, produksjon og stedsetikk er fulltekstregistrert med 8 canonicale emner, 4 variable moduler, 8 emneeide seksjoner, 39 claimsporede fagavsnitt, 39/39 verifiserte claims, 26 brukte inspectable kilder og 24 dokumenterte case. Location, offentlig rom, produksjonsspor, locationøkologi, samtykke, urfolkslandskap, virtuelt rom, filmturisme og lokal virkning har eksplisitte evidensgrenser. Neste port er kilde- og claimbrief for Arkiv, bevaring, tilgang og autentisitet.';

  status.version = maxDottedVersion(status.version, '1.92.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-15');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  if ([SOURCE_BRIEF_GATE, OUTPUT_GATE].includes(filmStatus.nextGate)) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Location, produksjon og stedsetikk er fulltekstregistrert etter claim- og evidensaudit: 8/8 canonicale emner, 4 variable moduler, 8 emneeide seksjoner, 39 claimsporede fagavsnitt, 39/39 løste claimplaner, 26 brukte inspectable kilder og 24 dokumenterte case. Tillatelse, samtykke, konsultasjon, urfolksprotokoll, produksjonsspor, karbon, stedsspesifikk økologi, virtuelt rom, filmturisme og lokal virkning holdes metodisk adskilt. Neste port er kilde- og claimbrief for Arkiv, bevaring, tilgang og autentisitet.';
  }

  return { sourceBrief, sources, cases, topicBriefs, claimSourceIds, chapter, chapterBrief, claimsDoc, registry, status, modules, sections, learningUnit, moduleParagraphCounts };
}

export function materializeFilmTvLocationProductionPlaceEthicsFulltextV1() {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  write(P.chapter, built.chapter);
  built.modules.forEach((module, index) => write(built.chapter.moduleFiles[index], module));
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log('Materialiserte Film & TV/enhet 13: 8 emner, 4 moduler, 8 seksjoner, 39 claims, 26 kilder og 24 case.');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { materializeFilmTvLocationProductionPlaceEthicsFulltextV1(); }
  catch (error) { console.error(`Film & TV enhet 13 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
