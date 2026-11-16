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

1. `frysjadammen`: ny `desc`/`popupDesc` og egen historiefaglig Fagverk-tekst om slusemekanismen, regulering og forskjellen mot Oset anleggsbru.
2. `frysja_33_brekke_kraftstasjon`: fortelling om kraftstasjonen fra 1892, Brekke Bruks nedleggelse og gjenbruk som Frysja 33; eget næringslivsfaglig Fagverk-utkast.
3. `seilduksfabrikken_nydalen`: tydelig riktig sted (Øvre spinneri, **ikke** Christiania Seildugsfabrik), fabrikkanlegget og kulverten; eget historiefaglig Fagverk-utkast.
4. `stilla_nydalen`: stedstekst uten teknisk utviklerspråk, eksplisitt skille fra det historiske Stilla; eget naturfaglig Fagverk-utkast.
5. Fire indeksoppføringer i `data/fagverk/fagverk_registry.json`, alle med status `in_production`. Det hevdes **ikke** at de er `curated` eller ferdig V1.

Kildefakta for de fire tekstene er kontrollert mot eksisterende `externalLinks` og relevante sider fra Oslo byleksikon, SNL / NBL og Oslo kommune. `verified_at` i de nye Fagverk-blokkene er 2026-11-16, men det erstatter **ikke** krav om fullstendig kilde-/claim-audit.

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
**Gjenstår:** 16 stedsspesifikke Fagverk, bilder på 18 steder samt ett manglende stående Deichman-bilde, komplett quiz-/QuizCard-/Knowledge-review og kvalitetssikring for hele bolken.
**Bilde-/rettighetskø:** minst 18 steder uten `image` + én manglende `frontImage` i main, og eventuelle manglende `cardImage` etter audit.
**Merge:** ikke klar; ingen påstand om at CI eller browser-QA er bestått.

Avhengigheter og risiko: `frysjadammen` er Oset slusebru, ikke Brekkedammen. `stilla_nydalen` er elvepunktet nedenfor Nydalsdammen, ikke de historiske Stilla-kulpene. `seilduksfabrikken_nydalen` er Øvre spinneri, ikke Christiania Seildugsfabrik. `frysja_33_brekke_kraftstasjon` er enkeltbygningen, ikke hele Frysja industriområde.

## Kildeavvik oppdaget under kontrollen 16. november

**Frysja 33 må kildeavklares før v1:** Oslo kommunes *Turguide Akerselva* (s. 6–7) daterer den bevarte kraftstasjonen til **1892** og siste sagbruksdrift til **1965**. Frysja 33s egen hjemmeside omtaler i stedet kraftstasjonen som bygd i **1850** og viser en annen sluttdatering for sagbruksdriften. Kommuneartikkelen bekrefter at bygget er eneste bevarte del av Brekke Bruk og senere ble aktivitetshus. Behold foreløpig kommunens historiske kilde som grunnlag for draft-teksten, men **ikke** godkjenn dateringsclaim eller fullquiz uten dokumentert avklaring. Kilder: https://www.oslo.kommune.no/get-file/797618/378151321f5e4a09d64bac2406e9a8fd9c861c3c3473fd933860da92c2cd5082/ ; https://www.frysja33.no/ .

**Besøksadresse/anker:** Kommunens Frysja 33-side oppgir Kjelsåsveien 145, mens den eksisterende Place-filen dokumenterer sitt koordinatvalg med adressehistorisk grunnlag for Kjelsåsveien 151C. Ingen geometri er endret. Kontroller eiendom/tilkomst mot primærkilder før denne Place kan ferdigmeldes. Kilde: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/ .

**Oset:** Både slusebrua og den nyere anleggsbrua er nå ført med kildeetiketter i stedets `externalLinks`, ikke bare som skjulte Fagverk-URL-er.

## Første dokumenterte bildekandidat – ikke publisert

- **Brekke kraftstasjon / Frysja 33:** Wikimedia Commons-fil [`Brekke kraftstasjon på Frysja.jpg`](https://commons.wikimedia.org/wiki/File:Brekke_kraftstasjon_p%C3%A5_Frysja.jpg) viser riktig bygning. Fotograf **Helge Høifødt**, 6. juli 2018, eget arbeid, **CC BY-SA 4.0**. Original 6000 × 4000 px. Kan vurderes for identitetsbevarende hero-/stående- og kortutsnitt med navngitt fotograf, kilde, lisens, bearbeidingsopplysninger og bildedokumentasjon. **Ingen bildefil er hentet, konvertert, lagt til i source eller verifisert i app.**
- **Øvre spinneri:** Wikimedia Commons har eldre fotografier i kategorien *Historical images of Nydalens Compagnie*, inkludert en fil betegnet «Øvre Spinderi og Væveriet». Identitet og lisens på eksakt fil må fortsatt undersøkes før bruk. Historiske bilder merkes med faktisk opptaksperiode, aldri som nåfoto.
- **Oset slusebru:** Oslo byleksikon har et stedsriktig bilde, men fotokreditering alene gir ikke gjenbruksrett. **Ikke bruk før lisens eller egen kilde er klarert.**
- **Elvepartiet nedenfor Nydalsdammen:** ingen godkjent stedsspesifikk bildefil identifisert i denne kontrollen. Unngå foto fra de historiske Stilla-kulpene lenger nord.

**Bildestatus for delbolken er fortsatt 0 publiserte nye bilder.** Etter motiv- og kildevalg må tre faktiske utsnitt lages og testes.
