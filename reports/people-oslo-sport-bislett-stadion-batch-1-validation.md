# People Oslo sport Bislett Stadion batch 1 validation

## Scope

Adds a clean Bislett Stadion people batch from current main without reopening or reusing the stale PR branch.

## Files changed

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`
- `data/people/manifest.json`
- `reports/people-oslo-sport-bislett-stadion-batch-1-validation.md`
- `reports/people-oslo-sport-bislett-stadion-batch-1-research-notes.md`
- `reports/people-oslo-sport-bislett-stadion-batch-1-image-todo.md`

## Added people

| id | name | primary place | year | image/cardImage |
| --- | --- | --- | ---: | --- |
| `arne_haukvik` | Arne Haukvik | `bislett_stadion` | 1965 | empty strings |
| `martinus_lordahl` | Martinus Lørdahl | `bislett_stadion` | 1908 | empty strings |
| `knut_johannesen` | Knut Johannesen | `bislett_stadion` | 1963 | empty strings |
| `fred_anton_maier` | Fred Anton Maier | `bislett_stadion` | 1968 | empty strings |
| `sebastian_coe` | Sebastian Coe | `bislett_stadion` | 1979 | empty strings |

## Guardrails checked

- No place files changed.
- `data/places/places_index.json` not changed.
- No UI/runtime/loader files changed.
- No external images added.
- `image` and `cardImage` use empty strings because no safe repository assets were introduced for this batch.
- Manifest entry inserted immediately after `people/sport/oslo/people_sport_oslo.json`.
- Candidate IDs were checked against active `data/people/**/*.json` before adding the new batch; no duplicate existing Bislett people IDs were found.

## Validation commands

```bash
python3 -m json.tool data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json >/tmp/bislett_people.json
python3 -m json.tool data/people/manifest.json >/tmp/people_manifest.json
node -e "const fs=require('fs'); const p='data/people/manifest.json'; const m=JSON.parse(fs.readFileSync(p,'utf8')).files; const a='people/sport/oslo/people_sport_oslo.json'; const b='people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json'; if (m[m.indexOf(a)+1]!==b) throw new Error('manifest order mismatch'); console.log('manifest order ok')"
node -e "const fs=require('fs'), path=require('path'); const ids=new Set(['arne_haukvik','martinus_lordahl','knut_johannesen','fred_anton_maier','sebastian_coe']); const hits=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(e.name.endsWith('.json')){let j; try{j=JSON.parse(fs.readFileSync(p,'utf8'))}catch{continue} const arr=Array.isArray(j)?j:[]; for(const x of arr) if(x&&ids.has(x.id)) hits.push([x.id,p]);}}} walk('data/people'); const counts=Object.fromEntries([...ids].map(id=>[id,0])); for(const [id] of hits) counts[id]++; if(Object.values(counts).some(c=>c!==1)) throw new Error(JSON.stringify(counts)); console.log('candidate ids unique in data/people')"
node -e "const people=JSON.parse(require('fs').readFileSync('data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json','utf8')); if(people.length!==5) throw new Error('expected 5'); for(const p of people){ if(p.placeId!=='bislett_stadion') throw new Error(p.id+' placeId'); if(!Array.isArray(p.places)||p.places[0]!=='bislett_stadion') throw new Error(p.id+' places'); if(p.image!==''||p.cardImage!=='') throw new Error(p.id+' image fields'); } console.log('bislett batch shape ok')"
```
