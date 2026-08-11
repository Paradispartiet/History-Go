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
- Fase 7E-audit: `reports/place-production/torggata-phase7e-sources-audit-v1.md`
- Fase 7-closeout: `reports/place-production/torggata-phase7-closeout-v1.md`
- Fase 8-audit: `reports/place-production/torggata-phase8-rounds-audit-v1.md`
- Fase 8A-audit: `reports/place-production/torggata-phase8a-people-audit-v1.md`
- Fase 8A1-audit: `reports/place-production/torggata-phase8a1-people-audit-v1.md`
- Fase 8A2-audit: `reports/place-production/torggata-phase8a2-jensen-audit-v1.md`
- Fase 8A3-audit: `reports/place-production/torggata-phase8a3-residents-memory-audit-v1.md`
- Fase 8A-closeout: `reports/place-production/torggata-phase8a-closeout-v1.md`
- Fase 8B-audit: `reports/place-production/torggata-phase8b-objects-audit-v1.md`

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
| 7. Popupfaner | **GODKJENT** | audit PR #4817; 7A #4820; 7B #4822; 7C #4824; 7D #4826; 7E #4827; closeout i aktiv status-PR |
| 8. Rundinger | **PÅGÅR – 8C Brands** | audit PR #4829; **8A People GODKJENT** i #4831, #4840, #4842 og closeout #4843; **8B Objects GODKJENT** i #4847; 8C er neste del |
| 9–15 | **IKKE STARTET** | styres av hovedchecklisten |

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

- `spatial_profile` skiller canonical gateidentitet fra den kortere routeSegments-kjeden;
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
SISTE GODKJENTE TILSTAND: tab-runtime, Torggata-leksikon, én canonical Story, for_na, Lesespor og externalLinks fantes allerede
NY PRODUKSJON FØR AUDIT: FORBUDT
BESLUTNING: vurder hver av åtte canonical popupfaner separat og behold eksisterende data som faktisk består kontrakten
```

### Fase 7 – godkjent sluttstatus

- **Om – GODKJENT:** egen manifest-lastet `title: Torggata`-hovedartikkel supplerer fase-5-artikkelen og fase-6 spatial/subplaces med kildebårne facts. PR #4820, merge `49b79250403bdbfd6db0a4d07aa57887fa7eefe4`.
- **Historie – GODKJENT:** `history_layers` beholdes; seks kildebårne chronology-poster erstatter den generiske legacy-tidslinjen i popupen, og navnløs legacy-extra undertrykkes via eksplisitt opt-in. PR #4822, merge `20f775df7a7c09f3d0c1debaa2d2d45a16431d68`.
- **Fortellinger – GODKJENT:** én samlet Torggata-story er migrert til `episode_v1`, canonical type `conflict`, score 20 og uten tematisk Markveien-`next_scenes`. PR #4824, merge `d07c55f1ec9b790bfa64b26cf7d3c87d3d4c7771`.
- **Før/etter – GODKJENT:** eksternt kildebåret før/etter om gateombyggingen, lisensiert 2009/2017-bildepar og eksplisitt kamerastandpunktbegrensning. PR #4826, merge `3c6b12635438ef07947a82f972d09a0eab50ff6e`.
- **Nyheter – BEGRUNNET N/A:** ingen canonical Torggata-notis er dokumentert som relevant nok til produksjon nå.
- **Lesespor – BEGRUNNET N/A:** eksisterende Torggata-koblinger er subscription/paywall og filtreres korrekt fra den åpne stedflaten; ingen åpent direkte lesbart Torggata-spor er dokumentert.
- **Kilder – GODKJENT:** alle sikre kildefamilier og Før/etter-kilder har inspectable HTTPS-oppslag med meningsfulle labels. PR #4827, merge `364bdec196aef811bb3d2f2cb76fa4fc994068ae`.
- **Mer – BEGRUNNET N/A:** ingen Torggata-post i Språkleksikon-manifestet og ingen særskilt canonical Mer-pakke som bør fylles kunstig.

### Korrigert runtimeforståelse

Fase-6-feltene er ikke generelt frakoblet popupen. `place-popup-v2.js` renderer `spatial_profile`, `subplaces`, `history_layers` og `source_summary`, og tabs-wrapperen fordeler dem til Om, Historie og Kilder. `temporal_profile` har ingen egen renderer. Leksikon `chronology` er den brukerrettede tidslinjeeieren i Historie i stedet for en parallell generell temporal renderer.

## Fase 7A – Om

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
LEGACY-FUNN: leksikon_oslo_by_batch1.json hadde Torggata-fallback med generisk gentrifiseringsprosa og tomme sources
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
LEGACY-FUNN: leksikon_oslo_by_batch1.json hadde én navnløs Torggata-post med ukildet chronology «Senmodernitet»
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

Godkjent 7D-leveranse:

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

PR #4826 ble squash-merget til `main` som `3c6b12635438ef07947a82f972d09a0eab50ff6e`. Places data, Place description governance, TypeScript guard, Fagverk and place learning, Fagverk By og Nature validation var grønne. Den eneste røde workflowgruppen var en eksplisitt avgrenset, arvet Film/TV-templatefeil i Category and quiz governance; PR #4826 endret ikke Film/TV eller quiz templates.

## Fase 7E – Kilder

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT 7E-PR/COMMIT: ingen funnet
EKSISTERENDE DATA: source_summary.safe_sources, place.externalLinks, Torggata-leksikon externalLinks og 7D for_na.sources fantes
BESLUTNING: RETROFIT – gjør eksisterende eksternt kildesett inspectable uten ny popup-runtime eller ny sannhetskilde
```

