# Symposium – dekning av rolleprofiler

Opprinnelig kartlagt mot merge-commit `a66d36012fb056a0a06fa44547ee98c0a5e83676` og utvidet mot gjeldende rollepakkeindeks og livsposisjonskatalog. Dette er en arbeidsliste for å gi alle registrerte jobber, livsposisjoner og private roller et kildegrunnlag. Oppføringene teller de lagrede parene av kategori og rolleomfang. Flere filer deler samme par, og resolveren kan knytte ulike titler til samme spillrolle.

Grunnlaget inneholder 293 registrerte rollemodellfiler og 244 rolleverdener med kategori og rolleomfang. Disse gir 432 par. Arbeidsledig og venn av Jonas er ført opp særskilt, og 12 ytterligere rollepakkeoppføringer er bevart fra det kanoniske rollepakkeindekset. En modellfil, rollepakkeoppføring eller alias er ikke dermed en selvstendig jobb. Oversikten har dermed **446 registrerte rolle-/rollepakkeoppføringer, hvorav 14 har kobling til én av tretten kildeprofiler, og 432 mangler lenket profil**. I tillegg dekker det utvidede registeret **199 selvvalgbare livsposisjoner, 15 Life Story-roller, 24 synopsis-spor og 9 leveveiformer**. Disse lagene kan overlappe, og skal aldri summeres som antall unike spillroller.

[Rolleoversikt og profilkrav](CIVICATION_JOBBGRUNNLAG.md) · [Rollemodellmanifest](../data/Civication/roleModels/manifest.json) · [Rolleverdener](../data/Civication/roleWorlds/) · [Life Story-manifest](../data/Civication/lifestory/manifest.json)

## Hvordan listen brukes

Hver rad lenker til de eksisterende kildene i repoet og viser om en kildeprofil er koblet til. Når flere filer deler identitet, står de på samme rad. Arealplanleggerens profil brukes både for rollemodellen og planrådgiversporet som den allerede omtaler. Registeret føyer ingen nye jobbidentiteter til spillet. Oppføringen «Mangler profil» gjelder dokumentasjonsarbeidet og sier ingenting om hvorvidt rollen kan spilles.

Ved ny eller endret profil må ansvar, fagspråk, verktøy, klær, vilkår, vanlige oppgaver, konflikter, hensyn og handlingsrom undersøkes etter profilkravene. Lenke videre til synopsis og spillinnhold. Kontroller filhenvisninger og om rollen bruker et annet omfang i resolveren før neste profil skrives.

## Neste produksjonsbolk

Controller, idrettsutøver, miljøarbeider og arbeids- og karriereveileder har nå gjennomgåtte, kildebelagte Symposium-profiler. Profilene dokumenterer yrkespraksis og konkrete forslag til scener, men godkjenner ikke automatisk eksisterende spillscener. Neste Life Story-bolk kan undersøke psykolog og spesialistpsykolog, der profesjonsgrenser og autorisasjon må kontrolleres særskilt.

| Profil | Eksisterende forløp | Status |
| --- | --- | --- |
| [Miljøarbeider](civication-symposium/miljoarbeider.md) | [Life Story](../data/Civication/lifestory/roles/psykologi_miljoarbeid/role.json) | Kildeprofil ferdig; scenerevisjon gjenstår |
| [Arbeids- og karriereveileder](civication-symposium/arbeids-og-karriereveileder.md) | [Life Story](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/role.json) | Kildeprofil ferdig; scenerevisjon gjenstår |

## Roller og relasjoner i synopsisene

Tabellen viser alle 24 synopsisene i den eksisterende matrisen. En synopsis kan berøre flere personer og roller. Tilknyttet profil viser inngangen som allerede finnes. Andre deltakere og private relasjoner må få sin egen kildekartlegging.

| Synopsis | Rolle eller person fra matrisen | Profilarbeid |
| --- | --- | --- |
| [C01 Jobbtap og verdighet](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c01--jobbtap-og-verdighet) | arbeidsledig | [Tilknyttet profil](civication-symposium/arbeidsledig.md) |
| [C02 Muligheten uten garanti](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c02--muligheten-uten-garanti) | Mira / musikk_frilansmusiker | Må kartlegges i rolleprofil |
| [C03 Drømmen og regningene](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c03--drømmen-og-regningene) | Lea / naeringsliv_sideprosjektbygger | Må kartlegges i rolleprofil |
| [C04 Forespørselen som ikke er en kontrakt](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c04--forespørselen-som-ikke-er-en-kontrakt) | Lea / naeringsliv_frilanser | [Tilknyttet profil](civication-symposium/frilanser.md) |
| [C05 Byråkratiet og personen](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c05--byråkratiet-og-personen) | arbeidsledig / NAV | [Tilknyttet profil](civication-symposium/arbeidsledig.md) |
| [C06 Faglig integritet under press](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c06--faglig-integritet-under-press) | arealplanlegger | [Tilknyttet profil](civication-symposium/arealplanlegger.md) |
| [C07 Tilhørighet mot frihet](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c07--tilhørighet-mot-frihet) | Arvid / sosialt miljø | Må kartlegges i rolleprofil |
| [C08 Tjenesten som blir en gjeld](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c08--tjenesten-som-blir-en-gjeld) | Arvid / bekjentskap | Må kartlegges i rolleprofil |
| [C09 Vennskapet som glir fra](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c09--vennskapet-som-glir-fra) | Jonas / vennskap | [Tilknyttet profil](civication-symposium/venn-av-jonas.md) |
| [C10 Kjærlighet på feil tidspunkt](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c10--kjærlighet-på-feil-tidspunkt) | ny privatlivstråd / gjensidig interesse | Må kartlegges i rolleprofil |
| [C11 Familien som trenger deg](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c11--familien-som-trenger-deg) | søsteren / familierelasjon | Må kartlegges i rolleprofil |
| [C12 Grensen du ikke satte](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c12--grensen-du-ikke-satte) | Sara / frivillig klubb | Må kartlegges i rolleprofil |
| [C13 Hjemmet på usikker grunn](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c13--hjemmet-på-usikker-grunn) | ny boligtråd / arbeidsledig | Må kartlegges i rolleprofil |
| [C14 Ryktet løper fra deg](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c14--ryktet-løper-fra-deg) | sosiale medier / kollegarelasjon | Må kartlegges i rolleprofil |
| [C15 Det digitale dobbeltlivet](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c15--det-digitale-dobbeltlivet) | digital identitet / privatliv | Må kartlegges i rolleprofil |
| [C16 Klassereisen og kodene](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c16--klassereisen-og-kodene) | Daniel / kulturmiljø | Må kartlegges i rolleprofil |
| [C17 Å arbeide seg tom](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c17--å-arbeide-seg-tom) | renholder / driftsleder | Må kartlegges i rolleprofil |
| [C18 Ensom midt blant folk](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c18--ensom-midt-blant-folk) | Jonas / Daniel / sosialt liv | Må kartlegges i rolleprofil |
| [C19 Å begynne på nytt](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c19--å-begynne-på-nytt) | arbeidsledig / opplæringsspor | Må kartlegges i rolleprofil |
| [C20 Fellesskapet uten helt](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c20--fellesskapet-uten-helt) | Sara og Nora / lokalt fellesskap | Må kartlegges i rolleprofil |
| [C21 Byen som skifter ansikt](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c21--byen-som-skifter-ansikt) | Ivar / arealplanlegger | Må kartlegges i rolleprofil |
| [C22 Kunnskap du ikke kan bekrefte](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c22--kunnskap-du-ikke-kan-bekrefte) | Nora / natur og undersøkelse | Må kartlegges i rolleprofil |
| [C23 Den lille feilen som ikke forsvinner](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c23--den-lille-feilen-som-ikke-forsvinner) | Lea / arbeid og privatliv | Må kartlegges i rolleprofil |
| [C24 Den ufullstendige forsoningen](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c24--den-ufullstendige-forsoningen) | Mira, Lea og Arvid / relasjoner | Må kartlegges i rolleprofil |

## Life Stories – alle 15 aktive rollespor

Kanonisk kilde: [Life Story-manifestet](../data/Civication/lifestory/manifest.json). Dette er fortellingspakker og *kan* sammenfalle med yrkesrollene ovenfor. En Life Story er ikke automatisk en ny jobb eller et eget vedtak. `content_only` er et dokumentert forløp uten automatisk jobbtilbud; `system_role` er ikke en badge-ansettelse.

| Life Story | Type og rolleomfang | Kilder til faktisk forløp | Kildeprofil |
| --- | --- | --- | --- |
| `arealplanlegger` | Jobb / badge-tilknyttet · `by_radgiver_plan` | [Rolle](../data/Civication/lifestory/roles/arealplanlegger/role.json) · [Tråder](../data/Civication/lifestory/roles/arealplanlegger/threads.json) · [Scener](../data/Civication/lifestory/roles/arealplanlegger/scenes.json) | [Profil](civication-symposium/arealplanlegger.md) |
| `renholder` | Jobb / badge-tilknyttet · `renholder` | [Rolle](../data/Civication/lifestory/roles/renholder/role.json) · [Tråder](../data/Civication/lifestory/roles/renholder/threads.json) · [Scener](../data/Civication/lifestory/roles/renholder/scenes.json) | [Profil](civication-symposium/renholder.md) |
| `ekspeditor` | Jobb / badge-tilknyttet · `ekspeditor` | [Rolle](../data/Civication/lifestory/roles/ekspeditor/role.json) · [Tråder](../data/Civication/lifestory/roles/ekspeditor/threads.json) · [Scener](../data/Civication/lifestory/roles/ekspeditor/scenes.json) | [Profil](civication-symposium/ekspeditor.md) |
| `psykologi_miljoarbeid` | Jobb / badge-tilknyttet · `psykologi_miljoarbeid` | [Rolle](../data/Civication/lifestory/roles/psykologi_miljoarbeid/role.json) · [Tråder](../data/Civication/lifestory/roles/psykologi_miljoarbeid/threads.json) · [Scener](../data/Civication/lifestory/roles/psykologi_miljoarbeid/scenes.json) | [Profil](civication-symposium/miljoarbeider.md) |
| `psykologi_arbeids_og_karriereveiledning` | Jobb / badge-tilknyttet · `psykologi_arbeids_og_karriereveiledning` | [Rolle](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/role.json) · [Tråder](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/threads.json) · [Scener](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/scenes.json) | [Profil](civication-symposium/arbeids-og-karriereveileder.md) |
| `psykolog` | Jobb / badge-tilknyttet · `psykolog` | [Rolle](../data/Civication/lifestory/roles/psykolog/role.json) · [Tråder](../data/Civication/lifestory/roles/psykolog/threads.json) · [Scener](../data/Civication/lifestory/roles/psykolog/scenes.json) | Mangler gjennomgått kildeprofil |
| `spesialistpsykolog` | Jobb / badge-tilknyttet · `spesialistpsykolog` | [Rolle](../data/Civication/lifestory/roles/spesialistpsykolog/role.json) · [Tråder](../data/Civication/lifestory/roles/spesialistpsykolog/threads.json) · [Scener](../data/Civication/lifestory/roles/spesialistpsykolog/scenes.json) | Mangler gjennomgått kildeprofil |
| `fagansvarlig` | Jobb / badge-tilknyttet · `fagansvarlig` | [Rolle](../data/Civication/lifestory/roles/fagansvarlig/role.json) · [Tråder](../data/Civication/lifestory/roles/fagansvarlig/threads.json) · [Scener](../data/Civication/lifestory/roles/fagansvarlig/scenes.json) | Mangler gjennomgått kildeprofil |
| `klinikkleder` | Jobb / badge-tilknyttet · `klinikkleder` | [Rolle](../data/Civication/lifestory/roles/klinikkleder/role.json) · [Tråder](../data/Civication/lifestory/roles/klinikkleder/threads.json) · [Scener](../data/Civication/lifestory/roles/klinikkleder/scenes.json) | Mangler gjennomgått kildeprofil |
| `forsker_psykologi` | Jobb / badge-tilknyttet · `forsker_psykologi` | [Rolle](../data/Civication/lifestory/roles/forsker_psykologi/role.json) · [Tråder](../data/Civication/lifestory/roles/forsker_psykologi/threads.json) · [Scener](../data/Civication/lifestory/roles/forsker_psykologi/scenes.json) | Mangler gjennomgått kildeprofil |
| `professor_psykologi` | Jobb / badge-tilknyttet · `professor_psykologi` | [Rolle](../data/Civication/lifestory/roles/professor_psykologi/role.json) · [Tråder](../data/Civication/lifestory/roles/professor_psykologi/threads.json) · [Scener](../data/Civication/lifestory/roles/professor_psykologi/scenes.json) | Mangler gjennomgått kildeprofil |
| `barnehageassistent` | Kun innhold · `barnehageassistent` | [Rolle](../data/Civication/lifestory/roles/barnehageassistent/role.json) · [Tråder](../data/Civication/lifestory/roles/barnehageassistent/threads.json) · [Scener](../data/Civication/lifestory/roles/barnehageassistent/scenes.json) | [Profil](civication-symposium/barnehageassistent.md) |
| `arbeidsledig` | Systemrolle | [Rolle](../data/Civication/lifestory/roles/arbeidsledig/role.json) · [Tråder](../data/Civication/lifestory/roles/arbeidsledig/threads.json) · [Scener](../data/Civication/lifestory/roles/arbeidsledig/scenes.json) | [Profil](civication-symposium/arbeidsledig.md) |
| `controller` | Jobb / badge-tilknyttet · `controller` | [Rolle](../data/Civication/lifestory/roles/controller/role.json) · [Tråder](../data/Civication/lifestory/roles/controller/threads.json) · [Scener](../data/Civication/lifestory/roles/controller/scenes.json) | [Profil](civication-symposium/controller.md) |
| `sport_utover` | Jobb / badge-tilknyttet · `sport_utover` | [Rolle](../data/Civication/lifestory/roles/sport_utover/role.json) · [Tråder](../data/Civication/lifestory/roles/sport_utover/threads.json) · [Scener](../data/Civication/lifestory/roles/sport_utover/scenes.json) | [Profil](civication-symposium/idrettsutover.md) |

## Livsposisjoner – alle 199 kanoniske valg

Kanonisk kilde: [Life Position Role World Readiness](../data/Civication/lifePositionRoleWorldReadiness.json) og [rolletaksonomien](../data/Civication/nonCareerRoleTaxonomy.json). Livsposisjonene er **selvvalgte identiteter og praksiser**, ikke ansettelser. 159 har ferdige Role Worlds, mens 40 er klassifisert som **ikke selvstendige rolleverdener**. Den siste gruppen må ikke masseskapes som egne jobber eller simulatorroller. Eksisterende kildebelegg og den ferdige rolleverdenen erstatter ikke en gjennomgått Symposium-profil.

