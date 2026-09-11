# Tollpakkhuset — nullmåling før fullproduksjon

Dato: 2026-09-11
Place ID: `tollpakkhuset`

Denne nullmålingen er første endring i den nye produksjonsrunden. Ingen canonical brukerdata endres i dette steget.

## Canonical identitet og eier

- Canonical place-fil: `data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/tollpakkhuset.json`.
- Place-objektet representerer den separate, stående lagerbygningen Tollpakkhuset / Steinpakkhuset / OSM-navnet Stenpakkhuset i Tollbugata 1A, ikke administrasjonsbygningen `tollboden_oslo` og ikke kai-/linjeankeret `tollbukaia`.
- Eksisterende markeringspunkt beholdes. Det er tidligere kontrollert mot eksakt navngitt OSM-bygningspolygon `way 112195503`; det generiske adressepunktet ble avvist som tvetydig for denne separate bygningen.
- Næringsliv er korrekt hovedbadge fordi bygningen ble oppført som lager for Tollvesenet og hovedfunksjonen historisk var mottak, lagring, inn-/utlasting og tollbehandling av varer ved havna.

## Badge- og underbadge-gate

Canonical hovedbadge: `naeringsliv`.

Badge-filen er lest i sin helhet. Gyldige Næringsliv-underbadges er `industri`, `handel_og_markeder`, `bank_og_finans`, `shipping_og_havn`, `teknologi_og_startups`, `mat_og_servering`, `butikkhistorie_og_kjeder`, `arbeidsliv_og_fag`.

Foreløpig stedsspesifikk prioritering før endelig source review:

- `shipping_og_havn` — sterk: pakkhuset var del av sjøtollstedet og historisk havnelogistikk.
- `handel_og_markeder` — sterk: bygningen håndterte varer knyttet til import/eksport og tollbehandling.
- `arbeidsliv_og_fag` — kandidat: tollarbeid, varekontroll og måle-/håndteringspraksis må kildebevises konkret før eventuell materialisering.

Ingen underbadge materialiseres bare for bredde.

Badge-routerens Næringsliv-spor som skal researches: `production_or_service`, `work`, `technology`, `capital_and_ownership`, `markets`, `logistics`, `business_identity`, `industrial_or_commercial_change`.

## Produksjonsprofil

Foreløpig profil: `focused`, status `provisional`.

Begrunnelse: Tollpakkhuset er et viktig og klart avgrenset enkeltbygg med flere dokumenterte tidslag (1846–50 oppføring, historisk lager-/tollfunksjon, Norsk Tollmuseum 1915–2019, senere kontor/rehabilitering), men stoffbredden er smalere enn et stort produksjons- eller institusjonskompleks. Profilen bekreftes først etter full source review. `focused` reduserer ikke canonical core eller de fire obligatoriske PlaceCard-samlingene.

## Universal canonical core — nullstatus

- Identitet / own-place-grense: PASS på eksisterende grunnlag, skal reauditeres mot naboobjektene.
- Koordinat/geometri: PASS på eksisterende grunnlag; ingen koordinatendring planlagt uten ny feilindikasjon.
- Kilder / claims: MANGLER full produksjonspakke etter gjeldende description-kontrakt.
- `desc` / `popupDesc`: eksisterer, men er legacy og skal claim-first reauditeres/utvides.
- `underbadge_ids`: mangler i canonical place-fil.
- Fagverk-sted: mangler Place-eid `history_go_place_fagverk_v2`.
- `image` / `frontImage`: mangler canonical fullproduksjon og proveniens.
- `cardImage`: skal ikke innføres eller videreføres i revidert canonical Place-produksjon.
- QuizCard: ikke dokumentert for `tollpakkhuset`; eksisterende `tollbukaia`-kort/quiz er et annet place target og kan ikke brukes som erstatning.
- Språkleksikon: mangler.
- Kronologi/epoke: relevante eksakte ankere finnes i kildene, men er ikke ferdig materialisert for dette place-et.
- Runtime/materialisering: eksisterende place-open er tomt for de fleste subsystemer og må regenereres etter source-endringer.
- Manuell slutt-QA: ikke startet.

## Fire obligatoriske PlaceCard-samlinger

Gjeldende kategoriuttrykk for `naeringsliv` er `productions` / brukerrettet «Produksjon og tjenester».

Planlagt samlingsprofil er derfor nøyaktig:

1. `people`
2. `objects`
3. `brands`
4. `productions`

Ingen av disse kan settes N/A. Hver må ha minst ett ekte canonical medlem med eget, lastbart, kildebelagt previewbilde før closeout.

### People

Status: BLOCKED / research.

Kandidater:
- Johan Henrik Nebelong — direkte dokumentert arkitekt for selve Tollpakkhuset 1846–50, men arkitektkreditering alene er ikke nok. Kandidaten må bestå `PEOPLE_PROFILE_CANONICAL.md` og place-relevans må være substansiell, ikke filler.
- Toll-/museumspersoner — bare dersom en konkret person kan dokumenteres med direkte, særskilt rolle ved akkurat denne bygningen.

