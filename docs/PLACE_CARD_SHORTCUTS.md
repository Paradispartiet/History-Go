# History GO — PlaceCard-snarveier til stedspopup

Status: **canonical presentasjonsregel**  
Eier: `place_card_popup_shortcuts`  
Runtime: `js/ui/place-popup-shortcuts.js`  
Stedspopup: `docs/PLACE_POPUP_SYSTEM.md`  
Rundinger: `data/places/README_place_rounds.md`  
Sist kontrollert: **2026-08-04**

## Fast PlaceCard-geometri

PlaceCard viser:

- én fast Badges-runding øverst til høyre ved stedsnavnet;
- nøyaktig fire canonical innholdsrundinger i et 2 × 2-felt ved siden av `frontImage`;
- sju små, monokrome SVG-snarveier i et eget felt til høyre for de fire rundingene.

Det finnes ingen 3-, 6-, 9- eller 12-rundersvariant i mediefeltet.

## Infotilgangen er tekst, ikke SVG

`Om` har ikke lenger et eget infoikon i snarveifeltet.

Brukeren åpner `Om`-fanen i den eksisterende stedspopupen ved å trykke på:

- stedsnavnet i PlaceCard;
- infoteksten (`pcDesc`) i PlaceCard.

Begge tekstflatene er tastaturtilgjengelige og åpnes med Enter eller mellomrom.

## Sju popup-snarveier

Feltet til høyre for rundingene består av sju kompakte SVG-knapper:

```text
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
Mer
```

Snarveiene er ikke rundinger. Ett trykk åpner den eksisterende stedspopupen direkte på tilsvarende fane.

## Én innholdsmodell

Snarveiene og de klikkbare tekstflatene lager ikke kopier av popupinnholdet. Innholdet eies fortsatt av `PLACE_POPUP_SYSTEM.md` og de subsystemene denne kontrakten peker til.

## Sluttregel

PlaceCard-presentasjonen skal kunne beskrives slik:

```text
frontImage | 4 rundinger | 7 små SVG-snarveier
                    badge ved tittelen
```

Rundinger er visuelle samlinger. SVG-ikonene og de klikkbare tekstflatene er direkte innganger til stedspopupens kunnskapsfaner.
