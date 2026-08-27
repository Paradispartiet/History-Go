# History GO — Produksjonsprofiler og innholdsplan for Places

Status: **canonical scope-kontrakt for stedsproduksjon**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-27**

Denne kontrakten bestemmer **hvor omfattende et sted skal produseres**. Hva slags innhold stedet skal få bestemmes primært av Badge-systemet og stedets kilder, ikke av en universell sjekkliste.

Canonical Badge-router:

- `data/badges/index.json` — alle 19 hovedbadges;
- `data/badges/<badge>.json` — canonical underbadges og eventuelle grupper/`quizFocus`;
- `data/badges/place_production_routing_v1.json` — produksjonsruting per hovedbadge.

Et `focused` Place skal være like korrekt, kildebundet, pent og ferdig som et `major` Place. Forskjellen er reell stoffbredde, ikke kvalitetsnivå eller hvor mye arbeid produsenten ønsker å gjøre.

## 1. Fire separate beslutninger

Disse skal aldri blandes:

1. **Hovedbadge / category** — stedets primære faglige identitet.
2. **Underbadges** — hvilke sider ved hovedbadgen dette konkrete stedet faktisk representerer.
3. **Produksjonsprofil** — hvor bredt det kildebårne stedet er: `major`, `standard`, `focused` eller `micro`.
4. **Innholdsplan** — hvilke konkrete moduler og PlaceCard-samlinger som produseres helt for akkurat dette stedet.

Canonical rekkefølge:

```text
Universal canonical core
→ hovedbadge
→ aktive underbadge_ids
→ stedsspesifikk source review
→ confirmed produksjonsprofil
→ endelig innholdsplan
→ produksjon
```

Badge/underbadge bestemmer hvilke medlemmer og faglige spor som må undersøkes; kildene bestemmer hva som faktisk kvalifiserer. Dette endrer ikke PlaceCard-geometrien: et fullprodusert ordinært Place har alltid fire ferdige samlinger etter `data/places/README_place_rounds.md`.

## 2. Universal canonical core

For alle ordinære Places (`major`, `standard`, `focused`) er følgende obligatorisk uansett Badge og profil:

1. løst identitet, scope og own-place-grense;
2. verifisert koordinat/geometri med ærlig `coordRole`;
3. inspiserte, sporbare kilder og source → claim-disiplin;
4. canonical `desc` og `popupDesc` i korrekt kvalitet;
5. riktig hovedbadge/category, riktige underbadges, relevante emner og fungerende stedsspesifikk Fagverk-side;
6. publiserte bilder med proveniens og et faktisk stående `frontImage` der ordinær PlaceCard bruker det;
7. chronology/epoke-research med korrekt dateringspresisjon og materialisering av kvalifiserte eksakte år;
8. canonical Språkleksikon med minst ett reelt stedsspesifikt navn-/begrepsspor;
9. own-place-/relasjonsaudit;
10. runtime/materialisering, relevante CI-gater og manuell slutt-QA.

En mindre profil reduserer **stoffbredde**, aldri factuality, source-kvalitet eller sluttføring.

## 3. Badge-drevet innholdsplan

Preflight skal alltid:

1. slå opp stedets hovedbadge i `data/badges/index.json`;
2. lese hele `data/badges/<badge>.json`;
3. kontrollere alle `underbadge_ids` mot Badge-familien;
4. lese `data/badges/place_production_routing_v1.json`;
5. bruke hovedbadge + aktive underbadges til å lage kandidatlisten for research;
6. teste kandidatene mot faktiske kilder og subsystemkontrakter;
7. lage endelig `INNHOLDSPLAN` med `PRODUSER` eller `BEGRUNNET N/A` per modul.

Når Badge-filen har `groups`, `children` eller `quizFocus`, skal disse brukes som canonical semantiske hint i research-/quizplanleggingen. De er ikke faktakilder og kan aldri erstatte stedsspesifikk evidens.

### Eksempler på hvorfor underbadge betyr noe

