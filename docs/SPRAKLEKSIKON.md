# History GO — Språkleksikon

Status: **canonical kontrakt for stedbundet språk**  
Dataeier: `data/leksikon/sprak/`  
Presentasjon: `js/ui/place-language-layer.js`  
Samling: `HGKnowledgeV2` / `hg_knowledge_entries_v2`

Språkleksikonet er History GOs system for språk som faktisk er knyttet til steder. Det bygger videre på det eksisterende Leksikon-laget; det er **ikke** en ny dialektmotor, en ny PlaceCard-runding, et nytt History GO-fag eller en separat samlingsdatabase.

**Språkleksikon og dialektlag er ikke synonymer. Språkleksikon er obligatorisk for alle canonical Places. Dialektlaget er ikke obligatorisk.** Alle steder har språklige innganger som navn, begreper, fagord, historiske navneformer, lokale betegnelser eller funksjonsord som kan researches og kildebindes. Dialektlaget er en avgrenset innholdsfamilie inne i Språkleksikonet og kan bare eies av et canonical Place med `placeScope: "area"`.

## 1. Hovedregel

> **Språkdata eies av Språkleksikonet. Stedspopupen eier presentasjonen. Knowledge V2 eier brukerens samlede kunnskap. Alle canonical Places skal ha et reelt Språkleksikon; dialekt er et separat underlag.**

Et språkspor kan være lite eller omfattende, men et produksjonsklart sted kan ikke ende med null språkoppføringer eller Språk = N/A. Manglende språkdata på et eldre sted er et **produksjonsgap**, ikke bevis på at stedet mangler språk. Gapet skal ikke fylles med kunstig lokalfarge, oppdiktet slang eller konstruert dialekt; i stedet researches reelle stedsspesifikke begreper og navn.

## 2. Canonical datakilde

Manifest:

`data/leksikon/sprak/manifest.json`

Schema:

`data/leksikon/sprak/schema_v2.json`

Stedsspesifikke filer ligger under:

`data/leksikon/sprak/places/`

Manifestets `place_files` kobler canonical `place.id` til riktig språkfil. Runtime skal ikke kopiere Språkleksikonet inn i place-filen.

**Produksjonsregel:** Når et Place fullproduseres, skal det ha en manifestkoblet språkfil eller annen eksplisitt canonical Språkleksikon-eier som gir minst én reell språkoppføring. En manglende manifestkobling er et produksjonsgap som må lukkes før sluttgodkjenning.

## 3. Innholdstyper

Runtime normaliserer eksisterende og nye typer til disse brukerrettede familiene:

| Canonical familie | Eksempler på datatyper | Bruk |
| --- | --- | --- |
| `word` | `ord`, `fagord`, `objektord`, `personord` | Lokale eller stedsspesifikke ord |
| `expression` | `uttrykk`, `lokal_vending`, `slang` | Uttrykk og talemåter |
| `dialect_feature` | `dialekttrekk` | Uttale-, bøynings-, syntaks- eller andre dialekttrekk |
| `pronunciation` | `uttale` | Uttale som selvstendig språkspor |
| `place_name` | `stedsnavn`, `historisk_navn`, `kallenavn` | Navn, navneformer og navnehistorie |
| `language_history` | `sprakhistorie` | Dokumenterte historiske språkspor |
| `term` | øvrige begrepstyper | Fallback for relevante språkbegreper |

Eksisterende typer trenger ikke masseomskrives. Normaliseringen er en presentasjons- og samlingsadapter, ikke en ny sannhetskilde.

### Begreper finnes på alle steder

Språkproduksjon skal alltid undersøke hvilke ord og begreper som faktisk hjelper brukeren å forstå akkurat dette stedet. Det kan blant annet være:

- canonical stedsnavn og dokumenterte alternative/historiske navneformer;
- fagord for stedets funksjon, arkitektur, natur, teknologi, institusjon, praksis eller kultur;
- navn på stedsspesifikke fenomener, materialer, roller eller bruksmåter;
- lokalt dokumenterte betegnelser og uttrykk;
- historiske ord som er nødvendige for å forstå kildene eller stedets tidligere funksjon.

Dette er **ikke** tillatelse til å kopiere generelle fagord fra et emnekart uten stedstilknytning. Begrepet må ha en dokumentert forklaring på hvorfor det er relevant akkurat her.

## 4. Oppføringsmodell

Minimum:

```json
{
  "id": "stabil_id",
  "term": "ord eller uttrykk",
  "type": "ord",
  "meaning": "presis betydning"
}
```

Når materialet gir dekning, kan oppføringen også ha:

- `knowledge_unit_id`
- `subject_id` / `fagkart_category_id`
- `term_id` / `term_ids`
- `concept_ids` og eksplisitte `concepts`
- `story_ids`
- `example`
- `pronunciation`
- `audio`
- `layer` (`language` / `dialect`)
- `dialect_area`
- `status`
- `usage`
- `etymology`
- `historical_period`
- `language_family`
- `context`
- `notes`
- `emne_ids`
- `related_entries`
- `related_places`
- `linked_to`
- `tags`
- `sources`

Ikke fyll felter ved gjetning. Fravær er bedre enn falsk presisjon.

For ny produksjon bør faglige Knowledge-ID-er være eksplisitte når de finnes. Legacy-oppføringer kan fortsatt vises og samles via en stabil, kildebundet overgangs-ID, men dette gjør dem ikke automatisk til ferdig emne-/concept-koblet fagverk.

## 5. Status

Når tidsstatus er dokumenterbar, brukes:

- `current` — i bruk;
- `common` — vanlig;
- `older` — eldre form/bruk;
- `rare` — sjeldent;
- `historical` — historisk;
- `uncertain` — usikkert dokumentert.

Et eldre ord skal ikke presenteres som nålevende lokal tale uten belegg.

## 6. Kvalitetskrav

En språkoppføring skal vurderes for:

1. **Stedsrelevans** — hvorfor er dette spesielt relevant for akkurat stedet eller området?
2. **Betydning** — er definisjonen presis og kildebelagt?
3. **Geografi** — er utbredelsen kjent, og er den bredere enn dette ene stedet?
4. **Tid** — er formen historisk, eldre, sjelden eller fortsatt i bruk?
5. **Kategori** — er dette faktisk språk, eller burde materialet ligge i Historie, Om eller en annen kilde?
6. **Kilder** — brukerrettede kildelenker skal være HTTPS.
7. **Deduplisering** — samme språkfenomen skal kunne relateres på tvers av steder i stedet for å få motstridende kopier.
8. **Ingen completeness-fyll** — null språkoppføringer er et produksjonsgap, men gapet skal aldri lukkes med oppdiktede eller generiske filler-oppføringer.
9. **Fagkobling** — en samlet oppføring skal beholde et faktisk History GO-subject fra DomainRegistry/place-konteksten; `sprak` skal ikke oppfinnes som et nytt Subject bare for UI-formål.
10. **Stedsdekning** — et produksjonsklart Place skal ha minst én reell, kildebundet språkoppføring; normalt researches flere relevante begreper når kildene bærer dem.

Vanlige norske ord skal ikke merkes som lokale bare fordi de forekommer i en lokal kilde. Et generelt fagord kan likevel være en gyldig `term` når det er nødvendig for å forstå stedet og stedskoblingen er dokumentert; det skal da ikke feilmerkes som lokalt særpreg.

## 7. Språkleksikon og dialektlag — hardt skille

Språkleksikonet er obligatorisk på alle typer Places. **Språkleksikon kan finnes på alle typer Places, og etter denne kontrakten skal det finnes på alle canonical Places.** Dialektlaget er strengere og valgfritt: Dialektlaget kan bare eies av et canonical Place med `placeScope: "area"`. Det finnes ingen unntak for gater, bygg, institusjoner, markeder, havner, arbeidsplasser eller andre enkelt-Places.

Dette betyr:

- et område-Place kan eie både vanlig Språkleksikon og dialektinnhold;
- enkelt-Places skal ha Språkleksikon med relevante historiske navn, kallenavn, fagord, arbeidsspråk, stedsspesifikke ord/uttrykk eller andre reelle begreper;
- enkelt-Places skal **ikke** få `layer: "dialect"`, `dialect_area` eller `dialect_feature`, selv når stedet ligger i et dialektområde;
- et stedsspesifikt uttrykk som faktisk oppstod ved et enkeltsted kan eies av enkeltstedets Språkleksikon som vanlig språkinnhold, men gjør ikke enkeltstedet til dialektområde eller dialekteier;
- generelle Sagene-, Oslo-, Østfold- eller andre områdeformer eies av nærmeste relevante område-Place og relateres videre, ikke kopieres til underliggende enkeltsteder.

### Canonical markør for dialektinnhold

