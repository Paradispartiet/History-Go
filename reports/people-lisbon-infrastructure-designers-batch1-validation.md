# People of Places — Lisboa infrastructure designers batch 1

Dato: 2026-07-20

## Resultat

Tre nye canonical arkitekter/ingeniører opprettes, og én eksisterende canonical person gjenbrukes. Batchen gir people-dekning til fem presise steder.

### Nye personer

- `raoul_mesnier_du_ponsard` → `lisbon_elevador_de_santa_justa` + `lisbon_bica`.
- `jose_luis_monteiro` → `lisbon_estacao_do_rossio`.
- `porfirio_pardal_monteiro` → `lisbon_gare_do_cais_do_sodre`.

### Gjenbrukt person

- `santiago_calatrava` beholder `lisbon_parque_das_nacoes` som primæranker og får `lisbon_oriente_station` som presis sekundærrelasjon.

## Stedsgate

Alle relasjonene gjelder konkrete, navngitte transportanlegg og dokumentert design-/prosjektansvar. Det opprettes ingen løse by-, Expo- eller Lisboa-assosiasjoner.

## Canonical audit

Repo-wide ID- og navnevariant-audit fant ingen eksisterende canonical records for Raoul Mesnier du Ponsard, José Luís Monteiro eller Porfírio Pardal Monteiro. Santiago Calatrava finnes allerede og oppdateres derfor i stedet for å dupliseres.

## Kilder

- Monumentos / SIPA og CARRIS — Elevador de Santa Justa og Ascensor da Bica.
- Infraestruturas de Portugal — Estação do Rossio og Estação do Cais do Sodré.
- Santiago Calatrava Architects & Engineers — Oriente Station project archive.

## Valideringsgate

Materialiseringen skal kjøre repo-wide ID-audit før skriving, deretter `bash scripts/check-people.sh` og `git diff --check`.
