# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-14
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
- Fase 8C-audit: `reports/place-production/torggata-phase8c-brands-audit-v1.json`
- Fase 8D-audit: `reports/place-production/torggata-phase8d-structures-audit-v1.json`
- Fase 8E-audit: `reports/place-production/torggata-phase8e-rounds-closeout-v1.json`
- Fase 9-audit: `reports/place-production/torggata-phase9-onsite-audit-v1.json`
- Fase 10-audit: `reports/place-production/torggata-phase10-quiz-audit-v1.json`
- Fase 11-audit: `reports/place-production/torggata-phase11-observer-note-route-audit-v1.json`
- Fase 12-audit: `reports/place-production/torggata-phase12-people-links-audit-v1.json`
- Fase 13-audit: `reports/place-production/torggata-phase13-brands-audit-v1.json`
- Fase 14-audit: `reports/place-production/torggata-phase14-discovery-audit-v1.json`
- Fase 15-audit: `reports/place-production/torggata-phase15-physical-visit-audit-v1.json`

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
| 8. Rundinger | **GODKJENT** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT**; **8D Bygg og anlegg GODKJENT**; **8E legacy rounds + slutt-UI GODKJENT** |
| 9. På stedet | **GODKJENT** | legacy `tasks_profile` migrert ut + onsite-runtime/regresjon godkjent |
| 10. Quiz | **GODKJENT** | full canonical quizProduction-pakke, 5 × 7 kildebårne spørsmål |
| 11. Observer, Notat og Rute | **GODKJENT** | eksisterende Observer-, Notat- og navigasjonsruntime auditert; historisk rute begrunnet N/A |
| 12. People–sted-koblinger | **GODKJENT** | 21/21 canonical koblinger og inspectable kilder beholdt; 7 synlige profiler er bildeklare; 14 bildeholdbacks er eksplisitte og bevarer koblingen |
| 13. Brands | **GODKJENT** | 13/13 canonical brands har lokal verifisert logo eller autentisk historisk ordmerke/brandmark med proveniens; ingen genererte eller rekonstruerte logoer |
| 14. Leksikon, relations, NextUp, Nearby, søk og i18n | **GODKJENT** | kildebåret Leksikon beholdt; `storgata`-relasjon, historiske aliaser og tre trofaste oversettelser regresjonslåst |
| 15. Fysisk besøk / innsjekk | **ALLEREDE FERDIG – GODKJENT** | PR #3212/#3218-baselinen består med canonical Torggata-anker/radius og quiz/visit-separasjon |
| 16–24 | **IKKE STARTET** | styres av hovedchecklisten |

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

## Fase 8C – Brands

8C re-auditerer den gamle åttelisten mot `brand_rules_v1_1` og direkte Torggata-evidens. Fem eldre mappings fjernes fordi de gjelder side-/nabogater eller for svak fysisk kobling: Arakataka, Big Dipper, Justisen, The Villa og Tilt. De blir ikke slettet som brands globalt.

Den canonical Torggata-mappingen består etter re-audit av kildebårne, selvstendig gjenkjennelige identiteter med direkte eller presist avgrenset fysisk Torggata-relasjon. Nåværende brands omfatter Angst, John Dee, Jernia Torggata, Oslo Sportslager, Norli Eldorado, Oslo Bar & Bowling og Oslo Street Food. Eldorado Bokhandel beholdes bare som historisk brand. I tillegg materialiseres de dokumenterte legacy-handelsnavnene Adelsten, Ludvig Jensen & Co., P. M. Jensen, Karl A. Jensen Vilt- og lakseforretning og Ingwald Nielsen.

Alle historiske records er merket `dead` + `verified_legacy`; dagens virksomheter er `active` + `verified`. Ingen logo er kopiert eller rekonstruert uten dokumentert rettighetskjede, så PlaceCard bruker navnefallback. Vanlige kjedebutikker og svake kandidater holdes ute kandidatspesifikt i auditen. Rockefeller holdes ute fordi brand-kontrakten uttrykkelig behandler navnet som place-first, og hører til 8D Structures.

