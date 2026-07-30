# Historie — arbeiderbolig og arbeidsvandring V1

Status: **VALIDATED EVIDENCE BATCH**

Denne batchen kvalifiserer to teoriobjekter i `his_industri_arbeid_sosialhistorie`:

- `theory_his_arbeiderbolig_hushold_livsvilkar`
- `theory_his_arbeidsvandring_rekruttering`

Historie forblir eksplisitt `INCOMPLETE`. Batchen dokumenterer avgrensede fler-case-piloter og gjør ingen universell generalisering.

## Evidensløp

### Arbeiderbolig, hushold og livsvilkår

Nydalen dokumenterer at lange arbeidsdager og vanskelig transport gjorde nærhet mellom bolig og fabrikk viktig. Industrimiljøet omfattet arbeiderboliger, skoler og fritidstilbud. Grønvold dokumenterer at gårdens uthus og stabbur ble brukt som bolig for 82 arbeidere. Karoline Kristiansens arbeiderminne knytter hjemmearbeid før og etter skole til senere fabrikkarbeid og omsorg.

Kildene gir ikke grunnlag for å beregne trangboddhet, husleie, sanitærstandard eller komplette husholdsressurser. Boligtype og nærhet brukes derfor ikke som direkte mål på levestandard.

### Arbeidsvandring, rekruttering og arbeidskraft

Nydalen og Hjula dokumenterer rekruttering av engelske fagfolk for maskininstallasjon, drift og opplæring. I Nydalen ble flere værende i den tekniske staben, og Jameson-familien var knyttet til bedriften over flere generasjoner. Grønvold dokumenterer en annen mekanisme: vansker med å skaffe arbeidskraft i Nittedal bidro, sammen med transportkostnader, til at fabrikken flyttet til Østre Aker og innlosjerte arbeidere.

Bedriftenes begrunnelser dokumenterer ikke den enkelte arbeiders flyttemotiv, kontrakt, nettverk eller videre mobilitet.

## Produksjon

- 2 nye canonical claims
- 1 ny canonical kilde med eksplisitt proveniens og begrensninger
- 2 nye validerte place–claim–source-koblinger
- 3 utvidede, allerede validerte cases: Grønvold, Hjula og Nydalen
- 2 nye `evidence_ready` teoriobjekter
- korrigert teori-validator som bevarer alle stedskoblinger for claims med flere evidenslenker

## Stedsgrense

- `nydalen` brukes som verifisert områdeanker, ikke som koordinat for hver arbeiderbolig eller hvert hushold.
- `helsfyr` brukes som verifisert områdeanker for Grønvold, ikke som eksakt koordinat for uthus, stabbur eller den enkelte arbeiderbolig.
- `voienfossen` gjenbrukes som verifisert industriforankring for Hjula Væveri.

## Canonical filer

- `data/fag/historie/claims_historie_canonical_v1.json`
- `data/fag/historie/sources_historie_canonical_v1.json`
- `data/fag/historie/place_evidence_historie_v1.json`
- `data/fag/historie/theory_evidence_historie_canonical_v1.json`
- `data/fag/historie/source_dossiers/industry_housing_migration_v1.json`
- `data/fag/profiles/historie/oslo_akershus/profile.json`
