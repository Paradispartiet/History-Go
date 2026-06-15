# Place coordinate system – status

Generert manuelt: 2026-06-15 (branch `claude/place-coordinate-audit-lbkil4`)

Denne rapporten undersøker det eksisterende koordinatkvalitetssporet og svarer
på hvorfor steder fortsatt ligger feil på kartet selv om repoet allerede har
koordinatverktøy. Den gjør **ikke** masse-koordinatretting – kun små åpenbare
reparasjoner av selve verktøysporet (se «Reparasjoner gjort i denne PR-en»).

## Konklusjon først (hva må fikses først)

1. **Rotårsaken er data, ikke verktøy.** Verktøyene fungerer. Problemet er at
   ~420 av 504 aktive steder mangler koordinat-metadata (`coordStatus` /
   `coordSource` / `coordPrecisionM`), så quality gate kan ikke verifisere
   posisjon – den degraderer til heuristiske «review candidates».
2. **Koordinat-sporet var ikke koblet inn i `tools:check`.** Verken audit eller
   quality gate kjørte automatisk, så ingenting tvang fersk rapport eller
   stoppet nye filer med dårlige/manglende koordinater. (Fikset her.)
3. **Rapportene var sterkt utdaterte.** Den committede auditen var fra 3. mai
   (30 filer / 310 steder) mot dagens 42 filer / 504 steder. (Regenerert her.)
4. **Neste reelle steg er en egen datarunde** (ikke denne PR-en): generere
   kildekandidater, manuell godkjenning, apply kun `approved=true`, regenerere
   rapporter, rebuild/check `places_index`.

## Koordinatverktøy som finnes

| Verktøy | Hva det gjør | Status |
| --- | --- | --- |
| `tools/audit-place-coordinates.mjs` | Leser aktive manifest-filer, flagger needs_review/conflict/invalid/duplicate via heuristikk. Skriver `reports/place-coordinate-audit.{md,json}`. Exit alltid 0. | Fungerer. Hadde en bug (se under), nå rettet. |
| `tools/place-coordinate-quality-gate.mjs` | Validerer aktive steder: **harde feil** (ugyldig lat/lon/r, ødelagte anchors, manglende filer → exit 1), **varsler** (heuristiske posisjonsrisikoer), **review candidates** (steder uten nok metadata til å stole på punktet). Skriver `reports/place-coordinate-quality-gate.md`. | Fungerer. Var ikke koblet inn i `tools:check` (nå koblet inn). |
| `tools/fetch-place-coordinate-sources.mjs` | Henter eksterne kildekoordinater (kandidater) for verifisering. | Finnes; ikke kjørt i denne PR-en (krever nett + manuell godkjenning). |
| `tools/apply-verified-coordinate-candidates.mjs` | Skriver inn kandidater som er `approved=true` i kildefilene. | Finnes; **skal ikke** kjøres i denne PR-en. |
| `tools/place-coordinate-audit.html` | Visuell QA-side som leser audit-rapporten. | Finnes; avhenger av fersk rapport. |
| `tools/place-coordinate-visual-qa.html` | Visuell QA-side for review candidates. | Finnes; avhenger av fersk rapport. |

`places:index:build` / `places:index:check` / `health:places` (under
`dist/tools/`) hører til det generelle place-sporet, ikke koordinatsporet
spesifikt, men brukes til å verifisere at generert indeks er i synk.

## Hvilke rapporter var stale

| Rapport | Committet generert-dato | Committet tall | Faktisk nå |
| --- | --- | --- | --- |
| `place-coordinate-audit.md/json` | 2026-05-03 | 30 filer / 310 steder | 42 filer / 504 steder |
| `place-coordinate-quality-gate.md` | 2026-06-10 | 36 filer / 440 steder, 5 harde feil | 42 filer / 504 steder, 0 harde feil |

Manifesten ble sist endret 2026-06-14 uten at koordinatrapportene ble
regenerert. Hele Lisboa-utvidelsen, sport-filene og psykologi kom inn etter at
sporet sist ble kjørt. De øvrige `reports/place-coordinate-*` (source-candidates,
refinement-batch, oslo-explicit-patch, manual-review-queue m.fl.) er historiske
arbeidslogger fra tidligere batcher og ikke autoritative for dagens tilstand.

