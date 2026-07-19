# Oslo koordinatkontroll – batch 22

Dato: 2026-07-19

Batch 22 fortsetter den sekundære Oslo-kildekøen med kontroll 133–139. Fem koordinater er godkjent og to kontroller er avsluttet som `needs_review`.

| kontroll | placeId | resultat | kildeobjekt / avgjørelse |
|---:|---|---|---|
| 133 | `kulturkirken_jakob_litteratur` | verified | `geonorge-adresser-v1:0301:12782:14` |
| 134 | `norli_universitetsgata` | needs_review | Universitetsgata 22–24 gir to adressepunkter uten dokumentert hovedanker |
| 135 | `sigrid_undset_statue` | needs_review | identitet i Stensparken dokumentert, eksakt objektpunkt ikke funnet |
| 136 | `ruth_maier_minne` | verified_geometry | `wikidata:Q44179381` |
| 137 | `inger_hagerups_plass` | verified_geometry | `lokalhistoriewiki:Inger_Hagerups_plass` |
| 138 | `oscar_braaten_statuen` | verified_geometry | `osm-node:10819902960` |
| 139 | `alexander_kiellands_plass` | verified_geometry | `osm-relation:7723252` |

## Viktige korrigeringer

- Inger Hagerups plass flyttes fra et feilpunkt til den dokumenterte snuplassen i enden av Hagapynten.
- Oscar Braaten-statuen flyttes til den konkrete Oskar Braaten-bysten ved Beierbrua.
- Alexander Kiellands plass flyttes til den faktiske plassen mellom Uelands gate, Maridalsveien og Waldemar Thranes gate.
- Ruth Maier-recorden avgrenses til den konkrete snublesteinen ved Dalsbergstien 3, ikke Ruth Maiers plass.

## Metode

Konkrete adressekandidater er kjørt gjennom repoets normative Geonorge-finner, og terminaloutput er lagret i denne rapportmappen med `tee`. Monumenter og plasser er behandlet som egne fysiske objekttyper. Ingen midpoint eller nærmeste-treff er konstruert for Norli eller Sigrid Undset-statuen.
