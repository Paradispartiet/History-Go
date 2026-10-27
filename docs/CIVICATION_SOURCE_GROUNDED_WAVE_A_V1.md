# Civication – bolk A: verksforankring og åtte historieplaner

**Dato:** 18. oktober 2026. **Status:** Første bolk (33 scener / 66 valg) er videreført med **41 nye scener / 82 valg** for de samme åtte historiene. Samlet er 74 scener / 148 valg registrert i eksisterende Life Story-pakker. Oppfølgingsbolken er et nytt avgrenset fortellingsledd; den fullfører ikke minimum fire kapitler per bue. Verksanalysene er fortsatt redaksjonelle utkast basert på sekundærmateriale, ikke dokumentert nærlesning.

Dette dokumentet bygger videre på det allerede publiserte skjema- og synopsisgrunnlaget i `main`. Kildene til grunnfortellinger er:
**(1)** bøker fra brukerens kuraterte Goodreads-arbeidsbok, **(2)** IMDb-filmreferanser, **(3)** tilsvarende HG Film Producer-scenario-ID-er.
Disse tre mediekildene er ikke de samme som litterære spor `L01–L24`, de sju valgfrie Booker-linsene `P01–P07` og Civications fortellingstyper `C01–C24`; de tre sistnevnte er analyse- og dekningsakser.


## Tredje produksjonsbolk – Wave C (18. oktober 2026)

Den tredje bolken er samlet i `data/Civication/lifestory/editorial/inspiration/waveAThirdInstallmentsV1.json` og i de eksisterende, validerte rolle- og fortsettelsespakkene. Den omfatter **17 nye scener og 34 valg** fordelt på alle de åtte typene (C01/C02/C03/C05/C06/C07/C17: to hver; C23: tre). Samlet innhold etter denne PR-en vil være **91 scener / 182 valg** på tvers av Wave A, B og C. Disse er ulike betingede scener, ikke én påtvunget spillerreise.

Wave C er *konsekvensstyrt*: Ingen scene er automatisk tilgjengelig bare fordi spilleren har nådd en kalenderdag. Den krever et konkret valg fra Wave B og bruker samme `LifestoryRunner`, `LifestoryState` og innboksadapter som før. Hvis grunnlaget mangler i en eldre lagringsfil, finnes det ikke noe retrospektivt møte, besøk, vedtak, betaling, rengjort rom, publisering eller svar fra en person.

Produksjonskontrollen ligger i `tests/civication-source-grounded-wave-c.test.js` og skal kontrollere hver av de **34 valgrutene** mot faktisk kandidatutvelgelse, valgeffekt og uforandret historikk. Kontrollerte fortsettelsespakker for C02, C03, C07 og C23 beholder sine opprinnelige livsrolle- og badge-vilkår. Fortsettelseskravene om minst fire dramaturgiske kapitler per historie er ikke automatisk oppfylt av tre bolker, og full nettlesergjennomspilling av hvert enkelt spor er ennå ikke dokumentert.

**Kildepolitikk:** Tredje bolk arver `problem_ids`, `blueprint_id` og `work_ids` fra de kildeforankrede grunnsynopsene og dermed lenkingen mellom den kuraterte Goodreads-arbeidsboken, IMDb og Film Producer. Fortellerkonfliktene er redaksjonelle, ikke kopierte handlingsforløp eller påstått dokumentasjon fra nærlesning.

## Faktisk kildegrunnlag

Den tidligere lagrede, private arbeidsboken `Civication_samtidsfortellinger_og_litteraere_modeller.xlsx` inneholder et kuratert register `Alle 159` og arket `Civication 2026` med konkrete referanseverk for C01–C24. På grunnlag av disse er nå **24 av 24** synopsisene koblet til et faktisk verk fra arbeidsbokens 4–5-stjernersutvalg. Dette er en kontroll av **arbeidsbokens metadata**, ikke av en fersk original CSV og ikke en påstand om at bøkene nå er nærleset. Brukerens egne stjerner, datoer og notater lagres ikke i GitHub.

Tidligere `literary_inspiration.work` beholdes som **klassisk/litterær referansekandidat**, selv om denne ikke er del av det private Goodreads-utvalget. Det nye feltet `goodreads_primary` eier den verifiserte *verktilhørigheten til arbeidsboken*. **C14** er et konkret eksempel på viktig korreksjon: bildeboken *Dette er ikke min hatt* i eldre Civication-ark ble erstattet i voksensporet med *Fugletribunalet* av Agnes Ravatn, som står i `Alle 159`; barne- og ungdomsbøker går separat.

IMDb-film og Film Producer-scenario er fortsatt én felles filmreferanse sett gjennom **to kildesystemer**; ett ID-treff betyr ikke at filmanalysen er godkjent. Bolk A bruker dokumenterte forlagsomtaler, litteraturfaglig omtale og filmfaglige kilder for *avgrensede* påstander. Vi skal aldri gi en kildekontrollert synopsis et falskt skinn av at forfatteren har lest hele filmen eller boken ut fra disse kildene alene.

