# Christiania Torv people batch 1 validation

Dato: 2026-07-20

## Canonical audit

- Kandidat: Wenche Gulbransen; navnevarianten Wenche Gulbrandsen er også kontrollert.
- Repo-wide scan utført over alle canonical people-JSON-filer før skriving.
- Handling: `created_new` i `people/kunst/oslo/christiania_torv/wenche_gulbransen.json`.

## Streng stedsgate

Wenche Gulbransen knyttes til Christiania Torv gjennom det konkrete offentlige kunstverket «Christian 4s hanske», oppført midt på torget i 1997. Kildene dokumenterer både kunstneren og plasseringen.

## Kilder

- Norsk biografisk leksikon: Wenche Gulbransen.
- Oslo byleksikon: Christiania Torv.
- Eiendomsspar: Christian IVs hanske.

## Runtime-gater

Etter materialisering skal Civication history people-indeksen regenereres og `bash scripts/check-people.sh` passere. Materializeren stopper ved mer enn én canonical match og sletter seg selv før den rene data-branchen publiseres.
