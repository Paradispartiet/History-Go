# Psykologrommet – produktformål og fungerende brukerreise

**Oppdatert:** 12. oktober 2026
**Status:** Praktisk brukerreise implementert i eksisterende PlaceCard-store visning og Psykologrommets egen footer.

## Formål

Psykologrommet er et pedagogisk refleksjonsverktøy for selvinnsikt, hverdagsfenomener og menneskelig atferd, ikke et diagnoseverktøy eller en behandlingsplattform. Praktisk refleksjon skal være hovedfunksjonen. **Psykoteori er en kilde- og historieforklarende fordypning**, ikke startpunktet for hver aktivitet.

## Gjennomført brukerreise

1. **Observer – Tankeverksted:** Brukeren beskriver frivillig én konkret hendelse, tanke, følelse, kroppslig reaksjon, handling og eventuelt et neste steg. Ingen automatisk tolkning, klinisk skåring eller karakteristikk blir laget.
2. **Forstå – Fenomenleksikon:** Etter lagring velger brukeren **selv** et av de eksisterende 26 fenomenene; en personlig refleksjon brukes ikke til automatisk kategorisering.
3. **Prøv – verktøy/øvelse:** Fenomenartikler lenker til virkelige verktøy, øvelser og eventuelle frivillige innsjekker gjennom eksisterende data-ID-er. Ved fullføring med fenomenkontekst kommer brukeren til et eget neste-steg-bilde i stedet for å bli kastet tilbake til start.
4. **Lær – Psykoteori:** Neste-steg-bildet tilbyr eksisterende teorikort koblet til det valgte fenomenet, eller hele teorikatalogen dersom ingen direkte kobling er dokumentert. Teorikortene viser forskningshistorie, metode, begrensninger, kilder og lenker til det kanoniske psykologifagverket.
5. **Historie – History Go:** Psykologiens utvikling, forskere og historiske institusjoner hører hjemme i History Go og psykologifagverket. Steds- eller personkoblinger opprettes bare der en faktisk kanonisk kobling finnes; nye antatte steder og personer er ikke opprettet i denne oppgaven.

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
- [x] Ingen automatisk Civication-kompetanse fra Psykologrommet.
- [x] De 35 eksisterende teorikortene, 58 emnekoblingene, 70 hypotetiske scenarioene og kanoniske fagverksruter beholdes.
- [x] History Go-kjerne, Civication Psyke-motoren, PlaceCard og ordinær footer beholdes uendret.
- [x] Integrasjonsregresjon tester brukerreisen fra konkret situasjon til teori.

## Ikke endret i denne PR-en

Ingen automatisk fenomenklassifikasjon, personalisert psykologisk profilering, anbefaling av behandling, ny teoriproduksjon eller nye steds-/personoppføringer. Ingen automatisk analyse av fritekst. Ingen kontomigrasjon eller synkronisering av personlige refleksjoner.

**Videre kvalitetsarbeid:** Kvalitetssikre hvordan tekstene i fenomenleksikon, øvelser og læringsscenarioer kobles sammen; kontrollere virkelige klikkeforløp og layout visuelt på iPad og mobil før endelig UI-godkjenning.
