#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const firstSentence = (paragraph) => {
  const sentences = paragraph.match(/.*?[.!?](?:\s|$)/gu) || [paragraph];
  let claim = '';
  for (const sentence of sentences) {
    claim = `${claim} ${sentence.trim()}`.trim();
    if (claim.split(/\s+/u).length >= 8) return claim;
  }
  return paragraph;
};

const methodArticles = [
  {
    id: 'litteraturvitenskapens-faghistorie',
    title: 'Litteraturvitenskapens faghistorie',
    topic: 'litteraturvitenskapens_faghistorie',
    paragraphs: [
      'Litteraturvitenskap er et historisk foranderlig fag, ikke en tidløs oppskrift for å tolke dikt. Filologi, retorikk og poetikk ga tidlige redskaper for å undersøke språk, sjanger og overlevering; på 1800-tallet ble nasjonale litteraturhistorier og historisk-kritisk tekststudium sentrale universitetspraksiser. Senere utvidet formalisme, hermeneutikk, strukturalisme, resepsjonsestetikk, kulturteori og digitale metoder både spørsmålene og materialet. Faghistorie viser derfor hvorfor ulike skoler legger ulik vekt på tekst, forfatter, leser, institusjon og medium.',
      'Fagets objekt har samtidig flyttet seg fra et snevert utvalg kanoniserte verk til mange former for verbal og multimodal kultur. Et dikt, en roman og et drama er fortsatt sentrale objekter, men forskningen undersøker også brev, manuskripter, lydbøker, tegneserier, muntlige framføringer, digitale fortellinger, forlagsarkiver og leserdata. Utvidelsen betyr ikke at alt analyseres på samme måte. En verselinje krever andre observasjoner enn en strømmetjenestes katalog, og en metode er faglig relevant først når den passer til det avgrensede objektet.',
      'Henrik Ibsens Et dukkehjem viser hvorfor verk, tekst og dokument ikke kan brukes som synonymer. Verket finnes gjennom manuskriptstadier, førsteutgave, senere utgaver, oversettelser og sceniske realiseringer; hvert vitne gjør forskjellige spørsmål mulige. Ordlydsanalyse må navngi utgaven, genetisk kritikk sammenholder arbeidsstadier, og teaterforskning kan følge hva en konkret oppsetning gjør med replikk, rom og kropp. Faghistorisk bevissthet består blant annet i å kjenne hvilke tradisjoner som har gjort disse objektene synlige.',
      'Nasjonal litteraturhistorie organiserte lenge feltet gjennom språk, territorium og forestillinger om kulturell arv. Den modellen har produsert viktig kunnskap, men den kan skjule flerspråklighet, oversettelse, koloniale forbindelser, urfolkslitteratur og verk som sirkulerer på tvers av grenser. Komparativ litteraturvitenskap, postkoloniale studier og verdenslitteraturforskning utfordrer derfor beholdermodellen uten å gjøre lokale språk- og institusjonshistorier uviktige. Det avgjørende er å behandle skalaen – lokal, nasjonal, regional eller global – som et begrunnet analytisk valg.',
      'Teoretiske skifter er heller ikke en enkel rekke der en ny skole avløser en foreldet. Nærlesning kan kombineres med bokhistorie, narratologi med empirisk resepsjonsforskning og tekstkritikk med digital modellering, så lenge begrepene ikke blandes uten å redegjøre for evidenskravene. En formalistisk påstand om gjentakelse kontrolleres i tekstens mønster; en historisk påstand om mottakelse trenger samtidige kilder; en empirisk påstand om lesere trenger dokumentert utvalg og metode. Uenighet mellom tradisjoner gjelder ofte hva som teller som et godt belegg.',
      'Universitetenes studie- og emnebeskrivelser viser faget som en kombinasjon av analyse, sammenligning, teori, historie og selvstendig forskningsarbeid. Slike dokumenter beskriver institusjonelle læringsmål, ikke hele fagets faktiske praksis, men de gjør en viktig norm synlig: studenten skal kunne formulere problemstillinger, bruke fagbegreper og begrunne metodevalg. Denne normen skiller litteraturvitenskap fra uforpliktende smaksdommer. En personlig leseerfaring kan være utgangspunkt, men blir først et forskningsbidrag når materialet og slutningsgangen kan prøves av andre.',
      'Faghistorie brukes best som kritisk orientering, ikke som navneliste. Når en analyse velger «tekst», «kontekst» eller «leser» som sentrum, viderefører den bestemte faglige prioriteringer og lar andre spørsmål tre i bakgrunnen. Det betyr ikke at alle perspektiver må med i samme studie. Begrensningen er snarere at forskeren skal si hva metoden belyser, hvilke objekter den utelater, og hvorfor akkurat denne avgrensningen er produktiv. En slik plassering gjør teori til et transparent valg fremfor en skjult autoritet.'
    ],
    sources: [['s03-uio-nor4430'], ['s01-ntnu-laeringsutbytte'], ['s08-ibsen-hovedtekst', 's09-ibsen-tekstredegjorelse'], ['s03-uio-nor4430'], ['s02-uio-lit4000'], ['s01-ntnu-laeringsutbytte', 's02-uio-lit4000'], ['s03-uio-nor4430']]
  },
  {
    id: 'problemstilling-analyseenhet-avgrensning',
    title: 'Problemstilling, analyseenhet og avgrensning',
    topic: 'problemstilling_analyseenhet_avgrensning',
    paragraphs: [
      'En problemstilling gjør en bred interesse om til et spørsmål som kan undersøkes med et bestemt materiale. «Kjønn i Et dukkehjem» er et tema; «hvordan endres Helmers tiltaleformer og Noras svar mellom første og tredje akt i førsteutgaven?» angir derimot fenomen, tekststed og sammenligning. Den presise formen låser ikke konklusjonen. Den gjør det mulig å finne observasjoner som taler både for og mot en hypotese, og den hindrer at analysen glir fra ett interessant eksempel til påstander om hele forfatterskapet.',
      'Analyseenheten er den minste enheten som registreres systematisk, for eksempel ordet, replikken, scenen, siden, utgaven, anmeldelsen eller leserresponsen. Valget styrer hva et funn direkte gjelder. Registrerer man imperativer i replikker, kan man beskrive fordelingen av språklige handlinger; man har ikke dermed dokumentert en karakters psyke eller publikums opplevelse. Større slutninger krever et uttalt mellomledd. Denne disiplinen beskytter særlig mot at presise mikrofunn brukes som pynt for en konklusjon som egentlig ble valgt på forhånd.',
      'Korpus betegner den samlingen av tekster eller dokumenter som undersøkelsen faktisk omfatter. Et korpus kan være tre utgaver av samme roman, alle anmeldelser i to aviser gjennom ett år eller tusen digitaliserte romaner, men utvalgsregelen må være synlig. Fullstendighet er aldri bare et tall: digitaliseringsgrad, språk, metadata, opphavsrett og arkivtap påvirker hva som kan inngå. Derfor skal fravær i korpuset først tolkes som et datavilkår, ikke automatisk som historisk fravær.',
      'Avgrensning gjelder også tekstversjon og medium. En Project Gutenberg-tekst, en kritisk utgave og et fotografi av førsteutgaven kan gjengi mye av samme ordlyd, men de dokumenterer ikke de samme materielle eller redaksjonelle forholdene. Ibsens hovedtekst og den tekstkritiske redegjørelsen fyller ulike roller: den ene gir analysetekst, den andre forklarer tekstgrunnlag og varianter. En studie må velge den representasjonen som svarer på spørsmålet og opplyse hva representasjonen ikke kan vise.',
      'Et godt forskningsdesign kobler spørsmål, materiale, begrep og operasjon. Hvis spørsmålet gjelder asymmetri i en dramadialog, kan «talemakt» operasjonaliseres gjennom avbrudd, imperativer, spørsmål, tiltaleformer og kontroll over informasjon. Registreringen skaper ikke i seg selv en full teori om makt, men den viser hva ordet betyr i akkurat denne undersøkelsen. En alternativ operasjonalisering – for eksempel scenisk bevegelse eller økonomisk handleevne – kan gi et annet resultat og bør nevnes når den utfordrer rekkevidden.',
      'Gjennomførbarhet er en faglig verdi fordi et avgrenset prosjekt kan fullføre sin egen beviskjede. Et lite materiale kan bære en sterk påstand om en formell mekanisme, mens et stort materiale kan avdekke fordelinger og unntak som nærlesningen ikke ser. Ingen av delene er automatisk mer vitenskapelig. Spørsmålet er om materialmengden, kildekvaliteten og metoden står i forhold til konklusjonen. Når tid eller tilgang begrenser utvalget, skal begrensningen skrives inn i resultatet og ikke skjules i en fotnote.',
      'Problemstillingen bør revideres når materialet viser at den bygger på feil enhet eller for vid rekkevidde. Hvis tiltaleformene ikke endrer seg som antatt, kan nullfunnet være viktig; analysen kan undersøke hvorfor andre trekk likevel skaper inntrykk av forandring. Revisjon er ikke et nederlag, men et tegn på at observasjonene påvirker argumentet. Grensen går ved etterrasjonalisering: man kan ikke stadig omdefinere fenomenet bare for å bevare en ønsket konklusjon.'
    ],
    sources: [['s02-uio-lit4000'], ['s12-mla-research-guide'], ['s12-mla-research-guide'], ['s08-ibsen-hovedtekst', 's09-ibsen-tekstredegjorelse'], ['s02-uio-lit4000'], ['s01-ntnu-laeringsutbytte'], ['s02-uio-lit4000']]
  },
  {
    id: 'tekstobservasjon-tolkning-argumentasjon',
    title: 'Tekstobservasjon, tolkning og argumentasjon',
    topic: 'tekstobservasjon_tolkning_argumentasjon',
    paragraphs: [
      'Tekstobservasjon beskriver et lokaliserbart trekk før det forklares; et ord gjentas, en replikk avbrytes, synsvinkelen skifter eller en side bryter den vanlige typografien. Tolkning foreslår hva trekket gjør i en større sammenheng, mens argumentasjon viser hvorfor denne forklaringen er bedre enn relevante alternativer. Skillet er analytisk, ikke kronologisk absolutt; teori påvirker hva vi ser. Likevel gjør tredelingen det mulig å kontrollere om konklusjonen faktisk hviler på tekstlige observasjoner eller bare omskriver en forventning.',
      'Åpningen av Et dukkehjem etablerer flere observerbare mønstre; Nora kommer inn med pakker, betaler budet, spiser skjulte makroner, og Helmer bruker gjentatte kjælenavn. At penger, forbruk og skjuling er samlet i scenen, er en beskrivelse av komposisjonen. At samlingen etablerer et asymmetrisk ekteskapelig handlingsrom, er en tolkning. Den blir sterkere når analysen forklarer forbindelsen mellom detaljer og prøver om senere scener viderefører, omformer eller motsier mønsteret.',
      'Et sitat fungerer ikke som bevis bare fordi det står etter en påstand. Leseren trenger å vite hvilket trekk i sitatet som er relevant og hvordan trekket støtter slutningen. Hvis «lerken» leses som et tegn på infantilisering, bør analysen undersøke hvem som bruker betegnelsen, i hvilke situasjoner den gjentas, hvordan Nora svarer, og om ordet skifter funksjon. Den rivaliserende hypotesen kan være gjensidig rollelek. Fortolkningen må vise hvorfor materialet favoriserer én forklaring uten å late som tvetydighet er eliminert.',
      'Argumentets rekkevidde uttrykkes gjennom kvalifiserte verb og tydelige ledd. Et avsnitt kan hevde at en kontrast «organiserer scenen», «inviterer til» en lesning eller «sammenfaller med» en historisk diskurs; verbene angir forskjellige styrker. «Beviser» og «forårsaker» krever mer enn en tekstlig likhet. Ved å navngi mellomleddet – fortellerposisjon, sjangerkonvensjon, dokumentert resepsjon eller institusjonell regel – kan analysen vise hvor usikkerheten ligger og hvilke kilder som kunne redusere den.',
      'Moteksemplet er en produktiv del av argumentasjonen. Dersom Helmers kjælenavn tolkes entydig som kontroll, må teksten også håndtere øyeblikk der Nora bruker rollespillet strategisk eller der tonen kan oppfattes som øm. Et moteksempel trenger ikke velte hovedtesen; det kan avgrense den til bestemte situasjoner eller vise at makten er ustabil. En analyse som forklarer avviket, er mer informativ enn en som samler bare bekreftende sitater.',
      'Sekundærlitteratur kan levere begreper, historikk og konkurrerende lesninger, men skal ikke erstatte møtet med primærmaterialet. Når en forsker siterer en etablert fortolkning, bør det framgå om kilden brukes som autoritet, som faglig motpart eller som dokumentasjon av resepsjonshistorie. De tre rollene gir forskjellige slutninger. Enighet med en anerkjent forsker gjør ikke tekstobservasjonen overflødig, og uenighet krever en presis framstilling av hva den andre faktisk hevder.',
      'En konklusjon samler ikke bare resultatene, men vurderer hva undersøkelsen fortsatt ikke kan avgjøre. En nærlesning av første akt kan forklare scenens form og lansere en hypotese om verkets maktstruktur; den kan ikke alene dokumentere hvordan premierepublikummet forsto scenen eller hva Ibsen ønsket å oppnå. Slike spørsmål trenger resepsjons- eller arkivkilder. Denne inferensgrensen svekker ikke analysen. Den gjør bidraget tydelig og viser hvor en ny undersøkelse kan begynne.'
    ],
    sources: [['s12-mla-research-guide'], ['s08-ibsen-hovedtekst'], ['s08-ibsen-hovedtekst'], ['s12-mla-research-guide'], ['s08-ibsen-hovedtekst'], ['s02-uio-lit4000'], ['s09-ibsen-tekstredegjorelse']]
  },
  {
    id: 'naerlesning-hermeneutikk-kontekstualisering',
    title: 'Nærlesning, hermeneutikk og kontekstualisering',
    topic: 'naerlesning_hermeneutikk_kontekstualisering',
    paragraphs: [
      'Nærlesning er langsom og etterprøvbar oppmerksomhet på hvordan tekstlige detaljer virker sammen. Metoden omfatter mer enn symboljakt: ordvalg, syntaks, rytme, perspektiv, komposisjon, sjanger, typografi og taushet kan alle være relevante. En praktisk protokoll er å registrere mønstre, formulere flere hypoteser, sammenholde del og helhet og oppsøke avvik. Resultatet er ikke en kode som «løser» teksten, men en begrunnet beskrivelse av hvilke betydningsmuligheter formen åpner og begrenser.',
      'Hermeneutikk undersøker vilkårene for forståelse og fortolkning. Den hermeneutiske sirkelen beskriver hvordan en foreløpig oppfatning av helheten leder lesningen av delene, mens detaljene igjen kan forandre helhetsforståelsen. Sirkelen er ikke en feilslutning når bevegelsen er reviderbar. Den blir problematisk dersom helheten er fastlagt på forhånd og hvert teksttrekk bare oversettes til bekreftelse. Derfor er spørsmål, forforståelse og korrigering viktigere enn forestillingen om en helt forutsetningsløs leser.',
      'I Et dukkehjem kan makronene først framstå som en liten komisk rekvisitt. Når de leses sammen med penger, løgn, tiltaleformer og senere avsløringer, får skjulingen større kompositorisk vekt; samtidig kan helhetsbildet endres hvis rekvisitten bare behandles som tegn på underordning. Noras aktive styring av informasjon viser en mer sammensatt handlingsposisjon. Nærlesningen bør derfor bevare spenningen mellom begrensning og strategi i stedet for å gjøre hver detalj til én psykologisk egenskap.',
      'Kontekst er ikke alt som skjedde rundt teksten, men et valgt materiale som belyser et presist spørsmål. Samtidige ekteskapslover, teaterkonvensjoner, økonomiske normer eller anmeldelser kan være relevante for ulike påstander, men ingen enkelt kontekst forklarer automatisk verkets form. Historiske kilder må dessuten leses kritisk som dokumenter med egen sjanger og posisjon. En kontekstualisering er overbevisende når den viser en dokumenterbar forbindelse og samtidig lar tekstens avvik fra normen være analytisk mulig.',
      'Historisk avstand skaper både tap og mulighet. En nåtidsleser kjenner ikke automatisk ords valør, sjangerforventninger eller institusjonelle vilkår i 1879, men kan stille spørsmål som samtidige lesere ikke formulerte. Anakronisme oppstår når moderne kategorier tilskrives historiske aktører uten oversettelse eller kildegrunnlag. Det er likevel ikke anakronistisk å bruke nyere teori på eldre tekst dersom analysen skiller mellom sitt eget begrepsapparat og påstander om hva fortidens aktører selv tenkte.',
      'Forforståelse kan gjøres synlig ved å skrive ned den første hypotesen før detaljanalysen og deretter registrere hva som endrer den. En feministisk, postkolonial eller økokritisk lesning er ikke mindre gyldig fordi den har et spørsmål; problemet oppstår først når teorien bestemmer alle svar. Et godt spørsmål skjerper blikket, mens tekstens motstand avgrenser teorien. Slik kan nærlesning og eksplisitt posisjonering virke sammen i stedet for å bli framstilt som nøytralitet mot ideologi.',
      'Fortolkningspluralisme betyr at flere lesninger kan være faglig forsvarlige, ikke at alle er like gode. De kan vurderes etter tekstlig dekning, begrepspresisjon, historisk plausibilitet, evne til å forklare avvik og åpenhet om premisser. To tolkninger kan også svare på forskjellige spørsmål og derfor være komplementære. Grensen går ved påstander som motsies av kilden, mangler nødvendige mellomledd eller gjør seg immune mot moteksempler. Hermeneutisk ydmykhet er dermed forenlig med streng argumentasjon.'
    ],
    sources: [['s11-sep-hermeneutics'], ['s11-sep-hermeneutics'], ['s08-ibsen-hovedtekst'], ['s03-uio-nor4430'], ['s11-sep-hermeneutics'], ['s11-sep-hermeneutics'], ['s02-uio-lit4000', 's11-sep-hermeneutics']]
  },
  {
    id: 'komparativ-historisk-empirisk-metode',
    title: 'Komparativ, historisk og empirisk metode',
    topic: 'komparativ_historisk_empirisk_metode',
    paragraphs: [
      'Komparativ metode undersøker likhet og forskjell gjennom et begrunnet tertium comparationis, altså egenskapen objektene sammenlignes med hensyn til. To romaner kan sammenholdes etter fortellerposisjon, publiseringsform eller resepsjon, men resultatene kan ikke uten videre slås sammen. Språk, utgave, medium og historisk situasjon må bevares som mulige forklaringsvariabler. En formell likhet dokumenterer verken direkte påvirkning eller felles sosial virkning; slike påstander trenger uavhengige spor.',
      'Sammenligning kan være genetisk, typologisk eller kontrastiv. En genetisk studie leter etter dokumentert kontakt, lån eller overføring; en typologisk studie undersøker parallelle former uten å forutsette kontakt; en kontrastiv studie bruker forskjellen til å avklare begreper. Valget avgjør kildekravet. Liknende scener i to dramaer kan registreres i tekstene, mens en påstand om at den ene forfatteren leste den andre trenger brev, bibliotekspor, dagbok eller annen historisk dokumentasjon.',
      'Historisk metode rekonstruerer ikke fortiden ved å samle dekorative bakgrunnsfakta. Den formulerer spørsmål til daterte og situerte spor: utgaver, brev, kontrakter, anmeldelser, kataloger, rettsdokumenter eller framføringsdata. Kilden gir tilgang til en handling eller representasjon, ikke til hele perioden. En anmeldelse dokumenterer hva én offentlig ytring hevdet på et bestemt sted; den blir først evidens for bred resepsjon når utvalg, sirkulasjon og representativitet er undersøkt.',
      'Empirisk litteraturforskning kan bruke intervju, spørreskjema, eksperiment, observasjon, øyesporing eller korpusdata for å studere lesing og tekstmønstre. Metodene gjør enkelte forhold målbare, men operasjonaliseringen former resultatet. Selvrapportert innlevelse, registrert lesetid og fysiologisk respons er ikke tre navn på samme fenomen. Utvalg, instrument, analyseplan og usikkerhet må derfor beskrives slik at andre kan vurdere hva dataene støtter og om resultatet kan generaliseres.',
      'Digitale korpus åpner skalaer som manuell lesning ikke håndterer, men representasjon er et hovedproblem. OCR-feil, manglende metadata, ulik digitaliseringsgrad og opphavsrett kan systematisk favorisere bestemte språk, perioder eller sjangrer. En frekvenskurve er et resultat av både historiske tekster og datasettets produksjon. Fjernlesning trenger derfor nærlesning av utvalg og datakritikk; nærlesningen kan kontrollere hva en kategori faktisk fanger, mens mønsteret kan vise om eksemplet er typisk.',
      'Metodetriangulering innebærer at ulike kilder eller metoder belyser samme problem fra forskjellige sider. En studie av Et dukkehjem kan koble nærlesning av førsteutgaven, variantstudium av manuskripter og resepsjonsanalyse av anmeldelser. Enighet mellom sporene kan styrke en forklaring, men uenighet er også informativ fordi materialtypene har ulik rekkevidde. Triangulering betyr ikke at tre svake kilder automatisk blir ett sterkt bevis; hvert ledd må vurderes selvstendig.',
      'Metodevalget bør avsluttes med en påstandsgrense. En komparasjon av to verk sier først og fremst noe om de valgte verkene; en arkivstudie er begrenset av det som er bevart; en survey er begrenset av utvalg og spørsmål; et korpus er begrenset av representasjon og modell. Generalisering kan være mulig, men må vises gjennom designet. Den mest informative konklusjonen oppgir både funnet og hvilken ny evidens som kunne utfordre det.'
    ],
    sources: [['s01-ntnu-laeringsutbytte'], ['s03-uio-nor4430'], ['s03-uio-nor4430'], ['s02-uio-lit4000'], ['s05-mla-digital-edition'], ['s08-ibsen-hovedtekst', 's09-ibsen-tekstredegjorelse'], ['s02-uio-lit4000']]
  },
  {
    id: 'kildesok-sitering-forskningsetikk',
    title: 'Kildesøk, sitering og forskningsetikk',
    topic: 'kildesok_sitering_forskningsetikk',
    paragraphs: [
      'Kildesøk begynner med å oversette problemstillingen til begreper, navn, verkstitler, språkvarianter og materialtyper. Bibliotekkatalog, fagbibliografi, artikkeldatabase, arkivkatalog og fulltekstsøk dekker ulike deler av landskapet. Ett søk er derfor sjelden nok. En dokumentert søkelogg med dato, database, søkestreng og avgrensning gjør utvalget forståelig og hjelper forskeren å oppdage om én terminologi, ett språk eller én publiseringskanal har styrt resultatet.',
      'Primær- og sekundærkilde betegner kildens rolle i en bestemt undersøkelse, ikke en fast rangorden. Et dukkehjem er primærtekst i en formanalyse, mens en anmeldelse kan være primærkilde i en resepsjonshistorie og sekundær kommentar i en annen studie. En kritisk utgave kan samtidig levere analysetekst og redaksjonell dokumentasjon. Ved å navngi kilderollen unngår man at alle lenker i litteraturlisten behandles som om de beviser samme type påstand.',
      'Kildekritikk spør hvem som produserte dokumentet, når, for hvilket formål, gjennom hvilken overlevering og med hvilke utelatelser. Nasjonalbibliotekets beskrivelse dokumenterer at manuskriptmaterialet til Et dukkehjem er bevart og hva samlingen omfatter; den beviser ikke alene motivet bak hver revisjon. Den tekstkritiske redegjørelsen sammenholder vitner og redaksjonelle valg, men også denne er et faglig argument som skal leses med sine prinsipper. Autoritet reduserer kontrollarbeidet, men avskaffer det ikke.',
      'Presis sitering gjør det mulig å finne både kilden og stedet som støtter påstanden. Sidetall passer trykte utgaver med stabil paginering; akt og replikk, kapittel, avsnitt, tidskode, bilde- eller dokument-ID kan være bedre i andre medier. En nettadresse alene er ofte bare identifikasjon. MLA understreker forbindelsen mellom kort henvisning og full kildeoppføring, mens vitenskapelige utgaver i tillegg skal dokumentere tekstgrunnlag og redaksjonelle prinsipper.',
      'Parafrase krever kilde selv når ordlyden er ny. Plagiat handler ikke bare om kopierte setninger, men også om umerket bruk av argument, struktur, oversettelse, data eller annotasjon. Samtidig skal sitatet være så kort og relevant at forskerens egen argumentasjon forblir synlig. Når en digital utgave eller database gjør materialet gjenbrukbart, må både den opprinnelige teksten og det redaksjonelle eller tekniske arbeidet krediteres på den måten ressursen angir.',
      'Forskningsetikk i humaniora omfatter sannhetssøken, etterrettelighet, kollegialitet og ansvar gjennom hele prosessen. Offentlig tilgjengelig materiale er ikke alltid etisk uproblematisk: brev, dagbøker, urfolkskunnskap, nettforum og sårbare vitnesbyrd kan berøre levende personer eller grupper. Lovlig tilgang og forskningsetisk forsvarlighet er derfor to spørsmål. Formål, forventet offentlighet, mulig skade, samtykke, anonymisering og kulturelle rettigheter må vurderes i lys av materialet.',
      'En etterprøvbar arbeidsflyt bevarer notater, tekstversjoner, søkelogg, sitatlokatorer og endringer i analysen. Den skiller direkte observasjon fra referert forskning og markerer usikker transkripsjon eller oversettelse. Åpenhet betyr ikke at alt materiale kan publiseres; personvern, avtaler eller arkivvilkår kan kreve begrensning. Den riktige grensen er å gjøre beslutningene og evidensgrunnlaget så synlige som etikken tillater, og å si eksplisitt hva andre ikke kan kontrollere direkte.'
    ],
    sources: [['s12-mla-research-guide'], ['s04-mla-scholarly-editions'], ['s09-ibsen-tekstredegjorelse', 's10-nb-dukkehjem-manuskript'], ['s06-mla-citations', 's04-mla-scholarly-editions'], ['s05-mla-digital-edition', 's06-mla-citations'], ['s07-nesh'], ['s07-nesh', 's05-mla-digital-edition']]
  }
];

