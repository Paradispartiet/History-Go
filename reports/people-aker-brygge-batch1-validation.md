# Aker Brygge people batch 1 validation

Dato: 2026-07-20

## Canonical audit

- Kandidat: Niels Torp / Niels A. Torp / Niels August Torp.
- Repo-wide scan utført over alle canonical people-JSON-filer før skriving.
- Handling: `created_new` i `people/by/oslo/aker_brygge/niels_torp.json`.

## Streng stedsgate

Niels Torp knyttes til Aker Brygge gjennom det eksplisitt dokumenterte byggetrinn 2 fra 1989: Festplassen, Tingvallakaien, Bryggealléen og Holmens gate. Aker Brygge var et flerarkitektprosjekt; batchen påstår derfor ikke at Torp alene tegnet hele området.

## Kilder

- Store norske leksikon: Niels Torp.
- Store norske leksikon: Aker brygge.
- Niels Torp+ Arkitekter: Aker Brygge.

## Runtime-gater

Etter materialisering skal Civication history people-indeksen regenereres og `bash scripts/check-people.sh` passere. Materializeren stopper ved mer enn én canonical match og sletter seg selv før den rene data-branchen publiseres.
