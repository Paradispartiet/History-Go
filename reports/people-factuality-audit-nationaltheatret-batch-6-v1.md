# People factuality audit — Nationaltheatret batch 6 v1

Kontrolldato: **2026-07-28**
Standard: `people_profile_v1.0`
Profiler: `axel_otto_normann`, `bab_christensen`, `bente_borsum`, `bjarte_hjelmeland`

## Avgrensning

Denne batchen er den første profilpiloten under `docs/PEOPLE_PROFILE_CANONICAL.md`. Arbeidet gjelder bare canonical People-data, claims, avledet People-readiness og Civication People-indeksen. Ingen Places-, coordinate-, quiz- eller fagfiler skal endres.

Eksisterende History GO-profiler og eldre tester ble behandlet som reparasjonsmål, ikke som faktakilder. Alle publiserte fakta er kontrollert påstand for påstand mot inspectable kilder og mappet i egne claims-filer.

## Axel Otto Normann

Kilder:

- Sceneweb: <https://sceneweb.no/nb/artist/19839/Axel_Otto%20Normann>
- Norsk biografisk leksikon: <https://nbl.snl.no/Axel_Otto_Normann>
- Store norske leksikon: <https://snl.no/Axel_Otto_Normann>

Publisert:

- fødsel 23. januar 1884 i Fredrikstad og død 8. mai 1962 i Oslo;
- journalist, redaktør, teaterkritiker og teatersjef;
- filologistudier ved universitetet i Kristiania uten avsluttende eksamen;
- teatersjef ved Nationaltheatret i 1935–1941 og 1945–1946;
- dokumentert avgang sommeren 1941 og tilbakekomst etter frigjøringen.

Profilen fjerner vurderingene «sterkt Nationaltheatret-anker», «kunstnerisk drift» og «offentlig legitimitet» fordi de ikke var claim-dekket.

## Bab Christensen

Kilder:

- Sceneweb: <https://sceneweb.no/nb/artist/38885/Bab_Christensen>
- Store norske leksikon: <https://snl.no/Bab_Christensen>

Publisert:

- identiteten Barbra Karine Christensen / Barbra Karine Kolstad, kjent som Bab Christensen;
- fødsel 8. januar 1928 i Oslo og død 10. april 2017 i Oslo;
- elev ved Nationaltheatret i 1947;
- ansettelsesperiodene ved Den Nationale Scene, Nationaltheatret og Det Norske Teatret;
- tre daterte Nationaltheatret-produksjoner: `Ung rett`, `Reisen til Julestjernen` og `Søsken`.

Familierelasjoner og ordet «gjennombrudd» er utelatt fordi de ikke er nødvendige for denne stedstilknytningen og ikke skal brukes som fyll.

## Bente Børsum

Kilder:

- Sceneweb personpost: <https://sceneweb.no/nb/artist/21223/Bente_B%C3%B8rsum>
- Sceneweb, `Tornerose` (1958): <https://sceneweb.no/nb/production/17081/Tornerose>
- Sceneweb, `Don Juan` (2017): <https://sceneweb.no/nb/production/69203/Don_Juan>
- Store norske leksikon: <https://snl.no/Bente_Børsum>

### Kildekonflikt

Sceneweb daterer `Finn veien, engel` til 4. desember 1958 og `Tornerose` til 26. desember 1958. Scenewebs produksjonspost for `Tornerose` omtaler rollen som Børsums debut som skuespiller. Store norske leksikon plasserer de samme tidlige elevrollene ved Nationaltheatret i 1959.

Konflikten er lagret som `early_roles_year_conflict` med beslutningen `prefer_primary_source`. Profilen publiserer Scenewebs konkrete produksjonsdatoer og gjør uenigheten synlig i `popupDesc`; den velger ikke 1959 som ubestridt år.

Publisert ellers:

- fødsel 21. juni 1934 i Oslo;
- skuespillerlinjen ved Statens Teaterhøgskole i 1958;
- dokumenterte roller i `Finn veien, engel`, `Tornerose` og `Don Juan`.

## Bjarte Hjelmeland

Kilder:

- Sceneweb personpost: <https://sceneweb.no/nb/artist/16291/Bjarte_Hjelmeland>
- Sceneweb, `Hærmennene på Helgeland` (1991): <https://sceneweb.no/nb/production/43226/H%C3%A6rmennene_p%C3%A5%20Helgeland>
- Sceneweb, `Jeppe på bjerget` (2003): <https://sceneweb.no/nb/production/32080/Jeppe_p%C3%A5%20bjerget>
- Sceneweb, `Ungen` (2014): <https://sceneweb.no/nb/production/42356/Ungen>
- Store norske leksikon: <https://snl.no/Bjarte_Hjelmeland>

Publisert:

- fødsel 24. februar 1970 i Bergen;
- yrkesfunksjonene skuespiller, regissør og sanger;
- Statens Teaterhøgskole 1988–1991;
- fast ansettelse ved Nationaltheatret 1991–2020;
- konkrete bidrag i `Hærmennene på Helgeland`, `Jeppe på bjerget` og `Ungen`.

Nåværende verv ved andre teatre er ikke tatt inn. Batchen trenger derfor ingen løpende nåtidsclaim om ansettelsessted eller lederrolle.

## Ferdigstatus

Alle fire profiler har:

- `profileStandard: people_profile_v1.0`;
- `profileStatus: ready_people_v1`;
- egen claims-fil;
- verifisert identitet;
- felt–claim-paritet;
- setning–claim-paritet;
- bestått faktareview og redaksjonell review;
- ingen faste krav til antall utdanninger, verk, temaer, avsnitt eller kilder.

En kort, korrekt profil er tillatt. Ingen profil er utvidet bare for å oppnå visuell fylde eller readiness-poeng.
