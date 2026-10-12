# Psykologrommet – produktformål og fungerende brukerreise

**Oppdatert:** 12. oktober 2026
**Status:** Praktisk brukerreise med frivillig oppfølging av samme situasjon i eksisterende PlaceCard-store visning og Psykologrommets egen footer.

## Formål

Psykologrommet er et pedagogisk refleksjonsverktøy for selvinnsikt, hverdagsfenomener og menneskelig atferd, ikke et diagnoseverktøy eller en behandlingsplattform. Praktisk refleksjon skal være hovedfunksjonen. **Psykoteori er en kilde- og historieforklarende fordypning**, ikke startpunktet for hver aktivitet.

## Gjennomført brukerreise

1. **Observer – Tankeverksted:** Brukeren beskriver frivillig én konkret hendelse, tanke, følelse, kroppslig reaksjon, handling og eventuelt et neste steg. Ingen automatisk tolkning, klinisk skåring eller karakteristikk blir laget.
2. **Forstå – Fenomenleksikon:** Etter lagring velger brukeren **selv** et av de eksisterende 26 fenomenene; en personlig refleksjon brukes ikke til automatisk kategorisering.
3. **Prøv – verktøy/øvelse:** Fenomenartikler lenker til virkelige verktøy, øvelser og eventuelle frivillige innsjekker gjennom eksisterende data-ID-er. Ved fullføring med fenomenkontekst kommer brukeren til et eget neste-steg-bilde i stedet for å bli kastet tilbake til start.
4. **Lær – Psykoteori:** Neste-steg-bildet tilbyr eksisterende teorikort koblet til det valgte fenomenet, eller hele teorikatalogen dersom ingen direkte kobling er dokumentert. Teorikortene viser forskningshistorie, metode, begrensninger, kilder og lenker til det kanoniske psykologifagverket.
5. **Historie – History Go:** Psykologiens utvikling, forskere og historiske institusjoner hører hjemme i History Go og psykologifagverket. Steds- eller personkoblinger opprettes bare der en faktisk kanonisk kobling finnes; nye antatte steder og personer er ikke opprettet i denne oppgaven.

## Oppfølging av samme situasjon

- På Min side kan brukeren åpne hver av de inntil 30 lokalt lagrede situasjonene og lese alle de opprinnelige svarene.
- Brukeren kan legge til flere daterte oppfølginger: hva vedkommende prøvde eller ikke prøvde, hva som skjedde, en eventuell endret oppfatning og neste mulige handling.
- Originalnotatet overskrives ikke. Gamle notater uten feltet `follow_ups` fungerer fremdeles; oppfølginger lagres i samme `hg_psychology_workbench_v1`-liste.
- Oppfølging gir ikke kompetansepoeng, innsiktspoeng eller nye økter. Lagringsfeil gir beskjed i stedet for en falsk bekreftelse.

## Frivillig kobling til 7-dagersløp

- Fra en lagret situasjon kan brukeren se og velge blant alle de seks eksisterende løpene: uro, søvn, selvkritikk, oppmerksomhet, relasjoner og affektregulering. Ingen foreslås eller velges automatisk ut fra fritekst.
- Når et løp startes fra situasjonen, lagres en referanse til notatets ID i eksisterende `hg_psychology_path_progress_v1`. Et pågående, ikke tilknyttet løp kan også knyttes manuelt. Et løp som allerede er tilknyttet et bevart notat, omkobles ikke uten videre.
- Daglige løprefleksjoner ligger fortsatt i `hg_psychology_path_reflections_v1`. De vises lesbart under den opprinnelige situasjonen og leder tilbake til løpet, uten kopiering til `follow_ups` eller endring av originalens seks svar.
- Brukeren kan fortsette å legge inn frivillige daterte oppfølginger separat. Sletting av Tankeverksted-notatet sletter ikke automatisk gamle løp eller dagrefleksjoner; et aktivt løp med slettet kobling kan knyttes på nytt.
- Kobling og navigasjon gir ingen poeng, ny økt eller Civication-kompetanse. Løpets allerede eksisterende fullføringsbelønning beholdes uendret som egen mekanikk; den gis ikke ved kobling eller oppfølging.
- Allerede lagrede, uavhengige løp fortsetter som før. Ingen automatisk migrering, profilering, diagnose eller deling av personlige data er innført.

## Eiergrenser

**History Go:** Historie, steder, historiske personer, kildebaserte spørsmål og det kanoniske fagverket.

**Psykologrommet:** Frivillige individuelle refleksjoner, lesing, arbeidsark og læring. Egen fast footer: Hjem, Fenomener, Øvelser, Teori, Min side. Rommet har egen scroll i kortet.

**Civication Psyke:** Egen separat spillmekanikk. Psykologrommets `completeSession` **kaller ikke** `CivicationPsyche.addPsychologyCompetence`. Verken tankeverkstedet, øvelser eller frivillige tester gir automatisk Civication-kompetanse eller blir til et karrierebevis. Eksisterende CivicationPsyke-motor og egne tester er uendret.

## Personvern

- Tankeverksted-notater lagres utelukkende i nettleserens `localStorage` med nøkkelen `hg_psychology_workbench_v1`, opptil 30 siste notater.
- Refleksjonene sendes ikke til server, Civication eller andre delsystemer av den nye brukerreisen. Notater er lokale for nettleseren, ikke krypterte eller en kontosynkronisert journalsikker løsning.
- Brukeren kan lese nylige notater på Min side og slette alle tankeverksted-notatene der etter uttrykkelig bekreftelse. Ingen nye diagnostiske vurderinger opprettes.
- Øvrige eldre, eksisterende refleksjoner og tester bruker fremdeles sine allerede etablerte lokale Psykologrommet-nøkler. Sletteknappen for tankeverkstedet sletter ikke disse.

## Akseptansekriterier

- [x] Tankeverksted med seks separate spørsmål og obligatorisk konkret situasjon.
- [x] Helt manuell fenomenvalg etter lagring.
- [x] Klikkbar fenomen–øvelse/verktøy–teori-navigasjon, med opprettholdt kontekst etter lagring.
- [x] Lokal lagring, eksplisitt opplysning om formål og mulig sletting.
- [x] Åpne samme situasjon igjen, lese originalen og legge til flere daterte oppfølginger uten poeng.
- [x] Ingen automatisk Civication-kompetanse fra Psykologrommet.
- [x] De 35 eksisterende teorikortene, 58 emnekoblingene, 70 hypotetiske scenarioene og kanoniske fagverksruter beholdes.
- [x] History Go-kjerne, Civication Psyke-motoren, PlaceCard og ordinær footer beholdes uendret.
- [x] Integrasjonsregresjon tester brukerreisen fra konkret situasjon til teori.

## Ikke endret i denne PR-en

Ingen automatisk fenomenklassifikasjon, personalisert psykologisk profilering, anbefaling av behandling, ny teoriproduksjon eller nye steds-/personoppføringer. Ingen automatisk analyse av fritekst. Ingen kontomigrasjon eller synkronisering av personlige refleksjoner.

**Videre kvalitetsarbeid:** Kvalitetssikre hvordan tekstene i fenomenleksikon, øvelser og læringsscenarioer kobles sammen; kontrollere virkelige klikkeforløp og layout visuelt på iPad og mobil før endelig UI-godkjenning.