- `naeringsliv + industri` prioriterer produksjonsprosess, anlegg, maskiner/gjenstander, arbeidere/eiere, teknologi og eventuelt dokumentert merkeidentitet;
- `naeringsliv + bank_og_finans` prioriterer institusjon, finansielle aktører, eierskap, dokumenter/objekter og arkitektur — ikke industrimaskiner;
- `historie + industrihistorie` styrker produksjons-/arbeids-/teknologisporet selv om hovedbadgen er Historie;
- `historie + kulturminner_og_bevaring` prioriterer materielle spor, vern, ombruk og minne;
- `by + byplanlegging` prioriterer plan, byrom, infrastruktur og endring;
- `by + monumenter_og_landemerker` prioriterer struktur, symbolfunksjon, design/arkitekt og offentlig resepsjon;
- `musikk + konsertsteder` prioriterer scenehistorie, artister, konserter, venue-identitet og lyd/utstyr;
- `film_tv + filmlocations` prioriterer konkrete produksjoner, locations og skapere fremfor å late som stedet er et produksjonsselskap;
- `sport + stadion` prioriterer anlegg, konkurranser, utøvere/klubber og publikumskultur;
- `sport + supporterkultur` flytter tyngde mot mennesker, uttrykk, objekter og scene-/identitetskultur;
- `natur + vann_og_vassdrag` bruker Badge-filens vann-/økologi-hints og dokumenterte arter/landform;
- `natur + fugler` prioriterer Fauna-research, men alle fire faste naturflater krever stedsspesifikk dokumentasjon; manglende artsbelegg blokkerer fullproduksjonen og erstattes aldri av generiske arter;
- `religion + trossteder_og_hellige_rom` prioriterer ritualer/tradisjoner, People, Objects og Brands; Structures velges bare når et reelt bygnings-/anleggsmiljø er et selvstendig hovedspor;
- `kunst + offentlig_kunst` prioriterer Productions, kunstnere, materialer og commissioning/offentlig resepsjon;
- `litteratur + forfattere_og_litteratursteder` prioriterer People, tekster/verk, Objects og relaterte steder;
- `politikk + arbeiderbevegelse` prioriterer personer/organisasjoner, møter/hendelser, dokumenter og relaterte steder;
- `utdanning + utdanningshistorie` prioriterer institusjonshistorie, lærere/elever, skolebygg og læremidler;
- `helse + helsetjenester_helseokonomi` prioriterer institusjon, system, profesjoner og historiske tjenester fremfor individuell klinikk.

Dette er kandidatstyring for medlemmene, aldri tillatelse til å redusere det faste samlingsantallet. Objects-kandidater følger i tillegg `docs/PLACE_OBJECTS_CANONICAL.md`: stedets hovedfunksjon styrer utvalget, og på industristeder prioriteres produksjonsverktøy, former, maskiner, emballasje og fysiske produkter før sekundære kulturspor.

### Fast PlaceCard-modell

Alle ordinære fullprofiler bruker:

```text
People · Objects · Brands · kategoriuttrykk
```

Nature og canonicale spesialprofiler følger sine faste firersett. Kategoriuttrykket og brukerrettet navn følger 19-kategorimatrisen i `data/places/README_place_rounds.md`. `related` er aldri en PlaceCard-samling. Structures er bare standard for By og ellers en uttrykkelig begrunnet stedsspesifikk variant.

## 4. Obligatoriske samlingsmedlemmer og betingede moduler

For en ordinær fullprofil er følgende obligatoriske produksjonsspor:

- People-medlemmer;
- Objects-medlemmer;
- Brands-medlemmer;
- kategoriuttrykkets medlemmer (`productions`, `structures`, `competitions` eller `destinations` etter samlingskontrakten);

Badge-router, underbadges og kilder bestemmer hvilke medlemmer som kvalifiserer, ikke om en av de fire flatene kan utelates.

Følgende øvrige moduler er betingede og produseres når de er reelt relevante og source-backed:

- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- ruter/narrative koblinger;
- ekstra Fagverk-spor;
- ekstra medier.

`BEGRUNNET N/A` kan brukes for de øvrige betingede modulene etter ordentlig kandidataudit. Det kan ikke brukes for People, Objects, Brands eller kategoriuttrykket i en ordinær fullprofil. Manglende kvalifiserte medlemmer der er `BLOCKED`, ikke N/A.

**Ingen tomme PlaceCard-samlinger ved fullført ny/full produksjon. Ingen filler.** Hvis en av de fire samlingene ikke har et ekte canonical medlem med riktig bilde, kan stedet ikke ferdigmeldes.

## 5. Produksjonsprofiler

### `major`

Sted med stor betydning og bredt kildebåret stoff som bærer flere selvstendige lærings-, material- eller narrative spor.

Forventning: dypest research og fire sterke PlaceCard-samlinger etter den faste kategoriprofilen.

### `standard`

Default for et betydelig canonical Place med komplett stedsopplevelse, flere reelle innholdsvinkler og nok materiale til solid Fagverk/quiz uten Major-bredde.

Forventning: full universal core og fire sterke PlaceCard-samlinger valgt etter den faste kategoriprofilen og produsert gjennom Badge-drevet innholdsplan.

### `focused`

Canonical Place med historisk/kulturell verdi konsentrert i én hovedfunksjon, hendelse, struktur, spor eller snevert tema.

Forventning: full universal core og fire ferdige PlaceCard-samlinger, men mindre dybde og færre medlemmer per samling enn et bredere sted. `focused` reduserer aldri antallet samlingsflater.

`focused` kan aldri velges bare fordi oppgaven ønskes billigere eller raskere.

### `micro`

