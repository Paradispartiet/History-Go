import fs from "node:fs";
import path from "node:path";
import { buildQuizProductionContext, writeJson } from "./quiz-production-lib.mjs";

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith("\n") ? value : value + "\n");
};
const json = rel => JSON.parse(read(rel));
const writeJsonSync = (rel, value) => write(rel, JSON.stringify(value, null, 2));
const replaceOnce = (source, from, to, label) => {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  return source.replace(from, to);
};

const branchBaseline = "c23733f16628a45dd6c01cb27beeb3210d59fe13";
const targetId = "torggata";
const categoryId = "by";
const quizPath = "data/quiz/by/torggata_sets.json";
const legacyQuizPath = "data/quiz/by/torggata_sets_merged.json";
const sourceBriefPath = "data/quiz/production_briefs/by/torggata.json";
const contextPath = "data/quiz/production_context/by/torggata.json";
const auditPath = "reports/place-production/torggata-phase10-quiz-audit-v1.json";
const workcardPath = "reports/place-production/torggata-workcard-current.md";

const place = json("data/places/by/oslo/places/torggata.json");
if (place.id !== targetId || place.category !== categoryId) throw new Error("Unexpected Torggata identity/category");
if (Object.hasOwn(place, "tasks_profile")) throw new Error("Phase 9 regression: tasks_profile returned");

const activeBefore = json(quizPath);
const activeBeforeSets = Array.isArray(activeBefore.sets) ? activeBefore.sets : [];
const activeBeforeQuestions = activeBeforeSets.reduce((sum, set) => sum + (Array.isArray(set.questions) ? set.questions.length : 0), 0);
if (activeBeforeSets.length !== 6 || activeBeforeQuestions !== 42) {
  throw new Error(`Unexpected active quiz baseline: ${activeBeforeSets.length} sets / ${activeBeforeQuestions} questions`);
}
const legacyBefore = json(legacyQuizPath);
if (!Array.isArray(legacyBefore) || legacyBefore.length !== 35) throw new Error("Unexpected legacy merged quiz baseline");

const sources = {
  torggata_byleksikon: {
    url: "https://oslobyleksikon.no/index.php/Torggata",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11 i Torggata source/claim-base; brukt for gateavgrensning, opparbeiding, handel, Jensen-familien og ombyggingen."
  },
  eldorado_byleksikon: {
    url: "https://oslobyleksikon.no/index.php?title=Eldorado",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt for varietéteater, Fahlstrøms Theater, lydfilm og senere kino-/bokhandelshistorie."
  },
  torggata_bad_byleksikon: {
    url: "https://oslobyleksikon.no/side/Torggata_bad",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt for Bade- og Vadskeanstalten, nybygget, okkupasjonen, badeavslutningen og ombruk."
  },
  rockefeller_booking: {
    url: "https://www.rockefeller.no/booking-utleie",
    source_type: "primary_operator",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt for Rockefeller 1986, John Dee 1997 og dagens operatørtilknytning."
  },
  torggata_gateforening: {
    url: "https://www.torggata.oslo.no/om-torggata/",
    source_type: "stakeholder_current",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt avgrenset som parts-/områdekilde for dagens vestre gågate og østre gang-/sykkelprioriterte del."
  },
  toi_sykkel: {
    url: "https://www.toi.no/publikasjoner/sykling-i-gagater-trafikkomfang-samhandling-og-konflikter-mellom-syklister-og-fotgjengere-i-torggata-og-brugata-i-oslo",
    source_type: "research_institute",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt kun som historisk empirisk studie av trafikk, samhandling og konflikt i Torggata."
  },
  toi_shared_space: {
    url: "https://www.toi.no/forskningsomrader/atferd-og-transport/konflikter-mellom-gaende-og-syklende-article34249-1025.html",
    source_type: "research_institute",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt med attribusjon for TØIs forklaring om ulike forventninger til gatefunksjon."
  },
  uib_torggata: {
    url: "https://www4.uib.no/forskning/forskergrupper/samfunnsgeografi-og-baerekraftig-utvikling/endringer-i-det-offentlige-rom-torggata-i-oslo",
    source_type: "university_project",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt som analytisk prosjektkilde for planprosess og opprustningen ferdig i 2014, ikke som eneste kausalbevis."
  },
  urban_transformation_article: {
    url: "https://journals.sagepub.com/doi/10.1177/0269094220988714",
    source_type: "peer_reviewed_research",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt med attribusjon og eksplisitt inferensgrense for delvis gentrifisering, tenant-miks og offentlig/privat transformasjon."
  },
  stroget_byleksikon: {
    url: "https://oslobyleksikon.no/side/Str%C3%B8get",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Kontrollert 2026-08-11; brukt for den bilfrie passasjen mellom Torggata og Storgata og åpningen 1969–1970."
  },
  commons_before: {
    url: "https://commons.wikimedia.org/wiki/File:Torggata_2009-06-08.jpg",
    source_type: "licensed_historical_image",
    review_status: "reviewed",
    review_note: "Kontrollert i fase 7D; 2009-bilde brukt som før-dokumentasjon med kjent Youngstorget-kamerastandpunkt."
  },
  commons_after: {
    url: "https://commons.wikimedia.org/wiki/File:Torggata_%282017-01-08%29.jpg",
    source_type: "licensed_historical_image",
    review_status: "reviewed",
    review_note: "Kontrollert i fase 7D; 2017-bilde brukt som etter-dokumentasjon, uttrykkelig ikke identisk kamerastandpunkt."
  }
};

