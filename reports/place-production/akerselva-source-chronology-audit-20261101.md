# Akerselva – kildekontroll, kronologi og relasjonssperrer (1. november 2026)

**Omfang:** Canonical `akerselva` (By), ikke selvstendige fabrikker, fosser, broer eller de separate naturstedene. Dette er et kontrollspor og **ikke** en påstand om gjennomført setning–claim-paritet i v4.2.

## Verifisert kildekonflikt og rettelse

Den gamle artikkelen identifiserte utslippet fra Christiania Spigerverk i oktober 1990 som **svovelsyre**. Det står også i én passasje i Oslo byleksikons generelle Akerselva-artikkel, men motstrides av:

- **Stortinget, 17.10.1990:** spørsmål til miljøvernministeren beskriver eksplisitt et utslipp av **saltsyre** natt til 17. oktober 1990. https://www.stortinget.no/no/Saker-og-publikasjoner/Sporsmal/Sporretimesporsmal/et-sporretimesporsmal/?qnid=3486
- **Oslo kommune, Overvåking av Oslos vassdrag 1980–2019, s. 157:** lekkasje fra et beisekar med **saltsyre**, 19 tonn, ved Spigerverket i 1990. https://www.oslo.kommune.no/get-file/109508/0b58d74bf9e4bd9f27c55bdc519aeecf88b3989285a2566b9464609e9ce04750/
- **Oslo byleksikon, Akerselva Miljøpark:** identifiserer også **saltsyre** i 1990 og omtrent 25 000 døde laks og ørret. https://oslobyleksikon.no/side/Akerselva_Milj%C3%B8park

**Rettet i denne endringen:** canonical `popupDesc`, Place-open-runtime, `en/es/pt` og tekstkildehash; regresjonstest krever riktig syre i alle språk. Verken quiz-ID-er, People-ID-er, bilder, samlinger eller ruteankre endres.

## Kildesporet for artikkelens åtte avsnitt – foreløpig avsnittsrevisjon

| Avsnitt | Dokumenterbare hovedelementer | Kontrollerte kilder | Status |
|---|---|---|---|
| 1 – geografi og vannkraft | Maridalsvannet–Bjørvika, berggrunn, omkring 20 fosser, kornmøller og oppgangssager | Oslo byleksikon: Akerselva, innledning | Kildestøtte funnet |
| 2 – tidlig og ny industri | Trelast; Bentse Brug 1696; ny industri fra 1840-årene; Nydalen, Hjula, Vøyen, Myrens | Oslo byleksikon: Akerselva, «Industrien langs Akerselva» | Kildestøtte funnet; sterke «første»-påstander krever to kilder i v4.2 |
| 3 – forurensning | Kloakkutslipp, industriforurensning, 25 direkte utløp, utilgjengelige bredder | Oslo byleksikon: Akerselva, «Miljøforhold»; Akerselvas Venner: Forurensing | Hovedpåstander støttet; egen dokumentasjon for fabrikkgjerder/generell grensefunksjon må spores |
| 4 – utslipp og tiltak | 1988 fosforsyre; 1990 saltsyre; 2011 klor; Midgardsormen ferdig 2014 | Stortinget 1990; Oslo kommune vannrapport; Oslo byleksikon: Akerselva/Miljøpark; Akerselvas Venner | Syrefeil rettet; hendelser og år er kildebelagt |
| 5 – miljøpark og plan | Initiativ i 1986; kommunedelplan vedtatt 28.11.1990; 200–600 m parkbelte; ca. 240 dekar / 31 områder | Oslo byleksikon: Akerselva Miljøpark; kommunedelplanen s. 33; brev nov. 1994 | Kildestøtte funnet; 1986 oppstart er ikke vedtaksåret for kommunedelplanen |
| 6 – nye funksjoner i industribygg | AHO 2001; Kunsthøgskolen 2003; DOGA 2005; Vulkan | Oslo byleksikon: Akerselva Miljøpark, ombruk; AHO, 25 år på Vulkan | Hovedpåstander kildebelagt; tidskritiske leietakere kontrolleres ved slutt-review |
| 7 – endret elveløp | Sidebekker i rør, kulvert Vaterland–Operaen, lokkeflom for fisk | Oslo byleksikon: Akerselva, innledning | Kildestøtte funnet |
| 8 – dagens elv | Turvei, naturkorridor, kultur- og industrimiljø, kulvert til fjorden | Oslo byleksikon: Akerselva/Miljøpark; Oslo kommune, 2026 forvaltningsplan | Overordnet støttet; nåtidsutsagn krever oppdatert `verifiedAt` |

