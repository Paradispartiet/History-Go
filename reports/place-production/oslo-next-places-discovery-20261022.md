# Oslo – nye stedskandidater, separat forskningsspor (22.10.2026)

> **Kun kandidatresearch.** Ingen kanoniske Places, quiz, Fagverk, bilder eller produksjonsstatus er endret. Oslo-bolk 04 (17 steder, fullføres i en annen ChatGPT-arbeidsøkt) er eksplisitt utenfor scope. Ingen PR eller merge for den bolken er berørt.

## Repo-kontroll og avgrensning

- Kilde: `data/places/manifest.json` på `main` ved oppstart, basert på commit `8211c9c03747bdd66cafb6f55ec7190dd19ab9bb`. Manifestet lister **1547 stedfiler**, hvorav **574 har `/oslo/` i filstien**. Dette er en filnavnssjekk, ikke en full semantisk dublettkontroll.
- Kontrollerte eksisterende / **må ikke opprettes som nye**: `villa_grande`, `observatoriet`, `tandbergs_radiofabrikk_kjelsas`, `frysja_33_brekke_kraftstasjon`, `bryn_industriomrade`, `frysja_industriomrade`, `nydalen`, `kvaernerbyen_alna`, `tveten_gard`. Gjennomfør alias- og koordinatsjekk igjen før nye ID-er tas i bruk.
- Viktig grense: `frysja_industriomrade` representerer området med det tidligere Kjelsås Bruk. **Selve Kjelsås Bruk foreslås ikke som ny separat post** nå. Arbeiderboligene er en egen mulig fysisk identitet, men må vurderes særskilt.
- `kvaernerbyen_alna` representerer vannspeilet/kulverten, og ikke Kværner Brug som fabrikk; navnelikhet betyr ikke automatisk dublett.
- A betyr lovende kandidat med tydelig dokumenterbar identitet; B betyr kandidat med egen steds- eller avgrensningsusikkerhet. **Ingen kandidat er fullproduksjonsklar på dette stadiet.**

## 20 kandidater til separat neste Oslo-bolk

