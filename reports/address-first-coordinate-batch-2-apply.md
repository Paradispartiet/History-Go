# Address-first coordinate batch 2 apply

Brukte `reports/geonorge-address-batch-2/*.json` som kilde. Oppdaterte bare resultater med `ok: true` og `status: verified_candidate`.

| placeId | navn | source file | Geonorge sourceObjectId | adresse | lat/lon | status |
|---|---|---|---|---|---|---|
| `det_norske_teatret` | Det Norske Teatret | `data/places/musikk/oslo/places_musikk/det_norske_teatret.json` | `geonorge-adresser-v1:0301:13973:8` | Kristian IVs gate 8, 0164 Oslo, NO | 59.91521126103172, 10.738641190958791 | verified |
| `rockefeller` | Rockefeller Music Hall | `data/places/musikk/oslo/places_musikk/rockefeller.json` | `geonorge-adresser-v1:0301:14618:5B` | Mariboes gate 5B, 0183 Oslo, NO | 59.916235041685646, 10.750323246840185 | verified |
| `john_dee` | John Dee | `data/places/musikk/oslo/places_musikk/john_dee.json` | `geonorge-adresser-v1:0301:14618:5A` | Mariboes gate 5A, 0183 Oslo, NO | 59.916145361023055, 10.750313157984397 | verified |
| `sentrum_scene` | Sentrum Scene | `data/places/musikk/oslo/places_musikk/sentrum_scene.json` | `geonorge-adresser-v1:0301:10210:1` | Arbeidersamfunnets plass 1, 0181 Oslo, NO | 59.91552200049789, 10.751804295846025 | verified |

## Skipped

| placeId | grunn |
|---|---|
| `blaa` | skipped: not_found |
