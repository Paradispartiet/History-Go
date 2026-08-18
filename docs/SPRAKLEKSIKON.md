# History GO — Språkleksikon

Status: **canonical kontrakt for stedbundet språk**  
Dataeier: `data/leksikon/sprak/`  
Presentasjon: `js/ui/place-language-layer.js`  
Samling: `HGKnowledgeV2` / `hg_knowledge_entries_v2`

Språkleksikonet er History GOs system for språk som faktisk er knyttet til steder. Det bygger videre på det eksisterende Leksikon-laget; det er **ikke** en ny dialektmotor, en ny PlaceCard-runding, et nytt History GO-fag eller en separat samlingsdatabase.

**Språkleksikon og dialektlag er ikke synonymer.** Språkleksikon kan finnes på alle typer Places når stedet har dokumentert språkstoff. Dialektlaget er en avgrenset innholdsfamilie inne i Språkleksikonet og kan bare eies av et canonical Place med `placeScope: "area"`.

## 1. Hovedregel

> **Språkdata eies av Språkleksikonet. Stedspopupen eier presentasjonen. Knowledge V2 eier brukerens samlede kunnskap.**

Et språkspor kan være lite eller omfattende. Et sted uten dokumentert relevant språkstoff skal ikke få kunstig innhold for å fylle en flate.

## 2. Canonical datakilde

Manifest:

`data/leksikon/sprak/manifest.json`

Schema:

`data/leksikon/sprak/schema_v2.json`

Stedsspesifikke filer ligger under:

`data/leksikon/sprak/places/`

Manifestets `place_files` kobler canonical `place.id` til riktig språkfil. Runtime skal ikke kopiere Språkleksikonet inn i place-filen.

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
8. **Ingen completeness-fyll** — et sted kan ha null språkoppføringer.
9. **Fagkobling** — en samlet oppføring skal beholde et faktisk History GO-subject fra DomainRegistry/place-konteksten; `sprak` skal ikke oppfinnes som et nytt Subject bare for UI-formål.

Vanlige norske ord skal ikke merkes som lokale bare fordi de forekommer i en lokal kilde. Lokalt særpreg må dokumenteres.

## 7. Språkleksikon og dialektlag — hardt skille

Språkleksikonet kan brukes på alle typer Places når språkstoffet har en direkte, dokumentert stedstilknytning. **Dialektlaget er strengere:** Dialektlaget kan bare eies av et canonical Place med `placeScope: "area"`. Det finnes ingen unntak for gater, bygg, institusjoner, markeder, havner, arbeidsplasser eller andre enkelt-Places.

Dette betyr:

- et område-Place kan eie både vanlig Språkleksikon og dialektinnhold;
- enkelt-Places kan ha Språkleksikon med historiske navn, kallenavn, fagord, arbeidsspråk, stedsspesifikke ord og uttrykk eller annen dokumentert språkbruk;
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

For Places med `placeScope: "area"` er dialektord og lokale talemålsformer en **obligatorisk researchjobb**. Det skal søkes aktivt i ordbøker, dialektarkiv, lokale historiesamlinger, talemålsmateriale og andre relevante eksterne kilder. Når kildene bærer det, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres som `word` eller `expression` med `layer: "dialect"`.

Betydning, geografisk utbredelse og historisk/moderne status skal avgrenses etter kildene. Dialektord skal aldri konstrueres, moderniseres eller gjøres «mer lokale» av språkmodell eller redaksjonell gjetning. Dersom et dokumentert søk ikke finner et forsvarlig dialektord/lokalt uttrykk, registreres søkte kilder og begrunnet holdback/N/A i stedet for filler.

### Enkelt-Places og direkte språksteder

Enkelt-Places kan ha et rikt Språkleksikon, men ikke et dialektlag. Historiske gatenavn på Torggata, et dokumentert kallenavn på en bygning, et fagord ved Bislett stadion eller et arbeidsplassuttrykk kan være gyldig språkinnhold når kildene bærer det. Slike oppføringer skal ikke merkes som dialekt og skal ikke bruke et bredere dialektområde som om enkeltstedet eide det.

Gater, markeder, havner og arbeidsmiljøer kan fortsatt være **direkte språksteder** for stedsspesifikke uttrykk. «Direkte språksted» er en Språkleksikon-klassifisering, ikke en dialektklassifisering.

### Canonical dialekt-eier

Et dialektfenomen eies av **nærmeste relevante område-Place**. Et Sagene-ord eies av Sagene når kildene gjelder Sagene som språkmiljø. En skole, fabrikk, gate eller bygning på Sagene kan peke til språksporet gjennom `related_places` / `related_entries`, men oppretter ikke en konkurrerende dialektkopi.

**Stoppgate:** Dialektinnhold på et Place uten `placeScope: "area"` er en datamodellfeil. Flytt innholdet til riktig områdeeier eller klassifiser det som vanlig, direkte stedsspesifikt Språkleksikon dersom det faktisk tilhører enkeltstedet.

## 8. Presentasjon i stedspopupen

De faste grunnfanene i stedspopupen består. Når stedet har minst én gyldig språkoppføring, legger `place-language-layer.js` til en valgfri, direkte **Språk**-fane i den samme horisontalt scrollbar fanestripen. Det finnes ingen brukerrettet **Mer**-fane.

Språkfanen viser:

- antall oppføringer;
- typefordeling;
- filtrering etter språkfamilie/type;
- betydning og eksempel;
- uttale, dialektområde, bruk, periode og opphav når data finnes;
- relaterte steder og språkspor;
- kilder;
- samlingsstatus.

Når språkdata finnes, vises også en kompakt **Språk på stedet**-forhåndsvisning i Om. Den peker til språkfanen.

Når språkdata ikke finnes, vises verken tom språkfane eller teaser.

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
- Ikke samle språkoppføringer automatisk ved åpning.
- Ikke bruk AHA-generert tekst som kilde for nye språkoppføringer.

## 14. Produksjonsklar oppføring

En oppføring er klar når:

1. `id`, `term`, `type` og `meaning` er eksplisitte;
2. `place_id` i filen matcher manifestkoblingen;
3. stedsrelevansen er reell;
4. tids-/geografipåstander er avgrenset;
5. kildene er inspiserbare og brukerrettede URL-er er HTTPS;
6. den ikke dupliserer en eksisterende canonical oppføring uten relasjonsgrunn;
7. eventuell Knowledge-fagkobling peker til et faktisk canonical Subject;
8. språk-auditen passerer.


## Språkatlas Norge v1

Språkleksikonet har et nasjonalt, skjematisk språkatlas i `data/leksikon/sprak/norge_atlas_v1.json`. Atlaset bruker fire grove hovedgrupper – **austlandsk, vestlandsk, trøndersk og nordnorsk** – og deler dem videre i pedagogiske soner. Dette er navigasjon og faglig kontekst, ikke polygoner som påstår at en dialekt stopper ved en kommunegrense. Dialektgrenser er glidende, og målmerker krysser regioninndelingene.

Place-artikler kan peke inn i atlaset med `atlas_region_ids` og `atlas_overlay_ids`. Det endrer **ikke** eierskapsregelen: konkrete oppføringer med `layer: "dialect"` må fortsatt eies av et canonical Place med `placeScope: "area"`. Et områdeanker betyr dokumentert relevans, aldri at alle beboere snakker slik eller at formen er unik på stedet.

Bymål, historiske sosiolekter og multietniske talestiler ligger som egne overlegg. Samiske språk og de nasjonale minoritetsspråkene kvensk, romani og romanes ligger i et separat språkstatuslag og skal aldri behandles som norske dialekter.
