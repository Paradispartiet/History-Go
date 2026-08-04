#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const slug = (id) => id.replace(/^em_sub_/, '');
const theoryId = (emneId) => `theory_sub_${slug(emneId)}`;
const claimIds = (emneId) => [`claim_sub_${slug(emneId)}_definition_mechanism`, `claim_sub_${slug(emneId)}_boundary`];

const CHAPTER_META = Object.freeze({
  subkulturteori_feltgrenser: {
    title: 'Subkulturteori og feltgrenser',
    subtitle: 'Fra faste grupper til scener, flytende tilhørighet og dokumenterbare grenser',
    lead: 'Kapittelet gjør Subkultur til en prøvbar analyseform. Det sammenligner klassisk subkulturteori med scene- og postsubkulturelle kritikker og viser hvorfor aktivitet, ungdom, estetikk eller arena aldri er nok alene.',
    moduleTitles: ['Begreper og tradisjoner', 'Grenser, posisjoner og skala', 'Klassifisering, kontroll og anvendelse'],
    places: [
      ['sofienbergparken', 'Sofienbergparken', 'Positivt grensetilfelle: ordinært byrom med dokumentert miljølag.'],
      ['oslo_skatehall', 'Oslo Skatehall', 'Skiller arena fra dokumentert skatemiljø og sosial praksis.'],
      ['voldslokka_pumptrack', 'Voldsløkka pumptrack', 'Tester frivillig miljøbygging uten å la anlegg alene avgjøre kategori.'],
      ['house_of_nerds', 'House of Nerds', 'Tester fandom, spillpraksis og fysisk møteplass mot feltgrensen.'],
      ['slottsparken', 'Slottsparken', 'Viser sekundært Subkultur-lag i et sted med annen hovedkategori.'],
      ['hartvig_nissens_skole_skam', 'Hartvig Nissens skole (SKAM)', 'Negativt/tvetydig case for å skille populærkulturell berømmelse fra miljø.']
    ]
  },
  fellesskap_scener_egenorganisering: {
    title: 'Fellesskap, scener og egenorganisering',
    subtitle: 'Hvordan deltakelse, dugnad, portvokting, omsorg og konflikt holder miljøer sammen',
    lead: 'Kapittelet undersøker hvordan miljøer blir til gjennom arbeid, læring, regler og relasjoner. Fellesskap behandles verken som harmonisk enhet eller løs smak, men som organisert praksis med tilgang, kostnader og intern ulikhet.',
    moduleTitles: ['Scene, tilhørighet og infrastruktur', 'Regler, læring og omsorg', 'Konflikt, kontinuitet og makt'],
    places: [
      ['blitzhuset', 'Blitzhuset', 'Selvorganisert motkultur, infrastruktur og lang varighet.'],
      ['hausmania', 'Hausmania', 'Kollektiv kulturproduksjon, organisering og romlig forhandling.'],
      ['uffa_huset_trondheim', 'UFFA-huset', 'Husokkupasjon, kontinuitet og egenorganisert drift.'],
      ['svartlamon_trondheim', 'Svartlamon', 'Beboerorganisering, alternative boformer og forhandling om byutvikling.'],
      ['kafe_x_tromso', 'Kafe X', 'Brukerstyrt møteplass, erfaringskompetanse og gjensidig støtte.'],
      ['trikkestallen_skatepark_trondheim', 'Trikkestallen Skatepark', 'Langvarig lokalt skatemiljø, frivillig innsats og institusjonalisering.']
    ]
  },
  stil_symboler_koder_kropp: {
    title: 'Stil, symboler, koder og kropp',
    subtitle: 'Hvordan tegn skaper gjenkjennelse, status, risiko og bevegelige grenser',
    lead: 'Kapittelet leser klær, språk, smak, kropp og visuelle tegn som sosial praksis. Tegn får betydning gjennom bruk og relasjoner; de er aldri sikre medlemsbevis og må analyseres uten å gjøre mennesker til stereotype representanter.',
    moduleTitles: ['Stil, omkoding og tegn', 'Kropp, språk og smak', 'Autentisitet, synlighet og appropriasjon'],
    places: [
      ['helvete_neseblod_records', 'Helvete / Neseblod Records', 'Sted, musikkobjekter, stil og senere minneproduksjon.'],
      ['rock_in_oslo', 'Rock In', 'Sjangerkoder og sosial møteplass uten automatisk homogenitet.'],
      ['vaterland_bar_scene', 'Vaterland Bar & Scene', 'Overlapp mellom program, publikum, smak og tilhørighet.'],
      ['nybrua_pilarrom', 'Nybrua pilarrom', 'Tags, crew-markeringer og synlighet i et kontrollert overgangsrom.'],
      ['gronland_underganger', 'Grønland underganger', 'Raske visuelle koder, lag og skiftende offentlig lesning.'],
      ['torggata_blad', 'Torggata Blad', 'Fanzine-, redaksjons- og dokumentasjonspraksis som kodet offentlighet.']
    ]
  },
  steder_territorier_okkupering: {
    title: 'Steder, territorier og okkupasjon',
    subtitle: 'Hvordan miljøer produserer, bruker, forsvarer og mister rom',
    lead: 'Kapittelet behandler sted som gjort praksis, ikke tom bakgrunn. Ruter, okkupasjon, skating, graffiti og møteplasser analyseres sammen med eiendom, adgang, regulering og fortrengning.',
    moduleTitles: ['Stedsskaping, territorium og autonome rom', 'Kroppslig bruk og uformelle møteplasser', 'Byrett, kontroll og fortrengning'],
    places: [
      ['brenneriveien_ingens_gate', 'Brenneriveien / Ingens gate', 'Konsentrert gatekunst, scener og alternativ bybruk.'],
      ['hausmannsgate_aksen', 'Hausmannsgate-aksen', 'Synlige uttrykk, selvorganiserte steder og reguleringspress.'],
      ['gamlebyen_sport_og_fritid', 'Gamlebyen Sport og Fritid', 'Dugnad, skating, scene og nabolagsforankring.'],
      ['skur13', 'Skur 13', 'Ombruk av havneinfrastruktur til organisert urban praksis.'],
      ['nygardsparken_bergen', 'Nygårdsparken', 'Park, åpent rusmiljø, kontrolltiltak og forskyvning over tid.'],
      ['plata_oslo', 'Plata', 'Møteplass, åpen russcene og myndighetsstyrt oppløsning/flytting.']
    ]
  },
  motstand_avvik_kontroll: {
    title: 'Motstand, avvik og kontroll',
    subtitle: 'Stempling, moralpanikk, politi, regulering og romlig forhandling',
    lead: 'Kapittelet undersøker hvordan avvik produseres i møter mellom miljøer, medier, naboer og myndigheter. Det skiller dokumentert skade fra overdrevet trussel og nekter å gjøre konflikt eller motstand til obligatorisk pynt.',
    moduleTitles: ['Stempling, entreprenører og moralpanikk', 'Politi, regulering og overvåkning', 'Motstand, forhandling og konsekvenser'],
    places: [
      ['blitzhuset', 'Blitzhuset', 'Langvarig forhandling mellom autonomi, protest og offentlig kontroll.'],
      ['hausmania', 'Hausmania', 'Kulturproduksjon, eiendom, regulering og legitimitetskamp.'],
      ['schweigaards_gate_lodalen', 'Schweigaards gate–Lodalen veggakse', 'Uformelle uttrykk i tekniske rom med skiftende kontroll.'],
      ['gronland_underganger', 'Grønland underganger', 'Synlighet, fjerning og regulering av visuelle tegn.'],
      ['brugata_storgata_rusmiljo', 'Brugata / Storgata – det åpne rusmiljøet', 'Stigma, helse, politi, marked og territoriell kontroll.'],
      ['vaterlandsparken', 'Vaterlandsparken', 'Offentlig park, møteplass, trygghetsdebatt og ulike brukerposisjoner.']
    ]
  },
  medier_objekter_praksiser: {
    title: 'Medier, objekter og praksiser',
    subtitle: 'Fanziner, plakater, tags, opptak, arkiv og nettverkede offentligheter',
    lead: 'Kapittelet følger hvordan miljøer produserer, sirkulerer og bevarer uttrykk. Objekter og plattformer er ikke passive beholdere: de former adgang, minne, synlighet og risiko.',
    moduleTitles: ['Trykk, plakater og signaturer', 'Lyd, klær, radio og arkiv', 'Plattformer, algoritmer og objektliv'],
    places: [
      ['torggata_blad', 'Torggata Blad', 'Fysisk redaksjon, papirutgaver og lokal alternativ offentlighet.'],
      ['helvete_neseblod_records', 'Helvete / Neseblod Records', 'Platebutikk, objektsirkulasjon, scenehistorie og arkiv.'],
      ['kolstadgata_toyen_vegger', 'Kolstadgata veggmiljø', 'Visuelle uttrykk, ungdomsmiljø og dokumentasjon over tid.'],
      ['kuba_akselpassasjer', 'Kuba-passasjene ved Akerselva', 'Kortlevde uttrykk, passasje og sporbarhetsgrense.'],
      ['house_of_nerds', 'House of Nerds', 'Digitale og analoge spillpraksiser materialisert i et møtested.'],
      ['xray_ungdomskulturhus', 'X-Ray Ungdomskulturhus', 'Deltakende kulturproduksjon, læring og mediepraksis.']
    ]
  },
  sosiale_randsoner_omsorg_skadereduksjon: {
    title: 'Sosiale randsoner, omsorg og skadereduksjon',
    subtitle: 'Åpne miljøer, hjemløshet, lavterskeltilbud, erfaringskompetanse og representasjon',
    lead: 'Kapittelet analyserer gatefellesskap og åpne rusmiljøer uten å romantisere lidelse eller gjøre mennesker til kulisser. Omsorg, skadereduksjon, tjenestetilgang, stigma og personvern behandles som relasjonelle og institusjonelle spørsmål.',
    moduleTitles: ['Åpne miljøer, gatefellesskap og ustabilitet', 'Skadereduksjon, lavterskel og peerarbeid', 'Risiko, representasjon og naboforhandling'],
    places: [
      ['brugata_storgata_rusmiljo', 'Brugata / Storgata – det åpne rusmiljøet', 'Nåværende åpent miljø med marked, tjenester, stigma og kontroll.'],
      ['plata_oslo', 'Plata', 'Historisk åpent rusmiljø og eksempel på forskyvning etter kontrolltiltak.'],
      ['huset_oslo', 'Huset Oslo', 'Brukerstyrt møteplass og erfaringskompetanse.'],
      ['kafe_x_tromso', 'Kafe X', 'Rusfri, brukerstyrt møteplass med sosial støtte.'],
      ['mo_senteret_gyldenpris', 'MO-senteret Gyldenpris', 'Lavterskel helse- og omsorgstilbud i Bergen.'],
      ['nadheim_oslo', 'Nadheim', 'Anonymt lavterskeltilbud med særlig høy personvern- og stigmavarsomhet.']
    ]
  },
  kommersialisering_institusjonalisering_minne: {
    title: 'Kommersialisering, institusjonalisering og minne',
    subtitle: 'Hvordan miljøer blir marked, institusjon, kulturarv, revival eller tap',
    lead: 'Kapittelet undersøker hva som skjer når undergrunn blir merkevare, profesjon, kulturhus eller kulturarv. Endring er ikke automatisk tap eller seier; eierskap, adgang, ressurser og miljøets egen videreføring må dokumenteres.',
    moduleTitles: ['Inkorporering, marked og merkevare', 'Profesjonalisering, institusjon og gentrifisering', 'Kulturarv, revival og tapte steder'],
    places: [
      ['tou_stavanger', 'Tou', 'Fra selvorganisert bruk av industribygg til etablert kulturinstitusjon.'],
      ['bergen_kjott_kulturhus', 'Bergen Kjøtt', 'Industribygg, kunstnerdrevet miljø og institusjonell utvikling.'],
      ['club_7_vika', 'Club 7', 'Historisk motkultursted og ettertidens kanonisering.'],
      ['lisbon_anjos70', 'Anjos70', 'Selvorganisert kreativt miljø under byutviklingspress.'],
      ['lisbon_galeria_ze_dos_bois', 'Galeria Zé dos Bois (ZDB)', 'Okkupasjon, varig institusjon og endret urban kontekst.'],
      ['stovnertarnet', 'Stovnertårnet', 'Tvetydig case for stedsmerkevare og lokal representasjon.']
    ]
  }
});

