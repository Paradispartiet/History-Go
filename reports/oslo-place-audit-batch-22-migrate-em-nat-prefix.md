# Oslo Place Audit — Batch 22: Migrer `em_nat_*` til `em_natur_*`

**Dato:** 2026-05-31

**Gren:** `claude/batch-22-em-nat-migration-DzBZA`

## Mål

Migrere de gjenværende legacy `em_nat_*`-emne_id-referansene i natur-place-data til eksisterende
kanoniske `em_natur_*`-mål. Dette er en ren PLACE-migrasjon: ingen filer under `data/fag/**` er
endret, ingen kanoniske emne-oppføringer er opprettet, og ingen alias-schema er innført.

## Kommandoer kjørt

```
git status --short
git checkout -- data/places/
npm run places:emner:check        (før og etter)
npm run places:index:check
npm run health:places
node -e "JSON.parse(...)"          (validering av JSON i hver redigert fil)
git diff --stat / git status
```

## Filer undersøkt

- `data/places/natur/oslo/places_oslo_alna.json`
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
- `data/fag/natur/emner_natur_canonical_v4_5.json` (kun lest, for å bekrefte at målene finnes)

## Hvilke `em_nat_*` var missing før batchen

Det ble funnet **fem** legacy `em_nat_*`-forekomster (ikke fire, som enkelte notater anga),
fordelt på **to** unike legacy-IDer:

| # | Legacy-ID | Place | Fil |
|---|---|---|---|
| 1 | `em_nat_by_natur_motepunkt` | alnaelva | `data/places/natur/oslo/places_oslo_alna.json` |
| 2 | `em_nat_by_natur_motepunkt` | gressholmen | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| 3 | `em_nat_okologi_grenser` | gressholmen | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| 4 | `em_nat_by_natur_motepunkt` | maerradalen | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| 5 | `em_nat_okologi_grenser` | maerradalen | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |

**Diskrepans-notat:** Enkelte tidligere notater anga fire forekomster. I praksis hadde også
**maerradalen** `em_nat_okologi_grenser` i tillegg til `em_nat_by_natur_motepunkt`. Det gir totalt
**fem** legacy-forekomster, ikke fire.

## Berørte place-IDer

- `alnaelva`
- `gressholmen`
- `maerradalen`

## Gamle IDer migrert og nye `em_natur_*`-mål

### alnaelva (`places_oslo_alna.json`)

| Gammel ID | Ny ID |
|---|---|
| `em_nat_by_natur_motepunkt` | `em_natur_urban_okologi_byrom` |

### gressholmen (`places_oslo_natur_hovedsteder.json`)

| Gammel ID | Ny ID |
|---|---|
| `em_nat_by_natur_motepunkt` | `em_natur_kyst_okosystemer` |
| `em_nat_okologi_grenser` | `em_natur_arter_habitat_mangfold` |

### maerradalen (`places_oslo_natur_hovedsteder.json`)

| Gammel ID | Ny ID |
|---|---|
| `em_nat_by_natur_motepunkt` | `em_natur_gronnstruktur_korridorer` |
| `em_nat_okologi_grenser` | `em_natur_arter_habitat_mangfold` |

## Begrunnelse per place (med sitat fra place-innhold)

- **alnaelva** — `popupDesc`: *"Alnaelva er Oslos lengste elv og går gjennom områder med tung
  industrihistorie, tett bebyggelse og nyere restaurering av blågrønne korridorer ... eksempel på
  hvordan byutvikling, miljøforvaltning og lokalhistorie møtes i ett vassdrag."* Dette er en
  restaurert byelv der naturen møter den tette byen, og `em_natur_urban_okologi_byrom` fanger
  nettopp møtet mellom urban økologi og byrom. (Stedets vannmiljø dekkes allerede av andre emner;
  korridor-aspektet bæres av `em_by_klima_blagronn_klimatilpasning`.)

- **gressholmen** — `desc`/`popupDesc`: *"Fjordøy ... med rikt fugle- og planteliv og fredede
  naturkvaliteter ... tydelige naturkvaliteter og et rikt fugleliv i indre Oslofjord ... hvordan
  øya inngår i fjordens grønne belte."* Som fjord-/kystlokalitet migreres «by-natur-møtepunkt» til
  `em_natur_kyst_okosystemer` (kystens/fjordens økosystemer), og «økologi-grenser» til
  `em_natur_arter_habitat_mangfold` (det rike fugle- og plantelivet / artsmangfoldet på øya).

- **maerradalen** — `popupDesc`: *"Mærradalen er et dalføre med bekk, skog og sammenhengende
  grønnstruktur ... fungerer som nærnatur for flere bydeler og som korridor mellom høyere
  skogsområder og lavere bebyggelse."* «By-natur-møtepunkt» migreres til
  `em_natur_gronnstruktur_korridorer` (den eksplisitte korridorfunksjonen i grønnstrukturen), og
  «økologi-grenser» til `em_natur_arter_habitat_mangfold` (arts- og habitatmangfold i bekkekløften).

## Bekreftelser

