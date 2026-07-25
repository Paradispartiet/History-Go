# History Go – canonical regler for `desc` og `popupDesc`

Status: aktiv og bindende revisjonsgrunnmur  
Maskinlesbar mal: `data/places/regler/place_description_templates_v1.json`

## 1. Formål

Stedstekstene skal være faglige uten å høres ut som varianter av samme akademiske standardsats. Fagligheten skal bæres av konkrete mennesker, handlinger, hendelser, gjenstander, arter, materialer, lyder, valg og konsekvenser.

Dette revisjonssporet retter særlig tekster som gjentar formuleringer som:

- «viser hvordan …»
- «er et viktig spor etter …»
- «gjør … lesbart»
- «representerer overgangen fra …»
- «er et institusjonelt tyngdepunkt»
- «er et møte mellom …»

Ordene er ikke totalforbudt. De skal bare brukes når de er den mest presise formuleringen, ikke som automatisk avslutning.

## 2. Feltkontrakten

### `desc`

`desc` er inngangen på stedskortet.

Normal målramme:

- 28–58 ord
- 1–3 setninger
- minst to konkrete opplysninger

Den skal:

1. identifisere stedet gjennom en handling, person, hendelse, fysisk detalj eller faktisk bruk;
2. gi spilleren én minneverdig grunn til å åpne stedet;
3. kunne forstås uten fagordliste;
4. være kortere og mer konsentrert enn `popupDesc`.

`desc` skal åpne en dør, ikke forklare hele stedet.

### `popupDesc`

`popupDesc` er den korte stedfortellingen.

Normal målramme:

- 75–155 ord
- 3–7 setninger
- minst fire konkrete elementer

Den skal:

1. tilføre vesentlig ny informasjon utover `desc`;
2. inneholde handling eller endring: noe ble laget, brukt, bestemt, oppdaget, flyttet, bestridt, framført, ødelagt eller omformet;
3. gi minst én detalj som skaper et tydelig bilde, lyd, bevegelse, overraskelse eller spørsmål;
4. forklare den faglige betydningen gjennom stoffet, ikke erstatte stoffet med en etikett.

`popupDesc` skal aldri være identisk med `desc`.

## 3. Konkrete elementer

Et konkret element kan være:

- navngitt person, gruppe eller institusjon;
- årstall eller tydelig tidsrom;
- hendelse, beslutning eller arbeidsprosess;
- materiale, form, lyd, art, instrument eller fysisk detalj;
- lokal hverdagsbruk;
- før-og-nå-endring;
- konflikt, risiko, tap eller omstridt valg;
- uventet detalj;
- konsekvens for mennesker eller sted.

Kategori, epoke, underbadge og fagbegrep teller ikke alene som konkrete elementer.

## 4. Vis først, forklar etterpå

Svakt:

> Terminalen er et viktig spor etter byens overgang til bussbasert mobilitet.

Bedre retning:

> På 1990-tallet samlet Criciúma bussrutene i en ny terminal midt i sentrum. Den tok over jernbanens gamle rolle som stedet der byens reiser ble koblet sammen.

Det faglige poenget er fortsatt der, men kommer gjennom tid, handling, funksjon og konsekvens.

## 5. Kategorimalene

Den maskinlesbare filen angir for hver kategori:

- et kjernespørsmål;
- hvilke typer detaljer teksten bør hente;
- flere mulige fortellermønstre;
- typiske tomme formuleringer som bør unngås.

Malene er fortellermotorer, ikke setningsskjemaer. Dersom ti steder følger samme rekkefølge – «før», «så», «i dag» – har malen skapt et nytt problem.

## 6. Batchregler mot ensformighet

Ved revisjon skal teksten vurderes som del av en batch.

- Samme åpningstype bør ikke brukes mer enn to ganger i en batch på ti.
- Ordene `akse`, `spor`, `overgang`, `identitet`, `knutepunkt`, `tyngdepunkt`, `lesbart`, `transformasjon` og `samfunnsutvikling` skal telles.
- Minst én tekst bør åpne med en person eller gruppe, én med en fysisk detalj, én med en handling og én med en hendelse når kildene tillater det.
- Ikke la alle popuptekster følge samme kronologiske struktur.
- Ingen tekst skal kunne flyttes til et annet sted ved bare å bytte egennavnet.

## 7. Kilde- og sannhetsregel

Underholdningsverdi betyr ikke oppdiktning.

- Alle faktiske påstander skal støttes av stedets inspectable kilder.
- Atmosfære kan bygges av dokumenterte handlinger, materialer, bruk og konsekvenser.
- Ikke dikt opp dialog, tanker, folkemengder, reaksjoner eller sanseinntrykk kildene ikke gir grunnlag for.
- Ved svak kildebase skal teksten være kortere og presis, ikke fylles med generiske fagsetninger.
- Koordinatstatus, geometriarbeid og interne valideringsnotater hører i coordinate-evidence-feltene, ikke i brukerrettet `popupDesc`.

## 8. Revisjonsrekkefølge

1. Kjør beskrivelsesauditen og lag baseline.
2. Prioriter steder der `desc === popupDesc`.
3. Prioriter deretter svært korte og formelbaserte tekster.
4. Revider kategori for kategori i avgrensede batcher.
5. Kontroller kilder, fakta, variasjon og UI-lengde.
6. Oppdater auditrapporten etter hver merge.

## 9. Ferdigkriterium per sted

Et sted er ferdig når:

- `desc` og `popupDesc` har forskjellige roller;
- begge er stedsspesifikke;
- teksten bruker kategoriens faglige blikk uten å høres ut som en kategoridefinisjon;
- minst én konkret detalj er minneverdig;
- ingen nye fakta er lagt inn uten kildegrunnlag;
- interne produksjonsnotater er holdt utenfor brukerteksten;
- teksten fungerer sammen med resten av batchen uten å gjenta samme formel.
