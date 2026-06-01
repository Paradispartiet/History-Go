# Batch 30 — redaksjonell godkjenning av tverrfaglige `emne_ids`

**Dato:** 2026-06-01

## Formål og avgrensning

Denne batchen er en redaksjonell policy-/godkjenningsrapport for de **225** wrong-prefix-forekomstene som Batch 29 anbefalte som:

- `Anbefalt handling`: `behold_tverrfaglig`
- `Anbefalt senere batch-type`: `redaksjonell_godkjenning`

Dette er **ikke** en datafix-batch. Rapporten endrer ikke place-data, canonical emne-filer, manifest, index, scripts/tools, UI eller assets. Wrong-prefix warning count skal derfor ikke reduseres i denne batchen.

## Kommandoer kjørt

- `npm run places:emners:check` — finnes ikke; npm returnerte missing-script og foreslo `places:emner:check`.
- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `node /tmp/parse29.mjs` — read-only parsing av Batch 29-tabellen for å telle de 225 `behold_tverrfaglig` / `redaksjonell_godkjenning`-forekomstene per prefix-par, place-fil og canonical fagfamilie.
- `rg`/`sed`/`python3` — read-only inspeksjon av rapporter, scripts, `package.json` og manifest.
- `git status --short`
- `git diff --stat`

NPM skrev `npm warn Unknown env config "http-proxy"...` før scriptkjøringene. Varslet påvirket ikke exit code for de faktiske valideringsscriptene.

## Filer og scripts undersøkt

- `reports/oslo-place-audit-batch-29-post-policy-wrong-prefix-audit.md`
- `reports/oslo-place-audit-batch-28-health-prefixpolicy-legacy-prefixes.md`
- `reports/oslo-place-audit-batch-27-wrong-prefix-decision-audit.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/places/manifest.json`
- Alle 40 aktive place-filer deklarert i manifest.
- Alle canonical emne-filer under `data/fag/**/emner_*_canonical_v4_5.json` brukt av health-scriptet, samt domain matrix-/pensum-filer som health-scriptet også legger i canonical registry.

## Valideringsbaseline

### Emne-id-gate: fortsatt grønn

`npm run places:emner:check` hadde exit code 0.

```text
=== Place emne_id validation ===
Active place files: 40
Canonical emne files scanned: 15
Canonical emne ids loaded: 995

Missing emne_ids: 0

Duplicate emne_ids within same place: 0

Duplicate place ids across active files: 0

Duplicate canonical emne_ids across canonical files: 0
```

Bekreftelse:

- Missing emne_ids: **0**
- Unknown/missing canonical emne_ids i gate-scriptet: **0**
- Duplicate emne_ids within same place: **0**
- Duplicate place ids across active files: **0**
- Duplicate canonical emne_ids across canonical files: **0**

### Places-index: fortsatt grønn

`npm run places:index:check` hadde exit code 0.

```text
places_index.json is in sync with source place files.
```

### Batch 28-prefixpolicy: fortsatt baseline

Batch 28 er fortsatt policybaseline for health-scriptet:

- `naeringsliv` tillater både `em_naering_` og canonical legacy-prefix `em_naer_`.
- `psykologi` tillater både `em_psykologi_` og canonical legacy-prefix `em_psy_`.
- Gjenværende wrong-prefix warnings etter Batch 28 er derfor ikke legacy-prefix-støy, men reelle tverrfaglige/manuelle vurderinger.

### `health:places` baseline

`npm run health:places` hadde exit code 0.

```text
History Go PlaceHealthReport
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1051
Canonical emne_ids: 1051
Unknown emne_ids: 0
Wrong-prefix emne_ids: 234
Errors: 0
Warnings: 1251
```

Bekreftelse:

- Errors: **0**
- Unknown emne_ids: **0**
- Wrong-prefix emne_ids: **234**
- Warnings: **1251**
- Wrong-prefix count er **ikke** redusert i denne batchen.

## Omfang vurdert fra Batch 29

