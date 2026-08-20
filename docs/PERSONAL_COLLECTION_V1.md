# History Go — Min samling v1

Status: canonical personlig samlingsflate  
Hovedflate: `profile.html`  
Kunnskapsflate: `knowledge.html`  
Designlag: `css/personal-collection-v1.css`

## Formål

`profile.html` er brukerens **Min samling**. Det er ikke en ny database eller et nytt domene. Flaten samler eksisterende personlige History Go-signaler i én brukerrettet opplevelse:

- besøkte/låste Places;
- canonical Knowledge V2;
- innsamlede personer;
- merker/meritter;
- egne notater og refleksjoner;
- etablerte sekundærlag som Spill og Social Meet.

## Canonical eierskap

Min samling oppretter ingen ny localStorage-key eller collection-store.

| Innhold | Canonical kilde |
| --- | --- |
| Steder | `visited_places` + canonical Place-data |
| Kunnskap | `HGKnowledgeV2` / `hg_knowledge_entries_v2` |
| Personer | `people_collected` + canonical People-data |
| Merker | eksisterende badges/`merits_by_category` |
| Egne bidrag | eksisterende notatsystem / `hg_user_notes_v1` |
| Next Up | eksisterende Next Up-runtime og lagrede Next Up-signaler |
| AHA | eksisterende `aha_import_payload_v1` |

Presentasjonslaget kan telle, gruppere og vise relasjoner som allerede finnes i canonical data. Det skal ikke konstruere nye faglige påstander.

## Next Up — hard produktregel

Den autoritative Next Up-handlingsflaten er fortsatt footer-popupen på hovedkartet:

- runtime: `js/nextUpRuntime.js`;
- knapp: `#pcNextUpBtn` / `➜`;
- panel: `#footerNextUpPanel`;
- forslag og handlinger rendres av `renderNextUpV2()`.

Profilsiden skal **ikke** ha en konkurrerende forslagsliste. `Fortsett reisen` på Min samling er bare en kompakt status/returflate. `index.html?nextup=1` behandles av `js/ui/personal-collection-map-bridge.js`, som åpner den eksisterende footer-popupen når hovedruntime er klar.

## Kunnskap

`knowledge.html` er den ene canonical brukerrettede Knowledge V2-flaten. Den klassiske `knowledge-profile.html` beholdes kun som kompatibilitets-redirect.

Knowledge skal fortsatt kunne browses etter:

- fag;
- emner;
- begreper;
- samlingsfasetter, som `collection_kind: "language"`;
- søk.

En Knowledge-enhet viser tilgjengelig provenance, blant annet:

- faktisk `subject_id` / fag;
- Place-ID;
- canonical kildefil;
- atlasprofil og `feature_evidence` når enheten kommer fra Språkatlas;
- tids-/verifiseringsdata når de finnes;
- HTTPS-kilder.

`index.html?collectionPlace=<place_id>` går gjennom det samme kart-bridge-laget og åpner canonical Place via `HGMapView.openPlace()` når tilgjengelig.

## Sammenhenger

Oversikten fremhever klikkbare, faktiske relasjonsstier i brukerens samling. Den bruker konservativt eksplisitte Place-/Person-ID-er, Knowledge V2-fagkobling og et opptjent merit med samme canonical fag-/kategori-ID. Dette er en presentasjon av provenance, ikke en ny relasjonsdatabase.

En sti kan derfor vise deler av:

- sted;
- eksplisitt relatert person;
- kunnskapsenhet;
- fag;
- opptjent merke.

Manglende ledd skjules. Flaten fyller aldri et hull med nærhet, navnelikhet eller geografisk/faglig gjetning. Alle synlige noder kan åpnes i den eksisterende Place-, Person-, Knowledge- eller merkevisningen.

Knowledge-enheter viser alle eksplisitte Place-ID-er og Person-ID-er som finnes i enhetens canonical felter. `Utforsk sammenhenger` returnerer til den filtrerte stien på Min samling.

## Nylig samlet og biblioteker

`Nylig samlet` viser siste tilgjengelige objekt fra hver av de fire canonical delene: sted, person, kunnskap og merke. Når lagret tid finnes brukes den; ellers brukes den eksisterende, stabile rekkefølgen i eierens datastruktur. Det opprettes ingen aktivitetslogg for å drive seksjonen.

Personer og merker har søkbare bibliotekflater. Objektklikk gjenbruker eksisterende Person-popup og merke-modal. Stedssamlingen viser geografiske delsummer bare fra eksplisitt by-, kommune-, region- eller landsmetadata på canonical Place.

## AHA

`Utforsk samlingen min med AHA` gjenbruker eksisterende:

- `exportHistoryGoData()`;
- `HistoryGoAHAAuth`;
- `aha_import_payload_v1`.

Det finnes ingen separat `personal_collection`-, `profile_collection`- eller Språkatlas→AHA-eksport.

## Design

Min samling og Knowledge bruker samme personlige designspråk:

- mørk, rolig bakgrunn;
- nøytrale flater og diskrete borders;
- lys typografi;
- myk grønn/mint som generell interaksjonsaccent;
- fagfarger kan fortsatt brukes når fargen har semantisk betydning;
- History Go-gult er ikke global accent på disse flatene.

Profilkartets samlingsmarkør og alle legacy-detaljer som fortsatt kan vises inne på profilflaten overstyres til samme mint-/graphite-språk. Den kompakte gamle identitetsheaderen er fjernet; navn, samlingstall, kart og AHA ligger i collection-heroen, mens toppbaren bare håndterer global navigasjon og kontovalg.

Spill, Social Meet og profil/personvern beholdes, men ligger sekundært under `Mer` i den brukerrettede navigasjonen.

## Regresjonskrav

Permanent test skal låse at:

1. `profile.html` er `Min samling`;
2. ingen ny personlig collection-store opprettes;
3. Knowledge V2 forblir canonical kunnskapskilde;
4. `knowledge-profile.html` leder til `knowledge.html`;
5. Knowledge støtter både `language_lexicon` og `language_atlas` provenance;
6. Next Up-forslag eies av footer-popupen, ikke profilsiden;
7. retur til Next Up bruker den eksisterende `#pcNextUpBtn` / `#footerNextUpPanel`;
8. AHA-grensen gjenbrukes uten ny eksportkontrakt;
9. Social Meet/personvernkontraktene bevares;
10. den nye personlige designflaten bruker ikke History Go-gult som global accent.
11. `Nylig samlet` leser de fire eksisterende canonical eierne;
12. relasjonsstier bruker bare eksplisitte ID-er;
13. Person- og merkebibliotek åpner eksisterende objektvisninger;
14. profilkartets markør bruker Min samling-accenten.
