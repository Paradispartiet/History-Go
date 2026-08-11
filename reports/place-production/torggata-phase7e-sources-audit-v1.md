# Torggata – fase 7E Kilder audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Fase-7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- Baseline: 7D Før/etter merget i PR #4826, merge `3c6b12635438ef07947a82f972d09a0eab50ff6e`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT 7E-PR/COMMIT: ingen funnet
EKSISTERENDE DATA: source_summary.safe_sources, place.externalLinks, Torggata-leksikon externalLinks og 7D for_na.sources finnes
BESLUTNING: RETROFIT – gjør hele eksisterende kildesettet inspectable i brukerflaten uten å flytte sannhet til popup-runtime
```

## Problem før 7E

Kilder-fanen hadde allerede en god grunnstruktur:

- `source_summary.safe_sources` viste syv sikre kildenavn;
- place-recorden hadde klikklenker til Oslo byleksikon – Torggata og OSM;
- Torggata-leksikonet hadde flere navngitte `externalLinks`;
- 7D la til fem eksterne fakta-/bildekilder i `for_na.sources`.

Men dekningen var ufullstendig:

1. `Oslo byleksikon – Eldorado` og `Oslo byleksikon – Torggata bad` stod som sikre kildenavn uten egne navngitte klikklenker i configured source-laget;
2. Arkitektur skaper verdi og TØI fra Før/etter kunne ellers havne som generiske «Bilde- og sammenligningskilde»-lenker;
3. de to Commons-kildesidene kunne tilsvarende få generisk label selv om fotograf/lisens allerede var dokumentert i 7D.

## Løsning

Den frittstående, manifest-lastede Torggata-hovedartikkelen oppgraderes til version 4 og får et komplett brukerrettet `externalLinks`-sett.

Nye/eksplisitte navngitte lenker omfatter:

- Oslo byleksikon – Eldorado;
- Oslo byleksikon – Torggata bad;
- Arkitektur skaper verdi – Torggata;
- TØI – Konflikter mellom gående og syklende;
- Wikimedia Commons – Torggata før ombyggingen (2009);
- Wikimedia Commons – Torggata etter ombyggingen (2017).

Eksisterende navngitte lenker til Lokalhistoriewiki, SNL, Rockefeller, Torggata Gateforening og Oslo byleksikon – Torggata beholdes.

Place-recordens OSM-lenke beholdes som eier av gategeometrikilden.

## Hvorfor dette virker uten runtimeendring

`place-popup-tabs.js` bygger configured links fra:

```text
place.externalLinks + visible leksikon articles.externalLinks
```

Deretter bygges Før/etter-lenker fra `for_na.sources` og bildekildesidene. Til slutt dedupliseres på URL med configured links **før** generiske Før/etter-lenker.

Når 7D-kildens URL nå også finnes som en navngitt `externalLink`, beholdes den navngitte varianten og den generiske varianten faller bort.

7E trenger derfor ingen ny popupkode og ingen ny sannhetskilde.

## Dekning av `source_summary.safe_sources`

Alle syv sikre kildefamilier har nå en inspectable HTTPS-lenke i det sammenslåtte configured source-laget:

1. Oslo byleksikon – Torggata;
2. Oslo byleksikon – Eldorado;
3. Oslo byleksikon – Torggata bad;
4. Store norske leksikon – lydfilm;
5. Rockefeller – booking og utleie;
6. Torggata Gateforening – Om Torggata;
7. OpenStreetMap – navngitt Torggata-geometri.

## Før/etter-kilder

Alle fem URL-er i `for_na.sources` har en navngitt configured link:

- Oslo byleksikon – Torggata;
- Arkitektur skaper verdi – Torggata;
- TØI – Konflikter mellom gående og syklende;
- Commons 2009;
- Commons 2017.

Begge `beforeImageMeta.sourcePage` / `nowImageMeta.sourcePage` har dermed samme meningsfulle navngivning i Kilder-fanen som i bildeattribusjonen.

## Intern/teknisk data holdes ute

Ingen `reports/place-production/**`, coordinate-audit, claim-ID, quizrapport eller annen intern produksjonsmetadata legges i `externalLinks`.

Kilder-fanen viser eksterne oppslag; interne audits forblir kun produksjonsevidens.

## Bevisst ikke gjort

- ingen endring i canonical Torggata place-record;
- ingen endring av `source_summary.safe_sources` bare for å fylle URL-felt;
- ingen runtimeendring;
- ingen endring av Om, Historie, Story eller Før/etter-tekst;
- ingen endring av koordinater, Quiz, People, Brands eller rundinger;
- ingen intern rapport gjøres brukerrettet.

## Regresjonslås

`tests/torggata-phase7e-sources.test.mjs` låser:

1. unike HTTPS-URL-er og meningsfulle labels i Torggata-leksikonets `externalLinks`;
2. ingen audit-/report-/internal-lenker;
3. klikkbar dekning for alle `source_summary.safe_sources`;
4. navngitt configured link for alle fem `for_na.sources`;
5. navngitt configured link for begge Commons-kildesider;
6. navngitte Eldorado-, Torggata bad-, Arkitektur skaper verdi- og TØI-lenker;
7. runtime-rekkefølgen configured links → generic before/after → URL-deduplisering.

7E settes først **GODKJENT** etter relevant CI, squash-merge og kontroll på faktisk `main`. Når dette er gjort, er alle reelle delsteg i popupfase 7 ferdige og fase 7 kan lukkes som egen liten statusleveranse.