**8C Brands = GODKJENT.**

## Fase 8D – Bygg og anlegg

8D materialiserer en canonical `structures`-samling med de navngitte fysiske anleggene som består den kildeledede rundingskontrakten: **Eldorado / Torggata 9** og **Torggata bad / Torggata 16**. Dette er et auditresultat, ikke en antallskvote. Begge har selvstendig fysisk identitet, dokumentert adresse, historikk og kildegrunnlag i den allerede godkjente Torggata-kildebasen.

Rockefeller og John Dee blir ikke egne Structures fordi de er venue-/bruksidentiteter i Torggata bad-anlegget; det samme fysiske bygget skal ikke dobles. Strøget er en dokumentert passasje, men er ikke etablert i kildepakken som et eget Torggata-bygg/anlegg. De to fase-6-subplace-postene er gatesegmenter og kvalifiserer eksplisitt ikke. Vanlige butikk-/adressebygg dupliseres heller ikke fra Brands uten uavhengig strukturidentitet.

Ingen strukturillustrasjon er kopiert eller rekonstruert uten egen verifisert rettighetskjede. Runtime bruker derfor navn/ikon/telling der et per-structure-bilde mangler. Etter materialisering velger category-four-runtime `structures` for Torggata i stedet for den tidligere `images`-fallbacken, og focused test låser at samlingen består av de auditerte strukturene uten at gatesegmenter lekker inn.

**8D Bygg og anlegg = GODKJENT.**

Neste fase-8-del: **8E legacy rounds + slutt-UI**.

## Fase 8E – legacy rounds + slutt-UI

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 8D merget på main 37de6d0d2d9633331f6acef2cbd7168f85552c80
LEGACYFELT: place.rounds med ni historiske presentasjons-ID-er
CANONICAL RUNTIME: js/ui/place-rounds-visual-collections.js velger fra kategori og reelle samlinger, ikke place.rounds
AKTIV SEKUNDÆRLESER: area-overview-v2 brukte rounds/rundinger kun som ett strukturert-innholdspoeng
BESLUTNING: fjern Torggatas stale rounds; flytt områdeheuristikken til canonical objects/structures; ikke skriv en ny hardkodet fireliste
```

### Godkjent sluttstatus for fase 8

- Torggatas gamle ni-elementers `rounds`-felt er fjernet; `rundinger` og `rounds_exclude` finnes heller ikke på stedet.
- Rundingsvalget er fortsatt runtime-avledet, ikke place-kurert: **people · objects · brands · structures**.
- **Badges står separat** ved stedsoverskriften og teller ikke i 2×2-feltet.
- **Bygg og anlegg** er faktisk fjerderunding fordi fase 8D har to verifiserte Structures; Bilder-fallback brukes derfor ikke.
- Legacy-ikonene for Works, Details, Spots, Civication, Før/nå, Fortellinger, Leksikon, Lek, Trening, Oppgaver, Wonderkammer og Ruter holdes ute av canonical 2×2-grid.
- Områdeoversikten teller ikke lenger legacy presentasjonsmetadata som innhold; `objects` og `structures` brukes i den aktuelle strukturrikdomsheuristikken i stedet.
- 8A People, 8B Objects, 8C Brands og 8D Structures er regresjonslåst i 8E-kjøringen.
- Ingen antallskvote er innført; fire er UI-geometri, ikke et krav om et bestemt antall records inne i hver samling.

**Fase 8 Rundinger = GODKJENT.**

Neste aktive fase: **9. På stedet**.

## Fase 9 – På stedet

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: canonical global På stedet-runtime fantes allerede, men Torggata hadde fortsatt legacy tasks_profile
KONKRET REGRESJONSEVIDENS: canonical kontrakt sier at Oppgaver er fjernet, mens Torggata fortsatt hadde tre task-records og to task-baserte unlock-tekster
BESLUTNING: MIGRERING + CLOSEOUT – fjern gammel Oppgaver-modell uten å dikte nye På stedet-handlinger
```

### Godkjent resultat

