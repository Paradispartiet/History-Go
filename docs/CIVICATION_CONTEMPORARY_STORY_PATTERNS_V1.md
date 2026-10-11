# Civication – samtidige fortellingstyper for Min dag og Symposium (v1)

**Status:** Redaksjonell fortellingsbank. Dette er verken publiserte scener, et runtime-register, et nytt dataschema eller et sett med spillflagg.

**Formål:** Oversette historiske og litteraturfaglige fortellingsmodeller til konkrete livskonflikter som kan oppstå i Civication i dag. Historiens drivkraft er en handling mellom personer, ikke etiketten «helt», «reise» eller «tragedie». Det litterære grunnlaget finnes i [Symposium-prinsippene](CIVICATION_SYMPOSIUM_NARRATIVE_PRINCIPLES.md) og Litteratur-fagverket; Civication eier scener og faktiske valg.

## 24 fortellingstyper som kan brukes i Civication

Numrene er **redaksjonelle referanser**, ikke scene-ID-er, story-state eller koder som skal inn i et lagret spill.

| ID | Samtidsfortelling | Konkret konflikt og mulig tråd | Redaksjonell forankring |
| --- | --- | --- | --- |
| C01 | Jobbtap og verdighet | Status og økonomi mot selvrespekt; samtaler med en venn som merker forandringen | Arbeidsledig, Jonas, bekjenten |
| C02 | Muligheten uten garanti | En lovende prøve eller invitasjon er ikke en kontrakt | Mira, Frilansmusiker |
| C03 | Drømmen og regningene | Skaperprosjektet konkurrerer med tid, søvn og ansvar | Lea, Sideprosjektbygger |
| C04 | Forespørselen som ikke er en kontrakt | Uavklart omfang, kapasitet og betaling | Lea, Frilanser |
| C05 | Byråkratiet og personen | Dokumentasjonskrav og faktiske livsbehov på samme dag | Arbeidsledig, NAV |
| C06 | Faglig integritet under press | Saklig vurdering mot forventningen om rask avklaring | Arealplanlegger, plansjef |
| C07 | Tilhørighet mot frihet | Å bli inkludert skaper krav om lojalitet eller gratisarbeid | Arvid, miljøkontakt |
| C08 | Tjenesten som blir en gjeld | Hjelp gis med en uuttalt forventning om motytelse | Bekjentskap/Arvid, mulig videreføring |
| C09 | Vennskapet som glir fra | To venner endrer rytme og tolker hverandres taushet ulikt | Jonas, privatliv |
| C10 | Kjærlighet på feil tidspunkt | Gjensidig interesse, forskjellige ønsker og grenser | Ny privatlivstråd; ikke eksisterende partner |
| C11 | Familien som trenger deg | Hjelp til andre kolliderer med egen kapasitet | Søsteren, privatliv |
| C12 | Grensen du ikke satte | Frivillig innsats blir en forpliktelse du ikke avtalte | Sara, klubben |
| C13 | Hjemmet på usikker grunn | Usikker bolig og svak økonomi gir færre reelle valg | Ny privatlivstråd; krever boliggrunnlag |
| C14 | Ryktet løper fra deg | Et bilde eller et utsagn spres uten sammenheng | Ny sosial/digital fortelling |
| C15 | Det digitale dobbeltlivet | Personlig framstilling kolliderer med faktiske løfter og handlinger | Ny, mulig framtidig AHA-bro |
| C16 | Klassereisen og kodene | Invitasjon til et miljø med fremmede vaner og forventninger | Daniel, kulturmiljø |
| C17 | Å arbeide seg tom | Fagstolthet konkurrerer med tidspress og fysisk belastning | Renholder, driftsleder, Amina |
| C18 | Ensom midt blant folk | Sosiale bilder og ubesvarte invitasjoner gir et valg om kontakt | Jonas, Daniel |
| C19 | Å begynne på nytt | Opplæring og ny retning uten garanti om jobb eller status | Arbeidsledig, kunnskapssporet |
| C20 | Fellesskapet uten helt | Et lokalt initiativ skal fungere selv om én person sier nei | Sara, Nora |
| C21 | Byen som skifter ansikt | Hjemsted, minner, dokumentasjon og motstridende interesser | Ivar og Arealplanlegger |
| C22 | Kunnskap du ikke kan bekrefte | Det er fristende å påstå mer enn man har grunnlag for | Nora, natur og undersøkelse |
| C23 | Den lille feilen som ikke forsvinner | Feil melding, notat eller antakelse får følger gjennom flere dager | Arbeid/privatliv, kontekstbundet |
| C24 | Den ufullstendige forsoningen | Kontakt gjenopptas, men mistillit forsvinner ikke på kommando | Mira, Lea, Arvid, Jonas |

### Dekningsstatus

Tabellen skiller mellom **eksisterende figurer og konflikter** og **nye produksjonsforslag**. En eksisterende person betyr ikke at en bestemt moderne historie allerede finnes i scenedataene.

