import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'data/Civication/mailFamilies/historie/knowledge/historie_forskning_og_akademia_knowledge.json');
if (!fs.existsSync(target)) throw new Error('Knowledge catalog must be materialized before boundary correction.');

const catalog = JSON.parse(fs.readFileSync(target, 'utf8'));
const mails = catalog?.families?.flatMap((family) => family.mails || []) || [];
if (mails.length !== 1) throw new Error(`Expected exactly one research knowledge mail, found ${mails.length}.`);

const mail = mails[0];
const boundary = ' History Go kan ikke autentisere kilder, avgjøre historiske funn, gi etikkgodkjenning, gi ansettelse eller sikre publisering; qualification_required gjelder fortsatt.';
if (!String(mail.summary || '').includes('avgjøre historiske funn')) mail.summary = `${mail.summary}${boundary}`;

fs.writeFileSync(target, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Clarified research knowledge boundary: no source authentication, historical finding, ethics approval, hiring or publication authority.');
