# People Oslo sport Bislett Stadion batch 2 research notes

## Batch rationale

This clean batch keeps five requested Bislett Stadion people anchors from sport history and follows the current main pattern for Bislett people: one batch JSON file under `data/people/sport/oslo/` plus one manifest entry. The entries are anchored only to existing `bislett_stadion`; no place data is changed.

## Source notes

- Ron Clarke: World Athletics and Olympedia document the 14 July 1965 Bislett Games 10,000 m world record in Oslo, where Clarke ran 27:39.4 and improved his own record by 36.2 seconds.
- Steve Ovett: World Athletics athlete/profile material and athletics summaries document Ovett as an Olympic 800 m champion and world-record middle-distance runner; public race-history summaries place his 1980 mile world record at Bislett/Oslo in 3:48.8 before the Moscow Olympics.
- Kay Stenshjemmet: Olympedia identifies him as a Norwegian speed skater and notes the 1976 European allround title fight at Bislett, where Stenshjemmet beat Sten Stensen by 0.005 points despite Stensen's 10,000 m world record.
- Sten Stensen: Olympedia and speed-skating records document Stensen's 10,000 m world record at the 1976 European Championships at Bislett, supporting a 1976 Oslo anchor.
- Tomas Gustafson: Olympedia documents Gustafson's 1982 European title and 10,000 m world record as the last speed-skating world record set at Bislett Stadium in Oslo; SpeedSkatingStats lists the Bislett 10,000 m track record as 14:23.59 on 31 January 1982.

## Modeling decisions

- `year` is the strongest Bislett-related anchor year, not birth year or general career peak.
- `image` and `cardImage` are empty strings because this batch does not add or claim safe repository image assets.
- `visual.designCode` values reuse the same descriptive runner/skater miniature pattern as Bislett batch 1.
- `kay_stenshjemmet` preserves the Norwegian display name while using an ASCII-safe ID already requested in the task.
- `tomas_gustafson` uses the Swedish spelling `Gustafson` shown by Olympedia/Olympics profile material, while the prose acknowledges the Bislett record.

## Research links used

- https://worldathletics.org/heritage/news/ron-clarke-world-record-year-1965
- https://www.olympedia.org/results/60598
- https://worldathletics.org/athletes/great-britain-ni/steve-ovett-14356603
- https://athleticsweekly.com/news/opinion/seb-coe-three-world-records-41-days-1039923454/
- https://www.olympedia.org/athletes/97829
- https://www.olympedia.org/athletes/97827
- https://www.speedskatingnews.info/skater/sten-stensen
- https://www.olympedia.org/athletes/86323
- https://www.speedskatingstats.com/index.php?file=rinks&rink=oslo-bislett