- **Reell nåværende forankring:** Mira (`data/Civication/lifestory/continuations/musikk_med_mira.json`), Lea (`sideprosjekt_med_lea.json` og `frilans_med_lea.json`), Arvid (`miljo_med_arvid.json`), Arbeidsledig (`roles/arbeidsledig/role.json`), Arealplanlegger og Renholder.
- **Tråder som trenger ny historietekst:** Blant annet C08–C16, C21, C23 og C24 i nye varianter. De er ikke erklært implementert.
- **Nye livsdomener:** C10, C13 og C15 krever særskilt forfatting og en konkret forankring i eksisterende state/modul før noe kan spilles. Ikke finn på tidligere dater, leiekontrakter, digitale innlegg eller relasjoner.

## Fire prioriterte prøveproduksjoner

### 1. Mira: C02 → C09 → C24

Eksisterende scene `d8_mira_etter_settet` i `musikk_med_mira.json` tilbyr en ny prøve, hjemmeperiode eller pause. Eksisterende `d9_mira_forberedelse` gir forberedelse, ingen nye ideer eller avlysning. En senere videreføring kan undersøke hvordan samarbeid tåler ulik kapasitet og ulike mål. Hvis prøven ble avlyst, kan neste kapittel ikke hevde at den fant sted. Ny booking eller honorar krever en separat faktuelt lagret beslutning.

### 2. Lea: C03 → C04 → C23

`d8_sideprosjekt_etter_modellen` og `d9_sideprosjekt_forberedelse` har allerede konkret stoff for forventninger, omfang og prioritering. En senere historie kan la en uprøvd løsning skape en pinlig misforståelse; rettingen må referere til spillerens faktiske prosjektvalg. En forespørsel om arbeid er ikke en etablert kunde, kontrakt, inntekt eller selskap.

### 3. Arvid: C07 → C08 → C24

`d8_arvid_etter_oppdraget`, `d8_arvid_etter_avbruddet` og `d8_arvid_etter_neiet` representerer ulike historiske utgangspunkter. En fortsettelse kan utforske hvem som føler seg forpliktet, og hvordan et nei endrer kontakten. Respekter allerede lagret avstand eller avbrutt oppdrag. Ikke likestill kontakt med kriminalitet, jobbtilbud eller organisasjonstilhørighet.

### 4. Arealplanlegger og Renholder: C06 → C17 → C23

Eksisterende arbeidsliv har press på dokumentasjon og faglig integritet (Arealplanlegger), og usynlig arbeid, HMS og belastning (Renholder). Viderefør de faktiske valgene: etter at spilleren sa fra, må neste møte ta hensyn til at innvendingen finnes; etter at spilleren tidde, skal man ikke late som et avvik er rapportert. En lav energimåler er ikke alene en full fortelling om utbrenthet.

## Arbeidskontrakt for en samtidsfortelling

1. **Start i et kjent liv:** Eksisterende rolle, aktiv tråd, tidligere scene og dokumentert valg. Nye NPC-er må forankres i nytt innhold.
2. **En situasjon, ikke en diagnose:** Et møte, krav, brev, spørsmål, bilde, avslag eller løfte som noen faktisk står overfor.
3. **To eller flere realistiske handlinger:** Begge har fordeler og kostnader, uten å belønne «snilleste» svar automatisk.
4. **Én umiddelbar effekt:** Bruk validerte `effekter` i eksisterende Life Story-format, bare når en reell scene produseres.
5. **Én senere tilbakekomst:** Valget må merkbart påvirke en senere scene og reflekteres i Symposium-arkivet.
6. **Flere avslutningstyper:** Framgang, feil, utsettelse, kompromiss, stagnasjon eller åpen slutt. En fortelling trenger ikke lykkelig slutt eller dramatisk katastrofe.
7. **Tverrtrådkonsekvens når relevant:** Arbeidsliv, fritid og relasjoner kan støte sammen, men lagret status og jurisdiksjonen til hver eksisterende modul respekteres.
8. **Kvalitetsprøve:** Kontroller alle valgruter mot faktisk state. Ingen scene må forutsette et møte, kjøp, løfte eller en lønn som ikke fant sted.

**Litterære kilder brukes til grep, ikke kopiering:** Solstad (små hendelser med varige ettervirkninger), Coetzee (makt og tilhørighet), Fante (ambisjon og skam), Despentes (sosiale nettverk), Ernaux (erindring og klasse), Fosse (gjentakelse og åpne forløp), Kafka (institusjonell friksjon). Disse er redaksjonelle inspirasjonslinjer, ikke påstander om at en roman og en Civication-tråd har identisk plott.

**Arkitektur:** `docs/civication-life-story-system.md` er fremdeles normativ. Life Story Runner er eneste mål for scene- og valgutførelse. Dette dokumentet oppretter ingen ny motor, formel, arketypescore eller rolle/Badge-gate. History Go-kjernen endres ikke.
