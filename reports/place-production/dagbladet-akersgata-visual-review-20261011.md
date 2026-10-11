# Dagbladet – ny visuell review, 11. oktober 2026

Evidens: [Actions 38139378858](https://github.com/Paradispartiet/History-Go/actions/runs/38139378858). Faktisk kildecommit `7fbebfbf695b501869306de8416ffa43b7b7d267`; skjermbilder og uendret maskinrapport er lagret i commit `89ecb964060e423c05fc4fe839a6693bf274b451`, under `reports/visual-qa/dagbladet-akersgata/20261011/`. Chromium på Linux med emulerte viewporter; ikke native Safari eller fysisk iPad.

Alle 14 nye JPG-filer er åpnet og manuelt gjennomgått. Den tidligere reviewen fra 10. oktober beholdes som historisk evidens; avgjørelsene nedenfor erstatter dens åpne visningsavvik.

| Kontroll | Evidens | Resultat |
| --- | --- | --- |
| Mobiloverskrift | `mobile320-placecard-top.jpg` og `mobile-placecard-top.jpg`; Range-måling av hvert ord ved 320 og 390 px. | Hele ord på egne linjer. Handlingsikonene ligger på neste rad uten å klemme tittelen. |
| iPad-/desktopoverskrift | `ipad-placecard-top.jpg`, `desktop-placecard-top.jpg`. | Leselig tittel, metadata og handlingsikoner. |
| Fortellinger | Alle fire `*-placecard-lower.jpg` og antallsmålinger etter full Stories-init. | Én canonical fortelling, én indeksoppføring og ett synlig kort på alle fire bredder. Teksten er scrollbar. |
| People | `ipad-popup-people.jpg`; åpning kontrollert på alle fire bredder. | Fire medlemmer med lastede bilder. Stanghelles Dagbladet-periode 1995–2000 står nå i listebeskrivelsen. Hans master-år 1991 beholdes som Aftenposten-år. Osvold er synlig merket Illustrasjon. |
| Brands | `ipad-popup-brands.jpg` og målte bilde-/tekstgrenser. | Hele tekstlogoen vises med contain. 56-pikslers bildeflate passer i kolonnen og overlapper ikke navnet. |
| QuizCard | `ipad-quiz-flipped.jpg`, `ipad-quiz-expanded.jpg`; flip, utvidelse og lukking kontrollert på alle bredder. | Faktisk quizbakside og stor lesbar visning; ingen speilvendt forside. |
| Fagverk og kilder | `ipad-fagverk.jpg`, `ipad-fagverk-page.jpg`; lenken fulgt på alle bredder. | Kuratert stedsside åpner. Ti navngitte kilder inkluderer begge fasadefotografienes proveniens. Ingen synlig unfinished-melding. |

Den automatiske kjøringen avslutter ved ethvert registrert avvik eller JavaScript-sidefeil. Alle fire profiler har null slike feil. En regresjonstest reproducerer lastingsrekkefølgen der Place-open fyller Stories før bakgrunnsaggregatet er ferdig; rettingen bygger indeksene fra én deduplisert liste og beholder også payload-only-fortellinger.

**De fire tidligere visnings-/listeavvikene er lukket.** Fullproduksjonens `final_ui` står fortsatt PENDING fordi den kvalifiserte Utgivelser-samlingen mangler et autentisk rettighetsavklart medlemsbilde fra 1967–2008. Denne reviewen godkjenner den implementerte visningen; den kan ikke godkjenne en samling som ennå ikke kan vises. V3 beholder blocked.
