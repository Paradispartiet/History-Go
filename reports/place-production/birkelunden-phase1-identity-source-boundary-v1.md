# Birkelunden – fase 1 canonical identity/source boundary V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline: fase-0 merge `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Canonical place: `data/places/by/oslo/places/birkelunden.json`
- Coordinate evidence: `data/coordinate-evidence/oslo/by/birkelunden.json`
- Status: **KLAR FOR REVIEW**

## 1. Fasebeslutning

Canonical `birkelunden` skal fortsatt representere **selve den avgrensede parken Birkelunden**, ikke hele det fredede Birkelunden kulturmiljø og ikke naboplassene/-byggene rundt.

Dette er nå bekreftet både av repoets eksisterende coordinate-evidence og av uavhengige eksterne kilder. Fase 1 krever derfor **ingen canonical metadata- eller koordinatendring**. Den låser i stedet source-scope for senere source/claim-, description-, popup-, Object-, Structure-, relation- og Før/etter-arbeid.

## 2. Kilder kontrollert

| Kilde | URL | Hva kilden avgrenser/beviser | Place-applicability |
| --- | --- | --- | --- |
| Oslo kommune – Birkelunden | `https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/birkelunden` | Birkelunden er en park på **16,3 dekar**, avgrenset av Seilduksgata, Toftes gate, Schleppegrells gate og Thorvald Meyers gate; Paulus' plass med Paulus kirke ligger tilstøtende i vest | **direkte park-scope** |
| Riksantikvaren – Birkelunden, Murbyens hjerte | `https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/` | Det fredede **Birkelunden kulturmiljø** dekker ca. **116 dekar** og inkluderer selve parken, Grünerløkka skole, Paulus kirke og 15 kvartaler med 139 bygårder | **område-/kulturmiljø-scope; ikke parkareal** |
| Oslo kommune – Paulus' plass | `https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/paulus-plass/` | Paulus' plass er en egen plass på **4,4 dekar**, omkranser Paulus kirke, inngår i Birkelunden kulturmiljø og har Birkelunden like ved | **egen place-identitet / naborelasjon** |
| Oslo byleksikon – Birkelunden | `https://oslobyleksikon.no/side/Birkelunden` | Avgrenser parken geografisk, dokumenterer anlegg i 1860-årene, overdragelse til kommunen i 1882, senere parkendringer og skiller parken fra kulturmiljøfredningen rundt | **direkte parkhistorie + eksplisitt kulturmiljøkontekst** |
| OpenStreetMap way 3236549 | `https://www.openstreetmap.org/way/3236549` | Geometrien identifiserer selve parkpolygonet | **geometri/park-scope** |

## 3. Canonical own-place-grense

### `birkelunden` eier

- selve parkflaten Birkelunden;
- parkens anlegg, vegetasjon og brukerrettede fasiliteter når de faktisk ligger i parken;
- historiske parkhendelser og parkendringer;
- park-eide fysiske Objects/Structures når objektene består sine egne kontrakter;
- parkspesifikke People-relasjoner, Stories, Før/etter, Lesespor, språkspor og observasjoner når kilden peker på selve parken;
- det faktum at parken **inngår i** det større fredede kulturmiljøet, så lenge teksten uttrykkelig beholder dette nivåskillet.

### `birkelunden` eier ikke automatisk

- de 116 dekarene som utgjør hele Birkelunden kulturmiljø;
- de 15 kvartalene / 139 bygårdene i fredningsområdet;
- Grünerløkka skole;
- Paulus kirke;
- Paulus' plass;
- Birkelunden holdeplass;
- Thorvald Meyers gate eller Toftes gate som egne gater/byrom;
- hele Grünerløkka som bydel/område.

Disse kan brukes som **dokumenterte relasjoner eller kontekst**, aldri som proxy for parkens egen substans.

## 4. Den avgjørende arealgrensen

Fase-0-auditen identifiserte risikoen. Fase 1 låser nå tallene semantisk:

```text
Birkelunden park:              16,3 dekar  (Oslo kommune)
Birkelunden kulturmiljø:     ca. 116 dekar (Riksantikvaren)
Paulus' plass:                  4,4 dekar  (Oslo kommune)
```

Konsekvens:

- `116 dekar` kan aldri brukes som `spatial_profile.area_m2` for Birkelunden park;
- `15 kvartaler` og `139 bygårder` kan ikke beskrives som om de ligger **i parken**;
- description kan fortsatt forklare at parken er del av et langt større fredet kulturmiljø, men må navngi nivået eksplisitt;
- før/etter-motiv og Objects/Structures må vise/tilhøre park-place, ikke bære parken gjennom et nabobygg eller hele verneområdet.

## 5. Historisk identitet – hva er sikkert nå

Oslo byleksikon dokumenterer følgende parkhistoriske identitetsfakta som kan tas inn i fase-2 claim-banken:

- parken ble anlagt i 1860-årene som del av Thorvald Meyers planlegging og utparsellering av Grünerløkka;
- den ble overdratt kommunens beplantningsvesen gratis i 1882;
- navnet var Birkelunden fra starten;
- navnet ble fornorsket til `Bjerkelunden` i 1926;
- navnet ble endret tilbake til `Birkelunden` i 1955.

Disse opplysningene er **ikke** brukt til å endre canonical `year: 1910` i fase 1. Repoets generelle `year`-felt kan brukes som representativt/nøkkelår og skal ikke blindt restemples til etableringsår uten feltkontrakt og eksplisitt metadatareview.

Samtidig skal senere brukerrettet tekst aldri påstå at parken ble etablert i 1910 uten ny kildeevidens.

## 6. Kulturmiljøfredningen – tillatt formuleringstype

Kildebildet støtter denne semantikken:

> Birkelunden park inngår i det større fredede Birkelunden kulturmiljø.

Det støtter ikke denne semantikken:

> Birkelunden park er et 116 dekar stort område med 15 kvartaler og 139 bygårder.

Riksantikvaren oppgir at fredningsprosessen startet i 1996 og at kulturmiljøet ble fredet 28. april 2006. Superlativer og «første»-formuleringer om fredningshistorien skal holdes som egne claims og kvalitetskontrolleres i fase 2 før eventuell publisering; fase 1 trenger dem ikke for å løse identiteten.

## 7. Nabosteder og relasjonsregler

### Paulus' plass / Paulus kirke

Oslo kommune dokumenterer Paulus' plass som en egen navngitt plass, 4,4 dekar stor, med Birkelunden like ved. Den skal derfor ikke brukes som parkens:

- `subplace`;
- Object/Structure uten selvstendig kontraktgrunnlag;
- Før/etter-proxy;
- hovedbildebevis;
- onsite-oppgaveflate.

Den kan være en `related`-kandidat dersom repoets canonical place-register og relasjonskilde består senere relations-audit.

### Grünerløkka skole

Riksantikvaren dokumenterer skolen som en separat bestanddel i det fredede kulturmiljøet. Den er kontekst/naboelement, ikke automatisk park-eid Structure.

### Thorvald Meyers gate

Gaten brukes som fysisk parkgrense og historisk sammenheng. Gateclaim skal fortsatt eies av gaten/området når utsagnet ikke faktisk handler om parken.

### Olaf Ryes plass

Olaf Ryes plass er neste produksjonssted i Pilot 02 og skal aldri brukes som innholdsfyll i Birkelunden. Delt research er tillatt bare når kilden eksplisitt dekker begge park-/plassobjektene eller en felles Grünerløkka-sammenheng.

## 8. Konsekvens for dagens `popupDesc`

Fase 1 omskriver ikke `popupDesc`, men markerer én konkret senere description-gate:

- parkhistorien, 1882-overdragelsen og parkens fysiske utvikling kan være park-eid dersom claims verifiseres;
- avsnittet om 2006-fredningen må uttrykkelig skille **parken** fra **kulturmiljøet**;
- tallene 116 dekar / 15 kvartaler / 139 bygårder må eies av kulturmiljøet;
- Paulus kirke, Grünerløkka skole og omkringliggende leiegårder må omtales som bestanddeler/naboer i kulturmiljøet, ikke som om de er del av parkflaten.

Ingen tekst forkortes av denne grensen. Description-fasen skal heller gjøre innholdet mer presist og mer lokalt lesbart.

## 9. Bevisst ikke endret i fase 1

- canonical `birkelunden.json`;
- `year`;
- koordinater/geometri;
- `desc` / `popupDesc`;
- Nature;
- Leksikon;
- People;
- Quiz;
- Stories;
- Lesespor;
- Brands;
- rundinger;
- routes/relations;
- runtime.

## 10. Fase-1 gate

| Gate | Resultat |
| --- | --- |
| Canonical place-identitet | **PASS – park** |
| Park vs. kulturmiljø | **PASS – 16,3 daa vs. ca. 116 daa er kildeavgrenset** |
| Park vs. Paulus' plass | **PASS – separate kommunale steder** |
| Park vs. Paulus kirke/skole | **PASS – separate kulturmiljøbestanddeler/naboer** |
| Coordinate identity | **PASS – eksisterende OSM parkpolygon beholdes** |
| Proxy-innhold blokkert | **PASS** |
| Canonical dataendring nødvendig | **NEI** |
| Description-scope-regresjon identifisert | **JA – sendes til fase 2/5** |

## 11. Neste fase

Etter grønn CI/merge går Birkelunden videre til **fase 2 – Content Factory source/claim pack**.

Fase 2 skal bygge den delte Grünerløkka-kildepakken og samtidig registrere `place_applicability` claim-for-claim, slik at parkhistorie, kulturmiljøhistorie og Olaf Ryes plass aldri glir sammen i tekstproduksjonen.