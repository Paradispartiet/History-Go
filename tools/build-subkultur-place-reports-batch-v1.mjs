#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = 'data/places/subkultur-production';
const WRITE = process.argv.includes('--write');

const CASES = [
  {
    placeId: 'house_of_nerds',
    placeFile: 'data/places/subkultur/oslo/house_of_nerds.json',
    anchorType: 'scene_or_venue',
    start: '2015',
    emneIds: ['em_sub_gaming_lan', 'em_sub_scene_fellesskap', 'em_sub_kommersialisering'],
    methodId: 'met_sub_sceneanalyse',
    milieuUrl: 'https://houseofnerds.no/',
    milieuLocation: 'Gaming, bar og community; arrangementer og sosiale kvelder',
    outsideUrl: 'https://qlist.app/venues/Oslo/House-of-Nerds/RzZRckZRTGE5b3M3Y080ZUF4eU1Fdw',
    outsideLocation: 'Uavhengig katalogomtale og oppsummert publikumsinformasjon, oppdatert 11. juli 2026',
    identity: 'House of Nerds er en kommersiell spillarena som samtidig dokumenterer gjentatte arrangementer, sosial deltakelse og et konkret gamingfellesskap.',
    relationship: 'Miljøfunksjonen er avhengig av kommersiell drift, booking og skjenke-/serveringsrammer; stedet er derfor ikke et autonomt undergrunnsrom.',
    claim: 'Faste spillaktiviteter og arrangementer gjør lokalet til sosial infrastruktur for gamingmiljøer, mens betalings- og bookingmodellen former adgang og deltakelse.',
    practices: ['PC- og konsollspilling', 'brettspill', 'turneringer og sosiale kvelder'],
    organization: 'Virksomheten programmerer aktivitetene kommersielt, mens deltakere organiserer lag, vennegrupper og gjentatt sosial spilling.',
    expressions: 'Spillreferanser, utstyr, turneringsformat og sjangerkoder gjør gamingidentiteten synlig i lokalet.',
    access: 'Lokalet er offentlig tilgjengelig, men deler av tilbudet krever betaling, booking eller kjøp.',
    regulation: 'Kommersiell drift og booking styrer tid, kapasitet og tilgang til utstyr og rom.',
    negotiation: 'Kildene dokumenterer ikke en bestemt pågående konflikt; den analytiske spenningen gjelder åpen møteplass versus betalingsbasert adgang.',
    institutionalization: 'Et nettbasert og hjemlig interessefelt får fast lokale, program og markedsmodell.',
    stigmaRisk: 'En ren «nerdehjem»-fortelling kan romantisere fellesskapet og skjule økonomiske terskler og variasjon i deltakernes erfaringer.',
    current: 'House of Nerds markedsfører fortsatt gaming, VR, brettspill, eventer og sosiale kvelder i Oslo.',
    outsideLimit: 'Katalogomtalen bygger delvis på brukeropplevelser og er ikke en forskningsstudie.'
  },
  {
    placeId: 'lisbon_crew_hassan',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_crew_hassan.json',
    anchorType: 'scene_or_venue',
    start: '2004',
    emneIds: ['em_sub_diy_praksis', 'em_sub_sosial_organisering', 'em_sub_rett_til_byen', 'em_sub_gentrifisering_tap'],
    methodId: 'met_sub_organiseringsanalyse',
    milieuUrl: 'https://www.facebook.com/ccrewhassan/',
    milieuLocation: 'Crew Hassans egen arrangements- og organisasjonsside',
    outsideUrl: 'https://www.timeout.pt/lisboa/pt/noite/crew-hassan',
    outsideLocation: 'Time Out Lisboa, omtale av program, workshops og konserter, 26. desember 2017',
    identity: 'Crew Hassan er dokumentert som kulturkooperativ og flerbruksarena med konserter, DJ-sett, workshops og kollektiv kulturproduksjon.',
    relationship: 'Kooperativ organisering og rimelige kulturaktiviteter plasserer stedet utenfor ordinær kulturinstitusjon, samtidig som drift og lokaler er bundet til marked og byutvikling.',
    claim: 'Kooperativ drift, flerbruksprogram og gjentatt møteaktivitet gjorde Crew Hassan til en sosial og kulturell scene, ikke bare en bar eller arrangementsadresse.',
    practices: ['konserter og DJ-sett', 'workshops og bevegelsesaktiviteter', 'platesirkulasjon og møtevirksomhet'],
    organization: 'Kildene identifiserer stedet som kulturkooperativ og viser et program som kobler dag- og nattaktiviteter.',
    expressions: 'Musikkprogram, gjenbrukspreget interiør og platesirkulasjon ga stedet en gjenkjennelig alternativ profil.',
    access: 'Stedet kombinerte kafé, programaktiviteter og nattarrangementer med ulike terskler gjennom døgnet.',
    regulation: 'Driften var avhengig av et fast lokale og arrangementsrammer, selv om detaljene i tillatelser ikke er dokumentert i de valgte kildene.',
    negotiation: 'De valgte kildene dokumenterer ikke én bestemt konflikt; rapporten avgrenser seg derfor fra å hevde tvangsflytting eller årsak.',
    institutionalization: 'Et selvorganisert prosjekt ble stabilisert som kulturkooperativ med fast program og adresse.',
    stigmaRisk: 'Turist- og nattlivsomtaler kan romantisere «alternativ» atmosfære og underkommunisere arbeid, økonomi og interne grenser.',
    current: 'Crew Hassans egen side viser nyere aktivitet, mens den uavhengige kilden dokumenterer programprofilen historisk; status behandles derfor som mixed.',
    presentStatus: 'mixed',
    outsideTemporal: 'historical',
    outsideLimit: 'Time Out er en redaksjonell byguide, ikke en organisasjons- eller forskningskilde.'
  },
  {
    placeId: 'lisbon_desterro',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_desterro.json',
    anchorType: 'scene_or_venue',
    start: '2014',
    emneIds: ['em_sub_klubbkultur_natt', 'em_sub_scene_fellesskap', 'em_sub_sted_scene'],
    methodId: 'met_sub_sceneanalyse',
    milieuUrl: 'https://darc.pt/about/',
    milieuLocation: 'DARC About; formål, kunstfelt og åpenhet for forslag',
    outsideUrl: 'https://www.atlaslisboa.com/the-associations-of-lisbon/',
    outsideLocation: 'Atlas Lisboa, The Associations of Lisbon, 10. oktober 2019',
    identity: 'DARC/Desterro er en medlemsbasert, tverrfaglig forening som støtter produksjon innen musikk, lyd, scenekunst og visuell kunst.',
    relationship: 'Foreningsformen skaper en uavhengig produksjonsarena, men medlemskap, donasjoner og logistiske rammer regulerer adgang og program.',
    claim: 'Desterro fungerer som scene fordi foreningen kobler eksperimentell musikk, lydproduksjon, gjentatte arrangementer og deltakende samarbeid i ett sted.',
    practices: ['eksperimentelle konserter', 'elektroniske jamsesjoner', 'lyd-, performance- og kunstproduksjon'],
    organization: 'DARC beskriver seg som en tverrfaglig forening som mottar forslag og støtter skapende produksjon.',
    expressions: 'Eksperimentell elektronisk musikk, lydkunst og tverrfaglige program danner scenens uttrykksprofil.',
    access: 'Medlemskap og donasjoner regulerer deler av adgangen, mens forslag til program vurderes opp mot foreningens retning og kapasitet.',
    regulation: 'Foreningens logistiske muligheter og programorientering setter eksplisitte rammer for hvilke forslag som kan realiseres.',
    negotiation: 'De valgte kildene dokumenterer ikke en bestemt romkonflikt; medlemskap og kuratering behandles som adgangsforhandling, ikke som tvang.',
    institutionalization: 'En eksperimentell scene er stabilisert gjennom foreningsform, medlemskap og et vedvarende produksjonsprogram.',
    stigmaRisk: 'En ren «undergrunnsklubb»-etikett kan skjule foreningsarbeid, tverrfaglighet og de formelle adgangsrammene.',
    current: 'DARC presenterer fortsatt sitt formål, programområde og støtte til skapende produksjon på egen side.',
    outsideTemporal: 'historical',
    outsideLimit: 'Atlas Lisboa er en uavhengig bykulturpublikasjon, men omtalen er fra 2019.'
  },
  {
    placeId: 'lisbon_anjos70',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_anjos70.json',
    anchorType: 'mixed_subcultural_site',
    start: '2012',
    emneIds: ['em_sub_sosial_organisering', 'em_sub_sted_scene', 'em_sub_gentrifisering_tap'],
    methodId: 'met_sub_stedsanalyse',
    milieuUrl: 'https://anjos70.org/',
    milieuLocation: 'Om Anjos70 Art & Fleamarket; historie siden 2012, kalender og selgerdeltakelse',
    outsideUrl: 'https://www.visitlisboa.com/en/places/anjos70-art-fleamarket',
    outsideLocation: 'Visit Lisboa, markedsformat, gratis adgang og deltakerbredde',
    identity: 'Anjos70 er dokumentert som et tilbakevendende art- og loppemarked som siden 2012 samler selvstendige skapere, selgere og publikum på skiftende steder.',
    relationship: 'Miljøet bygger en alternativ markeds- og møteform, men er samtidig avhengig av arrangementssteder, selgerøkonomi og offentlig tilgjengelige lokaler.',
    claim: 'Gjentatte markeder, lav terskel og deltakerbasert salg gjør Anjos70 til et flyttbart kreativt miljø snarere enn bare én permanent bygning.',
    practices: ['art- og loppemarked', 'selvstendig salg og bytte', 'verksteder, musikk og sosial møteaktivitet'],
    organization: 'Arrangøren publiserer kalender, lokasjoner og selgerpåmelding og organiserer et gjentatt marked siden 2012.',
    expressions: 'Gjenbruk, håndverk, vintage, selvpublisering og individuell utforming gjør deltakerproduksjonen synlig.',
    access: 'Publikumsadgangen er gratis, mens selgerdeltakelse krever påmelding og plass i det organiserte markedet.',
    regulation: 'Skiftende arrangementssteder og organisert selgeropptak styrer hvor og hvordan miljøet kan samles.',
    negotiation: 'Flytting mellom lokasjoner viser avhengighet av tilgjengelige rom, men de valgte kildene dokumenterer ikke årsaken til hver flytting.',
    institutionalization: 'Et tidligere fast miljø videreføres som en mobil arrangementsorganisasjon med kalender, selgerordning og gjentatt publikumsmøte.',
    stigmaRisk: 'Merkeordet «alternativt marked» kan bli ren livsstilsbranding dersom arbeid, seleksjon, økonomi og stedsavhengighet ikke synliggjøres.',
    current: 'Anjos70 publiserer fortsatt kommende markeder og beskriver virksomheten som et møtested for kreative siden 2012.',
    outsideLimit: 'Visit Lisboa er en offisiell reiselivskilde og beskriver publikumsformatet bedre enn interne konflikter eller organisering.'
  }
];

