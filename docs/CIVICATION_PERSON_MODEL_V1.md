# Civication – personmodell og karaktergrunnlag

Oppdatert 17. oktober 2026: Redaksjonell kontrakt for spilleren og fiktive NPC-er, med konkret grunnlag for Frode Aas, Stein Mæland og Inger Holm. Dette fastsetter hva videre historier kan bygge på. Generell simulering av personlighet, NPC-kompetanse og aktørkunnskap er ikke implementert.

Maskinlesbart grunnlag: [`wholeLifeStoryBatchV1.json`](../data/Civication/narratives/editorial/wholeLifeStoryBatchV1.json), feltene `person_model`, `player_basis` og hver bues `character_basis`. Opplysningene der er redaksjonelle og lastes ikke som nye runtime-egenskaper. Scenefilene eier fortsatt hendelsene. De tre private historiene er redigert og registrert i revisjon 5. Ny fiksjon blir kjent gjennom opplevde scener, ikke ved registreringen alene.

## En person kan ha flere roller

Frode, Stein og Inger er bestemte fiktive mennesker. Deres stabile ID-er følger dem gjennom rollebytter. «Formannen» eller «mellomlederen» er ikke hele personen. Navnet er heller ikke en utskiftbar etikett på en rolle.

Spilleren er brukerens spillfigur. Brukeren velger figurens handlinger; dette gir ingen fullmakt til å velge NPC-enes ønsker eller organisasjonens beslutninger. Figuren er ikke en registrering av brukerens virkelige personlighet, familie eller kvalifikasjoner.

| Lag | Spørsmål | Grunnlag og endring |
| --- | --- | --- |
| Identitet | Hvem er dette? | Stabil aktør-ID og navn. Bevares gjennom rollebytter. |
| Egenskaper og verdier | Hvordan pleier personen å møte situasjoner, og hva betyr noe for vedkommende? | Katalogbeskrivelse eller eksplisitt forfattervalg. En enkelthandling viser først og fremst den handlingen. |
| Kompetanse | Hva har personen faktisk vist at vedkommende kan? | Konkret erfaring, handling eller læringsprogresjon med avgrensning. |
| Roller og fullmakter | Hva forventes personen å gjøre, og hva kan vedkommende beslutte? | Rolle, faktisk organisering og uttrykkelig mandat i situasjonen. |
| Livssituasjon | Hvilke rammer lever personen innenfor? | Etablert arbeid, bolig, økonomi, tid, kapasitet og familieforhold. Ukjent er fortsatt ukjent. |
| Relasjoner og historie | Hvem kjenner personen, på hvilken måte, og hva har skjedd? | Bestemte relasjoner og opplevde hendelser. Bevares ved ny stilling. |
| Kunnskap | Hva vet denne aktøren nå, og hvor kommer det fra? | Egne erfaringer, mottatte utsagn og valgte handlinger. Forfatterens oversikt er større enn figurens kunnskap. |

En person kan samtidig være arbeidstaker, bror, venn og fotballinteressert. Disse forholdene erstatter ikke hverandre. Dagens `CivicationActorRoleContract` har én `role_ref` med rollehistorikk; den representerer karriererollen for de tre NPC-ene. Familie og vennskap skal ikke presses inn i denne referansen.

Eksisterende [klassifikasjon av ikke-karriere-roller](CIVICATION_NONCAREER_ROLE_TAXONOMY.md) gjelder: formell jobb, valgt livsposisjon, livsomstendighet og relasjon har forskjellige betydninger og eiere. Modellen her samler begrepene for forfatting; den samler ikke lagringen i en ny motor.

## Ferdigheter, dagsform og sosial anseelse – spillerens egen utvikling (2026-10-21)



Spillfiguren kan utvikles selv om vedkommende er arbeidsledig i lang tid. Life Stories om familie, venner, kjærlighet, et lokalmiljø, økonomi, skapende arbeid, kultur og samfunnsdeltakelse er **ikke underhistorier av en karriererolle**. Arbeidsstatus avgjør arbeidskontekst, ikke spillerens identitet eller adgang til private historier. Samtidig er en faktisk utført handling ikke et bevis på en komplett personlighet.



En utvidelse med **seks varige ferdighetsskalaer** er besluttet som produktmål, men ikke implementert som felles runtime. Hver ferdighet får etter forslag en 0–100-visning og utvikles gjennom *faktisk dokumentert erfaring*:



| Ferdighet | Hvordan den vises og trenes |

