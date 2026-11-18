# Akerselva–Sagene–Grünerløkka: V1-bolk 20 steder (2026-11-16)

**Arbeidsstatus:** DRAFT. Dette er en arbeidsrapport, ikke en ny canonical standard og ikke en publiseringsmelding.
**Eier/regelverk:** `docs/PLACE_PRODUCTION_MINIMUM_V1.md`, `docs/PLACE_PRODUCTION_CHECKLIST.md`, `AGENTS.md`.
**Branch:** `work/oslo-akerselva-v1-bolk-20261116`.
**Avgrensning:** 20 eksisterende canonical place-ID-er; ingen opprettelse eller omnummerering. Andre kontoers Oslo-bolk 04, Oslo-havnefront #7118, Torshov #7224 og Å–V-sporet skal ikke endres.

## Nullmåling fra main før arbeidet

- **20** eksisterende steder med historiske grunntekster / stedsmetadata.
- **18/20** manglet `image` og `frontImage`. **2/20** hadde `image` (Myraløkka og Deichman Grünerløkka), men Deichman manglet `frontImage`.
- **20/20** manglet egen `fagverk`-blokk på hovedgrenen før denne grenen. En quiz-profil i Place er ikke bevis på fungerende fullquiz eller QuizCard.
- Quiz, QuizCard, Knowledge, People, bildeproveniens, preflight, source-claim-paritet, Fagverk-substansaudit, runtime og browser-QA er **ikke** ennå godkjent for bolken.

## Inventar