| Prioritet | Kandidat / forslag til ID | Lokalisering | Historisk hovedgrep | Primærkilde | Avgrensning/åpen kontroll |
|---|---|---|---|---|---|
| A | **Linderud gård** (`linderud_gard`) | Trondheimsveien 319 | Herregård, godsøkonomi og barokkhage; hovedbygning og park | [Oslo byleksikon](https://oslobyleksikon.no/side/Linderud_%28g%C3%A5rd%29); [ekstra kilde](https://mia.no/linderud/om) | Gården egen identitet, ingen treff på navn/ID i manifest |
| A | **Ekebergrestauranten** (`ekebergrestauranten`) | Kongsveien 15 | Tidlig norsk funksjonalisme 1929, krig og fredning | [Oslo byleksikon](https://oslobyleksikon.no/side/Ekebergrestauranten) | Anlegget må avgrenses fra Ekebergparken og Ekebergsletta |
| A | **Christiania Spigerverk** (`christiania_spigerverk_nydalen`) | Nydalsveien 16 (historisk industriområde) | Stålproduksjon 1853–1989 og omstilling i Nydalen | [Oslo byleksikon](https://oslobyleksikon.no/side/Christiania_Spigerverk) | Avgrens fabrikk fra eksisterende områdested Nydalen; koordinat for historisk anlegg må fastsettes |
| A | **Kristiania Teglverk** (`kristiania_teglverk_bryn`) | Nils Hansens vei 14 | Teglproduksjon fra 1897; bevart ovn og industribygg | [Oslo byleksikon](https://oslobyleksikon.no/side/Kristiania_Teglverk) | Hold adskilt fra Bryn industriområde og nedlagte Bryn Teglverk |
| A | **Mustads arbeiderboliger** (`mustad_arbeiderboliger_lilleaker`) | Mustads vei 3–5 | Arbeiderfamilienes hverdag, 1880-årene og fredningskamp i 1990-årene | [Oslo byleksikon](https://oslobyleksikon.no/side/Mustads_vei) | Kun offentlig dokumentert bygningshistorie; unngå private beboeropplysninger |
| A | **Arctanderbyen** (`arctanderbyen`) | Egnehjemveien 1 (blått skilt; området omfatter Svingen/Egnehjemveien) | Norges første hageby 1910–11, boligreform og arbeiderhjem | [Oslo byleksikon](https://oslobyleksikon.no/side/Arctanderbyen) | Én områdeidentitet; ankres til offentlig skilt, ikke privat bolig |
| A | **Østre Aker kirke** (`ostre_aker_kirke`) | Ulvenveien 110 | Nygotisk kirke, innviet 1860; Groruddalens historie | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Aker_kirke) | Kirkegård skilles fra selve kirken |
| A | **Grefsen Bad** (`grefsen_bad`) | Kjelsåsveien 51 (historisk sted) | Vannkur fra 1858, deretter tuberkulosebehandling | [Oslo byleksikon](https://oslobyleksikon.no/side/Grefsen_Bad) | Historisk belegg må skilles fra senere utbygging; foto/oppmøtepunkt kontrolleres |
| A | **Grefsen og Disen Vels velhus / Grefsen kino** (`grefsen_disen_velhus`) | Kjelsåsveien 18 | Velhus 1928–29; 'Svetter'n' kino, krigslasarett, jazzmiljø | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Én bygning; kino ikke egen Place uten særskilt identitetskontroll |
| A | **Østre Grefsen gård** (`ostre_grefsen_gard`) | Kjelsåsveien 43 | Gårdshistorie fra 1600-tallet; bevart hovedbygning fra ca. 1800 | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Grefsen_g%C3%A5rd) | Ikke bland med Grefsen Bad eller Grefsen gård-navnevarianter |
| A | **Frognerseteren** (`frognerseteren`) | Holmenkollveien 200 | Friluftsliv og dragestil; restaurant fra 1891 | [Oslo byleksikon](https://oslobyleksikon.no/side/Frognerseteren) | Restaurant, Heftyevilla og stasjon skilles eksplisitt |
| A | **Grefsenkollen restaurant** (`grefsenkollen_restaurant`) | Grefsenkollveien 100 | Utsiktsrestaurant fra 1927, rekreasjon og krigsbruk | [Oslo byleksikon](https://oslobyleksikon.no/side/Grefsen%C3%A5sen); [ekstra kilde](https://oslobyleksikon.no/side/Grefsenkollen) | Avgrens restaurant fra åsen som natursted |
| A | **Kværner Brug** (`kvaerner_brug`) | Turbinveien 2/4 (tidligere Kværnerveien 10) | Jernstøperi fra 1853, maskinindustri og Alnas vannkraft | [Oslo byleksikon](https://oslobyleksikon.no/side/Kv%C3%A6rner_Brug) | Eksisterende Kværnerbyen ved Alna gjelder vannspeil, ikke industribedriften |
| A | **Sarabråten** (`sarabraten`) | Sarabråten ved nordøstre Nøklevann (koordinat gjenstår) | Heftyes sommersted fra 1850-årene, tidlig organisert friluftsliv og ruiner | [Oslo byleksikon](https://oslobyleksikon.no/side/Sarabr%C3%A5ten) | Nøyaktig geometri og dagens tilgjengelige spor kontrolleres |
| A | **Sæterhytten** (`saeterhytten_bygdoy`) | Dronningbjerget på Bygdøy (adresse/koordinat gjenstår) | Utfartssted fra 1862, Ibsens åpningsdikt og kongelig folkepark | [Oslo byleksikon](https://oslobyleksikon.no/side/S%C3%A6terhytten); [ekstra kilde](https://www.riksantikvaren.no/fredninger/fredning-av-bygdoy-kulturmiljo/) | Vurder som eget kulturminne innen større Bygdøy-kulturmiljø |
| B | **Østensjø gård** (`ostensjo_gard`) | Valborgs vei (Nordre/Søndre tun; eksakt punkt gjenstår) | Jordbruk og fredet oldtidsvei, bygningstradisjoner | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stensj%C3%B8_g%C3%A5rd) | Avgjør om Nordre og Søndre bør være egne steder |
| B | **Kjelsås Bruks arbeiderboliger** (`kjelsas_bruk_arbeiderboliger`) | Kjelsåsveien 143 a–c | Bevarte/flyttede arbeiderboliger fra 1889, i dag kunstnerboliger | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Avgrens mot Frysja industriområde; selve Kjelsås Bruk er allerede representert der |
| A | **Østre Aker kirkegård** (`ostre_aker_kirkegard`) | Ulvenveien 114 | Kirkegård innviet 1860, gravkultur og anonym minnelund | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Aker_kirkeg%C3%A5rd) | Skal ikke duplisere kirkeplassen |
| B | **Grefsen brannstasjon (tidligere)** (`grefsen_brannstasjon`) | Kjelsåsveien 69b | Funkisbygg oppført 1938, brannvern og forstadshistorie | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Verifiser dagens fasade, eiendomsidentitet og fotomulighet |
| B | **Bryn Teglverk (historisk tomt)** (`bryn_teglverk_historisk`) | Tvetenveien 54 (historisk adresse) | Teglverket fra 1873 og Oslos boligbygging; bygningen revet | [Oslo byleksikon](https://oslobyleksikon.no/side/Bryn_Teglverk) | Kun historisk tomt: ikke presenter revet bygg som bevart; stedspinne trenger særskilt kontroll |

## Arbeidsrekkefølge – nye steder, ingen inngrep i Oslo-bolk 04

1. Først kjør **semantisk dublettkontroll** i hele `data/places/manifest.json`, ikke bare filnavn, og sjekk naboplasseringer (region versus enkeltbygg). Fjern tvilsomme dubletter framfor å skape produksjonsgjeld.
2. For de beste ca. 20 kandidatene: dokumenter riktig offentlig pinneadresse/koordinat og minst én kontrollert faglig kilde. For historiske tomter, vis eksplisitt at bygningen er borte. Ikke anta rettigheter til arkivfoto.
3. Før **noen** Place-produksjon: les alle gjeldende ni READ-FIRST-filer angitt i rotens `AGENTS.md`, og fastsett hovedbadge → underbadges → source review → bekreftet produksjonsprofil → endelig innholdsplan. Opprett regel-preflight/workcard per faktisk Place, som CI krever.
4. Bruk `docs/PLACE_PRODUCTION_MINIMUM_V1.md`: historietekst, publiserbart bilde, egen Fagverk-side, gjennomgått fullquiz, ti kontrollerte spørsmål, samsvarende QuizCard og testet appvisning. Ikke merk `vFerdig` tidlig. Lag dedikert PR senere med kun de nye stedene, uten endringer i Oslo-bolk 04 eller parallelloppgaver.

## Kildetyper

- Oslo byleksikon artiklene over brukes som avgrenset historisk forskningsgrunnlag, med enkeltlenker for hvert sted.
- <https://www.oslo.kommune.no/plan-bygg-og-eiendom/kulturminner-og-kulturmiljo/gul-liste/> og <https://www.kulturminnesok.no/> kan brukes til å kontrollere vernestatus — **ingen vernestatus er automatisk tilordnet kandidatene**.
- DigitaltMuseum / Oslo Museum og Nasjonalbiblioteket kan gi historiske motiv; lisens, kreditering og tillatt bruk må sjekkes per konkret foto før publisering.

*Dette dokumentet er kun en kandidatoversikt, ikke en statusrapport om den andre arbeidsøkten.*