function sectionFor(topics, methodsById, index) {
  const claims = topics.flatMap((topic) => claimIds(topic.emne_id));
  if (topics.length === 1) {
    const topic = topics[0];
    const method = methodsById.get(topic.method_ids[index % topic.method_ids.length]);
    return {
      id: `${slug(topic.emne_id)}_analyse`,
      title: `${index + 1}. ${topic.title}`,
      paragraphs: [
        topic.definition,
        `${topic.mechanism} Dette kan undersøkes med ${method.title.toLowerCase()}: ${method.operation.charAt(0).toLowerCase()}${method.operation.slice(1)}`,
        `${topic.limitation} Analysen må derfor oppgi hvilket materiale som støtter tolkningen, hva som ikke er dokumentert og hvilken alternativ forklaring som fortsatt er mulig.`
      ],
      paragraphClaimIds: [[claims[0]], [claims[0], claims[1]], [claims[1]]],
      keyPoints: [topic.definition, topic.mechanism, topic.limitation]
    };
  }
  const [first, second] = topics;
  const firstMethod = methodsById.get(first.method_ids[0]);
  const secondMethod = methodsById.get(second.method_ids[0]);
  return {
    id: `${slug(first.emne_id)}_${slug(second.emne_id)}_sammenligning`,
    title: `${index + 1}. ${first.title} og ${second.title}`,
    paragraphs: [
      `${first.definition} Samtidig gjelder at ${second.definition.charAt(0).toLowerCase()}${second.definition.slice(1)}`,
      `${first.mechanism} ${second.mechanism} En sammenligning kombinerer ${firstMethod.title.toLowerCase()} og ${secondMethod.title.toLowerCase()} for å skille prosessene empirisk.`,
      `${first.limitation} ${second.limitation} Samlet betyr det at kontinuitet, endring og rekkevidde må dokumenteres hver for seg.`
    ],
    paragraphClaimIds: [[claims[0], claims[2]], [claims[0], claims[1], claims[2], claims[3]], [claims[1], claims[3]]],
    keyPoints: [first.definition, second.definition, `${first.limitation} ${second.limitation}`]
  };
}