| Livsposisjon | Betegnelse | Klassifisering | Kilde / rolleverdensforløp | Kildeprofil |
| --- | --- | --- | --- | --- |
| `by/byflanor` | Flanør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/by/by_flanor.json) | Mangler gjennomgått kildeprofil |
| `by/byvandrer` | Byvandrer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/by/by_byvandrer.json) | Mangler gjennomgått kildeprofil |
| `by/nabolagskjenner` | Nabolagskjenner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/by/by_nabolagskjenner.json) | Mangler gjennomgått kildeprofil |
| `by/urbanist` | Urbanist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/by/by_urbanist.json) | Mangler gjennomgått kildeprofil |
| `film_tv/connaisseur` | Connaisseur | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `film_tv/festivalgjenger` | Festivalgjenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_festivalgjenger.json) | Mangler gjennomgått kildeprofil |
| `film_tv/film_og_tv_stjerne` | Film- og TV-stjerne | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `film_tv/filmfantast` | Filmfantast | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_filmfantast.json) | Mangler gjennomgått kildeprofil |
| `film_tv/filminteressert` | Filminteressert | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_filminteressert.json) | Mangler gjennomgått kildeprofil |
| `film_tv/filmklubbmenneske` | Filmklubbmenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json) | Mangler gjennomgått kildeprofil |
| `film_tv/filmnerd` | Filmnerd | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_filmnerd.json) | Mangler gjennomgått kildeprofil |
| `film_tv/ikon` | Ikon | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `film_tv/internasjonalt_gjennomslag` | Internasjonalt gjennomslag | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `film_tv/kinogjenger` | Kinogjenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_kinogjenger.json) | Mangler gjennomgått kildeprofil |
| `film_tv/kjenner` | Kjenner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_kjenner.json) | Mangler gjennomgått kildeprofil |
| `film_tv/prisvinner` | Prisvinner | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `film_tv/seer` | Seer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_seer.json) | Mangler gjennomgått kildeprofil |
| `film_tv/seriesluker` | Seriesluker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/film_tv/film_tv_seriesluker.json) | Mangler gjennomgått kildeprofil |
| `filosofi/argumentbygger` | Argumentbygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_argumentbygger.json) | Mangler gjennomgått kildeprofil |
| `filosofi/etiker` | Etiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_etiker.json) | Mangler gjennomgått kildeprofil |
| `filosofi/fagfilosof` | Fagfilosof | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_fagfilosof.json) | Mangler gjennomgått kildeprofil |
| `filosofi/filosofisk_veileder` | Filosofisk veileder | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_filosofisk_veileder.json) | Mangler gjennomgått kildeprofil |
| `filosofi/filosofistudent` | Filosofistudent | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_filosofistudent.json) | Mangler gjennomgått kildeprofil |
| `filosofi/lesesirkelmenneske` | Lesesirkelmenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_lesesirkelmenneske.json) | Mangler gjennomgått kildeprofil |
| `filosofi/livsgrubler` | Livsgrubler | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_livsgrubler.json) | Mangler gjennomgått kildeprofil |
| `filosofi/logiker` | Logiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_logiker.json) | Mangler gjennomgått kildeprofil |
| `filosofi/nysgjerrig` | Nysgjerrig | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_nysgjerrig.json) | Mangler gjennomgått kildeprofil |
| `filosofi/salongfilosof` | Salongfilosof | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `filosofi/samtalepartner` | Samtalepartner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_samtalepartner.json) | Mangler gjennomgått kildeprofil |
| `filosofi/sofafilosof` | Sofafilosof | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_sofafilosof.json) | Mangler gjennomgått kildeprofil |
| `filosofi/sporrer` | Spørrer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/filosofi/filosofi_sporrer.json) | Mangler gjennomgått kildeprofil |
| `helse/evidensleser` | Evidensleser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/helse/helse_evidensleser.json) | Mangler gjennomgått kildeprofil |
| `helse/folkehelseblikk` | Folkehelseblikk | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/helse/helse_folkehelseblikk.json) | Mangler gjennomgått kildeprofil |
| `helse/helseutforsker` | Helseutforsker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/helse/helse_helseutforsker.json) | Mangler gjennomgått kildeprofil |
| `helse/omsorgsetiker` | Omsorgsetiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/helse/helse_omsorgsetiker.json) | Mangler gjennomgått kildeprofil |
| `historie/arkivrotte` | Arkivrotte | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_arkivrotte.json) | Mangler gjennomgått kildeprofil |
| `historie/doktorgradsstudent_historie` | Doktorgradsstudent | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_doktorgradsstudent_historie.json) | Mangler gjennomgått kildeprofil |
| `historie/historievandrer` | Historievandrer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_historievandrer.json) | Mangler gjennomgått kildeprofil |
| `historie/kulturminnejeger` | Kulturminnejeger | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `historie/lokalhistoriker` | Lokalhistoriker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_lokalhistoriker.json) | Mangler gjennomgått kildeprofil |
| `historie/masterstuden_historie` | Masterstuden | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_masterstuden_historie.json) | Mangler gjennomgått kildeprofil |
| `historie/student_historie` | Student | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/historie/historie_student_historie.json) | Mangler gjennomgått kildeprofil |
| `kunst/ateliermenneske` | Ateliermenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_ateliermenneske.json) | Mangler gjennomgått kildeprofil |
| `kunst/gallerist` | Gallerist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_gallerist.json) | Mangler gjennomgått kildeprofil |
| `kunst/gallerivanker` | Gallerivanker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_gallerivanker.json) | Mangler gjennomgått kildeprofil |
| `kunst/gatekunstjeger` | Gatekunstjeger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_gatekunstjeger.json) | Mangler gjennomgått kildeprofil |
| `kunst/kunstsamler` | Kunstsamler | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_kunstsamler.json) | Mangler gjennomgått kildeprofil |
| `kunst/kuratorpraksis` | Kurator | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_kuratorpraksis.json) | Mangler gjennomgått kildeprofil |
| `kunst/vernissagegjenger` | Vernissagegjenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/kunst/kunst_vernissagegjenger.json) | Mangler gjennomgått kildeprofil |
| `litteratur/aktiv_leser` | Aktiv leser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_aktiv_leser.json) | Mangler gjennomgått kildeprofil |
| `litteratur/anmelder` | Anmelder | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_anmelder.json) | Mangler gjennomgått kildeprofil |
| `litteratur/bestselgerforfatter` | Bestselgerforfatter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `litteratur/biblioteksvanker` | Biblioteksvanker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_biblioteksvanker.json) | Mangler gjennomgått kildeprofil |
| `litteratur/bokklubbmenneske` | Bokklubbmenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_bokklubbmenneske.json) | Mangler gjennomgått kildeprofil |
| `litteratur/bokorm` | Bokorm | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_bokorm.json) | Mangler gjennomgått kildeprofil |
| `litteratur/dramatiker` | Dramatiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_dramatiker.json) | Mangler gjennomgått kildeprofil |
| `litteratur/essayist` | Essayist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_essayist.json) | Mangler gjennomgått kildeprofil |
| `litteratur/etablert_forfatter` | Etablert forfatter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `litteratur/forfatter` | Forfatter | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_forfatter.json) | Mangler gjennomgått kildeprofil |
| `litteratur/kanonisert_forfatter` | Kanonisert forfatter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `litteratur/leser` | Leser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_leser.json) | Mangler gjennomgått kildeprofil |
| `litteratur/litteraturinteressert` | Litteraturinteressert | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_litteraturinteressert.json) | Mangler gjennomgått kildeprofil |
| `litteratur/litteraturkritiker` | Litteraturkritiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_litteraturkritiker.json) | Mangler gjennomgått kildeprofil |
| `litteratur/poet` | Poet | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_poet.json) | Mangler gjennomgått kildeprofil |
| `litteratur/prisvinnende_forfatter` | Prisvinnende forfatter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `litteratur/skald` | Skald | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_skald.json) | Mangler gjennomgått kildeprofil |
| `litteratur/skribent` | Skribent | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_skribent.json) | Mangler gjennomgått kildeprofil |
| `litteratur/skrivebordspoet` | Skrivebordspoet | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_skrivebordspoet.json) | Mangler gjennomgått kildeprofil |
| `litteratur/smaforlagsnerd` | Småforlagsnerd | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/litteratur/litteratur_smaforlagsnerd.json) | Mangler gjennomgått kildeprofil |
| `liv_alternativ/bohem` | Bohem | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/liv_alternativ/liv_alternativ_bohem.json) | Mangler gjennomgått kildeprofil |
| `liv_alternativ/nomade` | Nomade | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/liv_alternativ/liv_alternativ_nomade.json) | Mangler gjennomgått kildeprofil |
| `liv_bosituasjon/boms` | Boms | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/liv_bosituasjon/liv_bosituasjon_boms.json) | Mangler gjennomgått kildeprofil |
| `liv_bosituasjon/uteligger` | Uteligger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/liv_bosituasjon/liv_bosituasjon_uteligger.json) | Mangler gjennomgått kildeprofil |
| `liv_lovsbane/kriminell` | Kriminell | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/liv_lovsbane/liv_lovsbane_kriminell.json) | Mangler gjennomgått kildeprofil |
| `media/bidragsyter` | Bidragsyter | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_bidragsyter.json) | Mangler gjennomgått kildeprofil |
| `media/debattant` | Debattant | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `media/folger` | Følger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_folger.json) | Mangler gjennomgått kildeprofil |
| `media/frilansjournalist` | Frilansjournalist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_frilansjournalist.json) | Mangler gjennomgått kildeprofil |
| `media/kommentarfeltveteran` | Kommentarfeltveteran | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_kommentarfeltveteran.json) | Mangler gjennomgått kildeprofil |
| `media/kommentator_felt` | Kommentator (felt) | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_kommentator_felt.json) | Mangler gjennomgått kildeprofil |
| `media/leser` | Leser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_leser.json) | Mangler gjennomgått kildeprofil |
| `media/medieprofil` | Medieprofil | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `media/mediestjerne` | Mediestjerne | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `media/medievaktbikkje` | Medievaktbikkje | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_medievaktbikkje.json) | Mangler gjennomgått kildeprofil |
| `media/nyhetsjunkie` | Nyhetsjunkie | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_nyhetsjunkie.json) | Mangler gjennomgått kildeprofil |
| `media/offentlig_dagsordensetter` | Offentlig dagsordensetter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `media/offentlighetsmakt` | Offentlighetsmakt | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `media/podkastsluker` | Podkastsluker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/media/media_podkastsluker.json) | Mangler gjennomgått kildeprofil |
| `musikk/artist` | Artist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_artist.json) | Mangler gjennomgått kildeprofil |
| `musikk/etablert_artist` | Etablert artist | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `musikk/festivalveteran` | Festivalveteran | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `musikk/frilansmusiker` | Frilansmusiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_frilansmusiker.json) | Mangler gjennomgått kildeprofil |
| `musikk/headliner` | Headliner | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `musikk/konsertgjenger` | Konsertgjenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_konsertgjenger.json) | Mangler gjennomgått kildeprofil |
| `musikk/musikknerd` | Musikknerd | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_musikknerd.json) | Mangler gjennomgått kildeprofil |
| `musikk/plateartist` | Plateartist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_plateartist.json) | Mangler gjennomgått kildeprofil |
| `musikk/plategraver` | Plategraver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_plategraver.json) | Mangler gjennomgått kildeprofil |
| `musikk/popstjerne` | Popstjerne | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `musikk/publikum_deltaker` | Publikum / deltaker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_publikum_deltaker.json) | Mangler gjennomgått kildeprofil |
| `musikk/scenehenger` | Scenehenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_scenehenger.json) | Mangler gjennomgått kildeprofil |
| `musikk/solist` | Solist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_solist.json) | Mangler gjennomgått kildeprofil |
| `musikk/stjerneartist` | Stjerneartist | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `musikk/utovende_musiker` | Utøvende musiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/musikk/musikk_utovende_musiker.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/bedriftseier` | Bedriftseier | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_bedriftseier.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/frilanser` | Frilanser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_frilanser.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/grunder` | Gründer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_grunder.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/grunderdrommer` | Gründerdrømmer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_grunderdrommer.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/industribygger` | Industribygger | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/industrieier` | Industrieier | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_industrieier.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/investor` | Investor | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_investor.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/pendler` | Pendler | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_pendler.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/sideprosjektbygger` | Sideprosjektbygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_sideprosjektbygger.json) | Mangler gjennomgått kildeprofil |
| `naeringsliv/smasparer` | Småsparer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/naeringsliv/naeringsliv_smasparer.json) | Mangler gjennomgått kildeprofil |
| `natur/artsjeger` | Artsjeger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_artsjeger.json) | Mangler gjennomgått kildeprofil |
| `natur/artsobservator` | Artsobservatør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_artsobservator.json) | Mangler gjennomgått kildeprofil |
| `natur/feltobservator` | Feltobservatør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_feltobservator.json) | Mangler gjennomgått kildeprofil |
| `natur/fuglekikker` | Fuglekikker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_fuglekikker.json) | Mangler gjennomgått kildeprofil |
| `natur/markaveteran` | Markaveteran | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `natur/naturinteressert` | Naturinteressert | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_naturinteressert.json) | Mangler gjennomgått kildeprofil |
| `natur/sanker` | Sanker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_sanker.json) | Mangler gjennomgått kildeprofil |
| `natur/turgaer` | Turgåer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/natur/natur_turgaer.json) | Mangler gjennomgått kildeprofil |
| `politikk/aktivist` | Aktivist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_aktivisme_praksis.json) | Mangler gjennomgått kildeprofil |
| `politikk/demokratianalytiker` | Demokratianalytiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_demokratianalyse.json) | Mangler gjennomgått kildeprofil |
| `politikk/fylkespolitiker` | Fylkespolitiker | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `politikk/grasrotbygger` | Grasrotbygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_grasrotbygger.json) | Mangler gjennomgått kildeprofil |
| `politikk/kampanjemenneske` | Kampanjemenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_kampanjemenneske.json) | Mangler gjennomgått kildeprofil |
| `politikk/komiteleder` | Komitéleder | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `politikk/kommunestyrerepresentant` | Kommunestyrerepresentant | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `politikk/motesliter` | Møtesliter | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_motesliter.json) | Mangler gjennomgått kildeprofil |
| `politikk/organisasjonsmenneske` | Organisasjonsmenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_organisasjonsmenneske.json) | Mangler gjennomgått kildeprofil |
| `politikk/partileder` | Partileder | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `politikk/politisk_insider` | Politisk insider | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `politikk/samfunnsengasjert_borger` | Samfunnsengasjert borger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_samfunnsdeltakelse.json) | Mangler gjennomgått kildeprofil |
| `politikk/statsvitenskapelig_ekspert` | Statsvitenskapelig ekspert | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_statsvitenskapelig_ekspertise.json) | Mangler gjennomgått kildeprofil |
| `politikk/tillitsvalgt` | Tillitsvalgt | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/politikk/politikk_tillitsvalgt.json) | Mangler gjennomgått kildeprofil |
| `psykologi/monsterjeger` | Mønsterjeger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/psykologi/psykologi_monsterjeger.json) | Mangler gjennomgått kildeprofil |
| `psykologi/psykologientusiast` | Psykologientusiast | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/psykologi/psykologi_psykologientusiast.json) | Mangler gjennomgått kildeprofil |
| `psykologi/relasjonsbygger` | Relasjonsbygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/psykologi/psykologi_relasjonsbygger.json) | Mangler gjennomgått kildeprofil |
| `psykologi/selvgransker` | Selvgransker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/psykologi/psykologi_selvgransker.json) | Mangler gjennomgått kildeprofil |
| `psykologi/vaneeksperimentor` | Vaneeksperimentør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/psykologi/psykologi_vaneeksperimentor.json) | Mangler gjennomgått kildeprofil |
| `religion/besokende` | Besøkende | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_besokende.json) | Mangler gjennomgått kildeprofil |
| `religion/dialogbygger` | Dialogbygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_dialogbygger.json) | Mangler gjennomgått kildeprofil |
| `religion/feltarbeider` | Feltarbeider | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_feltarbeider.json) | Mangler gjennomgått kildeprofil |
| `religion/livssynsutforsker` | Livssynsutforsker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_livssynsutforsker.json) | Mangler gjennomgått kildeprofil |
| `religion/nysgjerrig` | Nysgjerrig | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_nysgjerrig.json) | Mangler gjennomgått kildeprofil |
| `religion/pilegrim` | Pilegrim | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_pilegrim.json) | Mangler gjennomgått kildeprofil |
| `religion/ritualkjenner` | Ritualkjenner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_ritualkjenner.json) | Mangler gjennomgått kildeprofil |
| `religion/symboltolker` | Symboltolker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_symboltolker.json) | Mangler gjennomgått kildeprofil |
| `religion/tradisjonskjenner` | Tradisjonskjenner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_tradisjonskjenner.json) | Mangler gjennomgått kildeprofil |
| `religion/troslivskjenner` | Troslivskjenner | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_troslivskjenner.json) | Mangler gjennomgått kildeprofil |
| `religion/trosstedsvandrer` | Trosstedsvandrer | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/religion/religion_trosstedsvandrer.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/dramaturg` | Dramaturg | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_dramaturg.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/festivalveteran` | Festivalveteran | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/improentusiast` | Improentusiast | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_improentusiast.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/koreograf` | Koreograf | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_koreograf.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/premieregjenger` | Premieregjenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_premieregjenger.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/publikum` | Publikum | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_publikum.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/regissor` | Regissør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_regissor.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/scenehenger` | Scenehenger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_scenehenger.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/scenekunstkurator` | Scenekunstkurator | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_scenekunstkurator.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/skuespiller_danser` | Skuespiller / danser | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_skuespiller_danser.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/teatergjenganger` | Teatergjenganger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_teatergjenganger.json) | Mangler gjennomgått kildeprofil |
| `scenekunst/utover` | Utøver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/scenekunst/scenekunst_utover.json) | Mangler gjennomgått kildeprofil |
| `sport/aktiv_utover` | Aktiv utøver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_aktiv_utover.json) | Mangler gjennomgått kildeprofil |
| `sport/eliteseriespiller` | Eliteseriespiller | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/idrettslegende` | Idrettslegende | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/idrettsstjerne` | Idrettsstjerne | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/kaptein` | Kaptein | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/klubbmenneske` | Klubbmenneske | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_klubbmenneske.json) | Mangler gjennomgått kildeprofil |
| `sport/klubbspiller` | Klubbspiller | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_klubbspiller.json) | Mangler gjennomgått kildeprofil |
| `sport/konkurranseutover` | Konkurranseutøver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_konkurranseutover.json) | Mangler gjennomgått kildeprofil |
| `sport/landslagsutover` | Landslagsutøver | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/mesterskapsreisende` | Mesterskapsreisende | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/mosjonist` | Mosjonist | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_mosjonist.json) | Mangler gjennomgått kildeprofil |
| `sport/olympisk_mester` | Olympisk Mester | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `sport/profesjonell_utover` | Profesjonell utøver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_profesjonell_utover.json) | Mangler gjennomgått kildeprofil |
| `sport/sondagsutover` | Søndagsutøver | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_sondagsutover.json) | Mangler gjennomgått kildeprofil |
| `sport/supporter` | Supporter | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_supporter.json) | Mangler gjennomgått kildeprofil |
| `sport/tribunesliter` | Tribunesliter | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/sport/sport_tribunesliter.json) | Mangler gjennomgått kildeprofil |
| `subkultur/crew` | Crew | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_crew.json) | Mangler gjennomgått kildeprofil |
| `subkultur/dandy` | Dandy | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_dandy.json) | Mangler gjennomgått kildeprofil |
| `subkultur/deltaker` | Deltaker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_deltaker.json) | Mangler gjennomgått kildeprofil |
| `subkultur/gangster` | Gangster | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_gangster.json) | Mangler gjennomgått kildeprofil |
| `subkultur/gatesmart` | Gatesmart | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_gatesmart.json) | Mangler gjennomgått kildeprofil |
| `subkultur/hakkekylling` | Hakkekylling | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_hakkekylling.json) | Mangler gjennomgått kildeprofil |
| `subkultur/kultfigur` | Kultfigur | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `subkultur/legend` | Legend | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `subkultur/observ_r` | Observør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/subkultur/subkultur_observor.json) | Mangler gjennomgått kildeprofil |
| `subkultur/trendsetter` | Trendsetter | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `subkultur/undergrunnsikon` | Undergrunnsikon | Ikke selvstendig rolleverden | [Klassifisering og evidens](../data/Civication/lifePositionRoleWorldReadiness.json) | Mangler gjennomgått kildeprofil |
| `utdanning/didaktisk_tenker` | Didaktisk tenker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/utdanning/utdanning_didaktisk_tenker.json) | Mangler gjennomgått kildeprofil |
| `utdanning/klasseromsobservator` | Klasseromsobservatør | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/utdanning/utdanning_klasseromsobservator.json) | Mangler gjennomgått kildeprofil |
| `utdanning/laeringsutforsker` | Læringsutforsker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/utdanning/utdanning_laeringsutforsker.json) | Mangler gjennomgått kildeprofil |
| `utdanning/utdanningskritiker` | Utdanningskritiker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/utdanning/utdanning_utdanningskritiker.json) | Mangler gjennomgått kildeprofil |
| `vitenskap/folkeforsker` | Folkeforsker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/vitenskap/vitenskap_folkeforsker.json) | Mangler gjennomgått kildeprofil |
| `vitenskap/labnerd` | Labnerd | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/vitenskap/vitenskap_labnerd.json) | Mangler gjennomgått kildeprofil |
| `vitenskap/maker` | Maker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/vitenskap/vitenskap_maker.json) | Mangler gjennomgått kildeprofil |
| `vitenskap/stjernekikker` | Stjernekikker | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/vitenskap/vitenskap_stjernekikker.json) | Mangler gjennomgått kildeprofil |
| `vitenskap/teknologibygger` | Teknologibygger | Rolleverden finnes | [Rolleverden](../data/Civication/roleWorlds/vitenskap/vitenskap_teknologibygger.json) | Mangler gjennomgått kildeprofil |

