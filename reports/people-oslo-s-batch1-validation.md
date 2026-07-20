# Oslo S people batch 1 validation

Dato: 2026-07-20

## Canonical audit

- Kandidat: John Engh / John Andreas Engh.
- Repo-wide scan utført over alle canonical people-JSON-filer før skriving.
- Handling: `created_new` i `people/by/oslo/oslo_s/john_engh.json`.
- Ny people-ID opprettes bare dersom ingen entydig canonical match finnes.

## Streng stedsgate

John Engh har en direkte fysisk rolle ved Oslo S. Han vant konkurransen om sentralstasjonsanlegget sammen med Peer Qvam. Etter senere omarbeiding krediterer Oslo byleksikon Engh som arkitekt for første byggetrinn, ferdig i 1980, og for sentralhallen som ble tatt i bruk i 1986. Norsk biografisk leksikon fører Oslo Sentralstasjon som et av hans utførte verk.

Peer Qvam er bevisst utsatt i denne batchen. Han er sikkert dokumentert som medvinner av det opprinnelige konkurranseprosjektet, men de kontrollerte kildene krediterer John Engh eksplisitt for de bygde hovedtrinnene etter at prosjektet ble omarbeidet. Batchen velger derfor den strengeste direkte fysiske koblingen fremfor å overdrive Qvams rolle i sluttanlegget.

## Kilder

- Store norske leksikon: Oslo Sentralstasjon.
- Norsk biografisk leksikon: John Engh.
- Oslo byleksikon: Oslo Sentralstasjon.

## Runtime-gater

Etter materialisering skal Civication history people-indeksen regenereres og `bash scripts/check-people.sh` passere. Materializeren stopper ved mer enn én canonical match og sletter seg selv før den rene data-branchen publiseres.
