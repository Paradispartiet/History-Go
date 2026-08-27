# History GO — Produksjonsprofiler og innholdsplan for Places

Status: **canonical scope-kontrakt for stedsproduksjon**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-27**

Denne kontrakten bestemmer både **hvor omfattende et sted skal produseres** og hvordan produksjonen velger innhold som faktisk passer stedet. Den erstatter ikke stedets faglige `category`, og den er ikke en kvalitetsstige.

Et `focused` Place skal være like korrekt, kildebundet, pent og ferdig som et `major` Place. Forskjellen er reell stoffbredde, ikke hvor mye arbeid produsenten ønsker å gjøre.

## 1. Tre separate beslutninger

Disse skal aldri blandes:

1. **Kategori** — hva slags faglig sted dette er (`historie`, `naeringsliv`, `natur`, `kunst`, `sport` osv.).
2. **Produksjonsprofil** — hvor bredt det kildebårne stedet faktisk er: `major`, `standard`, `focused` eller `micro`.
3. **Innholdsplan** — hvilke konkrete moduler og PlaceCard-samlinger som er riktige for akkurat dette stedet.

Det er derfor feil å si «Næringsliv = alltid Brands» eller «Historie = alltid People». Kategorien styrer hva som undersøkes først; kildene og stedets karakter bestemmer hva som faktisk produseres.

Canonical produksjonsprofiler:

```text
major
standard
focused
micro
```

`micro` representeres teknisk av `placeTier: "micro"` og følger `docs/MICRO_PLACE_CONTRACT.md`.

## 2. Universal canonical core

For alle ordinære Places (`major`, `standard`, `focused`) er følgende obligatorisk uansett profil:

1. løst identitet, scope og own-place-grense;
2. verifisert koordinat/geometri med ærlig `coordRole`;
3. inspiserte, sporbare kilder og source → claim-disiplin;
4. canonical `desc` og `popupDesc` i korrekt kvalitet;
5. riktig kategori, relevante emner og fungerende stedsspesifikk Fagverk-side;
6. publiserte bilder med proveniens og et faktisk stående `frontImage` der ordinær PlaceCard bruker det;
7. chronology/epoke-research med korrekt dateringspresisjon og materialisering av kvalifiserte eksakte år;
8. canonical Språkleksikon med minst ett reelt stedsspesifikt navn-/begrepsspor;
9. own-place-/relasjonsaudit, slik at separate steder ikke feilaktig blir People, Objects eller Structures;
10. runtime/materialisering, relevante CI-gater og manuell slutt-QA.

En mindre profil reduserer **stoffbredde**, aldri factuality, source-kvalitet eller sluttføring.

## 3. Betingede innholdsmoduler

Følgende skal **vurderes**, men produseres bare når de er reelt relevante:

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

`BEGRUNNET N/A` betyr bare at modulen ikke tilhører stedet. Det betyr **aldri** at et tomt kort skal stå igjen i brukergrensesnittet.

**Ingen tomme PlaceCard-samlinger ved fullført ny/full produksjon. Ingen filler.** Hvis en samling ikke har et ekte canonical medlem med riktig bilde, skal samlingen ikke velges i `place_card_profile`.

## 4. Kategori styrer kandidatene — ikke resultatet

Dette er research-ruting, ikke tvangsmaler:

| Kategori / stedstype | Sterke kandidater som undersøkes først | Typiske betingede kandidater |
| --- | --- | --- |
| `naeringsliv` / industri | Structures/anlegg, produksjonsspor, People | Objects, Brands, related, Story |
| `historie` / hendelsessted | related, chronology, fysiske spor | People, Objects, Structures, Story |
| `by` / urbant sted | Structures/byrom, related | People, Objects, Brands, Story |
| `religion` | Structures, People | Objects, related, Story |
| `kunst` | productions | People, Objects, related, Brands |
| `litteratur` | productions/tekster | People, Objects, related, Brands |
| `musikk` / `scenekunst` / `film_tv` | productions | People, Objects, Brands, related |
| `sport` | competitions | People, Objects, Brands, Structures |
| `politikk` | related, chronology | People, Objects, Story |
| `vitenskap` / `teknologi` | related, faglig prosess | People, Objects, Structures, Story |
| `natur` | map/destinations og stedsspesifikk natur | Flora, Fauna, related etter faktisk økologi |

Eksempler:

- et industristed uten dokumentert selvstendig merkeidentitet skal ikke få et konstruert Brand;
- et historisk sted uten en sentral canonical person skal ikke få en perifer People-post bare for PlaceCard;
- et natursted skal ikke få generisk Flora/Fauna som ikke er dokumentert for stedet;
- ett sterkt fysisk spor skal ikke splittes kunstig til både Object og Structure;
- et sted med én god narrativ akse trenger ikke flere Stories bare for å se omfattende ut.

## 5. Produksjonsprofiler

### `major`

Brukes når stedet både har stor betydning **og** bredt kildebåret stoff som bærer flere selvstendige lærings-, material- eller narrative spor.

Typiske signaler:

- flere meningsfulle historiske perioder eller transformasjoner;
- flere sentrale personer/aktører med direkte stedstilknytning;
- flere distinkte materielle, arkitektoniske eller organisatoriske lag;
- sterk betydning på tvers av byen/faget;
- flere ikke-dupliserende lærings- eller fortellingsløp.

