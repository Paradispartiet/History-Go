# Torggata Blad — historical identity correction

## Problem

The canonical `torggata_blad` record had been described as an independent bookstore selling comics, zines and art books. The coordinate repair in PR #2486 correctly moved the marker to the documented historical address property, but it deliberately did not repair this content identity.

## Primary-source evidence

Torggata Blad's own early PDF issues document a newsroom/editorial office, not a bookstore:

- **Torggata Blad nr. 2, 2007** describes the editorial office as being in **Hausmannsgate 19, 6th floor**.
- **Torggata Blad nr. 1, 2008** lists **Hausmannsgate 19, 0182 Oslo** in the masthead together with the editorial staff.
- **Torggata Blad nr. 2, 2008** repeats **Hausmannsgate 19, 0182 Oslo** in the masthead.

Primary PDFs:

- https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr02_07_web.pdf
- https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr01_08_web.pdf
- https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr02_08_web.pdf

## Data decision

- Keep the verified coordinate from PR #2486 unchanged: current Geonorge display point **Hausmanns gate 19A**.
- Keep the existing explicit coordinate note that the historical source says number 19 without a letter and that 19A is the modern unambiguous address-point normalization.
- Correct the place identity from `bokhandel` to historical `redaksjonssted` / independent publication environment.
- Use `year: 2007` as the earliest directly documented publication year in this source pass; do not present it as a separately proven formal founding date.
- Do not change any coordinate field or coordinate-source metadata.
