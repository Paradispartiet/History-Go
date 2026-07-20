# Botsfengselet people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- `karl_rognstad` — eksisterende Botsfengselet-anker i `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`

Karl «Sving Deg» Rognstad-koblingen beholdes dersom den er til stede. Den er dokumentert som fysisk opptreden i Botsfengselets luftegård og gjør denne jobben til en coverage-utvidelse.

## Canonical audit og handlinger

- `heinrich_ernst_schirmer` — **updated_existing** — `data/people/by/oslo/gamle_aker_kirke/heinrich_ernst_schirmer.json`
- `jacob_wilhelm_nordan` — **updated_existing** — `data/people/politikk/oslo/people_politikk_oslo.json`
- `paul_magnus_norum` — **created_new** — `people/historie/oslo/botsfengselet/paul_magnus_norum.json`
- `richard_petersen_fengselsdirektor` — **created_new** — `people/historie/oslo/botsfengselet/richard_petersen_fengselsdirektor.json`

## Streng stedsgate

- Heinrich Ernst Schirmer: arkitekt for hovedanlegget som åpnet i 1851.
- Jacob Wilhelm Nordan: arkitekt for fengselskirken i 1880-årene.
- Paul Magnus Norum: Botsfengselets første direktør.
- Richard Petersen: direktør fra 1858 til 1892.

Alle nye koblinger gjelder konkret bygging eller ledelse i Botsfengselet. Ingen generell norsk straffereform-assosiasjon er nok.

## Kilder

- Store norske leksikon: Botsfengselet.
- Store norske leksikon / Norsk biografisk leksikon: Heinrich Ernst Schirmer og Jacob Wilhelm Nordan.
- Historisk befolkningsregister: Richard Petersen ved Bodsfængslet i 1865.

## Runtime-gater

Materializeren registrerer eksisterende Botsfengselet-ankere uten å slette dem og stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person. Etter materialisering skal repoets ordinære People- og Places-gater passere.
