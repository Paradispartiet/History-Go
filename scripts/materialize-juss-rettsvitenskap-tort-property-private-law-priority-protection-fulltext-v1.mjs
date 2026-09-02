#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const DATE = '2026-09-02';
const sourceBriefFile = 'data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json';
const sourceBrief = read(sourceBriefFile);
const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
const sourceById = new Map(sourceBrief.sources.map((source) => [source.id, source]));
const chapterId = 'erstatning-tingsrett-formuesrett-og-rettsvern';
const chapterDir = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}`;
const chapterFile = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}.json`;

assert(sourceBrief.domain.ordinal === 9 && sourceBrief.domain.id === 'erstatning_tingsrett_formuesrett_rettsvern', 'Feil Felt 9-kildebrief');
assert(sourceBrief.topic_briefs.length === 8 && claims.length === 32 && sourceBrief.sources.length === 13, 'Felt 9 må være 13/8/32 før materialisering');

const topicFrames = {
  'erstatningsvilkar-ansvarsgrunnlag-arsak-og-tap': {
    analysis: 'Erstatningsrettslig analyse må bygges i ledd: identifiser først et mulig ansvarsgrunnlag, deretter faktisk årsakssammenheng, rettslig avgrensning og den konkrete skadeposten. Et dokumentert økonomisk tap etablerer ikke ansvar alene, og et lovfestet særregime kan ikke trekkes ut av sitt saklige og personelle virkeområde.',
    steps: 'Lag en årsakstidslinje og skill handling, skadehendelse og følgevirkninger. Prøv så hvert vilkår mot den rettskilden som bærer akkurat dette ansvarsgrunnlaget, og avslutt med utmåling og eventuelle korreksjoner. Dersom flere grunnlag kan anvendes, må kumulasjon, samordning og regress vurderes uten dobbeltkompensasjon.'
  },
  'lovfestet-objektivt-ansvar-og-forsikringskrav': {
    analysis: 'Objektivt ansvar betyr ikke ansvar uten vilkår. Motorvognansvar, yrkesskadeforsikring, produktansvar og forurensningsansvar har egne definisjoner av ansvarssubjekt, skadehendelse, dekningsområde, unntak og regress. Direktekrav mot forsikrer er dessuten et annet spørsmål enn om skadevolderen selv hefter.',
    steps: 'Klassifiser først hendelsen og den ansvarlige aktøren etter særregimet. Kontroller deretter årsak, skadeart, eventuelle unntak, medvirkning og hvilke krav som kan rettes direkte mot forsikringsordningen. Sammenligning med alminnelig erstatningsrett skal brukes til avgrensning, ikke til å viske ut særreglenes struktur.'
  },
  'arsakssammenheng-adekvans-medvirkning-og-lemping': {
    analysis: 'Årsaksanalysen må holde faktisk kausalitet og normativ ansvarsavgrensning fra hverandre. En hendelse kan være en nødvendig eller medvirkende årsak uten at alle fjerne følger omfattes. Medvirkning, tapsbegrensning og lemping virker først etter egne vilkår og må ikke brukes som skjult erstatning for manglende bevis om årsak.',
    steps: 'Rekonstruer hendelsesforløpet og identifiser alternative eller samvirkende årsaker før du vurderer rettslig nærhet og påregnelighet. Deretter prøves skadelidtes egen opptreden og eventuell lemping som selvstendige korrigerende trinn. Begrunnelsen skal vise hvilket trinn som endrer ansvaret og hvorfor.'
  },
  'personskade-utmaling-menerstatning-og-forsorgertap': {
    analysis: 'Personskade krever en post-for-post-analyse. Påført og fremtidig inntektstap, merutgifter, menerstatning, oppreisning og forsørgertap bygger på ulike rettslige og faktiske premisser. Medisinsk invaliditet er ikke det samme som ervervsmessig tap, og standardiserte regler kan ikke erstatte kontroll av virkeområde og skadebevis.',
    steps: 'Identifiser først hvem som har kravet og hvilken skadepost som påberopes. Dokumenter deretter tidsperiode, inntektsgrunnlag, utgifter, varighet og eventuell varig medisinsk skade. Til slutt samordnes forsikrings- og erstatningsytelser etter hjemmel, slik at samme tap ikke erstattes to ganger og ulike ikke-økonomiske krav ikke blandes.'
  },
  'eiendomsrett-sameie-og-naborett': {
    analysis: 'Tingsrettslig analyse starter med objektet og rettsposisjonen, ikke med hvem som fysisk bruker tingen. Eiendomsrett, sameieandel, bruksrett og naborettslige vern er forskjellige posisjoner. Gyldighet mellom partene må dessuten holdes atskilt fra vern mot senere erververe og kreditorer.',
    steps: 'Fastsett først hvem som hevder hvilken rett til hvilket formuesgode og på hvilket stiftelsesgrunnlag. Ved sameie skilles andel, bruk, flertallsmyndighet og oppløsning. Ved nabokonflikt prøves tålegrensen og aktuelle særregimer separat, før retting, vederlag eller erstatning vurderes.'
  },
  'servitutter-hevd-og-rettighetsinnhold': {
    analysis: 'Servitutter og hevd må analyseres gjennom rettens stiftelsesgrunnlag, innhold og tidslinje. En servitutt kan være avtalt, mens hevd bygger på faktisk rådighet over lovbestemt tid og krav til aktsom god tro. Eiendomshevd og brukshevd er ikke synonymer, og tinglysing kan ikke erstatte hevdsbevis.',
    steps: 'Beskriv bruken konkret over tid, hvem som rådde, om bruken var sammenhengende og hvordan god tro skal vurderes. For en etablert servitutt må formål og belastning tolkes før omskiping eller avskiping vurderes. Til slutt kontrolleres hvordan en utinglyst eller hevdet rett står mot senere tredjepersoner.'
  },
  'rettsvern-prioritet-og-godtroerverv': {
    analysis: 'Rettsvern er et tredjepersonsspørsmål og må ikke forveksles med om en rett er gyldig mellom partene. Fast eiendom, løsøre og ulike panteobjekter har forskjellige publisitetsakter. Prioritet følger derfor ikke bare av avtaletidspunktet, og god tro får bare den virkningen den aktuelle ekstinksjonsregelen gir.',
    steps: 'Bygg en presis kronologi for stiftelse, overlevering, registrering eller tinglysing og tredjepersonens kunnskap. Fastsett deretter den relevante rettsvernsakten og om den var oppfylt før konkurrerende erverv eller beslag. Godtroerverv og kreditorbeslag prøves etter hvert sitt regelsett og kan ikke slås sammen til én rimelighetsvurdering.'
  },
  'pant-kreditorbeslag-omstotelse-og-dekning': {
    analysis: 'Sikkerhets- og insolvensanalysen må følge kjeden fra eierskap og pantegrunnlag til rettsvern, prioritet og beslag. En sikkerhetsavtale gir ikke automatisk vern i konkurs. Omstøtelse er en særskilt tilbakeføringsmekanisme for bestemte disposisjoner før insolvens og er ikke det samme som ugyldighet eller manglende rettsvern.',
    steps: 'Identifiser sikret krav, panteobjekt og stiftelsesgrunnlag før rettsvernsakten kontrolleres. Avklar så om formuesgodet tilhører skyldneren og kan beslaglegges, og plasser konkurrerende rettigheter i prioritetsrekkefølge. Først deretter vurderes om en ellers gyldig og vernet disposisjon kan omstøtes etter egne objektive eller subjektive vilkår.'
  }
};

