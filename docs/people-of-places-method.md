# People of Places — metode og kvalitetsstandard

Status: **canonical redaksjonell metode for person–sted-koblinger**  
People-manifest: [`../data/people/manifest.json`](../data/people/manifest.json)  
Data-/manifestkontrakt: [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)  
Faktisitetskontrakt: [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md)  
Audit: [`../tools/audit-people-of-places-status.mts`](../tools/audit-people-of-places-status.mts)  
Blokkerende gate: [`../tools/check-people-of-places-gate.mts`](../tools/check-people-of-places-gate.mts)  
Sist kontrollert: **2026-07-27**

Dette dokumentet eier den redaksjonelle arbeidsmetoden for å knytte personer til konkrete History GO-steder. Canonical people-filer eier dataene, manifestet eier aktiveringen, auditene eier maskinkontrollen, og Civication-builderen eier den avledede History People-indeksen.

## Bindende faktisitetsgate

Denne metoden er underlagt [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md). En person–sted-kobling skal aldri opprettes fordi den virker sannsynlig, fordi personen arbeidet i samme bransje, eller fordi koblingen gir bedre dekning.

Hver kobling må ha en inspectable kilde som dokumenterer den konkrete forbindelsen. Kilden skal leses og må faktisk støtte rollen, perioden, hendelsen, verket eller oppholdet som dataene uttrykker. En generell personbiografi uten omtale av stedet er ikke tilstrekkelig. En språkmodell, tidligere History GO-tekst eller kandidatrapport er ikke en faktakilde.

Hvis forbindelsen ikke kan verifiseres, skal kandidaten avvises eller feltet utelates.

## Formål

People of Places skal bygge et relevant persongalleri rundt hvert sted. Arbeidet er ikke en ren dekningsøvelse, og et sted regnes ikke som ferdig bare fordi det har fått én teknisk gyldig People-kobling.

Hver kobling skal hjelpe brukeren å forstå hvem som skapte, bygget, drev, brukte, bodde på, arbeidet ved, opptrådte på, forsket ved, organiserte rundt eller på annen måte formet det konkrete stedet.

## Målregel og faktisk CI-gate

### Canonical redaksjonell målregel

Alle canonical steder som omfattes av en vedtatt People of Places-dekningsrunde skal ha minst ett relevant personanker. Natursteder eller andre særgrupper kan føres i egne dekningsrunder når dette er eksplisitt besluttet.

Dekning er underordnet relevans. En svak personkobling skal aldri brukes bare for å lukke et hull.

### Dagens maskinhåndheving

`npm run audit:people-of-places` bygger statusrapporten og blokkerer per nå:

- dupliserte people-ID-er;
- ugyldige place-referanser;
- personer uten gyldig primæranker;
- personer med tomt `places`-array.

Auditen rapporterer også schemaavvik, svake `places`-strukturer, manglende bilder, geografisk filstruktur og anbefalt neste batch.

Dagens gate beregner ikke full place-for-place-dekning og kan ikke avgjøre om en kobling er historisk relevant eller kildebelagt. Full dekningsstatus og relevans må derfor dokumenteres i batchen til en egen coverage-gate er implementert.

## Prioritering av personer

For hvert sted skal researchen normalt følge denne rekkefølgen:

1. Grunnleggere, etablerere og initiativtakere.
2. Arkitekter, kunstnere, forfattere, designere eller andre skapere av stedet eller et fysisk verk på stedet.
3. Eiere, direktører, kunstneriske ledere, redaktører, forskningsledere eller andre dokumenterte nøkkelpersoner i stedets drift og utvikling.
4. Personer som bodde eller arbeidet på stedet over tid.
5. Utøvere, politikere, forskere, aktivister eller andre som gjennom en tydelig dokumentert hendelse eller periode fikk en særskilt tilknytning til stedet.
6. Eponymer og personer som stedet, et monument, et blått skilt eller et annet fysisk minnespor uttrykkelig er viet til.

Tilfeldige besøk, enkeltopptredener eller generell tilhørighet til samme by, bransje eller miljø er ikke tilstrekkelig.

## Nye personer og gjenbruk

### Nye canonical People foretrekkes når

- stedet har en dokumentert grunnlegger, skaper, arkitekt, eier, leder, beboer eller annen sentral aktør som ikke finnes fra før;
- personen tilfører en reell ny historisk eller faglig inngang til stedet;
- eksisterende People-records ikke dekker den aktuelle aktøren;
- personen kan dokumenteres med en direkte stedstilknytning.

### Eksisterende People skal gjenbrukes når

- samme person allerede finnes med én entydig canonical ID;
- den nye stedskoblingen er direkte og godt dokumentert;
- gjenbruk ikke forringer eller forfalsker personens primære stedstilknytning.

