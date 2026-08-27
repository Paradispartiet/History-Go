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

Det er derfor feil å si «Næringsliv = alltid Brands», «Historie = alltid People» eller «Natur = alltid Flora + Fauna». Badge/underbadge bestemmer hvilke spor som må undersøkes; kildene bestemmer hva som faktisk kvalifiserer.

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
- `natur + fugler` gjør Fauna til en sterk kandidat bare når arter faktisk er dokumentert for stedet;
- `religion + trossteder_og_hellige_rom` prioriterer Structures og romlig/rituell historie;
- `kunst + offentlig_kunst` prioriterer Productions, kunstnere, materialer og commissioning/offentlig resepsjon;
- `litteratur + forfattere_og_litteratursteder` prioriterer People, tekster/verk, Objects og relaterte steder;
- `politikk + arbeiderbevegelse` prioriterer personer/organisasjoner, møter/hendelser, dokumenter og relaterte steder;
- `utdanning + utdanningshistorie` prioriterer institusjonshistorie, lærere/elever, skolebygg og læremidler;
- `helse + helsetjenester_helseokonomi` prioriterer institusjon, system, profesjoner og historiske tjenester fremfor individuell klinikk.

Dette er kandidatstyring, aldri en kvote.

## 4. Betingede innholdsmoduler

Følgende skal vurderes når Badge-routeren eller underbadgen gjør dem plausible, men produseres bare når de er reelt relevante og source-backed:

- People;
- Objects;
- Brands;
- kategori-eid samling (`structures`, `related`, `productions`, `competitions`, `destinations`);
- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- ruter/narrative koblinger;
- ekstra Fagverk-spor;
- ekstra medier.

`BEGRUNNET N/A` betyr at modulen etter ordentlig kandidataudit ikke tilhører stedet. Det betyr **aldri** «gjør senere» og aldri et tomt kort.

**Ingen tomme PlaceCard-samlinger ved fullført ny/full produksjon. Ingen filler.** Hvis en samling ikke har et ekte canonical medlem med riktig bilde, velges den ikke i `place_card_profile`.

## 5. Produksjonsprofiler

### `major`

Sted med stor betydning og bredt kildebåret stoff som bærer flere selvstendige lærings-, material- eller narrative spor.

Forventning: dypest research og ofte 4 sterke PlaceCard-samlinger, men heller 3 ekte enn en kunstig fjerde.

### `standard`

Default for et betydelig canonical Place med komplett stedsopplevelse, flere reelle innholdsvinkler og nok materiale til solid Fagverk/quiz uten Major-bredde.

Forventning: full universal core og normalt 2–4 sterke PlaceCard-samlinger valgt av Badge-drevet innholdsplan.

### `focused`

Canonical Place med historisk/kulturell verdi konsentrert i én hovedfunksjon, hendelse, struktur, spor eller snevert tema.

Forventning: full universal core, men ingen sideveis utvidelse bare for å ligne Standard. Et Focused Place kan være fullstendig med 1–3 sterke PlaceCard-samlinger.

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

## 9. PlaceCard: ferdig innhold, aldri tomme kort

For nye/fullproduserte ordinære Places er `place_card_profile.collection_ids` en eksplisitt kuratert liste over **bare ferdige, relevante samlinger**.

- 1–4 samlinger er gyldig;
- hver valgt samling har minst ett ekte canonical medlem og validert, lastbart previewbilde;
- samlinger uten kvalifisert innhold utelates helt;
- runtime gir 1, 2, 3 og 4 samlinger balanserte komposisjoner;
- People/Flora/Fauna er sirkler; øvrige er avrundede rektangler;
- `frontImage` forblir stående hovedflate;
- gamle Places uten ny eksplisitt profil beholder kompatibilitetsvisningen til revisjon.

Designregel: **Færre samlinger skal se kuraterte ut, ikke mangelfulle.** Ett kort sentreres og får visuell tyngde; to er et balansert par; tre får 2+1; fire får 2×2.

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
  People: PRODUSER | N/A + grunn
  Objects: PRODUSER | N/A + grunn
  Brands: PRODUSER | N/A + grunn
  Category collection: PRODUSER | N/A + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <1–4 ferdige IDs, ingen tomme>
UNIVERSAL CORE STATUS:
```

## 11. Anti-snarvei

- eksisterende korrekt innhold beholdes;
- relevant source-backed innhold kan ikke hoppes over fordi stedet er `focused`;
- Badge/underbadge kan ikke brukes til å dikte innhold som kildene ikke bærer;
- N/A-modul vises ikke som tom PlaceCard-flate;
- `focused` betyr smalt komplett, ikke halvferdig;
- grønn CI kan ikke overstyre svak redaksjonell eller visuell sluttflate.

## Kort regel

**La innholdet følge Badges: hovedbadge åpner researchuniverset, underbadges former kandidatene, kildene avgjør hva som er sant og relevant, og produksjonsprofilen avgjør hvor dypt vi går. PlaceCard viser bare ferdige samlinger og skal alltid se bevisst, balansert og komplett ut.**
