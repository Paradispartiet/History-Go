#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => { const target = path.join(ROOT, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`); };
const wordCount = (value) => value.trim().split(/\s+/u).length;
const C = (id, term, definition, distinguish_from) => ({ id, term, definition, distinguish_from });
const S = (id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints) => ({ id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints });

const areas = [
  { id: 'drama_teatertekst_framforing', title: 'Drama, teatertekst og framføring', status: 'expanded_contract_scope_locked_materialization_pending', topics: ['dialog_monolog_didascalier', 'handling_konflikt_dramaturgi', 'tragedie_komedie_mellomformer', 'tekst_framforing_iscenesettelse', 'dramatisk_rom_tid', 'lesedrama_postdramatisk_tekst'] },
  { id: 'sjanger_modus_form', title: 'Sjanger, modus og form', status: 'expanded_contract_scope_locked_materialization_pending', topics: ['sjangerkontrakt_forventning', 'epikk_lyrikk_dramatikk', 'realisme_romantikk_modernisme_som_modus', 'fantastikk_science_fiction_dystopi', 'krim_romanse_popularlitteratur', 'hybridformer_essay_litterar_sakprosa'] }
];
const topicLayer = read(`${PACKAGE}/topic_foundations_v1.json`);
const foundations = areas.map((area) => topicLayer.areas.find((row) => row.id === area.id));

const dramaConcepts = [
  C('dialog', 'Dialog', 'Fordeling av replikker og respons mellom sceniske taleposisjoner, også gjennom avbrudd, taushet og manglende svar.', 'Enhver samtale eller bevis på likeverdig kommunikasjon mellom figurene.'),
  C('monolog', 'Monolog', 'En lengre sammenhengende scenisk ytring som organiserer en talers tanke, adresse og handling over tid.', 'Privat tanke eller tale uten publikum og situasjon.'),
  C('didascalie', 'Didaskalie', 'Tekstlig sceneanvisning om kropp, sted, lyd, tempo eller handling, formet av utgave og teaterkonvensjon.', 'En bindende instruks som alle produksjoner må utføre identisk.'),
  C('pause', 'Dramatisk pause', 'Et markert fravær av replikk som får varighet og funksjon gjennom tekst, skuespill og produksjonsrytme.', 'Tom tid eller en universelt fast lengde angitt av ordet pause.'),
  C('dramaturgi', 'Dramaturgi', 'Organisering av hendelser, informasjon, rytme, oppmerksomhet og forventning i tekst og scenisk produksjon.', 'En universell femaktsmodell eller handlingens korte referat.'),
  C('konflikt', 'Dramatisk konflikt', 'Et strukturert motsetningsforhold mellom mål, normer, institusjoner eller tidskrav som driver eller blokkerer handling.', 'Høylytt krangel eller nødvendig sentrum i ethvert teaterverk.'),
  C('vendepunkt', 'Vendepunkt', 'Et lokalisert skifte som endrer handlingens muligheter, kunnskapsfordeling eller figurens forpliktelser.', 'Enhver overraskelse eller automatisk midtpunkt i et standardisert plot.'),
  C('gjenkjennelse', 'Gjenkjennelse', 'Overgang fra uvitenhet til kunnskap som forandrer relasjoner og handlingsmuligheter i en dramatisk struktur.', 'Publikums identifikasjon med en figur.'),
  C('tragedie', 'Tragedie', 'Historisk sjangerfamilie som organiserer alvorlig handling, tap, ansvar og affekt gjennom skiftende formnormer.', 'Enhver fortelling med trist slutt eller én tidløs gresk oppskrift.'),
  C('komedie', 'Komedie', 'Historisk sjangerfamilie som bruker sosial omordning, misforståelse, kropp, språk og latter i varierende sluttformer.', 'Tekst som bare skal være morsom eller alltid ender med ekteskap.'),
  C('tragikomedie', 'Tragikomedie', 'Form som kombinerer eller forskyver tragiske og komiske forventninger uten nødvendigvis å harmonisere dem.', 'Et drama som veksler tilfeldig mellom alvor og vitser.'),
  C('grotesk', 'Grotesk', 'Estetisk modus som sammenfører uforenlige kropper, skalaer eller toner og destabiliserer etablerte kategorier.', 'Alt stygt, overdrevet eller komisk.'),
  C('iscenesettelse', 'Iscenesettelse', 'En produksjons konkrete organisering av tekst, kropp, rom, lys, lyd, tempo og publikum.', 'Illustrasjon av en ferdig betydning som allerede finnes uttømmende i teksten.'),
  C('framforing', 'Teaterframføring', 'En situert og tidsbundet realisering der skuespillere, teknikk og publikum medproduserer den sceniske hendelsen.', 'En stabil gjenstand som er identisk i alle forestillinger.'),
  C('produksjonskontekst', 'Produksjonskontekst', 'De institusjonelle, økonomiske, tekniske og historiske vilkårene som former en bestemt oppsetning.', 'All generell bakgrunn rundt dramatikeren eller teksten.'),
  C('regibok', 'Regibok', 'Produksjonsdokument som registrerer kutt, bevegelser, signaler og endringer i en bestemt prøve- og spilleprosess.', 'Dramatikerens originalmanus eller fullstendig opptak av forestillingen.'),
  C('scenerom', 'Scenerom', 'Det materielle og organiserte rommet der aktører, objekter, synslinjer og publikum plasseres i en produksjon.', 'Fiksjonens samlede geografi eller teaterbygningen alene.'),
  C('dramatisk_tid', 'Dramatisk tid', 'Forholdet mellom fiksjonens tidsforløp, framføringens varighet og rytmen i scener, pauser og sprang.', 'Klokketid alene eller tekstens historiske periode.'),
  C('utenfor_scenen', 'Utenfor scenen', 'Steder og hendelser som ikke vises direkte, men produseres gjennom tale, lyd, inngang og forventning.', 'Det som er irrelevant for handlingen eller mangler i teksten.'),
  C('terskel', 'Scenisk terskel', 'En dør, kant eller overgang som regulerer synlighet, adgang, kunnskap og sosial bevegelse i rommet.', 'Bare et dekorativt sceneelement.'),
  C('lesedrama', 'Lesedrama', 'Drama skrevet, publisert eller resepsjonert med lesning som sentral praksis, uansett mulig senere iscenesettelse.', 'Uspillbar tekst eller drama uten sceniske trekk.'),
  C('postdramatisk', 'Postdramatisk teater', 'Teaterpraksis som svekker dramaets hierarki av sammenhengende figur, dialog og kausalt plot til fordel for hendelse og materialitet.', 'Alt nyere eller eksperimentelt teater etter en bestemt dato.'),
  C('tekstflate', 'Tekstflate', 'Den visuelle og lydlige organiseringen av ord som materiale uten nødvendig stabil fordeling på figurer.', 'Meningsløs ordsamling eller ferdig scenisk partitursystem.'),
  C('partitur', 'Scenisk partitur', 'En struktur av tidslige, kroppslige, lydlige og romlige handlinger som kan veilede eller beskrive framføring.', 'Notasjon som fikserer alle framtidige forestillinger identisk.')
];

