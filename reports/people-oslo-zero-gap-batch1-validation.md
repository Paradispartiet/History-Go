# Oslo People zero-gap batch 1

## Mål

Lukke seks direkte og dokumenterbare Oslo-hull uten å importere svake, generiske stedstilknytninger fra ulistede legacy-filer.

## Resultat

- `emanuel_vigeland_mausoleum` → `emanuel_vigeland` (reuse)
- `ibsen_quotes` → `henrik_ibsen` (reuse)
- `ibsen_quotes` → `ingrid_falk` (created)
- `ibsen_quotes` → `gustavo_aguerre` (created)
- `inger_hagerups_plass` → `inger_hagerup` (reused)
- `bla_skilt_aud_schonemann_vetlandsveien_69d` → `aud_schonemann` (migrated)
- `house_of_nerds` → `house_of_nerds_miljoet` (migrated)
- `latter` → `latter_standupmiljoet` (migrated)

## Kvalitetsgate

- Emanuel Vigeland og Henrik Ibsen gjenbrukes fra entydige manifest-loaded canonical records.
- Ingrid Falk, Gustavo Aguerre og Inger Hagerup opprettes eller gjenbrukes først etter repo-wide ID- og navneaudit.
- Aud Schønemann, House of Nerds-miljøet og Latter-standupmiljøet migreres enkeltvis ut av en ulistet legacy-fil; resten av den filen forblir ulastet.
- Bård Tufte Johansen, Harald Eia og individuelle Latter-komikere migreres ikke i denne batchen fordi de gamle begrunnelsene ikke dokumenterer en tilstrekkelig presis fysisk stedrolle.
