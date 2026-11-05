# Civication – People-casting, relasjoner og individuelle synopsiser (v1)

**Status:** Seks konkrete **produksjonskandidater** per 12. oktober 2026. Ingen er implementerte NPC-er, og ingen fiktiv samtale i ekte People-navn er godkjent. Canonical People-data er lest fra `data/Civication/historyPeople_index.json` og endres ikke av dette dokumentet.

## Hvordan de seks kandidatene skal brukes

Spilleren må først faktisk låse opp en People gjennom History Go. Oppdagelse viser fakta og åpner **mulige historieforløp**, ikke en venn. Dagens `CivicationRelationshipEngine` har allerede relasjonstrappen `stranger → recognized → acquaintance → friendly_contact → friend → close_friend`, med egen trust/familiarity. Det er **ikke** et bevis på at en av de seks ekte personene allerede er en sosial aktør i engine.

Det finnes to forskjellige eksistensnivåer:
1. **Faglig People-kontakt** (mulig med dagens faktisitetskontrakt): People brukes til historisk fagbakgrunn, relevant sted og kunnskapsoppgaver. Eventuell sosial handling skjer med en separat, tydelig fiktiv aktør.
2. **Simulert navngitt People-relasjon** (foreløpig **ikke godkjent**): krever separat faktisitetskontrakt, UI-merking, kronologiske regler, avgrensning av tale/privatliv og arkiv. En person skal aldri fremstå som faktisk deltaker i spillerens nåtid uten dette.

Etter dokumentert oppdagelse kan et fremtidig scenario invitere til en første interaksjon i en **godkjent fiksjonsmodus**. Da kan eksisterende relasjonsmotor brukes, men vennskap må komme fra hendelser og valg, ikke fra automatisk nivåøkning ved unlock.

## People × rolle × historie – hovedmatrise

| People og canonical sted | Spillerrolle / fortelling | Faktisk kjerne i synopsis | Status |
| --- | --- | --- | --- |
| **Bugge Wesseltoft** – `blaa` | `musikk_frilansmusiker` · C02, C09, C24 | Den åpne skissen | Redaksjonell kandidat; policyport åpen |
| **Mari Boine** – `rockefeller` | `musikk_frilansmusiker` · C02, C14, C24 | Hvem eier fortolkningen? | Redaksjonell kandidat; policyport åpen |
| **Attila Horvath** – `club_7_vika` | `subkultur_gangster` · C07, C08, C20 | Hvem åpner døren? | Redaksjonell kandidat; policyport åpen |
| **Sossen Krohg** – `club_7_vika` | `subkultur_gangster` · C07, C12, C20 | En scene har flere eiere | Redaksjonell kandidat; policyport åpen |
| **Jens Jacob Jensen** – `myrens_verksted` | `naeringsliv_sideprosjektbygger` · C03, C23 | Prototypen som må tåle virkeligheten | Redaksjonell kandidat; policyport åpen |
| **Peter Emil Steen** – `steen_og_strom` | `naeringsliv_frilanser` · C03, C04, C23 | Bestillingen som ikke er lagt inn | Redaksjonell kandidat; policyport åpen |

**Kontrollert forskjell:** Bugge og Mari deler musikkens rollebane, men problemstillingen er ulik; Attila og Sossen deler stedet `club_7_vika`, men ikke funksjon; Jens Jacob Jensen og Peter Emil Steen knytter prosjekt- og virksomhetsfortellingene til ulike historiske næringskontekster. Ingen Mira-, Lea- eller Arvid-dialog blir automatisk gjenbrukt.

## Seks individtilpassede synopsiser

### PPL-M01 – Den åpne skissen

**Canonical identitet:** `bugge_wesseltoft` (Bugge Wesseltoft), sted `blaa`. **Dokumentert bakgrunn i indeksen:** Pianist, komponist og produsent med nøkkelrolle i norsk nu-jazz.

**Spillerens kjerneproblem:** Spilleren må velge om et improvisert motiv skal være et åpent arbeidsmateriale eller et ferdig nummer før et nytt spilleforsøk.

**Forutsetning:** Etter at spilleren har oppdaget den dokumenterte People-profilen ved Blå, blir nu-jazz og produksjon et faglig anker for en fiktiv musikkoppgave; ingen personlig invitasjon fra Bugge er implisert.

