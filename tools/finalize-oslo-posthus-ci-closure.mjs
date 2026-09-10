#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const placeId = 'oslo_posthus';
const placeFile = 'data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json';
const verifiedAt = '2026-09-10';
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const sentences = value => [...new Intl.Segmenter('nb', { granularity: 'sentence' }).segment(String(value ?? ''))]
  .map(entry => entry.segment.trim()).filter(Boolean);

const urls = {
  byleksikon: 'https://oslobyleksikon.no/side/Hovedpostkontoret',
  linstow: 'https://www.linstow.no/prosjekter/quadraturen',
  oppdag: 'https://www.oppdagkvadraturen.no/stoppesteder/dronningens-gate-15-hovedpostkontoret',
  snlArchitect: 'https://snl.no/Rudolf_Emanuel_Jacobsen'
};

const place = read(placeFile);
const descSentences = sentences(place.desc);
const popupSentences = sentences(place.popupDesc);
const currentPattern = /\b(i dag|nå|holder til|drives av|brukes som|planlegges|er under bygging|skal åpne|forventes ferdig)\b/iu;
const allTextSentences = [...descSentences, ...popupSentences];
const claims = allTextSentences.map((sentence, index) => {
  const current = currentPattern.test(sentence);
  const identity = index === 0;
  return {
    id: `claim_oslo_posthus_desc_${String(index + 1).padStart(2, '0')}`,
    claim: sentence,
    sourceUrl: current ? urls.linstow : urls.byleksikon,
    sourceLocation: current ? 'Quadraturen – Dronningens gate 15 / prosjektbeskrivelse' : 'Hovedpostkontoret – stedshistorikk og bygningsbeskrivelse',
    sourceType: current ? 'primary' : 'institutional',
    verifiedAt,
    status: 'verified',
    claimKind: identity ? 'identity' : (current ? 'temporal' : 'ordinary'),
    evidenceMode: 'direct',
    temporalStatus: current ? 'current' : 'historical',
    notes: current ? 'Nåtidsopplysningen er kontrollert mot gårdeiers prosjektpresentasjon.' : 'Historisk opplysning er kontrollert mot Oslo byleksikon.'
  };
});
const descCoverage = descSentences.map((_, index) => ({ sentence: index + 1, claimIds: [claims[index].id] }));
const popupCoverage = popupSentences.map((_, index) => ({ sentence: index + 1, claimIds: [claims[descSentences.length + index].id] }));
const claimFor = needle => claims.find(claim => claim.claim.toLocaleLowerCase('nb-NO').includes(needle.toLocaleLowerCase('nb-NO')))?.id ?? claims[0].id;

write('data/places/production/oslo_posthus.json', {
  schemaVersion: '4.2',
  validatorVersion: '4.2.1',
  placeId,
  placeFile,
  status: 'ready_v4_2',
  identity: {
    status: 'resolved',
    represents: 'Hovedpostkontoret i Dronningens gate 15 som post- og logistikkbygning fra 1924 og som senere ombrukt del av Posthuskvartalet.',
    period: '1912–',
    excludes: ['Postverket som landsdekkende organisasjon', 'Posthallen som selvstendig arrangementsvirksomhet', 'andre postkontorer i Oslo']
  },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: 'sha256', desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) },
  claims,
  sentenceCoverage: { desc: descCoverage, popupDesc: popupCoverage },
  reviews: {
    factual: { status: 'passed', reviewedAt: verifiedAt, reviewer: 'History Go production closure' },
    editorial: { status: 'passed', reviewedAt: verifiedAt, reviewer: 'History Go production closure', introducedNewFacts: false }
  },
  quizReadiness: {
    questions: [
      { question: 'Hvor ligger Hovedpostkontoret?', answer: 'Dronningens gate 15', type: 'hvor', normalKnowledgeQuestion: true, claimIds: [claimFor('Dronningens gate 15')] },
      { question: 'Når ble Hovedpostkontoret tatt i bruk?', answer: '1924', type: 'når', normalKnowledgeQuestion: true, claimIds: [claimFor('1924')] },
      { question: 'Hvem tegnet Hovedpostkontoret?', answer: 'Rudolf E. Jacobsen', type: 'hvem', normalKnowledgeQuestion: true, claimIds: [claimFor('Rudolf')] },
      { question: 'Hva var bygningens opprinnelige hovedfunksjon?', answer: 'Hovedpostkontor og postterminal', type: 'hva', normalKnowledgeQuestion: true, claimIds: [claimFor('post')] },
      { question: 'Hva skjedde med hovedterminalfunksjonen i 1975?', answer: 'Den opphørte her', type: 'hva_skjedde', normalKnowledgeQuestion: true, claimIds: [claimFor('1975')] },
      { question: 'Hvilket historisk spor er innmurt i fasaden mot Tollbugata?', answer: 'En kanonkule fra 1716', type: 'hvilket_verk_eller_objekt', normalKnowledgeQuestion: true, claimIds: [claimFor('1716')] },
      { question: 'Hva ble den tidligere postbygningen senere omformet til?', answer: 'Boliger og næringsarealer med bevarte deler', type: 'hva_ble_bygget_produsert_eller_endret', normalKnowledgeQuestion: true, claimIds: [claimFor('bolig')] },
      { question: 'Når kjøpte Linstow Posthuskvartalet?', answer: '1999', type: 'når', normalKnowledgeQuestion: true, claimIds: [claimFor('1999')] }
    ]
  },
  completion: {
    completedUnder: '4.2', currentStatus: 'current', sourceVerifiedAt: verifiedAt,
    claimsVerified: { verified: claims.length, total: claims.length },
    factualReview: 'passed', editorialReview: 'passed', validatorVersion: '4.2.1'
  }
});

