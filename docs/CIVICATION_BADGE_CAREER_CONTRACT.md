# Civication Badge Career Contract

## Canonical sannhet

`data/badges/*.json` er canonical kilde for spillerens Badge-progresjon og for de stillingstitlene Civication kan tilby fra denne progresjonen.

`tier.threshold` er poenggrensen for Badge-milepælen. `tier.label` er den synlige tier-tittelen. For en ferdig ryddet karrierestige skal tittelen være en faktisk Civication-stilling, men eldre stiger kan midlertidig inneholde spillrang/status. Slik gjeld skal være eksplisitt klassifisert og blokkert fra jobbtilbud; den skal aldri skjules bak et `role_scope`.

Badges er derfor ikke en statisk historisk liste. Stigene skal videreutvikles når Civication får bedre, mer realistiske eller tydeligere karriereløp.

## Badge-milepæl og jobbtilbud er forskjellige ting

Spilleren kan oppnå en **Badge-milepæl** uten dermed å være kvalifisert for en **Civication-stilling**.

Dette skillet er nødvendig for tre hovedgrupper:

- gamle spill-/interessetiers som ikke er jobber
- reelle jobber som krever utdanning, autorisasjon eller annen kvalifikasjon
- verv/lederroller som krever valg, uttak, ansettelse eller utnevnelse

Quiz- og meritpoeng skal derfor aldri alene gjøre spilleren til for eksempel psykolog, professor, statsråd eller landslagsutøver.

## `career_offer` på canonical Badge-tier

Når en tier trenger en aktiv runtime-port, ligger den på den canonical tier-en som `career_offer`.

Tillatte policyer i dagens kontrakt er:

- `direct` — Badge-progresjon kan opprette jobbtilbud direkte
- `not_job` — tier-en er eksplisitt ikke en jobb og kan ikke opprette jobbtilbud
- `review_required` — tittelen er ikke avklart godt nok og er blokkert inntil redaksjonell/faglig avklaring
- `qualification_required` — krever eksplisitt dokumentert kvalifikasjon
- `authorization_required` — krever eksplisitt autorisasjon/godkjenning
- `appointment_required` — krever eksplisitt ansettelse, valg, uttak eller utnevnelse

Gated policyer kan ha `qualification_ids`. Hvis kvalifikasjonssystemet ikke kan dokumentere disse kravene, skal porten være **fail closed**. Manglende kvalifikasjonsdata er aldri grunn til å slippe gjennom en regulert eller utnevnelseskrevende rolle.

Badge-feiringen skal fortsatt kunne skje når terskelen nås. Det som blokkeres er jobbtilbudet, ikke den oppnådde kunnskapsmilepælen.

## Badge-tier og role_scope er forskjellige ting

En **Badge-tier** er spillerens synlige progresjonsnivå og, når den er jobbgyldig, stillingstittelen som kan tilbys.

Et **`role_scope`** er en intern Civication-kontrakt for hvilken jobb-/Life Story-pakke som kan spille stillingen. `role_scope` skal aldri fungere som en skjult alternativ stillingsstige eller som bevis på at en gammel tier er en virkelig jobb.

Flere Badge-titler kan dele samme `role_scope` når arbeidsformen, valgene, læringen og fortellingsmekanikken faktisk er den samme. En høyere stilling skal derimot ikke tvinges inn i en lavere rollepakke bare for å oppnå teknisk dekning.

Et eksisterende roleModel er bare innholdsstatus. Det validerer ikke stillingens realisme, kvalifikasjonskrav eller rett til direkte unlock.

## Badge Career Audit Matrix

`data/Civication/badgeCareerAuditPolicy.json` klassifiserer **hver canonical tier** med:

- faktisk jobb/profesjon, status/spillrang, verv eller annen rolleklasse
- `offer_policy`
- tiltak: `keep`, `keep_with_gate`, `replace` eller `review`
- eventuelle `qualification_ids`

`scripts/civication-badge-career-matrix.mjs` materialiserer denne klassifiseringen sammen med levende repo-data for:

- poenggrense
- `role_scope`
- roleModel
- FWG/workGrammar
- role-pack-status
- Life Story-binding
- eksakt lønnsregel for tier-en
- om nødvendig runtime-port faktisk er aktivert

Matrisen er auditfasit; den skal ikke kopiere eller erstatte canonical Badge-, roleModel-, Life Story- eller økonomidata.

## Life Story-binding

Alle aktive opptjente jobbroller i `data/Civication/lifestory/manifest.json` skal ha:

- `badge_id`
- minst én eksakt `badge_titles`-verdi som finnes i den canonical Badge-filen
- `role_scope`

Systemroller som ikke opptjenes gjennom Badges, for eksempel `arbeidsledig`, skal merkes eksplisitt med `system_role: true`.

Når en ny Life Story-jobb utvikles, skal den tilhørende Badge-stillingen finnes fra før eller legges til i samme endring. Innholdspakken skal ikke introdusere en spillerstilling i skjul.

## Videreutvikling av stillingsstiger

Når en eksisterende Badge-stige er gammel eller for grov, skal den forbedres på Badge-nivå. En god endring kan:

- erstatte spillrang, interesse- og berømmelsesnivåer med faktiske stillinger
- legge til manglende inngangsstillinger
- skille fagarbeid, førstelinje, rådgivning og ledelse tydeligere
- utvide en kort stige til et reelt karriereløp
- justere progresjonen slik at ansvar og kompleksitet øker forståelig
- legge inn kvalifikasjons-/utnevnelsesporter der poeng alene ikke er nok
- introdusere nye `role_scope` når høyere eller annerledes arbeid faktisk krever en annen simulering

Det er bedre å utvikle Badge-stigen enn å opprette roller som bare finnes i Civication-data. Erstatningstitler skal ikke improviseres bare for å gjøre en audit grønn.

## Runtime-kontrakt

`js/Civication/merits-and-jobs.js` leser `data/badges/index.json` og de canonical Badge-filene for jobbtilbud og installerer den sentrale `career_offer`-porten rundt `CivicationJobs.pushOffer`. Dermed omfattes både den ordinære merit-flyten og andre eksisterende kodeveier som bruker samme jobb-API.

`data/Civication/hg_careers.json` eier supplerende karriereregler som økonomi, vedlikehold og krysskrav. Den eier ikke stillingsnavnene eller profesjonsautorisasjonen.

`data/Civication/hg_careers2.json` er legacy/avledet materiale og skal ikke behandles som canonical stillingsstige.

Lønn skal auditeres mot samme eksakte tierindeks som runtime bruker. Manglende lønn for en tier skal rapporteres som et hull, ikke skjules med en ubegrunnet fallback.

## Permanent gate

`tests/civication-badge-career-contract.test.js` håndhever eksisterende Badge/Life Story-kontrakter.

`tests/civication-badge-career-matrix.test.js` håndhever i tillegg at:

- alle canonical badges og tiers finnes nøyaktig én gang i auditpolicyen
- dagens komplette audit er låst til 17 badges / 266 tiers
- Psykologi-runtimepolicyen samsvarer med auditklassifiseringen
- ikke-jobber og review-tiers stoppes før `pushOffer`
- Psykolog ikke kan tilbys uten eksplisitt autorisasjonsbevis
- Spesialistpsykolog krever både psykologautorisasjon/lisens og spesialistgodkjenning
- direkte jobbtiers fortsatt kan tilbys

Når Badge-stigene videreutvikles, skal policy, generator og tester oppdateres i samme endring slik at Civication og Badges ikke glir fra hverandre igjen.