Det skal aldri opprettes en duplikat-ID bare for å gi personen et nytt sted.

Før ny record opprettes skal det søkes etter:

- canonical ID;
- fullt navn;
- navnevarianter og alternative skrivemåter;
- forekomster i både aggregate-filer og enkeltfiler;
- eksisterende `placeId`, `source_place_id` og `places`;
- unlistede eller eldre People-filer som kan inneholde en record som må migreres i stedet for dupliseres.

## Primæranker og sekundære steder

For standard people-schema er `placeId` personens primære anker og skal uttrykke den sterkeste eller mest etablerte canonical stedstilknytningen i datasettet.

Enkelte eksisterende datasett bruker særskilte schemaer, særlig `source_place_id` i næringsliv og `collectionGroup` for filantroper. Disse skal ikke normaliseres lokalt uten en eksplisitt schema-/migreringsendring. Auditen kjenner disse avvikene og rapporterer uventet blanding.

Når en eksisterende person gjenbrukes:

- behold korrekt eksisterende primæranker;
- legg det nye stedet til i `places` der standard-schemaet bruker dette feltet;
- oppdater beskrivelse, tags og kilder bare når den nye koblingen trenger dokumentasjon;
- ikke flytt primærankeret uten en egen faglig vurdering.

Når en ny standard-record opprettes for et sted, skal det aktuelle stedet normalt være både `placeId` og første verdi i `places`.

## Dokumentasjonskrav

En People-kobling må dokumentere minst én av følgende:

- fysisk arbeid eller virksomhet på stedet;
- etablering, bygging, utforming eller finansiering av stedet;
- dokumentert bosted eller arbeidssted;
- fast eller langvarig leder-, eier- eller utøverrolle;
- navngitt historisk hendelse på stedet;
- et fysisk verk, monument, minnesmerke, gravsted eller blått skilt knyttet til personen;
- eksplisitt institusjonell tilknytning som er sterkere enn generell bransje- eller bytilhørighet.

Kildene skal så langt som mulig prioriteres slik:

1. Stedets eller institusjonens egne historikksider.
2. Offentlige registre, museer, arkiver og kommunale kilder.
3. Faglig anerkjente oppslagsverk og biografiske verk.
4. Etablerte redaksjonelle medier.
5. Andre kilder bare når de kan kontrolleres mot mer autoritativ dokumentasjon.

Kildene skal underbygge selve stedskoblingen, ikke bare personens generelle biografi. Kildeantall er ikke nok: batchen skal dokumentere hvilken kilde som støtter hvilken forbindelse, rolle, periode eller hendelse.

Når people-schemaet har `source_urls`, skal disse lagre kildene. Dersom et aktivt legacy-schema mangler dette feltet, skal batchen fortsatt dokumentere kildene i PR-/researchmaterialet og ikke finne på et lokalt konkurrerende schema.

## Kollektive miljøankre

Kollektive miljøankre kan brukes når miljøet faktisk er det historiske subjektet, for eksempel et dokumentert kunstnerkollektiv, en organisert scene, et aktivistmiljø eller et publikumsmiljø som har formet stedet.

De skal ikke brukes som en bekvem erstatning når en navngitt grunnlegger, skaper, leder eller annen sentral person kan dokumenteres.

Før et kollektiv opprettes skal det undersøkes om stedet kan representeres bedre av én eller flere faktiske personer.

## Ugyldige eller svake koblinger

Følgende skal ikke brukes alene:

- generell Oslo- eller bytilknytning;
- generell tilknytning til samme kategori eller bransje;
- at personen har vært gjest, kunde eller tilfeldig besøkende;
- én enkelt opptreden uten særskilt historisk betydning;
- løse formuleringer som «knyttet til», «forbundet med» eller «viktig for miljøet» uten presis dokumentasjon;
- en kjent person valgt bare fordi vedkommende gjør stedet mer attraktivt;
- gjenbruk av en eksisterende person når koblingen til det nye stedet er svakere enn datamodellen antyder;
- duplikater av eksisterende canonical personer.

## Antall personer per sted

Ett relevant personanker er minimum i en vedtatt dekningsrunde, ikke nødvendigvis sluttpunktet.

Et sted bør få flere personer når de representerer forskjellige og vesentlige roller, for eksempel:

- grunnlegger og arkitekt;
- kunstner og oppdragsgiver;
- eier og sentral arbeider eller fagperson;
- institusjonsbygger og markant utøver;
- historisk aktør og senere minne- eller formidlingsaktør.

Det skal ikke legges til mange personer bare for volum. Hver record må bestå samme relevansgate.

## Arbeidsflyt per sted

