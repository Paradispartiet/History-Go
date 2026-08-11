# Torggata – fase 8A3 beboere, arbeidende og minnespor audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Underfase: 8A3 – dokumenterte beboere, arbeidende og minnespor
- Baseline: fase 8A2 / PR #4840
- Profilstandard: `people_profile_v1.0`
- Status: **MATERIALISERT OG KLAR FOR MERGE**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT PÅ FERSK MAIN
CANONICAL DUPLIKATER: ingen av de åtte 8A3-personene finnes som manifest-lastet People-record
STALE AUDITFUNN: tidligere 8A-audit oppgav en Wulff Becker-fil som ikke finnes i dagens tre
BESLUTNING: opprett åtte nye People v1-profiler og korriger auditens gjenbruksstatus
```

## Materialisert klynge

| ID | Person | Torggata-anker | Rolle |
| --- | --- | --- | --- |
| `nanna_broch` | Nanna Broch | Torggata 51 fra 1928; blått skilt | boliginspektør / Østkantutstillingen |
| `wulff_becker` | Wulff Becker | bosted og legekontor Torggata 17b; snublestein | lege |
| `martin_heinz_zilsel` | Martin Heinz Zilsel | i dekning Torggata 17b i oktober 1942; snublestein | fotograf |
| `alexander_claes` | Alexander Claes | frisørsalong Torggata 18 | frisør |
| `therese_hurwitz` | Therese Hurwitz | bosted Torggata 36 | beboer / krigshistorie |
| `jenny_hurwitz` | Jenny Hurwitz | bosted Torggata 36 | ekspeditrise / krigshistorie |
| `fredrik_hurwitz` | Fredrik Hurwitz | bosted Torggata 36 | skoleelev / krigshistorie |
| `moritz_glott` | Moritz Glott | tobakksfabrikk Torggata 33 fra 1913 | forretningsmann / industri |

Klyngen er ikke en adressebok. Personene er med fordi forbindelsen er fysisk presis og samtidig knyttet til arbeid, institusjonshistorie, krigshistorie eller offentlig minne. Holdback-listen fra 8A-auditen står fortsatt ved lag.

## Kilder

- Oslo byleksikon – Østkantutstillingen: Nanna Brochs rolle, Torggata 51, bolig og blått skilt.
- Oslo byleksikon – Torggata: Becker, Zilsel, Claes og Glott med konkrete adresser og historiske hendelser.
- Oslo byleksikon – Grønlandsleiret: Therese, Jenny og Fredrik Hurwitz, bostedet i Torggata 36, arrestasjon og deportasjon.

Alle brukerrettede faktapåstander er koblet til egne claims. Bilder står tomme når sikker lisenskjede ikke er dokumentert.

## Neste steg

Etter 8A3-merge er selve People-innholdsklyngen ferdig. Neste arbeid er **8A closeout + People-runding UI-kontroll** før fase 8A kan settes GODKJENT.
