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
| `myralokka` | Myraløkka | `places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json` | ja | ja | mangler |
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
**Nye Fagverk-utkast:** 4.
**Nye verifiserte v1:** 0.
**Nye verifiserte vFerdig:** 0.
**Gjenstår:** 16 stedsspesifikke Fagverk, bilder på 18 steder samt ett manglende stående Deichman-bilde, fullt kildebasert 4.2-godkjente stedsbeskrivelser, runtime-fullquiz/QuizCard/Knowledge og kvalitetssikring for hele bolken. **40 kandidatspørsmål er skrevet, men ennå ikke integrert.**
**Bilde-/rettighetskø:** minst 18 steder uten `image` + én manglende `frontImage` i main, og eventuelle manglende `cardImage` etter audit.
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

**Bildestatus for delbolken er fortsatt 0 publiserte nye bilder.** Etter motiv- og kildevalg må tre faktiske utsnitt lages og testes.


## CI-nullmåling ved siste kontroll (før de nyeste korrigeringene)

Fra commit `86a98d043a5e47c6a325925461b1334f3666a33e` ble 11 GitHub Actions-jobber kjørt: 5 PASS, 6 FAIL. Feilene var (1) fire manglende bilder i `audit-place-images`, (2) utdatert `place-open`-payload, (3) manglende Historie-produksjonsrapporter ved endret `desc/popupDesc`, (4) manglende v4.2-claimpakker ved endret `desc/popupDesc`, (5) utdatert Fagverk release-manifest og (6) eldre naturkartreferanse `trikk_17_18`. Det siste er et annet scope.

Etter at **de aktive historietekstene ble tilbakestilt til main**, skal feil (3) og (4) kontrolleres på nytt på siste PR-head; de er **ikke dokumentert grønne** før ferske jobber er fullført. Bilde-, Place-open- og Fagverk-release-feilene er fortsatt åpne. Ingen påstander om grønn CI eller mergeklarhet.