Nyproduksjon skal merke dialektinnhold eksplisitt med `layer: "dialect"`. En oppføring regnes som del av dialektlaget når minst ett av disse forholdene gjelder:

- `layer: "dialect"`;
- canonical type er `dialect_feature` / `dialekttrekk`;
- `dialect_area` er satt på oppføringen eller språkfilen.

`word` og `expression` er **ikke automatisk dialekt**. På et område-Place skal et dialektord eller områdebundet lokalt uttrykk produseres som `word`/`expression` med `layer: "dialect"`. På et enkelt-Place kan `word`/`expression` brukes for dokumentert stedsspesifikt språk, men da er laget vanlig `language` og ikke dialekt.

### Produksjonsregel for område-Places

For Places med `placeScope: "area"` er dialektord og lokale talemålsformer en **obligatorisk researchjobb**, men et positivt dialektfunn er ikke et universelt resultatkrav. Det skal søkes aktivt i ordbøker, dialektarkiv, lokale historiesamlinger, talemålsmateriale og andre relevante eksterne kilder. Når kildene bærer det, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres som `word` eller `expression` med `layer: "dialect"`.

Betydning, geografisk utbredelse og historisk/moderne status skal avgrenses etter kildene. Dialektord skal aldri konstrueres, moderniseres eller gjøres «mer lokale» av språkmodell eller redaksjonell gjetning. Dersom et dokumentert søk ikke finner et forsvarlig dialektord/lokalt uttrykk, registreres søkte kilder og begrunnet holdback/N/A for **dialektdeljobben** i stedet for filler. Språkleksikonet som helhet kan fortsatt ikke være N/A.

### Enkelt-Places og direkte språksteder

**Enkelt-Places kan ha Språkleksikon, og i fullproduksjon skal de ha det; de skal ikke ha et konstruert dialektlag.** Historiske gatenavn på Torggata, et dokumentert kallenavn på en bygning, et fagord ved Bislett stadion eller et arbeidsplassuttrykk kan være gyldig språkinnhold når kildene bærer det. Slike oppføringer skal ikke merkes som dialekt og skal ikke bruke et bredere dialektområde som om enkeltstedet eide det.

Gater, markeder, havner og arbeidsmiljøer kan fortsatt være **direkte språksteder** for stedsspesifikke uttrykk. «Direkte språksted» er en Språkleksikon-klassifisering, ikke en dialektklassifisering.

### Canonical dialekt-eier

Et dialektfenomen eies av **nærmeste relevante område-Place**. Et Sagene-ord eies av Sagene når kildene gjelder Sagene som språkmiljø. En skole, fabrikk, gate eller bygning på Sagene kan peke til språksporet gjennom `related_places` / `related_entries`, men oppretter ikke en konkurrerende dialektkopi.

**Stoppgate:** Dialektinnhold på et Place uten `placeScope: "area"` er en datamodellfeil. Flytt innholdet til riktig områdeeier eller klassifiser det som vanlig, direkte stedsspesifikt Språkleksikon dersom det faktisk tilhører enkeltstedet. Manglende dialekt er lov; manglende Språkleksikon på et produksjonsklart sted er ikke lov.

## 8. Presentasjon i stedspopupen

**Språk er en fast fane på alle canonical Places** i den samme horisontalt scrollbar fanestripen som de øvrige grunnfanene. Det finnes ingen brukerrettet **Mer**-fane.

`place-popup-direct-tabs.js` sørger for at Språk-fanen alltid finnes. `place-language-layer.js` fyller den med canonical Språkleksikon-data når språkfilen er materialisert.

Språkfanen viser:

- antall oppføringer;
- typefordeling;
- filtrering etter språkfamilie/type;
- betydning og eksempel;
- uttale, dialektområde, bruk, periode og opphav når data finnes;
- relaterte steder og språkspor;
- kilder;
- samlingsstatus.

Når språkdata finnes, kan en kompakt **Språk på stedet**-forhåndsvisning i Om peke til språkfanen.

Når språkdata ennå ikke finnes på et eldre Place, skal Språk-fanen **ikke forsvinne**. Runtime viser en eksplisitt produksjonsgap-tilstand. Et slikt gap kan eksistere under migrering, men stedet kan ikke fullproduseres/sluttgodkjennes før reelle språkoppføringer er materialisert.

Språk er fortsatt **ikke** en PlaceCard-runding.

## 9. Samling

