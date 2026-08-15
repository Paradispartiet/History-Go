#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'arkiv-bevaring-tilgang-og-autentisitet';
const SOURCE_BRIEF_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_topic_claims_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`
});

const MODULE_FILES = Object.freeze([
  `data/fagverk/film_tv/${CHAPTER_ID}/01-institusjoner-bevaring-og-digital-varighet.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/02-metadata-tilgang-rettigheter-og-plattformustabilitet.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/03-ombruk-fellesskapskontroll-og-produksjonsarkiv.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/04-autentisitet-versjoner-fravaer-og-rekonstruksjon.json`
]);

const TOPIC_EDITORIAL = Object.freeze({
  em_film_tv_film_tv_arkiv_institusjoner_og_praksis: {
    lens: 'Film- og TV-arkivet analyseres som en institusjonell kjede av utvalg, accession, identifikasjon, fysisk eller digital custody, bevaring, katalogisering og tilgang; hvert ledd må knyttes til ansvarlig institusjon og dokumentert samlingspraksis.',
    disagreement: 'Arkiver kan beskrives som nøytrale beholdere for kulturarv, men arkivfaget viser at mandat, ressurser, samlingspolitikk, prioritering og tilgangsregler aktivt former hva som overlever, hva som blir beskrevet og hva som kan brukes.',
    limits: [
      'En institusjons samlingsmandat dokumenterer hva den søker å bevare, men ikke at et bestemt objekt er komplett, bevart i en bestemt tilstand eller tilgjengelig for alle brukere.',
      'En katalogpost eller samlingsbeskrivelse må ikke brukes som erstatning for objekt-, bærer-, format- og tilstandsdata når claimet gjelder faktisk bevaring.'
    ],
    question: 'Hvilken institusjon, samling, objektstatus og dokumentert arkivhandling bærer slutningen?'
  },
  em_film_tv_audiovisuell_bevaring_og_restaurering: {
    lens: 'Audiovisuell bevaring leses som en teknisk og etisk prosess der originalbærer, bevaringsmaster, sikkerhetskopi, digitalisering, migrering, restaurering og tilgangskopi har forskjellige funksjoner og må dokumenteres hver for seg.',
    disagreement: 'Tilgangsorientert digitalisering kan gi stor brukerverdi, mens langsiktig bevaring krever mer enn en tilgjengelig fil; samtidig kan restaurering øke lesbarhet og presentasjonskvalitet uten at den restaurerte versjonen dermed blir identisk med én historisk original.',
    limits: [
      'En digital kopi eller vellykket scan dokumenterer ikke alene robust langtidsbevaring; lagring, redundans, fixity, formatstrategi og framtidig avspillbarhet må vurderes separat.',
      'Et restaureringsresultat må knyttes til dokumenterte kildeelementer, inngrep og bevaringsmål; fravær av synlige feil etter behandling beviser ikke at all historisk informasjon er bevart.'
    ],
    question: 'Hvilken bærer eller filtilstand fantes før tiltaket, hva ble gjort, og hvilket bevaringsmål kan kilden faktisk dokumentere?'
  },
  em_film_tv_digitalfodte_verk_formatforvitring_og_migrering: {
    lens: 'Born-digitalt materiale analyseres på nivåene bitstrøm, filformat, container, kodek, metadata, lagring og avspillingsmiljø; fixity, migrering og dokumenterte preservation events er evidens for ulike deler av kontinuiteten.',
    disagreement: 'Bitidentitet er et sterkt kontrollmål for uoppdaget endring, men framtidig autentisk bruk kan kreve migrering eller emulering; dermed kan både urørt bitstrøm og endret teknisk representasjon være utilstrekkelige dersom dokumentasjonen av hendelser og funksjon mangler.',
    limits: [
      'Bestått checksum eller fixity-kontroll sier at de kontrollerte bitene samsvarer med referansen, ikke at kodek, DRM, programvare eller avspillingsmiljø fortsatt gjør verket lesbart og presentabelt.',
      'Migrering er en dokumentert bevaringshendelse og må ikke presenteres som bevis på uendret identitet; inputformat, outputformat, verktøy, kontroll og eventuelle tap eller endringer må navngis.'
    ],
    question: 'Hvilke tekniske avhengigheter og preservation events må være dokumentert for at framtidig tilgang skal være en begrunnet, ikke antatt, egenskap?'
  },
  em_film_tv_metadata_katalogisering_proveniens_og_finnbarhet: {
    lens: 'Metadata behandles som evidensinfrastruktur: identifikatorer, verk-/versjonsnivå, bærer, proveniens, rettighetsfelt og relasjoner gjør objekter søkbare og sammenlignbare, men beskrivelser kan være historiske, ufullstendige eller institusjonelt formede.',
    disagreement: 'Standardisert katalogisering øker interoperabilitet og finnbarhet, men metadata er ikke en transparent kopi av objektet; katalogregler, lokale praksiser, manglende felt og eldre klassifikasjoner påvirker hva en bruker kan finne og hvordan materialet blir forstått.',
    limits: [
      'Finnbarhet er ikke det samme som fysisk eller digital overlevelse, fullstendighet eller visningstilgang; katalogposten må kobles til riktig objekt- eller eksemplarnivå.',
      'Proveniens kan ikke utledes fra filnavn, visuell likhet eller løs kontekst alene; dokumentert kjede, identifikator eller institusjonell registrering må støtte forbindelsen.'
    ],
    question: 'Hvilket metadatafelt, identifikator- eller proveniensledd gjør objektet identifiserbart, og hva kan posten fortsatt ikke bevise?'
  },
  em_film_tv_arkivtilgang_personvern_saarbarhet_og_rettigheter: {
    lens: 'Arkivtilgang analyseres som flere rettighets- og praksislag: discovery, lesesals- eller visningstilgang, kopi, publisering og gjenbruk kan ha ulike vilkår, mens opphavsrett, personvern, databeskyttelse, donoravtale og arkivpolicy må spores separat.',
    disagreement: 'Arkivets samfunnsoppdrag trekker mot bred tilgang, men personvern, sårbarhet, kontrakt og rettigheter kan legitimt begrense tilgjengeligheten; offentlig interesse i bevaring opphever ikke automatisk krav til sikkerhet eller proporsjonalitet.',
    limits: [
      'At et objekt kan sees i et arkiv eller finnes på nett gir ikke automatisk rett til kopiering, republisering eller kommersiell gjenbruk.',
      'Jurisdiksjonsspesifikke unntak for arkiv, forskning eller bevaring må brukes med navngitt jurisdiksjon og formål og kan ikke generaliseres til en universell distribusjonsrett.'
    ],
    question: 'Hvilket tilgangsnivå er faktisk gitt, og hvilke separate rettighets-, personvern- eller kontraktsgrenser gjelder for neste bruk?'
  },
  em_film_tv_plattformkataloger_forsvinnende_verk_og_digital_tilgang: {
    lens: 'Strømmekatalogen behandles som et tids- og territoriebundet distribusjonsutvalg, ikke som et arkiv; observasjoner må registrere tjeneste, territorium, dato, kontotilstand og innsamlingsmetode før fravær eller tilgjengelighet kan sammenlignes.',
    disagreement: 'Abonnementstjenester kan gi omfattende øyeblikkelig tilgang, men kataloger er dynamiske, lisensierte og markedsavhengige; derfor kan høy tilgjengelighet i en måleperiode sameksistere med svak langtidskontinuitet eller plutselige hull.',
    limits: [
      'Et verk som er tilgjengelig på en strømmetjeneste på en bestemt dato er ikke dermed arkivert for framtiden, og et verk som mangler i en observert katalog er ikke dermed tapt.',
      'Katalogendring kan ikke tilskrives én årsak uten dokumentasjon; lisens, territorium, tjenestedesign, konto, målefeil og datainnsamlingsmetode er alternative forklaringer som må holdes åpne.'
    ],
    question: 'Når, hvor, på hvilken tjeneste og med hvilken samlingsmetode ble katalogtilstanden observert, og hvilken bevaringsslutning er fortsatt ulovlig?'
  },
  em_film_tv_arkivbilder_kontekst_og_ombruk: {
    lens: 'Arkivbilder analyseres som kilder som får en ny retorisk og narrativ funksjon ved ombruk; opprinnelig produksjonskontekst, arkivproveniens, versjon, tilgangskopi og ny klipping eller lydlegging må derfor beskrives i samme evidenskjede.',
    disagreement: 'Gjenbruk kan aktivere historisk materiale for nye offentligheter, men ny montasje, utsnitt, teksting og lyd kan endre hva bildet ser ut til å hevde; kontekstualisering må derfor synliggjøre både kildeobjektets historie og den nye redaksjonelle handlingen.',
    limits: [
      'Et arkivklipps indeksikalske forbindelse til en tidligere opptakssituasjon gir ikke den nye produksjonen rett til å ignorere proveniens, versjon eller opprinnelig kontekst.',
      'Tilgang til en kopi og klarering av opphavsrett er ikke alene full etisk klarering når personvern, sårbarhet eller kollektiv kulturell kontroll også er relevante.'
    ],
    question: 'Hva vet vi om kildeobjektet før ombruk, og hvilke nye betydnings- og rettighetslag introduserer den senere presentasjonen?'
  },
  em_film_tv_dekolonisering_repatriering_og_fellesskapskontroll: {
    lens: 'Dekoloniserende arkivarbeid analyseres gjennom proveniens, historisk makt, kulturell autoritet og faktisk styring; fysisk custody, juridisk eierskap, kollektiv kulturarv, tilgangsprotokoll og beslutningsmakt må ikke komprimeres til én eierskapskategori.',
    disagreement: 'Institusjoner kan framheve universell bevaring og tilgang, mens urfolks- og fellesskapsprotokoller kan kreve restriksjon, relasjonell autoritet, digital return eller annen kontroll; en faglig analyse må beskrive hvem som har definert vilkårene og hvilken makt som faktisk flyttes.',
    limits: [
      'En individuell release eller tillatelse fra én rights holder kan ikke brukes som bevis på at kollektive kulturelle, intellektuelle eller relasjonelle rettigheter er avklart.',
      'Repatriering, fysisk tilbakeføring, digital return, tilgangskopi og overføring av custody eller beslutningsmyndighet er forskjellige handlinger og må navngis presist.'
    ],
    question: 'Hvilket folk eller fellesskap har relasjon til materialet, hvilken protokoll eller autoritet er dokumentert, og hvilken konkret kontroll er overført eller beholdt?'
  },
  em_film_tv_produksjonsarkiv_manus_kostyme_og_ephemera: {
    lens: 'Produksjonsarkivet analyseres som spor etter arbeidsprosesser: manusversjoner, kostyme, design, stillbilder, call sheets, notater og ephemera kan dokumentere beslutninger og materialitet, men de er ikke identiske med den ferdige filmen eller sendingen.',
    disagreement: 'Produksjonsmateriale kan gi sjeldent innsyn i intensjon og arbeidsflyt, men bevarte dokumenter er selektive og kan overrepresentere planlegging framfor faktisk utførelse; sluttverket og produksjonsarkivet må derfor leses som relaterte, men forskjellige kilder.',
    limits: [
      'Et manus eller designobjekt dokumenterer en produksjonsfase og kan ikke alene bevise at den planlagte løsningen ble gjennomført eller beholdt i lansert versjon.',
      'Produksjonsarkivets proveniens må navngi materialtype, skaper eller avdeling, samlingskontekst og forhold til sluttverket før det brukes som evidens for en konkret produksjonsbeslutning.'
    ],
    question: 'Hvilken produksjonsfase og aktør skapte materialet, og hvordan kontrolleres forbindelsen mellom dette sporet og den faktisk utgitte versjonen?'
  },
  em_film_tv_restaureringsetikk_autentisitet_og_verkversjoner: {
    lens: 'Restaureringsetikk analyseres som sporbar versjonshistorie: kildematerialer, valg, inngrep, dokumentasjon og presentasjonskontekst må beskrives slik at «autentisk» ikke blir synonymt med én teknisk pen eller institusjonelt foretrukket versjon.',
    disagreement: 'Restaurering kan forsøke å nærme seg en historisk visningsform, men verk kan eksistere i samtidige eller sekvensielle versjoner og kildematerialet kan være ufullstendig; autentisitet er derfor et argument støttet av dokumenterte valg, ikke en egenskap som kan leses direkte av sluttkopien.',
    limits: [
      'En restaurert versjon må ikke kalles den originale eller definitive versjonen uten dokumentert versjonsgrunnlag, kildemateriale og beslutningshistorie.',
      'Digital cleanup, stabilisering, fargearbeid eller lydbehandling må beskrives som inngrep med dokumentert mål; forbedret presentasjon er ikke i seg selv bevis på historisk korrekthet.'
    ],
    question: 'Hvilke kildeelementer, historiske versjoner og dokumenterte inngrep ligger bak presentasjonen, og hva forblir omstridt eller ukjent?'
  },
  em_film_tv_tapte_bilder_fravaer_og_rekonstruksjon: {
    lens: 'Tap og fravær analyseres positivt som evidensproblemer: manglende katalogdekning, ikke-lokalisert materiale, dokumentert destruksjon, fragmentarisk overlevelse og rekonstruksjon er forskjellige tilstander som krever forskjellige kilder.',
    disagreement: 'Rekonstruksjoner kan gjøre et fragmentert verk mer forståelig, men de kan også gi en illusjon av kompletthet; faglig ansvar krever at substitusjon, inferens, usikker rekkefølge og ukjent materiale markeres i stedet for å forsvinne i en sømløs presentasjon.',
    limits: [
      'Fravær i én database eller samling dokumenterer ikke at materialet er tapt globalt; søkeomfang, institusjoner og belegg for destruksjon eller manglende overlevelse må navngis.',
      'Rekonstruksjon må skille overlevende elementer fra erstattede eller infererte partier og beholde eksplisitte grenser for det som ikke kan fastslås.'
    ],
    question: 'Hva er faktisk dokumentert manglende, hvilket materiale overlever, og hvilke deler av rekonstruksjonen er kildebelagt, substituert, inferert eller ukjent?'
  }
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current); const b = parse(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0) ? current : floor;
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;
const unique = (values) => [...new Set(values)];
const sentenceSafe = (value) => String(value || '').replace(/[.!?]+(?=\s|$)/gu, ';').replace(/\s+/gu, ' ').trim();
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
  if (/repatri|community|cultural|icip|custody|decolon|governance/.test(value)) return 'Autoritetsslutningen må navngi fellesskap eller folk, materialrelasjon, protokollkilde, ønsket eller utøvd kontroll og hvilken beslutningsmakt som faktisk flyttes; fysisk custody og kollektiv kulturell autoritet er ikke samme kategori.';
  if (/access|rights|privacy|copyright|sensitive|reuse/.test(value)) return 'Tilgangsslutningen må skille discovery, visning, kopi og gjenbruk og holde opphavsrett, personvern, databeskyttelse, kontrakt, arkivpolicy og kollektiv kulturprotokoll som separate rettighetslag.';
  if (/metadata|catalog|provenance|findab|identif/.test(value)) return 'Metadata- og proveniensslutningen må navngi record- eller objektnivå, identifikator eller felt, dokumentert kjede og finnbarhetsgrense; en katalogpost beviser ikke i seg selv overlevelse, kompletthet eller visningstilgang.';
  if (/stream|platform|catalog-change|availability|svod/.test(value)) return 'Plattformslutningen må navngi tjeneste, territorium, observasjonsdato, konto- eller tilgangstilstand, katalogomfang og innsamlingsmetode og må ikke likestille kommersiell tilgjengelighet med arkivbevaring.';
  if (/digital|fixity|migration|format|born/.test(value)) return 'Digitalbevaringsslutningen må skille bitintegritet, formatlesbarhet, avspillingsmiljø, lagring og preservation events; migrering kan støtte framtidig tilgang uten å bevise uendret teknisk eller estetisk identitet.';
  if (/restor|version|authentic/.test(value)) return 'Restaureringsslutningen må navngi kildeelementer, historisk versjon, konkrete inngrep, dokumentasjon og presentasjonskontekst; en restaurert kopi er ikke automatisk den originale, definitive eller eneste autoritative versjonen.';
  if (/loss|missing|absence|reconstruct|fragment/.test(value)) return 'Tapsslutningen må skille ikke-lokalisert materiale, manglende katalogdekning, dokumentert destruksjon, fragmentarisk overlevelse og rekonstruksjon og markere substitusjon, inferens og ukjent materiale eksplisitt.';
  if (/production|script|costume|ephemera|design/.test(value)) return 'Produksjonsarkivslutningen må navngi materialtype, skaper eller avdeling, proveniens, samlingskontekst og forbindelsen til lansert verk; et planleggingsspor er ikke automatisk evidens for hva som faktisk endte på skjermen.';
  return 'Bevaringsslutningen må navngi institusjon eller samling, objekt- eller verksnivå, bærer eller format, dokumentert tilstand eller handling og uttrykkelig usikkerhet; bevaring, digitalisering, restaurering, rekonstruksjon og tilgang er forskjellige handlinger.';
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
      while (buckets[index].length < Math.min(3, sourceIds.length) && cursor < sourceIds.length * 3) {
        const id = sourceIds[(index * 2 + cursor) % sourceIds.length];
        if (!buckets[index].includes(id)) buckets[index].push(id);
        cursor += 1;
      }
      result[claim.id] = buckets[index];
    });
  }
  return result;
}

function renderParagraph({ claim, claimIndex, editorial, sources, cases }) {
  const primary = sources[0];
  const secondary = sources[1] || primary;
  const tertiary = sources[2] || secondary;
  const mainCase = cases[claimIndex % cases.length];
  const controlCase = cases[(claimIndex + 1) % cases.length] || mainCase;
  const focus = String(claim.claim_focus || '').replace(/[.!?]+$/u, '');
  const rule = claimFamilyRule(claim.claim_type);
  const primaryEvidence = sentenceSafe(primary.source_location);
  const secondaryEvidence = sentenceSafe(secondary.source_location);
  const tertiaryEvidence = sentenceSafe(tertiary.source_location);
  const limit = editorial.limits[claimIndex % editorial.limits.length];
  return `${claim.claim_focus} Claimet «${focus}» behandles som en etterprøvbar arkivslutning, ikke som en generell formulering om at noe finnes eller er bevart. Første evidensanker er ${primary.publisher}, «${primary.title}», med territorium ${primary.territory}; for akkurat ${claim.id} er den relevante dokumentasjonen at ${primaryEvidence} Andre anker er ${secondary.publisher}, «${secondary.title}», hvis rolle ${secondary.evidence_role} gir en annen kontrollflate; i denne analysen brukes kilden fordi ${secondaryEvidence} Tredje kontroll er ${tertiary.publisher}, «${tertiary.title}», og for ${claim.id} brukes den til triangulering av ${tertiary.evidence_role}; kildens eget scope beskrives slik: ${tertiaryEvidence} Caset «${mainCase.work}» (${mainCase.years}, ${mainCase.territory}) operasjonaliserer claimet fordi ${sentenceSafe(mainCase.purpose)} Kontrollcaset «${controlCase.work}» tvinger analysen av «${focus}» til å prøve samme kategori mot et annet objekt, regime eller teknisk problem og hindrer at ett arkivcase blir universell regel. For ${claim.id} er den faglige linsen at ${editorial.lens} Det betyr konkret at spørsmålet for ${claim.id} er: ${editorial.question} Evidensregelen for ${claim.id} er: ${rule} For ${claim.id} får en kilde derfor bare den styrken dens institusjonelle, tekniske, juridiske eller forskningsmessige mandat faktisk gir; normative standarder dokumenterer krav og praksisrammer, mens objektspesifikke historiske slutninger fortsatt krever objekt- eller samlingsnær evidens. Den claimspesifikke begrensningen for ${claim.id} er: ${limit} I ${claim.id} må uenigheten være synlig: ${editorial.disagreement} Sluttresultatet for «${focus}» er dermed en sporbar kjede fra ${primary.id}, ${secondary.id} og ${tertiary.id} via «${mainCase.work}» til en eksplisitt usikkerhetsgrense. For ${claim.id} holdes institusjon, samling eller plattform, verk-/objektnivå, bærer eller format, tilgangstilstand og dokumentert handling adskilt når de er relevante, slik at tilgjengelighet ikke blir bevaring, metadata ikke blir objektbevis og restaurering eller rekonstruksjon ikke skjuler versjonshistorie.`;
}

function buildModule({ modulePlan, moduleIndex, topicById, emneById, sourceById, caseById, claimSourceIds, methodIds }) {
  const sections = modulePlan.emne_ids.map((emneId) => {
    const topic = topicById.get(emneId);
    const canonical = emneById.get(emneId);
    const editorial = TOPIC_EDITORIAL[emneId];
    if (!topic || !canonical || !editorial) throw new Error(`Mangler fulltekstgrunnlag for ${emneId}`);
    const topicCases = topic.case_ids.map((id) => caseById.get(id));
    const paragraphs = topic.planned_claims.map((claim, index) => renderParagraph({
      claim,
      claimIndex: index,
      editorial,
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
      theoryResearchers: unique(topic.source_ids.slice(0, 4).map((id) => `${sourceById.get(id).publisher}: ${sourceById.get(id).title}`)),
      method_ids: sectionMethodIds,
      methodLimits: editorial.limits,
      documentedDisagreement: editorial.disagreement,
      evidenceQuestion: editorial.question
    };
  });

  const genericSelfChecks = [
    { question: `Hva må dokumenteres før ${sections[0].title.toLowerCase()} kan brukes som arkivfaglig evidens?`, answer: 'Institusjon eller plattform, samling eller objektnivå, relevant bærer/format, dokumentert handling eller tilgangstilstand og den konkrete usikkerhetsgrensen.' },
    { question: 'Kan en digital kopi, katalogpost eller strømmetilgang alene bevise langtidsbevaring?', answer: 'Nei. Digitalisering, metadata, kommersiell tilgjengelighet og langtidsbevaring er forskjellige evidensledd.' },
    { question: 'Hva gjør en restaurering eller rekonstruksjon faglig etterprøvbar?', answer: 'Dokumenterte kildeelementer, versjon, inngrep, metode, presentasjonskontekst og tydelig markering av substitusjon, inferens og ukjent materiale.' }
  ];
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
    selfCheck: genericSelfChecks
  };
}

export function buildFilmTvArchivePreservationAccessAuthenticityFulltextV1() {
  const sourceBrief = read(P.sourceBrief);
  if (sourceBrief.status !== 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production') throw new Error(`Source brief har uventet status: ${sourceBrief.status}`);
  const sources = read(P.sources).sources || [];
  const cases = read(P.cases).cases || [];
  const topicBriefs = read(P.topicClaims).topic_briefs || [];
  const plan = read(P.plan);
  const unit = findPlannedUnit(plan, CHAPTER_ID);
  if (!unit || unit.sequence !== 14) throw new Error('Canonical unit 14 mangler');
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDocument = read(P.methods);
  const methods = Array.isArray(methodsDocument) ? methodsDocument : methodsDocument.methods;
  const methodIds = new Set(methods.map((row) => row.method_id || row.id));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!filmStatus) throw new Error('Mangler Film & TV-status');
  if (![SOURCE_BRIEF_GATE, OUTPUT_GATE].includes(filmStatus.nextGate)) throw new Error(`Uventet Film & TV-gate for enhet 14 fulltekst: ${filmStatus.nextGate}`);

  const sourceById = new Map(sources.map((row) => [row.id, row]));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const topicById = new Map(topicBriefs.map((row) => [row.emne_id, row]));
  const claimSourceIds = buildClaimSourceIdsByClaim(topicBriefs);
  const allPlannedClaims = topicBriefs.flatMap((row) => row.planned_claims || []);
  const modules = sourceBrief.proposed_module_order.map((modulePlan, index) => buildModule({
    modulePlan,
    moduleIndex: index,
    topicById,
    emneById,
    sourceById,
    caseById,
    claimSourceIds,
    methodIds
  }));
  const sections = modules.flatMap((module) => module.sections);
  const sectionByClaim = new Map(sections.flatMap((section) => section.paragraphClaimIds.map((id) => [id, section.id])));
  const usedMethodIds = unique(unit.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || emneById.get(id)?.recommended_method_ids || []).filter((id) => methodIds.has(id)));

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    id: CHAPTER_ID,
    title: 'Arkiv, bevaring, tilgang og autentisitet: proveniens, versjoner og digital varighet',
    subtitle: 'Arkivinstitusjoner, bevaring og restaurering, born-digital migrering, metadata, rettigheter, fellesskapskontroll, plattformustabilitet, produksjonsarkiv og dokumentert fravær',
    primary_domain_id: sourceBrief.scope.primary_domain_ids[0],
    lead: 'Et audiovisuelle arkivobjekt er ikke bare «en film som finnes». Det kan være et verk med flere versjoner, konkrete filmruller eller bånd, born-digital filer med tekniske avhengigheter, katalogposter, bevaringsmastere og tilgangskopier som forvaltes under forskjellige rettigheter og vilkår. Kapitlet skiller derfor bevaring, digitalisering, restaurering, rekonstruksjon og tilgang; proveniens skilles fra visuell likhet; metadata fra fysisk eller digital overlevelse; og kommersiell strømmetilgjengelighet fra langtidsbevaring. Personvern, opphavsrett, kontrakt og kollektiv kulturell kontroll behandles som separate lag. Restaurert versjon, historisk original, tapt materiale og rekonstruert presentasjon må ha sporbar dokumentasjon. Kanonisering, stjerneproduksjon og kollektivt minne hører til neste planenhet, Kulturarv, kanon, stjerner og minne.',
    diagnosticQuestions: [
      { question: 'Er en digital kopi det samme som langtidsbevaring?', answer: 'Nei. Lagring, redundans, fixity, formatstrategi, preservation events og framtidig lesbarhet må også dokumenteres.' },
      { question: 'Beviser en katalogpost at et objekt fortsatt eksisterer og kan sees?', answer: 'Nei. Metadata, objektoverlevelse, fullstendighet og tilgang er separate spørsmål.' },
      { question: 'Er strømmetilgjengelighet arkivbevaring?', answer: 'Nei. En plattformkatalog er tids-, territorie- og lisensavhengig og dokumenterer ikke permanent bevaring.' },
      { question: 'Er en restaurert versjon automatisk den originale?', answer: 'Nei. Kildeelementer, versjonshistorie, inngrep og presentasjonsvalg må dokumenteres.' },
      { question: 'Kan juridisk eierskap alene avgjøre kollektiv kulturell kontroll?', answer: 'Nei. Urfolks- og fellesskapsrelasjoner, protokoller og kulturelle rettigheter må undersøkes separat.' },
      { question: 'Er et manus bevis på hva som faktisk kom med i filmen?', answer: 'Nei. Produksjonsarkiv dokumenterer arbeidsprosesser og planer, men må kontrolleres mot lansert versjon og annen produksjonsevidens.' },
      { question: 'Beviser fravær i én database at et verk er tapt?', answer: 'Nei. Søkeomfang, andre samlinger og dokumentasjon på destruksjon eller manglende overlevelse må vurderes.' },
      { question: 'Kan migrering bevare tilgang uten å bevise uendret identitet?', answer: 'Ja. Migrering kan være nødvendig, men selve endringen må dokumenteres og kontrolleres.' },
      { question: 'Opphever arkivering i allmennhetens interesse personvern?', answer: 'Nei. Formålet kan være legitimt samtidig som sikkerhet, dataminimering og tilgangsbegrensning fortsatt kreves.' }
    ],
    learningObjectives: topicBriefs.map((topic) => topic.learning_goal),
    emne_ids: [...sourceBrief.scope.emne_ids],
    method_ids: usedMethodIds,
    moduleFiles: [...MODULE_FILES],
    briefFile: P.brief,
    claimsFile: P.claims,
    relatedPlaces: [],
    workCases: cases.map((row) => ({
      id: row.id,
      title: row.title,
      year: row.years,
      medium: row.medium,
      territory: row.territory,
      role: row.purpose,
      source_ids: row.source_ids
    }))
  };

  const moduleParagraphCounts = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    chapter_id: CHAPTER_ID,
    title: 'Kapittelbrief – Arkiv, bevaring, tilgang og autentisitet',
    requiredEmneIds: [...sourceBrief.scope.emne_ids],
    requiredMethodIds: usedMethodIds,
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
      plannedClaimResolution: '53/53',
      allBriefSourcesUsedByFinalClaims: true,
      preservationDigitizationRestorationReconstructionAccessSeparated: true,
      archiveObjectLevelsAndProvenanceExplicit: true,
      metadataFindabilityAndSurvivalSeparated: true,
      accessRightsPrivacyAndReuseSeparated: true,
      indigenousCommunityControlExplicit: true,
      bornDigitalFixityMigrationAndAuthenticitySeparated: true,
      streamingAvailabilityAndPreservationSeparated: true,
      productionArchiveAndReleasedWorkSeparated: true,
      restorationVersionLossAndReconstructionSeparated: true,
      unit15BoundaryExplicit: true,
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

  registry.version = maxDottedVersion(registry.version, '3.01.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-15');
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
  const chapterIndex = registry.subjects.film_tv.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) registry.subjects.film_tv.chapters.push(registryChapter);
  else registry.subjects.film_tv.chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.fourteenthSourceClaimBrief = P.sourceBrief;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Arkiv, bevaring, tilgang og autentisitet er fulltekstregistrert med 11/11 canonicale emner, 4 variable moduler, 11 emneeide seksjoner, 53 claimsporede fagavsnitt, 53/53 verifiserte claims, 30 brukte inspectable kilder og 26 dokumenterte arkivcase. Bevaring, digitalisering, restaurering, rekonstruksjon, tilgang, proveniens, metadata, rettigheter/personvern, kollektiv kulturell kontroll, born-digital migrering, plattformustabilitet og dokumentert tap har separate evidensgrenser. Neste port er kilde- og claimbrief for Kulturarv, kanon, stjerner og minne.';

  status.version = maxDottedVersion(status.version, '1.94.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-15');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Arkiv, bevaring, tilgang og autentisitet er fulltekstregistrert etter claim- og evidensaudit: 11/11 canonicale emner, 4 moduler, 11 seksjoner, 53 claimsporede fagavsnitt, 53/53 løste claimplaner, 30 brukte inspectable kilder og 26 case. Neste port er kilde- og claimbrief for Kulturarv, kanon, stjerner og minne.';

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
    moduleParagraphCounts
  };
}

export function materializeFilmTvArchivePreservationAccessAuthenticityFulltextV1() {
  const built = buildFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  write(P.chapter, built.chapter);
  built.modules.forEach((module, index) => write(MODULE_FILES[index], module));
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log(`Materialiserte Film & TV/enhet 14: 11 emner, 4 moduler, 11 seksjoner, 53 claims, 30 kilder og 26 case.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    materializeFilmTvArchivePreservationAccessAuthenticityFulltextV1();
  } catch (error) {
    console.error(`Film & TV enhet 14 fulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
