# History GO — people-popup-system

Status: **canonical**
Eier: `person_popup_presentation_contract`
Runtime: `js/ui/person-popup-v2.js`
Design: `css/person-popup-v2.css`
Canonical data: `data/people/manifest.json`
Readiness-audit: `tools/audit-people-popup-readiness.mts`
Faktisitetskontrakt: `docs/FACTUALITY_CONTRACT.md`
Profilproduksjon: `docs/PEOPLE_PROFILE_CANONICAL.md`
Sist kontrollert: **2026-08-01**

Dette dokumentet definerer hvordan people-popupen skal presentere en canonical person, hvilke felt den kan lese, hvordan ulike persontyper skal fylles, og hvordan manglende informasjon skal håndteres uten tomme bokser eller oppdiktede data.

## 0. Faktisitetsgate

Alle people-profiler følger [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md). Produksjon, claims, feltsemantikk, review og ferdigstatus eies av [`PEOPLE_PROFILE_CANONICAL.md`](./PEOPLE_PROFILE_CANONICAL.md). Ingen dato, rolle, utdanning, produksjon, publikasjon, stedskobling, vurdering eller annen detalj skal fylles inn fordi den virker sannsynlig eller gjør profilen mer komplett.

- En språkmodell er aldri en faktakilde.
- Hver brukerrettet faktapåstand skal kunne spores til en inspectable kilde som faktisk støtter påstanden.
- Manglende informasjon skal utelates, ikke rekonstrueres.
- Kilder skal leses; det er ikke nok at en URL finnes.
- Motstridende eller utilstrekkelige kilder skal føre til utelatelse eller eksplisitt dokumentert usikkerhet.
- Readiness, schema, grønne tester og `verifiedAt` er ikke bevis på historisk korrekthet.

En profilebatch skal stoppes dersom navn, livsdata, verk, roller eller stedstilknytninger ikke kan verifiseres. Framdrift og visuell fylde er alltid underordnet sannhet.

## 1. Rolle og avgrensning

People-stripen, stedskortet og andre små personflater gir inngang. People-popupen er personens fordypningsflate.

Popupen skal:

- vise `popupDesc` som hovedbiografi;
- bruke `desc` som kort ingress når den tilfører noe annet enn hovedbiografien;
- vise livsdata, rolle, virkested, verk eller bidrag, utdanning, fagprofil, steder, relasjoner og kilder når data finnes;
- bruke canonical place- og relation-runtime for stedskoblinger;
- skjule tomme seksjoner helt;
- bruke kontrollert initialfallback når et godkjent portrett ikke finnes;
- fungere på mobil, iPad og desktop;
- aldri opprette en parallell personidentitet.

Canonical personsannhet ligger i manifest-lastede filer under `data/people/**`. Popupen presenterer disse dataene. Den skal ikke hente inn en alternativ profil fra rapporter, seed-lister, place-filer eller eksterne tjenester.

## 2. Fast informasjonsrekkefølge

Alle persontyper følger samme overordnede rytme:

1. **Header** — kategori, navn og presis rolle.
2. **Hero** — godkjent portrett eller initialfallback.
3. **Kort ingress** — `desc` når den ikke dupliserer hovedbiografien.
4. **Nøkkelfakta** — rolle, liv, fødested, virkested, nøkkelår, antall bidrag og antall steder.
5. **Handlinger** — liten quizknapp når quiz finnes, deretter sekundære samtale- og notathandlinger.
6. **Om personen** — hele `popupDesc`, med avsnitt bevart.
7. **Verk og bidrag** — strukturerte verk, roller, initiativer, resultater eller historiske handlinger.
8. **Fagprofil** — utdanning, materialer eller arbeidsformer og temaer.
9. **Steder** — canonical steder lest gjennom runtime.
10. **Tilknytninger** — kuraterte relations.
11. **Fortellinger** — stories som er koblet til personen.
12. **Kunnskap** — først etter fullført quiz når knowledge finnes.
13. **Kilder og videre lesning** — inspectable kilder.
14. **Observasjoner** — bare når brukeren faktisk har registrert observasjoner.

Tom informasjon skal ikke erstattes av «ingen verk», «ingen steder» eller lignende. Fravær av data skal gi en kortere og renere popup.

## 3. Felles feltkontrakt

### 3.1 Identitet

Minimum:

```json
{
  "id": "kjersti_wexelsen_goksoyr",
  "name": "Kjersti Wexelsen Goksøyr",
  "initials": "KWG",
  "category": "kunst",
  "kindLabel": "Billedhugger / offentlig kunst"
}
```

Regler:

- `id` er canonical og må være unik i hele people-manifestet;
- `name` er brukerrettet navn;
- `initials` kan oppgis eksplisitt, ellers avledes de fra navnet;
- `category` skal følge canonical domenekontrakt;
- `kindLabel` skal beskrive personens faktiske rolle, ikke bare gjenta kategorien;
- `kind` er legacy-nivå for `ikon`, `institusjonsbærer` eller `kontekst`, ikke en erstatning for faglig rolle.

### 3.2 Korttekst og hovedbiografi

```json
{
  "desc": "Kort og konkret ingress.",
  "popupDesc": "Første biografiske avsnitt.\n\nAndre avsnitt om praksis og hovedbidrag.\n\nTredje avsnitt om stedstilknytningen."
}
```

`popupDesc` skal være en selvstendig, faktabasert biografi. Avsnittstallet bestemmes av stoffets naturlige struktur; tre avsnitt er ikke et krav. Biografien skal formidle dokumenterte livsdata, handlinger, verk, institusjoner og stedstilknytninger uten å forklare hvorfor redaksjonen valgte personen eller hva spilleren skal lære.

Når claim-dekket personlig informasjon finnes, kan `popupDesc` ha ett eller flere tydelige avsnitt om personbakgrunn og privatliv etter reglene i `PEOPLE_PROFILE_CANONICAL.md`. Personlig informasjon skal presenteres som personlig biografi, ikke omskrives til eller skjules som mer karrierehistorie.

### 3.3 Livsdata

Foretrukne felt:

```json
{
  "birth_date": "1945-12-15",
  "death_date": null,
  "birth_place": "Oslo",
  "active_place": "Nittedal",
  "year": 1975
}
```

- komplette datoer lagres som `YYYY-MM-DD` når de er dokumentert;
- bare år kan brukes når full dato ikke er kjent;
- `active_place` er et brukerrettet virkested, ikke nødvendigvis en canonical place-ID;
- `year` er et ankerår for kort og faktarute, ikke en erstatning for livsløp eller tidslinje.

Runtime støtter enkelte eldre aliaser som `birthDate`, `deathDate`, `born`, `died`, `birthYear` og `deathYear`, men nye profiler skal bruke de foretrukne feltene.

### 3.4 Verk og bidrag

`works` er et presentasjonsnøytralt felt. Det betyr ikke bare kunstverk eller bøker. Feltet kan inneholde byggverk, publikasjoner, roller, politiske handlinger, oppfinnelser, idrettsresultater, institusjoner eller andre dokumenterte bidrag.

```json
{
  "works": [
    {
      "id": "oslo_radhus_rolfsen",
      "title": "Arbeidets Norge, Okkupasjonsfrisen og St. Hallvard",
      "year": "1938–1950",
      "material": "fresko",
      "place": "Oslo rådhus",
      "summary": "Tre monumentale veggpartier om arbeid, krig, frigjøring og byidentitet."
    }
  ]
}
```

Hvert bidrag bør ha:

- `id` når bidraget skal kunne spores stabilt;
- `title`;
- `year` eller `date` når relevant;
- `material`, `role`, `place` eller `location` når relevant;
- en kort `summary` som beskriver personens dokumenterte rolle, handling eller bidrag uten vurderende fyll.

Popupen dedupliserer på tittel. Generiske titler som «Arbeid» eller «Bidrag» uten forklaring skal unngås.

### 3.5 Utdanning og faglig bakgrunn

Foretrukket felt:

```json
{
  "education": [
    "Statens håndverks- og kunstindustriskole",
    "Statens kunstakademi"
  ]
}
```

`education` kan inneholde formell utdanning, lære, atelier, trenerløp eller dokumentert faglig opplæring. For personer der formell utdanning er irrelevant eller udokumentert, skal feltet utelates. Det skal ikke fylles med gjetninger.

Runtime støtter aliasene `utdanning` og `training`, men nye profiler skal bruke `education`.

### 3.6 Materialer, arbeidsformer og temaer

```json
{
  "materials": ["granitt", "tre", "bronse"],
  "themes": ["offentlig utsmykking", "portrett", "minnekultur"]
}
```

