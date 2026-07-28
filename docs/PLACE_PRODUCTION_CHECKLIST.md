# History GO — sted-for-sted produksjonsoppskrift

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-07-28**

Dette dokumentet er arbeidsoppskriften for å ferdigstille **ett History GO-sted om gangen**. Det skal brukes fra første researchgrep til merge av akkurat det stedet.

Relaterte bindende kontrakter:

- `docs/FACTUALITY_CONTRACT.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `docs/PLACE_STANDARD.md`
- `docs/PLACE_POPUP_SYSTEM.md`
- `data/places/README_place_rounds.md`
- `docs/people-of-places-method.md`
- `docs/PEOPLE_PROFILE_CANONICAL.md`
- `docs/STORIES_DATA_GOVERNANCE.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`
- `docs/COMPLETION_DEFINITIONS.md`
- `data/categories/category_contract.json`

Ved konflikt gjelder den strengeste faktisitetsregelen og den canonical kontrakten som eier det aktuelle subsystemet.

---

## 0. Absolutt arbeidsregel: ett sted ferdig før neste

Produksjonsenheten er **ett canonical place**.

Ikke start neste sted før det aktive stedet er:

1. identifisert og kildeverifisert;
2. koordinatkontrollert;
3. kategorisert;
4. fylt med relevant stedskunnskap;
5. kontrollert mot alle åtte popupfaner;
6. kuratert til nøyaktig fire eller seks rundinger;
7. kontrollert for På stedet / handlinger;
8. kontrollert for People, Works, Brands og andre relasjoner;
9. bilde- og kildekontrollert;
10. validert i runtime/CI;
11. merget.

Det er lov at en kontroll ender **N/A / ikke relevant**. Det er ikke lov å hoppe over kontrollen.

> **Manglende relevant innhold er bedre enn oppdiktet fyll. Glemt kontroll er ikke godkjent.**

---

# DEL A — ARBEIDSKORT FOR DET AKTIVE STEDET

Fyll dette før produksjonen starter:

```text
PLACE ID:
NAVN:
CANONICAL SOURCE-FIL:
MANIFEST:
PRIMÆRKATEGORI:
UNDERBADGES:
STEDSTYPE:
KOORDINATSTATUS:
MÅL FOR RUNDINGER: 4 / 6
VALGTE RUNDINGER:
LEKSIKON-ID/FIL:
PEOPLE-KANDIDATER:
WORKS-KANDIDATER:
BRANDS SOM ALLEREDE FINNES:
ROUTE/RELATION-KOBLINGER:
VIKTIGSTE KILDER:
AVVIST/UVISST INNHOLD:
```

Arbeidskortet skal kunne leses som en rask forklaring på **hva stedet er, hvor sannheten ligger, og hva som skal produseres**.

---

# DEL B — PRODUKSJONSREKKEFØLGE

## 1. Lås identiteten før du skriver noe

### Sjekkliste

- [ ] Søk repoet etter place-ID.
- [ ] Søk etter fullt navn.
- [ ] Søk etter navnevarianter, gamle navn og stavevarianter.
- [ ] Bekreft at det ikke finnes et annet canonical place-object for samme fysiske/historiske objekt.
- [ ] Finn den **manifest-loadede** source-filen som faktisk eier stedet.
- [ ] Bekreft at eventuell aggregate-/legacyfil ikke er den aktive edit-targeten.
- [ ] Beskriv i én setning hva place-recorden faktisk representerer.
- [ ] Avklar om punktet representerer bygg, inngang, område, historisk anker, natursted, lineært sted eller annet.

### Stoppgate

Ikke produser videre hvis det er uklart **hvilket fysisk/historisk objekt place-ID-en representerer**.

---

## 2. Les kildene før du fyller feltene

Alle brukerrettede faktapåstander følger `FACTUALITY_CONTRACT.md`.

### Sjekkliste

- [ ] Åpne og les kildene, ikke bare søkeresultatet/snippetten.
- [ ] Prioriter primærkilder, offentlige registre, arkiv og institusjonens egne registre.
- [ ] Bruk faglig anerkjente oppslagsverk/kataloger der primærkilde ikke dekker behovet.
- [ ] Noter hvilken kilde som støtter navn, år, datoer, roller, mål, hendelser, verk og stedskoblinger.
- [ ] Skill dokumentert fakta fra tolkning.
- [ ] Dokumenter kildekonflikter.
- [ ] Utelat opplysninger som ikke kan verifiseres.
- [ ] Ikke bruk eksisterende History GO-tekst som eneste faktakilde.
- [ ] Ikke bruk en språkmodell som faktakilde.
- [ ] Ikke fyll felt for å få bedre completeness, rundinglayout eller readiness.

### Minimum research-output

For hver vesentlig påstand skal du kunne svare:

```text
Påstand → konkret kilde → hvor i kilden støttes dette?
```

---

## 3. Koordinat og fysisk anker

Koordinater behandles etter `docs/coordinates/coordinate-source-contract-v1.md`.

### Sjekkliste

- [ ] Kontroller dagens `lat` / `lon` mot stedets faktiske identitet.
- [ ] Bruk address-first for aktive norske steder med relevant konkret adresse.
- [ ] Ikke bruk adressepunkt som automatisk løsning for park, gate, kai, større område eller historisk lokalitet.
- [ ] Velg korrekt `locatorType`.
- [ ] Velg korrekt `coordRole`.
- [ ] Registrer `sourceProvider` og stabil kildeidentitet.
- [ ] Kontroller `geocodeAccuracy`.
- [ ] Kontroller `coordStatus`.
- [ ] Historiske/revne/flyttede steder har historisk kilde; dagens adresse er ikke nok.
- [ ] Lineære/arealbaserte steder har geometry/anker eller eksplisitt line-/area-role.
- [ ] Kontroller at `r` er gameplay-radius, ikke et tilfeldig estimat av stedets areal.
- [ ] Sørg for coordinate-evidence-fil der kontrakten krever det.
- [ ] Kjør relevant coordinate gate/audit ved koordinatendring.

### Stoppgate

Et usikkert koordinat skal bli `needs_*`/historisk approximation etter kontrakten, ikke feilaktig `verified`.

---

## 4. Kategori, Badges og fagverk

Canonical kategorier eies av `data/categories/category_contract.json`.

### Sjekkliste

- [ ] `category` er én gyldig canonical runtimekategori.
- [ ] Primærkategorien beskriver stedets viktigste faglige identitet.
- [ ] Ikke dupliser stedet i andre kategorier for tverrfaglighet.
- [ ] Bruk `underbadge_ids` når underbadges er relevante.
- [ ] Alle `underbadge_ids` finnes i riktig badgefil.
- [ ] Kontroller `emne_ids` der stedet har fagkoblinger.
- [ ] Badges-rundingen er alltid med.
- [ ] Badges-rundingen leder til `fagverk-sted.html?place=<place_id>`.
- [ ] Åpne fagverksiden og kontroller at sted, kategori, emner/linser og navn er riktige.

### Canonical place-kategorier som alltid skal vurderes korrekt

- `by` — By & arkitektur
- `historie`
- `kunst`
- `litteratur`
- `media`
- `musikk`
- `naeringsliv` — Økonomi og næringsliv
- `natur` — Natur & miljø
- `politikk` — Politikk & samfunn
- `psykologi`
- `religion`
- `scenekunst`
- `sport` — Sport & lek
- `subkultur`
- `vitenskap`
- `teknologi`
- `filosofi`
- `film_tv` — Film & TV

Ikke bruk aliaser som nye canonical kategori-ID-er.

---

## 5. Fyll selve place-recorden

### 5.1 Identitets- og presentasjonsfelt

Kontroller minst:

- [ ] `id`
- [ ] `name`
- [ ] `lat`
- [ ] `lon`
- [ ] `r` når relevant
- [ ] `category`
- [ ] `underbadge_ids` når relevant
- [ ] `year` bare når ett år faktisk er meningsfullt og kildebelagt
- [ ] `desc`
- [ ] `popupDesc`
- [ ] `image` / `cardImage` / `frontImage` etter aktiv datamodell
- [ ] `emne_ids` når relevant
- [ ] `tags` når relevant
- [ ] brukerrettede kilder / source-summary etter aktivt schema

### 5.2 `desc`

`desc` skal raskt svare på:

1. Hva er dette stedet?
2. Hvorfor er det relevant i History GO?

Sjekk:

- [ ] konkret, ikke generisk turisttekst;
- [ ] ingen ny faktapåstand uten kilde;
- [ ] ingen overdrivelse av historisk betydning;
- [ ] riktig objekt — ikke beskrivelse av et større område hvis place er én markør.

### 5.3 `popupDesc`

- [ ] forklarer stedet faglig og historisk;
- [ ] har tydelig stedsspesifisitet;
- [ ] beskriver hva brukeren faktisk kan forstå eller legge merke til;
- [ ] dupliserer ikke Leksikon/Story ordrett;
- [ ] bygger bare på verifiserte fakta.

---

## 6. Typeprofil — fyll det som er naturlig for akkurat denne typen sted

Dette er **researchspørsmål**, ikke krav om å fylle alle felt.

| Stedstype | Sjekk spesielt |
| --- | --- |
| Park / grøntområde | areal, topografi, geologi, landskap, delsteder, historiske lag, natur |
| Gate / vei / allé | start/slutt, lengde, segmenter, kryss, adresser, infrastruktur, navnehistorie |
| Bygning | arkitekt, byggeår, stil, materialer, konstruksjon, høyde, etasjer, bruk, vern |
| Torg / plass / byrom | avgrensning, areal, fasader, monumenter, bruk, ombygginger |
| Elv / bekk / innsjø / kyst | lengde/vannflate, kilde/utløp, natur, regulering, industri, restaurering |
| Rute / sti | start/slutt, lengde, etapper, høydeprofil, underlag, sesong, sikkerhet |
| Institusjon / anlegg | grunnlagt, funksjon, bygninger, samlinger, saler, aktører, milepæler |
| Kulturminne / monument / kunstverk | opphavsperson, år, materiale, mål, motiv, plassering, vern |
| Arkeologisk / historisk lokalitet | datering, synlige strukturer, funn, undersøkelser, vern |
| Bydel / strøk / område | avgrensning, delområder, hovedakser, landskap, utviklingsfaser, møteplasser |
| Idrettsanlegg | åpning, kapasitet, banemål, konstruksjon, hjemmebrukere, viktige historiske hendelser |
| Industrielt / teknisk sted | funksjon, driftsperiode, maskiner, energi, størrelse, råvarer, transport, gjenbruk |

Strukturerte felt vurderes når kildene gir grunnlag:

- [ ] `spatial_profile`
- [ ] `temporal_profile`
- [ ] `subplaces`
- [ ] `history_layers`
- [ ] `nature_profile`
- [ ] `source_summary`

`nature_profile` beskriver landskap/natur i **Om**. Det betyr ikke automatisk at stedet skal ha Nature-runding.

---

# DEL C — STEDSPOPUP: ALLE ÅTTE FANER SKAL KONTROLLERES

Et ferdig sted skal ha en eksplisitt vurdering av hver fane. Fanen kan være N/A.

## 7. Om

- [ ] `popupDesc` er god nok som hovedartikkel.
- [ ] relevante nøkkelfakta finnes.
- [ ] Leksikon-artikkel/facts tilfører noe og dupliserer ikke unødvendig.
- [ ] fysisk form / `spatial_profile` er vurdert.
- [ ] `temporal_profile`-hoveddata er vurdert.
- [ ] `subplaces` er vurdert.
- [ ] `nature_profile` er vurdert når natur er reell del av stedet.
- [ ] «Se etter på stedet» brukes bare som observasjon av et kjennetegn, ikke skjult oppgave.

Status: `[ ] ferdig  [ ] N/A`

---

## 8. Historie

- [ ] finnes det dokumentert `chronology` i Leksikon?
- [ ] finnes `history_layers`?
- [ ] finnes viktige daterte bruksendringer eller historiske hendelser?
- [ ] sportsarrangementer/rekorder behandles her når de er historisk kunnskap, ikke som runding.
- [ ] chronology er ikke gjort om til Story bare for å fylle Fortellinger.

Status: `[ ] ferdig  [ ] N/A`

---

## 9. Fortellinger

- [ ] søk etter eksisterende canonical Stories med place-ID.
- [ ] vurder om stedet faktisk har en narrativ episode som fortjener Story.
- [ ] ny Story følger `STORIES_DATA_GOVERNANCE.md`.
- [ ] Story er ikke bred stedsbiografi eller forkledd chronology.
- [ ] personer/dato/handling/sted er dokumentert.
- [ ] storyfil er manifest-loadet og integrity-gate passerer.

Status: `[ ] ferdig  [ ] N/A`

---

## 10. Før/etter

- [ ] finnes `for_na` allerede?
- [ ] historisk bilde er korrekt identifisert og kildebelagt.
- [ ] dagens bilde viser samme sted/meningsfull sammenligning.
- [ ] `before`, `now` og `change` er konkrete.
- [ ] kilder følger materialet.
- [ ] ikke produser Før/etter bare fordi gamle bilder finnes av noe i nærheten.

Status: `[ ] ferdig  [ ] N/A`

---

## 11. Nyheter

- [ ] vurder historiske avisnotiser.
- [ ] vurder nyere dokumenterte notiser.
- [ ] små lokalsaker holdes proporsjonale.
- [ ] nyhetsnotis blir ikke Story uten narrativ grunn.
- [ ] samtidige påstander er tidsmessig oppdaterte og kildebelagte.

Status: `[ ] ferdig  [ ] N/A`

---

## 12. Lesespor

- [ ] søk etter relevante eksisterende Lesespor.
- [ ] `place_ids` inneholder eksplisitt stedet.
- [ ] lenken er direkte lesbar.
- [ ] betalingsmur/abonnement vises ikke i den stedsspesifikke åpne flaten.
- [ ] teksten tilfører faglig verdi utover popupens egen tekst.

Status: `[ ] ferdig  [ ] N/A`

---

## 13. Kilder

- [ ] `source_summary.safe_sources` eller tilsvarende brukerrettet kildegrunnlag er vurdert.
- [ ] place `externalLinks` er vurdert.
- [ ] Leksikonets `externalLinks` er vurdert.
- [ ] Før/etter-kilder er vurdert.
- [ ] offisielle sider/arkiv/databaser er prioritert.
- [ ] brukerrettede lenker er HTTPS.
- [ ] interne researchnotater, coordinate-audit og hold-back-data lekker ikke til brukeren.
- [ ] duplikatlenker er ryddet.

Status: `[ ] ferdig  [ ] N/A`

---

## 14. Mer

Kontroller om stedet har:

- [ ] Språkleksikon;
- [ ] observations;
- [ ] knowledge/funfacts;
- [ ] curated relations som forklarer stedet;
- [ ] kildebelagte «legg merke til»-momenter;
- [ ] brukerrettede klassifikasjoner/tags.

Handlinger skal ikke flyttes hit.

Status: `[ ] ferdig  [ ] N/A`

---

# DEL D — RUNDINGER: VISUELLE SAMLINGER

## 15. Hard rundingregel

Et ferdig sted viser **nøyaktig fire eller seks rundinger**.

Canonical palett:

1. `badges`
2. `people`
3. `works`
4. `objects`
5. `details`
6. `spots`
7. `nature`
8. `brands`

Harde regler:

- [ ] `badges` er alltid med.
- [ ] ferdig place har eksplisitt kuratert `rounds` med 4 eller 6 unike canonical IDs.
- [ ] aldri 3, 5, 7 eller 8 synlige rundinger.
- [ ] hver valgt runding har faktisk stedsspesifikt innhold.
- [ ] hver valgt runding har et reelt bilde/preview som kan brukes i rundingen.
- [ ] tekst-only placeholder teller ikke som bildeklart rundingsinnhold.
- [ ] ingen runding velges bare for layoutfyll.
- [ ] Nature er valgfri utenfor ekte naturinnhold.
- [ ] Civication er ikke egen runding.
- [ ] Wonderkammer er ikke egen runding.
- [ ] sportslige hendelser/rekorder/mesterskap er ikke egen Sports-runding.

Hvis bare fire samlinger er sterke nok, velg fire. Seks brukes når seks faktisk er gode.

---

## 16. Runding for runding

### Badges

- [ ] korrekt hovedbadge fra `category`;
- [ ] underbadges kontrollert;
- [ ] badgegrafikk finnes;
- [ ] åpner stedets fagverkside.

### People

- [ ] direkte dokumentert person–sted-kobling;
- [ ] søk etter eksisterende canonical person før ny record;
- [ ] riktig `placeId` / `places`-semantikk;
- [ ] personprofil følger People-kontrakten;
- [ ] reelt portrett/bilde med korrekt identitet;
- [ ] ingen tilfeldig kjent person bare for å fylle rundingen.

### Works

- [ ] identifiserbart verk med selvstendig identitet;
- [ ] dokumentert kobling til stedet;
- [ ] bilde/cover/verkfoto finnes;
- [ ] kunst, bok, sang, film, fotografisk verk, forestilling eller arkitekturverk kan passe;
- [ ] kamp, rekord, resultat eller generell historisk hendelse ligger ikke her.

### Objects

- [ ] fysisk, identifiserbar gjenstand;
- [ ] dokumentert stedstilknytning;
- [ ] eget bilde;
- [ ] kan være artefakt, funn, maskin, kjøretøy, våpen, instrument, drakt, pokal, produkt, dokumentobjekt, relikvie eller teknisk utstyr;
- [ ] Civication-element brukes bare som Object når det faktisk er fysisk/stedsspesifikt og visuelt kvalifisert;
- [ ] det finnes ingen regel om at alle Objects skal kunne kjøpes.

### Details

- [ ] liten fysisk detalj som faktisk kan sees/oppdages;
- [ ] eget nærbilde eller tydelig visuelt bilde;
- [ ] kan være skilt, symbol, inskripsjon, ornament, relieff, steinhuggermerke, materialskifte, skadespor eller annet konkret spor;
- [ ] ikke bare en faktatekst eller historisk hendelse.

### Spots

- [ ] konkret fysisk punkt/delsted inne i hovedstedet;
- [ ] eget bilde;
- [ ] kan være port, tårn, bro, tunnel, rom, scene, tribune, gårdsrom, bunker, batteri, utsiktspunkt, ruin eller fysisk delområde;
- [ ] opprett ikke nytt globalt canonical Place bare fordi det er et godt Spot.

### Nature

- [ ] faktisk stedsspesifikk naturentitet/naturfenomen;
- [ ] eget bilde;
- [ ] art/dyr/plante/tre/bergart/fossil/geologisk formasjon er dokumentert ved stedet;
- [ ] ikke legg inn tilfeldig tre, gress, park eller natur i nærheten for å fylle layouten;
- [ ] minneskilt/plaketter får ikke Nature bare fordi de står ute.

### Brands

**Brands beholder sin etablerte betydning.**

- [ ] bare bedrifter og kjente merker med dokumentert kobling til stedet;
- [ ] søk eksisterende Brands-data først;
- [ ] gjenbruk canonical Brand i stedet for å lage ny duplikat;
- [ ] logo/brandbilde finnes;
- [ ] ikke bruk Brands som restkategori for lag, institusjoner, skilt, personer eller andre ting;
- [ ] ikke omskriv eksisterende Brands-semantikk som del av stedproduksjonen.

---

## 17. Kategori → rundingprioritet

Dette er **produksjonsrekkefølge**, ikke tvang. Eksisterende sterkt, bildeklart innhold kan erstatte en svak/irrelevant valgfri runding. Brands brukes bare der en faktisk bedrift/kjent merke-kobling finnes.

| Kategori | 4-runders kjerne | Normal utvidelse til 6 |
| --- | --- | --- |
| By & arkitektur (`by`) | Badges · Works · Spots · Details | People · Objects |
| Historie | Badges · People · Objects · Spots | Details · Works |
| Kunst | Badges · Works · People · Details | Spots · Objects |
| Litteratur | Badges · People · Works · Objects | Spots · Details |
| Medier | Badges · People · Works · Objects | Spots · Details |
| Musikk | Badges · People · Works · Objects | Spots · Details |
| Økonomi og næringsliv | Badges · Brands · People · Objects | Spots · Details |
| Natur & miljø | Badges · Nature · Spots · Details | People · Objects |
| Politikk & samfunn | Badges · People · Spots · Details | Objects · Works |
| Psykologi | Badges · People · Works · Objects | Spots · Details |
| Religion | Badges · People · Works · Objects | Spots · Details |
| Scenekunst | Badges · People · Works · Spots | Objects · Details |
| Sport & lek | Badges · People · Objects · Spots | Details · Works |
| Subkultur | Badges · People · Works · Details | Spots · Objects |
| Vitenskap | Badges · People · Objects · Spots | Details · Works |
| Teknologi | Badges · Objects · People · Spots | Details · Works |
| Filosofi | Badges · People · Works · Spots | Objects · Details |
| Film & TV | Badges · People · Works · Spots | Objects · Details |

### Erstatningsregel

Hvis en foreslått runding ikke har reelt visuelt innhold:

1. ikke lag filler;
2. gå videre til neste relevante canonical runding;
3. vurder eksisterende Brands bare hvis en ekte canonical bedrift/kjent merke-kobling finnes;
4. vurder Nature bare hvis naturen faktisk er stedsspesifikk;
5. stedet er ikke rundingferdig før fire eller seks valgte samlinger er reelle og bildeklare.

---

# DEL E — PÅ STEDET OG SPILLBARHET

## 18. På stedet

Kontroller alle tre grupper:

### Events

- [ ] finnes canonical events som faktisk skjer ved stedet?
- [ ] historiske events er ikke blandet inn som dagens event.

### Møter

- [ ] Social Meet er relevant/trygt der flaten brukes.
- [ ] Kunnskapsmøte / Spotmeeting bruker eksisterende privacy-grenser.
- [ ] ingen live-posisjon/nearby people lekker gjennom steddata.

### Gjør på stedet

- [ ] `tasks_profile` vurdert;
- [ ] `training_profile` vurdert;
- [ ] `play_profile` vurdert;
- [ ] handlingen er faktisk mulig og trygg på akkurat stedet;
- [ ] gammel Wonderkammer-aktivitet migreres hit bare hvis den faktisk er handling.

Status: `[ ] ferdig  [ ] N/A`

---

## 19. Quiz, Observer, Notat og Rute

Disse er handlinger/flows, ikke rundinger.

### Quiz

- [ ] stedsspesifikk quiz finnes eller er eksplisitt vurdert N/A;
- [ ] spørsmål er source-led;
- [ ] fasit og forklaring er kildebelagt;
- [ ] place/person targets finnes;
- [ ] quiz tester faktisk stedet/emnet, ikke bare generiske etiketter.

### Observer

- [ ] relevant observerbart fenomen finnes;
- [ ] observasjonen er knyttet til noe brukeren faktisk kan se/registrere;
- [ ] den dupliserer ikke en Detail bare som tekst.

### Notat

- [ ] notatflow fungerer der den er del av PlaceCard-produktet.

### Rute

- [ ] eksisterende route-kobling er kontrollert;
- [ ] route-ID/stopp peker riktig;
- [ ] ikke opprett rute bare for completeness.

---

## 20. Progresjon og fysisk besøk

- [ ] Badges/fagverk viser riktig kategori.
- [ ] quiz og fysisk besøksstatus holdes adskilt etter gjeldende kontrakt.
- [ ] fysisk `visited` skrives bare gjennom fysisk besøksflow.
- [ ] eventuelle progresjonswrites bruker eksisterende eiersystem.
- [ ] ved kodeendring som påvirker profilprogresjon dispatches `updateProfile` der kontrakten krever det.
- [ ] ingen ny lokal progresjonsstate opprettes i place-data.

---

# DEL F — RELASJONER OG TILKNYTTEDE SYSTEMER

## 21. People

Selv hvis People ikke velges som runding, skal personkoblinger vurderes.

- [ ] gjennomgå grunnlegger/skaper/arkitekt;
- [ ] gjennomgå eiere/ledere/nøkkelpersoner;
- [ ] gjennomgå beboere/arbeidende/utøvere;
- [ ] gjennomgå eponym/minneperson;
- [ ] hver kobling har konkret kilde til akkurat dette stedet;
- [ ] svake «knyttet til»-koblinger avvises;
- [ ] duplikatsøk er gjort.

---

## 22. Works

- [ ] søk etter eksisterende canonical Works før nye oppføringer;
- [ ] koblingen dokumenterer at verket faktisk hører til stedet;
- [ ] verk og fysisk eksemplar skilles når nødvendig (`works` vs `objects`);
- [ ] bilde/cover er korrekt identifisert.

---

## 23. Brands

- [ ] søk eksisterende Brands-data for bedrifter/kjente merker;
- [ ] bruk eksisterende ID dersom brandet finnes;
- [ ] stedskoblingen er dokumentert;
- [ ] ingen brands opprettes for å fylle rundinglayout;
- [ ] ingen andre aktørtyper omklassifiseres til Brands.

---

## 24. Relations / NextUp / Nearby

- [ ] relevante `related_place_ids` / relations er kontrollert;
- [ ] koblingene er meningsfulle, ikke bare geografisk tilfeldige;
- [ ] NextUp kan foreslå et reelt neste steg der systemet støtter det;
- [ ] Nearby viser riktig navn/kategori/bilde og åpner korrekt PlaceCard;
- [ ] place-search finner stedet på forventede navn/aliaser;

### Søk, aliaser og i18n

- [ ] canonical navn er riktig;
- [ ] relevante aliaser/navnevarianter er vurdert;
- [ ] stedets i18n-/oversettelsesdata er kontrollert når datasettet støtter dette;
- [ ] ingen oversettelse eller alias endrer stedets fysiske identitet;
- [ ] relevant i18n-place-gate kjøres når slike data endres.

### Offentlig hjemsted

Vurderes eksplisitt, men er ikke krav for alle steder.

- [ ] stedet er et eksisterende canonical History GO-sted;
- [ ] det er ikke en privat adresse;
- [ ] lat/lon/radius er egnet for offentlig representasjon;
- [ ] privacy/synlighet følger eksisterende hjemstedsmodell;
- [ ] markér N/A når stedet ikke skal ha denne rollen.

---

## 25. Leksikon

- [ ] søk etter eksisterende Leksikon-record;
- [ ] hovedartikkel/facts er kildebelagt;
- [ ] chronology er ryddig og datert der kildene tillater det;
- [ ] `externalLinks` er relevante og dedupliserte;
- [ ] Leksikon dupliserer ikke `popupDesc` unødvendig;
- [ ] Leksikon brukes som kunnskapskilde til popup, ikke som runding.

Status: `[ ] ferdig  [ ] N/A`

---

## 26. Legacy Wonderkammer

Det skal **ikke** produseres nye Wonderkammer-entries.

Hvis stedet har legacy Wonderkammer:

- [ ] fysisk ting → Objects;
- [ ] liten fysisk detalj/spor → Details;
- [ ] fysisk delsted → Spots;
- [ ] person → People;
- [ ] verk → Works;
- [ ] natur → Nature;
- [ ] handling → På stedet;
- [ ] navigasjon → relations/NextUp;
- [ ] chronology/hendelse → Historie;
- [ ] Story-kandidat → Stories bare hvis storytesten består;
- [ ] slett ikke legacy-entry før den nye canonical representasjonen er validert.

---

# DEL G — BILDER

## 27. Stedets hovedbilder

Kontroller hvert bilde som faktisk brukes:

- [ ] viser riktig sted/objekt;
- [ ] feil bygning, feil avdeling eller nabosted er utelukket;
- [ ] bildet fungerer i aktuell crop/aspect ratio;
- [ ] fil/URL finnes og laster;
- [ ] bildeidentitet og attribusjon/kilde er etterprøvbar der datamodellen lagrer dette;
- [ ] historisk bilde er merket/brukes som historisk, ikke som dagens bilde;
- [ ] ingen uklar illustrasjon presenteres som dokumentarfoto.

---

## 28. Rundingsbilder

For hver valgt runding:

- [ ] rundingen har minst ett reelt, korrekt previewbilde;
- [ ] previewbildet representerer faktisk samlingen;
- [ ] samleobjekter har egne bilder når de skal vises som visuelle kort;
- [ ] personbilder viser riktig person;
- [ ] Brand-logo viser riktig bedrift/merke;
- [ ] Nature-bilde viser riktig art/fenomen;
- [ ] Object/Detail/Spot-bilde viser det konkrete elementet, ikke bare et generisk bilde av hele stedet;
- [ ] genererte bilder brukes ikke som dokumentarisk bevis eller portrett av virkelig person.

### Stoppgate

En valgt runding uten bildeklart innhold er **ikke produksjonsklar**, selv om JSON og CI er grønne.

---

# DEL H — FAKTISK SLUTT-QA PÅ STEDET

## 29. Data-QA

- [ ] JSON parser.
- [ ] place-ID er unik.
- [ ] source-filen er manifest-loadet.
- [ ] generated index er regenerert fra source når nødvendig — aldri håndredigert.
- [ ] category er gyldig.
- [ ] underbadge IDs er gyldige.
- [ ] emne IDs er gyldige.
- [ ] i18n/alias-data er gyldige når de endres.
- [ ] coordinate contract passerer.
- [ ] People references finnes.
- [ ] Works references finnes.
- [ ] Brands references finnes og beholder Brands-semantikk.
- [ ] Story references/manifest passerer.
- [ ] quiz targets finnes.
- [ ] route references finnes.
- [ ] ingen duplikat-ID-er er introdusert.

---

## 30. UI-QA

Åpne akkurat stedet og kontroller:

- [ ] kartmarkør peker på riktig fysisk sted;
- [ ] Nearby/Søk åpner riktig place;
- [ ] PlaceCard åpner uten feil;
- [ ] hovedbilde er riktig;
- [ ] navn, kategori og tekst er riktige;
- [ ] nøyaktig 4 eller 6 rundinger vises;
- [ ] rundingene ligger som 2×2 eller 3×2;
- [ ] alle valgte rundinger har bilde;
- [ ] Badges åpner fagverksiden;
- [ ] People åpner riktige personer;
- [ ] Works åpner riktig innhold;
- [ ] Objects/Details/Spots viser riktig stedsspesifikt innhold;
- [ ] Nature vises bare når den faktisk passer;
- [ ] Brands viser bare riktige bedrifter/kjente merker;
- [ ] Civication og Wonderkammer vises ikke som egne canonical rundinger;
- [ ] På stedet ligger under rundingene;
- [ ] popupen har Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer;
- [ ] tomme/irrelevante deler skjules eller har korrekt rolig tomtilstand;
- [ ] ingen gammel 3×3-/ni-runderslogikk lekker gjennom.

---

## 31. Innholds-QA

- [ ] alle nye brukerrettede påstander har inspectable støtte;
- [ ] datoer og år er kontrollert;
- [ ] personroller er kontrollert;
- [ ] person–sted-koblinger er kontrollert;
- [ ] verk–sted-koblinger er kontrollert;
- [ ] Brand–sted-koblinger er kontrollert;
- [ ] bilder er kontrollert for identitet;
- [ ] quizfasit er kontrollert;
- [ ] Stories er episodebaserte, ikke bred biografi;
- [ ] Nature er ikke filler;
- [ ] rundingsinnhold er ikke produsert bare for å nå 4/6;
- [ ] avviste/usikre detaljer er fortsatt utelatt.

---

## 32. CI / repository-gates

Kjør de relevante kontrollene for endringene. Minstekrav ved vanlig stedproduksjon:

- [ ] Data checks / places gate;
- [ ] TypeScript guard når relevante runtime/schemafiler er berørt;
- [ ] Place rounds governance;
- [ ] coordinate gate når koordinater endres;
- [ ] People gates når People endres;
- [ ] Stories gate når Stories endres;
- [ ] Nature-gate når naturdata endres;
- [ ] category/quiz governance når disse dataene endres;
- [ ] øvrige subsystemgates for faktisk berørte data.

Grønn CI erstatter ikke faktakontroll.

---

# DEL I — MERGEGATE OG FERDIGDEFINISJON

## 33. Ett-sted-PR

PR-en skal være lett å revidere.

- [ ] PR-en gjelder ett sted.
- [ ] avhengige People/Works/Story/Objects/Details/Spots-data kan være med når de er nødvendige for akkurat dette stedet.
- [ ] neste sted er ikke blandet inn.
- [ ] slutt-diffen inneholder bare forventede filer.
- [ ] branch er à jour med `main` før merge.
- [ ] reviewtråder er løst.
- [ ] CI er grønn på uendret head-SHA.
- [ ] merge bruker låst/forventet head-SHA.

---

## 34. Ferdig sted — endelig sjekkliste

Et sted kan markeres **sted-produksjon ferdig** først når alle disse er sant eller eksplisitt N/A:

### Identitet
- [ ] riktig canonical place-object;
- [ ] riktig manifest/source-fil;
- [ ] ingen duplikat place.

### Fakta
- [ ] source-first research utført;
- [ ] alle publiserte påstander er sporbare;
- [ ] usikkert innhold er utelatt.

### Geografi
- [ ] koordinat/anker er riktig;
- [ ] radius/geometry gir mening;
- [ ] coordinate evidence/gate er riktig.

### Fag
- [ ] category er riktig;
- [ ] underbadges er riktige;
- [ ] emnekoblinger er vurdert;
- [ ] fagverksiden fungerer.

### PlaceCard
- [ ] hovedbilde;
- [ ] `desc`;
- [ ] riktig 4/6-rundinglayout;
- [ ] alle valgte rundinger er bildeklare;
- [ ] Badges alltid med.

### Rundinger
- [ ] People vurdert;
- [ ] Works vurdert;
- [ ] Objects vurdert;
- [ ] Details vurdert;
- [ ] Spots vurdert;
- [ ] Nature vurdert;
- [ ] Brands vurdert som **bedrifter/kjente merker**, ikke generell aktørkategori.

### Popup
- [ ] Om vurdert;
- [ ] Historie vurdert;
- [ ] Fortellinger vurdert;
- [ ] Før/etter vurdert;
- [ ] Nyheter vurdert;
- [ ] Lesespor vurdert;
- [ ] Kilder vurdert;
- [ ] Mer vurdert.

### På stedet / spill
- [ ] Events vurdert;
- [ ] møter vurdert;
- [ ] tasks vurdert;
- [ ] training vurdert;
- [ ] play vurdert;
- [ ] quiz vurdert;
- [ ] Observer vurdert;
- [ ] Notat vurdert;
- [ ] Rute vurdert.

### Relasjoner
- [ ] People-koblinger;
- [ ] Works-koblinger;
- [ ] Brands-koblinger;
- [ ] Leksikon;
- [ ] relations/NextUp/Nearby;
- [ ] legacy Wonderkammer klassifisert dersom det finnes.

### Bilder
- [ ] stedets bilder er korrekte;
- [ ] rundingspreviewene er korrekte;
- [ ] identitet/attribusjon er kontrollert.

### QA
- [ ] data validerer;
- [ ] UI er manuelt kontrollert;
- [ ] relevant CI er grønn;
- [ ] slutt-diffen er ren;
- [ ] PR er merget.

---

# DEL J — KOPIERBAR STATUSMAL PER STED

Bruk denne i arbeidsnotat eller PR:

```markdown
## <place_id> — produksjonsstatus