## Tall (regenerert 2026-06-15)

- Aktive place-filer (manifest): **42**
- Aktive steder lest: **504**
- Harde feil (quality gate): **0**
- Varsler (quality gate): **153**
- Review candidates (quality gate): **254** signaler på **184** steder
- Audit-status (etter statusprioriterings-fiks): needs_review **97**,
  outside_expected_area **128**, conflict **2**, duplicate **0**, invalid **0**.
  Tidligere ble alle flaggede rader (unntatt `invalid_anchor`) tvangs-satt til
  needs_review (227), slik at conflict/outside aldri ble talt.

### Review candidates per grunn

| Grunn | Antall |
| --- | --- |
| lav koordinatpresisjon (<4 desimaler) | 87 |
| stasjon/park/gate/torg/elv uten coordinate metadata | 58 |
| lineært sted uten anchors | 37 |
| identisk/nesten identisk lat/lon som annet sted uten forklaring | 25 |
| svært stor r (>=500 m) uten coordNote | 19 |
| park/stort område uten anchors eller coordNote | 16 |
| ligger svært langt fra de andre stedene i samme fil | 10 |
| coordStatus=verified uten coordPrecisionM | 2 |

### coordStatus-dekning (utdrag) – kjernen i problemet

| Fil | coordStatus / steder |
| --- | --- |
| Alle Lisboa-filer (by, historie, kunst, litteratur, musikk, subkultur, naeringsliv, natur, film_tv, media, vitenskap, popkultur, politikk, sport) | **0** av ~160 |
| `sport/europa/norway/oslo_sport.json` | 0 / 15 |
| `sport/europa/norway/places_oslo_lekeplasser_trening.json` | 0 / 15 |
| `sport/europa/norway/places_motorsport_ostlandet.json` | 0 / 11 |
| `sport/europa/england/footballgrounds_london.json` | 0 / 12 |
| `by/oslo/places_by.json` | 0 / 99 |
| `naeringsliv/oslo/places_naeringsliv.json` | 2 / 33 |
| `vitenskap/oslo/places_vitenskap.json` | 1 / 16 |
| `media/oslo/places_oslo_media.json` | 0 / 6 |
| `popkultur/oslo/places_oslo_populaerkultur.json` | 0 / 9 |

Totalt har bare ~80 av 504 steder koordinat-metadata. De best dekkede filene er
`natur/...alnaelva_rute` (8/11) og `subkultur` (12/21).

## Svar på undersøkelsesspørsmålene

- **Er quality gate koblet inn i `tools:check`?** Nei – var ikke koblet inn.
  Nå lagt til via `places:coords:check`.
- **Stopper den bare harde feil?** Ja. Gate exit'er 1 kun ved harde feil
  (formelle koordinatfeil). Varsler og review candidates er rådgivende og
  stopper ingenting. I dag = 0 harde feil, så gaten er grønn selv med 153
  varsler + 254 review-signaler.
- **Har nye place-filer kommet inn uten coordStatus/coordSource/coordPrecisionM?**
  Ja, massivt – hele Lisboa- og sport-batchene har 0 coordStatus.
- **Har nye sport/europa-filer bypasset eldre Oslo-spesifikke patcher?** Ja.
  De eldre `oslo-explicit-patch` / `oslo-geometry-fix`-batchene gjaldt
  Oslo-kjernen; sport- og Lisboa-filene ble lagt til etterpå uten å gå gjennom
  samme verifisering.
- **Er rapportene committed men ikke regenerert etter manifestendringer?** Ja
  (se staleness-tabell).
- **Er visual QA avhengig av utdatert rapport?** Ja – `place-coordinate-audit.html`
  og `place-coordinate-visual-qa.html` leser rapportfilene; med stale rapport
  viste de et 5 uker gammelt bilde.
- **Er noen steder «riktige nok» etter heuristikken, men likevel visuelt feil?**
  Sannsynlig – heuristikken fanger presisjon/metadata, ikke om punktet faktisk
  treffer riktig bygning/inngang. Det krever manuell kartkontroll.

## Files/path-problemer i manifest