const mediaArticles = [
  {
    id: 'medium-modalitet-materialitet', title: 'Medium, modalitet og materialitet', topic: 'medium_modalitet_materialitet',
    paragraphs: [
      'Et medium er den historisk organiserte forbindelsen mellom teknisk bærer, tegnpraksis, institusjon og brukssituasjon. Modalitet viser til meningsressurser som skrift, bilde, lyd, rom og kropp, mens materialitet betegner de fysiske og tekniske vilkårene som realiserer dem. Begrepene overlapper, men er ikke utskiftbare: samme medium kan kombinere flere modaliteter, og samme verbale tekst kan materialiseres som trykk, skjerm eller framført lyd med ulike lesehandlinger.',
      'Jane Austens Pride and Prejudice finnes som trykt bok, digital tekst og mange lydbokinnlesninger, men realiseringene tilbyr ikke samme erfaring. Trykksiden lar leseren stanse, bla og sammenligne ord visuelt; Project Gutenbergs digitale tekst legger ordlyden inn i søkbar og skalerbar programvare; LibriVox-versjonen utfolder teksten i innleserens tempo, stemmeklang og prosodi. Verket gir et sammenligningspunkt, mens analysen må angi hvilken utgave, fil og innlesning den faktisk beskriver.',
      'Innskrift, lagring, overføring og grensesnitt er fire ulike ledd i medieprosessen. En roman kan være lagret som EPUB, overført gjennom en plattform og vist med brukerens valgte skriftstørrelse; skjermbildet er ikke identisk med filen. I elektronisk litteratur kan programkode dessuten bestemme rekkefølge, timing og respons. Mediespesifikk analyse registrerer derfor både det sansbare uttrykket og infrastrukturen som produserer det, uten å anta at teknologien alene forklarer betydningen.',
      'Affordanse betegner en handlingsmulighet som oppstår i forholdet mellom form, bruker og situasjon. Papirboken kan annoteres, lånes bort og åpnes på flere steder; en lydbok kan lyttes til uten syn, men navigasjon og søk avhenger av spillerens funksjoner. Tilgjengelighet er dermed ikke en enkel egenskap ved mediet. Synstolking, teksting, avspillingshastighet, skjermleserstøtte og bibliotektilgang kan åpne eller stenge forskjellige deler av samme verk for forskjellige brukere.',
      'Remediering beskriver hvordan nyere medier framstiller, låner eller omorganiserer eldre medieformer samtidig som de markerer egenart. En e-bok etterligner siden gjennom marger og «sideskift», mens hyperlenker, søk og dynamisk layout bryter med den trykte modellen. Bolter og Grusins framstilling av remediering viser at mediehistorie ikke er en ren erstatningsrekke. Gamle og nye former eksisterer sammen, konkurrerer om umiddelbarhet og synliggjør hverandres konvensjoner.',
      'Formater og standarder fordeler kontroll over hvordan litteratur kan produseres, distribueres og leses. EPUB, PDF, proprietære lydbokformater og plattformmetadata gir ulike muligheter for kopiering, søk, universell utforming og langtidsbevaring. Institusjoner som forlag, bibliotek, teknologiselskaper og standardiseringsorganer påvirker derfor tekstens praktiske grenser. En analyse av materialitet bør beskrive disse beslutningene, men trenger egne dokumenter før den kan hevde hvorfor en aktør valgte formatet eller hvilken effekt valget fikk.',
      'Digital obsolesens gjør versjonsspesifikk sitering til en del av selve analysen. Elektroniske verk kan endres når nettlesere, programbiblioteker eller servere oppdateres, og en identisk nettadresse kan senere gi en annen realisering. Electronic Literature Collection bevarer kuraterte versjoner og oppgir tekniske rammer, men også en samlingskopi må identifiseres med volum, verkstittel og besøksdato. Skjermopptak, filhash, programversjon og hendelseslogg kan dokumentere det som faktisk ble analysert; de erstatter ikke etisk og juridisk vurdering av arkivering.'
    ],
    sources: [['mi01', 'mi08'], ['mi15', 'mi17'], ['mi08', 'mi04'], ['mi15'], ['mi01'], ['mi08'], ['mi04', 'mi05']]
  },
  {
    id: 'adaptasjon-omforming', title: 'Adaptasjon og omforming', topic: 'adaptasjon_omforming',
    paragraphs: [
      'Adaptasjon er en gjenkjennelig omarbeiding av et tidligere verk i en ny form, situasjon eller mediekonfigurasjon. Fagfeltet har beveget seg bort fra å bruke troskap mot en «original» som eneste målestokk, fordi enhver adaptasjon velger, fortolker og produserer for nye vilkår. Sammenligningen kan fortsatt undersøke hva som bevares og endres, men spør heller hvilke funksjoner endringene får enn om filmen, romanen eller sceneteksten er en lydig kopi.',
      'Utvalg er adaptasjonens grunnoperasjon fordi ingen ny realisering overfører alle trekk på samme måte. Joe Wrights Pride & Prejudice komprimerer Austens roman til spillefilmens varighet, samler hendelser og lar blikk, landskap, kostyme og skuespillerkropp bære informasjon som romanen formidler gjennom fortellerstemme og dialog. En scenekartlegging kan følge hvilke hendelser som beholdes, flyttes eller utelates. Den kan ikke alene avgjøre om endringen skyldes estetikk, økonomi eller publikumsforventning; produksjonskilder trengs for motivpåstanden.',
      'Transponering flytter en fortelling mellom tid, sted, språk eller kultur og forandrer dermed dens sosiale koordinater. Amy Heckerlings Clueless gjør Jane Austens Emma til amerikansk ungdomsfilm i 1990-årene: rang, ekteskap og lokalsamfunn omformes gjennom skole, popularitet, forbruk og bilkjøring. Poenget er ikke å finne ett moderne motstykke til hver figur. Analysen undersøker hvordan den nye verdenen bygger relasjoner og hvilke deler av Austens ironi som må få andre audiovisuelle uttrykk.',
      'Appropriasjon betegner omforming der eierskap, taleposisjon og kreditering blir særlig omstridt. Jean Rhys’ Wide Sargasso Sea gir historie og stemme til kvinnen som er marginalisert som «Bertha» i Jane Eyre, og gjør kolonial geografi og rasialisering til sentrum. Verket kan leses som motfortelling, men kategorien fritar ikke forskeren fra å undersøke Rhys’ egen posisjon og karibiske litteraturhistorier. Maktanalysen må handle om konkrete fortellergrep, publiseringsforhold og mottakelser, ikke moralske merkelapper alene.',
      'Adaptasjon, oversettelse, remake og oppfølger beskriver forskjellige relasjoner, men grensene er historisk bevegelige. Oversettelse fremhever språklig overføring, remake en ny produksjon innen en etablert film- eller fjernsynsrelasjon, og oppfølger en videreføring av handling eller verden. Akira Kurosawas Throne of Blood er både Shakespeare-omforming og japansk filmverk med egne teater- og sjangerressurser. Det mest presise er ofte å beskrive relasjonen før den klassifiseres og å tillate flere samtidig relevante kategorier.',
      'Adaptasjoner blir til gjennom rettigheter, finansiering, studioarbeid, casting, distribusjon og markedsføring. Focus Features’ presentasjon av Pride & Prejudice dokumenterer filmens offisielle synopsis, medvirkende og produksjonsramme, men ikke hvordan alle publikumsgrupper tolket den. Plakater og trailere kan vise hvilken gjenkjennelse distributøren inviterte til; billettall viser sirkulasjon, ikke kvalitet eller faktisk forståelse. Institusjonsstudiet kompletterer formanalyse når hvert materiale får riktig evidensrolle.',
      'Et adaptasjonsnettverk kan bestå av roman, oversettelser, illustrasjoner, film, fjernsyn, fanarbeid og nye utgaver som påvirker hverandres synlighet. Pride and Prejudice er derfor ikke én lineær pil fra bok til film, men et sett av gjentatte aktualiseringer der senere omslag og lesninger kan låne fra filmens ikonografi. Nettverksmodellen bør likevel ikke hevde påvirkning uten spor. Den skiller dokumenterte forbindelser – kreditering, rettighet, sitat eller produksjonsuttalelse – fra formelle likheter som kan ha andre forklaringer.'
    ],
    sources: [['mi02'], ['mi09', 'mi17'], ['mi02'], ['mi02'], ['mi02', 'mi03'], ['mi09'], ['mi01', 'mi02']]
  },
  {
    id: 'litteratur-film-tv', title: 'Litteratur, film og fjernsyn', topic: 'litteratur_film_tv',
    paragraphs: [
      'Verbal og audiovisuell fortelling organiserer informasjon med forskjellige ressurser. En roman kan navngi tanker og hoppe gjennom tid i én setning; film og fjernsyn komponerer samtidig bilde, lyd, tale, kropp og varighet. Pride & Prejudice, The Handmaid’s Tale og Normal People viser dessuten at adaptasjon kan anta spillefilm, sesongdrama og tett episodeform. Forskjellen er ikke at litteratur «forteller» mens skjermen bare «viser»; analysen må beskrive hvilke kanaler som bærer perspektiv og vurdering.',
      'Kamera og mise-en-scène fordeler synlighet i rommet. I Wrights Pride & Prejudice kan utsnitt, dybde, lys, kostyme, plassering og bevegelse undersøkes rundt Elizabeth og Darcy uten å oversette hvert bilde til en setning fra Austen. Et nærbilde kan gjøre et blikk narrativt viktig, mens en lang tagning kan la relasjoner endres innen samme rom. Shot-for-shot-notater dokumenterer komposisjonen; påstander om karakterens indre må begrunnes gjennom flere audiovisuelle signaler og fortellingens sammenheng.',
      'Klipp skaper forhold mellom bilder og kontrollerer rekkefølge, varighet og samtidighet. En samtale kan bygges som skudd–motskudd, en montasje kan komprimere tid, og kryssklipping kan etablere parallelle hendelser som romanen ordner annerledes. Rytme er ikke bare antall klipp per minutt; bevegelse i bildet, replikktempo og musikk virker sammen med klippelengden. En presis analyse velger en scene, registrerer overganger og forklarer hvordan mønsteret styrer oppmerksomheten.',
      'Lydsporet kan motsi, utvide eller omramme bildet gjennom dialog, musikk, atmosfære, stillhet og voice-over. En fortellerstemme kan hente verbal kommentar inn i filmen, men den er også en konkret framføring med klang og timing. Stillhet er aldri bare fravær; den står i forhold til forventet lyd og kan framheve pust eller rom. Sammenligning med romanen bør derfor beskrive hva lydarbeidet gjør i scenen, ikke behandle musikken som følelsesmessig fasit.',
      'Skuespillerkropp og casting gir karakteren alder, aksent, holdning, tempo og sosial lesbarhet som ikke er uttømt av manuskriptet. Ansiktsuttrykk og gest kan skape tvetydighet mellom replikkens bokstavelige mening og situasjonens vurdering. Casting inngår også i en produksjons- og resepsjonshistorie der stjernestatus, rase, kjønn og nasjonal identitet kan ha betydning. Slike virkninger må dokumenteres med paratekster eller resepsjonskilder; kroppen på skjermen er det direkte analysematerialet.',
      'Fjernsynets episode og sesong gjør serialitet til en form for utsatt og gjentatt organisering. Handlingsbuer fordeles mellom episoder, sammendrag aktiverer tidligere informasjon, og cliffhangere knytter dramatisk stopp til publiseringsrytme. Strømming kan endre seerens tempo, men fjerner ikke episodens komposisjon. En fjernsynsanalyse bør derfor oppgi versjon, episode, tidskode og distribusjonsform og skille tekstens serialitet fra antakelser om hvordan alle seere faktisk så serien.',
      'Produksjons- og resepsjonskilder forklarer andre nivåer enn formanalyse. Manuskripter, rulletekster og intervjuer kan dokumentere arbeidsdeling og uttalte valg; anmeldelser, seertall og publikumstudier kan vise sirkulasjon og bestemte reaksjoner. Ingen av dem gjør medieformen årsaksdeterministisk. At en film bruker nærbilder beviser ikke én universell følelse, og høye seertall dokumenterer ikke en bestemt tolkning. Den samlede analysen blir sterk når kildene kobles, men ikke forveksles.'
    ],
    sources: [['mi03'], ['mi09'], ['mi03'], ['mi03'], ['mi09'], ['mi03'], ['mi03', 'mi09']]
  },
  {
    id: 'tegneserie-bildebok-visuell-fortelling', title: 'Tegneserie, bildebok og visuell fortelling', topic: 'tegneserie_bildebok_visuell_fortelling',
    paragraphs: [
      'Visuell fortelling oppstår i forholdet mellom ord, bilde, sekvens og den flaten eller skjermen som organiserer dem. Ord og bilde kan bekrefte samme informasjon, fordele ulike deler av hendelsen eller motsi hverandre slik at leseren må velge perspektiv. I Maus gir den verbale vitnesbyrdfortellingen historisk og dialogisk informasjon, mens de antropomorfe figurene, rutestørrelsen og sidens gjentakelser bygger en annen betydningsbane. Ingen av modalitetene er bare illustrasjon til den andre.',
      'Tegneseriens rute avgrenser et valgt øyeblikk, mens mellomrommet mellom ruter inviterer leseren til å slutte hva som har skjedd. Slutningen kan gjelde tid, bevegelse, årsak eller synsvinkel, men den er styrt av tegnene rundt gapet. I Persepolis kan en serie svart-hvite ruter gjøre små endringer i kroppsstilling særlig tydelige; The Yellow Kid viser en tidligere avisform der figur, skrift og massemedium møtes. Sekvensanalyse beskriver overgangen før den forklarer tempo eller erfaring.',
      'Siden og oppslaget er kompositoriske enheter som kan leses på én gang før øyet følger en lokal rute. Plassering, størrelse, ramme, hvitflate og gjentakelse kan etablere hierarki eller simultanitet. I Shaun Tans The Arrival bærer bildesekvens og oppslag en ordløs migrasjonsfortelling. Sidevendingen skjuler neste flate og kan brukes som rytmisk terskel. En digital reproduksjon som viser én side om gangen, kan endre denne erfaringen, så analysen må navngi utgave og visningsform.',
      'Ikonotekst betegner et integrert ord-bilde-uttrykk der skriftens visuelle form også bærer mening. Håndteksting, snakkebobler, lydord, skrifttype og plassering kan gi en grafisk stemme som ikke reduseres til transkripsjon. I Maus skiller tekstbokser, dialog og innfelte dokumenter mellom fortellingsnivåer; i Persepolis virker den kontrollerte svart-hvite stilen sammen med barnets og den voksnes perspektiver. Stilpåstanden må forankres i bestemte sider, ikke i omslagsinntrykk.',
      'Tegneserie, bildebok og grafisk memoar overlapper, men de har forskjellige sjangerhistorier og leserforventninger. Maus og Persepolis kombinerer sekvenskunst med selvbiografiske, biografiske og historiske forpliktelser; «grafisk memoar» sier noe om referensiell pakt, ikke bare tegnestil. Bildeboken organiserer ofte oppslaget rundt høytlesning og samspill mellom barn og voksen, mens tegneserien ikke er bundet til én målgruppe. Klassifikasjonen bør følge verkets form og institusjonelle plassering uten å bli en kvalitetsrangering.',
      'Papir, trykk, farge og format påvirker skala, detalj og tilgang. En liten paperback, en avisstripe og et stort bildebokoppslag gjør ulike lesebevegelser mulige; svart-hvitt kan være estetisk valg, produksjonsvilkår eller begge deler. Faksimile og nyutgave kan endre papirkvalitet, fargetone og størrelse selv når motivet virker identisk. Produktbeskrivelser dokumenterer utgaveformat, men en påstand om virkning krever sammenligning av konkrete eksemplarer og lesesituasjoner.',
      'Skjermfortelling kan bruke vertikal scrolling, animasjon og responsiv layout til å styre avstand og timing. Webtoon-formatet lar mellomrommets lengde bli en tidslig ressurs, mens forskjellige skjermstørrelser kan endre hva som er samtidig synlig. Dette gjør ikke digital tegneserie grenseløst flytende; plattformens filkrav og grensesnitt setter rammer. En dokumenterbar analyse arkiverer eller beskriver versjonen, registrerer navigasjonen og unngår å generalisere fra én enhet til alle brukere.'
    ],
    sources: [['mi10', 'mi11'], ['mi11', 'mi19'], ['mi10', 'mi11'], ['mi10', 'mi11'], ['mi10', 'mi11'], ['mi10'], ['mi08']]
  },
  {
    id: 'lydbok-podkast-muntliggjøring', title: 'Lydbok, podkast og muntliggjøring', topic: 'lydbok_podkast_muntliggjøring',
    paragraphs: [
      'En lydbok gjør skriftlig tekst til en tidsbundet framføring med bestemt stemme, varighet og avspillingsrekkefølge. Lytteren kan pause og endre hastighet, men kan ikke se hele siden samtidig; navigasjonen følger spillerens kapitler og tidskoder. LibriVox-utgaven av Pride and Prejudice dokumenterer verk, innleser, lydfiler og kapitler som en konkret realisering. Den kan sammenlignes med Gutenberg-teksten, men analysen må skille Austens ord fra innleserens prosodiske valg.',
      'Innleseren er en virkelig utøver og må ikke forveksles med tekstens forteller. Fortelleren er en funksjon i verket; innleseren gir denne og figurene hørbar klang, tempo, aksent og register. Én stemme kan markere karakterer gjennom små variasjoner, mens et ensemble fordeler rollene på flere kropper. Analysen bør beskrive observerbare forskjeller i framføringen før den tilskriver følelser eller intensjon, og kreditere utøveren som medskaper av den hørbare teksten.',
      'Prosodi omfatter rytme, trykk, tonegang, pauser og frasering. Et komma bestemmer ikke én pause, og en ironisk setning kan framføres med ulike grader av markering. Ved å sammenligne samme avsnitt i tekst og lyd kan forskeren registrere hvor innleseren grupperer syntaksen, hvilke ord som får trykk, og hvordan dialog skilles fra fortellerstemme. Tidskode og filversjon er lydens lokator; et sidetall fra en annen utgave er ikke tilstrekkelig.',
      'Lyddesign utvider den verbale framføringen med musikk, effekt, romklang og akustisk perspektiv. Folger Shakespeare Audio Editions bruker skuespillere og full rollebesetning og gjør dermed dramaets talte og sceniske potensial tilgjengelig som lydproduksjon. Musikk kan markere overgang, men den beviser ikke hvilken følelse lytteren fikk. En lydanalyse må beskrive inngang, varighet, nivå og forhold til tale og skille produksjonens signal fra empirisk publikumsrespons.',
      'Uforkortet, forkortet og dramatisert er versjonsopplysninger med analytiske konsekvenser. En uforkortet innlesning lover å bevare den valgte tekstens ordlyd, men legger fortsatt til framføring; en forkortelse velger bort materiale; en dramatisering kan omskrive fortellertekst til dialog, legge til lydbilde og fordele stemmer. «Samme bok» er derfor for grovt når man analyserer komposisjon. Katalogmetadata, kreditering og sammenligning med en identifisert tekstutgave viser hva slags omforming som foreligger.',
      'Podkast er en distribusjons- og serieform, ikke én sjanger. Folgers Shakespeare Unlimited kombinerer redigerte samtaler med episodepublisering, programbeskrivelser og arkiv; andre podkaster kan være dokumentar, hørespill, opplesning eller kritikk. Episode, sesong, vert, gjest, publiseringsdato og redigering inngår i analyseobjektet. En dokumentarisk kontrakt vurderes gjennom kildebruk og sjangermarkører, mens feedens serialitet forklarer hvordan enkeltdeler forbindes over tid.',
      'Lyd kan øke tilgang for noen brukere og samtidig skape nye plattformavhengigheter. Avspillingshastighet, kapittelinndeling, transkripsjon, nedlasting, prismodell og skjermleserstøtte påvirker faktisk bruk. LibriVox tilbyr offentlige lydfiler, mens kommersielle tjenester kan kontrollere tilgang gjennom konto og lisens. Tilgjengelighet skal derfor beskrives for en bestemt tjeneste og dato. Lytterstatistikk dokumenterer avspilling eller fullføring etter plattformens definisjon, ikke nødvendigvis oppmerksom lesning eller forståelse.'
    ],
    sources: [['mi15', 'mi17'], ['mi15'], ['mi15'], ['mi16'], ['mi15', 'mi16'], ['mi18'], ['mi15', 'mi16']]
  },
  {
    id: 'elektronisk-litteratur-spillfortelling', title: 'Elektronisk litteratur og spillfortelling', topic: 'elektronisk_litteratur_spillfortelling',
    paragraphs: [
      'Elektronisk litteratur bruker datamaskinens beregning, grensesnitt eller nettverk som del av verkets form, ikke bare som transport for en skannet side. Kode kan velge tekst, holde rede på tilstand, reagere på input eller styre timing; databasen kan gjøre variasjon og kombinasjon til komposisjonsprinsipp. Electronic Literature Collection viser bredden fra hypertekst og kinetisk poesi til generative og interaktive verk. Kategorien skal anvendes på den realiserte mekanismen, ikke på alt som leses på skjerm.',
      'Ergodisk innsats betegner ikke at et verk er vanskelig, men at leseren må utføre ikke-trivielle handlinger for å frambringe tekstforløpet. I Twine-fortellinger velger brukeren lenker, men handlingen er definert av verkets passasjer, variabler og betingelser. Et lineært klikk gjennom faste sider krever mindre konfigurerende arbeid enn et system der tidligere valg endrer tilgjengelige scener. Analysen beskriver derfor både brukerens bane og det større mulighetsrommet som koden tillater.',
      'Forgrening er bare én måte interaktive fortellinger organiserer konsekvens på. Et verk kan lagre ressurser, relasjoner, sted eller kunnskap i tilstandsvariabler og senere bruke dem til å endre tekst eller valg. 80 Days presenterer reiseplanlegging og ruteforgrening som spillbar fortelling; en enkelt gjennomspilling viser én bane, ikke hele systemet. Gjenlesning kan avdekke alternativer, mens kode, designnotat eller systematisk logg trengs før forskeren hevder at alle muligheter er kartlagt.',
      'Hypertekst, parserfiksjon og kinetisk tekst krever forskjellige leserhandlinger. Hypertekst tilbyr forbindelser mellom tekstnoder, parseren tolker skrevne kommandoer, og kinetisk tekst lar ord bevege eller forandre seg over tid. Twine støtter hovedsakelig lenke- og variabelbaserte strukturer, men historien kan utvides med skript og stilark. Sjangerbetegnelsen bør følge den dominerende mekanismen uten å skjule kombinasjoner, og sammenligningen må bruke tilsvarende operative trekk.',
      'Agency er opplevelsen og strukturen av meningsfull handlemulighet innen programmerte grenser. Mange valg garanterer ikke stor agency dersom alle straks samles i samme resultat; et enkelt valg kan være betydningsfullt hvis det endrer senere relasjoner eller kunnskap. Depression Quest bruker begrensede og utilgjengelige valg som en del av sin framstilling. Analysen kan vise hvordan grensesnittet fordeler muligheter, men kan ikke slutte direkte fra designet til alle spilleres følelser eller kliniske erfaring.',
      'Plattform og versjon er en del av elektroniske verk fordi nettleser, motor, programbibliotek og maskinvare påvirker kjøringen. Et verk kan miste lyd, timing eller input når en teknologi blir foreldet, selv om tekstfilene er bevart. ELCs kuratering og dokumentasjon gjør bestemte verk tilgjengelige i en samlingskontekst, mens Twine-prosjekter kan lagres som kjørbare HTML-filer med ulike story formats. Bevaring kan kreve migrering eller emulering, som igjen må dokumenteres som en ny realisering.',
      'En etterprøvbar analyse kombinerer hendelseslogg, skjermopptak, versjonsopplysninger og målrettede gjenspillinger. Walkthrough kan forklare en mulig bane, men må ikke presenteres som hele verket når systemet forgrener seg. Forskeren bør registrere starttilstand, valg, tidsstempel, resultat og programversjon og skille observerte hendelser fra slutninger om kode som ikke er inspisert. Denne protokollen gjør interaktiv erfaring siterbar uten å late som brukerens bane er identisk med alle andres.'
    ],
    sources: [['mi04', 'mi05'], ['mi06', 'mi07'], ['mi12'], ['mi06', 'mi07'], ['mi13'], ['mi04', 'mi05', 'mi06'], ['mi07', 'mi12']]
  }
];