| --- | --- |

| Visdom / dømmekraft | Kildekritikk, forståelse av konsekvenser og velbegrunnede vurderinger i konkrete situasjoner |

| Sosial teft | Lytte, tolke signaler, reparere misforståelser og håndtere ulike personer |

| Kreativitet | Lage originale løsninger, nye forbindelser, kunst eller prototyper |

| Praktisk mestring | Planlegge og faktisk gjennomføre en avgrenset praktisk handling |

| Formidling | Forklare, argumentere, undervise, skrive eller presentere med mottaker og innhold |

| Handlekraft | Ta initiativ og følge en beslutning opp gjennom etterprøvbar handling |



**Ikke bland disse med** psyke, energi, integritet og handlingsrom (situasjon/dagsform), eksisterende sju kapitaldimensjoner, fagmeritter, eksisterende psykologikompetanse, job learning eller tillit hos en konkret NPC. Ferdighetspoeng krever eksplisitt kilderettet hendelse med unik ID og duplikatvern; besøk alene eller gjentakelse av samme quiz beviser ikke skårvekst. Verken rolle, score eller «sterk» karakter gir automatisk autorisasjon, jobb, nye venner eller kontroll over NPC.



**Streetkred er situert omdømme**, knyttet til hvem som har sett hvilke handlinger. Det kan for eksempel gjelde et musikk-, gatekunst- eller lokalmiljø, og kan være høyt ett sted og lavt et annet. Det skal bruke/utvide eksisterende anseelsesmodell med tydelige aktør- og miljøreferanser; ingen ekstra universell global score. `subculture`-kapital er en ressursdimensjon, ikke den samme målingen.



History Go-samlingen gir bakgrunn for *mulige* historier og beslutninger: opplevde steder, fagkunnskap, People-oppføringer, merker, observasjoner og notater. Å eie en People-oppføring skaper ikke en fiktiv NPC-relasjon. Det kreves opplevd scene og konsekvens; tidligere valg og minner må overleve jobbskifte, rollebytte, reload og senere dager.



Detaljert kilde-, spillerutviklings- og akseptansekontrakt: [CIVICATION_PLAYER_GROWTH_AND_HISTORY_GO_CONTRACT.md](CIVICATION_PLAYER_GROWTH_AND_HISTORY_GO_CONTRACT.md).

## Hva rollen sier om personen

Jobbrollen beskriver oppgaver, forventninger og ansvar. Den kan stille krav til kompetanse uten å bevise at innehaveren oppfyller dem.

| Opplysning | Hva den støtter | Hva den ikke avgjør |
| --- | --- | --- |
| En rolle krever planlegging | Organisasjonen forventer denne ferdigheten. | At personen planlegger godt. |
| Personen sier «jeg kan dette» | Personen har fremsatt en påstand. | At ferdigheten er demonstrert. |
| Personen lager én plan | Personen har utført denne handlingen. | At planen er god, gjennomført eller overførbar til alle situasjoner. |
| En svakhet i planen blir synlig | Dette arbeidet har en konkret begrensning. | At personen generelt er inkompetent. |
| Spillprogresjonen viser mestring | Den definerte læringsterskelen er nådd i spillet. | Virkelig autorisasjon eller ubegrenset fagkompetanse. |
| Personen får ny stilling | En bestemt rolleovergang er bekreftet. | Ny personlighet, automatisk mestring eller nye vennskap. |

Kompetanse og myndighet må også skilles: En fagarbeider kan ha det beste kunnskapsgrunnlaget om en linje uten å kunne flytte operatører mellom avdelinger. Inger kan kjenne en vedlikeholdsrutine uten lenger å kunne godkjenne den. Kompetanse gir innflytelse gjennom opplysninger og argumenter; beslutningsrett må ha eget grunnlag.

## Fakta, utkast og spillerens kjennskap

Her betyr kanon en etablert opplysning i fiksjonen, ikke et historisk faktum om et virkelig menneske. Katalogen og de registrerte arbeidsbuene er eksisterende grunnlag. De private historiene innfører nye hendelser først når de spilles. Registrering gjør dem tilgjengelige; den skriver ikke hendelsene inn som allerede opplevd.

