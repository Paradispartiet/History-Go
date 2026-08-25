# Christiania Torv – fase 2 identity/source/coordinate prior-work gate v1

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-1-merge `56d34be511aee748cf1d07310eb48e932be30ed7`  
Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/DATA_PRODUCTION_CONTRACT.md`, `docs/FACTUALITY_CONTRACT.md`, coordinate-kontraktene  
Content Factory source pack: `reports/place-production/content-factory-pilot-03-kvadraturen-source-pack-v1.json`

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: #5263 / 56d34be511aee748cf1d07310eb48e932be30ed7
SISTE GODKJENTE TILSTAND: nullmåling og workcard etablert; shared Kvadraturen source pack allerede merget i #5261.
KONKRET REGRESJONSEVIDENS: ingen mot canonical identity eller coordinate geometry.
BESLUTNING: BEHOLD canonical identitet og koordinater; produser ikke en ny plass eller ny geometri.
```

## 1. Canonical identitet – PASS

`christiania_torv` representerer **selve det navngitte torget/plassrommet i Kvadraturen**. Det representerer ikke Gamle Rådhus, Anatomigården/Rådmannsgården, serveringssteder eller andre bygninger rundt torget.

Klynge- og repo-audit viser separate canonical objekter som må forbli separate:

- `gamle_radhus` er et eget canonical Place;
- øvrige navngitte bygg/virksomheter rundt torget kan bare brukes som relasjoner, structures eller Brand-kandidater når den eierkontrakten faktisk støtter det;
- Wonderkammer-lag og Oppdag Kvadraturen-rutestopp er opplevelses-/mikrolag og skal ikke bli konkurrerende parent-Places.

Shared Content Factory-claims for Christiania Torv har eksplisitt place-scope. Bankplassen- og Grev Wedels plass-claims kan ikke restemples som torgets fakta bare fordi alle tre ligger i samme historiske område.

## 2. Source boundary – PASS

Fase 2 bruker følgende allerede reviewede kjerne:

- Oslo byleksikon – Christiania Torv;
- Oppdag Kvadraturen / Byantikvaren – Christiania Torv;
- Oppdag Kvadraturen / Byantikvaren – Stil og arkitektur;
- OpenStreetMap way `594329484` for geometri;
- eksisterende canonical People-kildepakke for Wenche Gulbransen der People-fasen senere krever det.

Viktige kildegrenser som låses:

1. fortellingen om at Christian IV kastet hansken og pekte ut stedet behandles ikke som dokumentert bokstavelig hendelse;
2. Livorno kan omtales som mulig inspirasjon bare dersom kilden uttrykkelig kvalifiserer det; det publiseres ikke som sikkert direkte forbilde;
3. nabobyggenes biografier og institusjonshistorie overføres ikke til torget uten eksplisitt plassrelasjon;
4. dagens virksomheter/leietakere er volatile og må ferskverifiseres i Brand-/Nyheter-fasen;
5. `year: 1648` beholdes som eksisterende metadata inntil feltsemantikken eventuelt krever separat korreksjon; det brukes ikke som automatisk etableringsår i ny brukertekst.

## 3. Coordinate prior-work gate – PASS / ALLEREDE FERDIG

Canonical Place og coordinate-evidence er i paritet:

- `lat`: `59.9102351`;
- `lon`: `10.7395879`;
- `r`: `150` – gameplay-/visningsradius, ikke fysisk arealmål;
- `coordType`: `square_center`;
- `coordStatus`: `verified_geometry`;
- `coordSourceId`: `osm-way:594329484`;
- `coordRole`: `area_anchor`;
- identity: Christiania Torv som fysisk separat fra `gamle_radhus`;
- evidence status: `applied_to_place`.

OpenStreetMap-objektet er et eksakt navngitt `place=square`-objekt for Christiania torv. Det finnes ingen konkret regresjonsevidens som forsvarer ny geokoding. Ny geokoding nå ville kunne degradere et allerede korrekt områdeanker til et svakere adresse-/byggpunkt.

**Beslutning:** ingen coordinate mutation i fase 2.

## 4. Hva fase 2 ikke godkjenner

Denne fasen godkjenner ikke:

- `desc`/`popupDesc` eller v4.2 production packet;
- kategori/emner/Fagverk som ferdig-auditert;
- People, Objects, Brands eller rundinger;
- Story, Quiz/Knowledge, språk, lesespor, Før/etter eller Nyheter;
- popupfaner eller helhetlig spilleropplevelse.

## Fase-2-konklusjon

**KLAR FOR REVIEW:** canonical identity, source boundary og coordinate prior work er låst uten å skape duplikatsted eller endre korrekt geometri. Etter grønn merge går Christiania Torv videre til fase 3 – Fagverk/kategori/emne audit.
