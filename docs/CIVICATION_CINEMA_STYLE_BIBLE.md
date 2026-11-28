# Civication Cinema – nordisk miniatyrrealisme

**Milepæl M-CINEMA-01 · 28. november 2026 · vedtatt kunstnerisk retning.**

Eier: Civication. Status: stilbeslutning dokumentert; filmproduksjon, medieintegrasjon og visuell akseptanse gjenstår. Arbeidstittelen «nordisk miniatyrrealisme» betegner Civications egen identitet, ikke en påstand om en etablert filmgenre.

## 1. Produktbeslutningen

Civication skal kunne oppleves som en sammenhengende interaktiv animasjonsserie. Alle eksisterende og fremtidige fortellingsscener er på sikt kandidater for egne korte filmer. Den visuelle hovedreferansen er *Anomalisa* (2015): taktil stop-motion, håndlagde menneskedukker, fysisk troverdige miniatyrkulisser og tilbakeholden hverdagsdramatikk. Referansen angir kunstneriske prinsipper; Civication skal ha egne karakterer, egne kulisser, egen komposisjon og egen identitet. Ingen kopiering av filmens karakterer, scenebilder, særskilte ansiktsdesign, lydspor eller materiale.

Civication Classic, Audio og Cinema er tre presentasjoner av samme liv, ikke tre separate spill. Spilleren kan bytte modus uten tap av progresjon. Den eksisterende Runner, kalenderen, innboksen, økonomien, relasjonene og lagringen beholder autoritet. Film eller lyd kan aldri tildele et valg, opptjening eller dagskifte automatisk. Spilleren svarer med samme eksisterende svarboks, eventuelt ved å si bare A, B, C osv. Håndfri er et eksplisitt, frivillig valg.

## 2. Visuell identitet – bindende produksjonsregler

| Område | Standard |
| --- | --- |
| Mennesker | Håndlagde menneskedukker med troverdige proporsjoner, lett synlig materialstruktur, egenartede ansikter og diskrete gester. Ikke karikatur, glatt plast eller fotorealistiske digitale mennesker. |
| Kulisser | Fysisk troverdig miniatyr-Oslo: leiligheter, kafeer, kontorer, trikker, gater, butikker og institusjoner. Gjenbruk samme rom og rekvisitter. |
| Materialer | Matt tre, papp, tekstil, modellmaling, gips, støvete glass og andre taktile overflater. Små, kontrollerte ujevnheter gir følelsen av håndverk. |
| Farge | Dempet stein, koksgrå, støvet grønt, tregrå og havblå; sparsomme varme lyskilder. Ingen neon, blanke plastflater eller generisk reklameestetikk. |
| Lys | Naturlig nordisk vinduslys, kjølig dag, varmt interiør, troverdig kvelds- og nattlys. Følg kanonisk spillfase, ikke enhetens klokke. |
| Kamera | Rolige, motiverte utsnitt. Nærbilder av ansikt, hender og hverdagsobjekter; øyehøyde og små kamerabevegelser. Begrens overdreven bokeh, dramatisk kamerarystelse og effekter. |
| Bevegelse | Kontrollert stop-motion-følelse, små pauser, tilbakeholdne uttrykk og fysisk kontakt med gjenstander. Bevegelse skal tjene handlingen, ikke demonstrere teknologi. |
| Lyd | Samme forteller og karakteridentiteter på tvers av scener. Subtile situasjonslyder, rom og stillhet. Dialog og fortellerstemme har prioritet; lyder stopper før mikrofonen lytter. |
| Tekst og UI | Ingen innbrent tekst, logo, svarbokser eller grafikk i selve filmen. Undertekster og valg ligger i tilgjengelig separat UI. |

Ingen generiske AI-filmklipp, tilfeldig karakterbytte, visuell stilblanding, ubegrunnet miljøskifte, overdreven animasjon eller tilfeldig kameraføring. Hver scene skal se ut som en del av den samme serien. Karakterer skal ikke etterligne virkelige personers identitet eller stemme uten relevant rettighetsgrunnlag.

## 3. Før produksjon: fast bibliotek

