# Civication Role World Authoring Guide

Status: **canonical produksjonsoppskrift**  
Sist kontrollert: **2026-08-18**

Denne guiden beskriver hvordan en rolle går fra eksisterende Career Gameplay-innhold til en faktisk `role_world_complete` uten å bygge ny runtime, ny sceneformatfamilie eller en parallell dagsmotor.

Den normative kvalitetskontrakten ligger i [`CIVICATION_ROLE_WORLD_STANDARD.md`](CIVICATION_ROLE_WORLD_STANDARD.md). Den maskinlesbare arbeidslisten ligger i [`../data/Civication/roleWorldAuthoringChecklist.json`](../data/Civication/roleWorldAuthoringChecklist.json).

## 1. Start med repoet, ikke med en blank rollebibel

Før ny tekst skrives skal rollen inventeres mot det som allerede finnes:

- canonical `category/role_scope`
- Career Gameplay Matrix-status
- roleModel
- FWG/workGrammar
- mailPlan
- mailFamilies
- Life Story/private/social/narrative-kilder
- personer og steder
- eksisterende state-akser
- choice consequences, flags og `next_bias`

Prinsippet er **reuse before rewrite**. Role World skal samle, skjerpe og fylle hull i et eksisterende livssystem. Det skal ikke kopiere fungerende innhold inn i en ny parallell mappe bare for å få et pent skjema.

Hvis canonical resolver allerede eier en scope, skal Role World bruke den. Gamle badge-slugs eller historiske filnavn skal reconciles mot canonical scope i stedet for å bli nye parallelle identiteter.

## 2. Skill tre statuser fra hverandre

En rolle kan ha tre forskjellige modenhetsnivåer samtidig:

1. **Career Gameplay-status** — for eksempel `playable` eller `reference_complete`.
2. **Role World-status** — `role_world_not_started`, `role_world_in_production` eller `role_world_complete`.
3. **Runtime availability** — om eksisterende Scene Pipeline faktisk kan levere authored gameplay.

Disse skal ikke blandes.

`reference_complete` betyr ikke automatisk en fylt sosial rolleverden. Omvendt skal en Role World heller ikke erklæres komplett dersom den underliggende career-pakken har et åpenbart teknisk hull som gjør provenance eller gameplay falskt.

## 3. Skriv sosiologisk kjerne før 56-gridet

Først defineres hva rollen egentlig undersøker.

En god kjerne er et sosialt problem, ikke en jobbdefinisjon:

```text
svakt:  hvordan er det å være renholder?
sterkt: usynlig arbeid, verdighet og asymmetrisk anerkjennelse
```

Deretter velges relevante abstrakte `theme_ids` fra Theme Bank. Theme Bank er et idéverktøy; den kan aldri brukes til å kopiere filmplot, karakterer, dialog eller konkrete scener.

## 4. Bygg persongrammatikken

Recurring people skal representere reelle sosiale posisjoner i verden, men de må få individuell egeninteresse og motsetninger.

For hver viktig person/type må produksjonen kunne svare på:

- Hvilken klasse-/ressursposisjon har personen?
- Hvilken status har personen i miljøet?
- Hvilken makt har personen over spilleren?
- Hva vil personen oppnå?
- Hva sier personen ikke direkte?
- Hvordan snakker personen?
- Hva lærer møtet med personen spilleren om systemet?
- Hvordan kan relasjonen endres gjennom sesongen?

Ekspeditør er en **strukturreferanse**, ikke en innholdsfasit. Renholder skal derfor ikke få «samme sjef, samme kollega, samme venn» med nye navn.

## 5. Definer langsomme akser

Velg et lite antall akser som faktisk kan bære 14 dager.

Noen kan være eksisterende runtime-state. Andre kan være redaksjonelle beskrivelser inntil eventuell datamodell-governance oppretter et felt.

Role World-filen skal aldri late som et nytt runtimefelt finnes bare fordi det er dramaturgisk nyttig.

## 6. Lag 14 × 4-gridet som dramaturgi

En full Role World dekker:

```text
14 dager × morning/lunch/afternoon/evening = 56 beats
```

Gridet er et **dekningskart**, ikke en inbox-kvote.

Det skal være lov at en dag består av:

```text
morning    info
lunch      relationship
afternoon  decision
evening    private_consequence
```

og en annen av:

```text
morning    task
lunch      social
afternoon  consequence
evening    conversation
```

Vi skal ikke produsere 56 kunstige strategiske valg. Typisk kan 1–2 aktive valg per dag være nok når de andre beatene bygger press, relasjon, hukommelse og etterklang.

## 7. Hvert beat må ha provenance

Et season beat er ikke ferdig fordi summary-feltet er godt skrevet.

Hvert beat må peke til konkret authored substans gjennom `materialization_refs`.

God provenance kan være:

```text
data/Civication/mailFamilies/...json#scene_or_mail_id
data/Civication/lifestory/...json#scene_id
data/Civication/.../private...json#beat_id
```

