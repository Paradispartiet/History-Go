# Psykoteori – tverrgående pedagogisk og historisk kvalitetsrunde

**Dato:** 11. oktober 2026
**Utgangspunkt:** PR #6235 merget i `main`, 35 teorikort / 58 av 58 dekkede kanoniske emner / 70 ulike hypotetiske undervisningsscenarioer.
**Avgrensning:** Konsistens, lesbarhet, historisk kronologi, kildespor og regresjon i presentasjonsdata. Ikke fullstendig kontroll av 35 originalforskningstradisjoner eller en ny vitenskapelig godkjenningsrunde.

## Funn og retting

Katalogen hadde **25 kort med `teaching_view`** og **10 kort uten**. I `js/psychologyRoom.js` vises `teaching_view || theory`: for de ti uten kom full faglig `idea`, `method` og `limit` direkte i det ordinære kortet. Dette var en reell konsistens- og lesbarhetssvakhet, selv om kortene var lenket og teknisk gyldige.

**Endring:** Ti selvstendige korte sammendrag med `period`, `idea`, `method`, `limit` og 2–4 fremhevede, eksisterende kilde-URL-er. Alle ti har konkrete forskningshistoriske årstall. Underliggende fulltekst, kildebelegg, emnekoblinger, øvrige 25 sammendrag og interaksjon er bevart.

**Oppsummert per kapittel:**

| Kapittel | Teorikort | Har lesbar oppsummering etter endring |
| --- | ---: | ---: |
| `fagtradisjoner-teori-og-sinnet` | 9 | 9 |
| `kognisjon-folelser-og-atferd` | 5 | 5 |
| `utvikling-oppvekst-og-laring` | 5 | 5 |
| `sosialpsykologi-normalitet-og-stigma` | 4 | 4 |
| `traume-krise-resiliens-og-omsorg` | 5 | 5 |
| `psykisk-helse-institusjoner-og-behandling` | 7 | 7 |

**Oppdaterte kort:** `behaviorisme`, `kognitiv_psykologi`, `humanistisk_psykologi`, `femfaktormodellen`, `heuristikker`, `stressvurdering`, `sosial_laring`, `sosial_identitet`, `konformitet`, `biopsykososial_modell`.

## Kontroller på alle 35

- Kortene har entydige kanoniske ID-er og direkte kobling til de 58 emnene (uendret).
- Hvert kort har to atskilte, hypotetiske undervisningsscenarioer; 70 totalt.
- Alle 35 har en pedagogisk visning med fire unike, utfylte tekstfelt på 65–499 tegn hver.
- Alle 35 viser 2–4 prioriterte referanser, som finnes i det opprinnelige `reference_links`-registeret.
- Historikk er tidfestet; teoretiske modeller, observerte data, synteser og normativ veiledning holdes uttrykkelig fra hverandre i de ti nye tekstene.
- Alle `source_review_state` står fortsatt som `partial_historical_method_review`; ingen fullkildegodkjenning er utstedt.
- Ingen endring i data for History Go-kjerne, Civication, Psykologifagverket, brukerdata eller runtime.

## Kilde-stikkprøver

Bibliografiske originalankre ble kontrollert mot eksterne fag-/bibliotekregistre i denne runden:
- Peplau (1952), `Interpersonal Relations in Nursing`: https://openlibrary.org/books/OL6110775M/Interpersonal_relations_in_nursing (1952-utgave; ikke fulltekstkontroll).
- Caplan (1964), `Principles of Preventive Psychiatry`: https://wellcomecollection.org/works/mzxhk64x (1964-utgave; ikke fulltekstkontroll).
- Parsons (1951), `Illness and the Role of the Physician`: https://onlinelibrary.wiley.com/doi/10.1111/j.1939-0025.1951.tb00003.x (originaltidskrift og DOI).
- Flückiger mfl. (2018), `The Alliance in Adult Psychotherapy`: https://pubmed.ncbi.nlm.nih.gov/29792475/ (295 uavhengige studier, mer enn 30 000 personer; samvariasjon, ikke kausalitet).

Dette er **stikkprøver**, ikke verifisering av alle kildelenker eller alle påstander i 35 kort.

## Videre faglige forbedringspunkter

Tre opprinnelige, forskningsmetodisk omfattende kort har spesielt lange fulltekstfelt, men presenterer nå allerede korte oppsummeringer og trenger ingen ytterligere tekstkutting:
- `kognitiv_terapi`: metode 3203 tegn, begrensninger 3818 tegn. Bevar evidensgrunnlaget; oppsummeringen skal være inngangen.
- `tilknytning`: metode 3209 tegn, begrensninger 2902 tegn. Bevar evidensgrunnlaget; oppsummeringen skal være inngangen.
- `resiliens`: metode 2174 tegn, begrensninger 2224 tegn. Bevar evidensgrunnlaget; oppsummeringen skal være inngangen.

Kildeopplysningene på nye og gamle kort er fortsatt `partial_historical_method_review`, ikke `source_verified`. Neste vitenskapelige kontroll kan prioritere spesifikke original- og meta-analysepåstander etter risiko fremfor å blokkere ferdig undervisningsvisning med kjøp av fulltekster.

## Endelig kontroll

- Fullkatalogens pedagogiske visning valideres i Psykoteori-regresjonstestene, med 35/35 og dokumentert kildespor.
- Navigasjon og visning kontrolleres i eksisterende DOM-stubtest.
- Repository hygiene og Psykoteori skal være grønne før merge.
- Ingen endringer i antall teorikort, emnedekning, source-verification-tall eller scenarioer.

**Pedagogisk formkvalitet:** 35/35 sammenfattet. **Vitenskapelig sluttgodkjenning:** ikke gjennomført i denne runden.
