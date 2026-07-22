# Kunst- og kulturkategori-audit — 2026-07-22

## Bakgrunn

Denne runden reviderer alle 56 aktive steder som lå i runtime-kategorien `kunst` før auditen. Bakgrunnen er at eldre import- og researchrunder flere steder brukte `kunst` som en samlebeholder for «kunst og kultur». Det er ikke lenger riktig etter at `musikk`, `scenekunst`, `religion`, `film_tv` m.fl. er egne primærkategorier.

Primærkategorien skal beskrive stedets tydeligste nåværende identitet/funksjon:

- `kunst`: visuell kunst, design, kunstverk og kunstinstitusjoner
- `musikk`: konserter, musikkscener, artister og musikkproduksjon
- `scenekunst`: teater, dans, revy, standup og andre scenebaserte produksjons-/publikumsarenaer
- `religion`: aktive religiøse steder
- øvrige fagkategorier brukes når stedets hovedfortelling klart tilhører dem

`kultur` er ikke en egen primærbadge og skal heller ikke automatisk oversettes til `kunst`.

## Resultat

- Gjennomgått: **56** steder
- Beholdes i `kunst`: **43**
- Reklassifiseres: **13**

Reklassifiseringene ligger i `data/places/category_overrides/kunst_kultur_reaudit_2026_07_22.json`. Override-laget brukes bevisst fordi flere av stedene fortsatt ligger fysisk i eldre `kunst`-/kultur-batcher, mens runtime skal vise korrekt primærkategori nå.

## Reklassifiseringer

| Sted | Fra | Til | Begrunnelse |
|---|---|---|---|
| Sofienberg kirke | kunst | religion | Aktiv kirke; kulturbruk og arkitektur er sekundære lag. |
| Arendal kulturhus | kunst | scenekunst | Primært publikums- og arrangementssted for sceneprogram, ikke visuell kunstinstitusjon. |
| Kulturkirken Jakob | kunst | musikk | Dagens tydeligste kulturfunksjon er konserter og musikkformidling. |
| Museu do Oriente | kunst | historie | Hovedfortellingen er kolonihistorie, handel og kulturmøter; kunsthistorie er sekundært. |
| Skakke – senter for kultur, skule og idrett | kunst | scenekunst | Flerbruks kulturarena; scenebasert kulturformidling er bedre primærkategori enn visuell kunst. |
| Skånevik kultur- og idrettshall | kunst | sport | Den fysiske hovedfunksjonen er idrettshall; kulturarrangement er sekundær bruk. |
| House of Blues Skånevik | kunst | musikk | Permanent livescene med tydelig blues- og konsertidentitet. |
| Skånevik Fjordhotel / Pippifestivalen | kunst | scenekunst | Oppføringen representerer festivalens teater-/sceneaktivitet, ikke hotelldrift. |
| Musikkpaviljongen i Doktorhagen | kunst | musikk | Bygget er etablert som arena for lokale musikkframføringer. |
| Old River Saloon | kunst | musikk | Fast konsertarena med scene, dansegulv og tydelig countryprofil. |
| ABC Studio | kunst | musikk | Profesjonelt lydstudio og produksjonsmiljø. |
| Fugl Fønix | kunst | musikk | Blandet kultursted, men den langvarige konsertvirksomheten er den tydeligste selvstendige kulturfunksjonen. |
| Sagene festivitetshus | kunst | scenekunst | Dagens funksjon er forsamlings-/kulturhus og arrangementsarena; gammel kirkehistorie er sekundær. |

## Steder som beholdes i Kunst

Følgende 43 steder ble kontrollert og beholdes som `kunst` fordi deres primæridentitet fortsatt er visuell kunst, kunstverk, design, kunsthåndverk, atelier-/kunstnerinfrastruktur eller en kunstinstitusjon med tilstrekkelig tydelig visuell kunstprofil:

- Lauvlia / Theodor Kittelsens kunstnerhjem
- Hagan / Christian Skredsvigs kunstnerhjem
- Valle Sylvsmie håndverkshistorie
- Nasjonalmuseet
- MUNCH
- Astrup Fearnley Museet
- Ekebergparken skulpturpark
- Emanuel Vigelands mausoleum
- Framtidsbiblioteket – Nordmarka
- Museu Nacional do Azulejo
- Fundação Calouste Gulbenkian
- MAAT / Tejo-kraftstasjonen
- Museu Nacional de Arte Antiga
- Centro Cultural de Belém
- MAC/CCB
- Museu Nacional de Arte Contemporânea do Chiado
- MUDE – Museu do Design e da Moda
- Culturgest
- Museu Arpad Szenes – Vieira da Silva
- Museu Bordalo Pinheiro
- Hauges Minde
- Villa Furulund
- Villa Romsli
- Roseslottet
- Skulptursonen i Øvre Slottsgate
- Kunstnernes Hus
- Vigelandmuseet
- TBS Gallery
- Det internasjonale Barnekunstmuseet
- Dronning Sonja KunstStall
- Fotografiens Hus
- Galleri MAP
- VI, VII
- The Oslo Gallery
- Kunsthall Oslo
- KÖSK
- Galleri Mini
- Van Etten
- Oslo Prosjektrom
- Purenkel galleri
- HODET N.N.
- Kollentrollet
- Kragstøtten

### Bevisste grensetilfeller som beholdes

- **Centro Cultural de Belém** beholdes i `kunst` fordi komplekset har en tung og selvstendig visuell kunst-/utstillingsfunksjon i tillegg til konsertsaler. Den separate MAC/CCB-oppføringen forsterker kunstinstitusjonslaget, men gjør ikke CCB til en ren scene.
- **Fundação Calouste Gulbenkian** beholdes i `kunst` fordi kunstmuseum og kunstsamling er en sentral institusjonell hovedfunksjon, selv om anlegget også har en betydelig musikkprofil.
- **Culturgest** beholdes i `kunst` fordi samtidskunst og utstillingsvirksomhet er en bærende del av institusjonens profil; musikk og scenekunst behandles som parallelle sekundære lag.
- **Framtidsbiblioteket** beholdes i `kunst`: litteratur er materialet, men selve stedet/prosjektet er et langsiktig konseptuelt kunstverk.

## Teknisk virkning

History Go har allerede runtime-støtte for kategori-overrides i `js/geo/place-coordinate-overrides.js`. Det betyr at både `places_index.json`, full place-loading, enriched place-data og place-quizkategorier blir normalisert til den nye primærkategorien uten at gamle batchfiler først må fysisk flyttes mellom mapper.

Ved neste ordinære `places:index:build` blir de samme override-beslutningene også skrevet inn i den genererte place-indeksen.

## Videre regel

Nye steder skal ikke bruke `kunst` som synonym for «kultur». Ved blandede kulturarenaer skal primærbadge velges etter hovedfunksjonen, og andre uttrykk håndteres som sekundære badges/innholdslag. Generiske kulturhus må vurderes enkeltvis.
