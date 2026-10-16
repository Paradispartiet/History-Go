# Civication – personer, roller og sammenhengende historier

Status: De tre underkjente buene er omskrevet som **uregistrerte innholdsutkast**. Aktivering i produksjonsinnboksen gjenstår. Den opprinnelige vurderingen på 4/5 og 25/30 er fortsatt trukket tilbake.

Revisjon 3, 16. oktober 2026: [Personmodellen](CIVICATION_PERSON_MODEL_V1.md) avklarer felles begreper for spiller og NPC-er, kildeavgrensede profiler, ukjente opplysninger og spillerens kunnskap. Steins eksisterende arbeidsbue er samtidig rettet til fagarbeiderens handlingsrom. De tre private historieutkastene er ikke utvidet eller aktivert.

Revisjon 4: Dag- og leveringsblokkeringen er rettet i eksisterende kildeadapter og dagsbygger. Private kapitler følger kalenderens `dayIndex`, har egen dagkvote og kan leveres uten jobb. Den normale private fasekilden slipper nå gjennom private NPC-kapitler. Se [implementasjon og avgrensning](CIVICATION_PRIVATE_NPC_DAY_INBOX_V1.md). Produksjonsmanifestet er fortsatt uendret; historieutkastene aktiveres ikke av denne rettelsen.

Den tidligere versjonen er gjennomgått i [redaksjonell gjennomgang](CIVICATION_WHOLE_LIFE_EDITORIAL_REVIEW_2026_10_14.md). Den rapporten gjelder commit `74b1d092876c0b8025cd82f2d6ae987f655ee86a` og bevares som historikk.

## Hvem personene og spilleren er

Frode Aas, Stein Mæland og Inger Holm er navngitte fiktive NPC-er som allerede finnes i `data/Civication/npcs/naeringsliv.json`. De har stabile ID-er. En rolleendring skal ikke skape en ny person.

Spilleren er brukerens spillfigur. Brukeren velger dens handlinger, mens NPC-ene får handlinger fra skrevne forløp og lagret tilstand. Spiller og NPC-er kan referere til samme canonical rollekatalog gjennom `civicationActorRoleContract.js`.

| Person | Utgangsrolle | Etter fullført eksisterende arbeidsbue | Egenskaper i kataloget |
| --- | --- | --- | --- |
| Frode Aas | Formann | Mellomleder | Lojal til folkene, varsom med ord, kjenner gulvet |
| Stein Mæland | Mellomleder | Avdelingsleder | Kollegial, målbevisst, konkurranseorientert |
| Inger Holm | Avdelingsleder | Mellomleder | Tallorientert, lite synlig på gulvet, presset ovenfra |

Arbeidsbuene åpnes for bestemte spillerroller: Stein for Fagarbeider, Frode og Inger for Fagarbeider eller Mellomleder. Derfor må scenene respektere spillerens faktiske handlingsrom. En Fagarbeider kan gi observasjoner og innspill; en samtale med en leder etablerer ikke myndighet til å disponere andre ansatte.

## Nivåene må skilles

| Nivå | Hva det beskriver | Forhold til rollebytte |
| --- | --- | --- |
| Identitet | Hvem personen er, stabil ID og navn | Bevares |
| Egenskaper og motiver | Temperament, verdier, ønsker og vaner | Forandres ikke automatisk av en stilling |
| Kompetanse | Erfaring og ferdigheter personen faktisk har | Kan utvikles gjennom erfaring og opplæring |
| Rolle | Sosial eller organisatorisk posisjon, ansvar og forventninger | Kan endres ved konkrete hendelser |
| Livssituasjon | Arbeid, bolig, økonomi, familie, tid og kapasitet | Kan endres på andre måter enn rollebytte |
| Relasjoner og historie | Hvem personen kjenner og hva som har skjedd mellom dem | Følger personen gjennom rolleendringer |

Den aktuelle aktørkontrakten har én `role_ref` og eksplisitt rollehistorikk. For disse tre NPC-ene er referansen en karriererolle. Den er ikke i seg selv en registrering av lønn, ansettelse, autorisasjon eller personlig relasjon.

NPC-katalogets `voice` og `tags` gir en begrenset karakterbeskrivelse. De er ikke en full runtime-modell av temperament, individuelle ferdigheter eller familie. Karaktergrunnlaget i denne bolkens redaksjonelle oversikt beskriver disse nivåene for forfattingen; det er ikke en ny motor eller nye simulerte personlighetsskårer.

En arketype kan være utgangspunkt for drivkraft og konflikt. En stereotypi kan gi gjenkjennelig språk og sosial atferd. Historien må likevel bygge på den konkrete personens egenskaper, rolle, situasjon, relasjoner og tidligere handlinger.

Frodes lojalitet får en konflikt når han selv setter vaktplanen. Steins målbevissthet møter større forventninger når han blir avdelingsleder. Inger beholder kunnskap når hun mister beslutningsmyndighet. Dette er forbindelser mellom person og rolle som er forankret i de eksisterende arbeidsbuene.

## Omskrivingen

| Bue | Konkret motiv og utløsende hendelse | Videre følger |
| --- | --- | --- |
| Stein: Kampen etter arbeidstid | Stein inviterer til sin og Bjarnes fotballkveld. Solveig tar opp den omstridte bemanningen. | Deltakelse, avslag og jobbinnspill har egne fortsettelser; en lovnad om gjennomgang skilles fra en vedtatt endring. |
| Frode: Brorens konsert | Frode vil høre broren Per spille etter å ha gått glipp av konserter på grunn av vakter. | Et bilde i kollegagruppa møter den eksisterende vaktplankonflikten; et privat bilde og et avslag får andre følger. |
| Inger: En referanse og et jobbtilbud | Inger har søkt nytt lederansvar og ber om en referanse fra saker spilleren kjenner. | Hva spilleren sier, påvirker samtalen mellom dem. Inger vurderer tilbudets reising og takker selv nei. |