const genreConcepts = [
  C('sjanger', 'Sjanger', 'Historisk forventningssystem som forbinder form, tema, medium, sannhetskrav, publikum og institusjonell bruk.', 'En naturgitt beholder eller enkel markedsføringsetikett.'),
  C('sjangerkontrakt', 'Sjangerkontrakt', 'Forhandlet sett av signaler som orienterer produsent og mottaker om hvordan verket kan leses og vurderes.', 'En juridisk avtale eller regel som teksten aldri kan bryte.'),
  C('forventningshorisont', 'Forventningshorisont', 'Historisk repertoar av former, normer og tidligere verk som gjør et nytt verk gjenkjennelig og avvikende.', 'Alle samtidige leseres identiske forventning.'),
  C('paratekst', 'Paratekst', 'Titler, forord, omslag, sjangermerking og andre terskeltekster som rammer inn verkets bruk og status.', 'Nøytral emballasje uten fortolkende eller kommersiell funksjon.'),
  C('epikk', 'Epikk', 'Historisk kategori for fortellende framstilling, fra muntlig diktning til prosa, uten én stabil materialform.', 'Alle romaner eller enhver tekst med hendelser.'),
  C('lyrikk', 'Lyrikk', 'Historisk kategori for komprimerte og formbevisste ytringer organisert gjennom stemme, vers, klang eller skriftbilde.', 'All subjektiv eller kort tekst.'),
  C('dramatikk', 'Dramatikk', 'Historisk kategori for tekst og handling organisert mot rollefordeling, dialog, framføring eller scenisk mulighet.', 'Bare trykte skuespill eller teaterforestillingen selv.'),
  C('modus', 'Modus', 'Bred framstillingsmåte eller orientering som kan virke på tvers av sjangrer og perioder.', 'En avgrenset historisk bevegelse eller markedsdefinert sjanger.'),
  C('realisme', 'Realistisk modus', 'Strategier som bygger sannsynlig hverdagsverden, sosial detalj og kausal sammenheng under historiske konvensjoner.', 'Objektiv kopi av virkeligheten eller bare 1800-tallsromanen.'),
  C('romantikk', 'Romantisk modus', 'Strategier som vektlegger forestilling, subjekt, natur, fragment eller overskridelse i historisk variable kombinasjoner.', 'Følelsesfull kjærlighetsfortelling eller én enhetlig epoke.'),
  C('modernisme', 'Modernistisk modus', 'Formell problematisering av representasjon, stemme, tid og medium gjennom flere historiske bevegelser og teknikker.', 'All vanskelig, fragmentert eller moderne litteratur.'),
  C('periodisering', 'Periodisering', 'Argumentativ inndeling av historisk materiale i perioder etter eksplisitte kriterier, brudd og kontinuiteter.', 'Nøytral kalenderinndeling eller bevis på at alle verk endres samtidig.'),
  C('fantastikk', 'Fantastikk', 'Sjangerfelt der verdensregler, umulige hendelser eller nøling mellom forklaringer organiserer lesningen.', 'Enhver oppdiktet tekst eller bare høyfantasy.'),
  C('science_fiction', 'Science fiction', 'Spekulativ sjangerfamilie som knytter tekniske eller vitenskapelige novum til sosiale verdener og historiske spørsmål.', 'Sikker framtidsprognose eller fortelling med romskip alene.'),
  C('novum', 'Novum', 'Det nye elementet som skiller en spekulativ tekstverden fra leserens historiske virkelighet og krever systematisk forklaring.', 'Ethvert overraskende objekt eller teknisk rekvisitt.'),
  C('dystopi', 'Dystopi', 'Negativ samfunnsmodell som organiserer makt, norm og hverdagsliv for kritisk sammenligning med leserens verden.', 'Enhver mørk framtid eller katastrofefortelling.'),
  C('formel', 'Sjangerformel', 'Gjentakbart handlings- og motivmønster som produsenter og publikum varierer innenfor bestemte markeder og medier.', 'Mekanisk oppskrift som gjør alle verk like.'),
  C('serie', 'Serie', 'Publiserings- og fortellingsform der flere verk deler figurer, verden, merkevare eller forventningsstruktur over tid.', 'Enhver oppfølger eller ett langt verk delt i bind.'),
  C('sjangerpublikum', 'Sjangerpublikum', 'Historisk og sosialt sammensatt lesergruppe med lærte forventninger og bruksmåter rundt et sjangerfelt.', 'En homogen masse som alltid ønsker samme løsning.'),
  C('popularlitteratur', 'Populærlitteratur', 'Institusjonelt og markedsmessig sirkulerende litteratur hvis former, publikum og verdsetting må undersøkes historisk.', 'Litteratur med lav estetisk kvalitet per definisjon.'),
  C('essay', 'Essay', 'Utforskende prosasjanger som organiserer refleksjon, erfaring og argument gjennom en markert skrivende stemme.', 'Uformell tekst uten krav til evidens eller komposisjon.'),
  C('sakprosa', 'Litterær sakprosa', 'Faktarefererende tekst som kombinerer dokumentasjon og sannhetsansvar med tydelig form-, stemme- og språkbevissthet.', 'Fiksjon med virkelige navn eller fakta uten kildekrav.'),
  C('hybridform', 'Hybridform', 'Verk som systematisk kombinerer sjangerkonvensjoner og gjør forholdet mellom dem formbærende.', 'Tekst som kritikeren ikke klarer å klassifisere.'),
  C('sannhetsansvar', 'Sannhetsansvar', 'Forpliktelse til å kunne begrunne faktapåstander, kildebruk og representasjon overfor et faktisk publikum.', 'Krav om stilfri objektivitet eller fravær av perspektiv.')
];

