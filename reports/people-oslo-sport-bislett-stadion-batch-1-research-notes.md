# People Oslo sport Bislett Stadion batch 1 research notes

## Batch rationale

This batch adds five people anchors that explain Bislett Stadion through sports organization, speed skating, and international athletics. The entries are place-anchored to existing `bislett_stadion` only; no place data is changed.

## Source notes

- Arne Haukvik: World Athletics notes that the 2003 Bislett meet was dedicated to Haukvik, the former meeting director, and describes his strawberry-party host role. Stortinget lists him with Bislett-Alliansen/Bislett Games and Oslo Maraton responsibilities from 1965 to 2000.
- Martinus Lørdahl: Norsk nettleksikon/Wikipedia summary identifies him as sports administrator and a driving force in construction of Bislett Stadium from 1908; public marker and venue summaries also tie him to early Bislett development and the later bust/square.
- Knut Johannesen: Olympics/Olympedia and speed-skating records list his Olympic career and the 5000 m world record in Oslo on 26 January 1963, supporting a 1963 Bislett Stadion anchor.
- Fred Anton Maier: Olympedia and speed-skating record summaries document his 1968 Olympic and world-record profile; record tables place his 10,000 m personal/world record at Bislett/Oslo on 28 January 1968.
- Sebastian Coe: Athletics Weekly and other athletics summaries document his 1979 sequence, including 800 m and mile world records in Oslo/Bislett before the 1500 m record in Zürich.

## Modeling decisions

- `year` is the strongest Bislett-related anchor year, not necessarily birth year or career peak.
- `image` and `cardImage` are empty strings because this batch does not add or claim safe repository image assets.
- `visual.designCode` values follow existing people-style naming and are descriptive only.
- `martinus_lordahl` uses ASCII `lordahl` in the ID while preserving `Lørdahl` in display text.

## Research links used

- https://worldathletics.org/news/news/exxon-mobil-bislett-games-dedicates-2003-meet
- https://www.stortinget.no/no/Representanter-og-komiteer/Representantene/Representant/?perid=AHU
- https://en.wikipedia.org/wiki/Martinus_L%C3%B8rdahl
- https://www.hmdb.org/m.asp?m=227264
- https://www.olympics.com/en/athletes/knut-johannesen
- https://www.olympedia.org/athletes/87553
- https://www.olympedia.org/athletes/92057
- https://athleticsweekly.com/news/opinion/seb-coe-three-world-records-41-days-1039923454/
