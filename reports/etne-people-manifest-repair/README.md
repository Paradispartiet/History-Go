# Etne people manifest repair — batches 4–8

Dato: 2026-07-18

## Problem

People of Places-batchene 4–8 var merget med grønne valideringer, og source-filene lå fortsatt på `main`, men fem manifestregistreringer var senere blitt fjernet. Dermed lastet runtime ikke 14 allerede godkjente Etne-personer.

Tapet skjedde i PR #2274 / commit `0ee158fe1a13cc3ebe05c914161e5082826d9a52` da `people_historie_etne_rounds_batch8.json` ble lagt til. Den samme manifestdiffen fjernet registreringene som tidligere var lagt inn av PR #2275–#2279.

## Gjenopprettede source-filer

- `people/media/vestland/etne/ann_margit_gronstad.json`
- `people/vitenskap/vestland/etne/etneelva_forskningsplattform_people_batch1.json`
- `people/musikk/vestland/etne/old_river_saloon/people_old_river_saloon_batch1.json`
- `people/kunst/vestland/etne/fugl_fonix/people_fugl_fonix_batch1.json`
- `people/kunst/vestland/etne/pippifestivalen/people_pippifestivalen_batch1.json`

Filene inneholder til sammen 14 personer. Ingen people-records, place-records eller canonical ID-er er opprettet eller endret i reparasjonen.

## Regresjonsvern

`tests/etne-people-manifest-integration.test.js` er koblet inn i `scripts/check-people.sh`. Testen kontrollerer at:

- alle fem source-filene er registrert nøyaktig én gang;
- de 14 forventede people-ID-ene er aktive og globalt unike;
- alle primære place-referanser er aktive;
- hver person har nøyaktig én lenke til sitt forventede Etne-sted;
- historie-batch 8 og 9 fortsatt er registrert;
- `stig_morten_sorheim` beholder `abc_studio_etne` som primæranker og én sekundær lenke til `fugl_fonix_etne`.

## Resultat

- People manifest entries: `501` → `506`
- Active people: `1 051` → `1 065`
- Unique people IDs: `1 065`
- Duplicate people IDs: `0`
- Invalid place references: `0`
- Recovered Etne people: `14`
- Unlisted Etne people source files after repair: `0`

De tre JSON-filene som fortsatt er utenfor people-manifestet er to eldre popkultur-aggregater og én eksplisitt staging-fil. De er utenfor denne reparasjonen og er dokumentert i `unlisted-files-audit.txt`.

## Validering

- `node tests/etne-people-manifest-integration.test.js`: PASS
- `bash scripts/check-people.sh`: PASS
- `bash scripts/check-places.sh`: PASS for parse, index build/check, emne IDs and coordinate parity. The rebuild also surfaces the already documented duplicate `folkets_hus_oslo` manifest entry; no generated place-index change is included in this people-only repair.
- `git diff --check` på den avgrensede reparasjonsdiffen: PASS
- lokal avhengighetsinstallasjon med cache i `/tmp`: PASS

Rå output ligger i denne mappen.
