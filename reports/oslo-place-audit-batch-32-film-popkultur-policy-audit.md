# Batch 32 — film-/populærkultur- og kategori-policy for gjenværende wrong-prefix warnings

Dato: 2026-06-01

## Formål

Batch 32 er en **read-only policyrapport**. Den vurderer de 43 gjenværende
wrong-prefix warnings som Batch 31 bevisst holdt utenfor den første
health-allowlisten, med særlig fokus på film-/populærkultur-policy.

Dette er **ikke** en datafix-batch og **ikke** en script-batch. Det er ikke
gjort endringer i health-scriptet, place-data, canonical emne-filer, manifest,
index, UI, CSS, HTML, JS eller assets. Eneste tillatte endring er opprettelsen
av denne rapportfilen.

Rapporten ender i en konkret anbefaling om hva som bør allowlistes i Batch 33,
hva som bør datafikses senere, hva som bør forbli warnings, og om `film_tv` bør
bli egen place category på sikt.

## Kommandoer kjørt

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Detaljerte wrong-prefix-forekomster ble hentet ut fra health-output med:

```bash
npm run health:places 2>&1 | grep -i "does not match category"
```

## Filer og scripts undersøkt (read-only)

Rapporter:
- `reports/oslo-place-audit-batch-31-health-cross-disciplinary-allowlist.md`
- `reports/oslo-place-audit-batch-30-cross-disciplinary-editorial-approval.md`
- `reports/oslo-place-audit-batch-29-post-policy-wrong-prefix-audit.md`

Scripts / config:
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/places/manifest.json`

Aktive place-filer (kun lest):
- `data/places/by/oslo/places_by.json`
- `data/places/film/oslo/places_oslo_film.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- `data/places/politikk/oslo/places_politikk.json`
- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`

Canonical-filer (kun lest):
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/kunst/emner_kunst_canonical_v4_5.json`
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`

## Baseline etter Batch 31

`npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:

- `places_index.json is in sync with source place files.`

`npm run health:places`:

- Errors: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 43
- Allowlisted cross-disciplinary emne_ids: 191
- Warnings: 1060

Baseline er bekreftet identisk med Batch 31s sluttstatus.

## Hvordan wrong-prefix måles

Health-scriptet (`tools/placeHealthReport.mjs`) sammenligner en place-fils
`category` mot `emne_id`-prefiks via `CATEGORY_EMNE_PREFIXES`, og demper
warning kun når `category → canonical fagfamilie` finnes i
`ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES` (Batch 31-allowlisten på 191).

Relevante forventede prefikser:

- `by` → `em_by_`
- `populaerkultur` → `em_pop_`
- `politikk` → `em_pol_`
- `natur` → `em_natur_`
- `subkultur` → `em_sub_`
- `film` / `film_tv` → `em_film_tv_`

Canonical fagfamilie utledes konservativt fra mappenavn under `data/fag/`:
`popkultur → populaerkultur`, `TV_og_Film → film_tv`, `kunst → kunst`,
`naeringsliv → naeringsliv`.

Et viktig poeng for Batch 32: **allowlisten er per `category → fagfamilie`-par,
ikke per `emne_id`.** Allowlister man et par, dempes _alle_ forekomster av det
paret samtidig. Dette gjør at svake enkeltkoblinger ikke kan dempes selektivt
via allowlist — de må enten datafikses eller holdes som warning.

## Full oversikt over de 43 gjenværende wrong-prefix warnings

