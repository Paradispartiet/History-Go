#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'fjernsyn-plattformer-og-deltakerhistorier';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const DOCUMENTARY_SOURCE_BRIEF_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const DOCUMENTARY_FULLTEXT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const REPRESENTATION_SOURCE_BRIEF_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_television_platforms_participation_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-television-platforms-participation-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const section = (id, title, emneId, paragraphs, claimIds, keyPoints, keyPointClaimIds) => ({
  id, title, emne_ids: [emneId], paragraphs,
  paragraphClaimIds: claimIds.map((claimId) => [claimId]), keyPoints,
  keyPointClaimIds: keyPointClaimIds.map((claimId) => [claimId])
});
const claim = (id, text, sourceIds, sectionId, resolution = 'verified_as_planned') => ({
  id, claim_plan_id: id, claim: text, source_ids: sourceIds, status: 'verified',
  plan_resolution: resolution, evidence_mode: 'source_fact_plus_bounded_historical_analysis', used_in: [sectionId]
});

export function buildFilmTvTelevisionPlatformsParticipationFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Fjernsyn, plattformer og deltakerhistorier');
  const em = Object.fromEntries(sourceBrief.topic_briefs.map((row) => [row.emne_id, row.emne_id]));
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.year ?? row.years, medium: row.medium,
    role: row.purpose, source_ids: row.source_ids
  }));

  const modules = {
    '01-kringkasting-direkte-og-tv-offentlighet.json': {
      id: 'kringkasting-direkte-og-tv-offentlighet', title: 'Kringkasting, direkte og TV-offentlighet',
      sections: [
        section('ftv-tp-kringkasting-1', 'Kringkastingshistorie skiller prøve, tjeneste og offentlighet', em.em_film_tv_kringkastingsfjernsynets_historie, [
          'Nasjonalbiblioteket skiller mellom de offentlige prøvebildene på Egertorget i 1954 og regulære norske fjernsynssendinger fra 20. august 1960. Prøvevisning og sendestart er derfor to forskjellige institusjonelle hendelser: den første gjorde mediet synlig i byrommet, den andre etablerte en varig kringkastingstjeneste.',
          'Kroningen av Elizabeth II i 1953 ble sett i hjem, puber og forsamlingslokaler rundt nyanskaffede apparater. Fjernsynets hjemlighet var dermed ikke bare privat; en nasjonal sending kunne organiseres gjennom kollektive mottakerrom før apparatet var vanlig i hver husholdning.',
          'American Archive of Public Broadcasting samler mer enn sytti år med programmer fra lokale, regionale og nasjonale public-service-miljøer. Slike samlinger gjør fjernsynshistorien flerskalert: det som ble sendt fra ett nasjonalt nettverk, er ikke identisk med det som ble produsert og sett i forskjellige lokalsamfunn.',
          'Nasjonalbibliotekets arkiv har komplett dekning av NRK etter 1990, mens eldre materiale består av historiske programmer og programrapporter som også kan beskrive ikke-bevarte sendinger. Påstander om sendeskjema og offentlighet må derfor skille selve sendingen, rapporten om den og grensene for dagens samling.'
        ], ['ftv-tp-pc-20','ftv-tp-pc-21','ftv-tp-pc-22','ftv-tp-pc-23'], [
          'Skill offentlig prøvevisning, regulær tjeneste og senere arkivdekning.',
          'Undersøk både nasjonale nettverk og lokale produksjons- og mottakerrom.'
        ], ['ftv-tp-pc-20','ftv-tp-pc-23']),
        section('ftv-tp-direkte-1', 'Direktesendt samtidighet er produsert og distribuert', em.em_film_tv_direktesendt_samtidighet_som_tv_historie, [
          'Kroningen i 1953 bandt et seremonielt forløp til kameraarbeid, relélogistikk, nyanskaffede apparater og kollektiv visning. Samtidigheten oppstod ikke bare fordi hendelsen skjedde «nå»; institusjoner og tekniske ledd måtte gjøre den synlig for spredte seere.',
          'Telstar formidlet et direkte transatlantisk fjernsynssignal i 1962, mens Our World i 1967 var et samordnet globalt program sendt via satellitt til millioner. Signalets rekkevidde og programmets organiserte samtidighet er to ulike historiske prestasjoner og må ikke slås sammen til én satellittpremiere.',
          'Da tusenvis samlet seg på Egertorget i 1954, ble offentlig samtidighet produsert før Norge hadde regulære fjernsynssendinger. Caset viser at en prøvesending kan være en betydelig mediehendelse uten å være identisk med etableringen av en stabil nasjonal tjeneste.',
          'Et direkte signal, et bevart opptak, et senere redigert utdrag og publikumsminnet om sendingen er forskjellige kilder. Direktesendt bildeevidens må derfor dateres og kobles til produksjons- og mottakssituasjonen før ettertidens klipp eller erindring brukes som dokumentasjon av hva seerne faktisk kunne se.'
        ], ['ftv-tp-pc-05','ftv-tp-pc-06','ftv-tp-pc-07','ftv-tp-pc-08'], [
          'Skill signaloverføring, programorganisering, hendelse og mottakelse.',
          'Skill direktesendingen fra opptaket, utdraget og det senere minnet.'
        ], ['ftv-tp-pc-06','ftv-tp-pc-08'])
      ],
      concepts: [
        { id: 'kringkastingstjeneste', term: 'Kringkastingstjeneste', definition: 'En varig institusjonell ordning for planlagt distribusjon av radio- eller fjernsynsprogrammer til et publikum.' },
        { id: 'provesending', term: 'Prøvesending', definition: 'En avgrenset teknisk eller offentlig demonstrasjon som ikke i seg selv etablerer regulær tjeneste.' },
        { id: 'direktesendt-samtidighet', term: 'Direktesendt samtidighet', definition: 'En produsert forbindelse mellom hendelse, signal, programforløp og mottakelse mens hendelsen pågår.' },
        { id: 'rele', term: 'Relé', definition: 'Et teknisk ledd som mottar og videresender signal mellom steder eller distribusjonsnett.' },
        { id: 'tv-offentlighet', term: 'TV-offentlighet', definition: 'De institusjonelle, romlige og sosiale forholdene som gjør fjernsyn til felles referanse og møtepunkt.' },
        { id: 'programrapport', term: 'Programrapport', definition: 'En skriftlig registrering av en sending som kan dokumentere programmet selv når opptaket mangler.' },
        { id: 'hjemmemedium', term: 'Hjemmemedium', definition: 'Et format eller en tjeneste som lar brukeren motta, lagre, velge eller spille av audiovisuelle verk i hjemmet.' },
        { id: 'plattformovergang', term: 'Plattformovergang', definition: 'En historisk endring der teknologi, tjeneste, forretningsmodell, tilgang og bruk forskyves i ulik takt.' }
      ]
    },
    '02-dokumentar-revisjon-og-deltakerbilder.json': {
      id: 'dokumentar-revisjon-og-deltakerbilder', title: 'Dokumentar, revisjon og deltakerbilder',
      sections: [
        section('ftv-tp-dokumentar-1', 'Dokumentariske sannhetsregimer har en historie', em.em_film_tv_dokumentarhistorier_og_sannhetsregimer, [
          'Cinéma vérité og direct cinema vokste fram i 1950- og 1960-årene rundt nye arbeidsmåter og et ideal om å komme nærmere uforutsigbar virkelighet. Crisis, Lonely Boy og Chronicle of a Summer viser at «mindre oppstilt» var et historisk program knyttet til apparat, mobilitet og filmskaperrolle, ikke et løfte om nøytral sannhet.',
          'Theresienstadt-filmen fra 1944 brukte dokumentarisk overflate til å skjule et ghetto- og deportasjonssystem gjennom tvang, iscenesettelse og propaganda. Caset viser at fotografisk registrering ikke alene garanterer sannhet; produksjonsmakt og formål må inngå i kildekritikken.',
          'Madeline Andersons dokumentar- og fjernsynsarbeid forbinder sannhetskrav med adgang til produksjonsroller. Når en Black kvinne fikk produsere og regissere erfaringer som ellers var marginalisert, endret ikke bare motivene seg; også hvem som kunne definere relevante virkeligheter ble historisk synlig.',
          'Dokumentarhistorie kan ikke ordnes som en lineær utvikling mot stadig mer realisme. Theresienstadts påtvungne bedrag, vérité-bevegelsens nærværsideal og Andersons produksjonstilgang må sammenlignes gjennom institusjon, apparat, arbeidsform og erklært forhold til virkeligheten.'
        ], ['ftv-tp-pc-09','ftv-tp-pc-10','ftv-tp-pc-11','ftv-tp-pc-12'], [
          'Historiser dokumentarens apparat, arbeidsform og erklærte virkelighetsforhold.',
          'Behandle produksjonsmakt som del av sannhetsregimet.'
        ], ['ftv-tp-pc-09','ftv-tp-pc-12']),
        section('ftv-tp-revisjon-1', 'Historiografisk revisjon endrer kilder og analyseenheter', em.em_film_tv_glemte_forlop_og_historiografisk_revisjon, [
          'Lokale public-service-programmer og familieopptak bryter med en fjernsynshistorie ordnet bare etter nasjonale nettverk og prime time. AAPB og Great Migration Home Movie Project flytter analyseenheten fra den sentrale kanalen til regionale programmer, familier og hverdagsliv.',
          'Madeline Andersons dokumenterte karriere korrigerer en produksjonshistorie som overser arbeid bak kamera og Black kvinners adgang til fjernsynsproduksjon. Revisjonen består ikke bare i å legge til navnet hennes; arbeidsrolle, institusjon og hvilke erfaringer arbeidet gjorde synlige må inn i forklaringen.',
          'Et bevart program, en programrapport og et manglende opptak gir forskjellig evidens. Nasjonalbibliotekets samlingsbeskrivelse viser at historikeren må dokumentere hvilket spor som finnes før fravær i avspillingsarkivet blir tolket som at en sending eller et forløp aldri eksisterte.',
          'Historiografisk revisjon krever nye kilder og nye analyseenheter. Familieopptak, lokale programmer, produksjonskarrierer og samlingsfravær kan endre selve periodiseringen; de skal ikke bare plasseres som tillegg i en uendret kanon av nasjonale nettverk og kjente programtitler.'
        ], ['ftv-tp-pc-13','ftv-tp-pc-14','ftv-tp-pc-15','ftv-tp-pc-16'], [
          'La nye kilder endre analyseenheten, ikke bare navnelisten.',
          'Skill manglende opptak fra historisk ikke-eksistens.'
        ], ['ftv-tp-pc-16','ftv-tp-pc-15']),
        section('ftv-tp-deltaker-1', 'Hjemmebilder blir kilder gjennom relasjoner og metadata', em.em_film_tv_amatorfilm_hjemmevideo_og_deltakerhistorie, [
          'Northeast Historic Film prioriterer annotasjon om hvem som filmet, hva som vises, hvilket utstyr som ble brukt og hvordan filmen ble vist. Hjemmefilmen blir derfor historisk lesbar gjennom proveniens og familiekunnskap, ikke bare gjennom motivet i bildene.',
          'Disneyland Dream er både Barstow-familiens reiseopptak fra 1956 og et senere National Film Registry-objekt. Det unike familieopptaket, konkurransereisen og ettertidens kulturarvstatus er tre forskjellige historiske lag som må holdes sammen uten å bli gjort identiske.',
          'Great Migration Home Movie Project behandler African American-familiers analoge bilder som historisk materiale om migrasjon, hverdagsliv og minne. Prosjektet viser hvordan deltakerbilder kan endre hvem som er synlig i historien når familier og lokalsamfunn også bidrar med kontekst.',
          'Me at the Zoo ble lastet opp i 2005, mens Pew senere målte kraftig vekst i bruk av videodelingssider mellom 2006 og 2009. Den første opplastingen dokumenterer en plattformhendelse; bruksmålingen dokumenterer en bredere praksisendring. Ingen av dem kan alene være hele deltakerhistorien.'
        ], ['ftv-tp-pc-01','ftv-tp-pc-02','ftv-tp-pc-03','ftv-tp-pc-04'], [
          'Registrer proveniens, apparat, relasjon og visningshistorie for deltakerbilder.',
          'Skill den første plattformhendelsen fra senere dokumentert bruk.'
        ], ['ftv-tp-pc-01','ftv-tp-pc-04'])
      ],
      workedExamples: [
        { id: 'ftv-tp-ex-1', title: '1954 eller 1960?', situation: 'Norsk fjernsyn får to mulige startår.', analysis: ['Kod 1954 som offentlig prøvevisning og 1960 som regulær sendestart.', 'Beskriv hvilken institusjonell påstand hvert år kan bære, og ikke slå dem sammen til én premiere.'] },
        { id: 'ftv-tp-ex-2', title: 'Signal eller globalt program?', situation: 'Telstar 1962 og Our World 1967 omtales som satellittfjernsynets begynnelse.', analysis: ['Skill transatlantisk signaloverføring fra et samordnet globalt program.', 'Registrer kringkastere, satellittnett, programinnhold og mottakelse separat.'] },
        { id: 'ftv-tp-ex-3', title: 'Tre dokumentariske sannhetsregimer', situation: 'Theresienstadt, cinéma vérité og Madeline Anderson sammenlignes.', analysis: ['Lag kolonner for produksjonsmakt, apparat, arbeidsform og erklært virkelighetsforhold.', 'Unngå å rangere dem på én enkel skala fra falskt til sant.'] },
        { id: 'ftv-tp-ex-4', title: 'Hjemmefilmens metadata', situation: 'Et familieopptak viser en reise, men mangler kontekst.', analysis: ['Finn skaper, relasjoner, opptaksformat, dato, visningshistorie og senere arkivstatus.', 'Marker hvilke tolkninger som ikke kan avgjøres av bildene alene.'] },
        { id: 'ftv-tp-ex-5', title: 'Lansering eller overgang?', situation: 'Netflix 2007, YouTube 2005 og brukstall fra 2009 legges i samme tidslinje.', analysis: ['Skill selskapets tjenestelansering, forretningssegment og publikumsbruk.', 'Bruk samtidige selskapsdokumenter som primærspor, men la uavhengige bruksmålinger kontrollere overgangspåstanden.'] }
      ],
      commonMisconceptions: [
        { claim: 'Norsk fjernsyn startet på én entydig dato.', correction: 'Offentlig prøvevisning, regulær sendestart, dekning og utbredelse er forskjellige hendelser.' },
        { claim: 'Satellitten skapte straks global fjernsynsoffentlighet.', correction: 'Signalrekkevidde, programkoordinering, institusjoner og mottakelse endret seg i ulike trinn.' },
        { claim: 'Direktebilder viser hendelsen uten formidling.', correction: 'Kamera, regi, signalnett, utvalg og mottakersituasjon produserer hva som kan ses.' },
        { claim: 'Dokumentarens fotografiske overflate garanterer sannhet.', correction: 'Tvang, iscenesettelse, arbeidsform og produksjonsmakt kan organisere både registrering og bedrag.' },
        { claim: 'Hjemmefilm er privat og derfor historisk ubetydelig.', correction: 'Proveniens og kontekst kan gjøre familiebilder til evidens om hverdagsliv, migrasjon og deltakerhistorie.' },
        { claim: 'En ny plattformdato beviser at den gamle seerpraksisen forsvant.', correction: 'Tjenestelansering må sammenholdes med tilbud, tilgang og sammenlignbare bruksdata over tid.' }
      ]
    },
    '03-kabel-hjemmemedier-og-plattformovergang.json': {
      id: 'kabel-hjemmemedier-og-plattformovergang', title: 'Kabel, hjemmemedier og plattformovergang',
      sections: [
        section('ftv-tp-kabel-1', 'Kabel og satellitt er infrastruktur, regulering og marked', em.em_film_tv_kommersiell_tv_kabel_og_satellitt, [
          'Tidlig amerikansk kabel forbedret lokal tilgang til kringkastingssignaler og brukte blant annet mikrobølgereléer. FCCs første regler i 1965 viser at kabelens institusjonalisering koblet teknisk videresending til føderal regulering; den var ikke bare et nytt kanaltilbud.',
          'Ofcom beskriver hvordan britisk betalingsfjernsyn fra 1980- og 1990-årene vokste gjennom flere kabel- og satellittplattformer med ulik framgang. Kanalvalg og abonnement ble dermed organisert av konkrete distributører og markedsforløp, ikke av én ensartet kommersialisering.',
          'Telstar i 1962 var satellittbasert signaloverføring, mens senere satellittfjernsyn organiserte kanaler, betaling og abonnement som kommersiell plattform. Teknologien som flytter signalet og markedet som pakker innhold for husholdningen er to analyseenheter som må skilles.'
        ], ['ftv-tp-pc-17','ftv-tp-pc-18','ftv-tp-pc-19'], [
          'Koble distribusjonsteknikk til regulering og konkret tjeneste.',
          'Skill satellittoverføring fra satellittfjernsynets kanal- og abonnementsmodell.'
        ], ['ftv-tp-pc-17','ftv-tp-pc-19']),
        section('ftv-tp-video-1', 'Video og digitale hjemmemedier overlapper', em.em_film_tv_video_hjemmemedier_og_digital_omveltning, [
          'Ampex lanserte et levedyktig videotapesystem i 1956, og to-tommers bånd spredte seg raskt i britisk fjernsyn fordi opptak kunne brukes uten filmframkalling og med større fleksibilitet. Videotape endret opptak, redigering, gjenbruk og produksjonsrytme før forbrukerformatene gjorde hjemmeopptak vanlig.',
          'Netflix beskrev i 2007–2008 DVD-post og instant watching som samtidige deler av abonnementet. Overgangen fra fysisk hjemmemedium til nettlevering var derfor hybrid: katalog, postdistribusjon, PC-avspilling og planlagte TV-enheter eksisterte i samme forretningsmodell.',
          'Nasjonalbibliotekets skille mellom bevarte sendinger, programrapporter og samlingsdekning viser hvordan katalogdata påvirker gjenfinnbarhet. Digital tilgang gjør ikke historien komplett; metadata kan dokumentere et program som ikke finnes som avspillbart opptak, og samlingen må fortsatt avgrenses.',
          'YouTubes opplastingsmodell og den målte veksten i videodeling flyttet deler av hjemmevideoen fra privat framvisning til søkbar nettspredning. Endringen gjaldt både distribusjon og offentlighet, men ikke all hjemmevideo ble dermed offentlig eller plattformbasert.'
        ], ['ftv-tp-pc-28','ftv-tp-pc-29','ftv-tp-pc-30','ftv-tp-pc-31'], [
          'Følg opptak, lagring, tilgang og visningsrom som egne overgangslag.',
          'Ikke likestill digital søkbarhet med komplett bevaring.'
        ], ['ftv-tp-pc-28','ftv-tp-pc-30']),
        section('ftv-tp-stromming-1', 'Plattformovergang må dokumenteres i flere tidsserier', em.em_film_tv_stromming_og_fjernsynets_plattformovergang, [
          'Netflix’ 2007-rapport beskrev en stor DVD-posttjeneste som samtidig tilbød utvalgte titler gjennom instant watching på PC. Det samtidige selskapsdokumentet viser strømmingens tidlige plass i en hybrid abonnementsmodell uten å gjøre den til selskapets eneste virksomhet.',
          'Fra fjerde kvartal 2011 rapporterte Netflix domestic streaming, international streaming og domestic DVD som tre driftssegmenter. Segmentdelingen dokumenterer et institusjonelt og økonomisk skifte; den beviser ikke alene når ulike publikumsgrupper sluttet å bruke DVD eller lineær-TV.',
          'YouTube bygde et parallelt nettvideoforløp rundt brukeropplasting, mens Pew målte økende bruk av videodelingssider og både brukerlaget og profesjonelt materiale. Dette forløpet kan ikke reduseres til abonnementsstrømming, fordi tilgangsmodell, produsentrolle og offentlighet var annerledes.',
          'Lanseringsdatoer og selskapssegmenter må sammenholdes med sammenlignbare bruksdata før en seerpraksis erklæres erstattet. Pew måler rask vekst i videodeling, mens SSBs lange mediebruksserie viser verdien av stabile måleopplegg når teknologi, tjenester og vaner overlapper.'
        ], ['ftv-tp-pc-24','ftv-tp-pc-25','ftv-tp-pc-26','ftv-tp-pc-27'], [
          'Skill tjenestelansering, selskapssegment, tilgang og dokumentert bruk.',
          'Sammenlign abonnementsstrømming og opplastingsvideo som ulike plattformforløp.'
        ], ['ftv-tp-pc-25','ftv-tp-pc-27'])
      ],
      applicationTasks: [
        { id: 'ftv-tp-task-1', title: 'Startårsmatrisen', task: 'Undersøk når fjernsynet «startet» i et land.', prompts: ['Finn prøvesending, regulær tjeneste og dokumentert utbredelse.', 'Hvilken påstand kan hvert år bære?', 'Hvilke arkivspor finnes?'] },
        { id: 'ftv-tp-task-2', title: 'Direktekjeden', task: 'Kartlegg én direktesendt historisk begivenhet.', prompts: ['Hvilken hendelse filmes?', 'Hvordan produseres og videresendes signalet?', 'Hvor og hvordan mottas programmet?'] },
        { id: 'ftv-tp-task-3', title: 'Motarkivet', task: 'Bygg en liten fjernsynshistorie fra en oversett kilde.', prompts: ['Velg lokalt program, familieopptak eller produksjonskarriere.', 'Hvilken etablert analyseenhet utfordres?', 'Hva forblir fraværende?'] },
        { id: 'ftv-tp-task-4', title: 'Hjemmefilmkortet', task: 'Lag et kildekort for ett amatør- eller hjemmeopptak.', prompts: ['Hvem filmer hvem?', 'Hvilket apparat, sted og tidspunkt er dokumentert?', 'Hvordan ble materialet vist, annotert og senere bevart?'] },
        { id: 'ftv-tp-task-5', title: 'Hybridperioden', task: 'Dokumenter en periode der gammelt og nytt hjemmemedium eksisterer samtidig.', prompts: ['Skill format, tjeneste og avspillingsenhet.', 'Finn et samtidig selskapsspor og en uavhengig brukskilde.', 'Hva blir ikke erstattet med én gang?'] },
        { id: 'ftv-tp-task-6', title: 'Stedslesningen', task: 'Sammenlign Egertorget, Marienlyst og Nasjonalbiblioteket som fjernsynshistoriske steder.', prompts: ['Hvilket sted handler om offentlig mottakelse?', 'Hvilket handler om produksjon?', 'Hvilket handler om ettertidig dokumentasjon og tilgang?'] }
      ],
      selfCheck: [
        { question: 'Hvorfor er 1954 og 1960 ulike norske fjernsynsår?', answer: '1954 gjelder offentlig prøvevisning; 1960 gjelder regulær sendestart.' },
        { question: 'Hva skiller Telstar 1962 fra Our World 1967?', answer: 'Det første caset gjelder direkte transatlantisk signal; det andre et samordnet globalt program.' },
        { question: 'Hvorfor er et direktebilde ikke uformidlet?', answer: 'Kamera, regi, distribusjon og mottakersituasjon avgrenser hva seeren kan se.' },
        { question: 'Hva viser Theresienstadt-caset om dokumentar?', answer: 'Dokumentarisk overflate kan produseres gjennom tvang, iscenesettelse og bedrag.' },
        { question: 'Hva gjør en hjemmefilm kildekritisk lesbar?', answer: 'Proveniens, relasjoner, apparat, annotasjon og visningshistorie.' },
        { question: 'Hvorfor er satellittsignal og satellitt-TV ulike?', answer: 'Det ene er overføringsteknologi; det andre en kanal-, distribusjons- og abonnementsmodell.' },
        { question: 'Hva dokumenterer Netflix-segmentene i 2011?', answer: 'En organisatorisk og økonomisk deling av strømming og DVD, ikke alene publikums fullførte overgang.' },
        { question: 'Hva må til før en seerpraksis kan kalles erstattet?', answer: 'Lansering og tjenesteendring må sammenholdes med sammenlignbare bruksdata over tid.' }
      ]
    }
  };

  const claims = [
    claim('ftv-tp-pc-01', 'Hjemmefilmer blir historiske kilder gjennom proveniens, annotasjon og kunnskap om hvem som filmer hvem, med hvilket utstyr og for hvilken visning.', ['ftvtp09-loc-home-movies'], 'ftv-tp-deltaker-1'),
    claim('ftv-tp-pc-02', 'Disneyland Dream er både et unikt familie- og reiseopptak fra 1956 og et senere kanonisert National Film Registry-objekt.', ['ftvtp10-loc-disneyland-dream'], 'ftv-tp-deltaker-1'),
    claim('ftv-tp-pc-03', 'Great Migration Home Movie Project bruker familiebilder og deltakerkontekst til å gjøre African American-hverdagsliv, migrasjon og minne synlig i historien.', ['ftvtp11-nmaahc-home-movies'], 'ftv-tp-deltaker-1'),
    claim('ftv-tp-pc-04', 'Me at the Zoo dokumenterer en tidlig plattformhendelse i 2005, mens Pew-målinger fra 2006–2009 dokumenterer en bredere vekst i videodelingsbruk.', ['ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'], 'ftv-tp-deltaker-1'),
    claim('ftv-tp-pc-05', 'Kroningen i 1953 bandt produksjonslogistikk, mottakerkjøp og kollektiv visning til en nasjonal fjernsynsbegivenhet.', ['ftvtp03-science-coronation'], 'ftv-tp-direkte-1'),
    claim('ftv-tp-pc-06', 'Telstars direkte transatlantiske signal i 1962 og Our Worlds globale program i 1967 var forskjellige historiske prestasjoner.', ['ftvtp04-ebu-innovation','ftvtp05-science-our-world'], 'ftv-tp-direkte-1'),
    claim('ftv-tp-pc-07', 'Prøvebildene på Egertorget i 1954 produserte offentlig samtidighet seks år før regulær norsk fjernsynskringkasting.', ['ftvtp01-nb-first-tv'], 'ftv-tp-direkte-1'),
    claim('ftv-tp-pc-08', 'Direktesendt bildeevidens må skilles fra bevart opptak, senere redigert utdrag og publikumsminne.', ['ftvtp01-nb-first-tv','ftvtp02-nb-broadcast-archive','ftvtp03-science-coronation'], 'ftv-tp-direkte-1'),
    claim('ftv-tp-pc-09', 'Cinéma vérité og direct cinema knyttet nye arbeidsformer og apparatmobilitet til et historisk ideal om mindre oppstilt virkelighet.', ['ftvtp12-nfb-verite'], 'ftv-tp-dokumentar-1'),
    claim('ftv-tp-pc-10', 'Theresienstadt-filmen viser at dokumentarisk overflate kan produseres gjennom tvang, iscenesettelse og propaganda.', ['ftvtp13-ushmm-theresienstadt'], 'ftv-tp-dokumentar-1'),
    claim('ftv-tp-pc-11', 'Madeline Andersons arbeid forbinder fjernsynsdokumentarens sannhetskrav med tilgang til produksjonsroller og hvilke erfaringer som kunne formidles.', ['ftvtp14-nmaahc-anderson'], 'ftv-tp-dokumentar-1'),
    claim('ftv-tp-pc-12', 'Dokumentarhistorie må sammenligne institusjon, apparat, arbeidsform og erklært virkelighetsforhold framfor å beskrive én lineær realismeutvikling.', ['ftvtp12-nfb-verite','ftvtp13-ushmm-theresienstadt','ftvtp14-nmaahc-anderson'], 'ftv-tp-dokumentar-1'),
    claim('ftv-tp-pc-13', 'Lokale public-service-programmer og familieopptak kan bryte en nettverks- og prime-time-dominert fjernsynshistorie.', ['ftvtp11-nmaahc-home-movies','ftvtp15-loc-aapb'], 'ftv-tp-revisjon-1'),
    claim('ftv-tp-pc-14', 'Madeline Andersons dokumenterte karriere korrigerer en produksjonshistorie som overser arbeid bak kamera og Black kvinners tilgang til fjernsynsproduksjon.', ['ftvtp14-nmaahc-anderson'], 'ftv-tp-revisjon-1'),
    claim('ftv-tp-pc-15', 'Forskjellen mellom bevart sending, programrapport og manglende opptak begrenser hva som kan hevdes om norsk fjernsynshistorie.', ['ftvtp02-nb-broadcast-archive'], 'ftv-tp-revisjon-1'),
    claim('ftv-tp-pc-16', 'Historiografisk revisjon krever nye kilder og analyseenheter, ikke bare flere navn i en uendret nettverks- og programkanon.', ['ftvtp02-nb-broadcast-archive','ftvtp11-nmaahc-home-movies','ftvtp14-nmaahc-anderson','ftvtp15-loc-aapb'], 'ftv-tp-revisjon-1'),
    claim('ftv-tp-pc-17', 'Tidlig amerikansk kabel koblet lokal signaltilgang og mikrobølgeoverføring til føderal regulering i 1965.', ['ftvtp06-fcc-cable'], 'ftv-tp-kabel-1'),
    claim('ftv-tp-pc-18', 'Britisk betalingsfjernsyn vokste gjennom ulike kabel- og satellittplattformer som endret kanalvalg og abonnementsforhold.', ['ftvtp07-ofcom-pay-tv'], 'ftv-tp-kabel-1'),
    claim('ftv-tp-pc-19', 'Satellitt som overføringsteknologi må skilles fra satellittfjernsyn som kommersiell kanal- og abonnementsmodell.', ['ftvtp04-ebu-innovation','ftvtp07-ofcom-pay-tv'], 'ftv-tp-kabel-1'),
    claim('ftv-tp-pc-20', 'Offentlig prøvevisning i 1954 og regulær sendestart i 1960 markerer forskjellige institusjonelle faser i norsk fjernsyn.', ['ftvtp01-nb-first-tv'], 'ftv-tp-kringkasting-1'),
    claim('ftv-tp-pc-21', 'Kroningen i 1953 viser at kringkastingsfjernsynets hjemlighet også omfattet puber og andre kollektive mottakerrom.', ['ftvtp03-science-coronation'], 'ftv-tp-kringkasting-1'),
    claim('ftv-tp-pc-22', 'Lokale og regionale public-service-programmer gjør nasjonal fjernsynshistorie flerskalert.', ['ftvtp15-loc-aapb'], 'ftv-tp-kringkasting-1'),
    claim('ftv-tp-pc-23', 'Sendinger, programrapporter og samlingsomfang må sammenholdes før konklusjoner om sendeskjema og nasjonal TV-offentlighet.', ['ftvtp02-nb-broadcast-archive'], 'ftv-tp-kringkasting-1'),
    claim('ftv-tp-pc-24', 'Netflix kombinerte i 2007–2008 DVD-post, nettkatalog og instant watching i en hybrid abonnementsmodell.', ['ftvtp16-sec-netflix-2008'], 'ftv-tp-stromming-1'),
    claim('ftv-tp-pc-25', 'Netflix rapporterte fra fjerde kvartal 2011 domestic streaming, international streaming og domestic DVD som egne virksomhetssegmenter.', ['ftvtp17-sec-netflix-2011'], 'ftv-tp-stromming-1'),
    claim('ftv-tp-pc-26', 'YouTubes opplastingsmodell og dokumenterte bruksvekst var et parallelt nettvideoforløp som ikke kan reduseres til abonnementsstrømming.', ['ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'], 'ftv-tp-stromming-1'),
    claim('ftv-tp-pc-27', 'Lanseringsdatoer må sammenholdes med longitudinelle bruksdata før en seerpraksis kan hevdes å være erstattet.', ['ftvtp19-pew-online-video','ftvtp20-ssb-media-use'], 'ftv-tp-stromming-1'),
    claim('ftv-tp-pc-28', 'Videotape endret fjernsynets opptak, redigering, gjenbruk og produksjonsrytme før forbrukerformatene flyttet opptak inn i hjemmet.', ['ftvtp08-bfi-videotape'], 'ftv-tp-video-1'),
    claim('ftv-tp-pc-29', 'DVD-by-mail og instant watching eksisterte samtidig og viser at hjemmemedieovergangen var hybrid.', ['ftvtp16-sec-netflix-2008'], 'ftv-tp-video-1'),
    claim('ftv-tp-pc-30', 'Bevarte sendinger, programrapporter og katalogmetadata påvirker hvilke kringkastede programmer som kan gjenfinnes som historiske objekter.', ['ftvtp02-nb-broadcast-archive'], 'ftv-tp-video-1', 'verified_after_scope_narrowing'),
    claim('ftv-tp-pc-31', 'Lavterskel nettvideo flyttet deler av hjemmeopptaket fra privat sirkulasjon til søkbar offentlig distribusjon.', ['ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'], 'ftv-tp-video-1')
  ];

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
    id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'film_tv_historie_historiografi',
    editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: unit.emne_ids, method_ids: methodIds,
    title: 'Fjernsyn, plattformer og deltakerhistorier: hvordan signaler, tjenester og bilder blir historie',
    subtitle: 'Fra norsk sendestart og global direktesamtidighet til hjemmevideo, motarkiver og hybride plattformoverganger',
    lead: 'Kapittelet bygger fjernsynshistorie ved å skille signal, program, institusjon, mottakelse, opptaksformat, tjenestelansering og dokumentert bruk. Det viser hvordan dokumentariske sannhetsregimer og deltakerbilder endrer historieskrivingen, uten å overta neste enhets nærlesing av dokumentaretikk eller arkivområdets bevaringspraksis.',
    learningObjectives: [
      'skille prøvesending, regulær tjeneste, utbredelse og senere arkivdekning',
      'analysere direktesendt samtidighet gjennom hendelse, signal, program og mottakelse',
      'historisere dokumentariske sannhetsregimer gjennom apparat, arbeidsform og produksjonsmakt',
      'bruke lokale programmer, produksjonskarrierer og familieopptak til historiografisk revisjon',
      'kildekritisere hjemmefilm gjennom proveniens, relasjoner, metadata og visningshistorie',
      'skille kabel- og satellittinfrastruktur fra regulering, kanalpakker og abonnement',
      'følge videotape, DVD, nettvideo og strømming som overlappende hjemmemedier',
      'skille plattformlansering og selskapssegment fra dokumentert endring i publikumsbruk'
    ],
    diagnosticQuestions: [
      { question: 'Startet norsk fjernsyn i 1954 eller 1960?', answer: 'Begge år er relevante, men for ulike hendelser: offentlig prøvevisning og regulær sendestart.' },
      { question: 'Er Telstar og Our World samme satellittmilepæl?', answer: 'Nei. Det første gjelder et transatlantisk signal, det andre et samordnet globalt program.' },
      { question: 'Er direktebilder uformidlet evidens?', answer: 'Nei. Produksjon, utvalg, signalnett og mottakersituasjon former hva som blir synlig.' },
      { question: 'Beviser en plattformlansering at gammel bruk forsvant?', answer: 'Nei. Lansering må sammenholdes med tilgang, tjenesteutvikling og sammenlignbare bruksdata.' },
      { question: 'Kan hjemmefilm revidere fjernsynshistorie?', answer: 'Ja, når proveniens og deltakerkontekst gjør hverdagsliv og erfaringer lesbare som historiske spor.' }
    ],
    relatedPlaces: [
      { id: 'egertorget', name: 'Egertorget', role: 'Bruk stedet til å skille den offentlige prøvevisningen av TV-bilder i 1954 fra regulær norsk fjernsynstjeneste fra 1960.' },
      { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Les anlegget som fysisk produksjons- og kringkastingsinfrastruktur, og skill studioarbeid og sendetid fra mottakelse og senere arkivering.' },
      { id: 'nasjonalbiblioteket', name: 'Nasjonalbiblioteket', role: 'Undersøk hvordan bevarte sendinger, programrapporter, metadata og tilgangsgrenser former hva som kan hevdes om norsk fjernsynshistorie.' }
    ],
    workCases, moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims, sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret fjernsyns- og plattformhistorie som skiller teknologi, institusjon, program, tilgang og bruk og lar deltakerbilder og motarkiver revidere hovedfortellingen.',
    audience: 'Brukere som skal kunne bygge og kritisere historiske forklaringer om kringkasting, dokumentar, hjemmebilder og plattformoverganger.',
    requiredEmneIds: unit.emne_ids, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: ['prøvesending vs regulær tjeneste','direkte signal vs globalt program','sending vs opptak vs redigert utdrag vs minne','dokumentarisk overflate vs produksjonsmakt','bevart sending vs programrapport vs arkivfravær','privat hjemmeopptak vs historisk deltakerkilde','satellittoverføring vs satellitt-TV-marked','videotapeproduksjon vs forbrukerformat','tjenestelansering vs selskapssegment vs bruksendring','abonnementsstrømming vs opplastingsvideo','historisk dokumentarsannhetsregime vs nærlesing av evidens og etikk','digital gjenfinnbarhet vs arkivets bevaringspraksis'],
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, sourceLocationsRequired: true, chronologySeparatesLaunchSignalServiceAdoptionAndLaterHistoriography: true, everyPlannedClaimResolved: true },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: unit.emne_ids, excluded: ['dagens plattformmakt og anbefalingssystemer','samtidig fanproduksjon og publikumsdataanalyse','nærlesing av dokumentarisk evidens og deltakeretikk','arkivets bevaringspraksis som hovedtema','digital restaurering og autentisitet','selskapets opphavshistorie som total overgangshistorie'] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 8, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '8/8', plannedClaimResolution: '31/31' }
  };
  const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources, claims };

  sourceBrief.version = '1.1.0';
  sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.topic_briefs = sourceBrief.topic_briefs.map((topic) => ({
    ...topic,
    planned_claims: topic.planned_claims.map((planned) => ({
      ...planned, status: 'resolved_to_verified_claim', final_claim_id: planned.id,
      resolution: claims.find((row) => row.id === planned.id)?.plan_resolution
    }))
  }));
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: unit.emne_ids.length, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_dokumentar_evidens_og_etikk';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.85.0'; registry.updatedAt = '2026-08-12';
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: unit.emne_ids, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Fjernsyn, plattformer og deltakerhistorier er registrert etter fulltekst- og evidensport med 8 canonicale emner, 8 emneeide seksjoner, 31 claimsporede avsnitt, 31 verifiserte claims, 20 brukte inspectable kilder, 19 sending-, format-, institusjons-, hjemmefilm- og plattformcase og 3 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Dokumentar, evidens og etikk; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.fifthSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.73.0'; status.updatedAt = '2026-08-12';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress'; filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Fjernsyn, plattformer og deltakerhistorier er registrert etter fulltekst- og evidensaudit: 8/8 canonicale emner, 3 faglig avgrensede moduler, 8 seksjoner, 31 avsnitt med claimtrace, 31/31 løste claimplaner, 20 brukte inspectable kilder, 19 case og 3 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Dokumentar, evidens og etikk.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0'; sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedGates,
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: claims.length === 31
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvTelevisionPlatformsParticipationFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([OUTPUT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate) && !force) {
    console.log('Fjernsyn, plattformer og deltakerhistorier er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvTelevisionPlatformsParticipationFulltextV1();
  write(P.chapter, built.chapter); write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc); write(P.sourceBrief, built.sourceBrief); write(P.registry, built.registry);
  write(P.status, built.status); write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvTelevisionPlatformsParticipationFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV fjernsynsfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
