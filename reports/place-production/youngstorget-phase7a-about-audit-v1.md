# Youngstorget – fase 7A Om audit v1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline: `main` etter fase-7-audit PR #5228 / `7b257c603f53141862eff19a7b9e1d28b8d2fb75`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase-5 popupDesc og fase-6 spatial_profile er canonical, kildebårne og synlige gjennom eksisterende popup-runtime
KONKRET REGRESJONSEVIDENS: ingen brukerrettet Youngstorget-Leksikonpost konkurrerer med popupDesc; spatial_profile har renderer; temporal_profile overlapper Historie-eid innhold
BESLUTNING: ALLEREDE FERDIG – lås bevarings- og runtimegrensene uten å produsere parallell tekst eller tidslinje
```

## Om-flaten som faktisk finnes

Youngstorgets Om-fane har allerede to substansielle, place-eide lag:

1. fase-5 `popupDesc` som hovedartikkel, med 26/26 setninger claim-dekket;
2. fase-6 `spatial_profile`, der grensebeskrivelsen vises av `renderSpatialSection()`.

Grensebeskrivelsen identifiserer Youngstorget som selve plassflaten, rammet inn av Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate og Folketeaterkvartalet, med Torggata som kryssende gate. Radiusen presenteres ikke som areal.

## Leksikon-kontroll

Hele manifest-lastede Leksikon-korpus er kontrollert. Det finnes ingen artikkel med `place_id: youngstorget` som kan legge en svak eller generisk sekundærtekst oppå den godkjente `popupDesc`-artikkelen.

Treff som bare nevner Youngstorget tilhører andre canonical eiere, blant annet Torggata, Folkets Hus, Folketeaterbygningen og Møllergata 19. De skal ikke løftes inn i Youngstorgets Om-fane ved geografisk nærhet.

Det er derfor ikke grunnlag for å lage en ny Youngstorget-Leksikonpost bare for å etterligne Torggata 7A. Torggata trengte en slik post fordi en generisk legacy-artikkel faktisk konkurrerte om hovedartikkelrollen; samme regresjon finnes ikke her.

## Temporal profile og én visuell eier

`temporal_profile` kopieres ikke inn i Om som en ny milepælrad. Milepælene 1846, 1852, 1890, 1951, 1958 og 1996 er allerede sammenfattet i `popupDesc` og de fire `history_layers`, og detaljert tidskontekst eies av Historie-fanen.

Dette følger popupkontraktens regel om én visuell eier per opplysning. Et strukturert felt trenger ikke en parallell renderer når innholdet allerede har en tydelig, mer egnet presentasjonsflate.

## Bevisst ikke endret

- canonical Youngstorget-data;
- `desc`, `popupDesc` eller production-pakken;
- spatial-, temporal- eller history-profilene;
- Leksikon-manifest eller artikler;
- Historie, Stories, Før/etter, Nyheter, Lesespor, Kilder eller Språk;
- rundinger, People, Objects, Brands, Quiz eller onsite.

## Regresjonslås

`tests/youngstorget-phase7a-about.test.mjs` låser at:

1. `popupDesc` og `spatial_profile.boundary_description` har substansielt, stedsspesifikt innhold;
2. popup-runtimen renderer både hovedartikkel og spatialseksjon;
3. radius ikke brukes som areal i spatialprofilen;
4. ingen manifest-lastet Leksikonpost eier `youngstorget`;
5. Om ikke får en parallell temporalrenderer.

## Kvalitetsvurdering før CI

1. Korrekthet og evidens: **5/5** – canonical claim-/sourcearbeid gjenbrukes uten nye fakta.
2. Dekning og ferdigstillelse: **5/5** – hele 7A-scope er kontrollert, inkludert runtime og Leksikon-konkurranse.
3. Faglig/redaksjonell kvalitet: **5/5** – ingen dupliserende tekst, proxyinnhold eller completeness-filler introduseres.
4. Teknisk integritet: **4/5** – statisk regresjonslås er lagt til; endelig score krever grønn PR-CI.
5. Sikkerhet og ansvarlighet: **5/5** – ingen personvern-, høyrisiko- eller udokumentert nåtidsflate endres.
6. Vedlikeholdbarhet og etterprøvbarhet: **5/5** – beslutning, eiergrenser og permanente assertions er eksplisitte.

Foreløpig sum: **29/30**. Fase 7A kan klassifiseres ferdig først etter grønn CI, merge og kontroll på fersk `main`.

Neste delsteg er **7B – Historie**.
