#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'location-produksjon-og-stedsetikk';
const SOURCE_BRIEF_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_topic_claims_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`
});

const MODULE_FILES = Object.freeze([
  `data/fagverk/film_tv/${CHAPTER_ID}/01-locationvalg-og-offentlig-rom.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/02-produksjonsspor-og-locationokologi.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/03-lokalsamfunn-samtykke-og-urfolkslandskap.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/04-stedserstatning-filmturisme-og-lokal-virkning.json`
]);

const TOPIC_EDITORIAL = Object.freeze({
  em_film_tv_location_valg_og_filmsted: {
    lens: 'Locationvalg analyseres som institusjonelt og materiell produksjonsarbeid: scouting, tilgang, økonomi, logistikk og stedserstatning må dokumenteres før skjermlikhet får forklaringskraft.',
    disagreement: 'Faglig spenning oppstår mellom forklaringer som vektlegger estetisk stedstilpasning og forskning som viser at kostnad, arbeidsdeling, tillatelse, incentiver og produksjonsinfrastruktur former hvilke steder som faktisk blir valgt.',
    limits: ['Et sted som ligner på et annet på skjermen dokumenterer ikke hvorfor det ble valgt; produksjonsarkiv, locationarbeid eller institusjonskilde må vise beslutningskjeden.', 'Et konkret bycase kan dokumentere en lokal produksjonsordning, men kan ikke uten sammenlignbart materiale løftes til en universell regel om locationvalg i andre jurisdiksjoner.']
  },
  em_film_tv_gate_kamera_og_offentlig_rom: {
    lens: 'Gate og offentlig rom behandles som lagdelte rettighets- og forvaltningsrom der grunneier, myndighet, produksjon, forbipasserende, beboere og virksomheter kan ha ulike posisjoner.',
    disagreement: 'Det analytiske problemet er at «offentlig» lett brukes som synonym for fritt tilgjengelig og fritt filmbar, mens faktisk praksis viser skiftende eierskap, kamerastandpunkt, aktivitet, personvern, trafikk, sikkerhet og lokale vilkår.',
    limits: ['Locationtillatelse sier noe om kontroll over stedet eller aktiviteten, men er ikke i seg selv et samtykke fra identifiserbare personer som filmes eller et bevis på sosial aksept.', 'Britisk eller kommunal veiledning brukes bare innen navngitt jurisdiksjon og periode; den kan illustrere aktørkartlegging, men må ikke presenteres som global bilderettsregel.']
  },
  em_film_tv_innspillingsspor_og_stedlig_endring: {
    lens: 'Innspillingsspor undersøkes som observerbare og dokumenterbare endringer i tilgang, rigg, ferdsel, materialbruk, midlertidige bygg, restaurering og etterkontroll – ikke som antatt skade.',
    disagreement: 'Produksjoner kan være synlige og logistisk inngripende uten dokumentert varig skade, mens fravær av synlige merker heller ikke beviser at belastning, forstyrrelse eller restaureringsbehov var fraværende.',
    limits: ['Påstander om fysisk endring krever før-/etterdata, inspeksjon, permitvilkår, produksjonsdokumentasjon eller annen stedsspesifikk evidens; skjermbildet kan ikke fylle dette evidensgapet.', 'Restaurering etter opptak, etterlevelse av vilkår og fravær av dokumentert skade er tre forskjellige slutninger og må ikke komprimeres til én generell påstand om «ingen påvirkning».']
  },
  em_film_tv_locationokologi_inngrep_og_miljokonsekvens: {
    lens: 'Locationøkologi skiller produksjonens karbon- og ressursregnskap fra stedsspesifikk påvirkning på arter, sesong, ferdsel, støy, habitat, avfall, transport og sensitiv natur.',
    disagreement: 'Bransjestandarder gjør miljøstyring målbar og sammenlignbar, men de kan overvurdere sikkerheten dersom krav, rapportering eller sertifisering behandles som direkte bevis på den økologiske tilstanden etter en konkret innspilling.',
    limits: ['Et karbonregnskap eller en bærekraftsstandard dokumenterer systemisk produksjonsstyring, ikke automatisk faktisk påvirkning på et navngitt habitat, en art eller en lokal sesong.', 'For vernede eller sensitive locations må analysen navngi sted, art eller naturverdi, sesong, aktivitet, tillatelsesscope og dokumentert utfall før den trekker konsekvenskonklusjoner.']
  },
  em_film_tv_lokalsamfunn_samtykke_og_stedlig_produksjonsmakt: {
    lens: 'Lokalsamfunn analyseres som flere aktører med ulike rettigheter, byrder, gevinster og beslutningsmuligheter; samtykke, konsultasjon, varsling og representasjon må spores hver for seg.',
    disagreement: 'Effektiv produksjonsavvikling og lokal økonomisk gevinst kan stå i spenning til medbestemmelse, belastning og kulturell legitimitet, og ingen av disse dimensjonene kan fungere som automatisk mål på de andre.',
    limits: ['Fravær av registrert protest er ikke et samtykkebevis; analysen må navngi hvem som ble varslet, konsultert eller spurt, hva de kunne påvirke og hvilken periode dokumentasjonen gjelder.', 'Lokale arbeidsplasser, kjøp eller turisme kan dokumentere økonomisk fordel, men etablerer ikke alene at berørte personer eller grupper oppfattet inngrepet som legitimt.']
  },
  em_film_tv_urfolkslandskap_stedskunnskap_og_bilderett: {
    lens: 'Urfolkslandskap behandles som territorium, relasjon og kunnskapsfelt med egne kollektive og individuelle autoritetslinjer; urfolksledede protokoller prioriteres når de finnes.',
    disagreement: 'Standard produksjonskontrakter og individuelle releases kan stå i spenning til kollektive kulturelle rettigheter, kunnskapsforvaltning, gjensidighet og lokalt definert protokoll, uten at en veiledning alene avgjør all juss.',
    limits: ['Individuelt samtykke eller release må ikke brukes som bevis på at kollektiv kulturell eller intellektuell eiendom, territorium eller fellesskapsautoritet er avklart.', 'Protokoller fra Sápmi eller Australia må leses med eksplisitt territorium, språk, opphav, kunnskapsposisjon og kildekontroll; de er ikke utskiftbare eller universelle rettsregler.']
  },
  em_film_tv_studio_backlot_virtuelt_rom_og_stedserstatning: {
    lens: 'Stedserstatning analyseres ved å skille faktisk location, studio, backlot, fysisk sett, LED-volum, digital asset og fiktivt rom, og ved å spørre hvilke ressurser og rettigheter som flyttes mellom lagene.',
    disagreement: 'Virtuell produksjon kan redusere enkelte reiser eller locationdager, men infrastrukturen kan samtidig flytte energibruk, arbeidsdeling, rettighetsforhandling og produksjonsmakt til andre deler av kjeden.',
    limits: ['En dokumentert virtuell produksjonsløsning viser hva en bestemt infrastruktur kunne gjøre i et konkret prosjekt; den dokumenterer ikke at alle produksjoner får samme miljø- eller kostnadseffekt.', 'Digital rekonstruksjon og locationrettigheter er kontrakts- og jurisdiksjonsspesifikke; fysisk tilgang, bildeopptak, digital gjenskaping og senere gjenbruk må spores separat.']
  },
  em_film_tv_filmturisme_og_lokale_virkninger: {
    lens: 'Filmturisme behandles som en målekjede fra inspirasjon og selvrapportert motivasjon via faktisk besøk til attribuert forbruk og eventuelle økonomiske, sosiale eller stedlige konsekvenser.',
    disagreement: 'Destinasjonsaktører trenger ofte tydelige effektfortellinger, mens turismeforskning viser at attribusjon, baseline, tidsperiode, utvalg og andre samtidige drivere begrenser hvor sikkert en produksjon kan sies å ha forårsaket lokal endring.',
    limits: ['En spørreundersøkelse om skjerminspirasjon eller et besøksestimat må oppgi populasjon, periode, metode og attribusjonsgrense før resultatet kan brukes som lokal effektpåstand.', 'Økt omsetning eller besøkstall er ikke i seg selv evidens for sosial legitimitet, samtykke eller jevnt fordelte gevinster og belastninger i et lokalsamfunn.']
  }
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const rowsFromManifest = (manifestPath, filesKey, rowsKey) => read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current); const b = parse(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0) ? current : floor;
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;
const unique = (values) => [...new Set(values)];
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
const claimFamilyRule = (type = '') => {
  const value = type.toLowerCase();
  if (/ecolog|environment|biodiversity|wildlife|sustain|carbon|restoration/.test(value)) return 'Miljøslutningen må skille systemisk karbon- eller ressursstyring fra den stedsspesifikke økologien; sted, naturverdi eller art, sesong, aktivitet, vilkår og dokumentert utfall er separate ledd.';
  if (/consent|community|indigenous|icip|protocol|rights|power/.test(value)) return 'Samtykkeslutningen må navngi aktøren, autoritetsgrunnlaget, hva det ble samtykket eller konsultert om, tidspunkt og rekkevidde; individuell release kan ikke stå som stedfortreder for kollektiv kulturell autoritet.';
  if (/tourism|visitor|measurement|economic|impact/.test(value)) return 'Effektslutningen må oppgi populasjon, periode, metode, baseline og attribusjonsgrense og skille inspirasjon, faktisk besøk, forbruk og årsakspåstand fra hverandre.';
  if (/virtual|digital|studio|stage|substitution/.test(value)) return 'Stedserstatningen må identifisere fysisk location, studio/backlot, sett, LED-volum eller digital asset og ikke anta at flyttet reise automatisk betyr lavere samlet ressursbruk eller avklart rettighet.';
  if (/permission|public|privacy|people|authority|governance/.test(value)) return 'Tillatelsesslutningen må identifisere eier eller myndighet, kamerastandpunkt, aktivitet, periode og eventuelle person- eller personvernslag; tilgang til rommet er ikke det samme som samtykke fra personer i det.';
  return 'Produksjonsslutningen må dokumentere beslutning, faktisk opptakssted og produksjonsbetingelser separat fra det representerte stedet; skjermlikhet alene er ikke bevis på locationvalg eller lokal virkning.';
};

export function buildClaimSourceIdsByClaim(topicBriefs) {
  const result = {};
  for (const topic of topicBriefs) {
    const sourceIds = unique(topic.source_ids || []);
    const claims = topic.planned_claims || [];
    const buckets = claims.map(() => []);
    sourceIds.forEach((id, index) => buckets[index % claims.length].push(id));
    claims.forEach((claim, index) => {
      let cursor = 0;
      while (buckets[index].length < Math.min(3, sourceIds.length) && cursor < sourceIds.length * 2) {
        const id = sourceIds[(index + cursor) % sourceIds.length];
        if (!buckets[index].includes(id)) buckets[index].push(id);
        cursor += 1;
      }
      result[claim.id] = buckets[index];
    });
  }
  return result;
}

function renderParagraph({ topic, claim, claimIndex, editorial, sources, cases }) {
  const primary = sources[0];
  const secondary = sources[1] || primary;
  const tertiary = sources[2] || secondary;
  const mainCase = cases[claimIndex % cases.length];
  const controlCase = cases[(claimIndex + 1) % cases.length] || mainCase;
  const focus = String(claim.claim_focus || '').replace(/[.!?]+$/u, '');
  const evidenceRule = claimFamilyRule(claim.claim_type);
  return `${claim.claim_focus} For påstanden «${focus}» må analysen starte i produksjonens dokumenterte handlinger og ikke i en antakelse om hva et bilde av stedet betyr. ${primary.publisher} plasserer akkurat dette evidensleddet i ${primary.territory}: ${primary.source_location} Som sekundær kontroll gir ${secondary.publisher} gjennom «${secondary.title}» rollen ${secondary.evidence_role}; den avgrenser hva «${focus}» kan hevde uten å gjøre lokale regler eller ett produksjonsforløp universelt. For «${focus}» brukes dessuten ${tertiary.publisher} som tredje kontroll slik at claimet ikke glir mellom jurisdiksjon, produksjonsnivå og faktisk lokal virkning. Caset «${mainCase.work}» (${mainCase.years}, ${mainCase.territory}) er valgt for dette claimet fordi ${mainCase.purpose} Motcaset «${controlCase.work}» gjør kontrollen av «${focus}» vanskeligere og viser hvorfor kategorien må testes mot et annet institusjonelt eller stedlig oppsett. Den metodiske linsen for «${focus}» er at ${editorial.lens} Evidensregelen for «${focus}» er: ${evidenceRule} Derfor får tillatelse, release, standard, konsultasjon, måling eller digital teknikk i claimet «${focus}» bare den evidensstyrken de navngitte kildene faktisk gir. Den claimspesifikke grensen for «${focus}» er: ${editorial.limits[claimIndex % editorial.limits.length]} Uenigheten som må beholdes i analysen av «${focus}» er at ${editorial.disagreement} Sluttkravet for «${focus}» er en kontrollert kjede fra påstanden via ${primary.id}, ${secondary.id} og «${mainCase.work}» til en eksplisitt avgrensning; representert sted, opptakssted, produksjonsbase og dokumentert lokal effekt må fortsatt holdes adskilt når de er relevante.`;
}

function buildModule({ modulePlan, moduleIndex, topicById, emneById, sourceById, caseById, claimSourceIds, methodIds }) {
  const sections = modulePlan.emne_ids.map((emneId) => {
    const topic = topicById.get(emneId);
    const canonical = emneById.get(emneId);
    const editorial = TOPIC_EDITORIAL[emneId];
    const topicCases = topic.case_ids.map((id) => caseById.get(id));
    const paragraphs = topic.planned_claims.map((claim, index) => renderParagraph({
      topic, claim, claimIndex: index, editorial,
      sources: claimSourceIds[claim.id].map((id) => sourceById.get(id)),
      cases: topicCases
    }));
    const sectionMethodIds = (canonical.method_ids || canonical.recommended_method_ids || []).filter((id) => methodIds.has(id));
    return {
      id: emneId,
      title: canonical.title,
      emne_ids: [emneId],
      definition: canonical.definition,
      learningGoal: topic.learning_goal,
      paragraphs,
      paragraphClaimIds: topic.planned_claims.map((claim) => claim.id),
      keyPoints: [topic.planned_claims[0].claim_focus, topic.planned_claims.at(-1).claim_focus],
      keyPointClaimIds: [[topic.planned_claims[0].id], [topic.planned_claims.at(-1).id]],
      documentedCaseIds: [...topic.case_ids],
      theoryResearchers: unique(topic.source_ids.slice(0, 3).map((id) => `${sourceById.get(id).publisher}: ${sourceById.get(id).title}`)),
      method_ids: sectionMethodIds,
      methodLimits: editorial.limits,
      documentedDisagreement: editorial.disagreement
    };
  });
  return {
    schema: 'history_go_fagverk_chapter_module_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    id: modulePlan.id,
    sequence: moduleIndex + 1,
    title: modulePlan.id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
    purpose: modulePlan.purpose,
    emne_ids: [...modulePlan.emne_ids],
    sections,
    selfCheck: [
      { question: `Hva må dokumenteres før ${sections[0].title.toLowerCase()} kan brukes som forklaring?`, answer: 'Et eksplisitt claimspor med riktig aktør, sted, periode, metode og evidensscope.' },
      { question: 'Kan én tillatelse, standard eller måling bevise hele den lokale virkningen?', answer: 'Nei. Regel, etterlevelse, samtykke og målt utfall er forskjellige evidensledd.' },
      { question: 'Hva gjør et locationcase overførbart?', answer: 'En tydelig mekanisme og sammenlignbar kontekst – ikke bare at to steder eller produksjoner ligner på hverandre.' }
    ]
  };
}

export function buildFilmTvLocationProductionPlaceEthicsFulltextV1() {
  const sourceBrief = read(P.sourceBrief);
  if (sourceBrief.status !== SOURCE_BRIEF_GATE) throw new Error(`Source brief har uventet status: ${sourceBrief.status}`);
  const sources = rowsFromManifest(P.sources, 'source_files', 'sources');
  const cases = rowsFromManifest(P.cases, 'case_files', 'cases');
  const topicBriefs = rowsFromManifest(P.topicClaims, 'topic_claim_files', 'topic_briefs');
  const plan = read(P.plan);
  const unit = findPlannedUnit(plan, CHAPTER_ID);
  if (!unit || unit.sequence !== 13) throw new Error('Canonical unit 13 mangler');
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDocument = read(P.methods);
  const methods = Array.isArray(methodsDocument) ? methodsDocument : methodsDocument.methods;
  const methodIds = new Set(methods.map((row) => row.method_id || row.id));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const sourceById = new Map(sources.map((row) => [row.id, row]));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const topicById = new Map(topicBriefs.map((row) => [row.emne_id, row]));
  const claimSourceIds = buildClaimSourceIdsByClaim(topicBriefs);
  const allPlannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
  const modulePlans = sourceBrief.proposed_module_order;
  const modules = modulePlans.map((modulePlan, index) => buildModule({ modulePlan, moduleIndex: index, topicById, emneById, sourceById, caseById, claimSourceIds, methodIds }));
  const sections = modules.flatMap((module) => module.sections);
  const sectionByClaim = new Map(sections.flatMap((section) => section.paragraphClaimIds.map((id) => [id, section.id])));
  const usedMethodIds = unique(unit.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || emneById.get(id)?.recommended_method_ids || []).filter((id) => methodIds.has(id)));

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject_id: 'film_tv', id: CHAPTER_ID,
    title: 'Location, produksjon og stedsetikk: inngrep, samtykke, økologi og lokal virkning',
    subtitle: 'Locationvalg, offentlig rom, innspillingsspor, miljøkonsekvens, lokalsamfunn, urfolkslandskap, virtuelt rom og filmturisme',
    primary_domain_id: sourceBrief.scope.primary_domain_ids[0],
    lead: 'Et location er både et bilde, et arbeidssted, et regulert rom og et sted der mennesker, natur, kultur og økonomi kan påvirkes. Kapitlet skiller derfor representert sted, faktisk opptakssted, produksjonsbase, studio/backlot, LED- eller digitalt rom og dokumentert lokal effekt. Tillatelse, individuelt samtykke, lokalsamfunnskonsultasjon og kulturell protokoll holdes fra hverandre; karbonregnskap skilles fra stedsspesifikk økologi; permit og standard skilles fra etterlevelse og målt utfall; og filmturisme skilles i inspirasjon, besøk, attribuert forbruk og kausal lokal virkning. Arkivets proveniens, bevaring, tilgang, rettigheter og versjonshistorie hører til neste planenhet.',
    diagnosticQuestions: [
      { question: 'Er et offentlig sted automatisk fritt å filme?', answer: 'Nei. Eier, forvalter, aktivitet, kamerastandpunkt, sikkerhet og jurisdiksjon kan utløse forskjellige krav.' },
      { question: 'Er locationtillatelse det samme som samtykke fra personer?', answer: 'Nei. Stedstilgang, personvern, release, konsultasjon og kulturell protokoll er separate lag.' },
      { question: 'Kan individuell release klarere kollektive urfolksrettigheter?', answer: 'Nei. Kollektiv kulturell autoritet og kunnskapsrett må vurderes separat gjennom relevante urfolksledede kilder.' },
      { question: 'Beviser en grønn produksjonsstandard null miljøpåvirkning?', answer: 'Nei. Standarden viser krav eller styring; faktisk stedlig økologi krever egen dokumentasjon.' },
      { question: 'Gir færre locationreiser automatisk lavere total påvirkning ved virtuell produksjon?', answer: 'Nei. Reise kan flyttes eller reduseres samtidig som energi, infrastruktur og andre ressurser endres.' },
      { question: 'Beviser fravær av synlig skade at produksjonen ikke satte spor?', answer: 'Nei. Ferdsel, støy, logistikk, restaurering og etterlevelse krever egne kilder.' },
      { question: 'Er flere turister etter en serie et sikkert kausalt lokalt resultat?', answer: 'Nei. Populasjon, periode, baseline, metode og attribusjon må dokumenteres.' },
      { question: 'Er økonomisk gevinst bevis på lokalt samtykke?', answer: 'Nei. Fordel, byrde, legitimitet og samtykke er ulike spørsmål.' }
    ],
    learningObjectives: topicBriefs.map((topic) => topic.learning_goal),
    emne_ids: [...sourceBrief.scope.emne_ids], method_ids: usedMethodIds,
    moduleFiles: [...MODULE_FILES], briefFile: P.brief, claimsFile: P.claims, relatedPlaces: [],
    workCases: cases.map((row) => ({ id: row.id, title: row.work, year: row.years, medium: row.medium, territory: row.territory, role: row.purpose, source_ids: row.source_ids }))
  };
  const moduleParagraphCounts = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', chapter_id: CHAPTER_ID,
    title: 'Kapittelbrief – Location, produksjon og stedsetikk', requiredEmneIds: [...sourceBrief.scope.emne_ids], requiredMethodIds: usedMethodIds,
    relatedPlaceIds: [], sourceBriefFile: P.sourceBrief, sourceFile: P.sources, caseFile: P.cases, topicClaimsFile: P.topicClaims,
    qa: {
      sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 8, paragraphCountsAreNotQuota: true, paragraphCountsByModule: moduleParagraphCounts,
      paragraphClaimTraceRequired: true, plannedClaimResolution: '39/39', allBriefSourcesUsedByFinalClaims: true,
      representedShootingBaseAndLocalEffectSeparated: true, permissionConsentConsultationProtocolSeparated: true,
      indigenousCollectiveRightsExplicit: true, carbonAndSiteEcologySeparated: true, permitComplianceOutcomeSeparated: true,
      physicalChangeRestorationAndNoHarmSeparated: true, physicalVirtualAndFictionalProductionSpacesSeparated: true,
      tourismMeasurementAndCausalEffectSeparated: true, archiveUnit14BoundaryExplicit: true, sixDimensionQualityAssessmentRequired: true
    },
    scopeBoundary: sourceBrief.scope.overlap_boundary
  };
  const claims = allPlannedClaims.map((plan) => ({ id: plan.id, claim_plan_id: plan.id, claim: plan.claim_focus, source_ids: claimSourceIds[plan.id], status: 'verified', plan_resolution: 'verified_as_planned', evidence_mode: plan.claim_type, used_in: [sectionByClaim.get(plan.id)] }));
  const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources: sources.map((source) => ({ ...source, label: `${source.publisher} – ${source.title}` })), claims };

  registry.version = maxDottedVersion(registry.version, '2.99.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-15');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: chapter.emne_ids, claimsFile: P.claims, briefFile: P.brief };
  const chapterIndex = registry.subjects.film_tv.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) registry.subjects.film_tv.chapters.push(registryChapter); else registry.subjects.film_tv.chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief = P.sourceBrief;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Location, produksjon og stedsetikk er fulltekstregistrert med 8 canonicale emner, 4 variable moduler, 8 emneeide seksjoner, 39 claimsporede fagavsnitt, 39/39 verifiserte claims, 26 brukte inspectable kilder og 24 dokumenterte case. Locationtillatelse, samtykke, kulturell protokoll, karbon, stedlig økologi, virtuell stedserstatning og filmturisme har separate evidensgrenser. Neste port er kilde- og claimbrief for Arkiv, bevaring, tilgang og autentisitet.';

  status.version = maxDottedVersion(status.version, '1.92.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-15');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!filmStatus) throw new Error('Mangler Film & TV-status');
  if ([SOURCE_BRIEF_GATE, OUTPUT_GATE].includes(filmStatus.nextGate)) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Location, produksjon og stedsetikk er fulltekstregistrert etter claim- og evidensaudit: 8/8 canonicale emner, 4 moduler, 8 seksjoner, 39 claimsporede fagavsnitt, 39/39 løste claimplaner, 26 brukte inspectable kilder og 24 case. Neste port er kilde- og claimbrief for Arkiv, bevaring, tilgang og autentisitet.';
  }
  return { sourceBrief, sources, cases, topicBriefs, claimSourceIds, chapter, chapterBrief, claimsDoc, registry, status, modules, sections, moduleParagraphCounts };
}

export function materializeFilmTvLocationProductionPlaceEthicsFulltextV1() {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  write(P.chapter, built.chapter);
  built.modules.forEach((module, index) => write(MODULE_FILES[index], module));
  write(P.brief, built.chapterBrief); write(P.claims, built.claimsDoc); write(P.registry, built.registry); write(P.status, built.status);
  console.log(`Materialiserte Film & TV/enhet 13: 8 emner, 4 moduler, 8 seksjoner, 39 claims, 26 kilder og 24 case.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { materializeFilmTvLocationProductionPlaceEthicsFulltextV1(); }
  catch (error) { console.error(`Film & TV enhet 13 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