1. Les canonical place-recorden og fastslå hva stedet faktisk representerer.
2. Auditér eksisterende manifest-loadede People-data, aktuelle legacyfiler og navnevarianter.
3. Finn mulige personer etter prioriteringsrekkefølgen ovenfor.
4. Åpne og les autoritative kilder, og dokumenter den konkrete stedstilknytningen påstand for påstand.
5. Avvis kandidater som bare har løs eller generell tilknytning.
6. Bestem om personen skal gjenbrukes, migreres eller opprettes som ny canonical record.
7. Kontroller relevante schemafelt, normalt `id`, `name`, `placeId`, `places`, `category`, `year`, beskrivelser, tags og `source_urls`.
8. Oppdater People-manifestet bare for nye eller migrerte canonical filer.
9. Bygg Civication History People-indeksen på nytt.
10. Regenerer deknings- og kvalitetsrapportene.
11. Kjør People-gaten og øvrige relevante repository-kontroller.
12. Merge bare når data, indeks, rapporter og CI er konsistente.

Aktive kommandoer:

```bash
npm run audit:people-of-places
npm run civication:history-people:build
npm run civication:history-people:check
npm run tools:check
```

## Minimumskrav til en People-record

En ny eller vesentlig endret standard-record skal ha:

- unik og stabil `id`;
- korrekt navn og initialer når feltet brukes;
- presis `desc`;
- relevante og normaliserte tags;
- gyldig primæranker;
- korrekt `category` eller gjeldende collection-schema;
- et faglig forsvarlig `year` når år brukes;
- en `popupDesc` som forklarer den konkrete stedskoblingen;
- `places` med dokumenterte canonical steder når schemaet bruker feltet;
- `source_urls` når schemaet har feltet;
- `verifiedAt` når gjeldende produksjonsstandard krever det.

Beskrivelsen skal ikke overdrive personens rolle eller gjøre en sekundær tilknytning til en primær.

## Batch-gate

Hver batch skal dokumentere:

- hvilke steder som behandles;
- hvilke eksisterende personer som gjenbrukes;
- hvilke nye personer som opprettes;
- hvilke legacy-records som migreres;
- hvilke kandidater som ble avvist og hvorfor, når dette er relevant;
- at duplikatsøk er gjennomført;
- hvilke inspectable kilder som faktisk er lest;
- hvilke navn, datoer, roller, verk, perioder og stedskoblinger hver kilde støtter;
- hvilke detaljer som ble utelatt eller avvist fordi de ikke kunne verifiseres;
- at ingen felt er fylt for å øke dekning, readiness eller profilens visuelle fylde;
- at alle place-referanser er gyldige;
- at primærankere og `places` er konsistente med gjeldende schema;
- at runtime-/Civication-indeksen er regenerert når berørt;
- at dekningsrapporten viser forventet endring;
- at People-validering og øvrige relevante kontroller passerer.

En batch skal ikke merges med midlertidige materialiseringsfiler, feillogger eller workflow-hjelpefiler i den endelige diffen.

## Kvalitetseksempler

### Naturlig gjenbruk

- En eksisterende forfatter kan gjenbrukes for en plass som bærer forfatterens navn, dersom navngivningen og personens konkrete tilknytning til stedet er dokumentert.
- En eksisterende kunstner kan få et mausoleum eller et offentlig verk lagt til i `places` uten at det opprinnelige primærankeret flyttes.

### Ny person er bedre enn kollektivt anker

- Et spill- eller kulturhus bør representeres av en dokumentert grunnlegger eller etablerer når denne finnes, fremfor et generisk «miljø».
- En standupscene bør representeres av den dokumenterte grunnleggeren når scenens historie selv identifiserer vedkommende, fremfor et generisk standupmiljø.

### Avvisning

- En kjent komiker skal ikke knyttes til en humorscene bare fordi personen har opptrådt der.
- En politiker skal ikke knyttes til et strøk bare fordi vedkommende bodde i samme by.
- En forfatter skal ikke knyttes til et bibliotek uten dokumentert arbeid, arrangement, samling, minnespor eller annen særskilt tilknytning.

## Vedlikehold

Metoden skal oppdateres når datamodellen, manifeststrukturen, valideringsscript, Civication-indexbygger eller dekningspolicy endres.

Endringer som svekker relevanskravet, tillater generiske koblinger eller senker dokumentasjonskravet skal behandles som en eksplisitt metodeendring, ikke som en lokal batchavgjørelse. Ingen lokal metodeendring kan overstyre `FACTUALITY_CONTRACT.md`.

Dersom full place-for-place coverage blir CI-håndhevet senere, skal både denne metoden, auditrapportens schema og `check-people-of-places-gate.mts` oppdateres i samme PR.