| Målepunkt | Antall |
| --- | ---: |
| Gjenværende wrong-prefix forekomster etter Batch 28-policy | 234 |
| Forekomster vurdert i Batch 30 (`behold_tverrfaglig` + `redaksjonell_godkjenning`) | 225 |
| Utenfor Batch 30-scope fra Batch 29 (`vurder_place_category` / `usikker_manuell`) | 9 |

## Redaksjonell beslutningsoppsummering

| Beslutning | Antall forekomster |
| --- | ---: |
| `godkjenn_som_tverrfaglig` | 191 |
| `godkjenn_med_forbehold` | 34 |
| `krever_senere_manuell_gjennomgang` | 0 |
| `bør_ikke_godkjennes_som_gruppe` | 0 |
| **Sum vurdert** | **225** |

**Tolkning:** Ingen av de 225 Batch 29-anbefalte `behold_tverrfaglig`-forekomstene bør fjernes eller blind-rewrites som gruppe. De fleste kan godkjennes som tydelige tverrfaglige stedslag. To grupper — `by→populaerkultur` og `by→film_tv` — bør godkjennes med forbehold fordi de også reiser et kategori-/policyspørsmål for film/populærkultur i byrom.

## Redaksjonelle prinsipper for tverrfaglige `emne_ids`

Tverrfaglige `emne_ids` kan godkjennes når de:

- gir stedlig presisjon,
- styrker quiz- og læringsverdi,
- forklarer et dokumenterbart sekundærlag ved stedet,
- ikke svekker primærkategoriens identitet,
- ikke bare er brukt for å fylle ut flere emner.

Tverrfaglige `emne_ids` bør ikke godkjennes når:

- koblingen virker tilfeldig,
- emnet ikke forklares av stedsteksten,
- emnet bare tilhører en annen kategori uten stedlig begrunnelse,
- koblingen heller bør løses ved å endre place category,
- koblingen egentlig er et feilvalgt emne.

## Gruppevis redaksjonell vurdering

### Store grupper som kan godkjennes samlet

