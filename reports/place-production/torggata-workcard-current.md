# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight-tillegg: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Fase 4-audit: `reports/place-production/torggata-phase4-fagverk-audit-v1.md`
- Fase 5-audit: `reports/place-production/torggata-phase5-description-audit-v1.md`
- Fase 6-audit: `reports/place-production/torggata-phase6-structured-profiles-audit-v1.md`
- Fase 7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- Fase 7A-audit: `reports/place-production/torggata-phase7a-about-audit-v1.md`
- Fase 7B-audit: `reports/place-production/torggata-phase7b-history-audit-v1.md`
- Fase 7C-audit: `reports/place-production/torggata-phase7c-story-audit-v1.md`
- Fase 7D-audit: `reports/place-production/torggata-phase7d-before-after-audit-v1.md`

## Korrigert fasestatus

| Fase | Status | Dokumentasjon |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinater/geometri | **ALLEREDE FERDIG – BEHOLD** | tidligere coordinate-produksjon, særlig PR #3773 og #3775 |
| 4. Kategori, Badges, emner og Fagverk | **GODKJENT** | PR #4813, merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` |
| 5. `desc` + `popupDesc` | **GODKJENT** | PR #4815, merge `0528b259fcb6dc0e2a3ea68b6d3e3925bbfe5a4e` |
| 6. Strukturerte place-profiler | **GODKJENT** | PR #4816, merge `e155aea8b0717c623a1de9904dcc253e8820f356` |
| 7. Popupfaner | **PÅGÅR – 7D FØR/ETTER KLAR FOR REVIEW** | audit PR #4817; 7A Om PR #4820; 7B Historie PR #4822; 7C Fortellinger PR #4824; 7D aktiv branch |
| 8–15 | **IKKE STARTET** | styres av hovedchecklisten |

## Tidligere-arbeid-gate – koordinater

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: PR #3775 / 794e0cad02f54ba561e2af06e0ae839a95f11e52
SISTE GODKJENTE TILSTAND: verified_geometry, street_geometry_midpoint, ordnede routeSegments
KONKRET REGRESJONSEVIDENS: PR #4799 flyttet displaypunktet til Youngstorget og fjernet den tidligere routeSegments-modellen uten at tidligere ferdig coordinate-jobb først ble behandlet som baseline
BESLUTNING: REGRESJON – gjenopprett tidligere godkjent tilstand; ingen ny coordinate-produksjon
```

## Bindende coordinate-baseline

Torggata skal bruke den tidligere godkjente coordinate-tilstanden fra PR #3775:

- `lat`: `59.91700148933685`
- `lon`: `10.75330911912394`
- `r`: `180`
- `coordType`: `street_geometry_midpoint`
- `coordStatus`: `verified_geometry`
- operativt geometry-anker: `osm-way:467290774`
- ordnede `routeSegments` beholdes

Denne tilstanden ble etablert gjennom eksakt gategeometri-research i PR #3773 og anvendt/validert i PR #3775. Punktet ligger på selve Torggata-geometrien og skal ikke erstattes med et punkt midt på Youngstorget bare fordi torget inngår i den bredere gateidentiteten.

Følgende senere coordinatearbeid brukes ikke som gjeldende fasit: PR #4797, #4799, #4800 og #4802. Feilen var å gjøre om en allerede ferdig koordinatjobb uten først å kontrollere og respektere den tidligere godkjente coordinate-historikken.

## Fase 4 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere PR funnet som godkjenner fase 4 etter dagens place-checklist
SISTE GODKJENTE TILSTAND: Arvet category=by, to em_by_* og Badges-runding
KONKRET REGRESJONSEVIDENS: Generisk fagverk-sted.html og Politikk-overlaget lekket Politikk-presentasjon inn i ikke-Politikk-steder
BESLUTNING: REELT NYTT AUDITARBEID – behold beståtte fagdata, rett runtimefeilen
```

### Fase 4 – godkjent resultat

- `category: by` er canonical og beholdes;
- `em_by_gentrifisering_eiendom` beholdes med kildebasens dokumenterte inferensgrense;
- `em_by_styring_forvaltning_planmakt` beholdes med avgrensning mot udokumentert enkel kausalitet;
- ingen `underbadge_ids` ble lagt til bare for å fylle felt;
- `badges` finnes allerede;
- By-merket og By-faget er materialisert i portalregisteret;
- generisk `fagverk-sted.html` er gjort fagnøytral;
- Politikk-integrasjonen kjører bare ved eksplisitt Politikk-identitet;
- Torggatas By-rendering kan ikke overskrives av tom Politikk-modell;
- regresjonstesten låser `by`-identitet, begge By-emnene, Badges-rundingen og materialisert By-portal.