- **Legacy `tasks_profile` = FJERNET:** de tre gamle task-recordene `torggata_task_gateprofil`, `torggata_task_for_na` og `torggata_task_aktorer` er tatt ut av canonical place-data fordi Oppgaver er fjernet fra produktkontrakten.
- **Fysiske spor = BEHOLDT HOS RIKTIG EIER:** gateprofil, før/nå og bylivsobservasjoner lever videre gjennom eksisterende `for_na`, `civication_store`, `works` og quizgrunnlag; de er ikke kopiert inn som en ny pseudo-oppgavemodell.
- **Stale task-kryssreferanser = RYDDET:** to `unlock`-tekster og miljøgateverkets `source_note` peker ikke lenger på Oppgaver/`tasks_profile`.
- **Events = GODKJENT TOMTILSTAND:** ingen Torggata-event er registrert i canonical event-register; runtime viser korrekt tomtilstand uten å dikte arrangementer.
- **Avtal å møtes = GODKJENT EKSISTERENDE RUNTIME:** global place-filtered Social Meet brukes uten Torggata-spesifikk personpayload.
- **Kunnskapsmøte = GODKJENT EKSISTERENDE RUNTIME:** åpnes manuelt med `contextType=place` og `contextId=torggata`.
- **`training_profile` = BEGRUNNET N/A:** Torggata er en By-gate, ikke et sportssted.
- **`play_profile` = BEGRUNNET N/A:** Torggata er ikke lekeplass/lekepark/playground; `categoryPolicy.by.play` er `never`.
- **Ingen filler:** det er ikke opprettet kunstige events, aktiviteter eller handlinger for å fylle fase 9.
- `tests/torggata-phase9-onsite.test.mjs` låser migrasjonen, hovedraden, event-tomtilstanden, møteflowene og fravær av stedbaserte personsignaler.

**Fase 9 På stedet = GODKJENT.**

Neste aktive fase: **10. Quiz**.

## Fase 10 – Quiz

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
AKTIV BASELINE: 6 sett / 42 spørsmål i data/quiz/by/torggata_sets.json
LEGACY AUDITERT: 30 spørsmål i data/quiz/by/torggata_sets_merged.json; ikke manifest-loadet canonical output
KONKRET REGRESJONSEVIDENS: repos quiztriage flagget Torggata for faglig-lesning-/teorimaler; aktive sett 3–6 brukte også interne emnefiler som synlig kilde
BESLUTNING: FULL CANONICAL REVISION – claim-bank først, deretter spørsmål
```

### Godkjent resultat

- `fag_manifest.json` registrerer Torggata som aktiv `by.quizProduction`-target med source brief, production context og canonical quizfil.
- Eksisterende 6 × 7 er auditerte før profilvalg; legacy `_merged` er også gjennomgått og beholdes kun som ikke-canonical revisjonsspor.
- Ny profil er **rich 5 × 7**, valgt fordi fem selvstendige kildebårne læringsjobber finnes; det er ikke en tallkvote.
- Spørsmålsbalanse: **19 fakta / 9 sammenheng / 7 begrep-teori**.
- Første **14/14** spørsmål er normale, direkte og kildebelagte uten metode-, teori- eller læreplansprompt.
- Alle 35 spørsmål har unik `claim_id` og peker bare til reviewede eksterne source-ID-er; interne By-filer er kun guidance/metadata.
- Sluttsettet bruker `met_for_etter` og den canonicale hooken `byliv_opphold_vs_gjennomgang` med Michel de Certeau og Gordon Cullen som eksplisitte, stedlig forankrede teoribindinger.
- Påstander om automatisk fortrengning, generiske rent-gap-prompter og den tidligere superlativen om 25-metersbasseng er eksplisitt holdt tilbake.
- Canonical Knowledge regenereres fra den nye manifest-loadede quizen før batchen kan persisteres; dette lukker Knowledge-synk som del av fase 10 etter gjeldende checklist.

**Fase 10 Quiz = GODKJENT når materialiseringsworkflow, canonical quiz-audits, Knowledge-sync, TypeScript og build er grønne.**

Neste aktive fase: **11. Observer, Notat og Rute**.

## Fase 11 – Observer, Notat og Rute

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE FASE-11-BRANCH/PR: ingen funnet
EKSISTERENDE EIERE: js/observations.js, js/ui/interactions.js og js/ui/place-card.js
HISTORISK RUTE: ingen aktiv chapter med placeId=torggata i data/routes/historical/routes_historical_oslo.json
BESLUTNING: CLOSEOUT EXISTING OWNERS – ingen parallell place-state og ingen rute bare for completeness
```

