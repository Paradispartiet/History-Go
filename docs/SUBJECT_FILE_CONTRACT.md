# History GO — kontrakt for universelle fagfiler

Status: **canonical og bindende fagfilkontrakt**
Eier: History GO fagdata og kunnskapsarkitektur
Sist kontrollert: **2026-07-26**

Denne kontrakten definerer skillet mellom universell fagstruktur og geografisk innholdsproduksjon. Den gjelder alle fag, ikke bare Historie.

Hvordan de universelle fagfilene materialiseres som synlige fagsider, lærekapitler, claims og ferdigstatus eies av [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md). Denne filen eier fagdataarkitekturen, ikke fagsidens presentasjons- og produksjonsstatus.

## 1. Kjerneprinsipp

History GO skal ha **én universell fagmodell per fag**.

Det skal ikke opprettes egne kopier av fagkart, emner, begreper, teorier eller metoder for hvert land, hver by eller hver region.

De samme canonical fag-ID-ene skal kunne brukes av steder, personer, claims, kilder og quizinnhold i alle geografier.

## 2. Universelle fagfiler

Fagfilene eier:

- fagområder, underområder og emner;
- begreper og semantiske relasjoner;
- teorier og faglige eller historiografiske rammer;
- metoder og analyseformer;
- generelle kilde- og kvalitetskrav;
- faglige avgrensninger og generatorregler;
- universelle ID-er som geografiske innholdslag kan referere til.

Geografi alene er ikke grunn til å kopiere et fagobjekt eller opprette en ny fag-ID.

## 3. Geografiske innholdslag

Land, regioner og byer eier konkret produksjonsinnhold, ikke parallelle fagmodeller. Slike lag kan inneholde:

- hendelser og lokale forløp;
- steder og personer;
- cases og lokal kronologi;
- dokumenterte claims;
- kilder og kildeevidens;
- lokale betegnelser, periodiseringer og konflikter;
- koblinger til universelle emne-, concept-, theory- og method-ID-er;
- quiz-, story- og produksjonsprofiler for området.

De geografiske lagene skal referere til canonical fagobjekter i stedet for å kopiere eller omskrive dem.

## 4. Ingen landvise fagkopier

Følgende mønster er forbudt når filene bare kopierer samme fagmodell:

```text
fagkart_historie_norge.json
fagkart_historie_portugal.json
fagkart_historie_afghanistan.json
```

Dersom filene definerer de samme emnene, begrepene, teoriene og metodene, skal innholdet ligge i én universell fagpakke.

Geografisk variasjon uttrykkes gjennom profiler, mappings, cases, claims, kilder, steder, personer og quizproduksjon.

## 5. Geografiske profiler

En geografisk profil er tillatt når den beskriver hvordan et universelt fag realiseres i et område.

Konseptuelt mønster:

```text
data/fag/profiles/<subject_id>/<geography_id>/
```

eller et annet manifeststyrt profil-/mappinglag med samme ansvar.

Profilen kan angi:

- relevante universelle emner;
- lokale steder, personer og cases;
- tilgjengelige claims og kilder;
- lokal tidsavgrensning og terminologi;
- målt produksjonsdekning og dokumenterte hull.

Profilen må ikke bli en ny sannhetskilde for universelle fagdefinisjoner, teorier eller begreper.

## 6. To forskjellige dekningsmål

### Universell fagdekning

Måler om fagmodellen dekker fagets nødvendige områder, emner, begreper, teorier og metoder. Dette vurderes uavhengig av hvor mye innhold som finnes i én by eller ett land.

### Geografisk produksjonsdekning

Måler om et område har nok dokumenterte steder, personer, claims, kilder, cases og quizer til å realisere den universelle fagmodellen.

Et fag kan være universelt dekkende selv om Portugal-laget mangler innhold. Da er Portugal-produksjonen ufullstendig; det skal ikke opprettes et eget portugisisk historiefag.

Omvendt beviser mange Oslo-cases ikke at selve fagmodellen er heldekkende.

## 7. Geografiske felt i eksisterende fagfiler

Felt som `recommended_oslo_cases`, bynavn i fagfilnavn eller `scope: oslo_og_omegn` er geografisk profilinformasjon. De kan beholdes som compatibility-data under kontrollert migrering, men skal på sikt skilles fra den universelle fagstrukturen.

De skal ikke brukes som presedens for å lage komplette fagkopier for nye land.

## 8. ID- og gjenbruksregel

- Ett faglig fenomen skal ha én canonical ID innen faget.
- Geografiske lag skal referere til denne ID-en.
- Lokale synonymer kan lagres som alias eller kildebelagt lokal betegnelse.
- En reell faglig forskjell kan få eget objekt når definisjon og avgrensning er dokumentert.
- Geografi alene er ikke tilstrekkelig grunn til en ny fag-ID.

## 9. Manifest og runtime

Aktive fagfiler løses gjennom:

```text
data/fag/fag_manifest.json
```

Manifestet skal peke til én canonical fagpakke per `subjectId`. Geografiske profiler registreres som profiler, mappings eller produksjonsmål, ikke som konkurrerende hovedpakker.

Runtime, quizproduksjon og Knowledge skal bruke canonical fag-ID-er uavhengig av geografi. En geografisk profil kan avgrense eller prioritere lokalt innhold, men kan ikke overstyre canonical fagobjekters definisjoner eller identitet.

## 10. Produksjonsregel

Før en ny fagfil eller geografisk variant opprettes:

1. Søk etter eksisterende canonical fagobjekt og ID.
2. Avgjør om endringen gjelder universell fagstruktur eller geografisk produksjonsinnhold.
3. Oppdater den universelle fagpakken dersom selve faget mangler et område.
4. Oppdater geografisk profil, case, claim, kilde, sted, person eller quiz dersom mangelen er lokal.
5. Ikke kopier hele fagpakker for å få lokal dekning.
6. Registrer aktive filer i riktig manifest.
7. Kjør relevante fag-, Knowledge-, quiz- og dokumentasjonsporter.

## 11. Beslutningstest

> Ville objektets faglige definisjon vært den samme dersom stedet eller landet ble byttet ut?

- **Ja:** Objektet hører normalt hjemme i den universelle fagpakken.
- **Nei, fordi det er et konkret lokalt forløp, en hendelse, kilde eller sted:** Objektet hører normalt hjemme i et geografisk innholdslag.
- **Nei, fordi ulike fagtradisjoner faktisk bruker ulike analytiske begreper:** Dokumenter de distinkte begrepene og relasjonene, men ikke lag en hel landkopi av faget.

## 12. Målarkitektur

```text
universell fagpakke
  + geografisk profil/mapping
  + lokale cases, claims, kilder, steder, personer og quiz
```

Ikke:

```text
ett komplett fag per land
```

## 13. Casekrav, profiler og evidensregistre

Universelle emner kan definere geografinøytrale `case_requirement_ids`. Kravene beskriver hva et konkret case må kunne dokumentere, men er ikke selv lokale cases.

Konkrete cases skal ligge i geografiske profiler. Claims, kilder og stedsevidens skal ligge i canonical registre med stabile ID-er og referanser til universelle emne-ID-er.

Den operative Historie-kontrakten håndheves av de canonical casekrav-, profil-, claim-, kilde- og stedsevidensregistrene samt de permanente validatorene.
