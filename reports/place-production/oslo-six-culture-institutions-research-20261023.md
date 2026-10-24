# Neste Oslo-bolk: kultur, byrom og institusjoner

Status: **Research startet. 0/6 v1-godkjent.**

Arbeidsgren: `research/oslo-six-culture-institutions-v1-20261023`.
Basert på main `dcabd0df6df3cc129291fcd00d9bc957c2769618`.
PR #6579 er et separat arbeidsspor. Denne bolken omfatter bare de seks ID-ene nedenfor.

## Kontrollert utgangspunkt

Maskinell inventering og kildefilhash finnes i `oslo-six-culture-institutions-intake-20261023.json`. Alle seks canonicale Place-filer og runtime-payloads finnes. Ingen av de seks har egen `fagverk`-blokk. Manifestkontrollen fant fullquiz og ett registrert QuizCard for Eldorado; de øvrige fem har ingen målregistrerte fullquizsett eller QuizCards. Eldorados 30 spørsmål fordeler seg på fem sett à seks og må gjennomgås mot gjeldende profilkontrakt, uten å slette godt innhold for å treffe et bestemt antall.

| Sted | ID | Kategori | Gjenbruk og hovedarbeid |
|---|---|---|---|
| Arbeidersamfunnets plass | `arbeidersamfunnets_plass` | politikk | Byrommets identitet; navnehistorie; avgrensning mot Samfunnshuset/Sentrum Scene |
| Eldorado Bokhandel | `eldorado_bokhandel` | litteratur | Gjenbruk eksisterende fullquiz og QuizCard etter audit; korriger dokumentert tekstfeil |
| Nobels Fredssenter | `nobels_fredssenter` | historie | Vestbanens ombruk og fredssenterets historie; skill museum fra Nobelkomiteen og Nobelinstituttet |
| Vikaterrassen | `vikaterrassen` | by | Basarene, tre byggetrinn og gågaten; skill fra Victoria terrasse |
| Statsministerboligen | `statsministerboligen` | politikk | Embetsbolig og representasjonsanlegg; skill 2008-bruk fra eldre bygningshistorie |
| Politihuset på Grønland | `politihuset_gronland` | politikk | Hovedanlegget fra 1978 og institusjonshistorie; skill fra den eldre politistasjonen/museet |

## Konkrete redaksjonelle funn

Alle seks `desc`/`popupDesc` er lest. Flere av artiklene inneholder interne produktinstrukser, observasjonsoppgaver eller generelle pedagogiske resonnementer. Disse er ikke ferdige historiske stedartikler etter gjeldende tekstkontrakt. Omskriving må gå gjennom canonical source–claim–setningsparitet og separat fakta-/språkreview, ikke gjøres som en løs JSON-rettelse.

**Eldorado:** Ingress og artikkel oppgir kinoåpning i 1924. Oslo byleksikon dokumenterer varieté i 1891, Fahlstrøms Theater 1903–1911, overgang til kino i 1911, lydfilm og navnet Eldorado kino i 1929, og bokhandel fra 2013. Den eksisterende quizen bruker allerede 1911. Dette er en påvist tekst–quiz-konflikt. Bokhandelen ble overtatt av Norli i 2018; senere bruk må dateres og kontrolleres særskilt. Ikke presenter hele bygningen som uendret bokhandel siden 2013.

**Arbeidersamfunnets plass:** Oslo byleksikon dokumenterer navngivningen i 1962 og tidligere tukthustomt. Det tidligere navnet er ulikt skrevet i byleksikonet og Lokalhistoriewiki (Olaf/Ole Bull); dette skal ikke bli quizfasit før navnevedtak eller annen tilstrekkelig kilde er kontrollert.

**Vikaterrassen:** Kilden skiller arkitektkonkurransen i 1960 fra byggetrinnene 1964, 1968 og 1972, og rehabilitering/gågate i 2016. Behold skillet mellom plan, åpning og senere endring.

**Nobels Fredssenter:** Senterets egen historie skiller planlagt 7. juni fra faktisk åpning 11. juni 2005. Geir Lundestads initiativ og Stortingets vedtak gir et dokumenterbart institusjonelt spor.

**Statsministerboligen:** Statsministerens kontors historikk og budsjettets 2008-rapport dokumenterer bruk høsten 2008. Dette må skilles fra planen i 2007 og ferdigstillelsen av øvrige deler av representasjonsanlegget i 2009.

**Politihuset:** Statsbyggs indekserte prosjekt-/nyhetstekst støtter 1978 og Telje-Torp-Aasen, men direkte sideåpning ga tom tekst. Den offentlige verneplanen er funnet som mer inspiserbar kilde til byggeperioder og utvidelse; hele dokumentet må leses før claim-godkjenning.

## Første kildepakke

Lest direkte:

- https://oslobyleksikon.no/side/Eldorado
- https://oslobyleksikon.no/side/Arbeidersamfunnets_plass
- https://oslobyleksikon.no/side/Vikaterrassen
- https://www.nobelpeacecenter.org/en/news/from-idea-to-reality

Relevante kildepassasjer hentet i søkeindeks, krever videre direkte kontroll der tilgjengelig:

- https://www.regjeringen.no/no/dep/smk/ansvarsomrader/forloperne/1905-1945/1908-Statsministerboliger/id759072/
- https://www.regjeringen.no/no/dokumenter/prop-1-s-20092010/id579483/?ch=2
- https://www.statsbygg.no/byggeprosjekter/oslo-politihus/
- https://www.statsbygg.no/nyheter/hvordan-skal-landets-storste-politihus-rehabiliteres/
- https://kudos.dfo.no/documents/15373/files/15521.pdf

Disse er forskningsinnganger, ikke en godkjent claim-bank eller en ferdig quizkildeliste.

## Gjenværende produksjon

Gjeldende READ-FIRST må leses ferdig og preflight registreres før endelig profil og samlingsplan låses. Deretter: stedsspesifikk kildebank, tekstreview, bildeidentitet/rettigheter, egen Fagverk-side, fullquiz-QA/ny fullquiz, gjenbruk eller produksjon av QuizCard, Knowledge/manifest/runtime, mobil/desktop-visning og seksdelt kvalitetsport. Ingen publisert status settes av denne inventeringen.

Bilderegler har en avvikende eldre treflatebeskrivelse i v1-minimumsdokumentet. Den aktive checklisten sier eksplisitt at `cardImage` er utgått og ikke skal videreføres ved ny/revidert produksjon. Dette må følges i bilde- og runtimearbeidet.

## Foreløpig kvalitetsvurdering av leveransen

| Dimensjon | Score | Evidens / restpunkt |
|---|---:|---|
| Korrekthet og evidens | 3/5 | Inventert canonical data og konkrete kilder; full claim-bank mangler |
| Dekning og ferdigstillelse | 1/5 | Forarbeid; selve seksstedspakken er ikke produsert |
| Redaksjonell kvalitet | 2/5 | Tekstproblemer og én konkret faktafeil identifisert, ikke canonicalt rettet ennå |
| Teknisk integritet | 3/5 | Lesbar maskinell inventering; ingen runtimeendring eller faktisk UI-QA |
| Ansvarlighet | 4/5 | Uenighet og kildebegrensninger markert; ingen oppdiktet ferdigstatus |
| Vedlikeholdbarhet | 4/5 | Eksakte ID-er, filer, base-SHA og kildefilhash |

**17/30: produksjon pågår, ingen v1- eller mergegodkjenning.**