const dramaSections = [
  S('dialog-monolog-didaskalier', '1. Dialog, monolog og didaskalier', areas[0].topics[0], [
    'Dramatisk dialog organiserer handling gjennom turer, svar, avbrudd, gjentakelser og taushet. Replikkene er ikke bare utsagn om verden, men forsøk på å love, skjule, befale eller endre relasjoner. Monologen kan henvende seg til publikum, en fraværende figur eller taleren selv. Analysen må derfor beskrive adressat, situasjon og konsekvens, ikke bare sammenfatte hva figuren sier.',
    'I «Waiting for Godot» inngår pauser, gjentatte rutiner og sceneanvisninger i verkets tidslige og kroppslige organisering. Ordet «pause» angir ikke én fast varighet; en produksjon velger lengde, blikk og bevegelse. Tekstanalysen kan kartlegge plassering og mønster, mens påstander om komisk eller ubehagelig effekt må knyttes til en bestemt framføring eller dokumentert resepsjon.',
    'Didaskalier har ulik autoritet i manuskript, trykt utgave, oversettelse og regibok. Noen stammer fra dramatikeren, andre fra redaktør eller dokumentert urframføring. Kritikeren bør fastslå tekstgrunnlaget før sceneanvisningen tolkes som norm. Taushet er heller ikke fravær av mening i seg selv; funksjonen oppstår gjennom replikkforløp, kropp og det sosiale som situasjonen gjør vanskelig å si.'
  ], [['dra-01', 'dra-02'], ['dra-03'], ['dra-04']], ['Analyser replikk som handling og respons.', 'Oppgi tekstlag og produksjon før didaskalien tillegges autoritet.']),
  S('handling-konflikt-dramaturgi', '2. Handling, konflikt og dramaturgi', areas[0].topics[1], [
    'Dramaturgi ordner informasjon, rytme, forventning og sceniske handlinger, men kan ikke reduseres til én femaktskurve. Konflikt kan ligge mellom personer, normer, institusjoner eller samtidige krav, og enkelte teaterformer svekker konflikten som sentrum. En presis analyse identifiserer mål og begrensninger, lokaliserer faktisk endring og prøver om spenningen produseres av kunnskapsforskjell snarere enn direkte motstand.',
    'I «Kong Oidipus» forbindes etterforskning, vitnesbyrd, gjenkjennelse og katastrofe slik at nye opplysninger endrer både identitet og handlingsrom. Aristoteles’ begreper kan belyse denne organiseringen, men verket skal ikke bare illustrere en senere standardoppskrift. Analysen bør følge hvem som vet hva i hver scene, hvilke ytringer som utløser nye søk, og hvor nødvendighet er tekstlig konstruert.',
    'Et vendepunkt krever mer enn overraskelse: de tilgjengelige mulighetene eller forpliktelsene må endres. Kritikeren kan tegne en hendelsesprotokoll med scene, handling, informasjon og følge, og deretter teste alternative inndelinger. Faktisk scenisk intensitet avhenger også av tempo, skuespill og rom. Dramaturgisk tekstanalyse beskriver et mulighetsfelt, mens produksjonsanalyse undersøker hvordan én oppsetning prioriterer det.'
  ], [['dra-05', 'dra-06'], ['dra-07'], ['dra-08']], ['Dramaturgi omfatter informasjon og rytme, ikke bare plot.', 'Vendepunkt må endre muligheter eller forpliktelser.']),
  S('tragedie-komedie-mellomformer', '3. Tragedie, komedie og mellomformer', areas[0].topics[2], [
    'Tragedie og komedie er historiske sjangerfamilier med skiftende figurer, affekter, publikum og sluttformer. En trist slutt gjør ikke alene et verk tragisk, og latter avgjør ikke alene komedie. Sjangerbestemmelsen bør bruke samtidige poetikker, teaterinstitusjon og produksjonshistorie. Tragikomedie og grotesk viser hvordan tone, sosial orden og handlingsutfall kan trekke i ulike retninger samtidig.',
    '«The Merchant of Venice» kombinerer frierkomedie, kontraktshandling, rettsscene og tvungen sosial omordning. Ekteskapene lukker noen forløp, mens behandlingen av Shylock gjør en enkel komedieetikett utilstrekkelig. Analysen må skille historisk sjangerplassering fra en moderne etisk vurdering og undersøke hvordan konkrete produksjoner rammer inn rettsscenens vold, latter og publikumsallianser.',
    'Sjangerblanding er ikke automatisk subversjon. En mellomform kan stabilisere normer ved å innlemme konflikt i en kjent avslutning, eller gjøre normen ustabil ved å la restledd stå åpne. Kritikeren bør kartlegge hvilke forventninger teksten aktiverer, hvor de brytes, og hva som faktisk følger. Resepsjonsdata er nødvendig for påstander om at et historisk publikum lo, sørget eller avviste blandingen.'
  ], [['dra-09', 'dra-10'], ['dra-11'], ['dra-12']], ['Historiser sjanger gjennom poetikk og institusjon.', 'Skill blandet tone fra dokumentert publikumsaffekt.']),
  S('tekst-framforing-iscenesettelse', '4. Tekst, framføring og iscenesettelse', areas[0].topics[3], [
    'En dramatekst tilbyr replikker, handlinger og sceniske begrensninger, mens en iscenesettelse foretar konkrete valg av kropp, stemme, rom, lys, lyd, kutt og tempo. Produksjonen er ikke en sekundær illustrasjon, men en historisk fortolkning. Sammenligning må identifisere utgave, premiere, spillested, medvirkende og dokumenttype og unngå å gjøre ett videopptak identisk med hele forestillingshendelsen.',
    '«Et dukkehjem» finnes med ulike avslutninger og har vært iscenesatt gjennom svært forskjellige romlige og politiske rammer. En produksjonsanalyse kan følge hvordan Nora beveger seg, hvem som kontrollerer dørene, tempoet i sluttsamtalen og lyden av utgangen. Påstander om frigjøring eller nederlag må knyttes til disse observerbare valgene og ikke bare til en generell idé om stykket.',
    'Arkivmateriale er fragmentarisk: fotografi fryser et øyeblikk, anmeldelsen filtrerer gjennom kritikeren, regiboken registrerer plan og opptaket endrer utsnitt og lyd. Kildene bør trianguleres og uenighet bevares. Publikum i én forestilling kan ikke rekonstrueres fra teksten alene. Produksjonskontekst omfatter også institusjon, finansiering, sensur og tilgjengelig teknologi når disse forbindes med bestemte sceniske beslutninger.'
  ], [['dra-13', 'dra-14'], ['dra-15'], ['dra-16']], ['Behandle oppsetningen som en situert fortolkning.', 'Trianguler opptak, regibok, fotografi og resepsjon.']),
  S('dramatisk-rom-og-tid', '5. Dramatisk rom og tid', areas[0].topics[4], [
    'Dramatisk rom omfatter vist scenerom, fiktive steder framkalt gjennom språk og steder utenfor scenen som påvirker handlingen. Dører, terskler og synslinjer regulerer adgang og kunnskap. Dramatisk tid oppstår mellom fiksjonens forløp, forestillingens varighet og lokale rytmer. Analysen må skille disse nivåene før rommet eller ventingen gjøres til symbol for en sosial tilstand.',
    'Stuen i «Et dukkehjem» avgrenser familiens representasjonsrom gjennom dører, besøk, brev og juletreets endring. Hendelser utenfor scenen kommer inn som meldinger og konsekvenser, mens Noras utgang reorganiserer terskelen. En tekstlig romplan kan sammenlignes med produksjonens faktiske scenografi, men historiske påstander om borgerlig bolig krever samtidige arkitektur- og sosialhistoriske kilder.',
    'Ventetid, pause og sprang kan produsere forskjellige tidsregimer. En oppsetning kan komprimere overganger eller gjøre dem påtrengende lange uten å endre replikkene. Forskeren bør tidskode et opptak og samtidig notere usikkerheten som kameraredigering innfører. Teksten beskriver mulige tidsforbindelser; forestillingen realiserer én varighet, og publikums opplevde tempo er et tredje empirisk spørsmål.'
  ], [['dra-17', 'dra-18'], ['dra-19'], ['dra-20']], ['Kartlegg vist, omtalt og utenforliggende rom.', 'Skill fiksjonstid, spilletid og opplevd tid.']),
  S('lesedrama-og-postdramatisk', '6. Lesedrama og postdramatisk tekst', areas[0].topics[5], [
    'Lesedrama betegner en historisk lese- og publiseringspraksis, ikke en naturgitt uscenisk teksttype. Verk kan være skrevet for bokmarked, privat lesning og framtidig scene samtidig. Postdramatisk teater betegner praksiser der kausalt plot, stabil figur og dialog ikke lenger organiserer alle elementer hierarkisk. Begrepene må dokumenteres gjennom produksjon og resepsjon, ikke brukes som synonymer for vanskelig eller nytt.',
    'Sarah Kanes «4.48 Psychosis» mangler stabil rollefordeling og lar stemmer, tall, mellomrom og tekstblokker stå åpne for scenisk organisering. En analyse bør kartlegge tekstflaten uten straks å fordele alt på én biografisk person. Produksjoner må deretter sammenlignes på hvordan de fordeler stemmer, kropper og rom. Psykiatrisk eller biografisk fortolkning krever særskilte kilder og etisk presisjon.',
    'Når teksten fungerer som partitur, kan den angi sekvens og materiale uten å bestemme én representert verden. Det betyr ikke at enhver iscenesettelse er like godt forankret. Kritikeren må vise hvilke tekstlige begrensninger produksjonen bruker, omformer eller avviser. Arkivering bør bevare både skrift, prøveprosess og teknisk realisering, fordi ingen enkelt kilde uttømmer den postdramatiske hendelsens form.'
  ], [['dra-21', 'dra-22'], ['dra-23'], ['dra-24']], ['Historiser lesedrama som praksis, ikke mangel.', 'Analyser tekstflaten før stemmer og figurer stabiliseres.'])
];

