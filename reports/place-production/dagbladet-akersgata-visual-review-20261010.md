# Dagbladet — manuell visuell review, 10. oktober 2026

Evidens: [Actions 38065847520](https://github.com/Paradispartiet/History-Go/actions/runs/38065847520), kildebranch før review-notater `c424eae2407840bb28aa3c8caf919847ac629975`. Chromium på Linux med emulerte viewporter; ikke native Safari/fysisk iPad. Alle tolv JPG-filer under `reports/visual-qa/dagbladet-akersgata/20261010/` er åpnet og manuelt kontrollert. `visual-audit.json` er den uendrede maskinrapporten fra kjøringen.

Automatiske funn: null JavaScript-sidefeil, alle undersøkte bilder laster, de to aktive samlingene åpner, QuizCard flipper og utvider seg innenfor PlaceCard, og lenken åpner stedets kuraterte Fagverk. Runtime-payloaden inneholder én canonical fortelling. Disse sjekkene består på alle tre viewporter der testskriptet utfører dem.

| Avvik | Faktisk evidens | Gjenstående kontroll |
| --- | --- | --- |
| Mobiltittel brytes midt i ord | `mobile-placecard-top.jpg`: Dagbladet og Akersgata deles i flere orddeler. | Responsiv tittelrad må ha leselig ordplass, med alle ikoner bevart, og testes på nytt. |
| Logo beskjæres i medlemslisten | `ipad-popup-brands.jpg`: den brede autentiske tekstlogoen vises med sirkel/cover-beskjæring; hovedsamlingens preview viser hele logoen. | Brand-listens bildepresentasjon må vise hele logoen og deretter kontrolleres i ny kjøring. |
| Den samme fortellingen vises dobbelt | `ipad-placecard-lower.jpg` og `desktop-placecard-lower.jpg` viser to kort med samme 1995-fortelling. Canonical runtime-array har bare ett medlem, og stedets Leksikon-artikler har ingen legacy stories-array. | Feilen ligger i visning/hydrering, ikke i antall canonical stories. Rett årsaken og kontroller ett synlig kort etter all asynkron lasting. |
| Stanghelles listebeskrivelse skjuler stedskoblingen | `ipad-popup-people.jpg`: canonical beskrivelse omtaler Aftenposten 1994–1995/2000–2014; detaljprofilen og claims dokumenterer Dagbladet 1995–2000. | Delte canonical beskrivelser må synliggjøre begge avisene uten å gjøre masterens primære Aftenposten-år til et Dagbladet-år. |

Utgivelser kan fortsatt ikke vises eller godkjennes fordi et autentisk rettighetsavklart medlemsbilde fra 1967–2008 mangler. Ingen tom samling, logo som avisforside eller kunstig produksjonsbilde er lagt inn.

**Avgjørelse: final_ui PENDING.** Den automatiske nettleserrapporten er grønn, den manuelle visuelle sluttgodkjenningen er ikke gitt. V3 beholder blocked. Main er ikke endret. Kvalitetsvurdering og kildebegrensninger finnes i source-review.
