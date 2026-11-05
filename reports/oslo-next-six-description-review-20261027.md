# Fem Oslo-fortellinger – isolert beskrivelsesrevisjon

Dato: 27. oktober 2026. Låst base: `95e3a7201062cd7fdb12152ca0793dcdbabc7b88`. Forutsetning for innholdsarbeidet i #6622.

## Scope og nullmåling

Bare `desc`/`popupDesc` i fem eksisterende canonical Place-filer, fem tilhørende v4.2-pakker og denne rapporten. Ingen koordinater, regler, quizfiler, bilder, Fagverk eller genererte indekser inngår. Wessels plass er vurdert som allerede god og er bevart uendret.

Alle fem hadde intern History Go-/datamodellprosa; Egertorget navnga feilaktig Eger-nevøene som sikker navneforklaring og hevdet at Egergården sperret gjennombruddet. Mustadgården forklarte feltstatus i brukerartikkelen. De andre tekstene brukte generiske pedagogiske avslutninger der konkrete historier kunne fortelles. Revisjonen erstatter disse svakhetene med dokumentert boligliv og brann, offentlig hage og kongebolig, avisøkonomi og politisk tilpasning, handel og regulering, og ombygging og fasadekunst.

## Regelgrunnlag og arbeidsrekkefølge

Lest: AGENTS.md; hele PLACE_DESCRIPTION_CANONICAL.md, særlig §9A og §16; v4.2-schema og validator; PLACE_PRODUCTION_MINIMUM_V1.md; gjeldende checklist og relevante READ-FIRST-/referanse-/profil-/Objects-avsnitt. Eksisterende identiteter, kategorier, samlinger og produksjonsprofiler videreføres; denne isolerte fasen velger ingen nye samlinger eller fullproduksjonsprofil og hevder ikke v1/vFerdig.

Rekkefølge: identitet → inspiserte kildesider → diskrete claimregistre → faktakontroll → avsnitt og ingress → setningskoblinger → separat redaksjonell gjennomgang → hash og validator. Skriptets faktaregister ble skrevet før prosakomposisjonen; claims er ikke en automatisk setningskopi. Enkelte tett sammenhengende faktakjerner deles mellom flere setninger, mens sammensatte setninger viser til flere konkrete claims.

## Kildegjennomgang og avgrensninger

Alle nettsidene nedenfor ble åpnet og lest 27. oktober, ikke brukt bare som søkesnutter. Pakkenes `sourceLocation` identifiserer seksjon/avsnitt; hver påstand har egen kilde og kontrolldato.

- Kontraskjæret: Oslo kommunes Oppdag Kvadraturen, `/stoppesteder/kontraskjaeret`, seksjonene om brann, palisade, arkeologi og Skansen; Oslo byleksikon, `https://oslobyleksikon.no/side/Kontraskj%C3%A6ret`, avsnittene om universitetsplaner, kommunal overtakelse og senere bruk. Murene beskrives som boligspor. Militær reaktivering gjør at en enkel permanent «deaktivert fra 1818»-historie er utelatt.
- Paléhaven/Paleet: Oppdag Kvadraturen, `/stoppesteder/palehaven-og-paleet`; `https://lokalhistoriewiki.no/wiki/Paleet_(Fred._Olsens_gate)`, historikk og offentlig bruk; `https://snl.no/Paleet`, avsnittet om Høyesterett. Testamentet ble skrevet i 1801, mens overtakelsen fulgte dødsfallet i 1805. SNLs opplysning om residens til 1949 er ikke brukt: bygningen brant og ble revet i 1942. Ingen udokumentert enerpåstand om «første offentlige park» er nødvendig. Omtalen av Mathias støpejernsstøtte bygger på kommunens avsnitt, uten den dramatiske begravelsesscenen.
- Tiden: Oppdag Kvadraturen, `/en/sights/radhusgata-10-avisen-tiden`; `https://snl.no/Tiden_(Oslo)`, Historie og nyhetsavisseksjonen; `https://snl.no/Niels_Wulfsberg` som kontekstkontroll. Adressehistorie skilles fra avisens stiftelse. SNL beskriver papirkostnader, seddelverdi, stans og gjenstart. Kiel-meldingens dag varierer mellom kildene (25./26. januar); teksten sier januar. Kildene gir også ulikt avslutningsår for første utgivelsesperiode; den avisfaglige SNL-artikkelens detaljerte tidslinje angir januar 1811, som brukes. Ingen «første moderne avis»-enerpåstand.
- Egertorget: Oppdag Kvadraturen, `/stoppesteder/egertorget`; `https://snl.no/Egertorget`, avsnittene om regulering, Ole Eger og T-banen. Kommunesiden og SNL er uenige om navneopphav og huset som ble revet. Teksten begrenser navnet til Egerfamilien og hevder ikke at Egergården ble revet i 1846. SNL oppgir Stabellgården og at Egergården var uberørt av reguleringen; dette finnes som kontrollclaim, uten å gjøre konflikten til brukerrettet foredrag. Freias startår varierer (1901/1909); intet startår gis. Thune, Samson, Backer, Platou og den omstridte T-banenedgangen gir konkret byhistorie.
- Mustadgården: `https://oslobyleksikon.no/side/Kongens_gate`, oppføring 3; `https://lokalhistoriewiki.no/wiki/Kongens_gate_(Oslo)`, eiendom 3; Oppdag Kvadraturen, `/stoppesteder/den-rode-prikk-otto-kunzli`. Den eldre kjernen dateres omkring 1640, uten oppdiktet eksakt byggeår. Byleksikon og Lokalhistoriewiki støtter Nordan/Mustad og 1883; teksten bruker bare ombyggingsforløpet, ikke et unødvendig eksakt år eller bloggvariant 1890. Kunstverket knyttes til den dokumenterte utstillingen i 1996; ingen scene, motivasjon eller spekulasjon om hvor mange prikker som finnes er diktet opp. Kongens gate 1s historie er ikke flyttet til nummer 3.