#### `natur→by` — 34 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:**
  - `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json`
  - `data/places/natur/oslo/places_oslo_alna.json`
  - `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`
  - `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
- **Canonical fagfamilier brukt:** `by` (`data/fag/by/emner_by_canonical_v4_5.json`)
- **History Go-verdi:** Naturstedene har tydelige blågrønne og urbane lag: parker, elveløp, vannpromenader, grøntrom som sosial infrastruktur, byøkologi, mobilitet og offentlig rom. Slike koblinger gjør naturstedene mer stedsspesifikke og gir bedre quizspørsmål om hvordan natur faktisk brukes i byen.
- **Risiko:** For bred allowlisting kan skjule tilfeller der et rent natursted får by-emner uten stedlig forklaring. Koblingen bør fortsatt forutsette tekstlig begrunnelse om byrom, parkbruk, urban økologi eller infrastruktur.
- **Senere allowlist-policy:** Ja, som kategori-par-policy for `natur→by` når emnene handler om blågrønn struktur, park/offentlig rom, vann, mobilitet eller urban metabolisme.
- **Bør forbli health-warning nå:** Ja, inntil Batch 31 eventuelt innfører eksplisitt allowlist-policy.
- **Datafix senere:** Ikke som gruppe. Bare enkeltforekomster bør vurderes hvis stedstekst ikke forklarer bylaget.

#### `litteratur→by` — 30 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:** `data/places/litteratur/oslo/places_litteratur.json`
- **Canonical fagfamilier brukt:** `by` (`data/fag/by/emner_by_canonical_v4_5.json`)
- **History Go-verdi:** Litterære steder er ofte stedfestet gjennom statuer, minneplaketter, bibliotek, bokhandel, torg, plasser og offentlige møtepunkt. By-emnene forklarer hvordan litteratur blir synlig i hverdagsrom og offentlig minnekultur.
- **Risiko:** Koblingen kan bli for generell dersom alle litteratursteder automatisk får by-emner. Den bør være knyttet til faktisk byromsfunksjon, fysisk markør eller offentlig minne.
- **Senere allowlist-policy:** Ja, for litteratursteder med minnespor, bibliotek/bokhandel, torg/plass eller offentlig rom.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `naeringsliv→by` — 28 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:**
  - `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json`
  - `data/places/naeringsliv/oslo/places_naeringsliv.json`
- **Canonical fagfamilier brukt:** `by` (`data/fag/by/emner_by_canonical_v4_5.json`)
- **History Go-verdi:** Handel, havn, logistikk, industri, energi, transportknutepunkt og transformasjon er både næringslivs- og byutviklingshistorie. By-emnene gjør det mulig å knytte verdiskaping til fysisk infrastruktur og urbane systemer.
- **Risiko:** En generell næringsliv→by-policy kan bli for romslig for virksomheter uten byformende betydning. Koblingen bør reserveres for handel, logistikk, havn, infrastruktur, transformasjon eller urban metabolisme.
- **Senere allowlist-policy:** Ja.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `historie→by` — 25 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:**
  - `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json`
  - `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`
- **Canonical fagfamilier brukt:** `by` (`data/fag/by/emner_by_canonical_v4_5.json`)
- **History Go-verdi:** Historiske steder handler ofte også om byrom, infrastruktur, vann, industri, mobilitet, materialitet og symbolsk makt. By-emnene gjør historiske lag mer spillbare fordi de kobler fortid til dagens fysiske by.
- **Risiko:** Kan bli overlappende med rene historie-emner hvis bylaget ikke er spesifikt. Godkjenning bør forutsette at byemnet gir ekstra stedlig forklaring.
- **Senere allowlist-policy:** Ja.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `naeringsliv→historie` — 13 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:**
  - `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json`
  - `data/places/naeringsliv/oslo/places_naeringsliv.json`
- **Canonical fagfamilier brukt:** `historie` (`data/fag/historie/emner_historie_canonical_v4_5.json`)
- **History Go-verdi:** Industri, bryggerier, verksteder, fabrikker og institusjonell økonomi er historiske spor etter arbeid, produksjon og statlig/kommunal organisering. Historie-emnene gir dybde til næringslivsstedene.
- **Risiko:** Næringslivssteder med bare nåtidsøkonomisk funksjon bør ikke automatisk få historie-emner.
- **Senere allowlist-policy:** Ja, for dokumenterte industri-, arbeid-, produksjons- og institusjonshistoriske steder.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `politikk→historie` — 11 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:** `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json`
- **Canonical fagfamilier brukt:** `historie` (`data/fag/historie/emner_historie_canonical_v4_5.json`)
- **History Go-verdi:** Politiske institusjoner, revolusjonssteder, monumenter og nasjonale minnesteder har historiske lag som er nødvendige for å forstå den politiske betydningen. Historie-emnene styrker læring om demokratisering, institusjoner, kriser og minnebruk.
- **Risiko:** Historie-emner må ikke gjøre at dagens politiske funksjon forsvinner som primæridentitet.
- **Senere allowlist-policy:** Ja.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `by→kunst` — 9 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:** `data/places/by/oslo/places_by.json`
- **Canonical fagfamilier brukt:** `kunst` (`data/fag/kunst/emner_kunst_canonical_v4_5.json`)
- **History Go-verdi:** Byrom som Barcode, Tjuvholmen og Vigelandsparken har sterke kunst-, monument-, arkitektur- og institusjonslag. Kunst-emnene forklarer hvordan offentlig kunst og visuell kultur former byopplevelsen.
- **Risiko:** Byrom uten tydelig kunst-/monumentlag bør ikke omfattes.
- **Senere allowlist-policy:** Ja, men snevert: offentlig kunst, kunstinstitusjoner, monumenter, arkitektur/materialitet og kunst som byidentitet.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `natur→historie` — 7 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:**
  - `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json`
  - `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
