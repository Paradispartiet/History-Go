# Birkelunden – fase 2 Content Factory source/claim pack V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-1 merge `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Shared pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Content Factory-kontrakt: `data/places/regler/content_factory_v1.json`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Approval unit: **kun `birkelunden`**
- Status: **SOURCE/CLAIM PACK MATERIALISERT – KLAR FOR REVIEW**
- Canonical brukerinnhold endret i fasen: **NEI**

## 1. Hva fase 2 har gjort

Fase 2 har bygget én delt evidenspakke for Grünerløkka-klyngen uten å gjøre research-batching om til batch-godkjenning.

Pakken materialiserer alle obligatoriske Content Factory-komponenter:

- source registry;
- eksplisitte claims med source locator;
- `applicable_place_ids_or_entity_ids` claim-for-claim;
- entity relations;
- konflikter/usikkerheter;
- held-back claims;
- forskningsgap per Place;
- freshness-status;
- separat økonomi-/gjenbruksmåling.

Den aktive produksjonsenheten er fortsatt Birkelunden alene. Olaf Ryes plass får downstream research-seeds, men er **ikke** nullmålt, reviewet eller godkjent gjennom denne fasen.

## 2. Source registry

Shared pack registrerer 14 kilder/proveniensposter:

1. Oslo kommune – Birkelunden;
2. Oslo byleksikon – Birkelunden;
3. Riksantikvaren – Birkelunden, Murbyens hjerte;
4. Store norske leksikon – Thorvald Meyer;
5. Pensjonistforbundet – Vår historie / Jack Johnsen;
6. Nils Aas Kunstverksted – verkskronologi;
7. Oslo kommune – Parkbyen Oslo;
8. Oslo kommune – Paulus' plass;
9. Oslo kommune – Olaf Ryes plass;
10. Oslo byleksikon – Olaf Ryes plass;
11. Oslo byleksikon – Thorvald Meyers gate;
12. Oslo byleksikon – Parker og grøntanlegg;
13. Store norske leksikon – Birkelunden;
14. OpenStreetMap way 3236549, gjenbrukt fra eksisterende coordinate-evidence.

13 eksterne kilder ble lagt inn for Pilot 02, mens OSM-proveniensen ble gjenbrukt fra allerede godkjent History GO-arbeid. Tallene er kun arbeidsmåling.

PDF-/arkivmateriale som ikke kunne behandles gjennom hele den nødvendige side-/asset-kontrollen er ikke brukt som skjult shortcut i source packen. Verifiserte claims er derfor bundet til de eksplisitt registrerte kildene over.

## 3. Birkelunden-claims som nå er eksplisitt scoped

Claim-banken låser blant annet:

- Birkelunden som **16,3 dekar park**, ikke det ca. 116 dekar store kulturmiljøet;
- fysisk parkgrense mot Seilduksgata, Toftes gate, Schleppegrells gate og Thorvald Meyers gate;
- anlegg av parken i 1860-årene i Thorvald Meyers Grünerløkka-planlegging;
- gratis overdragelse til kommunens beplantningsvesen i 1882;
- gavevilkåret om at parken ikke skulle bebygges;
- fysisk omlegging 1916–20 til leke-/aktivitetspark;
- dagens musikkpaviljong fra 1926, tegnet av Otto Hald;
- vannbasseng 1927–28;
- navnehistorien `Birkelunden → Bjerkelunden → Birkelunden` i 1926/1955;
- Ørnulf Basts `Føll`, reist 1953;
- Jack Johnsens Birkelunden-baserte pensjonistorganisering og `Venner i Bjerkelunden` i 1937;
- Jack Johnsen-bysten, reist 1984;
- parkopprusting 1984–86;
- Nils Aas' Spaniamonument, reist **1989**;
- Birkelunden park som én bestanddel i Birkelunden kulturmiljø, fredet i 2006;
- kommunalt listede 2026-fasiliteter: paviljong med strømuttak og drikkefontener;
- Thorvald Meyer som direkte People→Place-kandidat;
- Birkelunden som dokumentert arena for arbeiderbevegelsens massemønstringer tidlig på 1900-tallet, foreløpig bare som historisk bruk/research-seed;
- eksisterende OSM-parkgeometri som allerede godkjent coordinate-proveniens.

