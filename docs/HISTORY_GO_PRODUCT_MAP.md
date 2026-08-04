# History GO — produktkart

Status: **canonical produktkart**  
Eier: `history_go_product_map`  
Sist kontrollert: **2026-08-04**

Dette dokumentet beskriver hvilke hovedflater History GO består av og hvordan de henger sammen. Det er et produktkart, ikke en detaljoppskrift for hvert subsystem.

For sted-for-sted produksjon brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`. Når et subsystem skal produseres, gjelder subsystemets egen canonical kontrakt.

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

1. **Rundinger** — visuelle samlingsinnganger til identifiserbare ting.
2. **Stedspopup** — kunnskap om stedet.
3. **På stedet** — hva som skjer eller kan gjøres der.

Canonical rundingsmodell:

```text
Badge ved tittelen
Vanlig sted: People · Objects · Brands · kategoriens fjerde
Natursted:   Map · Flora · Fauna · kategoriens fjerde
```

Tillatte fjerde-rundinger:

```text
Kategoriens produksjoner · Bygg og anlegg · Kamper og konkurranser
Relaterte steder · Turmål · Bilder
```

Generisk `Works`, `Details` og `Spots` er ikke lenger rundingsalternativer. `Bilder` er eneste generelle reserve når kategoriens normale samling mangler faktisk innhold.

PlaceCard-rundinger følger `data/places/README_place_rounds.md`; denne filen gjentar ikke detaljreglene.

Canonical popupfaner:

```text
Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer
```

På stedet omfatter blant annet Events, Social Meet, Spotmeeting/Kunnskapsmøte, Tasks, Training og Play når disse faktisk er relevante og implementert.

Eiere:

- `docs/PLACE_STANDARD.md`
- `data/places/README_place_rounds.md`
- `docs/PLACE_POPUP_SYSTEM.md`
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

Badges-rundingen går til stedets fagverkside. Navigasjonsrollene mellom Merket og Faget eies av:

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

## 13. Autoritetsregel

Dette produktkartet bestemmer **hvilke roller systemene har**. Det bestemmer ikke detaljproduksjonen.

Ved konflikt gjelder i denne rekkefølgen:

1. canonical schema/manifest/source-data for subsystemet;
2. implementert runtime og tester;
3. subsystemets canonical produksjons-/runtimekontrakt;
4. dette produktkartet;
5. eldre roadmap-, rapport- og arkivmateriale.

Planlagt funksjonalitet skal alltid merkes som planlagt og må aldri beskrives som implementert bare fordi den finnes i et dokument.