- **Canonical fagfamilier brukt:** `historie` (`data/fag/historie/emner_historie_canonical_v4_5.json`)
- **History Go-verdi:** Botaniske hager, utsiktspunkter, øyer og historiske parker har kulturminner, institusjonshistorie, minnebruk og bevaring som forklarer hvorfor naturstedet er historisk relevant.
- **Risiko:** Historie-emner må knyttes til dokumenterte historiske lag, ikke bare alder eller generell atmosfære.
- **Senere allowlist-policy:** Ja, for natursteder med kulturminne-, institusjons-, bevarings- eller minnelag.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `subkultur→by` — 7 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:** `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
- **Canonical fagfamilier brukt:** `by` (`data/fag/by/emner_by_canonical_v4_5.json`)
- **History Go-verdi:** Subkulturelle scener oppstår i konkrete bydeler, gater, møteplasser og transformerte bygg. By-emnene forklarer gentrifisering, lavterskel møteplasser og ombruk som ramme for subkultur.
- **Risiko:** Gentrifiserings- og møteplass-emner bør ikke brukes som generiske byord uten tekstlig stedskontekst.
- **Senere allowlist-policy:** Ja, men med krav om scene-, gate-, område- eller transformasjonsbegrunnelse.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

#### `historie→kunst` — 6 forekomster

- **Beslutning:** `godkjenn_som_tverrfaglig`
- **Berørte place-filer:** `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json`
- **Canonical fagfamilier brukt:** `kunst` (`data/fag/kunst/emner_kunst_canonical_v4_5.json`)
- **History Go-verdi:** Palasser, museer, klostre, stasjoner og historiske institusjoner har kunsthistoriske, finansielle og kanoniserende lag. Kunst-emnene gir bedre forklaring av materialitet og samlings-/institusjonshistorie.
- **Risiko:** Kunst-emner bør ikke brukes der kunst kun er dekorasjon uten historisk relevans.
- **Senere allowlist-policy:** Ja, for historiske steder med tydelig kunstinstitusjon, samling, epoke eller materialitet.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe.

### Film-/populærkultur-policy: godkjent med forbehold

#### `by→populaerkultur` — 24 forekomster

- **Beslutning:** `godkjenn_med_forbehold`
- **Berørte place-filer:**
  - `data/places/by/oslo/places_by.json`
  - `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- **Canonical fagfamilier brukt:** `populaerkultur` (`data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`)
- **History Go-verdi:** Flere byrom fungerer som ikoniske offentligheter, trendsteder, felleskulturelle møtepunkter og digitale/offentlige referanseflater. Populærkultur-emnene gjør slike steder relevante for samtidskultur og quiz om hvordan byen brukes og representeres.
- **Risiko:** Dette er den tydeligste gruppen der omfanget kan bli for bredt. Populærkultur kan gli fra stedlig forklaring til generell aktualitetsmarkør dersom stedsteksten ikke dokumenterer ikonstatus, publikumsrytme, trend, felleskultur eller digital offentlighet.
- **Senere allowlist-policy:** Ja, men med strengere kriterier enn `natur→by`: bare ikoniske byrom, tydelig offentlig felleskultur, dokumentert trend-/publikumsbruk eller digital offentlighetsfunksjon.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe, men enkeltforekomster bør kunne tas i en senere datagjennomgang hvis popkultur-emnet ikke forklares.
- **Kategori-policy:** Bør inngå i en egen film-/populærkultur-policy sammen med `by→film_tv` og Batch 29s `populaerkultur→film_tv`-spørsmål.

#### `by→film_tv` — 10 forekomster