Dette er researchgrunnlag for senere subsystemer. Det betyr ikke at Objects, Story, People, Before/After, Kilder eller Onsite allerede er godkjent.

## 4. Reelle entity-kandidater fra samme researchpass

Source packen registrerer blant annet disse eksplisitte kandidatrelasjonene:

- Thorvald Meyer → Birkelunden: planner/donor;
- Jack Johnsen → Birkelunden: organizer/association founder;
- musikkpaviljongen → Birkelunden: Object-kandidat;
- `Føll` → Birkelunden: Object-kandidat;
- Jack Johnsen-bysten → Birkelunden: Object-kandidat;
- Spaniamonumentet → Birkelunden: Object-kandidat;
- Birkelunden kulturmiljø → Birkelunden: større verneområde som **inneholder** parken, ikke samme objekt;
- Paulus' plass → Birkelunden: separat nabosted, ikke subplace;
- Olaf Rye → Olaf Ryes plass: downstream namesake-kandidat;
- Eilert Sundt-bysten → Olaf Ryes plass: downstream Object-kandidat.

Ingen Object-ID, People-profil, Story eller relation materialiseres i fase 2. Kandidatstatus gjør bare senere arbeid mindre repetitivt og mer etterprøvbart.

## 5. Kildekonflikt: Spaniamonumentet

Fase 2 fant en konkret konflikt som illustrerer hvorfor Content Factory ikke kan være ren source-scraping:

- Oslo byleksikon: **1989**;
- Nils Aas Kunstverksted: **1989**;
- Store norske leksikon – Birkelunden: **1889**.

1989 godkjennes som claim-verdi fordi både den stedsspesifikke institusjonelle kilden og kunstnerinstitusjonens verkskronologi peker på samme år. SNLs 1889 blir **ikke** ignorert eller stilletiende korrigert; den registreres permanent i `conflicts_and_uncertainties` og sperres som kilde for akkurat dette årstallet.

## 6. Den viktigste scope-konflikten er også låst

Pakken viderefører fase-1-grensen:

```text
Birkelunden park:           16,3 dekar
Birkelunden kulturmiljø:  ca. 116 dekar
```

Dette er ikke to konkurrerende målinger av samme område. Det er to ulike objektnivåer.

Konsekvensen gjelder alle senere flater:

- `spatial_profile.area_m2` kan ikke få 116-dekar-tallet;
- de 15 kvartalene/139 bygårdene kan ikke bli parkens Structures;
- Paulus kirke og Grünerløkka skole kan være kulturmiljø-/naborelasjoner, ikke park-eide fysiske elementer;
- description må eksplisitt si **kulturmiljøet rundt parken** når disse fakta brukes.

## 7. Claims som bevisst er holdt tilbake

Fem kandidater er eksplisitt blokkert eller utsatt:

1. **«Første fredede bykulturmiljø i Norge»** – sterk `første`-claim holdes til uavhengig source-review i den brukerrettede fasen.
2. **«Norges eldste pensjonistforening»** – Pensjonistforbundet er et godt primær-/institusjonsgrunnlag, men superlativet trenger uavhengig støtte.
3. **Spaniamonumentet 1889** – avvist på grunn av dokumentert kildekonflikt.
4. **Søndagsmarked som fast 2026-aktivitet** – current-volatile og må ferskverifiseres fra operatør/offisiell nåtidskilde.
5. **Arbeiderbevegelsens massemønstring → Story** – historisk bruksclaim er godkjent som research-seed, men mangler fortsatt en konkret episode, dato, aktører og narrativ akse etter Stories-kontrakten.

## 8. Content Factory-gjenbruk mot Olaf Ryes plass

Delt research har allerede gjort det mulig å registrere downstream seeds for Olaf Ryes plass uten å late som stedet er produsert:

- egen fysisk identitet og gateavgrensning;
- åpen løkke kjøpt av kommunen i 1863;
- regulert/navngitt som Olaf Ryes plass i 1864;
- opparbeidet som park i 1890;
- Eilert Sundt-byste av Mathias Skeibrok, reist 1892;
- sentral fontene fra 1927;
- 2026-fasiliteter `fontene` og `strømuttak`, markert current-volatile;
- felles Grünerløkka-kontekst via Thorvald Meyers gate og parkstrukturen.