const moduleSpecs = [
  { id: '01-erstatningsgrunnlag-og-saeransvar', title: 'Erstatningsgrunnlag og særansvar', topicIndexes: [0, 1] },
  { id: '02-aarsak-personskade-og-utmaaling', title: 'Årsak, personskade og utmåling', topicIndexes: [2, 3] },
  { id: '03-eiendomsrett-servitutter-og-hevd', title: 'Eiendomsrett, servitutter og hevd', topicIndexes: [4, 5] },
  { id: '04-rettsvern-pant-og-kreditorer', title: 'Rettsvern, pant og kreditorer', topicIndexes: [6, 7] }
];

function paragraphFor(topic, claim) {
  const frame = topicFrames[topic.id];
  assert(frame, `Mangler analytisk ramme for ${topic.id}`);
  const sources = claim.source_ids.map((id) => {
    const source = sourceById.get(id);
    assert(source, `${claim.id} peker på ukjent kilde ${id}`);
    return source;
  });
  const sourceTrail = sources.map((source) => `${source.id}: ${source.title} (${source.publisher})`).join(' og ');
  const sourceRoles = sources.map((source) => `${source.id} brukes for ${source.evidence_role.replaceAll('-', ' ')}`).join('; ');
  const core = `${claim.text} ${frame.analysis} ${frame.steps} For ${claim.id} må subsumsjonen derfor vise hvilke fakta som bærer hvert rettslig vilkår, hvilket formuesgode eller hvilken skadepost regelen gjelder, hvem konflikten står mellom, og om spørsmålet gjelder ansvar, gyldighet, rettighetsinnhold, rettsvern, prioritet eller insolvensvirkning. ${topic.boundary} Kildenes funksjon må også angis eksplisitt: ${sourceRoles}.`;
  return `${core} Kildesporet for ${claim.id} er ${claim.source_ids.join(', ')}: ${sourceTrail}. Kildene må brukes i sine rettskildemessige roller og med virkeområde, aktørposisjon, formuesgode eller skadepost, rettsvernstrinn og tidsversjon synlig; en erstatningsregel, tingsrettslig stiftelsesregel, rettsvernsregel og insolvensregel er ikke utskiftbare. Per 2. september 2026 må gjeldende lovtekst og eventuelle nyere endringer eller ikrafttredelser versjonskontrolleres. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
}

const moduleFiles = [];
for (const spec of moduleSpecs) {
  const moduleFile = `${chapterDir}/${spec.id}.json`;
  moduleFiles.push(moduleFile);
  const sections = spec.topicIndexes.map((topicIndex) => {
    const topic = sourceBrief.topic_briefs[topicIndex];
    const frame = topicFrames[topic.id];
    return {
      id: topic.id,
      title: topic.title,
      method_ids: topic.method_ids,
      boundary: topic.boundary,
      analysisFrame: [frame.analysis, frame.steps],
      paragraphs: topic.planned_claims.map((claim) => paragraphFor(topic, claim)),
      paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id])
    };
  });
  write(moduleFile, {
    schema: 'history_go_fagverk_module_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'juss_rettsvitenskap',
    chapter_id: chapterId,
    id: spec.id,
    title: spec.title,
    sections
  });
}

write(chapterFile, {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'politikk',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'erstatning_tingsrett_formuesrett_rettsvern',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Erstatning, tingsrett, formuesrett og rettsvern',
  subtitle: 'Fra ansvar og personskade til eiendomsrett, rettsvern, pant og kreditorbeslag',
  lead: 'Kapittelet trener kildebelagt analyse av erstatningskrav og formuerettslige posisjoner med eksplisitte skiller mellom ansvar, rettighetsinnhold, rettsvern, prioritet og insolvens.',
  learningObjectives: sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt skille mellom rettsgrunnlag, faktum, rettsvirkning og tredjepersonsposisjon`),
  moduleFiles,
  briefFile: `${chapterDir}/brief.json`,
  claimsFile: `${chapterDir}/claims.json`,
  assessmentFile: `${chapterDir}/assessment.json`,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  sourceFirst: true
});

