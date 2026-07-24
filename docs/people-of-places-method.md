# People of Places – metode og kvalitetsstandard

Denne filen er den autoritative arbeidsmetoden for å knytte personer til steder i History Go.

## Formål

People of Places skal bygge et relevant persongalleri rundt hvert sted. Arbeidet er ikke en ren dekningsøvelse, og et sted regnes ikke som ferdig bare fordi det har fått én teknisk gyldig People-kobling.

Hver kobling skal hjelpe brukeren å forstå hvem som skapte, bygget, drev, brukte, bodde på, arbeidet ved, opptrådte på, forsket ved, organiserte rundt eller på annen måte formet det konkrete stedet.

## Hovedregel

Alle canonical steder som omfattes av gjeldende dekningsgate skal ha minst én gyldig People-kobling. Natursteder kan føres i en separat gate når prosjektet bestemmer det.

Dekning er underordnet relevans. En svak personkobling skal ikke brukes for å lukke et hull.

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
- eksisterende `placeId` og `places`;
- unlistede eller eldre People-filer som kan inneholde en record som må migreres i stedet for dupliseres.

## Primæranker og sekundære steder

`placeId` er personens primære anker og skal uttrykke den sterkeste eller mest etablerte canonical stedstilknytningen i datasettet.

Når en eksisterende person gjenbrukes:

- behold korrekt eksisterende `placeId`;
- legg det nye stedet til i `places`;
- oppdater beskrivelse, tags og kilder bare når den nye koblingen trenger dokumentasjon;
- ikke flytt primærankeret uten en egen faglig vurdering.

Når en ny person opprettes for et sted, skal det aktuelle stedet normalt være både `placeId` og første verdi i `places`.

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

Kildene skal underbygge selve stedskoblingen, ikke bare personens generelle biografi.

## Kollektive miljøankre

Kollektive miljøankre kan brukes når miljøet faktisk er det historiske subjektet, for eksempel et dokumentert kunstnerkollektiv, en organisert scene, et aktivistmiljø eller et publikumsmiljø som har formet stedet.

De skal ikke brukes som en bekvem erstatning når en navngitt grunnlegger, skaper, leder eller annen sentral person kan dokumenteres.

Før et kollektiv opprettes skal det derfor undersøkes om stedet kan representeres bedre av én eller flere faktiske personer.

## Ugyldige eller svake koblinger

Følgende skal ikke brukes alene:

- generell Oslo-tilknytning;
- generell tilknytning til samme kategori eller bransje;
- at personen har vært gjest, kunde eller tilfeldig besøkende;
- én enkelt opptreden uten særskilt historisk betydning;
- løse formuleringer som «knyttet til», «forbundet med» eller «viktig for miljøet» uten presis dokumentasjon;
- en kjent person valgt bare fordi vedkommende gjør stedet mer attraktivt;
- gjenbruk av en eksisterende person når koblingen til det nye stedet er svakere enn datamodellen antyder;
- duplikater av eksisterende canonical personer.

## Antall personer per sted

Ett relevant personanker er minimum, ikke nødvendigvis sluttpunktet.

Et sted bør få flere personer når de representerer forskjellige og vesentlige roller, for eksempel:

- grunnlegger og arkitekt;
- kunstner og oppdragsgiver;
- eier og sentral arbeider eller fagperson;
- institusjonsbygger og markant utøver;
- historisk aktør og senere minne- eller formidlingsaktør.

Det skal ikke legges til mange personer bare for volum. Hver record må bestå samme relevansgate.

## Arbeidsflyt per sted

1. Les canonical place-recorden og fastslå hva stedet faktisk representerer.
2. Auditér eksisterende People-data, manifest og navnevarianter.
3. Finn mulige personer etter prioriteringsrekkefølgen ovenfor.
4. Dokumenter den konkrete stedstilknytningen med autoritative kilder.
5. Avvis kandidater som bare har løs eller generell tilknytning.
6. Bestem om personen skal gjenbrukes, migreres eller opprettes som ny canonical record.
7. Kontroller `id`, `name`, `placeId`, `places`, `category`, `year`, beskrivelser, tags og `source_urls`.
8. Oppdater People-manifestet bare for nye eller migrerte canonical filer.
9. Bygg Civication People-indeksen på nytt.
10. Regenerer relevante deknings- og kvalitetsrapporter.
11. Kjør People-gaten og øvrige relevante repository-kontroller.
12. Merge bare når data, indeks, rapporter og CI er konsistente.

## Minimumskrav til en People-record

En ny eller vesentlig endret record skal ha:

- unik og stabil `id`;
- korrekt navn og initialer;
- presis `desc`;
- relevante og normaliserte tags;
- riktig `placeId`;
- korrekt `category`;
- et faglig forsvarlig `year` når år brukes;
- en `popupDesc` som forklarer den konkrete stedskoblingen;
- `places` med alle dokumenterte canonical steder;
- `source_urls` som dokumenterer stedskoblingen;
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
- at alle place-referanser er gyldige;
- at runtime-indeksen er regenerert;
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
- En politiker skal ikke knyttes til et strøk bare fordi vedkommende bodde i Oslo.
- En forfatter skal ikke knyttes til et bibliotek uten dokumentert arbeid, arrangement, samling, minnespor eller annen særskilt tilknytning.

## Vedlikehold

Metoden skal oppdateres når datamodellen, manifeststrukturen, valideringsscript eller dekningspolicy endres.

Endringer som svekker relevanskravet, tillater generiske koblinger eller senker dokumentasjonskravet skal behandles som en eksplisitt metodeendring, ikke som en lokal batchavgjørelse.
