# Grev Wedels plass – workcard

Status: `AKTIV – NULLMÅLING LÅST`

Branchgrunnlag: `agent/content-factory-pilot-03-grev-wedels-plass-v1` fra Bankplassen-merge `97e9e3c2` på `main`.

## 1. Eierskap

- Canonical enhet er park-/plassrommet `grev_wedels_plass`, ikke Gamle Logen, Militærhospitalet eller Akershus festning.
- Manifestet peker til én eksisterende stedsfil; ingen åpen PR eller aktiv branch eier stedet.
- Herman Wedel Jarlsberg er et direkte eponymanker gjennom navnet på plassen, men hans hoved-Place for 1814-biografien forblir Eidsvollsbygningen.
- Gamle Logen og Militærhospitalet mangler egne canonical Place-ID-er i dagens datasett. De kan ikke oppfinnes som relasjoner før eventuell separat onboarding.

## 2. Evidens

- Delt klyngepakke har syv Grev-spesifikke, verifiserte claims og én eksplisitt delt festningsclaim.
- Oslo byleksikon og Oppdag Kvadraturen dekker identitet, urealiserte statsplaner, parkåret 1869, bil-/krigsperioden og Militærhospitalets flytting.
- OSM way 33610051 er kontrollert som navngitt parkgeometri; adresse-/veitreff er avvist.
- «Kvinnetorso» fra 2026 må ferskverifiseres mot Selskabet for Oslo Byes Vel før det kan materialiseres som Object.

## 3. Nullmåling

| Område | Status | Reelt gap |
| --- | --- | --- |
| Canonical identitet/koordinat | `BEHOLD` | Eiergrense må skrives inn i produksjonspakke |
| `desc` / `popupDesc` | `REVIDER` | God grunntekst, men mangler claim-/setningsspor og nyere kunstlag |
| Kilder/media | `MANGLER` | Full kildeblokk, bildeattribusjon og frontImage-kontroll |
| Fagverk/Badge | `REVIDER` | Emner finnes; fungerende stedsside må auditeres |
| People | `REVIDER` | Herman Wedel Jarlsberg finnes, men profil/readiness og direkte samlingsflow må kontrolleres |
| Objects | `MANGLER` | «Kvinnetorso» og eventuelle øvrige fysiske spor må kvalifiseres uten filler |
| Brands | `BLOKKERT INNTIL EVIDENS` | Ingen virksomhet skal opprettes bare for å fylle den faste cellen |
| Related | `REVIDER` | Bare eksisterende canonical Places kan brukes |
| Quiz/Knowledge | `MANGLER` | Ingen quizfil, brief eller deterministisk kontekst |
| Rute/observasjon | `MANGLER` | Må bruke lesbare lag i selve parkrommet |
| PlaceCard | `MANGLER` | Fast én sirkel + tre rektangler må fylles med ærlige subsystemdata/fallback |
| Runtime/index/QA | `MANGLER` | Canonical index, place-open, mobil/desktop og CI |

## 4. Første produksjonsbeslutning

Neste checkpoint er evidens og canonical eiergrense. Innholdet skal ikke flyttes fra nabobygg til parkrommet, og den faste firefeltskomposisjonen skal ikke fylles med oppdiktede Brands eller parallelle bygg-ID-er. Runtime-kontrakten kan bruke ærlige kategori-/ikonfallbacker mens stedets faktiske People-, Objects- og Related-innhold produseres.