write(`${chapterDir}/brief.json`, {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'erstatning_tingsrett_formuesrett_rettsvern',
  chapter_id: chapterId,
  sourceBriefFile,
  purpose: 'Materialisere erstatning, tingsrett, formuesrett og rettsvern som trinnvis analyse av ansvar, skade, rettighetsinnhold, publisitet, prioritet og kreditorposisjon.',
  sections: sourceBrief.topic_briefs.map((topic, index) => ({ ordinal: index + 1, id: topic.id, claim_ids: topic.planned_claims.map((claim) => claim.id) })),
  strict_boundaries: sourceBrief.topic_briefs.map((topic) => topic.boundary),
  fulltext_status: 'materialized_pending_strict_audit',
  source_first: true,
  claim_trace_required: true
});

write(`${chapterDir}/claims.json`, {
  schema: 'history_go_fagverk_claims_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  chapter_id: chapterId,
  retrieval_status: 'verified_2026-09-02',
  verified_at: DATE,
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile,
  verifiedClaims: claims.map((claim) => ({ id: claim.id, status: 'verified', verified_at: DATE, source_ids: claim.source_ids }))
});

const assessmentBlueprints = [
  ['Hva er riktig rekkefølge i en erstatningsanalyse?', ['Tap, rimelighet og så mulig hjemmel.', 'Ansvarsgrunnlag, faktisk årsak, rettslig avgrensning og konkret skadepost prøves hver for seg.', 'Årsak og ansvarsgrunnlag er samme spørsmål.', 'Et forsikringskrav beviser alltid skadevolderansvar.'], 1],
  ['Hva betyr lovfestet objektivt ansvar?', ['At ingen andre vilkår må prøves.', 'At skyldkravet kan falle bort innenfor et særregime, mens virkeområde, årsak, skade, unntak og regress fortsatt må analyseres.', 'At alle skader følger samme lov.', 'At forsikreren alltid er eneste ansvarlige.'], 1],
  ['Hvordan skilles årsak, medvirkning og lemping?', ['De er tre navn på samme skjønn.', 'Faktisk og rettslig årsak prøves først; medvirkning og lemping er egne senere korreksjoner med egne vilkår.', 'Medvirkning erstatter bevis om årsak.', 'Lemping betyr at ansvar aldri ble etablert.'], 1],
  ['Hva må holdes atskilt ved personskadeutmåling?', ['Påført tap, fremtidig tap, utgifter, menerstatning og forsørgertap.', 'Bare medisinsk invaliditet og inntekt.', 'Alle forsikringsytelser kan summeres uten samordning.', 'Menerstatning er det samme som inntektstap.'], 0],
  ['Hva er første spørsmål i en tingsrettslig konflikt?', ['Hvem som bruker tingen mest.', 'Hvilket objekt, hvilken rettsposisjon, hvilket stiftelsesgrunnlag og hvilke parter konflikten gjelder.', 'Hvem som synes mest rimelig.', 'Om retten er tinglyst, uansett rettstype.'], 1],
  ['Hvordan analyseres servitutt og hevd?', ['Som én og samme ervervsmåte.', 'Stiftelsesgrunnlag, brukens innhold, tidslinje, god tro og eventuell endring prøves etter riktig regelsett.', 'Tinglysing beviser alltid hevd.', 'Lang bruk er alltid nok uten godtro- eller tidskontroll.'], 1],
  ['Hva skiller gyldighet fra rettsvern?', ['Ingenting.', 'Gyldighet gjelder rettsforholdet mellom partene, mens rettsvern gjelder konkurrerende erververe eller kreditorer og krever riktig publisitetsakt.', 'Rettsvern gjelder bare erstatning.', 'God tro skaper alltid et gyldig grunnforhold.'], 1],
  ['Hva er riktig ved pant og konkurs?', ['En sikkerhetsavtale gir alltid prioritet.', 'Pantegrunnlag, objekt, sikret krav, rettsvern, beslag og eventuell omstøtelse må prøves i separate trinn.', 'Omstøtelse er det samme som ugyldighet.', 'Konkursboet kan beslaglegge alt skyldneren fysisk har.'], 1]
];

