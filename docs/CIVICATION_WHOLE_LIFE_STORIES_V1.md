# Civication – personer, roller og sammenhengende historier

Revisjon 5, 17. oktober 2026: **Alle 28 private scenevarianter er redigert mot personmodellen, og de tre strømmene er registrert i produksjonsmanifestet.** De åpner etter fullført arbeidsbue og bekreftet NPC-rolle. Registreringen gjør ikke hendelsene til allerede opplevd spillerhistorie.

Frode Aas, Stein Mæland og Inger Holm er fiktive NPC-er fra næringslivskatalogen. Identitet og lagret rollehistorikk følger dem videre. [Personmodellen](CIVICATION_PERSON_MODEL_V1.md) og [karaktergrunnlaget](../data/Civication/narratives/editorial/wholeLifeStoryBatchV1.json) skiller rollekrav, vist kompetanse, egenskaper, fullmakt, livssituasjon, relasjoner og aktørkunnskap. Jobbtittelen beviser ingen ferdighet. Spillerens private svar gir ikke myndighet over andre ansatte.

## Tre forskjellige forløp

| Person og kilde | Motiv og hendelse | Hva valgene endrer |
| --- | --- | --- |
| [Stein: Kampen etter arbeidstid](../data/Civication/narratives/leisure/stein_hele_livet.json) | Vil ha spilleren med på fotballkvelden med Bjarne og Solveig. Bemanningsprat blir tolket som et løfte om endring. | Spilleren kan delta, avslå, sende innspill eller forklare seg i møtet. Stein avklarer selv hva han lovet. En kveld uten jobbinnspill kan ende i ny invitasjon eller ønsket avstand. |
| [Frode: Brorens konsert](../data/Civication/narratives/leisure/frode_hele_livet.json) | Vil høre Per spille etter flere konserter han gikk glipp av på grunn av vakter. Et bilde deles privat eller i kollegagruppa. | Bare deling i gruppa utløser Bjarnes vaktkommentar. Spilleren kan forklare eget bilde eller overlate svaret til Frode. Privat deling og avslag gir egne familie- og samtalefølger. |
| [Inger: En referanse og et jobbtilbud](../data/Civication/narratives/leisure/inger_hele_livet.json) | Søker større ansvar igjen, men ønsker mindre reising enn tilbudet innebærer. Ber om referanse fra kjente saker. | Spilleren velger om og hva vedkommende vil fortelle. Oppfølgingen kan bli avklarende eller kort og anstrengt. Inger forhandler om reisedager og avslår selv når arbeidsgiveren holder fast ved kravet. |

Stein og Frode har tre eller fire spilte kapitler; Inger har fire. Slutt- og informasjonsscener bruker ett lese- eller bekreftelsesvalg når det ikke finnes en ny beslutning å ta. Slutten på en privat bue er ikke en påstand om at hele arbeidskonflikten er løst. Steins misforståtte løfte blir avklart; selve bemanningsvedtaket ligger fortsatt hos lederne.

Ny biografi innføres i scenene: Frodes bror og band, Steins fotballvane og Ingers ønske om tid hjemme. Disse opplysningene har status `authored_in_registered_scene`. Det er ny skrevet fiksjon som blir kjent gjennom det faktiske forløpet. Ukjent partner, barn, alder, utdanning og privatøkonomi fylles ikke inn. Øvrige katalogfigurer og de 24 fortellingstypene i oversikten beholder sin tidligere forslagsstatus.

## Gjennomgang av alle 28 varianter

Situasjon, hvert valg, konsekvenstekst, NPC-svar og inngangsvilkår er gjennomgått for hver rad. Lesningen er gjort mot katalogen, de 12 registrerte arbeidsscenene og personprofilene.