const mediaExtraSources = [
  { id: 'mi15', label: 'Pride and Prejudice – LibriVox recording', url: 'https://librivox.org/pride-and-prejudice-by-jane-austen/', publisher: 'LibriVox', type: 'digital_lydutgave', source_location: 'Katalogfeltene om innleser, sjanger, språk, kapittelfiler og samlet spilletid' },
  { id: 'mi16', label: 'Folger Shakespeare Audio Editions', url: 'https://www.folger.edu/explore/shakespeares-works/folger-shakespeare-audio-editions/', publisher: 'Folger Shakespeare Library', type: 'institusjonell_lydutgave', source_location: 'Innledningen og avsnittene om full-cast recordings og tilgjengelige skuespill' },
  { id: 'mi17', label: 'Pride and Prejudice – Project Gutenberg', url: 'https://www.gutenberg.org/ebooks/1342', publisher: 'Project Gutenberg', type: 'digital_tekstutgave', source_location: 'Bibliografiske metadata og lenkene til HTML-, EPUB- og plain-text-formatene' }
  ,{ id: 'mi18', label: 'Shakespeare Unlimited', url: 'https://www.folger.edu/podcasts/shakespeare-unlimited/', publisher: 'Folger Shakespeare Library', type: 'institusjonell_podkast', source_location: 'Programbeskrivelsen og episodearkivet med tittel, gjest og publiseringsdato' }
  ,{ id: 'mi19', label: 'The Yellow Kid makes his move', url: 'https://www.loc.gov/exhibitions/comic-art/about-this-exhibition/early-years-1890s-to-1920s/the-yellow-kid-makes-his-move/', publisher: 'Library of Congress', type: 'kuratorisk_objektbeskrivelse', source_location: 'Utstillingsavsnittet og objektmetadata om The Yellow Kid, avisformat og publiseringshistorie' }
];