| # | Par | Place file | Place id | Title | Category | emne_id |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | by→populaerkultur | by/oslo/places_by.json | radhusplassen | Rådhusplassen | by | em_pop_ikoniske_oyeblikk |
| 2 | by→populaerkultur | by/oslo/places_by.json | radhusplassen | Rådhusplassen | by | em_pop_digital_offentlighet |
| 3 | by→populaerkultur | by/oslo/places_by.json | bjorvika | Bjørvika | by | em_pop_kino_populaer_offentlighet |
| 4 | by→populaerkultur | by/oslo/places_by.json | bjorvika | Bjørvika | by | em_pop_film_tv_format |
| 5 | by→populaerkultur | by/oslo/places_by.json | toyen_torg | Tøyen torg | by | em_pop_fellesskap_tilhorighet |
| 6 | by→populaerkultur | by/oslo/places_by.json | toyen_torg | Tøyen torg | by | em_pop_deltakelse_remix |
| 7 | by→populaerkultur | by/oslo/places_by.json | majorstuen_krysset | Majorstuen krysset | by | em_pop_aktualitet_trend |
| 8 | by→populaerkultur | by/oslo/places_by.json | majorstuen_krysset | Majorstuen krysset | by | em_pop_digital_offentlighet |
| 9 | by→populaerkultur | by/oslo/places_by.json | oslo_s | Oslo S | by | em_pop_publikum_rytme_vaner |
| 10 | by→populaerkultur | by/oslo/places_by.json | oslo_s | Oslo S | by | em_pop_aktualitet_trend |
| 11 | by→populaerkultur | by/oslo/places_by.json | aker_brygge | Aker Brygge | by | em_pop_kulturell_distinksjon |
| 12 | by→populaerkultur | by/oslo/places_by.json | aker_brygge | Aker Brygge | by | em_pop_fellesskap_tilhorighet |
| 13 | by→populaerkultur | by/oslo/places_by.json | gronlandsleiret | Grønlandsleiret | by | em_pop_fellesskap_tilhorighet |
| 14 | by→populaerkultur | by/oslo/places_by.json | gronlandsleiret | Grønlandsleiret | by | em_pop_ekskludering_representasjon |
| 15 | by→populaerkultur | by/oslo/places_by.json | barcode | Barcode | by | em_pop_influencer_personlig_merkevare |
| 16 | by→populaerkultur | by/oslo/places_by.json | barcode | Barcode | by | em_pop_digital_offentlighet |
| 17 | by→populaerkultur | by/oslo/places_by.json | vaterland | Vaterland | by | em_pop_fellesskap_tilhorighet |
| 18 | by→populaerkultur | by/oslo/places_by.json | vaterland | Vaterland | by | em_pop_aktualitet_trend |
| 19 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | frognerstranda | Frognerstranda | by | em_pop_fellesskap_tilhorighet |
| 20 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | frognerstranda | Frognerstranda | by | em_pop_aktualitet_trend |
| 21 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | grand_hotel | Grand Hotel | by | em_pop_ikonisk_persona |
| 22 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | grand_hotel | Grand Hotel | by | em_pop_kjendis_kulturell_kapital |
| 23 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | slottsplassen | Slottsplassen | by | em_pop_ikonisk_persona |
| 24 | by→populaerkultur | popkultur/oslo/places_oslo_populaerkultur.json | slottsplassen | Slottsplassen | by | em_pop_ikoniske_oyeblikk |
| 25 | by→film_tv | by/oslo/places_by.json | sagene | Sagene | by | em_film_tv_location_filmsted |
| 26 | by→film_tv | by/oslo/places_by.json | sagene | Sagene | by | em_film_tv_byen_som_bilde |
| 27 | by→film_tv | by/oslo/places_by.json | sagene | Sagene | by | em_film_tv_sted_identitet |
| 28 | by→film_tv | by/oslo/places_by.json | sagene | Sagene | by | em_film_tv_serieformat |
| 29 | by→film_tv | by/oslo/places_by.json | sagene | Sagene | by | em_film_tv_fiksjon_realisme |
| 30 | by→film_tv | by/oslo/places_by.json | kampen | Kampen | by | em_film_tv_location_filmsted |
| 31 | by→film_tv | by/oslo/places_by.json | kampen | Kampen | by | em_film_tv_hverdagsfilm |
| 32 | by→film_tv | by/oslo/places_by.json | kampen | Kampen | by | em_film_tv_fiksjon_realisme |
| 33 | by→film_tv | by/oslo/places_by.json | kampen | Kampen | by | em_film_tv_urban_filmrepresentasjon |
| 34 | by→film_tv | by/oslo/places_by.json | kampen | Kampen | by | em_film_tv_sted_identitet |
| 35 | populaerkultur→film_tv | film/oslo/places_oslo_film.json | saga_kino | Saga kino | populaerkultur | em_film_tv_kino_fellesrom |
| 36 | populaerkultur→film_tv | film/oslo/places_oslo_film.json | klingenberg_kino | Klingenberg kino | populaerkultur | em_film_tv_kino_fellesrom |
| 37 | populaerkultur→film_tv | film/oslo/places_oslo_film.json | gimle_kino | Gimle kino | populaerkultur | em_film_tv_kino_fellesrom |
| 38 | populaerkultur→film_tv | film/oslo/places_oslo_film.json | vika_kino | Vika kino | populaerkultur | em_film_tv_kino_fellesrom |
| 39 | populaerkultur→film_tv | film/oslo/places_oslo_film.json | hartvig_nissens_skole_skam | Hartvig Nissens skole (SKAM) | populaerkultur | em_film_tv_location_filmsted |
| 40 | politikk→populaerkultur | politikk/oslo/places_politikk.json | youngstorget | Youngstorget | politikk | em_pop_digital_offentlighet |
| 41 | politikk→populaerkultur | politikk/oslo/places_politikk.json | youngstorget | Youngstorget | politikk | em_pop_deltakelse_remix |
| 42 | natur→kunst | natur/europe/portugal/lisbon/places_lisbon_natur.json | lisbon_jardim_botanico | Jardim Botânico de Lisboa | natur | em_kunst_institusjoner_kanon |
| 43 | subkultur→naeringsliv | subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json | lisbon_fabrica_braco_de_prata | Fábrica Braço de Prata | subkultur | em_naer_felt_arbeid_verdiskaping |

Fordeling: `by→populaerkultur` 24, `by→film_tv` 10,
`populaerkultur→film_tv` 5, `politikk→populaerkultur` 2, `natur→kunst` 1,
`subkultur→naeringsliv` 1 = **43**.

## Seksjon: `by→populaerkultur` (24 forekomster)

### Observasjon

De 24 forekomstene fordeler seg i **to ulike strukturelle kategorier**:

1. **18 ekte tverrfaglige byrom** i `data/places/by/oslo/places_by.json`
   (radhusplassen, bjorvika, toyen_torg, majorstuen_krysset, oslo_s,
   aker_brygge, gronlandsleiret, barcode, vaterland). Disse er reelle byrom
   (`category: by`) med en eller flere `em_by_`-emner som hovedlag, pluss
   `em_pop_`-emner som sekundærlag.

