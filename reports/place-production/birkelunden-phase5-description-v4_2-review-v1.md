# Birkelunden – fase 5 `desc` + `popupDesc` v4.2 review V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Branch baseline: `c02ce0993d2949efea19e70ca1976f32bd85f290`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Production packet: `data/places/production/birkelunden.json`
- Source pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Image backlog: `data/places/place_image_backlog_summary.json`
- Contract: `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`
- Schema: `data/places/regler/place_description_production_v4_2.schema.json`
- Validator: `scripts/validate-place-description-production-v4_2.mjs`
- Status: **KLAR FOR REVIEW / CI**

## 1. Hva fase 5 endrer

Fase 5 er første brukerrettede produksjonsfase i Content Factory Pilot 02.

Fem filer er tillatt i scope:

1. `data/places/by/oslo/places/birkelunden.json`
   - `desc`;
   - `popupDesc`;
   - `image`;
   - `cardImage`;
   - `imageCredit`;
   - `imageLicense`;
   - `imageSourceUrl`.
2. `data/places/production/birkelunden.json`.
3. `data/places/place_image_backlog_summary.json`.
4. denne reviewrapporten.
5. aktivt workcard.

Bildeendringen er ikke en ny redaksjonell sideoppgave. Den er nødvendig changed-place image-reparasjon: de gamle lokale Birkelunden-referansene finnes ikke i repoet og returnerer 404. Fase 5 erstatter dem derfor med ett inspectable, rettighetsklart bilde av selve Birkelunden park.

Ingen koordinater, radius, kategori, emner, Nature, Quiz, People, Objects, Brands, Stories, Lesespor, routes/relations eller runtime endres.

## 2. Før/etter – hovedproblemene i gammel tekst

Den gamle teksten hadde mye godt historisk råstoff, men var ikke godkjennbar under v4.2 fordi den manglet production packet og setning→claim-paritet.

I tillegg hadde den konkrete scope-/faktaproblemer:

- `116 dekar`, `15 kvartaler` og `139 bygårder` ble presentert uten tydelig nok skille mellom **parken** og **Birkelunden kulturmiljø**;
- en sterk `første`-påstand om kulturmiljøfredningen ble brukt uten v4.2-kravets to uavhengige kilder;
- flere detaljer om tidlig gjerde, treplanting, nabolagsbefolkning, Paulus kirke, Grünerløkka skole og løpende arrangementsbruk var ikke materialisert som fase-2 claims;
- formuleringen om dagens marked/arrangementer var current-volatile og ikke ferskverifisert gjennom en 2026 operatør-/offisiell arrangementsflate;
- canonical `year: 1910` kunne misforstås som etableringsår selv om source packen dokumenterer anlegg i 1860-årene og overdragelse i 1882;
- `image: bilder/places/birkelunden.JPG` og `cardImage: bilder/kort/places/birkelunden.PNG` peker til filer som ikke finnes i repoet.

Fase 5 løser dette ved å skrive fra verifiserte claims og ved å reparere den obligatoriske stedsbildeproveniensen.

## 3. Ny `desc`

Ny `desc` er 65 ord / 2 setninger etter repoets validatorlogikk.

Styrende idé:

> Birkelunden er et planlagt Grünerløkka-parkrom som ble gitt til kommunen med vern mot bebyggelse, senere endret og fylt med konkrete park- og minnespor, og som må skilles fra det langt større fredede kulturmiljøet rundt.

Ingressen bruker bare claims om:

- anlegg i 1860-årene;
- Thorvald Meyer;
- overdragelsen i 1882;
- gavevilkåret;
- parkarealet 16,3 dekar;
- fysisk omlegging 1916–20;
- paviljongen 1926;
- navngitte kunst-/minnespor;
- kulturmiljøet og fredningen i 2006.

Ingen `første`, `eldste`, `største`, årsaksrangering eller current markedspåstand brukes.

## 4. Ny `popupDesc`

Ny `popupDesc` er 301 ord, 6 avsnitt og 18 setninger etter validatorens `Intl.Segmenter('nb')`-logikk.

Artikkelen følger seks faktiske stofflag:

1. parkidentitet, 16,3 dekar, 1860-årene og 1882;
2. fysisk omlegging 1916–20, paviljong 1926 og basseng 1927–28;
3. navnehistorie, Jack Johnsen/Venner i Bjerkelunden og arbeiderbevegelsens parkbruk;
4. `Føll`, Jack Johnsen-bysten, 1984–86-arbeider og Spaniamonumentet 1989;
5. eksplisitt park-vs-kulturmiljø-grense og 2006-fredningen;
6. fersk kommunal 2026-fasilitetsstatus og en avsluttende fysisk/semantisk avgrensning.

Teksten inneholder vesentlig mer direkte, quizbar informasjon enn `desc`, uten å gjøre hele Grünerløkka eller verneområdet til parkens egen historie.

## 5. Claim-register

Production packet har **17 claims, alle `status: verified`**.

Hovedkilder:

- Oslo kommune – Birkelunden;
- Oslo byleksikon – Birkelunden;
- Riksantikvaren – Birkelunden, Murbyens hjerte;
- Store norske leksikon – Thorvald Meyer;
- Pensjonistforbundet – Vår historie;
- Nils Aas Kunstverksted;
- Oslo kommune – Parkbyen Oslo.

Hvert claim har URL, source location, source type, verifiedAt, claim kind, evidence mode og temporal status der relevant.

## 6. Spaniamonumentet – konflikt håndtert eksplisitt

Production packet publiserer **1989**.

Evidens:

- Oslo byleksikon: 1989;
- Nils Aas Kunstverksted: 1989.

Store norske leksikon – Birkelunden oppgir 1889. Den kilden brukes ikke for årstallet, og konflikten er bevart i claim-notatet og Content Factory source packen.

Ingen stiltiende flertallsavgjørelse eller usynlig korrigering er gjort.

## 7. Park vs. kulturmiljø – rettet

Teksten sier nå eksplisitt:

```text
Birkelunden park:          16,3 dekar
Birkelunden kulturmiljø: ca. 116 dekar
```

Kulturmiljøet omfatter parken, Grünerløkka skole, Paulus kirke og 15 kvartaler med 139 bygårder. Disse byggene og arealtallet brukes som **kulturmiljøkontekst**, ikke som parkens egen struktur eller areal.

Denne grensen bæres videre til `spatial_profile`, Structures, Objects, Før/etter, relations, popupfaner og bilder.

## 8. `year: 1910`

Fase 5 endrer ikke canonical `year`.

Repoets Place-kontrakter definerer ikke `year` som et universelt etableringsår. Production packet snapshotter derfor den eksisterende verdien `1910`, men:

- ingen setning bruker 1910;
- ingen claim bruker 1910;
- ingen quiz-readiness bruker 1910;
- `identity.period` starter i 1860-årene;
- faktareviewet dokumenterer at sourced parkhistorie starter i 1860-årene og har 1882 som overdragelsesmilepæl.

## 9. Sentence coverage og teksthash

Alle 2 `desc`-setninger og alle 18 `popupDesc`-setninger har minst ett eksplisitt verified claim.

SHA-256 er kontrollert byte-for-byte mot canonical branchtekst:

```text
desc:
ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe

popupDesc:
670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

Ingen tekstsetning viser til rejected claim, held-back superlativ, current søndagsmarked, SNLs 1889-datering eller generisk Grünerløkka-kontekst uten park-scope.

## 10. Changed-place image gate

### Gammel tilstand

```text
image: bilder/places/birkelunden.JPG
cardImage: bilder/kort/places/birkelunden.PNG
```

Begge filbanene er kontrollert mot repoet og finnes ikke. De er derfor ikke gyldige stedsbilder.

### Ny tilstand

```text
image/cardImage:
https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Birkelunden_%28121153%29.jpg/800px-Birkelunden_%28121153%29.jpg