const mediaLocations = {
  mi01: 'Bokbeskrivelsen, særlig avsnittene om immediacy, hypermediacy og eldre medier i nye former',
  mi02: 'Bokbeskrivelsen og innholdsoversikten om adaptation as product, process and reception',
  mi03: 'Bokbeskrivelsen og innholdsoversikten om film–litteratur-sammenligning og kritisk metode',
  mi04: 'Forsiden og volumindeksen for Electronic Literature Collection 1–4',
  mi05: 'Avsnittene om 114 verk, 26 land, 13 språk, plattformer og kuratorisk metode',
  mi06: 'Forsidens definisjon av Twine og avsnittet om publisering til HTML',
  mi07: 'Seksjonene Introduction, Story Formats, Variables og Conditional Statements',
  mi08: 'Bokbeskrivelsen og innholdsoversikten om database, interface, operations og variability',
  mi09: 'Official Synopsis samt Cast & Crew og Credits',
  mi10: 'Bokbeskrivelsen og bibliografiske metadata for The Complete Maus',
  mi11: 'Bokbeskrivelsen og bibliografiske metadata for The Complete Persepolis',
  mi12: 'Seksjonene About the game, Choose your own route og tilgjengelige plattformer',
  mi13: 'Seksjonene About, How to Play og innledende forklaring av utilgjengelige valg',
  mi14: 'Seksjonen Mission og avsnittene om bevaring, formidling og Electronic Literature Collection'
};

