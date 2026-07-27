# History GO — canonical People-profilstandard

Status: **canonical og bindende**
Versjon: **1.0**
Eier: `person_profile_production_contract`
Gjelder: produksjon, kildekontroll og ferdigstatus for canonical personer under `data/people/**`
Presentasjon: `docs/PEOPLE_POPUP_SYSTEM.md`
Overordnet faktisitet: `docs/FACTUALITY_CONTRACT.md`
Maskinlesbar mal: `data/people/regler/people_profile_templates_v1.json`
Claim-schema: `data/people/regler/people_claims_schema_v1.json`
Validator: `tools/audit-people-profile-canonical.mjs`
Sist kontrollert: **2026-07-27**

## 1. Formål og myndighet

Denne standarden eier **hvordan People-profiler produseres og godkjennes**. `PEOPLE_POPUP_SYSTEM.md` eier hvordan ferdige data vises. Ingen UI-test, readiness-score eller batchtest kan stille svakere faktakrav eller kreve mer fylde enn denne standarden.

En språkmodell er aldri en faktakilde. Kontrollen skal gjennomføres påstand-for-påstand mot inspectable kilder som faktisk støtter hele formuleringen.

Arbeidsrekkefølgen er alltid:

> identitetskontroll → inspectable kilder → claims → felt- og setningsmapping → faktareview → redaksjonell review → canonical profil

Aldri:

> ønsket komplett profil → fyll felter → finn kilder som ser passende ut

Manglende informasjon skal forbli manglende. Et tomt felt, en utelatt oppføring eller status `blocked_insufficient_sources` er bedre enn en plausibel opplysning.

## 2. Identitetsport før research

Før innholdsresearch skal personen defineres i én presis identitetspost:

```json
{
  "person_id": "bente_borsum",
  "canonical_identity": "Den norske skuespilleren Bente Børsum, født 21. juni 1934.",
  "name_variants": ["Bente Børsum"],
  "not": ["rollefigurer", "navnelike personer"],
  "identity_status": "verified"
}
```

Identitetsporten skal kontrollere:

- fullt navn og dokumenterte navnevarianter;
- eventuelt kunstnernavn, pseudonym eller navneendring;
- at alle kildene omtaler samme person;
- at fødselsdata ikke brukes til å slå sammen to personer uten ytterligere støtte;
- at portrettet viser riktig person og følger `PEOPLE_IMAGES.md`;
- at personen ikke blandes med en rollefigur, slektning eller navnebror.

Statusene er:

- `verified`;
- `identity_unresolved`;
- `metadata_correction_required`.

`identity_unresolved` blokkerer publisering og videre materialisering.

## 3. Obligatorisk påstandsregister

En profil som skal godkjennes under People Profile v1 må ha en claims-fil:

```text
data/people/claims/<kategori>/<geografi>/<klynge>/<person_id>.claims.json
```

Hvert claim skal minst ha:

```json
{
  "id": "nationaltheatret_employment",
  "claim": "Personen var fast ansatt ved Nationaltheatret fra 1991 til 2020.",
  "source_url": "https://...",
  "source_location": "avsnittet om Nationaltheatret",
  "source_type": "institutional",
  "temporal_status": "historical",
  "verified_at": "2026-07-27",
  "status": "verified",
  "evidence_level": "direct"
}
```

Regler:

1. Claimet skal uttrykke én kontrollerbar opplysning eller en tett, kildeidentisk opplysningsgruppe.
2. URL-en skal åpne den konkrete kilden; en generell forside er ikke nok.
3. `source_location` skal gjøre opplysningen mulig å finne uten ny research.
4. Kilden skal støtte hele claimet, ikke bare omtale personen.
5. En annen History GO-profil er aldri tilstrekkelig kilde.
6. `verified_at` dokumenterer kontrolltidspunkt, ikke automatisk sannhet.
7. Avviste eller konfliktfylte opplysninger skal beholdes i researchmaterialet med korrekt status, ikke smugles inn i canonical tekst.

## 4. Felt–claim-paritet

Alle publiserte faktiske felt skal kunne spores til claim-ID-er. Claims-filen skal ha `field_claim_map`:

```json
{
  "field_claim_map": {
    "birth_date": ["birth_date"],
    "education[0]": ["education_theatre_school"],
    "places[nationaltheatret]": ["nationaltheatret_employment"],
    "works[id=don_juan_2017].year": ["don_juan_premiere"],
    "works[id=don_juan_2017].summary": ["don_juan_role", "don_juan_premiere"]
  }
}
```

Følgende må alltid mappes når de finnes:

