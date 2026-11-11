# History Go – image / frontImage: riktig utsnitt uten uønsket zoom

**Gjeldende regel:** Et stedskorts originale motiv skal være helt synlig i riktig ramme. Rammen tilpasses motivet; motivet skal ikke forstørres til tilfeldige avkuttede tak, fasader, landskap eller mennesker.

## Rolle, format og visning

| Felt | Flate | Foretrukket eksport | Visningsregel |
| --- | --- | --- | --- |
| `image` | Bredt oversiktsbilde bak overskrift | 1200 × 675 (16:9) eller annet bredt, kildeklart oversiktsbilde | `object-fit: contain`, sentrert, ingen ekstra zoom |
| `frontImage` | Stående flippbart PlaceCard | 900 × 1200 (3:4) | `object-fit: contain`, hele originalmotivet bevart |
| QuizCard | Kortets bakside | Eksisterende originalformat | `contain`, aldri avskjæring |
| Før / etter | To dokumenterende sammenlikningsbilder | Original- eller kildefast format | `contain` for å beholde sammenlignbare detaljer |

## Produksjonsstandard for bilder

1. **Velg oversikt før detalj.** Finn et foto med bygningens helhet, plassrom, landskap eller andre historisk relevante omgivelser. Unngå for stramt beskårne utsnitt når oversiktsbilder finnes.
2. **Sjekk rammens aspekt før eksport.** En horisontal original egner seg ofte ikke som 3:4-front. Finn helst en selvstendig stående original til `frontImage`.
3. **Ikke bruk `ImageOps.fit` på skarp hovedkilde som rutine.** Det klipper vekk deler av motivet for å fylle rammen. Bruk `ImageOps.contain` / proporsjonal skalering for skarp kilde i stedet.
4. **Hvis formatene er ulike:** Bruk eventuelt en diskret uskarp/dempet bakplate fra samme foto. Den skarpe originalen skal vises i sin helhet og visuelt skilles fra bakplaten. Ingen KI-endringer i dokumentarfotografiet.
5. **Før inn proveniens og kontrollsummer.** Creator, kildeadresse, lisens, originaldimensjoner, lokal originalhash og eksporthash skal være med; originale binærbilder bevares.
6. **Kontroller bildefeltet i faktisk app:** både 390 px mobil og 1440 px desktop, med bygning/landskap og tittel/metadata synlige. Ikke juster zoom bare til én viewport.
7. **Eksisterende hardt beskåret eksport:** Endring i CSS gjenoppretter ikke piksler som allerede ble kuttet ved eksport. Hent den rettighetsklarerte originalen og eksporter på nytt uten skarp beskjæring når dette er aktuelt.

## Avgrensning

Den felles visningsrettelsen i `css/place-media-overview-fit.css` gjelder **stedsfoto, PlaceCard-front, stedspopup, mikrostedfoto og Før/etter**. Den endrer **ikke** People-portretter, badge-illustrasjoner, samlingsmerker eller annet kunstverk som krever eget design.

`imageComposition.portraitPosition` og `heroPosition` kan beholdes som metadata for eventuell kildekuratert spesialvisning, men de skal ikke tvinge standardbildet til `cover`-zoom. Andre profiler må ha egne dokumenterte komposisjonsregler.

## Oslo T–S 10: Tjuvholmen

Produksjonen i PR #7234 bytter fra hardt senterutsnitt til **full skarp kilde + dempet uskarp bakplate** for 16:9 hovedbilde og 3:4 frontbilde. Dette reparerer tapet som ellers ville oppstå i bildefilen før CSS kom til.
