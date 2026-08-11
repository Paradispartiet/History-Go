# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Aktiv `main` ved 3c-protokollstart: `9241478a2a0f9b1fa1f7165ad9508a73d997dbfd`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Coordinate research: `reports/place-production/torggata-coordinate-research-v2.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

## Fasestatus

| Fase | Status | Merge/live-check |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388`; rapport kontrollert på `main` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49`; arbeidskort kontrollert på `main` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0`; kildebase og arbeidskort lest tilbake fra `main` |
| 3a. Coordinate research | **GODKJENT** | PR #4797, merge `1d63e77d63a3f876ff85545866320d4f52e207cc`; researchrapport lest tilbake fra `main` |
| 3b. Canonical coordinate apply | **GODKJENT** | PR #4799, merge `a54354607fda66d443130c76da9cbc09b9081eda`; canonical place/evidence kontrollert på `main` |
| 3c. Kart-QA + control protocol | **PÅGÅR – DATA/MAP-QA PASS, BROWSER-QA GJENSTÅR** | runtime-index synkronisert i PR #4800; control protocol og QA-rapport oppdateres nå |
| 4–15 | **IKKE STARTET** | se nullmålingen |

Bare én produksjonsfase regnes som aktiv om gangen. Fase 4 starter ikke før hele fase 3 er validert, merget, kontrollert på faktisk `main`, visuelt kartkontrollert og ført i coordinate-control-protokollen.

## Aktiv fase 3b – canonical coordinate apply

### LES FØRST gjennomført

- `docs/coordinates/README.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`
- `docs/coordinate-finder.md`
- `docs/coordinates/coordinate-control-protocol.md`
- `docs/coordinates/address-first-coordinate-policy.md`
- relevant fase 3-del i `docs/PLACE_PRODUCTION_CHECKLIST.md`
- `reports/place-production/torggata-coordinate-research-v2.md`

### Aktivt filscope

- `data/places/by/oslo/places/torggata.json`
- `data/coordinate-evidence/oslo/by/torggata.json`
- `reports/place-production/torggata-workcard-current.md`

Ingen desc/popupDesc-, Leksikon-, quiz-, Story-, People-, Brand-, Works-, Object-, fag- eller rundingssanering inngår i denne del-PR-en.

## Implementert coordinate-beslutning

Canonical identitet er fortsatt **Torggata fra Stortorvet til Ankertorget**.

Canonical place er nå endret fra en ufullstendig lengdemidtpunktmodell for Youngstorget–Ankertorget til en eksplisitt semantisk gateankermodell:

- `locatorType: street` beholdes;
- `coordStatus: verified_geometry` beholdes foreløpig som review-kandidat under coordinate-kontrakten;
- `geocodeAccuracy: semantic_anchor` og `coordRole: line_anchor` beholdes;
- displaypunktet er Youngstorget-arealets OSM-representasjonspunkt `59.91478, 10.74923` (`osm-way:112054930`);
- søranker er den navngitte Torggata-way-en `267226140` ved Stortorvet;
- midtanker er Youngstorget `112054930`;
- nordanker er `4844706` mot Ankertorget;
- de gamle to ankrene med reverserte navn er erstattet;
- den gamle 12-way `routeSegments`-kjeden er fjernet fordi den bare beskrev den nordlige komponenten og feilaktig ble presentert som hele Torggata;
- `r: 180` beholdes som gameplay-radius og beskrives eksplisitt ikke som gatens fulle geografiske utstrekning.

Det syntetiseres ikke en falsk eksakt centerline gjennom Youngstorget. OSM-modelleringsgapet mellom navngitte gatekomponenter og torgarealet beholdes synlig i evidensen.

## Coordinate-evidence

Evidence-filen er samtidig omskrevet slik at den nå dokumenterer:

1. Oslo byleksikons identitets- og krysningsbevis;
2. sørlig Torggata-way `267226140`;
3. Youngstorget-areal `112054930` som semantisk line-anchor;
4. den tidligere researchens dokumenterte feilårsak og inferensgrense;
5. nye coordinate candidates og full identitetsbeslutning.

Evidence-filen påstår ikke lenger at en 12-way-kjede fra Youngstorget til Ankertorget er komplett gategeometri for Torggata.

## Porter som gjenstår før merge av 3b

Fordi lokal `gh`/repo-runner ikke er tilgjengelig i denne kjøringen, skal GitHub Actions/PR-CI være kjørende validator for branchen. Relevant CI må minst dekke eller utløse de samme kontraktene som disse canonical kommandoene:

```text
npm run test:coordinate-source-contract
npm run places:coords:evidence:audit
npm run places:coords:quality
npm run places:coords:intake
npm run audit:places-split-manifest-sync
npm run places:index:check
```

Hvis CI avdekker schema-/contractfeil, korrigeres 3b-branchen før merge. Teknisk grønt resultat er ikke nok til å avslutte hele fase 3; kart-QA og control protocol står igjen i 3c.

## Neste delsteg etter grønn merge

**Fase 3c – kart-QA + coordinate-control-protokoll.**

Der skal:

- canonical place og generert/runtime-index sammenlignes;
- markøren kontrolleres visuelt på kartet som Torggata/Youngstorget-anker;
- sør/midt/nord-representasjonen kontrolleres mot stedets faktiske identitet;
- nærliggende Youngstorget-, Storgata- og andre canonical markører kontrolleres for misvisende overlap;
- `docs/coordinates/coordinate-control-protocol.md` oppdateres med korrigert Torggata-beslutning;
- fase 3 først da settes **GODKJENT**.

## Kjente andre blokkeringer som ikke røres i fase 3

### Leksikon

Torggata-oppføringen har tomme kildefelt for hovedoppføring, facts og chronology. Dette repareres først i popup/Leksikon-fasen etter riktig kontrakt.

### Rundinger

Den gamle ni-runders Torggata-auditen er historikk, ikke dagens canonical proof. Sanering skjer først i egen rundingsfase etter `data/places/README_place_rounds.md`.

### Fagkoblinger

Kategori `by` og dagens `em_by_*` revideres først i fase 4 etter category- og Fagverk-kontraktene. Coordinate-fasen skal ikke drive faglig omklassifisering.

## Forrige delsteg merget og live-kontrollert

**Ja.** Coordinate research ble squash-merget i PR #4797 med merge `1d63e77d63a3f876ff85545866320d4f52e207cc`, og researchrapporten ble lest tilbake fra faktisk `main`.

## Fase 3c – QA-status

- **Canonical/source vs generated runtime-index:** PASS etter PR #4800.
- **Coordinate-contract, quality, intake, evidence og manifest/index-gates:** PASS i coordinate runner run `31464230957`.
- **Nærliggende canonical objekter:** PASS som identitetsaudit. `youngstorget` er et separat square-objekt tett på Torggata-ankeret; `storgata` er et separat gateløp. Ingen av dem skal slås sammen med `torggata`.
- **Control protocol:** oppdatert i denne del-PR-en med korrigert sourceObjectId og korrigeringshistorikk.
- **Interaktiv History-Go-kartkontroll i faktisk browser:** **GJENSTÅR**. Denne kjøringen har ikke en HTML-browser som kan åpne GitHub Pages-kartet; derfor settes denne gaten ikke til PASS på grunnlag av data- eller kildekart alene.

Fase 4 starter først når browser-QA er reelt utført eller en automatisert browsergate i repoet gir tilsvarende direkte kontroll av den faktiske History-Go-kartflaten.

**Fase 3 som helhet er fortsatt PÅGÅR.**