PR #4813 ble squash-merget etter grønn Fagverk and place learning, Fagverk By Data og styring Phase 4 og TypeScript guard. `main` ble kontrollert på merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` før fase 5 startet.

## Fase 5 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: ecd3af8ec85615e39bc84579f4511bba06e04b72 – «Utvid Torggata til innholdsrik popupDesc»
SISTE GODKJENTE TILSTAND: dagens desc/popupDesc er etterkommer av tidligere merget tekst
KONKRET REGRESJONSEVIDENS: ingen generell tekstregresjon; manglende v4.2-produksjonspakke og én superlativpåstand tilfredsstilte ikke dagens strong-claim-kontrakt
BESLUTNING: RETROFIT – bevar teksten; rett bare det konkrete kontraktavviket
```

### Fase 5 – godkjent resultat

- `desc` beholdes uendret: 49 ord;
- `popupDesc` beholdes redaksjonelt og strukturelt;
- eneste innholdsendring er `byens første 25-metersbasseng` → `et 25-metersbasseng`;
- Eldorados `Norges første lydfilmkino` beholdes fordi påstanden har to uavhengige kilder;
- `data/places/production/torggata.json` følger v4.2.1 med 18 verifiserte claims;
- setningsdekning er 3/3 for `desc` og 31/31 for `popupDesc`;
- fire strong-claims har eksplisitt evidens og minst to kilde-URL-er;
- ferske temporal-claims dekker nåværende stedselementer;
- quiz-readiness inneholder 10 direkte spørsmål fordelt på 5 typer;
- `desc`-hash: `10711892bbf6acd84a9f8cfd4638c73ce39db71814b4f3619b4b5f6621a82fbb`;
- `popupDesc`-hash: `e4e0fa2ab0a249ee3619406972e454045e40cda98b500c50f2f00fa813709fef`.

PR #4815 passerte Place description governance, Data checks, Fagverk and place learning, Nature data validation and candidates og Fagverk By Data og styring Phase 4 på samme head. PR-en ble squash-merget, og faktisk `main` ble kontrollert på merge `0528b259fcb6dc0e2a3ea68b6d3e3925bbfe5a4e` før fase 6 startet.

## Fase 6 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere Torggata-PR funnet som eier fase 6 etter dagens checklist
SISTE GODKJENTE TILSTAND: stedet hadde rike enkeltfelt, men ingen canonical strukturerte place-profiler
KONKRET REGRESJONSEVIDENS: ingen
BESLUTNING: REELT NYTT ARBEID – bygg bare kildebårne strukturer som tilfører ny organisering
```

### Fase 6 – godkjent resultat

- `spatial_profile` skiller canonical gateidentitet fra den kortere operative routeSegments-kjeden;
- 574,5 meter gjøres ikke til påstått full Torggata-lengde;
- `temporal_profile` bruker seks hovedmilepæler og blir ikke en parallell chronology;
- `subplaces` består bare av de to dokumenterte gatesegmentene Stortorvet–Youngstorget og Youngstorget–Ankertorget;
- `history_layers` gir fem korte, kildebårne historiske lag uten å duplisere full chronology;
- `source_summary.safe_sources` inneholder bare eksterne brukerrettede kilder;
- `nature_profile` er **N/A** med konkret begrunnelse: urbant gateløp uten dokumentert naturfaglig rolle i stedspakken;
- fase 5-tekster og production package er urørt.

PR #4816 passerte Fagverk By Data og styring Phase 4, Nature data validation and candidates, Place description governance, Fagverk and place learning og Data checks på samme head. PR-en ble squash-merget, og faktisk `main` ble kontrollert på merge `e155aea8b0717c623a1de9904dcc253e8820f356` før fase 7 startet.

