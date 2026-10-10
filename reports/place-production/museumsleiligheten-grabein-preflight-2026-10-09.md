# Museumsleiligheten Gråbein — stedsproduksjon, nullmåling og kontroll

Kontrolldato: 2026-10-09. Canonical Place-ID: `museumsleiligheten_grabein`. Stedsarbeidet er separat fra quizproduksjonen i [PR #6159](https://github.com/Paradispartiet/History-Go/pull/6159).

## Identitet, Badge og profil

- Stedet er den bevarte **museumsleiligheten i Tøyengata 38B**, ikke alle Gråbeingårdene eller Arbeidermuseet i Sagveien.
- Hovedbadge: `historie`. Dokumenterte underbadges: `attenhundretallet`, `nittenhundre_1900_1945`, `sosialhistorie`, `migrasjon_og_minoritetshistorie` og `kulturminner_og_bevaring`.
- Bekreftet profil: `standard` på grunnlag av boligbygging, arbeidsmigrasjon, klasse-/bolighistorie og senere restaurering/musealisering.
- Koordinat: Geonorge adressepunkt 38B, `coordRole=display_marker`. Museet ligger i en leilighet i bygget, ikke i en geometrisk utstrekning for hele Gråbeingårdene.
- Eksisterende quiz: **PASS** – 28 spørsmål i fire sett, PR #6159, browser-testet på mobil og desktop. Ikke produsert om her.

## Kilderevisjon

| ID | Kilde | Bruk | Kontroll |
|---|---|---|---|
| Museum | https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/ | Bjørklund, 1891, en rom/kjøkken, boligstandard, 1987, 1990, besøksvilkår | gjennomgått |
| By | https://oslobyleksikon.no/side/T%C3%B8yengata | Tøyengata 38B fra 1888; 7 gårder, 212 leiligheter; rehabilitert 1981–83 | gjennomgått |
| SNL | https://snl.no/Gr%C3%A5being%C3%A5rdene | byggmesternavn, arkitekt, historie/litteratur, forskjell mellom gårdsgrupper | gjennomgått |
| SNL arkitekt | https://snl.no/Rudolf_Haeselich | Haeselich og teglarkitekturen | gjennomgått |
| Commons | https://commons.wikimedia.org/wiki/File:T%C3%B8yengata_38_fra_KMS.jpg | nøyaktig Tøyengata 38 fotografert av T. Grevstad-Nordbrock i 2022; CC BY 4.0 | lisens, år og motiv kontrollert |

## Status per sjekklistemodul (før visuell closeout)

| Port | Status | Evidens eller konkret rest |
|---|---|---|
| Canonical ID, tekst og koordinat | PASS | Place-kilde og offisiell adresse |
| Hovedbadge, underbadges, produksjonsprofil | PASS | Place-kilde og denne kilderapporten |
| Fagverk sted | PASS teknisk, manuell UI-QA gjenstår | Place-eid kuratert standardartikkel, fire linser, fem spørsmål, to spor, Fire kilder, registry |
| Språkleksikon | PASS teknisk, manuell UI-QA gjenstår | Fire stedsspesifikke oppføringer og canonical språkmanifest |
| Kronologi/epoker | PASS teknisk, manuell UI-QA gjenstår | 1888, 1891, 1919, perioden 1981–83, 1987, 1990 |
| Quiz | PASS | PR #6159, ingen omproduksjon |
| Bilder (`image`, stående `frontImage`) | PASS teknisk, manuell UI-QA gjenstår | To lokale, separate WebP-varianter fra rettighetsklarert Commons-original; portrett dimensjonskontrollert og bildekontroll bestått |
| QuizCard + flip | PASS automatisk browser-QA, manuell skjermbildegjennomgang gjenstår | Stedsspesifikk 10-spørsmåls QuizCard laget fra merget 4×7-quiz og registrert i historie-manifestet. Faktisk flip-interaksjon skal browser-testes. |
| PlaceCard-samlinger | To kildeførte samlinger produsert; ny browser/visuell QA kreves | Ett kildebåret medlem er nå plassert under `historical_events` (ikke legacy `productions`). 2022-fotografiet av 1888-bygningen har eksplisitt moderne datering. People, Objects og Brands er fortsatt under egen kandidatvurdering. |
| People | BLOCKED | Bjørklund-familien er dokumentert, men ikke tilstrekkelig individualisert til People-profil; Ole Olsen/Haeselich må auditeres mot eksisterende kanoniske personer og stedskrav |
| Objects | BLOCKED | Museets symaskin, seng m.m. er fotografert, men konkrete museumsobjekters proveniens og eierskap er ikke verifisert |
| Brands | PASS for Oslo Museum; andre kandidater ikke publisert | Oslo Museum er direkte museal driftsaktør siden 1990. Brand `oslo_museum` er registrert med autentisk Commons-logo (PD textlogo, referensiell identifikasjon). «Gråbein» og Tøyenhagen er sted/borettslag, ikke ekstra Brands; Oslo Byfornyelse må fortsatt vurderes som mulig separat historisk Brand. |
| Historiske hendelser | PASS automatisert browser-QA, manuell bilde-QA gjenstår | Oppføringen av akkurat Tøyengata 38B i 1888 er registrert under canonical `historical_events` med kilde og bilde av den bevarte bygningen fra 2022. Innflytting 1891 og tilbakeføring 1987 forblir tidsankere; de løftes ikke automatisk til samlingsmedlemmer. |
| Stories | BEGRUNNET N/A foreløpig | Ingen uavhengig narrativ utover beboerhistorikk/kronologi bekreftet |
| Før/etter | BLOCKED | Behov for stedstro historisk bildepar før det kan godkjennes |
| Nyheter | BEGRUNNET N/A foreløpig | Ikke konstruer samtidige hendelser fra tidligere museumsarrangementer |
| Lesespor | PASS teknisk og browser-QA, manuell redaksjonell skjermbildekontroll gjenstår | Bokselskap har førsteutgaven av «Ulvehiet» (1919) direkte lesbar i nettleser. Lokalhistoriewiki beskriver musealiseringen og den senere innredningen. Begge registrert som `link_only` og stedskoblet i canonical Lesespor og runtime. |
| Kilder / Fagverk-lenker | PASS, UI-QA kreves | Navngitte kildehenvisninger i Place-data |
| Browser, plassering av Rundingene, bilder og mobil | PASS automatisert, manuell visuell kontroll PENDING | Chrome/Playwright på desktop (1440×1000) og mobil (390×844) bestod samling, popup, QuizCard-flip, quizinngang, bildelasting, ingen horisontal overflow og ingen JS-feil. Skjermbildene må fortsatt vurderes manuelt. |

**Sluttstatus: IKKE SLUTTFØRT.** Bilder, språk, Fagverk, kronologi og QuizCard er nå teknisk materialisert. People-, Object- og Brand-kandidater, Før/etter og manuell visuell kontroll av desktop- og mobilskjermbilder er fortsatt åpne porter. Dette er en bevisst delvis produksjon; `production_status=complete` må ikke settes før de reelle manglene er avklart.

## Automatisert PlaceCard-QA — 9. oktober 2026

- Kilde: [målrettet GitHub Actions-kjøring #37933514948](https://github.com/Paradispartiet/History-Go/actions/runs/37933514948), på PR-head `f242b4c5bc917e05cb7ffcc76a0d945bb9058638`.
- Testet faktisk app-ruting mot `#/place/museumsleiligheten_grabein` og `data/runtime/place-open/museumsleiligheten_grabein.json`, ikke isolert DOM-fixture.
- Desktop 1440 × 1000 og mobil 390 × 844: PASS på riktig sted og tittel, `place-card-collections-v2`, én materiell historisk hendelse med bilde og popup, QuizCard-tekst, front/bak-vending i begge retninger, quizrute, synlige bildeforespørsler, fravær av horisontal overflow og feil fra siden.
- Første diagnostiske forsøk stoppet på bekreftelse av tilbakevending; andre komplette gjennomspilling verifiserte begge faktiske klikkhendelser og kortretninger, uten produktkodeendring. Denne første kjøringen gir grunn til å beholde regresjonsdekning, men er ikke alene bevis for en permanent feil.
- Bevis: `grabein-placecard-mobile-desktop`-artefakt med desktop- og mobilskjermbilder og maskinlesbare tester fra kjøringen. Skjermbildene er **ikke manuelt designreviewet**.
- Denne QA-kjøringen gjaldt den tidligere `productions`-registreringen og dokumenterer ikke senere migrasjon til `historical_events`. People, Objects, Brands og Før/etter er ikke lukket; Lesespor er kildekontrollert og materialisert.

## Kandidataudit: People, Objects, Brands og Før/etter — 9. oktober 2026

Denne auditen følger `docs/people-of-places-method.md`, `docs/PLACE_OBJECTS_CANONICAL.md`, `data/brands/brand_rules_v1_1.json` og `data/places/README_place_rounds.md`. Manglende publiserbar evidens regnes ikke som PASS eller N/A.

| Kandidatfamilie | Kandidat | Kildesituasjon | Beslutning |
| --- | --- | --- | --- |
| People | Byggmester Ole «Gråbein» Olsen | Oslo Museum bekrefter prosjektrollen; mangler ferdig canonical personprofil, bildeproveniens og profilreview for spesifikt sted. | **BLOCKED** – kvalifisert direkte aktør, ikke generer profil på gjetning. |
| People | Bjørklund-familien | Oslo Museum dokumenterer familie på sju innflyttet fra Sverige i 1891, men ikke individualiserte navn/biografier for alle. | **HOLDBACK** – ingen oppdiktet kollektiv personprofil. |
| People | Rudolf Haeselich | SNL knytter arkitekten til Gråbeingårdene generelt, ikke til dette bestemte interiørets utforming. | **Ikke materialiser** uten mer presis kobling. |
| People | Oskar Braaten | `Ulvehiet` er litterært vitnesbyrd om miljøtypen, ikke dokumentasjon på Braatens bosted eller arbeid i Tøyengata 38B. | **Ikke materialiser** som stedsperson. |
| Objects | Symaskin, kjøkkenredskaper, vaskefat, seng og kommode i utstillingen | Oslo Museum fotograferer de synlige gjenstandene. Lokalhistoriewiki dokumenterer at interiøret ble møblert med tidstypiske gjenstander ved etableringen. Hvert objekts identitet, eierhistorie og bildebruk må dokumenteres separat. | **BLOCKED** – ikke tilskriv tingene Bjørklund-familien. |
| Brands | «Gråbein» / Tøyenhagen borettslag | Gråbein er i denne sammenhengen navnet på et historisk gårdsmiljø, Tøyenhagen et boligfellesskap; ingen separat kvalifisert varemerkeidentitet for stedet er etablert. | **BEGRUNNET N/A** som selvstendige PlaceCard-Brand-medlemmer. |
| Brands | Oslo Museum / Oslo Byfornyelse | Oslo Museum er dokumentert institusjon ved stedet siden 1990, nå registrert under én canonical `oslo_museum`-ID med uendret, offentlig tilgjengelig PD-tekstlogo fra Commons. Oslo Byfornyelse hadde restaureringsrolle i 1987, men er fortsatt ikke billed-/identitetsklar for egen Brand. | **PASS** for Oslo Museum som PlaceCard-medlem; Oslo Byfornyelse **kandidat-holdback**, ingen falsk logo. |
| Før/etter | Tøyengata 38B eksteriør 1888/ca.1900 mot 2022 | Moderne dokumentarfoto er publisert hos Wikimedia Commons; ingen eldre kildebelagt, sammenlignbar standpunktserie er dokumentert i denne produksjonen. | **BLOCKED** frem til et faktisk historisk førbilde med motivanker er kilde- og rettighetskontrollert. |
| Før/etter | Museumsleilighet før/etter 1987 | Lokalhistoriewiki omtaler tilbakeføringen, men dokumenterer ikke et bildepar fra samme interiør/standpunkt. | **BLOCKED** – ikke bruk to moderne fotos av rekonstruert interiør som falskt før/etter. |

Kilder kontrollert:
- Oslo Museum: https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/
- Bokselskap, faktisk lesbar innledning til 1919-utgaven: https://www.bokselskap.no/boker/ulvehiet/ulvehiet-kaldes-de
- Lokalhistoriewiki, `Museumsleilighet i Tøyengata`: https://lokalhistoriewiki.no/wiki/Museumsleilighet_i_T%C3%B8yengata
- SNL om Gråbeingårdene: https://snl.no/Gr%C3%A5being%C3%A5rdene
- Commons om 2022-fotografiet: https://commons.wikimedia.org/wiki/File:T%C3%B8yengata_38_fra_KMS.jpg

**Eiergrense:** Lesespor er publiserbare lenker, ikke en People-person, Object eller Story. Opplysningene om senere møblering betyr at påstander om Bjørklund-familiens spesifikke møbler må avvises. Lesespor er nå teknisk produsert og browser-testet; all annen oppført BLOCKED-status og manuell slutt-QA forblir åpen.

## Canonical kategoriuttrykk — korrigert 9. oktober 2026

Historie-kontrakten for nye/vesentlig reviderte steder krever `historical_events`. Gråbeins tidligere `productions` var et legacy-avvik. Den ene stedsspesifikke 1888-hendelsen er derfor flyttet **uten å lage en ny hendelse eller endre quiz**. `place_card_profile.collection_ids` peker til `historical_events`, som støttes av `js/ui/place-rounds-visual-collections.js`. Avledet Place-open og quiz-kontekst må være kontrollert på eksakt PR-head. Ny browser-QA kreves fordi tidligere gjennomspilling testet den gamle kategorinøkkelen.

## Historisk hendelse — faktisk browser-QA på migrert datamodell

- Kjøring: https://github.com/Paradispartiet/History-Go/actions/runs/37954630937
- Desktop 1440×1000 og mobil 390×844: `historical_events` med nøyaktig ett medlem, synlig og lastet fotografi, aktiv popup med år 1888 og korrekt Tøyengata-tekst, 0 px horisontalt overløp og ingen JavaScript-feil. **PASS automatisk**, ikke manuelt designreview.
- To source/runtime-regresjonstester er også grønne: `tests/museumsleiligheten-grabein-collections.test.mjs` (samlingens eiergrense og Lesespor-lenker).
- Genererte quiz-kontekst og Fagverk-release er produsert med canonical generator på migrert source, uten quizspørsmålsendring.

## Historiske fotokandidater etter videre arkivsøk

- Oslo Museum / Oslobilder, `OB.A6017`: fotograf Rune Aakvik, gårdsinteriør/hage/lekeplass ved Tøyengata 38 i **1993**. https://oslobilder.no/OMU/OB.A6017
- Oslo Museum / Oslobilder, `OB.F29508`: fotograf Heidi Bakke, kjøkken i Museumsleiligheten Tøyengata 38B i **1996**. https://oslobilder.no/OMU/OB.F29508
- Begge er relevante kilder for restaurert bruk, men **ikke dokumentasjon på interiøret før 1987**. Verken kamerastandpunktparitet eller publiserbar fotorett er ferdig kontrollert. Ingen av dem materialiseres som `for_na` nå.

## Lesespor — faktisk browser-QA

- Kjøring: https://github.com/Paradispartiet/History-Go/actions/runs/37956426140
- Desktop 1440 × 1000 og mobil 390 × 844: **PASS**. `HGPlacePopupTabs.resolveLesespor` returnerer begge stedskoblede oppføringene; de rendres i den faktiske synlige `[data-place-panel="reading"]`-flaten, med nøyaktig to kort.
- Begge eksterne lenker er korrekt `https`-koblet, den litterære kildeavgrensningen («ikke som dokumentasjon») vises, horisontalt overløp er 0 px, og ingen JavaScript-feil ble registrert.
- QA avdekket ingen produktfeil: første test søkte etter gammel `#hg-place-panel-reading`-ID. Aktuell app bruker `[data-place-panel="reading"]`, og den kontrakttro testen bestod uten endring i produksjonskode.
- Samlingen er fortsatt **ikke** en erstatning for historiske Objects, Brand eller People, og manuell visuell vurdering av PlaceCard er ikke signert.

## Brands — kildebelagt materialisering 9. oktober 2026

Oslo Museum er en selvstendig museumsinstitusjon, ikke et alias for bygården eller en kopi av Arbeidermuseets sted. Museets egen besøkside dokumenterer forvaltningsansvar fra 1990. Institusjonens faktiske merke er kildetatt direkte fra Wikimedia Commons' uendrede original `Oslo Museum logo.svg` (opplasting 18. oktober 2012, oppført som PD-textlogo, fortsatt potensielt varemerkebeskyttet). Denne er lagret som original SVG, kun for referensiell identifikasjon, uten antydning om sponsing eller godkjenning.

- Brand-ID: `oslo_museum` i `data/brands/brands_master.json`.
- Stedskobling: `data/brands/brands_by_place.json`, `museumsleiligheten_grabein`.
- Medlemsbilde: `bilder/kort/brands/oslo_museum.webp` (proporsjonsbevart, original identitet i `bilder/kort/brands/oslo_museum.svg`), SHA-256 `233b047cf217e90fa233372ebcc1518c432f8d9af7646bd65ab80f248d7b4dc0` fra original kilde.
- Kildeside: https://commons.wikimedia.org/wiki/File:Oslo_Museum_logo.svg.
- Stedskilde: https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/.
- Oslo Byfornyelse vurderes separat; det brukes ikke en institusjonslogo for å gi dette selskapet identitet.
- `place_card_profile.collection_ids` har nå `brands` og `historical_events`. Ny real-browser QA må vise to bildesterke og koherente samlingskort; manuell designreview gjenstår.

### Logo-forhåndsvisning – dokumentert bilde-QA

Den faktiske Chrome-skjermbildet av 2-samlings-PlaceCard viste at den originale 306×216-SVG-logoen ble for hardt beskåret av rektanglets `object-fit: cover` (særlig på mobil). Dette er et reelt visuelt kvalitetsavvik, ikke et bildeproblem i selve kilden. Original `bilder/kort/brands/oslo_museum.svg` beholdes uendret. En lesbar kvadratisk WebP-preview på 640×640, med den nøyaktige kildelogoen proporsjonalt skalert og sentrert på ren hvit flate, produseres derfor som eget medlemsbilde `bilder/kort/brands/oslo_museum.webp` (SHA-256 `b1eebb84250f2b0acf946ae7d9affaed62e30811cc7be10effa10ba9184dbb62`). Ingen ny tekst, rekonstruksjon eller stylisering tilført. Bygge- og QA-kjøring: https://github.com/Paradispartiet/History-Go/actions/runs/37959974022. Ny Chrome- og manuell visual-QA må kontrolleres på denne faktisk publiserte previewvarianten.

## Slutt-QA på korrekt MapView-rute — 9. oktober 2026

- Real-browser kjøring: https://github.com/Paradispartiet/History-Go/actions/runs/37963008548
- Den forrige testens falske skjult-tilstand er forklart av `js/views/MapView.js`: ved `#/place/...` skjules kortet med vilje mens `flyTo` kjører; det åpnes på korrekt `moveend` når kartet er sentrert. Målrettet testen venter nå på den ferdige navigasjonen, ikke en manuell `expandPlaceCard()` før kartbevegelsen avsluttes.
- Chrome desktop 1440×1000 og mobil 390×844: faktisk synlig kort (`is-open`, `aria-hidden=false`, `opacity=1`), begge bildebaserte samlinger, kildebelagt Oslo Museum-Brand-popup, 1888-hendelse og ingen horisontal dokument-overflow: **PASS automatisert**.
- Faktiske skjermbilder: artefakten `grabein-two-collections-20261009` fra kjøringen er kontrollert visuelt. **Visuell slutt-QA: IKKE GODKJENT.** På mobil overlapper tittel-/statusområdet deler av hero/overlegg og ikonplasseringen. PlaceCard har dessuten et stort ubenyttet mørkt felt under samlingene. Desktop har også ubenyttet areal nederst; arkfanenavigasjon horisontalt stikker utenfor synlig område.
- Disse funnene gjelder felles PlaceCard-geometri/layout i den oppdaterte appen, og skal løses i det generelle PlaceCard-designsporet, ikke ved å forfalske eller repetere samlingsinnholdet for Gråbein.
- Brand-forhåndsvisningen bruker fortsatt en referanse til `bilder/kort/brands/oslo_museum.svg` i det faktiske kortet selv om separat proporsjonsbevart WebP-preview finnes i kildene. Dette må verifiseres ved endelig visual-QA; kilde-SVG beholdes uendret.
- Midlertidig workflow og midlertidig QA-script er fjernet etter at logg/skjermbildebevis ble lagret hos GitHub Actions. Permanent regresjonstest `tests/museumsleiligheten-grabein-collections.test.mjs` beholdes.
- Uavklarte kategorigater: People (Ole Olsen uten komplett canonical mediereview), Objects (udokumentert enkeltgjenstandsproveniens), Før/etter (mangler verifisert historisk bildepar). Oslo Byfornyelse er fortsatt en kandidat, ikke publisert som Brand.

**Produksjonsbeslutning:** Behold `draft` og `production_status` ufullstendig inntil de manglende gates er riktig dokumentert/godkjent og visuell PlaceCard-QA er godkjent. Grønn CI for dokumenter/data er ikke ekvivalent med full stedsproduksjon.

## Tilleggsrevisjon av kilder og visuell closeout — 9. oktober 2026

### Bjørklund-familien: navngitte kandidater, men usikker leilighetsidentifikasjon

Enerhaugen, Grønland og Tøyen historielags artikkel «Museumsleiligheten på Tøyen» er skrevet av Marte Marie Ofstad, som oppgir at hun arbeider som formidler ved Oslo Museum. Hun navngir Johan Aronson Bjørklund (f. 1855), Marie Sofie (f. 1853), døtrene Ester Marie, Eline (Ellen) Marie, Borghild Konstanse og Anna Margrete, samt sønnen Johan Artur Gottfried. Artikkelen beskriver dessuten at Bjørklund og Engebretsen var knyttet til to leiligheter i andre etasje; **hvilken familie som bodde i akkurat hvilken leilighet er ikke sikkert kjent**, og museet valgte å formidle én av leilighetene som Bjørklund-familiens hjem. Dette er en vesentlig presisering av den mer kategoriske formuleringen på Oslo Museums korte besøkside. Navnelisten må kontrolleres mot primærkilder før individuelle People-profiler materialiseres. Ingen personportretter er kilde-/rettighetsklarert for kanonisk bruk. **People forblir BLOCKED**, nå med konkrete, navngitte kandidater og eksplisitt identitetsforbehold.

Kilder: https://egt-historielag.no/informasjon/nyheter/vis/?ID=22174&T=Museumsleiligheten+p%C3%A5+T%C3%B8yen&af=1 ; https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/ .

### Objects: materiell dokumentasjon kontra opprinnelig proveniens

Den samme artikkelen og Lokalhistoriewiki oppgir at Oslo Byfornyelse tilbakeførte og innredet museumsleiligheten med tidstypiske møbler i samarbeid med kunsthistoriker Truls Aslaksby; dette er **ikke** en dokumentert beholdning av Bjørklund-familiens eiendeler. Museets egen publikasjon viser blant annet seng, kommode og vaskemiljø. Oslo Museums fotografiske arkiv beskriver interiør og gjenstander i 1995/1996 (OB.A6767, OB.F29508, OB.F29511 og OB.F29512), men dokumenterer ikke for hvert konkret Object inventarnummer, opphav/eierrekke eller godkjente medlemsbilder for lokal publisering. **Objects forblir BLOCKED**, og eventuelle objekter skal beskrives som del av museets periodeinteriør, ikke som autentiske Bjørklund-gjenstander, dersom de senere godkjennes.

Kilder: https://lokalhistoriewiki.no/wiki/Museumsleilighet_i_T%C3%B8yengata ; https://oslobilder.no/OMU/OB.A6767 ; https://oslobilder.no/OMU/OB.F29508 ; https://www.oslobilder.no/OMU/OB.F29511 ; https://www.oslobilder.no/OMU/OB.F29512 .

### Før/etter: bildenes dato og motiv er avgjørende

Oslo byarkivs bilde A-10003/Ub/0001/099 («Gråbein Okt - 87») viser en oppusset bakgård i 1987, ikke et dokumentert førbilde av interiøret før tilbakeføringen. Interiørfotoene fra 1995 og 1996 er også **etter** musealiseringen. De gir historiske etterbilder og kildehenvisninger, men ingen verifisert stedstro før/etter-paritet med dagens interiør eller samme eksteriørstandpunkt. **Før/etter forblir BLOCKED** inntil både motiv- og rettighetskontroll av et sammenlignbart bildepar er fullført.

Kilde: https://www.oslobilder.no/BAR/A-10003/Ub/0001/099 .

### Verifisert UI-status

Etter merge av nyere `main` og utbedring av den gamle fire-raders reserveringen i Place Sheet bestod 18 av 18 PR-workflows på head `a2e933285dd921c01d0e7d6c10e2b92b6a48b1cf`, inkludert `Place Sheet final acceptance`. Nettleserartefakten `grabein-visual-closeout` fra https://github.com/Paradispartiet/History-Go/actions/runs/37982416951 viser faktisk sted på desktop og mobil med to kildebårne samlinger og Events/Møtes i høyre mediekolonne. Sluttgjennomgangen markerer fortsatt visuell finjustering av Oslo Museum-logoens aktive SVG-preview og vertikal scrolling i små viewport som reviewpunkter; automatisert grønn test alene er ikke redaksjonell sluttgodkjenning. Ingen manglende kildeport settes til PASS, og `production_status` skal forbli ufullstendig.

## Kildedrevet presisering av Bjørklund-leiligheten — 9. oktober 2026

Marte Marie Ofstad (Oslo Museum, publisert hos EGT historielag) opplyser at Bjørklund og Engebretsen bodde i to leiligheter i andre etasje, og at det ikke er sikkert hvilken familie som bodde i hvilken: https://egt-historielag.no/informasjon/nyheter/vis/?ID=22174&T=Museumsleiligheten+p%C3%A5+T%C3%B8yen&af=1

Denne revisjonen retter kronologi, stedets Språkleksikon, leksikonartikkel, historisk case-kilde, claim-evidens og deres avledede runtime-visninger. **PlaceCard sin `desc` og `popupDesc`, samt integrert Fagverk-tekst, inneholder fortsatt for kategorisk formulering.** Den fullstendige stedsrettingen er derfor ikke lukket. Disse feltene må endres samtidig med oppdatering av kildehash, quiz-kontekst, Fagverk-release og Place-open før ny teknisk sluttkontroll. People, Objects og Før/etter er fortsatt BLOCKED; behold PR som draft.

### Redaksjonell brukerflate rettet — 9. oktober 2026

Canonical stedstekst `desc` og `popupDesc`, Fagverkets familieavsnitt, linsekilde, undersøkelsesspørsmål og quiz-profil er nå rettet: museet formidler en av to leiligheter som Bjørklund-familiens hjem, men boenheten kan ikke sikkert identifiseres. Kilden fra Ofstad er ført i Fagverkets stedsspesifikke kildeliste. Oppdaterte `textHashes`, quiz-kontekst og `place-open` følger denne endringen. **Fagverk-release er ennå ikke regenerert og CI må kjøres på nytt før teknisk godkjenning.** People, Objects og Før/etter forblir åpne porter; PR må fortsatt være draft. Kilde: https://egt-historielag.no/informasjon/nyheter/vis/?ID=22174&T=Museumsleiligheten+p%C3%A5+T%C3%B8yen&af=1

## Etterkontroll etter kildesynkronisering – 9. oktober 2026

- PlaceCard `desc`/`popupDesc` og integrert Fagverk er rettet i commit `aaaff75f`. Quiz-kontekst, Place-open og `data/places/production` har oppdaterte kildedata og teksthasher. Historie-pakkens Fagverk-release er regenerert i commit `81051aa8` etter innholdsbasert kontroll av alle 193 refererte filer; før-regenereringshashene stemte med manifestets lagrede verdier.
- **Separat quiz-kvalitetsfunn:** `data/quiz/historie/museumsleiligheten_grabein_sets.json` og QuizCard har spørsmål av typen «Fra hvilket år oppgir Oslo Museum at familien Bjørklund bodde i leiligheten?». Museets egen korttekst oppgir 1891, men museumsformidler Marte Marie Ofstad presiserer at familien bodde i én av to leiligheter i andre etasje og at boenheten ikke sikkert kan identifiseres. Quizspørsmål og begrunnelsesfelt må vurderes i separat quiz-korreksjon uten å omprodusere 4×7-settene eller anta et sikrere belegg. Den eksisterende place-PR har ikke endret quizsettet.
- **People-bildeaudit:** Et eldre bilde av Ole Olsen på en avis-/bildesøketreffside er ikke tilstrekkelig rettighets- og identitetsverifisert for kanonisk profil. Commons-treff med navnet «Ole Olsen» viser blant annet komponist og andre navnebrødre: disse er ikke identifisert som byggmesteren. Ingen av bildene er importert. Familiekandidaten Johan Aronson Bjørklund og øvrige navngitte medlemmer er ennå ikke primærkilde-/portrettklarert. Kilde: https://egt-historielag.no/informasjon/nyheter/vis/?ID=22174&T=Museumsleiligheten+p%C3%A5+T%C3%B8yen&af=1
- **Før/etter-fotorevisjon:** Oslobilder `OB.A6767` (Rune Aakvik, 1995, museumsleilighet/kjøkken), `OB.F29508` (Heidi Bakke, 1996, kjøkken) og `OB.F29511` (Heidi Bakke, 1996, stue) viser istandsatt museumsinteriør **etter** tilbakeføringen i 1987. Alle kan fungere som historiske museumstilstandsbilder hvis rettighetene avklares, men ingen er et dokumentert *før*-fotografi fra tiden før restaureringen. Kilder: https://oslobilder.no/OMU/OB.A6767 ; https://oslobilder.no/OMU/OB.F29508 ; https://www.oslobilder.no/OMU/OB.F29511
- **Objects:** Publiserbare enkeltgjenstander kan fortsatt ikke produseres uten egen objektdokumentasjon og bildeavklaring; utstillingsmøbler er ikke beviselig Bjørklund-inventar. Oslo Museums institusjonsfoto og historielagets tekst autoriserer ikke gjenbruksrett på hvert bildemedlem.
- **Merge/CI:** PR er fortsatt `draft`. GitHub oppgav `mergeable_state=dirty` ved kontroll av commit `81051aa8`; konfliktårsak er ikke undersøkt tilstrekkelig til å kunne løses sikkert, selv om en compare-kontroll viste `main` som felles stamkommit. Ingen full CI-/browser-akzept er bekreftet på denne nye headen; tidligere 16/16 kan ikke overføres til senere commits. `production_status=complete` er ikke satt.

### Merge-konflikt avklart og arkivlisens presisert

- Merge-commit `348b40b2` har to foreldre: Gråbein-branchen og ny `main` (`5aac5712`). For 12 ikke-overlappende filer er `main` videreført uendret. `css/place-sheet.css` har beholdt Gråbeins tre frontkort-geometriregler samtidig som nyere typografijusteringer fra `main` følger med. Den permanente PlaceCard-layouttesten bruker nyere, strengere browser-kontrakt fra `main`. GitHub bekreftet etterpå `mergeable=true`, `mergeable_state=clean`, `behind=0`.
- DigitaltMuseum dokumenterer `OB.A6767` med fotograf Rune Aakvik, 1995, og eksplisitt CC BY-SA-lisens: https://digitaltmuseum.no/021017017322/museumsleiligheten-i-toyengata-38-b . Dette gir én identifisert lisensiert **etter-restaurering**-kilde, men ikke et autentisk historisk førbilde, og gjør ikke de avfotograferte enkeltgjenstandene til proveniensverifiserte Objects.
- Ny full CI og manuell visuell aksept må fortsatt være grønne på siste commit. Quizens problematiske leilighetsformulering forblir et separat quiz-produksjonsavvik, ikke automatisk en del av stedschecklistens merge.

## Kildefaglig closeout-kontroll — 10. oktober 2026

**Dette er evidensoppdatering, ikke fullført sted.** På `963eb1453614250ca67f28d15b0b3c4f5752718c` var samtlige 19 PR-workflows merket `success` (inkl. Typecheck baseline report og Civication). Siden `main` senere har flyttet seg, gjelder godkjenningen kun denne headen, og det må tas ny eksakt-head CI etter eventuell synk/ny commit.

### People — konkret identitetskontroll, men ingen fotografisk aksept

- Oslo kommunes Byantikvar, *Vedlegg til Kulturmiljøstrategi 2023–2034*, s. 12, omtaler byggmesteren som **Ole Andreas Olsen («Gråbein-Olsen»)** ved Lakkegata 71. https://www.oslo.kommune.no/get-file/1122658/6b331dce83da956b41d811286a77c07729183ded1de5187a35b761059ffeb76c
- Leif Thingsrud, «Byggmester Ole “Gråbein” Olsen – Rovdyr eller boligreformator?», *Tobias* 3/1997, gjengitt i *DISputten* 1/2008, s. 6 flg., oppgir **Ole Olsen født 1832 på Hovinsetra ved Gardermoen**. Navnevarianten må forankres mot denne biografien og primærkilder før People-profilen får entydig person-ID. https://www.slektogdata.no/_oa/disputten/disputten-2008-1/files/assets/common/downloads/publication.pdf
- **Navnebror-felle:** Webtreff for «Ole Andreas Olsen (1835–1908)» gjelder en skipper i Porsgrunn, født i Solum 1835, og kan ikke uten videre tilordnes byggmesteren fra Ullensaker (f. 1832). Ikke importer profil, årstall eller portrett fra slike navnetreff. https://servanhomme.com/getperson.php?personID=I23038&tree=tree1
- Marte Marie Ofstads museumsformidling hos EGT historielag navngir familien Bjørklund, men sier uttrykkelig at de to andre-etasje-leilighetenes familieplassering er usikker. Ingen historiske, personidentifiserte og rettighetsklarerte portretter av Bjørklund-familien eller byggmesteren er dokumentert i denne kontrollen. https://egt-historielag.no/informasjon/nyheter/vis/?ID=22174&T=Museumsleiligheten+p%C3%A5+T%C3%B8yen&af=1
- **People: BLOCKED.** Mulig videre kildevei er Oslo byarkivs originale kirkebøker, folkeregister-/adressebokkoblinger og Oslo Museums egne fotoarkiver med faktisk identitets- og lisenskontroll; et tilfeldig «Ole Olsen»-portrett oppfyller ikke kravet.

### Objects — skille mellom utstillingsgjenstand og eierproveniens

- Oslo Museum publiserer foto av en konkret, fysisk symaskin ved leilighetens vindu og konkrete møbler/kjøkkeninventar: https://www.oslomuseum.no/hva-skjer/open-house-oslo-grabein/ og https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/
- Fotoet dokumenterer *tilstedeværelse i et kuratert museumsinteriør*, ikke at akkurat denne symaskinen var Bjørklund-familiens, eller et museumsinventarnummer, eksakt opprinnelse, produksjonstid og tillatt gjenbruk i appen.
- Canonical `docs/PLACE_OBJECTS_CANONICAL.md` krever identifiserbar fysisk gjenstand, stedstilknytning, datering, funksjon, medlemsspesifikt lokalt foto med lisens, og normalt **minst to** representative, ulike Objects. Visk ikke ut evidenskravet ved å skjære enkeltgjenstander ut av generelle interiørbilder.
- **Objects: BLOCKED / source-bounded holdback**, ikke `BEGRUNNET N/A`.

### Før/etter — tids- og motivport

- `OB.A6767` (1995), `OB.A6769` (1995), `OB.F29508` (1996), `OB.F29511` (1996), `OB.F29512` (1996) og gårdsbildet `OB.A6017` (1993) er alle fra *etter* tilbakeføringen i 1987. Oslobilder-katalogene gir datering og fotograf, men ingen av disse beviser rommets tilstand **før** restaureringen. https://oslobilder.no/OMU/OB.A6767 ; https://oslobilder.no/OMU/OB.A6769 ; https://oslobilder.no/OMU/OB.F29508 ; https://oslobilder.no/OMU/OB.F29511 ; https://oslobilder.no/OMU/OB.F29512 ; https://oslobilder.no/OMU/OB.A6017
- Generelle foto av «Gråbeingårdene» i Sars gate, Urtegata eller Siebkes gate er **ikke** motiver fra den konkrete museumsleiligheten i Tøyengata 38B. Skal aldri brukes som påstått historisk førbilde for stedet.
- Potensielle gjenbrukslisenser for ett eller flere *etter*-fotografier opphever ikke manglende motivmessig/tidsmessig par. Krever før-1987-bilde eller eldre samme-sted-eksteriør med verifisert standpunkt, rettigheter og et relevant nåfoto.
- **Før/etter: BLOCKED.**

### Quiz-presisjon — avdekket avvik, separat korrigeringsfase

`data/quiz/historie/museumsleiligheten_grabein_sets.json` spørsmål `..._05` sin `knowledge` og `claim_basis` og `..._08` sin spørsmålsformulering impliserer at familiens presise leilighet er identifisert. Disse spørsmålene speiles i `data/quizcards/historie/museumsleiligheten_grabein_quizkort_v1.json`. Fasitene **Bjørklund** og **1891** kan beholdes; premiss, kunnskapstekst, påstandsbank og QuizCard må samordnes om «én av to leiligheter i andre etasje, eksakt boenhet usikker». Ikke omproduser de 4 × 7 spørsmålene. Hensyn til generert quiz-kontekst og Knowledge-ID må ivaretas ved retting.

### Merge-gate

`production_status` **skal ikke settes til complete**. Gjeldende green CI er teknisk, ikke redaksjonell. Manuell visuell iPad-kontroll (inkl. logo-preview, vertikal scroll og kortgeometri) står også åpen. Nyere `main` har berørt bl.a. genererte Fagverk-filer; synk med konfliktkontroll før eventuell senere merge. PR er fortsatt `draft` med åpne evidensporter.


## Arkivspor til etterprøving – mulig før-restaureringsfoto (10. oktober 2026)

### Oppgitt arkivtreff: mulig 1985-fotografi fra Tøyengata 38 B

Tidligere søk har meldt et mulig treff i DigitaltMuseum. **Ved uavhengig etterkontroll 10. oktober ble selve objektsiden blokkert (403), og eksakt bildereferanse ble ikke gjenfunnet i åpne søkeindekser.** Opplysningene under er dermed søkespor som fortsatt må verifiseres direkte fra museumsregistreringen før kildeporten kan endre status:

- **Samling / eier:** Oslo Museum, Byhistorisk samling.
- **Inventar-/bildenummer:** **OB.A6874**.
- **DigitaltMuseum ID:** **021017382615**.
- **Kildelenke:** https://digitaltmuseum.no/021017382615/museumsleiligheten-i-toyengata-38-b
- **Oppgitt motiv:** «museumsleilighet, arbeiderleilighet, interiør før restaurering, stue, vedovn, dør til kjøkken».
- **Oppgitt fotografering:** **1985**, men primærkildens registrering er ikke tilgjengelig for uavhengig kontroll i denne arbeidsøkten.
- **Oppgitt stedsangivelse:** Oslo, Tøyen, **Tøyengata 38 B**, fortsatt å bekrefte mot faktisk objektpost og bilde.
- **Oppgitt fotograf:** ukjent; kreditering må kontrolleres i primærregistreringen. Skal ikke tilskrives Rune Aakvik eller Heidi Bakke.
- **Oppgitt lisensspor:** CC BY-SA ble tidligere rapportert, men det har **ikke** vært mulig å verifisere dette direkte på akkurat OB.A6874 i siste kontroll. Ingen lisensstatus kan godkjennes eller bilde importeres uten verifiserbar post, bilde og konkret lisensversjon.

Dette er **en ny kandidat til arkivkontroll, ikke dokumentert bildebevis** i denne etterkontrollen. Den tidligere konklusjonen om manglende godkjent førbilde står derfor inntil registrering, datering, motiv og rettigheter er verifisert. Ingen produksjonsdata skal endres basert på dette sporet.

### Kandidat for etterbilde

- **OB.F29511** – https://oslobilder.no/OMU/OB.F29511
- **1996**, Heidi Bakke / Oslo Museum, samme identifiserte sted Tøyengata 38 B.
- **Motiv:** stue, ovn, konge-/dronningportretter på veggen, etter tilbakeføringen i 1987.
- Dette kan være et godt **etter**-motiv til OB.A6874 siden begge omtaler stue/ovn, men en felles ovn i arkivbeskrivelsene **beviser ikke** samsvarende kamerastandpunkt eller romutsnitt.
- Oslobilder viser Creative Commons-lisens på enkelte registreringer, men en offentlig museumsnettside er ikke i seg selv bevis for rett til å republisere høyoppløselige originalfiler. Individuell kildeside og versjon av lisensen må dokumenteres.

### Beslutning, kontrollrekkefølge

**Før/etter: BLOCKED.** OB.A6874 / DigitaltMuseum 021017382615 behandles som **ubesvart kontrollspor** inntil direkte arkivpost, faktisk fil og opphavs-/lisensdata er bekreftet. Etterbildet OB.F29511 (1996) har en tilgjengelig tekstindeksert museumspost, men det foreligger verken verifisert bildepar eller motivsammenligning. Dette er ikke PASS.

1. Se og last ned akkurat OB.A6874 fra lovlig lisensiert nedlasting (ikke fra tredjepart uten proveniens). Registrer originalfil, fotograf «ukjent», dato 1985, lisensens eksakte versjon og kilde-URL.
2. Kontroller kandidat OB.F29511 mot OB.A6874 side om side. Registrer veggflater, ovn, dør, fotovinkel og eventuelle strukturelle forandringer. Velg alternativt nyere stuebilde med påviselig standpunktparitet.
3. Verifiser CC-by-sa-krav og metadata for begge bilder samt lokale rettighets-/krediteringsfelter. Ikke publiser før bildepar og credits består den kanoniske Før/etter-porten.

### People/Objects etter samme arkivsøk

- **People:** EGT historielag, SNL og lokalhistoriewiki bekrefter historisk bakgrunn, men søk avdekket ingen pålitelig personidentifisert og rettighetsklarert portrettfil for byggmester Ole Olsen (f. 1832), familien Bjørklund eller sønnen Ole Anton. Ikke forveksle denne byggmesteren med komponisten Ole Olsen (1850–1927), presten Ole Tobias Olsen (1830–1924) eller andre navnebrødre.
- **Arkitekt:** Rudolf Haeselich er dokumentert for **andre** Gråbeingårder i Jens Bjelkes gate, Lakkegata, Sars' gate og Siebkes gate; disse kildene alene beviser ikke at han tegnet akkurat Tøyengata 38 B fra 1888. Ingen People-kobling her uten konkret dokumentasjon.
- **Objects:** Museumsfoto viser konkrete møbler og hånddrevet symaskin, men har ikke objektspesifikke inventarnumre, datering og eierskap. Kildene dokumenterer et innredet periodeinteriør; objekter skal ikke tilskrives Bjørklund-familien. Objects forblir BLOCKED.

**Ekstern e-post ikke sendt.** Kildekravene undersøkes i åpne arkiver først. På dette trinnet er hele PR-en fremdeles DRAFT; `production_status=complete` må ikke settes, og manuell iPad-Safari-QA er ennå ikke signert.

### GitHub-integrasjonskontroll etter nytt main – 10. oktober 2026

- Gråbein-head før denne presiseringen var `42a88c209a781beffe2c96d74b0d1441986ebbb0`; siste `main` observert som `4588e042ec5dcd835f3b5ba2cf396d5cd0618c3b`.
- GitHubs compare viser **divergerte grener** etter felles stamcommit `202058f685376c43fb00ccd3545fa1d9766bd59c`: Gråbein hadde da 82 egne commits, mens oppdatert `main` hadde 117. Overlappende endrede stier inkluderer `data/brands/brands_by_place.json`, `data/brands/brands_master.json`, `data/epoker/epoke-place-index.json`, `data/fagverk/fagverk_registry.json`, `data/fagverk/fagverk_release.json`, `data/places/place_image_backlog_summary.json`, `reports/fagverk/fagverk-place-page-coverage-v2.json` og `tests/epoke-place-index.test.mjs`.
- API-et viste `mergeable_state=dirty`. Det er **ikke tilstrekkelig til å fastslå faktisk tekstkonflikt** uten kontrollert konfliktanalyse av nytt `main`; dette må undersøkes før en integrasjonsmerge. Den gamle CI-statusen på `1aa1ee55` kan ikke brukes som godkjenning på dokumentasjons- eller fremtidig merge-commit. 
- **Ingen merge, ingen genererte filendringer og ingen produksjonsstatusendring** er utført i denne kontrollen.