## Leveveier – ni økonomiske kontekster, ikke egne jobbroller

Kanonisk kilde: [Leveveikatalogen](../data/Civication/livelihoodCatalog.json). Levevei må kobles til faktisk inntekt, avtale og hendelse i spillet; verken inntektsstrøm eller utbetalingsrettighet oppstår automatisk når en Life Story åpnes.

| Kode | Type | Status |
| --- | --- | --- |
| `freelance_assignment` | Frilansoppdrag | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `gig_honorarium` | Gig / honorar | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `royalty_income` | Royalty | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `direct_sale` | Salg | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `project_grant` | Prosjektmidler | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `casual_shift` | Ekstravakt / småjobb | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `support_payment` | Støtte / ytelse | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `other_income` | Annen dokumentert inntekt | Kontekst/økonomi – ikke automatisk jobb eller identitet |
| `zero_income_period` | Periode uten inntekt | Kontekst/økonomi – ikke automatisk jobb eller identitet |

## Registergrenser og status

- **Rolle/kategori:** 446 katalogoppføringer, inkludert 434 modell-/rolleverdens- og spesialoppføringer samt 12 tekniske rollepakkeoppføringer, men ikke 446 *unike* jobber. Alias og flere titler må kontrolleres i resolveren.
- **Life Story:** 15 fortellingspakker med hver sin rolle/scene/tråd; koblingen bevarer den kanoniske rollen og dens faktiske spillhistorikk.
- **Livsposisjon:** 199 selvvalgbare valg i livsposisjonsregisteret, hvorav 40 uttrykkelig ikke er egne rolleverden-identiteter.
- **Synopsis og relasjon:** 24 redaksjonelle fortellingsspor over, hvor handling eller rollefigurer ikke blir faktiske spillerhendelser før de er materialisert og spilt.
- **Levevei:** ni økonomiske typer. Disse er ikke stillinger, kan ikke gi arbeidstillatelse og må aldri telle som automatisk lønn.
- **Kildeprofil:** «Mangler gjennomgått kildeprofil» er et dokumentasjonsgap, ikke bevis for at en Life Story mangler spillbarhet eller kompetanse.

**Vedlikehold:** Nye roller, Life Story-spor, livsposisjoner, synopser og kilder må registreres i riktig kanonisk kilde først. Deretter oppdateres denne oversikten og tilhørende kontroller. Ikke generer hundrevis av generiske yrkesbeskrivelser for å lukke dekningsgapet.

## Registrerte oppføringer

### by

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `arealplanlegger` | [Modell arealplanlegger](../data/Civication/roleModels/by/arealplanlegger.json) | [Profil](civication-symposium/arealplanlegger.md) |
| `arkitekt` | [Modell arkitekt](../data/Civication/roleModels/by/arkitekt.json) | Mangler profil |
| `by_arkitekt` | [Rolleverden by_arkitekt](../data/Civication/roleWorlds/by/by_arkitekt.json) | Mangler profil |
| `by_assistent` | [Rolleverden by_assistent](../data/Civication/roleWorlds/by/by_assistent.json) | Mangler profil |
| `by_byvandrer` | [Rolleverden by_byvandrer](../data/Civication/roleWorlds/by/by_byvandrer.json) | Mangler profil |
| `by_flanor` | [Rolleverden by_flanor](../data/Civication/roleWorlds/by/by_flanor.json) | Mangler profil |
| `by_nabolagskjenner` | [Rolleverden by_nabolagskjenner](../data/Civication/roleWorlds/by/by_nabolagskjenner.json) | Mangler profil |
| `by_prosjektleder` | [Rolleverden by_prosjektleder](../data/Civication/roleWorlds/by/by_prosjektleder.json) | Mangler profil |
| `by_radgiver_plan` | [Rolleverden by_radgiver_plan](../data/Civication/roleWorlds/by/by_radgiver_plan.json) · [Life Story arealplanlegger](../data/Civication/lifestory/roles/arealplanlegger/role.json) | [Profil](civication-symposium/arealplanlegger.md) |
| `by_saksbehandler` | [Rolleverden by_saksbehandler](../data/Civication/roleWorlds/by/by_saksbehandler.json) | [Profil](civication-symposium/by-saksbehandler.md) |
| `by_urbanist` | [Rolleverden by_urbanist](../data/Civication/roleWorlds/by/by_urbanist.json) | Mangler profil |
| `byarkitekt` | [Modell byarkitekt](../data/Civication/roleModels/by/byarkitekt.json) | Mangler profil |
| `byplanlegger` | [Modell byplanlegger](../data/Civication/roleModels/by/byplanlegger.json) | Mangler profil |
| `direktor_byutvikling` | [Modell direktor_byutvikling](../data/Civication/roleModels/by/direktor_byutvikling.json) | Mangler profil |
| `fagsjef_plan_bygg` | [Modell fagsjef_plan_bygg](../data/Civication/roleModels/by/fagsjef_plan_bygg.json) | Mangler profil |
| `forstekonsulent` | [Modell forstekonsulent](../data/Civication/roleModels/by/forstekonsulent.json) | Mangler profil |
| `praktikant_arkitektur_plan` | [Modell praktikant_arkitektur_plan](../data/Civication/roleModels/by/praktikant_arkitektur_plan.json) | Mangler profil |
| `prosjektleder_byutvikling` | [Modell prosjektleder_byutvikling](../data/Civication/roleModels/by/prosjektleder_byutvikling.json) | Mangler profil |
| `prosjektmedarbeider` | [Modell prosjektmedarbeider](../data/Civication/roleModels/by/prosjektmedarbeider.json) | Mangler profil |
| `radgiver_byutvikling` | [Modell radgiver_byutvikling](../data/Civication/roleModels/by/radgiver_byutvikling.json) | Mangler profil |
| `saksbehandler_plan_bygg` | [Modell saksbehandler_plan_bygg](../data/Civication/roleModels/by/saksbehandler_plan_bygg.json) | Mangler profil |
| `seksjonsleder` | [Modell seksjonsleder](../data/Civication/roleModels/by/seksjonsleder.json) | Mangler profil |
| `seniorarkitekt` | [Modell seniorarkitekt](../data/Civication/roleModels/by/seniorarkitekt.json) | Mangler profil |
| `seniorradgiver_byutvikling` | [Modell seniorradgiver_byutvikling](../data/Civication/roleModels/by/seniorradgiver_byutvikling.json) | Mangler profil |
| `studentassistent` | [Modell studentassistent](../data/Civication/roleModels/by/studentassistent.json) | Mangler profil |

### film_tv

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `connaisseur` | [Modell connaisseur](../data/Civication/roleModels/film_tv/connaisseur.json) | Mangler profil |
| `film_og_tv_stjerne` | [Modell film_og_tv_stjerne](../data/Civication/roleModels/film_tv/film_og_tv_stjerne.json) | Mangler profil |
| `film_tv_festivalgjenger` | [Rolleverden film_tv_festivalgjenger](../data/Civication/roleWorlds/film_tv/film_tv_festivalgjenger.json) | Mangler profil |
| `film_tv_filmfantast` | [Rolleverden film_tv_filmfantast](../data/Civication/roleWorlds/film_tv/film_tv_filmfantast.json) | Mangler profil |
| `film_tv_filminteressert` | [Rolleverden film_tv_filminteressert](../data/Civication/roleWorlds/film_tv/film_tv_filminteressert.json) | Mangler profil |
| `film_tv_filmklubbmenneske` | [Rolleverden film_tv_filmklubbmenneske](../data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json) | Mangler profil |
| `film_tv_filmnerd` | [Rolleverden film_tv_filmnerd](../data/Civication/roleWorlds/film_tv/film_tv_filmnerd.json) | Mangler profil |
| `film_tv_kinogjenger` | [Rolleverden film_tv_kinogjenger](../data/Civication/roleWorlds/film_tv/film_tv_kinogjenger.json) | Mangler profil |
| `film_tv_kjenner` | [Rolleverden film_tv_kjenner](../data/Civication/roleWorlds/film_tv/film_tv_kjenner.json) | Mangler profil |
| `film_tv_seer` | [Rolleverden film_tv_seer](../data/Civication/roleWorlds/film_tv/film_tv_seer.json) | Mangler profil |
| `film_tv_seriesluker` | [Rolleverden film_tv_seriesluker](../data/Civication/roleWorlds/film_tv/film_tv_seriesluker.json) | Mangler profil |
| `filmfantast` | [Modell filmfantast](../data/Civication/roleModels/film_tv/filmfantast.json) | Mangler profil |
| `filminteressert` | [Modell filminteressert](../data/Civication/roleModels/film_tv/filminteressert.json) | Mangler profil |
| `ikon` | [Modell ikon](../data/Civication/roleModels/film_tv/ikon.json) | Mangler profil |
| `internasjonalt_gjennomslag` | [Modell internasjonalt_gjennomslag](../data/Civication/roleModels/film_tv/internasjonalt_gjennomslag.json) | Mangler profil |
| `kjenner` | [Modell kjenner](../data/Civication/roleModels/film_tv/kjenner.json) | Mangler profil |
| `kurator_film_tv` | [Modell kurator_film_tv](../data/Civication/roleModels/film_tv/kurator_film_tv.json) · [Rolleverden kurator_film_tv](../data/Civication/roleWorlds/film_tv/kurator_film_tv.json) | Mangler profil |
| `manusmedarbeider` | [Modell manusmedarbeider](../data/Civication/roleModels/film_tv/manusmedarbeider.json) · [Rolleverden manusmedarbeider](../data/Civication/roleWorlds/film_tv/manusmedarbeider.json) | Mangler profil |
| `prisvinner` | [Modell prisvinner](../data/Civication/roleModels/film_tv/prisvinner.json) | Mangler profil |
| `produksjonsassistent` | [Modell produksjonsassistent](../data/Civication/roleModels/film_tv/produksjonsassistent.json) · [Rolleverden produksjonsassistent](../data/Civication/roleWorlds/film_tv/produksjonsassistent.json) | Mangler profil |
| `programleder` | [Modell programleder](../data/Civication/roleModels/film_tv/programleder.json) · [Rolleverden programleder](../data/Civication/roleWorlds/film_tv/programleder.json) | Mangler profil |
| `regissor` | [Modell regissor](../data/Civication/roleModels/film_tv/regissor.json) · [Rolleverden regissor](../data/Civication/roleWorlds/film_tv/regissor.json) | Mangler profil |
| `seer` | [Modell seer](../data/Civication/roleModels/film_tv/seer.json) | Mangler profil |
| `serieskaper` | [Modell serieskaper](../data/Civication/roleModels/film_tv/serieskaper.json) · [Rolleverden serieskaper](../data/Civication/roleWorlds/film_tv/serieskaper.json) | Mangler profil |