Det er 28 scenevarianter. Stein og Frode har forløp med tre eller fire kapitler, Inger med fire. Enkelte slutt- og informasjonsscener har ett lesevalg. Lengde og valgform følger innholdet.

Nye opplysninger etableres før de brukes: Per er Frodes bror, Stein og Bjarne pleier å se fotball sammen, og Inger ønsker begrenset reising. Dette er nye fiktive detaljer i de uregistrerte scenene, ikke påstander om tidligere lagret spillhistorie.

Scenekildene bruker eksisterende narrative-format og karakterlager:
- [Stein](../data/Civication/narratives/leisure/stein_hele_livet.json)
- [Frode](../data/Civication/narratives/leisure/frode_hele_livet.json)
- [Inger](../data/Civication/narratives/leisure/inger_hele_livet.json)

[Redaksjonell oversikt](../data/Civication/narratives/editorial/wholeLifeStoryBatchV1.json) inneholder personenes bakgrunn, egenskaper med styrker og begrensninger, kompetanse med kilde og avgrensning, verdikonflikter, roller, livssituasjon, mål, relasjon til spilleren og kunnskapsgrenser. Hver opplysning skiller mellom kataloggrunnlag, etablerte arbeidsscener, betingede valg, ny utkastfiksjon og redaksjonell tolkning. Ukjente forhold er uttrykkelig oppført. De øvrige katalogprofilene beholder status som forslag som trenger videre vurdering.

## Hva som er kontrollert og hva som gjenstår

Revisjon 4: Sju nye integrasjonstester består med faktisk kalender, SceneCatalog, private fasekilde, innboks, ChoiceDirector, NPC-lagring og dagprogresjon. Alle tre buer fullføres uten at arbeidsdagstelleren flyttes. Tilleggskontroller dekker ordinær jobbfordeling, ventende svar, private faser, innbokskanaler og arbeidsledig-flyten. Den redaksjonelle vurderingen av historiene nedenfor er historikk og er ikke automatisk oppgradert av tekniske tester.

Revisjon 3: De to målrettede filene `civication-npc-stein-role-story.test.js` og `civication-whole-life-story-drafts.test.js` bestod samlet **14/14** i én kjøring. Profilenes 22 scenehenvisninger og tre valgkoblinger er slått opp, og Steins mekanikkfelter er identiske med tidligere versjon. Se [personmodellens avgrensede vurdering](CIVICATION_PERSON_MODEL_V1.md) på 27/30. Dette endrer ikke aktiveringsstatusen eller den separate vurderingen av selve historieutkastene nedenfor.

Tidligere kontroll av revisjon 2:
`node --test tests/civication-whole-life-story-drafts.test.js` — 5/5 bestått.

Den besøker alle 28 varianter gjennom faktisk kildeadapter, ChoiceDirector, DailyMailBuilder og NPC-lagring. Den kontrollerer blant annet at avslag ikke blir konsert-/pubdeltakelse, private bilder ikke gir reaksjonen på deling i kollegagruppa, og avslag på referanse ikke oppretter spillerens referansesamtale. Den kontrollerer også avslutninger og bevart aktøridentitet.

Manuell gjennomgang av alle varianter har undersøkt motiv, etablerte opplysninger, spillerens handlingsrom og årsak til neste hendelse. Dette er en redaksjonell egenvurdering. Testresultatet er ikke bevis på kunstnerisk kvalitet.

Produksjonsmanifestet er bevart. Eksisterende NPC-kapitler bruker en arbeidsdagskvote; privat fremdrift og innbokslevering er rettet og testet i revisjon 4. Innholdsutkastene forblir uregistrerte. Steins arbeidsbue er rettet: Spilleren gir observasjoner og forslag som fagarbeider, mens lederne avklarer utlån og bemanning. Den tidligere påstanden om sidestilte ledere er fjernet. Scene-ID-er, valg-ID-er, effekter, tillitsendringer, flagg, dagkrav og rollehendelse er bevart.

Tillit, valg og scenehistorikk lagres. Reisetid, tidsbruk, billett og NPC-ens eksterne jobbsøknad er beskrevet i fiksjonen, ikke implementert som nye kalender-/økonomitransaksjoner. Ingen eksterne referansetelefoner eller bildedelinger er gjennomført.

## Historisk kvalitetsvurdering av uregistrert revisjon 2

| Dimensjon | Score | Grunnlag og begrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Roller, inngangsflagg og eksisterende egenskaper lest; ny fiksjon merket som ny kontekst. |
| Dekning og ferdigstillelse | 4/5 | Alle tre buer omskrevet og alle varianter gjennomgått; aktivering og videre karakterutvikling gjenstår. |
| Redaksjonell kvalitet | 3/5 | Motiver og årsakskjeder er konkretisert; ny versjon har bare forfatterens vurdering og er fortsatt et utkast. |
| Teknisk integritet | 3/5 | Målrettet test består; innbokslevering og privat dagfremdrift er ikke løst. |
| Sikkerhet og ansvarlighet | 5/5 | Fiktive NPC-er, avgrensede spillhandlinger, ingen eksterne konto- eller personhandlinger. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Eksisterende format og lagringseier; eksplisitt karaktergrunnlag, avslutninger og referanser. |

**23/30. Uregistrert revisjon, ikke produksjonsklart eller klassifisert som høy kvalitet.**
