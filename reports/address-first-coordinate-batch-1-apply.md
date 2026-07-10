# Apply Geonorge address batch 1

Dato: 2026-07-10

## Resultat

Ingen place-objekter ble oppdatert i denne apply-runden.

Årsak: De påkrevde lagrede Geonorge-resultatene under `reports/geonorge-address-batch-1/*.json` finnes ikke i denne worktree-en/branchen. Oppgaven krever at hver JSON-fil har `"ok": true` og `"status": "verified_candidate"`, og at `coordinate`-objektet i filen brukes som fasit. Siden input-filene mangler, ble alle 8 mål-placeIds hoppet over i stedet for å gjette koordinater eller gjøre nye live Geonorge-oppslag.

## Hoppet over

| placeId | navn | source file | Geonorge sourceObjectId | adresse | lat/lon | status |
| --- | --- | --- | --- | --- | --- | --- |
| `nasjonalmuseet` | Nasjonalmuseet | `places/kunst/oslo/places_kunst/nasjonalmuseet.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/nasjonalmuseet.json` mangler. |
| `munch_museet` | MUNCH | `places/kunst/oslo/places_kunst/munch_museet.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/munch_museet.json` mangler. |
| `astrup_fearnley` | Astrup Fearnley Museet | `places/kunst/oslo/places_kunst/astrup_fearnley.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/astrup_fearnley.json` mangler. |
| `nasjonalbiblioteket` | Nasjonalbiblioteket | `places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/nasjonalbiblioteket.json` mangler. |
| `vg_huset` | VG-huset | `places/media/oslo/places_oslo_media/vg_huset.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/vg_huset.json` mangler. |
| `nrk_huset_marienlyst` | NRK-huset på Marienlyst | `places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/nrk_huset_marienlyst.json` mangler. |
| `deichman_grunerlokka` | Deichman Grünerløkka | `places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/deichman_grunerlokka.json` mangler. |
| `deichman_bjorvika` | Deichman Bjørvika | `places/by/oslo/places/deichman_bjorvika.json` | — | — | — | Hoppet over: `reports/geonorge-address-batch-1/deichman_bjorvika.json` mangler. |

## Kontroller

- `find /workspace/History-Go -path '*/geonorge-address-batch-1*' -print` fant ingen lagrede batch-1 JSON-filer.
- `data/places/manifest.json` ble brukt til å finne aktive source-filer for de åtte mål-placeIds.
- Ingen live Geonorge-oppslag ble gjort.
- `data/places/places_index.json` ble ikke håndredigert.