### Godkjent resultat

- **Observer = GODKJENT:** Torggata bruker den delte By-linsen `by_byliv`, som spør etter faktisk observerbare fenomener som opphold, gjennomgang, møteplass, kulturminne og kontrast.
- PlaceCard sender `targetType=place`, `subject_id=by` og `lensId=by_byliv`; `js/observations.js` beholder `hg_learning_log_v1` som eier og lagrer `observation_done` med target, lens, valgte observasjoner, emner, concepts og tags.
- Ingen ny Torggata-spesifikk observasjonsstate eller tekstlig kopi av Details er opprettet.
- **Notat = GODKJENT:** PlaceCard bruker eksisterende `handlePlaceNote(place)`. Notatet lagres som `type=place`, med `placeId=torggata` og `visibility=private` gjennom den eksisterende `userNotes/saveUserNotes`-flyten.
- **Vanlig Rute = GODKJENT:** `Gå Hit` bruker `showNavRouteToPlace(place)`, mens `Ruter` åpner den eksisterende rutelisten. Torggatas `routeSegments` forblir navigasjonsgeometri og er ikke historisk route-medlemskap.
- **Historisk rute = N/A:** aktiv Oslo-rutedata har ingen chapter med `placeId=torggata`. Det opprettes ikke en historisk rute bare for å fylle fase 11, og online/fysisk ruteprogresjon endres ikke.
- `tests/torggata-phase11-observer-note-route.test.mjs` låser Observer-, Notat- og Rute-eierskapet og N/A-grensen.
- Ingen canonical Torggata-place-data er endret i fase 11.

**Fase 11 Observer, Notat og Rute = GODKJENT.**

Neste aktive fase: **12. People–sted-koblinger**.

## Fase 12 – People–sted-koblinger

