# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Aktiv `main` ved fasestart: `694310c4e9b1b009b38f530479d823621bf5a388`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

## Fasestatus

| Fase | Status | Merge/live-check |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388`; rapport verifisert på `main` |
| 1. Canonical identity/source | **GODKJENT** | Denne fasen endrer ingen place-data; kontrollresultatet er dokumentert nedenfor |
| 2. Kildebase | **NESTE – IKKE STARTET** | Kan først starte etter at fase 1 er merget og kontrollert på `main` |
| 3. Koordinater/geometri | **IKKE STARTET – kjent blokkering** | Skal lese coordinate-kontraktene før noen geometri endres |
| 4–15 | **IKKE STARTET** | Se nullmålingen |

Bare én produksjonsfase regnes som aktiv om gangen. Etter merge av dette kortet blir fase 2 neste aktive fase.

## Fase 1 – LES FØRST gjennomført

Før denne fasen ble følgende canonicale kontrakter lest:

- `docs/DATA_PRODUCTION_CONTRACT.md`
- `docs/FACTUALITY_CONTRACT.md`

I tillegg er `docs/PLACE_STANDARD.md` brukt som overordnet eierkart. Ingen senere subsystemkontrakt brukes som erstatning for disse.

## Canonical identity gate

| Kontroll | Status | Evidens og beslutning |
| --- | --- | --- |
| Ett place-object | **PASS** | `torggata` representerer den navngitte gaten Torggata som fysisk gateløp i Oslo. |
| Canonical ID | **PASS** | `torggata` beholdes. |
| Manifest-loadet source | **PASS** | `data/places/manifest.json` loader `data/places/by/oslo/places/torggata.json`; ingen aggregate-fil skal redigeres som canonical source. |
| Nåværende navn | **PASS** | `Torggata`. |
| Historiske navnevarianter | **PASS som søke-/identitetsvarianter** | `Øvre Torvegade` og `Torvegaden` finnes som dokumenterte historiske navn i Torggata-materialet og brukes i duplikatsøket, ikke som separate places. |
| Fysisk avgrensning | **PASS for identitet** | Canonical identitet er gaten fra **Stortorvet til Ankertorget**. Denne grensen støttes av Oslo byleksikon og samsvarer med brukerrettet place-/quizgrunnlag. |
| Duplikat | **PASS** | Ingen separat canonical gate-place ble funnet for Torggata eller de historiske navnevariantene. |
| Torggata Blad | **SEPARAT OBJEKT – BEHOLD** | `torggata_blad` er en egen Subkultur-identitet og må ikke merges inn i gate-place eller brukes som bevis for gateidentiteten. |
| Enkeltbygg/virksomheter | **IKKE DEL AV PLACE-IDENTITETEN** | Eldorado, Torggata bad/Rockefeller, John Dee, butikker og serveringssteder kan være relaterte objekter/case, men er ikke synonymt med `torggata`. |
| Kategori | **IKKE AVGJORT I DENNE FASEN** | `by` beholdes urørt frem til egen kategori/Badges/emne/Fagverk-fase. |
| Koordinat/geometri | **UTTRYKKELIG IKKE GODKJENT HER** | Identity-gaten avgjør hva stedet er; coordinate-gaten må senere avgjøre hvordan hele gateløpet modelleres. |

## Ekstern identitetskilde

Oslo byleksikon brukes som stabil ekstern gateidentitetskilde og beskriver Torggata som gaten **fra Stortorvet til Ankertorget**. Samme oppføring skiller den tidlige opparbeidingen fra Stortorvet til Youngstorget fra senere forlengelse videre nordover. Dette er tilstrekkelig til å låse objektgrensen for fase 1, men er ikke i seg selv nok til å produsere alle historiske claims i senere tekst-, Leksikon-, Story- eller quizfaser.

Den eksisterende OSM-evidensen brukes ikke til å overstyre denne identiteten. OSM har rolle som geometri/topologi i coordinate-fasen.

## Kjent avvik som bæres videre

Gjeldende `data/coordinate-evidence/oslo/by/torggata.json` og place-filens `routeSegments` modellerer bare **Youngstorget–Ankertorget**, mens den nå låste canonical identiteten er **Stortorvet–Ankertorget**.

Fase 1 gjør derfor følgende eksplisitte skille:

- **identitet/source: GODKJENT**;
- **coordinate geometry: IKKE GODKJENT**.

Avviket skal ikke løses ved å innsnevre place-identiteten uten kilde, og det skal ikke løses ved å gjette manglende OSM-segmenter. Fase 3 må lese alle coordinate-kontraktene, gjøre fersk topologikontroll og oppdatere place/evidence samlet dersom full gategeometri kan dokumenteres.

## Behold / ikke gjør nå

### Behold

- `id: torggata`;
- den manifest-loadede source-filen;
- gate som objektklasse;
- Stortorvet–Ankertorget som canonical identitetsgrense;
- `torggata_blad` som separat Subkultur-place;
- alle øvrige Torggata-subsystemer urørt inntil deres egen fase.

### Ikke gjør i fase 1

- ikke endre koordinater, radius, anchors eller `routeSegments`;
- ikke omskriv `desc` eller `popupDesc`;
- ikke endre kategori, `emne_ids` eller Badges;
- ikke saner rundinger ennå;
- ikke flytt `civication_store` til Objects mekanisk;
- ikke reklassifiser Works;
- ikke rediger Leksikon, Story, Quiz, People, Brands eller Lesespor;
- ikke sett Torggata til produksjonsklar.

## Neste fase

**Fase 2: Kildebase.**

Målet er å lage et inspectable stedsspesifikt source/claim-inventar før noen brukerrettet tekst eller struktur revideres. Fasen skal skille:

- gateidentitet og navnehistorie;
- opparbeiding og fysisk utvikling;
- handel, servering og underholdning;
- konkrete bygg/institusjoner i gaten;
- gateombygging, gange, sykkel og offentlig regulering;
- dokumenterte endringer i bruk, omdømme og kommersiell struktur;
- observerbare forhold fra sterkere analytiske påstander om gentrifisering, fortrengning, årsak og effekt.

Canonical fagfiler kan senere styre emnevalg og analyse, men skal ikke være faktakilde for disse claims.
