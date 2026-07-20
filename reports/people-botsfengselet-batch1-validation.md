# Botsfengselet people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- `karl_rognstad` — eksisterende og beholdt Botsfengselet-anker i `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`

Karl «Sving Deg» Rognstad-koblingen er dokumentert som fysisk opptreden i Botsfengselets luftegård. Batchen er derfor en coverage-utvidelse, ikke en zero-coverage-batch.

## Canonical audit og faktiske handlinger

- `heinrich_ernst_schirmer` — **updated_existing** — `data/people/by/oslo/gamle_aker_kirke/heinrich_ernst_schirmer.json`
- `jacob_wilhelm_nordan` — **updated_existing** — `data/people/politikk/oslo/people_politikk_oslo.json`
- `paul_magnus_norum` — **created_new** — `people/historie/oslo/botsfengselet/paul_magnus_norum.json`
- `richard_petersen_fengselsdirektor` — **created_new** — `people/historie/oslo/botsfengselet/richard_petersen_fengselsdirektor.json`

Schirmer beholder `gamle_aker_kirke` som primæranker. Nordan beholder `youngstorget` som primæranker og sine eksisterende stedskoblinger. Manifestet fikk bare de to faktisk nye enkeltfilene.

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

## Materialisering og validering

Materializeren:

- registrerte og beholdt eksisterende `karl_rognstad`
- fant entydig canonical gjenbruk for Schirmer og Nordan
- fant ingen canonical treff for Norum og Petersen
- opprettet bare de to nye personfilene
- regenererte `data/Civication/historyPeople_index.json`
- kjørte `bash scripts/check-people.sh` med success
- kjørte `git diff --check`
- fjernet one-shot-scriptet og gjenopprettet ordinær `data-checks.yml` før publisering

Den publiserte data-headen skal i tillegg passere ordinær GitHub Actions `People data` og `Places data` før merge.