### filosofi

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `filosofi_argumentbygger` | [Rolleverden filosofi_argumentbygger](../data/Civication/roleWorlds/filosofi/filosofi_argumentbygger.json) | Mangler profil |
| `filosofi_etiker` | [Rolleverden filosofi_etiker](../data/Civication/roleWorlds/filosofi/filosofi_etiker.json) | Mangler profil |
| `filosofi_fagfilosof` | [Rolleverden filosofi_fagfilosof](../data/Civication/roleWorlds/filosofi/filosofi_fagfilosof.json) | Mangler profil |
| `filosofi_filosofisk_veileder` | [Rolleverden filosofi_filosofisk_veileder](../data/Civication/roleWorlds/filosofi/filosofi_filosofisk_veileder.json) | Mangler profil |
| `filosofi_filosofistudent` | [Rolleverden filosofi_filosofistudent](../data/Civication/roleWorlds/filosofi/filosofi_filosofistudent.json) | Mangler profil |
| `filosofi_forskning_og_formidling` | [Modell filosofi_forskning_og_formidling](../data/Civication/roleModels/filosofi/filosofi_forskning_og_formidling.json) · [Rolleverden filosofi_forskning_og_formidling](../data/Civication/roleWorlds/filosofi/filosofi_forskning_og_formidling.json) | Mangler profil |
| `filosofi_lesesirkelmenneske` | [Rolleverden filosofi_lesesirkelmenneske](../data/Civication/roleWorlds/filosofi/filosofi_lesesirkelmenneske.json) | Mangler profil |
| `filosofi_livsgrubler` | [Rolleverden filosofi_livsgrubler](../data/Civication/roleWorlds/filosofi/filosofi_livsgrubler.json) | Mangler profil |
| `filosofi_logiker` | [Rolleverden filosofi_logiker](../data/Civication/roleWorlds/filosofi/filosofi_logiker.json) | Mangler profil |
| `filosofi_nysgjerrig` | [Rolleverden filosofi_nysgjerrig](../data/Civication/roleWorlds/filosofi/filosofi_nysgjerrig.json) | Mangler profil |
| `filosofi_samtalepartner` | [Rolleverden filosofi_samtalepartner](../data/Civication/roleWorlds/filosofi/filosofi_samtalepartner.json) | Mangler profil |
| `filosofi_sofafilosof` | [Rolleverden filosofi_sofafilosof](../data/Civication/roleWorlds/filosofi/filosofi_sofafilosof.json) | Mangler profil |
| `filosofi_sporrer` | [Rolleverden filosofi_sporrer](../data/Civication/roleWorlds/filosofi/filosofi_sporrer.json) | Mangler profil |
| `filosofi_undervisning_og_akademia` | [Modell filosofi_undervisning_og_akademia](../data/Civication/roleModels/filosofi/filosofi_undervisning_og_akademia.json) · [Rolleverden filosofi_undervisning_og_akademia](../data/Civication/roleWorlds/filosofi/filosofi_undervisning_og_akademia.json) | Mangler profil |

### helse

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `helse_evidensleser` | [Rolleverden helse_evidensleser](../data/Civication/roleWorlds/helse/helse_evidensleser.json) | Mangler profil |
| `helse_folkehelseblikk` | [Rolleverden helse_folkehelseblikk](../data/Civication/roleWorlds/helse/helse_folkehelseblikk.json) | Mangler profil |
| `helse_helseutforsker` | [Rolleverden helse_helseutforsker](../data/Civication/roleWorlds/helse/helse_helseutforsker.json) | Mangler profil |
| `helse_omsorgsetiker` | [Rolleverden helse_omsorgsetiker](../data/Civication/roleWorlds/helse/helse_omsorgsetiker.json) | Mangler profil |

### historie

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `arkivar` | [Modell arkivar](../data/Civication/roleModels/historie/arkivar.json) | Mangler profil |
| `arkivmedarbeider` | [Modell arkivmedarbeider](../data/Civication/roleModels/historie/arkivmedarbeider.json) | Mangler profil |
| `avdelingsdirektor` | [Modell avdelingsdirektor](../data/Civication/roleModels/historie/avdelingsdirektor.json) | Mangler profil |
| `avdelingsleder` | [Modell avdelingsleder](../data/Civication/roleModels/historie/avdelingsleder.json) | Mangler profil |
| `direktor` | [Modell direktor](../data/Civication/roleModels/historie/direktor.json) | Mangler profil |
| `doktorgradsstudent` | [Modell doktorgradsstudent](../data/Civication/roleModels/historie/doktorgradsstudent.json) | Mangler profil |
| `forsker` | [Modell forsker](../data/Civication/roleModels/historie/forsker.json) | Mangler profil |
| `forstekonsulent` | [Modell forstekonsulent](../data/Civication/roleModels/historie/forstekonsulent.json) | Mangler profil |
| `historie_arkiv_og_dokumentasjon` | [Modell historie_arkiv_og_dokumentasjon](../data/Civication/roleModels/historie/historie_arkiv_og_dokumentasjon.json) · [Rolleverden historie_arkiv_og_dokumentasjon](../data/Civication/roleWorlds/historie/historie_arkiv_og_dokumentasjon.json) | Mangler profil |
| `historie_arkivrotte` | [Rolleverden historie_arkivrotte](../data/Civication/roleWorlds/historie/historie_arkivrotte.json) | Mangler profil |
| `historie_doktorgradsstudent_historie` | [Rolleverden historie_doktorgradsstudent_historie](../data/Civication/roleWorlds/historie/historie_doktorgradsstudent_historie.json) | Mangler profil |
| `historie_fagledelse` | [Modell historie_fagledelse](../data/Civication/roleModels/historie/historie_fagledelse.json) · [Rolleverden historie_fagledelse](../data/Civication/roleWorlds/historie/historie_fagledelse.json) | Mangler profil |
| `historie_forskning_og_akademia` | [Modell historie_forskning_og_akademia](../data/Civication/roleModels/historie/historie_forskning_og_akademia.json) · [Rolleverden historie_forskning_og_akademia](../data/Civication/roleWorlds/historie/historie_forskning_og_akademia.json) | Mangler profil |
| `historie_forvaltning_og_radgivning` | [Modell historie_forvaltning_og_radgivning](../data/Civication/roleModels/historie/historie_forvaltning_og_radgivning.json) · [Rolleverden historie_forvaltning_og_radgivning](../data/Civication/roleWorlds/historie/historie_forvaltning_og_radgivning.json) | Mangler profil |
| `historie_historievandrer` | [Rolleverden historie_historievandrer](../data/Civication/roleWorlds/historie/historie_historievandrer.json) | Mangler profil |
| `historie_institusjonsledelse` | [Modell historie_institusjonsledelse](../data/Civication/roleModels/historie/historie_institusjonsledelse.json) · [Rolleverden historie_institusjonsledelse](../data/Civication/roleWorlds/historie/historie_institusjonsledelse.json) | Mangler profil |
| `historie_lokalhistoriker` | [Rolleverden historie_lokalhistoriker](../data/Civication/roleWorlds/historie/historie_lokalhistoriker.json) | Mangler profil |
| `historie_masterstuden_historie` | [Rolleverden historie_masterstuden_historie](../data/Civication/roleWorlds/historie/historie_masterstuden_historie.json) | Mangler profil |
| `historie_museum_og_samling` | [Modell historie_museum_og_samling](../data/Civication/roleModels/historie/historie_museum_og_samling.json) · [Rolleverden historie_museum_og_samling](../data/Civication/roleWorlds/historie/historie_museum_og_samling.json) | Mangler profil |
| `historie_student_historie` | [Rolleverden historie_student_historie](../data/Civication/roleWorlds/historie/historie_student_historie.json) | Mangler profil |
| `konservator` | [Modell konservator](../data/Civication/roleModels/historie/konservator.json) | Mangler profil |
| `kurator` | [Modell kurator](../data/Civication/roleModels/historie/kurator.json) | Mangler profil |
| `masterstuden` | [Modell masterstuden](../data/Civication/roleModels/historie/masterstuden.json) | Mangler profil |
| `radgiver` | [Modell radgiver](../data/Civication/roleModels/historie/radgiver.json) | Mangler profil |
| `saksbehandler` | [Modell saksbehandler](../data/Civication/roleModels/historie/saksbehandler.json) | Mangler profil |
| `seksjonsleder` | [Modell seksjonsleder](../data/Civication/roleModels/historie/seksjonsleder.json) | Mangler profil |
| `senior_konservator` | [Modell senior_konservator](../data/Civication/roleModels/historie/senior_konservator.json) | Mangler profil |
| `senior_kurator` | [Modell senior_kurator](../data/Civication/roleModels/historie/senior_kurator.json) | Mangler profil |
| `seniorforsker` | [Modell seniorforsker](../data/Civication/roleModels/historie/seniorforsker.json) | Mangler profil |
| `seniorradgiver` | [Modell seniorradgiver](../data/Civication/roleModels/historie/seniorradgiver.json) | Mangler profil |
| `spesialradgiver` | [Modell spesialradgiver](../data/Civication/roleModels/historie/spesialradgiver.json) | Mangler profil |
| `student` | [Modell student](../data/Civication/roleModels/historie/student.json) | Mangler profil |

### kunst

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `formidler` | [Modell formidler](../data/Civication/roleModels/kunst/formidler.json) | Mangler profil |
| `gallerimedarbeider` | [Modell gallerimedarbeider](../data/Civication/roleModels/kunst/gallerimedarbeider.json) | Mangler profil |
| `gallerist` | [Modell gallerist](../data/Civication/roleModels/kunst/gallerist.json) | Mangler profil |
| `konservator` | [Modell konservator](../data/Civication/roleModels/kunst/konservator.json) | Mangler profil |
| `kunst_ateliermenneske` | [Rolleverden kunst_ateliermenneske](../data/Civication/roleWorlds/kunst/kunst_ateliermenneske.json) | Mangler profil |
| `kunst_gallerist` | [Rolleverden kunst_gallerist](../data/Civication/roleWorlds/kunst/kunst_gallerist.json) | Mangler profil |
| `kunst_gallerivanker` | [Rolleverden kunst_gallerivanker](../data/Civication/roleWorlds/kunst/kunst_gallerivanker.json) | Mangler profil |
| `kunst_gatekunstjeger` | [Rolleverden kunst_gatekunstjeger](../data/Civication/roleWorlds/kunst/kunst_gatekunstjeger.json) | Mangler profil |
| `kunst_konservering_og_samling` | [Modell kunst_konservering_og_samling](../data/Civication/roleModels/kunst/kunst_konservering_og_samling.json) · [Rolleverden kunst_konservering_og_samling](../data/Civication/roleWorlds/kunst/kunst_konservering_og_samling.json) | Mangler profil |
| `kunst_kunstnerisk_ledelse` | [Modell kunst_kunstnerisk_ledelse](../data/Civication/roleModels/kunst/kunst_kunstnerisk_ledelse.json) · [Rolleverden kunst_kunstnerisk_ledelse](../data/Civication/roleWorlds/kunst/kunst_kunstnerisk_ledelse.json) | Mangler profil |
| `kunst_kunstsamler` | [Rolleverden kunst_kunstsamler](../data/Civication/roleWorlds/kunst/kunst_kunstsamler.json) | Mangler profil |
| `kunst_kuratering_og_program` | [Modell kunst_kuratering_og_program](../data/Civication/roleModels/kunst/kunst_kuratering_og_program.json) · [Rolleverden kunst_kuratering_og_program](../data/Civication/roleWorlds/kunst/kunst_kuratering_og_program.json) | Mangler profil |
| `kunst_kuratorpraksis` | [Rolleverden kunst_kuratorpraksis](../data/Civication/roleWorlds/kunst/kunst_kuratorpraksis.json) | Mangler profil |
| `kunst_museumsledelse` | [Modell kunst_museumsledelse](../data/Civication/roleModels/kunst/kunst_museumsledelse.json) · [Rolleverden kunst_museumsledelse](../data/Civication/roleWorlds/kunst/kunst_museumsledelse.json) | Mangler profil |
| `kunst_publikum_og_formidling` | [Modell kunst_publikum_og_formidling](../data/Civication/roleModels/kunst/kunst_publikum_og_formidling.json) · [Rolleverden kunst_publikum_og_formidling](../data/Civication/roleWorlds/kunst/kunst_publikum_og_formidling.json) | Mangler profil |
| `kunst_utstillingsproduksjon` | [Modell kunst_utstillingsproduksjon](../data/Civication/roleModels/kunst/kunst_utstillingsproduksjon.json) · [Rolleverden kunst_utstillingsproduksjon](../data/Civication/roleWorlds/kunst/kunst_utstillingsproduksjon.json) | Mangler profil |
| `kunst_vernissagegjenger` | [Rolleverden kunst_vernissagegjenger](../data/Civication/roleWorlds/kunst/kunst_vernissagegjenger.json) | Mangler profil |
| `kunstnerisk_leder` | [Modell kunstnerisk_leder](../data/Civication/roleModels/kunst/kunstnerisk_leder.json) | Mangler profil |
| `kurator` | [Modell kurator](../data/Civication/roleModels/kunst/kurator.json) | Mangler profil |
| `kuratorassistent` | [Modell kuratorassistent](../data/Civication/roleModels/kunst/kuratorassistent.json) | Mangler profil |
| `museumsdirektor` | [Modell museumsdirektor](../data/Civication/roleModels/kunst/museumsdirektor.json) | Mangler profil |
| `produksjonsassistent` | [Modell produksjonsassistent](../data/Civication/roleModels/kunst/produksjonsassistent.json) | Mangler profil |
| `senior_konservator` | [Modell senior_konservator](../data/Civication/roleModels/kunst/senior_konservator.json) | Mangler profil |
| `senior_kurator` | [Modell senior_kurator](../data/Civication/roleModels/kunst/senior_kurator.json) | Mangler profil |
| `utstillingskoordinator` | [Modell utstillingskoordinator](../data/Civication/roleModels/kunst/utstillingskoordinator.json) | Mangler profil |
| `utstillingsprodusent` | [Modell utstillingsprodusent](../data/Civication/roleModels/kunst/utstillingsprodusent.json) | Mangler profil |
| `vertskap_museum_galleri` | [Modell vertskap_museum_galleri](../data/Civication/roleModels/kunst/vertskap_museum_galleri.json) | Mangler profil |