| Status i data | Bruk |
| --- | --- |
| `catalog_fact` | Finnes i NPC-katalogen. En kilde for forfatteren, men ikke automatisk noe spilleren vet. |
| `established_in_work_scene` | Etablert i en registrert scene. Må først være opplevd i det aktuelle spillerforløpet. |
| `conditional_work_choice` | Gjelder bare hvis det oppgitte valget er tatt. |
| `authored_draft` | Ny fiksjon i et uregistrert forslag. |
| `authored_in_registered_scene` | Skrevet fiksjon i en registrert scene; kjent for spilleren først etter faktisk opplevelse eller mottatt beskjed. |
| `editorial_interpretation` | Begrunnet forfattertolkning, med rom for andre lesninger. Skal ikke omtales som bevist motiv. |
| `unknown` | Ikke etablert. Etternavn, yrke eller arketype kan ikke fylle hullet. |

Hver kompetanseopplysning har kildefil, scene, eventuelt valg, observasjon og begrensning. Den beskriver hva teksten faktisk viser. Et valg som ikke er tatt, gir ingen handling i spillerens historikk.

Forfatteren kan vite hvorfor en NPC handler. NPC-en kan kjenne egen bakgrunn og ha en vurdering av spilleren. Spilleren kjenner det vedkommende har opplevd og fått fortalt. Ingen av disse perspektivene skal automatisk arve de andres informasjon.

Tre konkrete grenser i de private historiene:

- Avslår spilleren Steins pubinvitasjon, er samtalen der ikke et eget minne. Steins senere melding kan gi kjennskap til hva han sier skjedde.
- Avslår spilleren Frodes konsertinvitasjon, kan vedkommende spørre hvordan det gikk. Spilleren kan ikke senere fortelle hva han selv så fra salen.
- Avslår spilleren Ingers referanseforespørsel, kjenner vedkommende ikke innholdet i Rogers samtale. Ingers opplysning om at Roger deltok er en mottatt opplysning.

Høy tillit åpner heller ikke kunnskap om ufortalte familieforhold. Et mottatt utsagn er kjent som utsagn; det er ikke uavhengig bekreftelse. Når en senere scene trenger en tidligere handling, må den ha en faktisk grenbetingelse eller tekst som passer begge valg.

Dagens narrative tilstand har progresjon og valgflagg. NPC-lageret har reaksjoner og rollehistorikk, men ingen generell kunnskapsmodell. Kravet om begrenset spillerkunnskap håndteres derfor gjennom scenenes vilkår og ordlyd. Et fremtidig felles kunnskapslager krever separat implementasjon; dette dokumentet hevder ikke at et slikt lager finnes.

## Frode Aas

Frode begynner som formann på B-skiftet. Katalogen beskriver ham som lojal til folkene og varsom med ord. Arbeidsbuen gir dette et konkret grunnlag: Han tar gjentatte vibrasjoner fra en mateenhet alvorlig og ber om observasjoner før ansvaret skyves mellom folk. Dette viser forståelse for et driftsproblem, men ingen dokumentert reparasjonskompetanse.

Etter utnevnelsen til mellomleder lager han en plan som dekker produksjonsmålet og samtidig legger krevende oppgaver på de samme operatørene. Hans kjennskap til gulvet og lojalitet er derfor ikke tilstrekkelig til å lage en god plan. Verdikonflikten er mellom hensynet til kollegene og leveringskravene han nå selv må svare for. Han kan lytte og endre vurdering uten at alle innvendinger automatisk forsvinner.

I fritidshistorien introduseres broren Per og ønsket om å høre bandet hans. Dette gir Frode et konkret privat mål. Det fastsetter ikke partner, barn, økonomi eller en hel livshistorie. Referansen til moren deres tilhører grenen der brødrene får bildet privat. Katalogtaggen `tillitsvalgt_uten_tittel` etablerer ikke et formelt verv.

Forholdet til spilleren begynner i arbeidet. En invitasjon kan gi en felles opplevelse hvis den aksepteres. Den gjør dem ikke automatisk til nære venner. Frodes varsomhet kan prege hvordan han sier fra; den skal ikke tvinge ham til å snakke i gåter.

## Stein Mæland

Stein begynner som mellomleder i naboavdelingen. Kollegialitet, målbevissthet og konkurranseorientering er kataloggrunnlaget. Han tar kontakt om en konkret leveringsfrist og søker senere større ansvar. Ambisjonen er forenlig med kollegial opptreden, men kan gjøre ham mer opptatt av egen avdelings mål enn belastningen han ber andre bære.

Arbeidsbuen viser at han kjenner en frist, etterspør ressurser og legger frem en plan. Det er et avgrenset kompetansegrunnlag. Den viser ikke at han allerede har lykkes med samordning mellom avdelingene. Ved valg A tar han imot fagarbeiderens observasjoner; ved valg B får han ikke disse innspillene. Begge forløp lar lederne avgjøre bemanningen.

