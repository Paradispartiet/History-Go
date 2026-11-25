# History Go – medieregister før R2-migrering

[Oppgave #7550](https://github.com/Paradispartiet/History-Go/issues/7550) · [Filregister (TSV)](R2_MEDIA_INVENTORY.tsv)

Registeret dekker alle Git-filer under `bilder/` ved commit `c5704fcfac8bf5150a1f5579a376a57278698cab`. GitHub leverte det komplette katalogtreet `b745e219a911cd8fa6bcba0c2b25bdbbcc257c4e` uten avkorting.

| Filgruppe | Filer | Byte |
| --- | ---: | ---: |
| Bildeendelse (AVIF, GIF, JPG, PNG, SVG, WebP) | 2 159 | 1 013 072 507 |
| Øvrige filer | 23 | 29 669 |
| Totalt | 2 182 | 1 013 102 176 |

Hver rad viser filsti, filgruppe, byte og Git-blob-ID. Filgruppen er basert på endelse. De øvrige filene er blant annet dokumentasjon og JSON-metadata. Registeret beskriver innholdet i Git på den oppgitte commiten og gir grunnlag for å spore endringer. Det gir ingen godkjenning for flytting eller publisering. Aktiv bruk, lisens og kilde må avklares per fil før den tas med i en opplastingsgruppe.

## Musikkpilot

[PR #7539](https://github.com/Paradispartiet/History-Go/pull/7539) videreførte piloten. [Actions-kjøring 45654760338](https://github.com/Paradispartiet/History-Go/actions/runs/45654760338) fullførte `inventory`. Jobben `mirror` ble hoppet over. Jeg fant ingen R2-kjøring blant de 46 manuelle kjøringene GitHub returnerte ved kontrollen.

Registeret inkluderer SHA-256 og foreslått R2-nøkkel for de ti aktive WebP-bildene fra kjøringens `r2-media-inventory`-rapport. Alle ti har samme Git-blob-ID og byteantall på `main` som i rapportens kildecommit `150a2e0c197263dd1e2206c35935aeb6f607642c`. Tomme felt betyr at registeret mangler en beregnet SHA-256 og R2-nøkkel for den filen. En foreslått nøkkel er ingen bekreftelse på at objektet finnes i R2.

En fullført `mirror`-jobb skal levere `r2-media-verified` med ti offentlige URL-er. Eksisterende pilotkode sjekker HTTP-status, innholdstype, størrelse og SHA-256 mot Git-kilden. Det observerte artefaktet er en lokal inventarrapport. Status for objektene i R2 er uverifisert.

Ved en godkjent opplasting gjenbrukes den manuelle piloten fra `main` med `upload=true` og miljøet `r2-media`. Før appen bytter URL-er, må de ti objektene verifiseres og merker, fallback og frakoblet bruk prøves i appen.
