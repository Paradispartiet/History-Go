# Grini — kontroll før ønsket ferdigstilling og merge, 30. oktober 2026

**Resultat: BLOCKED. Ikke vFerdig og ikke mergeklar.** Brukerens fullførings- og mergeautorisasjon er mottatt; det gjenstår reelle kvalitetsporter, ikke en ny autorisasjonsforespørsel.

Arbeidsgren: `place/grini-fangeleir-full-production-20261028`. Utgangspunkt: `a03a3fb7a6e350b27ab9793a48a22bc3d2ddad83`, PR #6759. Separat, uendret main-kontroll: `4172b5ffad5b558873f4ef3df757f118d2c7dc20`.

## Rettet i dette checkpointet

- Repoets faktiske beskrivelsesvalidator gjenskapte sju Grini-feil før retting: to teksthasher, tre eksplisitt-belegg-funn, én udekket ingressetning og én kobling til en ikke-eksisterende popupsetning.
- Alle tre ingressetninger og 29 popupsetninger er nå koblet til relevante claims. Registeret inneholder 34 claims. Kvinneandel, disiplinærstraffer og Gerhardsens tilbakekomst har fått egne kilde- og avsnittsreferanser. Eldre claim-ID-er er bevart.
- Fallskjermen er omtalt som avdeling. Fangekategoriene i ingressen er presisert, mottaksrutinen er avgrenset til det registrerte kildebelegget, og etterbruken har fått korrekt tidsrekkefølge.
- Den norske leirhistorien og den engelske museumssiden hos MiA ble lest med direkte HTTP 200, etter at søkeverktøyets sideåpning ga 403. SNLs avsnitt om etablering, leirdrift, fangeregimer, deportasjon, motstand, frigjøring og etterkrigshistorie ble også lest. Kilder: https://snl.no/Grini_-_tysk_fangeleir, https://mia.no/grinimuseet/om-grini-fangeleir og https://mia.no/grinimuseet/en/grini-museum.
- Datoavviket 12./14. juni er ikke forklart bort som to forskjellige hendelsestyper. Leksikon og Historie-rapport presiserer nå at forklaringen er uavklart. Quizens eksisterende kildekritiske spørsmål er bevart.
- Grinis eksisterende engelske, spanske og portugisiske beskrivelser er oversatt fra hele den aktuelle norske teksten, med ny `_sourceHash`. Ingen gammel oversettelse er bare stemplet på nytt.
- Place-indeks, Place-open, leksikonshards, epokeindeks og Fagverk-release er generert med repoets byggere. Rebuildene omfatter også deterministiske synkforskjeller i eksisterende fellesartefakter; de endrer ikke koordinatbeslutningen.
- En permanent test leser den faktiske Grini-pakken, validerer teksthash/claimreferanser og full setningsdekning, og kontrollerer eksisterende oversettelsers kildehash. Den kjører sammen med Grinis CI-preflight.

## Utførte kontroller

| Kontroll | Resultat |
| --- | --- |
| Beskrivelse, Grini-staging, reell svarstokking, generelle beskrivelsesregresjoner og epoke-/viewer-kontrakter | 71/71 PASS |
| Fokusert Grini-kjøring etter siste endring | 10/10 PASS |
| Place-open runtime og Lesespor-race | 7/7 PASS |
| `places:index:check` inkludert koordinatparitet | PASS |
| `place-open:check` | PASS, 1540 payloads |
| `epoker:places:check` | PASS, 340 steder / 2281 tidsankere |
| `build-fagverk-release-manifest.mjs --check` | PASS |
| `check-place-i18n-freshness.mjs grini_fangeleir` | PASS, en/es/pt |
| Samlet description-audit | FAIL, 25 feil ved Grand Hotel og Villa Romsli; nøyaktig samme funn på separat main |
| Samlet quizkontekst-audit | FAIL, 433 funn; nøyaktig samme funn på separat main |
| Fagverk-substansaudit | FAIL, 63 funn på kandidatgrunnlaget, 65 på main; ingen kandidatspesifikke funn |
| Fagverk-side/rendering/substans-tester | 7 feil; de samme sju testene feiler også på separat main |
| Reell mobil-/desktop-QA | IKKE UTFØRT: Chromium-nedlastingen ga ugyldig arkiv; cloud-nettleseren nådde ikke lokal testserver (`ERR_CONNECTION_REFUSED`) |

Kontrakttester av epokeviseren er ikke en påstand om gjennomført manuell nettleser-QA. Lokal testkjøring er heller ikke en påstand om grønn exact-head GitHub Actions.

## Fortsatt åpne fullføringsporter

1. Alle 70 spørsmål står fortsatt åpne i den uavhengige fagredaksjonelle signeringsmatrisen. Denne beskrivelsesgjennomgangen signerer ikke quiz, distraktorer eller Knowledge-forklaringer.
2. Den aktive quizen er fortsatt legacy 1×3. Kandidaten må gjennom kontrollert, samlet integrasjon av manifest, 10×7, full produksjonskontekst og Knowledge før faktisk runtime-QA. De tre gamle Knowledge-enhetene skal bevares.
3. Place-kilden mangler publisert stående frontImage, ferdige bildeklare samlinger og verifisert QuizCard-flip. Kandidatrapportens reelle People-/Objects-/hendelseskandidater er fortsatt uferdige, ikke N/A.
4. Fagverk er fortsatt `in_production`. Sluttkontroll av stedsiden, lenker og innhold gjenstår; et generert release-manifest er ikke en redaksjonell godkjenning.
5. Historie-rapporten er fortsatt `blocked`. Chronology er bygget, men UI-/Story-/sluttportene er ikke godkjent. De to leksikonoppføringene for Grini og den eldre Storyens dateringspåstand må gjennomgås samlet før closeout; byggesuksess alene løser ikke dette eierskapet.
6. Arkiv-/Før–etter-/Lesespor-/nyhetskandidatene og alle relevante popupfaner trenger faktisk sluttkontroll.
7. Den samlede CI-en og siste main-replay må være grønne før merge. Eksisterende katalogfeil er dokumentert som baseline, ikke skjult eller omklassifisert til PASS.

Historisk anker, publikumsanker og 360-metersradius er bevart. Ingen ny aktivitet eller rute inn i Ila fengsels sikkerhetsområde er opprettet.

## Seksdelt kvalitetsvurdering av hele PR-ens fullføringsmål

| Dimensjon | Score | Evidens / begrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Beskrivelsens faktiske setningskoblinger reparert og kontrollert; full quizsignering gjenstår |
| Dekning og ferdigstillelse | 2/5 | Bilder, samlinger, aktivering og slutt-QA er uferdige |
| Faglig/redaksjonell kvalitet | 3/5 | Beskrivelsen gjennomgått; uavhengig quiz-/Story-/helhetsreview er åpent |
| Teknisk integritet | 3/5 | Relevante lokale tester og rebuilds består; samlet CI og browsergate består ikke |
| Sikkerhet og ansvarlighet | 4/5 | Tilgangsgrenser og Knowledge-bevaring beholdt; ingen produksjonsaktivering uten verifisering |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Permanent regresjonstest, kilde-/claimspor, deterministiske bygg og separat main-baseline |

**20/30. Fullføringsporten består ikke.** Dette er et rettet og testet checkpoint, ikke en ferdigleveranse eller en godkjent merge.