- navn, navnevariant og identitetsavklaring;
- fødsels- og dødsdata;
- rolle, tittel, verv og ansettelsesperiode;
- utdanning og dokumentert opplæring;
- verk, produksjoner, resultater og hendelser;
- år, dato, periode, institusjon, rolle og sted i hvert `works`-objekt;
- `placeId` og hver oppføring i `places`;
- sitater, priser, rekorder og årsaksforklaringer;
- nåtidsopplysninger;
- bildeidentitet og attribusjon i bildekontrakten.

Redaksjonelle klassifikasjoner som `tags`, `themes` og `materials` skal også bygge på dokumentert praksis, men kan mappes til flere underliggende claims i stedet for egne biografiske claims.

## 5. Setning–claim-paritet

Hver setning i `desc` og `popupDesc` skal kobles til claims:

```json
{
  "sentence_claim_map": {
    "desc": [
      {
        "sentence": 1,
        "claim_ids": ["birth_date", "profession"]
      }
    ],
    "popupDesc": [
      {
        "sentence": 1,
        "claim_ids": ["birth_date", "birth_place"]
      }
    ]
  }
}
```

En setning skal feile dersom:

- den mangler claim;
- claimet bare støtter deler av setningen;
- setningen legger til årsak, motiv, virkning, rangering eller sammenligning som kilden ikke uttrykker;
- flere korrekte fakta kombineres til en ny udokumentert konklusjon;
- en usammenhengende periode fremstilles som sammenhengende;
- medvirkning fremstilles som hovedansvar;
- institusjonstilknytning brukes som bevis for en konkret produksjon uten produksjonskilde.

Redaksjonell forbedring kan omformulere en setning, men claim-mappingen må fortsatt dekke hele innholdet.

## 6. Streng feltsemantikk

### 6.1 `education`

`education` kan bare inneholde dokumentert utdanning eller opplæring, for eksempel:

- skole, universitet, akademi eller konservatorium;
- læretid, elevutdanning eller trenerløp;
- dokumentert privatundervisning;
- studiereise når kilden uttrykkelig beskriver den som studium eller faglig opplæring.

Følgende er ikke utdanning:

- debut;
- ansettelse eller praksis;
- ensemblearbeid;
- arbeidserfaring;
- prøveopptreden;
- rollelesning før ansettelse;
- karriereutvikling;
- «selvlært» uten kilde.

Tom `education` er en gyldig og ferdig tilstand når kildene ikke dokumenterer utdanning. Readiness og tester skal aldri kreve ett eller flere utdanningspunkter.

### 6.2 `works`

`works` er dokumenterte bidrag, ikke en pliktliste. Hvert objekt skal angi det kildene faktisk viser:

- korrekt tittel;
- personens eksakte rolle eller bidrag;
- år eller premieredato når dokumentert;
- institusjon eller produksjonssted;
- kort sammendrag uten vurderende fyll;
- konkrete claim-ID-er for alle faktiske bestanddeler.

Arbeid ved en institusjon dokumenterer ikke automatisk deltakelse i institusjonens produksjoner. En kort liste med sikre bidrag er bedre enn en lang representativ liste med løse attribusjoner.

### 6.3 `places`

En person–sted-kobling krever dokumentert:

- arbeid eller ansettelse;
- konkret rolle eller produksjon;
- bosted eller opphold når stedskoblingen er relevant;
- verk, hendelse eller institusjonstilknytning;
- ledelsesverv eller annen direkte biografisk forbindelse.

Tematisk likhet eller kategori passer ikke som kildegrunnlag. Hver oppføring i `places` skal ha egen claim-mapping.

### 6.4 `materials`, `themes` og `tags`

Disse er kuraterte klassifikasjoner, ikke erstatning for biografiske fakta.

- De skal avledes fra dokumentert praksis.
- De gir ikke readiness-poeng etter antall.
- De skal ikke innføre kunstneriske egenskaper kildene ikke dokumenterer.
- Ord som «psykologisk presisjon», «monumentalitet» og «banebrytende» krever eksplisitt kilde eller skal utelates.
- Felt kan være tomme eller utelates når de ikke passer persontypen.

## 7. Sterke påstander

Følgende ord og konstruksjoner krever eksplisitt kildebevis:

- første, eneste, yngste, eldste, største;
- viktigste, ledende, fremste, sentral, bærende;
- særlig kjent for, hovedverk, glansrolle, gjennombrudd;
- legendarisk, banebrytende, revolusjonerte, endret for alltid;
- førte til, på grunn av, dermed, var årsaken til;
- «rollen gjorde personen kjent» eller tilsvarende virkningspåstander.