### litteratur

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `aktiv_leser` | [Modell aktiv_leser](../data/Civication/roleModels/litteratur/aktiv_leser.json) | Mangler profil |
| `anmelder` | [Modell anmelder](../data/Civication/roleModels/litteratur/anmelder.json) | Mangler profil |
| `bestselgerforfatter` | [Modell bestselgerforfatter](../data/Civication/roleModels/litteratur/bestselgerforfatter.json) | Mangler profil |
| `dramatiker` | [Modell dramatiker](../data/Civication/roleModels/litteratur/dramatiker.json) | Mangler profil |
| `essayist` | [Modell essayist](../data/Civication/roleModels/litteratur/essayist.json) | Mangler profil |
| `etablert_forfatter` | [Modell etablert_forfatter](../data/Civication/roleModels/litteratur/etablert_forfatter.json) | Mangler profil |
| `forfatter` | [Modell forfatter](../data/Civication/roleModels/litteratur/forfatter.json) | Mangler profil |
| `kanonisert_forfatter` | [Modell kanonisert_forfatter](../data/Civication/roleModels/litteratur/kanonisert_forfatter.json) | Mangler profil |
| `leser` | [Modell leser](../data/Civication/roleModels/litteratur/leser.json) | Mangler profil |
| `litteratur_aktiv_leser` | [Rolleverden litteratur_aktiv_leser](../data/Civication/roleWorlds/litteratur/litteratur_aktiv_leser.json) | Mangler profil |
| `litteratur_anmelder` | [Rolleverden litteratur_anmelder](../data/Civication/roleWorlds/litteratur/litteratur_anmelder.json) | Mangler profil |
| `litteratur_biblioteksvanker` | [Rolleverden litteratur_biblioteksvanker](../data/Civication/roleWorlds/litteratur/litteratur_biblioteksvanker.json) | Mangler profil |
| `litteratur_bokklubbmenneske` | [Rolleverden litteratur_bokklubbmenneske](../data/Civication/roleWorlds/litteratur/litteratur_bokklubbmenneske.json) | Mangler profil |
| `litteratur_bokorm` | [Rolleverden litteratur_bokorm](../data/Civication/roleWorlds/litteratur/litteratur_bokorm.json) | Mangler profil |
| `litteratur_dramatiker` | [Rolleverden litteratur_dramatiker](../data/Civication/roleWorlds/litteratur/litteratur_dramatiker.json) | Mangler profil |
| `litteratur_essayist` | [Rolleverden litteratur_essayist](../data/Civication/roleWorlds/litteratur/litteratur_essayist.json) | Mangler profil |
| `litteratur_forfatter` | [Rolleverden litteratur_forfatter](../data/Civication/roleWorlds/litteratur/litteratur_forfatter.json) | Mangler profil |
| `litteratur_leser` | [Rolleverden litteratur_leser](../data/Civication/roleWorlds/litteratur/litteratur_leser.json) | Mangler profil |
| `litteratur_litteraturinteressert` | [Rolleverden litteratur_litteraturinteressert](../data/Civication/roleWorlds/litteratur/litteratur_litteraturinteressert.json) | Mangler profil |
| `litteratur_litteraturkritiker` | [Rolleverden litteratur_litteraturkritiker](../data/Civication/roleWorlds/litteratur/litteratur_litteraturkritiker.json) | Mangler profil |
| `litteratur_poet` | [Rolleverden litteratur_poet](../data/Civication/roleWorlds/litteratur/litteratur_poet.json) | Mangler profil |
| `litteratur_skald` | [Rolleverden litteratur_skald](../data/Civication/roleWorlds/litteratur/litteratur_skald.json) | Mangler profil |
| `litteratur_skribent` | [Rolleverden litteratur_skribent](../data/Civication/roleWorlds/litteratur/litteratur_skribent.json) | Mangler profil |
| `litteratur_skrivebordspoet` | [Rolleverden litteratur_skrivebordspoet](../data/Civication/roleWorlds/litteratur/litteratur_skrivebordspoet.json) | Mangler profil |
| `litteratur_smaforlagsnerd` | [Rolleverden litteratur_smaforlagsnerd](../data/Civication/roleWorlds/litteratur/litteratur_smaforlagsnerd.json) | Mangler profil |
| `litteraturinteressert` | [Modell litteraturinteressert](../data/Civication/roleModels/litteratur/litteraturinteressert.json) | Mangler profil |
| `litteraturkritiker` | [Modell litteraturkritiker](../data/Civication/roleModels/litteratur/litteraturkritiker.json) | Mangler profil |
| `poet` | [Modell poet](../data/Civication/roleModels/litteratur/poet.json) | Mangler profil |
| `prisvinnende_forfatter` | [Modell prisvinnende_forfatter](../data/Civication/roleModels/litteratur/prisvinnende_forfatter.json) | Mangler profil |
| `redaksjonsmedarbeider` | [Modell redaksjonsmedarbeider](../data/Civication/roleModels/litteratur/redaksjonsmedarbeider.json) · [Rolleverden redaksjonsmedarbeider](../data/Civication/roleWorlds/litteratur/redaksjonsmedarbeider.json) | Mangler profil |
| `redaktor_bok` | [Modell redaktor_bok](../data/Civication/roleModels/litteratur/redaktor_bok.json) · [Rolleverden redaktor_bok](../data/Civication/roleWorlds/litteratur/redaktor_bok.json) | Mangler profil |
| `skald` | [Modell skald](../data/Civication/roleModels/litteratur/skald.json) | Mangler profil |
| `skribent` | [Modell skribent](../data/Civication/roleModels/litteratur/skribent.json) | Mangler profil |

### liv_alternativ

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `liv_alternativ_bohem` | [Rolleverden liv_alternativ_bohem](../data/Civication/roleWorlds/liv_alternativ/liv_alternativ_bohem.json) | Mangler profil |
| `liv_alternativ_nomade` | [Rolleverden liv_alternativ_nomade](../data/Civication/roleWorlds/liv_alternativ/liv_alternativ_nomade.json) | Mangler profil |

### liv_bosituasjon

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `liv_bosituasjon_boms` | [Rolleverden liv_bosituasjon_boms](../data/Civication/roleWorlds/liv_bosituasjon/liv_bosituasjon_boms.json) | Mangler profil |
| `liv_bosituasjon_uteligger` | [Rolleverden liv_bosituasjon_uteligger](../data/Civication/roleWorlds/liv_bosituasjon/liv_bosituasjon_uteligger.json) | Mangler profil |

### liv_lovsbane

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `liv_lovsbane_kriminell` | [Rolleverden liv_lovsbane_kriminell](../data/Civication/roleWorlds/liv_lovsbane/liv_lovsbane_kriminell.json) | Mangler profil |

### media

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `bidragsyter` | [Modell bidragsyter](../data/Civication/roleModels/media/bidragsyter.json) | Mangler profil |
| `community_medlem` | [Modell community_medlem](../data/Civication/roleModels/media/community_medlem.json) | Mangler profil |
| `fan` | [Modell fan](../data/Civication/roleModels/media/fan.json) | Mangler profil |
| `folger` | [Modell folger](../data/Civication/roleModels/media/folger.json) | Mangler profil |
| `frilansjournalist` | [Modell frilansjournalist](../data/Civication/roleModels/media/frilansjournalist.json) | Mangler profil |
| `ikon` | [Modell ikon](../data/Civication/roleModels/media/ikon.json) | Mangler profil |
| `influencer` | [Modell influencer](../data/Civication/roleModels/media/influencer.json) | Mangler profil |
| `innholdsskaper` | [Modell innholdsskaper](../data/Civication/roleModels/media/innholdsskaper.json) | Mangler profil |
| `kommentator_felt` | [Modell kommentator_felt](../data/Civication/roleModels/media/kommentator_felt.json) | Mangler profil |
| `kreator` | [Modell kreator](../data/Civication/roleModels/media/kreator.json) | Mangler profil |
| `kultfigur` | [Modell kultfigur](../data/Civication/roleModels/media/kultfigur.json) | Mangler profil |
| `legende` | [Modell legende](../data/Civication/roleModels/media/legende.json) | Mangler profil |
| `leser` | [Modell leser](../data/Civication/roleModels/media/leser.json) | Mangler profil |
| `media_bidragsyter` | [Rolleverden media_bidragsyter](../data/Civication/roleWorlds/media/media_bidragsyter.json) | Mangler profil |
| `media_folger` | [Rolleverden media_folger](../data/Civication/roleWorlds/media/media_folger.json) | Mangler profil |
| `media_frilansjournalist` | [Rolleverden media_frilansjournalist](../data/Civication/roleWorlds/media/media_frilansjournalist.json) | Mangler profil |
| `media_kommentarfeltveteran` | [Rolleverden media_kommentarfeltveteran](../data/Civication/roleWorlds/media/media_kommentarfeltveteran.json) | Mangler profil |
| `media_kommentator_felt` | [Rolleverden media_kommentator_felt](../data/Civication/roleWorlds/media/media_kommentator_felt.json) | Mangler profil |
| `media_leser` | [Rolleverden media_leser](../data/Civication/roleWorlds/media/media_leser.json) | Mangler profil |
| `media_medievaktbikkje` | [Rolleverden media_medievaktbikkje](../data/Civication/roleWorlds/media/media_medievaktbikkje.json) | Mangler profil |
| `media_nyhetsjunkie` | [Rolleverden media_nyhetsjunkie](../data/Civication/roleWorlds/media/media_nyhetsjunkie.json) | Mangler profil |
| `media_podkastsluker` | [Rolleverden media_podkastsluker](../data/Civication/roleWorlds/media/media_podkastsluker.json) | Mangler profil |
| `media_redaksjon` | [Modell journalist](../data/Civication/roleModels/media/journalist.json) · [Modell redaksjonsmedarbeider](../data/Civication/roleModels/media/redaksjonsmedarbeider.json) · [Modell reporter](../data/Civication/roleModels/media/reporter.json) · [Rolleverden media_redaksjon](../data/Civication/roleWorlds/media/media_redaksjon.json) | Mangler profil |
| `media_redaksjonell_ledelse` | [Modell nyhetsleder](../data/Civication/roleModels/media/nyhetsleder.json) · [Modell redaktor](../data/Civication/roleModels/media/redaktor.json) · [Modell sjefredaktor](../data/Civication/roleModels/media/sjefredaktor.json) · [Rolleverden media_redaksjonell_ledelse](../data/Civication/roleWorlds/media/media_redaksjonell_ledelse.json) | Mangler profil |
| `medieprofil` | [Modell medieprofil](../data/Civication/roleModels/media/medieprofil.json) | Mangler profil |
| `mediestjerne` | [Modell mediestjerne](../data/Civication/roleModels/media/mediestjerne.json) | Mangler profil |
| `offentlig_dagsordensetter` | [Modell offentlig_dagsordensetter](../data/Civication/roleModels/media/offentlig_dagsordensetter.json) | Mangler profil |
| `offentlighetsmakt` | [Modell offentlighetsmakt](../data/Civication/roleModels/media/offentlighetsmakt.json) | Mangler profil |
| `profil` | [Modell profil](../data/Civication/roleModels/media/profil.json) | Mangler profil |
| `publikum` | [Modell publikum](../data/Civication/roleModels/media/publikum.json) | Mangler profil |
| `superfan` | [Modell superfan](../data/Civication/roleModels/media/superfan.json) | Mangler profil |
| `trendsetter` | [Modell trendsetter](../data/Civication/roleModels/media/trendsetter.json) | Mangler profil |

### musikk

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `artist` | [Modell artist](../data/Civication/roleModels/musikk/artist.json) | Mangler profil |
| `etablert_artist` | [Modell etablert_artist](../data/Civication/roleModels/musikk/etablert_artist.json) | Mangler profil |
| `frilansmusiker` | [Modell frilansmusiker](../data/Civication/roleModels/musikk/frilansmusiker.json) | Mangler profil |
| `headliner` | [Modell headliner](../data/Civication/roleModels/musikk/headliner.json) | Mangler profil |
| `musikk_artist` | [Rolleverden musikk_artist](../data/Civication/roleWorlds/musikk/musikk_artist.json) | Mangler profil |
| `musikk_frilansmusiker` | [Rolleverden musikk_frilansmusiker](../data/Civication/roleWorlds/musikk/musikk_frilansmusiker.json) | Mangler profil |
| `musikk_konsertgjenger` | [Rolleverden musikk_konsertgjenger](../data/Civication/roleWorlds/musikk/musikk_konsertgjenger.json) | Mangler profil |
| `musikk_musikknerd` | [Rolleverden musikk_musikknerd](../data/Civication/roleWorlds/musikk/musikk_musikknerd.json) | Mangler profil |
| `musikk_plateartist` | [Rolleverden musikk_plateartist](../data/Civication/roleWorlds/musikk/musikk_plateartist.json) | Mangler profil |
| `musikk_plategraver` | [Rolleverden musikk_plategraver](../data/Civication/roleWorlds/musikk/musikk_plategraver.json) | Mangler profil |
| `musikk_publikum_deltaker` | [Rolleverden musikk_publikum_deltaker](../data/Civication/roleWorlds/musikk/musikk_publikum_deltaker.json) | Mangler profil |
| `musikk_scene_og_produksjon` | [Modell musikk_scene_og_produksjon](../data/Civication/roleModels/musikk/musikk_scene_og_produksjon.json) · [Modell produksjonsassistent](../data/Civication/roleModels/musikk/produksjonsassistent.json) · [Modell produksjonskoordinator](../data/Civication/roleModels/musikk/produksjonskoordinator.json) · [Modell sceneassistent](../data/Civication/roleModels/musikk/sceneassistent.json) · [Modell tekniker_lys_lyd](../data/Civication/roleModels/musikk/tekniker_lys_lyd.json) · [Rolleverden musikk_scene_og_produksjon](../data/Civication/roleWorlds/musikk/musikk_scene_og_produksjon.json) | Mangler profil |
| `musikk_scenehenger` | [Rolleverden musikk_scenehenger](../data/Civication/roleWorlds/musikk/musikk_scenehenger.json) | Mangler profil |
| `musikk_solist` | [Rolleverden musikk_solist](../data/Civication/roleWorlds/musikk/musikk_solist.json) | Mangler profil |
| `musikk_utovende_musiker` | [Rolleverden musikk_utovende_musiker](../data/Civication/roleWorlds/musikk/musikk_utovende_musiker.json) | Mangler profil |
| `musikk_utoving_og_ensemble` | [Modell fast_musiker_band_ensemble](../data/Civication/roleModels/musikk/fast_musiker_band_ensemble.json) · [Modell musikk_utoving_og_ensemble](../data/Civication/roleModels/musikk/musikk_utoving_og_ensemble.json) · [Modell utovende_musiker](../data/Civication/roleModels/musikk/utovende_musiker.json) · [Rolleverden musikk_utoving_og_ensemble](../data/Civication/roleWorlds/musikk/musikk_utoving_og_ensemble.json) | Mangler profil |
| `plateartist` | [Modell plateartist](../data/Civication/roleModels/musikk/plateartist.json) | Mangler profil |
| `popstjerne` | [Modell popstjerne](../data/Civication/roleModels/musikk/popstjerne.json) | Mangler profil |
| `publikum_deltaker` | [Modell publikum_deltaker](../data/Civication/roleModels/musikk/publikum_deltaker.json) | Mangler profil |
| `solist` | [Modell solist](../data/Civication/roleModels/musikk/solist.json) | Mangler profil |
| `stjerneartist` | [Modell stjerneartist](../data/Civication/roleModels/musikk/stjerneartist.json) | Mangler profil |

