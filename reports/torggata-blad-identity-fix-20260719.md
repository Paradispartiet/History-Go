# Torggata Blad identity correction — 2026-07-19

## Problem

Den mergede koordinatreparasjonen i PR #2486 flyttet markøren korrekt til det historiske adresseankeret i Hausmanns gate 19A, men den eldre place-teksten beskrev fortsatt Torggata Blad som en fysisk bokhandel. Det ga en intern motsetning mellom det historiske redaksjonsankeret og stedets identitet.

## Primærkilder

- **Torggata Blad nr. 2, 2007:** redaksjonen oppgir at den holder til i «Hausmannsgate 19, 6. etasje» og beskriver utsikten og takterrassen.
- **Torggata Blad nr. 1 og nr. 2, 2008:** mastheadene oppgir «Torggata Blad, Hausmannsgate 19, 0182 Oslo».
- Den eksisterende History Go-storyen dokumenterer allerede at bladet ble grunnlagt i **2007**.

## Rettelse

- place-identiteten er nå historisk redaksjons- og publiseringssted, ikke bokhandel
- `year` er korrigert fra 1990 til 2007
- quiz-profilen er endret fra bokhandel til redaksjons-/publiseringsmiljø
- det mergede Geonorge-koordinatet fra PR #2486 er eksplisitt låst og uendret
- Hausmanns gate 19A omtales fortsatt som dagens offisielle display-normalisering for den historiske adressen Hausmannsgate 19

## Kilder

- https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr02_07_web.pdf
- https://torggatablad.no/torggata-blad-total/
- `data/stories/stories_torggata_blad.json`