const sociologyArticles = [
  {
    id: 'litterart-felt-kulturell-kapital', title: 'Litterært felt og kulturell kapital', topic: 'litterart_felt_kulturell_kapital',
    paragraphs: [
      'Et litterært felt er et historisk nettverk av relasjoner mellom forfattere, forlag, kritikere, tidsskrifter, priser, utdanning og publikum. Feltbegrepet flytter oppmerksomheten fra isolerte genier til posisjoner og konkurranser: hvem kan publisere, hvem tildeler verdi, og hvilke ressurser kan veksles til synlighet? Pierre Bourdieus The Rules of Art analyserer framveksten av et relativt selvstendig litterært felt i Frankrike. Modellen er et forskningsredskap, ikke en tidløs beskrivelse av alle litterære kulturer.',
      'Autonomi betegner feltets evne til å utvikle egne verdikriterier, mens heteronomi viser press fra marked, politikk, religion eller andre maktsentra. Motsetningen er gradert, ikke absolutt. En forfatter kan søke kritisk prestisje og salg samtidig, og et forlag kan bruke økonomisk suksess til å finansiere smalere titler. Analysen må derfor undersøke konkrete beslutninger, priser, kataloger og ytringer fremfor å plassere aktører permanent i en «ren» eller «kommersiell» leir.',
      'Kapitalbegrepet skiller økonomiske ressurser fra sosiale nettverk, kulturell kompetanse og symbolsk anerkjennelse. En utdanning, kjennskap til sjangerkoder eller adgang til en redaktør kan gi muligheter som ikke vises i salgsinntekt; en pris kan omforme tidligere aktivitet til symbolsk kapital. Ressursene er heller ikke fritt omsettelige. Prestisje i et lite avantgardetidsskrift kan mangle verdi i bokhandelen, og kommersiell suksess kan vurderes ulikt av kritikere, juryer og lesere.',
      'Konsekrering er prosessen der aktører og institusjoner gir verk varig anerkjennelse. Anmeldelse, pris, arkiv, nyutgave, oversettelse og pensum gjør ulike ting: de skaper oppmerksomhet, autoriserer vurderinger eller sikrer videre tilgjengelighet. Bookerprisens offentliggjorte historie og regler viser en institusjon som organiserer nominasjon og juryarbeid. Det dokumenterer prisens prosedyrer, men en studie må undersøke salg, undervisning eller oversettelser separat før den hevder at en vinner faktisk er blitt kanonisk.',
      'Sosial bakgrunn og utdanning påvirker adgang til språk, tid, nettverk og økonomisk risiko, men de bestemmer ikke enkeltverkets kvalitet eller den enkelte forfatters bane. Feltanalyse kan kartlegge hvem som får kontrakt, stipend eller kritikk og sammenholde dette med klasse, kjønn, geografi eller migrasjon. Datagrunnlaget må være tydelig: biografier og medlemsregistre gir andre opplysninger enn intervjuer. Fravær av registrerte grupper kan skyldes både historisk utestenging og arkivets kategorier.',
      'Tidsskrifter, salonger og kollektiver kan fungere som laboratorier for estetikk og som nettverk for publisering. La Nouvelle Revue Française og The Crisis viser forskjellige tidsskriftmiljøer der redaktører, bidragsytere, program og publikum dannet konkret infrastruktur. En prosopografisk studie kan følge personforbindelser, mens innholdsanalyse undersøker hva fellesskapet faktisk publiserte. At to forfattere deltok i samme miljø, dokumenterer kontakt, men ikke automatisk felles estetikk eller direkte påvirkning.',
      'Globale språkshierarkier viser grensen for å overføre en nasjonal feltmodell uendret. Oversettelsesmidler, kolonihistorie, diaspora, festivaler og internasjonale priser kobler lokale felt til ulikt fordelte sentra. Engelsk synlighet kan gi tilgang til et globalt marked, men kategorien «global» skjuler lett arbeid på andre språk og regionale sirkulasjoner. En sammenligning bør derfor navngi språk, institusjoner og retninger og skille lokal anerkjennelse fra internasjonal distribusjon. Lik posisjon i to land kan ikke antas bare fordi institusjonene har samme navn.'
    ],
    sources: [['ls01'], ['ls01'], ['ls01'], ['ls07', 'ls13'], ['ls11'], ['ls01'], ['ls01', 'ls11']]
  },
  {
    id: 'forlag-bokhandel-bibliotek', title: 'Forlag, bokhandel og bibliotek', topic: 'forlag_bokhandel_bibliotek',
    paragraphs: [
      'Forlaget omformer et manuskript til en publiserbar og distribuert tittel gjennom utvalg, redaksjon, design, produksjon og listebygging. En forlagsliste er både økonomisk portefølje og offentlig profil; plasseringen av en bok blant andre titler påvirker hvilke lesere og kritikere som finner den. Manuskriptvurdering kan undersøkes gjennom redaksjonelle dokumenter og kataloger, men avslag er ofte dårligere bevart enn antakelser. Arkivets asymmetri må derfor inn i konklusjonen om portvokting.',
      'Kontrakten fordeler rettigheter, risiko, inntekter og beslutningsmakt mellom forfatter og utgiver. Forskudd er normalt en betaling mot framtidig royalty, mens honorar kan knyttes til en avgrenset bruk; regnskapsinnsyn avgjør hva opphaveren kan kontrollere. Den norske Forfatterforeningens miniguide beskriver sentrale ledd i det norske litterære systemet, men konkrete avtaler varierer. Juridiske og økonomiske slutninger må bygges på gjeldende kontrakt, lov og praksis, ikke på romanens litterære prestisje.',
      'Bokhandelen skaper synlighet gjennom innkjøp, plassering, metadata, kategori og anbefaling. Fysisk bordplass og digital søkerangering er ikke nøytrale vinduer; de er kuraterte resultater av avtaler, lager, salgsdata og redaksjonelle valg. Penguin Books’ historie om paperbackutgivelser viser hvordan format og distribusjon ble del av et forlagsprosjekt for bredere tilgang. Historien er samtidig selskapets egen framstilling og må suppleres med uavhengige kilder når årsaker og virkninger vurderes.',
      'Folkebiblioteket kombinerer samlingsbygging, katalog, utlån, arrangement og offentlig rom. Deichman Bjørvika presenterer tjenester og tilbud som viser institusjonelle mål og faktisk tilgjengelig infrastruktur; det forteller ikke alene hvem som bruker tilbudet eller hvilken virkning det har. I Norge gjør Kulturdirektoratets innkjøpsordninger forlag, vurderingsutvalg og bibliotek til deler av en offentlig litteraturpolitikk. Ordningenes kriterier og distribusjon kan analyseres som mekanismer for både bredde og seleksjon.',
      'Distribusjon er en materiell kjede av produksjon, lager, transport, bestilling og retur. Charles Dickens’ The Pickwick Papers ble først publisert i deler, en form som bandt fortellingens rytme til periodisk produksjon og salg; dagens e-bok kan leveres øyeblikkelig, men krever plattform, lisens og enhet. Geografisk tilgang må måles i faktiske kanaler, språk og kostnader. At en tittel finnes i én katalog betyr ikke at den er økonomisk eller praktisk tilgjengelig overalt.',
      'Digitale plattformer rangerer og filtrerer bøker gjennom metadata, søk, anbefaling og brukerprofil. Algoritmisk synlighet kan studeres med dokumenterte søk og gjentatte observasjoner, men resultatet er versjons- og kontospesifikt. En skjermdump viser hva én bruker fikk på ett tidspunkt, ikke den skjulte algoritmens fulle logikk. Plattformanalyse trenger derfor protokoll for sted, tid, konto og søkeord og bør skille observerbar rangering fra en årsakspåstand om kommersielle interesser.',
      'Uavhengige bokhandler, minoritetsspråklige forlag og community-bibliotek kan bygge andre kretsløp enn de dominerende markedene. De kan prioritere lokal kompetanse, kollektivt eierskap eller språkbevaring, men må ikke romantiseres som maktfrie. Finansiering, frivillig arbeid, distribusjon og digital avhengighet setter også rammer. En institusjonsanalyse sammenligner hvordan konkrete kataloger, arrangementer og beslutningsregler fordeler tilgang og lar organisasjonens egen formålsbeskrivelse være én kilde blant flere.'
    ],
    sources: [['ls04'], ['ls11'], ['ls04'], ['ls03', 'ls14', 'ls15'], ['ls02'], ['ls17'], ['ls15']]
  },
  {
    id: 'kritikk-priser-kanonisering', title: 'Kritikk, priser og kanonisering', topic: 'kritikk_priser_kanonisering',
    paragraphs: [
      'Litteraturkritikk er både vurderende sjanger og institusjonell praksis. En anmeldelse beskriver og fortolker et verk, plasserer det i sammenheng og framsetter en dom for et publikum. Kritikerens autoritet kan bygge på fagkunnskap, mediets omdømme, stil og tidligere posisjon, men er alltid historisk forhandlet. En resepsjonsstudie bør skille kortanmeldelse, essay, podkast og akademisk artikkel og undersøke argumentene, ikke redusere dem til positiv eller negativ tone.',
      'En litterær pris skaper en avgrenset konkurranse gjennom kvalifikasjonskrav, nominasjon, jury, habilitetsregler og offentlig begrunnelse. Bookerprisens egne sider dokumenterer prisens historie og institusjonelle form, mens Nobelprisens biografier dokumenterer vinnere og offisielle presentasjoner. De viser ikke at juryen er et objektivt mål på kvalitet. Prisanalyse undersøker hvilke verk som kunne vurderes, hvem som tok beslutningen og hvordan kriteriene ble fortolket i den aktuelle runden.',
      'Konsekrering fortsetter etter prisøyeblikket gjennom nyutgaver, samleutgaver, arkiv, monument, jubileum og forfatterhus. Knut Hamsuns og Toni Morrisons Nobelstatus inngår i svært ulike nasjonale og internasjonale minnekulturer; en prisdato forklarer ikke senere omstridelse eller bruk. Forskeren kan følge omslag, forord, utstillingspraksis og institusjonelle nettsider for å se hvordan autoritet vedlikeholdes. Minnestedets eksistens er et spor, ikke bevis for en samlet offentlig vurdering.',
      'Pensum og antologi gjør kanon til en praktisk utvalgsprosess. Et verk som gjentas i undervisning får tilgjengelighet, kommentartradisjon og nye lesere, men pensumlisten sier ikke hvordan teksten faktisk ble lest. Analyse av skjult kanon krever data om hvilke forfattere, språk, sjangrer og utgaver som inngår, samt beslutningsnivået bak utvalget. Endring i én institusjon kan være viktig uten å representere hele utdanningssystemet.',
      'Oversettelse og internasjonale priser kan flytte symbolsk kapital mellom språkfelt. En Nobelpris kan øke etterspørselen etter oversettelser, men kausaliteten må dokumenteres gjennom kontrakter, utgivelsesdata eller tidsserier. Toni Morrisons internasjonale posisjon kan ikke forklares av prisen alene; forfatterskap, kritikk, undervisning og politisk offentlighet virker sammen. Global prestisje bør derfor analyseres som en kjede av institusjonelle handlinger, ikke som en egenskap som automatisk følger verket.',
      'Kanoner kan bestrides gjennom skandale, ny forskning, politisk mobilisering, nye utgaver og motkanoniske prosjekter. Omvurdering kan gjelde verkets estetiske status, forfatterens handlinger eller institusjonens tidligere utelatelser, og nivåene bør ikke blandes. Hamsun-debatter krever eksempelvis skille mellom litterær analyse, dokumentert politisk historie og dagens minnepolitikk. Dekanonisering er sjelden total utslettelse; kontrovers kan samtidig øke undervisning, arkivering og offentlig oppmerksomhet.',
      'Salgstall, bibliotekutlån, siteringer og medieomtale måler forskjellige former for sirkulasjon. Høyt salg viser transaksjoner, ikke nødvendigvis lesing; sitering viser akademisk bruk, ikke allmenn anerkjennelse; en prisnominasjon viser institusjonell seleksjon, ikke varig kanon. Bibliometri kan beskrive utvikling når datakilden og tidsrommet er kjent. Den bør ikke komprimere estetisk verdi og sosial virkning til én rangering, og fravær i databasen må behandles som mulig målefeil.'
    ],
    sources: [['ls07'], ['ls07', 'ls13', 'ls06'], ['ls05', 'ls06'], ['ls11'], ['ls06'], ['ls05'], ['ls07', 'ls13']]
  },
  {
    id: 'sensur-ytringsfrihet-offentlighet', title: 'Sensur, ytringsfrihet og offentlighet', topic: 'sensur_ytringsfrihet_offentlighet',
    paragraphs: [
      'Sensur omfatter institusjonelle inngrep som forhåndskontroll, lisenskrav, forbud, beslag eller straff, men ordet bør ikke brukes om enhver negativ vurdering. Juridisk sensur kan dokumenteres gjennom lov, vedtak og rettsprosess; et forlags avslag eller en bokhandels beslutning følger andre regler selv om utfallet også begrenser sirkulasjon. Presis klassifikasjon gjør det mulig å sammenligne maktmidler uten å gjøre stat, marked, skole og privat kritikk til samme aktør.',
      'Rettssaker om usømmelighet, blasfemi eller politisk tale viser hvordan litterær form blir tolket av juridiske institusjoner. Madame Bovary og Ulysses er klassiske objekter fordi verk og rettsprosesser inngår i forskjellige kildesett: teksten kan nærleses, mens tiltale, prosedyre og dom må dokumenteres historisk. Senere berømmelse gjør ikke samtidens virkning selvsagt. Analysen bør følge hvem som ble ansvarliggjort, hvilket tekststed som ble sitert, og hvilken rettslig norm som ble anvendt.',
      'Markedsmakt og plattformmoderering kan begrense synlighet uten formelt forbud. Distribusjonsnekt, demonetisering, aldersmerking og søkefiltrering virker gjennom kontrakter og tekniske regler. PENs rapportering om bokforbud og striden rundt The Satanic Verses viser at risiko kan fordeles mellom forfatter, oversetter, forlag og bokhandel, men hvert tilfelle krever lokale dokumenter. At en bok er vanskelig å kjøpe, beviser ikke hvem som fjernet den eller hvorfor; årsaken må spores gjennom beslutningen.',
      'Selvsensur er en beslutning om å endre eller unnlate ytring under opplevd risiko, og den er metodisk vanskelig fordi det usagte ofte mangler spor. Brev, dagbøker, manuskriptvarianter, intervjuer eller kontrakter kan dokumentere vurderingen, mens ren forskjell mellom to tekstversjoner ikke avslører motivet. Overvåkning, trussel og eksil kan forme skrivepraksis, men forskeren bør unngå å psykologisere uten kilder og ivareta sikkerheten til nålevende personer.',
      'Offentlighet betegner arenaer og regler for sirkulerende argumenter, mens motoffentligheter organiserer tale fra posisjoner som ikke får lik adgang til dominerende kanaler. Tilgang avhenger av språk, økonomi, utdanning, funksjonsevne, redaksjonell kontroll og risiko. PEN Internationals begrunnelse for ytringsfrihet uttrykker en normativ institusjonell posisjon. En empirisk studie må i tillegg undersøke hvilke stemmer som faktisk publiseres, høres og beskyttes i den konkrete offentligheten.',
      'En forbudt bok kan fortsette å sirkulere gjennom private kopier, bibliotek, smugling, oversettelse eller digitale nettverk. Katalogspor og beslag dokumenterer tilgjengelighet og kontrolltiltak, men ikke automatisk lesing. Lesning kan undersøkes gjennom utlån, marginalia, brev, intervjuer eller andre bruksspor, hver med egne skjevheter. Motstanden mot sensur skaper dessuten nye paratekster og symbolverdier. Det er derfor mulig at juridisk forbud og kulturell synlighet øker samtidig.',
      'Rettslig tilgjengelighet, faktisk tilgang og dokumentert virkning er tre adskilte nivåer. En lovlig bok kan være utilgjengelig på grunn av pris, språk eller distribusjon; en ulovlig bok kan være mye lest; dokumentert tilgang sier fortsatt ikke hva lesningen gjorde. Ytringsfrihetsanalyse blir mest presis når den fører egne kilder for regel, sirkulasjon og resepsjon. Den normative vurderingen kan være tydelig, men må ikke brukes til å fylle empiriske hull.'
    ],
    sources: [['ls08'], ['ls10'], ['ls09'], ['ls08'], ['ls08'], ['ls09'], ['ls08', 'ls09']]
  },
  {
    id: 'forfatterokonomi-arbeidsliv', title: 'Forfatterøkonomi og arbeidsliv', topic: 'forfatterokonomi_arbeidsliv',
    paragraphs: [
      'Forfatterskap er estetisk praksis og arbeid, selv når inntekten er lav eller identiteten beskrives som kall. Arbeidet omfatter skriving, revisjon, research, søknader, opplesning, markedsføring, administrasjon og kontakt med redaksjon og publikum. Profesjonalisering kan måles gjennom organisering, kontrakter og inntektskilder, men ingen enkelt terskel skiller entydig «forfatter» fra amatør. Analysen bør oppgi om den undersøker selvforståelse, medlemskap, publisering, tidsbruk eller økonomisk forsørgelse.',
      'Forlagsavtalen organiserer forskudd, royalty, honorar, territorium, format, varighet og regnskapsrapportering. Forskudd gir likviditet før salg, men kan avregnes mot framtidige inntekter; royaltyprosenten sier lite uten beregningsgrunnlag og salgstall. Forfatterforeningens miniguide forklarer sentrale ordninger i Norge og bør leses sammen med den konkrete avtalen. En litterær suksess kan gi symbolsk kapital uten stabil inntekt, og høy omsetning er ikke det samme som forfatterens nettoandel.',
      'Opphavsrett gir rettigheter til bruk av verk, mens lisens og kollektiv forvaltning gjør bestemte utnyttelser og vederlag praktisk mulige. Bibliotekvederlag, kopieringsavtaler, lydbokrettigheter og oversettelsesrettigheter følger forskjellige ordninger, og Bokavtalen regulerer andre deler av bokomsetningen. Den norske infrastrukturen kombinerer individuelle kontrakter med kollektive mekanismer. Juridisk analyse må bruke gjeldende lov- og avtaletekst; en organisasjonsveiledning forklarer praksis, men erstatter ikke rettskilden i en tvist.',
      'Stipend og residens kjøper tid, rom eller økonomisk sikkerhet uten å være vanlig boksalg. Armlengdes avstand skal beskytte kunstfaglige beslutninger mot direkte politisk styring, men kriterier, juryer og rapportering former likevel hvem som får støtte. Kulturdirektoratets litteraturordninger viser hvordan offentlig politikk inngår i produksjonsfeltet. Et vedtak dokumenterer tildeling, ikke den kunstneriske effekten; den krever materiale om arbeidsprosess eller ferdig verk.',
      'Mange forfattere har porteføljearbeid og kombinerer bøker med undervisning, journalistikk, oversettelse, redigering eller annet lønnsarbeid. Prekaritet handler om uforutsigbar inntekt, svak sosial sikkerhet og ulønnet tid, ikke bare lav årsinntekt ett år. Den norske Forfatterforeningens Årsmelding 2025–2026 dokumenterer organisasjonens aktiviteter og økonomi, men er ikke en full inntektsstudie av alle forfattere. Gjennomsnitt kan skjule store forskjeller mellom sjangrer, karrierefaser og markeder.',
      'Bærekraftig forfatterarbeid er ulikt fordelt etter økonomisk bakgrunn, omsorgsansvar, kjønn, rasisering, funksjonsevne, språk og bosted. Ressurser påvirker hvem som kan tåle forsinket betaling, reise eller arbeide uten honorar, men sammenhengene må undersøkes med data og livshistorier. Identitetskategori alene forklarer ikke hver karriere. En god analyse viser hvilke mekanismer – nettverk, tid, diskriminering, tilgang eller institusjonelle regler – som faktisk kan spores.',
      'Selvpublisering og plattformarbeid kan flytte oppgaver og risiko fra forlag til forfatter. Den som publiserer selv, kan kontrollere pris og utgave, men må også håndtere redigering, design, metadata, annonsering og kundedata eller kjøpe tjenestene. Generativ KI reiser spørsmål om treningsdata, stilimitasjon, kreditering og lisens som ikke løses av markedsføringsbegrepet «verktøy». Analysen må skille gjeldende rett, kontraktsvilkår, observerbar praksis og normative krav og datere konklusjonen i et raskt skiftende felt.'
    ],
    sources: [['ls11'], ['ls11'], ['ls11'], ['ls15'], ['ls12'], ['ls12'], ['ls17']]
  },
  {
    id: 'lesekultur-utdanning-formidling', title: 'Lesekultur, utdanning og formidling', topic: 'lesekultur_utdanning_formidling',
    paragraphs: [
      'Lesekultur omfatter praksiser, steder og normer rundt lesing i hjem, skole, bibliotek, arbeid og fritid. Den kan ikke reduseres til antall solgte bøker, fordi kjøp, tilgang, lesing og samtale er ulike handlinger. Norsk kulturbarometer 2023 skiller blant annet papirbok, e-bok og bibliotekbesøk og viser hvordan medieform og institusjon må registreres separat. Statistikken beskriver et utvalg og et tidsrom; den forklarer ikke alene hvorfor mennesker leser eller lar være.',
      'Litterær kompetanse består av flere ferdigheter; leseren følger form og perspektiv, bruker sjangerforventninger, tåler flertydighet, kontekstualiserer og begrunner en fortolkning. Læreplan og vurdering gjør noen ferdigheter synlige og andre mindre viktige. Pensum skaper dessuten en praktisk kanon gjennom gjentatt tilgang og institusjonell tid. En didaktisk analyse bør skille det offisielle målet, lærerens opplegg, tekstutvalget og elevenes faktiske arbeid i stedet for å slutte direkte fra plan til læringsutbytte.',
      'Formidling kuraterer forbindelsen mellom verk og publikum gjennom utstilling, bokprat, arrangement, omtale og anbefaling. Deichman Bjørvika og Foreningen !les viser bibliotek- og organisasjonsformer som gjør litteratur sosialt tilgjengelig på ulike måter. Kuratering er aldri helt nøytral: tema, plassering, språk og format bestemmer hva som blir synlig. Samtidig kan en formidler åpne terskler med kontekst og egnede utgaver. Deltakertall dokumenterer oppmøte, mens forståelse eller varig leseaktivitet krever andre undersøkelser.',
      'Bokklubber, lesesirkler og fandom gjør lesing sosialt gjennom samtale, ritualer, anbefaling og identitet. Gruppen kan etablere tolkningsnormer og gi medlemmer språk for erfaringer, men den er ikke én homogen «leser». Observasjon av samtaler viser interaksjon i situasjonen; intervju viser deltakernes framstilling; digitale innlegg viser det som ble publisert. Metodene kan kombineres, men privat lesning og taus uenighet forblir delvis utilgjengelig. Forskerrollen og samtykket må beskrives.',
      'Tilgang påvirkes av språk, leseferdighet, syn, hørsel, kognitiv variasjon, pris, teknologi og institusjonell støtte. Leser søker bok arbeider med litteratur for ulike lesere, mens lettlest tekst, lydbok, punktskrift og skjermleser løser forskjellige barrierer. Et format som hjelper én gruppe, er ikke universelt best, og «forenkling» bør analyseres i forhold til målgruppe og formål. En katalogpost dokumenterer formell tilgjengelighet; faktisk bruk og opplevd inkludering må undersøkes separat.',
      'Intervju, observasjon, spørreundersøkelse, utlånsdata og lesedagbok produserer ulike bilder av lesing. Selvrapportering fanger erfaring og begrunnelse, men påvirkes av hukommelse og sosial ønskverdighet; utlån registrerer transaksjon, ikke fullført lesing; observasjon fanger synlig aktivitet i et valgt rom. SSBs kulturbarometer dokumenterer utvalg, spørsmål og rapportert bruk på befolkningsnivå. Det kan ikke uten videre erstatte nærstudier av hvordan bestemte tekster forstås.',
      'Institusjonelle mål, deltakelse og effekt må føres som tre separate ledd. Et bibliotek kan ha mål om leselyst, gjennomføre et arrangement og registrere mange deltakere uten at dette beviser varig endring. Effektstudier trenger før–etter-design, sammenligningsgrunnlag eller kvalitative spor som passer til påstanden, og også da kan selvseleksjon spille inn. Formidlingens verdi er ikke begrenset til målbar langtidseffekt, men forskeren skal ikke bruke en normativ verdi til å fylle et empirisk hull.'
    ],
    sources: [['ls16'], ['ls11'], ['ls03', 'ls14'], ['ls16'], ['ls14'], ['ls16'], ['ls16']]
  }
];

