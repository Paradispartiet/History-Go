#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'serialitet-format-og-adaptasjon';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'seriality_format_adaptation_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const LATER_FULLTEXT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const TELEVISION_SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const TELEVISION_FULLTEXT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_seriality_format_adaptation_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-seriality-format-adaptation-source-brief-v1-audit.json'
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
  plan_resolution: resolution, evidence_mode: 'source_fact_plus_bounded_comparative_analysis', used_in: [sectionId]
});

export function buildFilmTvSerialityFormatAdaptationFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Serialitet, format og adaptasjon');
  const emneIds = unit.emne_ids;
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.year ?? row.years, medium: row.medium,
    role: row.purpose, source_ids: row.source_ids
  }));

  const modules = {
    '01-episode-serie-og-sesong.json': {
      id: 'episode-serie-og-sesong', title: 'Episode, serie og sesong',
      sections: [
        section('ftv-sfa-serialitet-1', 'Serialitet kombinerer gjentakelse og endring', emneIds[6], [
          'Serialitet oppstår når avgrensede deler både gjentar noe gjenkjennelig og tilfører endring. Bologna-tidsskriftet Series viser hvordan semiserielle TV-verk lar enkelte episoder stå på egne ben samtidig som langsiktige buer føres videre. Analysen må derfor registrere hva som vender tilbake—rollefigurer, oppgaver, rom eller formel—og hva som faktisk endres mellom delene.',
          'Serie, serial, føljetong og episodeformat er ikke synonymer. Maigret-studien beskriver tidlig italiensk TV som en hybrid mellom litterær adaptasjon, teatralsk iscenesettelse, avsnittsstruktur og tilbakevendende figurer; Flash Gordon er derimot en tretten episoders kinoføljetong. Begrepene må knyttes til konkret lokal lukning, avsnittsinndeling og videreføring.',
          'Flash Gordon Serial, Doctor Who: The Invasion og The Prisoner representerer ulike historiske løsninger. Det første adapterer en tegneserie til tretten kinoepisoder, Doctor Who stanser handling ved en episodegrense, mens The Prisoner gjentar konflikten om Number Six gjennom 17 episoder før serien ender. Forskjellen ligger i hvordan del, grense og langt premiss organiseres.'
        ], ['ftv-sfa-pc-19', 'ftv-sfa-pc-20', 'ftv-sfa-pc-21'], [
          'Kartlegg både det som gjentas og det som endres mellom delene.',
          'Navngi nivået presist: episode, avsnitt, serial, sesong eller hel serie.'
        ], ['ftv-sfa-pc-19', 'ftv-sfa-pc-20']),
        section('ftv-sfa-episodisk-1', 'Episoden kan lukke lokalt og føre serien videre', emneIds[3], [
          'En episode kan gjenta et kjent oppsett og samtidig endre relasjoner eller en langsiktig bue. Maigret-caset viser en tidlig hybrid med avsnittsfortelling og tilbakevendende figurer, mens Series beskriver semiserielle verk som forhandler mellom selvstendige episoder og fler-episodiske forløp. Lokal gjenkjennelighet og seriell endring kan dermed virke samtidig.',
          'Episodisk og seriell dramaturgi bør behandles som kombinasjoner, ikke et absolutt enten–eller. En analyse kan spørre om dagens problem får en avslutning, om rollefigurtilstanden endres, og hvilke ubesvarte spørsmål som bæres over grensen. Først da blir det mulig å beskrive graden av lokal lukning og videreføring.',
          'Doctor Who: The Invasion bygger lokal fare fram mot en synlig cliffhanger ved episodegrensen. The Prisoner gjentar i stedet et langsiktig premiss—landsbyens forsøk på å bryte Number Six—gjennom varierende episoder. Begge fører noe videre, men den ene kilden dokumenterer en konkret utsatt faresituasjon, den andre et vedvarende serieproblem.'
        ], ['ftv-sfa-pc-10', 'ftv-sfa-pc-11', 'ftv-sfa-pc-12'], [
          'Skill episodens lokale oppgave fra endringen i seriens lengre forløp.',
          'Beskriv graden av lukning og videreføring i stedet for å velge én ren type.'
        ], ['ftv-sfa-pc-10', 'ftv-sfa-pc-11']),
        section('ftv-sfa-sesong-1', 'Sesongen er et mellomnivå, ikke hele serien', emneIds[7], [
          'En sesongbue er et mellomnivå mellom enkeltdelen og hele serien. Series viser at langsiktige buer kan utvikles gjennom episoder og sesonger samtidig som episoder beholder lokale oppgaver. Et sesongkart bør derfor skille episodeutfall, endringer som samles innen sesongen, og spørsmål som fortsatt bæres videre.',
          'Strukturen formes også av produksjonshistorie. Doctor Who-studien knytter tidlige skift i rollefigurenes handlekraft til rask produksjonsomløp og bransjepress, mens BFI dokumenterer at The Prisoner endte prematurt etter 17 episoder. Det er sikrere enn å lese alle ujevnheter som planlagt fortellingsdesign eller å hevde et udokumentert bestemt sesongoppsett.'
        ], ['ftv-sfa-pc-22', 'ftv-sfa-pc-23'], [
          'Skill episodebue, sesongbue og seriehelhet i hvert kart.',
          'Bruk produksjonskilder når omfang eller forløp forklares historisk.'
        ], ['ftv-sfa-pc-22', 'ftv-sfa-pc-23']),
        section('ftv-sfa-cliffhanger-1', 'Cliffhanger er en strategisk stans ved en grense', emneIds[1], [
          'En cliffhanger er ikke bare høyt tempo eller spenning. Den organiserer en stans i handling eller informasjon ved en publiseringsgrense: et utfall, en identitet eller neste handling holdes tilbake. Analysen bør navngi hva som stanser, hvor grensen ligger, og hvilken type svar den neste delen kan gi.',
          'BFI viser en konkret Cyberman-avsløring like før episodegrensen i Doctor Who: The Invasion. The Prisoners finale Fall Out er derimot del av en serie som endte prematurt og lot sentrale gåter stå åpne. Det første er et utsatt lokalt svar; det andre er avsluttende ulukkethet. Begge skaper mangel på informasjon, men på forskjellige nivåer.'
        ], ['ftv-sfa-pc-05', 'ftv-sfa-pc-06'], [
          'Navngi den konkrete handlingen eller kunnskapen som holdes tilbake.',
          'Skill episodecliffhanger fra en hel series ulukkede avslutning.'
        ], ['ftv-sfa-pc-05', 'ftv-sfa-pc-06'])
      ],
      concepts: [
        { id: 'serialitet', term: 'Serialitet', definition: 'Organisering der avgrensede deler gjentar gjenkjennelige mønstre og samtidig endrer et forløp, en relasjon eller en verden.' },
        { id: 'episodebue', term: 'Episodebue', definition: 'Det lokale problemet, utviklingsforløpet og graden av lukning innen én episode eller del.' },
        { id: 'sesongbue', term: 'Sesongbue', definition: 'Et mellomnivå som samler endringer over flere episoder uten å være identisk med hele serien.' },
        { id: 'cliffhanger', term: 'Cliffhanger', definition: 'En organisert stans i handling eller informasjon ved en publiseringsgrense.' },
        { id: 'formatlogikk', term: 'Formatlogikk', definition: 'Repeterbare regler, roller, runder og tidsgrenser som kan fylles med nytt innhold.' },
        { id: 'transmedial-fortelling', term: 'Transmedial fortelling', definition: 'Koordinert fortelling der flere medier yter forskjellige bidrag til et felles univers.' },
        { id: 'adaptasjon', term: 'Adaptasjon', definition: 'En ny mediert framstilling som omorganiserer et forelegg gjennom egne tids-, rom-, figur- og formvalg.' },
        { id: 'sjangerrevisjon', term: 'Sjangerrevisjon', definition: 'Historisk aktivering og omforming av gjenkjennelige sjangerspor, regler eller forventninger.' }
      ]
    },
    '02-repeterbare-tv-formater.json': {
      id: 'repeterbare-tv-formater', title: 'Repeterbare TV-formater',
      sections: [
        section('ftv-sfa-format-1', 'Formatet er stabilt selv når innhold og utfall varierer', emneIds[2], [
          'Formatlogikk består av repeterbare regler, roller, runder og tidsgrenser. Jeopardy! har ifølge Television Academy beholdt tre deltakere, tre runder, tre Daily Doubles og Final Jeopardy innen omtrent tretti minutter. The Price Is Right kombinerer fire publikumsrekrutterte deltakere, seks daglige spill og et større repertoar. Formatet er mønsteret som kan gjentas; dagens personer, spørsmål og utfall er innholdet som skifter.',
          'Jeopardy! viser hvordan variasjon kan oppstå innen en stabil sekvens. Deltakere, kategorier, spørsmål, summer og resultater endres, mens rekkefølgen av runder og sentrale funksjoner nesten ikke har endret seg siden 1964. Formatanalyse bør derfor sammenligne minst to sendinger og markere både faste ledd og reell variasjon.',
          'The Price Is Right bygger lokal dramatisk progresjon gjennom ulike spill, programlederens forklaring av neste steg og samspillet med deltakere og studiopublikum. Kilden beskriver dette som dramaliknende oppbygning. Caset dokumenterer et studiobasert konkurranseformat, men gir ikke grunnlag for å kalle hver utgave direktesendt.'
        ], ['ftv-sfa-pc-07', 'ftv-sfa-pc-08', 'ftv-sfa-pc-09'], [
          'Skill formatets repeterbare struktur fra én konkret sendings innhold.',
          'Ikke utled direktesending eller publikumsvirkning uten særskilt evidens.'
        ], ['ftv-sfa-pc-07', 'ftv-sfa-pc-09']),
        section('ftv-sfa-sitcom-1', 'Sitcom er en familie av komiske serieformer', emneIds[8], [
          'Sitcom organiserer ofte humor gjennom tilbakevendende rollefigurer, situasjoner og rom, mens en lokal forstyrrelse bygges og bearbeides i episoden. Series-forskningen minner samtidig om at episodisk form kan kombineres med langsiktig endring. Derfor bør sitcomanalyse følge komisk mekanisme, ensemble og episodisk konsekvens, ikke bare telle latter eller gjenkjenne en fast dekor.',
          'Television Academys intervjuer dokumenterer I Love Lucys tilbakevendende ensemble, episodeforfatterskap, studiopublikum og senere overgang til timeformat. The Guest Book bruker et fast sted og musikalske forbindelser, men skifter hovedfigurer og sjangertone som antologi. De viser at fast ensemble, fast sted, lokal avslutning og seriell videreføring kan kombineres på flere måter.'
        ], ['ftv-sfa-pc-24', 'ftv-sfa-pc-25'], [
          'Knytt humoren til konkret situasjon, rollefigurer og episodeorganisering.',
          'Behandle fast ensemble og fast sted som mulige trekk, ikke universelle krav.'
        ], ['ftv-sfa-pc-24', 'ftv-sfa-pc-25'])
      ],
      workedExamples: [
        { id: 'ftv-sfa-ex-1', title: 'Tre nivåer i The Invasion', situation: 'En episodegrense inngår i en lengre Doctor Who-serial.', analysis: ['Beskriv først den lokale faresituasjonen og nøyaktig hva cliffhangeren holder tilbake.', 'Kartlegg deretter hva som løses i neste episode, hva som fortsetter gjennom serialen, og hva som tilhører Doctor Who-universet som helhet.'] },
        { id: 'ftv-sfa-ex-2', title: 'Formatmatrise for Jeopardy!', situation: 'Regler og runder gjentas mens deltakerne og spørsmålene skifter.', analysis: ['Lag én kolonne for stabile roller, runder og tidsgrenser og én for variabelt innhold.', 'Sammenlign to sendinger og begrunn hvilke forskjeller formatet tillater uten å bli et annet format.'] },
        { id: 'ftv-sfa-ex-3', title: 'Versjonskart for Body Snatchers', situation: 'Fire filmatiseringer omarbeider samme grunnidé i ulike historiske situasjoner.', analysis: ['Registrer sted, hovedfigur, trussel, synsvinkel og avslutning for hver versjon.', 'Skill dokumenterte endringer fra tolkningen av hvilken samtidshistorisk bekymring de organiserer.'] },
        { id: 'ftv-sfa-ex-4', title: 'Mediekart for The Matrix', situation: 'Fortellingsinformasjon er fordelt mellom filmer, animasjon, tegneserier og spill.', analysis: ['Merk hvert bidrag som gjenfortelling, bakgrunn, bro, sideforløp eller nytt verdensstoff.', 'Kall helheten transmedial først når flere medier faktisk bidrar forskjellig; merkevaretilstedeværelse alene er ikke nok.'] }
      ],
      commonMisconceptions: [
        { claim: 'Episodisk og seriell fortelling er rene motsetninger.', correction: 'Mange verk kombinerer lokal episodisk lukning med langsiktige buer.' },
        { claim: 'Cliffhanger betyr bare at scenen er spennende.', correction: 'Cliffhangeren krever en organisert stans ved en del- eller publiseringsgrense.' },
        { claim: 'Et TV-format er det samme som innholdet i én sending.', correction: 'Formatet er de repeterbare reglene og rollene som nytt innhold kan fylle.' },
        { claim: 'Alle sitcomer må ha fast ensemble, dekor og full nullstilling.', correction: 'Sitcomformer varierer, og antologi, sted og serialitet kan kombineres ulikt.' },
        { claim: 'Sesongen er bare en praktisk pakke med episoder.', correction: 'Sesongen kan organisere egne buer og rytmer, men må også undersøkes i produksjonshistorien.' },
        { claim: 'Lang serie betyr automatisk sterk serialitet.', correction: 'Varighet alene sier ikke hvordan gjentakelse, endring og grenser organiseres.' }
      ]
    },
    '03-adaptasjon-og-univers.json': {
      id: 'adaptasjon-og-univers', title: 'Adaptasjon og univers',
      sections: [
        section('ftv-sfa-adaptasjon-1', 'Adaptasjon og remake er sammenlignbare formvalg', emneIds[0], [
          'Adaptasjonsanalyse bør undersøke hva et nytt medium eller en ny versjon gjør med tid, rom, framstilling og rollefigur, ikke bruke troskap som eneste mål. Library of Congress dokumenterer at 12 Angry Men gikk fra scenegrunnlag via direktesendt Studio One-drama til film; BFI følger fire Body Snatchers-filmatiseringer som endrer både form og historisk situasjon.',
          'Body Snatchers-versjonene flytter handlingen fra en småby til San Francisco, en militærbase og Washington. De endrer også hovedfigur, synsvinkel, kroppshorror, politisk ramme og avslutning. Kildene gjør endringene etterprøvbare; analysen av hva de betyr må argumenteres versjon for versjon.',
          '12 Angry Men beholder jurykonflikten gjennom scene, direktesendt fjernsyn og film, men den mediale overføringen endrer hvordan rom, varighet, skuespillerarbeid og kameratilgang kan organiseres. Library of Congress dokumenterer overføringsforløpet; en nærlesning må vise de konkrete formforskjellene før den forklarer virkningen.',
          'Flash Gordon Serial var ifølge Library of Congress den første skjermadaptasjonen av tegneserien og fortalte forløpet i tretten episoder. Caset kobler derfor adaptasjon til kinoføljetong, men gjør ikke adaptasjon, serialitet og franchise til samme begrep: de beskriver henholdsvis forholdet til forelegget, inndelingen i deler og en større eiendoms-/univershelhet.'
        ], ['ftv-sfa-pc-01', 'ftv-sfa-pc-02', 'ftv-sfa-pc-03', 'ftv-sfa-pc-04'], [
          'Sammenlign medium, tid, rom, framstilling og rollefigur—ikke bare avvik fra forelegget.',
          'Skill adaptasjon, remake, serialitet og franchise selv når de overlapper i samme case.'
        ], ['ftv-sfa-pc-01', 'ftv-sfa-pc-04']),
        section('ftv-sfa-transmedia-1', 'Transmedia krever forskjellige bidrag fra flere medier', emneIds[4], [
          'Henry Jenkins definerer transmedial fortelling som systematisk spredning av integrerte fiksjonselementer på flere kanaler, ideelt med et eget bidrag fra hvert medium. Ren gjenfortelling, lisensiert vare eller markedsføring er derfor ikke automatisk verdensutvidelse. Analysen må vise hvor ny fortellingsinformasjon faktisk finnes.',
          'Jenkins og BFI dokumenterer at Matrix-universet fordeler stoff mellom tre live-action-filmer, The Animatrix, tegneserier og spill. BFI skiller også oppfølgerfilmene, som utvikler maskinbyen og konstruksjonens arkitektur, fra bidragene i andre medier. Et mediekart kan dermed plassere informasjon uten å anta at alle deler er nødvendige eller likeverdige.',
          'Oppfølger fortsetter et tidligere verk; prequel legger hovedforløpet tidligere; remake lager en ny versjon; adaptasjon omformer et forelegg; transmedial utvidelse tilfører stoff gjennom et annet medium. The Godfather Part II, Body Snatchers, Flash Gordon og The Matrix viser at flere relasjoner kan finnes i samme franchise, men de må kodes hver for seg.'
        ], ['ftv-sfa-pc-13', 'ftv-sfa-pc-14', 'ftv-sfa-pc-15'], [
          'Krev et identifiserbart, forskjellig fortellingsbidrag fra hvert medium.',
          'Kod oppfølger, prequel, remake, adaptasjon og transmedia som separate relasjoner.'
        ], ['ftv-sfa-pc-13', 'ftv-sfa-pc-15'])
      ]
    },
    '04-krim-og-sjangerrevisjon.json': {
      id: 'krim-og-sjangerrevisjon', title: 'Krim og sjangerrevisjon',
      sections: [
        section('ftv-sfa-krim-1', 'Krim organiserer kunnskap og orden på flere måter', emneIds[5], [
          'Krimspenning kan organiseres rundt gåte, etterforskning, kjent gjerningsperson, truet orden eller institusjonelt sammenbrudd. The Godfather-filmene følger familie og organisert kriminalitet, mens The Wire og The Shield utvider politi- og noirformer mot by, klasse, rase og institusjoner. Ingen enkelt oppskrift forklarer alle casene.',
          'Library of Congress beskriver The Godfather Part II som både oppfølger og prequel: Vito Corleones bakgrunn flettes med Michaels senere makt- og familiekrise. Filmen omorganiserer dermed familiesaga, kriminalitet og historisk tid samtidig som den fortsetter et adaptert filmverk.',
          'Series-studien viser at The Wire overskrider cop-showet gjennom et flerlagsportrett av Baltimore, mens The Shield fører noirens moralske tvetydighet inn i politirollen og Los Angeles. Den utvidede serialiteten lar byrom, institusjoner og rollefigurer utvikles sammen og reviderer gjenkjennelige politi- og noirspor.'
        ], ['ftv-sfa-pc-16', 'ftv-sfa-pc-17', 'ftv-sfa-pc-18'], [
          'Kartlegg hva som fordeler kunnskap og trussel i det konkrete krimverket.',
          'Knytt sjangerrevisjon til serieform, sted og institusjoner som faktisk kan observeres.'
        ], ['ftv-sfa-pc-16', 'ftv-sfa-pc-18']),
        section('ftv-sfa-sjangerhistorie-1', 'Sjangre endres gjennom sykluser, hybrider og nye versjoner', emneIds[9], [
          'Sjangerhistorie må følge formendringer, sykluser og skiftende kategorier, ikke behandle etiketter som tidløse. BFIs år-for-år-historie viser blant annet gotiske monstersykluser, Hammer, moderne zombie, slasher, J-horror og senere revisjoner. En kronologi dokumenterer endring; den forklarer ikke automatisk hvorfor hvert skifte skjer.',
          'Body Snatchers-filmene beholder et science fiction- og horrorgrunnlag, men flytter sted, hovedfigur, synsvinkel, trussel og politisk samtid fra 1950-årene til etter 9/11. Remakes er derfor historiske sjangerhandlinger: de kan sitere et gjenkjennelig premiss og omforme hvilke bekymringer og former som bærer det.',
          'The Guest Book blander antologi, sitcom og skiftende sjangertoner rundt et fast sted. The Wire og The Shield kombinerer politi-, by-, realisme- og noirspor på ulike måter. Hybridisering opphever ikke alle kategorier; analysen skal vise hvilke spor som fortsatt er gjenkjennelige, og hvilke funksjoner som er revidert.'
        ], ['ftv-sfa-pc-26', 'ftv-sfa-pc-27', 'ftv-sfa-pc-28'], [
          'Historiser etiketter gjennom dokumenterte sykluser og formendringer.',
          'Vis både hvilke sjangerspor hybriden beholder og hva den omformer.'
        ], ['ftv-sfa-pc-26', 'ftv-sfa-pc-28'])
      ],
      applicationTasks: [
        { id: 'ftv-sfa-task-1', title: 'Episode–serie-kartet', task: 'Kartlegg ett forløp på tre nivåer.', prompts: ['Hva løses lokalt i episoden?', 'Hva endres i sesongbuen?', 'Hva føres videre i hele serien?'] },
        { id: 'ftv-sfa-task-2', title: 'Cliffhangerloggen', task: 'Analyser én publiseringsgrense.', prompts: ['Hva stanser konkret?', 'Hvilken kunnskap mangler?', 'Når og hvordan kan svaret gis?'] },
        { id: 'ftv-sfa-task-3', title: 'Formatprotokollen', task: 'Sammenlign to utgaver av samme TV-format.', prompts: ['Hvilke regler og roller gjentas?', 'Hva varierer?', 'Hvilken forskjell ville endret selve formatet?'] },
        { id: 'ftv-sfa-task-4', title: 'Adaptasjonsmatrisen', task: 'Sammenlign et forelegg og en skjermversjon.', prompts: ['Hva skjer med tid og rom?', 'Hvordan endres framstilling og rollefigur?', 'Hvilken forskjell kan dokumenteres, og hvilken virkning tolker du?'] },
        { id: 'ftv-sfa-task-5', title: 'Transmediakartet', task: 'Kartlegg et univers på tvers av medier.', prompts: ['Hvilket medium inneholder hvilket stoff?', 'Er bidraget nytt, gjenfortalt eller markedsførende?', 'Må flere medier brukes for å forstå helheten?'] },
        { id: 'ftv-sfa-task-6', title: 'Sjangerrevisjonen', task: 'Følg ett sjangerspor gjennom to historiske verk.', prompts: ['Hva er gjenkjennelig?', 'Hva er flyttet eller omformet?', 'Hvilken historisk kilde støtter periodiseringen?'] }
      ],
      selfCheck: [
        { question: 'Hva er minste krav for å kalle et forløp serialisert?', answer: 'At avgrensede deler både gjentar et gjenkjennelig mønster og fører videre en endring, relasjon eller verden.' },
        { question: 'Hva skiller episodebue fra sesongbue?', answer: 'Episodebuen gjelder lokal oppgave og lukning; sesongbuen samler endring over flere episoder.' },
        { question: 'Hva gjør en stans til en cliffhanger?', answer: 'At handling eller informasjon holdes tilbake ved en konkret del- eller publiseringsgrense.' },
        { question: 'Hva er formatlogikk?', answer: 'Repeterbare regler, roller, runder og tidsgrenser som kan fylles med nytt innhold.' },
        { question: 'Hvorfor er troskap utilstrekkelig i adaptasjonsanalyse?', answer: 'Fordi analysen også må forklare hva det nye mediet gjør med tid, rom, framstilling og rollefigur.' },
        { question: 'Hva skiller transmedia fra vanlig franchiseutbredelse?', answer: 'Transmedia krever forskjellige fortellingsbidrag fra flere medier; merkevaretilstedeværelse alene er ikke nok.' },
        { question: 'Kan et verk være både oppfølger og prequel?', answer: 'Ja. The Godfather Part II fører hovedforløpet videre og forteller samtidig Vito Corleones tidligere historie.' },
        { question: 'Hva viser sjangerhybridisering?', answer: 'At gjenkjennelige sjangerspor kan kombineres og revideres uten å forsvinne helt.' }
      ]
    }
  };

  const claims = [
    claim('ftv-sfa-pc-01', 'Adaptasjonsanalyse må sammenligne hva et nytt medium gjør med tid, rom, framstilling og rollefigur, ikke bare måle troskap til forelegget.', ['ftvsfa13-bfi-body-snatchers', 'ftvsfa14-loc-film-registry'], 'ftv-sfa-adaptasjon-1'),
    claim('ftv-sfa-pc-02', 'Body Snatchers-filmene flytter sted, hovedfigur, synsvinkel, trussel, samtidshistorisk ramme og avslutning mellom fire versjoner.', ['ftvsfa13-bfi-body-snatchers'], 'ftv-sfa-adaptasjon-1'),
    claim('ftv-sfa-pc-03', '12 Angry Men gikk fra scenegrunnlag via direktesendt Studio One-drama til film, slik at samme jurykonflikt kunne organiseres gjennom forskjellige mediale rom og framstillingsvilkår.', ['ftvsfa14-loc-film-registry'], 'ftv-sfa-adaptasjon-1'),
    claim('ftv-sfa-pc-04', 'Flash Gordon Serial adapterte tegneserien til tretten kinoepisoder; adaptasjonsforholdet og episodeinndelingen må likevel analyseres som ulike relasjoner.', ['ftvsfa14-loc-film-registry'], 'ftv-sfa-adaptasjon-1'),
    claim('ftv-sfa-pc-05', 'En cliffhanger organiserer stans i handling eller informasjon ved en del- eller publiseringsgrense og kan derfor ikke reduseres til rask rytme eller generell spenning.', ['ftvsfa01-series-episodic-serial', 'ftvsfa08-bfi-doctor-who'], 'ftv-sfa-cliffhanger-1'),
    claim('ftv-sfa-pc-06', 'The Invasion stanser ved en konkret episodefare, mens The Prisoners premature slutt lar sentrale spørsmål stå åpne på serienivå.', ['ftvsfa07-bfi-prisoner', 'ftvsfa08-bfi-doctor-who'], 'ftv-sfa-cliffhanger-1', 'verified_after_scope_narrowing'),
    claim('ftv-sfa-pc-07', 'Formatlogikk består av repeterbare regler, roller, runder og tidsgrenser som kan fylles med skiftende deltakere og innhold.', ['ftvsfa02-series-maigret', 'ftvsfa09-tv-academy-jeopardy', 'ftvsfa10-tv-academy-price-is-right'], 'ftv-sfa-format-1'),
    claim('ftv-sfa-pc-08', 'Jeopardy! skaper variasjon i deltakere, spørsmål og utfall innen en sekvens av tre deltakere, tre runder, tre Daily Doubles og Final Jeopardy som knapt har endret seg siden 1964.', ['ftvsfa09-tv-academy-jeopardy'], 'ftv-sfa-format-1'),
    claim('ftv-sfa-pc-09', 'The Price Is Right kombinerer publikumsrekrutterte deltakere, et stort spillrepertoar, programlederforklaring og studiopublikum til lokal dramaliknende oppbygning uten at kilden dokumenterer direktesending.', ['ftvsfa10-tv-academy-price-is-right'], 'ftv-sfa-format-1', 'verified_after_scope_narrowing'),
    claim('ftv-sfa-pc-10', 'En episode kan gjenta en kjent formel og samtidig endre rollefigurer eller en langsiktig bue.', ['ftvsfa01-series-episodic-serial', 'ftvsfa02-series-maigret'], 'ftv-sfa-episodisk-1'),
    claim('ftv-sfa-pc-11', 'Episodisk og seriell dramaturgi er grader og kombinasjoner av lokal lukning og langsiktig videreføring, ikke et absolutt enten–eller.', ['ftvsfa01-series-episodic-serial'], 'ftv-sfa-episodisk-1'),
    claim('ftv-sfa-pc-12', 'Doctor Who: The Invasion organiserer lokal cliffhangerfare, mens The Prisoner gjentar et langsiktig premiss gjennom varierende episodekonflikter.', ['ftvsfa03-series-doctor-who', 'ftvsfa07-bfi-prisoner', 'ftvsfa08-bfi-doctor-who'], 'ftv-sfa-episodisk-1'),
    claim('ftv-sfa-pc-13', 'Transmedial fortelling krever forskjellige fortellingsbidrag fra flere medier; gjenfortelling, lisensiering eller markedsføring utvider ikke automatisk fiksjonsverdenen.', ['ftvsfa04-series-fringe-transmedia', 'ftvsfa06-jenkins-transmedia'], 'ftv-sfa-transmedia-1'),
    claim('ftv-sfa-pc-14', 'Matrix-universet fordeler fortellingsstoff mellom live-action-filmer, The Animatrix, tegneserier og spill, med identifiserbare bidrag i flere medier.', ['ftvsfa06-jenkins-transmedia', 'ftvsfa15-bfi-matrix'], 'ftv-sfa-transmedia-1'),
    claim('ftv-sfa-pc-15', 'Oppfølger, prequel, remake, adaptasjon og transmedial utvidelse beskriver forskjellige verkrelasjoner og må kodes separat selv innen samme franchise.', ['ftvsfa06-jenkins-transmedia', 'ftvsfa13-bfi-body-snatchers', 'ftvsfa14-loc-film-registry', 'ftvsfa15-bfi-matrix'], 'ftv-sfa-transmedia-1'),
    claim('ftv-sfa-pc-16', 'Krimspenning kan organiseres gjennom gåte, etterforskning, kjent forbrytelse, truet orden eller institusjonelt sammenbrudd uten én universell oppskrift.', ['ftvsfa05-series-crime-revision', 'ftvsfa14-loc-film-registry'], 'ftv-sfa-krim-1'),
    claim('ftv-sfa-pc-17', 'The Godfather Part II er både oppfølger og prequel og fletter Vito Corleones bakgrunn sammen med Michaels senere makt-, forbrytelses- og familiekrise.', ['ftvsfa14-loc-film-registry'], 'ftv-sfa-krim-1'),
    claim('ftv-sfa-pc-18', 'The Wire og The Shield reviderer politi- og noirtradisjoner gjennom utvidede by-, institusjons- og rollefigurforløp.', ['ftvsfa05-series-crime-revision'], 'ftv-sfa-krim-1'),
    claim('ftv-sfa-pc-19', 'Serialitet oppstår når avgrensede deler både gjentar et gjenkjennelig mønster og endrer et forløp, en relasjon eller en verden.', ['ftvsfa01-series-episodic-serial', 'ftvsfa02-series-maigret'], 'ftv-sfa-serialitet-1'),
    claim('ftv-sfa-pc-20', 'Serie, serial, føljetong og episodeformat betegner forskjellige kombinasjoner av lokal lukning, avsnittsinndeling og videreføring.', ['ftvsfa01-series-episodic-serial', 'ftvsfa02-series-maigret', 'ftvsfa14-loc-film-registry'], 'ftv-sfa-serialitet-1'),
    claim('ftv-sfa-pc-21', 'Flash Gordon Serial, Doctor Who: The Invasion og The Prisoner viser historisk ulike forbindelser mellom gjentakelse, episodegrense og langt premiss.', ['ftvsfa07-bfi-prisoner', 'ftvsfa08-bfi-doctor-who', 'ftvsfa14-loc-film-registry'], 'ftv-sfa-serialitet-1'),
    claim('ftv-sfa-pc-22', 'Sesongbuen er et mellomnivå som kan samle endringer gjennom flere episoder uten å være identisk med hele serien.', ['ftvsfa01-series-episodic-serial'], 'ftv-sfa-sesong-1'),
    claim('ftv-sfa-pc-23', 'Doctor Whos tidlige rollefigurutvikling ble påvirket av rask produksjonsomløp, mens The Prisoner endte prematurt etter 17 episoder; historiske produksjonsvilkår må derfor inngå i analysen av serieomfang.', ['ftvsfa03-series-doctor-who', 'ftvsfa07-bfi-prisoner'], 'ftv-sfa-sesong-1', 'verified_after_scope_narrowing'),
    claim('ftv-sfa-pc-24', 'Sitcom kan bygge humor gjennom tilbakevendende rollefigurer og situasjoner samtidig som episoden organiserer en lokal komisk forstyrrelse og mulig videreføring.', ['ftvsfa01-series-episodic-serial', 'ftvsfa11-tv-academy-comedy'], 'ftv-sfa-sitcom-1'),
    claim('ftv-sfa-pc-25', 'I Love Lucy knytter humor til tilbakevendende ensemble og episodehåndverk, mens The Guest Book kombinerer fast sted med skiftende figurer og antologisk-sjangerhybrid form.', ['ftvsfa11-tv-academy-comedy', 'ftvsfa12-tv-academy-anthology'], 'ftv-sfa-sitcom-1'),
    claim('ftv-sfa-pc-26', 'Sjangerhistorie må følge dokumenterte sykluser og formendringer framfor å behandle institusjonelle og kritiske etiketter som tidløse.', ['ftvsfa16-bfi-horror-history'], 'ftv-sfa-sjangerhistorie-1'),
    claim('ftv-sfa-pc-27', 'Body Snatchers-filmene reviderer et science fiction- og horrorgrunnlag gjennom nye steder, figurer, synsvinkler, trusler og samtidshistoriske rammer.', ['ftvsfa13-bfi-body-snatchers', 'ftvsfa16-bfi-horror-history'], 'ftv-sfa-sjangerhistorie-1'),
    claim('ftv-sfa-pc-28', 'The Guest Book hybridiserer antologi og sitcom, mens The Wire og The Shield kombinerer politi-, by-, realisme- og noirspor uten at alle sjangerkjennetegn oppheves.', ['ftvsfa05-series-crime-revision', 'ftvsfa12-tv-academy-anthology', 'ftvsfa16-bfi-horror-history'], 'ftv-sfa-sjangerhistorie-1')
  ];

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
    id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'fortelling_sjanger_serialitet_format',
    editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: emneIds, method_ids: methodIds,
    title: 'Serialitet, format og adaptasjon: hvordan fortellinger gjentas, deles og omformes',
    subtitle: 'Fra episode, sesong og TV-format til remake, transmedia og historisk sjangerrevisjon',
    lead: 'Kapittelet undersøker fortelling på tvers av deler, sesonger, versjoner og medier. Det skiller episode fra sesong og serie, format fra enkeltinnhold, adaptasjon fra remake og transmedia, og sjangerrevisjon fra en tidløs sjekkliste. Hvert hovedpoeng følger et eksplisitt spor fra inspectable kilde via avgrenset observasjon til begrunnet sammenligning.',
    learningObjectives: [
      'skille episodebue, sesongbue og seriehelhet', 'analysere gjentakelse og endring som serialitet',
      'identifisere hva en cliffhanger holder tilbake ved en konkret grense', 'skille repeterbar formatlogikk fra én sendings innhold',
      'sammenligne adaptasjoner og remakes gjennom tid, rom, framstilling og rollefigur',
      'skille oppfølger, prequel, remake, adaptasjon og transmedial utvidelse',
      'historisere krim, sitcom, horror og sjangerhybrider gjennom dokumenterte formendringer',
      'holde rettigheter, lisensiering, distribusjon og produksjonsteknikk utenfor enhetens eierområde'
    ],
    diagnosticQuestions: [
      { question: 'Er en serie automatisk serialisert fordi den har mange episoder?', answer: 'Nei. Analysen må vise hva som gjentas og hva som endres eller føres videre mellom delene.' },
      { question: 'Er cliffhanger det samme som høy spenning?', answer: 'Nei. Handlingen eller informasjonen må stanses ved en konkret del- eller publiseringsgrense.' },
      { question: 'Er et format bare innholdet i en episode?', answer: 'Nei. Formatet er de repeterbare reglene, rollene og rundene som nytt innhold kan fylle.' },
      { question: 'Er enhver franchise transmedial?', answer: 'Nei. Flere medier må gi forskjellige fortellingsbidrag; merkevareutbredelse alene er ikke nok.' },
      { question: 'Kan adaptasjon vurderes bare etter troskap?', answer: 'Nei. Den nye versjonens tid, rom, framstilling, rollefigurer og medium må sammenlignes.' }
    ],
    relatedPlaces: [
      { id: 'hartvig_nissens_skole_skam', name: 'Hartvig Nissens skole (SKAM)', role: 'Kartlegg hvordan ett canonicalt sted får ulike funksjoner gjennom episoder, sesonger og rollefigurforløp uten å forveksle location med hele serieformatet.' },
      { id: 'cinemateket_oslo', name: 'Cinemateket i Oslo', role: 'Bruk et kuratert versjons- eller sjangerprogram til å sammenligne adaptasjon, remake og historisk sjangerrevisjon med dokumenterte program- og verkopplysninger.' }
    ],
    workCases, moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims, sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret analyse av episode, sesong, serie, format, adaptasjon, transmedia og sjangerrevisjon gjennom sammenlignbare film-, TV- og versjonscase.',
    audience: 'Brukere som skal kunne beskrive hvordan fortellinger deles, gjentas og omformes uten å blande analytiske nivåer eller overdrive kildene.',
    requiredEmneIds: emneIds, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: ['episode vs sesong vs hel serie', 'episodisk vs seriell som grader', 'cliffhanger vs generell spenning', 'formatregler vs enkeltinnhold', 'sitcomfamilie vs universell modell', 'adaptasjon vs troskapsmåling', 'oppfølger vs prequel vs remake', 'franchise vs transmedial fortelling', 'sjangerrevisjon vs tidløs etikett', 'fortellingsorganisering vs rettigheter og lisensiering', 'kildeopplysning vs observasjon vs tolkning'],
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, sourceLocationsRequired: true, observationSourceFactInterpretationSeparated: true, everyPlannedClaimResolved: true },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: emneIds, excluded: ['rettigheter og lisensiering', 'distribusjonsmarked og plattformøkonomi', 'produksjonsteknikk som hovedforklaring', 'påstander om faktisk publikumsvirkning uten resepsjonsevidens', 'én obligatorisk canonical boks per enkeltsjanger'] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 10, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '10/10', plannedClaimResolution: '28/28' }
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
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: emneIds.length, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_filmhistorie_bevegelser_og_historiografi';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.81.0'; registry.updatedAt = '2026-08-11';
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: emneIds, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Serialitet, format og adaptasjon er registrert etter fulltekst- og evidensport med 10 canonicale emner, 10 emneeide seksjoner, 28 claimsporede avsnitt, 28 verifiserte claims, 16 brukte inspectable kilder, 12 film-, TV- og versjonscase og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Filmhistorie, bevegelser og historiografi; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.thirdSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.69.0'; status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress'; filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Serialitet, format og adaptasjon er registrert etter fulltekst- og evidensaudit: 10/10 canonicale emner, 4 faglig avgrensede moduler, 10 seksjoner, 28 avsnitt med claimtrace, 28/28 løste claimplaner, 16 brukte inspectable kilder, 12 film-, TV- og versjonscase og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Filmhistorie, bevegelser og historiografi.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0'; sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedGates,
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: claims.length === 28
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvSerialityFormatAdaptationFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE, TELEVISION_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE, TELEVISION_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE].includes(currentGate) && !force) {
    console.log('Serialitet, format og adaptasjon er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvSerialityFormatAdaptationFulltextV1();
  write(P.chapter, built.chapter); write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc); write(P.sourceBrief, built.sourceBrief); write(P.registry, built.registry);
  write(P.status, built.status); write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvSerialityFormatAdaptationFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV serialitetsfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
