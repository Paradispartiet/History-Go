# Intility Arena – people batch 2 research

## Omfang

Batch 2 utvider den stedsspesifikke people-kjernen for `intility_arena` med tre nye profiler og to korrigeringer av eksisterende Vålerenga-oppføringer:

Nye enkeltfiler:

- Sherida Spitse
- Elise Thorsnes
- Henrik Bjørdal

Eksisterende oppføringer som oppdateres uten duplisering:

- Ronny Deila
- Klanen (VIF)

## Ronny Deila

- Var Vålerengas hovedtrener da herrelaget flyttet inn på den nye arenaen i september 2017.
- Ledet laget i den første herrekampen på stadion mot Sarpsborg 08 10. september 2017.
- Intility Arena er et mer presist hovedanker enn `valle_hovin_stadion`; Valle Hovin beholdes som sekundær områdekobling.

Kilder:

- https://en.wikipedia.org/wiki/2017_V%C3%A5lerenga_Fotball_season
- https://en.wikipedia.org/wiki/Intility_Arena

## Klanen

- Er Vålerengas organiserte supporterfellesskap og en sentral bærer av klubbens sang-, tifo- og tribunekultur.
- Intility Arena er den direkte hjemmebanekoblingen for supporteridentiteten etter 2017.
- Oppføringen finnes allerede og skal derfor korrigeres, ikke dupliseres.

Kilder:

- https://klanen.no/
- https://en.wikipedia.org/wiki/Intility_Arena
- https://www.vg.no/sport/i/43L6rE/vaalerenga-fotball-ber-om-laan-paa-tre-millioner-fra-supportergruppen-klanen

## Sherida Spitse

- Spilte for Vålerenga fra 2018 til 2020.
- Var en sentral midtbanespiller da klubben vant sin første Toppserien-tittel og sitt første cupmesterskap i 2020.
- Ble tatt ut på årets lag i Toppserien i 2020.
- Gullperioden hadde Intility Arena som hjemmebane.

Kilder:

- https://en.wikipedia.org/wiki/Sherida_Spitse
- https://en.wikipedia.org/wiki/2020_Toppserien
- https://en.wikipedia.org/wiki/2020_Norwegian_Women%27s_Cup

## Elise Thorsnes

- Spilte for Vålerenga fra 2021 til 2025.
- Ble toppscorer i Toppserien i 2022.
- Vant flere cupmesterskap med Vålerenga.
- Scoret Vålerengas sene utligning mot Bayern München på Intility Arena i Champions League i november 2024.
- Avsluttet karrieren i 2025 som tidenes mestscorende spiller i norsk kvinnefotball.

Kilder:

- https://en.wikipedia.org/wiki/Elise_Thorsnes
- https://en.wikipedia.org/wiki/2022_Toppserien
- https://www.bavarianfootballworks.com/2024/11/22/24299802/valerenga-bayern-munich-frauen-observations-match-analysis-champions-league-uwcl-damnjanovic-arsenal
- https://www.vg.no/sport/i/j09Kxe/thorsnes-avsluttet-karrieren-med-nytt-cupgull-helt-unik-i-norsk-idrettssammenheng

## Henrik Bjørdal

- Kom til Vålerenga i september 2020.
- Ble en langvarig midtbane- og kapteinsprofil på Intility Arena.
- Sto i klubben gjennom nedrykket i 2023 og var en leder da Vålerenga vant 1. divisjon og rykket opp igjen i 2024.
- Var fortsatt omtalt som Vålerenga-kaptein i 2025 og 2026.

Kilder:

- https://en.wikipedia.org/wiki/Henrik_Bj%C3%B8rdal
- https://en.wikipedia.org/wiki/2024_V%C3%A5lerenga_Fotball_season
- https://en.wikipedia.org/wiki/2024_Norwegian_First_Division

## Repo-audit og avgrensning

- `sherida_spitse`, `elise_thorsnes` og `henrik_bjordal` finnes ikke fra før i repoet.
- `ronny_deila` og `klanen` finnes i `data/people/sport/oslo/people_sport_oslo.json` og oppdateres på stedet.
- Ingen person-ID-er dupliseres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
