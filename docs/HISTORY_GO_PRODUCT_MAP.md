# History GO — produktkart

Status: **canonical produktkart**  
Eier: `history_go_product_map`  
Sist kontrollert: **2026-08-27**

Dette dokumentet beskriver hvilke hovedflater History GO består av og hvordan de henger sammen. Det er et produktkart, ikke en detaljoppskrift for hvert subsystem.

For sted-for-sted produksjon brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`, med produksjonsprofiler i `docs/PLACE_PRODUCTION_PROFILES.md`. Den detaljerte historiske sjekklisten er bevart i `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`. Når et subsystem skal produseres, gjelder subsystemets egen canonical kontrakt. Innholdsproduksjon i skala følger i tillegg `data/places/regler/content_factory_v1.json`.

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

1. **PlaceCard-samlinger** — visuelle innganger til identifiserbare ting som faktisk hører til stedet.
2. **Stedspopup** — kunnskap om stedet.
3. **På stedet** — hva som skjer eller kan gjøres der.

Canonical PlaceCard-modell for nye og fullproduserte ordinære Places:

```text
Badge ved tittelen
stående frontImage
+ 1–4 ferdige, stedstilpassede samlinger
+ tydelig Quiz-handling etter quizkontrakten
```

Samlingene velges etter stedets kategori, bekreftede produksjonsprofil, innholdsplan og faktiske canonical data. Kategori er kandidatstyring, ikke en ordre om at alle kandidattyper skal vises.

Visuell regel:

```text
1 → stor og sentrert
2 → balansert par
3 → 2 + 1
4 → 2 × 2
```

People, Flora og Fauna vises som sirkler. Øvrige samlinger vises som avrundede rektangler. Færre samlinger skal se kuraterte og komplette ut, ikke som manglende felter.

**Ingen tomme samlingskort ved fullproduksjon.** En valgt samling må ha et ekte canonical medlem og et faktisk lastbart previewbilde. Dersom et sted ikke har et reelt Brand, en kvalifisert person eller en annen kandidat, utelates den samlingen i stedet for å vise tom fallback eller produsere filler.

Bilder er medieinnhold. De beholdes i `frontImage`-/medieflaten eller hos riktig bildeeier og kan aldri brukes som en generell reservesamling.

Legacy Places uten ny eksplisitt `place_card_profile` kan fortsatt bruke kompatibilitetsvisningen. De migreres sted-for-sted når de faktisk revideres/fullproduseres.

PlaceCard-samlinger følger `data/places/README_place_rounds.md`.

Canonical popupfaner for ordinære Places:

```text
Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Språk
```

Fanenes innhold følger produksjonsprofil og innholdsplan. Universal core — særlig Om/identitet, kilder, Språk og chronology/epoke — kan ikke nedgraderes. Betingede moduler som Fortellinger, Før/etter, Nyheter og Lesespor produseres når de faktisk passer stedet og kontrakten bærer dem.

**Språk er fast og obligatorisk.** Alle ordinære steder skal ha reelle, stedsspesifikke begreper/navnespor i Språkleksikonet. Dialekt er derimot et separat underlag som bare produseres når `docs/SPRAKLEKSIKON.md` tillater og kildene bærer det.

`Mer`, `Annet` og `Tillegg` er ikke brukerrettede popupfaner. Tidligere restinnhold rutes til canonical eier: Objects/Gjenstander, People, Relaterte steder eller Om etter `docs/PLACE_POPUP_SYSTEM.md`.

På stedet omfatter blant annet Events, Social Meet og Spotmeeting/Kunnskapsmøte når disse faktisk er relevante og implementert. Type-spesifikt innhold som trening følger sin egen stedstypekontrakt.

Eiere:

- `docs/PLACE_STANDARD.md`
- `data/places/README_place_rounds.md`
- `docs/PLACE_POPUP_SYSTEM.md`
- `docs/SPRAKLEKSIKON.md`
- `docs/PLACE_PRODUCTION_CHECKLIST.md`
- `docs/PLACE_PRODUCTION_PROFILES.md`

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

Quizprofil og stedsprofil er separate. Quiz velges etter påstandsbank og faktisk læringsbredde, ikke bare etter om Place er `major`, `standard` eller `focused`.

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

People kan oppdages, låses opp eller samles etter faktisk runtime, men produktkartet oppfinner ikke nye unlock-regler. Et sted uten en kvalifisert People-kandidat skal heller ikke få en perifer person bare for PlaceCard.

## 7. Fagverk og Badges

`category` er stedets primære canonical fag-/badgeidentitet. `underbadge_ids` brukes til underklassifisering.

Badges-flaten går til stedets fagverkside. Navigasjonsrollene mellom Merket og Faget eies av:

- `docs/FAGVERK_NAVIGATION.md`.

Fagverket organiserer kunnskap og progresjon; det erstatter ikke stedets popup eller canonical place-data. Alle ordinære canonical Places skal ha fungerende stedsspesifikk Fagverk-side uansett produksjonsprofil.

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

Wonderkammer er **ikke** lenger en canonical PlaceCard-samling eller en ny produksjonsmodell for History GO-steder.

Eksisterende Wonderkammer-data behandles som migreringsgrunnlag og klassifiseres etter faktisk innhold:

- fysisk gjenstand → `Objects`;
- person → `People`;
- produksjon → kategoriens konkrete produksjonssamling når den kvalifiserer;
- bygning/anlegg → `structures` når det er en identifiserbar konstruksjon;
- annet delpunkt eller liten detalj → steddata/popup, ikke automatisk samling;
- naturmål → `destinations` når det er et navngitt turmål;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie;
- narrativ episode → Stories når storykontrakten er oppfylt.

Gamle Wonderkammer-dokumenter kan beskrive historisk design eller compatibility-data, men eier ikke ny stedproduksjon, completion eller progresjon.

## 12. Civication

Civication er et separat prosjekt/spillsystem.

Et fysisk Civication-element kan vises gjennom `Objects` når det samtidig er en virkelig, stedsspesifikk og visuelt kvalifisert gjenstand. Det gjør ikke Civication til en History GO-samling eller generell objektmodell.

```text
Objects = hva tingen er
Civication = kjøp/eierskap/bruk i Civication
```

## 13. Content Factory og produksjonsprofiler

History GO skal ha **fyldig, stedsspesifikt innhold i riktig omfang for hvert Place**. Content Factory og produksjonsprofilene reduserer ikke kvalitetsmålet.

Metoden løser to problemer:

1. samme kilder/claims blir ellers researched gjentatte ganger;
2. én kjempestor universell innholdsoppskrift kan ellers tvinge irrelevante moduler på steder som ikke bærer dem.

Canonical flyt:

```text
søk og gjenbruk eksisterende research
→ provisional katalogtriage
→ velg aktivt sted
→ ekte preflight og confirmed produksjonsprofil
→ lag stedsspesifikk INNHOLDSPLAN
→ samle/gjenbruk delt evidens der flere Places faktisk overlapper
→ bind claims eksplisitt til riktig Place/entity
→ gjør place-spesifikk gap-research
→ produser Universal canonical core
→ produser alle relevante betingede moduler helt
→ kurater 1–4 ferdige PlaceCard-samlinger
→ anti-generic review
→ individuell manuell QA og merge
```

### Ingen billigere kvalitetsklasse

`major`, `standard` og `focused` er **omfangsprofiler**, ikke kvalitetsnivåer.

- alle ordinære Places får samme factuality/source-standard;
- Språkleksikon og chronology/epoke research er obligatorisk;
- et `focused` Place skal være smalt komplett, ikke halvferdig;
- en relevant source-backed modul kan ikke hoppes over fordi profilen er mindre;
- en irrelevant modul skal ikke produseres bare fordi et annet sted har den.

### Delt research, individuell forståelse

En geografisk eller tematisk source pack kan brukes når flere Places deler reell historisk eller faglig kontekst. Men dette er et evidensbibliotek, ikke en tekstmal.

Hvert Place skal fortsatt få:

- egen evidensavgrensning;
- egen gap-research;
- egen redaksjonell syntese;
- egen innholdsplan;
- egne relevante samlinger og læringsflater;
- eget Språkleksikon med stedsspesifikke begreper/navnespor;
- egen chronology/epoke-kontroll;
- egen manuell produktvurdering.

### Claim-bank

Et verifisert faktum skal ikke researches på nytt bare fordi det brukes i en annen popupfane, Quiz, Story eller et annet Place som evidensen faktisk gjelder.

Claim-gjenbruk skal redusere gjentatt research. Det skal **ikke** gi gjenbrukt generisk slutttekst.

### Deterministisk arbeid

Scripts og canonical data skal gjøre eksakt arbeid som ID-/manifest-/relation-oppslag, deduplisering, indeksbygging, schema-/reference-validering og eksisterende entity-/claim-oppslag.

Dette frigjør researchkapasitet til kildekritikk, ny evidens, stedsspesifikk syntese, Stories, pedagogikk og sluttkvalitet.

### Ingen modellkvote

Det finnes ingen prosentgrense for modellbruk. Hvis et Place trenger ekstra research eller reasoning for å bli godt nok, skal dette gjøres.

Effektiviteten skal komme fra gjenbruk av validert grunnlag og korrekt scope, ikke fra å kutte kvalitet.

### Anti-generic gate

Et sted blokkeres dersom place-authored innhold:

- består name-swap-testen og like gjerne kunne tilhørt et annet Place;
- mangler stedsspesifikke evidensankre;
- er eksakt eller nær duplikat av tekst fra andre Places;
- mangler source→claim→tekst-sporbarhet;
- ikke gir en tydelig lokal lærings-/observasjonsverdi;
- fremstår fullt bare fordi generisk filler har fylt moduler.

Språk følger samme gate: generelle fagord kan bare brukes med dokumentert stedsspesifikk forklaring; oppdiktet lokal terminologi/dialekt er blocker.

### Fullness betyr profilriktig ferdig

Content Factory er ikke vellykket dersom kostnaden faller ved at **relevant** innhold underproduseres. Samtidig er det heller ikke kvalitet å fylle irrelevante moduler.

Et Place er fullt når:

- Universal canonical core er ferdig;
- alle relevante source-backed moduler i innholdsplanen er ferdige;
- irrelevante moduler er eksplisitt ferdigvurdert;
- PlaceCard viser bare ferdige samlinger og har ingen tomme kort;
- kort/popup/quiz/Fagverk/epokeviser består individuell QA.

### Skalering

Metoden skaleres bare dersom vi får samme eller høyere factuality, stedsspesifisitet, visuell kvalitet og manuell kvalitet, samtidig som gjentatt research og irrelevante filler-krav reduseres.

Operativ inngang er `docs/PLACE_PRODUCTION_CHECKLIST.md`. Profilkontrakten er `docs/PLACE_PRODUCTION_PROFILES.md`. Maskinlesbar factory-metode er `data/places/regler/content_factory_v1.json`.

## 14. Autoritetsregel

Dette produktkartet bestemmer **hvilke roller systemene har**. Det bestemmer ikke detaljproduksjonen.

Ved konflikt gjelder i denne rekkefølgen:

1. canonical schema/manifest/source-data for subsystemet;
2. implementert runtime og tester;
3. subsystemets canonical produksjons-/runtimekontrakt;
4. `docs/PLACE_PRODUCTION_CHECKLIST.md` og `docs/PLACE_PRODUCTION_PROFILES.md` for stedsscope;
5. dette produktkartet;
6. eldre roadmap-, rapport- og arkivmateriale.

Planlagt funksjonalitet skal alltid merkes som planlagt og må aldri beskrives som implementert bare fordi den finnes i et dokument.
