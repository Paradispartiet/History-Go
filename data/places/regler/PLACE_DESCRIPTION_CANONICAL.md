# History Go – canonical regler for `desc` og `popupDesc`

Status: aktiv og bindende  
Versjon: 2.0 – fakta først  
Maskinlesbar mal: `data/places/regler/place_description_templates_v1.json`

## 1. Hovedregel

`desc` og `popupDesc` er førstelinjeinformasjon. De skal først og fremst gi spilleren **fakta, kunnskap og underholdende detaljer om stedet**.

De skal ikke brukes som små fagartikler, læringsmål eller forklaringer på hvorfor stedet passer i en kategori. Faglig tolkning, større samfunnssammenhenger og koblinger til i dag kan utdypes i **Mer info**, quiz, Wonderkammer og **People-popup**.

God stedstekst svarer raskt på spørsmål som:

- Hva er dette?
- Når ble det laget, åpnet, brukt eller endret?
- Hvem bygde, drev, oppdaget, skrev, spilte eller handlet her?
- Hva skjedde her?
- Hva er spesielt, overraskende eller minneverdig?

## 2. Informasjonshierarkiet

### Førstelinje: `desc`

`desc` skal gi de viktigste og mest interessante faktaene med en gang.

Normal målramme:

- 16–45 ord
- 1–2 setninger
- minst to konkrete fakta når kildegrunnlaget tillater det

Prioriter:

1. hva stedet er;
2. årstall eller periode;
3. navngitt person, institusjon, verk, produkt, art eller hendelse;
4. den detaljen som skiller stedet fra andre steder.

`desc` skal ikke begynne med analyse. Unngå åpninger som «stedet viser hvordan», «stedet symboliserer», «stedet knytter sammen» eller «stedet gjør det mulig å forstå».

### Andrelinje: `popupDesc`

`popupDesc` skal gi flere konkrete fakta og én eller flere detaljer som gjør stedet interessant å lese om.

Normal målramme:

- 45–130 ord
- 2–6 setninger
- minst fire konkrete fakta når kildegrunnlaget tillater det

Den kan utdype:

- en hendelse eller episode;
- hvem som stod bak;
- byggemåte, materiale, mål, instrument, produkt, art eller verk;
- hva stedet faktisk ble brukt til;
- en dokumentert overraskelse, konflikt, rekord, feil, flytting eller forandring.

`popupDesc` skal tilføre ny informasjon, ikke bare omskrive `desc`. Den skal heller ikke avsluttes med en obligatorisk læresetning om samfunn, identitet, systemer eller vår tid.

### Utfyllende lag: Mer info og People-popup

Dette er riktig sted for:

- større historisk og faglig sammenheng;
- årsaker og konsekvenser;
- koblinger til andre steder, personer og emner;
- konflikter og ulike tolkninger;
- hva stoffet betyr i dag;
- personens liv, verk, nettverk og etterliv;
- pedagogiske innganger og videre læring.

Slike koblinger kan nevnes i `desc` eller `popupDesc` når de selv er et sentralt faktum, men de skal ikke være standard førstelinjeinformasjon.

## 3. Fakta som teller

Konkrete fakta kan være:

- navngitt person, gruppe eller institusjon;
- årstall eller avgrenset tidsrom;
- hva stedet var eller er brukt til;
- hendelse, vedtak, produksjon, forestilling, kamp eller oppdagelse;
- arkitekt, kunstner, forsker, eier, utøver eller grunnlegger;
- materiale, mål, form, art, instrument, maskin eller produkt;
- verk, vare, rute, rekord eller resultat;
- konkret skade, brann, flytting, restaurering eller ombygging;
- uventet eller morsom dokumentert detalj.

Kategori, epoke, underbadge, identitet, «betydning» og andre abstrakte etiketter teller ikke som fakta alene.

## 4. Underholdning uten oppdiktning

Tekstene skal gjerne være morsomme, overraskende eller dramatiske, men underholdningen skal komme fra kildene.

Bruk:

- gode kontraster;
- presise tall og størrelser;
- merkelige eller uventede hendelser;
- konkrete menneskelige valg;
- rekorder, feil, konflikter og tilfeldigheter;
- detaljer som er lette å huske.

Ikke dikt opp dialog, tanker, publikumss reaksjoner, vær, lyder eller stemning dersom kildene ikke støtter det.

## 5. Kategoriene velger fakta – ikke fortellerform

Kategorimalene skal hjelpe redaktøren å finne relevante faktatyper. De skal **ikke** tvinge teksten inn i en bestemt analyse eller fortelling.

Eksempler:

- `by`: bygg, arkitekt, byggeår, funksjon, materiale, mål, transportløsning, ombygging eller kjent hendelse;
- `historie`: hendelse, dato, aktør, handling og rest;
- `kunst`: verk, kunstner, år, materiale, størrelse, teknikk og plassering;
- `naeringsliv`: bedrift, grunnlegger, produkt, etableringsår, produksjon, marked og konkret omstilling;
- `vitenskap`: forsker, institusjon, spørsmål, instrument, metode, funn og anvendelse;
- `natur`: navngitte arter, naturtype, geologi, sesong, atferd og observerbare kjennetegn.

Det er ikke et krav at alle næringslivstekster skal handle om arbeid, alle vitenskapstekster om metode eller alle bytekster om hverdagsbevegelse. Det mest interessante og best dokumenterte ved stedet skal komme først.

## 6. Forbudt redaksjonelt språk i brukerteksten

Følgende hører aldri hjemme i `desc` eller `popupDesc`:

- «I History Go bør …»;
- hvilken kategori eller quizvinkel stedet skal ha;
- hvorfor redaksjonen har valgt stedet;
- koordinatstatus, geometri, kildeinnhenting eller validering;
- instruksjoner til produsenten eller spilleren;
- påstander om hva spilleren «skal forstå».

## 7. Variasjon

Variasjon skal komme fra forskjellige fakta, ikke fra mekanisk bytte av fortellermal.

- Ikke bruk samme åpning på alle stedene.
- Ikke avslutt alle popuptekster med en generell konklusjon.
- Ingen tekst skal kunne flyttes til et annet sted ved bare å bytte egennavnet.
- Hvert sted bør ha minst ett faktum som ikke passer på nabostedet.

## 8. Kilde- og sannhetsregel

- Alle faktiske påstander skal støttes av stedets inspectable kilder eller annet godkjent kildegrunnlag i oppføringen.
- Ved svak kildebase skal teksten være kort og presis.
- Ikke fyll manglende kunnskap med generelle setninger om identitet, samfunn, systemer eller utvikling.
- Koordinat- og produksjonsnotater skal ligge i sine egne felt.

## 9. Ferdigkriterium per sted

Et sted er ferdig når:

- `desc` gir de viktigste faktaene raskt;
- `popupDesc` tilfører flere fakta og minst én minneverdig detalj;
- tekstene er stedsspesifikke og kildebelagte;
- kategorien hjelper faktavalget uten å dominere språket;
- teksten er interessant uten oppdiktning;
- redaksjonell, pedagogisk og teknisk metatekst er holdt utenfor;
- utfyllende tolkning og kobling til i dag er overlatt til Mer info, quiz, Wonderkammer eller People-popup når det er mest naturlig.
