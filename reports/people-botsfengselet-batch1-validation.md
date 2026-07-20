# Botsfengselet people batch 1 validation

Dato: 2026-07-20

## Eksisterende coverage før batchen

- `karl_rognstad` — Karl «Sving Deg» Rognstad — `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`

Eksisterende coverage er bevart. Batchen krever entydig canonical match per kandidat og oppretter bare personer som faktisk mangler.

## Canonical audit og handlinger

- `heinrich_ernst_schirmer` — **updated_existing** — `data/people/by/oslo/gamle_aker_kirke/heinrich_ernst_schirmer.json`
- `jacob_wilhelm_nordan` — **updated_existing** — `data/people/politikk/oslo/people_politikk_oslo.json`
- `paul_magnus_norum` — **created_new** — `people/historie/oslo/botsfengselet/paul_magnus_norum.json`
- `richard_petersen_fengselsdirektor` — **created_new** — `people/historie/oslo/botsfengselet/richard_petersen_fengselsdirektor.json`

## Streng stedsgate

- Heinrich Ernst Schirmer: dokumentert arkitekt for hovedanlegget som åpnet i 1851.
- Jacob Wilhelm Nordan: dokumentert arkitekt for fengselskirken i 1880-årene.
- Paul Magnus Norum: dokumentert som Botsfengselets første direktør.
- Richard Petersen: dokumentert som direktør fra 1858 til 1892; folketellingen 1865 plasserer ham som fengselsdirektør på Bodsfængslet/Grønlandsleret 44.

Alle nye eller utvidede koblinger gjelder konkret bygging, ledelse eller fysisk institusjonsvirksomhet i Botsfengselet.

## Kilder

- Store norske leksikon: Botsfengselet.
- Store norske leksikon / Norsk biografisk leksikon: Heinrich Ernst Schirmer og Jacob Wilhelm Nordan.
- Digitalarkivet / Historisk befolkningsregister: Richard Petersen ved Bodsfængslet i 1865.
- Digitalarkivet 1875 og historisk sekundærlitteratur ble brukt til å løse P.M. Norum til Paul Magnus Norum.

## Runtime-gater

Materializeren stopper ved mer enn én canonical match for en kandidat. Eksisterende Botsfengselet-coverage bevares, eksisterende personer oppdateres i stedet for å dupliseres, og nye manifestregistreringer opprettes bare for kandidater uten canonical match.