Forventning: dypest research og ofte 4 sterke PlaceCard-samlinger, men heller 3 ekte enn 4 der den fjerde måtte konstrueres.

### `standard`

Default for et betydelig canonical Place med en komplett stedsopplevelse, flere reelle innholdsvinkler og nok materiale til et solid Fagverk/quiz uten at stedet har Major-bredde.

Forventning: full universal core og normalt 2–4 sterke PlaceCard-samlinger, valgt etter innholdsplanen.

### `focused`

Brukes når et ekte canonical Place har historisk/kulturell verdi konsentrert i én hovedfunksjon, hendelse, struktur, spor eller snevert tema.

Forventning: full universal core, men ingen sideveis utvidelse bare for å ligne et Standard-sted. Et Focused Place kan være fullstendig med 1–3 sterke PlaceCard-samlinger dersom det er det stedet faktisk bærer.

`focused` kan aldri velges bare fordi oppgaven ønskes billigere eller raskere.

### `micro`

Brukes bare når stedet kvalifiserer etter `docs/MICRO_PLACE_CONTRACT.md`. Micro har sin egen kort- og innholdskontrakt.

## 6. Profilavgjørelse

Preflight vurderer fem dimensjoner:

1. **historisk dybde** — hvor mange reelt ulike perioder/transformasjoner finnes;
2. **entity-dybde** — hvor mange betydelige People/Objects/Brands/Structures/related Places faktisk kvalifiserer;
3. **kildedybde** — bredde og kvalitet i inspiserbare kilder;
4. **tolkningsdybde** — hvor mange selvstendige spørsmål, konflikter, prosesser eller læringsspor stedet bærer;
5. **stedets betydning** — lokal, bymessig, nasjonal eller systemisk betydning av det fysiske stedet.

- `major` krever at flere dimensjoner er tydelig høye;
- `focused` brukes når canonical verdi er høy nok, men bredden etter research er reelt smal;
- `standard` er hovedprofilen i midten;
- `micro` følger egen kontrakt.

Ingen mekanisk poengsum er endelig autoritet. Arbeidskortet skal ha en kort evidensbasert begrunnelse.

## 7. Katalogtriage før videre produksjon

Vi bruker en hybridmodell.

### Stage A — lett provisional triage

Før videre ordinær stedsproduksjon gjøres én lett passering av eksisterende katalog:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <kort grunn fra eksisterende canonical data>
```

Dette er **ikke full research** og skal ikke produsere innhold. Det brukes til backlog, prioritering og realistisk kost/omfang.

### Stage B — confirmed preflight

Når et sted faktisk går inn i produksjon, bekreftes eller endres profilen etter ekte source review:

```text
production_profile: ...
profile_status: confirmed
profile_reason: ...
profile_changed_from: <valgfritt>
```

Nye steder som ikke finnes i katalogen klassifiseres direkte som `confirmed` i preflight.

## 8. Quizprofil er et separat system

`production_profile` og quizprofil er ikke det samme.

Canonical Quiz-kontrakt velger adaptivt:

- `narrow`: 3 × 7;
- `normal`: 4 × 7;
- `rich`: 5–8 × 7;
- `major`: 8–10 × 7.

Valget følger påstandsbank og faktisk læringsbredde. Et `standard` Place kan derfor ha `rich` quiz, og et `major` Place skal ikke polstres til 10 sett hvis ti selvstendige settplaner ikke finnes.

## 9. PlaceCard: ferdig innhold, aldri tomme kort

For nye og fullproduserte ordinære Places er `place_card_profile.collection_ids` en eksplisitt kuratert liste over **bare ferdige, relevante samlinger**.

Regler:

- 1–4 samlinger er gyldig;
- hver valgt samling må ha minst ett ekte canonical medlem og et validert, lastbart previewbilde;
- samlinger uten kvalifisert innhold utelates helt fra PlaceCard;
- runtime skal gi 1, 2, 3 og 4 samlinger egne balanserte komposisjoner — ikke tomme reserver;
- former beholdes semantisk: People/Flora/Fauna er sirkler; øvrige samlinger er avrundede rektangler;
- `frontImage` forblir den stående hovedflaten og skal ikke gjenbrukes som falskt samlingspreview;
- gamle Places uten ny eksplisitt profil beholder kompatibilitetsvisningen til de faktisk revideres;
- ingen bulk-migrasjon skal slette eksisterende korrekt innhold.

Designregel: **Færre samlinger skal se kuratert ut, ikke mangelfullt.** Ett kort sentreres og får visuell tyngde; to vises som et balansert par; tre får en 2+1-komposisjon; fire beholder 2×2.

## 10. Arbeidskort

Hvert ordinære aktive sted skal minst føre:

```text
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

Produksjonsprofilen er aldri en snarvei:

- eksisterende korrekt innhold beholdes;
- et relevant source-backed subsystem kan ikke hoppes over fordi stedet er `focused`;
- en modul som er N/A skal være ferdig vurdert og deretter **ikke vises som tom PlaceCard-flate**;
- `focused` betyr smalt komplett, ikke halvferdig;
- grønn CI kan ikke overstyre svak redaksjonell eller visuell sluttflate.

## Kort regel

**Triage katalogen lett, bekreft profil i ekte preflight, behold samme harde canonical core, og produser bare innhold som passer akkurat stedet. PlaceCard viser bare ferdige samlinger og skal alltid se bevisst, balansert og komplett ut.**
