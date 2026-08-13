#!/usr/bin/env node
import fs from 'node:fs';
const p='data/fagverk/fagverk_registry.json';
const r=JSON.parse(fs.readFileSync(p,'utf8'));
const c=JSON.parse(fs.readFileSync('data/fagverk/sport/arenaer-steder-groundhopper.json','utf8'));
const row={id:c.id,title:c.title,subtitle:c.subtitle,file:'data/fagverk/sport/arenaer-steder-groundhopper.json',primary_domain_id:c.primary_domain_id,chapter_role:'core',emne_ids:c.emne_ids,claimsFile:c.claimsFile,briefFile:c.briefFile};
r.subjects.sport.chapters=[row,...(r.subjects.sport.chapters||[]).filter(x=>x.id!==row.id)];
fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');
