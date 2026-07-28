# History GO — PlaceCard-snarveier til stedspopup

Status: **canonical presentasjonsregel**  
Eier: `place_card_popup_shortcuts`  
Runtime: `js/ui/place-popup-shortcuts.js`  
Stedspopup: `docs/PLACE_POPUP_SYSTEM.md`  
Rundinger: `data/places/README_place_rounds.md`  
Sist kontrollert: **2026-07-29**

## Fast PlaceCard-geometri

PlaceCard har **alltid nøyaktig fire canonical rundinger**. Det finnes ingen 6-, 9- eller 12-rundersvariant.

De fire rundingene står i et 2 × 2-felt ved siden av `frontImage`. De skal venstrestilles i mediefeltet slik at de ligger tett mot `frontImage` og etterlater et separat felt til høyre.

## Snarveifeltet er ikke rundinger

Feltet til høyre for rundingene består av åtte kompakte ikonknapper i **to kolonner × fire rader**.

Disse ikonene er snarveier til de canonical stedspopup-fanene og skal aldri telles som PlaceCard-rundinger:

```text
Om
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
Mer
```

Ett trykk på et ikon åpner den eksisterende stedspopupen direkte på tilsvarende fane.

## Én innholdsmodell

Snarveiene lager ikke kopier av popupinnholdet. Innholdet eies fortsatt av `PLACE_POPUP_SYSTEM.md` og de subsystemene denne kontrakten peker til.

Det betyr blant annet:

- Om leser samme `popupDesc`/stedskunnskap som stedspopupen;
- Historie leser samme chronology/history-lag;
- Fortellinger bruker canonical Stories;
- Før/etter bruker canonical `for_na`;
- Nyheter bruker popupens nyhetsspor;
- Lesespor bruker samme Lesespor-data;
- Kilder bruker samme sikre source summaries / eksterne kilder;
- Mer åpner samme Mer-fane som i stedspopupen.

## Sluttregel

PlaceCard-presentasjonen skal kunne beskrives slik:

```text
frontImage | 4 rundinger | 8 popup-snarveier
```

Rundinger er visuelle samlinger. Snarveiikonene er kun direkte innganger til stedspopupens kunnskapsfaner.
