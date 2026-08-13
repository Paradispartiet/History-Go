# Civication — levevei-kontrakt

Status: runtime-kontrakt v1, 2026-08-13.

## Formål

Civication skiller nå fire ting som tidligere lett ble blandet sammen:

1. **Badge-progresjon** — kunnskap/prestisje i et fag- eller interessefelt.
2. **Livsposisjon** — selvvalgt identitet eller måte å leve feltet på.
3. **Formell jobb** — faktisk ansettelse med arbeidsgiver-, kvalifikasjons-, autorisasjons- og utnevnelsesporter der det kreves.
4. **Levevei** — dokumenterte inntekts- og kostnadsstrømmer som kan eksistere med eller uten fast jobb.

En spiller kan derfor være `arbeidsledig + Gangster + gig-honorar`, `fast ansatt + Bokorm + frilansoppdrag`, eller `ingen fast jobb + Skrivebordspoet + royalty + småsalg` uten at noen av lagene omskriver de andre.

## Canonical state

- Formell jobb: `hg_active_position_v1` via `CivicationState`.
- Livsposisjon: `hg_civi_life_positions_v1` via `CivicationLifePositions`.
- Levevei: `hg_civi_livelihood_v1` via `CivicationLivelihoods`.
- Penger: eksisterende `hg_civi_wallet_v1`; levevei har **ingen egen wallet**.

## Mulighet før inntekt

En livsposisjon skal aldri opprette penger direkte. Betalende levevei følger denne kjeden:

`narrativ hendelse / kontrakt / booking / salg / vedtak → livelihood opportunity → eksplisitt aksept → aktiv stream → ukentlig avregning`

Alle betalende muligheter krever `source` med type og identifiserbar kilde/etikett. Dette gjør det mulig å inspisere hvorfor spilleren får penger.

## Inntektsmodeller

Runtime støtter:

- `fixed` — fast ukesbeløp;
- `variable` — beløp innen eksplisitt min/maks;
- `occasional` — kan gi null enkelte uker, ellers beløp innen min/maks;
- `zero` — eksplisitt periode uten inntekt.

Variabel og sporadisk inntekt er deterministisk for `stream-id + uke`. Reload, refresh eller dobbelt boot kan derfor aldri rerolle en bedre uke.

Direkte kostnader modelleres separat som fast kostnad og/eller andel av brutto. Ledger beholder brutto, kostnader og netto per stream.

## Typer

`data/Civication/livelihoodCatalog.json` definerer blant annet:

- frilansoppdrag;
- gig/honorar;
- royalty;
- direkte salg;
- prosjektmidler;
- ekstravakt/småjobb;
- eksplisitt innvilget støtte/ytelse;
- annen dokumentert inntekt;
- periode uten inntekt.

Katalogen definerer semantikk, ikke gratis standardbeløp. Beløp må komme fra den konkrete muligheten.

## Arbeidsstatus

Levevei endrer aldri `hg_active_position_v1`.

- En frilansstream kan fortsette når spilleren får fast jobb hvis muligheten tillater det.
- En stream med `requires_unemployed=true` pauses mens spilleren er i formell jobb; den slettes ikke og omskriver ikke jobbstatus.
- Eksisterende NAV-logikk i økonomimotoren forblir separat. `support_payment` betyr derfor et eksplisitt vedtak/opportunity, ikke automatisk betaling fordi spilleren mangler jobb.

## Ukentlig økonomi

`CivicationLivelihoods.attachEconomyBridge()` wrapper den eksisterende `CivicationEconomyEngine.tickWeekly()`.

Rekkefølgen er:

1. eksisterende jobb-/arbeidsledighetsøkonomi kjøres;
2. levevei avregnes inn i samme wallet;
3. wallet lagrer uke-ID i `livelihood_settled_weeks`;
4. ledger materialiserer brutto, kostnader, netto og arbeidsstatus ved avregning.

Dette gjør avregningen idempotent selv om ukesticken forsøkes flere ganger.

## Livsposisjon som relevans, ikke lønn

En livelihood opportunity kan kreve eller referere til aktive livsposisjoner. Eksempel:

- `Skrivebordspoet` kan være krav/relevans for et konkret tekstoppdrag;
- `Scenehenger` kan være relevans for en faktisk bookingmulighet;
- `Festivalveteran` kan senere påvirke hvilke kortoppdrag eller invitasjoner eventmotoren genererer.

Men posisjonen selv betaler fortsatt 0 PC.

## UI

Eksisterende jobbkort har et eget **Levevei**-felt som viser:

- aktive inntektsstrømmer;
- estimert netto denne uka;
- kilde og type;
- konkrete pending opportunities;
- eksplisitt `Ta muligheten` / `Nei takk`.

Dette ligger ved siden av, ikke inni, arbeidsstatus og livsposisjon.

## Neste produksjonslag

Levevei-runtime er grunnmuren. Videre livsrealisme bør bygges gjennom konkrete opportunity-produsenter fra:

- Life Story-hendelser;
- steder og miljøer;
- venner/nettverk;
- kalender/festival/kamp/premiere;
- arbeidsgivere og kunder;
- kunst-/medie-/musikkproduksjon;
- prosjekt- og støttehendelser.

Opportunity-produsenter skal bruke den canonicale kontrakten i stedet for å skrive direkte til wallet.
