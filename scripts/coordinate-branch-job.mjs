import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-tid-production';
const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const conceptsPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const emnerPath = path.join(historyDir, 'emner_historie_canonical_v4_5.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const A = (value) => Array.isArray(value) ? value : [];

const concepts = readJson(conceptsPath);
const theories = readJson(theoriesPath);
const emners = readJson(emnerPath);

const conceptSpecs = {
  con_his_1800_tallets: {
    label: 'det lange 1800-tallet',
    definition: 'En analytisk periodisering som lar revolusjons-, industrialiserings- og statsdannelsesprosesser fra slutten av 1700-tallet løpe fram mot første verdenskrig, i stedet for å følge kalenderårene 1800–1899.',
    broader_concepts: ['con_his_epoker'],
    narrower_concepts: [],
    related_concepts: ['con_his_modernisering', 'con_his_historiske_rytmer'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å behandle det lange 1800-tallet som en fast universell periode med samme start og slutt i alle land og lokalsamfunn.']
  },
  con_his_anakronisme: {
    label: 'anakronisme',
    definition: 'En anakronisme oppstår når senere begreper, institusjoner, verdier eller kunnskap tilskrives fortidens aktører uten at samtidige kilder viser at de kunne forstå situasjonen på denne måten.',
    broader_concepts: ['con_his_begreper'],
    narrower_concepts: [],
    related_concepts: ['con_his_samtid', 'con_his_ettertid'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å kalle enhver moderne sammenligning anakronistisk, selv når forskjellen mellom samtidens og analytikerens begreper er gjort eksplisitt.']
  },
  con_his_apne: {
    label: 'historisk kontingens',
    definition: 'Historisk kontingens betegner at et utfall ikke var nødvendigvis gitt på forhånd, fordi aktører handlet under usikkerhet og flere realistiske handlingsforløp fortsatt var åpne i samtiden.',
    broader_concepts: ['con_his_historisk_endring'],
    narrower_concepts: [],
    related_concepts: ['con_his_framtider', 'con_his_hendelse', 'con_his_prosess'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å bruke kontingens som om alle utfall var like sannsynlige, uten å undersøke maktforhold, ressurser og institusjonelle begrensninger.']
  },
  con_his_begreper: {
    label: 'historiske begreper',
    definition: 'Historiske begreper er ord og kategorier hvis betydning, rekkevidde og politiske bruk endres over tid og derfor må undersøkes i samtidige tekster, institusjoner og konflikter.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_anakronisme'],
    related_concepts: ['con_his_erfaringsrom', 'con_his_forventningshorisont'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å anta at et kjent ord hadde samme innhold og sosiale rekkevidde i fortiden som det har i dag.']
  },
  con_his_brudd: {
    label: 'historisk brudd',
    definition: 'Et historisk brudd er en dokumentert og tidsavgrenset diskontinuitet der institusjoner, praksiser eller livsvilkår endres raskere eller mer grunnleggende enn i den foregående perioden.',
    broader_concepts: ['con_his_historisk_endring'],
    narrower_concepts: [],
    related_concepts: ['con_his_kontinuitet', 'con_his_hendelse'],
    distinguish_from: ['con_his_hendelse'],
    common_misuse: ['Å utrope en dramatisk hendelse til historisk brudd uten å dokumentere at varige praksiser eller maktforhold faktisk ble endret.']
  },
  con_his_byrom: {
    label: 'historiske lag i byrom',
    definition: 'Historiske lag i byrom er fysiske, funksjonelle og symbolske rester fra ulike perioder som fortsatt kan lokaliseres og dateres innenfor samme gate, tomt, kvartal eller byområde.',
    broader_concepts: ['con_his_lag'],
    narrower_concepts: [],
    related_concepts: ['con_his_stedlig_spor', 'con_his_samtidighet'],
    distinguish_from: ['con_his_historisk_endring'],
    common_misuse: ['Å lese dagens blandede bymiljø som om alle synlige lag var samtidige eller hadde beholdt sin opprinnelige funksjon.']
  },
  con_his_datering: {
    label: 'datering',
    definition: 'Datering er arbeidet med å plassere en hendelse, gjenstand, tekst eller bygningsfase i et dokumentert tidspunkt eller tidsintervall ved hjelp av eksplisitte kilde- og sporbevis.',
    broader_concepts: ['con_his_kronologi'],
    narrower_concepts: ['con_his_dateringsgrunnlag', 'con_his_dateringsusikkerhet', 'con_his_tidsmessig'],
    related_concepts: ['con_his_kildegrunnlag'],
    distinguish_from: ['con_his_periodisering'],
    common_misuse: ['Å presentere en omtrentlig eller relativ datering som et eksakt kalenderår fordi én sekundærkilde bruker et avrundet tall.']
  },
  con_his_dateringsgrunnlag: {
    label: 'dateringsgrunnlag',
    definition: 'Dateringsgrunnlag er de konkrete opplysningene, lagfølgene, materialtrekkene eller dokumentene som gjør det mulig å begrunne når noe ble produsert, endret eller tatt i bruk.',
    broader_concepts: ['con_his_datering'],
    narrower_concepts: [],
    related_concepts: ['con_his_kildegrunnlag', 'con_his_stedlig_spor'],
    distinguish_from: ['con_his_dateringsusikkerhet'],
    common_misuse: ['Å oppgi en dato uten å skille mellom selve dateringsbeviset og en senere forfatters konklusjon.']
  },
  con_his_dateringsusikkerhet: {
    label: 'dateringsusikkerhet',
    definition: 'Dateringsusikkerhet er det dokumenterte slingringsrommet rundt et tidspunkt eller en rekkefølge når kildene bare støtter et intervall, en terminus eller flere konkurrerende dateringer.',
    broader_concepts: ['con_his_datering'],
    narrower_concepts: [],
    related_concepts: ['con_his_usikkerhet', 'con_his_tidsmessig_usikkerhet'],
    distinguish_from: ['con_his_tidsmessig'],
    common_misuse: ['Å behandle uenighet mellom dateringer som en feil som kan skjules, i stedet for som en del av det historiske kunnskapsgrunnlaget.']
  },
  con_his_endringstempo: {
    label: 'endringstempo',
    definition: 'Endringstempo beskriver hvor raskt en historisk omforming skjer og gjør det mulig å sammenligne teknologiske, institusjonelle, økonomiske og hverdagslige prosesser som beveger seg i ulik fart.',
    broader_concepts: ['con_his_historiske_rytmer'],
    narrower_concepts: ['con_his_ulike'],
    related_concepts: ['con_his_modernisering', 'con_his_varighet'],
    distinguish_from: ['con_his_brudd'],
    common_misuse: ['Å bruke én innføringsdato som mål på hvor raskt en endring faktisk ble tatt i bruk av ulike grupper og steder.']
  },
  con_his_epoker: {
    label: 'historiske epoker',
    definition: 'Historiske epoker er navngitte perioder som historikere eller samtidige aktører avgrenser ved bestemte kriterier, og som derfor må vurderes mot lokale tidslinjer og alternative periodiseringer.',
    broader_concepts: ['con_his_periodisering'],
    narrower_concepts: ['con_his_1800_tallets'],
    related_concepts: ['con_his_brudd', 'con_his_kontinuitet'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å behandle epokenavnet som en naturlig egenskap ved fortiden i stedet for som en begrunnet analytisk inndeling.']
  },
  con_his_erfaring: {
    label: 'historisk erfaring',
    definition: 'Historisk erfaring er hvordan mennesker i en bestemt samtid oppfattet endring, risiko og muligheter gjennom egne liv, kollektive minner og tilgjengelige fortolkninger av fortiden.',
    broader_concepts: ['con_his_erfaringsrom'],
    narrower_concepts: [],
    related_concepts: ['con_his_samtid', 'con_his_forventningshorisont'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å utlede en hel befolknings erfaring fra én elitekilde eller fra ettertidens minne om perioden.']
  },
  con_his_erfaringsrom: {
    label: 'erfaringsrom',
    definition: 'Erfaringsrom betegner den delen av fortiden som var tilgjengelig for historiske aktører gjennom minner, institusjoner, tradisjoner og egne opplevelser da de tolket sin samtid.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_erfaring'],
    related_concepts: ['con_his_forventningshorisont', 'con_his_begreper'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å rekonstruere aktørenes erfaringsrom ut fra kunnskap som først ble tilgjengelig etter hendelsene.']
  },
  con_his_ettertid: {
    label: 'ettertidsperspektiv',
    definition: 'Et ettertidsperspektiv er den senere posisjonen hvorfra hendelser ordnes, får sluttpunkt og knyttes til konsekvenser som samtidens aktører ikke kunne kjenne fullt ut.',
    broader_concepts: ['con_his_fortelling'],
    narrower_concepts: [],
    related_concepts: ['con_his_samtid', 'con_his_periodisering'],
    distinguish_from: ['con_his_samtid'],
    common_misuse: ['Å gjøre senere utfall til bevis for at samtidens aktører forsto utviklingen som uunngåelig.']
  },
  con_his_fortelling: {
    label: 'historisk fortelling',
    definition: 'En historisk fortelling er en kildebasert ordning av hendelser og prosesser der utvalg, rekkefølge, startpunkt og sluttpunkt skaper en forklarende sammenheng.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_ettertid'],
    related_concepts: ['con_his_kronologi', 'con_his_periodisering'],
    distinguish_from: ['con_his_kildegrunnlag'],
    common_misuse: ['Å forveksle en sammenhengende framstilling med selve hendelsesforløpet og skjule hvilke kilder og utvalg fortellingen bygger på.']
  },
  con_his_forventningshorisont: {
    label: 'forventningshorisont',
    definition: 'Forventningshorisont betegner de framtidene historiske aktører kunne forestille seg som mulige eller ønskelige ut fra sin samtid, sine begreper og sitt erfaringsrom.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_framtider'],
    related_concepts: ['con_his_erfaringsrom', 'con_his_apne'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å anta at aktørenes forventninger samsvarte med det utfallet historikeren allerede kjenner.']
  },
  con_his_framtider: {
    label: 'forestilte framtider',
    definition: 'Forestilte framtider er konkrete scenarier, mål og frykter som kan dokumenteres i samtidige planer, taler, brev eller handlinger før utfallet var kjent.',
    broader_concepts: ['con_his_forventningshorisont'],
    narrower_concepts: [],
    related_concepts: ['con_his_apne', 'con_his_erfaring'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å omtale en senere realisert utvikling som den eneste framtiden samtiden kunne forestille seg.']
  },
  con_his_hendelse: {
    label: 'historisk hendelse',
    definition: 'En historisk hendelse er en tids- og stedsavgrenset handling eller forekomst med identifiserbare aktører, samtidige bevis og et forhold til lengre forløp før og etter.',
    broader_concepts: ['con_his_tidsforlop'],
    narrower_concepts: [],
    related_concepts: ['con_his_prosess', 'con_his_brudd'],
    distinguish_from: ['con_his_prosess'],
    common_misuse: ['Å la hendelsens dato erstatte analyse av forløpet som gjorde hendelsen mulig og konsekvensene som fulgte.']
  },
  con_his_historisk_endring: {
    label: 'historisk endring',
    definition: 'Historisk endring er en dokumentert forskjell mellom minst to tidspunkter eller faser i institusjoner, praksiser, materielle forhold eller sosiale relasjoner.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_brudd', 'con_his_kontinuitet', 'con_his_modernisering'],
    related_concepts: ['con_his_endringstempo', 'con_his_prosess'],
    distinguish_from: ['con_his_hendelse'],
    common_misuse: ['Å hevde endring fordi noe er datert senere, uten å vise hva som faktisk var annerledes og for hvem.']
  },
  con_his_historiske_rytmer: {
    label: 'historiske rytmer',
    definition: 'Historiske rytmer er mønstre av rask, langsom, gjentakende eller avbrutt endring som kan påvises når flere tidsserier og samfunnsområder sammenlignes.',
    broader_concepts: ['con_his_varighet'],
    narrower_concepts: ['con_his_endringstempo'],
    related_concepts: ['con_his_samtidighet', 'con_his_lang_varighet'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å beskrive en rytme ut fra to enkeltår uten en tilstrekkelig serie som viser tempo eller gjentakelse.']
  },
  con_his_kildegrunnlag: {
    label: 'kildegrunnlag',
    definition: 'Kildegrunnlag er den avgrensede samlingen av samtidige og senere kilder, spor og dataserier som en historisk påstand bygger på, med synlige hull og representasjonsproblemer.',
    broader_concepts: [],
    narrower_concepts: ['con_his_dateringsgrunnlag', 'con_his_stedlig_spor'],
    related_concepts: ['con_his_usikkerhet', 'con_his_fortelling'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å omtale en litteraturliste som kildegrunnlag uten å vise hvilke konkrete kilder som bærer den aktuelle påstanden.']
  },
  con_his_kontinuitet: {
    label: 'historisk kontinuitet',
    definition: 'Historisk kontinuitet er dokumentert vedvarende praksis, struktur eller relasjon gjennom et tidsrom, også når den tilpasses eller får ny form.',
    broader_concepts: ['con_his_historisk_endring'],
    narrower_concepts: ['con_his_lang'],
    related_concepts: ['con_his_brudd', 'con_his_lang_varighet'],
    distinguish_from: ['con_his_brudd'],
    common_misuse: ['Å kalle fravær av synlig reform kontinuitet uten å undersøke gradvise endringer i bruk, makt eller berørte grupper.']
  },
  con_his_kronologi: {
    label: 'kronologi',
    definition: 'Kronologi er en etterprøvbar ordning av hendelser, tilstander og endringer etter tid, der kildenes dateringsnivå og usikkerhet følger hvert ledd i rekken.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_datering', 'con_his_tidsforlop'],
    related_concepts: ['con_his_fortelling'],
    distinguish_from: ['con_his_periodisering'],
    common_misuse: ['Å anta at en korrekt rekkefølge i seg selv forklarer hvorfor hendelsene fulgte etter hverandre.']
  },
  con_his_lag: {
    label: 'historiske lag',
    definition: 'Historiske lag er tidsmessig adskilte fysiske, institusjonelle eller funksjonelle avsetninger som kan identifiseres innenfor samme sted eller system.',
    broader_concepts: ['con_his_samtidighet'],
    narrower_concepts: ['con_his_byrom'],
    related_concepts: ['con_his_stedlig_spor', 'con_his_datering'],
    distinguish_from: ['con_his_kontinuitet'],
    common_misuse: ['Å anta at et bevart lag representerer hele den opprinnelige situasjonen eller alle gruppene som brukte stedet.']
  },
  con_his_lang: {
    label: 'strukturell treghet',
    definition: 'Strukturell treghet betegner at etablerte institusjoner, infrastrukturer og sosiale ordninger begrenser hvor raskt praksiser kan endres, selv etter formelle vedtak eller kriser.',
    broader_concepts: ['con_his_strukturer'],
    narrower_concepts: [],
    related_concepts: ['con_his_lang_varighet', 'con_his_kontinuitet'],
    distinguish_from: ['con_his_kontinuitet'],
    common_misuse: ['Å forklare all langsom endring med treghet uten å undersøke interesser, ressurser og aktiv motstand.']
  },
  con_his_lang_varighet: {
    label: 'lang varighet',
    definition: 'Lang varighet er en analysemåte som følger langsomme strukturer og materielle betingelser over generasjoner for å se hvilke rammer som består gjennom kortere hendelser.',
    broader_concepts: ['con_his_varighet'],
    narrower_concepts: ['con_his_lang'],
    related_concepts: ['con_his_strukturer', 'con_his_kontinuitet'],
    distinguish_from: ['con_his_hendelse'],
    common_misuse: ['Å bruke lang varighet til å nedtone konkrete beslutninger, konflikter og raske endringer som faktisk omformet strukturen.']
  },
  con_his_modernisering: {
    label: 'modernisering',
    definition: 'Modernisering betegner en sammensatt og ujevn historisk omforming av teknologi, økonomi, institusjoner, kommunikasjon og hverdagsliv, ikke en automatisk bevegelse mot ett sluttpunkt.',
    broader_concepts: ['con_his_historisk_endring'],
    narrower_concepts: [],
    related_concepts: ['con_his_endringstempo', 'con_his_ulike', 'con_his_1800_tallets'],
    distinguish_from: ['con_his_brudd'],
    common_misuse: ['Å bruke modernisering som synonym for framskritt og overse tap, ulikhet, motstand og parallelle eldre praksiser.']
  },
  con_his_periodisering: {
    label: 'periodisering',
    definition: 'Periodisering er den begrunnede inndelingen av historisk tid i perioder ved hjelp av valgte kriterier, skalaer og bruddpunkter som må kunne utfordres av andre tidslinjer.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_epoker', 'con_his_1800_tallets'],
    related_concepts: ['con_his_kronologi', 'con_his_brudd'],
    distinguish_from: ['con_his_datering'],
    common_misuse: ['Å presentere en periodisering som nøytral kalenderorden uten å oppgi kriteriet, skalaen og det materialet den utelater.']
  },
  con_his_prosess: {
    label: 'historisk prosess',
    definition: 'En historisk prosess er et sammenhengende, men ikke nødvendigvis lineært forløp av handlinger, betingelser og virkninger som utvikler seg over mer enn ett tidspunkt.',
    broader_concepts: ['con_his_tidsforlop'],
    narrower_concepts: ['con_his_lang_varighet'],
    related_concepts: ['con_his_hendelse', 'con_his_historisk_endring'],
    distinguish_from: ['con_his_hendelse'],
    common_misuse: ['Å omtale enhver kronologisk rekke som en prosess uten å dokumentere forbindelsene mellom leddene.']
  },
  con_his_samtid: {
    label: 'aktørenes samtid',
    definition: 'Aktørenes samtid er den tidslige situasjonen der mennesker handlet med den informasjonen, erfaringen og de framtidsmulighetene som faktisk var tilgjengelige før senere utfall var kjent.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_erfaring'],
    related_concepts: ['con_his_forventningshorisont', 'con_his_apne'],
    distinguish_from: ['con_his_ettertid'],
    common_misuse: ['Å beskrive aktørenes samtid med ettertidens sikre kunnskap om hvem som vant, hva som mislyktes og hvilke konsekvenser som fulgte.']
  },
  con_his_samtidighet: {
    label: 'samtidighet',
    definition: 'Samtidighet betegner at ulike prosesser, tidslag eller livsformer eksisterer i samme tidsrom uten at de derfor har samme alder, tempo eller historiske betydning.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_lag'],
    related_concepts: ['con_his_historiske_rytmer', 'con_his_ulike'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å anta at fenomener som eksisterte samtidig, oppsto samtidig eller påvirket alle grupper på samme måte.']
  },
  con_his_samtidshistorie: {
    label: 'samtidshistorie',
    definition: 'Samtidshistorie undersøker den nære fortiden mens levende minner, åpne konflikter, ufullstendige arkiver og pågående konsekvenser fortsatt påvirker kildebildet.',
    broader_concepts: ['con_his_samtid'],
    narrower_concepts: [],
    related_concepts: ['con_his_apne', 'con_his_ettertid', 'con_his_usikkerhet'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å behandle samtidshistorie som dagsaktuell kommentar uten historisk kildekritikk, tidsavgrensning og analyse av forløp.']
  },
  con_his_stedlig_spor: {
    label: 'stedlig spor',
    definition: 'Et stedlig spor er en fysisk, romlig eller dokumentert rest som kan knytte en bestemt lokalitet til tidligere bruk, aktører eller hendelser gjennom et etterprøvbart kildegrunnlag.',
    broader_concepts: ['con_his_kildegrunnlag'],
    narrower_concepts: ['con_his_lag', 'con_his_byrom'],
    related_concepts: ['con_his_dateringsgrunnlag'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å tolke et synlig spor som direkte bevis for hele stedets historie uten datering, proveniens eller kontrollkilde.']
  },
  con_his_strukturer: {
    label: 'historiske strukturer',
    definition: 'Historiske strukturer er varige institusjonelle, sosiale, økonomiske eller materielle ordninger som former handlingsrom over tid uten å bestemme hvert enkelt utfall.',
    broader_concepts: ['con_his_historisk_endring'],
    narrower_concepts: ['con_his_lang'],
    related_concepts: ['con_his_lang_varighet', 'con_his_historiske_rytmer'],
    distinguish_from: ['con_his_hendelse'],
    common_misuse: ['Å bruke struktur som en aktørløs totalforklaring som gjør konkrete beslutninger, konflikter og variasjon irrelevante.']
  },
  con_his_tid: {
    label: 'historisk tid',
    definition: 'Historisk tid er tid slik den ordnes, erfares og analyseres gjennom kronologi, varighet, samtidighet, forventninger og ettertidens periodisering, ikke bare som kalenderenheter.',
    broader_concepts: [],
    narrower_concepts: ['con_his_kronologi', 'con_his_periodisering', 'con_his_varighet'],
    related_concepts: ['con_his_erfaringsrom', 'con_his_forventningshorisont'],
    distinguish_from: ['con_his_datering'],
    common_misuse: ['Å redusere historisk tid til årstall og overse hvordan aktører erfarte tempo, framtid og samtidighet forskjellig.']
  },
  con_his_tidsforlop: {
    label: 'tidsforløp',
    definition: 'Et tidsforløp er en kildebelagt sekvens fra forutsetninger og utløsende handlinger gjennom hendelser til kort- og langsiktige konsekvenser.',
    broader_concepts: ['con_his_kronologi'],
    narrower_concepts: ['con_his_hendelse', 'con_his_prosess'],
    related_concepts: ['con_his_historisk_endring'],
    distinguish_from: ['con_his_fortelling'],
    common_misuse: ['Å konstruere et sammenhengende forløp ved å fylle kildehull med antakelser som ikke merkes som usikre.']
  },
  con_his_tidsmessig: {
    label: 'relativ datering',
    definition: 'Relativ datering plasserer noe før, etter eller samtidig med et annet spor eller en hendelse når kildene ikke støtter et sikkert kalenderår.',
    broader_concepts: ['con_his_datering'],
    narrower_concepts: [],
    related_concepts: ['con_his_dateringsgrunnlag', 'con_his_dateringsusikkerhet'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å omgjøre en før–etter-relasjon til et eksakt årstall uten et selvstendig dateringsbevis.']
  },
  con_his_tidsmessig_usikkerhet: {
    label: 'tidsmessig usikkerhet',
    definition: 'Tidsmessig usikkerhet omfatter usikkerhet om rekkefølge, varighet, samtidighet eller periodisk grense, også når enkeltdatoer isolert sett er sikre.',
    broader_concepts: ['con_his_usikkerhet'],
    narrower_concepts: ['con_his_dateringsusikkerhet'],
    related_concepts: ['con_his_tidsforlop', 'con_his_periodisering'],
    distinguish_from: ['con_his_apne'],
    common_misuse: ['Å blande usikkerhet om hva som skjedde videre med usikkerhet om når de dokumenterte leddene fant sted.']
  },
  con_his_ulike: {
    label: 'asynkron endring',
    definition: 'Asynkron endring betegner at steder, institusjoner og grupper gjennomgår beslektede omforminger på ulike tidspunkter og i ulikt tempo.',
    broader_concepts: ['con_his_endringstempo'],
    narrower_concepts: [],
    related_concepts: ['con_his_samtidighet', 'con_his_modernisering'],
    distinguish_from: ['con_his_brudd'],
    common_misuse: ['Å anta at en nasjonal reformdato markerer samme praktiske overgang for alle regioner, yrker og sosiale grupper.']
  },
  con_his_usikkerhet: {
    label: 'historisk usikkerhet',
    definition: 'Historisk usikkerhet er den erkjente begrensningen i hva kildene kan fastslå om hendelser, aktører, rekkefølge eller omfang, og må skilles fra fortidens åpne utfall.',
    broader_concepts: ['con_his_kildegrunnlag'],
    narrower_concepts: ['con_his_dateringsusikkerhet', 'con_his_tidsmessig_usikkerhet'],
    related_concepts: ['con_his_apne'],
    distinguish_from: ['con_his_apne'],
    common_misuse: ['Å bruke kildeusikkerhet som argument for at enhver historisk tolkning er like godt støttet.']
  },
  con_his_varighet: {
    label: 'historisk varighet',
    definition: 'Historisk varighet er hvor lenge en tilstand, praksis eller prosess består, målt med et eksplisitt start- og sluttgrunnlag og tilpasset den historiske skalaen.',
    broader_concepts: ['con_his_tid'],
    narrower_concepts: ['con_his_lang_varighet', 'con_his_historiske_rytmer'],
    related_concepts: ['con_his_endringstempo'],
    distinguish_from: ['con_his_kronologi'],
    common_misuse: ['Å sammenligne varighet mellom fenomener uten å bruke samme startkriterium, sluttkriterium eller tidsoppløsning.']
  }
};

const theoryLimitations = {
  theory_his_periodisering_epoker: [
    'En periodegrense kan gjøre intern variasjon og gradvise overganger usynlige dersom kriteriet ikke prøves mot lokale tidslinjer.',
    'En nasjonal eller lærebokbasert epoke kan ikke overføres til et sted før det er vist at de samme bruddene faktisk finnes i kildene der.'
  ],
  theory_his_brudd_kontinuitet: [
    'Synlige vedtak og dramatiske hendelser kan overvurdere bruddet dersom arbeidsmåter, eierskap eller hverdagspraksis fortsetter.',
    'Påstander om kontinuitet kan skjule at konsekvensene var svært ulike for grupper med forskjellig makt, kjønn, klasse eller juridisk status.'
  ],
  theory_his_tidslag_samtidighet: [
    'Varige bygg og materialer overlever oftere enn kortlivede praksiser og kan derfor dominere bildet av stedets tidslag.',
    'At flere lag finnes på samme sted i dag, viser ikke at de var i bruk samtidig eller hadde samme funksjon.'
  ],
  theory_his_lang_varighet_strukturer: [
    'Et langt tidsspenn kan jevne ut kriser, konflikter og aktørvalg som faktisk endret den historiske retningen.',
    'En påstått struktur krever sammenlignbare kilder gjennom tidsrommet; ellers kan varigheten være et produkt av ulik arkivdekning.'
  ],
  theory_his_hendelse_prosess: [
    'En korrekt kronologisk sekvens dokumenterer ikke alene at det første leddet forårsaket det neste.',
    'Start- og sluttpunkt kan være valgt i ettertid og må testes mot forutgående betingelser og virkninger som fortsetter utenfor avgrensningen.'
  ],
  theory_his_rytmer_tempo: [
    'Moderniseringsspråk kan gjøre raskere endring til mål på framskritt og skjule tap, motstand og reversering.',
    'Et samlet endringstempo kan ikke generaliseres når teknologi, institusjoner og hverdagsliv beveger seg ulikt mellom steder og grupper.'
  ],
  theory_his_erfaringsrom_forventningshorisont: [
    'Kilder om forventninger overrepresenterer ofte skriftføre, organiserte eller mektige aktører og kan ikke uten videre dekke hele befolkningen.',
    'Senere utfall må ikke projiseres tilbake som samtidige forventninger; alternative framtider må dokumenteres i kilder fra perioden.'
  ],
  theory_his_kronologi_datering: [
    'En dokumentdato kan vise registrering, kopiering eller publisering snarere enn tidspunktet da den beskrevne hendelsen fant sted.',
    'Relativ og omtrentlig datering kan ikke bære mer presise årsaks- eller samtidighetspåstander enn dateringsgrunnlaget tillater.'
  ],
  theory_his_anakronisme_begrepsbruk: [
    'Bare å bruke aktørenes egne ord kan gjenta samtidens ekskluderinger og skjule strukturer som krever et moderne analytisk språk.',
    'Moderne kategorier kan brukes sammenlignende bare når forskjellen mellom datidens og dagens betydning er eksplisitt dokumentert.'
  ],
  theory_his_samtid_ettertid_fortelling: [
    'Kilder nær hendelsen kan være ufullstendige, strategiske eller bundet av pågående juridiske og politiske konflikter.',
    'Et senere sluttpunkt kan skape narrativ lukking og få usikre alternativer til å framstå som en uunngåelig utvikling.'
  ]
};

const domainConcepts = concepts.filter((item) => A(item.domain_ids).includes('his_tid_periodisering'));
const expectedIds = Object.keys(conceptSpecs).sort();
const actualIds = domainConcepts.map((item) => item.concept_id).sort();
if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
  throw new Error(`Concept set mismatch\nExpected: ${expectedIds.join(',')}\nActual: ${actualIds.join(',')}`);
}

const rename = new Map();
for (const concept of domainConcepts) {
  const spec = conceptSpecs[concept.concept_id];
  if (concept.label !== spec.label) rename.set(concept.label, spec.label);
  Object.assign(concept, spec, {
    concept_type: 'analytical_concept',
    historical_scope: 'context_dependent',
    status: 'canonical_v5_5',
    curation_status: 'individually_curated',
    curation_domain: 'his_tid_periodisering',
    curated_at: '2026-07-25'
  });
}

for (const emne of emners) {
  for (const key of ['key_concepts', 'core_concepts', 'sub_concepts']) {
    if (!Array.isArray(emne[key])) continue;
    emne[key] = emne[key].map((value) => rename.get(value) ?? value);
  }
}

const domainTheories = theories.filter((item) => A(item.explanatory_scope).includes('his_tid_periodisering'));
if (domainTheories.length !== 10) throw new Error(`Expected 10 time theories, got ${domainTheories.length}`);
for (const theory of domainTheories) {
  const limitations = theoryLimitations[theory.theory_id];
  if (!limitations) throw new Error(`Missing theory limitations for ${theory.theory_id}`);
  theory.limitations = limitations;
  theory.curation_status = 'individually_curated';
  theory.curation_domain = 'his_tid_periodisering';
  theory.curated_at = '2026-07-25';
  theory.evidence_ready = false;
}

writeJson(conceptsPath, concepts);
writeJson(theoriesPath, theories);
writeJson(emnerPath, emners);

const validator = String.raw`#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const A = (value) => Array.isArray(value) ? value : [];
const domainId = 'his_tid_periodisering';
const concepts = JSON.parse(fs.readFileSync('data/fag/historie/concepts_historie_canonical_v5_5.json', 'utf8'));
const theories = JSON.parse(fs.readFileSync('data/fag/historie/theory_objects_historie_canonical_v5_5.json', 'utf8'));
const emners = JSON.parse(fs.readFileSync('data/fag/historie/emner_historie_canonical_v4_5.json', 'utf8'));
const expectedConceptIds = ${JSON.stringify(expectedIds)};
const forbiddenLabels = ${JSON.stringify([...rename.keys()])};
const genericDefinition = /^I .+ betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon som må dokumenteres gjennom kilder, tid, sted og aktører\.$/;
const genericMisuse = /^Å bruke «.+» som en tidløs etikett uten kilde, kronologi eller aktør\.$/;
const genericTheory = new Set(['Må brukes med eksplisitt tids-, steds- og kildeavgrensning.','Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.']);
const failures = [];
const pass = (condition, label) => condition ? console.log('PASS | ' + label) : failures.push(label);

const selectedConcepts = concepts.filter((item) => A(item.domain_ids).includes(domainId));
pass(selectedConcepts.length === 41, '41 domain concepts');
pass(JSON.stringify(selectedConcepts.map((item) => item.concept_id).sort()) === JSON.stringify(expectedConceptIds), 'concept id set');
for (const concept of selectedConcepts) {
  const relations = [...A(concept.broader_concepts), ...A(concept.narrower_concepts), ...A(concept.related_concepts), ...A(concept.distinguish_from)];
  pass(concept.curation_status === 'individually_curated', concept.concept_id + ': curated');
  pass(!genericDefinition.test(concept.definition || '') && String(concept.definition || '').length >= 80, concept.concept_id + ': specific definition');
  pass(relations.length >= 2, concept.concept_id + ': semantic relations');
  pass(A(concept.common_misuse).length >= 1 && !A(concept.common_misuse).every((item) => genericMisuse.test(item)), concept.concept_id + ': misuse guard');
  pass(A(concept.domain_ids).length >= 1 && A(concept.source_emne_ids).length >= 1, concept.concept_id + ': provenance');
}

const selectedTheories = theories.filter((item) => A(item.explanatory_scope).includes(domainId));
pass(selectedTheories.length === 10, '10 domain theories');
const signatures = new Set();
for (const theory of selectedTheories) {
  const signature = JSON.stringify(A(theory.limitations).slice().sort());
  signatures.add(signature);
  pass(theory.curation_status === 'individually_curated', theory.theory_id + ': curated');
  pass(A(theory.limitations).length >= 2 && A(theory.limitations).every((item) => !genericTheory.has(item)), theory.theory_id + ': specific limitations');
  pass(A(theory.method_links).length >= 1 && A(theory.thinker_ids).length >= 1 && Boolean(theory.source_hook_id), theory.theory_id + ': linked');
  pass(theory.evidence_ready === false, theory.theory_id + ': evidence gate');
}
pass(signatures.size === 10, 'unique theory limitation profiles');

for (const emne of emners) {
  for (const key of ['key_concepts', 'core_concepts', 'sub_concepts']) {
    const values = A(emne[key]);
    for (const oldLabel of forbiddenLabels) pass(!values.includes(oldLabel), emne.emne_id + ': no stale concept label ' + oldLabel);
  }
}

const globalRun = spawnSync(process.execPath, ['tools/validate-historie-v5.mjs', '--write'], { stdio: 'inherit' });
pass(globalRun.status === 0, 'global structural validator');
const readiness = JSON.parse(fs.readFileSync('reports/historie-v5/historie-v5-5-readiness.json', 'utf8'));
const domain = A(readiness.domains).find((item) => item.domain_id === domainId);
pass(Boolean(domain?.freeze_ready), 'time domain freeze ready');
pass(domain?.issue_counts?.concepts === 0 && domain?.issue_counts?.theories === 0 && domain?.issue_counts?.emner === 0, 'time domain zero quality gaps');
pass(readiness.v6_allowed === false, 'V6 remains blocked until all domains pass');
pass(readiness.quality_issue_totals.concepts <= 785, 'global concept queue reduced');
pass(readiness.quality_issue_totals.theories <= 190, 'global theory queue reduced');

const report = {
  version: 'historie-quality-freeze-v1',
  domain_id: domainId,
  status: failures.length ? 'FAIL' : 'PASS',
  concepts_curated: selectedConcepts.length,
  theories_curated: selectedTheories.length,
  remaining_global_quality_issues: readiness.quality_issue_totals,
  freeze_ready_domains: A(readiness.domains).filter((item) => item.freeze_ready).map((item) => item.domain_id),
  v6_allowed: readiness.v6_allowed,
  failures
};
fs.writeFileSync('reports/historie-v5/tid-periodisering-quality-freeze.json', JSON.stringify(report, null, 2) + '\n');
if (failures.length) {
  console.error('RESULT | ' + (selectedConcepts.length + selectedTheories.length) + ' objects checked, ' + failures.length + ' FAIL');
  for (const failure of failures) console.error('FAIL | ' + failure);
  process.exit(1);
}
console.log('RESULT | Historisk tid og periodisering is freeze-ready');
`;
fs.writeFileSync('tools/validate-historie-quality-tid-periodisering.mjs', validator);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
}

run(process.execPath, ['tools/validate-historie-quality-tid-periodisering.mjs']);
for (const target of ['grindheim_runestein', 'grindheim_steinkross', 'grindheimsveien_nord_gravfelt', 'hoyland_gravhaug_etne']) {
  run(process.execPath, ['scripts/build-quiz-production-context.mjs', '--category', 'historie', '--target', target, '--output', `data/quiz/production_context/historie/${target}.json`]);
}
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('git', ['diff', '--check']);

const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  const rule = `/${reportDir.replaceAll('\\', '/')}/`;
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Curate time and periodization quality freeze']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published curated time-domain quality freeze.');