- `materials` brukes når fysisk materiale, medium, instrument, teknologi eller arbeidsform er faglig relevant;
- politikere, embetspersoner og andre ikke-materielle profiler skal ikke få oppdiktede «materialer»;
- `themes` beskriver personens faktiske fagområder, motiv, problemstillinger eller samfunnsroller;
- `tags` er søke- og koblingsdata og kan supplere visningen, men skal ikke være eneste fagprofil når en rik profil produseres.

Runtime støtter aliasene `materialer`, `media`, `material` og `topics`, men nye profiler skal bruke `materials` og `themes`.

### 3.7 Steder og relasjoner

```json
{
  "placeId": "oslo_radhus",
  "places": ["oslo_radhus", "akershus_festning"]
}
```

Regler:

- `placeId` er primærankeret;
- `places` skal inneholde primærankeret og øvrige dokumenterte canonical steder;
- en tematisk likhet er ikke en person–sted-relasjon;
- en person skal ikke kobles til et sted bare fordi personens fagfelt passer til stedets kategori;
- direkte arbeid, opphold, rolle, verk, hendelse, institusjonstilknytning eller dokumentert biografisk forbindelse må kunne forklares;
- formelle relasjoner skal ligge i relations-systemet, ikke kopieres inn som fritekst i popupkoden.

`getPlacesForPerson` og `getRelationsForPerson` er runtime-sannheten for visningen. Place-seeds og rapporter er ikke parallelle personregistre.

### 3.8 Kilder

Foretrukket form:

```json
{
  "externalLinks": [
    {
      "type": "source",
      "label": "Store norske leksikon – Personnavn",
      "url": "https://snl.no/...",
      "verifiedAt": "2026-07-26"
    }
  ]
}
```

Popupen kan også lese `sources` og `source_urls`, men nye komplette profiler bør bruke `externalLinks` med lesbar label.

- det finnes ikke et fast kildeantall; én direkte, autoritativ kilde kan være sterkere enn flere irrelevante lenker;
- kildedekningen skal vurderes claim for claim etter `PEOPLE_PROFILE_CANONICAL.md`;
- kildene skal dekke både biografi og den konkrete stedskoblingen;
- URL-er må bruke `http` eller `https`;
- interne auditnotater og rapportstier skal ikke vises som brukerrettede kilder;
- kildeantall alene er ikke verifikasjon: hver dato, rolle, produksjon og stedskobling må faktisk støttes av kildematerialet;
- en generell biografiside kan ikke brukes som bevis for et verk eller en produksjon den ikke omtaler;
- PR- eller researchmaterialet skal dokumentere hvilke kilder som støtter hvilke grupper av påstander.
- popupen dedupliserer kilder på normalisert URL, ikke på kombinasjonen URL og label;
- dersom samme URL finnes i både `externalLinks` og `source_urls`, skal den navngitte `externalLinks`-oppføringen beholdes og den bare domenemerkede fallbacken utelates;
- `source_urls` er en kompatibilitetsfallback og skal ikke skape ekstra rader som bare viser `sceneweb.no`, `snl.no` eller andre domenenavn når en lesbar lenke allerede finnes;
- Wikipedia kan registreres som `type: "further_reading"`, men skal normalt ikke være eneste faktakilde eller eneste claim-bevis;
- en Wikipedia-lenke skal ha en lesbar label, for eksempel `Wikipedia – Personnavn`, og skal vises som videre lesning, ikke som institusjonell verifikasjon.

### 3.9 Bilder og initialfallback

Bildekandidater prøves i denne rekkefølgen:

1. `image`
2. `portrait`
3. `portraitImage`
4. `imageCard`
5. `cardImage`
6. `photo`
7. `frontImage`

Når ingen kandidat finnes eller alle feiler, viser popupen initialer, navn og teksten «Portrett ikke registrert».

Regler:

- et ødelagt bildeikon er aldri et gyldig sluttresultat;
- et tomt bilde er bedre enn et feilaktig eller uavklart portrett;
- identitet, lisens, kilde og godkjenning følger `docs/PEOPLE_IMAGES.md`;
- popupen skal aldri bruke et tilfeldig ansikt, et umerket generert portrett eller et bilde av en navnelik person;
- en tydelig stilisert redaksjonell illustrasjon er bare tillatt når den følger den særskilte identitets-, proveniens-, review- og merkingsporten i `docs/PEOPLE_IMAGES.md`.

## 4. Persontypeprofiler

Fellesstrukturen er lik, men hva som regnes som et godt bidrag varierer.

### 4.1 Kunstner, billedhugger og designer