Brukes bare når stedet kvalifiserer etter `docs/MICRO_PLACE_CONTRACT.md`.

## 6. Profilavgjørelse

Preflight vurderer fem dimensjoner **etter Badge-/underbadge-researchen**:

1. historisk dybde;
2. entity-dybde;
3. kildedybde;
4. tolkningsdybde;
5. stedets betydning.

- `major` krever at flere dimensjoner er tydelig høye;
- `focused` brukes når canonical verdi består, men bredden er reelt smal;
- `standard` er hovedprofilen i midten;
- `micro` følger egen kontrakt.

Ingen mekanisk poengsum er endelig autoritet.

## 7. Katalogtriage før videre produksjon

Vi bruker en hybridmodell.

### Stage A — lett provisional triage

Eksisterende katalog får planleggingsmetadata basert på det som allerede finnes:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <kort grunn>
badge_basis: <category + eksisterende underbadge_ids>
```

Triage skal lese eksisterende hovedbadge/underbadges, men er **ikke full research** og produserer ikke nytt innhold.

### Stage B — confirmed preflight

Når stedet går inn i produksjon, leses Badge-filen og kildene ordentlig, og profilen bekreftes eller overstyres:

```text
production_profile:
profile_status: confirmed
profile_reason:
profile_changed_from: <valgfritt>
```

Nye steder klassifiseres direkte som `confirmed`.

## 8. Quizprofil er separat

`production_profile` og quizprofil er ikke det samme.

Canonical Quiz-kontrakt velger adaptivt:

- `narrow`: 3 × 7;
- `normal`: 4 × 7;
- `rich`: 5–8 × 7;
- `major`: 8–10 × 7.

Badge, underbadges og eventuell `quizFocus` brukes til å planlegge hvilke kunnskapsområder som undersøkes; påstandsbank og faktisk læringsbredde bestemmer quizprofil og eksakt lengde.

## 9. PlaceCard: fire ferdige samlinger, aldri tomme kort

For nye/fullproduserte ordinære Places er `place_card_profile.collection_ids` en eksplisitt kuratert liste med **nøyaktig fire ferdige, relevante samlinger**.

- nøyaktig fire samlinger er gyldig for ordinære fullprofiler;
- vanlig profil bruker People, Objects, Brands og kategoriuttrykket;
- Nature og canonicale spesialprofiler følger sine faste firersett;
- `related` er aldri samling eller reserve;
- hver valgt samling har minst ett ekte canonical medlem og validert, lastbart previewbilde;
- manglende kvalifisert innhold blokkerer fullproduksjonen;
- runtime viser fire samlinger i en balansert 2×2-komposisjon;
- People/Flora/Fauna er sirkler; øvrige er avrundede rektangler;
- `frontImage` forblir stående hovedflate;
- gamle Places uten ny eksplisitt profil beholder kompatibilitetsvisningen til revisjon.

Designregel: **Alle fire flater skal oppleves som nødvendige, tydelig forskjellige og stedsegne.** Ingen flate fylles med en perifer entity bare for å bestå geometrien.

## 10. Arbeidskort

Hvert ordinære aktive sted skal minst føre:

```text
HOVEDBADGE/CATEGORY:
UNDERBADGE_IDS:
BADGE-ROUTER STATUS:
BADGE-DREVNE RESEARCHSPOR:
PRODUKSJONSPROFIL: major | standard | focused
PROFILSTATUS: provisional | confirmed
PROFILBEGRUNNELSE:
INNHOLDSPLAN:
  People: PRODUSER | BLOCKED + grunn
  Objects: PRODUSER | BLOCKED + grunn
  Brands: PRODUSER | BLOCKED + grunn
  Category expression: PRODUSER | BLOCKED + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <nøyaktig fire ferdige IDs, ingen tomme>
KATEGORIUTTRYKK + BRUKERRETTET NAVN:
OBJECTS ↔ KATEGORIUTTRYKK-EIERGRENSE:
UNIVERSAL CORE STATUS:
```

## 11. Anti-snarvei

- eksisterende korrekt innhold beholdes;
- relevant source-backed innhold kan ikke hoppes over fordi stedet er `focused`;
- Badge/underbadge kan ikke brukes til å dikte innhold som kildene ikke bærer;
- N/A gjelder ikke de fire obligatoriske fullprofil-samlingene;
- `focused` betyr smalt komplett, ikke halvferdig;
- grønn CI kan ikke overstyre svak redaksjonell eller visuell sluttflate.

## Kort regel

**La innholdet følge Badges: hovedbadge åpner researchuniverset, underbadges former kandidatene, kildene avgjør hvilke medlemmer som er sanne og relevante, og produksjonsprofilen avgjør hvor dypt vi går. Alle fulle ordinære Places viser fire ferdige samlinger: People, Objects, Brands og kategoriens eget uttrykk.**
