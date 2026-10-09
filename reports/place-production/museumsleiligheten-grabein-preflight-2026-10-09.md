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
- Medlemsbilde: `bilder/kort/brands/oslo_museum.svg`, SHA-256 `233b047cf217e90fa233372ebcc1518c432f8d9af7646bd65ab80f248d7b4dc0` fra original kilde.
- Kildeside: https://commons.wikimedia.org/wiki/File:Oslo_Museum_logo.svg.
- Stedskilde: https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/.
- Oslo Byfornyelse vurderes separat; det brukes ikke en institusjonslogo for å gi dette selskapet identitet.
- `place_card_profile.collection_ids` har nå `brands` og `historical_events`. Ny real-browser QA må vise to bildesterke og koherente samlingskort; manuell designreview gjenstår.
