# Birkelunden – fase 4 kategori, Badges, emner, Fagverk og Nature-eierskap V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-3 merge `6983331fd2be89dd6ae9aad51f660503809a305e`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Source pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`, `docs/FAGVERK_NAVIGATION.md`, `data/categories/category_contract.json`, `README/nature_mapping_workflow.md`
- Status: **ALLEREDE FERDIG FOR KATEGORI/EMNER/FAGVERK – NATURE-EIERSKAP LÅST, NATURINNHOLD IKKE SLUTTGODKJENT**

## 1. Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: category=by; to canonicale em_by_*; By-faget materialisert; begge emnene eies av chapter_ready byliv-offentlige-rom; Birkelunden er eksplisitt case i kapittelet
KONKRET REGRESJONSEVIDENS I KATEGORI/EMNER/FAGVERK: INGEN
UNDERBADGES: VURDERT – INGEN NY ID NØDVENDIG
NATURE-EIERSKAP: PLACE-LAG + SEPARAT NATURE-MAPPING, IKKE PRIMÆRKATEGORI
NATURINNHOLD SOM BIOLOGISK SLUTTGODKJENT: NEI
CANONICAL FAGDATAENDRING: NEI
```

Fase 4 skiller mellom to spørsmål som ikke skal blandes:

1. **Er Birkelundens primære fagidentitet, emner og Fagverk-integrasjon riktig?** Ja.
2. **Er alt eksisterende naturinnhold ferdig kildevalidert?** Nei; dette beholdes som separat senere Nature-QA og kan ikke brukes som argument for å endre primærkategori eller ferdigmelde naturflaten.

## 2. Primærkategori – `by`

**Beslutning: BEHOLD.**

`data/categories/category_contract.json` har `by` som canonical runtime- og fag-ID, med visningsnavn `By & arkitektur`. Kategoridesignet prioriterer blant annet:

- sted og struktur;
- bruk og bevegelse;
- historiske lag;
- planlegging og konflikt.

Birkelundens verifiserte source pack passer direkte til denne primæridentiteten:

- parkrommet ble anlagt som del av Grünerløkkas byutvikling;
- Thorvald Meyer er dokumentert planlegger/giver;
- parkens fysiske form og endringer kan følges historisk;
- bruk som møte-, oppholds-, aktivitets- og gjennomgangsrom er et eksplisitt By-faglig spor;
- det større kulturmiljøet rundt parken er urban struktur/vernekontekst, men ikke parkens egen geometri.

At Birkelunden er grønn og har flora/fauna-koblinger gjør ikke `natur` til riktig primærkategori. Place-objektets viktigste History GO-identitet er et **urbant offentlig parkrom**, og tverrfaglig naturinnhold kan eies av Nature-systemet uten å duplisere eller omkategorisere Place.

## 3. Underbadges

Canonical Place har ingen `underbadge_ids`.

**Beslutning: BEHOLD TOMT I FASE 4.**

Dette er en vurdert beslutning, ikke et glemt felt.

`data/badges/by.json` har canonicale underbadge-kandidater som arkitekturstiler, `byplanlegging`, `infrastruktur`, `monumenter_og_landemerker` og `bolig_og_bomiljo`. Source packen gjør enkelte av disse tematisk mulige, men ingen er nødvendig for å uttrykke Birkelundens primære læringsidentitet bedre enn de to eksisterende emnene:

- `byplanlegging` kan beskrive deler av Thorvald Meyers rolle, men ville gjøre en historisk planleggingsrelasjon til en bred permanent merkeidentitet;
- `monumenter_og_landemerker` gjelder enkelte Object-kandidater, men Objects skal senere eies av Object-rundingen og skal ikke gjøre hele parken til monument-place;
- arkitekturstil-underbadges passer ikke parkens canonical identitet;
- `bolig_og_bomiljo` gjelder det større kulturmiljøet/kvartalene mer enn selve park-place.

Checklistkravet er at underbadges **vurderes og eventuelle ID-er finnes**, ikke at hvert sted må ha en underbadge. Det legges derfor ikke til metadata bare for å fylle felt.

## 4. Emne-audit

Canonical Place har:

- `em_by_parker_som_sosial_infrastruktur`;
- `em_by_opphold_vs_gjennomgang`.

Begge beholdes.

### `em_by_parker_som_sosial_infrastruktur` – BEHOLD

Dette emnet er direkte stedsspesifikt. Birkelunden er dokumentert som offentlig park med lang sosial brukshistorie, fra møte-/organiseringsspor til dagens parkfunksjon. By-fagets emnedefinisjon spør eksplisitt hvordan parker fungerer som sosial infrastruktur i hverdagen, hvilke brukstyper de samler og hvordan ro, aktivitet, gjennomgang og møteplass varierer.

Det er derfor en presis faglig ramme for Birkelunden, ikke en generisk park-tag.

### `em_by_opphold_vs_gjennomgang` – BEHOLD

Birkelunden er et avgrenset offentlig parkrom i et tett bynett, med både interne oppholdsflater og forbindelser mot omkringliggende gater/plasser. Emnet er derfor egnet for den observerbare forskjellen mellom å passere gjennom parken og faktisk bli værende der.

Dette er også eksplisitt materialisert i Fagverkets Birkelunden-oppgave: brukeren skal undersøke Birkelunden på to tidspunkter og registrere hvilke soner som brukes til opphold, gjennomgang eller begge deler.

### Ingen nye emner

Fase 2 gjør andre By-emner plausible – eksempelvis historiske lag, midlertidige arrangementer, planmakt eller parkaktivitet. De legges ikke automatisk til.

Begrunnelse:

- begge nåværende emner ligger i det samme kjernekapittelet som allerede behandler nettopp Birkelundens viktigste By-opplevelse;
- Fagverk-kontrakten har ingen emnekvote;
- et stort emnesett vil gjøre place-siden mindre presis;
- senere nye subsystemdata kan bare utløse en ny emnekobling dersom de dokumenterer et selvstendig læringsbehov som dagens to emner ikke dekker.

Fullness skal ligge i rikt stedsspesifikt innhold, ikke i antall metadata-ID-er.

## 5. Fagverk-kapittel og place-case

`data/fagverk/fagverk_registry.json` mapper begge Birkelunden-emnene til:

```text
chapter_id: byliv-offentlige-rom
title: Offentlige rom: opphold, bevegelse og møteplasser
editorialStatus: chapter_ready
```

Kapittelet har som læringsmål blant annet å:

- skille offentlig rom som fysisk areal fra faktisk brukt offentlighet;
- skille fotgjengergjennomgang fra opphold;
- analysere parker som rom for ro, aktivitet og sosial kontakt uten å overdrive effektpåstander;
- bruke feltobservasjon og gåanalyse;
- skille planintensjon, fysisk tiltak og dokumentert bruk.

I `03-anvendelse.json` er **Birkelunden eksplisitt materialisert som feltcase**:

- oppgave: undersøk Birkelunden på to forskjellige tidspunkter;
- se hvilke former for aktivitet og ro som observeres;
- identifiser soner for opphold, gjennomgang eller begge deler;
- skill tidsvariasjon som kan observeres fra påstander man fortsatt ikke kan konkludere om.

`relatedPlaces` registrerer dessuten `birkelunden` med rollen:

> Feltcase for park, opphold, aktivitet, ro og tidsvariasjon.

Dette er sterkere integrasjonsbevis enn bare at to emne-ID-er finnes i Place JSON.

## 6. Fagverk-routing

`data/fagverk/fagverk_portal.json` registrerer:

```text
id: by
badgePage: data/fag/by/merke_by.html
subjectPage: fagverk.html?subject=by
subjectStatus: materialized
```

`docs/FAGVERK_NAVIGATION.md` definerer canonical stedsside som:

```text
fagverk-sted.html?place=<place_id>
```

Birkelundens canonical Fagverk-sted er dermed:

```text
fagverk-sted.html?place=birkelunden
```

Stedssiden kan koble tilbake til By-merket, By-faget, relevante emner og kartet uten å lage en egen Birkelunden-fagkopi.

## 7. Nature-eierskap – skill place-profil fra artsmapping

Birkelunden har allerede to naturrelaterte systemspor:

1. inline `nature_profile` i canonical Place;
2. aktiv place→flora/fauna-kobling i `data/natur/nature_place_map.json`.

Disse gjør **ikke** Birkelunden til primærkategori `natur`.

`README/nature_mapping_workflow.md` er eksplisitt:

- canonical Place-ID/koordinater eies av Place-systemet;
- flora/fauna eies av Nature-data;
- place-level naturkoblinger eies av Nature-mappingfilene og `js/nature_place_map_bridge.js`;
- quiz-unlocks eies separat;
- kandidatdata er research og blir ikke automatisk godkjent mapping.

Fase-4-eierskapet låses derfor slik:

```text
PRIMARY PLACE CATEGORY: by
PLACE PHYSICAL/LANDSCAPE PROFILE: nature_profile kan eksistere som tverrfaglig stedslag
SPECIES OWNERSHIP: data/natur/* + nature_place_map_bridge
NATURE ROUND/CATEGORY PROMOTION: NEI
BIOLOGICAL COMPLETION CLAIM: NEI
```

## 8. Nature-mapping – eksisterer, men er ikke sluttbevis

`data/natur/nature_place_map.json` har allerede Birkelunden-entry med:

### Flora

- `emne_ved_hengebjoerk`;
- `emne_ved_dunbjoerk`;
- `emne_ved_spisslonn`;
- `emne_ved_storbladlind`.

### Fauna

- `emne_fauna_honningbie`;
- `emne_fauna_bille_marihoner`;
- `emne_fauna_blomsterflue_vanlig`.

`sourceQuizIds: ["birkelunden_quiz_1"]` kan spores til `data/natur/nature_unlock_map.json`, der den samme flora/fauna-listen finnes. Dette er en Nature-unlock/provenienskjede og må **ikke** forveksles med at Birkelunden har en aktiv Place-quiz i `data/quiz/manifest.json`; fase 0 har allerede dokumentert at aktiv Birkelunden-quiz mangler.

Viktigere: mappingfilens globale metadata har `verification_status: internal_mapping_plus_artskart_candidates` og lister fortsatt ekstern validering mot blant annet Artskart, Naturbase og Oslo Naturkart. Birkelunden-entryen mangler dessuten den eksplisitte `artskartCandidateSource`-blokken som flere andre parkentries har.

Beslutning:

- behold eksisterende mapping urørt i fase 4;
- ikke bruk dens eksistens som biologisk sluttgodkjenning;
- ikke generer nye arter eller skjulte UI-filtre;
- senere Nature-QA må kontrollere habitat, observasjonsgrunnlag, aktualitet, koordinatusikkerhet og pedagogisk verdi etter Nature-kontrakten;
- `nature_profile` må senere få kilde-/claim-audit før place kan sluttgodkjennes.

Dette er en **eierskapsavklaring**, ikke en godkjenning av alle naturpåstander.

## 9. Sammenligning mot ferdig By-park gir ingen grunn til metadatafyll

St. Hanshaugen park er også canonical `category: by` og bruker de samme to emnene:

- `em_by_parker_som_sosial_infrastruktur`;
- `em_by_opphold_vs_gjennomgang`.

Den har heller ikke behov for å gjøre grønt parkinnhold til primærkategori `natur` for at Nature-/parkdata skal kunne eksistere.

Dette brukes bare som repo-konsistenskontroll. Birkelunden godkjennes på eget kilde- og faggrunnlag, ikke ved å kopiere St. Hanshaugen.

## 10. Content Factory-effekt

Fase 4 krevde ingen ny modellproduksjon og ingen ny fagtekst fordi:

- fase-2 source pack var nok til å vurdere place-identiteten;
- de to eksisterende emnene var allerede canonicale;
- Fagverk-registeret og kapittelet var materialisert;
- Birkelunden var allerede eksplisitt feltcase i det relevante kapittelet;
- Nature-systemets eksisterende eiergrenser kunne leses deterministisk fra canonical workflow/mapping.

Dette er korrekt effektivisering: vi unngår å regenerere allerede godt fagarbeid, samtidig som vi **ikke** later som det svakere Nature-proveniensen er ferdig.

## 11. Fasebeslutning

```text
SUBSYSTEM: category / underbadges / emne_ids / Fagverk / Nature ownership
CATEGORY by: BEHOLD
UNDERBADGE_IDS: INGEN – VURDERT, INGEN DOKUMENTERT MANGEL
EMNE em_by_parker_som_sosial_infrastruktur: BEHOLD
EMNE em_by_opphold_vs_gjennomgang: BEHOLD
BY FAGVERK: MATERIALIZED
BIRKELUNDEN PLACE CASE IN BY CHAPTER: JA
NYE EMNER: INGEN
NYE UNDERBADGES: INGEN
PRIMARY CATEGORY → natur: NEI
NATURE_PROFILE OWNERSHIP: PLACE-LAG, BEHOLD FOR SENERE KILDE-QA
FLORA/FAUNA OWNERSHIP: NATURE MAPPING/BRIDGE
NATURE BIOLOGICAL COMPLETION: IKKE GODKJENT I DENNE FASEN
CANONICAL DATA MUTATION: NEI
KATEGORI/EMNE/FAGVERK-KLASSIFISERING: ALLEREDE FERDIG
NATURE-EIERSKAPSKLASSIFISERING: AVKLART
```

## 12. Bevisst ikke endret

- canonical Birkelunden Place;
- category/emne IDs;
- underbadges;
- By Fagverk-data;
- `nature_profile`;
- Nature mapping/unlocks;
- descriptions;
- Quiz;
- People/Objects/Brands;
- Stories/Lesespor;
- runtime.

## 13. Neste fase

Etter grønn CI/merge går Birkelunden videre til **fase 5 – `desc` + `popupDesc` v4.2**.

Fase 5 blir første Pilot-02-fase som kan endre canonical brukerrettet tekst. Den skal:

- bygge description production package;
- kartlegge hver setning til verified phase-2 claims;
- bevare richness fra dagens tekst;
- rette park-vs-kulturmiljø-scope eksplisitt;
- bruke sourced 1860-årene/1882/1916–20/1926/1953/1984–89/2006-lag der de er relevante;
- ikke bruke `year: 1910` som etableringsår;
- holde superlativer, SNL-1889 og current-market-claims tilbake til de faktisk består sine egne porter.