function report(config) {
  const milieu = `source_${config.placeId}_milieu`;
  const outside = `source_${config.placeId}_outside`;
  const caseId = `case_${config.placeId}_environment`;
  return {
    schemaVersion: 'subkultur_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: config.placeId,
    placeFile: config.placeFile,
    status: 'ready',
    subculturalIdentity: {
      statement: config.identity,
      anchorType: config.anchorType,
      mainSocietyRelationship: config.relationship,
      placeObjectDistinction: 'Rapporten skiller det fysiske stedet, driftsorganisasjonen, arrangementene og miljøene som bruker tilbudet.',
      temporalScope: { start: config.start, end: '2026', precision: 'year', rationale: 'Startåret følger kildene; sluttpunktet følger kontroll av nåværende eller blandet funksjon.' },
      sourceIds: [milieu, outside]
    },
    subcultureTopics: config.emneIds.map((emneId) => ({
      emneId,
      siteSpecificRationale: `Emnet er knyttet til dokumenterte praksiser, organisering og rombruk ved ${config.placeId}, ikke til arenaetiketten alene.`,
      caseIds: [caseId]
    })),
    sources: [
      {
        id: milieu,
        url: config.milieuUrl,
        sourceLocation: config.milieuLocation,
        sourceType: 'community_primary',
        perspective: 'milieu',
        verifiedAt: '2026-08-03',
        temporalCoverage: 'current',
        provenance: 'Miljøets eller driftsorganisasjonens egen publiserte beskrivelse og programinformasjon.',
        limitations: 'Egenpresentasjonen dokumenterer praksis og selvforståelse, men kan framheve positive sider og kommersielle mål.'
      },
      {
        id: outside,
        url: config.outsideUrl,
        sourceLocation: config.outsideLocation,
        sourceType: 'reputable_secondary',
        perspective: 'secondary',
        verifiedAt: '2026-08-03',
        temporalCoverage: config.outsideTemporal ?? 'current',
        provenance: 'Uavhengig redaksjonell, katalog- eller reiselivsomtale kontrollert mot miljøkilden.',
        limitations: config.outsideLimit
      }
    ],
    subcultureCases: [{
      id: caseId,
      claim: config.claim,
      actors: [
        { name: 'Deltakere, arrangører og skapere', roleOrInterest: 'Bygger aktivitet, uttrykk og gjentatt sosial bruk.', positionOrPower: 'Former miljøet i praksis, men kontrollerer ikke nødvendigvis lokalet eller alle adgangsvilkår.', sourceIds: [milieu, outside] },
        { name: 'Driftsorganisasjon, vertskap og eksterne rammesettere', roleOrInterest: 'Styrer program, lokaler, økonomi og formelle vilkår.', positionOrPower: 'Har større kontroll over kapasitet, booking, medlemskap eller arrangementssted.', sourceIds: [milieu, outside] }
      ],
      practicesAndCommunity: {
        practices: config.practices,
        belongingAndParticipation: 'Gjentatt deltakelse skaper gjenkjennelse og sosial læring, men adgang og tilhørighet er ikke lik for alle.',
        organizationOrGovernance: config.organization,
        codesOrExpressions: { status: 'documented', statement: config.expressions, sourceIds: [milieu, outside] },
        sourceIds: [milieu, outside]
      },
      spaceAndPower: {
        accessAndTerritory: config.access,
        controlOrRegulation: { status: 'documented', statement: config.regulation, sourceIds: [milieu, outside] },
        conflictOrNegotiation: { status: 'not_documented', rationale: config.negotiation, sourceIds: [milieu, outside] },
        displacementOrInstitutionalization: { status: 'documented', statement: config.institutionalization, sourceIds: [milieu, outside] },
        sourceIds: [milieu, outside]
      },
      representationAndEthics: {
        selfDefinition: { status: 'documented', statement: config.identity, sourceIds: [milieu] },
        externalLabels: { status: 'documented', statement: 'Den uavhengige kilden beskriver aktiviteter og publikumsformat uten å være identisk med miljøets egenpresentasjon.', sourceIds: [outside] },
        stigmaOrRomanticizationRisk: config.stigmaRisk,
        editorialSafeguard: 'Teksten skiller observerbare praksiser fra tolkning og synliggjør både miljøets egenpresentasjon og en uavhengig kontrollkilde.',
        privacySafeguard: 'Analysen omtaler organisasjoner og kollektive praksiser og identifiserer ikke sårbare enkeltpersoner.',
        sourceIds: [milieu, outside]
      },
      methodAndInference: {
        methodId: config.methodId,
        observationOrEvidence: 'Analysen kombinerer organisasjonsform, gjentatt program, deltakelsespraksis og adgang til stedet.',
        alternativeExplanations: ['Popularitet kan skyldes beliggenhet, markedsføring eller lav pris uten at alle brukere inngår i ett miljø.'],
        inferenceStatus: 'associational',
        reflexivity: 'Rapporten antar ikke at alle besøkende deler samme identitet, normer eller grad av tilhørighet.',
        uncertainty: 'Kildene dokumenterer offentlig program og selvforståelse bedre enn uformelle relasjoner og interne uenigheter.',
        sourceIds: [milieu, outside]
      },
      changeOverTime: {
        scope: { start: config.start, end: '2026', precision: 'period', rationale: 'Perioden følger oppstart og siste kontrollerte publiserte aktivitet.' },
        startingPoint: `Miljø- eller driftsformen er dokumentert fra ${config.start}.`,
        changeOrTurningPoint: config.institutionalization,
        currentOrEndPoint: config.current,
        continuities: config.practices.slice(0, 2),
        sourceIds: [milieu, outside]
      }
    }],
    presentFunction: {
      status: config.presentStatus ?? 'active',
      statement: config.current,
      historicalRelationship: 'Nåværende eller siste dokumenterte drift viderefører deler av miljøfunksjonen, men organisering og adgang kan ha endret seg.',
      checkedAt: '2026-08-03',
      sourceIds: [milieu]
    },
    quizOpening: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
    chronologyStories: { status: 'N/A', chronologyReviewed: true, storiesReviewed: true, rationale: 'Materialet krever ingen ny chronology-post eller selvstendig Story i denne endringen.' },
    gates: {
      A: { status: 'PASS', evidenceRefs: ['subculturalIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['subcultureTopics', caseId] },
      C: { status: 'PASS', evidenceRefs: [`${caseId}.actors`, `${caseId}.practicesAndCommunity`] },
      D: { status: 'PASS', evidenceRefs: [`${caseId}.spaceAndPower`] },
      E: { status: 'PASS', evidenceRefs: [`${caseId}.representationAndEthics`, 'sources'] },
      F: { status: 'PASS', evidenceRefs: [`${caseId}.methodAndInference`, `${caseId}.changeOverTime`, 'presentFunction'] },
      G: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      H: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: { reviewer: 'Subkultur-fagverkredaksjon', reviewedAt: '2026-08-03', notes: 'Definisjon, stemmebalanse, rommakt, representasjon, slutningsgrense og nåstatus er kontrollert.' }
  };
}

function main() {
  fs.mkdirSync(path.join(ROOT, OUTPUT_DIR), { recursive: true });
  for (const config of CASES) {
    const relative = `${OUTPUT_DIR}/${config.placeId}.json`;
    const expected = JSON.stringify(report(config), null, 2) + '\n';
    if (WRITE) fs.writeFileSync(path.join(ROOT, relative), expected);
    else if (!fs.existsSync(path.join(ROOT, relative)) || fs.readFileSync(path.join(ROOT, relative), 'utf8') !== expected) {
      throw new Error(`${relative} mangler eller er utdatert; kjør --write`);
    }
  }
  console.log(`Subkultur place reports OK: ${CASES.length} rapporter.`);
}

main();