Brukeren kan eksplisitt samle en språkoppføring med **Samle kunnskapen**.

Oppføringen lagres i den canonicale Knowledge V2-butikken:

`hg_knowledge_entries_v2`
med blant annet:

- et faktisk `subject_id` / `fagkart_category_id` løst fra oppføringen eller stedet;
- `kind: "language"` og `collection_kind: "language"` som samlingsfasett;
- en stabil `knowledge_unit_id`;
- `source.type: "language_lexicon"`;
- `source.place_id`;
- `source.source_file`;
- term, tags, språkfamilie/type og eventuelle `emne_ids`/canonical ID-er.

**Språk er altså en samlingstype på tvers av fag, ikke et nytt fag.** Et by-sted kan fortsatt produsere `subject_id: "by"`, et sportssted `subject_id: "sport"`, osv. Språkfasetten gjør disse oppføringene samlet tilgjengelige uten å forvrenge fagkartet.

`knowledge.html?collection=language` viser brukerens Språksamling gruppert etter sted. Språk vises også som en egen samlingsinngang i Minnekammeret når minst én språkoppføring er samlet.

Det opprettes **ingen** `language_collection`, `dialect_collection` eller annen parallell localStorage-kilde.

Å åpne et sted samler ikke språk automatisk. Samling er en eksplisitt brukerhandling. Hvis runtime ikke kan løse en sikker fagkobling, skal oppføringen ikke samles som om koblingen var kjent.

## 10. Relasjoner på tvers av steder

`related_places` og `related_entries` gjør modellen klar for språkgeografi uten å innføre et eget atlaslager.

Et ord som finnes i flere områder skal kunne kobles til flere relevante places. Senere kartvisning skal lese disse relasjonene; den skal ikke bygge en konkurrerende sannhetskilde.

## 11. AHA

History GO eksporterer hele canonical Knowledge V2 gjennom `aha_import_payload_v1`. Samlede språkoppføringer ligger derfor allerede på den eksisterende AHA-importgrensen som `hg_knowledge_entries_v2`; det trengs ingen separat språkeksport.

AHA kan bruke kilde, sted, `collection_kind`, type, term, tags og eventuelle canonical koblinger til å analysere brukerens faktisk samlede språkoppføringer, for eksempel:

- mønstre mellom besøkte dialektområder;
- felles ordhistorie;
- endringer mellom historiske og moderne former;
- forbindelser mellom språk, handel, migrasjon, arbeid eller stedshistorie.

History GO skal ikke generere AHA-innsikter lokalt. AHA-EchoNet eier tolkningen etter importgrensen. AHA skal ikke finne på lokale språkformer for å fylle analyser; kildebundne språkoppføringer er grunnlaget.

## 12. Lyd

Schemaet reserverer `audio`, men lyd er ikke et krav i v2. Når lyd innføres, må uttaleopptak ha avklart kilde, rettigheter, geografisk representativitet og metadata. Tekstlig `pronunciation` kan brukes uten lyd når kilden støtter det.

## 13. Ikke gjør dette

- Ikke lag en separat dialektdatabase ved siden av Språkleksikonet.
- Ikke gjeninnfør Språkleksikon som PlaceCard-runding.
- Ikke opprett `sprak` som et falskt Knowledge-Subject bare for å få en egen UI-fane.
- Ikke legg språkinnhold i place-filer bare fordi popupen viser det.
- Ikke merk generelt norsk som lokalt uten belegg.
- Ikke presenter historiske former som moderne uten dokumentasjon.
- Ikke avslutt et Språkleksikon med bare navn eller generelle fagtermer når kildene dokumenterer lokale ord eller uttrykk.
- Ikke sett Språk til N/A eller skjul Språk-fanen fordi dialekt ikke er relevant.
- Ikke konstruer dialekt, slang, kallenavn eller «lokale» uttrykk for å fylle språkkravet.
- Ikke samle språkoppføringer automatisk ved åpning.
- Ikke bruk AHA-generert tekst som kilde for nye språkoppføringer.

## 14. Produksjonsklar oppføring og Place

En oppføring er klar når:

1. `id`, `term`, `type` og `meaning` er eksplisitte;
2. `place_id` i filen matcher manifestkoblingen;
3. stedsrelevansen er reell;
4. tids-/geografipåstander er avgrenset;
5. kildene er inspiserbare og brukerrettede URL-er er HTTPS;
6. den ikke dupliserer en eksisterende canonical oppføring uten relasjonsgrunn;
7. eventuell Knowledge-fagkobling peker til et faktisk canonical Subject;
8. språk-auditen passerer.