**Dager 8–10:** Spilleren vurderer to ulike måter å utvikle sin egen skisse: opptak og analyse eller prøving med et selvstendig fiktivt ensemble.

**Dager 11–13:** En selvstendig fiktiv booker spør etter praktisk omfang. Valget fra første kapittel bestemmer hva spilleren faktisk kan vise fram.

**Dager 14–16:** Et arrangørmøte får et reelt spørsmål om kreditering, øvetid og lydmateriale, ikke påståtte ord eller løfter fra en virkelig person.

**Alternative handlingsretninger:** (A) Beholde skissen åpen og organisere en dokumentert prøvesituasjon; (B) Avgrense motivet og gjøre klar en tydelig versjon. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Senere spørsmål om repertoar og kreditering skiller et gjennomført opptak fra en øvingsidé som fortsatt er åpen.

**Symposium-bevis:** People-funn og sted, skissens status, egne øvinger, faktisk bookerforespørsel, egne valg og eventuelt avlyst oppmøte.

**Faktisitetsgrense:** Ikke tilskriv Bugge Wesseltoft en booking, et ja, private meninger eller fiktive replikker. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.

### PPL-M02 – Hvem eier fortolkningen?

**Canonical identitet:** `mari_boine` (Mari Boine), sted `rockefeller`. **Dokumentert bakgrunn i indeksen:** Sanger og låtskriver med stor betydning for samisk og norsk musikkliv.

**Spillerens kjerneproblem:** Spilleren vil bearbeide et uttrykk som krever respekt for språk, kultur og opphav, samtidig som en nær konsertfrist frister til raske forenklinger.

**Forutsetning:** Etter oppdagelse av Mari Boines People-profil ved Rockefeller blir dokumentert musikalsk virke konteksten for et skille mellom inspirasjon og spillerens eget materiale.

**Dager 8–10:** Spilleren undersøker om en egen tekst og et musikalsk arrangement faktisk har en etterprøvbar opphavshistorie.

**Dager 11–13:** En selvstendig fiktiv konsertkontakt vil ha programtekst. Spilleren kan ikke skrive som om personen som inspirerte prosjektet, har gitt støtte.

**Dager 14–16:** Programutkastet møter et konkret spørsmål om kreditert påvirkning, språklig presisjon og om den egne fremføringen bør endres eller trekkes.

**Alternative handlingsretninger:** (A) Skrive om teksten og forklare egen posisjon og kildegrunnlag; (B) Utelate et usikkert element og bygge nytt materiale. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Den senere programteksten skal huske hva spilleren valgte; ingen kunstnerisk godkjenning fra Mari Boine kan påstås.

**Symposium-bevis:** People-funn og sted, egne tekster, opphavskontroll, valg i programtekst, endelig avklart/avlyst opptreden.

**Faktisitetsgrense:** Ikke dikte opp samiske sitater, Mari Boines samtykke, relasjoner eller personlige oppfatninger. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.

### PPL-K01 – Hvem åpner døren?

**Canonical identitet:** `attila_horvath` (Attila Horvath), sted `club_7_vika`. **Dokumentert bakgrunn i indeksen:** Club 7-initiativtaker og miljøbygger i Oslos motkultur.

**Spillerens kjerneproblem:** Spilleren ønsker å bidra til et kulturmiljø, men tilgang til en møteplass fører til spørsmål om ansvar, frivillig arbeid og hvem som kan delta.

**Forutsetning:** People-funnet knyttes til Club 7 som historisk miljø. Den fiktive samtidshandlingen legges til en egen arrangørgruppe, ikke Attilas private kalender.

**Dager 8–10:** Spilleren vurderer en invitasjon til å bidra i et frivillig arrangørprosjekt, med egen dokumentasjon av hvem som kan bruke lokalet.

**Dager 11–13:** En planlagt arbeidsliste viser at en tjeneste har blitt tolket som et varig løfte; spilleren må avklare navne- og oppgavebruk.

**Dager 14–16:** Ved en ny samling blir konsekvensen synlig: tydelige vakter, uoppfylt forventning eller bevisst avstand.