function build() {
  const emner = readJson('data/fag/subkultur/emner_subkultur_canonical_v4_5.json');
  const methods = readJson('data/fag/subkultur/methods_subkultur_canonical_v4_5.json').methods;
  const pensum = readJson('data/fag/subkultur/subkulturpensum_canonical_v4_5.json');
  const sources = readJson('data/fag/subkultur/sources_subkultur_canonical_v1.json').sources;
  const sourceById = new Map(sources.map((entry) => [entry.source_id, entry]));
  const evidenceById = new Map(readJson('data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json').entries.map((entry) => [entry.theory_id, entry]));
  const caseRegistry = readJson('data/fag/subkultur/case_evidence_subkultur_canonical_v1.json');
  const caseEvidence = caseRegistry.cases;
  const caseEvidenceByPlace = new Map(caseEvidence.map((entry) => [entry.place_id, entry]));
  const rejectedCases = caseRegistry.nonqualifying_cases ?? [];
  const rejectedCaseByPlace = new Map(rejectedCases.map((entry) => [entry.place_id, entry]));
  const methodsById = new Map(methods.map((entry) => [entry.method_id, entry]));
  const generated = {};
  const chapterRows = [];

  for (const domain of pensum.domains) {
    const meta = CHAPTER_META[domain.domain_id];
    if (!meta) throw new Error(`Mangler kapittelmetadata for ${domain.domain_id}`);
    const domainEmner = domain.emne_ids.map((id) => emner.find((entry) => entry.emne_id === id));
    const chapterId = domain.domain_id;
    const chapterDir = `data/fagverk/subkultur/${chapterId}`;
    const allTheoryIds = domainEmner.map((entry) => theoryId(entry.emne_id));
    const allClaimIds = domainEmner.flatMap((entry) => claimIds(entry.emne_id));
    const domainSourceIds = [...new Set(allTheoryIds.flatMap((id) => evidenceById.get(id).source_ids))];
    const chapterSourceIds = [...domainSourceIds, ...sources.map((entry) => entry.source_id).filter((id) => !domainSourceIds.includes(id))].slice(0, 7);
    const topicGroups = [[domainEmner[0]], [domainEmner[1]], [domainEmner[2]], [domainEmner[3]], [domainEmner[4]], [domainEmner[5]], [domainEmner[6]], [domainEmner[7]], [domainEmner[8], domainEmner[9]]];
    const sections = topicGroups.map((topics, index) => sectionFor(topics, methodsById, index));
    const moduleTopicSlices = [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9]];
    const moduleFiles = [];

    for (let moduleIndex = 0; moduleIndex < 3; moduleIndex += 1) {
      const moduleNumber = String(moduleIndex + 1).padStart(2, '0');
      const relative = `${chapterDir}/${moduleNumber}-${['grunnlag', 'mekanismer', 'anvendelse'][moduleIndex]}.json`;
      moduleFiles.push(relative);
      const topicIndexes = moduleTopicSlices[moduleIndex];
      const moduleEmners = topicIndexes.map((index) => domainEmner[index]);
      const moduleSections = sections.slice(moduleIndex * 3, moduleIndex * 3 + 3);
      const modulePlaces = meta.places.slice(moduleIndex * 2, moduleIndex * 2 + 2);
      const moduleClaims = [...new Set(moduleSections.flatMap((section) => section.paragraphClaimIds.flat()))];
      const moduleTheories = moduleEmners.map((entry) => theoryId(entry.emne_id));
      const misconceptions = moduleEmners.slice(0, moduleIndex < 2 ? 2 : 1).map((topic) => ({
        claim: `${topic.title} kan identifiseres sikkert fra navn, stil eller arena alene.`,
        correction: topic.limitation
      }));
      const sourceRefs = chapterSourceIds.map((id) => sourceById.get(id)).map((entry) => ({ id: entry.source_id, label: entry.title, url: entry.url, type: entry.source_type }));
      generated[relative] = {
        schema: 'history_go_fagverk_module_v1',
        version: '1.0.0',
        subject: 'subkultur',
        chapterId,
        id: `${chapterId}_module_${moduleIndex + 1}`,
        title: meta.moduleTitles[moduleIndex],
        sections: moduleSections,
        concepts: moduleEmners.map((topic) => ({ id: slug(topic.emne_id), term: topic.title, definition: topic.definition })),
        claimIds: moduleClaims,
        theoryEvidenceIds: moduleTheories,
        sources: sourceRefs,
        sourceLimitations: [...new Set(chapterSourceIds.map((id) => sourceById.get(id).limitations[0]))],
        workedExamples: moduleIndex < 2 ? [{
          title: `${modulePlaces[0][1]} og ${modulePlaces[1][1]} som sammenlignende casekandidater`,
          situation: `Sammenlign de canonicale place-postene for ${modulePlaces[0][1]} og ${modulePlaces[1][1]}. Begge er relevante for kapittelet, men koblingen er en analyseoppgave og ikke et selvstendig faktabevis.`,
          analysis: [modulePlaces[0][2], modulePlaces[1][2], 'Identifiser miljønær kilde, uavhengig kontroll og det sterkeste negative caset før konklusjon.']
        }] : [],
        commonMisconceptions: misconceptions,
        applicationTasks: [{
          task: `Analyser ett kvalifiserende og ett tvetydig case med ${methodsById.get(moduleEmners[0].method_ids[0]).title.toLowerCase()}.`,
          prompts: ['Dokumenter miljø, praksis og sosial posisjon.', 'Skil teori-claim fra lokal caseclaim.', 'Oppgi kontrollkilde, usikkerhet og personvern-/stigmavurdering.']
        }],
        selfCheck: moduleEmners.slice(0, moduleIndex < 2 ? 3 : 2).map((topic) => ({
          question: `Hva må dokumenteres før ${topic.title.toLowerCase()} kan brukes i et konkret case?`,
          answer: `${topic.mechanism} Samtidig må denne avgrensningen beholdes: ${topic.limitation}`
        })),
        relatedPlaces: modulePlaces.map(([id, name, role]) => {
          const validated = caseEvidenceByPlace.get(id);
          const rejected = rejectedCaseByPlace.get(id);
          return {
            id,
            name,
            role,
            evidenceStatus: validated ? 'validated_case' : rejected ? 'rejected_nonqualifying' : 'canonical_place_candidate_pending_profile_audit',
            ...(validated ? { caseEvidenceId: validated.evidence_id } : {}),
            ...(rejected ? { rejectionReason: rejected.reason, classificationDecisionSource: rejected.decision_source } : {})
          };
        })
      };
    }

    const chapterFile = `data/fagverk/subkultur/${chapterId}.json`;
    const briefFile = `${chapterDir}/brief.json`;
    generated[chapterFile] = {
      schema: 'history_go_fagverk_chapter_v1',
      version: '1.0.0',
      subject: 'subkultur',
      id: chapterId,
      title: meta.title,
      subtitle: meta.subtitle,
      lead: meta.lead,
      learningObjectives: domainEmner.map((topic) => `forklare ${topic.title.toLowerCase()} gjennom dokumentert mekanisme, avgrensning og motforklaring`),
      diagnosticQuestions: domainEmner.slice(0, 3).map((topic) => ({
        question: `Er ${topic.title.toLowerCase()} nok i seg selv til å klassifisere et sted eller miljø?`,
        answer: `Nei. ${topic.limitation}`
      })),
      productionBriefFile: briefFile,
      moduleFiles
    };
    generated[briefFile] = {
      schema: 'history_go_fagverk_chapter_brief_v1',
      version: '1.0.0',
      subject: 'subkultur',
      chapterId,
      primaryDomainId: domain.domain_id,
      requiredEmneIds: domain.emne_ids,
      requiredMethodIds: domain.method_ids,
      requiredTheoryEvidenceIds: allTheoryIds,
      requiredClaimIds: allClaimIds,
      editorialRequirements: {
        moduleCount: 3,
        sectionCount: 9,
        paragraphCount: 27,
        minimumClaimReferences: 36,
        minimumSourceReferences: 20,
        minimumWorkedExamples: 2,
        minimumMisconceptions: 5,
        minimumApplicationTasks: 3,
        minimumSelfChecks: 8,
        minimumRelatedPlaces: 6,
        paragraphClaimTraceRequired: true
      },
      evidenceBoundary: [
        'Teori-claims kan forklare begreper og mekanismer, men kan ikke brukes som faktakilde om et konkret sted eller menneske.',
        'En canonical place-post er en casekandidat; validated_case krever miljønær kilde, uavhengig kontroll og eksplisitt kildeposisjon.',
        'Konflikt, stil, fortrengning eller motstand skal ikke fylles inn dersom det ikke er dokumentert.',
        'Aktivitet, ungdom, estetikk, sjanger, skatepark eller pumptrack kvalifiserer ikke alene som Subkultur.',
        'Levende, sårbare eller kriminaliserte personer krever kontekstuelt personvern, identifikasjonsminimering og stigma-/romantiseringskontroll.'
      ],
      caseProfileStatus: 'case_links_source_validation_complete'
    };
    chapterRows.push({
      id: chapterId,
      title: meta.title,
      file: chapterFile,
      brief: briefFile,
      primary_domain_id: domain.domain_id,
      emne_ids: domain.emne_ids,
      status: 'content_ready_case_evidence_complete'
    });
  }

  generated['data/fagverk/subkultur/manifest.json'] = {
    schema: 'history_go_subkultur_chapter_manifest_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    status: 'chapters_and_assessment_ready_case_evidence_complete',
    chapters: chapterRows,
    totals: { chapters: 8, modules: 24, sections: 72, paragraphs: 216, minimum_claim_references: 288, minimum_source_references: 160, related_place_references: 48 },
    next_gate: 'runtime_materialization_and_final_gate',
    assessment: {
      package: 'data/quiz/subkultur/subkultur_subject_pathways_v1.json',
      legacy_audit: 'data/quiz/subkultur/subkultur_legacy_quiz_audit_v1.json',
      pathways: 8,
      questions: 40,
      knowledge_status: 'canonical_linked',
      legacy_active_questions: 0
    }
  };

  const osloIds = [...new Set(Object.values(CHAPTER_META).flatMap((meta) => meta.places).map(([id]) => id).filter((id) => !id.startsWith('lisbon_') && !['tou_stavanger', 'bergen_kjott_kulturhus', 'club_7_vika', 'kafe_x_tromso', 'uffa_huset_trondheim', 'svartlamon_trondheim', 'trikkestallen_skatepark_trondheim', 'mo_senteret_gyldenpris', 'nygardsparken_bergen'].includes(id)))];
  const norwayIds = ['arena_bekkestua', 'bergen_kjott_kulturhus', 'fysak_slettebakken', 'hulen_bergen', 'kafe_x_tromso', 'matfellesskap_st_petri_stavanger', 'mo_senteret_gyldenpris', 'nygardsparken_bergen', 'ressurssenter_kvinner_trondheim', 'svartlamon_trondheim', 'tou_stavanger', 'trikkestallen_skatepark_trondheim', 'uffa_huset_trondheim'];
  const lisboaIds = ['lisbon_anjos70', 'lisbon_bairro_alto', 'lisbon_crew_hassan', 'lisbon_desterro', 'lisbon_fabrica_braco_de_prata', 'lisbon_galeria_ze_dos_bois', 'lisbon_musicbox', 'lisbon_pink_street', 'lisbon_village_underground'];
  const profile = (id, label, geography, ids) => {
    const candidates = ids.map((placeId) => {
      const validated = caseEvidenceByPlace.get(placeId);
      const rejected = rejectedCaseByPlace.get(placeId);
      if (!validated && !rejected) return {
        case_id: `case_sub_${placeId}`,
        place_id: placeId,
        status: 'candidate_unvalidated',
        required_case_requirement_ids: ['case_req_sub_environment_practice_position', 'case_req_sub_voice_balance', 'case_req_sub_place_change', 'case_req_sub_ethics', 'case_req_sub_negative_case'],
        missing_before_validation: ['environment_near_source', 'independent_control_source', 'case_claims', 'claim_source_links', 'privacy_stigma_romanticization_review']
      };
      if (rejected) return {
        case_id: rejected.case_id,
        place_id: placeId,
        status: 'rejected_nonqualifying',
        resulting_category: rejected.resulting_category,
        rejection_reason: rejected.reason,
        decision_source: rejected.decision_source,
        required_case_requirement_ids: [],
        missing_before_validation: []
      };
      return {
        case_id: validated.case_id,
        place_id: placeId,
        status: 'validated_case',
        evidence_id: validated.evidence_id,
        report_path: validated.report_path,
        source_ids: validated.source_ids,
        required_case_requirement_ids: validated.requirement_results.map((result) => result.requirement_id),
        missing_before_validation: [],
        independent_control_status: 'PASS',
        ethics_review_status: validated.ethics_review.status
      };
    });
    const validatedCases = candidates.filter((candidate) => candidate.status === 'validated_case').length;
    const rejectedCount = candidates.filter((candidate) => candidate.status === 'rejected_nonqualifying').length;
    const pendingCount = candidates.length - validatedCases - rejectedCount;
    return {
    schema_version: '1.0.0', profile_id: id, subject_id: 'subkultur', status: pendingCount === 0 ? 'profile_case_validation_complete' : validatedCases ? 'profile_partial_case_validation' : 'candidate_profile_pending_evidence_audit',
    geography: { geography_id: geography, label },
    contract: {
      case_requirements_file: 'data/fag/subkultur/case_requirements_subkultur_canonical_v1.json',
      claims_file: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
      sources_file: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
      theory_evidence_file: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
      case_evidence_file: 'data/fag/subkultur/case_evidence_subkultur_canonical_v1.json',
      case_sources_file: 'data/fag/subkultur/case_sources_subkultur_canonical_v1.json'
    },
    candidates,
    production_coverage: { audited_candidates: ids.length, eligible_candidates: ids.length - rejectedCount, validated_cases: validatedCases, rejected_candidates: rejectedCount, remaining_candidates: pendingCount, completion_status: pendingCount === 0 ? 'COMPLETE' : validatedCases ? 'PARTIAL' : 'PENDING' }
  };
  };
  const osloProfile = profile('profile_subkultur_oslo', 'Oslo', 'geo_no_oslo', osloIds);
  const norwayProfile = profile('profile_subkultur_norge_norden', 'Norge/Norden utenfor Oslo', 'geo_no_nordic', norwayIds);
  const lisboaProfile = profile('profile_subkultur_lisboa', 'Lisboa', 'geo_pt_lisboa', lisboaIds);
  generated['data/fag/profiles/subkultur/oslo/profile.json'] = osloProfile;
  generated['data/fag/profiles/subkultur/norge_norden/profile.json'] = norwayProfile;
  generated['data/fag/profiles/subkultur/lisboa/profile.json'] = lisboaProfile;
  generated['data/fag/profiles/subkultur/manifest.json'] = {
    schema: 'history_go_subkultur_profiles_manifest_v1', version: '1.0.0', subject_id: 'subkultur', status: 'case_validation_complete',
    profiles: [
      { id: 'profile_subkultur_oslo', file: 'data/fag/profiles/subkultur/oslo/profile.json', status: osloProfile.status },
      { id: 'profile_subkultur_norge_norden', file: 'data/fag/profiles/subkultur/norge_norden/profile.json', status: norwayProfile.status },
      { id: 'profile_subkultur_lisboa', file: 'data/fag/profiles/subkultur/lisboa/profile.json', status: lisboaProfile.status }
    ],
    validated_cases: caseEvidence.length,
    rejected_candidates: rejectedCases.length,
    remaining_candidates: 50 - caseEvidence.length - rejectedCases.length,
    next_gate: 'quiz_knowledge_audit'
  };
  return generated;
}

const generated = build();
const changed = [];
for (const [relative, value] of Object.entries(generated)) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  let current = '';
  try { current = fs.readFileSync(abs(relative), 'utf8'); } catch {}
  if (current === next) continue;
  changed.push(relative);
  if (WRITE) {
    fs.mkdirSync(path.dirname(abs(relative)), { recursive: true });
    fs.writeFileSync(abs(relative), next, 'utf8');
  }
}

if (CHECK && changed.length) {
  console.error('Subkultur-kapitlene eller profilene er utdatert:');
  for (const relative of changed) console.error(`- ${relative}`);
  process.exitCode = 1;
} else {
  console.log(`Subkultur chapters ${WRITE ? 'skrevet' : 'OK'}: 8 kapitler, 24 moduler, 72 seksjoner, 216 avsnitt; ${changed.length} avvik.`);
}
