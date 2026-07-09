# People Oslo sport Bislett Stadion batch 2 validation

## Scope

Adds a clean Bislett Stadion people batch from current main without reopening or reusing PR #1908 or an old branch.

## Files changed

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json`
- `data/people/manifest.json`
- `reports/people-oslo-sport-bislett-stadion-batch-2-validation.md`
- `reports/people-oslo-sport-bislett-stadion-batch-2-research-notes.md`
- `reports/people-oslo-sport-bislett-stadion-batch-2-image-todo.md`

## Added people

| id | name | primary place | year | image/cardImage |
| --- | --- | --- | ---: | --- |
| `ron_clarke` | Ron Clarke | `bislett_stadion` | 1965 | empty strings |
| `steve_ovett` | Steve Ovett | `bislett_stadion` | 1980 | empty strings |
| `kay_stenshjemmet` | Kay Stenshjemmet | `bislett_stadion` | 1976 | empty strings |
| `sten_stensen` | Sten Stensen | `bislett_stadion` | 1976 | empty strings |
| `tomas_gustafson` | Tomas Gustafson | `bislett_stadion` | 1982 | empty strings |

## Guardrails checked

- Current main pattern checked first: Bislett batch 1 still exists as `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`, so batch 2 uses the same batch-file convention.
- No place files changed.
- `data/places/places_index.json` not changed.
- No UI/runtime/loader files changed.
- No external images added.
- `image` and `cardImage` use empty strings because no safe repository assets were introduced for this batch.
- Manifest entry inserted immediately after `people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`.
- Candidate IDs were checked against active `data/people/**/*.json` before adding the new batch; no duplicate requested IDs were found.

## Validation commands

```bash
python3 -m json.tool data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json >/tmp/bislett_people_batch2.json
python3 -m json.tool data/people/manifest.json >/tmp/people_manifest.json
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('data/people/manifest.json','utf8')).files; const a='people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json'; const b='people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json'; if (m[m.indexOf(a)+1]!==b) throw new Error('manifest order mismatch'); console.log('manifest order ok')"
node -e "const fs=require('fs'), path=require('path'); const ids=new Set(['ron_clarke','steve_ovett','kay_stenshjemmet','sten_stensen','tomas_gustafson']); const hits=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(e.name.endsWith('.json')){let j; try{j=JSON.parse(fs.readFileSync(p,'utf8'))}catch{continue} const arr=Array.isArray(j)?j:[]; for(const x of arr) if(x&&ids.has(x.id)) hits.push([x.id,p]);}}} walk('data/people'); const counts=Object.fromEntries([...ids].map(id=>[id,0])); for(const [id] of hits) counts[id]++; if(Object.values(counts).some(c=>c!==1)) throw new Error(JSON.stringify(counts)); console.log('candidate ids unique in data/people')"
node -e "const people=JSON.parse(require('fs').readFileSync('data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json','utf8')); if(people.length!==5) throw new Error('expected 5'); for(const p of people){ if(p.placeId!=='bislett_stadion') throw new Error(p.id+' placeId'); if(!Array.isArray(p.places)||p.places[0]!=='bislett_stadion') throw new Error(p.id+' places'); if(p.image!==''||p.cardImage!=='') throw new Error(p.id+' image fields'); } console.log('bislett batch shape ok')"
npm run health:data
```
