# Kontrakt for teknologisteder V1

## Formål

Denne kontrakten avgjør når et geografisk sted kan få et Teknologi-faglag innenfor History Gos primære kartkategori **Vitenskap**.

Et sted kvalifiserer ikke fordi et bygg, en tjeneste eller et bysystem bruker avansert utstyr. Teknologien selv må være det dokumenterte objektet for forskning, utvikling, produksjon, prøving, bevaring eller offentlig formidling på stedet.

## Obligatoriske porter

En kandidat må bestå alle portene:

1. **Primær teknologisk identitet**
   En konkret teknologi, artefakt, produksjonsprosess, laboratorium eller ingeniørvirksomhet er sentral for stedets faglige relevans.

2. **Fysisk anker**
   Kandidaten har et identifiserbart bygg, verksted, laboratorium, produksjonsanlegg, en samling tekniske artefakter eller en merket mikroplass.

3. **Stedsspesifikk kunnskap**
   Kjernepåstandene og quizmaterialet kan ikke flyttes uendret til et tilfeldig bygg.

4. **Evidens**
   Autoritative kilder dokumenterer både den teknologiske virksomheten og lokasjonen.

5. **Canonical fagkobling**
   Minst ett `em_tek_*`-emne beskriver den faktiske teknologien på stedet.

6. **Spillbart anker**
   En besøkende kan nå et legitimt offentlig ute- eller inneanker. Adgangsbegrensede laboratorier kan bare kvalifisere når stedskortet ikke antyder fri adgang til lukkede områder.

## Kategorigrense

- Primær stedskategori: `vitenskap`
- Teknologi som faglig og sekundært lag: `teknologi`
- Urban infrastruktur forblir under `by`

En stasjon, vei, tunnel, bro, transportterminal, et strømnett eller vannsystem er ikke et teknologistedsobjekt bare fordi det inneholder tekniske systemer. En fabrikk som utviklet eller produserte signalutstyr, kabler, radioer, sensorer eller maskiner kan kvalifisere fordi teknologiproduksjonen er stedets identitet.

## Automatisk avslag

Avvis:

- ordinære stasjoner og transportknutepunkter
- smarte bygg og ordinære kontorbygg
- hovedkontorer uten dokumentert utviklings- eller produksjonsanker
- universiteter og forskningsparker uten et konkret, offentlig identifiserbart laboratorium eller teknologistedsanker
- generell infrastruktur der hovedbetydningen er hvordan byen fungerer

## Kandidatstatuser

- `canonical_existing`: finnes allerede som canonical sted
- `approved_candidate`: evidensen er tilstrekkelig; koordinatproduksjon gjenstår
- `approved_microplace_candidate`: lite, merket oppfinnelses- eller utviklingssted
- `approved_candidate_access_review`: teknologisk gyldig, men tilgang og karttekst må begrenses
- `rejected`: består ikke alle obligatoriske porter