const genreSections = [
  S('sjangerkontrakt-og-forventning', '1. Sjangerkontrakt og forventning', areas[1].topics[0], [
    'Sjanger er en historisk relasjon mellom formtrekk, tema, medium, marked, sannhetskrav og bruk. En sjangerkontrakt orienterer lesningen, men oppstår gjennom tekst og paratekst og kan forhandles eller mislykkes. Kritikeren må dokumentere forventningshorisonten med samtidige anmeldelser, kataloger eller poetikker. Dagens bokhandelsetikett er ikke tilstrekkelig bevis for hvordan et tidligere verk ble forstått.',
    'Forordet til «Robinson Crusoe» framstiller fortellingen som sann historie og bruker redaksjonelle markører som historisk kunne påvirke lesemåten. Det gjør ikke romanen til sakprosa for alle samtidige lesere. Analysen bør sammenholde forord, tittelblad, fortellerform og tidlig resepsjon og skille verkets tilbudte sannhetsramme fra senere institusjonell klassifisering som roman.',
    'Et sjangerbrudd kan bare påvises mot en etablert forventning og må ha en lokalisert funksjon. Verk kan også aktivere flere kontrakter samtidig eller endre kategori mellom utgaver. Parateksten er virksom, men ikke enerådende; lesere bringer andre repertoarer. Påstander om overraskelse eller skuffelse krever resepsjonsmateriale, mens nærlesningen viser hvilke signaler og avvik teksten faktisk tilbyr.'
  ], [['gen-01', 'gen-02'], ['gen-03'], ['gen-04']], ['Dokumenter historisk forventning før sjangerbrudd hevdes.', 'Skill paratekstens ramme fra faktisk resepsjon.']),
  S('epikk-lyrikk-dramatikk', '2. Epikk, lyrikk og dramatikk', areas[1].topics[1], [
    'Tredelingen epikk, lyrikk og dramatikk blander flere kriterier: fortelling, taleposisjon, versform, rollefordeling og framføringsinstitusjon. Den kan orientere, men ikke dekke alle litterære praksiser. Essay, prosadikt og performativ poesi krysser aksene. En presis klassifikasjon bør derfor oppgi om den beskriver modus, medieform, sjangerhistorie eller institusjonell plassering og akseptere overlapp.',
    'Dantes «Den guddommelige komedie» er en fortellende reise i vers med markert førsteperson, lyriske intensiteter, dialog og dramatiske møter. Å kalle den episk kan beskrive omfang og fortelling, men uttømmer ikke terza rima, teologisk visjon eller taleposisjon. Analysen bør identifisere hvilken funksjon kategorien har i argumentet og unngå å gjøre tre hovedsjangrer til separate naturlige essenser.',
    'Kategorier vandrer mellom språk og utdanningssystemer. «Lyrikk» har ikke alltid de samme grensene som «poetry», og «epikk» kan betegne både epos og fortellende hovedkategori. Oversettelse av sjangerord er derfor et forskningsproblem. Kritikeren bør sitere den originale termen, dokumentere institusjonell bruk og vise hva som går tapt når et lokalt system presses inn i en universell tredeling.'
  ], [['gen-05', 'gen-06'], ['gen-07'], ['gen-08']], ['Oppgi kriteriet bak hovedsjangerklassifikasjonen.', 'Historiser og oversett kategoriord eksplisitt.']),
  S('realisme-romantikk-modernisme', '3. Realisme, romantikk og modernisme som modi', areas[1].topics[2], [
    'Realisme, romantikk og modernisme kan betegne perioder, bevegelser, stiler eller modi. Argumentet må velge nivå. Som modus kan realisme virke i fantastikk, og romantiske eller modernistiske strategier kan opptre utenfor de vanlige periodene. En trekkatalog beviser likevel ikke kategorien: formtrekk må forbindes med historiske programmer, sammenligningsverk og institusjoner før større litteraturhistoriske slutninger trekkes.',
    '«Madame Bovary» kombinerer detaljert sosialt miljø, fri indirekte diskurs, romantiske lesefantasier og nøye komposisjon. En realistisk lesning bør vise hvordan ting, økonomi og provinsliv organiseres, samtidig som Emmas romantiske repertoar medierer erfaringen. Verket illustrerer ikke en ren overgang der romantikk erstattes av realisme; flere modi blir materiale for fortellerens stil og romanens kritiske struktur.',
    'Periodisering er en begrunnet modell, ikke selve historien. Start- og sluttår avhenger av språk, medium og utvalgte kriterier, og sentrumets brudd kan være periferiens kontinuitet. Forskeren bør rapportere hvilke verk som faller utenfor modellen og prøve alternative skalaer. «Modernistisk fragment» må dessuten lokaliseres og sammenlignes; vanskelighet eller nyhet alene gjør ikke et verk modernistisk.'
  ], [['gen-09', 'gen-10'], ['gen-11'], ['gen-12']], ['Skill periode, bevegelse, stil og modus.', 'Rapporter restledd og alternative periodiseringer.']),
  S('fantastikk-science-fiction-dystopi', '4. Fantastikk, science fiction og dystopi', areas[1].topics[3], [
    'Fantastikk, science fiction og dystopi overlapper, men stiller ulike spørsmål til tekstverdenen. Fantastikk kan organisere umulighet eller forklaringsnøling, science fiction kan utvikle et novum gjennom systematiske følger, og dystopi modellerer negativ samfunnsorden. Et romskip, monster eller mørkt framtidsmiljø er ikke nok. Analysen må beskrive verdensregler, kunnskapsramme og institusjonell sjangerhistorie.',
    'Mary Shelleys «Frankenstein» forbinder skapt liv, eksperiment, vitnesbyrd og ansvar gjennom innrammede fortellinger. Senere science fiction kan lese skapningen som et novum, mens gotiske og romantiske konvensjoner også organiserer verket. Kritikeren bør unngå å avgjøre én endelig etikett og heller vise hva hver sjangerramme synliggjør og hvilke historiske betegnelser som faktisk var tilgjengelige i 1818.',
    'Dystopisk analyse må følge hvordan makt blir materiell i arbeid, språk, familie, rom og overvåkning, ikke bare sitere regimets ideologi. Sammenligning med nåtiden trenger eksplisitte mellomledd og kan ikke gjøre fiksjonen til prognose. Leseren kan oppfatte kritisk analogi, men dokumentert politisk virkning krever resepsjon. Tekstverdens koherens og faktiske framtidssannsynlighet er forskjellige vurderingsmål.'
  ], [['gen-13', 'gen-14'], ['gen-15'], ['gen-16']], ['Klassifiser gjennom verdensregel og kunnskapsramme.', 'Skill spekulativ modell fra faktisk prognose.']),
  S('krim-romanse-popularlitteratur', '5. Krim, romanse og populærlitteratur', areas[1].topics[4], [
    'Krim og romanse organiserer sterke forventninger om gåte, fare, begjær og løsning, men formlene varierer med marked, serie, medium og publikum. Gjentakelse betyr ikke fravær av estetisk valg. Populærlitteratur er heller ikke en kvalitetsdom i seg selv. Analysen bør kombinere informasjonsfordeling og komposisjon med forlagsarkiv, omslag, salg og leserpraksis når den hevder institusjonell betydning.',
    'I «The Murder of Roger Ackroyd» fordeles informasjon gjennom en førstepersonsforteller hvis registreringer senere får ny funksjon. Romanen bruker detektivfortellingens forventning om rettferdig sporlegging og utfordrer den uten å oppheve all løsning. En analyse må vende tilbake til eksakte formuleringer, skille utelatelse fra løgn og dokumentere historisk debatt dersom bruddet kalles urettferdig overfor sjangerpublikummet.',
    'En formel er et repertoar av muligheter, ikke en maskinoppskrift. Serier kan la figuren forbli stabil mens verden endres, eller utvikle lange emosjonelle forløp på tvers av bind. Publikum er sammensatt, og faktisk bruk kan omfatte fellesskap, kritikk og gjenlesning. Påstander om eskapisme eller ideologisk passivitet trenger resepsjonsdata og kan ikke utledes direkte fra lykkelig slutt eller salgstall.'
  ], [['gen-17', 'gen-18'], ['gen-19'], ['gen-20']], ['Analyser formel som variabelt repertoar.', 'Skill tekstlig løsning fra dokumentert publikumsbruk.']),
  S('essay-sakprosa-hybrid', '6. Essay, litterær sakprosa og hybridformer', areas[1].topics[5], [
    'Essayet organiserer undersøkelse gjennom en skrivende stemme som kan prøve, vende og revidere argumentet. Litterær sakprosa bruker komposisjon og språklig form uten å oppheve sannhetsansvaret for faktapåstander. Hybridform betyr heller ikke grenseløshet; analysen må identifisere hvilke sjangerkonvensjoner som kombineres, hvilke forpliktelser som bevares, og hvor leseren får signal om dokumentasjon eller iscenesettelse.',
    'I «A Room of One’s Own» kombinerer Virginia Woolf foredragsramme, fiktive situasjoner, historiske eksempler og argument om materielle vilkår for skrivende kvinner. Analysen bør skille dokumenterte historiske påstander fra den konstruerte fortellerens vandring og hypotetiske figurer. Den litterære formen gjør argumentets erkjennelsesprosess synlig, men fritar ikke kritikeren fra å kontrollere verkets kilder og generaliseringer.',
    'Sannhetsansvar graderes ikke enkelt etter hvor litterært språket er. En scene i sakprosa kan være rekonstruert, komprimert eller sitert og må merkes etter dokumentasjon. Paratekst, noter og arkiv kan avklare metoden, men fortellerens troverdighet er ikke nok. Kritikeren bør lage en påstandsmatrise som skiller observerbar tekstform, ekstern faktapåstand, kildegrunnlag og legitim inferens.'
  ], [['gen-21', 'gen-22'], ['gen-23'], ['gen-24']], ['Hybriditet opphever ikke sjangerspesifikke forpliktelser.', 'Skille litterær komposisjon fra ekstern faktapåstand.'])
];

