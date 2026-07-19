# Oppdag Kvadraturen — source completeness closure

Dato: 2026-07-19

## Formål

Denne rapporten lukker den avgrensede Oppdag Kvadraturen-kilden som eget Oslo-completeness-spor i History Go.

Kilden oppgir per 2026-07-19:

- 60 stoppesteder
- 10 vandringer

Kilder:

- https://www.oppdagkvadraturen.no/
- https://www.oppdagkvadraturen.no/stoppesteder
- https://www.oppdagkvadraturen.no/vandringer

History Go har behandlet den fysiske 33-stopp-kjernen og deretter alle ti vandringene med samme representasjonsprinsipp:

1. eksisterende canonical sted gjenbrukes når det fysisk dekker stoppet;
2. faktisk manglende, fysisk distinkt sted kan bli nytt canonical sted;
3. historiske lag, kunstverk, arkeologiske funn og andre underpunkter legges i Wonderkammer når en eksisterende fysisk parent er korrekt;
4. rute-, målgruppe- eller fortellingsramme alene er ikke grunn til å opprette et duplikatsted eller et parallelt kammer.

## 33-stopp-kjernen

Den opprinnelige fysiske kjernen ble behandlet gjennom fire bounded batches:

- PR #2441 — `Add missing Oppdag Kvadraturen places batch 1`
- PR #2447 — `Add missing Oppdag Kvadraturen places batch 2`
- PR #2454 — `Add missing Oppdag Kvadraturen places batch 3`
- PR #2462 — `Add final Oppdag Kvadraturen core representation batch 4`

Disse batchene kombinerte:

- gjenbruk av eksisterende canonical steder;
- nye fysisk distinkte steder der reelle gap fantes;
- presise adresse-/geometriankre;
- historiske site layers der dagens sted og det historiske objektet ikke er samme fysiske bygning;
- eksplisitt vern mot naboadresse-proxyer og syntetiske samlepunkter.

## Vandringer — 10/10 behandlet

### 1. Under bakken

- PR #2476 — `Add current Norges Bank and complete Under bakken archaeology`

Arkeologiske stopp ble representert som stedslag under korrekte eksisterende eller nye parents, uten tette dublettmarkører.

### 2. Her skal byen ligge!

- PR #2477 — `Complete Oppdag Kvadraturen Her skal byen ligge`

Historiske 1600-tallslag ble lagt på eksisterende fysiske steder.

### 3. Kunst i Kvadraturen — Vandring i kunst og historie

Hoveddekning:

- PR #2467 — `Add Oppdag Kvadraturen art microplaces batch 1`
- PR #2469 — `Add Mustadgården, Skulptursonen and Den røde prikk`

Kunstverk på allerede representerte steder ligger som `actual_site_treasure`. Fysisk distinkte kunststeder fikk bare canonical record når selve stedet var en selvstendig destinasjon.

### 4. Festningsbyen

- PR #2478 — `Complete Oppdag Kvadraturen Festningsbyen`

Fortellingsstopp inne i festningsområdet ble hovedsakelig beholdt som historiske lag under robuste canonical parents.

### 5. Hovedstaden Christiania

Hoveddekning:

- PR #2473 — `Add Hovedstaden Christiania places and historical layers`
- PR #2475 — `Add Schiøllgården and the Stortingsmennene historical layer`

Manglende fysiske steder og tidslag ble skilt fra hverandre. Blant annet ble Stiftsgården beholdt som historisk lag under dagens Sjøfartsbygningen.

### 6. Kunst i Kvadraturen — Nysgjerrigperens vandring

Hoveddekning:

- PR #2467 — `Add Oppdag Kvadraturen art microplaces batch 1`
- PR #2469 — `Add Mustadgården, Skulptursonen and Den røde prikk`

De åtte stoppene er representert gjennom presise kunstkamre og, for Skulptursonen, et selvstendig canonical kunststed.

### 7. Stil og arkitektur

- PR #2481 — `Add Kirkegata 5 and complete Stil og arkitektur`

Sammenligningsstopp ble modellert som route context, ikke som kunstige fellesmarkører for flere bygninger.

### 8. Barnas kvadratur

- PR #2484 — `Complete Oppdag Kvadraturen Barnas kvadratur`

Fem manglende konkrete fortellingslag ble lagt til. Tre eksisterende kamre ble eksplisitt gjenbrukt. Barneinnramming alene ble ikke brukt som duplikatgrunn.

### 9. Historien om Christiania

- PR #2485 — `Complete Oppdag Kvadraturen Historien om Christiania`

Fem manglende historiske lag ble lagt til for Egertorget, Stortorget, Oslo domkirke, Østbanestasjonen og Tollboden/havna. Eksisterende steder ble gjenbrukt for resten.

### 10. BaBYvandring Kunst

- PR #2502 — `Complete Oppdag Kvadraturen BaBYvandring Kunst by reuse audit`

Resultat:

- 8 offisielle stopp
- 8/8 eksisterende korrekte foreldre
- 8/8 eksisterende presise Wonderkammer-kamre
- 0 nye canonical steder
- 0 nye koordinater
- 0 nye Wonderkammer-kamre

Målgruppeinnrammingen ble eksplisitt behandlet som rute-/formidlingskontekst, ikke som nytt fysisk innhold.

## Viktige representasjonsbeslutninger som nå er låst

### Kunstverk på eksisterende steder

Små eller integrerte kunstverk skal normalt være Wonderkammer `actual_site_treasure` under riktig fysisk parent, ikke egne overlappende kartmarkører.

Eksempler:

- Hansken → `christiania_torv`
- Marriage → `kontraskjaeret`
- Den røde prikk → `mustadgarden_kongens_gate_3`
- Bankplassen-skulpturene → `bankplassen`

### Historiske bygninger som er borte

Et revet eller forsvunnet historisk objekt skal ikke automatisk få et nytt punkt dersom dagens standing site allerede er en korrekt fysisk parent.

Eksempel:

- Stiftsgården → historisk lag under `sjofartsbygningen`

### Sammenligningsstopp

En rute som sammenligner flere separate bygninger skal ikke få et syntetisk fellessted bare for å representere sammenligningen.

### Målgrupperuter

Barn-, familie- eller babyinnramming er ikke en ny stedidentitet. Eksisterende presist innhold skal gjenbrukes.

## Sluttstatus

Oppdag Kvadraturen kan etter dette behandles som en gjennomgått og lukket source-level completeness-kilde for den nåværende 2026-07-19-versjonen av nettstedet.

Det betyr ikke at History Go aldri skal hente ny informasjon herfra. Dersom Oppdag Kvadraturen senere publiserer nye stoppesteder eller vandringer, skal de behandles som en ny delta-audit mot denne baselinen.

Per denne closuren er det ikke identifisert et gjenværende kjent Oppdag Kvadraturen-stopp som krever en ny canonical markør eller et manglende rutespesifikt Wonderkammer-lag.