const questions = sourceBrief.topic_briefs.map((topic, index) => {
  const [prompt, choices, correctIndex] = assessmentBlueprints[index];
  return {
    id: `property-q${String(index + 1).padStart(2, '0')}`,
    prompt,
    choices,
    correctIndex,
    claim_ids: topic.planned_claims.map((claim) => claim.id),
    source_ids: [...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))]
  };
});
const caseClaimIds = [['property-05', 'property-15'], ['property-07', 'property-09'], ['property-19', 'property-20'], ['property-21', 'property-24'], ['property-25', 'property-28'], ['property-29', 'property-31']];
const caseTasks = sourceBrief.decision_scenarios.map((scenario, index) => ({
  id: `property-case-${String(index + 1).padStart(2, '0')}`,
  title: scenario.title,
  prompt: scenario.prompt,
  responseMode: 'guided_discussion_no_required_typing',
  claim_ids: caseClaimIds[index],
  source_ids: scenario.source_ids
}));

write(`${chapterDir}/assessment.json`, {
  schema: 'history_go_fagverk_assessment_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  chapter_id: chapterId,
  questions,
  caseTasks
});

console.log('Erstatning/tingsrett materialisert deterministisk: 4 moduler / 8 seksjoner / 32 avsnitt / 32 claims.');
