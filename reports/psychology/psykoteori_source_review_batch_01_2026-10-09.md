# Psykoteori — kildegjennomgang, batch 01

**Dato:** 2026-10-09  
**PR:** #6173, videreføring av Psykoteori-grunnlaget i #6168  
**Omfang:** psykoanalyse, behaviorisme og kognitiv psykologi  
**Status:** **Delvis etterprøvd. Ingen av de tre kortene er komplett kildegodkjent.**

Dette er en review av faktiske kildeutsagn, ikke en automatisk «godkjennelse» fordi en kilde-URL finnes. De eksisterende fagverkclaimene er gjenbrukt kun der påstanden har reell dekning. Kortene har fra før tydelig merkede hypotetiske undervisningsscenarier.

## 1. Psykoanalyse (`em_psy_psykoanalyse`)

**Etterprøvd:**
- Freud Museum bekrefter at Freud grunnla psykoanalysen og at museet bevarer arkiv, studierom og historiske samlinger: `fti-08` / `src-freud-museum-about`. Kilde: https://www.freud.org.uk/about-us/
- Library of Congress viser `Die Traumdeutung`, utgitt som 1900-utgave, faktisk utgitt i 1899. Dette er originalverkets **bibliografi**, ikke evidens for alle psykodymaniske forklaringer: https://www.loc.gov/item/77450592/
- Freud Museum beskriver eksplisitt faglig diskusjon om styrker, begrensninger og vitenskapelig status: `fti-09` / `src-freud-legacy`. Kilde: https://www.freud.org.uk/education/higher-education/freud-and-his-legacy-therapy-psychology-neuroscience/

**Grense:** Museets undervisningsbeskrivelse er ikke en meta-analyse av psykodynamisk behandling. Kortets mekanismer, generaliseringer og scenario krever ytterligere faglig evaluering; `source_review_status` forblir `not_reviewed` i 58-registeret.

## 2. Behaviorisme og operant læring (`em_psy_betinging_vaner`)

**Etterprøvd:**
- Watsons originalartikkel `Psychology as the Behaviorist Views It`, `Psychological Review` 20 (1913), 158–177, DOI 10.1037/h0074428, presenterer et objektivt/eksperimentelt behavioristisk forskningsprogram. Dette gir **primærbelegg** for 1913 og Watsons program. `fti-10` finnes i fagverkregisteret, men oppgir en annen sekundærkilde: https://doi.org/10.1037/h0074428
- Harvards Skinnerside beskriver operant betinging, forsterkning, måling av atferd og forsterkningsplaner: `fti-11` / `src-harvard-skinner`: https://psychology.fas.harvard.edu/people/b-f-skinner
- B. F. Skinner Foundation lister `Science and Human Behavior` (Macmillan, 1953): https://www.bfskinner.org/publications/books/

**Grense:** Disse kildene dokumenterer sentrale mekanismer og verk, men utgjør ikke en full replikasjons- eller effektgjennomgang for operant betinging i alle hverdagskontekster. Kortets telefon-eksempel er eksplisitt hypotetisk. `source_review_status` forblir `not_reviewed`.

## 3. Kognitiv psykologi (`em_psy_hjerne_kognisjon`)

**Etterprøvd:**
- Stanford Encyclopedia of Philosophy dokumenterer den kognitive vendingen fra 1950-årene og beskriver mentale representasjoner, informasjonsprosessering, eksperimentelle metoder og modelltesting: https://plato.stanford.edu/archives/spr2026/entries/cognitive-science/
- Salk Institute Librarys katalog dokumenterer Ulric Neissers `Cognitive Psychology` (1967): https://jonas.salk.edu/cgi-bin/koha/opac-detail.pl?biblionumber=4239

**Grense:** Det eksisterende fagverksemnet `em_psy_hjerne_kognisjon` har claimregistrering om nevropsykologi, men dette er **ikke** det samme som en full kildebinding til kortets historie om kognitiv psykologi. Derfor settes ingen av fagverkclaimene automatisk som «verifisert» for kortet. Bruk av eksperimenter og mentale modeller har kildestøtte i Stanford-teksten; kortets hele formulering og metodiske begrensninger trenger redaksjonell helhetskontroll.

## Tekniske endringer

- `data/psychology/psychology_theories.json`: tre kort har `source_review_state=partial_historical_method_review` og åtte faktiske `reference_links`, hver med en **presis forklaring på hva lenken støtter**.
- `js/psychologyRoom.js`: «Kilder og rekkevidde» vises direkte på disse kortene med lenke og avgrensning; andre 11 kort får **ikke** falske kildelister.
- `css/psychologyRoom.css`: kompakt mobiltilpasset kildeliste.
- `tests/civication-psychology-room-theory.test.js`: kontrollerer at kilder og kildebegrensninger faktisk vises.
- `data/psychology/psychology_theory_coverage_v1.json`: 58/58 kartlagt med 14 linker, men **0 fullstendig kildegodkjente**, inntil felt- og påstandsnivågjennomgangen er fullført.

## Videre reviewkrav

Samtlige kort må fortsatt få kontroll av alle faktafelter (`founders`, `period`, `idea`, `method`, `limit`, `contrast`) og mer enn bare bibliografisk dokumentasjon; evidens må skilles fra historiske beskrivelser. Neste batch tas blant `humanistisk_psykologi`, `femfaktormodellen` og `heuristikker` etter at CI på #6173 er kjørt og kontrollert. Ikke hev «kildegodkjent» på kortnivå ut fra denne delkontrollen.