Hvis riktig substans ikke finnes, skal den skrives inn i en eksisterende governed sourcefamilie først. Role World-filen skal ikke være eneste sted der den spillbare situasjonen finnes.

Provenance er bevis på materialisering, ikke en unnskyldning for å peke alle 56 beats på den samme generiske mailen.

## 8. Bygg primære tråder over flere dager

En hovedrelasjon skal utvikle seg, ikke resettes.

En primær tråd skal normalt ha 5–10 faktiske beat-referanser. Den bør krysse flere dager og kan krysse work/private/social.

Et godt mønster er:

```text
forventning
→ første friksjon
→ spillerens handling
→ sosial tolkning
→ privat eller emosjonell ettereffekt
→ ny situasjon med samme person
→ senere konsekvens
```

Den rolle-spesifikke testen bør være strengere enn minimumsskjemaet når rollen trenger det, for eksempel ved å kreve at hver hovedrelasjon utvikles over minst tre forskjellige dager.

## 9. Planlegg privat etterklang eksplisitt

Arbeidet skal kunne lekke ut av arbeidsplassen.

Planlegg konkrete overganger til:

- vennskap/familie
- stress og energi
- selvbilde og sosial maske
- økonomisk rom
- ambisjon eller resignasjon
- stolthet, fellesskap og mestring
- livelihood opportunities når relevant

Privat etterklang er ikke synonymt med straff. En god sesong lar også gode valg gi varme, handlingsrom, respekt eller nye muligheter.

## 10. Design forsinkede konsekvenser

Minst de viktigste buene skal ha reell sosial hukommelse:

```text
setup → handling/valg → reaksjon → senere return
```

`return_ref` må ligge senere enn `setup_ref` i sesongen.

Bruk eksisterende governed signaler som flags, `next_bias`, consequences og thread state. Ikke opprett ny Role World-state-maskin.

## 11. Materialiser bare gjennom eksisterende pipeline

Canonical retning er fortsatt:

```text
roleModel / FWG / mailPlan / mailFamilies / Life Story / private / social / narrative
→ civication_scene_v1
→ compiledSceneRegistryV1 / SceneCatalog
→ SceneDirector
→ ChoiceDirector
→ eksisterende konsekvensflater
```

Følgende er **ikke** lov som snarvei til completion:

- ny `RoleWorldEngine`
- nytt sceneformat
- raw mailFamily-runtime som alternativ gameplaymotor
- RoleStoryletBridge fallback
- `jobbmails` fallback
- generisk filler når authored innhold mangler

## 12. Registrering og status

En Role World kan registreres som `role_world_in_production` mens den bygges.

`role_world_complete` brukes først når:

- 56 unike dag/fase-beats finnes;
- NPC-feltene er komplette;
- theme IDs er gyldige;
- primære tråder peker på faktiske beats;
- privat etterklang finnes;
- delayed consequences finnes;
- provenance er reell;
- `no_new_runtime` er sann;
- rolle-spesifikk kvalitetstest består;
- generisk Role World-kontrakttest består.

Hvis roleModel eller andre Career Gameplay-komponenter endres, skal eksisterende Career Gameplay-generator kjøres og outputs commit'es. Genererte outputs skal aldri håndredigeres for å få ønsket status.

## 13. Rolle-spesifikk test

Hver reference Role World bør ha en egen permanent test som minst beviser:

- alle `file#id`-referanser finnes;
- canonical scope resolver til riktig sourcepakke;
- hovedtrådene har faktisk tidsmessig utvikling;
- delayed consequences returnerer senere enn setup;
- underliggende Career Gameplay-status er konsistent;
- ingen midlertidig materialiseringsinfrastruktur blir stående.

Ekspeditør-testen er første eksempel, men senere tester skal gjenspeile den nye rollens egne risikopunkter i stedet for å kopieres mekanisk.

## 14. Branch- og mergehygiene

For én rolle:

```text
fersk main
→ én rollebranch
→ inventory
→ authored innhold + Role World
→ generatorer
→ permanente tester
→ full CI
→ fjern diagnose/materialiseringsworkflows
→ ny full CI på ren final head
→ SHA-låst merge
```

Én rolle per PR er normalregelen. Det gjør completion-status, regresjoner og provenance etterprøvbar.

## 15. Reference-sekvens

De tre første reference worlds er materialisert:

```text
naeringsliv/ekspeditor → role_world_complete
naeringsliv/renholder  → role_world_complete
by/by_radgiver_plan     → role_world_complete
```

De viser at samme produksjonsmetode kan bære servicearbeid, usynlig fysisk arbeid og kommunal kunnskaps-/forvaltningsmakt uten å kopiere innhold, NPC-er eller konfliktakser.

Neste reference Role World er:

```text
naeringsliv/controller
```

Deretter:

```text
sport/sport_utover
```

Poenget med rekkefølgen er å bevise metoden på tvers av servicearbeid, usynlig arbeid, forvaltning, tall/kontroll og kropp/prestasjon før bred masseproduksjon.