2. **6 feilkategoriserte popkultur-steder** som ligger i
   `data/places/popkultur/oslo/places_oslo_populaerkultur.json`, men har
   `category: "by"` (frognerstranda, grand_hotel, slottsplassen). Disse har
   **kun** `em_pop_`-emner og ingen `em_by_`-emner, og beskrives eksplisitt som
   popkulturelle (kjendissone, prisutdelinger, TV-ritualer). Her er det
   sannsynligvis selve `category`-verdien som er feil, ikke emnevalget.

Dette skillet er avgjørende: de 6 i gruppe 2 bør **datafikses** (category
`by → populaerkultur`), ikke allowlistes. Da matcher `em_pop_`-prefiks
kategorien direkte, og 6 warnings forsvinner uten allowlist.

### Vurdering av sekundærlag-policy for gruppe 1 (18 forekomster)

Byrom _kan_ ha et populærkulturelt sekundærlag når de er dokumenterte
ikoniske offentligheter, sosiale scener, fellesarenaer eller
representasjonsrom. Eksempler med god dekning i place-tekst:

- **Rådhusplassen**: «byens representative forplass … utendørsscene … konserter,
  folkefester, politiske markeringer» → `em_pop_ikoniske_oyeblikk` er godt belagt.
- **Tøyen torg / Aker Brygge / Grønlandsleiret**: dokumentert sosialt samvær,
  konsum, miks og tilhørighet → `em_pop_fellesskap_tilhorighet`,
  `em_pop_kulturell_distinksjon`, `em_pop_ekskludering_representasjon` er belagt.
- **Oslo S**: masseoffentlighet, kontinuerlig publikumsstrøm →
  `em_pop_publikum_rytme_vaner` er belagt.

### Risiko: «alle byrom blir for brede popkultursteder»

Den reelle risikoen ligger i **trend-/digital-/remix-/influencer-emnene** brukt
på generisk infrastruktur, der det populærkulturelle laget _ikke_ er dokumentert
i place-teksten:

- **majorstuen_krysset** (`em_pop_aktualitet_trend`, `em_pop_digital_offentlighet`):
  teksten beskriver et trafikkryss/kollektivknutepunkt — ingen trend-/digital-
  offentlighet er dokumentert. Svak kobling.
- **barcode** (`em_pop_influencer_personlig_merkevare`, `em_pop_digital_offentlighet`):
  teksten handler om byform/eiendom/skyline — influencer/digital-laget er tynt belagt.
- **vaterland** (`em_pop_fellesskap_tilhorighet`, `em_pop_aktualitet_trend`):
  stedet har **ingen** `em_by_`-emner og svært tynn tekst; ligner mer en
  emnevalg-/datakvalitetssak enn et bevisst sekundærlag.

Fordi allowlist virker på hele `by→populaerkultur`-paret, vil en allowlist
_også_ legitimere disse svake koblingene.

### Avgjørelse for `by→populaerkultur`

**Anbefalt: allowlist senere i Batch 33 med streng policytekst — men først etter
en målrettet datafix av de svakeste forekomstene.** Konkret:

1. Datafiks de 6 feilkategoriserte popkultur-stedene (gruppe 2) først:
   `category: by → populaerkultur`. Da faller 6 warnings bort uten allowlist.
2. Gjennomgå og evt. fjern/bytt de svake trend-/digital-/influencer-koblingene
   (majorstuen_krysset, barcode, vaterland) som ikke er dokumentert i teksten.
3. Deretter allowlist `by → populaerkultur` med streng redaksjonell policytekst
   som krever at det populærkulturelle laget (ikonstatus, fellesskap,
   publikum/offentlighet, representasjon) er **eksplisitt dokumentert i
   place-teksten** — ikke generisk trend på vilkårlig byrom.

Denne rekkefølgen unngår at allowlisten sementerer svake koblinger.

## Seksjon: `by→film_tv` (10 forekomster)

Gjelder to byområder i `places_by.json`: **Sagene** og **Kampen**, fem
`em_film_tv_`-emner hver.

- **Kampen**: desc + one_liner sier eksplisitt «brukt … som gjenkjennelig
  fortellingslandskap i film og TV» / «Kampen brukes i film og TV fordi bydelen
  allerede forteller en historie». Tags: `film_location`, `tv_serier`,
  `sosialrealisme`, `norsk_film`.
- **Sagene**: «sterke lokale fortellinger i både hverdagsliv og
  kulturproduksjon» / one_liner «Sagene er en bydel som ofte spilles som seg
  selv i norsk TV». Tags: `film_location`, `tv_serier`, `norsk_tv`.

Begge har altså et **eksplisitt dokumentert location-/representasjonslag**.
Dette er reelle byrom (`category: by`) der film/TV er et sekundærlag — ikke
filmsteder som burde bytte kategori. Emnevalget (`location_filmsted`,
`byen_som_bilde`, `sted_identitet`, `urban_filmrepresentasjon`, `hverdagsfilm`,
`fiksjon_realisme`, `serieformat`) treffer presist på «sted som medforteller».

### Avgjørelse for `by→film_tv`

**Anbefalt: allowlist senere i Batch 33 med streng policytekst.** Begrunnelse:

- Koblingen er konseptuelt smal og veldokumentert (location/representasjon).
- Den gjelder kun byrom med eksplisitt film-/TV-representasjonslag i teksten.
- Den bør **ikke** løses ved å gi disse stedene `category: film`/`film_tv`, fordi
  de primært er levde byrom; film er sekundærlaget.

Streng policytekst bør kreve at place-teksten eksplisitt omtaler stedet som
film-/TV-location eller representasjonsrom.

## Seksjon: `populaerkultur→film_tv` (5 forekomster)

Alle fem ligger i `data/places/film/oslo/places_oslo_film.json`. **Filstien sier
`film/`, men `category`-verdien på hvert place er `populaerkultur`** — bekreftet
ved lesing. Forekomstene:

- 4 kinoer (saga_kino, klingenberg_kino, gimle_kino, vika_kino) med
  `em_film_tv_kino_fellesrom` («Kino Fellesrom»).
- hartvig_nissens_skole_skam (SKAM-lokasjon) med `em_film_tv_location_filmsted`.

Alle fem har også `em_pop_`-emner som matcher kategorien `populaerkultur`; det er
kun `em_film_tv_`-emnet som utløser warning.

### Tolkning av de fire mulighetene

1. **Riktig fordi film/TV ligger under populærkultur**: Ja — i dagens
   place-datamodell er `category: populaerkultur` den faktiske verdien, og
   film/TV behandles redaksjonelt som en del av populærkultur. `em_film_tv_`
   er da et legitimt fagfamilie-sekundærlag på et populærkultursted.
2. **Tegn på at film_tv bør være egen place category**: Ja, dette er det
   tydeligste signalet i hele batchen — se egen seksjon nedenfor. Filstien
   `film/` antyder allerede en intensjon om et eget film-domene.
3. **Emnevalgproblem**: Nei. `em_film_tv_kino_fellesrom` på en kino og
   `em_film_tv_location_filmsted` på en innspillingslokasjon er korrekte emnevalg.
4. **Health-policyproblem**: Delvis. Health-scriptet mangler i dag en allowlist
   for `populaerkultur → film_tv`; paret er bevisst holdt utenfor Batch 31.

### Avgjørelse for `populaerkultur→film_tv`

**Anbefalt: allowlist senere i Batch 33** som riktig kategori-policy, fordi
film/TV i dagens place-data er underlagt populærkultur. Koblingen er smal,
veldokumentert og gjelder ekte film-/kino-innhold.

**Sekundært, på sikt:** vurder `film_tv` som egen place category (egen
category-policybatch). Hvis `category` settes til `film`/`film_tv`, ville disse
5 warnings forsvinne via category-justering i stedet for allowlist. Det er en
datafix/kategori-policy-beslutning som **ikke** hører hjemme i denne batchen.

## Seksjon: `politikk→populaerkultur` (2 forekomster)

Begge gjelder **Youngstorget** (`category: politikk`), Norges fremste politiske
torg / arbeiderbevegelsens sted. Stedet har korrekte `em_pol_`-emner
(`arbeidsliv_kollektiv_kamp`, `demonstrasjoner_protest`). Warning-emnene:

- `em_pop_digital_offentlighet` («Digital offentlighet»): forsvarbar —
  moderne mobilisering, protest og breaking-news-offentlighet (tag `breaking_news`,
  `tv`, `offentlighet`) har en reell digital-offentlighet-dimensjon.
- `em_pop_deltakelse_remix` («Deltakelse og remix»): svakere — «remix» er en
  popkulturell produksjonslogikk som ikke er dokumentert i place-teksten.

### Avgjørelse for `politikk→populaerkultur`

**Anbefalt: hold som warning (manuell vurdering).** Begrunnelse:

- Paret gjelder kun **ett** sted og to emner — for tynt grunnlag til å
  allowliste et helt `politikk → populaerkultur`-par.
- `em_pop_digital_offentlighet` er forsvarbar, men bør heller dekkes via en
  evt. fremtidig politikk-spesifikk emnefamilie enn via popkultur-allowlist.
- `em_pop_deltakelse_remix` er en kandidat for `vurder_emnevalg` (datafix
  senere) hvis koblingen ikke kan dokumenteres.

Ikke allowlist i Batch 33.

## Seksjon: `natur→kunst` (1 forekomst)

**Jardim Botânico de Lisboa** (`category: natur`) med `em_kunst_institusjoner_kanon`
(«Kunstinstitusjoner og kanondannelse»).

Place-teksten beskriver en **vitenskapelig** botanisk hage fra 1873, knyttet til
universitetet, med subtropiske tresamlinger. Stedet har allerede passende emner
(`em_his_stat_institusjoner`, `em_by_parker_som_sosial_infrastruktur`,
`em_his_kulturminner_bevaring` — sistnevnte to allowlistet via natur→by/historie).

Det er **ingen kunstinstitusjons- eller kanondannelseskontekst dokumentert** i
teksten. `em_kunst_institusjoner_kanon` fremstår som et **mismatchet emnevalg** —
sannsynligvis ment å fange «institusjon/samling», men kunst-familien passer dårlig
for en botanisk/vitenskapelig hage.

### Avgjørelse for `natur→kunst`

**Anbefalt: `vurder_emnevalg` (datafix senere), hold som warning inntil videre.**
Ikke allowlist. Emnet bør enten fjernes eller byttes til et vitenskaps-/natur-/
historie-emne som faktisk er dokumentert. Inntil en datafix-beslutning er tatt,
bør warningen stå.