| Scene-ID | Redaksjonell kontroll og resultat |
| --- | --- |
| `stein_rw_invitasjon` | Første invitasjon innfører fotballvanen. Ingen tidligere protest eller vennskapsstatus tillegges spilleren. |
| `stein_rw_kamp` | Sosial samtale etableres før Solveigs spørsmål om dekning. Bjarnes tolkning av løftet vises ved bordet. |
| `stein_rw_uten_kampen` | Stein har en konkret grunn til å be om innspill. Pubopplysningen kommer fra hans melding. |
| `stein_rw_sak_tatt_opp` | Stein erkjenner sin uklare formulering og ber om selve innvendingen, ikke spillerens forsvar av ham. |
| `stein_rw_kamp_etterklang` | Bjarne er uttrykkelig avsender av barndomsbildet. Åpen invitasjon og ønsket avstand får ulike svar. |
| `stein_rw_skriftlig_etterklang` | Innsendt tekst blir gjengitt med navn i felles grunnlag og bekreftet av spilleren. |
| `stein_rw_avslag_etterklang` | To avslag avslutter korrespondansen. Ingen deltakelse eller protest oppfinnes. |
| `stein_rw_motegrunnlag` | Stein retter forventningen hos dem som var til stede. Bjarne bekrefter at han venter på et svar. |
| `stein_rw_venter_pa_motet` | Spilleren har selv valgt å forklare seg i møtet og bekrefter den avtalte delen; ingen bemanningsfullmakt tildeles. |
| `frode_rw_invitasjon` | Bror, billett og frikveld innføres. Planens belastning er kjent uansett tidligere spillervalg. |
| `frode_rw_konsert` | Brødrene har en egen samtale og samtykker til deling. Ingen reparatørkarikatur. |
| `frode_rw_ikke_med` | Bildet er tatt av en annen. Konsertforløpet blir fortalt av Frode, ikke husket av spilleren. |
| `frode_rw_reaksjon` | Bare bildet i gruppa får Bjarnes kommentar. Frode ber spilleren avklare sin egen melding. |
| `frode_rw_privat_bilde` | Per videresender bildet til moren; brødrene avtaler kontakt før neste konsert. Ingen gruppereaksjon. |
| `frode_rw_etter_samtalen` | Videoen viser det konkrete opptrinnet Frode fortalte om etter spillerens spørsmål. |
| `frode_rw_etter_hilsenen` | Den korte hilsenen får en kort bekreftelse. Ingen automatisk utvidet fortrolighet. |
| `frode_rw_etter_forklaringen` | Bjarne svarer på spillerens forklaring. Frode tar ansvar for å ha latt spilleren stå med svaret. |
| `frode_rw_etter_frodes_svar` | Frode svarer selv uten ny spillermelding i gruppa; han avtaler gjennomgangen med Bjarne. |
| `inger_rw_referanse` | Egen søknad og reisegrense etableres før tilbudet. Referanseforespørselen gjelder to kjente saker. |
| `inger_rw_telefon` | Samtalen skjer etter intervjuet. Begge referansevalg bruker observerte forhold og hevder ingen ny beregning. |
| `inger_rw_annen_referanse` | Roger deltar ifølge Inger. Spilleren ber uttrykkelig om oppdateringer; samtaleinnholdet tillegges ikke spilleren. |
| `inger_rw_etter_fagreferansen` | Tilbud og forhandling om reisedager følger referansen. Ingen påstand om at spilleren alene skaffet jobben. |
| `inger_rw_etter_helreferansen` | Kritikken blir tatt opp etter referansen i en oppfølgingssamtale, ikke tilbakeskrevet til intervjuet. |
| `inger_rw_tilbud_uten_deg` | Oppdatering følger spillerens forespørsel. Rogers ord blir ikke avslørt eller oppfunnet. |
| `inger_rw_svar_fag` | Arbeidsgiveren avslår endret fordeling, deretter avslår Inger tilbudet og takker for referansen. |
| `inger_rw_svar_avklart` | Utfallet følges av takk for gjennomgangen; ulik vurdering av beregningen består. |
| `inger_rw_svar_uenighet` | Kort beskjed følger den avbrutte gjennomgangen. Ingen forsoning skrives inn. |
| `inger_rw_svar_uten_deg` | Inger gir den lovede siste oppdateringen. Spilleren har ikke deltatt som referanse. |

Systemforklaringer om at valg ikke oppretter lønn, rolle eller vennskap er fjernet fra sceneteksten. Disse grensene ivaretas i data, vilkår og testene. Dialogen viser konkrete handlinger, og de tre personene søker ikke alle råd om hvordan de bør leve.

## Registrering og kontroll

