# History GO — produktkart

Status: **canonical produktkart**  
Eier: `history_go_product_map`  
Sist kontrollert: **2026-08-25**

Dette dokumentet beskriver hvilke hovedflater History GO består av og hvordan de henger sammen. Det er et produktkart, ikke en detaljoppskrift for hvert subsystem.

For sted-for-sted produksjon brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`. Den komplette detaljerte stedsgaten er bevart i `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`. Når et subsystem skal produseres, gjelder subsystemets egen canonical kontrakt. Innholdsproduksjon i skala følger i tillegg `data/places/regler/content_factory_v1.json`.

## 1. Hovedløkken

```text
Kart / Nearby / Søk
→ Sted / PlaceCard
→ Kunnskap eller handling
→ Samling / progresjon
→ Profil / NextUp / rute
→ neste sted
```

Stedet er navet. Profilen er spillerens samlings- og progresjonsflate. Fagverket organiserer faglig sammenheng. Ruter organiserer valgfrie læringsløp. Social Meet og Spotmeeting er kontekstbundne sosiale flater.

## 2. De tre stedflatene

Et History GO-sted har tre tydelig forskjellige brukerroller:

1. **Rundinger/samlinger** — visuelle samlingsinnganger til identifiserbare ting.
2. **Stedspopup** — kunnskap om stedet.
3. **På stedet** — hva som skjer eller kan gjøres der.

Canonical samlingsmodell:

```text
Badge ved tittelen
Vanlig sted: People · Objects · Brands · kategoriens fjerde
Natursted:   Flora · Fauna · Kart · Turmål
```

PlaceCard viser alltid nøyaktig fire samlingsflater i et fullt 2 × 2-felt. Vanlige steder har People som én sirkel og tre avrundede rektangler. Natursteder har Flora og Fauna som to sirkler og Kart og Turmål som to avrundede rektangler. Badges står separat ved tittelen og teller ikke blant de fire, og Quiz er en obligatorisk tydelig handling.

Kategoriens fjerde samling for vanlige steder løses av `data/places/README_place_rounds.md`. Generisk `Works`, `Details`, `Spots` og `Bilder` er ikke samlingsalternativer. Bilder beholdes i `frontImage`-/medieflaten eller hos riktig bildeeier og kan aldri brukes som samling eller reserve. En samling uten registrerte treff beholder en ærlig ikon-/statusflate uten oppdiktet innhold eller synlig falsk 0; layouten kollapser ikke.

PlaceCard-samlinger følger `data/places/README_place_rounds.md`; denne filen gjentar ikke detaljreglene.

Canonical popupfaner for alle Places:

```text
Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Språk
```

**Språk er fast og obligatorisk.** Alle steder skal ha reelle, stedsspesifikke begreper/navnespor i Språkleksikonet. Dialekt er derimot et separat underlag som bare produseres når `docs/SPRAKLEKSIKON.md` tillater og kildene bærer det. Legacy Places uten materialisert språkinnhold viser et produksjonsgap; de er ikke Språk=N/A.

`Mer`, `Annet` og `Tillegg` er ikke brukerrettede popupfaner. Tidligere `Mer`-innhold rutes til canonical eier: Objects/Gjenstander, People, Relaterte steder eller Om etter `docs/PLACE_POPUP_SYSTEM.md`.

På stedet omfatter blant annet Events, Social Meet og Spotmeeting/Kunnskapsmøte når disse faktisk er relevante og implementert. Type-spesifikt innhold som trening følger sin egen stedstypekontrakt.

Eiere:

- `docs/PLACE_STANDARD.md`
- `data/places/README_place_rounds.md`
- `docs/PLACE_POPUP_SYSTEM.md`
- `docs/SPRAKLEKSIKON.md`
- `docs/PLACE_PRODUCTION_CHECKLIST.md`

## 3. Samling og fysisk besøk er forskjellige ting

History GO skal ikke bruke «samlet» og «besøkt» som synonymer.

Implementert runtime skiller nå:

- `visited_places` — fysisk besøksstatus;
- `places_collected` — steder samlet gjennom quiz/target-unlock;
- profilsamlingen — unionen av fysisk besøkte og quiz-samlede steder.

Dermed gjelder:

> En quiz kan samle et sted uten å registrere fysisk besøk. Et fysisk besøk kan gjøre stedet synlig i profilsamlingen uten å være et quiz-unlock.

Den smale runtimegrensen eies av `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md` og faktisk kode. Samlet progresjonslesing beskrives i `docs/PROGRESSION_MODEL.md`.

## 4. Profil

Profilen er spillerens hovedflate for samling og status.

Den kan vise, der runtime støtter det:

- samlede steder;
- fysisk besøkte steder;
- quiz-/læringsstatus;
- People;
- badges/merits;
- favoritter;
- ruteprogresjon;
- offentlig hjemsted;
- relevante NextUp-signaler.

En belønning eller status som hevdes å være implementert skal kunne leses igjen i en faktisk brukerflate eller read-model. Planlagt progresjon skal ikke omtales som ferdig runtime.

## 5. Quiz og læring

Quiz er en egen produksjons- og runtimeflate. Nye eller fullt reviderte quizer følger kun:

- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`