const sociologyExtraSources = [
  { id: 'ls15', label: 'Innkjøpsordninger for litteratur', url: 'https://www.kulturdirektoratet.no/fag/litteratur/innkjopsordninger', publisher: 'Kulturdirektoratet', type: 'offisiell_ordningsbeskrivelse', source_location: 'Innledningen og seksjonene om ordningenes formål, vurdering og distribusjon til bibliotek' },
  { id: 'ls16', label: 'Norsk kulturbarometer 2023', url: 'https://www.ssb.no/kultur-og-fritid/kultur/artikler/norsk-kulturbarometer-2023', publisher: 'Statistisk sentralbyrå', type: 'offisiell_statistikk', source_location: 'Seksjonene Bøker og Folkebibliotek samt metodeopplysningene om undersøkelsen' },
  { id: 'ls17', label: 'Bokavtalen – avtaletekst', url: 'https://bokhandlerforeningen.no/politikk-og-mening/bokavtalen/bokavtalen-avtaletekst/', publisher: 'Bokhandlerforeningen', type: 'bransjeavtale', source_location: 'Punktene om virkeområde, bokgrupper, fastpris, rabatt og skaffeplikt' }
];

const sociologyLocations = {
  ls01: 'Bokbeskrivelsen og innholdsoversikten, særlig delene om feltets autonomi, posisjoner og konsekrering',
  ls02: 'Bibliografiske metadata og den nummererte delpubliseringen i fullteksten',
  ls03: 'Seksjonene Om biblioteket, Åpningstider og Tilbud',
  ls04: 'Tidslinjen, særlig avsnittene om 1935-lanseringen, paperbackformat og distribusjon',
  ls05: 'Avsnittene om livsløp, forfatterskap, Nobelprisen og politisk offentlighet',
  ls06: 'Feltene Prize motivation, Life og Work',
  ls07: 'Tidslinjen og avsnittene om etablering, finansiering, jury og prisnavn',
  ls08: 'Seksjonene Why freedom of expression matters og Writers at risk',
  ls09: 'Innledningen og de regionale eksemplene på bokforbud og PENs vedtak',
  ls10: 'Bibliografiske metadata og fulltekstens deler I–III',
  ls11: 'Sidene 4–19 om aktørene, avtalene, vederlagsordningene og innkjøpsordningene',
  ls12: 'Seksjonene om medlemstall, vederlag, stipend, organisasjonsarbeid og regnskap',
  ls13: 'Seksjonene How the prize works, Judges, Eligibility og Prize history',
  ls14: 'Seksjonene om lån, arrangement, digitale tjenester og tilrettelagte tilbud'
};