## Manuelle reviews

Faktareview: alle 61 claims kontrollert mot sine angitte kildeavsnitt; alle faktiske bestanddeler i samtlige 82 tekstsetninger kontrollert mot koblingene. Ingen tematiske helavsnittskilder erstatter konkret støtte. Offentlige Oppdag Kvadraturen-sider gir identitet og aktivitet; relevante tidslag har egne konkrete kilder. Nåtidspåstander om synlige spor/utsikt/reklame har fersk kontrolldato. Ingen superlativ- eller enerpåstand krever en uavklart tokildeport.

Redaksjonell review: alle fem inngresser og hele artikler lest i sammenheng etter faktareview. Fortellingene har ulik utvikling og avslutning; oppramsing og intern produksjonsprosa er fjernet. Artiklene er konsise (173–196 ord), med tre reelle avsnitt hver. Lengden følger det utvalgte dokumenterte stoffet, uten kunstig 300-ordsfyll. Årstall beholdes ved vesentlige brudd og forklarende hendelser. Redaksjonell gjennomgang innførte ingen nye fakta. Begge pass er gjort separat av samme agent og er ikke en uavhengig menneskereview.

46 konkrete quiz-readiness-spørsmål har entydige svar og claim-ID-er, minst ni per sted og minst fire faktiske spørsmålstyper per pakke. De dekker tekstens faktiske opplysninger, ikke bare datoer, ID-er eller datagrensene. De er beredskapsbevis, ikke endringer i appens quizfiler.

## Kjørte kontroller

- `node scripts/validate-place-description-production-v4_2_policy.mjs --changed --base 95e3a7201062cd7fdb12152ca0793dcdbabc7b88 --head HEAD`: 262 pakker, 247 ready, **0 blokkerende feil**. Dette er den gjeldende policyporten; ordtall er veiledning og eksisterende micro-place-unntak gjelder.
- `node --test tests/place-description-production-v4_2.test.mjs`: **8/8 bestått**.
- Direkte `validatePacket` på alle fem pakker: **0 ikke-ordtallsfunn**; `validateSimilarity` på hele femstedsbolken: **0 funn**.
- SHA-256 for begge tekstfelter, setningsantall, samtlige quizreferanser og metadata-paritet er kontrollert av validatoren. Manuell sammenligning mot de fem filene hentet fra låst main skal bare vise endrede `desc`/`popupDesc`.
- Standard CI på endelig remote head og faktisk merge er egne etterfølgende porter. Lokal PASS er ikke en påstand om utført CI eller om publisert v1.

## Seksdimensjonal vurdering av beskrivelsesleveransen

| Dimensjon | Score | Konkret evidens og grense |
|---|---:|---|
| Korrekthet og evidens | 5 | 61 inspiserbare claims; alle setninger; daterings- og identitetskonflikter eksplisitt begrenset |
| Dekning og ferdigstillelse | 5 | Alle fem avtalte tekster og pakker; Wessels plass bevart; ingen uferdige tekstvarianter |
| Faglig/redaksjonell kvalitet | 4 | Fem ulike dokumenterte stedsfortellinger; menneskelig arbeid og hendelser; hele bolken manuelt lest; konsise artikler |
| Teknisk integritet | 4 | Changed-description-policy, 8 validatorprøver og helbolk-likhetskontroll bestått; standard CI gjenstår før merge |
| Sikkerhet og ansvarlighet | 4 | Historiske kildekonflikter håndtert; ingen oppdiktede motiv, scener eller falsk produksjonsstatus |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Smal diff, kildeplasseringer, stabile claim-ID-er, hash, separate reviews og lesbar rapport |
| **Sum** | **27/30** | **Ingen identifiserte kritiske innholdsavvik; merge avventer faktisk final-head-CI** |

Vurderingen gjelder kun den avtalte beskrivelsesfasen. Den sertifiserer ikke hele stedsproduksjonen, appvisning, bilder, fullquiz eller Fagverk. Automatiske kontroller beviser struktur og sporbarhet; kildebetydning og fortellerkvalitet bygger på de beskrevne manuelle passene.