### naeringsliv

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `arbeider` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `partial_pack` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_administrasjon_og_okonomistyring` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_fag_og_produksjon` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_finans_og_kapitalforvaltning` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_finansiell_ledelse` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_handel_og_kundeservice` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_logistikk_og_drift` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_operativ_ledelse` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_renhold_og_hygiene` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `naeringsliv_virksomhetsledelse` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `missing` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `administrasjonsmedarbeider` | [Rolleverden administrasjonsmedarbeider](../data/Civication/roleWorlds/naeringsliv/administrasjonsmedarbeider.json) | Mangler profil |
| `avdelingsleder` | [Modell avdelingsleder](../data/Civication/roleModels/naeringsliv/avdelingsleder.json) · [Rolleverden avdelingsleder](../data/Civication/roleWorlds/naeringsliv/avdelingsleder.json) | Mangler profil |
| `bedriftseier` | [Modell bedriftseier](../data/Civication/roleModels/naeringsliv/bedriftseier.json) | Mangler profil |
| `butikksjef_enhetsleder` | [Modell butikksjef_enhetsleder](../data/Civication/roleModels/naeringsliv/butikksjef_enhetsleder.json) | Mangler profil |
| `controller` | [Modell controller](../data/Civication/roleModels/naeringsliv/controller.json) · [Rolleverden controller](../data/Civication/roleWorlds/naeringsliv/controller.json) · [Life Story controller](../data/Civication/lifestory/roles/controller/role.json) | [Profil](civication-symposium/controller.md) |
| `daglig_leder` | [Modell daglig_leder](../data/Civication/roleModels/naeringsliv/daglig_leder.json) | Mangler profil |
| `driftsleder` | [Modell driftsleder](../data/Civication/roleModels/naeringsliv/driftsleder.json) | Mangler profil |
| `ekspeditor` | [Modell ekspeditor](../data/Civication/roleModels/naeringsliv/ekspeditor.json) · [Rolleverden ekspeditor](../data/Civication/roleWorlds/naeringsliv/ekspeditor.json) · [Life Story ekspeditor](../data/Civication/lifestory/roles/ekspeditor/role.json) | [Profil](civication-symposium/ekspeditor.md) |
| `fagarbeider` | [Modell fagarbeider](../data/Civication/roleModels/naeringsliv/fagarbeider.json) · [Rolleverden fagarbeider](../data/Civication/roleWorlds/naeringsliv/fagarbeider.json) | Mangler profil |
| `finansanalytiker` | [Modell finansanalytiker](../data/Civication/roleModels/naeringsliv/finansanalytiker.json) · [Rolleverden finansanalytiker](../data/Civication/roleWorlds/naeringsliv/finansanalytiker.json) | Mangler profil |
| `finansdirektor` | [Modell finansdirektor](../data/Civication/roleModels/naeringsliv/finansdirektor.json) · [Rolleverden finansdirektor](../data/Civication/roleWorlds/naeringsliv/finansdirektor.json) | Mangler profil |
| `formann` | [Rolleverden formann](../data/Civication/roleWorlds/naeringsliv/formann.json) | Mangler profil |
| `formann_arbeidsleder` | [Modell formann_arbeidsleder](../data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json) | Mangler profil |
| `grunder` | [Modell grunder](../data/Civication/roleModels/naeringsliv/grunder.json) | Mangler profil |
| `industribygger` | [Modell industribygger](../data/Civication/roleModels/naeringsliv/industribygger.json) | Mangler profil |
| `industrieier` | [Modell industrieier](../data/Civication/roleModels/naeringsliv/industrieier.json) | Mangler profil |
| `investor` | [Modell investor](../data/Civication/roleModels/naeringsliv/investor.json) | Mangler profil |
| `kapitalforvalter` | [Modell kapitalforvalter](../data/Civication/roleModels/naeringsliv/kapitalforvalter.json) | Mangler profil |
| `konserndirektor` | [Modell konserndirektor](../data/Civication/roleModels/naeringsliv/konserndirektor.json) | Mangler profil |
| `konsernsjef` | [Modell konsernsjef](../data/Civication/roleModels/naeringsliv/konsernsjef.json) | Mangler profil |
| `lager_og_driftsmedarbeider` | [Modell lager_og_driftsmedarbeider](../data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json) · [Rolleverden lager_og_driftsmedarbeider](../data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json) | [Profil](civication-symposium/lager-og-driftsmedarbeider.md) |
| `mellomleder` | [Rolleverden mellomleder](../data/Civication/roleWorlds/naeringsliv/mellomleder.json) | Mangler profil |
| `naeringsliv_bedriftseier` | [Rolleverden naeringsliv_bedriftseier](../data/Civication/roleWorlds/naeringsliv/naeringsliv_bedriftseier.json) | Mangler profil |
| `naeringsliv_frilanser` | [Rolleverden naeringsliv_frilanser](../data/Civication/roleWorlds/naeringsliv/naeringsliv_frilanser.json) | [Profil](civication-symposium/frilanser.md) |
| `naeringsliv_grunder` | [Rolleverden naeringsliv_grunder](../data/Civication/roleWorlds/naeringsliv/naeringsliv_grunder.json) | Mangler profil |
| `naeringsliv_grunderdrommer` | [Rolleverden naeringsliv_grunderdrommer](../data/Civication/roleWorlds/naeringsliv/naeringsliv_grunderdrommer.json) | Mangler profil |
| `naeringsliv_industrieier` | [Rolleverden naeringsliv_industrieier](../data/Civication/roleWorlds/naeringsliv/naeringsliv_industrieier.json) | Mangler profil |
| `naeringsliv_investor` | [Rolleverden naeringsliv_investor](../data/Civication/roleWorlds/naeringsliv/naeringsliv_investor.json) | Mangler profil |
| `naeringsliv_pendler` | [Rolleverden naeringsliv_pendler](../data/Civication/roleWorlds/naeringsliv/naeringsliv_pendler.json) | Mangler profil |
| `naeringsliv_sideprosjektbygger` | [Rolleverden naeringsliv_sideprosjektbygger](../data/Civication/roleWorlds/naeringsliv/naeringsliv_sideprosjektbygger.json) | Mangler profil |
| `naeringsliv_smasparer` | [Rolleverden naeringsliv_smasparer](../data/Civication/roleWorlds/naeringsliv/naeringsliv_smasparer.json) | Mangler profil |
| `okonomi_og_administrasjonsmedarbeider` | [Modell okonomi_og_administrasjonsmedarbeider](../data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json) | Mangler profil |
| `okonomi_og_finanssjef` | [Modell okonomi_og_finanssjef](../data/Civication/roleModels/naeringsliv/okonomi_og_finanssjef.json) · [Rolleverden okonomi_og_finanssjef](../data/Civication/roleWorlds/naeringsliv/okonomi_og_finanssjef.json) | Mangler profil |
| `produksjonsleder` | [Modell produksjonsleder](../data/Civication/roleModels/naeringsliv/produksjonsleder.json) | Mangler profil |
| `renholder` | [Modell renholder](../data/Civication/roleModels/naeringsliv/renholder.json) · [Rolleverden renholder](../data/Civication/roleWorlds/naeringsliv/renholder.json) · [Life Story renholder](../data/Civication/lifestory/roles/renholder/role.json) | [Profil](civication-symposium/renholder.md) |
| `skiftleder` | [Modell skiftleder](../data/Civication/roleModels/naeringsliv/skiftleder.json) | Mangler profil |

### natur

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `artsobservator` | [Modell artsobservator](../data/Civication/roleModels/natur/artsobservator.json) | Mangler profil |
| `biolog` | [Modell biolog](../data/Civication/roleModels/natur/biolog.json) | Mangler profil |
| `feltassistent` | [Modell feltassistent](../data/Civication/roleModels/natur/feltassistent.json) | Mangler profil |
| `feltobservator` | [Modell feltobservator](../data/Civication/roleModels/natur/feltobservator.json) | Mangler profil |
| `forsker_miljo_natur` | [Modell forsker_miljo_natur](../data/Civication/roleModels/natur/forsker_miljo_natur.json) | Mangler profil |
| `miljodirektor` | [Modell miljodirektor](../data/Civication/roleModels/natur/miljodirektor.json) | Mangler profil |
| `miljosjef` | [Modell miljosjef](../data/Civication/roleModels/natur/miljosjef.json) | Mangler profil |
| `natur_artsjeger` | [Rolleverden natur_artsjeger](../data/Civication/roleWorlds/natur/natur_artsjeger.json) | Mangler profil |
| `natur_artsobservator` | [Rolleverden natur_artsobservator](../data/Civication/roleWorlds/natur/natur_artsobservator.json) | Mangler profil |
| `natur_biologi_og_forskning` | [Modell natur_biologi_og_forskning](../data/Civication/roleModels/natur/natur_biologi_og_forskning.json) · [Rolleverden natur_biologi_og_forskning](../data/Civication/roleWorlds/natur/natur_biologi_og_forskning.json) | Mangler profil |
| `natur_felt_og_formidling` | [Modell natur_felt_og_formidling](../data/Civication/roleModels/natur/natur_felt_og_formidling.json) · [Rolleverden natur_felt_og_formidling](../data/Civication/roleWorlds/natur/natur_felt_og_formidling.json) | Mangler profil |
| `natur_feltobservator` | [Rolleverden natur_feltobservator](../data/Civication/roleWorlds/natur/natur_feltobservator.json) | Mangler profil |
| `natur_forvaltning_og_radgivning` | [Modell natur_forvaltning_og_radgivning](../data/Civication/roleModels/natur/natur_forvaltning_og_radgivning.json) · [Rolleverden natur_forvaltning_og_radgivning](../data/Civication/roleWorlds/natur/natur_forvaltning_og_radgivning.json) | Mangler profil |
| `natur_fuglekikker` | [Rolleverden natur_fuglekikker](../data/Civication/roleWorlds/natur/natur_fuglekikker.json) | Mangler profil |
| `natur_miljoledelse` | [Modell natur_miljoledelse](../data/Civication/roleModels/natur/natur_miljoledelse.json) · [Rolleverden natur_miljoledelse](../data/Civication/roleWorlds/natur/natur_miljoledelse.json) | Mangler profil |
| `natur_naturinteressert` | [Rolleverden natur_naturinteressert](../data/Civication/roleWorlds/natur/natur_naturinteressert.json) | Mangler profil |
| `natur_politisk_myndighet` | [Modell natur_politisk_myndighet](../data/Civication/roleModels/natur/natur_politisk_myndighet.json) · [Rolleverden natur_politisk_myndighet](../data/Civication/roleWorlds/natur/natur_politisk_myndighet.json) | Mangler profil |
| `natur_sanker` | [Rolleverden natur_sanker](../data/Civication/roleWorlds/natur/natur_sanker.json) | Mangler profil |
| `natur_turgaer` | [Rolleverden natur_turgaer](../data/Civication/roleWorlds/natur/natur_turgaer.json) | Mangler profil |
| `naturforvalter` | [Modell naturforvalter](../data/Civication/roleModels/natur/naturforvalter.json) | Mangler profil |
| `naturinteressert` | [Modell naturinteressert](../data/Civication/roleModels/natur/naturinteressert.json) | Mangler profil |
| `naturveileder` | [Modell naturveileder](../data/Civication/roleModels/natur/naturveileder.json) | Mangler profil |
| `naturvernleder` | [Modell naturvernleder](../data/Civication/roleModels/natur/naturvernleder.json) | Mangler profil |
| `okolog` | [Modell okolog](../data/Civication/roleModels/natur/okolog.json) | Mangler profil |
| `radgiver_miljo_natur` | [Modell radgiver_miljo_natur](../data/Civication/roleModels/natur/radgiver_miljo_natur.json) | Mangler profil |
| `seniorforsker_miljo_natur` | [Modell seniorforsker_miljo_natur](../data/Civication/roleModels/natur/seniorforsker_miljo_natur.json) | Mangler profil |
| `seniorradgiver_miljo_natur` | [Modell seniorradgiver_miljo_natur](../data/Civication/roleModels/natur/seniorradgiver_miljo_natur.json) | Mangler profil |
| `statsrad_klima_og_miljo` | [Modell statsrad_klima_og_miljo](../data/Civication/roleModels/natur/statsrad_klima_og_miljo.json) | Mangler profil |