## Fase 7 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: tab-runtime, Torggata-leksikon, én canonical Story, for_na, Lesespor og externalLinks finnes allerede
NY PRODUKSJON FØR AUDIT: FORBUDT
BESLUTNING: REELT AUDITARBEID – vurder hver av åtte canonical popupfaner separat og behold eksisterende data som faktisk består kontrakten
```

### Fase 7 – auditresultat

- **Om – 7A GODKJENT:** egen manifest-lastet `title: Torggata`-hovedartikkel supplerer fase-5-artikkelen og fase-6 spatial/subplaces med kildebårne facts. PR #4820, merge `49b79250403bdbfd6db0a4d07aa57887fa7eefe4`.
- **Historie – 7B GODKJENT:** `history_layers` beholdes; seks kildebårne chronology-poster erstatter den generiske legacy-tidslinjen i popupen, og navnløs legacy-extra undertrykkes via eksplisitt opt-in. PR #4822, merge `20f775df7a7c09f3d0c1debaa2d2d45a16431d68`.
- **Fortellinger – 7C GODKJENT:** én samlet Torggata-story er migrert til `episode_v1`, canonical type `conflict`, score 20 og uten tematisk Markveien-`next_scenes`. PR #4824, merge `d07c55f1ec9b790bfa64b26cf7d3c87d3d4c7771`.
- **Før/etter – 7D KLAR FOR REVIEW:** legacy `for_na` er erstattet av eksternt kildebåret før/etter om gateombyggingen, med lisensiert 2009/2017-bildepar og eksplisitt kamerastandpunktbegrensning.
- **Nyheter – BEGRUNNET N/A:** ingen canonical Torggata-notiser er dokumentert som relevante nok til produksjon nå.
- **Lesespor – BEGRUNNET N/A:** eksisterende Torggata-koblinger er subscription/paywall og filtreres korrekt fra den åpne stedflaten; ingen åpent direkte lesbart Torggata-spor er dokumentert.
- **Kilder – TRENGER ARBEID / 7E:** sikre kildenavn finnes, men flere av dem er bare labels og ikke inspectable brukerrettede HTTPS-lenker.
- **Mer – BEGRUNNET N/A:** ingen Torggata-post i Språkleksikon-manifestet og ingen særskilt canonical Mer-pakke som må vises; fanen skal ikke fylles med legacy-/handlingselementer.

### Korrigert runtimeforståelse

Fase-6-feltene er ikke generelt frakoblet popupen. `place-popup-v2.js` renderer `spatial_profile`, `subplaces`, `history_layers` og `source_summary`, og tabs-wrapperen fordeler dem til Om, Historie og Kilder. `temporal_profile` har ingen egen renderer. 7B bruker derfor Leksikon `chronology` som den brukerrettede tidslinjeeieren i Historie i stedet for å lage en parallell generell temporal renderer.

## Fase 7A – Om

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
LEGACY-FUNN: leksikon_oslo_by_batch1.json har Torggata-fallback med generisk gentrifiseringsprosa og tomme sources
BEHOLD: fase-5 popupDesc, spatial_profile, subplaces og all tidligere godkjent place-data
BESLUTNING: legg til egen kildebåret manifest-hovedartikkel som runtime allerede kan prioritere ved eksakt navnematch
```

Godkjent 7A-leveranse:

- `data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json` ble etablert som hovedartikkel med `title: Torggata` og `type: main`;
- artikkelen bruker inspectable eksterne kilder og kildebelagte facts;
- `data/leksikon/manifest.json` laster filen;
- både tabs-runtime og Leksikon-loader prioriterer eksakt stedsnavn før legacy fallback;
- chronology ble bevisst holdt tom i 7A for å ikke forskuttere 7B;
- `tests/torggata-phase7a-about.test.mjs` låser manifest, kilder, HTTPS og navneprioritet;
- ingen place-data eller brukerrettet fase-5-tekst ble endret.

PR #4820 ble squash-merget etter grønn Fagverk By Data og styring Phase 4 og TypeScript guard. Faktisk `main` ble kontrollert på merge `49b79250403bdbfd6db0a4d07aa57887fa7eefe4` før 7B startet.