TIDLIGERE-ARBEID-SØK: UTFØRT. 8A1 (#4831), 8A2 (#4840), 8A3 (#4842) og 8A-closeout (#4843) etablerte den canonical 21-personers Torggata-samlingen. Fase 12 har derfor ikke laget fillerpersoner eller flyttet primærankre, men re-auditert samme samling mot dagens strengere synlig-bildeport.

### Godkjent resultat

- 21/21 personer finnes nøyaktig én gang og beholder dokumentert Torggata-kobling;
- 21/21 har inspectable ekstern kilde etter separat Thorvald Meyer-kildereparasjon i PR #4882;
- fem nye dokumentarportretter er hentet gjennom canonical Wikidata/Wikimedia Commons-pipeline og får lokale filer + imageMeta + attribusjon;
- Thorvald Meyer og Henrik Bull var allerede bildeklare, slik at den ferdige rundingen har **7 synlige og 7/7 bildeklare profiler**;
- 14 øvrige profiler beholdes canonical, men har eksplisitt `roundHoldbacks: ["torggata"]` til bildeporten kan oppfylles;
- Alexander Claes-kandidaten ble avvist fordi navnesøket traff feil person;
- Nanna Brochs sterke P18-kandidat ble ikke publisert fordi originalen er TIFF og dagens apply-flyt ikke konverterer den trygt til nettleserformat;
- ingen eksakte duplikater i `desc` eller `popupDesc`;
- repoets globale People-image-audit har separat legacygjeld (303 manglende lokale filer + én kollisjon) og brukes ikke som Torggata-nevner.

**Fase 12 People–sted-koblinger = GODKJENT når fase-12-regresjon, 8A-regresjon, People-image-kontrakttest, People-of-Places, Civication, TypeScript og build er grønne.**

Neste aktive fase: **13. Brands**.

## Fase 14 – Leksikon, relations, NextUp, Nearby, søk og i18n

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 7A/7B eier Leksikon; fase 10 eier 5 × 7 quiz; delte runtimer eier NextUp, Nearby og place-search
KONKRETE AVVIK: historiske gatenavn manglet som aliaser; eksplisitt stedrelasjon manglet; en/es/pt var stale generell gentrifiseringsprosa
BESLUTNING: RETROFIT ONLY – behold ferdige eiere, rett bare de tre dokumenterte avvikene
```

### Godkjent resultat

- **Leksikon = GODKJENT BEHOLD:** manifest-lastet hovedartikkel, to facts og seks kildebelagte chronology-poster er beholdt; den korte Leksikon-ledeteksten dupliserer ikke full `popupDesc`.
- **Relations = GODKJENT:** `related_place_ids: ["storgata"]` materialiserer den dokumenterte Strøget-forbindelsen til et eksisterende canonical History GO-place.
- **NextUp = GODKJENT BEHOLD:** Torggatas canonical 5 × 7-quiz gir et reelt progresjonssteg gjennom delt `QuizEngine`/NextUp-runtime.
- **Nearby = GODKJENT BEHOLD:** canonical navn, kategori og bilde brukes, og klikk rutes med `place.id` til riktig PlaceCard.
- **Søk = GODKJENT:** `Øvre Torvegade` og `Torvegaden` er søkbare aliaser; identiteten forblir `torggata` / `Torggata`.
- **i18n = GODKJENT:** en/es/pt følger nå dagens historiske `desc`/`popupDesc`, har riktig source-hash og beholder canonical navn.
- **Offentlig hjemsted = BEGRUNNET N/A:** Torggata er et offentlig gateløp, ikke en personprofil eller kandidat for offentlig hjemsted; ingen privat adresse eller mapping opprettes.
- CI-testen `tests/torggata-phase14-discovery.test.mjs` låser alle delkontraktene.

**Fase 14 = GODKJENT når fase-14-test, Places data og TypeScript/build-porter er grønne.**

Neste aktive fase: **15. Fysisk besøk / innsjekk**.

## Fase 15 – Fysisk besøk / innsjekk

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: PR #3218 / ea56d384e6d806219449834cf5e6071a52fd60e7; separasjonen først etablert i PR #3212 / 9251227f4b5488e0403432369f43a1018e4f2982
SISTE GODKJENTE TILSTAND: HGPhysicalVisits eier fysisk write; PlaceCard eier pcVisit; quiz-write er deaktivert; posisjonsgate bruker canonical targets og radius
KONKRET REGRESJONSEVIDENS: ingen
BESLUTNING: ALLEREDE FERDIG – kun Torggata-spesifikk closeout og regresjonslås
```

### Godkjent resultat

- PlaceCard viser riktig fysisk statusrekke: `Henter posisjon…`, `Gå nærmere`, `Registrer besøk` og `Besøkt ✅`.
- Torggata bruker den tidligere godkjente gategeometrien `59.91700148933685, 10.75330911912394` med radius `180`.
- For stor avstand gir `too_far` og beregnet restavstand; registreringsknappen er deaktivert.
- Gyldig avstand registrerer via eksisterende `HGPhysicalVisits.record(place)` og leses tilbake som fysisk `Besøkt`.
- Quizåpning/-fullføring skriver ikke fysisk status; `saveVisitedFromQuiz` returnerer `false` og quiz-samling forblir egen `places_collected`-akse.
- Torggata-data har ingen egen visit-, check-in- eller konkurrerende storage-modell.
- Fase-9 På stedet-arbeidet beholdes som separat aktivitetsflate og er ikke duplisert.
- `tests/torggata-phase15-physical-visit.test.mjs` låser hele fase-15-kontrakten.

**Fase 15 Fysisk besøk / innsjekk = ALLEREDE FERDIG – GODKJENT.**

Neste aktive fase: **16. Multiplayer og sosiale koblinger**.
