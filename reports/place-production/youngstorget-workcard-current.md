# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv baseline `main`: `7da39fab4381b1671527108d01d8736de51c63f4`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 1 merge: PR #5214 / `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Fase 2 merge: PR #5215 / `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Fase 3 merge: PR #5216 / `809c53eb40cb489cc77ef4b6ae6fceb5fdd90364`
- Fase 4 merge: PR #5218 / `7da39fab4381b1671527108d01d8736de51c63f4`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Fase 1: `reports/place-production/youngstorget-phase1-identity-source-v1.md`
- Fase 2 source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Fase 2 review: `reports/place-production/youngstorget-phase2-content-factory-source-pack-v1.md`
- Fase 3: `reports/place-production/youngstorget-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4: `reports/place-production/youngstorget-phase4-fagverk-audit-v1.md`
- Fase 5 production packet: `data/places/production/youngstorget.json`
- Fase 5 review: `reports/place-production/youngstorget-phase5-description-review-v1.md`
- Klynge: Torggata → Youngstorget → Storgata / Brugata–Storgata
- Referanse-/ankersted: `torggata` – skal ikke produseres på nytt i Pilot 01
- Første fullproduksjonsmål: `youngstorget`

## Canonical identitet

Youngstorget-place representerer **selve det navngitte offentlige torget/byrommet fra anlegget i 1846 og fram til dagens plass**, ikke bygg, virksomheter, organisasjoner, scener eller gater rundt torget.

Tre tidsfakta er låst separat:

- 1846: torget ble anlagt/etablert;
- 1852–1951: offisielt navn `Nytorvet`;
- 1951: `Youngstorget` ble offisielt navn.

Nære egne Places som ikke skal brukes som proxy for Youngstorget omfatter minst `folkets_hus_oslo`, `folketeateret`, `mollergata_19`, `torggata`, `storgata` og `brugata_storgata_rusmiljo`.

`year: 1852` beholdes som eksisterende representativ navnemilepæl. Production packet låser samtidig `identity.period: 1846–`, og synlig tekst skiller anlegget i 1846 fra navnemilepælene i 1852 og 1951.

## Fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5213 |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5214; identity/source-owner/own-place-grense låst |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | PR #5215; 12-source registry, scoped claims, relations, held-backs, freshness og gaps |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5216; `verified_geometry`, `osm-relation:12773689`; ingen ny geokoding |
| 4. Kategori, Badges, emner og Fagverk | **ALLEREDE FERDIG OG MERGET** | PR #5218; `politikk`, to underbadges og tre `em_pol_*` består place-/runtime-/Fagverk-gatene |
| 5. `desc` + `popupDesc` | **PRODUSERT PÅ AKTIV BRANCH – KLAR FOR CI/VALIDATOR** | v4.2-pakke, 17/17 verified claims, 3/3 + 26/26 sentence coverage; 1846/1852-regresjonen rettet |
| 6. Strukturerte place-profiler | **NESTE ETTER FASE-5-MERGE** | temporal/spatial/history materialiseres bare der source packen gir substans |
| 7. Popupfaner | **IKKE STARTET** | hver fane får separat review; fase-5 Om-tekst er produsert men tab-level QA er ikke lukket |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke dagens 4+1-kontrakt |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | fire mappings finnes; place-eierskap må dokumenteres |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | bilder er et kjent faktisk hull |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Aktiv fase

På denne branchen er **fase 5 den eneste aktive fasen**.

Canonical `desc` og `popupDesc` er produsert fra source/claim-pakken, og `data/places/production/youngstorget.json` er opprettet som v4.2-kandidat. Ingen andre canonical subsystemer er sanert eller produsert i samme fase.

Fase 5 kan bare klassifiseres `FERDIG` dersom repoets v4.2-validator og relevante CI-porter er grønne. Etter merge skal ny branch opprettes fra fersk `main`, og bare **fase 6 – strukturerte place-profiler** skal være aktiv.

## Fase 5 – description-produksjon

### Synlig omfang

- `desc`: **55 ord / 3 setninger**;
- `popupDesc`: **421 ord / 6 avsnitt / 26 setninger**;
- production packet: **17/17 verified claims**;
- `desc` sentence coverage: **3/3**;
- `popupDesc` sentence coverage: **26/26**.

### Faktakorreksjon

Den gamle teksten sa at Youngstorget «ble anlagt som Nytorvet i 1852». Dette er nå rettet i synlig tekst:

- anlegg/etablering = 1846;
- Nytorvet som offisielt navn = 1852–1951;
- Youngstorget som offisielt navn = 1951.

### Innholdsankere

Den nye teksten bygger på konkrete Youngstorget-fakta og stedselementer: tidlig marked/kveghandel, basaren, arbeiderbevegelsens mobilisering, 1. mai 1890, massemøter i mellomkrigstiden, Pioneren, fredsmonumentet, den permanente historiske fotoutstillingen, 1990-talls/1996-omforming, kommunale tiltak og dokumenterte 2026-hendelser.

### Sanert fra description-flaten

- meta som «markøren gjelder» og «På stedet kan History Go ...»;
- generisk scene-/lyd-/vakt-/presseforklaring uten place-spesifikk kilde;
- generell demokratiteori som ikke er Youngstorget-fakta;
- proxyargumentasjon basert på nabobygg;
- udokumenterte generelle mediepåstander.

Det legitime Fagverk-emnet `em_pol_mediert_offentlighet` beholdes fra fase 4, men gir ikke blankofullmakt til å skrive udokumentert medieteori i `popupDesc`.

### Strong/freshness-port

Source packens tilbakeholdte «første»-claims for 1890, 1898 og 1956 er **ikke** publisert i description-teksten.

Nåtidsclaims fra Oslo kommune er verifisert 2026-08-23. Konkrete 8. mars og 1. mai 2026-hendelser er behandlet som datofestet historikk, ikke som løfter om framtidig gjentakelse. Planlagte framtidstiltak er holdt ute av den langsiktige description-flaten og skal eventuelt eies av senere Nyheter/current-status med ferskhetsport.

## Description-kvalitetsporter

- `name-swap`: **PASS**;
- `cross-place duplicate`: **PASS**;
- `place-specific evidence anchors`: **PASS**;
- `source → claim → text`: **PASS på packet-nivå, teknisk validator gjenstår**;
- `local experience`: **PASS**;
- `fullness`: **PASS for description-fasen**.

Teksten kan ikke flyttes til et annet torg ved å bytte stedsnavn: den er bundet til Youngstorgets årstall, navn, marked, 1890-rute, Pioneren, fredsmonument, fotoutstilling, 1996-omforming og konkrete gategrenser.

## Content Factory-resultat så langt

Shared source pack har:

- **12 registrerte kilder**;
- **2 kilder/proveniens direkte gjenbrukt** fra eksisterende History GO-arbeid;
- **10 nye eksterne kilder** lagt til cluster-pakken;
- **5 scope-ugyldige/generiske claim-kandidater** eksplisitt avvist;
- coordinate-subsystem bevart uten ny research/geokoding;
- category/badge/emne/Fagverk bevart uten ny modell-/fagproduksjon;
- én kontrollert Youngstorget-researchpass gjenbrukt i description, history/object/current-use/before-after/quiz/relations-forberedelse gjennom claim-banken.

Dette er arbeids-/gjenbruksmåling, **aldri kvalitet, richness eller ferdigstatus**.

## Scope-gater som fortsatt gjelder

- TØI Torggata/Brugata → `youngstorget`: **NEI**.
- TØI Brugata → `brugata_storgata_rusmiljo`: **NEI**.
- Storgata-byhistorie → `youngstorget`: **NEI** uten eksplisitt relasjonsclaim.
- `street:brugata` → ny bare-`brugata` Place: **NEI**; canonical eier er ikke bevist.
- nabobygg/virksomhet → Youngstorget People/Brands/Stories: **NEI** ved nærhet alene.

## Kjente behold-punkter etter fase 5

- canonical ID/source `youngstorget`;
- verified geometry;
- `category: politikk`;
- `underbadge_ids: arbeiderbevegelse, aktivisme_og_protest`;
- de tre eksisterende `em_pol_*`-koblingene og Fagverk-runtime;
- ny claim-sporet `desc`/`popupDesc`, forutsatt grønn v4.2-validator;
- eksisterende quiz, Stories, People og Lesespor som baseline, ikke automatisk ferdigstatus;
- eksisterende Brands som kandidater, ikke automatisk godkjent place-eierskap.

## Kjente hull / regressions etter fase 5

1. Strukturerte temporal/spatial/history-profiler er ikke materialisert etter dagens source pack.
2. Popup/Historie og de øvrige popupfanene mangler separat tab-level review.
3. Før/etter mangler; 1990-talls/1996-researchspor finnes, men assetpar/rettigheter mangler.
4. Kilder/source_summary mangler som komplett brukerflate.
5. Bilder mangler som godkjente place-assets/proveniens.
6. Canonical Objects mangler; Pioneren, Fredsmonumentet, fontenen og basaren er kandidater som må ID-/eierskapsauditeres.
7. Rundingssettet er legacy og må migreres til 4+1 uten filler.
8. Brands må own-place-auditeres.
9. People må own-place-, profile-, image- og runtime-auditeres; ≥22 er bare baseline.
10. Språk må vurderes eksplisitt, ikke automatisk N/A.
11. Nyheter/current-status må ferskkontrolleres før godkjenning.
12. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
13. Sterke «første»-claims krever uavhengig ekstra kilde dersom de senere skal publiseres.
14. Legacy `layers.populaerkultur`, tags/knagger og andre medieflater er ikke sanert i fase 5; de må gjennom sin eierfase i stedet for å blandes inn i description-jobben.

## Popupstatus

| Fane | Status |
| --- | --- |
| Om | **DESCRIPTION-INNHOLD PRODUSERT – TAB-LEVEL QA I FASE 7 GJENSTÅR** |
| Historie | **RIK CLAIM-BASE FINNES – EGEN HISTORIESTRUKTUR/TAB-QA GJENSTÅR** |
| Fortellinger | **EKSISTERER – IKKE RE-AUDITERT** |
| Før/etter | **RESEARCHSPOR FUNNET – ASSETS/RETTIGHETER MANGLER** |
| Nyheter | **FERSKE 2026-KILDER FINNES – IKKE MATERIALISERT/GODKJENT** |
| Lesespor | **EKSISTERER – IKKE RE-AUDITERT** |
| Kilder | **SOURCE PACK FINNES – BRUKERFLATE IKKE FERDIG** |
| Språk | **IKKE VURDERT FERDIG** |
| Spor & objekter | **KANDIDATCLAIMS FINNES – CANONICAL OBJECT AUDIT MANGLER** |
| Andre direktefaner | **IKKE VURDERT FERDIG** |

## Pilotregel

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Hvis en senere checklistflate møter et evidensgap, er neste handling **mer Youngstorget-spesifikk research** — aldri kortere innhold, generisk fyll eller budsjettbegrunnet N/A.

Kvalitetsmålet står fast: **Youngstorget skal bli minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**