# Oslo sentrum – bolk 05: bildereferanser og lisensport (Stage B-forberedelse)

**Dato:** 1. november 2026  
**Scope:** Seks eksisterende canonical Places; kilde- og rettighetsvurdering, **ikke import eller avledede bildedata**. Følg produksjonsrekkefølgen tekst → bilde → ferdig kort.

## Bekreftede Commons-originaler

| Canonical Place | Nøyaktig original / motiv | Fotograf / år | Lisens på originalens filside | Dimensjoner | Anbefalt bruk |
|---|---|---|---|---|---|
| `folketeateret` | [Folketeatret mot Youngstorget.jpg](https://commons.wikimedia.org/wiki/File:Folketeatret_mot_Youngstorget.jpg), inngangen mot Youngstorget | **Helge Høifødt**, 2011 | **CC BY-SA 3.0 Unported** | 3872 × 2592 | Bygg- og sceneinngang; bredt hero / eventuelt beskåret portrett hvis inngangen beholdes |
| `kunstnernes_hus` | [Oslo, Kunstnernes Hus (3).JPG](https://commons.wikimedia.org/wiki/File:Oslo,_Kunstnernes_Hus_(3).JPG), Kunstnernes Hus | **Michal Klajban**, 2012 | **CC BY-SA 3.0 Unported** | 2774 × 2029 | Husets eksteriør; verifiser utsnitt før stående PlaceCard |
| `historisk_museum` | [Historisk museum ... IMG 4996.jpg](https://commons.wikimedia.org/wiki/File:Historisk_museum_Kulturhistorisk_(Historical_Museum)_Oslo_NORWAY_2025-03-25_Building_facade_front_(Henrik_Bull_Wienerjugend_1902)_Frederiks_gate_Kristian_IVs_gate_traffic_lights_crossing_IMG_4996.jpg), fasaden mot Frederiks gate | **Wolfmann**, mars 2025 | **CC BY-SA 4.0** | 8064 × 6048 | Dagslys-/eksteriørkandidat til hero; se om stram portrettbeskjæring skjuler inngangen |
| `ibsen_museum_teater` | [Arbins gate 1.jpg](https://commons.wikimedia.org/wiki/File:Arbins_gate_1.jpg), **historisk leilighetsbygg** | **Jan-Tore Egge**, 2016 | **CC BY-SA 4.0** | 2429 × 2448 | Dokumentasjon av Ibsens bolig **Arbins gate 1**, ikke påstå at dette er moderne publikumsinngang Henrik Ibsens gate 26 |
| `blitzhuset` | [Pilestredet 30 (Blitz), Oslo.jpg](https://commons.wikimedia.org/wiki/File:Pilestredet_30_(Blitz),_Oslo.jpg), Blitz' fasade | **Ssu**, januar 2020 | **CC BY-SA 4.0** | 4032 × 3024 | Husfoto, historisk situasjon 2020; ikke påstå at banner, fasadedekor og aktivitet er identisk i 2026 |
| `kulturkirken_jakob_litteratur` | [Oslo 2024 mai 16.jpg](https://commons.wikimedia.org/wiki/File:Oslo_2024_mai_16.jpg), Kulturkirken Jakobs tårn/eksteriør | **Øyvind Holmstad**, mai 2024 | **CC BY-SA 4.0** | 4000 × 5333 | Stående portrett av kirkens eksteriør; **eksisterende hero-foto på main skal beholdes** |

### Presise regler for de seks

1. Før konvertering, kontroller **originalbytes** og fullstendig filside for hver kandidat; noter SHA-256, bytes, nedlastingsdato og eventuell billedbeskjæring. Filside og kategoriliste er ikke selve bildeassetet.
2. For CC BY-SA, vis fotograf, originalfilsiden, eksakt CC-lisens/versjon, klikkbar lisenslenke og synlig «Beskåret og konvertert til WebP» ved avledede bilder. Del avledede bildefiler med tillatte viderebruksvilkår, ikke kun kodeprosjektets lisens.
3. Lag minst separate måltilpassede utsnitt for stedsbilde (bredt), PlaceCard (stående), QuizCard (kompakt). Sjekk lesbare motiv ved 390px mobil og 1440px desktop og fiks beviselig dårlig utsnitt fremfor vilkårlige standardcroppinger.
4. Historisk bilde og nåtidsmotiv må ikke forveksles: *Ibsens bolig ≠ ny publikumsinngang*; *Folketeaterbygningen ≠ separat Arbeidersamfunnets plass*; *Blitz-graffiti anno 2020 ≠ dokumentasjon av dagens fasade*.
5. Ressursene i tabellen er **lisensierte kandidater**, ikke ferdig importert eller QA-godkjent kortmedia. Ingen endring på `main`, `data/places`, `data/quizcards` eller bildeindekser er utført av denne rapporten.

## Ny verifikasjon som gjenstår per sted

- **Folketeateret:** original 2011 kan vise inngangsparti, men hele byggets formspråk bør også være synlig i hero. Stående crop må vurderes visuelt.
- **Kunstnernes Hus:** bevar motivet av bygningen og ikke beskjær bort gjenkjennelig arkitektur; ikke bruk kunstverkfoto med egne verkrettigheter uten særskilt lisens.
- **Historisk museum:** gatefront og inngang fra Frederiks gate 2 må være synlig. Ingen påstand om dagens utstillinger ut fra bildet.
- **IBSEN Museum & Teater:** suppler evt. med eget rettighetsklart foto av den **faktiske nåværende inngangen**; søk etter bilder fra Henrik Ibsens gate 26 med eksplisitt lisens. Foreløpig bilde viser den historiske leilighetsbygningen.
- **Blitzhuset:** dokumenter adressenøytral bildetekst («Blitzhuset i Pilestredet») mens 30c/30e dokumenteres. Ikke flytt GPS-ankeret basert på bildets tittel.
- **Kulturkirken Jakob:** eksisterende bilde har prioritet. Nye utsnitt supplerer bare hvis kvalitet, rettigheter og motiver beviselig er bedre.

## Viktige funn: uegnede motiver

- [Henrik Ibsen Museum.jpg](https://commons.wikimedia.org/wiki/File:Henrik_Ibsen_Museum.jpg) viser **Ibsenmuseet i Skien**, ikke Oslo; det skal **ikke** brukes i dette stedssettet selv om navnet ser riktig ut.
- [Jakobs kyrka.jpg](https://commons.wikimedia.org/wiki/File:Jakobs_kyrka.jpg) viser **Jakobskirken i Stockholm**, ikke Kulturkirken Jakob i Oslo. Ikke bruk.
- Generelle bilde-/nyhetsresultater fra åpne søk er **ikke lisensdokumentasjon** og skal ikke tas med i produktene uten rettighetsgrunnlag.

**Resultat:** 6/6 har én spesifikk originalside med navngitt fotograf og eksplisitt gjenbrukslisens kontrollert. **0/6** importert til prosjektet i denne leveransen. Alle seks er kandidater, ikke godkjente bildepakkefiler. Ingen kart-/quiz-/Knowledge-status oppgradert.