### Objects

Status: BLOCKED / research.

Kandidatfamilier etter Næringsliv- og Objects-kontraktene: tollskilt, vekter/måleinstrumenter, stempler/plomberingsutstyr, arbeidsutstyr eller annet fysisk utstyr med dokumentert Tollpakkhuset-/Norsk Tollmuseum-stedstilknytning. Museums-eierskap alene er ikke tilstrekkelig dersom stedet ikke kan dokumenteres.

### Brands

Status: BLOCKED / research.

Kandidater som må testes mot `brand_rules_v1_1.json`:
- Norsk Tollmuseum — historisk institusjonsidentitet i Tollpakkhuset 1915–2019; må bestå autonom identitet + direkte stedskobling + autentisk visuell identitet.
- Tolletaten/Tollvesenet — bare dersom brand-/institusjonsidentiteten og den konkrete relasjonen til Tollpakkhuset kan dokumenteres uten å gjøre place-navnet til et kunstig Brand.

Null treff i eksisterende brandregister er ikke N/A.

### Productions

Status: BLOCKED / research.

Productions skal uttrykke faktisk «Produksjon og tjenester», ikke duplisere bygningen som Structure. Kandidater er dokumenterte toll-/lager-/museumstjenester eller avgrensede virksomhetsprosesser knyttet direkte til Tollpakkhuset. En abstrakt prosess uten canonical entity, kilde og bilde er ikke tilstrekkelig.

## Næringsliv A–H — nullstatus

- A hovedidentitet: sannsynlig PASS, må kildebindes i produksjonsrapport.
- B canonicale `em_naering_*`: eksisterende `em_naering_felt_arbeid_verdiskaping` og `em_naering_geografi_infrastruktur` må auditeres mot dagens canonical manifest; ingen legacy-ID beholdes uten resolusjon.
- C økonomisk case / verdiskapingskjede: mangler.
- D aktører / arbeid / eierskap / fordeling / makt: mangler.
- E metode / måling / enhet / sammenlignbarhet: mangler.
- F risiko / eksternaliteter / inferens / dagens drift: mangler fersk fullkontroll.
- G quizåpning: egen Tollpakkhuset-quiz mangler; `tollbukaia` er et annet target.
- H chronology vs Story: chronology må produseres; Story bare dersom materialet har selvstendig narrativ motor.

## Betingede moduler

- Stories: RESEARCH; ikke automatisk chronology-kopi.
- Før/etter: RESEARCH; krever meningsfullt, stedstro bildepar.
- Nyheter: RESEARCH; kan bli begrunnet N/A hvis dagens rolle ikke bærer en relevant nyhetsflate.
- Lesespor: RESEARCH; betalingsmur eller første svake treff er ikke N/A-grunn.

## Kildegrunnlag som allerede er identifisert

- Oslo kommune / Byantikvaren, Oppdag Kvadraturen — Tollboden, Tollpakkhuset og havna.
- Riksantikvaren — fredet Tollbugata 1A, rehabilitering og Steinpakkhuset.
- Oslo byleksikon — Tollboden/Tollpakkehuset, museum, endringer og havnefront.
- Store norske leksikon — Norsk Tollmuseum.
- Store norske leksikon / Norsk biografisk leksikon — Johan Henrik Nebelong.
- DigitaltMuseum / Norsk Tollmuseum — mulig objekt- og bildegrunnlag, må vurderes post for post.

## Avvist / holdback nå

- Ingen ny koordinat bare fordi nærliggende `tollboden_oslo` eller `tollbukaia` ligger tett.
- Ingen gjenbruk av `tollbukaia`-quiz som om den var Tollpakkhuset-quiz.
- Ingen generert eller rekonstruert logo.
- Ingen perifer person bare for å fylle People.
- Ingen museumsobjekt uten dokumentert stedstilknytning og bildeproveniens.
- Ingen Structure som reserve for `productions` uten uttrykkelig kontraktsgrunnlag; normal Næringsliv-profil er Productions.
- Ingen `cardImage` i canonical source.

## Sekvensielle checkpoints

Aktiv fase: **A — preflight/evidence**.
Aktivt filscope: denne nullmålingen først; deretter kun Tollpakkhuset-eide source-/claim-/production-/collection-filer og nødvendige smale manifester/indekser.
Neste checkpoint: full source review + confirmed profil + endelig innholdsplan + Næringsliv-caseplan.

Stedet skal ikke merkes `SLUTTFØRT` før universal core, de fire samlingene, Fagverk, Språk, chronology/epoke, QuizCard/runtime, Næringsliv A–F/G/H etter relevans, CI og manuell slutt-QA faktisk er gjennomført.