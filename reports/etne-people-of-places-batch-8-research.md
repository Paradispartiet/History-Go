# Etne People of Places batch 8 — Pippifestivalen

Date: 2026-07-18

## Scope

Adds three named people with direct documented organizer or festival-leadership connections to the canonical place `skanevik_fjordhotel_pippifestivalen`:

- `inger_karin_larsen`
- `bard_henrik_tungesvik_hereide`
- `theresa_tungesvik_hereide`

## Inger Karin Larsen

Grannar identifies Inger Karin Larsen as owner of Skånevik Fjordhotel and documents her role in keeping the Pippifestivalen tradition going at the hotel. Etne municipality lists `Pippifestivalen/Skånevik Fjordhotel` with her contact line, and current hotel/festival information places the annual festival in the hotel garden.

Decision:

- include as hotel owner and festival driver
- primary place `skanevik_fjordhotel_pippifestivalen`
- category `kunst`

## Bård Henrik Tungesvik Hereide and Theresa Tungesvik Hereide

Grannar documents both as standing at the head of the festival and supervising rehearsals for the festival production in 2019. Etne municipality separately lists Bård Henrik Hereide as the contact for `Pippifestivalen/Skånevik Teater`.

Decision:

- include both through direct festival/theatre leadership
- primary place `skanevik_fjordhotel_pippifestivalen`
- category `kunst`

## Duplicate gate

Current `main` was searched before creation for:

- `inger_karin_larsen`
- `bard_henrik_tungesvik_hereide`
- `theresa_tungesvik_hereide`

No existing canonical people records were found.

## Sources

1. Grannar — Pippi Langstrømpe med adresse Skånevik
   - https://www.grannar.no/nyhende/pippi-langstrompe-med-adresse-skanevik/189614
2. Grannar — Villvetter for éin sommar
   - https://www.grannar.no/2019/07/villvetter-for-ein-sommar/
3. Etne kommune — Pippifestivalen/Skånevik Fjordhotel
   - https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=10
4. Etne kommune — Pippifestivalen/Skånevik Teater
   - https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=97
5. Skånevik Fjordhotel — Aktivitetar
   - https://www.fjordhotellet.no/aktivitetar

## Validation plan

- register the batch exactly once in `data/people/manifest.json`
- run full people checks and People of Places audit
- verify all three IDs occur exactly once globally
- verify `skanevik_fjordhotel_pippifestivalen` is active
- verify each candidate has one primary and one `places` link to the canonical festival place
- remove temporary integration workflow before merge
