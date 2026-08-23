# Youngstorget – fase 7 popupfaner audit V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Canonical place: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Produksjonsrekkefølge: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Runtime: `js/ui/place-popup-v2.js` + `js/ui/place-popup-tabs.js`
- Baseline: fase 6 merget i PR #5227, merge `222f6a556785fe13ff337995349b6998c50208ff`
- Audit-baseline på `main`: `3c0003dd9a6f5eba18c91ee0002857ba75e64e25`
- Referanse for kontraktgrense: `reports/place-production/torggata-phase7a-about-audit-v1.md`
- Status: **AUDIT FERDIG – fase 7 er ikke samlet godkjent**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 5 description package og fase 6 strukturerte profiler er merget og skal bevares
EKSISTERENDE POPUPARBEID: popupDesc, spatial_profile, temporal_profile, history_layers, source_summary, én aktiv canonical Story og fire Lesespor finnes allerede
BESLUTNING: REELT AUDITARBEID – klassifiser eksisterende canonical eiere først; produser bare dokumenterte hull og ikke tomme/filler-faner
```

## Runtimeforståelse og én-visuell-eier-regelen

`place-popup-v2.js` renderer allerede Youngstorgets:

- `popupDesc` som hovedartikkel;
- `spatial_profile` via `renderSpatialSection()`;
- `history_layers` via `renderHistoryTimeline()`;
- `source_summary` som kildeetiketter.

`place-popup-tabs.js` flytter disse seksjonene til korrekt panel: spatial til **Om**, history layers til **Historie** og source summary til **Kilder**.

`temporalProfile(place)` kan lese `temporal_profile`, men dagens runtime har ingen egen renderer for feltet. Dette er **ikke automatisk et Om-hull**. Popupkontrakten krever samtidig én visuell eier per opplysning, og den godkjente Torggata-7A-referansen plasserer overlappende temporal-/chronology-/history-vurdering i Historie fremfor å bygge en parallell milepælrad i Om.

For Youngstorget overlapper alle seks `temporal_profile`-milepælene de fire kildebårne `history_layers` eller den allerede godkjente hovedartikkelen. Fase 7 skal derfor **ikke** bygge en generell temporal-renderer bare for å vise feltet. 7B avgjør om Historie trenger noen ekstra kort datert presentasjon; utgangspunktet er at eksisterende history layers er tilstrekkelige og at chronology ikke fylles for volum.

Kilder-runtimen har et separat skille: `source_summary.safe_sources` vises som tekstetiketter, mens klikkbare HTTPS-kilder kommer fra `externalLinks` og Før/etter-kilder. Youngstorget har gode source labels, men ikke den komplette inspectable lenkeflaten som Kilder-kontrakten krever.

Lesespor-runtimen filtrerer eksplisitt ut `subscription`/betalingsmur. De eksisterende Youngstorget-sporene er Aftenposten-spor, og de registrerte abonnementssporene skal ikke brukes som falskt «åpent» Lesespor. 7F gjør sluttkontrollen item-for-item og kan bare åpne fanen hvis faktisk tilgangsstatus støtter det.

## Fanestatus etter audit

| Fane | Status | Evidens / beslutning |
| --- | --- | --- |
| Om | **ALLEREDE INNHOLDSKLAR – 7A QA** | Fase-5 `popupDesc` og fase-6 `spatial_profile` er sterke og vises. Ingen egen Youngstorget-Leksikonfil ble funnet, så det finnes ikke et parallelt generisk Leksikonlag som må fylles eller saneres. `temporal_profile` skal ikke dupliseres her bare fordi helperen finnes. |
| Historie | **ALLEREDE INNHOLDSKLAR – 7B QA** | Fire kildebårne `history_layers` vises allerede i Historie. En ekstra chronology er ikke obligatorisk. 7B kontrollerer tab-rendering, temporal/chronology-eierskap og at Story ikke dupliseres. |
| Fortellinger | **TRENGER ARBEID – 7C** | `stories_youngstorget.json` er manifestaktiv og type `political` er gyldig, men storyen er en bred arbeiderbevegelsesoppsummering med `year: 1930`, ikke en tydelig dokumentert episode/konflikt. Den er legacy og ikke `episode_v1`. Tre separate research-snutter i `data/stories/youngstorget.json` er ikke manifestaktiv Story-data. |
| Før/etter | **TRENGER ARBEID – 7D** | Canonical `for_na` mangler. Source packen dokumenterer 1990-tallsomarbeiding/1996 som godt endringsspor, men bildepar, samme-sted-vinkel og rettighets-/attribusjonskontroll må produseres separat. |
| Nyheter | **TRENGER ARBEID – 7E** | Ingen canonical Youngstorget-news/notis er materialisert i popupens kildesystem. Content Factory-pakken har reelt ferskt stoff: 8. mars 2026, 1. mai 2026 og kommunens arbeid med utleie/byliv. Dette er ikke N/A, men må ferskkontrolleres og materialiseres som små notiser uten å bli Stories. |
| Lesespor | **7F – TILGANGS-QA / SANNYNLIG BEGRUNNET N/A I ÅPEN POPUP** | Fire Youngstorget-spor finnes i Oslo-batchene, alle fra Aftenposten. Runtime filtrerer registrert abonnement/betalingsmur. 7F skal kontrollere `access` item-for-item og må ikke omklassifisere tilgang for å fylle fanen. |
| Kilder | **TRENGER ARBEID – 7G** | Fase 6 gir fem sikre kildeetiketter, men Youngstorget mangler dedupliserte inspectable HTTPS-`externalLinks` for de viktigste kildene. Interne audits/claim-bank skal fortsatt ikke vises. |
| Språk | **TRENGER EGEN VURDERING – 7H** | Ingen aktiv Youngstorget-fil finnes i Språkleksikon. Samtidig er `Nytorvet` 1852–1951, `Youngstorget` fra 1951 og navnerelasjonen til Jørgen Young kildebelagte språk-/navnespor. Språk kan ikke merkes N/A før Språkleksikon-kontrakten er prøvd. |
| Spor & objekter | **TRENGER ARBEID – SENERE EIERFASE** | Pioneren, fredsmonumentet, fontenen og basaren har dokumenterte kandidatclaims, men canonical Object-ID/eierskap er ikke avklart. Popupen skal ikke lage lokale objektduplikater før Object-audit. |
| Legg merke til / Betydning / Motpunkter | **INGEN GODKJENT DIREKTEFANE NÅ** | Youngstorgets legacy `layers.populaerkultur.knowledge` har generiske, ukildede formuleringer og kan ikke løftes direkte inn som dagens `interpretation`-faner. |
| Relasjoner | **MÅ VURDERES I RELATIONS-FASEN** | Nære egne Places finnes, men nærhet er ikke relasjonsevidens. Ingen ny direktefane produseres i fase-7-auditen. |
| Kunnskap / Observasjoner | **BEGRUNNET IKKE MATERIALISERT** | Repo-/place-audit fant ingen egen source-eid Youngstorget-pakke som krever en direktefane nå. |

## 7A – Om

Om har allerede riktig hovedartikkel og romlig profil. 7A skal derfor være en **bevarings-/runtime-QA**, ikke en ny innholdsproduksjon:

1. behold `desc`/`popupDesc` uendret;
2. behold `spatial_profile` uendret;
3. bekreft at `popupDesc` faktisk er hovedartikkel i Om;
4. bekreft at spatial-profilen faktisk havner i Om;
5. bekreft at fravær av egen Youngstorget-Leksikonfil ikke injecter en annen place-/batch-artikkel som fallback;
6. ikke render `temporal_profile` som parallell milepælrad når samme stoff allerede eies av Historie/hovedartikkelen;
7. legg bare regresjonstest dersom dagens testdekning ikke allerede beviser disse grensene.

Hvis denne QA-en passerer uten konkret regresjon, klassifiseres 7A som **ALLEREDE FERDIG** uten canonical dataendring.

## 7B – Historie

- behold de fire `history_layers` fra fase 6;
- ikke lag ekstra chronology bare fordi feltet er tilgjengelig i popupkontrakten;
- kontroller at lagene faktisk havner i Historie-fanen;
- vurder `temporal_profile` sammen med history layers og chronology-grensen, i tråd med Torggata-referansen;
- kontroller at 1890/storystoff ikke dupliseres ordrett som Story og tidslinje;
- chronology opprettes bare dersom en konkret datert milepæl trenger egen presentasjon som ikke allerede dekkes godt av profilene.

## 7C – Fortellinger

Den aktive storyen `st_youngstorget_mayday` har et godt emne, men svak nåværende episodeform:

- `year: 1930` er et bredt anker uten en konkret 1930-hendelse i storyteksten;
- teksten generaliserer «første halvdel av 1900-tallet» og 1. mai i stedet for å drive én dokumentert scene;
- source labels er strenger, ikke `episode_v1`-kildeobjekter;
- `next_scenes` til Stortinget er tematisk plausibel, men må bevises som faktisk narrativ fortsettelse eller fjernes;
- source packen har et sterkere dokumentert episodeanker: 1. mai 1890-prosesjonen fra Youngstorget til Tullinløkka, uten den tilbakeholdte «første»-påstanden.

7C skal gjøre en reell Story-revisjon etter `STORIES_DATA_GOVERNANCE.md`, ikke bare pusse tekst.

## 7D – Før/etter

Beste dokumenterte forandringsakse i dagens source pack er selve torgets 1990-tallsomarbeiding og 1996-gjenåpning/endret trafikkmønster/fontenekopi. Dette er bedre place-eierskap enn å bruke Folkets Hus, Folketeaterbygningen eller annet nabobygg som proxy.

Før produksjon kreves:

- historisk Youngstorget-bilde med dokumentert kilde og publiseringsrett/attribusjon;
- nyere bilde av samme meningsfulle plassrom/vinkel;
- tydelig `before`, `now`, `change` og eventuelt `lookFor`;
- separate bilde-source pages og lisenser;
- kontroll mot canonical nabosteder.

## 7E – Nyheter

Fasen har faktisk relevant nåtidsmateriale og skal ikke få filler eller tom N/A:

- Oslo Museum dokumenterte 8. mars-program på Youngstorget i 2026;
- LO Oslo dokumenterte 1. mai-markeringen på Youngstorget i 2026;
- Oslo kommune beskriver pågående arbeid med utleie, arrangementer og balansen mellom hverdagsbruk og store hendelser.

Notisene skal presentere hva som skjedde/er under arbeid med dato og HTTPS-kilde. De skal ikke generaliseres til udokumenterte lange tradisjoner og skal ikke blåses opp til Stories.

## 7F – Lesespor

Eksisterende entries:

- `lesespor_youngstorget_001` – «Oslos største torg fortjener en bedre fremtid»;
- `lesespor_youngstorget_002` – «Oslo før: Så samles vi på ... Youngstorget»;
- `lesespor_youngstorget_003` – «Mener Youngstorget har mistet sin identitet ...»;
- `lesespor_youngstorget_004` – «Lut lei av partytelt på Youngstorget».

Alle er Aftenposten-spor. 7F skal kontrollere den registrerte `access`-verdien for hvert enkelt entry mot dagens runtimefilter. Den åpne popupen skal ikke omgå abonnement ved å endre metadata uten reelt tilgangsbevis.

## 7G – Kilder

Kilder-fanen skal få direkte HTTPS-oppslag til de viktigste allerede verifiserte familiene, minst:

- Oslo kommune – Youngstorget;
- Oslo byleksikon – Youngstorget;
- Arbeiderbevegelsens arkiv og bibliotek – «Det røde torg»;
- Arbeiderbevegelsens arkiv og bibliotek – Åttetimersdagen del 3;
- OSM relation 12773689 – kun som geometri/identitet.

`source_summary.safe_sources` beholdes som labels. `externalLinks` skal være brukerrettede og dedupliserte; tekniske audits, interne rapporter, held-back claims og Content Factory-filer skal ikke eksponeres.

## 7H – Språk

Språk behandles som et mulig **stedsnavn-/språkhistorisk** spor, ikke som en tvungen dialektfane. Før beslutning må Språkleksikon-kontrakten brukes til å undersøke:

- offisielt `Nytorvet` 1852–1951;
- `Youngstorget` som senere offisielt navn fra 1951;
- dokumentert navnerelasjon til Jørgen Young;
- eventuell eldre/folkelig navnebruk bare dersom kildene uttrykkelig støtter den;
- etymologi og uttale bare hvis de kan kildebelegges, ikke gjettes.

Hvis dette etter egen audit ikke gir en rik nok språkoppføring, avsluttes Språk med begrunnet N/A. Vi skal ikke skrive generisk «torg»-etymologi bare for å få en fane.

## Delstegrekkefølge

Fase 7 deles i små, reviewbare PR-er:

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Nyheter → 7F Lesespor → 7G Kilder → 7H Språk
```

Spor & objekter, relasjoner og andre direktefaner holdes hos sine senere canonical eierfaser når de er avhengige av Object-/relations-/Knowledge-data. Fase 7 skal ikke forhaste disse for å gjøre fanestripen lengre.

Fase 7 som helhet blir først **GODKJENT** når alle relevante delsteg er ferdige, begrunnede N/A-er er dokumentert, relevante runtime-/data-/story-gater er grønne og sluttresultatet er kontrollert på faktisk `main`.

## Modell- og kredittstatus audit

- produksjonsmodellkall: **0**;
- token-/API-kreditter brukt til innholdsproduksjon: **0**;
- auditen gjenbruker allerede verifisert Content Factory-evidens og canonical repo-data;
- dette reduserer ikke senere innhold. 7C/7D/7E/7H skal gjøre ny research der deres eierkontrakt krever det.