Godkjent 7E-leveranse:

- Torggata-leksikonet er version 4;
- `externalLinks` gir meningsfulle HTTPS-labels til Eldorado, Torggata bad, Lokalhistoriewiki, SNL, Rockefeller, Torggata Gateforening, Arkitektur skaper verdi, TØI og begge Commons-bildene;
- place-recordens eksisterende Oslo byleksikon-/OSM-lenker beholdes;
- alle syv `source_summary.safe_sources` har inspectable oppslag i det sammenslåtte configured source-laget;
- alle fem `for_na.sources` har navngitt configured link;
- begge bildekildesidene har meningsfulle Commons-labels;
- configured links kommer før generiske Før/etter-lenker og dedupliseres på URL av eksisterende runtime;
- ingen intern audit-, report-, coordinate- eller quiz-URL er gjort brukerrettet;
- `tests/torggata-phase7e-sources.test.mjs` låser kildekjedene og runtime-dedupliseringen.

PR #4827 ble squash-merget etter grønn Fagverk By Data og styring Phase 4 og TypeScript guard. Faktisk `main` ble kontrollert på merge `364bdec196aef811bb3d2f2cb76fa4fc994068ae` før fase 7 ble lukket.

## Fase 7 – closeout

Alle åtte popupfaner er nå eksplisitt avsluttet som **GODKJENT** eller **BEGRUNNET N/A**. Ingen status er arvet mellom faner.

Torggata kan derfor gå videre til **fase 8: PlaceCard-rundinger**. Før fase 8 settes `PÅGÅR` skal tidligere-arbeid-gaten kjøres for rundinger og `data/places/README_place_rounds.md` leses fullt ut. Legacy `place.rounds` skal ikke behandles som canonical fasit bare fordi det finnes eldre Torggata-rundingsarbeid.


## Fase 8A1 – byggere, arkitekter og teaterledere

8A1 bygger den første canonical People-klyngen for Torggata uten antallskvote. Eksisterende Thorvald Meyer, Henrik Bull, Christian Morgenstierne og Arne Eide gjenbrukes med sekundær Torggata-kobling. Nye People v1-profiler opprettes for Thøger Binneballe, Harald Olsen, Alma Fahlstrøm og Johan Fahlstrøm.

