# Arbeiderbladet / Dagsavisen — kilde- og identitetsgjennomgang

Dato: 2026-10-11. Base: main `3680f4da364d8892bd7d1779667697fb0c7550ca`.
Status: canonical core materialisert og reviewet; separat quiz, QuizCard og samlet UI-closeout gjenstår.

## Identitet og nullmåling

`arbeiderbladet_youngstorget` representerer Arbeiderbladets historiske redaksjon i Folketeaterbygningen i 1934–1988, med opphold i avisdriften under okkupasjonen. Dagsavisen er avisens senere navn. Dette er verken den nåværende Dagsavisen-adressen, hele Youngstorget eller teaterscenen.

Manifest- og JSON-audit fant ingen egen Arbeiderbladet/Dagsavisen-place. `folketeateret` eier den eksisterende scene-/bygningsoppføringen; `youngstorget` eier torget. De beholdes som relasjoner. `dagsavisen` finnes allerede i Brand-masteren uten publiseringsklar logo. Martin Tranmæl og Harald Stanghelle finnes i People og skal gjenbrukes, med bevarte primærankre. Ingen aktiv eller arkivert målquiz eller QuizCard ble funnet ved navn-/ID-søk.

## Leste kilder og konkret bruk

- Oslo byleksikon, [Dagsavisen](https://oslobyleksikon.no/side/Dagsavisen): historikkavsnittene, adresselinjen og redaktørlisten. Dokumenterer innflytting 1934, historisk adresse Youngstorget 2a, redaksjon til 1988 og flytting til Grenseveien 50. Navn og ny sentrumadresse kom i 1997. Den gamle artikkelen brukes ikke til dagens ledelse eller dagens adresse.
- Oslo byleksikon, [Folketeaterbygningen](https://oslobyleksikon.no/side/Folketeaterbygningen): innledning og Historikk. Bygningen har fasade mot Youngstorget 2 og Storgata 21/23; tatt i bruk høsten 1934 og innviet i april 1935. Redaksjonens brukstid og teatersalens historie er forskjellige forhold.
- Store norske leksikon, [Dagsavisen](https://snl.no/Dagsavisen): Historikk, Fakta og Redaktørar. Avisnavnene, stans under okkupasjonen, gjenstart mai 1945, morgenavis september 1945, redaktørskifter og teknisk omlegging i 1976. Én presis stansdato og ett presist Larssen-tiltredelsesår holdes tilbake fra stedsteksten fordi kildenes fremstillinger varierer.
- Arbeiderbevegelsens arkiv og bibliotek, [Arbeiderbevegelsens tidsskrifter og aviser](https://www.arbark.no/Utstilling/Arbeiderbevegelsens_tidsskrifter_og_aviser/Arbeiderbevegelsens_tidsskrifter_og_aviser.htm), første avisavsnitt: navnelinjen Vort Arbeide → Social-Demokraten → Arbeiderbladet → Dagsavisen Arbeiderbladet → Dagsavisen; redaktørvalg på landsmøtet til 1975. Mellomtittelen 1997–1998 skal ikke skjules.
- Arbeiderpartiets [beretning 1987–1988](https://www.arbark.no/eldok/DNA1987_1.pdf), PDF-side 101, trykt side 98, «Nytt avishus og ny avisteknikk»: samtidig institusjonskilde som dokumenterer flytting i 1988 og direkte innskrivning av tekst. Eiersidens positive vurdering av arbeidsplassen er en vurdering, ikke objektiv kvalitetsmåling.
- Hanne Mauno, [Farvel til gutta på sporten](https://www.dagsavisen.no/nyheter/farvel-til-gutta-pa-sporten/5800886), avsnittene om 1986 og Hasle: Tor-Erik Røberg-Larsens retrospektive beretning om redaksjonsklubbens motstand. Beløp, direkte dialog og udokumenterte motiver gjenfortelles ikke.
- [Han løftet Arbeiderbladet inn i en ny tid](https://www.dagsavisen.no/nyheter/han-loftet-arbeiderbladet-inn-i-en-ny-tid/6712363): Per Brunvands redaktørperiode 1975–1991 og konflikten om flytting. Minneordets vurderende karakter skilles fra dokumenterte år og roller.
- Daniel C. Hallin og Paolo Mancini, [Comparing Media Systems, kapittel 2](https://www.cambridge.org/core/books/abs/comparing-media-systems/comparing-media-systems/B0147BBED4E97BB49EB5C0BEF1A682BD), åpent Summary: politisk parallellitet, profesjonalitet, marked og stat som separate sammenligningsdimensjoner. Den åpne oppsummeringen er lest; hele betalingskapitlet hevdes ikke lest. Teorien beskriver ikke automatisk den enkelte Arbeiderbladet-artikkelen.
- SNL, [Martin Tranmæl](https://snl.no/Martin_Tranm%C3%A6l) og [Harald Stanghelle](https://snl.no/Harald_Stanghelle): biografisk identitet og redaksjonelle roller. Stanghelles arbeid 1982–1991 avgrenses til husperioden 1982–1988 ved dette stedet.
- Oslo byleksikon, [Æreslunden](https://oslobyleksikon.no/side/%C3%86reslunden): gravlisten dokumenterer Tranmæls eksisterende primæranker; det flyttes ikke.

## Badge, profil og innholdsplan

Hovedbadge: Media. Underbadges: aviser, journalistikk, mediehus_og_redaksjoner. Kildene bærer et `standard` redaksjonssted med et fullt, stedseiet Fagverk: huset, partibånd, okkupasjonsbrudd, redaktørrollen, teknisk omlegging og flyttestrid. Avisens senere nett-/konsernhistorie inngår bare som avgrenset etterhistorie og skal ikke blåse opp dette fysiske stedet til hele avisens historie.

Kandidatsamlinger: People, Objects, Brands, Utgivelser. Bare ferdige PASS-samlinger aktiveres. Tranmæl og Stanghelle gir to dokumenterte redaksjonelle perioder. Grunnlegger Christian Holtermann Knudsen døde før innflyttingen og får ingen fysisk stedskobling. Arkitektene er bygningshistorie, ikke automatisk avisens People. Larssen, Hirsti og Brunvand behandles i kildebelagt historie; ingen nye portretter konstrueres fra navnelike søkeresultater. Commons «Brunvand portrait.jpg» viser amerikanske Jan Brunvand og er avvist.

Object-audit søkte trykkpresser, redaksjonsutstyr og aviseksemplarer i DigitaltMuseum og avis-/arkivhistorikken. Bevarte avisutklipp hos Nils Aas dokumenterer en kunstnerrelasjon, ikke et bestemt eksemplars fysiske bruk i redaksjonen. Fotoarkivets samlede negativer er ingen enkeltgjenstand. Ingen kvalifisert identifisert fysisk gjenstand er påvist i denne avgrensede auditen; Objects er begrunnet N/A, uten holdback av en identifisert kandidat bare fordi asset mangler.

Brand: eksisterende Dagsavisen-identitet skal få autentisk offisielt ordmerke, eksplisitt presentert som senere avisnavn. Dette er foreløpig BLOCKED på asset, aldri navnefallback som ferdigstatus. Utgivelse: den sammenhengende papirpublikasjonen; faksimilen av første Vort Arbeide fra 1884 skal være synlig datert og uttrykkelig skilt fra redaksjonsstedet fra 1934. Den er ikke et fysisk aviseksemplar fra dette huset.

Story-kandidat: konflikten om flyttingen. Narrativt spørsmål: hvorfor kunne en teknisk vellykket flytting samtidig møte motstand fra redaksjonen? Samtidig beretning og senere intervju gir forskjellige perspektiver. Ingen oppdiktet scene, tale eller følelsesbeskrivelse.

Språkleksikon: publikasjonsnavnene og den dokumenterte betegnelsen partiorgan; intet dialektlag. Lesespor: åpne, direkte artikler og den samtidige PDF-beretningen med sidehenvisning. Nyheter skal vurderes særskilt fra generell nyhetsproduksjon i dagens avis. Før/etter kan ikke bruke teatersalens ombygging som redaksjonens hovedpar.

Quiz produseres i separat quizløp etter canonical stedsinnhold. Normalåpning og profil avgjøres fra den ferdige påstandsbanken; det er ikke forhåndslåst en settkvote. Endelig sted-closeout krever både fullført quiz, separat QuizCard og reell nettleserkontroll.

## Bildekandidater kontrollert på Commons

1. [Folketeaterbygningen 1947](https://commons.wikimedia.org/wiki/File:Folketeaterbygningen_1947.jpg), Leif Krohn Ørnelund / Oslo Museum, 11. oktober 1947, CC BY-SA 4.0. Stående original 863×1187; Commons opplyser at kanten er beskåret i 2025. Bildet viser eksteriør og valgplakater, ikke innendørs avisarbeid.
2. [Folketeaterbygningen Oslo](https://commons.wikimedia.org/wiki/File:Folketeaterbygningen_Oslo.jpg), Mahlum, 17. september 2006, Public domain. Senere eksteriør; etter avisens utflytting.
3. [Vort Arbeide No 1 1884](https://commons.wikimedia.org/wiki/File:Vort_Arbeide_No_1_1884.jpg), ukjent opphavsperson, faksimile fra Det Norske arbeiderpartis historie 1887–1937, Public domain. Publikasjonsidentitet og eldre navnehistorie, ikke redaksjonsadresse i 1884.

Lokale downloads fikk HTTP 403. Dette betyr ikke at kildefilene mangler eller at rettigheter er kontrollert av nedlasting; en avgrenset Actions-kjøring skal hente originalene og registrere bytes/hash/dimensjoner før lokal visuell vurdering.

## Core-review og kildeevidens

31 verifiserte claims dekker beskrivelsen setning for setning. Full Fagverk-artikkel er lest avsnitt for avsnitt: (1) hus/innflytting/innvielse, (2) avisnavn og partiorgan, (3) okkupasjonsbrudd, (4) Hallin/Mancini-definisjon, (5) redaktørvalg som første dokumenterte case, (6) Hasle som andre dokumenterte case, (7) kildenes avsender- og tidsgrenser, (8) senere navn og bilder. Alle kildelenker er operative kilder som er åpnet, ikke intern modelltekst. De to leksikonartiklene er redigert for hhv. historie og flyttestrid. Språkets fem oppføringer gjelder dokumenterte navne-/presseuttrykk. Story er én navngitt og datert episode, og maskinscoren 19 beregnes med den eksisterende scoremotoren; scoren erstatter ikke kilde-review.

OBOS' åpne eiendomsside er kontrollert 11.10.2026 og identifiserer dagens Youngstorget 2 som det tidligere avishuset. Fersk Geonorge-JSON gir nøyaktig adresseobjekt 0301:18554:2. Råfeltet stedfestingverifisert=false beholdes og opplyses i coordNote: dette er et adressepunkt for den kildeidentifiserte historiske bygningen, ikke en kontrollmålt inngang eller et bestemt kontorrom.

Intake Actions 38160487568 hentet originalbilder og råadresse. Offisielt logo-intake resulterte i commit f1c3d95cda46f893e45593c67a974617999df980. HTML-snapshotets faktiske header og publisher.logo pekte begge til DA_Primarylogo_Negativ.svg. Original URL og hash beholdes i logo-source.json. Midlertidig downloader/workflow og hele side-HTML-en fjernes fra sluttendringen; originale assets og avgrenset kildeevidens beholdes.

Alle tre nye bildeoriginaler og begge eksisterende personportretter er åpnet. Hele avissiden er kontrollert: No. 1, Mai, 1884. Ordmerket er rendret og visuelt kontrollert. White-on-transparent-originalen får mørk flate; hele publikasjonssiden vises med contain fremfor portrettbeskjæring. Proveniens og datoer er eksplisitte. Ingen moderne logo hevdes historisk brukt i huset.

Kvalitet for dette avgrensede core-checkpointet: korrekthet/evidens 5, dekning 4, redaksjonell kvalitet 5, teknisk integritet 4, ansvarlighet 5, etterprøvbarhet 4 = 27/30. Dekning gjelder canonical stedsinnholdet, ikke samlet SLUTTFØRT-status. Sluttkvaliteten skal vurderes på nytt etter separat quiz og reell nettleser-QA. Seks egne semantiske regresjoner, fem Place Sheet-regresjoner, People Profile-audit og hele Story-integriteten består lokalt. Den tidligere generelle all-place factuality-auditen har eksisterende avvik utenfor scope; ny place har null packet-avvik etter tekstkontroll. V3 verify og remote CI må i tillegg bestå på committen som merges.