**Alternative handlingsretninger:** (A) Avgrense rollen skriftlig og sikre åpen tilgang; (B) Avslå videre ansvar og beholde kontakt kun som deltaker. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Den fiktive arrangørgruppen kan bare føre spilleren opp på senere lister dersom samtykket faktisk ble gitt.

**Symposium-bevis:** People-funn, valgt kulturmiljø, ansvarsliste, faktisk oppgave og svar, invitasjonens navnebruk.

**Faktisitetsgrense:** Ikke koble Attila Horvath til ubegrunnet kriminalitet, skjult lojalitet eller oppdiktet handel. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.

### PPL-K02 – En scene har flere eiere

**Canonical identitet:** `sossen_krohg` (Sossen Krohg), sted `club_7_vika`. **Dokumentert bakgrunn i indeksen:** Skuespiller og scenekunstner knyttet til Scene 7 / Club 7-miljøet.

**Spillerens kjerneproblem:** Spilleren er med på en fiktiv scenekveld, men hvem som får plass, kreditering og ansvar er uklart. Historisk Scene 7 gir bakgrunn, ikke en deltakeravtale.

**Forutsetning:** Oppdagelse ved Club 7 åpner stedets teaterhistorie; den sosiale tråden skjer med en selvstendig fiktiv produksjonsgruppe.

**Dager 8–10:** En kort prøveplan tar form; spilleren velger om flere skal få taletid eller om egen del av programmet skal prioriteres.

**Dager 11–13:** Programutkast og kreditering må avklares før en forestilling kan annonseres.

**Dager 14–16:** Etter prøven blir konflikten om arbeidsfordeling synlig i et konkret revidert program eller avlyst opplegg.

**Alternative handlingsretninger:** (A) Be om åpen krediterings- og arbeidsfordeling; (B) Gi fra seg egen sceneplass for å fullføre en avtalt helhet. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Senere program og evaluering må følge den faktiske prioriteringen, og kan ende i mindre forestilling, ikke tvungen suksess.

**Symposium-bevis:** People-funn, øvelsesstatus, roller, programutkast, hvem som faktisk deltok og hvordan scenen ble fordelt.

**Faktisitetsgrense:** Ikke gi Sossen Krohg oppdiktede personlige replikker, innvendinger eller kontrakter. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.

### PPL-N01 – Prototypen som må tåle virkeligheten

**Canonical identitet:** `jens_jacob_jensen_myrens` (Jens Jacob Jensen), sted `myrens_verksted`. **Dokumentert bakgrunn i indeksen:** Industrigründeren som sammen med broren Andreas grunnla verkstedet i 1848 og utviklet Myrens som produsent av maskiner for norsk industri.

**Spillerens kjerneproblem:** Spilleren vil bygge et teknisk hjelpemiddel, men hopper mellom nytt design og test uten å beregne drifts- og produksjonsrammer.

**Forutsetning:** Etter Myrens People-funn brukes dokumentert verksted- og industrikontekst som faglig inspirasjon for en ny, tydelig fiktiv prototypoppgave.

**Dager 8–10:** Spilleren tegner et eget produkt og oppdager en svakhet ved brukssituasjonen.

**Dager 11–13:** En fiktiv verkstedkontakt etterspør testbar funksjon før videre produksjon; tidligere notat må ligge ved.

**Dager 14–16:** En ny prøve viser om feilen ble vurdert på forhånd, og om løsningens omfang ble redusert.

**Alternative handlingsretninger:** (A) Prioritere sikker, dokumenterbar testing fremfor funksjonsvekst; (B) Redusere produktets formål og gjennomføre en enklere prøve. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Neste prosjektfase må vise feil og endringer; ingen faktisk historisk arbeider eller ordre fabrikeres.

**Symposium-bevis:** People-funn og Myrens sted, versjon av teknisk skisse, egen test, feil, ny prioritering og realistisk prosjektstatus.

**Faktisitetsgrense:** Ikke sette Jens Jacob Jensen i samtidige møter eller dikte opp historiske fabrikkuhell. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.

### PPL-N02 – Bestillingen som ikke er lagt inn

**Canonical identitet:** `peter_emil_steen` (Peter Emil Steen), sted `steen_og_strom`. **Dokumentert bakgrunn i indeksen:** Kjøpmannen som sammen med Samuel Strøm junior ga firmaet navnet Steen & Strøm.

