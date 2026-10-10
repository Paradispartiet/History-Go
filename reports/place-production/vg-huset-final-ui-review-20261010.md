# VG-huset – endelig visuell kvalitetsvurdering (10. oktober 2026)

**Canonical sted:** `vg_huset`, Akersgata 55, Oslo  
**Grunnlag:** publisert `main` ved `fa5ae171f27e4d4e122dc5bfe88c6ba8d58d7f52` og isolert, ellers uendret audit-gren.  
**Metode:** automatisert fullapp-navigasjon i headless Chromium + selvstendig visuell gjennomgang av faktiske skjermbilder fra kjøringen. En emulert iPad-viewport er **ikke en fysisk iPad eller native Safari-test**.  
**Endelig vurdering for skjermbildebasert visuell slutt-QA:** **PASS**, med dokumentert mindre forbedringspunkt for navigasjon på svært smale skjermer. PASS bekrefter gjennomført bildebasert vurdering, ikke manuell testing på fysisk utstyr.

## Verifiserbar evidens

- [Automatisert QA og arkiverte bilder, GitHub Actions #38059386396](https://github.com/Paradispartiet/History-Go/actions/runs/38059386396).
- Maskinlesbar detaljrapport: `reports/visual-qa/vg-huset/20261010/visual-audit.json`.
- Permanente skjermbilder i `reports/visual-qa/vg-huset/20261010/`:
  - `mobile-placecard-top.jpg` og `mobile-placecard-lower.jpg`
  - `ipad-placecard-top.jpg` og `ipad-placecard-lower.jpg`
  - `desktop-placecard-top.jpg` og `desktop-placecard-lower.jpg`
  - `ipad-popup-people.jpg`, `ipad-popup-objects.jpg`, `ipad-popup-brands.jpg`, `ipad-popup-productions.jpg`
  - `ipad-quiz-flipped.jpg` og `ipad-quiz-expanded.jpg`
  - `ipad-fagverk.jpg` og `ipad-fagverk-page.jpg`.
- Forutgående kilde-/funksjonskontroll: `reports/place-production/vg-huset-checklist-qa-20261010.md`; PR #6208, PR #6190 og PR #6207.

## Helhetlig seksdelt visuell vurdering

Skala per område: 0–5. Dette er redaksjonelt/skjermbildebasert skjønn, **ikke** en automatisk eller objektiv kvalitetsmåling.

| Område | Poeng | Konkrete funn |
| --- | ---: | --- |
| Stedets visuelle identitet og lesbarhet | 5/5 | Riktig facadebilde, stedsnavn, kategori og epoke vises tydelig på alle tre flater. Beskrivelse lesbar og kildebasert. |
| Bildebruk og samlingskomposisjon | 5/5 | Stående `frontImage` er forskjellig fra liggende stedsfoto. People, Objects, Brands og Productions har ekte lastede forhåndsvisninger, ikke tomme flater. |
| Samlingspopupene | 5/5 | Fire samlinger åpnes og lukkes; People viser fem dokumenterte profiler, Objects og Productions har identifiserbar dokumentasjon, Brands bruker VG-brandet. |
| QuizCard og quiznavigasjon | 5/5 | Klikk på `frontImage` flipper til faktisk quiztekst og tilbake; stort QuizCard åpnes og lukkes, med lesbar typografi og intern scrolling. Tidligere fullapp-QA verifiserte quiz-entry. |
| Fagverk, Lesespor og kildevisning | 4/5 | Intern Fagverk-fane nås korrekt. Egen kuratert side `fagverk-sted.html?place=vg_huset` åpnes i tre viewports med fagartikkel, linser, spørsmål, spor og kilder. Kildekort og Lesespor er synlige ved scrolling. Full visuell manuell gjennomlesning av hele den lange fagartikkelen inngår ikke her. |
| Responsivitet og navigasjonsutforming | 4/5 | Mobil 390×844, iPad-lignende 768×1024 og desktop 1440×1000 viser fungerende intern scrolling, null dokument-overflow og ingen rapporterte sidefeil. Mobilnavigasjonen er horisontalt scrollbar, men videre faner er lite tydelig markert uten horisontal gest. |

**Total: 28/30.** Terskelen `≥27/30` som er omtalt i VG-husets opprinnelige QA-rapport er dermed oppfylt etter en faktisk vurdering av bildene, med vurderingsgrunnlaget uttrykkelig oppgitt.

## Detaljkontroller

1. Fullapp-browserkjøringen åpner `#/place/vg_huset` og kontrollerer lastet PlaceCard for tre skjermstørrelser, ekte bilder og åpnings-/lukkeflyt for samlinger.
2. Fire samlingspopupene har innhold i samtlige skjermstørrelser, med null rapporterte JavaScript-pageerrors.
3. QuizCard-baksiden har `visibility: visible` etter flip og 1 584 tegn med faktisk tekst. Utvidet visning har 1 648 tegn og en egen lukkekontroll.
4. Siden kan scrolles internt uten å forskyve appens øvrige skjermflater. Desktop og iPad er balansert og ligger innenfor skjermbredden.
5. Fagverk-navigasjonen er verifisert etter avsluttet smooth scrolling, ikke midt i animasjonen. Direktelenken åpner en egen side som viser status «Kuratert stedsfagverk» i alle tre viewports.
6. Statiske HTML inneholder den generiske reserveteksten «Stedsfagverket er ikke ferdig», men runtime har `hidden: true`, `display: none` og null størrelse i alle testprofilene. Det er **ikke** en faktisk synlig feil ved VG-huset.
7. `BEGRUNNET_NA` for Før/etter og generelle Nyheter beholdes: begge er kildemessig begrunnet og er ikke visuelle mangler.

## Avgrensning og etterarbeid

- Browsermotor: Chromium i GitHub Actions, med mobil/touch-profil der relevant. **Ingen påstand om fysisk iPad eller native Safari/VoiceOver.**
- Dette er en evaluering av faktisk skjermbildekomposisjon og brukerflyt, ikke bare positiv teststatus. Alle bildene ble vurdert, og mobilnavigasjonens begrensede synlige rekkevidde ble registrert.
- Et frivillig senere generelt UI-forbedringsarbeid kan tydeliggjøre horisontal fanescrolling på mobil. Dette er ikke en stedsspesifikk blocker for VG-huset, og PlaceCard-motoren endres ikke under denne sluttføringen.
- Samlinger, historisk identitet, Fagverk-data, QuizCard og Civication endres ikke for å lukke QA.
- Den genererte workcard-/quality-gate-statusen må oppdateres med `npm run place:build -- vg_huset` etter godkjent canonical workflow-oppdatering, ikke håndredigeres.

**Konklusjon:** VG-husets integrerte PlaceCard-opplevelse er vurdert visuelt og kvalitetsgodkjent på grunnlag av varig arkiverte skjermbilder, dokumenterte nettleserinteraksjoner og verifisert tilgang til eget Fagverk. De dokumenterte begrensningene hindrer ikke bildebasert sign-off, men gir ingen attestasjon av fysisk Safari-test.