## Fase 7B – Historie

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT CHRONOLOGYJOBB: ingen funnet etter dagens popup-/place-kontrakt
LEGACY-FUNN: leksikon_oslo_by_batch1.json har én navnløs Torggata-post med ukildet chronology «Senmodernitet»
BEHOLD: fase-6 history_layers og fase-5 kilde-/claim-base
BESLUTNING: bygg kort kildebåret chronology og undertrykk bare navnløs legacy-extra i popupen
```

Godkjent 7B-leveranse:

- chronology-år: `1846 · 1852 · 1876 · 1929 · 1986 · 2014`;
- alle chronology-poster har konkrete HTTPS-kilder;
- chronology svarer bare på **hva som skjedde når** og kopierer ikke Storyen;
- `temporal_profile` beholdes som canonical struktur, mens Leksikon chronology eier den brukerrettede tidslinjen;
- hovedartikkelen bruker `suppress_untitled_legacy_articles: true`;
- `place-popup-tabs.js` har generell `visibleArticlesForPopup()` som bare aktiveres ved dette flagget;
- navngitte ekstraartikler beholdes; navnløse legacy-extras filtreres fra popupen;
- ingen place-ID hardkodes i runtime;
- den fysiske legacy-posten slettes ikke og beholdes for sporbarhet;
- `tests/torggata-phase7b-history.test.mjs` låser chronology og supersession-regelen.

PR #4822 ble squash-merget etter grønn TypeScript guard, Place rounds governance og Fagverk By Data og styring Phase 4. Faktisk `main` ble kontrollert på merge `20f775df7a7c09f3d0c1debaa2d2d45a16431d68` før 7C startet.

## Fase 7C – Fortellinger

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
AKTIV STORY: st_torggata_ga_og_sykkelgate_2010
TIDLIGERE EPISODE-V1-MIGRASJON: ingen funnet
BEHOLD: én samlet fortelling om ombygging og konflikt mellom ulike brukere av gateflaten
BESLUTNING: MIGRER TIL DAGENS STORY-KONTRAKT – ikke produser flere milepæl-Stories
```

Godkjent 7C-leveranse:

- eksisterende story-ID og tittel er beholdt;
- `quality_profile: episode_v1`;
- canonical story-type er `conflict`;
- primært episodeanker er bystyrevedtaket i 2010;
- storyteksten er presisert mot Oslo byleksikon, Arkitektur skaper verdi og TØI;
- tidligere «prøveprosjekt»-formulering fra 2009 er fjernet til fordel for dokumenterte sperrer/bilbegrensning;
- 2014 er beholdt som åpningen av den ferdige gateutformingen;
- TØIs dokumenterte konflikt mellom gående og syklende er den narrative konsekvensen;
- tematisk `next_scenes` til Markveien er fjernet;
- `related_places` er tømt fordi nabogatene ikke er nødvendige ledd i den konkrete fortellingen;
- story-filen er registrert i `stories_episode_v1_manifest.json`;
- maskinberegnet score er `20`;
- `tests/torggata-phase7c-story.test.mjs` låser én Story, episode-v1, type, episodefelt, kilder, score og tomme tematiske koblinger.

PR #4824 passerte Stories governance, TypeScript guard, Place rounds governance og Fagverk By Data og styring Phase 4 på samme head. Faktisk `main` ble kontrollert på merge `d07c55f1ec9b790bfa64b26cf7d3c87d3d4c7771` før 7D startet.

## Fase 7D – Før/etter

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT 7D-PR/COMMIT: ingen funnet
LEGACY-FUNN: for_na brukte History Go/Wonderkammer som faktakilder og manglet bildepar/attribusjon
BEHOLD: ideen om Torggatas dokumenterte gateombygging som før/etter-case
BESLUTNING: RETROFIT – ekstern faktabasis, lisensiert bildepar, eksplisitte inferens- og kameragrenser
```

Aktiv 7D-leveranse:

- tittel er `Torggata før og etter ombyggingen`;
- `before`, `now` og `change` er avgrenset til dokumentert trafikk- og byromsendring;
- udokumenterte lokale påstander om leienivå, automatisk fortrengning og symbolsk verdi er fjernet fra Før/etter-faktalaget;
- fakta bygger på Oslo byleksikon, Arkitektur skaper verdi og TØI;
- alle `for_na.sources` er inspectable HTTPS-URL-er; ingen intern History Go-/Wonderkammer-kilde står igjen;
- førbilde: `Torggata 2009-06-08.jpg`, Kjetil Ree, CC BY-SA 3.0, Youngstorget-kameraposisjon dokumentert;
- etterbilde: `Torggata (2017-01-08).jpg`, Kjetil Ree, CC BY-SA 3.0;
- begge bilder har Commons-kildeside, dato og attribusjon;
- teksten sier eksplisitt at bildene ikke er tatt fra identisk kamerastandpunkt og derfor brukes som gateprofil-sammenligning, ikke eksakt fotoreplikk;
- `tests/place-card-for-na-torggata.test.js` låser kilder, bilder, lisens, attribusjon, kamerabegrensning og inferensgrense;
- ingen øvrig canonical Torggata-data er endret.

### Bindende delstegrekkefølge

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Kilder
```

7D settes først **GODKJENT** etter relevant CI, squash-merge og kontroll på faktisk `main`. 7E starter først da.