Et **Place** er Språkleksikon-produksjonsklart når det i tillegg har minst én reell, stedsspesifikk språkoppføring og den faste Språk-fanen viser innholdet. Dialekt kan være begrunnet N/A; Språkleksikonet kan ikke være N/A.


## Språkatlas Norge v1

### Viktig presisering: hovedområder er ikke dialekter

`austlandsk`, `vestlandsk`, `trøndersk` og `nordnorsk` er **grove dialektologiske orienteringsområder**. De skal aldri presenteres som om hver av dem var én dialekt. Den faktiske utforskningen skal gå videre til regionale soner og særlig til **lokale talemål/bytalemål**.

Atlaset har derfor `local_varieties` som et eget canonical nivå. Lokale profiler kan finnes for byer, bygder og andre dokumenterte talemålsmiljøer. En lokal profil betyr heller ikke at alle på stedet snakker likt: intern variasjon etter geografi, alder, sosialt miljø, mobilitet og språkkontakt skal kunne modelleres som egne lag. Konkrete lokale språkdrag skal ikke arves automatisk fra makroområdet; de krever lokale kilder.

Første profiler er Oslo, Fredrikstad, Lillehammer, Arendal, Kristiansand, Stavanger, Haugesund og Bergen. Profiler uten tilstrekkelig lokal detaljdokumentasjon står som `local_research_required` og skal **ikke** fylles med gjetninger.


Språkleksikonet har et nasjonalt, skjematisk språkatlas i `data/leksikon/sprak/norge_atlas_v1.json`. Atlaset bruker fire grove hovedgrupper – **austlandsk, vestlandsk, trøndersk og nordnorsk** – og deler dem videre i pedagogiske soner. Dette er navigasjon og faglig kontekst, ikke polygoner som påstår at en dialekt stopper ved en kommunegrense. Dialektgrenser er glidende, og målmerker krysser regioninndelingene.

Place-artikler kan peke inn i atlaset med `atlas_region_ids` og `atlas_overlay_ids`. Det endrer **ikke** eierskapsregelen: konkrete oppføringer med `layer: "dialect"` må fortsatt eies av et canonical Place med `placeScope: "area"`. Et områdeanker betyr dokumentert relevans, aldri at alle beboere snakker slik eller at formen er unik på stedet.

Bymål, historiske sosiolekter og multietniske talestiler ligger som egne overlegg. Samiske språk og de nasjonale minoritetsspråkene kvensk, romani og romanes ligger i et separat språkstatuslag og skal aldri behandles som norske dialekter.

### Interaktiv atlasnavigasjon

Språkatlaset skal være en utforskbar kunnskapsflate, ikke bare en illustrasjon. De fire hovedgruppene i det skjematiske kartet er klikkbare og tastaturnavigerbare. Valg åpner «Utforsk hele Norge» og flytter brukeren til riktig makroregion. Underregionene er egne knapper; når en underregion velges, vises atlasets eksisterende `area_summary` og `feature_labels` som forklaring.

Interaksjonen oppretter ingen nye språkdata og endrer ikke canonical eierskap. Den navigerer bare i `norge_atlas_v1.json`; dialektoppføringer eies fortsatt utelukkende av `placeScope: "area"`.

## Forskningsgrunnlag for Språkatlas Norge

Språkatlaset skal ikke bygges fra eksempellister eller antatte «kjente dialekter». Før en regional eller lokal profil materialiseres skal den ha et eksplisitt dokumentasjonsgrunnlag. Første nasjonale research-pass bruker særlig Nordisk dialektkorpus/NorDiaSyn, LIA norsk, UiTs Nordnorske dialekter og fagartiklene om dialektinndeling i Store norske leksikon.

- Nordisk dialektkorpus v4.0 dokumenterer 111 utvalgte norske målepunkter.
- LIA norsk inneholder historiske dialektopptak fra 1382 informanter på 227 steder/kommuner.
- UiTs Nordnorske dialekter gir et finmasket nordnorsk mellomnivå med 13 navngitte dialektgrupper, lokale målmerker og målprøver.
- Lokale corpus-ankre kan registreres før alle målmerker er ferdig analysert, men skal da ikke få oppdiktede eller arvede lokale kjennetegn.
- Konkrete lokale målmerker krever lokal eller klart relevant regional kilde.
- Bymål og flerspråklige steder skal alltid modelleres med intern variasjon; språk som nordsamisk, sørsamisk og kvensk er egne språk og aldri «norske dialekter».

