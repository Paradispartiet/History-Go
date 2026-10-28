# Grini fangeleir — fullproduksjon, aktivt arbeidskort

Dato: 2026-10-28  
Canonical ID: `grini_fangeleir`  
Kilde: `data/places/historie/akershus/grini_fangeleir.json`  
Manifest: `data/places/manifest.json` (innført)  
Hovedbadge: `historie`  
Status: **PÅGÅR — ikke vFerdig; ingen fullføringsattestasjon**  
Aktivt checkpoint: **B — canonical historietekst, Historie-case og Leksikon-kronologi (review pågår)**  
Filomfang for arbeidsgrenen: Grini source, description-pakke, språk, Fagverk-registry, Historie-case, Leksikon-kronologi og arbeidskort; genererte outputs og QA fortsatt åpne.

## 0. READ-FIRST og tidligere arbeid

Gjennomlest på main før stedsspesifikk beslutning: `AGENTS.md`, `docs/PLACE_PRODUCTION_CHECKLIST.md` (v2.6), `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`, `docs/PLACE_PRODUCTION_PROFILES.md`, `data/places/README_place_rounds.md`, `data/badges/index.json`, `data/badges/historie.json`, `data/badges/place_production_routing_v1.json`, `docs/PLACE_OBJECTS_CANONICAL.md`, `data/brands/brand_rules_v1_1.json`. Andre relevante regler undersøkt: `docs/PLACE_PRODUCTION_V3.md`, `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`, `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`, `data/places/regler/place_description_production_v4_2.schema.json`, `docs/FACTUALITY_CONTRACT.md`, `docs/DATA_PRODUCTION_CONTRACT.md`, `docs/SPRAKLEKSIKON.md` og quizkontrakten.

**Regelpreflight SHA-256:** ikke registrert gjennom `scripts/place-production-rule-preflight.mjs` i dette connector-only research-checkpointet. Dette må kjøres/attesteres mot aktuell branch før canonical innholdsproduksjon og fullføring; ikke angi `PASS` nå.

