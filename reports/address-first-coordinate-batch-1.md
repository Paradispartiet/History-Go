# Address-first coordinate batch 1

Dato: 2026-07-10

## Resultat

Ingen place-objekter ble oppdatert i denne batchen. Address-first policyen krever at norske adresse-steder bare settes til `verified` når Geonorge Adresser API returnerer ett tydelig treff. I dette miljøet feilet alle oppslag mot `ws.geonorge.no` med DNS-feil (`EAI_AGAIN` / ingen DNS-server tilgjengelig), så batchen ble stoppet uten å lage «fake verified» koordinater.

## Forsøkte kandidater

| placeId | navn | adresse forsøkt | Geonorge sourceObjectId | lat/lon | status |
| --- | --- | --- | --- | --- | --- |
| `nasjonalmuseet` | Nasjonalmuseet | Brynjulf Bulls plass 3, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `munch_museet` | MUNCH | Edvard Munchs Plass 1, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `astrup_fearnley` | Astrup Fearnley Museet | Strandpromenaden 2, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `nasjonalbiblioteket` | Nasjonalbiblioteket | Henrik Ibsens gate 110, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `vg_huset` | VG-huset | Akersgata 55, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `nrk_huset_marienlyst` | NRK-huset på Marienlyst | Bjørnstjerne Bjørnsons plass 1, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `deichman_grunerlokka` | Deichman Grünerløkka | Schous plass 10, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |
| `deichman_bjorvika` | Deichman Bjørvika | Anne-Cath. Vestlys plass 1, Oslo | — | — | Hoppet over: Geonorge-oppslag feilet med DNS-feil, ingen entydig offisiell adressekandidat kunne verifiseres. |

## Kjørte Geonorge-oppslag

```bash
npm run places:coords:find:address -- --address "Brynjulf Bulls plass 3 Oslo"
npm run places:coords:find:address -- --address "Edvard Munchs Plass 1 Oslo"
npm run places:coords:find:address -- --address "Strandpromenaden 2 Oslo"
npm run places:coords:find:address -- --address "Henrik Ibsens gate 110 Oslo"
npm run places:coords:find:address -- --address "Akersgata 55 Oslo"
npm run places:coords:find:address -- --address "Bjørnstjerne Bjørnsons plass 1 Oslo"
npm run places:coords:find:address -- --address "Schous plass 10 Oslo"
npm run places:coords:find:address -- --address "Anne-Cath. Vestlys plass 1 Oslo"
```

Alle oppslagene returnerte `TypeError: fetch failed` med `getaddrinfo EAI_AGAIN ws.geonorge.no`. Siden det ikke forelå et Geonorge-treff, ble ingen place-data endret.