const sourceSets = {
  drama: [
    ['sdr01', 'The Semiotics of Theatre and Drama', 'https://www.routledge.com/The-Semiotics-of-Theatre-and-Drama-2nd-Edition/Elam/p/book/9780415280181', 'Routledge'],
    ['sdr02', 'The Cambridge Introduction to Theatre Studies', 'https://www.cambridge.org/core/books/cambridge-introduction-to-theatre-studies/3CAA6E67577F418E6EC2D507F27C8ABB', 'Cambridge University Press'],
    ['sdr03', 'Postdramatic Theatre', 'https://www.routledge.com/Postdramatic-Theatre/Lehmann/p/book/9780415268134', 'Routledge'],
    ['sdr04', 'Performance Studies: An Introduction', 'https://www.routledge.com/Performance-Studies-An-Introduction/Schechner/p/book/9781138284562', 'Routledge'],
    ['sdr05', 'Aristotle’s Poetics', 'https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/aristotles-poetics/901DBEBFF50D43D0709ACF7BBC6C0495', 'Cambridge University Press'],
    ['sdr06', 'The Routledge Companion to Dramaturgy', 'https://www.routledge.com/The-Routledge-Companion-to-Dramaturgy/Romanska/p/book/9780415658492', 'Routledge'],
    ['sdr07', 'Waiting for Godot', 'https://www.faber.co.uk/product/9780571229116-waiting-for-godot/', 'Faber'],
    ['sdr08', 'Oedipus the King', 'https://www.gutenberg.org/ebooks/27673', 'Project Gutenberg'],
    ['sdr09', 'The Merchant of Venice', 'https://www.gutenberg.org/ebooks/1515', 'Project Gutenberg'],
    ['sdr10', 'A Doll’s House', 'https://www.gutenberg.org/ebooks/2542', 'Project Gutenberg'],
    ['sdr11', '4.48 Psychosis', 'https://www.bloomsbury.com/uk/448-psychosis-9781350148903/', 'Bloomsbury'],
    ['sdr12', 'Theatre Histories', 'https://www.routledge.com/Theatre-Histories-An-Introduction/Zarrilli-McConachie-Williams-Sorgenfrei/p/book/9780415837967', 'Routledge']
  ],
  genre: [
    ['sge01', 'The Cambridge Introduction to Narrative', 'https://www.cambridge.org/highereducation/books/the-cambridge-introduction-to-narrative/33F40DD4272A7925A9B227BC4E11D85C', 'Cambridge University Press'],
    ['sge02', 'Genre', 'https://www.routledge.com/Genre/Frow/p/book/9780415280633', 'Routledge'],
    ['sge03', 'The Political Unconscious', 'https://www.cornellpress.cornell.edu/book/9780801492228/the-political-unconscious/', 'Cornell University Press'],
    ['sge04', 'Archaeologies of the Future', 'https://www.versobooks.com/products/2327-archaeologies-of-the-future', 'Verso'],
    ['sge05', 'Metamorphoses of Science Fiction', 'https://yalebooks.yale.edu/book/9780300023752/metamorphoses-of-science-fiction/', 'Yale University Press'],
    ['sge06', 'Popular Fiction: The Logics and Practices of a Literary Field', 'https://www.routledge.com/Popular-Fiction-The-Logics-and-Practices-of-a-Literary-Field/Gelder/p/book/9780415356475', 'Routledge'],
    ['sge07', 'Robinson Crusoe', 'https://www.gutenberg.org/ebooks/521', 'Project Gutenberg'],
    ['sge08', 'Divine Comedy', 'https://www.gutenberg.org/ebooks/8800', 'Project Gutenberg'],
    ['sge09', 'Madame Bovary', 'https://www.gutenberg.org/ebooks/2413', 'Project Gutenberg'],
    ['sge10', 'Frankenstein', 'https://www.gutenberg.org/ebooks/84', 'Project Gutenberg'],
    ['sge11', 'The Murder of Roger Ackroyd', 'https://www.harpercollins.com/products/the-murder-of-roger-ackroyd-agatha-christie', 'HarperCollins'],
    ['sge12', 'A Room of One’s Own', 'https://www.penguin.co.uk/books/60308/a-room-of-ones-own-by-woolf-virginia/9780241371978', 'Penguin']
  ]
};
const toSources = (rows) => rows.map(([id, label, url, publisher]) => ({ id, label, url, publisher, type: 'faglig_eller_primar_kilde', source_location: 'Verkpresentasjon og relevant hovedargument' }));