## Lokalt evidensmateriale

Lokale talemålsprofiler har tre modenhetsnivåer:

- `local_research_required`: atlaset kjenner stedet/ankeret, men publiserer ikke konkrete lokale trekk ennå.
- `documented_seed`: lokalprofilen har dokumentert eksistens og kildegrunnlag, men detaljtrekkene er ikke ferdig materialisert.
- `evidence_materialized`: konkrete trekk, variasjon og/eller endringer er knyttet til eksplisitte kildebelegg i `feature_evidence`.

Et `feature_evidence`-element skal skille mellom strukturelle trekk, sosial variasjon, språkendring, språkkontakt og korpusgrunnlag. Historiske trekk skal aldri presenteres som om alle nålevende talere bruker dem. Endring skal beskrives som endring, ikke som én ny homogen dialekt. Hver publisert påstand skal ha minst én HTTPS-kilde direkte knyttet til påstanden.

Første evidensmaterialiserte batch omfatter Oslo, Bergen, Stavanger, Trondheim og Tromsø fordi disse har særlig sterke kombinasjoner av direkte bymålsbeskrivelser, korpus/lydmateriale og sosiolingvistisk forskning. Utvalg i senere batcher skal fortsatt styres av dokumentasjonsstyrke, ikke av størrelse eller tilfeldige eksempler.

## Videre evidensmaterialisering av lokale talemål

Etter første materialisering skal nye lokale profiler velges etter **dokumentasjonsstyrke**, ikke etter bystørrelse eller en forhåndslaget eksempel-liste. Neste materialiserte profiler er Kristiansand, Valle i Setesdal, Bodø, Narvik og Hammerfest. Utvalget kombinerer bymål, et tydelig dal-/bygdemålsanker og lokale nordnorske profiler med direkte målprøver.

For `evidence_materialized` er minstekravet nå låst til minst **fire synlige målmerker**, **fire strukturerte beleggpunkter** og **to profilkilder**. Hvert beleggpunkts `time_scope` skal gjøre det mulig å skille tradisjonelle beskrivelser, nåtidige opptak og dokumentert språkendring. En kilde som hovedsakelig beskriver tradisjonelt talemål gir ikke tillatelse til å presentere trekket som universelt nåtidsspråk.

## Lokal evidens: regional arv, lokalt korpus og språkkontakt

Lokal materialisering må skille mellom tre ulike typer belegg: **lokalt opptak/korpus**, **regionalt målmerke** og **lokalt dokumentert endring**. Et regionalt trekk kan brukes som ramme for et lokalt anker, men skal ikke merkes som unikt for stedet uten lokalt belegg. Ål er et eksempel: Hallingdal gir den strukturelle rammen, mens NDC og kilder om dagens Buskerud gir lokalt/nyere belegg.

Språkkontakt skal heller ikke gjøre separate språk til dialekttrekk. For norsk talemål i Tana og Hattfjelldal registreres samisk språkkontakt og institusjonell flerspråklighet som kontekst, mens samiske språk fortsatt eies av egne språklag. Den tredje forskningsstyrte gruppen materialiserer Voss, Ål, Hattfjelldal, Sømna og norsk talemål i Tana.

<!-- SPRÅKATLAS_PLACES_V1_START -->
## Språkatlas → Places v1

Språkatlaset og PlaceCard bruker samme canonical språkdata. `atlas_local_ids` i en språkfil er bare en presis navigasjonsrelasjon til en lokal atlasprofil; feltet gjør aldri et enkelt-Place til dialekteier. Dialektinnhold følger fortsatt regelen `placeScope: "area"`. Konkrete `feature_evidence`-påstander eies av atlasprofilen og skal ikke kopieres inn i Place-filen.

Når en atlasprofil eller region velges, viser runtime **«Utforsk steder med dokumenterte språkspor»**. Listen bygges fra `data/leksikon/sprak/manifest.json`, språkfilene og runtime `window.PLACES`. Den er derfor aldri en fullstendig oversikt over hvor talemålet finnes. Lokale profiler matches bare via eksplisitt `atlas_local_ids`; runtime får ikke gjette en lokal profil bare fordi et Place ligger i samme brede dialektregion.