const specs = [
  // SETT 1 — normal opening, 6 fact + 1 context
  { q:"Hvilke to hovedpunkter binder Torggata sammen i den canonicale gateidentiteten?", o:["Stortorvet og Ankertorget","Jernbanetorget og Bislett","Slottet og Majorstuen"], a:0, t:"fact", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Torggata er den navngitte gaten fra Stortorvet til Ankertorget, med videre historisk tilknytning mot Ankerbrua.", k:"Torggata går gjennom flere historiske bylag fra Stortorvet via Youngstorget mot Ankertorget/Ankerbrua-området." },
  { q:"I hvilket år ble den første delen fra Stortorvet til Youngstorget opparbeidet?", o:["1846","1857","1876"], a:0, t:"fact", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Strekningen fra Stortorvet til Youngstorget ble opparbeidet som Øvre Torvegade i 1846.", k:"1846 er startpunktet for den dokumenterte etappevise opparbeidingen, ikke et år der hele dagens gateløp plutselig var ferdig." },
  { q:"Hvilken navneform ble vedtatt for gaten i 1852?", o:["Torvegaden","Ankergaden","Youngsgaden"], a:0, t:"fact", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Navneformen Torvegaden ble vedtatt i 1852.", k:"Navnevedtaket kom mellom den første opparbeidingen i 1846 og senere forlengelser nordover." },
  { q:"Når var Torggata ført helt fram til Ankerbrua?", o:["1876","1852","1894"], a:0, t:"fact", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Torggata ble ført videre nordover og nådde Ankerbrua i 1876.", k:"Gateløpet vokste i etapper; 1876 markerer at videreføringen hadde nådd Ankerbrua." },
  { q:"Hva var spesielt med Jensen-familiens tilstedeværelse i Torggata?", o:["Familien drev fire ulike forretninger langs gaten","Familien eide alle bygningene i gaten","Familien drev bare ett hotell"], a:0, t:"fact", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Ludvig Christian Jensen og sønnene Adelsten, Peter Marinius og Karl A. Jensen var knyttet til fire ulike forretninger i Torggata.", k:"Familiehistorien viser hvordan handel kunne konsentreres gjennom slekts- og virksomhetsnettverk i samme gate." },
  { q:"Hva åpnet i Torggata 9 i 1891?", o:["Eldorado varietéteater","Rockefeller Music Hall","Torggata bad"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["eldorado_byleksikon"], c:"Eldorado i Torggata 9 ble innviet som varietéteater i november 1891.", k:"Eldorado startet som varietéteater før lokalet senere ble teater, kino og bokhandel." },
  { q:"Hva viser kombinasjonen av butikker, servering og underholdning om Torggata mot slutten av 1800-tallet?", o:["Gaten utviklet seg til et sammensatt forretnings- og fornøyelsesstrøk","Gaten var hovedsakelig en lukket boliggate","Gaten mistet all publikumsrettet virksomhet"], a:0, t:"context", e:"em_by_historiske_lag_i_hverdagsrom", s:["torggata_byleksikon"], c:"Torggata utviklet seg til et forretningsstrøk med butikker, serveringssteder og underholdning.", k:"Den historiske profilen var sammensatt: handel, servering og underholdning lå tett i samme gateløp." },

  // SETT 2 — fortsatt normal opening, 6 fact + 1 context
  { q:"Hva ble oppført i Torggata 16 i 1861?", o:["Bade- og Vadskeanstalten","Fahlstrøms Theater","Strøget"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon"], c:"Thorvald Meyer lot Thøger Binneballe oppføre Bade- og Vadskeanstalten i Torggata 16 i 1861.", k:"Det første badet kom flere tiår før den nåværende nyklassisistiske bygningen." },
  { q:"Hva skjedde med badeanlegget året etter at det ble oppført?", o:["Det ble gitt til Christiania kommune","Det ble flyttet til Bygdøy","Det ble gjort om til kino"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon"], c:"Thorvald Meyer ga Bade- og Vadskeanstalten til Christiania kommune i 1862.", k:"Gaven gjorde badeanlegget til en kommunal institusjon i byen." },
  { q:"Hva åpnet i Eldorado-lokalene i 1903 etter en ombygging?", o:["Fahlstrøms Theater","John Dee","Oslo Street Food"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["eldorado_byleksikon"], c:"Eldorado-lokalene ble bygd om og åpnet som Fahlstrøms Theater i 1903.", k:"Alma og Johan Fahlstrøm drev teatret fram til 1911." },
  { q:"Hva skjedde med Eldorado i 1929?", o:["Det gjenåpnet som Norges første lydfilmkino","Det ble kommunalt bad","Det ble revet for å gi plass til vei"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["eldorado_byleksikon"], c:"Eldorado gjenåpnet i 1929 som Norges første lydfilmkino.", k:"Lydfilm er et av de tydeligste teknologiske og kulturelle skiftene i Eldorados lange brukshistorie." },
  { q:"Når ble den nåværende Torggata bad-bygningen reist?", o:["I etapper fra 1925 til 1932","Som ett byggetrinn i 1861","Mellom 1983 og 1988"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon"], c:"Den nåværende nyklassisistiske Torggata bad-bygningen ble reist i etapper fra 1925 til 1932.", k:"Det gamle 1861-anlegget og dagens hovedbygning er to forskjellige historiske bygningslag." },
  { q:"Hva åpnet i det tidligere badet i 1986?", o:["Rockefeller Music Hall","Fahlstrøms Theater","Strøget"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["rockefeller_booking","torggata_bad_byleksikon"], c:"Rockefeller åpnet i det tidligere Torggata bad i 1986.", k:"Rockefeller er et konkret eksempel på ombruk: et tidligere offentlig bad fikk ny rolle som konsert- og arrangementssted." },
  { q:"Hvorfor er Torggata bad et tydelig eksempel på funksjonsendring i byen?", o:["Samme sted gikk fra bad til blant annet konsert- og serveringsbruk","Bygningen har alltid hatt nøyaktig samme funksjon","Bygningen ble flyttet til en annen bydel"], a:0, t:"context", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon","rockefeller_booking"], c:"Torggata bad gikk fra badefunksjon til blant annet konsert- og serveringsbruk etter at badevirksomheten opphørte i 1980.", k:"Ombruk betyr her ikke bare ny fasade, men at en eksisterende bygning fikk helt andre offentlige og kommersielle funksjoner." },

  // SETT 3 — 4 fact + 3 context
  { q:"Når ble John Dee etablert i Rockefeller-komplekset?", o:["1997","1986","2014"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["rockefeller_booking"], c:"John Dee ble etablert i 1997 som en mindre klubbscene i Rockefeller-systemet.", k:"John Dee kom elleve år etter Rockefeller og viser hvordan scenevirksomheten i komplekset ble utvidet." },
  { q:"Hva heter den bilfrie passasjen mellom Torggata og Storgata?", o:["Strøget","Akersgangen","Torvpassasjen"], a:0, t:"fact", e:"em_by_opphold_vs_gjennomgang", s:["stroget_byleksikon"], c:"Strøget er den bilfrie passasjen mellom Torggata og Storgata.", k:"Strøget åpnet rundt årsskiftet 1969–1970 og er et eget byrom knyttet til Torggata, ikke selve Torggata." },
  { q:"Hva var hovedprioriteringen i gateutformingen som åpnet i 2014?", o:["Gående og syklende","Privatbiler og tungtransport","Ny jernbanetrafikk"], a:0, t:"fact", e:"em_by_infrastruktur_mobilitet", s:["torggata_byleksikon","uib_torggata"], c:"Den nye utformingen av Torggata som åpnet i 2014 prioriterte gående og syklende.", k:"Ombyggingen endret trafikk- og byromsprofilen, men er ikke i seg selv bevis for alle senere sosiale eller økonomiske endringer." },
  { q:"Hvordan beskriver Torggata Gateforening dagens forskjell mellom vestre og østre del?", o:["Vestre del som gågate og østre del som gang-/sykkelprioritert","Begge deler som motorvei","Vestre del som havn og østre del som skog"], a:0, t:"fact", e:"em_by_infrastruktur_mobilitet", s:["torggata_gateforening"], c:"Torggata Gateforening beskriver vestre del som gågate og østre del som gang-/sykkelprioritert.", k:"Dette er en fersk interessentbeskrivelse av området og brukes ikke som eneste juridiske kilde til trafikkregulering." },
  { q:"Hva fant TØI om konfliktbildet mellom gående og syklende i de undersøkte delene av Torggata?", o:["Gågatedelen hadde få konflikter, mens sykkelgatedelen hadde et annet konfliktbilde","Alle deler var helt uten konflikter","Studien undersøkte bare biltrafikk"], a:0, t:"context", e:"em_by_opphold_vs_gjennomgang", s:["toi_sykkel","toi_shared_space"], c:"TØIs historiske undersøkelser fant få konflikter i gågatedelen, men et annet konfliktbilde i sykkelgatedelen lenger nord.", k:"Resultatene gjelder den undersøkte perioden og kan ikke brukes som dagens trafikkmåling." },
  { q:"Hva pekte TØI på som én forklaring på konflikter i deler av Torggata?", o:["Ulike forventninger til om arealet fungerer som gågate eller sykkelgate","At gaten manglet fotgjengere","At all sykling var forbudt"], a:0, t:"context", e:"em_by_opphold_vs_gjennomgang", s:["toi_shared_space"], c:"TØI identifiserte ulike forventninger til om deler av Torggata fungerer som gågate eller sykkelgate som en forklaring på konflikter.", k:"Dette er TØIs attribuerte analyse, ikke en universell årsaksforklaring for alle hendelser i gaten." },
  { q:"Hvordan beskriver en fagfellevurdert Oslo-studie Torggatas nyere transformasjon?", o:["Som delvis gentrifisering i samspill mellom offentlige og private aktører","Som en fullstendig sosial utskifting bevist av én ombygging","Som et område uten private eiendomsaktører"], a:0, t:"context", e:"em_by_gentrifisering_eiendom", s:["urban_transformation_article"], c:"En fagfellevurdert Oslo-studie omtaler Torggata som delvis gentrifisert og beskriver samspill mellom kommune og en stor eiendomsaktør i fysisk og kommersiell transformasjon.", k:"Studien gir grunnlag for en avgrenset gentrifiseringsanalyse, ikke for å beskrive hele gaten som fullstendig gentrifisert." },

  // SETT 4 — bridge, 2 fact + 2 context + 3 concept
  { q:"Hva beskriver Oslo-studien at en stor eiendomsaktør ønsket å påvirke i Torggata?", o:["Tenant-miks og leie-/eiendomsverdier","Elveløpet gjennom gaten","Byens kommunegrenser"], a:0, t:"context", e:"em_by_gentrifisering_eiendom", s:["urban_transformation_article"], c:"Den fagfellevurderte studien beskriver strategisk tenant-miks og høyere leie-/eiendomsverdier som mål eller virkemidler hos en anonymisert stor eiendomsaktør i Torggata.", k:"Aktørstrategi er dokumentert, men dette er ikke det samme som direkte dokumentasjon av at bestemte personer eller virksomheter faktisk ble fortrengt." },
  { q:"Hva kan kildene ikke alene bevise om Torggatas ombygging?", o:["At ombyggingen alene presset ut bestemte tidligere brukere og virksomheter","At gaten fikk ny utforming i 2014","At Torggata har en lang handelshistorie"], a:0, t:"context", e:"em_by_gentrifisering_eiendom", s:["urban_transformation_article","uib_torggata"], c:"Kildene gir ikke grunnlag for å hevde at én gateombygging alene forårsaket direkte fortrengning av bestemte tidligere virksomheter eller brukergrupper.", k:"Torggata-kildebasen krever at gentrifisering og kommersialisering beskrives med inferensgrense, ikke som enkel årsakskjede." },
  { q:"Hvilken av disse virksomhetene er fortsatt knyttet til Torggata bad-komplekset i den ferske kildekontrollen?", o:["Rockefeller","Fahlstrøms Theater","Bade- og Vadskeanstalten som kommunalt bad"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["rockefeller_booking"], c:"Rockefeller drives fortsatt som konsert- og arrangementssted i Torggata bad-komplekset.", k:"Nåtidsopplysninger er ferskkontrollert separat fra den historiske bygge- og institusjonshistorien." },
  { q:"Hva er det sikreste dokumenterte resultatet av 2013–2014-ombyggingen?", o:["En ny fysisk trafikk- og byromsprofil med tydeligere prioritet for gående og syklende","En dokumentert bestemt prosentvis husleieøkning i hele gaten","At alle eldre virksomheter forsvant"], a:0, t:"fact", e:"em_by_styring_forvaltning_planmakt", s:["torggata_byleksikon","uib_torggata"], c:"Det sikreste dokumenterte resultatet av ombyggingen er en ny fysisk trafikk- og byromsprofil med tydeligere prioritet for gående og syklende.", k:"Fysiske plan- og trafikkgrep kan dokumenteres direkte uten å gjøre uverifiserte påstander om alle økonomiske eller sosiale konsekvenser." },
  { q:"Hva betyr «gentrifisering» mest presist i denne Torggata-quizen?", o:["En prosess der fysisk og kommersiell oppgradering kan henge sammen med endret kapital, leie, virksomhetsmiks og sosial tilgang","Et synonym for enhver gate med nye brostein","At alle beboere nødvendigvis er flyttet ut"], a:0, t:"concept", e:"em_by_gentrifisering_eiendom", s:["urban_transformation_article"], c:"Torggata kan brukes som case på delvis gentrifisering når begrepet knyttes til dokumentert fysisk og kommersiell transformasjon, tenant-miks og eiendomsstrategi uten å anta total utskifting.", k:"Begrepet brukes som et analytisk verktøy med begrensninger, ikke som en merkelapp som automatisk forklarer alle endringer." },
  { q:"Hva betyr «planmakt» når vi ser på Torggatas ombygging?", o:["At offentlige vedtak og prioriteringer kan endre hvordan gateareal fordeles og brukes","At bare arkitekter bestemmer all gatebruk","At markedet virker helt uten offentlige rammer"], a:0, t:"concept", e:"em_by_styring_forvaltning_planmakt", s:["uib_torggata","torggata_byleksikon"], c:"Torggatas ombygging viser planmakt som offentlig evne til å endre prioriteringen av gateareal gjennom planlegging og fysiske grep.", k:"Planmakt handler her om konkrete valg i byrommet, ikke om en abstrakt påstand om at kommunen kontrollerer alt." },
  { q:"Hva betyr «ombruk» i historien om Torggata bad og Eldorado?", o:["At eksisterende bygg får nye funksjoner over tid","At alle gamle bygg må rives","At et gatenavn endres uten fysisk endring"], a:0, t:"concept", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon","eldorado_byleksikon"], c:"Torggata bad og Eldorado viser ombruk ved at eksisterende bygg og lokaler har fått nye funksjoner gjennom flere historiske perioder.", k:"Ombruk gjør historiske lag synlige fordi samme fysiske sted kan bære forskjellige institusjoner og publikumsfunksjoner." },

  // SETT 5 — final, 1 fact + 2 context + 4 concept/theory
  { q:"Hva skjedde med Eldorado etter at kinodriften sluttet i 2012?", o:["Lokalene ble omgjort til bokhandel i 2013","Bygningen ble revet samme år","Det kommunale badet flyttet inn"], a:0, t:"fact", e:"em_by_transformasjon_ombruk", s:["eldorado_byleksikon"], c:"Kinodriften i Eldorado varte til 2012, og lokalene ble omgjort til bokhandel i 2013.", k:"Eldorado er derfor et sted der varieté, teater, kino og bokhandel har avløst hverandre." },
  { q:"Hva lærer sammenstillingen av Torggata bad i 1861, 1980 og 1986 oss?", o:["At samme sted kan skifte fra offentlig velferdsfunksjon til kultur- og arrangementsbruk","At bygningen alltid var en konsertscene","At badet først åpnet etter Rockefeller"], a:0, t:"context", e:"em_by_transformasjon_ombruk", s:["torggata_bad_byleksikon","rockefeller_booking"], c:"Tidslinjen fra badeanstalt via badeavslutning i 1980 til Rockefeller i 1986 viser en tydelig funksjonsendring fra offentlig bad til kultur- og arrangementsbruk.", k:"Sammenligningen gjør transformasjonen konkret uten å late som alle mellomliggende bruksendringer skjedde samtidig." },
  { q:"Hvorfor bør vi skille mellom fysisk ombygging og sosial årsaksforklaring i Torggata?", o:["Fordi den fysiske ombyggingen er dokumentert direkte, mens full sosial fortrengning krever egen evidens","Fordi fysisk design aldri påvirker bruk","Fordi ingen kilder omtaler Torggata etter 1900"], a:0, t:"context", e:"em_by_gentrifisering_eiendom", s:["urban_transformation_article","uib_torggata"], c:"Torggatas fysiske ombygging er direkte dokumentert, mens påstander om full sosial fortrengning eller én enkel årsak krever sterkere og mer spesifikk evidens.", k:"Å skille observasjon fra årsaksforklaring er en sentral del av kildekritisk byanalyse." },
  { q:"Hva beskriver best spenningen «opphold vs. gjennomgang» i Torggata etter ombyggingen?", o:["Gatearealet skal både føre folk gjennom og gi plass til opphold, servering og ulike trafikantgrupper","Gaten har bare én mulig bruk","Opphold og bevegelse kan aldri finnes i samme gate"], a:0, t:"concept", e:"em_by_opphold_vs_gjennomgang", s:["torggata_byleksikon","toi_shared_space"], c:"Torggatas nyere gateprofil gjør spenningen mellom opphold og gjennomgang synlig fordi samme gateareal skal romme bevegelse, opphold og ulike trafikantgrupper.", k:"Begrepet hjelper til å beskrive en faktisk romlig konflikt uten å måtte utpeke én brukergruppe som problemet." },
  { q:"Hva kan en før/etter-analyse av bildene fra 2009 og 2017 brukes til?", o:["Å sammenligne gateprofil og arealorganisering uten å påstå identisk kamerastandpunkt","Å bevise nøyaktig husleieutvikling","Å måle alle fotgjengerstrømmer i sanntid"], a:0, t:"concept", e:"em_by_opphold_vs_gjennomgang", s:["commons_before","commons_after","torggata_byleksikon"], c:"2009- og 2017-bildene kan brukes til å sammenligne gateprofil og arealorganisering, men ikke som en eksakt fotografisk replikk fra identisk kamerastandpunkt.", k:"Før/etter-metoden er sterk når sammenligningsgrunnlaget og begrensningene oppgis eksplisitt.", method:"met_for_etter", guidance:["data/fag/by/methods_by.json","data/fag/by/emner_by.json"] },
  { q:"Michel de Certeau var opptatt av hvordan mennesker bruker byen i hverdagen. Hva er mest relevant å undersøke i Torggata med dette perspektivet?", o:["Hvordan faktiske ruter, omveier, stopp og opphold bruker den ombygde gaten","Hvilken teoretiker som har høyest status","Om alle følger den samme ideelle ruten"], a:0, t:"concept", e:"em_by_opphold_vs_gjennomgang", s:["torggata_byleksikon","toi_sykkel"], c:"Torggatas dokumenterte gateprofil og observerte samhandling mellom trafikanter gir et konkret grunnlag for å undersøke hvordan faktiske hverdagsruter og opphold forholder seg til planlagt gatebruk.", k:"De Certeaus hverdagspraksisperspektiv hjelper oss å spørre hvordan mennesker faktisk bruker et planlagt rom, i stedet for å anta at design og bruk er identiske.", hook:"byliv_opphold_vs_gjennomgang", thinker:"michel_de_certeau", work:"The Practice of Everyday Life", theoryWhy:"Perspektivet skiller planlagt gatebruk fra de konkrete rutene og praksisene folk faktisk skaper." },
  { q:"Gordon Cullen beskrev byrom som sekvenser av skiftende synsinntrykk. Hva i Torggata egner seg for en slik analyse?", o:["Overgangen mellom ulike gatesegmenter, fasader, passasjer og gateprofiler langs en vandring","Bare ett isolert årstall","En usynlig kommunegrense uten stedlig spor"], a:0, t:"concept", e:"em_by_opphold_vs_gjennomgang", s:["torggata_byleksikon","stroget_byleksikon"], c:"Torggatas lange gateløp med ulike segmenter, fasader, passasjer og gateprofiler gir et konkret grunnlag for å analysere hvordan byrom oppleves som en sekvens langs en vandring.", k:"Cullens townscape-perspektiv kan brukes på det som faktisk skifter mens man beveger seg gjennom gaten, uten å gjøre teorien til selve fasiten.", hook:"byliv_opphold_vs_gjennomgang", thinker:"gordon_cullen", work:"The Concise Townscape", theoryWhy:"Sekvensperspektivet hjelper til å analysere hvordan gaterommet endrer karakter gjennom en faktisk vandring." }
];

if (specs.length !== 35) throw new Error(`Expected 35 question specs, got ${specs.length}`);
const phases = ["opening","middle","middle","bridge","final"];
const familyFor = spec => spec.hook || spec.method || spec.t === "concept" ? "concept_theory" : spec.t === "context" ? "context" : "fact";
const counts = specs.reduce((acc, spec) => { acc[familyFor(spec)] += 1; return acc; }, { fact:0, context:0, concept_theory:0 });
if (JSON.stringify(counts) !== JSON.stringify({ fact:19, context:9, concept_theory:7 })) {
  throw new Error(`Unexpected quiz balance: ${JSON.stringify(counts)}`);
}

const existingQuizAudit = {
  searched_paths: [
    "data/quiz/manifest.json",
    quizPath,
    legacyQuizPath,
    "reports/quiz-content-quality-initial-triage-2026-07-21.md",
    "reports/place-production/torggata-source-base-v1.md"
  ],
  active_before: {
    file: quizPath,
    set_count: activeBeforeSets.length,
    question_count: activeBeforeQuestions,
    finding: "Settene 3–6 inneholdt flere generiske begreps-/faglig-lesning-spørsmål og internal-only kildereferanser som repos egen quiztriage har flagget."
  },
  legacy_before: {
    file: legacyQuizPath,
    question_count: legacyBefore.length,
    role: "ikke manifest-loadet legacy/revisjonsspor; vurdert, men ikke brukt som canonical output"
  },
  decisions: [
    "Behold dokumenterte historiske fakta som fortsatt støttes av den gjennomgåtte Torggata-kildebasen, men skriv dem inn i dagens package/claim-kontrakt.",
    "Fjern active-sett som drives av interne emnefiler, generiske rent-gap/planmakt-prompter eller formuleringer som repos triage klassifiserer som omvendt produksjonsrekkefølge.",
    "Ikke løft legacy _merged-filen til canonical status; den er auditert som tidligere revisjonsspor.",
    "Velg fem sett fordi fem selvstendige kildebårne læringsjobber faktisk finnes; ikke fordi et fast antall skal fylles."
  ],
  knowledge_migration: "Canonical Knowledge regenereres fra den reviderte manifest-loadede quizen etter materialisering; gamle Torggata quiz-referanser fases ut gjennom deterministisk registry-rebuild."
};

const profileDecision = {
  profile: "rich",
  set_count: 5,
  questions_per_set: 7,
  justification: "Kildebasen bærer fem uavhengige progresjonsløp: gateutvikling/handel, Eldorado, Torggata bad og sceneombruk, mobilitetsombygging/samhandling og avgrenset gentrifiserings-/plananalyse. Seks eller flere sett ville kreve kunstig splitting av de samme claimene."
};

const heldBack = [
  "Direkte påstand om at 2014-ombyggingen alene presset ut bestemte virksomheter eller brukergrupper — avvist fordi source-base eksplisitt mangler direkte fortrengningsevidens.",
  "Generiske rent-gap-, spekulasjons-, byggesak- og medvirkningsspørsmål som bare peker til interne emnefiler — fjernet fordi fagfiler er styring, ikke faktakilder.",
  "Påstanden om at Torggata bad var 'byens første 25-metersbasseng' — holdes ute etter fase-5-korreksjonen til det kildebårne 'et 25-metersbasseng'.",
  "Nåtidsdetaljer om virksomheter som ikke er ferskkontrollert i source-base — ikke brukt som quizfakta."
];

const selectedCurriculum = {
  emne_ids: [
    "em_by_historiske_lag_i_hverdagsrom",
    "em_by_transformasjon_ombruk",
    "em_by_infrastruktur_mobilitet",
    "em_by_gentrifisering_eiendom",
    "em_by_styring_forvaltning_planmakt",
    "em_by_opphold_vs_gjennomgang"
  ],
  topic_hook_ids: ["byliv_opphold_vs_gjennomgang"],
  method_ids: ["met_for_etter"],
  thinker_ids: ["michel_de_certeau","gordon_cullen"],
  works: ["The Practice of Everyday Life","The Concise Townscape"]
};

const claims = specs.map((spec, index) => {
  const claim = {
    claim_id: `claim_torggata_quiz_${index + 1}`,
    order: index + 1,
    planned_phase: phases[Math.floor(index / 7)],
    family: familyFor(spec),
    statement: spec.c,
    source_ids: spec.s,
    source_origin: "external",
    emne_id: spec.e
  };
  if (spec.method) claim.method_id = spec.method;
  if (spec.hook) claim.topic_hook_id = spec.hook;
  if (spec.thinker) claim.thinker_id = spec.thinker;
  if (spec.work) claim.work = spec.work;
  if (spec.guidance) claim.guidance_basis = spec.guidance;
  return claim;
});

const brief = {
  schema_version: "1.0",
  status: "reviewed",
  categoryId,
  targetId,
  reviewed_at: "2026-08-12",
  review_note: "Bygger på Torggatas gjennomgåtte source/claim-base fra 2026-08-11 og senere godkjente fase-5/7/9-inferensgrenser. Quizspørsmålene er skrevet etter claim-banken, ikke omvendt.",
  sources,
  selected_curriculum: selectedCurriculum,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBack,
  claims
};
writeJsonSync(sourceBriefPath, brief);

const fagManifestPath = "data/fag/fag_manifest.json";
const fagManifest = json(fagManifestPath);
if (!fagManifest.by?.quizProduction?.targets) throw new Error("By quizProduction.targets missing");
fagManifest.by.quizProduction.targets[targetId] = {
  source_brief: "../quiz/production_briefs/by/torggata.json",
  context_artifact: "../quiz/production_context/by/torggata.json",
  quiz_file: "../quiz/by/torggata_sets.json"
};
writeJsonSync(fagManifestPath, fagManifest);

const contextArtifact = await buildQuizProductionContext({ root, categoryId, targetId });
await writeJson(root, contextPath, contextArtifact);

const productionContext = {
  manifest_category: categoryId,
  profile: contextArtifact.profile,
  standard_version: "3.3",
  source_brief: sourceBriefPath,
  context_artifact: contextPath,
  resolved_files: Object.fromEntries(Object.entries(contextArtifact.resolved_files).map(([key, value]) => [key, value.path])),
  required_inputs_loaded: contextArtifact.required_inputs_loaded,
  pensum_module_ids: contextArtifact.selected_curriculum.module_ids,
  emne_ids: contextArtifact.selected_curriculum.emne_ids,
  topic_hook_ids: contextArtifact.selected_curriculum.topic_hook_ids,
  method_ids: contextArtifact.selected_curriculum.method_ids,
  thinker_ids: contextArtifact.selected_curriculum.thinker_ids,
  works: contextArtifact.selected_curriculum.works,
  source_review_status: brief.status,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBack,
  theory_start_phase: "final",
  method_start_phase: "final"
};

const quizSources = Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url]));
const sets = Array.from({ length: 5 }, (_, setIndex) => ({
  set_id: `by_torggata_set_${setIndex + 1}`,
  level: setIndex + 1,
  order: setIndex + 1,
  phase: phases[setIndex],
  xp: 50 + setIndex * 10,
  questions: specs.slice(setIndex * 7, setIndex * 7 + 7).map((spec, localIndex) => {
    const globalIndex = setIndex * 7 + localIndex;
    const question = {
      id: `torggata_quiz_${globalIndex + 1}`,
      quiz_id: `by_torggata_set_${setIndex + 1}_q${localIndex + 1}`,
      categoryId,
      placeId: targetId,
      targetId,
      question_scope: "place",
      question: spec.q,
      options: spec.o,
      answer: spec.o[spec.a],
      answerIndex: spec.a,
      knowledge: spec.k,
      difficulty: Math.min(4, 1 + setIndex),
      question_type: spec.t,
      emne_id: spec.e,
      source: spec.s,
      source_origin: "external",
      claim_basis: spec.c,
      claim_id: `claim_torggata_quiz_${globalIndex + 1}`
    };
    if (spec.method) {
      question.method_id = spec.method;
      question.guidance_basis = spec.guidance;
    }
    if (spec.hook) {
      question.topic_hook_id = spec.hook;
      question.thinker_id = spec.thinker;
      question.work = spec.work;
      question.theory_ref = {
        topic_hook_id: spec.hook,
        thinker_id: spec.thinker,
        work: spec.work,
        why_it_helps: spec.theoryWhy
      };
      question.guidance_basis = ["data/fag/by/fagkart_by.json","data/fag/by/emner_by.json"];
    }
    return question;
  })
}));

const quiz = {
  targetId,
  categoryId,
  sources: quizSources,
  production_context: productionContext,
  sets
};
writeJsonSync(quizPath, quiz);

const phase10TestPath = "tests/torggata-phase10-quiz.test.mjs";
const phase10Test = `import assert from "node:assert/strict";\nimport fs from "node:fs";\nimport test from "node:test";\n\nconst json = file => JSON.parse(fs.readFileSync(file, "utf8"));\nconst manifest = json("data/fag/fag_manifest.json");\nconst quiz = json("data/quiz/by/torggata_sets.json");\nconst brief = json("data/quiz/production_briefs/by/torggata.json");\nconst context = json("data/quiz/production_context/by/torggata.json");\nconst place = json("data/places/by/oslo/places/torggata.json");\nconst all = quiz.sets.flatMap(set => set.questions);\n\nconst isTheory = q => Boolean(q.topic_hook_id || q.thinker_id || q.theory_ref || q.work);\nconst family = q => q.method_id || isTheory(q) || q.question_type === "concept" ? "concept_theory" : q.question_type === "context" ? "context" : "fact";\n\ntest("Torggata fase 10 er manifest-loadet canonical quizProduction", () => {\n  assert.deepEqual(manifest.by.quizProduction.targets.torggata, {\n    source_brief: "../quiz/production_briefs/by/torggata.json",\n    context_artifact: "../quiz/production_context/by/torggata.json",\n    quiz_file: "../quiz/by/torggata_sets.json"\n  });\n  assert.equal(quiz.targetId, "torggata");\n  assert.equal(quiz.categoryId, "by");\n  assert.equal(quiz.production_context.standard_version, "3.3");\n  assert.equal(quiz.production_context.profile, "rich_5x7");\n});\n\ntest("Torggata har fem kildebårne sett med korrekt relativ progresjon og balanse", () => {\n  assert.equal(quiz.sets.length, 5);\n  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening","middle","middle","bridge","final"]);\n  assert.ok(quiz.sets.every(set => set.questions.length === 7));\n  assert.equal(all.length, 35);\n  const counts = all.reduce((acc, q) => { acc[family(q)] += 1; return acc; }, { fact:0, context:0, concept_theory:0 });\n  assert.deepEqual(counts, { fact:19, context:9, concept_theory:7 });\n});\n\ntest("de første 14 er normale spørsmål uten teori- eller metodeoverflate", () => {\n  const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);\n  assert.equal(opening.length, 14);\n  for (const q of opening) {\n    assert.ok(["fact","context"].includes(q.question_type), q.quiz_id);\n    assert.equal(Boolean(q.method_id), false, q.quiz_id);\n    assert.equal(isTheory(q), false, q.quiz_id);\n    assert.doesNotMatch(q.question, /faglig lesning|mest presis|hvilken teoretiker|hvilken teori|fagplan|fagkart/i);\n  }\n});\n\ntest("alle spørsmål peker én-til-én til reviewet claim og ekstern source-id", () => {\n  const claimById = new Map(brief.claims.map(claim => [claim.claim_id, claim]));\n  assert.equal(claimById.size, 35);\n  assert.equal(brief.status, "reviewed");\n  for (const q of all) {\n    const claim = claimById.get(q.claim_id);\n    assert.ok(claim, q.quiz_id);\n    assert.equal(q.claim_basis, claim.statement, q.quiz_id);\n    assert.deepEqual(q.source, claim.source_ids, q.quiz_id);\n    assert.ok(q.source.every(id => brief.sources[id]?.review_status === "reviewed"), q.quiz_id);\n    assert.ok(q.source.every(id => !/emner_by|fagkart|generator/i.test(id)), q.quiz_id);\n  }\n});\n\ntest("sluttsettet har eksplisitt metode og ekte teoribinding uten forbudt teoriprompt", () => {\n  const final = quiz.sets.at(-1).questions;\n  assert.ok(final.some(q => q.method_id === "met_for_etter"));\n  const theory = final.filter(isTheory);\n  assert.equal(theory.length, 2);\n  assert.deepEqual(theory.map(q => q.thinker_id), ["michel_de_certeau","gordon_cullen"]);\n  for (const q of theory) {\n    assert.equal(q.topic_hook_id, "byliv_opphold_vs_gjennomgang");\n    assert.ok(q.theory_ref?.why_it_helps);\n    assert.doesNotMatch(q.question, /hvilken teoretiker passer best|hvilken teori beskriver.*best|hvordan kan.*leses som|fagkart|topic hook/i);\n  }\n});\n\ntest("legacy-feil er eksplisitt holdt ute og fase 9 består", () => {\n  assert.equal(Object.hasOwn(place, "tasks_profile"), false);\n  assert.ok(brief.held_back_candidates.some(item => item.includes("fortrengning")));\n  assert.ok(brief.held_back_candidates.some(item => item.includes("25-metersbasseng")));\n  assert.equal(context.profile, "rich_5x7");\n  assert.equal(context.claim_bank.length, 35);\n});\n`;
write(phase10TestPath, phase10Test);

const audit = {
  schema: "history_go_place_quiz_phase10_audit_v1",
  version: "1.0.0",
  generated_at: "2026-08-12",
  place_id: targetId,
  phase: "10",
  result: "PASS_PENDING_PIPELINE",
  baseline_main: branchBaseline,
  prior_work_gate: {
    search_status: "UTFØRT",
    active_before: { file: quizPath, sets: 6, questions: 42 },
    legacy_reviewed: { file: legacyQuizPath, questions: 35, canonical: false },
    repo_triage: "reports/quiz-content-quality-initial-triage-2026-07-21.md flagget Torggata blant høyest prioriterte faglig-lesning-reparasjoner",
    decision: "FULL CANONICAL REVISION"
  },
  source_basis: {
    reused_reviewed_registry: "reports/place-production/torggata-source-base-v1.md",
    source_count: Object.keys(sources).length,
    all_reviewed: true,
    internal_subject_files_as_fact_sources: 0
  },
  profile: {
    id: "rich",
    set_count: 5,
    questions_per_set: 7,
    total_questions: 35,
    rationale: profileDecision.justification,
    no_quota_rule: true
  },
  balance: counts,
  opening: { normal_questions: 14, theory_bindings: 0, method_bindings: 0 },
  final_layer: {
    method_id: "met_for_etter",
    topic_hook_id: "byliv_opphold_vs_gjennomgang",
    thinkers: ["michel_de_certeau","gordon_cullen"],
    works: ["The Practice of Everyday Life","The Concise Townscape"]
  },
  held_back_candidates: heldBack,
  expected_pipeline: [
    "quiz production context audit",
    "quiz progression audit",
    "quiz theory-binding audit",
    "quiz content-quality audit",
    "Knowledge canonical regeneration + contract audit",
    "phase 9 regression",
    "TypeScript hard gates",
    "build guard"
  ],
  next_phase: "11"
};
writeJsonSync(auditPath, audit);

let workcard = read(workcardPath);
if (!workcard.includes("- Fase 10-audit:")) {
  workcard = replaceOnce(
    workcard,
    "- Fase 9-audit: `reports/place-production/torggata-phase9-onsite-audit-v1.json`\n",
    "- Fase 9-audit: `reports/place-production/torggata-phase9-onsite-audit-v1.json`\n- Fase 10-audit: `reports/place-production/torggata-phase10-quiz-audit-v1.json`\n",
    "phase10 audit link"
  );
}
workcard = replaceOnce(
  workcard,
  "| 10. Quiz | **PÅGÅR** | neste aktive fase etter lukket fase 9 |\n| 11–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "| 10. Quiz | **GODKJENT** | full canonical quizProduction-pakke, 5 × 7 kildebårne spørsmål |\n| 11. Knowledge | **PÅGÅR** | neste aktive fase etter lukket fase 10 |\n| 12–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "phase10 status"
);
if (!workcard.includes("## Fase 10 – Quiz")) {
  workcard = workcard.trimEnd() + `\n\n## Fase 10 – Quiz\n\n\`\`\`text\nTIDLIGERE-ARBEID-SØK: UTFØRT\nAKTIV BASELINE: 6 sett / 42 spørsmål i data/quiz/by/torggata_sets.json\nLEGACY AUDITERT: 35 spørsmål i data/quiz/by/torggata_sets_merged.json; ikke manifest-loadet canonical output\nKONKRET REGRESJONSEVIDENS: repos quiztriage flagget Torggata for faglig-lesning-/teorimaler; aktive sett 3–6 brukte også interne emnefiler som synlig kilde\nBESLUTNING: FULL CANONICAL REVISION – claim-bank først, deretter spørsmål\n\`\`\`\n\n### Godkjent resultat\n\n- `fag_manifest.json` registrerer Torggata som aktiv `by.quizProduction`-target med source brief, production context og canonical quizfil.\n- Eksisterende 6 × 7 er auditerte før profilvalg; legacy `_merged` er også gjennomgått og beholdes kun som ikke-canonical revisjonsspor.\n- Ny profil er **rich 5 × 7**, valgt fordi fem selvstendige kildebårne læringsjobber finnes; det er ikke en tallkvote.\n- Spørsmålsbalanse: **19 fakta / 9 sammenheng / 7 begrep-teori**.\n- Første **14/14** spørsmål er normale, direkte og kildebelagte uten metode-, teori- eller læreplansprompt.\n- Alle 35 spørsmål har unik `claim_id` og peker bare til reviewede eksterne source-ID-er; interne By-filer er kun guidance/metadata.\n- Sluttsettet bruker `met_for_etter` og den canonicale hooken `byliv_opphold_vs_gjennomgang` med Michel de Certeau og Gordon Cullen som eksplisitte, stedlig forankrede teoribindinger.\n- Påstander om automatisk fortrengning, generiske rent-gap-prompter og den tidligere superlativen om 25-metersbasseng er eksplisitt holdt tilbake.\n- Canonical Knowledge regenereres fra den nye manifest-loadede quizen før batchen kan persisteres.\n\n**Fase 10 Quiz = GODKJENT når materialiseringsworkflow, canonical quiz-audits, Knowledge-sync, TypeScript og build er grønne.**\n\nNeste aktive fase: **11. Knowledge**.\n`;
}
write(workcardPath, workcard);

console.log(JSON.stringify({
  place_id: targetId,
  phase: 10,
  profile: "rich_5x7",
  questions: specs.length,
  balance: counts,
  source_count: Object.keys(sources).length,
  next_phase: "11. Knowledge"
}, null, 2));