### politikk

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `aktivist` | [Modell aktivist](../data/Civication/roleModels/politikk/aktivist.json) | Mangler profil |
| `diktator` | [Modell diktator](../data/Civication/roleModels/politikk/diktator.json) | Mangler profil |
| `fylkespolitiker` | [Modell fylkespolitiker](../data/Civication/roleModels/politikk/fylkespolitiker.json) | Mangler profil |
| `komiteleder` | [Modell komiteleder](../data/Civication/roleModels/politikk/komiteleder.json) | Mangler profil |
| `kommunestyrerepresentant` | [Modell kommunestyrerepresentant](../data/Civication/roleModels/politikk/kommunestyrerepresentant.json) | Mangler profil |
| `ordforer` | [Modell ordforer](../data/Civication/roleModels/politikk/ordforer.json) | Mangler profil |
| `organisasjonssekretaer` | [Modell organisasjonssekretaer](../data/Civication/roleModels/politikk/organisasjonssekretaer.json) | Mangler profil |
| `partileder` | [Modell partileder](../data/Civication/roleModels/politikk/partileder.json) | Mangler profil |
| `politikk_aktivisme_praksis` | [Rolleverden politikk_aktivisme_praksis](../data/Civication/roleWorlds/politikk/politikk_aktivisme_praksis.json) | Mangler profil |
| `politikk_demokratianalyse` | [Rolleverden politikk_demokratianalyse](../data/Civication/roleWorlds/politikk/politikk_demokratianalyse.json) | Mangler profil |
| `politikk_grasrotbygger` | [Rolleverden politikk_grasrotbygger](../data/Civication/roleWorlds/politikk/politikk_grasrotbygger.json) | Mangler profil |
| `politikk_kampanjemenneske` | [Rolleverden politikk_kampanjemenneske](../data/Civication/roleWorlds/politikk/politikk_kampanjemenneske.json) | Mangler profil |
| `politikk_kommunal_ledelse` | [Modell politikk_kommunal_ledelse](../data/Civication/roleModels/politikk/politikk_kommunal_ledelse.json) · [Rolleverden politikk_kommunal_ledelse](../data/Civication/roleWorlds/politikk/politikk_kommunal_ledelse.json) | Mangler profil |
| `politikk_motesliter` | [Rolleverden politikk_motesliter](../data/Civication/roleWorlds/politikk/politikk_motesliter.json) | Mangler profil |
| `politikk_organisasjonsarbeid` | [Modell politikk_organisasjonsarbeid](../data/Civication/roleModels/politikk/politikk_organisasjonsarbeid.json) · [Rolleverden politikk_organisasjonsarbeid](../data/Civication/roleWorlds/politikk/politikk_organisasjonsarbeid.json) | Mangler profil |
| `politikk_organisasjonsmenneske` | [Rolleverden politikk_organisasjonsmenneske](../data/Civication/roleWorlds/politikk/politikk_organisasjonsmenneske.json) | Mangler profil |
| `politikk_parlamentarisk_arbeid` | [Modell politikk_parlamentarisk_arbeid](../data/Civication/roleModels/politikk/politikk_parlamentarisk_arbeid.json) · [Rolleverden politikk_parlamentarisk_arbeid](../data/Civication/roleWorlds/politikk/politikk_parlamentarisk_arbeid.json) | Mangler profil |
| `politikk_politisk_radgivning` | [Modell politikk_politisk_radgivning](../data/Civication/roleModels/politikk/politikk_politisk_radgivning.json) · [Rolleverden politikk_politisk_radgivning](../data/Civication/roleWorlds/politikk/politikk_politisk_radgivning.json) | Mangler profil |
| `politikk_regjeringsledelse` | [Modell politikk_regjeringsledelse](../data/Civication/roleModels/politikk/politikk_regjeringsledelse.json) · [Rolleverden politikk_regjeringsledelse](../data/Civication/roleWorlds/politikk/politikk_regjeringsledelse.json) | Mangler profil |
| `politikk_samfunnsdeltakelse` | [Rolleverden politikk_samfunnsdeltakelse](../data/Civication/roleWorlds/politikk/politikk_samfunnsdeltakelse.json) | Mangler profil |
| `politikk_statsvitenskapelig_ekspertise` | [Rolleverden politikk_statsvitenskapelig_ekspertise](../data/Civication/roleWorlds/politikk/politikk_statsvitenskapelig_ekspertise.json) | Mangler profil |
| `politikk_tillitsvalgt` | [Rolleverden politikk_tillitsvalgt](../data/Civication/roleWorlds/politikk/politikk_tillitsvalgt.json) | Mangler profil |
| `politisk_radgiver` | [Modell politisk_radgiver](../data/Civication/roleModels/politikk/politisk_radgiver.json) | Mangler profil |
| `president` | [Modell president](../data/Civication/roleModels/politikk/president.json) | Mangler profil |
| `samfunnsengasjert_borger` | [Modell samfunnsengasjert_borger](../data/Civication/roleModels/politikk/samfunnsengasjert_borger.json) | Mangler profil |
| `statsminister` | [Modell statsminister](../data/Civication/roleModels/politikk/statsminister.json) | Mangler profil |
| `statsrad_minister` | [Modell statsrad_minister](../data/Civication/roleModels/politikk/statsrad_minister.json) | Mangler profil |
| `statssekretaer` | [Modell statssekretaer](../data/Civication/roleModels/politikk/statssekretaer.json) | Mangler profil |
| `stortingsrepresentant` | [Modell stortingsrepresentant](../data/Civication/roleModels/politikk/stortingsrepresentant.json) | Mangler profil |
| `tillitsvalgt` | [Modell tillitsvalgt](../data/Civication/roleModels/politikk/tillitsvalgt.json) | Mangler profil |

### psykologi

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `fagansvarlig` | [Modell fagansvarlig](../data/Civication/roleModels/psykologi/fagansvarlig.json) · [Rolleverden fagansvarlig](../data/Civication/roleWorlds/psykologi/fagansvarlig.json) · [Life Story fagansvarlig](../data/Civication/lifestory/roles/fagansvarlig/role.json) | Mangler profil |
| `forsker_psykologi` | [Modell forsker_psykologi](../data/Civication/roleModels/psykologi/forsker_psykologi.json) · [Rolleverden forsker_psykologi](../data/Civication/roleWorlds/psykologi/forsker_psykologi.json) · [Life Story forsker_psykologi](../data/Civication/lifestory/roles/forsker_psykologi/role.json) | Mangler profil |
| `klinikkleder` | [Modell klinikkleder](../data/Civication/roleModels/psykologi/klinikkleder.json) · [Rolleverden klinikkleder](../data/Civication/roleWorlds/psykologi/klinikkleder.json) · [Life Story klinikkleder](../data/Civication/lifestory/roles/klinikkleder/role.json) | Mangler profil |
| `professor_psykologi` | [Modell professor_psykologi](../data/Civication/roleModels/psykologi/professor_psykologi.json) · [Rolleverden professor_psykologi](../data/Civication/roleWorlds/psykologi/professor_psykologi.json) · [Life Story professor_psykologi](../data/Civication/lifestory/roles/professor_psykologi/role.json) | Mangler profil |
| `psykolog` | [Modell psykolog](../data/Civication/roleModels/psykologi/psykolog.json) · [Rolleverden psykolog](../data/Civication/roleWorlds/psykologi/psykolog.json) · [Life Story psykolog](../data/Civication/lifestory/roles/psykolog/role.json) | Mangler profil |
| `psykologi_arbeids_og_karriereveiledning` | [Modell radgiver](../data/Civication/roleModels/psykologi/radgiver.json) · [Modell seniorradgiver](../data/Civication/roleModels/psykologi/seniorradgiver.json) · [Modell veileder](../data/Civication/roleModels/psykologi/veileder.json) · [Rolleverden psykologi_arbeids_og_karriereveiledning](../data/Civication/roleWorlds/psykologi/psykologi_arbeids_og_karriereveiledning.json) · [Life Story psykologi_arbeids_og_karriereveiledning](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/role.json) | [Profil](civication-symposium/arbeids-og-karriereveileder.md) |
| `psykologi_miljoarbeid` | [Modell analytiker](../data/Civication/roleModels/psykologi/analytiker.json) · [Modell atferdsobservator](../data/Civication/roleModels/psykologi/atferdsobservator.json) · [Modell psykologi_miljoarbeid](../data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json) · [Modell samtalepartner](../data/Civication/roleModels/psykologi/samtalepartner.json) · [Modell titter](../data/Civication/roleModels/psykologi/titter.json) · [Rolleverden psykologi_miljoarbeid](../data/Civication/roleWorlds/psykologi/psykologi_miljoarbeid.json) · [Life Story psykologi_miljoarbeid](../data/Civication/lifestory/roles/psykologi_miljoarbeid/role.json) | [Profil](civication-symposium/miljoarbeider.md) |
| `psykologi_monsterjeger` | [Rolleverden psykologi_monsterjeger](../data/Civication/roleWorlds/psykologi/psykologi_monsterjeger.json) | Mangler profil |
| `psykologi_psykologientusiast` | [Rolleverden psykologi_psykologientusiast](../data/Civication/roleWorlds/psykologi/psykologi_psykologientusiast.json) | Mangler profil |
| `psykologi_relasjonsbygger` | [Rolleverden psykologi_relasjonsbygger](../data/Civication/roleWorlds/psykologi/psykologi_relasjonsbygger.json) | Mangler profil |
| `psykologi_selvgransker` | [Rolleverden psykologi_selvgransker](../data/Civication/roleWorlds/psykologi/psykologi_selvgransker.json) | Mangler profil |
| `psykologi_vaneeksperimentor` | [Rolleverden psykologi_vaneeksperimentor](../data/Civication/roleWorlds/psykologi/psykologi_vaneeksperimentor.json) | Mangler profil |
| `spesialistpsykolog` | [Modell spesialistpsykolog](../data/Civication/roleModels/psykologi/spesialistpsykolog.json) · [Rolleverden spesialistpsykolog](../data/Civication/roleWorlds/psykologi/spesialistpsykolog.json) · [Life Story spesialistpsykolog](../data/Civication/lifestory/roles/spesialistpsykolog/role.json) | Mangler profil |