- **Alle nye `em_natur_*`-mål finnes i canonical natur-fil.** Verifisert i
  `data/fag/natur/emner_natur_canonical_v4_5.json`: `em_natur_urban_okologi_byrom` (22 referanser),
  `em_natur_kyst_okosystemer` (1), `em_natur_arter_habitat_mangfold` (25) og
  `em_natur_gronnstruktur_korridorer` (15) finnes alle. `places:emner:check` etter redigering viser
  ingen manglende `em_natur_*`-mål.
- **Ingen duplicate `emne_ids` laget.** Ingen av de tre stedene hadde mål-IDene fra før; sjekken
  rapporterer «Duplicate emne_ids within same place: 0».
- **Ingen `data/fag/**` endret.** Kun de to place-filene er modifisert (se `git diff --stat`).
- **Alias-schema ikke innført.** Migrasjonen er ren token-erstatning av emne_id-strenger.

## Før/etter — `npm run places:emner:check`

- **Før:** `Missing emne_ids: 14`.
- **Etter:** `Missing emne_ids: 10`. **0** gjenværende `em_nat_*`-forekomster i place-data.

**Telle-merknad:** Selve `em_nat_*`-restansen fysisk i place-filene var **fem** forekomster (2 unike
IDer), se tabellen øverst. `places:emner:check` rapporterer derimot per unik `(place_id, emne_id)`,
og listet i baseline kun **fire** em_nat-rader (maerradalen sin `em_nat_okologi_grenser` ble ikke
talt som egen rad). Derfor faller verktøyets totale «Missing emne_ids» fra 14 til 10 (ikke til 9)
selv om alle fem fysiske forekomster er migrert og 0 `em_nat_*` gjenstår i dataene. Verifisert med
`grep`: 0 `em_nat_by_natur_motepunkt`/`em_nat_okologi_grenser` igjen under `data/places/`.

Gjenværende 10 manglende (ikke-natur familier, utenfor scope for denne batchen):

| # | place_id | emne_id | Fil |
|---|---|---|---|
| 1 | havnelageret | `em_naering_logistikk_handel_flyt` | naeringsliv/oslo/places_naeringsliv.json |
| 2 | havnelageret | `em_naering_lager_terminal_infrastruktur` | naeringsliv/oslo/places_naeringsliv.json |
| 3 | tollbukaia | `em_naering_havn_sjofart` | naeringsliv/oslo/places_naeringsliv.json |
| 4 | tollbukaia | `em_naering_logistikk_handel_flyt` | naeringsliv/oslo/places_naeringsliv.json |
| 5 | telegrafbygningen | `em_naering_telekom_infrastruktur` | naeringsliv/oslo/places_naeringsliv.json |
| 6 | telegrafbygningen | `em_naering_modernisering_teknologi` | naeringsliv/oslo/places_naeringsliv.json |
| 7 | jernbaneverkstedet_lodalen | `em_naering_transport_infrastruktur` | naeringsliv/oslo/places_naeringsliv.json |
| 8 | lisbon_assembleia_da_republica | `em_pol_makt_institusjoner` | politikk/europe/portugal/lisbon/places_lisbon_politikk.json |
| 9 | lisbon_largo_do_carmo | `em_pol_makt_institusjoner` | politikk/europe/portugal/lisbon/places_lisbon_politikk.json |
| 10 | lisbon_museu_nacional_do_azulejo | `em_kunst_materialitet_teknikk_handverk` | kunst/europe/portugal/lisbon/places_lisbon_kunst.json |

> Merk: Disse 10 avviker fra tidligere antakelser om `em_naturhistorie_landformer_istid`
> (noklevann), `em_kunst_*` (ekebergparken) og `em_pol_*` (stortinget); den faktiske gjenværende
> restanselisten er fanget her (em_naering ×7 rader, em_pol ×2 rader, em_kunst ×1 rad).

## Resultat — `npm run places:index:check`

```
[places:index:check] OK - 211 entries, index in sync.
```

Ingen drift; `data/places/places_index.json` ble **ikke** endret (inneholder ikke emne_ids).

## Resultat — `npm run health:places`

```
[places:health] OK - 211 places, 0 errors, 0 warnings.
```

**Errors: 0.**

## Anbefalt Batch 23

Håndter gjenværende ikke-natur manglende IDer, **én fagfamilie per batch**:

1. **naering** — `em_naering_*`-klyngen i `data/places/naeringsliv/oslo/places_naeringsliv.json`
   (havnelageret, tollbukaia, telegrafbygningen, jernbaneverkstedet_lodalen): logistikk/handel,
   lager/terminal, havn/sjøfart, telekom, modernisering, transport-infrastruktur. Mappes til
   eksisterende kanoniske `em_naering_*`-IDer.
2. **pol** — `em_pol_makt_institusjoner` for Lisboa-stedene (assembleia_da_republica, largo_do_carmo)
   i `places_lisbon_politikk.json`.
3. **kunst** — `em_kunst_materialitet_teknikk_handverk` for lisbon_museu_nacional_do_azulejo i
   `places_lisbon_kunst.json`.

Anbefalt å starte med naering-familien (flest forekomster), deretter pol og kunst, én familie per
batch.