imageCredit: Tore Sætre / Wikimedia Commons
imageLicense: CC BY-SA 4.0
imageSourceUrl: https://commons.wikimedia.org/wiki/File:Birkelunden_(121153).jpg
```

Commons-filsiden er kontrollert 2026-08-23 og dokumenterer:

- motiv: Birkelunden park på Grünerløkka;
- dato: 23. oktober 2015;
- fotograf: Tore Sætre;
- source: own work;
- lisens: Creative Commons Attribution-ShareAlike 4.0;
- attribusjonsinstruks: `Tore Sætre / Wikimedia`.

Bildet viser det canonicale parkobjektet og brukes ikke som proxy for Paulus kirke, omkringliggende bygårder eller hele kulturmiljøet.

### Backlog-effekt

Den ugyldige lokale Birkelunden-bildereferansen erstattes av én gyldig remote place-image-kjede:

```text
validRemote:      29 → 30
invalidLocalPath: 36 → 35
remaining:      1371 → 1370
By valid:          28 → 29
By invalid:        36 → 35
```

Dette er en kvalitetsreparasjon, ikke et forsøk på å lukke den globale bildebackloggen i denne PR-en.

## 11. Quiz-readiness

Pakken materialiserer **11 direkte faktaspørsmål** som readiness-bevis, blant annet:

- når parken ble anlagt;
- hvem Thorvald Meyer var i parkhistorien;
- gavevilkåret;
- 1916–20-omleggingen;
- Otto Hald og musikkpaviljongen;
- Bjerkelunden-navnet;
- Jack Johnsen;
- `Føll`;
- Spaniamonumentet 1989;
- parkarealet 16,3 dekar;
- hva som ble fredet i 2006.

Dette er **ikke** den aktive Quiz-produksjonen. Fase 10 er fortsatt et separat reelt produksjonshull og skal følge Quiz-kontrakten.

## 12. Anti-generisk gate

### Name-swap

FAIL ved navnebytte: teksten er bundet til Thorvald Meyer, 1882-vilkåret, Otto Hald, Birkelunden/Bjerkelunden, Jack Johnsen, `Føll`, Spaniamonumentet og den presise 16,3/116-dekar-grensen.

### Cross-place duplicate

Ingen hel setning er kopiert fra Youngstorget eller andre Pilot-steder. Shared research gir ikke shared prose.

### Specific evidence anchors

Alle avsnitt har minst ett navngitt lokalt anker, dato, fysisk element, person eller scope-fakta.

### Local experience

Brukeren kan forstå hvorfor parkflaten, paviljongen, navnehistorien og minnesmerkene tilhører Birkelunden, mens kirke/skole/bygårder ligger i det større verneområdet rundt.

### Fullness

Description-flaten er rik nok for v4.2, men stedet som helhet er **ikke** ferdig. Objects, Story, Quiz, People, Nature-QA, Før/etter, Kilder, Språk, Lesespor, Brands, routes og øvrige checklistflater står fortsatt åpne.

## 13. Bevisst fjernet/holdt tilbake

Ikke videreført i brukerrettet tekst:

- `Norges første store urbane kulturmiljø`;
- SNL-dateringen 1889 for Spaniamonumentet;
- nåtidsclaim om fast søndagsmarked;
- source-tomme detaljer om tidlig jerngjerde/bjørker/paviljongform;
- uscopede fakta om Paulus kirke og Grünerløkka skole som om de var park-eide;
- generelle årsakspåstander om arbeiderbyen;
- intern produksjons-/canonical-meta.

Dette reduserer ikke innholdskvaliteten. Det erstatter svak eller scope-uklar tekst med mer verifisert parkspesifikk substans.

## 14. Fasebeslutning

```text
SUBSYSTEM: desc / popupDesc v4.2 + changed-place image gate
IDENTITY: RESOLVED
DESC: 65 ord / 2 setninger
POPUPDESC: 301 ord / 6 avsnitt / 18 setninger
CLAIMS: 17/17 verified
SENTENCE COVERAGE: 20/20 setninger dekket
TEXT HASHES: VERIFIED
FACTUAL REVIEW: PASSED
EDITORIAL REVIEW: PASSED
QUIZ READINESS: 11 direkte spørsmål
STRONG HELD-BACK CLAIMS PUBLISERT: NEI
CURRENT SØNDAGSMARKED PUBLISERT: NEI
SNL 1889 PUBLISERT: NEI
PARK/KULTURMILJØ-SCOPE: RETTET
OLD LOCAL PLACE IMAGE PATHS: INVALID / 404
NEW IMAGE PROVENANCE: VERIFIED / CC BY-SA 4.0
GLOBAL IMAGE BACKLOG: 1371 → 1370
CANONICAL COORD/KATEGORI/EMNER/NATURE ENDRET: NEI
STATUS: KLAR FOR VALIDATOR / PR REVIEW
NESTE FASE ETTER MERGE: 6 – strukturerte place-profiler
```
