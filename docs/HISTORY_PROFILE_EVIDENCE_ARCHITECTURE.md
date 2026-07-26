# Historie — geografiske profiler og evidensarkitektur

Status: **canonical implementasjonskontrakt**  
Eier: Historie geografisk produksjon og evidenslag  
Sist kontrollert: **2026-07-26**

Denne kontrakten realiserer skillet i [SUBJECT_FILE_CONTRACT.md](SUBJECT_FILE_CONTRACT.md): universelle fagobjekter eier faglig identitet, mens geografiske profiler eier konkrete cases, claims, kilder og stedsevidens.

## 1. Aktiv struktur

```text
data/fag/historie/
  case_requirements_historie_canonical_v1.json
  claims_historie_canonical_v1.json
  sources_historie_canonical_v1.json
  place_evidence_historie_v1.json

data/fag/profiles/
  manifest.json
  historie/oslo_akershus/profile.json
```

## 2. Casekrav i universelle emner

Alle Historie-emner refererer til fire universelle krav:

1. avgrenset kronologisk forløp;
2. aktører, interesser og konflikt;
3. sammenlignbare kildetyper;
4. sammenligning på tvers av skala.

Casekravene er ikke steder og beviser ikke lokal dekning. En geografisk profil må realisere kravene med konkrete, kildebelagte cases.

## 3. Geografisk profil

Profilen lagrer:

- geografi-ID og canonical fagversjon;
- lokale casekandidater;
- emne–case-mappings;
- migreringsstatus og evidensstatus;
- mål for geografisk produksjonsdekning.

De tidligere `recommended_oslo_cases`-feltene er compatibility-data som migreres hit og fjernes fra universelle emner.

## 4. Claim-register

Et claim skal ha:

- stabil `claim_id`;
- eksplisitt påstand og claim-type;
- geografisk og tidsmessig scope;
- canonical emne-ID-er;
- kilde-ID-er;
- confidence og eksplisitt usikkerhet;
- alternativ fortolkning, caveat eller dokumentert konflikt.

## 5. Kilderegister

En kilde skal ha:

- stabil `source_id`;
- type, tittel, utgiver og URL;
- datering og proveniens;
- geografisk og tidsmessig scope;
- minst to begrensninger;
- eksplisitt kvalitetsvurdering.

## 6. Sted–emne–claim–evidens

Evidensregisteret binder sammen:

```text
place_id
  -> case_id
  -> emne_id
  -> claim_id
  -> source_id
```

En fil eller URL alene gjør ikke en teori eller et case evidensklart. Koblingen må passere referanse-, proveniens- og begrensningskontroll.

## 7. Pilot og produksjonsstatus

Oslo rådhus er første validerte pilotkjede. De migrerte Oslo/Akershus-casene er bevart som `legacy_profile_candidate` og regnes ikke som evidensklare før place-ID, claims og kilder er validert.

Den universelle fagmatrisen måler ikke lenger om Oslo har to dedikerte universelle emner. Oslo/Akershus måles i en separat geografisk profilrapport.

## 8. Permanente porter

- `node tools/validate-historie-profile-evidence.mjs`
- `node tools/audit-historie-geographic-profile.mjs --check`
- `node tools/audit-historie-universal-coverage.mjs --check`
- `node tools/audit-historie-v5-5-quality-depth.mjs`

Teoriobjekter skal fortsatt ha `evidence_ready=false` til hele den relevante claim–source–evidence-kjeden er validert, ikke bare pilotregistrene finnes.
