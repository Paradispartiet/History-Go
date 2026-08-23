# Youngstorget – fase 6 strukturerte place-profiler v1

Dato: 2026-08-23  
Place ID: `youngstorget`  
Baseline: `main` etter fase-5-merge `2ee41fbfc861d3cdf7aecddffc3246d28c3308b5`  
Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md` fase 6 og `docs/PLACE_STANDARD.md` §10  
Content Factory evidence pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: #5222 / 2ee41fbfc861d3cdf7aecddffc3246d28c3308b5
SISTE GODKJENTE TILSTAND: canonical Youngstorget hadde verifisert OSM-geometri, claim-dekket desc/popupDesc og fase-5 production packet, men ingen spatial_profile, temporal_profile, history_layers, subplaces, nature_profile eller source_summary.
KONKRET REGRESJONSEVIDENS: ingen
BESLUTNING: REELT NYTT ARBEID – materialiser bare profiler som source packen faktisk bærer; ikke fyll subplaces/nature for completeness.
```

## Evidensgrunnlag

Fase 6 bruker bare allerede verifiserte Youngstorget-claims fra Pilot 01-pakken og fase-3-geometrien. Ingen Torggata- eller Brugata-claim er restemplet som Youngstorget-fakta.

Viktigste claim-ankere:

- `cf01_young_identity_001` – torgets avgrensning og Torggatas kryssing;
- `cf01_young_history_001` – anlagt i 1846;
- `cf01_young_name_001` – Nytorvet som offisielt navn fra 1852 til 1951;
- `cf01_young_name_002` – Youngstorget som offisielt navn fra 1951;
- `cf01_young_market_001` – landbruks-/kveghandel og markedstrafikk fra Stortorvet;
- `cf01_young_basar_001` – basaren fra 1870-årene som fysisk markedsspor;
- `cf01_young_event_1890_001` – dokumentert 1. mai-prosesjon fra torget i 1890 uten sterk «første»-påstand;
- `cf01_young_labour_001` – arbeiderbevegelsens samlingssted og massemøter i 1920-/1930-årene;
- `cf01_young_object_001` – Pioneren avduket i 1958;
- `cf01_young_object_002` – fredsmonumentet reist i 1997;
- `cf01_young_change_1996_001` – omfattende omarbeiding og 1996-milestone;
- phase-3 coordinate evidence – `osm-relation:12773689` / `verified_geometry`.

Sterke tilbakeholdte «første»-claims for 1890, 1898 og 1956 er fortsatt holdt ute.

## Profilbeslutninger

### `spatial_profile` — PASS

Youngstorget er et navngitt offentlig torg. Profilen skiller selve plassflaten fra nabobygg og gater som har egne canonical identiteter.

- `place_form`: `offentlig_torg`;
- canonical scope = Youngstorgets navngitte plassflate;
- Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate og Folketeaterkvartalet brukes som kildebelagt grensekontekst;
- Torggata registreres som kryssende gate, ikke som del av Youngstorgets egen gatehistorie;
- OSM relation `12773689` er fortsatt den verifiserte navngitte geometrikilden;
- det publiseres ikke et oppdiktet arealmål. `r=150` brukes ikke som fysisk areal.

### `temporal_profile` — PASS

Seks hovedmilepæler materialiseres, ikke detaljert chronology:

1. 1846 – torget anlagt;
2. 1852 – offisielt navn Nytorvet;
3. 1890 – dokumentert arbeiderdemonstrasjon fra Youngstorget til Tullinløkka;
4. 1951 – Youngstorget blir offisielt navn;
5. 1958 – Pioneren avdukes;
6. 1996 – torget åpner igjen etter omfattende omarbeiding.

1997-fredsmonumentet beholdes i history layer, men temporal_profile begrenses til seks hovedmilepæler for å unngå at feltet blir en sekundær chronology.

### `subplaces` — BEGRUNNET N/A

Source packen dokumenterer ingen stabile, navngitte interne soner under Youngstorget som bør bli subplaces. Gatene og institusjonene rundt torget er egne steder/objekter eller relasjonskandidater, ikke kunstige delsoner av plassflaten. Feltet materialiseres derfor ikke.

### `history_layers` — PASS

Fire korte lag materialiseres for Historie-flaten:

1. **Markedstorget blir til** – 1846–1870-årene;
2. **Arbeiderbevegelsens samlingsrom** – 1890–1930-årene;
3. **Nytt navn og synlige minnespor** – 1951–1997;
4. **Torget bygges om** – 1990-årene–1996.

Lagene sammenfatter dokumenterte stedsskifter og erstatter ikke canonical chronology, Stories eller senere Object-produksjon.

### `nature_profile` — BEGRUNNET N/A

Oslo kommune dokumenterer plantekasser/beplantning som byromstiltak, men source packen gir ikke Youngstorget en naturfaglig hovedrolle, habitatprofil eller observerbar naturkarakter som forsvarer et `nature_profile`. Å legge inn et slikt felt nå ville være completeness-filler. Natur vurderes på nytt bare dersom senere stedsspesifikk evidens faktisk åpner flaten.

### `source_summary` — PASS

Brukerrettet kildeoversikt materialiserer fem sikre, eksterne kilder som dekker identitet, historie, mobilisering og geometri:

- Oslo kommune – Youngstorget;
- Oslo byleksikon – Youngstorget;
- Arbeiderbevegelsens arkiv og bibliotek – Lill-Ann Jensen: *Det røde torg*;
- Arbeiderbevegelsens arkiv og bibliotek – *Åttetimersdagen del 3*;
- OpenStreetMap relation 12773689 – Youngstorget.

Interne audits, researchnotater og History GO som selvkilde er ikke lagt i `safe_sources`. Eventspesifikke 2026-kilder kan eies av senere Nyheter/current-fase og er ikke nødvendig for å gjøre denne basislisten rik eller korrekt.

## Bevaringskontroll

Fase 6 endrer ikke:

- `desc`, `popupDesc` eller fase-5-hashene/pakken;
- `year`, kategori, underbadges eller `emne_ids`;
- koordinatpunkt, radius eller OSM source identity;
- bilde, cardImage, credit eller lisens;
- quiz, Stories, People, Brands, Objects eller rundinger;
- legacy `layers.populaerkultur`, tags/knagger eller andre senere saneringsflater;
- popupfanenes separate fase-7-godkjenning.

## Modell- og kredittbudsjett

- produksjonsmodellkall: **0**;
- token-/API-kredittbudsjett brukt i fase 6: **0**;
- årsak: eksisterende, allerede verifisert Content Factory claim-bank og fase-3-geometri er tilstrekkelig for akkurat disse strukturerte profilene;
- dette er researchgjenbruk, ikke kvalitetsreduksjon. Evidensgapene `subplaces` og `nature_profile` løses med begrunnet N/A, ikke filler.

## Fase-6-konklusjon før CI

Innholdet er **KLAR FOR REVIEW**. Fase 6 kan først klassifiseres `FERDIG OG MERGET` når relevant data-/Place-/Politikk-CI er grønn og resultatet er kontrollert på faktisk `main`.

Neste fase etter grønn merge er **fase 7 – popupfaner**, én fane/reviewflate av gangen. Ingen fase-7-data er produsert i denne PR-en.