## Seksjon: `subkultur→naeringsliv` (1 forekomst)

**Fábrica Braço de Prata** (`category: subkultur`) med
`em_naer_felt_arbeid_verdiskaping` («Næringsliv som arbeid og verdiskaping»).

Place-teksten: «Tidligere våpenfabrikk i Marvila, omgjort fra 2007 til
selvorganisert kulturhus». Stedet har korrekte `em_sub_`-emner
(`grunnbegreper`, `musikkscener`) og `em_by_transformasjon_ombruk` /
`em_by_lavterskel_moteplasser_uten_kjopspress` (sistnevnte allowlistet via
subkultur→by).

Industri-/arbeidslivslaget er **kun tynt dokumentert** via formuleringen
«tidligere våpenfabrikk». Selve transformasjonen fra industri til kultur er
allerede fanget av `em_by_transformasjon_ombruk` (allowlistet). `em_naer_*`
legger til en eksplisitt nærings-/verdiskapingspåstand som ikke utdypes i teksten.

### Avgjørelse for `subkultur→naeringsliv`

**Anbefalt: hold som warning (manuell vurdering), kandidat for `vurder_emnevalg`.**
Ikke allowlist for ett enkelt sted. Hvis arbeidslivs-/produksjonshistorien skal
være et reelt lag, bør place-teksten utdype industriarven; ellers er
transformasjonslaget allerede dekket av det allowlistede `em_by_`-emnet.

## Beslutningstabell (én rad per forekomst)

Forklaring av canonical fagfamilie: `em_pop_*` → `populaerkultur`,
`em_film_tv_*` → `film_tv`, `em_kunst_*` → `kunst`, `em_naer_*` → `naeringsliv`.