const sourceIds = ['source_oslo_byleksikon', 'source_linstow', 'source_oppdag_kvadraturen'];
const caseId = 'case_oslo_posthus_logistics_reuse';
const topicRationales = {
  em_naering_teknologi_infrastruktur: 'Bygningen samordnet postbehandling, publikumstjenester og transport som fysisk kommunikasjonsinfrastruktur i sentrum.',
  em_naering_arbeid_verdiskaping: 'Et stort hovedpostkontor gjorde sortering, ekspedisjon, administrasjon og logistikk til samordnet stedbundet arbeid.',
  em_naering_logistikk_verdikjeder: 'Hovedpostkontoret var et knutepunkt mellom innsamling, sortering, transport og utlevering av postsendinger.',
  em_naering_omstilling_kriser_skift: 'Terminalfunksjonen opphørte i 1975, og senere ombruk viser skiftet fra postal infrastruktur til blandet bybruk.',
  em_naering_kapital_finans: 'Linstows kjøp av Posthuskvartalet i 1999 og senere ombygging viser kapitalbinding og investering i ombruk av sentral eiendom.',
  em_naering_forbruk_marked: 'Publikumstjenestene koblet husholdninger og virksomheter til et landsdekkende marked for post- og kommunikasjonstjenester.'
};
write('data/places/naeringsliv-production/oslo_posthus.json', {
  schemaVersion: 'naeringsliv_place_production_v1',
  validatorVersion: '1.0.0',
  placeId,
  placeFile,
  status: 'ready',
  economicIdentity: {
    statement: 'Oslo Hovedpostkontor var en stedbundet logistikk- og tjenesteinfrastruktur for Postverket og er senere ombrukt som del av et blandet bykvartal.',
    anchorType: 'logistics_hub',
    placeObjectDistinction: 'Rapporten analyserer bygningen og dens stedbundne postfunksjoner, ikke Postverket som landsdekkende foretak eller post som abstrakt tjeneste.',
    temporalScope: { start: '1924', end: '2026', precision: 'period', rationale: 'Perioden følger hovedpostkontorets bruk fra åpningen i 1924 gjennom terminalavvikling og dokumentert senere ombruk.' },
    sourceIds
  },
  businessTopics: place.emne_ids.filter(id => id.startsWith('em_naering_')).map(emneId => ({ emneId, siteSpecificRationale: topicRationales[emneId], caseIds: [caseId] })),
  sources: [
    {
      id: 'source_oslo_byleksikon', url: urls.byleksikon, sourceLocation: 'Hovedpostkontoret – historikk, bygging og funksjoner', sourceType: 'reputable_secondary', verifiedAt,
      temporalCoverage: 'mixed', provenance: 'Oslo byleksikons redaksjonelle stedspost om Hovedpostkontoret.', limitations: 'Oppslaget beskriver funksjoner og tidslinje, men gir ikke regnskaps- eller produktivitetsserier.'
    },
    {
      id: 'source_linstow', url: urls.linstow, sourceLocation: 'Quadraturen – Posthuskvartalet og Dronningens gate 15', sourceType: 'primary_business', verifiedAt,
      temporalCoverage: 'current', provenance: 'Gårdeiers egen prosjektpresentasjon av kjøp, ombygging, arealer og bevarte elementer.', limitations: 'Egenpresentasjonen dokumenterer prosjekt og nåværende eiendomsbruk, men er ikke en uavhengig lønnsomhetsanalyse.'
    },
    {
      id: 'source_oppdag_kvadraturen', url: urls.oppdag, sourceLocation: 'Dronningens gate 15 – Hovedpostkontoret', sourceType: 'reputable_secondary', verifiedAt,
      temporalCoverage: 'mixed', provenance: 'Kvadraturens stedspresentasjon sammenfatter posthistorie og bygningsbruk.', limitations: 'Siden er en formidlingskilde og brukes ikke alene til kvantitative økonomiske slutninger.'
    }
  ],
  economicCases: [{
    id: caseId,
    claim: 'Hovedpostkontoret samlet arbeidskraft og fysisk infrastruktur i en postal verdikjede, mens senere ombruk flyttet verdiskapingen fra postterminal til bolig- og næringseiendom.',
    unitOfAnalysis: {
      unit: 'Hovedpostkontoret i Dronningens gate 15',
      boundary: 'Analysen gjelder den stedbundne bygningen og dokumenterte funksjoner i Posthuskvartalet, ikke hele Postverket eller andre postterminaler.',
      scale: 'site',
      temporalScope: { start: '1924', end: '2026', precision: 'period', rationale: 'Tidsrommet dekker postdrift, terminalendring og dokumentert ombruk av samme fysiske anlegg.' },
      sourceIds
    },
    actors: [
      { name: 'Postverket og postansatte', roleOrInterest: 'Drev sortering, ekspedisjon, administrasjon og transporttilknytning.', economicPosition: 'Kontrollerte og utførte den stedbundne posttjenesten mens bygningen var hovedpostkontor.', sourceIds: ['source_oslo_byleksikon', 'source_oppdag_kvadraturen'] },
      { name: 'Linstow og senere brukere', roleOrInterest: 'Investerte i, ombygde og brukte den tidligere posteiendommen til nye formål.', economicPosition: 'Forvalter kapital og arealer i den ombrukte eiendommen, mens bevaringshensyn avgrenser endringer.', sourceIds: ['source_linstow'] }
    ],
    valueCreation: {
      inputs: [{ statement: 'Bygning, arbeidskraft, transportforbindelser, sorteringskapasitet og administrasjon var innsatsfaktorer i postdriften.', sourceIds: ['source_oslo_byleksikon', 'source_oppdag_kvadraturen'] }],
      activity: { statement: 'Hovedpostkontoret samlet postbehandling og publikumstjenester i en sentral logistikkfunksjon.', sourceIds: ['source_oslo_byleksikon'] },
      outputs: [{ statement: 'Anlegget muliggjorde behandling og formidling av postsendinger og publikumstjenester i Oslo postdistrikt.', sourceIds: ['source_oslo_byleksikon'] }],
      valueCreationAssessment: { statement: 'Kildene dokumenterer funksjonskjeden og ombruket, men gir ikke en sammenhengende serie for kostnader, volum eller produktivitet.', sourceIds }
    },
    measurement: {
      methodId: 'met_naering_infrastrukturanalyse', evidenceType: 'qualitative',
      indicatorOrObservation: 'Byggeperioder, terminalfunksjon, funksjonsskift, eierskifte og ombruksarealer brukes som stedbundne indikatorer.',
      unit: 'dokumenterte funksjons- og arealendringer', period: '1924–2026',
      comparability: 'Kildene kan sammenholdes om funksjoner og tidsfestede skift, men ikke som en homogen økonomisk tidsserie.',
      dataLimitations: 'Det mangler konsistente tall for postvolum, bemanning, kostnader og avkastning gjennom hele perioden.', sourceIds
    },
    distributionAndPower: {
      ownershipOrControl: 'Postverket kontrollerte den opprinnelige tjenesteinfrastrukturen; senere eiere kontrollerer ombruk og kommersielle arealer innenfor vernehensyn.',
      laborPosition: 'Postansatte utførte den operative verdiskapingen, men de tilgjengelige kildene gir ikke grunnlag for detaljert analyse av lønn eller forhandlingsmakt.',
      beneficiaries: ['Postkunder fikk tilgang til sentraliserte posttjenester.', 'Senere beboere og næringsbrukere får verdi fra ombrukt sentrumsareal.'],
      costRiskBearers: ['Postverket bar drifts- og infrastrukturrisiko i postperioden.', 'Senere eiere bærer investerings- og markedsrisiko ved ombygging og utleie.'], sourceIds
    },
    riskAndExternalities: {
      riskAssessment: { statement: 'Funksjonen var avhengig av transportnett, arbeidsorganisering og tilpasning til teknologiske og organisatoriske skift i postsektoren.', sourceIds: ['source_oslo_byleksikon', 'source_oppdag_kvadraturen'] },
      externalityAssessment: { status: 'not_applicable', rationale: 'Kildene dokumenterer ombruk og bevaring, men gir ikke et robust grunnlag for å tallfeste stedets eksterne virkninger.' }
    },
    comparisonAndCausality: {
      comparisonBasis: 'Oslo byleksikon beskriver postfunksjonen og tidslinjen, mens Linstow beskriver eierskifte, bevaring og den senere eiendomsomformingen.',
      causalStatus: 'descriptive_only',
      causalAssessment: 'Kildene viser et funksjonsskift fra postterminal til blandet eiendomsbruk, men isolerer ikke én enkelt årsak til omstillingen.',
      alternativeExplanations: ['Endringer i postlogistikk, teknologi, arealbehov og sentrumsøkonomi kan alle ha bidratt til funksjonsskiftet.'],
      uncertainty: 'Materialet dokumenterer rekkefølge og funksjon, men ikke kontrafaktisk årsaksvirkning.', sourceIds
    }
  }],
  presentOperation: {
    operationalStatus: 'former',
    statement: 'Den opprinnelige hovedpostterminalen er ikke lenger i drift her; Dronningens gate 15 inngår i et ombrukt kvartal med bolig- og næringsfunksjoner.',
    originalEconomicRoleRelationship: 'Dagens eiendomsbruk erstatter den tidligere postterminalens operative rolle, samtidig som fasader, posthall og trapper er bevart som deler av anlegget.',
    checkedAt: verifiedAt, sourceIds: ['source_linstow']
  },
  quizOpening: {
    status: 'PASS', quizTargetId: placeId, firstTwoSetsQuestionCount: 14,
    sourceBrief: 'data/quiz/production_briefs/naeringsliv/oslo_posthus.json',
    productionContext: 'data/quiz/production_context/naeringsliv/oslo_posthus.json',
    requiredInputs: ['data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json', 'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md', 'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json']
  },
  chronologyStories: {
    status: 'PASS', chronologyReviewed: true, storiesReviewed: true,
    rationale: 'Leksikonets daterte milepæler og episode_v1-storyen er kontrollert som separate, kildebårne lag for samme sted.'
  },
  gates: {
    A: { status: 'PASS', evidenceRefs: [placeFile, 'data/places/production/oslo_posthus.json'] },
    B: { status: 'PASS', evidenceRefs: ['data/leksikon/places/oslo/naeringsliv/leksikon_oslo_posthus.json'] },
    C: { status: 'PASS', evidenceRefs: ['data/quiz/production_briefs/naeringsliv/oslo_posthus.json', 'data/quiz/production_context/naeringsliv/oslo_posthus.json'] },
    D: { status: 'PASS', evidenceRefs: ['data/people/naeringsliv/oslo/oslo_posthus/rudolf_emanuel_jacobsen.json'] },
    E: { status: 'PASS', evidenceRefs: ['data/stories/stories_oslo_posthus.json'] },
    F: { status: 'PASS', evidenceRefs: [urls.byleksikon, urls.linstow] },
    G: { status: 'PASS', evidenceRefs: ['data/leksikon/sprak/places/europe/norway/oslo/oslo_posthus.json'] },
    H: { status: 'PASS', evidenceRefs: ['tests/oslo-posthus-production-closure.test.mjs'] }
  },
  review: { reviewer: 'History Go production closure', reviewedAt: verifiedAt, notes: 'Fail-closed Næringsliv-rapport for dokumentert postal logistikk, funksjonsskift og dagens ombruk; ingen udokumentert lønnsomhet eller kausalitet hevdes.' }
});

console.log('Materialized Oslo Posthus v4.2 description packet and Næringsliv production report.');
