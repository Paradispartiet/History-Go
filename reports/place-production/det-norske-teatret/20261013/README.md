# Det Norske Teatret — produksjonsstart 13. oktober 2026

Status: **evidence-checkpoint klart for review; stedet er ikke fullprodusert**.

Nullmålingen gjelder commit `d7eb68ab50d4e3e1cc5390149d64cba433cd096b` og den manifestlastede Scenekunst-filen. Den publiserte brukerflaten er også åpnet gjennom Nearby. Denne endringen etablerer arbeidsgrunnlaget; descriptions, personprofiler, quiz, bilder og runtime endres i senere, avgrensede checkpoints.

## Faktisk utgangspunkt

| Flate | Kontrollert funn | Produksjonsjobb |
| --- | --- | --- |
| Stedstekst | Generell ingress og læringsprosa i popupDesc | Historisk ingress og selvstendig stedartikkel med claim-paritet |
| Fagverk | Ingen Place-eid blokk; faktisk side sier «FAGVERK UNDER PRODUKSJON» | Full Fagverk samtidig med tekstcheckpointet |
| People | 87 unike manifestlastede koblinger; alle image-felt er tomme; live-count 87 | Direkte koblingsaudit, redaksjonell revisjon og kildeklarerte portretter |
| Quiz | Fem aktive sett, 6 spørsmål i hvert; 30/30 answerIndex 0 | Separat kildeledet Scenekunst-revisjon; behold gyldige fakta og Knowledge-koblinger |
| QuizCard | Live-knappen sier «Quizkort mangler» | Dedikert kort og reell flip-/quiztest |
| Samlinger | Live Brands, Gjenstander og Forestillinger viser 0 | Kandidataudit og ferdige medlemsbilder før profil publiseres |
| Bilder | image/frontImage mangler i source; gammel Commons-seed er ubehandlet | Hovedfoto og separat stående frontbilde |
| Kilder | Live-flaten oppgir ingen brukerrettede kilder | Synlig kildeflate fra kontrollerte kilder |
| Historie | Eksisterende 1913-Story er synlig; epokeindeksen har Story-ankeret | Avklar eldre adresse og bygg kronologi for dagens hus |
| Oversettelser | en/es/pt finnes med samme gamle kildehash | Revider sammen med canonical tekst |

87 koblinger er et registerfunn, **ikke** 87 faktagodkjente profiler. Tretti utfylte Knowledge-ID-felt er heller ikke bevis for ferdig Knowledge-integrasjon.

## Identitet og eierskap

Dagens hus holdes adskilt fra eldre spillesteder. Institusjonens etablering, tidligere Oslo-adresser og bygningshistorien følger de spesifikke avgrensningene i [source-review.json](source-review.json). Et eksisterende årfelt eller en institusjonskobling beviser ikke at hendelsen fant sted ved dagens kartmarkør.

Gjeldende v2.6-checklist overstyrer referansens eldre firefeltskvote. People, Objects, Brands og Forestillinger vurderes; bare bildeklare PASS-samlinger publiseres. Underbadges er foreslått fra den faktisk leste Scenekunst-Badgen. Quizprofil og fremtidig settantall er bevisst uavklart frem til påstandsbanken bærer en konkret plan.

## Kontroll og grenser

```bash
node reports/place-production/det-norske-teatret/20261013/audit-baseline.mjs --check
node scripts/place-production-rule-preflight.mjs validate --workcard reports/place-production/det-norske-teatret-workcard-current.json
node --test tests/place-production-rule-preflight.test.mjs
```

Baseline-paritet og READ-FIRST-validering består. Eksisterende preflight-regresjoner: **8/8 bestått**. Alle JSON-filer og kilde-ID-er er kontrollert. UI-nullmålingen dekker faktisk stedskort, People-popup og Fagverk-side i én desktop-browser; mobil/iPad, geografisk kartkontroll og slutt-QA gjenstår. Kartet var utilgjengelig i denne browseren og brukes ikke som geografisk ferdigbevis.

## Seksdelt kvalitetsvurdering

Vurderingen gjelder bare denne **nullmålingen, kildegjennomgangen og innholdsplanen**, ikke fullstedet.

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5 | Filhashes, manifestløste koblinger, konkret sourceLocation, dokumenterte kildekonflikter |
| Dekning og ferdigstillelse | 4 | Eide dataflater og tre live-flater kartlagt; grensene for kilde- og UI-kontroll er eksplisitte |
| Faglig/redaksjonell kvalitet | 4 | Stedsavgrensning, spesifikke kandidater, egen Objects/Forestillinger-grense og konkret quizoverlevering |
| Teknisk integritet | 4 | Deterministisk baseline-check, preflight-validering og 8 regresjoner; ingen runtime-endring |
| Sikkerhet og ansvarlighet | 5 | Ingen private data eller spillerstate skrevet; uavklarte medier er ikke publisert |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Reproduserbar read-only-audit, versjonert snapshot og eksplisitt arbeidskort |

**27/30 for evidence-checkpointet.** Fullstedsstatus er fortsatt BLOCKED. Neste checkpoint er historiske descriptions og integrert Place-eid Fagverk, fra samme source→claim-grunnlag.