**Merk:** Denne tabellen er kontroll på avsnittsnivå. Det formelle kravet om **hver setning → godkjente claim-ID-er, kildeplassering, teksthash og separat factual/editorial review** etter `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` er fremdeles **åpent**. Ikke sett `ready_v4_2` eller `vFerdig` på grunnlag av denne rapporten.

## Chronology/epoke – kildebelagte dateringsankre, ikke materialisert i runtime

- **1341:** tidlig dokumentert kornmølle ved Sandaker (Oslo byleksikon).
- **1500-tallet:** oppgangssager tas i bruk langs vassdraget (Oslo byleksikon).
- **1696:** Bentse Brug starter papirproduksjon (Oslo byleksikon).
- **1840-årene:** overgang til moderne verksted- og tekstilindustri (Oslo byleksikon).
- **1845–1855:** Vøiens Bomuldsspinderi, Nydalens Compagnie og Hjula Væverier etableres (Oslo byleksikon).
- **1986:** initiativ og opprettelse av miljøparkprosjektet (Oslo byleksikon, Miljøpark).
- **28.11.1990:** kommunedelplanen blir vedtatt (kommunedelplan/1994 brev).
- **2011:** klorutslipp fra Oset (NIVA og Oslo byleksikon).
- **2014:** Midgardsormen åpner (Oslo byleksikon).

Epoke-/chronology-generator og visning skal undersøkes separat. Ikke bruk `place.year = 1850` som en falsk dateringspresisjon for hele elva.

## Relasjoner og andre modulporter

- Akerselvas `place-open.relations` er en **tom liste** per 1.11.2026, til tross for bekreftede egne Place-ID-er `ovre_foss`, `voienfossen`, `beierbrua`, `ankerbrua` og `nydalen`. Relasjonskilden og generatoren må revideres før navigasjon aktiveres. Ikke kopier disse stedene som Structures.
- `lesespor` er tomt. Vurder betinget relevans; ikke produser fyll.
- **Story-blocker:** `st_akerselva_fyrstikkpikene_1889` har `place_id: akerselva` og sier at fyrstikkarbeiderstreiken ved Bryn og Grønvold foregikk «langs Akerselva», og at den varte i ti dager. Begge deler er feil: produksjonsstedene var i Østre Aker, og streiken gikk fra oktober til desember 1889. Verifisert mot SNL, Arbeiderbevegelsens arkiv og kvinnehistorie.no: https://snl.no/fyrstikkarbeiderstreiken ; https://www.arbark.no/Utstilling/Historiske_arbeidskonflikter/Historiske_arbeidskonflikter.htm ; https://www.kvinnehistorie.no/artikler/fyrstikkarbeiderstreiken-i-1889/ . **Ingen automatisk remapping av story-ID, progresjon eller scene-lenker** før riktig canonical Place og migreringskonsekvenser er gjennomgått.
- People og PlaceCard-samlinger fra #6854/#6855 beholdes uendret.

## Åpne porter

1. Full v4.2 setning–claim-produksjon med redaksjonell gjennomgang.
2. Kildebasert chronology/epoke-materialisering og faktisk visning.
3. Retting eller korrekt remapping av feilplassert fyrstikk-Story.
4. Relasjonssystem, betingede moduler og endelig QA på mobil/desktop.

**Status:** Avgrenset kildefaktarettelse, ikke vFerdig.