| # | Par | Place id | Title | Category | emne_id | Canonical familie | Canonical title | Place-kontekst | Vurdering | Anbefalt handling | Senere batch-type |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | by→pop | radhusplassen | Rådhusplassen | by | em_pop_ikoniske_oyeblikk | populaerkultur | Ikoniske øyeblikk | Representativ forplass, utendørsscene, folkefester | Ikonstatus godt belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 2 | by→pop | radhusplassen | Rådhusplassen | by | em_pop_digital_offentlighet | populaerkultur | Digital offentlighet | Direktesendt-TV-flate, offentlig scene | Forsvarbar | `allowlist_senere` | Batch 33 allowlist (streng) |
| 3 | by→pop | bjorvika | Bjørvika | by | em_pop_kino_populaer_offentlighet | populaerkultur | Kino og populær offentlighet | Opera/bibliotek/kultur i transformert fjordby | Kulturoffentlighet belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 4 | by→pop | bjorvika | Bjørvika | by | em_pop_film_tv_format | populaerkultur | Film, TV og format | Tags cgi/reklame/visuell_pop; format-lag tynt i tekst | Svakt belagt | `vurder_emnevalg` | Datafix senere |
| 5 | by→pop | toyen_torg | Tøyen torg | by | em_pop_fellesskap_tilhorighet | populaerkultur | Fellesskap og tilhørighet | Lokalt samvær, lavterskel møteplass | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 6 | by→pop | toyen_torg | Tøyen torg | by | em_pop_deltakelse_remix | populaerkultur | Deltakelse og remix | Remix-logikk ikke dokumentert | Svakt belagt | `vurder_emnevalg` | Datafix senere |
| 7 | by→pop | majorstuen_krysset | Majorstuen krysset | by | em_pop_aktualitet_trend | populaerkultur | Aktualitet og trend | Trafikkryss/knutepunkt; ingen trend dokumentert | Svak kobling, risiko | `datafix_senere` | Datafix senere |
| 8 | by→pop | majorstuen_krysset | Majorstuen krysset | by | em_pop_digital_offentlighet | populaerkultur | Digital offentlighet | Trafikkryss; digital-lag ikke dokumentert | Svak kobling, risiko | `datafix_senere` | Datafix senere |
| 9 | by→pop | oslo_s | Oslo S | by | em_pop_publikum_rytme_vaner | populaerkultur | Publikum, rytme og vaner | Masseoffentlighet, kontinuerlig publikumsstrøm | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 10 | by→pop | oslo_s | Oslo S | by | em_pop_aktualitet_trend | populaerkultur | Aktualitet og trend | Knutepunkt; trend-lag tynt | Svakt belagt | `hold_som_warning` | — |
| 11 | by→pop | aker_brygge | Aker Brygge | by | em_pop_kulturell_distinksjon | populaerkultur | Kulturell distinksjon | Konsum/distinksjon, kjendiskultur dokumentert | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 12 | by→pop | aker_brygge | Aker Brygge | by | em_pop_fellesskap_tilhorighet | populaerkultur | Fellesskap og tilhørighet | Opphold/rekreasjon ved fjorden | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 13 | by→pop | gronlandsleiret | Grønlandsleiret | by | em_pop_fellesskap_tilhorighet | populaerkultur | Fellesskap og tilhørighet | Sosial tilstedeværelse, lokale nettverk | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 14 | by→pop | gronlandsleiret | Grønlandsleiret | by | em_pop_ekskludering_representasjon | populaerkultur | Ekskludering og representasjon | Migrasjon/mangfold/representasjon dokumentert | Belagt | `allowlist_senere` | Batch 33 allowlist (streng) |
| 15 | by→pop | barcode | Barcode | by | em_pop_influencer_personlig_merkevare | populaerkultur | Influencer og personlig merkevare | Byform/eiendom/skyline; influencer-lag tynt | Svakt belagt | `vurder_emnevalg` | Datafix senere |
| 16 | by→pop | barcode | Barcode | by | em_pop_digital_offentlighet | populaerkultur | Digital offentlighet | Tech-estetikk-tag; digital-lag tynt i tekst | Svakt belagt | `hold_som_warning` | — |
| 17 | by→pop | vaterland | Vaterland | by | em_pop_fellesskap_tilhorighet | populaerkultur | Fellesskap og tilhørighet | Ingen em_by_-emner; svært tynn tekst | Datakvalitet svak | `vurder_emnevalg` | Datafix senere |
| 18 | by→pop | vaterland | Vaterland | by | em_pop_aktualitet_trend | populaerkultur | Aktualitet og trend | Ingen em_by_-emner; tynn tekst | Datakvalitet svak | `vurder_emnevalg` | Datafix senere |
| 19 | by→pop | frognerstranda | Frognerstranda | by | em_pop_fellesskap_tilhorighet | populaerkultur | Fellesskap og tilhørighet | I popkultur-fil, men category=by; kjendissone | Feil category | `vurder_place_category` | Datafix senere |
| 20 | by→pop | frognerstranda | Frognerstranda | by | em_pop_aktualitet_trend | populaerkultur | Aktualitet og trend | I popkultur-fil, men category=by; sladdermedia | Feil category | `vurder_place_category` | Datafix senere |
| 21 | by→pop | grand_hotel | Grand Hotel | by | em_pop_ikonisk_persona | populaerkultur | Ikonisk persona | I popkultur-fil, men category=by; kjendisscene | Feil category | `vurder_place_category` | Datafix senere |
| 22 | by→pop | grand_hotel | Grand Hotel | by | em_pop_kjendis_kulturell_kapital | populaerkultur | Kjendis og kulturell kapital | I popkultur-fil, men category=by; prisutdelinger | Feil category | `vurder_place_category` | Datafix senere |
| 23 | by→pop | slottsplassen | Slottsplassen | by | em_pop_ikonisk_persona | populaerkultur | Ikonisk persona | I popkultur-fil, men category=by; TV-ritual | Feil category | `vurder_place_category` | Datafix senere |
| 24 | by→pop | slottsplassen | Slottsplassen | by | em_pop_ikoniske_oyeblikk | populaerkultur | Ikoniske øyeblikk | I popkultur-fil, men category=by; nasjonal scene | Feil category | `vurder_place_category` | Datafix senere |
| 25 | by→film_tv | sagene | Sagene | by | em_film_tv_location_filmsted | film_tv | Location Filmsted | «Spilles som seg selv i norsk TV», film_location-tag | Dokumentert location | `allowlist_senere` | Batch 33 allowlist (streng) |
| 26 | by→film_tv | sagene | Sagene | by | em_film_tv_byen_som_bilde | film_tv | Byen som Bilde | Sterke lokale fortellinger i kulturproduksjon | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 27 | by→film_tv | sagene | Sagene | by | em_film_tv_sted_identitet | film_tv | Sted Identitet | Sterk lokal identitet, spilles som seg selv | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 28 | by→film_tv | sagene | Sagene | by | em_film_tv_serieformat | film_tv | Serieformat | tv_serier-tag, norsk TV | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 29 | by→film_tv | sagene | Sagene | by | em_film_tv_fiksjon_realisme | film_tv | Fiksjon Realisme | Sosialrealistisk fortellingslandskap | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 30 | by→film_tv | kampen | Kampen | by | em_film_tv_location_filmsted | film_tv | Location Filmsted | «Brukt som fortellingslandskap i film og TV» | Dokumentert location | `allowlist_senere` | Batch 33 allowlist (streng) |
| 31 | by→film_tv | kampen | Kampen | by | em_film_tv_hverdagsfilm | film_tv | Hverdagsfilm | Hverdagsdrama-tag, hverdags-Oslo | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 32 | by→film_tv | kampen | Kampen | by | em_film_tv_fiksjon_realisme | film_tv | Fiksjon Realisme | Sosialrealisme, troverdighet | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 33 | by→film_tv | kampen | Kampen | by | em_film_tv_urban_filmrepresentasjon | film_tv | Urban Filmrepresentasjon | Gjenkjennelig hverdags-Oslo i film | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 34 | by→film_tv | kampen | Kampen | by | em_film_tv_sted_identitet | film_tv | Sted Identitet | Sterk nabolagsidentitet, medforteller | Dokumentert | `allowlist_senere` | Batch 33 allowlist (streng) |
| 35 | pop→film_tv | saga_kino | Saga kino | populaerkultur | em_film_tv_kino_fellesrom | film_tv | Kino Fellesrom | Storbykino, premierevisninger | Korrekt filmlag | `allowlist_senere` | Batch 33 allowlist |
| 36 | pop→film_tv | klingenberg_kino | Klingenberg kino | populaerkultur | em_film_tv_kino_fellesrom | film_tv | Kino Fellesrom | Premierekino ved Nationaltheatret | Korrekt filmlag | `allowlist_senere` | Batch 33 allowlist |
| 37 | pop→film_tv | gimle_kino | Gimle kino | populaerkultur | em_film_tv_kino_fellesrom | film_tv | Kino Fellesrom | Bydelskino på Frogner | Korrekt filmlag | `allowlist_senere` | Batch 33 allowlist |
| 38 | pop→film_tv | vika_kino | Vika kino | populaerkultur | em_film_tv_kino_fellesrom | film_tv | Kino Fellesrom | Sentrumsnær kinoarena | Korrekt filmlag | `allowlist_senere` | Batch 33 allowlist |
| 39 | pop→film_tv | hartvig_nissens_skole_skam | Hartvig Nissens skole (SKAM) | populaerkultur | em_film_tv_location_filmsted | film_tv | Location Filmsted | Sentral SKAM-innspillingslokasjon | Korrekt filmlag | `allowlist_senere` | Batch 33 allowlist |
| 40 | pol→pop | youngstorget | Youngstorget | politikk | em_pop_digital_offentlighet | populaerkultur | Digital offentlighet | Protest/breaking-news-offentlighet | Forsvarbar, men 1 sted | `hold_som_warning` | — |
| 41 | pol→pop | youngstorget | Youngstorget | politikk | em_pop_deltakelse_remix | populaerkultur | Deltakelse og remix | Remix-logikk ikke dokumentert | Svakt belagt | `vurder_emnevalg` | Datafix senere |
| 42 | natur→kunst | lisbon_jardim_botanico | Jardim Botânico de Lisboa | natur | em_kunst_institusjoner_kanon | kunst | Kunstinstitusjoner og kanondannelse | Vitenskapelig botanisk hage; ingen kunstkanon dokumentert | Mismatchet emnevalg | `vurder_emnevalg` | Datafix senere |
| 43 | sub→naer | lisbon_fabrica_braco_de_prata | Fábrica Braço de Prata | subkultur | em_naer_felt_arbeid_verdiskaping | naeringsliv | Næringsliv som arbeid og verdiskaping | Tidligere våpenfabrikk → kulturhus; industriarv tynt utdypet | Tynt belagt; dekket av em_by_transformasjon | `hold_som_warning` | — (evt. datafix) |