| Place-ID | Sted | Canonical source under data/ | image i main | frontImage i main | Fagverk på denne grenen |
|---|---|---|---|---|---|
| `frysjadammen` | Oset slusebru | `places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json` | nei | nei | utkast |
| `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | `places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13/frysja_33_brekke_kraftstasjon.json` | nei | nei | utkast |
| `seilduksfabrikken_nydalen` | Øvre spinneri | `places/natur/oslo/places_oslo_natur_akerselvarute/seilduksfabrikken_nydalen.json` | nei | nei | utkast |
| `stilla_nydalen` | Elvepartiet nedenfor Nydalsdammen | `places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json` | nei | nei | utkast |
| `bjoelsenfossen` | Bjølsenfossen | `places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenfossen.json` | nei | nei | mangler |
| `bjoelsenparken_elvenaer` | Advokat Dehlis plass | `places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenparken_elvenaer.json` | nei | nei | mangler |
| `myralokka` | Myraløkka | `places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json` | ja | ja | **nytt Fagverk-utkast, `in_production`** |
| `beierbrua` | Beierbrua | `places/natur/oslo/places_oslo_natur_akerselvarute/beierbrua.json` | nei | nei | mangler |
| `sagene_festivitetshus` | Sagene festivitetshus | `places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json` | nei | nei | mangler |
| `kuba_parken` | Kuba-parken | `places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json` | nei | nei | mangler |
| `nedre_foss` | Nedre Foss | `places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json` | nei | nei | mangler |
| `fossveien_elvestrekning` | Fossveien – elvestrekning | `places/natur/oslo/places_oslo_natur_akerselvarute/fossveien_elvestrekning.json` | nei | nei | mangler |
| `vulkan_murvegger` | Vulkan murvegger | `places/subkultur/oslo/places_subkultur/vulkan_murvegger.json` | nei | nei | mangler |
| `kuba_akselpassasjer` | Kuba-passasjene | `places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json` | nei | nei | mangler |
| `deichman_grunerlokka` | Deichman Grünerløkka | `places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json` | ja | nei | mangler |
| `grunerlokka_bakgardsvegger` | Grünerløkka bakgårdsvegger | `places/subkultur/oslo/places_subkultur/grunerlokka_bakgardsvegger.json` | nei | nei | mangler |
| `mir_grunerlokka_lufthavn` | MIR / Grünerløkka Lufthavn | `places/subkultur/oslo/places_subkultur/mir_grunerlokka_lufthavn.json` | nei | nei | mangler |
| `elvestrekning_bla_brenneriveien` | Elvestrekning ved Blå | `places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json` | nei | nei | mangler |
| `hausmannsomradet_elvelop` | Hausmannskvartalene – elveløp | `places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json` | nei | nei | mangler |
| `nybrua_vaterlandsparken` | Nybrua | `places/natur/oslo/places_oslo_natur_akerselvarute/nybrua_vaterlandsparken.json` | nei | nei | mangler |

## Gjennomført på denne grenen

1. `frysjadammen`, `frysja_33_brekke_kraftstasjon`, `seilduksfabrikken_nydalen` og `stilla_nydalen` har fått **hver sin Place-eide Fagverk-blokk** med separate stedsartikler, kildelinker, linser og observasjonsoppgaver. Alle fire er korrekt merket `status: in_production` og registrert i Fagverk-indeksen.
2. Historiske ingress-/artikkelutkast for de samme fire stedene er bevart som **ikke-publiserte redaksjonelle utkast** i `reports/place-production/oslo-akerselva-v1-description-drafts-20261116.json`. De aktive `desc` og `popupDesc` i Place-filer er **tilbakestilt til gjeldende main-tekst** til obligatorisk v4.2 source→claim→sentence→hash→review er utført. Dette korrigerer den første grenens uautoriserte tekststatus, uten å kaste det nye redaksjonelle arbeidet.
3. **40 distinkte kildekoblede quizkandidater** (10 per sted), med tre distraktorer, forklaring og kilder, er lagret i `reports/place-production/oslo-akerselva-v1-quiz-candidates-20261116.json`. Dette er *ikke* runtime-fullquiz, QuizCard, Knowledge eller godkjent V1.
4. Frysja 33 har tre nye, navngitte referanser i `externalLinks`, blant annet NVEs historiske rapport fra 2013 og lokale adressehistoriske kilder, samt samsvarende lenker i Fagverk-utkastet. `year: 1892` og det eksisterende bygningsankeret i Kjelsåsveien 151C er bevart.
5. Bilde- og kildearbeid er igangsatt; et presist Commons-foto av Brekke kraftstasjon med CC BY-SA 4.0 er verifisert som kandidat, men **ingen ny bildefil er lagt inn i appen**.

Disse tiltakene dokumenterer faktisk utført arbeid, ikke ferdigstatus. Ordinær V1 krever bilder, validerte fullquizer, QuizCards, Knowledge, ferdige Fagverk-sider og runtime-/browser-QA.

## Neste faktiske produksjonsporter (uten snarveier)

1. Fullfør kategoribasert READ-FIRST source-review og registrer gyldige `rule_preflight`-bevis for hver endret Place. Gjennomfør claim-/setningsparitet og oppdater eventuelle genererte context-/hash-artefakter for endret historietekst.
2. Gjennomfør Fagverk-id-/schema-/substansaudit for fire nye Fagverk-blokker. Kjør `node scripts/audit-fagverk-place-pages.mjs --write` og `node scripts/build-fagverk-release-manifest.mjs`, deretter `--check`; dokumenter de faktiske resultatene.
3. Finn identitets- og rettighetskontrollerte bilder. Lag faktisk `image`, egen stående `frontImage` og `cardImage` i riktige filformater; ikke bruk tilfeldige eller uklarerte fotoutdrag. Behold eventuelle gode eksisterende bilder.
4. Auditér hele eksisterende fullquiz per sted før nye spørsmål produseres. Lever minst ti ulike, kildebelagte stedsspørsmål, matchende QuizCard og Knowledge-/manifest-paritet. Endre ikke globale quiz-regler for å omgå kravene.
5. People-research og review etter canonical kontrakt; ingen personer opprettes som filler.
6. Kjør målrettede tester, ordinær PR-CI, og faktisk mobil/iPad/desktop-PlaceCard-, bilde-, QuizCard-, fullquiz- og Fagverk-browser-QA på PR-head.
7. Først når alle porter er bestått markeres stedet `v1`; vFerdig er en separat, høyere terskel. Å ha Fagverk-utkast alene er ikke V1.

## Status 2026-11-16

**Kandidater:** 20.
**Nye Fagverk-utkast:** 5 (første fire + Myraløkka).
**Nye verifiserte v1:** 0.
**Nye verifiserte vFerdig:** 0.
**Gjenstår:** 15 stedsspesifikke Fagverk, fortsatt 16 steder uten bildebinding på PR-grenen og ett manglende stående Deichman-bilde, fullt kildebasert 4.2-godkjente stedsbeskrivelser, runtime-fullquiz/QuizCard/Knowledge og kvalitetssikring for hele bolken. **40 kandidatspørsmål er skrevet, men ennå ikke integrert.**
**Bilde-/rettighetskø:** opprinnelig minst 18 steder uten `image` + én manglende `frontImage` i main. På PR-grenen er 2 av de 18 nå gitt eksterne, lisensierte originalbildebindinger; 16 i bolken mangler fortsatt `image`. Separate stående `frontImage` / `cardImage` og faktisk bildevisning gjenstår.
**Merge:** ikke klar; ingen påstand om at CI eller browser-QA er bestått.

Avhengigheter og risiko: `frysjadammen` er Oset slusebru, ikke Brekkedammen. `stilla_nydalen` er elvepunktet nedenfor Nydalsdammen, ikke de historiske Stilla-kulpene. `seilduksfabrikken_nydalen` er Øvre spinneri, ikke Christiania Seildugsfabrik. `frysja_33_brekke_kraftstasjon` er enkeltbygningen, ikke hele Frysja industriområde.

## Kildeavvik oppdaget under kontrollen 16. november

**Frysja 33 – mer presis kildekonklusjon:** Kraftstasjonens byggeår **1892** er uavhengig dokumentert av NVE i *Kulturminner i norsk kraftproduksjon* (2013, s. 71), basert på opplysninger fra Byantikvaren, og av lokal adressehistorie for Kjelsåsveien 151C. Kildene gir dermed grunnlag for å beholde byggeår 1892. Oslo kommunes kulturhistorie oppgir nedleggelse av sagbruket i **1965**, mens historielagets oversikt oppgir **1962**; sluttdatoen har altså fortsatt et konkret kildeavvik og må merkes med kilde hvis brukt i quiz. Dette er dokumentert, men **full 4.2 claim-/review-port er ikke gjennomført**. https://publikasjoner.nve.no/rapport/2013/rapport2013_52.pdf ; https://lokalhistoriewiki.no/wiki/Kjels%C3%A5sveien_%28Oslo%29 ; https://gknhistorie.no/Tillegg/Brekke%20kraftstasjon.html . Kilder: https://www.oslo.kommune.no/get-file/797618/378151321f5e4a09d64bac2406e9a8fd9c861c3c3473fd933860da92c2cd5082/ ; https://www.frysja33.no/ .

**Besøksadresse/anker:** Kommunens Frysja 33-side oppgir Kjelsåsveien 145, mens den eksisterende Place-filen dokumenterer sitt koordinatvalg med adressehistorisk grunnlag for Kjelsåsveien 151C. Ingen geometri er endret. Kontroller eiendom/tilkomst mot primærkilder før denne Place kan ferdigmeldes. Kilde: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/ .

**Oset:** Både slusebrua og den nyere anleggsbrua er nå ført med kildeetiketter i stedets `externalLinks`, ikke bare som skjulte Fagverk-URL-er.

## Første dokumenterte bildekandidat – ikke publisert

- **Brekke kraftstasjon / Frysja 33:** Wikimedia Commons-fil [`Brekke kraftstasjon på Frysja.jpg`](https://commons.wikimedia.org/wiki/File:Brekke_kraftstasjon_p%C3%A5_Frysja.jpg) viser riktig bygning. Fotograf **Helge Høifødt**, 6. juli 2018, eget arbeid, **CC BY-SA 4.0**. Original 6000 × 4000 px. Kan vurderes for identitetsbevarende hero-/stående- og kortutsnitt med navngitt fotograf, kilde, lisens, bearbeidingsopplysninger og bildedokumentasjon. **Ingen bildefil er hentet, konvertert, lagt til i source eller verifisert i app.**
- **Øvre spinneri:** Wikimedia Commons har eldre fotografier i kategorien *Historical images of Nydalens Compagnie*, inkludert en fil betegnet «Øvre Spinderi og Væveriet». Identitet og lisens på eksakt fil må fortsatt undersøkes før bruk. Historiske bilder merkes med faktisk opptaksperiode, aldri som nåfoto.
- **Oset slusebru:** Oslo byleksikon har et stedsriktig bilde, men fotokreditering alene gir ikke gjenbruksrett. **Ikke bruk før lisens eller egen kilde er klarert.**
- **Elvepartiet nedenfor Nydalsdammen:** ingen godkjent stedsspesifikk bildefil identifisert i denne kontrollen. Unngå foto fra de historiske Stilla-kulpene lenger nord.

**Historisk status for første nullmåling:** 0 nye bildebindinger på den tidlige grenen. **Oppdatert status nedenfor:** 2 nye originale Commons-`image`-bindinger i nåværende PR-head; verken tredelt bildepakke eller browserpublisering er utført.


## CI-nullmåling ved siste kontroll (før de nyeste korrigeringene)

Fra commit `86a98d043a5e47c6a325925461b1334f3666a33e` ble 11 GitHub Actions-jobber kjørt: 5 PASS, 6 FAIL. Feilene var (1) fire manglende bilder i `audit-place-images`, (2) utdatert `place-open`-payload, (3) manglende Historie-produksjonsrapporter ved endret `desc/popupDesc`, (4) manglende v4.2-claimpakker ved endret `desc/popupDesc`, (5) utdatert Fagverk release-manifest og (6) eldre naturkartreferanse `trikk_17_18`. Det siste er et annet scope.

Etter at **de aktive historietekstene ble tilbakestilt til main**, skal feil (3) og (4) kontrolleres på nytt på siste PR-head; de er **ikke dokumentert grønne** før ferske jobber er fullført. Bilde-, Place-open- og Fagverk-release-feilene er fortsatt åpne. Ingen påstander om grønn CI eller mergeklarhet.

## Bildestatus 16. november – to dokumenterte bildebindingsoppdateringer (ingen full V1)

**Frysja 33 – Brekke kraftstasjon:** Place-feltet `image` er nå koblet til det umodifiserte, stedskontrollerte Commons-originalbildet https://commons.wikimedia.org/wiki/File:Brekke_kraftstasjon_p%C3%A5_Frysja.jpg (2018, Helge Høifødt, **CC BY-SA 4.0**). `imageMeta` dokumenterer originalmål 6000 × 4000, kilde, fotograf, lisens, opptakstidspunkt og at ingen bearbeiding er utført. Visuell nettleser-QA og egne faktiske `frontImage` / `cardImage` mangler fortsatt.

**Øvre spinneri – Nydalens Compagnie:** Place-feltet `image` er nå koblet til Commons-filen https://commons.wikimedia.org/wiki/File:Nydalens_Compagnie,_%C3%98vre_Spinderi_og_V%C3%A6veriet_OB.F04310i.jpg (Per Adolf Thorén, Oslo Museum **OB.F04310i**, fotografert *antagelig 1878*, **CC BY-SA 3.0**). Oslo Museums katalog bekrefter motivet Øvre spinneri og veveriet sett fra vannrennen. Bildet er tydelig markert **historisk foto**, ikke dagens fabrikkutsikt. Selve originalfilen er brukt uten bearbeiding; stående bilde og kortvariant mangler.

**Felles presisering:** Det er **2 nye `image`-bindinger på denne PR-grenen**, ikke to ferdig produserte tredelte bildepakker og ikke to verifiserte V1-steder. **Oset slusebru** og **elvepunktet nedenfor Nydalsdammen** har fortsatt ikke publiserbar bildebinding. Oset-bildet i Oslo byleksikon er ikke gjenbruksklarert. Et nærliggende, men feilplassert, elvebilde skal ikke brukes til å oppnå kvote. Commons-foto må testes i faktisk PlaceCard/popup før noe kalles publisert.

## Fullquiz-nullmåling 16. november: 102 eksisterende spørsmål kontrollert strukturelt

Se `reports/place-production/oslo-akerselva-v1-quiz-audit-20261116.json` for maskinlesbart stedsnivå. Gjeldende `data/quiz/manifest.json` kobler de tre stedene nedenfor til faktiske settfiler, som er inspisert uten endringer:

| Sted | Sett × spørsmål | Spørsmål | Knowledge `editorial_review_required` | Intern «History Go»-kilde |
|---|---:|---:|---:|---:|
| Oset slusebru, teknisk ID `frysjadammen` | 6 × 7 | 42 | 14 | 33 |
| Øvre spinneri | 6 × 3 | 18 | 12 | 12 |
| Elvepartiet nedenfor Nydalsdammen | 6 × 7 | 42 | 13 | 34 |
| Frysja 33 | ingen direkte aktiv target funnet | 0 direkte | ikke målt | ikke målt |

**Sum:** 102 eksisterende spørsmål i tre direkte manifestkoblede quizfiler; 39 spørsmål med `editorial_review_required` og 79 med intern History Go-kilde. Tabellen er en strukturell nullmåling, ikke en faktagjennomgang av alle fasiter. Oset-quizen har **24 treff på gamle «Frysjadammen»** i spørsmål eller forklaringer. Øvre spinneri har feilaktig **seks sett à tre** og må bygges til en gyldig profil, ikke bare få ti QuizCard-spørsmål. Frysja 33 må først ha legacy-/omnibus-audit før vi konkluderer med at fullquiz ikke finnes. Unngå å endre stabile quiz- eller progresjons-ID-er uten migreringskontroll.

**40 nye spørsmål ligger som separate kildebelagte kandidater**, ikke runtime. Noen kandidatspørsmål vil måtte justeres ved review før de erstatter svake aktive spørsmål. Ingen aktiv fullquiz, QuizCard eller Knowledge er endret i denne PR-en.


## Oppdatering 16. november – synkronisering og Frysja 33-teksten

1. **Place-open:** Fire deterministiske `data/runtime/place-open/<place>.json`-filer er synkronisert med Place-kildene. For Frysja 33 er teksten synkronisert på nytt etter 4.2-oppdateringen. GitHub Actions-jobben *Verify generated place-open data* bestod ved kontrollen på commit `d88549dd3244f26ff77d81279ca65b7eed21d847`; tilhørende 390/1440-appen- og øvrig nettleser-QA er egen gate.
2. **Fagverk release:** `data/fagverk/fagverk_release.json` er bygget konsistent med det oppdaterte registryet (4 oppføringer, `in_production`). SHA256 fra canonical JSON ble kontrollert mot forrige innholds-digest før ny release-digest ble skrevet. Workflow *Fagverk release feed* bestod.
3. **Frysja 33 – ny `desc/popupDesc`:** Egen 4.2-pakke i `data/places/production/frysja_33_brekke_kraftstasjon.json` inneholder 10 kontrollerte claims, 2 ingress-setninger og 6 artikkelsetninger med eksplisitte claimkoblinger, tekst-SHA256, kilde-/redaksjonell review og 10 quiz-kandidatspørsmål. *Place description governance* ble verifisert **grønn** på commit `d88549dd3244f26ff77d81279ca65b7eed21d847`. Dette er godkjent beskrivelsesunderlag, ikke full V1.
4. **Kildepresisjon:** Byggeår 1892 fra NVE og lokalhistoriewiki, sagas nedleggelse oppgis forsiktig til **1960-tallet** på grunn av kildeavviket 1962/1965. `claim_frysja_33_identity` (1892) og `claim_frysja_33_ceramics` (1969) er markert `site_event`, mens bredere sagbruks-/jernbanehendelser er `institution_context`. Dette forhindrer overføring av feil historiske hendelser til selve kraftstasjonsbygningen.
5. **Epokeindeks ferdig regenerert:** GitHub Actions kjørte prosjektets canonical `node scripts/build-epoke-place-index.mjs` og synkroniserte `data/epoker/epoke-place-index.json`. Artefakten ble kontrollert direkte ved blob-SHA `392d1d0b7fb561b32c583077f56d96dc3d098d39`: eksakt 1892-claim fra NVE og 1969-claim om keramikerne finnes nå i sine respektive epoker; Oslo-dekningen for Frysja 33 er `dated_evidence`, og indeksens `verified_place_production_milestone_count` steg fra 1151 til 1153. **Epoch viewer quality bestod** på commit `315bfdc0a695c79ae879d9d0cff49f9701c01882`. En midlertidig, grenavgrenset engangs-workflow var nødvendig for å overføre den store genererte filen; den er **fjernet** fra PR-grenen igjen.

6. **Fortsatt blokkerende:** ingen sikker bildebinding for Oset slusebru eller for det presise elvepunktet nedenfor Nydalsdammen; alle fire mangler fullstendig `frontImage/cardImage`-pakke og gjenstående bilde/quiz/Knowledge/browser-porter. *Nature data validation* feiler på urelatert eksisterende `trikk_17_18`-referanse; hold dette utenfor denne steds-PR-en.

**Historisk status før Myraløkka-oppdateringen:** 4 Fagverk-utkast, 2 lisensierte `image`-bindinger, 40 quizkandidater, 1 forbedret kildegodkjent 4.2-stedsbeskrivelse, 0 ferdige V1, 0 ferdige vFerdig. PR #7342 er **draft og ikke merget**. Opplysningene om CI er for angitte committer; alle kontroller for aller siste head må kontrolleres selvstendig.


## Næringsliv-rapport, oppdaterte kontroller og kildeavgrensning

- `data/places/naeringsliv-production/frysja_33_brekke_kraftstasjon.json` er opprettet med fullt Næringsliv-skjema: tre stedsspesifikke kilder (Oslo kommune, NVE, Grefsen-Kjelsås-Nydalen historielag), tre aktørgrupper, dokumentert innsats–produksjon–utbytte, 1930-tallets omtrentlige 90 ansatte ved **hele saga**, fordeling av eierskap/arbeid og klare måle- og årsaksbegrensninger. De to canonical emnene matches eksakt. Port A–F er begrunnet; fullquiz/Story er **ikke** feilaktig merket ferdig. 
- Oslo kommunes aktuelle kultureiendomsbeskrivelse er merket `temporalCoverage: current` i Næringslivsrapporten (mens NVE dokumenterer fortiden). Dette rettet den spesifikke `presentOperation`-kildeporten som feilet på første forsøk. **Data checks bestod samlet** på commit `315bfdc0a695c79ae879d9d0cff49f9701c01882`, inkludert Places data og Næringslivsproduksjonsrapport.
- **Følgende CI var grønne på denne head:** Data checks, Epoch viewer quality, Place description governance, Fagverk release feed, Place production READ-FIRST, Place production closeout, Repository hygiene, Map place area LOD checks og Rockefeller historical Story correction. **Fagverk and place learning feiler fortsatt på bildekrav**; **Nature data validation** feiler på urelatert `trikk_17_18`. Place-open- og Oslo-browser-kontroll var ennå i arbeid ved denne statusføringen.
- **Foto Oset:** Søk bekrefter at Oslo byleksikon og Akerselvas Venner viser riktig Oset slusebru og krediterer fotograf Kjell Egil Sterten, men det finnes ingen påvist publiserbar gjenbrukslisens for de konkrete bildene. Ingen kopiering uten rettigheter. Foto av Maridalsvannet/Maridalsoset alene er ikke et dokumentarisk bilde av selve slusebrua.
- **Bilder ved Nydalsdammen:** Commons har bilder av selve dammen, Gullhaug bru og andre elvepartier, men de er ikke dokumentert å vise nettopp kartpunktet *nedenfor Nydalsdammen*. Ingen feil geografisk bildesubstitusjon er utført.


## Myraløkka – femte Fagverk-sted, eksisterende bilder beholdt

- **Sted:** `myralokka`, kategori Natur med stedets eksisterende By-emnekoblinger. Fagverk-feltet har nå en fireavsnitts fagartikkel, tre naturfaglige linser, fem undersøkelsesspørsmål, to synlige spor og fem steds-/kildespesifikke referanser. `status: in_production` og registeroppføringen peker til samme Place-eide Fagverk.
- **Fakta og hensyn:** Myraløkka er en amfilignende leirgrop fra Bentse teglverk, ikke en naturlig elvedal. Fabrikkpipa er nedgravd under haugen og må *ikke* inspiseres ved å grave. Myragårdens arbeiderboliger fra 1914 og Myrens Verksted på motsatt bredd holdes geografisk adskilt fra teglverket. Ingen får oppfordring om å gå i bratte skråninger eller forstyrre fugler. Historisk identitet støttes av Oslo byleksikon, lokalhistoriewiki og kommunens turguide.
- **Natur:** Det aktive Natur-kartet fører ni arter for stedet: gullstjerne og åtte fugler. Feltobservasjoner skal skille faktisk observerte arter fra kartregistrerte arter; alle ni kan ikke forutsettes til stede samtidig. Ingen nye artsfunn er lagt inn.
- **Media:** `image`, `frontImage` og `cardImage` var allerede på plass og ble beholdt. Ingen unødvendig bildegenerering eller erstatning av godkjente eksisterende foto.
- **Fullquiz og Knowledge:** `data/quiz/natur/myralokka_sets.json` har fortsatt 6 × 7 = **42** spørsmål og uendrede quiz-/Knowledge-ID-er. **19 åpne emnekoblinger er kilde- og påstandsgjennomgått**, og canonical Knowledge-generator er kjørt; den genererte review-køen har nå **40 linked / 2 editorial_review_required** for Myraløkka. De to åpne gjelder Myragårdens byggeår og arkitekter og skal ikke tvinges inn i Natur-faget. **26/42** har nå minst én direkte ekstern URL; resten bruker blant annet stedets interne Natur-kart eller trenger ytterligere kildeeierskap. Seks generiske definisjonsspørsmål krever fortsatt redaksjonell oppgradering. Detaljer ligger i `reports/place-production/oslo-akerselva-myralokka-knowledge-review-20261116.json` og den felles quiz-auditen.
- **Runtime/registrering:** `data/runtime/place-open/myralokka.json` er synkronisert med den nye Fagverk-blokken. `data/fagverk/fagverk_registry.json` har nå 298 Place-links og versjon `3.17.16`; canonical `data/fagverk/fagverk_release.json` er oppdatert med nytt innholds- og release-SHA256. CI på siste commit kreves som faktisk aksept.
- **QuizCard:** eksisterende `data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json` er **gjenbrukt**, ikke duplisert. De ti spørsmålene viser til ti faktisk koblede fullquizspørsmål; dato-spørsmål er redusert fra fire til **ett**. Fasiter, svaralternativer, quiz-ID-er og kildereferanser er synkronisert. `tests/myralokka-placecard-collections-v2.test.mjs` er oppdatert for 40/2-gaten og korrekte 10 QuizCard-tilknytninger. Reell touch-/iPad-flip gjenstår å verifisere særskilt.
- **V1:** enda **ikke godkjent**. To historiske spørsmål krever Natur-redaksjonell avklaring, seks generiske fullquizspørsmål trenger stofflig pass, full kildereview og synlig flip-/quiz-QA er obligatorisk.

**Oppdatert totalt for 20-stedersbolken:** **5 Fagverk-utkast under produksjon, 15 Fagverk mangler, 2 nye eksterne bilder i de første fire, 0 verifiserte V1, 0 vFerdig.** PR #7342 forblir utkast, ikke merget.


## Knowledge + QuizCard-kvalitet – videreført 16.11.2026

1. **Kildelesning:** Stedets 26 godkjente produksjonspåstander sammenholdt med 42 aktive spørsmål. Fire tilleggskilder for naturprinsipper ble kontrollert og koblet der de faktisk belyser spørsmålet: Oslo kommunes grønne forbindelse, NVEs kantvegetasjonsveileder, Artsdatabankens artsobservasjonsprotokoll og fagkilde om jordpakking. Stedsfunn fra naturkart beholdes som kartgrunnlag, aldri påstått dagsobservasjon.
2. **19 eksplisitte Knowledge-emnekoblinger:** dokumentert én for én med faglig emne, kilder, claim-ID-er når relevante og `reviewedAt`. Automatisk kunnskaps-ID-er ble ikke endret; canonical generator `npm run knowledge:canonical:write` og `--check` ble kjørt via midlertidig engangsworkflow og regeneratorens commit `3cf8b85b1b1b71632b1d650281414b6f83a1196a` oppdaterte bare `data/knowledge/knowledge_emne_review_queue.generated.json`, `data/knowledge/knowledge_units.generated.json` og `reports/knowledge-id-backfill.json`. Engangsworkflow er fjernet. Det genererte registeret er lest tilbake: Myraløkka har nå nøyaktig to køelementer, som tilsvarer de to dokumenterte åpne spørsmålene.
3. **QuizCard uten ekstra årstallspugging:** det eksisterende kortet `natur_v1_myralokka` er kuratert på nytt med ti koblede spørsmål fra fullquiz; nå ett årstallspørsmål mot fire tidligere. Både kart-/kantsoneforståelse og industrilandskap er med. `answerKey`, alternativer og kilde-URL-er følger eksakt aktiv quiz. Ingen QuizCard-bilde er brukt som ordinært `frontImage` eller `cardImage`.
4. **Konkret test:** `tests/myralokka-placecard-collections-v2.test.mjs` kontrollerer 42 unike quizspørsmål, 40 koblede Knowledge-unit IDs, to navngitte spørsmål til review, 19 eksplisitte nye koblinger, ti kortspørsmål fra koblede kilder, svar-/fasit-/kildeparitet og maksimalt ett dato-spørsmål. Tidligere test var hardkodet til 21/21 og måtte rettes etter innholdsendringen. CI på siste head må fullføres før dette omtales som testbestått.
5. **Ikke sluttført:** selv om kilde- og formatparitet er forbedret, gjenstår det to emneavklaringer, de seks generiske definisjonsspørsmålene og visuell touch-/tastaturtest av flipping og faktisk quiz. **0 av 20 V1** er dokumentert sluttført.

## Myraløkka – CI-feil analysert og rettet i PR #7342 (16.11.2026)

- **Kontroll på head `d5fd0c49bd38cd4f82193559e6ae2671ad7c40ea`:** Den fokuserte datatesten bestod (3/3). Nettlesertesten feilet **etter** PlaceCard-flipp, utvidet QuizCard og quizstart ved `#fagverkPlaceLenses a`. Årsaken er at stedsfagverket fortsatt har `status: in_production`, og appen skjuler bevisst linser, artikkel og feltoppgaver til innholdet er godkjent. Manglende lenker var derfor ikke bevis på at Fagverk-ruten var ødelagt.
- **Presis testretting:** `tests/myralokka-real-app-browser.mjs` tester nå de synlige, operative emnelenkene **og ærlig uferdigstatus** for `in_production`, men krever minst to faktisk synlige linser når status senere endres til `curated`. Alle tre skjermstørrelsene (mobil Chromium, iPad-størrelse WebKit og desktop Chromium) går fortsatt gjennom PlaceCard, kortflipp, utvidelse og quizrute før Fagverk.
- **Fagverk-kildefeil:** `audit-fagverk-place-pages.mjs` stoppet på en kommunal PDF-URL som ikke hadde navngitt `externalLinks`-oppføring i Myraløkka. Denne var feilplassert i Fagverk-kildelisten. Erstattet den med Oslo kommunes allerede navngitte lokale kilde **«Dannevigsveien og grønn forbindelse til Myraløkka»**; `data/runtime/place-open/myralokka.json` er synkronisert tilsvarende. Ingen uklar ekstern URL er lagt til bare for å få grønn CI.
- **Endringscommitter:** `4a80c725` (Place-kilde), `f12a9af1` (Place-open), `ee6d9b66` (netttest). Fersk CI på oppdatert PR-head er nødvendig før rettingene kan erklæres bestått.
- **Utenfor Myraløkka:** Naturkartvalidering feiler fortsatt på eksisterende `trikk_17_18`-referanse. Ikke rett dette ved å endre Myraløkka-kilden.
- **Faglig restanse:** `40/42` Knowledge-koblinger er eksplisitt eid; de to åpne Myragården-spørsmålene gjelder byggeår og arkitekter og skal ikke kobles kunstig til Natur. Seks generiske fullquizspørsmål trenger eget redaksjonelt stoffarbeid. **Fagverk forblir `in_production`, Myraløkka er ikke V1, PR-en er draft og ikke mergeklar.**