Utnevnelsen til avdelingsleder gir et nytt ansvar. Spilleren er fortsatt fagarbeider i denne buen. De har aldri vært etablert som sidestilte ledere. Spillerens kritikk gjelder arbeidet og krever ikke personlig fiendskap. Tilsvarende kan Stein huske et avslag uten at det blir en ny generell egenskap ved spilleren.

Fotballvanen med Bjarne er ny fiksjon i fritidshistorien. Den gir Stein et ønske om sosial kontakt som også kan møtes med et avslag. Hvis jobbprat oppstår, må han skille mellom å høre et innspill, love en gjennomgang og beslutte en endring. Felles etternavn med Liv Mæland gir ingen etablert slektsrelasjon.

## Inger Holm

Inger begynner som avdelingsleder. Katalogen beskriver henne som tallorientert, lite synlig på gulvet og presset ovenfra. Tallorienteringen får både nytte og begrensning i arbeidsbuen: Hun legger frem et forslag basert på timeverk og ordre, men mangler opplysninger om nattskiftets bidrag ved maskinstans. Hun ber om eksempler før behandlingen. Anerkjennelsen av spillerens dokumentasjon finnes bare i grenen der den faktisk blir levert.

Etter omorganiseringen fortsetter hun med faglig koordinering som mellomleder og mister sitt tidligere budsjett- og personalansvar. Dette er et konkret organisasjonsvedtak. Andre mellomledere kan ha andre fullmakter. Hun kjenner fortsatt bakgrunnen for vedlikeholdsrutinen og kan bidra til grunnlaget, selv om en annen må godkjenne det.

Fritidshistorien gir henne ønsket om større ansvar igjen og en grense for hvor mye reising hun vil godta. Hun har egen søknad og tar selv stilling til tilbudet. Ønsket om å bo der hun bor fastsetter ingen adresse, familieforpliktelse eller økonomisk årsak. «Lite synlig på gulvet» gir heller ikke belegg for å skrive henne som sosialt hjelpeløs eller følelseskald.

Spilleren kan være referanse for sakene de har møttes i. Det er ikke en vurdering av hele hennes lederkarriere. At hun får et tilbud, gjør heller ikke spillerens referanse til den eneste årsaken. Et avslag på tilbudet endrer ikke hennes nåværende rolle.

## Spilleren og de eksisterende eierne

Spilleren har det samme skillet mellom person, kompetanse, rolle, livssituasjon og relasjon. Handlingsrommet kommer fra faktisk tilstand. Spilleren skal kunne gi observasjoner, avstå fra en oppgave, sette en privat grense eller være uenig uten at teksten tillegger vedkommende en skjult stilling eller en bestemt personlighet.

| Opplysning | Dagens eier | Hvordan den skal brukes |
| --- | --- | --- |
| Aktiv jobb | `CivicationState`, `hg_active_position_v1` | Les faktisk rolle og uttrykkelig mandat. |
| Læringsprogresjon | `CivicationJobLearningRuntime`, `state.job_learning_progress` | Bruk oppnådde steg, mestring og unlocks som spillprogresjon, jf. [datalagene](CIVICATION_DATA_LAYERS.md). |
| Livsposisjon og livsomstendighet | `CivicationLifePositions`, `hg_civi_life_positions_v1` | Bruk det spilleren har valgt eller fått registrert. |
| Personlige relasjoner | `CivicationRelationshipEngine` | Bruk eksisterende relasjonsstatus. Ikke utled den fra jobb-NPC-ens tillit. |
| NPC-reaksjoner og rollehistorikk | `CivicationNpcCharacterThreads`, `hg_civi_npc_character_threads_v1` | Bevar identitet, tillit og registrerte hendelser gjennom rollebytte. |
| Opplevde scener og valg | `narrative_state_v1` og eksisterende narrative eiere | La senere tekst samsvare med faktisk gren og progresjon. |

Lik begrepsmodell betyr ikke identisk runtime. NPC-ene har ikke automatisk spillerens læringssystem, personlige relasjonsnett eller økonomi. En jobb-NPC og en sosial katalogperson skal bare kobles med en uttrykkelig identitetskobling. Navnelikhet er utilstrekkelig. History Go People forblir separate kunnskapsreferanser.

## Grunnlag før flere historier

