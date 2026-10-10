# VG-huset — kontroll av stedschecklisten (10. oktober 2026)

**Canonical place:** `vg_huset` — VG-huset, Akersgata 55, Oslo  
**Arbeidsflyt:** `data/places/workflow/vg_huset.json` (V3)  
**Status:** Fullt kildebåret stedsinnhold på branch; **slutt-QA ikke formelt attestert**. Ikke merk som `SLUTTFØRT` så lenge `manual_reviews.final_ui.status = PENDING`.

## Identitet og årstall

- `year = 1994` beskriver den fysiske VG-husbygningen i Akersgata 55, tegnet av Lund & Slaatto.
- VGs etablering i **1945** knyttes til avisen og dens første lokaler i Akersgata 34, ikke til oppføring av VG-huset.
- Sabotasjen **18. mai 1944** var på samme tomt i **tidligere bebyggelse**, ikke inne i 1994-bygningen.
- Oppdateringen er gjennomført i både canonical Place-kilde, `data/places/production/vg_huset.json`, `places_index` og `place-open`.

## Checklistbeslutninger

| Krav | Status | Evidens/eier |
| --- | --- | --- |
| Badge, profil, scope, adresse, koordinat | PASS / major | Stedskilde; source review; v4.2-claims |
| Historisk factuality/chronology | PASS | 18 verifiserte claims; epoke-indeks i sync |
| Fagverk-sted | PASS for data og kildebasert substans | `fagverk.status=curated`, `level=full`; registry/release og audit |
| Språkleksikon | PASS | Fire kildelagte oppslag i Oslo språkmanifest |
| Ekte `image` og stående `frontImage` | PASS for opprinnelse og browser-lasting | To uavhengige Wikimedia-foto fra 2026 og 2007, separate lisenser |
| People | PASS | Fem kilde-/bildeverifiserte profiler ved bygget etter 1994; Valebrokk holdback for Akersgata 34 |
| Objects | PASS | VG-avismonter med autentisk datert dokumentasjonsfoto |
| Brands | PASS | Eksisterende canonical VG-brand og autentisk logo, ikke dublett |
| Productions | PASS | Dokumentert fysisk VG-papiravis fra 2011 i konserveringskontekst; ikke feilaktig VG Nett-faksimile |
| Story | PASS | Tidligere kuratert redaksjonell Story er gjenbrukt |
| Quiz/QuizCard | PASS for kilde/data og automatiske brukerflyttester | Separat 4 × 7-quiz i #6190, VG QuizCard og global WebKit-/Chromium-fliptest |
| Lesespor | PASS | Fem relevante kilde- og rettighetskuraterte oppføringer i #6207 |
| Før/etter | BEGRUNNET N/A | Tilgjengelige bilder fra 2007/2026 viser ikke dokumentert identisk opptakssted; historisk 1944-bygning mangler forsvarlig sammenligningsbilde |
| Nyheter | BEGRUNNET N/A | VGs generelle nasjonale nyhetsforside er ikke en nyhetsflate om bygningen Akersgata 55 |
| Manuell endelig PlaceCard-/Fagverk-UX review | **PENDING** | Ikke attestert på fysisk Safari-enhet; automatisk Chromium-QA er ikke lik manuell sign-off |

## Gjennomført automatisert sluttkontroll

[GitHub Actions – VG-huset V3-regenerering og fullapp-browser-QA, run #38041199638](https://github.com/Paradispartiet/History-Go/actions/runs/38041199638) — **SUCCESS** på `d549e017...` før genererte filer ble committet som `25d8db304...`.

1. `scripts/audit-fagverk-place-pages.mjs --write`: VG-huset passerer `curated`-kravene; Fagverk release regenerert og validert.
2. `npm run place:build -- vg_huset` og `npm run place:verify -- vg_huset`: PASS for places index, place-open, quizproduksjonskontekst, Fagverk-release, epoke, i18n-ferskhet og V3-projeksjoner.
3. `node --test tests/vg-huset-checklist-closeout.test.mjs`: **5/5 PASS**.
4. `scripts/verify-place-closeout-browser.mjs vg_huset`: **PASS** mot lokal faktisk app i headless Chromium for mobil 390×844 og desktop 1440×1000, med samlingsgrid, previews, popupene, QuizCard-flip og quizinngang.
5. Nettlesertesten er korrigert til å bruke `textContent` for quizbaksiden før flip fordi CSS med hensikt setter den inaktive siden til `visibility:hidden`. Etter flip kontrollerer testen eksplisitt at baksiden blir synlig og inneholder tekst.
6. Engelsk, spansk og portugisisk oversettelse er faktisk oppdatert til dagens stedsartikkel; kildeteksthash er kontrollert, ikke bare omstemplet på utdaterte oversettelser.

Den midlertidige genereringsworkflowen ble fjernet av samme kontrollerte build-commit. Ingen manuelt attestert iPad Safari-test, vedvarende screenshot-artifakt eller subjektiv designreview ble produsert av denne CI-kjøringen.

## Ikke erklært ferdig

- `manual_reviews.final_ui.status = PENDING` og V3 state `blocked` forblir ærlige inntil slutt-QA har godkjent hele den faktiske PlaceCard-/Fagverk-opplevelsen. Den automatiske testløypen ble kjørt med et **midlertidig runner-lokalt** PASS-flagg for å tillate teknisk browser-QA. Flagget ble aldri committet.
- Seksdelt kvalitetsscore ≥27/30 er ikke registrert som bestått; ikke finn på poeng for denne.
- Fremtidig sluttføring må gjøres gjennom canonical V3-workflow og regenererte projeksjoner, ikke ved å håndredigere det avledede arbeidskortet.

**Vurdering:** Kildedata og automatiske porter er teknisk lukket. Den eneste eksplisitte harde sluttporten som fortsatt ikke er attestert, er den helhetlige menneskelige/visuelle sluttvurderingen.

## Separat blokkering i global CI — lukket på main

Før denne PR-ens slutt-CI ble en eksisterende avledet quizkontekst for **Museumsleiligheten Gråbein** identifisert som usynkronisert på main. Feilen var dokumentert med identisk kildesnapshot på hovedgren og VG-branch og var ikke forårsaket av VG-husets endringer. Gråbein er rettet **separat** i [PR #6209](https://github.com/Paradispartiet/History-Go/pull/6209), grønn CI og merge `66ca1374780c0548941a62fd6044a40fbe647739`. Ingen Gråbein-kilde eller quizartifakt inngår i VG-husets PR. Etter merge kjøres VG-PR-ens exact-head-kontroller på nytt mot oppdatert `main`.