Produksjonsmanifestet har én oppføring for hver av de tre strømmene. Begge testfilene leser dette manifestet direkte; ingen privat registrering legges til i testhjelperen. Eksisterende kalender- og innboksstøtte fra [revisjon 4](CIVICATION_PRIVATE_NPC_DAY_INBOX_V1.md) brukes uendret.

Kommando kjørt én gang etter samlet sceneredigering og registrering:

```sh
node --test tests/civication-whole-life-story-drafts.test.js tests/civication-private-npc-day-inbox.test.js
```

**12/12 bestått.** Alle 28 varianter nås. For hver person kjøres alle 16 kombinasjoner av de fire tidligere arbeidsvalgene, deretter alle private valgruter: Stein 96, Frode 80 og Inger 64, samlet **240 fullførte ruter**. Testene kontrollerer sluttilstand, avslag, privat bildedeling, rollekrav, avvist svar og bevart identitet/rollehistorikk. Innbokstestene dekker faktisk kalender, privat adapter, SceneCatalog, ChoiceDirector, NPC-lagring og dagprogresjon, også uten jobb og ved omlasting. De tester ikke nettleserknappene.

En separat sammenligning mot basen viser at scene-ID-er, valg-ID-er, vilkår, flagg, effekter, tillitsendringer og dagkrav er identiske i de tre private filene. Ingen runtime-motor, lagringsnøkkel eller arbeidsbue er endret. `git diff --check` består. Reisetid, billett, bildedeling og eksterne referansesamtaler er fortsatt hendelser i fiksjonen, ikke nye kalender-/økonomitransaksjoner eller eksterne handlinger.

## Kvalitetsvurdering av revisjon 5

| Dimensjon | Score | Evidens og grense |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Alle varianter kontrollert mot katalog, 12 arbeidsscener og profiler. Nye opplysninger og grenavhengige minner er avgrenset. Skrevet fiksjon, ikke faktapåstander om virkelige personer. |
| Dekning og ferdigstillelse | 5/5 | Alle 28 varianter redigert, alle 240 ruter fullført, tre strømmer registrert én gang. Ingen aktiveringsrestpunkt i denne bolken. |
| Faglig/redaksjonell kvalitet | 4/5 | Radvis gjennomgang av motiv, hendelse, stemme, gren og avslutning. Egen forfattervurdering; tester beviser ikke litterær kvalitet eller lesernes opplevelse. |
| Teknisk integritet | 4/5 | 12 målrettede tester med produksjonsmanifest, integrerte eiere og mekanikksammenligning. Ingen ny nettleserreise eller full lokal regresjon hevdes. |
| Sikkerhet og ansvarlighet | 5/5 | Fiktive personer, avgrenset referanse, egne NPC-beslutninger og bevart myndighetsskille. Ingen ekstern sending eller virkelig brukerbiografi. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Samme 28 stabile ID-er og eksisterende eiere. Eksplisitt registreringsstatus, radvis vurdering og reproduserbare kontroller. |

**27/30. Revisjon 5 består kvalitetsporten for disse tre fortellingene og registreringen.** Dette er en redaksjonell egenvurdering, ikke ekstern lesergodkjenning.

## Historiske vurderinger

Den [opprinnelige gjennomgangen](CIVICATION_WHOLE_LIFE_EDITORIAL_REVIEW_2026_10_14.md) gjelder commit `74b1d092876c0b8025cd82f2d6ae987f655ee86a`: 27 daværende varianter ble underkjent. Opprinnelig 4/5 og 25/30 forblir trukket tilbake. Rapporten bevares uendret.

Revisjon 2 hadde 28 omskrevne, uregistrerte varianter og **23/30**: korrekthet 4, dekning 4, redaksjonell kvalitet 3, teknisk integritet 3, ansvarlighet 5 og vedlikeholdbarhet 4. Privat dagfremdrift og innbokslevering var da uløst. Revisjon 3 avklarte personmodellen og rettet Steins fullmaktsbrudd; revisjon 4 leverte den tekniske støtten. Ingen av disse testene oppgraderte i seg selv den gamle litterære vurderingen. Revisjon 5 ovenfor vurderer den faktisk redigerte teksten og aktiveringen separat.