En ny scene trenger en konkret person med et aktuelt mål, en etablert situasjon og en hendelse som gir en grunn til å handle. Egenskapene skal påvirke hvordan personen møter situasjonen; de skal ikke gjøre alle aktiviteter til variasjoner av samme yrkesvits.

Før scenen brukes, skal forfatteren kunne peke på:

1. Hvilke opplysninger som allerede er etablert, og hvilke som først innføres i scenen.
2. Hva hver deltaker vet, og hvilken tidligere scene eller beskjed som ga denne kunnskapen.
3. Hva spilleren faktisk kan velge, og hvem som beslutter eventuelle følger for andre.
4. Hvordan neste scene følger av valgt handling, også ved avslag og taushet.
5. Hva som faktisk endres i lagret spilltilstand, og hva som bare beskrives i fiksjonen.

Ukjente biografiske detaljer fylles først inn når historien trenger dem og de kan introduseres ordentlig. For disse tre figurene er alder, utdanning, ansiennitet, privatøkonomi, konkret bosted og partner/barn ikke etablert i det gjennomgåtte katalog- og scenegrunnlaget. Det er rom for videre karakterutvikling, men ikke grunnlag for å presentere slike opplysninger som gamle minner.

I denne revisjonen er Steins første og siste arbeidsscene rettet til fagarbeiderens handlingsrom. ID-er, valg-ID-er, numeriske effekter, tillitsendringer, flagg, dagkrav og rollehendelse er bevart. Ingen ny lagringsmodell eller migrering følger av tekstendringen. Allerede lagrede tekstlige reaksjoner beholdes som historikk; rettingen endrer nye scenevisninger.

## Historisk vurdering av personmodellrevisjonen 16. oktober

Kontroll 16. oktober 2026: Én kjøring av `node --test tests/civication-npc-stein-role-story.test.js tests/civication-whole-life-story-drafts.test.js` bestod **14/14**. Den dekker de tre eksisterende rollebuene, bevart historikk etter reload og alle 28 private utkastvarianter. Ingen fullregresjon eller nettleserjobb ble startet.

En separat filkontroll slo opp alle **22 scenehenvisninger**, derav **3 med eksplisitt valg**, i profilene. Alle finnes. Mekanikkfeltene i hele Steins strøm ble sammenlignet med forrige commit etter at tekstfeltene var fjernet fra sammenligningen; de er identiske. `git diff --check` bestod. Alle tre profiler og den endrede sceneordlyden er lest manuelt mot katalog og scener.

| Dimensjon | Score | Evidens og grense |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Katalog, tre arbeidsbuer, private utkast og eksisterende eierskapskontrakter lest; kildehenvisninger slått opp. Tolkning er merket som tolkning. |
| Dekning og ferdigstillelse | 5/5 | Felles modell, spillergrunnlag og alle tre profiler dekker de avtalte nivåene. Steins fullmaktsbrudd er rettet i både innledning og oppfølging. |
| Faglig/redaksjonell kvalitet | 4/5 | Individuelle styrker, begrensninger og konflikter er knyttet til konkrete hendelser. Dette er en forfattervurdering av karaktergrunnlaget, ikke godkjenning av historienes litterære kvalitet. |
| Teknisk integritet | 4/5 | 14 målrettede tester består; profilreferanser og bevart mekanikk kontrollert. Generell kunnskapsmotor og privat dagfremdrift er ikke del av implementasjonen. |
| Sikkerhet og ansvarlighet | 5/5 | Spillfigur og fiktive NPC-er holdes adskilt fra brukerbiografi og History Go People. Kompetanse, fullmakt og ukjent bakgrunn skilles uttrykkelig. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Eksisterende redaksjonell fil og runtime-eiere brukes; konkrete scene-/valgreferanser, avgrensninger og ukjente forhold er synlige. |

**27/30 for personmodell og fullmaktsretting.** Vurderingen omfatter ikke produksjonsaktivering av de private historiene. PR-en inneholder fortsatt uregistrerte historieutkast med den tidligere separate vurderingen 23/30; dagfremdrift og innbokslevering er senere rettet og målrettet testet i [revisjon 4](CIVICATION_PRIVATE_NPC_DAY_INBOX_V1.md). Dette beskriver status ved revisjon 4. Revisjon 5 har en egen gjennomgang av alle 28 varianter og registrering i [historierapporten](CIVICATION_WHOLE_LIFE_STORIES_V1.md). Tekniske tester godkjenner ikke alene litterær kvalitet.