## Myraløkka – forbedret begrepsquiz og nettleserregresjon (16.11.2026)

- **Seks siste-settspørsmål forbedret:** `myralokka_s6_q1`–`myralokka_s6_q6` er nå situasjoner knyttet til leiruttaket, Akerselva, elvebredden, artskartet, skjøtsel og direkte artsobservasjon – ikke generelle ordlisteoppgaver. Distraktorene er revidert uten å endre korrekt svar, `answerIndex`, kunnskapstekst, kilde-refs, emnekoblinger, quiz-ID eller Knowledge-ID. Dermed er spillerprogresjon og 40/42-status ikke forsøkt nullstilt. Egen regresjonstest i `tests/myralokka-placecard-collections-v2.test.mjs` kontrollerer stedlig forankring, tre unike alternativer og identitetsbevaring.
- **CI-retting:** Første nykjøring etter forrige testretting kom gjennom QuizCard og fullquiz, men feilet på et rent presentasjonsavvik: CSS rendrer `FAGVERK UNDER PRODUKSJON`, mens `innerText()` ble sammenlignet med `Fagverk under produksjon`. Nettlesertesten bruker nå `textContent()` for den semantiske statusen; ingen app-CSS ble endret. At de ikke-godkjente Fagverk-linsene er skjult, er fortsatt riktig oppførsel.
- **Kvalitetsgrense:** Seks spørsmål har fått bedre spillertekst, men det innebærer **ikke** kildegodkjenning av alle 42 spørsmål. Eldre automatisk emnevalg, særlig spørsmål med brede/feilaktige naturfagsemner og intern kilde, må gjennomgås før V1. Myragårdens to rene byggeår-/arkitektspørsmål forblir i redaksjonell kø (40/42). Fagverk forblir `in_production`; kort og fullquiz kan derfor ikke alene gi V1.
- **Endringscommitter:** `75cd0ff5` nettlesertestens CSS-presisering, `02ded149` seks konseptspørsmål, `f458d816` regresjonstest og `9efde8bf` oppdatert Knowledge-review. **Ny CI og visuell QA må verifiseres på endelig PR-head.**