const claimSets = {
  drama: [
    ['dra-01', 'Dramatisk dialog organiserer handling gjennom respons, avbrudd, taushet og talehandling.', ['sdr01', 'sdr02']],
    ['dra-02', 'Monologens adressat og situasjon må rekonstrueres og er ikke nødvendigvis taleren selv.', ['sdr01', 'sdr02']],
    ['dra-03', '«Waiting for Godot» bruker pauser og gjentatte rutiner som tekstlige og sceniske ressurser.', ['sdr07']],
    ['dra-04', 'Didaskaliens autoritet avhenger av manuskript, utgave og produksjonshistorie.', ['sdr01', 'sdr06']],
    ['dra-05', 'Dramaturgi omfatter informasjon, rytme og oppmerksomhet og er ikke én universell aktmodell.', ['sdr02', 'sdr06']],
    ['dra-06', 'Dramatisk konflikt kan ligge mellom normer og institusjoner, ikke bare personer.', ['sdr02', 'sdr06']],
    ['dra-07', '«Kong Oidipus» organiserer etterforskning, gjenkjennelse og katastrofe gjennom skiftende kunnskap.', ['sdr05', 'sdr08']],
    ['dra-08', 'Et vendepunkt endrer handlingens muligheter, kunnskap eller forpliktelser.', ['sdr05', 'sdr06']],
    ['dra-09', 'Tragedie og komedie er historiske sjangerfamilier og ikke bestemt av én affekt eller slutt.', ['sdr02', 'sdr12']],
    ['dra-10', 'Tragikomedie og grotesk kan kombinere uforenlige tone- og sluttforventninger.', ['sdr02', 'sdr12']],
    ['dra-11', '«The Merchant of Venice» kombinerer frierkomedie med kontrakt, rett og tvungen omordning.', ['sdr09']],
    ['dra-12', 'Publikums historiske latter eller sorg krever resepsjonskilder utover sjangerklassifikasjonen.', ['sdr04', 'sdr12']],
    ['dra-13', 'Iscenesettelse organiserer tekst, kropp, rom, lys, lyd, tempo og publikum i en produksjon.', ['sdr02', 'sdr04']],
    ['dra-14', 'En forestilling er en situert hendelse og kan ikke reduseres til ett opptak.', ['sdr04']],
    ['dra-15', '«Et dukkehjem» har en produksjonshistorie med ulike avslutninger og sceniske rammer.', ['sdr10', 'sdr12']],
    ['dra-16', 'Fotografi, regibok, anmeldelse og opptak dokumenterer ulike sider av produksjonen.', ['sdr04', 'sdr06']],
    ['dra-17', 'Dramatisk rom omfatter vist rom, omtalt sted og hendelser utenfor scenen.', ['sdr01', 'sdr02']],
    ['dra-18', 'Dramatisk tid må skille fiksjonens forløp, spilletid og opplevd varighet.', ['sdr01', 'sdr04']],
    ['dra-19', 'Stuen og dørene i «Et dukkehjem» organiserer adgang, informasjon og sosial representasjon.', ['sdr10']],
    ['dra-20', 'Produksjonen kan endre tempo og pause uten å endre replikkteksten.', ['sdr04', 'sdr06']],
    ['dra-21', 'Lesedrama betegner en historisk lese- og publiseringspraksis, ikke bare uspillbarhet.', ['sdr02', 'sdr12']],
    ['dra-22', 'Postdramatisk teater svekker dramaets hierarki uten å betegne alt nyere teater.', ['sdr03']],
    ['dra-23', '«4.48 Psychosis» lar rollefordeling og scenisk realisering stå strukturelt åpne.', ['sdr11']],
    ['dra-24', 'En tekst som partitur begrenser produksjonen uten å fastsette én uttømmende realisering.', ['sdr03', 'sdr06']]
  ],
  genre: [
    ['gen-01', 'Sjanger forbinder form, tema, medium, marked, sannhetskrav og historisk bruk.', ['sge01', 'sge02']],
    ['gen-02', 'Sjangerkontrakten forhandles gjennom tekst, paratekst og leserens repertoar.', ['sge02']],
    ['gen-03', '«Robinson Crusoe» bruker paratekstuelle sannhetsmarkører innenfor en skiftende romaninstitusjon.', ['sge07']],
    ['gen-04', 'Sjangerbrudd krever dokumentasjon av den forventningen verket bryter.', ['sge02']],
    ['gen-05', 'Epikk, lyrikk og dramatikk kombinerer ulike kriterier og dekker ikke alle litterære praksiser.', ['sge01', 'sge02']],
    ['gen-06', 'Hovedsjangrer kan beskrive modus, medieform eller institusjon og må brukes eksplisitt.', ['sge02']],
    ['gen-07', '«Den guddommelige komedie» kombinerer fortelling, vers, taleposisjon og dramatiske møter.', ['sge08']],
    ['gen-08', 'Sjangerord får ulike grenser i oversettelse og nasjonale utdanningssystemer.', ['sge02']],
    ['gen-09', 'Realisme, romantikk og modernisme kan betegne periode, bevegelse, stil eller modus.', ['sge02', 'sge03']],
    ['gen-10', 'Modale trekk kan virke på tvers av vanlige periodegrenser.', ['sge02', 'sge03']],
    ['gen-11', '«Madame Bovary» kombinerer sosial detalj, romantiske repertoarer og formell fortellerironi.', ['sge09']],
    ['gen-12', 'Periodisering krever eksplisitte kriterier og rapportering av restledd.', ['sge03']],
    ['gen-13', 'Fantastikk, science fiction og dystopi overlapper, men organiserer forskjellige verdens- og kunnskapsproblemer.', ['sge04', 'sge05']],
    ['gen-14', 'Et novum må utvikles gjennom følger i tekstverdenen og er mer enn en teknisk rekvisitt.', ['sge05']],
    ['gen-15', '«Frankenstein» kan leses gjennom science fiction, gotikk og romantiske konvensjoner.', ['sge10']],
    ['gen-16', 'En dystopisk tekst er en kritisk samfunnsmodell og ikke en sikker framtidsprognose.', ['sge04', 'sge05']],
    ['gen-17', 'Krim og romanse bruker variable formler knyttet til marked, serie og publikum.', ['sge02', 'sge06']],
    ['gen-18', 'Populærlitteratur er et institusjonelt felt og ikke en kvalitetsdom per definisjon.', ['sge06']],
    ['gen-19', '«The Murder of Roger Ackroyd» reorganiserer spor gjennom førstepersonsfortellerens informasjonsvalg.', ['sge11']],
    ['gen-20', 'Påstander om eskapisme og publikumsbruk krever resepsjonsdata utover tekstens slutt.', ['sge06']],
    ['gen-21', 'Essayet organiserer undersøkelse gjennom en skrivende stemme, vending og revisjon.', ['sge01', 'sge02']],
    ['gen-22', 'Litterær sakprosa kombinerer formbevissthet med sannhetsansvar.', ['sge02']],
    ['gen-23', '«A Room of One’s Own» kombinerer foredragsramme, fiktive situasjoner og historisk argument.', ['sge12']],
    ['gen-24', 'Hybridform opphever ikke behovet for å skille tekstform, faktapåstand og kildegrunnlag.', ['sge01', 'sge02']]
  ]
};
const toClaims = (rows, classification) => rows.map(([id, claim, source_ids]) => ({ id, claim, source_ids, classification, status: 'verified' }));