## Åtte historier – litterær og filmatisk inspirert fortelling, ny Civication-handling

| Civication | Kuratert Goodreads-bok | IMDb/Film Producer | Hva som overføres | Original Civication-historie |
| --- | --- | --- | --- | --- |
| **C01 – Jobbtap og verdighet** | [*Vernon Subutex 1*](https://www.gyldendal.no/skjonnlitteratur/romaner/vernon-subutex-1-9788205520141), Virginie Despentes | [*I, Daniel Blake*](https://www.bfi.org.uk/sight-and-sound/reviews/i-daniel-blake-first-look) – `scenario_i_daniel_blake_2016` | Sosial status og verdighet under økonomisk usikkerhet | Jonas inviterer til en kveld som koster penger samme dag som spilleren har en privat frist. Åpen grense og privat avslag får forskjellige senere samtaler. |
| **C02 – Muligheten uten garanti** | [*The Brooklyn Follies*](https://www2.publishersweekly.com/978-0-8050-7714-8), Paul Auster | [*Searching for Sugar Man*](https://player.bfi.org.uk/rentals/film/watch-searching-for-sugar-man-2012-online) – `scenario_searching_for_sugar_man_2012` | Kunstnerisk håp uten kontroll over hvordan andre reagerer | Mira får en mulig spilleforespørsel. Spilleren kan bidra til avklaring eller holde fast ved øving; hun bestemmer selv om hun svarer arrangøren. |
| **C03 – Drømmen og regningene** | [*Imot kunsten*](https://www.gyldendal.no/skjonnlitteratur/romaner/imot-kunsten-9788205396166), Tomas Espedal | [*Paterson*](https://www.bfi.org.uk/lists/10-great-films-about-poets) – `scenario_paterson_2016` | Hverdagslig arbeid som kan være skapende uten karrieremyte | Lea ønsker hjelp til én konkret prototypedetalj. Spilleren kan bidra en time eller sette en grense; ingen av handlingene etablerer en bedrift. |
| **C05 – Byråkratiet og personen** | [*Jesu barndom*](https://www.cappelendamm.no/boker/jesu-barndom-jm-coetzee-9788202477356), J. M. Coetzee | [*Brazil*](https://www.bfi.org.uk/film/bb840dfa-f69d-576b-bd99-dfa28efd4595/brazil) – `scenario_brazil_1985` | Ulikt systeminnsyn og personens behov for å bli forstått | NAV trenger et vedlegg; spilleren kan sende med sporbar kvittering eller søke konkret avklaring. Ingen av grenene gir automatisk vedtak. |
| **C06 – Faglig integritet** | [*Professor Andersens natt*](https://septentrio.uit.no/index.php/nordlit/nb/article/view/8012), Dag Solstad | [*12 Angry Men*](https://www.bfi.org.uk/lists/sidney-lumet-network-10-essential-films) – `scenario_12_angry_men_1957` | Ansvar for handling/unnlatelse og beslutning ved ufullstendige fakta | Arealplanleggeren mangler en skoleveimåling. Faglig forbehold eller forespørsel om utsettelse har ulike følger; politikerne avgjør selv. |
| **C07 – Tilhørighet mot frihet** | [*Vernon Subutex 1*](https://www.gyldendal.no/skjonnlitteratur/romaner/vernon-subutex-1-9788205520141), Virginie Despentes | [*Dheepan*](https://player.bfi.org.uk/rentals/film/watch-dheepan-2015-online) – `scenario_dheepan_2015` | Grenser og egeninteresser i et fellesskap; ikke likestilling av frivillighet og flukt fra krig | Arvid inviterer først som gjest, så kommer en egen forespørsel om vakter. Et begrenset ja og et nei er begge troverdige. |
| **C17 – Å arbeide seg tom** | [*Genanse og verdighet*](https://bergenbibliotek.no/litteraturen/til-kjernen/kjerneboker/solstad-dag-genanse-og-verdighet-1994), Dag Solstad | [*The Machinist*](https://www.paramountpictures.com/movies/the-machinist) – `scenario_the_machinist_2004` | Arbeidsidentitet, skam og sikkerhet, men uten å overføre ekstrem søvnmangel eller filmens psykologiske plott | Renholderen får for mange soner. Spilleren kan be Kari prioritere eller melde et konkret HMS-avvik; lederen eier bemanningen. |
| **C23 – Feilen som ikke forsvinner** | [*Genanse og verdighet*](https://bergenbibliotek.no/litteraturen/til-kjernen/kjerneboker/solstad-dag-genanse-og-verdighet-1994), Dag Solstad | [*Fargo*](https://www.bfi.org.uk/sight-and-sound/features/joel-ethan-coen-brothers-fargo-1996) – `scenario_fargo_1996` | En begrenset feil med senere, ulike sosiale konsekvenser | En mottaker oppfatter Leas skisse som et tilbud. Spilleren kan hjelpe med en presisering eller avgrense hvem som fikk den. Ingen kriminalitet eller automatisk kontrakt. |

### Fortellingskrav for bolken

Planbaselinen før kapittelskriving: De åtte blueprints har **40 konkrete beats**, det vil si i hovedsak fem per historie: foranledning, nytt press, spillerhandling, umiddelbar ettervirkning og senere tilbakekomst. De har **16 forskjellige handlingsvalg**, hver med egen kostnad og senere respons, og minst to betingede mulige avslutninger per historie. Det er ikke 40 registrerte runtime-scener.

Ingen fortelling forutsetter at et møte, en innsending, en arbeidsoppgave eller et familiært faktum har skjedd bare fordi forfatteren planla det. Grensene ligger i `continuity.choice_gate_plan` og `continuity.forbidden_assumptions`, og er nå oversatt til scenevilkår og valgflagg for de første kapitlene. Senere kapitler må beholde samme krav. Der en NPC skal bestemme noe, bestemmer NPC-en det selv.

**Felles produksjonsfiler:**

- [`waveAUniversalProblemsV1.json`](../data/Civication/lifestory/editorial/inspiration/waveAUniversalProblemsV1.json) – åtte særskilte, kildebelagte **utkast** til verks- og samfunnsanalyse, som følger `universalProblemV1.schema.json`.
- [`waveARoleStoryBlueprintsV1.json`](../data/Civication/lifestory/editorial/inspiration/waveARoleStoryBlueprintsV1.json) – åtte konkrete **utkast** til rollespesifikke historier som følger `roleStoryBlueprintV1.schema.json`. Planfilens opprinnelige `production.playable=false` beholdes som blueprint-baseline. Faktisk kapittelstatus eies nå av `waveAChapterBindingsV1.json` og de konkrete runtime-filene, ikke av en retrospektiv oppgradering av alle planens framtidige beats.
- [`storyCoverageInventoryV1.json`](../data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.json) – C01, C02, C03, C05, C06, C07, C17 og C23 har konkrete blueprint-ID-er og `runtime=registered_first_installment`. De øvrige 16 er uforandret.

## Første spillbare kapitler

| Historie | Faktisk innholdspakke | Dager | Nytt innhold |
| --- | --- | --- | --- |
| C01 | arbeidsledig/scenes.json | 4–6 | Invitasjon, Jonas sitt svar, bekreftet eller avlyst tur. Et privat nei deler ikke regningen. |
| C02 | musikk_med_mira.json | 8–9 | To åpninger for avtalt prøve eller hjemmearbeid; sendte spørsmål og ubekreftet tilbud holdes adskilt. Pausegrenen får ingen ny forespørsel. |
| C03 | sideprosjekt_med_lea.json | 8–10 | Prosjektbyggerens egen pappmodell; avgrenset test, avlysning og pause har hver sin tilbakekomst. Spillerens prosjekt er fortsatt en annen sak. |
| C05 | arbeidsledig/scenes.json | 5–7 | Nytt, spesifisert vedlegg om arbeidstid, separat fra tidligere sluttdato. Kontaktforsøk, presisering og rettidig/sen mottakskvittering er ulike hendelser. |
| C06 | arealplanlegger/scenes.json | 3–4 | Eksisterende snarveitelling kan ikke fylle hullet ved nedkjørselen. Plansjefens faktiske svar bestemmer dokumentflyten. |
| C07 | miljo_med_arvid.json | 8–10 | Sosial invitasjon og separat vaktforespørsel; én time, avlysning, gjestebesøk og hjemmevalg. Aktiv avstandsgren får ingen ny invitasjon. |
| C17 | renholder/scenes.json | 3–4 | Registrert sonearbeid, manglende tilkomst og lederprioritering. Registrert avvik er ikke det samme som flyttet hylle. |
| C23 | sideprosjekt_neste_steg.json | 11–13 | To dokumenterte mottakere; teksthjelp eller mottakssporing. Sendt presisering gir ikke automatisk lesebekreftelse fra begge. |

`waveAChapterBindingsV1.json` kobler hver historie til blueprint, problemanalyse, bok-/film-ID-er og nøyaktige scene-ID-er. IMDb og Film Producer-sporet kan følges videre gjennom de eksisterende problemanalysene. Ingen nye kildepåstander om verkene innføres i kapitteltekstene.

**Identitet:** Spilleren er hovedperson. Mira = `mira`/medmusikeren, Lea = `lea`/prosjektbyggeren og Arvid = den eksisterende `amir`/miljøkontakten. Ingen nye spillerroller eller historiske biografier opprettes. Representantvalget og alle tidligere scener er bevart.

**Avgrensning:** NAV-dokumentet, regningen, målepunktet og romstatusen er nye fakta i fiktive scener. De er ikke påstander om brukerens forhold, generelle NAV-regler eller faktiske kommunale saker. Regningen er omtalt som bakgrunn for et sosialt valg; denne bolken betaler den ikke og oppretter ikke automatisk gjeld eller inntekt.

**Lagring:** Nye flagg har prefikset `wa_`. Nye tråder har prefikset `wave_a_`. De eksisterende sceneobjektene, valgeffektene, personene og representantene endres ikke. Eldre saves får ikke tilbakedaterte valg eller møter; kapitler på allerede passerte dager fylles ikke inn som gjennomførte. Pakker og tråder lastes gjennom dagens manifest og fortsettelsesdeklarasjoner uten ny motor eller loader.

### Kontroll og kvalitetsvurdering

`node tests/civication-source-grounded-wave-a.test.js` spiller alle **66 nye valg i 33 scener**, fordelt på **84 avgrensede forløp**, med **1 559 serialiseringer og gjenopptakelser**. Den kontrollerer også kildebindinger, avlyste møter, private avslag, ubekreftet konsert, avstandsgren, mottakeravhengig kunnskap, gammel historikk, penger og retur etter rollebytte. Dette er runner-integrasjon, ikke en nettleserverifisering eller bevis på litterær kvalitet. Eksisterende målrettede tester for renholder og Life Story-motoren er også kjørt.

Alle 33 nye scenetekster og alle 66 konsekvenstekster er manuelt gjennomgått for årsakssammenheng, kunnskapsgrenser, rollemyndighet og emnespesifisitet. Verksanalysenes opprinnelige kildestatus beholdes.

| Dimensjon | Score | Etterprøvbart grunnlag |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Konkrete rolle-/aktør-ID-er og kildebindingsfil; ingen påstand om ny nærlesning. |
| Dekning og ferdigstillelse | 5/5 | Første kapitler for alle åtte avtalte historier; alle nye valg faktisk spilt. Hele buer er videre produksjon. |
| Redaksjonell kvalitet | 4/5 | Samtlige nye tekster gjennomgått; ulike konkrete problemer, egne interesser og avgrensede handlinger. |
| Teknisk integritet | 4/5 | Eksisterende validator og runner, arkivbevaring, grenrekkevidde og rollebytte. Ingen ny nettlesertest. |
| Sikkerhet og ansvarlighet | 5/5 | Original fiksjon, ingen persondata eller diagnostikk, ingen automatisk økonomi eller vedtak. |
| Vedlikeholdbarhet | 5/5 | Data i eksisterende pakker, egne flagg og åtte eksplisitte kilde-/scenebindinger med kjørbar test. |

**Sum: 27/30 for denne avgrensede kapittelbolken.** Vurderingen er en egenvurdering av innhold og teknisk integrasjon, ikke uavhengig fagfellevurdering eller godkjenning av de fullstendige buene. Ordinær GitHub-CI må bestå på sluttcommit før merge.

## Neste produksjonssteg

Utvid de åtte påbegynte buene mot minimum fire kapitler hver. Behold fullførte, avlyste og åpne utfall som ulike innganger; senere kapitler skal også kunne starte etter eldre saves som aldri har spilt denne bolkens første scener. Skriv neste samlede innholdsbolk før ny målrettet kontroll.

**Merk:** En publisert synopsis er ikke det samme som et utkast fra denne kildeplanen. Stein, Frode og Inger er fremdeles tre registrerte historier uten påstått film-/bokattribusjon. Ikke legg inn retrospektiv inspirasjon som et historisk faktum uten særskilt verk- og sceneanalyse.

## Integrasjonsrettelser etter ordinær PR-kontroll

Den første ordinære kontrollen bestod 706 av 719 testfiler. Ti avvik kom fra samme utdaterte karrierematrise: den nye kapitteltesten skulle inngå i evidenslisten for arealplanlegger og renholder. Matrisen er regenerert; ingen karriereterskler eller rollekrav er endret.

De tre øvrige avvikene håndteres i de berørte testene:

- Mira-testen spiller nå den nye C02-scenen før dagsoppsummering og omstart, og kontrollerer at pause/gjenopptakelse beholder akkurat denne scenen.
- Kapitteltesten identifiserer en faktisk avslutningsscene gjennom effekten som fullfører hovedtråden, uavhengig av rekkefølgen i JSON-filen.
- Arvid-testen beholder alle opprinnelige valgkombinasjoner, tidligere historier, senere kapitler og gjenopptakelser. Den uavhengige C07-tråden spilles med standardvalg i denne testen for å unngå et voksende kryssprodukt; samtlige nye C07-valg og avstandsgrenen dekkes av den egne bolktesten. Ingen timeout økes, og ingen spillscene fjernes.

Målrettet kontroll: `node tests/run-civication-tests.mjs source-grounded-wave-a lifestory-arvid-continuation lifestory-mira-continuation narrative-three-level-continuations career-gameplay-matrix`. Ordinær GitHub-CI må bestå på sluttcommit før merge.

Etter matriseregenereringen bestod 714 av 719 testfiler i ordinær CI, inkludert alle kapitteltestene. De fem resterende testfilene pekte på én avhengig, utdatert rapport: `roleWorldRolloutReadiness.json`. Denne er regenerert i samme avhengighetskjede. Diffen legger kun til den nye bolktesten i kildehenvisningene for arealplanlegger og renholder; rolleklassifikasjoner, produksjonspolitikk og den lesbare rapporten er uendret. De fem berørte readiness-/filmproduksjonstestene består samlet på 11,8 sekunder.

## Andre produksjonsbolk – faktiske følger av første valg

`waveASecondInstallmentsV1.json` binder de 41 nye scenene til de samme åtte blueprints, problemanalysene og bok-/film-ID-ene. Prefikset `wave_b_` betegner andre runtime-bolk for **produksjonsbølge 1**, ikke de åtte andre historiene i produksjonsbølge 2. Nye historikkflagg heter `wa_b_cXX_*`. Ingen nye kildepåstander eller motorendringer innføres.

| Historie | Pakke og dager | Ny handling og kunnskapsgrense |
| --- | --- | --- |
| C01 | arbeidsledig, dag 7 kveld | Jonas spør hva slags støtte spilleren ønsker etter faktisk tur. Sen avlysning, tilbaketrukket forslag og privat avslag har egne innganger. Regningen blir ikke betalt av denne samtalen. |
| C02 | musikk_med_mira, dag 10 | Arrangøren ber om fortsatt interesse uten dato/honorar. Medmusikeren bestemmer selv sitt svar. En satt frist kan løpe ut uten tilbud; alternativt brukes tiden på spillerens egen musikkskisse eller fri. |
| C03 | sideprosjekt_neste_steg, dag 11–12 | Bare spilleren som ba om oppdateringer får en ny testforespørsel. En faktisk prøve skiller tynne og tykke kort og leder til en smalere prototype eller et åpent forsøk. Avsluttede bidrag og pauser gjenåpnes ikke automatisk. |
| C05 | arbeidsledig, dag 7 ettermiddag | Samme dags oppfølging av mottak, statusspørsmål, sen innsending eller konkret hjelp. Bare ny valgt innsending etter hjelp lager ny kvittering. Ingen gren gir vedtak. Dette er ikke et nytt flerdagerskapittel. |
| C06 | arealplanlegger, dag 5–6 | Fire dokumentforløp møter et tilbud om bare halve observasjonsperioden. Valgt observasjon gir sju kryssinger i ett kvarter, med eksplisitte begrensninger. Alternativet beholder dokumentasjonshullet og en mulig anbefaling om mer tid. |
| C07 | miljo_navnet_ditt, dag 11 kveld | Fem ulike erfaringer gir en privat vurdering av ønsket tilhørighet. Ingen ny kontakt, vakt, fullmakt eller avmelding sendes av notatet. Den andre tråden om navnet på invitasjonen beholder sine egne avtaler. |
| C17 | renholder, dag 5–6 | Tilkomst skilles fra renholdstid, eller en annen oppgave tildeles. Et faktisk driftsbesøk kan la hyllen stå. En inngangsrunde blir bare ferdig når spilleren velger å utføre den; lageret blir aldri kvittert ut. |
| C23 | sideprosjekt_etter_neste_steg, dag 14–15 | Tre ulike utsendingsstatuser leder til synlig ny oppfølging eller avsluttet bistand. Bare oppfølgingen gir nye forståelsesbekreftelser fra begge. Avklaring fjerner ikke mottakerens allerede brukte planleggingstid. |

Alle opprinnelige sceneobjekter er bevart. Eldre lagringer uten førstebolkens forutsetningsflagg får ingen oppdiktet deltakelse. C03-tråden er deklarert lokalt og vilkårsstyrt også når pakken nås fra frilans- eller gründerforløpet, der den første prototypetesten aldri fant sted.

### Verifikasjon og kvalitetsvurdering av oppfølgingsbolken

Den utvidede `tests/civication-source-grounded-wave-a.test.js` spiller samtlige **148 valg i 74 scener** på tvers av de to bolkene. Den sjekker serialisering/gjenopptakelse, bevart arkiv, faktisk valgavhengig observasjon, kvitteringer, deltakelse, mottakerforståelse og fravær av automatisk pengeflyt. Eksisterende Arvid-test beholder alle sine opprinnelige valgkombinasjoner; begge uavhengige produksjonsbolker dekkes fullstendig av bolktesten. Dette er runner-integrasjon og eksisterende DOM-regresjon, ikke en ny manuell nettlesergjennomspilling.

| Dimensjon | Score | Evidens og avgrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Åtte bevarte verk-/problemkoblinger; konkrete inngangsflagg for hver tilbakekomst; ingen ny påstand om nærlesning. |
| Dekning og ferdigstillelse | 5/5 | Oppfølging for alle åtte innen denne bolkens scope, alle 82 nye valg spilt. Fire fulle kapitler per bue gjenstår som samlet mål. |
| Faglig/redaksjonell kvalitet | 4/5 | Alle 41 nye scener og konsekvenstekster gjennomgått; egne problemer, aktørinteresser, kostnader og kunnskapsgrenser. C07 er et bevisst roligere refleksjonsledd. |
| Teknisk integritet | 4/5 | Eksisterende runner/validator, alle grener og saves kontrollert; relevante kapittel-/rolle-/DOM-tester. Ingen ny UI eller motor. |
| Sikkerhet og ansvarlighet | 5/5 | Original fiksjon; ingen automatisk stønadsavgjørelse, økonomi, politisk vedtak eller farlig løft; rollemyndighet avgrenset. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Én ny bindingsfil, data i etablerte pakker, egne flagg, samme utvidede bolktest; eksisterende scener bevart. |

**Egenvurdering: 27/30 for oppfølgingsbolken**, med ordinær CI som separat mergevilkår. Dette er ingen uavhengig redaksjonell vurdering av hele historiebuer. Videre arbeid er neste fortellingsledd for de samme åtte, med lengre tilbakekomster også etter første spilluke.

Målrettet kontroll på oppfølgingsbolken: **7/7 testfiler bestått (47,7 sekunder)** med `node tests/run-civication-tests.mjs source-grounded-wave-a lifestory-arvid-continuation lifestory-mira-continuation narrative-three-level-continuations lifestory-renholder career-gameplay-matrix role-world-rollout-readiness`. Bolktesten gjennomfører 146 forløp og 2 950 lagringer/gjenopptakelser. Karriere- og readiness-generatorene ble kjørt i avhengighetsrekkefølge og ga ingen nye avledede differ. `git diff --check` består.


Oppfølgingsbolkens første ordinære CI bestod **718/719 testfiler**. Den eneste feilen lå i `civication-lifestory-project-continuations.test.js`: utvalget ved kapittelovergang tok med beholdt/parkert hovedprosjekt, men ikke alle uavhengige C03-utfall. Testen fører nå også faktisk avlyst test, beklagelse, pause, avsluttet bidrag og oppdateringsønske videre til `sideprosjekt_neste_steg`. Alle ni opprinnelige rolleoverganger og kravet om å spille alle valg beholdes. Ingen spillscene, valgeffekt, timeout eller dekningsassert fjernes. Den reparerte prosjekttesten og bolktesten består samlet **2/2 (40,4 sekunder)**. Ordinær CI kjøres på den nye sluttcommit før merge.

## Akseptanse for situasjonsstyrte innganger og historikk

[Overgangskontrakten for de åtte historiene](CIVICATION_WAVE_A_STORY_DELIVERY_ACCEPTANCE_V1.md) beskriver hva som må testes i felles kalender, innboks og «Min dag»: passert avtaletid uten oppmøtebevis, jobb-/arbeidsstedsbytte, dobbelt svar, avvist svar, gamle lagringer og pause/avslutning. Den nye målrettede `civication-wave-a-transition-safety.test.js` dekker foreløpig bare grunnmotorens transaksjonsgrenser; den godkjenner **ikke** en ikke-committed inngangsproduksjon med 89 scener/178 valg. Dette avsnittet endrer ikke eksisterende scenestatus eller verksanalyse.

### Wave C – etterkontroll mot eksisterende regresjoner

Wave C bruker eksisterende innholdspakker. Både C01 og C05 er i `roles/arbeidsledig/scenes.json`, derfor avgrenser Wave C-regresjonen nye scener per `story_type_id` før den kontrollerer forgjengervalg; et generelt `wave_c_`-filter ville blande fortellingene. Arvid-testen beholder sine opprinnelige fullstendige kapittelvalg, men lar Wave A–C håndteres av de dedikerte bolktestene. Renholderpakken har nå fem opprinnelige arbeidstråder og tre C17-ledd, ikke to. Den genererte karrierematrisen er synkronisert mot disse innholdsendringene uten å endre policy. Ordinær CI er fortsatt selvstendig mergevilkår.

## Wave D – fjerde dramaturgiske innholdsbolk (34 scener, 68 valg)

Det er skrevet **34 nye scener** som dekker **begge faktiske valg fra samtlige 17 Wave C-scener**, og to nye alternativer i hver av disse oppfølgingene (**68 nye valg**). Samlet for de fire redaksjonelle innholdsbolkene er kataloggrunnlaget **125 scener og 250 valg**. Dette er en sum av forfatterstyrte alternativer, ikke innhold én spiller får i samme gjennomspilling.

| Historie | Scener | Spilledag | Historisk årsak og videre konsekvens |
| --- | ---: | ---: | --- |
| C01 – Vennskap og grenser | 4 | 7, kveld | Jonas, invitasjon og retten til kontakt uten rapporteringsplikt; ingen avtalt dato oppstår uten svar fra begge. |
| C02 – Muligheter uten garantier | 4 | 10, kveld | Medmusikeren kan bearbeide skuffelse og låtinnspill uten at et ubekreftet oppdrag blir til konsert. |
| C03 – Prosjekt og dokumentert nytte | 4 | 12, kveld | Forsøksstatus, samtykke og målekriterier er separate fra publisering, bruk og dokumentert nytte. |
| C05 – Dokumentasjon og uavklarte vedtak | 4 | 7, kveld | Registrert dokument, kontrollert lesbarhet og formelt vedtak får aldri samme betydning. |
| C06 – Faglige forbehold | 4 | 7, ettermiddag | Neste arbeidsdag: ansvarlig leder og fagperson er forskjellige, manglende observasjoner blir ikke fylt med antakelser. |
| C07 – Tilhørighet og grenser | 4 | 12, kveld | Neste dag: privat kontakt og frivillig innsats er forskjellige; sosialt ønske er ikke en vaktavtale. |
| C17 – Arbeidskapasitet og tilkomst | 4 | 7, ettermiddag | Neste arbeidsdag: rengjort inngang og blokkert lager beholdes med ulike statuslinjer. |
| C23 – Feilinformasjon og tillit | 6 | 16, ettermiddag | Neste dag: korreksjon, faktisk forståelse, dokumentert mottak og mulig tillitsbrudd håndteres hver for seg. |

**Kausal kontrakt:** Hver Wave D-scene krever nøyaktig ett `wa_c_*`-flagg, skrevet av ett bestemt *valg* i den kanoniske Wave C-scenen. Ingen ny utgang aktiveres ved ukjent eller annet tidligere valg. Wave D skriver egne `wa_d_*`-flagg og ikke lønn, stønadsvedtak, godkjenning, oppmøte, avtalt booking eller utført renhold.

**Redaksjonell kapittelgrense:** «Fjerde bolk» betyr fjerde produksjonslag, **ikke** et teknisk selvstendig kapittel for alle historiene. C01, C02, C03 og C05 får et sammenhengende etterspill den samme siste kapiteldagen; de fire øvrige historiene får minst én ny spilledag. Et fremtidig eget, senere kapittel for samtlige åtte krever eksplisitte fortsettelsespakker og innkobling i eksisterende kalender, innboks og «Min dag». Det skal ikke simuleres ved å endre lokalt klokkeflagg eller finne på gjennomførte handlinger.

Verkskoblinger fra Goodreads og IMDb, med den eksisterende Film Producer-proveniensen, følger uendret fra Wave A–C. Registeret `data/Civication/lifestory/editorial/inspiration/waveAFourthInstallmentsV1.json` dokumenterer for hvert scene-ID både bok/film, problem, parent scene, eksakt parent choice og inngangsflagg. Det er ikke fremsatt noen ny påstand om nærlesning eller ny verksanalytisk verifikasjon.

Den nye målrettede `tests/civication-source-grounded-wave-d.test.js` er ment å utføre **68 runner-ruter**, kontrollere proveniens, låsing før tidligere valg, én aktiv konsekvens etter hvert valg, lagringsarkiv og manglende automatisk betaling. Dager som krever seinere kalenderhendelser testes ved en *syntetisk testklokke* med allerede registrert foregående faktisk valg; dette erstatter **ikke** full ende-til-ende-avspilling av den mellomliggende dagen. Test- og CI-status holdes adskilt fra at innholdet er forfattet.

**Wave D målrettet preflight:** den nye runner-testen og renholder-testen ble kjørt før GitHub Actions publiserte synkroniserte karriere-/readiness-data. Engangs-workflowene er deretter fjernet. Dette er ikke en full gjennomspilling av alle rolle- og livsoverganger, og ordinær PR-CI gjenstår som eget mergevilkår.

**Publiseringsrekkefølge:** Wave C ble merget til `main` gjennom PR #6374 (squash `aad89734e065d2ccd49d65dc00fe47088cf9e3e8`). Wave D er deretter synkronisert mot dette `main`-grunnlaget og PR #6377 er flyttet til `main` som base. De 34 nye scene-ID-ene og 68 valgene er bevart; ordinær Civication-CI på Wave D-sluttgrenen er fortsatt det siste mergevilkåret.


## Femte produksjonsbolk – Wave E (18. oktober 2026)

Wave E fortsetter **C01 (Jonas og vennskapets grenser)** og **C05 (dokumentasjonskrav og uavklart status)** *etter* den første uka, på spillerens felles livsdag – ikke på jobbpakkens lokale dag. Det er skrevet **24 egne scener med 48 valg**: 16 konsekvenser tidligst livsdag 9, og 8 videre kapitelscener tidligst livsdag 12. Totalt for Wave A–E: **149 scener og 298 valg**. Dette er alternative forløp, ikke scener alle spillere får i én gjennomspilling.

Inngangene krever det dokumenterte Wave D-valget og minst to forløpte livsdager siden det faktisk ble spilt. Neste kapittel krever et Wave E-valg og ytterligere tre livsdager. Uten arkivert handling med tidsstempel opprettes ingen gammel hendelse eller et tilbakedatert svar. Ikke tolk en kvittering som vedtak, et utkast som sendt brev eller en åpen invitasjon som en møteavtale.

Rolleuavhengig historikk for C01/C05 synkroniseres ved jobbbytter: de aktuelle flaggene, gjennomførte scenene og faktiske arkivlinjene følger spilleren. Jobbspesifikke fortellingsflagg og rollearbeid blir i sine respektive pakker. Den eksisterende Min dag-runneren brukes fortsatt. Når et senere privat kapittel er åpent, kan spilleren gå videre i livsdager selv om den lokale jobbuka er ferdig, uten å måtte fullføre en urelatert Badge-gatet fortsettelse. Dersom en egen valgt fortsettelse også er tilgjengelig, beholdes den som alternativ.

Kontrakt og kilder: `data/Civication/lifestory/editorial/inspiration/waveAFifthInstallmentsV1.json`, `data/Civication/lifestory/life/{threads,scenes}.json`, `tests/civication-source-grounded-wave-e.test.js`. Goodreads/IMDb/Film Producer-ID-ene videreføres fra Wave D uten å utgi verksreferansene for dokumentert nærlesning. Browser/mobilopplevelse er ikke kontrollert i denne innholdsbolken.


## Wave F – åtte forløp etter dokumenterte valg (19. oktober 2026)

Wave F er en større produksjonsbolk med **68 nye, individuelt forfattede scener / 136 valg**, fordelt på åtte historier. Wave A–F har dermed **217 scener / 434 valg** totalt som forfattet innhold. Dette er alternative forgreninger, ikke at alle scenene kan spilles i én gjennomgang. Wave F har 8 utfall hver i C01, C02, C03, C05, C06, C07 og C17, samt 12 utfall i C23.

- **C01** følger Wave E-valg om kontakt, pause, tydelige grenser og fortsatt uavklarte invitasjoner.
- **C05** følger Wave E-valg om saksmappen, usendte spørsmål, dokumenterte kvitteringer og fortsatt uavklarte vedtak.
- **C02** fortsetter etter de åtte faktiske Wave D-valgene om en medmusikers tid, uforpliktende råd og ubekreftede oppdrag.
- **C03** holder prototypen for Lea opp mot samtykke, testkriterier og påstander om nytte.
- **C06** følger faglige forbehold og etterprøvbare dokumenter uten å finne på lederbeslutninger.
- **C07** skiller sosial tilhørighet fra avtalt vaktarbeid og respekterer ønsket om pause.
- **C17** skiller utført renholdsarbeid fra hindret tilkomst og tiltak som ennå ikke er bekreftet.
- **C23** holder rettelse, mottakerreaksjon, spredning og utprøving av nye rutiner atskilt.

**Tidskontrakten:** Nye scener er delt privat livshistorikk i `life/scenes.json`. De åpnes på `livsdagFra` (fra livsdag 12 til 22, avhengig av historien) og tidligst fire forløpte `livsdag` etter et faktisk lagret Wave D- eller Wave E-valg. En flaggverdi uten arkivert og tidsfestet hendelse er ikke tilstrekkelig. Ingen innkommende melding, beslutning, booking, befaring, gjennomført test eller vakt skal antas uten at det faktisk er forankret i spillerens valghistorikk. Privatlivets valghistorikk bevares ved jobbbytter, mens jobbspesifikk trådprogresjon forblir rollens egen.

Kildelinjen videreføres fra de åtte eksplisitte Wave D-oppføringene (Goodreads, IMDb og Film Producer) i `data/Civication/lifestory/editorial/inspiration/waveASixthInstallmentsV1.json`. Referanse til verk er et spor for videre redaksjonelt arbeid, ikke bevis på at scenene er sitater eller nærlesninger. Det målrettede testtilfellet `tests/civication-source-grounded-wave-f.test.js` dekker innhold, hver enkelt forgreining, felles livsdager og lagringsgrenser. Full fysisk mobilverifisering er ikke gjort i denne bolken.