Primærankrene til eksisterende personer beholdes. Nye profiler bruker `torggata` som primæranker, har full claims-trace og kan stå uten bilde når sikker lisenskjede mangler.

8A1 ble squash-merget i PR #4831 og er nå godkjent baseline for videre People-produksjon.

## Fase 8A2 – Jensen-familiens gatehandel

8A2 materialiserer fem nye canonical People v1-profiler: Ludvig Christian Jensen, Adelsten Jensen, Peter Marinius Jensen, Karl A. Jensen og Thorvald Jensen. Klyngen er stedshistorisk avgrenset av Oslo byleksikons eksplisitte observasjon om Jensen-familiens fire forretninger i Torggata, ikke av en antallskvote eller generell butikkatalog.

Adelsten-metadataene er korrigert mot den dedikerte Oslo byleksikon-artikkelen: 1866–1918, oppstart i Torggata 2 i 1890 og flytting til Torggata 1 i 1901. Alle fem profiler har egen claims-trace; Thorvalds `year` utelates fordi kilden ikke daterer når han ble kompanjong.

8A2 ble squash-merget i PR #4840 og er godkjent baseline.

## Fase 8A3 – beboere, arbeidende og minnespor

8A3 materialiserer Nanna Broch, Wulff Becker, Martin Heinz Zilsel, Alexander Claes, Therese Hurwitz, Jenny Hurwitz, Fredrik Hurwitz og Moritz Glott som canonical People v1-profiler. Fersk preflight korrigerte en stale audit-antakelse om Wulff Becker: den tidligere oppgitte canonical filen finnes ikke på dagens `main`, så han opprettes uten duplikat.

Klyngen dekker presise Torggata-adresser og dokumenterte roller innen boligarbeid, gatehandel/industri, krigshistorie og fysisk minne. Ingen holdback-kandidater legges inn bare for å øke antallet.

8A3 ble squash-merget i PR #4842 og fullførte den planlagte People-innholdsproduksjonen.

## Fase 8A – closeout

People-rundingen er kontrollert mot faktisk runtime: `getPeopleForPlace('torggata')` leverer de kildebårne 8A-personene fra canonical manifest/place-referanser, PlaceCard bruker samme samling til liste og preview, og category-four-gridet beholder People som første innholdsrunding. Testen låser identitetene som 8A faktisk produserte, men innfører ingen antallskvote.

Closeout ble squash-merget i PR #4843, merge `d50d5fd21e7201bb76cfe363e27c7a00ae3b351c`.

**8A People = GODKJENT.**

## Fase 8B – Objects

8B materialiserer én canonical fysisk gjenstand i `place.objects`: **Byrute 8-skilt for sykkel**. Posten er stedsspesifikk, har direkte Commons-bilde med fotograf, lisens og verifiseringsdato, og dokumenterer hvordan sykkelprioriteringen i Torggata også er fysisk lesbar i gatebildet. Tre svake legacy Civication-kandidater ble eksplisitt holdt utenfor canonical Objects fordi de var ikke-fysiske, for abstrakte eller manglet tilstrekkelig egen identitet/bildeevidens. Det ble ikke brukt noen antallskvote.

Under clean-head-kontrollen avdekket `objects[].desc` en falsk positiv i `Place description governance`: validatoren tolket en nestet Object-beskrivelse som om toppnivå-`desc` var endret. Kontraktfeilen ble rettet separat i PR #4850, merge `a7ad5efbd9685324f814e9819add767f0dad062e`, med regresjonstest for nestede beskrivelser. Selve 8B-innholdet ble ikke endret som følge av dette.

PR #4847 ble deretter renset til én commit på fersk `main`, bestod Data checks, Place description governance, TypeScript guard, Nature data validation and candidates og Fagverk/place learning, og ble squash-merget på `0da6add13605a66f08769fb4b302fe1ddae76780`.

**8B Objects = GODKJENT.**

Neste fase-8-del: **8C Brands**.