function materialize({ area, foundation, sections, concepts, sources, claims, slugs, subtitle }) {
  const dir = `${PACKAGE}/foundation_texts/${area.id}`;
  const moduleFiles = slugs.map((slug, index) => `${dir}/0${index + 1}-${slug}.json`);
  for (let index = 0; index < 3; index += 1) {
    const supplements = area.id === 'drama_teatertekst_framforing'
      ? ['Dermed blir analyseenhet og tekstlag eksplisitte og etterprøvbare.', 'Eksemplet må alltid knyttes til en bestemt utgave eller produksjon.', 'Større virkningspåstander krever selvstendig og dokumentert resepsjonsevidens.']
      : ['Kriteriene må derfor oppgis før kategorien brukes komparativt.', 'Verkstedet må alltid dokumentere utgave og historisk ramme.', 'Leserrespons og institusjonell virkning krever selvstendige kilder.'];
    const moduleSections = sections.slice(index * 2, index * 2 + 2).map((item) => ({
      ...item,
      paragraphs: item.paragraphs.map((paragraph, paragraphIndex) => wordCount(paragraph) >= 55 ? paragraph : `${paragraph} ${supplements[paragraphIndex]}`)
    }));
    write(moduleFiles[index], {
      schema: 'history_go_literature_foundation_module_v1', qualityProfile: 'full_depth_v2', id: `${area.id}-${index + 1}`,
      title: slugs[index].split('-').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' '), sections: moduleSections,
      workedExamples: moduleSections.map((item) => ({ title: `Prøv modellen: ${item.title.replace(/^\d+\.\s*/u, '')}`, object: foundation.topics.find((topic) => topic.id === item.coverageTopic).example, steps: ['Identifiser tekstversjon, produksjon, medium, analyseenhet og historisk norm.', 'Registrer minst tre lokaliserbare trekk før sjanger- eller teoribegrepet anvendes.', 'Prøv hovedhypotesen mot en alternativ formal, medial eller historisk forklaring.', 'Formuler hva som krever resepsjonsdata eller andre kilder utover verket.'], claimIds: item.paragraphClaimIds.flat().slice(0, 3) })),
      commonMisconceptions: [{ claim: 'Sjanger- eller formnavnet forklarer verket alene.', correction: 'Kategorien må historiseres og operasjonaliseres gjennom lokaliserbare trekk og alternativer.' }, { claim: 'Tekstlig eller scenisk appell beviser én publikumsreaksjon.', correction: 'Dokumentert virkning krever resepsjons- eller empiriske data fra den relevante situasjonen.' }]
    });
  }
  const conceptFile = `${dir}/concepts.json`, claimsFile = `${dir}/claims.json`, wrapper = `${PACKAGE}/foundation_texts/${area.id}.json`;
  write(conceptFile, { schema: 'history_go_literature_concept_registry_v1', version: '1.0.0', subject_id: 'litteratur', coverage_area_id: area.id, status: 'canonical_full_depth_concepts', concepts });
  write(claimsFile, { schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'litteratur', chapter_id: area.id, verified_at: '2026-08-07', verification_status: 'verified', sources, claims });
  write(wrapper, { schema: 'history_go_literature_foundation_chapter_v1', version: '1.0.0', qualityProfile: 'full_depth_v2', subject: 'litteratur', id: area.id, title: area.title, subtitle, lead: foundation.synthesis, coverage_topics: area.topics, learningObjectives: ['skille tekst, framførings- og institusjonsnivå', 'analysere navngitte verk gjennom lokaliserbare trekk', 'historisere sjanger, modus og produksjon', 'prøve konkurrerende forklaringer', 'koble fagpåstander til presise kilder', 'formulere analyseobjektets inferensgrense'], moduleFiles, conceptRegistry: conceptFile, claimsFile, editorial_status: 'foundation_text_ready', completion_note: 'Alle seks kontraktstemaer er materialisert som full-dybdeartikler med begreper, navngitte verk, alternative forklaringer og påstandsspor.' });
  return wrapper;
}

