#!/usr/bin/env node
const fs=require('fs');const cp=require('child_process');
const html=fs.readFileSync('Civication.html','utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
let missing=[];for(const s of scripts){if(!fs.existsSync(s)) missing.push(s);} 
if(missing.length){console.error('Missing script files:\n'+missing.join('\n'));process.exit(1);} 
for(const s of scripts){try{cp.execFileSync('node',['--check',s],{stdio:'pipe'});}catch(e){console.error('Syntax error in',s);console.error(String(e.stderr||e.message));process.exit(1);}}
console.log(`Verified ${scripts.length} scripts exist and pass node --check.`);
