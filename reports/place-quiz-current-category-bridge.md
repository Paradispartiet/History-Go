# Place quiz current-category bridge

Dato: 2026-07-20

## Problem

History Go har stedsspesifikke quizfiler som ble produsert før enkelte places fikk ny primærbadge. Etter Religion-migreringen kunne for eksempel en quiz for `gamle_aker_kirke` fortsatt ha `categoryId: "historie"` selv om stedet nå har `category: "religion"`.

QuizEngine finner fortsatt quizen korrekt etter `targetId`, men stale `categoryId` kunne sende progresjon, merit-poeng og quiz-unlocks til den gamle badgen.

## Løsning

Det eksisterende place-override-laget gjør nå quiz-JSON kategori-aware ved innlasting:

- bare JSON under `data/quiz/` vurderes
- bare quizobjekter med `categoryId`/`category_id` endres
- bare mål som matcher et faktisk place i `window.PLACES` får kategori fra stedet
- personkvizer påvirkes ikke
- spørsmål, svar, kilder, `emne_id`, `related_emner`, `method_id`, `epoke_domain` og øvrige innholdsfelt endres ikke

Dermed følger place-quizens progresjonskategori alltid stedets nåværende primærkategori, inkludert kategori-overrides.

## Eksempel

`gamle_aker_kirke`:

```text
place.category = religion
quiz source categoryId = historie
quiz runtime categoryId = religion
```

Historiske quizspørsmål og historiske emner beholdes, men progresjonen går til Religion-badgen.

## Hvorfor runtime-bro

Å omskrive alle eksisterende quizfiler ville være en stor, skjør migrering og ville måtte gjentas hver gang en place-primary-category ryddes. Denne broen gjør primærkategori til én runtime-sannhet for place-progresjon samtidig som faglig innhold kan være tverrfaglig.