### 1. Identitet og source
- [ ] canonical object bekreftet
- [ ] manifest/source-fil bekreftet
- [ ] duplikatsøk utført

### 2. Fakta og kilder
- [ ] kilder lest
- [ ] claim-støtte kontrollert
- [ ] usikkert innhold avvist/utelatt

### 3. Koordinat
- [ ] fysisk/historisk anker kontrollert
- [ ] Coordinate Source Contract oppfylt
- [ ] radius/geometry kontrollert

### 4. Fag
- [ ] category
- [ ] underbadges
- [ ] emne_ids
- [ ] fagverk-sted åpner riktig

### 5. Place-data
- [ ] desc
- [ ] popupDesc
- [ ] typeprofil
- [ ] strukturerte profiler
- [ ] hovedbilder

### 6. Popup
- [ ] Om
- [ ] Historie
- [ ] Fortellinger / N/A
- [ ] Før/etter / N/A
- [ ] Nyheter / N/A
- [ ] Lesespor / N/A
- [ ] Kilder
- [ ] Mer / N/A

### 7. Rundinger
Mål: [ ] 4  [ ] 6

Valgt:
- [ ] Badges
- [ ] People
- [ ] Works
- [ ] Objects
- [ ] Details
- [ ] Spots
- [ ] Nature
- [ ] Brands

