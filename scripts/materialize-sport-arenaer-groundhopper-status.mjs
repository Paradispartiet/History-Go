#!/usr/bin/env node
import fs from 'node:fs';
const p='data/fagverk/subject_status.json';
const s=JSON.parse(fs.readFileSync(p,'utf8'));
const row=s.subjects.find(x=>x.id==='sport');
row.editorialStatus='chapters_in_progress';
row.nextGate='regler_spill_konkurranse_chapter_production';
row.note='Sport har startet redaksjonell kapittelproduksjon. Arenaer, steder og Groundhopper dekker 20/20 emner i første av 6 canonicale områder, med 23 canonicale metoder, 9 seksjoner, 27 claimsporede fagavsnitt, 27 claims og 14 inspiserbare eksterne kilder. Neste port er Regler, spill og konkurranse.';
s.updatedAt='2026-08-13';
fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n');
