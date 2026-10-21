# Brekkedammen og Nydalsdammen – v1-sluttkontroll (21.10.2026)

## Avgrensning og beslutning

Gjelder **bare** place-ID-ene `brekkedammen` og `nydalsdammen` på PR #6514, ikke full V3/vFerdig-produksjon for alle natursteder. Gjennomgangen gir foreløpig **26/30**, og **v1 er ikke formelt sluttgodkjent**.

| Kvalitetsdimensjon | Resultat | Begrunnelse |
| --- | ---: | --- |
| Korrekthet og kilder | 5/5 | Stedsspesifikke historiske tekster og kilde-/Fagverk-koblinger gjennomgått i eksisterende innholdsbolker |
| Dekning | 3/5 | Kuratert Fagverk, fullquiz, QuizCards og lokale bilder er omtalt som kontrollert; bildenes formelle v1-aksept og samlet closeout mangler |
| Redaksjonell kvalitet | 4/5 | To forskjellige historiske forløp; kvalitetsscore er foreløpig uten ekstern fagfellevurdering |
| Teknisk integritet | 4/5 | PR oppgir 30 beståtte Fagverk-tester og appvisning på 390/1440 px; ny, faktisk GitHub-CI er ennå ikke bestått |
| Ansvarlighet | 5/5 | Tekstene skiller dokumentert historie fra usikre slutninger og fremsetter ingen løpende badevannsgaranti |
| Etterprøvbarhet | 5/5 | Kanoniske stedsfiler, Fagverk-register, kildepakke og lisensmetadata finnes i repoet |

## Funn fra GitHub (verifisert)

- PR: https://github.com/Paradispartiet/History-Go/pull/6514
- Utgangspunkt for denne kontrollen: `417b65adb06b78fb71b9ded8c008f7d15ad2e3bd`. PR-en var åpen og Draft.
- `data/fagverk/fagverk_registry.json` markerer begge stedene som `curated` på `standard`-nivå. Kuraterte Fagverk-steder øker fra 115 til 117 i generert dekningsrapport.
- Faktisk GitHub Actions-status på denne commiten: 12 `pull_request`-arbeidsflyter med `conclusion: action_required` og ingen testjobber. Ikke forveksle dette med bestått, feilet eller manuelt verifisert CI. Eksempel: https://github.com/Paradispartiet/History-Go/actions/runs/39598331486
- `reports/place-production/akerselva-dams-portraits-20261021.json` har fortsatt `appVisualApproval: false`, `v1MediaApproval: false` for begge foto og `livePhotoReview: pending`. Disse feltene må ikke oppgraderes uten reell godkjenning.
- PR-beskrivelsen oppgir 42 fullquiz-spørsmål, 20 QuizCard-spørsmål, lokale WebP-bilder, 30 beståtte Fagverk-tester samt appkontroll på 390/1440 px. Disse tallene er **rapportert tidligere**, ikke resultater fra de blokkerte GitHub-jobbene.
- Egen samlet sluttrapport fantes ikke i PR-diffen da denne kontrollen startet. Dette dokumentet retter den manglende rapportføringen, men er ikke en test- eller bilde-godkjenning.

## Akseptansekriterier før merge

1. Få `action_required`-blokkeringen avklart og bekreft at relevante **faktisk kjørte** GitHub-jobber er grønne for siste PR-head, inkludert Fagverk og place-open. Ikke omgå CI med en teknisk merge.
2. Sluttkontroller de to eksisterende, lokale portrettbildene **i appens PlaceCard og popup**. Vurder motiv, utsnitt, lesbarhet, kilde- og lisenskreditering. Oppdater først da de respektive godkjenningsfeltene i bildeoversikten.
3. Registrer reell fullquiz/QuizCard-avslutning og endelig scoped v1-aksept. Legacy Nature-samlinger, generiske Badge-ikoner og full V3-pakke holdes eksplisitt utenfor v1 uten at dette skjules som fullproduksjon.
4. Fjern midlertidig, branchespesifikk GitHub Actions-workflow før merge; den publiseres ikke som vedvarende produksjonsoppsett.
5. Når kravene er oppfylt: marker #6514 klar, merge til `main`, kontroller merge-commit, **deretter** start `maridalsvannet`. Ingen parallell gren.

## Oppfølging

Produksjonskø etter #6514: Maridalsvannet → Nøklevann → Østensjøvannet → Bogstadvannet. Hvert sted får historisk fortelling, egen Fagverk-side, gjennomgang av fullquiz, ti QuizCard-spørsmål, bilder og faktisk mobil-/desktop-visningskontroll før v1-avslutning.
