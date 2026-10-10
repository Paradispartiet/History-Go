# VG-huset — PlaceCard-samlinger: kilde- og kandidatbeslutning

Dato: 2026-10-10 · Canonical place: `vg_huset` · PR: #6187 · Status: **under produksjon, ingen samlings-PASS**.

## Kilde- og kontraktgrense

Canonical kilde: `data/places/media/oslo/places_oslo_media/vg_huset.json`; produksjonspåstander: `data/places/production/vg_huset.json`; People: `data/people/media/oslo/people_media_oslo.json`.

Bindende: `data/places/README_place_rounds.md`, `docs/PLACE_OBJECTS_CANONICAL.md`, `docs/people-of-places-method.md`, `data/brands/brand_rules_v1_1.json`. Media vurderer **People, Objects, Brands, Productions (Utgivelser og sendinger)**. Medlemsbilder må være lokale, lastbare, autentiske og lisens-/kildebelagte. En URL eller et fint place-foto alene er ikke samlings-PASS. Bare PASS-samlinger kan føres i `place_card_profile.collection_ids`.

## 1. People — fem ferdige profiler; samlingen blokkert av feil historisk anker

Følgende fem canonical personer har `ready_people_v1`, kildebelagte profiler og lokale, identitetsgodkjente JPG-portretter. De har dokumentert institusjons-/arbeidsrelasjon til VG/Aftenposten i **det nåværende huset etter 1994**:

| Person-ID | Rolle og relevant periode | Særskilt forbehold |
| --- | --- | --- |
| `bernt_olufsen` | VG sjefredaktør 1994–2011 | VG-huset oppført 1994; ikke bland med eldre VG-redaksjon. |
| `torry_pedersen` | VG ansvarlig redaktør 2011–2017 | Relevant VG-periode i Akersgata 55. |
| `gard_steiro` | VG ansvarlig redaktør fra 2017 | VGs offisielle besøksadresse og ledelse dokumentert. |
| `hanne_skartveit` | VG politisk redaktør 2009–2023 | Rolle etter 2023 må ikke omtales som fortsatt politisk redaktør. |
| `trine_eilertsen` | Aftenposten politisk redaktør 2014–2020, deretter sjefredaktør | Aftenposten flyttet inn 2014; ikke VG-ansatt. |

**Kåre Valebrokk er IKKE godkjent medlem av dette bygget.** Legacy-oppføringen `kare_valebrokk` har fortsatt `placeId: vg_huset`, `places:["vg_huset"]`, `year:1980` og en misvisende `popupDesc`. VGs samtidige minneord viser ham ved nyhetsdesken i *det gamle* VG-huset. VG dokumenterer VG-perioden 1979–1985; nybygget i nr. 55 stod først ferdig i **1994**. Kildene som er kontrollert, belegger **ikke** et konkret nytt primæranker for arbeidsstedet hans i 1980. VGs *første* lokaler var i Akersgata 34 i **1945**, men dette er ikke bevis for at han satt i nr. 34 i 1980. Repoets aktive `data/places/manifest.json` har heller ikke et eksplisitt historisk VG-redaksjonssted som kan gjenbrukes her.

**Beslutning:** Ikke flytt til Akersgata 51, dagens nr. 55 eller en oppdiktet ID; ikke fjern personen med ugyldig/tomt `places`-array. Rett canonical primæranker gjennom separat stedsevidens og synkroniser deretter People-runtime, People-of-Places og Civication. Frem til da er People **BLOCKED for samlet closeout**, selv om fem individuelle profiler er `ready_people_v1`. Kontroller at faktisk PlaceCard-/popupvisning ikke presenterer Valebrokk som en godkjent ansatt i 1994-bygget.

Kilder:
- https://www.vg.no/nyheter/i/6LppL/en-journalistisk-entreprenoer — Valebrokk på desken i «det gamle VG-huset» med Olufsen.
- https://www.vg.no/nyheter/i/E7AB2/kaare-valebrokk-er-doed — biografi og VG-perioden.
- https://oslobyleksikon.no/side/Verdens_Gang_%28n%C3%A5v%C3%A6rende%29 — Akersgata 34 som første lokaler (1945) og Akersgata 55 som nybygg (1994).
- https://www.vg.no/informasjon/kontakt-oss — dagens besøksadresse og VG-ledelse.
- https://www.aftenposten.no/norge/i/BJdpw/tanta-flytter-hjem — Aftenpostens innflytting 2014.

## 2. Objects — kildebelagt signaturobjekt, foto funnet, ikke importert

**Kandidat:** `vg_avismonter_22_juli_2011` — VGs fysiske utstillingsmonter utenfor huset, med den trykte utgaven 22. juli 2011 bak glasset. Dette er en konkret gjenstand, ikke en nyhetsutgivelse modellert som abstrakt verk. Monteren sto ved VG-huset i Akersgata 55 da trykkbølgen knuste glasset; i 2013 ble den flyttet over gaten, og den skadde monteren ble bevart. Datoen 2011 er hendelses-/eksemplardato, ikke dokumentert fabrikasjonsår for monterens konstruksjon.

- Identitet, funksjon og sted: https://oslokunstforening.no/en/exhibitions/yesterdays-news
- Flytting og bevaring: https://www.vg.no/nyheter/i/K0wb7/vgs-avismonter-flyttes-og-bevares og https://koro.no/avissidene-fra-22-juli-2011-er-tilbake-i-vg-monteren/
- **Lisensiert originalfoto:** https://commons.wikimedia.org/wiki/File:Shattered_newspaper_monter_outside_VG_in_Oslo.jpg
- Fotograf: **Ulflarsen**; tatt **14.10.2011**; **CC BY-SA 3.0**; original **3648 × 2736**. Filen viser den virkelige monteren ved det daværende stedet. Ikke et generisk redaksjonsfoto.