Fra et Place med en eksplisitt lokal atlasrelasjon vises **«Se talemålet i Språkatlas»**. Navigasjon til et annet Place går gjennom `HGMapView.openPlace()`, slik at kartet flyttes ferdig før PlaceCard åpnes. Et område-Place kan ha null egne **dialektoppføringer** når all konkret talemålsevidens allerede ligger canonical i `local_varieties[].feature_evidence`, men Place-et skal fortsatt ha ordinære språk-/begrepsoppføringer. Språk-fanen viser da stedets begreper sammen med atlasprofilen uten å duplisere dialektevidensen.

### Dekningsaudit per 19. august 2026

- Lokale atlasprofiler totalt: **46**.
- Canonical språk-Places med eksplisitt lokal atlaslenke: **9**.
- Lokale atlasprofiler som har minst ett eksplisitt Place-spor: **6** – Oslo, Bergen, Trondheim, Valle i Setesdal, Narvik og Ål.
- Nye canonical område-Places i denne leveransen: **Bergen, Valle i Setesdal, Narvik og Ål**.
- `evidence_materialized`: **15: Bergen, Bodø, Hammerfest, Hattfjelldal, Kristiansand, Narvik, Oslo, Stavanger, Sømna, Tana – norsk talemål, Tromsø, Trondheim, Valle i Setesdal, Voss, Ål**.
- `documented_seed`: **7: Lom, Senja, Suldal, Surnadal, Trysil, Vang i Valdres, Åndalsnes/Rauma**.
- `local_research_required`: **24: Aremark, Arendal, Bjugn/Fosen, Enebakk, Fredrikstad, Haugesund, Inderøy, Jølster, Kautokeino – norsk talemål, Kirkenes/Sør-Varanger – norsk talemål, Kvæfjord, Kvænangen – norsk talemål, Lillehammer, Luster, Mo i Rana, Namdalen, Oppdal, Røros, Selbu, Stamsund/Lofoten, Time/Jæren, Tinn, Vinje, Volda**.

### Forskningsprioritet etter gap

1. `local_research_required` – høyest prioritet: ingen lokal profil oppgraderes uten direkte kildebelegg.
2. `documented_seed` – neste prioritet: eksisterende lokal dokumentasjon materialiseres til konkrete, kildebundne trekk.
3. `evidence_materialized` – vedlikehold og produktkobling; nye Places kan kobles uten å kopiere evidensen.

Tomtilstanden er fortsatt bevisst for profiler uten canonical språk-Place-kobling: produktet skal si at History Go **ennå ikke har et kildebelagt Place-spor der**, ikke finne på region-infererte steder.
<!-- SPRÅKATLAS_PLACES_V1_END -->

<!-- SPRÅKATLAS_PLACES_V2_DOCUMENTED_COVERAGE_START -->
## Språkatlas → Steder v2 – documented coverage

Denne produktfasen utvider Place-koblingen uten å starte en ny forskningsrunde. Regelen er evidensstyrt: en lokal profil får eksplisitt Place-spor når profilen allerede er `evidence_materialized`. `documented_seed` og `local_research_required` blir stående i forskningskø og skal ikke få konstruerte Place-koblinger bare for å øke dekningsgraden.

Etter denne materialiseringen har alle de **15** evidensmaterialiserte lokale talemålsprofilene minst ett eksplisitt canonical Place-spor. De ni nye område-Places er **Kristiansand, Stavanger, Voss, Bodø, Tromsø, Hammerfest, Tana, Hattfjelldal og Sømna**. Sammen med v1 gir dette **18 canonical språk-Places med eksplisitt lokal atlaslenke**, fordelt på alle 15 ferdig evidensmaterialiserte profiler.

Koblingen er fortsatt en navigasjonsrelasjon via `atlas_local_ids`. De konkrete talemålsbeleggene eies av `local_varieties[].feature_evidence` i Språkatlaset og kopieres ikke til Place-filene. Alle nye eiere er `placeScope: "area"`; geografisk area-anchor skal aldri tolkes som en hard dialektgrense.

De **7** profilene på `documented_seed` – Lom, Senja, Suldal, Surnadal, Trysil, Vang i Valdres og Åndalsnes/Rauma – er med hensikt ikke koblet i denne fasen. Først når detaljbelegget er materialisert, kan de gå inn i samme produktflyt.
<!-- SPRÅKATLAS_PLACES_V2_DOCUMENTED_COVERAGE_END -->