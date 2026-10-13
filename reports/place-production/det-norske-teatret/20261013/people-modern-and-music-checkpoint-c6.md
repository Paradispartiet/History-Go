# Det Norske Teatret – moderne sceneprofiler, teatermusikk og premieredatokontroll (C6)

Kontrollert **13. oktober 2026**. Fem *ytterligere* eksisterende People-profiler har fått direkte produksjonsankre med konkrete datoer og roller: Morten Svartveit, Mimmi Tamba, Marie Blokhus, Oddgeir Thune og Harald Sæverud. En sjette, tidligere revidert profil (Hans Jacob Nilsen), er korrigert etter et påvist kildeavvik. Ingen People-ID-er eller tilknytninger er opprettet.

## Kildesikret historisk materiale

| People-ID | Kjernefakta | Hovedkilder |
|---|---|---|
| `morten_svartveit` | Georg i `Tolvskillingsoperaen` 2008; `Bikubesong` 2013; Anthony i `Sweeney Todd` 2015, Hovudscenen; Kafka Tamura i `Kafka på stranda` 2018, Clov i `Sluttspel` 2023 | [FOREST – Morten Svartveit](https://forest.detnorsketeatret.no/person/morten-svartveit), [Sweeney Todd](https://forest.detnorsketeatret.no/produksjon/sweeney-todd-20150320) |
| `mimmi_tamba` | Nabulungi (alternering) i `The Book of Mormon` 2017; Girl i `Lazarus` 2019; fru Peachum 2020; Oskepott i `Into the Woods` 2022; tekst, sangtekst, opphav og utøver i `Semper Eadem` 2023 | [FOREST – Mimmi Tamba](https://forest.detnorsketeatret.no/person/mimmi-tamba) |
| `marie_blokhus` | Hamlet 2014; Allis i `Fugletribunalet` 2015 (Scene 2), Heddapris; medregi og eneste skuespiller i `Werther` 2020 (Scene 3); Elektra i `Oresteia` 2023; regi for `Nære relasjonar` 2024 | [FOREST – Marie Blokhus](https://forest.detnorsketeatret.no/person/marie-blokhus), [Fugletribunalet](https://forest.detnorsketeatret.no/produksjon/fugletribunalet-2015), [Werther](https://forest.detnorsketeatret.no/produksjon/werther-2020) |
| `oddgeir_thune` | Fra `Antichrist` 2013; alternerende roller i `Sweeney Todd` 2015; Rolf Li i `Kimen` (Scene 2) 2018; Orestes i `Oresteia` 2023; Billy og instrumentkreditering i `Once` 2025 | [FOREST – Oddgeir Thune](https://forest.detnorsketeatret.no/person/oddgeir-thune), [Kimen](https://forest.detnorsketeatret.no/produksjon/kimen-2018), [Once](https://forest.detnorsketeatret.no/produksjon/once-20250201) |
| `harald_saeverud` | Skrev original scenemusikk og dirigerte et 24-mannsorkester for teatrets nynorske `Peer Gynt` i **1948**. Historisk spillested: Hovudscenen i **Stortingsgata 16**, ikke huset i Kristian IVs gate fra 1985 | [FOREST – Peer Gynt 1948](https://arkiv.detnorsketeatret.no/produksjon/peer-gynt-19480302), [Sceneweb – Peer Gynt](https://sceneweb.no/nb/production/38041/Peer_Gynt), [SNL – Peer Gynt-musikk](https://snl.no/Peer_Gynt_-_musikk) |

## Uavklart dato – viktig kildekorrigering

Det er et reelt motstridende datum i kildene til `Peer Gynt` fra 1948:

- [Det Norske Teatrets FOREST-produksjonsregister](https://arkiv.detnorsketeatret.no/produksjon/peer-gynt-19480302) har oppføringen **02.03.1948** (arkiv M332 F245 P198 PL14+53); spillested Stortingsgata 16, 125 forestillinger.
- [Sceneweb](https://sceneweb.no/nb/production/38041/Peer_Gynt) angir premiere **2. mars 1948** og samme sted.
- [Store norske leksikon](https://snl.no/Peer_Gynt_-_musikk) angir uroppføring **2. mai 1948**.

**Behandling:** Verken Sæveruds eller Hans Jacob Nilsens nye `popupDesc` slår fast en uavklart premieredato; begge angir **1948** og lenker de motstridende kildene. Tidligere C3-reportering som presenterte 2. mai som entydig er korrigert med et kildeerratum. Ingen dedikert `Peer Gynt`-forestillingsmedlem skal publiseres med eksakt premieredato før kildespriket er avklart, for eksempel mot originalt program eller samtidige anmeldelser. Bygningens historiske tidslinje er fortsatt ubestridt: dagens hus åpnet i 1985.

## Proveniens og integritet

Berørt: fem tidligere ukontrollerte canonical People, én tidligere gjennomgått People (datokorreksjon), nødvendige People-runtime-shards, `data/runtime/place-open/det_norske_teatret.json`, ett C3-erratum og dette checkpointet. Ingen korte `desc`-tekster, `year`, `category`, `placeId`, `places`, People-identiteter eller Civication-kode er endret. Feltet `year` må ikke tolkes som dokumentert oppstart for alle personer (eksempel: Svartveit har en arkivoppføring fra 2008 selv om eksisterende metadata har 2013).

Alle foto i FOREST/SNL behandles som potensielt rettighetsbeskyttede. Ingen portrett-, Forestillinger- eller QuizCard-asset er lagt inn i denne PR-en. Foto og forestillingsmedlemmer krever separat identitetskontroll, kreditering, rettighetsgrunnlag og UI-integrasjon.

**Fremdrift:** C1–C5 dekket **37** distinkte People. C6 legger til **fem** distinkte personer, totalt **42 av 87**; **45** People-profiler gjenstår. Hans Jacob Nilsen teller allerede i C3 og telles ikke en gang til. Generert runtime skal beholde **1 434 unike People**, og stedets Place-open **87** personkoblinger. Stedet er fremdeles **BLOCKED**: portretter, Forestillinger, Objects, Brands, separat frontImage, kildebasert quiz, dedikert QuizCard og visuell end-to-end-QA er uferdig.