- Alle 42 filer i `data/places/manifest.json` finnes på disk (ingen brutte paths).
- `places_index.json` er i synk med kildefilene (`places:index:check` grønn).
- **Bug funnet og rettet:** auditen filtrerte aktive manifest-filer gjennom
  `isBackupLike`, hvis regex `/historisk/i` ga falsk treff på
  `vitenskap/oslo/places_vitenskap_historiske_institusjoner.json`. Auditen
  droppet derfor 1 fil / 2 steder (telte 41/502 mot gatens 42/504). Nå leser
  begge verktøy samme aktive sett (42/504).

## Mest kritiske steder (sannsynlig feil – prioriter i datarunden)

«Langt fra fil-median» er ofte **riktige** data filed under Oslo-navngitte
stier (Eidsvoll, motorsport på Østlandet, Tvergastein) – ikke nødvendigvis
feilplassering, men de bør få `coordStatus`/`coordNote` så de slutter å
flagges. De reelle risikoene er lav presisjon + manglende metadata i tette
sentrumsområder der små feil flytter punktet til feil kvartal:

- `by/oslo/places_by.json`: store, metadataløse sentrumssteder – `karl_johan`,
  `torggata`, `storgata`, `jernbanetorget`, `radhusplassen`, `akerselva`
  (linær/område uten anchors).
- Lav presisjon (<4 desimaler) på 87 steder, bl.a. `ring_3`, `trikk_17_18`,
  `tjuvholmen`, `barcode`, `vigelandsparken`, `klassekampen_redaksjon`.
- Hele Lisboa-settet: 0 verifiserte koordinater – bør verifiseres samlet.
- Sport-filene: 0 coordStatus; flere baner med stor r uten coordNote.

Se `reports/place-coordinate-quality-gate.md` for full liste per grunn og
`reports/place-coordinate-audit.md` for alle flaggede steder.

## Reparasjoner gjort i denne PR-en (kun verktøyspor)

1. `tools/audit-place-coordinates.mjs`: aktive manifest-filer filtreres ikke
   lenger på `isBackupLike` (manifesten er sannhetskilden). Audit og gate leser
   nå samme 42/504.
2. `package.json`: nye scripts `places:coords:audit`, `places:coords:gate`,
   `places:coords:check`, og `places:coords:check` lagt inn i `tools:check` så
   koordinatsporet kjører og rapportene holdes ferske.
3. Regenererte `reports/place-coordinate-audit.{md,json}` og
   `reports/place-coordinate-quality-gate.md`.

Ingen koordinatdata er endret, ingen kartkode/UI rørt, `places_index.json` ikke
hånd-patchet.

## Oppfølgingsfiks (status-prioritering i audit)

PR #1338 reparerte koordinatverktøysporet, men audit-scriptet hadde fortsatt en
status-bug: et separat `if (invalid_anchor) … else if (r.flags.length) …`-ledd
overskrev alle flaggede rader (unntatt `invalid_anchor`) til `needs_review`
etter at conflict/duplicate/outside allerede var satt. Derfor kunne rapporten
vise `conflict: 0` selv om rader hadde konfliktflagg som
`same_name_different_coord`.

Rettelse: statusklassifiseringen i `tools/audit-place-coordinates.mjs` er nå én
prioriteringskjede – invalid (inkl. `invalid_anchor`) > conflict > duplicate >
outside_expected_area > needs_review > ok – uten utilsiktet overskriving.

Endrede tall etter regenerering: conflict **0 → 2** (`blaa`/`bla` «Blå» med
`same_name_different_coord`), outside_expected_area **0 → 128**, needs_review
**227 → 97**. `highPriorityFindings` inkluderer nå conflict-radene. Ingen
koordinatdata er endret.

## Foreslått neste datarunde (egen PR)

1. `node tools/fetch-place-coordinate-sources.mjs` for å generere kildekandidater
   (prioriter Lisboa + sport + lav-presisjons-sentrum).
2. Manuell godkjenning av kandidater (sett `approved=true` kun for verifiserte).
3. `node tools/apply-verified-coordinate-candidates.mjs` – kun `approved=true`.
4. Regenerere `places:coords:check`-rapportene.
5. `npm run places:index:build` + `npm run places:index:check`.
6. `npm run health:places` for restkontroll.
