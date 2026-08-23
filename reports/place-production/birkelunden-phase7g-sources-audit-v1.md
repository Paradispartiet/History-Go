# Birkelunden – fase 7G Kilder audit v1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline: fase 7F merge #5280 / `090c299adba3d6a39f5f45f4ab930b2504e9200f`
- Canonical Kilder-owner: `data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json`
- Status: **KLAR FOR REVIEW / CI**

## Tidligere-arbeid-gate

Før 7G hadde Birkelunden fem `source_summary.safe_sources`, men Leksikon-ownerens brukerrettede konfigurasjon hadde ingen `externalLinks`. To av kildene fantes som `sources`-objekter, mens de øvrige bare var labels i place-data eller andre godkjente faser.

Torggata-presedensen viser at Kilder-fanen skal bruke navngitte HTTPS `externalLinks` som configured links, mens eksisterende runtime legger til Før/etter-kilder og dedupliserer hele settet på URL. Det bygges derfor ingen ny runtime og ingen ny sannhetskilde.

## Materialisert kildesett

Leksikon-owner oppgraderes fra version 2 til version 3 og får **syv dedupliserte HTTPS-lenker**.

Fem kjerne-evidenskilder:

1. Oslo kommune – Birkelunden;
2. Oslo byleksikon – Birkelunden;
3. Riksantikvaren – Birkelunden, Murbyens hjerte;
4. Pensjonistforbundet – Vår historie;
5. OpenStreetMap way 3236549 – Birkelunden.

To navngitte Før/etter-bildekilder:

6. Oslo Museum / Oslobilder – Birkelunden ca. 1930 (OB.Z02741);
7. Wikimedia Commons – Birkelunden fontene og musikkpaviljong (2013).

De fem første dekker alle labels i `place.source_summary.safe_sources`. De to siste gjør de unike bilde-/Før/etter-kildene forståelige som brukerrettede lenker i stedet for generiske URL-er.

`for_na.sources` inneholder også Oslo byleksikon og Riksantikvaren; disse URL-ene overlapper kjernesettet og skal derfor ikke materialiseres en gang til.

## Source-eierskap

`article.sources` beholdes uendret som evidensobjekter med `sourceLocation` og `verifiedAt`. `externalLinks` har en annen rolle: de gir brukeren inspectable navigasjon i Kilder-fanen.

7G flytter derfor ikke claims fra Place til Leksikon og gjør ikke Leksikon-owner til ny factual source-of-truth.

## Interne kilder er eksplisitt forbudt

Ingen intern:

- audit;
- report;
- production package;
- claim bank;
- Content Factory source pack;
- coordinate report

blir eksponert som brukerrettet `externalLink`.

Bare eksterne kilder som brukeren faktisk kan åpne inngår i Kilder-fanen.

## Runtime

Eksisterende `place-popup-tabs.js`:

1. samler configured links fra Place + Leksikon-artikler;
2. lager generiske Før/etter-lenker for source-URL-er som ikke allerede er navngitt;
3. kombinerer `configuredLinks` før `beforeAfterLinks`;
4. dedupliserer på URL.

Dermed vil 7G-navnene vinne for de syv eksplisitte kildene, uten runtime-endring eller place-ID-hardkoding.

## Preservation

Uendret:

- `desc` og `popupDesc` + fase-5-hasher;
- `spatial_profile.area_m2=16300`;
- `wikiText`, `facts` og `chronology` forblir tomme hos compatibility-owneren;
- `suppress_untitled_legacy_articles: true`;
- Story, Før/etter-data, News og Lesespor;
- canonical Place JSON;
- popup-runtime.

## Permanent gate

`tests/birkelunden-phase7g-sources.test.mjs` låser:

- version 3 og syv unike HTTPS `externalLinks`;
- alle fem `safe_sources` → konkret configured URL;
- alle fire `for_na.sources` → configured URL;
- begge `beforeImageMeta/nowImageMeta.sourcePage` → navngitt configured URL;
- meningsfulle labels for Oslobilder og Commons;
- ingen intern audit/report/production/claim/source-pack-lenke;
- runtime-rekkefølgen configured links → Før/etter-links → URL-deduplisering;
- description-hasher og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh`.

## Økonomi

Produksjonsmodell/API-kreditter i 7G: **0 eksterne modellkall**. Alle lenker kommer fra allerede godkjent Birkelunden-evidence; fasen er en inspectability-/eierskapsjobb, ikke en redusert researchjobb.

## Neste

Etter grønn merge: **7H – Språk**, med eksplisitt Språkleksikon-kontrakt og navnesporet Birkelunden → Bjerkelunden (1926) → Birkelunden (1955). Ingen generisk `torg`/`park`-etymologi eller oppfunnet dialekt.