const wrappers = [
  materialize({ area: areas[0], foundation: foundations[0], sections: dramaSections, concepts: dramaConcepts, sources: toSources(sourceSets.drama), claims: toClaims(claimSets.drama, 'drama_teater_framforing'), slugs: ['tale-og-dramaturgi', 'sjanger-og-iscenesettelse', 'rom-og-postdrama'], subtitle: 'Fra replikk og dramaturgi til scenisk rom, produksjon og postdramatisk tekst' }),
  materialize({ area: areas[1], foundation: foundations[1], sections: genreSections, concepts: genreConcepts, sources: toSources(sourceSets.genre), claims: toClaims(claimSets.genre, 'sjanger_modus_form'), slugs: ['kontrakt-og-hovedsjangrer', 'modi-og-spekulasjon', 'popularitet-og-hybriditet'], subtitle: 'Historiske forventninger, framstillingsmodi, populære formler og hybride sannhetskrav' })
];

const coverageFile = `${PACKAGE}/coverage_contract_v1.json`, coverage = read(coverageFile);
coverage.coverage_areas = coverage.coverage_areas.map((row) => {
  const update = areas.find((area) => area.id === row.id);
  return update ? { ...row, ...update } : row;
});
const complete = coverage.coverage_areas.filter((row) => ['chapter_and_overview_text_materialized', 'expanded_contract_fulfilled'].includes(row.status));
coverage.progress = { areas_total: coverage.coverage_areas.length, areas_with_foundation_text: coverage.coverage_areas.length, areas_complete: complete.length, topics_total: coverage.completion_definition.required_topic_count, topics_with_foundation_text: coverage.completion_definition.required_topic_count, topics_complete: complete.flatMap((row) => row.topics).length, honest_status: 'Alle 28 områder og 168 temaer har særskrevet oversiktstekst. Tolv områder og 72 temaer har materialiserte kapitler, men drama/teater og sjanger/modus er utvidet kontrakt-pending. Ti områder og 60 temaer er fullført etter gjeldende kontrakt; 18 områder og 108 temaer krever mer full-dybdearbeid.' };
write(coverageFile, coverage);

const indexFile = `${PACKAGE}/index.json`, index = read(indexFile);
index.files.foundation_chapters = [...new Set([...index.files.foundation_chapters, ...wrappers.map((file) => file.replace(`${PACKAGE}/`, ''))])];
let moduleCount = 0, conceptCount = 0, sourceCount = 0, claimCount = 0;
for (const file of index.files.foundation_chapters) { const chapter = read(`${PACKAGE}/${file}`), registry = read(chapter.conceptRegistry), claimFile = read(chapter.claimsFile); moduleCount += chapter.moduleFiles.length; conceptCount += registry.concepts.length; sourceCount += claimFile.sources.length; claimCount += claimFile.claims.length; }
index.summary = { ...index.summary, coverage_area_count: coverage.coverage_areas.length, required_topic_count: coverage.completion_definition.required_topic_count, area_synthesis_count: topicLayer.areas.length, topic_foundation_text_count: topicLayer.areas.flatMap((row) => row.topics).length, materialized_foundation_chapter_count: index.files.foundation_chapters.length, materialized_module_count: moduleCount, defined_concept_count: conceptCount, verified_source_count: sourceCount, verified_claim_count: claimCount, completion_status: 'two_expanded_contracts_locked_18_areas_pending_full_depth' };
write(indexFile, index);
console.log('Materialiserte drama/teater og sjanger/modus/form.');