For hver valgt: [ ] stedsspesifikk  [ ] bildeklart  [ ] riktig popup/flow

### 8. På stedet og spill
- [ ] Events / N/A
- [ ] Møter / N/A
- [ ] Tasks / N/A
- [ ] Training / N/A
- [ ] Play / N/A
- [ ] Quiz / N/A
- [ ] Observer / N/A
- [ ] Notat / N/A
- [ ] Rute / N/A

### 9. Relasjoner
- [ ] People
- [ ] Works
- [ ] Brands
- [ ] Leksikon
- [ ] Relations / NextUp
- [ ] Nearby/Søk
- [ ] Wonderkammer-legacy klassifisert / N/A

### 10. Slutt-QA
- [ ] JSON/data
- [ ] coordinate gate
- [ ] referanser
- [ ] bilder
- [ ] 4/6-layout
- [ ] popupfaner
- [ ] relevant CI
- [ ] ren slutt-diff
- [ ] merge
```

---

## Hovedprinsippet

> **Vi ferdigstiller ikke et sted ved å fylle flest mulig felt. Vi ferdigstiller det ved å ha kontrollert hele stedets History GO-flate, produsert alt som faktisk er relevant og dokumenterbart, eksplisitt merket resten N/A, og deretter lukket stedet før vi går til det neste.**
