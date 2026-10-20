# DNT C32 – QuizCard med tidsgrense og husfokus

**20. oktober 2026.** Baseline `1c8fc5a124aa2c39b518a602c10ddd6a4f103801`. Oppdaterer **det eksisterende** Scenekunst-kortet for `det_norske_teatret` framfor å etablere ny kortidentitet.

## Stedlig kuratering

QuizCard-et publisert i #6357 hadde tidligere ti spørsmål konsentrert om 1912–1913. Hovedstedet vårt er dagens hus i Kristian IVs gate 8 som åpnet i 1985; derfor velges nå ti eksisterende spørsmål med tydeligere balanse, uten å endre canonical kildequiz.

**Fire institusjonshistoriske spørsmål:** stiftelsen i 1912, nynorsk formål, tidlig spillested Kristiansand og den første Kristiania-framsyningen i 1913. **Seks hus-/scene-spørsmål:** teaterhuset i 1985, *Romeo og Julie* som åpningsframsyning, arkitektene 4B, husets scener og verksteder, og musikalen *Cats* i 1985. Canonical quiz beholder alle 30 spørsmål, deres ID-er, svaralternativer, fasiter og forklaringer.

Kildebelegg: [Det Norske Teatret omvising](https://www.detnorsketeatret.no/omvising), [Eit eige hus](https://www.detnorsketeatret.no/bakgrunnsartiklar/eit-eige-hus), [Sceneweb Cats](https://sceneweb.no/nb/production/52871/Cats). Alle kort-spørsmål har egne provenienslenker direkte fra kildequiz.

## Porter

Ny kildeparitets- og DOM-test kontrollerer 10/10 oppgaver mot original `data/quiz/musikk/det_norske_teatret_sets_merged.json` og henter kortet via ekte Scenekunst-manifest i eksisterende PlaceCard-adapter. DNT-workflowen bruker allerede definert Node/npm-oppsett og kjøres på endringsrelevante filer.

**Ikke fullført:** Denne kontrollen simulerer dokumentvisning; den er ikke reell nettleser-/mobilakseptanse eller lisensavklaring for forestillingsbilder. 8/8 forestillinger er stedfestet, men 0/8 med klarert bilde. 57/87 People har portretter, 30 mangler. Ingen av de fire PlaceCard-samlingene eller vFerdig-status blir promotert av denne endringen.