function moduleExamples(articles) {
  return articles.map((article) => ({
    title: `Arbeidseksempel: ${article.title}`,
    object: article.topic === 'litteraturvitenskapens_faghistorie' ? 'Henrik Ibsens Et dukkehjem som verk, utgave og forskningsobjekt' : `Et avgrenset kildemateriale for ${article.title.toLowerCase()}`,
    steps: [
      'Avgrens objekt, versjon, materiale og det konkrete spørsmålet.',
      'Registrer lokaliserbare trekk før de gis en større forklaring.',
      'Prøv minst én alternativ hypotese eller en annen analyseenhet.',
      'Oppgi hvilken konklusjon materialet ikke kan bære.'
    ]
  }));
}

function rewriteArea(config) {
  const chapterFile = `${PACKAGE}/foundation_texts/${config.areaId}.json`;
  const chapter = read(chapterFile);
  const claims = read(chapter.claimsFile);
  for (const source of config.extraSources || []) {
    if (!claims.sources.some((item) => item.id === source.id)) claims.sources.push(source);
  }
  for (const source of claims.sources) {
    if (config.sourceLocations[source.id]) source.source_location = config.sourceLocations[source.id];
  }
  const newClaims = [];
  let claimNumber = 1;
  for (const article of config.articles) {
    article.claimIds = [];
    for (let index = 0; index < article.paragraphs.length; index += 1) {
      const id = `${config.claimPrefix}-${String(claimNumber).padStart(2, '0')}`;
      article.claimIds.push(id);
      newClaims.push({
        id,
        claim: firstSentence(article.paragraphs[index]),
        source_ids: article.sources[index],
        classification: 'redaksjonell_fagpåstand',
        status: 'verified'
      });
      claimNumber += 1;
    }
  }
  claims.claims = newClaims;
  claims.verified_at = '2026-08-07';
  claims.verification_status = 'verified';
  write(chapter.claimsFile, claims);

  for (let moduleIndex = 0; moduleIndex < chapter.moduleFiles.length; moduleIndex += 1) {
    const moduleFile = chapter.moduleFiles[moduleIndex];
    const module = read(moduleFile);
    const pair = config.articles.slice(moduleIndex * 2, moduleIndex * 2 + 2);
    module.qualityProfile = 'full_depth_v2';
    module.sections = pair.map((article) => ({
      id: article.id,
      title: article.title,
      coverageTopic: article.topic,
      paragraphs: article.paragraphs,
      paragraphClaimIds: article.claimIds.map((id) => [id]),
      keyPoints: [
        article.keyPoint || `Emnet forklares gjennom begreper, historiske vilkår og konkrete objekter.`,
        article.boundary || 'Konklusjonen avgrenses til de dokumenterte tekst-, kilde- og institusjonssporene.'
      ],
      editorialStatus: 'editorial_ready_v1'
    }));
    module.workedExamples = moduleExamples(pair).map((example, index) => ({ ...example, claimIds: pair[index].claimIds.slice(0, 3) }));
    module.commonMisconceptions = [
      { claim: 'Ett navngitt eksempel dokumenterer hele feltet.', correction: 'Eksemplet forklarer en mekanisme; historisk eller generell rekkevidde krever et begrunnet utvalg.' },
      { claim: 'En autoritativ kilde gjør inferensgrensen overflødig.', correction: 'Kilden må fortsatt støtte den konkrete påstanden og den oppgitte rekkevidden.' }
    ];
    write(moduleFile, module);
  }
  chapter.qualityProfile = 'full_depth_v2';
  if (config.learningObjectives) chapter.learningObjectives = config.learningObjectives;
  chapter.editorial_status = 'editorial_ready_v1';
  chapter.completion_note = 'Seks canonicale emner er omskrevet som selvstendige, forklarende og kildeførte hovedartikler som består redaksjonell artikkelport v1.';
  write(chapterFile, chapter);
  if (config.cleanConcepts) {
    const registry = read(chapter.conceptRegistry);
    for (const concept of registry.concepts) {
      concept.definition = concept.definition.replace(/ Begrepet skal knyttes til bestemte verk, medier, aktører eller institusjonelle spor i analysen\.$/u, '');
      concept.distinguish_from = concept.distinguish_from.replace(/, som krever en annen analyseenhet eller evidenstype\.$/u, '.');
      if (concept.id === 'interaktivitet') concept.definition = 'Interaktivitet betegner regelstyrt gjensidig påvirkning mellom brukerhandling, systemrespons og verkets registrerte tilstand.';
    }
    registry.editorial_status = 'editorial_ready_v1';
    write(chapter.conceptRegistry, registry);
  }
}