## Myraløkka – kanonisk Knowledge etter emnekorreksjon (16.11.2026)

- De syv tidligere feilklassifiserte spørsmålene `myralokka_s5_q1`–`s5_q7` har fått eksplisitt gjennomgåtte Natur-emner. Den gamle koblingen til dyreatferd er fjernet. Eksamens-/bruker-ID-ene (`id`, `quiz_id`, `primary_knowledge_unit_id`, `knowledge_unit_ids`) og Knowledge-tekstene er bevart.
- Kanonisk `knowledge:canonical:write` og `knowledge:canonical:check` ble gjennomført i engangs-Action #43880694557, med grønn identitets- og omfangskontroll; commit `f1d2fb40c44681ae1f3aafa4b6d29131f289917e` oppdaterte `data/knowledge/knowledge_units.generated.json` og `reports/knowledge-id-backfill.json`. Engangsworkflowen fjernet seg selv.
- Myraløkka står fremdeles på **40/42 Knowledge-koblinger**. `myralokka_s2_q5` og `myralokka_s2_q6` gjelder henholdsvis Myragårdens byggeår og arkitekter. De er kildebare, men rene historie-/byromsspørsmål og må ikke binds til et irrelevant Natur-emne for å øke telleverket.
- PR-CI på bot-commit `f1d2fb40` ble returnert som `action_required` ved kontroll, uten testutførelse. Dette er **ikke** bestått Myraløkka browser-/iPad-QA; kontroller ny kjøring på en senere faktisk PR-head. Full innholdsgjennomgang og Fagverk-kuratering gjenstår.
- **0 nye V1**, Myraløkka fortsatt `in_production`; PR #7342 fortsatt **draft**, ikke mergeklar.