Objects-kontrakten foretrekker to tydelige hovedfunksjonsobjekter, men tillater et kildebelagt **signaturobjekt** med begrunnet unntak. Den bevarte VG-monteren er en konkret mulig slik unntakskandidat fordi den både formidlet papirutgaven og fikk en særskilt stedshistorisk funksjon. Avgjørelsen om unntak og fotoets egnethet må tas ved materiell- og browser-QA etter import. Bildet er **ikke** lastet ned/committet på dette grunnlaget, og `objects` er derfor **BLOCKED**, ikke PASS.

**Andre kandidat undersøkt, men ikke brukt til å fylle Objects:** Blå plakett for Oslogjengens aksjon på tomten i 1944, kilde og foto https://commons.wikimedia.org/wiki/File:Akersgata_55_Oslogjengen.jpg (Jan-Tore Egge, 2019, CC BY-SA 4.0). Reelt minnespor, men sekundært til medias produksjonsfunksjon; hører primært hjemme i historisk stedsstoff / eventuelt separat dokumentert objektkontekst, ikke som en kvotefyller i medierunden.

## 3. Brands — VG identitet verifisert, original ordmerke funnet

**Første kandidat:** eksisterende `vg` i `data/brands/brands_master.json`, i dag `state: borderline` og uten logo / `place_ids`. Autonom avis- og medieidentitet, offisiell besøksadresse Akersgata 55 og faktisk logo på redaksjonsbygget er dokumentert. Ingen ny eller duplisert Brand-ID skal opprettes.

**Autentisk logo:** https://commons.wikimedia.org/wiki/File:VG_logo.svg — VG-logo med opprinnelsesangivelse VG, **PD-textlogo** (enkel typografi/geometri) og uttrykkelig merket som **varemerke**. Fil fra 2015; representerer en identitet, **ikke** en påstått original logo fra 1945. Refererende identifikasjon gir ikke inntrykk av tilslutning. Kopier eksakt originalfil ved import, ikke rekonstruer eller tegn logoen på nytt.

Andre plausible medienheter: Aftenposten (fysisk samlokalisering **fra 2014**, med eget eksisterende Brand og sin eldre Akersgata 51-historie), Schibsted (rolle og epoke må avgrenses), VG Nett (kan vurderes selvstendig bare hvis Brand-kontrakten og klar originalidentitet støtter det). Ingen kandidat skal koples bare fordi den deler konsern.

**Beslutning:** **BLOCKED** til korrekt lokal original-logo, attribusjon/varemerkekontekst, direkte place-mapping og faktisk Brand-preview er dokumentert. Ikke aktiver `brands_by_place.vg_huset` eller oppgrader masterpost til `catalog` bare på grunnlag av URL-funn.

## 4. Productions — publiseringene identifisert, medlemsbilder mangler

Faglig korrekte verk-/utgivelsesfamilier som må vurderes:
- **VGs papiravis i perioden med Akersgata 55 fra 1994** (fysisk enkeltavis kan være Object; avistittelen/utgivelsen er Production).
- **VG Nett, lansert 10. oktober 1995** (dokumenter original nettpublisering og dato, ikke bruk dagens nettstedsskjermbilde som skjult erstatning for 1995).
- Senere **VGTV/VG Live** bare når kilde, produksjonsidentitet og bilde viser riktig utgivelse/tjeneste, ikke ren Brand-logo.

Kilder: https://www.vg.no/nyheter/i/wE6ryo/vg-nett-fyller-10-aar-10-oktober-slik-startet-vg-nett-eventyret ; https://www.vg.no/informasjon/brukervilkar ; https://www.nb.no/tilgang/rettigheter/ .

VG-artikkelen har illustrasjon av nettets første forside, men bildet er **ikke dokumentert med fri gjenbrukslisens**. Nasjonalbibliotekets digitale tilgang til et aviseksemplar er heller ikke det samme som rett til gjenbruk i appen. **BLOCKED** til hvert reelt medlem har egen inspectable kilde og lisens-/bruksklar lokal visuell dokumentasjon. Ingen oppdiktede avisforsider eller genererte skjermbilder.

## 5. Neste operative porter

1. Skaff kildebelagt gyldig historisk People-anker for Valebrokk. Hvis det ikke finnes, må modellert plasskobling håndteres etter canonical People-metode i egen godkjent datamigrering, ikke skjules i UI.
2. Importer originalfoto av VG-monteren og **original** VG-logo gjennom eksisterende sikker asset-pipeline, med eksakte lokale baner, originalkilde, rettigheter og bilde-/filkontroll.
3. Produser Objects/Brands som canonical medlemmer **først etter** faktisk import og lokal preview. Revider signaturobjekt-unntaket opp mot Objects-kontrakten.
4. Finn dokumentert gjenbrukslisens og representative medlemsbilder for papiravis-/nettavis-Productions.
5. Materialiser bare samlinger med PASS i `place_card_profile.collection_ids`; kjør generatorer og målrettet pop-up/browser-test, QuizCard-flip og mobil/iPad, og til slutt seksdelt kvalitetsgate / merge.

Dette notatet godkjenner ikke en ferdig PlaceCard. Det skiller konkrete, verifiserte **kildespor** fra publiserte medlemmer og lar fungerende canonical data være urørt inntil den nødvendige materialiseringen er gjennomført.