**Spillerens kjerneproblem:** Spilleren vurderer en liten handelsrelatert tjeneste, men et spørsmål om varer og sortiment har ennå ikke blitt en bestilling.

**Forutsetning:** People-funnet ved Steen & Strøm gir dokumentert handelshistorisk bakgrunn. En fiktiv nåtidig butikkeier er egen aktør, ikke den historiske kjøpmannen.

**Dager 8–10:** Spilleren får et konkret problem om vareoversikt; omfanget av tjenesten er uklart.

**Dager 11–13:** Før pris kan diskuteres må vareflyt, datagrunnlag og hvem som bærer risiko avklares.

**Dager 14–16:** Et faktisk utkast møter en begrensning i etterspørsel; spilleren må avgjøre om tilbudet skal revideres eller trekkes.

**Alternative handlingsretninger:** (A) Avgrense tjenesten skriftlig og registrere forbehold; (B) Ikke tilby tjenesten før et dokumenterbart behov foreligger. Dette er manusforslag, ikke registrerte `choice_id` eller `effekter`.

**Forsinket konsekvens:** Senere kapitler må bevare forskjellen mellom et foreslått tilbud, aksept og betaling.

**Symposium-bevis:** People-funn ved Steen & Strøm, fiktiv kundes faktiske spørsmål, omfang, svar og eventuelt senere oppdrag.

**Faktisitetsgrense:** Ikke fremstille Peter Emil Steen som nålevende kunde eller tilskrive ham oppdiktede handelstransaksjoner. Ikke tillatt å skrive samtale, private motiver eller historisk feilplassert handling i personens navn under gjeldende kontrakt.


## Relasjon-/simuleringsmatrise: anbefalt gate, ikke implementert

| Spillstatus | Hva som er lov med dagens kontrakter | Hva som må avklares før navngitt simulering |
| --- | --- | --- |
| People låst | Ingen Civication-relasjon påstås | Historisk sted og unlock leses read-only |
| People samlet | Faktakort, relevant historie, oppgave og mulig fiktivt scenario | Simuleringsetikett og aktørtype |
| Mulig første møte | Selvstendig fiktiv aktør kan håndtere miljøscenario | Møte og person-ID må ikke påstå kontakt med faktisk menneske |
| `recognized` / `acquaintance` | Eksisterende social engine kan spore tydelig fiktive NPC-er | Separat, tillatt simuleringsperson med egen provenance |
| `friendly_contact` / `friend` / `close_friend` | Basert på gjentatte lagrede fiktive handlinger | Døds-/periodegrenser, etikk, ingen oppdiktede belastende private opplysninger |
| Avstand / avslått invitasjon | Beholdes i eksisterende relasjonshistorikk | Verken nytt People-unlock eller arkivvisning får resette avslaget |

## Symposium: hva et kapittel må bevise

| Bevis | Status | Fasit |
| --- | --- | --- |
| `people_id` og `place_id` | Kilde/verifiserbart | History Go generated People index |
| Aktuell `role_scope` | Kilde/verifiserbart | Canonical spillerrolle, ikke bare fagkategori |
| Hvilken fiktiv aktør spilleren møtte | Må produseres | Egen rolleidentitet, ikke realpersonens factual record |
| Kontaktstatus før og etter møte | Må produseres | Den eksisterende relasjonsmotoren |
| Valgt svar + eventuell avlysning | Må produseres | Life Story/Scene Pipeline og snapshot |
| Senere reaksjon | Må produseres | Egen, faktisk utløst scene |
| Hva People faktisk gjorde historisk | Utenfor denne simulerte handlingen | History Go-kilder; aldri tilbakeskrevet fra manus |

## Første produksjonstest

Begynn med `PPL-M01` og `PPL-M02`. Begge bruker `musikk_frilansmusiker` og C02, men skal ha **ulike dilemmaer, ulike scenevalg og ulike senere følger**. Kjør i tillegg en spiller uten noen av disse People og en spiller som låser opp People etter dag 13. Sistnevnte skal ikke få fortid skrevet om.

Først når faktisitets- og policyporten er eksplisitt avklart kan vi planlegge en navngitt simulert relasjon; foreløpig er manusene **spillersentrerte** og basert på dokumentert People-kontekst, med selvstendige fiktive sosialaktører der handling kreves.
