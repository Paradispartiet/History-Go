# Brekkedammen og Nydalsdammen – v1-sluttkontroll (21.10.2026)

## Avgrensning og beslutning

Gjelder **bare** place-ID-ene `brekkedammen` og `nydalsdammen` på PR #6514, ikke full V3/vFerdig-produksjon for alle natursteder. Gjennomgangen gir **28/30** etter dokumentert bildeaksept; scoped v1-aksept avventer siste CI og merge.

| Kvalitetsdimensjon | Resultat | Begrunnelse |
| --- | ---: | --- |
| Korrekthet og kilder | 5/5 | Stedsspesifikke historiske tekster og kilde-/Fagverk-koblinger gjennomgått i eksisterende innholdsbolker |
| Dekning | 5/5 | Begge stedene har v1-fortelling, gjennomgått fullquiz, ti QuizCard-spørsmål hver og nå visuelt aksepterte lokale portrettbilder. V3-samlinger og generelle badger inngår ikke i v1 |
| Redaksjonell kvalitet | 4/5 | To forskjellige historiske forløp; kvalitetsscore er foreløpig uten ekstern fagfellevurdering |
| Teknisk integritet | 4/5 | PR oppgir 30 beståtte Fagverk-tester og appvisning på 390/1440 px; ny, faktisk GitHub-CI er ennå ikke bestått |
| Ansvarlighet | 5/5 | Tekstene skiller dokumentert historie fra usikre slutninger og fremsetter ingen løpende badevannsgaranti |
| Etterprøvbarhet | 5/5 | Kanoniske stedsfiler, Fagverk-register, kildepakke og lisensmetadata finnes i repoet |

## Funn fra GitHub (verifisert)

- PR: https://github.com/Paradispartiet/History-Go/pull/6514
- Utgangspunkt for denne kontrollen: `417b65adb06b78fb71b9ded8c008f7d15ad2e3bd`. PR-en var åpen og Draft.
- `data/fagverk/fagverk_registry.json` markerer begge stedene som `curated` på `standard`-nivå. Kuraterte Fagverk-steder øker fra 115 til 117 i generert dekningsrapport.
- Første, bot-forfattede commit fikk 12 workflow-konklusjoner `action_required` uten jobber. Etter rapportcommit og fjerning av midlertidig workflow ble **11 av 11 arbeidsflyter bestått på commit `5153c54d`**, blant annet Fagverk, full Data checks, READ-FIRST, place-open, Natur og place production closeout. Siste godkjenning krever tilsvarende bestått CI på den nye bildeaksept-commiten. Tidligere blokkert kjøring: https://github.com/Paradispartiet/History-Go/actions/runs/39598331486
- Begge *eksakte* lokale 600×800 WebP-portrettene er nå åpnet direkte fra GitHub og visuelt kontrollert: Brekkedammen viser vannflaten og skogbredden uten vesentlig feilutsnitt; Nydalsdammen viser vannflaten, bredden og omgivelsene. PR-en dokumenterer separat faktisk appvisning på 390/1440 px. `appVisualApproval` og `v1MediaApproval` gjelder bare denne v1-portrettleveransen, ikke komplett V3-mediepakke.
- PR-beskrivelsen oppgir 42 fullquiz-spørsmål, 20 QuizCard-spørsmål, lokale WebP-bilder, 30 beståtte Fagverk-tester samt appkontroll på 390/1440 px. Disse tallene er **rapportert tidligere**, ikke resultater fra de blokkerte GitHub-jobbene.
- Egen samlet sluttrapport fantes ikke i PR-diffen da denne kontrollen startet. Dette dokumentet retter den manglende rapportføringen, men er ikke en test- eller bilde-godkjenning.

## Akseptansekriterier før merge

1. **Gjenstår:** Bekreft grønne, faktisk kjørte GitHub-jobber på **nyeste PR-head** etter denne bildeaksept-commiten. Den foregående commiten `5153c54d` hadde 11/11 bestått.
2. **Oppfylt innen v1:** Begge eksakte portrettbilder er visuelt kontrollert. Tidligere PR-dokumentert kontroll bekrefter faktisk appvisning på 390/1440 px, og kreditering/lisens følger bildemetadata. `frontImageMeta.visualReview` og bildeoversiktens to v1-akseptflagg er synkronisert.
3. **Oppfylt innen v1, etter rapportert QA:** Fullquizens 42 spørsmål og begge QuizCards (20 spørsmål totalt) er registrert som gjennomgått i PR-en. Den avgrensede v1-leveransen kan avsluttes etter grønn CI; Legacy Nature-samlinger, generiske Badge-ikoner og full V3-pakke er eksplisitt utenfor v1 og er ikke fullprodusert.
4. **Oppfylt:** Midlertidig branchespesifikk Actions-workflow er fjernet i commit `5153c54d`.
5. **Gjenstår:** Når nyeste CI er grønn, marker #6514 klar, merge til `main`, kontroller merge-commit, **deretter** start `maridalsvannet`. Ingen parallell gren.

## Oppfølging

Produksjonskø etter #6514: Maridalsvannet → Nøklevann → Østensjøvannet → Bogstadvannet. Hvert sted får historisk fortelling, egen Fagverk-side, gjennomgang av fullquiz, ti QuizCard-spørsmål, bilder og faktisk mobil-/desktop-visningskontroll før v1-avslutning.