Et claim som støtter en sterk påstand skal ha `evidence_level: "explicit"`. Generell kontekst eller modellsyntese er ikke nok.

## 8. Kildekonflikter og manglende data

Kildekonflikter lagres eksplisitt:

```json
{
  "id": "first_roles_year",
  "status": "source_conflict",
  "sources": [
    {"url": "https://...", "value": "1958"},
    {"url": "https://...", "value": "1959"}
  ],
  "publication_decision": "publish_with_qualification"
}
```

Tillatte beslutninger:

- `omit`;
- `publish_common_secure_part`;
- `publish_with_qualification`;
- `prefer_primary_source`;
- `unresolved_blocking`.

Ved konflikt skal produsenten ikke automatisk velge den mest detaljerte opplysningen. `unresolved_blocking` gir status `source_conflict` og blokkerer `ready_people_v1`.

## 9. Nåtidsstatus og levende personer

Påstander som «er ansatt», «arbeider ved», «leder», «bor» eller «spiller nå» skal ha:

```json
{
  "temporal_status": "current",
  "verified_at": "2026-07-27",
  "freshness_required_days": 180
}
```

Regler:

- gamle institusjonssider må ikke gjøre en tidligere stilling nåværende;
- planlagte roller skal omtales som planlagte;
- utløpt nåtidsstatus skal gi `current_status_stale`;
- levende personer skal bare beskrives med offentlig, relevant og profesjonelt dokumentert informasjon;
- private forhold skal ikke samles bare fordi de er tilgjengelige.

## 10. Ingen faste fyldekrav

Ingen profil må ha et bestemt antall:

- utdanningspunkter;
- verk;
- materialer;
- temaer;
- avsnitt;
- ord;
- kilder.

Kvalitetskravet er sporbar og relevant kunnskap, ikke lengde. Dersom inspectable kilder ikke gir nok stoff til en rik profil, skal status være `blocked_insufficient_sources` eller `needs_research`. Teksten skal ikke fylles med vurderinger, generisk biografi eller intern begrunnelse.

## 11. Biografiens redaksjonelle kvalitet

`desc` er en kort, konkret ingress. `popupDesc` er en selvstendig biografi, men har ingen fast treavsnittsmal.

Mulige strukturer:

- liv og utdanning → karriere → sentrale bidrag;
- institusjonsperioder → konkrete produksjoner;
- praksis → verk → ledelse;
- forskning → funn → institusjoner;
- idrettskarriere → resultater → senere roller.

Bruk den strukturen dokumentasjonen forsvarer. Teksten skal ikke forklare hvorfor personen er «et History GO-anker», hvorfor redaksjonen valgte personen, eller hva spilleren skal lære.

Underholdning skal komme fra:

- konkrete valg og hendelser;
- presise datoer og resultater;
- uventede dokumenterte detaljer;
- tydelige funksjonsskifter;
- verk, roller og konflikter som faktisk er kildebelagt.

Ikke dikt opp tanker, følelser, dialog, publikumsreaksjoner eller kunstneriske intensjoner.

## 12. To separate reviews

### 12.1 Faktareview

Kontrollerer bare:

- identitet;
- navn og datoer;
- utdanning;
- roller, titler og ansettelser;
- verk og produksjonsdatoer;
- institusjoner og stedskoblinger;
- nåtidsstatus;
- claim-dekning;
- kildekonflikter;
- kildekvalitet.

Ingen språklig pynting skal introduseres i denne fasen.

### 12.2 Redaksjonell review

Kontrollerer:

- klarhet og flyt;
- gjentakelser;
- generiske formuleringer;
- overdrevne vurderinger;
- variasjon mellom profiler;
- forståelig språk;
- om teksten er interessant uten oppdiktning.

Den redaksjonelle passeringen kan ikke innføre nye fakta. Nye fakta krever nye claims og ny faktareview.

## 13. Normal-quiz-test

En rik People-profil bør kunne gi minst åtte direkte faktaspørsmål med entydig fasit, fordelt på minst fire typer:

- hvem;
- når;
- hvor;
- hvilken rolle;
- hvilket verk eller hvilken produksjon;
- hvilken institusjon;
- hva personen gjorde;
- hvilket dokumentert resultat.

Minst fem bør være normale kunnskapsspørsmål, ikke analyse- eller begrepsspørsmål.

Dette er en kvalitetsindikator, ikke et fyldekrav. En kort og korrekt profil som ikke gir åtte spørsmål skal få en ærlig produksjonsstatus, ikke fylles ut.

## 14. Likhetskontroll

En People-batch skal kontrollere:

- like åpninger og avslutninger;
- gjenbrukte hele setninger;
- formuleringer som «sentral skikkelse», «bærende kraft» eller «bandt sammen»;
- tekst som kan flyttes til en annen person ved bare å bytte navn;
- kunstneriske karakteristikker som går igjen uten individuell kilde.

Ingen hel setning på mer enn åtte ord skal gjenbrukes mellom to profiler, med mindre den er en nødvendig offisiell tittel, et egennavn eller en kildeidentisk fast formulering.

## 15. Produksjonsstatus og versjonering

Tillatte statuser:

- `ready_people_v1`;
- `needs_research`;
- `source_conflict`;
- `identity_unresolved`;
- `blocked_insufficient_sources`;
- `metadata_correction_required`;
- `current_status_stale`;
- `legacy_unreviewed`.

Ferdigstatus lagres i claims-filen:

```json
{
  "completion": {
    "completed_under": "people_profile_v1.0",
    "claims_verified": "27/27",
    "fact_review": "passed",
    "editorial_review": "passed",
    "source_verified_at": "2026-07-27",
    "validator_version": "1.0.0",
    "current_status": "ready_people_v1"
  }
}
```

En eldre profil uten v1-claims er `legacy_unreviewed`, selv om popupen er teknisk komplett. Ved ny standardversjon skal gammel ferdigstatus kunne markeres `requires_v1_review` eller tilsvarende uten å late som profilen fortsatt er kontrollert etter ny standard.

## 16. Readiness er ikke sannhetsstatus

`audit-people-popup-readiness` måler bare om runtime kan presentere tilgjengelige felt. Den skal:

- ikke gi flere poeng for flere utdanningspunkter, verk, temaer eller kilder;
- ikke markere tom `education` som feil;
- ikke bruke tekstlengde alene som kvalitetsbevis;
- rapportere claim-/produksjonsstatus separat når den finnes;
- omtale profiler uten v1-claims som `legacy_unreviewed`;
- aldri bruke `complete` som synonym for `source_verified`.

## 17. PR-isolasjon og indeksvern

En People-produksjons-PR skal ikke inneholde urelaterte place-, coordinate-, quiz- eller fagendringer.

For genererte filer:

- hver endring skal kunne spores til en endret canonical people-fil eller claim-fil i samme PR;
- dersom regenerering endrer uvedkommende personer, skal PR-en stoppe;
- regelendringer og profilproduksjon skal normalt ligge i separate PR-er;
- midlertidige workflows, researchbundles og triggerfiler skal ikke inngå i slutt-diffen.

## 18. Ferdigkriterium

En profil er `ready_people_v1` når:

1. identiteten er verifisert;
2. alle publiserte faktiske felt er mappet til claims;
3. alle setninger i `desc` og `popupDesc` er claim-dekket;
4. sterke påstander har eksplisitt kildebevis;
5. nåtidsopplysninger er ferske;
6. kildekonflikter er løst eller kvalifisert;
7. faktareview har bestått;
8. redaksjonell review har bestått uten nye fakta;
9. person–sted-koblingene er dokumentert;
10. canonical data, claims, indekser og rapporter er synkronisert;
11. ingen felt er fylt for å oppnå readiness eller visuell fylde;
12. validatoren passerer.

## 19. Produksjonsrekkefølge for nye batcher

1. Lås person-ID og identitet.
2. Les kildene.
3. Opprett claims og registrer konflikter.
4. Velg bare dokumenterte felt og bidrag.
5. Skriv `desc` og `popupDesc`.
6. Opprett felt- og setningsmapping.
7. Kjør faktareview.
8. Kjør redaksjonell review.
9. Kjør canonical validator og People-gater.
10. Regenerer avledede filer.
11. Kontroller isolert PR-diff.
12. Merge først når alle porter er grønne.

## 20. Eierskap

- `docs/FACTUALITY_CONTRACT.md` eier overordnet faktisitet.
- `docs/PEOPLE_PROFILE_CANONICAL.md` eier People-produksjon, claims, review og ferdigstatus.
- `data/people/regler/people_profile_templates_v1.json` eier maskinlesbare produksjonsregler.
- `data/people/regler/people_claims_schema_v1.json` eier claim-formatet.
- `docs/PEOPLE_POPUP_SYSTEM.md` eier runtime-presentasjonen.
- `docs/people-of-places-method.md` eier relevansgaten for person–sted-koblinger.
- `docs/PEOPLE_IMAGES.md` eier bildeidentitet, rettigheter og attribusjon.
- `tools/audit-people-profile-canonical.mjs` eier maskinell v1-validering.
- `tools/audit-people-popup-readiness.mts` eier bare presentasjons-readiness.