## Myraløkka – syv faglige legacy-emner rettet, canonical Knowledge validert (16.11.2026)

- Alle syv spørsmål i femte fullquizsett (`myralokka_s5_q1`–`q7`) er gjennomgått enkeltvis. Feilkoblingen til `em_natur_dyreatferd_formering_tilpasning` er erstattet med faglig relevant artsmangfold, urbanøkologi, jordforhold eller geologisk landskapsform. Spørsmål om intern dataarkitektur er skrevet om til stedlig naturforståelse, uten å endre kunnskapstekst eller kanoniske ID-er.
- Manuelt gjennomgåtte emnekoblinger: **26** (19 tidligere + 7 nå), mens den kanoniske andelen teknisk koblede spørsmål forblir **40/42**. De to åpne spørsmålene om Myragårdens årstall og arkitekter står fremdeles til Natur/By-redaksjonell avgjørelse. Antallet 26 innebærer ikke at alle 40 koblede spørsmål er manuelt kildegodkjent.
- **Knowledge-regenerator kjørt og godkjent** i PR-styrt engangs-workflow; `knowledge:canonical:write` og `knowledge:canonical:check` var grønne. Den rapporterte uendrede ID-er/knowledge-tekst på alle 42 spørsmål, commit `f1d2fb40`. Kun forventede genererte registerfiler ble oppdatert; workflowfilen fjernet seg selv fra arbeidsgrenen. Den genererte review-køen viser fortsatt nøyaktig to Myraløkka-spørsmål.
- Regresjonstesten er utvidet til 26 eksplisitte vurderinger, syv spesifikke emnevalg og samsvar mellom hver av de syv aktive quizspørsmålene og tilhørende genererte Knowledge-unit. Full CI på siste PR-head må være grønn før dette er testgodkjent.
- **Nettlesertest:** Faktisk kortflipp, utvidet kort, quizrute og Fagverk kom gjennom mobil Chromium og videre til simulert iPad WebKit. Tidligere feil gjaldt en ekstern CARTO-basemap-glyph/CORS-ressurs, ikke en observerbar feil i Myraløkka-kortet. Ny test tolererer bare dette presist identifiserte fontavviket, ikke andre appfeil. Mobil/iPad/desktop-regresjonen på *siste head* må fortsatt kontrolleres.
- **Andre CI-porter:** V1-bolkens to andre steder mangler godkjente bilder (Oset slusebru, elvepunktet nedenfor Nydalsdammen); naturkartet inneholder fortsatt urelatert `trikk_17_18`. Disse feilene er ikke maskert eller fikset ved å endre Myraløkka.
- **V1-status: 0/20 godkjent i bolken; Myraløkka fortsatt `in_production`, PR #7342 fortsatt draft og ikke merget.** Fagverk og øvrige manuelle kildereviews må sluttføres før stedets V1-port åpnes.


## Myraløkka – dokumentert tverrplattform-PlaceCard-QA (2026-11-16)

- **Grønn GitHub Actions-kjøring #43881693704** for `.github/workflows/myralokka-placecard-curation.yml` på commit `d2adbae98cf4935cfd9fb81aa6a1361b46e63f8c`. Kjøringen bestod fokusert datatest, `npm ci`, generering av Place-data, installasjon av Chromium/WebKit, faktisk PlaceCard-flipp, 10 QuizCard-spørsmål, utvidet kort, fullquiz-rute og Fagverk-visning på telefonlignende Chromium, iPad-størrelse WebKit og desktop Chromium. Skjermbilder ble lagret i Actions-artefakten `myralokka-real-app-browser` (ikke publiserte bildeassets). Det er simulert iPad-WebKit, ikke fysisk Safari på iPad.
- Testen kontrollerer korrekt og synlig `in_production`-status for ikke-kuraterte Fagverk-linser. Den er **ikke** en kurateringsgodkjenning: `fagverk.status` står fortsatt som `in_production`, med innhold skjult i brukerflaten etter eksisterende kontrakt.
- Resultatet lukker **nettleser-QA-porten for draft-tilstanden**, men ikke den redaksjonelle Fagverk-gaten, fullquizens siste emne-/kildegjennomgang, de to Myragården-spørsmålene eller bolkens samlede V1-/mergekrav. **Myraløkka fortsatt `v1_candidate`; 0/20 nye verifiserte V1; PR #7342 beholdes som draft uten merge.**


## Myraløkka – kuratert Fagverk med kanonisk runtime (16.11.2026)

- **Standard Fagverk kuratert:** `data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json` har nå `fagverk.status: curated`. Det kildeførte innholdet om leiruttak, industrispor, parklandskap og artsobservasjon har egen artikkel, tre linser, fem undersøkelsesspørsmål, to spor og dokumenterte kilder. Kuratering er ikke i seg selv en godkjenning av alle 42 quizspørsmål.
- **Grønn canonical regenerering i Action #43883156141**, kontrollert med `node scripts/audit-fagverk-place-pages.mjs`, `npm run place-open:check`, `node scripts/build-fagverk-release-manifest.mjs --check` og fokusert Myraløkka-datatest. Commit `104f70f9f1c2b29416d2f79c279def17bcbc10ef` synkroniserer Fagverk-registry, Place-open og Fagverk release-manifest. Engangsworkflowen fjernet seg selv.
- Nettlesertesten `tests/myralokka-real-app-browser.mjs` er skjerpet til å kreve `curated` og minst to fungerende faglige linser. Den tidligere vellykkede Action #43881693704 testet **draft** og gir derfor ikke alene visuell aksept for den kuraterte siden; ny full kjøretur er nødvendig.
- **Åpne V1-porter:** de to rene Myragården-spørsmålene `myralokka_s2_q5`/`q6` har fortsatt `editorial_review_required` og må flyttes til korrekt historisk/byfaglig eierskap eller erstattes med riktig progresjonsmigrering; resten av fullquizens kilde-/emnekvalitet og People-review må sluttføres. **40/42 teknisk linked, 0/20 nye V1 i bolken, PR #7342 fortsatt draft og ikke mergeklar.**


## Myraløkka – People-kandidataudit med identitetsgrense (16.11.2026)

