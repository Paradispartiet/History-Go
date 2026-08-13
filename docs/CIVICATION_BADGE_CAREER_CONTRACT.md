# Civication Badge, Life Position & Career Contract

## Tre forskjellige ting

Civication skal aldri tvinge **Badge-progresjon**, **livsposisjon** og **formell jobb** inn i én og samme stige.

De tre lagene er:

1. **Badge / kunnskapsprogresjon** — hva spilleren har lært og oppnådd i History Go.
2. **Life position / livsposisjon** — hvem spilleren er i verden: sosial status, miljørolle, offentlig identitet, berømmelse, livsstil eller alternativt livsløp.
3. **Career / jobb** — faktisk stilling, arbeidsgiverforhold, kvalifikasjonskrav og lønn.

En spiller kan derfor være:

- arbeidsledig + `Gangster`
- Produksjonsleder + `Undergrunnsikon`
- frilanser + `Dandy`
- student + `Kultfigur`

Livsposisjonen forsvinner ikke når spilleren får eller mister en jobb.

## Canonical Badge-data

`data/badges/*.json` er canonical kilde for Badge-progresjonen.

`tier.threshold` er poenggrensen. `tier.label` er den synlige Badge-/livstittelen. **Denne tittelen trenger ikke være en jobb.**

Når en tier er en spillbar identitet/status kan den ha:

```json
"life_position": {
  "kind": "alternative_life_status",
  "employment_independent": true
}
```

Dette er riktig sted for titler som `Gangster`, `Dandy`, `Kultfigur`, `Undergrunnsikon`, `Legend`, `Popstjerne`, `Olympisk mester`, `Ikon` og andre morsomme eller symbolske posisjoner — dersom de faktisk gir godt spillinnhold.

## `career_unlock`: jobbsporet er separat

En livsposisjon kan samtidig låse opp en saklig jobbmulighet:

```json
"career_unlock": {
  "title": "Kulturkonsulent",
  "policy": "direct"
}
```

`career_unlock.title` er den faktiske stillingen som sendes til `CivicationJobs`. Badge-tittelen beholdes urørt.

Dermed betyr Subkultur-eksemplet:

- Badge/liv: `Gangster`
- jobbmulighet: `Kulturkonsulent`
- aktiv jobb etter aksept: `Kulturkonsulent`
- aktiv livsposisjon kan fortsatt være: `Gangster`

Dette er ikke en kosmetisk alias. Det er to forskjellige systemkontrakter.

## `career_offer`: når Badge-tittelen selv er jobben

Eksisterende ryddede stiger, for eksempel Psykologi, kan fortsatt bruke `career_offer` når selve `tier.label` er den faktiske jobbtittelen.

Tillatte jobbpolicyer er:

- `direct` — jobbmuligheten kan tilbys direkte
- `not_job` — ingen jobb skal materialiseres fra tier-en
- `review_required` — jobbsporet er ikke avklart
- `qualification_required` — krever eksplisitt kvalifikasjon
- `authorization_required` — krever eksplisitt autorisasjon/godkjenning
- `appointment_required` — krever konkret ansettelse, valg, uttak eller utnevnelse

Gated policyer kan ha `qualification_ids` og skal alltid være **fail closed**.

Quiz- og meritpoeng skal aldri alene gjøre spilleren til psykolog, professor, statsråd, landslagsutøver, produksjonsleder eller daglig leder.

## Formell arbeidsstatus

`CivicationState.getActivePosition()` / `hg_active_position_v1` eier den **formelle jobben**.

Hvis det ikke finnes en aktiv jobb, er spilleren formelt arbeidsledig i dagens økonomimotor. En aktiv livsposisjon endrer ikke dette.

Det er med vilje mulig å være:

- `employment.status = unemployed`
- `primary_life_position = Gangster`

Dette åpner for alternative livsløp uten å late som de er arbeidskontrakter.

## Livsposisjon-runtime

`js/Civication/systems/civicationLifePositionRuntime.js` eier valgt livsposisjon separat fra jobb.

Runtime støtter:

- flere aktive livsposisjoner på tvers av badges (`active_by_badge`)
- én primær livsposisjon for profil/fortelling
- bare posisjoner spilleren faktisk har låst opp gjennom Badge-poeng
- livsposisjon selv om spilleren er arbeidsledig
- livsposisjon som består når spilleren får eller mister jobb

Dette er grunnlaget for senere alternative livsløp, private historier, nettverk, rykte, synlighet, risiko, livsstil og uregelmessige inntektsstrømmer.

Fast lønn skal fortsatt bare komme fra faktisk jobb/økonomiregel. Alternative liv kan senere få hendelsesbaserte inntekter, honorarer, oppdrag, royalties eller andre `livelihood`-strømmer uten å forfalske et arbeidsforhold.