### relasjon

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `venn_av_jonas` | [C09-synopsis](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md#c09--vennskapet-som-glir-fra) | [Profil](civication-symposium/venn-av-jonas.md) |

### religion

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `religion_besokende` | [Rolleverden religion_besokende](../data/Civication/roleWorlds/religion/religion_besokende.json) | Mangler profil |
| `religion_dialogbygger` | [Rolleverden religion_dialogbygger](../data/Civication/roleWorlds/religion/religion_dialogbygger.json) | Mangler profil |
| `religion_fagledelse` | [Modell religion_fagledelse](../data/Civication/roleModels/religion/religion_fagledelse.json) · [Rolleverden religion_fagledelse](../data/Civication/roleWorlds/religion/religion_fagledelse.json) | Mangler profil |
| `religion_feltarbeider` | [Rolleverden religion_feltarbeider](../data/Civication/roleWorlds/religion/religion_feltarbeider.json) | Mangler profil |
| `religion_formidling_og_kulturarv` | [Modell religion_formidling_og_kulturarv](../data/Civication/roleModels/religion/religion_formidling_og_kulturarv.json) · [Rolleverden religion_formidling_og_kulturarv](../data/Civication/roleWorlds/religion/religion_formidling_og_kulturarv.json) | Mangler profil |
| `religion_forskning` | [Modell religion_forskning](../data/Civication/roleModels/religion/religion_forskning.json) · [Rolleverden religion_forskning](../data/Civication/roleWorlds/religion/religion_forskning.json) | Mangler profil |
| `religion_livssynsutforsker` | [Rolleverden religion_livssynsutforsker](../data/Civication/roleWorlds/religion/religion_livssynsutforsker.json) | Mangler profil |
| `religion_nysgjerrig` | [Rolleverden religion_nysgjerrig](../data/Civication/roleWorlds/religion/religion_nysgjerrig.json) | Mangler profil |
| `religion_pilegrim` | [Rolleverden religion_pilegrim](../data/Civication/roleWorlds/religion/religion_pilegrim.json) | Mangler profil |
| `religion_ritualkjenner` | [Rolleverden religion_ritualkjenner](../data/Civication/roleWorlds/religion/religion_ritualkjenner.json) | Mangler profil |
| `religion_symboltolker` | [Rolleverden religion_symboltolker](../data/Civication/roleWorlds/religion/religion_symboltolker.json) | Mangler profil |
| `religion_tradisjonskjenner` | [Rolleverden religion_tradisjonskjenner](../data/Civication/roleWorlds/religion/religion_tradisjonskjenner.json) | Mangler profil |
| `religion_troslivskjenner` | [Rolleverden religion_troslivskjenner](../data/Civication/roleWorlds/religion/religion_troslivskjenner.json) | Mangler profil |
| `religion_trosstedsvandrer` | [Rolleverden religion_trosstedsvandrer](../data/Civication/roleWorlds/religion/religion_trosstedsvandrer.json) | Mangler profil |
| `religion_utredning_og_radgivning` | [Modell religion_utredning_og_radgivning](../data/Civication/roleModels/religion/religion_utredning_og_radgivning.json) · [Rolleverden religion_utredning_og_radgivning](../data/Civication/roleWorlds/religion/religion_utredning_og_radgivning.json) | Mangler profil |

### scenekunst

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `scenekunst_dramaturg` | [Rolleverden scenekunst_dramaturg](../data/Civication/roleWorlds/scenekunst/scenekunst_dramaturg.json) | Mangler profil |
| `scenekunst_dramaturgi_og_utvikling` | [Modell scenekunst_dramaturgi_og_utvikling](../data/Civication/roleModels/scenekunst/scenekunst_dramaturgi_og_utvikling.json) · [Rolleverden scenekunst_dramaturgi_og_utvikling](../data/Civication/roleWorlds/scenekunst/scenekunst_dramaturgi_og_utvikling.json) | Mangler profil |
| `scenekunst_improentusiast` | [Rolleverden scenekunst_improentusiast](../data/Civication/roleWorlds/scenekunst/scenekunst_improentusiast.json) | Mangler profil |
| `scenekunst_institusjonsledelse` | [Modell scenekunst_institusjonsledelse](../data/Civication/roleModels/scenekunst/scenekunst_institusjonsledelse.json) · [Rolleverden scenekunst_institusjonsledelse](../data/Civication/roleWorlds/scenekunst/scenekunst_institusjonsledelse.json) | Mangler profil |
| `scenekunst_koreograf` | [Rolleverden scenekunst_koreograf](../data/Civication/roleWorlds/scenekunst/scenekunst_koreograf.json) | Mangler profil |
| `scenekunst_premieregjenger` | [Rolleverden scenekunst_premieregjenger](../data/Civication/roleWorlds/scenekunst/scenekunst_premieregjenger.json) | Mangler profil |
| `scenekunst_program_og_kuratering` | [Modell scenekunst_program_og_kuratering](../data/Civication/roleModels/scenekunst/scenekunst_program_og_kuratering.json) · [Rolleverden scenekunst_program_og_kuratering](../data/Civication/roleWorlds/scenekunst/scenekunst_program_og_kuratering.json) | Mangler profil |
| `scenekunst_publikum` | [Rolleverden scenekunst_publikum](../data/Civication/roleWorlds/scenekunst/scenekunst_publikum.json) | Mangler profil |
| `scenekunst_regi_og_koreografi` | [Modell scenekunst_regi_og_koreografi](../data/Civication/roleModels/scenekunst/scenekunst_regi_og_koreografi.json) · [Rolleverden scenekunst_regi_og_koreografi](../data/Civication/roleWorlds/scenekunst/scenekunst_regi_og_koreografi.json) | Mangler profil |
| `scenekunst_regissor` | [Rolleverden scenekunst_regissor](../data/Civication/roleWorlds/scenekunst/scenekunst_regissor.json) | Mangler profil |
| `scenekunst_scene_og_produksjon` | [Modell scenekunst_scene_og_produksjon](../data/Civication/roleModels/scenekunst/scenekunst_scene_og_produksjon.json) · [Rolleverden scenekunst_scene_og_produksjon](../data/Civication/roleWorlds/scenekunst/scenekunst_scene_og_produksjon.json) | Mangler profil |
| `scenekunst_scenehenger` | [Rolleverden scenekunst_scenehenger](../data/Civication/roleWorlds/scenekunst/scenekunst_scenehenger.json) | Mangler profil |
| `scenekunst_scenekunstkurator` | [Rolleverden scenekunst_scenekunstkurator](../data/Civication/roleWorlds/scenekunst/scenekunst_scenekunstkurator.json) | Mangler profil |
| `scenekunst_skuespiller_danser` | [Rolleverden scenekunst_skuespiller_danser](../data/Civication/roleWorlds/scenekunst/scenekunst_skuespiller_danser.json) | Mangler profil |
| `scenekunst_teatergjenganger` | [Rolleverden scenekunst_teatergjenganger](../data/Civication/roleWorlds/scenekunst/scenekunst_teatergjenganger.json) | Mangler profil |
| `scenekunst_utover` | [Rolleverden scenekunst_utover](../data/Civication/roleWorlds/scenekunst/scenekunst_utover.json) | Mangler profil |
| `scenekunst_utoving_og_ensemble` | [Modell scenekunst_utoving_og_ensemble](../data/Civication/roleModels/scenekunst/scenekunst_utoving_og_ensemble.json) · [Rolleverden scenekunst_utoving_og_ensemble](../data/Civication/roleWorlds/scenekunst/scenekunst_utoving_og_ensemble.json) | Mangler profil |

### sosial_laering

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `barnehageassistent` | [Modell barnehageassistent](../data/Civication/roleModels/sosial_laering/barnehageassistent.json) · [Life Story barnehageassistent](../data/Civication/lifestory/roles/barnehageassistent/role.json) | [Profil](civication-symposium/barnehageassistent.md) |

### sport

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `sport_legende` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `partial_pack` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `sport_kaptein` | [Rollepakkeregister](../data/Civication/rolePackIndex.json) · `partial_pack` | Mangler profil (rollepakkeoppføring, ikke automatisk spillbar jobb) |
| `aktiv_utover` | [Modell aktiv_utover](../data/Civication/roleModels/sport/aktiv_utover.json) | Mangler profil |
| `eliteseriespiller` | [Modell eliteseriespiller](../data/Civication/roleModels/sport/eliteseriespiller.json) | Mangler profil |
| `idrettslegende` | [Modell idrettslegende](../data/Civication/roleModels/sport/idrettslegende.json) | Mangler profil |
| `idrettsstjerne` | [Modell idrettsstjerne](../data/Civication/roleModels/sport/idrettsstjerne.json) | Mangler profil |
| `kaptein` | [Modell kaptein](../data/Civication/roleModels/sport/kaptein.json) | Mangler profil |
| `klubbspiller` | [Modell klubbspiller](../data/Civication/roleModels/sport/klubbspiller.json) | Mangler profil |
| `konkurranseutover` | [Modell konkurranseutover](../data/Civication/roleModels/sport/konkurranseutover.json) | Mangler profil |
| `landslagsutover` | [Modell landslagsutover](../data/Civication/roleModels/sport/landslagsutover.json) | Mangler profil |
| `mosjonist` | [Modell mosjonist](../data/Civication/roleModels/sport/mosjonist.json) | Mangler profil |
| `olympisk_mester` | [Modell olympisk_mester](../data/Civication/roleModels/sport/olympisk_mester.json) | Mangler profil |
| `sport_aktiv_utover` | [Rolleverden sport_aktiv_utover](../data/Civication/roleWorlds/sport/sport_aktiv_utover.json) | Mangler profil |
| `sport_klubbmenneske` | [Rolleverden sport_klubbmenneske](../data/Civication/roleWorlds/sport/sport_klubbmenneske.json) | Mangler profil |
| `sport_klubbspiller` | [Rolleverden sport_klubbspiller](../data/Civication/roleWorlds/sport/sport_klubbspiller.json) | Mangler profil |
| `sport_konkurranseutover` | [Rolleverden sport_konkurranseutover](../data/Civication/roleWorlds/sport/sport_konkurranseutover.json) | Mangler profil |
| `sport_mosjonist` | [Rolleverden sport_mosjonist](../data/Civication/roleWorlds/sport/sport_mosjonist.json) | Mangler profil |
| `sport_profesjonell_utover` | [Rolleverden sport_profesjonell_utover](../data/Civication/roleWorlds/sport/sport_profesjonell_utover.json) | Mangler profil |
| `sport_sondagsutover` | [Rolleverden sport_sondagsutover](../data/Civication/roleWorlds/sport/sport_sondagsutover.json) | Mangler profil |
| `sport_sportsledelse` | [Modell sportssjef](../data/Civication/roleModels/sport/sportssjef.json) · [Rolleverden sport_sportsledelse](../data/Civication/roleWorlds/sport/sport_sportsledelse.json) | Mangler profil |
| `sport_supporter` | [Rolleverden sport_supporter](../data/Civication/roleWorlds/sport/sport_supporter.json) | Mangler profil |
| `sport_trener` | [Modell hovedtrener](../data/Civication/roleModels/sport/hovedtrener.json) · [Modell trener](../data/Civication/roleModels/sport/trener.json) · [Rolleverden sport_trener](../data/Civication/roleWorlds/sport/sport_trener.json) | Mangler profil |
| `sport_tribunesliter` | [Rolleverden sport_tribunesliter](../data/Civication/roleWorlds/sport/sport_tribunesliter.json) | Mangler profil |
| `sport_utover` | [Modell profesjonell_utover](../data/Civication/roleModels/sport/profesjonell_utover.json) · [Rolleverden sport_utover](../data/Civication/roleWorlds/sport/sport_utover.json) · [Life Story sport_utover](../data/Civication/lifestory/roles/sport_utover/role.json) | [Profil](civication-symposium/idrettsutover.md) |

### subkultur

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `subkultur_arrangementsdrift` | [Modell deltaker](../data/Civication/roleModels/subkultur/deltaker.json) · [Modell gatesmart](../data/Civication/roleModels/subkultur/gatesmart.json) · [Modell hakkekylling](../data/Civication/roleModels/subkultur/hakkekylling.json) · [Modell observor](../data/Civication/roleModels/subkultur/observor.json) · [Modell subkultur_arrangementsdrift](../data/Civication/roleModels/subkultur/subkultur_arrangementsdrift.json) · [Rolleverden subkultur_arrangementsdrift](../data/Civication/roleWorlds/subkultur/subkultur_arrangementsdrift.json) | Mangler profil |
| `subkultur_crew` | [Rolleverden subkultur_crew](../data/Civication/roleWorlds/subkultur/subkultur_crew.json) | Mangler profil |
| `subkultur_dandy` | [Rolleverden subkultur_dandy](../data/Civication/roleWorlds/subkultur/subkultur_dandy.json) | Mangler profil |
| `subkultur_deltaker` | [Rolleverden subkultur_deltaker](../data/Civication/roleWorlds/subkultur/subkultur_deltaker.json) | Mangler profil |
| `subkultur_gangster` | [Rolleverden subkultur_gangster](../data/Civication/roleWorlds/subkultur/subkultur_gangster.json) | Mangler profil |
| `subkultur_gatesmart` | [Rolleverden subkultur_gatesmart](../data/Civication/roleWorlds/subkultur/subkultur_gatesmart.json) | Mangler profil |
| `subkultur_hakkekylling` | [Rolleverden subkultur_hakkekylling](../data/Civication/roleWorlds/subkultur/subkultur_hakkekylling.json) | Mangler profil |
| `subkultur_kulturarena_ledelse` | [Modell legend](../data/Civication/roleModels/subkultur/legend.json) · [Modell subkultur_kulturarena_ledelse](../data/Civication/roleModels/subkultur/subkultur_kulturarena_ledelse.json) · [Rolleverden subkultur_kulturarena_ledelse](../data/Civication/roleWorlds/subkultur/subkultur_kulturarena_ledelse.json) | Mangler profil |
| `subkultur_observor` | [Rolleverden subkultur_observor](../data/Civication/roleWorlds/subkultur/subkultur_observor.json) | Mangler profil |
| `subkultur_produksjon_og_prosjekt` | [Modell kultfigur](../data/Civication/roleModels/subkultur/kultfigur.json) · [Modell subkultur_produksjon_og_prosjekt](../data/Civication/roleModels/subkultur/subkultur_produksjon_og_prosjekt.json) · [Modell trendsetter](../data/Civication/roleModels/subkultur/trendsetter.json) · [Rolleverden subkultur_produksjon_og_prosjekt](../data/Civication/roleWorlds/subkultur/subkultur_produksjon_og_prosjekt.json) | Mangler profil |
| `subkultur_produksjonsledelse` | [Modell subkultur_produksjonsledelse](../data/Civication/roleModels/subkultur/subkultur_produksjonsledelse.json) · [Modell undergrunnsikon](../data/Civication/roleModels/subkultur/undergrunnsikon.json) · [Rolleverden subkultur_produksjonsledelse](../data/Civication/roleWorlds/subkultur/subkultur_produksjonsledelse.json) | Mangler profil |
| `subkultur_program_og_koordinering` | [Modell crew](../data/Civication/roleModels/subkultur/crew.json) · [Modell dandy](../data/Civication/roleModels/subkultur/dandy.json) · [Modell gangster](../data/Civication/roleModels/subkultur/gangster.json) · [Modell subkultur_program_og_koordinering](../data/Civication/roleModels/subkultur/subkultur_program_og_koordinering.json) · [Rolleverden subkultur_program_og_koordinering](../data/Civication/roleWorlds/subkultur/subkultur_program_og_koordinering.json) | Mangler profil |

### system

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `arbeidsledig` | [Life Story arbeidsledig](../data/Civication/lifestory/roles/arbeidsledig/role.json) | [Profil](civication-symposium/arbeidsledig.md) |

### teater

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `ensemblemedlem` | [Modell ensemblemedlem](../data/Civication/roleModels/teater/ensemblemedlem.json) | Mangler profil |
| `fast_publikummer` | [Modell fast_publikummer](../data/Civication/roleModels/teater/fast_publikummer.json) | Mangler profil |
| `hovedrolleinnehaver` | [Modell hovedrolleinnehaver](../data/Civication/roleModels/teater/hovedrolleinnehaver.json) | Mangler profil |
| `kjent_scenenavn` | [Modell kjent_scenenavn](../data/Civication/roleModels/teater/kjent_scenenavn.json) | Mangler profil |
| `prisvinnende_scenekunstner` | [Modell prisvinnende_scenekunstner](../data/Civication/roleModels/teater/prisvinnende_scenekunstner.json) | Mangler profil |
| `produksjonsmedarbeider` | [Modell produksjonsmedarbeider](../data/Civication/roleModels/teater/produksjonsmedarbeider.json) | Mangler profil |
| `publikum` | [Modell publikum](../data/Civication/roleModels/teater/publikum.json) | Mangler profil |
| `regissor_teater` | [Modell regissor_teater](../data/Civication/roleModels/teater/regissor_teater.json) | Mangler profil |
| `sceneassistent` | [Modell sceneassistent](../data/Civication/roleModels/teater/sceneassistent.json) | Mangler profil |
| `scenestjerne` | [Modell scenestjerne](../data/Civication/roleModels/teater/scenestjerne.json) | Mangler profil |
| `scenisk_ikon` | [Modell scenisk_ikon](../data/Civication/roleModels/teater/scenisk_ikon.json) | Mangler profil |
| `skuespiller` | [Modell skuespiller](../data/Civication/roleModels/teater/skuespiller.json) | Mangler profil |
| `teatergjenger` | [Modell teatergjenger](../data/Civication/roleModels/teater/teatergjenger.json) | Mangler profil |

### utdanning

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `utdanning_didaktisk_tenker` | [Rolleverden utdanning_didaktisk_tenker](../data/Civication/roleWorlds/utdanning/utdanning_didaktisk_tenker.json) | Mangler profil |
| `utdanning_klasseromsobservator` | [Rolleverden utdanning_klasseromsobservator](../data/Civication/roleWorlds/utdanning/utdanning_klasseromsobservator.json) | Mangler profil |
| `utdanning_laeringsutforsker` | [Rolleverden utdanning_laeringsutforsker](../data/Civication/roleWorlds/utdanning/utdanning_laeringsutforsker.json) | Mangler profil |
| `utdanning_utdanningskritiker` | [Rolleverden utdanning_utdanningskritiker](../data/Civication/roleWorlds/utdanning/utdanning_utdanningskritiker.json) | Mangler profil |

### vitenskap

| Rolleomfang | Eksisterende materiale | Kildeprofil |
| --- | --- | --- |
| `dekan` | [Modell dekan](../data/Civication/roleModels/vitenskap/dekan.json) | Mangler profil |
| `forsker` | [Modell forsker](../data/Civication/roleModels/vitenskap/forsker.json) | Mangler profil |
| `forskningsassistent` | [Modell forskningsassistent](../data/Civication/roleModels/vitenskap/forskningsassistent.json) | Mangler profil |
| `forskningsleder` | [Modell forskningsleder](../data/Civication/roleModels/vitenskap/forskningsleder.json) | Mangler profil |
| `forsteamanuensis` | [Modell forsteamanuensis](../data/Civication/roleModels/vitenskap/forsteamanuensis.json) | Mangler profil |
| `instituttleder` | [Modell instituttleder](../data/Civication/roleModels/vitenskap/instituttleder.json) | Mangler profil |
| `laboratorieassistent` | [Modell laboratorieassistent](../data/Civication/roleModels/vitenskap/laboratorieassistent.json) | Mangler profil |
| `postdoktor` | [Modell postdoktor](../data/Civication/roleModels/vitenskap/postdoktor.json) | Mangler profil |
| `professor` | [Modell professor](../data/Civication/roleModels/vitenskap/professor.json) | Mangler profil |
| `seniorforsker` | [Modell seniorforsker](../data/Civication/roleModels/vitenskap/seniorforsker.json) | Mangler profil |
| `stipendiat_phd` | [Modell stipendiat_phd](../data/Civication/roleModels/vitenskap/stipendiat_phd.json) | Mangler profil |
| `studentassistent` | [Modell studentassistent](../data/Civication/roleModels/vitenskap/studentassistent.json) | Mangler profil |
| `vitenskap_assistent_og_laboratorium` | [Modell vitenskap_assistent_og_laboratorium](../data/Civication/roleModels/vitenskap/vitenskap_assistent_og_laboratorium.json) · [Rolleverden vitenskap_assistent_og_laboratorium](../data/Civication/roleWorlds/vitenskap/vitenskap_assistent_og_laboratorium.json) | Mangler profil |
| `vitenskap_doktorlop_og_postdoktor` | [Modell vitenskap_doktorlop_og_postdoktor](../data/Civication/roleModels/vitenskap/vitenskap_doktorlop_og_postdoktor.json) · [Rolleverden vitenskap_doktorlop_og_postdoktor](../data/Civication/roleWorlds/vitenskap/vitenskap_doktorlop_og_postdoktor.json) | Mangler profil |
| `vitenskap_folkeforsker` | [Rolleverden vitenskap_folkeforsker](../data/Civication/roleWorlds/vitenskap/vitenskap_folkeforsker.json) | Mangler profil |
| `vitenskap_forskning` | [Modell vitenskap_forskning](../data/Civication/roleModels/vitenskap/vitenskap_forskning.json) · [Rolleverden vitenskap_forskning](../data/Civication/roleWorlds/vitenskap/vitenskap_forskning.json) | Mangler profil |
| `vitenskap_forskningsledelse` | [Modell vitenskap_forskningsledelse](../data/Civication/roleModels/vitenskap/vitenskap_forskningsledelse.json) · [Rolleverden vitenskap_forskningsledelse](../data/Civication/roleWorlds/vitenskap/vitenskap_forskningsledelse.json) | Mangler profil |
| `vitenskap_institusjonsledelse` | [Modell vitenskap_institusjonsledelse](../data/Civication/roleModels/vitenskap/vitenskap_institusjonsledelse.json) · [Rolleverden vitenskap_institusjonsledelse](../data/Civication/roleWorlds/vitenskap/vitenskap_institusjonsledelse.json) | Mangler profil |
| `vitenskap_labnerd` | [Rolleverden vitenskap_labnerd](../data/Civication/roleWorlds/vitenskap/vitenskap_labnerd.json) | Mangler profil |
| `vitenskap_maker` | [Rolleverden vitenskap_maker](../data/Civication/roleWorlds/vitenskap/vitenskap_maker.json) | Mangler profil |
| `vitenskap_stjernekikker` | [Rolleverden vitenskap_stjernekikker](../data/Civication/roleWorlds/vitenskap/vitenskap_stjernekikker.json) | Mangler profil |
| `vitenskap_teknologibygger` | [Rolleverden vitenskap_teknologibygger](../data/Civication/roleWorlds/vitenskap/vitenskap_teknologibygger.json) | Mangler profil |
| `vitenskap_undervisning_og_forskning` | [Modell vitenskap_undervisning_og_forskning](../data/Civication/roleModels/vitenskap/vitenskap_undervisning_og_forskning.json) · [Rolleverden vitenskap_undervisning_og_forskning](../data/Civication/roleWorlds/vitenskap/vitenskap_undervisning_og_forskning.json) | Mangler profil |
| `vitenskapelig_assistent` | [Modell vitenskapelig_assistent](../data/Civication/roleModels/vitenskap/vitenskapelig_assistent.json) | Mangler profil |
