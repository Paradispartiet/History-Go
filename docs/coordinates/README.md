# Koordinater — dokumentasjonskart

Status: **canonical dokumentasjonsinngang**  
Sist kontrollert: **2026-08-11**

Dette dokumentet samler coordinate-systemet uten å opprette en ny sannhetskilde. Produksjonen leser place-data, genererte indekser, manifester og kode — ikke Markdown-filene i denne mappen.

## Hva eier hva

| Dokument | Status | Eierskap |
|---|---|---|
| [`coordinate-source-contract-v1.md`](./coordinate-source-contract-v1.md) | canonical | Felter, tillatte verdier, kildekrav, status og trust-regler |
| [`../coordinate-finder.md`](../coordinate-finder.md) | operational | Arbeidsflyt for research, fysisk kontroll, endring og kart-QA |
| [`coordinate-evidence-files-v1.md`](./coordinate-evidence-files-v1.md) | canonical | Evidenskrav før en koordinat kan endres eller bli `verified*` |
| [`coordinate-control-protocol.md`](./coordinate-control-protocol.md) | operational | Løpende ledger over fullførte kontroller og batcher |
| [`address-first-coordinate-policy.md`](./address-first-coordinate-policy.md) | operational | Compatibility-peker for den avgrensede address-first-løypen |

Ved konflikt gjelder `coordinate-source-contract-v1.md`, source place-filen og de aktive validatorene. Kontrollprotokollen dokumenterer hva som er gjort; den definerer ikke nye felt eller statuser.

## Produksjonens sannhetskjede

```text
canonical place JSON under data/places/**
  -> aktive manifests og source-resolver
  -> generert places-index
  -> coordinate quality / intake / parity / evidence gates
  -> runtimekart og PlaceCard
```

Et koordinatdokument blir ikke automatisk plukket opp av runtime. En coordinate-endring må ligge i riktig canonical place-fil, være aktivert gjennom manifestkjeden og passere relevante gates.

## Obligatorisk historikk-preflight

**Coordinate-arbeid skal aldri startes med antakelsen om at stedet er ukontrollert. Før ny research eller coordinate-endring skal eksisterende arbeid alltid kontrolleres først.**

Minstekrav før fase/research åpnes:

1. les dagens canonical place og coordinate-evidence;
2. søk `coordinate-control-protocol.md` etter `placeId` og navnevarianter;
3. søk Git-/PR-historikken etter tidligere coordinate-, geometry-, map-point- og QA-arbeid for stedet;
4. kontroller om tidligere beslutning allerede er materialisert i canonical source, aggregate/runtime-index og relevante rapporter;
5. sammenlign eventuell ny mistanke med den tidligere beslutningen før noe endres.

Hvis stedet allerede har en dokumentert og materialisert `verified*` coordinate-beslutning, er standardhandlingen **å beholde den**. Coordinate-fasen skal ikke åpnes på nytt bare fordi stedet nå går gjennom en annen innholds- eller checklistproduksjon. Ny coordinate-research krever et konkret regressjonssignal, identitetsproblem, dokumentert fysisk feil eller en eksplisitt ny oppgave om koordinaten.

Torggata 2026-08-11 er styrende regressjonseksempel: den godkjente gategeometrien fra PR #3773/#3775 ble feilaktig behandlet som en åpen coordinate-oppgave under senere stedproduksjon og markøren ble flyttet til Youngstorget. Denne typen dobbeltarbeid skal stoppes av historikk-preflighten.

## Arbeidsrekkefølge

1. **Kjør obligatorisk historikk-preflight og avgjør om coordinate-jobben allerede er ferdig.**
2. Auditér eksisterende canonical `placeId`, navnevarianter og fysisk overlap.
3. Avklar hvilket konkret fysisk objekt markøren skal representere.
4. Bruk offisiell norsk adresse først bare når adressen faktisk representerer objektet.
5. Bruk objekt-, geometri- eller historisk kilde når adressepunkt ikke passer.
6. Opprett eller fullfør evidens når kilde, identitet eller fysisk anker ikke er entydig.
7. Endre canonical source-data først når source contract kan oppfylles.
8. Bygg og kontroller generert index; kjør quality, strict intake og eventuell evidens-audit.
9. Kontroller markøren visuelt i kartet og auditér nærliggende canonical steder.
10. Før den fullførte kontrollen i `coordinate-control-protocol.md`.

## Aktive kommandoer

```bash
npm run places:coords:find:address -- --address "<adresse>"
npm run places:coords:evidence:audit
npm run places:coords:quality
npm run places:coords:intake
npm run places:index:build
npm run places:index:check
npm run test:coordinate-source-contract
```

Full repository-kontroll ligger i `npm run tools:check`.

## Permanente regler

- **Sjekk alltid om coordinate-jobben allerede er utført før ny research eller endring.**
- Ikke gjett koordinater.
- `manual_map_check` er ekstra QA, aldri eneste verifiseringskilde.
- Ett tydelig geokodingsresultat er en kandidat; fysisk identitet og komplett kontrakt må fortsatt kontrolleres.
- Parker, baner, kaier, gater, ruter, områder og historiske steder skal ikke automatisk arve et nærliggende adressepunkt.
- Ikke opprett et nytt canonical sted eller koordinatanker før eksisterende record og fysisk overlap er auditert.
- Batchrapporter og evidensfiler er sporbarhet, ikke runtime source of truth.
