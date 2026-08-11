# Torggata – fase 8 PlaceCard-rundinger audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Rundingskontrakt: `data/places/README_place_rounds.md`
- Produksjonschecklist: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Baseline: fase 7 lukket i PR #4828, merge `88bec1d857dce5d92289cf125c874ff5b96fb137`
- Status: **AUDIT FERDIG – fase 8 er ikke samlet godkjent**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
LEGACY-RUNDINGSMODELL: PR #1307 / commit 40f3a1d4… innførte per-place rounds
TIDLIGERE TORGGTATA-AUDIT: commit c20f7103… og PR #1738 godkjente ni Torggata-rundinger
DAGENS KONTRAKT: Badges separat + fire innholdsrundinger; vanlig By = people · objects · brands · structures, med images som fallback hvis structures mangler reell samling
BESLUTNING: ELDRE NI-RUNDERSAUDIT ER HISTORIKK, IKKE CANONICAL FASIT
```

## Canonical runtime i dag

`js/ui/place-rounds-visual-collections.js` eier dagens PlaceCard-rundingspresentasjon.

For et vanlig `by`-sted:

```text
Badges: separat ved stedsnavnet
Innhold: people · objects · brands · structures
Fallback for fjerde: images når structures er tom
```

Viktige runtimefunn:

- `selectedIds(place)` bygger rundingssettet fra kategori, ikke fra `place.rounds`;
- `CATEGORY_FOURTH.by = "structures"`;
- `fourthRoundId(place)` bruker `structures` bare når `structureItems(place).length > 0`, ellers `images`;
- `apply()` setter `roundCount = 4` og skjuler legacy-ikonene i `LEGACY_GRID_ICON_IDS`;
- den gamle ni-runderslisten i Torggata-data styrer derfor ikke den canonical synlige 2×2-rundingsflaten;
- likevel er `place.rounds` fortsatt stale legacy-data og skal fjernes i sluttsteget når de fire canonical samlingene er auditert.

## Status per canonical runding

### Badges – allerede separat

Status: **BEHOLD / allerede riktig modellert**.

- Badges er ikke en av de fire innholdsrundingene;
- fase 4 har allerede verifisert `category: by`, de to canonicale By-emnene og fungerende `fagverk-sted.html?place=torggata`;
- ingen ny Badge-produksjon hører i fase 8.

### People – eksisterer, men må re-auditeres

Status: **8A TRENGER ARBEID**.

Nullmålingen registrerte eksisterende global People-dekning for Torggata, men denne ble uttrykkelig ikke re-auditert mot dagens:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`;
- bilde-/attribusjonskrav.

Fase 8 skal ikke opprette nye personer før dagens koblinger, duplikater, fysisk/biografisk stedsanker og bilder er kontrollert.

### Objects – reelt hull

Status: **8B TRENGER ARBEID**.

Canonical place har ingen `objects`-array.

Runtime kan midlertidig hente fysiske Civication-items som compatibility-kilde, men bare når objektet både er fysisk kvalifisert **og har bilde**. Torggatas eldre `civication_store` inneholder gateskilt, sykkel-/gågatesymbol og andre legacy-items, men de mangler egne bilde-felt og er ikke dermed canonical Objects.

Dette skal ikke løses ved å kalle hele `civication_store` for Objects. 8B må:

1. skille reelle fysiske objekter fra samlekort/abstrakte markører;
2. bygge bare dokumenterte, stedsspesifikke Objects;
3. bruke reelle bilder/preview når kontrakten krever visuell samling;
4. ikke flytte handlinger, Story eller Før/etter inn i Objects.

Sterkeste eksisterende kandidater:

- et faktisk Torggata-gateskilt;
- fysisk gate-/sykkelmarkering knyttet til den ombygde gateprofilen.

Begge krever egen source-/bildekontroll før produksjon.

### Brands – eksisterer, men må re-auditeres

Status: **8C TRENGER ARBEID**.

Nullmålingen registrerte åtte eksisterende Torggata-mappings i `data/brands/brands_by_place.json`:

`angst · arakataka · big_dipper · eldorado_bokhandel · john_dee · justisen · the_villa · tilt`

Dette er eldre dekningsdata, ikke automatisk ferdigstatus.

8C må lese `data/brands/brand_rules_v1_1.json` og kontrollere for hver mapping:

- selvstendig gjenkjennelig identitet;
- dokumentert fysisk Torggata-kobling;
- korrekt skille mellom venue, virksomhet, merkevare og bygg;
- bilde/preview og canonical brand-record;
- at historisk eller flyttet virksomhet ikke presenteres som nåværende uten temporal markering.

### Bygg og anlegg – mangler canonical samling

Status: **8D TRENGER ARBEID**.

Torggata har ingen `buildings`, `structures`, `facilities`, `venues` eller `architecture` som runtime kan bruke som `structures`-samling. De to fase-6 `subplaces` er gatesegmenter og kvalifiserer ikke som bygg/anlegg.

Det finnes likevel klart dokumenterte fysiske kandidater i allerede godkjent fase-5-materiale:

1. **Eldorado / Torggata 9** – fysisk kultur-/teater-/kinobygg med dokumentert stedshistorie;
2. **Torggata bad / Rockefeller-bygningen, Torggata 16** – fysisk badeanlegg med senere kulturbruk.

Viktig duplikatregel:

- Torggata bad og Rockefeller er ikke to separate fysiske Structures når de viser til samme bygningsanlegg;
- venue-/bruksidentitet kan beskrives i structure-objektet, men den fysiske bygningen skal ikke dobles for å fylle rundingen.

Hvis 8D etter research ikke kan bygge en reell structure-samling, er `images` korrekt category-four fallback og skal beholdes. Fallback er ikke en feil.

## Images – dagens fjerderunding/fallback

Status nå: **RUNTIME-FALLBACK, IKKE EGEN PRODUKSJONSFASE**.

Siden `structureItems(torggata)` i dagens data er tom, velger runtime `images`.

Torggata har nå flere reelle bildeinputs:

- `frontImage` / place-bilde;
- fase-7D førbilde 2009;
- fase-7D etterbilde 2017.

Dermed er den fjerde rundingen ikke teknisk tom selv før 8D. Hvis en korrekt `structures`-samling senere etableres, vil runtime automatisk bytte fra Bilder til Bygg og anlegg.

## Legacy `place.rounds`

Canonical Torggata-record har fortsatt ni gamle entries:

`people · tasks · badges · works · civication · brands · før_nå · fortellinger · leksikon`

Disse skal **ikke** omskrives til en ny hardkodet fireliste. Dagens runtime trenger ikke `place.rounds` for kategori-fire-modellen.

Beslutning:

- behold feltet urørt under 8A–8D for å unngå å blande dataaudit med presentasjonssanering;
- i 8E, etter at canonical People/Objects/Brands/Structures er avgjort, fjernes stale `rounds`-felt dersom runtime-/schemaauditen bekrefter at ingen aktiv eier trenger det;
- 8E verifiserer synlig 2×2-grid, Badges-plassering og fravær av legacy-ikoner.

## Faseplan

```text
8 audit
  → 8A People
  → 8B Objects
  → 8C Brands
  → 8D Bygg og anlegg
  → 8E legacy rounds + slutt-UI
```

Bare ett delsteg skal være `PÅGÅR` om gangen.

## Stoppgate

Fase 8 kan ikke settes GODKJENT før:

- People er re-auditert, ikke bare telt;
- Objects er enten reelt bygget eller dokumentert som ærlig tom samling etter kontrakten;
- Brands-mappingene er re-auditert mot brand-reglene;
- Structures er reelt bygget eller `images` er eksplisitt godkjent fallback;
- stale ni-rundersdata ikke lenger behandles som aktiv sannhet;
- Badges står separat;
- synlig PlaceCard har nøyaktig fire innholdsrundinger i riktig 2×2-grid;
- relevante tests/CI passerer.
