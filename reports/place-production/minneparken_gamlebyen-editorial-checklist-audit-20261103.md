# Minneparken — redaksjonell kontroll mot Place Production Checklist
Dato: 2026-11-03  
Sted: `minneparken_gamlebyen`  
Status: **DELLEVERANSE — IKKE v1 / IKKE vFerdig / IKKE V3 complete**

## Omfang og kilder

Denne endringen forbedrer bare det manifeststyrte Leksikon-innholdet i `data/leksikon/places/oslo/historie/leksikon_minneparken_gamlebyen.json`. Original Place, generert place-indeks, place-open-payload, quiz, bilder og spill-runtime er ikke endret. Leksikon-revisjonen krever derfor fortsatt reell app-kontroll før den kan kalles publisert.

Eksterne kilder kontrollert 2026-11-03:
- Oslo kommune, [Minneparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/) — stedets ruiner, 1932, E18 og tilbakeføringsplan.
- Oslo byleksikon, [Minneparken](https://oslobyleksikon.no/side/Minneparken) — beboernes eldre nærpark, bystyrevedtaket 1918, Fischers 1928-plan og åpningen 1932.
- Oslo kommune, [Nå blir det mer liv i Middelalderbyen](https://aktuelt.oslo.kommune.no/na-blir-det-mer-liv-i-middelalderbyen) (28.06.2024) — betongdekket fjernet i 2024 og planlagt tilgjengelighet.
- Middelalder-Oslo, [Minneparken og Hallvardskatedralen](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen) (Petter Molaug, november 2025) — apside/sørmur og manglende sluttføring av gangsti og gressareal ved publisering.

## Reviderte Leksikon-punkter

- Mer stedsspesifikk, sammenhengende artikkel om middelalderens kirkebygninger, lokale parkinteresser, arkeologiske undersøkelser, trafikkinngrepet og tilbakeføringen.
- Korrigert tidsstatus: betonglokket ble fjernet i 2024; ikke anta at hele parkanlegget var ferdig da. Tilretteleggingen omtales med eksplisitt november 2025-datering.
- Nye dokumenterte fakta om 1918, Fischer/1928 og E18; styrket fakta-/kildekobling.
- Kronologipunkter for **1918, 1928, 1932 og 2024**, uten oppdiktet enkeltår for veiinngrepet på 1960-tallet.
- Ingen nye oppdiktede People, Objects, Brands, Stories eller overlappende Place-identiteter.

## Checklist-status (ingen ferdigmarkering uten evidens)

| Krav | Vurdering per 2026-11-03 | Åpent arbeid |
| --- | --- | --- |
| Place-identitet og geografi | Foreløpig bevart | Koordinatrollen er allerede `area_anchor`; full egen verifikasjon og områdegrense gjenstår |
| Hovedbadge | Historie finnes | `underbadge_ids` mangler i Place-kilden; vurder `middelalder`, `byhistorie` og `kulturminner_og_bevaring` etter kilde-/badge-gate |
| Eksterne stedsfakta | Leksikon oppdatert | Full claim-/sourceLocation-/setningsparitet i `data/places/production/` mangler |
| `desc` og `popupDesc` | **BLOCKED** | Stedets originale `popupDesc` har spill-/produksjonsmetatekst; skal erstattes av claimsporet historisk prosa og teksthash-reviews |
| Fagverk-sted | **BLOCKED** | Place-filen mangler egen strukturert `fagverk`-blokk; full kilde- og navigasjonskontroll trengs |
| Språkleksikon | **BLOCKED** | Ingen stedsspesifikk fil registrert ved denne inspeksjonen; konkret navne-/begrepsspor må kildebelegges |
| Kronologi/epoke | Delvis Leksikon | Canonical chronology-/epoke-evidens, generering og UI-kontroll gjenstår |
| People / Objects / Brands / historiske hendelser | **IKKE AVGJORT** | Kildeført kandidataudit og eventuelle medlem-/bildeflater. Fischer og Fett er forskningskandidater, ikke godkjente People. Ingen filler |
| `image` / `frontImage` | **BLOCKED** | Ingen publiserbare bildefelt i den inspiserte Place-kilden; rettigheter, stående fil og faktisk UI må kontrolleres |
| Quiz og QuizCard | **BLOCKED / UVERIFISERT** | Fullquiz, Knowledge, dedikert kort og flip-/browser-test er ikke dokumentert |
| Runtime og indeks | Ikke rørt | Source-endringer må etterfølges av `places:index:build`, `places:index:check` og place-open-regenerering |
| Manuell app-QA | Ikke utført | Stedspopup, Historie/Kilder, PlaceCard, bilder og mobil-/desktopvisning må kontrolleres |

## Før fullproduksjon

1. Gjennomfør READ-FIRST-gate for alle regelfiler i `AGENTS.md`, før felt- og samlingsvalg låses. Registrer `rule_preflight` og source-bounded workcard.
2. Bygg `data/places/production/minneparken_gamlebyen.json` med claims, presise sourceLocations, sentence→claim-paritet, teksthash og separate fakta-/språk-review. Historie-produksjonsrapport er også påkrevd ved revisjon av canonical Place.
3. Omskriv Place-kildens `desc` og `popupDesc`; regenerer avledede data via canonical verktøy **(ikke håndrediger `places_index.json`)**.
4. Produser og kontroller Fagverk-sted, Språkleksikon, kronologi/epoke, korrekte underbadges og faktiske kvalifiserte samlinger.
5. Gjennomfør kilde- og rettighetsklarert bildeproduksjon, fullquiz-/QuizCard-kontroll og reell app-QA før eventuell `v1`/`vFerdig`-status.

## Kvalitetsscore for denne begrensede leveransen

| Dimensjon | Score (1–5) | Begrunnelse |
| --- | ---: | --- |
| Korrekthet og evidens | 4 | Fire inspiserbare kilder; attribuert 2025-status; ingen ukjent eksakt E18-dato |
| Dekning/ferdigstillelse | 2 | Leksikon-del levert, sentrale fullproduksjonskrav åpne |
| Faglig/redaksjonell kvalitet | 4 | Kildebundet konflikthistorie og stedsspesifikke aktører fremfor generisk oppsummering |
| Teknisk integritet | 2 | JSON kan syntakskontrolleres; ingen ordinære CI-/runtime-/app-tester er utført |
| Sikkerhet og ansvarlighet | 4 | Ingen sensitive data; uavklarte rettigheter og status markert som åpne |
| Vedlikeholdbarhet/etterprøvbarhet | 4 | Kun Leksikon-source + denne statusrapporten; kilde-URL-er og scope dokumentert |

**Sum: 20/30. Ikke høy kvalitet/fullstendig stedsproduksjon etter repoets port på 27/30.** Rapporten er en inspeksjon og arbeidsgrunnlag, ikke et endelig workcard eller et ferdigbevis.