## Audit-policy: `not_job/replace` betyr ikke lenger «slett Badge-tittelen»

`data/Civication/badgeCareerAuditPolicy.json` vurderer om **Badge-labelen selv** er gyldig som jobbtittel.

For en god livsposisjon er det helt korrekt at audit sier:

- `kind = subculture_status_or_game_rank`
- `offer_policy = not_job`
- `action = replace`

`replace` skal da tolkes som **erstatt i jobbsporet**, ikke automatisk «fjern fra Badge-progresjonen».

Gjeld er løst når tier-en har en eksplisitt `career_unlock` med dokumentert jobb. `scripts/civication-badge-career-matrix.mjs` skiller derfor mellom:

- policy-rader markert `replace`
- `replace` som er løst med life-position → career-split
- reell, uavklart jobb-label-gjeld

Dette prinsippet skal brukes på andre badges også. En morsom status som `Popstjerne`, `Idrettslegende` eller `Ikon` kan være svært godt Civication-innhold selv om den aldri skal stå som arbeidsgiverens stillingstittel.

## `role_scope`

`role_scope` tilhører jobbsimuleringen, ikke livsposisjonen.

Flere reelle jobbstitler kan dele samme `role_scope` når arbeidshverdagen og spillmekanikken faktisk er den samme. Livsposisjonen kan ha et helt annet fortellingslag ved siden av.

Eksempel Subkultur:

- `Kulturhusvert`, `Arrangementscrew`, `Produksjonsassistent`, `Kulturmedarbeider` → `subkultur_arrangementsdrift`
- `Arrangementsplanlegger`, `Kulturkonsulent`, `Booking- og innholdskoordinator` → `subkultur_program_og_koordinering`
- `Produsent`, `Prosjektleder (kulturarrangement)` → `subkultur_produksjon_og_prosjekt`
- `Produksjonsleder` → `subkultur_produksjonsledelse`
- `Daglig leder (kulturarena)` → `subkultur_kulturarena_ledelse`

## Life Story og alternative livsløp

Jobb-Life Story og livs-Life Story skal ikke blandes semantisk.

- jobbpakker: arbeidshverdag, kolleger, mandat, lønn, profesjonelle dilemmaer
- livsposisjon/livsløp: venner, miljø, rykte, kjærlighet, konflikt, natteliv, status, identitet, bolig, risiko, alternative prosjekter og andre private/sosiale valg

En spiller kan dermed ha både **jobbfortelling** og **livsfortelling** samme dag.

`arbeidsledig` er en systemtilstand, ikke en personlighet. Alternative livsløp kan spilles fullt ut mens arbeidsstatusen er arbeidsledig.

## Runtime-kontrakt for jobbtilbud

`js/Civication/merits-and-jobs.js` materialiserer jobbtilbud slik:

1. Finn canonical Badge-tier.
2. Hvis tier har `career_unlock`, bruk **den separate jobbens tittel og gate**.
3. Ellers bruk eksisterende `career_offer`/tier-tittel.
4. Send bare den faktiske jobbtittelen videre til `CivicationJobs.pushOffer`.
5. Behold `badge_tier_label` og `life_position_label` som proveniens — aldri som aktiv stillingstittel.

Dette gjelder både ordinær merit-flyt og andre eksisterende kodeveier som treffer den sentrale `pushOffer`-porten.

## Økonomi og levevei

`data/Civication/hg_careers.json` eier fortsatt formell jobblønn og jobbøkonomi.

Neste økonomiske lag bør være `livelihood` ved siden av jobb:

- fast jobb → fast lønn
- arbeidsledig → ingen jobblønn / eventuell ytelse etter eksisterende regler
- frilans/prosjekt → uregelmessige oppdrag/honorar
- artist/kreatør → honorar/royalty/salg som hendelser
- alternativt liv → kan ha inntekts- og kostnadshendelser uten å bli registrert som «stilling»

Det laget skal aldri bruke en kul identitet som bevis på fast lønn.

## Permanent gate

Testene skal håndheve at:

- Badge-label og jobb-title kan være forskjellige uten at noen av dem omskrives
- `Gangster` kan være aktiv livsposisjon mens formell arbeidsstatus er arbeidsledig
- samme spiller kan få/ha en reell jobb uten å miste livsposisjonen
- `career_unlock` materialiserer riktig jobbtitle
- kvalifikasjons-/autorisasjons-/utnevnelsesporter fortsatt er fail-closed
- audit-matrisen skiller løste life-position-splits fra uavklart jobb-gjeld

Målet er ikke å gjøre Civication til en CV-simulator. Målet er å ha et troverdig arbeidsliv **og** et mye friere, rarere og morsommere liv rundt det.