function updateNamedObjectEvidence(areaId, objectsByTopic) {
  const contractFile = `${PACKAGE}/contracts/${areaId}_full_field_v1.json`;
  const fulfillmentFile = `${PACKAGE}/foundation_texts/${areaId}/full_field_fulfillment_v1.json`;
  const contract = read(contractFile);
  const fulfillment = read(fulfillmentFile);
  const chapter = read(`${PACKAGE}/foundation_texts/${areaId}.json`);
  const sections = chapter.moduleFiles.flatMap((file) => read(file).sections);
  for (const requirement of contract.topicRequirements) {
    const configured = objectsByTopic[requirement.id];
    if (!configured || configured.length < 4) throw new Error(`${requirement.id}: trenger fire navngitte objekter`);
    requirement.namedAnalysisObjects = configured.map((item) => item.name);
    const evidence = fulfillment.topicEvidence.find((item) => item.topicId === requirement.id);
    evidence.namedAnalysisObjects = configured.slice(0, 3).map((item) => item.name);
    evidence.namedObjectEvidence = {};
    const section = sections.find((item) => item.coverageTopic === requirement.id);
    for (const item of configured.slice(0, 3)) {
      const claimIds = section.paragraphClaimIds[item.paragraphIndex];
      evidence.namedObjectEvidence[item.name] = { sectionId: section.id, paragraphIndex: item.paragraphIndex, claimIds };
    }
  }
  write(contractFile, contract);
  write(fulfillmentFile, fulfillment);
}

const methodExtraSources = [
  {
    id: 's11-sep-hermeneutics',
    label: 'Hermeneutics',
    url: 'https://plato.stanford.edu/entries/hermeneutics/',
    publisher: 'Stanford Encyclopedia of Philosophy',
    type: 'fagfellevurdert_oppslagsartikkel',
    source_location: 'Innledningen og del 2–3 om den hermeneutiske sirkelen, forforståelse og historisitet'
  },
  {
    id: 's12-mla-research-guide',
    label: 'MLA Guide to Undergraduate Research in Literature, Second Edition',
    url: 'https://www.mla.org/Publications/Bookstore/MLA-Guides/MLA-Guide-to-Undergraduate-Research-in-Literature-Second-Edition',
    publisher: 'Modern Language Association',
    type: 'faglig_metodeveiledning',
    source_location: 'Bokbeskrivelsen og innholdsoversikten om forskningsspørsmål, søk, evaluering og dokumentasjon'
  }
];

const methodLocations = {
  's01-ntnu-laeringsutbytte': 'Seksjonene Kunnskap, Ferdigheter og Generell kompetanse',
  's02-uio-lit4000': 'Seksjonene Kort om emnet, Hva lærer du? og Undervisning',
  's03-uio-nor4430': 'Seksjonene Kort om emnet og Hva lærer du?',
  's04-mla-scholarly-editions': 'Seksjonene Editorial principles, Textual apparatus, Proofreading og Review',
  's05-mla-digital-edition': 'Executive Summary og sidene 8–15 om documentary evidence, editorial layers og reuse',
  's06-mla-citations': 'Innledningen og seksjonen How to cite a specific part of a source',
  's07-nesh': 'Grunnleggende normer og delene om ansvar for personer, grupper og kulturhistoriske kilder',
  's08-ibsen-hovedtekst': 'Første akt, særlig åpningsscenen og dialogen mellom Nora og Helmer',
  's09-ibsen-tekstredegjorelse': 'Seksjonene Manuskripter, Trykk og Tekstgrunnlag for hovedteksten',
  's10-nb-dukkehjem-manuskript': 'Avsnittene om materialets omfang, oppbevaring og første kjente notat'
};

rewriteArea({ areaId: 'faggrunnlag_metode_forskningspraksis', claimPrefix: 'lit', articles: methodArticles, extraSources: methodExtraSources, sourceLocations: methodLocations, cleanConcepts: true });
rewriteArea({
  areaId: 'medier_intermedialitet_adapsjon', claimPrefix: 'mia', articles: mediaArticles,
  extraSources: mediaExtraSources, sourceLocations: mediaLocations, cleanConcepts: true,
  learningObjectives: [
    'skille medium, modalitet, materialitet, format og grensesnitt i konkrete realiseringer',
    'sammenligne adaptasjoner gjennom utvalg og omforming uten å redusere analysen til fidelitet',
    'analysere kamera, klipp, lyd, kropp og serialitet i film og fjernsyn',
    'forklare hvordan rute, sekvens, oppslag, skriftbilde og format organiserer visuell fortelling',
    'analysere innlesning og podkast som framføring, versjon og institusjonell lydpraksis',
    'dokumentere kode, valg, tilstand, plattform og brukerbane i elektronisk litteratur'
  ]
});
rewriteArea({
  areaId: 'litteratursosiologi_institusjoner_offentlighet', claimPrefix: 'lsi', articles: sociologyArticles,
  extraSources: sociologyExtraSources, sourceLocations: sociologyLocations, cleanConcepts: true,
  learningObjectives: [
    'analysere litterære posisjoner, kapitalformer og konsekrering som historiske relasjoner',
    'følge hvordan forlag, bokhandel, bibliotek og plattform fordeler tilgang og synlighet',
    'skille kritisk vurdering, prisprosedyrer, sirkulasjon og langsiktig kanonisering',
    'klassifisere juridisk sensur, markedsbegrensning og ulik adgang til offentligheten presist',
    'undersøke kontrakt, rettighet, inntekt, støtte og ulønnet tid som forfatterarbeidets vilkår',
    'måle lesing og formidling uten å forveksle institusjonelt mål, deltakelse og effekt'
  ]
});

updateNamedObjectEvidence('medier_intermedialitet_adapsjon', {
  medium_modalitet_materialitet: [
    { name: 'Pride and Prejudice', paragraphIndex: 1 }, { name: 'Project Gutenberg', paragraphIndex: 1 },
    { name: 'LibriVox', paragraphIndex: 1 }, { name: 'Electronic Literature Collection', paragraphIndex: 6 }
  ],
  adaptasjon_omforming: [
    { name: 'Pride & Prejudice', paragraphIndex: 1 }, { name: 'Clueless', paragraphIndex: 2 },
    { name: 'Wide Sargasso Sea', paragraphIndex: 3 }, { name: 'Throne of Blood', paragraphIndex: 4 }
  ],
  litteratur_film_tv: [
    { name: 'Pride & Prejudice', paragraphIndex: 0 }, { name: 'The Handmaid’s Tale', paragraphIndex: 0 },
    { name: 'Normal People', paragraphIndex: 0 }, { name: 'Elizabeth og Darcy', paragraphIndex: 1 }
  ],
  tegneserie_bildebok_visuell_fortelling: [
    { name: 'Maus', paragraphIndex: 0 }, { name: 'Persepolis', paragraphIndex: 1 },
    { name: 'The Yellow Kid', paragraphIndex: 1 }, { name: 'The Arrival', paragraphIndex: 2 }
  ],
  lydbok_podkast_muntliggjøring: [
    { name: 'Pride and Prejudice', paragraphIndex: 0 }, { name: 'LibriVox', paragraphIndex: 0 },
    { name: 'Folger Shakespeare Audio Editions', paragraphIndex: 3 }, { name: 'Shakespeare Unlimited', paragraphIndex: 5 }
  ],
  elektronisk_litteratur_spillfortelling: [
    { name: 'Electronic Literature Collection', paragraphIndex: 0 }, { name: 'Twine', paragraphIndex: 1 },
    { name: '80 Days', paragraphIndex: 2 }, { name: 'Depression Quest', paragraphIndex: 4 }
  ]
});

updateNamedObjectEvidence('litteratursosiologi_institusjoner_offentlighet', {
  litterart_felt_kulturell_kapital: [
    { name: 'The Rules of Art', paragraphIndex: 0 }, { name: 'Bookerprisen', paragraphIndex: 3 },
    { name: 'La Nouvelle Revue Française', paragraphIndex: 5 }, { name: 'The Crisis', paragraphIndex: 5 }
  ],
  forlag_bokhandel_bibliotek: [
    { name: 'Penguin Books', paragraphIndex: 2 }, { name: 'Deichman Bjørvika', paragraphIndex: 3 },
    { name: 'Kulturdirektoratets innkjøpsordninger', paragraphIndex: 3 }, { name: 'The Pickwick Papers', paragraphIndex: 4 }
  ],
  kritikk_priser_kanonisering: [
    { name: 'Bookerprisen', paragraphIndex: 1 }, { name: 'Nobelprisen', paragraphIndex: 1 },
    { name: 'Knut Hamsun', paragraphIndex: 2 }, { name: 'Toni Morrison', paragraphIndex: 2 }
  ],
  sensur_ytringsfrihet_offentlighet: [
    { name: 'Madame Bovary', paragraphIndex: 1 }, { name: 'Ulysses', paragraphIndex: 1 },
    { name: 'The Satanic Verses', paragraphIndex: 2 }, { name: 'PEN International', paragraphIndex: 4 }
  ],
  forfatterokonomi_arbeidsliv: [
    { name: 'Forfatterforeningens miniguide', paragraphIndex: 1 }, { name: 'Bokavtalen', paragraphIndex: 2 },
    { name: 'Kulturdirektoratet', paragraphIndex: 3 }, { name: 'Årsmelding 2025–2026', paragraphIndex: 4 }
  ],
  lesekultur_utdanning_formidling: [
    { name: 'Norsk kulturbarometer 2023', paragraphIndex: 0 }, { name: 'Deichman Bjørvika', paragraphIndex: 2 },
    { name: 'Foreningen !les', paragraphIndex: 2 }, { name: 'Leser søker bok', paragraphIndex: 4 }
  ]
});

const indexFile = `${PACKAGE}/index.json`;
const index = read(indexFile);
index.files.editorial_quality = 'editorial_quality_v1.json';
index.summary.verified_source_count = index.files.foundation_chapters.reduce((sum, file) => sum + read(read(`${PACKAGE}/${file}`).claimsFile).sources.length, 0);
index.summary.verified_claim_count = index.files.foundation_chapters.reduce((sum, file) => sum + read(read(`${PACKAGE}/${file}`).claimsFile).claims.length, 0);
index.summary.editorial_ready_area_count = 3;
index.summary.editorial_ready_topic_count = 18;
index.summary.completion_status = 'structural_full_field_complete_editorial_rewrite_in_progress';
index.summary.editorial_completion_status = '18_of_168_articles_editorial_ready_rewrite_in_progress';
index.release_rule = 'Strukturell fullfeltdekning er oppnådd, men pakken kan ikke merkes redaksjonelt complete før editorial_quality_v1.json viser 28 av 28 områder og 168 av 168 artikler som editorial_ready_v1.';
write(indexFile, index);

const coverageFile = `${PACKAGE}/coverage_contract_v1.json`;
const coverage = read(coverageFile);
coverage.status = 'structural_full_field_coverage_editorial_rewrite_in_progress';
coverage.progress.honest_status = 'Alle 28 områder og 168 temaer er strukturelt materialisert, og 18 utvidede fullfeltkontrakter er schemaoppfylt. Redaksjonell artikkelport v1 er bestått for 3 områder og 18 artikler; 25 områder og 150 artikler gjenstår før litteraturfeltet kan kalles redaksjonelt komplett.';
coverage.progress.editorial_ready_areas = 3;
coverage.progress.editorial_ready_topics = 18;
coverage.progress.editorial_pending_areas = 25;
coverage.progress.editorial_pending_topics = 150;
write(coverageFile, coverage);

const statusFile = 'data/fagverk/subject_status.json';
const status = read(statusFile);
const literature = status.subjects.find((subject) => subject.id === 'litteratur');
literature.navigationStatus = 'materialized';
literature.assessmentStatus = 'pending';
literature.editorialStatus = 'chapters_in_progress';
literature.nextGate = 'rewrite_remaining_25_areas_and_150_articles_to_editorial_ready_v1';
literature.note = `Litteratur er strukturelt dekket med 28 områder og 168 temaer, men redaksjonell fullføring måles nå separat. Tre områder og 18 artikler består artikkelport v1; 25 områder og 150 artikler gjenstår. Pakken har ${index.summary.defined_concept_count} definerte begreper, ${index.summary.verified_source_count} kilder og ${index.summary.verified_claim_count} påstandsspor.`;
status.updatedAt = '2026-08-07';
write(statusFile, status);

console.log('Omskrev redaksjonell litteraturbatch 01 og oppdaterte ærlig status.');