- **Karakterregister:** stabil character_id, rolle, godkjent front/profil/trekvart, proporsjoner, ansikt, hår, klær, materialer, farger, kroppsspråk, stemme-ID og kontinuitetsnotater. Flere antrekk kan finnes, men skal være begrunnet i historien.
- **Kulisseregister:** stabil set_id, stedskobling, plantegning, kameraakser, målestokk, møbler, rekvisitter, materialer og godkjente lysvarianter for morgen/dag/kveld/natt.
- **Rekvisittregister:** gjenbrukbare hverdagsobjekter med stabil asset_id og utforming.
- **Visuell pilot:** godkjente stillbilder av samme karakter i minst to utsnitt, samme rom i minst to lysfaser og en kort sekvens med kontinuitet. Ingen masseproduksjon før denne helheten er vurdert.

Kartets eksisterende miniatyrverden er byens oversiktsnivå; Cinema er det menneskelige nærbildet av den samme verdenen. Steds-ID-er, kanonisk fase og visuell identitet deles, men filmene skal ikke erstatte kartets navigasjon.

## 4. Scene- og mediekontrakt

Forslag til separat, deklarativt medieregister knyttet til eksisterende kanoniske scene-ID-er. Dette er en designkontrakt, ikke et ferdig API eller implementert datasett.

| Felt | Betydning |
| --- | --- |
| scene_id | Eksisterende kanonisk scene, aldri en ny spillscene opprettet av mediet. |
| variant_id | Valgfri betinget variant, kun når kildescenen faktisk skiller mellom tilstander. |
| character_ids / set_id | Godkjente referanser til karakter- og kulisseregister. |
| phase / shot_list | Spillets fase og avledet produksjonsplan. |
| source_revision | Versjon av forfattet scene som filmen bygger på. |
| poster / video / captions | Mediereferanser; undertekst separat. |
| duration / language / audio | Varighet, språk og lydspor. |
| status / approval | planned, storyboarded, produced, reviewed, approved; rettigheter og kontinuitet dokumenteres. |

Film er et valgfritt presentasjonslag. Manglende, foreldet, mislykket eller utilgjengelig mediefil gir trygg fallback til Audio eller Classic. Bare godkjent media som samsvarer med aktuell scenevariant kan avspilles. Filmens slutt viser eksisterende valg; konsekvens og neste scene hentes fra spillmotoren etter faktisk akseptert svar. Ingen forhåndsinnspilt konsekvens må vises hvis den ikke samsvarer med valgt handling. Lesbarhet, undertekster, berøring, avspilling, pause, gjenta og lydavslutning ved mikrofonbruk skal bevares. Begrens forhåndslasting og medievekt for mobil/iPad; lagrings- og distribusjonsløsning er ikke valgt.

## 5. Produksjonsløp

1. Stilmanual, karakter- og kulisseregister, godkjent visuell pilot.
2. Film 1.0: kontrollerte stillbilder med enkle, motiverte bevegelser og eksisterende Audio.
3. Film 2.0: korte stop-motion-inspirerte levende klipp (typisk 5–30 sekunder) med valg etter avspilling.
4. Film 3.0: sammenhengende rollebesetning, dialog, lyd, kontinuitet, konsekvensvarianter og systematisk dekning av eksisterende scener.
5. Film 4.0: helhetlig interaktiv serie, der hele livsreisen kan oppleves i Cinema med fallback ved behov.

FilmWork kan på sikt være et produksjonsverksted for storyboard, shot-lister og kontinuitet. Integrasjon er en mulighet, ikke vedtatt avhengighet.

## 6. Akseptanse og milepælstatus

- **Vedtatt:** Civication Cinema som langsiktig medieform; nordisk miniatyrrealisme med *Anomalisa* som kunstnerisk hovedreferanse; ett sammenhengende univers; separate, valgfrie scene-medier; samme spill og bokstavstyring.
- **Gjenstår:** godkjenning av konkrete pilotbilder og karakter-/kulissedesign, registerskjema, medieproduksjon, avspiller, rettighetskontroll, distribusjon og fysisk iPad-test.
- **Pilotens port:** minst én komplett kanonisk scene med godkjent film/lyd, valg A/B/C, riktig konsekvens, modusskifte uten tap av data og fallback ved manglende media. Kontinuitet og visuell kvalitet vurderes før skalering.
- **Audio-status:** [PR #7574](https://github.com/Paradispartiet/History-Go/pull/7574) er separat utviklingsarbeid; denne dokumentasjonsmilepælen er ikke en bekreftelse på beståtte tester, publisert lydmodus eller ferdig Cinema.

Relatert: [Integrert livsreise](CIVICATION_INTEGRATED_LIFE_ROADMAP_2026_10_20.md) · [Miniatyrverden](CIVICATION_MINIATURE_WORLD_DESIGN_PLAN_2026-11-04.md).
