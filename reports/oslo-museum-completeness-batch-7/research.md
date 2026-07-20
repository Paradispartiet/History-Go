# Oslo museum completeness batch 7 — research audit

Date: 2026-07-20

## Scope

This batch audits:

1. Roseslottet
2. Det Internasjonale Barnekunstmuseet
3. Nasjonalmuseet – Arkitektur

The audit distinguishes permanent places, temporarily closed institutions and time-limited installations.

## 1. Roseslottet

### Existing-place audit

No canonical `roseslottet` record was found on current `main`.

The installation is a substantial, independently visitable art and memory site near Frognerseteren. It is not the same physical destination as Holmenkollen nasjonalanlegg, Korketrekkeren or Frognerseteren station.

### Current status

Roseslottet is open to visitors in 2026. Its official site states that the installation opened in 2020 and is planned to remain through the end of 2026.

### Source basis

Official sources:
- https://roseslottet.no/
- https://roseslottet.no/priser-og-apningstider/
- https://roseslottet.no/omvisning-med-guide/

The official site locates the entrance approximately 50 metres from Frognerseteren T-banestasjon.

### Representation decision

**Create one canonical candidate: `roseslottet`.**

The record must explicitly model Roseslottet as a time-limited installation rather than an assumed permanent institution. It should carry review/validity metadata tied to the announced end of 2026 so that the map does not silently present the installation as permanent after its planned lifetime.

Status: **APPROVED FOR COORDINATE INTAKE WITH TIME-LIMITED-SITE METADATA.**

Coordinate method: use a verified public entrance/site anchor from an authoritative or cross-checked site source. Do not use the coordinate of Frognerseteren station merely because the official description says the installation is nearby.

## 2. Det Internasjonale Barnekunstmuseet

### Existing-place audit

No canonical Barnekunstmuseum record was found on current `main`.

The museum is a long-established physical institution in a three-storey villa at Lille Frøens vei 4 and has operated since 1986.

### Current status

The museum's own current site states that ordinary opening hours have been suspended since 8 December 2025 after the loss of annual state operating support from 2026. The closure is not presented as a definitive permanent dissolution: the institution says normal operations may resume if funding is restored.

### Source basis

Official sources:
- https://barnekunst.no/
- https://barnekunst.no/besok-oss/

Address: Lille Frøens vei 4, 0371 Oslo.

### Representation decision

**Create one canonical candidate: `det_internasjonale_barnekunstmuseet`.**

The physical institution and its decades-long history justify a place record, but the current visitor status must be explicit. The record must not advertise normal opening while the museum is closed and should carry a status-review requirement rather than a fabricated reopening date.

Status: **APPROVED FOR COORDINATE INTAKE WITH TEMPORARILY-CLOSED / REOPENING-UNCERTAIN METADATA.**

Coordinate method: normative address-first query for `Lille Frøens vei 4 Oslo`, followed by verification of the museum villa.

## 3. Nasjonalmuseet – Arkitektur

### Existing-place audit

The physical museum site at Bankplassen 3 is already canonical as `grunnlovsbygget_bankplassen`, displayed as `Den gamle Norges Bank`.

The existing record correctly identifies:
- the former Norges Bank building by Christian H. Grosch;
- the address Bankplassen 3;
- the current use as Nasjonalmuseet – Arkitektur;
- the museum's 2008 opening in the restored historic building with Sverre Fehn's new exhibition pavilion;
- a verified Geonorge building coordinate.

Creating a second canonical museum marker at the same building would duplicate an already well-modeled physical place.

### Source basis

Official Nasjonalmuseet material continues to identify the architecture venue and its Bankplassen complex, including the former Norges Bank building and the Sverre Fehn intervention.

Official sources:
- https://www.nasjonalmuseet.no/besok/visningssteder/nasjonalmuseet_arkitektur/
- https://www.nasjonalmuseet.no/besok/visningssteder/nasjonalmuseet_arkitektur/norsk-arkitekturmuseums-historie/

### Representation decision

**Do not create a new `nasjonalmuseet_arkitektur` marker.**

Retain `grunnlovsbygget_bankplassen` as the canonical physical building. Museum-specific content can be expanded as a layer if future content production requires it, but the place identity is already present.

Status: **ALREADY REPRESENTED THROUGH EXISTING CANONICAL BUILDING.**

## Batch result

| Candidate | Decision |
| --- | --- |
| Roseslottet | New canonical `roseslottet`; time-limited through announced end of 2026 |
| Det Internasjonale Barnekunstmuseet | New canonical candidate; currently closed with uncertain reopening |
| Nasjonalmuseet – Arkitektur | No new marker; already represented at `grunnlovsbygget_bankplassen` |

This batch produces two status-sensitive coordinate-intake candidates and prevents one duplicate marker at Bankplassen 3.