- Canonical People-manifest har to allerede godkjente arkitektprofiler med bilder og identitetsmetadata: `data/people/by/oslo/folketeateret/christian_morgenstierne.json` og `data/people/by/oslo/folketeateret/arne_eide.json`. Myraløkkas v4.2-kildepakke dokumenterer at de tegnet **Myragården** i Arendalsgata 5–45, ferdig 1914 (claim `claim_myralokka_19`, kilde [Lokalhistoriewiki – Myragården](https://lokalhistoriewiki.no/wiki/Myrag%C3%A5rden)). De er derfor konkrete **nærhetskandidater**, ikke oppdiktede People.
- Begge profiler har `placeId: folketeateret`; dette primærankeret skal beholdes. Myragården er **egen rekke arbeiderboliger ved parkens øvre kant**, ikke selve leirgropa, teglverket eller parkens adresse. Sekundærkobling `places: [myralokka]` er **ikke aktivert** før stedsspesifikk People-visning kan bevise at relasjonen «arkitekt for boligrekken ved parken» fremgår uten at appen påstår at de tegnet selve parken.
- Canonical `jens_jacob_jensen_myrens` har dokumentert anker ved `myrens_verksted` **på motsatt elvebredd**. Han skal ikke flyttes eller automatisk kobles til parkens Place som proxy for verkstedet.
- People-status: **kandidatgransking gjennomført, materialisering av korrekt relasjon fortsatt BLOCKED**. Ingen profiler, bildemidler eller Place-personkoblinger er oppdiktet. V1 skal ikke godkjennes bare fordi kandidatene er identifisert.


## Myraløkka – to historiske spørsmål tatt ut av Natur med progresjonsvern (16.11.2026)

- De to rene historiefaktaene om Myragården (byggeår 1914 og arkitekter) ble **ikke** gitt falske Natur-emner. Originale spørsmål med `quiz_id`, `primary_knowledge_unit_id`, `knowledge` og kilder er arkivert som ikke-spillbar Knowledge-kilde i `data/knowledge/preserved_quiz_sources/myralokka_myragarden_legacy_20261116.json`, etter eksisterende canonical Grini-mekanisme.
- I aktiv Natur-fullquiz er de erstattet av to kildebelagte naturfaglige spørsmål om kantvegetasjonens leveområder og røttenes erosjonsvern. Nytt `id`/`quiz_id` og nye Knowledge-ID-er brukes **kun** for nye læringsmål; de øvrige 40 beholdes. Kilde: [NVE – kantvegetasjonens viktige funksjoner](https://veiledere.nve.no/skjotsel-av-kantvegetasjon-langs-vassdrag/kantvegetasjonens-viktige-funksjoner/). Ingen lokale erosjonsmålinger eller ferske artsobservasjoner påstås.
- Forventet aktiv quiz: **42/42 faglig koblet**, ingen åpne aktive Myragården-spørsmål. Gammelt opptjent Knowledge skal fortsatt finnes under arkivert original-ID, uten at de historiske spørsmålene gjøres spillbare.
- **MERK:** Dette er en redaksjonell endring i PR-grenen og krever full `knowledge:canonical:write/check`, genererte register-/kødata og mobil/iPad/desktop-test på endelig PR-head før endringen kan godkjennes. Resten av 20-stedersbolken og eventuelle andre CI-feil må fortsatt løses før merge.


## Myraløkka – alle 42 faglige emnevalg gjennomgått (16.11.2026)

- Etter de 28 eksplisitt gjennomgåtte koblingene har de siste **14 teknisk lenkede, men automatisk klassifiserte** spørsmålene i sett 1 og 6 fått faglig begrunnede `emne_ids` og eksplisitt `knowledge_link_evidence`. Kartlagt gullstjerne behandles som intern kanonisk kartkobling, ikke verifisert dagsobservasjon. Kilde-URL-er til Oslo kommune, NVE og Artsdatabanken er koblet der de faktisk underbygger spørsmålet.
- Innledningssettets tidligere metaspørsmål om «et godt observasjonsspørsmål» er skrevet om til en konkret undersøkelse av parkens skålform fra stien, med mindre tilfeldige svaralternativer. Quiz- og KU-ID er bevart fordi læringsmålet stedlesning er uendret. Årstallsspørsmålet om Myrens Verksted er presisert: fabrikkbygningene lå på motsatt side av Akerselva, ikke i selve Myraløkka-parken.
- **42/42 aktive spørsmål med eksplisitt gjennomgått emneeierskap** er lagt inn i quizkilden; canonical Knowledge-regenerering, sentral generator, QA og CI på *siste head* må bestås før faglig review kan erklæres teknisk fullført. Ingen andre steder er endret i denne operasjonen.


## Myraløkka – avsluttende delkontroll, 16. november 2026

- **42/42 aktive fullquiz-spørsmål** har nå `linked` Knowledge og **42/42 eksplisitt vurderte emnevalg**; canonical generator `--write` og `--check` bestod i [Action #43910111477](https://github.com/Paradispartiet/History-Go/actions/runs/43910111477) og ble committet som `12d65622`.
- De to gamle rene Myragården-spørsmålene er **ikke lenger spillbare**. De er bevart i `data/knowledge/preserved_quiz_sources/myralokka_myragarden_legacy_20261116.json` med uendrede opptjente Knowledge-ID-er. At review-køen fortsatt inneholder **to arkiverte** Myragården-referanser, betyr **ikke** to åpne spørsmål i aktiv quiz.
- Myraløkkas fokuserte [PlaceCard-/QuizCard-/Fagverk-/nettleserkjøring #43910110983](https://github.com/Paradispartiet/History-Go/actions/runs/43910110983) var **grønn** på kilden før siste generator-commit; generatoren endret deretter bare avledet Knowledge og rapportfiler, ikke quizspørsmål eller app-runtime. Mobil, desktop og simulert iPad WebKit inngår, men fysisk Safari er ikke testet.
- **People:** De eksisterende kilde-/bildegodkjente arkitektene Arne Eide og Christian Morgenstierne er sekundærkoblet til Myraløkka med uttrykkelig forklaring om **Myragården ved parken**, ikke parkens egen arkitektur. Hovedankeret `folketeateret` er bevart. Kanonisk People-shard og fire berørte Place-open payloads er oppdatert i commit `a69044ed`; `runtime.people` for Myraløkka viser begge.
- **Status:** Myraløkka er redaksjonelt og teknisk en sterk `v1_candidate`, men **ikke publisert V1**. Siste ordinære PR-CI på en bruker-commit må verifiseres, og PR #7342 omfatter også andre steder med åpne bilde-/naturkartfeil. Ingen merge utføres før samlet produksjonsport er godkjent.


## Bolkens siste CI- og bilderapport – 16. november 2026

- **Naturkart – feil lukket.** Den døde fuglekartnøkkelen `trikk_17_18` er fjernet, 66 øvrige Place-koblinger er urørt (`00d6bdb9`). [Nature data validation #43919061317](https://github.com/Paradispartiet/History-Go/actions/runs/43919061317): **SUCCESS**.
- **PlaceCard fullbredde – feil lukket.** `css/placeCard.css` sikrer absolutt plassering av `#pcFrontImage` over hele 3:4-frontflaten uten sorte kanter (`df4148a8`). Akerselva-testen kontrollerer ekte `cover`, dekning både horisontalt og vertikalt, portrett/landskap og forskjellige bildeassets. [Akerselva browser #43919061384](https://github.com/Paradispartiet/History-Go/actions/runs/43919061384): **SUCCESS**. [Place image overview fit #43919061267](https://github.com/Paradispartiet/History-Go/actions/runs/43919061267): **SUCCESS**. QuizCard-baksiden bruker fortsatt `contain`, slik at kortets egne bilder ikke kuttes.
- **Regresjonskontrakter oppdatert, ikke omgått.** To gamle visuelle tester krevde `contain` på hovedbildene, i motstrid med gjeldende `main`-design `20261116-full-bleed1`. `tests/place-image-overview-fit-browser.mjs` (`fb4f241a`) kontrollerer nå full-bleed hero/front og uendret contain for historiske/dokumentariske fotoserier, QuizCard og øvrige bilder. `tests/oslo-v1-actual-runtime-visual-browser-audit.mjs` (`4c97cdab`) kontrollerer dekodede bilder og geometrisk dekning av front- og header-rammen, uten å svekke andre QA-krav. Siste brede Oslo media-audit må kontrolleres separat når jobben er ferdig.
- **Myraløkka:** 42/42 eksplisitt Knowledge-tilknyttede aktive spørsmål, to historiske opptjenings-ID-er bevart og kuratert Fagverk; [Myraløkka PlaceCard #43919061356](https://github.com/Paradispartiet/History-Go/actions/runs/43919061356) var fortsatt pågående ved første registrering i denne delen, men samme type nettlesertest var tidligere bestått. Endelig V1/merge gjelder hele bolken, ikke kun dette stedet.
- **To konkrete bildeblokkerere:**
  1. `frysjadammen` – Place-navn **Oset slusebru, Maridalsoset** (`59.96932215, 10.7879593`), ikke Frysjadammen. Et presist foto av trebrua med slusemekanismen er [publisert i Oslo byleksikon](https://oslobyleksikon.no/side/Oset_slusebru), med fotograf **Kjell Egil Sterten**, men åpent gjenbrukslisensgrunnlag er **ikke verifisert**. Et historisk motiv fra 1929 av Inger Munch, [Oslo Museum OB.Z00993](https://oslobilder.no/OMU/OB.Z00993), dokumenterer elveutløpet ved Oset og er merket Creative Commons på kildesiden, men er **ikke et kontrollert landskapsfoto av selve slusebrua**. Ingen av bildene er tildelt hovedbilde-feltet.
  2. `stilla_nydalen` – faktisk **elveparti ca. 100 meter nedenfor Nydalsdammen** (`59.95601833, 10.76639787`), ikke historiske Stilla-kulper. [Tore Sætres Nydalsdammen-foto på Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nydalsdammen_foilage_Akersleva_(161215).jpg) har CC BY-SA 4.0 og GPS `59.956682, 10.765755`, men er **bare 900 × 625** og viser et nærliggende dammotiv, ikke verifisert eksakt elveparti. Det godkjennes ikke som umerket hovedbilde uten bedre samsvar.
- **Prinsipp:** Bruk ikke bilder fra feil sted, bilder med uklar opphavsrett eller generisk AI-erstatning merket som dokumentarfoto for å passere `audit-place-images.mjs --mode=changed`. De to manglene holder Fagverk-bildeporten og samlet 20-steders-V1 tilbake. PR #7342 forblir **DRAFT / ikke merget** inntil faktisk godkjente bildeassets og relevante CI-porter er grønne.


## Fotografisk V1-port – oppdatert 17. november 2026

- **Oset slusebru (`frysjadammen`)**: Den eksakte trebrua med historisk reguleringshjul er nå dokumentert ved originalfoto [Oset slusebru.jpg](https://oslobyleksikon.no/side/Fil:Oset_slusebru.jpg), Kjell Egil Sterten / Oslo byleksikon, eksplisitt **CC BY-SA 4.0**. Canonical Place har `bilder/places/oset_slusebru_landscape.webp` (hele motivet 1600 × 1064) og `bilder/places/oset_slusebru_front_portrait.webp` (tydelig merket 3:4 utsnitt av samme lisensierte fotografi, 900 × 1200). Lokal bildegenerering, synkronisering av runtime, scope-kontroll og selvrensing av engangs-workflow **bestod** i [#44067102425](https://github.com/Paradispartiet/History-Go/actions/runs/44067102425), commit `3f61441a`. Ingen bilde fra den nyere nabobrua er brukt.
- **Elvepartiet nedenfor Nydalsdammen (`stilla_nydalen`)**: To **forskjellige** originalfotografier fra 6.8.2020 av Ryan Hodnett / Wikimedia Commons **CC BY-SA 4.0** er tilordnet `image` og `frontImage`: [liggende Nydalsdammen og utløpet](https://commons.wikimedia.org/wiki/File:Nydalsdammen_-_Oslo,_Norway_2020-08-06_(05).jpg) (5757 × 3838) og [stående Akerselva sett oppstrøms fra Consul Blikstads bro](https://commons.wikimedia.org/wiki/File:Akerselva_-_Oslo,_Norway_2020-08-06_(01).jpg) (3895 × 5842). Det stående bildet viser den nedstrøms elvestrekningen og er **ikke** et Stilla-bilde fra lenger nord. Metadata, kilder, lisens og foto-credit er registrert i Place. Endringen ble lagret i `94badf6e`, runtime-payload synkronisert i `3f61441a`.
- **Bildevalidering:** Begge Place-kildene har ikke-tomme og ulike `image`/`frontImage`, korrekt navn, fotograf og bruksrett. Generering/test av lokal Oset-filer og `npm run place-open:check` bestod. Den nye `tests/akerselva-outflow-two-place-image-browser.mjs` og workflow `akerselva-outflow-photos-browser.yml` skal kontrollere dekoding av begge fotografiene på **mobil Chromium, iPad WebKit og desktop Chromium**, full bredde og høyde, samt foto- og kildesamsvar.
- **Viktig:** Eldre rapportavsnitt om *manglende bilder* er **historiske mellomstatuser** og overstyres av denne oppdateringen. Bildeporten skal erklæres bestått først etter ny `audit-place-images.mjs --mode=changed` og live bilde-QA. PR #7342 forblir **DRAFT** til samtlige relevante produksjonsporter og samtlige 20 steder er godkjent; bildenes eksistens alene godkjenner ikke V1 eller merge.


## Bildeport bestått og Oset-quizkandidater kildegransket – 17. november 2026

- **Bildeporten er nå løst og kilderegistrert:** lokal Oset slusebru-oversikt og 3:4 utsnitt fra Kjell Egil Sterten / Oslo byleksikon, pluss to forskjellige Commons-bilder av det første elvepartiet nedstrøms Nydalsdammen. Alle CC BY-SA 4.0, med kreditert opprinnelse, stedlig avgrensning og egne `image`/`frontImage`.
- [Real-app-bildetest #44067633349](https://github.com/Paradispartiet/History-Go/actions/runs/44067633349) **SUCCESS** i mobil Chromium, simulert iPad WebKit og desktop Chromium. [Oset-bildegenerator #44067102425](https://github.com/Paradispartiet/History-Go/actions/runs/44067102425) **SUCCESS** inkludert kildebildets størrelse, WebP-filer og Place-open-synkronisering.
- **Samlet bildeaudit regenerert og grønntestet** i [#44069131762](https://github.com/Paradispartiet/History-Go/actions/runs/44069131762), commit `872d773e`. Canonical `data/places/place_image_backlog_summary.json` og `reports/place-image-audit.json` samsvarer nå: **1538 steder, 219 lokale bilder, 144 eksterne, 79 valgfrie Micro Places, 1096 mangler, 0 ugyldige**, med konsistente kategoritall. Dette er hele appens bildedekning, ikke bare V1-bolken. Tidligere rapportlinjer om 1100 mangler og to bildeblokkerere er historiske, ikke gjeldende.
- **Oset slusebru – neste redaksjonelle V1-steg startet.** Alle 10 eksisterende kandidater i `reports/place-production/oslo-akerselva-v1-quiz-candidates-20261116.json` er kildegjennomgått mot [Oslo byleksikon: slusebru](https://oslobyleksikon.no/side/Oset_slusebru) og [anleggsbru](https://oslobyleksikon.no/side/Oset_anleggsbru). Trebrua (1859), den håndbetjente slusen, bevarte mekanismedeler, VAV-eierskap og den nyere kjørebruas funksjon (2003/2004) er skilt presist. Åpenbart svake distraktorer er forbedret, og kun ett rent årstallsspørsmål er beholdt. **10/10 er kildegranskede utkast – 0/10 er godkjent spillbar fullquiz.** Flere spørsmål og alle V1-gater gjenstår.
- **Sperre beholdt:** PR #7342 er fortsatt **DRAFT/ikke merget**. Gyldige bilder, korrekt register og 10 redaksjonelle quizutkast betyr ikke at alle 20 steder er V1. Ordinær Fagverk-/CI-status må kontrolleres på siste brukercommit.


## Oset slusebru – eksisterende 42 spørsmål funnet og auditert (17.11.2026)

- **Korrigert nullmåling:** `data/quiz/manifest.json` viser allerede seks aktive sett for `frysjadammen` i `data/quiz/historie/frysjadammen_sets.json`: **42 aktive spørsmål**. Ti (sett 1 og tre første i sett 2) er kildekorrigert til Oset slusebru; resterende **32 må granskes**. **33 `linked` / 9 `editorial_review_required`** er teknisk status, ikke bevis for kildekvalitet. Tidligere formulering «0/10 godkjent fullquiz» var feil og er supersedert. Ingen dublettquiz må opprettes.
- **Kanonisk produksjonsregel:** `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` v3.4 krever audit av eksisterende quiz før profilvalg og adaptivt antall sett. Seks sett må ikke fylles med generiske «Hva betyr ...?»-spørsmål eller spørsmål om History Go selv. De første 2 × 7 er direkte normale spørsmål. Osets tekniske ID `frysjadammen` beholdes; visningsnavnet er Oset slusebru.
- **Nytt kildegrunnlag, ikke aktiv quiz:** `data/quiz/production_briefs/historie/frysjadammen.json` har **28 kildefestede påstander** og foreløpig `normal_4x7`-profil. Fire leste kilder: [Oset slusebru – Oslo byleksikon](https://oslobyleksikon.no/side/Oset_slusebru), [Oset anleggsbru – Oslo byleksikon](https://oslobyleksikon.no/side/Oset_anleggsbru), [Oslo VAV 150 år](https://www.oslo.kommune.no/etater-foretak-og-ombud/vann-og-avlopsetaten/vann-og-avlop-i-150-ar/) og [Akerselvas Venner om Oset slusebru](https://www.akerselvasvenner.no/2016/01/01/oset-slusebru/). De to lokale brubeskrivelsene har delvis samme opphav, og er ikke uavhengig dobbeltkontroll.
- **Avgrensning før endring av aktivt spill:** Nytt claim-grunnlag og profil er merket `partial` / foreløpig. Fagmanifestets fullpakke, kilde-claim-spørsmålskoblinger, valg av fag-/teoriinnhold, historiske Knowledge-ID-er og QuizCard-paritet må løses før 42 aktive spørsmål kan endres, reduseres eller arkiveres. Ingen brukeropptjening skal tapes, og ikke skjul gamle spørsmål ved å senke kvalitetskravet.


## Oset – 28 spørsmålsutkast og bevaring av 42 Knowledge-ID-er (17.11.2026)

- **28/28 konkrete svarbare spørsmålsutkast** ligger inne i det samme `data/quiz/production_briefs/historie/frysjadammen.json` som kildegrunnlaget, med `planned_set`, `planned_question`, `source_claim_id`, svaralternativer, fasit, forklaring og kontrollerbare eksterne kilder. **4 × 7**, inklusive de første **14 normale spørsmålene** uten eksplisitte teorikoblinger. Utkastene er ikke runtime eller QuizCard. Foreløpig plan: normal 4 × 7, ikke seks sett med utfylling.
- **Identitetsbevarende audit gjennomført:** Full oversikt over samtlige **42 originale `id` + `quiz_id` + `primary_knowledge_unit_id`** er nå lagret som `existing_quiz_audit.legacy_id_knowledge_ledger`, uten endring av noen av de originale ID-ene. 33 teknisk `linked`; 9 `editorial_review_required`. Første ti kildegranskede eksisterende spørsmål beholdes som kandidater til kontinuitet. Resten krever individuell avgjørelse om kildetilknytning, omformulering eller ikke-spillbar bevaring.
- **Kildekontroll:** Fire leste kilder, 28 påstander, 28 svarbare utkast og null løse kilde-ID-er i utkastet. Denne kontrollen er utført som kilde-/datastruktur-gjennomgang på PR-grenen; den er **ikke** en grønn live quiz-, Knowledge-generator- eller simulatorgodkjenning.
- **Videre port:** Avklar migrering av de historiske quiz-/Knowledge-ID-ene, les hele historie-fagpakken gjennom den kanoniske resolveren, oppdater selve quizens sett og Knowledge, bygg QuizCard og test i ekte app. Først deretter kan Oset vurderes som V1.


## 17.11.2026 – uavhengige bildemotiver og canonical Knowledge reparert

- **Viktig ny CI-regel:** Den bredere originalbildekontrollen krever *forskjellige originaler*, ikke bare forskjellige utsnitt. Tidligere 3:4-kutt fra Kjell Egil Stertens fotografi av Oset slusebru var dermed **ikke** tilstrekkelig; eldre notater som omtaler det som ferdig bildeløsning er supersedert.
- **Korrekt foto + uavhengig illustrasjon:** `image` for Oset forblir Kjell Egil Stertens dokumentarfoto (CC BY-SA 4.0, fotokilde `https://oslobyleksikon.no/side/Fil:Oset_slusebru.jpg`). `frontImage` er nå en **egen originalredigert SVG-illustrasjon** av trebru og manuelt sluseratt, `bilder/illustrasjoner/places/oset_slusebru_front_original.svg`, synlig merket *ILLUSTRASJON · HISTORY GO*. `frontImageMeta` angir uttrykkelig at grafikken ikke er fotografi. Den gamle beskårne kopien `bilder/places/oset_slusebru_front_portrait.webp` er fjernet. Motivet bygger på dokumenterte fakta, men er **ikke** en teknisk nøyaktig rekonstruksjon.
- **Kildenes originalintegritet:** GitHub Actions lastet ned og kontrollerte pikselstørrelsene på de tre selvstendige originalfotografiene. SHA-256 er nå registrert i `imageMeta.sourceSha256` for Oset og `imageMeta.sourceSha256`/`frontImageMeta.sourceSha256` for elvepartiet nedenfor Nydalsdammen. Den siste har fortsatt to reelt forskjellige fotografier av Ryan Hodnett (CC BY-SA 4.0). [Kilde- og originalkontroll #44075973307](https://github.com/Paradispartiet/History-Go/actions/runs/44075973307): **SUCCESS**, commit `32d1fd43`.
- **Kanonisk Knowledge regenerert:** Samme jobb kjørte `knowledge:canonical:write` og `knowledge:canonical:check` med **grønne resultater**. Regenererte filer: `data/knowledge/knowledge_units.generated.json`, `data/knowledge/knowledge_emne_review_queue.generated.json` og `reports/knowledge-id-backfill.json`. Dette retter tidligere CI-drift uten å endre de 42 aktive Oset-spørsmålene eller bytte opptjente Knowledge-ID-er. Separate Rockefeller-/Technology-/Data Checks må likevel kontrolleres på neste ordinære PR-kjøring.
- **Kravet er beholdt:** `scripts/check-distinct-place-photos.mjs` er uendret og sjekker både fotografers unike originaler og originalillustrasjoners faktiske SVG-innhold. Den målrettede browser-testen er oppdatert til foto/illustrasjon på Oset og to foto på Nydalen. Kilderegnskap, forskjellig medieopphav, dekoding og fullbredde testes nå i mobil/iPad/desktop.
- **Oset-quiz:** Egen `tests/oset-quiz-migration-draft-guard.test.mjs` tester de 28 kildebundne redaksjonelle spørsmålsutkastene, 4 × 7 plan, første 2 × 7 normale spørsmål og 42/42 uendrede historiske quiz-/Knowledge-ID-er. Testen godkjenner **utkast, ikke aktivering**. Ingen quizmigrering har funnet sted.
- PR #7342 forblir **DRAFT / ikke merget** til ordinær PR-CI er grønn og hele 20-steders-V1 kan godkjennes.


## Oset fullquiz-migrering 4 × 7 – 17. november 2026

- 28 kildebaserte spørsmål i fire sett i canonical historiequiz. Første 10 originale spørsmåls-, quiz- og Knowledge-ID-er videreføres med uendret Knowledge-tekst; 18 nye spørsmål får nye ID-er.
- De andre 32 eldre spørsmålene ligger uendret og ikke-spillbart i `data/knowledge/preserved_quiz_sources/frysjadammen_oset_legacy_20261117.json`. Canonical Knowledge-generator leser arkivfilen for å bevare opptjente enheter, uten å vise de gamle spørsmålene i spillet.
- `normal_4x7`: 16 faktaspørsmål, 7 årsak-/sammenhengsspørsmål, 5 reelle metode-/kildekritikkspørsmål. Første 2 × 7 er vanlige spørsmål. Kildeplan, fagvalg og 28 kilde-claim-koblinger er i eksisterende source brief. QuizCard og genererte Knowledge-filer skal bygges fra aktiv quiz.
- **PR-fase, ikke V1-godkjent:** full produksjonskontekst, Knowledge-regenerering, QuizCard, reelle nettlesertester og samlet CI må bestås på endelig commit.

## Kuratert Fagverk for Oset slusebru – 18. november 2026

- Osets Place-eide Fagverk er kuratert på standardnivå. Fire avsnitt, tre faglige linser, fem undersøkelsesspørsmål og to observerbare spor skiller den håndbetjente slusen fra den nyere anleggsbrua og viser hva man kan slutte fra synlige spor.
- Kildegrunnlaget er Oslo byleksikons oppslag om [Oset slusebru](https://oslobyleksikon.no/side/Oset_slusebru), [Oset anleggsbru](https://oslobyleksikon.no/side/Oset_anleggsbru) og [Akerselva](https://oslobyleksikon.no/side/Akerselva).
- Fagverk-indeks, release og Place-open er synkronisert. Lokal Fagverk-audit, Place-open-paritet, release-manifest, Knowledge-kontroll og Osets migreringstest bestod. Nettlesertesten krever synlig artikkel, tre fungerende emnelenker og observerbare spor i tillegg til kort og quiz. Hele bolken har fortsatt åpne V1-porter.

C50 for Det Norske Teatret bestod på mobil og desktop etter at testen ble lagt om til PlaceCards synlige galleriknapp, med samme krav til begge objektenes bilde, kildelenke og kreditering. C51 verifiserer den publiserte versjonen etter vellykket Pages-kjøring på main og sammenligner med commit-en som ble publisert.

## Frysja 33 – kuratert Fagverk og quizstatus

- Fagverk på standardnivå forklarer tømmeret i Brekkedammen, kraftstasjonens rolle, jernbanefrakten og bygningens senere bruk. Artikkelen fører kommunens 1965 og historielagets 1962 som ulike kildeopplysninger om nedleggelsen. NVE og lokal adressehistorie daterer kraftstasjonen til 1892.
- Fagverk-audit, deterministisk release og Place-open-paritet bestod. Chromium på 390 og 1440 pikslers bredde viste den kuraterte artikkelen, tre faglige lenker med fungerende mål og feltsporene.
- Den aktive quizen for hele Frysja industriområde inneholder spørsmål om Brekke Bruk. Manifestet har fortsatt null sett på kraftstasjonens egen ID. Egen fullquiz, QuizCard, Knowledge-kobling og stående bilde gjenstår før V1.