### Oppsummert handlingsfordeling

| Anbefalt handling | Antall | Forekomster (#) |
| --- | ---: | --- |
| `allowlist_senere` | 25 | 1,2,3,5,9,11,12,13,14,25–39 |
| `vurder_emnevalg` | 7 | 4,6,15,17,18,41,42 |
| `vurder_place_category` | 6 | 19,20,21,22,23,24 |
| `datafix_senere` | 2 | 7,8 |
| `hold_som_warning` | 3 | 10,16,40 |
| `usikker_manuell` | 0 | — |
| (`hold_som_warning`, evt. datafix) | 1 | 43 |

Merk: `vurder_emnevalg`, `vurder_place_category` og `datafix_senere` er alle
datafix-typer som hører hjemme i en senere datafix-batch, ikke i Batch 33s
allowlist.

## Anbefaling: hvilke par bør inn i Batch 33 som health-allowlist

**Tier A — allowlist trygt i Batch 33 (smale, veldokumenterte par):**

1. **`by → film_tv`** (10 forekomster: Sagene, Kampen). Streng policytekst:
   kun byrom med eksplisitt dokumentert film-/TV-location- eller
   representasjonslag i place-teksten.
2. **`populaerkultur → film_tv`** (5 forekomster: kinoer + SKAM-lokasjon).
   Riktig kategori-policy så lenge film/TV ligger under populærkultur i
   place-data.

**Tier B — allowlist i Batch 33 _etter_ forutgående datafix:**

3. **`by → populaerkultur`** (gruppe 1, de ekte byrommene). Anbefalt allowlist
   med **streng** policytekst, men **først** etter at:
   - de 6 feilkategoriserte popkultur-stedene (#19–24) er datafikset
     (`category: by → populaerkultur`), og
   - de svake trend-/digital-/influencer-koblingene (#4, 6, 7, 8, 15, 16, 17, 18)
     er gjennomgått og evt. fjernet/byttet.

   Dette unngår at allowlisten legitimerer udokumenterte koblinger og demper
   risikoen for at «alle byrom blir for brede popkultursteder».

**Ikke allowlist i Batch 33:**

- `politikk → populaerkultur` (kun 1 sted, 2 emner — for tynt grunnlag).
- `natur → kunst` (mismatchet emnevalg — datafix, ikke allowlist).
- `subkultur → naeringsliv` (1 sted, tynt belagt — hold/datafix).

## Anbefaling: hvilke forekomster bør datafikses senere

| Forekomst | Datafix-type | Forslag |
| --- | --- | --- |
| #19–24 (frognerstranda, grand_hotel, slottsplassen) | `vurder_place_category` | Sett `category: populaerkultur` (de ligger allerede i popkultur-filen og har kun em_pop_-emner) |
| #7, #8 (majorstuen_krysset) | `datafix_senere` | Fjern/bytt udokumentert trend-/digital-kobling |
| #4 (bjorvika film_tv_format), #6 (toyen_torg remix), #15 (barcode influencer), #17–18 (vaterland), #41 (youngstorget remix) | `vurder_emnevalg` | Dokumentér i tekst eller fjern/bytt emne |
| #42 (jardim_botanico kunst) | `vurder_emnevalg` | Bytt til vitenskap-/natur-/historie-emne, eller fjern |
| #43 (fabrica_braco_de_prata naer) | `vurder_emnevalg` (lav prioritet) | Utdyp industriarv i tekst, ellers dekket av em_by_transformasjon |

## Anbefaling: hvilke forekomster bør fortsatt være warnings

- #10 (oslo_s aktualitet_trend), #16 (barcode digital_offentlighet),
  #40 (youngstorget digital_offentlighet) — `hold_som_warning`.
- #43 (fabrica_braco_de_prata) — `hold_som_warning` inntil emnevalg avklart.
- Alle forekomster merket `vurder_emnevalg`/`vurder_place_category`/`datafix_senere`
  forblir warnings inntil de faktisk datafikses i en senere batch.

## Vurdering: bør `film_tv` være egen place category?

**Dagens situasjon:** Film-/TV-stedene ligger i `data/places/film/oslo/`, men har
`category: "populaerkultur"`. Health-scriptets `CATEGORY_EMNE_PREFIXES` har
allerede både `film` og `film_tv` mappet til `em_film_tv_`, så infrastrukturen
for en egen film-kategori finnes teknisk, men brukes ikke i place-data i dag.

**Argumenter for egen `film`/`film_tv` place category:**

- Filstien `film/oslo/` signaliserer allerede en egen film-domeneintensjon.
- `em_film_tv_`-emner brukes både på byrom (Sagene/Kampen som location) og på
  populærkultursteder (kinoer/SKAM) — et eget filmdomene ville gjort dette
  tydeligere.
- Hvis kinoene/SKAM-lokasjonen fikk `category: film`/`film_tv`, ville de 5
  `populaerkultur→film_tv`-warnings forsvinne via category-justering uten
  allowlist.

**Argumenter for å beholde film/TV under populærkultur (status quo):**

- Film/TV er redaksjonelt en del av populærkulturfeltet, og place-data bruker i
  dag konsekvent `category: populaerkultur` for disse stedene.
- Byrommene Sagene/Kampen skal uansett forbli `category: by` — film er deres
  sekundærlag, ikke deres kategori. En egen filmkategori løser ikke
  `by→film_tv`.
- Å innføre en ny place category er en strukturell datamodell-endring som rører
  ved manifest, index og UI-forventninger.

**Anbefaling:** Behold film/TV under `populaerkultur` i place-data **i denne og
neste batch**. Allowlist `populaerkultur→film_tv` og `by→film_tv` i Batch 33 som
kortsiktig, ikke-destruktiv løsning. Sett opp en **egen senere kategori-policybatch**
(f.eks. Batch 34) som tar den strukturelle beslutningen om `film_tv` bør bli egen
place category — den beslutningen rører place-data/category-verdier og hører ikke
hjemme verken her eller i en ren allowlist-batch.

## Anbefalt Batch 33

**Batch 33 — health-allowlist for film-/populærkulturpar (script-/policybatch):**

1. Utvid `ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES` i `tools/placeHealthReport.mjs`:
   - `by`: legg til `film_tv` (Tier A).
   - `populaerkultur`: legg til `film_tv` (Tier A).
   - `by`: legg til `populaerkultur` (Tier B) — **men kun** koordinert med, eller
     etter, datafix-batchen som rydder #19–24 og de svake koblingene.
2. Skriv **streng dokumentert policytekst** i scriptet for hvert nytt par
   (krav om dokumentert location/representasjon hhv. ikon/offentlighet/fellesskap
   i place-tekst).
3. Ikke allowlist `politikk→populaerkultur`, `natur→kunst`,
   `subkultur→naeringsliv`.
4. Forventet effekt hvis kun Tier A allowlistes: wrong-prefix 43 → 28
   (−15), allowlisted 191 → 206. Hvis Tier B også (etter datafix av #19–24):
   ytterligere nedgang.

**Eventuell Batch 34 — kategori-/datafix-batch:** datafiks #19–24
(category-korreksjon), gjennomgå svake emnevalg, og ta stilling til om `film_tv`
skal bli egen place category.

## Bekreftelser

- Ingen filer under `data/places/**` er endret.
- Ingen filer under `data/fag/**` er endret.
- Ingen canonical emne-filer er endret.
- `data/places/places_index.json` er ikke endret.
- `data/places/manifest.json` er ikke endret.
- Ingen `emne_ids` er endret.
- Ingen `category`-verdier er endret.
- Ingen scripts/tools er endret (`tools/placeHealthReport.mjs` urørt).
- Ingen UI, CSS, HTML, JS eller assets er endret.
- Ingen alias-schema, blind prefix-rewrite eller datafix er innført.
- Wrong-prefix count er **ikke** redusert i denne batchen (forblir 43).
- Eneste endring i denne batchen er opprettelsen av denne rapportfilen.

## Validering (kjørt i denne batchen)

- `npm run places:emner:check`: exit code 0; Missing 0, Unknown 0, alle duplikater 0.
- `npm run places:index:check`: `places_index.json is in sync with source place files.`
- `npm run health:places`: Errors 0, Unknown emne_ids 0, Wrong-prefix 43,
  Allowlisted cross-disciplinary 191, Warnings 1060.