Prioriter utdanning, materialer, teknikk, motiv, hovedverk, offentlige verk, samlinger, bestillere, samarbeid og konkrete steder. Kunstverk skal ha materiale, år og plassering når dette er dokumentert.

### 4.2 Arkitekt, byplanlegger og landskapsarkitekt

Prioriter utdanning, kontor eller samarbeid, stil, materialer, byggverk, planer, restaureringer, institusjoner og forholdet mellom verk og sted. Bygget, institusjonen og arkitekten skal ikke blandes sammen.

### 4.3 Forfatter, dramatiker og litterær aktør

Prioriter sjanger, hovedverk, utgivelser eller oppsetninger, redaksjonelle roller, litterære miljøer, institusjoner, bosteder og konkrete skrive- eller formidlingssteder. `materials` kan utelates; verk og temaer er viktigere.

### 4.4 Musiker, komponist og utøver

Prioriter instrument eller stemme, sjanger, ensembler, verk eller innspillinger, scener, institusjoner, samarbeid, gjennombrudd og betydning for et bestemt musikkmiljø.

### 4.5 Skuespiller, regissør og scenekunstner

Prioriter utdanning, teatre eller kompanier, roller, produksjoner, kunstneriske perioder, ledelsesoppgaver og konkrete scener. En lang liste med alle roller er mindre nyttig enn et kuratert utvalg som forklarer utviklingen.

### 4.6 Politiker, embetsperson og monark

Prioriter embeter, valg, vedtak, taler, kriser, reformer, institusjoner og dokumenterte handlinger. `works` brukes som «bidrag», ikke som kunstverk. Materialfelt skal normalt utelates. Utdanning vises når den er dokumentert og relevant.

### 4.7 Forsker, naturviter og oppfinner

Prioriter fagfelt, utdanning, institusjoner, publikasjoner, funn, teorier, metoder, instrumenter, ekspedisjoner, laboratorier og observerbare spor ved stedet. Vitenskapelige påstander skal ha primære eller institusjonelle kilder når mulig.

### 4.8 Idrettsutøver, trener og sportsleder

Prioriter gren, klubb, trener- eller lederrolle, mesterskap, resultater, rekorder, lag, arenaer, sesonger og historisk betydning. Resultater må dateres og skilles fra senere hedersomtale.

### 4.9 Næringslivsleder, entreprenør og filantrop

Prioriter virksomheter, roller, produkter, investeringer, organisasjoner, donasjoner, institusjoner, arbeidsliv og samfunnsvirkning. Markedsføringstekst skal ikke brukes som biografi.

## 5. Handlingsregler

1. Quizknappen skal være liten, innholdstilpasset og sekundær i heroens handlingsrad.
2. Quizknappen skal fjernes når `QuizEngine` bekrefter at personen ikke har quiz.
3. Quizknappen skal aldri være en fullbredde gul bannerknapp.
4. Samtale og notat skal være sekundære knapper med samme visuelle vekt.
5. Handlinger skal ikke skyve biografien eller verkene ut av første skjermbilde på normal iPad-visning.
6. Popupen skal ikke vise flere primærhandlinger enn brukeren kan forstå uten forklaring.

## 6. Presentasjonsregler

1. Vis bare dokumenterte data.
2. Skjul tomme seksjoner helt.
3. Ikke dupliser samme tekst i `desc`, `popupDesc`, verk og relations uten tydelig funksjon.
4. Ikke vis interne ID-er, auditstatus, researchgjeld eller uverifiserte kandidatnotater.
5. Bevar avsnitt i `popupDesc`.
6. Begrens tema-chipene til et lesbart utvalg; runtime viser maksimalt 14.
7. Verk og bidrag skal ha korte, konkrete beskrivelser.
8. Stedskort skal åpne canonical places.
9. Kilder skal ha lesbare titler, ikke bare rå URL-er når full profil produseres.
10. En person uten bilde skal fortsatt oppleves som en ferdig profil når teksten og dataene er gode.

## 7. Responsivitet og tilgjengelighet

- Popupen skal ha tydelig luft mot skjermkantene.
- Maksbredde er styrt av `.hg-popup-inner`; popupen skal ikke ligge kant til kant på iPad eller desktop.
- Popupen skal ha én intern vertikal scrollflate.
- Lukkeknappen skal være tilgjengelig uten scrolling.
- Heroen kan bruke to kolonner på brede flater, men skal gå over til én kolonne på smale skjermer.
- Alle handlings- og stedselementer skal være faktiske knapper eller lenker.
- Tekst skal være lesbar uten hover.
- Farge skal ikke være eneste signal.
- Lange navn, kildeetiketter og verkstitler skal brytes uten horisontal sidescroll.