Quiz kan påvirke blant annet:

- `quiz_history`;
- Knowledge/trivia;
- `hg_learning_log_v1`;
- badge/merit-hooks;
- target-unlocks;
- `places_collected` når et place-target faktisk låses opp;
- profiloppdatering.

Quiz skal aldri skrive fysisk besøksstatus.

## 6. People

People er canonical entiteter, ikke lokale kopier inne i places.

Produksjon og stedskobling eies av:

- `docs/PEOPLE_PROFILE_CANONICAL.md`;
- `docs/people-of-places-method.md`;
- `docs/PEOPLE_IMAGES.md`.

People kan oppdages, låses opp eller samles etter faktisk runtime, men produktkartet oppfinner ikke nye unlock-regler.

## 7. Fagverk og Badges

`category` er stedets primære canonical fag-/badgeidentitet. `underbadge_ids` brukes til underklassifisering.

Badges-flaten går til stedets fagverkside. Navigasjonsrollene mellom Merket og Faget eies av:

- `docs/FAGVERK_NAVIGATION.md`.

Fagverket organiserer kunnskap og progresjon; det erstatter ikke stedets popup eller canonical place-data.

## 8. Ruter

Ruter er organiserte læringsløp gjennom steder og/eller tekstlige etapper.

Historiske ruter eies av:

- `docs/README_HistoryGo_Historiske_Ruter.md`;
- `data/routes/historical/schema_historical_route.json`;
- `data/routes/historical/manifest.json`.

Ikke erklær GPS-samling, fysisk route-fullføring, badges eller oppgaveporter som implementert hvis runtimeguiden uttrykkelig sier at de ikke er det.

## 9. Nearby, favoritter og NextUp

Nearby og NextUp skal hjelpe spilleren å finne neste relevante steg basert på eksisterende, lesbar status.

Relevante signaler kan være:

- nærhet;
- favoritt;
- ikke åpnet / ikke besøkt;
- quizstatus;
- aktiv rute;
- kategori/faglig relevans;
- offentlig hjemsted;
- faktisk implementerte unlocks.

De skal ikke finne på fremdrift som ikke kan spores til eksisterende data/runtime.

## 10. Social Meet og Spotmeeting

Social Meet og Spotmeeting skal være kontekstbundne og privacy-sikre. De skal ikke bygge på offentlig live-posisjon, offentlig besøkshistorikk eller fri GPS-discovery av andre brukere.

Eiere:

- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`;
- `docs/HG_SPOTMEETING.md`;
- tilhørende backend/runtimekontrakter.

## 11. Wonderkammer er legacy

Wonderkammer er **ikke** lenger en canonical PlaceCard-runding eller en ny produksjonsmodell for History GO-steder.

Eksisterende Wonderkammer-data behandles som migreringsgrunnlag og klassifiseres etter faktisk innhold:

- fysisk gjenstand → `Objects`;
- person → `People`;
- produksjon → kategoriens konkrete produksjonssamling når den kvalifiserer;
- bygning/anlegg → `structures` når det er en identifiserbar konstruksjon;
- annet delpunkt eller liten detalj → steddata/popup, ikke automatisk runding;
- naturmål → `destinations` når det er et navngitt turmål;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie;
- narrativ episode → Stories når storykontrakten er oppfylt.

Gamle Wonderkammer-dokumenter kan beskrive historisk design eller compatibility-data, men eier ikke ny stedproduksjon, completion eller progresjon.

## 12. Civication

Civication er et separat prosjekt/spillsystem.

Et fysisk Civication-element kan vises gjennom `Objects` når det samtidig er en virkelig, stedsspesifikk og visuelt kvalifisert gjenstand. Det gjør ikke Civication til en History GO-runding eller generell objektmodell.

```text
Objects = hva tingen er
Civication = kjøp/eierskap/bruk i Civication
```

## 13. Content Factory v1 — smartere produksjonsmetode, samme fulle kvalitetsmål

History GO skal ha **fyldig, stedsspesifikt innhold for alle Places etter den komplette sted-checklisten**. Content Factory endrer ikke dette målet.

Metoden løser bare et produksjonsproblem: samme kilder, claims, People, hendelser og kontekst blir ellers researched og lastet inn flere ganger når nærliggende eller relaterte Places produseres separat.

Canonical flyt:

```text
søk og gjenbruk eksisterende research
→ samle delt evidens når flere Places faktisk overlapper
→ bind claims eksplisitt til riktige Places/entities
→ finn place-spesifikke hull
→ gjør så mye ekstra place-spesifikk research som trengs
→ produser alle relevante checklist-flater fullt
→ anti-generic review
→ full CORE-checklist
→ individuell manuell QA og merge
```

### Ingen billigere innholdsklasser

Content Factory har ingen `anchor`/`standard`/`baseline`-modell og ingen annen ordning som tillater et mindre ferdig Place for å spare kostnader.

Alle Places skal vurderes mot hele relevante checklisten. **Språk er alltid relevant og obligatorisk:** hvert Place skal ha et reelt Språkleksikon med stedsspesifikke begreper/navnespor. People, Stories, Quiz, Objects, Brands, historie, før/etter, ruter, observasjoner og andre flater produseres når deres egne kontrakter gjør dem relevante og kildebærende.

N/A brukes bare når innholdstypen faktisk er irrelevant eller ikke lar seg forsvare etter ordentlig research — aldri fordi stedet er definert som «long tail» eller fordi tokenbudsjettet er brukt opp. **Språkleksikon kan ikke settes N/A; dialektlaget kan være begrunnet N/A.**

### Delt research, individuell forståelse

En geografisk eller tematisk source pack kan brukes når flere Places deler reell historisk eller faglig kontekst. Men dette er et evidensbibliotek, ikke en tekstmal.

Hvert Place skal fortsatt få:

- egen evidensavgrensning;
- egen gap-research;
- egen redaksjonell syntese;
- egne relevante samlinger og læringsflater;
- eget Språkleksikon med stedsspesifikke begreper/navnespor;
- egen manuell produktvurdering.

### Claim-bank

Et verified faktum skal ikke researches på nytt bare fordi det skal brukes i en annen popupfane, Quiz, Story eller et annet Place som evidensen faktisk gjelder.

Claim-gjenbruk skal redusere gjentatt research. Det skal **ikke** gi gjenbrukt generisk slutttekst. Samme claim kan få forskjellig betydning og presentasjon på forskjellige steder.

### Deterministisk arbeid

Scripts og canonical data skal gjøre eksakt arbeid som ID-/manifest-/relation-oppslag, deduplisering, indeksbygging, schema-/reference-validering og eksisterende entity-/claim-oppslag.

Dette frigjør modell- og researchkapasitet til det som faktisk krever vurdering: kildekritikk, ny evidens, stedsspesifikk syntese, Stories, pedagogikk og sluttkvalitet.

### Ingen modellkvote

Det finnes ingen prosentgrense for AI-/modellbruk. Hvis et Place trenger ekstra research eller ekstra reasoning for å bli godt nok, skal dette gjøres.

Effektiviteten skal komme fra at samme grunnlag ikke betales for flere ganger, ikke fra at modellen brukes mindre enn kvaliteten krever.

### Anti-generic gate

Et sted blokkeres dersom place-authored innhold:

- består name-swap-testen og like gjerne kunne tilhørt et annet Place;
- mangler stedsspesifikke evidensankre;
- er eksakt eller nær duplikat av tekst fra andre Places;
- mangler source→claim→tekst-sporbarhet;
- ikke gir en tydelig lokal lærings-/observasjonsverdi;
- fremstår fullt bare fordi generisk filler har fylt checklist-flater.

Språkproduksjonen følger samme gate: generelle fagord kan bare brukes når de har en dokumentert, stedsspesifikk forklaring; oppdiktet lokal terminologi eller dialekt er blocker.

### Fullness gate

Content Factory er ikke vellykket dersom kostnaden faller ved at relevante flater blir mindre utforsket. Et Place kan ikke erklæres ferdig mens relevant, kildebærende innhold fortsatt er materielt underprodusert. Manglende Språkleksikon er alltid et slikt produksjonsgap.

### Skalering

Metoden piloteres først på én sammenhengende Oslo-klynge. Den skaleres bare dersom vi får **samme eller høyere innholdsfylde, stedsspesifisitet, faktisitet og manuell kvalitet** som den eksisterende sted-for-sted-metoden, samtidig som gjentatt research/kontekst reduseres.

Den operative inngangen er `docs/PLACE_PRODUCTION_CHECKLIST.md`. Den komplette detaljerte gaten er `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`. Den maskinlesbare metodekontrakten er `data/places/regler/content_factory_v1.json`.

## 14. Autoritetsregel

Dette produktkartet bestemmer **hvilke roller systemene har**. Det bestemmer ikke detaljproduksjonen.

Ved konflikt gjelder i denne rekkefølgen:

1. canonical schema/manifest/source-data for subsystemet;
2. implementert runtime og tester;
3. subsystemets canonical produksjons-/runtimekontrakt;
4. dette produktkartet;
5. eldre roadmap-, rapport- og arkivmateriale.

Planlagt funksjonalitet skal alltid merkes som planlagt og må aldri beskrives som implementert bare fordi den finnes i et dokument.