- Existing Place, Story og Quiz gjenfunnet. Ikke opprett nye ID-er eller overskriv uten egen subsystemaudit.
- Grini-quiz finnes i `data/quiz/historie/grini_fangeleir_sets.json`, **1 sett med 3 spørsmål**. Dette er ikke full adaptive quiz etter dagens canonical quizkontrakt.
- `data/stories/stories_grini_fangeleir.json` har én eksisterende Story; behold som kandidat til egen review, ikke dupliser kronologifakta som nye Stories.
- Tidligere koordinatproduksjon: [PR #3574](https://github.com/Paradispartiet/History-Go/pull/3574), [#4110](https://github.com/Paradispartiet/History-Go/pull/4110), **[#4418](https://github.com/Paradispartiet/History-Go/pull/4418)** og `reports/akershus-coordinate-grini-fangeleir-production-2026-07-28.md`. Sist aksepterte koordinatstatus skal bevares med mindre en konkret regresjon kan bevises.
- Historiefaglig evidens er tidligere supplert via [PR #4536](https://github.com/Paradispartiet/History-Go/pull/4536) og [#4541](https://github.com/Paradispartiet/History-Go/pull/4541); finn og gjenbruk disse canonicale claims ved historiegate.
- `data/coordinate-evidence/akershus/historie/grini_fangeleir.json` har `production_applied`. Eldre `data/coordinate-evidence/akershus/baerum/grini_fangeleir.json` har annen eldre status: ikke la denne gjenåpne godkjent koordinat uten eksplisitt kilde-/eieravklaring.
- Beslutning for kart/koordinat: **ALLEREDE FERDIG — BEHOLD**. Beslutning for full brukerrettet stedsproduksjon: **REELT NYTT ARBEID**.
- Tidligere-arbeid-gate er undersøkt på fil-, commit- og PR-nivå, men erstatter ikke kjørbar preflight eller siste manuelle QA.

## 1. Identity/source scope og sikkerhet

Stedet representerer **den tyske fangeleiren som opererte ved Ila i Bærum 1941–1945**, etablert i det nesten ferdige kvinnefengselet og senere utvidet med brakker. Det er ikke identisk med dagens aktive Ila fengsel, den særskilte moderne museumsadressen, den flyttede museumsbrakken eller en oppdiktet full historisk perimeter.

- Canonical historieanker: 59.954295776884884, 10.582680030345253; `coordRole=historical_anchor`, `coordStatus=verified_historical_source`.
- Gameplay-radius 360 m **er ikke** den historiske leirgrensen eller en adgangstillatelse.
- Offentlig besøksanker: Grinimuseet, Jøssingveien 31; historisk hovedbygning ligger innenfor Ila fengsel og forvaringsanstalt, Jøssingveien 33.
- Ingen on-site-oppgaver eller ruter skal instruere spillere om å nærme seg, gå gjennom eller gå inn i det aktive fengselets sikkerhetsområde.

## 2. Kilder og foreløpig claim-inventar

| Kilde | Etterprøvbare funn og avgrensninger |
| --- | --- |
| [MiA / Grinimuseet – Om Grini](https://mia.no/grinimuseet/om-grini-fangeleir) | Opprettelse oppgitt til **14. juni 1941**; opprinnelig kvinnefengselsbygning, over 30 brakker, overfylling, arbeidskommandoer, Fallskjermen, deportasjoner, Ilebu og dagens Ila |
| [Store norske leksikon – Grini](https://snl.no/Grini_-_tysk_fangeleir) | Største tyske fangeleir i Norge, nærmere 20 000 registrerte fanger; tysk sikkerhetspoliti, kvinneavdeling, ungdomsavdeling, strafferegimer, 786 registrerte døde, motstand og frigjøring |
| [Nasjonalarkivet – nordmenn i fangenskap](https://www.nasjonalarkivet.no/nordmenn-i-fangenskap-under-andre-verdenskrig/) | Primærarkivets fangeprotokoller, fangenumre og kildemangler; to protokollrekker må ikke telles som to ulike fangepopulasjoner |
| [Fanger.no – Grini](https://www.fanger.no/prisoncamps/672) | Leirhistorie, videreoverføringer, antall fanger og fangenskapets ulikhet |
| [Lokalhistoriewiki – Grini fangeleir](https://lokalhistoriewiki.no/Grini_fangeleir) | Historisk leirplan, mottakssystem, navnehistorie og flere lokale spor; oppgir **12. juni 1941** som første overføring fra Åneby |
| [MiA – Grinimuseet, museumstjenesten](https://mia.no/museumstjenesten/grinimuseet) | Flyttet autentisk fangebrakke, utstillingsarbeid og fangenes bevarte tegninger/gjenstander |
| [Asker og Bærum historielag – hovedport 1945/2025](https://www.abhistorielag.no/grini-ytre-hovedport) | Reell historisk Før/etter-kandidat; kameravinkel, bildelisens og egen-place-grense må kontrolleres før publisering |

**Kildekonflikt / presisjonsport:** 12. juni (første fangeoverføring i lokalhistorisk oppslag og eksisterende Story) versus 14. juni (formell etableringsdato hos museet) må **ikke** smeltes sammen. Skriv «i juni 1941» i offentlig narrativ til dateringsfunksjonen er eksplisitt koblet til hver kilde; behold presisjonskonflikten i review.

**Dødsfall:** 786 registrerte døde Grini-fanger betyr **ikke** 786 døde på leirstedet. SNL forklarer at de fleste døde etter deportasjon. Skillet er hardt.

## 3. Foreløpig redaksjonelt utkast — IKKE integrert

Utkastene nedenfor er researchgrunnlag, **ikke** godkjente `desc`/`popupDesc`. Canonical source må ikke endres før `data/places/production/grini_fangeleir.json` har claims, setning→claim-paritet, hash, faktareview og redaksjonell review etter v4.2.

### Foreslått `desc`

Grini fangeleir lå ved Ila i Bærum og ble under den tyske okkupasjonen Norges største fangeleir. Fra 1941 til frigjøringen i 1945 ble nærmere 20 000 mennesker registrert her, de fleste norske politiske fanger. Det planlagte kvinnefengselet vokste til en omfattende brakkeleir, der fangene levde med tvangsarbeid, strenge kontrolltiltak og risiko for deportasjon.

### Foreslått `popupDesc`

Da tyske sikkerhetsmyndigheter tok Grini i bruk som fangeleir i juni 1941, sto det et nesten ferdig norsk kvinnefengsel på Ila i Bærum. Den opprinnelige murbygningen rommet de første fangene. Etter hvert som arrestasjonene økte, ble skogen omkring ryddet og det ble reist mer enn tretti brakker til innkvartering, verksteder og helsetjenester. Høsten 1942 var leiren allerede sterkt overfylt, og på det meste var rundt 5 400 mennesker internert samtidig.

Fangene kom fra ulike deler av landet. Mange var arrestert for politisk motstand, deltakelse i illegalt arbeid eller forbindelser med motstandsbevegelsen, men fangepopulasjonen omfattet også andre grupper. De nyankomne ble registrert i mottaket og fikk tildelt plass og utstyr. Livet videre i leiren var ulikt fordelt: arbeidskommandoene hadde svært forskjellige vilkår, og noen fanger var utsatt for streng isolasjon eller straffearbeid. Overfylte brakker, utilstrekkelig kost og uvisshet om hva som skulle skje videre preget hverdagen.

Kvinner ble holdt atskilt i hovedbygningens egen avdeling og hadde mindre bevegelsesfrihet enn mange av de mannlige fangene. En egen ungdomsavdeling kom i 1943. Den strengeste kontrollen rammet blant annet fanger som satt isolert på «Haft», og de dødsdømte og deportasjonsventende på avdelingen kalt «Fallskjermen». Fra Grini ble mennesker sendt videre til fengsler og konsentrasjonsleirer utenfor Norge. Blant de registrerte Grini-fangene kjenner historikerne til 786 dødsfall, de aller fleste etter overføring bort fra leiren.

Også innenfor leirens kontrollsystem forsøkte fangene å skape rom for fellesskap og motstand. Det ble organisert foredrag og studiesirkler, og illegale beskjeder ble smuglet mellom fangene og forbindelser utenfor. Slike aktiviteter opphevet ikke tvangen, men viser at leirlivet ikke kan beskrives bare gjennom vakttårn og fangenumre.

Ved frigjøringen i mai 1945 opphørte Grini som tysk fangeleir. Den tidligere fengselsbygningen ble deretter brukt til internering og soning for personer knyttet til rettsoppgjøret, under navnet Ilebu. Senere ble anlegget igjen ordinært fengsel. Hovedbygningen inngår i dag i Ila fengsel og forvaringsanstalt og er ikke offentlig besøksmål. Historien formidles ved Grinimuseet, som holder til i en bevart fangebrakke flyttet tilbake til området etter krigen. Den gjenreiste brakken og den bevarte fengselsbygningen har dermed **forskjellige** roller i dagens minnelandskap.

**Redaksjonell kontroll før integrasjon:** Hver setnings faktiske deler skal kobles mot kildeplassering; særlige sterke superlativpåstander skal ha to uavhengige kilder. Arbeidstermen «tvangsarbeid» og beskrivelsen av arrestasjonsgrunner må sjekkes mot konkrete claims. Ingen oppdiktede øyenvitneepisoder eller motiv.

## 4. Badge og foreløpig profil

- Primærkategori: `historie` (eksisterende og rimelig underbygd).
- `underbadge_ids`: mangler i canonical Place. Mulige dokumenterbare kandidater etter Badge-gate: `krigshistorie`, `sosialhistorie`, `etterkrigstid`, `kulturminner_og_bevaring`. **Ikke materialiser før avklart scope.**
- Badge-router (`historie`): `people`, `objects`, `brands`, `historical_events`; research i chronology, tidsperioder, materielle spor, aktører, sosial kontekst og historiebruk.
- **Produksjonsprofil: `major` (foreløpig, ikke confirmed)**. Begrunnelse: dokumentert bredde i historiske faser, fangereksperienser, makt, materiell historie og ettertid; ikke en tids- eller innholdskvote. Bekreft i egen preflight etter source- og Badge-audit.
- Fagverk-mål ved `major`: Place-eid `fagverk.level=full`, tre eller flere gyldige emner, 3–5 konkrete linser, 4–6 spørsmål, minst to observerbare spor og fire inspiserte kilder. Emner må løses mot fagmanifestet; eksisterende `emne_ids` er ikke alene tilstrekkelig.

## 5. Nullmåling av konkrete delsystemer

| System / fase | Dagens observasjon | Videre status |
| --- | --- | --- |
| 1 Identitet / manifest | Én canonical `grini_fangeleir` i manifestet | Research utført; eiergrense beholdes |
| 2 Kilder/claims | Gode institusjonelle og arkivkilder, men ingen egen v4.2 description-production-pakke funnet | **BLOCKED** til claim-paritet/reviews |
| 2A Kronologi/epoke | Eldre Story finnes, men ingen ferdig stedsspesifikk epokeaudit dokumentert i dette checkpointet | **BLOCKED** |
| 3 Koordinat og geometri | `verified_historical_source`, PR #4418, egen separat besøksanker | **ALLEREDE FERDIG**, ikke gjenåpnet |
| 4 Fag/Badges | Historie, fire `emne_ids`; underbadge_ids mangler; ingen Place-eid `fagverk` | **BLOCKED** |
| 5 Historisk tekst | `desc` kort; `popupDesc` 4 generelle setninger; utkast over | **BLOCKED** til v4.2-pakke og integrasjon |
| 6 Strukturprofiler | Ingen `temporal_profile`/`history_layers`/PlaceCard-profil observert i Place | Vurder etter kildegrunnlag |
| 7 Popupfaner | Ikke full auditert; Kilder har seks existing `externalLinks` | **BLOCKED** inntil fanekontroll |
| 8 PlaceCard | Ingen `place_card_profile`, `frontImage` eller medlemsbilder; blank `image` og legacy `cardImage` | **BLOCKED** |
| 9 Utforsk / På stedet | Historisk anker er i aktiv høysikkerhetsanstalt | Besøks-/rutekontrakt må håndheve offentlig museumsanker |
| 10 Quiz | 1 x 3 eksisterende spørsmål; ikke dagens fullquiz; dedikert QuizCard/flip ikke bekreftet | **BLOCKED**, separat quizpipeline |
| 11 Observer / Notat / Rute | Ikke runtime-kontrollert | Audit kreves |
| 12 People | Eksisterende runtime relaterer blant andre Trygve Bratteli og Arnulf Øverland; alle relasjoner og portretter må egenkontrolleres | Kandidataudit, ikke PASS |
| 13 Brands | Ikke kandidatauditert; museet/forvaltningsinstitusjon må vurderes etter Brand-reglene, uten å likestille med historisk leir | Kandidataudit |
| 14 Leksikon/relasjoner/språk | Språkleksikon krever stedsspesifikt begrep; «Polizeihäftlingslager Grini», «Haft» og «Fallskjermen» er kildebårne kandidater | **BLOCKED** til materialisering |
| 15–17 Besøk/favoritt/profil | Ikke testet; r må aldri tolkes som adgang | Runtime-QA |
| 18 Wonderkammer | Ingen nye legacy-objekter skal opprettes | Audit |
| 19 Bilder | `image: ""`, ingen `frontImage`, `cardImage: ""` er legacy; historisk bildekandidat finnes i SNL/arkiv | **BLOCKED**, rettigheter/proveniens/portrait |
| 20–23 Data/UI/content/CI | Ingen testkjøringer i dette research-checkpointet | **BLOCKED**, ikke PASS |
| 24 Ett-sted-PR og merge | Kun preflight-arbeidskortet er under arbeid | Ikke closeout |

## 6. Plan for PlaceCard-innhold — kandidater, ikke filler

- **People:** direkte dokumentert fange-, personal- og motstandsrelasjon; kontrollér eksisterende Grini-koblinger, rolle, foto og kildene før valg.
- **Objects:** dokumenterte fangedrakter, gjenstander, armbind, brev, tegninger eller identifiserbare bevarte eksemplarer. MiAs utstillinger og historiske gjenstandsbeskrivelser er kilder til kandidatundersøkelse; ikke generiske rekonstruksjoner.
- **Brands:** reelt selvstendig institusjons-/organisasjonsnavn med dokumentert historisk stedstilknytning og autentisk identitetsmarkør, ikke «Grini» konstruert som Brand.
- **Historical Events:** avgrensede og bildeklare hendelser med egen kildebevist identitet. Juni 1941, leirutvidelsen og frigjøringen er *researchkandidater*; tidslinjeoppføring alene er ikke samlingsmedlem.
- Samlingsstatus blir `PASS`, `BEGRUNNET N/A` eller `BLOCKED` etter komplett kandidat-/bildeaudit. **Bare faktisk ferdige samlinger kan vises.**
- Før/etter: kontroller historielagets portpar 1945/2025, samme motiv og lovlig bildegjenbruk.
- Lesespor: Nasjonalarkivet, åpne vitnesbyrd, museets publikasjoner; en betalingsmur er ikke i seg selv N/A.
- Stories: behold én tidligere Story inntil kildekritisk re-review av dato, narrative motor og duplisering.
- Språk: krev minst ett stedspesifikt canonical begreps-/navnespor. Dette enkeltstedet eier **ikke** dialektlaget.
- Egen Fagverk-side skal produseres **samtidig** med canonical stedsinnhold, ikke skyves til senere batch.

## 7. Neste eide checkpointers (ett aktivt av gangen)

1. Registrer kjørbart READ-FIRST `rule_preflight` på gjeldende branch; reconcilier tidligere workcard og kilde-/claim-eierne.
2. Konstruer v4.2 description-production-pakke claim-first og gjennomfør separat faktareview og redaksjonell review. Publiser først deretter `desc`/`popupDesc` sammen med hasher, oversettelse/sync og tester.
3. Bygg samtidig `fagverk`, canonical Språkleksikon, verifisert chronology/epoke og Historie-produksjonsrapport etter eierkontrakter.
4. Kandidatauditér People, Objects, Brands, Historical Events; materialiser kun reelle medlemmer, bilder og adaptive 1–4 samlinger.
5. Gjennomfør separat fullquizproduksjon etter quizkontrakten (3–10 × 7 etter evidens) og integrer et ekte dedikert QuizCard med testet flip.
6. Gjennomfør alle 24 faser / relevante popupfaner, indeksbygging, source-hash-synk, faktiske app-/desktop-/mobiltester og den seksdelte kvalitetsvurderingen før `vFerdig`.

**Ingenting her er en `PASS`-attestasjon av fullproduksjon. Ikke merk stedet `complete`, ikke publiser utkastene som ferdige og ikke endre sikkerhetsankeret ut fra dette dokumentet.**


## Checkpoint B – oppdatering 2026-10-28

Følgende finnes nå på denne **ikke-mergede** PR-grenen, og må skilles fra fullført spilleropplevelse:

- Canonical `desc` og `popupDesc` er utvidet med 31 source-backed påstander, teksthash, setning-paritet og separate reviewdeklarasjoner i `data/places/production/grini_fangeleir.json`. Global place-description-CI har feilet også på andre pakker; stedsspesifikk endelig validering må dokumenteres før ferdigmelding.
- Fire source-backed underbadges er materialisert: `krigshistorie`, `sosialhistorie`, `etterkrigstid`, `kulturminner_og_bevaring`. Ingen dialekteierskap.
- Fullnivå `fagverk` har stedsegen intro, fem avsnitt, fire linser, fem spørsmål, to observerbare spor og fem kilder, men er fortsatt korrekt `in_production` til lenke-, release- og browser-QA er godkjent.
- Språkleksikonet er lagt i `data/leksikon/sprak/places/europe/norway/akershus/baerum/grini_fangeleir.json` og manifestført. Ordene er historiske leirbetegnelser, ikke dialekt.
- Historie-fagrapporten `data/places/historie-production/grini_fangeleir.json` er materialisert med fem kilder, A–F kildebasert caseanalyse og eksplisitt status `blocked`. Quiz (G) og chronology/Story-sluttport (H) er *ikke* godkjent, selv om JSON-skjemaet gir midlertidige `N/A`-felter.
- `data/leksikon/places/akershus/historie/leksikon_grini_fangeleir.json` er lagt til i `data/leksikon/manifest.json` og inneholder seks source-backed milepæler: 1941, 1942, 1943, 1944, 1945 og 1996. **Epokeindex er ikke manuelt endret**; bygger, source-sync og viewer-QA gjenstår.
- `frontImage`, medlemsbilder, adaptive samlinger, fullquiz, dedikert QuizCard, Før/etter og full browser-QA er fortsatt blokkere. Koordinat og besøksanker ble ikke endret.

### Bildekandidater – research, ingen publisert fil

- DigitaltMuseum/Oslo Museum [OB.AK1001i](https://digitaltmuseum.no/021018793741/grini-fangeleir-ved-loslatelsen-av-fangene): historisk bilde av løslatelsen fotografert 10. mai 1945 av Rigmor Dahl Delphin. DigitaltMuseum oppgir **CC0 1.0**. Bør vurderes som historisk galleri-/Før/etter-materiale; originalmotiv, kildefil, crop og rettighetsmetadata må verifiseres i bildeproduksjon før eventuell publisering.
- Store norske leksikon [Grini fangeleir](https://snl.no/Grini_-_tysk_fangeleir) viser et offentlig-domenemerket bilde av fangene ved leiren fra 1941–1943. Original fil, lisensspor og konkret utsnitt må kontrolleres; kilden alene er ikke en publisert frontImage.
- Autentiske fotografier fra frigjøringen viser ulike utsnitt, men ingen av disse er automatisk et gyldig primært Før/etter-par; kamerastandpunkt, dato og korrekt moderne motiv må matches.

### CI og holdback

Tidligere PR-head hadde røde, til dels katalogvide tester: place-description-pakke for annet sted med `grand42`-feil, Fagverk eksterne lenker for flere andre Places, quiz production contexts i andre fag, en ekstern People-bildefeil og et eldre ikke-synkronisert place-open for Akershus festning. Direkte Grini-gate **manglende Historie-rapport** er nå adressert med en ærlig `blocked`-rapport, men Historie-gaten vil fortsette å nekte ferdigstatus til G/H er lukket. Ikke endre andre steder for å få grønn PR uten eksplisitt nødvendig risikovurdering.

**Neste:** kjør målrettet Historie-/Leksikon-/epoke-/description-audit på exact head, bygg source-derived materialisering, produser fullquiz etter separat kontrakt, kurater foto og PlaceCard, test runtime og rens den midlertidige `.github/workflows/grini-one-shot-materialize.yml` fra sluttdiffen.

## Checkpoint C – quizrevisjon 2026-10-28

**Gjeldende status:** **ikke vFerdig**. Tidligere research- og preflight-avsnitt ovenfor dokumenterer historisk arbeidsrekkefølge; den aktuelle maskinlesbare statusen ligger i `grini-fangeleir-workcard-current.json`. Fullquiz er fortsatt et **redaksjonelt, ikke aktivt** utkast.

- Kildebriefen `data/quiz/production_briefs/historie/grini_fangeleir.json` har 70 påstander. Quizutkastet `reports/place-production/grini-fangeleir-quiz-full-draft-2026-10-28.json` har 10 × 7 spørsmål. En egen, begrenset strukturell kontroll fant samsvar i påstandstekst, kilde-URL-er og fasit på alle 70; korrektposisjoner er fortsatt 24 / 24 / 22. **Dette er ikke canonical testkjøring.**
- Historisk datoavvik (#69) er presisert: [NOU 1998:12, kap. 7.2](https://www.regjeringen.no/no/dokumenter/nou-1998-12/id375416/?ch=26) omtaler åpning 12. juni 1941, mens SNL og Grinimuseet omtaler opprettelse 14. juni. Kildene gir ikke her grunnlag for automatisk å definere første som bare fangeoverføring og andre som bare formell stiftelse; spørsmål og claim er endret deretter.
- **Ny konkret redaksjonell blokkering:** semantiske repetisjoner mellom #19/#64, #5/#65, #41/#66, #49/#67 og #61/#70. Videre krever innholdsbalansen (49 fakta, 6 kontekst, 13 analyse, 2 sammenligning), #59 (1950–1951-grense) og distraktorene egen gjennomgang.
- **Teknisk blokkering:** Grini er fortsatt ikke registrert under `historie.quizProduction.targets`, `production_context` er ikke bygget, og aktiv `data/quiz/historie/grini_fangeleir_sets.json` har 1 × 3 legacy-spørsmål med eksisterende Knowledge-enheter. Utkastet gjenbruker de tre aktive spørsmåls-ID-ene for andre betydninger. Krever eksplisitt migrasjonsplan og faktisk Knowledge-synk.
- Ingen npm-quiztester, eksakt-head CI, app/browser-QA eller påstått Knowledge-PASS er utført i denne revisjonen. PR #6759 skal fortsatt være utkast, uten merge.

**Detaljert bevis og videre handling:** `reports/place-production/grini-fangeleir-quiz-editorial-audit-2026-10-28.md`. Før målregistrering og aktivering skal redaksjonelle overlapp ryddes, kildegrunnlag og spørsmål kvalitetssikres, canonical kontekst genereres fra alle påkrevde inputs, eksisterende Knowledge migreres og hele quiztestrekken kjøres.

## Checkpoint D – quizstaging og kilde-/faseintegrasjon (2026-10-28)

**Status:** PR #6759 er fortsatt **draft**, Grini er fortsatt **ikke vFerdig**, og aktiv quiz er fortsatt **1 × 3**. Ingen graderte tester er erklært PASS.

- Kildebrief og redaksjonell 10 × 7-quiz er revidert: de fem opprinnelige semantiske repetisjonene er erstattet, 15 spørsmål omskrevet, og spørsmål 21/59/69 gitt nødvendig presisjon. 12 kildekritiske/metodiske spørsmål og én tolkningsbasert teoribinding gir strukturell familieprognose **41 fakta / 17 kontekst / 12 metode-teori**.
- Under teknisk preflight ble **7 feilmerkede settfaser** og **49 feilmerkede claim-faser** oppdaget. De er nå justert til fagets bindende 10-settsplan: `opening, middle, middle, middle, middle, middle, middle, bridge, bridge, final`.
- **26 påstandsfamilier** er normalisert: kategoriens produksjonsbibliotek krever `fact`, `context` eller `concept_theory`, ikke `analysis` som påstandsfamilie. Nå samsvarer alle 70 med spørsmålets kanoniske familielogikk.
- De tre første nye spørsmåls-ID-ene er endret slik at de ikke kolliderer med de eksisterende 1×3-spørsmålene. Dette **migrerer ikke** de gamle Knowledge-enhetene; eierskap og registrergenerering er fortsatt en blokkering.
- Ny `scripts/prepare-grini-quiz-staging.mjs` bygger en **ikke-publiserende preview** med canonical sete-/kilde-ID-struktur. Ny `tests/grini-quiz-staging.test.mjs` validerer blant annet faser, kilde-URL→ID, source-brief-paritet og bevaring av gamle ID-er. Kommandoer: `npm run test:grini-quiz-staging` (isolert) og `npm run test:quiz-production` (inkluderer nye tester i eksisterende CI-pipeline).
- Fagmanifestregistrering, faktisk produksjonskontekst, Knowledge-generator, runtime-manifest og 70-spørsmåls publikasjon **er ikke gjennomført**. Disse må gjøres kontrollert og med faktiske testresultater; ingen risikable eller oppdiktede git-hasher for produksjonskontekst.

**Revisjon og åpne porter:** `reports/place-production/grini-fangeleir-quiz-editorial-audit-2026-10-28.md`, særlig *Checkpoint D*. Dette checkpointet erstatter tidligere beskrivelser av uendrede repetisjoner, feil faser og ID-kollisjoner som gjeldende status.
