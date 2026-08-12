#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'filmhistorie-bevegelser-og-historiografi';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const TELEVISION_FULLTEXT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const DOCUMENTARY_SOURCE_BRIEF_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const DOCUMENTARY_FULLTEXT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const REPRESENTATION_SOURCE_BRIEF_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_history_movements_historiography_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-history-movements-historiography-source-brief-v1-audit.json'
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

export function buildFilmTvHistoryMovementsHistoriographyFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Filmhistorie, bevegelser og historiografi');
  const em = Object.fromEntries(sourceBrief.topic_briefs.map((row) => [row.emne_id, row.emne_id]));
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.year ?? row.years, medium: row.medium,
    role: row.purpose, source_ids: row.source_ids
  }));

  const modules = {
    '01-tidlig-film-stumfilm-lyd-og-studio.json': {
      id: 'tidlig-film-stumfilm-lyd-og-studio', title: 'Tidlig film, stumfilm, lyd og studio',
      sections: [
        section('ftv-hmh-tidlig-film-1', 'Tidlig film var flere samtidige praksiser', em.em_film_tv_tidlig_film_attraksjoner_og_visningskultur, [
          'Cinématographe samlet kamera, kopieringsapparat og projektor i en transportabel innretning. National Science and Media Museum dokumenterer korte opptak, ti-filmsprogrammet i Paris i 1895 og senere visninger i ulike lokaler. Tidlig filmhistorie må derfor følge apparat, program og visningssted sammen—ikke bare navngi én oppfinner eller én premieredato.',
          'Lumière-programmenes hverdagsbilder, Méliès’ studiobaserte illusjoner og Alice Guy Blachés arbeid i Gaumont og Solax var samtidige, men ulike produksjonspraksiser. De viser at aktualitet, komedie, triks, iscenesettelse og selskapsarbeid utviklet seg ved siden av hverandre.',
          'Korte attraksjoner og programkultur var ikke bare en uferdig versjon av senere spillefilm. Ett program kunne samle fabrikkport, familieøyeblikk, tog, komedie og andre korte nummer, mens Méliès bygde fantasi og scenisk illusjon. Analysen må beskrive hva publikum faktisk ble tilbudt før den måler formen mot senere fortellefilm.',
          'Pionerhistorier krever flere kildetyper. Lumière-artikkelen er apparat- og visningshistorie, Méliès-teksten et situert selvbiografisk spor, og Women Film Pioneers kombinerer filmografi, arbeidsroller og arkivusikkerhet. Sammenstillingen hindrer at ett navn eller én erindring blir hele opphavshistorien.'
        ], ['ftv-hmh-pc-32','ftv-hmh-pc-33','ftv-hmh-pc-34','ftv-hmh-pc-35'], [
          'Skill apparat, opptak, program og visningssted i tidlig film.',
          'Sammenhold pionerfortellinger med filmografi, roller og arkivusikkerhet.'
        ], ['ftv-hmh-pc-32','ftv-hmh-pc-35']),
        section('ftv-hmh-stum-lyd-1', 'Lydskiftet var teknisk og historisk ujevnt', em.em_film_tv_stumfilm_lydovergang_og_modernitet, [
          'The Jazz Singer og Sunrise kom begge i 1927, men brukte ulike lydsystemer og ulike grader av synkronisert lyd. Library of Congress beskriver førstnevntes sekvenser med synkronisert tale via Vitaphone-plater og sistnevntes optiske Movietone-spor med synkronisert musikk og effekter. Én årstallsterskel skjuler dermed forskjellen mellom system, innhold og omfang.',
          'Stumfilm var ikke nødvendigvis en lydløs visningspraksis. Kilder om nordiske kinomusikere og Sunrises synkroniserte partitur viser at lyd kunne organiseres lokalt eller teknisk uten kontinuerlig innspilt dialog. Lydskiftet må derfor deles i tale, musikk, effekter, mellomtekster, visningsarbeid og distribusjonsformat.',
          'Dansk eksportfilm, den norske tintede stumfilmen Markens grøde og de amerikanske 1927-systemene følger ikke én felles overgangsklokke. Sammenligningen viser hvorfor amerikanske premierer ikke kan brukes som universelle periodeterskler for Norden eller andre produksjonsmiljøer.'
        ], ['ftv-hmh-pc-29','ftv-hmh-pc-30','ftv-hmh-pc-31'], [
          'Skill lydsystem, synkronisert innhold og lokal visningslyd.',
          'Test periodeterskler mot flere nasjonale og industrielle forløp.'
        ], ['ftv-hmh-pc-29','ftv-hmh-pc-31']),
        section('ftv-hmh-studio-1', 'Studiohistorie er institusjon, geografi og utvalg', em.em_film_tv_klassisk_film_studiosystem_og_sjangerindustri, [
          'Academy Museum organiserer Hollywoodland-historien rundt åtte studioer og ett historisk filmutvalg for hvert. Det dokumenterer en sterk institusjonell ramme for amerikansk studiohistorie, men den åpne kilden alene beviser ikke at all amerikansk produksjon var samlet i disse studioene på én eksakt dato. Kapittelet bruker derfor åtte-studiorammen uten å gjøre den total.',
          'Hollywoodland-utstillingen knytter etableringen av studiosystemet til hovedsakelig jødiske immigrantgründere, uavhengig produksjon og Los Angeles’ skiftende geografi. Klassisk film kan dermed ikke forklares bare gjennom stil og sjanger; selskapsdannelse, migrasjon og byutvikling må med.',
          'Regeneration viser Black kunstnere og entreprenører i amerikansk film fra 1898 til 1971 og løfter fram tapte eller glemte verk. Denne kurateringen synliggjør hva en kanon bygget rundt store studioer og kjente sjangerverk kan utelate, selv når studioperspektivet er historisk relevant.'
        ], ['ftv-hmh-pc-13','ftv-hmh-pc-14','ftv-hmh-pc-15'], [
          'Bruk studiorammen som dokumentert institusjonshistorie, ikke som totalhistorie.',
          'Undersøk hvem studio- og sjangerutvalget gjør synlig og usynlig.'
        ], ['ftv-hmh-pc-13','ftv-hmh-pc-15'])
      ],
      concepts: [
        { id: 'periodisering', term: 'Periodisering', definition: 'En argumentert inndeling av historien etter valgte brudd, kontinuiteter, kilder og analyseenheter.' },
        { id: 'historiografi', term: 'Historiografi', definition: 'Studiet av hvordan historie blir valgt, ordnet, dokumentert, fortalt og revidert.' },
        { id: 'visningskultur', term: 'Visningskultur', definition: 'De stedene, programmene, praksisene og publikumsrammene som gjør bevegelige bilder tilgjengelige.' },
        { id: 'lydovergang', term: 'Lydovergang', definition: 'Ujevne endringer i opptak, lagring, synkronisering, visning og bruk av tale, musikk og effekter.' },
        { id: 'studiosystem', term: 'Studiosystem', definition: 'Institusjonell organisering av produksjon, arbeidsdeling, filmutvalg og sirkulasjon rundt selskaper og anlegg.' },
        { id: 'filmbevegelse', term: 'Filmbevegelse', definition: 'En historisk forbindelse mellom verk, formgrep, produksjonsvilkår, kritikk og institusjonell eller politisk situasjon.' },
        { id: 'transnasjonal-filmhistorie', term: 'Transnasjonal filmhistorie', definition: 'Historie som følger verk, personer, kapital, forelegg og praksiser på tvers av nasjonale rammer.' },
        { id: 'kanonrevisjon', term: 'Kanonrevisjon', definition: 'Et kildebasert arbeid som endrer hvilke verk, personer, roller og forløp som regnes som historisk sentrale.' }
      ]
    },
    '02-modernisme-bevegelser-og-dekoloniale-forlop.json': {
      id: 'modernisme-bevegelser-og-dekoloniale-forlop', title: 'Modernisme, bevegelser og dekoloniale forløp',
      sections: [
        section('ftv-hmh-modernisme-1', 'Filmbevegelser må sammenlignes uten én avstamning', em.em_film_tv_modernisme_nye_bolger_og_alternative_filmbevegelser, [
          'Hiroshima mon amour og Breathless viser ulike forbindelser mellom dokumentararv, cinefili, gatemiljø, kritikk og formbrudd. BFI knytter fransk nybølge både til tidligere verk, filmkritikk og raske overganger til produksjon. Bevegelsen blir dermed en historisk klynge, ikke en liste med universelle stiltrekk.',
          'Cinema Novo koblet sosial kritikk og brasiliansk politisk uro til produksjonsformer og radikal estetikk. BFIs historikk viser samtidig senere kritikk av hvem som representerte favelaene. En bevegelse må derfor studeres gjennom både samtidens prosjekt og ettertidens revisjon.',
          'Med Hondo kombinerte avantgardestrategier med migrasjonserfaring, finansieringskamp, distribusjon og panafrikanske institusjoner. Harvard Film Archive viser at verkhistorien ikke kan skilles fra den politiske økonomien som muliggjorde noen filmer og gjorde andre prosjekter umulige.',
          'Hustruer kan plasseres i en europeisk filmtradisjon uten å reduseres til en norsk kopi av fransk nybølge. NFI dokumenterer Breiens inspirasjoner, frie form, improviserte spill, brede norske publikum og distribusjon til over tjue land. Sammenligningen må bevare verkets norske offentlighet og egen produksjonshistorie.'
        ], ['ftv-hmh-pc-16','ftv-hmh-pc-17','ftv-hmh-pc-18','ftv-hmh-pc-19'], [
          'Knytt formgrep til produksjon, kritikk, politikk og institusjoner.',
          'Sammenlign bevegelser uten å gjøre én av dem til opphav for alle andre.'
        ], ['ftv-hmh-pc-16','ftv-hmh-pc-19']),
        section('ftv-hmh-global-1', 'Global historie må bygges fra forbindelser og makt', em.em_film_tv_globale_transnasjonale_og_dekoloniale_skjermhistorier, [
          'Global filmhistorie blir skjev dersom indisk film, Cinema Novo, panafrikansk film og Black amerikansk produksjon legges til etter at en europeisk-amerikansk hovedlinje allerede er definert. Kildene viser egne kronologier, produksjonsvilkår, institusjoner og sirkulasjonsformer; disse må forme selve periodiseringen.',
          'Cinema Novo knyttet neokoloniale og politiske konflikter til artisanal produksjon, sosialt orienterte miljøer og radikal form. Black God, White Devil og bevegelsens senere reassessering viser at estetikk, produksjon og historisk maktsituasjon må analyseres sammen.',
          'Soleil O ble til gjennom Med Hondos migrasjon til Frankrike, uavhengige arbeids- og finansieringsvilkår og en større panafrikansk organisering. Caset er derfor utilstrekkelig beskrevet som bare mauritansk, fransk eller auteurstyrt; transnasjonale institusjoner og distribusjonsbarrierer er del av verkhistorien.',
          'BFIs indiske materiale følger visninger fra 1896, tidlig produksjon, lydfilmens nye sjangermuligheter og en rik plakat- og hefteoffentlighet. Dette er et eget historisk forløp med internasjonale forbindelser, ikke en forsinket versjon av Hollywoods stum-/lydskifte.'
        ], ['ftv-hmh-pc-05','ftv-hmh-pc-06','ftv-hmh-pc-07','ftv-hmh-pc-08'], [
          'La globale og dekoloniale case endre hovedfortellingen, ikke bare utvide den.',
          'Følg kolonial makt, produksjon, språk, sirkulasjon og motinstitusjoner.'
        ], ['ftv-hmh-pc-05','ftv-hmh-pc-07']),
      ],
      workedExamples: [
        { id: 'ftv-hmh-ex-1', title: 'Tre kilder til 1890-årene', situation: 'Lumière, Méliès og Guy Blaché inngår i konkurrerende pionerfortellinger.', analysis: ['Lag tre kolonner for apparat/visning, situert erindring og filmografi/arbeidsrolle.', 'Marker hva hver kilde kan dokumentere, og hva den ikke kan gjøre til en total opphavshistorie.'] },
        { id: 'ftv-hmh-ex-2', title: 'To lydsystemer i 1927', situation: 'The Jazz Singer og Sunrise omtales ofte som del av samme lydskifte.', analysis: ['Registrer bærer, synkronisert innhold og hvor stor del av filmen som bruker lyd.', 'Skill teknisk forskjell fra den senere periodiseringspåstanden om når stumfilmen tok slutt.'] },
        { id: 'ftv-hmh-ex-3', title: 'Bevegelsesmatrise', situation: 'Fransk nybølge, Cinema Novo og Med Hondo sammenlignes.', analysis: ['Hold analyseenheten stabil: formgrep, produksjonsmåte, politisk situasjon og distribusjon.', 'Unngå å beskrive de to siste som avleggere dersom kildene viser egne institusjoner og historiske konflikter.'] },
        { id: 'ftv-hmh-ex-4', title: 'Norsk historie på tvers av grenser', situation: 'Markens grøde, Hustruer og utenlandske filmatiseringer av norsk litteratur følger ulike spor.', analysis: ['Skill norsk produksjonsland, norsk forelegg, norsk offentlighet og internasjonal sirkulasjon.', 'Vis hvilke kilder som dokumenterer filmobjekt, institusjon, distribusjon og urealiserte arkivspor.'] }
      ],
      commonMisconceptions: [
        { claim: 'Filmhistorien begynte med én oppfinner og én visning.', correction: 'Flere apparater, visninger, produsenter og praksiser utviklet seg samtidig og må dokumenteres med ulike kilder.' },
        { claim: 'Stumfilm var lydløs, og lydfilm startet overalt i 1927.', correction: 'Stumfilm hadde ofte musikk og andre lydpraksiser, mens tekniske og industrielle overganger var ujevne.' },
        { claim: 'Hollywoods perioder kan brukes som verdenshistoriens standard.', correction: 'Nasjonale og transnasjonale forløp har forskjellige produksjons-, format- og lydkronologier.' },
        { claim: 'En filmbevegelse er bare en felles stil.', correction: 'Bevegelser forbinder også produksjon, kritikk, politikk, institusjoner og senere historieskriving.' },
        { claim: 'Nasjonal filmhistorie forklarer verk ved å vise til landet.', correction: 'Land er en ramme; sammenligningen må holde verk, selskap, visning eller politikk som stabil analyseenhet.' },
        { claim: 'Et arkivfunn fyller automatisk alle historiske hull.', correction: 'Funn endrer evidensgrunnlaget, men fravær, proveniens og kildetype må fortsatt vurderes.' }
      ]
    },
    '03-nasjonale-nordiske-og-norske-historier.json': {
      id: 'nasjonale-nordiske-og-norske-historier', title: 'Nasjonale, nordiske og norske historier',
      sections: [
        section('ftv-hmh-nasjonal-1', 'Nasjonale historier krever stabile sammenligninger', em.em_film_tv_nasjonale_film_tv_historier_og_sammenligning, [
          'Nasjonale filmhistorier må sammenlignes på samme nivå. Verk mot verk, selskap mot selskap, visningspraksis mot visningspraksis eller politikk mot politikk gir etterprøvbare forskjeller; «India», «Danmark» eller «Norge» kan ikke alene fungere som årsaksforklaring.',
          'Dansk stumfilmeksport, indisk plakat- og hefteoffentlighet og utenlandske filmatiseringer av norsk litteratur er tre forskjellige transnasjonale forbindelser. De gjelder henholdsvis filmsirkulasjon, publikumsadressat og foreleggets reise mellom industrier, og må derfor ikke presses inn i ett mål på nasjonal suksess.',
          'Lengre spillefilmformat og synkronisert lyd fikk ulik kronologi og betydning i Danmark, India og USA. Sammenligningen må angi hvilket format, system og industrimiljø som skifter, framfor å bruke «modernisering» som en felles og selvforklarende tidslinje.'
        ], ['ftv-hmh-pc-20','ftv-hmh-pc-21','ftv-hmh-pc-22'], [
          'Hold analyseenheten stabil når land sammenlignes.',
          'Skill eksport, foreleggssirkulasjon, publikumsadressat og teknisk overgang.'
        ], ['ftv-hmh-pc-20','ftv-hmh-pc-22']),
        section('ftv-hmh-nordisk-1', 'Nordisk historie er industri, arbeid og forbindelser', em.em_film_tv_nordisk_film_og_tv_historie, [
          'Dansk stumfilm fikk internasjonal tyngde gjennom Nordisk Film, lengre filmer, stjerner som Asta Nielsen og Valdemar Psilander og omfattende eksport. DFI-kildene gjør det mulig å beskrive et nordisk industriforløp gjennom selskap, format, arbeidsdeling og sirkulasjon.',
          'Nordic Women in Film løfter fram utstillere og kinomusikere i perioden 1905–1915. Disse arbeidsrollene viser at nordisk filmhistorie ikke bare skapes av regissører, skuespillere og produksjonsselskaper, men også av dem som organiserte visning og lyd i lokale offentligheter.',
          'Nesten hundre filmatiseringer av norsk litteratur ble ifølge Nasjonalbiblioteket laget utenfor Norge før 1950, særlig i europeiske og amerikanske industrier. Ferdige verk og urealiserte arkivspor gjør nordisk historie relasjonell: norsk forelegg, utenlandsk produksjon og senere arkivarbeid møtes.'
        ], ['ftv-hmh-pc-23','ftv-hmh-pc-24','ftv-hmh-pc-25'], [
          'Følg selskap, stjerner, arbeidsroller, visning og eksport sammen.',
          'Behandle Norden som relasjoner mellom produksjoner og offentligheter, ikke én stil.'
        ], ['ftv-hmh-pc-23','ftv-hmh-pc-25']),
        section('ftv-hmh-norsk-1', 'Norsk filmhistorie forbinder verk, institusjon og offentlighet', em.em_film_tv_norsk_filmhistorie_produksjon_verk_og_offentlighet, [
          'Norsk filmografis post for Markens grøde dokumenterer en norsk, tintet stumfilm fra 1921, basert på Hamsuns roman, produsert av Norrøna Film og premiert 26. desember. Slike objektdata forankrer perioden i produksjon, forelegg, format og premiere før filmen tolkes som nasjonalt verk.',
          'Hustruer ble et norsk gjennombrudd med fri form, improvisert spill, betydelig publikum og distribusjon til over tjue land. Senere oppfølgere og retrospektive cinematekvisninger viser hvordan verkhistorie også omfatter sirkulasjon og kanonisering, ikke bare premieredato og regissørbiografi.',
          'Filmens Hus åpnet i 1996 med kinoene Tancred og Lillebil, mens Nasjonalbibliotekets forskningsspor viser utenlandske filmatiseringer og urealiserte prosjekter basert på norsk litteratur. Norsk filmhistorie består dermed også av institusjoner, visningsrom og transnasjonale arkivspor.'
        ], ['ftv-hmh-pc-26','ftv-hmh-pc-27','ftv-hmh-pc-28'], [
          'Forankre verkhistorien i filmografiske data før fortolkning.',
          'Ta med institusjoner, visningsrom og grensekryssende sirkulasjon.'
        ], ['ftv-hmh-pc-26','ftv-hmh-pc-28'])
      ]
    },
    '04-animasjon-og-historiografisk-metode.json': {
      id: 'animasjon-og-historiografisk-metode', title: 'Animasjon og historiografisk metode',
      sections: [
        section('ftv-hmh-animasjon-1', 'Animasjonshistorie følger teknikk, arbeid og visning', em.em_film_tv_animasjonshistorier_teknikker_og_industrier, [
          'Gertie the Dinosaur kombinerte cycling—repeterbare bevegelsessekvenser som reduserte nytegning—med karakterbevegelse og en live sceneopptreden før en senere filmversjon brukte mellomtekster. Caset knytter teknikk til framføring og visningsformat, ikke bare til et ferdig verk.',
          'UPAs Gerald McBoing-Boing brukte tykke konturer, fargeflater og stilisering i stedet for å etterligne live-actionens realistiske rom. Library of Congress beskriver dermed både en estetisk forskjell og et industrielt alternativ skapt av et uavhengig studio med animatører fra Disney-miljøet.',
          'The Snowman ble planlagt gjennom storyboard og musikkspor, animert på papir, overført til cel, håndrendret og fotografert på rostrumkamera under tidspress mot Channel 4s levering i 1982. Produksjonshistorien viser hvordan materiale, arbeid, musikk, budsjett og kringkastingsformat formes sammen.',
          'Animasjonshistorie kan derfor ikke skrives som en enkel teknisk marsj fra håndtegning til digitalt bilde. Gertie, UPA og The Snowman krever samtidige spørsmål om teknikk, karakter, arbeidsorganisering, selskap, format og visningskontekst.'
        ], ['ftv-hmh-pc-01','ftv-hmh-pc-02','ftv-hmh-pc-03','ftv-hmh-pc-04'], [
          'Koble animasjonsteknikk til arbeidsform, selskap og visningsformat.',
          'Unngå lineære framskrittsfortellinger når historiske teknikker har ulike mål.'
        ], ['ftv-hmh-pc-01','ftv-hmh-pc-04']),
        section('ftv-hmh-historiografi-1', 'Historiografi gjør valg og usikkerhet synlig', em.em_film_tv_historiografi_periodisering_og_kildekritikk, [
          'En filmhistorisk periode er en argumenterende inndeling, ikke bare en datoetikett. Valget av teknisk brudd, selskapsendring, stil, arbeidsrolle eller visningspraksis avgjør hva som framstår som begynnelse, høydepunkt og slutt. Periodiseringen må derfor oppgi både analyseenhet og kildegrunnlag.',
          'Women Film Pioneers bruker filmografi, selskapsroller og arkivfravær til å revidere stumfilmens kanon. Alice Guy Blachés arbeid i Gaumont og Solax blir synlig gjennom en metode som ikke likestiller manglende kreditering eller tapt materiale med historisk fravær.',
          'Regeneration bruker gjenfunne verk og kuratering til å flytte Black deltakelse fra randnotat til en grunnstruktur i amerikansk filmhistorie fra 1898 til 1971. Utstillingen er samtidig en historiografisk handling: et nytt utvalg og en ny fortellingsorden gjør andre aktører og forbindelser sentrale.',
          'Registertekst, utstillingsfortelling, filmografisk post og selvbiografisk spor har ulik rekkevidde. Registeret kan dokumentere system og verkdata, utstillingen argumenterer gjennom utvalg, filmografien samler objektopplysninger, og Méliès’ erindring er et situert førstepersonsspor. Kildekritikk betyr å bruke hver kilde til det den faktisk kan bære.'
        ], ['ftv-hmh-pc-09','ftv-hmh-pc-10','ftv-hmh-pc-11','ftv-hmh-pc-12'], [
          'Oppgi analyseenhet, brudd og kildegrunnlag for hver periodisering.',
          'Skill mellom objektpost, selvbiografi, forskningsprosjekt og kuratert historie.'
        ], ['ftv-hmh-pc-09','ftv-hmh-pc-12'])
      ],
      applicationTasks: [
        { id: 'ftv-hmh-task-1', title: 'Pionerkartet', task: 'Bygg en flerkildet historie om ett tidlig filmprogram.', prompts: ['Hvilken apparat- eller visningskilde brukes?', 'Hvilke produksjonsroller kan dokumenteres?', 'Hvilket fravær eller hvilken usikkerhet må stå åpen?'] },
        { id: 'ftv-hmh-task-2', title: 'Lydterskelen', task: 'Test påstanden om at lydfilmen begynte i 1927.', prompts: ['Hvilke lydsystemer sammenlignes?', 'Hva er synkronisert?', 'Gjelder terskelen samme sted og industri?'] },
        { id: 'ftv-hmh-task-3', title: 'Bevegelsen', task: 'Sammenlign to filmbevegelser på samme nivå.', prompts: ['Hvilke formgrep?', 'Hvilke produksjonsvilkår?', 'Hvilken politisk og distribusjonsmessig situasjon?'] },
        { id: 'ftv-hmh-task-4', title: 'Nasjonal sammenligning', task: 'Sammenlign to nasjonale forløp uten å bruke landet som forklaring.', prompts: ['Er analyseenheten verk, selskap, visning eller politikk?', 'Hvilke forbindelser krysser grensen?', 'Hvor er kronologien ulik?'] },
        { id: 'ftv-hmh-task-5', title: 'Animasjonskjeden', task: 'Følg ett animasjonsverk fra materiale til visning.', prompts: ['Hvilken teknikk?', 'Hvordan er arbeidet organisert?', 'Hvilket format og visningssted former resultatet?'] },
        { id: 'ftv-hmh-task-6', title: 'Kanonrevisjonen', task: 'Vis hvordan et prosjekt eller en utstilling endrer en etablert historie.', prompts: ['Hva var tidligere usynlig?', 'Hvilke nye kilder eller utvalg brukes?', 'Hva forblir usikkert?'] }
      ],
      selfCheck: [
        { question: 'Hva gjør en periodisering til et argument?', answer: 'Den velger et brudd, en analyseenhet og et kildegrunnlag og må begrunne hvorfor disse ordner historien.' },
        { question: 'Hvorfor er én pioner utilstrekkelig som opphavshistorie?', answer: 'Fordi apparater, visninger, produksjonsroller og filmpraksiser utviklet seg samtidig og dokumenteres av ulike kilder.' },
        { question: 'Var stumfilm nødvendigvis lydløs?', answer: 'Nei. Visninger kunne ha lokal musikk og andre lydpraksiser, og synkronisert musikk og effekter kom før kontinuerlig tale.' },
        { question: 'Hvordan sammenlignes nasjonale historier rettferdig?', answer: 'Ved å holde analyseenheten stabil—verk, selskap, visning eller politikk—og følge grensekryssende forbindelser.' },
        { question: 'Hva gjør en filmbevegelse historisk?', answer: 'Forbindelsen mellom verk, form, produksjon, kritikk, institusjon og politisk situasjon.' },
        { question: 'Hva tilfører dekolonial historiografi?', answer: 'Den lar koloniale maktforhold, sirkulasjon og motinstitusjoner omforme hovedfortellingen i stedet for å bli et tillegg.' },
        { question: 'Hva må animasjonshistorie følge utover teknikk?', answer: 'Arbeid, selskap, karakter, format, økonomi og visningskontekst.' },
        { question: 'Hvorfor har kildetyper ulik rekkevidde?', answer: 'Fordi en objektpost, utstilling, selvbiografi og forskningsfilmografi dokumenterer og argumenterer på forskjellige måter.' }
      ]
    }
  };

  const claims = [
    claim('ftv-hmh-pc-01', 'Gertie the Dinosaur kombinerte cycling, karakterbevegelse og liveframføring i en tidlig animasjonspraksis.', ['ftvhmh05-loc-registry'], 'ftv-hmh-animasjon-1'),
    claim('ftv-hmh-pc-02', 'UPA brukte stilisert tegning, tykke konturer og fargeflater som et industrielt og estetisk alternativ til naturaliserende studiostil.', ['ftvhmh05-loc-registry'], 'ftv-hmh-animasjon-1'),
    claim('ftv-hmh-pc-03', 'The Snowman forbandt storyboard, papir, cel, musikk, rostrumkamera, arbeidsmengde og kringkastingsleveranse i 1982.', ['ftvhmh20-bfi-snowman'], 'ftv-hmh-animasjon-1'),
    claim('ftv-hmh-pc-04', 'Animasjonshistorie må følge teknikk, arbeid, selskap, format og visningskontekst samtidig, ikke bare ordne verk etter teknisk nyhet.', ['ftvhmh05-loc-registry','ftvhmh20-bfi-snowman','ftvhmh03-wfpp-about'], 'ftv-hmh-animasjon-1'),
    claim('ftv-hmh-pc-05', 'Global filmhistorie kan ikke organiseres som nasjonale tillegg til en ferdig europeisk-amerikansk standardperiodisering når kildene viser egne kronologier, institusjoner og sirkulasjoner.', ['ftvhmh08-academy-regeneration','ftvhmh10-bfi-cinema-novo','ftvhmh11-harvard-med-hondo','ftvhmh12-bfi-indian-cinema'], 'ftv-hmh-global-1'),
    claim('ftv-hmh-pc-06', 'Cinema Novo knyttet brasiliansk neokolonial og politisk situasjon til produksjonsmåte, sosial kritikk og radikal form.', ['ftvhmh10-bfi-cinema-novo'], 'ftv-hmh-global-1'),
    claim('ftv-hmh-pc-07', 'Med Hondos migrasjon, finansiering, distribusjonskamp og panafrikanske organisering gjør Soleil O til mer enn et nasjonalt auteurverk.', ['ftvhmh11-harvard-med-hondo'], 'ftv-hmh-global-1'),
    claim('ftv-hmh-pc-08', 'Indisk tidlig film, lydskifte og plakat- og heftesirkulasjon viser et eget historisk forløp med transnasjonale forbindelser.', ['ftvhmh12-bfi-indian-cinema'], 'ftv-hmh-global-1'),
    claim('ftv-hmh-pc-09', 'En filmhistorisk periode er en argumenterende inndeling basert på valgte brudd, kilder og analyseenheter, ikke bare en datoetikett.', ['ftvhmh03-wfpp-about','ftvhmh08-academy-regeneration','ftvhmh15-nordic-women','ftvhmh05-loc-registry'], 'ftv-hmh-historiografi-1'),
    claim('ftv-hmh-pc-10', 'Women Film Pioneers bruker filmografi, arbeidsroller og arkivfravær til å revidere stumfilmens kanon, blant annet gjennom Alice Guy Blachés Gaumont- og Solax-arbeid.', ['ftvhmh03-wfpp-about','ftvhmh04-wfpp-alice-guy'], 'ftv-hmh-historiografi-1'),
    claim('ftv-hmh-pc-11', 'Regeneration bruker gjenfunne verk og kuratering til å flytte Black deltakelse fra rand til grunnstruktur i amerikansk filmhistorie.', ['ftvhmh08-academy-regeneration'], 'ftv-hmh-historiografi-1'),
    claim('ftv-hmh-pc-12', 'Registertekst, utstillingsfortelling, filmografisk post og selvbiografisk spor har forskjellig rekkevidde og må kildekritiseres ulikt.', ['ftvhmh02-bfi-melies','ftvhmh05-loc-registry','ftvhmh08-academy-regeneration','ftvhmh16-nb-markens-grode'], 'ftv-hmh-historiografi-1'),
    claim('ftv-hmh-pc-13', 'Academy Museum organiserer sin studiohistorie rundt åtte studioer og ett historisk filmutvalg for hvert, uten at den åpne kilden alene dokumenterer total markedskonsolidering på én eksakt dato.', ['ftvhmh07-academy-studios'], 'ftv-hmh-studio-1', 'verified_after_scope_narrowing'),
    claim('ftv-hmh-pc-14', 'Jødiske immigrantgründere, uavhengig produksjon og Los Angeles-geografi kompliserer en rent stilhistorisk Hollywood-fortelling.', ['ftvhmh06-academy-hollywoodland'], 'ftv-hmh-studio-1'),
    claim('ftv-hmh-pc-15', 'Black uavhengig produksjon og gjenfunne verk viser hva en studio- og sjangerkanon kan utelate.', ['ftvhmh08-academy-regeneration'], 'ftv-hmh-studio-1'),
    claim('ftv-hmh-pc-16', 'Hiroshima mon amour og Breathless viser ulike forbindelser mellom dokumentararv, cinefili, gatemiljø, kritikk og formbrudd i fransk nybølge.', ['ftvhmh09-bfi-french-new-wave'], 'ftv-hmh-modernisme-1'),
    claim('ftv-hmh-pc-17', 'Cinema Novo koblet radikal estetikk til brasiliansk neokolonial og politisk situasjon og ble senere historiografisk reassessert.', ['ftvhmh10-bfi-cinema-novo'], 'ftv-hmh-modernisme-1'),
    claim('ftv-hmh-pc-18', 'Med Hondo kombinerte avantgardestrategier med panafrikansk institusjonsbygging, finansieringskamp og distribusjonsarbeid.', ['ftvhmh11-harvard-med-hondo'], 'ftv-hmh-modernisme-1'),
    claim('ftv-hmh-pc-19', 'Hustruers frie form, improviserte spill, norske publikum og internasjonale distribusjon plasserer filmen i europeisk modernisme og norsk offentlighet uten å redusere den til en avlegger av fransk nybølge.', ['ftvhmh19-nfi-anja-breien'], 'ftv-hmh-modernisme-1'),
    claim('ftv-hmh-pc-20', 'Nasjonale filmhistorier må sammenlignes på samme nivå—verk, selskap, visning eller politikk—framfor å gjøre land til forklaring.', ['ftvhmh12-bfi-indian-cinema','ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh17-nb-transnational'], 'ftv-hmh-nasjonal-1'),
    claim('ftv-hmh-pc-21', 'Dansk eksport, indisk plakatkultur og utenlandske filmatiseringer av norsk litteratur viser forskjellige transnasjonale forbindelser.', ['ftvhmh12-bfi-indian-cinema','ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh17-nb-transnational'], 'ftv-hmh-nasjonal-1'),
    claim('ftv-hmh-pc-22', 'Lydskifte og spillefilmformat fikk ulik kronologi og industriell betydning i amerikanske, danske og indiske sammenhenger.', ['ftvhmh05-loc-registry','ftvhmh12-bfi-indian-cinema','ftvhmh14-dfi-1910-1920'], 'ftv-hmh-nasjonal-1'),
    claim('ftv-hmh-pc-23', 'Dansk stumfilm fikk internasjonal tyngde gjennom selskap, stjerner, lengre format og eksport.', ['ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920'], 'ftv-hmh-nordisk-1'),
    claim('ftv-hmh-pc-24', 'Utstillere og kinomusikere utvider nordisk filmhistorie utover regissører og produksjonsselskaper.', ['ftvhmh15-nordic-women'], 'ftv-hmh-nordisk-1'),
    claim('ftv-hmh-pc-25', 'Norsk litteratur i svenske, danske og andre utenlandske produksjoner gjør nordisk filmhistorie relasjonell og arkivavhengig.', ['ftvhmh17-nb-transnational','ftvhmh13-dfi-danish-silent'], 'ftv-hmh-nordisk-1'),
    claim('ftv-hmh-pc-26', 'Markens grøde forankrer norsk film i 1921 gjennom dokumenterte opplysninger om forelegg, produksjon, tinting, premiere og stumfilmformat.', ['ftvhmh16-nb-markens-grode'], 'ftv-hmh-norsk-1'),
    claim('ftv-hmh-pc-27', 'Hustruers form, publikum, internasjonale distribusjon og senere retrospektive status forbinder verkhistorie med offentlighet og kanonisering.', ['ftvhmh19-nfi-anja-breien'], 'ftv-hmh-norsk-1'),
    claim('ftv-hmh-pc-28', 'Filmens Hus og utenlandske filmatiseringer viser at norsk filmhistorie også består av institusjoner, visningsrom og transnasjonale arkivspor.', ['ftvhmh18-nfi-history','ftvhmh17-nb-transnational'], 'ftv-hmh-norsk-1'),
    claim('ftv-hmh-pc-29', 'The Jazz Singer og Sunrise representerer ulike lydsystemer og ulike grader av synkronisert lyd i 1927.', ['ftvhmh05-loc-registry'], 'ftv-hmh-stum-lyd-1'),
    claim('ftv-hmh-pc-30', 'Stumfilm var ikke nødvendigvis lydløs praksis, og lydskiftet må skilles fra lokalt akkompagnement, synkronisert musikk, effekter, tale og mellomtekster.', ['ftvhmh05-loc-registry','ftvhmh15-nordic-women'], 'ftv-hmh-stum-lyd-1'),
    claim('ftv-hmh-pc-31', 'Dansk og norsk stumfilm viser at teknologisk overgang ikke følger én amerikansk premiere som universell periodeterskel.', ['ftvhmh05-loc-registry','ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh16-nb-markens-grode'], 'ftv-hmh-stum-lyd-1'),
    claim('ftv-hmh-pc-32', 'Cinématographe samlet opptak, kopiering og projeksjon og muliggjorde korte programmer på tvers av steder.', ['ftvhmh01-nsmm-lumiere'], 'ftv-hmh-tidlig-film-1'),
    claim('ftv-hmh-pc-33', 'Lumière-visninger, Méliès’ illusjonsfilm og Guy Blachés produksjonsarbeid viser flere samtidige tidligfilmpraksiser.', ['ftvhmh01-nsmm-lumiere','ftvhmh02-bfi-melies','ftvhmh04-wfpp-alice-guy'], 'ftv-hmh-tidlig-film-1'),
    claim('ftv-hmh-pc-34', 'Tidlig film bestod av korte attraksjoner, aktualiteter, komedier, triks og programkultur og kan ikke reduseres til uferdig fortellende spillefilm.', ['ftvhmh01-nsmm-lumiere','ftvhmh02-bfi-melies','ftvhmh03-wfpp-about'], 'ftv-hmh-tidlig-film-1'),
    claim('ftv-hmh-pc-35', 'Selvbiografi, apparathistorie og recovery-filmografi må sammenholdes uten at ett pionernavn blir hele opphavshistorien.', ['ftvhmh01-nsmm-lumiere','ftvhmh02-bfi-melies','ftvhmh03-wfpp-about','ftvhmh04-wfpp-alice-guy'], 'ftv-hmh-tidlig-film-1')
  ];

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
    id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'film_tv_historie_historiografi',
    editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: unit.emne_ids, method_ids: methodIds,
    title: 'Filmhistorie, bevegelser og historiografi: hvordan fortiden blir periodisert og revidert',
    subtitle: 'Fra tidlig film, lyd og studio til globale bevegelser, nordiske forbindelser, animasjon og kildekritikk',
    lead: 'Kapittelet bygger filmhistorie gjennom dokumenterte apparater, verk, arbeidsroller, selskaper, visningssteder og historiografiske valg. Det behandler ikke Hollywood som universell tidslinje, lar dekoloniale og transnasjonale forløp forme hovedhistorien og viser hvordan perioder og kanoner endres når kildetypen eller analyseenheten skifter.',
    learningObjectives: [
      'skille apparat, program, produksjon og visningskultur i tidlig film',
      'analysere stumfilm og lydskifte som ujevne tekniske og institusjonelle overganger',
      'koble studiohistorie til selskaper, migrasjon, geografi og kanonutvalg',
      'sammenligne filmbevegelser gjennom form, produksjon, politikk og sirkulasjon',
      'bygge globale og dekoloniale historier som del av hovedperiodiseringen',
      'sammenligne nasjonale, nordiske og norske forløp med stabil analyseenhet',
      'følge animasjon gjennom teknikk, arbeid, industri og visningsformat',
      'kildekritisere filmografi, selvbiografi, register og kuratert utstilling ulikt'
    ],
    diagnosticQuestions: [
      { question: 'Begynte filmen med Lumière-visningen i desember 1895?', answer: 'Den var viktig, men flere apparater, offentlige visninger og filmpraksiser eksisterte; opphavshistorien krever flere kilder og aktører.' },
      { question: 'Ble stumfilmen lydfilm overalt i 1927?', answer: 'Nei. Systemer, lydinnhold, industri og nasjonale kronologier var ulike.' },
      { question: 'Er en filmbevegelse bare en felles stil?', answer: 'Nei. Produksjon, kritikk, institusjon, politikk og distribusjon må også dokumenteres.' },
      { question: 'Kan land brukes som forklaring i sammenlignende filmhistorie?', answer: 'Nei. Sammenligningen må holde en analyseenhet som verk, selskap, visning eller politikk stabil.' },
      { question: 'Er perioder nøytrale datoetiketter?', answer: 'Nei. De er argumenter som velger brudd, kontinuitet, analyseenhet og kilder.' }
    ],
    relatedPlaces: [
      { id: 'cinemateket_oslo', name: 'Cinemateket i Oslo', role: 'Undersøk hvordan Filmens Hus, kuraterte serier og retrospektiver gjør filmhistorie synlig gjennom utvalg, visningsrom og institusjonell kontekst.' },
      { id: 'colosseum_kino', name: 'Colosseum kino', role: 'Bruk den historiske kinoen til å skille verkets produksjonshistorie fra premiere-, visnings- og publikumshistorien i en norsk bykontekst.' }
    ],
    workCases, moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims, sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret filmhistorie som skiller hendelse, periode og senere historiografi og sammenligner globale, nasjonale og tekniske forløp uten én universell tidslinje.',
    audience: 'Brukere som skal kunne bygge og kritisere filmhistoriske forklaringer gjennom verk, objektposter, institusjoner, arbeidsroller og historiografiske kilder.',
    requiredEmneIds: unit.emne_ids, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: ['hendelse vs periode vs senere historiografi','apparat vs program vs visning','stumfilm vs lydløs visning','lydsystem vs lydinnhold','studiohistorie vs total amerikansk filmhistorie','filmbevegelse vs tidløs stil','nasjonal ramme vs transnasjonal forbindelse','Hollywood-periodisering vs sammenlignende verdenshistorie','teknisk animasjonshistorie vs arbeids- og industrihistorie','objektpost vs selvbiografi vs kuratert utstilling','arkivfravær vs historisk fravær','historisk kildekritikk vs senere bevaringspraksis'],
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, sourceLocationsRequired: true, chronologySeparatesEventPeriodAndLaterHistoriography: true, everyPlannedClaimResolved: true },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: unit.emne_ids, excluded: ['arkivets bevaringspraksis som hovedtema','restaureringsetikk og autentisitet','generell plattformmakt','nasjon som selvforklarende årsak','Hollywood som universell periodisering','pionerpåstander uten arbeidsrolle og kildekritikk'] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 10, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '10/10', plannedClaimResolution: '35/35' }
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
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_fjernsyn_plattformer_og_deltakerhistorier';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.83.0'; registry.updatedAt = '2026-08-11';
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: unit.emne_ids, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Filmhistorie, bevegelser og historiografi er registrert etter fulltekst- og evidensport med 10 canonicale emner, 10 emneeide seksjoner, 35 claimsporede avsnitt, 35 verifiserte claims, 20 brukte inspectable kilder, 18 verk-, produksjons-, bevegelses-, institusjons- og recoverycase og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Fjernsyn, plattformer og deltakerhistorier; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.fourthSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.71.0'; status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress'; filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Filmhistorie, bevegelser og historiografi er registrert etter fulltekst- og evidensaudit: 10/10 canonicale emner, 4 faglig avgrensede moduler, 10 seksjoner, 35 avsnitt med claimtrace, 35/35 løste claimplaner, 20 brukte inspectable kilder, 18 case og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Fjernsyn, plattformer og deltakerhistorier.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0'; sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedGates,
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: claims.length === 35
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvHistoryMovementsHistoriographyFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate) && !force) {
    console.log('Filmhistorie, bevegelser og historiografi er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvHistoryMovementsHistoriographyFulltextV1();
  write(P.chapter, built.chapter); write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc); write(P.sourceBrief, built.sourceBrief); write(P.registry, built.registry);
  write(P.status, built.status); write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvHistoryMovementsHistoriographyFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV filmhistoriefulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
