# Oslo Kvadraturen – endelig v1-kontroll, 26. oktober 2026

Omfang: Den gamle Krigsskolen, Garmanngården, Stattholdergården, Hotel du Nord, Café Engebret og Treschowgården. Alle seks består minimum v1. Dette er en redaksjonell vurdering, ikke en ny V3-status eller vFerdig-godkjenning.

## Kontroll og evidens

- Seks kildebelagte stedstekster, seks kuraterte Fagverk-sider, 126 kontrollerte fullquizspørsmål (21 per sted) og 60 QuizCard-spørsmål (10 per sted). Knowledge-paritet og konkrete faktaspørsmål kontrollert med preflight og produksjonsauditer.
- Fire nye v4.2-pakker dekker 64 individuelle påstander med setningsdekning, kildehenvisninger, hash og separate fakta-/redaksjonelle vurderinger. Hotel du Nords eksisterende pakke, fullquiz, QuizCard og kildespor er korrigert til utflytting i 2024 etter Riksantikvarens egen melding 10. januar 2025. Kildeuenigheten om Hauge-perioden er eksplisitt attribuert.
- Hele leveransen, inkludert Fagverk og alle fullquizspørsmål, er gjennomgått. Uavhengig Codex-agent har kontrollert kilde–påstand-koblinger og implementasjonsdiff; påviste feil er rettet. Dette er ikke en ekstern menneskelig fagfellevurdering.
- [Actions 40318115632](https://github.com/Paradispartiet/History-Go/actions/runs/40318115632): alle seks fullquizer gjennomspilt på desktop og mobil, med progresjon og belønning uten fysisk besøksregistrering.
- [Actions 40326286787](https://github.com/Paradispartiet/History-Go/actions/runs/40326286787): grønn samlet integrasjon mot main `7114a37aa925029c69eaf8a8ea612b1fff05bd7a`; Hotel du Nord gjennomspilt på nytt etter kildekorreksjonen. Alle seks stedskort og forstørrede QuizCard kontrollert ved 320, 390 og 1440 px: 18 visninger hver, ti spørsmål og 40 svaralternativer per kort, fasit tilgjengelig og ingen horisontal overflyt. Begge korrigerte personbilder er dekodet. Bernt Anker vises med portrett; Jens Bjelke med tydelig merket slektsvåpen.
- Codex har inspisert de faktiske GitHub-skjermbildene for alle seks steder og kort ved alle tre bredder, inkludert kortenes nederste del/fasit. De 18 lisensierte bildevariantene er kontrollert. Lokale skjermbilder fra et miljø der appstart feilet er uttrykkelig forkastet som godkjenningsgrunnlag.
- Endelig artefakt `12652290845`, `kvadraturen-final-integration-browser-proof`, SHA-256 `39ec434aa459de17e09437d253261da70ab8b243f6df6f7ad37d9edfc39a083f`. Testet generert innhold er lagret i commit `ee2e0172061b9b8b3914eb76ee9de11658b303ed`. Etterfølgende sluttføring endrer bare QA-metadata, rapport, tilhørende forventning i preflight og avledet release-manifest.
- Main-endringer fra andre Oslo- og regionbolker er bevart. Strukturelle konflikter ble løst uten å overskrive den andre kontoens 17 steder. Fellesregistre er regenerert med eksisterende byggere; midlertidig integrasjonsworkflow er fjernet.

## Seksdelt kvalitetsport

| Dimensjon | Score | Evidens og avgrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Individuelle kilde–påstand-koblinger, primærkildekorreksjon for Hotel du Nord og eksplisitt kildeuenighet; ingen ekstern menneskelig fagfellevurdering. |
| Dekning og ferdigstillelse | 5/5 | 6/6 v1-pakker, 126/126 fullquizspørsmål, 60/60 QuizCard-spørsmål og alle tre visningsbredder kontrollert. |
| Faglig/redaksjonell kvalitet | 4/5 | Stedsspesifikke tekster og Fagverk gjennomgått; intern modelltekst fjernet, kildegrunnlag og hendelser skilt presist. |
| Teknisk integritet | 5/5 | Grønn samlet integrasjonskjøring, browsergjennomspill, Knowledge-paritet, deterministiske bygg og kontraktkontroller. Endelig ordinær PR-CI og Main integrity kontrolleres i mergeforløpet. |
| Sikkerhet og ansvarlighet | 4/5 | Lisens-/opphavsspor, korrekt merket slektsvåpen, ingen fysisk besøksregistrering i testene; dokumenterte kildebegrensninger. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | V4.2-pakker, kilde-/claim-ID-er, offisielle byggere, commits og versjonert testartefakt. |

Sum **27/30**, alle dimensjoner minst 4/5. Ingen uløste kritiske eller viktige funn i dette omfanget. Minimum v1 er godkjent av Codex etter kilde-, innholds- og appkontroll. Grønn CI alene er ikke grunnlaget for denne vurderingen. Merge og etterfølgende Main integrity må bekreftes separat; dette dokumentet hevder ingen produksjonsdeploy.