Dette er **research reuse**, ikke text reuse. Når Olaf Ryes plass senere tas som eget Place, starter det med egen nullmåling/prior-work-gate og fyller alle egne evidensgap.

## 9. Researchgap som fortsatt er obligatoriske for Birkelunden

Source packen er tilstrekkelig til å gå videre i produksjonsløpet, men ikke til å lukke hele stedet. Minst disse gapene står åpne:

1. kildestøtte for eksisterende `nature_profile` og reell økologi/habitat;
2. fersk 2026-verifikasjon av marked, arrangementer og annen current use;
3. rettighetsklare historiske/nå-bilder av **selve parken** til Før/etter;
4. canonical Object-ID/eierskap/assets for paviljong, Føll, Jack Johnsen-byste, Spaniamonument og eventuelt basseng;
5. Story med reell episode; Jack Johnsen-sporet er sterk kandidat;
6. aktiv Quiz-produksjon;
7. own-place People-audit;
8. Brand-kandidataudit;
9. Structure-audit som ikke stjeler Paulus kirke/skole/nabobygg;
10. Språkleksikon-vurdering med Birkelunden/Bjerkelunden som reelt navnspor;
11. åpne Lesespor;
12. lokal Grünerløkka-rute;
13. metadatareview av `year: 1910`;
14. brukerrettet `source_summary`/inspectable HTTPS-kilder senere.

Dersom senere faser finner flere hull, er riktig respons mer Birkelunden-spesifikk research.

## 10. Freshness-regler

- historiske claims fra Oslo byleksikon, Riksantikvaren, Pensjonistforbundet, SNL Thorvald Meyer og Nils Aas Kunstverksted: `historical_stable` med normal konflikt-/korreksjonsvakt;
- kommunale 2026-fasiliteter: `current_volatile`;
- søndagsmarked/arrangementsbruk: ikke frigitt som current claim uten ny verifikasjon;
- OSM-geometri: `source_volatile`, men allerede materialisert og skal ikke geokodes på nytt uten konkret coordinate-regresjon.

## 11. Economy-måling – ikke kvalitetsmåling

Fase 2 registrerer:

- 1 proveniens/source gjenbrukt fra eksisterende History GO-arbeid;
- 13 nye eksterne kilder registrert;
- 26 strukturerte/scopede claims;
- 20 claims som kan inngå i senere Birkelunden-review;
- 7 downstream Olaf Ryes-claim seeds;
- 5 held-back claims;
- 4 dokumenterte konflikter/usikkerheter.

Disse tallene må **aldri** brukes som argument for at Birkelunden er rikt nok eller ferdig. De måler bare hvor mye av researchkonteksten som nå kan gjenbrukes uten å oppdages på nytt.

## 12. Fase-2 beslutning

```text
SOURCE PACK: MATERIALISERT
APPROVAL UNIT: birkelunden
SHARED RESEARCH: JA, KUN MED EKSPLISITT PLACE/ENTITY-SCOPE
PARK 16,3 DAA → KULTURMILJØ 116 DAA: NEI
PAULUS KIRKE/SKOLE → PARK STRUCTURES: NEI
OLAF RYES CONTENT → BIRKELUNDEN: NEI UTEN EKSPLISITT SHARED CLAIM
SNL 1889 → SPANIAMONUMENTET: AVVIST / KONFLIKT REGISTRERT
STRONG FIRST/OLDEST CLAIMS: HELD BACK
CURRENT MARKET/EVENT CLAIMS: FRESHNESS-BLOKKERT
CANONICAL USER CONTENT CHANGED: NEI
SOURCE PACK SUFFICIENT TO START NEXT PHASES: JA
SOURCE PACK SUFFICIENT TO CLOSE ALL BIRKELUNDEN SURFACES: NEI
NESTE FASE: 3 – koordinater/geometri, prior-work gate
```

Content Factory har dermed gjort én researchpass mer gjenbrukbar uten å redusere kravene til Birkelunden. Neste fase skal først kontrollere eksisterende coordinate-evidence og forventes å klassifiseres **ALLEREDE FERDIG** dersom den fortsatt består dagens coordinate-kontrakt.