## 8. Readiness-modell

`tools/audit-people-popup-readiness.mts` måler bare om runtime kan presentere tilgjengelige canonical felt. Den eier ikke faktaverifikasjon, claims eller ferdigstatus.

Presentasjonsstatusene beholdes for kompatibilitet:

- **complete**;
- **strong**;
- **partial**;
- **sparse**.

Poengsummen skal ikke øke med antall utdanningspunkter, verk, temaer, materialer eller kilder. Tom `education` er en gyldig sluttstatus. Tekstlengde alene er ikke kvalitetsbevis.

`complete` betyr ikke `source_verified`; presentasjonsdekning og faktaverifisering er separate statuser.

Rapporten viser i tillegg produksjonsstatus fra `PEOPLE_PROFILE_CANONICAL.md`. Profiler uten v1-claims er `legacy_unreviewed`, selv når presentasjonsstatusen er `complete`. `ready_people_v1` krever separat claims-fil og bestått canonical validator.

Rapportene skrives til:

- `reports/people-popup-readiness.json`;
- `reports/people-popup-readiness.md`.

## 9. Produksjonskrav

Alle nye eller reviderte profiler følger `docs/PEOPLE_PROFILE_CANONICAL.md`.

Popupkontrakten krever bare at runtime kan skjule manglende felt og presentere dokumenterte data uten tomme bokser. Den krever ikke et bestemt antall avsnitt, verk, utdanningspunkter, temaer, materialer eller kilder.

En profil som er godkjent som `ready_people_v1` skal ha:

- canonical personfil med `profileStandard`, `profileStatus` og `claimsFile`;
- separat claims-fil med identitetsport, claims, feltmapping og setningsmapping;
- bestått faktareview og redaksjonell review;
- dokumenterte person–sted-koblinger;
- godkjent bilde eller bevisst initialfallback;
- bestått `audit:people-profile-canonical`.

Profiler med utilstrekkelige kilder skal få en ærlig produksjonsstatus, ikke fylles for å se komplette ut.

## 10. QA

Ved endring av people-popupen, kontrakten eller readiness-auditen:

1. kjør `node --check js/ui/person-popup-v2.js`;
2. kjør `node --test tests/person-popup-v2.test.js`;
3. kjør `node --test tests/people-popup-system-contract.test.mjs tests/people-profile-canonical.test.mjs tests/factuality-contract.test.mjs`;
4. kjør `npm run audit:people-profile-canonical`;
5. kjør `npm run typecheck:tools`;
6. kjør `npm run build:tools`;
7. kjør `npm run audit:people-popup-readiness`;
8. kjør `bash scripts/check-people.sh`;
9. kjør `npm run build:web:check` når runtime eller CSS endres;
10. kontroller minst én profil med bilde, én med initialfallback, én med mange bidrag og én profil uten quiz;
11. kontroller mobil, smal iPad, bred iPad og desktop før designendringer regnes som ferdige.

## 11. Eierskap

- `data/people/**` eier personinnholdet.
- `data/people/manifest.json` eier hvilke canonical filer runtime laster.
- `js/ui/person-popup-v2.js` eier renderingen.
- `css/person-popup-v2.css` eier presentasjonen.
- `docs/PEOPLE_POPUP_SYSTEM.md` eier runtime-presentasjon, handlinger, feltvisning og fallback.
- `docs/PEOPLE_PROFILE_CANONICAL.md` eier profilproduksjon, claims, feltsemantikk, review og ferdigstatus.
- `docs/FACTUALITY_CONTRACT.md` eier den overordnede regelen om sannhet, kildeverifikasjon, usikkerhet og forbud mot gjetting.
- `docs/people-of-places-method.md` eier relevans- og kildegaten for person–sted-koblinger.
- `docs/PEOPLE_IMAGES.md` eier bilde-, lisens- og identitetskontrakten.
- `tools/audit-people-profile-canonical.mjs` eier v1 claim- og ferdigstatusvalidering.
- `tools/audit-people-popup-readiness.mts` eier bare presentasjons-readiness.
- `tools/audit-people-of-places-status.mts` og `tools/check-people-of-places-gate.mts` eier canonical struktur, stedreferanser og blokkerende people-feil.