- **Beslutning:** `godkjenn_med_forbehold`
- **Berørte place-filer:** `data/places/by/oslo/places_by.json`
- **Canonical fagfamilier brukt:** `film_tv` (`data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`)
- **History Go-verdi:** Kampen og Sagene kan forstås som bymiljøer, film-/TV-locations og visuelle representasjoner av hverdagsby. Film-/TV-emnene styrker læring om hvordan steder brukes som bilde, location og identitetsmarkør.
- **Risiko:** Dette ligger nær kategori-policy: dersom film-/TV-laget er dominerende, kan stedet eller underutvalget høre hjemme i film-/TV-policy heller enn som generell byallowlist. Samtidig er bykategori fortsatt meningsfull når film-/TV-laget dokumenterer et sekundærlag ved bymiljøet.
- **Senere allowlist-policy:** Ja, men bare for bysteder der location-/representasjonslaget er eksplisitt i stedstekst.
- **Bør forbli health-warning nå:** Ja.
- **Datafix senere:** Ikke som gruppe. Eventuell senere policybatch bør vurdere om noen forekomster bør flyttes til film-/TV-kategori eller beholde bykategori med allowlist.
- **Kategori-policy:** Bør behandles sammen med `by→populaerkultur` og `populaerkultur→film_tv`.

## Små/usikre grupper

Disse gruppene er små, men innenfor Batch 29s `behold_tverrfaglig`-scope. De godkjennes ikke fordi de er store mønstre, men fordi hver gruppe har en tydelig sekundærfaglig stedlogikk.

| Prefix-par | Antall | Berørte place-filer | Canonical fagfamilier | Beslutning | Policy-/datafix-notat |
| --- | ---: | --- | --- | --- | --- |
| `by→historie` | 5 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | `historie` | `godkjenn_som_tverrfaglig` | Historiske bydeler og byrom trenger kulturminne-, minnebruks- og minoritetshistoriske lag. Kan allowlistes snevert senere. |
| `kunst→by` | 4 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | `by` | `godkjenn_som_tverrfaglig` | Kunstinstitusjoner i havne-/transformasjonsområder har tydelig byutviklingslag. Ikke datafix som gruppe. |
| `politikk→by` | 4 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | `by` | `godkjenn_som_tverrfaglig` | Politiske plasser uttrykker symbolsk makt, planmakt og scene-funksjon. Kan allowlistes senere. |
| `kunst→historie` | 3 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | `historie` | `godkjenn_som_tverrfaglig` | Museer/samlinger med kulturminne-, minoritets- og minnebrukslag. Ikke datafix som gruppe. |
| `subkultur→musikk` | 3 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | `musikk` | `godkjenn_som_tverrfaglig` | Musikksteder og scener er en kjerneform for subkultur. Bør kunne allowlistes for dokumenterte scener/klubber. |
| `subkultur→historie` | 1 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | `historie` | `godkjenn_som_tverrfaglig` | Pink Street har historisk minoritets-/havne-/nattelivslag. Bør ikke bli bred gruppepolicy uten flere eksempler. |
| `subkultur→kunst` | 1 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | `kunst` | `godkjenn_som_tverrfaglig` | ZDB fungerer som kunstinstitusjon og subkulturell scene. Bør behandles som konkret stedstype, ikke generell subkultur→kunst-regel. |

### Utenfor Batch 30-scope, men fortsatt viktig for senere batcher

Batch 29 hadde også 9 forekomster som ikke inngår i de 225 godkjenningsforekomstene:

- `populaerkultur→film_tv`: 5 forekomster, anbefalt `vurder_place_category` / `kategori_policy_batch`.
- `politikk→populaerkultur`: 2 forekomster, anbefalt `usikker_manuell` / `redaksjonell_godkjenning`.
- `natur→kunst`: 1 forekomst, anbefalt `usikker_manuell` / `emnevalg_batch`.
- `subkultur→naeringsliv`: 1 forekomst, anbefalt `usikker_manuell` / `emnevalg_batch`.

Disse bør **ikke** løses i Batch 30. De bør ligge igjen som health warnings og tas i senere policy-/datafixbatcher.

## Forslag til senere health-allowlist-policy

En eventuell Batch 31 kan innføre en eksplisitt, dokumentert health-allowlist for redaksjonelt godkjente prefix-par uten å endre place-data. Anbefalt form:

1. **Allowlist på category→canonical fagfamilie**, ikke blind prefix-rewrite.
2. **Behold canonical existence-sjekk:** missing/unknown skal fortsatt være errors/warnings uavhengig av allowlist.
3. **Behold krav om riktig primærkategori:** allowlist skal bare dempe wrong-prefix-warning for godkjente tverrfaglige sekundærlag, ikke legitimere feil category.
4. **Start med robuste grupper:** `natur→by`, `litteratur→by`, `naeringsliv→by`, `historie→by`, `naeringsliv→historie`, `politikk→historie`, `by→kunst`, `natur→historie`, `subkultur→by`, `historie→kunst`.
5. **Legg film/populærkultur bak forbehold:** `by→populaerkultur` og `by→film_tv` bør enten allowlistes med strengere policytekst eller vente på egen kategori-policy.
6. **Smågrupper:** `by→historie`, `kunst→by`, `politikk→by`, `kunst→historie`, `subkultur→musikk`, `subkultur→historie`, `subkultur→kunst` kan allowlistes senere, men bør dokumenteres ekstra tydelig fordi volumet er lavt.
7. **Rapporter dempet count separat:** Health-scriptet bør eventuelt telle `allowlisted_cross_disciplinary_emne_ids` separat slik at redaksjonelle koblinger fortsatt er synlige, selv om de ikke er warnings.

## Forslag til eventuell senere datafix-batch

Ingen av de 225 forekomstene bør datafikses som gruppe. Senere datafix bør avgrenses til de 9 forekomstene Batch 29 ikke anbefalte som `behold_tverrfaglig`, og eventuelle enkeltforekomster som avdekkes ved manuell tekstlesing:

- Vurder `populaerkultur→film_tv` i en kategori-policybatch: film-/TV-emner kan være riktig sekundærlag, men kan også indikere at category eller policy bør justeres.
- Vurder `politikk→populaerkultur` manuelt: Youngstorget kan ha digital/deltakende offentlighetslag, men bør begrunnes eksplisitt.
- Vurder `natur→kunst` manuelt som mulig feilvalgt emne hvis kunstlaget ikke er dokumentert.
- Vurder `subkultur→naeringsliv` manuelt som mulig emnevalg-/stedstekstspørsmål.

## Anbefalt Batch 31

**Anbefaling:** Batch 31 bør være en script-/policybatch for eksplisitt health-allowlist av redaksjonelt godkjente tverrfaglige `emne_ids`, uten dataendringer.

Foreslått innhold:

1. Innfør dokumentert allowlist i `tools/placeHealthReport.mjs` for godkjente category→canonical-fagfamilie-par.
2. Skill mellom:
   - reelle wrong-prefix warnings,
   - allowlisted cross-disciplinary matches,
   - unknown/missing emne_ids.
3. La allowlist være transparent i health summary.
4. Vurder om film-/populærkultur-parene skal inkluderes i første policy eller holdes til Batch 32 som egen kategori-policy.
5. Ikke endre place-data i samme batch som health-policy innføres.

## Bekreftelse på ikke-endringer

- Ingen filer under `data/places/**` er endret.
- Ingen filer under `data/fag/**` er endret.
- Ingen canonical emne-filer er endret.
- `data/places/places_index.json` er ikke endret.
- `data/places/manifest.json` er ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer er endret.
- Ingen scripts/tools er endret.
- Ingen bilder/assets er endret.
- Ingen `emne_ids`, category-verdier eller place-data er endret.
- Det er ikke innført alias-schema, blind prefix-rewrite eller allowlist i health-scriptet i denne PR-en.

## Endelig konklusjon

De 225 Batch 29-forekomstene med `behold_tverrfaglig` / `redaksjonell_godkjenning` bør redaksjonelt godkjennes som meningsfulle tverrfaglige koblinger i History Go. **191** godkjennes som tydelige tverrfaglige mønstre, og **34** godkjennes med forbehold fordi film-/populærkultur-mønstrene bør få egen kategori-/allowlist-policy før warnings eventuelt dempes.

Batch 30 skal derfor kun dokumentere godkjenningen. Warning count skal fortsatt være **1251**, og wrong-prefix count skal fortsatt være **234**, fram til en senere policybatch eventuelt innfører eksplisitt health-allowlist.
